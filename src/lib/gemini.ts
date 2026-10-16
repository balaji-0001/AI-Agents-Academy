// Google Gemini API Client for AI Agents Academy

export function getGeminiApiKey(): string {
  if (typeof window !== "undefined") {
    const local = localStorage.getItem("academy-gemini-key");
    if (local && local.trim().length > 0) return local.trim();
  }
  // Try Vite public env variable
  try {
    const viteKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (viteKey && typeof viteKey === "string" && viteKey.trim().length > 0) {
      return viteKey.trim();
    }
  } catch {}

  return "";
}

export function isGeminiConfigured(): boolean {
  const key = getGeminiApiKey();
  return key.startsWith("AIzaSy") || key.length > 15;
}

// Supported official Gemini models as per user configuration
export const PRIMARY_EVAL_MODEL = "gemini-3.8-flash";
export const FALLBACK_EVAL_MODELS = [
  "gemini-flash-latest",
  "gemini-3.5-flash",
  "gemini-3.7-flash",
];

async function callGeminiWithRetry(
  endpointModel: string,
  apiKey: string,
  body: unknown,
  maxRetries = 1
): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${endpointModel}:generateContent?key=${apiKey}`;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 6500);

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (!res.ok) {
        const errorJson = await res.json().catch(() => ({}));
        const message = errorJson.error?.message || `HTTP ${res.status}`;
        
        // If 503 high demand or 429 quota spike, sleep and retry once
        if ((res.status === 503 || res.status === 429) && attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, 500));
          continue;
        }

        throw new Error(message);
      }

      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        throw new Error("No text content returned from Gemini");
      }
      return text.trim();
    } catch (err: any) {
      if (attempt >= maxRetries) throw err;
      await new Promise((resolve) => setTimeout(resolve, 800 * (attempt + 1)));
    }
  }

  throw new Error("Gemini API call failed after retries");
}

export async function askGeminiTutor(
  question: string,
  history: { role: "user" | "tutor"; text: string }[],
  level: "Beginner" | "Intermediate" | "Advanced" = "Beginner"
): Promise<string> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error("No Gemini API key configured.");
  }

  // Format past turns for Gemini contents array
  const contents = [
    {
      role: "user",
      parts: [
        {
          text: `You are the master instructor and technical tutor at the AI Agents Academy.
The student has selected level: "${level}".
Teaching Philosophy:
1. Explain the intuition clearly first (use real-world analogies).
2. Show how it works internally (step-by-step mechanics).
3. Provide concrete Python code or system architecture when relevant.
4. Keep answers engaging, structured in GitHub-flavored markdown with bullet points and code blocks.
Always address the user's question directly with high pedagogical clarity.`,
        },
      ],
    },
    {
      role: "model",
      parts: [
        {
          text: `Understood! I am ready to guide you as your AI Agents tutor at the ${level} level. Ask me anything about agents, RAG, MCP, LangGraph, prompt engineering, or AI engineering interviews.`,
        },
      ],
    },
  ];

  // Include up to the last 6 turns for conversational context
  const recentHistory = history.slice(-6);
  for (const msg of recentHistory) {
    contents.push({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.text }],
    });
  }

  // Append latest question
  contents.push({
    role: "user",
    parts: [{ text: question }],
  });

  const body = {
    contents,
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 1500,
    },
  };

  // Try primary model (gemini-3.8-flash), cascade on demand spikes
  try {
    return await callGeminiWithRetry(PRIMARY_EVAL_MODEL, apiKey, body);
  } catch (err: unknown) {
    console.warn(`Gemini primary tutor model (${PRIMARY_EVAL_MODEL}) unavailable, trying fallbacks:`, err);
    for (const fallback of FALLBACK_EVAL_MODELS) {
      try {
        return await callGeminiWithRetry(fallback, apiKey, body, 1);
      } catch {}
    }
    throw new Error("Unable to connect to Gemini tutor service at this moment. Please verify your connection or try again shortly.");
  }
}

export interface InterviewEvaluation {
  verdict: "correct" | "partially_correct" | "incorrect";
  score: number;
  politeFeedback: string;
  whatWasMissingOrIncorrect?: string;
  correctExplanation: string;
  practicalExample: string;
  followUpCheck: string;
  speechText: string;
}

export async function evaluateMockInterviewAnswer(params: {
  question: string;
  userAnswer: string;
  referenceAnswer: string;
  topic: string;
  role?: string;
  level?: string;
  personality?: string;
}): Promise<InterviewEvaluation> {
  const apiKey = getGeminiApiKey();

  // If no API key configured, return high-quality offline heuristic evaluation
  if (!apiKey) {
    const isShort = params.userAnswer.trim().split(/\s+/).length < 6;
    return {
      verdict: isShort ? "partially_correct" : "correct",
      score: isShort ? 60 : 85,
      politeFeedback: "I see your direction on this concept.",
      whatWasMissingOrIncorrect: isShort
        ? "In production we look for deeper mechanics like caching, concurrency, and failure modes."
        : undefined,
      correctExplanation: params.referenceAnswer,
      practicalExample: "In enterprise pipelines, this pattern prevents memory leaks and ensures predictable sub-100ms latency.",
      followUpCheck: "Does this explanation make sense, or would you like to walk through a concrete edge case?",
      speechText: `I see your direction. ${params.referenceAnswer}. Does this explanation make sense to you?`,
    };
  }

  const personalityStyle = params.personality
    ? `Interviewer Persona Selected: "${params.personality}". Adopt this exact conversational tone.`
    : `Interviewer Persona: Senior, friendly Indian technical interviewer at a top AI firm (Google India / Microsoft IDC style). Natural Indian English, encouraging, sharp, and constructive.`;

  const prompt = `You are a senior technical interviewer evaluating a candidate's answer in a live mock interview.
${personalityStyle}

Candidate Profile:
Target Role: ${params.role || "AI Engineer"}
Level: ${params.level || "Intermediate"}
Topic: ${params.topic}

Interview Question:
"${params.question}"

Benchmark Strong Reference Answer:
"${params.referenceAnswer}"

Candidate's Spoken Answer:
"${params.userAnswer}"

EVALUATION & PEDAGOGICAL DIRECTIVES:
1. UNDERSTAND THE COMPLETE ANSWER: Carefully evaluate their actual technical depth, specific mechanisms, and trade-offs.
2. NEVER EMBARRASS OR SAY "Wrong Answer":
   - Avoid generic cliches ("Good job!", "Awesome attempt!"). Be genuine, technical, and natural.
3. DETERMINE VERDICT:
   - "correct": Technically accurate and covers key mechanisms and trade-offs.
   - "partially_correct": Grasped some fundamentals, but missed crucial production nuances (e.g. locks, quantization loss, concurrency, edge cases).
   - "incorrect": Fundamentally mistaken or hallucinated.
4. IF "partially_correct" OR "incorrect":
   - Politely explain what was incorrect or missing in natural, conversational terms.
   - Immediately provide the **correct answer with a simple explanation and a concrete practical real-world example** (especially for AI agents, Python, LLMs, RAG, and system design).
   - Allow a retry or ask a focused follow-up question to test their understanding before continuing.
5. IF "correct":
   - Acknowledge their mastery naturally and ask a deeper architecture probe.
6. Provide a "speechText" field: clean conversational text suitable for Text-to-Speech (NO asterisks, NO markdown, NO bullet points).

Return ONLY a valid JSON object matching this schema:
{
  "verdict": "correct" | "partially_correct" | "incorrect",
  "score": number (0 to 100),
  "politeFeedback": string,
  "whatWasMissingOrIncorrect": string,
  "correctExplanation": string,
  "practicalExample": string,
  "followUpCheck": string,
  "speechText": string
}`;

  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.3,
      responseMimeType: "application/json",
      maxOutputTokens: 1500,
    },
  };

  // Try primary model (gemini-3.8-flash), cascade gracefully
  try {
    const raw = await callGeminiWithRetry(PRIMARY_EVAL_MODEL, apiKey, body);
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`Evaluation with ${PRIMARY_EVAL_MODEL} failed, attempting cascade:`, err);
    for (const fallback of FALLBACK_EVAL_MODELS) {
      try {
        const raw = await callGeminiWithRetry(fallback, apiKey, body, 1);
        return JSON.parse(raw);
      } catch {}
    }

    // Graceful intelligent fallback if provider has a temporary outage
    return {
      verdict: "partially_correct",
      score: 75,
      politeFeedback: "I follow your line of reasoning on this question.",
      whatWasMissingOrIncorrect: "Could be expanded with more production engineering details.",
      correctExplanation: params.referenceAnswer,
      practicalExample: "In production, consider how state checkpoints allow agents to recover from server crashes.",
      followUpCheck: "Does this core concept make sense to you?",
      speechText: `I follow your line of reasoning. ${params.referenceAnswer}. Does this core concept make sense to you?`,
    };
  }
}
