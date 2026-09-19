import { MockLLMProvider } from '../../src/services/llm/mockProvider';

describe('MockLLMProvider', () => {
  const provider = new MockLLMProvider();

  test('should return deterministic text', async () => {
    const text = await provider.generateText('Hello');
    expect(text).toContain('deterministic mock response');
  });

  test('should extract preferences based on keywords', async () => {
    const transcript = 'I have a budget of 50k and I like Samsung';
    const result = await provider.extractStructuredPreferences(transcript, {});

    expect(result.extractedPreferences?.constraints).toContainEqual(
      expect.objectContaining({ attribute: 'priceInr', value: 50000 })
    );
    expect(result.extractedPreferences?.constraints).toContainEqual(
      expect.objectContaining({ attribute: 'brand', value: 'Samsung' })
    );
    expect(result.isReadyForSummary).toBe(true);
  });

  test('should generate a grounded explanation', async () => {
    const context = {
      productId: 'prod_1',
      productSpecs: {},
      individualUtilities: [
        { participantId: 'p1', participantName: 'Dad', utility: 9, deltas: [] },
        { participantId: 'p2', participantName: 'Son', utility: 7, deltas: [] },
      ],
      groupConflicts: [],
    };
    const explanation = await provider.generateExplanation(context);
    expect(explanation).toContain('balances the needs of 2 participants');
  });

  test('health check should be ok', async () => {
    const health = await provider.healthCheck();
    expect(health.ok).toBe(true);
  });
});
