import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getCorrelationContext } from './middleware/correlation';
import { routeRequest } from './router';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const correlation = getCorrelationContext(event.headers || {});

  try {
    const response = await routeRequest(event, correlation);

    return {
      statusCode: response.statusCode,
      body: response.body,
      headers: response.headers || { 'Content-Type': 'application/json' },
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: {
          code: 'CRITICAL_SYSTEM_FAILURE',
          message: 'A critical error occurred in the lambda entry point.',
          requestId: correlation.requestId,
          timestamp: new Date().toISOString(),
        },
        meta: {
          requestId: correlation.requestId,
          correlationId: correlation.correlationId,
          timestamp: new Date().toISOString(),
        },
      }),
      headers: { 'Content-Type': 'application/json' },
    };
  }
};
