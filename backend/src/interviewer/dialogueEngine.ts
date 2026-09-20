import { LLMProvider } from '../services/llm/types';
import { llmProvider } from '../services/llm/providerFactory';
import { preferenceRepository } from '../repositories/preferenceRepository';
import { groupRepository } from '../repositories/groupRepository';
import { memoryService } from '../services/memoryService';
import { getInterviewerPrompt } from './prompts';
import { AgentTurnResponse } from '../services/llm/types';

export interface DialogueState {
  groupId: string;
  participantId: string;
  turnCount: number;
  transcript: string;
}

export class DialogueEngine {
  private provider: LLMProvider;

  constructor() {
    this.provider = llmProvider;
  }

  /**
   * Processes one interview turn, fully scoped to (groupId, participantId).
   * Every group gets an isolated transcript and fresh category context; the
   * participant's cross-group stable memory is injected as soft context.
   */
  public async processTurn(groupId: string, participantId: string, userMessage: string, categoryOverride?: string): Promise<AgentTurnResponse> {
    // 1. Resolve group context — drives category & room title for THIS group only
    let category = categoryOverride;
    let title = '';
    try {
      const group = await groupRepository.getGroup(groupId);
      if (group) {
        if (!category) category = group.category;
        title = group.title;
      }
    } catch {
      // fall through with overrides
    }

    // 2. Load THIS conversation's history (group + participant scoped) — newest last
    const messages = await preferenceRepository.getMessages(groupId, participantId);
    const transcript = messages.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n');

    const turnCount = Math.floor(messages.length / 2) + 1;

    // 3. Cross-group persistent memory for this participant (soft context only)
    let memoryContext = '';
    try {
      const memory = await memoryService.getMemory(participantId, category || 'smart_tvs');
      memoryContext = memoryService.buildMemoryPromptContext(memory);
    } catch {
      // memory is optional enrichment — never fail the turn on it
    }

    const systemPrompt = getInterviewerPrompt(category || 'smart_tvs', title, memoryContext);

    // 4. Construct prompt
    const prompt = `
${systemPrompt}

Current Transcript:
${transcript || '(new conversation — this is the participant\'s first message)'}

User's Latest Message:
${userMessage}

Instructions:
- Deeply parse the user's natural language and identify their underlying requirements for this ${category || 'product'}.
- Provide your internal thinking in <thinking>...</thinking> tags.
- Provide the next empathetic conversational turn in <reply>...</reply> tags.
- Update the extracted preference profile in <candidate_extraction>...</candidate_extraction> tags.
- If turnCount is 2 or more and preferences are identified, set isReadyForSummary to true.
`;

    const result = await this.provider.extractStructuredPreferences(prompt, { category, roomTitle: title });

    // 5. Persist the extracted constraints as the participant's draft profile.
    //    This is the single source of truth the analysis engine reads — without
    //    it the interview's work is thrown away and every group analyses against
    //    an empty profile (making all products trivially "feasible").
    const extractedConstraints = (result.extractedPreferences as any)?.constraints;
    if (Array.isArray(extractedConstraints) && extractedConstraints.length > 0) {
      await preferenceRepository.saveDraftProfile({
        groupId,
        participantId,
        constraints: extractedConstraints,
      });
    }

    // 6. Persist this turn — scoped to the group so no other room can see it
    await preferenceRepository.saveMessage(groupId, participantId, 'user', userMessage);
    await preferenceRepository.saveMessage(groupId, participantId, 'assistant', result.reply);
    await preferenceRepository.touchConversationMeta(groupId, participantId);

    return {
      ...result,
      turnCount,
      isReadyForSummary: turnCount >= 2 || result.isReadyForSummary,
    };
  }

  /** Full transcript for UI resume — group-scoped. */
  public async getTranscript(groupId: string, participantId: string) {
    return preferenceRepository.getMessages(groupId, participantId);
  }
}

export const dialogueEngine = new DialogueEngine();
