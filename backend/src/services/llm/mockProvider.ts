import { LLMProvider, LLMInvocationOptions, AgentTurnResponse, ExplanationContext } from './types';
import { extractDynamicPreferences } from './dynamicExtractor';
import { ParticipantPreferenceProfile } from '@shared/types/preferences';

export class MockLLMProvider implements LLMProvider {
  readonly providerName = 'mock';
  readonly modelId = 'mock-model-v1';

  async generateText(prompt: string, options?: LLMInvocationOptions): Promise<string> {
    return "This is a deterministic mock response. I understand your preferences!";
  }

  async extractStructuredPreferences(
    transcript: string,
    schema: any
  ): Promise<AgentTurnResponse> {
    return extractDynamicPreferences(transcript, schema);
  }

  async generateExplanation(context: ExplanationContext): Promise<string> {
    return `This product is recommended because it balances the needs of ${context.individualUtilities.length} participants. Specifically, it satisfies the budget of the coordinator and the brand preference of the others.`;
  }

  async healthCheck(): Promise<{ ok: boolean; latencyMs: number }> {
    return { ok: true, latencyMs: 1 };
  }
}
