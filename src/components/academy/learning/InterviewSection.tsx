import React, { useState } from "react";
import { HelpCircle, ChevronDown, ChevronUp, CheckCircle, XCircle, ArrowRight } from "lucide-react";

export interface InterviewQnA {
  id: string;
  level: "Beginner" | "Intermediate" | "Advanced" | "Scenario";
  question: string;
  strongAnswer: string;
  whyItsStrong: string;
  weakAnswer: string;
  whyItsWeak: string;
  followUp: string;
  companyTag?: string;
}

interface InterviewSectionProps {
  title?: string;
  subtitle?: string;
  questions: InterviewQnA[];
  className?: string;
}

export function InterviewSection({
  title = "Interview Preparation & Defense",
  subtitle = "Questions frequently asked by top tech and AI infrastructure teams",
  questions,
  className = "",
}: InterviewSectionProps) {
  const [expandedId, setExpandedId] = useState<string | null>(questions[0]?.id ?? null);
  const [activeFilter, setActiveFilter] = useState<string>("All");

  const filtered = questions.filter(
    (q) => activeFilter === "All" || q.level === activeFilter
  );

  return (
    <div className={`space-y-4 rounded-xl border bg-card p-5 shadow-sm ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
        <div>
          <div className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            <h3 className="font-bold text-base text-foreground">{title}</h3>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
        </div>

        {/* Filter pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {["All", "Beginner", "Intermediate", "Advanced", "Scenario"].map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => setActiveFilter(lvl)}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                activeFilter === lvl
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Accordion Questions */}
      <div className="space-y-3">
        {filtered.map((item) => {
          const isOpen = expandedId === item.id;
          return (
            <div key={item.id} className="rounded-lg border bg-background/60 overflow-hidden transition-all">
              <button
                type="button"
                onClick={() => setExpandedId(isOpen ? null : item.id)}
                className="w-full p-4 text-left flex items-start justify-between gap-3 hover:bg-accent/40 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                        item.level === "Beginner"
                          ? "bg-success/15 text-success"
                          : item.level === "Intermediate"
                          ? "bg-warning/20 text-warning"
                          : item.level === "Advanced"
                          ? "bg-destructive/15 text-destructive"
                          : "bg-purple-500/15 text-purple-600 dark:text-purple-400"
                      }`}
                    >
                      {item.level}
                    </span>
                    {item.companyTag && (
                      <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-mono text-muted-foreground">
                        {item.companyTag}
                      </span>
                    )}
                  </div>
                  <p className="font-bold text-sm text-foreground">{item.question}</p>
                </div>
                {isOpen ? <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground mt-1" /> : <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground mt-1" />}
              </button>

              {isOpen && (
                <div className="border-t p-4 space-y-3 text-xs">
                  {/* Model Strong Answer */}
                  <div className="rounded-lg border border-success/30 bg-success/10 p-3.5 space-y-1">
                    <span className="font-bold text-success flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                      <CheckCircle className="h-3.5 w-3.5" />
                      Model Answer (Strong)
                    </span>
                    <p className="leading-relaxed text-foreground/90">{item.strongAnswer}</p>
                    <p className="text-[11px] text-muted-foreground pt-1 border-t border-success/20">
                      <b>Why this answers impresses:</b> {item.whyItsStrong}
                    </p>
                  </div>

                  {/* Common Weak Answer */}
                  <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3.5 space-y-1">
                    <span className="font-bold text-destructive flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                      <XCircle className="h-3.5 w-3.5" />
                      Common Weak Answer
                    </span>
                    <p className="leading-relaxed text-foreground/90 italic">"{item.weakAnswer}"</p>
                    <p className="text-[11px] text-muted-foreground pt-1 border-t border-destructive/20">
                      <b>Why it is incomplete:</b> {item.whyItsWeak}
                    </p>
                  </div>

                  {/* Follow-up Question */}
                  <div className="rounded-lg border bg-card p-3 flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <b className="text-foreground">Likely Follow-Up Probe:</b>
                      <p className="mt-0.5 text-muted-foreground italic">{item.followUp}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

