import { routeRequest } from '../../src/router';
import { APIGatewayProxyEvent } from 'aws-lambda';

describe('API Contract Verification', () => {
  const mockCorrelation = { requestId: 'req_1', correlationId: 'corr_1' };

  test('Voting endpoint should be /groups/{groupId}/votes', async () => {
    const event: Partial<APIGatewayProxyEvent> = {
      httpMethod: 'POST',
      path: '/groups/grp_123/votes',
      headers: {},
      requestContext: { requestId: 'req_1' } as any,
      body: JSON.stringify({ productId: 'tv_1', vote: 'APPROVE' })
    };

    const result = await routeRequest(event as APIGatewayProxyEvent, mockCorrelation);

    // We expect it NOT to be a 404.
    // It might be a 401 or 400 if auth/validation fails, but not a 404.
    expect(result.statusCode).not.toBe(404);
  });

  test('Voting endpoint /groups/{groupId}/vote should return 404', async () => {
    const event: Partial<APIGatewayProxyEvent> = {
      httpMethod: 'POST',
      path: '/groups/grp_123/vote',
      headers: {},
      requestContext: { requestId: 'req_1' } as any,
      body: JSON.stringify({ productId: 'tv_1', vote: 'APPROVE' })
    };

    const result = await routeRequest(event as APIGatewayProxyEvent, mockCorrelation);
    expect(result.statusCode).toBe(404);
  });
});
