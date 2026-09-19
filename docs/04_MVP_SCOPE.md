# 04 — Consenzo MVP Scope

## Document Metadata
- **Document Type**: Scope Boundary & Hackathon Specification
- **Status**: Approved Foundation
- **Owner**: Lead Systems Architect & Technical PM
- **Dependencies**: [00_PROJECT_CHARTER.md](file:///d:/Consenzo%20amazon%20hackathon/docs/00_PROJECT_CHARTER.md), [01_PROBLEM_STATEMENT.md](file:///d:/Consenzo%20amazon%20hackathon/docs/01_PROBLEM_STATEMENT.md), [02_SOLUTION.md](file:///d:/Consenzo%20amazon%20hackathon/docs/02_SOLUTION.md)
- **Downstream References**: [05_NON_GOALS.md](file:///d:/Consenzo%20amazon%20hackathon/docs/05_NON_GOALS.md), [10_REQUIREMENTS.md](file:///d:/Consenzo%20amazon%20hackathon/docs/10_REQUIREMENTS.md), [40_CONTROLLED_CATALOG.md](file:///d:/Consenzo%20amazon%20hackathon/docs/40_CONTROLLED_CATALOG.md), [60_AWS_ARCHITECTURE.md](file:///d:/Consenzo%20amazon%20hackathon/docs/60_AWS_ARCHITECTURE.md), [100_DAY_1.md](file:///d:/Consenzo%20amazon%20hackathon/docs/100_DAY_1.md)

---

## 1. Scope Boundary & Core Objective

The primary objective of the Consenzo MVP is to build, deploy on AWS, and demonstrate a **rock-solid, working end-to-end consensus engine within a strict 48-hour development window**.

To guarantee delivery and prevent hackathon project collapse:
- Scope is intentionally focused on **depth over breadth**.
- We solve one end-to-end user journey flawlessly for **one high-friction product category**.
- All dependencies on third-party live APIs with rate limits, complex authentication, or scraping liabilities are eliminated.

---

## 2. In-Scope Feature Inventory

```
┌────────────────────────────────────────────────────────────────────────┐
│                          IN-SCOPE MVP FEATURES                         │
├────────────────────────────────┬───────────────────────────────────────┤
│ Feature Area                   │ Implementation Detail                 │
├────────────────────────────────┼───────────────────────────────────────┤
│ 1. Decision Initialization     │ Creator names purchase (e.g., "Family │
│                                │ Living Room TV"), creates session,    │
│                                │ gets shareable join links / PINs.     │
├────────────────────────────────┼───────────────────────────────────────┤
│ 2. Participant Onboarding      │ Supports 2 to 4 participants joining   │
│                                │ via desktop or mobile web browser.    │
├────────────────────────────────┼───────────────────────────────────────┤
│ 3. Private AI Discovery        │ 1-on-1 private chat with Consenzo AI   │
│                                │ (3–5 interactive prompt turns).       │
├────────────────────────────────┼───────────────────────────────────────┤
│ 4. Structured Extraction       │ AI extracts typed JSON schema:        │
│                                │ Hard constraints, soft preferences,   │
│                                │ weights, and dealbreakers.            │
├────────────────────────────────┼───────────────────────────────────────┤
│ 5. Controlled Catalog          │ Curated dataset of 35 Smart TVs across│
│                                │ Samsung, LG, Sony, TCL, Xiaomi.       │
├────────────────────────────────┼───────────────────────────────────────┤
│ 6. Deterministic Scoring       │ TypeScript engine computing:          │
│                                │ - Dealbreaker filtering               │
│                                │ - Individual satisfaction [0–10]      │
│                                │ - Fairness / anti-tyranny penalty     │
│                                │ - Net consensus rank                  │
├────────────────────────────────┼───────────────────────────────────────┤
│ 7. Conflict Detection Engine   │ Explicitly flags mutually exclusive   │
│                                │ hard constraints and explains why.    │
├────────────────────────────────┼───────────────────────────────────────┤
│ 8. Grounded Explanations       │ LLM writes per-person trade-off       │
│                                │ rationale strictly from engine math.  │
├────────────────────────────────┼───────────────────────────────────────┤
│ 9. Shared Decision Board       │ Interactive UI: Top 3 recommendations,│
│                                │ satisfaction radar/bar chart, delta   │
│                                │ inspection, and Group Vote button.    │
├────────────────────────────────┼───────────────────────────────────────┤
│ 10. AWS Serverless Deployment  │ Amplify Hosting, API Gateway, Lambda, │
│                                │ DynamoDB, S3, Secrets Manager, NVIDIA │
│                                │ hosted inference.                     │
└────────────────────────────────┴───────────────────────────────────────┘
```

---

## 3. Product Category & Catalog Specification

### Selected Category: Smart Televisions
Smart TVs represent the ideal demonstration category for multi-stakeholder consensus because:
1. **Multi-User Utility**: A living room television is inherently shared by diverse family members (gamers, sports fans, cinephiles, budget managers).
2. **Rich Parametric Surface**: Multiple objective dimensions exist that naturally create conflicts:
   - Price (₹22,000 to ₹1,40,000)
   - Screen Size (43", 50", 55", 65")
   - Refresh Rate (60Hz vs. 120Hz native)
   - Panel Technology (LED vs. QLED vs. OLED)
   - Brand (Samsung, LG, Sony, TCL, Xiaomi)
   - Audio Output (20W vs. 40W Dolby Atmos)
   - Operating System (Google TV vs. Tizen vs. webOS)
   - Warranty (1 Year vs. 2 Years vs. 3 Years)
   - Aesthetic (Black plastic vs. Slim bezel vs. Silver metallic frame)

### Catalog Size: 35 Curated Items
The catalog is stored as a deterministic, validated JSON artifact in Amazon S3 and loaded into memory by the evaluation Lambda. No external live scraping or database hydration during the demo run.

---

## 4. Technology Stack for MVP

| Layer | Service / Technology | Role in MVP |
| :--- | :--- | :--- |
| **Frontend** | React 18 + Vite + Vanilla CSS | Mobile-responsive SPA with clean design tokens |
| **Hosting** | AWS Amplify Hosting | Continuous deployment from Git repository |
| **API Layer** | Amazon API Gateway (HTTP API) | Lightweight REST endpoints for chat & scoring |
| **Compute** | AWS Lambda (Node.js 20 / TypeScript) | Stateless handlers for agent orchestration & scoring |
| **Secrets Management** | AWS Secrets Manager | Stores `NVIDIA_API_KEY` securely at runtime |
| **Generative Inference** | NVIDIA hosted API (`nvidia/llama-3.3-nemotron-super-49b-v1.5`) via `LLMProvider` abstraction | Structured preference extraction, conversational interviewing & grounded explanations |
| **Database** | Amazon DynamoDB | Sessions, participant profiles, and extracted JSON schemas |
| **Static Storage** | Amazon S3 | Product catalog JSON and catalog asset images |

---

## 5. MVP Success & Exit Criteria

The MVP is deemed complete and successful when all of the following conditions are validated:
1. **End-to-End Live Execution**: A 3-person group (e.g., Dad, Mom, Son) completes private discovery, generates group consensus, and views the shared board in under 4 minutes.
2. **Conflict Demonstration**: When inputs contain a real conflict (e.g., Budget $\le$ 50k vs. 120Hz requirement), the system accurately detects the collision, does NOT return 0 results, and highlights the trade-off.
3. **Mathematical Invariant**: Rerunning the consensus calculation with identical inputs produces the exact same ranking and scores down to two decimal places.
4. **Zero Specification Hallucination**: Every product attribute displayed on the shared board matches the catalog JSON artifact identically.
5. **Clean AWS Infrastructure**: The entire solution runs in real AWS services with zero local mock servers required for the final evaluation.
