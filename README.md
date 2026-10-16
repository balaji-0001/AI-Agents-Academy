# 🚀 AI Agents Academy & Real-Time Technical Interview Platform

[![Frontend (Vercel)](https://img.shields.io/badge/Vercel-Frontend%20Live-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://ai-agents-academy-tau.vercel.app)
[![Backend (Render)](https://img.shields.io/badge/Render-Backend%20Live-46E3B7?style=for-the-badge&logo=render&logoColor=black)](https://ai-agents-academy-backend.onrender.com)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/balaji-0001/AI-Agents-Academy)
[![React 19](https://img.shields.io/badge/React%2019-v19.2-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TanStack Start](https://img.shields.io/badge/TanStack%20Start-Fullstack-FF4154?style=for-the-badge&logo=tanstack&logoColor=white)](https://tanstack.com/start)
[![Gemini API](https://img.shields.io/badge/Google%20Gemini-3.8%20Live-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)

A modern, production-grade **AI Engineering Learning & Interview Preparation Platform** designed for developers, ML engineers, and architects mastering **AI Agents, Multi-Agent Systems, LangGraph, Model Context Protocol (MCP), Advanced RAG, and LLM Infrastructure**.

Featuring a **human-like, real-time bidirectional voice interview simulator** powered by Google Gemini, a **250+ senior interview question bank**, **10 production architecture project labs**, and an **interactive AI tutor**.

---

## 🌐 Live Deployments & Links

| Component | Platform | Environment | Live URL |
| :--- | :--- | :--- | :--- |
| 🖥️ **Frontend App** | **Vercel** | Production Edge Serverless | [https://ai-agents-academy-tau.vercel.app](https://ai-agents-academy-tau.vercel.app) |
| ⚙️ **Backend Service** | **Render** | Production Cloud Web Service | [https://ai-agents-academy-backend.onrender.com](https://ai-agents-academy-backend.onrender.com) |
| 📦 **GitHub Repository** | **GitHub** | `main` branch | [https://github.com/balaji-0001/AI-Agents-Academy](https://github.com/balaji-0001/AI-Agents-Academy) |

---

## ✨ Key Features

### 🎙️ 1. Real-Time Conversational Voice Mock Interviews
- **True Conversational Flow**: Speak naturally without pressing "Submit Answer" after every sentence.
- **Instant Barge-In / Interruption**: Sub-20ms interruption handling that immediately silences the AI when the candidate speaks, adapting to follow-up questions and clarifications.
- **Smart Turn Completion Detection**: Dynamic 1,600ms–2,300ms pause buffer ensures the AI never interrupts you mid-sentence while formulating technical thoughts.
- **7 Distinct Interviewer Personalities**:
  - ☕ **Chill & Casual**: Relaxed, low-stress tech lead vibe in natural Indian English.
  - 😂 **Funny & Playful**: Light banter and relatable Indian tech analogies (Bangalore traffic, chai breaks).
  - 🛡️ **Strict & Rigorous**: High engineering bar, zero hand-waving or buzzwords.
  - 🔥 **Angry / Tough Boss**: High-pressure scenario simulation testing architecture resilience under duress.
  - 🤝 **Friendly Mentor**: Patient, supportive guidance with hints and step-by-step explanations.
  - 💼 **Professional Standard**: Tier-1 corporate technical interview format (Google/Microsoft India style).
  - 🔀 **Random Dynamic Mix**: Spontaneously modulates tone based on answer quality.
- **Persistent Session Memory**: Remembers past answers, mentioned frameworks, projects, and past mistakes throughout the interview, asking contextual follow-up questions.
- **Smart Pedagogical Correction**: If an answer is incomplete or incorrect, the interviewer politely challenges it, allows a retry, and clearly teaches the correct concept with a practical real-world example.

### 📚 2. Master Question Vault (250+ Questions)
- **Deep Technical Breadth**:
  - **Python Core & Concurrency (95 Questions)**: PyMalloc memory allocation, Generational GC, Descriptor Protocol, Metaclasses vs `__init_subclass__`, `asyncio` event loop internals, `contextvars`, GIL.
  - **DSA Patterns**: LRU & LFU Cache in $O(1)$, Sliding Window Maximum (Monotonic Queue), Union-Find (DSU) with Path Compression, Topological Sort (Kahn's BFS), Binary Tree Max Path Sum.
  - **AI Agents & Multi-Agent (42 Questions)**: ReAct loops, LangGraph state channels & reducers, Human-in-the-Loop breakpoints (`interrupt_before`), Supervisor vs Peer-to-Peer routing, Reflexion loops, Mem0/Zep episodic memory.
  - **Model Context Protocol (MCP) (15 Questions)**: Host vs Client vs Server, stdio vs Streamable HTTP transports, Tools vs Resources vs Prompts primitives, JSON-RPC 2.0 error protocols, dynamic tool discovery.
  - **Advanced RAG & Vector DBs (25 Questions)**: ColBERT late interaction (`MaxSim`), Microsoft GraphRAG (Leiden community clustering), Self-RAG reflection tokens, Corrective RAG (CRAG), HyDE, HNSW vs IVF-PQ indexing, Reciprocal Rank Fusion (RRF).
  - **System Design & LLM Serving (28 Questions)**: vLLM PagedAttention KV-cache optimization, Speculative Decoding, FlashAttention tiling, 10M-doc enterprise RAG architecture, distributed rate limiting with Redis Lua.
  - **AI Safety & Evals (25 Questions)**: OWASP Top 10 for LLMs, Dual-LLM security architectures, Canary Token defense, Anthropic Eval Framework (`pass@k` vs `pass^k`), RAGAS 4 core metrics.
- **Interactive Practice**: In-card evaluation scoring against key technical concepts, bookmarking to `localStorage`, and 1-click clipboard copy.

### 🛠️ 3. Production Project Lab (10 Blueprint Workspaces)
Each project features architecture node diagrams, tech stacks, file tree explorers, starter code, and persistent milestone checklists:
1. **Production RAG Assistant with Hybrid Search**: Dense embeddings + BM25 reciprocal rank fusion, cross-encoder reranking.
2. **ReAct Agent with Bounded Loop & Sandboxing**: Think-Act-Observe loop in Python with strict step limits and Pydantic tool schemas.
3. **MCP Server over Streamable HTTP**: Stateless tool server implementing OAuth 2.1, PKCE, and Tasks primitives.
4. **Autonomous Support Agent with Risk Tiers**: Customer agent with automated refund thresholds and human-in-the-loop approval gates.
5. **LangGraph Multi-Agent Team with Checkpoints**: Supervisor and worker pattern with shared typed state and SQLite persistence.
6. **Anthropic-Style Agent Evaluation Harness**: Automated test harness measuring `pass^k` reliability.
7. **OpenTelemetry GenAI Observability Pipeline**: Distributed tracing with `gen_ai.*` semantic conventions.
8. **Model Gateway with Semantic Caching & Fallbacks**: Redis semantic caching with prompt prefix caching and circuit breakers.
9. **Vector Search Engine with In-Memory HNSW**: Graph-based Approximate Nearest Neighbor search with cosine similarity.
10. **Prompt Injection Defense & Guardrail Pipeline**: Multi-layer defense with regex pre-filters, PII redaction, and schema validation.

### 💬 4. Interactive Gemini AI Tutor
- Streaming technical tutor with level selection (Beginner, Intermediate, Advanced).
- Explains concepts with real-world analogies, internal mechanics, and executable Python code snippets.

### 🔐 5. SaaS Authentication & User Profiles
- Dual-mode sign in (Social 1-click OAuth for Google/GitHub + Email/Password toggle).
- Persistent session profile synced across header, sidebar, and workspace progress.

---

## 🛠️ Architecture & Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | [TanStack Start](https://tanstack.com/start) (Full-stack React with SSR) |
| **UI Library** | [React 19](https://react.dev/), [Radix UI](https://www.radix-ui.com/), [Lucide React](https://lucide.dev/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) |
| **AI Integration** | [Google Gemini API](https://ai.google.dev/) (`gemini-3.8-flash` & `gemini-3.8-live` cascade) |
| **Speech & Audio** | Web Audio API (`AnalyserNode` waveform reactivity), Web Speech API (`SpeechRecognition` & `SpeechSynthesis`) |
| **Diagrams & Math** | [Mermaid.js](https://mermaid.js.org/), [KaTeX](https://katex.org/) |
| **State & Data** | [TanStack Query v5](https://tanstack.com/query), `localStorage` persistence |
| **Build & SSR** | [Vite 8](https://vitejs.dev/), [Nitro](https://nitro.unjs.io/) (Cloudflare Pages/Workers ready) |
| **Package Manager** | [Bun](https://bun.sh/) / Node.js |

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v20+ recommended) or [Bun](https://bun.sh/) (v1.2+)
- A [Google Gemini API Key](https://aistudio.google.com/app/apikey)

### 1. Clone the Repository
```bash
git clone https://github.com/balaji-0001/ai-agents-academy.git
cd ai-agents-academy
```

### 2. Install Dependencies
```bash
bun install
# or
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory:
```bash
cp .env.example .env
```
Add your Google Gemini API key:
```env
GEMINI_API_KEY=your_gemini_api_key_here
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

### 4. Run Development Server
```bash
bun run dev
# or
npm run dev
```
Open your browser at [http://localhost:8080](http://localhost:8080).

---

## 🧪 Testing & Building

### Run Unit Tests
```bash
bun run test
# or
npm test
```
Runs the Vitest test suite testing theme persistence, routing, and Mermaid diagram sanitization.

### Production Build
```bash
bun run build
# or
npm run build
```
Compiles static client assets and bundles the server entry with Nitro for zero-latency edge deployment.

---

## 📂 Project Structure

```
├── public/                 # Static assets and icons
├── src/
│   ├── components/         # Reusable UI & Academy components
│   │   ├── academy/        # Core app layout, header, sidebar
│   │   │   ├── voice/      # Live Voice Orb, Personality selector, Session view
│   │   │   └── learning/   # Interactive quizzes, interview accordions
│   │   └── ui/             # Radix primitives (button, dialog, select, etc.)
│   ├── lib/                # Business logic & data
│   │   ├── academy-data.ts # Master curriculum modules & lesson outlines
│   │   ├── auth.ts         # User auth hook & persistent session management
│   │   ├── gemini.ts       # Gemini API client, answer evaluator, tutor
│   │   ├── gemini-live.ts  # Real-time Voice engine, turn debounce & session memory
│   │   ├── project-details.ts # Rich architecture blueprints for 10 projects
│   │   └── questions/      # 250+ modular interview question packs
│   ├── routes/             # TanStack file-based routing
│   │   ├── index.tsx       # Platform dashboard & curriculum roadmap
│   │   ├── interviews.tsx  # Live voice & text mock interview studio
│   │   ├── questions.tsx   # Searchable 250+ question bank with self-eval
│   │   ├── projects.tsx    # Interactive architectural project lab
│   │   ├── tutor.tsx       # Live Gemini AI tutor chat
│   │   ├── login.tsx       # Two-column auth & profile management
│   │   └── settings.tsx    # API key configuration & audio settings
│   └── test/               # Vitest unit & integration tests
├── .env.example            # Environment template
├── package.json            # Dependencies & build scripts
└── vite.config.ts          # Vite & TanStack Start build configuration
```

---

## 🛡️ AI Safety & Responsible Use
- **Secure Key Handling**: Keys are managed through environment variables or browser-local secure storage; credentials are never leaked to public logs or third-party tracking.
- **Non-Humiliating Feedback**: Built-in pedagogical guardrails prevent condescending or robotic "Wrong Answer" rejections, prioritizing positive Indian technical mentorship and actionable knowledge transfer.

---

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.

---

**Developed with ❤️ for the AI Engineering Community.**
