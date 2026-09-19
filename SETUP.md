# Consenzo — Setup & Deployment Guide

This guide provides step-by-step instructions for running Consenzo locally, running via Docker, and deploying to AWS Serverless infrastructure.

---

## 📋 Table of Contents
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

# Install dependencies across all workspaces
npm install
```

### Step 2: Configure Local Environment
Create your local environment file in `backend/.env`:
```bash
cp backend/.env.example backend/.env
```

Set the following values in `backend/.env`:
```env
PORT=3000
NODE_ENV=development
USE_LOCAL_DB=true
LLM_PROVIDER=nvidia
LLM_BASE_URL=https://integrate.api.nvidia.com/v1
LLM_MODEL=nvidia/nemotron-3.5-lightning-30b-a3b
NVIDIA_API_KEY=nvapi-your-key-here
JWT_SECRET=consenzo-local-dev-secret-key-32-chars-min
```

### Step 3: Start Full-Stack Dev Server
```bash
npm run dev
```
* **Frontend SPA**: `http://localhost:5173`
* **Backend API**: `http://localhost:3000`

---

## 3. Docker Setup

Consenzo includes complete Docker configurations for isolated local development without installing local runtime tools.

### Run with Docker Compose
```bash
# Build and launch both frontend and backend containers
docker compose up --build
```

* **Frontend**: `http://localhost:80`
* **Backend**: `http://localhost:3000`

### Stop Containers
```bash
docker compose down
```

---

## 4. AWS Serverless Deployment

Consenzo is designed for zero-maintenance serverless hosting on Amazon Web Services using **AWS SAM (Serverless Application Model)**.

### Architecture Components Provisioned:
* **AWS Lambda**: Node.js 20.x ZIP-packaged monolithic router.
* **Amazon API Gateway**: HTTP API with CORS configuration.
* **Amazon DynamoDB**: Single-table design (`consenzo-core-dev`) with pay-per-request billing and auto-TTL.
* **AWS Secrets Manager**: Encrypted storage for NVIDIA API keys.
* **Amazon S3**: Static website hosting bucket for the React SPA.

### Deployment Steps:

1. **Authenticate AWS CLI**:
   ```bash
   aws sso login --profile consenzo
   ```

2. **Store NVIDIA Key in AWS Secrets Manager**:
   ```bash
   aws secretsmanager create-secret \
     --name consenzo/nvidia-api-key \
     --secret-string "YOUR_NVIDIA_API_KEY" \
     --region us-east-1 \
     --profile consenzo
   ```

3. **Deploy Backend & Infrastructure via SAM**:
   ```bash
   sam build
   sam deploy --guided
   ```

4. **Build & Sync Frontend to S3**:
   ```bash
   # Set API Gateway URL and build frontend
   cd frontend
   npm run build
   aws s3 sync dist s3://YOUR_FRONTEND_BUCKET_NAME --delete --profile consenzo
   ```

---

## 5. Environment Variables Reference

| Variable | Description | Scope |
| :--- | :--- | :--- |
| `VITE_API_URL` | Base API Gateway endpoint URL | Frontend Build |
| `VITE_USE_MOCKS` | If `true`, runs frontend on in-memory mock store | Frontend Runtime |
| `PORT` | Local server port (Default: `3000`) | Backend Local |
| `USE_LOCAL_DB` | Uses in-memory database instead of DynamoDB | Backend Local |
| `LLM_PROVIDER` | Active LLM (`nvidia`, `bedrock`, `mock`) | Backend |
| `LLM_MODEL` | Model ID (`nvidia/nemotron-3.5-lightning-30b-a3b`)| Backend |
| `NVIDIA_API_KEY_SECRET_ARN` | Secrets Manager ARN for NVIDIA key | Backend AWS |
| `DYNAMODB_TABLE_NAME` | Target DynamoDB table name | Backend AWS |
| `JWT_SECRET` | HMAC SHA-256 secret for session tokens | Backend |

---

## 6. Testing & Verification

### Run Unit & Integration Tests
```bash
npm run test
```

### Run Live AWS Smoke Test Suite
```bash
node scratch/verify_live_aws.js
```
Runs a real multi-agent consensus session:
1. `GET /health` (DynamoDB & Catalog check)
2. `POST /groups` (Session creation)
3. `POST /groups/join` (Participant join)
4. `POST /conversations` (Adaptive interview)
5. `POST /conversations/{id}/messages` (Live NVIDIA Nemotron inference)
6. `POST /participants/{id}/preferences/confirm` (Constraint locking)
7. `POST /groups/{id}/analysis` (Consensus analysis & ranking)
8. `POST /groups/{id}/votes` (Unanimous vote tally)
9. S3 frontend delivery validation
