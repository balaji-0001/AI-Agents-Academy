import { FullVisualLesson } from "../visual-curriculum";

export const LESSON_M11_L1: FullVisualLesson = {
  moduleId: 11,
  lessonId: "m11-l1",
  title: "Model Context Protocol (MCP): Architecture, Transports & OAuth 2.1",
  estimatedMinutes: 30,
  level: "Advanced",
  learningObjectives: [
    "Understand why MCP was created: solving the M × N custom integration bottleneck",
    "Master the 3 core MCP primitives: Prompts, Resources, and Tools",
    "Compare stdio transport vs Streamable HTTP, and understand why SSE was deprecated",
    "Implement an MCP Server in Python using FastMCP with typed schemas",
    "Secure MCP deployments with OAuth 2.1 PKCE and RFC 8707 Resource Indicators",
    "Handle long-running operations using the MCP Tasks primitive",
  ],
  simpleExplanation: {
    definition:
      "The Model Context Protocol (MCP) is an open standard created by Anthropic that provides a unified, secure protocol (using JSON-RPC 2.0) for AI models to connect to external data sources, business tools, and developer environments.",
    plainEnglish:
      "Think of MCP as USB-C for AI applications. Before USB-C, every device had a proprietary charging cord and data port. MCP provides a universal plug so any AI agent (Claude, Cursor, custom agents) can connect to any database, Git repo, or internal API without rewriting custom tool code for every single system.",
    whyItMatters:
      "Without a universal protocol, connecting 5 AI clients to 20 internal databases and tools requires building and maintaining 5 × 20 = 100 custom integrations. With MCP, you build 5 clients and 20 servers (5 + 20 = 25 total), saving massive development effort and unifying security audits.",
    practicalExample:
      "A developer using Claude Desktop or an enterprise agent wants to inspect a GitHub pull request, query a production PostgreSQL database, and post a Slack alert. With MCP, the agent connects to three standardized local or remote MCP servers that expose these capabilities securely.",
  },
  analogy: {
    title: "USB-C and Device Drivers",
    story:
      "Before USB, connecting a mouse, printer, joystick, or keyboard required different serial ports, parallel ports, and proprietary drivers. USB standardized hardware communication: you plug in a mouse, the operating system asks what capabilities it has, and immediately uses it. MCP does the exact same thing for AI tools and context.",
    whereItWorks:
      "Accurately captures dynamic capability negotiation (tools/list), uniform message formatting, and decoupling tool providers from AI applications.",
    whereItDiffers:
      "Hardware USB transfers raw electrical bytes. MCP runs over JSON-RPC 2.0 and includes rich capability primitives like prompt templates, readable data resources (URIs), and actionable tools with JSON schemas.",
  },
  problemBeforeSolution: {
    whatWasTried:
      "Every AI framework (LangChain, LlamaIndex, OpenAI Assistant API, Anthropic SDK) invented its own proprietary tool definition format and custom connection wrappers.",
    whySimplerFailed:
      "If you wrote a Postgres tool for LangChain, you had to completely rewrite it for OpenAI Assistants, rewrite it again for Claude Desktop, and rewrite it again for your custom FastAPI backend. Tool code was tightly coupled to model providers.",
    difficultiesEncountered: [
      "M × N integration explosion: every new AI client multiplied integration maintenance",
      "No standard security boundary: credentials had to be shared directly with LLM prompt handlers",
      "No standardized way to dynamically stream tool logs, report progress, or handle asynchronous long-running jobs",
      "Stateful HTTP connections (SSE) failed behind enterprise API gateways and Kubernetes ingress controllers",
    ],
    howConceptSolvesIt:
      "MCP standardizes three foundational primitives (Prompts, Resources, Tools) over standardized transports (stdio for local, Streamable HTTP for remote) with built-in capability negotiation and OAuth 2.1 authorization.",
    remainingLimitations:
      "MCP servers still require strict access control—an untrusted MCP server can execute harmful code or inject prompt exploits into the host agent's context window.",
  },
  diagram: {
    title: "Model Context Protocol (MCP) Host-Client-Server Architecture",
    diagramType: "flowchart",
    source: `flowchart TD
    subgraph Host["Host Application (IDE / Claude Desktop / Agent Gateway)"]
        AgentCore[Agent Orchestrator & LLM]
        MCPClient1[MCP Client 1: Local]
        MCPClient2[MCP Client 2: Remote]
        AgentCore <--> MCPClient1
        AgentCore <--> MCPClient2
    end

    subgraph LocalEnv["Local Operating System Process"]
        MCPClient1 -- "stdio (JSON-RPC 2.0)" --> LocalServer[Local MCP Server: SQLite / Git]
        LocalServer --> LocalFiles[(Local Files & SQLite)]
    end

    subgraph RemoteCloud["Enterprise Cloud Services"]
        MCPClient2 -- "Streamable HTTP (OAuth 2.1 + PKCE)" --> CloudGateway[Cloud MCP Server Gateway]
        CloudGateway --> PermCheck[RFC 8707 Resource Scoping]
        PermCheck --> GitHubAPI[GitHub REST API]
        PermCheck --> PG[(Enterprise Postgres DB)]
    end`,
    explanation: {
      whatComponentsRepresent:
        "The Host holds the user interface and AI model. Inside the Host, lightweight MCP Clients maintain 1:1 connections to MCP Servers. Local servers run as sub-processes over stdio; remote servers run over Streamable HTTP secured with OAuth 2.1.",
      arrowsAndDataFlow:
        "Agent orchestrator queries `tools/list` to discover capabilities, requests `tools/call` when needed, and receives structured JSON-RPC responses.",
      stepSequence:
        "1. Host launches Client -> 2. Client sends `initialize` handshake -> 3. Server replies with capabilities -> 4. Model requests tool execution -> 5. Client dispatches `tools/call` -> 6. Server executes and returns JSON content.",
      failurePoints:
        "If a local server crashes, stdio pipe closes; the Host must detect SIGPIPE and restart the sub-process or degrade gracefully without dropping the chat session.",
    },
  },
  architecture: {
    title: "MCP Transport Architecture Evolution",
    subtitle: "Local stdio vs Deprecated SSE vs Modern Streamable HTTP",
    beginnerView: {
      name: "Local stdio Transport (Development)",
      badge: "Local Subprocess",
      description: "Host spawns the MCP server as a local child process, communicating over stdin/stdout pipes.",
      diagramSource: `flowchart LR
    Host[Host App: Claude / IDE] -- "stdin: JSON-RPC request" --> Subprocess[Python/Node MCP Server]
    Subprocess -- "stdout: JSON-RPC response" --> Host
    Subprocess -. "stderr: Debug logs" .-> HostLog[Host Console Logs]`,
      explanation: {
        whatComponentsRepresent: "Host process creates child process. No network ports, no SSL certificates, no authentication needed because it runs in the user's local security context.",
        arrowsAndDataFlow: "Commands are piped into stdin; responses read from stdout. Unhandled debug prints must go to stderr to prevent corrupting JSON-RPC parsing.",
        stepSequence: "Spawn -> Initialize -> Exchange JSON lines -> Terminate on exit.",
        failurePoints: "A developer writing `print('debugging')` to stdout corrupts the JSON-RPC pipe and crashes the connection.",
      },
      components: [
        { name: "Host Process", type: "orchestrator", role: "Spawns and manages sub-process lifecycle." },
        { name: "stdio Pipes", type: "gateway", role: "Bi-directional newline-delimited text streams." },
        { name: "Local Server", type: "tool", role: "Executes tools with local file/database permissions." },
      ],
    },
    productionView: {
      name: "Streamable HTTP with OAuth 2.1 (Production)",
      badge: "Remote Cloud Scaled",
      description: "Stateless HTTP POST endpoints supporting chunked streaming responses, load balancing, and token-scoped security.",
      diagramSource: `flowchart TD
    Host[AI Agent Host] --> AuthServer[OAuth 2.1 Authorization Server]
    AuthServer -- "Access Token (RFC 8707 Scoped)" --> Host
    Host -- "POST /mcp/v1 (JSON-RPC)" --> LB[AWS ALB / Cloudflare Ingress]
    LB --> Pod1[MCP Server Pod 1]
    LB --> Pod2[MCP Server Pod 2]
    Pod1 --> TasksQueue[(Redis Tasks Queue)]
    Pod1 --> SaaS[Enterprise CRM / SAP]`,
      explanation: {
        whatComponentsRepresent: "OAuth 2.1 issues cryptographically bound tokens with RFC 8707 Resource Indicators. Stateless HTTP POST allows standard Kubernetes load balancers to distribute requests across multiple replicas.",
        arrowsAndDataFlow: "Host requests token, signs HTTP POST request with Bearer header, gateway verifies signature, server streams response.",
        stepSequence: "OAuth PKCE Handshake -> POST /mcp/v1 -> Token Verification -> Tool Execution -> Chunked Streaming Response.",
        failurePoints: "Expired tokens require seamless background refresh without interrupting active agent task streams.",
      },
      components: [
        { name: "OAuth 2.1 Auth Server", type: "security", role: "Authenticates client with PKCE and mints scoped access tokens." },
        { name: "Stateless Ingress", type: "gateway", role: "Standard Layer 7 HTTP load balancer routing requests evenly." },
        { name: "FastMCP Replicas", type: "tool", role: "Horizontally scalable container pods executing tool calls." },
        { name: "Redis Tasks Queue", type: "storage", role: "Tracks state for asynchronous long-running MCP Tasks." },
      ],
    },
  },
  executionTimeline: [
    {
      number: 1,
      title: "Client-Server Handshake (`initialize`)",
      actor: "app",
      description: "Host client initiates connection by sending client protocol version and requested capabilities.",
      input: '{"jsonrpc": "2.0", "id": 1, "method": "initialize", "params": {"protocolVersion": "2024-11-05", "capabilities": {"roots": {}}}}',
      output: '{"jsonrpc": "2.0", "id": 1, "result": {"protocolVersion": "2024-11-05", "capabilities": {"tools": {}, "resources": {}}}}',
    },
    {
      number: 2,
      title: "Tool Discovery (`tools/list`)",
      actor: "tool",
      description: "Client queries the server for all registered tools, their parameters, and JSON schemas.",
      input: '{"jsonrpc": "2.0", "id": 2, "method": "tools/list", "params": {}}',
      output: '{"tools": [{"name": "query_customer", "description": "Look up user by ID", "inputSchema": {...}}]}',
    },
    {
      number: 3,
      title: "Model Decision & Tool Call Request",
      actor: "llm",
      isModelReasoning: true,
      description: "LLM analyzes user query 'Check status for customer C-901', recognizes tool match, and emits structured tool invocation.",
      input: "User query + available MCP tools schema",
      output: '{"name": "query_customer", "arguments": {"customer_id": "C-901"}}',
    },
    {
      number: 4,
      title: "MCP Client Dispatches `tools/call`",
      actor: "app",
      description: "Host client formats JSON-RPC call and sends it over the transport (stdio or Streamable HTTP).",
      input: '{"jsonrpc": "2.0", "id": 3, "method": "tools/call", "params": {"name": "query_customer", "arguments": {"customer_id": "C-901"}}}',
      output: "Dispatched over transport socket",
    },
    {
      number: 5,
      title: "Server Execution & Guardrail Enforcement",
      actor: "tool",
      description: "MCP server validates arguments against Pydantic schema, executes database query, and returns content array.",
      input: 'customer_id: "C-901"',
      output: '{"jsonrpc": "2.0", "id": 3, "result": {"content": [{"type": "text", "text": "Customer C-901: Tier Enterprise, Status Active"}], "isError": false}}',
    },
    {
      number: 6,
      title: "Final Response Generation",
      actor: "llm",
      isModelReasoning: true,
      description: "Model incorporates the ground-truth observation and generates the final natural language answer for the user.",
      input: "Observation: Customer C-901: Tier Enterprise, Status Active",
      output: "'Customer C-901 is currently an active Enterprise-tier account with no outstanding billing issues.'",
    },
  ],
  codeWalkthrough: {
    title: "Production Python MCP Server using FastMCP",
    purpose: "Build a production-grade MCP server exposing typed database query tools with error handling and resource indicators.",
    dependencies: ["python >= 3.10", "mcp >= 1.0.0", "pydantic >= 2.0"],
    code: `from mcp.server.fastmcp import FastMCP
from pydantic import BaseModel, Field
import sys

# 1. Initialize FastMCP server
mcp = FastMCP("EnterpriseCustomerServer")

class CustomerQuery(BaseModel):
    customer_id: str = Field(..., pattern=r"^C-\\d{3,6}$", description="Customer ID matching format C-1234")

class CustomerRecord(BaseModel):
    customer_id: str
    name: str
    plan: str
    is_active: bool

# Mock database
DB = {
    "C-101": CustomerRecord(customer_id="C-101", name="Acme Corp", plan="Enterprise", is_active=True),
    "C-102": CustomerRecord(customer_id="C-102", name="Beta LLC", plan="Starter", is_active=False),
}

# 2. Register Tool with schema validation
@mcp.tool()
def get_customer_details(query: CustomerQuery) -> str:
    """Retrieve verified customer account details from the CRM database."""
    cid = query.customer_id
    if cid not in DB:
        # Return structured error message without crashing the server
        return f"Error: Customer ID '{cid}' not found in database."
    
    record = DB[cid]
    return f"Customer {record.customer_id}: Name={record.name}, Plan={record.plan}, Active={record.is_active}"

# 3. Expose a readable Resource primitive (URI-based)
@mcp.resource("crm://audit-policy")
def get_audit_policy() -> str:
    """Returns the corporate compliance and audit logging policy."""
    return "All customer data queries are logged and retained for 90 days under SOC-2 compliance."

if __name__ == "__main__":
    # Start server over stdio transport
    # IMPORTANT: Never print to stdout directly; FastMCP uses stdout for JSON-RPC
    sys.stderr.write("Starting FastMCP EnterpriseCustomerServer on stdio...\\n")
    mcp.run(transport="stdio")`,
    expectedOutput: `{"jsonrpc": "2.0", "id": 1, "result": {"content": [{"type": "text", "text": "Customer C-101: Name=Acme Corp, Plan=Enterprise, Active=True"}], "isError": false}}`,
    annotations: [
      { lines: "Lines 1-6", explanation: "Imports FastMCP, the modern high-level Python SDK standard for creating MCP servers." },
      { lines: "Lines 8-15", explanation: "Uses Pydantic regex patterns to validate input before the tool logic ever executes." },
      { lines: "Lines 22-31", explanation: "The `@mcp.tool()` decorator automatically generates the JSON-RPC schema and registers it for `tools/list`." },
      { lines: "Lines 34-37", explanation: "Demonstrates the MCP Resource primitive (`crm://`), allowing models to read static or dynamic reference data." },
      { lines: "Lines 42-44", explanation: "Emits debug logs to `stderr`. Printing to `stdout` would break the JSON-RPC frame parser." },
    ],
    commonErrors: [
      {
        error: "Corrupted JSON-RPC pipe: print('Starting...') sends plaintext to stdout",
        fix: "Never call print() in a stdio MCP server! Always write logs to sys.stderr or use logging.getLogger() configured with StreamHandler(sys.stderr).",
      },
      {
        error: "Unbounded tool timeouts during heavy database operations",
        fix: "Implement timeout limits inside tool methods or use the MCP Tasks primitive for asynchronous long-running jobs.",
      },
    ],
  },
  comparison: {
    title: "MCP Transports: stdio vs Streamable HTTP vs Legacy SSE",
    conceptAName: "Streamable HTTP (Modern Remote)",
    conceptBName: "Legacy SSE (Deprecated Remote)",
    summaryA: "Stateless HTTP POST requests with chunked streaming responses. Fully compatible with cloud load balancers and Kubernetes autoscalers.",
    summaryB: "Stateful persistent HTTP GET connection for events paired with a separate HTTP POST channel for client messages.",
    rows: [
      { aspect: "Connection Model", conceptA: "Stateless request/response per operation", conceptB: "Stateful long-lived connection" },
      { aspect: "Load Balancer Compatibility", conceptA: "100% compatible with AWS ALB, NGINX, Cloudflare", conceptB: "Requires sticky sessions; drops on proxy timeouts" },
      { aspect: "Reconnection & Resiliency", conceptA: "Standard HTTP retries with exponential backoff", conceptB: "Complex state reconciliation if connection drops" },
      { aspect: "Horizontal Autoscaling", conceptA: "Trivial: any backend pod can service any request", conceptB: "Difficult: pods hold pinned client state" },
      { aspect: "Security / Auth", conceptA: "Standard Bearer tokens on every HTTP header", conceptB: "Token passing in EventSource headers requires custom hacks" },
    ],
    whenToChooseA: "Mandatory for all production cloud and enterprise remote MCP server deployments.",
    whenToChooseB: "Do not use in new architectures. Only maintain if interfacing with legacy 2024 client prototypes.",
  },
  useCases: [
    {
      title: "Enterprise Multi-Agent Data Gateway",
      industry: "Financial Services",
      goal: "Allow internal Claude Desktop, Cursor, and custom agent instances to query secure financial ledgers without sharing database credentials.",
      userInput: "'Analyze transaction volume anomalies for account AC-882 over the last 48 hours.'",
      componentsInvolved: ["Claude Desktop (Host)", "FastMCP Remote Server", "OAuth 2.1 Server", "Read-Only Postgres Replica"],
      workflowSteps: [
        "Claude Desktop obtains OAuth 2.1 access token with resource indicator `https://mcp.finance.internal`.",
        "MCP Client sends `tools/call` to remote FastMCP server over Streamable HTTP.",
        "Server validates token claims, runs parameterized SQL query against read-only replica.",
        "FastMCP streams JSON-RPC result back to client.",
        "Claude summarizes findings with verified timestamps.",
      ],
      expectedOutput: "'Account AC-882 recorded 14,200 transactions in the last 48 hours (+12% vs 7-day average), with no flagged AML anomalies.'",
      failureScenarios: [
        {
          failure: "OAuth token expires during multi-turn conversation.",
          guardrailFix: "Client catches HTTP 401, triggers PKCE token refresh in background, and retries the tool call transparently.",
        },
      ],
    },
    {
      title: "IDE Codebase & CI/CD Automation Agent",
      industry: "Software Engineering",
      goal: "Empower developer IDEs to run tests, inspect Git history, and deploy preview environments via standardized local MCP tools.",
      userInput: "'Run all unit tests in the auth package and show me failing stack traces.'",
      componentsInvolved: ["Cursor / VSCode Host", "Local Python stdio MCP Server", "Docker Test Runner"],
      workflowSteps: [
        "Host launches local sub-process running `pytest-mcp-server` over stdio.",
        "Agent identifies failing test and uses MCP Resource `git://diff` to view recent edits.",
        "Agent proposes fix and calls `run_tests` tool to verify the patch passes.",
      ],
      expectedOutput: "'All 28 unit tests in tests/auth/ passed successfully after updating JWT expiration handler.'",
      failureScenarios: [
        {
          failure: "Subprocess hangs during test execution.",
          guardrailFix: "Host enforces a 60-second execution deadline on stdio tool calls, killing the hung child process and returning a timeout error.",
        },
      ],
    },
  ],
  mistakesAndBestPractices: {
    mistakes: [
      {
        mistake: "Writing debug logs with print() to stdout in a stdio server",
        whyItHappens: "Developers naturally write `print(data)` to inspect variables during debugging.",
        correctApproach: "Redirect all logs to `sys.stderr` or use Python's `logging` library configured to `sys.stderr`.",
        category: "implementation",
      },
      {
        mistake: "Reusing a single OAuth access token across multiple different remote MCP servers",
        whyItHappens: "Omitting RFC 8707 Resource Indicators allows an untrusted MCP server to replay the token against other protected internal servers.",
        correctApproach: "Always specify the target MCP server URI as the `resource` parameter during OAuth 2.1 token issuance.",
        category: "security",
      },
      {
        mistake: "Exposing destructive tools (e.g., DROP TABLE, git push --force) without human approval",
        whyItHappens: "Assuming the LLM will always exercise good judgement.",
        correctApproach: "Tag destructive tools with explicit confirmation flags requiring human sign-off in the host UI before execution.",
        category: "security",
      },
    ],
    productionChecklist: [
      "Use FastMCP with strict Pydantic schemas for parameter validation",
      "Always write application logging to stderr, reserving stdout exclusively for JSON-RPC frames",
      "Deploy remote servers using Streamable HTTP over TLS 1.3 (avoid legacy stateful SSE)",
      "Secure remote endpoints with OAuth 2.1 PKCE and RFC 8707 Resource Indicators",
      "Implement per-tool execution timeouts (e.g., 10 seconds default) with graceful cancellation",
      "Enforce least-privilege database credentials (read-only connections where applicable)",
    ],
  },
  interviewQuestions: [
    {
      id: "mcp-q1",
      level: "Beginner",
      question: "What problem does the Model Context Protocol (MCP) solve, and how does it differ from vendor-specific tool calling?",
      strongAnswer:
        "MCP solves the M × N integration problem by providing an open, vendor-agnostic standard over JSON-RPC 2.0. Instead of rewriting tool wrappers for every proprietary LLM provider (OpenAI, Anthropic, LangChain), an MCP server is written once and can be consumed by any compliant host or agent. It also standardizes Prompts, Resources, and Tools under one unified protocol.",
      whyItsStrong:
        "Directly addresses the M × N architecture scaling benefit and names the core protocol primitives (Prompts, Resources, Tools).",
      weakAnswer: "It is an Anthropic tool that lets Claude call Python functions.",
      whyItsWeak: "Ignores the open standard aspect, the client-server architecture, and the M × N integration scaling problem.",
      followUp: "What are the three core primitives exposed by an MCP server?",
      companyTag: "Anthropic",
    },
    {
      id: "mcp-q2",
      level: "Intermediate",
      question: "Why has the MCP specification deprecated Server-Sent Events (SSE) in favor of Streamable HTTP for remote servers?",
      strongAnswer:
        "SSE is inherently stateful and asymmetrical—it opens a long-lived GET stream for server events and requires a separate HTTP POST channel for client requests. In enterprise production, this causes severe issues: Kubernetes ingress and cloud load balancers drop long-lived idle connections, sticky sessions prevent horizontal autoscaling, and error handling across split channels is fragile. Streamable HTTP uses standard stateless HTTP POST with chunked streaming responses, working seamlessly with standard load balancers, caching, and retries.",
      whyItsStrong:
        "Provides concrete systems and networking reasoning (load balancing, statefulness, connection drops, ingress proxies).",
      weakAnswer: "Because SSE was older and Streamable HTTP is faster.",
      whyItsWeak: "Vague, doesn't explain the networking or architectural drawbacks of stateful SSE in cloud environments.",
      followUp: "How does Streamable HTTP handle bi-directional streaming during long-running tasks?",
      companyTag: "Datadog",
    },
    {
      id: "mcp-q3",
      level: "Advanced",
      question: "Explain the security risks of tool poisoning in MCP and how RFC 8707 Resource Indicators mitigate token replay attacks.",
      strongAnswer:
        "Tool poisoning occurs when a malicious or compromised MCP server returns crafted tool descriptions or prompt injections designed to hijack the host agent's reasoning. For authorization, if an agent uses a generic OAuth token to call Server A, a malicious Server A could replay that token against Server B (e.g. internal financial records). RFC 8707 Resource Indicators require the client to specify the exact target resource URI when requesting the token. The authorization server bakes the audience into the JWT, so Server B rejects any token minted for Server A.",
      whyItsStrong:
        "Demonstrates deep knowledge of both AI application security (prompt/tool poisoning) and enterprise OAuth security (audience-restricted tokens).",
      weakAnswer: "You just use API keys and put them in your environment variables.",
      whyItsWeak: "Fails to address multi-tenant token replay, audience restrictions, or RFC standards.",
      followUp: "What is the MCP Tasks primitive and when should it be used over synchronous tool execution?",
      companyTag: "Stripe",
    },
  ],
  interactiveQuiz: [
    {
      id: "mcp-quiz-1",
      question: "Which transport protocol should be chosen when deploying a scalable, remote cloud-hosted MCP server?",
      options: [
        "Local stdio subprocess pipes",
        "Streamable HTTP over TLS with OAuth 2.1",
        "Legacy stateful Server-Sent Events (SSE)",
        "Raw unencrypted WebSockets",
      ],
      correctIndex: 1,
      explanation:
        "Streamable HTTP is the modern standard for remote MCP servers, enabling stateless load balancing, standard authentication headers, and horizontal autoscaling.",
    },
    {
      id: "mcp-quiz-2",
      question: "Why will calling `print('Debug message')` crash a Python MCP server running on `stdio`?",
      options: [
        "Python prints consume too much CPU memory",
        "print() writes to stdout, which corrupts the JSON-RPC message frames consumed by the host",
        "The MCP client automatically terminates any process that writes to console",
        "print() is deprecated in Python 3.12",
      ],
      correctIndex: 1,
      explanation:
        "In a stdio MCP server, stdout is strictly reserved for JSON-RPC 2.0 communication. Writing raw text to stdout corrupts the message stream. Logs must be directed to stderr.",
    },
  ],
  exerciseChallenge: {
    exercise: {
      title: "Build a FastMCP Calculator Server with Schema Validation",
      instructions:
        "Write a minimal FastMCP server that registers a 'calculate_bmi' tool taking height (meters) and weight (kg), with input validation preventing non-positive numbers.",
      starterCode: `from mcp.server.fastmcp import FastMCP
from pydantic import BaseModel, Field

mcp = FastMCP("HealthTools")

# TODO: Define BMIInput with validation and register calculate_bmi tool
`,
      solutionHint: `from mcp.server.fastmcp import FastMCP
from pydantic import BaseModel, Field

mcp = FastMCP("HealthTools")

class BMIInput(BaseModel):
    weight_kg: float = Field(..., gt=0, description="Weight in kilograms")
    height_m: float = Field(..., gt=0, description="Height in meters")

@mcp.tool()
def calculate_bmi(data: BMIInput) -> str:
    """Calculate Body Mass Index given height and weight."""
    bmi = data.weight_kg / (data.height_m ** 2)
    return f"Calculated BMI: {bmi:.2f}"

if __name__ == "__main__":
    mcp.run(transport="stdio")`,
    },
    debuggingChallenge: {
      title: "The Corrupted JSON-RPC Stream",
      symptom:
        "Claude Desktop reports: 'Failed to parse JSON-RPC response from local MCP server' immediately after invocation.",
      buggyCode: `from mcp.server.fastmcp import FastMCP

mcp = FastMCP("DevServer")

@mcp.tool()
def sync_repo(repo_name: str) -> str:
    # BUG: stdout print statement!
    print(f"[DEBUG] Starting sync for {repo_name}...")
    return f"Repo {repo_name} synchronized successfully."

if __name__ == "__main__":
    mcp.run(transport="stdio")`,
      explanation:
        "`print()` outputs directly to `sys.stdout`. In a stdio MCP server, the host process expects only valid JSON-RPC frames on stdout. The string `[DEBUG] Starting sync...` breaks JSON parsing.",
      correctedCode: `from mcp.server.fastmcp import FastMCP
import sys

mcp = FastMCP("DevServer")

@mcp.tool()
def sync_repo(repo_name: str) -> str:
    # Fix: Route logs to stderr
    sys.stderr.write(f"[DEBUG] Starting sync for {repo_name}...\\n")
    return f"Repo {repo_name} synchronized successfully."

if __name__ == "__main__":
    mcp.run(transport="stdio")`,
    },
    revisionSummary: [
      "MCP solves the M × N integration bottleneck by providing a universal JSON-RPC 2.0 protocol.",
      "The 3 core MCP primitives are Prompts (reusable templates), Resources (readable data URIs), and Tools (executable functions).",
      "Use stdio for local child processes; use Streamable HTTP for remote cloud deployments.",
      "Never print to stdout in stdio mode—always route diagnostics to stderr.",
      "Protect remote deployments with OAuth 2.1 PKCE and RFC 8707 Resource Indicators.",
    ],
    relatedTopics: [
      { title: "AI Agent Fundamentals", moduleId: 5 },
      { title: "Building Agents from Scratch", moduleId: 6 },
      { title: "Observability & Traceability", moduleId: 13 },
      { title: "Agent Safety & Guardrails", moduleId: 15 },
    ],
  },
};

