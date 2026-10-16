import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Search,
  Star,
  CheckCircle2,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Sparkles,
  BookOpen,
  Send,
  Building2,
  Bookmark,
  GraduationCap,
} from "lucide-react";
import { QUESTIONS, scoreAnswer } from "@/lib/academy-data";
import { PageHeader } from "@/components/academy/ui";

export const Route = createFileRoute("/questions")({
  head: () => ({
    meta: [
      { title: "Question Bank — AI Agents Academy" },
      { name: "description", content: "Searchable senior AI engineering interview questions, company tags, and practice evaluations." },
      { property: "og:title", content: "Question Bank — AI Agents Academy" },
      { property: "og:description", content: "Searchable senior AI engineering interview questions, company tags, and practice evaluations." },
    ],
  }),
  component: Bank,
});

export function Bank() {
  const [q, setQ] = useState("");
  const [diff, setDiff] = useState("All");
  const [topic, setTopic] = useState("All");
  const [company, setCompany] = useState("All");
  const [onlyBookmarked, setOnlyBookmarked] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);

  // Bookmarking persistent state
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  // In-card practice state per question
  const [practiceOpen, setPracticeOpen] = useState<Record<string, boolean>>({});
  const [practiceAnswers, setPracticeAnswers] = useState<Record<string, string>>({});
  const [practiceResults, setPracticeResults] = useState<
    Record<string, { score: number; hit: string[]; missing: string[] }>
  >({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(30);

  // Reset pagination on search or filter change
  useEffect(() => {
    setVisibleCount(30);
  }, [q, topic, company, diff, onlyBookmarked]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("academy-bookmarked-questions");
      if (saved) {
        setBookmarkedIds(JSON.parse(saved));
      }
    } catch {}
  }, []);

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarkedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      try {
        localStorage.setItem("academy-bookmarked-questions", JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handleCopyQuestion = (questionObj: (typeof QUESTIONS)[0], e: React.MouseEvent) => {
    e.stopPropagation();
    const text = `Q: ${questionObj.q}\n\nKey Concepts: ${questionObj.keys.join(", ")}\n\nModel Answer: ${questionObj.answer}\n\nCommon Pitfall: ${questionObj.wrong}\n\nFollow-up: ${questionObj.followUp}`;
    navigator.clipboard.writeText(text);
    setCopiedId(questionObj.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleEvaluatePractice = (id: string, keys: string[]) => {
    const text = practiceAnswers[id] || "";
    if (!text.trim()) return;
    const result = scoreAnswer(text, keys);
    setPracticeResults((prev) => ({ ...prev, [id]: result }));
  };

  const topics = ["All", ...Array.from(new Set(QUESTIONS.map((x) => x.topic)))];
  const companies = [
    "All",
    ...Array.from(new Set(QUESTIONS.map((x) => x.company).filter(Boolean) as string[])),
  ];

  const filtered = QUESTIONS.filter((x) => {
    const matchDiff = diff === "All" || x.difficulty === diff;
    const matchTopic = topic === "All" || x.topic === topic;
    const matchCompany = company === "All" || x.company === company;
    const matchBookmark = !onlyBookmarked || bookmarkedIds.includes(x.id);
    const matchQuery =
      (x.q + x.topic + (x.company || "") + x.keys.join(" ")).toLowerCase().includes(q.toLowerCase());
    return matchDiff && matchTopic && matchCompany && matchBookmark && matchQuery;
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        title="Question Bank"
        subtitle="200+ curated senior interview questions covering Python, DSA, AI Agents, LangGraph, MCP, RAG, Evals & Distributed Systems"
        badge="200+ Master Questions Vault"
      />

      {/* Filter & Search Bar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by keyword, topic (e.g. RRF, MCP, LangGraph, vLLM)..."
              className="w-full rounded-xl border bg-card pl-9 pr-3 py-2 text-xs sm:text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Topic Filter */}
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="rounded-xl border bg-card px-2.5 py-2 text-xs text-foreground font-semibold outline-none focus:ring-2 focus:ring-ring"
              aria-label="Filter by Topic"
            >
              {topics.map((t) => (
                <option key={t} value={t}>
                  {t === "All" ? "All Topics" : t}
                </option>
              ))}
            </select>

            {/* Company Filter */}
            <select
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="rounded-xl border bg-card px-2.5 py-2 text-xs text-foreground font-semibold outline-none focus:ring-2 focus:ring-ring"
              aria-label="Filter by Company"
            >
              {companies.map((c) => (
                <option key={c} value={c}>
                  {c === "All" ? "All Companies" : c}
                </option>
              ))}
            </select>

            {/* Difficulty Filter */}
            <select
              value={diff}
              onChange={(e) => setDiff(e.target.value)}
              className="rounded-xl border bg-card px-2.5 py-2 text-xs text-foreground font-semibold outline-none focus:ring-2 focus:ring-ring"
              aria-label="Filter by Difficulty"
            >
              {["All", "Easy", "Medium", "Hard"].map((d) => (
                <option key={d} value={d}>
                  {d === "All" ? "All Levels" : d}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* View Mode Bar */}
        <div className="flex items-center justify-between text-xs border-b pb-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setOnlyBookmarked(false)}
              className={`rounded-lg px-3 py-1 font-semibold transition-all ${
                !onlyBookmarked
                  ? "bg-primary text-primary-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All Questions ({QUESTIONS.length})
            </button>
            <button
              type="button"
              onClick={() => setOnlyBookmarked(true)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1 font-semibold transition-all ${
                onlyBookmarked
                  ? "bg-amber-500 text-white shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Star className="h-3.5 w-3.5 fill-current" />
              <span>Bookmarked ({bookmarkedIds.length})</span>
            </button>
          </div>

          <span className="text-muted-foreground font-medium">
            Showing {filtered.length} matching questions
          </span>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border bg-card p-12 text-center space-y-2">
            <p className="font-semibold text-sm text-foreground">
              No questions match your current filters.
            </p>
            <p className="text-xs text-muted-foreground">
              Try clearing search terms or resetting difficulty and topic filters.
            </p>
            <button
              type="button"
              onClick={() => {
                setQ("");
                setTopic("All");
                setCompany("All");
                setDiff("All");
                setOnlyBookmarked(false);
              }}
              className="mt-2 rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filtered.slice(0, visibleCount).map((item, index) => {
            const isOpen = openId === item.id;
            const isBookmarked = bookmarkedIds.includes(item.id);
            const isPracticeOpen = practiceOpen[item.id] || false;
            const practiceResult = practiceResults[item.id];

            return (
              <div
                key={item.id}
                className={`rounded-2xl border bg-card transition-all shadow-2xs ${
                  isOpen ? "border-primary/50 shadow-sm" : "hover:border-primary/40"
                }`}
              >
                {/* Question Row Header */}
                <div
                  onClick={() => setOpenId(isOpen ? null : item.id)}
                  className="cursor-pointer p-4 sm:p-5 flex items-start justify-between gap-3 select-none"
                >
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      {item.company && (
                        <span className="rounded-md bg-accent px-2 py-0.5 text-[11px] font-bold text-accent-foreground flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {item.company}
                        </span>
                      )}
                      <span className="rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                        {item.topic}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          item.difficulty === "Easy"
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                            : item.difficulty === "Medium"
                            ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                            : "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        {item.difficulty}
                      </span>
                      <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                        {item.type}
                      </span>
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-foreground leading-snug">
                      {item.q}
                    </h3>
                  </div>

                  {/* Actions: Bookmark & Expand */}
                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    <button
                      type="button"
                      onClick={(e) => toggleBookmark(item.id, e)}
                      title={isBookmarked ? "Remove Bookmark" : "Bookmark Question"}
                      className={`rounded-lg p-1.5 transition-colors ${
                        isBookmarked
                          ? "text-amber-500 bg-amber-500/10 hover:bg-amber-500/20"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent"
                      }`}
                    >
                      <Star className={`h-4 w-4 ${isBookmarked ? "fill-amber-500" : ""}`} />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleCopyQuestion(item, e)}
                      title="Copy Question & Answer"
                      className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                    >
                      {copiedId === item.id ? (
                        <Check className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>

                    <div className="rounded-lg p-1 text-muted-foreground">
                      {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isOpen && (
                  <div className="px-4 pb-5 pt-1 sm:px-5 space-y-4 border-t text-xs">
                    {/* Key Concepts Pills */}
                    <div>
                      <span className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground block mb-1.5">
                        Key Concepts & Technical Signals:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {item.keys.map((k) => (
                          <span
                            key={k}
                            className="rounded-md bg-muted px-2 py-0.5 font-mono text-xs font-semibold text-foreground/90 border border-border/50"
                          >
                            {k}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Model Reference Answer */}
                    <div className="rounded-xl border bg-muted/20 p-4 space-y-1.5">
                      <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                        <GraduationCap className="h-4 w-4 text-primary" />
                        Comprehensive Model Answer:
                      </span>
                      <p className="text-foreground/90 leading-relaxed text-xs sm:text-sm">
                        {item.answer}
                      </p>
                    </div>

                    {/* Common Pitfall */}
                    <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-3.5 space-y-1">
                      <span className="font-bold text-amber-600 dark:text-amber-400 text-[11px] uppercase tracking-wider">
                        ⚠️ Common Candidate Pitfall:
                      </span>
                      <p className="text-foreground/90 leading-relaxed text-xs">{item.wrong}</p>
                    </div>

                    {/* Follow-up Question Probe */}
                    {item.followUp && (
                      <div className="rounded-xl border bg-primary/5 border-primary/20 p-3.5 space-y-1">
                        <span className="font-bold text-primary text-[11px] uppercase tracking-wider">
                          🎯 Senior Interviewer Follow-up Probe:
                        </span>
                        <p className="text-foreground font-medium text-xs italic">
                          "{item.followUp}"
                        </p>
                      </div>
                    )}

                    {/* In-Card Practice Mode Drawer */}
                    <div className="pt-2 border-t">
                      {!isPracticeOpen ? (
                        <button
                          type="button"
                          onClick={() =>
                            setPracticeOpen((prev) => ({ ...prev, [item.id]: true }))
                          }
                          className="rounded-lg border px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/5 transition-colors flex items-center gap-1.5 shadow-2xs"
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                          <span>Practice Answering & Self-Score</span>
                        </button>
                      ) : (
                        <div className="space-y-3 rounded-xl border bg-card p-3.5 shadow-2xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                              <Sparkles className="h-3.5 w-3.5 text-primary" />
                              Your Practice Response
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setPracticeOpen((prev) => ({ ...prev, [item.id]: false }))
                              }
                              className="text-[11px] text-muted-foreground hover:text-foreground"
                            >
                              Close Practice
                            </button>
                          </div>

                          <textarea
                            rows={3}
                            value={practiceAnswers[item.id] || ""}
                            onChange={(e) =>
                              setPracticeAnswers((prev) => ({
                                ...prev,
                                [item.id]: e.target.value,
                              }))
                            }
                            placeholder="Type how you would explain this technical concept to the interviewer..."
                            className="w-full rounded-lg border bg-card p-2.5 text-xs text-foreground outline-none focus:ring-2 focus:ring-ring"
                          />

                          <div className="flex items-center justify-between gap-2">
                            <button
                              type="button"
                              disabled={!(practiceAnswers[item.id] || "").trim()}
                              onClick={() => handleEvaluatePractice(item.id, item.keys)}
                              className="rounded-lg bg-primary px-3.5 py-1.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center gap-1.5"
                            >
                              <Send className="h-3 w-3" />
                              <span>Evaluate My Answer</span>
                            </button>

                            {practiceResult && (
                              <span
                                className={`text-xs font-bold ${
                                  practiceResult.score >= 75
                                    ? "text-emerald-500"
                                    : practiceResult.score >= 50
                                    ? "text-amber-500"
                                    : "text-primary"
                                }`}
                              >
                                Score: {practiceResult.score}/100
                              </span>
                            )}
                          </div>

                          {/* Evaluation Breakdown */}
                          {practiceResult && (
                            <div className="space-y-1.5 pt-1 text-[11px]">
                              {practiceResult.hit.length > 0 && (
                                <p className="text-emerald-600 dark:text-emerald-400">
                                  ✓ Covered concepts: {practiceResult.hit.join(", ")}
                                </p>
                              )}
                              {practiceResult.missing.length > 0 && (
                                <p className="text-amber-600 dark:text-amber-400">
                                  ⚠️ Missing technical nuances: {practiceResult.missing.join(", ")}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Pagination / Load More Controls */}
      {visibleCount < filtered.length && (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 pb-8">
          <button
            type="button"
            onClick={() => setVisibleCount((prev) => Math.min(prev + 30, filtered.length))}
            className="w-full sm:w-auto rounded-xl border bg-card px-6 py-2.5 text-xs font-semibold text-foreground hover:bg-muted transition-all shadow-2xs"
          >
            Load More Questions ({visibleCount} of {filtered.length})
          </button>
          <button
            type="button"
            onClick={() => setVisibleCount(filtered.length)}
            className="w-full sm:w-auto rounded-xl bg-primary/10 text-primary px-5 py-2.5 text-xs font-semibold hover:bg-primary/20 transition-all"
          >
            Show All ({filtered.length})
          </button>
        </div>
      )}
    </div>
  );
}
