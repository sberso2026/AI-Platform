import { criteriaForGate } from "./profile";
import { fingerprintLifecycleEvidence } from "./fingerprint";
import type {
  GateReadiness,
  LifecycleCompleteness,
  LifecycleCriterionDefinition,
  LifecycleCriterionResult,
  LifecycleEvidence,
  LifecycleEvaluation,
  LifecycleProfile,
} from "./types";

function materialityRank(value?: string | null): number {
  const raw = String(value ?? "").toUpperCase();
  if (raw === "CRITICAL") return 4;
  if (raw === "HIGH") return 3;
  if (raw === "MEDIUM") return 2;
  if (raw === "LOW") return 1;
  return 0;
}

function result(
  criterion: LifecycleCriterionDefinition,
  now: string,
  status: LifecycleCriterionResult["status"],
  explanation: string,
  evidenceRefs: LifecycleCriterionResult["evidenceRefs"] = [],
  applicability: LifecycleCriterionResult["applicability"] = "APPLICABLE",
): LifecycleCriterionResult {
  return {
    criterionId: criterion.criterionId,
    criterionVersion: criterion.criterionVersion,
    type: criterion.type,
    applicability,
    status,
    explanation,
    evidenceRefs,
    evaluatedAt: now,
  };
}

function evaluateCriterion(
  criterion: LifecycleCriterionDefinition,
  evidence: LifecycleEvidence,
  now: string,
): LifecycleCriterionResult {
  if (criterion.type === "CONFIGURATION_BASELINE_REQUIRED") {
    const match = evidence.baselines.find(
      (row) =>
        row.baselineType === criterion.baselineType &&
        row.status === (criterion.requiredBaselineStatus ?? "frozen"),
    );
    if (!match) {
      return result(
        criterion,
        now,
        "NOT_SATISFIED",
        `No ${criterion.requiredBaselineStatus ?? "frozen"} ${criterion.baselineType} configuration baseline exists. Stage is unchanged.`,
      );
    }
    return result(criterion, now, "SATISFIED", `Frozen ${criterion.baselineType} baseline ${match.id} is present.`, [
      { objectType: "configuration_baseline", objectId: match.id },
    ]);
  }

  if (criterion.type === "REQUIREMENTS_CONTEXT_REQUIRED") {
    const active = evidence.requirements.filter((row) => row.status !== "draft");
    if (!active.length) {
      return result(criterion, now, "NOT_SATISFIED", "No selected requirements are available for this gate.");
    }
    const missing = active.filter((row) => !row.allocated);
    if (missing.length) {
      return result(
        criterion,
        now,
        "NOT_SATISFIED",
        `${missing.length} selected requirement(s) are not allocated.`,
        missing.map((row) => ({ objectType: "requirement", objectId: row.id })),
      );
    }
    return result(criterion, now, "SATISFIED", "Selected requirements have allocation context.", [
      { objectType: "requirement", objectId: active[0]!.id },
    ]);
  }

  if (criterion.type === "ASSUMPTION_REVIEW_REQUIRED") {
    const threshold = materialityRank(criterion.minMateriality ?? "HIGH");
    const material = evidence.assumptions.filter((row) => materialityRank(row.materiality) >= threshold);
    if (!material.length) {
      return result(criterion, now, "NOT_APPLICABLE", "No material assumptions are in scope.", [], "NOT_APPLICABLE");
    }
    const unmet = material.filter((row) => row.expired || !row.reviewed);
    if (unmet.length) {
      return result(
        criterion,
        now,
        "NOT_SATISFIED",
        `${unmet.length} material assumption(s) are expired or not reviewed. The project is not auto-invalidated.`,
        unmet.map((row) => ({ objectType: "assumption", objectId: row.id })),
      );
    }
    return result(criterion, now, "SATISFIED", "Material assumptions are reviewed.", [
      { objectType: "assumption", objectId: material[0]!.id },
    ]);
  }

  if (criterion.type === "INTERFACE_INFORMATION_REQUIRED") {
    const rows = evidence.interfaces.filter(
      (row) =>
        (!criterion.informationKey || row.informationKey === criterion.informationKey) &&
        (!criterion.sourceDiscipline || row.sourceDiscipline === criterion.sourceDiscipline) &&
        (!criterion.receivingDiscipline || row.receivingDiscipline === criterion.receivingDiscipline),
    );
    if (!rows.length) {
      return result(criterion, now, "UNKNOWN", "Required interface information was not encountered. Fail closed.", []);
    }
    const allowed = new Set(criterion.requiredInterfaceStatus ?? ["PROVIDED", "ACCEPTED"]);
    const unmet = rows.filter((row) => !allowed.has(row.status));
    if (unmet.length) {
      return result(
        criterion,
        now,
        "NOT_SATISFIED",
        `Interface ${unmet[0]!.informationKey} is ${unmet[0]!.status}, not ${[...allowed].join("/")}.`,
        unmet.map((row) => ({ objectType: "interface", objectId: row.id, note: `${row.informationKey}:${row.status}` })),
      );
    }
    return result(criterion, now, "SATISFIED", "Configured interface information is in an accepted state.", [
      { objectType: "interface", objectId: rows[0]!.id, note: rows[0]!.informationKey },
    ]);
  }

  if (criterion.type === "ANALYSIS_EVIDENCE_REQUIRED") {
    const applicable = evidence.analyses.filter((row) => row.applicable);
    if (!applicable.length) {
      return result(
        criterion,
        now,
        "NOT_APPLICABLE",
        "No applicable analysis is in this lifecycle scope. Unavailable external solvers do not block unrelated scopes.",
        [],
        "NOT_APPLICABLE",
      );
    }
    const unmet = applicable.filter((row) => !row.valid || !row.reviewed || row.stale);
    if (unmet.length) {
      return result(
        criterion,
        now,
        "NOT_SATISFIED",
        "Applicable analysis evidence is missing, unreviewed, or stale.",
        unmet.map((row) => ({ objectType: "analysis_result", objectId: row.id })),
      );
    }
    return result(criterion, now, "SATISFIED", "Applicable analysis evidence is valid and reviewed.", [
      { objectType: "analysis_result", objectId: applicable[0]!.id },
    ]);
  }

  if (criterion.type === "ENGINEERING_REVIEW_REQUIRED") {
    const pkg = evidence.reviews[0];
    if (!pkg) {
      return result(criterion, now, "NOT_SATISFIED", "No canonical Engineering Review Package is referenced.");
    }
    return result(criterion, now, "SATISFIED", `Review Package ${pkg.id} is referenced. Findings remain Review-owned.`, [
      { objectType: "review_package", objectId: pkg.id },
    ]);
  }

  if (criterion.type === "DECISION_EVIDENCE_REQUIRED") {
    const decision = evidence.decisions.find((row) => row.status !== "draft");
    if (!decision) {
      return result(criterion, now, "NOT_SATISFIED", "No canonical Decision is available for this gate.");
    }
    return result(criterion, now, "SATISFIED", `Decision ${decision.id} provides governed context.`, [
      { objectType: "decision", objectId: decision.id },
    ]);
  }

  if (criterion.type === "ASSURANCE_EVALUATION_COMPLETE") {
    if (evidence.assurance.completeness !== "COMPLETE") {
      return result(
        criterion,
        now,
        "NOT_SATISFIED",
        `Assurance evaluation is ${evidence.assurance.completeness}. PARTIAL/FAILED cannot ready a gate.`,
      );
    }
    return result(criterion, now, "SATISFIED", "Assurance evaluation completeness is COMPLETE.");
  }

  if (criterion.type === "NO_OPEN_BLOCKING_ASSURANCE_CONDITIONS") {
    const types = new Set(criterion.blockingConditionTypes ?? []);
    const threshold = materialityRank(criterion.minMateriality ?? "HIGH");
    const blocking = evidence.assurance.conditions.filter(
      (row) =>
        ["OPEN", "ACKNOWLEDGED", "UNDER_REVIEW"].includes(row.status) &&
        types.has(row.conditionType) &&
        materialityRank(row.materiality) >= threshold,
    );
    if (blocking.length) {
      return result(
        criterion,
        now,
        "NOT_SATISFIED",
        `${blocking.length} configured blocking Assurance Condition(s) remain open. Other open conditions do not block this gate.`,
        blocking.map((row) => ({ objectType: "assurance_condition", objectId: row.id })),
      );
    }
    return result(
      criterion,
      now,
      "SATISFIED",
      "No configured blocking Assurance Conditions are open. Unconfigured open conditions are not treated as gate blockers.",
    );
  }

  if (criterion.type === "CHANGE_SURFACED") {
    const material = evidence.changes.filter((row) => row.material && !["cancelled", "rejected", "verified"].includes(row.status));
    if (!material.length) {
      return result(criterion, now, "SATISFIED", "No active material Changes to surface.", [], "APPLICABLE");
    }
    return result(
      criterion,
      now,
      "SATISFIED",
      `${material.length} active material Change(s) are surfaced. They are not automatic blockers or confirmed Impacts.`,
      material.map((row) => ({ objectType: "change", objectId: row.id, note: row.status })),
    );
  }

  if (criterion.type === "OPTIMIZATION_CONTEXT") {
    const policy = criterion.optimizationPolicy ?? evidence.optimizationPolicy;
    if (policy === "NOT_APPLICABLE" || policy === "OPTIONAL") {
      return result(
        criterion,
        now,
        "NOT_APPLICABLE",
        `Optimization is ${policy} for this stage/profile. Not universally required.`,
        evidence.optimizationPresent ? [{ objectType: "optimization_run", objectId: "present" }] : [],
        "NOT_APPLICABLE",
      );
    }
    if (!evidence.optimizationPresent) {
      return result(criterion, now, "NOT_SATISFIED", "Optimization is required for this profile and no run/study is present.");
    }
    return result(criterion, now, "SATISFIED", "Required Optimization context is present. No alternative is selected.");
  }

  if (criterion.type === "TRACEABILITY_MATURITY_REQUIRED") {
    return result(criterion, now, "NOT_APPLICABLE", "Traceability maturity remains an overlay, not a lifecycle stage.", [], "NOT_APPLICABLE");
  }

  return result(criterion, now, "UNKNOWN", "Unknown criterion type failed closed.");
}

export function completenessFromEvidence(evidence: LifecycleEvidence): {
  completeness: LifecycleCompleteness;
  reason: string | null;
} {
  if (evidence.failed) return { completeness: "FAILED", reason: evidence.failureReason ?? "evaluation_failed" };
  if (evidence.truncated) return { completeness: "PARTIAL", reason: "lifecycle_criterion_scan_truncated" };
  return { completeness: "COMPLETE", reason: null };
}

export function readinessFromResults(
  completeness: LifecycleCompleteness,
  results: readonly LifecycleCriterionResult[],
): GateReadiness {
  if (completeness === "FAILED") return "FAILED";
  if (completeness === "PARTIAL") return "PARTIAL";
  const applicable = results.filter((row) => row.applicability === "APPLICABLE" && !row.waived);
  if (applicable.some((row) => row.status === "UNKNOWN")) return "FAILED";
  if (applicable.some((row) => row.status === "NOT_SATISFIED")) return "NOT_READY";
  if (applicable.every((row) => row.status === "SATISFIED")) return "READY_FOR_REVIEW";
  return "NOT_READY";
}

export function evaluateLifecycleGate(input: {
  tenantId: string;
  workspaceId: string;
  assignmentId: string;
  profile: LifecycleProfile;
  gateId: string;
  evidence: LifecycleEvidence;
  now?: string;
  enabledCriterionIds?: readonly string[] | null;
  evaluationId?: string;
}): LifecycleEvaluation {
  const now = input.now ?? new Date().toISOString();
  const completeness = completenessFromEvidence(input.evidence);
  const definitions = criteriaForGate(input.profile, input.gateId, input.enabledCriterionIds);
  const unknownRequired = input.enabledCriterionIds?.some((id) => !input.profile.criteria.some((row) => row.criterionId === id));
  const criteria = definitions.map((criterion) => evaluateCriterion(criterion, input.evidence, now));
  if (unknownRequired) {
    criteria.push({
      criterionId: "UNKNOWN",
      criterionVersion: "v1",
      type: "TRACEABILITY_MATURITY_REQUIRED",
      applicability: "APPLICABLE",
      status: "UNKNOWN",
      explanation: "Unknown criterion id failed closed.",
      evidenceRefs: [],
      evaluatedAt: now,
    });
  }
  const readiness = readinessFromResults(completeness.completeness, criteria);
  return {
    id: input.evaluationId ?? crypto.randomUUID(),
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    assignmentId: input.assignmentId,
    gateId: input.gateId,
    profileId: input.profile.profileId,
    profileVersion: input.profile.profileVersion,
    completeness: completeness.completeness,
    readiness,
    truncated: Boolean(input.evidence.truncated),
    remainingScopeUnknown: completeness.completeness !== "COMPLETE",
    reason: completeness.reason,
    criteria,
    evidenceFingerprint: fingerprintLifecycleEvidence(input.evidence),
    createdAt: now,
    stale: false,
  };
}

export function markEvaluationStale(
  evaluation: LifecycleEvaluation,
  currentFingerprint: string,
): LifecycleEvaluation {
  if (evaluation.evidenceFingerprint === currentFingerprint) return evaluation;
  return { ...evaluation, stale: true, readiness: "STALE" };
}

export function canAuthorizeTransition(input: {
  evaluation: LifecycleEvaluation;
  profileVersion: string;
  decision: { decision: string; evaluationId: string } | null;
}): { ok: true } | { ok: false; reason: string } {
  if (input.evaluation.stale || input.evaluation.readiness === "STALE") {
    return { ok: false, reason: "stale_gate_evaluation" };
  }
  if (input.evaluation.profileVersion !== input.profileVersion) {
    return { ok: false, reason: "profile_version_mismatch" };
  }
  if (!input.decision) return { ok: false, reason: "human_gate_decision_required" };
  if (input.decision.evaluationId !== input.evaluation.id) return { ok: false, reason: "stale_gate_decision" };
  if (input.evaluation.completeness !== "COMPLETE") return { ok: false, reason: "gate_not_ready" };
  if (input.decision.decision === "WAIVED") return { ok: true };
  if (input.evaluation.readiness !== "READY_FOR_REVIEW") return { ok: false, reason: "gate_not_ready" };
  if (!["APPROVED_TO_TRANSITION", "APPROVED_WITH_CONDITIONS"].includes(input.decision.decision)) {
    return { ok: false, reason: "gate_decision_does_not_permit_transition" };
  }
  return { ok: true };
}
