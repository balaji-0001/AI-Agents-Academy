import React, { useEffect, useRef, useState } from "react";
import {
  Mic,
  MicOff,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Volume2,
  PhoneOff,
  Copy,
  Check,
  Download,
  AlertCircle,
  HelpCircle,
  Info,
  Radio,
  FileText,
  ChevronDown,
  GraduationCap,
} from "lucide-react";
import { VoiceOrb, VoiceState } from "./VoiceOrb";
import {
  PersonalityId,
  PERSONALITIES,
  PersonalitySelector,
} from "./PersonalitySelector";
import {
  GeminiLiveVoiceSession,
  LiveMessage,
  LiveInterviewConfig,
} from "@/lib/gemini-live";
import { isGeminiConfigured } from "@/lib/gemini";

interface LiveVoiceSessionViewProps {
  onSwitchToText: () => void;
}

export function LiveVoiceSessionView({ onSwitchToText }: LiveVoiceSessionViewProps) {
  const [selectedPersonality, setSelectedPersonality] = useState<PersonalityId>("chill");
  const [role, setRole] = useState("AI Engineer");
  const [level, setLevel] = useState("Intermediate");
  const [focus, setFocus] = useState("AI Agents & System Design");
  const [sessionMode, setSessionMode] = useState<"interview" | "discussion">("interview");

  const [sessionActive, setSessionActive] = useState(false);
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [messages, setMessages] = useState<LiveMessage[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sessionEndedReport, setSessionEndedReport] = useState<LiveMessage[] | null>(null);

  const sessionRef = useRef<GeminiLiveVoiceSession | null>(null);
  const transcriptBottomRef = useRef<HTMLDivElement>(null);
  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);

  const hasGemini = isGeminiConfigured();

  // Auto-scroll transcript when new messages arrive
  useEffect(() => {
    if (transcriptBottomRef.current) {
      transcriptBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, voiceState]);

  // Clean up session on unmount
  useEffect(() => {
    return () => {
      if (sessionRef.current) {
        sessionRef.current.end();
        sessionRef.current = null;
      }
    };
  }, []);

  const handleStartSession = async () => {
    setErrorMessage(null);
    setSessionEndedReport(null);
    setMessages([]);
    setIsMuted(false);
    setIsPaused(false);

    const config: LiveInterviewConfig = {
      role,
      level,
      focus,
      mode: sessionMode,
      personality: selectedPersonality,
    };

    const session = new GeminiLiveVoiceSession(config, {
      onStateChange: (newState) => {
        setVoiceState(newState);
      },
      onMessage: (msg) => {
        setMessages((prev) => [...prev, msg]);
      },
      onError: (err) => {
        setErrorMessage(err);
      },
    });

    sessionRef.current = session;
    setSessionActive(true);

    try {
      await session.start();
      setAnalyserNode(session.getAnalyserNode());
    } catch (err: any) {
      console.error("Session start error:", err);
      setErrorMessage(err.message || "Failed to start live session");
      setSessionActive(false);
    }
  };

  const handleEndSession = () => {
    if (sessionRef.current) {
      const finalMessages = sessionRef.current.getMessages();
      sessionRef.current.end();
      sessionRef.current = null;
      setSessionEndedReport([...finalMessages]);
    }
    setSessionActive(false);
    setVoiceState("idle");
    setAnalyserNode(null);
  };

  const handlePersonalityChange = (newPersonality: PersonalityId) => {
    setSelectedPersonality(newPersonality);
    if (sessionRef.current && sessionActive) {
      sessionRef.current.updatePersonality(newPersonality);
    }
  };

  const handleToggleMute = () => {
    if (sessionRef.current) {
      sessionRef.current.toggleMute();
      setIsMuted((prev) => !prev);
    }
  };

  const handleTogglePause = () => {
    if (sessionRef.current) {
      if (isPaused) {
        sessionRef.current.resume();
        setIsPaused(false);
      } else {
        sessionRef.current.pause();
        setIsPaused(true);
      }
    }
  };

  const handleInterrupt = () => {
    if (sessionRef.current) {
      sessionRef.current.interruptSpeech();
    }
  };

  const handleReplayLatest = () => {
    const lastAiMsg = [...messages].reverse().find((m) => m.sender === "interviewer");
    if (lastAiMsg && typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(lastAiMsg.text);
      const voices = window.speechSynthesis.getVoices();
      const indianVoice = voices.find(
        (v) => v.lang === "en-IN" || v.name.toLowerCase().includes("india")
      );
      if (indianVoice) utterance.voice = indianVoice;
      utterance.rate = 1.05;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleCopyTranscript = () => {
    const text = (sessionEndedReport || messages)
      .map((m) => `[${m.sender.toUpperCase()} - ${m.timestamp.toLocaleTimeString()}]: ${m.text}`)
      .join("\n\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTranscript = () => {
    const text = JSON.stringify(sessionEndedReport || messages, null, 2);
    const blob = new Blob([text], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `voice-interview-transcript-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const currentTheme = PERSONALITIES[selectedPersonality];

  return (
    <div className="space-y-6">
      {/* Real-time Engine Status & Fallback Disclosure Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border bg-card p-3.5 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-3 w-3">
            {sessionActive ? (
              <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
              </>
            ) : (
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary/70" />
            )}
          </div>
          <div>
            <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
              Gemini Real-Time Voice Engine
              <span className="rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 text-[10px] font-semibold">
                Streaming & Barge-in Enabled
              </span>
            </span>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Continuous Indian English recognition (`en-IN`) • Real-time Web Audio reactivity • Instant interruption barge-in
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={onSwitchToText}
            className="rounded-lg border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            Switch to Text Mode
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-xs text-destructive flex items-start gap-2.5">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">{errorMessage}</p>
            <p className="text-muted-foreground">
              Please make sure your microphone is allowed in browser settings and your Gemini API key is valid.
            </p>
          </div>
        </div>
      )}

      {/* Post-Session Summary Dialog / Report (If session just ended) */}
      {sessionEndedReport && !sessionActive && (
        <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
                <Check className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-foreground">
                  Voice Session Completed
                </h3>
                <p className="text-xs text-muted-foreground">
                  Total conversation turns: {sessionEndedReport.filter((m) => m.sender === "user").length} candidate answers • {selectedPersonality} style
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyTranscript}
                className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold hover:bg-accent text-foreground transition-colors"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied" : "Copy Transcript"}
              </button>
              <button
                type="button"
                onClick={handleDownloadTranscript}
                className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold hover:bg-accent text-foreground transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
                Download JSON
              </button>
            </div>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed">
            Great practice! In this session, your AI interviewer challenged your understanding of <strong className="text-foreground">{focus}</strong> with personalized Indian coaching, explanations, and instant corrections.
          </p>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleStartSession}
              className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 shadow-sm transition-all"
            >
              Start Another Voice Session
            </button>
            <button
              onClick={onSwitchToText}
              className="rounded-lg border px-4 py-2.5 text-sm font-semibold hover:bg-accent text-foreground transition-colors"
            >
              Take Structured Text Interview
            </button>
          </div>
        </div>
      )}

      {/* Main Live Voice Experience Grid */}
      <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        {/* Left Column: Interactive Configuration & Personality Selector */}
        <div className="space-y-4">
          <div className="rounded-2xl border bg-card p-4 space-y-4 shadow-xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Conversation Settings
            </h4>

            {/* Mode selection: Interview Practice vs Free Discussion */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Conversation Mode</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={sessionActive}
                  onClick={() => setSessionMode("interview")}
                  className={`rounded-lg p-2 text-xs font-semibold border transition-all ${
                    sessionMode === "interview"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  🎯 Tech Interview
                </button>
                <button
                  type="button"
                  disabled={sessionActive}
                  onClick={() => setSessionMode("discussion")}
                  className={`rounded-lg p-2 text-xs font-semibold border transition-all ${
                    sessionMode === "discussion"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  💡 Free Discussion
                </button>
              </div>
            </div>

            {/* Target Role */}
            <label className="block text-xs font-semibold text-muted-foreground">
              Target Role
              <select
                disabled={sessionActive}
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="mt-1 w-full rounded-lg border bg-card p-2 text-xs text-foreground focus:ring-2 focus:ring-ring outline-none"
              >
                <option value="AI Engineer">AI Engineer</option>
                <option value="Agentic AI Engineer">Agentic AI Engineer</option>
                <option value="LLM & RAG Architect">LLM & RAG Architect</option>
                <option value="Generative AI Engineer">Generative AI Engineer</option>
                <option value="Full-Stack AI Developer">Full-Stack AI Developer</option>
              </select>
            </label>

            {/* Experience Level */}
            <label className="block text-xs font-semibold text-muted-foreground">
              Seniority Level
              <select
                disabled={sessionActive}
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="mt-1 w-full rounded-lg border bg-card p-2 text-xs text-foreground focus:ring-2 focus:ring-ring outline-none"
              >
                <option value="Beginner">Beginner / Student</option>
                <option value="Fresher / Entry-Level">Fresher / Entry-Level</option>
                <option value="Intermediate">Intermediate (2-4 yrs)</option>
                <option value="Senior / Lead">Senior / Lead (5+ yrs)</option>
              </select>
            </label>

            {/* Technical Focus */}
            <label className="block text-xs font-semibold text-muted-foreground">
              Technical Focus Topic
              <select
                disabled={sessionActive}
                value={focus}
                onChange={(e) => setFocus(e.target.value)}
                className="mt-1 w-full rounded-lg border bg-card p-2 text-xs text-foreground focus:ring-2 focus:ring-ring outline-none"
              >
                <option value="AI Agents & System Design">AI Agents & Multi-Agent Architecture</option>
                <option value="Python & Async Concurrency">Python Concurrency & Async Execution</option>
                <option value="RAG, Embeddings & Vector DBs">Advanced RAG, Chunking & Vector DBs</option>
                <option value="LangGraph & State Machines">LangGraph, Cycles & Checkpointing</option>
                <option value="Model Context Protocol (MCP)">MCP Clients, Tools & Resources</option>
                <option value="Production AI System Design">Production System Design & Cost Optimization</option>
                <option value="Prompt Engineering & Guardrails">Guardrails, Eval & Security</option>
              </select>
            </label>
          </div>

          {/* Personality Switcher (Can change anytime!) */}
          <div className="rounded-2xl border bg-card p-4 shadow-xs">
            <PersonalitySelector
              selected={selectedPersonality}
              onSelect={handlePersonalityChange}
            />
          </div>
        </div>

        {/* Right Column: The Central Live Voice Stage */}
        <div className="space-y-4">
          <div className="rounded-2xl border bg-card p-6 shadow-sm flex flex-col items-center justify-center min-h-[420px] relative overflow-hidden">
            {/* Subtle background gradient based on selected personality */}
            <div
              className="absolute -top-24 -right-24 h-72 w-72 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors duration-500"
              style={{ backgroundColor: currentTheme.primaryColor }}
            />
            <div
              className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full blur-3xl opacity-15 pointer-events-none transition-colors duration-500"
              style={{ backgroundColor: currentTheme.primaryColor }}
            />

            {!sessionActive ? (
              /* Idle / Pre-Start Screen */
              <div className="text-center py-10 space-y-4 max-w-md z-10">
                <div
                  className="mx-auto grid h-20 w-20 place-items-center rounded-full shadow-lg border"
                  style={{
                    backgroundColor: `${currentTheme.primaryColor}15`,
                    borderColor: `${currentTheme.primaryColor}40`,
                    color: currentTheme.primaryColor,
                  }}
                >
                  <currentTheme.icon className="h-9 w-9" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-foreground">
                    Start Real-Time Voice Conversation
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Natural back-and-forth speech in Indian professional English with instant interruption barge-in and helpful explanations.
                  </p>
                </div>

                <div className="rounded-xl border bg-muted/30 p-3 text-xs text-left space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-foreground">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    Current Persona: {currentTheme.name}
                  </div>
                  <p className="text-muted-foreground text-[11px] leading-relaxed">
                    "{currentTheme.description}"
                  </p>
                </div>

                <button
                  onClick={handleStartSession}
                  className="rounded-xl bg-primary px-8 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 shadow-md transition-all active:scale-95 flex items-center gap-2 mx-auto"
                >
                  <Mic className="h-4 w-4" />
                  Connect & Begin Talking
                </button>
              </div>
            ) : (
              /* Active Live Voice Stage with VoiceOrb */
              <div className="w-full flex flex-col items-center z-10 space-y-6">
                <VoiceOrb
                  state={voiceState}
                  analyserNode={analyserNode}
                  personalityTheme={currentTheme}
                  isMuted={isMuted}
                  onToggleMute={handleToggleMute}
                  onInterrupt={handleInterrupt}
                />

                {/* Session Action Controls Toolbar */}
                <div className="flex flex-wrap items-center justify-center gap-3">
                  {/* Mute Toggle */}
                  <button
                    type="button"
                    onClick={handleToggleMute}
                    aria-label={isMuted ? "Unmute microphone" : "Mute microphone"}
                    className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-all shadow-xs ${
                      isMuted
                        ? "bg-rose-500/15 border-rose-500/40 text-rose-500"
                        : "bg-card hover:bg-accent text-foreground"
                    }`}
                  >
                    {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    <span>{isMuted ? "Unmute Mic" : "Mute Mic"}</span>
                  </button>

                  {/* Pause / Resume */}
                  <button
                    type="button"
                    onClick={handleTogglePause}
                    aria-label={isPaused ? "Resume conversation" : "Pause conversation"}
                    className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-all shadow-xs ${
                      isPaused
                        ? "bg-amber-500/15 border-amber-500/40 text-amber-500"
                        : "bg-card hover:bg-accent text-foreground"
                    }`}
                  >
                    {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                    <span>{isPaused ? "Resume" : "Pause"}</span>
                  </button>

                  {/* Replay Latest AI Speech */}
                  <button
                    type="button"
                    onClick={handleReplayLatest}
                    aria-label="Replay response"
                    className="flex items-center gap-1.5 rounded-xl border bg-card px-3.5 py-2 text-xs font-semibold hover:bg-accent text-foreground transition-all shadow-xs"
                    title="Repeat the last thing the interviewer said"
                  >
                    <RotateCcw className="h-4 w-4 text-muted-foreground" />
                    <span>Repeat</span>
                  </button>

                  {/* Interrupt Button (Visible anytime during active session) */}
                  <button
                    type="button"
                    onClick={handleInterrupt}
                    aria-label="Interrupt interviewer"
                    className="flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-2 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-all shadow-xs"
                  >
                    <AlertCircle className="h-4 w-4" />
                    <span>Barge-In (Interrupt)</span>
                  </button>

                  {/* End Session */}
                  <button
                    type="button"
                    onClick={handleEndSession}
                    aria-label="End session"
                    className="flex items-center gap-1.5 rounded-xl bg-destructive px-4 py-2 text-xs font-bold text-destructive-foreground hover:bg-destructive/90 transition-all shadow-xs"
                  >
                    <PhoneOff className="h-4 w-4" />
                    <span>End Session</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Live Chronological Transcript Box */}
          <div className="rounded-2xl border bg-card p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <h4 className="font-bold text-sm text-foreground">
                  Live Conversation Transcript
                </h4>
                <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                  {messages.length} messages
                </span>
              </div>

              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={handleCopyTranscript}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto space-y-3 pr-1 text-xs">
              {messages.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  <p>Speech will be transcribed here continuously in real time.</p>
                  <p className="text-[11px] mt-1">Start speaking naturally whenever you're ready.</p>
                </div>
              ) : (
                messages.map((m) => {
                  const isUser = m.sender === "user";
                  const isSystem = m.text.startsWith("[");
                  if (isSystem) {
                    return (
                      <div key={m.id} className="text-center py-1">
                        <span className="rounded-full bg-muted/80 px-3 py-1 text-[11px] font-medium text-muted-foreground">
                          {m.text}
                        </span>
                      </div>
                    );
                  }

                  const persona = m.personality ? PERSONALITIES[m.personality] : null;

                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 px-1">
                        <span className="text-[10px] font-bold text-muted-foreground">
                          {isUser ? "Candidate (You)" : `Interviewer (${persona?.name || "AI Lead"})`}
                        </span>
                        <span className="text-[9px] text-muted-foreground/70">
                          {m.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                        </span>
                      </div>

                      <div
                        className={`rounded-2xl px-4 py-2.5 max-w-[85%] text-xs leading-relaxed shadow-2xs ${
                          isUser
                            ? "bg-primary text-primary-foreground rounded-tr-xs"
                            : "bg-muted/70 text-foreground border border-border/50 rounded-tl-xs"
                        }`}
                      >
                        <p>{m.text}</p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={transcriptBottomRef} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

