import { APIGatewayProxyEvent } from 'aws-lambda';
import { dialogueEngine } from '../interviewer/dialogueEngine';
import { groupRepository } from '../repositories/groupRepository';
import { preferenceRepository } from '../repositories/preferenceRepository';
import { successResponse } from '../utils/response';
import { AppError } from '../middleware/error';
import { requireParticipantAuth } from '../middleware/auth';

function getInitialMessageForCategory(category: string = 'smart_tvs', title?: string): string {
  const norm = (category || '').toLowerCase();
  const roomContext = title ? ` for "${title}"` : '';

  if (norm === 'laptops' || norm.includes('laptop') || norm.includes('workstation')) {
    return `Hey! I'm Consenzo. I'm here to privately discover your needs${roomContext} (e.g., daily productivity, coding, gaming graphics, RAM, battery life, or budget ceiling) so everyone in the group gets a fair say. What matters most to you?`;
  }
  if (norm === 'soundbars' || norm.includes('soundbar') || norm.includes('audio') || norm.includes('speaker')) {
    return `Hey! I'm Consenzo. I'm here to privately discover your sound preferences${roomContext} (e.g., Dolby Atmos 3D audio, dedicated wireless subwoofer, HDMI eARC, or budget limits). What's your acoustic priority?`;
  }
  if (norm === 'smart_tvs' || norm.includes('tv') || norm.includes('display')) {
    return `Hey! I'm Consenzo. I'm here to privately learn what you want from this Smart TV${roomContext} (e.g., screen size, 4K/OLED clarity, 120Hz refresh rate, or budget) so everyone gets a fair say. What matters most to you?`;
  }
  return `Hey! I'm Consenzo. I'm here to privately discover your core priorities and budget limits${roomContext} so everyone in the group reaches a unanimous, fair decision. What are you looking for?`;
}

export const conversationController = {
  /**
   * Start (or resume) the private interview for THIS participant in THIS group.
   * The conversation is scoped to the group: a new room always starts a fresh
   * chat with the correct category, while returning members get their history.
   */
  async startConversation(event: APIGatewayProxyEvent): Promise<any> {
    const auth = await requireParticipantAuth(event.headers as any);

    const groupId = auth.groupId;
    if (!groupId) {
      throw new AppError('NO_GROUP', 400, undefined, 'Your session token is not linked to a group. Join a room first.');
    }

    const group = await groupRepository.getGroup(groupId);
    const category = group?.category || 'smart_tvs';
    const title = group?.title || '';

    // Resume: if a conversation already exists for (group, participant), return it
    const existingMessages = await preferenceRepository.getMessages(groupId, auth.sub);
    const isResume = existingMessages.length > 0;

    if (!isResume) {
      // Fresh conversation — log it on the group feed (without transcript contents)
      await preferenceRepository.addGroupEvent(groupId, auth.sub, 'INTERVIEW_STARTED', 'started consulting their shopping assistant');
    }

    const initialMessage = getInitialMessageForCategory(category, title);
    const messages = isResume
      ? existingMessages
      : [{ role: 'assistant' as const, content: initialMessage, timestamp: new Date().toISOString() }];

    return successResponse({
      conversationId: `conv_${groupId}_${auth.sub}`,
      participantId: auth.sub,
      groupId,
      turnCount: Math.floor(existingMessages.length / 2) + 1,
      category,
      roomTitle: title,
      isResume,
      messages,
      initialMessage,
      message: isResume ? undefined : initialMessage,
      thinking: isResume
        ? `Resumed discovery session for category "${category}" with ${existingMessages.length} prior turns.`
        : `Initialized adaptive discovery session for category "${category}". Awaiting participant's initial input.`,
      thinkingSteps: isResume ? [
        `Loaded ${existingMessages.length} prior conversation turns`,
        `Domain confirmed: ${category.toUpperCase()}`,
        'Continuing from previous context — nothing is asked twice',
      ] : [
        `Identified session domain: ${category.toUpperCase()}`,
        'Configured dynamic attribute taxonomy and constraint boundaries',
        'Ready to parse natural human language and extract group consensus priorities',
      ],
    }, 200, {
      requestId: event.requestContext.requestId,
      correlationId: (event.headers as any)['x-correlation-id'] || 'unknown',
      timestamp: new Date().toISOString(),
    });
  },

  async sendMessage(event: APIGatewayProxyEvent): Promise<any> {
    const auth = await requireParticipantAuth(event.headers as any);
    const body = JSON.parse(event.body || '{}');
    const { message } = body;

    if (!message) {
      throw new AppError('MISSING_PARAMS', 400, undefined, 'Message content is required.');
    }

    const groupId = auth.groupId;
    if (!groupId) {
      throw new AppError('NO_GROUP', 400, undefined, 'Your session token is not linked to a group. Join a room first.');
    }

    try {
      const result = await dialogueEngine.processTurn(groupId, auth.sub, message);

      const constraintsCount = (result.extractedPreferences as any)?.constraints?.length || 0;

      return successResponse({
        reply: result.reply,
        turnCount: (result as any).turnCount || 2,
        isReadyForSummary: result.isReadyForSummary,
        extractedAttributesCount: constraintsCount,
        extractedPreferences: result.extractedPreferences,
        thinking: result.thinking,
        thinkingSteps: result.thinkingSteps || [
          'Interpreted user intent and emotional weighting',
          'Extracted formal numerical and categorical constraints',
          'Cross-referenced with group consensus compatibility',
        ],
      }, 200, {
        requestId: event.requestContext.requestId,
        correlationId: (event.headers as any)['x-correlation-id'] || 'unknown',
        timestamp: new Date().toISOString(),
      });
    } catch (e: any) {
      throw new AppError('CONVERSATION_ERROR', 500, undefined, e.message);
    }
  },

  /** GET /conversations/{conversationId} — restore chat history (per group). */
  async getConversation(event: APIGatewayProxyEvent): Promise<any> {
    const auth = await requireParticipantAuth(event.headers as any);
    const groupId = auth.groupId;
    if (!groupId) {
      throw new AppError('NO_GROUP', 400, undefined, 'Your session token is not linked to a group.');
    }

    const messages = await preferenceRepository.getMessages(groupId, auth.sub);
    const group = await groupRepository.getGroup(groupId);

    return successResponse({
      conversationId: `conv_${groupId}_${auth.sub}`,
      participantId: auth.sub,
      groupId,
      category: group?.category || 'smart_tvs',
      roomTitle: group?.title || '',
      messages,
      turnCount: Math.floor(messages.length / 2) + 1,
    }, 200, {
      requestId: event.requestContext.requestId,
      correlationId: (event.headers as any)['x-correlation-id'] || 'unknown',
      timestamp: new Date().toISOString(),
    });
  },
};
