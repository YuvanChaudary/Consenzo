# 43 — Catalog Failure Modes, Test Fixtures & Adapter Contract

## Document Metadata
- **Document Type**: Failure Recovery, Edge Case Policy & Adapter Contract Specification
- **Status**: Approved Foundation
- **Owner**: QA & Systems Architect
- **Dependencies**: [20_SYSTEM_ARCHITECTURE.md](file:///d:/Consenzo%20amazon%20hackathon/docs/20_SYSTEM_ARCHITECTURE.md), [33_CONSTRAINT_ENGINE.md](file:///d:/Consenzo%20amazon%20hackathon/docs/33_CONSTRAINT_ENGINE.md), [40_CONTROLLED_CATALOG.md](file:///d:/Consenzo%20amazon%20hackathon/docs/40_CONTROLLED_CATALOG.md), [42_CATALOG_TOOLS.md](file:///d:/Consenzo%20amazon%20hackathon/docs/42_CATALOG_TOOLS.md)
- **Downstream References**: [70_API_CONTRACTS.md](file:///d:/Consenzo%20amazon%20hackathon/docs/70_API_CONTRACTS.md), [91_SEARCH_FILTER_BENCHMARK.md](file:///d:/Consenzo%20amazon%20hackathon/docs/91_SEARCH_FILTER_BENCHMARK.md), [110_DECISIONS.md](file:///d:/Consenzo%20amazon%20hackathon/docs/110_DECISIONS.md)

---

## 1. Catalog Failure Taxonomy & Recovery Policies

The table below specifies the definitive, fail-closed system behavior for all catalog boundary conditions:

| Failure Condition | Error Code | System Action & Recovery Policy |
| :--- | :--- | :--- |
| **Empty Catalog / Zero Matching Products** | `NO_CATALOG_MATCH` | Return formal conflict record. Triggers Controlled Relaxation Protocol. **The system never invents a placeholder recommendation.** |
| **Unknown / Unsupported Category** | `UNSUPPORTED_CATEGORY` | Returns `HTTP 400 Bad Request`. Consenzo refuses evaluation and prompts user to choose an approved category. |
| **Unknown Attribute in Hard Constraint**| `UNSUPPORTED_ATTRIBUTE` | Flagged as `UNMAPPED_ADVISORY` to the user during interview confirmation. **It is never silently converted into a gating constraint.** |
| **Missing Attribute on Candidate Product** | `MISSING_PRODUCT_ATTRIBUTE` | **Fail-Safe Conservative Policy**: If attribute is targeted by a `DEALBREAKER` or `HARD_CONSTRAINT`, the product is eliminated. If targeted by a `PREFERENCE`, satisfaction defaults to $0.0$. |
| **Catalog Checksum Mismatch** | `CATALOG_INTEGRITY_VIOLATION` | Lambda halts execution immediately; reloads pristine artifact from S3. Protects against in-memory corruption. |

---

## 2. Product Identity & Stability Guarantees

1. **Immutable Product Keys**:
   Every catalog product has an immutable ID: `tv_001`, `tv_002`, ..., `tv_035`.
2. **Decoupled Marketing Copy**:
   Product titles, promotional descriptions, and badge labels may change in the frontend presentation tier, but internal scoring keys (`tv_001`) remain permanent across the lifecycle of a catalog version.
3. **Outbound ASIN Mapping**:
   Each product is hard-mapped to an immutable Amazon ASIN (e.g. `tv_001` $\rightarrow$ `B09X1K87Z2`) for guaranteed valid checkout linking.

---

## 3. The Category Adapter Contract

The core decision engine interacts with the catalog strictly through a standardized `CategoryAdapter` interface:

```typescript
export interface CategoryAdapter<TProduct> {
  categoryName: string;
  schemaVersion: string;

  /**
   * Validates that a raw catalog JSON satisfies all structural rules
   */
  validateProduct(product: unknown): ProductValidationReport;

  /**
   * Extracts an attribute value from a product record in a type-safe manner
   */
  getAttribute(product: TProduct, attributeName: string): unknown;

  /**
   * Normalizes heterogeneous user inputs into standard metric scales
   */
  normalizeAttribute(attributeName: string, rawValue: unknown): NormalizedValue;

  /**
   * Returns list of all searchable, filterable, and scoreable attributes
   */
  getSupportedAttributes(): string[];
}
```

The MVP implements `SmartTvCategoryAdapter`. When future categories (e.g. Laptops or Furniture) are added, the core constraint validation, conflict detection, and fairness engine code will require **zero modifications**.

---

## 4. Controlled Benchmark Test Fixtures (Tests A through H)

The 35-item catalog contains dedicated test fixture records calibrated to trigger specific algorithmic verification tests:

| Test Fixture ID | Catalog Products Involved | Scenario Triggered | Expected Engine Output |
| :--- | :--- | :--- | :--- |
| **Test A** | `tv_001` (Samsung Crystal) | Unanimous Budget & Brand Agreement | `tv_001` wins with score $\approx 9.8$; $\sigma(u) \approx 0.0$. |
| **Test B** | `tv_001` (₹48k) vs. `tv_005` (₹54k) | Budget Ceiling Conflict (Dad limit ₹50k) | `tv_005` gated out; `tv_001` surfaces as Top recommendation. |
| **Test C** | `tv_001` (Samsung 60Hz) vs. `tv_008` (LG 120Hz) | Brand vs. Gaming Performance Conflict | Engine identifies trade-off; `tv_008` wins on group fairness (8.11 vs 7.95). |
| **Test D** | `tv_012` (Sacrifices Son) vs. `tv_008` (Balanced) | Tyranny of Majority / Averaging Trap | Tier 1 Floor penalty eliminates `tv_012` because Son score $< 4.0$. |
| **Test E** | `tv_025` (Requires 120Hz under ₹35k) | Zero Feasible Products in Catalog | Empty set caught; generates relaxation branches (Stretch budget or lower Hz). |
| **Test F** | `tv_018` (High specs, but Brand X) | Dealbreaker Gating Test | `tv_018` pruned during Stage 1 gating; utility forced to $0.0$. |
| **Test G** | `tv_031` (Synthetic record with missing `hasHdmi21`) | Missing Attribute Test | Fails hard HDMI 2.1 gate; excluded safely without crashing. |
| **Test H** | `tv_008` (LG NanoCell ₹49k) | Controlled Relaxation Test | Surfaced as optimal compromise after budget stretched from ₹45k to ₹49k. |

---

## 5. Hackathon Demonstration Calibration

The 35-item catalog is deliberately calibrated so that the primary live demonstration flow produces a mathematically verified, clear result:

```text
 ┌─────────────────────────────────────────────────────────────┐
 │            DEMO SCENARIO: FAMILY LIVING ROOM TV             │
 │                                                             │
 │  Dad:      Hard Budget <= ₹50k, Warranty >= 2 Years         │
 │  Mom:      Strongly prefers Samsung                         │
 │  Son:      Requires 120Hz for PS5 gaming                    │
 │  Daughter: Prefers Silver metallic bezel                    │
 ├─────────────────────────────────────────────────────────────┤
 │                  DETERMINISTIC RANKING RESULT               │
 │                                                             │
 │  Rank #1: LG NanoCell Gaming (tv_008 - ₹49,000)             │
 │           Family Score: 8.11 / 10                           │
 │           Dad: 9.2 | Mom: 6.5 | Son: 9.8 | Daughter: 9.6    │
 │           Why: Delivers 120Hz and Silver under budget;      │
 │                Mom accepts LG brand compromise.             │
 │                                                             │
 │  Rank #2: Samsung Crystal Ultra (tv_001 - ₹48,000)          │
 │           Family Score: 7.95 / 10                           │
 │           Dad: 9.5 | Mom: 10.0 | Son: 6.8 | Daughter: 8.0   │
 │           Why: Delivers Samsung brand under budget;         │
 │                Son sacrifices 120Hz (runs at 60Hz).         │
 │                                                             │
 │  Pruned:  Samsung Neo QLED (tv_005 - ₹56,000)               │
 │           Violates Dad's non-negotiable ₹50k budget ceiling.│
 └─────────────────────────────────────────────────────────────┘
```

The outcome is mathematically pure, verifiable, and visually compelling for hackathon judges.
