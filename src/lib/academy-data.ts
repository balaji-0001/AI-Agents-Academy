export type Lesson = { id: string; title: string; minutes: number };
export type Module = { id: number; title: string; level: "Beginner" | "Intermediate" | "Advanced"; lessons: Lesson[] };

const L = (m: number, titles: string[]): Lesson[] =>
  titles.map((t, i) => ({ id: `m${m}-l${i + 1}`, title: t, minutes: 15 + ((i * 5) % 15) }));

export const MODULES: Module[] = [
  { id: 1, title: "Python & Data Engineering", level: "Beginner", lessons: L(1, ["Python syntax & object model (mutability)", "Collections: Counter, defaultdict, deque", "NumPy vectorisation & broadcasting", "Numerical stability in Softmax & linear algebra", "Pandas pipelines & data leakage prevention", "Asyncio, queues & concurrent I/O"]) },
  { id: 2, title: "DSA & Problem Solving", level: "Beginner", lessons: L(2, ["Big O notation & complexity trade-offs", "Two pointers & sliding window patterns", "Prefix sums & hash map patterns", "Trees, traversals & binary search trees", "Heaps, priority queues & running medians", "Graphs: BFS, DFS & topological sort", "Dynamic programming & memoisation", "Tries & prefix lookups"]) },
  { id: 3, title: "ML, Math & Transformers", level: "Beginner", lessons: L(3, ["Bias-variance trade-off & regularisation", "Precision vs recall & imbalanced classification", "Scaled dot-product attention & sqrt(d_k)", "Self-attention derivation & O(n^2) cost", "Encoder vs decoder (BERT vs GPT)", "Pretraining, scaling laws & Chinchilla", "KV-cache memory formula & long context", "LoRA rank derivation & PEFT fine-tuning"]) },
  { id: 4, title: "Prompt Engineering & Structured Outputs", level: "Beginner", lessons: L(4, ["Role, task, delimiters & constraints", "Zero-shot, few-shot & in-context learning", "Chain-of-thought & self-consistency", "Schema-constrained JSON & Pydantic validation", "Prompt injection & prompt versioning (PromptOps)"]) },
  { id: 5, title: "AI Agent Fundamentals", level: "Intermediate", lessons: L(5, ["What is an AI Agent? (Think-Act-Observe)", "Workflows vs Agents (Anthropic framework)", "The Autonomy Ladder & token costs", "ReAct loop & step termination limits", "Compound error rates: 0.95^10 intuition", "Tools & Agent-Computer Interface (ACI)"]) },
  { id: 6, title: "Building Agents from Scratch", level: "Intermediate", lessons: L(6, ["LLM function calling loop in Python", "Typed tool interfaces & Pydantic schemas", "Tool registries, dispatch & sandboxing", "Handling tool failures & retries with backoff", "Mock testing & deterministic execution"]) },
  { id: 7, title: "Production RAG Systems", level: "Intermediate", lessons: L(7, ["End-to-end RAG architecture & pipelines", "Structure-aware chunking & context size", "Dense, sparse (BM25) & hybrid retrieval", "Reciprocal Rank Fusion (RRF) & reranking", "Document access control & ACL filtering", "RAG failure modes: retrieval vs generation", "Advanced RAG: HyDE, parent-child & GraphRAG"]) },
  { id: 8, title: "Memory & Context Engineering", level: "Intermediate", lessons: L(8, ["Working, session, long-term & episodic memory", "Context rot & the finite attention budget", "Just-in-time retrieval & tool result clearing", "Compaction flows & structured note-taking", "Memory poisoning & privacy safeguards"]) },
  { id: 9, title: "Workflow Patterns & LangGraph", level: "Intermediate", lessons: L(9, ["Prompt chaining & programmatic checks", "Routing & model cascades (cost optimisation)", "Parallelisation: sectioning & voting", "Orchestrator-workers pattern", "Evaluator-optimiser loop", "LangGraph: state, nodes, edges & checkpoints"]) },
  { id: 10, title: "Multi-Agent Systems", level: "Advanced", lessons: L(10, ["Single vs multi-agent: Anthropic research benchmarks", "15x token multiplier & when multi-agent fits", "Supervisor-worker & hierarchical delegation", "Shared state & context fragmentation risks", "Ping-pong loops & termination criteria"]) },
  { id: 11, title: "Model Context Protocol (MCP)", level: "Advanced", lessons: L(11, ["Why MCP: M apps + N tools integration", "Architecture: Host, Client, Server & Primitives", "Transports: stdio vs Streamable HTTP", "Deprecation of SSE in favor of Streamable HTTP", "OAuth 2.1, PKCE & Resource Indicators (RFC 8707)", "MCP Tasks primitive for async/long-running tools", "Security: tool poisoning & least privilege"]) },
  { id: 12, title: "AI Evals & Testing Harnesses", level: "Advanced", lessons: L(12, ["Anthropic eval framework: Task, Trial, Transcript, Outcome, Grader", "Code-based, model-based & human graders", "Capability evals vs regression evals", "Non-determinism: pass@k vs pass^k math", "Designing golden test suites (20-50 tasks)", "RAGAS 4 core metrics & Agent-as-a-Judge", "CI/CD eval gates & regression prevention"]) },
  { id: 13, title: "Observability & Traceability", level: "Advanced", lessons: L(13, ["The 3 pillars: metrics, logs & traces in GenAI", "OpenTelemetry GenAI conventions (gen_ai.*)", "W3C Trace Context & distributed span trees", "Session vs trace vs span in conversational AI", "Head & tail sampling strategies for cost control", "Replay-from-trace regression testing"]) },
  { id: 14, title: "Production Monitoring & Reliability", level: "Advanced", lessons: L(14, ["LLM API SLOs (TTFT, TPS) & error budgets", "Data drift, concept drift & embedding monitors", "Reference-free hallucination monitoring", "Detecting silent model provider upgrades", "Alert fatigue prevention & seasonal anomalies", "Closing the incident-to-eval fix loop"]) },
  { id: 15, title: "Agent Safety & Guardrails", level: "Advanced", lessons: L(15, ["The Lethal Trifecta (private data, untrusted input, external comms)", "Approval by risk tiers (read-only, reversible, irreversible)", "Indirect prompt injection via tool content", "Cost budgets, loop breakers & kill switches", "Input/output guardrails & PII redaction"]) },
  { id: 16, title: "Serving Infrastructure & System Design", level: "Advanced", lessons: L(16, ["vLLM, PagedAttention & continuous batching", "Multi-LoRA serving & quantization (INT4, AWQ)", "FastAPI production APIs & streaming SSE", "Model gateways: semantic caching, fallbacks & circuit breakers", "System design framework: Enterprise RAG for 10M docs", "System design: Multi-tenant gateway & customer support agent", "Google AI Engineer interview strategies"]) },
];

export const TOTAL_LESSONS = MODULES.reduce((a, m) => a + m.lessons.length, 0);

export type { BankQuestion } from "./questions";
export { MASTER_QUESTIONS as QUESTIONS } from "./questions";


export const PROJECTS = [
  {
    title: "Production RAG Assistant with Hybrid Search",
    desc: "Dense embeddings + BM25 reciprocal rank fusion, cross-encoder reranking, and citation enforcement.",
    level: "Intermediate",
  },
  {
    title: "ReAct Agent with Bounded Loop & Sandboxing",
    desc: "Think-Act-Observe loop in Python with strict step limits, typed Pydantic tool schemas, and error recovery.",
    level: "Beginner",
  },
  {
    title: "MCP Server over Streamable HTTP",
    desc: "Stateless tool server implementing OAuth 2.1, PKCE, RFC 8707 resource indicators, and the Tasks primitive.",
    level: "Advanced",
  },
  {
    title: "Autonomous Support Agent with Risk Tiers",
    desc: "Customer agent with read-only tools, automated refund thresholds, and human-in-the-loop approval gates.",
    level: "Intermediate",
  },
  {
    title: "LangGraph Multi-Agent Team with Checkpoints",
    desc: "Supervisor and worker pattern with shared typed state, conditional routing, and SQLite persistence.",
    level: "Advanced",
  },
  {
    title: "Anthropic-Style Agent Evaluation Harness",
    desc: "Automated test harness implementing Task, Trial, Transcript, Outcome, and Graders measuring pass^k.",
    level: "Advanced",
  },
  {
    title: "OpenTelemetry GenAI Observability Pipeline",
    desc: "Distributed tracing with gen_ai.* conventions, span tree visualization, and tail sampling for cost control.",
    level: "Advanced",
  },
  {
    title: "Model Gateway with Semantic Caching & Fallbacks",
    desc: "High-throughput API gateway with Redis semantic caching, prompt prefix caching, and circuit breakers.",
    level: "Intermediate",
  },
  {
    title: "Vector Search Engine with In-Memory HNSW",
    desc: "Vector search with cosine similarity, approximate nearest neighbor indexing, and metadata pre-filtering.",
    level: "Advanced",
  },
  {
    title: "Prompt Injection Defense & Guardrail Pipeline",
    desc: "Multi-layered guardrail: regex pre-filter, PII redaction, output schema validator, and toxic refusal checks.",
    level: "Intermediate",
  },
] as const;

export function scoreAnswer(answer: string, keys: string[]) {
  const a = answer.toLowerCase();
  const hit = keys.filter((k) => a.includes(k.toLowerCase()));
  const lenBonus = Math.min(20, Math.floor(answer.split(/\s+/).length / 4));
  const score = Math.min(100, Math.round((hit.length / keys.length) * 80) + lenBonus);
  return { score, hit, missing: keys.filter((k) => !hit.includes(k.toLowerCase())) };
}
