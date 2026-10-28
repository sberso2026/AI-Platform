import { captureBasisBaseline, createBasisGraph, roleMayApproveBasis } from "../engineering-basis";
import { createBaseline, createDeliveryLifecycle, requestStageTransition } from "../delivery-lifecycle";
import type { BaselineType, DeliveryStage } from "../delivery-lifecycle/model";
import { GEOTECHNICAL_CAPABILITIES, type GeotechnicalDelivery, type ParameterClass } from "./model";

export type GeotechnicalActor = {
  actorId: string;
  actorRole: string | null;
  at: string;
  workspaceId: string;
  canAuthorizeLifecycleTransition?: boolean;
  canApprove?: boolean;
};

export type GeotechnicalResultEnvelope = { delivery: GeotechnicalDelivery; error: string | null; approvalGranted: false };

function deny(delivery: GeotechnicalDelivery, error: string): GeotechnicalResultEnvelope {
  return { delivery, error, approvalGranted: false };
}
function ok(delivery: GeotechnicalDelivery): GeotechnicalResultEnvelope {
  return { delivery, error: null, approvalGranted: false };
}
function sameWorkspace(delivery: GeotechnicalDelivery, actor: GeotechnicalActor): boolean {
  return delivery.workspaceId === actor.workspaceId;
}
function audit(delivery: GeotechnicalDelivery, actor: GeotechnicalActor, action: string, detail: Record<string, string | number | boolean | null>): GeotechnicalDelivery {
  return { ...delivery, audits: [...delivery.audits, { action, at: actor.at, actorId: actor.actorId, detail }] };
}
function needUnit(value: string | null, unit: string | null, label: string): string | null {
  return value !== null && value !== "" && !unit ? `${label} needs a unit.` : null;
}
function mark<T extends { inputIds: string[]; freshness: "current" | "potentially_stale" }>(rows: T[], id: string): T[] {
  return rows.map((row) => row.inputIds.includes(id) ? { ...row, freshness: "potentially_stale" as const } : row);
}

export function createGeotechnicalDelivery(input: {
  id: string; tenantId: string; workspaceId: string; projectId: string; projectTitle: string; actorId: string; at: string;
}): GeotechnicalResultEnvelope {
  const lifecycle = createDeliveryLifecycle({ id: `${input.id}-lifecycle`, tenantId: input.tenantId, workspaceId: input.workspaceId, projectId: input.projectId, actorId: input.actorId, at: input.at });
  const basis = createBasisGraph({ id: `${input.id}-basis`, tenantId: input.tenantId, workspaceId: input.workspaceId, projectId: input.projectId, actorId: input.actorId, at: input.at });
  const delivery: GeotechnicalDelivery = {
    id: input.id, tenantId: input.tenantId, workspaceId: input.workspaceId, projectId: input.projectId, projectTitle: input.projectTitle,
    lifecycle: lifecycle.lifecycle, basis: basis.graph, options: [], sites: [], investigations: [], boreholes: [], cpts: [], testPits: [],
    fieldTests: [], labTests: [], groundwaterObservations: [], designGroundwater: [], layers: [], units: [], groundModels: [], parameters: [],
    foundations: [], bearing: [], settlement: [], pileParameters: [], pileAssessments: [], liquefaction: [], slopes: [], excavations: [],
    retaining: [], improvements: [], dewatering: [], earthworks: [], civilInputs: [], structuralLoads: [], handoffs: [], models: [],
    interfaces: [], risks: [], decisions: [], assumptions: [], requirements: [], conflicts: [], reviews: [], deliverables: [], baselines: [],
    audits: [{ action: "geotechnical_delivery_created", at: input.at, actorId: input.actorId, detail: { stage: "not_classified", formulasChanged: false, legacyEnrolled: false, siteMasterCreated: false } }],
  };
  return ok(delivery);
}

const EVIDENCE: Record<string, (delivery: GeotechnicalDelivery) => boolean> = {
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
  "major equipment or system configuration selected": (delivery) => delivery.sites.length > 0,
  "design changes governed": () => true,
  "FEED baseline candidate available": (delivery) => delivery.baselines.some((item) => item.type === "feed_baseline"),
  "current design basis": (delivery) => delivery.basis.basisItems.some((item) => item.status === "accepted_for_stage" || item.status === "approved"),
  "controlled inputs": (delivery) => delivery.groundModels.some((item) => item.status === "current"),
  "calculations linked to current inputs": (delivery) => delivery.settlement.some((item) => item.inputIds.length > 0 && item.freshness === "current" && item.provenance !== "metadata"),
  "interface closure or controlled exceptions": (delivery) => delivery.interfaces.length > 0,
  "deliverables under revision control": (delivery) => delivery.deliverables.length > 0,
  "review or verification state available": (delivery) => delivery.reviews.length > 0,
  "unresolved changes assessed": () => true,
  "configuration baseline identifiable": (delivery) => delivery.baselines.length > 0,
};

function withEvidence(delivery: GeotechnicalDelivery): GeotechnicalDelivery {
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

export function progressGeotechnicalStage(delivery: GeotechnicalDelivery, actor: GeotechnicalActor, to: DeliveryStage, reason: string): GeotechnicalResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  const prepared = withEvidence(delivery);
  const transition = requestStageTransition(prepared.lifecycle, { to, reason, actorId: actor.actorId, actorRole: actor.actorRole, at: actor.at, canAuthorizeLifecycleTransition: actor.canAuthorizeLifecycleTransition === true });
  const next = audit({ ...prepared, lifecycle: transition.lifecycle }, actor, transition.committed ? "geotechnical_stage_progressed" : "geotechnical_stage_refused", { to, committed: transition.committed, error: transition.error });
  return transition.committed ? ok(next) : deny(next, transition.error ?? "stage transition was not committed");
}

export function addGeotechnicalBasis(delivery: GeotechnicalDelivery, actor: GeotechnicalActor, item: { id: string; title: string; statement: string; status?: "draft" | "accepted_for_stage" }): GeotechnicalResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  if (item.status === "accepted_for_stage" && !roleMayApproveBasis(actor.actorRole, true) && actor.actorRole !== "basis_reviewer") {
    return deny(delivery, "Stage acceptance requires a basis reviewer. It is not engineering approval.");
  }
  return ok(audit({
    ...delivery,
    basis: { ...delivery.basis, basisItems: [...delivery.basis.basisItems, {
      id: item.id, level: "discipline", discipline: "geotechnical", category: "operating_condition", title: item.title, statement: item.statement, unit: null,
      sourceId: null, sourceRevision: null, stage: delivery.lifecycle.stage, status: item.status ?? "draft", revision: 1, effectiveAt: actor.at, owner: actor.actorId,
      reviewer: null, authorityState: "none", provenance: "geotechnical_delivery", parentId: null, inheritance: "add", overrideRationale: null, supersedesId: null, approvalGranted: false,
    }] },
  }, actor, "geotechnical_basis_recorded", { id: item.id, approvalGranted: false }));
}

type AttachKey = "options" | "sites" | "investigations" | "boreholes" | "cpts" | "testPits" | "layers" | "units" | "retaining" | "improvements" | "liquefaction" | "interfaces" | "risks" | "decisions" | "assumptions" | "requirements" | "deliverables";

export function attachGeotechnical<K extends AttachKey>(delivery: GeotechnicalDelivery, actor: GeotechnicalActor, key: K, value: GeotechnicalDelivery[K][number]): GeotechnicalResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  if (key === "cpts" && "rawSeparated" in value && value.rawSeparated !== true) return deny(delivery, "Raw CPT data stays separate from interpretation.");
  if (key === "liquefaction" && "adequate" in value && value.adequate !== false) return deny(delivery, "Liquefaction adequacy is not claimed without a validated calculation.");
  if (key === "improvements" && "suitable" in value && value.suitable !== false) return deny(delivery, "Ground-improvement suitability is not implied without evidence.");
  const rows = delivery[key] as Array<GeotechnicalDelivery[K][number]>;
  return ok(audit({ ...delivery, [key]: [...rows, value] }, actor, "geotechnical_record_attached", { key, id: "id" in value ? String(value.id) : key, siteMasterCreated: false }));
}

export function addFieldTest(delivery: GeotechnicalDelivery, actor: GeotechnicalActor, item: GeotechnicalDelivery["fieldTests"][number]): GeotechnicalResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  const unitError = needUnit(item.value, item.unit, "Field test");
  if (unitError) return deny(delivery, unitError);
  return ok(audit({ ...delivery, fieldTests: [...delivery.fieldTests, item] }, actor, "field_test_recorded", { id: item.id }));
}

export function addLabTest(delivery: GeotechnicalDelivery, actor: GeotechnicalActor, item: GeotechnicalDelivery["labTests"][number]): GeotechnicalResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  const unitError = needUnit(item.value, item.unit, "Laboratory test");
  if (unitError) return deny(delivery, unitError);
  return ok(audit({ ...delivery, labTests: [...delivery.labTests, item] }, actor, "laboratory_test_recorded", { id: item.id }));
}

export function addGroundwaterObservation(delivery: GeotechnicalDelivery, actor: GeotechnicalActor, item: GeotechnicalDelivery["groundwaterObservations"][number] & { makeDesign?: boolean }): GeotechnicalResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  if (item.makeDesign || item.designLevel) return deny(delivery, "One groundwater observation is not a design groundwater level.");
  const unitError = needUnit(item.level, item.unit, "Groundwater observation");
  if (unitError) return deny(delivery, unitError);
  return ok(audit({ ...delivery, groundwaterObservations: [...delivery.groundwaterObservations, { ...item, designLevel: false }] }, actor, "groundwater_observation_recorded", { id: item.id, designLevel: false }));
}

export function setDesignGroundwater(delivery: GeotechnicalDelivery, actor: GeotechnicalActor, item: Omit<GeotechnicalDelivery["designGroundwater"][number], "inferredFromSingleObservation"> & { inferredFromSingleObservation?: boolean }): GeotechnicalResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  if (item.inferredFromSingleObservation) return deny(delivery, "Design groundwater is not inferred from one observation.");
  const unitError = needUnit(item.level, item.unit, "Design groundwater");
  if (unitError) return deny(delivery, unitError);
  return ok(audit({ ...delivery, designGroundwater: [...delivery.designGroundwater, { ...item, inferredFromSingleObservation: false }] }, actor, "design_groundwater_recorded", { id: item.id, inferredFromSingleObservation: false }));
}

export function addGroundModel(delivery: GeotechnicalDelivery, actor: GeotechnicalActor, model: GeotechnicalDelivery["groundModels"][number]): GeotechnicalResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  return ok(audit({ ...delivery, groundModels: [...delivery.groundModels, model] }, actor, "ground_model_recorded", { id: model.id, revision: model.revision }));
}

export function addParameter(delivery: GeotechnicalDelivery, actor: GeotechnicalActor, item: GeotechnicalDelivery["parameters"][number] & { promotedFrom?: ParameterClass | null }): GeotechnicalResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  if (!item.value || !item.unit) return deny(delivery, "A geotechnical parameter needs a value and a unit.");
  if (item.promotedFrom && item.promotedFrom !== item.classification) return deny(delivery, "A parameter classification is not promoted silently.");
  if (item.classification === "DESIGN" && actor.actorRole === "ai") return deny(delivery, "AI cannot approve a design parameter.");
  if (item.classification === "DESIGN" && !item.evidenceId) return deny(delivery, "A design parameter needs source evidence.");
  if (item.classification === "ASSUMED" && !item.justification) return deny(delivery, "An assumed parameter needs a justification.");
  const { promotedFrom: _promotedFrom, ...stored } = item;
  return ok(audit({ ...delivery, parameters: [...delivery.parameters, stored] }, actor, "parameter_recorded", { id: item.id, classification: item.classification, promotedSilently: false }));
}

export function addAssessment(delivery: GeotechnicalDelivery, actor: GeotechnicalActor, key: "bearing" | "settlement" | "pileAssessments" | "slopes" | "excavations" | "dewatering" | "pileParameters" | "foundations" | "earthworks", item: { id: string; calculate?: boolean; certifiedStable?: boolean; calculatedHere?: boolean; rateCalculated?: boolean }): GeotechnicalResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  if (item.calculate || item.calculatedHere || item.rateCalculated || item.certifiedStable) return deny(delivery, "This geotechnical result is not calculated in this module.");
  return deny(delivery, "Use the typed assessment recorder.");
}

export function addBearing(delivery: GeotechnicalDelivery, actor: GeotechnicalActor, item: GeotechnicalDelivery["bearing"][number] & { calculate?: boolean }): GeotechnicalResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  if (item.calculate || item.calculatedHere) return deny(delivery, "Bearing capacity is not calculated in this module.");
  const unitError = needUnit(item.value, item.unit, "Bearing result");
  if (unitError) return deny(delivery, unitError);
  return ok(audit({ ...delivery, bearing: [...delivery.bearing, { ...item, calculatedHere: false }] }, actor, "bearing_recorded", { id: item.id, calculatedHere: false }));
}

export function addSettlement(delivery: GeotechnicalDelivery, actor: GeotechnicalActor, item: GeotechnicalDelivery["settlement"][number] & { calculate?: boolean }): GeotechnicalResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  if (item.calculate || item.calculatedHere) return deny(delivery, "Settlement is not calculated in this module.");
  const unitError = needUnit(item.value, item.unit, "Settlement result");
  if (unitError) return deny(delivery, unitError);
  return ok(audit({ ...delivery, settlement: [...delivery.settlement, { ...item, calculatedHere: false }] }, actor, "settlement_recorded", { id: item.id, calculatedHere: false }));
}

export function addPileParameter(delivery: GeotechnicalDelivery, actor: GeotechnicalActor, item: GeotechnicalDelivery["pileParameters"][number]): GeotechnicalResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  const unitError = needUnit(item.value, item.unit, "Pile parameter");
  if (unitError) return deny(delivery, unitError);
  return ok(audit({ ...delivery, pileParameters: [...delivery.pileParameters, item] }, actor, "pile_parameter_recorded", { id: item.id }));
}

export function addPileAssessment(delivery: GeotechnicalDelivery, actor: GeotechnicalActor, item: GeotechnicalDelivery["pileAssessments"][number] & { calculate?: boolean }): GeotechnicalResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  if (item.calculate || item.calculatedHere) return deny(delivery, "Pile capacity is not calculated in this module.");
  return ok(audit({ ...delivery, pileAssessments: [...delivery.pileAssessments, { ...item, calculatedHere: false }] }, actor, "pile_assessment_recorded", { id: item.id, calculatedHere: false }));
}

export function addSlope(delivery: GeotechnicalDelivery, actor: GeotechnicalActor, item: GeotechnicalDelivery["slopes"][number] & { calculate?: boolean }): GeotechnicalResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  if (item.calculate || item.calculatedHere || item.factorOfSafety) return deny(delivery, "Slope factor of safety is not calculated in this module.");
  return ok(audit({ ...delivery, slopes: [...delivery.slopes, { ...item, factorOfSafety: null, calculatedHere: false }] }, actor, "slope_recorded", { id: item.id, calculatedHere: false }));
}

export function addExcavation(delivery: GeotechnicalDelivery, actor: GeotechnicalActor, item: GeotechnicalDelivery["excavations"][number] & { certify?: boolean }): GeotechnicalResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  if (item.certify || item.certifiedStable) return deny(delivery, "Unsupported excavation stability is not certified.");
  const unitError = needUnit(item.depth, item.unit, "Excavation depth");
  if (unitError) return deny(delivery, unitError);
  return ok(audit({ ...delivery, excavations: [...delivery.excavations, { ...item, certifiedStable: false }] }, actor, "excavation_recorded", { id: item.id, certifiedStable: false }));
}

export function addDewatering(delivery: GeotechnicalDelivery, actor: GeotechnicalActor, item: GeotechnicalDelivery["dewatering"][number] & { calculateRate?: boolean }): GeotechnicalResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  if (item.calculateRate || item.rateCalculated) return deny(delivery, "A pumping rate is not calculated in this module.");
  const unitError = needUnit(item.targetLevel, item.unit, "Dewatering target");
  if (unitError) return deny(delivery, unitError);
  return ok(audit({ ...delivery, dewatering: [...delivery.dewatering, { ...item, rateCalculated: false }] }, actor, "dewatering_recorded", { id: item.id, rateCalculated: false }));
}

export function addFoundation(delivery: GeotechnicalDelivery, actor: GeotechnicalActor, item: GeotechnicalDelivery["foundations"][number]): GeotechnicalResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  return ok(audit({ ...delivery, foundations: [...delivery.foundations, { ...item, structuralCapacityClaimed: false }] }, actor, "foundation_recommendation_recorded", { id: item.id, structuralCapacityClaimed: false }));
}

export function addEarthworks(delivery: GeotechnicalDelivery, actor: GeotechnicalActor, item: GeotechnicalDelivery["earthworks"][number]): GeotechnicalResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  return ok(audit({ ...delivery, earthworks: [...delivery.earthworks, item] }, actor, "earthworks_suitability_recorded", { id: item.id }));
}

export function addHandoff(delivery: GeotechnicalDelivery, actor: GeotechnicalActor, item: GeotechnicalDelivery["handoffs"][number]): GeotechnicalResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  const unitError = needUnit(item.value, item.unit, "Handoff value");
  if (unitError) return deny(delivery, unitError);
  return ok(audit({ ...delivery, handoffs: [...delivery.handoffs, { ...item, structuralCapacityClaimed: false }] }, actor, "geotechnical_handoff_recorded", { id: item.id, consumer: item.consumer, structuralCapacityClaimed: false }));
}

export function receiveCivilInput(delivery: GeotechnicalDelivery, actor: GeotechnicalActor, item: GeotechnicalDelivery["civilInputs"][number]): GeotechnicalResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  if (item.ownedBy !== "civil" || item.geotechModified !== false) return deny(delivery, "A civil grading record remains owned by Civil.");
  return ok(audit({ ...delivery, civilInputs: [...delivery.civilInputs, item] }, actor, "civil_input_received", { id: item.id, geotechModified: false }));
}

export function modifyCivilInput(delivery: GeotechnicalDelivery): GeotechnicalResultEnvelope {
  return deny(delivery, "Geotechnical cannot modify a Civil grading record.");
}

export function receiveStructuralLoad(delivery: GeotechnicalDelivery, actor: GeotechnicalActor, item: GeotechnicalDelivery["structuralLoads"][number]): GeotechnicalResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  if (item.ownedBy !== "structural" || item.geotechModified !== false) return deny(delivery, "A structural load remains owned by Structural.");
  const unitError = needUnit(item.value, item.unit, "Structural load");
  if (unitError) return deny(delivery, unitError);
  return ok(audit({ ...delivery, structuralLoads: [...delivery.structuralLoads, item] }, actor, "structural_load_received", { id: item.id, geotechModified: false }));
}

export function modifyStructuralLoad(delivery: GeotechnicalDelivery): GeotechnicalResultEnvelope {
  return deny(delivery, "Geotechnical cannot modify a Structural load.");
}

export function recordConflict(delivery: GeotechnicalDelivery, actor: GeotechnicalActor, conflict: { id: string; subjectId: string; statement: string }): GeotechnicalResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  return ok(audit({ ...delivery, conflicts: [...delivery.conflicts, { ...conflict, civilModified: false, structuralModified: false }] }, actor, "geotechnical_conflict_recorded", { id: conflict.id }));
}

export function registerGeotechnicalTool(delivery: GeotechnicalDelivery, actor: GeotechnicalActor, input: { id: string; tool: string; certifyExecution?: boolean; bidirectional?: boolean }): GeotechnicalResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  if (input.certifyExecution) return deny(delivery, "External geotechnical calculation is not certified by this delivery module.");
  if (input.bidirectional) return deny(delivery, "Bidirectional ground-model synchronization is not implemented.");
  return ok(audit({ ...delivery, models: [...delivery.models, { id: input.id, tool: input.tool, revision: 1, bidirectional: false, executionCertified: false }] }, actor, "geotechnical_tool_registered", { id: input.id, executionCertified: false }));
}

export function reviseGroundModel(delivery: GeotechnicalDelivery, actor: GeotechnicalActor, modelId: string, boundary: string): GeotechnicalResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  const current = delivery.groundModels.find((item) => item.id === modelId && item.status === "current");
  if (!current) return deny(delivery, "The ground model was not found.");
  const successor = { ...current, id: `${current.id}-r${current.revision + 1}`, boundary, revision: current.revision + 1 };
  const next: GeotechnicalDelivery = {
    ...delivery,
    groundModels: delivery.groundModels.map((item) => item.id === current.id ? { ...item, status: "superseded" as const } : item).concat(successor),
    parameters: mark(delivery.parameters, current.id),
    foundations: mark(delivery.foundations, current.id),
    bearing: mark(delivery.bearing, current.id),
    settlement: mark(delivery.settlement, current.id),
    pileParameters: mark(delivery.pileParameters, current.id),
    pileAssessments: mark(delivery.pileAssessments, current.id),
    excavations: mark(delivery.excavations, current.id),
    slopes: mark(delivery.slopes, current.id),
    earthworks: mark(delivery.earthworks, current.id),
    handoffs: mark(delivery.handoffs, current.id),
    interfaces: mark(delivery.interfaces, current.id),
    deliverables: mark(delivery.deliverables, current.id),
  };
  return ok(audit(next, actor, "ground_model_revised", { id: successor.id, previous: current.id, recalculated: false, freshness: "potentially_stale" }));
}

export function reviseDesignGroundwater(delivery: GeotechnicalDelivery, actor: GeotechnicalActor, id: string, level: string): GeotechnicalResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  const current = delivery.designGroundwater.find((item) => item.id === id && item.status === "current");
  if (!current) return deny(delivery, "The design groundwater record was not found.");
  const successor = { ...current, id: `${current.id}-r${current.revision + 1}`, level, revision: current.revision + 1 };
  const next: GeotechnicalDelivery = {
    ...delivery,
    designGroundwater: delivery.designGroundwater.map((item) => item.id === current.id ? { ...item, status: "superseded" as const } : item).concat(successor),
    parameters: mark(delivery.parameters, current.id),
    bearing: mark(delivery.bearing, current.id),
    settlement: mark(delivery.settlement, current.id),
    pileAssessments: mark(delivery.pileAssessments, current.id),
    excavations: mark(delivery.excavations, current.id),
    dewatering: mark(delivery.dewatering, current.id),
    foundations: mark(delivery.foundations, current.id),
    handoffs: mark(delivery.handoffs, current.id),
    interfaces: mark(delivery.interfaces, current.id),
    deliverables: mark(delivery.deliverables, current.id),
  };
  return ok(audit(next, actor, "design_groundwater_revised", { id: successor.id, previous: current.id, recalculated: false, freshness: "potentially_stale" }));
}

export function reviseStructuralLoad(delivery: GeotechnicalDelivery, actor: GeotechnicalActor, id: string, value: string): GeotechnicalResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  const current = delivery.structuralLoads.find((item) => item.id === id && item.status === "current");
  if (!current) return deny(delivery, "The structural load was not found.");
  const successor = { ...current, id: `${current.id}-r${current.revision + 1}`, value, revision: current.revision + 1, geotechModified: false as const };
  const next: GeotechnicalDelivery = {
    ...delivery,
    structuralLoads: delivery.structuralLoads.map((item) => item.id === current.id ? { ...item, status: "superseded" as const } : item).concat(successor),
    bearing: mark(delivery.bearing, current.id),
    settlement: mark(delivery.settlement, current.id),
    foundations: mark(delivery.foundations, current.id),
    interfaces: mark(delivery.interfaces, current.id),
    deliverables: mark(delivery.deliverables, current.id),
  };
  return ok(audit(next, actor, "structural_load_revised", { id: successor.id, previous: current.id, geotechModified: false, recalculated: false, freshness: "potentially_stale" }));
}

export function reviewGeotechnical(delivery: GeotechnicalDelivery, actor: GeotechnicalActor, review: { id: string; subjectId: string; revision: number; outcome: "reviewed" | "approved" }): GeotechnicalResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  if (review.outcome === "approved" && !roleMayApproveBasis(actor.actorRole, actor.canApprove)) return deny(delivery, "This role cannot approve geotechnical work.");
  return ok(audit({ ...delivery, reviews: [...delivery.reviews, { ...review, approvalGranted: review.outcome === "approved" }] }, actor, "geotechnical_review_recorded", { id: review.id, approvalGranted: review.outcome === "approved" }));
}

export function freezeGeotechnical(delivery: GeotechnicalDelivery, actor: GeotechnicalActor, baselineType: BaselineType, id: string): GeotechnicalResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  const lifecycleBaseline = createBaseline({ lifecycle: delivery.lifecycle, id, baselineType, actorId: actor.actorId, at: actor.at, unresolvedExceptions: delivery.assumptions.filter((item) => item.blocksNextStage).map((item) => item.id) });
  const basisSnapshot = captureBasisBaseline(delivery.basis, actor.actorId, actor.at);
  return ok(audit({
    ...delivery,
    lifecycle: lifecycleBaseline.lifecycle,
    baselines: [...delivery.baselines, {
      id, type: baselineType, frozen: true,
      modelIds: delivery.groundModels.filter((item) => item.status === "current").map((item) => item.id),
      groundwaterIds: delivery.designGroundwater.filter((item) => item.status === "current").map((item) => item.id),
    }],
  }, actor, "geotechnical_baseline_frozen", { id, baselineType, basisItems: basisSnapshot.basis.length }));
}

export function deliverableReadiness(delivery: GeotechnicalDelivery, id: string): { ifc: boolean; gaps: string[] } {
  const deliverable = delivery.deliverables.find((item) => item.id === id);
  if (!deliverable) return { ifc: false, gaps: ["deliverable_missing"] };
  const gaps: string[] = [];
  if (!deliverable.basisLinked) gaps.push("missing_design_basis");
  if (!delivery.groundModels.some((item) => item.status === "current")) gaps.push("missing_ground_model");
  if (deliverable.freshness !== "current") gaps.push("stale_dependency");
  if (delivery.groundModels.some((item) => item.freshness !== "current" && item.status === "current")) gaps.push("stale_ground_model");
  if (delivery.parameters.some((item) => item.classification === "DESIGN" && item.status === "current" && !item.evidenceId)) gaps.push("unreviewed_parameter");
  if (delivery.parameters.some((item) => item.classification === "ASSUMED" && !item.justification)) gaps.push("unjustified_assumption");
  if (!delivery.designGroundwater.some((item) => item.status === "current")) gaps.push("unresolved_groundwater");
  if (delivery.interfaces.some((item) => item.status !== "accepted")) gaps.push("unresolved_interface");
  if (!deliverable.reviewId) gaps.push("missing_review");
  if (delivery.lifecycle.stage !== "detailed_engineering") gaps.push("lifecycle_mismatch");
  const approved = delivery.reviews.some((item) => item.subjectId === deliverable.id && item.approvalGranted && item.revision === deliverable.revision);
  if (!approved) gaps.push("approval_not_granted");
  return { ifc: gaps.length === 0, gaps };
}

export function geotechnicalAdvisory(delivery: GeotechnicalDelivery): string {
  const stale = delivery.parameters.filter((item) => item.freshness === "potentially_stale").length;
  return [
    "Advisory only.",
    `FACT: lifecycle stage is ${delivery.lifecycle.stage}.`,
    `MEASURED_RESULT: ${delivery.labTests.length} laboratory result(s) and ${delivery.fieldTests.length} field result(s) are recorded.`,
    `INTERPRETATION: ${delivery.groundModels.filter((item) => item.status === "current").length} current ground model(s) are recorded.`,
    `DESIGN_PARAMETER: ${delivery.parameters.filter((item) => item.classification === "DESIGN" && item.status === "current").length} current design parameter(s) are recorded.`,
    `CALCULATION_RESULT: ${delivery.settlement.length} settlement reference(s) are recorded. No bearing, settlement, or factor of safety was calculated by this statement.`,
    `ASSUMPTION: ${delivery.assumptions.length} geotechnical assumption(s) are recorded.`,
    `INFERENCE: ${stale} parameter reference(s) are potentially stale.`,
    "RECOMMENDATION: review stale ground-model and groundwater references before the next baseline.",
    "HUMAN_DECISION_REQUIRED: a human decides whether the parameter set or foundation recommendation must be revised.",
    "This statement does not invent soil properties, approve design parameters, or certify foundation adequacy.",
  ].join(" ");
}

export function geotechnicalHome(delivery: GeotechnicalDelivery) {
  return {
    stage: delivery.lifecycle.stage,
    maturity: delivery.lifecycle.maturity,
    basisCount: delivery.basis.basisItems.length,
    requirementCount: delivery.requirements.length,
    investigationCount: delivery.investigations.filter((item) => item.status === "current").length,
    boreholeCount: delivery.boreholes.length,
    cptCount: delivery.cpts.length,
    labCount: delivery.labTests.length,
    fieldCount: delivery.fieldTests.length,
    groundwaterCount: delivery.designGroundwater.filter((item) => item.status === "current").length,
    groundModelRevision: delivery.groundModels.find((item) => item.status === "current")?.revision ?? null,
    parameterCount: delivery.parameters.filter((item) => item.status === "current").length,
    foundationCount: delivery.foundations.length,
    settlementCount: delivery.settlement.length,
    pileCount: delivery.pileAssessments.length,
    liquefactionCount: delivery.liquefaction.length,
    civilHandoffCount: delivery.handoffs.filter((item) => item.consumer === "civil").length,
    structuralHandoffCount: delivery.handoffs.filter((item) => item.consumer === "structural").length,
    staleCount: delivery.parameters.filter((item) => item.freshness === "potentially_stale").length + delivery.settlement.filter((item) => item.freshness === "potentially_stale").length,
    openAssumptions: delivery.assumptions.length,
    interfaceCount: delivery.interfaces.length,
    reviewCount: delivery.reviews.length,
    deliverableCount: delivery.deliverables.length,
    blockers: delivery.lifecycle.criteria.filter((item) => item.blocking && item.status === "unmet").map((item) => item.criterion),
    capabilities: GEOTECHNICAL_CAPABILITIES,
    advisory: geotechnicalAdvisory(delivery),
    approvalGranted: false as const,
  };
}

export function unimplementedGeotechnicalCalculations() {
  return GEOTECHNICAL_CAPABILITIES.filter((item) => item.state === "NOT_IMPLEMENTED");
}
