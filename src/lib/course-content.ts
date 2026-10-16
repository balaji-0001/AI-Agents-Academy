export interface LessonContent {
  title: string;
  summary: string;
  objectives: string[];
  explanation: {
    beginner: string;
    technical: string;
    mistake: string;
  };
  code: string;
  quiz: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
  interview: {
    question: string;
    answer: string;
    followUp: string;
  };
}

export const LESSON_DETAILS: Record<number, LessonContent> = {
  1: {
    title: "Python Syntax, Object Model & Numerical Stability",
    summary: "Master Python's memory model, pass-by-object-reference semantics, and vectorised numerical operations for AI systems.",
    objectives: [
      "Understand mutable vs immutable objects and memory reference semantics",
      "Avoid the mutable default argument trap in production APIs",
      "Write vectorised NumPy operations and implement numerically stable Softmax",
    ],
    explanation: {
      beginner: "In Python, variables are labels pointing to objects in memory. Numbers and strings cannot change (immutable), while lists and dicts can be modified in place (mutable). Understanding this prevents subtle state bugs across agent turns.",
      technical: "Python passes object references ('pass by object reference'). Mutating a mutable object inside a function modifies the caller's instance, whereas rebinding a parameter only changes local scope. In numerical computing, vectorised C loops in NumPy avoid Python interpreter dispatch and release the GIL.",
      mistake: "Using mutable defaults like def call(data=[]) where the list is instantiated once at function definition time and shared across all subsequent invocations.",
    },
    code: `import numpy as np

# Numerically stable Softmax: subtract max to prevent exp() float overflow
def stable_softmax(z: np.ndarray, axis=-1) -> np.ndarray:
    shifted = z - np.max(z, axis=axis, keepdims=True)
    exp_z = np.exp(shifted)
    return exp_z / np.sum(exp_z, axis=axis, keepdims=True)

# Test with large logits that would overflow a naive implementation
logits = np.array([1000.0, 1001.0, 999.0])
probs = stable_softmax(logits)
print("Probabilities:", probs.round(3))  # [0.245, 0.665, 0.09]`,
    quiz: {
      question: "What happens if you run a naive softmax exp(z) / sum(exp(z)) with z = [1000, 1001]?",
      options: [
        "It returns [0.5, 0.5]",
        "It overflows to infinity and outputs [nan, nan]",
        "Python automatically rescales the numbers",
        "It raises a ZeroDivisionError",
      ],
      correctIndex: 1,
      explanation: "exp(1000) exceeds standard 64-bit float limits (~1.79e308), overflowing to inf. Dividing inf/inf yields nan. Subtracting max(z) guarantees exponents are <= 0, preventing overflow.",
    },
    interview: {
      question: "How are arguments passed in Python, and what happens when passing mutable vs immutable objects?",
      answer: "Python uses pass-by-object-reference. Functions receive a reference to the existing object. If the object is mutable and modified in place (like list.append), the caller observes the change. If immutable or rebound (x = new_val), the caller remains unaffected.",
      followUp: "Why does Python cache small integers (-5 to 256) and how does that make 'is' unreliable for equality checks?",
    },
  },
  2: {
    title: "Data Structures, Algorithms & Search Patterns",
    summary: "Core algorithmic patterns for AI systems: two pointers, sliding window, heaps for top-k retrieval, and graph BFS.",
    objectives: [
      "Analyze time and space complexity with Big O notation",
      "Implement sliding windows for token sequence scanning",
      "Use heaps to maintain running medians and top-k nearest neighbors",
    ],
    explanation: {
      beginner: "Algorithms determine how fast your software handles large volumes of data. A hash map or set gives near-instant O(1) lookups, while linear scans take O(n). Selecting the right pattern prevents request timeouts under load.",
      technical: "Sliding window and two-pointer techniques convert O(n^2) brute-force searches into linear O(n) traversals by maintaining monotonic bounds. For graphs and dependencies, BFS using collections.deque guarantees shortest unweighted paths.",
      mistake: "Using list.pop(0) which takes O(n) time because all subsequent elements must shift in memory; use collections.deque.popleft() which takes O(1).",
    },
    code: `from collections import deque

def shortest_path_grid(grid: list[list[int]]) -> int:
    """BFS shortest path from (0,0) to (n-1, m-1). 0 is open, 1 is blocked."""
    n, m = len(grid), len(grid[0])
    if grid[0][0] == 1 or grid[n-1][m-1] == 1:
        return -1
    q = deque([(0, 0, 1)])  # r, c, distance
    visited = {(0, 0)}
    while q:
        r, c, d = q.popleft()
        if (r, c) == (n - 1, m - 1):
            return d
        for dr, dc in [(-1,0), (1,0), (0,-1), (0,1)]:
            nr, nc = r + dr, c + dc
            if 0 <= nr < n and 0 <= nc < m and grid[nr][nc] == 0 and (nr, nc) not in visited:
                visited.add((nr, nc))
                q.append((nr, nc, d + 1))
    return -1`,
    quiz: {
      question: "Why does Breadth-First Search (BFS) guarantee the shortest path in an unweighted grid, but Depth-First Search (DFS) does not?",
      options: [
        "BFS uses more memory than DFS",
        "BFS explores nodes level-by-level in order of distance from the source",
        "DFS cannot handle cycles in graphs",
        "BFS uses recursion which is faster",
      ],
      correctIndex: 1,
      explanation: "Because BFS visits nodes in increasing order of path length, the first time it reaches the target, it has used the minimum possible number of edges.",
    },
    interview: {
      question: "How would you find the top-k most similar vector embeddings without sorting the entire dataset?",
      answer: "Use a size-k min-heap or numpy.argpartition in O(n) time instead of a full O(n log n) sort. For production scale with millions of vectors, use an approximate nearest neighbor index (HNSW, ScaNN) for sub-linear query time.",
      followUp: "What is the difference between a min-heap and a max-heap in Python's heapq library?",
    },
  },
  3: {
    title: "Scaled Dot-Product Attention, KV-Cache & LoRA Math",
    summary: "The mathematical foundations of Transformers, self-attention variance preservation, and parameter-efficient fine-tuning.",
    objectives: [
      "Derive the scaled dot-product attention formula and the sqrt(d_k) factor",
      "Understand why naive attention scales as O(n^2) and how FlashAttention tiles memory",
      "Calculate KV-cache memory requirements for long-context serving",
      "Derive LoRA adapter trainable parameter counts vs full fine-tuning",
    ],
    explanation: {
      beginner: "Attention allows every word in a sentence to look at and borrow meaning from every other word. For example, in 'The bank of the river', 'bank' attends to 'river' to know it means land, not a financial institution.",
      technical: "Self-attention computes Attention(Q, K, V) = softmax(Q K^T / sqrt(d_k)) V. The sqrt(d_k) factor rescales variance to 1 so logits do not saturate softmax and cause vanishing gradients. In generation, the KV-cache stores previous K and V matrices to avoid recomputing prefixes, scaling linearly with batch size and sequence length.",
      mistake: "Confusing parameter size with serving memory: serving requires model weights PLUS KV cache (2 * L * h_kv * d_head * seq_len * batch * precision).",
    },
    code: `import numpy as np

def scaled_dot_product_attention(Q, K, V, mask=None):
    d_k = K.shape[-1]
    # Compute query-key similarity scores rescaled by sqrt(d_k)
    scores = (Q @ K.swapaxes(-2, -1)) / np.sqrt(d_k)
    if mask is not None:
        scores = np.where(mask == 0, -1e9, scores)
    weights = np.exp(scores - np.max(scores, axis=-1, keepdims=True))
    weights /= np.sum(weights, axis=-1, keepdims=True)
    return weights @ V, weights

# Example LoRA parameter calculation
def lora_params(d=4096, k=4096, r=8):
    full = d * k
    lora = r * (d + k)
    return {"full": full, "lora": lora, "savings": f"{100 * (1 - lora/full):.2f}%"}

print(lora_params())  # ~99.61% parameter reduction!`,
    quiz: {
      question: "Why do we divide query-key dot products by sqrt(d_k) in the attention mechanism?",
      options: [
        "To make matrices square for multiplication",
        "To prevent large dot products from pushing softmax into regions with vanishing gradients",
        "To account for positional encodings",
        "To normalize token lengths in the batch",
      ],
      correctIndex: 1,
      explanation: "Independent components of dimension d_k produce dot products with variance d_k and standard deviation sqrt(d_k). Dividing by sqrt(d_k) rescales variance to 1, avoiding softmax saturation.",
    },
    interview: {
      question: "State the Chinchilla compute-optimal scaling law and what it implies for modern model training.",
      answer: "Hoffmann et al. (2022) showed that compute C ≈ 6 * N * D, where parameters N and tokens D should scale in equal proportion (~20 tokens per parameter). Many earlier models (like GPT-3) were undertrained for their parameter count.",
      followUp: "Why do companies now train smaller models on far more than 20 tokens per parameter?",
    },
  },
  5: {
    title: "AI Agent Fundamentals: The ReAct Loop & Autonomy Ladder",
    summary: "Understand the core architecture of agent systems: Think-Act-Observe loops, stopping conditions, and the math of compounding errors.",
    objectives: [
      "Differentiate workflows (predefined paths) from agents (dynamic paths)",
      "Understand the ReAct (Reason + Act) loop execution pattern",
      "Calculate compound error rates across multi-step execution (0.95^10)",
      "Implement robust stopping conditions and cost limits",
    ],
    explanation: {
      beginner: "A chatbot only generates an answer to your message. An agent is an AI that has tools (like a search engine or calculator) and can take a series of actions over multiple steps until it reaches a goal.",
      technical: "Agents follow the ReAct loop: Goal -> [Think -> Act -> Observe] * N -> Outcome. The model inspects conversation history and emits structured tool calls. Crucially, errors compound exponentially: if each step has a 95% success rate, a 10-step agent succeeds only 0.95^10 ≈ 60% of the time.",
      mistake: "Assuming an agent will reliably know when to stop on its own without explicit max-step limits, token budgets, and runtime loop detection.",
    },
    code: `def run_react_agent(goal: str, llm_fn, tool_registry: dict, max_steps: int = 8):
    history = [{"role": "user", "content": goal}]
    for step in range(max_steps):
        # 1. Think: model decides action or final response
        decision = llm_fn(history, tools=list(tool_registry.keys()))
        if decision.get("type") == "final":
            return {"status": "success", "answer": decision["content"], "steps": step + 1}
        
        # 2. Act: validate and execute tool
        tool_name = decision.get("tool")
        args = decision.get("args", {})
        if tool_name not in tool_registry:
            result = f"Error: Unknown tool {tool_name}"
        else:
            try:
                result = tool_registry[tool_name](**args)
            except Exception as e:
                result = f"Tool execution failed: {str(e)}"
        
        # 3. Observe: append result to context for next thought
        history.append({"role": "tool", "name": tool_name, "content": result})
        
    return {"status": "limit_exceeded", "error": "Max steps reached"}`,
    quiz: {
      question: "If an agent has 10 sequential tool steps and each step has a 95% chance of succeeding without error, what is the overall task success rate?",
      options: ["95%", "85%", "Approximately 60%", "50%"],
      correctIndex: 2,
      explanation: "0.95^10 ≈ 0.5987 (approx 60%). Even high per-step accuracy drops significantly over multi-step agent trajectories, emphasizing the need for fewer steps and robust error recovery.",
    },
    interview: {
      question: "What is the difference between an agent and a workflow according to Anthropic's engineering guidelines?",
      answer: "In a workflow, your code orchestrates LLM calls along predefined execution paths (chains, parallelization, routing). In an agent, the LLM dynamically decides which tools to call and what actions to take in an iterative loop. Workflows are more predictable, cheaper, and easier to test.",
      followUp: "When should you graduate from a workflow to an autonomous agent?",
    },
  },
  7: {
    title: "Production RAG: Hybrid Search, Reranking & Permissions",
    summary: "Build enterprise RAG pipelines combining dense vector similarity with sparse BM25, Reciprocal Rank Fusion, and cross-encoder reranking.",
    objectives: [
      "Understand the difference between retrieval failures and generation failures",
      "Implement hybrid search combining BM25 keyword matching and embeddings",
      "Fuse ranked results using Reciprocal Rank Fusion (RRF)",
      "Enforce pre-filtering access control lists (ACLs) to prevent data leaks",
    ],
    explanation: {
      beginner: "RAG gives an LLM an open-book exam: before answering a question, the system searches your private documents, copies the best excerpts into the prompt, and asks the model to answer using only those sources.",
      technical: "Dense embeddings capture semantics and paraphrases but miss exact IDs or error codes; sparse BM25 excels at exact keyword matching. Hybrid search runs both in parallel and merges ranks via RRF: score = sum(1 / (60 + rank)). A cross-encoder reranks top 50 down to the 5 most relevant chunks.",
      mistake: "Checking document permissions after the LLM generates an answer instead of pre-filtering vector search by user ACLs.",
    },
    code: `from collections import Counter

# Reciprocal Rank Fusion (RRF) to merge dense and sparse rankings
def reciprocal_rank_fusion(dense_ranks: list[str], sparse_ranks: list[str], k: int = 60) -> list[str]:
    fused_scores = Counter()
    for rank, doc_id in enumerate(dense_ranks, start=1):
        fused_scores[doc_id] += 1.0 / (k + rank)
    for rank, doc_id in enumerate(sparse_ranks, start=1):
        fused_scores[doc_id] += 1.0 / (k + rank)
    # Sort documents by highest fused score
    return [doc_id for doc_id, _ in fused_scores.most_common()]

dense = ["doc1", "doc2", "doc3"]
sparse = ["doc3", "doc1", "doc4"]
print("Merged top documents:", reciprocal_rank_fusion(dense, sparse))`,
    quiz: {
      question: "Why is a cross-encoder used only for reranking top candidates rather than searching the entire document corpus?",
      options: [
        "Cross-encoders cannot produce numerical scores",
        "Cross-encoders process query and document together, requiring an expensive forward pass per pair that cannot be precomputed",
        "Cross-encoders only work with single words",
        "Cross-encoders have lower accuracy than bi-encoders",
      ],
      correctIndex: 1,
      explanation: "Bi-encoder document embeddings can be precomputed and searched in milliseconds with vector indexes. Cross-encoders must attend across query and document jointly at runtime, which is far too slow for millions of documents.",
    },
    interview: {
      question: "Your production RAG assistant returns outdated answers even though no code was deployed. How do you diagnose and fix it?",
      answer: "First check traces to see whether retrieved chunk IDs are stale. Common causes: ingestion pipeline lag, failed re-indexing on document updates, deleted files lacking tombstones, or silent provider embedding changes. Fix with event-driven incremental indexing, index timestamps, and freshness weighting.",
      followUp: "How do you evaluate retrieval precision and recall separately from generator faithfulness?",
    },
  },
  11: {
    title: "Model Context Protocol (MCP) & Tool Infrastructure",
    summary: "The open standard for connecting AI agents to tools, databases, and resources via stateless Streamable HTTP and OAuth 2.1.",
    objectives: [
      "Understand MCP architecture: Host, Client, Server, and Primitives (Tools, Resources, Prompts)",
      "Explain why HTTP+SSE was deprecated in favor of Streamable HTTP",
      "Secure remote MCP servers with OAuth 2.1, PKCE, and RFC 8707 Resource Indicators",
      "Handle long-running tool calls using the MCP Tasks primitive",
    ],
    explanation: {
      beginner: "Without a standard, every AI app needs custom code for every tool (M apps * N tools). The Model Context Protocol (MCP) created by Anthropic acts like a universal USB plug: you build a tool server once, and any MCP-compatible agent can use it.",
      technical: "MCP exposes Tools (model-driven calls), Resources (application-loaded context), and Prompts (user templates). Streamable HTTP replaces stateful SSE with a single endpoint, allowing stateless horizontal scaling behind load balancers. Security mandates OAuth 2.1 with PKCE and audience-bound tokens under RFC 8707.",
      mistake: "Allowing agents direct network access to unverified remote MCP servers without least-privilege tool scopes and input/output sanitization.",
    },
    code: `# Conceptual MCP Streamable HTTP tool handler
from pydantic import BaseModel, Field

class OrderLookupParams(BaseModel):
    order_id: str = Field(description="Alphanumeric order identifier")

# MCP Tool definition exposed in server manifest
MCP_TOOL_SCHEMA = {
    "name": "lookup_order",
    "description": "Fetch status and item details for a customer order",
    "inputSchema": OrderLookupParams.model_json_schema()
}

def handle_mcp_call(method: str, params: dict, context_headers: dict):
    # Propagate W3C Trace Context
    traceparent = context_headers.get("traceparent")
    # Verify audience-bound OAuth token (RFC 8707)
    # Execute tool with least-privilege read access
    return {"order_id": params["order_id"], "status": "shipped"}`,
    quiz: {
      question: "Why was the HTTP+SSE transport deprecated in the MCP specification in favor of Streamable HTTP?",
      options: [
        "SSE did not support JSON formatting",
        "SSE required sticky sessions and two separate endpoints, breaking load balancing and horizontal scaling",
        "HTTP was faster than SSE over local pipes",
        "SSE was proprietary to one browser vendor",
      ],
      correctIndex: 1,
      explanation: "HTTP+SSE required persistent connections and session stickiness (Mcp-Session-Id), which prevented standard cloud load balancers and serverless workers from scaling horizontally.",
    },
    interview: {
      question: "How do you trace an MCP tool call end-to-end across service boundaries?",
      answer: "The agent client emits a tools/call span with gen_ai.tool.name, mcp.session.id, and transport details. It injects W3C Trace Context (traceparent) into request headers. The remote MCP server extracts the header, creating a child span for the tool execution so the entire path appears in one trace.",
      followUp: "How does the MCP Tasks primitive prevent timeouts on slow or asynchronous tools?",
    },
  },
  12: {
    title: "AI Evals: The Anthropic Testing Framework & RAGAS",
    summary: "Establish rigorous evaluation harnesses using Task, Trial, Transcript, Outcome, and Grader to gate production deployments.",
    objectives: [
      "Implement the Anthropic Evaluation Framework (Task, Trial, Transcript, Outcome, Grader)",
      "Distinguish capability evaluations from regression evaluations",
      "Calculate reliability with pass^k vs pass@k across non-deterministic runs",
      "Calibrate LLM-as-a-judge against human expert labels and mitigate position bias",
    ],
    explanation: {
      beginner: "Normal software uses unit tests with exact True/False answers. Because AI outputs can be creative, flexible, and variable, we need evaluations ('evals') that test whether the system consistently achieves the intended outcome.",
      technical: "The Anthropic framework defines: Task (test case), Trial (execution), Transcript (event log), Outcome (environment state), and Graders (code-based, model-based, or human). Evals must be integrated into CI/CD pipelines to block prompt and model regressions before code ships to production.",
      mistake: "Relying on an LLM-as-a-judge without pinning the judge model version, leading to silent temporal scoring drift.",
    },
    code: `from pydantic import BaseModel
from typing import Callable

class EvalTask(BaseModel):
    id: str
    query: str
    context: str
    expected_outcome: str

def code_grader(response: str, expected_key: str) -> bool:
    """Deterministic check: fast, free, reproducible."""
    return expected_key.lower() in response.lower()

def run_eval_suite(tasks: list[EvalTask], agent_fn: Callable) -> dict:
    passed = 0
    for task in tasks:
        # Run trial
        result = agent_fn(task.query, task.context)
        # Apply grader to outcome
        if code_grader(result, task.expected_outcome):
            passed += 1
    pass_rate = passed / len(tasks)
    return {"total": len(tasks), "passed": passed, "pass_rate": f"{pass_rate:.1%}"}`,
    quiz: {
      question: "Why should agent evaluations prioritize grading the OUTCOME over grading the exact sequence of steps?",
      options: [
        "Outcomes are easier to calculate than step numbers",
        "Agents can find different equally valid paths to solve a problem; checking for one rigid sequence punishes valid alternatives",
        "Step sequences cannot be recorded in transcripts",
        "Outcomes do not require assertion thresholds",
      ],
      correctIndex: 1,
      explanation: "An agent may legitimately use 2 steps or 4 steps or different tool orders to reach the correct result (e.g. table booked in DB). Grading only the end state rewards success without penalizing creativity.",
    },
    interview: {
      question: "How do you detect and mitigate position bias and verbosity bias in LLM-as-a-judge evaluations?",
      answer: "Position bias (favoring the first choice) is detected by running pairwise tests with candidate positions swapped. Mitigate by averaging both orders or using rubric-based direct scoring. Verbosity bias is fixed by strict rubric length constraints and negative penalties for fluff.",
      followUp: "What statistical sample size is required before alerting on an offline eval quality drop?",
    },
  },
  15: {
    title: "Agent Safety, Guardrails & The Lethal Trifecta",
    summary: "Defend production agents against prompt injection, data exfiltration, runaway loops, and unauthorized actions.",
    objectives: [
      "Analyze Simon Willison's 'Lethal Trifecta' threat model",
      "Implement multi-layered defense-in-depth: input filters, least privilege, and output validation",
      "Enforce approval tiers for read-only, reversible, and irreversible financial actions",
      "Apply token and step circuit breakers to prevent runaway billing spikes",
    ],
    explanation: {
      beginner: "If a chatbot is tricked, it says something incorrect. If an agent is tricked, it can delete customer records, move money, or email private files. Agent safety means building strict boundaries around what the AI is permitted to do.",
      technical: "The Lethal Trifecta combines: 1. Private data access, 2. Exposure to untrusted content, and 3. External communication channels. Indirect prompt injection inside retrieved web pages or documents can instruct the model to exfiltrate private data. Security requires breaking this triangle with least-privilege scoping, human approvals, and application-level policy checks.",
      mistake: "Trusting the model to enforce business rules in its prompt (e.g. 'Never refund over ₹10,000') rather than hardcoding the limit in deterministic application logic.",
    },
    code: `import re

# Approval by Risk Tier
def execute_agent_action(action_type: str, payload: dict, user_role: str) -> dict:
    # Tier 1: Read-only -> Automatic execution
    if action_type in ["search", "read_record", "get_status"]:
        return {"status": "executed", "tier": "read_only"}
    
    # Tier 2: Reversible write -> Execute and audit log
    if action_type in ["draft_email", "create_ticket_note"]:
        # Write to database with audit trail
        return {"status": "executed", "tier": "reversible", "audit": True}
        
    # Tier 3: Irreversible or Financial -> Mandatory Human-in-the-Loop gate
    if action_type in ["issue_refund", "delete_account", "transfer_funds"]:
        amount = payload.get("amount", 0)
        # Business logic enforced in code, NOT prompt!
        if amount > 10000:
            return {"status": "held_for_approval", "reason": "Exceeds ₹10,000 threshold"}
        return {"status": "held_for_approval", "reason": "Financial action requires supervisor sign-off"}
        
    raise ValueError(f"Unauthorized action type: {action_type}")`,
    quiz: {
      question: "According to Simon Willison's Lethal Trifecta, what three conditions combine to allow indirect prompt injection to leak data?",
      options: [
        "Bad prompt, slow model, and missing API keys",
        "Private data access, exposure to untrusted text, and an external communication channel",
        "High temperature, missing system prompt, and lack of fine-tuning",
        "No vector database, missing embeddings, and lack of caching",
      ],
      correctIndex: 1,
      explanation: "When an agent can read private data, reads untrusted text (which can contain injection instructions), and has a tool to communicate externally, an attacker can trick it into exfiltrating the private data.",
    },
    interview: {
      question: "How do you defend an autonomous agent against indirect prompt injection from retrieved documents or web tool results?",
      answer: "Treat all retrieved and tool content as untrusted data rather than instructions. Separate data context with strict delimiters, apply least-privilege permissions, require human confirmation for sensitive actions, validate arguments before execution, and monitor tool responses for injection patterns.",
      followUp: "Why is prompt injection considered an unresolved problem that requires defence-in-depth rather than prompt filtering alone?",
    },
  },
};

