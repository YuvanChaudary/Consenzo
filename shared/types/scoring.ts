export interface UtilityBreakdown {
  attribute: string;
  score: number; // 0.0 to 1.0
  weight: number; // Normalized weight
  delta?: string; // Natural language description of the gap
}

export interface ProductScore {
  productId: string;
  totalUtility: number; // 0.0 to 10.0
  breakdown: UtilityBreakdown[];
}

export interface TradeoffDelta {
  participantId: string;
  attribute: string;
  desiredValue: any;
  actualValue: any;
  deltaPercent: number;
  impact: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
}
