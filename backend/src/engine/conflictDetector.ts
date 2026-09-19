import { SmartTvProduct } from '@shared/types/catalog';
import { ParticipantPreferenceProfile, CanonicalConstraint } from '@shared/types/preferences';
import { TradeoffDelta } from '@shared/types/scoring';

export interface Conflict {
  type: 'DIRECT_CLASH' | 'BUDGET_FEATURE_TRADEOFF';
  severity: 'CRITICAL' | 'MODERATE' | 'MINOR';
  description: string;
  participants: string[];
  attribute: string;
}

export class ConflictDetector {
  public detectConflicts(
    profiles: ParticipantPreferenceProfile[],
    catalog: SmartTvProduct[]
  ): Conflict[] {
    const conflicts: Conflict[] = [];

    // 1. Direct Value Clashes
    // Compare every pair of participants for mutually exclusive hard constraints
    for (let i = 0; i < profiles.length; i++) {
      for (let j = i + 1; j < profiles.length; j++) {
        const p1 = profiles[i];
        const p2 = profiles[j];

        p1.constraints.forEach(c1 => {
          p2.constraints.forEach(c2 => {
            if (c1.attribute === c2.attribute && c1.type !== 'NICE_TO_HAVE' && c2.type !== 'NICE_TO_HAVE') {
              if (c1.operator === 'EQ' && c2.operator === 'EQ' && c1.value !== c2.value) {
                conflicts.push({
                  type: 'DIRECT_CLASH',
                  severity: (c1.type === 'DEALBREAKER' || c2.type === 'DEALBREAKER') ? 'CRITICAL' : 'MODERATE',
                  description: `Conflicting requirements for ${c1.attribute}: ${c1.value} vs ${c2.value}`,
                  participants: [p1.participantId, p2.participantId],
                  attribute: c1.attribute,
                });
              }
            }
          });
        });
      }
    }

    // 2. Budget-Feature Trade-offs
    // Check if any participant's budget is too low for others' must-have features
    for (const profile of profiles) {
      const budgetConstraint = profile.constraints.find(c => c.attribute === 'priceInr' && (c.type === 'HARD_CONSTRAINT' || c.type === 'DEALBREAKER'));
      if (!budgetConstraint) continue;

      const budgetCeiling = budgetConstraint.value;

      // Find the cheapest product that satisfies other participants' hard requirements
      // This is a simplified check for the MVP
      const minPriceForOthers = Math.min(...catalog.map(p => p.priceInr));

      if (budgetCeiling < minPriceForOthers) {
        conflicts.push({
          type: 'BUDGET_FEATURE_TRADEOFF',
          severity: 'CRITICAL',
          description: `Budget ceiling ₹${budgetCeiling} is below the market minimum for desired features.`,
          participants: [profile.participantId],
          attribute: 'priceInr',
        });
      }
    }

    return conflicts;
  }

  public computeTradeoffDeltas(
    product: SmartTvProduct,
    profile: ParticipantPreferenceProfile
  ): TradeoffDelta[] {
    const deltas: TradeoffDelta[] = [];

    for (const constraint of profile.constraints) {
      const actualValue = (product as any)[constraint.attribute];
      if (actualValue === undefined) continue;

      if (constraint.operator === 'EQ' && actualValue !== constraint.value) {
        deltas.push({
          participantId: profile.participantId,
          attribute: constraint.attribute,
          desiredValue: constraint.value,
          actualValue: actualValue,
          deltaPercent: -100,
          impact: 'NEGATIVE',
        });
      } else if (constraint.operator === 'LTE' && actualValue > constraint.value) {
        const diff = ((actualValue - constraint.value) / constraint.value) * 100;
        deltas.push({
          participantId: profile.participantId,
          attribute: constraint.attribute,
          desiredValue: constraint.value,
          actualValue: actualValue,
          deltaPercent: diff,
          impact: 'NEGATIVE',
        });
      }
      // Other operators omitted for brevity in MVP
    }

    return deltas;
  }
}

export const conflictDetector = new ConflictDetector();
