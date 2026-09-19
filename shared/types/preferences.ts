export type ConstraintType = 'DEALBREAKER' | 'HARD_CONSTRAINT' | 'PREFERENCE' | 'NICE_TO_HAVE';

export type ConstraintOperator = 'LTE' | 'GTE' | 'EQ' | 'NEQ' | 'IN' | 'NOT_IN' | 'RANGE';

export interface CanonicalConstraint {
  attribute: string;
  operator: ConstraintOperator;
  value: any;
  type: ConstraintType;
  weight?: number; // 0.0 to 1.0
}

export interface ParticipantPreferenceProfile {
  participantId: string;
  groupId: string;
  constraints: CanonicalConstraint[];
  summaryMarkdown: string;
  confirmedByParticipant: boolean;
  lockedAt?: string;
}
