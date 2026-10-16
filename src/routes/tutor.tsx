import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Send, Trash2, GraduationCap } from "lucide-react";
import { PageHeader } from "@/components/academy/ui";

export const Route = createFileRoute("/tutor")({
  head: () => ({ meta: [
    { title: "AI Tutor — AI Agents Academy" },
    { name: "description", content: "Ask questions and get explanations about AI agents." },
    { property: "og:title", content: "AI Tutor — AI Agents Academy" },
    { property: "og:description", content: "Ask questions and get explanations about AI agents." },
  ] }),
  component: Tutor,
});

import { askGeminiTutor, isGeminiConfigured } from "@/lib/gemini";
import { Loader2 } from "lucide-react";

type Msg = { role: "user" | "tutor"; text: string };
const KEY = "academy-tutor";
const SUGGEST = ["Explain this concept simply", "Give a real-world example", "Show me Python code", "Quiz me on this topic"];

function knowledgeBaseReply(q: string): string {
  const s = q.toLowerCase();
  if (s.includes("python") || s.includes("code"))
    return "Architecture Reference — Minimal Tool Registry Pattern:\n\n```python\ntools = {\"add\": lambda a, b: a + b}\nresult = tools[\"add\"](2, 3)\n```\n\n• Line 1 registers available agent tools.\n• Line 2 dispatches execution dynamically by name.\n• In production, always validate arguments with Pydantic schemas before calling.";
  if (s.includes("quiz"))
    return "Knowledge Check:\n1. What stops an agent loop? (Max execution steps or explicit stop condition)\n2. Why validate tool arguments? (Model output is untrusted and can hallucinate types)\n3. Chatbot vs Agent? (Agents evaluate state and act with tools in a loop toward an objective)";
  if (s.includes("rag"))
    return "RAG Architecture:\nRAG retrieves semantically relevant document chunks via vector similarity search and injects them into the model's context window, grounding generation in private enterprise knowledge.";
  if (s.includes("example"))
    return "Real-World Application: Autonomous Travel Concierge:\n• Tool: Flight & hotel API search\n• Reasoning: Trade-off analysis between layover duration and price\n• Guardrail: Explicit human approval prior to financial booking";
  return "AI Systems Taxonomy:\n• Chatbot: Stateless or conversational text responder without tool agency.\n• Workflow: Deterministic DAG with fixed sequential logic.\n• AI Agent: Autonomous loop combining planning, memory, dynamic tool invocation, and reflection.";
}

function Tutor() {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [level, setLevel] = useState<"Beginner" | "Intermediate" | "Advanced">("Beginner");
  const [isLoading, setIsLoading] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);
  const hasKey = isGeminiConfigured();

  useEffect(() => { try { setMsgs(JSON.parse(localStorage.getItem(KEY) || "[]")); } catch {} ref.current?.focus(); }, []);
  const save = (m: Msg[]) => { setMsgs(m); localStorage.setItem(KEY, JSON.stringify(m)); };

  const send = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: Msg = { role: "user", text };
    const next = [...msgs, userMsg];
    save(next);
    setInput("");
    setIsLoading(true);

    try {
      if (hasKey) {
        const reply = await askGeminiTutor(text, msgs, level);
        save([...next, { role: "tutor", text: reply }]);
      } else {
        setTimeout(() => {
          save([...next, { role: "tutor", text: `[${level}] ${knowledgeBaseReply(text)}` }]);
          setIsLoading(false);
        }, 500);
        return;
      }
    } catch (err: unknown) {
      console.warn("Gemini call failed, falling back to knowledge base:", err);
      const fallback = `[Notice: Live AI query error (${err instanceof Error ? err.message : 'timeout'}). Falling back to built-in knowledge engine]\n\n${knowledgeBaseReply(text)}`;
      save([...next, { role: "tutor", text: fallback }]);
    } finally {
      setIsLoading(false);
      ref.current?.focus();
    }
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-4xl flex-col">
      <PageHeader
        title="AI Tutor"
        subtitle="Ask questions, get step-by-step explanations, and master AI agent architecture"
        badge={hasKey ? "⚡ Powered by Gemini AI" : "Built-in Knowledge Engine"}
      />
      <div className="mb-3 flex items-center gap-2">
        <select
          value={level}
          onChange={(e) => setLevel(e.target.value as "Beginner" | "Intermediate" | "Advanced")}
          className="rounded-md border bg-card p-2 text-sm font-semibold text-foreground outline-none focus:ring-2 focus:ring-ring"
          aria-label="Level"
        >
          {["Beginner", "Intermediate", "Advanced"].map((l) => (
            <option key={l} value={l}>{l} Level</option>
          ))}
        </select>
        {hasKey && (
          <span className="flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-2.5 py-1 text-xs font-semibold text-success">
            <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
            Gemini Connected
          </span>
        )}
        <button
          type="button"
          onClick={() => save([])}
          className="ml-auto flex items-center gap-1 rounded-md border px-3 py-2 text-sm hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
        >
          <Trash2 className="h-4 w-4" />
          Clear history
        </button>
      </div>

      <div className="panel flex-1 space-y-4 overflow-y-auto p-4">
        {msgs.length === 0 && (
          <div className="py-16 text-center space-y-2">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
              <GraduationCap className="h-6 w-6" />
            </div>
            <p className="font-semibold text-foreground">Welcome to your Personal AI Tutor</p>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              {hasKey
                ? "Your live Gemini tutor is active. Ask questions about AI agents, RAG, MCP, LangGraph, or interview preparation."
                : "Ask anything about AI agents, LLMs, or any topic. Connect Gemini in Settings for live answers."}
            </p>
          </div>
        )}
        {msgs.map((m, i) =>
          m.role === "user" ? (
            <div key={i} className="ml-auto max-w-[80%] rounded-2xl bg-primary px-4 py-2.5 text-sm text-primary-foreground shadow-sm">
              {m.text}
            </div>
          ) : (
            <div key={i} className="flex gap-3">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/15 text-primary border border-primary/20">
                <GraduationCap className="h-4 w-4" />
              </div>
              <div className="flex-1 space-y-2 min-w-0">
                <div className="prose dark:prose-invert max-w-none text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                  {m.text}
                </div>
              </div>
            </div>
          )
        )}
        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground animate-pulse py-2 pl-11">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
            Gemini is thinking and drafting your answer...
          </div>
        )}
      </div>

      <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="mt-3 flex gap-2">
        <textarea
          ref={ref}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
          rows={1}
          disabled={isLoading}
          placeholder="Ask anything about AI agents, LLMs, or any topic..."
          className="flex-1 resize-none rounded-lg border bg-card p-3 text-sm outline-none focus:ring-2 focus:ring-ring text-foreground disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          aria-label="Send"
          className="grid h-11 w-11 place-items-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-all shadow-sm shrink-0"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </form>
      <div className="mt-2 flex flex-wrap gap-2">
        {SUGGEST.map((s) => (
          <button
            key={s}
            type="button"
            disabled={isLoading}
            onClick={() => send(s)}
            className="rounded-full border px-3 py-1 text-xs hover:bg-accent text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
