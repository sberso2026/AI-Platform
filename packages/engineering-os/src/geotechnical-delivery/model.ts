/**
 * EOS 2.8 geotechnical design delivery.
 * Governs investigation evidence, ground models, and parameters.
 * This module does not evaluate bearing, settlement, slope, or liquefaction formulas.
 * Site rows reference Civil where supplied. They do not create a second site master.
 */

import type { EngineeringBasisGraph } from "../engineering-basis/model";
import type { ConfigurationBaseline, DeliveryLifecycle } from "../delivery-lifecycle/model";

export const GEOTECHNICAL_CAPABILITIES = [
  { id: "concept_workflow", stage: "concept", state: "IMPLEMENTED" },
  { id: "option_comparison", stage: "concept", state: "IMPLEMENTED" },
  { id: "investigation", stage: "feasibility", state: "IMPLEMENTED" },
  { id: "ground_model", stage: "feasibility", state: "IMPLEMENTED" },
  { id: "parameter_governance", stage: "feasibility", state: "IMPLEMENTED" },
  { id: "bearing_calculation", stage: "detailed_engineering", state: "NOT_IMPLEMENTED" },
  { id: "settlement_calculation", stage: "detailed_engineering", state: "NOT_IMPLEMENTED" },
  { id: "pile_capacity_calculation", stage: "detailed_engineering", state: "NOT_IMPLEMENTED" },
  { id: "slope_factor_of_safety", stage: "detailed_engineering", state: "NOT_IMPLEMENTED" },
  { id: "liquefaction_calculation", stage: "detailed_engineering", state: "NOT_IMPLEMENTED" },
  { id: "dewatering_rate", stage: "detailed_engineering", state: "NOT_IMPLEMENTED" },
  { id: "plaxis", stage: "detailed_engineering", state: "EXTERNAL_TOOL_DEPENDENT" },
  { id: "geostudio", stage: "detailed_engineering", state: "EXTERNAL_TOOL_DEPENDENT" },
  { id: "hosted_geotechnical_calculation", stage: "detailed_engineering", state: "NOT_IMPLEMENTED" },
] as const;

export const PARAMETER_CLASSES = ["MEASURED", "DERIVED", "INTERPRETED", "CHARACTERISTIC", "DESIGN", "ASSUMED"] as const;
export type ParameterClass = (typeof PARAMETER_CLASSES)[number];
export type Freshness = "current" | "potentially_stale";

export type GeotechnicalDelivery = {
  id: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  projectTitle: string;
  lifecycle: DeliveryLifecycle;
  basis: EngineeringBasisGraph;
  options: Array<{ id: string; title: string; concept: "shallow" | "piled"; stage: DeliveryLifecycle["stage"]; facts: string[]; assumptions: string[]; unresolved: string[] }>;
  sites: Array<{ id: string; name: string; civilSiteRef: string | null }>;
  investigations: Array<{ id: string; purpose: string; coordinateSystem: string; verticalDatum: string; revision: number; status: "current" | "superseded" }>;
  boreholes: Array<{ id: string; name: string; depth: string | null; unit: string | null; provenance: "SYNTHETIC_VALIDATION_FIXTURE" | "measured" }>;
  cpts: Array<{ id: string; name: string; rawSeparated: true; provenance: "SYNTHETIC_VALIDATION_FIXTURE" | "measured" }>;
  testPits: Array<{ id: string; name: string; depth: string | null; unit: string | null }>;
  fieldTests: Array<{ id: string; testType: string; value: string | null; unit: string | null; provenance: "measured" | "SYNTHETIC_VALIDATION_FIXTURE" }>;
  labTests: Array<{ id: string; testType: string; sampleId: string; value: string | null; unit: string | null; provenance: "measured" | "SYNTHETIC_VALIDATION_FIXTURE" }>;
  groundwaterObservations: Array<{ id: string; level: string; unit: string; datum: string; designLevel: false }>;
  designGroundwater: Array<{ id: string; level: string; unit: string; inferredFromSingleObservation: false; revision: number; status: "current" | "superseded" }>;
  layers: Array<{ id: string; name: string; kind: "fill" | "sand" | "dense_sand" | "weathered_rock" | "other" }>;
  units: Array<{ id: string; name: string; geologicalEquivalent: false }>;
  groundModels: Array<{ id: string; revision: number; boundary: string; status: "current" | "superseded"; evidenceIds: string[]; freshness: Freshness }>;
  parameters: Array<{ id: string; name: string; value: string; unit: string; classification: ParameterClass; evidenceId: string | null; justification: string | null; groundModelId: string | null; revision: number; status: "current" | "superseded"; inputIds: string[]; freshness: Freshness }>;
  foundations: Array<{ id: string; foundationType: string; parameterId: string | null; structuralCapacityClaimed: false; inputIds: string[]; freshness: Freshness }>;
  bearing: Array<{ id: string; value: string | null; unit: string | null; provenance: "SYNTHETIC_VALIDATION_FIXTURE" | "imported_reference" | "metadata"; calculatedHere: false; inputIds: string[]; freshness: Freshness }>;
  settlement: Array<{ id: string; value: string | null; unit: string | null; provenance: "SYNTHETIC_VALIDATION_FIXTURE" | "imported_reference" | "metadata"; calculatedHere: false; inputIds: string[]; freshness: Freshness }>;
  pileParameters: Array<{ id: string; name: string; value: string | null; unit: string | null; inputIds: string[]; freshness: Freshness }>;
  pileAssessments: Array<{ id: string; kind: string; provenance: "SYNTHETIC_VALIDATION_FIXTURE" | "imported_reference" | "metadata"; calculatedHere: false; inputIds: string[]; freshness: Freshness }>;
  liquefaction: Array<{ id: string; result: string | null; adequate: false; provenance: "metadata" | "SYNTHETIC_VALIDATION_FIXTURE" }>;
  slopes: Array<{ id: string; factorOfSafety: string | null; calculatedHere: false; inputIds: string[]; freshness: Freshness }>;
  excavations: Array<{ id: string; depth: string | null; unit: string | null; certifiedStable: false; inputIds: string[]; freshness: Freshness }>;
  retaining: Array<{ id: string; parameter: string; structuralDesignClaimed: false }>;
  improvements: Array<{ id: string; technique: string; suitable: false }>;
  dewatering: Array<{ id: string; targetLevel: string | null; unit: string | null; rateCalculated: false; inputIds: string[]; freshness: Freshness }>;
  earthworks: Array<{ id: string; classification: string; reuse: string; inputIds: string[]; freshness: Freshness }>;
  civilInputs: Array<{ id: string; parameter: string; ownedBy: "civil"; geotechModified: false; revision: number; status: "current" | "superseded" }>;
  structuralLoads: Array<{ id: string; name: string; value: string; unit: string; ownedBy: "structural"; geotechModified: false; revision: number; status: "current" | "superseded" }>;
  handoffs: Array<{ id: string; consumer: "civil" | "structural"; parameter: string; value: string | null; unit: string | null; inputIds: string[]; freshness: Freshness; structuralCapacityClaimed: false }>;
  models: Array<{ id: string; tool: string; revision: number; bidirectional: false; executionCertified: false }>;
  interfaces: Array<{ id: string; consumer: "civil" | "structural"; parameter: string; status: "proposed" | "accepted"; inputIds: string[]; freshness: Freshness }>;
  risks: Array<{ id: string; statement: string; stage: DeliveryLifecycle["stage"] }>;
  decisions: Array<{ id: string; statement: string; stage: DeliveryLifecycle["stage"] }>;
  assumptions: Array<{ id: string; statement: string; stage: DeliveryLifecycle["stage"]; blocksNextStage: boolean }>;
  requirements: Array<{ id: string; title: string; sourceId: string | null; stage: DeliveryLifecycle["stage"] }>;
  conflicts: Array<{ id: string; subjectId: string; statement: string; civilModified: false; structuralModified: false }>;
  reviews: Array<{ id: string; subjectId: string; revision: number; outcome: string; approvalGranted: boolean }>;
  deliverables: Array<{ id: string; title: string; stage: DeliveryLifecycle["stage"]; revision: number; basisLinked: boolean; requirementLinked: boolean; reviewId: string | null; inputIds: string[]; freshness: Freshness; ifc: false }>;
  baselines: Array<{ id: string; type: ConfigurationBaseline["baselineType"]; frozen: true; modelIds: string[]; groundwaterIds: string[] }>;
  audits: Array<{ action: string; at: string; actorId: string; detail: Record<string, string | number | boolean | null> }>;
};
