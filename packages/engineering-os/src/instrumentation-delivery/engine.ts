import { captureBasisBaseline, createBasisGraph, roleMayApproveBasis } from "../engineering-basis";
import { createBaseline, createDeliveryLifecycle, requestStageTransition } from "../delivery-lifecycle";
import type { BaselineType, DeliveryStage } from "../delivery-lifecycle/model";
import { IC_CAPABILITIES, type InstrumentationDelivery } from "./model";

export {
  DETERMINISTIC_SIL_VERIFICATION_ENGINE_READY,
  EXTERNAL_IC_CONFIGURATION_CERTIFIED,
} from "./model";

export type InstrumentationActor = {
  actorId: string;
  actorRole: string | null;
  at: string;
  workspaceId: string;
  canAuthorizeLifecycleTransition?: boolean;
  canApprove?: boolean;
};

export type InstrumentationResultEnvelope = { delivery: InstrumentationDelivery; error: string | null; approvalGranted: false };

function deny(delivery: InstrumentationDelivery, error: string): InstrumentationResultEnvelope {
  return { delivery, error, approvalGranted: false };
}
function ok(delivery: InstrumentationDelivery): InstrumentationResultEnvelope {
  return { delivery, error: null, approvalGranted: false };
}
function sameWorkspace(delivery: InstrumentationDelivery, actor: InstrumentationActor): boolean {
  return delivery.workspaceId === actor.workspaceId;
}
function audit(delivery: InstrumentationDelivery, actor: InstrumentationActor, action: string, detail: Record<string, string | number | boolean | null>): InstrumentationDelivery {
  return { ...delivery, audits: [...delivery.audits, { action, at: actor.at, actorId: actor.actorId, detail }] };
}
function needUnit(value: string | null, unit: string | null, label: string): string | null {
  return value !== null && value !== "" && !unit ? `${label} needs a unit.` : null;
}
function mark<T extends { inputIds: string[]; freshness: "current" | "potentially_stale" }>(rows: T[], id: string): T[] {
  return rows.map((row) => row.inputIds.includes(id) ? { ...row, freshness: "potentially_stale" as const } : row);
}

export function createInstrumentationDelivery(input: {
  id: string; tenantId: string; workspaceId: string; projectId: string; projectTitle: string; actorId: string; at: string;
}): InstrumentationResultEnvelope {
  const lifecycle = createDeliveryLifecycle({ id: `${input.id}-lifecycle`, tenantId: input.tenantId, workspaceId: input.workspaceId, projectId: input.projectId, actorId: input.actorId, at: input.at });
  const basis = createBasisGraph({ id: `${input.id}-basis`, tenantId: input.tenantId, workspaceId: input.workspaceId, projectId: input.projectId, actorId: input.actorId, at: input.at });
  const delivery: InstrumentationDelivery = {
    id: input.id, tenantId: input.tenantId, workspaceId: input.workspaceId, projectId: input.projectId, projectTitle: input.projectTitle,
    lifecycle: lifecycle.lifecycle, basis: basis.graph, options: [], systems: [], instruments: [], signals: [], loops: [], datasheets: [],
    narratives: [], causeEffect: [], alarms: [], rationalizations: [], trips: [], sifs: [], verifications: [], fireGas: [], packages: [],
    valves: [], finalElements: [], panels: [], cabinets: [], junctionBoxes: [], marshalling: [], cables: [], cableSchedules: [], networks: [],
    communications: [], cyberRequirements: [], logicDocuments: [], fat: [], sat: [], commissioning: [], processInputs: [], mechanicalInputs: [],
    pipingInputs: [], electricalInputs: [], electricalHandoffs: [], structuralInterfaces: [], civilInterfaces: [], interfaces: [], risks: [],
    decisions: [], assumptions: [], requirements: [], conflicts: [], reviews: [], deliverables: [], baselines: [], models: [],
    audits: [{ action: "instrumentation_delivery_created", at: input.at, actorId: input.actorId, detail: { stage: "not_classified", formulasChanged: false, legacyEnrolled: false, instrumentMasterCreated: false } }],
  };
  return ok(delivery);
}

const EVIDENCE: Record<string, (delivery: InstrumentationDelivery) => boolean> = {
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
  "controlled inputs": (delivery) => delivery.instruments.some((item) => item.status === "current"),
  "calculations linked to current inputs": (delivery) => delivery.verifications.some((item) => item.inputIds.length > 0 && item.freshness === "current" && item.provenance !== "metadata" && item.calculatedHere === false),
  "interface closure or controlled exceptions": (delivery) => delivery.interfaces.length > 0,
  "deliverables under revision control": (delivery) => delivery.deliverables.length > 0,
  "review or verification state available": (delivery) => delivery.reviews.length > 0,
  "unresolved changes assessed": () => true,
  "configuration baseline identifiable": (delivery) => delivery.baselines.length > 0,
};

function withEvidence(delivery: InstrumentationDelivery): InstrumentationDelivery {
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

export function progressInstrumentationStage(delivery: InstrumentationDelivery, actor: InstrumentationActor, to: DeliveryStage, reason: string): InstrumentationResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  const prepared = withEvidence(delivery);
  const transition = requestStageTransition(prepared.lifecycle, { to, reason, actorId: actor.actorId, actorRole: actor.actorRole, at: actor.at, canAuthorizeLifecycleTransition: actor.canAuthorizeLifecycleTransition === true });
  const next = audit({ ...prepared, lifecycle: transition.lifecycle }, actor, transition.committed ? "instrumentation_stage_progressed" : "instrumentation_stage_refused", { to, committed: transition.committed, error: transition.error });
  return transition.committed ? ok(next) : deny(next, transition.error ?? "stage transition was not committed");
}

export function addInstrumentationBasis(delivery: InstrumentationDelivery, actor: InstrumentationActor, item: { id: string; title: string; statement: string; status?: "draft" | "accepted_for_stage" }): InstrumentationResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  if (item.status === "accepted_for_stage" && !roleMayApproveBasis(actor.actorRole, true) && actor.actorRole !== "basis_reviewer") {
    return deny(delivery, "Stage acceptance requires a basis reviewer. It is not engineering approval.");
  }
  return ok(audit({
    ...delivery,
    basis: { ...delivery.basis, basisItems: [...delivery.basis.basisItems, {
      id: item.id, level: "discipline", discipline: "instrumentation_and_control", category: "operating_condition", title: item.title, statement: item.statement, unit: null,
      sourceId: null, sourceRevision: null, stage: delivery.lifecycle.stage, status: item.status ?? "draft", revision: 1, effectiveAt: actor.at, owner: actor.actorId,
      reviewer: null, authorityState: "none", provenance: "instrumentation_delivery", parentId: null, inheritance: "add", overrideRationale: null, supersedesId: null, approvalGranted: false,
    }] },
  }, actor, "instrumentation_basis_recorded", { id: item.id, approvalGranted: false }));
}

type AttachKey = "options" | "systems" | "fireGas" | "valves" | "finalElements" | "panels" | "cabinets" | "junctionBoxes" | "marshalling" | "cables" | "cableSchedules" | "communications" | "logicDocuments" | "structuralInterfaces" | "civilInterfaces" | "interfaces" | "risks" | "decisions" | "assumptions" | "requirements" | "deliverables";

export function attachInstrumentation<K extends AttachKey>(delivery: InstrumentationDelivery, actor: InstrumentationActor, key: K, value: InstrumentationDelivery[K][number]): InstrumentationResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  if (key === "systems" && "equipmentMasterCreated" in value && value.equipmentMasterCreated !== false) return deny(delivery, "I&C delivery does not create an equipment master.");
  if (key === "fireGas" && "coverageModeled" in value && value.coverageModeled !== false) return deny(delivery, "Detector coverage is not modeled in this module.");
  if (key === "valves" && "cvInvented" in value && value.cvInvented !== false) return deny(delivery, "Control-valve Cv remains with Process.");
  if (key === "logicDocuments" && "generatedHere" in value && value.generatedHere !== false) return deny(delivery, "Control logic is not generated in this module.");
  if (key === "communications" && "interoperabilityClaimed" in value && value.interoperabilityClaimed !== false) return deny(delivery, "Protocol interoperability is not claimed.");
  if (key === "structuralInterfaces" && "structuralCapacityClaimed" in value && value.structuralCapacityClaimed !== false) return deny(delivery, "Structural capacity remains owned by Structural.");
  const rows = delivery[key] as Array<InstrumentationDelivery[K][number]>;
  return ok(audit({ ...delivery, [key]: [...rows, value] }, actor, "instrumentation_record_attached", { key, id: "id" in value ? String(value.id) : key, instrumentMasterCreated: false }));
}

export function addInstrument(delivery: InstrumentationDelivery, actor: InstrumentationActor, item: InstrumentationDelivery["instruments"][number] & { inventRange?: boolean }): InstrumentationResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  if (item.inventRange) return deny(delivery, "Instrument range is not invented.");
  const unitError = needUnit(item.range, item.unit, "Instrument range");
  if (unitError) return deny(delivery, unitError);
  const { inventRange: _inventRange, ...stored } = item;
  return ok(audit({ ...delivery, instruments: [...delivery.instruments, stored] }, actor, "instrument_recorded", { id: item.id }));
}

export function addSignal(delivery: InstrumentationDelivery, actor: InstrumentationActor, item: InstrumentationDelivery["signals"][number] & { safetyToBpcs?: boolean }): InstrumentationResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  if (!item.source || !item.destination || !item.allocation) return deny(delivery, "An I/O signal needs a source, destination, and system allocation.");
  if (item.safetyToBpcs || (item.allocation === "bpcs" && item.signalType === "safety")) return deny(delivery, "A safety function is not allocated to the BPCS.");
  const { safetyToBpcs: _safetyToBpcs, ...stored } = item;
  return ok(audit({ ...delivery, signals: [...delivery.signals, stored] }, actor, "io_signal_recorded", { id: item.id }));
}

export function addLoop(delivery: InstrumentationDelivery, actor: InstrumentationActor, item: InstrumentationDelivery["loops"][number] & { generateTuning?: boolean }): InstrumentationResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  if (item.generateTuning || item.tuningGenerated) return deny(delivery, "Tuning constants are not generated in this module.");
  return ok(audit({ ...delivery, loops: [...delivery.loops, { ...item, tuningGenerated: false }] }, actor, "control_loop_recorded", { id: item.id, tuningGenerated: false }));
}

export function addDatasheet(delivery: InstrumentationDelivery, actor: InstrumentationActor, item: InstrumentationDelivery["datasheets"][number] & { inventVendor?: boolean; inventRange?: boolean }): InstrumentationResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  if (item.inventVendor || item.vendorInvented) return deny(delivery, "Vendor specifications are not invented.");
  if (item.inventRange) return deny(delivery, "Instrument range is not invented.");
  const unitError = needUnit(item.range, item.unit, "Datasheet range");
  if (unitError) return deny(delivery, unitError);
  const { inventVendor: _inventVendor, inventRange: _inventRange, ...stored } = item;
  return ok(audit({ ...delivery, datasheets: [...delivery.datasheets, { ...stored, vendorInvented: false }] }, actor, "datasheet_recorded", { id: item.id }));
}

export function addNarrative(delivery: InstrumentationDelivery, actor: InstrumentationActor, item: InstrumentationDelivery["narratives"][number]): InstrumentationResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  if (actor.actorRole === "ai" && item.status !== "proposed") return deny(delivery, "An AI narrative stays proposed until human review.");
  const stored = actor.actorRole === "ai" ? { ...item, status: "proposed" as const, aiGenerated: true } : item;
  return ok(audit({ ...delivery, narratives: [...delivery.narratives, stored] }, actor, "control_narrative_recorded", { id: item.id, status: stored.status }));
}

export function addCauseEffect(delivery: InstrumentationDelivery, actor: InstrumentationActor, item: InstrumentationDelivery["causeEffect"][number] & { approve?: boolean }): InstrumentationResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  if (item.approve || actor.actorRole === "ai") return deny(delivery, "AI cannot approve cause-and-effect logic.");
  const { approve: _approve, ...stored } = item;
  return ok(audit({ ...delivery, causeEffect: [...delivery.causeEffect, { ...stored, approvalGranted: false }] }, actor, "cause_effect_recorded", { id: item.id, approvalGranted: false }));
}

export function addAlarm(delivery: InstrumentationDelivery, actor: InstrumentationActor, item: InstrumentationDelivery["alarms"][number] & { inventSetpoint?: boolean }): InstrumentationResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  if (item.inventSetpoint) return deny(delivery, "Alarm setpoints are not invented.");
  if (actor.actorRole === "ai") return deny(delivery, "AI cannot approve an alarm setpoint.");
  const unitError = needUnit(item.setpoint, item.unit, "Alarm setpoint");
  if (unitError) return deny(delivery, unitError);
  const { inventSetpoint: _inventSetpoint, ...stored } = item;
  return ok(audit({ ...delivery, alarms: [...delivery.alarms, { ...stored, approvalGranted: false }] }, actor, "alarm_recorded", { id: item.id, approvalGranted: false }));
}

export function addRationalization(delivery: InstrumentationDelivery, actor: InstrumentationActor, item: InstrumentationDelivery["rationalizations"][number] & { approve?: boolean }): InstrumentationResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  if (item.approve || actor.actorRole === "ai") return deny(delivery, "AI cannot approve alarm rationalization.");
  return ok(audit({ ...delivery, rationalizations: [...delivery.rationalizations, { ...item, approvalGranted: false }] }, actor, "alarm_rationalization_recorded", { id: item.id, approvalGranted: false }));
}

export function addTrip(delivery: InstrumentationDelivery, actor: InstrumentationActor, item: InstrumentationDelivery["trips"][number] & { inventSetpoint?: boolean }): InstrumentationResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  if (item.inventSetpoint) return deny(delivery, "Trip values are not invented.");
  if (item.setpoint && !item.sourceId) return deny(delivery, "A trip setpoint needs an authorized source.");
  const unitError = needUnit(item.setpoint, item.unit, "Trip setpoint");
  if (unitError) return deny(delivery, unitError);
  const { inventSetpoint: _inventSetpoint, ...stored } = item;
  return ok(audit({ ...delivery, trips: [...delivery.trips, { ...stored, ownedBy: "process", icModified: false }] }, actor, "trip_recorded", { id: item.id, icModified: false }));
}

export function addSif(delivery: InstrumentationDelivery, actor: InstrumentationActor, item: InstrumentationDelivery["sifs"][number] & { determineSil?: boolean }): InstrumentationResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  if (item.determineSil || item.verifiedHere) return deny(delivery, "A SIL target is not determined in this module.");
  if (item.allocatedToBpcs) return deny(delivery, "A safety function is not allocated to the BPCS.");
  if (item.silTarget && !item.authorizedSourceId) return deny(delivery, "A SIL target needs an authorized safety-study source.");
  if (actor.actorRole === "ai" && item.silTarget) return deny(delivery, "AI cannot determine a SIL target.");
  const { determineSil: _determineSil, ...stored } = item;
  return ok(audit({ ...delivery, sifs: [...delivery.sifs, { ...stored, allocatedToBpcs: false, verifiedHere: false }] }, actor, "sif_recorded", { id: item.id, verifiedHere: false }));
}

export function addVerification(delivery: InstrumentationDelivery, actor: InstrumentationActor, item: InstrumentationDelivery["verifications"][number] & { calculate?: boolean }): InstrumentationResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  if (item.calculate || item.calculatedHere || item.certified) return deny(delivery, "SIL performance is not calculated in this module.");
  if (actor.actorRole === "ai") return deny(delivery, "AI cannot approve SIS verification.");
  const unitError = needUnit(item.result, item.unit, "SIS verification result");
  if (unitError) return deny(delivery, unitError);
  const { calculate: _calculate, ...stored } = item;
  return ok(audit({ ...delivery, verifications: [...delivery.verifications, { ...stored, calculatedHere: false, certified: false }] }, actor, "sis_verification_recorded", { id: item.id, calculatedHere: false }));
}

export function addPackage(delivery: InstrumentationDelivery, actor: InstrumentationActor, item: InstrumentationDelivery["packages"][number] & { inventSignals?: boolean }): InstrumentationResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  if (item.inventSignals || item.signalsInvented) return deny(delivery, "Package signals are not invented.");
  const { inventSignals: _inventSignals, ...stored } = item;
  return ok(audit({ ...delivery, packages: [...delivery.packages, { ...stored, signalsInvented: false }] }, actor, "package_interface_recorded", { id: item.id }));
}

export function addNetwork(delivery: InstrumentationDelivery, actor: InstrumentationActor, item: InstrumentationDelivery["networks"][number] & { password?: string; secret?: string }): InstrumentationResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  if (item.password || item.secret || item.secretStored) return deny(delivery, "Network secrets are not stored.");
  const { password: _password, secret: _secret, ...stored } = item;
  return ok(audit({ ...delivery, networks: [...delivery.networks, { ...stored, secretStored: false }] }, actor, "network_recorded", { id: item.id, secretStored: false }));
}

export function addCyberRequirement(delivery: InstrumentationDelivery, actor: InstrumentationActor, item: InstrumentationDelivery["cyberRequirements"][number] & { openAccess?: boolean; changeFirewall?: boolean; createAccount?: boolean }): InstrumentationResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  if (item.openAccess || item.changeFirewall || item.createAccount || item.accessOpened || item.firewallChanged) return deny(delivery, "AI cannot change OT access or firewall rules.");
  if (actor.actorRole === "ai") return deny(delivery, "AI cannot approve OT cybersecurity access.");
  return ok(audit({ ...delivery, cyberRequirements: [...delivery.cyberRequirements, { id: item.id, statement: item.statement, accessOpened: false, firewallChanged: false }] }, actor, "cyber_requirement_recorded", { id: item.id, accessOpened: false }));
}

export function addFat(delivery: InstrumentationDelivery, actor: InstrumentationActor, item: InstrumentationDelivery["fat"][number] & { claimPassed?: boolean }): InstrumentationResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  if ((item.claimPassed || item.result === "passed") && !item.evidenceId) return deny(delivery, "FAT is not passed without evidence.");
  return ok(audit({ ...delivery, fat: [...delivery.fat, { ...item, passedClaimed: false }] }, actor, "fat_recorded", { id: item.id, passedClaimed: false }));
}

export function addSat(delivery: InstrumentationDelivery, actor: InstrumentationActor, item: InstrumentationDelivery["sat"][number] & { claimPassed?: boolean }): InstrumentationResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  if ((item.claimPassed || item.result === "passed") && !item.evidenceId) return deny(delivery, "SAT is not passed without evidence.");
  return ok(audit({ ...delivery, sat: [...delivery.sat, item] }, actor, "sat_recorded", { id: item.id }));
}

export function addCommissioning(delivery: InstrumentationDelivery, actor: InstrumentationActor, item: InstrumentationDelivery["commissioning"][number] & { closeSafetyTest?: boolean }): InstrumentationResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  if (item.closeSafetyTest || item.safetyClosed) return deny(delivery, "A safety-critical test is not closed automatically.");
  return ok(audit({ ...delivery, commissioning: [...delivery.commissioning, { ...item, safetyClosed: false }] }, actor, "commissioning_recorded", { id: item.id, safetyClosed: false }));
}

export function receiveProcessInput(delivery: InstrumentationDelivery, actor: InstrumentationActor, item: InstrumentationDelivery["processInputs"][number]): InstrumentationResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  if (item.ownedBy !== "process" || item.icModified !== false) return deny(delivery, "Process intent remains owned by Process.");
  return ok(audit({ ...delivery, processInputs: [...delivery.processInputs, item] }, actor, "process_input_received", { id: item.id, icModified: false }));
}
export function modifyProcessInput(delivery: InstrumentationDelivery): InstrumentationResultEnvelope {
  return deny(delivery, "I&C cannot modify a Process control or safety intent.");
}

export function receiveMechanicalInput(delivery: InstrumentationDelivery, actor: InstrumentationActor, item: InstrumentationDelivery["mechanicalInputs"][number]): InstrumentationResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  if (item.ownedBy !== "mechanical" || item.icModified !== false) return deny(delivery, "A package signal list remains owned by Mechanical.");
  return ok(audit({ ...delivery, mechanicalInputs: [...delivery.mechanicalInputs, item] }, actor, "mechanical_input_received", { id: item.id, icModified: false }));
}
export function modifyMechanicalInput(delivery: InstrumentationDelivery): InstrumentationResultEnvelope {
  return deny(delivery, "I&C cannot modify a Mechanical package signal list.");
}

export function receivePipingInput(delivery: InstrumentationDelivery, actor: InstrumentationActor, item: InstrumentationDelivery["pipingInputs"][number]): InstrumentationResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  if (item.ownedBy !== "piping" || item.icModified !== false) return deny(delivery, "Piping line design remains owned by Piping.");
  return ok(audit({ ...delivery, pipingInputs: [...delivery.pipingInputs, item] }, actor, "piping_input_received", { id: item.id, icModified: false }));
}
export function modifyPipingInput(delivery: InstrumentationDelivery): InstrumentationResultEnvelope {
  return deny(delivery, "I&C cannot modify a Piping line design.");
}

export function receiveElectricalInput(delivery: InstrumentationDelivery, actor: InstrumentationActor, item: InstrumentationDelivery["electricalInputs"][number]): InstrumentationResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  if (item.ownedBy !== "electrical" || item.protectionModified !== false) return deny(delivery, "Electrical protection remains owned by Electrical.");
  return ok(audit({ ...delivery, electricalInputs: [...delivery.electricalInputs, item] }, actor, "electrical_input_received", { id: item.id, protectionModified: false }));
}
export function modifyElectricalProtection(delivery: InstrumentationDelivery): InstrumentationResultEnvelope {
  return deny(delivery, "I&C cannot modify an Electrical protection setting.");
}

export function addElectricalHandoff(delivery: InstrumentationDelivery, actor: InstrumentationActor, item: InstrumentationDelivery["electricalHandoffs"][number]): InstrumentationResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  if (item.protectionModified) return deny(delivery, "I&C cannot modify an Electrical protection setting.");
  const unitError = needUnit(item.load, item.unit, "I&C electrical load");
  if (unitError) return deny(delivery, unitError);
  return ok(audit({ ...delivery, electricalHandoffs: [...delivery.electricalHandoffs, { ...item, protectionModified: false }] }, actor, "electrical_handoff_recorded", { id: item.id, protectionModified: false }));
}

export function recordConflict(delivery: InstrumentationDelivery, actor: InstrumentationActor, conflict: { id: string; subjectId: string; statement: string }): InstrumentationResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  return ok(audit({ ...delivery, conflicts: [...delivery.conflicts, { ...conflict, processModified: false, mechanicalModified: false, electricalModified: false }] }, actor, "instrumentation_conflict_recorded", { id: conflict.id }));
}

export function registerInstrumentationTool(delivery: InstrumentationDelivery, actor: InstrumentationActor, input: { id: string; tool: string; version: string; certifyExecution?: boolean; bidirectional?: boolean }): InstrumentationResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  if (input.certifyExecution) return deny(delivery, "External I&C configuration is not certified by this delivery module.");
  if (input.bidirectional) return deny(delivery, "Bidirectional control-system synchronization is not implemented.");
  return ok(audit({ ...delivery, models: [...delivery.models, { id: input.id, tool: input.tool, version: input.version, bidirectional: false, executionCertified: false }] }, actor, "instrumentation_tool_registered", { id: input.id, executionCertified: false }));
}

function staleFrom(delivery: InstrumentationDelivery, id: string): Pick<InstrumentationDelivery, "instruments" | "signals" | "loops" | "datasheets" | "narratives" | "causeEffect" | "alarms" | "trips" | "sifs" | "verifications" | "packages" | "panels" | "junctionBoxes" | "cables" | "cableSchedules" | "logicDocuments" | "fat" | "sat" | "commissioning" | "electricalHandoffs" | "interfaces" | "deliverables"> {
  return {
    instruments: mark(delivery.instruments, id),
    signals: mark(delivery.signals, id),
    loops: mark(delivery.loops, id),
    datasheets: mark(delivery.datasheets, id),
    narratives: mark(delivery.narratives, id),
    causeEffect: mark(delivery.causeEffect, id),
    alarms: mark(delivery.alarms, id),
    trips: mark(delivery.trips, id),
    sifs: mark(delivery.sifs, id),
    verifications: mark(delivery.verifications, id),
    packages: mark(delivery.packages, id),
    panels: mark(delivery.panels, id),
    junctionBoxes: mark(delivery.junctionBoxes, id),
    cables: mark(delivery.cables, id),
    cableSchedules: mark(delivery.cableSchedules, id),
    logicDocuments: mark(delivery.logicDocuments, id),
    fat: mark(delivery.fat, id),
    sat: mark(delivery.sat, id),
    commissioning: mark(delivery.commissioning, id),
    electricalHandoffs: mark(delivery.electricalHandoffs, id),
    interfaces: mark(delivery.interfaces, id),
    deliverables: mark(delivery.deliverables, id),
  };
}

export function reviseProcessTrip(delivery: InstrumentationDelivery, actor: InstrumentationActor, id: string, statement: string): InstrumentationResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  const current = delivery.processInputs.find((item) => item.id === id && item.status === "current");
  if (!current) return deny(delivery, "The process trip requirement was not found.");
  const successor = { ...current, id: `${current.id}-r${current.revision + 1}`, statement, revision: current.revision + 1, icModified: false as const };
  const next: InstrumentationDelivery = {
    ...delivery,
    ...staleFrom(delivery, current.id),
    processInputs: delivery.processInputs.map((item) => item.id === current.id ? { ...item, status: "superseded" as const } : item).concat(successor),
  };
  return ok(audit(next, actor, "process_trip_revised", { id: successor.id, previous: current.id, icModified: false, recalculated: false, freshness: "potentially_stale" }));
}

export function revisePackageSignals(delivery: InstrumentationDelivery, actor: InstrumentationActor, id: string, signalList: string): InstrumentationResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  const current = delivery.mechanicalInputs.find((item) => item.id === id && item.status === "current");
  if (!current) return deny(delivery, "The package signal list was not found.");
  const successor = { ...current, id: `${current.id}-r${current.revision + 1}`, signalList, revision: current.revision + 1, icModified: false as const };
  const next: InstrumentationDelivery = {
    ...delivery,
    ...staleFrom(delivery, current.id),
    mechanicalInputs: delivery.mechanicalInputs.map((item) => item.id === current.id ? { ...item, status: "superseded" as const } : item).concat(successor),
  };
  return ok(audit(next, actor, "package_signals_revised", { id: successor.id, previous: current.id, icModified: false, recalculated: false, freshness: "potentially_stale" }));
}

export function reviewInstrumentation(delivery: InstrumentationDelivery, actor: InstrumentationActor, review: { id: string; subjectId: string; revision: number; outcome: "reviewed" | "approved" }): InstrumentationResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  if (review.outcome === "approved" && !roleMayApproveBasis(actor.actorRole, actor.canApprove)) return deny(delivery, "This role cannot approve instrumentation and control work.");
  return ok(audit({ ...delivery, reviews: [...delivery.reviews, { ...review, approvalGranted: review.outcome === "approved" }] }, actor, "instrumentation_review_recorded", { id: review.id, approvalGranted: review.outcome === "approved" }));
}

export function freezeInstrumentation(delivery: InstrumentationDelivery, actor: InstrumentationActor, baselineType: BaselineType, id: string): InstrumentationResultEnvelope {
  if (!sameWorkspace(delivery, actor)) return deny(delivery, "cross_workspace_denied");
  const lifecycleBaseline = createBaseline({ lifecycle: delivery.lifecycle, id, baselineType, actorId: actor.actorId, at: actor.at, unresolvedExceptions: delivery.assumptions.filter((item) => item.blocksNextStage).map((item) => item.id) });
  const basisSnapshot = captureBasisBaseline(delivery.basis, actor.actorId, actor.at);
  return ok(audit({
    ...delivery,
    lifecycle: lifecycleBaseline.lifecycle,
    baselines: [...delivery.baselines, {
      id, type: baselineType, frozen: true,
      instrumentIds: delivery.instruments.filter((item) => item.status === "current").map((item) => item.id),
      sifIds: delivery.sifs.map((item) => item.id),
    }],
  }, actor, "instrumentation_baseline_frozen", { id, baselineType, basisItems: basisSnapshot.basis.length }));
}

export function deliverableReadiness(delivery: InstrumentationDelivery, id: string): { ifc: boolean; gaps: string[] } {
  const deliverable = delivery.deliverables.find((item) => item.id === id);
  if (!deliverable) return { ifc: false, gaps: ["deliverable_missing"] };
  const gaps: string[] = [];
  if (!deliverable.basisLinked) gaps.push("missing_design_basis");
  if (!delivery.instruments.some((item) => item.status === "current")) gaps.push("incomplete_instrument_index");
  if (!delivery.signals.some((item) => item.status === "current")) gaps.push("incomplete_io_list");
  if (deliverable.freshness !== "current") gaps.push("stale_dependency");
  if (delivery.causeEffect.some((item) => item.approvalGranted === false)) gaps.push("unreviewed_cause_effect");
  if (delivery.sifs.some((item) => item.silTarget && !item.authorizedSourceId)) gaps.push("sif_without_authorized_source");
  if (delivery.interfaces.some((item) => item.status !== "accepted")) gaps.push("unresolved_interface");
  if (!delivery.cyberRequirements.length) gaps.push("unresolved_cybersecurity");
  if (!deliverable.reviewId) gaps.push("missing_review");
  if (delivery.lifecycle.stage !== "detailed_engineering") gaps.push("lifecycle_mismatch");
  const approved = delivery.reviews.some((item) => item.subjectId === deliverable.id && item.approvalGranted && item.revision === deliverable.revision);
  if (!approved) gaps.push("approval_not_granted");
  return { ifc: gaps.length === 0, gaps };
}

export function instrumentationAdvisory(delivery: InstrumentationDelivery): string {
  const stale = delivery.signals.filter((item) => item.freshness === "potentially_stale").length + delivery.narratives.filter((item) => item.freshness === "potentially_stale").length;
  return [
    "Advisory only.",
    `FACT: lifecycle stage is ${delivery.lifecycle.stage}.`,
    `RESULT: ${delivery.verifications.length} SIS verification reference(s) are recorded. No SIL performance was calculated by this statement.`,
    `SAFETY_REQUIREMENT: ${delivery.sifs.length} SIF record(s) are traced. A record is not an achieved SIL.`,
    `ASSUMPTION: ${delivery.assumptions.length} I&C assumption(s) are recorded.`,
    `INFERENCE: ${stale} signal or narrative reference(s) are potentially stale.`,
    "RECOMMENDATION: review stale process-trip and package-signal references before the next baseline.",
    "HUMAN_DECISION_REQUIRED: a human decides whether the instrument index, cause and effect, or SIF record must be revised.",
    "This statement does not determine a SIL target, approve cause and effect, or certify control-system safety.",
  ].join(" ");
}

export function instrumentationHome(delivery: InstrumentationDelivery) {
  return {
    stage: delivery.lifecycle.stage,
    maturity: delivery.lifecycle.maturity,
    basisCount: delivery.basis.basisItems.length,
    requirementCount: delivery.requirements.length,
    instrumentCount: delivery.instruments.filter((item) => item.status === "current").length,
    ioCount: delivery.signals.filter((item) => item.status === "current").length,
    loopCount: delivery.loops.length,
    narrativeCount: delivery.narratives.length,
    causeEffectCount: delivery.causeEffect.length,
    alarmCount: delivery.alarms.length,
    sifCount: delivery.sifs.length,
    packageCount: delivery.packages.length,
    panelCount: delivery.panels.length,
    junctionBoxCount: delivery.junctionBoxes.length,
    cableCount: delivery.cables.length,
    networkCount: delivery.networks.length,
    cyberCount: delivery.cyberRequirements.length,
    fatCount: delivery.fat.length,
    satCount: delivery.sat.length,
    staleCount: delivery.instruments.filter((item) => item.freshness === "potentially_stale").length + delivery.signals.filter((item) => item.freshness === "potentially_stale").length + delivery.deliverables.filter((item) => item.freshness === "potentially_stale").length,
    interfaceCount: delivery.interfaces.length,
    openChanges: delivery.conflicts.length,
    openAssumptions: delivery.assumptions.length,
    reviewCount: delivery.reviews.length,
    deliverableCount: delivery.deliverables.length,
    blockers: delivery.lifecycle.criteria.filter((item) => item.blocking && item.status === "unmet").map((item) => item.criterion),
    capabilities: IC_CAPABILITIES,
    advisory: instrumentationAdvisory(delivery),
    approvalGranted: false as const,
  };
}

export function unimplementedInstrumentationCalculations() {
  return IC_CAPABILITIES.filter((item) => item.state === "NOT_IMPLEMENTED");
}
