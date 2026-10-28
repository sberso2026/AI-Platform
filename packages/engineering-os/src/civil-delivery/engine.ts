import { captureBasisBaseline, createBasisGraph, roleMayApproveBasis } from "../engineering-basis";
import { createBaseline, createDeliveryLifecycle, requestStageTransition } from "../delivery-lifecycle";
import type { BaselineType, DeliveryStage } from "../delivery-lifecycle/model";
import { CIVIL_CAPABILITIES, type CivilDelivery } from "./model";

export type CivilActor = {
  actorId: string;
  actorRole: string | null;
  at: string;
  workspaceId: string;
  canAuthorizeLifecycleTransition?: boolean;
  canApprove?: boolean;
};

export type CivilResultEnvelope = { delivery: CivilDelivery; error: string | null; approvalGranted: false };

function deny(delivery: CivilDelivery, error: string): CivilResultEnvelope {
  return { delivery, error, approvalGranted: false };
}
function ok(delivery: CivilDelivery): CivilResultEnvelope {
  return { delivery, error: null, approvalGranted: false };
}
function sameWorkspace(delivery: CivilDelivery, actor: CivilActor): boolean {
  return delivery.workspaceId === actor.workspaceId;
}
function audit(delivery: CivilDelivery, actor: CivilActor, action: string, detail: Record<string, string | number | boolean | null>): CivilDelivery {
  return { ...delivery, audits: [...delivery.audits, { action, at: actor.at, actorId: actor.actorId, detail }] };
}
function needUnit(value: string | null, unit: string | null, label: string): string | null {
  return value !== null && value !== "" && !unit ? `${label} needs a unit.` : null;
}
function mark<T extends { inputIds: string[]; freshness: "current" | "potentially_stale" }>(rows: T[], id: string): T[] {
  return rows.map((row) => row.inputIds.includes(id) ? { ...row, freshness: "potentially_stale" as const } : row);
}

export function createCivilDelivery(input: {
  id: string; tenantId: string; workspaceId: string; projectId: string; projectTitle: string; actorId: string; at: string;
}): CivilResultEnvelope {
  const lifecycle = createDeliveryLifecycle({ id: `${input.id}-lifecycle`, tenantId: input.tenantId, workspaceId: input.workspaceId, projectId: input.projectId, actorId: input.actorId, at: input.at });
  const basis = createBasisGraph({ id: `${input.id}-basis`, tenantId: input.tenantId, workspaceId: input.workspaceId, projectId: input.projectId, actorId: input.actorId, at: input.at });
  const delivery: CivilDelivery = {
    id: input.id, tenantId: input.tenantId, workspaceId: input.workspaceId, projectId: input.projectId, projectTitle: input.projectTitle,
    lifecycle: lifecycle.lifecycle, basis: basis.graph, options: [], sites: [], areas: [], surveys: [], surfaces: [], grading: [],
    earthworks: [], catchments: [], drainage: [], cases: [], culverts: [], roads: [], pavements: [], hardstands: [], trenches: [],
    corridors: [], crossings: [], retaining: [], flood: [], erosion: [], geotech: [], pipingRoutes: [], structuralInputs: [],
    quantities: [], models: [], interfaces: [], risks: [], decisions: [], assumptions: [], requirements: [], conflicts: [],
    reviews: [], deliverables: [], baselines: [],
    audits: [{ action: "civil_delivery_created", at: input.at, actorId: input.actorId, detail: { stage: "not_classified", formulasChanged: false, legacyEnrolled: false, areaMasterCreated: false } }],
  };
  return ok(delivery);
}

const EVIDENCE: Record<string, (delivery: CivilDelivery) => boolean> = {
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
  "controlled inputs": (delivery) => delivery.surveys.some((item) => item.status === "current"),
  "calculations linked to current inputs": (delivery) => delivery.drainage.some((item) => item.inputIds.length > 0 && item.freshness === "current" && item.provenance !== "metadata"),
  "interface closure or controlled exceptions": (delivery) => delivery.interfaces.length > 0,
  "deliverables under revision control": (delivery) => delivery.deliverables.length > 0,
  "review or verification state available": (delivery) => delivery.reviews.length > 0,
  "unresolved changes assessed": () => true,
  "configuration baseline identifiable": (delivery) => delivery.baselines.length > 0,
};

function withEvidence(delivery: CivilDelivery): CivilDelivery {
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

export function progressCivilStage(delivery: CivilDelivery, actor: CivilActor, to: DeliveryStage, reason: string): CivilResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  const prepared = withEvidence(delivery);
  const transition = requestStageTransition(prepared.lifecycle, { to, reason, actorId: actor.actorId, actorRole: actor.actorRole, at: actor.at, canAuthorizeLifecycleTransition: actor.canAuthorizeLifecycleTransition === true });
  const next = audit({ ...prepared, lifecycle: transition.lifecycle }, actor, transition.committed ? "civil_stage_progressed" : "civil_stage_refused", { to, committed: transition.committed, error: transition.error });
  return transition.committed ? ok(next) : deny(next, transition.error ?? "stage transition was not committed");
}

export function addCivilBasis(delivery: CivilDelivery, actor: CivilActor, item: { id: string; title: string; statement: string; status?: "draft" | "accepted_for_stage" }): CivilResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  if (item.status === "accepted_for_stage" && !roleMayApproveBasis(actor.actorRole, true) && actor.actorRole !== "basis_reviewer") {
    return deny(delivery, "Stage acceptance requires a basis reviewer. It is not engineering approval.");
  }
  return ok(audit({
    ...delivery,
    basis: { ...delivery.basis, basisItems: [...delivery.basis.basisItems, {
      id: item.id, level: "discipline", discipline: "civil", category: "operating_condition", title: item.title, statement: item.statement, unit: null,
      sourceId: null, sourceRevision: null, stage: delivery.lifecycle.stage, status: item.status ?? "draft", revision: 1, effectiveAt: actor.at, owner: actor.actorId,
      reviewer: null, authorityState: "none", provenance: "civil_delivery", parentId: null, inheritance: "add", overrideRationale: null, supersedesId: null, approvalGranted: false,
    }] },
  }, actor, "civil_basis_recorded", { id: item.id, approvalGranted: false }));
}

type AttachKey = "options" | "sites" | "areas" | "catchments" | "cases" | "hardstands" | "corridors" | "crossings" | "retaining" | "erosion" | "interfaces" | "risks" | "decisions" | "assumptions" | "requirements" | "deliverables";

export function attachCivil<K extends AttachKey>(delivery: CivilDelivery, actor: CivilActor, key: K, value: CivilDelivery[K][number]): CivilResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  if (key === "retaining" && "structuralCapacityClaimed" in value && value.structuralCapacityClaimed !== false) {
    return deny(delivery, "Civil does not claim structural capacity.");
  }
  const rows = delivery[key] as Array<CivilDelivery[K][number]>;
  return ok(audit({ ...delivery, [key]: [...rows, value] }, actor, "civil_record_attached", { key, id: "id" in value ? String(value.id) : key, areaMasterCreated: false }));
}

export function registerSurvey(delivery: CivilDelivery, actor: CivilActor, survey: CivilDelivery["surveys"][number]): CivilResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  if (!survey.horizontalDatum || !survey.verticalDatum || !survey.coordinateSystem) return deny(delivery, "A survey needs a coordinate system and horizontal and vertical datums.");
  const current = delivery.surveys.find((item) => item.status === "current");
  const mismatch = current && (current.horizontalDatum !== survey.horizontalDatum || current.verticalDatum !== survey.verticalDatum);
  if (mismatch && !survey.transformationId) return deny(delivery, "A datum mismatch needs explicit transformation metadata.");
  const surveys = current
    ? delivery.surveys.map((item) => item.id === current.id ? { ...item, status: "superseded" as const } : item).concat(survey)
    : [...delivery.surveys, survey];
  return ok(audit({ ...delivery, surveys }, actor, "survey_registered", { id: survey.id, datumMixed: false }));
}

export function addSurface(delivery: CivilDelivery, actor: CivilActor, surface: CivilDelivery["surfaces"][number]): CivilResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  const survey = delivery.surveys.find((item) => item.id === surface.surveyId && item.status === "current");
  if (!survey) return deny(delivery, "The current survey was not found.");
  if (surface.datum !== survey.verticalDatum) return deny(delivery, "A surface datum must match the current survey vertical datum.");
  if (surface.calculatedHere) return deny(delivery, "A design surface is not calculated in this module.");
  return ok(audit({ ...delivery, surfaces: [...delivery.surfaces, { ...surface, calculatedHere: false }] }, actor, "surface_recorded", { id: surface.id, calculatedHere: false }));
}

export function addGrading(delivery: CivilDelivery, actor: CivilActor, zone: CivilDelivery["grading"][number] & { calculate?: boolean }): CivilResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  if (zone.calculate || zone.calculatedHere) return deny(delivery, "Grading is not calculated in this module.");
  return ok(audit({ ...delivery, grading: [...delivery.grading, { ...zone, calculatedHere: false }] }, actor, "grading_recorded", { id: zone.id, calculatedHere: false }));
}

export function addEarthworks(delivery: CivilDelivery, actor: CivilActor, item: CivilDelivery["earthworks"][number] & { calculate?: boolean }): CivilResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  if (item.calculate || item.calculatedHere) return deny(delivery, "Cut and fill are not calculated in this module.");
  const unitError = needUnit(item.cut, item.cutUnit, "Cut") ?? needUnit(item.fill, item.fillUnit, "Fill");
  if (unitError) return deny(delivery, unitError);
  return ok(audit({ ...delivery, earthworks: [...delivery.earthworks, { ...item, calculatedHere: false }] }, actor, "earthworks_recorded", { id: item.id, calculatedHere: false }));
}

export function addDrainage(delivery: CivilDelivery, actor: CivilActor, item: CivilDelivery["drainage"][number] & { calculate?: boolean }): CivilResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  if (item.calculate || item.calculatedHere) return deny(delivery, "Drainage flow is not calculated in this module.");
  const unitError = needUnit(item.flow, item.unit, "Drainage flow");
  if (unitError) return deny(delivery, unitError);
  return ok(audit({ ...delivery, drainage: [...delivery.drainage, { ...item, calculatedHere: false }] }, actor, "drainage_recorded", { id: item.id, calculatedHere: false }));
}

export function addCulvert(delivery: CivilDelivery, actor: CivilActor, item: CivilDelivery["culverts"][number] & { sizeHere?: boolean }): CivilResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  if (item.sizeHere || item.sizedHere) return deny(delivery, "A culvert is not sized in this module.");
  const unitError = needUnit(item.size, item.unit, "Culvert size");
  if (unitError) return deny(delivery, unitError);
  return ok(audit({ ...delivery, culverts: [...delivery.culverts, { ...item, sizedHere: false }] }, actor, "culvert_recorded", { id: item.id, sizedHere: false }));
}

export function addRoad(delivery: CivilDelivery, actor: CivilActor, road: CivilDelivery["roads"][number]): CivilResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  const unitError = needUnit(road.width, road.unit, "Road width");
  if (unitError) return deny(delivery, unitError);
  return ok(audit({ ...delivery, roads: [...delivery.roads, road] }, actor, "road_recorded", { id: road.id }));
}

export function addPavement(delivery: CivilDelivery, actor: CivilActor, item: CivilDelivery["pavements"][number] & { designHere?: boolean }): CivilResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  if (item.designHere || item.designedHere) return deny(delivery, "Pavement thickness is not designed in this module.");
  const unitError = needUnit(item.thickness, item.unit, "Pavement thickness");
  if (unitError) return deny(delivery, unitError);
  return ok(audit({ ...delivery, pavements: [...delivery.pavements, { ...item, designedHere: false }] }, actor, "pavement_recorded", { id: item.id, designedHere: false }));
}

export function addTrench(delivery: CivilDelivery, actor: CivilActor, item: CivilDelivery["trenches"][number] & { calculateStability?: boolean }): CivilResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  if (item.calculateStability || item.stabilityCalculated) return deny(delivery, "Excavation stability is not calculated in this module.");
  return ok(audit({ ...delivery, trenches: [...delivery.trenches, { ...item, stabilityCalculated: false }] }, actor, "trench_recorded", { id: item.id, stabilityCalculated: false }));
}

export function addFlood(delivery: CivilDelivery, actor: CivilActor, item: CivilDelivery["flood"][number] & { modelHere?: boolean }): CivilResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  if (item.modelHere || item.modeledHere) return deny(delivery, "Flood level is not modeled in this module.");
  const unitError = needUnit(item.level, item.unit, "Flood level");
  if (unitError) return deny(delivery, unitError);
  return ok(audit({ ...delivery, flood: [...delivery.flood, { ...item, modeledHere: false }] }, actor, "flood_interface_recorded", { id: item.id, modeledHere: false }));
}

export function addQuantity(delivery: CivilDelivery, actor: CivilActor, item: CivilDelivery["quantities"][number]): CivilResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  if (!item.value || !item.unit) return deny(delivery, "A civil quantity needs a value and a unit.");
  return ok(audit({ ...delivery, quantities: [...delivery.quantities, { ...item, procurementAccurate: false }] }, actor, "civil_quantity_recorded", { id: item.id, procurementAccurate: false }));
}

export function receiveGeotech(delivery: CivilDelivery, actor: CivilActor, item: CivilDelivery["geotech"][number]): CivilResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  if (item.ownedBy !== "geotechnical" || item.civilModified !== false) return deny(delivery, "A geotechnical parameter remains owned by Geotechnical.");
  if (item.value && !item.source) return deny(delivery, "Civil cannot invent a geotechnical parameter.");
  const unitError = needUnit(item.value, item.unit, "Geotechnical parameter");
  if (unitError) return deny(delivery, unitError);
  return ok(audit({ ...delivery, geotech: [...delivery.geotech, item] }, actor, "geotech_input_received", { id: item.id, civilModified: false }));
}

export function modifyGeotech(delivery: CivilDelivery): CivilResultEnvelope {
  return deny(delivery, "Civil cannot modify a Geotechnical parameter. Record an interface or technical query.");
}

export function receivePipingRoute(delivery: CivilDelivery, actor: CivilActor, item: CivilDelivery["pipingRoutes"][number]): CivilResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  if (item.ownedBy !== "piping" || item.civilModified !== false) return deny(delivery, "A piping route remains owned by Piping.");
  return ok(audit({ ...delivery, pipingRoutes: [...delivery.pipingRoutes, item] }, actor, "piping_route_received", { id: item.id, civilModified: false }));
}

export function modifyPipingRoute(delivery: CivilDelivery): CivilResultEnvelope {
  return deny(delivery, "Civil cannot modify a Piping route or piping design condition.");
}

export function receiveStructural(delivery: CivilDelivery, actor: CivilActor, item: CivilDelivery["structuralInputs"][number]): CivilResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  if (item.structuralCapacityClaimed) return deny(delivery, "Civil does not claim structural capacity.");
  return ok(audit({ ...delivery, structuralInputs: [...delivery.structuralInputs, { ...item, structuralCapacityClaimed: false }] }, actor, "structural_input_received", { id: item.id, structuralCapacityClaimed: false }));
}

export function recordConflict(delivery: CivilDelivery, actor: CivilActor, conflict: { id: string; subjectId: string; statement: string }): CivilResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  return ok(audit({ ...delivery, conflicts: [...delivery.conflicts, { ...conflict, pipingModified: false, geotechModified: false }] }, actor, "civil_conflict_recorded", { id: conflict.id }));
}

export function registerCivilTool(delivery: CivilDelivery, actor: CivilActor, input: { id: string; tool: string; certifyExecution?: boolean; bidirectional?: boolean }): CivilResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  if (input.certifyExecution) return deny(delivery, "External civil calculation is not certified by this delivery module.");
  if (input.bidirectional) return deny(delivery, "Bidirectional civil-model synchronization is not implemented.");
  return ok(audit({ ...delivery, models: [...delivery.models, { id: input.id, tool: input.tool, revision: 1, bidirectional: false, executionCertified: false }] }, actor, "civil_tool_registered", { id: input.id, executionCertified: false, bidirectional: false }));
}

export function reviseSurvey(delivery: CivilDelivery, actor: CivilActor, surveyId: string, checksum: string): CivilResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  const current = delivery.surveys.find((item) => item.id === surveyId && item.status === "current");
  if (!current) return deny(delivery, "The survey was not found.");
  const successor = { ...current, id: `${current.id}-r${current.revision + 1}`, checksum, revision: current.revision + 1 };
  const next: CivilDelivery = {
    ...delivery,
    surveys: delivery.surveys.map((item) => item.id === current.id ? { ...item, status: "superseded" as const } : item).concat(successor),
    surfaces: mark(delivery.surfaces, current.id),
    grading: mark(delivery.grading, current.id),
    earthworks: mark(delivery.earthworks, current.id),
    drainage: mark(delivery.drainage, current.id),
    roads: mark(delivery.roads, current.id),
    culverts: mark(delivery.culverts, current.id),
    trenches: mark(delivery.trenches, current.id),
    quantities: mark(delivery.quantities, current.id),
    deliverables: mark(delivery.deliverables, current.id),
  };
  return ok(audit(next, actor, "survey_revised", { id: successor.id, previous: current.id, recalculated: false, freshness: "potentially_stale" }));
}

export function revisePipingRoute(delivery: CivilDelivery, actor: CivilActor, routeId: string, routeRef: string): CivilResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  const current = delivery.pipingRoutes.find((item) => item.id === routeId && item.status === "current");
  if (!current) return deny(delivery, "The piping route was not found.");
  const successor = { ...current, id: `${current.id}-r${current.revision + 1}`, routeRef, revision: current.revision + 1, civilModified: false as const };
  const next: CivilDelivery = {
    ...delivery,
    pipingRoutes: delivery.pipingRoutes.map((item) => item.id === current.id ? { ...item, status: "superseded" as const } : item).concat(successor),
    corridors: mark(delivery.corridors, current.id),
    crossings: mark(delivery.crossings, current.id),
    trenches: mark(delivery.trenches, current.id),
    interfaces: mark(delivery.interfaces, current.id),
    deliverables: mark(delivery.deliverables, current.id),
  };
  return ok(audit(next, actor, "piping_route_revised", { id: successor.id, previous: current.id, civilModified: false, recalculated: false, freshness: "potentially_stale" }));
}

export function reviewCivil(delivery: CivilDelivery, actor: CivilActor, review: { id: string; subjectId: string; revision: number; outcome: "reviewed" | "approved" }): CivilResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  if (review.outcome === "approved" && !roleMayApproveBasis(actor.actorRole, actor.canApprove)) return deny(delivery, "This role cannot approve civil work.");
  return ok(audit({ ...delivery, reviews: [...delivery.reviews, { ...review, approvalGranted: review.outcome === "approved" }] }, actor, "civil_review_recorded", { id: review.id, approvalGranted: review.outcome === "approved" }));
}

export function freezeCivil(delivery: CivilDelivery, actor: CivilActor, baselineType: BaselineType, id: string): CivilResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  const lifecycleBaseline = createBaseline({ lifecycle: delivery.lifecycle, id, baselineType, actorId: actor.actorId, at: actor.at, unresolvedExceptions: delivery.assumptions.filter((item) => item.blocksNextStage).map((item) => item.id) });
  const basisSnapshot = captureBasisBaseline(delivery.basis, actor.actorId, actor.at);
  return ok(audit({
    ...delivery,
    lifecycle: lifecycleBaseline.lifecycle,
    baselines: [...delivery.baselines, {
      id, type: baselineType, frozen: true,
      surveyIds: delivery.surveys.filter((item) => item.status === "current").map((item) => item.id),
      routeIds: delivery.pipingRoutes.filter((item) => item.status === "current").map((item) => item.id),
    }],
  }, actor, "civil_baseline_frozen", { id, baselineType, basisItems: basisSnapshot.basis.length }));
}

export function deliverableReadiness(delivery: CivilDelivery, id: string): { ifc: boolean; gaps: string[] } {
  const deliverable = delivery.deliverables.find((item) => item.id === id);
  if (!deliverable) return { ifc: false, gaps: ["deliverable_missing"] };
  const gaps: string[] = [];
  if (!deliverable.basisLinked) gaps.push("missing_design_basis");
  if (!delivery.surveys.some((item) => item.status === "current")) gaps.push("missing_current_survey");
  if (deliverable.freshness !== "current") gaps.push("stale_dependency");
  if (delivery.grading.some((item) => item.freshness !== "current")) gaps.push("stale_grading");
  if (delivery.quantities.some((item) => item.freshness !== "current")) gaps.push("stale_quantities");
  if (delivery.interfaces.some((item) => item.status !== "accepted")) gaps.push("unresolved_interface");
  if (!delivery.geotech.length) gaps.push("unresolved_geotechnical_interface");
  if (!delivery.flood.length) gaps.push("missing_flood_basis");
  if (!deliverable.reviewId) gaps.push("missing_review");
  if (delivery.lifecycle.stage !== "detailed_engineering") gaps.push("lifecycle_mismatch");
  const approved = delivery.reviews.some((item) => item.subjectId === deliverable.id && item.approvalGranted && item.revision === deliverable.revision);
  if (!approved) gaps.push("approval_not_granted");
  return { ifc: gaps.length === 0, gaps };
}

export function civilAdvisory(delivery: CivilDelivery): string {
  const stale = delivery.grading.filter((item) => item.freshness === "potentially_stale").length + delivery.quantities.filter((item) => item.freshness === "potentially_stale").length;
  return [
    "Advisory only.",
    `FACT: lifecycle stage is ${delivery.lifecycle.stage}.`,
    `RESULT: ${delivery.quantities.length} civil quantity reference(s) are recorded. No level, volume, flow, or pavement thickness was calculated by this statement.`,
    `ASSUMPTION: ${delivery.assumptions.length} civil assumption(s) are recorded.`,
    `INFERENCE: ${stale} grading or quantity reference(s) are potentially stale.`,
    "RECOMMENDATION: review stale survey and piping-route references before the next baseline.",
    "HUMAN_DECISION_REQUIRED: a human decides whether the grading or drainage record must be revised.",
    "This statement does not invent survey or geotechnical data, approve drainage, or certify earthworks quantities.",
  ].join(" ");
}

export function civilHome(delivery: CivilDelivery) {
  const survey = delivery.surveys.find((item) => item.status === "current");
  return {
    stage: delivery.lifecycle.stage,
    maturity: delivery.lifecycle.maturity,
    basisCount: delivery.basis.basisItems.length,
    requirementCount: delivery.requirements.length,
    surveyCount: delivery.surveys.filter((item) => item.status === "current").length,
    datum: survey ? `${survey.coordinateSystem} / ${survey.verticalDatum}` : "Not set",
    gradingCount: delivery.grading.length,
    earthworksCount: delivery.earthworks.length,
    drainageCount: delivery.drainage.length,
    roadCount: delivery.roads.length,
    pavementCount: delivery.pavements.length,
    culvertCount: delivery.culverts.length,
    corridorCount: delivery.corridors.length,
    quantityCount: delivery.quantities.length,
    staleCount: delivery.grading.filter((item) => item.freshness === "potentially_stale").length + delivery.quantities.filter((item) => item.freshness === "potentially_stale").length,
    interfaceCount: delivery.interfaces.length,
    reviewCount: delivery.reviews.length,
    deliverableCount: delivery.deliverables.length,
    blockers: delivery.lifecycle.criteria.filter((item) => item.blocking && item.status === "unmet").map((item) => item.criterion),
    capabilities: CIVIL_CAPABILITIES,
    advisory: civilAdvisory(delivery),
    approvalGranted: false as const,
  };
}

export function unimplementedCivilCalculations() {
  return CIVIL_CAPABILITIES.filter((item) => item.state === "NOT_IMPLEMENTED");
}
