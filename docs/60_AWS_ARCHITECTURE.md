# 60 — AWS Serverless Cloud Architecture

## Document Metadata
- **Document Type**: Cloud Infrastructure & Deployment Specification
- **Status**: Implementation-Critical Frozen Specification
- **Owner**: AWS Infrastructure Engineer & Systems Architect
- **Dependencies**: [04_MVP_SCOPE.md](file:///d:/Consenzo%20amazon%20hackathon/docs/04_MVP_SCOPE.md), [20_SYSTEM_ARCHITECTURE.md](file:///d:/Consenzo%20amazon%20hackathon/docs/20_SYSTEM_ARCHITECTURE.md), [21_TECH_STACK.md](file:///d:/Consenzo%20amazon%20hackathon/docs/21_TECH_STACK.md)
- **Downstream References**: [61_AWS_SERVICES.md](file:///d:/Consenzo%20amazon%20hackathon/docs/61_AWS_SERVICES.md), [62_BEDROCK.md](file:///d:/Consenzo%20amazon%20hackathon/docs/62_BEDROCK.md), [64_LAMBDA.md](file:///d:/Consenzo%20amazon%20hackathon/docs/64_LAMBDA.md), [80_SECURITY.md](file:///d:/Consenzo%20amazon%20hackathon/docs/80_SECURITY.md)

---

## 1. Top-Level Cloud Topology

The production deployment of Consenzo runs exclusively on serverless AWS primitives configured for **zero idle cost, automated deployment, sub-second latency, and scale-to-zero compute**.

```mermaid
graph TB
    subgraph CLIENT_ZONE["User Tier"]
        CLIENT["Mobile / Desktop Web Browsers (React 18 SPA)"]
    end

    subgraph AWS_EDGE["AWS Edge & Hosting"]
        AMP["AWS Amplify Hosting
        (Global CDN, SSL, CI/CD from Git)"]
        APIGW["Amazon API Gateway
        (HTTP API, CORS, Throttling)"]
    end

    subgraph AWS_COMPUTE["Serverless Compute Tier"]
        LAMBDA["Consenzo Monolithic Lambda Router
        (Node.js 20, TypeScript, Scoped IAM Role)
        - Token auth & routing
        - LLMProvider abstraction
        - Deterministic scoring engine"]
    end

    subgraph AWS_SECURITY["Security & Secrets Tier"]
        SM["AWS Secrets Manager
        (Secret: consenzo/nvidia-api-key)"]
    end

    subgraph AI_SERVICES["External Generative AI Tier"]
        NVIDIA["NVIDIA Hosted API
        (nvidia/llama-3.3-nemotron-super-49b-v1.5)
        OpenAI-compatible /chat/completions"]
    end

    subgraph AWS_STORAGE["Data & Persistence Tier"]
        DDB[("Amazon DynamoDB
        Single-Table Session & State Store
        (Default AWS-Owned Key Encryption)")]
        S3[("Amazon S3
        Versioned Catalog & Static Assets")]
    end

    CLIENT -->|HTTPS / Static Assets| AMP
    CLIENT -->|HTTPS / REST API Calls| APIGW
    
    APIGW -->|Proxy Integration| LAMBDA
    
    LAMBDA -->|Runtime Fetch NVIDIA_API_KEY| SM
    LAMBDA <-->|HTTPS Elicitation & Explanations (/no_think)| NVIDIA
    LAMBDA <-->|Read / Write State| DDB
    LAMBDA -->|Load Versioned Catalog| S3
```

---

## 2. Serverless Architectural Guarantees

1. **Scale-to-Zero Compute**:
   Zero EC2 instances, ECS clusters, or Kubernetes nodes. When no users are actively making decisions, the system consumes **$0.00 in compute costs**.
2. **Sub-200ms Cold Starts**:
   By packaging the backend into lightweight Node.js 20 Lambda functions without heavy external dependencies, cold start overhead remains under 200 milliseconds.
3. **Synchronous Execution Pipeline**:
   The entire decision workflow (gating, individual utility calculation, conflict detection, and fairness scoring) executes in under 5 milliseconds in Lambda memory, eliminating the need for asynchronous distributed orchestration for the MVP.

---

## 3. Deployment Boundaries & Service Ownership

| Layer | AWS Service | Physical Resource Name | Authoritative Responsibility |
| :--- | :--- | :--- | :--- |
| **Frontend Hosting** | AWS Amplify Hosting | `consenzo-web-app` | Static SPA bundle hosting, edge caching, continuous deployment from git repository. |
| **API Entry Point** | Amazon API Gateway | `consenzo-http-api` | Public REST routes, CORS header enforcement, rate limiting, and Lambda proxy routing. (Minimum TLS 1.2 policy with TLS 1.3 support). |
| **Backend Compute** | AWS Lambda | `consenzo-backend-handler` | Routing, cryptographic token validation, agent state machine, `LLMProvider` abstraction, deterministic decision engine. |
| **Secrets Management** | AWS Secrets Manager | `consenzo/nvidia-api-key` | Secure storage of `NVIDIA_API_KEY`. Retrieved by Lambda at runtime; never sent to frontend. |
| **Generative AI** | NVIDIA Hosted API | `nvidia/llama-3.3-nemotron-super-49b-v1.5` | Adaptive conversational extraction, ambiguity probing, and grounded trade-off explanations via OpenAI-compatible `/chat/completions`. |
| **Database** | Amazon DynamoDB | `ConsenzoCoreTable` | Single-table storage for sessions, participant rosters, private messages, and analysis snapshots. Encryption at rest enabled using AWS's default encryption with an AWS-owned key. |
| **Catalog Storage** | Amazon S3 | `consenzo-catalog-assets` | Immutable, versioned benchmark product catalog JSON artifacts (`smart-tv-v1.json`). |
| **Monitoring** | Amazon CloudWatch | `/aws/lambda/consenzo-backend-handler` | Structured execution metrics, latency logging, correlation tracking (no secrets logged). |

---

## 4. Environment Strategy: Single Hackathon Stage

To maximize developer velocity and eliminate deployment friction during the hackathon:
- The AWS infrastructure deploys in **`us-east-1`**.
- NVIDIA provides generative inference; AWS provides the secure serverless application infrastructure and orchestration.
- Environment parameters are passed via standard Lambda environment variables managed through a single AWS SAM template:
  ```bash
  LLM_PROVIDER=nvidia
  LLM_MODEL=nvidia/llama-3.3-nemotron-super-49b-v1.5
  LLM_BASE_URL=https://integrate.api.nvidia.com/v1
  NVIDIA_API_KEY_SECRET_ARN=arn:aws:secretsmanager:us-east-1:...:secret:consenzo/nvidia-api-key
  DYNAMODB_TABLE_NAME=ConsenzoCoreTable
  CATALOG_BUCKET_NAME=consenzo-catalog-assets
  ```
- Multi-account AWS Organizations and complex cross-account roles are explicitly out of scope for the 48-hour build.
