export type GroupStatus =
  | 'JOINING'
  | 'INTERVIEWING'
  | 'READY_FOR_ANALYSIS'
  | 'ANALYZING'
  | 'RESULTS_READY'
  | 'VOTING'
  | 'DECIDED'
  | 'EXPIRED';

export type ParticipantStatus =
  | 'JOINED'
  | 'INTERVIEWING'
  | 'CONFIRMED'
  | 'VOTED';

export type Role = 'COORDINATOR' | 'PARTICIPANT';

export interface Group {
  groupId: string;
  title: string;
  category: string;
  status: GroupStatus;
  createdAt: string;
  expiresAt: string;
}

export interface Participant {
  participantId: string;
  displayName: string;
  role: Role;
  status: ParticipantStatus;
  joinedAt: string;
}

export interface SessionTokenPayload {
  sub: string; // participantId
  groupId: string;
  role: Role;
  exp: number;
}
