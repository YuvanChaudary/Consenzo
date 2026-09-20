import { PutCommand, QueryCommand, GetCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { ddbDocClient, DYNAMODB_TABLE } from '../services/dynamoClient';
import { ParticipantPreferenceProfile, CanonicalConstraint } from '@shared/types/preferences';
import { groupRepository } from './groupRepository';

/**
 * Single-table access layer for interview conversations, confirmed preference
 * profiles, group feed events, and persisted analysis results.
 *
 * Key design (fixes cross-group context bleed):
 *   PK: GROUP#<groupId>                     SK: CONV#<participantId>#MSG#<ts>   — chat turns
 *   PK: GROUP#<groupId>                     SK: CONV#<participantId>#META       — resume token
 *   PK: GROUP#<groupId>                     SK: PREF#<participantId>            — confirmed profile
 *   PK: GROUP#<groupId>                     SK: EVT#<ts>#<participantId>        — group feed events
 *   PK: GROUP#<groupId>                     SK: ANALYSIS#latest                 — persisted analysis
 *   GSI1_PK: PART#<participantId>           GSI1_SK: GROUP#<groupId>            — reverse lookup
 * Legacy keys (PARTICIPANT#...) are still readable for migration safety.
 */
export class PreferenceRepository {
  private now(): number {
    return Date.now();
  }

  // ─── Chat messages (group + participant scoped) ────────────────────────────

  public async saveMessage(groupId: string, participantId: string, role: 'user' | 'assistant', content: string): Promise<void> {
    const ts = this.now();
    await ddbDocClient.send(new PutCommand({
      TableName: DYNAMODB_TABLE,
      Item: {
        PK: `GROUP#${groupId}`,
        SK: `CONV#${participantId}#MSG#${ts}`,
        role,
        content,
        timestamp: new Date(ts).toISOString(),
        GSI1_PK: `PART#${participantId}`,
        GSI1_SK: `GROUP#${groupId}`,
      },
    }));
  }

  /** Get the chat history for one participant inside one group (newest last). */
  public async getMessages(groupId: string, participantId: string): Promise<Array<{ role: 'user' | 'assistant'; content: string; timestamp: string }>> {
    const result = await ddbDocClient.send(new QueryCommand({
      TableName: DYNAMODB_TABLE,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
      ExpressionAttributeValues: {
        ':pk': `GROUP#${groupId}`,
        ':sk': `CONV#${participantId}#MSG#`,
      },
      ScanIndexForward: true,
    }));

    return (result.Items || []).map((item: any) => ({
      role: item.role,
      content: item.content,
      timestamp: item.timestamp,
    }));
  }

  /** Legacy reader: pre-redesign transcripts stored under PARTICIPANT#<id>. */
  public async getLegacyMessages(participantId: string): Promise<Array<{ role: 'user' | 'assistant'; content: string; timestamp: string }>> {
    const result = await ddbDocClient.send(new QueryCommand({
      TableName: DYNAMODB_TABLE,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
      ExpressionAttributeValues: {
        ':pk': `PARTICIPANT#${participantId}`,
        ':sk': 'MSG#',
      },
      ScanIndexForward: true,
    }));
    return (result.Items || []).map((item: any) => ({
      role: item.role,
      content: item.content,
      timestamp: item.timestamp,
    }));
  }

  /** Resume marker: remembers that a conversation was opened for (group, participant). */
  public async touchConversationMeta(groupId: string, participantId: string): Promise<void> {
    await ddbDocClient.send(new PutCommand({
      TableName: DYNAMODB_TABLE,
      Item: {
        PK: `GROUP#${groupId}`,
        SK: `CONV#${participantId}#META`,
        startedAt: new Date().toISOString(),
        GSI1_PK: `PART#${participantId}`,
        GSI1_SK: `GROUP#${groupId}`,
      },
    }));
  }

  public async hasConversation(groupId: string, participantId: string): Promise<boolean> {
    const result = await ddbDocClient.send(new GetCommand({
      TableName: DYNAMODB_TABLE,
      Key: { PK: `GROUP#${groupId}`, SK: `CONV#${participantId}#META` },
    }));
    if (result.Item) return true;
    // Also treat any existing messages as proof of an open conversation.
    const msgs = await this.getMessages(groupId, participantId);
    return msgs.length > 0;
  }

  // ─── Preference profiles (draft → confirmed) ───────────────────────────────
  //
  // A single record per (group, participant) is the source of truth:
  //   SK: PREF#<participantId>, field confirmedByParticipant: boolean
  // The interview writes the DRAFT as constraints are extracted; confirmation
  // flips the flag. Analysis reads only CONFIRMED profiles, so the roster gate
  // (every member must confirm) still holds.

  /**
   * Merge incoming constraints into the existing list. Identity is
   * (attribute, operator); the newest extraction wins so a later clarification
   * ("actually 32GB") supersedes the earlier one ("16GB") instead of both
   * being enforced at once.
   */
  private mergeConstraints(
    existing: CanonicalConstraint[] = [],
    incoming: CanonicalConstraint[] = []
  ): CanonicalConstraint[] {
    const byKey = new Map<string, CanonicalConstraint>();
    const keyOf = (c: CanonicalConstraint) => `${c.attribute}::${c.operator}`;
    for (const c of existing) byKey.set(keyOf(c), c);
    for (const c of incoming) byKey.set(keyOf(c), c);
    return Array.from(byKey.values());
  }

  public async savePreferenceProfile(profile: ParticipantPreferenceProfile): Promise<void> {
    await ddbDocClient.send(new PutCommand({
      TableName: DYNAMODB_TABLE,
      Item: {
        PK: `GROUP#${profile.groupId}`,
        SK: `PREF#${profile.participantId}`,
        ...profile,
        confirmedByParticipant: profile.confirmedByParticipant ?? false,
        GSI1_PK: `PART#${profile.participantId}`,
        GSI1_SK: `GROUP#${profile.groupId}`,
      },
    }));
  }

  /**
   * Persist newly extracted constraints as the participant's DRAFT profile,
   * merging with whatever was already captured. Called on every interview turn
   * so the profile is durable and survives reloads/resumes.
   */
  public async saveDraftProfile(input: {
    groupId: string;
    participantId: string;
    constraints: CanonicalConstraint[];
    summaryMarkdown?: string;
  }): Promise<void> {
    const existing = await this.getProfile(input.groupId, input.participantId);
    const merged = this.mergeConstraints(existing?.constraints, input.constraints);

    await ddbDocClient.send(new PutCommand({
      TableName: DYNAMODB_TABLE,
      Item: {
        PK: `GROUP#${input.groupId}`,
        SK: `PREF#${input.participantId}`,
        participantId: input.participantId,
        groupId: input.groupId,
        constraints: merged,
        summaryMarkdown: input.summaryMarkdown ?? existing?.summaryMarkdown ?? '',
        // Never silently un-confirm a profile that was already locked.
        confirmedByParticipant: existing?.confirmedByParticipant ?? false,
        updatedAt: new Date().toISOString(),
        GSI1_PK: `PART#${input.participantId}`,
        GSI1_SK: `GROUP#${input.groupId}`,
      },
    }));
  }

  /** Raw profile record (draft or confirmed). Never throws on partial data. */
  public async getProfile(groupId: string, participantId: string): Promise<ParticipantPreferenceProfile | null> {
    const result = await ddbDocClient.send(new GetCommand({
      TableName: DYNAMODB_TABLE,
      Key: { PK: `GROUP#${groupId}`, SK: `PREF#${participantId}` },
    }));
    if (!result.Item) return null;
    const { PK, SK, GSI1_PK, GSI1_SK, ...profile } = result.Item as any;
    // Defensive: a stored item without a constraints array is corrupt/legacy —
    // it must never masquerade as a real profile.
    if (!Array.isArray(profile.constraints)) return null;
    return profile as ParticipantPreferenceProfile;
  }

  /** Only CONFIRMED profiles — the contract the analysis engine depends on. */
  public async getConfirmedProfile(groupId: string, participantId: string): Promise<ParticipantPreferenceProfile | null> {
    const profile = await this.getProfile(groupId, participantId);
    if (!profile) return null;
    if ((profile as any).confirmedByParticipant !== true) return null;
    return profile;
  }

  /** Back-compat: resolve the profile via GSI when the group id is unknown. */
  public async getConfirmedProfileByParticipant(participantId: string): Promise<ParticipantPreferenceProfile | null> {
    const result = await ddbDocClient.send(new QueryCommand({
      TableName: DYNAMODB_TABLE,
      IndexName: 'GSI1',
      KeyConditionExpression: 'GSI1_PK = :pk AND begins_with(GSI1_SK, :prefix)',
      ExpressionAttributeValues: {
        ':pk': `PART#${participantId}`,
        ':prefix': 'GROUP#',
      },
    }));
    const items = result.Items || [];
    for (const item of items) {
      const groupId = String(item.GSI1_SK || '').replace('GROUP#', '');
      if (!groupId) continue;
      const profile = await this.getConfirmedProfile(groupId, participantId);
      if (profile) return profile;
    }
    return null;
  }

  public async confirmAndCheckReadiness(profile: ParticipantPreferenceProfile): Promise<{ ready: boolean; groupId: string }> {
    // 1. Promote the stored draft + any supplied profile to CONFIRMED, merging
    //    so the interview's extracted constraints are never lost on confirm.
    const draft = await this.getProfile(profile.groupId, profile.participantId);
    const mergedConstraints = this.mergeConstraints(draft?.constraints, profile.constraints);
    await this.savePreferenceProfile({
      ...profile,
      constraints: mergedConstraints,
      confirmedByParticipant: true,
    } as ParticipantPreferenceProfile);

    const groupId = profile.groupId;
    if (!groupId) return { ready: false, groupId: '' };

    // 2. Mark the participant CONFIRMED on the roster
    await groupRepository.updateParticipantStatus(groupId, profile.participantId, 'CONFIRMED');

    // 3. Emit a group feed event so other members see the confirmation
    const group = await groupRepository.getGroup(groupId);
    await this.addGroupEvent(groupId, profile.participantId, 'PREF_CONFIRMED',
      `confirmed their preferences for ${group?.category === 'laptops' ? 'the laptop' : group?.category === 'soundbars' ? 'the soundbar' : 'the TV'}`);

    // 4. Check whether every roster member has confirmed
    const participants = await groupRepository.getParticipants(groupId);
    const profiles = await Promise.all(participants.map(p => this.getConfirmedProfile(groupId, p.participantId)));
    const confirmedCount = profiles.filter(Boolean).length;
    const isReady = participants.length > 0 && confirmedCount === participants.length;

    if (isReady) {
      await groupRepository.updateGroupStatus(groupId, 'READY_FOR_ANALYSIS');
      await this.addGroupEvent(groupId, 'system', 'ALL_READY',
        'All members confirmed — the group consensus analysis is ready to run');
    }

    return { ready: isReady, groupId };
  }

  // ─── Group feed events (chat system messages) ──────────────────────────────

  public async addGroupEvent(groupId: string, actorId: string, type: string, text: string, meta?: Record<string, any>): Promise<void> {
    const ts = this.now();
    await ddbDocClient.send(new PutCommand({
      TableName: DYNAMODB_TABLE,
      Item: {
        PK: `GROUP#${groupId}`,
        SK: `EVT#${ts}#${actorId}`,
        type,
        actorId,
        text,
        ...(meta ? { meta } : {}),
        timestamp: new Date(ts).toISOString(),
      },
    }));
  }

  public async getGroupEvents(groupId: string, sinceTs?: number): Promise<any[]> {
    const result = await ddbDocClient.send(new QueryCommand({
      TableName: DYNAMODB_TABLE,
      KeyConditionExpression: sinceTs
        ? 'PK = :pk AND SK > :since'
        : 'PK = :pk AND begins_with(SK, :prefix)',
      ExpressionAttributeValues: sinceTs
        ? { ':pk': `GROUP#${groupId}`, ':since': `EVT#${sinceTs}` }
        : { ':pk': `GROUP#${groupId}`, ':prefix': 'EVT#' },
      ScanIndexForward: true,
    }));
    return (result.Items || []).map((item: any) => ({
      id: item.SK,
      type: item.type,
      actorId: item.actorId,
      text: item.text,
      meta: item.meta,
      timestamp: item.timestamp,
    }));
  }

  // ─── Persisted analysis results ────────────────────────────────────────────

  public async saveAnalysis(groupId: string, analysis: any): Promise<void> {
    await ddbDocClient.send(new PutCommand({
      TableName: DYNAMODB_TABLE,
      Item: {
        PK: `GROUP#${groupId}`,
        SK: 'ANALYSIS#latest',
        ...analysis,
        GSI1_PK: `GROUP#${groupId}`,
        GSI1_SK: 'ANALYSIS#latest',
        computedAt: new Date().toISOString(),
      },
    }));
  }

  public async getLatestAnalysis(groupId: string): Promise<any | null> {
    const result = await ddbDocClient.send(new GetCommand({
      TableName: DYNAMODB_TABLE,
      Key: { PK: `GROUP#${groupId}`, SK: 'ANALYSIS#latest' },
    }));
    if (!result.Item) return null;
    const { PK, SK, GSI1_PK, GSI1_SK, ...analysis } = result.Item as any;
    return analysis;
  }

  public async invalidateAnalysis(groupId: string): Promise<void> {
    try {
      await ddbDocClient.send(new DeleteCommand({
        TableName: DYNAMODB_TABLE,
        Key: { PK: `GROUP#${groupId}`, SK: 'ANALYSIS#latest' },
      }));
    } catch {}
  }
}

export const preferenceRepository = new PreferenceRepository();
