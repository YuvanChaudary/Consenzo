export interface ApiMeta {
  requestId: string;
  correlationId: string;
  timestamp: string;
}

export interface ApiResponse<T> {
  data: T;
  meta: ApiMeta;
  statusCode: number;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Array<{
    field?: string;
    issue: string;
  }>;
  requestId: string;
  timestamp: string;
}

export interface ApiErrorEnvelope {
  error: ApiError;
  meta: ApiMeta;
}
