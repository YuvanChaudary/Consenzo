import { routeRequest } from '../../src/router';
import { generateSessionToken } from '../../src/middleware/auth';
import { ddbDocClient } from '../../src/services/dynamoClient';
import { APIGatewayProxyEvent } from 'aws-lambda';

jest.mock('../../src/services/dynamoClient', () => ({
  ...jest.requireActual('../../src/services/dynamoClient'),
  ddbDocClient: {
    send: jest.fn(),
  },
}));

describe('Canonical API Contract Enforcement Suite', () => {
  const correlation = { requestId: 'req_contract', correlationId: 'corr_contract' };
  const validToken = generateSessionToken({
    sub: 'usr_test_contract',
    groupId: 'grp_contract_123',
    role: 'COORDINATOR',
    exp: Math.floor(Date.now() / 1000) + 3600,
  });

  const authHeaders = {
    'Authorization': `Bearer ${validToken}`,
    'Content-Type': 'application/json',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (ddbDocClient.send as jest.Mock).mockImplementation((command: any) => {
      const name = command.constructor.name;
      if (name === 'PutCommand') return Promise.resolve({});
      if (name === 'GetCommand') {
        if (command.input?.Key?.PK?.startsWith('PARTICIPANT#')) {
          return Promise.resolve({
            Item: {
              participantId: 'usr_test_contract',
              groupId: 'grp_contract_123',
              constraints: [
                { attribute: 'priceInr', operator: 'LTE', value: 50000, type: 'HARD_CONSTRAINT' }
              ],
              summaryMarkdown: 'Budget constraint',
              confirmedByParticipant: true,
            }
          });
        }
        return Promise.resolve({ Item: { groupId: 'grp_contract_123', title: 'Test Room', status: 'JOINING' } });
      }
      if (name === 'QueryCommand') {
        if (command.input?.IndexName === 'GSI1') {
          return Promise.resolve({ Items: [] });
        }
        return Promise.resolve({ Items: [{ participantId: 'usr_test_contract', displayName: 'TestUser' }] });
      }
      return Promise.resolve({});
    });
  });

  test('Contract 1: OPTIONS Preflight returns 200 with CORS headers', async () => {
    const event: any = {
      httpMethod: 'OPTIONS',
      path: '/groups',
      headers: {},
      requestContext: { requestId: 'req_opts' },
    };
    const res = await routeRequest(event, correlation);
    expect(res.statusCode).toBe(200);
    expect(res.headers?.['Access-Control-Allow-Origin']).toBe('*');
    expect(res.headers?.['Access-Control-Allow-Methods']).toContain('POST');
  });

  test('Contract 2: POST /groups creates group and issues creator token', async () => {
    const event: any = {
      httpMethod: 'POST',
      path: '/groups',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Contract Test Room',
        category: 'smart_tvs',
        creatorDisplayName: 'HostUser',
        targetParticipantCount: 4,
      }),
      requestContext: { requestId: 'req_c1' },
    };
    const res = await routeRequest(event, correlation);
    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.body);
    expect(body.data).toBeDefined();
    expect(body.data.groupId).toMatch(/^grp_/);
    expect(body.data.token).toBeDefined();
    expect(body.data.creator.displayName).toBe('HostUser');
    expect(body.data.creator.role).toBe('COORDINATOR');
    expect(body.data.inviteCode).toBeDefined();
    expect(body.data.inviteUrl).toContain('/join/');
  });

  test('Contract 3: POST /groups/join and POST /groups/{groupId}/join both route correctly', async () => {
    const eventJoinRoot: any = {
      httpMethod: 'POST',
      path: '/groups/join',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inviteCode: 'TV-INVALID', displayName: 'Joiner' }),
      requestContext: { requestId: 'req_c2' },
    };
    const resRoot = await routeRequest(eventJoinRoot, correlation);
    // Should hit join handler and return 400 with INVALID_INVITE error, NOT 404
    expect(resRoot.statusCode).toBe(400);
    const errRoot = JSON.parse(resRoot.body);
    expect(errRoot.error.code).toBe('INVALID_INVITE');

    const eventJoinParam: any = {
      httpMethod: 'POST',
      path: '/groups/grp_123/join',
      pathParameters: { groupId: 'grp_123' },
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ displayName: 'Joiner' }),
      requestContext: { requestId: 'req_c3' },
    };
    const resParam = await routeRequest(eventJoinParam, correlation);
    expect(resParam.statusCode).toBe(400);
    const errParam = JSON.parse(resParam.body);
    expect(errParam.error.code).toBe('INVALID_INVITE');
  });

  test('Contract 4: POST /conversations starts interview with initialMessage and participantId', async () => {
    const event: any = {
      httpMethod: 'POST',
      path: '/conversations',
      headers: authHeaders,
      body: JSON.stringify({ category: 'smart_tvs' }),
      requestContext: { requestId: 'req_conv' },
    };
    const res = await routeRequest(event, correlation);
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.data.conversationId).toBeDefined();
    expect(body.data.participantId).toBe('usr_test_contract');
    expect(body.data.initialMessage).toBeDefined();
    expect(body.data.turnCount).toBe(1);
  });

  test('Contract 5: GET /participants/{participantId}/preferences returns preference structure', async () => {
    const event: any = {
      httpMethod: 'GET',
      path: '/participants/usr_test_contract/preferences',
      headers: authHeaders,
      pathParameters: { participantId: 'usr_test_contract' },
      requestContext: { requestId: 'req_pref' },
    };
    const res = await routeRequest(event, correlation);
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.data.participantId).toBe('usr_test_contract');
    expect(Array.isArray(body.data.constraints)).toBe(true);
    expect(body.data.summaryMarkdown).toBeDefined();
  });

  test('Contract 6: POST /participants/{participantId}/preferences/confirm supports empty body ratification', async () => {
    const event: any = {
      httpMethod: 'POST',
      path: '/participants/usr_test_contract/preferences/confirm',
      headers: authHeaders,
      pathParameters: { participantId: 'usr_test_contract' },
      body: '',
      requestContext: { requestId: 'req_conf' },
    };
    const res = await routeRequest(event, correlation);
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.data.confirmed).toBe(true);
    expect(body.data.readiness).toBeDefined();
  });

  test('Contract 7: Cross-participant authorization denial (ADR-007 isolation)', async () => {
    const event: any = {
      httpMethod: 'GET',
      path: '/participants/usr_other_person/preferences',
      headers: authHeaders, // Token is for usr_test_contract
      pathParameters: { participantId: 'usr_other_person' },
      requestContext: { requestId: 'req_deny' },
    };
    const res = await routeRequest(event, correlation);
    expect(res.statusCode).toBe(403);
    const body = JSON.parse(res.body);
    expect(body.error.code).toBe('FORBIDDEN');
  });

  test('Contract 8: Non-existent route returns 404 with standard envelope', async () => {
    const event: any = {
      httpMethod: 'GET',
      path: '/unknown/nonexistent/endpoint',
      headers: {},
      requestContext: { requestId: 'req_404' },
    };
    const res = await routeRequest(event, correlation);
    expect(res.statusCode).toBe(404);
    const body = JSON.parse(res.body);
    expect(body.error.code).toBe('NOT_FOUND');
    expect(body.meta).toBeDefined();
  });

  test('Contract 9: POST /groups/{groupId}/analysis runs deterministic engine', async () => {
    const event: any = {
      httpMethod: 'POST',
      path: '/groups/grp_contract_123/analysis',
      headers: authHeaders,
      pathParameters: { groupId: 'grp_contract_123' },
      body: JSON.stringify({ forceRerun: true }),
      requestContext: { requestId: 'req_ana' },
    };
    const res = await routeRequest(event, correlation);
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.data.analysisId).toBeDefined();
    expect(body.data.groupId).toBe('grp_contract_123');
    expect(Array.isArray(body.data.topRecommendations)).toBe(true);
    expect(body.data.topRecommendations.length).toBeGreaterThanOrEqual(1);
    expect(body.data.topRecommendations[0].paretoSlot).toBe('BEST_CONSENSUS');
    expect(body.data.conflictsDetected).toBeDefined();
  });

  test('Contract 10: POST /groups/{groupId}/votes submits vote with Zero Client Trust token', async () => {
    const event: any = {
      httpMethod: 'POST',
      path: '/groups/grp_contract_123/votes',
      headers: authHeaders,
      pathParameters: { groupId: 'grp_contract_123' },
      body: JSON.stringify({
        asin: 'B08L5WH529',
        verdict: 'ACCEPT',
      }),
      requestContext: { requestId: 'req_vote' },
    };
    const res = await routeRequest(event, correlation);
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.data.recorded).toBe(true);
    expect(body.data.participantId).toBe('usr_test_contract');
    expect(body.data.tally).toBeDefined();
  });
});
