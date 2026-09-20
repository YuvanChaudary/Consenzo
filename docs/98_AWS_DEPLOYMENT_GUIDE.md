# 98 — AWS Deployment Guide (Cloud Developer Runbook)

> **Audience**: The cloud/DevOps engineer deploying Consenzo to AWS. Every command, identifier,
> and file location below refers to the **repository root `Consenzo/`**.
> **Last verified against**: `template.yaml` + `samconfig.toml` as of 2026-09-19.
> Local development is covered in [`SETUP.md`](../SETUP.md); this document is deploy-focused.

---

## 0. What you will provision

| # | Component | Cloud Resource | Identifier | Runtime Config |
|---|-----------|----------------|------------|----------------|
| 1 | Backend API | AWS Lambda (ZIP, monolithic router) | `consenzo-backend-handler-{Stage}` | Node.js 20.x, 512 MB, 30 s timeout |
| 2 | API Layer | API Gateway **HTTP API** (v2, CORS enabled) | `https://{apiId}.execute-api.{region}.amazonaws.com/{Stage}` | Proxy `ANY /` and `ANY /{proxy+}` |
| 3 | Database | DynamoDB single-table (on-demand, SSE, PITR, TTL) | `consenzo-core-{Stage}` | Keys `PK`/`SK` + GSI1 (`GSI1_PK`/`GSI1_SK`) |
| 4 | Frontend Hosting | S3 static website bucket (public read policy) | `consenzo-frontend-{Stage}-{AccountId}` | `index.html` as index **and** error document (SPA routing) |
| 5 | LLM Secret | AWS Secrets Manager | `consenzo/nvidia-api-key` | Read by Lambda at runtime (cached per container) |
| 6 | JWT Secret | AWS Secrets Manager | `consenzo/jwt-secret` | Resolved **at deploy time** by SAM into `JWT_SECRET` |

**Everything is declared in one SAM template: `template.yaml`. There are no hand-created console resources.**

### Approximate cost at demo/light traffic (us-east-1)

| Service | Cost driver | Expected |
|---|---|---|
| Lambda | 1M req + 400k GB-s free tier | ~$0 |
| API Gateway HTTP API | 1M req/mo free tier | ~$0 |
| DynamoDB | On-demand, tiny traffic, 25 GB free | ~$0 |
| S3 website hosting | pennies per GB + $0.0004/1k GET | < $0.10 |
| Secrets Manager | $0.40/secret/month | **$0.80/mo** (2 secrets) |
| **Total idle** | scale-to-zero compute | **≈ $1/mo** |

---

## 1. Architecture & request flow

```
Browser SPA (S3 website endpoint)
   │  fetch(baseURL + path)      baseURL = VITE_API_BASE_URL baked at build time
   ▼
API Gateway HTTP API  ── CORS: AllowOrigins ["*"], methods GET/POST/OPTIONS
   ▼
Lambda consenzo-backend-handler-{Stage}
   ├── env: NODE_ENV, DYNAMODB_TABLE_NAME, LLM_PROVIDER, LLM_MODEL,
   │        LLM_BASE_URL, JWT_SECRET, NVIDIA_API_KEY_SECRET_ARN, ANTHROPIC_API_KEY
   ├── routeRequest() → src/router.ts (auth via JWT Bearer, then controllers)
   ├── DynamoDB  ←→  consenzo-core-{Stage}   (sessions, rosters, votes)
   ├── Secrets Manager → consenzo/nvidia-api-key (LLM key, cached in memory)
   └── Catalog: bundled JSON files inside the Lambda ZIP (backend/catalog/**, copied
                into dist by the backend build script — no S3 catalog read at runtime)
```

Key facts a cloud developer must know:

- **The catalog is bundled, not fetched**: `backend/package.json` → `build` copies `Consenzo/catalog/` into the Lambda package. Adding products = edit JSON + redeploy Lambda. No S3 catalog bucket is involved at runtime.
- **JWT secret is deploy-time-resolved**, the NVIDIA key is **runtime-fetched**. Rotation procedures differ (§7.3).
- **Two deploy entry points exist** and use **different stack names** (§4.4): `samconfig.toml` → `consenzo-core-dev`; `scripts/deploy-aws.sh|bat` → `consenzo-prod`. Pick one and stay consistent, otherwise `sam deploy` and the scripts will fight each other.

---

## 2. Prerequisites

### 2.1 Tools

| Tool | Version | Check |
|---|---|---|
| AWS CLI v2 | ≥ 2.13 | `aws --version` |
| AWS SAM CLI | ≥ 1.100 | `sam --version` |
| Node.js | ≥ 20 (LTS) | `node --version` |
| npm | ≥ 9 | `npm --version` |
| Git | any recent | — |

### 2.2 AWS authentication

```bash
# SSO / Identity Center (project convention — profile name "consenzo")
aws configure sso            # one-time setup
aws sso login --profile consenzo
export AWS_PROFILE=consenzo  # bash; on Windows Git Bash use export, on PowerShell $env:AWS_PROFILE

# Verify
aws sts get-caller-identity  # must return your principal ARN
```

### 2.3 IAM permissions required of the deploying principal

Console-equivalent: `PowerUserAccess` **plus** IAM role management. Explicit minimum list:

```
cloudformation:*Create*|*Update*|*Delete*|DescribeStacks|ValidateTemplate|GetTemplate
s3:CreateBucket, PutObject, GetObject, DeleteObject, ListBucket, PutBucketPolicy,
   PutEncryptionConfiguration, PutPublicAccessBlock, GetBucketLocation
apigateway:POST/GET/DELETE (HTTP API creation), apigatewayv2 equivalents
lambda:CreateFunction, UpdateFunctionCode/Configuration, GetFunction, AddPermission
dynamodb:CreateTable, DescribeTable, UpdateTable, DeleteTable, PutItem/GetItem/Query (runtime)
iam:CreateRole, CreatePolicy, GetRole, PassRole, AttachRolePolicy, DeleteRole/Policy
secretsmanager:GetSecretValue            (deploy-time resolve of JWT + runtime fetch)
ssm / s3 for SAM's auto-created artifacts bucket (--resolve-s3 handles this)
```

> `CAPABILITY_IAM` is passed by both deploy paths because the template lets SAM create the Lambda
> execution role. `CAPABILITY_NAMED_IAM` is additionally passed by `scripts/deploy-aws.sh|bat` —
> harmless but not required (the named Lambda function does not need it; only named IAM resources do).

---

## 3. One-time account setup (per account + region)

### 3.1 Create the NVIDIA API key secret

The Lambda reads `consenzo/nvidia-api-key` at runtime. The ARN is **hard-pinned** in the template to
`arn:aws:secretsmanager:{Region}:{AccountId}:secret:consenzo/nvidia-api-key*` — so the name and
region **must match** your deployment:

```bash
aws secretsmanager create-secret \
  --name consenzo/nvidia-api-key \
  --secret-string "nvapi-YOUR_REAL_NVIDIA_KEY" \
  --region us-east-1 --profile consenzo
```

Get a key at https://build.nvidia.com (free tier available). The key is never stored in git, never
returned by the API, and only ever leaves the Lambda process inside the `Authorization: Bearer …`
header to `integrate.api.nvidia.com`.

### 3.2 Create the JWT signing secret

```bash
# Generate a strong 64-byte secret and store it
aws secretsmanager create-secret \
  --name consenzo/jwt-secret \
  --secret-string "$(node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))")" \
  --region us-east-1 --profile consenzo
```

The secret must be a **plain string ≥ 32 characters** (the backend validates `JWT_SECRET` length with
zod; a short value fails Lambda cold-start with `Environment configuration error`).

> **Optional — Anthropic provider**: when `LLMProvider=anthropic`, the key is passed via the
> `AnthropicApiKey` CloudFormation parameter (`NoEcho`) as the Lambda env var `ANTHROPIC_API_KEY`.
> Generate it at https://console.anthropic.com and supply it as a deploy parameter (§4.3). It is not
> stored in Secrets Manager by this template.

### 3.3 Verify template (preflight)

```bash
cd Consenzo
sam validate --profile consenzo   # runs linting on template.yaml
```

---

## 4. Deployment procedure

### 4.1 Stage 1 — Build the backend

```bash
npm --prefix backend run build
```

This runs `tsc` and copies `catalog/` into the build output. **Verify** `backend/dist/backend/src/index.js`
exists — the SAM handler path is `dist/backend/src/index.handler`.

### 4.2 Stage 2 — Build the SAM artifact

```bash
sam build            # from repo root; uses template.yaml
```

Output goes to `.aws-sam/build/` (gitignored). First build downloads the Node runtime layer metadata.

### 4.3 Stage 3 — Deploy the stack

**Option A — via `samconfig.toml` (recommended, stack `consenzo-core-dev`):**

```bash
sam deploy
```

`[default.deploy.parameters]` in `samconfig.toml` already carries:

```toml
stack_name      = "consenzo-core-dev"
region          = "us-east-1"
capabilities    = "CAPABILITY_IAM"
resolve_s3      = true
s3_prefix       = "consenzo-core-dev"
parameter_overrides = "Stage=\"dev\" LLMProvider=\"nvidia\" LLMModel=\"nvidia/nemotron-3.5-lightning-30b-a3b\" LLMBaseUrl=\"https://integrate.api.nvidia.com/v1\" JwtSecret=\"{{resolve:secretsmanager:consenzo/jwt-secret~true:SecretString:secret}}\""
```

The `JwtSecret` line is the critical one: `{{resolve:secretsmanager:…}}` pulls the secret value from
Secrets Manager **at deploy time** and injects it into the Lambda env var. The `~true` suffix means
"include the partial ARN suffix", which keeps the resolution region/account-correct.

**Option B — explicit CLI (full control, e.g. `Stage=prod`):**

```bash
sam deploy \
  --stack-name consenzo-prod \
  --region us-east-1 \
  --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM \
  --resolve-s3 \
  --no-confirm-changeset \
  --parameter-overrides \
      Stage=prod \
      LLMProvider=nvidia \
      LLMModel="nvidia/nemotron-3.5-lightning-30b-a3b" \
      LLMBaseUrl="https://integrate.api.nvidia.com/v1" \
      JwtSecret="{{resolve:secretsmanager:consenzo/jwt-secret~true:SecretString:secret}}"
      # Optional: AnthropicApiKey=sk-ant-... (only when LLMProvider=anthropic)
```

**Deploy-time parameters reference:**

| Parameter | Type | Default | Notes |
|---|---|---|---|
| `Stage` | String | `dev` | Suffixes the table, function, bucket names & API stage path |
| `JwtSecret` | String (NoEcho) | `""` | **Must** be supplied via resolve or `--parameter-overrides`; empty string fails runtime (zod min 32) |
| `LLMProvider` | String | `nvidia` | Allowed: `nvidia` \| `anthropic` \| `bedrock` \| `mock` (kept in sync with `backend/src/config/env.ts`) |
| `LLMModel` | String | `nvidia/nemotron-3.5-lightning-30b-a3b` | Any model ID the chosen provider serves |
| `LLMBaseUrl` | String | `https://integrate.api.nvidia.com/v1` | OpenAI-compatible chat-completions base |
| `AnthropicApiKey` | String (NoEcho) | `""` | Only read when `LLMProvider=anthropic` |

**Option C — one-shot pipeline script:**

```bash
bash scripts/deploy-aws.sh        # Linux/macOS/Git Bash
scripts\deploy-aws.bat            # Windows cmd
```

⚠️ **Known divergence to be aware of**: the scripts deploy stack name `consenzo-prod` and skip the
secrets setup; if those secrets don't exist yet the deploy succeeds but the API 500s on
`POST /groups` (JWT secret empty). Run §3.2 once before ever running the scripts. The scripts also
pass `Stage` implicitly as `dev` via samconfig unless overridden — set `--parameter-overrides Stage=prod`
if you intend a truly prod-stage deployment.

### 4.4 Stage 4 — Capture stack outputs

```bash
aws cloudformation describe-stacks --stack-name consenzo-core-dev --region us-east-1 \
  --query "Stacks[0].Outputs" --output table --profile consenzo
```

| OutputKey | Meaning | Example |
|---|---|---|
| `ApiEndpoint` | **This is the value the frontend build needs** | `https://abcd1234.execute-api.us-east-1.amazonaws.com/dev` |
| `FrontendWebsiteUrl` | The public app URL users open | `http://consenzo-frontend-dev-<acct>.s3-website-us-east-1.amazonaws.com` |
| `FrontendBucketName` | Sync target for `dist/` | `consenzo-frontend-dev-<acct>` |
| `DynamoDBTableName` | For ad-hoc debugging/exports | `consenzo-core-dev` |
| `LambdaFunctionArn` | For log tailing / invoking manually | `arn:aws:lambda:…:function:consenzo-backend-handler-dev` |

### 4.5 Stage 5 — Build & publish the frontend

```bash
# Build with the API endpoint baked in (Vite env vars are build-time constants!)
VITE_API_BASE_URL="<ApiEndpoint from Stage 4>" npm --prefix frontend run build

# Publish
aws s3 sync frontend/dist "s3://<FrontendBucketName>/" --delete --region us-east-1 --profile consenzo
```

🔴 **The #1 frontend deploy mistake**: forgetting the `VITE_API_BASE_URL` env var. The API client
(`frontend/src/services/api.ts`) resolves its base URL as:

```
import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "https://0wc5as4rug.execute-api.us-east-1.amazonaws.com/dev"
```

Deploying to a **new** AWS account without setting either variable bakes in the **old account's**
endpoint — the site silently works against the wrong backend. Always verify after deploy:
open the site, DevTools → Network → confirm API calls hit *your* `ApiEndpoint`.

(Both `VITE_API_BASE_URL` and `VITE_API_URL` are honored; the deploy scripts use `VITE_API_URL`.)

---

## 5. Recently changed infrastructure files (reviewer notes)

If you are reviewing infra changes from the last hardening pass, these are the deltas and why:

| File | Change | Reason |
|---|---|---|
| `template.yaml` → `JwtSecret` | Converted from a hardcoded literal to a `NoEcho` parameter (default `""`) | **Security**: zero secrets in git (docs/82_SECRETS.md §1) |
| `samconfig.toml` → `parameter_overrides` | `JwtSecret` now resolved from Secrets Manager at deploy time | Feeds the new parameter without human-typed secrets in CI |
| `template.yaml` → `LLMProvider.AllowedValues` | Added `anthropic` | `AnthropicLLMProvider` exists in `backend/src/services/llm/providerFactory.ts`; previously selecting it failed CloudFormation validation, mirroring a cold-start bug fixed in `env.ts` |
| `template.yaml` → Lambda env | Added `ANTHROPIC_API_KEY: !Ref AnthropicApiKey` + new `AnthropicApiKey` (NoEcho) parameter | Makes the Anthropic provider actually usable in AWS |
| `scripts/dev.js` | No longer requires `backend/.env.local`; offline defaults (mock LLM, in-memory DB); frontend pointed at local backend | `npm run dev` previously crashed without a hand-made `.env.local` (Node `--env-file` hard-fails) |

---

## 6. Post-deployment verification checklist

```bash
# 1. Health (catalog counts + DB mode + LLM provider)
curl "https://<ApiEndpoint>/health"
# Expect: {"data":{"status":"healthy","database":{"mode":...},"services":{"catalog":{...}}}}
# catalog counts should show smart_tvs 50, laptops 50, soundbars 50, totalProducts 155

# 2. Create a room (proves JWT signing + DynamoDB write)
curl -X POST "https://<ApiEndpoint>/groups" -H "Content-Type: application/json" \
  -d '{"title":"Deploy Check","category":"smart_tvs","creatorDisplayName":"CloudDev","targetParticipantCount":2}'
# Expect 200 with groupId, inviteCode, token (JWT). A 500 here almost always means JWT_SECRET resolution failed.

# 3. Use the token from step 2 for the consensus analysis
curl -X POST "https://<ApiEndpoint>/groups/<groupId>/analysis" \
  -H "Authorization: Bearer <token>" -H "Content-Type: application/json" -H "Idempotency-Key: deploy-1"
# Expect "status":"COMPLETED" and metrics.feasibleCount > 0

# 4. Open FrontendWebsiteUrl in a browser, join the room with the inviteCode, complete a
#    2-turn interview, confirm preferences, view the recommendation board, cast votes.
```

Also tail the logs while testing:

```bash
sam logs --stack-name consenzo-core-dev --tail --profile consenzo
# or
aws logs tail "/aws/lambda/consenzo-backend-handler-dev" --follow --profile consenzo
```

---

## 7. Updating the deployment

### 7.1 Backend code change

```bash
npm --prefix backend run build && sam build && sam deploy        # Option A path
```

### 7.2 Frontend code change

```bash
VITE_API_BASE_URL="<ApiEndpoint>" npm --prefix frontend run build
aws s3 sync frontend/dist "s3://<FrontendBucketName>/" --delete
```

S3 website endpoints serve content immediately; browsers may cache `index.html` briefly —
hard-refresh when verifying.

### 7.3 Secrets

| Secret | Mechanism | Redeploy needed? | Effect of rotation |
|---|---|---|---|
| `consenzo/jwt-secret` | deploy-time resolve | **Yes** (re-run `sam deploy`) | All existing session tokens invalidated; users rejoin rooms |
| `consenzo/nvidia-api-key` | runtime fetch (cached per warm container) | No — but containers cache until recycled; force recycle by `aws lambda update-function-configuration --function-name <fn> --description "rotate-$(date +%s)"` | New key used on next cold container |

```bash
# Rotate NVIDIA key (no redeploy)
aws secretsmanager put-secret-value --secret-id consenzo/nvidia-api-key \
  --secret-string "nvapi-NEW_KEY" --region us-east-1 --profile consenzo

# Rotate JWT secret (redeploy after)
aws secretsmanager put-secret-value --secret-id consenzo/jwt-secret \
  --secret-string "$(node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))")" \
  --region us-east-1 --profile consenzo
```

### 7.4 Changing catalog data

Edit `Consenzo/backend/catalog/*.json` (and schema in `Consenzo/catalog/schema/` if fields change),
then treat as a backend change (§7.1). Catalog counts appear in `/health` for verification.

### 7.5 Changing LLM provider/model

Redeploy with overridden parameters, e.g.:

```bash
sam deploy --parameter-overrides \
  "Stage=\"dev\" LLMProvider=\"anthropic\" LLMModel=\"claude-3-5-haiku-latest\" LLMBaseUrl=\"https://api.anthropic.com/v1\" AnthropicApiKey=\"sk-ant-...\" JwtSecret=\"{{resolve:secretsmanager:consenzo/jwt-secret~true:SecretString:secret}}\""
```

Note the **entire** `parameter_overrides` string is replaced on redeploy (CloudFormation semantics),
so always include `JwtSecret` in overrides. Valid `LLMProvider` values: `nvidia | anthropic | bedrock | mock`.

---

## 8. Rollback

CloudFormation keeps last-known-good templates per stack:

```bash
# Rollback a failed update (usually automatic on stack failure)
aws cloudformation cancel-update-stack --stack-name consenzo-core-dev --region us-east-1

# Rollback to a previous template version: redeploy the old template from git
git checkout <last-good-tag> -- template.yaml backend/ frontend/
npm --prefix backend run build && sam build && sam deploy

# Rollback frontend: re-sync the previous build (keep last-good dist before each deploy)
aws s3 sync ./frontend-dist-backup "s3://<FrontendBucketName>/" --delete
```

DynamoDB data is not touched by backend rollbacks (same table name unless `Stage` changed —
**never change `Stage` on an existing stack**, that creates a parallel environment).

---

## 9. Teardown (avoiding recurring charges)

```bash
# 1. Empty the frontend bucket (CFN refuses to delete non-empty S3 buckets)
aws s3 rm "s3://<FrontendBucketName>" --recursive --region us-east-1 --profile consenzo

# 2. Delete the stack (removes Lambda, API Gateway, DynamoDB, bucket, roles)
aws cloudformation delete-stack --stack-name consenzo-core-dev --region us-east-1 --profile consenzo
aws cloudformation wait stack-delete-complete --stack-name consenzo-core-dev --region us-east-1

# 3. Delete secrets (the only recurring cost, ~$0.80/mo)
aws secretsmanager delete-secret --secret-id consenzo/nvidia-api-key \
  --force-delete-without-recovery --region us-east-1 --profile consenzo
aws secretsmanager delete-secret --secret-id consenzo/jwt-secret \
  --force-delete-without-recovery --region us-east-1 --profile consenzo

# 4. Remove SAM's artifacts bucket (created by --resolve-s3)
aws s3 ls | grep consenzo-core-dev   # find aws-sam-assets bucket, then rm --recursive + rb
```

---

## 10. Troubleshooting matrix

| Symptom | Root cause | Fix |
|---|---|---|
| `POST /groups` → 500 `Environment configuration error` in logs | `JWT_SECRET` missing/short at cold start (zod `min(32)`) | Check Lambda env var in console; re-run deploy with the `{{resolve:secretsmanager:consenzo/jwt-secret…}}` override (§4.3) |
| Deploy fails: `CREATE_FAILED` on role/policy | Missing IAM perms on deploying principal | Grant §2.3 permissions or use PowerUserAccess + IAM |
| `Could not retrieve API key from secrets manager` in logs during interview | NVIDIA secret name/region mismatch, or policy missing | Secret **must** be named `consenzo/nvidia-api-key` in the deployed region; template pins the ARN to `${AWS::Region}:${AWS::AccountId}` |
| Browser shows CORS error on first call | Frontend calling wrong origin | CORS is `AllowOrigins ["*"]` in the template — a CORS error almost always means the request went to the wrong/old endpoint (§4.5) or the API route 404'd |
| Site loads but shows old data / no API traffic | Browser cache or stale `index.html` | Hard refresh; confirm baked URL: `grep -o "https://[a-z0-9]*\.execute-api[^\"']*" frontend/dist/assets/*.js | head -1` |
| `sam deploy` says "no changes" but code changed | Forgot `sam build` after rebuild | Always `sam build && sam deploy` |
| Interview replies are generic/odd and logs show "falling back to dynamic NLP engine" | NVIDIA call failed (bad key / 429 / network) | Check `consenzo/nvidia-api-key` value & quota; system degrades gracefully (deterministic extractor), no data corruption |
| Analysis returns 500 `ENGINE_ERROR` | Deterministic engine threw (bug, not LLM) | Capture correlationId from response, pull logs with `sam logs --filter <id>` |
| Frontend 200 but everything else 403/401 | Missing/expired JWT | All non-health endpoints require `Authorization: Bearer <token>` from `/groups` or `/groups/join` |
| `sam validate` fails on Windows | Template edited with bad indentation after manual change | Keep 2-space YAML indentation; the last verified-good template is in git history |

---

## Appendix A — Environment variables

### Lambda runtime (set by `template.yaml`, do not set manually)

| Var | Source | Purpose |
|---|---|---|
| `NODE_ENV` | `production` literal | Switches secret resolution to Secrets-Manager-only |
| `DYNAMODB_TABLE_NAME` | `!Ref ConsenzoCoreTable` | Single-table name |
| `LLM_PROVIDER` | `!Ref LLMProvider` | `nvidia \| anthropic \| bedrock \| mock` |
| `LLM_MODEL` | `!Ref LLMModel` | Model ID string |
| `LLM_BASE_URL` | `!Ref LLMBaseUrl` | OpenAI-compatible base URL |
| `JWT_SECRET` | `!Ref JwtSecret` | HMAC-SHA256 signing secret (≥ 32 chars, zod-enforced) |
| `NVIDIA_API_KEY_SECRET_ARN` | `!Sub` composed ARN | Secrets Manager read target for NVIDIA key |
| `ANTHROPIC_API_KEY` | `!Ref AnthropicApiKey` | Only used when `LLM_PROVIDER=anthropic` |

### Local backend (`.env.local` or `scripts/dev.js` defaults)

`LLM_PROVIDER`, `LLM_MODEL`, `LLM_BASE_URL`, `NVIDIA_API_KEY` (dev fallback, non-production only),
`JWT_SECRET`, `DYNAMODB_TABLE_NAME`, `USE_LOCAL_DB=true`, `PORT` (default **3001**), `NODE_ENV`.
See `backend/.env.example` as the canonical template. `.env.local` is gitignored.

### Frontend build-time (Vite — baked into the bundle)

| Var | Purpose |
|---|---|
| `VITE_API_BASE_URL` (or legacy `VITE_API_URL`) | API base; **must** be set for every production build |
| `VITE_USE_MOCKS=true` | Run SPA against in-memory mock store (offline demo; also forced in unit tests by `vite.config.ts`) |

## Appendix B — Known hardening backlog (post-MVP)

These are documented gaps, deliberately deferred; do not "fix" silently without a decision record:

1. **CORS `AllowOrigins: ['*']`** — should be pinned to the S3 website URL (or a CloudFront domain) once the app URL is stable.
2. **S3 website endpoint is HTTP-only** — for TLS, front the bucket with CloudFront (template currently uses classic website hosting for zero-config SPA routing).
3. **No API Gateway throttling/rate limit** — docs/24 §6 targets 50 rps/IP; not yet configured in the template.
4. **API Gateway access logging** is not enabled — correlation IDs are returned in responses but not centrally logged.
5. **Local dev `JWT_SECRET` default** exists in `scripts/dev.js` — acceptable for offline dev only; never replicate it in any deployed environment.
6. **`deploy-aws.sh` vs `samconfig.toml` stack-name divergence** (`consenzo-prod` vs `consenzo-core-dev`) — unify under a `-Stage`-aware naming before CI/CD automation.
