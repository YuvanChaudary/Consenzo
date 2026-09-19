# 00 — Consenzo Project Charter

## Document Metadata
- **Document Type**: Project Charter / Foundational Specification
- **Status**: Approved Foundation
- **Owner**: Lead Product & Systems Architect
- **Dependencies**: None (Root Foundation)
- **Downstream References**: [01_PROBLEM_STATEMENT.md](file:///d:/Consenzo%20amazon%20hackathon/docs/01_PROBLEM_STATEMENT.md), [02_SOLUTION.md](file:///d:/Consenzo%20amazon%20hackathon/docs/02_SOLUTION.md), [03_PRODUCT_VISION.md](file:///d:/Consenzo%20amazon%20hackathon/docs/03_PRODUCT_VISION.md), [04_MVP_SCOPE.md](file:///d:/Consenzo%20amazon%20hackathon/docs/04_MVP_SCOPE.md), [05_NON_GOALS.md](file:///d:/Consenzo%20amazon%20hackathon/docs/05_NON_GOALS.md), [110_DECISIONS.md](file:///d:/Consenzo%20amazon%20hackathon/docs/110_DECISIONS.md)

---

## 1. Executive Summary & Identity

- **Project Name**: Consenzo
- **Tagline**: *"Everyone can find a product. The hard part is getting everyone to agree."*
- **One-Line Description**: Consenzo is an AI-powered consensus engine for group purchasing decisions that privately learns each person's preferences, detects conflicts, and deterministically ranks products according to group satisfaction and fairness.

---

## 2. Purpose & Mandate

The purpose of the Consenzo project is to resolve the acute friction, prolonged indecision, and suboptimal compromises inherent in multi-stakeholder consumer purchases. 

Modern ecommerce platforms excel at single-user information retrieval, personalized ranking, and collaborative list sharing. However, when multiple individuals attempt to select **one single physical product** to share (e.g., a family TV, room air conditioner, shared apartment refrigerator, or co-working equipment), existing tooling forces manual negotiation via external messaging apps, verbal friction, or surrender by less assertive participants.

Consenzo automates and formalizes this group negotiation process through a strict architectural division of responsibility:
1. **AI Understands People**: Generative models conduct private conversational discovery with individual participants to elicit stated and latent preferences without peer pressure.
2. **Deterministic Software Decides the Product**: A verifiable, mathematical scoring and constraint engine evaluates a structured catalog against the joint preference space, identifies irreconcilable conflicts, applies fairness criteria, and returns ranked compromises with per-participant trade-off explanations.

---

## 3. Core Architectural Principle

```
┌────────────────────────────────────────────────────────┐
│                   AI BOUNDARY                          │
│  - Conduct private conversational interviews           │
│  - Ask contextual follow-up questions                  │
│  - Extract structured preference specifications        │
│  - Categorize constraints (Hard, Soft, Nice, Dealbreak) │
│  - Translate deterministic output into explanations    │
└──────────────────────────┬─────────────────────────────┘
                           │ Structured JSON Specs
                           ▼
┌────────────────────────────────────────────────────────┐
│             DETERMINISTIC ENGINE BOUNDARY              │
│  - Constraint validation & filtering                   │
│  - Multi-objective individual scoring                  │
│  - Group aggregation & conflict detection              │
│  - Fairness optimization (Maximin / Gini-penalized)    │
│  - Top-N ranking & compromise derivation               │
└────────────────────────────────────────────────────────┘
```

> **Non-Negotiable Rule**: AI must NEVER autonomously invent, hallucinate, or alter the final product ranking. All rankings, constraint checks, and fairness calculations must execute inside deterministic code to guarantee mathematical repeatability, auditability, and trust.

---

## 4. Key Differentiators & Competitive Grounding

| Feature / Dimension | Standard Ecommerce (Filters & Search) | Collaborative Lists (e.g., Amazon Shared Lists) | Generic LLM Chatbot (ChatGPT / Rufus) | Consenzo |
| :--- | :--- | :--- | :--- | :--- |
| **Primary Target** | Single user | Multi-user curation | Single user conversation | Multi-stakeholder consensus |
| **Input Mode** | Rigid facet selection | Item saving & upvoting | Freeform chat prompt | Private 1-on-1 guided interviews |
| **Peer Bias Protection** | N/A | None (visible votes cause conformity) | None | Full privacy until structured synthesis |
| **Conflict Resolution** | Impossible (0 results if query over-constrained) | Social debate in external chat | Hallucinatory, ungrounded compromise | Deterministic conflict identification & trade-off scoring |
| **Fairness Guarantee** | None | Majority rule (tyranny of majority) | Subjective persuasion | Mathematical fairness (anti-tyranny) |
| **Auditability** | High (Boolean logic) | High (Count of votes) | None (black box text generation) | High (Deterministic breakdown per person) |

> [!IMPORTANT]
> **Competitive Claim Guardrail**: Do NOT claim "Amazon does not support collaborative shopping." Amazon already provides list sharing, universal registries, and collaborative gifting. Consenzo's differentiation is specific: **handling conflicting preferences between multiple individuals to compute an explainable, fair compromise using deterministic multi-objective optimization.**

---

## 5. Scope of Authority & Target Operating Model

### 5.1 Project Phases
1. **Phase 1: Architecture & Documentation (Current)** — Complete specification of data models, algorithms, schemas, AWS infrastructure, and benchmarks. Zero implementation code written prior to specification sign-off.
2. **Phase 2: 2-Day Hackathon MVP** — Working end-to-end cloud deployment on AWS targeting **one product category (Smart TVs)** with a curated, static catalog of 30–50 items.
3. **Phase 3: Post-Hackathon Evaluation** — Rigorous benchmark runs against search filters and generic LLM setups.

---

## 6. Project Stakeholders & Roles

- **Lead Architect**: Responsible for end-to-end system design, documentation compliance, and algorithmic consistency.
- **AI / NLP Engineer**: Responsible for LLM provider abstraction, NVIDIA hosted API integration (`nvidia/llama-3.3-nemotron-super-49b-v1.5`), prompt engineering, structured schema extraction reliability, and conversational state transitions.
- **Deterministic Engine Engineer**: Responsible for TypeScript/Python constraint validation, multi-participant scoring functions, and fairness algorithms.
- **AWS Infrastructure Engineer**: Responsible for serverless cloud deployment (Amplify Hosting, API Gateway, Lambda, DynamoDB, S3, Secrets Manager) adhering to strict cost and complexity limits.
- **Frontend / UX Engineer**: Responsible for mobile-responsive responsive design, private interview flows, and the shared consensus board.

---

## 7. Assumptions & Unresolved Decisions

### 7.1 Assumptions
- **User Willingness**: Users are willing to spend 90–120 seconds in a private chatbot conversation to save 2+ hours of shopping arguments.
- **Structured Catalog Quality**: The demonstration category (Smart TVs) contains sufficiently rich parametric attributes (Price, Screen Size, Refresh Rate, Panel Type, Operating System, Ports, Warranty, Brand) to demonstrate complex multi-way trade-offs.
- **Deterministic Execution Runtime**: Scoring and fairness algorithms will execute in an AWS Lambda function running Node.js/TypeScript.

### 7.2 Unresolved Decisions
- **Decision U-01**: Exact mathematical formulation of the fairness penalty (Nash Bargaining Solution vs. Maximin vs. Mean-Variance Penalty). Documented in [36_FAIRNESS_ENGINE.md](file:///d:/Consenzo%20amazon%20hackathon/docs/36_FAIRNESS_ENGINE.md) and tracked in [110_DECISIONS.md](file:///d:/Consenzo%20amazon%20hackathon/docs/110_DECISIONS.md).
- **Decision U-02**: Whether participant authentication requires Amazon Cognito or lightweight session tokens via signed URL parameters for the 2-day MVP. Tracked in [13_PERMISSION_MODEL.md](file:///d:/Consenzo%20amazon%20hackathon/docs/13_PERMISSION_MODEL.md) and [110_DECISIONS.md](file:///d:/Consenzo%20amazon%20hackathon/docs/110_DECISIONS.md).
