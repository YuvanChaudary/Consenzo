# 13 — Permission Model & Data Privacy Boundaries

## Document Metadata
- **Document Type**: Security Architecture & Access Control Specification
- **Status**: Approved Foundation
- **Owner**: Security & Systems Architect
- **Dependencies**: [10_REQUIREMENTS.md](file:///d:/Consenzo%20amazon%20hackathon/docs/10_REQUIREMENTS.md), [12_USER_FLOWS.md](file:///d:/Consenzo%20amazon%20hackathon/docs/12_USER_FLOWS.md)
- **Downstream References**: [70_API_CONTRACTS.md](file:///d:/Consenzo%20amazon%20hackathon/docs/70_API_CONTRACTS.md), [80_SECURITY.md](file:///d:/Consenzo%20amazon%20hackathon/docs/80_SECURITY.md), [81_DATA_PRIVACY.md](file:///d:/Consenzo%20amazon%20hackathon/docs/81_DATA_PRIVACY.md), [110_DECISIONS.md](file:///d:/Consenzo%20amazon%20hackathon/docs/110_DECISIONS.md)

---

## 1. Access Control Model Overview

Consenzo implements a **Strict Least-Privilege & Privacy-Preserving Access Control Model**. Because multi-stakeholder purchasing touches sensitive financial limitations and personal relationship dynamics, architectural isolation of data is a non-negotiable requirement.

```text
 ┌─────────────────────────────────────────────────────────────┐
 │               PARTICIPANT A PRIVATE ISOLATION               │
 │                                                             │
 │  Raw Private Chat: "Dad: Honestly, our finances are tight   │
 │   and I can't afford to waste money on 120Hz gaming."       │
 └──────────────────────────────┬──────────────────────────────┘
                                │ Extracted Structured Parameters
                                ▼
 ┌─────────────────────────────────────────────────────────────┐
 │                SANITIZED PREFERENCE ENVELOPE                │
 │                                                             │
 │  - price_inr <= 50000 (Type: Hard Constraint, Weight: 1.0)  │
 │  - warranty_years >= 2 (Type: Hard Constraint, Weight: 0.9) │
 └──────────────────────────────┬──────────────────────────────┘
                                │ Forwarded to Group Aggregator
                                ▼
 ┌─────────────────────────────────────────────────────────────┐
 │                 SHARED GROUP BOARD VISIBILITY               │
 │                                                             │
 │  Dad Satisfaction: 9.5/10  |  Son Satisfaction: 7.2/10      │
 │  Trade-off: Budget respected; 120Hz sacrificed.             │
 │  (Personal financial anxieties are NEVER exposed).          │
 └─────────────────────────────────────────────────────────────┘
```

---

## 2. Participant Roles & Capabilities

| Capability / Action | Coordinator (Creator) | Participant (Invited) | Anonymous / Observer |
| :--- | :--- | :--- | :--- |
| Create Decision Session | **Yes** | No | No |
| Generate / Share Invite Links | **Yes** | No | No |
| View Group Readiness Status | **Yes** (Status badges) | **Yes** (Readiness only) | No |
| Conduct Private AI Interview | **Yes** (Own session) | **Yes** (Own session) | No |
| View Other Participant's Chat Transcripts | **NEVER** | **NEVER** | **NEVER** |
| Edit Personal Preferences Before Commit | **Yes** (Own profile) | **Yes** (Own profile) | No |
| View Shared Decision Board | **Yes** (Once ready) | **Yes** (Once ready) | No |
| Inspect Individual Score Breakdown [0–10] | **Yes** | **Yes** | No |
| Cast Ratification Vote | **Yes** | **Yes** | No |
| Trigger Early Consensus (Quorum Override) | **Yes** (If member stalls) | No | No |

---

## 3. Session Authentication & Token Architecture (ADR-007 Resolution)

For the 48-hour MVP, requiring all family members to create Amazon Cognito accounts, verify email addresses, or install an authenticator app creates prohibitive friction that ruins the demonstration and induces user drop-off.

### The Cryptographic Token Strategy
- **Session Token**: `consenzo_sess_<UUIDv4>` generated upon session creation.
- **Participant Token**: An HMAC-SHA256 signed bearer token:
  $$\text{Token} = \text{Base64Url}(\text{Header}) \mathbin{\Vert} \text{Base64Url}(\text{Payload}) \mathbin{\Vert} \text{HMAC}(\text{Secret}, \dots)$$
- **Payload Contents**:
  ```json
  {
    "sub": "usr_son_03",
    "sessionId": "ses_tv_9941",
    "role": "participant",
    "exp": 1726430400
  }
  ```
- **Validation Invariant**:
  The API Gateway / Lambda Authorizer validates that `sessionId` and `sub` match the path parameter in all requests. Any attempt by Participant B to read `/chat/{participantId}` of Participant A returns `HTTP 403 Forbidden`.

---

## 4. Privacy Invariants & Defense-in-Depth

1. **Database Partition Separation**:
   In DynamoDB, private conversational turns are stored under partition key `PARTICIPANT#<participantId>` with sort key `MESSAGE#<timestamp>`. The shared group queries use partition key `SESSION#<sessionId>`. A database query on the session never returns message rows.
2. **LLM Prompt Sanitization**:
   When invoking the LLM Provider (NVIDIA hosted API) to generate the group explanation on the shared board, the prompt receives **only the deterministic math results and catalog specs**. The raw chat transcripts are never included in the explanation prompt context.
3. **Secret Isolation & Audit Log Exclusions**:
   The `NVIDIA_API_KEY` is stored in AWS Secrets Manager and retrieved directly by Lambda at runtime; it is never sent to the client. CloudWatch structured logs do not print the API key, raw authorization headers, or raw user chat messages at `INFO` level to prevent inadvertent PII and secret leakage in cloud logging infrastructure.
