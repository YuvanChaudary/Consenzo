# 11 — User Stories & Acceptance Criteria

## Document Metadata
- **Document Type**: Agile User Stories & Acceptance Criteria
- **Status**: Approved Foundation
- **Owner**: Lead Technical Product Manager
- **Dependencies**: [01_PROBLEM_STATEMENT.md](file:///d:/Consenzo%20amazon%20hackathon/docs/01_PROBLEM_STATEMENT.md), [10_REQUIREMENTS.md](file:///d:/Consenzo%20amazon%20hackathon/docs/10_REQUIREMENTS.md)
- **Downstream References**: [12_USER_FLOWS.md](file:///d:/Consenzo%20amazon%20hackathon/docs/12_USER_FLOWS.md), [13_PERMISSION_MODEL.md](file:///d:/Consenzo%20amazon%20hackathon/docs/13_PERMISSION_MODEL.md), [90_EVALUATION.md](file:///d:/Consenzo%20amazon%20hackathon/docs/90_EVALUATION.md)

---

## 1. Story Matrix Overview

| Story ID | Role | Feature Area | Goal | Value Delivered |
| :--- | :--- | :--- | :--- | :--- |
| **US-01** | Purchase Coordinator | Session Setup | Create a decision session and invite family/roommates | Centralized coordination without friction |
| **US-02** | Participant | Private Interview | Privately express budget, desires, and fears to AI | Honest disclosure without social pressure |
| **US-03** | Participant | Profile Confirmation | Review and ratify structured understanding before sharing | User control and trust in the system |
| **US-04** | Group Member | Shared Decision Board | View mathematically ranked compromises and trade-offs | Elimination of endless circular debate |
| **US-05** | Group Member | Ratification & Voting | Vote to confirm the agreed-upon product | Explicit collective commitment |

---

## 2. Detailed User Stories & Acceptance Criteria

### US-01: Session Creation and Participant Invitation
**As a** Group Purchase Coordinator (e.g., Dad or Lead Roommate),  
**I want to** create a new shared purchase room and generate invite links for my group,  
**So that** we can align on selecting a shared product without chaotic group chats.

#### Acceptance Criteria
1. Given the landing page, when I enter a session title (e.g., "Family TV") and select "Smart TVs", a session record is created in DynamoDB with status `AWAITING_INTERVIEWS`.
2. The UI provides a copyable share link containing the unique `sessionId` and an optional numeric room PIN.
3. The coordinator dashboard displays a participant roster indicating who has joined and who has completed their interview.

---

### US-02: Private Adaptive Conversational Interview
**As a** Group Participant (e.g., Dad, Mom, Son, or Daughter),  
**I want to** converse 1-on-1 with an empathetic AI assistant in complete privacy,  
**So that** I can express what I truly want and what I cannot tolerate without being talked over.

#### Acceptance Criteria
1. When I open my invite link, the AI greets me with an open-ended question ("What matters most to you in choosing this TV?").
2. The AI adapts to my replies rather than displaying a static questionnaire.
3. The AI detects whether my statements are hard constraints, soft preferences, nice-to-haves, or dealbreakers.
4. If I express a contradiction or ambiguous boundary (e.g., "around 50k"), the AI asks a clarifying question.
5. The interview concludes within 3 to 5 conversational turns.
6. My raw private messages are never shown to other group members.

---

### US-03: Preference Profile Review & Ratification
**As a** Group Participant,  
**I want to** inspect a clear summary of what the AI learned about my preferences before anything is shared,  
**So that** I can correct any misunderstandings and ensure the math works in my interest.

#### Acceptance Criteria
1. Before committing my profile, the AI renders a structured bulleted summary of:
   - Budget ceiling and flexibility
   - Non-negotiable must-haves & dealbreakers
   - Preferred attributes and brands
   - Trade-off allowances
2. I am given the choice to confirm ("Yes, this is accurate") or request an adjustment ("Actually, change budget to 52k").
3. Only upon explicit approval is my profile marked `confirmed = true` and submitted to the group constraint model.

---

### US-04: Group Decision Board & Trade-off Inspection
**As a** Group Member,  
**I want to** see the Top 2–3 consensus products on a shared dashboard with individual satisfaction scores and trade-off explanations,  
**So that** everyone understands why the recommended compromise is fair.

#### Acceptance Criteria
1. Once all participants have completed their interviews, the shared board unlocks.
2. The Top 1 recommendation is displayed with a net consensus score (e.g., 8.7 / 10).
3. The UI provides an individual satisfaction breakdown showing each participant's score (e.g., Dad: 9.5, Mom: 10, Son: 7.2, Daughter: 8.1).
4. A grounded, plain-English explanation generated from the deterministic score breaks down what each person gained and what compromise was accepted.
5. All product specs (screen size, price, refresh rate, warranty) match the verified catalog.

---

### US-05: Group Ratification & Action
**As a** Group Member,  
**I want to** cast my vote on the final recommended product and access an outbound link to Amazon,  
**So that** our group achieves closure and can complete the purchase immediately.

#### Acceptance Criteria
1. Each participant can click a "Vote / Confirm" button on their device.
2. When unanimous approval is reached, the UI displays a celebration state ("Consensus Achieved!").
3. A clear "View on Amazon" outbound button directs users to the agreed product with exact ASIN.
