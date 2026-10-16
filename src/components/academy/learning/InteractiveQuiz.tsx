import React, { useState, useEffect } from "react";
import { CheckCircle2, XCircle, RotateCcw, Award, HelpCircle } from "lucide-react";

export interface QuizItem {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface InteractiveQuizProps {
  lessonId: string;
  title?: string;
  questions: QuizItem[];
  className?: string;
}

export function InteractiveQuiz({
  lessonId,
  title = "Knowledge-Check Quiz",
  questions,
  className = "",
}: InteractiveQuizProps) {
  const storageKey = `academy-quiz-${lessonId}`;
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setSelectedAnswers(JSON.parse(stored));
        setIsSubmitted(true);
      }
    } catch {}
  }, [storageKey]);

  const handleSelect = (qId: string, optIdx: number) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [qId]: optIdx }));
  };

  const handleGrade = () => {
    setIsSubmitted(true);
    try {
      localStorage.setItem(storageKey, JSON.stringify(selectedAnswers));
    } catch {}
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setIsSubmitted(false);
    try {
      localStorage.removeItem(storageKey);
    } catch {}
  };

  const correctCount = questions.filter(
    (q) => selectedAnswers[q.id] === q.correctIndex
  ).length;

  const scorePct = Math.round((correctCount / questions.length) * 100);

  return (
    <div className={`space-y-4 rounded-xl border bg-card p-5 shadow-sm ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
        <div>
          <div className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            <h3 className="font-bold text-base text-foreground">{title}</h3>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Test your understanding of the concepts before proceeding
          </p>
        </div>

        {isSubmitted && (
          <div className="flex items-center gap-2">
            <span className={`rounded-lg px-3 py-1 text-xs font-bold ${scorePct >= 75 ? "bg-success/15 text-success" : "bg-warning/20 text-warning"}`}>
              Score: {correctCount}/{questions.length} ({scorePct}%)
            </span>
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-semibold hover:bg-accent text-foreground transition-colors"
            >
              <RotateCcw className="h-3 w-3" />
              Retry
            </button>
          </div>
        )}
      </div>

      {/* Questions List */}
      <div className="space-y-5">
        {questions.map((q, qIndex) => {
          const userChoice = selectedAnswers[q.id];
          const hasAnswered = userChoice !== undefined;
          const isCorrect = userChoice === q.correctIndex;

          return (
            <div key={q.id} className="space-y-3 rounded-lg border bg-background/50 p-4">
              <p className="font-semibold text-sm text-foreground">
                <span className="text-primary font-bold mr-1.5">{qIndex + 1}.</span>
                {q.question}
              </p>

              <div className="space-y-2">
                {q.options.map((opt, optIdx) => {
                  const isSelected = userChoice === optIdx;
                  let optStyle = "border-border bg-card hover:bg-accent text-foreground";

                  if (isSubmitted) {
                    if (optIdx === q.correctIndex) {
                      optStyle = "border-success bg-success/15 font-semibold text-success";
                    } else if (isSelected && !isCorrect) {
                      optStyle = "border-destructive bg-destructive/15 font-semibold text-destructive";
                    } else {
                      optStyle = "opacity-60 border-border bg-card";
                    }
                  } else if (isSelected) {
                    optStyle = "border-primary bg-primary/10 text-primary font-semibold ring-1 ring-primary";
                  }

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      disabled={isSubmitted}
                      onClick={() => handleSelect(q.id, optIdx)}
                      className={`w-full rounded-lg border p-3 text-left text-xs transition-all flex items-center justify-between ${optStyle}`}
                    >
                      <span>{opt}</span>
                      {isSubmitted && optIdx === q.correctIndex && <CheckCircle2 className="h-4 w-4 text-success shrink-0" />}
                      {isSubmitted && isSelected && !isCorrect && <XCircle className="h-4 w-4 text-destructive shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Explanation after submission */}
              {isSubmitted && hasAnswered && (
                <div className={`rounded-lg border p-3 text-xs leading-relaxed ${isCorrect ? "border-success/30 bg-success/10 text-foreground" : "border-destructive/30 bg-destructive/10 text-foreground"}`}>
                  <b className={isCorrect ? "text-success font-bold" : "text-destructive font-bold"}>
                    {isCorrect ? "Correct!" : "Incorrect."}
                  </b>
                  <p className="mt-1 text-muted-foreground">{q.explanation}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Submit Action */}
      {!isSubmitted && (
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            disabled={Object.keys(selectedAnswers).length === 0}
            onClick={handleGrade}
            className="rounded-lg bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-40"
          >
            Submit Quiz
          </button>
        </div>
      )}
    </div>
  );
}

