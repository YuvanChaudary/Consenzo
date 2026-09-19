# Agent Ownership Matrix

## 1. Golden Rule

> **An agent may freely edit files it owns.**
> **An agent may read another agent's files but must not modify them.**
> **Shared files require explicit coordination.**

---

## 2. File Ownership Matrix

| Path | Frontend Agent (Antigravity / Gemini CLI) | Backend Agent (Claude Code / Ollama) | Rules |
| :--- | :--- | :--- | :--- |
| `frontend/**` | **OWNER** | READ ONLY | Frontend only |
| `backend/**` | READ ONLY | **OWNER** | Backend only |
| `shared/**` | CONSUMER | **OWNER** | Backend is contract authority |
| `tests/fixtures/**` | CONSUMER | **OWNER** | Shared fixtures must remain contract-compatible |
| `docs/**` | READ / PROPOSE | **OWNER** for architecture/contract docs | Avoid concurrent edits |
| `template.yaml` | READ ONLY | **OWNER** | Backend / infrastructure ownership |
| `samconfig.toml` | READ ONLY | **OWNER** | Backend / infrastructure ownership |
| Root config files | COORDINATE | COORDINATE | Never overwrite another agent's changes |
| `.gitignore` | COORDINATE | COORDINATE | Append only when required |
| `README.md` | PROPOSE | PROPOSE | Coordinate changes |

---

## 3. Agent Responsibilities & Boundaries

### Agent A — Frontend Owner
* **Agent**: Antigravity / Gemini CLI
* **Primary Scope**: `frontend/**`, frontend tests, frontend-specific documentation
* **Owns**: React 18 + Vite application, routing, page/screen implementation, component system, Vanilla CSS/design tokens, responsive/mobile UX, React Context/custom hooks, API client, frontend loading/error/empty states, frontend auth/token handling, frontend mock API integration, frontend test coverage.
* **Must NOT modify**: `backend/**`, deterministic scoring engine, catalog implementation, backend configuration, AWS infrastructure, backend secrets/configuration, backend-owned tests.
* **Contract Rule**: Builds against documented API contracts and shared types. When backend endpoints do not yet exist, use typed mock responses / local fixtures.

### Agent B — Backend Owner
* **Agent**: Claude Code through Ollama
* **Primary Scope**: `backend/**`, backend/deterministic engine tests, backend-specific documentation
* **Owns**: API routing, Lambda handler, session/group lifecycle, participant authentication/token validation, DynamoDB access, catalog access, LLM provider abstraction, NVIDIA provider, future Bedrock provider boundary, interviewer/dialogue logic, preference extraction, preference ratification, constraint handling, deterministic scoring, conflict resolution, fairness calculation, Pareto analysis, grounded explanations, voting, outbound product links, logging/error handling, backend tests, Secrets Manager integration.
* **Must NOT modify**: Edit frontend implementation files, redesign frontend routes/components, place secrets in source code, expose NVIDIA credentials to the browser, allow the LLM to directly determine final rankings, silently change the public API contract.
* **Contract Authority**: Sole authority over canonical shared types and API contract specifications.

---

## 4. Shared Coordination & Contract Changes

* **Contract Authority**: Claude Code (Backend Agent) is the contract authority for `shared/**` and `docs/70_API_CONTRACTS.md`.
* **Change Procedure**:
  1. Frontend agent documents the requested contract change in `docs/AGENT_HANDOFF.md`.
  2. Frontend agent notifies the backend agent.
  3. Backend agent reviews and updates the canonical contract in `shared/**` and API docs.
  4. Frontend agent updates its implementation against the newly ratified contract.
* **Zero Divergence**: No agent may silently diverge from the shared contract.

---

## 5. Agent Startup Instructions

### Frontend Agent Startup
Before editing:
1. Read `phase_by_phase_implementation.md`
2. Read `docs/AGENT_OWNERSHIP.md`
3. Read `docs/PARALLEL_INTEGRATION_CONTRACT.md`
4. Read the relevant ADRs under `docs/`
5. Inspect `frontend/**`
6. Inspect current shared contracts
7. Work only inside frontend ownership boundaries
8. Use mocks until integration gates are reached

### Backend Agent Startup
Before editing:
1. Read `phase_by_phase_implementation.md`
2. Read `docs/AGENT_OWNERSHIP.md`
3. Read `docs/PARALLEL_INTEGRATION_CONTRACT.md`
4. Read the relevant ADRs under `docs/`
5. Inspect `backend/**`
6. Define/finalize shared contracts first
7. Use `MockLLMProvider` before live NVIDIA integration
8. Work only inside backend ownership boundaries
9. Keep deterministic decision logic authoritative
