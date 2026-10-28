/**
 * EOS 2.3 structural design delivery.
 * Coordinates lifecycle, basis, and D1 references.
 * This module does not evaluate structural formulas and does not certify a project.
 */

import type { EngineeringBasisGraph } from "../engineering-basis/model";
import type { ConfigurationBaseline, DeliveryLifecycle } from "../delivery-lifecycle/model";

export const CAPABILITY_STATES = [
  "ARCHITECTURE_DEFINED",
  "IMPLEMENTED",
  "VALIDATED",
  "QUALIFIED",
  "BOUNDED_LIMITATION",
  "NOT_IMPLEMENTED",
] as const;
export type CapabilityState = (typeof CAPABILITY_STATES)[number];

export const D1_PRESERVED_LIMITATIONS = [
  "C3 complete interaction surface is not validated",
  "C3 member stability is not validated",
  "C3 National Annex is not validated",
  "C6 effective length is supplied",
  "C6 phiEf is supplied",
  "C6 has no biaxial second-order integration",
  "C7 class N calculated creep and shrinkage are the validated scope",
  "C7 cement classes S and R are not validated production scope",
  "C7 has no temperature adjustment",
  "C7 phiEf is outside the calculated method",
  "C7 size-time cap remains fail-closed where unbound",
  "C7 has no National Annex",
  "C9 has no complete two-way slab analysis or design",
  "C9 has no complete wall design",
  "C9 has no full wall shear, second-order, boundary-element, or seismic-wall detailing",
  "D1G solver qualification remains separate",
  "D1L project certification remains separate",
] as const;

export const STRUCTURAL_CAPABILITIES = [
  { id: "concept_workflow", stage: "concept", state: "IMPLEMENTED", solverDependent: false },
  { id: "option_comparison", stage: "concept", state: "IMPLEMENTED", solverDependent: false },
  { id: "feasibility_workflow", stage: "feasibility", state: "IMPLEMENTED", solverDependent: false },
  { id: "preliminary_member_sizing", stage: "feasibility", state: "BOUNDED_LIMITATION", solverDependent: true },
  { id: "feed_workflow", stage: "feed", state: "IMPLEMENTED", solverDependent: false },
  { id: "detailed_workflow", stage: "detailed_engineering", state: "IMPLEMENTED", solverDependent: false },
  { id: "d1_calculation_link", stage: "detailed_engineering", state: "IMPLEMENTED", solverDependent: false },
  { id: "c3_interaction_surface", stage: "detailed_engineering", state: "BOUNDED_LIMITATION", solverDependent: false },
  { id: "c7_class_n", stage: "detailed_engineering", state: "QUALIFIED", solverDependent: false },
  { id: "two_way_slab", stage: "detailed_engineering", state: "NOT_IMPLEMENTED", solverDependent: false },
  { id: "wall_design", stage: "detailed_engineering", state: "NOT_IMPLEMENTED", solverDependent: false },
  { id: "connection_design", stage: "detailed_engineering", state: "NOT_IMPLEMENTED", solverDependent: false },
  { id: "foundation_design_calculation", stage: "detailed_engineering", state: "NOT_IMPLEMENTED", solverDependent: false },
  { id: "space_gass_read_only_connector", stage: "detailed_engineering", state: "BOUNDED_LIMITATION", solverDependent: true },
  { id: "hosted_solver_execution", stage: "detailed_engineering", state: "NOT_IMPLEMENTED", solverDependent: true },
] as const;

export const SOLVER_TOOLS = ["SPACE_GASS", "ETABS", "SAP2000", "STAAD", "ANSYS", "OPENSEES"] as const;
export type SolverTool = (typeof SOLVER_TOOLS)[number];

export const LOAD_CATEGORIES = [
  "self_weight",
  "dead",
  "imposed",
  "equipment_operating",
  "equipment_empty",
  "equipment_test",
  "piping_operating",
  "piping_hydrotest",
  "wind",
  "seismic",
  "thermal",
  "maintenance",
  "erection",
  "lifting",
  "impact",
  "dynamic",
  "accidental",
] as const;

export const FOUNDATION_KINDS = ["isolated_footing", "combined_footing", "strip_footing", "raft", "pile_cap", "piled_foundation", "equipment_foundation"] as const;
export const CONNECTION_KINDS = ["beam_column", "beam_beam", "brace", "base_plate", "anchor", "splice", "equipment_support"] as const;

export type StructuralOption = {
  id: string;
  title: string;
  system: "braced_steel" | "moment_frame_steel" | "reinforced_concrete" | "modular" | "stick_built";
  stage: DeliveryLifecycle["stage"];
  facts: string[];
  assumptions: string[];
  estimates: string[];
  unresolved: string[];
  recommendation: string | null;
};

export type StructuralLoad = {
  id: string;
  category: (typeof LOAD_CATEGORIES)[number];
  name: string;
  value: string | null;
  unit: string | null;
  direction: string | null;
  coordinateSystem: string | null;
  location: string | null;
  stage: DeliveryLifecycle["stage"];
  sourceId: string | null;
  revision: number;
  status: "current" | "superseded";
  uncertainty: string | null;
  synthetic: boolean;
};

export type StructuralCalculation = {
  id: string;
  purpose: string;
  stage: DeliveryLifecycle["stage"];
  loadIds: string[];
  modelId: string | null;
  d1CalculationId: string | null;
  engine: "not_calculated" | "existing_d1_reference" | "external_solver_reference";
  engineVersion: string | null;
  resultId: string | null;
  freshness: "current" | "potentially_stale";
  revision: number;
  synthetic: boolean;
  codeComplianceClaimed: false;
};

export type StructuralResult = {
  id: string;
  calculationId: string;
  kind: "reaction" | "member_force" | "deflection" | "provenance_only";
  value: string | null;
  unit: string | null;
  provenance: string;
  freshness: "current" | "potentially_stale";
  synthetic: boolean;
};

export type StructuralModel = {
  id: string;
  purpose: string;
  stage: DeliveryLifecycle["stage"];
  solver: SolverTool | "internal_reference";
  solverVersion: string | null;
  revision: number;
  basisRevision: number;
  loadRevisionIds: string[];
  checksum: string | null;
  status: "registered" | "superseded";
  freshness: "current" | "potentially_stale";
  reviewer: string | null;
};

export type StructuralDeliverable = {
  id: string;
  title: string;
  stage: DeliveryLifecycle["stage"];
  maturity: "concept" | "feasibility" | "feed" | "detailed_engineering";
  revision: number;
  calculationIds: string[];
  modelIds: string[];
  basisLinked: boolean;
  requirementLinked: boolean;
  reviewId: string | null;
  freshness: "current" | "potentially_stale";
  ifc: false;
};

export type StructuralDelivery = {
  id: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  projectTitle: string;
  assetName: string | null;
  lifecycle: DeliveryLifecycle;
  basis: EngineeringBasisGraph;
  options: StructuralOption[];
  systems: Array<{ id: string; name: string; stage: DeliveryLifecycle["stage"] }>;
  structures: Array<{ id: string; name: string; systemId: string }>;
  members: Array<{ id: string; name: string; structureId: string; preliminary: boolean }>;
  materials: Array<{ id: string; name: string; grade: string | null }>;
  loads: StructuralLoad[];
  loadCases: Array<{ id: string; name: string; loadIds: string[]; profile: string | null; revision: number; stage: DeliveryLifecycle["stage"] }>;
  combinations: Array<{ id: string; name: string; profile: string; factors: string; caseIds: string[]; revision: number; stage: DeliveryLifecycle["stage"] }>;
  supports: Array<{ id: string; name: string }>;
  connections: Array<{ id: string; kind: (typeof CONNECTION_KINDS)[number]; designStatus: "definition_only" }>;
  foundations: Array<{ id: string; kind: (typeof FOUNDATION_KINDS)[number]; designStatus: "definition_only"; loadIds: string[] }>;
  models: StructuralModel[];
  calculations: StructuralCalculation[];
  results: StructuralResult[];
  checks: Array<{ id: string; calculationId: string; status: "not_run" }>;
  interfaces: Array<{ id: string; fromDiscipline: string; parameter: string; status: "proposed" | "accepted"; loadId: string | null; revision: number }>;
  risks: Array<{ id: string; statement: string; stage: DeliveryLifecycle["stage"] }>;
  decisions: Array<{ id: string; statement: string; stage: DeliveryLifecycle["stage"] }>;
  assumptions: Array<{ id: string; statement: string; stage: DeliveryLifecycle["stage"]; blocksNextStage: boolean }>;
  requirements: Array<{ id: string; title: string; sourceId: string | null; stage: DeliveryLifecycle["stage"] }>;
  changes: Array<{ id: string; targetIds: string[]; approved: false }>;
  reviews: Array<{ id: string; subjectId: string; revision: number; outcome: string; role: string; approvalGranted: boolean }>;
  deliverables: StructuralDeliverable[];
  baselines: Array<{ id: string; type: ConfigurationBaseline["baselineType"]; frozen: true; loadIds: string[]; calculationIds: string[]; modelIds: string[] }>;
  solverPackages: Array<{ id: string; tool: SolverTool; executionCertified: false; status: "metadata_only" | "read_only_connector" }>;
  audits: Array<{ action: string; at: string; actorId: string; detail: Record<string, string | number | boolean | null> }>;
};
