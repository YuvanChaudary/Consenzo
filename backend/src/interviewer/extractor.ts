import { ParticipantPreferenceProfile, CanonicalConstraint, ConstraintType, ConstraintOperator } from '@shared/types/preferences';
import { z } from 'zod';

const ConstraintSchema = z.object({
  attribute: z.string(),
  operator: z.enum(['LTE', 'GTE', 'EQ', 'NEQ', 'IN', 'NOT_IN', 'RANGE']),
  value: z.any(),
  type: z.enum(['DEALBREAKER', 'HARD_CONSTRAINT', 'PREFERENCE', 'NICE_TO_HAVE']),
  weight: z.number().min(0).max(1).optional().default(0.5),
});

const ProfileSchema = z.object({
  participantId: z.string(),
  groupId: z.string(),
  constraints: z.array(ConstraintSchema),
  summaryMarkdown: z.string().optional(),
  confirmedByParticipant: z.boolean().optional().default(false),
});

export class PreferenceExtractor {
  /**
   * Parses <candidate_extraction> JSON blocks from LLM outputs.
   */
  public extract(text: string, participantId: string, groupId: string): ParticipantPreferenceProfile {
    const extractionMatch = text.match(/<candidate_extraction>([\s\S]*?)<\/candidate_extraction>/);
    if (!extractionMatch) {
      throw new Error('No extraction block found in LLM output');
    }

    try {
      const rawJson = JSON.parse(extractionMatch[1]);
      const profile = ProfileSchema.parse({
        ...rawJson,
        participantId,
        groupId,
      }) as unknown as ParticipantPreferenceProfile;

      return this.normalizeProfile(profile);
    } catch (e: any) {
      throw new Error(`JSON extraction failed: ${e.message}`);
    }
  }

  private normalizeProfile(profile: ParticipantPreferenceProfile): ParticipantPreferenceProfile {
    return {
      ...profile,
      constraints: profile.constraints.map(c => ({
        ...c,
        value: this.normalizeValue(c.attribute, c.value),
      })),
    };
  }

  private normalizeValue(attribute: string, value: any): any {
    if (typeof value !== 'string') return value;

    // Normalize Indian Currency (e.g., "₹50k", "50,000 INR")
    if (attribute === 'priceInr' || (value.includes('₹') || value.toLowerCase().includes('inr'))) {
      const cleanValue = value
        .replace(/[₹,]/g, '')
        .replace(/k/i, '000')
        .replace(/inr/i, '')
        .trim();
      const numeric = parseInt(cleanValue, 10);
      if (!isNaN(numeric)) return numeric;
    }

    return value;
  }

  public generateSummary(profile: ParticipantPreferenceProfile): string {
    const constraints = profile.constraints;
    if (constraints.length === 0) return 'No specific preferences gathered yet.';

    const lines = constraints.map(c => {
      const prefix = c.type === 'DEALBREAKER' ? '❌ **Dealbreaker**' :
                     c.type === 'HARD_CONSTRAINT' ? '⚠️ **Must Have**' :
                     c.type === 'PREFERENCE' ? '✅ **Prefer**' : '✨ **Nice to have**';
      return `${prefix}: ${c.attribute} ${c.operator} ${c.value}`;
    });

    return `**Preference Summary**\n\n${lines.join('\\n')}`;
  }
}

export const preferenceExtractor = new PreferenceExtractor();
