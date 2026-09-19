# Parallel Integration Contract

## 1. Core Principles

Frontend and backend tracks are developed independently until defined **Integration Gates**.

### 1.1 Frontend Assumption
The frontend may assume that every documented endpoint eventually conforms to the canonical contract.

### 1.2 Backend Assumption
The backend must assume the frontend can consume the contract using typed request/response data without relying on undocumented fields.

### 1.3 Mock-First Development
Before real backend integration:
* Frontend uses deterministic mock responses and local fixtures.
* Backend uses `MockLLMProvider` and synthetic inputs.
* Both sides proceed at maximum velocity without blocking one another.

### 1.4 No Hidden Coupling
Neither side may depend on:
* Undocumented JSON fields.
* Frontend implementation details or client-only transient state.
* Backend internal function names, class structures, or private methods.
* Browser-only state for backend decision-making.
* Backend-specific database structures (e.g., DynamoDB composite key layouts).

---

## 2. Integration Gates

Explicit synchronization checkpoints govern safe merging of frontend and backend work:

### Gate 1 — Contract Lock
* **Condition**:
  - Shared domain types exist in `shared/types/`.
  - API request/response schemas are frozen in `docs/70_API_CONTRACTS.md`.
  - Endpoint URLs, HTTP methods, and payload structures are defined.
  - Session token header format (`Authorization: Bearer <token>`) is documented.
  - Standard error response format (`{ "error": { "code": string, "message": string } }`) is locked.
* **Outcome**: Frontend may immediately build all screens against mocks. Backend may immediately implement router and business logic against the locked schemas.

### Gate 2 — Group Flow
* **Scope**: `Create Group → Join Group → Lobby → Participant Status`
* **Validation**: Group creation returns group ID and admin token; joining returns participant token; lobby polling reflects connected roster.
* **Rule**: Frontend uses mocks while backend builds; integration occurs as endpoints become live.

### Gate 3 — Private Interview
* **Scope**: `Interview → Extract Preferences → Review → Confirm`
* **Privacy Invariant**: Raw 1-on-1 interview conversation messages MUST NEVER be sent as part of shared group decision payloads or exposed to other participants.
* **Rule**: Frontend consumes only the ratified structured preference representation required by the API.

### Gate 4 — Decision Engine
* **Scope**: `Confirmed Preferences → Constraints → Scoring → Conflict → Fairness → Pareto → Explanation`
* **Authority Invariant**: The backend is strictly authoritative.
* **Forbidden Frontend Action**: The frontend must NEVER independently calculate utility, fairness, ranking, conflict score, or Pareto status. The frontend only renders backend-provided results.

### Gate 5 — Recommendation Board
* **Scope**: `Analysis API → Recommendation Board → Vote → Outbound Product Link`
* **Validation**: Top-3 consensus recommendations display with multidimensional trade-off rationale, conflict explanations, group voting actions, and affiliate outbound links.
* **Rule**: UI visualizes backend calculations without recalculating or modifying scores.

### Gate 6 — Production Integration
* **Scope**: Amplify frontend, API Gateway, Lambda, DynamoDB, Secrets Manager, NVIDIA hosted inference, CloudWatch logging.
* **Validation**: End-to-end smoke test passes against live cloud infrastructure; all production contracts verified.

---

## 3. Conflict Protocol

When an agent encounters a mismatch between implementation and expectations, follow this exact four-step protocol:

```text
    STOP ──► REPORT ──► CONTRACT ──► IMPLEMENT
```

1. **STOP**: Do not patch around the mismatch locally. Do not invent ad-hoc fields or silent workarounds.
2. **REPORT**: Record in `docs/AGENT_HANDOFF.md`:
   - Expected contract
   - Actual contract
   - Affected file/path
   - Impact on workflow
3. **CONTRACT**: The contract owner (Claude / Backend Agent) updates the canonical shared contract in `shared/**` and `docs/70_API_CONTRACTS.md` if appropriate.
4. **IMPLEMENT**: Both agents update their owned code against the newly ratified contract.

This prevents two independently-correct implementations from becoming mutually incompatible.
