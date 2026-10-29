/**
 * EOS-D2-R5 drainage and stormwater context.
 * Binds to exact R1 identity and applicable R2, R3, and R4 references.
 * Does not calculate how water flows.
 */
import {
  D2_CURRENTNESS_STATES,
  D2_IMPLEMENTATION_PHASES,
  D2_MATURITY_STATES,
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
import { D2_ROADS_ACCESS_RUNTIME_READY as R4_ROADS_READY, type D2R4Store } from "./roads-access-context";

export const D2_R5_STATUS = "DRAINAGE_AND_STORMWATER_CONTEXT_IMPLEMENTED" as const;
export const D2_R5_MATURITY = "DRAINAGE_AND_STORMWATER_CONTEXT_IMPLEMENTED" as const;
export const D2_R5_MATURITY_STATE = D2_R5_MATURITY;
export const D2_R5_CLOSEOUT_PATH = "docs/architecture/engineering-os/EOS_D2_R5_DRAINAGE_AND_STORMWATER_CONTEXT_CLOSEOUT.md" as const;
export const D2_R5_R1_IDENTITY_READY = R1_IDENTITY_READY;
export const D2_R5_R2_SPATIAL_SURFACE_READY = R2_SPATIAL_READY;
export const D2_R5_R3_GRADING_READY = R3_GRADING_READY;
export const D2_R5_R4_ROADS_READY = R4_ROADS_READY;
export const D2_RUNTIME_STARTED = true as const;
export const D2_RUNTIME_COUNT = 5 as const;
export const D2_CIVIL_IDENTITY_AND_OBJECT_FOUNDATION_RUNTIME_READY = R1_IDENTITY_READY;
export const D2_SURVEY_SPATIAL_SURFACE_RUNTIME_READY = R2_SPATIAL_READY;
export const D2_GRADING_EARTHWORKS_RUNTIME_READY = R3_GRADING_READY;
export const D2_ROADS_ACCESS_RUNTIME_READY = R4_ROADS_READY;
export const D2_DRAINAGE_STORMWATER_RUNTIME_READY = true as const;
export const D2_R1_CIVIL_IDENTITY_REUSED = true as const;
export const D2_R2_SPATIAL_SURFACE_CONTEXT_REUSED = true as const;
export const D2_R3_GRADING_EARTHWORKS_CONTEXT_REUSED = true as const;
export const D2_R4_ROADS_ACCESS_CONTEXT_REUSED = true as const;
export const EXACT_R1_CIVIL_CONTEXT_REFERENCE_REQUIRED = true as const;
export const EXACT_R2_SPATIAL_SURFACE_REFERENCE_REQUIRED = true as const;
export const EXACT_R3_GRADING_REFERENCE_REQUIRED_WHERE_APPLICABLE = true as const;
export const EXACT_R4_ROADS_REFERENCE_REQUIRED_WHERE_APPLICABLE = true as const;
export const FLOATING_UPSTREAM_DRAINAGE_REFERENCE_ALLOWED = false as const;
export const D2_DRAINAGE_STORMWATER_CONTEXT_RUNTIME_IMPLEMENTED = true as const;
export const D2_DRAINAGE_STORMWATER_CONTEXT_RUNTIME_COUNT = 1 as const;
export const D2_RAINFALL_CRITERION_KINDS = [
  "RAINFALL_SOURCE",
  "DESIGN_EVENT",
  "RECURRENCE",
  "CLIMATE_CHANGE_FACTOR",
  "DRAINAGE_STANDARD",
] as const;
export const D2_RUNOFF_CRITERION_KINDS = [
  "RUNOFF_COEFFICIENT",
  "RUNOFF_REFERENCE",
  "DRAINAGE_STANDARD",
] as const;
export const D2_DRAINAGE_RELATIONSHIP_ROLES = [
  "CATCHMENT_TO_NETWORK",
  "NODE_TO_LINK",
  "UPSTREAM_TO_DOWNSTREAM",
  "LINK_TO_OUTFALL",
  "NETWORK_TO_DETENTION",
  "DRAINAGE_TO_CHANNEL",
  "DRAINAGE_TO_CULVERT",
  "DRAINAGE_TO_GRADING",
  "DRAINAGE_TO_ROAD",
] as const;
export const CATCHMENT_CONTEXT_PRESENT_EQUALS_HYDROLOGY_CALCULATED = false as const;
export const DRAINAGE_NETWORK_PRESENT_EQUALS_HYDRAULIC_MODEL_COMPLETE = false as const;
export const AI_CAN_INVENT_AUTHORITATIVE_RAINFALL_CRITERIA = false as const;
export const AI_CAN_INVENT_AUTHORITATIVE_RUNOFF_CRITERIA = false as const;
export const DRAINAGE_RELATIONSHIP_EQUALS_AUTOMATIC_GRADING_CHANGE = false as const;
export const DRAINAGE_RELATIONSHIP_EQUALS_AUTOMATIC_ROAD_CHANGE = false as const;
export const D2_R5_CAN_REFERENCE_GOVERNED_ASSUMPTIONS = true as const;
export const D2_R5_CREATES_PARALLEL_ASSUMPTION_GOVERNANCE = false as const;
export const D2_R5_CAN_REFERENCE_GOVERNED_EVIDENCE = true as const;
export const DRAINAGE_EVIDENCE_PRESENT_EQUALS_ENGINEERING_VALIDATED = false as const;
export const CANONICAL_CURRENTNESS_REUSED = true as const;
export const PARALLEL_D2_CURRENTNESS_ENGINE_CREATED = false as const;
export const D2_DRAINAGE_CONTEXT_AUTO_REPOINTED = false as const;
export const TENANT_WORKSPACE_PROJECT_D2_DRAINAGE_SCOPE_ENFORCED = true as const;
export const D2_DRAINAGE_PROVENANCE_REQUIRED = true as const;
export const D2_DRAINAGE_PROVENANCE_PRESERVED = true as const;
export const CANONICAL_FINGERPRINT_REUSED = true as const;
export const SECOND_FINGERPRINT_ALGORITHM_CREATED = false as const;
export const D2_CANONICAL_FINGERPRINT_REUSED = true as const;
export const D2_SECOND_FINGERPRINT_ALGORITHM_CREATED = false as const;
export const D2_DRAINAGE_FINGERPRINT_IMPLEMENTED = true as const;
export const AI_EQUALS_D2_CIVIL_ENGINEERING_AUTHORITY = false as const;
export const ADMIN_EQUALS_D2_CIVIL_ENGINEERING_AUTHORITY = false as const;
export const SILENT_D2_DRAINAGE_MUTATION_ALLOWED = false as const;
export const D2_DRAINAGE_HISTORY_PRESERVED = true as const;

export const D2_CIVIL_UTILITY_CORRIDOR_RUNTIME_READY = false as const;
export const D2_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY = false as const;
export const D2_DISCIPLINE_INTERFACE_RUNTIME_READY = false as const;
export const D2_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_READY = false as const;
export const D2_CURRENTNESS_DIGITAL_THREAD_RUNTIME_READY = false as const;
export const D2_D9_SOURCE_CONTRACT_RUNTIME_READY = false as const;
export const D2_HYDROLOGY_CALCULATION_RUNTIME_COUNT = 0 as const;
export const D2_RUNOFF_CALCULATION_RUNTIME_COUNT = 0 as const;
export const D2_HYDRAULIC_CALCULATION_RUNTIME_COUNT = 0 as const;
export const D2_PIPE_SIZING_RUNTIME_COUNT = 0 as const;
export const D2_CHANNEL_HYDRAULICS_RUNTIME_COUNT = 0 as const;
export const D2_CULVERT_SIZING_RUNTIME_COUNT = 0 as const;
export const D2_DETENTION_SIZING_RUNTIME_COUNT = 0 as const;
export const D2_FLOOD_MODELLING_RUNTIME_COUNT = 0 as const;
export const D2_FLOOD_ROUTING_RUNTIME_COUNT = 0 as const;
export const D2_DRAINAGE_OPTIMIZATION_RUNTIME_COUNT = 0 as const;
export const D2_TERRAIN_GENERATION_RUNTIME_COUNT = 0 as const;
export const D2_AUTOMATIC_GRADING_DESIGN_RUNTIME_COUNT = 0 as const;
export const D2_EARTHWORKS_CALCULATION_RUNTIME_COUNT = 0 as const;
export const D2_ROAD_GEOMETRIC_DESIGN_RUNTIME_COUNT = 0 as const;
export const D2_QUANTITY_CALCULATION_RUNTIME_COUNT = 0 as const;
export const D2_CIVIL_UTILITY_GEOMETRY_RUNTIME_COUNT = 0 as const;
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

export const D2_R6_CANONICAL_PHASE = D2_IMPLEMENTATION_PHASES[5];
export const D2_R6_PHASE_TYPE = "CIVIL_UTILITY_AND_CORRIDOR_CONTEXT" as const;
export const D2_R6_CANONICAL_SCOPE =
  "Implement bounded governed Civil utility/corridor context using exact D2 identity and applicable spatial, grading, roads and drainage references. Record corridor, trench, pit, crossing, clearance-envelope and Civil utility spatial context plus explicit relationships, provenance, currentness and fingerprint. Do not design electrical, mechanical, piping, process or instrumentation systems, perform utility sizing, calculate capacities, optimize routing, calculate quantities, or start D3-D9." as const;
export const D2_R6_STARTED = false as const;
export const D2_R5_READY_FOR_NEXT_PHASE = true as const;
export const D2_R5_NEXT_PHASE = D2_R6_CANONICAL_PHASE;
export const D2_R5_NEXT_PHASE_TYPE = D2_R6_PHASE_TYPE;
export const D2_R5_CANONICAL_NEXT_PHASE = D2_R6_CANONICAL_PHASE;
export const D2_R5_CANONICAL_NEXT_PHASE_SCOPE = D2_R6_CANONICAL_SCOPE;
export const D2_R5_BLOCKER = "NONE" as const;
export const D2_R5_MACHINE_READABLE_ROADMAP_UPDATED = true as const;

const FLOATING = new Set(["latest", "current", "newest", "head", "active", "active model"]);
const INFERRED = new Set(["inferred", "unknown", "auto", "default"]);

type Citation = { kind: string; suppliedValue: string; sourceRef: string };
type Prohibited = {
  inventRainfallCriteria?: boolean;
  inventRunoffCriteria?: boolean;
  hydrology?: boolean;
  runoffCalculation?: boolean;
  hydraulics?: boolean;
  pipeSizing?: boolean;
  channelHydraulics?: boolean;
  culvertSizing?: boolean;
  detentionSizing?: boolean;
  floodModelling?: boolean;
  floodRouting?: boolean;
  drainageOptimization?: boolean;
  terrain?: boolean;
  gradingDesign?: boolean;
  changeGrading?: boolean;
  roadDesign?: boolean;
  changeRoad?: boolean;
  earthworksCalculation?: boolean;
  quantity?: boolean;
  inferRelationship?: boolean;
  validation?: boolean;
  approval?: boolean;
  certification?: boolean;
  repoint?: boolean;
  d1Integration?: boolean;
  d3Integration?: boolean;
  d9Reasoning?: boolean;
};

export type D2R5DrainageInput = Prohibited & {
  drainageContextId: string;
  contextId: string;
  catchmentObjectId: string;
  catchmentBoundaryReference: string;
  rainfallObjectId: string | null;
  networkObjectId: string;
  nodeObjectIds: readonly string[];
  linkObjectIds: readonly string[];
  pitObjectIds: readonly string[];
  manholeObjectIds: readonly string[];
  channelObjectId: string | null;
  culvertObjectId: string | null;
  outfallObjectId: string | null;
  detentionObjectId: string | null;
  pipeReference: string | null;
  floodLevelReference: string | null;
  spatialReferenceId: string;
  surfaceContextIds: readonly string[];
  gradingContextId: string | null;
  roadsContextId: string | null;
  rainfallCriteria: readonly Citation[];
  runoffCriteria: readonly Citation[];
  relationships: readonly { kind: string; drainageRole: string; targetObjectId: string }[];
  assumptionObjectIds: readonly string[];
  evidenceObjectIds: readonly string[];
  standardsReference: string | null;
  citedLifecycleStage: string;
  provenanceRef: string;
  citedCurrentness: string;
  assertedFingerprint?: string;
  predecessorDrainageContextId?: string | null;
  tenantId?: string;
  workspaceId?: string;
  projectId?: string;
};

type RainfallCriterion = { kind: (typeof D2_RAINFALL_CRITERION_KINDS)[number]; suppliedValue: string; sourceRef: string };
type RunoffCriterion = { kind: (typeof D2_RUNOFF_CRITERION_KINDS)[number]; suppliedValue: string; sourceRef: string };
type DrainageRelationship = {
  kind: (typeof D2_EXPLICIT_RELATIONSHIP_KINDS)[number];
  drainageRole: (typeof D2_DRAINAGE_RELATIONSHIP_ROLES)[number];
  targetObjectId: string;
};

export type D2R5DrainageRecord = {
  drainageContextId: string;
  contextId: string;
  catchmentObjectId: string;
  catchmentBoundaryReference: string;
  rainfallObjectId: string | null;
  networkObjectId: string;
  nodeObjectIds: readonly string[];
  linkObjectIds: readonly string[];
  pitObjectIds: readonly string[];
  manholeObjectIds: readonly string[];
  channelObjectId: string | null;
  culvertObjectId: string | null;
  outfallObjectId: string | null;
  detentionObjectId: string | null;
  pipeReference: string | null;
  floodLevelReference: string | null;
  spatialReferenceId: string;
  surfaceContextIds: readonly string[];
  gradingContextId: string | null;
  roadsContextId: string | null;
  rainfallCriteria: readonly RainfallCriterion[];
  runoffCriteria: readonly RunoffCriterion[];
  relationships: readonly DrainageRelationship[];
  assumptionObjectIds: readonly string[];
  evidenceObjectIds: readonly string[];
  standardsReference: string | null;
  citedLifecycleStage: (typeof D2_MATURITY_STATES)[number];
  provenanceRef: string;
  citedCurrentness: (typeof D2_CURRENTNESS_STATES)[number];
  authority: typeof D2_CONTEXT_AUTHORITY;
  civilEngineeringAuthority: false;
  hydrologyCalculated: false;
  runoffCalculated: false;
  hydraulicModelComplete: false;
  pipeSized: false;
  channelHydraulicsCalculated: false;
  culvertSized: false;
  detentionSized: false;
  floodModelled: false;
  floodRouted: false;
  drainageOptimized: false;
  gradingChanged: false;
  roadChanged: false;
  engineeringValidated: false;
  engineeringApproved: false;
  fingerprint: string;
  recordedBy: string;
  recordedAt: string;
  recordStatus: "CURRENT" | "SUPERSEDED";
  predecessorDrainageContextId: string | null;
  tenantId: string;
  workspaceId: string;
  projectId: string;
};

export type D2R5History = {
  historyId: string;
  subjectKind: "DRAINAGE";
  subjectId: string;
  action: "CREATED" | "SUPERSEDED";
  fingerprint: string;
  recordedAt: string;
};

export type D2R5Store = {
  r4: D2R4Store;
  now: () => string;
  drainage: D2R5DrainageRecord[];
  history: D2R5History[];
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
  if (input.inventRainfallCriteria === true) fail("RAINFALL_CRITERIA_NOT_INVENTED");
  if (input.inventRunoffCriteria === true) fail("RUNOFF_CRITERIA_NOT_INVENTED");
  if (input.hydrology === true) fail("HYDROLOGY_NOT_IN_R5");
  if (input.runoffCalculation === true) fail("RUNOFF_CALCULATION_NOT_IN_R5");
  if (input.hydraulics === true) fail("HYDRAULICS_NOT_IN_R5");
  if (input.pipeSizing === true) fail("PIPE_SIZING_NOT_IN_R5");
  if (input.channelHydraulics === true) fail("CHANNEL_HYDRAULICS_NOT_IN_R5");
  if (input.culvertSizing === true) fail("CULVERT_SIZING_NOT_IN_R5");
  if (input.detentionSizing === true) fail("DETENTION_SIZING_NOT_IN_R5");
  if (input.floodModelling === true) fail("FLOOD_MODELLING_NOT_IN_R5");
  if (input.floodRouting === true) fail("FLOOD_ROUTING_NOT_IN_R5");
  if (input.drainageOptimization === true) fail("DRAINAGE_OPTIMIZATION_NOT_IN_R5");
  if (input.terrain === true) fail("TERRAIN_NOT_IN_R5");
  if (input.gradingDesign === true || input.changeGrading === true) fail("GRADING_CHANGE_NOT_IN_R5");
  if (input.roadDesign === true || input.changeRoad === true) fail("ROAD_CHANGE_NOT_IN_R5");
  if (input.earthworksCalculation === true) fail("EARTHWORKS_NOT_IN_R5");
  if (input.quantity === true) fail("QUANTITY_NOT_IN_R5");
  if (input.inferRelationship === true) fail("INFERRED_RELATIONSHIP_REJECTED");
  if (input.validation === true) fail("VALIDATION_NOT_IN_R5");
  if (input.approval === true) fail("APPROVAL_NOT_IN_R5");
  if (input.certification === true) fail("CERTIFICATION_NOT_IN_R5");
  if (input.repoint === true) fail("AUTO_REPOINT_REJECTED");
  if (input.d1Integration === true || input.d3Integration === true || input.d9Reasoning === true) fail("OTHER_DISCIPLINE_NOT_IN_R5");
}

function currentnessOf(value: string): (typeof D2_CURRENTNESS_STATES)[number] {
  if (!isCurrentness(value.trim())) fail("CURRENTNESS_INVALID");
  return value.trim() as (typeof D2_CURRENTNESS_STATES)[number];
}

function maturityOf(value: string): (typeof D2_MATURITY_STATES)[number] {
  if (!isMaturity(value.trim())) fail("MATURITY_INVALID");
  return value.trim() as (typeof D2_MATURITY_STATES)[number];
}

function requireContext(store: D2R5Store, actor: D2R1Actor, contextId: string, citedCurrentness: (typeof D2_CURRENTNESS_STATES)[number]) {
  const id = explicit(contextId, "R1_CONTEXT_REQUIRED");
  const context = store.r4.r3.r2.r1.contexts.find((row) => row.contextId === id);
  if (!context) fail("R1_CONTEXT_NOT_FOUND");
  if (context.tenantId !== actor.tenantId) fail("CROSS_TENANT_OPERATION");
  if (context.workspaceId !== actor.workspaceId) fail("CROSS_WORKSPACE_OPERATION");
  if (context.projectId !== actor.projectId) fail("CROSS_PROJECT_OPERATION");
  if (context.discipline !== D2_DISCIPLINE) fail("DISCIPLINE_NOT_CIVIL");
  if (citedCurrentness === "CURRENT" && context.recordStatus !== "CURRENT") fail("R1_CONTEXT_NOT_CURRENT");
  return context;
}

function requireObject(store: D2R5Store, actor: D2R1Actor, contextId: string, objectId: string, objectType: string, citedCurrentness: (typeof D2_CURRENTNESS_STATES)[number], code: string) {
  const id = explicit(objectId, code);
  const object = store.r4.r3.r2.r1.objects.find((row) => row.objectId === id);
  if (!object || object.objectType !== objectType || object.contextId !== contextId) fail(code);
  if (object.tenantId !== actor.tenantId || object.workspaceId !== actor.workspaceId || object.projectId !== actor.projectId) fail("CROSS_SCOPE_OPERATION");
  if (citedCurrentness === "CURRENT" && object.recordStatus !== "CURRENT") fail("R1_OBJECT_NOT_CURRENT");
  return object;
}

function requireOptionalObject(store: D2R5Store, actor: D2R1Actor, contextId: string, objectId: string | null | undefined, objectType: string, citedCurrentness: (typeof D2_CURRENTNESS_STATES)[number], missingCode: string, invalidCode: string): string | null {
  if (objectId === undefined) fail(missingCode);
  if (objectId === null) return null;
  return requireObject(store, actor, contextId, objectId, objectType, citedCurrentness, invalidCode).objectId;
}

function requireObjectIds(store: D2R5Store, actor: D2R1Actor, contextId: string, objectIds: readonly string[] | undefined, objectType: string, citedCurrentness: (typeof D2_CURRENTNESS_STATES)[number], code: string, required: boolean): string[] {
  if (!Array.isArray(objectIds)) fail(code);
  const ids = [...new Set(objectIds.map((id) => explicit(id, code)))].sort();
  if (required && ids.length === 0) fail(code);
  for (const id of ids) requireObject(store, actor, contextId, id, objectType, citedCurrentness, code);
  return ids;
}

function requireSpatial(store: D2R5Store, actor: D2R1Actor, contextId: string, spatialReferenceId: string, citedCurrentness: (typeof D2_CURRENTNESS_STATES)[number]) {
  const id = explicit(spatialReferenceId, "R2_SPATIAL_REQUIRED");
  const spatial = store.r4.r3.r2.spatial.find((row) => row.spatialReferenceId === id);
  if (!spatial || spatial.contextId !== contextId || spatial.tenantId !== actor.tenantId) fail("R2_SPATIAL_NOT_FOUND");
  if (citedCurrentness === "CURRENT" && spatial.recordStatus !== "CURRENT") fail("R2_SPATIAL_NOT_CURRENT");
  return spatial;
}

function requireSurfaces(store: D2R5Store, actor: D2R1Actor, contextId: string, surfaceContextIds: readonly string[], citedCurrentness: (typeof D2_CURRENTNESS_STATES)[number]): string[] {
  if (!Array.isArray(surfaceContextIds) || surfaceContextIds.length === 0) fail("R2_SURFACE_REQUIRED");
  const ids = [...new Set(surfaceContextIds.map((id) => explicit(id, "R2_SURFACE_REQUIRED")))].sort();
  for (const id of ids) {
    const surface = store.r4.r3.r2.surfaces.find((row) => row.surfaceContextId === id);
    if (!surface || surface.contextId !== contextId || surface.tenantId !== actor.tenantId) fail("R2_SURFACE_NOT_FOUND");
    if (citedCurrentness === "CURRENT" && surface.recordStatus !== "CURRENT") fail("R2_SURFACE_NOT_CURRENT");
  }
  return ids;
}

function requireGrading(store: D2R5Store, actor: D2R1Actor, contextId: string, gradingContextId: string | null | undefined, citedCurrentness: (typeof D2_CURRENTNESS_STATES)[number]): string | null {
  if (gradingContextId === undefined) fail("R3_GRADING_REFERENCE_REQUIRED");
  if (gradingContextId === null) return null;
  const id = explicit(gradingContextId, "R3_GRADING_REQUIRED");
  const grading = store.r4.r3.grading.find((row) => row.gradingContextId === id);
  if (!grading || grading.contextId !== contextId || grading.tenantId !== actor.tenantId) fail("R3_GRADING_NOT_FOUND");
  if (citedCurrentness === "CURRENT" && grading.recordStatus !== "CURRENT") fail("R3_GRADING_NOT_CURRENT");
  return grading.gradingContextId;
}

function requireRoads(store: D2R5Store, actor: D2R1Actor, contextId: string, roadsContextId: string | null | undefined, citedCurrentness: (typeof D2_CURRENTNESS_STATES)[number]): string | null {
  if (roadsContextId === undefined) fail("R4_ROADS_REFERENCE_REQUIRED");
  if (roadsContextId === null) return null;
  const id = explicit(roadsContextId, "R4_ROADS_REQUIRED");
  const roads = store.r4.roads.find((row) => row.roadsContextId === id);
  if (!roads || roads.contextId !== contextId || roads.tenantId !== actor.tenantId) fail("R4_ROADS_NOT_FOUND");
  if (citedCurrentness === "CURRENT" && roads.recordStatus !== "CURRENT") fail("R4_ROADS_NOT_CURRENT");
  return roads.roadsContextId;
}

function requireGovernedObjects(store: D2R5Store, actor: D2R1Actor, contextId: string, objectIds: readonly string[] | undefined, objectType: "CIVIL_ASSUMPTION" | "CIVIL_EVIDENCE_REFERENCE", missingCode: string): string[] {
  if (!Array.isArray(objectIds)) fail(missingCode);
  const ids = [...new Set(objectIds.map((id) => explicit(id, missingCode)))].sort();
  for (const id of ids) {
    const object = store.r4.r3.r2.r1.objects.find((row) => row.objectId === id);
    if (!object || object.objectType !== objectType || object.contextId !== contextId || object.tenantId !== actor.tenantId) fail(missingCode);
  }
  return ids;
}

function normalizeCriteria<T extends string>(items: readonly Citation[] | undefined, kinds: readonly T[], missingCode: string, invalidCode: string): { kind: T; suppliedValue: string; sourceRef: string }[] {
  if (!Array.isArray(items)) fail(missingCode);
  const normalized = items.map((item) => {
    if (!(kinds as readonly string[]).includes(item.kind)) fail(invalidCode);
    return {
      kind: item.kind as T,
      suppliedValue: explicit(item.suppliedValue, invalidCode),
      sourceRef: explicit(item.sourceRef, "SOURCE_REFERENCE_REQUIRED"),
    };
  });
  return normalized.sort((left, right) => `${left.kind}|${left.suppliedValue}|${left.sourceRef}`.localeCompare(`${right.kind}|${right.suppliedValue}|${right.sourceRef}`));
}

function normalizeRelationships(store: D2R5Store, actor: D2R1Actor, contextId: string, links: D2R5DrainageInput["relationships"] | undefined): DrainageRelationship[] {
  if (!Array.isArray(links)) fail("DRAINAGE_RELATIONSHIPS_REQUIRED");
  const normalized = links.map((link) => {
    if (!(D2_EXPLICIT_RELATIONSHIP_KINDS as readonly string[]).includes(link.kind)) fail("RELATIONSHIP_KIND_NOT_EXPLICIT");
    if (!(D2_DRAINAGE_RELATIONSHIP_ROLES as readonly string[]).includes(link.drainageRole)) fail("DRAINAGE_ROLE_INVALID");
    const targetId = explicit(link.targetObjectId, "RELATIONSHIP_TARGET_REQUIRED");
    const target = store.r4.r3.r2.r1.objects.find((row) => row.objectId === targetId);
    if (!target || target.contextId !== contextId || target.tenantId !== actor.tenantId) fail("RELATIONSHIP_TARGET_NOT_FOUND");
    return {
      kind: link.kind as (typeof D2_EXPLICIT_RELATIONSHIP_KINDS)[number],
      drainageRole: link.drainageRole as (typeof D2_DRAINAGE_RELATIONSHIP_ROLES)[number],
      targetObjectId: target.objectId,
    };
  });
  return normalized.sort((left, right) => `${left.drainageRole}|${left.kind}|${left.targetObjectId}`.localeCompare(`${right.drainageRole}|${right.kind}|${right.targetObjectId}`));
}

function remember(store: D2R5Store, subjectId: string, action: D2R5History["action"], fingerprint: string): void {
  store.history.push({ historyId: `hist-${store.history.length + 1}`, subjectKind: "DRAINAGE", subjectId, action, fingerprint, recordedAt: store.now() });
}

export function createD2R5Store(r4: D2R4Store, now: () => string = () => "2026-10-22T00:00:00.000Z"): D2R5Store {
  return { r4, now, drainage: [], history: [] };
}

export function recordDrainageStormwaterContext(store: D2R5Store, actor: D2R1Actor, input: D2R5DrainageInput): D2R5DrainageRecord {
  assertActor(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const citedCurrentness = currentnessOf(input.citedCurrentness);
  const citedLifecycleStage = maturityOf(input.citedLifecycleStage);
  const context = requireContext(store, actor, input.contextId, citedCurrentness);
  const catchment = requireObject(store, actor, context.contextId, input.catchmentObjectId, "DRAINAGE_CATCHMENT", citedCurrentness, "CATCHMENT_OBJECT_REQUIRED");
  const catchmentBoundaryReference = explicit(input.catchmentBoundaryReference, "BOUNDARY_REFERENCE_REQUIRED");
  const rainfallObjectId = requireOptionalObject(store, actor, context.contextId, input.rainfallObjectId, "RAINFALL_REFERENCE", citedCurrentness, "RAINFALL_OBJECT_REFERENCE_REQUIRED", "RAINFALL_OBJECT_REQUIRED");
  const network = requireObject(store, actor, context.contextId, input.networkObjectId, "DRAINAGE_NETWORK", citedCurrentness, "NETWORK_OBJECT_REQUIRED");
  const nodeObjectIds = requireObjectIds(store, actor, context.contextId, input.nodeObjectIds, "DRAINAGE_NODE", citedCurrentness, "NODE_OBJECT_REQUIRED", true);
  const linkObjectIds = requireObjectIds(store, actor, context.contextId, input.linkObjectIds, "DRAINAGE_LINK", citedCurrentness, "LINK_OBJECT_REQUIRED", true);
  const pitObjectIds = requireObjectIds(store, actor, context.contextId, input.pitObjectIds, "PIT", citedCurrentness, "PIT_REFERENCE_REQUIRED", false);
  const manholeObjectIds = requireObjectIds(store, actor, context.contextId, input.manholeObjectIds, "MANHOLE", citedCurrentness, "MANHOLE_REFERENCE_REQUIRED", false);
  const channelObjectId = requireOptionalObject(store, actor, context.contextId, input.channelObjectId, "CHANNEL", citedCurrentness, "CHANNEL_REFERENCE_REQUIRED", "CHANNEL_OBJECT_REQUIRED");
  const culvertObjectId = requireOptionalObject(store, actor, context.contextId, input.culvertObjectId, "CULVERT_REFERENCE", citedCurrentness, "CULVERT_REFERENCE_REQUIRED", "CULVERT_OBJECT_REQUIRED");
  const outfallObjectId = requireOptionalObject(store, actor, context.contextId, input.outfallObjectId, "STORMWATER_OUTFALL", citedCurrentness, "OUTFALL_REFERENCE_REQUIRED", "OUTFALL_OBJECT_REQUIRED");
  const detentionObjectId = requireOptionalObject(store, actor, context.contextId, input.detentionObjectId, "DETENTION_REFERENCE", citedCurrentness, "DETENTION_REFERENCE_REQUIRED", "DETENTION_OBJECT_REQUIRED");
  const pipeReference = optionalExplicit(input.pipeReference, "PIPE_REFERENCE_REQUIRED", "PIPE_REFERENCE_INVALID");
  const floodLevelReference = optionalExplicit(input.floodLevelReference, "FLOOD_LEVEL_REFERENCE_REQUIRED", "FLOOD_LEVEL_REFERENCE_INVALID");
  const spatial = requireSpatial(store, actor, context.contextId, input.spatialReferenceId, citedCurrentness);
  const surfaceContextIds = requireSurfaces(store, actor, context.contextId, input.surfaceContextIds, citedCurrentness);
  const gradingContextId = requireGrading(store, actor, context.contextId, input.gradingContextId, citedCurrentness);
  const roadsContextId = requireRoads(store, actor, context.contextId, input.roadsContextId, citedCurrentness);
  const rainfallCriteria = normalizeCriteria(input.rainfallCriteria, D2_RAINFALL_CRITERION_KINDS, "RAINFALL_CRITERIA_REQUIRED", "RAINFALL_CRITERION_INVALID");
  const runoffCriteria = normalizeCriteria(input.runoffCriteria, D2_RUNOFF_CRITERION_KINDS, "RUNOFF_CRITERIA_REQUIRED", "RUNOFF_CRITERION_INVALID");
  const relationships = normalizeRelationships(store, actor, context.contextId, input.relationships);
  const assumptionObjectIds = requireGovernedObjects(store, actor, context.contextId, input.assumptionObjectIds, "CIVIL_ASSUMPTION", "ASSUMPTION_REFERENCE_REQUIRED");
  const evidenceObjectIds = requireGovernedObjects(store, actor, context.contextId, input.evidenceObjectIds, "CIVIL_EVIDENCE_REFERENCE", "EVIDENCE_REFERENCE_REQUIRED");
  const standardsReference = optionalExplicit(input.standardsReference, "STANDARD_REFERENCE_REQUIRED", "STANDARD_REFERENCE_INVALID");
  const provenanceRef = explicit(input.provenanceRef, "MISSING_PROVENANCE");
  const drainageContextId = explicit(input.drainageContextId, "DRAINAGE_CONTEXT_REQUIRED");
  const predecessor = input.predecessorDrainageContextId ? store.drainage.find((row) => row.drainageContextId === input.predecessorDrainageContextId) : null;
  if (input.predecessorDrainageContextId && (!predecessor || predecessor.recordStatus !== "CURRENT" || predecessor.contextId !== context.contextId)) fail("PREDECESSOR_NOT_CURRENT");
  const fingerprint = fingerprintCanonical({
    drainageContextId,
    contextId: context.contextId,
    catchmentObjectId: catchment.objectId,
    catchmentBoundaryReference,
    rainfallObjectId,
    networkObjectId: network.objectId,
    nodeObjectIds,
    linkObjectIds,
    pitObjectIds,
    manholeObjectIds,
    channelObjectId,
    culvertObjectId,
    outfallObjectId,
    detentionObjectId,
    pipeReference,
    floodLevelReference,
    spatialReferenceId: spatial.spatialReferenceId,
    surfaceContextIds,
    gradingContextId,
    roadsContextId,
    rainfallCriteria,
    runoffCriteria,
    relationships,
    assumptionObjectIds,
    evidenceObjectIds,
    standardsReference,
    citedLifecycleStage,
    provenanceRef,
    citedCurrentness,
    authority: D2_CONTEXT_AUTHORITY,
    predecessorDrainageContextId: predecessor?.drainageContextId ?? null,
  });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.drainage.find((row) => row.drainageContextId === drainageContextId);
  if (existing) {
    if (existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId) return existing;
    fail("DRAINAGE_CONTEXT_ALREADY_RECORDED");
  }
  const signature = `${catchment.objectId}|${network.objectId}|${surfaceContextIds.join(",")}|${gradingContextId ?? ""}|${roadsContextId ?? ""}|${JSON.stringify(rainfallCriteria)}|${JSON.stringify(runoffCriteria)}`;
  const duplicate = store.drainage.find((row) => row.recordStatus === "CURRENT" && row.drainageContextId !== predecessor?.drainageContextId && row.contextId === context.contextId && `${row.catchmentObjectId}|${row.networkObjectId}|${row.surfaceContextIds.join(",")}|${row.gradingContextId ?? ""}|${row.roadsContextId ?? ""}|${JSON.stringify(row.rainfallCriteria)}|${JSON.stringify(row.runoffCriteria)}` === signature);
  if (duplicate) fail("DUPLICATE_DRAINAGE_CONTEXT_REJECTED");
  const gradingBefore = gradingContextId ? store.r4.r3.grading.find((row) => row.gradingContextId === gradingContextId) : null;
  const roadsBefore = roadsContextId ? store.r4.roads.find((row) => row.roadsContextId === roadsContextId) : null;
  const record: D2R5DrainageRecord = Object.freeze({
    drainageContextId,
    contextId: context.contextId,
    catchmentObjectId: catchment.objectId,
    catchmentBoundaryReference,
    rainfallObjectId,
    networkObjectId: network.objectId,
    nodeObjectIds,
    linkObjectIds,
    pitObjectIds,
    manholeObjectIds,
    channelObjectId,
    culvertObjectId,
    outfallObjectId,
    detentionObjectId,
    pipeReference,
    floodLevelReference,
    spatialReferenceId: spatial.spatialReferenceId,
    surfaceContextIds,
    gradingContextId,
    roadsContextId,
    rainfallCriteria,
    runoffCriteria,
    relationships,
    assumptionObjectIds,
    evidenceObjectIds,
    standardsReference,
    citedLifecycleStage,
    provenanceRef,
    citedCurrentness,
    authority: D2_CONTEXT_AUTHORITY,
    civilEngineeringAuthority: false,
    hydrologyCalculated: false,
    runoffCalculated: false,
    hydraulicModelComplete: false,
    pipeSized: false,
    channelHydraulicsCalculated: false,
    culvertSized: false,
    detentionSized: false,
    floodModelled: false,
    floodRouted: false,
    drainageOptimized: false,
    gradingChanged: false,
    roadChanged: false,
    engineeringValidated: false,
    engineeringApproved: false,
    fingerprint,
    recordedBy: actor.actorId,
    recordedAt: store.now(),
    recordStatus: "CURRENT",
    predecessorDrainageContextId: predecessor?.drainageContextId ?? null,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
  });
  if (predecessor) {
    const index = store.drainage.findIndex((row) => row.drainageContextId === predecessor.drainageContextId);
    const superseded: D2R5DrainageRecord = Object.freeze({ ...predecessor, recordStatus: "SUPERSEDED", citedCurrentness: "SUPERSEDED" });
    store.drainage[index] = superseded;
    remember(store, superseded.drainageContextId, "SUPERSEDED", superseded.fingerprint);
  }
  store.drainage.push(record);
  remember(store, record.drainageContextId, "CREATED", record.fingerprint);
  if (gradingBefore && store.r4.r3.grading.find((row) => row.gradingContextId === gradingBefore.gradingContextId) !== gradingBefore) fail("GRADING_MUTATION_REJECTED");
  if (roadsBefore && store.r4.roads.find((row) => row.roadsContextId === roadsBefore.roadsContextId) !== roadsBefore) fail("ROAD_MUTATION_REJECTED");
  return record;
}

export function mutateDrainage(): never {
  return fail("DRAINAGE_MUTATION_REJECTED");
}

export function calculateHydrology(): never {
  return fail("HYDROLOGY_NOT_IN_R5");
}

export function calculateRunoff(): never {
  return fail("RUNOFF_CALCULATION_NOT_IN_R5");
}

export function calculateHydraulics(): never {
  return fail("HYDRAULICS_NOT_IN_R5");
}

export function sizePipe(): never {
  return fail("PIPE_SIZING_NOT_IN_R5");
}

export function calculateChannelHydraulics(): never {
  return fail("CHANNEL_HYDRAULICS_NOT_IN_R5");
}

export function sizeCulvert(): never {
  return fail("CULVERT_SIZING_NOT_IN_R5");
}

export function sizeDetention(): never {
  return fail("DETENTION_SIZING_NOT_IN_R5");
}

export function modelFlood(): never {
  return fail("FLOOD_MODELLING_NOT_IN_R5");
}

export function routeFlood(): never {
  return fail("FLOOD_ROUTING_NOT_IN_R5");
}

export function optimizeDrainage(): never {
  return fail("DRAINAGE_OPTIMIZATION_NOT_IN_R5");
}
