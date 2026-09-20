import { SmartTvProduct } from '@shared/types/catalog';

export interface CandidateData {
  product: SmartTvProduct;
  utilities: number[];
  neuralScore?: number;
  attentionWeights?: number[];
}

export interface RankedProduct {
  product: SmartTvProduct;
  score: number;
  rank: number;
}

export interface ConsensusMetrics {
  score: number;
  mean: number;
  stdDev: number;
  min: number;
}

export type AggregationStrategy = 'HYBRID' | 'NASH' | 'LEAST_MISERY' | 'BORDA' | 'NEURAL_ATTENTION';

export class FairnessEngine {
  private readonly LAMBDA = 0.50;
  private readonly FLOOR_THRESHOLD = 4.0;
  private readonly FLOOR_PENALTY_COEFF = 2.5;

  /**
   * The Consenzo Hybrid Consensus Operator.
   * S_group(x) = mean(u) - lambda * stdDev(u) - FloorPenalty(u)
   */
  public calculateConsensusScore(utilities: number[]): ConsensusMetrics {
    if (utilities.length === 0) {
      return { score: 0, mean: 0, stdDev: 0, min: 0 };
    }

    const mean = utilities.reduce((a, b) => a + b, 0) / utilities.length;
    const min = Math.min(...utilities);

    const variance = utilities.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / utilities.length;
    const stdDev = Math.sqrt(variance);

    const floorPenalty = min < this.FLOOR_THRESHOLD
      ? this.FLOOR_PENALTY_COEFF * Math.pow(this.FLOOR_THRESHOLD - min, 2)
      : 0.0;

    const score = mean - (this.LAMBDA * stdDev) - floorPenalty;

    return {
      score: Math.max(0, Number(score.toFixed(2))),
      mean: Number(mean.toFixed(2)),
      stdDev: Number(stdDev.toFixed(2)),
      min: Number(min.toFixed(2)),
    };
  }

  /**
   * Nash Bargaining Solution (NBS):
   * Product of utilities above a disagreement point (d_u = 1.0).
   * Guarantees Pareto efficiency and scale invariance.
   */
  public calculateNashScore(utilities: number[], disagreementPoint = 1.0): number {
    if (utilities.length === 0) return 0;
    // Normalized product of surplus
    const surplusProd = utilities.reduce((prod, u) => prod * Math.max(0.05, u - disagreementPoint), 1.0);
    // Geometric mean scale back to 0-10
    const geometricMean = Math.pow(surplusProd, 1 / utilities.length) + disagreementPoint;
    return Number(Math.min(10.0, Math.max(0, geometricMean)).toFixed(2));
  }

  /**
   * Least Misery (LM) Strategy:
   * Score determined strictly by the grumpiest member.
   */
  public calculateLeastMiseryScore(utilities: number[]): number {
    if (utilities.length === 0) return 0;
    return Number(Math.min(...utilities).toFixed(2));
  }

  /**
   * Borda Count aggregation across candidates.
   */
  public calculateBordaScores(candidates: CandidateData[]): Map<string, number> {
    const bordaMap = new Map<string, number>();
    if (candidates.length === 0) return bordaMap;

    const participantCount = candidates[0].utilities.length;
    const N = candidates.length;

    // For each participant, rank all candidates descending by utility
    for (let pIdx = 0; pIdx < participantCount; pIdx++) {
      const pRankings = candidates
        .map(c => ({ id: (c.product as any).id || c.product.asin, u: c.utilities[pIdx] }))
        .sort((a, b) => b.u - a.u);

      pRankings.forEach((item, rankIdx) => {
        const points = N - 1 - rankIdx;
        bordaMap.set(item.id, (bordaMap.get(item.id) || 0) + points);
      });
    }

    return bordaMap;
  }

  /**
   * Ranks candidates based on three different Pareto criteria, optionally selecting the aggregation strategy.
   */
  public rankCandidates(candidates: CandidateData[], strategy: AggregationStrategy = 'HYBRID') {
    const bordaMap = strategy === 'BORDA' ? this.calculateBordaScores(candidates) : null;

    const results = candidates.map(c => {
      const metrics = this.calculateConsensusScore(c.utilities);
      let strategyScore = metrics.score;

      if (strategy === 'NASH') {
        strategyScore = this.calculateNashScore(c.utilities);
      } else if (strategy === 'LEAST_MISERY') {
        strategyScore = this.calculateLeastMiseryScore(c.utilities);
      } else if (strategy === 'BORDA' && bordaMap) {
        const pId = (c.product as any).id || c.product.asin;
        const maxBorda = candidates.length * (c.utilities.length || 1);
        strategyScore = Number(((bordaMap.get(pId) || 0) / (maxBorda || 1) * 10).toFixed(2));
      } else if (strategy === 'NEURAL_ATTENTION') {
        if (c.neuralScore !== undefined) {
          strategyScore = c.neuralScore;
        } else if (c.attentionWeights && c.attentionWeights.length === c.utilities.length) {
          const attnMean = c.utilities.reduce((sum, u, idx) => sum + u * c.attentionWeights![idx], 0);
          strategyScore = Number((attnMean - (this.LAMBDA * metrics.stdDev)).toFixed(2));
        }
      }

      return {
        product: c.product,
        utilities: c.utilities,
        ...metrics,
        score: strategyScore,
        valueScore: strategyScore / (c.product.priceInr || 1),
      };
    });

    const getTop3 = (sorted: any[]) => sorted.slice(0, 3).map((p, i) => ({
      product: p.product,
      score: p.score,
      rank: i + 1
    }));

    return {
      BEST_CONSENSUS: getTop3([...results].sort((a, b) => b.score - a.score)),
      LOWEST_CONFLICT: getTop3([...results].sort((a, b) => a.stdDev - b.stdDev).map(p => ({ ...p, score: p.stdDev }))),
      BEST_VALUE: getTop3([...results].sort((a, b) => b.valueScore - a.valueScore).map(p => ({ ...p, score: p.valueScore }))),
    };
  }
}

export const fairnessEngine = new FairnessEngine();
