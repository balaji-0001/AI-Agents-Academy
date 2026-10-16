import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MODULES, TOTAL_LESSONS } from "@/lib/academy-data";
import { useProgress } from "@/lib/progress";
import { PageHeader, Panel, Bar } from "@/components/academy/ui";

export const Route = createFileRoute("/progress")({
  head: () => ({ meta: [
    { title: "Progress & Analytics — AI Agents Academy" },
    { name: "description", content: "See completion, bookmarks and interview history." },
    { property: "og:title", content: "Progress & Analytics — AI Agents Academy" },
    { property: "og:description", content: "See completion, bookmarks and interview history." },
  ] }),
  component: ProgressPage,
});

function ProgressPage() {
  const { completed, bookmarks } = useProgress();
  const [last, setLast] = useState<{ q: string; score: number }[]>([]);
  useEffect(() => { try { setLast(JSON.parse(localStorage.getItem("academy-last-interview") || "[]")); } catch {} }, []);
  const all = MODULES.flatMap((m) => m.lessons.map((l) => ({ m, l })));
  const weak = last.filter((r) => r.score < 50);
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader title="Progress & Analytics" subtitle="Your learning journey at a glance" />
      <Panel title={`Overall: ${completed.length}/${TOTAL_LESSONS} lessons`}><Bar value={(completed.length / TOTAL_LESSONS) * 100} /></Panel>
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Modules"><div className="space-y-3">{MODULES.map((m) => { const p = Math.round((m.lessons.filter((l) => completed.includes(l.id)).length / m.lessons.length) * 100); return <div key={m.id}><div className="mb-1 flex justify-between text-xs"><span className="truncate">{m.id}. {m.title}</span><span>{p}%</span></div><Bar value={p} /></div>; })}</div></Panel>
        <div className="space-y-6">
          <Panel title="Bookmarks">{bookmarks.length === 0 ? <p className="text-sm text-muted-foreground">No bookmarks yet. Use the bookmark icon on any lesson.</p> : <ul className="space-y-1 text-sm">{all.filter(({ l }) => bookmarks.includes(l.id)).map(({ m, l }) => <li key={l.id}><Link to="/courses" search={{ module: m.id, lesson: l.id }} className="text-primary hover:underline">{l.title}</Link></li>)}</ul>}</Panel>
          <Panel title="Weak topics (last interview)">{last.length === 0 ? <p className="text-sm text-muted-foreground">Complete a mock interview to see weak topics.</p> : weak.length === 0 ? <p className="text-sm text-success">No weak answers — nice work!</p> : <ul className="space-y-1 text-sm">{weak.map((r) => <li key={r.q} className="text-warning">{r.q} ({r.score})</li>)}</ul>}</Panel>
        </div>
      </div>
    </div>
  );
}
