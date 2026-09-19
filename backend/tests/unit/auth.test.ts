import { generateSessionToken, verifySessionToken, requireParticipantAuth } from '../../src/middleware/auth';
import { AppError } from '../../src/middleware/error';

describe('Authentication Middleware', () => {
  const mockPayload: any = {
    sub: 'usr_123',
    groupId: 'grp_456',
    role: 'PARTICIPANT',
    exp: Math.floor(Date.now() / 1000) + 3600,
  };

  test('should generate and verify a valid token', () => {
    const token = generateSessionToken(mockPayload);
    const decoded = verifySessionToken(token);
    expect(decoded.sub).toBe(mockPayload.sub);
    expect(decoded.groupId).toBe(mockPayload.groupId);
  });

  test('should throw error for invalid token', () => {
    expect(() => verifySessionToken('invalid-token')).toThrow(AppError);
    expect(() => verifySessionToken('invalid-token')).toThrow('The provided session token is invalid.');
  });

  test('should verify participant auth', async () => {
    const token = generateSessionToken(mockPayload);
    const headers = { authorization: `Bearer ${token}` };
    const result = await requireParticipantAuth(headers);
    expect(result.sub).toBe(mockPayload.sub);
  });

  test('should throw error for missing auth header', async () => {
    const headers = {};
    await expect(requireParticipantAuth(headers)).rejects.toThrow('Authentication token is missing.');
  });

  test('should throw error for mismatched participantId', async () => {
    const token = generateSessionToken(mockPayload);
    const headers = { authorization: `Bearer ${token}` };
    await expect(requireParticipantAuth(headers, 'usr_wrong')).rejects.toThrow('You are not authorized to access this participant\'s data.');
  });
});
