# 10 — System & Functional Requirements Specification

## Document Metadata
- **Document Type**: Detailed Requirements Specification (Functional & Non-Functional)
- **Status**: Approved Foundation
- **Owner**: Lead Product Architect & Systems Engineer
- **Dependencies**: [00_PROJECT_CHARTER.md](file:///d:/Consenzo%20amazon%20hackathon/docs/00_PROJECT_CHARTER.md), [01_PROBLEM_STATEMENT.md](file:///d:/Consenzo%20amazon%20hackathon/docs/01_PROBLEM_STATEMENT.md), [04_MVP_SCOPE.md](file:///d:/Consenzo%20amazon%20hackathon/docs/04_MVP_SCOPE.md)
- **Downstream References**: [11_USER_STORIES.md](file:///d:/Consenzo%20amazon%20hackathon/docs/11_USER_STORIES.md), [12_USER_FLOWS.md](file:///d:/Consenzo%20amazon%20hackathon/docs/12_USER_FLOWS.md), [13_PERMISSION_MODEL.md](file:///d:/Consenzo%20amazon%20hackathon/docs/13_PERMISSION_MODEL.md), [20_SYSTEM_ARCHITECTURE.md](file:///d:/Consenzo%20amazon%20hackathon/docs/20_SYSTEM_ARCHITECTURE.md), [30_CONSENZO_AGENT.md](file:///d:/Consenzo%20amazon%20hackathon/docs/30_CONSENZO_AGENT.md)

---

## 1. Functional Requirements (FR)

### FR-01: Decision Session Management
- **FR-01.1**: The system shall permit a decision creator (e.g., Household Head or Roommate) to initialize a new decision room specifying a topic (e.g., "Living Room TV") and category ("Smart TVs").
- **FR-01.2**: The system shall generate a unique, cryptographically random `sessionId` and shareable invitation URLs for 2 to 4 participants.
- **FR-01.3**: The creator shall be able to monitor participant readiness status (e.g., "Waiting", "Interview in Progress", "Preferences Confirmed").

### FR-02: Adaptive Conversational Preference Elicitation
- **FR-02.1**: The system shall provide a private, 1-on-1 text conversation interface for each participant powered by the NVIDIA hosted API (`nvidia/llama-3.3-nemotron-super-49b-v1.5`) via the `LLMProvider` abstraction (with reasoning disabled by default via `/no_think` to optimize conversational latency).
- **FR-02.2 (Open-Ended Initiation)**: The agent must initiate the interview with broad, open-ended discovery (e.g., *"What matters most to you in choosing this TV?"*) rather than displaying static questionnaires or attribute checklists.
- **FR-02.3 (Uncertainty-Driven Probing)**: The agent must track internal confidence $[0.0, 1.0]$ per extracted candidate attribute and only formulate follow-up questions when uncertainty materially impacts ranking.
- **FR-02.4 (Semantic Strength Classification)**: The agent must classify statements into:
  - `dealbreaker`: Hard rejection boundary.
  - `hard_constraint`: Mandatory constraint gating.
  - `soft_preference`: Desirable attribute with penalty for divergence.
  - `nice_to_have`: Low-weight modifier.
- **FR-02.5 (Intrapersonal Contradiction Resolution)**: When a participant expresses incompatible goals (e.g., minimum price and top-tier display technology), the agent shall detect the contradiction and ask the participant to establish priority.
- **FR-02.6 (Range & Trade-Off Modeling)**: The agent shall support flexible ranges (`preferred: 55"`, `acceptable: 50"`) and compensating relationships (`"lower price compensates for smaller size"`).
- **FR-02.7 (Intelligent Termination & Conversational Budget)**: The agent shall terminate the interview within 3 to 5 turns once critical budget status, primary preferences, and dealbreakers are established.
- **FR-02.8 (Summary Ratification)**: Before committing the profile, the agent must present a structured, human-readable summary and obtain explicit confirmation (`confirmedByParticipant = true`).
- **FR-02.9 (Living Preference Model)**: If the participant modifies their position during confirmation, the agent shall update the working model before committing.

### FR-03: Privacy Isolation & Sanitization
- **FR-03.1**: Raw private conversational text and personal anecdotes shall NEVER be exposed to other participants or included in group dashboard payloads.
- **FR-03.2**: Only sanitized, strongly-typed JSON preference models with mathematical weights and provenance metadata shall flow into the group constraint aggregator.

### FR-04: Deterministic Constraint & Consensus Engine
- **FR-04.1 (Zero LLM Ranking)**: Product ranking and scoring must be computed exclusively in deterministic software (TypeScript Lambda), strictly prohibiting LLM generative sorting.
- **FR-04.2 (Gating & Dealbreaker Pruning)**: Products violating any participant's confirmed hard constraints or dealbreakers shall receive a hard rejection flag.
- **FR-04.3 (Individual Utility Scoring)**: For each product $x$ and participant $m$, the engine shall compute normalized utility $u_m(x) \in [0.0, 10.0]$.
- **FR-04.4 (Fairness & Anti-Tyranny Calculation)**: The engine shall penalize options that achieve high mean satisfaction by severely sacrificing an individual participant ($S_{group} = \bar{u} - \lambda \sigma(u)$).
- **FR-04.5 (Conflict Detection)**: If hard constraints across participants are mutually exclusive, the engine shall flag a Group Conflict and compute optimal relaxation branches.

### FR-05: Grounded Explanation Generation
- **FR-05.1**: The system shall generate natural language explanations grounded strictly in the deterministic engine's mathematical scores, attribute deltas, and satisfied/violated constraints.
- **FR-05.2**: Explanations must clearly state what trade-offs each participant is accepting.

### FR-06: Shared Decision Board & Group Vote
- **FR-06.1**: The system shall render an interactive shared board displaying the Top 2–3 ranked options.
- **FR-06.2**: The board shall display individual satisfaction breakdowns (radar or comparative bar metrics) for complete transparency.
- **FR-06.3**: Each participant shall have an interactive voting widget to ratify or reject the final compromise.
- **FR-06.4**: Each product card must provide verified specifications, ASIN, and an outbound link to Amazon.

---

## 2. Non-Functional Requirements (NFR)

### NFR-01: Performance & Latency
- **NFR-01.1**: AI conversational turn response latency (API Gateway + Lambda + NVIDIA hosted API) shall be under 2.5 seconds (p95).
- **NFR-01.2**: Deterministic consensus calculation for 35 products across 4 participants shall execute in under 20 milliseconds in Lambda.
- **NFR-01.3**: Shared decision board page load shall complete in under 1.5 seconds over standard mobile broadband.

### NFR-02: Determinism & Auditability
- **NFR-02.1**: Identical participant preference JSON profiles evaluated against the same catalog must yield mathematically identical scores and rankings across all runs.
- **NFR-02.2**: Every score component must be traceable to a specific constraint or preference item with provenance metadata.

### NFR-03: Security & Data Privacy
- **NFR-03.1**: Network communication must be encrypted in transit via TLS (API Gateway HTTP APIs use a TLS 1.2 security policy as the minimum security policy and support TLS 1.3 traffic).
- **NFR-03.2**: DynamoDB tables must be encrypted at rest using AWS's default encryption with an AWS-owned key for the MVP.
- **NFR-03.3**: No AWS or NVIDIA API keys, secrets, or credentials shall be committed to git or exposed in client bundles. `NVIDIA_API_KEY` must be retrieved at runtime from AWS Secrets Manager by Lambda and never sent to the frontend.

### NFR-04: Reliability & Operational Simplicity
- **NFR-04.1**: 100% serverless architecture with zero EC2 instances or stateful servers to maintain.
- **NFR-04.2**: Graceful catalog fallback: If an extracted preference refers to an unmapped attribute, it must not crash the scoring engine.

### NFR-05: Usability & Mobile Responsiveness
- **NFR-05.1**: The UI must render seamlessly on mobile viewports (375px width minimum) and desktop monitors without horizontal scroll.
- **NFR-05.2**: The shared board must visually differentiate between the #1 recommended compromise and alternative runners-up.
