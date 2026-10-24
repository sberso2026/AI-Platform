/**
 * EOS-D2-R2 survey, spatial, and surface context.
 * Binds to exact R1 Civil identity. Does not generate terrain or observations.
 */
import { D2_CURRENTNESS_STATES, D2_IMPLEMENTATION_PHASES } from "@rtb/types";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import {
  D2_CIVIL_IDENTITY_AND_OBJECT_FOUNDATION_RUNTIME_READY,
  D2_CONTEXT_AUTHORITY,
  D2_DISCIPLINE,
  type D2R1Actor,
  type D2R1Store,
} from "./identity-foundation";

export const D2_R2_STATUS = "SURVEY_SPATIAL_AND_SURFACE_CONTEXT_IMPLEMENTED" as const;
export const D2_R2_MATURITY = "SURVEY_SPATIAL_AND_SURFACE_CONTEXT_IMPLEMENTED" as const;
export const D2_R2_MATURITY_STATE = D2_R2_MATURITY;
export const D2_R2_CLOSEOUT_PATH = "docs/architecture/engineering-os/EOS_D2_R2_SURVEY_SPATIAL_AND_SURFACE_CONTEXT_CLOSEOUT.md" as const;
export const D2_R2_R1_IDENTITY_READY = D2_CIVIL_IDENTITY_AND_OBJECT_FOUNDATION_RUNTIME_READY;
export const D2_RUNTIME_STARTED = true as const;
export const D2_RUNTIME_COUNT = 2 as const;
export const D2_SURVEY_SPATIAL_SURFACE_RUNTIME_READY = true as const;
export const D2_R1_CIVIL_IDENTITY_REUSED = true as const;
export const EXACT_R1_CIVIL_CONTEXT_REFERENCE_REQUIRED = true as const;
export const FLOATING_R1_CIVIL_CONTEXT_REFERENCE_ALLOWED = false as const;
export const D2_SPATIAL_REFERENCE_RUNTIME_IMPLEMENTED = true as const;
export const D2_SPATIAL_REFERENCE_RUNTIME_COUNT = 1 as const;
export const D2_SURVEY_SOURCE_CONTEXT_RUNTIME_IMPLEMENTED = true as const;
export const D2_SURFACE_CONTEXT_RUNTIME_IMPLEMENTED = true as const;
export const UNKNOWN_CRS_AUTO_INFERRED = false as const;
export const UNKNOWN_HORIZONTAL_DATUM_AUTO_INFERRED = false as const;
export const UNKNOWN_VERTICAL_DATUM_AUTO_INFERRED = false as const;
export const AI_CAN_INVENT_SURVEY_OBSERVATIONS = false as const;
export const AI_CAN_INVENT_SURVEY_DATUM = false as const;
export const SURVEY_SOURCE_PRESENT_EQUALS_ENGINEERING_VALIDATED = false as const;
export const SURFACE_CONTEXT_PRESENT_EQUALS_TERRAIN_GENERATED = false as const;
export const SURFACE_CONTEXT_PRESENT_EQUALS_SURFACE_VALIDATED = false as const;
export const SURFACE_CONTEXT_PRESENT_EQUALS_ENGINEERING_APPROVED = false as const;
export const EXISTING_SURFACE_EQUALS_AUTHORITATIVE_SURVEY = false as const;
export const PROPOSED_SURFACE_EQUALS_APPROVED_GRADING_DESIGN = false as const;
export const CANONICAL_CURRENTNESS_REUSED = true as const;
export const PARALLEL_D2_CURRENTNESS_ENGINE_CREATED = false as const;
export const D2_SPATIAL_CONTEXT_AUTO_REPOINTED = false as const;
export const D2_SURVEY_CONTEXT_AUTO_REPOINTED = false as const;
export const D2_SURFACE_CONTEXT_AUTO_REPOINTED = false as const;
export const AI_EQUALS_D2_CIVIL_ENGINEERING_AUTHORITY = false as const;
export const ADMIN_EQUALS_D2_CIVIL_ENGINEERING_AUTHORITY = false as const;
export const TENANT_WORKSPACE_PROJECT_D2_SPATIAL_SCOPE_ENFORCED = true as const;
export const D2_SPATIAL_PROVENANCE_REQUIRED = true as const;
export const D2_SPATIAL_PROVENANCE_PRESERVED = true as const;
export const D2_CANONICAL_FINGERPRINT_REUSED = true as const;
export const D2_SECOND_FINGERPRINT_ALGORITHM_CREATED = false as const;
export const D2_SPATIAL_SURFACE_FINGERPRINT_IMPLEMENTED = true as const;
export const FINGERPRINT_VERIFIED_EQUALS_ENGINEERING_VALIDATED = false as const;
export const SILENT_D2_SPATIAL_SURFACE_MUTATION_ALLOWED = false as const;
export const D2_SPATIAL_SURFACE_HISTORY_PRESERVED = true as const;
export const D2_SURFACE_CONTEXT_ROLES = ["EXISTING_SURFACE", "DESIGN_SURFACE", "IMPORTED_REFERENCE_SURFACE", "DERIVED_SURFACE_REFERENCE"] as const;

export const D2_GRADING_EARTHWORKS_RUNTIME_READY = false as const;
export const D2_ROADS_ACCESS_RUNTIME_READY = false as const;
export const D2_DRAINAGE_STORMWATER_RUNTIME_READY = false as const;
export const D2_CIVIL_UTILITY_CORRIDOR_RUNTIME_READY = false as const;
export const D2_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY = false as const;
export const D2_DISCIPLINE_INTERFACE_RUNTIME_READY = false as const;
export const D2_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_READY = false as const;
export const D2_CURRENTNESS_DIGITAL_THREAD_RUNTIME_READY = false as const;
export const D2_D9_SOURCE_CONTRACT_RUNTIME_READY = false as const;
export const D2_SURVEY_OBSERVATION_RUNTIME_COUNT = 0 as const;
export const D2_TERRAIN_GENERATION_RUNTIME_COUNT = 0 as const;
export const D2_SURFACE_INTERPOLATION_RUNTIME_COUNT = 0 as const;
export const D2_GRADING_RUNTIME_COUNT = 0 as const;
export const D2_EARTHWORKS_CALCULATION_RUNTIME_COUNT = 0 as const;
export const D2_QUANTITY_CALCULATION_RUNTIME_COUNT = 0 as const;
export const D2_ROAD_DESIGN_RUNTIME_COUNT = 0 as const;
export const D2_DRAINAGE_RUNTIME_COUNT = 0 as const;
export const D2_HYDROLOGY_CALCULATION_RUNTIME_COUNT = 0 as const;
export const D2_HYDRAULIC_CALCULATION_RUNTIME_COUNT = 0 as const;
export const D2_CIVIL_UTILITY_GEOMETRY_RUNTIME_COUNT = 0 as const;
export const D2_CIVIL_VALIDATION_RUNTIME_COUNT = 0 as const;
export const D2_CIVIL_APPROVAL_RUNTIME_COUNT = 0 as const;
export const D2_CIVIL_CERTIFICATION_RUNTIME_COUNT = 0 as const;
export const D2_D1_RUNTIME_INTEGRATION_COUNT = 0 as const;
export const D2_D3_RUNTIME_INTEGRATION_COUNT = 0 as const;
export const D2_D4_D8_RUNTIME_INTEGRATION_COUNT = 0 as const;
export const D2_D9_RUNTIME_INTEGRATION_COUNT = 0 as const;
export const D3_D9_RUNTIME_STARTED = false as const;
export const DATABASE_SCHEMA_CHANGED = false as const;
export const NEW_DEPENDENCY_ADDED = false as const;

export const D2_R3_CANONICAL_PHASE = D2_IMPLEMENTATION_PHASES[2];
export const D2_R3_PHASE_TYPE = "GRADING_AND_EARTHWORKS_CONTEXT" as const;
export const D2_R3_CANONICAL_SCOPE =
  "Implement bounded governed grading and earthworks context using exact R1 identity and R2 spatial/surface references. Record grading zones, level/slope criteria, earthworks zones, explicit relationships, assumptions/evidence references, provenance, currentness and fingerprint. Do not calculate cut/fill quantities, optimize grading, perform slope stability, generate terrain, design roads, calculate drainage, or start D3-D9." as const;
export const D2_R3_STARTED = false as const;
export const D2_R2_READY_FOR_NEXT_PHASE = true as const;
export const D2_R2_NEXT_PHASE = D2_R3_CANONICAL_PHASE;
export const D2_R2_NEXT_PHASE_TYPE = D2_R3_PHASE_TYPE;
export const D2_R2_CANONICAL_NEXT_PHASE = D2_R3_CANONICAL_PHASE;
export const D2_R2_CANONICAL_NEXT_PHASE_SCOPE = D2_R3_CANONICAL_SCOPE;
export const D2_R2_BLOCKER = "NONE" as const;
export const D2_R2_MACHINE_READABLE_ROADMAP_UPDATED = true as const;

const FLOATING = new Set(["latest", "current", "newest", "head", "active", "active model"]);
const INFERRED = new Set(["inferred", "unknown", "auto", "default"]);

type Prohibited = {
  inferCrs?: boolean;
  inferHorizontalDatum?: boolean;
  inferVerticalDatum?: boolean;
  inventDatum?: boolean;
  inventObservations?: boolean;
  observations?: readonly unknown[] | null;
  terrainGeneration?: boolean;
  interpolateSurface?: boolean;
  coordinates?: readonly unknown[] | null;
  grading?: boolean;
  earthworks?: boolean;
  quantity?: boolean;
  roadDesign?: boolean;
  drainage?: boolean;
  validation?: boolean;
  approval?: boolean;
  certification?: boolean;
  repoint?: boolean;
  d1Integration?: boolean;
  d3Integration?: boolean;
  d9Reasoning?: boolean;
};

export type D2R2SpatialInput = Prohibited & {
  spatialReferenceId: string;
  contextId: string;
  objectId: string;
  coordinateReferenceSystemId: string;
  horizontalDatum: string;
  verticalDatum: string;
  projectCoordinateContext: string;
  coordinateUnit?: string | null;
  sourceAuthorityRef: string;
  provenanceRef: string;
  citedCurrentness: string;
  assertedFingerprint?: string;
  predecessorSpatialReferenceId?: string | null;
  tenantId?: string;
  workspaceId?: string;
  projectId?: string;
};

export type D2R2SpatialRecord = {
  spatialReferenceId: string;
  contextId: string;
  objectId: string;
  coordinateReferenceSystemId: string;
  horizontalDatum: string;
  verticalDatum: string;
  projectCoordinateContext: string;
  coordinateUnit: string | null;
  sourceAuthorityRef: string;
  provenanceRef: string;
  citedCurrentness: (typeof D2_CURRENTNESS_STATES)[number];
  authority: typeof D2_CONTEXT_AUTHORITY;
  civilEngineeringAuthority: false;
  engineeringValidated: false;
  fingerprint: string;
  recordedBy: string;
  recordedAt: string;
  recordStatus: "CURRENT" | "SUPERSEDED";
  predecessorSpatialReferenceId: string | null;
  tenantId: string;
  workspaceId: string;
  projectId: string;
};

export type D2R2SurveyInput = Prohibited & {
  surveySourceId: string;
  contextId: string;
  objectId: string;
  spatialReferenceId: string;
  sourceType: string;
  sourceRevision: string;
  surveyDate?: string | null;
  sourceOrganization?: string | null;
  provenanceRef: string;
  citedCurrentness: string;
  assertedFingerprint?: string;
  predecessorSurveySourceId?: string | null;
  tenantId?: string;
  workspaceId?: string;
  projectId?: string;
};

export type D2R2SurveyRecord = {
  surveySourceId: string;
  contextId: string;
  objectId: string;
  spatialReferenceId: string;
  sourceType: string;
  sourceRevision: string;
  surveyDate: string | null;
  sourceOrganization: string | null;
  provenanceRef: string;
  citedCurrentness: (typeof D2_CURRENTNESS_STATES)[number];
  authority: typeof D2_CONTEXT_AUTHORITY;
  civilEngineeringAuthority: false;
  engineeringValidated: false;
  fingerprint: string;
  recordedBy: string;
  recordedAt: string;
  recordStatus: "CURRENT" | "SUPERSEDED";
  predecessorSurveySourceId: string | null;
  tenantId: string;
  workspaceId: string;
  projectId: string;
};

export type D2R2SurfaceInput = Prohibited & {
  surfaceContextId: string;
  contextId: string;
  objectId: string;
  surfaceRole: string;
  spatialReferenceId: string;
  surveySourceId?: string | null;
  sourceReference: string;
  revision: string;
  provenanceRef: string;
  citedCurrentness: string;
  assertedFingerprint?: string;
  predecessorSurfaceContextId?: string | null;
  tenantId?: string;
  workspaceId?: string;
  projectId?: string;
};

export type D2R2SurfaceRecord = {
  surfaceContextId: string;
  contextId: string;
  objectId: string;
  surfaceRole: (typeof D2_SURFACE_CONTEXT_ROLES)[number];
  spatialReferenceId: string;
  surveySourceId: string | null;
  sourceReference: string;
  revision: string;
  provenanceRef: string;
  citedCurrentness: (typeof D2_CURRENTNESS_STATES)[number];
  authority: typeof D2_CONTEXT_AUTHORITY;
  civilEngineeringAuthority: false;
  engineeringValidated: false;
  engineeringApproved: false;
  terrainGenerated: false;
  fingerprint: string;
  recordedBy: string;
  recordedAt: string;
  recordStatus: "CURRENT" | "SUPERSEDED";
  predecessorSurfaceContextId: string | null;
  tenantId: string;
  workspaceId: string;
  projectId: string;
};

export type D2R2History = {
  historyId: string;
  subjectKind: "SPATIAL" | "SURVEY" | "SURFACE";
  subjectId: string;
  action: "CREATED" | "SUPERSEDED";
  fingerprint: string;
  recordedAt: string;
};

export type D2R2Store = {
  r1: D2R1Store;
  now: () => string;
  spatial: D2R2SpatialRecord[];
  surveys: D2R2SurveyRecord[];
  surfaces: D2R2SurfaceRecord[];
  history: D2R2History[];
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

function isCurrentness(value: string): value is (typeof D2_CURRENTNESS_STATES)[number] {
  return (D2_CURRENTNESS_STATES as readonly string[]).includes(value);
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
  if (input.inferCrs === true) fail("CRS_NOT_INFERRED");
  if (input.inferHorizontalDatum === true) fail("HORIZONTAL_DATUM_NOT_INFERRED");
  if (input.inferVerticalDatum === true) fail("VERTICAL_DATUM_NOT_INFERRED");
  if (input.inventDatum === true) fail("DATUM_NOT_INVENTED");
  if (input.inventObservations === true || (input.observations != null && input.observations.length >= 0)) fail("SURVEY_OBSERVATION_NOT_IN_R2");
  if (input.terrainGeneration === true) fail("TERRAIN_NOT_IN_R2");
  if (input.interpolateSurface === true) fail("INTERPOLATION_NOT_IN_R2");
  if (input.coordinates != null) fail("COORDINATES_NOT_IN_R2");
  if (input.grading === true) fail("GRADING_NOT_IN_R2");
  if (input.earthworks === true) fail("EARTHWORKS_NOT_IN_R2");
  if (input.quantity === true) fail("QUANTITY_NOT_IN_R2");
  if (input.roadDesign === true) fail("ROAD_DESIGN_NOT_IN_R2");
  if (input.drainage === true) fail("DRAINAGE_NOT_IN_R2");
  if (input.validation === true) fail("VALIDATION_NOT_IN_R2");
  if (input.approval === true) fail("APPROVAL_NOT_IN_R2");
  if (input.certification === true) fail("CERTIFICATION_NOT_IN_R2");
  if (input.repoint === true) fail("AUTO_REPOINT_REJECTED");
  if (input.d1Integration === true || input.d3Integration === true || input.d9Reasoning === true) fail("OTHER_DISCIPLINE_NOT_IN_R2");
}

function currentnessOf(value: string): (typeof D2_CURRENTNESS_STATES)[number] {
  const token = value.trim();
  if (!isCurrentness(token)) fail("CURRENTNESS_INVALID");
  return token;
}

function requireContext(store: D2R2Store, actor: D2R1Actor, contextId: string, citedCurrentness: (typeof D2_CURRENTNESS_STATES)[number]) {
  const id = explicit(contextId, "R1_CONTEXT_REQUIRED");
  const context = store.r1.contexts.find((row) => row.contextId === id);
  if (!context) fail("R1_CONTEXT_NOT_FOUND");
  if (context.tenantId !== actor.tenantId) fail("CROSS_TENANT_OPERATION");
  if (context.workspaceId !== actor.workspaceId) fail("CROSS_WORKSPACE_OPERATION");
  if (context.projectId !== actor.projectId) fail("CROSS_PROJECT_OPERATION");
  if (context.discipline !== D2_DISCIPLINE) fail("DISCIPLINE_NOT_CIVIL");
  if (citedCurrentness === "CURRENT" && context.recordStatus !== "CURRENT") fail("R1_CONTEXT_NOT_CURRENT");
  return context;
}

function requireObject(store: D2R2Store, actor: D2R1Actor, contextId: string, objectId: string, objectType: "COORDINATE_REFERENCE" | "SURVEY_SOURCE" | "SURFACE_REFERENCE", citedCurrentness: (typeof D2_CURRENTNESS_STATES)[number]) {
  const id = explicit(objectId, "R1_OBJECT_REQUIRED");
  const object = store.r1.objects.find((row) => row.objectId === id);
  if (!object) fail("R1_OBJECT_NOT_FOUND");
  if (object.objectType !== objectType) fail("R1_OBJECT_TYPE_MISMATCH");
  if (object.contextId !== contextId) fail("R1_CONTEXT_MISMATCH");
  if (object.tenantId !== actor.tenantId) fail("CROSS_TENANT_OPERATION");
  if (object.workspaceId !== actor.workspaceId) fail("CROSS_WORKSPACE_OPERATION");
  if (object.projectId !== actor.projectId) fail("CROSS_PROJECT_OPERATION");
  if (citedCurrentness === "CURRENT" && object.recordStatus !== "CURRENT") fail("R1_OBJECT_NOT_CURRENT");
  return object;
}

function remember(store: D2R2Store, subjectKind: D2R2History["subjectKind"], subjectId: string, action: D2R2History["action"], fingerprint: string): void {
  store.history.push({
    historyId: `hist-${store.history.length + 1}`,
    subjectKind,
    subjectId,
    action,
    fingerprint,
    recordedAt: store.now(),
  });
}

export function createD2R2Store(r1: D2R1Store, now: () => string = () => "2026-10-22T00:00:00.000Z"): D2R2Store {
  return { r1, now, spatial: [], surveys: [], surfaces: [], history: [] };
}

export function recordSpatialReference(store: D2R2Store, actor: D2R1Actor, input: D2R2SpatialInput): D2R2SpatialRecord {
  assertActor(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const citedCurrentness = currentnessOf(input.citedCurrentness);
  const context = requireContext(store, actor, input.contextId, citedCurrentness);
  const object = requireObject(store, actor, context.contextId, input.objectId, "COORDINATE_REFERENCE", citedCurrentness);
  const coordinateReferenceSystemId = explicit(input.coordinateReferenceSystemId, "CRS_REQUIRED");
  const horizontalDatum = explicit(input.horizontalDatum, "HORIZONTAL_DATUM_REQUIRED");
  const verticalDatum = explicit(input.verticalDatum, "VERTICAL_DATUM_REQUIRED");
  const projectCoordinateContext = explicit(input.projectCoordinateContext, "PROJECT_COORDINATE_CONTEXT_REQUIRED");
  const sourceAuthorityRef = explicit(input.sourceAuthorityRef, "SOURCE_AUTHORITY_REQUIRED");
  const provenanceRef = explicit(input.provenanceRef, "MISSING_PROVENANCE");
  const coordinateUnit = input.coordinateUnit == null || input.coordinateUnit === "" ? null : explicit(input.coordinateUnit, "COORDINATE_UNIT_INVALID");
  const spatialReferenceId = explicit(input.spatialReferenceId, "SPATIAL_REFERENCE_REQUIRED");
  const predecessor = input.predecessorSpatialReferenceId ? store.spatial.find((row) => row.spatialReferenceId === input.predecessorSpatialReferenceId) : null;
  if (input.predecessorSpatialReferenceId) {
    if (!predecessor) fail("SPATIAL_REFERENCE_NOT_FOUND");
    if (predecessor.tenantId !== actor.tenantId || predecessor.contextId !== context.contextId) fail("R1_CONTEXT_MISMATCH");
    if (predecessor.recordStatus !== "CURRENT") fail("PREDECESSOR_NOT_CURRENT");
  }
  const fingerprint = fingerprintCanonical({
    spatialReferenceId,
    contextId: context.contextId,
    objectId: object.objectId,
    coordinateReferenceSystemId,
    horizontalDatum,
    verticalDatum,
    projectCoordinateContext,
    coordinateUnit,
    sourceAuthorityRef,
    provenanceRef,
    citedCurrentness,
    authority: D2_CONTEXT_AUTHORITY,
    predecessorSpatialReferenceId: predecessor?.spatialReferenceId ?? null,
  });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.spatial.find((row) => row.spatialReferenceId === spatialReferenceId);
  if (existing) {
    if (existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId) return existing;
    fail("SPATIAL_REFERENCE_ALREADY_RECORDED");
  }
  const duplicate = store.spatial.find((row) => row.recordStatus === "CURRENT" && row.spatialReferenceId !== predecessor?.spatialReferenceId && row.contextId === context.contextId && row.objectId === object.objectId && row.coordinateReferenceSystemId === coordinateReferenceSystemId && row.horizontalDatum === horizontalDatum && row.verticalDatum === verticalDatum && row.projectCoordinateContext === projectCoordinateContext);
  if (duplicate) fail("DUPLICATE_SPATIAL_REFERENCE_REJECTED");
  const record: D2R2SpatialRecord = Object.freeze({
    spatialReferenceId,
    contextId: context.contextId,
    objectId: object.objectId,
    coordinateReferenceSystemId,
    horizontalDatum,
    verticalDatum,
    projectCoordinateContext,
    coordinateUnit,
    sourceAuthorityRef,
    provenanceRef,
    citedCurrentness,
    authority: D2_CONTEXT_AUTHORITY,
    civilEngineeringAuthority: false,
    engineeringValidated: false,
    fingerprint,
    recordedBy: actor.actorId,
    recordedAt: store.now(),
    recordStatus: "CURRENT",
    predecessorSpatialReferenceId: predecessor?.spatialReferenceId ?? null,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
  });
  if (predecessor) {
    const index = store.spatial.findIndex((row) => row.spatialReferenceId === predecessor.spatialReferenceId);
    const superseded: D2R2SpatialRecord = Object.freeze({ ...predecessor, recordStatus: "SUPERSEDED", citedCurrentness: "SUPERSEDED" });
    store.spatial[index] = superseded;
    remember(store, "SPATIAL", superseded.spatialReferenceId, "SUPERSEDED", superseded.fingerprint);
  }
  store.spatial.push(record);
  remember(store, "SPATIAL", record.spatialReferenceId, "CREATED", record.fingerprint);
  return record;
}

export function recordSurveySourceContext(store: D2R2Store, actor: D2R1Actor, input: D2R2SurveyInput): D2R2SurveyRecord {
  assertActor(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const citedCurrentness = currentnessOf(input.citedCurrentness);
  const context = requireContext(store, actor, input.contextId, citedCurrentness);
  const object = requireObject(store, actor, context.contextId, input.objectId, "SURVEY_SOURCE", citedCurrentness);
  const spatial = store.spatial.find((row) => row.spatialReferenceId === input.spatialReferenceId);
  if (!spatial) fail("SPATIAL_REFERENCE_NOT_FOUND");
  if (spatial.contextId !== context.contextId || spatial.tenantId !== actor.tenantId) fail("R1_CONTEXT_MISMATCH");
  if (citedCurrentness === "CURRENT" && spatial.recordStatus !== "CURRENT") fail("SPATIAL_REFERENCE_NOT_CURRENT");
  const surveySourceId = explicit(input.surveySourceId, "SURVEY_SOURCE_REQUIRED");
  const sourceType = explicit(input.sourceType, "SURVEY_SOURCE_TYPE_REQUIRED");
  const sourceRevision = explicit(input.sourceRevision, "SURVEY_REVISION_REQUIRED");
  const provenanceRef = explicit(input.provenanceRef, "MISSING_PROVENANCE");
  const surveyDate = input.surveyDate == null || input.surveyDate === "" ? null : explicit(input.surveyDate, "SURVEY_DATE_INVALID");
  const sourceOrganization = input.sourceOrganization == null || input.sourceOrganization === "" ? null : explicit(input.sourceOrganization, "SOURCE_ORGANIZATION_INVALID");
  const predecessor = input.predecessorSurveySourceId ? store.surveys.find((row) => row.surveySourceId === input.predecessorSurveySourceId) : null;
  if (input.predecessorSurveySourceId) {
    if (!predecessor || predecessor.recordStatus !== "CURRENT" || predecessor.contextId !== context.contextId) fail("PREDECESSOR_NOT_CURRENT");
  }
  const fingerprint = fingerprintCanonical({
    surveySourceId,
    contextId: context.contextId,
    objectId: object.objectId,
    spatialReferenceId: spatial.spatialReferenceId,
    sourceType,
    sourceRevision,
    surveyDate,
    sourceOrganization,
    provenanceRef,
    citedCurrentness,
    authority: D2_CONTEXT_AUTHORITY,
    predecessorSurveySourceId: predecessor?.surveySourceId ?? null,
  });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.surveys.find((row) => row.surveySourceId === surveySourceId);
  if (existing) {
    if (existing.fingerprint === fingerprint) return existing;
    fail("SURVEY_SOURCE_ALREADY_RECORDED");
  }
  const duplicate = store.surveys.find((row) => row.recordStatus === "CURRENT" && row.surveySourceId !== predecessor?.surveySourceId && row.contextId === context.contextId && row.objectId === object.objectId && row.sourceRevision === sourceRevision && row.spatialReferenceId === spatial.spatialReferenceId);
  if (duplicate) fail("DUPLICATE_SURVEY_SOURCE_REJECTED");
  const record: D2R2SurveyRecord = Object.freeze({
    surveySourceId,
    contextId: context.contextId,
    objectId: object.objectId,
    spatialReferenceId: spatial.spatialReferenceId,
    sourceType,
    sourceRevision,
    surveyDate,
    sourceOrganization,
    provenanceRef,
    citedCurrentness,
    authority: D2_CONTEXT_AUTHORITY,
    civilEngineeringAuthority: false,
    engineeringValidated: false,
    fingerprint,
    recordedBy: actor.actorId,
    recordedAt: store.now(),
    recordStatus: "CURRENT",
    predecessorSurveySourceId: predecessor?.surveySourceId ?? null,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
  });
  if (predecessor) {
    const index = store.surveys.findIndex((row) => row.surveySourceId === predecessor.surveySourceId);
    const superseded: D2R2SurveyRecord = Object.freeze({ ...predecessor, recordStatus: "SUPERSEDED", citedCurrentness: "SUPERSEDED" });
    store.surveys[index] = superseded;
    remember(store, "SURVEY", superseded.surveySourceId, "SUPERSEDED", superseded.fingerprint);
  }
  store.surveys.push(record);
  remember(store, "SURVEY", record.surveySourceId, "CREATED", record.fingerprint);
  return record;
}

export function recordSurfaceContext(store: D2R2Store, actor: D2R1Actor, input: D2R2SurfaceInput): D2R2SurfaceRecord {
  assertActor(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const citedCurrentness = currentnessOf(input.citedCurrentness);
  const context = requireContext(store, actor, input.contextId, citedCurrentness);
  const object = requireObject(store, actor, context.contextId, input.objectId, "SURFACE_REFERENCE", citedCurrentness);
  if (!(D2_SURFACE_CONTEXT_ROLES as readonly string[]).includes(input.surfaceRole)) fail("SURFACE_ROLE_INVALID");
  const surfaceRole = input.surfaceRole as (typeof D2_SURFACE_CONTEXT_ROLES)[number];
  const spatial = store.spatial.find((row) => row.spatialReferenceId === input.spatialReferenceId);
  if (!spatial || spatial.contextId !== context.contextId || spatial.tenantId !== actor.tenantId) fail("SPATIAL_REFERENCE_NOT_FOUND");
  if (citedCurrentness === "CURRENT" && spatial.recordStatus !== "CURRENT") fail("SPATIAL_REFERENCE_NOT_CURRENT");
  const survey = input.surveySourceId ? store.surveys.find((row) => row.surveySourceId === input.surveySourceId) : null;
  if (input.surveySourceId) {
    if (!survey || survey.contextId !== context.contextId || survey.tenantId !== actor.tenantId) fail("SURVEY_SOURCE_NOT_FOUND");
    if (citedCurrentness === "CURRENT" && survey.recordStatus !== "CURRENT") fail("SURVEY_SOURCE_NOT_CURRENT");
  }
  if (surfaceRole === "EXISTING_SURFACE" && !survey) fail("EXISTING_SURFACE_SURVEY_REFERENCE_REQUIRED");
  const surfaceContextId = explicit(input.surfaceContextId, "SURFACE_CONTEXT_REQUIRED");
  const sourceReference = explicit(input.sourceReference, "SURFACE_SOURCE_REQUIRED");
  const revision = explicit(input.revision, "SURFACE_REVISION_REQUIRED");
  const provenanceRef = explicit(input.provenanceRef, "MISSING_PROVENANCE");
  const predecessor = input.predecessorSurfaceContextId ? store.surfaces.find((row) => row.surfaceContextId === input.predecessorSurfaceContextId) : null;
  if (input.predecessorSurfaceContextId) {
    if (!predecessor || predecessor.recordStatus !== "CURRENT" || predecessor.contextId !== context.contextId) fail("PREDECESSOR_NOT_CURRENT");
    if (predecessor.surfaceRole !== surfaceRole) fail("SURFACE_ROLE_SUBSTITUTION_REJECTED");
  }
  const fingerprint = fingerprintCanonical({
    surfaceContextId,
    contextId: context.contextId,
    objectId: object.objectId,
    surfaceRole,
    spatialReferenceId: spatial.spatialReferenceId,
    surveySourceId: survey?.surveySourceId ?? null,
    sourceReference,
    revision,
    provenanceRef,
    citedCurrentness,
    authority: D2_CONTEXT_AUTHORITY,
    predecessorSurfaceContextId: predecessor?.surfaceContextId ?? null,
  });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.surfaces.find((row) => row.surfaceContextId === surfaceContextId);
  if (existing) {
    if (existing.fingerprint === fingerprint) return existing;
    fail("SURFACE_CONTEXT_ALREADY_RECORDED");
  }
  const duplicate = store.surfaces.find((row) => row.recordStatus === "CURRENT" && row.surfaceContextId !== predecessor?.surfaceContextId && row.contextId === context.contextId && row.objectId === object.objectId && row.surfaceRole === surfaceRole && row.revision === revision);
  if (duplicate) fail("DUPLICATE_SURFACE_CONTEXT_REJECTED");
  const record: D2R2SurfaceRecord = Object.freeze({
    surfaceContextId,
    contextId: context.contextId,
    objectId: object.objectId,
    surfaceRole,
    spatialReferenceId: spatial.spatialReferenceId,
    surveySourceId: survey?.surveySourceId ?? null,
    sourceReference,
    revision,
    provenanceRef,
    citedCurrentness,
    authority: D2_CONTEXT_AUTHORITY,
    civilEngineeringAuthority: false,
    engineeringValidated: false,
    engineeringApproved: false,
    terrainGenerated: false,
    fingerprint,
    recordedBy: actor.actorId,
    recordedAt: store.now(),
    recordStatus: "CURRENT",
    predecessorSurfaceContextId: predecessor?.surfaceContextId ?? null,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
  });
  if (predecessor) {
    const index = store.surfaces.findIndex((row) => row.surfaceContextId === predecessor.surfaceContextId);
    const superseded: D2R2SurfaceRecord = Object.freeze({ ...predecessor, recordStatus: "SUPERSEDED", citedCurrentness: "SUPERSEDED" });
    store.surfaces[index] = superseded;
    remember(store, "SURFACE", superseded.surfaceContextId, "SUPERSEDED", superseded.fingerprint);
  }
  store.surfaces.push(record);
  remember(store, "SURFACE", record.surfaceContextId, "CREATED", record.fingerprint);
  return record;
}

export function mutateSpatialSurfaceContext(): never {
  return fail("SPATIAL_SURFACE_MUTATION_REJECTED");
}

export function generateTerrain(): never {
  return fail("TERRAIN_NOT_IN_R2");
}

export function interpolateSurface(): never {
  return fail("INTERPOLATION_NOT_IN_R2");
}
