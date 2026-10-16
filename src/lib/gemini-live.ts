// Gemini Live Conversational Voice Engine for AI Agents Academy
import { getGeminiApiKey, isGeminiConfigured } from "./gemini";
import { PersonalityId, PERSONALITIES } from "@/components/academy/voice/PersonalitySelector";

export type LiveVoiceState =
  | "idle"
  | "connecting"
  | "listening"
  | "thinking"
  | "speaking"
  | "interrupted"
  | "muted"
  | "paused";

export interface LiveMessage {
  id: string;
  sender: "user" | "interviewer";
  text: string;
  timestamp: Date;
  personality?: PersonalityId;
  interrupted?: boolean;
}

export interface LiveInterviewConfig {
  role: string;
  level: string;
  focus: string;
  mode: "interview" | "discussion";
  personality: PersonalityId;
}

// Structured session memory representing the interviewer's persistent recall
interface SessionMemory {
  topicsCovered: string[];
  candidateProjects: string[];
  skillsDemonstrated: string[];
  pastMistakes: { topic: string; concept: string; resolved: boolean }[];
  currentGoal: string;
  interruptionCount: number;
}

// Configured Gemini models for real-time speech and fallback cascade
export const PRIMARY_LIVE_MODEL = "gemini-3.8-live";
export const FALLBACK_LIVE_MODELS = [
  "gemini-3.8-flash",
  "gemini-3.8-flash-tts",
  "gemini-flash-latest",
  "gemini-3.5-flash",
];

export class GeminiLiveVoiceSession {
  private config: LiveInterviewConfig;
  private state: LiveVoiceState = "idle";
  private messages: LiveMessage[] = [];
  private onStateChange: (state: LiveVoiceState) => void;
  private onMessage: (msg: LiveMessage) => void;
  private onError: (err: string) => void;

  // Session Memory: Remembers past answers, projects, skills, and mistakes throughout the interview
  private memory: SessionMemory = {
    topicsCovered: [],
    candidateProjects: [],
    skillsDemonstrated: [],
    pastMistakes: [],
    currentGoal: "",
    interruptionCount: 0,
  };

  // Web Audio components
  private audioContext: AudioContext | null = null;
  private analyserNode: AnalyserNode | null = null;
  private mediaStream: MediaStream | null = null;
  private recognition: any = null;
  private isMuted: boolean = false;
  private isPaused: boolean = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  // Turn Completion & Silence Detection (Avoids premature interruptions)
  private speechBuffer: string = "";
  private turnSilenceTimer: any = null;
  private isProcessingTurn: boolean = false;

  constructor(
    config: LiveInterviewConfig,
    callbacks: {
      onStateChange: (state: LiveVoiceState) => void;
      onMessage: (msg: LiveMessage) => void;
      onError: (err: string) => void;
    }
  ) {
    this.config = config;
    this.onStateChange = callbacks.onStateChange;
    this.onMessage = callbacks.onMessage;
    this.onError = callbacks.onError;
    this.memory.currentGoal = `Assess candidate for ${config.role} (${config.level} level), focusing on ${config.focus}.`;
  }

  public getAnalyserNode(): AnalyserNode | null {
    return this.analyserNode;
  }

  public getMessages(): LiveMessage[] {
    return this.messages;
  }

  public getSessionMemory(): SessionMemory {
    return this.memory;
  }

  public updatePersonality(newPersonality: PersonalityId) {
    this.config.personality = newPersonality;
    const persona = PERSONALITIES[newPersonality];

    // Add system message indicating personality shift
    const systemNotice: LiveMessage = {
      id: `sys-${Date.now()}`,
      sender: "interviewer",
      text: `[Personality shifted to ${persona.name}: "${persona.tagline}"]`,
      timestamp: new Date(),
      personality: newPersonality,
    };
    this.messages.push(systemNotice);
    this.onMessage(systemNotice);
  }

  public async start() {
    this.setState("connecting");

    // 1. Initialize Web Audio Context for microphone reactivity & sound wave
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioCtx();
      if (this.audioContext.state === "suspended") {
        await this.audioContext.resume();
      }

      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      const sourceNode = this.audioContext.createMediaStreamSource(this.mediaStream);
      this.analyserNode = this.audioContext.createAnalyser();
      this.analyserNode.fftSize = 128;
      sourceNode.connect(this.analyserNode);
    } catch (err: any) {
      console.warn("Could not capture Web Audio stream:", err);
      this.onError(
        err.name === "NotAllowedError"
          ? "Microphone access denied. Please allow microphone permissions in your browser."
          : `Audio initialization error: ${err.message}`
      );
      this.setState("idle");
      return;
    }

    // 2. Setup Continuous Speech Recognition with Turn Completion Detection & Barge-in
    this.initSpeechRecognition();

    // 3. Spontaneous Opening Greeting
    await this.generateGreeting();
  }

  private initSpeechRecognition() {
    const W = window as any;
    const SpeechRecognition = W.SpeechRecognition || W.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      this.onError(
        "Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge."
      );
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = "en-IN"; // Natural Indian English

    this.recognition.onstart = () => {
      if (this.state !== "speaking" && this.state !== "thinking") {
        this.setState("listening");
      }
    };

    this.recognition.onresult = (event: any) => {
      if (this.isMuted || this.isPaused) return;

      let interim = "";
      let newlyFinalized = "";

      for (let k = event.resultIndex; k < event.results.length; k++) {
        const item = event.results[k];
        if (item.isFinal) {
          newlyFinalized += item[0].transcript + " ";
        } else {
          interim += item[0].transcript;
        }
      }

      // BARGE-IN INTERRUPTION CHECK:
      // If AI is currently speaking and candidate begins talking, interrupt immediately!
      if (this.state === "speaking" && (newlyFinalized.trim().length > 0 || interim.trim().length > 2)) {
        this.interruptSpeech(true);
      }

      if (newlyFinalized.trim().length > 0) {
        this.speechBuffer += (this.speechBuffer ? " " : "") + newlyFinalized.trim();
        this.scheduleTurnCommit();
      }
    };

    this.recognition.onerror = (e: any) => {
      if (e.error === "no-speech") return;
      console.warn("Speech recognition notice:", e.error);
    };

    this.recognition.onend = () => {
      // Keep recognition alive while session is running
      if (this.state !== "idle" && !this.isPaused) {
        try {
          this.recognition.start();
        } catch {}
      }
    };

    try {
      this.recognition.start();
    } catch (e) {
      console.warn("Speech recognition already running");
    }
  }

  /**
   * Smart Turn Completion Detector:
   * Waits for a natural conversational pause (1.5s to 2.2s depending on sentence trailing words)
   * so the AI never interrupts the candidate mid-sentence while they think or pause!
   */
  private scheduleTurnCommit() {
    if (this.turnSilenceTimer) {
      clearTimeout(this.turnSilenceTimer);
    }

    const currentText = this.speechBuffer.trim();
    if (!currentText) return;

    // Check if sentence ends in a connecting word indicating ongoing thought
    const words = currentText.toLowerCase().split(/\s+/);
    const lastWord = words[words.length - 1];
    const isContinuingWord = [
      "and",
      "because",
      "so",
      "then",
      "like",
      "for",
      "example",
      "meaning",
      "well",
      "actually",
      "plus",
      "but",
      "if",
      "when",
    ].includes(lastWord);

    // If candidate ends with "and...", wait 2300ms; otherwise wait 1600ms of sustained silence
    const silenceDelay = isContinuingWord ? 2300 : 1600;

    this.turnSilenceTimer = setTimeout(async () => {
      const finalTurnText = this.speechBuffer.trim();
      this.speechBuffer = "";

      if (!finalTurnText || this.isProcessingTurn) return;

      this.isProcessingTurn = true;

      // Add to conversation history
      const userMsg: LiveMessage = {
        id: `user-${Date.now()}`,
        sender: "user",
        text: finalTurnText,
        timestamp: new Date(),
      };
      this.messages.push(userMsg);
      this.onMessage(userMsg);

      // Extract skills, projects, and entities for long-term session memory
      this.extractSessionMemoryEntities(finalTurnText);

      // Process with Gemini conversational AI
      await this.processUserSpeech(finalTurnText);
      this.isProcessingTurn = false;
    }, silenceDelay);
  }

  /**
   * Scans candidate speech to remember mentioned projects, frameworks, and skills
   */
  private extractSessionMemoryEntities(text: string) {
    const lower = text.toLowerCase();
    
    // Frameworks & projects detection
    const keywords = [
      "langgraph",
      "rag",
      "mcp",
      "fastapi",
      "celery",
      "temporal",
      "redis",
      "postgres",
      "chroma",
      "pinecone",
      "qdrant",
      "vllm",
      "pagedattention",
      "docker",
      "aws",
      "kafka",
      "pytorch",
      "evals",
      "ragas",
    ];

    for (const kw of keywords) {
      if (lower.includes(kw) && !this.memory.skillsDemonstrated.includes(kw)) {
        this.memory.skillsDemonstrated.push(kw);
      }
    }

    if (
      lower.includes("built") ||
      lower.includes("created") ||
      lower.includes("worked on") ||
      lower.includes("in my project") ||
      lower.includes("implemented")
    ) {
      if (!this.memory.candidateProjects.includes(text.slice(0, 100))) {
        this.memory.candidateProjects.push(text.slice(0, 120));
      }
    }
  }

  public interruptSpeech(isCandidateInterrupt = false) {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    this.currentUtterance = null;
    this.setState("interrupted");

    if (isCandidateInterrupt) {
      this.memory.interruptionCount += 1;
    }
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.mediaStream) {
      this.mediaStream.getAudioTracks().forEach((track) => {
        track.enabled = !this.isMuted;
      });
    }
    this.setState(this.isMuted ? "muted" : "listening");
  }

  public pause() {
    this.isPaused = true;
    this.interruptSpeech();
    if (this.turnSilenceTimer) clearTimeout(this.turnSilenceTimer);
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {}
    }
    this.setState("paused");
  }

  public resume() {
    this.isPaused = false;
    if (this.recognition) {
      try {
        this.recognition.start();
      } catch {}
    }
    this.setState("listening");
  }

  public end() {
    this.interruptSpeech();
    this.isPaused = false;
    this.isMuted = false;
    if (this.turnSilenceTimer) clearTimeout(this.turnSilenceTimer);

    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {}
      this.recognition = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((t) => t.stop());
      this.mediaStream = null;
    }

    if (this.audioContext) {
      try {
        this.audioContext.close();
      } catch {}
      this.audioContext = null;
    }

    this.setState("idle");
  }

  private setState(newState: LiveVoiceState) {
    this.state = newState;
    this.onStateChange(newState);
  }

  private async generateGreeting() {
    this.setState("thinking");

    const persona = PERSONALITIES[this.config.personality];
    const greetingPrompt = `You are a real senior Indian technical interviewer having a spontaneous, real-time voice call with a candidate.
Target Role: ${this.config.role} (${this.config.level} level).
Focus: ${this.config.focus}.
Mode: ${this.config.mode === "interview" ? "Technical Interview" : "Technical Discussion"}.
Interviewer Personality: ${persona.name}.
${persona.promptInstruction}

VOICE STYLE GUIDELINES:
- Speak in warm, natural Indian professional English (like a tech lead in Bangalore or Hyderabad).
- Keep it concise (1 to 2 short sentences).
- Give a friendly spoken greeting, introduce yourself, and kick off the conversation with an engaging opening technical question.
- Do NOT use markdown symbols, bullet points, asterisks, or robotic intros.
- Avoid repetitive cliches like "Welcome to the interview". Be fresh, spontaneous, and conversational.`;

    try {
      const response = await this.callGeminiWithCascade(greetingPrompt);
      const text =
        response ||
        "Hello! Great to connect with you today. Shall we begin with your background in AI agents?";

      const msg: LiveMessage = {
        id: `ai-${Date.now()}`,
        sender: "interviewer",
        text,
        timestamp: new Date(),
        personality: this.config.personality,
      };
      this.messages.push(msg);
      this.onMessage(msg);

      await this.speakResponse(text);
    } catch (err: any) {
      console.error("Greeting error:", err);
      const fallback =
        "Hello! I am your AI interviewer. Let's start with a foundational question: what is an AI agent, and how does it differ from a traditional LLM wrapper?";
      const msg: LiveMessage = {
        id: `ai-${Date.now()}`,
        sender: "interviewer",
        text: fallback,
        timestamp: new Date(),
        personality: this.config.personality,
      };
      this.messages.push(msg);
      this.onMessage(msg);
      await this.speakResponse(fallback);
    }
  }

  private async processUserSpeech(userSpeech: string) {
    this.setState("thinking");

    const persona = PERSONALITIES[this.config.personality];

    // Format persistent session memory
    const memoryContext = `
INTERVIEWER'S PERSISTENT SESSION MEMORY:
- Topics discussed so far: [${this.memory.topicsCovered.join(", ") || "Initial topic"}]
- Candidate's mentioned projects/tech: [${this.memory.candidateProjects.join("; ") || "None yet"}]
- Identified skills/tools: [${this.memory.skillsDemonstrated.join(", ") || "None yet"}]
- Candidate's past mistakes/misunderstandings in this session: [${
      this.memory.pastMistakes
        .map((m) => `${m.topic}: ${m.concept} (${m.resolved ? "Resolved" : "Needs review"})`)
        .join("; ") || "None yet"
    }]
`;

    const systemInstruction = `You are a real senior Indian technical interviewer having a spontaneous, real-time voice conversation with a candidate (similar to a natural ChatGPT Voice call).
Target Role: ${this.config.role} (${this.config.level} level), Focus: ${this.config.focus}.
Interviewer Personality: ${persona.name}.
${persona.promptInstruction}
${memoryContext}

CRITICAL CONVERSATIONAL & PEDAGOGICAL DIRECTIVES:
1. SPONTANEOUS, HUMAN CONVERSATION (NOT A SCRIPTED ROBOT):
   - Have a real, dynamic back-and-forth dialogue. Do NOT force every turn into a rigid question.
   - If the candidate asks a question or asks for clarification, ANSWER THEM directly, explain with an intuitive example, and then weave back to the topic.
   - Vary your reaction words naturally based on their answer: "Fair enough.", "Hmm, walk me through line 4.", "Right, exactly.", "Wait, let's look at the scaling aspect.", "Makes total sense.", "Let's push on that."
   - NEVER use identical praise patterns ("Great job!", "Awesome answer!", "Good attempt!"). Be authentic and technical.

2. COMPLETE ANSWER UNDERSTANDING & POLITE CORRECTION:
   - Carefully evaluate their actual technical depth, specific mechanisms, and trade-offs.
   - IF CORRECT: Acknowledge naturally in one phrase, then probe deeper into production trade-offs or architecture edge cases.
   - IF INCORRECT OR INCOMPLETE:
     * Never embarrass them or say "Wrong answer".
     * Politely challenge what was incorrect or missing in plain English.
     * Allow a retry ("Think about how lock contention behaves in Python... what happens if it's recursive?") OR immediately explain the correct concept clearly with a simple, concrete real-world example.
     * Then ask one brief follow-up question to verify their understanding.
   - IF THEY SAY "I don't know" OR SEEM STUCK:
     * Be supportive and helpful ("No problem at all! Let's think through it together.").
     * Give a simple hint or practical analogy and let them take another shot.

3. SESSION MEMORY & CONTEXT RETENTION:
   - Bring up things the candidate mentioned earlier in the conversation (e.g. "Earlier you mentioned working on that LangGraph pipeline with ChromaDB... how did you handle...").
   - If they stumbled on a concept earlier and it relates to the new topic, connect the dots to test if they learned from the earlier explanation.

4. VOICE OUTPUT CONSTRAINTS:
   - Keep responses concise and spoken (2 to 4 sentences).
   - NEVER use markdown, bullet points, asterisks, bolding, or emojis because this will be read aloud over audio.`;

    // Construct conversation history
    const conversationTurns = this.messages
      .filter((m) => !m.text.startsWith("["))
      .slice(-10)
      .map((m) => `${m.sender === "user" ? "Candidate" : "Interviewer"}: ${m.text}`)
      .join("\n");

    const fullPrompt = `${systemInstruction}\n\nCONVERSATION TRANSCRIPT SO FAR:\n${conversationTurns}\nCandidate: ${userSpeech}\nInterviewer:`;

    try {
      const rawResponse = await this.callGeminiWithCascade(fullPrompt);
      const cleanResponse = rawResponse.replace(/[*_#`[\]()]/g, " ").replace(/\s+/g, " ").trim();

      const aiMsg: LiveMessage = {
        id: `ai-${Date.now()}`,
        sender: "interviewer",
        text: cleanResponse,
        timestamp: new Date(),
        personality: this.config.personality,
      };
      this.messages.push(aiMsg);
      this.onMessage(aiMsg);

      await this.speakResponse(cleanResponse);
    } catch (err: any) {
      console.error("Gemini live conversation error:", err);
      const fallback =
        "Fair point. Let me share how we look at this in production: in an agent system, we decouple reasoning from tool execution. Does that make sense to you?";
      const aiMsg: LiveMessage = {
        id: `ai-${Date.now()}`,
        sender: "interviewer",
        text: fallback,
        timestamp: new Date(),
        personality: this.config.personality,
      };
      this.messages.push(aiMsg);
      this.onMessage(aiMsg);
      await this.speakResponse(fallback);
    }
  }

  private async speakResponse(text: string): Promise<void> {
    if (typeof window === "undefined" || !("speechSynthesis" in window) || this.isPaused) {
      this.setState("listening");
      return;
    }

    return new Promise((resolve) => {
      this.setState("speaking");
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      this.currentUtterance = utterance;

      // Select natural Indian English voice if present in user's browser
      const voices = window.speechSynthesis.getVoices();
      const indianVoice = voices.find(
        (v) => v.lang === "en-IN" || v.name.toLowerCase().includes("india")
      );
      if (indianVoice) {
        utterance.voice = indianVoice;
      }

      // Modulate voice pacing and pitch based on selected personality
      switch (this.config.personality) {
        case "chill":
          utterance.rate = 0.98;
          utterance.pitch = 0.95;
          break;
        case "funny":
          utterance.rate = 1.08;
          utterance.pitch = 1.05;
          break;
        case "strict":
          utterance.rate = 1.02;
          utterance.pitch = 0.92;
          break;
        case "tough":
          utterance.rate = 1.12;
          utterance.pitch = 0.96;
          break;
        case "mentor":
          utterance.rate = 0.96;
          utterance.pitch = 1.02;
          break;
        default:
          utterance.rate = 1.04;
          utterance.pitch = 1.0;
      }

      utterance.onend = () => {
        this.currentUtterance = null;
        if (this.state !== "idle" && !this.isPaused) {
          this.setState("listening");
        }
        resolve();
      };

      utterance.onerror = (e) => {
        console.warn("Speech synthesis notice:", e);
        this.currentUtterance = null;
        if (this.state !== "idle" && !this.isPaused) {
          this.setState("listening");
        }
        resolve();
      };

      window.speechSynthesis.speak(utterance);
    });
  }

  /**
   * Calls Gemini targeting gemini-3.8-live with resilient retry and fallback cascade
   */
  private async callGeminiWithCascade(promptText: string): Promise<string> {
    const apiKey = getGeminiApiKey();
    if (!apiKey) {
      throw new Error("No Gemini API key available.");
    }

    const modelsToTry = [PRIMARY_LIVE_MODEL, ...FALLBACK_LIVE_MODELS];

    const body = {
      contents: [{ parts: [{ text: promptText }] }],
      generationConfig: {
        temperature: 0.65,
        maxOutputTokens: 300, // Keeps voice answers concise and human-like
      },
    };

    for (const modelName of modelsToTry) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5500);

        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (res.ok) {
          const data = await res.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text && text.trim().length > 0) {
            return text.trim();
          }
        } else {
          // If 503 high demand or 404 model not found on this endpoint, cascade to next model
          console.warn(`Model ${modelName} returned HTTP ${res.status}, cascading to next model.`);
        }
      } catch (err) {
        console.warn(`Error attempting model ${modelName}:`, err);
      }
    }

    throw new Error("All Gemini Live model endpoints are temporarily unavailable. Falling back to local coach.");
  }
}
