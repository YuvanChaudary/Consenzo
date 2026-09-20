import { ApiResponse, ApiErrorEnvelope } from '@shared/types/api';
import { Group, Participant, GroupStatus, Role } from '@shared/types/session';
import { SmartTvProduct } from '@shared/types/catalog';
import { CanonicalConstraint } from '@shared/types/preferences';

// Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:3001';
const FORCE_MOCK = import.meta.env.VITE_USE_MOCKS === 'true';

// Generate UUID for correlation
function generateId(prefix = 'id'): string {
  return `${prefix}_${Math.random().toString(36).substring(2, 9)}_${Date.now().toString(36)}`;
}

// In-Memory Mock Store for offline & concurrent testing
const mockStore = {
  groups: new Map<string, {
    group: Group;
    roster: Participant[];
    inviteCode: string;
    targetCount: number;
    votes: Map<string, string>; // participantId -> productId
  }>(),
  conversations: new Map<string, {
    conversationId: string;
    participantId: string;
    turns: number;
    messages: Array<{ role: 'assistant' | 'user'; content: string }>;
  }>(),
  preferences: new Map<string, {
    participantId: string;
    confirmed: boolean;
    summaryMarkdown: string;
    constraints: CanonicalConstraint[];
    lockedAt?: string;
  }>()
};

// Seed initial default demo group for instant evaluation
const SEED_GROUP_ID = 'grp_family_tv';
const SEED_INVITE_CODE = 'TV-881A';
mockStore.groups.set(SEED_GROUP_ID, {
  group: {
    groupId: SEED_GROUP_ID,
    title: 'Family Living Room TV',
    category: 'smart_tvs',
    status: 'INTERVIEWING',
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 86400000).toISOString()
  },
  inviteCode: SEED_INVITE_CODE,
  targetCount: 4,
  roster: [
    {
      participantId: 'usr_dad_01',
      displayName: 'Dad',
      role: 'COORDINATOR',
      status: 'CONFIRMED',
      joinedAt: new Date().toISOString()
    },
    {
      participantId: 'usr_mom_02',
      displayName: 'Mom',
      role: 'PARTICIPANT',
      status: 'CONFIRMED',
      joinedAt: new Date().toISOString()
    },
    {
      participantId: 'usr_daughter_04',
      displayName: 'Daughter',
      role: 'PARTICIPANT',
      status: 'CONFIRMED',
      joinedAt: new Date().toISOString()
    }
  ],
  votes: new Map()
});

export interface TopRecommendation {
  rank: number;
  tag: 'BEST_CONSENSUS' | 'LOWEST_CONFLICT' | 'BEST_VALUE' | 'VALUE_TIER' | string;
  product: SmartTvProduct;
  scores: {
    netConsensusScore: number;
    meanUtility: number;
    fairnessPenalty: number;
    individualBreakdown: Record<string, number>;
    neuralScore?: number;
  };
  groundedExplanation: string;
  /** EXACT when every group constraint is satisfied; otherwise the nearest-tier label. */
  matchQuality?: string;
  matchScore?: number;
  exactMatch?: boolean;
  attentionWeights?: Record<string, number>;
}

export interface ParticipantBreakdown {
  participantId: string;
  displayName: string;
  role: string;
  keyRequirements: string[];
  utility: number;
  status: 'FULLY_SATISFIED' | 'COMPROMISED' | 'CONCEDED';
  concessionNote: string;
  attentionWeight?: number;
}

export interface GroupAnalysisResult {
  analysisId: string;
  groupId: string;
  catalogVersion: string;
  status: 'COMPLETED';
  topRecommendations: TopRecommendation[];
  allCandidates?: TopRecommendation[];
  participantBreakdowns?: ParticipantBreakdown[];
  conflictsDetected: Array<{
    type: string;
    description: string;
    participantsInvolved: string[];
    conflictingAttributes: string[];
    resolutionStrategy: string;
  }>;
  metrics?: {
    feasibleCount: number;
    totalProducts: number;
  };
}

export interface VoteResult {
  groupId: string;
  productId: string;
  approvalsCount: number;
  totalParticipants: number;
  isUnanimous: boolean;
  decisionStatus: GroupStatus;
}

// HTTP Helper with standard envelope unwrapping
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  let token: string | null = null;

  // 1. Resolve room ID from path or current location to prevent multi-participant collision
  let targetGroupId: string | null = null;
  const pathMatch = path.match(/\/groups\/([^\/?#]+)/) || path.match(/\/conversations\/conv_([^_]+)/);
  if (pathMatch) {
    targetGroupId = pathMatch[1];
  } else if (typeof window !== 'undefined') {
    const locMatch = window.location.pathname.match(/\/room\/([^\/?#]+)/);
    if (locMatch) targetGroupId = locMatch[1];
  }

  // 2. Check tab sessionStorage (isolated per tab)
  if (typeof sessionStorage !== 'undefined') {
    if (targetGroupId) {
      token = sessionStorage.getItem(`consenzo_token_${targetGroupId}`);
    }
    if (!token) {
      token = sessionStorage.getItem('consenzo_token');
    }
    if (!token) {
      try {
        const storedSession = sessionStorage.getItem('consenzo_participant_session');
        if (storedSession) {
          token = JSON.parse(storedSession)?.token || null;
        }
      } catch {}
    }
  }

  // 3. Fallback to localStorage
  if (!token && typeof localStorage !== 'undefined') {
    if (targetGroupId) {
      token = localStorage.getItem(`consenzo_token_${targetGroupId}`);
    }
    if (!token) {
      token = localStorage.getItem('consenzo_token');
    }
    if (!token) {
      try {
        const storedSession = localStorage.getItem('consenzo_participant_session');
        if (storedSession) {
          token = JSON.parse(storedSession)?.token || null;
        }
      } catch {}
    }
    if (!token) {
      // Zustand-persisted auth (survives tab reloads)
      try {
        const auth = JSON.parse(localStorage.getItem('shippyfy-auth') || localStorage.getItem('nexus-auth') || 'null');
        token = auth?.state?.token || null;
      } catch {}
    }
  }

  const correlationId = generateId('corr');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Correlation-Id': correlationId,
    ...(options.headers as Record<string, string>)
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const requestTimeout = (options as any)?.timeout || 35000;
  const timeoutId = setTimeout(() => controller.abort(), requestTimeout);

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const body = await response.json();

    if (!response.ok) {
      const errorBody = body as ApiErrorEnvelope;
      throw new Error(errorBody.error?.message || `Request failed with status ${response.status}`);
    }

    const successBody = body as ApiResponse<T>;
    return successBody.data;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Server response timed out. Please verify the backend is running.');
    }
    throw err;
  }
}

// Exported API Methods

/**
 * Decode the session JWT payload (sub=participantId, groupId, role).
 * Zero-trust note: used ONLY for UI display; the backend always re-verifies.
 */
export function getTokenPayload(): { sub: string; groupId?: string; role?: string } | null {
  for (const store of [typeof sessionStorage !== 'undefined' ? sessionStorage : null, typeof localStorage !== 'undefined' ? localStorage : null]) {
    if (!store) continue;
    const token = store.getItem('consenzo_token');
    if (!token) continue;
    try {
      const payloadPart = token.split('.')[1];
      if (!payloadPart) continue;
      const json = atob(payloadPart.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(json);
    } catch {}
  }
  return null;
}

export const api = {
  // 1. Create Decision Room
  async createGroup(params: {
    title: string;
    category?: string;
    creatorDisplayName: string;
    targetParticipantCount?: number;
  }): Promise<{
    groupId: string;
    title: string;
    category: string;
    status: GroupStatus;
    inviteCode: string;
    inviteUrl: string;
    creator: {
      participantId: string;
      displayName: string;
      role: Role;
    };
    token: string;
  }> {
    if (FORCE_MOCK) {
      await new Promise(r => setTimeout(r, 400));
      const groupId = generateId('grp');
      const participantId = generateId('usr');
      const inviteCode = `TV-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      const token = `mock_token_${participantId}_${Date.now()}`;
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem('consenzo_token', token);
      }

      const newGroup: Group = {
        groupId,
        title: params.title,
        category: params.category || 'smart_tvs',
        status: 'JOINING',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 86400000).toISOString()
      };

      const creatorParticipant: Participant = {
        participantId,
        displayName: params.creatorDisplayName,
        role: 'COORDINATOR',
        status: 'JOINED',
        joinedAt: new Date().toISOString()
      };

      mockStore.groups.set(groupId, {
        group: newGroup,
        inviteCode,
        targetCount: params.targetParticipantCount || 4,
        roster: [creatorParticipant],
        votes: new Map()
      });

      return {
        groupId,
        title: newGroup.title,
        category: newGroup.category,
        status: newGroup.status,
        inviteCode,
        inviteUrl: typeof window !== 'undefined' ? `${window.location.origin}/join/${inviteCode}` : `https://consenzo.app/join/${inviteCode}`,
        creator: {
          participantId,
          displayName: params.creatorDisplayName,
          role: 'COORDINATOR'
        },
        token
      };
    }

    const result = await request<any>('/groups', {
      method: 'POST',
      body: JSON.stringify({
        title: params.title,
        category: params.category || 'smart_tvs',
        creatorDisplayName: params.creatorDisplayName,
        targetParticipantCount: params.targetParticipantCount || 4
      })
    });

    const token = result.token || result.creatorToken;
    if (token && typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('consenzo_token', token);
    }

    const inviteCode = result.inviteCode || result.groupId;
    const inviteUrl = typeof window !== 'undefined'
      ? `${window.location.origin}/join/${inviteCode}`
      : result.inviteUrl;

    return {
      groupId: result.groupId,
      title: result.title,
      category: result.category,
      status: result.status,
      inviteCode,
      inviteUrl,
      creator: {
        participantId: result.creator?.participantId,
        displayName: result.creator?.displayName || params.creatorDisplayName,
        role: result.creator?.role || 'COORDINATOR'
      },
      token
    };
  },

  // 2. Join Group with PIN
  async joinGroup(params: {
    inviteCode: string;
    displayName: string;
  }): Promise<{
    groupId: string;
    participantId: string;
    displayName: string;
    role: Role;
    status: GroupStatus;
    token: string;
  }> {
    if (FORCE_MOCK) {
      await new Promise(r => setTimeout(r, 400));
      const cleanCode = params.inviteCode.trim().toUpperCase();
      let foundGroupEntry: [string, any] | undefined;

      for (const entry of mockStore.groups.entries()) {
        if (entry[1].inviteCode === cleanCode) {
          foundGroupEntry = entry;
          break;
        }
      }

      if (!foundGroupEntry) {
        throw new Error('Invalid room PIN. Please check the code and try again.');
      }

      const [groupId, groupData] = foundGroupEntry;
      const participantId = generateId('usr');
      const token = `mock_token_${participantId}_${Date.now()}`;
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem('consenzo_token', token);
      }

      const newParticipant: Participant = {
        participantId,
        displayName: params.displayName,
        role: 'PARTICIPANT',
        status: 'JOINED',
        joinedAt: new Date().toISOString()
      };

      groupData.roster.push(newParticipant);
      groupData.group.status = 'INTERVIEWING';

      return {
        groupId,
        participantId,
        displayName: params.displayName,
        role: 'PARTICIPANT',
        status: groupData.group.status,
        token
      };
    }

    const result = await request<any>('/groups/join', {
      method: 'POST',
      body: JSON.stringify(params)
    });

    const token = result.token || result.participantToken;
    if (token && typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('consenzo_token', token);
    }

    return {
      groupId: result.groupId,
      participantId: result.participantId,
      displayName: result.displayName || params.displayName,
      role: result.role || 'PARTICIPANT',
      status: result.status || 'JOINED',
      token
    };
  },

  // 3. Get Group Status & Public Roster (Polled every 3s)
  async getGroup(groupId: string): Promise<{
    groupId: string;
    title: string;
    category: string;
    status: GroupStatus;
    targetParticipantCount: number;
    roster: Participant[];
  }> {
    if (FORCE_MOCK) {
      await new Promise(r => setTimeout(r, 150));
      const groupData = mockStore.groups.get(groupId);
      if (!groupData) {
        // Fallback to default seeded room
        const fallback = mockStore.groups.get(SEED_GROUP_ID)!;
        return {
          groupId: SEED_GROUP_ID,
          title: fallback.group.title,
          category: fallback.group.category,
          status: fallback.group.status,
          targetParticipantCount: fallback.targetCount,
          roster: fallback.roster
        };
      }
      return {
        groupId: groupData.group.groupId,
        title: groupData.group.title,
        category: groupData.group.category,
        status: groupData.group.status,
        targetParticipantCount: groupData.targetCount,
        roster: groupData.roster
      };
    }

    return request(`/groups/${groupId}`);
  },

  // 4. Start (or resume) 1-on-1 Private Interview — conversation is scoped to
  // the caller's group, so each room gets a fresh, correctly-categorized chat
  // and returning members get their prior transcript back.
  async startConversation(params: {
    participantId: string;
    category?: string;
  }): Promise<{
    conversationId: string;
    participantId: string;
    turnCount: number;
    initialMessage: string;
    category?: string;
    roomTitle?: string;
    isResume?: boolean;
    messages?: Array<{ role: 'user' | 'assistant'; content: string; timestamp: string }>;
    thinking?: string;
    thinkingSteps?: string[];
  }> {
    if (FORCE_MOCK) {
      await new Promise(r => setTimeout(r, 300));
      const conversationId = generateId('conv');

      let category = params.category || 'smart_tvs';
      // attempt to find category from mockStore
      for (const g of mockStore.groups.values()) {
        if (g.roster.some(p => p.participantId === params.participantId)) {
          category = g.group.category || category;
          break;
        }
      }

      let initialMessage = "Hey! I'm Consenzo. I'm here to privately learn what you want from this Smart TV so everyone in the group gets a fair say. What matters most to you personally?";
      if (category === 'laptops' || category.includes('laptop')) {
        initialMessage = "Hey! I'm Consenzo. I'm here to privately understand what you need from this Laptop (e.g., coding, gaming, lightweight portability, battery life, RAM, or budget). What are your top priorities?";
      } else if (category === 'soundbars' || category.includes('soundbar') || category.includes('audio')) {
        initialMessage = "Hey! I'm Consenzo. I'm here to privately learn your sound priorities for this Soundbar (e.g., Dolby Atmos 3D audio, subwoofer bass, room acoustics, or budget ceiling). What's on your wishlist?";
      }

      mockStore.conversations.set(conversationId, {
        conversationId,
        participantId: params.participantId,
        turns: 1,
        messages: [{ role: 'assistant', content: initialMessage }]
      });

      return {
        conversationId,
        participantId: params.participantId,
        turnCount: 1,
        category,
        initialMessage,
        thinking: `Initialized adaptive discovery session for ${category.toUpperCase()}. Awaiting participant preferences.`,
        thinkingSteps: [
          `Identified purchase category: ${category.toUpperCase()}`,
          'Loaded constraint taxonomy and dynamic trade-off boundaries',
          'Awaiting conversational input to elicit individual priorities'
        ]
      };
    }

    return request('/conversations', {
      method: 'POST',
      body: JSON.stringify(params)
    });
  },

  // 4b. Fetch existing conversation transcript (per group) for UI resume
  async getConversation(conversationId: string): Promise<{
    conversationId: string;
    participantId: string;
    groupId: string;
    category: string;
    roomTitle?: string;
    messages: Array<{ role: 'user' | 'assistant'; content: string; timestamp: string }>;
    turnCount: number;
  }> {
    return request(`/conversations/${conversationId}`);
  },

  // 4c. Group feed events — the WhatsApp-style activity log for the room
  async getGroupEvents(groupId: string, since?: number): Promise<Array<{
    id: string;
    type: string;
    actorId: string;
    text: string;
    meta?: Record<string, any>;
    timestamp: string;
  }>> {
    const query = since ? `?since=${since}` : '';
    const res = await request<{ groupId: string; events: Array<{
      id: string; type: string; actorId: string; text: string; meta?: Record<string, any>; timestamp: string;
    }> }>(`/groups/${groupId}/events${query}`);
    return res.events || [];
  },

  // 5. Send Message in Private Interview
  async sendMessage(conversationId: string, message: string): Promise<{
    reply: string;
    turnCount: number;
    isReadyForSummary: boolean;
    extractedAttributesCount: number;
    thinking?: string;
    thinkingSteps?: string[];
  }> {
    if (FORCE_MOCK) {
      await new Promise(r => setTimeout(r, 600));
      const conv = mockStore.conversations.get(conversationId);
      const currentTurn = (conv?.turns || 1) + 1;
      if (conv) {
        conv.turns = currentTurn;
        conv.messages.push({ role: 'user', content: message });
      }

      let reply = '';
      let isReadyForSummary = false;
      const thinkingSteps: string[] = [
        'Analyzed conversational nuance and emotional emphasis in user text.',
        'Extracted candidate constraints and checked potential interpersonal friction points.',
        'Formulated empathetic discovery response without imposing rigid defaults.'
      ];

      const lower = message.toLowerCase();
      if (lower.includes('budget') || lower.includes('cost') || lower.includes('price') || /\d{2,6}/.test(lower)) {
        reply = "Understood on the budget ceiling. Is that a strict hard limit where you wouldn't consider even a slight stretch for significantly better durability and performance?";
        thinkingSteps.push('Identified budget ceiling boundary. Evaluating trade-off flexibility.');
      } else if (lower.includes('ram') || lower.includes('gpu') || lower.includes('rtx') || lower.includes('gaming') || lower.includes('code')) {
        reply = "Got it! High performance, fast multitasking, and responsive computing are essential. Would you prioritize maximum battery life, or raw processing power if there's a trade-off?";
        thinkingSteps.push('Flagged high-performance hardware constraints (RAM/GPU/Compute).');
      } else if (lower.includes('dolby') || lower.includes('atmos') || lower.includes('bass') || lower.includes('subwoofer') || lower.includes('sound')) {
        reply = "Understood, immersive audio fidelity and deep low-end bass make movies and music come alive. Is a dedicated wireless subwoofer a must-have for you?";
        thinkingSteps.push('Prioritized acoustic immersion & subwoofer requirements.');
      } else if (lower.includes('samsung') || lower.includes('lg') || lower.includes('sony') || lower.includes('apple') || lower.includes('brand')) {
        reply = "Brand trust and reliable after-sales service are definitely key factors. Are there any other brands you would consider if they matched your specs at a better price?";
        thinkingSteps.push('Noted brand preference. Checking cross-brand flexibility.');
      } else {
        reply = "Thank you for sharing that! I've incorporated those requirements into your private preference profile. Are there any other features or dealbreakers you want to make sure the group honors?";
      }

      if (currentTurn >= 2) {
        isReadyForSummary = true;
      }

      if (conv) {
        conv.messages.push({ role: 'assistant', content: reply });
      }

      return {
        reply,
        turnCount: currentTurn,
        isReadyForSummary,
        extractedAttributesCount: 2,
        thinking: thinkingSteps.join('\n'),
        thinkingSteps
      };
    }

    return request(`/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ message })
    });
  },

  // 6. Get Structured Preference Profile
  async getPreferences(participantId: string): Promise<{
    participantId: string;
    confirmed: boolean;
    summaryMarkdown: string;
    constraints: CanonicalConstraint[];
  }> {
    if (FORCE_MOCK) {
      await new Promise(r => setTimeout(r, 300));
      return {
        participantId,
        confirmed: false,
        summaryMarkdown: `• **Top Priority**: 120Hz native gaming for PS5 console\n• **Hardware**: Minimum 3 HDMI ports with low latency gaming mode\n• **Budget Flexibility**: Acceptable ceiling up to ₹50,000\n• **Brand**: Open to LG, Samsung, or Sony`,
        constraints: [
          { attribute: 'refreshRateHz', operator: 'GTE', value: 120, type: 'PREFERENCE', weight: 0.95 },
          { attribute: 'priceInr', operator: 'LTE', value: 50000, type: 'HARD_CONSTRAINT', weight: 1.0 },
          { attribute: 'hasHdmi21', operator: 'EQ', value: true, type: 'PREFERENCE', weight: 0.85 }
        ]
      };
    }

    return request(`/participants/${participantId}/preferences`);
  },

  // 6b. Update & Edit Structured Preferences
  async updatePreferences(participantId: string, data: {
    constraints: CanonicalConstraint[];
    summaryMarkdown?: string;
    confirmed?: boolean;
  }): Promise<{
    participantId: string;
    confirmed: boolean;
    summaryMarkdown: string;
    constraints: CanonicalConstraint[];
  }> {
    if (FORCE_MOCK) {
      await new Promise(r => setTimeout(r, 200));
      const existing = mockStore.preferences.get(participantId);
      const updated = {
        participantId,
        confirmed: data.confirmed !== undefined ? data.confirmed : (existing?.confirmed ?? false),
        summaryMarkdown: data.summaryMarkdown || existing?.summaryMarkdown || '',
        constraints: data.constraints,
        lockedAt: existing?.lockedAt,
      };
      mockStore.preferences.set(participantId, updated);
      return updated;
    }

    return request(`/participants/${participantId}/preferences`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // 7. Confirm & Lock Preference Profile
  async confirmPreferences(participantId: string): Promise<{
    participantId: string;
    confirmed: boolean;
    readiness: 'CONFIRMED';
    lockedAt: string;
  }> {
    if (FORCE_MOCK) {
      await new Promise(r => setTimeout(r, 400));
      const now = new Date().toISOString();
      mockStore.preferences.set(participantId, {
        participantId,
        confirmed: true,
        summaryMarkdown: '',
        constraints: [],
        lockedAt: now
      });

      // Update in mock groups
      for (const group of mockStore.groups.values()) {
        const p = group.roster.find(m => m.participantId === participantId);
        if (p) {
          p.status = 'CONFIRMED';
        }
      }

      return {
        participantId,
        confirmed: true,
        readiness: 'CONFIRMED',
        lockedAt: now
      };
    }

    return request(`/participants/${participantId}/preferences/confirm`, {
      method: 'POST'
    });
  },

  // 8a. Fetch the persisted group analysis — every member reads the SAME board
  async getStoredAnalysis(groupId: string): Promise<GroupAnalysisResult | null> {
    try {
      return await request<GroupAnalysisResult>(`/groups/${groupId}/analysis`);
    } catch {
      return null; // 404 = not computed yet
    }
  },

  // 8. Execute Deterministic Group Consensus Analysis
  async getAnalysis(
    groupId: string,
    strategy: 'HYBRID' | 'NASH' | 'LEAST_MISERY' | 'BORDA' | 'NEURAL_ATTENTION' = 'HYBRID',
    options?: { allowPartial?: boolean }
  ): Promise<GroupAnalysisResult> {
    if (FORCE_MOCK) {
      await new Promise(r => setTimeout(r, 1200));

      const topRecommendations: TopRecommendation[] = [
        {
          rank: 1,
          tag: 'BEST_CONSENSUS',
          product: {
            asin: 'B09X1K87Z2',
            modelName: 'LG NanoCell 55" 4K 120Hz Gaming TV',
            brand: 'LG',
            priceInr: 49000,
            screenSizeInches: 55,
            panelType: 'QLED',
            refreshRateHz: 120,
            resolution: '4K',
            hasHdmi21: true,
            bezelColor: 'Silver',
            widthCm: 123.3,
            heightCm: 71.6,
            depthCm: 4.4,
            warrantyYears: 2,
            energyRating: '4 Star',
            os: 'webOS'
          },
          scores: {
            netConsensusScore: 8.11,
            meanUtility: 8.78,
            fairnessPenalty: -0.67,
            individualBreakdown: {
              'Dad': 9.2,
              'Mom': 6.5,
              'Son': 9.8,
              'Daughter': 9.6
            }
          },
          groundedExplanation: "Consenzo's decision engine ranked this product highest because it delivers 120Hz native gaming for Son and a sleek Silver frame for Daughter while remaining strictly under Dad's ₹50,000 budget ceiling. Mom accepts an LG brand compromise (scoring 6.5) to unlock family-wide satisfaction."
        },
        {
          rank: 2,
          tag: 'LOWEST_CONFLICT',
          product: {
            asin: 'B09W1189X1',
            modelName: 'Samsung Crystal 55" 4K UHD Ultra',
            brand: 'Samsung',
            priceInr: 48000,
            screenSizeInches: 55,
            panelType: 'LED',
            refreshRateHz: 60,
            resolution: '4K',
            hasHdmi21: false,
            bezelColor: 'Black',
            widthCm: 123.0,
            heightCm: 71.0,
            depthCm: 5.9,
            warrantyYears: 2,
            energyRating: '3 Star',
            os: 'Tizen'
          },
          scores: {
            netConsensusScore: 7.95,
            meanUtility: 8.58,
            fairnessPenalty: -0.63,
            individualBreakdown: {
              'Dad': 9.5,
              'Mom': 10.0,
              'Son': 6.8,
              'Daughter': 8.0
            }
          },
          groundedExplanation: "Maintains Mom's trusted Samsung brand and Dad's budget, but Son sacrifices 120Hz gaming capability (running at 60Hz)."
        },
        {
          rank: 3,
          tag: 'BEST_VALUE',
          product: {
            asin: 'B08T177XZ9',
            modelName: 'TCL 55" 4K Smart Google TV',
            brand: 'TCL',
            priceInr: 36000,
            screenSizeInches: 55,
            panelType: 'LED',
            refreshRateHz: 60,
            resolution: '4K',
            hasHdmi21: false,
            bezelColor: 'Black',
            widthCm: 123.5,
            heightCm: 71.2,
            depthCm: 7.2,
            warrantyYears: 1,
            energyRating: '3 Star',
            os: 'Google TV'
          },
          scores: {
            netConsensusScore: 7.42,
            meanUtility: 7.85,
            fairnessPenalty: -0.43,
            individualBreakdown: {
              'Dad': 9.8,
              'Mom': 6.5,
              'Son': 6.2,
              'Daughter': 7.2
            }
          },
          groundedExplanation: "Saves the family ₹14,000 below the maximum budget limit, providing high economic utility, but operates at 60Hz with a 1-year warranty."
        }
      ];

      const participantBreakdowns: ParticipantBreakdown[] = [
        {
          participantId: 'usr_dad',
          displayName: 'Dad (Budget & Safety)',
          role: 'COORDINATOR',
          keyRequirements: ['Max budget ceiling ≤ ₹50,000', 'Reliable warranty'],
          utility: 9.2,
          status: 'FULLY_SATISFIED',
          concessionNote: 'Stayed within strict budget ceiling with zero compromise.'
        },
        {
          participantId: 'usr_son',
          displayName: 'Alex (PS5 Gaming & 120Hz)',
          role: 'PARTICIPANT',
          keyRequirements: ['120Hz native refresh rate', 'HDMI 2.1 low latency'],
          utility: 9.8,
          status: 'FULLY_SATISFIED',
          concessionNote: 'Full 120Hz native gaming capability unlocked on PS5.'
        },
        {
          participantId: 'usr_mom',
          displayName: 'Priya (Aesthetics & Brand)',
          role: 'PARTICIPANT',
          keyRequirements: ['Trusted brand', 'Vibrant screen contrast'],
          utility: 7.8,
          status: 'COMPROMISED',
          concessionNote: 'Accepted LG NanoCell over Samsung QLED to support family gaming goals.'
        }
      ];

      return {
        analysisId: generateId('an'),
        groupId,
        catalogVersion: 'smart-tv-v1',
        status: 'COMPLETED',
        topRecommendations,
        allCandidates: [
          ...topRecommendations,
          {
            rank: 4,
            tag: 'VALUE_TIER' as const,
            product: {
              asin: 'B0CHX3L3D6',
              modelName: 'TCL 55" 4K QLED C645 Series',
              brand: 'TCL',
              priceInr: 37990,
              screenSizeInches: 55,
              panelType: 'QLED',
              refreshRateHz: 60,
              resolution: '4K',
              hasHdmi21: false,
              bezelColor: 'Metallic Black',
              widthCm: 122.5,
              heightCm: 70.8,
              depthCm: 7.6,
              warrantyYears: 2,
              energyRating: '3 Star',
              os: 'Google TV'
            },
            scores: {
              netConsensusScore: 7.21,
              meanUtility: 7.65,
              fairnessPenalty: -0.44,
              individualBreakdown: {
                'Dad': 8.9,
                'Mom': 7.5,
                'Son': 6.8,
                'Daughter': 7.4
              }
            },
            groundedExplanation: 'Aggressive value QLED option. Delivers excellent color vibrancy under ₹38,000, but lacks high frame rate gaming.'
          },
          {
            rank: 5,
            tag: 'VALUE_TIER' as const,
            product: {
              asin: 'B0C788S3B8',
              modelName: 'Xiaomi X Pro Series 55" 4K Dolby Vision',
              brand: 'Xiaomi',
              priceInr: 34999,
              screenSizeInches: 55,
              panelType: 'LED',
              refreshRateHz: 60,
              resolution: '4K',
              hasHdmi21: false,
              bezelColor: 'Black',
              widthCm: 122.6,
              heightCm: 71.0,
              depthCm: 8.1,
              warrantyYears: 1,
              energyRating: '3 Star',
              os: 'Google TV'
            },
            scores: {
              netConsensusScore: 6.94,
              meanUtility: 7.32,
              fairnessPenalty: -0.38,
              individualBreakdown: {
                'Dad': 9.2,
                'Mom': 6.8,
                'Son': 5.8,
                'Daughter': 7.5
              }
            },
            groundedExplanation: 'Entry 4K panel with vivid Dolby Vision tuning at an attractive entry price, with 60Hz baseline performance.'
          }
        ],
        participantBreakdowns,
        conflictsDetected: [
          {
            type: 'BUDGET_FEATURE_TRADEOFF',
            description: "Alex's 120Hz gaming requirement normally conflicts with Dad's ₹50,000 budget ceiling. The engine discovered the LG NanoCell at ₹49,000, successfully bridging the gap.",
            participantsInvolved: ['Dad', 'Alex'],
            conflictingAttributes: ['priceInr', 'refreshRateHz'],
            resolutionStrategy: 'LG NanoCell satisfies both constraints without relaxing either hard budget or 120Hz hardware.'
          }
        ]
      };
    }

    return request(`/groups/${groupId}/analysis`, {
      method: 'POST',
      body: JSON.stringify({ strategy, allowPartial: options?.allowPartial }),
      headers: {
        'Idempotency-Key': generateId('idemp')
      }
    });
  },

  // 9. Cast Ratification Vote
  async castVote(params: {
    groupId: string;
    analysisId: string;
    productId: string;
    vote: 'APPROVE' | 'REJECT';
  }): Promise<VoteResult> {
    if (FORCE_MOCK) {
      await new Promise(r => setTimeout(r, 350));
      const groupData = mockStore.groups.get(params.groupId) || mockStore.groups.get(SEED_GROUP_ID)!;
      const total = groupData.roster.length || 4;

      return {
        groupId: params.groupId,
        productId: params.productId,
        approvalsCount: total,
        totalParticipants: total,
        isUnanimous: true,
        decisionStatus: 'DECIDED'
      };
    }

    return request(`/groups/${params.groupId}/votes`, {
      method: 'POST',
      body: JSON.stringify({
        analysisId: params.analysisId,
        productId: params.productId,
        vote: params.vote
      })
    });
  },

  // 10. Get Amazon Catalog Inventory
  async getCatalog(category: string = 'smart_tvs'): Promise<{
    category: string;
    count: number;
    products: any[];
  }> {
    if (FORCE_MOCK) {
      const tvCatalog = await import('../../../catalog/smart_tvs_v1.json');
      return {
        category,
        count: (tvCatalog as any).default?.length || 35,
        products: (tvCatalog as any).default || tvCatalog
      };
    }

    try {
      const res = await request<any>(`/catalog/${category}`);
      return res;
    } catch {
      // Resilient fallback to bundled catalog
      const tvCatalog = await import('../../../catalog/smart_tvs_v1.json');
      return {
        category,
        count: (tvCatalog as any).default?.length || 35,
        products: (tvCatalog as any).default || tvCatalog
      };
    }
  },

  // 11. Get Full Multi-Category Inventory
  async getFullInventory(): Promise<{
    categories: Array<{ id: string; name: string; count: number; icon: string }>;
    inventory: Record<string, any[]>;
    totalProducts: number;
  }> {
    if (FORCE_MOCK) {
      const tvs = (await import('../../../catalog/smart_tvs_v1.json')).default;
      const laptops = (await import('../../../catalog/laptops_v1.json')).default;
      const soundbars = (await import('../../../catalog/soundbars_v1.json')).default;
      return {
        categories: [
          { id: 'smart_tvs', name: 'Smart TVs & Displays', count: tvs.length, icon: '📺' },
          { id: 'laptops', name: 'Laptops & Workstations', count: laptops.length, icon: '💻' },
          { id: 'soundbars', name: 'Soundbars & Home Audio', count: soundbars.length, icon: '🔊' },
        ],
        inventory: {
          smart_tvs: tvs,
          laptops,
          soundbars,
        },
        totalProducts: tvs.length + laptops.length + soundbars.length,
      };
    }

    try {
      return await request<any>('/catalog');
    } catch {
      const tvs = (await import('../../../catalog/smart_tvs_v1.json')).default;
      const laptops = (await import('../../../catalog/laptops_v1.json')).default;
      const soundbars = (await import('../../../catalog/soundbars_v1.json')).default;
      return {
        categories: [
          { id: 'smart_tvs', name: 'Smart TVs & Displays', count: tvs.length, icon: '📺' },
          { id: 'laptops', name: 'Laptops & Workstations', count: laptops.length, icon: '💻' },
          { id: 'soundbars', name: 'Soundbars & Home Audio', count: soundbars.length, icon: '🔊' },
        ],
        inventory: {
          smart_tvs: tvs,
          laptops,
          soundbars,
        },
        totalProducts: tvs.length + laptops.length + soundbars.length,
      };
    }
  }
};
