# 72 — Consenzo Intelligence & Consensus API Specification

## Document Metadata
- **Document Type**: REST API Endpoint Specification
- **Status**: Implementation-Critical Frozen Specification
- **Owner**: AI & Deterministic Engine Architect
- **Dependencies**: [10_REQUIREMENTS.md](file:///d:/Consenzo%20amazon%20hackathon/docs/10_REQUIREMENTS.md), [31_AGENT_LOOP.md](file:///d:/Consenzo%20amazon%20hackathon/docs/31_AGENT_LOOP.md), [36_FAIRNESS_ENGINE.md](file:///d:/Consenzo%20amazon%20hackathon/docs/36_FAIRNESS_ENGINE.md), [70_API_CONTRACTS.md](file:///d:/Consenzo%20amazon%20hackathon/docs/70_API_CONTRACTS.md)
- **Downstream References**: [80_SECURITY.md](file:///d:/Consenzo%20amazon%20hackathon/docs/80_SECURITY.md), [81_DATA_PRIVACY.md](file:///d:/Consenzo%20amazon%20hackathon/docs/81_DATA_PRIVACY.md)

---

## 1. Domain Overview & Execution Boundary

The **Consenzo Intelligence API** coordinates private conversations, preference profile confirmations, deterministic multi-objective evaluation, and shared group voting.

> **Execution Boundary**:  
> The final analysis request (`POST /groups/{groupId}/analysis`) executes a strictly deterministic mathematical pipeline. The generative AI model is called only **after** the rankings, utilities, and trade-off deltas are mathematically finalized.

---

## 2. Private Conversation Endpoints (AI Boundary)

### 2.1 Start Private Interview
Initializes the 1-on-1 discovery interview for the authenticated participant.

- **HTTP Method**: `POST`
- **Path**: `/conversations`
- **Authorization**: Bearer Token (`sub` must match participant)
- **Request Body**: `{ "category": "smart_tvs" }`
- **Response (`201 Created`)**:
```json
{
  "data": {
    "conversationId": "conv_991a_44",
    "participantId": "usr_son_03",
    "turnCount": 1,
    "initialMessage": "Hey Son! You're helping pick the family living room TV. What matters most to you personally?"
  },
  "meta": { "requestId": "req_101", "timestamp": "2026-09-15T22:53:00Z" }
}
```

---

### 2.2 Send Message in Private Interview
Executes an adaptive conversational turn.

- **HTTP Method**: `POST`
- **Path**: `/conversations/{conversationId}/messages`
- **Authorization**: Bearer Token (Participant token matching conversation owner)
- **Request Body**:
```json
{
  "message": "I really need 120Hz native refresh rate for smooth gaming on my PS5."
}
```
- **Response (`200 OK`)**:
```json
{
  "data": {
    "reply": "Got it! Fast 120Hz gaming is a huge upgrade for the PS5. Is 120Hz a strict requirement, or would you consider 60Hz if it saved the family significant money?",
    "turnCount": 2,
    "isReadyForSummary": false,
    "extractedAttributesCount": 2
  },
  "meta": { "requestId": "req_102", "timestamp": "2026-09-15T22:53:15Z" }
}
```

---

## 3. Preference Profile Endpoints

### 3.1 Get Working Preference Summary
Fetches current extracted parameters and bulleted summary.

- **HTTP Method**: `GET`
- **Path**: `/participants/{participantId}/preferences`
- **Authorization**: Bearer Token (Participant token matching `{participantId}`)
- **Response (`200 OK`)**:
```json
{
  "data": {
    "participantId": "usr_son_03",
    "confirmed": false,
    "summaryMarkdown": "• **Top Priority**: 120Hz native gaming for PS5\n• **Flexibility**: Acceptable to fall back to 60Hz if budget requires\n• **Hardware**: Minimum 3 HDMI ports desired\n• **Budget Target**: Flexible up to ₹55,000",
    "constraints": [
      { "attribute": "refresh_rate_hz", "operator": "GTE", "value": 120, "type": "PREFERENCE", "weight": 0.95 }
    ]
  },
  "meta": { "requestId": "req_103", "timestamp": "2026-09-15T22:53:30Z" }
}
```

---

### 3.2 Confirm Preference Profile
Explicit participant ratification locking the profile.

- **HTTP Method**: `POST`
- **Path**: `/participants/{participantId}/preferences/confirm`
- **Authorization**: Bearer Token (Participant token matching `{participantId}`)
- **Response (`200 OK`)**:
```json
{
  "data": {
    "participantId": "usr_son_03",
    "confirmed": true,
    "readiness": "CONFIRMED",
    "lockedAt": "2026-09-15T22:53:40Z"
  },
  "meta": { "requestId": "req_104", "timestamp": "2026-09-15T22:53:40Z" }
}
```

---

## 4. Consensus Analysis Endpoints (Deterministic Boundary)

### 4.1 Execute Group Consensus Analysis
Triggers deterministic product gating, scoring, fairness optimization, and grounded explanation generation.

- **HTTP Method**: `POST`
- **Path**: `/groups/{groupId}/analysis`
- **Authorization**: Bearer Token (Any room participant; requires all members confirmed or coordinator override)
- **Headers**: `Idempotency-Key: idemp_9981a_b2`
- **Response (`200 OK`)**:
```json
{
  "data": {
    "analysisId": "an_881b_44",
    "groupId": "grp_881a_b2",
    "catalogVersion": "smart-tv-v1",
    "status": "COMPLETED",
    "topRecommendations": [
      {
        "rank": 1,
        "tag": "BEST_CONSENSUS",
        "product": {
          "productId": "tv_008",
          "name": "LG NanoCell 55\" 4K Gaming TV",
          "brand": "LG",
          "priceInr": 49000,
          "refreshRateHz": 120,
          "bezelColor": "Silver",
          "warrantyYears": 2,
          "asin": "B09X1K87Z2",
          "imageUrl": "/assets/products/tv_008.webp"
        },
        "scores": {
          "netConsensusScore": 8.11,
          "meanUtility": 8.78,
          "fairnessPenalty": -0.67,
          "individualBreakdown": {
            "Dad": 9.2,
            "Mom": 6.5,
            "Son": 9.8,
            "Daughter": 9.6
          }
        },
        "groundedExplanation": "Consenzo's decision engine ranked this product highest because it delivers 120Hz native gaming for Son and a sleek Silver frame for Daughter while remaining strictly under Dad's ₹50,000 budget ceiling. Mom accepts an LG brand compromise (scoring 6.5) to unlock family-wide satisfaction."
      },
      {
        "rank": 2,
        "tag": "LOWEST_CONFLICT",
        "product": {
          "productId": "tv_001",
          "name": "Samsung Crystal 4K UHD Ultra",
          "brand": "Samsung",
          "priceInr": 48000,
          "refreshRateHz": 60,
          "bezelColor": "Black",
          "warrantyYears": 2,
          "asin": "B09W1189X1",
          "imageUrl": "/assets/products/tv_001.webp"
        },
        "scores": {
          "netConsensusScore": 7.95,
          "meanUtility": 8.58,
          "fairnessPenalty": -0.63,
          "individualBreakdown": {
            "Dad": 9.5,
            "Mom": 10.0,
            "Son": 6.8,
            "Daughter": 8.0
          }
        },
        "groundedExplanation": "Maintains Mom's trusted Samsung brand and Dad's budget, but Son sacrifices 120Hz gaming capability (running at 60Hz)."
      }
    ],
    "conflictsDetected": []
  },
  "meta": { "requestId": "req_105", "timestamp": "2026-09-15T22:54:00Z" }
}
```

---

## 5. Voting & Final Ratification Endpoints

### 5.1 Cast Ratification Vote
- **HTTP Method**: `POST`
- **Path**: `/groups/{groupId}/votes`
- **Authorization**: Bearer Token
- **Request Body**:
```json
{
  "analysisId": "an_881b_44",
  "productId": "tv_008",
  "vote": "APPROVE"
}
```
- **Response (`200 OK`)**:
```json
{
  "data": {
    "groupId": "grp_881a_b2",
    "productId": "tv_008",
    "approvalsCount": 4,
    "totalParticipants": 4,
    "isUnanimous": true,
    "decisionStatus": "DECIDED"
  },
  "meta": { "requestId": "req_106", "timestamp": "2026-09-15T22:54:10Z" }
}
```
