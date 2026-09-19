import { SmartTvProduct } from '@shared/types/catalog';

export interface CandidateData {
  product: SmartTvProduct;
  utilities: number[];
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
      score: Math.max(0, score),
      mean,
      stdDev,
      min,
    };
  }

  /**
   * Ranks candidates based on three different Pareto criteria.
   */
  public rankCandidates(candidates: CandidateData[]) {
    const results = candidates.map(c => {
      const metrics = this.calculateConsensusScore(c.utilities);
      return {
        product: c.product,
        utilities: c.utilities,
        ...metrics,
        valueScore: metrics.score / (c.product.priceInr || 1),
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
