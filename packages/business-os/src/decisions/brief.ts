import type {
  BusinessDecision,
  BusinessDecisionBrief,
  BusinessDecisionComparison,
  BusinessDecisionContext,
  BusinessDecisionEvidenceItem,
  BusinessDecisionOption,
  BusinessEvidenceRef,
} from "@rtb/types";
import { DECISION_BRIEF_VERSION, OPTION_COMPARISON_VERSION } from "@rtb/types";

function evidenceRefs(items: BusinessDecisionEvidenceItem[]): BusinessEvidenceRef[] {
  return items.map((item) => ({
    sourceType: item.sourceType,
    sourceRef: item.sourceRef,
    title: item.summary,
    excerpt: item.valueState === "unknown" ? "unknown" : item.valueText ?? undefined,
  }));
}

export function evidenceCompletenessBps(items: BusinessDecisionEvidenceItem[]): string | null {
  if (!items.length) return "0";
  const known = items.filter((item) => item.valueState !== "unknown" && item.evidenceQuality !== "unavailable");
  return String(Math.round((known.length / Math.max(items.length, 1)) * 10000));
}

export function buildDecisionBrief(input: {
  decision: BusinessDecision;
  context?: BusinessDecisionContext | null;
  evidence: BusinessDecisionEvidenceItem[];
  options: BusinessDecisionOption[];
  comparison: BusinessDecisionComparison;
  asOf?: string;
}): BusinessDecisionBrief {
  const question = input.context?.question || input.decision.statement;
  const situationParts = [
    input.decision.context,
    input.context?.problemStatement,
    `Status: ${input.decision.status}`,
  ].filter((part): part is string => Boolean(part && part.trim()));
  const missing: string[] = [];
  if (!input.evidence.length) missing.push("No evidence linked");
  if (input.evidence.some((item) => item.valueState === "unknown")) missing.push("Some evidence values are unknown");
  if (!input.options.length) missing.push("No options recorded");
  if (input.options.length === 1) missing.push("Only one option recorded");
  const unknownImpacts = [...new Set(input.comparison.options.flatMap((row) => row.unknownImpacts))];
  if (unknownImpacts.length) missing.push(`Unknown impacts: ${unknownImpacts.join(", ")}`);
  const recommendation = input.comparison.recommendationText;
  const preferred = input.comparison.preferredOptionId ?? null;
  const timestamp = input.asOf ?? new Date().toISOString();
  return {
    version: DECISION_BRIEF_VERSION,
    decisionId: input.decision.id,
    decisionQuestion: question,
    currentSituation: situationParts.join(" ") || "No additional situation recorded.",
    keyEvidence: evidenceRefs(input.evidence),
    missingEvidence: missing,
    options: input.options.map((row) => ({
      id: row.id,
      title: row.title,
      status: row.status,
      aiGenerated: row.aiGenerated,
    })),
    impactComparison: input.comparison,
    recommendation: {
      text: recommendation,
      preferredOptionId: preferred,
      evidenceRefs: evidenceRefs(input.evidence),
      assumptions: input.context?.assumptions ?? [],
      knownImpacts: input.comparison.options.flatMap((row) =>
        Object.entries(row.knownImpacts)
          .filter(([, value]) => value && value !== "unknown")
          .map(([dim, value]) => `${row.title}: ${dim} ${value}`),
      ),
      unknownImpacts: unknownImpacts,
      ruleVersion: OPTION_COMPARISON_VERSION,
      generatedBy: "deterministic_rule",
      timestamp,
      advisoryOnly: true,
    },
    assumptions: input.context?.assumptions ?? [],
    constraints: input.context?.constraints ?? [],
    dueAt: input.context?.dueAt ?? null,
    reviewAt: input.decision.reviewAt ?? null,
    generatedBy: "deterministic_rule",
    requiresAi: false,
  };
}
