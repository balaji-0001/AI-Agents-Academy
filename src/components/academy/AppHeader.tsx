import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Bell, Search, Sun, Moon } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { MODULES } from "@/lib/academy-data";
import { useTheme } from "@/lib/theme";

export function AppHeader() {
  const [q, setQ] = useState("");
  const { resolvedTheme, toggleTheme } = useTheme();
  const hits = q.length > 1
    ? MODULES.flatMap((m) => m.lessons.filter((l) => l.title.toLowerCase().includes(q.toLowerCase())).map((l) => ({ m, l }))).slice(0, 6)
    : [];
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b bg-background/90 px-3 backdrop-blur">
      <SidebarTrigger />
      <div className="relative w-full max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search lessons, topics, or questions..." aria-label="Search curriculum"
          className="h-9 w-full rounded-lg border bg-card pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
        {hits.length > 0 && (
          <div className="absolute mt-1 w-full rounded-lg border bg-popover p-1 shadow-lg">
            {hits.map(({ m, l }) => (
              <Link key={l.id} to="/courses" search={{ module: m.id, lesson: l.id }} onClick={() => setQ("")} className="block rounded-md px-3 py-2 text-sm hover:bg-accent">
                {l.title}<span className="block text-xs text-muted-foreground">Module {m.id}: {m.title}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
      <div className="ml-auto flex items-center gap-1">
        <button
          onClick={toggleTheme}
          aria-label={resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          title={resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          className="rounded-md p-2 hover:bg-accent text-foreground transition-colors"
        >
          {resolvedTheme === "dark" ? <Sun className="h-4 w-4 text-warning" /> : <Moon className="h-4 w-4" />}
        </button>
        <button aria-label="Notifications" className="rounded-md p-2 hover:bg-accent text-foreground transition-colors">
          <Bell className="h-4 w-4" />
        </button>
        <Link
          to="/login"
          className="ml-1 inline-flex items-center gap-1.5 rounded-lg border bg-card px-2.5 py-1 text-xs font-semibold text-foreground hover:bg-accent transition-colors shadow-2xs"
          title="Account / Sign In"
        >
          <span className="hidden sm:inline">Account</span>
        </Link>
      </div>
    </header>
  );
}
