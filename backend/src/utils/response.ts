import { ApiResponse, ApiErrorEnvelope, ApiMeta } from '@shared/types/api';

export function createApiMeta(requestId: string, correlationId: string): ApiMeta {
  return {
    requestId,
    correlationId,
    timestamp: new Date().toISOString(),
  };
}

export function successResponse<T>(
  data: T,
  statusCode: number = 200,
  meta: ApiMeta
): ApiResponse<T> {
  return {
    data,
    meta,
    statusCode,
  };
}

export function errorResponse(
  code: string,
  message: string,
  statusCode: number = 400,
  details?: any[],
  meta?: ApiMeta
): ApiErrorEnvelope {
  return {
    error: {
      code,
      message,
      details,
      requestId: meta?.requestId || 'unknown',
      timestamp: new Date().toISOString(),
    },
    meta: meta || {
      requestId: 'unknown',
      correlationId: 'unknown',
      timestamp: new Date().toISOString(),
    },
  };
}
