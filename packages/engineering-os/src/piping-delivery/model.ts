/**
 * EOS 2.6 piping design delivery.
 * Consumes process conditions and mechanical nozzle data.
 * This module does not evaluate piping stress, hydraulics, or code compliance.
 * Line numbers are delivery references. They do not create a second piping identity master.
 */

import type { EngineeringBasisGraph } from "../engineering-basis/model";
import type { ConfigurationBaseline, DeliveryLifecycle } from "../delivery-lifecycle/model";

export const PIPING_CAPABILITIES = [
  { id: "concept_workflow", stage: "concept", state: "IMPLEMENTED" },
  { id: "option_comparison", stage: "concept", state: "IMPLEMENTED" },
  { id: "feasibility_workflow", stage: "feasibility", state: "IMPLEMENTED" },
  { id: "line_list", stage: "feasibility", state: "IMPLEMENTED" },
  { id: "piping_class", stage: "feasibility", state: "IMPLEMENTED" },
  { id: "routing", stage: "feasibility", state: "IMPLEMENTED" },
  { id: "hydraulic_sizing", stage: "feasibility", state: "NOT_IMPLEMENTED" },
  { id: "pipe_size_calculation", stage: "feasibility", state: "NOT_IMPLEMENTED" },
  { id: "feed_workflow", stage: "feed", state: "IMPLEMENTED" },
  { id: "detailed_workflow", stage: "detailed_engineering", state: "IMPLEMENTED" },
  { id: "stress_critical_register", stage: "feed", state: "IMPLEMENTED" },
  { id: "stress_model_registry", stage: "detailed_engineering", state: "IMPLEMENTED" },
  { id: "stress_result_provenance", stage: "detailed_engineering", state: "IMPLEMENTED" },
  { id: "deterministic_stress_engine", stage: "detailed_engineering", state: "NOT_IMPLEMENTED" },
  { id: "support_records", stage: "detailed_engineering", state: "IMPLEMENTED" },
  { id: "structural_support_design", stage: "detailed_engineering", state: "NOT_IMPLEMENTED" },
  { id: "nozzle_interface", stage: "feed", state: "IMPLEMENTED" },
  { id: "nozzle_load_comparison", stage: "detailed_engineering", state: "IMPLEMENTED" },
  { id: "tie_in_register", stage: "feasibility", state: "IMPLEMENTED" },
  { id: "valve_records", stage: "feasibility", state: "IMPLEMENTED" },
  { id: "valve_sizing", stage: "detailed_engineering", state: "NOT_IMPLEMENTED" },
  { id: "special_items", stage: "feed", state: "IMPLEMENTED" },
  { id: "test_requirements", stage: "feed", state: "IMPLEMENTED" },
  { id: "test_pressure_calculation", stage: "detailed_engineering", state: "NOT_IMPLEMENTED" },
  { id: "mto", stage: "feasibility", state: "IMPLEMENTED" },
  { id: "caesar_ii", stage: "detailed_engineering", state: "EXTERNAL_TOOL_DEPENDENT" },
  { id: "autopipe", stage: "detailed_engineering", state: "EXTERNAL_TOOL_DEPENDENT" },
  { id: "aveva_e3d", stage: "detailed_engineering", state: "EXTERNAL_TOOL_DEPENDENT" },
  { id: "plant_3d", stage: "detailed_engineering", state: "EXTERNAL_TOOL_DEPENDENT" },
  { id: "bidirectional_model_sync", stage: "detailed_engineering", state: "NOT_IMPLEMENTED" },
  { id: "hosted_stress_execution", stage: "detailed_engineering", state: "NOT_IMPLEMENTED" },
] as const;

export type Freshness = "current" | "potentially_stale";

export type PipingDelivery = {
  id: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  projectTitle: string;
  lifecycle: DeliveryLifecycle;
  basis: EngineeringBasisGraph;
  options: Array<{ id: string; title: string; route: "pipe_rack" | "alternate"; stage: DeliveryLifecycle["stage"]; facts: string[]; assumptions: string[]; unresolved: string[] }>;
  systems: Array<{ id: string; name: string; equipmentTag: string }>;
  lines: Array<{ id: string; lineNumber: string; identityRef: string | null; service: string; streamRef: string | null; designPressure: string | null; designPressureUnit: string | null; designTemperature: string | null; designTemperatureUnit: string | null; lineSize: string | null; lineSizeUnit: string | null; lineSizeSource: "process" | "imported" | "metadata_only" | null; classId: string | null; stressCritical: boolean; humanConfirmed: boolean; revision: number; status: "current" | "superseded"; inputIds: string[]; freshness: Freshness }>;
  conditions: Array<{ id: string; name: string; value: string | null; unit: string | null; ownedBy: "process"; pipingModified: false; revision: number; status: "current" | "superseded"; synthetic: boolean }>;
  classes: Array<{ id: string; identifier: string; materialFamily: string; revision: number; status: "current" | "superseded"; approvalGranted: false; inputIds: string[]; freshness: Freshness }>;
  materials: Array<{ id: string; lineId: string; baseMaterial: string; corrosionAllowance: string | null; unit: string | null }>;
  routes: Array<{ id: string; lineId: string; revision: number; classification: "pipe_rack" | "grade" | "buried" | "alternate"; inputIds: string[]; freshness: Freshness }>;
  valves: Array<{ id: string; lineId: string; valveType: string; size: string | null; unit: string | null }>;
  specialItems: Array<{ id: string; lineId: string; itemType: string }>;
  tests: Array<{ id: string; lineId: string; testType: string; pressure: string | null; unit: string | null; calculatedHere: false }>;
  mtos: Array<{ id: string; lineId: string; quantity: string; unit: string; revision: number; inputIds: string[]; freshness: Freshness; procurementAccurate: false }>;
  supports: Array<{ id: string; lineId: string; supportType: string; reaction: string | null; unit: string | null; inputIds: string[]; freshness: Freshness; structuralDesign: false }>;
  restraints: Array<{ id: string; lineId: string; restraintType: string }>;
  nozzles: Array<{ id: string; equipmentTag: string; nozzleId: string; location: string | null; allowableLoad: string | null; allowableUnit: string | null; allowableSource: string | null; ownedBy: "mechanical"; pipingModified: false; revision: number; status: "current" | "superseded" }>;
  comparisons: Array<{ id: string; nozzleRecordId: string; allowableValue: string | null; allowableUnit: string | null; pipingLoadValue: string | null; pipingLoadUnit: string | null; state: "compared" | "not_compared"; acceptable: false; inputIds: string[]; freshness: Freshness }>;
  tieIns: Array<{ id: string; number: string; lineId: string; fieldVerified: boolean; evidenceId: string | null; status: "open" | "recorded" }>;
  stressModels: Array<{ id: string; lineId: string; solver: string; revision: number; executionCertified: false; inputIds: string[]; freshness: Freshness; provenance: "metadata" | "SYNTHETIC_VALIDATION_FIXTURE" | "imported_reference" }>;
  stressCases: Array<{ id: string; modelId: string; caseName: string }>;
  stressResults: Array<{ id: string; modelId: string; value: string | null; unit: string | null; provenance: "SYNTHETIC_VALIDATION_FIXTURE" | "imported_reference"; engine: "not_calculated" | "imported_reference"; codeComplianceClaimed: false; executionCertified: false; inputIds: string[]; freshness: Freshness }>;
  models: Array<{ id: string; tool: string; revision: number; bidirectional: false; executionCertified: false }>;
  interfaces: Array<{ id: string; consumer: "structural" | "mechanical" | "process" | "civil"; parameter: string; status: "proposed" | "accepted"; inputIds: string[]; freshness: Freshness }>;
  risks: Array<{ id: string; statement: string; stage: DeliveryLifecycle["stage"] }>;
  decisions: Array<{ id: string; statement: string; stage: DeliveryLifecycle["stage"] }>;
  assumptions: Array<{ id: string; statement: string; stage: DeliveryLifecycle["stage"]; blocksNextStage: boolean }>;
  requirements: Array<{ id: string; title: string; sourceId: string | null; stage: DeliveryLifecycle["stage"] }>;
  conflicts: Array<{ id: string; subjectId: string; statement: string; processModified: false; mechanicalModified: false }>;
  reviews: Array<{ id: string; subjectId: string; revision: number; outcome: string; approvalGranted: boolean }>;
  deliverables: Array<{ id: string; title: string; stage: DeliveryLifecycle["stage"]; revision: number; basisLinked: boolean; requirementLinked: boolean; reviewId: string | null; inputIds: string[]; freshness: Freshness; ifc: false }>;
  baselines: Array<{ id: string; type: ConfigurationBaseline["baselineType"]; frozen: true; conditionIds: string[]; nozzleIds: string[] }>;
  audits: Array<{ action: string; at: string; actorId: string; detail: Record<string, string | number | boolean | null> }>;
};
