import { scoringEngine } from '../../src/engine/scoringEngine';
import { SmartTvProduct } from '@shared/types/catalog';
import { ParticipantPreferenceProfile, ConstraintOperator } from '@shared/types/preferences';

describe('ScoringEngine', () => {
  const mockProduct: SmartTvProduct = {
    asin: 'B001',
    modelName: 'Crystal UHD',
    brand: 'Samsung',
    priceInr: 48000,
    screenSizeInches: 55,
    panelType: 'LED',
    resolution: '4K',
    refreshRateHz: 60,
    hasHdmi21: false,
    bezelColor: 'Black',
    widthCm: 110,
    heightCm: 65,
    depthCm: 3,
    energyRating: '3 Star',
    os: 'Tizen',
    warrantyYears: 1,
  };

  const mockProfile: ParticipantPreferenceProfile = {
    participantId: 'u1',
    groupId: 'grp_123',
    summaryMarkdown: 'Test summary',
    constraints: [
      { attribute: 'priceInr', operator: 'LTE', value: 50000, type: 'HARD_CONSTRAINT', weight: 1.0 },
      { attribute: 'brand', operator: 'EQ', value: 'Samsung', type: 'PREFERENCE', weight: 0.8 },
    ],
    confirmedByParticipant: true,
  };

  test('computeIndividualUtility returns valid score in [0, 10]', () => {
    const score = scoringEngine.computeIndividualUtility(mockProduct, mockProfile);
    expect(score.totalUtility).toBeGreaterThanOrEqual(0);
    expect(score.totalUtility).toBeLessThanOrEqual(10);
  });

  test('Utility increases with brand match', () => {
    const profileSamy: ParticipantPreferenceProfile = { ...mockProfile, constraints: [{ attribute: 'brand', operator: 'EQ' as ConstraintOperator, value: 'Samsung', type: 'PREFERENCE', weight: 1.0 }] };
    const profileSony: ParticipantPreferenceProfile = { ...mockProfile, constraints: [{ attribute: 'brand', operator: 'EQ' as ConstraintOperator, value: 'Sony', type: 'PREFERENCE', weight: 1.0 }] };

    const scoreSamy = scoringEngine.computeIndividualUtility(mockProduct, profileSamy);
    const scoreSony = scoringEngine.computeIndividualUtility(mockProduct, profileSony);

    expect(scoreSamy.totalUtility).toBeGreaterThan(scoreSony.totalUtility);
  });
});
