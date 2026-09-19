# 05 — Consenzo Non-Goals & Explicit Exclusions

## Document Metadata
- **Document Type**: Explicit Exclusions & Risk Mitigation Boundary
- **Status**: Approved Foundation
- **Owner**: Lead Systems Architect & Technical PM
- **Dependencies**: [00_PROJECT_CHARTER.md](file:///d:/Consenzo%20amazon%20hackathon/docs/00_PROJECT_CHARTER.md), [04_MVP_SCOPE.md](file:///d:/Consenzo%20amazon%20hackathon/docs/04_MVP_SCOPE.md)
- **Downstream References**: [60_AWS_ARCHITECTURE.md](file:///d:/Consenzo%20amazon%20hackathon/docs/60_AWS_ARCHITECTURE.md), [68_STEP_FUNCTIONS.md](file:///d:/Consenzo%20amazon%20hackathon/docs/68_STEP_FUNCTIONS.md), [69_EVENTBRIDGE.md](file:///d:/Consenzo%20amazon%20hackathon/docs/69_EVENTBRIDGE.md), [110_DECISIONS.md](file:///d:/Consenzo%20amazon%20hackathon/docs/110_DECISIONS.md), [111_RISKS.md](file:///d:/Consenzo%20amazon%20hackathon/docs/111_RISKS.md)

---

## 1. Purpose of This Document

This document serves as an immutable contract specifying **what Consenzo will NOT build** during the hackathon lifecycle. In high-pressure hackathon environments, scope creep is the leading cause of project failure. 

By formally establishing explicit non-goals, the engineering team is shielded from low-leverage distractions, legal/compliance hurdles, and brittle external dependencies.

---

## 2. Explicit Non-Goals & Justifications

```
┌────────────────────────────────────────────────────────────────────────┐
│                        WHAT CONSENZO IS NOT                            │
├────────────────────────────────────────────────────────────────────────┤
│ ❌ Not an ecommerce storefront or marketplace                         │
│ ❌ Not a web scraper or crawling bot                                   │
│ ❌ Not a generic conversational shopping assistant (Rufus/ChatGPT clone)│
│ ❌ Not an autonomous purchasing bot with credit card execution        │
│ ❌ Not a distributed choreography testbed for unnecessary AWS services │
└────────────────────────────────────────────────────────────────────────┘
```

### 2.1 Commerce Execution & Financial Non-Goals
1. **No Amazon Login / Federated OAuth**: The MVP will not implement Amazon OAuth or IAM federated identity. User authentication is managed via lightweight, session-bound participant tokens. Implementing production OAuth introduces unnecessary redirect handling and token refresh overhead.
2. **No Amazon Checkout / Cart Insertion**: Consenzo does not programmatically insert items into an Amazon shopping cart or execute 1-Click purchasing. The final screen presents clear product ASINs and clean outbound links to Amazon.
3. **No Payment Processing or Split-Billing**: We will not integrate Stripe, Razorpay, or Amazon Pay UPI. Payment settlement is an orthogonal problem that dilutes focus from consensus resolution.
4. **No Autonomous Purchasing**: The system will never independently execute a monetary transaction without human confirmation.

### 2.2 Data Sourcing & Crawling Non-Goals
5. **No Live Web Scraping**: Live scraping of Amazon, Flipkart, or Best Buy product pages is strictly prohibited. Scraping introduces anti-bot blocking (Cloudflare/CAPTCHA), DOM selector instability, and latency spikes that routinely destroy live hackathon demonstrations.
6. **No Real-Time Worldwide Inventory Synchronization**: We will not attempt to synchronize fluctuating localized zip-code stock levels. The catalog operates on a deterministic static snapshot.
7. **No Multi-Category Breadth**: We will not support 20 different categories (laptops, cameras, blenders, shoes). Adding categories adds zero incremental proof of consensus and multiplies catalog authoring effort by 20x.

### 2.3 Platform & Client Non-Goals
8. **No Native Mobile Applications**: No iOS (Swift), Android (Kotlin), or React Native codebases. Consenzo is developed as a responsive Single-Page Web Application (SPA) optimized for mobile and desktop viewports.
9. **No Voice Assistant Interfaces**: We will not build an Alexa Skill, Google Assistant Action, or telephony IVR integration.

### 2.4 Machine Learning & AI Non-Goals
10. **No Custom Model Training or Fine-Tuning**: All AI functionality relies on zero-shot and few-shot in-context learning against foundational models accessed via the NVIDIA hosted API (`nvidia/llama-3.3-nemotron-super-49b-v1.5`). We will not train custom LoRA weights or host SageMaker training jobs.
11. **No LLM Product Ranking**: Large language models will NOT be allowed to score, sort, or rank products directly. Doing so violates the core project principle: *AI understands people; deterministic software decides the product.*
12. **No Open-Ended Shopping Chatbot**: Consenzo is not a general conversational agent answering questions like *"What is the history of television?"* The AI agent is strictly focused on eliciting preference parameters.

### 2.5 AWS Infrastructure Non-Goals
13. **No Premature AWS Orchestration (Step Functions / EventBridge)**: We will not force AWS Step Functions or Amazon EventBridge into the Day 1/Day 2 critical path unless asynchronous execution exceeds API Gateway timeout limits (which it does not for a 35-item catalog).
14. **No Strands / Multi-Agent Swarm Frameworks**: We will not implement unproven or bloated multi-agent coordination frameworks (e.g., Strands, AutoGen) merely because they are trendy. Clean Lambda functions calling the `LLMProvider` abstraction (NVIDIA hosted API) are simpler, faster, and far more reliable.
15. **No Graph Databases or Vector Search Clusters**: Storing 35 products in Amazon Neptune or OpenSearch Service is architectural malpractice. A JSON catalog evaluated in memory is $O(N)$ with $N=35$, executing in sub-5 milliseconds.

---

## 3. Summary of Boundaries

| Dimension | In-Scope (Approved) | Out-of-Scope (Non-Goal) |
| :--- | :--- | :--- |
| **Catalog** | 35 curated Smart TVs (static JSON) | Millions of scraped live products |
| **Scoring** | Deterministic TypeScript engine in Lambda | LLM generative sorting |
| **Users** | 2–4 participants per session | Enterprise teams of 50+ |
| **Session** | Ephemeral, shareable link + PIN | Full Cognito social auth & password resets |
| **Checkout** | Outbound product links + ASINs | In-app split payment & cart injection |
| **Cloud** | Amplify + API GW + Lambda + DynamoDB + S3 + Secrets Manager + NVIDIA | Step Functions, EventBridge, Neptune, SageMaker |
