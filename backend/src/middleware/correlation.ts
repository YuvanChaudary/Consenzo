import { randomUUID } from 'crypto';
const uuidv4 = randomUUID;

export interface CorrelationContext {
  correlationId: string;
  requestId: string;
}

export function getCorrelationContext(headers: Record<string, string | undefined>): CorrelationContext {
  const correlationId = headers['x-correlation-id'] || uuidv4();
  const requestId = uuidv4();

  return {
    correlationId,
    requestId,
  };
}
