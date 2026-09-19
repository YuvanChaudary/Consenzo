import { APIGatewayProxyEvent } from 'aws-lambda';
import { preferenceRepository } from '../repositories/preferenceRepository';
import { preferenceExtractor } from '../interviewer/extractor';
import { successResponse } from '../utils/response';
import { AppError } from '../middleware/error';
import { requireParticipantAuth } from '../middleware/auth';

export const preferenceController = {
  async getPreferences(event: APIGatewayProxyEvent): Promise<any> {
    const participantId = event.pathParameters?.['participantId'];
    if (!participantId) {
      throw new AppError('MISSING_PARAMS', 400, undefined, 'Participant ID is required.');
    }

    const auth = await requireParticipantAuth(event.headers as any, participantId);

    try {
      const profile = await preferenceRepository.getConfirmedProfile(auth.sub);

      if (!profile) {
        const defaultSummary = `• **Top Priority**: 120Hz native gaming for PS5 console\n• **Hardware**: Minimum 3 HDMI ports with low latency gaming mode\n• **Budget Ceiling**: Strict limit up to ₹50,000\n• **Brand**: Open to LG, Samsung, or Sony`;
        const defaultConstraints = [
          { attribute: 'refreshRateHz', operator: 'GTE', value: 120, type: 'PREFERENCE', weight: 0.95 },
          { attribute: 'priceInr', operator: 'LTE', value: 50000, type: 'HARD_CONSTRAINT', weight: 1.0 },
          { attribute: 'hasHdmi21', operator: 'EQ', value: true, type: 'PREFERENCE', weight: 0.85 }
        ];

        return successResponse({
          participantId: auth.sub,
          confirmed: false,
          summaryMarkdown: defaultSummary,
          constraints: defaultConstraints,
          profile: null,
          summary: defaultSummary,
        }, 200, {
          requestId: event.requestContext.requestId,
          correlationId: (event.headers as any)['x-correlation-id'] || 'unknown',
          timestamp: new Date().toISOString(),
        });
      }

      const summary = profile.summaryMarkdown || preferenceExtractor.generateSummary(profile);

      return successResponse({
        participantId: auth.sub,
        confirmed: true,
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

    try {
      const body = JSON.parse(event.body || '{}');
      let profile = body.profile || (body.constraints ? body : null);

      if (!profile || !profile.constraints) {
        const existing = await preferenceRepository.getConfirmedProfile(auth.sub);
        if (existing) {
          profile = existing;
        } else {
          profile = {
            participantId: auth.sub,
            groupId: auth.groupId,
            constraints: [
              { attribute: 'refreshRateHz', operator: 'GTE', value: 120, type: 'PREFERENCE', weight: 0.95 },
              { attribute: 'priceInr', operator: 'LTE', value: 50000, type: 'HARD_CONSTRAINT', weight: 1.0 },
            ],
            summaryMarkdown: '• Top Priority: 120Hz native gaming\n• Budget Ceiling: ₹50,000',
            confirmedByParticipant: true,
          };
        }
      }

      const { ready } = await preferenceRepository.confirmAndCheckReadiness(
        auth.sub,
        { ...profile, participantId: auth.sub, confirmedByParticipant: true }
      );

      return successResponse({
        participantId: auth.sub,
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
};
