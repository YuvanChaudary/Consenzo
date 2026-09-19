# 36 — Group Fairness & Consensus Optimization Engine

## Document Metadata
- **Document Type**: Core Mathematical Optimization Specification
- **Status**: Approved Foundation
- **Owner**: Lead Algorithm Architect & Systems Engineer
- **Dependencies**: [20_SYSTEM_ARCHITECTURE.md](file:///d:/Consenzo%20amazon%20hackathon/docs/20_SYSTEM_ARCHITECTURE.md), [33_CONSTRAINT_ENGINE.md](file:///d:/Consenzo%20amazon%20hackathon/docs/33_CONSTRAINT_ENGINE.md), [34_SCORING_ENGINE.md](file:///d:/Consenzo%20amazon%20hackathon/docs/34_SCORING_ENGINE.md), [35_CONFLICT_DETECTION.md](file:///d:/Consenzo%20amazon%20hackathon/docs/35_CONFLICT_DETECTION.md)
- **Downstream References**: [70_API_CONTRACTS.md](file:///d:/Consenzo%20amazon%20hackathon/docs/70_API_CONTRACTS.md), [93_CONSENZO_BENCHMARK.md](file:///d:/Consenzo%20amazon%20hackathon/docs/93_CONSENZO_BENCHMARK.md), [110_DECISIONS.md](file:///d:/Consenzo%20amazon%20hackathon/docs/110_DECISIONS.md)

---

## 1. Problem Statement: The Fallacy of Average Happiness

In multi-stakeholder purchasing, the naive objective—**maximizing the mean utility $\frac{1}{M}\sum u_m$**—produces severe social failure known as the **"Tyranny of the Majority"**.

### Concrete Failure Demonstration
Consider a 4-person household choosing between two products:
- **Product X**: Dad = 9.8, Mom = 9.8, Daughter = 9.8, Son = 2.0.
  $$\bar{u}(X) = \frac{9.8 + 9.8 + 9.8 + 2.0}{4} = \mathbf{7.85 / 10}$$
- **Product Y**: Dad = 7.8, Mom = 7.8, Daughter = 7.8, Son = 7.5.
  $$\bar{u}(Y) = \frac{7.8 + 7.8 + 7.8 + 7.5}{4} = \mathbf{7.725 / 10}$$

Under a standard utilitarian average, **Product X wins** (7.85 > 7.725). However, Product X completely alienates the Son (who gets a miserable 2.0), breeding resentment and post-purchase remorse. Product Y represents an immensely superior group consensus where everyone is genuinely satisfied (all $\ge 7.5$), yet standard algorithms discard it.

Consenzo is explicitly engineered to solve this exact mathematical defect.

---

## 2. Comparative Evaluation of Fairness Formulations

To select the optimal mathematical model for the 48-hour MVP, we evaluate three major theoretical paradigms:

```text
 ┌──────────────────────────┬──────────────────────────┬──────────────────────────┐
 │  APPROACH A: DISPERSION  │   APPROACH B: NASH       │   APPROACH C: MAXIMIN    │
 │    PENALIZED MEAN        │   BARGAINING PRODUCT     │   (RAWLSIAN EGALITARIAN) │
 ├──────────────────────────┼──────────────────────────┼──────────────────────────┤
 │ G(p) = ū(p) - λ·σ(p)     │ G(p) = ∏ max(u_i - d, ε) │ G(p) = min(u_i)          │
 │                          │                          │                          │
 │ Pros:                    │ Pros:                    │ Pros:                    │
 │ • Intuitive & explainable│ • Naturally punishes low │ • Absolute protection of │
 │ • Clean tuning via λ     │   outliers to zero       │   the worst-off person   │
 │ • Preserves mean scale   │ • Scale-invariant ratios │                          │
 │                          │                          │ Cons:                    │
 │ Cons:                    │ Cons:                    │ • Blind to improvements  │
 │ • Can allow outlier if   │ • Hard to explain product│   for the other (M-1)    │
 │   other (M-1) scores are │   formula to families    │   participants           │
 │   near 10.0              │ • Sensitive to baseline d│ • Severe utility waste   │
 └──────────────────────────┴──────────────────────────┴──────────────────────────┘
```

---

## 3. Selected Model: The Consenzo Hybrid Fairness Engine (ADR-006 Resolution)

For the production MVP, Consenzo selects a **Three-Tier Hybrid Consensus Operator** that combines a Rawlsian Maximin utility floor with a dispersion-penalized utilitarian score.

### Mathematical Definition
For a product $x \in \mathcal{F}_0$ evaluated across $M$ participants with individual utilities $u_1(x), \dots, u_M(x) \in [0.0, 10.0]$:

#### Tier 1: Maximin Quality Floor
Any candidate that drives any participant's satisfaction below the survival threshold ($u_{floor} = 4.0$) is penalized with an asymptotic barrier:

$$u_{min}(x) = \min_{m=1 \dots M} u_m(x)$$

$$\text{FloorPenalty}(x) = \begin{cases}
0.0 & \text{if } u_{min}(x) \ge 4.0 \\
2.5 \times (4.0 - u_{min}(x))^2 & \text{if } u_{min}(x) < 4.0
\end{cases}$$

#### Tier 2: Dispersion-Penalized Consensus Function
$$S_{group}(x) = \bar{u}(x) - \lambda \cdot \sigma\big(u(x)\big) - \text{FloorPenalty}(x)$$

Where:
- $\bar{u}(x) = \frac{1}{M} \sum_{m=1}^M u_m(x)$ is the group mean utility.
- $\sigma(u(x)) = \sqrt{\frac{1}{M} \sum_{m=1}^M (u_m(x) - \bar{u}(x))^2}$ is the population standard deviation measuring interpersonal disagreement.
- $\lambda = 0.50$ is the calibrated fairness weighting coefficient.

---

## 4. Empirical Evaluation on Reference Family Scenario

Evaluating our candidate products under the Consenzo Hybrid Engine:

### Product A: Samsung Crystal (₹48,000)
- Individual Scores: Dad = 9.5, Mom = 10.0, Son = 6.8, Daughter = 8.0
- $\bar{u} = \frac{9.5 + 10.0 + 6.8 + 8.0}{4} = \mathbf{8.575}$
- Deviation: $\sigma \approx 1.258$
- Min Utility: $u_{min} = 6.8 \ge 4.0 \implies \text{FloorPenalty} = 0.0$
- Fairness Penalty: $\lambda \cdot \sigma = 0.50 \times 1.258 = \mathbf{0.629}$
- **Net Consensus Score**: $8.575 - 0.629 = \mathbf{7.946 / 10}$

### Product C: LG NanoCell Gaming (₹49,000)
- Individual Scores: Dad = 9.2, Mom = 6.5, Son = 9.8, Daughter = 9.6
- $\bar{u} = \frac{9.2 + 6.5 + 9.8 + 9.6}{4} = \mathbf{8.775}$
- Deviation: $\sigma \approx 1.341$
- Min Utility: $u_{min} = 6.5 \ge 4.0 \implies \text{FloorPenalty} = 0.0$
- Fairness Penalty: $\lambda \cdot \sigma = 0.50 \times 1.341 = \mathbf{0.670}$
- **Net Consensus Score**: $8.775 - 0.670 = \mathbf{8.105 / 10}$

### Ranking Outcome & Social Interpretation
1. **Rank #1: Product C (LG NanoCell) — Score: 8.11 / 10**
   - High satisfaction across 3 participants (9.2, 9.8, 9.6) with Mom at an acceptable 6.5.
2. **Rank #2: Product A (Samsung Crystal) — Score: 7.95 / 10**
   - Ideal for Mom and Dad (10.0, 9.5), but Son accepts a compromise on gaming (6.8).

---

## 5. Pareto Multi-Candidate Framing for Shared Board

The engine does not output only a single winner. It constructs a **Pareto Frontier Set** of candidate alternatives:

```text
┌────────────────────────┬────────────────────────────────────────────────────────┐
│ Candidate Tag          │ Algorithmic Selection Criteria                         │
├────────────────────────┼────────────────────────────────────────────────────────┤
│ 1. BEST_CONSENSUS      │ Global maximizer of S_group (Rank #1 recommendation)   │
├────────────────────────┼────────────────────────────────────────────────────────┤
│ 2. LOWEST_CONFLICT     │ Minimizer of σ(u) (Most equal happiness distribution)   │
├────────────────────────┼────────────────────────────────────────────────────────┤
│ 3. BEST_VALUE          │ Maximizer of S_group / price_inr (Highest ROI)         │
├────────────────────────┼────────────────────────────────────────────────────────┤
│ 4. STAKEHOLDER_TOP_PICK│ Maximizer for specific individual (e.g. Dad's #1)       │
└────────────────────────┴────────────────────────────────────────────────────────┘
```

The UI displays the Top 2–3 items (e.g. `BEST_CONSENSUS` and `LOWEST_CONFLICT`), giving the group transparent choices rather than an authoritarian mandate.

---

## 6. Grounded Explanation Contract

The fairness engine outputs exact mathematical metrics to the LLM Provider (NVIDIA API):

```json
{
  "recommendedProduct": "prod_lg_nanocell_49",
  "netConsensusScore": 8.11,
  "meanUtility": 8.78,
  "fairnessPenalty": 0.67,
  "individualBreakdown": {
    "Dad": 9.2,
    "Mom": 6.5,
    "Son": 9.8,
    "Daughter": 9.6
  },
  "compromiseSummary": "Mom compromises on preferred brand (LG instead of Samsung, scoring 6.5), which unlocks 120Hz native gaming for Son (9.8) and Silver finish for Daughter (9.6) while maintaining Dad's budget ceiling (9.2)."
}
```

> **Anti-Hallucination Law**: The LLM Provider converts these exact numbers into plain English prose. It is mathematically forbidden from re-calculating or modifying any score.
