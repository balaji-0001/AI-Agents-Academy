import React, { useState } from "react";
import { Wrench, Bug, CheckCircle, Lightbulb, Compass, Link as LinkIcon } from "lucide-react";
import { Link } from "@tanstack/react-router";

export interface PracticalExercise {
  title: string;
  instructions: string;
  starterCode: string;
  solutionHint: string;
}

export interface DebuggingChallenge {
  title: string;
  buggyCode: string;
  symptom: string;
  explanation: string;
  correctedCode: string;
}

interface ExerciseChallengeProps {
  exercise: PracticalExercise;
  debuggingChallenge?: DebuggingChallenge;
  revisionSummary: string[];
  relatedTopics?: {
    title: string;
    moduleId: number;
  }[];
  className?: string;
}

export function ExerciseChallenge({
  exercise,
  debuggingChallenge,
  revisionSummary,
  relatedTopics,
  className = "",
}: ExerciseChallengeProps) {
  const [showSolution, setShowSolution] = useState(false);
  const [showDebugFix, setShowDebugFix] = useState(false);

  return (
    <div className={`space-y-4 rounded-xl border bg-card p-5 shadow-sm ${className}`}>
      {/* Hands-on Exercise */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 border-b pb-3">
          <Wrench className="h-5 w-5 text-primary" />
          <h3 className="font-bold text-base text-foreground">Hands-on Practice: {exercise.title}</h3>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">{exercise.instructions}</p>

        <pre className="rounded-lg border bg-background p-3 font-mono text-xs text-foreground overflow-x-auto">
          {exercise.starterCode}
        </pre>

        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={() => setShowSolution(!showSolution)}
            className="text-xs font-semibold text-primary hover:underline"
          >
            {showSolution ? "Hide Solution Hint" : "Show Solution Hint"}
          </button>
        </div>

        {showSolution && (
          <div className="rounded-lg border border-primary/30 bg-primary/10 p-3 text-xs leading-relaxed text-foreground/90">
            <b className="text-primary font-semibold">Solution Approach:</b>
            <p className="mt-1 font-mono text-[11px] whitespace-pre-wrap">{exercise.solutionHint}</p>
          </div>
        )}
      </div>

      {/* Debugging Challenge */}
      {debuggingChallenge && (
        <div className="rounded-lg border border-warning/30 bg-warning/5 p-4 space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-warning flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
              <Bug className="h-4 w-4" />
              Debugging Challenge: {debuggingChallenge.title}
            </span>
          </div>

          <p className="text-muted-foreground">
            <b>Observed Failure / Bug:</b> {debuggingChallenge.symptom}
          </p>

          <pre className="rounded border bg-background p-3 font-mono text-xs text-foreground overflow-x-auto">
            {debuggingChallenge.buggyCode}
          </pre>

          <button
            type="button"
            onClick={() => setShowDebugFix(!showDebugFix)}
            className="text-xs font-semibold text-warning hover:underline"
          >
            {showDebugFix ? "Hide Bug Fix" : "Reveal Root Cause & Fix"}
          </button>

          {showDebugFix && (
            <div className="space-y-2 pt-1 border-t border-warning/20">
              <p className="text-foreground/90 leading-relaxed">
                <b>Root Cause:</b> {debuggingChallenge.explanation}
              </p>
              <pre className="rounded border border-success/30 bg-success/10 p-3 font-mono text-xs text-foreground overflow-x-auto">
                {debuggingChallenge.correctedCode}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Revision Summary */}
      <div className="rounded-lg border bg-muted/20 p-4 space-y-2 text-xs">
        <span className="font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
          <CheckCircle className="h-4 w-4 text-success" />
          Key Revision Takeaways
        </span>
        <ul className="list-disc pl-5 space-y-1 text-muted-foreground leading-relaxed">
          {revisionSummary.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      </div>

      {/* Related Topics Navigation */}
      {relatedTopics && relatedTopics.length > 0 && (
        <div className="pt-2 border-t flex flex-wrap items-center gap-2 text-xs">
          <span className="text-muted-foreground font-semibold flex items-center gap-1">
            <Compass className="h-3.5 w-3.5 text-primary" />
            Next Recommended Modules:
          </span>
          {relatedTopics.map((top) => (
            <Link
              key={top.moduleId}
              to="/courses"
              search={{ module: top.moduleId }}
              className="rounded-md border bg-card px-2.5 py-1 text-primary hover:bg-accent font-medium transition-colors"
            >
              Module {top.moduleId}: {top.title}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

