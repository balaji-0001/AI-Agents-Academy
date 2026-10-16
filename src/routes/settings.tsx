import { createFileRoute } from "@tanstack/react-router";
import { Sun, Moon, Laptop, Check, Sparkles } from "lucide-react";
import { PageHeader, Panel } from "@/components/academy/ui";
import { useTheme, type Theme } from "@/lib/theme";
import { isGeminiConfigured } from "@/lib/gemini";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [
    { title: "Settings — AI Agents Academy" },
    { name: "description", content: "Manage appearance, AI provider, voice and data settings." },
    { property: "og:title", content: "Settings — AI Agents Academy" },
    { property: "og:description", content: "Manage appearance, AI provider, voice and data settings." },
  ] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const hasKey = isGeminiConfigured();
  const reset = () => {
    ["academy-progress-v1", "academy-tutor", "academy-last-interview", "academy-theme", "theme"].forEach((k) =>
      localStorage.removeItem(k)
    );
    location.reload();
  };

  const themeOptions: { value: Theme; label: string; desc: string; icon: typeof Sun }[] = [
    {
      value: "light",
      label: "Light",
      desc: "Clean, high-contrast light theme",
      icon: Sun,
    },
    {
      value: "dark",
      label: "Dark",
      desc: "Deep slate theme for low light",
      icon: Moon,
    },
    {
      value: "system",
      label: "System",
      desc: `Follows your OS setting (currently ${resolvedTheme})`,
      icon: Laptop,
    },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader title="Settings" subtitle="Appearance, provider, voice and data preferences" />

      <Panel title="Appearance">
        <p className="mb-4 text-sm text-muted-foreground">
          Choose how AI Agents Academy looks on your device.
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          {themeOptions.map((opt) => {
            const isSelected = theme === opt.value;
            const Icon = opt.icon;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setTheme(opt.value)}
                className={`relative flex flex-col items-start rounded-xl border p-4 text-left transition-all ${
                  isSelected
                    ? "border-primary bg-primary/10 shadow-sm"
                    : "border-border bg-card hover:border-primary/50 hover:bg-accent/50"
                }`}
              >
                <div className="flex w-full items-center justify-between">
                  <div
                    className={`rounded-lg p-2 ${
                      isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  {isSelected && <Check className="h-4 w-4 text-primary" />}
                </div>
                <span className="mt-3 font-semibold text-sm">{opt.label}</span>
                <span className="mt-1 text-xs text-muted-foreground">{opt.desc}</span>
              </button>
            );
          })}
        </div>
      </Panel>

      <Panel title="AI Provider">
        {hasKey ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 rounded-lg border border-success/30 bg-success/10 p-3 text-sm">
              <span className="h-2.5 w-2.5 rounded-full bg-success animate-pulse" />
              <div className="flex-1">
                <p className="font-semibold text-foreground flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-warning" />
                  Google Gemini Connected (Active)
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  AI Tutor & personalized question explanations are running live with Gemini models.
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Key source: <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px]">.env (VITE_GEMINI_API_KEY)</code>
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Currently running in <b className="text-foreground">Standard Offline Mode</b>. Live AI query features utilize the built-in pedagogical knowledge base.
            </p>
            <p className="text-xs text-muted-foreground">
              To activate real-time Gemini streaming responses, add your Gemini API key in <code className="rounded bg-muted px-1.5 py-0.5 font-mono">.env</code> or configure it above.
            </p>
          </div>
        )}
      </Panel>
      <Panel title="Voice">
        <p className="text-sm text-muted-foreground">Voice interviews use your browser's built-in speech recognition and speech output (best in Chrome or Edge). No paid service is required.</p>
      </Panel>
      <Panel title="Data">
        <p className="mb-3 text-sm text-muted-foreground">Progress, tutor history and interview reports are saved in this browser.</p>
        <button onClick={reset} className="rounded-lg bg-destructive px-4 py-2 text-sm text-destructive-foreground">Reset all progress</button>
      </Panel>
    </div>
  );
}
