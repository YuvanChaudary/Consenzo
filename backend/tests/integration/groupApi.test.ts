import { routeRequest } from '../../src/router';
import { getCorrelationContext } from '../../src/middleware/correlation';
import { ddbDocClient } from '../../src/services/dynamoClient';

jest.mock('../../src/services/dynamoClient', () => ({
  ...jest.requireActual('../../src/services/dynamoClient'),
  ddbDocClient: {
    send: jest.fn(),
  },
}));

describe('Group API Integration', () => {
  const mockCorrelation = {
    requestId: 'req_123',
    correlationId: 'corr_456',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (ddbDocClient.send as jest.Mock).mockImplementation((command: any) => {
      const commandName = command.constructor.name;
      console.log(`Mock DynamoDB call: ${commandName}`, command);
      if (commandName === 'PutCommand') {
        return Promise.resolve({ Attributes: { groupId: 'grp_mock_123' } });
      }
      if (commandName === 'GetCommand') {
        const groupId = command.input?.Key?.PK?.replace('SESSION#', '');
        console.log(`Mock GetCommand for groupId: ${groupId}`);
        return Promise.resolve({
          Item: {
            groupId,
            title: 'Mock Group',
            creatorName: 'Admin',
            roster: [{ participantId: 'usr_mock_123', displayName: 'Admin' }],
          },
        });
      }
      if (commandName === 'QueryCommand') {
        if (command.input?.IndexName === 'GSI1') {
          const inviteCode = command.input?.ExpressionAttributeValues?.[':code']?.replace('INVITE#', '');
          console.log(`Mock QueryCommand (GSI1) for inviteCode: ${inviteCode}`);
          return Promise.resolve({
            Items: [{ SK: `SESSION#${inviteCode}` }],
          });
        }
        console.log(`Mock QueryCommand (Participants) for PK: ${command.input?.ExpressionAttributeValues?.[':pk']}`);
        return Promise.resolve({
          Items: [{ participantId: 'usr_mock_123', displayName: 'Admin' }],
        });
      }
      return Promise.resolve({});
    });
  });

  test('POST /groups should create a group', async () => {
    const event: any = {
      httpMethod: 'POST',
      path: '/groups',
      body: JSON.stringify({
        title: 'Living Room TV',
        category: 'smart_tvs',
        creatorName: 'Dad',
      }),
      requestContext: { requestId: 'req_123' },
      headers: {},
    };

    const response = await routeRequest(event, mockCorrelation);
    expect(response.statusCode).toBe(201);
    const body = JSON.parse(response.body || '{}');
    expect(body.data).toHaveProperty('groupId');
    expect(body.data).toHaveProperty('creatorToken');
  });

  test('POST /groups/join should add a participant', async () => {
    // First create a group to get an invite code (or use the one from previous test)
    const createEvent: any = {
      httpMethod: 'POST',
      path: '/groups',
      body: JSON.stringify({
        title: 'Test Group',
        category: 'smart_tvs',
        creatorName: 'Admin',
      }),
      requestContext: { requestId: 'req_1' },
      headers: {},
    };
    const createRes = await routeRequest(createEvent, mockCorrelation);
    const { groupId } = JSON.parse(createRes.body || '{}').data;

    const joinEvent: any = {
      httpMethod: 'POST',
      path: '/groups/join',
      body: JSON.stringify({
        inviteCode: groupId, // In current implementation, inviteCode = groupId
        displayName: 'Son',
      }),
      requestContext: { requestId: 'req_2' },
      headers: {},
    };

    const response = await routeRequest(joinEvent, mockCorrelation);
    expect(response.statusCode).toBe(201);
    const body = JSON.parse(response.body || '{}');
    expect(body.data).toHaveProperty('participantId');
    expect(body.data).toHaveProperty('participantToken');
  });

  test('GET /groups/{groupId} should return group status', async () => {
    const createEvent: any = {
      httpMethod: 'POST',
      path: '/groups',
      body: JSON.stringify({
        title: 'Status Group',
        category: 'smart_tvs',
        creatorName: 'Admin',
      }),
      requestContext: { requestId: 'req_3' },
      headers: {},
    };
    const createRes = await routeRequest(createEvent, mockCorrelation);
    const { groupId } = JSON.parse(createRes.body || '{}').data;

    const getEvent: any = {
      httpMethod: 'GET',
      path: `/groups/${groupId}`,
      pathParameters: { groupId },
      requestContext: { requestId: 'req_4' },
      headers: {},
    };

    const response = await routeRequest(getEvent, mockCorrelation);
    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body || '{}');
    expect(body.data.group.groupId).toBe(groupId);
    expect(body.data.roster.length).toBe(1);
  });
});
