# 40 — Controlled Benchmark Product Catalog Specification

## Document Metadata
- **Document Type**: Domain Data Contract & Benchmark Catalog Specification
- **Status**: Approved Foundation
- **Owner**: Data Architect & Systems Engineer
- **Dependencies**: [04_MVP_SCOPE.md](file:///d:/Consenzo%20amazon%20hackathon/docs/04_MVP_SCOPE.md), [20_SYSTEM_ARCHITECTURE.md](file:///d:/Consenzo%20amazon%20hackathon/docs/20_SYSTEM_ARCHITECTURE.md), [33_CONSTRAINT_ENGINE.md](file:///d:/Consenzo%20amazon%20hackathon/docs/33_CONSTRAINT_ENGINE.md)
- **Downstream References**: [41_CATALOG_STATE.md](file:///d:/Consenzo%20amazon%20hackathon/docs/41_CATALOG_STATE.md), [42_CATALOG_TOOLS.md](file:///d:/Consenzo%20amazon%20hackathon/docs/42_CATALOG_TOOLS.md), [43_CATALOG_FAILURES.md](file:///d:/Consenzo%20amazon%20hackathon/docs/43_CATALOG_FAILURES.md), [91_SEARCH_FILTER_BENCHMARK.md](file:///d:/Consenzo%20amazon%20hackathon/docs/91_SEARCH_FILTER_BENCHMARK.md)

---

## 1. Catalog Mission & Policy

The Consenzo MVP utilizes an **immutable, controlled benchmark catalog of 35 curated Smart TVs**.

```text
 ┌─────────────────────────────────────────────────────────────┐
 │                CONTROLLED BENCHMARK POLICY                  │
 │                                                             │
 │  ❌ No live web scraping of Amazon, Flipkart, or Best Buy    │
 │  ❌ No Amazon Product Advertising API (PA-API) runtime      │
 │  ❌ No claims of live inventory, stock, or local zip codes  │
 │  ✅ 100% deterministic, locally reproducible, versioned     │
 │  ✅ Specifically calibrated to test group conflict vectors  │
 └─────────────────────────────────────────────────────────────┘
```

### Strategic Justification
In a 48-hour hackathon, external scraping and live merchant APIs introduce anti-bot blocks, rate limits, schema mutations, and network latency spikes that routinely destroy live demonstrations. A static, mathematically verified benchmark catalog ensures:
1. **Zero Flakiness**: 100% offline and in-memory testability.
2. **Deterministic Evaluation**: Guaranteed reproducibility across judge evaluations.
3. **Intentional Conflict Design**: Calibrated product attributes that expose authentic multi-stakeholder compromises.

---

## 2. Canonical Product Schema

Every product record adheres strictly to the canonical TypeScript schema:

```typescript
export interface SmartTvProduct {
  productId: string;              // Unique stable identifier (e.g. "tv_001")
  name: string;                   // Consumer-facing product name
  brand: string;                  // Primary manufacturer brand
  priceInr: number;               // Base price in Indian Rupees (INR)
  rating: number;                 // Normalized customer review rating (1.0 to 5.0)
  reviewCount: number;            // Total number of user reviews
  screenSizeInches: number;       // Diagonal display size in inches (43, 50, 55, 65, 75)
  resolution: '4K' | '8K' | '1080p'; // Display resolution
  refreshRateHz: number;          // Native panel refresh rate (60, 120, 144)
  panelType: 'LED' | 'QLED' | 'OLED' | 'Mini-LED'; // Panel technology
  hdrFormats: string[];           // Supported HDR formats (["HDR10", "Dolby Vision"])
  hasGamingMode: boolean;         // Low-latency Auto Low Latency Mode (ALLM) support
  hasHdmi21: boolean;             // True HDMI 2.1 4K@120Hz port presence
  hdmiPorts: number;              // Total physical HDMI ports
  warrantyYears: number;          // Manufacturer warranty in years
  bezelColor: 'Black' | 'Silver' | 'Titanium' | 'White'; // Frame aesthetic finish
  widthCm: number;                // Physical width in centimeters (furniture clearance)
  smartPlatform: 'Google TV' | 'Tizen' | 'webOS' | 'Fire OS'; // Operating system
  energyRatingStars: number;      // Bureau of Energy Efficiency star rating (1 to 5)
  asin: string;                   // Amazon Standard Identification Number for outbound link
  imageUrl: string;               // High-resolution product asset path
}
```

### Attribute Justification Matrix
Every attribute exists to service a specific multi-objective decision vector:

| Attribute | Decision Vector Serviced | Conflict Trigger Role |
| :--- | :--- | :--- |
| `priceInr` | Financial ceiling vs. target | Core budget boundary (Dad vs. Family) |
| `brand` | Brand affinity / loyalty | Mom's Samsung preference vs. others |
| `rating` / `reviewCount` | Quality / confidence proxy | Baseline quality floor |
| `screenSizeInches` | Room size / immersion | Living room space vs. price stretch |
| `refreshRateHz` | Gaming performance | Son's PS5 120Hz gaming vs. budget |
| `panelType` | Cinephile contrast | OLED picture quality vs. budget |
| `hasHdmi21` | Console compatibility | Hardware gating condition |
| `warrantyYears` | Long-term reliability | Dad's risk mitigation boundary |
| `bezelColor` | Room aesthetics | Daughter's silver frame preference |
| `widthCm` | Physical furniture clearance| Non-negotiable physical dealbreaker |
| `smartPlatform` | App ecosystem / familiarity| Apple AirPlay / Google Cast compatibility |

---

## 3. Generic vs. Category-Specific Decomposition

The Consenzo architecture strictly decouples generic decision properties from category-specific hardware metrics:

```text
 ┌─────────────────────────────────────────────────────────────┐
 │                 GENERIC DECISION ATTRIBUTES                 │
 │            (Operated on by Consenzo Engine Core)            │
 │                                                             │
 │   • priceInr          • brand             • rating          │
 │   • warrantyYears     • reviewCount       • widthCm         │
 └──────────────────────────────┬──────────────────────────────┘
                                │ Mapped via Category Adapter
                                ▼
 ┌─────────────────────────────────────────────────────────────┐
 │                SMART-TV-SPECIFIC ATTRIBUTES                 │
 │            (Managed by SmartTvCategoryAdapter)              │
 │                                                             │
 │   • refreshRateHz     • panelType         • resolution      │
 │   • hasGamingMode     • hasHdmi21         • smartPlatform   │
 │   • hdrFormats        • energyRatingStars • bezelColor      │
 └─────────────────────────────────────────────────────────────┘
```

The core scoring engine evaluates mathematical distances and satisfaction curves without hardcoded awareness of HDMI or panel types. The `SmartTvCategoryAdapter` translates `hasHdmi21` and `refreshRateHz` into normalized satisfaction utilities $s \in [0.0, 1.0]$.

---

## 4. Intentional Conflict Archetypes in the 35-Item Catalog

To rigorously test the decision engine and ensure the live hackathon demo is visually and mathematically compelling, the 35 products are partitioned into strategic archetypes:

```mermaid
graph TD
    subgraph ARCHETYPES["STRATEGIC PRODUCT ARCHETYPES"]
        A["Archetype A: Value Leader
        ₹28,000–₹35,000 | 43–50\" | 60Hz | TCL / Xiaomi
        Tests low-budget optimization"]
        
        B["Archetype B: Mainstream Brand Anchor
        ₹45,000–₹49,000 | 55\" | 60Hz | Samsung Crystal
        Satisfies Dad Budget & Mom Brand; Fails Son 120Hz"]
        
        C["Archetype C: Gaming Compromise
        ₹48,000–₹52,000 | 50–55\" | 120Hz | LG NanoCell
        Satisfies Son 120Hz & Dad Budget; Fails Mom Brand"]
        
        D["Archetype D: Premium Over-Budget
        ₹56,000–₹68,000 | 55\" | 120Hz | Samsung QLED
        Satisfies Mom & Son; Violates Dad's ₹50k Budget"]
        
        E["Archetype E: Aesthetic Specialist
        ₹47,000 | 55\" | 60Hz | Silver Bezel | Xiaomi
        Satisfies Daughter Silver; Brand neutral"]
        
        F["Archetype F: Flagship OLED
        ₹89,000–₹1,25,000 | 55–65\" | 120Hz | Sony Bravia
        Tests extreme budget stretch vs. picture quality"]
    end
```

---

## 5. Catalog Invariants & Data Quality Assurances

Every product in the catalog JSON artifact satisfies the following automated validation rules:
1. `priceInr > 0` and within valid consumer range (₹20,000 to ₹1,50,000).
2. `rating` bounded to $[1.0, 5.0]$ with `reviewCount >= 10`.
3. `refreshRateHz` restricted to valid industry standards: $[60, 120, 144]$.
4. `widthCm` accurately corresponds to diagonal screen size ($43" \approx 96\text{cm}, 55" \approx 123\text{cm}, 65" \approx 145\text{cm}$).
5. Mandatory fields are 100% populated; zero `null` or `undefined` primitives.
