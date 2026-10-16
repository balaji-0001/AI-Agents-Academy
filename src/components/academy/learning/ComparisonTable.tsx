import React from "react";
import { ArrowLeftRight, Check, X, AlertCircle } from "lucide-react";

export interface ComparisonRow {
  aspect: string;
  conceptA: string;
  conceptB: string;
  winner?: "A" | "B" | "neutral";
}

interface ComparisonTableProps {
  title: string;
  conceptAName: string;
  conceptBName: string;
  rows: ComparisonRow[];
  summaryA: string;
  summaryB: string;
  whenToChooseA: string;
  whenToChooseB: string;
  className?: string;
}

export function ComparisonTable({
  title,
  conceptAName,
  conceptBName,
  rows,
  summaryA,
  summaryB,
  whenToChooseA,
  whenToChooseB,
  className = "",
}: ComparisonTableProps) {
  return (
    <div className={`space-y-4 rounded-xl border bg-card p-5 shadow-sm ${className}`}>
      <div className="border-b pb-3">
        <div className="flex items-center gap-2">
          <ArrowLeftRight className="h-5 w-5 text-primary" />
          <h3 className="font-bold text-base text-foreground">{title}</h3>
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Architectural comparison between {conceptAName} and {conceptBName}
        </p>
      </div>

      {/* Top summary cards */}
      <div className="grid gap-3 sm:grid-cols-2 text-xs">
        <div className="rounded-lg border border-border/80 bg-background/50 p-3.5">
          <span className="font-bold text-sm text-primary">{conceptAName}</span>
          <p className="mt-1 leading-relaxed text-muted-foreground">{summaryA}</p>
        </div>
        <div className="rounded-lg border border-border/80 bg-background/50 p-3.5">
          <span className="font-bold text-sm text-primary">{conceptBName}</span>
          <p className="mt-1 leading-relaxed text-muted-foreground">{summaryB}</p>
        </div>
      </div>

      {/* Detailed matrix table */}
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-left text-xs">
          <thead className="border-b bg-muted/60 text-muted-foreground">
            <tr>
              <th className="p-3 font-semibold w-1/3">Architectural Aspect</th>
              <th className="p-3 font-semibold w-1/3 text-primary">{conceptAName}</th>
              <th className="p-3 font-semibold w-1/3 text-primary">{conceptBName}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row, idx) => (
              <tr key={idx} className="hover:bg-accent/40 transition-colors">
                <td className="p-3 font-semibold text-foreground">{row.aspect}</td>
                <td className="p-3 leading-relaxed text-foreground/90">{row.conceptA}</td>
                <td className="p-3 leading-relaxed text-foreground/90">{row.conceptB}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Decision guide callout */}
      <div className="grid gap-3 sm:grid-cols-2 pt-1 text-xs">
        <div className="rounded-lg border border-primary/30 bg-primary/10 p-3.5">
          <b className="font-semibold text-primary">When to choose {conceptAName}:</b>
          <p className="mt-1 leading-relaxed text-foreground/90">{whenToChooseA}</p>
        </div>
        <div className="rounded-lg border border-primary/30 bg-primary/10 p-3.5">
          <b className="font-semibold text-primary">When to choose {conceptBName}:</b>
          <p className="mt-1 leading-relaxed text-foreground/90">{whenToChooseB}</p>
        </div>
      </div>
    </div>
  );
}

