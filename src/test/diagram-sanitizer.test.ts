import { describe, expect, it } from "vitest";
import { sanitizeMermaidSource } from "@/components/academy/learning/DiagramViewer";
import { VISUAL_LESSONS } from "@/lib/visual-curriculum";

describe("DiagramViewer sanitizer", () => {
  it("quotes node labels containing parentheses to prevent Mermaid parse errors", () => {
    const raw = "Trans1 --> ModelGrader[Model-based Judge (Rubric Scorer)]";
    const sanitized = sanitizeMermaidSource(raw);
    expect(sanitized).toBe('Trans1 --> ModelGrader["Model-based Judge (Rubric Scorer)"]');
  });

  it("leaves cylinder shapes like Cache[(Semantic Cache / Redis)] intact", () => {
    const raw = "Service <--> Cache[(Semantic Cache / Redis)]";
    const sanitized = sanitizeMermaidSource(raw);
    expect(sanitized).toBe("Service <--> Cache[(Semantic Cache / Redis)]");
  });

  it("does not double-quote already quoted labels", () => {
    const raw = 'Node["Already Quoted (Label)"]';
    const sanitized = sanitizeMermaidSource(raw);
    expect(sanitized).toBe('Node["Already Quoted (Label)"]');
  });

  it("verifies all registered VISUAL_LESSONS diagram sources have no unquoted parentheses", () => {
    for (const [key, lesson] of Object.entries(VISUAL_LESSONS)) {
      const sources = [
        { name: "diagram", src: lesson.diagram?.source },
        { name: "beginnerView", src: lesson.architecture?.beginnerView?.diagramSource },
        { name: "productionView", src: lesson.architecture?.productionView?.diagramSource },
      ];
      for (const s of sources) {
        if (!s.src) continue;
        const sanitized = sanitizeMermaidSource(s.src);
        // After sanitization, there should be no unquoted parentheses inside square brackets [ ... ( ... ) ... ]
        // except cylinders [( ... )]
        const lines = sanitized.split("\n");
        for (const line of lines) {
          const withoutCylinders = line.replace(/\[\([^\)]*\)\]/g, "");
          const match = withoutCylinders.match(/\[[^\"\]]*\([^\)]*\)[^\"\]]*\]/);
          expect(match, `Unquoted parentheses in ${key} (${s.name}): "${line}"`).toBeNull();
        }
      }
    }
  });
});

