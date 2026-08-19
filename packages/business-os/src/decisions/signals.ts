import type {
  BusinessAction,
  BusinessDecision,
  BusinessDecisionContext,
  BusinessDecisionEffectiveness,
  BusinessDecisionEvidenceItem,
  BusinessDecisionLesson,
  BusinessDecisionOutcome,
  BusinessEvidenceRef,
  BusinessSignalSeverity,
} from "@rtb/types";

export interface DecisionSignalDraft {
  ruleId: string;
  type: string;
  severity: BusinessSignalSeverity;
  title: string;
  summary: string;
  evidence: BusinessEvidenceRef[];
  provenance: Record<string, unknown>;
  businessImpact: "low" | "medium" | "high" | "critical";
  recommendationTitle: string;
  recommendationText: string;
}

function ref(decision: BusinessDecision, title?: string): BusinessEvidenceRef {
  return { sourceType: "decision", sourceRef: decision.id, title: title ?? decision.statement };
}

export function detectDecisionSignals(input: {
  decision: BusinessDecision;
  context?: BusinessDecisionContext | null;
  evidence: BusinessDecisionEvidenceItem[];
  actions: BusinessAction[];
  outcome?: BusinessDecisionOutcome | null;
  effectiveness?: BusinessDecisionEffectiveness | null;
  asOf: string;
  categoryRepeats?: number;
  repeatSampleThreshold?: number;
}): DecisionSignalDraft[] {
  const drafts: DecisionSignalDraft[] = [];
  const pending = input.decision.status === "pending" || input.decision.status === "deferred";
  const dueAt = input.context?.dueAt ?? null;
  const asOfMs = new Date(input.asOf).getTime();

  if (pending && dueAt && new Date(dueAt).getTime() < asOfMs) {
    const critical = input.context?.urgency === "critical" || input.context?.urgency === "urgent";
    drafts.push({
      ruleId: "decision.overdue.v1",
      type: "decision.overdue",
      severity: critical ? "critical" : "warning",
      title: critical ? `Critical decision overdue: ${input.decision.statement}` : `Decision overdue: ${input.decision.statement}`,
      summary: `Pending decision is past due (${dueAt}).`,
      evidence: [ref(input.decision)],
      provenance: { domain: "decision", ruleId: "decision.overdue.v1", dueAt },
      businessImpact: critical ? "critical" : "high",
      recommendationTitle: "Review decision",
      recommendationText: "Review the overdue decision with the owner. Advisory only — no autonomous approval.",
    });
  }

  if (pending && input.evidence.length === 0) {
    drafts.push({
      ruleId: "decision.missing_evidence.v1",
      type: "decision.missing_evidence",
      severity: "warning",
      title: `Decision missing evidence: ${input.decision.statement}`,
      summary: "Material pending decision has no linked evidence bundle.",
      evidence: [ref(input.decision)],
      provenance: { domain: "decision", ruleId: "decision.missing_evidence.v1" },
      businessImpact: "high",
      recommendationTitle: "Gather missing evidence",
      recommendationText: "Gather missing evidence before approval. Do not invent quantitative impacts.",
    });
  }

  if (input.decision.status === "approved" && !input.actions.some((a) => a.decisionId === input.decision.id && a.status !== "cancelled")) {
    drafts.push({
      ruleId: "decision.approved_without_action.v1",
      type: "decision.approved_without_action",
      severity: "warning",
      title: `Approved decision has no action: ${input.decision.statement}`,
      summary: "Approved decision has no linked internal action.",
      evidence: [ref(input.decision)],
      provenance: { domain: "decision", ruleId: "decision.approved_without_action.v1" },
      businessImpact: "medium",
      recommendationTitle: "Define expected outcome",
      recommendationText: "Create an internal action and expected outcome. No external execution.",
    });
  }

  for (const action of input.actions.filter((a) => a.decisionId === input.decision.id && a.status === "blocked")) {
    drafts.push({
      ruleId: "decision.action_blocked.v1",
      type: "decision.action_blocked",
      severity: "warning",
      title: `Action blocked: ${action.title}`,
      summary: "A decision-linked action is blocked.",
      evidence: [ref(input.decision), { sourceType: "action", sourceRef: action.id, title: action.title }],
      provenance: { domain: "decision", ruleId: "decision.action_blocked.v1", actionId: action.id },
      businessImpact: "high",
      recommendationTitle: "Resolve blocked action",
      recommendationText: "Resolve the blocked action with the owner. No autonomous reassignment.",
    });
  }

  const reviewAt = input.decision.reviewAt;
  if (
    reviewAt &&
    new Date(reviewAt).getTime() < asOfMs &&
    input.decision.status === "approved" &&
    (!input.outcome || input.outcome.status === "pending" || input.outcome.status === "measuring")
  ) {
    drafts.push({
      ruleId: "decision.outcome_review_overdue.v1",
      type: "decision.outcome_review_overdue",
      severity: "warning",
      title: `Outcome review overdue: ${input.decision.statement}`,
      summary: `Review date ${reviewAt} has passed without a recorded outcome.`,
      evidence: [ref(input.decision)],
      provenance: { domain: "decision", ruleId: "decision.outcome_review_overdue.v1", reviewAt },
      businessImpact: "medium",
      recommendationTitle: "Schedule outcome review",
      recommendationText: "Record the expected vs actual outcome with evidence. Do not infer results.",
    });
  }

  if (input.outcome?.varianceState === "computed" && input.outcome.varianceValue) {
    const variance = Number(input.outcome.varianceValue);
    if (Number.isFinite(variance) && Math.abs(variance) > 0) {
      drafts.push({
        ruleId: "decision.expected_actual_diverged.v1",
        type: "decision.expected_actual_diverged",
        severity: "watch",
        title: `Expected vs actual diverged: ${input.decision.statement}`,
        summary: `Comparable metrics diverged by ${input.outcome.varianceValue}. This is variance, not a causal claim.`,
        evidence: [ref(input.decision), ...(input.outcome.evidenceRefs ?? [])],
        provenance: {
          domain: "decision",
          ruleId: "decision.expected_actual_diverged.v1",
          variance: input.outcome.varianceValue,
        },
        businessImpact: "medium",
        recommendationTitle: "Review decision",
        recommendationText: "Review the variance with sourced metrics. Do not treat this as a causal prediction.",
      });
    }
  }

  const sample = input.repeatSampleThreshold ?? 3;
  if ((input.categoryRepeats ?? 0) >= sample && input.effectiveness?.status === "ineffective") {
    drafts.push({
      ruleId: "decision.repeated_ineffective.v1",
      type: "decision.repeated_ineffective",
      severity: "watch",
      title: `Repeated ineffective decisions in ${input.context?.domain ?? "general"}`,
      summary: `${input.categoryRepeats} ineffective outcomes in this domain with sufficient sample. Correlation only — not a causal claim.`,
      evidence: [ref(input.decision)],
      provenance: {
        domain: "decision",
        ruleId: "decision.repeated_ineffective.v1",
        sample: input.categoryRepeats,
        threshold: sample,
      },
      businessImpact: "medium",
      recommendationTitle: "Review decision",
      recommendationText: "Review repeated ineffective outcomes in this category. Sample-limited; not a causal claim.",
    });
  }

  return drafts;
}

export function lessonIsOrganisationalKnowledge(lesson: BusinessDecisionLesson): boolean {
  return lesson.status === "accepted";
}
