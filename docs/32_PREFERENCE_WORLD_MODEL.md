# 32 — Preference World Model & Schema Specification

## Document Metadata
- **Document Type**: Data Contract & Preference Model Schema
- **Status**: Approved Foundation
- **Owner**: Systems Architect & AI Engineer
- **Dependencies**: [30_CONSENZO_AGENT.md](file:///d:/Consenzo%20amazon%20hackathon/docs/30_CONSENZO_AGENT.md), [31_AGENT_LOOP.md](file:///d:/Consenzo%20amazon%20hackathon/docs/31_AGENT_LOOP.md)
- **Downstream References**: [33_CONSTRAINT_ENGINE.md](file:///d:/Consenzo%20amazon%20hackathon/docs/33_CONSTRAINT_ENGINE.md), [34_SCORING_ENGINE.md](file:///d:/Consenzo%20amazon%20hackathon/docs/34_SCORING_ENGINE.md), [35_CONFLICT_DETECTION.md](file:///d:/Consenzo%20amazon%20hackathon/docs/35_CONFLICT_DETECTION.md), [70_API_CONTRACTS.md](file:///d:/Consenzo%20amazon%20hackathon/docs/70_API_CONTRACTS.md)

---

## 1. Overview & Conceptual Design

The **Preference World Model** represents the formalized, structured representation of an individual participant's desires, boundaries, and trade-off flexibilities.

### Core Architectural Rules
1. **Living Representation**: The model updates dynamically across conversational turns. It is not a write-once questionnaire.
2. **Provenance & Auditability**: Every extracted constraint retains its origin, confidence score, and confirmation state.
3. **Flexible Ranges over Binary Facets**: Captures preferred targets, acceptable fallback ranges, and compensating dimensions rather than over-simplified binary flags.
4. **Open-Ended Attribute Extensibility**: The model does not reject novel constraints (e.g., physical cabinet dimensions); it captures them as structured parameters and normalizes them against the catalog.
5. **Zero Transcripts in Shared State**: The model contains clean mathematical parameters. Raw anecdotes are strictly expunged before group aggregation.

---

## 2. Participant Preference Profile JSON Schema

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "ParticipantPreferenceProfile",
  "type": "object",
  "required": [
    "participantId",
    "sessionId",
    "confirmedByParticipant",
    "updatedAt",
    "constraints",
    "preferences"
  ],
  "properties": {
    "participantId": { "type": "string" },
    "sessionId": { "type": "string" },
    "displayName": { "type": "string" },
    "confirmedByParticipant": { "type": "boolean" },
    "turnCount": { "type": "integer" },
    "updatedAt": { "type": "string", "format": "date-time" },
    
    "budget": {
      "type": "object",
      "required": ["type", "amountInr"],
      "properties": {
        "type": { "enum": ["hard_ceiling", "soft_target", "flexible"] },
        "amountInr": { "type": "number" },
        "stretchLimitInr": { "type": "number" },
        "stretchConditions": { "type": "string" },
        "confidence": { "type": "number", "minimum": 0, "maximum": 1 }
      }
    },

    "constraints": {
      "type": "array",
      "description": "Non-negotiable hard constraints and dealbreakers",
      "items": {
        "type": "object",
        "required": ["attribute", "operator", "value", "type", "confidence", "confirmed"],
        "properties": {
          "attribute": { "type": "string" },
          "operator": { "enum": ["<=", ">=", "==", "!=", "in", "not_in"] },
          "value": { "type": ["string", "number", "boolean", "array"] },
          "type": { "enum": ["dealbreaker", "hard_constraint"] },
          "confidence": { "type": "number", "minimum": 0, "maximum": 1 },
          "source": { "enum": ["explicit_statement", "inferred_latent", "clarified"] },
          "provenanceTurn": { "type": "integer" },
          "confirmed": { "type": "boolean" }
        }
      }
    },

    "preferences": {
      "type": "array",
      "description": "Weighted soft preferences and nice-to-haves",
      "items": {
        "type": "object",
        "required": ["attribute", "weight", "type", "confidence"],
        "properties": {
          "attribute": { "type": "string" },
          "type": { "enum": ["soft_preference", "nice_to_have"] },
          "preferredValue": { "type": ["string", "number", "boolean", "array"] },
          "acceptableValues": { "type": "array" },
          "weight": { "type": "number", "minimum": 0.0, "maximum": 1.0 },
          "compensatingTradeoffs": {
            "type": "array",
            "items": { "type": "string" }
          },
          "confidence": { "type": "number", "minimum": 0, "maximum": 1 },
          "source": { "enum": ["explicit_statement", "inferred_latent", "clarified"] },
          "provenanceTurn": { "type": "integer" },
          "confirmed": { "type": "boolean" }
        }
      }
    }
  }
}
```

---

## 3. Concrete Example Profiles: The Family Scenario

### 3.1 Dad's Extracted Profile
```json
{
  "participantId": "usr_dad_01",
  "sessionId": "ses_tv_9941",
  "displayName": "Dad",
  "confirmedByParticipant": true,
  "turnCount": 4,
  "updatedAt": "2026-09-15T18:40:00Z",
  "budget": {
    "type": "hard_ceiling",
    "amountInr": 50000,
    "stretchLimitInr": 50000,
    "stretchConditions": "None. Strict ceiling.",
    "confidence": 1.0
  },
  "constraints": [
    {
      "attribute": "price_inr",
      "operator": "<=",
      "value": 50000,
      "type": "hard_constraint",
      "confidence": 1.0,
      "source": "explicit_statement",
      "provenanceTurn": 1,
      "confirmed": true
    },
    {
      "attribute": "warranty_years",
      "operator": ">=",
      "value": 2,
      "type": "hard_constraint",
      "confidence": 0.95,
      "source": "explicit_statement",
      "provenanceTurn": 2,
      "confirmed": true
    }
  ],
  "preferences": [
    {
      "attribute": "brand_reliability",
      "type": "soft_preference",
      "preferredValue": "Tier1_Reputable",
      "weight": 0.8,
      "confidence": 0.9,
      "source": "inferred_latent",
      "provenanceTurn": 2,
      "confirmed": true
    }
  ]
}
```

### 3.2 Son's Extracted Profile
```json
{
  "participantId": "usr_son_03",
  "sessionId": "ses_tv_9941",
  "displayName": "Son",
  "confirmedByParticipant": true,
  "turnCount": 3,
  "updatedAt": "2026-09-15T18:42:00Z",
  "budget": {
    "type": "flexible",
    "amountInr": 55000,
    "confidence": 0.7
  },
  "constraints": [],
  "preferences": [
    {
      "attribute": "refresh_rate_hz",
      "type": "soft_preference",
      "preferredValue": 120,
      "acceptableValues": [60],
      "weight": 0.95,
      "compensatingTradeoffs": ["lower_price", "higher_screen_size"],
      "confidence": 0.95,
      "source": "explicit_statement",
      "provenanceTurn": 1,
      "confirmed": true
    },
    {
      "attribute": "hdmi_ports",
      "type": "soft_preference",
      "preferredValue": 3,
      "weight": 0.7,
      "confidence": 0.85,
      "source": "explicit_statement",
      "provenanceTurn": 2,
      "confirmed": true
    }
  ]
}
```

---

## 4. Normalization Against Controlled Product Catalog

When the participant mentions a novel or unstandardized attribute (e.g., *"Must fit inside my 110cm wide TV cabinet"* or *"Must have Bluetooth audio for late-night watching"*):
1. **Attribute Extraction**: Stored as `max_width_cm = 110`.
2. **Catalog Mapping Layer**: The coordinator maps `max_width_cm` to catalog field `dimensions_width_cm`.
3. **Unmatched Attribute Handling**: If an extracted attribute cannot be resolved to any catalog specification, it is tagged as `unmapped_advisory` and flagged to the participant rather than silently corrupting the scoring pipeline.
