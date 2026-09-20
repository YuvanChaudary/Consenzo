import { scoringEngine } from '../../src/engine/scoringEngine';
import { constraintEngine } from '../../src/engine/constraintEngine';
import { fairnessEngine } from '../../src/engine/fairnessEngine';
import { subgroupEngine } from '../../src/engine/subgroupEngine';
import { explainabilityEngine } from '../../src/engine/explainabilityEngine';
import { catalogService } from '../../src/services/catalogService';
import { ParticipantPreferenceProfile } from '@shared/types/preferences';
import { NexusProduct } from '@shared/types/catalog';

describe('Consensus Engine v2 Suite', () => {
  const sampleHeadphone: NexusProduct = {
    id: 'HDP-TEST-1',
    slug: 'test-anc-headphone',
    name: 'Pro Wireless ANC Headphone',
    brand: 'AudioTech',
    category: 'headphones',
    priceInr: 25000,
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e'],
    rating: 4.8,
    inStock: true,
    specs: [
      { key: 'hasAnc', label: 'Active Noise Cancellation', value: true },
      { key: 'batteryHours', label: 'Battery Life', value: 30, unit: 'hours' },
      { key: 'priceInr', label: 'Price', value: 25000, unit: 'INR' },
      { key: 'formFactor', label: 'Form Factor', value: 'Over-Ear' },
    ],
  };

  const sampleLaptop: NexusProduct = {
    id: 'LPT-TEST-1',
    slug: 'test-dev-laptop',
    name: 'DevBook Pro 16',
    brand: 'TechCorp',
    category: 'laptops',
    priceInr: 95000,
    images: ['https://images.unsplash.com/photo-1496181133206-80ce9b88a853'],
    rating: 4.7,
    inStock: true,
    specs: [
      { key: 'ramGb', label: 'RAM', value: 32, unit: 'GB' },
      { key: 'storageGb', label: 'Storage', value: 1024, unit: 'GB' },
      { key: 'batteryHours', label: 'Battery Life', value: 14, unit: 'hours' },
      { key: 'priceInr', label: 'Price', value: 95000, unit: 'INR' },
    ],
  };

  test('1. ScoringEngine computes accurate individual utility across dynamic headphone specs', () => {
    const profile: ParticipantPreferenceProfile = {
      participantId: 'usr_p1',
      groupId: 'grp_test',
      constraints: [
        { attribute: 'priceInr', operator: 'LTE', value: 30000, type: 'HARD_CONSTRAINT', weight: 1.0 },
        { attribute: 'hasAnc', operator: 'EQ', value: true, type: 'DEALBREAKER', weight: 1.0 },
        { attribute: 'batteryHours', operator: 'GTE', value: 20, type: 'PREFERENCE', weight: 0.8 },
      ],
      summaryMarkdown: 'Budget under 30k with ANC and 20h+ battery',
      confirmedByParticipant: true,
    };

    const score = scoringEngine.computeIndividualUtility(sampleHeadphone as any, profile);
    expect(score.productId).toBe('HDP-TEST-1');
    expect(score.totalUtility).toBeGreaterThanOrEqual(7.5);
    expect(score.breakdown.length).toBe(3);
  });

  test('2. ConstraintEngine gates out products failing hard constraints or dealbreakers', () => {
    const profileHighBudget: ParticipantPreferenceProfile = {
      participantId: 'usr_p2',
      groupId: 'grp_test',
      constraints: [
        { attribute: 'priceInr', operator: 'LTE', value: 80000, type: 'DEALBREAKER' },
      ],
      summaryMarkdown: 'Max 80k strict',
      confirmedByParticipant: true,
    };

    const isFeasible = constraintEngine.evaluateConstraint(
      sampleLaptop as any,
      profileHighBudget.constraints[0]
    );
    expect(isFeasible).toBe(false); // 95,000 > 80,000 dealbreaker
  });

  test('3. FairnessEngine calculates hybrid Nash consensus with variance penalty', () => {
    // Balanced utilities across 3 users: [8.5, 8.2, 8.4]
    const balancedMetrics = fairnessEngine.calculateConsensusScore([8.5, 8.2, 8.4]);

    // Polarized utilities across 3 users: [9.9, 9.8, 3.2]
    const polarizedMetrics = fairnessEngine.calculateConsensusScore([9.9, 9.8, 3.2]);

    expect(balancedMetrics.score).toBeGreaterThan(polarizedMetrics.score);
    expect(polarizedMetrics.stdDev).toBeGreaterThan(balancedMetrics.stdDev);
  });

  test('4. ExplainabilityEngine generates structured, deterministic trade-off cards', () => {
    const profiles: ParticipantPreferenceProfile[] = [
      {
        participantId: 'usr_p1',
        groupId: 'grp_test',
        constraints: [
          { attribute: 'priceInr', operator: 'LTE', value: 30000, type: 'HARD_CONSTRAINT' },
          { attribute: 'hasAnc', operator: 'EQ', value: true, type: 'PREFERENCE' },
        ],
        summaryMarkdown: '',
        confirmedByParticipant: true,
      },
      {
        participantId: 'usr_p2',
        groupId: 'grp_test',
        constraints: [
          { attribute: 'priceInr', operator: 'LTE', value: 20000, type: 'HARD_CONSTRAINT' },
        ],
        summaryMarkdown: '',
        confirmedByParticipant: true,
      },
    ];

    const card = explainabilityEngine.generateTradeOffCard(
      sampleHeadphone,
      profiles,
      { usr_p1: 9.0, usr_p2: 5.5 }
    );

    expect(card.productId).toBe('HDP-TEST-1');
    expect(card.perParticipant.length).toBe(2);
    expect(card.perParticipant[0].satisfactionLevel).toBe('FULLY_MET');
    expect(card.perParticipant[1].compromisedConstraints.length).toBeGreaterThan(0);
  });

  test('5. SubgroupEngine handles partial consensus evaluation cleanly', () => {
    const profiles: ParticipantPreferenceProfile[] = [
      {
        participantId: 'usr_1',
        groupId: 'grp_split',
        constraints: [{ attribute: 'priceInr', operator: 'LTE', value: 30000, type: 'HARD_CONSTRAINT' }],
        summaryMarkdown: '',
        confirmedByParticipant: true,
      },
      {
        participantId: 'usr_2',
        groupId: 'grp_split',
        constraints: [{ attribute: 'priceInr', operator: 'LTE', value: 30000, type: 'HARD_CONSTRAINT' }],
        summaryMarkdown: '',
        confirmedByParticipant: true,
      },
      {
        participantId: 'usr_3',
        groupId: 'grp_split',
        constraints: [{ attribute: 'priceInr', operator: 'GTE', value: 80000, type: 'HARD_CONSTRAINT' }],
        summaryMarkdown: '',
        confirmedByParticipant: true,
      },
      {
        participantId: 'usr_4',
        groupId: 'grp_split',
        constraints: [{ attribute: 'priceInr', operator: 'GTE', value: 80000, type: 'HARD_CONSTRAINT' }],
        summaryMarkdown: '',
        confirmedByParticipant: true,
      },
    ];

    const catalog = [sampleHeadphone, sampleLaptop];
    const result = subgroupEngine.evaluateSubgroups(catalog, profiles);
    expect(result.recommendation).toBeDefined();
    expect(Array.isArray(result.agreementGroups)).toBe(true);
  });
});
