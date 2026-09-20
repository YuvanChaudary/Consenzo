import { resolveProductAttribute } from '../utils/attributeResolver';
import { fitStats, AttributeAvailability } from './fitStats';
import {
  CanonicalConstraint,
  ParticipantPreferenceProfile,
} from '@shared/types/preferences';

/**
 * ProximityEngine — "Never say a product does not exist".
 *
 * When strict constraint gating produces an empty feasible set, this engine
 * ranks the WHOLE catalog by statistically-grounded parameter proximity to the
 * group's requested values and returns the nearest real products, with a full
 * audit of exactly which parameter moved and by how much.
 *
 * Mathematical model
 * ------------------
 * Numeric attributes:
 *   gap       = distance from the constraint boundary to the actual value
 *               (0 when the constraint is satisfied)
 *   sigma     = robust scale of that attribute in the live catalog:
 *               max(1.4826*MAD, IQR/1.349) floored by 6%*median and 3%*range
 *   z         = gap / sigma
 *   proximity = 1 / (1 + z^2)   (rational quadratic kernel; = 0.5 at 1 sigma)
 *   Tiered attributes (<= 6 distinct catalog values, e.g. 60/120 Hz) compare
 *   by tier distance: [1.0, 0.70, 0.45, 0.30, 0.20, ...] per step.
 *
 * Ordinal categorical attributes (resolution, panel type) use the same ladder.
 * Other categoricals (brand, OS) use market-segment adjacency:
 *   exp(-|meanPrice(actual) - meanPrice(requested)| / priceScale) with
 *   priceScale = max(sigma(priceInr), 15% * median price), floored at 0.1.
 * A requested value that exists NOWHERE in the market is charged as a flat
 * market gap (0.4) to every product — availability, not product quality.
 *
 * Boolean attributes: match = 1.0, mismatch = 0.30.
 *
 * Per-participant utility fed to the frozen fairness operator (ADR-006):
 *   u_m = 10 * (0.90 * weightedProximity + 0.10 * (rating / 5))
 */

export type ViolationSeverity = 'CRITICAL' | 'HIGH' | 'MODERATE' | 'MINOR';
export type MatchQuality = 'EXACT' | 'NEAR' | 'PARTIAL' | 'DISTANT';

export interface ConstraintViolation {
  attribute: string;
  operator: string;
  constraintType: string;
  severity: ViolationSeverity;
  participantId: string;
  requestedValue: any;
  actualValue: any;
  proximity: number;
  gapDescription: string;
  nearestAvailableValue?: any;
  nearestAvailableGap?: number | null;
}

export interface PerConstraintEvaluation {
  attribute: string;
  constraintType: string;
  operator: string;
  requestedValue: any;
  actualValue: any;
  proximity: number;
  satisfied: boolean;
}

export interface RankedNearestMatch {
  product: any;
  productId: string;
  /** 0..100 overall parameter compatibility across all participants. */
  matchScore: number;
  matchQuality: MatchQuality;
  hardViolations: ConstraintViolation[];
  softViolations: ConstraintViolation[];
  perConstraint: PerConstraintEvaluation[];
  /** Proximity-derived utilities per participant (0..10), fairness-ready. */
  utilities: number[];
  exactFeasible: boolean;
}

export interface RequestedVsMarket {
  attribute: string;
  requestedValue: any;
  operator: string;
  nearestAvailableValue: any;
  gap: number | null;
  exactMatchCount: number;
  note: string;
}

export interface NearestMatchRanking {
  mode: 'EXACT' | 'NEAREST';
  ranked: RankedNearestMatch[];
  census: AttributeAvailability[];
  requestedVsMarket: RequestedVsMarket[];
  summaryMessage: string;
}

const TIERED_PROXIMITY = [1.0, 0.7, 0.45, 0.3, 0.2, 0.14, 0.1];

/** Ordered quality ladders for attributes whose values have intrinsic order. */
const ORDINAL_LADDERS: Record<string, string[]> = {
  resolution: ['FullHD', '4K', '8K'],
  panelType: ['LED', 'QLED', 'MiniLED', 'OLED'],
  energyRating: ['1 Star', '2 Star', '3 Star', '4 Star', '5 Star'],
};

const SEVERITY_BY_TYPE: Record<string, ViolationSeverity> = {
  DEALBREAKER: 'CRITICAL',
  HARD_CONSTRAINT: 'HIGH',
  PREFERENCE: 'MODERATE',
  NICE_TO_HAVE: 'MINOR',
};

const MARKET_GAP_PROXIMITY = 0.4;   // requested value exists nowhere in market
const CATEGORICAL_FLOOR = 0.1;      // mismatch can still be near-adjacent
const BOOLEAN_MISMATCH = 0.3;

const isBudgetAttr = (a: string) =>
  a === 'priceInr' || a === 'price' || a === 'budget' || a === 'maxPrice';

export class ProximityEngine {
  /**
   * Rank the full catalog by parameter proximity to the group's constraints.
   * Guarantees a non-empty ranking whenever the catalog is non-empty.
   * Stateless: the catalog is threaded explicitly through every call.
   */
  public rankNearestMatches(
    catalog: any[],
    profiles: ParticipantPreferenceProfile[]
  ): NearestMatchRanking {
    const ranked: RankedNearestMatch[] = catalog.map(product => {
      const evalRes = this.evaluateProduct(catalog, product, profiles);
      const utilities = profiles.map((_profile, idx) => {
        const prox = evalRes.participantProximity[idx] ?? 0;
        const rating = Number(product.rating) || 4.0;
        const quality = Math.min(1, Math.max(0, rating / 5));
        return Number((10 * (0.9 * prox + 0.1 * quality)).toFixed(2));
      });

      const exactFeasible = evalRes.hardViolations.length === 0;
      const matchQuality: MatchQuality = exactFeasible
        ? (evalRes.softViolations.length === 0 ? 'EXACT' : 'NEAR')
        : evalRes.matchScore >= 75 ? 'NEAR'
        : evalRes.matchScore >= 50 ? 'PARTIAL'
        : 'DISTANT';

      return {
        product,
        productId: product.id || product.asin,
        matchScore: evalRes.matchScore,
        matchQuality,
        hardViolations: evalRes.hardViolations,
        softViolations: evalRes.softViolations,
        perConstraint: evalRes.perConstraint,
        utilities,
        exactFeasible,
      };
    });

    ranked.sort((a, b) => {
      if (a.exactFeasible !== b.exactFeasible) return a.exactFeasible ? -1 : 1;
      if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
      return (b.product.rating || 0) - (a.product.rating || 0);
    });

    const census = this.buildCensus(catalog, profiles);
    const requestedVsMarket = this.buildRequestedVsMarket(catalog, profiles);

    const mode: 'EXACT' | 'NEAREST' =
      ranked.length > 0 && ranked[0].exactFeasible ? 'EXACT' : 'NEAREST';

    return {
      mode,
      ranked,
      census,
      requestedVsMarket,
      summaryMessage: this.buildSummaryMessage(mode, requestedVsMarket, ranked, profiles.length),
    };
  }

  /**
   * Evaluate one product against every constraint of every participant.
   * Stateless: pass the catalog so distribution statistics are catalog-true.
   */
  public evaluateProduct(
    catalog: any[],
    product: any,
    profiles: ParticipantPreferenceProfile[]
  ): {
    perConstraint: PerConstraintEvaluation[];
    hardViolations: ConstraintViolation[];
    softViolations: ConstraintViolation[];
    matchScore: number;
    participantProximity: number[];
  } {
    const perConstraint: PerConstraintEvaluation[] = [];
    const hardViolations: ConstraintViolation[] = [];
    const softViolations: ConstraintViolation[] = [];

    let weightedSum = 0;
    let weightTotal = 0;
    const perParticipant: Array<{ sum: number; weight: number }> = profiles.map(() => ({ sum: 0, weight: 0 }));

    for (let pi = 0; pi < profiles.length; pi++) {
      const profile = profiles[pi];
      for (const constraint of profile.constraints || []) {
        const actual = resolveProductAttribute(product, constraint.attribute);
        const prox = this.constraintProximity(catalog, constraint, actual);
        const weight = constraint.weight ?? (isBudgetAttr(constraint.attribute) ? 1.0 : 0.8);
        const satisfied = prox >= 0.999;

        perConstraint.push({
          attribute: constraint.attribute,
          constraintType: constraint.type,
          operator: constraint.operator,
          requestedValue: constraint.value,
          actualValue: actual,
          proximity: round(prox, 3),
          satisfied,
        });

        weightedSum += prox * weight;
        weightTotal += weight;
        perParticipant[pi].sum += prox * weight;
        perParticipant[pi].weight += weight;

        if (!satisfied) {
          const violation = this.buildViolation(catalog, product, constraint, actual, prox, profile.participantId);
          if (constraint.type === 'DEALBREAKER' || constraint.type === 'HARD_CONSTRAINT') {
            hardViolations.push(violation);
          } else {
            softViolations.push(violation);
          }
        }
      }
    }

    const matchScore = weightTotal > 0 ? (weightedSum / weightTotal) * 100 : 50;

    return {
      perConstraint,
      hardViolations,
      softViolations,
      matchScore: round(matchScore, 1),
      participantProximity: perParticipant.map(p =>
        p.weight > 0 ? p.sum / p.weight : 0.5
      ),
    };
  }

  /** Graduated satisfaction of a single constraint, 0..1. */
  public constraintProximity(catalog: any[], constraint: CanonicalConstraint, actual: any): number {
    if (actual === undefined || actual === null) {
      return 0.35; // unpublished spec: neutral-bad, documented, never a silent zero
    }

    const attr = constraint.attribute;
    const op = constraint.operator;
    const requested = constraint.value;

    // Budget: continuous distance beyond the ceiling.
    if (isBudgetAttr(attr) && typeof requested === 'number') {
      const price = Number(actual);
      if (!Number.isFinite(price)) return 0.35;
      if (price <= requested) return 1.0;
      const stats = fitStats.getNumericStats(catalog, 'priceInr');
      const sigma = stats
        ? Math.max(stats.sigma, stats.median * 0.06)
        : Math.max(2000, requested * 0.1);
      const z = (price - requested) / sigma;
      return round(1 / (1 + z * z), 3);
    }

    if (typeof actual === 'boolean' || typeof requested === 'boolean') {
      if (op === 'NEQ' || op === 'NOT_IN') {
        return Boolean(actual) === Boolean(requested) ? 0.3 : 1.0;
      }
      return Boolean(actual) === Boolean(requested) ? 1.0 : BOOLEAN_MISMATCH;
    }

    if (typeof actual === 'number' && typeof requested === 'number' && !isBudgetAttr(attr)) {
      return this.numericProximity(catalog, attr, op, requested, Number(actual));
    }

    if (Array.isArray(requested)) {
      // RANGE over a numeric actual: graduated distance outside the band.
      if (op === 'RANGE' && typeof actual === 'number') {
        const [lo, hi] = requested.map(Number);
        if (Number.isFinite(lo) && Number.isFinite(hi)) {
          if (actual >= lo && actual <= hi) return 1.0;
          const gap = actual < lo ? lo - actual : actual - hi;
          const stats = fitStats.getNumericStats(catalog, attr);
          const sigma = stats
            ? Math.max(stats.sigma, Math.abs(stats.median) * 0.06, (stats.max - stats.min) * 0.03)
            : Math.max(1, Math.abs(hi - lo) * 0.1);
          const z = gap / sigma;
          return round(1 / (1 + z * z), 3);
        }
      }
      const inList = requested.some(v =>
        String(v).toLowerCase().trim() === String(actual).toLowerCase().trim()
      );
      if (op === 'IN') return inList ? 1.0 : 0.3;
      if (op === 'NOT_IN') return inList ? 0.3 : 1.0;
    }

    // Categorical family (incl. NEQ handling)
    if (op === 'NEQ' || op === 'NOT_IN') {
      return String(actual).toLowerCase().trim() === String(requested).toLowerCase().trim()
        ? 0.3 : 1.0;
    }
    return this.categoricalProximity(catalog, attr, requested, actual);
  }

  private numericProximity(
    catalog: any[],
    attr: string,
    op: string,
    requested: number,
    actual: number
  ): number {
    let gap = 0;
    switch (op) {
      case 'LTE': gap = Math.max(0, actual - requested); break;
      case 'GTE': gap = Math.max(0, requested - actual); break;
      case 'EQ': gap = Math.abs(actual - requested); break;
      case 'NEQ': return actual !== requested ? 1.0 : 0.3;
      case 'RANGE': {
        const [lo, hi] = Array.isArray(requested) ? requested : [requested, requested];
        if (actual >= lo && actual <= hi) return 1.0;
        gap = actual < lo ? lo - actual : actual - hi;
        break;
      }
      default: gap = Math.abs(actual - requested);
    }
    if (gap === 0) return 1.0;

    // Tiered/discrete attributes (e.g. 60/120 Hz) compare by tier distance.
    // The requested value is positioned continuously (extrapolated beyond the
    // outermost tier) so impossible requests like GTE 240Hz in a 60/120 market
    // keep a real gap and are correctly flagged as violations.
    if (this.isTiered(catalog, attr)) {
      return this.tieredProximity(catalog, attr, op, requested, actual);
    }

    // Continuous attributes: robust-z distance against the live catalog.
    const stats = fitStats.getNumericStats(catalog, attr);
    const sigma = stats
      ? Math.max(stats.sigma, Math.abs(stats.median) * 0.06, (stats.max - stats.min) * 0.03)
      : Math.max(1, Math.abs(requested) * 0.1);
    const z = gap / sigma;
    return round(1 / (1 + z * z), 3);
  }

  private tieredProximity(
    catalog: any[],
    attr: string,
    op: string,
    requested: number,
    actual: number
  ): number {
    const availability = fitStats.getAvailability(catalog, attr);
    const tiers = (availability?.availableValues.filter((v): v is number => typeof v === 'number') || [])
      .sort((a, b) => a - b);
    if (tiers.length < 2) return 0.5; // single-value tier: no ordinal information

    const posReq = this.continuousTierPosition(tiers, requested);
    const posAct = this.continuousTierPosition(tiers, actual);

    let stepGap: number;
    switch (op) {
      case 'GTE': stepGap = Math.max(0, posReq - posAct); break;
      case 'LTE': stepGap = Math.max(0, posAct - posReq); break;
      default: stepGap = Math.abs(posReq - posAct);
    }
    return this.ladderInterp(stepGap);
  }

  /**
   * Continuous position of a value in tier space: integer indices inside the
   * observed range, linear extrapolation beyond it. This is what keeps
   * impossible requests (e.g. 240Hz in a 60/120 market) measurably far away
   * instead of clamping them onto the top tier.
   */
  private continuousTierPosition(sortedTiers: number[], value: number): number {
    const lastIdx = sortedTiers.length - 1;
    if (value <= sortedTiers[0]) {
      const step = sortedTiers[1] - sortedTiers[0];
      return step > 0 ? (value - sortedTiers[0]) / step : 0;
    }
    if (value >= sortedTiers[lastIdx]) {
      const step = sortedTiers[lastIdx] - sortedTiers[lastIdx - 1];
      return step > 0 ? lastIdx + (value - sortedTiers[lastIdx]) / step : lastIdx;
    }
    for (let i = 0; i < lastIdx; i++) {
      if (value >= sortedTiers[i] && value <= sortedTiers[i + 1]) {
        const span = sortedTiers[i + 1] - sortedTiers[i];
        return span > 0 ? i + (value - sortedTiers[i]) / span : i;
      }
    }
    return lastIdx;
  }

  /** Ladder proximity for a (possibly fractional) tier gap, linearly interpolated. */
  private ladderInterp(stepGap: number): number {
    if (stepGap <= 0) return 1.0;
    const maxIdx = TIERED_PROXIMITY.length - 1;
    if (stepGap >= maxIdx) return TIERED_PROXIMITY[maxIdx];
    const lo = Math.floor(stepGap);
    const hi = Math.ceil(stepGap);
    const frac = stepGap - lo;
    return round(TIERED_PROXIMITY[lo] + frac * (TIERED_PROXIMITY[hi] - TIERED_PROXIMITY[lo]), 3);
  }

  private categoricalProximity(catalog: any[], attr: string, requested: any, actual: any): number {
    const actStr = String(actual).toLowerCase().trim();
    const reqStr = String(requested).toLowerCase().trim();
    if (actStr === reqStr) return 1.0;

    // Ordinal ladder (resolution, panel type, ...): tier distance.
    const ladder = ORDINAL_LADDERS[attr];
    if (ladder) {
      const reqIdx = ladder.findIndex(v => v.toLowerCase() === reqStr);
      const actIdx = ladder.findIndex(v => v.toLowerCase() === actStr);
      if (reqIdx !== -1 && actIdx !== -1) {
        return TIERED_PROXIMITY[Math.min(Math.abs(reqIdx - actIdx), TIERED_PROXIMITY.length - 1)];
      }
    }

    // Substring affinity — only for meaningful tokens (>= 4 chars), so
    // "OLED" vs "LED" is NOT considered adjacent.
    const shorter = Math.min(actStr.length, reqStr.length);
    if (shorter >= 4 && (actStr.includes(reqStr) || reqStr.includes(actStr))) {
      return 0.85;
    }

    // Market-segment adjacency via mean-price positioning of each value.
    const stats = fitStats.getCategoricalStats(catalog, attr);
    if (!stats) return CATEGORICAL_FLOOR + 0.25;

    const meanPrice = stats.meanPriceByValue[actStr] ?? stats.meanPriceByValue[String(actual)];
    const reqPrice = stats.meanPriceByValue[reqStr] ?? stats.meanPriceByValue[String(requested)];

    if (meanPrice === undefined || reqPrice === undefined) {
      // Requested (or actual) value unknown to this market: availability gap,
      // charged equally to every product.
      return MARKET_GAP_PROXIMITY;
    }

    const priceStats = fitStats.getNumericStats(catalog, 'priceInr');
    const priceScale = priceStats
      ? Math.max(priceStats.sigma, priceStats.median * 0.15)
      : 20000;
    const segmentAdjacency = Math.exp(-Math.abs(meanPrice - reqPrice) / priceScale);
    const freqPrior = Math.min(0.1, ((stats.valueCounts[actStr] || 0) / Math.max(1, stats.n)) * 0.2);

    return round(Math.max(CATEGORICAL_FLOOR, Math.min(0.95, segmentAdjacency + freqPrior)), 3);
  }

  private buildViolation(
    catalog: any[],
    product: any,
    constraint: CanonicalConstraint,
    actual: any,
    proximity: number,
    participantId: string
  ): ConstraintViolation {
    const market = this.nearestMarketValue(catalog, constraint);
    return {
      attribute: constraint.attribute,
      operator: constraint.operator,
      constraintType: constraint.type,
      severity: SEVERITY_BY_TYPE[constraint.type] || 'MODERATE',
      participantId,
      requestedValue: constraint.value,
      actualValue: actual,
      proximity,
      gapDescription: this.describeGap(constraint, actual, market),
      nearestAvailableValue: market?.value,
      nearestAvailableGap: market?.gap ?? null,
    };
  }

  /** Closest value actually present in the catalog for this constraint. */
  public nearestMarketValue(catalog: any[], constraint: CanonicalConstraint): { value: any; gap: number | null } | null {
    const attr = constraint.attribute;
    const availability = fitStats.getAvailability(catalog, attr);
    if (!availability || availability.availableValues.length === 0) return null;

    const values = availability.availableValues;
    const numericValues = values.filter((v): v is number => typeof v === 'number').sort((a, b) => a - b);
    const requested = constraint.value;

    if (numericValues.length > 0 && typeof requested === 'number') {
      if (constraint.operator === 'LTE') {
        const under = numericValues.filter(v => v <= requested);
        if (under.length > 0) return { value: Math.max(...under), gap: 0 };
        return { value: numericValues[0], gap: numericValues[0] - requested };
      }
      if (constraint.operator === 'GTE') {
        const over = numericValues.filter(v => v >= requested);
        if (over.length > 0) return { value: Math.min(...over), gap: 0 };
        return { value: numericValues[numericValues.length - 1], gap: requested - numericValues[numericValues.length - 1] };
      }
      let best = numericValues[0];
      let bestGap = Math.abs(best - requested);
      for (const v of numericValues) {
        const g = Math.abs(v - requested);
        if (g < bestGap) { bestGap = g; best = v; }
      }
      return { value: best, gap: bestGap };
    }

    // Categorical
    const reqStr = String(requested).toLowerCase().trim();
    if (values.some(v => String(v).toLowerCase().trim() === reqStr)) {
      return { value: requested, gap: 0 };
    }

    // Ordinal ladder: adjacent existing tier is the nearest.
    const ladder = ORDINAL_LADDERS[attr];
    if (ladder) {
      const reqIdx = ladder.findIndex(v => v.toLowerCase() === reqStr);
      if (reqIdx !== -1) {
        let bestVal: any = null;
        let bestStep = Infinity;
        for (const v of values) {
          const idx = ladder.findIndex(x => x.toLowerCase() === String(v).toLowerCase().trim());
          if (idx !== -1 && Math.abs(idx - reqIdx) < bestStep) {
            bestStep = Math.abs(idx - reqIdx);
            bestVal = v;
          }
        }
        if (bestVal !== null) return { value: bestVal, gap: bestStep };
      }
    }

    const catStats = fitStats.getCategoricalStats(catalog, attr);
    if (catStats) {
      const reqPrice = catStats.meanPriceByValue[reqStr] ?? catStats.meanPriceByValue[String(requested)];
      if (reqPrice !== undefined) {
        let bestVal: any = values[0];
        let bestDist = Infinity;
        for (const v of values) {
          const mp = catStats.meanPriceByValue[String(v).toLowerCase()];
          if (mp === undefined) continue;
          const d = Math.abs(mp - reqPrice);
          if (d < bestDist) { bestDist = d; bestVal = v; }
        }
        return { value: bestVal, gap: Number.isFinite(bestDist) ? bestDist : null };
      }
      // Requested value unknown to the market: most prevalent value is the
      // closest "market reality" anchor.
      const mostCommon = catStats.distinctValues
        .sort((a, b) => (catStats.valueCounts[b] || 0) - (catStats.valueCounts[a] || 0))[0];
      return { value: mostCommon, gap: null };
    }

    return { value: values[0], gap: null };
  }

  private describeGap(
    constraint: CanonicalConstraint,
    actual: any,
    market: { value: any; gap: number | null } | null
  ): string {
    const attr = constraint.attribute;
    const req = constraint.value;
    const unit = mktUnit(attr);
    const fmtINR = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;
    const isBudget = isBudgetAttr(attr);
    const mkt = market && market.gap !== null && market.gap > 0
      ? `; closest on market ${formatValue(market.value)}`
      : market && market.gap === null
        ? `; closest segment on market "${formatValue(market.value)}"`
        : '';

    if (actual === undefined || actual === null) {
      return `${attr}: not published for this model (request: ${constraint.operator} ${formatValue(req)})`;
    }
    if (isBudget && typeof req === 'number') {
      const over = Number(actual) - req;
      return `Requested ≤ ${fmtINR(req)}; this model is ${fmtINR(actual)} (+${fmtINR(over)})${mkt}`;
    }
    if (typeof req === 'number' && typeof actual === 'number') {
      if (constraint.operator === 'GTE') {
        return `Requested ≥ ${req}${unit}; this model delivers ${actual}${unit} (−${round(req - actual, 1)}${unit})${mkt}`;
      }
      if (constraint.operator === 'LTE') {
        return `Requested ≤ ${req}${unit}; this model is ${actual}${unit} (+${round(actual - req, 1)}${unit})${mkt}`;
      }
      return `Requested ${req}${unit}; this model is ${actual}${unit}${mkt}`;
    }
    return `Requested "${formatValue(req)}"; this model is "${formatValue(actual)}"${mkt}`;
  }

  private buildCensus(catalog: any[], profiles: ParticipantPreferenceProfile[]): AttributeAvailability[] {
    const attrs = new Set<string>();
    for (const p of profiles) for (const c of p.constraints || []) attrs.add(c.attribute);
    const result: AttributeAvailability[] = [];
    for (const attr of attrs) {
      const av = fitStats.getAvailability(catalog, attr);
      if (av) result.push(av);
    }
    return result;
  }

  private buildRequestedVsMarket(
    catalog: any[],
    profiles: ParticipantPreferenceProfile[]
  ): RequestedVsMarket[] {
    const out: RequestedVsMarket[] = [];
    const seen = new Set<string>();

    for (const profile of profiles) {
      for (const constraint of profile.constraints || []) {
        const key = `${constraint.attribute}|${constraint.operator}|${String(constraint.value)}`;
        if (seen.has(key)) continue;
        seen.add(key);

        const exactMatchCount = catalog.filter(p => {
          const v = resolveProductAttribute(p, constraint.attribute);
          return this.constraintProximity(catalog, constraint, v) >= 0.999;
        }).length;

        const market = this.nearestMarketValue(catalog, constraint);
        const gap = market && typeof market.gap === 'number' && market.gap > 0 ? market.gap : null;

        out.push({
          attribute: constraint.attribute,
          requestedValue: constraint.value,
          operator: constraint.operator,
          nearestAvailableValue: market?.value,
          gap,
          exactMatchCount,
          note: (() => {
            if (!market) return `${constraint.attribute}: no measurable values in catalog`;
            // A satisfied request has a positive exact-match count — only call it
            // "not available" when nothing in the catalog actually meets it.
            if (exactMatchCount > 0) {
              return `${constraint.attribute}: ${exactMatchCount} product(s) meet ${formatValue(constraint.value)}`;
            }
            return `${constraint.attribute}: request not available in market; closest available "${formatValue(market.value)}"${gap ? ` (gap ${gap})` : ''}`;
          })(),
        });
      }
    }
    return out;
  }

  private buildSummaryMessage(
    mode: 'EXACT' | 'NEAREST',
    requestedVsMarket: RequestedVsMarket[],
    ranked: RankedNearestMatch[],
    participantCount: number
  ): string {
    const unreachable = requestedVsMarket.filter(r => r.exactMatchCount === 0);
    const top = ranked[0];
    const parts: string[] = [];

    if (mode === 'EXACT' && unreachable.length === 0) {
      return `The market fully satisfies this group: ${ranked.filter(r => r.exactFeasible).length} products match every stated constraint.`;
    }

    if (mode === 'NEAREST') {
      parts.push(
        `No catalog product satisfies every stated constraint for all ${participantCount} participant(s); showing the closest real alternatives ranked by statistical parameter proximity.`
      );
    } else {
      parts.push(
        `All hard constraints are satisfiable; some preference targets are not fully available and were matched to the nearest real values.`
      );
    }

    if (unreachable.length > 0) {
      const desc = unreachable
        .slice(0, 3)
        .map(b => `${b.attribute} ${b.operator} ${formatValue(b.requestedValue)} (nearest available: ${formatValue(b.nearestAvailableValue)})`)
        .join('; ');
      parts.push(`Unreachable in current market: ${desc}.`);
    }
    if (top) {
      parts.push(
        `Closest match: ${top.product.modelName || top.product.name || top.productId} at ${top.matchScore}% parameter compatibility.`
      );
    }
    return parts.join(' ');
  }

  private isTiered(catalog: any[], attr: string): boolean {
    const availability = fitStats.getAvailability(catalog, attr);
    return (availability?.availableValues.length || 99) <= 6;
  }
}

function mktUnit(attr: string): string {
  const units: Record<string, string> = {
    refreshRateHz: 'Hz',
    screenSizeInches: '"',
    ramGb: 'GB',
    storageGb: 'GB',
    batteryHours: 'h',
    widthCm: 'cm',
    totalPowerWatts: 'W',
  };
  return units[attr] || '';
}

function formatValue(v: any): string {
  return String(v);
}

function round(n: number, digits: number): number {
  const f = Math.pow(10, digits);
  return Math.round(n * f) / f;
}

export const proximityEngine = new ProximityEngine();
