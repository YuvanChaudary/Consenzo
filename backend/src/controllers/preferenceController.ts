import { APIGatewayProxyEvent } from 'aws-lambda';
import { preferenceRepository } from '../repositories/preferenceRepository';
import { preferenceExtractor } from '../interviewer/extractor';
import { successResponse } from '../utils/response';
import { AppError } from '../middleware/error';
import { requireParticipantAuth } from '../middleware/auth';
import { ParticipantPreferenceProfile } from '@shared/types/preferences';

export const preferenceController = {
  async getPreferences(event: APIGatewayProxyEvent): Promise<any> {
    const participantId = event.pathParameters?.['participantId'];
    if (!participantId) {
      throw new AppError('MISSING_PARAMS', 400, undefined, 'Participant ID is required.');
    }

    const auth = await requireParticipantAuth(event.headers as any, participantId);

    try {
      // Resolve the DRAFT profile within the caller's group (falls back to GSI).
      // The draft is what the interview has extracted so far — surfacing it here
      // lets the UI show captured constraints before the member confirms.
      let profile: Awaited<ReturnType<typeof preferenceRepository.getProfile>> = null;
      if (auth.groupId) {
        profile = await preferenceRepository.getProfile(auth.groupId, auth.sub);
      }
      if (!profile) {
        profile = await preferenceRepository.getConfirmedProfileByParticipant(auth.sub);
      }

      if (!profile) {
        // Honest empty state — no fabricated TV preferences
        return successResponse({
          participantId: auth.sub,
          confirmed: false,
          summaryMarkdown: '',
          summary: '',
          constraints: [],
          profile: null,
        }, 200, {
          requestId: event.requestContext.requestId,
          correlationId: (event.headers as any)['x-correlation-id'] || 'unknown',
          timestamp: new Date().toISOString(),
        });
      }

      const confirmed = (profile as any).confirmedByParticipant === true;
      const summary = profile.summaryMarkdown || preferenceExtractor.generateSummary(profile);

      return successResponse({
        participantId: auth.sub,
        confirmed,
        summaryMarkdown: summary,
        constraints: profile.constraints || [],
        profile,
        summary,
      }, 200, {
        requestId: event.requestContext.requestId,
        correlationId: (event.headers as any)['x-correlation-id'] || 'unknown',
        timestamp: new Date().toISOString(),
      });
    } catch (e: any) {
      throw new AppError('PREFERENCE_ERROR', 500, undefined, e.message);
    }
  },

  async confirmPreferences(event: APIGatewayProxyEvent): Promise<any> {
    const participantId = event.pathParameters?.['participantId'];
    if (!participantId) {
      throw new AppError('MISSING_PARAMS', 400, undefined, 'Participant ID is required.');
    }

    const auth = await requireParticipantAuth(event.headers as any, participantId);

    const groupId = auth.groupId;
    if (!groupId) {
      throw new AppError('NO_GROUP', 400, undefined, 'Your session token is not linked to a group.');
    }

    try {
      const body = JSON.parse(event.body || '{}');
      const supplied = body.profile || (body.constraints ? body : null);

      // The stored draft (written during the interview) is the source of truth.
      // A body may add/clarify constraints, but confirming never discards what
      // was already extracted. An honestly empty draft stays empty.
      const draft = await preferenceRepository.getProfile(groupId, auth.sub);
      const constraints = supplied?.constraints?.length
        ? supplied.constraints
        : (draft?.constraints || []);

      const profile = {
        participantId: auth.sub,
        groupId,
        constraints,
        summaryMarkdown:
          body.summaryMarkdown
          || supplied?.summaryMarkdown
          || draft?.summaryMarkdown
          || preferenceExtractor.generateSummary({ participantId: auth.sub, groupId, constraints } as any),
      };

      const { ready } = await preferenceRepository.confirmAndCheckReadiness({
        ...profile,
        confirmedByParticipant: true,
      } as any);

      return successResponse({
        participantId: auth.sub,
        groupId,
        confirmed: true,
        readiness: ready ? 'READY_FOR_ANALYSIS' : 'CONFIRMED',
        lockedAt: new Date().toISOString(),
      }, 200, {
        requestId: event.requestContext.requestId,
        correlationId: (event.headers as any)['x-correlation-id'] || 'unknown',
        timestamp: new Date().toISOString(),
      });
    } catch (e: any) {
      if (e instanceof AppError) throw e;
      throw new AppError('CONFIRMATION_FAILED', 500, undefined, e.message);
    }
  },

  async updatePreferences(event: APIGatewayProxyEvent): Promise<any> {
    const participantId = event.pathParameters?.['participantId'];
    if (!participantId) {
      throw new AppError('MISSING_PARAMS', 400, undefined, 'Participant ID is required.');
    }

    const auth = await requireParticipantAuth(event.headers as any, participantId);
    const groupId = auth.groupId;
    if (!groupId) {
      throw new AppError('NO_GROUP', 400, undefined, 'Your session token is not linked to a group.');
    }

    try {
      const body = JSON.parse(event.body || '{}');
      const constraints = Array.isArray(body.constraints) ? body.constraints : [];
      const existing = await preferenceRepository.getProfile(groupId, auth.sub);
      const isConfirmed = body.confirmed !== undefined ? Boolean(body.confirmed) : (existing?.confirmedByParticipant ?? false);

      const summaryMarkdown =
        body.summaryMarkdown
        || preferenceExtractor.generateSummary({ participantId: auth.sub, groupId, constraints } as any);

      const profile: ParticipantPreferenceProfile = {
        participantId: auth.sub,
        groupId,
        constraints,
        summaryMarkdown,
        confirmedByParticipant: isConfirmed,
      };

      // Save directly to repository (allows full editing/adding/deleting of constraints)
      await preferenceRepository.savePreferenceProfile(profile);

      // Context update: emit event to group feed
      await preferenceRepository.addGroupEvent(
        groupId,
        auth.sub,
        'PREF_UPDATED',
        `updated their preference requirements (${constraints.length} constraints specified)`
      );

      // Invalidate cached analysis so next calculation reflects edited preferences
      await preferenceRepository.invalidateAnalysis(groupId);

      return successResponse({
        participantId: auth.sub,
        groupId,
        confirmed: isConfirmed,
        summaryMarkdown,
        constraints,
        updatedAt: new Date().toISOString(),
      }, 200, {
        requestId: event.requestContext.requestId,
        correlationId: (event.headers as any)['x-correlation-id'] || 'unknown',
        timestamp: new Date().toISOString(),
      });
    } catch (e: any) {
      if (e instanceof AppError) throw e;
      throw new AppError('UPDATE_FAILED', 500, undefined, e.message);
    }
  },
};
