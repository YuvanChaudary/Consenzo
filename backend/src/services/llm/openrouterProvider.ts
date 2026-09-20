import { LLMProvider, LLMInvocationOptions, AgentTurnResponse, ExplanationContext } from './types';
import { getOpenRouterApiKey } from '../../config/secrets';
import { extractDynamicPreferences } from './dynamicExtractor';
import { env } from '../../config/env';

export class OpenRouterLLMProvider implements LLMProvider {
  readonly providerName = 'openrouter';
  readonly modelId = env.LLM_MODEL || process.env.LLM_MODEL || 'nvidia/nemotron-3.5-lightning:free';
  private readonly baseUrl = 'https://openrouter.ai/api/v1';

  private async request(prompt: string, options?: LLMInvocationOptions): Promise<string> {
    const apiKey = await getOpenRouterApiKey();

    const controller = new AbortController();
    const timeoutMs = 4000; // Strict 4s ceiling ensures concurrent users never hang

    const executeFetch = async () => {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3001',
          'X-Title': 'Shippyfy Co-Shopping Platform',
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

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenRouter API Error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      const rawContent = data.choices?.[0]?.message?.content || '';
      return rawContent;
    };

    const timeoutPromise = new Promise<never>((_, reject) => {
      const timer = setTimeout(() => {
        controller.abort();
        reject(new Error(`OpenRouter request timed out after ${timeoutMs}ms`));
      }, timeoutMs);
      // Ensure timer does not prevent process exit
      if (timer.unref) timer.unref();
    });

    return Promise.race([executeFetch(), timeoutPromise]);
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
          : ['Analyzed natural language preferences using OpenRouter Nemotron.'];

        return {
          reply: replyMatch[1].trim(),
          thinking: thinkingRaw,
          thinkingSteps,
          extractedPreferences,
          isReadyForSummary: true,
        };
      }
    } catch (err: any) {
      console.warn('OpenRouter extraction failed, falling back to dynamic NLP engine:', err?.message);
    }

    // Dynamic extraction fallback
    return extractDynamicPreferences(transcript, schema);
  }

  async generateExplanation(context: ExplanationContext): Promise<string> {
    const prompt = `
      You are the Consenzo group purchasing explanation engine.
      Provide a grounded, neutral 2-3 sentence explanation justifying why the chosen product was selected as the group winner.

      Context:
      ${JSON.stringify(context, null, 2)}
    `;

    try {
      const result = await this.request(prompt, { temperature: 0.1, maxTokens: 256 });
      return result.trim();
    } catch {
      const budgetUser = context.individualUtilities[0]?.participantName || 'the group';
      return `This recommendation delivers the highest overall utility while strictly honoring ${budgetUser}'s budget ceiling and minimizing feature trade-offs.`;
    }
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
