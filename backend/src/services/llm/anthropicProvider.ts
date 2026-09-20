import { LLMProvider, LLMInvocationOptions, AgentTurnResponse, ExplanationContext } from './types';
import { extractDynamicPreferences } from './dynamicExtractor';

export class AnthropicLLMProvider implements LLMProvider {
  readonly providerName = 'anthropic';
  readonly modelId = process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022';
  private readonly baseUrl = 'https://api.anthropic.com/v1';

  private async request(prompt: string, options?: LLMInvocationOptions): Promise<string> {
    const apiKey = process.env.ANTHROPIC_API_KEY || '';
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY environment variable is not configured');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.modelId,
          max_tokens: options?.maxTokens ?? 1024,
          temperature: options?.temperature ?? 0.2,
          messages: [{ role: 'user', content: prompt }],
          stop_sequences: options?.stopSequences,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Anthropic API Error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      const firstBlock = data.content?.[0];
      return firstBlock?.text || '';
    } catch (err: any) {
      clearTimeout(timeoutId);
      throw err;
    }
  }

  async generateText(prompt: string, options?: LLMInvocationOptions): Promise<string> {
    return this.request(prompt, options);
  }

  async extractStructuredPreferences(
    transcript: string,
    schema: any
  ): Promise<AgentTurnResponse> {
    try {
      const prompt = transcript.includes('You are the Nexus') || transcript.includes('You are the Consenzo')
        ? transcript
        : `
      You are the Nexus preference extraction agent.
      Analyze the following transcript and extract participant preferences according to the provided schema.

      Transcript:
      ${transcript}

      Schema:
      ${JSON.stringify(schema, null, 2)}
      `;

      const text = await this.request(prompt, { temperature: 0.1 });
      const dynamicResult = extractDynamicPreferences(text, schema);

      return {
        reply: dynamicResult.reply,
        thinking: dynamicResult.thinking,
        thinkingSteps: dynamicResult.thinkingSteps,
        extractedPreferences: dynamicResult.extractedPreferences,
        isReadyForSummary: dynamicResult.isReadyForSummary,
      };
    } catch {
      // Fallback in case of parsing / API error
      return {
        reply: "Got it. Let's make sure we find the perfect match for you and the team.",
        isReadyForSummary: false,
      };
    }
  }

  async generateExplanation(context: ExplanationContext): Promise<string> {
    const prompt = `
You are the Nexus Consensus Explainer.
Given the following context of a group recommendation decision:
Winner Product Specs: ${JSON.stringify(context.productSpecs)}
Individual Utilities: ${JSON.stringify(context.individualUtilities)}
Group Conflicts: ${JSON.stringify(context.groupConflicts)}

Write a concise, transparent 2-3 sentence grounded explanation of why this product is the winning group consensus.
`;
    return this.request(prompt, { temperature: 0.3, maxTokens: 250 });
  }

  async healthCheck(): Promise<{ ok: boolean; latencyMs: number }> {
    const start = Date.now();
    try {
      await this.request('Respond with OK', { maxTokens: 10 });
      return { ok: true, latencyMs: Date.now() - start };
    } catch {
      return { ok: false, latencyMs: Date.now() - start };
    }
  }
}
