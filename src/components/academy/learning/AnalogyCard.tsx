import React from "react";
import { Sparkles, Lightbulb, CheckCircle2, AlertTriangle, HelpCircle } from "lucide-react";

export interface AnalogyData {
  title: string;
  story: string;
  whereItWorks: string;
  whereItDiffers: string;
}

export interface ProblemBeforeSolution {
  whatWasTried: string;
  whySimplerFailed: string;
  difficultiesEncountered: string[];
  howConceptSolvesIt: string;
  remainingLimitations: string;
}

interface AnalogyCardProps {
  analogy: AnalogyData;
  problemBeforeSolution?: ProblemBeforeSolution;
  className?: string;
}

export function AnalogyCard({
  analogy,
  problemBeforeSolution,
  className = "",
}: AnalogyCardProps) {
  return (
    <div className={`space-y-4 rounded-xl border bg-card p-5 shadow-sm ${className}`}>
      {/* Real-world analogy section */}
      <div>
        <div className="flex items-center gap-2 border-b pb-3 mb-3">
          <Lightbulb className="h-5 w-5 text-warning" />
          <h3 className="font-bold text-base text-foreground">Real-World Analogy: {analogy.title}</h3>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">{analogy.story}</p>

        <div className="grid gap-3 sm:grid-cols-2 pt-3 text-xs">
          <div className="rounded-lg border border-success/30 bg-success/10 p-3">
            <span className="flex items-center gap-1.5 font-bold text-success mb-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Where the Analogy Works
            </span>
            <p className="leading-relaxed text-foreground/90">{analogy.whereItWorks}</p>
          </div>
          <div className="rounded-lg border border-warning/30 bg-warning/10 p-3">
            <span className="flex items-center gap-1.5 font-bold text-warning mb-1">
              <AlertTriangle className="h-3.5 w-3.5" />
              Where the Real AI System Differs
            </span>
            <p className="leading-relaxed text-foreground/90">{analogy.whereItDiffers}</p>
          </div>
        </div>
      </div>

      {/* The Problem Before The Solution */}
      {problemBeforeSolution && (
        <div className="mt-4 rounded-lg border bg-muted/20 p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
            <HelpCircle className="h-4 w-4" />
            The Engineering Problem Before This Solution Existed
          </div>
          <div className="grid gap-2.5 sm:grid-cols-2 text-xs">
            <div className="rounded border bg-card p-3">
              <b className="text-foreground">What developers were trying to achieve:</b>
              <p className="mt-0.5 text-muted-foreground leading-relaxed">{problemBeforeSolution.whatWasTried}</p>
            </div>
            <div className="rounded border bg-card p-3">
              <b className="text-foreground">Why simpler approaches were insufficient:</b>
              <p className="mt-0.5 text-muted-foreground leading-relaxed">{problemBeforeSolution.whySimplerFailed}</p>
            </div>
          </div>
          <div className="rounded border bg-card p-3 text-xs">
            <b className="text-foreground">Major difficulties encountered:</b>
            <ul className="mt-1 list-disc pl-5 space-y-1 text-muted-foreground">
              {problemBeforeSolution.difficultiesEncountered.map((diff, idx) => (
                <li key={idx}>{diff}</li>
              ))}
            </ul>
          </div>
          <div className="grid gap-2.5 sm:grid-cols-2 text-xs">
            <div className="rounded border border-success/30 bg-success/10 p-3">
              <b className="text-success">How this concept addresses the problem:</b>
              <p className="mt-0.5 text-foreground/90 leading-relaxed">{problemBeforeSolution.howConceptSolvesIt}</p>
            </div>
            <div className="rounded border border-border bg-card p-3">
              <b className="text-muted-foreground">Remaining limitations to keep in mind:</b>
              <p className="mt-0.5 text-muted-foreground leading-relaxed">{problemBeforeSolution.remainingLimitations}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

