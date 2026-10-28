import { captureBasisBaseline, createBasisGraph, roleMayApproveBasis } from "../engineering-basis";
import { createBaseline, createDeliveryLifecycle, requestStageTransition } from "../delivery-lifecycle";
import type { BaselineType, DeliveryStage } from "../delivery-lifecycle/model";
import { PROCESS_CAPABILITIES, type ProcessDelivery, type ProcessStream, type SimulatorTool } from "./model";

export type ProcessActor = {
  actorId: string;
  actorRole: string | null;
  at: string;
  workspaceId: string;
  canAuthorizeLifecycleTransition?: boolean;
  canApprove?: boolean;
};

export type ProcessResultEnvelope = { delivery: ProcessDelivery; error: string | null; approvalGranted: false };

function deny(delivery: ProcessDelivery, error: string): ProcessResultEnvelope {
  return { delivery, error, approvalGranted: false };
}
function ok(delivery: ProcessDelivery): ProcessResultEnvelope {
  return { delivery, error: null, approvalGranted: false };
}
function sameWorkspace(delivery: ProcessDelivery, actor: ProcessActor): boolean {
  return delivery.workspaceId === actor.workspaceId;
}
function audit(delivery: ProcessDelivery, actor: ProcessActor, action: string, detail: Record<string, string | number | boolean | null>): ProcessDelivery {
  return { ...delivery, audits: [...delivery.audits, { action, at: actor.at, actorId: actor.actorId, detail }] };
}

export function createProcessDelivery(input: {
  id: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  projectTitle: string;
  actorId: string;
  at: string;
}): ProcessResultEnvelope {
  const lifecycle = createDeliveryLifecycle({ id: `${input.id}-lifecycle`, tenantId: input.tenantId, workspaceId: input.workspaceId, projectId: input.projectId, actorId: input.actorId, at: input.at });
  const basis = createBasisGraph({ id: `${input.id}-basis`, tenantId: input.tenantId, workspaceId: input.workspaceId, projectId: input.projectId, actorId: input.actorId, at: input.at });
  const delivery: ProcessDelivery = {
    id: input.id, tenantId: input.tenantId, workspaceId: input.workspaceId, projectId: input.projectId, projectTitle: input.projectTitle, assetName: null,
    lifecycle: lifecycle.lifecycle, basis: basis.graph, options: [], systems: [], subsystems: [], streams: [], components: [], cases: [], inputs: [],
    models: [], runs: [], massBalances: [], energyBalances: [], calculations: [], duties: [], utilities: [], hydraulics: [], lineSizing: [], reliefCases: [],
    controlValves: [], envelopes: [], interfaces: [], safetyActions: [], pfds: [], pids: [], risks: [], decisions: [], assumptions: [], requirements: [],
    reviews: [], deliverables: [], baselines: [], simulatorPackages: [],
    audits: [{ action: "process_delivery_created", at: input.at, actorId: input.actorId, detail: { stage: "not_classified", formulasChanged: false, legacyEnrolled: false } }],
  };
  return ok(delivery);
}

const EVIDENCE: Record<string, (delivery: ProcessDelivery) => boolean> = {
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
  "major equipment or system configuration selected": (delivery) => delivery.systems.length > 0,
  "design changes governed": () => true,
  "FEED baseline candidate available": (delivery) => delivery.baselines.some((item) => item.type === "feed_baseline"),
  "current design basis": (delivery) => delivery.basis.basisItems.some((item) => item.status === "accepted_for_stage" || item.status === "approved"),
  "controlled inputs": (delivery) => delivery.inputs.some((item) => item.status === "current"),
  "calculations linked to current inputs": (delivery) => delivery.calculations.some((item) => item.inputIds.length > 0 && item.freshness === "current"),
  "interface closure or controlled exceptions": (delivery) => delivery.interfaces.length > 0,
  "deliverables under revision control": (delivery) => delivery.deliverables.length > 0,
  "review or verification state available": (delivery) => delivery.reviews.length > 0,
  "unresolved changes assessed": () => true,
  "configuration baseline identifiable": (delivery) => delivery.baselines.length > 0,
};

function withEvidence(delivery: ProcessDelivery): ProcessDelivery {
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

export function progressProcessStage(delivery: ProcessDelivery, actor: ProcessActor, to: DeliveryStage, reason: string): ProcessResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  const prepared = withEvidence(delivery);
  const transition = requestStageTransition(prepared.lifecycle, {
    to, reason, actorId: actor.actorId, actorRole: actor.actorRole, at: actor.at, canAuthorizeLifecycleTransition: actor.canAuthorizeLifecycleTransition === true,
  });
  const next = audit({ ...prepared, lifecycle: transition.lifecycle }, actor, transition.committed ? "process_stage_progressed" : "process_stage_refused", { to, committed: transition.committed, error: transition.error });
  return transition.committed ? ok(next) : deny(next, transition.error ?? "stage transition was not committed");
}

export function addProcessBasis(delivery: ProcessDelivery, actor: ProcessActor, item: { id: string; title: string; statement: string; status?: "draft" | "accepted_for_stage" }): ProcessResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  if (item.status === "accepted_for_stage" && !roleMayApproveBasis(actor.actorRole, true) && actor.actorRole !== "basis_reviewer") {
    return deny(delivery, "Stage acceptance requires a basis reviewer. It is not engineering approval.");
  }
  return ok(audit({
    ...delivery,
    basis: { ...delivery.basis, basisItems: [...delivery.basis.basisItems, {
      id: item.id, level: "discipline", discipline: "process", category: "operating_condition", title: item.title, statement: item.statement, unit: null,
      sourceId: null, sourceRevision: null, stage: delivery.lifecycle.stage, status: item.status ?? "draft", revision: 1, effectiveAt: actor.at, owner: actor.actorId,
      reviewer: null, authorityState: "none", provenance: "process_delivery", parentId: null, inheritance: "add", overrideRationale: null, supersedesId: null, approvalGranted: false,
    }] },
  }, actor, "process_basis_recorded", { id: item.id, approvalGranted: false }));
}

export function attachProcess<K extends "options" | "systems" | "subsystems" | "components" | "cases" | "risks" | "decisions" | "assumptions" | "requirements" | "interfaces" | "deliverables" | "pfds" | "pids" | "duties" | "utilities" | "hydraulics" | "lineSizing" | "reliefCases" | "controlValves" | "envelopes" | "safetyActions" | "runs" | "calculations">(
  delivery: ProcessDelivery, actor: ProcessActor, key: K, value: ProcessDelivery[K][number],
): ProcessResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  const rows = delivery[key] as Array<ProcessDelivery[K][number]>;
  return ok(audit({ ...delivery, [key]: [...rows, value] }, actor, "process_record_attached", { key, id: "id" in value ? String(value.id) : key }));
}

function requireUnit(value: string | null, unit: string | null, label: string): string | null {
  return value !== null && !unit ? `${label} needs a unit.` : null;
}

export function addStream(delivery: ProcessDelivery, actor: ProcessActor, stream: ProcessStream): ProcessResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  const unitError = requireUnit(stream.flow, stream.flowUnit, "Flow") ?? requireUnit(stream.pressure, stream.pressureUnit, "Pressure") ?? requireUnit(stream.temperature, stream.temperatureUnit, "Temperature");
  if (unitError) return deny(delivery, unitError);
  return ok(audit({ ...delivery, streams: [...delivery.streams, stream] }, actor, "process_stream_recorded", { id: stream.id, synthetic: stream.synthetic }));
}

export function addInput(delivery: ProcessDelivery, actor: ProcessActor, input: ProcessDelivery["inputs"][number]): ProcessResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  if (input.value !== null && !input.unit) return deny(delivery, "A process input value needs a unit.");
  return ok(audit({ ...delivery, inputs: [...delivery.inputs, input] }, actor, "process_input_recorded", { id: input.id }));
}

export function addMassBalance(delivery: ProcessDelivery, actor: ProcessActor, balance: ProcessDelivery["massBalances"][number] & { calculate?: boolean }): ProcessResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  if (balance.calculate) return deny(delivery, "Mass balance is not calculated in this module.");
  if (balance.totalFlow !== null && !balance.unit) return deny(delivery, "A mass-balance flow needs a unit.");
  const stored = { ...balance, calculatedHere: false as const };
  return ok(audit({ ...delivery, massBalances: [...delivery.massBalances, stored] }, actor, "mass_balance_recorded", { id: balance.id, calculatedHere: false }));
}

export function addEnergyBalance(delivery: ProcessDelivery, actor: ProcessActor, balance: ProcessDelivery["energyBalances"][number] & { calculate?: boolean }): ProcessResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  if (balance.calculate) return deny(delivery, "Energy balance is not calculated in this module.");
  if (balance.duty !== null && !balance.unit) return deny(delivery, "An energy duty needs a unit.");
  return ok(audit({ ...delivery, energyBalances: [...delivery.energyBalances, { ...balance, calculatedHere: false }] }, actor, "energy_balance_recorded", { id: balance.id, calculatedHere: false }));
}

export function registerSimulator(delivery: ProcessDelivery, actor: ProcessActor, input: { id: string; tool: SimulatorTool; certifyExecution?: boolean }): ProcessResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  if (input.certifyExecution) return deny(delivery, "Simulator execution is not certified by this delivery module.");
  return ok(audit({ ...delivery, simulatorPackages: [...delivery.simulatorPackages, { id: input.id, tool: input.tool, executionCertified: false, status: "metadata_only" }] }, actor, "simulator_package_registered", { id: input.id, tool: input.tool, executionCertified: false }));
}

export function addModel(delivery: ProcessDelivery, actor: ProcessActor, model: ProcessDelivery["models"][number]): ProcessResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  return ok(audit({ ...delivery, models: [...delivery.models, { ...model, executionCertified: false }] }, actor, "process_model_registered", { id: model.id, executionCertified: false }));
}

export function reviseInput(delivery: ProcessDelivery, actor: ProcessActor, id: string, value: string): ProcessResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  const current = delivery.inputs.find((item) => item.id === id && item.status === "current");
  if (!current) return deny(delivery, "The process input was not found.");
  const successor = { ...current, id: `${current.id}-r${current.revision + 1}`, value, revision: current.revision + 1, status: "current" as const };
  const mark = <T extends { inputIds: string[]; freshness: "current" | "potentially_stale" }>(rows: T[]) => rows.map((row) => row.inputIds.includes(current.id) ? { ...row, freshness: "potentially_stale" as const } : row);
  const next: ProcessDelivery = {
    ...delivery,
    inputs: delivery.inputs.map((item) => item.id === current.id ? { ...item, status: "superseded" as const } : item).concat(successor),
    models: mark(delivery.models),
    massBalances: mark(delivery.massBalances),
    energyBalances: mark(delivery.energyBalances),
    streams: mark(delivery.streams),
    calculations: mark(delivery.calculations),
    duties: mark(delivery.duties),
    utilities: mark(delivery.utilities),
    pfds: mark(delivery.pfds),
    pids: mark(delivery.pids),
    interfaces: delivery.interfaces.map((item) => item.inputId === current.id ? { ...item, freshness: "potentially_stale" } : item),
    deliverables: mark(delivery.deliverables),
  };
  return ok(audit(next, actor, "process_input_revised", { id: successor.id, previous: current.id, recalculated: false, freshness: "potentially_stale" }));
}

export function reviewProcess(delivery: ProcessDelivery, actor: ProcessActor, review: { id: string; subjectId: string; revision: number; outcome: "reviewed" | "approved" }): ProcessResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  if (review.outcome === "approved" && !roleMayApproveBasis(actor.actorRole, actor.canApprove)) return deny(delivery, "This role cannot approve process work.");
  return ok(audit({ ...delivery, reviews: [...delivery.reviews, { ...review, role: actor.actorRole ?? "unspecified", approvalGranted: review.outcome === "approved" }] }, actor, "process_review_recorded", { id: review.id, outcome: review.outcome, approvalGranted: review.outcome === "approved" }));
}

export function closeSafetyAction(delivery: ProcessDelivery, actor: ProcessActor, id: string): ProcessResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  if (actor.actorRole === "ai") return deny(delivery, "AI cannot close a process-safety action.");
  const action = delivery.safetyActions.find((item) => item.id === id);
  if (!action) return deny(delivery, "The process-safety action was not found.");
  return ok(audit({ ...delivery, safetyActions: delivery.safetyActions.map((item) => item.id === id ? { ...item, status: "closed" as const, closedByAi: false } : item) }, actor, "process_safety_action_closed", { id, closedByAi: false }));
}

export function freezeProcess(delivery: ProcessDelivery, actor: ProcessActor, baselineType: BaselineType, id: string): ProcessResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  const lifecycleBaseline = createBaseline({ lifecycle: delivery.lifecycle, id, baselineType, actorId: actor.actorId, at: actor.at, unresolvedExceptions: delivery.assumptions.filter((item) => item.blocksNextStage).map((item) => item.id) });
  const basisSnapshot = captureBasisBaseline(delivery.basis, actor.actorId, actor.at);
  return ok(audit({
    ...delivery,
    lifecycle: lifecycleBaseline.lifecycle,
    baselines: [...delivery.baselines, { id, type: baselineType, frozen: true, inputIds: delivery.inputs.filter((item) => item.status === "current").map((item) => item.id) }],
  }, actor, "process_baseline_frozen", { id, baselineType, basisItems: basisSnapshot.basis.length }));
}

export function deliverableReadiness(delivery: ProcessDelivery, id: string): { ifc: boolean; gaps: string[] } {
  const deliverable = delivery.deliverables.find((item) => item.id === id);
  if (!deliverable) return { ifc: false, gaps: ["deliverable_missing"] };
  const gaps: string[] = [];
  if (!deliverable.basisLinked) gaps.push("missing_design_basis");
  if (!deliverable.requirementLinked) gaps.push("missing_requirement_linkage");
  if (deliverable.freshness !== "current") gaps.push("stale_dependency");
  if (delivery.interfaces.some((item) => item.status !== "accepted")) gaps.push("unresolved_interface");
  if (delivery.safetyActions.some((item) => item.status === "open")) gaps.push("unresolved_process_safety_action");
  if (!deliverable.reviewId) gaps.push("missing_review");
  if (delivery.lifecycle.stage !== "detailed_engineering") gaps.push("lifecycle_mismatch");
  const approved = delivery.reviews.some((item) => item.subjectId === deliverable.id && item.approvalGranted && item.revision === deliverable.revision);
  if (!approved) gaps.push("approval_not_granted");
  return { ifc: gaps.length === 0, gaps };
}

export function processAdvisory(delivery: ProcessDelivery): string {
  const stale = delivery.models.filter((item) => item.freshness === "potentially_stale").length + delivery.massBalances.filter((item) => item.freshness === "potentially_stale").length;
  return [
    "Advisory only.",
    `FACT: lifecycle stage is ${delivery.lifecycle.stage}.`,
    `RESULT: ${delivery.runs.length} simulation run reference(s) are recorded. No flow, duty, or relief rate was calculated by this statement.`,
    `ASSUMPTION: ${delivery.assumptions.length} process assumption(s) are recorded.`,
    `INFERENCE: ${stale} model or balance reference(s) are potentially stale.`,
    "RECOMMENDATION: review stale references before the next baseline.",
    "HUMAN_DECISION_REQUIRED: a human decides whether the process model must be rerun.",
    "This statement does not invent process results, claim simulator convergence, approve a P&ID, or close a process-safety action.",
  ].join(" ");
}

export function processHome(delivery: ProcessDelivery) {
  return {
    stage: delivery.lifecycle.stage,
    maturity: delivery.lifecycle.maturity,
    basisCount: delivery.basis.basisItems.length,
    requirementCount: delivery.requirements.length,
    openAssumptions: delivery.assumptions.length,
    modelCount: delivery.models.length,
    massBalanceCount: delivery.massBalances.length,
    energyBalanceCount: delivery.energyBalances.length,
    streamCount: delivery.streams.filter((item) => item.status === "current").length,
    dutyCount: delivery.duties.length,
    utilityCount: delivery.utilities.length,
    openSafetyActions: delivery.safetyActions.filter((item) => item.status === "open").length,
    interfaceCount: delivery.interfaces.length,
    staleModels: delivery.models.filter((item) => item.freshness === "potentially_stale").length,
    deliverableCount: delivery.deliverables.length,
    reviewCount: delivery.reviews.length,
    blockers: delivery.lifecycle.criteria.filter((item) => item.blocking && item.status === "unmet").map((item) => item.criterion),
    capabilities: PROCESS_CAPABILITIES,
    advisory: processAdvisory(delivery),
    approvalGranted: false as const,
  };
}

export function unimplementedProcessCalculations() {
  return PROCESS_CAPABILITIES.filter((item) => item.state === "NOT_IMPLEMENTED");
}
