import { BankQuestion, PYTHON_DSA_QUESTIONS } from "./python-dsa";
import { AI_AGENTS_QUESTIONS } from "./ai-agents";
import { RAG_VECTOR_QUESTIONS } from "./rag-vector";
import { LLM_SYSTEMS_QUESTIONS } from "./llm-systems";
import { MCP_EVALS_SECURITY_QUESTIONS } from "./mcp-evals-security";
import { PYTHON_CORE_QUESTIONS } from "./python-core";
import { DSA_PATTERNS_QUESTIONS } from "./dsa-patterns";
import { COMPREHENSIVE_EXPANDED_QUESTIONS } from "./comprehensive-bank";
import { ADDITIONAL_200_PLUS_QUESTIONS } from "./additional-pack";
import { FINAL_50_PACK } from "./pack-200";
import { MASTER_EXPANSION_PACK } from "./master-expansion";
import { ORIGINAL_ACADEMY_QUESTIONS } from "./original-academy";

export type { BankQuestion };

// Consolidated questions collection across all technical domains
const ALL_PACK_QUESTIONS: BankQuestion[] = [
  ...ORIGINAL_ACADEMY_QUESTIONS,
  ...PYTHON_DSA_QUESTIONS,
  ...PYTHON_CORE_QUESTIONS,
  ...DSA_PATTERNS_QUESTIONS,
  ...AI_AGENTS_QUESTIONS,
  ...RAG_VECTOR_QUESTIONS,
  ...LLM_SYSTEMS_QUESTIONS,
  ...MCP_EVALS_SECURITY_QUESTIONS,
  ...COMPREHENSIVE_EXPANDED_QUESTIONS,
  ...ADDITIONAL_200_PLUS_QUESTIONS,
  ...FINAL_50_PACK,
  ...MASTER_EXPANSION_PACK,
];

// Deduplicate strictly by ID
const seenIds = new Set<string>();
export const MASTER_QUESTIONS: BankQuestion[] = [];

for (const q of ALL_PACK_QUESTIONS) {
  if (!seenIds.has(q.id)) {
    seenIds.add(q.id);
    MASTER_QUESTIONS.push(q);
  }
}

