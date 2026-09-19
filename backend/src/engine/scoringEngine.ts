import { SmartTvProduct } from '@shared/types/catalog';
import { ParticipantPreferenceProfile, CanonicalConstraint } from '@shared/types/preferences';
import { ProductScore, UtilityBreakdown } from '@shared/types/scoring';
import { resolveProductAttribute } from '../utils/attributeResolver';

export class ScoringEngine {
  /**
   * Categorical satisfaction: 1.0 preferred, 0.75 acceptable/partial, 0.4 neutral.
   */
  private s_cat(actual: any, preferred: any): number {
    const actStr = String(actual || '').toLowerCase().trim();
    const prefStr = String(preferred || '').toLowerCase().trim();
    if (actStr === prefStr) return 1.0;
    if (actStr.includes(prefStr) || prefStr.includes(actStr)) return 0.85;
    return 0.45; // Default neutral for non-matches
  }

  /**
   * Continuous piecewise budget curve:
   * Higher savings = higher economic surplus utility.
   * If actual is at ceiling, score = 0.75.
   * If actual is 50% of ceiling or lower, score = 1.0.
   * If actual exceeds ceiling by <= 15%, score = 0.45.
   */
  private s_budget(actual: number, ceiling: number): number {
    if (actual <= ceiling) {
      const savings = ceiling - actual;
      const maxSavings = ceiling * 0.5;
      const score = 0.75 + (Math.min(savings, maxSavings) / maxSavings) * 0.25;
      return Math.min(1.0, score);
    }
    const overagePct = (actual - ceiling) / ceiling;
    if (overagePct <= 0.15) {
      return Math.max(0.3, 0.70 - overagePct * 2.5);
    }
    return 0.15;
  }

  /**
   * Discrete ordered tiers (e.g., 120Hz > 60Hz, 16GB > 8GB).
   */
  private s_ordered(actual: number, target: number): number {
    if (actual >= target) return 1.0;
    if (actual >= target * 0.75) return 0.75;
    if (actual >= target * 0.5) return 0.55;
    return 0.35;
  }

  /**
   * Boolean flag satisfaction.
   */
  private s_bool(actual: boolean, target: boolean): number {
    return actual === target ? 1.0 : 0.45;
  }

  public computeIndividualUtility(
    product: SmartTvProduct,
    profile: ParticipantPreferenceProfile
  ): ProductScore {
    const breakdown: UtilityBreakdown[] = [];
    let totalWeightedScore = 0;
    let totalWeight = 0;

    for (const constraint of profile.constraints) {
      const isBudget = constraint.attribute === 'priceInr' || constraint.attribute === 'price' || constraint.attribute === 'budget';
      
      // We score all constraints for utility, including budget and hard constraints!
      const weight = constraint.weight ?? (isBudget ? 1.0 : 0.8);
      let satisfaction = 0.6;

      const actualValue = resolveProductAttribute(product, constraint.attribute);

      if (actualValue === undefined || actualValue === null) {
        // Missing attribute: moderate baseline
        satisfaction = 0.55;
      } else {
        if (isBudget) {
          satisfaction = this.s_budget(Number(actualValue), Number(constraint.value));
        } else if (typeof actualValue === 'boolean' || typeof constraint.value === 'boolean') {
          satisfaction = this.s_bool(Boolean(actualValue), Boolean(constraint.value));
        } else if (typeof actualValue === 'number' && typeof constraint.value === 'number') {
          if (constraint.operator === 'LTE') {
            satisfaction = actualValue <= constraint.value ? 1.0 : Math.max(0.3, 1.0 - (actualValue - constraint.value) / constraint.value);
          } else if (constraint.operator === 'GTE') {
            satisfaction = actualValue >= constraint.value ? 1.0 : Math.max(0.3, actualValue / constraint.value);
          } else {
            satisfaction = this.s_ordered(actualValue, Number(constraint.value));
          }
        } else {
          satisfaction = this.s_cat(actualValue, constraint.value);
        }
      }

      breakdown.push({
        attribute: constraint.attribute,
        score: satisfaction,
        weight: weight,
      });

      totalWeightedScore += satisfaction * weight;
      totalWeight += weight;
    }

    // Baseline utility based on product rating if constraints are empty or sparse
    const baselineRatingScore = ((product.rating || 4.2) / 5.0);
    let normalizedTotal = totalWeight > 0
      ? (totalWeightedScore / totalWeight) * 10
      : baselineRatingScore * 10;

    // Ensure non-zero mathematical utility for valid products
    normalizedTotal = Math.min(9.9, Math.max(4.5, normalizedTotal));

    return {
      productId: product.asin,
      totalUtility: Number(normalizedTotal.toFixed(1)),
      breakdown: breakdown.map(b => ({
        ...b,
        weight: totalWeight > 0 ? b.weight / totalWeight : 0,
      })),
    };
  }
}

export const scoringEngine = new ScoringEngine();
