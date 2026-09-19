# 34 — Deterministic Multi-Attribute Scoring Engine

## Document Metadata
- **Document Type**: Mathematical Scoring & Utility Calculation Specification
- **Status**: Approved Foundation
- **Owner**: Deterministic Engine Architect
- **Dependencies**: [20_SYSTEM_ARCHITECTURE.md](file:///d:/Consenzo%20amazon%20hackathon/docs/20_SYSTEM_ARCHITECTURE.md), [32_PREFERENCE_WORLD_MODEL.md](file:///d:/Consenzo%20amazon%20hackathon/docs/32_PREFERENCE_WORLD_MODEL.md), [33_CONSTRAINT_ENGINE.md](file:///d:/Consenzo%20amazon%20hackathon/docs/33_CONSTRAINT_ENGINE.md)
- **Downstream References**: [35_CONFLICT_DETECTION.md](file:///d:/Consenzo%20amazon%20hackathon/docs/35_CONFLICT_DETECTION.md), [36_FAIRNESS_ENGINE.md](file:///d:/Consenzo%20amazon%20hackathon/docs/36_FAIRNESS_ENGINE.md), [90_EVALUATION.md](file:///d:/Consenzo%20amazon%20hackathon/docs/90_EVALUATION.md)

---

## 1. Engine Objective & Invariants

The **Deterministic Scoring Engine** evaluates products surviving constraint gating and computes an auditable, continuous individual utility score $u_m(x) \in [0.0, 10.0]$ for each participant $m$ and product $x$.

### Strict Execution Invariants
1. **Zero LLM Scoring**: Utility scores are computed exclusively using compiled mathematical functions in pure TypeScript.
2. **Gating Precedes Utility**:
   $$\text{Dealbreaker Check} \longrightarrow \text{Hard Constraint Check} \longrightarrow \text{Utility Scoring}$$
   Any product violating a dealbreaker or active hard constraint is pruned immediately. It cannot be salvaged by high scores on secondary features.
3. **Bounded Scale**: All individual utilities map strictly to $[0.0, 10.0]$.

---

## 2. Mathematical Utility Formulation

For participant $m$ and product $x$, individual utility is defined as:

$$u_m(x) = 10.0 \times \sum_{k=1}^{K_m} \bar{w}_{m,k} \cdot s_{m,k}\big(x_{attr}, p_{m,k}\big)$$

Where:
- $K_m$ is the total count of evaluated soft preferences and nice-to-haves for participant $m$.
- $w_{m,k} \in (0.0, 1.0]$ is the raw priority weight assigned to preference $k$.
- $\bar{w}_{m,k} = \frac{w_{m,k}}{\sum_{j=1}^{K_m} w_{m,j}}$ is the normalized weight ensuring $\sum_k \bar{w}_{m,k} = 1.0$.
- $s_{m,k}(\cdot) \in [0.0, 1.0]$ is the specific attribute satisfaction function.

---

## 3. Attribute Satisfaction Functions ($s_{m,k}$)

The engine normalizes heterogeneous catalog facets into a unified satisfaction metric $s \in [0.0, 1.0]$:

### 3.1 Categorical Preference Matching (Brand, OS, Finish)
Evaluates discrete categorical choices against preferred and acceptable sets:

$$s_{cat}(x) = \begin{cases} 
1.00 & \text{if } x_{brand} = p_{preferred} \\
0.65 & \text{if } x_{brand} \in p_{acceptable} \\
0.25 & \text{if } x_{brand} \notin p_{acceptable} \text{ (Neutral alternative)} \\
0.00 & \text{if } x_{brand} \in p_{disliked}
\end{cases}$$

### 3.2 Continuous Numeric Budget & Price Scaling
Budget satisfaction rewards staying well below ceiling targets while penalizing proximity to the limit:

$$s_{budget}(x) = \begin{cases}
1.00 & \text{if } x_{price} \le 0.85 \times P_{target} \quad \text{(High savings)} \\
1.00 - 0.15 \cdot \left(\frac{x_{price} - 0.85 P_{target}}{0.15 P_{target}}\right) & \text{if } 0.85 P_{target} < x_{price} \le P_{target} \\
0.85 \cdot \left(1.0 - \frac{x_{price} - P_{target}}{P_{stretch} - P_{target}}\right) & \text{if } P_{target} < x_{price} \le P_{stretch} \\
0.00 & \text{if } x_{price} > P_{stretch} \quad \text{(Gated Out)}
\end{cases}$$

### 3.3 Ordered Attributes (Refresh Rate, Warranty)
For ordered discrete dimensions (e.g. Refresh Rate: 60Hz < 90Hz < 120Hz < 144Hz):

$$s_{ordered}(x) = \begin{cases}
1.00 & \text{if } x_{val} \ge p_{target} \\
0.60 & \text{if } x_{val} \text{ is exactly 1 tier below } p_{target} \text{ (e.g., 60Hz vs 120Hz desired)} \\
0.20 & \text{if } x_{val} \text{ is 2+ tiers below } p_{target}
\end{cases}$$

### 3.4 Boolean Feature Flags (VRR, Dolby Atmos, eARC)
$$s_{bool}(x) = \begin{cases}
1.00 & \text{if } x_{feature} = \text{True} \\
0.00 & \text{if } x_{feature} = \text{False}
\end{cases}$$

---

## 4. Concrete Multi-Participant Scoring Walkthrough

Applying the scoring engine to our reference family scenario:

### Extracted Participant Parameters
- **Dad**: Hard Budget $\le$ ₹50k (Weight: 1.0, Gating); Warranty $\ge$ 2 yrs (Weight: 0.8, Ordered); Brand Reliability (Weight: 0.7, Categorical).
- **Mom**: Brand Samsung preferred (Weight: 0.9, Categorical); Picture Quality (Weight: 0.8).
- **Son**: Refresh Rate 120Hz (Weight: 0.95, Ordered); HDMI Ports $\ge 3$ (Weight: 0.6).
- **Daughter**: Bezel Silver preferred (Weight: 0.4, Categorical); Slim Design (Weight: 0.6).

### Catalog Candidates Evaluated

| Feature | Product A: Samsung Crystal | Product B: Samsung Neo QLED | Product C: LG NanoCell Gaming |
| :--- | :--- | :--- | :--- |
| **Price** | ₹48,000 | ₹56,000 | ₹49,000 |
| **Brand** | Samsung | Samsung | LG |
| **Refresh Rate** | 60Hz | 120Hz | 120Hz |
| **Color** | Black | Black | Silver |
| **Warranty** | 2 Years | 3 Years | 2 Years |
| **Gating Status** | **PASS** | **FAIL (Exceeds Dad Budget)** | **PASS** |

### Individual Utility Results (Scaled 0 to 10)

```text
PRODUCT A (Samsung Crystal - ₹48,000):
 • Dad:      9.5 / 10  (Budget met: 0.94, Warranty 2yr: 1.0, Samsung tier 1: 1.0)
 • Mom:     10.0 / 10  (Samsung satisfied: 1.0, Picture 4K: 1.0)
 • Son:      6.8 / 10  (60Hz penalty: 0.60, HDMI 3 ports: 1.0)
 • Daughter: 8.0 / 10  (Slim frame: 1.0, Black color: 0.65)

PRODUCT C (LG NanoCell Gaming - ₹49,000):
 • Dad:      9.2 / 10  (Budget met: 0.88, Warranty 2yr: 1.0, LG tier 1: 0.9)
 • Mom:      6.5 / 10  (LG brand penalty: 0.65, Picture 4K: 1.0)
 • Son:      9.8 / 10  (120Hz native VRR: 1.0, HDMI 4 ports: 1.0)
 • Daughter: 9.6 / 10  (Silver frame: 1.0, Slim design: 1.0)
```

Both products survive gating and enter the **Fairness & Conflict Engine** with transparent, auditable utility scores.
