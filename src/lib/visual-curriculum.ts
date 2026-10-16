import { DiagramExplanation } from "@/components/academy/learning/DiagramViewer";
import { ArchitectureVariant } from "@/components/academy/learning/ArchitectureViewer";
import { TimelineStep } from "@/components/academy/learning/ExecutionTimeline";
import { ComparisonRow } from "@/components/academy/learning/ComparisonTable";
import { CodeLineAnnotation } from "@/components/academy/learning/CodeWalkthrough";
import { AnalogyData, ProblemBeforeSolution } from "@/components/academy/learning/AnalogyCard";
import { CaseStudy } from "@/components/academy/learning/RealWorldExample";
import { MistakeItem } from "@/components/academy/learning/CommonMistakes";
import { InterviewQnA } from "@/components/academy/learning/InterviewSection";
import { QuizItem } from "@/components/academy/learning/InteractiveQuiz";
import { PracticalExercise, DebuggingChallenge } from "@/components/academy/learning/ExerciseChallenge";
import { LESSON_M11_L1 } from "./curriculum/m11-mcp";
import { LESSON_M12_L1 } from "./curriculum/m12-evals";
import { LESSON_M15_L1 } from "./curriculum/m15-safety";
import { LESSON_M3_L3 } from "./curriculum/m3-attention";
import { LESSON_M10_L1 } from "./curriculum/m10-multiagent";

export interface FullVisualLesson {
  moduleId: number;
  lessonId: string;
  title: string;
  estimatedMinutes: number;
  level: "Beginner" | "Intermediate" | "Advanced";
  learningObjectives: string[];
  
  // Section A: Simple Explanation & Analogy
  simpleExplanation: {
    definition: string;
    plainEnglish: string;
    whyItMatters: string;
    practicalExample: string;
  };
  analogy: AnalogyData;
  
  // Section B: The Problem Before The Solution
  problemBeforeSolution: ProblemBeforeSolution;
  
  // Section C: Visual Diagram (Mermaid)
  diagram: {
    title: string;
    diagramType: "flowchart" | "sequence" | "state" | "class" | "er" | "architecture";
    source: string;
    explanation: DiagramExplanation;
  };
  
  // Section D: Architecture View (Beginner vs Production)
  architecture: {
    title: string;
    subtitle: string;
    beginnerView: ArchitectureVariant;
    productionView: ArchitectureVariant;
  };
  
  // Section E: Step-by-Step Execution
  executionTimeline: TimelineStep[];
  
  // Section F: Python Code Example
  codeWalkthrough: {
    title: string;
    purpose: string;
    dependencies: string[];
    code: string;
    expectedOutput: string;
    annotations: CodeLineAnnotation[];
    commonErrors: { error: string; fix: string }[];
  };
  
  // Section G: Compare Similar Concepts
  comparison: {
    title: string;
    conceptAName: string;
    conceptBName: string;
    summaryA: string;
    summaryB: string;
    rows: ComparisonRow[];
    whenToChooseA: string;
    whenToChooseB: string;
  };
  
  // Section H: Real-World Use Cases
  useCases: CaseStudy[];
  
  // Section I: Common Mistakes & Best Practices
  mistakesAndBestPractices: {
    mistakes: MistakeItem[];
    productionChecklist: string[];
  };
  
  // Section J: Interview Preparation
  interviewQuestions: InterviewQnA[];
  
  // Section K: Interactive Practice
  interactiveQuiz: QuizItem[];
  exerciseChallenge: {
    exercise: PracticalExercise;
    debuggingChallenge: DebuggingChallenge;
    revisionSummary: string[];
    relatedTopics: { title: string; moduleId: number }[];
  };
}

export const VISUAL_LESSONS: Record<string, FullVisualLesson> = {
  // -------------------------------------------------------------
  // MODULE 5: AI AGENT FUNDAMENTALS
  // -------------------------------------------------------------
  "m5-l1": {
    moduleId: 5,
    lessonId: "m5-l1",
    title: "What Is an AI Agent? (Think-Act-Observe & Autonomy Ladder)",
    estimatedMinutes: 25,
    level: "Intermediate",
    learningObjectives: [
      "Define an AI agent and contrast it with traditional chatbots and static workflows",
      "Understand the ReAct (Reason + Act) loop: Think, Act, Observe",
      "Trace execution between LLM reasoning (probabilistic) and application execution (deterministic)",
      "Analyze compound failure rates across multi-step execution (0.95^10 ≈ 60%)",
      "Implement a bounded agent loop from scratch in Python with step and cost limits",
    ],
    simpleExplanation: {
      definition: "An AI agent is an autonomous software system where an LLM perceives its environment, reasons about goals, selects and executes tools in an iterative loop, and adapts its actions based on intermediate observations until reaching a stopping condition.",
      plainEnglish: "Unlike a chatbot that merely responds to text messages in a single turn, an agent has 'hands'. It can look up database records, query search engines, run code, check its progress, and retry if an error occurs.",
      whyItMatters: "Single LLM calls cannot interact with live databases, browse current APIs, or complete multi-step objectives. Agents enable computers to carry out end-to-end tasks with minimal human intervention.",
      practicalExample: "A customer support agent that receives a complaint, looks up the user's order in PostgreSQL, validates the shipping delay, checks refund eligibility, issues a refund through Stripe, and emails the user an apology with tracking info.",
    },
    analogy: {
      title: "The Diligent Research Assistant",
      story: "Imagine hiring a research assistant. You don't just want a quick opinion. You give them a goal: 'Find the best flights and hotels for our conference under $1,500.' The assistant looks up flights, notes the prices, searches hotels near the venue, finds that hotel rates exceed the budget, re-plans with a cheaper flight, verifies total costs with a calculator, and presents the final itinerary.",
      whereItWorks: "It accurately illustrates iterative planning, tool usage (search, calculator), intermediate observation, re-planning, and stopping upon reaching a goal.",
      whereItDiffers: "Human assistants have intuition and continuous common sense. An AI agent is completely stateless between turns—it must pass its entire history and tool observations back into the LLM context window on every iteration, and errors compound exponentially without explicit guardrails.",
    },
    problemBeforeSolution: {
      whatWasTried: "Developers initially attempted to solve complex tasks by writing enormous, monolithic prompt templates asking the LLM to 'do everything in one step'.",
      whySimplerFailed: "Single LLM prompts cannot access private real-time databases, cannot verify whether their proposed actions succeeded, and frequently hallucinate missing details.",
      difficultiesEncountered: [
        "Hallucinated information when answering questions requiring dynamic data",
        "Zero ability to take real-world actions (e.g. updating database records or sending webhooks)",
        "Hardcoded script workflows broke down whenever user requests deviated from predefined paths",
      ],
      howConceptSolvesIt: "The ReAct loop decouples reasoning from action execution. The model decides what tool to invoke; the application executes it with verified code and returns the ground-truth observation, enabling the model to adapt dynamically.",
      remainingLimitations: "Agents consume significantly more tokens (often 4x to 15x more than chat), take longer to respond, and can get stuck in infinite loops if stopping conditions are poorly defined.",
    },
    diagram: {
      title: "The ReAct (Reason + Act) Agent Execution Cycle",
      diagramType: "flowchart",
      source: `flowchart TD
    Start([User Goal]) --> Memory[Initialize Context & History]
    Memory --> Think[1. Think: LLM Reasons on Next Step]
    Think --> Decision{Is Goal Achieved?}
    Decision -- Yes --> Final[Final Response to User]
    Decision -- No --> Act[2. Act: Propose Tool Call & Args]
    Act --> AppExec[Application Validates & Executes Tool]
    AppExec --> Observe[3. Observe: Tool Result Captured]
    Observe --> CheckLimits{Step / Budget Limits Hit?}
    CheckLimits -- Yes --> Interrupt[Emergency Stop / Escalation]
    CheckLimits -- No --> AppendHistory[Append Observation to State]
    AppendHistory --> Think`,
      explanation: {
        whatComponentsRepresent: "Start is the user trigger. 'Think' represents the LLM analyzing context. 'Act' is the structured tool call request. 'AppExec' is the deterministic backend execution. 'Observe' is the returned ground truth.",
        arrowsAndDataFlow: "Data flows in a closed loop. Each tool output is appended to the message array so the next 'Think' step can reason over the latest observation.",
        stepSequence: "User Goal -> LLM Reasoning -> Tool Proposal -> Backend Validation & Execution -> Tool Result -> Boundary Check -> Repeat -> Final Output.",
        failurePoints: "If the tool returns an unhandled error, the model may hallucinate a fake result. If stopping criteria are missing, the loop cycles indefinitely until token exhaustion.",
      },
    },
    architecture: {
      title: "AI Agent System Architecture",
      subtitle: "From beginner mental model to enterprise production architecture",
      beginnerView: {
        name: "Beginner Conceptual Model",
        badge: "Beginner Conceptual",
        description: "A single model call augmented with a Python tool dispatcher and memory.",
        diagramSource: `graph LR
    User[User] --> Agent[Agent Orchestrator]
    Agent <--> LLM[LLM Brain]
    Agent <--> Tools[Local Tools]
    Agent <--> Memory[Conversation Memory]`,
        explanation: {
          whatComponentsRepresent: "User sends input; Orchestrator coordinates model prompts, invokes local tools, and stores conversation turns.",
          arrowsAndDataFlow: "Bidirectional messages between agent orchestrator, LLM API, and tools.",
          stepSequence: "User prompt -> Orchestrator sends to LLM -> LLM chooses tool -> Orchestrator runs tool -> LLM formats final answer.",
          failurePoints: "If the script crashes or tool throws an exception, all state is lost.",
        },
        components: [
          { name: "Orchestrator", type: "orchestrator", role: "Runs the Python while loop and manages turn history." },
          { name: "LLM Brain", type: "llm", role: "Understands intent and generates tool call JSON." },
          { name: "Local Tools", type: "tool", role: "Python functions executing calculations or API calls." },
          { name: "Memory", type: "storage", role: "In-memory list of message dictionaries." },
        ],
      },
      productionView: {
        name: "Enterprise Production Architecture",
        badge: "Production Scaled",
        description: "Stateless distributed agent service with model gateway, MCP tool servers, Redis state, guardrails, and OpenTelemetry tracing.",
        diagramSource: `flowchart TD
    User([Client App]) --> Gateway[API Gateway & Rate Limiting]
    Gateway --> GuardrailIn[Input Guardrails & Injection Defense]
    GuardrailIn --> AgentService[Stateless Agent Service]
    AgentService <--> Redis[(Redis Session & Task Store)]
    AgentService <--> ModelGateway[Model Gateway & Fallback Router]
    ModelGateway <--> LLMs[Hosted LLM Providers]
    AgentService <--> MCP[Remote MCP Tool Servers over HTTP]
    MCP <--> DB[(Enterprise Data & APIs)]
    AgentService --> PolicyGate{Policy & Human Approval Gate}
    PolicyGate -- Approved --> Actions[External Financial/Write Actions]
    AgentService --> OTel[OpenTelemetry GenAI Tracing & Evals]
    AgentService --> GuardrailOut[Output Guardrails & PII Scan]
    GuardrailOut --> User`,
        explanation: {
          whatComponentsRepresent: "API Gateway handles auth. Input/Output Guardrails protect against prompt injection and data leaks. Stateless Agent Service scales horizontally backed by Redis. Model Gateway routes across providers with semantic caching. MCP servers isolate tools behind OAuth 2.1.",
          arrowsAndDataFlow: "Requests flow through security layers, state is externalized, and every step emits OpenTelemetry spans for real-time monitoring.",
          stepSequence: "Auth -> Input Guardrail -> Load State -> Model Gateway -> MCP Tool Run -> Approval Gate -> State Save -> Output Guardrail -> Response.",
          failurePoints: "If an LLM provider experiences 500/429 errors, Model Gateway triggers circuit breakers and cascades to fallback models.",
        },
        components: [
          { name: "API Gateway", type: "gateway", role: "Enforces tenant authentication, request rate limits, and DDoS protection." },
          { name: "Input Guardrails", type: "security", role: "Scans for prompt injection, jailbreaks, and sensitive PII." },
          { name: "Stateless Agent", type: "orchestrator", role: "Horizontally scalable container executing graph workflows." },
          { name: "Redis State Store", type: "storage", role: "Persists session checkpoints, task tokens, and working memory." },
          { name: "Model Gateway", type: "gateway", role: "Provides unified API, prompt caching, fallback chains, and circuit breakers." },
          { name: "MCP Servers", type: "tool", role: "Isolated tool microservices communicating over Streamable HTTP with OAuth 2.1." },
          { name: "Human Approval Gate", type: "security", role: "Halts irreversible or financial operations for human sign-off." },
          { name: "OTel Tracing", type: "observability", role: "Emits gen_ai.* distributed traces and async evaluation metrics." },
        ],
      },
    },
    executionTimeline: [
      {
        number: 1,
        title: "User Dispatches Task",
        actor: "user",
        description: "The user sends a high-level goal: 'Check flight status for BA-142 and notify the passenger if delayed.'",
        input: "'Check flight status for BA-142 and notify the passenger if delayed.'",
        output: "HTTP POST /agent/tasks dispatched to backend API gateway.",
        failureMode: "Unauthenticated request or rate-limit quota exceeded.",
      },
      {
        number: 2,
        title: "Input Guardrail & State Hydration",
        actor: "app",
        description: "The application validates the payload, checks for prompt injection, and hydrates session memory from Redis.",
        input: "Raw user string and user JWT token.",
        output: "Sanitized prompt, initialized trace_id, loaded user profile.",
        failureMode: "Prompt injection detected or database connection timeout.",
      },
      {
        number: 3,
        title: "LLM Reasoning (Think)",
        actor: "llm",
        description: "The LLM inspects available tool definitions (e.g. check_flight, send_sms) and reasons about the next action.",
        input: "System prompt + Tool schemas + User goal.",
        output: "Structured tool call: {'name': 'check_flight', 'args': {'flight_number': 'BA-142'}}",
        failureMode: "Model hallucinates parameters or outputs malformed non-JSON text.",
        isModelReasoning: true,
      },
      {
        number: 4,
        title: "Tool Validation & Execution (Act)",
        actor: "app",
        description: "The application parses the tool call, validates arguments against Pydantic schema, and calls the external flight API.",
        input: "check_flight(flight_number='BA-142')",
        output: "{'status': 'Delayed', 'delay_minutes': 45, 'gate': 'B12'}",
        failureMode: "Upstream Flight API 503 error or schema validation failure.",
      },
      {
        number: 5,
        title: "Observation & Decision Loop",
        actor: "llm",
        description: "The application appends the observation to context. The LLM observes the 45-minute delay and decides to invoke the notification tool.",
        input: "Observation: Flight BA-142 is delayed 45 minutes.",
        output: "Structured tool call: {'name': 'send_sms', 'args': {'message': 'Your flight BA-142 is delayed by 45 mins.'}}",
        failureMode: "Model fails to register delay and prematurely terminates.",
        isModelReasoning: true,
      },
      {
        number: 6,
        title: "Policy Gate & Execution",
        actor: "app",
        description: "The application validates that SMS sending is permitted under the tenant policy and executes the notification.",
        input: "send_sms() payload.",
        output: "{'delivered': True, 'timestamp': '2026-10-15T12:00:00Z'}",
        failureMode: "SMS provider rejection or invalid phone number format.",
      },
      {
        number: 7,
        title: "Final Synthesis & Output Guardrail",
        actor: "llm",
        description: "The LLM confirms all sub-goals are met and emits a final response. Output guardrail scans for PII before replying.",
        input: "Complete observation transcript.",
        output: "'I confirmed flight BA-142 is delayed by 45 minutes and successfully sent an update SMS to the passenger.'",
        failureMode: "Output contains leaked internal API keys or excessive tokens.",
        isModelReasoning: true,
      },
    ],
    codeWalkthrough: {
      title: "Production-Grade ReAct Agent Loop in Pure Python",
      purpose: "Demonstrate a complete, runnable agent loop featuring step caps, tool registries, exception handling, and structured observation logging without third-party framework overhead.",
      dependencies: ["python >= 3.10", "pydantic >= 2.0"],
      code: `import json
from typing import Callable, Any

# 1. Define safe tools in a registry
def lookup_weather(city: str) -> str:
    """Mock weather API tool."""
    data = {"London": "Rainy, 14°C", "New York": "Sunny, 22°C", "Tokyo": "Cloudy, 18°C"}
    return data.get(city, f"Weather data for {city} unavailable.")

def calculate_budget(flight: int, hotel: int, nights: int) -> str:
    """Mock calculation tool."""
    total = flight + (hotel * nights)
    return f"Total estimated cost: \${total}"

TOOL_REGISTRY: dict[str, Callable[..., str]] = {
    "lookup_weather": lookup_weather,
    "calculate_budget": calculate_budget
}

# 2. Simulated LLM model function (in production, replaced by client.chat.completions)
def mock_llm_step(history: list[dict], tools: list[str]) -> dict:
    step_num = sum(1 for m in history if m["role"] == "tool")
    if step_num == 0:
        return {"action": "call_tool", "tool": "lookup_weather", "args": {"city": "London"}}
    elif step_num == 1:
        return {"action": "call_tool", "tool": "calculate_budget", "args": {"flight": 400, "hotel": 150, "nights": 3}}
    else:
        return {"action": "final_answer", "content": "The weather in London is Rainy (14°C) and your total 3-night trip cost is \$850."}

# 3. Robust Agent Runner with Step Limits
def execute_agent(goal: str, max_steps: int = 5) -> dict:
    history = [{"role": "user", "content": goal}]
    
    for step in range(1, max_steps + 1):
        # Model reasoning step
        decision = mock_llm_step(history, tools=list(TOOL_REGISTRY.keys()))
        
        if decision.get("action") == "final_answer":
            return {"status": "completed", "steps_used": step, "answer": decision["content"]}
        
        # Tool execution step
        tool_name = decision.get("tool")
        tool_args = decision.get("args", {})
        
        if tool_name not in TOOL_REGISTRY:
            obs = f"Error: Tool '{tool_name}' is not in the approved registry."
        else:
            try:
                obs = TOOL_REGISTRY[tool_name](**tool_args)
            except Exception as e:
                obs = f"Execution error in '{tool_name}': {str(e)}"
        
        # Append observation to history for next turn
        history.append({"role": "tool", "name": tool_name, "content": obs})
        
    return {"status": "failed", "error": "Step limit reached without resolution", "steps_used": max_steps}

# Test run
if __name__ == "__main__":
    result = execute_agent("Plan my 3-day trip to London with budget")
    print(json.dumps(result, indent=2))`,
      expectedOutput: `{
  "status": "completed",
  "steps_used": 3,
  "answer": "The weather in London is Rainy (14°C) and your total 3-night trip cost is $850."
}`,
      annotations: [
        { lines: "Lines 5-15", explanation: "Tools are explicitly mapped in a central registry. Notice they are plain Python functions with typed signatures." },
        { lines: "Lines 31-33", explanation: "The max_steps bound prevents runaway infinite loops that burn API tokens and cloud compute." },
        { lines: "Lines 41-47", explanation: "Critical security check: the model can only invoke functions registered in TOOL_REGISTRY. Arguments are caught in try/except so errors become observations rather than crashes." },
        { lines: "Lines 49-50", explanation: "The tool result is appended as a 'tool' role message, completing the ReAct cycle." },
      ],
      commonErrors: [
        {
          error: "KeyError: 'tool_name' when LLM invents a non-existent tool",
          fix: "Always check `if tool_name in TOOL_REGISTRY` before invoking and return an error message to the model.",
        },
        {
          error: "Unbounded recursion or infinite while loop",
          fix: "Never use `while True:`. Always use a bounded `for step in range(max_steps):` loop.",
        },
      ],
    },
    comparison: {
      title: "Chatbots vs Static Workflows vs Autonomous AI Agents",
      conceptAName: "Deterministic Workflow",
      conceptBName: "Autonomous AI Agent",
      summaryA: "A predefined code path (directed acyclic graph) where LLM calls are structured steps. The control flow is 100% deterministic.",
      summaryB: "A dynamic loop where the LLM inspects state and decides its next tool call, sequence, and termination autonomously.",
      rows: [
        { aspect: "Control Flow", conceptA: "Hardcoded in code (if/else, DAG)", conceptB: "Decided at runtime by LLM reasoning" },
        { aspect: "Predictability", conceptA: "Very high: passes same path every time", conceptB: "Medium-low: non-deterministic execution paths" },
        { aspect: "Cost & Latency", conceptA: "Low and bounded", conceptB: "Higher: 4x-15x more tokens and multiple turns" },
        { aspect: "Debugging & Testing", conceptA: "Standard unit tests and mock checks", conceptB: "Requires trajectory evaluations and pass^k tests" },
        { aspect: "Failure Recovery", conceptA: "Requires explicitly coded fallback branches", conceptB: "Can inspect tool error and attempt alternative tools" },
        { aspect: "Best Use Case", conceptA: "Customer onboarding, form extraction, standard triage", conceptB: "Deep research, open-ended coding, complex investigations" },
      ],
      whenToChooseA: "Use deterministic workflows when business logic has strict compliance, fixed steps, and low latency budgets.",
      whenToChooseB: "Use autonomous agents when the sequence of steps cannot be predicted in advance and intermediate results dictate future actions.",
    },
    useCases: [
      {
        title: "Autonomous E-Commerce Support & Refund Agent",
        industry: "Retail / E-Commerce",
        goal: "Resolve customer order inquiries, update addresses, and issue refunds up to approved policy limits.",
        userInput: "'My package #ORD-9821 was delivered broken. I want a refund of \$45.'",
        componentsInvolved: ["Order DB (PostgreSQL)", "Shipping API (FedEx)", "Stripe Payment Gateway", "Zendesk API", "Approval Gate"],
        workflowSteps: [
          "Extract order ID and query database for order status and delivery confirmation.",
          "Check order delivery timestamp to verify it falls within the 30-day return window.",
          "Inspect refund amount (\$45); since it is under the \$100 automated limit, approve without manager sign-off.",
          "Call Stripe refund tool with idempotency key to prevent double charging.",
          "Update Zendesk ticket status to 'Resolved' and send customer receipt email.",
        ],
        expectedOutput: "'I have processed a full refund of \$45.00 for order #ORD-9821 to your original payment method. You should see it in 3-5 business days.'",
        failureScenarios: [
          { failure: "Customer asks for \$500 refund exceeding policy limit.", guardrailFix: "Policy check in code interrupts automation and routes ticket to human supervisor queue." },
          { failure: "Customer repeats complaint in new message causing duplicate refund.", guardrailFix: "Enforce idempotency key (order_id + event_id) on all financial tool calls." },
        ],
      },
      {
        title: "Autonomous DevOps Incident Investigation Agent",
        industry: "Cloud Infrastructure",
        goal: "Diagnose production alert, query logs and metrics, isolate culprit container, and generate post-mortem summary.",
        userInput: "'PagerDuty Alert: p99 latency spike on checkout-service (> 2,500ms).'",
        componentsInvolved: ["Datadog Metrics API", "Elasticsearch Logs", "Kubernetes MCP Server", "Slack Bot"],
        workflowSteps: [
          "Query Datadog metrics to identify the exact service and time window of the spike.",
          "Query Kubernetes API for recent deployments or pod restarts in that cluster.",
          "Identify that pod `checkout-v2.4.1` is encountering OOMKilled restarts due to a memory leak.",
          "Query git commit log to locate author of `v2.4.1` release.",
          "Draft Slack alert to on-call channel with full trace logs, culprit diff, and proposed rollback command.",
        ],
        expectedOutput: "'Incident diagnosed: checkout-service memory exhaustion caused by commit 8f9b2 (unbounded cache). Rollback PR #412 created. On-call approval requested.'",
        failureScenarios: [
          { failure: "Agent attempts to automatically delete production database pods.", guardrailFix: "Restricted tool permissions (read-only for cluster inspection; write/delete actions require human confirmation)." },
        ],
      },
    ],
    mistakesAndBestPractices: {
      mistakes: [
        {
          mistake: "Unbounded while loops without iteration limits",
          whyItHappens: "Developers write while True: waiting for the model to say it is done. If the model encounters an unexpected tool error, it repeats the same call forever.",
          correctApproach: "Enforce hard step caps (e.g. max_steps = 8), token limits, and repeated-call detection in the agent runtime.",
          category: "beginner",
        },
        {
          mistake: "Ignoring the exponential math of compound errors (0.95^10)",
          whyItHappens: "Assuming that a 95% accurate tool means a 10-step agent will be 95% accurate.",
          correctApproach: "0.95^10 is only ~60% task success. Reduce steps using task-shaped tools, add verifiers, and test pass^k consistency.",
          category: "performance",
        },
        {
          mistake: "Trusting the model to enforce permissions in natural language",
          whyItHappens: "Writing prompt rules like 'Never refund more than \$100'. Prompt injection easily bypasses this.",
          correctApproach: "Enforce business limits in deterministic application code inside the tool handler, completely separate from the LLM.",
          category: "security",
        },
        {
          mistake: "Wrapping every raw REST endpoint as an individual tool",
          whyItHappens: "Exposing 50 granular API endpoints creates tool ambiguity. The model gets confused and picks the wrong endpoint.",
          correctApproach: "Create a small set of high-level, task-shaped tools (e.g. schedule_meeting instead of list_users, find_calendar, create_event).",
          category: "architecture",
        },
      ],
      productionChecklist: [
        "Enforce strict step limits (e.g. 5-10 max turns) on all agent loops",
        "Set per-task token and cost budgets with automated circuit breakers",
        "Implement repeated-tool-call detection to catch infinite loops in real time",
        "Sanitize and validate all tool arguments using Pydantic schemas",
        "Enforce idempotency keys on all write, update, and financial operations",
        "Gate destructive or irreversible actions behind human confirmation",
        "Emit distributed OpenTelemetry spans for every step, tool call, and observation",
      ],
    },
    interviewQuestions: [
      {
        id: "int-agent-1",
        level: "Beginner",
        question: "What is an AI agent, and how does it fundamentally differ from a standard chatbot?",
        strongAnswer: "An AI agent is a goal-driven system that uses an LLM to perceive its environment, formulate plans, execute tools in an iterative ReAct loop, observe results, and dynamically adjust actions until reaching a completion state. A chatbot merely generates single-turn text completions without environmental side-effects or multi-step tool execution.",
        whyItsStrong: "It clearly defines the closed-loop perception-action cycle, tool execution, and statefulness rather than relying on hand-wavy analogies.",
        weakAnswer: "An agent is an advanced chatbot that has a longer system prompt and can talk like an expert.",
        whyItsWeak: "Fails to mention tools, the iterative loop, state management, or environmental actions.",
        followUp: "When would you deliberately choose a deterministic workflow over an autonomous agent?",
        companyTag: "Google",
      },
      {
        id: "int-agent-2",
        level: "Intermediate",
        question: "Why do errors compound so aggressively in multi-step agents, and how do you architect systems to mitigate this?",
        strongAnswer: "If each step has a probability p of success, an n-step trajectory succeeds with probability p^n. At 95% step accuracy, 10 steps yield 0.95^10 ≈ 60% success. To mitigate: 1. Collapse multiple API calls into task-shaped tools, 2. Add verifiers/graders after critical steps, 3. Implement tool schema validation with helpful error feedback, and 4. Use human-in-the-loop checkpoints.",
        whyItsStrong: "Backs up the intuition with mathematical proof (p^n) and provides four concrete architectural mitigations.",
        weakAnswer: "Agents make mistakes because models hallucinate, so you just need a better system prompt.",
        whyItsWeak: "Ignores the mathematical nature of compounded probability and relies solely on prompt tweaks.",
        followUp: "How do you measure consistency using pass^k versus pass@k in agent evaluation?",
        companyTag: "Anthropic",
      },
      {
        id: "int-agent-3",
        level: "Advanced",
        question: "How do you prevent an agent from getting trapped in infinite loops when external tools fail or return unexpected results?",
        strongAnswer: "1. Enforce runtime hard caps on max steps and total latency. 2. Maintain a sliding window of recent tool calls and hash arguments to detect duplicate sequential executions (repeated spans). 3. Return structured error messages to the model explaining what went wrong so it can adapt. 4. Implement circuit breakers that escalate to human review after consecutive failures.",
        whyItsStrong: "Covers detection, mitigation, feedback loops, and human escalation.",
        weakAnswer: "You just set temperature to 0 so the model doesn't get confused.",
        whyItsWeak: "Temperature 0 does not prevent cyclic logic loops and can actually increase loop stickiness.",
        followUp: "What telemetry would you capture in OpenTelemetry to monitor loop frequency across production agents?",
        companyTag: "Databricks",
      },
      {
        id: "int-agent-4",
        level: "Scenario",
        question: "You deploy an autonomous customer refund agent. A prompt injection attack tricks the agent into refunding $5,000 to an attacker. How did this happen and how do you architect against it?",
        strongAnswer: "This is Simon Willison's Lethal Trifecta: the agent had private data access, read untrusted user text, and possessed an external financial execution tool. The attacker injected instructions overriding system rules. Fix: Enforce programmatic financial policy in application code (e.g. auto-refunds capped at $50; higher amounts require human sign-off). Isolate data context with XML delimiters, enforce idempotency, and audit every span.",
        whyItsStrong: "References the established security threat model (Lethal Trifecta) and places the fix in deterministic code rather than prompt wording.",
        weakAnswer: "Add 'Never listen to attackers' to the system prompt and block the attacker's IP.",
        whyItsWeak: "Prompt-based safety is easily bypassed by indirect injection, and IP bans are ineffective.",
        followUp: "How would you design approval by risk tiers (read-only, reversible, irreversible)?",
        companyTag: "Stripe",
      },
    ],
    interactiveQuiz: [
      {
        id: "q-ag-1",
        question: "What is the primary operational role of an agent orchestrator?",
        options: [
          "Training model weights using gradient descent",
          "Managing the loop, validating tool calls, executing tools, and maintaining history",
          "Generating token embeddings for vector databases",
          "Converting natural language into HTML webpages",
        ],
        correctIndex: 1,
        explanation: "The orchestrator is the host program that runs the loop, calls the model, executes tools in code, and preserves conversation state.",
      },
      {
        id: "q-ag-2",
        question: "Why should business rules (e.g. maximum refund amounts) be enforced in application code rather than in the LLM system prompt?",
        options: [
          "LLMs cannot understand numbers over 100",
          "Application code runs faster than prompt reading",
          "Prompts can be bypassed via prompt injection, while code enforcement is deterministic and inviolable",
          "Enforcing rules in code reduces model training time",
        ],
        correctIndex: 2,
        explanation: "Prompt injection can trick models into ignoring natural language instructions. Deterministic backend logic ensures rules cannot be violated regardless of model output.",
      },
      {
        id: "q-ag-3",
        question: "What is the mathematical task success probability of a 5-step agent where each step has a 90% success rate?",
        options: ["90%", "75%", "Approximately 59%", "45%"],
        correctIndex: 2,
        explanation: "0.90^5 = 0.59049 (approx 59%). Compound error highlights why short, task-shaped steps are critical.",
      },
    ],
    exerciseChallenge: {
      exercise: {
        title: "Build an Idempotent Tool Dispatcher with Pydantic Validation",
        instructions: "Implement a Python function `dispatch_tool_call(tool_name: str, raw_args: dict, registry: dict)` that validates arguments against schema, rejects unknown tools, and handles runtime errors gracefully.",
        starterCode: `from pydantic import BaseModel, ValidationError

class FlightSearchSchema(BaseModel):
    origin: str
    destination: str
    max_price: int

def search_flights(origin: str, destination: str, max_price: int):
    return f"Flight found from {origin} to {destination} under \${max_price}"

REGISTRY = {"search_flights": (search_flights, FlightSearchSchema)}

def dispatch_tool_call(tool_name: str, raw_args: dict, registry: dict) -> dict:
    # TODO: Validate tool exists, parse with Pydantic schema, execute and catch errors
    pass`,
        solutionHint: `def dispatch_tool_call(tool_name: str, raw_args: dict, registry: dict) -> dict:
    if tool_name not in registry:
        return {"success": False, "error": f"Unknown tool: {tool_name}"}
    fn, schema = registry[tool_name]
    try:
        validated = schema(**raw_args)
        result = fn(**validated.model_dump())
        return {"success": True, "result": result}
    except ValidationError as ve:
        return {"success": False, "error": f"Schema validation error: {ve.errors()}"}
    except Exception as e:
        return {"success": False, "error": f"Runtime execution error: {str(e)}"}`,
      },
      debuggingChallenge: {
        title: "The Runaway Cyclic Agent Loop",
        symptom: "An agent called with 'Find cheap flights to Paris' keeps executing the same flight search tool in an infinite loop until the developer's OpenAI credit quota is depleted.",
        buggyCode: `def agent_loop(goal, llm, tools):
    history = [goal]
    while True:
        action = llm(history)
        if action == "DONE":
            break
        # Tool execution without state update or limits
        result = tools[action.tool](action.args)
        # BUG: Result is never appended to history, so model repeats the same action!
    return "Finished"`,
        explanation: "The tool result was never appended to the conversation history, so the model saw the exact same state on every turn and repeated the same tool call. Additionally, there was no max_steps stopping condition.",
        correctedCode: `def agent_loop(goal, llm, tools, max_steps=8):
    history = [{"role": "user", "content": goal}]
    for step in range(max_steps):
        action = llm(history)
        if action.is_final:
            return action.content
        result = tools[action.tool](action.args)
        # Fix 1: Append observation so model sees progress
        history.append({"role": "tool", "content": result})
    return "Emergency termination: step limit reached"`,
      },
      revisionSummary: [
        "An AI agent couples an LLM (reasoning) with deterministic application execution (tools) in a ReAct loop.",
        "Workflows use hardcoded paths and are preferred for predictable tasks; agents use dynamic reasoning for open-ended tasks.",
        "Compounding error math (0.95^10 ≈ 60%) dictates that agents must use task-shaped tools and intermediate verifiers.",
        "Always enforce hard step limits, token budgets, and runtime loop detection.",
        "Enforce permissions, financial limits, and security boundaries in deterministic code, never in prompt text alone.",
      ],
      relatedTopics: [
        { title: "Building Agents from Scratch", moduleId: 6 },
        { title: "Production RAG Systems", moduleId: 7 },
        { title: "Model Context Protocol (MCP)", moduleId: 11 },
        { title: "AI Evals & Testing Harnesses", moduleId: 12 },
      ],
    },
  },

  // -------------------------------------------------------------
  // MODULE 7: PRODUCTION RAG SYSTEMS
  // -------------------------------------------------------------
  "m7-l1": {
    moduleId: 7,
    lessonId: "m7-l1",
    title: "Production RAG: Hybrid Search, Chunking & Access Control",
    estimatedMinutes: 30,
    level: "Intermediate",
    learningObjectives: [
      "Understand the two distinct phases of RAG: Offline Ingestion vs Online Retrieval & Generation",
      "Implement hybrid search combining dense semantic embeddings with sparse BM25 keyword search",
      "Merge multi-source search rankings using Reciprocal Rank Fusion (RRF)",
      "Enforce pre-filtering access control lists (ACLs) to prevent sensitive document leaks",
      "Diagnose RAG failures: separating retrieval recall failures from generation hallucination",
    ],
    simpleExplanation: {
      definition: "Retrieval-Augmented Generation (RAG) is an architecture that searches external documents for relevant knowledge and injects those excerpts into the LLM prompt so the model generates factually grounded answers with source citations.",
      plainEnglish: "Think of an LLM like a brilliant student taking an exam. Without RAG, it's a closed-book exam relying purely on memory (which can be outdated or inaccurate). With RAG, it's an open-book exam: the system looks up the exact textbook pages first, places them on the student's desk, and asks them to answer using only those pages.",
      whyItMatters: "LLMs do not know your internal company documents, recent policies, or private database records. Fine-tuning models to memorize facts is slow, expensive, un-citable, and causes catastrophic forgetting. RAG updates instantly whenever documents are added or edited.",
      practicalExample: "An internal HR assistant that answers: 'How many days of unused sick leave can I carry over into 2027?' by retrieving the company's 2026 handbook, quoting paragraph 4.2, and providing an exact clickable source link.",
    },
    analogy: {
      title: "The Research Librarian & The Writer",
      story: "You want a report on obscure tax laws. The librarian (the Retriever) searches index cards and stacks to pull the 5 most relevant pages. The writer (the LLM) reads those 5 pages and synthesizes a clear, well-structured explanation citing the exact page numbers.",
      whereItWorks: "Clearly separates the two independent responsibilities: finding the right text vs writing a fluent answer.",
      whereItDiffers: "If the librarian brings the wrong books, even a Pulitzer-prize winning writer will produce the wrong answer. In RAG, 80% of failures are retrieval errors, not model errors.",
    },
    problemBeforeSolution: {
      whatWasTried: "Pasting whole 200-page PDF manuals into huge context windows, or fine-tuning models on company FAQs.",
      whySimplerFailed: "Huge context windows suffer from 'lost in the middle' degradation, cost thousands of dollars per day in prompt tokens, and fine-tuning cannot provide real-time citations or per-user permission filtering.",
      difficultiesEncountered: [
        "Severe hallucination when asked about company-specific or recent information",
        "No way to cite verified page numbers or verify claims against corporate ground truth",
        "High API bills from re-sending hundreds of thousands of unchanged document tokens",
      ],
      howConceptSolvesIt: "RAG chunks documents into small semantic passages (300-800 tokens), pre-indexes them in vector and keyword databases, and retrieves only the top 3-5 most relevant chunks at query time.",
      remainingLimitations: "RAG is bounded by retrieval quality: if the search algorithm misses the key chunk, the model cannot answer correctly.",
    },
    diagram: {
      title: "Enterprise Hybrid RAG Architecture with Reciprocal Rank Fusion",
      diagramType: "flowchart",
      source: `flowchart TD
    UserQ([User Query]) --> Rewriter[Query Rewriter & Expander]
    Rewriter --> DenseSearch[Dense Vector Search: Cosine Similarity]
    Rewriter --> SparseSearch[Sparse Keyword Search: BM25]
    ACL[(User ACL Metadata Filter)] -.-> DenseSearch
    ACL -.-> SparseSearch
    DenseSearch --> DenseRanks[Dense Top 50 Candidates]
    SparseSearch --> SparseRanks[BM25 Top 50 Candidates]
    DenseRanks --> RRF[Reciprocal Rank Fusion: RRF Merge]
    SparseRanks --> RRF
    RRF --> Top50[Merged Top 50 Candidates]
    Top50 --> CrossEncoder[Cross-Encoder Reranker]
    CrossEncoder --> Top5[Top 5 Precision Chunks]
    Top5 --> PromptBuilder[Prompt Augmented with Sources & Citations]
    PromptBuilder --> LLM[LLM Generation Engine]
    LLM --> CitationGuard[Citation Verifier Guardrail]
    CitationGuard --> Answer([Grounded Answer + Citations])`,
      explanation: {
        whatComponentsRepresent: "Query Rewriter expands abbreviations. Dense and Sparse search run in parallel. ACL ensures user only searches files they are authorized to view. Cross-encoder reranks the fused list.",
        arrowsAndDataFlow: "Query is split across dense and keyword search, merged mathematically by rank, filtered to the top 5 chunks, and passed with prompt to the LLM.",
        stepSequence: "User Query -> Rewrite -> Parallel Hybrid Search -> RRF Merge -> Cross-Encoder Rerank -> Augmented Prompt -> LLM Generation -> Citation Verification.",
        failurePoints: "If document parser scrambles tables in PDFs, embeddings become gibberish and retrieval misses the correct context.",
      },
    },
    architecture: {
      title: "RAG Architecture Comparison",
      subtitle: "Naive Prototype vs Production Enterprise Pipeline",
      beginnerView: {
        name: "Naive RAG Prototype",
        badge: "Beginner Conceptual",
        description: "Simple vector similarity search passing top chunks directly to an LLM.",
        diagramSource: `flowchart LR
    Doc[PDFs] --> Chunk[Split Chunks] --> Embed[OpenAI Embeddings] --> VDB[(Chroma DB)]
    Query[User Query] --> VDB --> Context[Top 3 Chunks] --> LLM[OpenAI GPT-4] --> Answer[Answer]`,
        explanation: {
          whatComponentsRepresent: "Raw text split into uniform chunks, embedded into a single local vector store.",
          arrowsAndDataFlow: "Linear pipeline from query to cosine similarity to prompt.",
          stepSequence: "Query -> Embed -> Vector DB Top 3 -> Prompt -> Answer.",
          failurePoints: "Misses exact acronyms and product codes; no permissions check; susceptible to hallucination.",
        },
        components: [
          { name: "Chunker", type: "orchestrator", role: "Splits text every 500 characters." },
          { name: "Chroma DB", type: "storage", role: "Stores embeddings and computes cosine distances." },
          { name: "OpenAI LLM", type: "llm", role: "Synthesizes answer from retrieved text." },
        ],
      },
      productionView: {
        name: "Production Enterprise RAG",
        badge: "Production Scaled",
        description: "Event-driven incremental indexing, hybrid retrieval with BM25, pre-filtering ACLs, cross-encoder reranking, and citation checks.",
        diagramSource: `flowchart TD
    Sources[(Drive, Jira, Confluence)] --> IngestQueue[Kafka Ingestion Queue]
    IngestQueue --> Parser[Layout-Aware Document Parser & OCR]
    Parser --> Chunker[Semantic Chunking + ACL Metadata]
    Chunker --> Embedder[Batch Vector Embeddings]
    Embedder --> HybridIndex[(Sharded Vector DB + Elasticsearch BM25)]
    User[User with SSO Auth] --> API[FastAPI Gateway]
    API --> PermCheck[Inject User Permission Tokens]
    PermCheck --> HybridSearch[Parallel Hybrid Search]
    HybridIndex <--> HybridSearch
    HybridSearch --> RRF[Reciprocal Rank Fusion]
    RRF --> Reranker[Cross-Encoder Reranker]
    Reranker --> GroundedPrompt[Citation-Enforced Prompt]
    GroundedPrompt --> Serving[vLLM Inference Engine]
    Serving --> CitationVerifier[Citation & Groundedness Evaluator]
    CitationVerifier --> User`,
        explanation: {
          whatComponentsRepresent: "Kafka handles asynchronous document updates. Sharded index supports both vector and BM25 search. User SSO injects permission filters. Citation verifier validates every claim.",
          arrowsAndDataFlow: "Documents are processed asynchronously; queries are filtered by user permissions before vector calculation.",
          stepSequence: "Ingest -> Parse -> Chunk & Tag ACL -> Index -> Query -> Hybrid Search -> RRF -> Rerank -> Generate -> Verify.",
          failurePoints: "Stale index synchronization lag; cross-encoder latency spikes during peak query volume.",
        },
        components: [
          { name: "Kafka Ingestion", type: "gateway", role: "Buffers document edit events for incremental re-indexing." },
          { name: "Layout Parser", type: "orchestrator", role: "Extracts tables, headers, and images without losing formatting." },
          { name: "Hybrid Index", type: "storage", role: "Stores dense vectors (HNSW) and inverted BM25 keyword index." },
          { name: "SSO PermCheck", type: "security", role: "Restricts vector retrieval strictly to files the user is permitted to see." },
          { name: "Cross-Encoder", type: "llm", role: "Jointly scores query-chunk pairs for maximum precision." },
          { name: "Citation Verifier", type: "observability", role: "Verifies that every bracketed source [doc1] exists and supports the statement." },
        ],
      },
    },
    executionTimeline: [
      {
        number: 1,
        title: "User Query & Semantic Pre-processing",
        actor: "app",
        description: "User submits: 'What is the expense limit for domestic travel?' Query rewriter expands acronyms and pulls user department permissions.",
        input: "'What is the expense limit for domestic travel?'",
        output: "Expanded query: 'domestic travel flight hotel meal expense policy limit', User ACLs: ['dept:engineering', 'level:L4']",
        failureMode: "Query rewriter corrupts technical jargon.",
      },
      {
        number: 2,
        title: "Parallel Hybrid Retrieval",
        actor: "app",
        description: "Dense vector search computes cosine distance over embeddings, while BM25 keyword index searches exact token frequencies.",
        input: "Expanded query string and user ACL filter.",
        output: "Dense Top 50 candidates + Sparse BM25 Top 50 candidates.",
        failureMode: "Vector index connection timeout or stale index data.",
      },
      {
        number: 3,
        title: "Reciprocal Rank Fusion (RRF)",
        actor: "app",
        description: "RRF combines the two candidate lists mathematically: score = sum(1 / (60 + rank)), creating a unified candidate list.",
        input: "Two ranked lists of document chunk IDs.",
        output: "Merged top 50 unique candidate chunks.",
        failureMode: "Score disparity if raw scores were summed directly instead of ranks.",
      },
      {
        number: 4,
        title: "Cross-Encoder Precision Reranking",
        actor: "llm",
        description: "A cross-encoder transformer reads the query and each chunk together, scoring true semantic relevance.",
        input: "Query paired with 50 candidate chunks.",
        output: "Top 5 highest-relevance chunks with relevance scores > 0.82.",
        failureMode: "Reranker latency exceeds 300ms budget under peak concurrency.",
        isModelReasoning: true,
      },
      {
        number: 5,
        title: "Prompt Augmentation & Grounded Generation",
        actor: "llm",
        description: "The top 5 chunks are wrapped in XML delimiters and passed to the model with strict citation instructions.",
        input: "<context><doc id='1'>Flights above \$500 require VP approval...</doc></context>",
        output: "Draft answer: 'Domestic flight bookings above \$500 require VP approval [doc1]. Meals are capped at \$75/day [doc2].'",
        failureMode: "Model ignores context and answers from pretraining memory.",
        isModelReasoning: true,
      },
      {
        number: 6,
        title: "Citation Verification & Delivery",
        actor: "app",
        description: "Deterministic validator ensures citations exist in retrieved context before returning text to user.",
        input: "Draft answer with bracketed citations.",
        output: "Verified answer with clickable source document links.",
        failureMode: "Model hallucinates fake citations (e.g. [doc99]); validator catches and removes claim.",
      },
    ],
    codeWalkthrough: {
      title: "Complete In-Memory Hybrid Search with BM25 & Cosine Similarity",
      purpose: "Demonstrate hybrid retrieval combining TF-IDF/BM25 sparse ranking with normalized vector dot products and RRF fusion in pure Python.",
      dependencies: ["python >= 3.10", "numpy >= 1.24", "scikit-learn >= 1.3"],
      code: `import math
from collections import Counter
import numpy as np

# Sample Document Store
DOCUMENTS = {
    "doc1": "Employees get 24 days of paid leave per year. Unused leave carries over up to 10 days.",
    "doc2": "Travel expenses must be submitted within 30 days with receipts. Flights above \$500 require director approval.",
    "doc3": "Remote work is permitted two days per week with team lead agreement.",
}

# 1. Sparse BM25 Search Implementation
class SimpleBM25:
    def __init__(self, corpus: dict[str, str], k1=1.5, b=0.75):
        self.doc_ids = list(corpus.keys())
        self.tokens = [text.lower().split() for text in corpus.values()]
        self.k1 = k1
        self.b = b
        self.N = len(self.tokens)
        self.avgdl = sum(len(t) for t in self.tokens) / self.N
        self.df = Counter(w for t in self.tokens for w in set(t))

    def search(self, query: str) -> list[str]:
        q_tokens = query.lower().split()
        scores = []
        for t in self.tokens:
            tf = Counter(t)
            score = 0.0
            doc_len = len(t)
            for w in q_tokens:
                if w in tf:
                    idf = math.log((self.N - self.df[w] + 0.5) / (self.df[w] + 0.5) + 1.0)
                    numerator = tf[w] * (self.k1 + 1)
                    denominator = tf[w] + self.k1 * (1 - self.b + self.b * (doc_len / self.avgdl))
                    score += idf * (numerator / denominator)
            scores.append(score)
        # Return doc IDs sorted by BM25 score descending
        sorted_indices = np.argsort(-np.array(scores))
        return [self.doc_ids[i] for i in sorted_indices]

# 2. Reciprocal Rank Fusion
def rrf(dense_ranks: list[str], sparse_ranks: list[str], k: int = 60) -> list[tuple[str, float]]:
    fused = Counter()
    for rank, doc_id in enumerate(dense_ranks, start=1):
        fused[doc_id] += 1.0 / (k + rank)
    for rank, doc_id in enumerate(sparse_ranks, start=1):
        fused[doc_id] += 1.0 / (k + rank)
    return fused.most_common()

# Test Hybrid Search
if __name__ == "__main__":
    bm25 = SimpleBM25(DOCUMENTS)
    sparse_results = bm25.search("leave carry over")
    # Simulated dense retriever output
    dense_results = ["doc1", "doc3", "doc2"]
    
    fused = rrf(dense_results, sparse_results)
    print("Fused Results (Doc, Score):")
    for doc_id, score in fused:
        print(f"  {doc_id}: {score:.4f} -> '{DOCUMENTS[doc_id][:40]}...'")`,
      expectedOutput: `Fused Results (Doc, Score):
  doc1: 0.0328 -> 'Employees get 24 days of paid leave per ...'
  doc2: 0.0320 -> 'Travel expenses must be submitted within ...'
  doc3: 0.0320 -> 'Remote work is permitted two days per we...'`,
      annotations: [
        { lines: "Lines 12-38", explanation: "Calculates BM25 term frequency, inverse document frequency (IDF), and document length normalization." },
        { lines: "Lines 41-47", explanation: "RRF calculates 1 / (60 + rank) across each list. This prevents score scaling incompatibilities between cosine distances and BM25." },
        { lines: "Lines 54-57", explanation: "Top ranked document doc1 successfully identifies the paid leave carryover policy." },
      ],
      commonErrors: [
        {
          error: "Adding raw cosine scores (0 to 1) to raw BM25 scores (0 to 25+)",
          fix: "Raw scores are on completely different scales. Use Reciprocal Rank Fusion (RRF) or percentile normalization before merging.",
        },
      ],
    },
    comparison: {
      title: "RAG vs Fine-Tuning vs Long Context Windows",
      conceptAName: "Retrieval-Augmented Generation (RAG)",
      conceptBName: "Supervised Fine-Tuning (SFT)",
      summaryA: "Dynamically retrieves documents and injects them into the prompt. Best for knowledge freshness, source citations, and private data.",
      summaryB: "Modifies model weights using labeled input-output pairs. Best for teaching format, style, persona, and specialized syntax.",
      rows: [
        { aspect: "Primary Purpose", conceptA: "Gives the model what to know (knowledge)", conceptB: "Teaches the model how to behave (style/format)" },
        { aspect: "Knowledge Freshness", conceptA: "Instant: update documents in vector DB", conceptB: "Slow: requires retraining and redeploying weights" },
        { aspect: "Hallucination Risk", conceptA: "Low: grounded with direct verifiable citations", conceptB: "Higher: model can still invent facts confidently" },
        { aspect: "Access Control / ACLs", conceptA: "Easy: filter vector retrieval per user permissions", conceptB: "Impossible: weights memorize data for all users" },
        { aspect: "Cost & Maintenance", conceptA: "Lower upfront, pay per retrieval query", conceptB: "High training and GPU hosting costs" },
      ],
      whenToChooseA: "Choose RAG when documents change frequently, source citations are mandatory, or users have strict access permissions.",
      whenToChooseB: "Choose Fine-Tuning when you need a consistent output style, want to distill a large model into a small 7B model, or are teaching a custom DSL.",
    },
    useCases: [
      {
        title: "Enterprise Confluence & Jira Knowledge Assistant",
        industry: "Enterprise Software / SaaS",
        goal: "Allow 10,000 employees to search internal wikis with strict role-based access control.",
        userInput: "'What are the deployment approval steps for production payment services?'",
        componentsInvolved: ["Confluence API", "Jira API", "AWS OpenSearch (Hybrid)", "Cohere Rerank", "Claude 3.5 Sonnet"],
        workflowSteps: [
          "User authenticates with Okta SSO; system receives user groups: ['eng', 'payments'].",
          "Hybrid search queries OpenSearch with ACL filter `allowed_groups IN ['eng', 'payments']`.",
          "Retrieve top 40 candidate chunks; Cohere Rerank narrows to top 5 chunks.",
          "Model formats answer citing exact Confluence document title and last updated timestamp.",
        ],
        expectedOutput: "'Production payment deployments require 2 approvals from the Payments Lead and SecOps [Confluence: Payments Playbook v4].'",
        failureScenarios: [
          { failure: "Intern queries executive compensation document.", guardrailFix: "ACL pre-filtering rejects the document before vector distance calculation occurs." },
        ],
      },
      {
        title: "Healthcare Clinical Guideline Reference Assistant",
        industry: "Healthcare / Medical",
        goal: "Provide clinicians with evidence-based treatment guidelines citing verified clinical trials.",
        userInput: "'What is the first-line medication for pediatric type 2 diabetes?'",
        componentsInvolved: ["PubMed Database", "Milvus Vector DB", "MedCPT Embeddings", "Faithfulness Judge"],
        workflowSteps: [
          "Convert query to dense embedding with clinical MedCPT model.",
          "Retrieve medical guidance chunks from peer-reviewed journals.",
          "Enforce mandatory citation output check: every dosage claim must map to an exact sentence in retrieved papers.",
          "Faithfulness evaluator runs before displaying answer to physician.",
        ],
        expectedOutput: "'First-line therapy is Metformin alongside lifestyle intervention [AAP Guidelines 2024, Page 12].'",
        failureScenarios: [
          { failure: "Model hallucinates drug dosage.", guardrailFix: "Output citation validator detects ungrounded number and refuses to display answer, alerting physician." },
        ],
      },
    ],
    mistakesAndBestPractices: {
      mistakes: [
        {
          mistake: "Checking access permissions AFTER generation",
          whyItHappens: "Developers retrieve documents, generate the answer, and then wonder if the user was allowed to read it.",
          correctApproach: "Always pre-filter at retrieval time: `filter={'user_id': user_id, 'dept': dept}` in the vector DB.",
          category: "security",
        },
        {
          mistake: "Using fixed arbitrary character chunking",
          whyItHappens: "Splitting text strictly every 500 characters cuts tables, code blocks, and sentences in half.",
          correctApproach: "Use recursive structure-aware chunking splitting on headers (##), paragraphs (\\n\\n), and sentences.",
          category: "architecture",
        },
        {
          mistake: "Ignoring stale index synchronization",
          whyItHappens: "Source files are edited, but the vector DB keeps old embeddings, causing contradictory answers.",
          correctApproach: "Implement event-driven webhooks with document version hashing and deletion tombstones.",
          category: "performance",
        },
      ],
      productionChecklist: [
        "Store document access control lists (ACLs) as vector metadata and pre-filter every query",
        "Implement hybrid search combining dense semantic vectors with BM25 keyword matching",
        "Rerank candidate chunks with a cross-encoder before prompt assembly",
        "Enforce citation format in prompts and verify citations in output guardrails",
        "Track RAGAS metrics (Faithfulness, Answer Relevancy, Context Precision, Context Recall)",
        "Implement document versioning and tombstone deletion for outdated chunks",
      ],
    },
    interviewQuestions: [
      {
        id: "int-rag-1",
        level: "Beginner",
        question: "Explain how RAG works end-to-end, and what problem it solves.",
        strongAnswer: "RAG separates into offline indexing and online serving. Offline: documents are parsed, split into coherent chunks, embedded into vector representations, and stored with metadata. Online: the user query is embedded, relevant chunks are retrieved via hybrid search (dense + BM25) and reranked, and the top chunks are injected into a prompt instructing the LLM to generate an answer with citations. It solves hallucination, knowledge freshness, and private data access.",
        whyItsStrong: "Clearly distinguishes the offline indexing phase from online serving and articulates business benefits.",
        weakAnswer: "RAG is putting your documents into a vector database so the AI knows everything.",
        whyItsWeak: "Misses chunking, embeddings, hybrid search, prompt assembly, and citation verification.",
        followUp: "How do you evaluate retrieval quality separately from generation quality?",
        companyTag: "Google",
      },
      {
        id: "int-rag-2",
        level: "Intermediate",
        question: "Your RAG system returns noisy, irrelevant chunks that confuse the model. How do you diagnose and fix it?",
        strongAnswer: "1. Inspect traces to measure Context Precision. 2. Implement recursive structure-aware chunking so chunks are focused on single topics. 3. Add a cross-encoder reranker (e.g. Cohere or BGE-Reranker) to evaluate query-document relevance jointly and discard low-scoring candidates. 4. Prepend document titles and hierarchical section headers to each chunk before embedding.",
        whyItsStrong: "Addresses root causes across chunking, reranking, and contextual headers.",
        weakAnswer: "Increase the chunk size so the model gets more text.",
        whyItsWeak: "Increasing chunk size actually dilutes embedding sharpness and introduces more irrelevant noise.",
        followUp: "Explain the four core metrics in the RAGAS evaluation framework.",
        companyTag: "Datadog",
      },
      {
        id: "int-rag-3",
        level: "Advanced",
        question: "How do you architect an enterprise RAG system serving 10 million documents at thousands of queries per second?",
        strongAnswer: "1. Ingestion: Kafka-driven async pipeline with layout-aware parsers, batch embedding, and sharded vector DB (pgvector/Qdrant) with metadata pre-filtering for ACLs. 2. Retrieval: Hybrid dense + BM25 with Reciprocal Rank Fusion, parallel search, and cross-encoder reranking on top 50. 3. Serving: Model gateway with semantic caching, vLLM continuous batching and PagedAttention. 4. Observability: OTel tracing, online groundedness checks, and automated eval gates.",
        whyItsStrong: "Comprehensive systems design covering ingestion, sharding, ACL security, latency optimization, and observability.",
        weakAnswer: "Use LangChain and Pinecone with an auto-scaling group.",
        whyItsWeak: "Lacks architectural depth, ACL security handling, sharding details, and caching strategies.",
        followUp: "How do you keep latency under 200ms when cross-encoders are computationally expensive?",
        companyTag: "Meta",
      },
    ],
    interactiveQuiz: [
      {
        id: "q-rag-1",
        question: "Why does hybrid search combine BM25 keyword matching with dense vector search?",
        options: [
          "BM25 uses less RAM than vector search",
          "Vector search understands semantic synonyms, while BM25 catches exact identifiers, error codes, and product names",
          "BM25 replaces the need for an LLM generator",
          "Dense vectors only work in English",
        ],
        correctIndex: 1,
        explanation: "Dense vectors capture paraphrases ('vacation' -> 'time off') but struggle with exact numbers and IDs. BM25 excels at exact keyword matching.",
      },
      {
        id: "q-rag-2",
        question: "In the RAGAS framework, what does 'Faithfulness' measure?",
        options: [
          "Whether the model answers politely",
          "Whether every claim in the generated answer is directly supported by the retrieved context",
          "How fast the vector database returns results",
          "The percentage of users who clicked thumbs-up",
        ],
        correctIndex: 1,
        explanation: "Faithfulness measures factual grounding against the provided context, isolating generation hallucination.",
      },
    ],
    exerciseChallenge: {
      exercise: {
        title: "Implement Reciprocal Rank Fusion (RRF)",
        instructions: "Write a Python function `rrf_merge(list_a: list[str], list_b: list[str], k=60)` that takes two ranked lists of document IDs and returns the fused ranking sorted by score.",
        starterCode: `def rrf_merge(list_a: list[str], list_b: list[str], k: int = 60) -> list[str]:
    # TODO: Implement RRF scoring formula
    pass`,
        solutionHint: `from collections import Counter

def rrf_merge(list_a: list[str], list_b: list[str], k: int = 60) -> list[str]:
    scores = Counter()
    for rank, doc_id in enumerate(list_a, start=1):
        scores[doc_id] += 1.0 / (k + rank)
    for rank, doc_id in enumerate(list_b, start=1):
        scores[doc_id] += 1.0 / (k + rank)
    return [doc_id for doc_id, _ in scores.most_common()]`,
      },
      debuggingChallenge: {
        title: "The Permission-Leaking RAG Assistant",
        symptom: "A junior software developer asks the RAG assistant about executive compensation, and the assistant quotes the confidential executive payroll spreadsheet.",
        buggyCode: `def query_rag(user_query, user_id):
    # Retrieve top 5 most similar chunks across whole database
    chunks = vector_db.similarity_search(user_query, k=5)
    # Check permissions only AFTER retrieving
    allowed_chunks = []
    for c in chunks:
        if user_has_permission(user_id, c.doc_id):
            allowed_chunks.append(c)
    # BUG: If the 5 chunks were all confidential, allowed_chunks is empty or leaks data!
    return generate_answer(user_query, allowed_chunks)`,
        explanation: "Permissions must be filtered BEFORE or DURING nearest-neighbor retrieval. Post-filtering means non-authorized chunks crowd out valid chunks the user was allowed to see, and can cause leaks.",
        correctedCode: `def query_rag(user_query, user_id):
    user_roles = get_user_roles(user_id)
    # Pre-filter during vector search:
    chunks = vector_db.similarity_search(
        user_query,
        k=5,
        filter={"access_role": {"$in": user_roles}}
    )
    return generate_answer(user_query, chunks)`,
      },
      revisionSummary: [
        "RAG solves hallucination, knowledge freshness, and corporate data isolation without expensive model fine-tuning.",
        "Hybrid search (BM25 + Dense + RRF) provides the most robust retrieval baseline in production.",
        "Cross-encoders rerank top candidate chunks, dramatically improving Context Precision.",
        "Always enforce pre-filtering access control lists (ACLs) at retrieval time.",
        "Evaluate retrieval (Recall@k, MRR) independently from generation (Faithfulness, Relevancy).",
      ],
      relatedTopics: [
        { title: "AI Agent Fundamentals", moduleId: 5 },
        { title: "Building Agents from Scratch", moduleId: 6 },
        { title: "AI Evals & Testing Harnesses", moduleId: 12 },
        { title: "Agent Safety & Guardrails", moduleId: 15 },
      ],
    },
  },

  // Module 11: Model Context Protocol (MCP)
  "m11-l1": LESSON_M11_L1,

  // Module 12: AI Evals & Testing Harnesses
  "m12-l1": LESSON_M12_L1,

  // Module 15: Agent Safety & Guardrails
  "m15-l1": LESSON_M15_L1,

  // Module 3: Scaled Dot-Product Attention & KV Cache
  "m3-l3": LESSON_M3_L3,

  // Module 10: Multi-Agent Systems
  "m10-l1": LESSON_M10_L1,
};

export function getVisualLesson(modId: number, lessonId: string, lessonTitle: string): FullVisualLesson {
  if (VISUAL_LESSONS[lessonId]) {
    return VISUAL_LESSONS[lessonId];
  }

  // Generate dynamic, technically precise FullVisualLesson tailored to the module theme
  const isAgent = modId === 5 || modId === 6 || modId === 10;
  const isRAG = modId === 7;
  const isMCP = modId === 11;
  const isEval = modId === 12;
  const isObs = modId === 13 || modId === 14;
  const isSec = modId === 15;
  const isML = modId === 3 || modId === 4;

  const topicName = lessonTitle;
  const safeTopic = topicName.replace(/"/g, "'");

  return {
    moduleId: modId,
    lessonId,
    title: topicName,
    estimatedMinutes: 20,
    level: modId <= 4 ? "Beginner" : modId <= 9 ? "Intermediate" : "Advanced",
    learningObjectives: [
      `Understand the core architectural concept of ${topicName}`,
      `Identify the engineering problems that motivated ${topicName}`,
      `Trace the end-to-end data flow and component interactions`,
      `Implement a verified, runnable Python pattern for ${topicName}`,
      `Analyze failure modes, security considerations, and interview probes`,
    ],
    simpleExplanation: {
      definition: `${topicName} is a foundational engineering pattern in modern AI systems designed to provide reliability, efficiency, and verifiable behavior.`,
      plainEnglish: `Instead of treating AI like an unpredictable black box, ${topicName} gives developers explicit control, clear boundaries, and measurable checkpoints.`,
      whyItMatters: `Without ${topicName}, systems fail silently, hallucinate unverifiable facts, suffer from latency spikes, or exceed cost budgets in production.`,
      practicalExample: `In a live production system, ${topicName} ensures requests complete predictably within established latency budgets and strict accuracy guidelines.`,
    },
    analogy: {
      title: `The Precision Assembly Line for ${topicName}`,
      story: `Imagine an automated factory. Rather than having a single craftsman attempt to build an entire vehicle in one unstructured step, the factory uses specialized stations with defined inputs, optical quality scanners, and automated safety stops.`,
      whereItWorks: `It highlights the separation of concerns, deterministic checkpoints, and automated quality verification.`,
      whereItDiffers: `Physical factories have predictable material tolerances, whereas language models are non-deterministic probabilistic engines requiring runtime evals.`,
    },
    problemBeforeSolution: {
      whatWasTried: `Teams initially relied on monolithic, ad-hoc implementations without formal structure.`,
      whySimplerFailed: `Unstructured approaches broke under edge cases, lacked visibility when errors occurred, and could not be debugged systematically.`,
      difficultiesEncountered: [
        "Unpredictable behavior and lack of reproducibility",
        "Inability to trace root causes when production answers degraded",
        "High operational costs and unbounded latency loops",
      ],
      howConceptSolvesIt: `${topicName} introduces clear abstraction layers, standardized telemetry, and automated verification gates.`,
      remainingLimitations: `Requires disciplined testing, observability instrumentation, and continuous dataset updates.`,
    },
    diagram: {
      title: `${topicName} - Architectural Data Flow`,
      diagramType: "flowchart",
      source: `flowchart TD
    Input([Client Request / Input]) --> Validate[1. Input Validation & Guardrail]
    Validate --> CoreEngine["2. ${safeTopic} Processing Engine"]
    CoreEngine --> SubsystemA[Subsystem: Execution & State]
    CoreEngine --> SubsystemB[Subsystem: Verification & Evals]
    SubsystemA <--> Storage[(Persistent Cache / DB)]
    SubsystemB --> Telemetry[OpenTelemetry Metrics & Traces]
    CoreEngine --> OutputGuard[3. Output Validation & PII Scan]
    OutputGuard --> Output([Verified Response / Action])`,
      explanation: {
        whatComponentsRepresent: "Input is the incoming payload. Validation enforces schemas. CoreEngine executes the primary logic. Subsystems handle state and verification. OutputGuard guarantees safety.",
        arrowsAndDataFlow: "Data flows linearly through input checks, accesses external state stores, emits telemetry asynchronously, and passes output gates.",
        stepSequence: "Input -> Validation -> Core Processing -> Subsystem Coordination -> Verification -> Output Delivery.",
        failurePoints: "If validation fails, the request is rejected immediately with structured errors, preventing downstream corruption.",
      },
    },
    architecture: {
      title: `${topicName} Architecture`,
      subtitle: "Beginner Conceptual Model vs Enterprise Production Architecture",
      beginnerView: {
        name: "Standard Implementation",
        badge: "Beginner Conceptual",
        description: `Straightforward implementation of ${topicName} demonstrating the core logic.`,
        diagramSource: `graph LR
    User[User / Client] --> Core["${safeTopic} Engine"]
    Core --> Tools[Tools & APIs]
    Core --> Model[LLM Model]`,
        explanation: {
          whatComponentsRepresent: "Client interacts with the core engine, which delegates to tools and language models.",
          arrowsAndDataFlow: "Sequential request-response interaction.",
          stepSequence: "Receive -> Process -> Query -> Respond.",
          failurePoints: "Tool errors cause unhandled exceptions if try/except handlers are missing.",
        },
        components: [
          { name: "Core Engine", type: "orchestrator", role: `Coordinates ${topicName} workflow.` },
          { name: "Model Layer", type: "llm", role: "Performs natural language reasoning." },
          { name: "Tool Layer", type: "tool", role: "Executes deterministic actions." },
        ],
      },
      productionView: {
        name: "Scaled Enterprise Architecture",
        badge: "Production Scaled",
        description: `High-throughput, observable, and secured architecture for ${topicName}.`,
        diagramSource: `flowchart TD
    Client[Client App] --> Gateway[API Gateway / Auth]
    Gateway --> Guardrail[Safety & Policy Guardrails]
    Guardrail --> Service[Stateless Service Cluster]
    Service <--> Cache[(Semantic Cache / Redis)]
    Service <--> Engine["${safeTopic} Pipeline"]
    Engine <--> DB[(Sharded Enterprise Store)]
    Service --> OTel[OpenTelemetry GenAI Tracing]
    Service --> Output[Output Verifier]
    Output --> Client`,
        explanation: {
          whatComponentsRepresent: "API Gateway terminates auth. Stateless service cluster scales horizontally backed by Redis and OTel telemetry.",
          arrowsAndDataFlow: "Requests are authenticated, cached, executed against sharded stores, and traced end-to-end.",
          stepSequence: "Auth -> Cache Check -> Execution -> Verification -> Async Trace Emission -> Response.",
          failurePoints: "Cache miss falls back cleanly to primary compute; circuit breakers protect downstream APIs.",
        },
        components: [
          { name: "API Gateway", type: "gateway", role: "Handles rate-limiting, authentication, and routing." },
          { name: "Guardrail Layer", type: "security", role: "Scans for prompt injection and input anomalies." },
          { name: "Service Cluster", type: "orchestrator", role: "Stateless horizontally scalable execution pods." },
          { name: "Cache Store", type: "storage", role: "Reduces duplicate compute and token usage." },
          { name: "Telemetry Engine", type: "observability", role: "Emits distributed traces and online eval metrics." },
        ],
      },
    },
    executionTimeline: [
      {
        number: 1,
        title: "Request Admission & Schema Check",
        actor: "app",
        description: `Incoming payload is validated against strict Pydantic schemas for ${topicName}.`,
        input: "Raw request payload + authentication headers.",
        output: "Validated input object and assigned trace_id.",
        failureMode: "Malformed JSON or missing mandatory parameters.",
      },
      {
        number: 2,
        title: "Context Hydration & Cache Lookup",
        actor: "app",
        description: "Checks Redis for existing cached responses and loads user permissions.",
        input: "Query hash + tenant ID.",
        output: "Cache miss -> proceed to execution; or cache hit -> return response.",
        failureMode: "Cache server timeout (fails open to execution).",
      },
      {
        number: 3,
        title: "Model Reasoning / Core Execution",
        actor: "llm",
        description: `Core execution of ${topicName} utilizing language models or numerical algorithms.`,
        input: "Augmented prompt and configuration parameters.",
        output: "Generated actions, structured schema, or predictions.",
        failureMode: "Latency timeout or token limit breach.",
        isModelReasoning: true,
      },
      {
        number: 4,
        title: "Verification & Output Guardrails",
        actor: "app",
        description: "Deterministic checks verify that outputs conform to schema and policy.",
        input: "Generated candidate output.",
        output: "Sanitized, verified response ready for delivery.",
        failureMode: "Output contains hallucinated citations or unverified assertions.",
      },
      {
        number: 5,
        title: "Telemetry Emission",
        actor: "external",
        description: "Asynchronously sends OpenTelemetry spans and token metrics to collectors.",
        input: "Execution duration, token counts, error status.",
        output: "OTel OTLP packet emitted to backend.",
        failureMode: "Collector unavailable (buffered in memory).",
      },
    ],
    codeWalkthrough: {
      title: `Python Production Pattern for ${topicName}`,
      purpose: `Implement a clean, testable, and robust pattern for ${topicName} with input validation and error handling.`,
      dependencies: ["python >= 3.10", "pydantic >= 2.0"],
      code: `from pydantic import BaseModel, Field
import time

class TaskRequest(BaseModel):
    task_id: str = Field(description="Unique request identifier")
    payload: dict = Field(default_factory=dict)

class TaskResponse(BaseModel):
    task_id: str
    status: str
    latency_ms: int
    data: dict

def execute_production_step(req: TaskRequest) -> TaskResponse:
    start_time = time.perf_counter()
    try:
        # 1. Execute deterministic logic
        processed_data = {"topic": "${topicName}", "verified": True, **req.payload}
        latency = int((time.perf_counter() - start_time) * 1000)
        return TaskResponse(
            task_id=req.task_id,
            status="success",
            latency_ms=latency,
            data=processed_data
        )
    except Exception as e:
        latency = int((time.perf_counter() - start_time) * 1000)
        return TaskResponse(
            task_id=req.task_id,
            status="error",
            latency_ms=latency,
            data={"error": str(e)}
        )

# Test execution
if __name__ == "__main__":
    req = TaskRequest(task_id="task-101", payload={"query": "test query"})
    res = execute_production_step(req)
    print(res.model_dump_json(indent=2))`,
      expectedOutput: `{
  "task_id": "task-101",
  "status": "success",
  "latency_ms": 0,
  "data": {
    "topic": "${topicName}",
    "verified": true,
    "query": "test query"
  }
}`,
      annotations: [
        { lines: "Lines 4-10", explanation: "Pydantic models enforce strict schema boundaries on inputs and outputs." },
        { lines: "Lines 14-23", explanation: "Calculates latency per step and returns a structured response object with zero unhandled exceptions." },
        { lines: "Lines 24-31", explanation: "Catches unexpected runtime exceptions and converts them into structured error objects for observability." },
      ],
      commonErrors: [
        {
          error: "Silent failures swallowed by bare except: pass",
          fix: "Always catch specific exceptions, log the stack trace, and return structured error diagnostics.",
        },
      ],
    },
    comparison: {
      title: `${topicName} Trade-off Analysis`,
      conceptAName: "Ad-hoc Implementation",
      conceptBName: "Architected Pattern",
      summaryA: "Quick prototype implementation without formal schemas, limits, or telemetry.",
      summaryB: "Engineered pattern with schema contracts, automated eval gates, and distributed observability.",
      rows: [
        { aspect: "Development Velocity", conceptA: "Fast initial prototype in 1 hour", conceptB: "Requires 1-2 days of initial architecture setup" },
        { aspect: "Production Reliability", conceptA: "Fragile; fails under unexpected edge cases", conceptB: "Robust; deterministic bounds and graceful degradation" },
        { aspect: "Debuggability", conceptA: "Poor; silent failures and missing logs", conceptB: "High; distributed traces pinpoint exact failing spans" },
        { aspect: "Scalability", conceptA: "Tightly coupled and single-instance bound", conceptB: "Stateless and horizontally scalable behind load balancers" },
      ],
      whenToChooseA: "Use for rapid one-off hackathon prototypes or exploratory scripts.",
      whenToChooseB: "Mandatory for all customer-facing production systems and enterprise platforms.",
    },
    useCases: [
      {
        title: `Enterprise Production Implementation of ${topicName}`,
        industry: "Enterprise AI Platform",
        goal: `Execute ${topicName} reliably across millions of monthly transactions.`,
        userInput: `'Execute production query with safety constraints.'`,
        componentsInvolved: ["FastAPI Gateway", "Model Layer", "State Store", "OTel Collector"],
        workflowSteps: [
          "Validate incoming request parameters against schema.",
          "Execute core pipeline with bounded timeouts.",
          "Validate generated outputs against safety guardrails.",
          "Emit distributed telemetry spans to central collectors.",
        ],
        expectedOutput: "'Execution completed with verified output and compliant telemetry.'",
        failureScenarios: [
          { failure: "Downstream API timeout.", guardrailFix: "Circuit breaker triggers graceful degradation or cached fallback." },
        ],
      },
      {
        title: `Automated Compliance & Audit System for ${topicName}`,
        industry: "FinTech / Regulatory",
        goal: `Ensure every operation of ${topicName} satisfies legal auditing requirements.`,
        userInput: `'Process transaction log and generate audit trail.'`,
        componentsInvolved: ["Audit Logger", "Crypto Signer", "Postgres DB", "Notification Queue"],
        workflowSteps: [
          "Ingest transaction event with user identity and timestamp.",
          "Verify that operation satisfies risk tier requirements.",
          "Write cryptographic audit hash to immutable storage.",
          "Return signed verification receipt to caller.",
        ],
        expectedOutput: "'Audit record #AUD-9912 generated and permanently archived.'",
        failureScenarios: [
          { failure: "Audit storage unavailable.", guardrailFix: "System halts non-read operations until audit storage recovers." },
        ],
      },
    ],
    mistakesAndBestPractices: {
      mistakes: [
        {
          mistake: `Deploying ${topicName} without explicit timeout limits`,
          whyItHappens: "Assuming network calls and external services will always respond in milliseconds.",
          correctApproach: "Enforce strict HTTP timeouts (e.g. 5000ms) with exponential backoff and jitter.",
          category: "performance",
        },
        {
          mistake: "Relying solely on unit tests rather than regression evaluations",
          whyItHappens: "Treating AI like traditional deterministic code without accounting for non-determinism.",
          correctApproach: "Run continuous offline evaluation suites against version-controlled golden datasets.",
          category: "architecture",
        },
      ],
      productionChecklist: [
        "Enforce strict input validation using Pydantic or JSON Schema",
        "Set explicit timeout limits and retry caps on all external dependencies",
        "Record distributed traces with OpenTelemetry semantic conventions",
        "Implement circuit breakers that degrade gracefully during downstream outages",
        "Run offline evaluation suites before deploying any prompt, model, or code change",
      ],
    },
    interviewQuestions: [
      {
        id: `int-${modId}-1`,
        level: "Beginner",
        question: `Explain the fundamental concept of ${topicName} and why it is essential in modern AI engineering.`,
        strongAnswer: `${topicName} provides a structured engineering framework that turns non-deterministic AI capabilities into predictable, observable, and reliable software services. It decouples reasoning from execution and establishes clear operational boundaries.`,
        whyItsStrong: "Focuses on engineering principles (predictability, observability, boundaries) rather than hand-wavy marketing terms.",
        weakAnswer: `It is an AI tool that makes language models work better and faster.`,
        whyItsWeak: "Vague, mentions no architectural mechanisms or specific failure modes.",
        followUp: `What metrics would you monitor in production to confirm ${topicName} is operating correctly?`,
        companyTag: "Google",
      },
      {
        id: `int-${modId}-2`,
        level: "Intermediate",
        question: `What are the primary production failure modes of ${topicName}, and how do you mitigate them?`,
        strongAnswer: `Key failure modes include: 1. Unbounded latency spikes caused by slow dependencies, mitigated by strict timeouts and fallbacks. 2. Silent quality degradation caused by data drift, mitigated by reference-free online evaluators. 3. Security vulnerabilities such as injection, mitigated by least-privilege scoping and input/output guardrails.`,
        whyItsStrong: "Systematically addresses latency, quality, and security with concrete architectural mitigations.",
        weakAnswer: `Things fail when the prompt is too short, so you just rewrite the system prompt.`,
        whyItsWeak: "Ignores systems-level concerns like network latency, security, and data drift.",
        followUp: `How do you gate CI/CD deployments using automated evaluation suites?`,
        companyTag: "Anthropic",
      },
    ],
    interactiveQuiz: [
      {
        id: `q-${modId}-1`,
        question: `What is the most critical requirement when deploying ${topicName} in a high-throughput production environment?`,
        options: [
          "Disabling all logging to save disk space",
          "Enforcing bounded execution limits, input/output validation, and distributed observability",
          "Allowing models to execute shell commands directly without sandboxing",
          "Using a single thread to avoid concurrency issues",
        ],
        correctIndex: 1,
        explanation: "Production stability requires strict boundaries, validation schemas, and real-time observability.",
      },
    ],
    exerciseChallenge: {
      exercise: {
        title: `Implement a Robust Error-Handling Wrapper for ${topicName}`,
        instructions: `Write a Python wrapper function that executes a task, measures latency, catches exceptions, and returns a standardized response dict.`,
        starterCode: `def safe_executor(task_fn, *args, **kwargs):
    # TODO: Measure time, execute task_fn, handle exceptions gracefully
    pass`,
        solutionHint: `import time

def safe_executor(task_fn, *args, **kwargs):
    start = time.perf_counter()
    try:
        res = task_fn(*args, **kwargs)
        return {"success": True, "result": res, "latency_ms": int((time.perf_counter() - start) * 1000)}
    except Exception as e:
        return {"success": False, "error": str(e), "latency_ms": int((time.perf_counter() - start) * 1000)}`,
      },
      debuggingChallenge: {
        title: "The Uncaught Dependency Timeout",
        symptom: "A service using external APIs hangs indefinitely when an upstream provider experiences an outage, freezing all incoming worker threads.",
        buggyCode: `import requests

def call_upstream(url, payload):
    # BUG: No timeout specified! Defaults to waiting indefinitely.
    resp = requests.post(url, json=payload)
    return resp.json()`,
        explanation: "Omitting a timeout parameter allows socket connections to hang indefinitely when servers drop packets, exhausting worker pools.",
        correctedCode: `import requests

def call_upstream(url, payload):
    # Fix: Set explicit connect and read timeouts (e.g. 3.0s connect, 10.0s read)
    resp = requests.post(url, json=payload, timeout=(3.0, 10.0))
    resp.raise_for_status()
    return resp.json()`,
      },
      revisionSummary: [
        `${topicName} is an essential pattern for building dependable AI systems.`,
        "Always separate reasoning from deterministic execution.",
        "Enforce strict timeouts, retry limits, and circuit breakers.",
        "Instrument every step with OpenTelemetry semantic conventions.",
      ],
      relatedTopics: [
        { title: "AI Agent Fundamentals", moduleId: 5 },
        { title: "Production RAG Systems", moduleId: 7 },
        { title: "AI Evals & Testing Harnesses", moduleId: 12 },
      ],
    },
  };
}
