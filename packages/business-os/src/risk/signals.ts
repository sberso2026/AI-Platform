import type {
  BusinessAction,
  BusinessEvidenceRef,
  BusinessRiskControl,
  BusinessRiskObligation,
  BusinessRiskRecord,
  BusinessRiskRegisterRow,
  BusinessSignalSeverity,
} from "@rtb/types";
import { BUSINESS_RISK_DEFAULT_THRESHOLDS } from "@rtb/types";

export interface RiskSignalDraft {
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

function ref(risk: BusinessRiskRecord): BusinessEvidenceRef {
  return { sourceType: "risk", sourceRef: risk.id, title: `${risk.reference} ${risk.title}` };
}

function isOpen(status: string): boolean {
  return status !== "closed" && status !== "archived";
}

export function detectRiskSignals(input: {
  row: BusinessRiskRegisterRow;
  controls: BusinessRiskControl[];
  obligations: BusinessRiskObligation[];
  actions: BusinessAction[];
  asOf: string;
  staleEvidenceDays?: number;
}): RiskSignalDraft[] {
  const drafts: RiskSignalDraft[] = [];
  const { row } = input;
  const risk = row.risk;
  const asOfMs = new Date(input.asOf).getTime();
  const staleMs = (input.staleEvidenceDays ?? BUSINESS_RISK_DEFAULT_THRESHOLDS.staleEvidenceDays) * 86_400_000;
  const open = isOpen(risk.status);

  if (open && row.residualLevel === "extreme") {
    drafts.push({
      ruleId: "risk.extreme_residual.v1",
      type: "risk.extreme_residual",
      severity: "critical",
      title: `Extreme residual risk: ${risk.reference}`,
      summary: `${risk.title} has extreme residual risk after evidenced controls.`,
      evidence: [ref(risk)],
      provenance: { domain: "risk", ruleId: "risk.extreme_residual.v1", residualLevel: row.residualLevel },
      businessImpact: "critical",
      recommendationTitle: "Create treatment decision",
      recommendationText: "Prepare a human treatment decision for this extreme residual risk. Advisory only — no autonomous acceptance.",
    });
  }

  if (open && row.toleranceStatus === "outside" && !row.toleranceException) {
    drafts.push({
      ruleId: "risk.outside_tolerance.v1",
      type: "risk.outside_tolerance",
      severity: row.residualLevel === "extreme" ? "critical" : "warning",
      title: `Risk outside tolerance: ${risk.reference}`,
      summary: `${risk.title} residual risk is outside the configured appetite/tolerance.`,
      evidence: [ref(risk)],
      provenance: { domain: "risk", ruleId: "risk.outside_tolerance.v1", residualLevel: row.residualLevel },
      businessImpact: row.residualLevel === "extreme" ? "critical" : "high",
      recommendationTitle: "Review risk against tolerance",
      recommendationText: "Escalate for a human tolerance exception or treatment decision. Do not auto-accept.",
    });
  }

  if (
    open &&
    (row.residualLevel === "high" || row.residualLevel === "extreme") &&
    risk.reviewAt &&
    new Date(risk.reviewAt).getTime() < asOfMs
  ) {
    drafts.push({
      ruleId: "risk.review_overdue.v1",
      type: "risk.review_overdue",
      severity: row.residualLevel === "extreme" ? "critical" : "warning",
      title: `High risk overdue for review: ${risk.reference}`,
      summary: `${risk.title} is past its review date (${risk.reviewAt}).`,
      evidence: [ref(risk)],
      provenance: { domain: "risk", ruleId: "risk.review_overdue.v1", reviewAt: risk.reviewAt },
      businessImpact: "high",
      recommendationTitle: "Review risk",
      recommendationText: "Reassess likelihood, impact, and residual risk with current evidence.",
    });
  }

  if (risk.status === "accepted" && risk.reviewAt && new Date(risk.reviewAt).getTime() < asOfMs) {
    drafts.push({
      ruleId: "risk.accepted_review_expired.v1",
      type: "risk.accepted_review_expired",
      severity: "warning",
      title: `Accepted risk past review date: ${risk.reference}`,
      summary: `Human-accepted risk ${risk.reference} is past its review date.`,
      evidence: [ref(risk)],
      provenance: { domain: "risk", ruleId: "risk.accepted_review_expired.v1", reviewAt: risk.reviewAt },
      businessImpact: "high",
      recommendationTitle: "Reassess residual risk",
      recommendationText: "Reconfirm acceptance with an authorized human. Acceptance does not auto-renew.",
    });
  }

  if (open && !risk.ownerLabel && (row.residualLevel === "high" || row.residualLevel === "extreme")) {
    drafts.push({
      ruleId: "risk.missing_owner.v1",
      type: "risk.missing_owner",
      severity: "warning",
      title: `Material risk without owner: ${risk.reference}`,
      summary: `${risk.title} is material and has no assigned owner.`,
      evidence: [ref(risk)],
      provenance: { domain: "risk", ruleId: "risk.missing_owner.v1" },
      businessImpact: "high",
      recommendationTitle: "Assign owner",
      recommendationText: "Assign a human risk owner before treatment or acceptance.",
    });
  }

  if (open && row.evidenceFreshness === "stale") {
    drafts.push({
      ruleId: "risk.evidence_stale.v1",
      type: "risk.evidence_stale",
      severity: "watch",
      title: `Risk evidence stale: ${risk.reference}`,
      summary: `Linked evidence for ${risk.reference} is older than ${input.staleEvidenceDays ?? BUSINESS_RISK_DEFAULT_THRESHOLDS.staleEvidenceDays} days.`,
      evidence: [ref(risk)],
      provenance: { domain: "risk", ruleId: "risk.evidence_stale.v1", staleMs },
      businessImpact: "medium",
      recommendationTitle: "Gather missing evidence",
      recommendationText: "Refresh domain evidence refs. Do not invent exposures.",
    });
  }

  if (open && row.evidenceFreshness === "missing") {
    drafts.push({
      ruleId: "risk.missing_evidence.v1",
      type: "risk.missing_evidence",
      severity: "watch",
      title: `Risk missing evidence: ${risk.reference}`,
      summary: `${risk.title} has no linked domain evidence.`,
      evidence: [ref(risk)],
      provenance: { domain: "risk", ruleId: "risk.missing_evidence.v1" },
      businessImpact: "medium",
      recommendationTitle: "Gather missing evidence",
      recommendationText: "Link stable finance, operations, customer, profit, or decision evidence. Do not fabricate risks.",
    });
  }

  for (const control of input.controls) {
    if (control.effectiveness === "ineffective" || control.status === "ineffective") {
      drafts.push({
        ruleId: "risk.control_ineffective.v1",
        type: "risk.control_ineffective",
        severity: "warning",
        title: `Control ineffective: ${control.name}`,
        summary: `Control ${control.name} is ineffective and cannot reduce residual risk.`,
        evidence: [{ sourceType: "control", sourceRef: control.id, title: control.name }],
        provenance: { domain: "risk", ruleId: "risk.control_ineffective.v1", controlId: control.id },
        businessImpact: "high",
        recommendationTitle: "Test control",
        recommendationText: "Repair or replace the control and attach effectiveness evidence before reducing residual risk.",
      });
    } else if (control.effectiveness === "untested") {
      drafts.push({
        ruleId: "risk.control_untested.v1",
        type: "risk.control_untested",
        severity: "watch",
        title: `Control untested: ${control.name}`,
        summary: `Control ${control.name} is untested. Residual risk is not reduced.`,
        evidence: [{ sourceType: "control", sourceRef: control.id, title: control.name }],
        provenance: { domain: "risk", ruleId: "risk.control_untested.v1", controlId: control.id },
        businessImpact: "medium",
        recommendationTitle: "Test control",
        recommendationText: "Test the control and attach evidence. Do not mark effective without evidence.",
      });
    }
  }

  for (const obligation of input.obligations) {
    const overdue =
      obligation.status === "overdue" ||
      (obligation.dueAt &&
        new Date(obligation.dueAt).getTime() < asOfMs &&
        obligation.status !== "compliant" &&
        obligation.status !== "not_applicable");
    if (!overdue) continue;
    drafts.push({
      ruleId: "risk.obligation_overdue.v1",
      type: "risk.obligation_overdue",
      severity: "warning",
      title: `Obligation overdue: ${obligation.title}`,
      summary: `${obligation.title} is overdue. This is not a statutory compliance finding.`,
      evidence: [{ sourceType: "obligation", sourceRef: obligation.id, title: obligation.title }],
      provenance: { domain: "risk", ruleId: "risk.obligation_overdue.v1", obligationId: obligation.id },
      businessImpact: "high",
      recommendationTitle: "Escalate overdue obligation",
      recommendationText: "Escalate to the obligation owner. Do not claim statutory compliance from BOS automation.",
    });
  }

  for (const action of input.actions) {
    if (action.status === "completed" || action.status === "cancelled") continue;
    if (!action.dueDate || new Date(action.dueDate).getTime() >= asOfMs) continue;
    drafts.push({
      ruleId: "risk.treatment_action_overdue.v1",
      type: "risk.treatment_action_overdue",
      severity: "warning",
      title: `Treatment action overdue: ${action.title}`,
      summary: `Linked BOS-1 treatment action is past due (${action.dueDate}).`,
      evidence: [
        ref(risk),
        { sourceType: "action", sourceRef: action.id, title: action.title },
      ],
      provenance: { domain: "risk", ruleId: "risk.treatment_action_overdue.v1", actionId: action.id },
      businessImpact: "high",
      recommendationTitle: "Complete treatment action",
      recommendationText: "Complete or re-plan the existing BOS action. Do not create a second task system.",
    });
  }

  if (open && (row.residualLevel === "high" || row.residualLevel === "extreme") && !risk.linkedDecisionId) {
    drafts.push({
      ruleId: "risk.material_requires_decision.v1",
      type: "risk.material_requires_decision",
      severity: row.residualLevel === "extreme" ? "critical" : "warning",
      title: `Material risk requiring decision: ${risk.reference}`,
      summary: `${risk.title} is material and has no linked Decision Intelligence entry.`,
      evidence: [ref(risk)],
      provenance: { domain: "risk", ruleId: "risk.material_requires_decision.v1" },
      businessImpact: "high",
      recommendationTitle: "Create treatment decision",
      recommendationText: "Open a BOS-8 decision for treatment choice. Final acceptance remains human.",
    });
  }

  return drafts;
}
