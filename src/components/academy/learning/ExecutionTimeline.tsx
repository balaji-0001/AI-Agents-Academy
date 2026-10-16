import React, { useState } from "react";
import { Clock, Cpu, Code, User, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";

export interface TimelineStep {
  number: number;
  title: string;
  actor: "llm" | "app" | "user" | "external";
  description: string;
  input: string;
  output: string;
  failureMode?: string;
  isModelReasoning?: boolean;
}

interface ExecutionTimelineProps {
  title?: string;
  subtitle?: string;
  steps: TimelineStep[];
  className?: string;
}

export function ExecutionTimeline({
  title = "Step-by-Step System Execution",
  subtitle = "Traced runtime timeline distinguishing LLM reasoning from deterministic application logic",
  steps,
  className = "",
}: ExecutionTimelineProps) {
  const [selectedStep, setSelectedStep] = useState<number>(1);

  const getActorBadge = (actor: string) => {
    switch (actor) {
      case "llm":
        return {
          icon: Cpu,
          label: "LLM (Probabilistic)",
          className: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30",
        };
      case "app":
        return {
          icon: Code,
          label: "Application (Deterministic)",
          className: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
        };
      case "user":
        return {
          icon: User,
          label: "User Actor",
          className: "bg-success/15 text-success border-success/30",
        };
      default:
        return {
          icon: Clock,
          label: "External Service",
          className: "bg-warning/20 text-warning border-warning/30",
        };
    }
  };

  const active = steps.find((s) => s.number === selectedStep) ?? steps[0]!;
  const ActiveIcon = getActorBadge(active.actor).icon;

  return (
    <div className={`rounded-xl border bg-card p-5 shadow-sm space-y-5 ${className}`}>
      <div className="border-b pb-3">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          <h3 className="font-bold text-base text-foreground">{title}</h3>
        </div>
        {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
      </div>

      {/* Step scrubber track */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {steps.map((st) => {
          const isSelected = st.number === selectedStep;
          const badge = getActorBadge(st.actor);
          const Icon = badge.icon;
          return (
            <button
              key={st.number}
              type="button"
              onClick={() => setSelectedStep(st.number)}
              className={`flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition-all ${
                isSelected
                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                  : "border-border bg-card hover:bg-accent text-foreground"
              }`}
            >
              <span className={`grid h-5 w-5 place-items-center rounded-full text-[10px] ${isSelected ? "bg-primary-foreground text-primary font-bold" : "bg-muted text-muted-foreground"}`}>
                {st.number}
              </span>
              <Icon className="h-3.5 w-3.5 opacity-80" />
              <span className="truncate max-w-[120px]">{st.title}</span>
            </button>
          );
        })}
      </div>

      {/* Active Step Detailed Card */}
      <div className="rounded-xl border border-border/80 bg-background/60 p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-3">
          <div className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
              {active.number}
            </span>
            <h4 className="font-bold text-sm text-foreground">{active.title}</h4>
          </div>
          <div className={`flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${getActorBadge(active.actor).className}`}>
            <ActiveIcon className="h-3.5 w-3.5" />
            {getActorBadge(active.actor).label}
          </div>
        </div>

        <p className="text-sm leading-relaxed text-foreground">{active.description}</p>

        {/* Inputs vs Outputs */}
        <div className="grid gap-3 sm:grid-cols-2 text-xs">
          <div className="rounded-lg border bg-card p-3">
            <b className="text-[11px] uppercase tracking-wider text-muted-foreground">Input Data</b>
            <pre className="mt-1 font-mono text-[11px] text-foreground/90 whitespace-pre-wrap">{active.input}</pre>
          </div>
          <div className="rounded-lg border bg-card p-3">
            <b className="text-[11px] uppercase tracking-wider text-muted-foreground">Output / State Change</b>
            <pre className="mt-1 font-mono text-[11px] text-foreground/90 whitespace-pre-wrap">{active.output}</pre>
          </div>
        </div>

        {/* Failure mode alert */}
        {active.failureMode && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
            <div>
              <b className="font-semibold text-destructive">What could fail at this step:</b>
              <p className="mt-0.5 text-foreground/90 leading-relaxed">{active.failureMode}</p>
            </div>
          </div>
        )}

        {/* Step navigation buttons */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            disabled={selectedStep <= 1}
            onClick={() => setSelectedStep((p) => Math.max(p - 1, 1))}
            className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-accent disabled:opacity-40"
          >
            Previous Step
          </button>
          <span className="text-xs text-muted-foreground">
            Step {selectedStep} of {steps.length}
          </span>
          <button
            type="button"
            disabled={selectedStep >= steps.length}
            onClick={() => setSelectedStep((p) => Math.min(p + 1, steps.length))}
            className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-40"
          >
            Next Step
          </button>
        </div>
      </div>
    </div>
  );
}

