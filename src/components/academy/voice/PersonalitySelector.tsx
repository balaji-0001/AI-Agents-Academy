import React from "react";
import { Coffee, Laugh, ShieldAlert, Flame, HeartHandshake, Briefcase, Shuffle, Sparkles } from "lucide-react";

export type PersonalityId =
  | "chill"
  | "funny"
  | "strict"
  | "tough"
  | "mentor"
  | "professional"
  | "random";

export interface PersonalityConfig {
  id: PersonalityId;
  name: string;
  tagline: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  primaryColor: string;
  glowColor: string;
  badgeBg: string;
  promptInstruction: string;
}

export const PERSONALITIES: Record<PersonalityId, PersonalityConfig> = {
  chill: {
    id: "chill",
    name: "Chill & Casual",
    tagline: "Relaxed, friendly vibes",
    description: "Speaks naturally like a supportive Indian tech lead over coffee. Zero stress, conversational feedback.",
    icon: Coffee,
    primaryColor: "#10b981", // Emerald
    glowColor: "rgba(16, 185, 129, 0.45)",
    badgeBg: "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400",
    promptInstruction:
      "PERSONA: Chill & Casual. Be extremely relaxed, warm, and friendly in natural Indian English. Use phrases like 'No worries at all, chill!', 'Let's see how this works in real life', 'Take your time, let me break this down for you'. Do not rush.",
  },
  funny: {
    id: "funny",
    name: "Funny & Playful",
    tagline: "Light banter & analogies",
    description: "Uses humorous analogies (traffic in Bangalore, cricket, spicy food) to make complex tech unforgettable.",
    icon: Laugh,
    primaryColor: "#f59e0b", // Amber
    glowColor: "rgba(245, 158, 11, 0.45)",
    badgeBg: "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400",
    promptInstruction:
      "PERSONA: Funny & Playful. Include light witty banter, funny Indian tech analogies (e.g., Silk Board traffic for latency bottlenecks, chai breaks, Biryani recipes for RAG chunking), while keeping technical explanations 100% accurate.",
  },
  strict: {
    id: "strict",
    name: "Strict & Rigorous",
    tagline: "No hand-waving allowed",
    description: "Serious engineering rigor. Pushes back on buzzwords and demands exact mechanisms and time complexities.",
    icon: ShieldAlert,
    primaryColor: "#6366f1", // Indigo
    glowColor: "rgba(99, 102, 241, 0.45)",
    badgeBg: "bg-indigo-500/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-400",
    promptInstruction:
      "PERSONA: Strict & Rigorous. High technical bar. No hand-waving or surface-level definitions. If the candidate gives a vague answer, firmly say 'Wait, you mentioned vectors, but what mathematical similarity metric are you calculating?'. Always demand exact architectural mechanisms and trade-offs.",
  },
  tough: {
    id: "tough",
    name: "Angry / Tough Boss",
    tagline: "Pressure simulation",
    description: "Controlled impatience. Simulates a high-stakes, fast-paced interview pushing you to defend your design.",
    icon: Flame,
    primaryColor: "#ef4444", // Red
    glowColor: "rgba(239, 68, 68, 0.45)",
    badgeBg: "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400",
    promptInstruction:
      "PERSONA: Angry / Tough Boss (controlled impatience). Simulate a demanding tech lead under tight deadlines. Use phrases like 'Come on, think about the system design perspective!', 'If this breaks in production at 2 AM, what is your rollback strategy?'. Be firm and urgent, but NEVER insult, humiliate, or use abusive language. Focus the pressure strictly on engineering edge cases.",
  },
  mentor: {
    id: "mentor",
    name: "Friendly Mentor",
    tagline: "Supportive & instructive",
    description: "Guides you through hints, points out what's great, and teaches the exact solution with simple examples.",
    icon: HeartHandshake,
    primaryColor: "#06b6d4", // Cyan
    glowColor: "rgba(6, 182, 212, 0.45)",
    badgeBg: "bg-cyan-500/10 border-cyan-500/30 text-cyan-600 dark:text-cyan-400",
    promptInstruction:
      "PERSONA: Friendly Mentor. Warm, empathetic, and dedicated to teaching. If the user struggles or says 'I don't know', immediately reassure them: 'That is completely fine, that is why we are practicing! Here is how to think about it...'. Teach the core idea with a simple example and check if they feel confident.",
  },
  professional: {
    id: "professional",
    name: "Professional Standard",
    tagline: "FAANG / Tier-1 format",
    description: "Structured, balanced, polite corporate interview matching Google, Microsoft, and Uber standards.",
    icon: Briefcase,
    primaryColor: "#3b82f6", // Blue
    glowColor: "rgba(59, 130, 246, 0.45)",
    badgeBg: "bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400",
    promptInstruction:
      "PERSONA: Professional Standard. Polite, structured, corporate technical interviewer (Google/Microsoft India style). Natural Indian English, balanced between probing depth and courteous pacing. Clear transitions between topics.",
  },
  random: {
    id: "random",
    name: "Random Dynamic Mix",
    tagline: "Spontaneous mood shifts",
    description: "Adapts dynamically: chill when you're doing well, strict when you miss details, and playful when you need a break.",
    icon: Shuffle,
    primaryColor: "#a855f7", // Purple
    glowColor: "rgba(168, 85, 247, 0.45)",
    badgeBg: "bg-purple-500/10 border-purple-500/30 text-purple-600 dark:text-purple-400",
    promptInstruction:
      "PERSONA: Random Dynamic Mix. Dynamically adapt your mood: if the candidate gives a brilliant answer, be warmly impressed. If they hand-wave, turn strict and probe deeper. If they seem nervous, turn into a supportive mentor.",
  },
};

interface PersonalitySelectorProps {
  selected: PersonalityId;
  onSelect: (id: PersonalityId) => void;
  disabled?: boolean;
}

export function PersonalitySelector({
  selected,
  onSelect,
  disabled = false,
}: PersonalitySelectorProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          Interviewer Personality
        </label>
        <span className="text-[11px] text-muted-foreground">
          Switch anytime mid-session
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {(Object.values(PERSONALITIES) as PersonalityConfig[]).map((p) => {
          const isCurrent = p.id === selected;
          const Icon = p.icon;
          return (
            <button
              key={p.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(p.id)}
              className={`flex flex-col text-left p-2.5 rounded-xl border transition-all ${
                isCurrent
                  ? `border-primary shadow-sm ring-1 ring-primary/40 ${p.badgeBg}`
                  : "border-border bg-card/60 hover:bg-accent/60 text-muted-foreground hover:text-foreground"
              } disabled:opacity-50`}
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <Icon className={`h-4 w-4 ${isCurrent ? "text-primary" : "text-muted-foreground"}`} />
                {isCurrent && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
              </div>
              <span className={`text-xs font-bold truncate ${isCurrent ? "text-foreground" : "text-foreground/90"}`}>
                {p.name}
              </span>
              <span className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">
                {p.tagline}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

