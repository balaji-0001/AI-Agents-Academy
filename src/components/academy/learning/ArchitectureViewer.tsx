import React, { useState } from "react";
import { Network, Sparkles, ShieldCheck, Server, Database, Eye } from "lucide-react";
import { DiagramViewer, DiagramExplanation } from "./DiagramViewer";

export interface ArchitectureVariant {
  name: string;
  badge: "Beginner Conceptual" | "Production Scaled";
  diagramSource: string;
  description: string;
  explanation: DiagramExplanation;
  components: {
    name: string;
    type: "orchestrator" | "llm" | "tool" | "storage" | "gateway" | "security" | "observability";
    role: string;
  }[];
}

interface ArchitectureViewerProps {
  title: string;
  subtitle?: string;
  beginnerView: ArchitectureVariant;
  productionView: ArchitectureVariant;
  className?: string;
}

export function ArchitectureViewer({
  title,
  subtitle,
  beginnerView,
  productionView,
  className = "",
}: ArchitectureViewerProps) {
  const [activeTab, setActiveTab] = useState<"beginner" | "production">("beginner");

  const current = activeTab === "beginner" ? beginnerView : productionView;

  const getTypeBadgeClass = (type: string) => {
    switch (type) {
      case "orchestrator":
        return "bg-primary/15 text-primary border-primary/30";
      case "llm":
        return "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30";
      case "tool":
        return "bg-warning/20 text-warning border-warning/30";
      case "storage":
        return "bg-success/15 text-success border-success/30";
      case "gateway":
        return "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30";
      case "security":
        return "bg-destructive/15 text-destructive border-destructive/30";
      case "observability":
        return "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <div className={`space-y-4 rounded-xl border bg-card p-5 shadow-sm ${className}`}>
      {/* Top Bar with Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Network className="h-5 w-5 text-primary" />
            <h3 className="font-bold text-lg text-foreground">{title}</h3>
          </div>
          {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
        </div>

        {/* View Switcher: Beginner vs Production */}
        <div className="flex items-center rounded-lg border bg-muted/60 p-1 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab("beginner")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
              activeTab === "beginner"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-warning" />
            Beginner Mental Model
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("production")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
              activeTab === "production"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Server className="h-3.5 w-3.5 text-primary" />
            Production Architecture
          </button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed">{current.description}</p>

      {/* Rendered Diagram Component */}
      <DiagramViewer
        title={`${title} (${current.name})`}
        diagramType="architecture"
        source={current.diagramSource}
        explanation={current.explanation}
      />

      {/* Component Legend & Responsibility Breakdown */}
      <div className="mt-4 rounded-lg border bg-muted/20 p-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4 text-primary" />
          Component Architecture Breakdown
        </h4>
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {current.components.map((comp) => (
            <div key={comp.name} className="rounded-lg border bg-card p-3 shadow-2xs">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-xs text-foreground truncate">{comp.name}</span>
                <span className={`rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase ${getTypeBadgeClass(comp.type)}`}>
                  {comp.type}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">{comp.role}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

