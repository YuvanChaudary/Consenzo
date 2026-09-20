# 24 — API Architecture & Endpoint Specification

## Document Metadata
- **Document Type**: Interface Architecture & API Contract Blueprint
- **Status**: Approved Foundation
- **Owner**: Backend Engineer & API Architect
- **Dependencies**: [20_SYSTEM_ARCHITECTURE.md](file:///d:/Consenzo%20amazon%20hackathon/docs/20_SYSTEM_ARCHITECTURE.md), [22_TECH_STACK_FLOW.md](file:///d:/Consenzo%20amazon%20hackathon/docs/22_TECH_STACK_FLOW.md), [23_DATA_FLOW.md](file:///d:/Consenzo%20amazon%20hackathon/docs/23_DATA_FLOW.md)
- **Downstream References**: [70_API_CONTRACTS.md](file:///d:/Consenzo%20amazon%20hackathon/docs/70_API_CONTRACTS.md), [71_GROUP_API.md](file:///d:/Consenzo%20amazon%20hackathon/docs/71_GROUP_API.md), [72_CONSENZO_API.md](file:///d:/Consenzo%20amazon%20hackathon/docs/72_CONSENZO_API.md), [80_SECURITY.md](file:///d:/Consenzo%20amazon%20hackathon/docs/80_SECURITY.md)

---

## 1. Architectural Style & Design Principles

Consenzo provides a clean, predictable **REST/HTTP API** hosted on Amazon API Gateway.

### Core Principles
1. **Strict JSON Invariants**: All request bodies and response payloads use UTF-8 JSON.
2. **Standardized HTTP Semantics**: Appropriate status codes (200, 201, 400, 401, 403, 404, 409, 422, 500, 503).
3. **Correlation Tracking**: Every request accepts or generates an `X-Correlation-Id` header that propagates through API Gateway, Lambda, upstream LLM provider calls, and CloudWatch logs.
4. **Idempotent Mutations**: State-altering endpoints (`/analysis`, `/confirm`, `/votes`) accept an optional `Idempotency-Key` header to prevent duplicate execution from double-clicks or network retries.
5. **Fail-Closed Security**: Missing, malformed, or mismatched participant bearer tokens return immediate `HTTP 401 / 403` before any compute or database resources are consumed.

---

## 2. Global Error Envelope Schema

All non-2xx responses adhere to an immutable error contract:

```json
{
  "error": {
    "code": "MUTUALLY_EXCLUSIVE_CONSTRAINTS",
    "message": "Group hard constraints resulted in zero feasible products in the catalog.",
    "details": [
      {
        "field": "price_inr",
        "issue": "Participant Dad specified ceiling ₹45,000 while Son required 120Hz (cheapest 120Hz is ₹48,000)."
      }
    ],
    "requestId": "req_992f_b471",
    "timestamp": "2026-09-15T19:22:00Z"
  }
}
```

---

> **Note (current engine behavior)**: over-constrained groups no longer receive an error envelope.
> The deterministic engine now completes every analysis via the **Nearest-Feasible Proximity fallback**
> (see `docs/33_CONSTRAINT_ENGINE.md` §7): the top 15 statistically-closest real products are returned
> with `proximity.mode = "NEAREST"`, per-violation gap audits, and a market availability census.
> The `MUTUALLY_EXCLUSIVE_CONSTRAINTS` envelope below remains reserved for future interactive
> relaxation flows and for clients that explicitly opt into strict mode.

---

## 3. Authoritative Endpoint Specification

### 3.1 Groups & Sessions
- **`POST /groups`**: Initializes a new decision room.
  - *Request*: `{ "title": "Living Room TV", "category": "smart_tvs", "creatorName": "Dad" }`
  - *Response (201)*: `{ "groupId": "grp_881a", "inviteUrl": "https://consenzo.app/join/grp_881a", "creatorToken": "..." }`
- **`GET /groups/{groupId}`**: Returns public room metadata, status (`JOINING`, `INTERVIEWING`, `RESULTS_READY`), and participant roster (names and readiness badges only).
- **`POST /groups/{groupId}/join`**: Joins an invited member.
  - *Request*: `{ "displayName": "Son" }`
  - *Response (201)*: `{ "participantId": "usr_son_02", "participantToken": "..." }`
- **`POST /groups/{groupId}/invite`**: Generates or refreshes room invitation tokens and PINs.

### 3.2 Private Conversations (Isolated AI Boundary)
- **`POST /groups/{groupId}/participants/{participantId}/conversation`**: Starts private interview session.
  - *Response (201)*: `{ "conversationId": "conv_441c", "initialGreeting": "What matters most to you in choosing this TV?" }`
- **`POST /conversations/{conversationId}/messages`**: Sends user text message.
  - *Request*: `{ "message": "I need 120Hz for gaming." }`
  - *Response (200)*: `{ "reply": "Got it! Is 120Hz a strict requirement or a preference?", "isReadyForSummary": false }`
- **`GET /conversations/{conversationId}`**: Fetches past message history for the calling participant only.

### 3.3 Preference Profiles
- **`GET /participants/{participantId}/preferences`**: Fetches current working preference summary.
- **`PATCH /participants/{participantId}/preferences`**: Modifies an attribute before confirmation.
- **`POST /participants/{participantId}/preferences/confirm`**: Explicit participant sign-off.
  - *Response (200)*: `{ "status": "CONFIRMED", "confirmedAt": "2026-09-15T19:23:00Z" }`

### 3.4 Consensus Analysis (Deterministic Boundary)
- **`POST /groups/{groupId}/analysis`**: Triggers consensus evaluation once all profiles are confirmed.
  - *Response (200)*: `{ "analysisId": "an_001", "status": "COMPLETED", "topRecommendations": [ ... ], "fairnessScore": 8.7 }`
- **`GET /groups/{groupId}/analysis/{analysisId}`**: Fetches cached consensus results, radar scores, and trade-off explanations.

### 3.5 Catalog Access
- **`GET /catalog/{category}`**: Returns category schema definition and attribute metadata.
- **`GET /catalog/{category}/products`**: Returns the controlled static catalog list.

### 3.6 Decisions & Voting
- **`POST /groups/{groupId}/votes`**: Casts a vote on the recommended options.
  - *Request*: `{ "productId": "prod_samsung_crystal", "decision": "APPROVE" }`
- **`GET /groups/{groupId}/decision`**: Returns the current voting tally and final ratification status.
- **`POST /groups/{groupId}/decision/confirm`**: Final coordinator confirmation locking the purchase.

---

## 4. AI Provider Abstraction Architecture

The backend isolates the foundational model via a clean provider interface:

```text
               ┌─────────────────────────────────────┐
               │         PreferenceService           │
               └──────────────────┬──────────────────┘
                                  │ Calls Interface
                                  ▼
               ┌─────────────────────────────────────┐
               │         <<LLMProvider>>             │
               │  - generateText(...)                │
               │  - extractStructuredPreferences(..) │
               │  - generateExplanation(...)         │
               │  - healthCheck(...)                 │
               └──────────────────┬──────────────────┘
                                  │
         ┌────────────────────────┼────────────────────────┐
         ▼                        ▼                        ▼
┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│ NvidiaLLMProvider│    │ BedrockProvider  │    │LocalOllamaProvider│
│ (ACTIVE DEFAULT) │    │ (FUTURE / ALT)   │    │(Offline Dev / Test│
│ OpenAI-compat API│    │ AWS Bedrock SDK  │    │ Llama 3.3 / Qwen) │
│ Secrets Manager  │    │                  │    │                   │
└──────────────────┘    └──────────────────┘    └──────────────────┘
```

The system defaults to `NvidiaLLMProvider` targeting `nvidia/nemotron-3.5-lightning-30b-a3b` at `https://integrate.api.nvidia.com/v1`. Authentication uses an NVIDIA API key stored securely in AWS Secrets Manager (`consenzo/nvidia-api-key`, resolved via `NVIDIA_API_KEY_SECRET_ARN`). `MockLLMProvider` enables zero-cost, fully offline development and testing (`LLM_PROVIDER=mock`), and `BedrockProvider` remains supported for future multi-provider expansion. The implemented provider set is authoritative in `backend/src/services/llm/providerFactory.ts`: `nvidia | anthropic | bedrock | mock`.

---

## 5. Failure Boundaries & Resilience Contract

1. **Upstream LLM Provider Failure**:
   - If the NVIDIA hosted API returns an error (e.g. `HTTP 429` or `504 Gateway Timeout`), the backend executes 1 retry with exponential backoff. If still unrecovered, it returns `HTTP 503` with an empathetic conversational retry request. **The system never fabricates or hallucinates preferences on failure.**
2. **Ambiguous Extraction**:
   - If an extracted preference has confidence below 0.70, it is flagged as uncertain, and the agent asks a targeted clarification question.
3. **Empty Result Set (Over-Constrained Catalog) — Nearest-Feasible Fallback**:
   - If the deterministic engine finds 0 products satisfying all hard constraints, it **does not fail and does not return an arbitrary slice of the catalog**. The Proximity Engine (`src/engine/proximityEngine.ts`) ranks the entire catalog by graduated attribute proximity (robust median/MAD z-scores for numeric attributes, ordinal tier ladders for categoricals, market-segment adjacency for brands) and returns the top 15 nearest real products with `proximity.mode = "NEAREST"`, `matchQuality` labels, per-violation gap audits naming the closest market value, and a per-attribute availability census. Dealbreakers are never marked satisfied; proximity utilities feed the frozen ADR-006 fairness operator unchanged.
4. **Deterministic Engine Failure**:
   - If mathematical evaluation fails, an explicit `HTTP 500 ENGINE_ERROR` is returned. **The AI is strictly prohibited from guessing or generating a recommendation fallback.**
5. **DynamoDB Failure**:
   - If state persistence fails, the API returns `HTTP 500 STORAGE_ERROR`. The system never pretends a vote or preference was committed.

---

## 6. Security & Cost Optimization

### Security Controls
- **In-Transit Encryption**: API Gateway HTTP APIs use a TLS 1.2 security policy as the minimum security policy and support TLS 1.3 traffic.
- **Path-Bound Authorization**: Lambdas verify that the participant token matches the requested `{participantId}`.
- **No Secrets in Bundles**: Zero credentials in frontend source; `NVIDIA_API_KEY` is retrieved by Lambda from AWS Secrets Manager at runtime and never returned in API responses or client storage.
- **DDoS & Rate Limiting**: API Gateway throttled at 50 requests/second per IP to prevent runaway API consumption.

### Cost & Latency Optimization
- **100% Serverless**: Scale-to-zero when idle. Zero EC2/container baseline costs.
- **Latency Optimization via `/no_think`**: By appending `/no_think` to prompts in conversational extraction flows, the model skips unnecessary chain-of-thought tokens, significantly lowering latency and token consumption.
- **In-Memory Caching**: Controlled catalog (35 items) is loaded once from S3 and cached in Lambda global memory, incurring zero S3 read costs on subsequent requests.
