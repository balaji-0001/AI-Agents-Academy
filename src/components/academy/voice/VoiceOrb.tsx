import React, { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Sparkles, Loader2, Volume2, Pause, Play, AlertCircle } from "lucide-react";

export type VoiceState =
  | "idle"
  | "connecting"
  | "listening"
  | "thinking"
  | "speaking"
  | "interrupted"
  | "muted"
  | "paused";

interface VoiceOrbProps {
  state: VoiceState;
  analyserNode: AnalyserNode | null;
  personalityTheme: {
    name: string;
    primaryColor: string;
    glowColor: string;
    badgeBg: string;
  };
  isMuted: boolean;
  onToggleMute: () => void;
  onInterrupt: () => void;
}

export function VoiceOrb({
  state,
  analyserNode,
  personalityTheme,
  isMuted,
  onToggleMute,
  onInterrupt,
}: VoiceOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [audioLevel, setAudioLevel] = useState<number>(0);

  // Real-time audio waveform / amplitude visualizer using AnalyserNode
  useEffect(() => {
    if (!analyserNode || typeof window === "undefined") return;

    const dataArray = new Uint8Array(analyserNode.frequencyBinCount);

    const updateAudioData = () => {
      analyserNode.getByteFrequencyData(dataArray);

      // Compute average volume level (0 to 1)
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const avg = sum / (dataArray.length * 255);
      setAudioLevel(avg);

      // Draw subtle circular waveform on canvas
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          const centerX = canvas.width / 2;
          const centerY = canvas.height / 2;
          const baseRadius = 75;

          ctx.beginPath();
          const slices = 36;
          for (let i = 0; i < slices; i++) {
            const angle = (i * 2 * Math.PI) / slices;
            const freqVal = dataArray[i * 2] || 0;
            const dynamicRadius = baseRadius + (freqVal / 255) * 28;
            const x = centerX + Math.cos(angle) * dynamicRadius;
            const y = centerY + Math.sin(angle) * dynamicRadius;

            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();
          ctx.strokeStyle = state === "speaking" ? personalityTheme.primaryColor : "rgba(16, 185, 129, 0.7)";
          ctx.lineWidth = 2.5;
          ctx.shadowBlur = 12;
          ctx.shadowColor = personalityTheme.glowColor;
          ctx.stroke();
        }
      }

      animationFrameRef.current = requestAnimationFrame(updateAudioData);
    };

    animationFrameRef.current = requestAnimationFrame(updateAudioData);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [analyserNode, state, personalityTheme]);

  // Color & Glow configuration by state
  const getStateConfig = () => {
    switch (state) {
      case "connecting":
        return {
          label: "Connecting to Gemini...",
          ringColor: "border-blue-500/50",
          glowColor: "rgba(59, 130, 246, 0.35)",
          icon: Loader2,
          iconClass: "animate-spin text-blue-400",
          statusClass: "text-blue-500 bg-blue-500/10 border-blue-500/30",
        };
      case "listening":
        return {
          label: "Listening to you... Speak freely",
          ringColor: "border-emerald-500/60",
          glowColor: "rgba(16, 185, 129, 0.4)",
          icon: Mic,
          iconClass: "text-emerald-400 animate-pulse",
          statusClass: "text-emerald-500 bg-emerald-500/10 border-emerald-500/30",
        };
      case "thinking":
        return {
          label: "Interviewer is reasoning...",
          ringColor: "border-purple-500/60",
          glowColor: "rgba(168, 85, 247, 0.4)",
          icon: Sparkles,
          iconClass: "text-purple-400 animate-spin",
          statusClass: "text-purple-500 bg-purple-500/10 border-purple-500/30",
        };
      case "speaking":
        return {
          label: `Interviewer Speaking (${personalityTheme.name})`,
          ringColor: "border-indigo-500/70",
          glowColor: personalityTheme.glowColor,
          icon: Volume2,
          iconClass: "text-indigo-400 animate-bounce",
          statusClass: "text-indigo-500 bg-indigo-500/10 border-indigo-500/30",
        };
      case "interrupted":
        return {
          label: "Interrupted! Listening to your reply...",
          ringColor: "border-amber-500/70",
          glowColor: "rgba(245, 158, 11, 0.45)",
          icon: AlertCircle,
          iconClass: "text-amber-400",
          statusClass: "text-amber-500 bg-amber-500/10 border-amber-500/30",
        };
      case "muted":
        return {
          label: "Microphone Muted",
          ringColor: "border-rose-500/50",
          glowColor: "rgba(244, 63, 94, 0.3)",
          icon: MicOff,
          iconClass: "text-rose-400",
          statusClass: "text-rose-500 bg-rose-500/10 border-rose-500/30",
        };
      case "paused":
        return {
          label: "Session Paused",
          ringColor: "border-zinc-500/50",
          glowColor: "rgba(113, 113, 122, 0.2)",
          icon: Pause,
          iconClass: "text-zinc-400",
          statusClass: "text-zinc-500 bg-zinc-500/10 border-zinc-500/30",
        };
      default:
        return {
          label: "Tap Start to Begin Live Voice Session",
          ringColor: "border-primary/40",
          glowColor: "rgba(99, 102, 241, 0.25)",
          icon: Mic,
          iconClass: "text-primary",
          statusClass: "text-muted-foreground bg-muted border-border",
        };
    }
  };

  const config = getStateConfig();
  const Icon = config.icon;

  // Calculate dynamic scale from audio level
  const dynamicScale = 1 + (audioLevel * 0.4);

  return (
    <div className="relative flex flex-col items-center justify-center py-6 select-none">
      {/* Central Interactive Voice Orb */}
      <div className="relative flex items-center justify-center h-64 w-64">
        {/* Ambient Outer Halo */}
        <div
          className="absolute inset-0 rounded-full blur-3xl transition-all duration-300 pointer-events-none"
          style={{
            backgroundColor: config.glowColor,
            transform: `scale(${dynamicScale * 1.15})`,
          }}
        />

        {/* Outer Pulsing Wave Ring */}
        <div
          className={`absolute inset-4 rounded-full border-2 transition-all duration-300 ${config.ringColor} ${
            state === "listening" || state === "speaking" ? "animate-ping opacity-25" : "opacity-40"
          }`}
          style={{
            transform: `scale(${dynamicScale * 1.05})`,
          }}
        />

        {/* Canvas for Live Audio Waveform Ripple */}
        <canvas
          ref={canvasRef}
          width={256}
          height={256}
          className="absolute inset-0 pointer-events-none z-10"
        />

        {/* Middle Frosted Glass Ring */}
        <div
          className={`absolute inset-8 rounded-full border border-white/20 dark:border-white/10 backdrop-blur-md shadow-2xl transition-all duration-200 flex items-center justify-center`}
          style={{
            background:
              state === "speaking"
                ? `radial-gradient(circle, ${personalityTheme.primaryColor}22 0%, rgba(15, 23, 42, 0.6) 80%)`
                : "radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(15, 23, 42, 0.7) 80%)",
            transform: `scale(${dynamicScale})`,
          }}
        >
          {/* Inner Core Orb */}
          <div className="relative flex flex-col items-center justify-center">
            <div
              className={`grid h-20 w-20 place-items-center rounded-full shadow-lg transition-transform duration-150 ${
                state === "speaking"
                  ? "bg-gradient-to-tr from-indigo-600 to-purple-600 text-white"
                  : state === "listening"
                  ? "bg-gradient-to-tr from-emerald-600 to-teal-500 text-white"
                  : state === "thinking"
                  ? "bg-gradient-to-tr from-purple-600 to-pink-600 text-white"
                  : state === "interrupted"
                  ? "bg-gradient-to-tr from-amber-600 to-orange-500 text-white"
                  : isMuted
                  ? "bg-rose-600 text-white"
                  : "bg-primary text-primary-foreground"
              }`}
            >
              <Icon className={`h-9 w-9 ${config.iconClass}`} />
            </div>

            {/* Speaking audio ripple bars */}
            {state === "speaking" && (
              <div className="absolute -bottom-6 flex items-center gap-1">
                {[40, 70, 100, 60, 85, 45, 90].map((h, i) => (
                  <span
                    key={i}
                    className="w-1 rounded-full bg-indigo-400 animate-pulse"
                    style={{
                      height: `${(h * (0.4 + audioLevel * 0.6)) / 3}px`,
                      animationDelay: `${i * 90}ms`,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Barge-in / Interrupt Quick-Action Pill (When AI is speaking) */}
        {state === "speaking" && (
          <button
            type="button"
            onClick={onInterrupt}
            className="absolute -bottom-3 z-20 flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/20 px-3.5 py-1 text-xs font-bold text-amber-500 backdrop-blur-md shadow-md hover:bg-amber-500/30 transition-all active:scale-95"
            title="Interrupt AI and speak"
          >
            <AlertCircle className="h-3.5 w-3.5" />
            Interrupt & Speak
          </button>
        )}
      </div>

      {/* State Badge with Pulse Indicator */}
      <div className="mt-4 flex flex-col items-center gap-1.5">
        <span
          className={`flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-bold tracking-wide transition-all shadow-xs ${config.statusClass}`}
        >
          <span className="h-2 w-2 rounded-full bg-current animate-pulse" />
          {config.label}
        </span>
        <span className="text-[11px] text-muted-foreground">
          {state === "speaking" ? "You can interrupt the interviewer anytime by speaking." : "Natural two-way Indian English conversation."}
        </span>
      </div>
    </div>
  );
}

