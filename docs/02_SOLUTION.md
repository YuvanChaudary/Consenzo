# 02 — Consenzo Solution Overview

## Document Metadata
- **Document Type**: Solution Specification & Architecture Blueprint
- **Status**: Approved Foundation
- **Owner**: Lead Product & Systems Architect
- **Dependencies**: [00_PROJECT_CHARTER.md](file:///d:/Consenzo%20amazon%20hackathon/docs/00_PROJECT_CHARTER.md), [01_PROBLEM_STATEMENT.md](file:///d:/Consenzo%20amazon%20hackathon/docs/01_PROBLEM_STATEMENT.md)
- **Downstream References**: [03_PRODUCT_VISION.md](file:///d:/Consenzo%20amazon%20hackathon/docs/03_PRODUCT_VISION.md), [04_MVP_SCOPE.md](file:///d:/Consenzo%20amazon%20hackathon/docs/04_MVP_SCOPE.md), [20_SYSTEM_ARCHITECTURE.md](file:///d:/Consenzo%20amazon%20hackathon/docs/20_SYSTEM_ARCHITECTURE.md), [30_CONSENZO_AGENT.md](file:///d:/Consenzo%20amazon%20hackathon/docs/30_CONSENZO_AGENT.md), [34_SCORING_ENGINE.md](file:///d:/Consenzo%20amazon%20hackathon/docs/34_SCORING_ENGINE.md), [36_FAIRNESS_ENGINE.md](file:///d:/Consenzo%20amazon%20hackathon/docs/36_FAIRNESS_ENGINE.md)

---

## 1. Solution Concept

Consenzo resolves multi-stakeholder purchasing friction through a **two-tier hybrid architecture** that merges natural language understanding with deterministic multi-objective optimization:

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                      STEP 1: PRIVATE DISCOVERY                          │
│  Participants chat 1-on-1 with Consenzo AI in private sessions.         │
│  - No peer pressure or premature conformity.                            │
│  - AI classifies constraints: Hard, Soft, Nice-to-Have, Dealbreaker.    │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ Structured Preference Schemas (JSON)
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                   STEP 2: PREFERENCE HARMONIZATION                      │
│  Coordinator Lambda compiles individual models into a group model.      │
│  - Masks sensitive remarks / verbatim quotes.                           │
│  - Detects irreconcilable hard-constraint collisions.                   │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ Clean Group Constraint Matrix
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                STEP 3: DETERMINISTIC CONSENSUS ENGINE                   │
│  Pure TypeScript/Lambda mathematical pipeline evaluates catalog.        │
│  1. Hard Constraint Filter: Eliminates dealbreaker violations.          │
│  2. Individual Utility Function: Scores products per user [0–10].       │
│  3. Fairness & Aggregation Operator: Balances mean score and dispersion.│
│  4. Ranking: Determines Top 2–3 mathematically verified compromises.    │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ Verified Scores & Attribute Deltas
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                 STEP 4: EXPLAINABILITY & SHARED BOARD                   │
│  - AI generates natural language explanations grounded ONLY in math.    │
│  - Shared interactive dashboard presents options, scores & trade-offs.  │
│  - Participants review transparent trade-offs and confirm group vote.   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Detailed Architectural Pillars

### Pillar 1: Private Preference Elicitation (AI Boundary)
- Rather than forcing participants to debate in a public chat or configure boolean search filters, Consenzo provides each participant with a private, frictionless conversation with an AI assistant powered by the NVIDIA hosted API (`nvidia/llama-3.3-nemotron-super-49b-v1.5`) via the `LLMProvider` abstraction. Reasoning is disabled with `/no_think` by default to minimize conversational latency.
- The agent conducts an active interview (3–5 conversational turns), dynamically probing for:
  1. Financial boundaries (strict budget vs. flexible target).
  2. Technical requirements and usage patterns (e.g., gaming, cinema, bright room).
  3. Aesthetic preferences and brand affinity.
  4. Non-negotiable dealbreakers (e.g., maximum dimensions, physical ports).
- **Privacy Guarantee**: Raw conversational text is stored in an encrypted participant session record and is NEVER shown to other participants. Only the extracted parametric JSON schema is forwarded to the group coordinator.

### Pillar 2: Structured Constraint & Preference Schema
The AI transforms free-form dialogue into a strongly-typed schema:
- **Hard Constraints (`dealbreakers`)**: Binary gating conditions (`price <= 50000`, `warranty_years >= 2`). If violated, the product utility is mathematically 0 or excluded.
- **Soft Preferences (`high_weight`)**: Desired features where deviations incur utility penalties (`brand == "Samsung"`, weight: 0.85).
- **Nice-to-Haves (`low_weight`)**: Secondary attributes that serve as tiebreakers (`bezel_color == "Silver"`, weight: 0.30).

### Pillar 3: Deterministic Scoring & Fairness Engine (Deterministic Boundary)
The core decision engine is implemented in strict, auditable code (zero LLM inference):
1. **Candidate Pruning**: Evaluates each catalog product against group hard constraints. If a collision is detected (e.g., Dad's hard budget of 50k collides with Son's hard requirement for 120Hz at current market prices), the engine flags a **Group Constraint Conflict** and initiates relaxation branch analysis.
2. **Individual Utility Calculation**: For each participant $m$ and product $x$, the engine computes utility:
   $$u_m(x) = \sum_{k} w_{m,k} \cdot s_k(x_{attr}, p_{pref})$$
   Normalized to a $[0, 10]$ scale.
3. **Fairness-Aware Aggregation**: To prevent "tyranny of the majority" (where 3 people score a product 10/10 and 1 person scores it 1/10, yielding a deceptively high average of 7.75/10), Consenzo incorporates an equity/dispersion penalty:
   $$S_{group}(x) = \bar{u}(x) - \lambda \cdot \sigma(u(x))$$
   Or alternatively a Nash product / Maximin baseline:
   $$S_{maximin}(x) = \min_{m} u_m(x)$$
4. **Ranking & Trade-off Identification**: Produces the definitive Top 3 candidate products with precise delta breakdowns (e.g., "Dad: 9.6/10, Mom: 10/10, Son: 7.2/10, Daughter: 8.1/10").

### Pillar 4: Grounded Explanation Generation
Once the deterministic ranking is established, the LLM Provider (NVIDIA hosted API) is invoked with a constrained prompt:
- **Strict Invariant**: The LLM is provided the exact mathematical scores, catalog specifications, and trade-off deltas. It is instructed to write an empathetic, plain-English explanation of **why** this compromise was chosen and **what trade-offs** each person is making.
- The LLM cannot change the ranking or scores; it only acts as an articulate spokesperson for the deterministic engine.

### Pillar 5: The Shared Group Board
A shared, responsive web interface (built with lightweight React/Vite and hosted on AWS Amplify) where:
- All participants can view the Top 2–3 options.
- The group sees a visual radar/bar chart of individual satisfaction scores.
- A "Trade-Off Inspector" explicitly highlights who got what and where compromises were accepted.
- A voting/confirmation widget enables unanimous sign-off or final choice ratification.

---

## 3. End-to-End Walkthrough: The Family Television

Applying the solution to the scenario defined in [01_PROBLEM_STATEMENT.md](file:///d:/Consenzo%20amazon%20hackathon/docs/01_PROBLEM_STATEMENT.md):

### Input Preferences Extracted by AI
- **Dad**: Hard Budget $\le$ ₹50,000; Warranty $\ge$ 2 yrs (Hard).
- **Mom**: Brand = Samsung (Soft, Weight 0.85).
- **Son**: Refresh Rate = 120Hz (Soft/High, Weight 0.90).
- **Daughter**: Color = Silver (Nice-to-have, Weight 0.35).

### Evaluation Across Catalog Options

| Attribute | Product A (Samsung Crystal) | Product B (Samsung Neo QLED) | Product C (LG NanoCell Gaming) |
| :--- | :--- | :--- | :--- |
| **Price** | ₹48,000 (Within budget) | ₹56,000 (**Violates Dad's Budget**) | ₹49,000 (Within budget) |
| **Brand** | Samsung (Satisfies Mom) | Samsung (Satisfies Mom) | LG (Violates Mom's brand) |
| **Refresh Rate** | 60Hz (Violates Son's 120Hz) | 120Hz (Satisfies Son) | 120Hz (Satisfies Son) |
| **Color** | Black (Fails Daughter's Silver) | Black (Fails Daughter's Silver) | Silver (Satisfies Daughter) |
| **Warranty** | 2 Years (Satisfies Dad) | 3 Years (Satisfies Dad) | 2 Years (Satisfies Dad) |
| **Hard Gating** | **PASS** | **FAIL (Pruned)** | **PASS** |

### Mathematical Scoring Output

#### Product A (Samsung Crystal)
- **Dad Utility**: $10.0 / 10$ (Budget met, warranty met)
- **Mom Utility**: $10.0 / 10$ (Samsung satisfied)
- **Son Utility**: $6.5 / 10$ (Works for streaming/casual gaming, but 60Hz penalty applied)
- **Daughter Utility**: $8.0 / 10$ (Good aesthetic, standard frame)
- **Mean Score**: $8.63 / 10$
- **Fairness Penalty ($\lambda \cdot \sigma$)**: $0.22$
- **Net Consensus Score**: **$8.41 / 10$** (Rank #1 — Primary Recommendation)

#### Product C (LG NanoCell Gaming)
- **Dad Utility**: $9.8 / 10$ (₹49,000 within budget, 2 yr warranty)
- **Mom Utility**: $6.0 / 10$ (LG brand penalty applied)
- **Son Utility**: $10.0 / 10$ (120Hz native VRR satisfied)
- **Daughter Utility**: $10.0 / 10$ (Silver finish satisfied)
- **Mean Score**: $8.95 / 10$
- **Fairness Penalty ($\lambda \cdot \sigma$)**: $0.35$ (Higher variance due to Mom's brand sacrifice)
- **Net Consensus Score**: **$8.60 / 10$** (Alternative Option — Highlighted trade-off)

### Grounded Explanation Produced for Shared Board
> **Top Recommendation: Samsung Crystal Ultra (₹48,000)**
> *"Consenzo selected this as your family's strongest compromise because it strictly respects Dad's ₹50,000 budget and provides the 2-year warranty, while giving Mom the Samsung brand she trusts. To maintain the family budget, Son sacrifices 120Hz gaming support (running at 60Hz). If the family agrees that gaming performance is a higher priority than brand fidelity, Option #2 (LG NanoCell at ₹49,000) delivers 120Hz and Daughter's silver frame while staying under budget, requiring only that Mom accepts LG."*

---

## 4. Key Architectural Guarantees

1. **Deterministic Repeatability**: Given the same catalog and extracted JSON schemas, the scoring engine produces identical numbers every single run.
2. **Zero Price/Spec Hallucination**: No product specifications are generated by LLM text completion; every field is bound to the verified catalog record.
3. **No Hidden Sacrifices**: Every participant can inspect their personal score bar and see exactly which preferences were satisfied and which were discounted.
4. **Anti-Tyranny Fairness Guarantee**: Products that result in a severe utility drop for any individual are heavily penalized or surfaced with clear conflict flags.
