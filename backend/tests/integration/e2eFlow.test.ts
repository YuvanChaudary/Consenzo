import { routeRequest } from '../../src/router';
import { ddbDocClient } from '../../src/services/dynamoClient';
import { NvidiaLLMProvider } from '../../src/services/llm/nvidiaProvider';

jest.mock('../../src/services/dynamoClient', () => ({
  ...jest.requireActual('../../src/services/dynamoClient'),
  ddbDocClient: {
    send: jest.fn(),
  },
}));

jest.mock('../../src/services/llm/nvidiaProvider', () => {
  return {
    NvidiaLLMProvider: jest.fn().mockImplementation(() => ({
      providerName: 'nvidia',
      modelId: 'nvidia/nemotron-3.5-lightning-30b-a3b',
      generateText: jest.fn().mockResolvedValue('Mocked LLM Response'),
      extractStructuredPreferences: jest.fn().mockResolvedValue({
        reply: 'I have extracted your preferences.',
        extractedPreferences: {
          constraints: [{ attribute: 'brand', value: 'Samsung', type: 'PREFERENCE' }],
        },
        isReadyForSummary: true,
      }),
      generateExplanation: jest.fn().mockResolvedValue('LG NanoCell delivers optimal group consensus satisfying Dad, Mom, and Son.'),
      healthCheck: jest.fn().mockResolvedValue({ ok: true, latencyMs: 120 }),
    })),
  };
});

describe('Full E2E Flow Verification', () => {
  const mockCorrelation = { requestId: 'req_e2e', correlationId: 'corr_e2e' };

  beforeEach(() => {
    jest.clearAllMocks();
    (ddbDocClient.send as jest.Mock).mockImplementation((command: any) => {
      const commandName = command.constructor.name;
      if (commandName === 'PutCommand') return Promise.resolve({});
      if (commandName === 'GetCommand') {
        const sk = command.input?.Key?.SK || '';
        if (typeof sk === 'string' && sk.startsWith('PREF#')) {
          return Promise.resolve({
            Item: {
              participantId: 'usr_e2e',
              groupId: 'grp_e2e',
              constraints: [
                { attribute: 'priceInr', operator: 'LTE', value: 55000, type: 'HARD_CONSTRAINT' },
                { attribute: 'brand', operator: 'EQ', value: 'Samsung', type: 'PREFERENCE' },
              ],
              summaryMarkdown: 'Budget under 55k, brand Samsung',
              confirmedByParticipant: true,
            },
          });
        }
        return Promise.resolve({ Item: { groupId: 'grp_e2e', title: 'E2E Group', status: 'JOINING' } });
      }
      if (commandName === 'QueryCommand') {
        if (command.input?.IndexName === 'GSI1') {
          return Promise.resolve({ Items: [{ SK: 'SESSION#grp_e2e' }] });
        }
        return Promise.resolve({ Items: [{ participantId: 'usr_e2e', displayName: 'User', status: 'CONFIRMED' }] });
      }
      return Promise.resolve({});
    });
  });

  test('should complete the full flow from group creation to voting', async () => {
    // 1. Create Group
    const createEvent: any = {
      httpMethod: 'POST',
      path: '/groups',
      body: JSON.stringify({ title: 'E2E Group', category: 'smart_tvs', creatorName: 'Admin' }),
      requestContext: { requestId: 'req_1' },
      headers: {},
    };
    const createRes = await routeRequest(createEvent, mockCorrelation);
    expect(createRes.statusCode).toBe(201);
    const { groupId } = JSON.parse(createRes.body || '{}').data;

    // 2. Join Group
    const joinEvent: any = {
      httpMethod: 'POST',
      path: '/groups/join',
      body: JSON.stringify({ inviteCode: groupId, displayName: 'Participant' }),
      requestContext: { requestId: 'req_2' },
      headers: {},
    };
    const joinRes = await routeRequest(joinEvent, mockCorrelation);
    expect(joinRes.statusCode).toBe(201);

    // 3. Run Analysis (which involves LLM)
    const analysisEvent: any = {
      httpMethod: 'POST',
      path: `/groups/${groupId}/analysis`,
      pathParameters: { groupId },
      requestContext: { requestId: 'req_3' },
      headers: {},
    };
    const analysisRes = await routeRequest(analysisEvent, mockCorrelation);
    expect(analysisRes.statusCode).toBe(200);
    expect(JSON.parse(analysisRes.body || '{}').data).toBeDefined();

    // 4. Cast Vote
    const voteEvent: any = {
      httpMethod: 'POST',
      path: `/groups/${groupId}/votes`,
      pathParameters: { groupId },
      body: JSON.stringify({ productId: 'prod_123', participantId: 'usr_e2e' }),
      requestContext: { requestId: 'req_4' },
      headers: {},
    };
    const voteRes = await routeRequest(voteEvent, mockCorrelation);
    expect(voteRes.statusCode).toBe(200);
  });
});
