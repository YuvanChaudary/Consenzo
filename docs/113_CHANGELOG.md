# Changelog

All notable changes to Consenzo. Dates are ISO (YYYY-MM-DD).

## [Unreleased] — 2026-09-20

### Fixed
- **Recommendation pipeline data loss (critical)**: interview constraints were parsed correctly but
  never persisted, so every group was analysed against empty profiles — the strict gate let all
  products through and rankings were effectively arbitrary (all 50/50 "feasible").
  - `interviewer/dialogueEngine.ts` now persists each turn's extracted constraints via
    `preferenceRepository.saveDraftProfile`.
  - `repositories/preferenceRepository.ts`: added a draft/confirmed split on the single profile
    record (`confirmedByParticipant` flag), constraint merge by `(attribute, operator)` so a later
    clarification supersedes an earlier value, and `getProfile` (draft) vs `getConfirmedProfile`
    (confirmed only). Confirmation now promotes the stored draft instead of discarding it.
  - `controllers/preferenceController.ts`: `getPreferences` returns the live draft (with a
    `confirmed` flag); `confirmPreferences` merges the stored draft with any supplied body.
- **Silent cross-category fallback**: `services/catalogService.ts` `getAll()` returned Smart TVs for
  any unknown/empty category. It now returns an empty set, and `analysisService` fails with a clear
  `CATALOG_UNAVAILABLE` error (mapped in `groupController`) instead of recommending unrelated products.
- `utils/attributeResolver.ts`: `batteryLifeHours` (what the extractor emits) now resolves to
  `product.batteryHours`; the `gamingCapable` heuristic no longer treats `ramGb >= 16` as a GPU.

### Changed
- **Preference-aware recommendation slate** (`services/analysisService.ts`): the candidate pool now
  prefers products satisfying every hard constraint *and* every preference, then hard-feasible
  products, then statistically nearest matches. Added `proximity.mode = PARTIAL`, per-candidate
  `matchQuality`/`matchScore`/`exactMatch`, distinct top-3 slots (no repeats), and nearest-alternative
  fill so the board is never a single repeated row. Non-perfect candidates are ranked by proximity,
  not strict-utility, so "nearest to the request" drives ordering.
- `engine/proximityEngine.ts`: `requestedVsMarket` notes now report how many products actually meet a
  request instead of claiming "not available in market" whenever the gap is zero.
- Frontend: `services/api.ts` `TopRecommendation` carries the match fields;
  `pages/room/RecommendationBoardPage.tsx` shows the `PARTIAL` banner and match-quality badges.

### Verification (2026-09-20)
- Backend: 87/87 tests (19 suites) PASS, `tsc` build PASS.
- Frontend: 8/8 tests PASS, `tsc` PASS.
- Live E2E: laptop room now gates to a real 16 GB laptop under both budgets (`exactFeasibleCount: 1`);
  an impossible 85" OLED-under-30k room returns labelled NEAR alternatives with a `PARTIAL` banner
  and accurate `requestedVsMarket` notes; unknown categories error clearly.

## [Unreleased] — 2026-09-19

### Added
- **Nearest-Feasible Recommendation Engine** (`backend/src/engine/proximityEngine.ts`, `fitStats.ts`):
  zero-match analyses now always return the statistically-nearest real products instead of dead-ending
  or returning an arbitrary catalog slice. Includes `matchScore`/`matchQuality` labels, per-violation
  gap audits ("closest on market"), per-attribute availability census, and `proximity.mode`
  (`EXACT`/`NEAREST`) in the analysis response. New unit suite: `backend/tests/unit/proximityEngine.test.ts` (21 tests).
- **AWS deployment runbook**: `docs/98_AWS_DEPLOYMENT_GUIDE.md` — prerequisites, IAM permissions,
  Secrets Manager setup, SAM deploy procedures, frontend publishing, secret rotation, rollback,
  teardown, troubleshooting matrix, and a hardening backlog.

### Fixed
- Frontend unit tests no longer hit the deployed AWS API: `frontend/vite.config.ts` forces
  `VITE_USE_MOCKS=true` in the vitest environment (was 6/8 failing with live network calls).
- `backend/src/config/env.ts` accepts `LLM_PROVIDER=anthropic` (zod enum previously crashed at
  cold start even though `AnthropicLLMProvider` is wired in `providerFactory.ts`).
- `template.yaml`: production `JWT_SECRET` is no longer hardcoded — it is a `NoEcho` parameter,
  resolved at deploy time from Secrets Manager via `samconfig.toml`.
- `template.yaml`: `LLMProvider.AllowedValues` now includes `anthropic`; new `AnthropicApiKey`
  (NoEcho) parameter wired to the `ANTHROPIC_API_KEY` Lambda env var.
- `scripts/dev.js`: no longer hard-requires `backend/.env.local` (Node `--env-file` crashed startup
  when the file was absent); loads it when present, otherwise uses offline defaults
  (`LLM_PROVIDER=mock`, `USE_LOCAL_DB=true`). Frontend dev server now points at the local backend
  (`VITE_API_BASE_URL=http://localhost:3001`) instead of the deployed AWS endpoint.

### Changed
- `docs/22_TECH_STACK_FLOW.md`, `docs/24_API_ARCHITECTURE.md`, `docs/33_CONSTRAINT_ENGINE.md`:
  zero-feasible-set behavior documentation rewritten to describe the implemented proximity fallback.
- `docs/AGENT_HANDOFF.md`: session addendum with re-verified totals and fix log.
- `SETUP.md`: corrected ports (backend 3001), `.env.local` guidance, `LLM_PROVIDER` values,
  JWT secret deploy step, and links to `docs/98_AWS_DEPLOYMENT_GUIDE.md`.

### Verification (2026-09-19)
- Backend: 87/87 tests (19 suites) PASS, `tsc` build PASS.
- Frontend: 8/8 tests PASS (offline), production build PASS.
- `npm run dev` end-to-end smoke: `/health` 200 (155 products, in-memory DB, mock LLM),
  group create 200 (JWT issued), analysis `COMPLETED` with `feasibleCount=44/50`.
- AWS live deploy: NOT YET VERIFIED — follow `docs/98_AWS_DEPLOYMENT_GUIDE.md` after `aws sso login`.
