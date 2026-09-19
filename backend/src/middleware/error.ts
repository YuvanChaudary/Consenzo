import { errorResponse } from '../utils/response';
import { ApiMeta } from '@shared/types/api';

export class AppError extends Error {
  constructor(
    public readonly code: string,
    public readonly statusCode: number,
    public readonly details?: any[],
    message?: string
  ) {
    super(message || code);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export function handleError(error: unknown, meta: ApiMeta) {
  if (error instanceof AppError) {
    return errorResponse(
      error.code,
      error.message,
      error.statusCode,
      error.details,
      meta
    );
  }

  console.error('[Unhandled Error]:', error);

  return errorResponse(
    'INTERNAL_SERVER_ERROR',
    'An unexpected error occurred on the server.',
    500,
    undefined,
    meta
  );
}
