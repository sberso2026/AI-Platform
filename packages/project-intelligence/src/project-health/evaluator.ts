import {
  evidenceFromCanonical,
  evidenceFromControls,
  type BoundCollection,
  type CanonicalRegisterItemRef,
  type KnowledgeFindingRef,
  type ProjectControlsSnapshot,
  type ProjectCoreSnapshot,
  type ProjectKnowledgeSnapshot,
} from "./source-contracts";
import type {
  ProjectHealthDimension,
  ProjectHealthDimensionResult,
  ProjectHealthEvidenceReference,
  ProjectHealthState,
} from "./types";

function unknownResult(
  dimension: ProjectHealthDimension,
  evaluatedAt: string,
  reasonCodes: readonly string[],
  limitations: readonly string[],
  source: ProjectHealthDimensionResult["source"] = "none",
  evidence: readonly ProjectHealthEvidenceReference[] = [],
  dataFreshness?: string,
): ProjectHealthDimensionResult {
  return {
    dimension,
    state: "unknown",
    reasonCodes,
    evidenceReferences: evidence,
    source,
    evaluatedAt,
    dataFreshness,
    limitations,
  };
}

function result(
  dimension: ProjectHealthDimension,
  state: ProjectHealthState,
  evaluatedAt: string,
  source: ProjectHealthDimensionResult["source"],
  reasonCodes: readonly string[],
  evidence: readonly ProjectHealthEvidenceReference[],
  limitations: readonly string[] = [],
  dataFreshness?: string,
): ProjectHealthDimensionResult {
  return {
    dimension,
    state,
    reasonCodes,
    evidenceReferences: evidence,
    source,
    evaluatedAt,
    dataFreshness,
    limitations,
  };
}

export function evaluateScheduleDimension(
  controls: ProjectControlsSnapshot,
  evaluatedAt: string,
): ProjectHealthDimensionResult {
  const output = controls.schedule;
  if (!output) {
    return unknownResult("schedule", evaluatedAt, ["schedule_missing"], ["absent_project_controls_schedule"]);
  }
  const evidence = [evidenceFromControls(output, "schedule_assessment")];
  const freshness = output.publishedAt ?? output.assessedAt;
  if (!output.published) {
    return unknownResult("schedule", evaluatedAt, ["schedule_unpublished"], ["unpublished_controls_state"], "project_controls", evidence, freshness);
  }
  if (output.abstained || !output.posture || output.posture === "unknown") {
    return unknownResult("schedule", evaluatedAt, ["schedule_abstained_or_unknown_posture"], ["controls_schedule_unknown"], "project_controls", evidence, freshness);
  }
  if (output.posture === "missed") {
    return result("schedule", "red", evaluatedAt, "project_controls", ["schedule_milestone_missed"], evidence, [], freshness);
  }
  if (output.posture === "at_risk") {
    return result("schedule", "amber", evaluatedAt, "project_controls", ["schedule_milestone_at_risk"], evidence, [], freshness);
  }
  if (output.posture === "on_track") {
    return result("schedule", "green", evaluatedAt, "project_controls", ["schedule_milestone_on_track"], evidence, [], freshness);
  }
  return unknownResult("schedule", evaluatedAt, ["schedule_posture_unmapped"], ["unmapped_controls_posture"], "project_controls", evidence, freshness);
}

export function evaluateCostDimension(
  controls: ProjectControlsSnapshot,
  evaluatedAt: string,
): ProjectHealthDimensionResult {
  const output = controls.cost;
  if (!output) {
    return unknownResult("cost", evaluatedAt, ["cost_missing"], ["absent_project_controls_cost"]);
  }
  const evidence = [evidenceFromControls(output, "cost_state")];
  const freshness = output.publishedAt ?? output.assessedAt;
  if (!output.published) {
    return unknownResult("cost", evaluatedAt, ["cost_unpublished"], ["unpublished_controls_state"], "project_controls", evidence, freshness);
  }
  if (output.abstained || !output.posture || output.posture === "unknown") {
    return unknownResult("cost", evaluatedAt, ["cost_abstained_or_unknown_posture"], ["controls_cost_unknown"], "project_controls", evidence, freshness);
  }
  if (output.posture === "over") {
    return result("cost", "red", evaluatedAt, "project_controls", ["cost_posture_over"], evidence, [], freshness);
  }
  if (output.posture === "attention_required") {
    return result("cost", "amber", evaluatedAt, "project_controls", ["cost_posture_attention_required"], evidence, [], freshness);
  }
  if (output.posture === "within_tolerance" || output.posture === "under") {
    return result("cost", "green", evaluatedAt, "project_controls", [`cost_posture_${output.posture}`], evidence, [], freshness);
  }
  return unknownResult("cost", evaluatedAt, ["cost_posture_unmapped"], ["unmapped_controls_posture"], "project_controls", evidence, freshness);
}

export function evaluateProgressDimension(
  controls: ProjectControlsSnapshot,
  evaluatedAt: string,
): ProjectHealthDimensionResult {
  const output = controls.progress;
  if (!output) {
    return unknownResult("progress", evaluatedAt, ["progress_missing"], ["absent_project_controls_progress"]);
  }
  const evidence = [evidenceFromControls(output, "progress_assessment")];
  const freshness = output.publishedAt ?? output.assessedAt;
  if (!output.published) {
    return unknownResult("progress", evaluatedAt, ["progress_unpublished"], ["unpublished_controls_state"], "project_controls", evidence, freshness);
  }
  if (output.abstained || !output.posture || output.posture === "unavailable" || output.posture === "unknown") {
    return unknownResult("progress", evaluatedAt, ["progress_abstained_or_unavailable"], ["controls_progress_unknown"], "project_controls", evidence, freshness);
  }
  if (output.posture === "declining") {
    return result("progress", "amber", evaluatedAt, "project_controls", ["progress_trend_declining"], evidence, [], freshness);
  }
  return result("progress", "green", evaluatedAt, "project_controls", ["progress_published_advisory"], evidence, ["progress_is_advisory_not_earned_value"], freshness);
}

export function evaluateChangeDimension(
  controls: ProjectControlsSnapshot,
  evaluatedAt: string,
): ProjectHealthDimensionResult {
  const output = controls.change;
  if (!output) {
    return unknownResult("change", evaluatedAt, ["change_missing"], ["absent_project_controls_change"]);
  }
  const evidence = [evidenceFromControls(output, "change_state")];
  const freshness = output.publishedAt ?? output.assessedAt;
  if (!output.published) {
    return unknownResult("change", evaluatedAt, ["change_unpublished"], ["unpublished_controls_state"], "project_controls", evidence, freshness);
  }
  if (output.abstained || !output.posture || output.posture === "unknown") {
    return unknownResult("change", evaluatedAt, ["change_abstained_or_unknown"], ["controls_change_unknown"], "project_controls", evidence, freshness);
  }
  if (output.posture === "pending") {
    return result("change", "amber", evaluatedAt, "project_controls", ["change_status_pending"], evidence, ["change_assessment_is_not_contractual_approval"], freshness);
  }
  if (output.posture === "approved_context" || output.posture === "rejected_context") {
    return result("change", "green", evaluatedAt, "project_controls", [`change_status_${output.posture}`], evidence, ["change_assessment_is_not_contractual_approval"], freshness);
  }
  return unknownResult("change", evaluatedAt, ["change_posture_unmapped"], ["unmapped_controls_posture"], "project_controls", evidence, freshness);
}

function openItems(items: readonly CanonicalRegisterItemRef[]): CanonicalRegisterItemRef[] {
  return items.filter((item) => item.open);
}

export function evaluateRiskDimension(
  core: ProjectCoreSnapshot,
  evaluatedAt: string,
): ProjectHealthDimensionResult {
  if (!core.risks.bound) {
    return unknownResult("risk", evaluatedAt, ["risk_register_unbound"], ["canonical_risks_not_bound"]);
  }
  const items = core.risks.items;
  const evidence = items.map((item) => evidenceFromCanonical("engineering_core", item));
  const freshness = core.risks.sourceTimestamp;
  const open = openItems(items);
  const red = open.filter(
    (item) => item.priority === "critical" || (typeof item.score === "number" && item.score >= 16),
  );
  if (red.length > 0) {
    return result(
      "risk",
      "red",
      evaluatedAt,
      "engineering_core",
      ["open_critical_or_high_score_risk"],
      red.map((item) => evidenceFromCanonical("engineering_core", item)),
      ["pc_risk_overlay_not_required_for_deterministic_register_eval"],
      freshness,
    );
  }
  const amber = open.filter(
    (item) => item.priority === "high" || (typeof item.score === "number" && item.score >= 9),
  );
  if (amber.length > 0) {
    return result(
      "risk",
      "amber",
      evaluatedAt,
      "engineering_core",
      ["open_elevated_risk"],
      amber.map((item) => evidenceFromCanonical("engineering_core", item)),
      [],
      freshness,
    );
  }
  return result("risk", "green", evaluatedAt, "engineering_core", ["no_open_elevated_risks"], evidence, [], freshness);
}

function qualityRedFindings(items: readonly KnowledgeFindingRef[]): KnowledgeFindingRef[] {
  return items.filter((item) => item.open && item.severity === "critical");
}

function qualityAmberFindings(items: readonly KnowledgeFindingRef[]): KnowledgeFindingRef[] {
  return items.filter((item) => item.open && (item.severity === "high" || item.category === "quality_concern"));
}

export function evaluateQualityDimension(
  core: ProjectCoreSnapshot,
  knowledge: ProjectKnowledgeSnapshot,
  evaluatedAt: string,
): ProjectHealthDimensionResult {
  const issuesBound = core.issues.bound;
  const findingsBound = knowledge.findings.bound;
  const inspectionBound = knowledge.inspectionFindings.bound;
  if (!issuesBound && !findingsBound && !inspectionBound) {
    return unknownResult("quality", evaluatedAt, ["quality_sources_unbound"], ["issues_and_findings_not_bound"]);
  }

  const limitations: string[] = [];
  if (!issuesBound) limitations.push("canonical_issues_unbound");
  if (!findingsBound) limitations.push("pi_findings_unbound");
  if (!inspectionBound) limitations.push("inspection_findings_unbound");

  const evidence: ProjectHealthEvidenceReference[] = [];
  let state: ProjectHealthState = "green";
  const reasonCodes: string[] = [];

  if (issuesBound) {
    const open = openItems(core.issues.items);
    evidence.push(...core.issues.items.map((item) => evidenceFromCanonical("engineering_core", item)));
    const red = open.filter((item) => item.priority === "critical");
    const amber = open.filter((item) => item.priority === "high");
    if (red.length > 0) {
      state = "red";
      reasonCodes.push("open_critical_issue");
    } else if (amber.length > 0) {
      state = "amber";
      reasonCodes.push("open_high_issue");
    }
  }

  const findingSets: Array<{ bound: BoundCollection<KnowledgeFindingRef>; domain: "project_intelligence" | "inspection_intelligence" }> = [
    { bound: knowledge.findings, domain: "project_intelligence" },
    { bound: knowledge.inspectionFindings, domain: "inspection_intelligence" },
  ];
  for (const set of findingSets) {
    if (!set.bound.bound) continue;
    evidence.push(...set.bound.items.map((item) => evidenceFromCanonical(set.domain, item)));
    const red = qualityRedFindings(set.bound.items);
    const amber = qualityAmberFindings(set.bound.items);
    if (red.length > 0) {
      state = "red";
      reasonCodes.push("open_critical_finding");
    } else if (amber.length > 0 && state !== "red") {
      state = "amber";
      reasonCodes.push("open_quality_finding");
    }
  }

  if (state === "green") reasonCodes.push("no_bound_quality_exceptions");
  const freshness =
    core.issues.bound
      ? core.issues.sourceTimestamp
      : knowledge.findings.bound
        ? knowledge.findings.sourceTimestamp
        : knowledge.inspectionFindings.bound
          ? knowledge.inspectionFindings.sourceTimestamp
          : undefined;
  const source = issuesBound ? "engineering_core" : findingsBound ? "project_intelligence" : "inspection_intelligence";
  return result("quality", state, evaluatedAt, source, reasonCodes, evidence, limitations, freshness);
}

export function evaluateDecisionsActionsDimension(
  core: ProjectCoreSnapshot,
  evaluatedAt: string,
): ProjectHealthDimensionResult {
  if (!core.decisions.bound && !core.actions.bound) {
    return unknownResult("decisions_actions", evaluatedAt, ["decisions_actions_unbound"], ["canonical_decisions_and_actions_not_bound"]);
  }
  const limitations: string[] = [];
  if (!core.decisions.bound) limitations.push("canonical_decisions_unbound");
  if (!core.actions.bound) limitations.push("canonical_actions_unbound");

  const evidence: ProjectHealthEvidenceReference[] = [];
  const evaluatedMs = Date.parse(evaluatedAt);
  let state: ProjectHealthState = "green";
  const reasonCodes: string[] = [];

  if (core.actions.bound) {
    evidence.push(...core.actions.items.map((item) => evidenceFromCanonical("engineering_core", item)));
    const overdue = openItems(core.actions.items).filter(
      (item) => item.dueAt && Number.isFinite(evaluatedMs) && Date.parse(item.dueAt) < evaluatedMs,
    );
    const open = openItems(core.actions.items);
    if (overdue.length > 0) {
      state = "red";
      reasonCodes.push("overdue_open_action");
    } else if (open.length > 0) {
      state = "amber";
      reasonCodes.push("open_action");
    }
  }

  if (core.decisions.bound) {
    evidence.push(...core.decisions.items.map((item) => evidenceFromCanonical("engineering_core", item)));
    const openDecisions = openItems(core.decisions.items);
    if (openDecisions.length > 0 && state !== "red") {
      state = "amber";
      reasonCodes.push("open_decision");
    }
  }

  if (state === "green") reasonCodes.push("no_open_overdue_decisions_or_actions");
  const freshness = core.actions.bound
    ? core.actions.sourceTimestamp
    : core.decisions.bound
      ? core.decisions.sourceTimestamp
      : undefined;
  return result("decisions_actions", state, evaluatedAt, "engineering_core", reasonCodes, evidence, limitations, freshness);
}

export function evaluateProjectHealthDimensions(input: {
  core: ProjectCoreSnapshot;
  controls: ProjectControlsSnapshot;
  knowledge: ProjectKnowledgeSnapshot;
  evaluatedAt: string;
}): readonly ProjectHealthDimensionResult[] {
  return [
    evaluateScheduleDimension(input.controls, input.evaluatedAt),
    evaluateCostDimension(input.controls, input.evaluatedAt),
    evaluateProgressDimension(input.controls, input.evaluatedAt),
    evaluateRiskDimension(input.core, input.evaluatedAt),
    evaluateQualityDimension(input.core, input.knowledge, input.evaluatedAt),
    evaluateChangeDimension(input.controls, input.evaluatedAt),
    evaluateDecisionsActionsDimension(input.core, input.evaluatedAt),
  ];
}
