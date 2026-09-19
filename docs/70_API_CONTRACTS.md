# 70 — API Conventions & Global Protocol Contracts

## Document Metadata
- **Document Type**: Global API Standards & Interface Envelope Contract
- **Status**: Implementation-Critical Frozen Specification
- **Owner**: API Architect & Backend Engineer
- **Dependencies**: [20_SYSTEM_ARCHITECTURE.md](file:///d:/Consenzo%20amazon%20hackathon/docs/20_SYSTEM_ARCHITECTURE.md), [24_API_ARCHITECTURE.md](file:///d:/Consenzo%20amazon%20hackathon/docs/24_API_ARCHITECTURE.md)
- **Downstream References**: [71_GROUP_API.md](file:///d:/Consenzo%20amazon%20hackathon/docs/71_GROUP_API.md), [72_CONSENZO_API.md](file:///d:/Consenzo%20amazon%20hackathon/docs/72_CONSENZO_API.md), [80_SECURITY.md](file:///d:/Consenzo%20amazon%20hackathon/docs/80_SECURITY.md)

---

## 1. Global Protocol Invariants

All Consenzo API endpoints hosted on Amazon API Gateway adhere to an immutable REST/JSON communication standard:

```text
 ┌─────────────────────────────────────────────────────────────┐
 │                  GLOBAL API INVARIANTS                      │
 │                                                             │
 │  1. Transport: HTTPS only (TLS 1.2 minimum, TLS 1.3 supported) │
 │  2. Media Type: application/json; charset=utf-8.            │
 │  3. Correlation: Every request and response carries         │
 │     X-Correlation-Id for distributed tracing.              │
 │  4. Zero Client Trust: The client never passes role or      │
 │     identity in request bodies; all authorizations are      │
 │     extracted server-side from signed Bearer tokens.        │
 │  5. Envelope Consistency: All responses use standardized     │
 │     `data` or `error` envelopes with metadata.              │
 └─────────────────────────────────────────────────────────────┘
```

---

## 2. Standardized Response Envelopes

### 2.1 Success Response Envelope (`HTTP 200 / 201`)
```json
{
  "data": {
    "groupId": "grp_881a_b2",
    "title": "Living Room TV",
    "category": "smart_tvs",
    "status": "INTERVIEWING"
  },
  "meta": {
    "requestId": "req_f812_44a",
    "correlationId": "corr_c881_99b",
    "timestamp": "2026-09-15T22:50:00Z"
  }
}
```

### 2.2 Standard Error Response Envelope (`HTTP 4xx / 5xx`)
```json
{
  "error": {
    "code": "INVALID_STATE_TRANSITION",
    "message": "Cannot trigger analysis while participants are still conducting interviews.",
    "details": [
      {
        "field": "sessionState",
        "issue": "Expected READY_FOR_ANALYSIS, found INTERVIEWING."
      }
    ]
  },
  "meta": {
    "requestId": "req_f812_44a",
    "correlationId": "corr_c881_99b",
    "timestamp": "2026-09-15T22:50:00Z"
  }
}
```

---

## 3. Standard HTTP Status Codes

| Status Code | Meaning in Consenzo | Typical Trigger Scenario |
| :--- | :--- | :--- |
| **`200 OK`** | Request succeeded | Successful GET query or idempotent state update. |
| **`201 Created`** | Resource created | Group room created, participant joined, message stored. |
| **`400 Bad Request`** | Malformed JSON / schema error | Body failed JSON Schema validation; invalid parameter types. |
| **`401 Unauthorized`**| Missing or expired token | Authorization header missing or expired HMAC token. |
| **`403 Forbidden`** | Cross-participant violation | Participant A attempted to read Participant B's chat history. |
| **`404 Not Found`** | Resource does not exist | `groupId`, `participantId`, or `analysisId` not found. |
| **`409 Conflict`** | Invalid state machine transition| Triggering analysis before all members confirmed profiles. |
| **`422 Unprocessable`**| Domain validation failure | Stated budget is negative; unknown category requested. |
| **`500 Internal Error`**| Unhandled system failure | DynamoDB storage error or internal scoring crash. |
| **`503 Unavailable`** | Upstream AI throttling | Upstream LLM provider rate limits exceeded (HTTP 429); client instructed to retry. |

---

## 4. Idempotency Contract for Mutations

To guarantee that mobile network retries or user double-taps do not create duplicate messages, split votes, or conflicting analyses, all mutating endpoints (`POST /analysis`, `POST /votes`, `POST /preferences/confirm`) accept an optional header:

```http
Idempotency-Key: 7b8812c4-91fa-4001-8ba2-c8419828e192
```

- When the backend receives a mutation with an `Idempotency-Key`, it checks DynamoDB for an existing transaction under that key.
- If found, it returns the previously cached response immediately without re-executing LLM inference or deterministic scoring.
- Keys expire automatically after 10 minutes.
