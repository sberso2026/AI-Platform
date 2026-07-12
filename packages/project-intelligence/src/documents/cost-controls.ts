export interface DocumentProcessingBudget {
  maxDocumentBytes: number;
  maxPages: number;
  maxOcrPages: number;
  maxEmbeddingTokens: number;
  maxConcurrentJobs: number;
  maxRetries: number;
  notifyUtilizationPct: number;
}

export const DEFAULT_DOCUMENT_PROCESSING_BUDGET: DocumentProcessingBudget = {
  maxDocumentBytes: 25 * 1024 * 1024,
  maxPages: 200,
  maxOcrPages: 50,
  maxEmbeddingTokens: 500_000,
  maxConcurrentJobs: 10,
  maxRetries: 5,
  notifyUtilizationPct: 80,
};

export interface UsageCounters {
  parserPages: number;
  ocrPages: number;
  embeddingTokens: number;
  embeddingRequests: number;
  storageBytes: number;
  vectorCount: number;
  queryCount: number;
  answerTokens: number;
  estimatedCostUsd: number;
}

export function emptyUsageCounters(): UsageCounters {
  return {
    parserPages: 0,
    ocrPages: 0,
    embeddingTokens: 0,
    embeddingRequests: 0,
    storageBytes: 0,
    vectorCount: 0,
    queryCount: 0,
    answerTokens: 0,
    estimatedCostUsd: 0,
  };
}

export function assertWithinBudget(
  counters: UsageCounters,
  budget: DocumentProcessingBudget = DEFAULT_DOCUMENT_PROCESSING_BUDGET,
): { ok: boolean; violations: string[]; notify: boolean } {
  const violations: string[] = [];
  if (counters.parserPages > budget.maxPages) violations.push("page_limit");
  if (counters.ocrPages > budget.maxOcrPages) violations.push("ocr_page_limit");
  if (counters.embeddingTokens > budget.maxEmbeddingTokens) violations.push("embedding_token_limit");
  if (counters.storageBytes > budget.maxDocumentBytes) violations.push("document_size_limit");
  const utilization = Math.max(
    counters.parserPages / budget.maxPages,
    counters.ocrPages / budget.maxOcrPages,
    counters.embeddingTokens / budget.maxEmbeddingTokens,
  );
  return {
    ok: violations.length === 0,
    violations,
    notify: utilization * 100 >= budget.notifyUtilizationPct,
  };
}

export function estimateEmbeddingCostUsd(tokens: number, costPer1k = 0.02): number {
  return (tokens / 1000) * costPer1k;
}
