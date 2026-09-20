# Consenzo — Setup & Deployment Guide

This guide provides step-by-step instructions for running Consenzo locally and via Docker.
For the full AWS cloud deployment runbook, see **[docs/98_AWS_DEPLOYMENT_GUIDE.md](docs/98_AWS_DEPLOYMENT_GUIDE.md)**.

---

## Table of Contents
1. [Prerequisites](#1-prerequisites)
2. [Local Development Setup](#2-local-development-setup)
3. [Docker Setup](#3-docker-setup)
4. [AWS Serverless Deployment](#4-aws-serverless-deployment)
5. [Environment Variables Reference](#5-environment-variables-reference)
6. [Testing & Verification](#6-testing--verification)

---

## 1. Prerequisites

* **Node.js**: `v20.x` or higher
* **npm**: `v9.x` or higher
* **Git**: `v2.x`
* **Docker Desktop**: *(Optional, for containerized local execution)*
* **AWS CLI & AWS SAM CLI**: *(Optional, for AWS cloud deployments)*

---

## 2. Local Development Setup

### Step 1: Clone Repository & Install Dependencies
```bash
git clone https://github.com/YuvanChaudary/Consenzo.git
cd Consenzo

# Install dependencies across all workspaces (backend, frontend, shared)
npm install
```

### Step 2: Configure Local Environment (optional)

`npm run dev` works with **zero configuration** — it defaults to a fully offline stack
(`LLM_PROVIDER=mock`, in-memory database). No API keys or AWS account are needed.

For real LLM interviews or DynamoDB-backed persistence, create `backend/.env.local`
(copy from `backend/.env.example` — note the `.local` suffix; `.env.local` is gitignored,
`.env` alone is not read by the dev launcher):

```bash
cp backend/.env.example backend/.env.local
```

Then set in `backend/.env.local`:
```env
PORT=3001
NODE_ENV=development
USE_LOCAL_DB=true
LLM_PROVIDER=nvidia
LLM_BASE_URL=https://integrate.api.nvidia.com/v1
LLM_MODEL=nvidia/nemotron-3.5-lightning-30b-a3b
NVIDIA_API_KEY=nvapi-your-key-here
JWT_SECRET=consenzo-local-dev-secret-key-32-chars-min
```

Valid `LLM_PROVIDER` values: `nvidia | anthropic | bedrock | mock` (must match
`backend/src/config/env.ts`).

### Step 3: Start Full-Stack Dev Server
```bash
npm run dev
```
* **Frontend SPA**: `http://localhost:5173` (auto-wired to the local backend)
* **Backend API**: `http://localhost:3001` (health check: `http://localhost:3001/health`)

To run the pieces separately:
```bash
npm run dev:backend     # builds backend, starts API on :3001
npm run dev:frontend    # Vite dev server on :5173
```

> The frontend uses `VITE_API_BASE_URL` (build/runtime env, falls back to the deployed
> AWS endpoint). When launched via `npm run dev` it is pointed at `http://localhost:3001`
> automatically.

---

## 3. Docker Setup

Consenzo includes Docker configurations for isolated local development.

### Run with Docker Compose
```bash
# Build and launch both frontend and backend containers
docker compose up --build
```

* **Frontend**: `http://localhost:80`
* **Backend**: `http://localhost:3001`

### Stop Containers
```bash
docker compose down
```

---

## 4. AWS Serverless Deployment

Consenzo deploys as a serverless stack via **AWS SAM**. The complete runbook —
prerequisites, IAM permissions, Secrets Manager setup, deploy commands, frontend
publishing, secret rotation, rollback, teardown, and a troubleshooting matrix — lives in:

**[docs/98_AWS_DEPLOYMENT_GUIDE.md](docs/98_AWS_DEPLOYMENT_GUIDE.md)**

Short version:

1. **Authenticate**: `aws sso login --profile consenzo`
2. **Create the two secrets** (one-time per account/region — names are pinned by the template):
   ```bash
   aws secretsmanager create-secret --name consenzo/nvidia-api-key \
     --secret-string "YOUR_NVIDIA_API_KEY" --region us-east-1 --profile consenzo

   aws secretsmanager create-secret --name consenzo/jwt-secret \
     --secret-string "$(node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))")" \
     --region us-east-1 --profile consenzo
   ```
3. **Build & deploy**:
   ```bash
   npm --prefix backend run build
   sam build
   sam deploy          # uses samconfig.toml (stack consenzo-core-dev)
   ```
4. **Publish the frontend with the API URL baked in** (Vite env vars are build-time):
   ```bash
   API_URL=$(aws cloudformation describe-stacks --stack-name consenzo-core-dev \
     --region us-east-1 --profile consenzo \
     --query "Stacks[0].Outputs[?OutputKey=='ApiEndpoint'].OutputValue" --output text)
   BUCKET=$(aws cloudformation describe-stacks --stack-name consenzo-core-dev \
     --region us-east-1 --profile consenzo \
     --query "Stacks[0].Outputs[?OutputKey=='FrontendBucketName'].OutputValue" --output text)

   VITE_API_BASE_URL="$API_URL" npm --prefix frontend run build
   aws s3 sync frontend/dist "s3://$BUCKET/" --delete --region us-east-1 --profile consenzo
   ```

> ⚠️ Skipping step 2's JWT secret makes the deploy succeed but every `POST /groups`
> fail at runtime — see the troubleshooting matrix in the deployment guide.

---

## 5. Environment Variables Reference

| Variable | Description | Scope |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Base API Gateway endpoint URL (preferred; `VITE_API_URL` also honored) | Frontend Build |
| `VITE_USE_MOCKS` | If `true`, runs frontend on in-memory mock store (forced `true` in unit tests) | Frontend Runtime |
| `PORT` | Local server port (Default: **`3001`**) | Backend Local |
| `USE_LOCAL_DB` | If `true`, uses in-memory database instead of DynamoDB | Backend Local |
| `LLM_PROVIDER` | Active LLM (`nvidia`, `anthropic`, `bedrock`, `mock`) | Backend |
| `LLM_MODEL` | Model ID (`nvidia/nemotron-3.5-lightning-30b-a3b`) | Backend |
| `NVIDIA_API_KEY` | Dev-only fallback key (non-production; production reads Secrets Manager) | Backend Local |
| `NVIDIA_API_KEY_SECRET_ARN` | Secrets Manager ARN for the NVIDIA key | Backend AWS |
| `DYNAMODB_TABLE_NAME` | Target DynamoDB table name | Backend AWS |
| `JWT_SECRET` | HMAC SHA-256 secret for session tokens (min 32 chars; AWS deploys resolve it from Secrets Manager) | Backend |

---

## 6. Testing & Verification

### Run Unit & Integration Tests
```bash
npm run test       # backend jest (87 tests) + frontend vitest (8 tests), fully offline
```

### Post-deploy live smoke check (manual)
1. `GET <ApiEndpoint>/health` — expect `status: healthy`, catalog counts (155 products total).
2. `POST <ApiEndpoint>/groups` — expect JWT + invite code (proves secrets + DynamoDB).
3. Complete a 2-participant interview, confirm preferences, run analysis
   (`POST /groups/{id}/analysis` → `status: COMPLETED`), then vote.

The former `scratch/verify_live_aws.js` script no longer exists; use the manual checklist
above or the verification commands in `docs/98_AWS_DEPLOYMENT_GUIDE.md` §6.
