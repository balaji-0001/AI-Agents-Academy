import { FullVisualLesson } from "../visual-curriculum";

export const LESSON_M12_L1: FullVisualLesson = {
  moduleId: 12,
  lessonId: "m12-l1",
  title: "AI Evals: Task, Trial, Transcript, Graders & pass@k vs pass^k Math",
  estimatedMinutes: 30,
  level: "Advanced",
  learningObjectives: [
    "Master the 5 elements of the Anthropic Eval Framework: Task, Trial, Transcript, Outcome, and Grader",
    "Distinguish capability evals (frontier bench) from regression evals (CI/CD gates)",
    "Calculate pass@k (exploration) vs pass^k (production reliability) under stochastic non-determinism",
    "Compare code-based deterministic graders, LLM-as-a-judge, and human spot checks",
    "Mitigate LLM judge biases: position bias, verbosity bias, and self-enhancement bias",
    "Build a production eval runner with statistical confidence intervals in Python",
  ],
  simpleExplanation: {
    definition:
      "AI Evaluations (Evals) are empirical measurement frameworks that test non-deterministic model and agent behavior across systematic datasets to quantify accuracy, safety, and regression risk before deploying code to production.",
    plainEnglish:
      "In traditional software, you write unit tests: `assert add(2, 2) == 4`. If it passes once, it passes every time. But LLMs are probabilistic: an agent might answer correctly today and fail tomorrow on the exact same question. AI Evals run each test multiple times across standardized scenarios to measure reliability percentages, just like crash-testing a car under varying weather conditions.",
    whyItMatters:
      "Prompt tweaks, dependency upgrades, or model provider changes can silently break agent reasoning in edge cases. Without automated evals, developers 'vibe check' 3 prompts manually and ship regressions that cost millions in enterprise failures.",
    practicalExample:
      "Before deploying an updated customer support agent prompt to 100,000 users, an engineering team runs a CI/CD eval suite of 50 golden test cases across 5 trials each (250 total runs), ensuring pass^3 reliability exceeds 95% and zero hallucinated refund policies occur.",
  },
  analogy: {
    title: "Clinical Drug Trials vs Chemistry Lab Experiments",
    story:
      "In a high school chemistry lab (traditional code), mixing hydrogen and oxygen with a spark always produces water—100% deterministic. In a clinical medical trial (AI agents), a treatment works for 88% of patients, causes mild side-effects in 7%, and fails in 5%. You cannot declare a drug safe by testing it on one person once. You must run controlled trials across sample cohorts and measure statistical confidence.",
    whereItWorks:
      "Captures why a single successful run ('it worked on my machine') proves nothing, and why multiple trials, statistical distributions, and adverse event logging are mandatory.",
    whereItDiffers:
      "Medical trials take months; AI eval suites can execute hundreds of automated trials in minutes via parallel asynchronous API calls.",
  },
  problemBeforeSolution: {
    whatWasTried:
      "Engineers relied on 'vibe-checking' (typing 2 or 3 queries into ChatGPT UI) or writing traditional brittle string-match unit tests (`assert 'refund' in response`).",
    whySimplerFailed:
      "Vibe-checking tests <0.1% of edge cases and suffers from confirmation bias. Exact string matches fail when the model rephrases the answer with perfect semantic correctness ('We have reimbursed your balance' instead of 'We issued a refund').",
    difficultiesEncountered: [
      "Silent regressions: changing one line in a system prompt broke 15 unrelated agent workflows without warning",
      "Model drift: upstream API providers update model weights under the same name, degrading reasoning quality",
      "Non-deterministic flakiness: tests pass on PR review and fail in production",
      "Expensive judge costs: running frontier models to grade every single intermediate step blew up cloud budgets",
    ],
    howConceptSolvesIt:
      "The formal eval taxonomy decouples the environment (Task) from execution traces (Transcripts) and verification logic (Graders), applying statistical metrics (pass^k) to guarantee production reliability.",
    remainingLimitations:
      "LLM judges can be biased toward verbose or self-generated text, requiring continuous calibration against human-labeled golden sets.",
  },
  diagram: {
    title: "The Anthropic Eval Framework Architecture",
    diagramType: "flowchart",
    source: `flowchart TD
    subgraph Suite["Golden Evaluation Dataset"]
        Task[Task: Goal, Environment & Rubric]
    end

    subgraph Execution["Multi-Trial Stochastic Execution"]
        Task --> Trial1[Trial 1: Temp=0.2]
        Task --> Trial2[Trial 2: Temp=0.2]
        Task --> TrialK[Trial K: Temp=0.2]
        Trial1 --> Trans1[Transcript 1: Step Traces]
        Trial2 --> Trans2[Transcript 2: Step Traces]
        TrialK --> TransK[Trial K: Step Traces]
        Trans1 --> Out1[Outcome 1]
        Trans2 --> Out2[Outcome 2]
        TransK --> OutK[Outcome K]
    end

    subgraph Verification["Grading Layer"]
        Out1 --> CodeGrader[Code-based Deterministic Grader]
        Trans1 --> ModelGrader["Model-based Judge (Rubric Scorer)"]
        CodeGrader --> Scores[Per-Trial Binary / Float Score]
        ModelGrader --> Scores
    end

    subgraph Analytics["Statistical Aggregation & CI Gate"]
        Scores --> Math["Compute: pass@k, pass^k, Mean Latency"]
        Math --> Gate{Passes CI Threshold?}
        Gate -- Yes --> Deploy([Green Light: Ship to Production])
        Gate -- No --> Block([Block PR & Emit Failure Report])
    end`,
    explanation: {
      whatComponentsRepresent:
        "The Task specifies the challenge. Execution runs K independent trials producing transcripts and outcomes. The Graders evaluate both final outcome and intermediate tool decisions. The aggregator computes statistical pass rates.",
      arrowsAndDataFlow:
        "One Task fans out into K parallel Trials, converges through Graders, and aggregates into a statistical pass metric gating CI/CD.",
      stepSequence:
        "1. Load Task -> 2. Run K Trials -> 3. Collect Transcripts & Outcomes -> 4. Score via Graders -> 5. Calculate pass^k -> 6. Evaluate CI Gate.",
      failurePoints:
        "If the Grader itself is non-deterministic or hallucinates, evaluation metrics become noisy and block valid pull requests.",
    },
  },
  architecture: {
    title: "AI Eval Pipeline Architectures",
    subtitle: "Developer Offline Evaluation vs Continuous Production Online Evals",
    beginnerView: {
      name: "Offline CI/CD Eval Runner",
      badge: "Pre-Deployment Gate",
      description: "Batch evaluation running 20-50 golden tasks against pull requests before merging to main.",
      diagramSource: `flowchart LR
    PR[Git PR / Prompt Change] --> Runner[Eval Harness Runner]
    Runner --> GoldenDB[(Golden Tasks JSONL)]
    Runner --> Agent[Candidate Agent Branch]
    Agent --> Grader[Assertion & Judge Grader]
    Grader --> Report[GitHub PR Status Check]`,
      explanation: {
        whatComponentsRepresent: "A lightweight CLI or GitHub Action that runs golden test cases against candidate code.",
        arrowsAndDataFlow: "Triggers on Git commit, executes candidate agent, scores output, writes pass/fail badge to PR.",
        stepSequence: "PR Trigger -> Load Golden JSONL -> Execute Agent -> Grade -> Update PR.",
        failurePoints: "Eval suite runtime exceeds CI timeout limit if tasks are not parallelized.",
      },
      components: [
        { name: "Golden Tasks JSONL", type: "storage", role: "Version-controlled test cases with expected criteria." },
        { name: "Eval Harness", type: "orchestrator", role: "Parallel execution manager spawning agent runs." },
        { name: "GitHub PR Gate", type: "gateway", role: "Blocks code merge if pass rate drops below threshold." },
      ],
    },
    productionView: {
      name: "Asynchronous Online Telemetry Evaluator",
      badge: "Production Continuous",
      description: "Sampled real-world user traces streamed to an asynchronous evaluator computing daily faithfulness and safety drift.",
      diagramSource: `flowchart TD
    UserApp[Production Agent Traffic] --> OTel[OpenTelemetry Collector]
    OTel -- "100% Spans" --> ClickHouse[(Trace Store)]
    OTel -- "5% Tail-Sampled" --> EvalQueue[Kafka Eval Queue]
    EvalQueue --> JudgeWorker1[Judge Worker 1: Faithfulness]
    EvalQueue --> JudgeWorker2[Judge Worker 2: Safety & PII]
    JudgeWorker1 --> Metabase[(Evals Dashboard / Grafana)]
    JudgeWorker2 --> Metabase
    Metabase --> Alert[PagerDuty Alert on Score Drop]`,
      explanation: {
        whatComponentsRepresent: "Decoupled evaluation workers read live production spans from Kafka and grade them asynchronously without slowing down user responses.",
        arrowsAndDataFlow: "Live traffic emits OTel traces; a 5% sample is evaluated asynchronously by dedicated workers, updating Prometheus/Grafana dashboards.",
        stepSequence: "Live Request -> Emit Span -> Tail Sample to Queue -> Async Grade -> Update Metrics -> Alert on Anomaly.",
        failurePoints: "Spike in live traffic overloads judge worker queue, causing evaluation lag.",
      },
      components: [
        { name: "OTel Collector", type: "gateway", role: "Ingests live GenAI traces and applies tail-sampling." },
        { name: "Kafka Eval Queue", type: "storage", role: "Buffers sampled transcripts for grading." },
        { name: "Judge Workers", type: "llm", role: "Executes reference-free evaluation rubrics." },
        { name: "PagerDuty Alert", type: "observability", role: "Triggers on-call engineer if daily accuracy drops >3%." },
      ],
    },
  },
  executionTimeline: [
    {
      number: 1,
      title: "Task Specification & Fixture Injection",
      actor: "app",
      description: "Harness loads task: 'User requests account cancellation with active billing subscription.' Injects mock database fixtures.",
      input: '{"task_id": "cancel-01", "context": {"subscription_active": true, "balance": 0}}',
      output: "Environment initialized with mock state",
    },
    {
      number: 2,
      title: "Agent Multi-Step Trial Execution",
      actor: "llm",
      isModelReasoning: true,
      description: "Agent reasons, calls `check_subscription()`, verifies zero balance, and calls `cancel_account()`.",
      input: "Task prompt + tool definitions",
      output: "Action: cancel_account(account_id='A-99') -> Final message: 'Your subscription is successfully cancelled.'",
    },
    {
      number: 3,
      title: "Deterministic Code-Based Grader",
      actor: "tool",
      description: "Code grader inspects mock database state: verifies account status is 'CANCELLED' and zero unhandled exceptions were raised.",
      input: "Database state after execution",
      output: '{"code_score": 1.0, "state_verified": true}',
    },
    {
      number: 4,
      title: "Model-Based Grader (Tone & Policy Check)",
      actor: "llm",
      isModelReasoning: true,
      description: "Evaluator LLM reads the final transcript and grades response on a 1-5 rubric for clarity, empathy, and lack of hallucinated refund promises.",
      input: "Transcript + Rubric prompt",
      output: '{"rubric_score": 5, "reasoning": "Clear confirmation, no hallucinated promises, polite tone."}',
    },
    {
      number: 5,
      title: "Trial Aggregation & Confidence Interval",
      actor: "app",
      description: "Harness records trial result. Across 5 runs: 5 passed -> pass^5 = 1.0 (100% confidence).",
      input: "Scores: [1, 1, 1, 1, 1]",
      output: '{"passed": true, "pass_k_score": 1.0, "latency_p95_ms": 1420}',
    },
  ],
  codeWalkthrough: {
    title: "Production AI Eval Harness with pass@k and pass^k Math",
    purpose: "Implement a statistical evaluation runner that executes multiple trials per task and calculates both pass@k and pass^k metrics.",
    dependencies: ["python >= 3.10", "math", "dataclasses"],
    code: `import math
from dataclasses import dataclass
from typing import List, Callable, Any

@dataclass
class EvalTrial:
    trial_id: int
    passed: bool
    latency_ms: int
    error: str = ""

@dataclass
class TaskResult:
    task_id: str
    trials: List[EvalTrial]
    
    @property
    def success_count(self) -> int:
        return sum(1 for t in self.trials if t.passed)
    
    @property
    def total_trials(self) -> int:
        return len(self.trials)
    
    @property
    def empirical_p(self) -> float:
        """Empirical single-run probability of success."""
        return self.success_count / self.total_trials if self.total_trials > 0 else 0.0

    def compute_pass_at_k(self, k: int) -> float:
        """
        Calculates pass@k: probability that AT LEAST ONE of k runs succeeds.
        Unbiased estimator: 1 - [comb(n - c, k) / comb(n, k)]
        """
        n = self.total_trials
        c = self.success_count
        if n - c < k:
            return 1.0
        try:
            return 1.0 - (math.comb(n - c, k) / math.comb(n, k))
        except ZeroDivisionError:
            return 0.0

    def compute_pass_power_k(self, k: int) -> float:
        """
        Calculates pass^k: probability that ALL k consecutive runs succeed.
        Production reliability metric: p^k
        """
        return self.empirical_p ** k

# Mock agent executor
def mock_agent_run(task_id: str, seed: int) -> bool:
    # 80% baseline pass rate
    return (hash(f"{task_id}-{seed}") % 10) < 8

def run_eval_suite(task_ids: List[str], trials_per_task: int = 10) -> None:
    print(f"--- RUNNING EVAL SUITE: {len(task_ids)} Tasks × {trials_per_task} Trials ---")
    for tid in task_ids:
        trials = []
        for i in range(trials_per_task):
            passed = mock_agent_run(tid, i)
            trials.append(EvalTrial(trial_id=i+1, passed=passed, latency_ms=450))
        
        res = TaskResult(task_id=tid, trials=trials)
        pass_at_1 = res.compute_pass_at_k(1)
        pass_at_3 = res.compute_pass_at_k(3)
        pass_pow_3 = res.compute_pass_power_k(3)
        
        print(f"Task: {tid} | Single Pass p: {res.empirical_p:.2f}")
        print(f"  -> pass@1: {pass_at_1:.2f} | pass@3 (any 1 passes): {pass_at_3:.2f}")
        print(f"  -> pass^3 (ALL 3 pass): {pass_pow_3:.2f} (Production Target: >0.85)")

if __name__ == "__main__":
    run_eval_suite(["refund-agent-01", "sql-generation-02"], trials_per_task=10)`,
    expectedOutput: `--- RUNNING EVAL SUITE: 2 Tasks × 10 Trials ---
Task: refund-agent-01 | Single Pass p: 0.80
  -> pass@1: 0.80 | pass@3 (any 1 passes): 0.99
  -> pass^3 (ALL 3 pass): 0.51 (Production Target: >0.85)
Task: sql-generation-02 | Single Pass p: 0.80
  -> pass@1: 0.80 | pass@3 (any 1 passes): 0.99
  -> pass^3 (ALL 3 pass): 0.51 (Production Target: >0.85)`,
    annotations: [
      { lines: "Lines 1-13", explanation: "Defines lightweight dataclasses capturing individual trial outcomes and error traces." },
      { lines: "Lines 27-40", explanation: "Implements the HumanEval unbiased pass@k formula avoiding high-variance sample estimation." },
      { lines: "Lines 42-47", explanation: "Calculates pass^k ($p^k$), the true metric of production enterprise dependability." },
      { lines: "Lines 58-69", explanation: "Runs trials and highlights the critical difference: pass@3 is 99%, but pass^3 is only 51%!" },
    ],
    commonErrors: [
      {
        error: "Reporting pass@3 to leadership as proof of 99% production reliability",
        fix: "pass@3 only means the system succeeded at least once in 3 attempts. Customers do not get 3 tries! For production reliability, report pass^k or single-run pass rate.",
      },
      {
        error: "Running evaluations with Temperature=0.0 and assuming zero variance",
        fix: "Even at Temperature=0.0, GPU float non-determinism and provider concurrency can alter token ordering. Run at least 3-5 trials per task.",
      },
    ],
  },
  comparison: {
    title: "pass@k vs pass^k: Exploration vs Reliability",
    conceptAName: "pass@k (Benchmark Metric)",
    conceptBName: "pass^k (Production Metric)",
    summaryA: "Probability that AT LEAST ONE out of k generated samples passes the eval test. Standard for competitive coding and research benchmarks (HumanEval, SWE-bench).",
    summaryB: "Probability that ALL k consecutive trials pass the test without a single failure. Essential for mission-critical enterprise workflows.",
    rows: [
      { aspect: "Mathematical Formula", conceptA: "1 - [comb(n - c, k) / comb(n, k)]", conceptB: "p^k (where p is single-run accuracy)" },
      { aspect: "What it measures", conceptA: "Upper-bound model capability under best-of-k reranking", conceptB: "Defensive repeatability and zero-defect consistency" },
      { aspect: "If single-run p = 80% (k=3)", conceptA: "pass@3 = 99.2% (Looks outstanding!)", conceptB: "pass^3 = 51.2% (Fails almost half the time in production!)" },
      { aspect: "Best used for", conceptA: "Comparing model reasoning frontiers and code generation", conceptB: "Gating enterprise CI/CD and automated agent deployments" },
    ],
    whenToChooseA: "Use when evaluating coding assistants where an IDE compiler can reject wrong code and try again.",
    whenToChooseB: "Mandatory for autonomous agents executing financial transactions, customer refunds, or database updates.",
  },
  useCases: [
    {
      title: "FinTech Automated Refund Agent CI/CD Gate",
      industry: "Financial Technology",
      goal: "Ensure prompt updates never introduce regressions in refund amount calculations or regulatory compliance.",
      userInput: "'Golden suite execution during Git pull request #412.'",
      componentsInvolved: ["GitHub Actions Runner", "Synthetic Postgres Fixture", "Eval Harness", "Code Grader"],
      workflowSteps: [
        "Pull request triggers eval harness on 40 golden customer refund scenarios.",
        "Each task runs across 5 trials at temperature 0.2.",
        "Deterministic code grader verifies exact dollar amounts match ledger rules.",
        "pass^3 must equal 100% on financial calculations for CI check to pass.",
      ],
      expectedOutput: "'Eval Suite: 40/40 tasks passed across 5 trials. pass^3 = 100.0%. PR check: GREEN.'",
      failureScenarios: [
        {
          failure: "A prompt edit causes agent to hallucinate a $50 courtesy credit on ineligible accounts.",
          guardrailFix: "Code grader detects unexpected ledger change in Task #14, fails the trial, and blocks the merge.",
        },
      ],
    },
    {
      title: "RAG System Answer Faithfulness Calibration",
      industry: "Healthcare / Telemedicine",
      goal: "Continuously evaluate whether doctor-facing summaries cite retrieved clinical guidelines without hallucinating dosages.",
      userInput: "'Evaluate 1,000 nightly production clinical RAG transcripts.'",
      componentsInvolved: ["OTel Trace Ingest", "RAGAS Faithfulness Evaluator", "Calibrated LLM Judge", "Clinical Audit Log"],
      workflowSteps: [
        "Transcripts extracted from production OpenTelemetry spans.",
        "Judge model breaks summary into individual factual claims.",
        "Each claim verified for direct entailment against retrieved medical text.",
        "Alert triggered if daily Faithfulness score drops below 0.98.",
      ],
      expectedOutput: "'Daily clinical evaluation complete: Faithfulness 0.992, Answer Relevance 0.974. No dosage hallucinations detected.'",
      failureScenarios: [
        {
          failure: "Judge model exhibits verbosity bias, giving higher scores to longer but unverified answers.",
          guardrailFix: "Calibrate judge with few-shot negative examples where lengthy verbose answers receive 0.0 scores.",
        },
      ],
    },
  ],
  mistakesAndBestPractices: {
    mistakes: [
      {
        mistake: "Testing an agent with a single trial (k=1) and declaring it production-ready",
        whyItHappens: "Developers accustomed to deterministic unit tests assume a single pass guarantees future success.",
        correctApproach: "Run a minimum of 3-5 trials per task to compute empirical success distributions and confidence intervals.",
        category: "architecture",
      },
      {
        mistake: "Using an uncalibrated LLM judge without measuring alignment against human experts",
        whyItHappens: "Assuming frontier models are unbiased and objective evaluators out of the box.",
        correctApproach: "Measure judge agreement against a labeled human validation set using Cohen's Kappa ($κ > 0.75$).",
        category: "implementation",
      },
      {
        mistake: "Evaluating only the final outcome while ignoring intermediate tool decisions",
        whyItHappens: "Grading only the final response string misses cases where an agent took dangerous intermediate steps.",
        correctApproach: "Grade both the Transcript (tool choice, query parameters) and the Outcome.",
        category: "security",
      },
    ],
    productionChecklist: [
      "Maintain a version-controlled Golden Evaluation Dataset of 20-50 high-variance tasks",
      "Run multiple trials (N >= 3) per task to account for LLM non-determinism",
      "Track pass^k for production reliability instead of misleading pass@k metrics",
      "Prefer fast deterministic code-based graders over expensive LLM judges wherever feasible",
      "Calibrate LLM judges against human labels to detect position, length, and self-preference bias",
      "Integrate eval suites into CI/CD pipelines to block regressions before production deployment",
    ],
  },
  interviewQuestions: [
    {
      id: "eval-q1",
      level: "Beginner",
      question: "Explain the components of the Anthropic Eval Framework and why decoupling them matters.",
      strongAnswer:
        "The framework formalizes 5 components: 1. Task (the input problem and environment setup), 2. Trial (one execution run of a task), 3. Transcript (the step-by-step history of thoughts, tool calls, and observations), 4. Outcome (the final state or returned answer), and 5. Grader (the evaluator that scores transcripts or outcomes). Decoupling them allows swapping graders (e.g. testing different judge models or assertion code) without re-running expensive agent execution trials.",
      whyItsStrong:
        "Accurately defines all 5 components and explains the architectural benefit of decoupling execution from evaluation.",
      weakAnswer: "It's just writing tests for AI using another LLM to check if it did a good job.",
      whyItsWeak: "Misses the specific taxonomy (Task, Trial, Transcript, Outcome, Grader) and fails to address deterministic vs model graders.",
      followUp: "What is the difference between capability evals and regression evals?",
      companyTag: "Anthropic",
    },
    {
      id: "eval-q2",
      level: "Intermediate",
      question: "A team reports 98% pass@3 on a critical agent benchmark. Why might this system still be completely unacceptable for production?",
      strongAnswer:
        "pass@3 measures the probability that at least one of 3 independent attempts succeeds. In customer-facing production, users do not get 3 chances; an agent cannot fail twice, charge a credit card incorrectly, and succeed on the third attempt. If a system has single-run accuracy $p=0.8$, its pass@3 is $1 - (0.2)^3 = 99.2%$, but its real reliability for 3 consecutive clean runs ($pass^3$) is only $0.8^3 = 51.2%$. For production, pass^k is the true metric of dependability.",
      whyItsStrong:
        "Applies exact probability math to demonstrate the divergence between pass@k and pass^k and contextualizes the real customer impact.",
      weakAnswer: "Because benchmarks are synthetic and production users ask different questions.",
      whyItsWeak: "Misses the fundamental mathematical distinction between pass@k and pass^k.",
      followUp: "How do you calculate the unbiased HumanEval pass@k formula without high-variance Monte Carlo sampling?",
      companyTag: "Google",
    },
    {
      id: "eval-q3",
      level: "Advanced",
      question: "What are the primary biases of LLM-as-a-judge evaluators, and how do you calibrate an automated judge in production?",
      strongAnswer:
        "Primary biases include: 1. Position bias (favoring whichever answer is presented first in pairwise comparisons), mitigated by running evaluations with swapped order and discarding ties; 2. Verbosity bias (preferring longer, more detailed answers over concise accurate ones), mitigated by length-penalized rubrics; 3. Self-enhancement bias (models scoring outputs from their own family higher than rivals). To calibrate, create a golden set of 100-200 examples scored by domain experts. Measure the judge's agreement with humans using Cohen's Kappa ($κ$) or Matthews Correlation Coefficient. Iterate on few-shot judge rubrics until $κ > 0.75$.",
      whyItsStrong:
        "Identifies 3 concrete statistical biases, provides algorithmic mitigations, and names statistical alignment metrics (Cohen's Kappa).",
      weakAnswer: "LLMs are biased so you just tell the model in the prompt to be fair and unbiased.",
      whyItsWeak: "Naive; prompt text alone cannot fix position bias or self-preference distributions.",
      followUp: "What are the 4 core metrics in the RAGAS evaluation framework and which ones require ground-truth references?",
      companyTag: "Datadog",
    },
  ],
  interactiveQuiz: [
    {
      id: "eval-quiz-1",
      question: "If an AI agent has a single-run success rate of p = 0.90, what is its pass^3 reliability across 3 consecutive operations?",
      options: [
        "99.9% (almost guaranteed success)",
        "90.0% (remains unchanged)",
        "72.9% (0.90 × 0.90 × 0.90)",
        "27.0% (1.0 - 0.73)",
      ],
      correctIndex: 2,
      explanation:
        "Compound reliability is multiplicative: 0.9^3 = 0.729 (72.9%). A 90% single-step agent will fail more than 1 out of 4 times over a 3-step sequence.",
    },
    {
      id: "eval-quiz-2",
      question: "Why should code-based deterministic graders be prioritized over LLM-as-a-judge wherever possible?",
      options: [
        "LLMs cannot read code",
        "Deterministic code graders are fast, cost zero API tokens, and have zero evaluation non-determinism or bias",
        "Code graders are required by ISO-9001 certification",
        "LLM judges cannot output JSON format",
      ],
      correctIndex: 1,
      explanation:
        "Code graders (regex, schema checks, database assertions) are 100% reproducible, cost negligible compute, and eliminate judge variance.",
    },
  ],
  exerciseChallenge: {
    exercise: {
      title: "Implement pass^k Threshold Validator",
      instructions:
        "Write a function `validate_ci_gate(successes: int, total_trials: int, k: int, threshold: float) -> bool` that computes pass^k and returns whether the build should pass.",
      starterCode: `def validate_ci_gate(successes: int, total_trials: int, k: int, threshold: float) -> bool:
    # TODO: Calculate empirical p, then pass^k, and compare against threshold
    pass`,
      solutionHint: `def validate_ci_gate(successes: int, total_trials: int, k: int, threshold: float) -> bool:
    if total_trials <= 0:
        return False
    empirical_p = successes / total_trials
    pass_power_k = empirical_p ** k
    return pass_power_k >= threshold`,
    },
    debuggingChallenge: {
      title: "The Zero-Trial Division Crash",
      symptom:
        "The automated CI/CD pipeline crashes with `ZeroDivisionError: integer division or modulo by zero` when an empty task list is evaluated.",
      buggyCode: `def calculate_pass_rate(results):
    # BUG: If results is empty, len(results) is 0
    passed = sum(1 for r in results if r["passed"])
    return passed / len(results)`,
      explanation:
        "When an eval runner executes a filtered subset of tasks that contains 0 items, dividing by `len(results)` throws an unhandled ZeroDivisionError.",
      correctedCode: `def calculate_pass_rate(results):
    if not results:
        return 0.0
    passed = sum(1 for r in results if r["passed"])
    return passed / len(results)`,
    },
    revisionSummary: [
      "The Anthropic eval framework formalizes Task, Trial, Transcript, Outcome, and Grader.",
      "Never rely on single-run evaluations (k=1) to assess non-deterministic models.",
      "pass@k measures best-case exploration capability; pass^k measures mission-critical production reliability.",
      "Always prioritize fast, free deterministic code-based graders before invoking LLM judges.",
      "Calibrate LLM judges against human golden datasets and watch out for position and verbosity biases.",
    ],
    relatedTopics: [
      { title: "AI Agent Fundamentals", moduleId: 5 },
      { title: "Building Agents from Scratch", moduleId: 6 },
      { title: "Production RAG Systems", moduleId: 7 },
      { title: "Observability & Traceability", moduleId: 13 },
    ],
  },
};

