/**
 * EOS 2.7 civil design delivery.
 * Governs site, grading, drainage, roads, and quantities.
 * This module does not evaluate civil hydraulics, earthworks, or pavement thickness.
 * Site and area rows are delivery references. They do not create a second area master.
 */

import type { EngineeringBasisGraph } from "../engineering-basis/model";
import type { ConfigurationBaseline, DeliveryLifecycle } from "../delivery-lifecycle/model";

export const CIVIL_CAPABILITIES = [
  { id: "concept_workflow", stage: "concept", state: "IMPLEMENTED" },
  { id: "option_comparison", stage: "concept", state: "IMPLEMENTED" },
  { id: "feasibility_workflow", stage: "feasibility", state: "IMPLEMENTED" },
  { id: "survey_registry", stage: "feasibility", state: "IMPLEMENTED" },
  { id: "grading_records", stage: "feasibility", state: "IMPLEMENTED" },
  { id: "grading_surface_calculation", stage: "feasibility", state: "NOT_IMPLEMENTED" },
  { id: "earthworks_records", stage: "feasibility", state: "IMPLEMENTED" },
  { id: "cut_fill_calculation", stage: "feasibility", state: "NOT_IMPLEMENTED" },
  { id: "drainage_records", stage: "feasibility", state: "IMPLEMENTED" },
  { id: "drainage_flow_calculation", stage: "feasibility", state: "NOT_IMPLEMENTED" },
  { id: "culvert_records", stage: "feasibility", state: "IMPLEMENTED" },
  { id: "culvert_sizing", stage: "detailed_engineering", state: "NOT_IMPLEMENTED" },
  { id: "road_records", stage: "feasibility", state: "IMPLEMENTED" },
  { id: "pavement_records", stage: "feasibility", state: "IMPLEMENTED" },
  { id: "pavement_thickness_design", stage: "detailed_engineering", state: "NOT_IMPLEMENTED" },
  { id: "quantity_records", stage: "feasibility", state: "IMPLEMENTED" },
  { id: "flood_interface", stage: "feed", state: "IMPLEMENTED" },
  { id: "flood_model", stage: "detailed_engineering", state: "NOT_IMPLEMENTED" },
  { id: "underground_corridor", stage: "feed", state: "IMPLEMENTED" },
  { id: "clash_intelligence", stage: "detailed_engineering", state: "NOT_IMPLEMENTED" },
  { id: "excavation_stability", stage: "detailed_engineering", state: "NOT_IMPLEMENTED" },
  { id: "civil_3d", stage: "detailed_engineering", state: "EXTERNAL_TOOL_DEPENDENT" },
  { id: "twelved_model", stage: "detailed_engineering", state: "EXTERNAL_TOOL_DEPENDENT" },
  { id: "hosted_civil_calculation", stage: "detailed_engineering", state: "NOT_IMPLEMENTED" },
] as const;

export type Freshness = "current" | "potentially_stale";

export type CivilDelivery = {
  id: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  projectTitle: string;
  lifecycle: DeliveryLifecycle;
  basis: EngineeringBasisGraph;
  options: Array<{ id: string; title: string; concept: "balanced_earthworks" | "reduced_fill"; stage: DeliveryLifecycle["stage"]; facts: string[]; assumptions: string[]; unresolved: string[] }>;
  sites: Array<{ id: string; name: string; areaRef: string | null }>;
  areas: Array<{ id: string; siteId: string; name: string; kind: "zone" | "road_corridor" | "catchment" | "underground_corridor" | "laydown"; areaRef: string | null }>;
  surveys: Array<{ id: string; surveyType: string; horizontalDatum: string; verticalDatum: string; coordinateSystem: string; revision: number; status: "current" | "superseded"; checksum: string; transformationId: string | null }>;
  surfaces: Array<{ id: string; kind: "existing" | "design"; surveyId: string; datum: string; provenance: "SYNTHETIC_VALIDATION_FIXTURE" | "imported_reference"; revision: number; inputIds: string[]; freshness: Freshness; calculatedHere: false }>;
  grading: Array<{ id: string; zone: string; sourceSurfaceId: string; designSurfaceId: string | null; inputIds: string[]; freshness: Freshness; calculatedHere: false }>;
  earthworks: Array<{ id: string; cut: string | null; cutUnit: string | null; fill: string | null; fillUnit: string | null; bulkingFactor: string | null; provenance: "SYNTHETIC_VALIDATION_FIXTURE" | "imported_reference"; inputIds: string[]; freshness: Freshness; calculatedHere: false }>;
  catchments: Array<{ id: string; name: string; inputIds: string[]; freshness: Freshness }>;
  drainage: Array<{ id: string; kind: "network" | "channel" | "pipe"; flow: string | null; unit: string | null; provenance: "SYNTHETIC_VALIDATION_FIXTURE" | "imported_reference" | "metadata"; inputIds: string[]; freshness: Freshness; calculatedHere: false }>;
  cases: Array<{ id: string; name: string }>;
  culverts: Array<{ id: string; location: string; size: string | null; unit: string | null; sizedHere: false; inputIds: string[]; freshness: Freshness }>;
  roads: Array<{ id: string; roadClass: string; width: string | null; unit: string | null; inputIds: string[]; freshness: Freshness }>;
  pavements: Array<{ id: string; thickness: string | null; unit: string | null; geotechInputId: string | null; designedHere: false; inputIds: string[]; freshness: Freshness }>;
  hardstands: Array<{ id: string; use: string; temporary: boolean }>;
  trenches: Array<{ id: string; purpose: string; stabilityCalculated: false; inputIds: string[]; freshness: Freshness }>;
  corridors: Array<{ id: string; name: string; inputIds: string[]; freshness: Freshness }>;
  crossings: Array<{ id: string; kind: string; inputIds: string[]; freshness: Freshness }>;
  retaining: Array<{ id: string; statement: string; structuralCapacityClaimed: false }>;
  flood: Array<{ id: string; source: string; level: string | null; unit: string | null; modeledHere: false }>;
  erosion: Array<{ id: string; basis: string }>;
  geotech: Array<{ id: string; parameter: string; value: string | null; unit: string | null; source: string | null; ownedBy: "geotechnical"; civilModified: false; revision: number; status: "current" | "superseded" }>;
  pipingRoutes: Array<{ id: string; routeRef: string; ownedBy: "piping"; civilModified: false; revision: number; status: "current" | "superseded" }>;
  structuralInputs: Array<{ id: string; parameter: string; ownedBy: "structural"; civilModified: false; structuralCapacityClaimed: false }>;
  quantities: Array<{ id: string; category: string; value: string; unit: string; provenance: "SYNTHETIC_VALIDATION_FIXTURE" | "imported_reference"; maturity: DeliveryLifecycle["stage"]; procurementAccurate: false; inputIds: string[]; freshness: Freshness }>;
  models: Array<{ id: string; tool: string; revision: number; bidirectional: false; executionCertified: false }>;
  interfaces: Array<{ id: string; consumer: "structural" | "piping" | "geotechnical" | "electrical" | "instrumentation_and_control"; parameter: string; status: "proposed" | "accepted"; inputIds: string[]; freshness: Freshness }>;
  risks: Array<{ id: string; statement: string; stage: DeliveryLifecycle["stage"] }>;
  decisions: Array<{ id: string; statement: string; stage: DeliveryLifecycle["stage"] }>;
  assumptions: Array<{ id: string; statement: string; stage: DeliveryLifecycle["stage"]; blocksNextStage: boolean }>;
  requirements: Array<{ id: string; title: string; sourceId: string | null; stage: DeliveryLifecycle["stage"] }>;
  conflicts: Array<{ id: string; subjectId: string; statement: string; pipingModified: false; geotechModified: false }>;
  reviews: Array<{ id: string; subjectId: string; revision: number; outcome: string; approvalGranted: boolean }>;
  deliverables: Array<{ id: string; title: string; stage: DeliveryLifecycle["stage"]; revision: number; basisLinked: boolean; requirementLinked: boolean; reviewId: string | null; inputIds: string[]; freshness: Freshness; ifc: false }>;
  baselines: Array<{ id: string; type: ConfigurationBaseline["baselineType"]; frozen: true; surveyIds: string[]; routeIds: string[] }>;
  audits: Array<{ action: string; at: string; actorId: string; detail: Record<string, string | number | boolean | null> }>;
};
