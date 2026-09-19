# 50 — Frontend Architecture & Component Specification

## Document Metadata
- **Document Type**: Client Architecture & UI Component Blueprint
- **Status**: Implementation-Critical Frozen Specification
- **Owner**: Frontend Architect & UI Engineer
- **Dependencies**: [10_REQUIREMENTS.md](file:///d:/Consenzo%20amazon%20hackathon/docs/10_REQUIREMENTS.md), [12_USER_FLOWS.md](file:///d:/Consenzo%20amazon%20hackathon/docs/12_USER_FLOWS.md), [20_SYSTEM_ARCHITECTURE.md](file:///d:/Consenzo%20amazon%20hackathon/docs/20_SYSTEM_ARCHITECTURE.md), [21_TECH_STACK.md](file:///d:/Consenzo%20amazon%20hackathon/docs/21_TECH_STACK.md)
- **Downstream References**: [70_API_CONTRACTS.md](file:///d:/Consenzo%20amazon%20hackathon/docs/70_API_CONTRACTS.md), [71_GROUP_API.md](file:///d:/Consenzo%20amazon%20hackathon/docs/71_GROUP_API.md), [72_CONSENZO_API.md](file:///d:/Consenzo%20amazon%20hackathon/docs/72_CONSENZO_API.md), [81_DATA_PRIVACY.md](file:///d:/Consenzo%20amazon%20hackathon/docs/81_DATA_PRIVACY.md)

---

## 1. Architectural Philosophy & Simplicity Invariant

The Consenzo frontend is built as a lightweight, reactive Single-Page Application (SPA) using **React 18, Vite, and Vanilla CSS with custom design tokens**.

```text
 ┌─────────────────────────────────────────────────────────────┐
 │                 FRONTEND CORE TENETS                        │
 │                                                             │
 │  1. Zero State Management Bloat: Use React Context + State  │
 │     hooks. No Redux, Zustand, or MobX for the 2-day MVP.    │
 │  2. Server-Authoritative Logic: The client NEVER calculates  │
 │     scores, ranks items, or infers fairness metrics.        │
 │  3. Absolute Data Boundary: Another member's raw chat is   │
 │     physically absent from the DOM and network payloads.    │
 │  4. Radical Clarity on the Shared Board: In 10 seconds,     │
 │     the user must understand who sacrificed what and why.   │
 └─────────────────────────────────────────────────────────────┘
```

---

## 2. Directory Structure & State Tree

```text
frontend/src/
├── assets/                  # SVG icons, product image placeholders
├── components/              # Pure presentation & reusable components
│   ├── Button.jsx           # Accessible primary/secondary buttons
│   ├── Card.jsx             # Glassmorphism container cards
│   ├── Header.jsx           # Global status & breadcrumb bar
│   ├── RadarScore.jsx       # Canvas/SVG satisfaction polygon
│   ├── ConflictBanner.jsx   # Visual warning & relaxation picker
│   └── OutboundAmazon.jsx   # ASIN deep-link CTA button
├── context/                 # Application Context Providers
│   ├── SessionContext.jsx   # groupId, role, inviteUrl, sessionState
│   └── ParticipantContext.jsx # participantId, token, displayName
├── hooks/                   # Custom business logic hooks
│   ├── useChat.js           # Adaptive interview message loop
│   ├── useGroupPolling.js   # Lightweight 3s polling for group readiness
│   └── useConsensus.js      # Fetch and cache deterministic analysis
├── routes/                  # View modules mapped to application routes
│   ├── Landing.jsx          # Public introduction & start button
│   ├── CreateGroup.jsx      # Room initialization form
│   ├── JoinGroup.jsx        # Invite code verification screen
│   ├── GroupLobby.jsx       # Roster readiness tracking
│   ├── PrivateInterview.jsx # 1-on-1 AI discovery drawer
│   ├── PreferenceReview.jsx # Constraint summary ratification modal
│   ├── AnalysisProgress.jsx # Loading & calculation transition screen
│   ├── RecommendationBoard.jsx # PRIMARY WOW SCREEN: Top 3 & Radar
│   └── ErrorRecovery.jsx    # Network & session retry views
├── services/                # API client adapters
│   └── api.js               # Typed fetch wrappers with Bearer tokens
├── styles/                  # Curated Vanilla CSS tokens & utilities
│   ├── tokens.css           # Color palette, spacing, typography
│   └── index.css            # Global resets and responsive grid
├── App.jsx                  # Route definitions and context provider tree
└── main.jsx                 # Vite entry point
```

---

## 3. Concrete Route Hierarchy

| Route Path | View Module | Access Restriction | Primary Purpose |
| :--- | :--- | :--- | :--- |
| `/` | `Landing` | Public | Value proposition, product explainer, "Start New Decision" |
| `/create` | `CreateGroup` | Public | Input title, select category ("Smart TVs"), creator name |
| `/join/:inviteCode` | `JoinGroup` | Public | Accept invite, input display name, receive participant token |
| `/group/:groupId` | `GroupLobby` | Session Bearer | Participant roster status, share invite link, "Begin Chat" CTA |
| `/group/:groupId/interview` | `PrivateInterview`| Participant Token | 1-on-1 private adaptive dialogue with Consenzo Agent |
| `/group/:groupId/review` | `PreferenceReview` | Participant Token | Review structured bulleted summary, confirm or edit profile |
| `/group/:groupId/analysis` | `AnalysisProgress` | Session Bearer | Synchronous polling transition while engine processes catalog |
| `/group/:groupId/decision` | `RecommendationBoard`| Session Bearer | Top-3 ranked compromises, radar chart, trade-offs, group vote |

---

## 4. Frontend Data Boundaries: Private vs. Shared

The frontend code enforces a strict boundary between what is rendered in private views versus group views:

```text
 ┌─────────────────────────────────────────────────────────────┐
 │                      PRIVATE DOMAIN                         │
 │        (Rendered ONLY on /interview and /review)            │
 │                                                             │
 │  • Participant's live chat input and message stream         │
 │  • Ephemeral conversational history                         │
 │  • Unconfirmed candidate constraint drafts                  │
 ├─────────────────────────────────────────────────────────────┤
 │                      SHARED DOMAIN                          │
 │         (Rendered on /group, /analysis, and /decision)      │
 │                                                             │
 │  • Member display names & readiness badges ("Confirmed")    │
 │  • Confirmed preference parameter tags (e.g. Budget <= 50k) │
 │  • Deterministic product ranking (Top 3 items)              │
 │  • Per-person satisfaction scores [0.0 to 10.0]             │
 │  • Conflict relaxation branches                             │
 │  • Grounded plain-English trade-off explanation             │
 │  • Ratification vote status & celebration banner            │
 └─────────────────────────────────────────────────────────────┘
```

> **Security Rule**: The frontend never receives another participant's raw chat transcript. API Gateway and Lambda enforce this at the HTTP layer; the client application state physically contains zero foreign messages.

---

## 5. The Shared Decision Board: UX & Visual Hierarchy

The **Shared Decision Board (`/decision`)** is the centerpiece of the Consenzo user experience. Within 15 seconds of landing on the screen, participants must understand:
1. **The Winning Compromise**: Clearly badged as `#1 Best Group Consensus`.
2. **The Numerical Proof**: A visual radar or comparative bar breakdown of individual satisfaction (e.g., Dad: 9.2, Mom: 6.5, Son: 9.8, Daughter: 9.6).
3. **The Trade-Off Explanation**: Grounded natural language explicitly articulating why this product was chosen over alternatives.
4. **Viable Alternatives**: Cards for Option #2 (`Lowest Disagreement`) and Option #3 (`Best Budget Value`).
5. **The Democratic Action**: A "Vote to Ratify" toggle for every participant.

```text
 ┌────────────────────────────────────────────────────────────────────────┐
 │                     SHARED DECISION BOARD: UX MOCK                     │
 ├────────────────────────────────────────────────────────────────────────┤
 │ [Badge: CONSENZO RANK #1 COMPROMISE]                                   │
 │ LG NanoCell 55" 4K Gaming TV (₹49,000)                                 │
 │ Group Consensus Score: 8.11 / 10 | Disagreement Penalty: -0.67         │
 ├────────────────────────────────────────────────────────────────────────┤
 │ SATISFACTION BREAKDOWN (RADAR / BARS):                                 │
 │ Dad:      █████████░  9.2/10  (Under ₹50k ceiling, 2yr warranty)       │
 │ Mom:      ██████░░░░  6.5/10  (LG brand accepted; reliable tier 1)     │
 │ Son:      ██████████  9.8/10  (120Hz native VRR + HDMI 2.1 gaming)     │
 │ Daughter: ██████████  9.6/10  (Silver metallic bezel match)            │
 ├────────────────────────────────────────────────────────────────────────┤
 │ WHY IT WON:                                                            │
 │ "Consenzo's decision engine ranked this product highest because it     │
 │ satisfies Dad's budget, Son's 120Hz gaming, and Daughter's silver      │
 │ frame. Mom accepted an LG brand compromise to unlock gaming and        │
 │ design without exceeding the family's financial limit."                │
 ├────────────────────────────────────────────────────────────────────────┤
 │ [VOTE TO RATIFY THIS CHOICE]        [VIEW ON AMAZON (ASIN B09X1K87Z2)] │
 └────────────────────────────────────────────────────────────────────────┘
```

---

## 6. AI UI Boundary & Attribution Rules

To preserve scientific credibility and user trust:
- **Forbidden UI Phrasing**: *"The AI chose this TV for you"*, *"AI Recommendation"*, *"Our AI calculated your perfect match"*.
- **Mandatory UI Phrasing**:
  - *"Consenzo's decision engine ranked this highest."*
  - *"Deterministic multi-objective optimization score: 8.11 / 10."*
  - *"Fairness-weighted compromise based on confirmed family preferences."*
- The AI's role is strictly credited as: *"Natural Language Interviewer & Trade-Off Explainer"*.
