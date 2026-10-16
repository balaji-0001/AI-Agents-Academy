import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, Panel } from "@/components/academy/ui";

export const Route = createFileRoute("/coding")({
  head: () => ({ meta: [
    { title: "Coding Practice — AI Agents Academy" },
    { name: "description", content: "Python exercises for building AI agents." },
    { property: "og:title", content: "Coding Practice — AI Agents Academy" },
    { property: "og:description", content: "Python exercises for building AI agents." },
  ] }),
  component: Coding,
});

const EX = [
  {
    t: "Tool registry dispatch",
    p: "Write dispatch(name, args) that looks up a tool function in a dict registry and returns an error dict for unknown tools.",
    checks: ["def dispatch", "in tools", "return"],
    sol: `tools = {"add": lambda a, b: a + b}

def dispatch(name: str, args: dict):
    if name not in tools:
        return {"error": f"unknown tool {name}"}
    try:
        return {"result": tools[name](**args)}
    except Exception as e:
        return {"error": str(e)}`,
  },
  {
    t: "ReAct Agent loop with limit",
    p: "Write a ReAct agent loop run_agent(goal, llm, tools, max_steps=8) that stops after max_steps iterations to prevent runaway execution.",
    checks: ["for", "range", "max_steps", "tool"],
    sol: `def run_agent(goal, llm, tools, max_steps=8):
    history = [{"role": "user", "content": goal}]
    for _ in range(max_steps):
        step = llm(history, tools=tools)
        if step.get("tool") is None:
            return step.get("text")  # final response
        fn = tools.get(step["tool"])
        result = fn(**step["args"]) if fn else "error: unknown tool"
        history.append({"role": "tool", "content": result})
    return "Stopped: step limit reached"`,
  },
  {
    t: "Cosine similarity in NumPy",
    p: "Compute cosine similarity between normalized query vector q and document embeddings matrix E.",
    checks: ["np.linalg.norm", "@"],
    sol: `import numpy as np

def cosine_similarity(E: np.ndarray, q: np.ndarray):
    # Normalize rows of E and query vector q
    E_norm = E / (np.linalg.norm(E, axis=1, keepdims=True) + 1e-9)
    q_norm = q / (np.linalg.norm(q) + 1e-9)
    # Dot product computes all cosine similarities simultaneously
    scores = E_norm @ q_norm
    return scores`,
  },
  {
    t: "Numerically stable Softmax",
    p: "Implement softmax(z) subtracting max(z) first to prevent exp() from overflowing to infinity.",
    checks: ["def softmax", "np.max", "np.exp", "np.sum"],
    sol: `import numpy as np

def softmax(z: np.ndarray, axis=-1):
    # Subtract max logit for numerical stability
    shifted = z - np.max(z, axis=axis, keepdims=True)
    exp_z = np.exp(shifted)
    return exp_z / np.sum(exp_z, axis=axis, keepdims=True)`,
  },
  {
    t: "Two Sum with hash map",
    p: "Given an array of numbers and a target, find the two indices that sum to target in O(n) time.",
    checks: ["seen", "target - x", "enumerate"],
    sol: `def two_sum(nums: list[int], target: int) -> list[int]:
    seen = {}
    for i, x in enumerate(nums):
        diff = target - x
        if diff in seen:
            return [seen[diff], i]
        seen[x] = i
    return []`,
  },
  {
    t: "Sliding window max sum",
    p: "Find the maximum sum of any contiguous subarray of fixed size k in O(n) time.",
    checks: ["window", "range", "nums[i - k]"],
    sol: `def max_sum_k(nums: list[int], k: int) -> int:
    if len(nums) < k: return 0
    window = sum(nums[:k])
    best = window
    for i in range(k, len(nums)):
        window += nums[i] - nums[i - k]
        best = max(best, window)
    return best`,
  },
  {
    t: "Scaled dot-product attention",
    p: "Implement self_attention(Q, K, V) scaled by sqrt(d_k) with causal masking support.",
    checks: ["sqrt", "@", "softmax"],
    sol: `import numpy as np

def self_attention(Q, K, V, causal=False):
    d_k = K.shape[-1]
    scores = (Q @ K.T) / np.sqrt(d_k)
    if causal:
        # Mask upper triangle so tokens cannot see future positions
        mask = np.triu(np.ones_like(scores), k=1)
        scores = np.where(mask == 1, -1e9, scores)
    exp_s = np.exp(scores - np.max(scores, axis=-1, keepdims=True))
    weights = exp_s / np.sum(exp_s, axis=-1, keepdims=True)
    return weights @ V, weights`,
  },
  {
    t: "LoRA parameter count",
    p: "Compute trainable parameters in a LoRA rank r adapter vs full fine-tuning of a d x k weight matrix.",
    checks: ["r *", "d * k", "ratio"],
    sol: `def lora_param_count(d: int, k: int, r: int):
    full_params = d * k
    # LoRA trains matrices B (d x r) and A (r x k)
    lora_params = r * (d + k)
    reduction = full_params / lora_params
    return {
        "full_params": full_params,
        "lora_params": lora_params,
        "reduction_ratio": round(reduction, 1)
    }`,
  },
  {
    t: "LRU Cache with OrderedDict",
    p: "Implement an LRU Cache with O(1) get(key) and put(key, value) with eviction.",
    checks: ["OrderedDict", "move_to_end", "popitem"],
    sol: `from collections import OrderedDict

class LRUCache:
    def __init__(self, capacity: int):
        self.cap = capacity
        self.data = OrderedDict()

    def get(self, key: str):
        if key not in self.data:
            return -1
        self.data.move_to_end(key)
        return self.data[key]

    def put(self, key: str, value):
        if key in self.data:
            self.data.move_to_end(key)
        self.data[key] = value
        if len(self.data) > self.cap:
            self.data.popitem(last=False)  # evict least recently used`,
  },
];

function Coding() {
  const [i, setI] = useState(0);
  const [code, setCode] = useState("");
  const [res, setRes] = useState<string[] | null>(null);
  const [show, setShow] = useState(false);
  const ex = EX[i]!;
  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Coding Practice" subtitle="Practice writing production AI agent components and patterns with real-time validation" badge="Interactive Python Lab" />
      <div className="mb-4 flex flex-wrap gap-2">{EX.map((e, k) => <button key={e.t} onClick={() => { setI(k); setCode(""); setRes(null); setShow(false); }} className={`rounded-full border px-3 py-1 text-sm ${k === i ? "bg-primary text-primary-foreground" : ""}`}>{e.t}</button>)}</div>
      <Panel title={ex.t}>
        <p className="mb-3 text-sm text-muted-foreground">{ex.p}</p>
        <textarea value={code} onChange={(e) => setCode(e.target.value)} rows={10} spellCheck={false} placeholder="# write Python here" className="w-full rounded-lg border bg-background p-3 font-mono text-xs" />
        <div className="mt-3 flex gap-2">
          <button onClick={() => setRes(ex.checks.filter((c) => !code.includes(c)))} className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground">Check</button>
          <button onClick={() => setShow(!show)} className="rounded-lg border px-4 py-2 text-sm">{show ? "Hide" : "Show"} solution</button>
        </div>
        {res && <p className={`mt-3 text-sm ${res.length ? "text-warning" : "text-success"}`}>{res.length ? `Missing expected patterns: ${res.join(", ")}` : "All expected patterns found."}</p>}
        {show && <pre className="mt-3 overflow-x-auto rounded-lg bg-background p-3 font-mono text-xs">{ex.sol}</pre>}
      </Panel>
    </div>
  );
}
