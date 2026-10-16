import React, { useEffect, useRef, useState, useId } from "react";
import { Copy, Check, Maximize2, Minimize2, ZoomIn, ZoomOut, RotateCcw, AlertTriangle, Layers, Info } from "lucide-react";
import { useTheme } from "@/lib/theme";

export interface DiagramExplanation {
  whatComponentsRepresent: string;
  arrowsAndDataFlow: string;
  stepSequence: string;
  failurePoints: string;
}

interface DiagramViewerProps {
  title: string;
  subtitle?: string;
  diagramType?: "flowchart" | "sequence" | "state" | "class" | "er" | "architecture";
  source: string;
  explanation?: DiagramExplanation;
  className?: string;
}

// Defensive helper to automatically quote unquoted node labels with parentheses or special characters
export function sanitizeMermaidSource(source: string): string {
  if (!source) return source;
  const lines = source.split("\n");
  const processed = lines.map((line) => {
    // Auto-quote node labels with parentheses inside square brackets:
    // e.g. Node[Text (extra)] -> Node["Text (extra)"]
    // Ignore cylinders: id[(...)]
    return line.replace(
      /([a-zA-Z0-9_-]+)\[([^"\]]*\([^"\]]*\)[^"\]]*)\]/g,
      (match, id, content) => {
        // If content is just "(text)" and was [(text)], don't touch cylinder
        if (content.startsWith("(") && content.endsWith(")")) {
          return match;
        }
        // If already quoted, leave alone
        if (content.startsWith('"') && content.endsWith('"')) {
          return match;
        }
        return `${id}["${content.trim()}"]`;
      }
    );
  });
  return processed.join("\n");
}

export function DiagramViewer({
  title,
  subtitle,
  diagramType = "flowchart",
  source,
  explanation,
  className = "",
}: DiagramViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgHtml, setSvgHtml] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showExplanation, setShowExplanation] = useState(true);
  const rawId = useId();
  const diagramId = `mermaid-${rawId.replace(/:/g, "")}`;
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    let isMounted = true;

    async function renderDiagram() {
      if (typeof window === "undefined") return;

      try {
        setError(null);
        const mermaid = (await import("mermaid")).default;

        mermaid.initialize({
          startOnLoad: false,
          theme: resolvedTheme === "dark" ? "dark" : "neutral",
          securityLevel: "loose",
          fontFamily: "Manrope, sans-serif",
          flowchart: {
            curve: "basis",
            useMaxWidth: true,
            htmlLabels: true,
          },
          themeVariables: {
            darkMode: resolvedTheme === "dark",
            primaryColor: resolvedTheme === "dark" ? "#6366f1" : "#4f46e5",
            primaryTextColor: resolvedTheme === "dark" ? "#f8fafc" : "#ffffff",
            primaryBorderColor: resolvedTheme === "dark" ? "#818cf8" : "#4338ca",
            lineColor: resolvedTheme === "dark" ? "#94a3b8" : "#64748b",
            secondaryColor: resolvedTheme === "dark" ? "#1e293b" : "#f1f5f9",
            tertiaryColor: resolvedTheme === "dark" ? "#0f172a" : "#f8fafc",
            background: resolvedTheme === "dark" ? "#181825" : "#ffffff",
          },
        });

        // Clean and sanitize source to prevent Mermaid parse errors
        const sanitizedSource = sanitizeMermaidSource(source.trim());
        const renderId = `render-${diagramId}-${Date.now()}`;
        const { svg } = await mermaid.render(renderId, sanitizedSource);

        if (isMounted) {
          setSvgHtml(svg);
        }
      } catch (err: unknown) {
        if (isMounted) {
          console.error("Mermaid rendering error:", err);
          setError(err instanceof Error ? err.message : "Failed to render diagram");
        }
      }
    }

    renderDiagram();

    return () => {
      isMounted = false;
    };
  }, [source, resolvedTheme, diagramId]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(source);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.2, 2.5));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.2, 0.5));
  const handleResetZoom = () => setZoom(1);

  return (
    <div
      className={`rounded-xl border bg-card shadow-sm transition-all ${
        isFullscreen ? "fixed inset-4 z-50 flex flex-col overflow-auto bg-background/95 backdrop-blur shadow-2xl p-6" : "p-5"
      } ${className}`}
    >
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" />
            <h3 className="font-bold text-base text-foreground">{title}</h3>
            <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold uppercase text-primary tracking-wide">
              {diagramType}
            </span>
          </div>
          {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
        </div>

        {/* Toolbar controls */}
        <div className="flex items-center gap-1.5 bg-muted/60 rounded-lg p-1">
          <button
            onClick={handleZoomOut}
            title="Zoom Out"
            aria-label="Zoom out"
            className="rounded p-1 hover:bg-background text-muted-foreground hover:text-foreground transition-colors"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </button>
          <span className="px-1 text-[11px] font-mono text-muted-foreground select-none">{Math.round(zoom * 100)}%</span>
          <button
            onClick={handleZoomIn}
            title="Zoom In"
            aria-label="Zoom in"
            className="rounded p-1 hover:bg-background text-muted-foreground hover:text-foreground transition-colors"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleResetZoom}
            title="Reset Zoom"
            aria-label="Reset zoom"
            className="rounded p-1 hover:bg-background text-muted-foreground hover:text-foreground transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
          <div className="h-3.5 w-px bg-border mx-0.5" />
          <button
            onClick={handleCopy}
            title="Copy Diagram Source"
            aria-label="Copy source"
            className="rounded p-1 hover:bg-background text-muted-foreground hover:text-foreground transition-colors"
          >
            {isCopied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            aria-label="Toggle fullscreen"
            className="rounded p-1 hover:bg-background text-muted-foreground hover:text-foreground transition-colors"
          >
            {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Diagram Canvas */}
      <div
        ref={containerRef}
        className="relative min-h-[220px] w-full overflow-x-auto rounded-lg bg-background/50 border border-border/40 p-4 flex items-center justify-center transition-all"
      >
        {error ? (
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <AlertTriangle className="h-8 w-8 text-warning mb-2" />
            <p className="font-semibold text-sm text-foreground">Diagram Preview</p>
            <p className="mt-1 text-xs text-muted-foreground max-w-md">{error}</p>
            <pre className="mt-3 max-h-48 w-full overflow-x-auto rounded bg-muted p-3 text-left font-mono text-xs">
              {source}
            </pre>
          </div>
        ) : svgHtml ? (
          <div
            style={{ transform: `scale(${zoom})`, transformOrigin: "center center", transition: "transform 0.15s ease-out" }}
            className="w-full flex justify-center [&_svg]:max-w-full [&_svg]:h-auto select-none"
            dangerouslySetInnerHTML={{ __html: svgHtml }}
          />
        ) : (
          <div className="flex items-center gap-2 text-xs text-muted-foreground animate-pulse py-12">
            <Layers className="h-4 w-4 animate-spin text-primary" />
            Rendering interactive diagram...
          </div>
        )}
      </div>

      {/* Explanation Under Diagram */}
      {explanation && (
        <div className="mt-4 rounded-lg border bg-muted/30 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
              <Info className="h-3.5 w-3.5" />
              How to Read This Diagram
            </div>
            <button
              onClick={() => setShowExplanation(!showExplanation)}
              className="text-xs text-muted-foreground hover:text-foreground underline decoration-dotted"
            >
              {showExplanation ? "Hide Details" : "Show Details"}
            </button>
          </div>

          {showExplanation && (
            <div className="grid gap-3 pt-2 text-xs sm:grid-cols-2">
              <div className="rounded border bg-card p-3">
                <span className="font-bold text-foreground">What components represent:</span>
                <p className="mt-1 leading-relaxed text-muted-foreground">{explanation.whatComponentsRepresent}</p>
              </div>
              <div className="rounded border bg-card p-3">
                <span className="font-bold text-foreground">Data movement & arrows:</span>
                <p className="mt-1 leading-relaxed text-muted-foreground">{explanation.arrowsAndDataFlow}</p>
              </div>
              <div className="rounded border bg-card p-3">
                <span className="font-bold text-foreground">Execution sequence:</span>
                <p className="mt-1 leading-relaxed text-muted-foreground">{explanation.stepSequence}</p>
              </div>
              <div className="rounded border bg-warning/15 border-warning/30 p-3">
                <span className="font-bold text-warning">What happens if a component fails:</span>
                <p className="mt-1 leading-relaxed text-foreground/90">{explanation.failurePoints}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

