import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  Code2,
  Cpu,
  Layers,
  ArrowRight,
  Copy,
  Check,
  FileCode,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { PROJECT_DETAILS, ProjectDetail } from "@/lib/project-details";
import { PageHeader, Panel } from "@/components/academy/ui";

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { title: "Projects Lab — AI Agents Academy" },
      { name: "description", content: "Build production AI agents with step-by-step guidance, architectures, and starter code." },
      { property: "og:title", content: "Projects Lab — AI Agents Academy" },
      { property: "og:description", content: "Build production AI agents with step-by-step guidance, architectures, and starter code." },
    ],
  }),
  component: Projects,
});

const FILTERS = ["All", "Beginner", "Intermediate", "Advanced"] as const;
type TabType = "milestones" | "architecture" | "code" | "testing";

export function Projects() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [selectedId, setSelectedId] = useState<string>(PROJECT_DETAILS[0]!.id);
  const [activeTab, setActiveTab] = useState<TabType>("milestones");
  const [progressMap, setProgressMap] = useState<Record<string, number[]>>({});
  const [copied, setCopied] = useState(false);

  // Load persistent milestone progress from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("academy-project-milestones");
      if (saved) {
        setProgressMap(JSON.parse(saved));
      }
    } catch (e) {
      console.warn("Could not load project progress", e);
    }
  }, []);

  // Save progress helper
  const toggleMilestone = (projectId: string, stepIndex: number) => {
    setProgressMap((prev) => {
      const current = prev[projectId] || [];
      const updated = current.includes(stepIndex)
        ? current.filter((i) => i !== stepIndex)
        : [...current, stepIndex];
      const nextMap = { ...prev, [projectId]: updated };
      try {
        localStorage.setItem("academy-project-milestones", JSON.stringify(nextMap));
      } catch {}
      return nextMap;
    });
  };

  const filteredProjects = PROJECT_DETAILS.filter(
    (p) => filter === "All" || p.level === filter
  );

  // Find active project safely by ID (fallback to first filtered item)
  const activeProject: ProjectDetail =
    PROJECT_DETAILS.find((p) => p.id === selectedId) ||
    filteredProjects[0] ||
    PROJECT_DETAILS[0]!;

  const checkedSteps = progressMap[activeProject.id] || [];
  const percentComplete = Math.round(
    (checkedSteps.length / activeProject.milestones.length) * 100
  );

  const handleCopyCode = () => {
    navigator.clipboard.writeText(activeProject.starterCode.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Node type badge styling
  const getNodeBadgeClass = (type: string) => {
    switch (type) {
      case "agent":
        return "bg-purple-500/15 border-purple-500/40 text-purple-600 dark:text-purple-400";
      case "tool":
        return "bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400";
      case "guardrail":
        return "bg-amber-500/15 border-amber-500/40 text-amber-600 dark:text-amber-400";
      case "storage":
        return "bg-blue-500/15 border-blue-500/40 text-blue-600 dark:text-blue-400";
      case "process":
        return "bg-indigo-500/15 border-indigo-500/40 text-indigo-600 dark:text-indigo-400";
      default:
        return "bg-muted border-border text-foreground";
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        title="Project Lab"
        subtitle="Build end-to-end production AI agents with architectures, step-by-step milestones, and runnable Python starter code"
        badge="Hands-On Architecture Builds"
      />

      {/* Difficulty Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
        <div className="inline-flex rounded-xl border p-1 bg-card shadow-2xs">
          {FILTERS.map((f) => {
            const count =
              f === "All"
                ? PROJECT_DETAILS.length
                : PROJECT_DETAILS.filter((p) => p.level === f).length;
            const isCurrent = filter === f;
            return (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  isCurrent
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>{f === "All" ? "All Projects" : f}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                    isCurrent
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <span className="text-xs text-muted-foreground">
          Showing {filteredProjects.length} guided architecture projects
        </span>
      </div>

      {/* Main Grid: Left Projects List, Right Project Details Workspace */}
      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        {/* Left Project Selector Column */}
        <div className="space-y-2">
          <div className="rounded-2xl border bg-card p-3 shadow-2xs space-y-1.5 max-h-[calc(100vh-14rem)] overflow-y-auto">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-2 py-1">
              Select Architecture Lab
            </h4>

            {filteredProjects.map((p, idx) => {
              const isSelected = p.id === activeProject.id;
              const pSteps = progressMap[p.id] || [];
              const isDone = pSteps.length === p.milestones.length;

              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setSelectedId(p.id);
                  }}
                  className={`w-full flex items-start gap-3 rounded-xl p-3 text-left transition-all border ${
                    isSelected
                      ? "border-primary bg-primary/10 shadow-xs ring-1 ring-primary/30"
                      : "border-transparent hover:border-border hover:bg-accent/50 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <div
                    className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg text-xs font-bold ${
                      isDone
                        ? "bg-emerald-500 text-white"
                        : isSelected
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    {isDone ? <Check className="h-4 w-4" /> : idx + 1}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="text-[10px] font-semibold text-primary truncate">
                        {p.category}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
                          p.level === "Beginner"
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                            : p.level === "Intermediate"
                            ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                            : "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400"
                        }`}
                      >
                        {p.level}
                      </span>
                    </div>

                    <h5
                      className={`text-xs font-bold leading-snug truncate ${
                        isSelected ? "text-foreground" : "text-foreground/90"
                      }`}
                    >
                      {p.title}
                    </h5>

                    <p className="text-[11px] text-muted-foreground line-clamp-1 mt-1">
                      {p.desc}
                    </p>

                    {/* Progress indicator */}
                    {pSteps.length > 0 && (
                      <div className="mt-2 flex items-center gap-2">
                        <div className="h-1 flex-1 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all duration-300"
                            style={{
                              width: `${(pSteps.length / p.milestones.length) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-[10px] font-semibold text-primary">
                          {pSteps.length}/{p.milestones.length}
                        </span>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Active Project Workspace */}
        <div className="space-y-4 min-w-0">
          <Panel>
            {/* Project Header Banner */}
            <div className="space-y-3 border-b pb-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-bold text-primary">
                    {activeProject.category}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      activeProject.level === "Beginner"
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                        : activeProject.level === "Intermediate"
                        ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                        : "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400"
                    }`}
                  >
                    {activeProject.level}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Estimated time: {activeProject.estimatedTime}</span>
                </div>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-foreground leading-tight">
                  {activeProject.title}
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {activeProject.desc}
                </p>
              </div>

              {/* Tech Stack Pills */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] font-bold text-muted-foreground mr-1">
                  Tech Stack:
                </span>
                {activeProject.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-foreground border border-border/50"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Workspace View Tabs */}
            <div className="mt-4 flex flex-wrap gap-1 border-b pb-2">
              {[
                { id: "milestones", label: "Milestones & Checklist", icon: CheckCircle2 },
                { id: "architecture", label: "Architecture Pipeline", icon: Layers },
                { id: "code", label: "Starter Code & Structure", icon: Code2 },
                { id: "testing", label: "Acceptance Criteria", icon: ShieldCheck },
              ].map((tab) => {
                const Icon = tab.icon;
                const isCurrent = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                      isCurrent
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* TAB 1: MILESTONES & CHECKLIST */}
            {activeTab === "milestones" && (
              <div className="mt-4 space-y-4">
                {/* Completion Progress Bar */}
                <div className="rounded-xl border bg-muted/30 p-3.5 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-foreground">Project Completion Progress</span>
                    <span className="text-primary font-mono">
                      {checkedSteps.length} of {activeProject.milestones.length} Milestones ({percentComplete}%)
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-300"
                      style={{ width: `${percentComplete}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Check off milestones as you build and test components in your local development environment.
                  </p>
                </div>

                {/* Milestone Checklist Items */}
                <div className="space-y-2.5">
                  {activeProject.milestones.map((m, idx) => {
                    const isChecked = checkedSteps.includes(idx);
                    return (
                      <div
                        key={idx}
                        onClick={() => toggleMilestone(activeProject.id, idx)}
                        className={`cursor-pointer rounded-xl border p-3.5 transition-all flex items-start gap-3 select-none ${
                          isChecked
                            ? "bg-emerald-500/5 border-emerald-500/30"
                            : "bg-card hover:bg-accent/50 border-border"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}} // Handled by parent div
                          className="mt-0.5 h-4 w-4 rounded accent-primary shrink-0 cursor-pointer"
                        />
                        <div className="min-w-0 flex-1">
                          <h4
                            className={`text-xs font-bold leading-snug flex items-center gap-2 ${
                              isChecked
                                ? "text-emerald-600 dark:text-emerald-400 line-through"
                                : "text-foreground"
                            }`}
                          >
                            <span>Milestone {idx + 1}: {m.title}</span>
                          </h4>
                          <p
                            className={`text-xs mt-1 leading-relaxed ${
                              isChecked ? "text-muted-foreground/70" : "text-muted-foreground"
                            }`}
                          >
                            {m.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: ARCHITECTURE PIPELINE */}
            {activeTab === "architecture" && (
              <div className="mt-4 space-y-5">
                <div className="rounded-xl border bg-muted/20 p-4 space-y-3">
                  <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                    <Cpu className="h-4 w-4 text-primary" />
                    Interactive Component Pipeline
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Data flow and operational sequence for {activeProject.title}:
                  </p>

                  {/* Flow pipeline nodes */}
                  <div className="flex flex-col md:flex-row flex-wrap items-center gap-2 pt-2">
                    {activeProject.architectureNodes.map((node, i) => (
                      <div key={node.name} className="flex items-center gap-2 w-full md:w-auto">
                        <div
                          className={`flex-1 md:flex-initial rounded-xl border p-3 min-w-[150px] shadow-2xs ${getNodeBadgeClass(
                            node.type
                          )}`}
                        >
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider opacity-75">
                              {node.type}
                            </span>
                            <span className="text-[10px] font-mono">0{i + 1}</span>
                          </div>
                          <h4 className="font-bold text-xs text-foreground truncate">
                            {node.name}
                          </h4>
                          <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2">
                            {node.desc}
                          </p>
                        </div>

                        {i < activeProject.architectureNodes.length - 1 && (
                          <span className="hidden md:block text-muted-foreground font-bold shrink-0">
                            →
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Architecture Deep-Dive Summary */}
                <div className="rounded-xl border bg-card p-4 space-y-2 text-xs">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                    Architectural Strategy & Rationale
                  </h4>
                  <p className="text-foreground leading-relaxed">
                    {activeProject.architectureSummary}
                  </p>
                </div>
              </div>
            )}

            {/* TAB 3: STARTER CODE & FILE STRUCTURE */}
            {activeTab === "code" && (
              <div className="mt-4 space-y-4">
                {/* Project File Tree Structure */}
                <div className="rounded-xl border bg-card p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                    <FileCode className="h-4 w-4 text-primary" />
                    Recommended Project File Layout
                  </div>
                  <pre className="rounded-lg bg-muted/50 p-3 font-mono text-[11px] text-foreground/90 overflow-x-auto leading-relaxed">
                    {activeProject.fileTree.join("\n")}
                  </pre>
                </div>

                {/* Starter Code Viewer */}
                <div className="rounded-xl border bg-card overflow-hidden shadow-2xs">
                  <div className="flex items-center justify-between bg-muted/60 px-4 py-2 border-b">
                    <div className="flex items-center gap-2">
                      <Code2 className="h-4 w-4 text-primary" />
                      <span className="font-mono text-xs font-bold text-foreground">
                        {activeProject.starterCode.filename}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="flex items-center gap-1.5 rounded-md border bg-card px-2.5 py-1 text-xs font-semibold text-foreground hover:bg-accent transition-colors shadow-2xs"
                    >
                      {copied ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-500" />
                          <span className="text-emerald-500">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Copy Code</span>
                        </>
                      )}
                    </button>
                  </div>

                  <pre className="p-4 font-mono text-xs overflow-x-auto bg-card text-foreground/90 leading-relaxed max-h-96">
                    <code>{activeProject.starterCode.code}</code>
                  </pre>
                </div>
              </div>
            )}

            {/* TAB 4: ACCEPTANCE CRITERIA */}
            {activeTab === "testing" && (
              <div className="mt-4 space-y-4">
                <div className="rounded-xl border bg-card p-4 space-y-3">
                  <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                    Production Acceptance Criteria
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Before considering this project complete, verify that your implementation satisfies all technical invariants:
                  </p>

                  <ul className="space-y-2.5 text-xs">
                    {activeProject.acceptanceCriteria.map((c, i) => (
                      <li
                        key={i}
                        className="rounded-lg border bg-muted/20 p-3 flex items-start gap-2.5"
                      >
                        <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                          {i + 1}
                        </span>
                        <span className="text-foreground/90 leading-relaxed">{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}
