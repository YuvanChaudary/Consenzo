export interface FairnessMetrics {
  mean: number;
  stdDev: number;
  floorPenalty: number;
  netConsensusScore: number;
}

export type ParetoTag = 'BEST_CONSENSUS' | 'LOWEST_CONFLICT' | 'BEST_VALUE';

export interface ConsensusResult {
  productId: string;
  totalUtility: number;
  metrics: FairnessMetrics;
  tag: ParetoTag;
}
