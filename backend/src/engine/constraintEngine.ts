import { SmartTvProduct } from '@shared/types/catalog';
import { CanonicalConstraint, ConstraintType, ParticipantPreferenceProfile } from '@shared/types/preferences';
import { resolveProductAttribute } from '../utils/attributeResolver';

export class ConstraintEngine {
  public evaluateConstraint(product: SmartTvProduct, constraint: CanonicalConstraint): boolean {
    const attributeValue = resolveProductAttribute(product, constraint.attribute);

    if (attributeValue === undefined || attributeValue === null) {
      // Missing attribute: fail dealbreakers and hard constraints conservatively
      if (constraint.type === 'DEALBREAKER' || constraint.type === 'HARD_CONSTRAINT') {
        return false;
      }
      return true; // Soft preferences ignore missing attribute
    }

    switch (constraint.operator) {
      case 'LTE':
        return attributeValue <= constraint.value;
      case 'GTE':
        return attributeValue >= constraint.value;
      case 'EQ':
        return attributeValue === constraint.value;
      case 'NEQ':
        return attributeValue !== constraint.value;
      case 'IN':
        return Array.isArray(constraint.value) && constraint.value.includes(attributeValue);
      case 'NOT_IN':
        return Array.isArray(constraint.value) && !constraint.value.includes(attributeValue);
      case 'RANGE':
        return attributeValue >= constraint.value[0] && attributeValue <= constraint.value[1];
      default:
        return false;
    }
  }

  public gateCatalog(
    catalog: SmartTvProduct[],
    profiles: ParticipantPreferenceProfile[]
  ): { feasibleSet: SmartTvProduct[]; gatedOut: Map<string, string[]> } {
    const feasibleSet: SmartTvProduct[] = [];
    const gatedOut = new Map<string, string[]>();

    for (const product of catalog) {
      let isFeasible = true;
      const reasons: string[] = [];

      for (const profile of profiles) {
        for (const constraint of (profile?.constraints || [])) {
          if (!this.evaluateConstraint(product, constraint)) {
            if (constraint.type === 'DEALBREAKER') {
              isFeasible = false;
              reasons.push(`Dealbreaker: ${constraint.attribute} ${constraint.operator} ${constraint.value}`);
              break; // Stop checking other constraints for this product
            }
            if (constraint.type === 'HARD_CONSTRAINT') {
              isFeasible = false;
              reasons.push(`Hard Constraint: ${constraint.attribute} ${constraint.operator} ${constraint.value}`);
            }
          }
        }
        if (!isFeasible) break;
      }

      if (isFeasible) {
        feasibleSet.push(product);
      } else {
        gatedOut.set(product.asin, reasons);
      }
    }

    return { feasibleSet, gatedOut };
  }

  public computeRelaxationBranches(
    catalog: SmartTvProduct[],
    profiles: ParticipantPreferenceProfile[]
  ): { relaxationSet: SmartTvProduct[]; conflictPairs: string[] } {
    // Simple relaxation: Ignore one hard constraint at a time and see if candidates emerge
    // In a real impl, this would be more sophisticated (e.g., relaxation of budget by 10%)
    const relaxationSet: SmartTvProduct[] = [];
    const conflictPairs: string[] = [];

    // Logic: Identify which hard constraints are the biggest blockers
    // For the MVP, we'll return a set of products that satisfy all dealbreakers
    // but might fail one hard constraint.

    for (const product of catalog) {
      let dealbreakerViolated = false;
      let hardConstraintViolations = 0;

      for (const profile of profiles) {
        for (const constraint of (profile?.constraints || [])) {
          if (!this.evaluateConstraint(product, constraint)) {
            if (constraint.type === 'DEALBREAKER') {
              dealbreakerViolated = true;
              break;
            }
            if (constraint.type === 'HARD_CONSTRAINT') {
              hardConstraintViolations++;
            }
          }
        }
        if (dealbreakerViolated) break;
      }

      if (!dealbreakerViolated && hardConstraintViolations === 1) {
        relaxationSet.push(product);
      }
    }

    return { relaxationSet, conflictPairs: ['Budget vs Refresh Rate'] }; // Mock conflict pair
  }
}

export const constraintEngine = new ConstraintEngine();
