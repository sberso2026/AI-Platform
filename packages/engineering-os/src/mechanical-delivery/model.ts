/**
 * EOS 2.5 mechanical design delivery.
 * Consumes process duties and governs mechanical records.
 * This module does not evaluate mechanical formulas or certify vendor data as EOS qualification.
 */

import type { EngineeringBasisGraph } from "../engineering-basis/model";
import type { ConfigurationBaseline, DeliveryLifecycle } from "../delivery-lifecycle/model";

export const MECHANICAL_CAPABILITIES = [
  { id: "concept_workflow", stage: "concept", state: "IMPLEMENTED" },
  { id: "option_comparison", stage: "concept", state: "IMPLEMENTED" },
  { id: "feasibility_workflow", stage: "feasibility", state: "IMPLEMENTED" },
  { id: "equipment_register", stage: "feasibility", state: "IMPLEMENTED" },
  { id: "datasheets", stage: "feasibility", state: "IMPLEMENTED" },
  { id: "material_selection_record", stage: "feasibility", state: "IMPLEMENTED" },
  { id: "material_science_calculation", stage: "feasibility", state: "NOT_IMPLEMENTED" },
  { id: "feed_workflow", stage: "feed", state: "IMPLEMENTED" },
  { id: "detailed_workflow", stage: "detailed_engineering", state: "IMPLEMENTED" },
  { id: "rotating_equipment_workflow", stage: "detailed_engineering", state: "IMPLEMENTED" },
  { id: "static_equipment_workflow", stage: "detailed_engineering", state: "IMPLEMENTED" },
  { id: "heat_exchanger_mechanical_record", stage: "detailed_engineering", state: "IMPLEMENTED" },
  { id: "package_equipment_workflow", stage: "detailed_engineering", state: "IMPLEMENTED" },
  { id: "pump_performance_calculation", stage: "detailed_engineering", state: "NOT_IMPLEMENTED" },
  { id: "pressure_vessel_calculation", stage: "detailed_engineering", state: "NOT_IMPLEMENTED" },
  { id: "nozzle_allowable_calculation", stage: "detailed_engineering", state: "NOT_IMPLEMENTED" },
  { id: "fatigue_calculation", stage: "detailed_engineering", state: "NOT_IMPLEMENTED" },
  { id: "rotordynamics", stage: "detailed_engineering", state: "NOT_IMPLEMENTED" },
  { id: "vendor_data_governance", stage: "detailed_engineering", state: "VENDOR_DEPENDENT" },
  { id: "external_mechanical_tool", stage: "detailed_engineering", state: "EXTERNAL_TOOL_DEPENDENT" },
  { id: "hosted_mechanical_calculation", stage: "detailed_engineering", state: "NOT_IMPLEMENTED" },
] as const;

export const MASS_STATES = ["empty", "operating", "test", "flooded", "shipping", "erection", "maintenance"] as const;
export const VENDOR_REVIEW_STATES = ["received", "under_review", "accepted_with_comments", "accepted", "rejected", "superseded"] as const;

export type MechanicalOption = {
  id: string;
  title: string;
  arrangement: "one_hundred_percent" | "duty_standby" | "other";
  stage: DeliveryLifecycle["stage"];
  facts: string[];
  assumptions: string[];
  unresolved: string[];
};

export type MechanicalDelivery = {
  id: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  projectTitle: string;
  lifecycle: DeliveryLifecycle;
  basis: EngineeringBasisGraph;
  options: MechanicalOption[];
  equipment: Array<{ id: string; tag: string; kind: "rotating" | "static" | "package"; family: "pump" | "separator" | "heat_exchanger" | "package" | "other"; service: string; processDutyId: string | null; stage: DeliveryLifecycle["stage"]; status: "current" | "superseded" }>;
  duties: Array<{ id: string; equipmentId: string; name: string; value: string | null; unit: string | null; ownedBy: "process"; mechanicalModified: false; revision: number; status: "current" | "superseded"; synthetic: boolean }>;
  conditions: Array<{ id: string; equipmentId: string; name: string; value: string | null; unit: string | null }>;
  materials: Array<{ id: string; equipmentId: string; baseMaterial: string; corrosionAllowance: string | null; unit: string | null }>;
  datasheets: Array<{ id: string; equipmentId: string; revision: number; dutyId: string | null; inputIds: string[]; freshness: "current" | "potentially_stale"; status: "current" | "superseded" }>;
  masses: Array<{ id: string; equipmentId: string; state: (typeof MASS_STATES)[number]; value: string; unit: string; inputIds: string[]; freshness: "current" | "potentially_stale" }>;
  nozzles: Array<{ id: string; equipmentId: string; nozzleId: string; allowableLoad: string | null; inputIds: string[]; freshness: "current" | "potentially_stale" }>;
  maintenance: Array<{ id: string; equipmentId: string; task: string; interval: string | null }>;
  lifting: Array<{ id: string; equipmentId: string; massId: string | null; engineered: false; freshness: "current" | "potentially_stale" }>;
  reliability: Array<{ id: string; equipmentId: string; criticality: string; redundancy: string }>;
  interfaces: Array<{ id: string; consumer: "piping" | "structural" | "electrical" | "instrumentation_and_control" | "process"; parameter: string; status: "proposed" | "accepted"; inputIds: string[]; freshness: "current" | "potentially_stale" }>;
  packages: Array<{ id: string; name: string; included: string[]; excluded: string[] }>;
  vendorData: Array<{ id: string; equipmentId: string; revision: number; status: (typeof VENDOR_REVIEW_STATES)[number]; checksum: string; supersedesId: string | null; packageApproved: false }>;
  models: Array<{ id: string; tool: string; revision: number; executionCertified: false }>;
  calculations: Array<{ id: string; equipmentId: string; purpose: string; engine: "not_calculated" | "imported_reference"; inputIds: string[]; freshness: "current" | "potentially_stale" }>;
  risks: Array<{ id: string; statement: string; stage: DeliveryLifecycle["stage"] }>;
  decisions: Array<{ id: string; statement: string; stage: DeliveryLifecycle["stage"] }>;
  assumptions: Array<{ id: string; statement: string; stage: DeliveryLifecycle["stage"]; blocksNextStage: boolean }>;
  requirements: Array<{ id: string; title: string; sourceId: string | null; stage: DeliveryLifecycle["stage"] }>;
  conflicts: Array<{ id: string; dutyId: string; statement: string; processModified: false }>;
  reviews: Array<{ id: string; subjectId: string; revision: number; outcome: string; approvalGranted: boolean }>;
  deliverables: Array<{ id: string; title: string; stage: DeliveryLifecycle["stage"]; revision: number; basisLinked: boolean; requirementLinked: boolean; reviewId: string | null; inputIds: string[]; freshness: "current" | "potentially_stale"; ifc: false }>;
  baselines: Array<{ id: string; type: ConfigurationBaseline["baselineType"]; frozen: true; dutyIds: string[] }>;
  audits: Array<{ action: string; at: string; actorId: string; detail: Record<string, string | number | boolean | null> }>;
};
