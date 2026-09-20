import { NexusProduct } from '@shared/types/catalog';
import { ParticipantPreferenceProfile } from '@shared/types/preferences';
import { resolveProductAttribute } from '../utils/attributeResolver';

export interface ParticipantTradeOff {
  participantId: string;
  displayName?: string;
  satisfactionLevel: 'FULLY_MET' | 'PARTIAL' | 'COMPROMISED';
  utilityScore: number;
  satisfiedConstraints: string[];
  compromisedConstraints: string[];
  summaryNote: string;
}

export interface TradeOffCard {
  productId: string;
  productName: string;
  priceInr: number;
  perParticipant: ParticipantTradeOff[];
  groupVerdict: string;
}

export class ExplainabilityEngine {
  /**
   * Generates a deterministic, auditable trade-off card for a product across all participants.
   */
  public generateTradeOffCard(
    product: NexusProduct,
    profiles: ParticipantPreferenceProfile[],
    individualUtilities: Record<string, number>
  ): TradeOffCard {
    const perParticipant: ParticipantTradeOff[] = [];

    for (const profile of profiles) {
      const satisfied: string[] = [];
      const compromised: string[] = [];

      for (const constraint of profile.constraints || []) {
        const actual = resolveProductAttribute(product, constraint.attribute);
        const attrLabel = this.formatAttributeName(constraint.attribute);

        if (actual === undefined || actual === null) {
          compromised.push(`${attrLabel}: attribute not specified`);
          continue;
        }

        const isBudget =
          constraint.attribute === 'priceInr' ||
          constraint.attribute === 'price' ||
          constraint.attribute === 'budget';

        if (isBudget) {
          const ceiling = Number(constraint.value);
          const actPrice = Number(actual);
          if (actPrice <= ceiling) {
            const savings = ceiling - actPrice;
            satisfied.push(
              savings > 0
                ? `Budget ceiling met (₹${actPrice.toLocaleString('en-IN')} ≤ ₹${ceiling.toLocaleString('en-IN')}, saving ₹${savings.toLocaleString('en-IN')})`
                : `Budget ceiling exactly met at ₹${ceiling.toLocaleString('en-IN')}`
            );
          } else {
            const overage = actPrice - ceiling;
            compromised.push(
              `Budget exceeded by ₹${overage.toLocaleString('en-IN')} (₹${actPrice.toLocaleString('en-IN')} vs target ₹${ceiling.toLocaleString('en-IN')})`
            );
          }
        } else if (typeof actual === 'boolean') {
          if (actual === Boolean(constraint.value)) {
            satisfied.push(`${attrLabel}: ${actual ? 'Yes' : 'No'} requirement satisfied`);
          } else {
            compromised.push(`${attrLabel}: ${actual ? 'Present' : 'Not supported'} (requested ${constraint.value ? 'Yes' : 'No'})`);
          }
        } else if (typeof actual === 'number' && typeof constraint.value === 'number') {
          if (constraint.operator === 'LTE') {
            if (actual <= constraint.value) {
              satisfied.push(`${attrLabel}: ${actual} ≤ target ${constraint.value}`);
            } else {
              compromised.push(`${attrLabel}: ${actual} exceeds max ${constraint.value}`);
            }
          } else if (constraint.operator === 'GTE') {
            if (actual >= constraint.value) {
              satisfied.push(`${attrLabel}: ${actual} meets minimum ${constraint.value}`);
            } else {
              compromised.push(`${attrLabel}: ${actual} below required ${constraint.value}`);
            }
          } else {
            if (actual >= constraint.value) {
              satisfied.push(`${attrLabel}: ${actual} target achieved`);
            } else {
              compromised.push(`${attrLabel}: closest match ${actual} (target: ${constraint.value})`);
            }
          }
        } else {
          const actStr = String(actual).toLowerCase();
          const prefStr = String(constraint.value).toLowerCase();
          if (actStr.includes(prefStr) || prefStr.includes(actStr)) {
            satisfied.push(`${attrLabel}: matches "${actual}"`);
          } else {
            compromised.push(`${attrLabel}: "${actual}" differs from preferred "${constraint.value}"`);
          }
        }
      }

      const utility = individualUtilities[profile.participantId] || 7.0;
      let level: 'FULLY_MET' | 'PARTIAL' | 'COMPROMISED' = 'PARTIAL';
      let summaryNote = '';

      if (compromised.length === 0) {
        level = 'FULLY_MET';
        summaryNote = 'All explicit constraints and preferences satisfied.';
      } else if (compromised.length <= 1 && utility >= 6.5) {
        level = 'PARTIAL';
        summaryNote = `Minor concession on ${compromised[0].split(':')[0]}.`;
      } else {
        level = 'COMPROMISED';
        summaryNote = `Compromised on ${compromised.length} criteria to maximize overall group compatibility.`;
      }

      perParticipant.push({
        participantId: profile.participantId,
        satisfactionLevel: level,
        utilityScore: utility,
        satisfiedConstraints: satisfied,
        compromisedConstraints: compromised,
        summaryNote,
      });
    }

    const fullyMetCount = perParticipant.filter((p) => p.satisfactionLevel === 'FULLY_MET').length;
    const groupVerdict =
      fullyMetCount === perParticipant.length
        ? 'Unanimous alignment with zero compromises.'
        : `${fullyMetCount}/${perParticipant.length} members fully satisfied; balanced concessions for remaining members.`;

    return {
      productId: product.id || product.asin || 'unknown',
      productName: product.name || product.modelName || 'Product',
      priceInr: product.priceInr,
      perParticipant,
      groupVerdict,
    };
  }

  private formatAttributeName(attr: string): string {
    const map: Record<string, string> = {
      priceInr: 'Price / Budget',
      price: 'Price',
      screenSizeInches: 'Screen Size',
      panelType: 'Panel Type',
      refreshRateHz: 'Refresh Rate',
      hasHdmi21: 'HDMI 2.1',
      hasAnc: 'Active Noise Cancellation (ANC)',
      batteryHours: 'Battery Life',
      ramGb: 'RAM',
      storageGb: 'Storage',
      channels: 'Channels',
      totalPowerWatts: 'Audio Output Power',
    };
    return map[attr] || attr.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());
  }
}

export const explainabilityEngine = new ExplainabilityEngine();
