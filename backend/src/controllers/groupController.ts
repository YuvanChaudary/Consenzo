import { APIGatewayProxyEvent } from 'aws-lambda';
import { sessionService } from '../services/sessionService';
import { analysisService } from '../services/analysisService';
import { votingService } from '../services/votingService';
import { successResponse } from '../utils/response';
import { AppError } from '../middleware/error';
import { verifySessionToken } from '../middleware/auth';

export const groupController = {
  async createGroup(event: APIGatewayProxyEvent): Promise<any> {
    const body = JSON.parse(event.body || '{}');
    const title = body.title;
    const category = body.category || 'smart_tvs';
    const creatorDisplayName = body.creatorDisplayName || body.creatorName;
    const targetCount = body.targetParticipantCount || 4;

    if (!title || !creatorDisplayName) {
      throw new AppError('MISSING_PARAMS', 400, undefined, 'Title and creator display name are required.');
    }

    const result = await sessionService.createGroup(title, category, creatorDisplayName, targetCount);

    return successResponse({
      groupId: result.group.groupId,
      title: result.group.title,
      category: result.group.category,
      status: result.group.status,
      inviteCode: result.inviteCode || result.group.groupId,
      inviteUrl: (() => {
        const originHeader = (event.headers as any)?.['origin'] || (event.headers as any)?.['Origin'] || (event.headers as any)?.['referer'];
        if (originHeader) {
          try {
            return `${new URL(originHeader).origin}/join/${result.inviteCode || result.group.groupId}`;
          } catch {}
        }
        return `http://localhost:5173/join/${result.inviteCode || result.group.groupId}`;
      })(),
      creator: {
        participantId: result.participant.participantId,
        displayName: result.participant.displayName,
        role: result.participant.role,
      },
      token: result.token,
      creatorToken: result.token,
    }, 201, {
      requestId: event.requestContext.requestId,
      correlationId: (event.headers as any)['x-correlation-id'] || 'unknown',
      timestamp: new Date().toISOString(),
    });
  },

  async joinGroup(event: APIGatewayProxyEvent): Promise<any> {
    const body = JSON.parse(event.body || '{}');
    const inviteCode = body.inviteCode || event.pathParameters?.['groupId'];
    const displayName = body.displayName;

    if (!inviteCode || !displayName) {
      throw new AppError('MISSING_PARAMS', 400, undefined, 'Invite code and display name are required.');
    }

    try {
      const result = await sessionService.joinGroup(inviteCode, displayName);
      return successResponse({
        groupId: result.group.groupId,
        participantId: result.participant.participantId,
        displayName: result.participant.displayName,
        role: result.participant.role,
        status: result.group.status,
        readiness: result.participant.status || 'JOINED',
        token: result.token,
        participantToken: result.token,
      }, 201, {
        requestId: event.requestContext.requestId,
        correlationId: (event.headers as any)['x-correlation-id'] || 'unknown',
        timestamp: new Date().toISOString(),
      });
    } catch (e: any) {
      throw new AppError('INVALID_INVITE', 400, undefined, e.message);
    }
  },

  async getGroup(event: APIGatewayProxyEvent): Promise<any> {
    const groupId = event.pathParameters?.['groupId'];
    if (!groupId) {
      throw new AppError('MISSING_GROUP_ID', 400, undefined, 'Group ID is required.');
    }

    try {
      const status = await sessionService.getGroupStatus(groupId);
      return successResponse(status, 200, {
        requestId: event.requestContext.requestId,
        correlationId: (event.headers as any)['x-correlation-id'] || 'unknown',
        timestamp: new Date().toISOString(),
      });
    } catch (e: any) {
      throw new AppError('GROUP_NOT_FOUND', 404, undefined, e.message);
    }
  },

  async runAnalysis(event: APIGatewayProxyEvent): Promise<any> {
    const groupId = event.pathParameters?.['groupId'];
    if (!groupId) {
      throw new AppError('MISSING_GROUP_ID', 400, undefined, 'Group ID is required.');
    }

    try {
      const result = await analysisService.analyzeGroup(groupId);
      return successResponse(result, 200, {
        requestId: event.requestContext.requestId,
        correlationId: (event.headers as any)['x-correlation-id'] || 'unknown',
        timestamp: new Date().toISOString(),
      });
    } catch (e: any) {
      if (e.message === 'NO_PARTICIPANTS') {
        throw new AppError('NO_PARTICIPANTS', 400, undefined, 'No participants found in the group.');
      }
      if (e.message === 'NO_FEASIBLE_PRODUCTS') {
        throw new AppError('NO_FEASIBLE_PRODUCTS', 404, undefined, 'No products satisfy all group constraints.');
      }
      throw new AppError('ANALYSIS_FAILED', 500, undefined, e.message);
    }
  },

  async castVote(event: APIGatewayProxyEvent): Promise<any> {
    const groupId = event.pathParameters?.['groupId'];
    if (!groupId) {
      throw new AppError('MISSING_GROUP_ID', 400, undefined, 'Group ID is required.');
    }

    const body = JSON.parse(event.body || '{}');
    const productId = body.productId || body.asin;
    let participantId = body.participantId;

    if (!participantId) {
      const authHeader = (event.headers as any)?.['authorization'] || (event.headers as any)?.['Authorization'];
      if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
          const auth = verifySessionToken(authHeader.split(' ')[1]);
          participantId = auth.sub;
        } catch {
          // Ignored here; check below
        }
      }
    }

    if (!productId || !participantId) {
      throw new AppError('MISSING_PARAMS', 400, undefined, 'Product ID and authenticated participant are required.');
    }

    try {
      const tally = await votingService.castVoteAndTally(groupId, participantId, productId);
      return successResponse({
        ...tally,
        recorded: true,
        participantId,
        tally,
      }, 200, {
        requestId: event.requestContext.requestId,
        correlationId: (event.headers as any)['x-correlation-id'] || 'unknown',
        timestamp: new Date().toISOString(),
      });
    } catch (e: any) {
      throw new AppError('VOTE_FAILED', 500, undefined, e.message);
    }
  },
};
