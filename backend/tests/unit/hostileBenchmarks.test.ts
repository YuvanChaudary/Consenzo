import { constraintEngine } from '../../src/engine/constraintEngine';
import { scoringEngine } from '../../src/engine/scoringEngine';
import { fairnessEngine, CandidateData } from '../../src/engine/fairnessEngine';
import { catalogService } from '../../src/services/catalogService';
import { SmartTvProduct } from '@shared/types/catalog';
import { ParticipantPreferenceProfile } from '@shared/types/preferences';

describe('Deterministic Engine Hostile Benchmark Fixtures (Tests A - H)', () => {
  const catalog = catalogService.getAll();

  test('Catalog Integrity: contains at least 35 curated Smart TVs', () => {
    expect(catalog.length).toBeGreaterThanOrEqual(35);
  });

  // Test A: Unanimous Budget & Brand Agreement
  test('Test A: Unanimous agreement on Samsung under budget', () => {
    const profiles: ParticipantPreferenceProfile[] = [
      {
        participantId: 'dad',
        groupId: 'g1',
        constraints: [
          { attribute: 'priceInr', operator: 'LTE', value: 50000, type: 'HARD_CONSTRAINT' },
          { attribute: 'brand', operator: 'EQ', value: 'Samsung', type: 'PREFERENCE', weight: 1.0 },
        ],
        summaryMarkdown: '',
        confirmedByParticipant: true,
      },
      {
        participantId: 'mom',
        groupId: 'g1',
        constraints: [
          { attribute: 'priceInr', operator: 'LTE', value: 50000, type: 'HARD_CONSTRAINT' },
          { attribute: 'brand', operator: 'EQ', value: 'Samsung', type: 'PREFERENCE', weight: 1.0 },
        ],
        summaryMarkdown: '',
        confirmedByParticipant: true,
      },
    ];

    const { feasibleSet } = constraintEngine.gateCatalog(catalog, profiles);
    expect(feasibleSet.length).toBeGreaterThan(0);

    const candidates: CandidateData[] = feasibleSet.map(product => ({
      product,
      utilities: profiles.map(p => scoringEngine.computeIndividualUtility(product, p).totalUtility),
    }));

    const rankings = fairnessEngine.rankCandidates(candidates);
    const top = rankings.BEST_CONSENSUS[0];
    expect(top.product.brand).toBe('Samsung');
    expect(top.product.priceInr).toBeLessThanOrEqual(50000);
  });

  // Test B: Budget Ceiling Conflict (Dad limit <= 50000 gates out > 50000)
  test('Test B: Hard budget ceiling strictly eliminates expensive products', () => {
    const profiles: ParticipantPreferenceProfile[] = [
      {
        participantId: 'dad',
        groupId: 'g1',
        constraints: [
          { attribute: 'priceInr', operator: 'LTE', value: 50000, type: 'HARD_CONSTRAINT' },
        ],
        summaryMarkdown: '',
        confirmedByParticipant: true,
      },
    ];

    const { feasibleSet, gatedOut } = constraintEngine.gateCatalog(catalog, profiles);
    feasibleSet.forEach(p => {
      expect(p.priceInr).toBeLessThanOrEqual(50000);
    });

    const expensiveProducts = catalog.filter(p => p.priceInr > 50000);
    expensiveProducts.forEach(p => {
      expect(gatedOut.has(p.asin)).toBe(true);
    });
  });

  // Test C: Brand vs Gaming Performance Conflict
  test('Test C: Group consensus rewards balanced compromise over localized preference', () => {
    // Family setup: Dad (budget <= 50k), Mom (Samsung), Son (120Hz), Daughter (Silver bezel)
    const tvSamsung60Hz: SmartTvProduct = {
      asin: 'B09W1189X1',
      modelName: 'Samsung Crystal 55" 4K',
      brand: 'Samsung',
      priceInr: 48000,
      screenSizeInches: 55,
      panelType: 'LED',
      refreshRateHz: 60,
      resolution: '4K',
      hasHdmi21: false,
      bezelColor: 'Black',
      widthCm: 123,
      heightCm: 71,
      depthCm: 5.9,
      warrantyYears: 2,
      energyRating: '3 Star',
      os: 'Tizen',
    };

    const tvLg120Hz: SmartTvProduct = {
      asin: 'B09X1K87Z2',
      modelName: 'LG NanoCell 55" 4K 120Hz',
      brand: 'LG',
      priceInr: 49000,
      screenSizeInches: 55,
      panelType: 'QLED',
      refreshRateHz: 120,
      resolution: '4K',
      hasHdmi21: true,
      bezelColor: 'Silver',
      widthCm: 123.3,
      heightCm: 71.6,
      depthCm: 4.4,
      warrantyYears: 2,
      energyRating: '4 Star',
      os: 'webOS',
    };

    const utilsSamsung = [9.5, 10.0, 6.8, 8.0];
    const utilsLg = [9.2, 6.5, 9.8, 9.6];

    const scoreSamsung = fairnessEngine.calculateConsensusScore(utilsSamsung);
    const scoreLg = fairnessEngine.calculateConsensusScore(utilsLg);

    expect(scoreLg.score).toBeGreaterThan(scoreSamsung.score);
    expect(Number(scoreLg.score.toFixed(2))).toBe(8.11);
  });

  // Test D: Tyranny of the Majority (Floor Penalty eliminates victimizing choice)
  test('Test D: Tyranny of Majority prevented by Tier 1 Maximin floor penalty', () => {
    // 3 members thrilled (9.8), 1 member miserable (2.0)
    // Mean is 7.85
    const majorityTyrannyUtils = [9.8, 9.8, 9.8, 2.0];
    // Everyone moderately happy (7.725)
    const balancedConsensusUtils = [7.8, 7.8, 7.8, 7.5];

    const tyrannyScore = fairnessEngine.calculateConsensusScore(majorityTyrannyUtils);
    const consensusScore = fairnessEngine.calculateConsensusScore(balancedConsensusUtils);

    // Naive mean would choose tyrannyScore (7.85 > 7.725)
    expect(tyrannyScore.mean).toBeGreaterThan(consensusScore.mean);
    // Consenzo Hybrid operator penalizes min < 4.0 severely:
    expect(consensusScore.score).toBeGreaterThan(tyrannyScore.score);
  });

  // Test E: Zero Feasible Products in Catalog
  test('Test E: Impossible constraints return empty feasible set safely without crashing', () => {
    const impossibleProfiles: ParticipantPreferenceProfile[] = [
      {
        participantId: 'impossible_user',
        groupId: 'g1',
        constraints: [
          { attribute: 'priceInr', operator: 'LTE', value: 10000, type: 'HARD_CONSTRAINT' },
          { attribute: 'refreshRateHz', operator: 'GTE', value: 240, type: 'DEALBREAKER' },
        ],
        summaryMarkdown: '',
        confirmedByParticipant: true,
      },
    ];

    const { feasibleSet, gatedOut } = constraintEngine.gateCatalog(catalog, impossibleProfiles);
    expect(feasibleSet.length).toBe(0);
    expect(gatedOut.size).toBe(catalog.length);
  });

  // Test F: Dealbreaker Gating Test
  test('Test F: Dealbreaker violation prunes product regardless of other high scores', () => {
    const dealbreakerProfiles: ParticipantPreferenceProfile[] = [
      {
        participantId: 'veto_user',
        groupId: 'g1',
        constraints: [
          { attribute: 'brand', operator: 'NEQ', value: 'Samsung', type: 'DEALBREAKER' },
        ],
        summaryMarkdown: '',
        confirmedByParticipant: true,
      },
    ];

    const { feasibleSet } = constraintEngine.gateCatalog(catalog, dealbreakerProfiles);
    const samsungInFeasible = feasibleSet.filter(p => p.brand === 'Samsung');
    expect(samsungInFeasible.length).toBe(0);
  });

  // Test G: Missing Product Attribute Test
  test('Test G: Missing attribute handled conservatively according to ADR-018', () => {
    const incompleteProduct: any = {
      asin: 'B_TEST_MISSING',
      modelName: 'Missing Spec TV',
      brand: 'LG',
      priceInr: 40000,
      // refreshRateHz missing
    };

    const hardConstraint = {
      attribute: 'refreshRateHz',
      operator: 'GTE' as const,
      value: 120,
      type: 'HARD_CONSTRAINT' as const,
    };
    const softPreference = {
      attribute: 'refreshRateHz',
      operator: 'GTE' as const,
      value: 120,
      type: 'PREFERENCE' as const,
    };

    // Fails hard constraint
    expect(constraintEngine.evaluateConstraint(incompleteProduct, hardConstraint)).toBe(false);
    // Soft preference ignores missing attribute
    expect(constraintEngine.evaluateConstraint(incompleteProduct, softPreference)).toBe(true);
  });

  // Test H: Controlled Relaxation Protocol
  test('Test H: Controlled relaxation identifies near-matches failing only 1 constraint', () => {
    const strictProfiles: ParticipantPreferenceProfile[] = [
      {
        participantId: 'tight_budget',
        groupId: 'g1',
        constraints: [
          { attribute: 'priceInr', operator: 'LTE', value: 20000, type: 'HARD_CONSTRAINT' },
        ],
        summaryMarkdown: '',
        confirmedByParticipant: true,
      },
    ];

    const { relaxationSet } = constraintEngine.computeRelaxationBranches(catalog, strictProfiles);
    expect(relaxationSet.length).toBeGreaterThan(0);
  });
});
