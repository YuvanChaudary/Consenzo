# 110 — Architectural & Product Decisions Log (ADR)

## Document Metadata
- **Document Type**: Architecture Decision Records (ADR)
- **Status**: Living Document
- **Owner**: Lead Systems Architect
- **Dependencies**: [00_PROJECT_CHARTER.md](file:///d:/Consenzo%20amazon%20hackathon/docs/00_PROJECT_CHARTER.md), [04_MVP_SCOPE.md](file:///d:/Consenzo%20amazon%20hackathon/docs/04_MVP_SCOPE.md), [05_NON_GOALS.md](file:///d:/Consenzo%20amazon%20hackathon/docs/05_NON_GOALS.md)

---

## Decision Index

| Decision ID | Title | Status | Date |
| :--- | :--- | :--- | :--- |
| **ADR-001** | Deterministic Scoring Engine over LLM Ranking | **Approved** | 2026-09-15 |
| **ADR-002** | Single Category (Smart TVs) with Static Catalog for 2-Day MVP | **Approved** | 2026-09-15 |
| **ADR-003** | Private Preference Elicitation vs. Public Group Chat | **Approved** | 2026-09-15 |
| **ADR-004** | Target AWS Serverless Architecture with NVIDIA Hosted Inference | **Approved** | 2026-09-15 |
| **ADR-005** | Exclusion of Amazon Direct Cart / 1-Click Checkout | **Approved** | 2026-09-15 |
| **ADR-006** | Consenzo Hybrid Fairness Engine (Maximin Floor + Dispersion Penalty) | **Approved** | 2026-09-15 |
| **ADR-007** | Session Authentication, Session Management & Authorization (Cognito Deferral) | **Approved** | 2026-09-15 |
| **ADR-008** | Adaptive Conversational Elicitation over Fixed Survey Forms | **Approved** | 2026-09-15 |
| **ADR-009** | Category-Agnostic Core with Pluggable Category Adapters | **Approved** | 2026-09-15 |
| **ADR-010** | TypeScript (Node.js 20) for Serverless Compute & Engine | **Approved** | 2026-09-15 |
| **ADR-011** | React 18 + Vite SPA for Frontend Client | **Approved** | 2026-09-15 |
| **ADR-012** | Provider-Neutral LLM Abstraction with NVIDIA Hosted Inference Default | **Approved** | 2026-09-15 |
| **ADR-013** | Deferral of Step Functions and EventBridge for MVP | **Approved** | 2026-09-15 |
| **ADR-014** | Pareto Multi-Candidate Framing for Shared Board | **Approved** | 2026-09-15 |
| **ADR-015** | Controlled Constraint Relaxation Protocol for Collisions | **Approved** | 2026-09-15 |
| **ADR-016** | Controlled Benchmark Catalog over Live Scraping/APIs | **Approved** | 2026-09-15 |
| **ADR-017** | In-Memory Catalog Gating & Indexing (Scale-to-Zero) | **Approved** | 2026-09-15 |
| **ADR-018** | Missing Attribute Penalty & Conservative Gating Policy | **Approved** | 2026-09-15 |
| **ADR-019** | Single Monolithic Lambda Handler with Internal Routing for MVP | **Approved** | 2026-09-15 |
| **ADR-020** | Configurable LLM Selection & Provider Decoupling | **Approved** | 2026-09-15 |
| **ADR-021** | Active Migration to NVIDIA Hosted API (`llama-3.3-nemotron-super-49b-v1.5`) with AWS Secrets Manager | **Approved** | 2026-09-16 |

---

## ADR Details

### ADR-001: Deterministic Scoring Engine over LLM Ranking
- **Context**: LLMs can generate product recommendations, but suffer from hallucinated specs, non-reproducible rankings, and hidden constraint dropping.
- **Decision**: Restrict LLMs strictly to natural language interview, preference extraction, and explanation generation. Implement candidate validation, individual utility scoring, conflict detection, and fairness ranking in deterministic TypeScript code.
- **Consequences**: Guaranteed mathematical reproducibility, zero spec hallucination, full auditability, and distinct technical defensibility.

### ADR-002: Single Category (Smart TVs) with Static Catalog for 2-Day MVP
- **Context**: A 48-hour hackathon requires razor-sharp execution. Live scraping or broad multi-category data ingestion introduces severe operational risk.
- **Decision**: Lock the MVP to one category—Smart TVs—represented by a verified 35-item JSON catalog stored in S3.
- **Consequences**: Allows deep conflict modeling (price vs. refresh rate vs. brand vs. size) while eliminating external network/anti-bot failure modes.

### ADR-003: Private Preference Elicitation vs. Public Group Chat
- **Context**: In public group chats, dominant participants anchor decisions and quieter participants conceal their true priorities.
- **Decision**: Participants conduct individual 1-on-1 conversations with Consenzo AI. Raw transcripts remain private; only structured parametric constraints flow to the group model.
- **Consequences**: High-fidelity preference discovery without interpersonal friction.

### ADR-004: Target AWS Serverless Architecture with NVIDIA Hosted Inference
- **Context**: Infrastructure must be cost-effective, zero-maintenance, rapidly deployable, and capable of high-performance LLM inference without infrastructure lock-in.
- **Decision**: Deploy React frontend to Amplify Hosting; backend logic to Lambda via API Gateway HTTP API; sessions in DynamoDB; static catalog in S3; monitoring in CloudWatch; API credentials in AWS Secrets Manager; and LLM elicitation inference via NVIDIA hosted API (`nvidia/llama-3.3-nemotron-super-49b-v1.5`) through a decoupled `LLMProvider` abstraction. Defer Step Functions and EventBridge unless asynchronous timeouts mandate them.
- **Consequences**: Minimal moving parts, sub-second compute latency, zero idle cost, and complete decoupling of AWS orchestration from model execution.
- **Consequences**: Minimal moving parts, sub-second latency, zero idle cost.

### ADR-005: Exclusion of Amazon Direct Cart / 1-Click Checkout
- **Context**: Programmatic cart insertion requires Amazon affiliate credentials or live cookie sessions.
- **Decision**: Provide outbound deep links with ASIN parameters rather than in-app checkout execution.
- **Consequences**: Eliminates Amazon credential blockers and zero legal risk.

### ADR-007: Session Authentication, Session Management & Authorization (Cognito Deferral)
- **Context**: For the 48-hour MVP, requiring all participants (e.g. family members joining on mobile) to register with Amazon Cognito User Pools, verify emails, or remember passwords creates severe adoption friction and kills demo momentum. Furthermore, cryptographic signing must not be confused with a full identity platform.
- **Decision**: Distinctly architect three layers without introducing an elaborate identity platform:
  1. **Authentication**: Ephemeral, passwordless entry via room invite code/link. Amazon Cognito is intentionally deferred for the MVP to minimize onboarding barrier.
  2. **Session Management**: Server issues a cryptographically signed participant session token (`{ sub: participantId, groupId, sessionId, iat, exp }`) stored in client `sessionStorage`. Tokens expire in 24 hours (matching DynamoDB TTL) and can be revoked server-side via participant record state. HMAC-SHA256 provides tamper-proofing and integrity.
  3. **Authorization**: Strict Lambda path-level check verifying signature and asserting `token.sub == {participantId}` and `token.groupId == {groupId}` before touching data, preventing impersonation and isolating private conversation transcripts.
- **Consequences**: Zero signup friction, instant 1-click mobile joining, robust server-side authorization and revocation, clean architectural distinction between identity, session, and authorization.

### ADR-008: Adaptive Conversational Elicitation over Fixed Survey Forms
- **Context**: Fixed survey questionnaires induce user fatigue, fail to discover latent decision drivers, and force complex real-world trade-offs into crude binary checkboxes.
- **Decision**: Implement an adaptive dialogue system that begins open-ended, measures candidate attribute uncertainty, probes selectively based on confidence thresholds, detects intrapersonal contradictions, supports flexible range/compensation trade-offs, and presents a human-readable summary for participant sign-off before committing to the group model.
- **Consequences**: High-fidelity preference understanding with minimal conversational burden (3–5 turns, <120 seconds).

### ADR-009: Category-Agnostic Core with Pluggable Category Adapters
- **Context**: The engine must conceptually support arbitrary group decisions (laptops, appliances, furniture) without hardcoding TV-specific logic into the core decision math.
- **Decision**: Define a `CategoryAdapter<T>` interface separating the generic preference world model, constraint validation, and fairness engine from category-specific attribute schemas. The MVP implements only the `SmartTvAdapter`.
- **Consequences**: Zero television leakage in the core engine; future category additions require only a schema and catalog file.

### ADR-010: TypeScript (Node.js 20) for Serverless Compute & Engine
- **Context**: Choosing between Python and TypeScript for Lambda compute.
- **Decision**: Standardize backend Lambda runtimes on Node.js 20 / TypeScript.
- **Consequences**: Enables end-to-end static type sharing between frontend and backend; achieves sub-200ms cold starts (vs 600ms+ for heavy Python runtimes); native JSON evaluation speed (<5ms for 35 items).

### ADR-011: React 18 + Vite SPA for Frontend Client
- **Context**: Choosing between Next.js SSR and React + Vite Single Page Application.
- **Decision**: Build a static SPA using React 18 + Vite, hosted on AWS Amplify.
- **Consequences**: Instant HMR development velocity; zero SSR hosting friction or hydration mismatch bugs; global static caching at edge.

### ADR-012: Provider-Neutral LLM Abstraction with NVIDIA Hosted Inference Default
- **Context**: Relying directly on a single cloud vendor's AI runtime SDK couples application code to proprietary API paradigms, error payloads, and vendor model lifecycle expirations. Offline development and multi-cloud resilience benefit from a decoupled contract.
- **Decision**: Define a provider-neutral `LLMProvider` interface (`generateText`, `extractStructuredPreferences`, `generateExplanation`, `healthCheck`) with `NvidiaLLMProvider` as the active default targeting `nvidia/llama-3.3-nemotron-super-49b-v1.5` via OpenAI-compatible endpoints, while preserving `BedrockProvider` and `LocalOllamaProvider` as alternate pluggable implementations.
- **Consequences**: Decouples application business logic from specific AI provider lifecycles; enables instant swapping between cloud APIs and local testing environments.

### ADR-006: Consenzo Hybrid Fairness Engine (Maximin Floor + Dispersion Penalty)
- **Context**: Resolving multi-participant ranking requires balancing utilitarian aggregate joy against egalitarian protection against the "Tyranny of the Majority" (where 3 people score 9.8 and 1 person scores 2.0).
- **Decision**: Implement a 3-tier hybrid fairness function:
  1. Gating by Dealbreakers and Hard Constraints.
  2. Maximin Quality Floor ($u_{min} \ge 4.0$ with quadratic penalty for violations).
  3. Dispersion-Penalized Mean Utility: $S_{group} = \bar{u} - \lambda \cdot \sigma(u)$ with $\lambda = 0.50$.
- **Consequences**: Mathematically prevents any participant from being unfairly sacrificed; guarantees explainable, reproducible compromise scores.

### ADR-013: Deferral of Step Functions and EventBridge for MVP
- **Context**: Evaluating whether to introduce distributed event orchestration (EventBridge) and step-function state machines into the 48-hour build.
- **Decision**: Defer Step Functions and EventBridge. Use synchronous API Gateway to Lambda invocations for all group and interview flows.
- **Consequences**: Avoids orchestration overhead and deployment complexity; 10x faster response times (<20ms execution); easy local testing.

### ADR-014: Pareto Multi-Candidate Framing for Shared Board
- **Context**: Presenting a single "dictated" winner to a group often triggers immediate resistance from members who made concessions.
- **Decision**: The engine computes a Pareto set of alternatives (`BEST_CONSENSUS`, `LOWEST_CONFLICT`, `BEST_VALUE`, `STAKEHOLDER_TOP_PICK`) and presents the top 2–3 options on the Shared Board with side-by-side trade-off deltas.
- **Consequences**: Empowers democratic family ratification rather than algorithmically forced compliance.

### ADR-015: Controlled Constraint Relaxation Protocol for Collisions
- **Context**: In over-constrained scenarios, the intersection of hard constraints can yield zero catalog candidates.
- **Decision**: If candidates equal zero, the engine locks Dealbreakers (never relaxed) and programmatically computes minimal-impact relaxation branches on Hard Constraints (e.g. stretching budget by ₹3,000 vs. relaxing refresh rate to 60Hz), presenting these as explicit, transparent choices on the Shared Board.
- **Consequences**: Eliminates empty-screen failures without secretly violating user requirements.

### ADR-016: Controlled Benchmark Catalog over Live Scraping/APIs
- **Context**: Sourcing real-time catalog data via live web scraping or unverified marketplace APIs exposes the hackathon demo to anti-bot CAPTCHAs, schema mutations, network latency, and legal liabilities.
- **Decision**: Curate an immutable 35-item Smart TV benchmark catalog stored as a versioned JSON artifact in S3.
- **Consequences**: Guaranteed 100% offline and in-memory testability; perfectly reproducible benchmark results; zero third-party flakiness during judge evaluation.

### ADR-017: In-Memory Catalog Gating & Indexing (Scale-to-Zero)
- **Context**: Evaluating whether to introduce Amazon OpenSearch Service, Neptune, or RDS for product retrieval.
- **Decision**: Maintain the 35-item catalog in Lambda container memory, evaluating constraints via a compiled linear scan ($O(N)$ with $N=35$).
- **Consequences**: Sub-2ms execution time; zero database query latency; true scale-to-zero operational cost ($0.00 idle cost).

### ADR-018: Missing Attribute Penalty & Conservative Gating Policy
- **Context**: Defining behavior when a catalog product lacks an attribute referenced by a user preference or constraint.
- **Decision**: Adopt a fail-safe conservative policy: If a missing attribute is targeted by a `DEALBREAKER` or `HARD_CONSTRAINT`, the product is gated out. If targeted by a `PREFERENCE`, satisfaction defaults to $0.0$ for that facet.
- **Consequences**: Eliminates false positives; guarantees that products missing critical safety/hardware specs are never recommended as hard compromises.

### ADR-019: Single Monolithic Lambda Handler with Internal Routing for MVP
- **Context**: Choosing between provisioning 6 distinct micro-Lambdas (with separate SAM definitions, cold starts, and bundling scripts) versus a single Lambda function handling HTTP API proxy events.
- **Decision**: Deploy a single Node.js 20 Lambda handler that routes internal sub-paths (`/groups`, `/conversations`, `/preferences`, `/analysis`, `/votes`).
- **Consequences**: Radically simplifies local execution and debugging; eliminates CloudFormation stack deployment delays; warms the container across the entire user journey.

### ADR-020: Configurable LLM Selection & Provider Decoupling
- **Context**: Foundation model lifecycles in cloud AI ecosystems evolve quickly; hardcoding specific model identifiers or vendor SDKs creates deployment fragility and technical debt.
- **Decision**: Provider and Model IDs are configurable via environment variables (`LLM_PROVIDER`, `LLM_MODEL`, `LLM_BASE_URL`) rather than hard-coded. The architecture strictly enforces:
  ```text
  LLMProvider (Generic Interface)
        ↓
  NvidiaLLMProvider (Active Production Default)
        ↓
  POST https://integrate.api.nvidia.com/v1/chat/completions
  (Model: nvidia/llama-3.3-nemotron-super-49b-v1.5)
  ```
  The platform is completely decoupled from single-model lifecycles. Alternates like `BedrockProvider` and `LocalOllamaProvider` implement the same contract.
- **Consequences**: Eliminates brittle vendor lock-in; ensures seamless migration across model releases; decouples serverless compute infrastructure from inference execution.

### ADR-021: Active Migration to NVIDIA Hosted API (`llama-3.3-nemotron-super-49b-v1.5`) with AWS Secrets Manager
- **Context**: AWS account-level model access constraints and zero quota allocations for Bedrock foundation models posed severe blockers to conversational inference. Consenzo requires high-throughput reasoning, instruction following, 128K context, multilingual capabilities (including Hindi), and low conversational turn latency.
- **Decision**: Transition the active LLM provider to NVIDIA hosted inference using `nvidia/llama-3.3-nemotron-super-49b-v1.5` via its OpenAI-compatible endpoint (`https://integrate.api.nvidia.com/v1/chat/completions`). Secure the `NVIDIA_API_KEY` in AWS Secrets Manager (`consenzo/nvidia-api-key`) retrieved at Lambda runtime with container-level in-memory caching. Default conversational turns use `/no_think` to suppress chain-of-thought token generation, achieving sub-second turn latency. Retain the entire production infrastructure on AWS (Amplify, API Gateway, Lambda, DynamoDB, S3, CloudWatch, Secrets Manager).
- **Consequences**: Unblocks conversational elicitation immediately; delivers enterprise-grade 49B Nemotron inference; maintains strict security and zero-credential leakage; preserves AWS serverless backbone.



---

## Open / Unresolved Decisions

*All foundational architectural decisions for the 48-hour MVP are now approved. No blocking architectural ambiguities remain.*


