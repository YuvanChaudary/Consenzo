# 82 — Secrets Management, Configuration & Credentials

## Document Metadata
- **Document Type**: Security Standards & Environment Configuration Specification
- **Status**: Implementation-Critical Frozen Specification
- **Owner**: Security Architect & DevOps Engineer
- **Dependencies**: [60_AWS_ARCHITECTURE.md](file:///d:/Consenzo%20amazon%20hackathon/docs/60_AWS_ARCHITECTURE.md), [80_SECURITY.md](file:///d:/Consenzo%20amazon%20hackathon/docs/80_SECURITY.md), [81_DATA_PRIVACY.md](file:///d:/Consenzo%20amazon%20hackathon/docs/81_DATA_PRIVACY.md)
- **Downstream References**: None (Leaf Specification)

---

## 1. Zero-Credential Invariant

```text
 ┌─────────────────────────────────────────────────────────────┐
 │                  ZERO-CREDENTIAL INVARIANT                  │
 │                                                             │
 │  ❌ NEVER commit AWS credentials or API keys to git        │
 │  ❌ NEVER embed NVIDIA_API_KEY or tokens in frontend code   │
 │  ❌ NEVER expose API keys in Vite env vars or browser storage│
 │  ❌ NEVER log secrets or bearer tokens to CloudWatch Logs   │
 │  ✅ Store NVIDIA_API_KEY securely in AWS Secrets Manager    │
 │  ✅ Use AWS IAM execution roles for serverless runtimes     │
 │  ✅ Inject non-sensitive configuration via SAM templates    │
 └─────────────────────────────────────────────────────────────┘
```

---

## 2. Configuration vs. Secrets Taxonomy

The table below strictly separates non-sensitive operational configuration from cryptographic secrets:

| Variable Name | Classification | Storage Location | Sensitivity | Description |
| :--- | :--- | :--- | :--- | :--- |
| `AWS_REGION` | **Configuration** | Lambda Environment | Low (Public) | Deployment region (`us-east-1`). |
| `LLM_PROVIDER` | **Configuration** | Lambda Environment | Low (Public) | Active LLM provider (`nvidia`). |
| `LLM_MODEL` | **Configuration** | Lambda Environment | Low (Public) | Model ID (`nvidia/llama-3.3-nemotron-super-49b-v1.5`). |
| `LLM_BASE_URL` | **Configuration** | Lambda Environment | Low (Public) | Endpoint (`https://integrate.api.nvidia.com/v1`). |
| `NVIDIA_API_KEY_SECRET_ARN` | **Configuration** | Lambda Environment | Low (Public) | Secrets Manager ARN for runtime key retrieval. |
| `DYNAMODB_TABLE_NAME`| **Configuration** | Lambda Environment | Low (Public) | Core DynamoDB single-table name. |
| `CATALOG_BUCKET_NAME`| **Configuration** | Lambda Environment | Low (Public) | S3 bucket containing catalog JSON. |
| `CATALOG_VERSION` | **Configuration** | Lambda Environment | Low (Public) | Default active catalog (`smart-tv-v1`). |
| `API_STAGE` | **Configuration** | Lambda Environment | Low (Public) | Deployment environment tag (`prod`). |
| `NVIDIA_API_KEY` | **Secret** | AWS Secrets Manager | **CRITICAL** | API credential for NVIDIA hosted inference. Never sent to frontend or written to git. |
| `TOKEN_SIGNING_SECRET`| **Secret** | AWS Secrets Manager | **HIGH** | 256-bit key for signing server-issued participant session tokens. |

---

## 3. Authentication & Secret Retrieval Architecture

### 3.1 Production AWS Infrastructure Authentication
- The Lambda function executes under an **IAM Execution Role**.
- AWS SDK v3 automatically acquires short-lived, rotating STS credentials from the container environment.
- Zero permanent AWS access keys or secrets exist in the production environment.

### 3.2 NVIDIA API Key Secret Management
- `NVIDIA_API_KEY` is provisioned into **AWS Secrets Manager** (`consenzo/nvidia-api-key`).
- The Lambda execution role possesses `secretsmanager:GetSecretValue` permission scoped strictly to this secret's ARN.
- Lambda loads the secret at runtime and caches it in global memory across invocations to avoid latency on warm requests.
- **Frontend Isolation Guarantee**: The frontend client never receives or handles the API key. All LLM calls originate exclusively from the serverless Lambda backend.

### 3.3 Local Developer Authentication
- Engineers authenticate locally using the **AWS CLI** with named profiles (`~/.aws/credentials`) or **AWS IAM Identity Center** (SSO).
- Local testing may supply `NVIDIA_API_KEY` via a local environment variable or an uncommitted `.env.local` file.
- Root `.gitignore` explicitly enforces exclusion of `.env*`, `*.pem`, and `credentials`. No credentials are ever committed.

---

## 4. Secret Generation & Post-Hackathon Cleanup Protocol

1. **`TOKEN_SIGNING_SECRET` Generation**:
   Generated during infrastructure provisioning using a secure random generator:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
2. **Post-Hackathon Tear-Down Plan**:
   - Immediate deletion of temporary developer IAM users.
   - Deletion of the AWS SAM CloudFormation stack (`sam delete --stack-name consenzo-mvp`).
   - S3 bucket emptying and removal.

---

## 5. Developer Tooling Clarification

During development, the engineering team may utilize standard tooling including:
- **AWS SAM CLI** (`sam build`, `sam deploy`, `sam local invoke`)
- **AWS CLI v2**
- **AWS Toolkit for Antigravity / IDEs**

> **Independence Guarantee**: The application codebase, build scripts, and deployment templates remain 100% self-contained and execute cleanly from standard terminal shells without requiring proprietary IDE plugins.
