import type { ResultComparison } from "./types";
import type { EngineeringAnalysisResult } from "./types";
import { AI_ENGINEERING_APPROVAL, AI_SELF_ACCEPT_RESULT, AI_SELF_CERTIFY_TOOL } from "./types";

export function assertHumanAcceptance(actorKind: string): void {
  if (actorKind === "AI_AGENT") {
    throw new Error(`AI_SELF_ACCEPT_RESULT=${AI_SELF_ACCEPT_RESULT}`);
  }
}

export function assertHumanToolCertification(actorKind: string): void {
  if (actorKind === "AI_AGENT") {
    throw new Error(`AI_SELF_CERTIFY_TOOL=${AI_SELF_CERTIFY_TOOL}`);
  }
}

export function assertNoAutonomousApproval(actorKind: string): void {
  if (actorKind === "AI_AGENT") {
    throw new Error(`AI_ENGINEERING_APPROVAL=${AI_ENGINEERING_APPROVAL}`);
  }
}

export function composeReviewCitation(input: {
  analysisRequestId: string;
  analysisResultId: string | null;
  reviewPackageId: string;
}): { relationship: "REVIEWS"; fromType: "review_package"; fromId: string; toType: "analysis_request" | "analysis_result"; toId: string } {
  return {
    relationship: "REVIEWS",
    fromType: "review_package",
    fromId: input.reviewPackageId,
    toType: input.analysisResultId ? "analysis_result" : "analysis_request",
    toId: input.analysisResultId ?? input.analysisRequestId,
  };
}

export function composeDecisionSupport(input: {
  decisionId: string;
  analysisResultId: string;
}): { relationship: "SUPPORTED_BY"; fromType: "decision"; fromId: string; toType: "analysis_result"; toId: string } {
  return {
    relationship: "SUPPORTED_BY",
    fromType: "decision",
    fromId: input.decisionId,
    toType: "analysis_result",
    toId: input.analysisResultId,
  };
}

export function composeChangeImpact(input: {
  changeId: string;
  analysisResultId: string;
}): { relationship: "AFFECTS"; fromType: "change"; fromId: string; toType: "analysis_result"; toId: string } {
  return {
    relationship: "AFFECTS",
    fromType: "change",
    fromId: input.changeId,
    toType: "analysis_result",
    toId: input.analysisResultId,
  };
}

export function composeOptimizationRequest(input: {
  optimizationRunId: string;
  analysisRequestId: string;
}): { relationship: "USED_BY"; fromType: "optimization_run"; fromId: string; toType: "analysis_request"; toId: string } {
  return {
    relationship: "USED_BY",
    fromType: "optimization_run",
    fromId: input.optimizationRunId,
    toType: "analysis_request",
    toId: input.analysisRequestId,
  };
}

export function compareCompatibleResults(
  left: EngineeringAnalysisResult,
  right: EngineeringAnalysisResult,
  context: { capability: string; baselineId: string | null; unit: string | null; resultChannel: string },
): ResultComparison {
  const comparable =
    left.capability === right.capability &&
    left.capability === context.capability &&
    context.resultChannel.length > 0;
  const reasons: string[] = [];
  if (left.capability !== right.capability) reasons.push("capability_mismatch");
  if (left.discipline !== right.discipline) reasons.push("discipline_mismatch");
  const leftMetric = left.metrics.find((m) => m.resultChannel === context.resultChannel);
  const rightMetric = right.metrics.find((m) => m.resultChannel === context.resultChannel);
  if (!leftMetric || !rightMetric) reasons.push("channel_missing");
  if (leftMetric && rightMetric && leftMetric.unit !== rightMetric.unit) reasons.push("unit_mismatch");
  if (leftMetric && context.unit && leftMetric.unit !== context.unit) reasons.push("unit_mismatch");
  return {
    comparable: comparable && reasons.length === 0,
    reasons,
    leftResultId: left.id,
    rightResultId: right.id,
    channelsCompared: reasons.includes("channel_missing") ? [] : [context.resultChannel],
  };
}
