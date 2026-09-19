import { handleError } from '../../src/middleware/error';
import { AppError } from '../../src/middleware/error';

describe('AppError Response Verification', () => {
  const meta = { requestId: 'req_1', correlationId: 'corr_1', timestamp: '2026-09-15T00:00:00Z' };

  test('handleError should produce correct envelope for AppError', () => {
    const error = new AppError('TEST_ERROR', 400, ['detail 1'], 'Custom error message');
    const response = handleError(error, meta);

    expect(response).toEqual({
      error: {
        code: 'TEST_ERROR',
        message: 'Custom error message',
        requestId: meta.requestId,
        timestamp: expect.any(String),
        details: ['detail 1'],
      },
      meta: meta
    });
  });

  test('handleError should produce correct envelope for unhandled error', () => {
    const error = new Error('Unexpected crash');
    const response = handleError(error, meta);

    expect(response).toEqual({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred on the server.',
        requestId: meta.requestId,
        timestamp: expect.any(String),
        details: undefined,
      },
      meta: meta
    });
  });
});
