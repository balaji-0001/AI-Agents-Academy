import { Sparkles } from "lucide-react";

export function PageHeader({
  title,
  subtitle,
  demo,
  badge,
}: {
  title: string;
  subtitle: string;
  demo?: string;
  badge?: string;
}) {
  const displayBadge = badge ?? demo;
  return (
    <div className="mb-6 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
      <div className="min-w-0">
        <h1 className="truncate text-2xl font-bold sm:text-3xl">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      </div>
      {displayBadge && <StatusBadge note={displayBadge} />}
    </div>
  );
}

export function StatusBadge({ note }: { note: string }) {
  const isAiPowered = note.includes("Gemini") || note.includes("AI");
  return (
    <div className="flex shrink-0 items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-3 py-1.5 shadow-2xs">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
      </span>
      <div className="hidden sm:block">
        <p className="text-xs font-semibold text-foreground/90 flex items-center gap-1">
          {isAiPowered && <Sparkles className="h-3 w-3 text-primary" />}
          {note}
        </p>
      </div>
    </div>
  );
}

export const DemoBadge = StatusBadge;

export function Panel({ title, children, className = "" }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <section className={`panel p-5 ${className}`}>
      {title && <h2 className="mb-4 font-semibold">{title}</h2>}
      {children}
    </section>
  );
}

export function Bar({ value }: { value: number }) {
  return <div className="h-2 w-full overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${value}%` }} /></div>;
}
