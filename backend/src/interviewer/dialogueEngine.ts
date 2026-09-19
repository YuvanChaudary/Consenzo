import { LLMProvider } from '../services/llm/types';
import { llmProvider } from '../services/llm/providerFactory';
import { preferenceRepository } from '../repositories/preferenceRepository';
import { groupRepository } from '../repositories/groupRepository';
import { getInterviewerPrompt, INTERVIEWER_SYSTEM_PROMPT } from './prompts';
import { AgentTurnResponse } from '../services/llm/types';

export interface DialogueState {
  participantId: string;
  turnCount: number;
  transcript: string;
}

export class DialogueEngine {
  private provider: LLMProvider;

  constructor() {
    this.provider = llmProvider;
  }

  public async processTurn(participantId: string, userMessage: string, categoryOverride?: string): Promise<AgentTurnResponse> {
    // 1. Fetch group context for category & title
    let category = categoryOverride;
    let title = '';
    try {
      const group = await groupRepository.getGroupByParticipantId(participantId);
      if (group) {
        if (!category) category = group.category;
        title = group.title;
      }
    } catch {
      // fallback
    }

    const systemPrompt = getInterviewerPrompt(category || 'smart_tvs', title);

    // 2. Load conversation history
    const messages = await preferenceRepository.getMessages(participantId);
    const transcript = messages.map(m => `${m.role}: ${m.content}`).join('\n');

    const turnCount = Math.floor(messages.length / 2) + 1;

    // 3. Construct Prompt
    const prompt = `
${systemPrompt}

Current Transcript:
${transcript}

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

    // 4. Persist Turn
    await preferenceRepository.saveMessage(participantId, {
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString(),
    });
    await preferenceRepository.saveMessage(participantId, {
      role: 'assistant',
      content: result.reply,
      timestamp: new Date().toISOString(),
    });

    return {
      ...result,
      turnCount,
      isReadyForSummary: turnCount >= 2,
    };
  }
}

export const dialogueEngine = new DialogueEngine();
