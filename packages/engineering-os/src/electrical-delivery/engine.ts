import { captureBasisBaseline, createBasisGraph, roleMayApproveBasis } from "../engineering-basis";
import { createBaseline, createDeliveryLifecycle, requestStageTransition } from "../delivery-lifecycle";
import type { BaselineType, DeliveryStage } from "../delivery-lifecycle/model";
import { ELECTRICAL_CAPABILITIES, type ElectricalDelivery } from "./model";

export {
  EASYPOWER_ADAPTER_STATUS,
  ETAP_ADAPTER_STATUS,
  EXTERNAL_ELECTRICAL_ANALYSIS_CERTIFIED,
  POWERFACTORY_ADAPTER_STATUS,
  SKM_ADAPTER_STATUS,
} from "./model";

export type ElectricalActor = {
  actorId: string;
  actorRole: string | null;
  at: string;
  workspaceId: string;
  canAuthorizeLifecycleTransition?: boolean;
  canApprove?: boolean;
};

export type ElectricalResultEnvelope = { delivery: ElectricalDelivery; error: string | null; approvalGranted: false };

function deny(delivery: ElectricalDelivery, error: string): ElectricalResultEnvelope {
  return { delivery, error, approvalGranted: false };
}
function ok(delivery: ElectricalDelivery): ElectricalResultEnvelope {
  return { delivery, error: null, approvalGranted: false };
}
function sameWorkspace(delivery: ElectricalDelivery, actor: ElectricalActor): boolean {
  return delivery.workspaceId === actor.workspaceId;
}
function audit(delivery: ElectricalDelivery, actor: ElectricalActor, action: string, detail: Record<string, string | number | boolean | null>): ElectricalDelivery {
  return { ...delivery, audits: [...delivery.audits, { action, at: actor.at, actorId: actor.actorId, detail }] };
}
function needUnit(value: string | null, unit: string | null, label: string): string | null {
  return value !== null && value !== "" && !unit ? `${label} needs a unit.` : null;
}
function mark<T extends { inputIds: string[]; freshness: "current" | "potentially_stale" }>(rows: T[], id: string): T[] {
  return rows.map((row) => row.inputIds.includes(id) ? { ...row, freshness: "potentially_stale" as const } : row);
}

export function createElectricalDelivery(input: {
  id: string; tenantId: string; workspaceId: string; projectId: string; projectTitle: string; actorId: string; at: string;
}): ElectricalResultEnvelope {
  const lifecycle = createDeliveryLifecycle({ id: `${input.id}-lifecycle`, tenantId: input.tenantId, workspaceId: input.workspaceId, projectId: input.projectId, actorId: input.actorId, at: input.at });
  const basis = createBasisGraph({ id: `${input.id}-basis`, tenantId: input.tenantId, workspaceId: input.workspaceId, projectId: input.projectId, actorId: input.actorId, at: input.at });
  const delivery: ElectricalDelivery = {
    id: input.id, tenantId: input.tenantId, workspaceId: input.workspaceId, projectId: input.projectId, projectTitle: input.projectTitle,
    lifecycle: lifecycle.lifecycle, basis: basis.graph, options: [], systems: [], consumers: [], loads: [], operatingCases: [], powerBalances: [],
    voltageLevels: [], sources: [], generators: [], transformers: [], switchgear: [], mccs: [], ups: [], batteries: [], dcSystems: [], emergencyPower: [],
    slds: [], models: [], studies: [], cables: [], cableSchedules: [], protection: [], earthing: [], hazardousAreas: [], processInputs: [],
    mechanicalInputs: [], civilRoutes: [], civilHandoffs: [], rooms: [], structuralHandoffs: [], icInterfaces: [], interfaces: [], risks: [], decisions: [], assumptions: [],
    requirements: [], conflicts: [], reviews: [], deliverables: [], baselines: [],
    audits: [{ action: "electrical_delivery_created", at: input.at, actorId: input.actorId, detail: { stage: "not_classified", formulasChanged: false, legacyEnrolled: false, equipmentMasterCreated: false } }],
  };
  return ok(delivery);
}

const EVIDENCE: Record<string, (delivery: ElectricalDelivery) => boolean> = {
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
  "controlled inputs": (delivery) => delivery.loads.some((item) => item.status === "current"),
  "calculations linked to current inputs": (delivery) => delivery.studies.some((item) => item.inputIds.length > 0 && item.freshness === "current" && item.provenance !== "metadata"),
  "interface closure or controlled exceptions": (delivery) => delivery.interfaces.length > 0,
  "deliverables under revision control": (delivery) => delivery.deliverables.length > 0,
  "review or verification state available": (delivery) => delivery.reviews.length > 0,
  "unresolved changes assessed": () => true,
  "configuration baseline identifiable": (delivery) => delivery.baselines.length > 0,
};

function withEvidence(delivery: ElectricalDelivery): ElectricalDelivery {
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

export function progressElectricalStage(delivery: ElectricalDelivery, actor: ElectricalActor, to: DeliveryStage, reason: string): ElectricalResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  const prepared = withEvidence(delivery);
  const transition = requestStageTransition(prepared.lifecycle, { to, reason, actorId: actor.actorId, actorRole: actor.actorRole, at: actor.at, canAuthorizeLifecycleTransition: actor.canAuthorizeLifecycleTransition === true });
  const next = audit({ ...prepared, lifecycle: transition.lifecycle }, actor, transition.committed ? "electrical_stage_progressed" : "electrical_stage_refused", { to, committed: transition.committed, error: transition.error });
  return transition.committed ? ok(next) : deny(next, transition.error ?? "stage transition was not committed");
}

export function addElectricalBasis(delivery: ElectricalDelivery, actor: ElectricalActor, item: { id: string; title: string; statement: string; status?: "draft" | "accepted_for_stage" }): ElectricalResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  if (item.status === "accepted_for_stage" && !roleMayApproveBasis(actor.actorRole, true) && actor.actorRole !== "basis_reviewer") {
    return deny(delivery, "Stage acceptance requires a basis reviewer. It is not engineering approval.");
  }
  return ok(audit({
    ...delivery,
    basis: { ...delivery.basis, basisItems: [...delivery.basis.basisItems, {
      id: item.id, level: "discipline", discipline: "electrical", category: "operating_condition", title: item.title, statement: item.statement, unit: null,
      sourceId: null, sourceRevision: null, stage: delivery.lifecycle.stage, status: item.status ?? "draft", revision: 1, effectiveAt: actor.at, owner: actor.actorId,
      reviewer: null, authorityState: "none", provenance: "electrical_delivery", parentId: null, inheritance: "add", overrideRationale: null, supersedesId: null, approvalGranted: false,
    }] },
  }, actor, "electrical_basis_recorded", { id: item.id, approvalGranted: false }));
}

type AttachKey = "options" | "systems" | "consumers" | "operatingCases" | "voltageLevels" | "mccs" | "dcSystems" | "slds" | "cables" | "cableSchedules" | "rooms" | "interfaces" | "risks" | "decisions" | "assumptions" | "requirements" | "deliverables";

export function attachElectrical<K extends AttachKey>(delivery: ElectricalDelivery, actor: ElectricalActor, key: K, value: ElectricalDelivery[K][number]): ElectricalResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  if (key === "systems" && "equipmentMasterCreated" in value && value.equipmentMasterCreated !== false) return deny(delivery, "Electrical delivery does not create an equipment master.");
  const rows = delivery[key] as Array<ElectricalDelivery[K][number]>;
  return ok(audit({ ...delivery, [key]: [...rows, value] }, actor, "electrical_record_attached", { key, id: "id" in value ? String(value.id) : key, equipmentMasterCreated: false }));
}

export function addLoad(delivery: ElectricalDelivery, actor: ElectricalActor, item: ElectricalDelivery["loads"][number]): ElectricalResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  const unitError = needUnit(item.ratedPower, item.unit, "Electrical load");
  if (unitError) return deny(delivery, unitError);
  return ok(audit({ ...delivery, loads: [...delivery.loads, item] }, actor, "electrical_load_recorded", { id: item.id }));
}

function refuseCalculation(item: { calculate?: boolean; calculatedHere?: boolean; adequate?: boolean; certified?: boolean }, message: string): string | null {
  return item.calculate || item.calculatedHere || item.adequate || item.certified ? message : null;
}

export function addPowerBalance(delivery: ElectricalDelivery, actor: ElectricalActor, item: ElectricalDelivery["powerBalances"][number] & { calculate?: boolean }): ElectricalResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  const refused = refuseCalculation(item, "Power balance is not calculated in this module.");
  if (refused) return deny(delivery, refused);
  if (actor.actorRole === "ai") return deny(delivery, "AI cannot invent an electrical study result.");
  const unitError = needUnit(item.demand, item.unit, "Power balance");
  if (unitError) return deny(delivery, unitError);
  const { calculate: _calculate, ...stored } = item;
  return ok(audit({ ...delivery, powerBalances: [...delivery.powerBalances, { ...stored, calculatedHere: false }] }, actor, "power_balance_recorded", { id: item.id, calculatedHere: false }));
}

export function addSource(delivery: ElectricalDelivery, actor: ElectricalActor, item: ElectricalDelivery["sources"][number] & { adequate?: boolean }): ElectricalResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  if (item.adequate || item.adequacyClaimed) return deny(delivery, "Source adequacy is not calculated in this module.");
  const unitError = needUnit(item.capacity, item.unit, "Source capacity");
  if (unitError) return deny(delivery, unitError);
  return ok(audit({ ...delivery, sources: [...delivery.sources, { ...item, adequacyClaimed: false }] }, actor, "electrical_source_recorded", { id: item.id, adequacyClaimed: false }));
}

export function addGenerator(delivery: ElectricalDelivery, actor: ElectricalActor, item: ElectricalDelivery["generators"][number] & { adequate?: boolean }): ElectricalResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  if (item.adequate || item.adequacyClaimed) return deny(delivery, "Generator adequacy is not calculated in this module.");
  const unitError = needUnit(item.capacity, item.unit, "Generator capacity");
  if (unitError) return deny(delivery, unitError);
  return ok(audit({ ...delivery, generators: [...delivery.generators, { ...item, adequacyClaimed: false }] }, actor, "generator_recorded", { id: item.id, adequacyClaimed: false }));
}

export function addTransformer(delivery: ElectricalDelivery, actor: ElectricalActor, item: ElectricalDelivery["transformers"][number] & { adequate?: boolean; inventImpedance?: boolean }): ElectricalResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  if (item.adequate || item.adequacyClaimed) return deny(delivery, "Transformer capacity adequacy is not calculated in this module.");
  if (item.inventImpedance) return deny(delivery, "Transformer impedance is not invented.");
  const unitError = needUnit(item.rating, item.unit, "Transformer rating");
  if (unitError) return deny(delivery, unitError);
  const { adequate: _adequate, inventImpedance: _inventImpedance, ...stored } = item;
  return ok(audit({ ...delivery, transformers: [...delivery.transformers, { ...stored, adequacyClaimed: false }] }, actor, "transformer_recorded", { id: item.id, adequacyClaimed: false }));
}

export function addSwitchgear(delivery: ElectricalDelivery, actor: ElectricalActor, item: ElectricalDelivery["switchgear"][number] & { certify?: boolean }): ElectricalResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  if (item.certify || item.certified) return deny(delivery, "Switchgear fault withstand is not certified without evidence.");
  const unitError = needUnit(item.faultRating, item.unit, "Switchgear fault rating");
  if (unitError) return deny(delivery, unitError);
  return ok(audit({ ...delivery, switchgear: [...delivery.switchgear, { ...item, certified: false }] }, actor, "switchgear_recorded", { id: item.id, certified: false }));
}

export function addUps(delivery: ElectricalDelivery, actor: ElectricalActor, item: ElectricalDelivery["ups"][number] & { calculate?: boolean }): ElectricalResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  if (item.calculate || item.calculatedHere) return deny(delivery, "UPS autonomy is not calculated in this module.");
  const unitError = needUnit(item.autonomy, item.unit, "UPS autonomy");
  if (unitError) return deny(delivery, unitError);
  return ok(audit({ ...delivery, ups: [...delivery.ups, { ...item, calculatedHere: false }] }, actor, "ups_recorded", { id: item.id, calculatedHere: false }));
}

export function addBattery(delivery: ElectricalDelivery, actor: ElectricalActor, item: ElectricalDelivery["batteries"][number] & { calculate?: boolean }): ElectricalResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  if (item.calculate || item.calculatedHere) return deny(delivery, "Battery capacity is not calculated in this module.");
  const unitError = needUnit(item.capacity, item.unit, "Battery capacity");
  if (unitError) return deny(delivery, unitError);
  return ok(audit({ ...delivery, batteries: [...delivery.batteries, { ...item, calculatedHere: false }] }, actor, "battery_recorded", { id: item.id, calculatedHere: false }));
}

export function addEmergencyPower(delivery: ElectricalDelivery, actor: ElectricalActor, item: ElectricalDelivery["emergencyPower"][number] & { calculate?: boolean }): ElectricalResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  if (item.calculate || item.calculatedHere) return deny(delivery, "Emergency-power adequacy is not calculated in this module.");
  return ok(audit({ ...delivery, emergencyPower: [...delivery.emergencyPower, { ...item, calculatedHere: false }] }, actor, "emergency_power_recorded", { id: item.id, calculatedHere: false }));
}

const STUDY_DENIAL: Record<ElectricalDelivery["studies"][number]["kind"], string> = {
  load_flow: "Load-flow results are not calculated in this module.",
  short_circuit: "Fault levels are not calculated in this module.",
  coordination: "Protection coordination is not calculated in this module.",
  motor_starting: "Motor-starting performance is not calculated in this module.",
  voltage_drop: "Voltage drop is not calculated in this module.",
  harmonic: "Harmonic distortion is not calculated in this module.",
  arc_flash: "Arc-flash incident energy is not calculated in this module.",
  cable_sizing: "Cable size is not calculated in this module.",
  lighting: "Lighting illuminance is not calculated in this module.",
  lightning: "Lightning-protection compliance is not claimed without evidence.",
};

export function addStudy(delivery: ElectricalDelivery, actor: ElectricalActor, item: ElectricalDelivery["studies"][number] & { calculate?: boolean; certified?: boolean }): ElectricalResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  if (actor.actorRole === "ai") return deny(delivery, "AI cannot invent an electrical study result.");
  const refused = refuseCalculation(item, STUDY_DENIAL[item.kind]);
  if (refused) return deny(delivery, refused);
  const unitError = needUnit(item.value, item.unit, "Electrical study");
  if (unitError) return deny(delivery, unitError);
  const { calculate: _calculate, certified: _certified, ...stored } = item;
  return ok(audit({ ...delivery, studies: [...delivery.studies, { ...stored, calculatedHere: false }] }, actor, "electrical_study_recorded", { id: item.id, kind: item.kind, calculatedHere: false }));
}

export function addProtection(delivery: ElectricalDelivery, actor: ElectricalActor, item: ElectricalDelivery["protection"][number] & { calculate?: boolean }): ElectricalResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  if (actor.actorRole === "ai") return deny(delivery, "AI cannot approve a protection setting.");
  if (item.calculate) return deny(delivery, "Protection settings are not calculated in this module.");
  const unitError = needUnit(item.setting, item.unit, "Protection setting");
  if (unitError) return deny(delivery, unitError);
  return ok(audit({ ...delivery, protection: [...delivery.protection, { ...item, approvalGranted: false }] }, actor, "protection_recorded", { id: item.id, approvalGranted: false }));
}

export function addEarthing(delivery: ElectricalDelivery, actor: ElectricalActor, item: ElectricalDelivery["earthing"][number] & { calculate?: boolean; inferResistivity?: boolean }): ElectricalResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  if (item.calculate || item.calculatedHere) return deny(delivery, "Earthing resistance is not calculated in this module.");
  if (item.inferResistivity || item.inferredFromGeotechnics) return deny(delivery, "Soil resistivity is not inferred from unrelated geotechnical properties.");
  const unitError = needUnit(item.resistance, item.unit, "Earthing resistance");
  if (unitError) return deny(delivery, unitError);
  const { calculate: _calculate, inferResistivity: _inferResistivity, ...stored } = item;
  return ok(audit({ ...delivery, earthing: [...delivery.earthing, { ...stored, calculatedHere: false, inferredFromGeotechnics: false }] }, actor, "earthing_recorded", { id: item.id, calculatedHere: false }));
}

export function addHazardousArea(delivery: ElectricalDelivery, actor: ElectricalActor, item: ElectricalDelivery["hazardousAreas"][number] & { createClassification?: boolean }): ElectricalResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  if (item.createClassification || item.createdByElectrical || item.sourceDiscipline === "electrical") return deny(delivery, "Electrical does not create process hazardous-area classification.");
  return ok(audit({ ...delivery, hazardousAreas: [...delivery.hazardousAreas, { ...item, createdByElectrical: false }] }, actor, "hazardous_area_recorded", { id: item.id, createdByElectrical: false }));
}

export function receiveProcessInput(delivery: ElectricalDelivery, actor: ElectricalActor, item: ElectricalDelivery["processInputs"][number]): ElectricalResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  if (item.ownedBy !== "process" || item.electricalModified !== false) return deny(delivery, "A process scenario remains owned by Process.");
  return ok(audit({ ...delivery, processInputs: [...delivery.processInputs, item] }, actor, "process_input_received", { id: item.id, electricalModified: false }));
}

export function modifyProcessInput(delivery: ElectricalDelivery): ElectricalResultEnvelope {
  return deny(delivery, "Electrical cannot modify a Process operating scenario.");
}

export function receiveMechanicalInput(delivery: ElectricalDelivery, actor: ElectricalActor, item: ElectricalDelivery["mechanicalInputs"][number]): ElectricalResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  if (item.ownedBy !== "mechanical" || item.electricalModified !== false) return deny(delivery, "A mechanical equipment duty remains owned by Mechanical.");
  const unitError = needUnit(item.ratedPower, item.unit, "Mechanical motor power");
  if (unitError) return deny(delivery, unitError);
  return ok(audit({ ...delivery, mechanicalInputs: [...delivery.mechanicalInputs, item] }, actor, "mechanical_input_received", { id: item.id, electricalModified: false }));
}

export function modifyMechanicalInput(delivery: ElectricalDelivery): ElectricalResultEnvelope {
  return deny(delivery, "Electrical cannot modify a Mechanical equipment duty.");
}

export function receiveCivilRoute(delivery: ElectricalDelivery, actor: ElectricalActor, item: ElectricalDelivery["civilRoutes"][number]): ElectricalResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  if (item.ownedBy !== "civil" || item.electricalModified !== false) return deny(delivery, "A civil cable route remains owned by Civil.");
  const unitError = needUnit(item.length, item.unit, "Civil route length");
  if (unitError) return deny(delivery, unitError);
  return ok(audit({ ...delivery, civilRoutes: [...delivery.civilRoutes, item] }, actor, "civil_route_received", { id: item.id, electricalModified: false }));
}

export function modifyCivilRoute(delivery: ElectricalDelivery): ElectricalResultEnvelope {
  return deny(delivery, "Electrical cannot modify a Civil cable route.");
}

export function addCivilHandoff(delivery: ElectricalDelivery, actor: ElectricalActor, item: ElectricalDelivery["civilHandoffs"][number]): ElectricalResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  if (item.civilModified) return deny(delivery, "Electrical cannot modify a Civil cable route.");
  const unitError = needUnit(item.value, item.unit, "Civil handoff");
  if (unitError) return deny(delivery, unitError);
  return ok(audit({ ...delivery, civilHandoffs: [...delivery.civilHandoffs, { ...item, civilModified: false }] }, actor, "civil_handoff_recorded", { id: item.id, civilModified: false }));
}

export function addStructuralHandoff(delivery: ElectricalDelivery, actor: ElectricalActor, item: ElectricalDelivery["structuralHandoffs"][number]): ElectricalResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  if (item.structuralCapacityClaimed) return deny(delivery, "Structural capacity remains owned by Structural.");
  const unitError = needUnit(item.mass, item.unit, "Electrical equipment mass");
  if (unitError) return deny(delivery, unitError);
  return ok(audit({ ...delivery, structuralHandoffs: [...delivery.structuralHandoffs, { ...item, structuralCapacityClaimed: false }] }, actor, "structural_handoff_recorded", { id: item.id, structuralCapacityClaimed: false }));
}

export function addIcInterface(delivery: ElectricalDelivery, actor: ElectricalActor, item: ElectricalDelivery["icInterfaces"][number] & { implementDesign?: boolean }): ElectricalResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  if (item.implementDesign || item.fullDesignImplemented) return deny(delivery, "Full I&C design is not implemented in this phase.");
  return ok(audit({ ...delivery, icInterfaces: [...delivery.icInterfaces, { ...item, fullDesignImplemented: false }] }, actor, "ic_interface_recorded", { id: item.id, fullDesignImplemented: false }));
}

export function recordConflict(delivery: ElectricalDelivery, actor: ElectricalActor, conflict: { id: string; subjectId: string; statement: string }): ElectricalResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  return ok(audit({ ...delivery, conflicts: [...delivery.conflicts, { ...conflict, mechanicalModified: false, processModified: false, civilModified: false }] }, actor, "electrical_conflict_recorded", { id: conflict.id }));
}

export function registerElectricalTool(delivery: ElectricalDelivery, actor: ElectricalActor, input: { id: string; tool: string; version: string; loadListRevision: number; inputChecksum: string; certifyExecution?: boolean; bidirectional?: boolean }): ElectricalResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  if (input.certifyExecution) return deny(delivery, "External electrical analysis is not certified by this delivery module.");
  if (input.bidirectional) return deny(delivery, "Bidirectional power-system synchronization is not implemented.");
  return ok(audit({
    ...delivery,
    models: [...delivery.models, { id: input.id, tool: input.tool, version: input.version, revision: 1, loadListRevision: input.loadListRevision, inputChecksum: input.inputChecksum, bidirectional: false, executionCertified: false }],
  }, actor, "electrical_tool_registered", { id: input.id, executionCertified: false }));
}

function staleFrom(delivery: ElectricalDelivery, id: string): Pick<ElectricalDelivery, "loads" | "powerBalances" | "transformers" | "switchgear" | "mccs" | "studies" | "cables" | "cableSchedules" | "protection" | "slds" | "earthing" | "civilHandoffs" | "structuralHandoffs" | "interfaces" | "deliverables"> {
  return {
    loads: mark(delivery.loads, id),
    powerBalances: mark(delivery.powerBalances, id),
    transformers: mark(delivery.transformers, id),
    switchgear: mark(delivery.switchgear, id),
    mccs: mark(delivery.mccs, id),
    studies: mark(delivery.studies, id),
    cables: mark(delivery.cables, id),
    cableSchedules: mark(delivery.cableSchedules, id),
    protection: mark(delivery.protection, id),
    slds: mark(delivery.slds, id),
    earthing: mark(delivery.earthing, id),
    civilHandoffs: mark(delivery.civilHandoffs, id),
    structuralHandoffs: mark(delivery.structuralHandoffs, id),
    interfaces: mark(delivery.interfaces, id),
    deliverables: mark(delivery.deliverables, id),
  };
}

export function reviseMechanicalPower(delivery: ElectricalDelivery, actor: ElectricalActor, id: string, ratedPower: string): ElectricalResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  const current = delivery.mechanicalInputs.find((item) => item.id === id && item.status === "current");
  if (!current) return deny(delivery, "The mechanical motor input was not found.");
  const successor = { ...current, id: `${current.id}-r${current.revision + 1}`, ratedPower, revision: current.revision + 1, electricalModified: false as const };
  const next: ElectricalDelivery = {
    ...delivery,
    ...staleFrom(delivery, current.id),
    mechanicalInputs: delivery.mechanicalInputs.map((item) => item.id === current.id ? { ...item, status: "superseded" as const } : item).concat(successor),
  };
  return ok(audit(next, actor, "mechanical_power_revised", { id: successor.id, previous: current.id, electricalModified: false, recalculated: false, freshness: "potentially_stale" }));
}

export function reviseCivilRoute(delivery: ElectricalDelivery, actor: ElectricalActor, id: string, length: string): ElectricalResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  const current = delivery.civilRoutes.find((item) => item.id === id && item.status === "current");
  if (!current) return deny(delivery, "The civil cable route was not found.");
  const successor = { ...current, id: `${current.id}-r${current.revision + 1}`, length, revision: current.revision + 1, electricalModified: false as const };
  const next: ElectricalDelivery = {
    ...delivery,
    ...staleFrom(delivery, current.id),
    civilRoutes: delivery.civilRoutes.map((item) => item.id === current.id ? { ...item, status: "superseded" as const } : item).concat(successor),
  };
  return ok(audit(next, actor, "civil_route_revised", { id: successor.id, previous: current.id, electricalModified: false, recalculated: false, freshness: "potentially_stale" }));
}

export function reviewElectrical(delivery: ElectricalDelivery, actor: ElectricalActor, review: { id: string; subjectId: string; revision: number; outcome: "reviewed" | "approved" }): ElectricalResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  if (review.outcome === "approved" && !roleMayApproveBasis(actor.actorRole, actor.canApprove)) return deny(delivery, "This role cannot approve electrical work.");
  return ok(audit({ ...delivery, reviews: [...delivery.reviews, { ...review, approvalGranted: review.outcome === "approved" }] }, actor, "electrical_review_recorded", { id: review.id, approvalGranted: review.outcome === "approved" }));
}

export function freezeElectrical(delivery: ElectricalDelivery, actor: ElectricalActor, baselineType: BaselineType, id: string): ElectricalResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  const lifecycleBaseline = createBaseline({ lifecycle: delivery.lifecycle, id, baselineType, actorId: actor.actorId, at: actor.at, unresolvedExceptions: delivery.assumptions.filter((item) => item.blocksNextStage).map((item) => item.id) });
  const basisSnapshot = captureBasisBaseline(delivery.basis, actor.actorId, actor.at);
  return ok(audit({
    ...delivery,
    lifecycle: lifecycleBaseline.lifecycle,
    baselines: [...delivery.baselines, {
      id, type: baselineType, frozen: true,
      loadIds: delivery.loads.filter((item) => item.status === "current").map((item) => item.id),
      modelIds: delivery.models.map((item) => item.id),
    }],
  }, actor, "electrical_baseline_frozen", { id, baselineType, basisItems: basisSnapshot.basis.length }));
}

export function deliverableReadiness(delivery: ElectricalDelivery, id: string): { ifc: boolean; gaps: string[] } {
  const deliverable = delivery.deliverables.find((item) => item.id === id);
  if (!deliverable) return { ifc: false, gaps: ["deliverable_missing"] };
  const gaps: string[] = [];
  if (!deliverable.basisLinked) gaps.push("missing_design_basis");
  if (!delivery.loads.some((item) => item.status === "current")) gaps.push("incomplete_load_list");
  if (deliverable.freshness !== "current") gaps.push("stale_dependency");
  if (delivery.studies.some((item) => item.freshness !== "current")) gaps.push("stale_study");
  if (delivery.protection.some((item) => item.approvalGranted === false)) gaps.push("unreviewed_protection");
  if (delivery.interfaces.some((item) => item.status !== "accepted")) gaps.push("unresolved_interface");
  if (!delivery.hazardousAreas.some((item) => item.sourceDiscipline !== "electrical")) gaps.push("unresolved_hazardous_area");
  if (!deliverable.reviewId) gaps.push("missing_review");
  if (delivery.lifecycle.stage !== "detailed_engineering") gaps.push("lifecycle_mismatch");
  const approved = delivery.reviews.some((item) => item.subjectId === deliverable.id && item.approvalGranted && item.revision === deliverable.revision);
  if (!approved) gaps.push("approval_not_granted");
  return { ifc: gaps.length === 0, gaps };
}

export function electricalAdvisory(delivery: ElectricalDelivery): string {
  const stale = delivery.studies.filter((item) => item.freshness === "potentially_stale").length;
  return [
    "Advisory only.",
    `FACT: lifecycle stage is ${delivery.lifecycle.stage}.`,
    `RESULT: ${delivery.studies.length} study reference(s) are recorded. No load flow, fault level, or cable size was calculated by this statement.`,
    `ASSUMPTION: ${delivery.assumptions.length} electrical assumption(s) are recorded.`,
    `INFERENCE: ${stale} study reference(s) are potentially stale.`,
    "RECOMMENDATION: review stale mechanical-load and civil-route references before the next baseline.",
    "HUMAN_DECISION_REQUIRED: a human decides whether the load list, study, or cable record must be revised.",
    "This statement does not invent electrical study results, approve protection settings, or certify electrical safety.",
  ].join(" ");
}

export function electricalHome(delivery: ElectricalDelivery) {
  const currentLoads = delivery.loads.filter((item) => item.status === "current");
  return {
    stage: delivery.lifecycle.stage,
    maturity: delivery.lifecycle.maturity,
    basisCount: delivery.basis.basisItems.length,
    requirementCount: delivery.requirements.length,
    loadCount: currentLoads.length,
    connectedLoadStatus: currentLoads.length > 0 ? "recorded" : "missing",
    demandLoadStatus: delivery.powerBalances.length > 0 ? "recorded" : "missing",
    sourceCount: delivery.sources.length,
    transformerCount: delivery.transformers.length,
    switchgearCount: delivery.switchgear.length,
    mccCount: delivery.mccs.length,
    sldCount: delivery.slds.length,
    modelCount: delivery.models.length,
    studyCount: delivery.studies.length,
    cableCount: delivery.cables.length,
    cableScheduleCount: delivery.cableSchedules.length,
    staleStudyCount: delivery.studies.filter((item) => item.freshness === "potentially_stale").length,
    earthingCount: delivery.earthing.length,
    lightingCount: delivery.studies.filter((item) => item.kind === "lighting").length,
    emergencyCount: delivery.emergencyPower.length,
    upsCount: delivery.ups.length,
    interfaceCount: delivery.interfaces.length,
    openChanges: delivery.conflicts.length,
    openAssumptions: delivery.assumptions.length,
    reviewCount: delivery.reviews.length,
    deliverableCount: delivery.deliverables.length,
    blockers: delivery.lifecycle.criteria.filter((item) => item.blocking && item.status === "unmet").map((item) => item.criterion),
    capabilities: ELECTRICAL_CAPABILITIES,
    advisory: electricalAdvisory(delivery),
    approvalGranted: false as const,
  };
}

export function unimplementedElectricalCalculations() {
  return ELECTRICAL_CAPABILITIES.filter((item) => item.state === "NOT_IMPLEMENTED");
}
