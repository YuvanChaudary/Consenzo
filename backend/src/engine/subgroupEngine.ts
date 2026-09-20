import { NexusProduct } from '@shared/types/catalog';
import { ParticipantPreferenceProfile } from '@shared/types/preferences';
import { scoringEngine } from './scoringEngine';
import { fairnessEngine } from './fairnessEngine';

export interface AgreementGroup {
  participantIds: string[];
  participantNames?: string[];
  bestProduct: NexusProduct;
  consensusScore: number;
  meanUtility: number;
  reason: string;
}

export interface SubgroupResult {
  recommendation: 'UNIFIED' | 'SPLIT';
  splitReason?: string;
  unifiedWinner?: {
    product: NexusProduct;
    score: number;
  };
  agreementGroups: AgreementGroup[];
}

export class SubgroupEngine {
  private readonly SPLIT_STDDEV_THRESHOLD = 2.4;
  private readonly MIN_SUBGROUP_SIZE = 2;

  /**
   * Evaluates participant preference profiles and candidate products to determine
   * if the room converges on one unified pick or naturally splits into 2 distinct subgroups.
   */
  public evaluateSubgroups(
    catalog: NexusProduct[],
    profiles: ParticipantPreferenceProfile[]
  ): SubgroupResult {
    if (!profiles || profiles.length < 3 || !catalog || catalog.length === 0) {
      // Small groups (1-2 people) or empty catalog always stay unified
      return {
        recommendation: 'UNIFIED',
        agreementGroups: [],
      };
    }

    // 1. Compute individual utilities matrix: [productIndex][participantIndex]
    const candidatesWithUtilities = catalog.map((product) => {
      const utils = profiles.map((p) => {
        const scoreObj = scoringEngine.computeIndividualUtility(product as any, p);
        return scoreObj.totalUtility;
      });
      const metrics = fairnessEngine.calculateConsensusScore(utils);
      return {
        product,
        utilities: utils,
        metrics,
      };
    });

    // Find best overall unified consensus product
    candidatesWithUtilities.sort((a, b) => b.metrics.score - a.metrics.score);
    const topUnified = candidatesWithUtilities[0];

    // If top unified product has low stdDev and acceptable consensus score, keep UNIFIED
    if (topUnified && topUnified.metrics.stdDev < this.SPLIT_STDDEV_THRESHOLD && topUnified.metrics.score >= 5.5) {
      return {
        recommendation: 'UNIFIED',
        unifiedWinner: {
          product: topUnified.product,
          score: topUnified.metrics.score,
        },
        agreementGroups: [
          {
            participantIds: profiles.map((p) => p.participantId),
            bestProduct: topUnified.product,
            consensusScore: topUnified.metrics.score,
            meanUtility: topUnified.metrics.mean,
            reason: 'High group alignment with minimal preference divergence.',
          },
        ],
      };
    }

    // 2. Identify potential split: group participants by budget/spec clusters
    // Simple 2-cluster partition based on utility vectors
    const pCount = profiles.length;
    let bestSplit: {
      groupA: number[];
      groupB: number[];
      prodA: NexusProduct;
      scoreA: number;
      prodB: NexusProduct;
      scoreB: number;
      combinedAvgScore: number;
    } | null = null;

    // Try possible bipartite splits
    for (let mask = 1; mask < (1 << pCount) - 1; mask++) {
      const idxA: number[] = [];
      const idxB: number[] = [];
      for (let i = 0; i < pCount; i++) {
        if ((mask & (1 << i)) !== 0) {
          idxA.push(i);
        } else {
          idxB.push(i);
        }
      }

      if (idxA.length < this.MIN_SUBGROUP_SIZE || idxB.length < this.MIN_SUBGROUP_SIZE) {
        continue;
      }

      // Best product for group A
      const bestForA = this.findBestForSubset(catalog, profiles, idxA);
      // Best product for group B
      const bestForB = this.findBestForSubset(catalog, profiles, idxB);

      if (bestForA && bestForB && bestForA.product.id !== bestForB.product.id) {
        const combinedScore = (bestForA.metrics.score * idxA.length + bestForB.metrics.score * idxB.length) / pCount;
        if (!bestSplit || combinedScore > bestSplit.combinedAvgScore) {
          bestSplit = {
            groupA: idxA,
            groupB: idxB,
            prodA: bestForA.product,
            scoreA: bestForA.metrics.score,
            prodB: bestForB.product,
            scoreB: bestForB.metrics.score,
            combinedAvgScore: combinedScore,
          };
        }
      }
    }

    // If a split yields significantly higher individual satisfaction than the compromised unified pick
    if (bestSplit && topUnified && bestSplit.combinedAvgScore > topUnified.metrics.score + 1.2) {
      return {
        recommendation: 'SPLIT',
        splitReason: `Significant preference bifurcation detected (${bestSplit.groupA.length} vs ${bestSplit.groupB.length} members). Splitting maximizes individual satisfaction.`,
        unifiedWinner: {
          product: topUnified.product,
          score: topUnified.metrics.score,
        },
        agreementGroups: [
          {
            participantIds: bestSplit.groupA.map((i) => profiles[i].participantId),
            bestProduct: bestSplit.prodA,
            consensusScore: bestSplit.scoreA,
            meanUtility: bestSplit.scoreA,
            reason: `Optimized for ${bestSplit.groupA.length} participants with aligned constraints.`,
          },
          {
            participantIds: bestSplit.groupB.map((i) => profiles[i].participantId),
            bestProduct: bestSplit.prodB,
            consensusScore: bestSplit.scoreB,
            meanUtility: bestSplit.scoreB,
            reason: `Optimized for ${bestSplit.groupB.length} participants with distinct budget/feature preferences.`,
          },
        ],
      };
    }

    // Default to UNIFIED
    return {
      recommendation: 'UNIFIED',
      unifiedWinner: topUnified
        ? {
            product: topUnified.product,
            score: topUnified.metrics.score,
          }
        : undefined,
      agreementGroups: topUnified
        ? [
            {
              participantIds: profiles.map((p) => p.participantId),
              bestProduct: topUnified.product,
              consensusScore: topUnified.metrics.score,
              meanUtility: topUnified.metrics.mean,
              reason: 'Best overall group consensus compromise.',
            },
          ]
        : [],
    };
  }

  private findBestForSubset(
    catalog: NexusProduct[],
    profiles: ParticipantPreferenceProfile[],
    subsetIndices: number[]
  ) {
    let best: { product: NexusProduct; metrics: any } | null = null;

    for (const product of catalog) {
      const utils = subsetIndices.map((idx) => {
        const scoreObj = scoringEngine.computeIndividualUtility(product as any, profiles[idx]);
        return scoreObj.totalUtility;
      });
      const metrics = fairnessEngine.calculateConsensusScore(utils);
      if (!best || metrics.score > best.metrics.score) {
        best = { product, metrics };
      }
    }

    return best;
  }
}

export const subgroupEngine = new SubgroupEngine();
