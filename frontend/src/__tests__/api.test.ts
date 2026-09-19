import { describe, it, expect, beforeEach } from 'vitest';
import { api } from '../services/api';

describe('Frontend API Service (Canonical Contracts & Mock Mode)', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('creates a decision room and issues creator token', async () => {
    const res = await api.createGroup({
      title: 'Family Living Room TV',
      creatorDisplayName: 'Dad',
      targetParticipantCount: 4
    });

    expect(res.groupId).toBeDefined();
    expect(res.title).toBe('Family Living Room TV');
    expect(res.inviteCode).toMatch(/^TV-[A-Z0-9]{4}$/);
    expect(res.token).toContain('mock_token_');
    expect(res.creator.displayName).toBe('Dad');
    expect(res.creator.role).toBe('COORDINATOR');
  });

  it('joins a decision room with valid PIN', async () => {
    const groupRes = await api.createGroup({
      title: 'Apartment TV',
      creatorDisplayName: 'Host',
      targetParticipantCount: 2
    });

    const joinRes = await api.joinGroup({
      inviteCode: groupRes.inviteCode,
      displayName: 'Roommate'
    });

    expect(joinRes.participantId).toBeDefined();
    expect(joinRes.displayName).toBe('Roommate');
    expect(joinRes.role).toBe('PARTICIPANT');
    expect(joinRes.token).toBeDefined();
  });

  it('rejects join with invalid PIN', async () => {
    await expect(
      api.joinGroup({
        inviteCode: 'INVALID-PIN',
        displayName: 'Intruder'
      })
    ).rejects.toThrow('Invalid room PIN');
  });

  it('returns group details and connected roster', async () => {
    const groupRes = await api.createGroup({
      title: 'Weekend Project TV',
      creatorDisplayName: 'Alice'
    });

    const details = await api.getGroup(groupRes.groupId);
    expect(details.groupId).toBe(groupRes.groupId);
    expect(details.roster.length).toBeGreaterThanOrEqual(1);
    expect(details.roster[0].displayName).toBe('Alice');
  });

  it('manages private 1-on-1 interview conversation loop', async () => {
    const startRes = await api.startConversation({
      participantId: 'usr_test_01'
    });

    expect(startRes.conversationId).toBeDefined();
    expect(startRes.initialMessage).toContain('Consenzo');
    expect(startRes.turnCount).toBe(1);

    const replyRes = await api.sendMessage(
      startRes.conversationId,
      'My budget is ₹50,000 maximum for this TV'
    );

    expect(replyRes.reply).toBeDefined();
    expect(replyRes.turnCount).toBe(2);
  });

  it('retrieves and confirms structured preference profile', async () => {
    const prefs = await api.getPreferences('usr_test_01');
    expect(prefs.participantId).toBe('usr_test_01');
    expect(prefs.summaryMarkdown).toBeDefined();
    expect(prefs.constraints.length).toBeGreaterThan(0);

    const confirmRes = await api.confirmPreferences('usr_test_01');
    expect(confirmRes.confirmed).toBe(true);
    expect(confirmRes.readiness).toBe('CONFIRMED');
    expect(confirmRes.lockedAt).toBeDefined();
  });

  it('retrieves deterministic group consensus analysis with Pareto tags', async () => {
    const analysis = await api.getAnalysis('grp_family_tv');

    expect(analysis.status).toBe('COMPLETED');
    expect(analysis.topRecommendations.length).toBe(3);

    // Verify Rank 1
    const rank1 = analysis.topRecommendations[0];
    expect(rank1.rank).toBe(1);
    expect(rank1.tag).toBe('BEST_CONSENSUS');
    expect(rank1.product.asin).toBe('B09X1K87Z2');
    expect(rank1.scores.netConsensusScore).toBeCloseTo(8.11, 1);
    expect(rank1.scores.individualBreakdown['Dad']).toBe(9.2);
    expect(rank1.scores.individualBreakdown['Mom']).toBe(6.5);
    expect(rank1.scores.individualBreakdown['Son']).toBe(9.8);
    expect(rank1.scores.individualBreakdown['Daughter']).toBe(9.6);
    expect(rank1.groundedExplanation).toContain('Consenzo');

    // Verify Rank 2
    const rank2 = analysis.topRecommendations[1];
    expect(rank2.rank).toBe(2);
    expect(rank2.tag).toBe('LOWEST_CONFLICT');
    expect(rank2.product.asin).toBe('B09W1189X1');

    // Verify Rank 3
    const rank3 = analysis.topRecommendations[2];
    expect(rank3.rank).toBe(3);
    expect(rank3.tag).toBe('BEST_VALUE');
  });

  it('casts group ratification vote successfully', async () => {
    const voteRes = await api.castVote({
      groupId: 'grp_family_tv',
      analysisId: 'an_test',
      productId: 'B09X1K87Z2',
      vote: 'APPROVE'
    });

    expect(voteRes.groupId).toBe('grp_family_tv');
    expect(voteRes.productId).toBe('B09X1K87Z2');
    expect(voteRes.isUnanimous).toBe(true);
    expect(voteRes.decisionStatus).toBe('DECIDED');
  });
});
