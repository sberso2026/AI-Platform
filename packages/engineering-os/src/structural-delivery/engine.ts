import { captureBasisBaseline, createBasisGraph, roleMayApproveBasis } from "../engineering-basis";
import { createBaseline, createDeliveryLifecycle, requestStageTransition } from "../delivery-lifecycle";
import type { BaselineType, DeliveryStage } from "../delivery-lifecycle/model";
import {
  D1_PRESERVED_LIMITATIONS,
  STRUCTURAL_CAPABILITIES,
  type SolverTool,
  type StructuralCalculation,
  type StructuralDelivery,
  type StructuralLoad,
} from "./model";

export type StructuralActor = {
  actorId: string;
  actorRole: string | null;
  at: string;
  workspaceId: string;
  canAuthorizeLifecycleTransition?: boolean;
  canApprove?: boolean;
};

export type StructuralResultEnvelope = {
  delivery: StructuralDelivery;
  error: string | null;
  approvalGranted: false;
};

function deny(delivery: StructuralDelivery, error: string): StructuralResultEnvelope {
  return { delivery, error, approvalGranted: false };
}

function ok(delivery: StructuralDelivery): StructuralResultEnvelope {
  return { delivery, error: null, approvalGranted: false };
}

function sameWorkspace(delivery: StructuralDelivery, actor: StructuralActor): boolean {
  return delivery.workspaceId === actor.workspaceId;
}

function audit(delivery: StructuralDelivery, actor: StructuralActor, action: string, detail: Record<string, string | number | boolean | null>): StructuralDelivery {
  return { ...delivery, audits: [...delivery.audits, { action, at: actor.at, actorId: actor.actorId, detail }] };
}

export function createStructuralDelivery(input: {
  id: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  projectTitle: string;
  actorId: string;
  at: string;
}): StructuralResultEnvelope {
  const lifecycle = createDeliveryLifecycle({
    id: `${input.id}-lifecycle`,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    projectId: input.projectId,
    actorId: input.actorId,
    at: input.at,
  });
  const basis = createBasisGraph({
    id: `${input.id}-basis`,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    projectId: input.projectId,
    actorId: input.actorId,
    at: input.at,
  });
  const delivery: StructuralDelivery = {
    id: input.id,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    projectId: input.projectId,
    projectTitle: input.projectTitle,
    assetName: null,
    lifecycle: lifecycle.lifecycle,
    basis: basis.graph,
    options: [],
    systems: [],
    structures: [],
    members: [],
    materials: [],
    loads: [],
    loadCases: [],
    combinations: [],
    supports: [],
    connections: [],
    foundations: [],
    models: [],
    calculations: [],
    results: [],
    checks: [],
    interfaces: [],
    risks: [],
    decisions: [],
    assumptions: [],
    requirements: [],
    changes: [],
    reviews: [],
    deliverables: [],
    baselines: [],
    solverPackages: [],
    audits: [{ action: "structural_delivery_created", at: input.at, actorId: input.actorId, detail: { stage: "not_classified", formulasChanged: false, legacyEnrolled: false } }],
  };
  return ok(delivery);
}

const EVIDENCE: Record<string, (delivery: StructuralDelivery) => boolean> = {
  "problem or opportunity defined": (delivery) => delivery.projectTitle.length > 0,
  "candidate options identified": (delivery) => delivery.options.length >= 2,
  "major constraints recorded": (delivery) => delivery.assumptions.length > 0,
  "preliminary design basis exists": (delivery) => delivery.basis.basisItems.length > 0,
  "option evaluation evidence exists": (delivery) => delivery.options.length >= 2 && delivery.decisions.length > 0,
  "preferred option or continuation basis exists": (delivery) => delivery.decisions.some((item) => item.stage === "concept"),
  "feasibility design basis sufficiently developed": (delivery) => delivery.basis.basisItems.length > 0,
  "technical risks assessed": (delivery) => delivery.risks.length > 0,
  "major interfaces identified": (delivery) => delivery.interfaces.length > 0,
  "preferred option selected": (delivery) => delivery.decisions.some((item) => item.stage === "feasibility" || item.stage === "concept"),
  "unresolved critical assumptions identified": (delivery) => delivery.assumptions.length > 0,
  "controlled FEED design basis": (delivery) => delivery.basis.basisItems.some((item) => item.status === "accepted_for_stage" || item.status === "approved"),
  "requirements sufficiently mature": (delivery) => delivery.requirements.some((item) => item.sourceId),
  "key assumptions resolved or explicitly carried": (delivery) => delivery.assumptions.length > 0,
  "major discipline interfaces accepted": (delivery) => delivery.interfaces.some((item) => item.status === "accepted"),
  "deliverable register established": (delivery) => delivery.deliverables.length > 0,
  "major equipment or system configuration selected": (delivery) => delivery.systems.length > 0,
  "design changes governed": (delivery) => true,
  "FEED baseline candidate available": (delivery) => delivery.baselines.some((item) => item.type === "feed_baseline"),
  "current design basis": (delivery) => delivery.basis.basisItems.some((item) => item.status === "accepted_for_stage" || item.status === "approved"),
  "controlled inputs": (delivery) => delivery.loads.some((item) => item.status === "current" && item.sourceId),
  "calculations linked to current inputs": (delivery) => delivery.calculations.some((item) => item.loadIds.length > 0 && item.freshness === "current"),
  "interface closure or controlled exceptions": (delivery) => delivery.interfaces.length > 0,
  "deliverables under revision control": (delivery) => delivery.deliverables.length > 0,
  "review or verification state available": (delivery) => delivery.reviews.length > 0,
  "unresolved changes assessed": (delivery) => delivery.changes.every((item) => item.approved === false),
  "configuration baseline identifiable": (delivery) => delivery.baselines.length > 0,
};

function withEvidence(delivery: StructuralDelivery): StructuralDelivery {
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

export function progressStructuralStage(delivery: StructuralDelivery, actor: StructuralActor, to: DeliveryStage, reason: string): StructuralResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  const prepared = withEvidence(delivery);
  const transition = requestStageTransition(prepared.lifecycle, {
    to,
    reason,
    actorId: actor.actorId,
    actorRole: actor.actorRole,
    at: actor.at,
    canAuthorizeLifecycleTransition: actor.canAuthorizeLifecycleTransition === true,
  });
  const next = audit({ ...prepared, lifecycle: transition.lifecycle }, actor, transition.committed ? "structural_stage_progressed" : "structural_stage_refused", {
    to,
    committed: transition.committed,
    error: transition.error,
  });
  if (!transition.committed) return deny(next, transition.error ?? "stage transition was not committed");
  return ok(next);
}

export function addStructuralBasis(delivery: StructuralDelivery, actor: StructuralActor, item: { id: string; title: string; statement: string; status?: "draft" | "accepted_for_stage" }): StructuralResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  if (item.status === "accepted_for_stage" && !roleMayApproveBasis(actor.actorRole, true) && actor.actorRole !== "basis_reviewer") {
    return deny(delivery, "Stage acceptance requires a basis reviewer. It is not engineering approval.");
  }
  const basisItem = {
    id: item.id,
    level: "discipline" as const,
    discipline: "structural" as const,
    category: "load_action_basis" as const,
    title: item.title,
    statement: item.statement,
    unit: null,
    sourceId: null,
    sourceRevision: null,
    stage: delivery.lifecycle.stage,
    status: item.status ?? "draft" as const,
    revision: 1,
    effectiveAt: actor.at,
    owner: actor.actorId,
    reviewer: null,
    authorityState: "none" as const,
    provenance: "structural_delivery",
    parentId: null,
    inheritance: "add" as const,
    overrideRationale: null,
    supersedesId: null,
    approvalGranted: false as const,
  };
  return ok(audit({ ...delivery, basis: { ...delivery.basis, basisItems: [...delivery.basis.basisItems, basisItem] } }, actor, "structural_basis_recorded", { id: item.id, approvalGranted: false }));
}

export function addOption(delivery: StructuralDelivery, actor: StructuralActor, option: StructuralDelivery["options"][number]): StructuralResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  return ok(audit({ ...delivery, options: [...delivery.options, option] }, actor, "structural_option_recorded", { id: option.id }));
}

export function addAssumption(delivery: StructuralDelivery, actor: StructuralActor, assumption: StructuralDelivery["assumptions"][number]): StructuralResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  return ok(audit({ ...delivery, assumptions: [...delivery.assumptions, assumption] }, actor, "structural_assumption_recorded", { id: assumption.id }));
}

export function addDecision(delivery: StructuralDelivery, actor: StructuralActor, decision: StructuralDelivery["decisions"][number]): StructuralResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  return ok(audit({ ...delivery, decisions: [...delivery.decisions, decision] }, actor, "structural_decision_recorded", { id: decision.id }));
}

export function addLoad(delivery: StructuralDelivery, actor: StructuralActor, load: StructuralLoad): StructuralResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  if (load.value !== null && !load.unit) return deny(delivery, "A numeric structural load needs a unit.");
  return ok(audit({ ...delivery, loads: [...delivery.loads, load] }, actor, "structural_load_recorded", { id: load.id, synthetic: load.synthetic }));
}

export function reviseLoad(delivery: StructuralDelivery, actor: StructuralActor, id: string, value: string): StructuralResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  const current = delivery.loads.find((item) => item.id === id && item.status === "current");
  if (!current) return deny(delivery, "The structural load was not found.");
  const successor: StructuralLoad = { ...current, id: `${current.id}-r${current.revision + 1}`, value, revision: current.revision + 1, status: "current" };
  const affectedCalculations = new Set(delivery.calculations.filter((item) => item.loadIds.includes(current.id)).map((item) => item.id));
  const next: StructuralDelivery = {
    ...delivery,
    loads: delivery.loads.map((item) => item.id === current.id ? { ...item, status: "superseded" as const } : item).concat(successor),
    calculations: delivery.calculations.map((item) => affectedCalculations.has(item.id) ? { ...item, freshness: "potentially_stale" as const } : item),
    models: delivery.models.map((item) => item.loadRevisionIds.includes(current.id) ? { ...item, freshness: "potentially_stale" as const } : item),
    results: delivery.results.map((item) => affectedCalculations.has(item.calculationId) ? { ...item, freshness: "potentially_stale" as const } : item),
    deliverables: delivery.deliverables.map((item) => item.calculationIds.some((calculationId) => affectedCalculations.has(calculationId)) ? { ...item, freshness: "potentially_stale" as const } : item),
  };
  return ok(audit(next, actor, "structural_load_revised", { id: successor.id, previous: current.id, recalculated: false, freshness: "potentially_stale" }));
}

export function addCalculation(delivery: StructuralDelivery, actor: StructuralActor, calculation: Omit<StructuralCalculation, "codeComplianceClaimed" | "freshness"> & { freshness?: StructuralCalculation["freshness"] }): StructuralResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  if (calculation.engine === "existing_d1_reference" && !calculation.d1CalculationId) return deny(delivery, "A D1 reference needs the existing calculation identity.");
  const stored: StructuralCalculation = { ...calculation, freshness: calculation.freshness ?? "current", codeComplianceClaimed: false };
  return ok(audit({ ...delivery, calculations: [...delivery.calculations, stored] }, actor, "structural_calculation_linked", { id: stored.id, engine: stored.engine, evaluatedHere: false }));
}

export function registerSolverPackage(delivery: StructuralDelivery, actor: StructuralActor, input: { id: string; tool: SolverTool; certifyExecution?: boolean }): StructuralResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  if (input.certifyExecution) return deny(delivery, "Solver execution is not certified by this delivery module.");
  const status = input.tool === "SPACE_GASS" ? "read_only_connector" as const : "metadata_only" as const;
  return ok(audit({
    ...delivery,
    solverPackages: [...delivery.solverPackages, { id: input.id, tool: input.tool, executionCertified: false, status }],
  }, actor, "solver_package_registered", { id: input.id, tool: input.tool, executionCertified: false }));
}

export function reviewStructural(delivery: StructuralDelivery, actor: StructuralActor, review: { id: string; subjectId: string; revision: number; outcome: "reviewed" | "approved" }): StructuralResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  if (review.outcome === "approved" && !roleMayApproveBasis(actor.actorRole, actor.canApprove)) return deny(delivery, "This role cannot approve structural work.");
  return ok(audit({
    ...delivery,
    reviews: [...delivery.reviews, { ...review, role: actor.actorRole ?? "unspecified", approvalGranted: review.outcome === "approved" }],
  }, actor, "structural_review_recorded", { id: review.id, outcome: review.outcome, approvalGranted: review.outcome === "approved" }));
}

export function freezeStructural(delivery: StructuralDelivery, actor: StructuralActor, baselineType: BaselineType, id: string): StructuralResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  const lifecycleBaseline = createBaseline({
    lifecycle: delivery.lifecycle,
    id,
    baselineType,
    actorId: actor.actorId,
    at: actor.at,
    unresolvedExceptions: delivery.assumptions.filter((item) => item.blocksNextStage).map((item) => item.id),
  });
  const basisSnapshot = captureBasisBaseline(delivery.basis, actor.actorId, actor.at);
  const snapshot = {
    id,
    type: baselineType,
    frozen: true as const,
    loadIds: delivery.loads.filter((item) => item.status === "current").map((item) => item.id),
    calculationIds: delivery.calculations.map((item) => item.id),
    modelIds: delivery.models.map((item) => item.id),
  };
  return ok(audit({
    ...delivery,
    lifecycle: lifecycleBaseline.lifecycle,
    baselines: [...delivery.baselines, snapshot],
    audits: delivery.audits,
  }, actor, "structural_baseline_frozen", { id, baselineType, basisItems: basisSnapshot.basis.length }));
}

export function deliverableReadiness(delivery: StructuralDelivery, id: string): { ifc: boolean; gaps: string[] } {
  const deliverable = delivery.deliverables.find((item) => item.id === id);
  if (!deliverable) return { ifc: false, gaps: ["deliverable_missing"] };
  const gaps: string[] = [];
  if (!deliverable.basisLinked) gaps.push("missing_design_basis");
  if (!deliverable.requirementLinked) gaps.push("missing_requirement_linkage");
  if (deliverable.freshness !== "current") gaps.push("stale_dependency");
  if (delivery.interfaces.some((item) => item.status !== "accepted")) gaps.push("unresolved_interface");
  if (!deliverable.reviewId) gaps.push("missing_review");
  if (delivery.models.some((item) => item.status === "superseded" && deliverable.modelIds.includes(item.id))) gaps.push("superseded_model");
  if (delivery.lifecycle.stage !== "detailed_engineering" || deliverable.stage !== "detailed_engineering") gaps.push("lifecycle_mismatch");
  const approved = delivery.reviews.some((item) => item.subjectId === deliverable.id && item.approvalGranted && item.revision === deliverable.revision);
  if (!approved) gaps.push("approval_not_granted");
  return { ifc: gaps.length === 0, gaps };
}

export function attachStructural<K extends "systems" | "structures" | "members" | "interfaces" | "requirements" | "risks" | "models" | "deliverables" | "foundations" | "connections" | "loadCases" | "results">(
  delivery: StructuralDelivery,
  actor: StructuralActor,
  key: K,
  value: StructuralDelivery[K][number],
): StructuralResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  const rows = delivery[key] as Array<StructuralDelivery[K][number]>;
  return ok(audit({ ...delivery, [key]: [...rows, value] }, actor, "structural_record_attached", { key, id: "id" in value ? String(value.id) : key }));
}

export function structuralHome(delivery: StructuralDelivery) {
  return {
    stage: delivery.lifecycle.stage,
    maturity: delivery.lifecycle.maturity,
    basisCount: delivery.basis.basisItems.length,
    requirementCount: delivery.requirements.length,
    openAssumptions: delivery.assumptions.length,
    loadCount: delivery.loads.filter((item) => item.status === "current").length,
    modelCount: delivery.models.filter((item) => item.status === "registered").length,
    calculationCount: delivery.calculations.length,
    staleCalculations: delivery.calculations.filter((item) => item.freshness === "potentially_stale").length,
    interfaceCount: delivery.interfaces.length,
    openChanges: delivery.changes.length,
    reviewCount: delivery.reviews.length,
    deliverableCount: delivery.deliverables.length,
    blockers: delivery.lifecycle.criteria.filter((item) => item.blocking && item.status === "unmet").map((item) => item.criterion),
    limitations: D1_PRESERVED_LIMITATIONS,
    capabilities: STRUCTURAL_CAPABILITIES,
    advisory: structuralAdvisory(delivery),
    approvalGranted: false as const,
  };
}

export function structuralAdvisory(delivery: StructuralDelivery): string {
  const stale = delivery.calculations.filter((item) => item.freshness === "potentially_stale").length;
  return [
    "Advisory only.",
    `FACT: lifecycle stage is ${delivery.lifecycle.stage}.`,
    `RESULT: ${delivery.results.length} structural result reference(s) are recorded. No result was calculated by this statement.`,
    `ASSUMPTION: ${delivery.assumptions.length} structural assumption(s) are recorded.`,
    `INFERENCE: ${stale} calculation reference(s) are potentially stale.`,
    "RECOMMENDATION: review stale references before the next baseline.",
    "HUMAN_DECISION_REQUIRED: a human decides whether recalculation is required.",
    "This statement does not invent capacity, claim code compliance, or approve the structural design.",
  ].join(" ");
}

export function activeCapabilities() {
  return STRUCTURAL_CAPABILITIES.filter((item) => item.state === "IMPLEMENTED" || item.state === "QUALIFIED");
}

export function hiddenCalculations() {
  return STRUCTURAL_CAPABILITIES.filter((item) => item.state === "NOT_IMPLEMENTED");
}
