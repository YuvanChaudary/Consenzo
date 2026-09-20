import { GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { ddbDocClient, DYNAMODB_TABLE } from './dynamoClient';
import { UserMemoryProfile, MemoryUpdateInput } from '@shared/types/memory';
import { CanonicalConstraint } from '@shared/types/preferences';

export class MemoryService {
  /**
   * Get persistent memory for a user in a specific category:
   * PK: USER#<userId>, SK: MEMORY#<category>
   */
  async getMemory(userId: string, category: string): Promise<UserMemoryProfile | null> {
    const normalizedCategory = category.toLowerCase().replace(/-/g, '_');
    try {
      const res = await ddbDocClient.send(new GetCommand({
        TableName: DYNAMODB_TABLE,
        Key: {
          PK: `USER#${userId}`,
          SK: `MEMORY#${normalizedCategory}`,
        },
      }));

      if (res?.Item) {
        return res.Item as UserMemoryProfile;
      }
    } catch {
      // Fallback
    }

    return null;
  }

  /**
   * Update memory profile on room close with deterministic guard
   */
  async updateMemoryOnRoomClose(input: MemoryUpdateInput): Promise<UserMemoryProfile> {
    const { userId, category, roomId, finalConstraints } = input;
    const normalizedCategory = category.toLowerCase().replace(/-/g, '_');

    const existing = await this.getMemory(userId, normalizedCategory);

    // Extract stable facts from new constraints
    const budgetConstraint = finalConstraints.find(
      (c) => c.attribute === 'priceInr' || c.attribute === 'price' || c.attribute === 'budget'
    );
    const brandConstraints = finalConstraints.filter((c) => c.attribute === 'brand');

    const newBudget = budgetConstraint ? Number(budgetConstraint.value) : existing?.stablePreferences.budgetCeilingInr;
    const newBrands = brandConstraints.length > 0
      ? Array.from(new Set([...(existing?.stablePreferences.preferredBrands || []), ...brandConstraints.map((c) => String(c.value))]))
      : existing?.stablePreferences.preferredBrands;

    const newHardReqs = finalConstraints.filter(
      (c) => c.type === 'HARD_CONSTRAINT' || c.type === 'DEALBREAKER'
    );

    const updatedProfile: UserMemoryProfile = {
      userId,
      category: normalizedCategory,
      stablePreferences: {
        budgetCeilingInr: newBudget,
        preferredBrands: newBrands,
        hardRequirements: newHardReqs.length > 0 ? newHardReqs : existing?.stablePreferences.hardRequirements,
        lastUpdated: new Date().toISOString(),
      },
      sessionHistory: [
        ...(existing?.sessionHistory || []),
        {
          roomId,
          closedAt: new Date().toISOString(),
          finalConstraints,
        },
      ],
    };

    await ddbDocClient.send(new PutCommand({
      TableName: DYNAMODB_TABLE,
      Item: {
        PK: `USER#${userId}`,
        SK: `MEMORY#${normalizedCategory}`,
        ...updatedProfile,
      },
    }));

    return updatedProfile;
  }

  /**
   * Generates a conversational memory seed for the interview assistant
   */
  public buildMemoryPromptContext(memory: UserMemoryProfile | null): string {
    if (!memory || !memory.stablePreferences) return '';

    const { budgetCeilingInr, preferredBrands, hardRequirements } = memory.stablePreferences;
    const items: string[] = [];

    if (budgetCeilingInr) {
      items.push(`Previous budget comfort zone: under ₹${budgetCeilingInr.toLocaleString('en-IN')}`);
    }
    if (preferredBrands && preferredBrands.length > 0) {
      items.push(`Known brand affinities: ${preferredBrands.join(', ')}`);
    }
    if (hardRequirements && hardRequirements.length > 0) {
      items.push(`Recurring requirements: ${hardRequirements.map((r) => `${r.attribute} ${r.operator} ${r.value}`).join('; ')}`);
    }

    if (items.length === 0) return '';

    return `
Returning Member Memory Profile:
${items.map((i) => `• ${i}`).join('\n')}
Guideline: Natural acknowledge returning preferences without forcing them (e.g., "Welcome back! Last time you looked for under ₹${budgetCeilingInr?.toLocaleString('en-IN') || '...'} — still aiming for that range?").
`;
  }
}

export const memoryService = new MemoryService();
