# 12 — User Flows & State Progression

## Document Metadata
- **Document Type**: Interaction Architecture & Sequence Flows
- **Status**: Approved Foundation
- **Owner**: Lead Product Architect & Frontend Engineer
- **Dependencies**: [10_REQUIREMENTS.md](file:///d:/Consenzo%20amazon%20hackathon/docs/10_REQUIREMENTS.md), [11_USER_STORIES.md](file:///d:/Consenzo%20amazon%20hackathon/docs/11_USER_STORIES.md)
- **Downstream References**: [13_PERMISSION_MODEL.md](file:///d:/Consenzo%20amazon%20hackathon/docs/13_PERMISSION_MODEL.md), [22_TECH_STACK_FLOW.md](file:///d:/Consenzo%20amazon%20hackathon/docs/22_TECH_STACK_FLOW.md), [23_DATA_FLOW.md](file:///d:/Consenzo%20amazon%20hackathon/docs/23_DATA_FLOW.md), [50_FRONTEND_ARCHITECTURE.md](file:///d:/Consenzo%20amazon%20hackathon/docs/50_FRONTEND_ARCHITECTURE.md)

---

## 1. End-to-End Macro Flow

The Consenzo user journey progresses through five deterministic phases:

```text
  PHASE 1: CREATION          PHASE 2: DISCOVERY        PHASE 3: CONSENSUS      PHASE 4: BOARD          PHASE 5: RATIFICATION
 ┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────────┐
 │ Coordinator     │       │ 2–4 Members     │       │ Deterministic   │     │ Shared Board    │     │ Group Vote          │
 │ Creates Session │──────►│ Private Chat    │──────►│ Scoring Engine  │────►│ Top 3 Ranking   │────►│ & Outbound Link     │
 │ & Invites Group │       │ with NVIDIA LLM │       │ Lambda Pipeline │     │ & Trade-offs    │     │ to Amazon ASIN      │
 └─────────────────┘       └─────────────────┘       └─────────────────┘     └─────────────────┘     └─────────────────────┘
```

---

## 2. Sequence Diagram: Complete Session Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor C as Coordinator (Dad)
    actor P as Participant (Son)
    participant FE as Frontend Web App (Amplify)
    participant API as API Gateway
    participant L as Lambda Orchestrator
    participant SEC as Secrets Manager
    participant DB as DynamoDB
    participant AI as NVIDIA API (Nemotron)
    participant ENG as Deterministic Scoring Engine

    %% Phase 1: Creation
    C->>FE: Create Session ("Family TV", Smart TVs)
    FE->>API: POST /sessions
    API->>L: handleCreateSession()
    L->>DB: PutItem(SessionState: AWAITING_INTERVIEWS)
    L-->>FE: Return sessionId & inviteLinks
    C->>P: Shares invite URL via WhatsApp/SMS

    %% Phase 2: Private Discovery
    P->>FE: Opens Invite URL (participantId token)
    FE->>API: POST /chat/start
    API->>L: handleStartChat()
    L->>AI: Generate Open-Ended Greeting
    AI-->>L: "What matters most to you in this TV?"
    L-->>FE: Return AI Greeting
    
    loop Adaptive Interview (3-5 Turns)
        P->>FE: Types Message ("I need 120Hz for gaming")
        FE->>API: POST /chat/message
        API->>L: handleChatMessage()
        L->>AI: Extract Preferences + Check Uncertainty
        AI-->>L: { extracted, confidence, next_question }
        L->>DB: UpdateItem(ParticipantPrivateState)
        L-->>FE: Display AI Response
    end

    %% Phase 3: Profile Confirmation
    L->>AI: Generate Profile Summary
    AI-->>L: Markdown Summary of Constraints
    L-->>FE: Display Summary to P
    P->>FE: Clicks "Confirm Profile"
    FE->>API: POST /preferences/confirm
    API->>L: handleConfirmPreferences()
    L->>DB: Set confirmed=true

    %% Phase 4: Group Evaluation
    Note over L,DB: All 2-4 participants marked confirmed
    L->>ENG: executeConsensusScoring(GroupProfiles, Catalog)
    ENG->>ENG: 1. Filter hard constraints
    ENG->>ENG: 2. Calculate individual utilities
    ENG->>ENG: 3. Compute fairness & group score
    ENG->>ENG: 4. Rank Top 3 options
    ENG-->>L: Return deterministic results & deltas
    L->>AI: Generate trade-off explanations
    AI-->>L: Explanations grounded strictly in math
    L->>DB: PutItem(ConsensusResults)
    L->>DB: UpdateSession(State: BOARD_READY)

    %% Phase 5: Shared Board & Vote
    C->>FE: Views Shared Board
    P->>FE: Views Shared Board
    FE->>API: GET /sessions/{id}/consensus
    API->>L: getConsensusResults()
    L-->>FE: Return Top 3, radar scores, explanations
    P->>FE: Casts Vote ("Approve Samsung A")
    C->>FE: Casts Vote ("Approve Samsung A")
    FE-->>C: Consensus Ratified! Outbound Amazon Link displayed
```

---

## 3. Micro-Flows & Edge Cases

### 3.1 Edge Case A: Irreconcilable Hard Constraints
When two participants specify mutually incompatible hard boundaries (e.g., Dad specifies `max_price <= 45000` while Son specifies `min_refresh_rate >= 120Hz`, but no 120Hz TV exists below ₹48,000):
1. The **Deterministic Engine** flags `ZERO_FEASIBLE_PRODUCTS`.
2. Instead of crashing, the engine generates **Relaxation Branches**:
   - *Branch A*: Keep Dad's budget, relax Son's refresh rate to 60Hz.
   - *Branch B*: Keep Son's 120Hz, calculate minimum budget stretch (e.g., ₹48,000, +₹3,000).
3. The **Shared Board** renders a high-priority banner:
   > *"Notice: Complete agreement on all strict constraints is impossible at current prices. Consenzo has calculated the two fairest compromise pathways below for family discussion."*

### 3.2 Edge Case B: Slow or Non-Responding Participant
If one invited participant does not complete their private interview within 15 minutes:
- The Coordinator dashboard displays participant status badges (`Dad: Confirmed`, `Mom: Confirmed`, `Son: In Progress`, `Daughter: Waiting`).
- The Coordinator has an explicit option: *"Proceed with 3 confirmed members"*, allowing the group to compute consensus without being blocked indefinitely.
