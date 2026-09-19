import { PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { ddbDocClient, DYNAMODB_TABLE } from '../services/dynamoClient';
import { groupRepository } from '../repositories/groupRepository';

export interface Vote {
  participantId: string;
  productId: string;
  timestamp: string;
}

export interface VoteTallyResult {
  groupId: string;
  productId: string;
  approvalsCount: number;
  totalParticipants: number;
  isUnanimous: boolean;
  decisionStatus: 'DECIDED' | 'PENDING';
}

export class VotingService {
  public async castVote(groupId: string, participantId: string, productId: string): Promise<void> {
    await ddbDocClient.send(new PutCommand({
      TableName: DYNAMODB_TABLE,
      Item: {
        PK: `SESSION#${groupId}`,
        SK: `VOTE#${participantId}`,
        productId,
        timestamp: new Date().toISOString(),
        ttl: Math.floor(Date.now() / 1000) + (24 * 60 * 60),
      },
    }));
  }

  public async getVotes(groupId: string): Promise<Vote[]> {
    const result = await ddbDocClient.send(new QueryCommand({
      TableName: DYNAMODB_TABLE,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
      ExpressionAttributeValues: {
        ':pk': `SESSION#${groupId}`,
        ':sk': 'VOTE#',
      },
    }));

    if (!result.Items) return [];
    return result.Items.map((item: any) => ({
      participantId: item.SK?.replace('VOTE#', '') || '',
      productId: item.productId,
      timestamp: item.timestamp,
    })) as Vote[];
  }

  public async castVoteAndTally(groupId: string, participantId: string, productId: string): Promise<VoteTallyResult> {
    await this.castVote(groupId, participantId, productId);

    const [participants, votes] = await Promise.all([
      groupRepository.getParticipants(groupId),
      this.getVotes(groupId),
    ]);

    const totalParticipants = Math.max(participants.length, 1);
    const approvals = votes.filter(v => v.productId === productId).length;
    const isUnanimous = totalParticipants > 0 && approvals >= totalParticipants;

    if (isUnanimous) {
      await groupRepository.updateGroupStatus(groupId, 'DECIDED');
    }

    return {
      groupId,
      productId,
      approvalsCount: approvals,
      totalParticipants,
      isUnanimous,
      decisionStatus: isUnanimous ? 'DECIDED' : 'PENDING',
    };
  }
}

export const votingService = new VotingService();
