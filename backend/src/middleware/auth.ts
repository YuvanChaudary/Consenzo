import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { SessionTokenPayload, Role } from '@shared/types/session';
import { AppError } from './error';

export function generateSessionToken(payload: SessionTokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    algorithm: 'HS256',
  });
}

export function verifySessionToken(token: string): SessionTokenPayload {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET, {
      algorithms: ['HS256'],
    }) as SessionTokenPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AppError('TOKEN_EXPIRED', 401, undefined, 'Your session has expired. Please join the room again.');
    }
    throw new AppError('INVALID_TOKEN', 401, undefined, 'The provided session token is invalid.');
  }
}

export async function requireParticipantAuth(
  headers: Record<string, string | undefined>,
  requestedParticipantId?: string
): Promise<SessionTokenPayload> {
  const authHeader = headers['authorization'] || headers['Authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError('UNAUTHORIZED', 401, undefined, 'Authentication token is missing.');
  }

  const token = authHeader.split(' ')[1];
  const payload = verifySessionToken(token);

  if (requestedParticipantId && payload.sub !== requestedParticipantId) {
    throw new AppError('FORBIDDEN', 403, undefined, 'You are not authorized to access this participant\'s data.');
  }

  return payload;
}
