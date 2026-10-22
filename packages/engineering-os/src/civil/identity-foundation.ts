/**
 * EOS-D2-R1 Civil identity and object foundation.
 * One bounded runtime. Identity only. No survey, surface, grading, or calculation data.
 */
import {
  D2_ARCHITECTURE_DEFINED,
  D2_ARCHITECTURE_READY,
  D2_CIVIL_OBJECT_CATEGORIES,
  D2_CIVIL_OBJECT_TYPES,
  D2_IMPLEMENTATION_PHASES,
  D2_MATURITY_STATES,
} from "@rtb/types";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";

export const D2_R1_STATUS = "CIVIL_IDENTITY_AND_OBJECT_FOUNDATION_IMPLEMENTED" as const;
export const D2_R1_MATURITY = "CIVIL_IDENTITY_AND_OBJECT_FOUNDATION_IMPLEMENTED" as const;
export const D2_R1_MATURITY_STATE = D2_R1_MATURITY;
export const D2_R1_CLOSEOUT_PATH = "docs/architecture/engineering-os/EOS_D2_R1_CIVIL_IDENTITY_AND_OBJECT_FOUNDATION_CLOSEOUT.md" as const;
export const D2_R1_PARENT_ARCHITECTURE_PATH = "docs/architecture/engineering-os/EOS_D2_0_CIVIL_ARCHITECTURE.md" as const;
export const D2_R1_ARCHITECTURE_DEFINED = D2_ARCHITECTURE_DEFINED;
export const D2_R1_ARCHITECTURE_READY = D2_ARCHITECTURE_READY;

export const D2_RUNTIME_STARTED = true as const;
export const D2_RUNTIME_COUNT = 1 as const;
export const D2_CIVIL_CONTEXT_RUNTIME_IMPLEMENTED = true as const;
export const D2_CIVIL_CONTEXT_RUNTIME_COUNT = 1 as const;
export const D2_CIVIL_OBJECT_IDENTITY_RUNTIME_IMPLEMENTED = true as const;
export const D2_CIVIL_IDENTITY_AND_OBJECT_FOUNDATION_RUNTIME_READY = true as const;
export const D2_CIVIL_OBJECT_TYPE_ALLOWLIST_IMPLEMENTED = true as const;
export const FREEFORM_AUTHORITATIVE_CIVIL_OBJECT_TYPE_ALLOWED = false as const;
export const UNKNOWN_CIVIL_OBJECT_TYPE_AUTO_ACCEPTED = false as const;
export const EXPLICIT_CIVIL_OBJECT_RELATIONSHIPS_SUPPORTED = true as const;
export const INFERRED_CIVIL_ENGINEERING_RELATIONSHIPS_ALLOWED = false as const;
export const TENANT_WORKSPACE_PROJECT_CIVIL_SCOPE_ENFORCED = true as const;
export const D2_AUTOMATIC_MATURITY_PROGRESSION_RUNTIME_COUNT = 0 as const;
export const MATURITY_STAGE_EQUALS_ENGINEERING_VALIDATED = false as const;
export const MATURITY_STAGE_EQUALS_ENGINEERING_APPROVED = false as const;
export const MATURITY_STAGE_EQUALS_CERTIFIED = false as const;
export const D2_CIVIL_IDENTITY_PROVENANCE_REQUIRED = true as const;
export const D2_CIVIL_IDENTITY_PROVENANCE_PRESERVED = true as const;
export const D2_CANONICAL_FINGERPRINT_REUSED = true as const;
export const D2_SECOND_FINGERPRINT_ALGORITHM_CREATED = false as const;
export const D2_CIVIL_IDENTITY_FINGERPRINT_IMPLEMENTED = true as const;
export const FINGERPRINT_VERIFIED_EQUALS_ENGINEERING_VALIDATED = false as const;
export const SILENT_CIVIL_IDENTITY_MUTATION_ALLOWED = false as const;
export const D2_CIVIL_IDENTITY_HISTORY_PRESERVED = true as const;
export const D2_DUPLICATE_CIVIL_IDENTITY_GOVERNED = true as const;
export const D2_CIVIL_IDENTITY_REPLAY_GOVERNED = true as const;
export const D2_CIVIL_IDENTITY_SPOOFING_PROTECTION_IMPLEMENTED = true as const;
export const AI_EQUALS_D2_CIVIL_ENGINEERING_AUTHORITY = false as const;
export const ADMIN_EQUALS_D2_CIVIL_ENGINEERING_AUTHORITY = false as const;
export const D2_CONTEXT_AUTHORITY = "CIVIL_CONTEXT_AUTHORITY" as const;
export const D2_DISCIPLINE = "CIVIL" as const;

export const D2_SURVEY_SPATIAL_SURFACE_RUNTIME_READY = false as const;
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
export const D2_SURFACE_RUNTIME_COUNT = 0 as const;
export const D2_GRADING_RUNTIME_COUNT = 0 as const;
export const D2_EARTHWORKS_CALCULATION_RUNTIME_COUNT = 0 as const;
export const D2_ROAD_DESIGN_RUNTIME_COUNT = 0 as const;
export const D2_DRAINAGE_RUNTIME_COUNT = 0 as const;
export const D2_HYDROLOGY_CALCULATION_RUNTIME_COUNT = 0 as const;
export const D2_HYDRAULIC_CALCULATION_RUNTIME_COUNT = 0 as const;
export const D2_CIVIL_UTILITY_GEOMETRY_RUNTIME_COUNT = 0 as const;
export const D2_QUANTITY_CALCULATION_RUNTIME_COUNT = 0 as const;
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
export const NEW_SUBSTANTIVE_RUNTIME_ADDED = false as const;

export const D2_R2_CANONICAL_PHASE = D2_IMPLEMENTATION_PHASES[1];
export const D2_R2_PHASE_TYPE = "SURVEY_SPATIAL_AND_SURFACE_CONTEXT" as const;
export const D2_R2_CANONICAL_SCOPE =
  "Implement bounded governed Civil survey, spatial, and surface context on top of exact R1 Civil identity. Record coordinate reference, datum, survey and source references, surface identity and context, provenance, currentness, and fingerprint. Do not perform terrain generation, earthworks calculations, grading design, road design, drainage calculations, or start D3 through D9." as const;
export const D2_R2_STARTED = false as const;
export const D2_R1_READY_FOR_NEXT_PHASE = true as const;
export const D2_R1_NEXT_PHASE = D2_R2_CANONICAL_PHASE;
export const D2_R1_NEXT_PHASE_TYPE = D2_R2_PHASE_TYPE;
export const D2_R1_CANONICAL_NEXT_PHASE = D2_R2_CANONICAL_PHASE;
export const D2_R1_CANONICAL_NEXT_PHASE_SCOPE = D2_R2_CANONICAL_SCOPE;
export const D2_R1_BLOCKER = "NONE" as const;
export const D2_R1_MACHINE_READABLE_ROADMAP_UPDATED = true as const;

const OBJECT_CATEGORY = {
  CIVIL_SITE: "SITE_AND_SPATIAL_REFERENCE",
  SURVEY_SOURCE: "SITE_AND_SPATIAL_REFERENCE",
  COORDINATE_REFERENCE: "SITE_AND_SPATIAL_REFERENCE",
  SURFACE_REFERENCE: "SURFACE_CONTEXT",
  GRADING_ZONE: "GRADING_AND_EARTHWORKS",
  FINISHED_LEVEL: "GRADING_AND_EARTHWORKS",
  EARTHWORKS_ZONE: "GRADING_AND_EARTHWORKS",
  ROAD_ALIGNMENT: "ROADS_AND_ACCESS",
  ROAD_PROFILE: "ROADS_AND_ACCESS",
  ROAD_CORRIDOR: "ROADS_AND_ACCESS",
  PAVEMENT_CONTEXT: "ROADS_AND_ACCESS",
  DRAINAGE_CATCHMENT: "DRAINAGE_AND_STORMWATER",
  RAINFALL_REFERENCE: "DRAINAGE_AND_STORMWATER",
  DRAINAGE_NETWORK: "DRAINAGE_AND_STORMWATER",
  DRAINAGE_NODE: "DRAINAGE_AND_STORMWATER",
  DRAINAGE_LINK: "DRAINAGE_AND_STORMWATER",
  CHANNEL: "DRAINAGE_AND_STORMWATER",
  CULVERT_REFERENCE: "DRAINAGE_AND_STORMWATER",
  STORMWATER_OUTFALL: "DRAINAGE_AND_STORMWATER",
  DETENTION_REFERENCE: "DRAINAGE_AND_STORMWATER",
  CIVIL_UTILITY_CORRIDOR: "CIVIL_UTILITY_AND_CORRIDOR",
  TRENCH: "CIVIL_UTILITY_AND_CORRIDOR",
  PIT: "CIVIL_UTILITY_AND_CORRIDOR",
  MANHOLE: "CIVIL_UTILITY_AND_CORRIDOR",
  CROSSING: "CIVIL_UTILITY_AND_CORRIDOR",
  CLEARANCE_ENVELOPE: "CIVIL_UTILITY_AND_CORRIDOR",
  EROSION_CONTROL_CONTEXT: "EROSION_AND_SEDIMENT_CONTROL_CONTEXT",
  CIVIL_REQUIREMENT: "CIVIL_GOVERNANCE_RECORDS",
  CIVIL_ASSUMPTION: "CIVIL_GOVERNANCE_RECORDS",
  CIVIL_DECISION: "CIVIL_GOVERNANCE_RECORDS",
  CIVIL_EVIDENCE_REFERENCE: "CIVIL_GOVERNANCE_RECORDS",
  CIVIL_INTERFACE: "CIVIL_GOVERNANCE_RECORDS",
  CIVIL_STANDARD_REFERENCE: "CIVIL_GOVERNANCE_RECORDS",
} as const satisfies Record<(typeof D2_CIVIL_OBJECT_TYPES)[number], (typeof D2_CIVIL_OBJECT_CATEGORIES)[number]>;

export const D2_EXPLICIT_RELATIONSHIP_KINDS = ["PARENT", "OBJECT_REFERENCE"] as const;
const FLOATING = new Set(["latest", "current", "newest", "head", "active", "active model"]);

export type D2R1Actor = {
  actorId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  authority: string;
};

export type D2R1Relationship = {
  kind: (typeof D2_EXPLICIT_RELATIONSHIP_KINDS)[number];
  targetObjectId: string;
};

type Prohibited = {
  surveyObservation?: boolean;
  surfaceModel?: boolean;
  gradingDesign?: boolean;
  earthworksQuantity?: boolean;
  roadDesign?: boolean;
  drainageCalculation?: boolean;
  hydrology?: boolean;
  hydraulics?: boolean;
  utilityGeometry?: boolean;
  quantity?: boolean;
  engineeringValidated?: boolean;
  engineeringApproved?: boolean;
  certified?: boolean;
  advanceMaturity?: boolean;
  d1Integration?: boolean;
  d3Integration?: boolean;
  d4Integration?: boolean;
  d9Reasoning?: boolean;
  inferredRelationship?: boolean;
};

export type D2R1ContextInput = Prohibited & {
  contextId: string;
  citedLifecycleStage: string;
  provenanceRef: string;
  assertedFingerprint?: string;
  predecessorContextId?: string | null;
  tenantId?: string;
  workspaceId?: string;
  projectId?: string;
  discipline?: string;
};

export type D2R1ContextRecord = {
  contextId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  discipline: typeof D2_DISCIPLINE;
  citedLifecycleStage: (typeof D2_MATURITY_STATES)[number];
  authority: typeof D2_CONTEXT_AUTHORITY;
  civilEngineeringAuthority: false;
  provenanceRef: string;
  fingerprint: string;
  recordedBy: string;
  recordedAt: string;
  recordStatus: "CURRENT" | "SUPERSEDED";
  predecessorContextId: string | null;
};

export type D2R1ObjectInput = Prohibited & {
  objectId: string;
  contextId: string;
  objectType: string;
  objectCategory?: string;
  citedLifecycleStage: string;
  provenanceRef: string;
  parentObjectId?: string | null;
  relationships?: readonly { kind: string; targetObjectId: string }[];
  assertedFingerprint?: string;
  predecessorObjectId?: string | null;
  tenantId?: string;
  workspaceId?: string;
  projectId?: string;
};

export type D2R1ObjectRecord = {
  objectId: string;
  contextId: string;
  objectType: (typeof D2_CIVIL_OBJECT_TYPES)[number];
  objectCategory: (typeof D2_CIVIL_OBJECT_CATEGORIES)[number];
  tenantId: string;
  workspaceId: string;
  projectId: string;
  discipline: typeof D2_DISCIPLINE;
  citedLifecycleStage: (typeof D2_MATURITY_STATES)[number];
  parentObjectId: string | null;
  relationships: readonly D2R1Relationship[];
  authority: typeof D2_CONTEXT_AUTHORITY;
  civilEngineeringAuthority: false;
  provenanceRef: string;
  fingerprint: string;
  recordedBy: string;
  recordedAt: string;
  recordStatus: "CURRENT" | "SUPERSEDED";
  predecessorObjectId: string | null;
};

export type D2R1History = {
  historyId: string;
  subjectKind: "CONTEXT" | "OBJECT";
  subjectId: string;
  action: "CREATED" | "SUPERSEDED";
  fingerprint: string;
  actorId: string;
  authority: typeof D2_CONTEXT_AUTHORITY;
  recordedAt: string;
};

export type D2R1Store = {
  now: () => string;
  contexts: D2R1ContextRecord[];
  objects: D2R1ObjectRecord[];
  history: D2R1History[];
};

function fail(code: string): never {
  throw new Error(code);
}

function blockedParty(value: string): boolean {
  return /^AI(?:\b|_)/i.test(value) || /LLM/i.test(value) || /OPTIMIZER/i.test(value);
}

function isStage(value: string): value is (typeof D2_MATURITY_STATES)[number] {
  return (D2_MATURITY_STATES as readonly string[]).includes(value);
}

function isObjectType(value: string): value is (typeof D2_CIVIL_OBJECT_TYPES)[number] {
  return (D2_CIVIL_OBJECT_TYPES as readonly string[]).includes(value);
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
  if (input.surveyObservation === true) fail("SURVEY_OBSERVATION_NOT_IN_R1");
  if (input.surfaceModel === true) fail("SURFACE_NOT_IN_R1");
  if (input.gradingDesign === true) fail("GRADING_NOT_IN_R1");
  if (input.earthworksQuantity === true) fail("EARTHWORKS_CALCULATION_NOT_IN_R1");
  if (input.roadDesign === true) fail("ROAD_DESIGN_NOT_IN_R1");
  if (input.drainageCalculation === true) fail("DRAINAGE_NOT_IN_R1");
  if (input.hydrology === true) fail("HYDROLOGY_NOT_IN_R1");
  if (input.hydraulics === true) fail("HYDRAULICS_NOT_IN_R1");
  if (input.utilityGeometry === true) fail("UTILITY_GEOMETRY_NOT_IN_R1");
  if (input.quantity === true) fail("QUANTITY_NOT_IN_R1");
  if (input.engineeringValidated === true) fail("VALIDATION_NOT_IN_R1");
  if (input.engineeringApproved === true) fail("APPROVAL_NOT_IN_R1");
  if (input.certified === true) fail("CERTIFICATION_NOT_IN_R1");
  if (input.advanceMaturity === true) fail("MATURITY_PROGRESSION_NOT_IN_R1");
  if (input.d1Integration === true) fail("D1_INTEGRATION_NOT_IN_R1");
  if (input.d3Integration === true) fail("D3_INTEGRATION_NOT_IN_R1");
  if (input.d4Integration === true) fail("D4_D8_INTEGRATION_NOT_IN_R1");
  if (input.d9Reasoning === true) fail("D9_NOT_IN_R1");
  if (input.inferredRelationship === true) fail("INFERRED_RELATIONSHIP_REJECTED");
}

function assertIdentityToken(value: string, code: string): string {
  const token = value.trim();
  if (!token || FLOATING.has(token.toLowerCase()) || blockedParty(token)) fail(code);
  return token;
}

function remember(store: D2R1Store, subjectKind: D2R1History["subjectKind"], subjectId: string, action: D2R1History["action"], fingerprint: string, actor: D2R1Actor): void {
  store.history.push({
    historyId: `hist-${store.history.length + 1}`,
    subjectKind,
    subjectId,
    action,
    fingerprint,
    actorId: actor.actorId,
    authority: D2_CONTEXT_AUTHORITY,
    recordedAt: store.now(),
  });
}

export function createD2R1Store(now: () => string = () => "2026-10-22T00:00:00.000Z"): D2R1Store {
  return { now, contexts: [], objects: [], history: [] };
}

export function recordCivilContext(store: D2R1Store, actor: D2R1Actor, input: D2R1ContextInput): D2R1ContextRecord {
  assertActor(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const contextId = assertIdentityToken(input.contextId, "CONTEXT_IDENTITY_REQUIRED");
  if (!input.provenanceRef.trim() || blockedParty(input.provenanceRef)) fail("MISSING_PROVENANCE");
  if (input.discipline != null && input.discipline !== D2_DISCIPLINE) fail("DISCIPLINE_NOT_CIVIL");
  const stage = input.citedLifecycleStage.trim();
  if (!isStage(stage)) fail("MATURITY_STAGE_INVALID");
  const predecessor = input.predecessorContextId ? store.contexts.find((row) => row.contextId === input.predecessorContextId) : null;
  if (input.predecessorContextId) {
    if (!predecessor) fail("CONTEXT_NOT_FOUND");
    if (predecessor.tenantId !== actor.tenantId) fail("CROSS_TENANT_OPERATION");
    if (predecessor.workspaceId !== actor.workspaceId) fail("CROSS_WORKSPACE_OPERATION");
    if (predecessor.projectId !== actor.projectId) fail("CROSS_PROJECT_OPERATION");
    if (predecessor.recordStatus !== "CURRENT") fail("PREDECESSOR_NOT_CURRENT");
  }
  const fingerprint = fingerprintCanonical({
    contextId,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
    discipline: D2_DISCIPLINE,
    citedLifecycleStage: stage,
    provenanceRef: input.provenanceRef.trim(),
    authority: D2_CONTEXT_AUTHORITY,
    predecessorContextId: predecessor?.contextId ?? null,
  });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.contexts.find((row) => row.contextId === contextId);
  if (existing) {
    if (existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId) return existing;
    fail("CONTEXT_ALREADY_RECORDED");
  }
  const duplicate = store.contexts.find((row) => row.recordStatus === "CURRENT" && row.contextId !== predecessor?.contextId && row.tenantId === actor.tenantId && row.workspaceId === actor.workspaceId && row.projectId === actor.projectId);
  if (duplicate) fail("DUPLICATE_CONTEXT_REJECTED");
  const record: D2R1ContextRecord = Object.freeze({
    contextId,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
    discipline: D2_DISCIPLINE,
    citedLifecycleStage: stage,
    authority: D2_CONTEXT_AUTHORITY,
    civilEngineeringAuthority: false,
    provenanceRef: input.provenanceRef.trim(),
    fingerprint,
    recordedBy: actor.actorId,
    recordedAt: store.now(),
    recordStatus: "CURRENT",
    predecessorContextId: predecessor?.contextId ?? null,
  });
  if (predecessor) {
    const index = store.contexts.findIndex((row) => row.contextId === predecessor.contextId);
    const superseded: D2R1ContextRecord = Object.freeze({ ...predecessor, recordStatus: "SUPERSEDED" });
    store.contexts[index] = superseded;
    remember(store, "CONTEXT", superseded.contextId, "SUPERSEDED", superseded.fingerprint, actor);
  }
  store.contexts.push(record);
  remember(store, "CONTEXT", record.contextId, "CREATED", record.fingerprint, actor);
  return record;
}

function normalizeRelationships(store: D2R1Store, actor: D2R1Actor, contextId: string, parentObjectId: string | null, relationships: D2R1ObjectInput["relationships"]): D2R1Relationship[] {
  const explicit = [...(relationships ?? [])];
  if (parentObjectId) explicit.push({ kind: "PARENT", targetObjectId: parentObjectId });
  const normalized: D2R1Relationship[] = [];
  for (const link of explicit) {
    if (!(D2_EXPLICIT_RELATIONSHIP_KINDS as readonly string[]).includes(link.kind)) fail("RELATIONSHIP_KIND_NOT_EXPLICIT");
    const target = store.objects.find((row) => row.objectId === link.targetObjectId && row.recordStatus === "CURRENT");
    if (!target) fail("RELATIONSHIP_TARGET_NOT_FOUND");
    if (target.tenantId !== actor.tenantId) fail("CROSS_TENANT_OPERATION");
    if (target.workspaceId !== actor.workspaceId) fail("CROSS_WORKSPACE_OPERATION");
    if (target.projectId !== actor.projectId) fail("CROSS_PROJECT_OPERATION");
    if (target.contextId !== contextId) fail("RELATIONSHIP_CONTEXT_MISMATCH");
    normalized.push({ kind: link.kind as D2R1Relationship["kind"], targetObjectId: target.objectId });
  }
  normalized.sort((left, right) => `${left.kind}:${left.targetObjectId}`.localeCompare(`${right.kind}:${right.targetObjectId}`));
  return normalized;
}

export function recordCivilObjectIdentity(store: D2R1Store, actor: D2R1Actor, input: D2R1ObjectInput): D2R1ObjectRecord {
  assertActor(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const objectId = assertIdentityToken(input.objectId, "OBJECT_IDENTITY_REQUIRED");
  const context = store.contexts.find((row) => row.contextId === input.contextId);
  if (!context) fail("CONTEXT_NOT_FOUND");
  if (context.tenantId !== actor.tenantId) fail("CROSS_TENANT_OPERATION");
  if (context.workspaceId !== actor.workspaceId) fail("CROSS_WORKSPACE_OPERATION");
  if (context.projectId !== actor.projectId) fail("CROSS_PROJECT_OPERATION");
  if (context.recordStatus !== "CURRENT") fail("CONTEXT_NOT_CURRENT");
  if (!isObjectType(input.objectType)) fail("OBJECT_TYPE_NOT_ALLOWLISTED");
  const objectCategory = OBJECT_CATEGORY[input.objectType];
  if (input.objectCategory != null && input.objectCategory !== objectCategory) fail("OBJECT_CATEGORY_MISMATCH");
  if (!input.provenanceRef.trim() || blockedParty(input.provenanceRef)) fail("MISSING_PROVENANCE");
  const stage = input.citedLifecycleStage.trim();
  if (!isStage(stage)) fail("MATURITY_STAGE_INVALID");
  const parentObjectId = input.parentObjectId ? assertIdentityToken(input.parentObjectId, "OBJECT_IDENTITY_REQUIRED") : null;
  const relationships = normalizeRelationships(store, actor, context.contextId, parentObjectId, input.relationships);
  const predecessor = input.predecessorObjectId ? store.objects.find((row) => row.objectId === input.predecessorObjectId) : null;
  if (input.predecessorObjectId) {
    if (!predecessor) fail("OBJECT_NOT_FOUND");
    if (predecessor.tenantId !== actor.tenantId) fail("CROSS_TENANT_OPERATION");
    if (predecessor.workspaceId !== actor.workspaceId) fail("CROSS_WORKSPACE_OPERATION");
    if (predecessor.projectId !== actor.projectId) fail("CROSS_PROJECT_OPERATION");
    if (predecessor.recordStatus !== "CURRENT") fail("PREDECESSOR_NOT_CURRENT");
    if (predecessor.objectType !== input.objectType) fail("OBJECT_TYPE_SUBSTITUTION_REJECTED");
    if (predecessor.contextId !== context.contextId) fail("RELATIONSHIP_CONTEXT_MISMATCH");
  }
  const fingerprint = fingerprintCanonical({
    objectId,
    contextId: context.contextId,
    objectType: input.objectType,
    objectCategory,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
    discipline: D2_DISCIPLINE,
    citedLifecycleStage: stage,
    parentObjectId,
    relationships,
    provenanceRef: input.provenanceRef.trim(),
    authority: D2_CONTEXT_AUTHORITY,
    predecessorObjectId: predecessor?.objectId ?? null,
  });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.objects.find((row) => row.objectId === objectId);
  if (existing) {
    if (existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId) return existing;
    fail("OBJECT_ALREADY_RECORDED");
  }
  const signature = JSON.stringify(relationships);
  const duplicate = store.objects.find((row) => row.recordStatus === "CURRENT" && row.objectId !== predecessor?.objectId && row.contextId === context.contextId && row.objectType === input.objectType && row.provenanceRef === input.provenanceRef.trim() && row.parentObjectId === parentObjectId && JSON.stringify(row.relationships) === signature);
  if (duplicate) fail("DUPLICATE_OBJECT_REJECTED");
  const record: D2R1ObjectRecord = Object.freeze({
    objectId,
    contextId: context.contextId,
    objectType: input.objectType,
    objectCategory,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
    discipline: D2_DISCIPLINE,
    citedLifecycleStage: stage,
    parentObjectId,
    relationships: Object.freeze(relationships),
    authority: D2_CONTEXT_AUTHORITY,
    civilEngineeringAuthority: false,
    provenanceRef: input.provenanceRef.trim(),
    fingerprint,
    recordedBy: actor.actorId,
    recordedAt: store.now(),
    recordStatus: "CURRENT",
    predecessorObjectId: predecessor?.objectId ?? null,
  });
  if (predecessor) {
    const index = store.objects.findIndex((row) => row.objectId === predecessor.objectId);
    const superseded: D2R1ObjectRecord = Object.freeze({ ...predecessor, recordStatus: "SUPERSEDED" });
    store.objects[index] = superseded;
    remember(store, "OBJECT", superseded.objectId, "SUPERSEDED", superseded.fingerprint, actor);
  }
  store.objects.push(record);
  remember(store, "OBJECT", record.objectId, "CREATED", record.fingerprint, actor);
  return record;
}

export function reconstructCivilContext(store: D2R1Store, contextId: string): D2R1ContextRecord {
  const record = store.contexts.find((row) => row.contextId === contextId);
  if (!record) fail("CONTEXT_NOT_FOUND");
  return record;
}

export function reconstructCivilObject(store: D2R1Store, objectId: string): D2R1ObjectRecord {
  const record = store.objects.find((row) => row.objectId === objectId);
  if (!record) fail("OBJECT_NOT_FOUND");
  return record;
}

export function mutateCivilContext(): never {
  return fail("CONTEXT_MUTATION_REJECTED");
}

export function mutateCivilObject(): never {
  return fail("OBJECT_MUTATION_REJECTED");
}

export function advanceCivilMaturity(): never {
  return fail("MATURITY_PROGRESSION_NOT_IN_R1");
}
