import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  CheckCircle2,
  Bookmark,
  Lightbulb,
  Layers,
  Clock,
  Code2,
  ArrowLeftRight,
  Briefcase,
  Bug,
  HelpCircle,
  Wrench,
  ChevronLeft,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import { MODULES } from "@/lib/academy-data";
import { useProgress } from "@/lib/progress";
import { Bar } from "@/components/academy/ui";
import { getVisualLesson, FullVisualLesson } from "@/lib/visual-curriculum";
import { DiagramViewer } from "@/components/academy/learning/DiagramViewer";
import { ArchitectureViewer } from "@/components/academy/learning/ArchitectureViewer";
import { ExecutionTimeline } from "@/components/academy/learning/ExecutionTimeline";
import { CodeWalkthrough } from "@/components/academy/learning/CodeWalkthrough";
import { ComparisonTable } from "@/components/academy/learning/ComparisonTable";
import { AnalogyCard } from "@/components/academy/learning/AnalogyCard";
import { RealWorldExample } from "@/components/academy/learning/RealWorldExample";
import { CommonMistakes } from "@/components/academy/learning/CommonMistakes";
import { InterviewSection } from "@/components/academy/learning/InterviewSection";
import { InteractiveQuiz } from "@/components/academy/learning/InteractiveQuiz";
import { ExerciseChallenge } from "@/components/academy/learning/ExerciseChallenge";

type Search = { module?: number | undefined; lesson?: string | undefined };

export const Route = createFileRoute("/courses")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    module: s["module"] ? Number(s["module"]) : undefined,
    lesson: s["lesson"] ? String(s["lesson"]) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Visual AI Agents Academy — Complete Masterclass" },
      { name: "description", content: "Interactive visual curriculum for AI agent engineering and interviews." },
      { property: "og:title", content: "Visual AI Agents Academy — Complete Masterclass" },
      { property: "og:description", content: "Interactive visual curriculum for AI agent engineering and interviews." },
    ],
  }),
  component: Courses,
});

const SECTION_TABS = [
  { id: "all", label: "Full Masterclass", icon: BookOpen },
  { id: "concept", label: "Concept & Analogy", icon: Lightbulb },
  { id: "diagrams", label: "Diagrams & Architecture", icon: Layers },
  { id: "execution", label: "Runtime Execution", icon: Clock },
  { id: "code", label: "Python Implementation", icon: Code2 },
  { id: "comparison", label: "Trade-offs & Comparisons", icon: ArrowLeftRight },
  { id: "usecases", label: "Real-World Use Cases", icon: Briefcase },
  { id: "mistakes", label: "Pitfalls & Guardrails", icon: Bug },
  { id: "interview", label: "Interview Prep", icon: HelpCircle },
  { id: "practice", label: "Quiz & Practice", icon: Wrench },
] as const;

function Courses() {
  const s = Route.useSearch();
  const mod = MODULES.find((m) => m.id === s.module) ?? MODULES[4]!;
  const lesson = mod.lessons.find((l) => l.id === s.lesson) ?? mod.lessons[0]!;
  const idx = mod.lessons.indexOf(lesson);
  const { completed, bookmarks, toggleComplete, toggleBookmark } = useProgress();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<string>("all");

  const done = completed.includes(lesson.id);
  const isBookmarked = bookmarks.includes(lesson.id);
  const modPct = Math.round((mod.lessons.filter((l) => completed.includes(l.id)).length / mod.lessons.length) * 100);

  // Retrieve comprehensive visual lesson data
  const visualLesson: FullVisualLesson = getVisualLesson(mod.id, lesson.id, lesson.title);

  // Navigation helpers
  const prevLesson = idx > 0 ? mod.lessons[idx - 1] : null;
  const nextLesson = idx < mod.lessons.length - 1 ? mod.lessons[idx + 1] : null;

  return (
    <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
      {/* Sidebar Curriculum Navigator */}
      <aside className="panel h-fit p-4 lg:sticky lg:top-20">
        <select
          value={mod.id}
          onChange={(e) => navigate({ to: "/courses", search: { module: Number(e.target.value) } })}
          className="mb-3 w-full rounded-md border bg-card p-2 text-sm font-semibold outline-none focus:ring-2 focus:ring-ring text-foreground"
          aria-label="Module"
        >
          {MODULES.map((m) => (
            <option key={m.id} value={m.id}>
              Module {m.id}: {m.title}
            </option>
          ))}
        </select>

        <div className="mb-4">
          <div className="flex justify-between text-xs mb-1 text-muted-foreground">
            <span>Module {mod.id} Progress</span>
            <span className="font-semibold text-foreground">{modPct}%</span>
          </div>
          <Bar value={modPct} />
        </div>

        <ol className="space-y-1 max-h-[calc(100vh-22rem)] overflow-y-auto pr-1">
          {mod.lessons.map((l, i) => {
            const isCurrent = l.id === lesson.id;
            const isLessonDone = completed.includes(l.id);
            return (
              <li key={l.id}>
                <Link
                  to="/courses"
                  search={{ module: mod.id, lesson: l.id }}
                  className={`flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm transition-all ${
                    isCurrent
                      ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                      : "hover:bg-accent text-foreground"
                  }`}
                >
                  <span
                    className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border text-[11px] ${
                      isCurrent
                        ? "border-primary-foreground/40 bg-primary-foreground/20 text-primary-foreground font-bold"
                        : isLessonDone
                        ? "border-success bg-success/20 text-success font-bold"
                        : "border-border text-muted-foreground"
                    }`}
                  >
                    {isLessonDone ? "✓" : i + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate">{l.title}</span>
                    <span className={`block text-[11px] ${isCurrent ? "text-primary-foreground/75" : "text-muted-foreground"}`}>
                      {l.minutes} min
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      </aside>

      {/* Main Content Area */}
      <article className="min-w-0 space-y-6">
        {/* Lesson Breadcrumb & Title */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
            <span>Module {mod.id}: {mod.title}</span>
            <span>•</span>
            <span>Lesson {idx + 1} of {mod.lessons.length}</span>
            <span>•</span>
            <span className="rounded bg-muted px-2 py-0.5 font-semibold text-foreground">{mod.level}</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-extrabold sm:text-3xl text-foreground tracking-tight">{visualLesson.title}</h1>
              <p className="mt-1 text-sm text-muted-foreground">{visualLesson.simpleExplanation.definition}</p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => toggleBookmark(lesson.id)}
                aria-label="Bookmark lesson"
                title={isBookmarked ? "Remove Bookmark" : "Bookmark Lesson"}
                className={`rounded-lg border p-2 transition-all ${
                  isBookmarked ? "border-warning text-warning bg-warning/15 shadow-sm" : "hover:bg-accent text-muted-foreground"
                }`}
              >
                <Bookmark className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => toggleComplete(lesson.id)}
                className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition-all shadow-sm ${
                  done ? "bg-success/20 text-success border border-success/40" : "bg-primary text-primary-foreground hover:bg-primary/90"
                }`}
              >
                <CheckCircle2 className="h-4 w-4" />
                {done ? "Completed" : "Mark Complete"}
              </button>
            </div>
          </div>
        </div>

        {/* Learning Objectives Card */}
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
          <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 mb-2">
            <Lightbulb className="h-4 w-4" />
            Key Learning Objectives
          </span>
          <ul className="grid gap-1.5 sm:grid-cols-2 text-xs text-foreground/90">
            {visualLesson.learningObjectives.map((obj, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>{obj}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Section View Tabs */}
        <div className="flex gap-1.5 overflow-x-auto border-b pb-2 scrollbar-thin">
          {SECTION_TABS.map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* SECTION A & B: Concept Explanation & Analogy & Problem */}
        {(activeTab === "all" || activeTab === "concept") && (
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="rounded bg-primary/10 text-primary font-bold text-xs px-2 py-0.5">SECTION A & B</span>
              <h2 className="text-lg font-bold text-foreground">Intuitive Concept & Problem Context</h2>
            </div>
            <AnalogyCard
              analogy={visualLesson.analogy}
              problemBeforeSolution={visualLesson.problemBeforeSolution}
            />
          </section>
        )}

        {/* SECTION C & D: Visual Diagram & Architecture View */}
        {(activeTab === "all" || activeTab === "diagrams") && (
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="rounded bg-primary/10 text-primary font-bold text-xs px-2 py-0.5">SECTION C & D</span>
              <h2 className="text-lg font-bold text-foreground">Interactive Diagrams & Architecture</h2>
            </div>
            <DiagramViewer
              title={visualLesson.diagram.title}
              diagramType={visualLesson.diagram.diagramType}
              source={visualLesson.diagram.source}
              explanation={visualLesson.diagram.explanation}
            />
            <ArchitectureViewer
              title={visualLesson.architecture.title}
              subtitle={visualLesson.architecture.subtitle}
              beginnerView={visualLesson.architecture.beginnerView}
              productionView={visualLesson.architecture.productionView}
            />
          </section>
        )}

        {/* SECTION E: Step-by-Step Runtime Execution */}
        {(activeTab === "all" || activeTab === "execution") && (
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="rounded bg-primary/10 text-primary font-bold text-xs px-2 py-0.5">SECTION E</span>
              <h2 className="text-lg font-bold text-foreground">Step-by-Step Runtime Execution</h2>
            </div>
            <ExecutionTimeline steps={visualLesson.executionTimeline} />
          </section>
        )}

        {/* SECTION F: Python Implementation */}
        {(activeTab === "all" || activeTab === "code") && (
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="rounded bg-primary/10 text-primary font-bold text-xs px-2 py-0.5">SECTION F</span>
              <h2 className="text-lg font-bold text-foreground">Production Python Code & Walkthrough</h2>
            </div>
            <CodeWalkthrough
              title={visualLesson.codeWalkthrough.title}
              purpose={visualLesson.codeWalkthrough.purpose}
              dependencies={visualLesson.codeWalkthrough.dependencies}
              code={visualLesson.codeWalkthrough.code}
              expectedOutput={visualLesson.codeWalkthrough.expectedOutput}
              annotations={visualLesson.codeWalkthrough.annotations}
              commonErrors={visualLesson.codeWalkthrough.commonErrors}
            />
          </section>
        )}

        {/* SECTION G: Trade-offs & Comparisons */}
        {(activeTab === "all" || activeTab === "comparison") && (
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="rounded bg-primary/10 text-primary font-bold text-xs px-2 py-0.5">SECTION G</span>
              <h2 className="text-lg font-bold text-foreground">Architectural Trade-offs & Alternatives</h2>
            </div>
            <ComparisonTable
              title={visualLesson.comparison.title}
              conceptAName={visualLesson.comparison.conceptAName}
              conceptBName={visualLesson.comparison.conceptBName}
              summaryA={visualLesson.comparison.summaryA}
              summaryB={visualLesson.comparison.summaryB}
              rows={visualLesson.comparison.rows}
              whenToChooseA={visualLesson.comparison.whenToChooseA}
              whenToChooseB={visualLesson.comparison.whenToChooseB}
            />
          </section>
        )}

        {/* SECTION H: Real-World Use Cases */}
        {(activeTab === "all" || activeTab === "usecases") && (
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="rounded bg-primary/10 text-primary font-bold text-xs px-2 py-0.5">SECTION H</span>
              <h2 className="text-lg font-bold text-foreground">Real-World Industry Case Studies</h2>
            </div>
            <RealWorldExample examples={visualLesson.useCases} />
          </section>
        )}

        {/* SECTION I: Common Mistakes & Best Practices */}
        {(activeTab === "all" || activeTab === "mistakes") && (
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="rounded bg-primary/10 text-primary font-bold text-xs px-2 py-0.5">SECTION I</span>
              <h2 className="text-lg font-bold text-foreground">Common Mistakes & Defensive Hardening</h2>
            </div>
            <CommonMistakes
              mistakes={visualLesson.mistakesAndBestPractices.mistakes}
              productionChecklist={visualLesson.mistakesAndBestPractices.productionChecklist}
            />
          </section>
        )}

        {/* SECTION J: Interview Preparation & Defense */}
        {(activeTab === "all" || activeTab === "interview") && (
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="rounded bg-primary/10 text-primary font-bold text-xs px-2 py-0.5">SECTION J</span>
              <h2 className="text-lg font-bold text-foreground">AI Engineer Interview Preparation</h2>
            </div>
            <InterviewSection questions={visualLesson.interviewQuestions} />
          </section>
        )}

        {/* SECTION K: Interactive Practice, Quiz & Challenges */}
        {(activeTab === "all" || activeTab === "practice") && (
          <section className="space-y-5">
            <div className="flex items-center gap-2">
              <span className="rounded bg-primary/10 text-primary font-bold text-xs px-2 py-0.5">SECTION K</span>
              <h2 className="text-lg font-bold text-foreground">Interactive Practice & Knowledge Check</h2>
            </div>
            <InteractiveQuiz
              lessonId={visualLesson.lessonId}
              questions={visualLesson.interactiveQuiz}
            />
            <ExerciseChallenge
              exercise={visualLesson.exerciseChallenge.exercise}
              debuggingChallenge={visualLesson.exerciseChallenge.debuggingChallenge}
              revisionSummary={visualLesson.exerciseChallenge.revisionSummary}
              relatedTopics={visualLesson.exerciseChallenge.relatedTopics}
            />
          </section>
        )}

        {/* Bottom Lesson Navigation */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t pt-6">
          {prevLesson ? (
            <Link
              to="/courses"
              search={{ module: mod.id, lesson: prevLesson.id }}
              className="flex items-center gap-2 rounded-lg border bg-card px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-accent transition-all shadow-sm w-full sm:w-auto"
            >
              <ChevronLeft className="h-4 w-4 text-primary" />
              <div className="text-left">
                <span className="block text-[10px] text-muted-foreground uppercase">Previous Lesson</span>
                <span className="truncate max-w-[200px] block">{prevLesson.title}</span>
              </div>
            </Link>
          ) : (
            <div />
          )}

          {nextLesson && (
            <Link
              to="/courses"
              search={{ module: mod.id, lesson: nextLesson.id }}
              className="flex items-center justify-between gap-2 rounded-lg bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-all shadow-sm w-full sm:w-auto"
            >
              <div className="text-right">
                <span className="block text-[10px] text-primary-foreground/75 uppercase">Next Lesson</span>
                <span className="truncate max-w-[200px] block">{nextLesson.title}</span>
              </div>
              <ChevronRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </article>
    </div>
  );
}
