import { conflictDetector } from '../../src/engine/conflictDetector';
import { SmartTvProduct } from '@shared/types/catalog';
import { ParticipantPreferenceProfile } from '@shared/types/preferences';

describe('Conflict Detector', () => {
  const mockCatalog: SmartTvProduct[] = [
    {
      asin: 'B01',
      modelName: 'TV 1',
      brand: 'Samsung',
      priceInr: 50000,
      screenSizeInches: 55,
      panelType: 'LED',
      refreshRateHz: 60,
      resolution: '4K',
      hasHdmi21: false,
      bezelColor: 'Black',
      widthCm: 120,
      heightCm: 70,
      depthCm: 5,
      warrantyYears: 1,
      energyRating: 'A',
      os: 'Tizen',
    }
  ];

  test('should detect direct value clashes', () => {
    const profiles: ParticipantPreferenceProfile[] = [
      {
        participantId: 'p1',
        groupId: 'g1',
        constraints: [{ attribute: 'brand', operator: 'EQ', value: 'Samsung', type: 'HARD_CONSTRAINT' }],
        summaryMarkdown: '',
        confirmedByParticipant: true,
      },
      {
        participantId: 'p2',
        groupId: 'g1',
        constraints: [{ attribute: 'brand', operator: 'EQ', value: 'Sony', type: 'HARD_CONSTRAINT' }],
        summaryMarkdown: '',
        confirmedByParticipant: true,
      },
    ];

    const conflicts = conflictDetector.detectConflicts(profiles, mockCatalog);
    expect(conflicts.length).toBe(1);
    expect(conflicts[0].type).toBe('DIRECT_CLASH');
    expect(conflicts[0].severity).toBe('MODERATE');
  });

  test('should detect critical clashes for dealbreakers', () => {
    const profiles: ParticipantPreferenceProfile[] = [
      {
        participantId: 'p1',
        groupId: 'g1',
        constraints: [{ attribute: 'brand', operator: 'EQ', value: 'Samsung', type: 'DEALBREAKER' }],
        summaryMarkdown: '',
        confirmedByParticipant: true,
      },
      {
        participantId: 'p2',
        groupId: 'g1',
        constraints: [{ attribute: 'brand', operator: 'EQ', value: 'Sony', type: 'HARD_CONSTRAINT' }],
        summaryMarkdown: '',
        confirmedByParticipant: true,
      },
    ];

    const conflicts = conflictDetector.detectConflicts(profiles, mockCatalog);
    expect(conflicts[0].severity).toBe('CRITICAL');
  });

  test('should compute tradeoff deltas for budget exceedance', () => {
    const product = mockCatalog[0];
    const profile: ParticipantPreferenceProfile = {
      participantId: 'p1',
      groupId: 'g1',
      constraints: [{ attribute: 'priceInr', operator: 'LTE', value: 40000, type: 'HARD_CONSTRAINT' }],
      summaryMarkdown: '',
      confirmedByParticipant: true,
    };

    const deltas = conflictDetector.computeTradeoffDeltas(product, profile);
    expect(deltas.length).toBe(1);
    expect(deltas[0].deltaPercent).toBe(25); // (50-40)/40 = 25%
    expect(deltas[0].impact).toBe('NEGATIVE');
  });
});
