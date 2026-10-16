import React, { useState } from "react";
import { Briefcase, ArrowRight, AlertTriangle, CheckCircle, ShieldAlert } from "lucide-react";

export interface CaseStudy {
  title: string;
  industry: string;
  goal: string;
  userInput: string;
  componentsInvolved: string[];
  workflowSteps: string[];
  expectedOutput: string;
  failureScenarios: {
    failure: string;
    guardrailFix: string;
  }[];
}

interface RealWorldExampleProps {
  title?: string;
  examples: CaseStudy[];
  className?: string;
}

export function RealWorldExample({
  title = "Production Real-World Use Cases",
  examples,
  className = "",
}: RealWorldExampleProps) {
  const [selectedIdx, setSelectedIdx] = useState<number>(0);

  const active = examples[selectedIdx] ?? examples[0]!;

  return (
    <div className={`space-y-4 rounded-xl border bg-card p-5 shadow-sm ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
        <div className="flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-primary" />
          <h3 className="font-bold text-base text-foreground">{title}</h3>
        </div>

        {/* Tab pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {examples.map((ex, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedIdx(idx)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all whitespace-nowrap ${
                selectedIdx === idx
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {ex.title}
            </button>
          ))}
        </div>
      </div>

      {/* Case Study Body */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">{active.industry}</span>
            <h4 className="font-bold text-base text-foreground mt-0.5">{active.title}</h4>
          </div>
          <div className="rounded-md border bg-muted/50 px-3 py-1 text-xs text-muted-foreground">
            <b>Goal:</b> {active.goal}
          </div>
        </div>

        {/* Input & Expected Output */}
        <div className="grid gap-3 sm:grid-cols-2 text-xs">
          <div className="rounded-lg border bg-background/60 p-3.5">
            <b className="text-[11px] uppercase tracking-wider text-muted-foreground">User Query / Trigger Input:</b>
            <p className="mt-1 font-mono text-[11px] text-foreground/90 bg-muted/40 p-2 rounded">{active.userInput}</p>
          </div>
          <div className="rounded-lg border bg-background/60 p-3.5">
            <b className="text-[11px] uppercase tracking-wider text-muted-foreground">Validated System Output:</b>
            <p className="mt-1 font-mono text-[11px] text-foreground/90 bg-muted/40 p-2 rounded">{active.expectedOutput}</p>
          </div>
        </div>

        {/* Components Involved */}
        <div className="rounded-lg border bg-muted/20 p-3 text-xs">
          <b className="text-muted-foreground font-semibold">Components & Subsystems:</b>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {active.componentsInvolved.map((c, i) => (
              <span key={i} className="rounded-md bg-card border px-2 py-0.5 font-medium text-foreground">
                {c}
              </span>
            ))}
          </div>
        </div>

        {/* Workflow sequence */}
        <div className="rounded-lg border bg-card p-4 space-y-2 text-xs">
          <b className="text-foreground font-semibold">End-to-End Workflow:</b>
          <div className="space-y-1.5 pt-1">
            {active.workflowSteps.map((step, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-primary/20 text-primary font-bold text-[10px] mt-0.5">
                  {idx + 1}
                </span>
                <span className="text-muted-foreground leading-relaxed">{step}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Failure Scenarios & Mitigations */}
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 space-y-2 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-destructive">
            <ShieldAlert className="h-4 w-4" />
            Possible Failure Scenarios & Production Guardrails
          </div>
          <div className="space-y-2 pt-1">
            {active.failureScenarios.map((fs, i) => (
              <div key={i} className="rounded border bg-card p-2.5">
                <p className="text-destructive font-medium">Failure: {fs.failure}</p>
                <p className="mt-0.5 text-foreground/90"><b className="text-success">Guardrail Fix:</b> {fs.guardrailFix}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

