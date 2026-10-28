import { captureBasisBaseline, createBasisGraph, roleMayApproveBasis } from "../engineering-basis";
import { createBaseline, createDeliveryLifecycle, requestStageTransition } from "../delivery-lifecycle";
import type { BaselineType, DeliveryStage } from "../delivery-lifecycle/model";
import { MECHANICAL_CAPABILITIES, type MechanicalDelivery } from "./model";

export type MechanicalActor = {
  actorId: string;
  actorRole: string | null;
  at: string;
  workspaceId: string;
  canAuthorizeLifecycleTransition?: boolean;
  canApprove?: boolean;
};

export type MechanicalResultEnvelope = { delivery: MechanicalDelivery; error: string | null; approvalGranted: false };

function deny(delivery: MechanicalDelivery, error: string): MechanicalResultEnvelope {
  return { delivery, error, approvalGranted: false };
}
function ok(delivery: MechanicalDelivery): MechanicalResultEnvelope {
  return { delivery, error: null, approvalGranted: false };
}
function sameWorkspace(delivery: MechanicalDelivery, actor: MechanicalActor): boolean {
  return delivery.workspaceId === actor.workspaceId;
}
function audit(delivery: MechanicalDelivery, actor: MechanicalActor, action: string, detail: Record<string, string | number | boolean | null>): MechanicalDelivery {
  return { ...delivery, audits: [...delivery.audits, { action, at: actor.at, actorId: actor.actorId, detail }] };
}

export function createMechanicalDelivery(input: {
  id: string; tenantId: string; workspaceId: string; projectId: string; projectTitle: string; actorId: string; at: string;
}): MechanicalResultEnvelope {
  const lifecycle = createDeliveryLifecycle({ id: `${input.id}-lifecycle`, tenantId: input.tenantId, workspaceId: input.workspaceId, projectId: input.projectId, actorId: input.actorId, at: input.at });
  const basis = createBasisGraph({ id: `${input.id}-basis`, tenantId: input.tenantId, workspaceId: input.workspaceId, projectId: input.projectId, actorId: input.actorId, at: input.at });
  const delivery: MechanicalDelivery = {
    id: input.id, tenantId: input.tenantId, workspaceId: input.workspaceId, projectId: input.projectId, projectTitle: input.projectTitle,
    lifecycle: lifecycle.lifecycle, basis: basis.graph, options: [], equipment: [], duties: [], conditions: [], materials: [], datasheets: [],
    masses: [], nozzles: [], maintenance: [], lifting: [], reliability: [], interfaces: [], packages: [], vendorData: [], models: [],
    calculations: [], risks: [], decisions: [], assumptions: [], requirements: [], conflicts: [], reviews: [], deliverables: [], baselines: [],
    audits: [{ action: "mechanical_delivery_created", at: input.at, actorId: input.actorId, detail: { stage: "not_classified", formulasChanged: false, legacyEnrolled: false } }],
  };
  return ok(delivery);
}

const EVIDENCE: Record<string, (delivery: MechanicalDelivery) => boolean> = {
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
  "major equipment or system configuration selected": (delivery) => delivery.equipment.length > 0,
  "design changes governed": () => true,
  "FEED baseline candidate available": (delivery) => delivery.baselines.some((item) => item.type === "feed_baseline"),
  "current design basis": (delivery) => delivery.basis.basisItems.some((item) => item.status === "accepted_for_stage" || item.status === "approved"),
  "controlled inputs": (delivery) => delivery.duties.some((item) => item.status === "current"),
  "calculations linked to current inputs": (delivery) => delivery.calculations.some((item) => item.inputIds.length > 0 && item.freshness === "current"),
  "interface closure or controlled exceptions": (delivery) => delivery.interfaces.length > 0,
  "deliverables under revision control": (delivery) => delivery.deliverables.length > 0,
  "review or verification state available": (delivery) => delivery.reviews.length > 0,
  "unresolved changes assessed": () => true,
  "configuration baseline identifiable": (delivery) => delivery.baselines.length > 0,
};

function withEvidence(delivery: MechanicalDelivery): MechanicalDelivery {
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

export function progressMechanicalStage(delivery: MechanicalDelivery, actor: MechanicalActor, to: DeliveryStage, reason: string): MechanicalResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  const prepared = withEvidence(delivery);
  const transition = requestStageTransition(prepared.lifecycle, { to, reason, actorId: actor.actorId, actorRole: actor.actorRole, at: actor.at, canAuthorizeLifecycleTransition: actor.canAuthorizeLifecycleTransition === true });
  const next = audit({ ...prepared, lifecycle: transition.lifecycle }, actor, transition.committed ? "mechanical_stage_progressed" : "mechanical_stage_refused", { to, committed: transition.committed, error: transition.error });
  return transition.committed ? ok(next) : deny(next, transition.error ?? "stage transition was not committed");
}

export function addMechanicalBasis(delivery: MechanicalDelivery, actor: MechanicalActor, item: { id: string; title: string; statement: string; status?: "draft" | "accepted_for_stage" }): MechanicalResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  if (item.status === "accepted_for_stage" && !roleMayApproveBasis(actor.actorRole, true) && actor.actorRole !== "basis_reviewer") {
    return deny(delivery, "Stage acceptance requires a basis reviewer. It is not engineering approval.");
  }
  return ok(audit({
    ...delivery,
    basis: { ...delivery.basis, basisItems: [...delivery.basis.basisItems, {
      id: item.id, level: "discipline", discipline: "mechanical", category: "operating_condition", title: item.title, statement: item.statement, unit: null,
      sourceId: null, sourceRevision: null, stage: delivery.lifecycle.stage, status: item.status ?? "draft", revision: 1, effectiveAt: actor.at, owner: actor.actorId,
      reviewer: null, authorityState: "none", provenance: "mechanical_delivery", parentId: null, inheritance: "add", overrideRationale: null, supersedesId: null, approvalGranted: false,
    }] },
  }, actor, "mechanical_basis_recorded", { id: item.id, approvalGranted: false }));
}

export function attachMechanical<K extends "options" | "equipment" | "conditions" | "materials" | "datasheets" | "maintenance" | "reliability" | "packages" | "nozzles" | "interfaces" | "risks" | "decisions" | "assumptions" | "requirements" | "calculations" | "models" | "deliverables">(
  delivery: MechanicalDelivery, actor: MechanicalActor, key: K, value: MechanicalDelivery[K][number],
): MechanicalResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  if (key === "nozzles" && "allowableLoad" in value && value.allowableLoad !== null) return deny(delivery, "Nozzle allowable load is not calculated in this module.");
  const rows = delivery[key] as Array<MechanicalDelivery[K][number]>;
  return ok(audit({ ...delivery, [key]: [...rows, value] }, actor, "mechanical_record_attached", { key, id: "id" in value ? String(value.id) : key }));
}

export function receiveProcessDuty(delivery: MechanicalDelivery, actor: MechanicalActor, duty: MechanicalDelivery["duties"][number]): MechanicalResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  if (duty.ownedBy !== "process" || duty.mechanicalModified !== false) return deny(delivery, "A process duty remains owned by Process.");
  if (duty.value !== null && !duty.unit) return deny(delivery, "A process duty value needs a unit.");
  return ok(audit({ ...delivery, duties: [...delivery.duties, duty] }, actor, "process_duty_received", { id: duty.id, mechanicalModified: false }));
}

export function modifyProcessDuty(delivery: MechanicalDelivery): MechanicalResultEnvelope {
  return deny(delivery, "Mechanical cannot modify a Process-owned duty. Record an interface or technical query.");
}

export function recordProcessConflict(delivery: MechanicalDelivery, actor: MechanicalActor, conflict: { id: string; dutyId: string; statement: string }): MechanicalResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  const duty = delivery.duties.find((item) => item.id === conflict.dutyId);
  if (!duty) return deny(delivery, "The process duty was not found.");
  return ok(audit({ ...delivery, conflicts: [...delivery.conflicts, { ...conflict, processModified: false }] }, actor, "process_mechanical_conflict_recorded", { id: conflict.id, processModified: false }));
}

export function addMass(delivery: MechanicalDelivery, actor: MechanicalActor, mass: MechanicalDelivery["masses"][number]): MechanicalResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  if (!mass.value || !mass.unit) return deny(delivery, "An equipment mass needs a value and a unit.");
  return ok(audit({ ...delivery, masses: [...delivery.masses, mass] }, actor, "equipment_mass_recorded", { id: mass.id, state: mass.state }));
}

export function addLifting(delivery: MechanicalDelivery, actor: MechanicalActor, item: MechanicalDelivery["lifting"][number]): MechanicalResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  return ok(audit({ ...delivery, lifting: [...delivery.lifting, { ...item, engineered: false }] }, actor, "lifting_requirement_recorded", { id: item.id, engineered: false }));
}

export function addVendorData(delivery: MechanicalDelivery, actor: MechanicalActor, item: MechanicalDelivery["vendorData"][number]): MechanicalResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  const previous = [...delivery.vendorData].reverse().find((row) => row.equipmentId === item.equipmentId && row.status !== "superseded");
  const stored = { ...item, packageApproved: false as const, supersedesId: previous?.id ?? item.supersedesId };
  const vendorData = previous
    ? delivery.vendorData.map((row) => row.id === previous.id ? { ...row, status: "superseded" as const } : row).concat(stored)
    : [...delivery.vendorData, stored];
  return ok(audit({ ...delivery, vendorData }, actor, "vendor_data_recorded", { id: item.id, revision: item.revision, packageApproved: false, previousChecksum: previous?.checksum ?? null }));
}

export function acceptVendorData(delivery: MechanicalDelivery, actor: MechanicalActor, id: string): MechanicalResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  if (actor.actorRole === "ai") return deny(delivery, "AI cannot approve vendor data.");
  const item = delivery.vendorData.find((row) => row.id === id);
  if (!item) return deny(delivery, "The vendor data record was not found.");
  return ok(audit({
    ...delivery,
    vendorData: delivery.vendorData.map((row) => row.id === id ? { ...row, status: "accepted" as const, packageApproved: false } : row),
  }, actor, "vendor_data_accepted", { id, packageApproved: false }));
}

export function reviseUpstream(delivery: MechanicalDelivery, actor: MechanicalActor, dutyId: string, value: string): MechanicalResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  const current = delivery.duties.find((item) => item.id === dutyId && item.status === "current");
  if (!current) return deny(delivery, "The process duty was not found.");
  const successor = { ...current, id: `${current.id}-r${current.revision + 1}`, value, revision: current.revision + 1, mechanicalModified: false as const };
  const mark = <T extends { inputIds: string[]; freshness: "current" | "potentially_stale" }>(rows: T[]) => rows.map((row) => row.inputIds.includes(current.id) ? { ...row, freshness: "potentially_stale" as const } : row);
  const next: MechanicalDelivery = {
    ...delivery,
    duties: delivery.duties.map((item) => item.id === current.id ? { ...item, status: "superseded" as const } : item).concat(successor),
    datasheets: mark(delivery.datasheets),
    calculations: mark(delivery.calculations),
    masses: mark(delivery.masses),
    nozzles: mark(delivery.nozzles),
    interfaces: mark(delivery.interfaces),
    deliverables: mark(delivery.deliverables),
    lifting: delivery.lifting.map((item) => item.massId && delivery.masses.some((mass) => mass.id === item.massId && mass.inputIds.includes(current.id)) ? { ...item, freshness: "potentially_stale" as const } : item),
  };
  return ok(audit(next, actor, "upstream_duty_revised", { id: successor.id, previous: current.id, recalculated: false, mechanicalModified: false, freshness: "potentially_stale" }));
}

export function recordVendorMassChange(delivery: MechanicalDelivery, actor: MechanicalActor, input: { id: string; equipmentId: string; revision: number; checksum: string; massId: string }): MechanicalResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  const mass = delivery.masses.find((item) => item.id === input.massId);
  if (!mass || !mass.unit) return deny(delivery, "A vendor mass change needs a governed mass with a unit.");
  const previous = [...delivery.vendorData].reverse().find((row) => row.equipmentId === input.equipmentId && row.status !== "superseded");
  const stored = { id: input.id, equipmentId: input.equipmentId, revision: input.revision, status: "received" as const, checksum: input.checksum, supersedesId: previous?.id ?? null, packageApproved: false as const };
  const vendorData = previous
    ? delivery.vendorData.map((row) => row.id === previous.id ? { ...row, status: "superseded" as const } : row).concat(stored)
    : [...delivery.vendorData, stored];
  const next: MechanicalDelivery = {
    ...delivery,
    vendorData,
    masses: delivery.masses.map((item) => item.id === mass.id ? { ...item, freshness: "potentially_stale" as const } : item),
    interfaces: delivery.interfaces.map((item) => item.consumer === "structural" ? { ...item, freshness: "potentially_stale" as const } : item),
    lifting: delivery.lifting.map((item) => item.massId === mass.id ? { ...item, freshness: "potentially_stale" as const } : item),
    deliverables: delivery.deliverables.map((item) => ({ ...item, freshness: "potentially_stale" as const })),
  };
  return ok(audit(next, actor, "vendor_mass_change_recorded", { id: input.id, previousChecksum: previous?.checksum ?? null, massValueChanged: false, freshness: "potentially_stale" }));
}

export function reviewMechanical(delivery: MechanicalDelivery, actor: MechanicalActor, review: { id: string; subjectId: string; revision: number; outcome: "reviewed" | "approved" }): MechanicalResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  if (review.outcome === "approved" && !roleMayApproveBasis(actor.actorRole, actor.canApprove)) return deny(delivery, "This role cannot approve mechanical work.");
  return ok(audit({ ...delivery, reviews: [...delivery.reviews, { ...review, approvalGranted: review.outcome === "approved" }] }, actor, "mechanical_review_recorded", { id: review.id, approvalGranted: review.outcome === "approved" }));
}

export function registerMechanicalTool(delivery: MechanicalDelivery, actor: MechanicalActor, input: { id: string; tool: string; certifyExecution?: boolean }): MechanicalResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  if (input.certifyExecution) return deny(delivery, "External mechanical calculation is not certified by this delivery module.");
  return ok(audit({ ...delivery, models: [...delivery.models, { id: input.id, tool: input.tool, revision: 1, executionCertified: false }] }, actor, "mechanical_tool_registered", { id: input.id, executionCertified: false }));
}

export function freezeMechanical(delivery: MechanicalDelivery, actor: MechanicalActor, baselineType: BaselineType, id: string): MechanicalResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  const lifecycleBaseline = createBaseline({ lifecycle: delivery.lifecycle, id, baselineType, actorId: actor.actorId, at: actor.at, unresolvedExceptions: delivery.assumptions.filter((item) => item.blocksNextStage).map((item) => item.id) });
  const basisSnapshot = captureBasisBaseline(delivery.basis, actor.actorId, actor.at);
  return ok(audit({
    ...delivery,
    lifecycle: lifecycleBaseline.lifecycle,
    baselines: [...delivery.baselines, { id, type: baselineType, frozen: true, dutyIds: delivery.duties.filter((item) => item.status === "current").map((item) => item.id) }],
  }, actor, "mechanical_baseline_frozen", { id, baselineType, basisItems: basisSnapshot.basis.length }));
}

export function deliverableReadiness(delivery: MechanicalDelivery, id: string): { ifc: boolean; gaps: string[] } {
  const deliverable = delivery.deliverables.find((item) => item.id === id);
  if (!deliverable) return { ifc: false, gaps: ["deliverable_missing"] };
  const gaps: string[] = [];
  if (!deliverable.basisLinked) gaps.push("missing_design_basis");
  if (!delivery.duties.length) gaps.push("missing_process_duty");
  if (deliverable.freshness !== "current") gaps.push("stale_dependency");
  if (delivery.vendorData.some((item) => item.status === "received" || item.status === "under_review")) gaps.push("unreviewed_vendor_data");
  if (delivery.interfaces.some((item) => item.status !== "accepted")) gaps.push("unresolved_interface");
  if (!deliverable.reviewId) gaps.push("missing_review");
  if (delivery.lifecycle.stage !== "detailed_engineering") gaps.push("lifecycle_mismatch");
  const approved = delivery.reviews.some((item) => item.subjectId === deliverable.id && item.approvalGranted && item.revision === deliverable.revision);
  if (!approved) gaps.push("approval_not_granted");
  return { ifc: gaps.length === 0, gaps };
}

export function mechanicalAdvisory(delivery: MechanicalDelivery): string {
  const stale = delivery.datasheets.filter((item) => item.freshness === "potentially_stale").length + delivery.calculations.filter((item) => item.freshness === "potentially_stale").length;
  return [
    "Advisory only.",
    `FACT: lifecycle stage is ${delivery.lifecycle.stage}.`,
    `RESULT: ${delivery.calculations.length} mechanical calculation reference(s) are recorded. No wall thickness, MAWP, shaft power, or nozzle allowable was calculated by this statement.`,
    `ASSUMPTION: ${delivery.assumptions.length} mechanical assumption(s) are recorded.`,
    `INFERENCE: ${stale} datasheet or calculation reference(s) are potentially stale.`,
    "RECOMMENDATION: review stale vendor and process-duty references before the next baseline.",
    "HUMAN_DECISION_REQUIRED: a human decides whether the mechanical selection must be revised.",
    "This statement does not invent equipment data, approve vendor data, or certify mechanical integrity.",
  ].join(" ");
}

export function mechanicalHome(delivery: MechanicalDelivery) {
  return {
    stage: delivery.lifecycle.stage,
    maturity: delivery.lifecycle.maturity,
    basisCount: delivery.basis.basisItems.length,
    requirementCount: delivery.requirements.length,
    equipmentCount: delivery.equipment.filter((item) => item.status === "current").length,
    dutyCount: delivery.duties.filter((item) => item.status === "current").length,
    datasheetCount: delivery.datasheets.filter((item) => item.status === "current").length,
    vendorCount: delivery.vendorData.filter((item) => item.status !== "superseded").length,
    calculationCount: delivery.calculations.length,
    staleCount: delivery.datasheets.filter((item) => item.freshness === "potentially_stale").length + delivery.calculations.filter((item) => item.freshness === "potentially_stale").length,
    maintenanceCount: delivery.maintenance.length,
    liftingCount: delivery.lifting.length,
    interfaceCount: delivery.interfaces.length,
    reviewCount: delivery.reviews.length,
    deliverableCount: delivery.deliverables.length,
    blockers: delivery.lifecycle.criteria.filter((item) => item.blocking && item.status === "unmet").map((item) => item.criterion),
    capabilities: MECHANICAL_CAPABILITIES,
    advisory: mechanicalAdvisory(delivery),
    approvalGranted: false as const,
  };
}

export function unimplementedMechanicalCalculations() {
  return MECHANICAL_CAPABILITIES.filter((item) => item.state === "NOT_IMPLEMENTED");
}
