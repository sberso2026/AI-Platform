/**
 * EOS 2.9 electrical design delivery.
 * Governs load lists, power-system study records, cables, and interfaces.
 * This module does not evaluate load flow, fault level, cable size, or protection formulas.
 * Equipment rows are delivery references. They do not create a second equipment master.
 */

import type { EngineeringBasisGraph } from "../engineering-basis/model";
import type { ConfigurationBaseline, DeliveryLifecycle } from "../delivery-lifecycle/model";

export const ELECTRICAL_CAPABILITIES = [
  { id: "concept_workflow", stage: "concept", state: "IMPLEMENTED" },
  { id: "option_comparison", stage: "concept", state: "IMPLEMENTED" },
  { id: "load_list", stage: "feasibility", state: "IMPLEMENTED" },
  { id: "voltage_levels", stage: "feasibility", state: "IMPLEMENTED" },
  { id: "sources", stage: "feasibility", state: "IMPLEMENTED" },
  { id: "transformers", stage: "feasibility", state: "IMPLEMENTED" },
  { id: "switchgear", stage: "feasibility", state: "IMPLEMENTED" },
  { id: "sld_governance", stage: "feed", state: "IMPLEMENTED" },
  { id: "cable_records", stage: "feed", state: "IMPLEMENTED" },
  { id: "protection_records", stage: "feed", state: "IMPLEMENTED" },
  { id: "earthing_records", stage: "feed", state: "IMPLEMENTED" },
  { id: "ic_interface_contract", stage: "feed", state: "IMPLEMENTED" },
  { id: "load_flow_calculation", stage: "detailed_engineering", state: "NOT_IMPLEMENTED" },
  { id: "short_circuit_calculation", stage: "detailed_engineering", state: "NOT_IMPLEMENTED" },
  { id: "protection_setting_calculation", stage: "detailed_engineering", state: "NOT_IMPLEMENTED" },
  { id: "motor_starting_calculation", stage: "detailed_engineering", state: "NOT_IMPLEMENTED" },
  { id: "voltage_drop_calculation", stage: "detailed_engineering", state: "NOT_IMPLEMENTED" },
  { id: "cable_sizing_calculation", stage: "detailed_engineering", state: "NOT_IMPLEMENTED" },
  { id: "arc_flash_calculation", stage: "detailed_engineering", state: "NOT_IMPLEMENTED" },
  { id: "earthing_calculation", stage: "detailed_engineering", state: "NOT_IMPLEMENTED" },
  { id: "harmonic_calculation", stage: "detailed_engineering", state: "NOT_IMPLEMENTED" },
  { id: "battery_autonomy_calculation", stage: "detailed_engineering", state: "NOT_IMPLEMENTED" },
  { id: "hosted_electrical_calculation", stage: "detailed_engineering", state: "NOT_IMPLEMENTED" },
  { id: "etap", stage: "detailed_engineering", state: "EXTERNAL_TOOL_DEPENDENT" },
  { id: "powerfactory", stage: "detailed_engineering", state: "EXTERNAL_TOOL_DEPENDENT" },
  { id: "skm", stage: "detailed_engineering", state: "EXTERNAL_TOOL_DEPENDENT" },
  { id: "easypower", stage: "detailed_engineering", state: "EXTERNAL_TOOL_DEPENDENT" },
  { id: "vendor_transformer_data", stage: "detailed_engineering", state: "VENDOR_DEPENDENT" },
] as const;

export const ETAP_ADAPTER_STATUS = "METADATA_OR_IMPORT_ONLY_NOT_CERTIFIED" as const;
export const POWERFACTORY_ADAPTER_STATUS = "METADATA_OR_IMPORT_ONLY_NOT_CERTIFIED" as const;
export const SKM_ADAPTER_STATUS = "METADATA_OR_IMPORT_ONLY_NOT_CERTIFIED" as const;
export const EASYPOWER_ADAPTER_STATUS = "METADATA_OR_IMPORT_ONLY_NOT_CERTIFIED" as const;
export const EXTERNAL_ELECTRICAL_ANALYSIS_CERTIFIED = false as const;

export type Freshness = "current" | "potentially_stale";
export type StudyProvenance = "SYNTHETIC_VALIDATION_FIXTURE" | "imported_reference" | "metadata" | "vendor";
export type LoadCategory = "continuous" | "intermittent" | "standby" | "emergency" | "essential" | "ups" | "dc" | "heater" | "motor" | "package" | "lighting" | "miscellaneous";

type Stale = { inputIds: string[]; freshness: Freshness };

export type ElectricalDelivery = {
  id: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  projectTitle: string;
  lifecycle: DeliveryLifecycle;
  basis: EngineeringBasisGraph;
  options: Array<{ id: string; title: string; concept: "radial" | "dual"; stage: DeliveryLifecycle["stage"]; facts: string[]; assumptions: string[]; unresolved: string[] }>;
  systems: Array<{ id: string; name: string; equipmentMasterCreated: false }>;
  consumers: Array<{ id: string; tag: string; kind: "motor" | "package" | "lighting" | "ups" | "emergency" }>;
  loads: Array<{ id: string; tag: string; description: string; category: LoadCategory; ratedPower: string; unit: string; sourceDiscipline: string; revision: number; status: "current" | "superseded" } & Stale>;
  operatingCases: Array<{ id: string; name: string; stage: DeliveryLifecycle["stage"] }>;
  powerBalances: Array<{ id: string; demand: string | null; unit: string | null; provenance: StudyProvenance; calculatedHere: false } & Stale>;
  voltageLevels: Array<{ id: string; nominal: string; unit: string; frequency: string; frequencyUnit: string }>;
  sources: Array<{ id: string; kind: string; capacity: string | null; unit: string | null; adequacyClaimed: false }>;
  generators: Array<{ id: string; capacity: string | null; unit: string | null; adequacyClaimed: false }>;
  transformers: Array<{ id: string; rating: string | null; unit: string | null; impedance: string | null; adequacyClaimed: false } & Stale>;
  switchgear: Array<{ id: string; name: string; faultRating: string | null; unit: string | null; certified: false } & Stale>;
  mccs: Array<{ id: string; name: string; certified: false } & Stale>;
  ups: Array<{ id: string; autonomy: string | null; unit: string | null; calculatedHere: false }>;
  batteries: Array<{ id: string; capacity: string | null; unit: string | null; calculatedHere: false }>;
  dcSystems: Array<{ id: string; nominal: string | null; unit: string | null }>;
  emergencyPower: Array<{ id: string; source: string; calculatedHere: false }>;
  slds: Array<{ id: string; revision: number; status: "current" | "superseded" } & Stale>;
  models: Array<{ id: string; tool: string; version: string; revision: number; loadListRevision: number; inputChecksum: string; bidirectional: false; executionCertified: false }>;
  studies: Array<{ id: string; kind: "load_flow" | "short_circuit" | "coordination" | "motor_starting" | "voltage_drop" | "harmonic" | "arc_flash" | "cable_sizing" | "lighting" | "lightning"; value: string | null; unit: string | null; provenance: StudyProvenance; calculatedHere: false } & Stale>;
  cables: Array<{ id: string; size: string | null; unit: string | null; provenance: StudyProvenance } & Stale>;
  cableSchedules: Array<{ id: string; cableId: string; revision: number } & Stale>;
  protection: Array<{ id: string; device: string; setting: string | null; unit: string | null; approvalGranted: false } & Stale>;
  earthing: Array<{ id: string; resistivitySource: string | null; resistance: string | null; unit: string | null; calculatedHere: false; inferredFromGeotechnics: false } & Stale>;
  hazardousAreas: Array<{ id: string; classification: string; sourceDiscipline: string; createdByElectrical: false }>;
  processInputs: Array<{ id: string; scenario: string; ownedBy: "process"; electricalModified: false }>;
  mechanicalInputs: Array<{ id: string; tag: string; ratedPower: string; unit: string; duty: string; ownedBy: "mechanical"; electricalModified: false; revision: number; status: "current" | "superseded" }>;
  civilRoutes: Array<{ id: string; length: string; unit: string; ownedBy: "civil"; electricalModified: false; revision: number; status: "current" | "superseded" }>;
  civilHandoffs: Array<{ id: string; requirement: string; value: string | null; unit: string | null; civilModified: false } & Stale>;
  rooms: Array<{ id: string; name: string; purpose: string }>;
  structuralHandoffs: Array<{ id: string; equipment: string; mass: string | null; unit: string | null; structuralCapacityClaimed: false } & Stale>;
  icInterfaces: Array<{ id: string; topic: string; fullDesignImplemented: false }>;
  interfaces: Array<{ id: string; consumer: string; parameter: string; status: "proposed" | "accepted" } & Stale>;
  risks: Array<{ id: string; statement: string; stage: DeliveryLifecycle["stage"] }>;
  decisions: Array<{ id: string; statement: string; stage: DeliveryLifecycle["stage"] }>;
  assumptions: Array<{ id: string; statement: string; stage: DeliveryLifecycle["stage"]; blocksNextStage: boolean }>;
  requirements: Array<{ id: string; title: string; sourceId: string | null; stage: DeliveryLifecycle["stage"] }>;
  conflicts: Array<{ id: string; subjectId: string; statement: string; mechanicalModified: false; processModified: false; civilModified: false }>;
  reviews: Array<{ id: string; subjectId: string; revision: number; outcome: string; approvalGranted: boolean }>;
  deliverables: Array<{ id: string; title: string; stage: DeliveryLifecycle["stage"]; revision: number; basisLinked: boolean; requirementLinked: boolean; reviewId: string | null } & Stale & { ifc: false }>;
  baselines: Array<{ id: string; type: ConfigurationBaseline["baselineType"]; frozen: true; loadIds: string[]; modelIds: string[] }>;
  audits: Array<{ action: string; at: string; actorId: string; detail: Record<string, string | number | boolean | null> }>;
};
