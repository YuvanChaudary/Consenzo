# 81 — Data Privacy, Confidentiality & Minimization Specification

## Document Metadata
- **Document Type**: Privacy Architecture & Confidentiality Specification
- **Status**: Implementation-Critical Frozen Specification
- **Owner**: Data Protection & Privacy Architect
- **Dependencies**: [13_PERMISSION_MODEL.md](file:///d:/Consenzo%20amazon%20hackathon/docs/13_PERMISSION_MODEL.md), [72_CONSENZO_API.md](file:///d:/Consenzo%20amazon%20hackathon/docs/72_CONSENZO_API.md), [80_SECURITY.md](file:///d:/Consenzo%20amazon%20hackathon/docs/80_SECURITY.md)
- **Downstream References**: [82_SECRETS.md](file:///d:/Consenzo%20amazon%20hackathon/docs/82_SECRETS.md)

---

## 1. Privacy Mandate & Architectural Invariant

In group consumer purchasing, participants often reveal intimate financial anxieties, brand distrust, or personal lifestyle constraints:
- *"I'm on a strict budget because I was laid off last month."*
- *"I refuse to buy Brand X because my ex-partner worked there."*
- *"I need late-night gaming with headphones because my baby sleeps in the next room."*

> **The Privacy Invariant**:  
> A participant's raw conversational text and personal disclosures are **strictly private**. They are NEVER exposed, rendered, or summarized as verbatim quotes to other participants or included in group decision payloads.

---

## 2. Private vs. Shared Data Partitioning

```text
 ┌─────────────────────────────────────────────────────────────┐
 │                STRICTLY PRIVATE DATA DOMAIN                 │
 │                                                             │
 │  • Raw linguistic chat messages                             │
 │  • Personal emotional context, financial fears, anecdotes   │
 │  • In-progress unconfirmed preference extractions           │
 │  • Turn-by-turn conversational confidence scores            │
 ├─────────────────────────────────────────────────────────────┤
 │                     PRIVACY SANITIZER                       │
 │  (Extracts parameters; expunges raw quotes and anecdotes)   │
 ├─────────────────────────────────────────────────────────────┤
 │                 SHARED DERIVED DATA DOMAIN                  │
 │                                                             │
 │  • Confirmed parametric constraints (e.g. Budget <= 50,000) │
 │  • Normalized preference weights (e.g. RefreshRate: 0.95)   │
 │  • Mathematical satisfaction utilities [0.0 to 10.0]        │
 │  • Pareto trade-off explanations grounded strictly in specs │
 │  • Ratification votes (Approve / Reject)                    │
 └─────────────────────────────────────────────────────────────┘
```

---

## 3. Shared Explanation Sanitization Contract

When the LLM Provider generates trade-off explanations for the Shared Decision Board, it is provided **only the mathematical deltas and product specifications**.

### Anecdote Sanitization Enforcement
- **Raw Participant Input**: *"I really don't trust Brand X because my last unit died after 13 months and customer service was horrific."*
- **Extracted Structured Parameter**: `brand_disliked: ["BrandX"]`, weight: 0.85, type: `PREFERENCE`.
- **FORBIDDEN Shared Output**: *"This option wasn't chosen because Dad had a terrible experience with Brand X's customer service."*
- **MANDATORY Shared Output**: *"Product C was preferred over Brand X because it provides a 2-year warranty and higher brand reliability satisfaction for Dad."*

---

## 4. Data Minimization & Retention Policy

Consenzo collects only the absolute minimum data required to achieve group consensus:
1. **Zero Permanent Personal Identifiable Information (PII)**:
   - No email addresses, phone numbers, home addresses, or credit card numbers are ever requested, processed, or stored.
   - Display names are transient handles chosen by participants (e.g. "Dad", "Sam").
2. **Automated 24-Hour Session Expiration (TTL)**:
   - All records in DynamoDB (`SESSION#`, `PARTICIPANT#`, `MSG#`, `ANALYSIS#`) include a `ttl` epoch timestamp set to **`current_time + 86400 seconds`**.
   - DynamoDB automatically purges expired records at zero operational cost.

---

## 5. LLM Privacy & Isolation Boundaries

1. **Isolation in Prompt Context**:
   - The adaptive interview prompt receives **only** the active participant's messages.
   - Under no circumstances is another participant's transcript injected into the prompt context.
2. **Stateless Invocations & Data Protection**:
   - Invocations to the NVIDIA hosted API are executed over TLS encrypted HTTPS directly from the AWS Lambda runtime.
   - Invocations are stateless requests; no participant conversational data is retained for training.
3. **No Private Transcripts to Shared Board**:
   - When generating group trade-off explanations, the prompt context receives only pre-computed mathematical utilities and verified catalog attributes.
4. **Credential Isolation**:
   - The `NVIDIA_API_KEY` is retrieved from AWS Secrets Manager exclusively by backend Lambda execution roles and is never exposed in client bundles or network responses.
