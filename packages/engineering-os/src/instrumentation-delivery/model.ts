/**
 * EOS 2.10 instrumentation and control design delivery.
 * Governs instrument indexes, I/O, control records, and SIF traceability.
 * This module does not determine SIL targets or evaluate SIS performance.
 * Instrument rows are delivery references. They do not create a second instrument master.
 */

import type { EngineeringBasisGraph } from "../engineering-basis/model";
import type { ConfigurationBaseline, DeliveryLifecycle } from "../delivery-lifecycle/model";

export const IC_CAPABILITIES = [
  { id: "concept_workflow", stage: "concept", state: "IMPLEMENTED" },
  { id: "option_comparison", stage: "concept", state: "IMPLEMENTED" },
  { id: "instrument_index", stage: "feasibility", state: "IMPLEMENTED" },
  { id: "io_list", stage: "feasibility", state: "IMPLEMENTED" },
  { id: "control_loops", stage: "feasibility", state: "IMPLEMENTED" },
  { id: "narratives", stage: "feed", state: "IMPLEMENTED" },
  { id: "cause_effect", stage: "feed", state: "IMPLEMENTED" },
  { id: "alarms", stage: "feed", state: "IMPLEMENTED" },
  { id: "sif_governance", stage: "feed", state: "IMPLEMENTED" },
  { id: "package_interface", stage: "feed", state: "IMPLEMENTED" },
  { id: "network_records", stage: "feed", state: "IMPLEMENTED" },
  { id: "cyber_requirements", stage: "feed", state: "IMPLEMENTED" },
  { id: "sil_target", stage: "feed", state: "PROCESS_SAFETY_DEPENDENT" },
  { id: "sil_verification_calculation", stage: "detailed_engineering", state: "NOT_IMPLEMENTED" },
  { id: "instrument_sizing", stage: "detailed_engineering", state: "NOT_IMPLEMENTED" },
  { id: "control_tuning", stage: "detailed_engineering", state: "NOT_IMPLEMENTED" },
  { id: "detector_coverage", stage: "detailed_engineering", state: "NOT_IMPLEMENTED" },
  { id: "logic_generation", stage: "detailed_engineering", state: "NOT_IMPLEMENTED" },
  { id: "hosted_ic_calculation", stage: "detailed_engineering", state: "NOT_IMPLEMENTED" },
  { id: "instrument_database", stage: "detailed_engineering", state: "EXTERNAL_TOOL_DEPENDENT" },
  { id: "control_platform", stage: "detailed_engineering", state: "EXTERNAL_TOOL_DEPENDENT" },
  { id: "package_signal_list", stage: "feed", state: "VENDOR_DEPENDENT" },
] as const;

export const DETERMINISTIC_SIL_VERIFICATION_ENGINE_READY = false as const;
export const EXTERNAL_IC_CONFIGURATION_CERTIFIED = false as const;

export type Freshness = "current" | "potentially_stale";
export type Provenance = "SYNTHETIC_VALIDATION_FIXTURE" | "imported_reference" | "metadata" | "vendor" | "authorized_safety_study";
type Stale = { inputIds: string[]; freshness: Freshness };

export type InstrumentationDelivery = {
  id: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  projectTitle: string;
  lifecycle: DeliveryLifecycle;
  basis: EngineeringBasisGraph;
  options: Array<{ id: string; title: string; concept: "dcs_hardwired" | "package_plc"; stage: DeliveryLifecycle["stage"]; facts: string[]; assumptions: string[]; unresolved: string[] }>;
  systems: Array<{ id: string; name: string; allocation: "bpcs" | "sis"; equipmentMasterCreated: false }>;
  instruments: Array<{ id: string; tag: string; instrumentFunction: string; range: string | null; unit: string | null; revision: number; status: "current" | "superseded"; provenance: Provenance } & Stale>;
  signals: Array<{ id: string; source: string; destination: string; allocation: "bpcs" | "sis"; signalType: string; revision: number; status: "current" | "superseded" } & Stale>;
  loops: Array<{ id: string; tag: string; objective: string; tuningGenerated: false } & Stale>;
  datasheets: Array<{ id: string; tag: string; range: string | null; unit: string | null; vendorInvented: false } & Stale>;
  narratives: Array<{ id: string; title: string; status: "proposed" | "accepted"; aiGenerated: boolean } & Stale>;
  causeEffect: Array<{ id: string; cause: string; effect: string; approvalGranted: false } & Stale>;
  alarms: Array<{ id: string; tag: string; setpoint: string | null; unit: string | null; approvalGranted: false } & Stale>;
  rationalizations: Array<{ id: string; alarmId: string; outcome: string; approvalGranted: false }>;
  trips: Array<{ id: string; statement: string; setpoint: string | null; unit: string | null; sourceId: string | null; ownedBy: "process"; icModified: false; revision: number; status: "current" | "superseded" } & Stale>;
  sifs: Array<{ id: string; silTarget: string | null; authorizedSourceId: string | null; allocatedToBpcs: false; verifiedHere: false } & Stale>;
  verifications: Array<{ id: string; sifId: string; result: string | null; unit: string | null; provenance: Provenance; calculatedHere: false; certified: false } & Stale>;
  fireGas: Array<{ id: string; tag: string; coverageModeled: false }>;
  packages: Array<{ id: string; tag: string; signalsInvented: false; revision: number; status: "current" | "superseded" } & Stale>;
  valves: Array<{ id: string; tag: string; cvInvented: false }>;
  finalElements: Array<{ id: string; tag: string; failAction: string }>;
  panels: Array<{ id: string; name: string } & Stale>;
  cabinets: Array<{ id: string; name: string; systemAllocation: "bpcs" | "sis" }>;
  junctionBoxes: Array<{ id: string; name: string } & Stale>;
  marshalling: Array<{ id: string; cabinetId: string; signalId: string }>;
  cables: Array<{ id: string; kind: "signal"; size: string | null; unit: string | null } & Stale>;
  cableSchedules: Array<{ id: string; cableId: string } & Stale>;
  networks: Array<{ id: string; name: string; protocol: string; secretStored: false }>;
  communications: Array<{ id: string; protocol: string; interoperabilityClaimed: false }>;
  cyberRequirements: Array<{ id: string; statement: string; accessOpened: false; firewallChanged: false }>;
  logicDocuments: Array<{ id: string; title: string; generatedHere: false } & Stale>;
  fat: Array<{ id: string; result: string | null; evidenceId: string | null; passedClaimed: false } & Stale>;
  sat: Array<{ id: string; result: string | null; evidenceId: string | null } & Stale>;
  commissioning: Array<{ id: string; test: string; safetyClosed: false } & Stale>;
  processInputs: Array<{ id: string; statement: string; ownedBy: "process"; icModified: false; revision: number; status: "current" | "superseded" }>;
  mechanicalInputs: Array<{ id: string; tag: string; signalList: string; ownedBy: "mechanical"; icModified: false; revision: number; status: "current" | "superseded" }>;
  pipingInputs: Array<{ id: string; line: string; ownedBy: "piping"; icModified: false }>;
  electricalInputs: Array<{ id: string; supply: string; ownedBy: "electrical"; protectionModified: false }>;
  electricalHandoffs: Array<{ id: string; load: string | null; unit: string | null; protectionModified: false } & Stale>;
  structuralInterfaces: Array<{ id: string; requirement: string; structuralCapacityClaimed: false }>;
  civilInterfaces: Array<{ id: string; requirement: string; civilModified: false }>;
  interfaces: Array<{ id: string; consumer: string; parameter: string; status: "proposed" | "accepted" } & Stale>;
  risks: Array<{ id: string; statement: string; stage: DeliveryLifecycle["stage"] }>;
  decisions: Array<{ id: string; statement: string; stage: DeliveryLifecycle["stage"] }>;
  assumptions: Array<{ id: string; statement: string; stage: DeliveryLifecycle["stage"]; blocksNextStage: boolean }>;
  requirements: Array<{ id: string; title: string; sourceId: string | null; stage: DeliveryLifecycle["stage"] }>;
  conflicts: Array<{ id: string; subjectId: string; statement: string; processModified: false; mechanicalModified: false; electricalModified: false }>;
  reviews: Array<{ id: string; subjectId: string; revision: number; outcome: string; approvalGranted: boolean }>;
  deliverables: Array<{ id: string; title: string; stage: DeliveryLifecycle["stage"]; revision: number; basisLinked: boolean; requirementLinked: boolean; reviewId: string | null } & Stale & { ifc: false }>;
  baselines: Array<{ id: string; type: ConfigurationBaseline["baselineType"]; frozen: true; instrumentIds: string[]; sifIds: string[] }>;
  models: Array<{ id: string; tool: string; version: string; bidirectional: false; executionCertified: false }>;
  audits: Array<{ action: string; at: string; actorId: string; detail: Record<string, string | number | boolean | null> }>;
};
