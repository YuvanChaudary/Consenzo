import { neuralVectorizer, LATENT_DIM, hashToVector, rbfExpansion, unitNorm } from '../../src/engine/neural/vectorizer';
import { attentionAggregator } from '../../src/engine/neural/attentionAggregator';
import { neuralRecommender } from '../../src/engine/neural/neuralRecommender';
import { ParticipantPreferenceProfile } from '@shared/types/preferences';

describe('Neural Group Recommender System (ML/DL Architecture)', () => {
  const sampleTv = {
    asin: 'B0-TEST-OLED',
    modelName: 'OLED 4K Cinema',
    brand: 'LG',
    priceInr: 85000,
    screenSizeInches: 65,
    panelType: 'OLED',
    resolution: '4K',
    refreshRateHz: 120,
    hasHdmi21: true,
    rating: 4.8,
    inStock: true,
  };

  const sampleTvBudget = {
    asin: 'B0-TEST-BUDGET',
    modelName: 'Basic LED 43',
    brand: 'TCL',
    priceInr: 22000,
    screenSizeInches: 43,
    panelType: 'LED',
    resolution: '4K',
    refreshRateHz: 60,
    hasHdmi21: false,
    rating: 4.0,
    inStock: true,
  };

  const profileGamer: ParticipantPreferenceProfile = {
    participantId: 'usr_gamer',
    groupId: 'grp_test',
    summaryMarkdown: 'Wants OLED and 120Hz for gaming',
    constraints: [
      { attribute: 'refreshRateHz', operator: 'GTE', value: 120, type: 'DEALBREAKER', weight: 1.0 },
      { attribute: 'panelType', operator: 'EQ', value: 'OLED', type: 'HARD_CONSTRAINT', weight: 0.9 },
      { attribute: 'brand', operator: 'EQ', value: 'LG', type: 'PREFERENCE', weight: 0.7 },
    ],
    confirmedByParticipant: true,
  };

  const profileBudget: ParticipantPreferenceProfile = {
    participantId: 'usr_budget',
    groupId: 'grp_test',
    summaryMarkdown: 'Strict budget max 30000',
    constraints: [
      { attribute: 'priceInr', operator: 'LTE', value: 30000, type: 'DEALBREAKER', weight: 1.0 },
    ],
    confirmedByParticipant: true,
  };

  describe('1. Neural Vectorizer (Continuous Latent Projection)', () => {
    test('Product is projected into normalized vector of LATENT_DIM', () => {
      const vec = neuralVectorizer.vectorizeProduct(sampleTv);
      expect(vec.length).toBe(LATENT_DIM);
      let norm = 0;
      for (const val of vec) norm += val * val;
      expect(Math.sqrt(norm)).toBeCloseTo(1.0, 3);
    });

    test('Participant preference profile is projected into normalized vector of LATENT_DIM', () => {
      const vec = neuralVectorizer.vectorizeProfile(profileGamer);
      expect(vec.length).toBe(LATENT_DIM);
      let norm = 0;
      for (const val of vec) norm += val * val;
      expect(Math.sqrt(norm)).toBeCloseTo(1.0, 3);
    });

    test('Continuous RBF expansion produces smooth Gaussian distributions', () => {
      const centers = [43, 55, 65, 75];
      const rbfsExact = rbfExpansion(65, centers, 8);
      // Index 2 corresponds to center 65 -> peak at 1.0
      expect(rbfsExact[2]).toBeCloseTo(1.0, 4);
      expect(rbfsExact[1]).toBeLessThan(rbfsExact[2]);
      expect(rbfsExact[3]).toBeLessThan(rbfsExact[2]);
    });

    test('hashToVector maps strings to deterministic unit vectors', () => {
      const v1 = hashToVector('Samsung', 8);
      const v2 = hashToVector('Samsung', 8);
      const v3 = hashToVector('Sony', 8);
      expect(v1).toEqual(v2);
      expect(v1).not.toEqual(v3);
    });
  });

  describe('2. AGREE Self-Attention Influence Aggregator', () => {
    test('Attention weights sum to 1.0 across group members', () => {
      const p1Vec = neuralVectorizer.vectorizeProfile(profileGamer);
      const p2Vec = neuralVectorizer.vectorizeProfile(profileBudget);
      const prodVec = neuralVectorizer.vectorizeProduct(sampleTv);

      const members = [
        { participantId: 'usr_gamer', embedding: p1Vec },
        { participantId: 'usr_budget', embedding: p2Vec },
      ];

      const res = attentionAggregator.aggregate(members, prodVec);
      expect(res.attentionWeights.length).toBe(2);
      const sumWeights = res.attentionWeights.reduce((s, w) => s + w.weight, 0);
      expect(sumWeights).toBeCloseTo(1.0, 2);
      expect(res.groupVector.length).toBe(LATENT_DIM);
    });

    test('Single-member group yields identity attention weight of 1.0', () => {
      const p1Vec = neuralVectorizer.vectorizeProfile(profileGamer);
      const prodVec = neuralVectorizer.vectorizeProduct(sampleTv);
      const res = attentionAggregator.aggregate([{ participantId: 'usr_gamer', embedding: p1Vec }], prodVec);
      expect(res.attentionWeights[0].weight).toBe(1.0);
    });
  });

  describe('3. Neural Recommender & Continuous Utility Computation', () => {
    test('Computes individual utility within valid bounds [0.5, 10.0]', () => {
      const score = neuralRecommender.computeIndividualUtility(sampleTv, profileGamer);
      expect(score.totalUtility).toBeGreaterThanOrEqual(0.5);
      expect(score.totalUtility).toBeLessThanOrEqual(10.0);
      expect(score.breakdown.length).toBe(3);
    });

    test('Monotonicity: Gamer profile rates 120Hz OLED strictly higher than basic 60Hz LED', () => {
      const scoreOled = neuralRecommender.computeIndividualUtility(sampleTv, profileGamer);
      const scoreBudget = neuralRecommender.computeIndividualUtility(sampleTvBudget, profileGamer);
      expect(scoreOled.totalUtility).toBeGreaterThan(scoreBudget.totalUtility);
    });

    test('Monotonicity: Budget profile rates ₹22,000 strictly higher than ₹85,000', () => {
      const scoreOled = neuralRecommender.computeIndividualUtility(sampleTv, profileBudget);
      const scoreBudget = neuralRecommender.computeIndividualUtility(sampleTvBudget, profileBudget);
      expect(scoreBudget.totalUtility).toBeGreaterThan(scoreOled.totalUtility);
    });

    test('NeuMF Group Candidate evaluation returns group score and attention metadata', () => {
      const res = neuralRecommender.evaluateGroupCandidate(sampleTv, [profileGamer, profileBudget]);
      expect(res.groupScore).toBeGreaterThanOrEqual(0);
      expect(res.groupScore).toBeLessThanOrEqual(10.0);
      expect(res.individualUtilities.length).toBe(2);
      expect(res.attentionResult.attentionWeights.length).toBe(2);
    });
  });
});
