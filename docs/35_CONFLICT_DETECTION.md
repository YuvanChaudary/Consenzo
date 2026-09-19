# 35 — Conflict Detection & Taxonomy Engine

## Document Metadata
- **Document Type**: Algorithmic Conflict Detection Specification
- **Status**: Approved Foundation
- **Owner**: Deterministic Engine Architect
- **Dependencies**: [20_SYSTEM_ARCHITECTURE.md](file:///d:/Consenzo%20amazon%20hackathon/docs/20_SYSTEM_ARCHITECTURE.md), [33_CONSTRAINT_ENGINE.md](file:///d:/Consenzo%20amazon%20hackathon/docs/33_CONSTRAINT_ENGINE.md), [34_SCORING_ENGINE.md](file:///d:/Consenzo%20amazon%20hackathon/docs/34_SCORING_ENGINE.md)
- **Downstream References**: [36_FAIRNESS_ENGINE.md](file:///d:/Consenzo%20amazon%20hackathon/docs/36_FAIRNESS_ENGINE.md), [70_API_CONTRACTS.md](file:///d:/Consenzo%20amazon%20hackathon/docs/70_API_CONTRACTS.md), [93_CONSENZO_BENCHMARK.md](file:///d:/Consenzo%20amazon%20hackathon/docs/93_CONSENZO_BENCHMARK.md)

---

## 1. Conflict Detection Philosophy

A primary failure of conventional ecommerce is that conflicting requirements cause silent zero-result screens or unranked search dumps. 

Consenzo treats conflict as a **first-class structured entity**:
- The engine identifies exactly **who** is conflicting with **whom**, over **which specific attributes**, and by **what mathematical margin**.
- It distinguishes between internal personal ambivalence and collective multi-party friction.
- It produces machine-readable conflict records that enable the UI and AI explanation generator to present transparent, empathetic compromise options.

---

## 2. Conflict Taxonomy & Classification

The engine classifies conflicts into five distinct operational types:

```text
┌──────────────────────────────┬────────────────────────────────────────────────────────┐
│ Conflict Type                │ Operational Definition                                 │
├──────────────────────────────┼────────────────────────────────────────────────────────┤
│ 1. DIRECT_HARD_CONFLICT      │ Two or more participants specify mandatory constraints │
│                              │ whose boolean intersection yields 0 catalog items.     │
├──────────────────────────────┼────────────────────────────────────────────────────────┤
│ 2. HARD_VS_PREFERENCE        │ A hard constraint from Participant A forces a severe   │
│                              │ utility penalty (u < 4.0) on Participant B's priority. │
├──────────────────────────────┼────────────────────────────────────────────────────────┤
│ 3. PREFERENCE_VS_PREFERENCE  │ Multiple soft preferences compete for finite catalog   │
│                              │ features (e.g. Brand vs. Bezel color trade-off).       │
├──────────────────────────────┼────────────────────────────────────────────────────────┤
│ 4. NO_CATALOG_MATCH          │ A requested attribute combination does not exist in   │
│                              │ commercial reality (e.g. 120Hz OLED under ₹25,000).    │
├──────────────────────────────┼────────────────────────────────────────────────────────┤
│ 5. INSUFFICIENT_DATA         │ Missing confirmations or low confidence (<0.70) on key │
│                              │ attributes prevents reliable conflict assessment.      │
└──────────────────────────────┴────────────────────────────────────────────────────────┘
```

---

## 3. Conflict Detection Levels

### Level 1: Participant-Internal Contradictions (Elicitation Phase)
Detected within a single participant's session when two desires exhibit negative correlation in market reality:
- *Scenario*: Participant demands *"Cheapest TV available"* and *"Best OLED picture quality"*.
- *Algorithmic Trigger*: `budget_inr < 30000` paired with `panel_type EQ "OLED"`.
- *Resolution*: The agent pauses extraction and presents an interactive trade-off prompt:
  > *"OLED displays start at ₹65,000. Would you prefer to focus on keeping the price under ₹30,000 with a standard 4K LED, or expand the budget to achieve true OLED picture quality?"*

### Level 2: Cross-Participant Hard Collisions (Consensus Phase)
Detected across the group when the feasible candidate set $\mathcal{F}_0$ is empty:
- *Algorithmic Trigger*:
  $$\mathcal{F}_0 = \{ x \in \mathcal{C} \mid \text{PassesAllConstraints}(x) \} = \emptyset$$
- *Analysis*: The engine performs a pairwise constraint clash matrix:
  $$M_{i,j} = \left| \{ x \in \mathcal{C} \mid C_i(x) \land C_j(x) \} \right|$$
  Pairs where $M_{i,j} = 0$ represent the root conflict.

---

## 4. Machine-Readable Conflict Schema

The engine outputs structured conflict telemetry embedded directly in the `Analysis` record:

```json
{
  "conflictId": "cnf_992a_441",
  "type": "DIRECT_HARD_CONFLICT",
  "severity": "CRITICAL",
  "participants": ["usr_dad_01", "usr_son_03"],
  "involvedAttributes": ["price_inr", "refresh_rate_hz"],
  "conflictingConstraints": [
    {
      "participantId": "usr_dad_01",
      "displayName": "Dad",
      "constraint": "price_inr <= 45000",
      "type": "HARD_CONSTRAINT"
    },
    {
      "participantId": "usr_son_03",
      "displayName": "Son",
      "constraint": "refresh_rate_hz >= 120",
      "type": "HARD_CONSTRAINT"
    }
  ],
  "rootCauseAnalysis": "No television in the catalog satisfies both price <= ₹45,000 and refresh rate >= 120Hz (minimum price for 120Hz is ₹48,000).",
  "relaxationBranches": [
    {
      "branchId": "branch_relax_gaming",
      "label": "Strict Budget Priority",
      "description": "Maintain Dad's ₹45,000 budget and adjust Son's gaming refresh rate to 60Hz.",
      "candidateCount": 12,
      "impactedParticipant": "usr_son_03"
    },
    {
      "branchId": "branch_relax_budget",
      "label": "Gaming Performance Priority",
      "description": "Satisfy Son's 120Hz gaming requirement by stretching Dad's budget by ₹3,000 (to ₹48,000).",
      "candidateCount": 3,
      "impactedParticipant": "usr_dad_01"
    }
  ]
}
```

---

## 5. UI & Natural Language Presentation

When a conflict record exists:
1. **The Shared Board UI** renders a prominent visual trade-off comparison card.
2. **LLM Explanation Generator (NVIDIA API)** translates the mathematical branch into empathetic, respectful group prose:
   > *"Your family has a clear trade-off to discuss: Dad's ideal budget is ₹45,000, while Son's PS5 gaming setup needs 120Hz (which starts at ₹48,000). Option #1 keeps your exact budget but runs games at standard 60Hz. Option #2 provides 120Hz native gaming for an extra ₹3,000. Review both options below."*
