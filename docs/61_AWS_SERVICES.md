# 61 — AWS Services Matrix & Infrastructure Allocation

## Document Metadata
- **Document Type**: Cloud Service Inventory & IAM Specification
- **Status**: Implementation-Critical Frozen Specification
- **Owner**: AWS Infrastructure Engineer & Cloud Architect
- **Dependencies**: [21_TECH_STACK.md](file:///d:/Consenzo%20amazon%20hackathon/docs/21_TECH_STACK.md), [60_AWS_ARCHITECTURE.md](file:///d:/Consenzo%20amazon%20hackathon/docs/60_AWS_ARCHITECTURE.md)
- **Downstream References**: [62_BEDROCK.md](file:///d:/Consenzo%20amazon%20hackathon/docs/62_BEDROCK.md), [64_LAMBDA.md](file:///d:/Consenzo%20amazon%20hackathon/docs/64_LAMBDA.md), [65_API_GATEWAY.md](file:///d:/Consenzo%20amazon%20hackathon/docs/65_API_GATEWAY.md), [66_DYNAMODB.md](file:///d:/Consenzo%20amazon%20hackathon/docs/66_DYNAMODB.md), [67_S3.md](file:///d:/Consenzo%20amazon%20hackathon/docs/67_S3.md), [80_SECURITY.md](file:///d:/Consenzo%20amazon%20hackathon/docs/80_SECURITY.md)

---

## 1. Active AWS Services Inventory

The table below defines the role, security scope, and failure behavior of every approved AWS service in Consenzo:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        ACTIVE AWS SERVICE MATRIX                       │
├───────────────────┬────────────────────────────────────────────────────┤
│ Service           │ Primary Mandate & Operational Boundary             │
├───────────────────┼────────────────────────────────────────────────────┤
│ 1. AWS Amplify    │ Global static SPA distribution; automatic preview  │
│    Hosting        │ branch deployments from Git.                       │
├───────────────────┼────────────────────────────────────────────────────┤
│ 2. Amazon API     │ Low-latency HTTP API routing; CORS configuration;  │
│    Gateway        │ rate limiting & payload throttling.                │
├───────────────────┼────────────────────────────────────────────────────┤
│ 3. AWS Lambda     │ Single serverless runtime hosting the agent loop,  │
│    (Compute)      │ LLMProvider abstraction, & deterministic engine.   │
├───────────────────┼────────────────────────────────────────────────────┤
│ 4. AWS Secrets    │ Secure storage and runtime retrieval of            │
│    Manager        │ NVIDIA_API_KEY; isolates credentials from client.  │
├───────────────────┼────────────────────────────────────────────────────┤
│ 5. Amazon DynamoDB│ Single-table persistence for sessions, participant │
│                   │ rosters, private messages, and analysis snapshots. │
├───────────────────┼────────────────────────────────────────────────────┤
│ 6. Amazon S3      │ Storage for immutable versioned catalog JSON files │
│                   │ and static product WebP image assets.              │
├───────────────────┼────────────────────────────────────────────────────┤
│ 7. Amazon         │ Structured logging, latency metrics, and           │
│    CloudWatch     │ correlation tracking (zero secrets logged).        │
└───────────────────┴────────────────────────────────────────────────────┘
```

> **Division of Responsibility**: NVIDIA provides generative inference; AWS provides the secure serverless application infrastructure and orchestration.

---

## 2. Granular Service Breakdown

### 2.1 AWS Amplify Hosting
- **Why It Exists**: Provides turnkey CDN hosting with zero server maintenance and automated CI/CD from Git commits.
- **Data Owned**: Static HTML, CSS, JavaScript client bundles, and public icons.
- **Invoked By**: End-user web browsers over HTTPS.
- **What It Invokes**: Directs browser network requests to Amazon API Gateway.
- **Failure Behavior**: If Amplify is down, users see a CloudFront network error; cached browser workers handle graceful offline fallback.

### 2.2 Amazon API Gateway (HTTP API)
- **Why It Exists**: Lightweight, low-cost HTTP request routing and TLS termination. 70% cheaper than REST API Gateway.
- **Transport Security**: API Gateway HTTP APIs use a TLS 1.2 security policy as the minimum security policy and support TLS 1.3 traffic.
- **Data Owned**: API route mappings, CORS policy, and throttling metrics.
- **Invoked By**: Browser single-page application.
- **What It Invokes**: AWS Lambda proxy integration.
- **IAM / Auth**: Public endpoints with Lambda path-level authorization via server-issued cryptographically signed participant session tokens.
- **Failure Behavior**: Returns `HTTP 502 Bad Gateway` or `HTTP 504 Gateway Timeout` if Lambda fails.

### 2.3 AWS Lambda
- **Why It Exists**: Houses all application routing, participant authentication, preference extraction state transitions, the `LLMProvider` abstraction, and the deterministic scoring engine.
- **Data Owned**: In-memory execution state and cached catalog records.
- **Invoked By**: Amazon API Gateway.
- **What It Invokes**: AWS Secrets Manager, NVIDIA Hosted API (via HTTPS outbound), Amazon DynamoDB, Amazon S3.
- **IAM Permissions Required**:
  - `secretsmanager:GetSecretValue` on `arn:aws:secretsmanager:us-east-1:*:secret:consenzo/nvidia-api-key*`.
  - `dynamodb:GetItem`, `dynamodb:PutItem`, `dynamodb:UpdateItem`, `dynamodb:Query` on `ConsenzoCoreTable`.
  - `s3:GetObject` on `consenzo-catalog-assets/*`.
  - `logs:CreateLogGroup`, `logs:CreateLogStream`, `logs:PutLogEvents` for CloudWatch.
- **Failure Behavior**: Unhandled exceptions return `HTTP 500` with standardized JSON error envelopes.

### 2.4 AWS Secrets Manager
- **Why It Exists**: Centralized, secure storage for the `NVIDIA_API_KEY` credential used to authenticate with the NVIDIA hosted API.
- **Security Invariants**:
  - The secret is retrieved directly by Lambda at runtime and cached in memory across invocations.
  - The secret is NEVER sent to the frontend, stored in client bundles, written to git, or logged in CloudWatch.
- **Invoked By**: AWS Lambda execution role.
- **What It Invokes**: None.
- **Failure Behavior**: If Secrets Manager returns an error, Lambda returns `HTTP 500 CONFIG_ERROR` without exposing secret names or details.

### 2.5 External Generative Inference: NVIDIA Hosted API
- **Why It Exists**: High-performance generative inference endpoint supporting `nvidia/llama-3.3-nemotron-super-49b-v1.5` via OpenAI-compatible `POST /chat/completions`.
- **Role in Consenzo**:
  - Natural language private conversational interviews.
  - Uncertainty and ambiguity detection.
  - Structured preference extraction into JSON.
  - Natural language trade-off explanations grounded strictly in deterministic engine math.
- **Latency Optimization**: Default usage of `/no_think` directive bypasses chain-of-thought tokens to guarantee fast, sub-second interactive turns.
- **Failure Behavior**: Lambda catches `HTTP 429` / timeouts, executes 1 exponential retry, and returns an empathetic retry prompt to the user without corrupting state.

### 2.6 Amazon DynamoDB
- **Why It Exists**: Single-digit millisecond latency, scale-to-zero capacity, and managed encryption.
- **Encryption at Rest**: DynamoDB encryption at rest is enabled using AWS's default encryption with an AWS-owned key for the MVP.
- **Data Owned**: Session records, participant profiles, private conversational turns, and analysis snapshots.
- **Invoked By**: AWS Lambda.
- **What It Invokes**: None.
- **Capacity Mode**: On-Demand (pay-per-request) to eliminate capacity planning and throttling.
- **Failure Behavior**: Returns `500 STORAGE_ERROR`; system never claims state was saved on write failures.

### 2.7 Amazon S3
- **Why It Exists**: Immutable object storage for versioned catalog files (`smart-tv-v1.json`).
- **Data Owned**: Static JSON catalog artifacts and product WebP images.
- **Invoked By**: Lambda on cold-start (to load catalog into memory).
- **Security**: Private bucket; access restricted strictly to the Lambda execution role via IAM bucket policy.

---

## 3. Explicit Service Exclusion & Deferral Decisions

To prevent architectural bloat and maintain a deployable 48-hour scope:

| Excluded Service | Status for MVP | Rationale & Architectural Justification |
| :--- | :--- | :--- |
| **AWS Step Functions** | **DEFERRED** | Synchronous Lambda execution runs in $<5\text{ms}$ for 35 items. Step Functions introduces state machine definition overhead, added latency, and complex debugging for a sub-second workload. |
| **Amazon EventBridge** | **DEFERRED** | Direct synchronous REST flows are deterministic and immediately report HTTP errors. Event choreography adds eventual-consistency lag unnecessary for 2–4 participants. |
| **Strands / Agent Swarms**| **REJECTED** | Autonomous multi-agent swarms introduce unpredictable token loops, nondeterministic behavior, and high cost. Single-turn structured LLM provider calls inside a typed state machine are robust and fully controllable. |
| **Amazon OpenSearch** | **REJECTED** | Storing 35 catalog items in an OpenSearch cluster incurs $\$50+/month$ idle cost and network latency. In-memory linear scanning in V8 executes in $<2\text{ms}$ with zero infrastructure. |

---

## 4. Hackathon Cost Architecture

Consenzo is engineered for extreme cost efficiency:
1. **Zero Idle Cost**: All compute and database resources scale to zero when not in use.
2. **Efficient Inference**: Highly optimized conversational turn limits, focused prompts, and `/no_think` latency optimization ensure low token usage across sessions.
3. **In-Memory Caching**: S3 catalog reads occur only on Lambda cold-start, resulting in negligible S3 GET request charges.
