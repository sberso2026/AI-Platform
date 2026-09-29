import type { AnalysisMetric, EngineeringAnalysisResult } from "./types";
import type { AnalysisFailureClass } from "./types";

export type CommonValidationIssue = {
  code: AnalysisFailureClass | "RESULT_CHANNEL_MISSING" | "VALUE_NOT_FINITE";
  message: string;
};

export function validateNormalizedAnalysisResult(result: Pick<EngineeringAnalysisResult, "executionSucceeded" | "metrics" | "resultArtifacts">, requiredChannels: string[]): {
  resultValid: boolean;
  issues: CommonValidationIssue[];
} {
  const issues: CommonValidationIssue[] = [];
  for (const channel of requiredChannels) {
    const metric = result.metrics.find((m) => m.resultChannel === channel || m.metricCode === channel);
    if (!metric) {
      issues.push({ code: "RESULT_INCOMPLETE", message: `Required result channel missing: ${channel}` });
      continue;
    }
    if (metric.shape === "SCALAR" && metric.value != null && !Number.isFinite(metric.value)) {
      issues.push({ code: "RESULT_VALIDATION_FAILED", message: `Result for ${channel} is not finite.` });
    }
  }
  return { resultValid: issues.length === 0, issues };
}

export function normalizeFailure(error: {
  class?: AnalysisFailureClass | string;
  message?: string;
  retryable?: boolean;
}): { class: AnalysisFailureClass; retryable: boolean; userMessage: string } {
  const raw = String(error.class ?? "EXECUTION_FAILED");
  const allowed: AnalysisFailureClass[] = [
    "PRECONDITION_FAILED",
    "TOOL_NOT_READY",
    "AUTHORIZATION_FAILED",
    "QUEUE_FAILED",
    "EXECUTION_FAILED",
    "TOOL_TIMEOUT",
    "TOOL_ERROR",
    "PARSER_FAILED",
    "RESULT_INCOMPLETE",
    "UNIT_INVALID",
    "RESULT_VALIDATION_FAILED",
    "DEPENDENCY_STALE",
    "CANCELLED",
  ];
  const cls = (allowed as string[]).includes(raw) ? (raw as AnalysisFailureClass) : "EXECUTION_FAILED";
  const retryable =
    error.retryable === true
      ? cls === "TOOL_TIMEOUT" || cls === "QUEUE_FAILED"
      : cls === "TOOL_TIMEOUT" || cls === "QUEUE_FAILED";
  const userMessage = sanitizeUserMessage(error.message ?? cls);
  return { class: cls, retryable, userMessage };
}

function sanitizeUserMessage(message: string): string {
  return message
    .replace(/[A-Za-z0-9+/]{40,}=*/g, "[redacted]")
    .replace(/(password|secret|token|api[_-]?key)\s*[:=]\s*\S+/gi, "$1=[redacted]")
    .replace(/at\s+\S+\s+\(.*\)/g, "")
    .slice(0, 500);
}

export function assertMetricsAllowNonScalar(metrics: AnalysisMetric[]): void {
  const shapes = new Set(metrics.map((m) => m.shape));
  if (metrics.length && !shapes.size) throw new Error("metric_shape_required");
}

export function analysisRetryPolicy(failureClass: AnalysisFailureClass): { maxRetries: number; reason: string } {
  if (failureClass === "TOOL_TIMEOUT" || failureClass === "QUEUE_FAILED") {
    return { maxRetries: 1, reason: "transient_infrastructure" };
  }
  return { maxRetries: 0, reason: "deterministic_engineering_or_tool_failure" };
}
