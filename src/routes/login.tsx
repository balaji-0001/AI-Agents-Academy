import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Bot,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
  Lock,
  Mail,
  User as UserIcon,
  ArrowRight,
  Loader2,
  ShieldCheck,
  GraduationCap,
} from "lucide-react";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign In / Join — AI Agents Academy" },
      { name: "description", content: "Sign in to AI Agents Academy to save progress, take mock interviews, and earn verified credentials." },
    ],
  }),
  component: LoginPage,
});

export function LoginPage() {
  const navigate = useNavigate();
  const { user, loginWithEmail, loginWithOAuth, logout } = useAuth();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email || !password) {
      setError("Please fill in both email and password.");
      return;
    }

    if (mode === "signup" && !name) {
      setError("Please provide your full name.");
      return;
    }

    setLoading(true);
    try {
      await loginWithEmail(email, password, name);
      setSuccess(
        mode === "signin"
          ? "Welcome back! Redirecting to Dashboard..."
          : "Account created successfully! Welcome to AI Agents Academy..."
      );
      setTimeout(() => {
        navigate({ to: "/" });
      }, 800);
    } catch (err: any) {
      setError(err?.message || "Failed to authenticate. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: "google" | "github") => {
    setError(null);
    setLoading(true);
    try {
      await loginWithOAuth(provider);
      setSuccess(`Signed in with ${provider === "google" ? "Google" : "GitHub"}! Redirecting...`);
      setTimeout(() => {
        navigate({ to: "/" });
      }, 700);
    } catch (err: any) {
      setError("Social sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl py-6 sm:py-10">
      <div className="grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Column: Brand Hero & Value Proposition */}
        <div className="space-y-6">
          <div className="flex items-center gap-2.5">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <span className="font-extrabold text-lg text-foreground tracking-tight">
                AI Agents Academy
              </span>
              <p className="text-xs text-muted-foreground">
                Senior AI Engineering & Autonomous Systems
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight leading-tight">
              Master Production AI Agents & LLM Systems
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Step-by-step visual lessons, live voice technical interview simulations with Google Gemini, coding sandboxes, and enterprise architectural blueprints.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {[
              "15 End-to-End Curriculum Modules from Foundations to Security",
              "Real-Time Gemini Live Voice Interviews with instant Indian coaching",
              "Hands-On Architecture Project Lab with runnable Python starter code",
              "150+ Technical Interview Bank with reference answers & pitfalls",
              "Verified Industry Certificate for LinkedIn & Resume",
            ].map((feat, i) => (
              <div key={i} className="flex items-start gap-2.5 text-xs text-foreground/90">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>{feat}</span>
              </div>
            ))}
          </div>

          {/* Social Proof Quote */}
          <div className="rounded-2xl border bg-muted/30 p-4 space-y-2">
            <div className="flex items-center gap-2">
              <div className="grid h-7 w-7 place-items-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                <GraduationCap className="h-4 w-4" />
              </div>
              <span className="text-xs font-bold text-foreground">
                Join 1,200+ AI Engineers & Researchers
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground italic leading-relaxed">
              "The Gemini Live voice technical interview prepared me for real engineering loop rounds at Tier-1 AI startups. The instant polite correction with real examples is unmatched."
            </p>
          </div>
        </div>

        {/* Right Column: Authentication Card */}
        <div className="rounded-3xl border bg-card p-6 sm:p-8 shadow-sm space-y-6">
          {/* Header & Tabs */}
          <div>
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setMode("signin");
                    setError(null);
                  }}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    mode === "signin"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("signup");
                    setError(null);
                  }}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    mode === "signup"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Create Account
                </button>
              </div>

              <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                SSL Secure
              </span>
            </div>

            <h2 className="text-xl font-bold text-foreground">
              {mode === "signin" ? "Welcome back to Academy" : "Start your AI journey"}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {mode === "signin"
                ? "Enter your credentials or use 1-click social sign-in"
                : "Create your free account to track lessons and interview scores"}
            </p>
          </div>

          {error && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              {success}
            </div>
          )}

          {/* Social Sign-In Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleOAuth("google")}
              className="flex items-center justify-center gap-2 rounded-xl border bg-card/60 p-2.5 text-xs font-semibold hover:bg-accent text-foreground transition-all shadow-2xs disabled:opacity-50"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Google</span>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleOAuth("github")}
              className="flex items-center justify-center gap-2 rounded-xl border bg-card/60 p-2.5 text-xs font-semibold hover:bg-accent text-foreground transition-all shadow-2xs disabled:opacity-50"
            >
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              <span>GitHub</span>
            </button>
          </div>

          <div className="relative flex items-center justify-center">
            <span className="w-full border-t" />
            <span className="bg-card px-3 text-[10px] uppercase font-bold text-muted-foreground shrink-0">
              Or with email
            </span>
            <span className="w-full border-t" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Lakshmipathi Balaji"
                    className="w-full rounded-xl border bg-card pl-9 pr-3 py-2 text-xs text-foreground outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full rounded-xl border bg-card pl-9 pr-3 py-2 text-xs text-foreground outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-muted-foreground">
                  Password
                </label>
                {mode === "signin" && (
                  <button
                    type="button"
                    onClick={() => alert("Password reset link sent to demo email!")}
                    className="text-[11px] text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-xl border bg-card pl-9 pr-9 py-2 text-xs text-foreground outline-none focus:ring-2 focus:ring-ring"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>{mode === "signin" ? "Sign In to Academy" : "Create Free Account"}</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Current Session Quick-Switch (If already signed in) */}
          {user && (
            <div className="rounded-xl border bg-muted/40 p-3 text-xs flex items-center justify-between">
              <div className="min-w-0">
                <p className="font-semibold text-foreground truncate">
                  Currently signed in as: {user.name}
                </p>
                <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  logout();
                  setSuccess("Signed out successfully.");
                }}
                className="text-[11px] font-bold text-destructive hover:underline shrink-0 ml-2"
              >
                Sign Out
              </button>
            </div>
          )}

          <div className="text-center pt-2">
            <Link
              to="/"
              className="text-xs text-muted-foreground hover:text-foreground font-medium underline-offset-4 hover:underline"
            >
              ← Back to Academy Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

