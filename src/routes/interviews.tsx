import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  Mic,
  Square,
  RotateCcw,
  Keyboard,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Volume2,
  GraduationCap,
  Send,
} from "lucide-react";
import { QUESTIONS, scoreAnswer } from "@/lib/academy-data";
import { PageHeader, Panel } from "@/components/academy/ui";
import {
  evaluateMockInterviewAnswer,
  InterviewEvaluation,
  isGeminiConfigured,
} from "@/lib/gemini";
import { LiveVoiceSessionView } from "@/components/academy/voice/LiveVoiceSessionView";

export const Route = createFileRoute("/interviews")({
  head: () => ({
    meta: [
      { title: "Mock Interviews — AI Agents Academy" },
      { name: "description", content: "Text and voice mock interviews with Gemini AI interviewer." },
      { property: "og:title", content: "Mock Interviews — AI Agents Academy" },
      { property: "og:description", content: "Text and voice mock interviews with Gemini AI interviewer." },
    ],
  }),
  component: Interviews,
});

type Result = {
  q: string;
  topic: string;
  answer: string;
  score: number;
  skipped?: boolean;
  verdict?: "correct" | "partially_correct" | "incorrect";
  politeFeedback?: string;
  whatMissing?: string;
  correctExplanation?: string;
  practicalExample?: string;
  followUpCheck?: string;
  followUpAnswer?: string;
  ref: string;
};

const field = "w-full rounded-md border bg-card p-2 text-sm";

export function speakAloud(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    speechSynthesis.cancel();
    const cleanText = text.replace(/[*_#`[\]()]/g, " ").trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    const voices = speechSynthesis.getVoices();
    // Prioritize natural Indian English voice if available in user's browser
    const indianVoice = voices.find(
      (v) => v.lang === "en-IN" || v.name.toLowerCase().includes("india")
    );
    if (indianVoice) {
      utterance.voice = indianVoice;
    }
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn("Speech synthesis error:", err);
  }
}

function Interviews() {
  const [mode, setMode] = useState<"text" | "voice">("voice");
  const [cfg, setCfg] = useState({
    role: "AI Engineer",
    level: "Intermediate",
    difficulty: "Medium",
    focus: "Mixed",
    type: "Technical",
    duration: "20",
  });
  const [active, setActive] = useState(false);
  const [i, setI] = useState(0);
  const [answer, setAnswer] = useState("");
  const [followUpAnswer, setFollowUpAnswer] = useState("");
  const [currentEval, setCurrentEval] = useState<InterviewEvaluation | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [results, setResults] = useState<Result[]>([]);
  const [done, setDone] = useState(false);

  const hasGemini = isGeminiConfigured();

  const pool = QUESTIONS.filter((q) => {
    const matchType =
      cfg.type === "Technical" ? q.type === "Technical" || q.type === "System Design" : q.type === cfg.type;
    const matchDiff = cfg.difficulty === "All" || q.difficulty === cfg.difficulty;
    const matchFocus =
      cfg.focus === "Mixed" ||
      q.topic.toLowerCase().includes(cfg.focus.toLowerCase()) ||
      (cfg.focus === "Python" && q.topic.toLowerCase().includes("python")) ||
      (cfg.focus === "DSA" && q.topic.toLowerCase().includes("dsa"));
    return matchType && matchFocus && matchDiff;
  });
  const qs = (pool.length ? pool : QUESTIONS).slice(0, 5);
  const q = qs[i] ?? qs[0]!;

  // Handle Answer Submission -> triggers friendly Gemini evaluation
  const handleSubmitAnswer = async () => {
    if (!answer.trim() || isEvaluating) return;
    setIsEvaluating(true);

    try {
      const evaluation = await evaluateMockInterviewAnswer({
        question: q.q,
        userAnswer: answer,
        referenceAnswer: q.answer,
        topic: q.topic,
        role: cfg.role,
        level: cfg.level,
      });

      setCurrentEval(evaluation);

      // In voice mode, speak the interviewer's feedback aloud
      if (mode === "voice") {
        speakAloud(evaluation.speechText);
      }
    } catch (err) {
      console.error("Evaluation error:", err);
      // Fallback evaluation
      const fallbackScore = scoreAnswer(answer, q.keys);
      setCurrentEval({
        verdict: fallbackScore.score > 75 ? "correct" : "partially_correct",
        score: fallbackScore.score,
        politeFeedback: "Good attempt! I appreciate you sharing your thoughts on this.",
        whatWasMissingOrIncorrect:
          fallbackScore.missing.length > 0
            ? `It would be great to also touch upon: ${fallbackScore.missing.join(", ")}.`
            : undefined,
        correctExplanation: q.answer,
        practicalExample: "In production AI systems, this ensures reliability and eliminates edge-case failures.",
        followUpCheck: "Does this explanation make sense to you, or would you like to discuss further?",
        speechText: `Good attempt! ${q.answer}. Does this make sense to you?`,
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  // Move to next question after reviewing feedback
  const handleNextQuestion = () => {
    if (!currentEval) return;
    const newResult: Result = {
      q: q.q,
      topic: q.topic,
      answer,
      followUpAnswer: followUpAnswer.trim() ? followUpAnswer.trim() : undefined,
      score: currentEval.score,
      verdict: currentEval.verdict,
      politeFeedback: currentEval.politeFeedback,
      whatMissing: currentEval.whatWasMissingOrIncorrect,
      correctExplanation: currentEval.correctExplanation,
      practicalExample: currentEval.practicalExample,
      followUpCheck: currentEval.followUpCheck,
      ref: q.answer,
    };

    const next = [...results, newResult];
    setResults(next);
    setAnswer("");
    setFollowUpAnswer("");
    setCurrentEval(null);

    if (i + 1 >= qs.length) {
      setDone(true);
      setActive(false);
      localStorage.setItem("academy-last-interview", JSON.stringify(next));
    } else {
      setI(i + 1);
    }
  };

  const handleSkipQuestion = () => {
    const skippedResult: Result = {
      q: q.q,
      topic: q.topic,
      answer: "Skipped",
      score: 0,
      skipped: true,
      ref: q.answer,
      correctExplanation: q.answer,
    };
    const next = [...results, skippedResult];
    setResults(next);
    setAnswer("");
    setFollowUpAnswer("");
    setCurrentEval(null);

    if (i + 1 >= qs.length) {
      setDone(true);
      setActive(false);
      localStorage.setItem("academy-last-interview", JSON.stringify(next));
    } else {
      setI(i + 1);
    }
  };

  const reset = () => {
    setActive(false);
    setDone(false);
    setI(0);
    setResults([]);
    setAnswer("");
    setFollowUpAnswer("");
    setCurrentEval(null);
  };

  if (done) {
    const overall = results.length
      ? Math.round(results.reduce((a, r) => a + r.score, 0) / results.length)
      : 0;

    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <PageHeader
          title="Interview Performance Report"
          subtitle="Comprehensive evaluation from your Gemini Senior AI Interviewer"
          badge="Verified Interview Assessment"
        />

        <div className="rounded-xl border bg-card p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Overall Technical Score
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-5xl font-extrabold text-primary">{overall}</span>
              <span className="text-xl text-muted-foreground font-semibold">/ 100</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {overall >= 80
                ? "🌟 Outstanding grasp of AI engineering and systems concepts!"
                : overall >= 60
                ? "👍 Good foundation with solid technical attempts. Review explanations below to bridge remaining gaps."
                : "📚 Great practice run! Deep dive into the explanations and code walkthroughs below."}
            </p>
          </div>
          <button
            onClick={reset}
            className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 shadow-sm"
          >
            Start New Session
          </button>
        </div>

        <div className="space-y-4">
          {results.map((r, k) => (
            <div key={k} className="rounded-xl border bg-card p-5 space-y-3 shadow-xs">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                      Q{k + 1} • {r.topic}
                    </span>
                    {r.verdict && (
                      <span
                        className={`rounded px-2 py-0.5 text-[11px] font-bold ${
                          r.verdict === "correct"
                            ? "bg-success/20 text-success"
                            : r.verdict === "partially_correct"
                            ? "bg-warning/20 text-warning"
                            : "bg-destructive/15 text-destructive"
                        }`}
                      >
                        {r.verdict === "correct"
                          ? "✓ Strong"
                          : r.verdict === "partially_correct"
                          ? "⚠️ Partial"
                          : "💡 Refine"}
                      </span>
                    )}
                  </div>
                  <h4 className="font-semibold text-base text-foreground">{r.q}</h4>
                </div>
                <span className="font-bold text-sm text-primary shrink-0">
                  {r.skipped ? "Skipped" : `${r.score}/100`}
                </span>
              </div>

              {/* Candidate's Answer */}
              <div className="rounded-lg bg-muted/40 p-3 text-xs space-y-1">
                <span className="font-bold text-muted-foreground uppercase text-[10px] tracking-wider">
                  Your Answer:
                </span>
                <p className="text-foreground">{r.answer}</p>
              </div>

              {/* Interviewer Feedback */}
              {r.politeFeedback && (
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-primary text-[11px]">
                    <GraduationCap className="h-3.5 w-3.5" />
                    Interviewer's Assessment:
                  </div>
                  <p className="text-foreground/90">{r.politeFeedback}</p>
                </div>
              )}

              {/* Missing Details */}
              {r.whatMissing && (
                <div className="rounded-lg border border-warning/30 bg-warning/5 p-3 text-xs space-y-1">
                  <span className="font-bold text-warning text-[11px]">Key Technical Nuance:</span>
                  <p className="text-foreground/90">{r.whatMissing}</p>
                </div>
              )}

              {/* Correct Concept & Practical Example */}
              {r.correctExplanation && (
                <div className="space-y-2 text-xs border-t pt-2.5">
                  <p className="text-foreground/90 leading-relaxed">
                    <strong className="text-foreground">Correct Concept: </strong>
                    {r.correctExplanation}
                  </p>
                  {r.practicalExample && (
                    <p className="text-muted-foreground leading-relaxed">
                      <strong className="text-foreground">Practical Example: </strong>
                      {r.practicalExample}
                    </p>
                  )}
                </div>
              )}

              {/* Follow-up Note */}
              {r.followUpAnswer && (
                <div className="rounded bg-muted/60 p-2.5 text-xs">
                  <span className="font-semibold text-foreground">Follow-up check response: </span>
                  <span className="text-muted-foreground">{r.followUpAnswer}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title={mode === "voice" ? "Live Voice Technical Interview" : "Mock Technical Interview"}
        subtitle={
          mode === "voice"
            ? "Real-time, two-way conversational voice interview powered by Gemini with personalities, Indian English, and instant guidance"
            : "Practice with your friendly Gemini AI interviewer featuring personalized coaching, explanations, and follow-ups"
        }
        badge={hasGemini ? "⚡ Powered by Gemini AI (Live Engine)" : "Built-in Evaluation Engine"}
      />

      <div className="mb-6 inline-flex rounded-xl border p-1 bg-card shadow-xs">
        <button
          type="button"
          onClick={() => setMode("voice")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs sm:text-sm font-bold transition-all ${
            mode === "voice"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Mic className="h-4 w-4" />
          <span>🎙️ Live Voice Interview (Gemini Live)</span>
        </button>
        <button
          type="button"
          onClick={() => setMode("text")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs sm:text-sm font-bold transition-all ${
            mode === "text"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Keyboard className="h-4 w-4" />
          <span>📝 Structured Text Interview</span>
        </button>
      </div>

      {mode === "voice" ? (
        <LiveVoiceSessionView onSwitchToText={() => setMode("text")} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        {/* Setup Column */}
        <Panel title="Interview Setup">
          <div className="space-y-3">
            {(
              [
                ["role", ["AI Engineer", "Agentic AI Engineer", "LLM Engineer", "Generative AI Engineer"]],
                ["level", ["Beginner", "Fresher", "Intermediate", "Advanced"]],
                ["difficulty", ["Easy", "Medium", "Hard", "All"]],
                ["focus", ["Mixed", "Agents", "RAG", "MCP", "Python", "DSA", "LLMs", "LangGraph", "System design", "Security"]],
                ["type", ["Technical", "System Design", "Coding", "HR"]],
                ["duration", ["10", "20", "30"]],
              ] as const
            ).map(([k, opts]) => (
              <label key={k} className="block text-xs capitalize text-muted-foreground font-semibold">
                {k}
                <select
                  disabled={active}
                  value={cfg[k]}
                  onChange={(e) => setCfg({ ...cfg, [k]: e.target.value })}
                  className={`${field} mt-1 text-foreground font-normal`}
                >
                  {opts.map((o) => (
                    <option key={o} value={o}>
                      {k === "duration" ? `${o} minutes` : o}
                    </option>
                  ))}
                </select>
              </label>
            ))}
            <button
              onClick={() => (active ? reset() : setActive(true))}
              className={`w-full rounded-lg py-2.5 text-sm font-semibold transition-all shadow-sm ${
                active ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : "bg-primary text-primary-foreground hover:bg-primary/90"
              }`}
            >
              {active ? "End Session" : "Start Interview"}
            </button>
          </div>
        </Panel>

        {/* Main Interview Stage */}
        <div className="min-w-0 space-y-4">
          {!active ? (
            <Panel>
              <div className="py-20 text-center space-y-3">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary/10 text-primary">
                  <GraduationCap className="h-7 w-7" />
                </div>
                <h3 className="font-bold text-lg text-foreground">Ready for your AI Engineering Mock Interview?</h3>
                <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                  Your friendly Indian technical interviewer will ask you real company questions. If your answer is incomplete or wrong, the interviewer will politely guide you with the exact correct concept and a practical example!
                </p>
                <button
                  onClick={() => setActive(true)}
                  className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 shadow-sm"
                >
                  Begin Interview
                </button>
              </div>
            </Panel>
          ) : (
            <>
              {/* Question Card */}
              <Panel>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-primary/20 px-3 py-1 text-xs font-bold text-primary">
                    Question {i + 1} of {qs.length}
                  </span>
                  <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                    {q.topic}
                  </span>
                  {q.company && (
                    <span className="rounded-md bg-accent px-2 py-0.5 text-xs font-semibold text-accent-foreground">
                      {q.company}
                    </span>
                  )}
                  <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-semibold text-foreground ml-auto">
                    {q.difficulty}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-foreground leading-snug">{q.q}</h3>
              </Panel>

              {/* EVALUATING STATE */}
              {isEvaluating && (
                <div className="rounded-xl border border-primary/30 bg-primary/5 p-8 text-center space-y-3 animate-pulse">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                  <p className="font-semibold text-sm text-foreground">
                    Your interviewer is reviewing your response...
                  </p>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    Analyzing technical depth, accuracy, and preparing personalized guidance in natural Indian English.
                  </p>
                </div>
              )}

              {/* INTERVIEWER FEEDBACK STATE */}
              {currentEval && !isEvaluating && (
                <div className="space-y-4">
                  <div className="rounded-xl border bg-card p-5 space-y-4 shadow-sm">
                    {/* Header with Interviewer Persona */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="grid h-9 w-9 place-items-center rounded-full bg-primary/15 text-primary border border-primary/30">
                          <GraduationCap className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-foreground flex items-center gap-1.5">
                            Senior Technical Interviewer
                            <span className="text-[11px] font-normal text-muted-foreground">(Friendly Coaching)</span>
                          </p>
                          <span className="text-[11px] text-muted-foreground">
                            AI Engineering & System Architecture
                          </span>
                        </div>
                      </div>

                      {/* Verdict Badge */}
                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        <span
                          className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
                            currentEval.verdict === "correct"
                              ? "bg-success/20 text-success border border-success/30"
                              : currentEval.verdict === "partially_correct"
                              ? "bg-warning/20 text-warning border border-warning/30"
                              : "bg-primary/20 text-primary border border-primary/30"
                          }`}
                        >
                          {currentEval.verdict === "correct" ? (
                            <>
                              <CheckCircle2 className="h-3.5 w-3.5" /> Strong Answer ({currentEval.score}/100)
                            </>
                          ) : currentEval.verdict === "partially_correct" ? (
                            <>
                              <AlertCircle className="h-3.5 w-3.5" /> Good Attempt ({currentEval.score}/100)
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-3.5 w-3.5" /> Let's Refine ({currentEval.score}/100)
                            </>
                          )}
                        </span>
                        {mode === "voice" && (
                          <button
                            type="button"
                            onClick={() => speakAloud(currentEval.speechText)}
                            title="Replay Interviewer Audio"
                            aria-label="Replay audio"
                            className="rounded-lg border p-1.5 hover:bg-accent text-primary transition-colors"
                          >
                            <Volume2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Polite & Friendly Feedback */}
                    <div className="rounded-lg bg-primary/5 border border-primary/15 p-3.5 text-sm text-foreground leading-relaxed">
                      <p>{currentEval.politeFeedback}</p>
                    </div>

                    {/* Explanation of what was missing (if any) */}
                    {currentEval.whatWasMissingOrIncorrect && (
                      <div className="rounded-lg bg-warning/10 border border-warning/25 p-3.5 text-xs text-foreground space-y-1">
                        <span className="font-bold text-warning uppercase tracking-wider text-[10px]">
                          Where the technical gap was:
                        </span>
                        <p className="leading-relaxed">{currentEval.whatWasMissingOrIncorrect}</p>
                      </div>
                    )}

                    {/* The Correct Technical Concept & Practical Example */}
                    <div className="rounded-lg border bg-muted/30 p-4 space-y-2 text-xs">
                      <div>
                        <span className="font-bold text-foreground text-xs block mb-1">
                          📘 Correct Technical Concept:
                        </span>
                        <p className="text-foreground/90 leading-relaxed text-xs">
                          {currentEval.correctExplanation}
                        </p>
                      </div>

                      {currentEval.practicalExample && (
                        <div className="pt-2 border-t border-border/50">
                          <span className="font-bold text-foreground text-xs block mb-1">
                            💡 Practical Real-World Example:
                          </span>
                          <p className="text-muted-foreground leading-relaxed text-xs">
                            {currentEval.practicalExample}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Follow-up Question / Understanding Check Box */}
                    {currentEval.followUpCheck && (
                      <div className="rounded-xl border border-primary/30 bg-primary/10 p-4 space-y-3">
                        <div className="flex items-center gap-1.5 font-bold text-xs text-primary uppercase tracking-wider">
                          <HelpCircle className="h-4 w-4" />
                          Interviewer Follow-up Check:
                        </div>
                        <p className="text-sm font-medium text-foreground">
                          {currentEval.followUpCheck}
                        </p>

                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={followUpAnswer}
                            onChange={(e) => setFollowUpAnswer(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleNextQuestion();
                            }}
                            placeholder="Type your quick response or understanding..."
                            className="flex-1 rounded-lg border bg-card px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-ring text-foreground"
                          />
                          <button
                            type="button"
                            onClick={handleNextQuestion}
                            className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 flex items-center gap-1.5 shadow-sm shrink-0"
                          >
                            <span>Continue</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs text-muted-foreground">
                        Question {i + 1} reviewed
                      </span>
                      <button
                        type="button"
                        onClick={handleNextQuestion}
                        className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 flex items-center gap-2 shadow-sm"
                      >
                        <span>{i + 1 >= qs.length ? "Finish & View Full Report" : "Next Question"}</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ANSWER INPUT STAGE (When not evaluating and no current eval shown) */}
              {!currentEval && !isEvaluating && (
                <>
                  {mode === "voice" && (
                    <VoiceControls
                      question={q.q}
                      onTranscript={(t) => setAnswer((a) => (a ? a + " " : "") + t)}
                      onText={() => setMode("text")}
                    />
                  )}

                  <textarea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    rows={6}
                    placeholder={
                      mode === "voice"
                        ? "Your speech will be transcribed here. You can also edit by typing before submitting..."
                        : "Type your technical answer here. Explain the concept, why it matters, and how you would apply it..."
                    }
                    className={`${field} p-3 text-sm focus:ring-2 focus:ring-ring outline-none`}
                  />

                  <div className="flex gap-3">
                    <button
                      disabled={!answer.trim()}
                      onClick={handleSubmitAnswer}
                      className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-all shadow-sm"
                    >
                      Submit Answer to Interviewer
                    </button>
                    <button
                      onClick={handleSkipQuestion}
                      className="rounded-lg border px-4 py-2.5 text-sm font-medium hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Skip Question
                    </button>
                  </div>
                </>
              )}

              {/* Previous Completed Questions Quick-List */}
              {results.length > 0 && (
                <Panel title="Completed In This Session">
                  <ul className="space-y-2 text-xs">
                    {results.map((r, k) => (
                      <li key={k} className="flex justify-between items-center gap-3 border-b pb-1.5 last:border-0 last:pb-0">
                        <span className="truncate font-medium text-foreground">
                          Q{k + 1}: {r.q}
                        </span>
                        <span
                          className={`font-semibold shrink-0 ${
                            r.skipped
                              ? "text-muted-foreground"
                              : r.score >= 80
                              ? "text-success"
                              : r.score >= 60
                              ? "text-warning"
                              : "text-primary"
                          }`}
                        >
                          {r.skipped ? "skipped" : `${r.score}/100`}
                        </span>
                      </li>
                    ))}
                  </ul>
                </Panel>
              )}
            </>
          )}
        </div>
      </div>
      )}
    </div>
  );
}

type SR = {
  start(): void;
  stop(): void;
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (e: {
    results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }>;
    resultIndex: number;
  }) => void;
  onerror: (e: { error: string }) => void;
  onend: () => void;
};

function VoiceControls({
  question,
  onTranscript,
  onText,
}: {
  question: string;
  onTranscript: (t: string) => void;
  onText: () => void;
}) {
  const [supported, setSupported] = useState(true);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState("");
  const rec = useRef<SR | null>(null);

  useEffect(() => {
    const W = window as unknown as {
      SpeechRecognition?: new () => SR;
      webkitSpeechRecognition?: new () => SR;
    };
    const C = W.SpeechRecognition ?? W.webkitSpeechRecognition;
    if (!C) {
      setSupported(false);
      return;
    }
    const r = new C();
    r.continuous = true;
    r.interimResults = false;
    r.lang = "en-IN"; // Natural Indian English recognition
    r.onresult = (e) => {
      for (let k = e.resultIndex; k < e.results.length; k++) {
        if (e.results[k]!.isFinal) onTranscript(e.results[k]![0]!.transcript);
      }
    };
    r.onerror = (e) =>
      setError(
        e.error === "not-allowed"
          ? "Microphone permission denied. Allow mic access or switch to text input."
          : `Recognition error: ${e.error}`
      );
    r.onend = () => setListening(false);
    rec.current = r;
    return () => r.stop();
  }, [onTranscript]);

  const speak = () => {
    speakAloud(question);
  };

  useEffect(() => {
    speak();
  }, [question]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = () => {
    setError("");
    if (listening) {
      rec.current?.stop();
    } else {
      try {
        rec.current?.start();
        setListening(true);
      } catch {
        setError("Could not start microphone.");
      }
    }
  };

  return (
    <Panel>
      {!supported && (
        <p className="mb-3 text-sm text-warning">
          Speech recognition isn't supported in this browser. Use Chrome or Edge, or type your answer below.
        </p>
      )}
      <div className="grid grid-cols-3 items-center gap-3 text-center text-xs">
        <button
          type="button"
          onClick={speak}
          className="rounded-lg border p-3 hover:bg-accent text-foreground transition-colors"
        >
          <RotateCcw className="mx-auto mb-1 h-4 w-4" />
          Repeat Question
        </button>
        <button
          type="button"
          disabled={!supported}
          onClick={toggle}
          aria-label={listening ? "Stop recording" : "Start recording"}
          className={`mx-auto grid h-16 w-16 place-items-center rounded-full disabled:opacity-40 shadow-sm transition-all ${
            listening ? "animate-pulse bg-destructive" : "bg-primary hover:bg-primary/90"
          } text-primary-foreground`}
        >
          {listening ? <Square className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
        </button>
        <button
          type="button"
          onClick={onText}
          className="rounded-lg border p-3 hover:bg-accent text-foreground transition-colors"
        >
          <Keyboard className="mx-auto mb-1 h-4 w-4" />
          Switch to Text
        </button>
      </div>
      {listening && <p className="mt-3 text-center text-xs font-semibold text-success animate-pulse">● Listening... Speak your answer now</p>}
      {error && <p className="mt-3 text-center text-xs text-destructive">{error}</p>}
    </Panel>
  );
}
