import { FullVisualLesson } from "../visual-curriculum";

export const LESSON_M10_L1: FullVisualLesson = {
  moduleId: 10,
  lessonId: "m10-l1",
  title: "Multi-Agent Systems: Anthropic Research, 15x Token Multiplier & Topologies",
  estimatedMinutes: 30,
  level: "Advanced",
  learningObjectives: [
    "Evaluate Anthropic research benchmarks: when multi-agent beats single-agent vs when it wastes tokens",
    "Quantify the 15x token multiplier and latency overhead of inter-agent communication",
    "Compare the 3 primary multi-agent topologies: Supervisor-Worker, Peer Choreography, and Hierarchical",
    "Diagnose and prevent multi-agent failure modes: ping-pong loops and context fragmentation",
    "Implement a bounded Supervisor-Worker state orchestrator in Python with strict turn caps",
  ],
  simpleExplanation: {
    definition:
      "A Multi-Agent System (MAS) is an architecture where multiple specialized AI agents, each with dedicated prompts, distinct tool registries, and isolated memory contexts, collaborate or challenge each other to accomplish complex, partitioned goals.",
    plainEnglish:
      "Instead of asking one person to be the researcher, software engineer, security auditor, and project manager all at once, you assemble a team of specialists. A Lead Architect assigns research to an Analyst, coding to a Developer, and security testing to a Penetration Tester, synthesizing their separate work into the final product.",
    whyItMatters:
      "A single agent given 50 different tools and a 200-page prompt suffers from attention dilution, tool confusion, and context rot. Partitioning responsibilities into focused agents keeps individual prompts small, deterministic, and highly accurate.",
    practicalExample:
      "An automated vulnerability patching system: a 'Scanner Agent' discovers a SQL injection vulnerability; a 'Coder Agent' writes a parameterized patch; an independent 'Adversarial Red Team Agent' attempts to break the patch; only when the Red Team fails to exploit it does the 'Deployer Agent' create a pull request.",
  },
  analogy: {
    title: "The Construction Crew vs The Lone Handyman",
    story:
      "If you need a leaky faucet fixed, hiring a lone handyman is fast and cheap. But if you are building a skyscraper, one person cannot pour concrete, install electrical wiring, fit plumbing, and perform building code inspections. You need specialized subcontractors managed by a general contractor who verifies each milestone before permitting the next phase.",
    whereItWorks:
      "Accurately captures task partitioning, role specialization, independent verification, and hierarchical coordination.",
    whereItDiffers:
      "Human subcontractors communicate via quick real-world conversations. AI agents communicate by exchanging full context windows of tokens, multiplying token consumption by 5x to 15x and introducing compounding latency.",
  },
  problemBeforeSolution: {
    whatWasTried:
      "Teams gave a single agent dozens of complex tools (Postgres, GitHub, Slack, Jira, AWS, terminal) and a massive 4,000-word system prompt describing all organizational workflows.",
    whySimplerFailed:
      "The single agent suffered from tool hallucination (calling the wrong tool with invalid arguments), context pollution (earlier tool errors derailed subsequent reasoning), and attention degradation.",
    difficultiesEncountered: [
      "15x token explosion: naive multi-agent frameworks consumed millions of tokens chatting aimlessly without converging",
      "Ping-pong loops: Agent A asked Agent B for clarification, and Agent B replied with a counter-question forever",
      "Compounding latency: sequential agent handoffs resulted in 60-second response times for simple queries",
      "Context fragmentation: workers lacked the broad context known to the supervisor, producing disjointed answers",
    ],
    howConceptSolvesIt:
      "Structured topologies (such as Supervisor-Worker with typed state handoffs) define strict routing graphs, state boundaries, turn budgets, and deterministic termination gates.",
    remainingLimitations:
      "Multi-agent systems are fundamentally more expensive and slower than single agents; they should only be used when clear architectural necessity demands them.",
  },
  diagram: {
    title: "Multi-Agent Topologies: Supervisor vs Peer Choreography",
    diagramType: "flowchart",
    source: `flowchart TD
    subgraph SupervisorTopology["Supervisor-Worker Topology (Recommended)"]
        UserGoal([User Objective]) --> Supervisor[Supervisor Agent: Routing & Synthesis]
        Supervisor --> WorkerA[Worker 1: SQL Data Analyst]
        Supervisor --> WorkerB[Worker 2: Python Code Generator]
        Supervisor --> WorkerC[Worker 3: Security Red Team]
        WorkerA --> Supervisor
        WorkerB --> Supervisor
        WorkerC --> Supervisor
        Supervisor --> FinalAnswer([Synthesized Enterprise Solution])
    end

    subgraph PeerChoreography["Peer Choreography (High Risk of Loops)"]
        Peer1[Agent A] <--> Peer2[Agent B]
        Peer2 <--> Peer3[Agent C]
        Peer3 <--> Peer1
    end`,
    explanation: {
      whatComponentsRepresent:
        "In the Supervisor topology, all communication routes through a central coordinator that maintains global state. In Peer Choreography, agents message each other directly without central authority.",
      arrowsAndDataFlow:
        "The Supervisor delegates subtasks with strict schemas, gathers results, checks termination criteria, and synthesizes. Peer agents pass messages in a web.",
      stepSequence:
        "1. Supervisor parses goal -> 2. Dispatches subtask to Worker A -> 3. Worker A returns structured fact -> 4. Dispatches to Worker B -> 5. Synthesizes final response.",
      failurePoints:
        "In Peer Choreography, agents often enter infinite ping-pong loops asking each other polite questions without ever finishing the task.",
    },
  },
  architecture: {
    title: "Multi-Agent System Architectures",
    subtitle: "Naive Free-Form Multi-Agent vs Production Typed State Graph",
    beginnerView: {
      name: "Naive Free-Form Multi-Agent (AutoGPT Style)",
      badge: "Anti-Pattern",
      description: "Agents chat freely with each other in an unconstrained loop without typed contracts or convergence checks.",
      diagramSource: `flowchart LR
    A[Agent 1: Planner] <--> B[Agent 2: Researcher]
    B <--> C[Agent 3: Writer]
    C <--> A`,
      explanation: {
        whatComponentsRepresent: "Multiple agents in a chat room passing raw conversational text back and forth.",
        arrowsAndDataFlow: "Circular conversational flows with no central state store or explicit stopping rules.",
        stepSequence: "Chat -> Reply -> Counter-reply -> Loop forever.",
        failurePoints: "Suffers from 15x token burn, polite endless loops ('Thank you! How else can I help?'), and zero guaranteed termination.",
      },
      components: [
        { name: "Unbounded Agents", type: "llm", role: "Agents with no turn limits or schema contracts." },
        { name: "Chat Bus", type: "gateway", role: "Unstructured message passing channel." },
      ],
    },
    productionView: {
      name: "Typed State Graph Multi-Agent (LangGraph Pattern)",
      badge: "Production Scaled",
      description: "A centralized typed state object passed through explicit nodes and conditional edges with hard step limits and loop detection.",
      diagramSource: `flowchart TD
    StateStore[(Typed Shared State: Pydantic)]
    StartNode([Start]) --> SupervisorNode[Supervisor Router Node]
    SupervisorNode <--> StateStore
    SupervisorNode -- "route: 'research'" --> ResearchNode[Research Worker Node]
    SupervisorNode -- "route: 'code'" --> CodeNode[Code Worker Node]
    SupervisorNode -- "route: 'eval'" --> EvaluatorNode[Adversarial Evaluator Node]
    ResearchNode --> SupervisorNode
    CodeNode --> EvaluatorNode
    EvaluatorNode -- "Failed Evals & Iterations < 3" --> CodeNode
    EvaluatorNode -- "Passed Evals" --> EndNode([Finish & Return State])`,
      explanation: {
        whatComponentsRepresent: "A single state store tracks progress. Nodes are pure functions that read state and return updates. Conditional edges enforce loop counts.",
        arrowsAndDataFlow: "Execution flows along directed graph edges. Code can loop back to developer a maximum of 3 times before escalating to human.",
        stepSequence: "Start -> Supervisor -> Worker -> Evaluator -> (Loop or Exit) -> Finish.",
        failurePoints: "If state object accumulates too many raw documents, it exceeds model context limits (mitigated by state pruning).",
      },
      components: [
        { name: "Shared State Store", type: "storage", role: "Immutable Pydantic object capturing task history and outputs." },
        { name: "Supervisor Node", type: "orchestrator", role: "Deterministic or LLM-guided router choosing the next node." },
        { name: "Worker Nodes", type: "tool", role: "Domain-specific execution units with scoped tools." },
        { name: "Evaluator Gate", type: "security", role: "Verifies outputs meet rubric criteria before permitting completion." },
      ],
    },
  },
  executionTimeline: [
    {
      number: 1,
      title: "Goal Ingestion & State Initialization",
      actor: "app",
      description: "User submits: 'Build a secure password validator function with unit tests.' Shared state initialized with task_id, empty results, and turn_count=0.",
      input: "Goal: Build secure password validator + unit tests",
      output: 'State: {"turn_count": 0, "code": null, "tests": null, "is_verified": false}',
    },
    {
      number: 2,
      title: "Supervisor Routing Decision",
      actor: "llm",
      isModelReasoning: true,
      description: "Supervisor analyzes state: no code exists yet. Decides to route execution to 'CoderAgent'.",
      input: "State snapshot + worker registry",
      output: 'Route: "CoderAgent" with instruction "Write password validator checking length, digits, and symbols."',
    },
    {
      number: 3,
      title: "Coder Worker Execution",
      actor: "tool",
      description: "CoderAgent receives scoped prompt, writes Python validator, and appends code to shared state.",
      input: "Instruction from Supervisor",
      output: 'State Update: {"code": "def validate_pwd(p): ...", "turn_count": 1}',
    },
    {
      number: 4,
      title: "Adversarial Tester Worker",
      actor: "llm",
      isModelReasoning: true,
      description: "Supervisor routes to 'SecurityAuditorAgent'. Auditor attempts to break code with boundary inputs (e.g. empty string, 100k chars).",
      input: "Code from state",
      output: 'State Update: {"tests_passed": true, "audit_notes": "Passed all edge cases", "turn_count": 2}',
    },
    {
      number: 5,
      title: "Supervisor Termination & Output Delivery",
      actor: "llm",
      isModelReasoning: true,
      description: "Supervisor inspects state: code is verified by auditor and tests pass. Declares goal achieved and terminates loop.",
      input: "State snapshot with verified tests",
      output: "Final delivery to user with code, test suite, and security audit report.",
    },
  ],
  codeWalkthrough: {
    title: "Production Supervisor-Worker Multi-Agent Orchestrator in Python",
    purpose: "Implement a bounded, typed multi-agent state graph with explicit loop termination, step limits, and worker delegation.",
    dependencies: ["python >= 3.10", "pydantic >= 2.0"],
    code: `from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Literal
import time

# 1. Define Shared Typed State
class AgentState(BaseModel):
    task: str
    iteration: int = 0
    max_iterations: int = 5
    research_notes: Optional[str] = None
    draft_code: Optional[str] = None
    review_status: Literal["pending", "approved", "rejected"] = "pending"
    final_output: Optional[str] = None

# 2. Define Worker Agents as Specialized Functions
def researcher_worker(state: AgentState) -> Dict:
    print(f"  [Researcher] Gathering facts for: '{state.task}'...")
    return {
        "research_notes": "Requirements: Must support OAuth2 PKCE and token refresh rotation.",
        "iteration": state.iteration + 1
    }

def coder_worker(state: AgentState) -> Dict:
    print(f"  [Coder] Writing implementation based on notes...")
    return {
        "draft_code": "def authenticate_pkce(client_id, code_verifier): return {'token': 'valid'}",
        "iteration": state.iteration + 1
    }

def reviewer_worker(state: AgentState) -> Dict:
    print(f"  [Reviewer] Inspecting draft code for security...")
    # Simulate verification
    if state.draft_code and "authenticate_pkce" in state.draft_code:
        return {"review_status": "approved", "iteration": state.iteration + 1}
    return {"review_status": "rejected", "iteration": state.iteration + 1}

# 3. Supervisor Orchestration Loop with Hard Guardrails
def run_supervisor_orchestrator(task: str) -> AgentState:
    state = AgentState(task=task)
    print(f"=== Starting Multi-Agent Orchestrator: '{task}' ===")
    
    while state.iteration < state.max_iterations:
        print(f"\\nIteration {state.iteration + 1} / {state.max_iterations}...")
        
        # Routing Logic
        if not state.research_notes:
            update = researcher_worker(state)
        elif not state.draft_code:
            update = coder_worker(state)
        elif state.review_status == "pending":
            update = reviewer_worker(state)
        elif state.review_status == "approved":
            print("  [Supervisor] Goal achieved! Synthesizing final response.")
            state.final_output = f"Approved Solution:\\n{state.draft_code}\\nNotes: {state.research_notes}"
            break
        else:
            print("  [Supervisor] Review rejected. Resetting draft for re-work.")
            update = {"draft_code": None, "review_status": "pending", "iteration": state.iteration + 1}
            
        state = state.model_copy(update=update)
    
    if state.iteration >= state.max_iterations and not state.final_output:
        state.final_output = "Emergency Termination: Maximum multi-agent iterations reached without convergence."
        
    return state

if __name__ == "__main__":
    result = run_supervisor_orchestrator("Implement OAuth2 PKCE Flow")
    print("\\n=== FINAL RESULT ===")
    print(result.final_output)`,
    expectedOutput: `=== Starting Multi-Agent Orchestrator: 'Implement OAuth2 PKCE Flow' ===

Iteration 1 / 5...
  [Researcher] Gathering facts for: 'Implement OAuth2 PKCE Flow'...

Iteration 2 / 5...
  [Coder] Writing implementation based on notes...

Iteration 3 / 5...
  [Reviewer] Inspecting draft code for security...

Iteration 4 / 5...
  [Supervisor] Goal achieved! Synthesizing final response.

=== FINAL RESULT ===
Approved Solution:
def authenticate_pkce(client_id, code_verifier): return {'token': 'valid'}
Notes: Requirements: Must support OAuth2 PKCE and token refresh rotation.`,
    annotations: [
      { lines: "Lines 6-14", explanation: "Shared Pydantic state ensures every agent operates on typed schemas with clear iteration counters." },
      { lines: "Lines 16-33", explanation: "Workers are decoupled functions with focused responsibilities that return state delta dictionaries." },
      { lines: "Lines 35-58", explanation: "Supervisor loop enforces deterministic termination (`iteration < max_iterations`), preventing infinite ping-pong loops." },
      { lines: "Lines 60-63", explanation: "Emergency fallback ensures the system never hangs indefinitely if agents fail to agree." },
    ],
    commonErrors: [
      {
        error: "Allowing agents to pass unstructured conversational text without a shared state object",
        fix: "Always use a typed shared state schema (e.g. Pydantic or LangGraph State) to maintain clear data contracts.",
      },
      {
        error: "Omitting maximum iteration caps, leading to runaway API token bills",
        fix: "Enforce a hard max_iterations cap (e.g., 5 to 10 iterations) and alert on abnormal repetition.",
      },
    ],
  },
  comparison: {
    title: "Single Agent with Tools vs Multi-Agent Systems",
    conceptAName: "Single Agent with Tools",
    conceptBName: "Multi-Agent System (Supervisor-Worker)",
    summaryA: "One LLM instance with a consolidated system prompt, executing multiple tools in a single ReAct loop.",
    summaryB: "Multiple specialized LLM instances with partitioned roles, communicating through a supervisor or message graph.",
    rows: [
      { aspect: "Token Consumption", conceptA: "1x Baseline token spend", conceptB: "5x to 15x Token Multiplier" },
      { aspect: "End-to-End Latency", conceptA: "Fast (1-3 seconds per turn)", conceptB: "Slow (10-30 seconds across agent handoffs)" },
      { aspect: "Debugging & Tracing", conceptA: "Simple linear trace in OpenTelemetry", conceptB: "Complex multi-branched distributed trace trees" },
      { aspect: "Risk of Infinite Loops", conceptA: "Low; easily bounded by step limits", conceptB: "High; inter-agent ping-pong loops common" },
      { aspect: "Best Used For", conceptA: "85% of production AI tasks (support, RAG, coding)", conceptB: "Adversarial testing, isolated legal analysis, red-teaming" },
    ],
    whenToChooseA: "Default choice for almost all production applications. Fast, cost-efficient, and easy to evaluate.",
    whenToChooseB: "Choose only when roles require genuine adversarial competition (e.g. Coder vs Auditor) or strictly isolated context windows.",
  },
  useCases: [
    {
      title: "Automated Software Code Review & Security Hardening",
      industry: "DevSecOps",
      goal: "Automatically review pull requests for security vulnerabilities using an adversarial developer-auditor pair.",
      userInput: "'Review PR #88: Add Stripe webhook endpoint.'",
      componentsInvolved: ["Supervisor Agent", "Static Analysis Agent", "Adversarial Red Team Agent", "Fix Generator Agent"],
      workflowSteps: [
        "Supervisor ingests Git diff and dispatches diff to Static Analysis Agent.",
        "Static Analysis Agent flags missing webhook signature verification (`stripe.Webhook.construct_event`).",
        "Red Team Agent generates a mock replay exploit proving the vulnerability.",
        "Fix Generator Agent updates the code to enforce signature validation.",
        "Red Team verifies the patch blocks the exploit.",
        "Supervisor posts the verified pull request comment with patch diff.",
      ],
      expectedOutput: "'PR Review: Critical vulnerability detected (missing signature check). Verified patch attached.'",
      failureScenarios: [
        {
          failure: "Red Team and Fix Generator enter endless loop arguing over code style.",
          guardrailFix: "Supervisor limits review rounds to max 2 iterations before escalating unresolved issues to human tech lead.",
        },
      ],
    },
    {
      title: "Multi-Jurisdiction Legal Regulatory Compliance",
      industry: "Legal Tech",
      goal: "Analyze an international corporate merger across US FTC, EU GDPR, and UK CMA regulations simultaneously.",
      userInput: "'Analyze merger filing for regulatory compliance across US, EU, and UK antitrust laws.'",
      componentsInvolved: ["General Counsel Supervisor", "US Antitrust Agent", "EU GDPR Agent", "UK CMA Agent"],
      workflowSteps: [
        "Supervisor partitions the 500-page filing and delegates sections to 3 specialized jurisdiction agents.",
        "Each agent runs in its own context window without being diluted by the other 350 pages of irrelevant foreign law.",
        "Workers return structured compliance summaries with citations.",
        "Supervisor synthesizes global risk assessment for board of directors.",
      ],
      expectedOutput: "'Global Filing Analysis: EU approval likely; UK CMA requires remedies on cloud infrastructure assets.'",
      failureScenarios: [
        {
          failure: "One sub-agent crashes due to context limit on a 200-page appendix.",
          guardrailFix: "Supervisor uses chunked map-reduce retrieval for sub-agents, handling individual failures with fallback summaries.",
        },
      ],
    },
  ],
  mistakesAndBestPractices: {
    mistakes: [
      {
        mistake: "Defaulting to multi-agent architecture for simple tasks that a single prompt could solve",
        whyItHappens: "Hype around multi-agent frameworks leading to over-engineering.",
        correctApproach: "Follow Anthropic's guidance: start with a single well-prompted agent with task-shaped tools; only add agents when strictly necessary.",
        category: "architecture",
      },
      {
        mistake: "Allowing agents to converse freely without structured Pydantic output schemas",
        whyItHappens: "Connecting agents via plain natural language chat strings.",
        correctApproach: "Force all inter-agent communication through typed schemas, stripping conversational filler and preventing misunderstanding.",
        category: "implementation",
      },
      {
        mistake: "Forgetting global token spend and wall-clock timeout caps across the entire multi-agent swarm",
        whyItHappens: "Setting timeouts per agent instead of across the entire orchestrated run.",
        correctApproach: "Set an overarching budget cap (e.g. max $2.00 or 60 seconds total) for the entire composite workflow.",
        category: "performance",
      },
    ],
    productionChecklist: [
      "Benchmark single-agent baseline first before committing to multi-agent complexity",
      "Use the Supervisor-Worker topology with centralized state over unconstrained peer networks",
      "Enforce typed Pydantic state schemas for all inter-agent data transfers",
      "Set hard global step limits (max 5-10 turns) to prevent runaway ping-pong loops",
      "Implement overall token budget caps and timeout deadlines for the entire swarm",
      "Instrument distributed trace spans in OpenTelemetry with parent-child links for every agent handoff",
    ],
  },
  interviewQuestions: [
    {
      id: "multi-q1",
      level: "Beginner",
      question: "According to Anthropic research, when should an engineer choose a multi-agent system over a single agent?",
      strongAnswer:
        "Anthropic research demonstrates that for the majority of standard tasks, a single agent with well-designed task-shaped tools matches or beats multi-agent architectures at 1/15th the token cost and significantly lower latency. Multi-agent architectures are justified only when: 1. Tasks require genuinely conflicting or adversarial goals (e.g. Coder vs Red Team Auditor), 2. Context isolation is required to prevent attention dilution across massive documents (e.g. 5 parallel legal document reviews), or 3. Separate agents require strictly disjoint permissions or tool registries for security isolation.",
      whyItsStrong:
        "Cites empirical industry research (15x token multiplier) and provides the 3 specific conditions where multi-agent genuinely outperforms single agents.",
      weakAnswer: "Multi-agent is always better because two brains are better than one.",
      whyItsWeak: "Ignores the massive cost multiplier, latency penalty, and empirical benchmark findings.",
      followUp: "What are the 3 primary multi-agent topologies and their trade-offs?",
      companyTag: "Anthropic",
    },
    {
      id: "multi-q2",
      level: "Intermediate",
      question: "What is a 'ping-pong loop' in multi-agent systems, and how do you prevent it architecturally?",
      strongAnswer:
        "A ping-pong loop occurs in peer-to-peer or unconstrained multi-agent architectures when two or more agents pass conversational messages back and forth indefinitely without advancing toward task completion (e.g., Agent A asks for clarification, Agent B answers politely and asks another question, or agents repeatedly praise each other). Mitigations include: 1. Adopting a Supervisor-Worker topology where only the supervisor routes tasks and evaluates completion, 2. Enforcing a hard turn cap (e.g. max 5 iterations), 3. Communicating via typed Pydantic state deltas rather than natural language chat, and 4. Implementing programmatic convergence criteria.",
      whyItsStrong:
        "Clearly identifies both the cause (unstructured natural language peer chat) and 4 architectural mitigations (supervisor topology, turn caps, typed state, convergence checks).",
      weakAnswer: "It's when agents get stuck talking, so you just tell them in the prompt to stop talking.",
      whyItsWeak: "Relying on prompt text alone to stop loops fails consistently; code-level turn caps are required.",
      followUp: "How does LangGraph use conditional edges and state checkpoints to prevent runaway loops?",
      companyTag: "Datadog",
    },
    {
      id: "multi-q3",
      level: "Advanced",
      question: "How do you architect distributed observability for a multi-agent system using OpenTelemetry GenAI semantic conventions?",
      strongAnswer:
        "In a multi-agent system, tracing must capture causal parent-child relationships across asynchronous worker handoffs. We create an overarching root span for the `invoke_agent` supervisor invocation. Each worker delegation creates a child span with `gen_ai.agent.name`, `gen_ai.operation.name: 'worker_delegation'`, and W3C Traceparent headers propagated in state metadata. Inside each worker, model calls emit `gen_ai.client.operation.duration` spans, and tool calls emit `gen_ai.tool.name` spans. For asynchronous workers running on message queues (e.g. Celery or Kafka), we use OpenTelemetry Span Links to link the worker trace back to the initiating supervisor span without blocking the root trace.",
      whyItsStrong:
        "Leverages standard OpenTelemetry semantic conventions (`gen_ai.*`), W3C Trace Context, and Span Links for asynchronous distributed tracing.",
      weakAnswer: "You just print timestamps in the console and log them to a file.",
      whyItsWeak: "Does not address distributed tracing, W3C standards, or asynchronous parent-child span trees.",
      followUp: "How do you implement head and tail sampling to manage trace storage costs in high-volume swarms?",
      companyTag: "Google",
    },
  ],
  interactiveQuiz: [
    {
      id: "multi-quiz-1",
      question: "What is the typical token consumption multiplier of a multi-agent system compared to a single agent?",
      options: [
        "1.1x (negligible difference)",
        "5x to 15x higher token consumption",
        "Multi-agent uses fewer tokens because tasks are divided",
        "Always exactly 100x",
      ],
      correctIndex: 1,
      explanation:
        "Because each agent requires its own system prompt, historical context, and conversational handoff overhead, multi-agent systems routinely consume 5x to 15x more tokens.",
    },
    {
      id: "multi-quiz-2",
      question: "Which multi-agent topology is most vulnerable to infinite ping-pong loops?",
      options: [
        "Supervisor-Worker with state caps",
        "Peer Choreography without a central coordinator",
        "Linear Prompt Chaining",
        "Single Agent with tools",
      ],
      correctIndex: 1,
      explanation:
        "Peer choreography lacks a central authority to evaluate goal completion, frequently resulting in cyclical polite exchanges.",
    },
  ],
  exerciseChallenge: {
    exercise: {
      title: "Implement a Turn-Capped Multi-Agent Loop",
      instructions:
        "Write a Python function `execute_agent_loop(agents: list, max_turns: int = 5)` that executes agents sequentially up to `max_turns`, terminating early if any agent returns `{'done': True}`.",
      starterCode: `def execute_agent_loop(agents: list, max_turns: int = 5):
    # TODO: Execute loop with turn cap and early exit
    pass`,
      solutionHint: `def execute_agent_loop(agents: list, max_turns: int = 5):
    state = {"turn": 0, "done": False, "history": []}
    while state["turn"] < max_turns and not state["done"]:
        for agent in agents:
            if state["turn"] >= max_turns or state["done"]:
                break
            result = agent(state)
            state["turn"] += 1
            state["history"].append(result)
            if result.get("done"):
                state["done"] = True
                break
    return state`,
    },
    debuggingChallenge: {
      title: "The Runaway Agent Chat Loop",
      symptom: "A multi-agent customer support prototype burns $800 in OpenAI API credits in 20 minutes before crashing.",
      buggyCode: `def run_chat_agents(agent_a, agent_b, user_msg):
    msg = user_msg
    # BUG: Infinite while loop with no turn cap or stopping check!
    while True:
        msg = agent_a.respond(msg)
        msg = agent_b.respond(msg)
    return msg`,
      explanation:
        "The `while True` loop has no exit condition or turn budget. The two agents continued chatting indefinitely, re-sending ever-expanding context windows with exponential cost.",
      correctedCode: `def run_chat_agents(agent_a, agent_b, user_msg, max_turns=6):
    msg = user_msg
    turns = 0
    while turns < max_turns:
        msg = agent_a.respond(msg)
        turns += 1
        if "TASK_COMPLETE" in msg:
            break
        msg = agent_b.respond(msg)
        turns += 1
        if "TASK_COMPLETE" in msg:
            break
    return msg`,
    },
    revisionSummary: [
      "Always benchmark a single well-prompted agent before adopting multi-agent systems.",
      "Multi-agent architectures introduce a 5x to 15x token multiplier and compound latency.",
      "Use the Supervisor-Worker topology with centralized typed state to prevent ping-pong loops.",
      "Enforce hard turn caps (e.g. max 5-10 turns) and overarching cost budgets.",
      "Instrument distributed tracing with OpenTelemetry GenAI conventions to monitor inter-agent handoffs.",
    ],
    relatedTopics: [
      { title: "AI Agent Fundamentals", moduleId: 5 },
      { title: "Building Agents from Scratch", moduleId: 6 },
      { title: "Workflow Patterns & LangGraph", moduleId: 9 },
      { title: "Observability & Traceability", moduleId: 13 },
    ],
  },
};

