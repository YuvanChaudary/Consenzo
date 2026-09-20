# Consenzo — Group Decision Consensus Engine

<div align="center">

![Consenzo Banner](https://img.shields.io/badge/Consenzo-AI%20Consensus%20Engine-7C3AED?style=for-the-badge&logo=amazon&logoColor=white)

**Multi-agent collaborative purchasing platform powered by NVIDIA Nemotron AI, Amazon Web Services, and Mathematical Consensus Modeling.**

[![AWS Serverless](https://img.shields.io/badge/AWS-Serverless%20Architecture-FF9900?style=flat-square&logo=amazon-aws&logoColor=white)](https://aws.amazon.com)
[![NVIDIA AI](https://img.shields.io/badge/NVIDIA-Nemotron--3.5--30B-76B900?style=flat-square&logo=nvidia&logoColor=white)](https://build.nvidia.com)
[![React 18](https://img.shields.io/badge/React-18%20SPA-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![DynamoDB](https://img.shields.io/badge/Amazon-DynamoDB%20Single--Table-4053D6?style=flat-square&logo=amazon-dynamodb&logoColor=white)](https://aws.amazon.com/dynamodb/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker&logoColor=white)](https://www.docker.com/)

[🚀 Live Web App](http://consenzo-frontend-dev-501578625399.s3-website-us-east-1.amazonaws.com) • [📖 Setup Guide](SETUP.md) • [⚡ API Gateway Endpoint](https://0wc5as4rug.execute-api.us-east-1.amazonaws.com/dev/health)

</div>

---

## 📌 Problem & Vision

Group purchasing (e.g. buying a living room Smart TV with family, selecting engineering laptops with coworkers, or choosing home theater soundbars) suffers from:
1. **Asymmetric Social Dynamics**: Dominant personalities silence subtle requirements.
2. **Hidden Conflicting Constraints**: Hard budget ceilings collide with unnegotiated feature wishlists.
3. **Decision Fatigue**: Hours spent manually cross-referencing hundreds of catalog specs.

**Consenzo solves group decision-making through AI-assisted preference extraction and mathematical consensus optimization.** 

Every participant engages in a **private, adaptive AI interview** to discover their true priorities, constraints, and budget limits. Consenzo's **Deterministic Constraint & Consensus Engine** then analyzes all preferences across 150+ real Amazon products, detecting conflicts, applying fairness penalties, and computing unanimous, explainable purchase recommendations.

---

## 🏛️ System Architecture

```mermaid
flowchart TD
    subgraph ClientLayer["🖥️ Frontend Client Layer"]
        A["React 18 SPA (TypeScript + Vite)"] -->|Static Delivery| S3["Amazon S3 Website Hosting"]
        A -->|Encrypted JWT REST Calls| APIGW["Amazon API Gateway (HTTP API / CORS)"]
    end

    subgraph ComputeLayer["⚡ Serverless Backend Layer"]
        APIGW -->|Payload Proxy| Lambda["AWS Lambda (Node.js 20.x Monolith Router)"]
        Lambda -->|Auth & Routing| Router["Modular REST Router"]
        
        Router -->|1. Session Management| SessionSvc["Session & Roster Service"]
        Router -->|2. Private Dialogue| InterviewEngine["Adaptive Interviewer Engine"]
        Router -->|3. Consensus Engine| AnalysisSvc["Constraint & Utility Engine"]
        Router -->|4. Unanimous Voting| VotingSvc["Voting & Tally Service"]
    end

    subgraph DataAILayer["🧠 Data & AI Infrastructure"]
        InterviewEngine -->|Secrets Resolution| SecretsMgr["AWS Secrets Manager (consenzo/nvidia-api-key)"]
        SecretsMgr -->|API Key Injection| NvidiaAI["NVIDIA Nemotron-3.5-30B LLM (Inference)"]
        
        SessionSvc <-->|Single-Table PK/SK Queries| DynamoDB[("Amazon DynamoDB (consenzo-core-dev)")]
        AnalysisSvc <-->|Read/Write Constraints & Scores| DynamoDB
        VotingSvc <-->|Real-time Vote Tallies| DynamoDB
        
        AnalysisSvc -->|Domain Product Specs| Catalog["150+ Amazon Product Catalog (TVs, Laptops, Audio)"]
    end
```

---

## ✨ Key Features

### 1. 💬 Private Adaptive Discovery Interviewer
* Conversational AI interviews each group member independently so personal budget ceilings and honest feature preferences remain private.
* Powered by **NVIDIA Nemotron-3.5-Lightning-30B** with real-time intent extraction into structured numerical constraints (e.g., `priceInr <= 50000`, `refreshRateHz >= 120`, `ramGb >= 16`).

### 2. ⚖️ Mathematical Consensus & Conflict Engine
* Computes **Pareto-optimal** product recommendations using multi-attribute utility theory with **Nash Bargaining & Fairness Penalties**.
* Automatically detects contradictory hard constraints (e.g. Budget ceiling < Lowest price with required GPU) and generates grounded trade-off rationales.

### 3. 🎯 Transparent Recommendation Board & Unanimous Voting
* Ranked recommendations with transparent match badges (`BEST_CONSENSUS`, `LOWEST_CONFLICT`, `BEST_VALUE`).
* Live participant utility breakdown showing how each person's individual requirements are satisfied.
* Multi-user voting tally with unanimous decision validation.

### 4. 🛒 Multi-Category Amazon Product Catalog
* **Smart TVs & Displays**: 4K/8K, OLED/QLED, 120Hz gaming, Dolby Vision, HDMI 2.1 specs.
* **Laptops & Workstations**: RAM, CPU generations, dedicated GPUs, battery life, display size.
* **Soundbars & Home Audio**: Dolby Atmos, wireless subwoofers, HDMI eARC, multi-channel configurations.

---

## 🛠️ Technology Stack

| Domain | Technology / Service | Role in Consenzo |
| :--- | :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite, Vanilla CSS | Reactive modern dark UI, micro-animations, glassmorphism |
| **Serverless Compute** | AWS Lambda (Node.js 20.x, ZIP package) | High-performance monolithic API handler |
| **API Management** | Amazon API Gateway (HTTP API v2) | Low-latency routing, CORS pre-flight, and security |
| **Database** | Amazon DynamoDB (Single-Table Design) | Pay-per-request session, participant, and vote persistence |
| **AI / LLM** | NVIDIA Nemotron 3.5 Lightning (30B) | Natural language preference extraction & reasoning |
| **Secrets Management**| AWS Secrets Manager | Zero-plaintext key rotation & secure Lambda runtime injection |
| **Cloud Storage** | Amazon S3 Static Website Hosting | Scalable global web asset delivery |
| **Local Containerization** | Docker & Docker Compose | 1-command offline reproducible local environment |

---

## 🚀 Live AWS Deployment Details

| Component | Cloud Identifier / Live URL |
| :--- | :--- |
| **Live Web App** | [http://consenzo-frontend-dev-501578625399.s3-website-us-east-1.amazonaws.com](http://consenzo-frontend-dev-501578625399.s3-website-us-east-1.amazonaws.com) |
| **API Gateway** | `https://0wc5as4rug.execute-api.us-east-1.amazonaws.com/dev` |
| **Health Check** | [https://0wc5as4rug.execute-api.us-east-1.amazonaws.com/dev/health](https://0wc5as4rug.execute-api.us-east-1.amazonaws.com/dev/health) |
| **AWS Region** | `us-east-1` (US East - N. Virginia) |
| **DynamoDB Table** | `consenzo-core-dev` |
| **Lambda Handler** | `consenzo-backend-handler-dev` |

---

## 💻 Quick Start (Local Development)

### Prerequisites
* Node.js 20+
* npm 9+
* *(Optional)* Docker Desktop & AWS CLI

### 1. Clone & Install
```bash
git clone https://github.com/YuvanChaudary/Consenzo.git
cd Consenzo
npm install
```

### 2. Run Locally (Full-Stack Dev Server)
```bash
npm run dev
```
* **Frontend**: `http://localhost:5173`
* **Backend API**: `http://localhost:3001` (health check: `http://localhost:3001/health`)

### 3. Run with Docker Compose
```bash
docker compose up --build
```

For complete deployment and configuration instructions, see [SETUP.md](SETUP.md) and the [AWS Deployment Runbook](docs/98_AWS_DEPLOYMENT_GUIDE.md).

---

## 📄 License
Consenzo is open-source software licensed under the **MIT License**.
