import { constraintEngine } from '../../src/engine/constraintEngine';
import { SmartTvProduct } from '@shared/types/catalog';
import { CanonicalConstraint, ParticipantPreferenceProfile } from '@shared/types/preferences';

describe('Constraint Engine', () => {
  const mockProduct: SmartTvProduct = {
    asin: 'B012345678',
    modelName: 'Test TV',
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
  };

  test('evaluateConstraint: should handle LTE correctly', () => {
    const constraint: CanonicalConstraint = {
      attribute: 'priceInr',
      operator: 'LTE',
      value: 50000,
      type: 'HARD_CONSTRAINT',
    };
    expect(constraintEngine.evaluateConstraint(mockProduct, constraint)).toBe(true);

    const failConstraint: CanonicalConstraint = {
      attribute: 'priceInr',
      operator: 'LTE',
      value: 40000,
      type: 'HARD_CONSTRAINT',
    };
    expect(constraintEngine.evaluateConstraint(mockProduct, failConstraint)).toBe(false);
  });

  test('evaluateConstraint: should handle EQ correctly', () => {
    const constraint: CanonicalConstraint = {
      attribute: 'brand',
      operator: 'EQ',
      value: 'Samsung',
      type: 'HARD_CONSTRAINT',
    };
    expect(constraintEngine.evaluateConstraint(mockProduct, constraint)).toBe(true);

    const failConstraint: CanonicalConstraint = {
      attribute: 'brand',
      operator: 'EQ',
      value: 'Sony',
      type: 'HARD_CONSTRAINT',
    };
    expect(constraintEngine.evaluateConstraint(mockProduct, failConstraint)).toBe(false);
  });

  test('evaluateConstraint: should handle DEALBREAKER missing attribute as failure', () => {
    const productWithoutBezel = { ...mockProduct };
    delete (productWithoutBezel as any).bezelColor;

    const constraint: CanonicalConstraint = {
      attribute: 'bezelColor',
      operator: 'EQ',
      value: 'Black',
      type: 'DEALBREAKER',
    };
    expect(constraintEngine.evaluateConstraint(productWithoutBezel as any, constraint)).toBe(false);
  });

  test('gateCatalog: should prune products violating dealbreakers', () => {
    const catalog = [mockProduct];
    const profiles: ParticipantPreferenceProfile[] = [
      {
        participantId: 'p1',
        groupId: 'g1',
        constraints: [
          { attribute: 'brand', operator: 'NEQ', value: 'Samsung', type: 'DEALBREAKER' },
        ],
        summaryMarkdown: '',
        confirmedByParticipant: true,
      },
    ];

    const { feasibleSet } = constraintEngine.gateCatalog(catalog, profiles);
    expect(feasibleSet.length).toBe(0);
  });

  test('gateCatalog: should prune products violating hard constraints', () => {
    const catalog = [mockProduct];
    const profiles: ParticipantPreferenceProfile[] = [
      {
        participantId: 'p1',
        groupId: 'g1',
        constraints: [
          { attribute: 'priceInr', operator: 'LTE', value: 40000, type: 'HARD_CONSTRAINT' },
        ],
        summaryMarkdown: '',
        confirmedByParticipant: true,
      },
    ];

    const { feasibleSet } = constraintEngine.gateCatalog(catalog, profiles);
    expect(feasibleSet.length).toBe(0);
  });

  test('computeRelaxationBranches: should identify near-matches', () => {
    const catalog = [mockProduct];
    const profiles: ParticipantPreferenceProfile[] = [
      {
        participantId: 'p1',
        groupId: 'g1',
        constraints: [
          { attribute: 'priceInr', operator: 'LTE', value: 40000, type: 'HARD_CONSTRAINT' },
        ],
        summaryMarkdown: '',
        confirmedByParticipant: true,
      },
    ];

    const { relaxationSet } = constraintEngine.computeRelaxationBranches(catalog, profiles);
    expect(relaxationSet.length).toBe(1);
    expect(relaxationSet[0].asin).toBe(mockProduct.asin);
  });
});
