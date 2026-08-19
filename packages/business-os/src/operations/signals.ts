import type {
  BusinessEvidenceRef,
  BusinessSignalSeverity,
  BusinessWorkCapacityFact,
  BusinessWorkCostProgress,
  BusinessWorkHealth,
  BusinessWorkItem,
  BusinessWorkMilestone,
  BusinessWorkProgress,
} from "@rtb/types";
import { WORK_COST_PROGRESS_VERSION } from "@rtb/types";
import { parseMinor } from "../finance/money";
import { isMilestoneOverdue, isStale, isWorkOverdue } from "./schedule";

export interface OperationsSignalDraft {
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

export function detectOperationalSignals(input: {
  work: BusinessWorkItem;
  milestones: BusinessWorkMilestone[];
  progress: BusinessWorkProgress;
  costProgress: BusinessWorkCostProgress;
  health: BusinessWorkHealth;
  capacity: BusinessWorkCapacityFact[];
  highValue: boolean;
  asOf: string;
  staleDays: number;
}): OperationsSignalDraft[] {
  const drafts: OperationsSignalDraft[] = [];
  const workRef: BusinessEvidenceRef = {
    sourceType: input.work.sourceType,
    sourceRef: input.work.sourceRef ?? input.work.id,
    title: input.work.reference,
  };

  if (isWorkOverdue(input.work, input.asOf)) {
    drafts.push({
      ruleId: "operations.work_overdue.v1",
      type: "operations.work_overdue",
      severity: "warning",
      title: `Work overdue: ${input.work.reference}`,
      summary: `${input.work.name} planned finish ${input.work.plannedFinish} is overdue.`,
      evidence: [workRef],
      provenance: { domain: "operations", ruleId: "operations.work_overdue.v1", plannedFinish: input.work.plannedFinish },
      businessImpact: input.highValue ? "high" : "medium",
      recommendationTitle: "Review delayed work",
      recommendationText: "Review delayed work with the owner. Advisory only — no autonomous reassignment.",
    });
  }

  for (const milestone of input.milestones.filter((row) => isMilestoneOverdue(row, input.asOf))) {
    drafts.push({
      ruleId: "operations.milestone_overdue.v1",
      type: "operations.milestone_overdue",
      severity: "warning",
      title: `Milestone overdue: ${milestone.name}`,
      summary: `${milestone.name} on ${input.work.reference} is overdue.`,
      evidence: [workRef, { sourceType: milestone.sourceType, sourceRef: milestone.sourceRef ?? milestone.id, title: milestone.name }],
      provenance: { domain: "operations", ruleId: "operations.milestone_overdue.v1", dueAt: milestone.dueAt },
      businessImpact: "medium",
      recommendationTitle: "Review delayed work",
      recommendationText: "Investigate the overdue milestone. Advisory only.",
    });
  }

  const blocked =
    input.work.status === "on_hold" ||
    input.milestones.some((row) => row.status === "blocked") ||
    input.health.components.some((c) => c.id === "blocked" && c.status === "critical");
  if (blocked && input.work.status !== "completed" && input.work.status !== "cancelled") {
    drafts.push({
      ruleId: "operations.work_blocked.v1",
      type: "operations.work_blocked",
      severity: input.work.status === "on_hold" ? "critical" : "warning",
      title: `Work blocked: ${input.work.reference}`,
      summary: `${input.work.name} is blocked or on hold.`,
      evidence: [workRef],
      provenance: { domain: "operations", ruleId: "operations.work_blocked.v1", status: input.work.status },
      businessImpact: "high",
      recommendationTitle: "Resolve blocked action",
      recommendationText: "Resolve the blocked action or hold. No autonomous reassignment.",
    });
  }

  if (input.costProgress.signal) {
    drafts.push({
      ruleId: WORK_COST_PROGRESS_VERSION,
      type: "operations.cost_ahead_of_progress",
      severity: "warning",
      title: `Cost ahead of progress: ${input.work.reference}`,
      summary: `Actual cost ${input.costProgress.actualCostBpsOfBudget} bps of budget vs progress ${input.costProgress.progressBps} bps. Potential overrun, not certainty.`,
      evidence: [workRef],
      provenance: {
        domain: "operations",
        ruleId: WORK_COST_PROGRESS_VERSION,
        actualCostBpsOfBudget: input.costProgress.actualCostBpsOfBudget,
        progressBps: input.costProgress.progressBps,
        varianceBps: input.costProgress.varianceBps,
        thresholdVersion: WORK_COST_PROGRESS_VERSION,
      },
      businessImpact: "high",
      recommendationTitle: "Investigate cost variance",
      recommendationText: "Investigate cost vs progress with evidence. This is not a final overrun claim.",
    });
  }

  if (input.capacity.some((row) => row.capacityStatus === "overcommitted")) {
    drafts.push({
      ruleId: "operations.capacity_overcommitted.v1",
      type: "operations.capacity_overcommitted",
      severity: "warning",
      title: `Capacity overcommitted: ${input.work.reference}`,
      summary: "Sourced committed hours exceed available hours.",
      evidence: [workRef],
      provenance: { domain: "operations", ruleId: "operations.capacity_overcommitted.v1" },
      businessImpact: "medium",
      recommendationTitle: "Rebalance capacity",
      recommendationText: "Rebalance capacity using sourced hours. No autonomous allocation.",
    });
  }

  if (
    isStale(input.work.lastStatusAt || input.work.updatedAt, input.asOf, input.staleDays) &&
    input.work.status !== "completed" &&
    input.work.status !== "cancelled"
  ) {
    drafts.push({
      ruleId: "operations.stale_work_status.v1",
      type: "operations.stale_work_status",
      severity: "info",
      title: `Stale work status: ${input.work.reference}`,
      summary: "Work status has not been updated within the stale threshold.",
      evidence: [workRef],
      provenance: { domain: "operations", ruleId: "operations.stale_work_status.v1", lastStatusAt: input.work.lastStatusAt },
      businessImpact: "low",
      recommendationTitle: "Update progress evidence",
      recommendationText: "Update progress or status evidence. AI must not invent progress.",
    });
  }

  if (input.highValue && (input.health.status === "at_risk" || input.health.status === "critical")) {
    drafts.push({
      ruleId: "operations.customer_work_at_risk.v1",
      type: "operations.customer_work_at_risk",
      severity: "critical",
      title: `High-value customer work at risk: ${input.work.reference}`,
      summary: `${input.work.name} is ${input.health.status} and linked to a customer.`,
      evidence: [workRef],
      provenance: { domain: "operations", ruleId: "operations.customer_work_at_risk.v1", health: input.health.status },
      businessImpact: "critical",
      recommendationTitle: "Review customer delivery risk",
      recommendationText: "Review customer delivery risk with operations evidence. Advisory only.",
    });
  }

  if (
    parseMinor(input.work.budgetCostMinor) !== null &&
    input.costProgress.unknownReasons.includes("actual_cost_unknown") &&
    input.work.status !== "planned"
  ) {
    drafts.push({
      ruleId: "operations.missing_cost_evidence.v1",
      type: "operations.missing_cost_evidence",
      severity: "info",
      title: `Missing operational cost evidence: ${input.work.reference}`,
      summary: "Budget is known but actual operational cost facts are missing.",
      evidence: [workRef],
      provenance: { domain: "operations", ruleId: "operations.missing_cost_evidence.v1" },
      businessImpact: "low",
      recommendationTitle: "Update progress evidence",
      recommendationText: "Capture actual operational cost evidence. Do not invent labour rates.",
    });
  }

  return drafts;
}
