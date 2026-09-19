# 71 — Group & Session Management API Specification

## Document Metadata
- **Document Type**: REST API Endpoint Specification
- **Status**: Implementation-Critical Frozen Specification
- **Owner**: API Architect & Backend Engineer
- **Dependencies**: [10_REQUIREMENTS.md](file:///d:/Consenzo%20amazon%20hackathon/docs/10_REQUIREMENTS.md), [13_PERMISSION_MODEL.md](file:///d:/Consenzo%20amazon%20hackathon/docs/13_PERMISSION_MODEL.md), [70_API_CONTRACTS.md](file:///d:/Consenzo%20amazon%20hackathon/docs/70_API_CONTRACTS.md)
- **Downstream References**: [72_CONSENZO_API.md](file:///d:/Consenzo%20amazon%20hackathon/docs/72_CONSENZO_API.md), [80_SECURITY.md](file:///d:/Consenzo%20amazon%20hackathon/docs/80_SECURITY.md)

---

## 1. Group Domain Overview

The **Group API** manages the lifecycle of shared decision rooms, participant invitations, room roster states, and participant joining.

```text
 ┌─────────────────────────────────────────────────────────────┐
 │                      GROUP API LIFECYCLE                    │
 │                                                             │
 │  Coordinator creates room  ──►  Shareable Invite Link/PIN   │
 │                                             │               │
 │  Roster Readiness Tracked  ◄──  2–4 Participants Join       │
 └─────────────────────────────────────────────────────────────┘
```

---

## 2. Detailed Endpoint Specifications

### 2.1 Create Decision Group
Initializes a new group purchasing session.

- **HTTP Method**: `POST`
- **Path**: `/groups`
- **Authorization**: Public (No token required)
- **Request Body**:
```json
{
  "title": "Family Living Room TV",
  "category": "smart_tvs",
  "creatorDisplayName": "Dad",
  "targetParticipantCount": 4
}
```
- **Response (`201 Created`)**:
```json
{
  "data": {
    "groupId": "grp_881a_b2",
    "title": "Family Living Room TV",
    "category": "smart_tvs",
    "status": "JOINING",
    "inviteCode": "TV-881A",
    "inviteUrl": "https://consenzo.app/join/TV-881A",
    "creator": {
      "participantId": "usr_dad_01",
      "displayName": "Dad",
      "role": "coordinator"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "meta": {
    "requestId": "req_001",
    "timestamp": "2026-09-15T22:52:00Z"
  }
}
```

---

### 2.2 Get Group Status & Public Roster
Retrieves current room state and member readiness.

- **HTTP Method**: `GET`
- **Path**: `/groups/{groupId}`
- **Authorization**: Bearer Token (Any valid session participant)
- **Response (`200 OK`)**:
```json
{
  "data": {
    "groupId": "grp_881a_b2",
    "title": "Family Living Room TV",
    "category": "smart_tvs",
    "status": "INTERVIEWING",
    "targetParticipantCount": 4,
    "roster": [
      {
        "participantId": "usr_dad_01",
        "displayName": "Dad",
        "role": "coordinator",
        "readiness": "CONFIRMED"
      },
      {
        "participantId": "usr_mom_02",
        "displayName": "Mom",
        "role": "participant",
        "readiness": "CONFIRMED"
      },
      {
        "participantId": "usr_son_03",
        "displayName": "Son",
        "role": "participant",
        "readiness": "INTERVIEWING"
      },
      {
        "participantId": "usr_daughter_04",
        "displayName": "Daughter",
        "role": "participant",
        "readiness": "WAITING"
      }
    ]
  },
  "meta": {
    "requestId": "req_002",
    "timestamp": "2026-09-15T22:52:10Z"
  }
}
```

---

### 2.3 Join Group via Invite Code
Allows an invited family member or roommate to join a decision room.

- **HTTP Method**: `POST`
- **Path**: `/groups/{groupId}/join`
- **Authorization**: Public (Bound to valid `inviteCode`)
- **Request Body**:
```json
{
  "inviteCode": "TV-881A",
  "displayName": "Son"
}
```
- **Response (`201 Created`)**:
```json
{
  "data": {
    "groupId": "grp_881a_b2",
    "participantId": "usr_son_03",
    "displayName": "Son",
    "role": "participant",
    "readiness": "WAITING",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "meta": {
    "requestId": "req_003",
    "timestamp": "2026-09-15T22:52:20Z"
  }
}
```
- **Error Conditions**:
  - `HTTP 404 NOT_FOUND`: Group does not exist.
  - `HTTP 403 INVALID_INVITE_CODE`: PIN mismatch.
  - `HTTP 409 ROOM_FULL`: Maximum 4 participants already joined.
  - `HTTP 409 INVALID_STATE`: Group is already in `RESULTS_READY` or `DECIDED`.

---

### 2.4 Refresh / Regenerate Invite Link
Permits the coordinator to generate a new invite PIN.

- **HTTP Method**: `POST`
- **Path**: `/groups/{groupId}/invite`
- **Authorization**: Bearer Token (Coordinator role required)
- **Response (`200 OK`)**:
```json
{
  "data": {
    "inviteCode": "TV-994B",
    "inviteUrl": "https://consenzo.app/join/TV-994B",
    "expiresAt": "2026-09-16T22:52:00Z"
  },
  "meta": {
    "requestId": "req_004",
    "timestamp": "2026-09-15T22:52:30Z"
  }
}
```
