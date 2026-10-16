import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, MessageCircle, Mic, FolderKanban, BarChart3 } from "lucide-react";
import { MODULES, TOTAL_LESSONS } from "@/lib/academy-data";
import { useProgress } from "@/lib/progress";
import { PageHeader, Panel, Bar } from "@/components/academy/ui";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Dashboard — AI Agents Academy" },
    { name: "description", content: "Track progress and continue your AI agents learning journey." },
    { property: "og:title", content: "Dashboard — AI Agents Academy" },
    { property: "og:description", content: "Track progress and continue your AI agents learning journey." },
  ] }),
  component: Dashboard,
});

function Dashboard() {
  const { completed } = useProgress();
  const pct = Math.round((completed.length / TOTAL_LESSONS) * 100);
  const next = MODULES.flatMap((m) => m.lessons.map((l) => ({ m, l }))).find(({ l }) => !completed.includes(l.id));
  const stats = [
    { v: MODULES.length, l: "Modules" }, { v: TOTAL_LESSONS, l: "Lessons" },
    { v: completed.length, l: "Completed" }, { v: TOTAL_LESSONS - completed.length, l: "Remaining" }, { v: `${pct}%`, l: "Overall" },
  ];
  const quick = [
    { to: "/tutor", icon: MessageCircle, t: "Ask AI Tutor", d: "Explanations & examples" },
    { to: "/interviews", icon: Mic, t: "Mock Interview", d: "Practice with feedback" },
    { to: "/projects", icon: FolderKanban, t: "Build a Project", d: "Hands-on agent projects" },
    { to: "/progress", icon: BarChart3, t: "View Progress", d: "Your learning journey" },
  ] as const;
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader title="Welcome back!" subtitle="Continue your journey to become an AI Agent Engineer" badge="Interactive Learning Platform" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        {stats.map((s) => <div key={s.l} className="panel p-4"><p className="text-2xl font-bold text-primary">{s.v}</p><p className="text-xs text-muted-foreground">{s.l}</p></div>)}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Continue Learning">
          {next && <>
            <p className="text-xs text-muted-foreground">Module {next.m.id}: {next.m.title}</p>
            <p className="mt-1 text-lg font-semibold">{next.l.title}</p>
            <p className="text-xs text-primary">{next.l.minutes} min</p>
            <Link to="/courses" search={{ module: next.m.id, lesson: next.l.id }} className="glow mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Continue Learning <ArrowRight className="h-4 w-4" /></Link>
          </>}
        </Panel>
        <Panel title="Your Progress">
          <div className="space-y-3">
            {MODULES.slice(0, 6).map((m) => {
              const p = Math.round((m.lessons.filter((l) => completed.includes(l.id)).length / m.lessons.length) * 100);
              return <div key={m.id}><div className="mb-1 flex justify-between text-xs"><span className="truncate">Module {m.id}: {m.title}</span><span>{p}%</span></div><Bar value={p} /></div>;
            })}
          </div>
        </Panel>
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {quick.map((q) => (
          <Link key={q.to} to={q.to} className="panel p-5 text-center transition hover:border-primary">
            <q.icon className="mx-auto h-6 w-6 text-primary" /><p className="mt-2 font-semibold">{q.t}</p><p className="text-xs text-muted-foreground">{q.d}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
