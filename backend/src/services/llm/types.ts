import { ParticipantPreferenceProfile } from '@shared/types/preferences';

export interface LLMInvocationOptions {
  temperature?: number;
  maxTokens?: number;
  stopSequences?: string[];
}

export interface ExplanationContext {
  productId: string;
  productSpecs: any;
  individualUtilities: Array<{
    participantId: string;
    participantName: string;
    utility: number;
    deltas: any[];
  }>;
  groupConflicts: any[];
}

export interface AgentTurnResponse {
  reply: string;
  thinking?: string;
  thinkingSteps?: string[];
  extractedPreferences?: Partial<ParticipantPreferenceProfile>;
  isReadyForSummary: boolean;
  turnCount?: number;
}

export interface LLMProvider {
  readonly providerName: string;
  readonly modelId: string;
  generateText(prompt: string, options?: LLMInvocationOptions): Promise<string>;
  extractStructuredPreferences(
    transcript: string,
    schema: any
  ): Promise<AgentTurnResponse>;
  generateExplanation(context: ExplanationContext): Promise<string>;
  healthCheck(): Promise<{ ok: boolean; latencyMs: number }>;
}
