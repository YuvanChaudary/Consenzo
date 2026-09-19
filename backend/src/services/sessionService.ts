import { randomUUID } from 'crypto';
const uuidv4 = randomUUID;
import { Group, Participant, SessionTokenPayload } from '@shared/types/session';
import { generateSessionToken } from '../middleware/auth';
import { groupRepository } from '../repositories/groupRepository';

export interface SessionServiceResult {
  group: Group;
  participant: Participant;
  token: string;
  inviteCode?: string;
}

export class SessionService {
  public async createGroup(title: string, category: string, creatorDisplayName: string, targetCount: number = 4): Promise<SessionServiceResult> {
    const groupId = `grp_${uuidv4().slice(0, 8)}`;
    const inviteCode = `TV-${Math.random().toString(36).toUpperCase().slice(2, 6)}`;

    const group: Group = {
      groupId,
      title,
      category,
      status: 'JOINING',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };

    const creatorId = `usr_${uuidv4().slice(0, 8)}`;
    const creator: Participant = {
      participantId: creatorId,
      displayName: creatorDisplayName,
      role: 'COORDINATOR',
      status: 'JOINED',
      joinedAt: new Date().toISOString(),
    };

    const token = generateSessionToken({
      sub: creatorId,
      groupId,
      role: 'COORDINATOR',
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60),
    });

    await groupRepository.saveGroup(group);
    await groupRepository.saveInviteCode(inviteCode, groupId);
    await groupRepository.saveParticipant(groupId, creator);

    return { group, participant: creator, token, inviteCode };
  }

  public async joinGroup(inviteCode: string, displayName: string): Promise<SessionServiceResult> {
    const groupId = await groupRepository.getGroupIdByInviteCode(inviteCode);
    if (!groupId) {
      throw new Error('Invalid invite code');
    }

    const group = await groupRepository.getGroup(groupId);
    if (!group) {
      throw new Error('Group no longer exists');
    }

    const participantId = `usr_${uuidv4().slice(0, 8)}`;
    const participant: Participant = {
      participantId,
      displayName,
      role: 'PARTICIPANT',
      status: 'JOINED',
      joinedAt: new Date().toISOString(),
    };

    const token = generateSessionToken({
      sub: participantId,
      groupId,
      role: 'PARTICIPANT',
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60),
    });

    await groupRepository.saveParticipant(groupId, participant);

    const members = await groupRepository.getParticipants(groupId);
    if (members.length >= 2) {
      await groupRepository.updateGroupStatus(groupId, 'INTERVIEWING');
    }

    return { group, participant, token, inviteCode };
  }

  public async getGroupStatus(groupId: string) {
    const group = await groupRepository.getGroup(groupId);
    if (!group) {
      throw new Error('Group not found');
    }

    const roster = await groupRepository.getParticipants(groupId);

    return {
      groupId: group.groupId,
      title: group.title,
      category: group.category,
      status: group.status,
      targetParticipantCount: 4,
      group,
      roster,
    };
  }
}

export const sessionService = new SessionService();
