import { LLMProvider, LLMInvocationOptions, AgentTurnResponse, ExplanationContext } from './types';
import { getNvidiaApiKey } from '../../config/secrets';
import { extractDynamicPreferences } from './dynamicExtractor';

export class NvidiaLLMProvider implements LLMProvider {
  readonly providerName = 'nvidia';
  readonly modelId = 'nvidia/nemotron-3.5-lightning-30b-a3b';
  private readonly baseUrl = 'https://integrate.api.nvidia.com/v1';

  private async request(prompt: string, options?: LLMInvocationOptions): Promise<string> {
    const apiKey = await getNvidiaApiKey();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.modelId,
          messages: [{ role: 'user', content: prompt }],
          temperature: options?.temperature ?? 0.2,
          max_tokens: options?.maxTokens ?? 1024,
          stop: options?.stopSequences,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`NVIDIA API Error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
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
      const prompt = transcript.includes('You are the Consenzo') 
        ? transcript 
        : `
      You are the Consenzo preference extraction agent.
      Analyze the following transcript and extract participant preferences according to the provided schema.

      Schema: ${JSON.stringify(schema)}
      Transcript: ${transcript}

      Directives:
      - Wrap the conversational reply in <reply> tags.
      - Wrap the extracted JSON in <candidate_extraction> tags.
      - Identify DEALBREAKERS, HARD_CONSTRAINTS, and PREFERENCES.
    `;

      const result = await this.request(prompt);

      // Parse <thinking>, <reply> and <candidate_extraction>
      const thinkingMatch = result.match(/<thinking>([\s\S]*?)<\/thinking>/);
      const replyMatch = result.match(/<reply>([\s\S]*?)<\/reply>/);
      const extractionMatch = result.match(/<candidate_extraction>([\s\S]*?)<\/candidate_extraction>/);

      if (replyMatch && extractionMatch) {
        let extractedPreferences = {};
        try {
          extractedPreferences = JSON.parse(extractionMatch[1]);
        } catch {
          extractedPreferences = {};
        }

        const thinkingRaw = thinkingMatch ? thinkingMatch[1].trim() : undefined;
        const thinkingSteps = thinkingRaw
          ? thinkingRaw.split('\n').map(s => s.replace(/^[-•*0-9.]+\s*/, '').trim()).filter(Boolean)
          : ['Analyzed natural language preferences and cross-referenced candidate attributes.'];

        return {
          reply: replyMatch[1].trim(),
          thinking: thinkingRaw,
          thinkingSteps,
          extractedPreferences,
          isReadyForSummary: true,
        };
      }
    } catch (err: any) {
      console.warn('NVIDIA extraction timed out or failed, falling back to dynamic NLP engine:', err?.message);
    }

    // Dynamic, category-aware, human-interactive extraction fallback
    return extractDynamicPreferences(transcript, schema);
  }

  async generateExplanation(context: ExplanationContext): Promise<string> {
    const prompt = `
      Generate a grounded, factual trade-off explanation for the following product.
      Product: ${context.productId}
      Specs: ${JSON.stringify(context.productSpecs)}
      Participant Scores: ${JSON.stringify(context.individualUtilities)}
      Conflicts: ${JSON.stringify(context.groupConflicts)}

      Directives:
      - Use /no_think mode.
      - Strictly bound by the provided data.
      - Do not hallucinate features.
      - Highlight who conceded what.
    `;

    return this.request(prompt);
  }

  async healthCheck(): Promise<{ ok: boolean; latencyMs: number }> {
    const start = Date.now();
    try {
      await this.request('ping');
      return { ok: true, latencyMs: Date.now() - start };
    } catch {
      return { ok: false, latencyMs: Date.now() - start };
    }
  }
}
