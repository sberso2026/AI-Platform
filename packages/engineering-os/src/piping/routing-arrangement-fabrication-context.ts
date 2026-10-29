/**
 * EOS-D5-R5 Piping routing, arrangement, and fabrication context.
 * One bounded runtime on exact R1-R4 revisions. No routing or spatial solving.
 */
import {
  D5_CURRENTNESS_STATES,
  D5_IMPLEMENTATION_PHASE_TYPES,
  D5_IMPLEMENTATION_PHASES,
  D5_MATURITY_STATES,
  PIPING_ISOMETRIC_EQUALS_PIPING_IDENTITY,
  PIPING_ROUTE_CONTEXT_EQUALS_CLASH_FREE,
  PIPING_ROUTE_CONTEXT_EQUALS_CONSTRUCTABLE,
  PIPING_ROUTE_CONTEXT_EQUALS_OPTIMIZED,
  PIPING_SPOOL_DOCUMENT_EQUALS_ENGINEERING_VALIDATED,
} from "@rtb/types";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import {
  D5_COMPONENT_CONNECTION_VALVE_RUNTIME_READY as R4_READY,
  D5_COMPONENT_SIZING_RUNTIME_COUNT,
  D5_DESIGN_CONDITION_SPECIFICATION_RUNTIME_READY as R3_READY,
  D5_PIPING_IDENTITY_OBJECT_FOUNDATION_RUNTIME_READY as R1_READY,
  D5_ROUTING_ARRANGEMENT_FABRICATION_RUNTIME_COUNT as R4_ROUTING_COUNT,
  D5_RUNTIME_COUNT as R4_RUNTIME_COUNT,
  D5_SYSTEM_LINE_SERVICE_CONTEXT_RUNTIME_READY as R2_READY,
  D5_VALVE_SIZING_RUNTIME_COUNT,
  type D5R4Store,
} from "./component-connection-valve-context";
import { D5_CONTEXT_AUTHORITY, type D5R1Actor } from "./identity-foundation";
import {
  ADMIN_EQUALS_D5_PIPING_ENGINEERING_AUTHORITY,
  AI_EQUALS_D5_PIPING_ENGINEERING_AUTHORITY,
  D1_STRUCTURAL_PACK_COMPLETE,
  D1N_REOPENED,
  D2_REOPENED,
  D2_TRACK_COMPLETE,
  D3_REOPENED,
  D3_TRACK_COMPLETE,
  D4_REOPENED,
  D4_TRACK_COMPLETE,
  D5_APPROVAL_RUNTIME_COUNT,
  D5_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT,
  D5_AUTOMATIC_REDESIGN_RUNTIME_COUNT,
  D5_AUTOMATIC_ROUTING_RUNTIME_COUNT,
  D5_BRANCH_REINFORCEMENT_CALCULATION_RUNTIME_COUNT,
  D5_CERTIFICATION_RUNTIME_COUNT,
  D5_CONFORMANCE_DETERMINATION_RUNTIME_COUNT,
  D5_CROSS_DISCIPLINE_CONFLICT_DETECTION_RUNTIME_COUNT,
  D5_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT,
  D5_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT,
  D5_CROSS_DISCIPLINE_RECOMMENDATION_RUNTIME_COUNT,
  D5_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT,
  D5_D9_RUNTIME_INTEGRATION_COUNT,
  D5_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
  D5_DISCIPLINE_INTERFACE_RUNTIME_COUNT,
  D5_EQUALS_D1_STRUCTURAL_AUTHORITY,
  D5_EQUALS_D2_CIVIL_AUTHORITY,
  D5_EQUALS_D3_GEOTECHNICAL_AUTHORITY,
  D5_EQUALS_D4_MECHANICAL_AUTHORITY,
  D5_EQUALS_D6_PROCESS_AUTHORITY,
  D5_EQUALS_D7_ELECTRICAL_AUTHORITY,
  D5_EQUALS_D8_INSTRUMENTATION_CONTROL_AUTHORITY,
  D5_FLEXIBILITY_CALCULATION_RUNTIME_COUNT,
  D5_FLANGE_RATING_CALCULATION_RUNTIME_COUNT,
  D5_HYDRAULIC_CALCULATION_RUNTIME_COUNT,
  D5_PIPE_SIZING_RUNTIME_COUNT,
  D5_PIPING_STRESS_CALCULATION_RUNTIME_COUNT,
  D5_PRESSURE_DROP_CALCULATION_RUNTIME_COUNT,
  D5_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_COUNT,
  D5_REUSES_CANONICAL_CURRENTNESS,
  D5_REUSES_CANONICAL_FINGERPRINT,
  D5_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_COUNT,
  D5_ROUTE_OPTIMIZATION_RUNTIME_COUNT,
  D5_SPATIAL_CLASH_DETECTION_RUNTIME_COUNT,
  D5_STRESS_SUPPORT_TEST_EVIDENCE_RUNTIME_COUNT,
  D5_SUPPORT_LOAD_CALCULATION_RUNTIME_COUNT,
  D5_WALL_THICKNESS_CALCULATION_RUNTIME_COUNT,
  DATABASE_SCHEMA_CHANGED,
  NEW_DEPENDENCY_ADDED,
  PARALLEL_D5_CURRENTNESS_ENGINE_CREATED,
  SECOND_D5_FINGERPRINT_ALGORITHM_CREATED,
} from "./system-line-service-context";

export const D5_R5_STATUS = "ROUTING_ARRANGEMENT_AND_FABRICATION_CONTEXT_IMPLEMENTED" as const;
export const D5_R5_MATURITY = D5_R5_STATUS;
export const D5_R5_MATURITY_STATE = D5_R5_STATUS;
export const D5_R5_CLOSEOUT_PATH =
  "docs/architecture/engineering-os/EOS_D5_R5_ROUTING_ARRANGEMENT_AND_FABRICATION_CONTEXT_CLOSEOUT.md" as const;
export const D5_RUNTIME_STARTED = true as const;
export const D5_RUNTIME_COUNT = 5 as const;
export const D5_R4_RUNTIME_COUNT = R4_RUNTIME_COUNT;
export const D5_R4_ROUTING_ARRANGEMENT_FABRICATION_RUNTIME_COUNT = R4_ROUTING_COUNT;
export const D5_PIPING_IDENTITY_OBJECT_FOUNDATION_RUNTIME_READY = R1_READY;
export const D5_SYSTEM_LINE_SERVICE_CONTEXT_RUNTIME_READY = R2_READY;
export const D5_DESIGN_CONDITION_SPECIFICATION_RUNTIME_READY = R3_READY;
export const D5_COMPONENT_CONNECTION_VALVE_RUNTIME_READY = R4_READY;
export const D5_R1_IDENTITY_REUSED = R1_READY;
export const D5_R2_SYSTEM_LINE_SERVICE_CONTEXT_REUSED = R2_READY;
export const D5_R3_DESIGN_CONDITION_SPECIFICATION_CONTEXT_REUSED = R3_READY;
export const D5_R4_COMPONENT_CONNECTION_VALVE_CONTEXT_REUSED = R4_READY;
export const EXACT_D5_R1_R4_REFERENCE_REQUIRED = true as const;
export const FLOATING_D5_R5_SOURCE_REFERENCE_ALLOWED = false as const;
export const D5_R5_SOURCE_AUTO_REPOINTED = false as const;
export const D5_ROUTING_ARRANGEMENT_FABRICATION_RUNTIME_IMPLEMENTED = true as const;
export const D5_ROUTING_ARRANGEMENT_FABRICATION_RUNTIME_COUNT = 1 as const;
export const D5_ROUTING_ARRANGEMENT_FABRICATION_RUNTIME_READY = true as const;
export const D5_PIPING_ROUTING_CONTEXT_IMPLEMENTED = true as const;
export const D5_EXPLICIT_ROUTE_RELATIONSHIPS_REQUIRED = true as const;
export const D5_INFERRED_ROUTE_RELATIONSHIPS_ALLOWED = false as const;
export const PIPING_ROUTE_CONTEXT_EQUALS_STRESS_VALIDATED = false as const;
export const D5_PIPING_ARRANGEMENT_CONTEXT_IMPLEMENTED = true as const;
export const PIPING_ARRANGEMENT_CONTEXT_EQUALS_SPATIAL_VALIDATION = false as const;
export const PIPING_ARRANGEMENT_CONTEXT_EQUALS_CLASH_FREE = false as const;
export const PIPING_ARRANGEMENT_CONTEXT_EQUALS_ACCESS_VALIDATED = false as const;
export const PIPING_ARRANGEMENT_CONTEXT_EQUALS_MAINTAINABILITY_VALIDATED = false as const;
export const D5_ROUTE_SLOPE_CONTEXT_SUPPORTED = true as const;
export const D5_ROUTE_ELEVATION_CONTEXT_SUPPORTED = true as const;
export const D5_ROUTE_GEOMETRY_CONTEXT_SUPPORTED = true as const;
export const ROUTE_SLOPE_CONTEXT_EQUALS_HYDRAULIC_VALIDATION = false as const;
export const ROUTE_GEOMETRY_CONTEXT_EQUALS_GEOMETRY_SOLVED = false as const;
export const D5_D4_ACCESS_MAINTENANCE_REFERENCE_SUPPORTED = true as const;
export const EXACT_D4_ACCESS_MAINTENANCE_REVISION_REQUIRED = true as const;
export const D5_R5_VALIDATES_D4_MAINTAINABILITY = false as const;
export const D5_R5_VALIDATES_MECHANICAL_ACCESS = false as const;
export const D5_PIPING_FABRICATION_CONTEXT_IMPLEMENTED = true as const;
export const FABRICATION_CONTEXT_EQUALS_FABRICATION_COMPLETE = false as const;
export const FABRICATION_CONTEXT_EQUALS_ENGINEERING_VALIDATED = false as const;
export const D5_PIPING_ISOMETRIC_CONTEXT_IMPLEMENTED = true as const;
export const PIPING_ISOMETRIC_EQUALS_ENGINEERING_VALIDATED = false as const;
export const D5_PIPING_SPOOL_CONTEXT_IMPLEMENTED = true as const;
export const PIPING_SPOOL_CONTEXT_EQUALS_FABRICATED = false as const;
export const D5_PIPING_WELD_JOINT_CONTEXT_IMPLEMENTED = true as const;
export const WELD_JOINT_CONTEXT_EQUALS_WELD_ACCEPTED = false as const;
export const WELD_JOINT_CONTEXT_EQUALS_NDE_PASSED = false as const;
export const WELD_JOINT_CONTEXT_EQUALS_CODE_CONFORMANT = false as const;
export const D5_R4_COMPONENT_CONNECTION_CONTEXT_REUSED = true as const;
export const EXACT_D5_R4_COMPONENT_CONNECTION_REVISION_REQUIRED = true as const;
export const D5_R5_AUTO_MUTATES_R4_COMPONENT_CONTEXT = false as const;
export const D5_R5_AUTO_MUTATES_R4_CONNECTION_CONTEXT = false as const;
export const D5_R5_SOURCE_BASIS_REQUIRED = true as const;
export const D5_R5_SOURCE_BASIS_TRACEABLE = true as const;
export const BASISLESS_AUTHORITATIVE_D5_R5_RECORD_AUTO_ACCEPTED = false as const;
export const D5_R5_APPLICABILITY_EXPLICIT = true as const;
export const D5_R5_LIMITATIONS_EXPLICIT = true as const;
export const D5_R5_AUTO_PROPAGATED_OUTSIDE_APPLICABILITY = false as const;
export const D5_GEOMETRY_SOLVER_RUNTIME_COUNT = 0 as const;
export const D5_CONSTRUCTABILITY_DETERMINATION_RUNTIME_COUNT = 0 as const;
export const D5_R5_HIDDEN_SPATIAL_SOLVER_ALLOWED = false as const;
export const AI_CAN_INVENT_AUTHORITATIVE_D5_ROUTE = false as const;
export const AI_CAN_INVENT_AUTHORITATIVE_D5_FABRICATION_CONTEXT = false as const;
export const AI_CAN_INVENT_AUTHORITATIVE_D5_WELD_CONTEXT = false as const;
export const D5_R5_PROVENANCE_REQUIRED = true as const;
export const D5_R5_PROVENANCE_PRESERVED = true as const;
export const D5_R5_AUTO_REPOINTED = false as const;
export const SILENT_D5_R5_MUTATION_ALLOWED = false as const;
export const D5_R5_HISTORY_PRESERVED = true as const;
export const TENANT_WORKSPACE_PROJECT_D5_R5_SCOPE_ENFORCED = true as const;
export const D5_R5_DUPLICATE_GOVERNANCE_IMPLEMENTED = true as const;
export const D5_R5_REPLAY_PROTECTION_IMPLEMENTED = true as const;
export const D5_R5_SPOOFING_PROTECTION_IMPLEMENTED = true as const;
export const D6_RUNTIME_STARTED = false as const;
export const D7_RUNTIME_STARTED = false as const;
export const D8_RUNTIME_STARTED = false as const;
export const D9_RUNTIME_STARTED = false as const;
export const D9_RUNTIME_COUNT = 0 as const;
export const UNAUTHORIZED_D1_PACK_COMPLETION = false as const;
export const UNAUTHORIZED_D2_REOPEN = false as const;
export const UNAUTHORIZED_D3_REOPEN = false as const;
export const UNAUTHORIZED_D4_REOPEN = false as const;
export const UNAUTHORIZED_D5_R6_R12_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_D6_D8_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_D9_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_AUTOMATIC_ROUTING_PROMOTION = false as const;
export const UNAUTHORIZED_SPATIAL_SOLVER_PROMOTION = false as const;
export const UNAUTHORIZED_STRESS_ANALYSIS_PROMOTION = false as const;
export const UNAUTHORIZED_PIPING_CALCULATION_PROMOTION = false as const;
export const UNAUTHORIZED_PIPING_VALIDATION_PROMOTION = false as const;
export const UNAUTHORIZED_CROSS_DISCIPLINE_REASONING_PROMOTION = false as const;
export const UNAUTHORIZED_GA_PROMOTION = false as const;
export const UNAUTHORIZED_PRODUCT_CLAIM = false as const;
export const D5_R6_CANONICAL_PHASE = D5_IMPLEMENTATION_PHASES[5];
export const D5_R6_PHASE_TYPE = D5_IMPLEMENTATION_PHASE_TYPES[5];
export const D5_R6_CANONICAL_SCOPE =
  "Implement governed Piping stress/flexibility, support/restraint and inspection/NDE/test evidence context using exact R1-R5 revisions. Record externally produced or explicitly supplied analysis/test evidence, load cases, result references, support requirements, test requirements and observed results without implementing stress, flexibility, support-load or test calculations, Structural support validation, code-conformance determination, review/validation governance or D9 reasoning." as const;
export const D5_R6_STARTED = false as const;
export const D5_R5_READY_FOR_NEXT_PHASE = true as const;
export const D5_R5_NEXT_PHASE = D5_R6_CANONICAL_PHASE;
export const D5_R5_NEXT_PHASE_TYPE = D5_R6_PHASE_TYPE;
export const D5_R5_CANONICAL_NEXT_PHASE = D5_R6_CANONICAL_PHASE;
export const D5_R5_CANONICAL_NEXT_PHASE_SCOPE = D5_R6_CANONICAL_SCOPE;
export const D5_R5_BLOCKER = "NONE" as const;
export const D5_R5_MACHINE_READABLE_ROADMAP_UPDATED = true as const;
export const D5_R5_PLACEMENTS = ["ABOVE_GROUND", "BURIED"] as const;
export const D5_R5_FABRICATION_CLASSES = ["SHOP", "FIELD"] as const;
export const D5_R5_JOINT_TYPES = ["BUTT", "SOCKET", "FILLET", "THREADED", "FLANGED", "OTHER_JOINT"] as const;
export const D5_R5_SOURCE_BASIS_CATEGORIES = [
  "R4_COMPONENT_CONNECTION",
  "PROJECT_PIPING_DATA",
  "APPROVED_ISOMETRIC",
  "FABRICATION_EVIDENCE",
  "PROJECT_SPECIFICATION",
  "AUTHORIZED_PIPING_ENGINEERING_INPUT",
] as const;
export const D5_R5_ACCESS_CLASSES = ["ACCESS_CLEARANCE_CONTEXT", "MAINTAINABILITY_CONTEXT", "ARRANGEMENT_CONSTRAINT"] as const;

export {
  PIPING_ROUTE_CONTEXT_EQUALS_CLASH_FREE,
  PIPING_ROUTE_CONTEXT_EQUALS_CONSTRUCTABLE,
  PIPING_ROUTE_CONTEXT_EQUALS_OPTIMIZED,
  PIPING_ISOMETRIC_EQUALS_PIPING_IDENTITY,
  PIPING_SPOOL_DOCUMENT_EQUALS_ENGINEERING_VALIDATED,
  D5_REUSES_CANONICAL_CURRENTNESS,
  PARALLEL_D5_CURRENTNESS_ENGINE_CREATED,
  D5_REUSES_CANONICAL_FINGERPRINT,
  SECOND_D5_FINGERPRINT_ALGORITHM_CREATED,
  AI_EQUALS_D5_PIPING_ENGINEERING_AUTHORITY,
  ADMIN_EQUALS_D5_PIPING_ENGINEERING_AUTHORITY,
  D5_EQUALS_D1_STRUCTURAL_AUTHORITY,
  D5_EQUALS_D2_CIVIL_AUTHORITY,
  D5_EQUALS_D3_GEOTECHNICAL_AUTHORITY,
  D5_EQUALS_D4_MECHANICAL_AUTHORITY,
  D5_EQUALS_D6_PROCESS_AUTHORITY,
  D5_EQUALS_D7_ELECTRICAL_AUTHORITY,
  D5_EQUALS_D8_INSTRUMENTATION_CONTROL_AUTHORITY,
  D5_AUTOMATIC_ROUTING_RUNTIME_COUNT,
  D5_ROUTE_OPTIMIZATION_RUNTIME_COUNT,
  D5_SPATIAL_CLASH_DETECTION_RUNTIME_COUNT,
  D5_PIPE_SIZING_RUNTIME_COUNT,
  D5_HYDRAULIC_CALCULATION_RUNTIME_COUNT,
  D5_PRESSURE_DROP_CALCULATION_RUNTIME_COUNT,
  D5_WALL_THICKNESS_CALCULATION_RUNTIME_COUNT,
  D5_BRANCH_REINFORCEMENT_CALCULATION_RUNTIME_COUNT,
  D5_FLANGE_RATING_CALCULATION_RUNTIME_COUNT,
  D5_VALVE_SIZING_RUNTIME_COUNT,
  D5_COMPONENT_SIZING_RUNTIME_COUNT,
  D5_PIPING_STRESS_CALCULATION_RUNTIME_COUNT,
  D5_FLEXIBILITY_CALCULATION_RUNTIME_COUNT,
  D5_SUPPORT_LOAD_CALCULATION_RUNTIME_COUNT,
  D5_STRESS_SUPPORT_TEST_EVIDENCE_RUNTIME_COUNT,
  D5_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_COUNT,
  D5_DISCIPLINE_INTERFACE_RUNTIME_COUNT,
  D5_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_COUNT,
  D5_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT,
  D5_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
  D5_D9_RUNTIME_INTEGRATION_COUNT,
  D5_AUTOMATIC_REDESIGN_RUNTIME_COUNT,
  D5_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT,
  D5_CONFORMANCE_DETERMINATION_RUNTIME_COUNT,
  D5_APPROVAL_RUNTIME_COUNT,
  D5_CERTIFICATION_RUNTIME_COUNT,
  D5_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT,
  D5_CROSS_DISCIPLINE_CONFLICT_DETECTION_RUNTIME_COUNT,
  D5_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT,
  D5_CROSS_DISCIPLINE_RECOMMENDATION_RUNTIME_COUNT,
  D1_STRUCTURAL_PACK_COMPLETE,
  D1N_REOPENED,
  D2_TRACK_COMPLETE,
  D2_REOPENED,
  D3_TRACK_COMPLETE,
  D3_REOPENED,
  D4_TRACK_COMPLETE,
  D4_REOPENED,
  DATABASE_SCHEMA_CHANGED,
  NEW_DEPENDENCY_ADDED,
};

const FLOATING = new Set(["latest", "current", "newest", "head", "active", "active model"]);
const INFERRED = new Set([
  "inferred", "drawing_geometry", "drawing_proximity", "line_graphics", "point_cloud", "point_cloud_proximity",
  "ai_semantic", "adjacent_components", "proximity", "geometry", "all", "global",
]);

type Measure = { value: string; unit: string } | null;
type SubjectKind = "ROUTE" | "ARRANGEMENT" | "FABRICATION" | "ISOMETRIC" | "SPOOL" | "WELD";
type Prohibited = {
  inferRoute?: boolean;
  automaticRouting?: boolean;
  clashDetection?: boolean;
  geometrySolve?: boolean;
  constructability?: boolean;
  hiddenSolver?: boolean;
  hydraulicDesign?: boolean;
  stressAnalysis?: boolean;
  supportAnalysis?: boolean;
  fabricateAccess?: boolean;
  mutateComponent?: boolean;
  mutateConnection?: boolean;
  propagate?: boolean;
  engineeringValidated?: boolean;
  fabricationComplete?: boolean;
  isometricIsIdentity?: boolean;
  spoolFabricated?: boolean;
  weldAccepted?: boolean;
  ndePassed?: boolean;
  codeConformant?: boolean;
};

export type D5R5BoundInput = Prohibited & {
  contextId: string;
  objectId: string;
  objectRevisionFingerprint: string;
  lineRecordId: string;
  lineContextFingerprint: string;
  specificationId: string;
  specificationFingerprint: string;
  componentRecordId: string;
  componentRevisionFingerprint: string;
  connectionRecordId: string;
  connectionRevisionFingerprint: string;
  citedLifecycleStage: string;
  citedCurrentness: string;
  provenanceRef: string;
  sourceBasisRef: string;
  sourceBasisCategory: string;
  applicabilityRef: string;
  limitations: string;
  identityBasis: string;
  relationshipBasis: string;
  assertedFingerprint?: string;
  tenantId?: string;
  workspaceId?: string;
  projectId?: string;
  predecessorId?: string | null;
  accessRecordId?: string | null;
  accessRevisionFingerprint?: string | null;
  accessAbsent?: boolean;
};

type Bound = {
  objectId: string;
  objectRevisionFingerprint: string;
  lineRecordId: string;
  lineContextFingerprint: string;
  specificationId: string;
  specificationFingerprint: string;
  componentRecordId: string;
  componentRevisionFingerprint: string;
  connectionRecordId: string;
  connectionRevisionFingerprint: string;
  applicabilityRef: string;
  limitations: string;
  sourceBasisRef: string;
  sourceBasisCategory: (typeof D5_R5_SOURCE_BASIS_CATEGORIES)[number];
  provenanceRef: string;
  citedCurrentness: (typeof D5_CURRENTNESS_STATES)[number];
  d4AccessPresent: boolean;
  d4AccessRecordId: string | null;
  d4AccessRevisionFingerprint: string | null;
};

type Status = {
  fingerprint: string;
  recordedBy: string;
  recordedAt: string;
  recordStatus: "CURRENT" | "SUPERSEDED";
  currentness: "CURRENT" | "SUPERSEDED";
  predecessorId: string | null;
  tenantId: string;
};

export type D5R5RouteInput = D5R5BoundInput & {
  routeRecordId: string;
  routeSegment: string;
  sourceObjectId: string;
  sourceRevisionFingerprint: string;
  destinationObjectId: string;
  destinationRevisionFingerprint: string;
  placement: string;
  routingConstraint: string;
  slope?: { value?: string | null; unit?: string | null } | null;
  elevation?: { value?: string | null; unit?: string | null } | null;
  geometryContext?: string | null;
  drainVentRequirement?: string | null;
  accessConstraint?: string | null;
};

export type D5R5RouteRecord = Bound & Status & {
  routeRecordId: string;
  routeSegment: string;
  sourceObjectId: string;
  sourceRevisionFingerprint: string;
  destinationObjectId: string;
  destinationRevisionFingerprint: string;
  placement: (typeof D5_R5_PLACEMENTS)[number];
  routingConstraint: string;
  slope: Measure;
  elevation: Measure;
  geometryContext: string | null;
  drainVentRequirement: string | null;
  accessConstraint: string | null;
  clashFree: false;
  constructable: false;
  optimized: false;
  stressValidated: false;
  hydraulicValidation: false;
  geometrySolved: false;
  inferred: false;
};

export type D5R5ArrangementInput = D5R5BoundInput & {
  arrangementRecordId: string;
  arrangementStatement: string;
  placement: string;
};

export type D5R5ArrangementRecord = Bound & Status & {
  arrangementRecordId: string;
  arrangementStatement: string;
  placement: (typeof D5_R5_PLACEMENTS)[number];
  spatialValidation: false;
  clashFree: false;
  accessValidated: false;
  maintainabilityValidated: false;
};

export type D5R5FabricationInput = D5R5BoundInput & {
  fabricationRecordId: string;
  fabricationClass: string;
  fabricationStatus: string;
  fabricationRequirement: string;
  evidenceRef: string;
};

export type D5R5FabricationRecord = Bound & Status & {
  fabricationRecordId: string;
  fabricationClass: (typeof D5_R5_FABRICATION_CLASSES)[number];
  fabricationStatus: string;
  fabricationRequirement: string;
  evidenceRef: string;
  fabricationComplete: false;
  engineeringValidated: false;
};

export type D5R5IsometricInput = D5R5BoundInput & {
  isometricRecordId: string;
  documentId: string;
  documentRevision: string;
};

export type D5R5IsometricRecord = Bound & Status & {
  isometricRecordId: string;
  documentId: string;
  documentRevision: string;
  isometricEqualsIdentity: false;
  engineeringValidated: false;
};

export type D5R5SpoolInput = D5R5BoundInput & {
  spoolRecordId: string;
  spoolTag: string;
};

export type D5R5SpoolRecord = Bound & Status & {
  spoolRecordId: string;
  spoolTag: string;
  fabricated: false;
  documentValidated: false;
};

export type D5R5WeldInput = D5R5BoundInput & {
  weldRecordId: string;
  jointType: string;
};

export type D5R5WeldRecord = Bound & Status & {
  weldRecordId: string;
  jointType: (typeof D5_R5_JOINT_TYPES)[number];
  weldAccepted: false;
  ndePassed: false;
  codeConformant: false;
};

export type D5R5History = {
  historyId: string;
  subjectKind: SubjectKind;
  subjectId: string;
  action: "CREATED" | "SUPERSEDED";
  fingerprint: string;
  recordedAt: string;
};

export type D5R5AccessReference = {
  recordId: string;
  fingerprint: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  recordClass: string;
  recordStatus: "CURRENT" | "SUPERSEDED";
};

export type D5R5AccessStore = {
  records: readonly D5R5AccessReference[];
};

export type D5R5Store = {
  r4: D5R4Store;
  d4: D5R5AccessStore | null;
  now: () => string;
  routes: D5R5RouteRecord[];
  arrangements: D5R5ArrangementRecord[];
  fabrications: D5R5FabricationRecord[];
  isometrics: D5R5IsometricRecord[];
  spools: D5R5SpoolRecord[];
  welds: D5R5WeldRecord[];
  history: D5R5History[];
};

function fail(code: string): never {
  throw new Error(`D5_R5_${code}`);
}

function blockedParty(value: string): boolean {
  return /^AI(?:\b|_)/i.test(value) || /LLM/i.test(value) || /OPTIMIZER/i.test(value);
}

function explicit(value: string, code: string): string {
  const token = value.trim();
  if (!token || FLOATING.has(token.toLowerCase()) || INFERRED.has(token.toLowerCase()) || blockedParty(token)) fail(code);
  if (/[=]|calc\(|solve\(/i.test(token)) fail("SPATIAL_SOLVER_NOT_IN_R5");
  return token;
}

function assertActor(actor: D5R1Actor): void {
  if (!actor.actorId.trim() || !actor.tenantId.trim() || !actor.workspaceId.trim() || !actor.projectId.trim()) fail("SCOPE_REQUIRED");
  if (blockedParty(actor.actorId) || blockedParty(actor.authority)) fail("AI_NOT_PIPING_AUTHORITY");
  if (actor.authority === "ADMINISTRATOR" || actor.authority === "ADMIN") fail("ADMIN_NOT_PIPING_AUTHORITY");
  if (actor.authority !== D5_CONTEXT_AUTHORITY) fail("UNAUTHORIZED");
}

function assertProhibited(input: Prohibited): void {
  if (input.inferRoute === true) fail("INFERRED_ROUTE_REJECTED");
  if (input.automaticRouting === true || input.clashDetection === true || input.geometrySolve === true || input.constructability === true || input.hiddenSolver === true) fail("SPATIAL_SOLVER_NOT_IN_R5");
  if (input.hydraulicDesign === true || input.stressAnalysis === true || input.supportAnalysis === true) fail("CALCULATION_NOT_IN_R5");
  if (input.fabricateAccess === true) fail("ACCESS_NOT_FABRICATED");
  if (input.mutateComponent === true || input.mutateConnection === true) fail("R4_MUTATION_REJECTED");
  if (input.propagate === true) fail("AUTO_PROPAGATION_REJECTED");
  if (input.engineeringValidated === true || input.fabricationComplete === true || input.isometricIsIdentity === true || input.spoolFabricated === true) fail("VALIDATION_NOT_IN_R5");
  if (input.weldAccepted === true || input.ndePassed === true || input.codeConformant === true) fail("WELD_ACCEPTANCE_NOT_IN_R5");
}

function measure(input: { value?: string | null; unit?: string | null } | null | undefined): Measure {
  if (!input || (input.value == null && input.unit == null)) return null;
  const value = explicit(input.value ?? "", "MEASURE_REQUIRED");
  if (!input.unit?.trim()) fail("UNITS_REQUIRED");
  return { value, unit: explicit(input.unit, "UNIT_INVALID") };
}

function remember(store: D5R5Store, subjectKind: SubjectKind, subjectId: string, action: D5R5History["action"], fingerprint: string): void {
  store.history.push({ historyId: `hist-${store.history.length + 1}`, subjectKind, subjectId, action, fingerprint, recordedAt: store.now() });
}

function prepare(store: D5R5Store, actor: D5R1Actor, input: D5R5BoundInput, allowedTypes: readonly string[]): Bound {
  assertActor(actor);
  assertProhibited(input);
  if (input.tenantId != null && input.tenantId !== actor.tenantId) fail("CROSS_TENANT_OPERATION");
  if (input.workspaceId != null && input.workspaceId !== actor.workspaceId) fail("CROSS_WORKSPACE_OPERATION");
  if (input.projectId != null && input.projectId !== actor.projectId) fail("CROSS_PROJECT_OPERATION");
  if (input.identityBasis.trim() !== "EXPLICIT") fail("INFERRED_ROUTE_REJECTED");
  if (input.relationshipBasis.trim() !== "EXPLICIT") fail("INFERRED_ROUTE_REJECTED");
  const cited = input.citedCurrentness.trim();
  if (!(D5_CURRENTNESS_STATES as readonly string[]).includes(cited)) fail("CURRENTNESS_INVALID");
  const stage = input.citedLifecycleStage.trim();
  if (!(D5_MATURITY_STATES as readonly string[]).includes(stage)) fail("MATURITY_STAGE_INVALID");
  const objectId = explicit(input.objectId, "R1_OBJECT_REQUIRED");
  const revision = explicit(input.objectRevisionFingerprint, "R1_REVISION_REQUIRED");
  const object = store.r4.r1.objects.find((row) => row.objectId === objectId);
  if (!object || object.fingerprint !== revision) fail(object ? "R1_REVISION_MISMATCH" : "R1_OBJECT_NOT_FOUND");
  if (!allowedTypes.includes(object.objectType)) fail("R1_OBJECT_TYPE_MISMATCH");
  if (object.tenantId !== actor.tenantId || object.workspaceId !== actor.workspaceId || object.projectId !== actor.projectId) fail("CROSS_SCOPE_OPERATION");
  if (cited === "CURRENT" && object.recordStatus !== "CURRENT") fail("R1_OBJECT_NOT_CURRENT");
  const lineRecordId = explicit(input.lineRecordId, "R2_LINE_REQUIRED");
  const lineRevision = explicit(input.lineContextFingerprint, "R2_REVISION_REQUIRED");
  const line = store.r4.r2.lines.find((row) => row.lineRecordId === lineRecordId);
  if (!line || line.fingerprint !== lineRevision) fail(line ? "R2_REVISION_MISMATCH" : "R2_LINE_NOT_FOUND");
  if (line.tenantId !== actor.tenantId) fail("CROSS_SCOPE_OPERATION");
  if (cited === "CURRENT" && line.recordStatus !== "CURRENT") fail("R2_CONTEXT_NOT_CURRENT");
  const specificationId = explicit(input.specificationId, "R3_SPECIFICATION_REQUIRED");
  const specificationFingerprint = explicit(input.specificationFingerprint, "R3_REVISION_REQUIRED");
  const specification = store.r4.r3.specifications.find((row) => row.specificationId === specificationId);
  if (!specification || specification.fingerprint !== specificationFingerprint) fail(specification ? "R3_REVISION_MISMATCH" : "R3_SPECIFICATION_NOT_FOUND");
  if (specification.tenantId !== actor.tenantId) fail("CROSS_SCOPE_OPERATION");
  if (cited === "CURRENT" && specification.recordStatus !== "CURRENT") fail("R3_SPECIFICATION_NOT_CURRENT");
  const componentRecordId = explicit(input.componentRecordId, "R4_COMPONENT_REQUIRED");
  const componentRevision = explicit(input.componentRevisionFingerprint, "R4_COMPONENT_REVISION_REQUIRED");
  const component = store.r4.components.find((row) => row.componentRecordId === componentRecordId);
  if (!component || component.fingerprint !== componentRevision) fail(component ? "R4_COMPONENT_REVISION_MISMATCH" : "R4_COMPONENT_NOT_FOUND");
  if (component.tenantId !== actor.tenantId) fail("CROSS_SCOPE_OPERATION");
  if (cited === "CURRENT" && component.recordStatus !== "CURRENT") fail("R4_COMPONENT_NOT_CURRENT");
  const connectionRecordId = explicit(input.connectionRecordId, "R4_CONNECTION_REQUIRED");
  const connectionRevision = explicit(input.connectionRevisionFingerprint, "R4_CONNECTION_REVISION_REQUIRED");
  const connection = store.r4.connections.find((row) => row.connectionRecordId === connectionRecordId);
  if (!connection || connection.fingerprint !== connectionRevision) fail(connection ? "R4_CONNECTION_REVISION_MISMATCH" : "R4_CONNECTION_NOT_FOUND");
  if (connection.tenantId !== actor.tenantId) fail("CROSS_SCOPE_OPERATION");
  if (cited === "CURRENT" && connection.recordStatus !== "CURRENT") fail("R4_CONNECTION_NOT_CURRENT");
  const applicabilityRef = explicit(input.applicabilityRef, "APPLICABILITY_REQUIRED");
  if (applicabilityRef !== object.objectId) fail("APPLICABILITY_MISMATCH");
  const sourceBasisCategory = explicit(input.sourceBasisCategory, "SOURCE_BASIS_REQUIRED");
  if (!(D5_R5_SOURCE_BASIS_CATEGORIES as readonly string[]).includes(sourceBasisCategory)) fail("SOURCE_BASIS_NOT_ALLOWLISTED");
  let d4AccessPresent = false;
  let d4AccessRecordId: string | null = null;
  let d4AccessRevisionFingerprint: string | null = null;
  if (input.accessAbsent === true && input.accessRecordId) fail("ACCESS_STATUS_CONTRADICTION");
  if (input.accessRecordId) {
    const accessId = explicit(input.accessRecordId, "D4_ACCESS_REQUIRED");
    const accessRevision = explicit(input.accessRevisionFingerprint ?? "", "D4_ACCESS_REVISION_REQUIRED");
    const access = store.d4?.records.find((row) => row.recordId === accessId);
    if (!access || access.fingerprint !== accessRevision) fail(access ? "D4_ACCESS_REVISION_MISMATCH" : "D4_ACCESS_NOT_FOUND");
    if (!(D5_R5_ACCESS_CLASSES as readonly string[]).includes(access.recordClass)) fail("D4_ACCESS_CLASS_MISMATCH");
    if (access.tenantId !== actor.tenantId || access.workspaceId !== actor.workspaceId || access.projectId !== actor.projectId) fail("CROSS_SCOPE_OPERATION");
    if (cited === "CURRENT" && access.recordStatus !== "CURRENT") fail("D4_ACCESS_NOT_CURRENT");
    d4AccessPresent = true;
    d4AccessRecordId = access.recordId;
    d4AccessRevisionFingerprint = access.fingerprint;
  }
  return {
    objectId: object.objectId,
    objectRevisionFingerprint: object.fingerprint,
    lineRecordId: line.lineRecordId,
    lineContextFingerprint: line.fingerprint,
    specificationId: specification.specificationId,
    specificationFingerprint: specification.fingerprint,
    componentRecordId: component.componentRecordId,
    componentRevisionFingerprint: component.fingerprint,
    connectionRecordId: connection.connectionRecordId,
    connectionRevisionFingerprint: connection.fingerprint,
    applicabilityRef,
    limitations: explicit(input.limitations, "LIMITATIONS_REQUIRED"),
    sourceBasisRef: explicit(input.sourceBasisRef, "SOURCE_BASIS_REQUIRED"),
    sourceBasisCategory: sourceBasisCategory as Bound["sourceBasisCategory"],
    provenanceRef: explicit(input.provenanceRef, "MISSING_PROVENANCE"),
    citedCurrentness: cited as Bound["citedCurrentness"],
    d4AccessPresent,
    d4AccessRecordId,
    d4AccessRevisionFingerprint,
  };
}

function requireEnd(store: D5R5Store, actor: D5R1Actor, objectId: string, revision: string) {
  const id = explicit(objectId, "ROUTE_END_REQUIRED");
  const fingerprint = explicit(revision, "ROUTE_END_REVISION_REQUIRED");
  const object = store.r4.r1.objects.find((row) => row.objectId === id);
  if (!object || object.fingerprint !== fingerprint) fail(object ? "ROUTE_END_REVISION_MISMATCH" : "ROUTE_END_NOT_FOUND");
  if (object.tenantId !== actor.tenantId) fail("CROSS_SCOPE_OPERATION");
  return object;
}

function status(store: D5R5Store, actor: D5R1Actor, fingerprint: string, predecessorId: string | null): Status {
  return {
    fingerprint,
    recordedBy: actor.actorId,
    recordedAt: store.now(),
    recordStatus: "CURRENT",
    currentness: "CURRENT",
    predecessorId,
    tenantId: actor.tenantId,
  };
}

export function createD5R5Store(r4: D5R4Store, d4: D5R5AccessStore | null = null, now: () => string = () => "2026-10-24T00:00:00.000Z"): D5R5Store {
  return { r4, d4, now, routes: [], arrangements: [], fabrications: [], isometrics: [], spools: [], welds: [], history: [] };
}

export function recordPipingRoutingContext(store: D5R5Store, actor: D5R1Actor, input: D5R5RouteInput): D5R5RouteRecord {
  const bound = prepare(store, actor, input, ["PIPING_ROUTE_CONTEXT"]);
  const routeRecordId = explicit(input.routeRecordId, "ROUTE_REQUIRED");
  const placement = explicit(input.placement, "PLACEMENT_REQUIRED");
  if (!(D5_R5_PLACEMENTS as readonly string[]).includes(placement)) fail("PLACEMENT_NOT_ALLOWLISTED");
  const source = requireEnd(store, actor, input.sourceObjectId, input.sourceRevisionFingerprint);
  const destination = requireEnd(store, actor, input.destinationObjectId, input.destinationRevisionFingerprint);
  const slope = measure(input.slope);
  const elevation = measure(input.elevation);
  const geometryContext = input.geometryContext == null || input.geometryContext === "" ? null : explicit(input.geometryContext, "GEOMETRY_CONTEXT_INVALID");
  const predecessor = input.predecessorId ? store.routes.find((row) => row.routeRecordId === input.predecessorId) : null;
  if (input.predecessorId && (!predecessor || predecessor.recordStatus !== "CURRENT" || predecessor.objectId !== bound.objectId)) fail("PREDECESSOR_NOT_CURRENT");
  const fingerprint = fingerprintCanonical({
    routeRecordId, ...bound, routeSegment: explicit(input.routeSegment, "ROUTE_SEGMENT_REQUIRED"),
    sourceObjectId: source.objectId, destinationObjectId: destination.objectId, placement, slope, elevation, geometryContext,
    predecessorId: predecessor?.routeRecordId ?? null,
  });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.routes.find((row) => row.routeRecordId === routeRecordId);
  if (existing) return existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId ? existing : fail("DUPLICATE_ROUTE_REJECTED");
  const duplicate = store.routes.find((row) => row.recordStatus === "CURRENT" && row.routeRecordId !== predecessor?.routeRecordId && row.objectId === bound.objectId && row.objectRevisionFingerprint === bound.objectRevisionFingerprint);
  if (duplicate) fail("DUPLICATE_ROUTE_REJECTED");
  const record: D5R5RouteRecord = Object.freeze({
    ...bound,
    routeRecordId,
    routeSegment: explicit(input.routeSegment, "ROUTE_SEGMENT_REQUIRED"),
    sourceObjectId: source.objectId,
    sourceRevisionFingerprint: source.fingerprint,
    destinationObjectId: destination.objectId,
    destinationRevisionFingerprint: destination.fingerprint,
    placement: placement as D5R5RouteRecord["placement"],
    routingConstraint: explicit(input.routingConstraint, "ROUTING_CONSTRAINT_REQUIRED"),
    slope,
    elevation,
    geometryContext,
    drainVentRequirement: input.drainVentRequirement == null || input.drainVentRequirement === "" ? null : explicit(input.drainVentRequirement, "DRAIN_VENT_INVALID"),
    accessConstraint: input.accessConstraint == null || input.accessConstraint === "" ? null : explicit(input.accessConstraint, "ACCESS_CONSTRAINT_INVALID"),
    clashFree: false,
    constructable: false,
    optimized: false,
    stressValidated: false,
    hydraulicValidation: false,
    geometrySolved: false,
    inferred: false,
    ...status(store, actor, fingerprint, predecessor?.routeRecordId ?? null),
  });
  if (predecessor) {
    const index = store.routes.findIndex((row) => row.routeRecordId === predecessor.routeRecordId);
    const superseded = Object.freeze({ ...predecessor, recordStatus: "SUPERSEDED" as const, currentness: "SUPERSEDED" as const });
    store.routes[index] = superseded;
    remember(store, "ROUTE", superseded.routeRecordId, "SUPERSEDED", superseded.fingerprint);
  }
  store.routes.push(record);
  remember(store, "ROUTE", record.routeRecordId, "CREATED", record.fingerprint);
  return record;
}

export function recordPipingArrangementContext(store: D5R5Store, actor: D5R1Actor, input: D5R5ArrangementInput): D5R5ArrangementRecord {
  const bound = prepare(store, actor, input, ["PIPING_ROUTE_CONTEXT"]);
  const arrangementRecordId = explicit(input.arrangementRecordId, "ARRANGEMENT_REQUIRED");
  const placement = explicit(input.placement, "PLACEMENT_REQUIRED");
  if (!(D5_R5_PLACEMENTS as readonly string[]).includes(placement)) fail("PLACEMENT_NOT_ALLOWLISTED");
  const arrangementStatement = explicit(input.arrangementStatement, "ARRANGEMENT_STATEMENT_REQUIRED");
  const fingerprint = fingerprintCanonical({ arrangementRecordId, arrangementStatement, placement, ...bound });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.arrangements.find((row) => row.arrangementRecordId === arrangementRecordId);
  if (existing) return existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId ? existing : fail("DUPLICATE_ARRANGEMENT_REJECTED");
  const record: D5R5ArrangementRecord = Object.freeze({
    ...bound, arrangementRecordId, arrangementStatement, placement: placement as D5R5ArrangementRecord["placement"],
    spatialValidation: false, clashFree: false, accessValidated: false, maintainabilityValidated: false,
    ...status(store, actor, fingerprint, null),
  });
  store.arrangements.push(record);
  remember(store, "ARRANGEMENT", record.arrangementRecordId, "CREATED", record.fingerprint);
  return record;
}

export function recordPipingFabricationContext(store: D5R5Store, actor: D5R1Actor, input: D5R5FabricationInput): D5R5FabricationRecord {
  const bound = prepare(store, actor, input, ["PIPING_FABRICATION_CONTEXT", "PIPING_ROUTE_CONTEXT"]);
  const fabricationRecordId = explicit(input.fabricationRecordId, "FABRICATION_REQUIRED");
  const fabricationClass = explicit(input.fabricationClass, "FABRICATION_CLASS_REQUIRED");
  if (!(D5_R5_FABRICATION_CLASSES as readonly string[]).includes(fabricationClass)) fail("FABRICATION_CLASS_NOT_ALLOWLISTED");
  const fabricationStatus = explicit(input.fabricationStatus, "FABRICATION_STATUS_REQUIRED");
  const fabricationRequirement = explicit(input.fabricationRequirement, "FABRICATION_REQUIREMENT_REQUIRED");
  const evidenceRef = explicit(input.evidenceRef, "FABRICATION_EVIDENCE_REQUIRED");
  const fingerprint = fingerprintCanonical({ fabricationRecordId, fabricationClass, fabricationStatus, fabricationRequirement, evidenceRef, ...bound });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.fabrications.find((row) => row.fabricationRecordId === fabricationRecordId);
  if (existing) return existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId ? existing : fail("DUPLICATE_FABRICATION_REJECTED");
  const record: D5R5FabricationRecord = Object.freeze({
    ...bound, fabricationRecordId, fabricationClass: fabricationClass as D5R5FabricationRecord["fabricationClass"],
    fabricationStatus, fabricationRequirement, evidenceRef, fabricationComplete: false, engineeringValidated: false,
    ...status(store, actor, fingerprint, null),
  });
  store.fabrications.push(record);
  remember(store, "FABRICATION", record.fabricationRecordId, "CREATED", record.fingerprint);
  return record;
}

export function recordPipingIsometricContext(store: D5R5Store, actor: D5R1Actor, input: D5R5IsometricInput): D5R5IsometricRecord {
  const bound = prepare(store, actor, input, ["PIPING_FABRICATION_CONTEXT", "PIPING_ROUTE_CONTEXT"]);
  const isometricRecordId = explicit(input.isometricRecordId, "ISOMETRIC_REQUIRED");
  const documentId = explicit(input.documentId, "DOCUMENT_REQUIRED");
  const documentRevision = explicit(input.documentRevision, "DOCUMENT_REVISION_REQUIRED");
  const predecessor = input.predecessorId ? store.isometrics.find((row) => row.isometricRecordId === input.predecessorId) : null;
  if (input.predecessorId && (!predecessor || predecessor.recordStatus !== "CURRENT" || predecessor.objectId !== bound.objectId)) fail("PREDECESSOR_NOT_CURRENT");
  const fingerprint = fingerprintCanonical({ isometricRecordId, documentId, documentRevision, ...bound, predecessorId: predecessor?.isometricRecordId ?? null });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.isometrics.find((row) => row.isometricRecordId === isometricRecordId);
  if (existing) return existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId ? existing : fail("DUPLICATE_ISOMETRIC_REJECTED");
  const record: D5R5IsometricRecord = Object.freeze({
    ...bound, isometricRecordId, documentId, documentRevision, isometricEqualsIdentity: false, engineeringValidated: false,
    ...status(store, actor, fingerprint, predecessor?.isometricRecordId ?? null),
  });
  if (predecessor) {
    const index = store.isometrics.findIndex((row) => row.isometricRecordId === predecessor.isometricRecordId);
    const superseded = Object.freeze({ ...predecessor, recordStatus: "SUPERSEDED" as const, currentness: "SUPERSEDED" as const });
    store.isometrics[index] = superseded;
    remember(store, "ISOMETRIC", superseded.isometricRecordId, "SUPERSEDED", superseded.fingerprint);
  }
  store.isometrics.push(record);
  remember(store, "ISOMETRIC", record.isometricRecordId, "CREATED", record.fingerprint);
  return record;
}

export function recordPipingSpoolContext(store: D5R5Store, actor: D5R1Actor, input: D5R5SpoolInput): D5R5SpoolRecord {
  const bound = prepare(store, actor, input, ["PIPING_FABRICATION_CONTEXT", "PIPING_ROUTE_CONTEXT"]);
  const spoolRecordId = explicit(input.spoolRecordId, "SPOOL_REQUIRED");
  const spoolTag = explicit(input.spoolTag, "SPOOL_TAG_REQUIRED");
  const fingerprint = fingerprintCanonical({ spoolRecordId, spoolTag, ...bound });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.spools.find((row) => row.spoolRecordId === spoolRecordId);
  if (existing) return existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId ? existing : fail("DUPLICATE_SPOOL_REJECTED");
  const record: D5R5SpoolRecord = Object.freeze({
    ...bound, spoolRecordId, spoolTag, fabricated: false, documentValidated: false, ...status(store, actor, fingerprint, null),
  });
  store.spools.push(record);
  remember(store, "SPOOL", record.spoolRecordId, "CREATED", record.fingerprint);
  return record;
}

export function recordPipingWeldJointContext(store: D5R5Store, actor: D5R1Actor, input: D5R5WeldInput): D5R5WeldRecord {
  const bound = prepare(store, actor, input, ["PIPING_FABRICATION_CONTEXT", "PIPING_ROUTE_CONTEXT"]);
  const weldRecordId = explicit(input.weldRecordId, "WELD_REQUIRED");
  const jointType = explicit(input.jointType, "JOINT_TYPE_REQUIRED");
  if (!(D5_R5_JOINT_TYPES as readonly string[]).includes(jointType)) fail("JOINT_TYPE_NOT_ALLOWLISTED");
  const fingerprint = fingerprintCanonical({ weldRecordId, jointType, ...bound });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.welds.find((row) => row.weldRecordId === weldRecordId);
  if (existing) return existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId ? existing : fail("DUPLICATE_WELD_REJECTED");
  const record: D5R5WeldRecord = Object.freeze({
    ...bound, weldRecordId, jointType: jointType as D5R5WeldRecord["jointType"],
    weldAccepted: false, ndePassed: false, codeConformant: false, ...status(store, actor, fingerprint, null),
  });
  store.welds.push(record);
  remember(store, "WELD", record.weldRecordId, "CREATED", record.fingerprint);
  return record;
}

export function mutatePipingRoutingContext(): never {
  return fail("CONTEXT_MUTATION_REJECTED");
}

export function repointPipingRoutingContext(): never {
  return fail("AUTO_REPOINT_REJECTED");
}

export function solvePipingGeometry(): never {
  return fail("SPATIAL_SOLVER_NOT_IN_R5");
}

export function detectPipingClash(): never {
  return fail("SPATIAL_SOLVER_NOT_IN_R5");
}

export function calculatePiping(): never {
  return fail("CALCULATION_NOT_IN_R5");
}

export function recordPipingStressSupport(): never {
  return fail("STRESS_SUPPORT_NOT_IN_R5");
}

export function validatePipingEngineering(): never {
  return fail("VALIDATION_NOT_IN_R5");
}
