/**
 * EOS-D2-R6 Civil utility and corridor context.
 * Binds to exact R1 identity and applicable R2 through R5 references.
 * Does not design the discipline systems that may occupy the corridor.
 */
import {
  D2_ABSORBS_D4_MECHANICAL,
  D2_ABSORBS_D5_PIPING,
  D2_ABSORBS_D6_PROCESS,
  D2_ABSORBS_D7_ELECTRICAL,
  D2_ABSORBS_D8_INSTRUMENTATION_CONTROL,
  D2_CURRENTNESS_STATES,
  D2_IMPLEMENTATION_PHASES,
  D2_MATURITY_STATES,
  D2_OWNS_D4_D8_ENGINEERING_TRUTH,
} from "@rtb/types";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import {
  D2_CIVIL_IDENTITY_AND_OBJECT_FOUNDATION_RUNTIME_READY as R1_IDENTITY_READY,
  D2_CONTEXT_AUTHORITY,
  D2_DISCIPLINE,
  D2_EXPLICIT_RELATIONSHIP_KINDS,
  type D2R1Actor,
} from "./identity-foundation";
import { D2_SURVEY_SPATIAL_SURFACE_RUNTIME_READY as R2_SPATIAL_READY } from "./spatial-surface-context";
import { D2_GRADING_EARTHWORKS_RUNTIME_READY as R3_GRADING_READY } from "./grading-earthworks-context";
import { D2_ROADS_ACCESS_RUNTIME_READY as R4_ROADS_READY } from "./roads-access-context";
import {
  D2_DRAINAGE_STORMWATER_RUNTIME_READY as R5_DRAINAGE_READY,
  type D2R5Store,
} from "./drainage-stormwater-context";

export const D2_R6_STATUS = "CIVIL_UTILITY_AND_CORRIDOR_CONTEXT_IMPLEMENTED" as const;
export const D2_R6_MATURITY = "CIVIL_UTILITY_AND_CORRIDOR_CONTEXT_IMPLEMENTED" as const;
export const D2_R6_MATURITY_STATE = D2_R6_MATURITY;
export const D2_R6_CLOSEOUT_PATH = "docs/architecture/engineering-os/EOS_D2_R6_CIVIL_UTILITY_AND_CORRIDOR_CONTEXT_CLOSEOUT.md" as const;
export const D2_RUNTIME_STARTED = true as const;
export const D2_RUNTIME_COUNT = 6 as const;
export const D2_CIVIL_IDENTITY_AND_OBJECT_FOUNDATION_RUNTIME_READY = R1_IDENTITY_READY;
export const D2_SURVEY_SPATIAL_SURFACE_RUNTIME_READY = R2_SPATIAL_READY;
export const D2_GRADING_EARTHWORKS_RUNTIME_READY = R3_GRADING_READY;
export const D2_ROADS_ACCESS_RUNTIME_READY = R4_ROADS_READY;
export const D2_DRAINAGE_STORMWATER_RUNTIME_READY = R5_DRAINAGE_READY;
export const D2_CIVIL_UTILITY_CORRIDOR_RUNTIME_READY = true as const;
export const D2_R1_CIVIL_IDENTITY_REUSED = true as const;
export const D2_R2_SPATIAL_SURFACE_CONTEXT_REUSED = true as const;
export const D2_R3_GRADING_EARTHWORKS_CONTEXT_REUSED = true as const;
export const D2_R4_ROADS_ACCESS_CONTEXT_REUSED = true as const;
export const D2_R5_DRAINAGE_STORMWATER_CONTEXT_REUSED = true as const;
export const EXACT_R1_CIVIL_CONTEXT_REFERENCE_REQUIRED = true as const;
export const EXACT_UPSTREAM_UTILITY_CONTEXT_REFERENCE_REQUIRED = true as const;
export const FLOATING_UPSTREAM_UTILITY_REFERENCE_ALLOWED = false as const;
export const D2_CIVIL_UTILITY_CORRIDOR_CONTEXT_RUNTIME_IMPLEMENTED = true as const;
export const D2_CIVIL_UTILITY_CORRIDOR_CONTEXT_RUNTIME_COUNT = 1 as const;
export const D2_EQUALS_D4_MECHANICAL_AUTHORITY = D2_ABSORBS_D4_MECHANICAL;
export const D2_EQUALS_D5_PIPING_AUTHORITY = D2_ABSORBS_D5_PIPING;
export const D2_EQUALS_D6_PROCESS_AUTHORITY = D2_ABSORBS_D6_PROCESS;
export const D2_EQUALS_D7_ELECTRICAL_AUTHORITY = D2_ABSORBS_D7_ELECTRICAL;
export const D2_EQUALS_D8_INSTRUMENTATION_CONTROL_AUTHORITY = D2_ABSORBS_D8_INSTRUMENTATION_CONTROL;
export { D2_OWNS_D4_D8_ENGINEERING_TRUTH };
export const UTILITY_CONTEXT_PRESENT_EQUALS_UTILITY_DESIGN_COMPLETE = false as const;
export const UTILITY_CORRIDOR_PRESENT_EQUALS_DISCIPLINE_SYSTEM_VALIDATED = false as const;
export const CROSSING_CONTEXT_PRESENT_EQUALS_CONFLICT_RESOLVED = false as const;
export const AI_CAN_INVENT_AUTHORITATIVE_UTILITY_CLEARANCE_CRITERIA = false as const;
export const D2_UTILITY_CRITERION_KINDS = [
  "CORRIDOR_CLASSIFICATION",
  "CLEARANCE_SEPARATION",
  "RESERVED_SPACE",
  "STRUCTURE_INTERFACE",
] as const;
export const D2_UTILITY_RELATIONSHIP_ROLES = [
  "CORRIDOR_TO_SITE",
  "CORRIDOR_TO_GRADING",
  "CORRIDOR_TO_ROAD",
  "CORRIDOR_TO_DRAINAGE",
  "ROAD_CROSSING",
  "DRAINAGE_CROSSING",
  "CORRIDOR_CROSSING",
  "STRUCTURE_INTERFACE",
  "RESERVED_SPACE_CONFLICT",
] as const;
export const D2_R6_CAN_REFERENCE_GOVERNED_ASSUMPTIONS = true as const;
export const D2_R6_CREATES_PARALLEL_ASSUMPTION_GOVERNANCE = false as const;
export const D2_R6_CAN_REFERENCE_GOVERNED_EVIDENCE = true as const;
export const UTILITY_EVIDENCE_PRESENT_EQUALS_ENGINEERING_VALIDATED = false as const;
export const CANONICAL_CURRENTNESS_REUSED = true as const;
export const PARALLEL_D2_CURRENTNESS_ENGINE_CREATED = false as const;
export const D2_UTILITY_CORRIDOR_CONTEXT_AUTO_REPOINTED = false as const;
export const TENANT_WORKSPACE_PROJECT_D2_UTILITY_SCOPE_ENFORCED = true as const;
export const D2_UTILITY_CORRIDOR_PROVENANCE_REQUIRED = true as const;
export const D2_UTILITY_CORRIDOR_PROVENANCE_PRESERVED = true as const;
export const CANONICAL_FINGERPRINT_REUSED = true as const;
export const SECOND_FINGERPRINT_ALGORITHM_CREATED = false as const;
export const D2_CANONICAL_FINGERPRINT_REUSED = true as const;
export const D2_SECOND_FINGERPRINT_ALGORITHM_CREATED = false as const;
export const D2_UTILITY_CORRIDOR_FINGERPRINT_IMPLEMENTED = true as const;
export const AI_EQUALS_D2_CIVIL_ENGINEERING_AUTHORITY = false as const;
export const ADMIN_EQUALS_D2_CIVIL_ENGINEERING_AUTHORITY = false as const;
export const SILENT_D2_UTILITY_CORRIDOR_MUTATION_ALLOWED = false as const;
export const D2_UTILITY_CORRIDOR_HISTORY_PRESERVED = true as const;

export const D2_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY = false as const;
export const D2_DISCIPLINE_INTERFACE_RUNTIME_READY = false as const;
export const D2_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_READY = false as const;
export const D2_CURRENTNESS_DIGITAL_THREAD_RUNTIME_READY = false as const;
export const D2_D9_SOURCE_CONTRACT_RUNTIME_READY = false as const;
export const D2_AUTOMATIC_UTILITY_ROUTING_RUNTIME_COUNT = 0 as const;
export const D2_UTILITY_ROUTE_OPTIMIZATION_RUNTIME_COUNT = 0 as const;
export const D2_AUTOMATIC_UTILITY_CONFLICT_RESOLUTION_RUNTIME_COUNT = 0 as const;
export const D2_UTILITY_SIZING_RUNTIME_COUNT = 0 as const;
export const D2_UTILITY_CAPACITY_CALCULATION_RUNTIME_COUNT = 0 as const;
export const D2_UTILITY_QUANTITY_CALCULATION_RUNTIME_COUNT = 0 as const;
export const D2_TRENCH_QUANTITY_CALCULATION_RUNTIME_COUNT = 0 as const;
export const D2_EXCAVATION_QUANTITY_CALCULATION_RUNTIME_COUNT = 0 as const;
export const D2_ELECTRICAL_DESIGN_RUNTIME_COUNT = 0 as const;
export const D2_MECHANICAL_DESIGN_RUNTIME_COUNT = 0 as const;
export const D2_PIPING_DESIGN_RUNTIME_COUNT = 0 as const;
export const D2_PROCESS_DESIGN_RUNTIME_COUNT = 0 as const;
export const D2_INSTRUMENTATION_CONTROL_DESIGN_RUNTIME_COUNT = 0 as const;
export const D2_AUTOMATIC_GRADING_DESIGN_RUNTIME_COUNT = 0 as const;
export const D2_EARTHWORKS_CALCULATION_RUNTIME_COUNT = 0 as const;
export const D2_ROAD_GEOMETRIC_DESIGN_RUNTIME_COUNT = 0 as const;
export const D2_HYDROLOGY_CALCULATION_RUNTIME_COUNT = 0 as const;
export const D2_HYDRAULIC_CALCULATION_RUNTIME_COUNT = 0 as const;
export const D2_CIVIL_VALIDATION_RUNTIME_COUNT = 0 as const;
export const D2_CIVIL_APPROVAL_RUNTIME_COUNT = 0 as const;
export const D2_CIVIL_CERTIFICATION_RUNTIME_COUNT = 0 as const;
export const D2_D1_RUNTIME_INTEGRATION_COUNT = 0 as const;
export const D2_D3_RUNTIME_INTEGRATION_COUNT = 0 as const;
export const D2_D4_D8_RUNTIME_INTEGRATION_COUNT = 0 as const;
export const D2_D9_RUNTIME_INTEGRATION_COUNT = 0 as const;
export const D3_RUNTIME_STARTED = false as const;
export const D4_RUNTIME_STARTED = false as const;
export const D5_RUNTIME_STARTED = false as const;
export const D6_RUNTIME_STARTED = false as const;
export const D7_RUNTIME_STARTED = false as const;
export const D8_RUNTIME_STARTED = false as const;
export const D9_RUNTIME_STARTED = false as const;
export const D3_D9_RUNTIME_STARTED = false as const;
export const DATABASE_SCHEMA_CHANGED = false as const;
export const NEW_DEPENDENCY_ADDED = false as const;

export const D2_R7_CANONICAL_PHASE = D2_IMPLEMENTATION_PHASES[6];
export const D2_R7_PHASE_TYPE = "REQUIREMENTS_ASSUMPTIONS_AND_CHANGE" as const;
export const D2_R7_CANONICAL_SCOPE =
  "Implement governed Civil requirements, assumptions, decisions/change context using canonical EOS primitives and exact D2 object references. Record requirement applicability, assumption provenance, decision rationale, explicit affected-object relationships and change/reassessment context. Do not automatically redesign Civil objects, infer undocumented dependencies, perform calculations, validate engineering, approve engineering, certify, or start D3-D9." as const;
export const D2_R7_STARTED = false as const;
export const D2_R6_READY_FOR_NEXT_PHASE = true as const;
export const D2_R6_NEXT_PHASE = D2_R7_CANONICAL_PHASE;
export const D2_R6_NEXT_PHASE_TYPE = D2_R7_PHASE_TYPE;
export const D2_R6_CANONICAL_NEXT_PHASE = D2_R7_CANONICAL_PHASE;
export const D2_R6_CANONICAL_NEXT_PHASE_SCOPE = D2_R7_CANONICAL_SCOPE;
export const D2_R6_BLOCKER = "NONE" as const;
export const D2_R6_MACHINE_READABLE_ROADMAP_UPDATED = true as const;

const FLOATING = new Set(["latest", "current", "newest", "head", "active", "active model"]);
const INFERRED = new Set(["inferred", "unknown", "auto", "default"]);

type Citation = { kind: string; suppliedValue: string; sourceRef: string };
type Prohibited = {
  inventClearanceCriteria?: boolean;
  generateRoute?: boolean;
  optimizeRoute?: boolean;
  resolveConflict?: boolean;
  sizeUtility?: boolean;
  capacityCalculation?: boolean;
  quantityCalculation?: boolean;
  trenchQuantity?: boolean;
  excavationQuantity?: boolean;
  electricalDesign?: boolean;
  mechanicalDesign?: boolean;
  pipingDesign?: boolean;
  processDesign?: boolean;
  instrumentationDesign?: boolean;
  gradingDesign?: boolean;
  roadDesign?: boolean;
  hydrology?: boolean;
  hydraulics?: boolean;
  validation?: boolean;
  approval?: boolean;
  certification?: boolean;
  inferRelationship?: boolean;
  repoint?: boolean;
  d1Integration?: boolean;
  d3Integration?: boolean;
  d4Integration?: boolean;
  d9Reasoning?: boolean;
};

export type D2R6UtilityInput = Prohibited & {
  utilityContextId: string;
  contextId: string;
  corridorObjectId: string;
  trenchObjectIds: readonly string[];
  pitObjectIds: readonly string[];
  crossingObjectIds: readonly string[];
  clearanceEnvelopeObjectId: string | null;
  reservedSpaceReference: string | null;
  spatialReferenceId: string;
  surfaceContextIds: readonly string[];
  gradingContextId: string | null;
  roadsContextId: string | null;
  drainageContextId: string | null;
  criteria: readonly Citation[];
  relationships: readonly { kind: string; utilityRole: string; targetObjectId: string }[];
  assumptionObjectIds: readonly string[];
  evidenceObjectIds: readonly string[];
  citedLifecycleStage: string;
  provenanceRef: string;
  citedCurrentness: string;
  assertedFingerprint?: string;
  predecessorUtilityContextId?: string | null;
  tenantId?: string;
  workspaceId?: string;
  projectId?: string;
};

type UtilityCriterion = { kind: (typeof D2_UTILITY_CRITERION_KINDS)[number]; suppliedValue: string; sourceRef: string };
type UtilityRelationship = {
  kind: (typeof D2_EXPLICIT_RELATIONSHIP_KINDS)[number];
  utilityRole: (typeof D2_UTILITY_RELATIONSHIP_ROLES)[number];
  targetObjectId: string;
};

export type D2R6UtilityRecord = {
  utilityContextId: string;
  contextId: string;
  corridorObjectId: string;
  trenchObjectIds: readonly string[];
  pitObjectIds: readonly string[];
  crossingObjectIds: readonly string[];
  clearanceEnvelopeObjectId: string | null;
  reservedSpaceReference: string | null;
  spatialReferenceId: string;
  surfaceContextIds: readonly string[];
  gradingContextId: string | null;
  roadsContextId: string | null;
  drainageContextId: string | null;
  criteria: readonly UtilityCriterion[];
  relationships: readonly UtilityRelationship[];
  assumptionObjectIds: readonly string[];
  evidenceObjectIds: readonly string[];
  citedLifecycleStage: (typeof D2_MATURITY_STATES)[number];
  provenanceRef: string;
  citedCurrentness: (typeof D2_CURRENTNESS_STATES)[number];
  authority: typeof D2_CONTEXT_AUTHORITY;
  civilEngineeringAuthority: false;
  mechanicalAuthority: false;
  pipingAuthority: false;
  processAuthority: false;
  electricalAuthority: false;
  instrumentationAuthority: false;
  utilityDesignComplete: false;
  disciplineSystemValidated: false;
  conflictResolved: false;
  routeGenerated: false;
  routeOptimized: false;
  utilitySized: false;
  capacityCalculated: false;
  quantityCalculated: false;
  engineeringValidated: false;
  engineeringApproved: false;
  fingerprint: string;
  recordedBy: string;
  recordedAt: string;
  recordStatus: "CURRENT" | "SUPERSEDED";
  predecessorUtilityContextId: string | null;
  tenantId: string;
  workspaceId: string;
  projectId: string;
};

export type D2R6History = {
  historyId: string;
  subjectKind: "UTILITY_CORRIDOR";
  subjectId: string;
  action: "CREATED" | "SUPERSEDED";
  fingerprint: string;
  recordedAt: string;
};

export type D2R6Store = {
  r5: D2R5Store;
  now: () => string;
  utilities: D2R6UtilityRecord[];
  history: D2R6History[];
};

function fail(code: string): never {
  throw new Error(code);
}

function blockedParty(value: string): boolean {
  return /^AI(?:\b|_)/i.test(value) || /LLM/i.test(value) || /OPTIMIZER/i.test(value);
}

function explicit(value: string, code: string): string {
  const token = value.trim();
  if (!token || FLOATING.has(token.toLowerCase()) || INFERRED.has(token.toLowerCase()) || blockedParty(token)) fail(code);
  return token;
}

function optionalExplicit(value: string | null | undefined, missingCode: string, invalidCode: string): string | null {
  if (value === undefined) fail(missingCode);
  if (value === null) return null;
  return explicit(value, invalidCode);
}

function isCurrentness(value: string): value is (typeof D2_CURRENTNESS_STATES)[number] {
  return (D2_CURRENTNESS_STATES as readonly string[]).includes(value);
}

function isMaturity(value: string): value is (typeof D2_MATURITY_STATES)[number] {
  return (D2_MATURITY_STATES as readonly string[]).includes(value);
}

function assertActor(actor: D2R1Actor): void {
  if (!actor.actorId.trim() || !actor.tenantId.trim() || !actor.workspaceId.trim() || !actor.projectId.trim()) fail("SCOPE_REQUIRED");
  if (blockedParty(actor.actorId) || blockedParty(actor.authority)) fail("AI_NOT_CIVIL_AUTHORITY");
  if (actor.authority === "ADMINISTRATOR" || actor.authority === "ADMIN") fail("ADMIN_NOT_CIVIL_AUTHORITY");
  if (actor.authority === "CIVIL_ENGINEERING_AUTHORITY") fail("RECORDER_NOT_CIVIL_ENGINEERING_AUTHORITY");
  if (actor.authority !== D2_CONTEXT_AUTHORITY) fail("UNAUTHORIZED");
}

function assertScope(actor: D2R1Actor, input: { tenantId?: string; workspaceId?: string; projectId?: string }): void {
  if (input.tenantId != null && input.tenantId !== actor.tenantId) fail("CROSS_TENANT_OPERATION");
  if (input.workspaceId != null && input.workspaceId !== actor.workspaceId) fail("CROSS_WORKSPACE_OPERATION");
  if (input.projectId != null && input.projectId !== actor.projectId) fail("CROSS_PROJECT_OPERATION");
}

function assertProhibited(input: Prohibited): void {
  if (input.inventClearanceCriteria === true) fail("CLEARANCE_CRITERIA_NOT_INVENTED");
  if (input.generateRoute === true) fail("ROUTE_GENERATION_NOT_IN_R6");
  if (input.optimizeRoute === true) fail("ROUTE_OPTIMIZATION_NOT_IN_R6");
  if (input.resolveConflict === true) fail("CONFLICT_RESOLUTION_NOT_IN_R6");
  if (input.sizeUtility === true) fail("UTILITY_SIZING_NOT_IN_R6");
  if (input.capacityCalculation === true) fail("UTILITY_CAPACITY_NOT_IN_R6");
  if (input.quantityCalculation === true) fail("UTILITY_QUANTITY_NOT_IN_R6");
  if (input.trenchQuantity === true) fail("TRENCH_QUANTITY_NOT_IN_R6");
  if (input.excavationQuantity === true) fail("EXCAVATION_QUANTITY_NOT_IN_R6");
  if (input.electricalDesign === true) fail("ELECTRICAL_DESIGN_NOT_IN_R6");
  if (input.mechanicalDesign === true) fail("MECHANICAL_DESIGN_NOT_IN_R6");
  if (input.pipingDesign === true) fail("PIPING_DESIGN_NOT_IN_R6");
  if (input.processDesign === true) fail("PROCESS_DESIGN_NOT_IN_R6");
  if (input.instrumentationDesign === true) fail("INSTRUMENTATION_DESIGN_NOT_IN_R6");
  if (input.gradingDesign === true) fail("GRADING_CHANGE_NOT_IN_R6");
  if (input.roadDesign === true) fail("ROAD_DESIGN_NOT_IN_R6");
  if (input.hydrology === true) fail("HYDROLOGY_NOT_IN_R6");
  if (input.hydraulics === true) fail("HYDRAULICS_NOT_IN_R6");
  if (input.validation === true) fail("VALIDATION_NOT_IN_R6");
  if (input.approval === true) fail("APPROVAL_NOT_IN_R6");
  if (input.certification === true) fail("CERTIFICATION_NOT_IN_R6");
  if (input.inferRelationship === true) fail("INFERRED_RELATIONSHIP_REJECTED");
  if (input.repoint === true) fail("AUTO_REPOINT_REJECTED");
  if (input.d1Integration === true || input.d3Integration === true || input.d4Integration === true || input.d9Reasoning === true) fail("OTHER_DISCIPLINE_NOT_IN_R6");
}

function currentnessOf(value: string): (typeof D2_CURRENTNESS_STATES)[number] {
  if (!isCurrentness(value.trim())) fail("CURRENTNESS_INVALID");
  return value.trim() as (typeof D2_CURRENTNESS_STATES)[number];
}

function maturityOf(value: string): (typeof D2_MATURITY_STATES)[number] {
  if (!isMaturity(value.trim())) fail("MATURITY_INVALID");
  return value.trim() as (typeof D2_MATURITY_STATES)[number];
}

function requireContext(store: D2R6Store, actor: D2R1Actor, contextId: string, citedCurrentness: (typeof D2_CURRENTNESS_STATES)[number]) {
  const id = explicit(contextId, "R1_CONTEXT_REQUIRED");
  const context = store.r5.r4.r3.r2.r1.contexts.find((row) => row.contextId === id);
  if (!context) fail("R1_CONTEXT_NOT_FOUND");
  if (context.tenantId !== actor.tenantId) fail("CROSS_TENANT_OPERATION");
  if (context.workspaceId !== actor.workspaceId) fail("CROSS_WORKSPACE_OPERATION");
  if (context.projectId !== actor.projectId) fail("CROSS_PROJECT_OPERATION");
  if (context.discipline !== D2_DISCIPLINE) fail("DISCIPLINE_NOT_CIVIL");
  if (citedCurrentness === "CURRENT" && context.recordStatus !== "CURRENT") fail("R1_CONTEXT_NOT_CURRENT");
  return context;
}

function requireObject(store: D2R6Store, actor: D2R1Actor, contextId: string, objectId: string, objectType: string, citedCurrentness: (typeof D2_CURRENTNESS_STATES)[number], code: string) {
  const id = explicit(objectId, code);
  const object = store.r5.r4.r3.r2.r1.objects.find((row) => row.objectId === id);
  if (!object || object.objectType !== objectType || object.contextId !== contextId) fail(code);
  if (object.tenantId !== actor.tenantId || object.workspaceId !== actor.workspaceId || object.projectId !== actor.projectId) fail("CROSS_SCOPE_OPERATION");
  if (citedCurrentness === "CURRENT" && object.recordStatus !== "CURRENT") fail("R1_OBJECT_NOT_CURRENT");
  return object;
}

function requireOptionalObject(store: D2R6Store, actor: D2R1Actor, contextId: string, objectId: string | null | undefined, objectType: string, citedCurrentness: (typeof D2_CURRENTNESS_STATES)[number], missingCode: string, invalidCode: string): string | null {
  if (objectId === undefined) fail(missingCode);
  if (objectId === null) return null;
  return requireObject(store, actor, contextId, objectId, objectType, citedCurrentness, invalidCode).objectId;
}

function requireObjectIds(store: D2R6Store, actor: D2R1Actor, contextId: string, objectIds: readonly string[] | undefined, objectType: string, citedCurrentness: (typeof D2_CURRENTNESS_STATES)[number], code: string): string[] {
  if (!Array.isArray(objectIds)) fail(code);
  const ids = [...new Set(objectIds.map((id) => explicit(id, code)))].sort();
  for (const id of ids) requireObject(store, actor, contextId, id, objectType, citedCurrentness, code);
  return ids;
}

function requireSpatial(store: D2R6Store, actor: D2R1Actor, contextId: string, spatialReferenceId: string, citedCurrentness: (typeof D2_CURRENTNESS_STATES)[number]) {
  const id = explicit(spatialReferenceId, "R2_SPATIAL_REQUIRED");
  const spatial = store.r5.r4.r3.r2.spatial.find((row) => row.spatialReferenceId === id);
  if (!spatial || spatial.contextId !== contextId || spatial.tenantId !== actor.tenantId) fail("R2_SPATIAL_NOT_FOUND");
  if (citedCurrentness === "CURRENT" && spatial.recordStatus !== "CURRENT") fail("R2_SPATIAL_NOT_CURRENT");
  return spatial;
}

function requireSurfaces(store: D2R6Store, actor: D2R1Actor, contextId: string, surfaceContextIds: readonly string[], citedCurrentness: (typeof D2_CURRENTNESS_STATES)[number]): string[] {
  if (!Array.isArray(surfaceContextIds) || surfaceContextIds.length === 0) fail("R2_SURFACE_REQUIRED");
  const ids = [...new Set(surfaceContextIds.map((id) => explicit(id, "R2_SURFACE_REQUIRED")))].sort();
  for (const id of ids) {
    const surface = store.r5.r4.r3.r2.surfaces.find((row) => row.surfaceContextId === id);
    if (!surface || surface.contextId !== contextId || surface.tenantId !== actor.tenantId) fail("R2_SURFACE_NOT_FOUND");
    if (citedCurrentness === "CURRENT" && surface.recordStatus !== "CURRENT") fail("R2_SURFACE_NOT_CURRENT");
  }
  return ids;
}

function requireGrading(store: D2R6Store, actor: D2R1Actor, contextId: string, gradingContextId: string | null | undefined, citedCurrentness: (typeof D2_CURRENTNESS_STATES)[number]): string | null {
  if (gradingContextId === undefined) fail("R3_GRADING_REFERENCE_REQUIRED");
  if (gradingContextId === null) return null;
  const id = explicit(gradingContextId, "R3_GRADING_REQUIRED");
  const grading = store.r5.r4.r3.grading.find((row) => row.gradingContextId === id);
  if (!grading || grading.contextId !== contextId || grading.tenantId !== actor.tenantId) fail("R3_GRADING_NOT_FOUND");
  if (citedCurrentness === "CURRENT" && grading.recordStatus !== "CURRENT") fail("R3_GRADING_NOT_CURRENT");
  return grading.gradingContextId;
}

function requireRoads(store: D2R6Store, actor: D2R1Actor, contextId: string, roadsContextId: string | null | undefined, citedCurrentness: (typeof D2_CURRENTNESS_STATES)[number]): string | null {
  if (roadsContextId === undefined) fail("R4_ROADS_REFERENCE_REQUIRED");
  if (roadsContextId === null) return null;
  const id = explicit(roadsContextId, "R4_ROADS_REQUIRED");
  const roads = store.r5.r4.roads.find((row) => row.roadsContextId === id);
  if (!roads || roads.contextId !== contextId || roads.tenantId !== actor.tenantId) fail("R4_ROADS_NOT_FOUND");
  if (citedCurrentness === "CURRENT" && roads.recordStatus !== "CURRENT") fail("R4_ROADS_NOT_CURRENT");
  return roads.roadsContextId;
}

function requireDrainage(store: D2R6Store, actor: D2R1Actor, contextId: string, drainageContextId: string | null | undefined, citedCurrentness: (typeof D2_CURRENTNESS_STATES)[number]): string | null {
  if (drainageContextId === undefined) fail("R5_DRAINAGE_REFERENCE_REQUIRED");
  if (drainageContextId === null) return null;
  const id = explicit(drainageContextId, "R5_DRAINAGE_REQUIRED");
  const drainage = store.r5.drainage.find((row) => row.drainageContextId === id);
  if (!drainage || drainage.contextId !== contextId || drainage.tenantId !== actor.tenantId) fail("R5_DRAINAGE_NOT_FOUND");
  if (citedCurrentness === "CURRENT" && drainage.recordStatus !== "CURRENT") fail("R5_DRAINAGE_NOT_CURRENT");
  return drainage.drainageContextId;
}

function requireGovernedObjects(store: D2R6Store, actor: D2R1Actor, contextId: string, objectIds: readonly string[] | undefined, objectType: "CIVIL_ASSUMPTION" | "CIVIL_EVIDENCE_REFERENCE", missingCode: string): string[] {
  if (!Array.isArray(objectIds)) fail(missingCode);
  const ids = [...new Set(objectIds.map((id) => explicit(id, missingCode)))].sort();
  for (const id of ids) {
    const object = store.r5.r4.r3.r2.r1.objects.find((row) => row.objectId === id);
    if (!object || object.objectType !== objectType || object.contextId !== contextId || object.tenantId !== actor.tenantId) fail(missingCode);
  }
  return ids;
}

function normalizeCriteria(items: readonly Citation[] | undefined): UtilityCriterion[] {
  if (!Array.isArray(items)) fail("UTILITY_CRITERIA_REQUIRED");
  const normalized = items.map((item) => {
    if (!(D2_UTILITY_CRITERION_KINDS as readonly string[]).includes(item.kind)) fail("UTILITY_CRITERION_INVALID");
    return {
      kind: item.kind as (typeof D2_UTILITY_CRITERION_KINDS)[number],
      suppliedValue: explicit(item.suppliedValue, "UTILITY_CRITERION_INVALID"),
      sourceRef: explicit(item.sourceRef, "SOURCE_REFERENCE_REQUIRED"),
    };
  });
  return normalized.sort((left, right) => `${left.kind}|${left.suppliedValue}|${left.sourceRef}`.localeCompare(`${right.kind}|${right.suppliedValue}|${right.sourceRef}`));
}

function normalizeRelationships(store: D2R6Store, actor: D2R1Actor, contextId: string, links: D2R6UtilityInput["relationships"] | undefined): UtilityRelationship[] {
  if (!Array.isArray(links)) fail("UTILITY_RELATIONSHIPS_REQUIRED");
  const normalized = links.map((link) => {
    if (!(D2_EXPLICIT_RELATIONSHIP_KINDS as readonly string[]).includes(link.kind)) fail("RELATIONSHIP_KIND_NOT_EXPLICIT");
    if (!(D2_UTILITY_RELATIONSHIP_ROLES as readonly string[]).includes(link.utilityRole)) fail("UTILITY_ROLE_INVALID");
    const targetId = explicit(link.targetObjectId, "RELATIONSHIP_TARGET_REQUIRED");
    const target = store.r5.r4.r3.r2.r1.objects.find((row) => row.objectId === targetId);
    if (!target || target.contextId !== contextId || target.tenantId !== actor.tenantId) fail("RELATIONSHIP_TARGET_NOT_FOUND");
    return {
      kind: link.kind as (typeof D2_EXPLICIT_RELATIONSHIP_KINDS)[number],
      utilityRole: link.utilityRole as (typeof D2_UTILITY_RELATIONSHIP_ROLES)[number],
      targetObjectId: target.objectId,
    };
  });
  return normalized.sort((left, right) => `${left.utilityRole}|${left.kind}|${left.targetObjectId}`.localeCompare(`${right.utilityRole}|${right.kind}|${right.targetObjectId}`));
}

function remember(store: D2R6Store, subjectId: string, action: D2R6History["action"], fingerprint: string): void {
  store.history.push({ historyId: `hist-${store.history.length + 1}`, subjectKind: "UTILITY_CORRIDOR", subjectId, action, fingerprint, recordedAt: store.now() });
}

export function createD2R6Store(r5: D2R5Store, now: () => string = () => "2026-10-22T00:00:00.000Z"): D2R6Store {
  return { r5, now, utilities: [], history: [] };
}

export function recordCivilUtilityCorridorContext(store: D2R6Store, actor: D2R1Actor, input: D2R6UtilityInput): D2R6UtilityRecord {
  assertActor(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const citedCurrentness = currentnessOf(input.citedCurrentness);
  const citedLifecycleStage = maturityOf(input.citedLifecycleStage);
  const context = requireContext(store, actor, input.contextId, citedCurrentness);
  const corridor = requireObject(store, actor, context.contextId, input.corridorObjectId, "CIVIL_UTILITY_CORRIDOR", citedCurrentness, "CORRIDOR_OBJECT_REQUIRED");
  const trenchObjectIds = requireObjectIds(store, actor, context.contextId, input.trenchObjectIds, "TRENCH", citedCurrentness, "TRENCH_REFERENCE_REQUIRED");
  const pitObjectIds = requireObjectIds(store, actor, context.contextId, input.pitObjectIds, "PIT", citedCurrentness, "PIT_REFERENCE_REQUIRED");
  const crossingObjectIds = requireObjectIds(store, actor, context.contextId, input.crossingObjectIds, "CROSSING", citedCurrentness, "CROSSING_REFERENCE_REQUIRED");
  const clearanceEnvelopeObjectId = requireOptionalObject(store, actor, context.contextId, input.clearanceEnvelopeObjectId, "CLEARANCE_ENVELOPE", citedCurrentness, "CLEARANCE_ENVELOPE_REFERENCE_REQUIRED", "CLEARANCE_ENVELOPE_OBJECT_REQUIRED");
  const reservedSpaceReference = optionalExplicit(input.reservedSpaceReference, "RESERVED_SPACE_REFERENCE_REQUIRED", "RESERVED_SPACE_REFERENCE_INVALID");
  const spatial = requireSpatial(store, actor, context.contextId, input.spatialReferenceId, citedCurrentness);
  const surfaceContextIds = requireSurfaces(store, actor, context.contextId, input.surfaceContextIds, citedCurrentness);
  const gradingContextId = requireGrading(store, actor, context.contextId, input.gradingContextId, citedCurrentness);
  const roadsContextId = requireRoads(store, actor, context.contextId, input.roadsContextId, citedCurrentness);
  const drainageContextId = requireDrainage(store, actor, context.contextId, input.drainageContextId, citedCurrentness);
  const criteria = normalizeCriteria(input.criteria);
  const relationships = normalizeRelationships(store, actor, context.contextId, input.relationships);
  const assumptionObjectIds = requireGovernedObjects(store, actor, context.contextId, input.assumptionObjectIds, "CIVIL_ASSUMPTION", "ASSUMPTION_REFERENCE_REQUIRED");
  const evidenceObjectIds = requireGovernedObjects(store, actor, context.contextId, input.evidenceObjectIds, "CIVIL_EVIDENCE_REFERENCE", "EVIDENCE_REFERENCE_REQUIRED");
  const provenanceRef = explicit(input.provenanceRef, "MISSING_PROVENANCE");
  const utilityContextId = explicit(input.utilityContextId, "UTILITY_CONTEXT_REQUIRED");
  const predecessor = input.predecessorUtilityContextId ? store.utilities.find((row) => row.utilityContextId === input.predecessorUtilityContextId) : null;
  if (input.predecessorUtilityContextId && (!predecessor || predecessor.recordStatus !== "CURRENT" || predecessor.contextId !== context.contextId)) fail("PREDECESSOR_NOT_CURRENT");
  const fingerprint = fingerprintCanonical({
    utilityContextId,
    contextId: context.contextId,
    corridorObjectId: corridor.objectId,
    trenchObjectIds,
    pitObjectIds,
    crossingObjectIds,
    clearanceEnvelopeObjectId,
    reservedSpaceReference,
    spatialReferenceId: spatial.spatialReferenceId,
    surfaceContextIds,
    gradingContextId,
    roadsContextId,
    drainageContextId,
    criteria,
    relationships,
    assumptionObjectIds,
    evidenceObjectIds,
    citedLifecycleStage,
    provenanceRef,
    citedCurrentness,
    authority: D2_CONTEXT_AUTHORITY,
    predecessorUtilityContextId: predecessor?.utilityContextId ?? null,
  });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.utilities.find((row) => row.utilityContextId === utilityContextId);
  if (existing) {
    if (existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId) return existing;
    fail("UTILITY_CONTEXT_ALREADY_RECORDED");
  }
  const signature = `${corridor.objectId}|${surfaceContextIds.join(",")}|${gradingContextId ?? ""}|${roadsContextId ?? ""}|${drainageContextId ?? ""}|${JSON.stringify(criteria)}`;
  const duplicate = store.utilities.find((row) => row.recordStatus === "CURRENT" && row.utilityContextId !== predecessor?.utilityContextId && row.contextId === context.contextId && `${row.corridorObjectId}|${row.surfaceContextIds.join(",")}|${row.gradingContextId ?? ""}|${row.roadsContextId ?? ""}|${row.drainageContextId ?? ""}|${JSON.stringify(row.criteria)}` === signature);
  if (duplicate) fail("DUPLICATE_UTILITY_CONTEXT_REJECTED");
  const gradingBefore = gradingContextId ? store.r5.r4.r3.grading.find((row) => row.gradingContextId === gradingContextId) : null;
  const roadsBefore = roadsContextId ? store.r5.r4.roads.find((row) => row.roadsContextId === roadsContextId) : null;
  const drainageBefore = drainageContextId ? store.r5.drainage.find((row) => row.drainageContextId === drainageContextId) : null;
  const record: D2R6UtilityRecord = Object.freeze({
    utilityContextId,
    contextId: context.contextId,
    corridorObjectId: corridor.objectId,
    trenchObjectIds,
    pitObjectIds,
    crossingObjectIds,
    clearanceEnvelopeObjectId,
    reservedSpaceReference,
    spatialReferenceId: spatial.spatialReferenceId,
    surfaceContextIds,
    gradingContextId,
    roadsContextId,
    drainageContextId,
    criteria,
    relationships,
    assumptionObjectIds,
    evidenceObjectIds,
    citedLifecycleStage,
    provenanceRef,
    citedCurrentness,
    authority: D2_CONTEXT_AUTHORITY,
    civilEngineeringAuthority: false,
    mechanicalAuthority: false,
    pipingAuthority: false,
    processAuthority: false,
    electricalAuthority: false,
    instrumentationAuthority: false,
    utilityDesignComplete: false,
    disciplineSystemValidated: false,
    conflictResolved: false,
    routeGenerated: false,
    routeOptimized: false,
    utilitySized: false,
    capacityCalculated: false,
    quantityCalculated: false,
    engineeringValidated: false,
    engineeringApproved: false,
    fingerprint,
    recordedBy: actor.actorId,
    recordedAt: store.now(),
    recordStatus: "CURRENT",
    predecessorUtilityContextId: predecessor?.utilityContextId ?? null,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
  });
  if (predecessor) {
    const index = store.utilities.findIndex((row) => row.utilityContextId === predecessor.utilityContextId);
    const superseded: D2R6UtilityRecord = Object.freeze({ ...predecessor, recordStatus: "SUPERSEDED", citedCurrentness: "SUPERSEDED" });
    store.utilities[index] = superseded;
    remember(store, superseded.utilityContextId, "SUPERSEDED", superseded.fingerprint);
  }
  store.utilities.push(record);
  remember(store, record.utilityContextId, "CREATED", record.fingerprint);
  if (gradingBefore && store.r5.r4.r3.grading.find((row) => row.gradingContextId === gradingBefore.gradingContextId) !== gradingBefore) fail("GRADING_MUTATION_REJECTED");
  if (roadsBefore && store.r5.r4.roads.find((row) => row.roadsContextId === roadsBefore.roadsContextId) !== roadsBefore) fail("ROAD_MUTATION_REJECTED");
  if (drainageBefore && store.r5.drainage.find((row) => row.drainageContextId === drainageBefore.drainageContextId) !== drainageBefore) fail("DRAINAGE_MUTATION_REJECTED");
  return record;
}

export function mutateUtilityCorridor(): never {
  return fail("UTILITY_MUTATION_REJECTED");
}

export function generateUtilityRoute(): never {
  return fail("ROUTE_GENERATION_NOT_IN_R6");
}

export function optimizeUtilityRoute(): never {
  return fail("ROUTE_OPTIMIZATION_NOT_IN_R6");
}

export function resolveUtilityConflict(): never {
  return fail("CONFLICT_RESOLUTION_NOT_IN_R6");
}

export function sizeUtility(): never {
  return fail("UTILITY_SIZING_NOT_IN_R6");
}

export function calculateUtilityCapacity(): never {
  return fail("UTILITY_CAPACITY_NOT_IN_R6");
}

export function calculateUtilityQuantity(): never {
  return fail("UTILITY_QUANTITY_NOT_IN_R6");
}
