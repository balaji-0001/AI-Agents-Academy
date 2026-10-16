import React from "react";
import { AlertTriangle, CheckCircle, Shield, Wrench, Bug } from "lucide-react";

export interface MistakeItem {
  mistake: string;
  whyItHappens: string;
  correctApproach: string;
  category?: "beginner" | "security" | "performance" | "architecture";
}

interface CommonMistakesProps {
  title?: string;
  mistakes: MistakeItem[];
  productionChecklist?: string[];
  className?: string;
}

export function CommonMistakes({
  title = "Common Mistakes, Pitfalls & Production Best Practices",
  mistakes,
  productionChecklist,
  className = "",
}: CommonMistakesProps) {
  const getCategoryBadge = (cat?: string) => {
    switch (cat) {
      case "security":
        return "bg-destructive/15 text-destructive border-destructive/30";
      case "performance":
        return "bg-warning/20 text-warning border-warning/30";
      case "architecture":
        return "bg-primary/15 text-primary border-primary/30";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <div className={`space-y-4 rounded-xl border bg-card p-5 shadow-sm ${className}`}>
      <div className="border-b pb-3">
        <div className="flex items-center gap-2">
          <Bug className="h-5 w-5 text-warning" />
          <h3 className="font-bold text-base text-foreground">{title}</h3>
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Critical failure modes, subtle edge cases, and industry-standard defensive patterns
        </p>
      </div>

      {/* Mistake cards */}
      <div className="space-y-3">
        {mistakes.map((item, idx) => (
          <div key={idx} className="rounded-lg border bg-background/60 p-4 space-y-2 text-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-sm text-destructive flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                {item.mistake}
              </span>
              {item.category && (
                <span className={`rounded border px-2 py-0.5 text-[10px] font-semibold uppercase ${getCategoryBadge(item.category)}`}>
                  {item.category}
                </span>
              )}
            </div>

            <div className="text-muted-foreground leading-relaxed">
              <b className="text-foreground">Why developers make this mistake:</b> {item.whyItHappens}
            </div>

            <div className="rounded border border-success/30 bg-success/10 p-2.5 text-foreground/90 leading-relaxed">
              <b className="text-success flex items-center gap-1 mb-0.5 font-bold">
                <CheckCircle className="h-3.5 w-3.5" />
                Production Best Practice Fix:
              </b>
              {item.correctApproach}
            </div>
          </div>
        ))}
      </div>

      {/* Production Readiness Checklist */}
      {productionChecklist && productionChecklist.length > 0 && (
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 space-y-2 text-xs">
          <span className="font-bold text-primary flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
            <Shield className="h-4 w-4" />
            Production Hardening Checklist
          </span>
          <div className="grid gap-2 sm:grid-cols-2 pt-1">
            {productionChecklist.map((chk, i) => (
              <div key={i} className="flex items-start gap-2">
                <CheckCircle className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />
                <span className="text-foreground/90 leading-snug">{chk}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

