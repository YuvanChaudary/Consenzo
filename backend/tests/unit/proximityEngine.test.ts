import { proximityEngine } from '../../src/engine/proximityEngine';
import { fitStats } from '../../src/engine/fitStats';
import { constraintEngine } from '../../src/engine/constraintEngine';
import { catalogService } from '../../src/services/catalogService';
import { ParticipantPreferenceProfile, CanonicalConstraint } from '@shared/types/preferences';

/**
 * Nearest-Feasible Proximity Engine — statistical verification suite.
 *
 * Validates that when no product satisfies every stated constraint, the
 * recommendation system returns the statistically nearest real products
 * (with gap audits and market census) instead of dead-ending with
 * "no products exist" or returning arbitrary items.
 */

const catalog = catalogService.getAll('smart_tvs');

const mkProfile = (constraints: CanonicalConstraint[]): ParticipantPreferenceProfile => ({
  participantId: 'usr_test',
  groupId: 'grp_test',
  constraints,
  summaryMarkdown: '',
  confirmedByParticipant: true,
});

describe('FitStats — catalog distribution statistics', () => {
  test('computes robust median/sigma for priceInr without heavy tail distortion', () => {
    const stats = fitStats.getNumericStats(catalog, 'priceInr');
    expect(stats).not.toBeNull();
    expect(stats!.n).toBe(catalog.length);
    // Median must be robust against the premium tail (catalog max ~1.15L)
    expect(stats!.median).toBeGreaterThan(20000);
    expect(stats!.median).toBeLessThan(50000);
    expect(stats!.sigma).toBeGreaterThan(0);
    expect(['MAD', 'IQR', 'FLOOR']).toContain(stats!.estimator);
  });

  test('degenerate discrete attribute (refreshRateHz) falls back to IQR/FLOOR estimator', () => {
    const stats = fitStats.getNumericStats(catalog, 'refreshRateHz');
    expect(stats).not.toBeNull();
    // 60/120 Hz tiers -> MAD may be 0, so estimator must degrade gracefully
    if (stats!.mad === 0) {
      expect(['IQR', 'FLOOR']).toContain(stats!.estimator);
    }
    expect(stats!.sigma).toBeGreaterThan(0);
  });

  test('availability census reports only values that exist in market', () => {
    const av = fitStats.getAvailability(catalog, 'refreshRateHz');
    expect(av).not.toBeNull();
    expect(av!.availableValues).toContain(60);
    expect(av!.availableValues).not.toContain(144);
  });

  test('categorical stats build mean-price market segments for brands', () => {
    const stats = fitStats.getCategoricalStats(catalog, 'brand');
    expect(stats).not.toBeNull();
    expect(Object.keys(stats!.meanPriceByValue).length).toBeGreaterThan(2);
    // Premium brand should have higher mean price than a value brand
    const sony = stats!.meanPriceByValue['Sony'];
    const vw = stats!.meanPriceByValue['VW'];
    if (sony !== undefined && vw !== undefined) {
      expect(sony).toBeGreaterThan(vw);
    }
  });
});

describe('ProximityEngine — graduated constraint proximity', () => {
  test('satisfying constraint returns 1.0', () => {
    const c: CanonicalConstraint = { attribute: 'priceInr', operator: 'LTE', value: 50000, type: 'HARD_CONSTRAINT' };
    const product = { priceInr: 40000 };
    expect(proximityEngine.constraintProximity(catalog, c, 40000)).toBe(1.0);
  });

  test('budget overage proximity decays monotonically with distance', () => {
    const c: CanonicalConstraint = { attribute: 'priceInr', operator: 'LTE', value: 30000, type: 'HARD_CONSTRAINT' };
    const p1 = proximityEngine.constraintProximity(catalog, c, 35000); // +5k
    const p2 = proximityEngine.constraintProximity(catalog, c, 45000); // +15k
    const p3 = proximityEngine.constraintProximity(catalog, c, 90000); // +60k
    expect(p1).toBeGreaterThan(p2);
    expect(p2).toBeGreaterThan(p3);
    expect(p1).toBeLessThan(1.0);
    expect(p3).toBeGreaterThan(0); // never zero — nearest-match philosophy
  });

  test('tiered attribute (refresh rate) uses tier distance, not raw z-score', () => {
    const c: CanonicalConstraint = { attribute: 'refreshRateHz', operator: 'GTE', value: 120, type: 'PREFERENCE' };
    // 60Hz is exactly one market tier below 120Hz -> standardized step 0.70
    expect(proximityEngine.constraintProximity(catalog, c, 60)).toBeCloseTo(0.7, 2);
  });

  test('OLED vs LED is NOT substring-adjacent (panel ladder applies)', () => {
    const c: CanonicalConstraint = { attribute: 'panelType', operator: 'EQ', value: 'OLED', type: 'HARD_CONSTRAINT' };
    const led = proximityEngine.constraintProximity(catalog, c, 'LED');
    const qled = proximityEngine.constraintProximity(catalog, c, 'QLED');
    const oled = proximityEngine.constraintProximity(catalog, c, 'OLED');
    expect(oled).toBe(1.0);
    // Ladder: LED(0) < QLED(1) < MiniLED(2) < OLED(3): QLED strictly nearer than LED
    expect(qled).toBeGreaterThan(led);
    expect(led).toBeLessThan(0.85); // no substring bonus leak
  });

  test('unknown brand charges flat market gap equally, anchoring to most common brand', () => {
    const c: CanonicalConstraint = { attribute: 'brand', operator: 'EQ', value: 'Pixelloni', type: 'HARD_CONSTRAINT' };
    const p1 = proximityEngine.constraintProximity(catalog, c, 'Samsung');
    const p2 = proximityEngine.constraintProximity(catalog, c, 'LG');
    expect(p1).toBe(p2); // availability gap, not product quality
    expect(p1).toBeLessThan(1.0);

    const market = proximityEngine.nearestMarketValue(catalog, c);
    expect(market).not.toBeNull();
    // Anchor is the most prevalent brand in market (not a MAX_SAFE_INTEGER artifact)
    expect(market!.gap).toBeNull();
  });

  test('boolean mismatch gives bounded partial credit', () => {
    const c: CanonicalConstraint = { attribute: 'hasHdmi21', operator: 'EQ', value: true, type: 'PREFERENCE' };
    expect(proximityEngine.constraintProximity(catalog, c, true)).toBe(1.0);
    expect(proximityEngine.constraintProximity(catalog, c, false)).toBe(0.3);
  });

  test('missing attribute documented at 0.35, never silent zero', () => {
    const c: CanonicalConstraint = { attribute: 'someUnpublishedSpec', operator: 'EQ', value: 42, type: 'PREFERENCE' };
    expect(proximityEngine.constraintProximity(catalog, c, undefined)).toBe(0.35);
  });
});

describe('ProximityEngine — nearest-match ranking (zero-match adversarial scenarios)', () => {
  test('Scenario A: 144Hz under ₹20,000 — impossible premium request still ranks real products', () => {
    const profiles = [
      mkProfile([
        { attribute: 'priceInr', operator: 'LTE', value: 20000, type: 'HARD_CONSTRAINT', weight: 1.0 },
        { attribute: 'refreshRateHz', operator: 'GTE', value: 144, type: 'PREFERENCE', weight: 0.95 },
      ]),
    ];
    const { feasibleSet } = constraintEngine.gateCatalog(catalog, profiles);
    const ranking = proximityEngine.rankNearestMatches(catalog, profiles);

    // Some products satisfy budget but none reach 144Hz refresh at 20k
    expect(ranking.ranked.length).toBe(catalog.length);
    expect(ranking.ranked[0].product).toBeDefined();
    // Products with hard violations must rank below feasible ones
    const withHardViolation = ranking.ranked.filter(r => r.hardViolations.length > 0);
    if (withHardViolation.length > 0) {
      const firstViolationRank = ranking.ranked.findIndex(r => r.hardViolations.length > 0);
      expect(firstViolationRank).toBeGreaterThanOrEqual(ranking.ranked.filter(r => r.exactFeasible).length);
    }
    // Requested-vs-market audit must reveal the 144Hz dead end
    const refreshRow = ranking.requestedVsMarket.find(r => r.attribute === 'refreshRateHz');
    expect(refreshRow).toBeDefined();
    expect(refreshRow!.nearestAvailableValue).toBe(120); // best on market
  });

  test('Scenario B: nonexistent brand returns market-nearest products, never empty', () => {
    const profiles = [
      mkProfile([
        { attribute: 'brand', operator: 'EQ', value: 'Pixelloni', type: 'HARD_CONSTRAINT', weight: 1.0 },
        { attribute: 'priceInr', operator: 'LTE', value: 40000, type: 'HARD_CONSTRAINT', weight: 1.0 },
      ]),
    ];
    const ranking = proximityEngine.rankNearestMatches(catalog, profiles);

    expect(ranking.mode).toBe('NEAREST');
    expect(ranking.ranked.length).toBe(catalog.length);
    // All top matches must respect the satisfiable budget constraint
    ranking.ranked.slice(0, 5).forEach(m => {
      expect(m.product.priceInr).toBeLessThanOrEqual(40000 + 1);
    });
    // Brand gap must be reported as market-availability, not product-specific
    const brandRow = ranking.requestedVsMarket.find(r => r.attribute === 'brand');
    expect(brandRow!.exactMatchCount).toBe(0);
    expect(brandRow!.nearestAvailableValue).toBeDefined();
  });

  test('Scenario C: 85-inch OLED under ₹30,000 — multi-attribute compromise picks panel-adjacent budget TVs', () => {
    const profiles = [
      mkProfile([
        { attribute: 'screenSizeInches', operator: 'GTE', value: 85, type: 'PREFERENCE', weight: 0.9 },
        { attribute: 'panelType', operator: 'EQ', value: 'OLED', type: 'HARD_CONSTRAINT', weight: 1.0 },
        { attribute: 'priceInr', operator: 'LTE', value: 30000, type: 'HARD_CONSTRAINT', weight: 1.0 },
      ]),
    ];
    const { feasibleSet } = constraintEngine.gateCatalog(catalog, profiles);
    expect(feasibleSet.length).toBe(0); // genuinely infeasible

    const ranking = proximityEngine.rankNearestMatches(catalog, profiles);
    expect(ranking.mode).toBe('NEAREST');
    expect(ranking.ranked.length).toBeGreaterThan(0);

    // The winner must be panel-adjacent (QLED/MiniLED over plain LED)
    const top = ranking.ranked[0];
    expect(['QLED', 'MiniLED', 'OLED']).toContain(top.product.panelType);
    // Hard-violating products must still honor the budget boundary as best effort:
    // top 5 must include only products within or near the ₹30k ceiling
    ranking.ranked.slice(0, 5).forEach(m => {
      expect(m.product.priceInr).toBeLessThan(45000);
    });
  });

  test('Scenario D: satisfiable request keeps EXACT mode with perfect scores', () => {
    const profiles = [
      mkProfile([
        { attribute: 'priceInr', operator: 'LTE', value: 50000, type: 'HARD_CONSTRAINT', weight: 1.0 },
        { attribute: 'brand', operator: 'EQ', value: 'Samsung', type: 'PREFERENCE', weight: 0.9 },
      ]),
    ];
    const ranking = proximityEngine.rankNearestMatches(catalog, profiles);
    expect(ranking.mode).toBe('EXACT');
    expect(ranking.ranked[0].matchQuality).toBe('EXACT');
    expect(ranking.ranked[0].matchScore).toBe(100);
    expect(ranking.ranked[0].hardViolations).toHaveLength(0);
  });

  test('Scenario E: multi-participant conflicting group aggregates proximities fairly', () => {
    const profiles = [
      mkProfile([
        { attribute: 'priceInr', operator: 'LTE', value: 30000, type: 'HARD_CONSTRAINT', weight: 1.0 },
      ]),
      mkProfile([
        { attribute: 'refreshRateHz', operator: 'GTE', value: 120, type: 'PREFERENCE', weight: 0.95 },
      ]),
      mkProfile([
        { attribute: 'brand', operator: 'EQ', value: 'Sony', type: 'PREFERENCE', weight: 0.8 },
      ]),
    ];
    const { feasibleSet } = constraintEngine.gateCatalog(catalog, profiles);

    if (feasibleSet.length === 0) {
      const ranking = proximityEngine.rankNearestMatches(catalog, profiles);
      expect(ranking.ranked.length).toBe(catalog.length);
      // Utilities must be produced for every participant (fairness-ready)
      ranking.ranked.slice(0, 5).forEach(m => {
        expect(m.utilities).toHaveLength(3);
        m.utilities.forEach(u => {
          expect(u).toBeGreaterThanOrEqual(0);
          expect(u).toBeLessThanOrEqual(10);
        });
      });
    } else {
      // If feasible, EXACT mode must be preserved
      const ranking = proximityEngine.rankNearestMatches(catalog, profiles);
      expect(ranking.mode).toBe('EXACT');
    }
  });
});

describe('ProximityEngine — statistical & mathematical guarantees', () => {
  test('deterministic reproducibility: 100 identical runs produce identical rankings', () => {
    const profiles = [
      mkProfile([
        { attribute: 'priceInr', operator: 'LTE', value: 35000, type: 'HARD_CONSTRAINT', weight: 1.0 },
        { attribute: 'panelType', operator: 'EQ', value: 'OLED', type: 'PREFERENCE', weight: 0.8 },
      ]),
    ];
    const first = proximityEngine.rankNearestMatches(catalog, profiles);
    for (let i = 0; i < 100; i++) {
      const again = proximityEngine.rankNearestMatches(catalog, profiles);
      expect(again.ranked.map(r => r.productId)).toEqual(first.ranked.map(r => r.productId));
      expect(again.ranked.map(r => r.matchScore)).toEqual(first.ranked.map(r => r.matchScore));
    }
  });

  test('utilities stay in [0, 10] for every product in every scenario', () => {
    const scenarioSets: CanonicalConstraint[][] = [
      [{ attribute: 'priceInr', operator: 'LTE', value: 15000, type: 'HARD_CONSTRAINT' }],
      [{ attribute: 'screenSizeInches', operator: 'GTE', value: 100, type: 'PREFERENCE', weight: 0.9 }],
      [{ attribute: 'brand', operator: 'EQ', value: 'Nonexistent', type: 'DEALBREAKER' }],
    ];
    for (const constraints of scenarioSets) {
      const ranking = proximityEngine.rankNearestMatches(catalog, [mkProfile(constraints)]);
      ranking.ranked.forEach(m => {
        m.utilities.forEach(u => {
          expect(u).toBeGreaterThanOrEqual(0);
          expect(u).toBeLessThanOrEqual(10);
        });
      });
    }
  });

  test('matchScore is monotonically consistent with hard violations', () => {
    const profiles = [
      mkProfile([
        { attribute: 'priceInr', operator: 'LTE', value: 25000, type: 'HARD_CONSTRAINT', weight: 1.0 },
      ]),
    ];
    const ranking = proximityEngine.rankNearestMatches(catalog, profiles);
    const feasibleScores = ranking.ranked.filter(r => r.exactFeasible).map(r => r.matchScore);
    const violatedScores = ranking.ranked.filter(r => !r.exactFeasible).map(r => r.matchScore);
    if (feasibleScores.length > 0 && violatedScores.length > 0) {
      expect(Math.min(...feasibleScores)).toBeGreaterThanOrEqual(Math.max(...violatedScores));
    }
  });

  test('summary message never dead-ends and always names the closest product', () => {
    const profiles = [
      mkProfile([
        { attribute: 'refreshRateHz', operator: 'GTE', value: 240, type: 'HARD_CONSTRAINT', weight: 1.0 },
      ]),
    ];
    const ranking = proximityEngine.rankNearestMatches(catalog, profiles);
    expect(ranking.summaryMessage).toContain('closest');
    expect(ranking.summaryMessage.toLowerCase()).not.toContain('no products');
  });

  test('availability census exposes market values for every requested attribute', () => {
    const profiles = [
      mkProfile([
        { attribute: 'priceInr', operator: 'LTE', value: 20000, type: 'HARD_CONSTRAINT' },
        { attribute: 'refreshRateHz', operator: 'GTE', value: 144, type: 'PREFERENCE' },
        { attribute: 'panelType', operator: 'EQ', value: 'OLED', type: 'PREFERENCE' },
      ]),
    ];
    const ranking = proximityEngine.rankNearestMatches(catalog, profiles);
    const censusAttrs = ranking.census.map(c => c.attribute);
    expect(censusAttrs).toContain('priceInr');
    expect(censusAttrs).toContain('refreshRateHz');
    expect(censusAttrs).toContain('panelType');
    const refresh = ranking.census.find(c => c.attribute === 'refreshRateHz')!;
    expect(refresh.availableValues).toEqual([60, 120]);
  });
});
