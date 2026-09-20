# 22 — Technology Stack Execution Flow

## Document Metadata
- **Document Type**: Execution Flow & Runtime Interaction Specification
- **Status**: Approved Foundation
- **Owner**: Lead Systems Architect & Backend Engineer
- **Dependencies**: [20_SYSTEM_ARCHITECTURE.md](file:///d:/Consenzo%20amazon%20hackathon/docs/20_SYSTEM_ARCHITECTURE.md), [21_TECH_STACK.md](file:///d:/Consenzo%20amazon%20hackathon/docs/21_TECH_STACK.md)
- **Downstream References**: [23_DATA_FLOW.md](file:///d:/Consenzo%20amazon%20hackathon/docs/23_DATA_FLOW.md), [24_API_ARCHITECTURE.md](file:///d:/Consenzo%20amazon%20hackathon/docs/24_API_ARCHITECTURE.md), [64_LAMBDA.md](file:///d:/Consenzo%20amazon%20hackathon/docs/64_LAMBDA.md)

---

## 1. Top-Level Technology Flow

The complete runtime journey connects modern browser clients with serverless AWS primitives in a synchronous, low-latency pipeline:

```text
 ┌────────────────┐       ┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
 │ CLIENT BROWSER │──────►│  AMPLIFY / CDN  │──────►│   API GATEWAY   │──────►│   AWS LAMBDA    │
 │ React 18 SPA   │       │ Static Delivery │       │ HTTP API Router │       │ Node.js Runtime │
 └────────────────┘       └─────────────────┘       └─────────────────┘       └────────┬────────┘
                                                                                       │
                      ┌──────────────────┬───────────────────────────────┬─────────────┴─────────────────┐
                      ▼                  ▼                               ▼                               ▼
               ┌──────────────┐   ┌──────────────┐                ┌──────────────┐                ┌──────────────┐
               │SECRETS MGR   │   │NVIDIA API    │                │AMAZON DYNAMODB│               │  AMAZON S3   │
               │NVIDIA_API_KEY│   │Nemotron 49B  │                │Single-Table  │                │Static Catalog│
               │Runtime Fetch │   │LLMProvider   │                │State Storage │                │& Item Assets │
               └──────────────┘   └──────────────┘                └──────────────┘                └──────────────┘
```

---

## 2. Private Adaptive Interview Execution Flow

The private interview flow handles real-time conversational extraction while enforcing strict cryptographic and database isolation.

```mermaid
sequenceDiagram
    autonumber
    actor P as Participant (Mobile Client)
    participant UI as React SPA
    participant APIGW as API Gateway (HTTP API)
    participant L_CHAT as Private Chat Lambda
    participant SM as AWS Secrets Manager
    participant DDB as DynamoDB Table
    participant NVIDIA as NVIDIA Hosted API (via LLMProvider)

    P->>UI: Types message ("I really want 120Hz for my PS5")
    UI->>APIGW: POST /conversations/{id}/messages<br/>[Bearer Token in Authorization Header]
    
    Note over APIGW,L_CHAT: API Gateway routes to Chat Lambda
    APIGW->>L_CHAT: Invoke Lambda with event payload
    
    L_CHAT->>L_CHAT: 1. Verify HMAC token signature & check participantId
    L_CHAT->>DDB: 2. Query participant conversation history & working profile
    DDB-->>L_CHAT: Return prior messages + current PreferenceWorldModel
    
    L_CHAT->>SM: 3. Fetch NVIDIA_API_KEY (cached in memory)
    SM-->>L_CHAT: Return API Key
    
    L_CHAT->>L_CHAT: 4. Assemble extraction system prompt with domain rules & /no_think
    L_CHAT->>NVIDIA: 5. POST /chat/completions (OpenAI-compatible)<br/>[Includes user message, prior turns, schema rules, temperature=0.2]
    NVIDIA-->>L_CHAT: Return JSON payload with candidate extraction & reply
    
    L_CHAT->>L_CHAT: 6. Parse JSON state update, update confidence & provenance
    L_CHAT->>L_CHAT: 7. Check stopping criteria (Turn count, ambiguity, budget confirmed)
    
    L_CHAT->>DDB: 8. TransactWriteItems:<br/>- Append new message to PARTICIPANT#<id><br/>- Save updated PREF#working
    DDB-->>L_CHAT: Transaction confirmed
    
    L_CHAT-->>APIGW: HTTP 200 OK with AI response text & readiness flag
    APIGW-->>UI: Return JSON payload
    UI-->>P: Render dynamic empathetic follow-up
```

---

## 3. Final Consensus Analysis Execution Flow

The analysis pipeline executes when all participants confirm their profiles. It evaluates the controlled catalog with zero LLM interference in the product ranking.

```mermaid
sequenceDiagram
    autonumber
    actor C as Coordinator / Participant
    participant UI as Shared Decision Board UI
    participant APIGW as API Gateway
    participant L_SCOR as Consensus Scoring Lambda
    participant S3 as Amazon S3 (Catalog Bucket)
    participant DDB as DynamoDB Table
    participant SM as AWS Secrets Manager
    participant NVIDIA as NVIDIA Hosted API (via LLMProvider)

    C->>UI: Clicks "Generate Consensus"
    UI->>APIGW: POST /groups/{groupId}/analysis
    APIGW->>L_SCOR: Invoke Consensus Lambda

    L_SCOR->>DDB: 1. Query all participant profiles for SESSION#<id>
    DDB-->>L_SCOR: Return validated profiles (all confirmed=true)

    alt In-Memory Catalog Cache Miss
        L_SCOR->>S3: 2. GetObject("catalog/smart_tvs_v1.json")
        S3-->>L_SCOR: Return 35 curated product records
        L_SCOR->>L_SCOR: Cache catalog in Lambda global memory
    else In-Memory Cache Hit
        L_SCOR->>L_SCOR: Read catalog from global memory cache (0ms latency)
    end

    Note over L_SCOR: 3. EXECUTE DETERMINISTIC PIPELINE (Pure TypeScript)
    L_SCOR->>L_SCOR: a. Apply Category Adapter normalization
    L_SCOR->>L_SCOR: b. Filter products violating hard constraints / dealbreakers
    L_SCOR->>L_SCOR: c. Calculate multi-attribute utility u_m(x) per participant [0–10]
    L_SCOR->>L_SCOR: d. Calculate group fairness score S_group = Mean - (lambda * StdDev)
    L_SCOR->>L_SCOR: e. Detect trade-off deltas and rank Top 3 items

    Note over L_SCOR,NVIDIA: 4. GROUNDED EXPLANATION GENERATION
    L_SCOR->>SM: Fetch NVIDIA_API_KEY (cached in memory)
    SM-->>L_SCOR: Return API Key
    L_SCOR->>NVIDIA: POST /chat/completions with strictly bound context:<br/>- Exact product specs<br/>- Mathematical scores (e.g. Dad: 9.5, Son: 7.2)<br/>- Identified trade-off deltas (/no_think)
    NVIDIA-->>L_SCOR: Return grounded natural language trade-off breakdown

    L_SCOR->>DDB: 5. PutItem(SESSION#<id>, ANALYSIS#<timestamp>, Top3, Scores, Explanation)
    L_SCOR->>DDB: 6. UpdateSessionState(SESSION#<id>, state: RESULTS_READY)
    
    L_SCOR-->>APIGW: HTTP 200 OK with complete analysis payload
    APIGW-->>UI: Render Shared Consensus Board with Top 3 & Radar Charts
```

---

## 4. Resilience & Error Boundaries

| Failure Point | Failure Mode | System Response & Mitigation Strategy |
| :--- | :--- | :--- |
| **NVIDIA API Rate Limit / Timeout** | `HTTP 429` or `504 Gateway Timeout` | Chat Lambda catches error, executes 1 exponential backoff retry (500ms). If unrecovered, returns a graceful fallback message: *"I'm having a brief moment of latency. Could you please re-send your last thought?"* State is not corrupted. |
| **Participant Dropped / Incomplete** | Participant leaves interview after 1 turn | Session stays in `INTERVIEWING`. Coordinator dashboard displays participant badges. Coordinator can trigger quorum override to compute consensus among completed members. |
| **Zero Feasible Products** | Hard constraints collide across group (or the request is unsatisfiable, e.g. an 85-inch OLED under INR 30k) | The **Nearest-Feasible Proximity Engine** (`src/engine/proximityEngine.ts` + `fitStats.ts`) ranks the **entire catalog** by statistically-normalized attribute distance (robust median/MAD z-scores, ordinal tier ladders, market-segment adjacency) and returns the top 15 closest real products with `matchQuality` labels, per-violation gap audits (e.g. "Requested >= 85-inch; closest on market: 65-inch"), and a per-attribute availability census. Dealbreakers are never silently marked satisfied; the response's `proximity.mode` is `NEAREST` instead of `EXACT`. Relaxation branches and conflict banners remain available for interactive relaxation flows. |
| **DynamoDB Transient Error** | `ProvisionedThroughputExceededException` | AWS SDK v3 automatically retries with jittered exponential backoff. Tables use On-Demand capacity mode to eliminate throughput throttling. |
