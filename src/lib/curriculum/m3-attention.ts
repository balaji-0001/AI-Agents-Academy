import { FullVisualLesson } from "../visual-curriculum";

export const LESSON_M3_L3: FullVisualLesson = {
  moduleId: 3,
  lessonId: "m3-l3",
  title: "Scaled Dot-Product Attention: QKV, sqrt(d_k) Derivation & KV Cache Math",
  estimatedMinutes: 35,
  level: "Beginner",
  learningObjectives: [
    "Understand the Query, Key, and Value (QKV) mental model via search engine retrieval",
    "Derive mathematically why scaling by sqrt(d_k) prevents vanishing gradients in Softmax",
    "Implement numerically stable Scaled Dot-Product Attention in Python with NumPy",
    "Calculate exact KV-Cache memory consumption: 2 × layers × heads × dim × context × batch × precision",
    "Compare Multi-Head Attention (MHA), Multi-Query Attention (MQA), and Grouped-Query Attention (GQA)",
  ],
  simpleExplanation: {
    definition:
      "Scaled Dot-Product Attention is the foundational mathematical engine of the Transformer architecture that computes a weighted average of Value vectors according to the cosine compatibility between Query and Key vectors, scaled by the square root of the head dimension.",
    plainEnglish:
      "Imagine you are in a library searching for books on 'quantum computing'. Your search phrase is the Query (Q). Every book in the library has an index card with title keywords—that is the Key (K). You compare your Query against all Keys to assign a relevance score to each book. Then you open the most relevant books and read the actual contents—those are the Values (V).",
    whyItMatters:
      "Before Attention, recurrent neural networks (RNNs) processed words one by one in a linear chain, forgetting earlier words in long sentences. Attention lets every word directly connect to every other word in the entire document in a single parallel matrix operation.",
    practicalExample:
      "In the sentence 'The animal didn't cross the street because it was too tired', the word 'it' attends strongly to 'animal' rather than 'street'. Scaled dot-product attention computes this relationship through high dot-product scores between the Query for 'it' and the Key for 'animal'.",
  },
  analogy: {
    title: "YouTube Video Search and Streaming",
    story:
      "When you type 'how to bake sourdough' into YouTube: 1. Your search text is the Query. 2. YouTube compares your query against video titles and tags—the Keys. 3. It calculates relevance scores across millions of videos and normalizes them into a ranking (Softmax). 4. Finally, it streams the actual video pixels to your screen—the Values.",
    whereItWorks:
      "Accurately maps the separation between what you want (Query), how items advertise themselves (Keys), and the actual payload content (Values).",
    whereItDiffers:
      "YouTube returns a discrete list of videos where you watch one at a time. In Transformers, the output is a continuous mathematical blend (linear superposition) of all Values simultaneously.",
  },
  problemBeforeSolution: {
    whatWasTried:
      "Recurrent Neural Networks (RNNs) and LSTMs compressed an entire sentence into a single fixed-size hidden vector sequentially from left to right.",
    whySimplerFailed:
      "Compressing a 500-word paragraph into a single vector of 512 numbers creates an 'information bottleneck'. Information from earlier words degrades exponentially over time, and sequential processing cannot be parallelized on GPUs.",
    difficultiesEncountered: [
      "Vanishing and exploding gradients across long text sequences",
      "Inability to parallelize training across modern GPU tensor cores",
      "Catastrophic forgetting: RNNs struggled to maintain context beyond 20-50 tokens",
    ],
    howConceptSolvesIt:
      "Attention eliminates recurrence entirely ($O(1)$ path length between any two tokens). All tokens interact simultaneously in parallel via matrix multiplications.",
    remainingLimitations:
      "Full self-attention has $O(N^2)$ computational and memory complexity with respect to sequence length $N$, requiring KV caching during generation.",
  },
  diagram: {
    title: "Scaled Dot-Product Attention Mechanism Flow",
    diagramType: "flowchart",
    source: `flowchart TD
    Q["Query Matrix (Q)\n[Batch, Seq, d_k]"] --> MatMul1["1. Matrix Multiply: Q × K^T\n[Batch, Seq, Seq]"]
    K["Key Matrix (K)\n[Batch, Seq, d_k]"] --> MatMul1
    MatMul1 --> Scale["2. Scale by 1 / sqrt(d_k)\nPrevents Variance Explosion"]
    Scale --> Mask["3. Optional Causal Mask\n(Prevent looking into future)"]
    Mask --> Softmax["4. Row-wise Softmax\n(Attention Weights sum to 1.0)"]
    Softmax --> MatMul2["5. Matrix Multiply: Weights × V"]
    V["Value Matrix (V)\n[Batch, Seq, d_v]"] --> MatMul2
    MatMul2 --> Out["Contextual Output Matrix\n[Batch, Seq, d_v]"]`,
    explanation: {
      whatComponentsRepresent:
        "Q, K, V are linear projections of input embeddings. MatMul1 computes pairwise dot-product similarities. Scale stabilizes the distribution. Softmax converts raw scores into probabilities. MatMul2 blends the Values.",
      arrowsAndDataFlow:
        "Q and K interact to produce an N×N attention map. After scaling and softmax, the weights multiply V to produce the final context representation.",
      stepSequence:
        "1. Q × K^T -> 2. Scale by 1/sqrt(d_k) -> 3. Apply causal mask -> 4. Softmax -> 5. Multiply by V -> Output.",
      failurePoints:
        "If scaling by sqrt(d_k) is omitted, large dot products saturate Softmax into one-hot spikes, causing vanishing gradients ($∂S/∂z ≈ 0$) during backprop.",
    },
  },
  architecture: {
    title: "Attention Architecture Evolution",
    subtitle: "Standard Multi-Head Attention vs Memory-Efficient Grouped-Query Attention (GQA)",
    beginnerView: {
      name: "Multi-Head Attention (MHA)",
      badge: "Standard Attention",
      description: "Each attention head has its own dedicated Query, Key, and Value projections. Highest capacity, largest KV-cache memory footprint.",
      diagramSource: `flowchart TD
    Input[Input Embeddings] --> Split{Linear Projections}
    Split --> H1["Head 1: (Q1, K1, V1)"]
    Split --> H2["Head 2: (Q2, K2, V2)"]
    Split --> Hn["Head 8: (Q8, K8, V8)"]
    H1 --> Concat[Concatenate All Heads]
    H2 --> Concat
    Hn --> Concat
    Concat --> OutProj[Linear Output Projection]`,
      explanation: {
        whatComponentsRepresent: "Input is projected into multiple distinct subspaces (e.g. 8 or 32 heads), allowing the model to attend to syntax, semantics, and entities simultaneously.",
        arrowsAndDataFlow: "Embeddings split into H independent heads, each executes scaled dot-product attention, outputs concatenate and project.",
        stepSequence: "Project -> Parallel Attention per Head -> Concat -> Output.",
        failurePoints: "Storing 32 separate K and V heads in GPU VRAM limits maximum batch size and context window length.",
      },
      components: [
        { name: "Query Heads", type: "llm", role: "32 independent query subspaces." },
        { name: "Key/Value Heads", type: "storage", role: "32 independent KV heads stored in GPU KV-cache." },
        { name: "Output Projection", type: "orchestrator", role: "Blends multi-head outputs back to model dimension." },
      ],
    },
    productionView: {
      name: "Grouped-Query Attention (GQA - Llama-3 / Mistral)",
      badge: "Production Standard",
      description: "Multiple Query heads share a smaller number of Key/Value heads (e.g. 32 Q heads share 8 KV heads), slashing KV-cache VRAM by 75%.",
      diagramSource: `flowchart TD
    QGroup1["Query Heads 1..4"] --> Share1[(Shared KV Head 1)]
    QGroup2["Query Heads 5..8"] --> Share2[(Shared KV Head 2)]
    QGroup3["Query Heads 9..12"] --> Share3[(Shared KV Head 3)]
    QGroup4["Query Heads 13..16"] --> Share4[(Shared KV Head 4)]
    Share1 --> OutConcat[Combined Attention Output]
    Share2 --> OutConcat
    Share3 --> OutConcat
    Share4 --> OutConcat`,
      explanation: {
        whatComponentsRepresent: "Query heads maintain high representation capacity (32 heads), but 4 query heads share 1 KV head (Group ratio 4:1).",
        arrowsAndDataFlow: "Shared KV heads cut KV cache memory by 4x with less than 1% degradation in downstream perplexity.",
        stepSequence: "Broadcast KV heads across Query groups -> Compute Attention -> Output.",
        failurePoints: "Requires custom tensor kernels (e.g., FlashAttention-2 / vLLM PagedAttention) to leverage memory savings.",
      },
      components: [
        { name: "Query Groups", type: "llm", role: "32 rich query projections for nuanced reasoning." },
        { name: "Grouped KV Cache", type: "storage", role: "Only 8 KV heads stored in VRAM (75% memory reduction)." },
        { name: "vLLM PagedAttention", type: "gateway", role: "Manages non-contiguous virtual memory blocks for KV cache." },
      ],
    },
  },
  executionTimeline: [
    {
      number: 1,
      title: "Linear Projection to Q, K, V",
      actor: "tool",
      description: "Input token embeddings of dimension d_model (e.g. 4096) multiply projection matrices W_q, W_k, W_v to yield Q, K, V vectors of dimension d_k (e.g. 128).",
      input: "Token embedding tensor [1, 4096]",
      output: "Q, K, V tensors [1, 128]",
    },
    {
      number: 2,
      title: "Pairwise Similarity Dot-Product (Q × K^T)",
      actor: "tool",
      description: "Computes dot product between query and all keys. For sequence of length N, produces an N × N score matrix.",
      input: "Q [N, 128], K^T [128, N]",
      output: "Raw Attention Scores [N, N]",
    },
    {
      number: 3,
      title: "Scale by 1/sqrt(d_k)",
      actor: "tool",
      description: "Divides all scores by sqrt(128) ≈ 11.31. This preserves variance = 1.0, keeping scores within Softmax gradient-sensitive range.",
      input: "Raw scores with variance = 128",
      output: "Scaled scores with variance = 1.0",
    },
    {
      number: 4,
      title: "Causal Masking & Softmax Normalization",
      actor: "tool",
      description: "Upper triangle filled with -infinity (prevents looking at future tokens). Stable Softmax converts rows into probabilities summing to 1.0.",
      input: "Scaled scores [N, N]",
      output: "Attention Probability Weights [N, N] where sum(row) == 1.0",
    },
    {
      number: 5,
      title: "Value Blending & Output Projection",
      actor: "tool",
      description: "Multiplies attention weights by Value matrix V to compute context-aware token representations.",
      input: "Weights [N, N] × V [N, 128]",
      output: "Attention Output [N, 128]",
    },
  ],
  codeWalkthrough: {
    title: "Numerically Stable Scaled Dot-Product Attention & KV Cache Math",
    purpose: "Implement manual Scaled Dot-Product Attention with causal masking, numerical stability tricks, and KV-cache sizing calculator.",
    dependencies: ["python >= 3.10", "numpy >= 1.24"],
    code: `import numpy as np

def scaled_dot_product_attention(Q: np.ndarray, K: np.ndarray, V: np.ndarray, is_causal: bool = True) -> np.ndarray:
    """
    Computes Scaled Dot-Product Attention:
    Attention(Q, K, V) = softmax((Q * K^T) / sqrt(d_k)) * V
    """
    d_k = Q.shape[-1]
    
    # 1. Compute dot product similarity
    scores = np.matmul(Q, np.swapaxes(K, -1, -2))
    
    # 2. Mathematical Scaling: divide by sqrt(d_k) to maintain unit variance
    scores = scores / np.sqrt(d_k)
    
    # 3. Apply Causal Mask if autoregressive (cannot attend to future tokens)
    if is_causal:
        seq_len = Q.shape[-2]
        mask = np.triu(np.ones((seq_len, seq_len)), k=1).astype(bool)
        scores = np.where(mask, -1e9, scores)
        
    # 4. Numerically stable Softmax: subtract max per row to prevent exp() overflow
    scores_max = np.max(scores, axis=-1, keepdims=True)
    exp_scores = np.exp(scores - scores_max)
    attention_weights = exp_scores / np.sum(exp_scores, axis=-1, keepdims=True)
    
    # 5. Weighted combination of Values
    output = np.matmul(attention_weights, V)
    return output, attention_weights

def calculate_kv_cache_bytes(
    num_layers: int,
    num_kv_heads: int,
    head_dim: int,
    context_length: int,
    batch_size: int = 1,
    bytes_per_param: int = 2 # FP16 / BF16
) -> float:
    """
    KV Cache Memory Formula:
    Bytes = 2 (Keys + Values) * num_layers * num_kv_heads * head_dim * context_length * batch_size * bytes_per_param
    """
    total_bytes = 2 * num_layers * num_kv_heads * head_dim * context_length * batch_size * bytes_per_param
    return total_bytes / (1024 ** 3) # Return in Gigabytes

if __name__ == "__main__":
    # Test Attention with sequence of 4 tokens, head dimension 64
    np.random.seed(42)
    seq_len, d_k = 4, 64
    Q = np.random.randn(1, seq_len, d_k)
    K = np.random.randn(1, seq_len, d_k)
    V = np.random.randn(1, seq_len, d_k)
    
    out, weights = scaled_dot_product_attention(Q, K, V)
    print("Attention Weights (First Head, Token 3 attending to tokens 0..3):")
    print(np.round(weights[0, 3, :], 3))
    
    # KV Cache Calculation for Llama-3-70B (80 layers, GQA with 8 KV heads, d=128, 8k context)
    gb = calculate_kv_cache_bytes(
        num_layers=80,
        num_kv_heads=8,
        head_dim=128,
        context_length=8192,
        batch_size=1,
        bytes_per_param=2 # 16-bit float
    )
    print(f"\\nLlama-3-70B KV Cache per user (8k context): {gb:.2f} GB VRAM")`,
    expectedOutput: `Attention Weights (First Head, Token 3 attending to tokens 0..3):
[0.218 0.187 0.354 0.241]

Llama-3-70B KV Cache per user (8k context): 2.50 GB VRAM`,
    annotations: [
      { lines: "Lines 11-15", explanation: "Multiplies Q and K^T, then divides by sqrt(d_k) to prevent variance explosion." },
      { lines: "Lines 18-21", explanation: "Applies upper-triangular causal mask with -1e9 so future tokens get 0 probability after Softmax." },
      { lines: "Lines 23-26", explanation: "The numerical stability trick: subtracting max(scores) prevents float overflow in exp()." },
      { lines: "Lines 31-43", explanation: "The exact KV-cache equation used by LLM serving engines (vLLM, TensorRT-LLM) to size GPU memory." },
    ],
    commonErrors: [
      {
        error: "Softmax producing NaN values when sequence length or values are large",
        fix: "Always subtract np.max(scores, axis=-1, keepdims=True) before computing np.exp() to prevent float overflow.",
      },
      {
        error: "Forgetting the factor of 2 in KV cache sizing formulas",
        fix: "The factor of 2 is mandatory because the cache must store BOTH Keys and Values for every token.",
      },
    ],
  },
  comparison: {
    title: "Attention Variants: MHA vs MQA vs GQA",
    conceptAName: "Multi-Head Attention (MHA)",
    conceptBName: "Grouped-Query Attention (GQA)",
    summaryA: "Every query head has its own dedicated key and value head. Maximum representational capacity, but huge KV cache memory consumption.",
    summaryB: "Multiple query heads share a smaller pool of key/value heads (e.g. 4 query heads per 1 KV head). Standard in Llama-3 and Mistral.",
    rows: [
      { aspect: "KV Heads Count", conceptA: "Equal to Query Heads (e.g., 32)", conceptB: "Fraction of Query Heads (e.g., 8)" },
      { aspect: "KV Cache VRAM Footprint", conceptA: "100% (Baseline)", conceptB: "25% (75% Memory Reduction)" },
      { aspect: "Model Quality / Perplexity", conceptA: "Highest theoretical capacity", conceptB: "Virtually indistinguishable (<0.5% diff)" },
      { aspect: "Max Serving Concurrency", conceptA: "Low; GPU VRAM quickly exhausts", conceptB: "4x higher concurrent batch sizes" },
      { aspect: "Used In", conceptA: "Original Transformer (2017), GPT-3", conceptB: "Llama-3, Mistral, Gemma 2" },
    ],
    whenToChooseA: "Use when training small models (<1B parameters) where memory is not the primary serving bottleneck.",
    whenToChooseB: "Mandatory for all modern production LLMs (7B+) serving long context windows (8k to 128k tokens).",
  },
  useCases: [
    {
      title: "High-Throughput LLM Inference Gateway Sizing",
      industry: "AI Cloud Infrastructure",
      goal: "Calculate GPU VRAM requirements to serve 128 concurrent users on an 8x H100 GPU cluster with 32k context windows.",
      userInput: "'Size KV-cache memory for 128 concurrent streams running Llama-3-70B.'",
      componentsInvolved: ["vLLM PagedAttention", "H100 SXM5 80GB GPUs", "Tensor Parallelism (TP=8)"],
      workflowSteps: [
        "Model weights: 70B parameters in FP16 require 140 GB VRAM across 8 GPUs (17.5 GB per GPU).",
        "KV Cache calculation: GQA (8 KV heads, 80 layers, dim 128) at 32k context = 10.0 GB per user.",
        "128 concurrent users = 128 × 10.0 GB = 1,280 GB total KV cache.",
        "Across 8x H100 (640 GB total VRAM), 128 concurrent 32k users exceed physical capacity -> system enforces continuous chunked prefill and paging.",
      ],
      expectedOutput: "'Max supported concurrent users at 32k context on 8x H100 is 48 users before VRAM exhaustion.'",
      failureScenarios: [
        {
          failure: "OOM (Out of Memory) crash during sudden spike in user conversation length.",
          guardrailFix: "PagedAttention allocates virtual memory pages on demand and evicts or swaps prefix caches to host RAM.",
        },
      ],
    },
    {
      title: "Document Question Answering with Long Contexts",
      industry: "Legal Tech",
      goal: "Analyze a 100-page contract (60,000 tokens) using scaled dot-product attention without losing middle clauses.",
      userInput: "'What are the indemnification liabilities mentioned in clause 14.3?'",
      componentsInvolved: ["RoPE (Rotary Position Embeddings)", "FlashAttention-2 Kernel", "Targeted Query Projection"],
      workflowSteps: [
        "Input tokens projected into Q, K, V with RoPE frequencies.",
        "FlashAttention-2 computes tiled attention matrix without materializing full 60k × 60k float matrix in HBM.",
        "High attention weight connects question Query to clause 14.3 Key.",
        "Model retrieves precise liability terms without truncation.",
      ],
      expectedOutput: "'Clause 14.3 limits indemnification liability to fees paid in the preceding 12 months.'",
      failureScenarios: [
        {
          failure: "Materializing full 60k × 60k attention matrix causes CUDA OOM.",
          guardrailFix: "FlashAttention-2 tiles computation using GPU SRAM, avoiding the O(N^2) memory footprint in global HBM.",
        },
      ],
    },
  ],
  mistakesAndBestPractices: {
    mistakes: [
      {
        mistake: "Omitting the 1/sqrt(d_k) factor when implementing custom attention layers",
        whyItHappens: "Assuming dot products behave nicely without understanding variance scaling.",
        correctApproach: "Always scale by 1 / sqrt(d_k). For d_k=128, dot products have variance 128, which pushes Softmax into zero-gradient saturation.",
        category: "implementation",
      },
      {
        mistake: "Computing Softmax via np.exp(x) / np.sum(np.exp(x)) directly",
        whyItHappens: "Directly transcribing the textbook formula without accounting for 32-bit floating point limits.",
        correctApproach: "Subtract np.max(x) before exponentiation to guarantee numerical stability and prevent NaN crashes.",
        category: "implementation",
      },
      {
        mistake: "Sizing GPU infrastructure based only on model parameter weights",
        whyItHappens: "Forgetting that active KV caches often consume MORE VRAM than the model weights themselves during multi-user serving.",
        correctApproach: "Always calculate total memory as: Model Weights + (Concurrent Batch × Context Length × KV Cache per Token).",
        category: "architecture",
      },
    ],
    productionChecklist: [
      "Always divide dot-products by sqrt(d_k) to maintain variance = 1.0",
      "Apply numerical stability trick (subtract row max) before computing Softmax",
      "Use Grouped-Query Attention (GQA) to cut KV cache memory by 75% in production models",
      "Deploy FlashAttention-2 or vLLM PagedAttention to eliminate quadratic HBM memory allocations",
      "Calculate exact KV-cache VRAM budgets before setting maximum concurrent serving limits",
    ],
  },
  interviewQuestions: [
    {
      id: "attn-q1",
      level: "Beginner",
      question: "Derive mathematically why we scale the dot products by 1 / sqrt(d_k) in Scaled Dot-Product Attention.",
      strongAnswer:
        "Assume the components of query $q$ and key $k$ are independent random variables with mean 0 and variance 1. The dot product is $q \\cdot k = \\sum_{i=1}^{d_k} q_i k_i$. Each term $q_i k_i$ has mean 0 and variance 1. The sum of $d_k$ independent random variables has mean 0 and variance $d_k$ (standard deviation $\\sqrt{d_k}$). For large dimensions like $d_k = 128$, the variance is 128, meaning dot products can reach large magnitudes. Large inputs to Softmax push outputs into regions where values are either near 1 or near 0, where the derivative $S_i(\\delta_{ij} - S_j) \\approx 0$. This causes vanishing gradients during backpropagation. Dividing by $\\sqrt{d_k}$ normalizes the variance back to 1.0, preserving gradient flow.",
      whyItsStrong:
        "Walks through the exact statistical variance derivation (sum of independent variables) and links it directly to the derivative of Softmax and vanishing gradients.",
      weakAnswer: "To keep the numbers small so the computer doesn't crash.",
      whyItsWeak: "Fails to mention random variable variance, Softmax gradient saturation, or the mathematical derivation.",
      followUp: "What is the derivative of the Softmax function with respect to its input logits?",
      companyTag: "Google",
    },
    {
      id: "attn-q2",
      level: "Intermediate",
      question: "What is the KV Cache, why is it necessary during autoregressive decoding, and what is its exact memory formula?",
      strongAnswer:
        "During autoregressive token generation, generating token $t$ requires computing attention over all previous tokens $1..t-1$. Because past token representations do not change, recomputing their Key and Value vectors on every turn would take $O(N^2)$ redundant matrix multiplications. The KV Cache saves past Keys and Values in GPU memory so each new token only requires a single $O(N)$ projection. The exact memory formula is: $\\text{Memory (bytes)} = 2 \\times L \\times H_{kv} \\times d_{head} \\times N_{context} \\times B \\times P_{bytes}$, where $2$ accounts for Keys and Values, $L$ is layers, $H_{kv}$ is KV heads, $d_{head}$ is head dimension, $N$ is sequence length, $B$ is batch size, and $P$ is precision bytes (2 bytes for FP16).",
      whyItsStrong:
        "Explains the algorithmic complexity motivation ($O(N^2) \\to O(N)$) and writes out every parameter of the exact dimensional memory formula.",
      weakAnswer: "It's a cache that saves past words so the model runs faster.",
      whyItsWeak: "Omits the formula, the factor of 2, the layer/head dimensions, and the algorithmic complexity argument.",
      followUp: "How does Grouped-Query Attention (GQA) reduce this formula compared to Multi-Head Attention?",
      companyTag: "Meta",
    },
    {
      id: "attn-q3",
      level: "Advanced",
      question: "Explain the numerical stability trick in Softmax implementation and what happens if you fail to use it in floating point arithmetic.",
      strongAnswer:
        "Softmax is defined as $\\sigma(z)_i = \\frac{e^{z_i}}{\\sum_j e^{z_j}}$. In standard 32-bit floating point, $e^x$ overflows to `+inf` when $x > 88.7$. When an unscaled or large logit exceeds 89, `np.exp(x)` yields `inf`, and evaluating `inf / inf` results in `NaN` (Not a Number), instantly corrupting model weights during training. The numerical stability trick uses the algebraic identity: $\\frac{e^{z_i}}{\\sum_j e^{z_j}} = \\frac{e^{z_i - c}}{\\sum_j e^{z_j - c}}$ by choosing $c = \\max(z)$. Since the maximum exponent is now $z_i - \\max(z) = 0$, $e^0 = 1$, mathematically guaranteeing that exponentiation can NEVER exceed 1.0, eliminating overflow completely.",
      whyItsStrong:
        "Proves the algebraic equivalence with shift invariance constant $c = \\max(z)$ and specifies the exact IEEE 754 float limits ($x > 88.7$).",
      weakAnswer: "You subtract the max so the numbers aren't too big.",
      whyItsWeak: "Lacks mathematical proof of shift invariance and fails to explain float overflow and NaN propagation.",
      followUp: "How does FlashAttention avoid materializing the full $N \\times N$ attention matrix in GPU memory?",
      companyTag: "Anthropic",
    },
  ],
  interactiveQuiz: [
    {
      id: "attn-quiz-1",
      question: "Why do we divide dot products by sqrt(d_k) before applying Softmax?",
      options: [
        "To make matrix multiplication run faster on GPUs",
        "To normalize the variance of the dot products to 1.0 and prevent vanishing gradients in Softmax",
        "To convert the matrix from FP32 to INT8 format",
        "Because dot products are always negative without scaling",
      ],
      correctIndex: 1,
      explanation:
        "The dot product of two d_k-dimensional vectors with unit variance has variance d_k. Dividing by sqrt(d_k) scales the variance back to 1.0, keeping Softmax gradients alive.",
    },
    {
      id: "attn-quiz-2",
      question: "Why does the KV cache formula include an explicit multiplier of 2?",
      options: [
        "Because GPUs execute operations on pairs of floats",
        "Because both Key vectors and Value vectors must be cached for every token",
        "Because models process both forward and backward passes",
        "To account for prompt tokens and completion tokens",
      ],
      correctIndex: 1,
      explanation:
        "Attention requires both past Key vectors (for similarity scoring) and past Value vectors (for content blending). Storing both doubles the memory footprint.",
    },
  ],
  exerciseChallenge: {
    exercise: {
      title: "Write Numerically Stable Softmax",
      instructions:
        "Implement a Python function `stable_softmax(x: np.ndarray) -> np.ndarray` that subtracts row-wise maximums before computing exponentiation.",
      starterCode: `import numpy as np

def stable_softmax(x: np.ndarray) -> np.ndarray:
    # TODO: Implement numerically stable softmax
    pass`,
      solutionHint: `import numpy as np

def stable_softmax(x: np.ndarray) -> np.ndarray:
    # Subtract max per row for stability
    x_max = np.max(x, axis=-1, keepdims=True)
    exp_x = np.exp(x - x_max)
    return exp_x / np.sum(exp_x, axis=-1, keepdims=True)`,
    },
    debuggingChallenge: {
      title: "The Overflowing Exponent Bug",
      symptom: "Attention computation returns an array full of `nan` values during inference on long prompts.",
      buggyCode: `import numpy as np

def compute_attention_scores(Q, K):
    # BUG: No scaling by sqrt(d_k) and naive softmax without max subtraction!
    scores = np.dot(Q, K.T)
    # When dot products reach 200, exp(200) overflows to inf!
    exp_scores = np.exp(scores)
    return exp_scores / np.sum(exp_scores)`,
      explanation:
        "Omitting the `1/sqrt(d_k)` scaling factor allows raw dot products to exceed 100+. `np.exp(100+)` overflows to `inf`. `inf / inf` produces `nan`.",
      correctedCode: `import numpy as np

def compute_attention_scores(Q, K):
    d_k = Q.shape[-1]
    # Fix 1: Scale by sqrt(d_k)
    scores = np.dot(Q, K.T) / np.sqrt(d_k)
    # Fix 2: Stable softmax with max subtraction
    scores_max = np.max(scores, axis=-1, keepdims=True)
    exp_scores = np.exp(scores - scores_max)
    return exp_scores / np.sum(exp_scores, axis=-1, keepdims=True)`,
    },
    revisionSummary: [
      "Scaled Dot-Product Attention computes softmax((Q * K^T) / sqrt(d_k)) * V.",
      "Scaling by sqrt(d_k) counteracts variance explosion (variance = d_k), preventing Softmax vanishing gradients.",
      "Always use the numerical stability trick: subtract max(x) before exponentiation to prevent float overflow.",
      "KV Cache eliminates redundant O(N^2) compute during autoregressive generation by storing past Keys and Values.",
      "Grouped-Query Attention (GQA) shares KV heads across query groups, reducing KV-cache memory by up to 75%.",
    ],
    relatedTopics: [
      { title: "Python & Data Engineering", moduleId: 1 },
      { title: "Serving Infrastructure & System Design", moduleId: 16 },
      { title: "Production RAG Systems", moduleId: 7 },
    ],
  },
};

