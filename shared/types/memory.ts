import { CanonicalConstraint } from './preferences';

export interface UserMemoryProfile {
  userId: string;
  category: string;
  stablePreferences: {
    budgetCeilingInr?: number;
    preferredBrands?: string[];
    hardRequirements?: CanonicalConstraint[]; // e.g. "always needs 2+ HDMI 2.1"
    dislikedFeatures?: string[];
    notes?: string;
    lastUpdated: string;
  };
  sessionHistory?: Array<{
    roomId: string;
    closedAt: string;
    finalConstraints: CanonicalConstraint[];
  }>;
}

export interface MemoryUpdateInput {
  userId: string;
  category: string;
  roomId: string;
  transcript: string;
  finalConstraints: CanonicalConstraint[];
}
