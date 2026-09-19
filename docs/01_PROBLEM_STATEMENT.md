# 01 — Consenzo Problem Statement

## Document Metadata
- **Document Type**: Problem Analysis & Architectural Rationale
- **Status**: Approved Foundation
- **Owner**: Lead Product Architect & Systems Engineer
- **Dependencies**: [00_PROJECT_CHARTER.md](file:///d:/Consenzo%20amazon%20hackathon/docs/00_PROJECT_CHARTER.md)
- **Downstream References**: [02_SOLUTION.md](file:///d:/Consenzo%20amazon%20hackathon/docs/02_SOLUTION.md), [10_REQUIREMENTS.md](file:///d:/Consenzo%20amazon%20hackathon/docs/10_REQUIREMENTS.md), [91_SEARCH_FILTER_BENCHMARK.md](file:///d:/Consenzo%20amazon%20hackathon/docs/91_SEARCH_FILTER_BENCHMARK.md)

---

## 1. Problem Definition

> **The Central Dilemma**: Existing ecommerce search engines, parametric filters, and collaborative list tools are engineered around a single-actor optimization paradigm. They fail catastrophically when multiple stakeholders with heterogeneous, unaligned, and conflicting preferences attempt to select **one single physical product** to purchase jointly.

In consumer commerce, large-ticket household and organizational purchases (televisions, major appliances, furniture, group travel gear, office equipment) are inherently shared goods. The purchase lifecycle involves 2 to 6 participants. While discovery of candidate items has become commoditized, **achieving group alignment on a single product choice remains an unsolved, high-friction ordeal.**

---

## 2. Failure Modes of Existing Paradigms

```
                           Group of 4 Stakeholders
                   ┌──────────┬──────────┬──────────┐
                   ▼          ▼          ▼          ▼
                  Dad        Mom        Son      Daughter
               (Budget)    (Brand)   (Gaming)    (Aesthetic)
                   │          │          │          │
         ┌─────────┴──────────┴──────────┴──────────┴─────────┐
         │                                                    │
         ▼                                                    ▼
   TRADITIONAL FILTERS                               GENERIC LLM CHAT
 ─────────────────────────                          ───────────────────
 Strict Boolean Intersection:                       Natural Language Prompt:
 Budget <= 50k                                      "Pick a TV for our family..."
 AND Brand == Samsung                               
 AND RefreshRate >= 120Hz                           FAILURE:
 AND Color == Silver                                - Hallucinates specs (claims a
                                                      60Hz TV has 120Hz)
 RESULT: 0 Products Found                           - Secretly drops Dad's budget
                                                      (selects 65k TV)
 Relaxed Boolean Union:                             - Opaque reasoning (cannot show
 RESULT: 1,420 Irrelevant Products                    individual satisfaction breakdown)
```

### 2.1 Failure Mode A: The Boolean Filter Collapse
Traditional ecommerce search relies on relational facets (SQL `WHERE` clauses combined with `AND` / `OR` logic):
1. **Intersection Over-Constraining**: If each participant introduces 1–2 mandatory requirements, the intersection of `User1_Constraints ∩ User2_Constraints ∩ User3_Constraints` quickly results in an **empty result set (0 items found)**.
2. **Union Under-Constraining**: If filters are relaxed using `OR`, the platform returns thousands of candidates with zero ranking intelligence regarding who is sacrificing what.
3. **Absence of Preference Weighting**: A binary checkbox cannot represent that a feature is "desirable but negotiable" versus "a non-negotiable dealbreaker."

### 2.2 Failure Mode B: Social Dynamics and Friction
When forced to resolve differences manually, groups suffer from well-documented human negotiation pathologies:
1. **Anchoring & Dominance**: The most aggressive, vocal, or financially dominant person dictates the decision, leaving other participants resentful.
2. **Preference Concealment**: Less vocal participants conceal their true priorities to avoid family tension or interpersonal confrontation.
3. **Negotiation Fatigue & Default to Indecision**: After circulating dozens of browser tabs over WhatsApp or group chat, the group encounters fatigue and postpones the purchase indefinitely (abandoned transaction).
4. **Suboptimal Compromise**: The group selects a product that nobody actively hates, but nobody actually likes, minimizing aggregate joy.

### 2.3 Failure Mode C: The Unconstrained LLM Flaw
Attempting to solve group purchasing using a standard LLM chatbot (e.g., prompting a raw model with "Recommend a TV that satisfies these four people") introduces severe technical flaws:
1. **Hallucination of Parametric Specs**: LLMs routinely misstate refresh rates, input latency, warranty durations, and pricing.
2. **Nondeterminism**: Asking the same model twice yields different product rankings, destroying group trust.
3. **Invisible Constraint Dropping**: When faced with conflicting constraints, LLMs silently drop hard requirements (e.g., recommending a product exceeding a hard budget ceiling) without explicit user consent.
4. **Lack of Verifiable Fairness**: An LLM cannot provide a mathematical proof that Person C was not unfairly penalized to maximize the happiness of Person A and Person B.

---

## 3. Concrete Scenario: The Family Television

Consider a representative household seeking a shared television:

| Participant | Natural Language Input | Extracted Categorization | Underlying Dimension |
| :--- | :--- | :--- | :--- |
| **Dad** | *"I refuse to spend a single rupee over ₹50,000, and it must have at least 2 years of warranty."* | **Hard Constraint (Dealbreaker)** | `price <= 50000`, `warranty_years >= 2` |
| **Mom** | *"We've always had Samsung and it's worked great. I strongly prefer Samsung."* | **Soft Preference (High Weight)** | `brand == "Samsung"` (weight: 0.85) |
| **Son** | *"I'm hooking up my PS5, so 120Hz native refresh rate is essential for smooth gaming."* | **Soft Preference (High Weight / Stated as Hard)** | `refresh_rate_hz >= 120` (weight: 0.90) |
| **Daughter** | *"I care about how the living room looks. A sleek silver frame would be so much nicer than ugly black plastic."* | **Nice-to-Have (Low Weight)** | `bezel_color == "Silver"` (weight: 0.35) |

### Available Products in Catalog

```text
Product A: Samsung Crystal Ultra
- Price: ₹48,000
- Brand: Samsung
- Refresh Rate: 60Hz
- Color: Black
- Warranty: 2 Years

Product B: Samsung Neo QLED
- Price: ₹56,000
- Brand: Samsung
- Refresh Rate: 120Hz
- Color: Black
- Warranty: 3 Years

Product C: LG NanoCell Gaming
- Price: ₹49,000
- Brand: LG
- Refresh Rate: 120Hz
- Color: Silver
- Warranty: 2 Years
```

### The Conflict Matrix
- **Product A**: Satisfies Dad (₹48,000, 2 yr warranty), satisfies Mom (Samsung), satisfies Daughter's baseline, but fails Son's 120Hz requirement.
- **Product B**: Satisfies Mom (Samsung) and Son (120Hz), but **violates Dad's non-negotiable hard budget** (exceeds ₹50,000 by ₹6,000).
- **Product C**: Satisfies Dad (₹49,000, 2 yr warranty), Son (120Hz), and Daughter (Silver), but fails Mom's preferred brand (LG instead of Samsung).

### The Breakdown in Current Systems
- An **Amazon/Flipkart search filter** with `Samsung`, `<= ₹50k`, `120Hz` returns **0 items**.
- A **shared cart/list** causes an argument between Dad (refusing Product B) and Son (refusing Product A).
- Consenzo must identify that **Dad's constraint is a hard budget boundary**, while **Son's requirement is technically negotiable** if framed transparently, or present Product C as an alternative where Mom compromises on brand to satisfy Son and Daughter without exceeding budget.

---

## 4. Problem Statement Summary & Mathematical Reality

The problem can be formalized as finding an item $x \in \mathcal{C}$ from a catalog $\mathcal{C}$ that optimizes a multi-objective utility function across $M$ participants:

$$\max_{x \in \mathcal{C}} \quad \Phi\big(u_1(x), u_2(x), \dots, u_M(x)\big)$$

Subject to:
$$g_i(x) \le 0 \quad \forall i \in \text{HardConstraints}$$

Where:
- $u_m(x) \in [0, 10]$ is the satisfaction utility of participant $m$ for product $x$.
- $\Phi$ is a consensus aggregation operator balancing aggregate utility and dispersion (fairness).
- Hard constraints represent non-negotiable boundaries that prune the catalog before soft utility calculation.

Existing ecommerce platforms lack both the private preference elicitation interface to construct $u_m$ and the deterministic multi-agent optimization engine to compute $\Phi$. This is the exact technological void Consenzo fills.
