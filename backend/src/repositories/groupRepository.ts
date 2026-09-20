import { PutCommand, GetCommand, QueryCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { ddbDocClient, DYNAMODB_TABLE } from '../services/dynamoClient';
import { Group, Participant } from '@shared/types/session';

export class GroupRepository {
  public async saveGroup(group: Group): Promise<void> {
    await ddbDocClient.send(new PutCommand({
      TableName: DYNAMODB_TABLE,
      Item: {
        PK: `SESSION#${group.groupId}`,
        SK: 'METADATA',
        ...group,
        ttl: Math.floor(Date.now() / 1000) + (24 * 60 * 60),
      },
    }));
  }

  public async saveInviteCode(inviteCode: string, groupId: string): Promise<void> {
    const code = inviteCode.trim().toUpperCase();
    await ddbDocClient.send(new PutCommand({
      TableName: DYNAMODB_TABLE,
      Item: {
        PK: `INVITE#${code}`,
        SK: `SESSION#${groupId}`,
        groupId: groupId,
        GSI1_PK: `INVITE#${code}`,
        GSI1_SK: `SESSION#${groupId}`,
        ttl: Math.floor(Date.now() / 1000) + (24 * 60 * 60),
      },
    }));
  }

  public async getGroupIdByInviteCode(inviteCode: string): Promise<string | null> {
    if (!inviteCode) return null;
    const cleanCode = inviteCode.trim().toUpperCase();

    // 1. Direct group ID format
    if (cleanCode.startsWith('GRP_') || cleanCode.startsWith('grp_')) {
      return inviteCode.trim();
    }

    try {
      // 2. Query Primary Table by PK = INVITE#<CODE>
      const directResult = await ddbDocClient.send(new QueryCommand({
        TableName: DYNAMODB_TABLE,
        KeyConditionExpression: 'PK = :pk',
        ExpressionAttributeValues: {
          ':pk': `INVITE#${cleanCode}`,
        },
      }));

      if (directResult.Items && directResult.Items.length > 0) {
        const item = directResult.Items[0];
        return item.groupId || item.SK?.replace('SESSION#', '') || null;
      }

      // 3. Fallback to GSI1 query
      const gsiResult = await ddbDocClient.send(new QueryCommand({
        TableName: DYNAMODB_TABLE,
        IndexName: 'GSI1',
        KeyConditionExpression: 'GSI1_PK = :code',
        ExpressionAttributeValues: {
          ':code': `INVITE#${cleanCode}`,
        },
      }));

      if (gsiResult.Items && gsiResult.Items.length > 0) {
        const item = gsiResult.Items[0];
        return item.groupId || item.SK?.replace('SESSION#', '') || null;
      }
    } catch (err) {
      console.error('Error fetching group by invite code:', err);
    }

    return null;
  }

  public async saveParticipant(groupId: string, participant: Participant): Promise<void> {
    await ddbDocClient.send(new PutCommand({
      TableName: DYNAMODB_TABLE,
      Item: {
        PK: `SESSION#${groupId}`,
        SK: `PART#${participant.participantId}`,
        GSI1_PK: `PART#${participant.participantId}`,
        GSI1_SK: `SESSION#${groupId}`,
        ...participant,
        ttl: Math.floor(Date.now() / 1000) + (24 * 60 * 60),
      },
    }));
  }

  public async getGroup(groupId: string): Promise<Group | null> {
    const result = await ddbDocClient.send(new GetCommand({
      TableName: DYNAMODB_TABLE,
      Key: { PK: `SESSION#${groupId}`, SK: 'METADATA' },
    }));

    if (!result.Item) return null;
    const { PK, SK, ttl, ...group } = result.Item as any;
    return group as Group;
  }

  public async getGroupByParticipantId(participantId: string): Promise<Group | null> {
    try {
      const result = await ddbDocClient.send(new QueryCommand({
        TableName: DYNAMODB_TABLE,
        IndexName: 'GSI1',
        KeyConditionExpression: 'GSI1_PK = :pk',
        ExpressionAttributeValues: {
          ':pk': `PART#${participantId}`,
        },
      }));

      if (!result.Items || result.Items.length === 0) return null;
      const item = result.Items[0];
      const groupId = item.GSI1_SK?.replace('SESSION#', '') || item.PK?.replace('SESSION#', '');
      if (!groupId) return null;
      return this.getGroup(groupId);
    } catch {
      return null;
    }
  }

  public async getParticipants(groupId: string): Promise<Participant[]> {
    const result = await ddbDocClient.send(new QueryCommand({
      TableName: DYNAMODB_TABLE,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
      ExpressionAttributeValues: {
        ':pk': `SESSION#${groupId}`,
        ':sk': 'PART#',
      },
    }));

    if (!result.Items) return [];
    return result.Items.map((item: any) => {
      const { PK, SK, ttl, ...p } = item;
      return p as Participant;
    });
  }

  public async updateParticipantStatus(groupId: string, participantId: string, status: string): Promise<void> {
    await ddbDocClient.send(new UpdateCommand({
      TableName: DYNAMODB_TABLE,
      Key: { PK: `SESSION#${groupId}`, SK: `PART#${participantId}` },
      UpdateExpression: 'SET #status = :s',
      ExpressionAttributeNames: { '#status': 'status' },
      ExpressionAttributeValues: { ':s': status },
    }));
  }

  public async updateGroupStatus(groupId: string, status: string): Promise<void> {
    await ddbDocClient.send(new UpdateCommand({
      TableName: DYNAMODB_TABLE,
      Key: { PK: `SESSION#${groupId}`, SK: 'METADATA' },
      UpdateExpression: 'SET #status = :s',
      ExpressionAttributeNames: { '#status': 'status' },
      ExpressionAttributeValues: { ':s': status },
    }));
  }
}

export const groupRepository = new GroupRepository();
