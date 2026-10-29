import { captureBasisBaseline, createBasisGraph, roleMayApproveBasis } from "../engineering-basis";
import { createBaseline, createDeliveryLifecycle, requestStageTransition } from "../delivery-lifecycle";
import type { BaselineType, DeliveryStage } from "../delivery-lifecycle/model";
import { PIPING_CAPABILITIES, type PipingDelivery } from "./model";

export type PipingActor = {
  actorId: string;
  actorRole: string | null;
  at: string;
  workspaceId: string;
  canAuthorizeLifecycleTransition?: boolean;
  canApprove?: boolean;
};

export type PipingResultEnvelope = { delivery: PipingDelivery; error: string | null; approvalGranted: false };

function deny(delivery: PipingDelivery, error: string): PipingResultEnvelope {
  return { delivery, error, approvalGranted: false };
}
function ok(delivery: PipingDelivery): PipingResultEnvelope {
  return { delivery, error: null, approvalGranted: false };
}
function sameWorkspace(delivery: PipingDelivery, actor: PipingActor): boolean {
  return delivery.workspaceId === actor.workspaceId;
}
function audit(delivery: PipingDelivery, actor: PipingActor, action: string, detail: Record<string, string | number | boolean | null>): PipingDelivery {
  return { ...delivery, audits: [...delivery.audits, { action, at: actor.at, actorId: actor.actorId, detail }] };
}
function needUnit(value: string | null, unit: string | null, label: string): string | null {
  return value !== null && value !== "" && !unit ? `${label} needs a unit.` : null;
}

export function createPipingDelivery(input: {
  id: string; tenantId: string; workspaceId: string; projectId: string; projectTitle: string; actorId: string; at: string;
}): PipingResultEnvelope {
  const lifecycle = createDeliveryLifecycle({ id: `${input.id}-lifecycle`, tenantId: input.tenantId, workspaceId: input.workspaceId, projectId: input.projectId, actorId: input.actorId, at: input.at });
  const basis = createBasisGraph({ id: `${input.id}-basis`, tenantId: input.tenantId, workspaceId: input.workspaceId, projectId: input.projectId, actorId: input.actorId, at: input.at });
  const delivery: PipingDelivery = {
    id: input.id, tenantId: input.tenantId, workspaceId: input.workspaceId, projectId: input.projectId, projectTitle: input.projectTitle,
    lifecycle: lifecycle.lifecycle, basis: basis.graph, options: [], systems: [], lines: [], conditions: [], classes: [], materials: [],
    routes: [], valves: [], specialItems: [], tests: [], mtos: [], supports: [], restraints: [], nozzles: [], comparisons: [], tieIns: [],
    stressModels: [], stressCases: [], stressResults: [], models: [], interfaces: [], risks: [], decisions: [], assumptions: [],
    requirements: [], conflicts: [], reviews: [], deliverables: [], baselines: [],
    audits: [{ action: "piping_delivery_created", at: input.at, actorId: input.actorId, detail: { stage: "not_classified", formulasChanged: false, legacyEnrolled: false, identityMasterCreated: false } }],
  };
  return ok(delivery);
}

const EVIDENCE: Record<string, (delivery: PipingDelivery) => boolean> = {
  "problem or opportunity defined": (delivery) => delivery.projectTitle.length > 0,
  "candidate options identified": (delivery) => delivery.options.length >= 2,
  "major constraints recorded": (delivery) => delivery.assumptions.length > 0,
  "preliminary design basis exists": (delivery) => delivery.basis.basisItems.length > 0,
  "option evaluation evidence exists": (delivery) => delivery.options.length >= 2 && delivery.decisions.length > 0,
  "preferred option or continuation basis exists": (delivery) => delivery.decisions.some((item) => item.stage === "concept"),
  "feasibility design basis sufficiently developed": (delivery) => delivery.basis.basisItems.length > 0,
  "technical risks assessed": (delivery) => delivery.risks.length > 0,
  "major interfaces identified": (delivery) => delivery.interfaces.length > 0,
  "preferred option selected": (delivery) => delivery.decisions.length > 0,
  "unresolved critical assumptions identified": (delivery) => delivery.assumptions.length > 0,
  "controlled FEED design basis": (delivery) => delivery.basis.basisItems.some((item) => item.status === "accepted_for_stage" || item.status === "approved"),
  "requirements sufficiently mature": (delivery) => delivery.requirements.some((item) => item.sourceId),
  "key assumptions resolved or explicitly carried": (delivery) => delivery.assumptions.length > 0,
  "major discipline interfaces accepted": (delivery) => delivery.interfaces.some((item) => item.status === "accepted"),
  "deliverable register established": (delivery) => delivery.deliverables.length > 0,
  "major equipment or system configuration selected": (delivery) => delivery.lines.length > 0 || delivery.systems.length > 0,
  "design changes governed": () => true,
  "FEED baseline candidate available": (delivery) => delivery.baselines.some((item) => item.type === "feed_baseline"),
  "current design basis": (delivery) => delivery.basis.basisItems.some((item) => item.status === "accepted_for_stage" || item.status === "approved"),
  "controlled inputs": (delivery) => delivery.conditions.some((item) => item.status === "current"),
  "calculations linked to current inputs": (delivery) => delivery.stressResults.some((item) => item.inputIds.length > 0 && item.freshness === "current"),
  "interface closure or controlled exceptions": (delivery) => delivery.interfaces.length > 0,
  "deliverables under revision control": (delivery) => delivery.deliverables.length > 0,
  "review or verification state available": (delivery) => delivery.reviews.length > 0,
  "unresolved changes assessed": () => true,
  "configuration baseline identifiable": (delivery) => delivery.baselines.length > 0,
};

function withEvidence(delivery: PipingDelivery): PipingDelivery {
  return {
    ...delivery,
    lifecycle: {
      ...delivery.lifecycle,
      criteria: delivery.lifecycle.criteria.map((criterion) => {
        const check = EVIDENCE[criterion.criterion];
        return check && criterion.stage === delivery.lifecycle.stage && check(delivery) ? { ...criterion, status: "met" as const } : criterion;
      }),
    },
  };
}

export function progressPipingStage(delivery: PipingDelivery, actor: PipingActor, to: DeliveryStage, reason: string): PipingResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  const prepared = withEvidence(delivery);
  const transition = requestStageTransition(prepared.lifecycle, { to, reason, actorId: actor.actorId, actorRole: actor.actorRole, at: actor.at, canAuthorizeLifecycleTransition: actor.canAuthorizeLifecycleTransition === true });
  const next = audit({ ...prepared, lifecycle: transition.lifecycle }, actor, transition.committed ? "piping_stage_progressed" : "piping_stage_refused", { to, committed: transition.committed, error: transition.error });
  return transition.committed ? ok(next) : deny(next, transition.error ?? "stage transition was not committed");
}

export function addPipingBasis(delivery: PipingDelivery, actor: PipingActor, item: { id: string; title: string; statement: string; status?: "draft" | "accepted_for_stage" }): PipingResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  if (item.status === "accepted_for_stage" && !roleMayApproveBasis(actor.actorRole, true) && actor.actorRole !== "basis_reviewer") {
    return deny(delivery, "Stage acceptance requires a basis reviewer. It is not engineering approval.");
  }
  return ok(audit({
    ...delivery,
    basis: { ...delivery.basis, basisItems: [...delivery.basis.basisItems, {
      id: item.id, level: "discipline", discipline: "piping", category: "operating_condition", title: item.title, statement: item.statement, unit: null,
      sourceId: null, sourceRevision: null, stage: delivery.lifecycle.stage, status: item.status ?? "draft", revision: 1, effectiveAt: actor.at, owner: actor.actorId,
      reviewer: null, authorityState: "none", provenance: "piping_delivery", parentId: null, inheritance: "add", overrideRationale: null, supersedesId: null, approvalGranted: false,
    }] },
  }, actor, "piping_basis_recorded", { id: item.id, approvalGranted: false }));
}

type AttachKey = "options" | "systems" | "materials" | "valves" | "specialItems" | "restraints" | "stressCases" | "interfaces" | "risks" | "decisions" | "assumptions" | "requirements" | "deliverables";

export function attachPiping<K extends AttachKey>(delivery: PipingDelivery, actor: PipingActor, key: K, value: PipingDelivery[K][number]): PipingResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  const rows = delivery[key] as Array<PipingDelivery[K][number]>;
  return ok(audit({ ...delivery, [key]: [...rows, value] }, actor, "piping_record_attached", { key, id: "id" in value ? String(value.id) : key }));
}

export function addLine(delivery: PipingDelivery, actor: PipingActor, line: PipingDelivery["lines"][number]): PipingResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  const unitError = needUnit(line.designPressure, line.designPressureUnit, "Design pressure")
    ?? needUnit(line.designTemperature, line.designTemperatureUnit, "Design temperature")
    ?? needUnit(line.lineSize, line.lineSizeUnit, "Line size");
  if (unitError) return deny(delivery, unitError);
  if (line.lineSize && !line.lineSizeSource) return deny(delivery, "A line size needs a process, imported, or metadata source. Piping does not fabricate a size.");
  if (line.humanConfirmed && actor.actorRole === "ai") return deny(delivery, "AI may propose a stress-critical candidate. A human confirms the classification.");
  return ok(audit({ ...delivery, lines: [...delivery.lines, line] }, actor, "piping_line_recorded", { id: line.id, identityMasterCreated: false }));
}

export function calculatePipeSize(delivery: PipingDelivery): PipingResultEnvelope {
  return deny(delivery, "Pipe size is not calculated in this module.");
}

export function receiveProcessCondition(delivery: PipingDelivery, actor: PipingActor, condition: PipingDelivery["conditions"][number]): PipingResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  if (condition.ownedBy !== "process" || condition.pipingModified !== false) return deny(delivery, "A process condition remains owned by Process.");
  const unitError = needUnit(condition.value, condition.unit, "Process condition");
  if (unitError) return deny(delivery, unitError);
  return ok(audit({ ...delivery, conditions: [...delivery.conditions, condition] }, actor, "process_condition_received", { id: condition.id, pipingModified: false }));
}

export function modifyProcessCondition(delivery: PipingDelivery): PipingResultEnvelope {
  return deny(delivery, "Piping cannot modify a Process-owned condition. Record an interface, change, or technical query.");
}

export function receiveMechanicalNozzle(delivery: PipingDelivery, actor: PipingActor, nozzle: PipingDelivery["nozzles"][number]): PipingResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  if (nozzle.ownedBy !== "mechanical" || nozzle.pipingModified !== false) return deny(delivery, "A mechanical nozzle remains owned by Mechanical.");
  if (nozzle.allowableLoad && !nozzle.allowableSource) return deny(delivery, "Piping cannot invent an allowable nozzle load.");
  const unitError = needUnit(nozzle.allowableLoad, nozzle.allowableUnit, "Allowable nozzle load");
  if (unitError) return deny(delivery, unitError);
  return ok(audit({ ...delivery, nozzles: [...delivery.nozzles, nozzle] }, actor, "mechanical_nozzle_received", { id: nozzle.id, pipingModified: false }));
}

export function recordConflict(delivery: PipingDelivery, actor: PipingActor, conflict: { id: string; subjectId: string; statement: string }): PipingResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  return ok(audit({ ...delivery, conflicts: [...delivery.conflicts, { ...conflict, processModified: false, mechanicalModified: false }] }, actor, "piping_conflict_recorded", { id: conflict.id, processModified: false }));
}

export function addClass(delivery: PipingDelivery, actor: PipingActor, item: PipingDelivery["classes"][number]): PipingResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  return ok(audit({ ...delivery, classes: [...delivery.classes, { ...item, approvalGranted: false }] }, actor, "piping_class_recorded", { id: item.id, approvalGranted: false }));
}

export function addRoute(delivery: PipingDelivery, actor: PipingActor, route: PipingDelivery["routes"][number]): PipingResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  return ok(audit({ ...delivery, routes: [...delivery.routes, route] }, actor, "piping_route_recorded", { id: route.id }));
}

export function addSupport(delivery: PipingDelivery, actor: PipingActor, support: PipingDelivery["supports"][number]): PipingResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  const unitError = needUnit(support.reaction, support.unit, "Support reaction");
  if (unitError) return deny(delivery, unitError);
  return ok(audit({ ...delivery, supports: [...delivery.supports, { ...support, structuralDesign: false }] }, actor, "piping_support_recorded", { id: support.id, structuralDesign: false }));
}

export function addMto(delivery: PipingDelivery, actor: PipingActor, item: PipingDelivery["mtos"][number]): PipingResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  if (!item.quantity || !item.unit) return deny(delivery, "An MTO quantity needs a value and a unit.");
  return ok(audit({ ...delivery, mtos: [...delivery.mtos, { ...item, procurementAccurate: false }] }, actor, "piping_mto_recorded", { id: item.id, procurementAccurate: false }));
}

export function addTestRequirement(delivery: PipingDelivery, actor: PipingActor, item: PipingDelivery["tests"][number]): PipingResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  const unitError = needUnit(item.pressure, item.unit, "Test pressure");
  if (unitError) return deny(delivery, unitError);
  return ok(audit({ ...delivery, tests: [...delivery.tests, { ...item, calculatedHere: false }] }, actor, "piping_test_recorded", { id: item.id, calculatedHere: false }));
}

export function addTieIn(delivery: PipingDelivery, actor: PipingActor, item: PipingDelivery["tieIns"][number]): PipingResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  if (item.fieldVerified && !item.evidenceId) return deny(delivery, "Field conditions are not verified without evidence.");
  const stored = { ...item, fieldVerified: Boolean(item.fieldVerified && item.evidenceId) };
  return ok(audit({ ...delivery, tieIns: [...delivery.tieIns, stored] }, actor, "piping_tie_in_recorded", { id: item.id, fieldVerified: stored.fieldVerified }));
}

export function addStressModel(delivery: PipingDelivery, actor: PipingActor, model: PipingDelivery["stressModels"][number] & { certifyExecution?: boolean }): PipingResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  if (model.certifyExecution || model.executionCertified) return deny(delivery, "External piping stress execution is not certified by this delivery module.");
  return ok(audit({ ...delivery, stressModels: [...delivery.stressModels, { ...model, executionCertified: false }] }, actor, "piping_stress_model_registered", { id: model.id, executionCertified: false }));
}

export function addStressResult(delivery: PipingDelivery, actor: PipingActor, result: PipingDelivery["stressResults"][number] & { calculate?: boolean }): PipingResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  if (result.calculate || result.codeComplianceClaimed || result.executionCertified) return deny(delivery, "This module does not calculate piping stress or claim code compliance.");
  if (!result.provenance) return deny(delivery, "A stress result needs provenance.");
  const unitError = needUnit(result.value, result.unit, "Stress result");
  if (unitError) return deny(delivery, unitError);
  return ok(audit({ ...delivery, stressResults: [...delivery.stressResults, { ...result, codeComplianceClaimed: false, executionCertified: false }] }, actor, "piping_stress_result_recorded", { id: result.id, codeComplianceClaimed: false }));
}

export function recordNozzleComparison(delivery: PipingDelivery, actor: PipingActor, input: Omit<PipingDelivery["comparisons"][number], "state" | "acceptable"> & { declareAcceptable?: boolean }): PipingResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  if (input.declareAcceptable) return deny(delivery, "Piping does not declare nozzle acceptability.");
  if (input.allowableValue && !input.allowableUnit) return deny(delivery, "Allowable nozzle load needs a unit.");
  if (input.pipingLoadValue && !input.pipingLoadUnit) return deny(delivery, "Piping nozzle load needs a unit.");
  const both = Boolean(input.allowableValue && input.allowableUnit && input.pipingLoadValue && input.pipingLoadUnit);
  const row: PipingDelivery["comparisons"][number] = { ...input, state: both ? "compared" : "not_compared", acceptable: false };
  return ok(audit({ ...delivery, comparisons: [...delivery.comparisons, row] }, actor, "nozzle_comparison_recorded", { id: input.id, state: row.state, acceptable: false }));
}

export function registerPipingTool(delivery: PipingDelivery, actor: PipingActor, input: { id: string; tool: string; certifyExecution?: boolean; bidirectional?: boolean }): PipingResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  if (input.certifyExecution) return deny(delivery, "External piping stress execution is not certified by this delivery module.");
  if (input.bidirectional) return deny(delivery, "Bidirectional model synchronization is not implemented.");
  return ok(audit({ ...delivery, models: [...delivery.models, { id: input.id, tool: input.tool, revision: 1, bidirectional: false, executionCertified: false }] }, actor, "piping_tool_registered", { id: input.id, executionCertified: false, bidirectional: false }));
}

function mark<T extends { inputIds: string[]; freshness: "current" | "potentially_stale" }>(rows: T[], id: string): T[] {
  return rows.map((row) => row.inputIds.includes(id) ? { ...row, freshness: "potentially_stale" as const } : row);
}

export function reviseProcessCondition(delivery: PipingDelivery, actor: PipingActor, conditionId: string, value: string): PipingResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  const current = delivery.conditions.find((item) => item.id === conditionId && item.status === "current");
  if (!current) return deny(delivery, "The process condition was not found.");
  const successor = { ...current, id: `${current.id}-r${current.revision + 1}`, value, revision: current.revision + 1, pipingModified: false as const };
  const next: PipingDelivery = {
    ...delivery,
    conditions: delivery.conditions.map((item) => item.id === current.id ? { ...item, status: "superseded" as const } : item).concat(successor),
    lines: mark(delivery.lines, current.id),
    classes: mark(delivery.classes, current.id),
    stressModels: mark(delivery.stressModels, current.id),
    stressResults: mark(delivery.stressResults, current.id),
    supports: mark(delivery.supports, current.id),
    comparisons: mark(delivery.comparisons, current.id),
    interfaces: mark(delivery.interfaces, current.id),
    deliverables: mark(delivery.deliverables, current.id),
  };
  return ok(audit(next, actor, "process_condition_revised", { id: successor.id, previous: current.id, recalculated: false, pipingModified: false, freshness: "potentially_stale" }));
}

export function reviseNozzleLocation(delivery: PipingDelivery, actor: PipingActor, nozzleId: string, location: string): PipingResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  const current = delivery.nozzles.find((item) => item.id === nozzleId && item.status === "current");
  if (!current) return deny(delivery, "The mechanical nozzle was not found.");
  const successor = { ...current, id: `${current.id}-r${current.revision + 1}`, location, revision: current.revision + 1, pipingModified: false as const };
  const next: PipingDelivery = {
    ...delivery,
    nozzles: delivery.nozzles.map((item) => item.id === current.id ? { ...item, status: "superseded" as const } : item).concat(successor),
    routes: mark(delivery.routes, current.id),
    stressModels: mark(delivery.stressModels, current.id),
    supports: mark(delivery.supports, current.id),
    stressResults: mark(delivery.stressResults, current.id),
    comparisons: mark(delivery.comparisons, current.id),
    mtos: mark(delivery.mtos, current.id),
    deliverables: mark(delivery.deliverables, current.id),
  };
  return ok(audit(next, actor, "nozzle_location_revised", { id: successor.id, previous: current.id, recalculated: false, pipingModified: false, freshness: "potentially_stale" }));
}

export function reviewPiping(delivery: PipingDelivery, actor: PipingActor, review: { id: string; subjectId: string; revision: number; outcome: "reviewed" | "approved" }): PipingResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  if (review.outcome === "approved" && !roleMayApproveBasis(actor.actorRole, actor.canApprove)) return deny(delivery, "This role cannot approve piping work.");
  if (review.outcome === "approved" && actor.actorRole === "ai") return deny(delivery, "AI cannot approve piping stress, nozzle loads, piping class, or tie-in field conditions.");
  return ok(audit({ ...delivery, reviews: [...delivery.reviews, { ...review, approvalGranted: review.outcome === "approved" }] }, actor, "piping_review_recorded", { id: review.id, approvalGranted: review.outcome === "approved" }));
}

export function freezePiping(delivery: PipingDelivery, actor: PipingActor, baselineType: BaselineType, id: string): PipingResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  const lifecycleBaseline = createBaseline({ lifecycle: delivery.lifecycle, id, baselineType, actorId: actor.actorId, at: actor.at, unresolvedExceptions: delivery.assumptions.filter((item) => item.blocksNextStage).map((item) => item.id) });
  const basisSnapshot = captureBasisBaseline(delivery.basis, actor.actorId, actor.at);
  return ok(audit({
    ...delivery,
    lifecycle: lifecycleBaseline.lifecycle,
    baselines: [...delivery.baselines, {
      id, type: baselineType, frozen: true,
      conditionIds: delivery.conditions.filter((item) => item.status === "current").map((item) => item.id),
      nozzleIds: delivery.nozzles.filter((item) => item.status === "current").map((item) => item.id),
    }],
  }, actor, "piping_baseline_frozen", { id, baselineType, basisItems: basisSnapshot.basis.length }));
}

export function deliverableReadiness(delivery: PipingDelivery, id: string): { ifc: boolean; gaps: string[] } {
  const deliverable = delivery.deliverables.find((item) => item.id === id);
  if (!deliverable) return { ifc: false, gaps: ["deliverable_missing"] };
  const gaps: string[] = [];
  if (!deliverable.basisLinked) gaps.push("missing_design_basis");
  if (!delivery.conditions.length) gaps.push("missing_process_source");
  if (!delivery.nozzles.length) gaps.push("missing_mechanical_nozzle");
  if (deliverable.freshness !== "current") gaps.push("stale_dependency");
  if (delivery.stressModels.some((item) => item.freshness !== "current")) gaps.push("stale_stress_model");
  if (delivery.comparisons.some((item) => item.state === "not_compared")) gaps.push("unresolved_nozzle_load");
  if (delivery.interfaces.some((item) => item.status !== "accepted")) gaps.push("unresolved_interface");
  if (delivery.tieIns.some((item) => item.status === "open")) gaps.push("open_tie_in");
  if (!deliverable.reviewId) gaps.push("missing_review");
  if (delivery.lifecycle.stage !== "detailed_engineering") gaps.push("lifecycle_mismatch");
  const approved = delivery.reviews.some((item) => item.subjectId === deliverable.id && item.approvalGranted && item.revision === deliverable.revision);
  if (!approved) gaps.push("approval_not_granted");
  return { ifc: gaps.length === 0, gaps };
}

export function pipingAdvisory(delivery: PipingDelivery): string {
  const stale = delivery.lines.filter((item) => item.freshness === "potentially_stale").length + delivery.stressModels.filter((item) => item.freshness === "potentially_stale").length;
  return [
    "Advisory only.",
    `FACT: lifecycle stage is ${delivery.lifecycle.stage}.`,
    `RESULT: ${delivery.stressResults.length} stress result reference(s) are recorded. No pipe size, stress, or nozzle allowable was calculated by this statement.`,
    `ASSUMPTION: ${delivery.assumptions.length} piping assumption(s) are recorded.`,
    `INFERENCE: ${stale} line or stress-model reference(s) are potentially stale.`,
    "RECOMMENDATION: review stale process and nozzle references before the next baseline.",
    "HUMAN_DECISION_REQUIRED: a human decides whether the route or stress model must be revised.",
    "This statement does not invent piping quantities, approve stress, or certify code compliance.",
  ].join(" ");
}

export function pipingHome(delivery: PipingDelivery) {
  return {
    stage: delivery.lifecycle.stage,
    maturity: delivery.lifecycle.maturity,
    basisCount: delivery.basis.basisItems.length,
    requirementCount: delivery.requirements.length,
    lineCount: delivery.lines.filter((item) => item.status === "current").length,
    classCount: delivery.classes.filter((item) => item.status === "current").length,
    processCount: delivery.conditions.filter((item) => item.status === "current").length,
    nozzleCount: delivery.nozzles.filter((item) => item.status === "current").length,
    routeCount: delivery.routes.length,
    stressCriticalCount: delivery.lines.filter((item) => item.stressCritical && item.humanConfirmed).length,
    stressModelCount: delivery.stressModels.length,
    staleStressModels: delivery.stressModels.filter((item) => item.freshness === "potentially_stale").length,
    comparisonCount: delivery.comparisons.length,
    supportCount: delivery.supports.length,
    tieInCount: delivery.tieIns.length,
    reviewCount: delivery.reviews.length,
    deliverableCount: delivery.deliverables.length,
    blockers: delivery.lifecycle.criteria.filter((item) => item.blocking && item.status === "unmet").map((item) => item.criterion),
    capabilities: PIPING_CAPABILITIES,
    advisory: pipingAdvisory(delivery),
    approvalGranted: false as const,
  };
}

export function unimplementedPipingCalculations() {
  return PIPING_CAPABILITIES.filter((item) => item.state === "NOT_IMPLEMENTED");
}
