import { PutCommand, QueryCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { ddbDocClient, DYNAMODB_TABLE } from '../services/dynamoClient';
import { ParticipantPreferenceProfile } from '@shared/types/preferences';
import { groupRepository } from './groupRepository';

export class PreferenceRepository {
  public async saveMessage(participantId: string, message: any): Promise<void> {
    await ddbDocClient.send(new PutCommand({
      TableName: DYNAMODB_TABLE,
      Item: {
        PK: `PARTICIPANT#${participantId}`,
        SK: `MSG#${Date.now()}`,
        ...message,
      },
    }));
  }

  public async getMessages(participantId: string): Promise<any[]> {
    const result = await ddbDocClient.send(new QueryCommand({
      TableName: DYNAMODB_TABLE,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
      ExpressionAttributeValues: {
        ':pk': `PARTICIPANT#${participantId}`,
        ':sk': 'MSG#',
      },
    }));

    if (!result.Items) return [];
    return result.Items.map((item: any) => {
      const { PK, SK, ...msg } = item;
      return msg;
    });
  }

  public async savePreferenceProfile(profile: ParticipantPreferenceProfile): Promise<void> {
    await ddbDocClient.send(new PutCommand({
      TableName: DYNAMODB_TABLE,
      Item: {
        PK: `PARTICIPANT#${profile.participantId}`,
        SK: 'PREF#confirmed',
        ...profile,
      },
    }));
  }

  public async getConfirmedProfile(participantId: string): Promise<ParticipantPreferenceProfile | null> {
    const result = await ddbDocClient.send(new GetCommand({
      TableName: DYNAMODB_TABLE,
      Key: { PK: `PARTICIPANT#${participantId}`, SK: 'PREF#confirmed' },
    }));

    if (!result.Item) return null;
    const { PK, SK, ...profile } = result.Item as any;
    return profile as ParticipantPreferenceProfile;
  }

  public async confirmAndCheckReadiness(participantId: string, profile: ParticipantPreferenceProfile): Promise<{ ready: boolean }> {
    // 1. Save confirmed profile
    await this.savePreferenceProfile(profile);

    // 2. Find group for this participant
    // Note: This requires a GSI on ParticipantId or a cross-reference table.
    // For MVP, we'll search for the SESSION# groupId in the participant's data.
    const result = await ddbDocClient.send(new QueryCommand({
      TableName: DYNAMODB_TABLE,
      IndexName: 'GSI1',
      KeyConditionExpression: 'GSI1_PK = :pk',
      ExpressionAttributeValues: {
        ':pk': `PART#${participantId}`,
      },
    }));

    if (!result.Items || result.Items.length === 0) {
      return { ready: false };
    }

    const groupId = result.Items[0].SK?.replace('SESSION#', '');
    if (!groupId) return { ready: false };

    // 3. Check if all participants in group are confirmed
    const participants = await groupRepository.getParticipants(groupId);
    const confirmedCount = await Promise.all(
      participants.map(p => this.getConfirmedProfile(p.participantId))
    ).then(res => res.filter(Boolean).length);

    const isReady = confirmedCount === participants.length;
    if (isReady) {
      await groupRepository.updateGroupStatus(groupId, 'READY_FOR_ANALYSIS');
    }

    return { ready: isReady };
  }
}

export const preferenceRepository = new PreferenceRepository();
