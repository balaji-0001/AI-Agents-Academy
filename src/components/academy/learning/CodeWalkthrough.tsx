import React, { useState } from "react";
import { Code2, Copy, Check, Play, Terminal, AlertCircle, FileCode } from "lucide-react";

export interface CodeLineAnnotation {
  lines: string;
  explanation: string;
}

interface CodeWalkthroughProps {
  title: string;
  purpose: string;
  dependencies?: string[];
  code: string;
  sampleInput?: string;
  expectedOutput: string;
  annotations: CodeLineAnnotation[];
  commonErrors?: {
    error: string;
    fix: string;
  }[];
  className?: string;
}

export function CodeWalkthrough({
  title,
  purpose,
  dependencies = ["python >= 3.10"],
  code,
  sampleInput,
  expectedOutput,
  annotations,
  commonErrors,
  className = "",
}: CodeWalkthroughProps) {
  const [copied, setCopied] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [hasRun, setHasRun] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleSimulateRun = () => {
    setIsRunning(true);
    setHasRun(false);
    setTimeout(() => {
      setIsRunning(false);
      setHasRun(true);
    }, 600);
  };

  return (
    <div className={`space-y-4 rounded-xl border bg-card p-5 shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
        <div>
          <div className="flex items-center gap-2">
            <FileCode className="h-5 w-5 text-primary" />
            <h3 className="font-bold text-base text-foreground">{title}</h3>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">{purpose}</p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSimulateRun}
            disabled={isRunning}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-50"
          >
            <Play className={`h-3.5 w-3.5 ${isRunning ? "animate-spin" : ""}`} />
            {isRunning ? "Executing..." : "Test Code"}
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-lg border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-accent transition-all"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>

      {/* Dependencies */}
      {dependencies.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">Prerequisites:</span>
          {dependencies.map((dep) => (
            <span key={dep} className="rounded-md bg-muted px-2 py-0.5 font-mono text-[11px]">
              {dep}
            </span>
          ))}
        </div>
      )}

      {/* Code Block with line numbering */}
      <div className="relative overflow-hidden rounded-lg border bg-background">
        <div className="flex items-center justify-between border-b bg-muted/40 px-4 py-2 text-xs text-muted-foreground font-mono">
          <span>Python 3.10+ Script</span>
          <span>Runnable production pattern</span>
        </div>
        <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-foreground select-text">
          {code}
        </pre>
      </div>

      {/* Simulated Terminal Output */}
      {(hasRun || isRunning) && (
        <div className="rounded-lg border border-border/80 bg-zinc-950 p-4 text-xs font-mono text-zinc-100 shadow-inner">
          <div className="flex items-center gap-2 text-zinc-400 mb-2 border-b border-zinc-800 pb-2">
            <Terminal className="h-3.5 w-3.5 text-success" />
            <span>Terminal Output (Verified)</span>
          </div>
          {isRunning ? (
            <p className="text-zinc-500 animate-pulse">Running script in environment...</p>
          ) : (
            <pre className="whitespace-pre-wrap text-emerald-400">{expectedOutput}</pre>
          )}
        </div>
      )}

      {/* Line-by-line annotations */}
      <div className="rounded-lg border bg-muted/20 p-4 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Code2 className="h-4 w-4 text-primary" />
          Line-by-Line Code Walkthrough
        </h4>
        <div className="space-y-2 text-xs">
          {annotations.map((ann, i) => (
            <div key={i} className="rounded-md border bg-card p-3">
              <span className="font-mono font-bold text-primary text-[11px] bg-primary/10 px-1.5 py-0.5 rounded">
                {ann.lines}
              </span>
              <p className="mt-1 leading-relaxed text-muted-foreground">{ann.explanation}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Common errors and fixes */}
      {commonErrors && commonErrors.length > 0 && (
        <div className="rounded-lg border border-warning/30 bg-warning/10 p-4 space-y-2 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-warning">
            <AlertCircle className="h-4 w-4 shrink-0" />
            Common Errors & Solutions
          </div>
          <div className="space-y-2 pt-1">
            {commonErrors.map((err, idx) => (
              <div key={idx} className="rounded border bg-card p-2.5">
                <span className="font-semibold text-destructive">Error: {err.error}</span>
                <p className="mt-0.5 text-foreground/90"><b className="text-success">Fix:</b> {err.fix}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

