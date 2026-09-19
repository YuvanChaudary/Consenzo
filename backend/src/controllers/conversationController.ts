import { APIGatewayProxyEvent } from 'aws-lambda';
import { dialogueEngine } from '../interviewer/dialogueEngine';
import { groupRepository } from '../repositories/groupRepository';
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
  async startConversation(event: APIGatewayProxyEvent): Promise<any> {
    const auth = await requireParticipantAuth(event.headers as any);

    let category = 'smart_tvs';
    let title = '';
    try {
      const group = await groupRepository.getGroupByParticipantId(auth.sub);
      if (group) {
        category = group.category || 'smart_tvs';
        title = group.title || '';
      }
    } catch {
      // fallback
    }

    const initialMsg = getInitialMessageForCategory(category, title);

    return successResponse({
      conversationId: `conv_${auth.sub}`,
      participantId: auth.sub,
      turnCount: 1,
      category,
      roomTitle: title,
      initialMessage: initialMsg,
      message: initialMsg,
      thinking: `Initialized adaptive discovery session for category "${category}". Awaiting participant's initial input.`,
      thinkingSteps: [
        `Identified session domain: ${category.toUpperCase()}`,
        'Configured dynamic attribute taxonomy and constraint boundaries',
        'Ready to parse natural human language and extract group consensus priorities'
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

    try {
      const result = await dialogueEngine.processTurn(auth.sub, message);

      const constraintsCount = (result.extractedPreferences as any)?.constraints?.length || 2;

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
          'Cross-referenced with group consensus compatibility'
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
};
