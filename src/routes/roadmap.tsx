import { createFileRoute, Link } from "@tanstack/react-router";
import { MODULES } from "@/lib/academy-data";
import { useProgress } from "@/lib/progress";
import { PageHeader, Bar } from "@/components/academy/ui";

export const Route = createFileRoute("/roadmap")({
  head: () => ({ meta: [
    { title: "Learning Roadmap — AI Agents Academy" },
    { name: "description", content: "Beginner-to-advanced path for AI agent engineering." },
    { property: "og:title", content: "Learning Roadmap — AI Agents Academy" },
    { property: "og:description", content: "Beginner-to-advanced path for AI agent engineering." },
  ] }),
  component: Roadmap,
});

function Roadmap() {
  const { completed } = useProgress();
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Learning Roadmap" subtitle="16 modules from fundamentals to production engineering" />
      <ol className="relative space-y-4 border-l-2 border-border pl-6">
        {MODULES.map((m) => {
          const p = Math.round((m.lessons.filter((l) => completed.includes(l.id)).length / m.lessons.length) * 100);
          return (
            <li key={m.id} className="relative">
              <span className={`absolute -left-[33px] top-4 h-4 w-4 rounded-full border-2 ${p === 100 ? "border-success bg-success" : p > 0 ? "border-primary bg-primary" : "border-border bg-background"}`} />
              <Link to="/courses" search={{ module: m.id }} className="panel block p-4 transition hover:border-primary">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3"><p className="truncate font-semibold">Module {m.id}: {m.title}</p><span className="text-xs text-muted-foreground">{m.level}</span></div>
                <p className="mb-2 text-xs text-muted-foreground">{m.lessons.length} lessons</p><Bar value={p} />
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
