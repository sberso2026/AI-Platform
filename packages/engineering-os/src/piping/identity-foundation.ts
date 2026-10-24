/**
 * EOS-D5-R1 Piping identity and object foundation.
 * One bounded runtime. Identity only. No line service, design conditions, specifications, components, routing, stress, or calculations.
 */
import {
  ADMIN_EQUALS_D5_PIPING_ENGINEERING_AUTHORITY,
  AI_EQUALS_D5_PIPING_ENGINEERING_AUTHORITY,
  D2_REOPENED,
  D3_REOPENED,
  D4_REOPENED,
  D5_APPROVAL_RUNTIME_COUNT,
  D5_ARCHITECTURE_DEFINED,
  D5_ARCHITECTURE_READY,
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
  D5_D9_RUNTIME_INTEGRATION_COUNT,
  D5_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
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
  D5_IMPLEMENTATION_PHASE_TYPES,
  D5_IMPLEMENTATION_PHASES,
  D5_MATURITY_STATES,
  D5_PIPE_SIZING_RUNTIME_COUNT,
  D5_PIPING_OBJECT_TYPES,
  D5_PIPING_STRESS_CALCULATION_RUNTIME_COUNT,
  D5_PRESSURE_DROP_CALCULATION_RUNTIME_COUNT,
  D5_REUSES_CANONICAL_CURRENTNESS,
  D5_REUSES_CANONICAL_FINGERPRINT,
  D5_REUSES_CANONICAL_IDENTITY_GOVERNANCE,
  D5_ROUTE_OPTIMIZATION_RUNTIME_COUNT,
  D5_SPATIAL_CLASH_DETECTION_RUNTIME_COUNT,
  D5_SUPPORT_LOAD_CALCULATION_RUNTIME_COUNT,
  D5_WALL_THICKNESS_CALCULATION_RUNTIME_COUNT,
  FREEFORM_AUTHORITATIVE_D5_OBJECT_TYPES_ALLOWED,
  PARALLEL_D5_CURRENTNESS_ENGINE_CREATED,
  PARALLEL_D5_IDENTITY_SYSTEM_CREATED,
  PIPING_LINE_IDENTITY_EQUALS_PROCESS_STREAM,
  SECOND_D5_FINGERPRINT_ALGORITHM_CREATED,
  UNKNOWN_D5_OBJECT_TYPE_AUTO_ACCEPTED,
} from "@rtb/types";
import { D2_TRACK_COMPLETE } from "../civil/civil-bounded-closeout";
import { D3_TRACK_COMPLETE } from "../geotechnical/geotechnical-bounded-closeout";
import { D4_TRACK_COMPLETE } from "../mechanical/mechanical-bounded-closeout";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import { D1_STRUCTURAL_PACK_COMPLETE, D1N_REOPENED } from "../structural-systems/structural-pack-sequencing";

export const D5_R1_STATUS = "PIPING_IDENTITY_AND_OBJECT_FOUNDATION_IMPLEMENTED" as const;
export const D5_R1_MATURITY = D5_R1_STATUS;
export const D5_R1_MATURITY_STATE = D5_R1_STATUS;
export const D5_R1_CLOSEOUT_PATH =
  "docs/architecture/engineering-os/EOS_D5_R1_PIPING_IDENTITY_AND_OBJECT_FOUNDATION_CLOSEOUT.md" as const;
export const D5_RUNTIME_STARTED = true as const;
export const D5_RUNTIME_COUNT = 1 as const;
export const D5_PIPING_IDENTITY_OBJECT_FOUNDATION_RUNTIME_IMPLEMENTED = true as const;
export const D5_PIPING_IDENTITY_OBJECT_FOUNDATION_RUNTIME_COUNT = 1 as const;
export const D5_PIPING_IDENTITY_OBJECT_FOUNDATION_RUNTIME_READY = true as const;
export const D5_CANONICAL_OBJECT_TAXONOMY_REUSED = true as const;
export const D5_OBJECT_TYPE_ALLOWLIST_ENFORCED = true as const;
export const D5_PIPING_IDENTITY_IMPLEMENTED = true as const;
export const D5_PIPING_LINE_IDENTITY_SUPPORTED = true as const;
export const D5_PIPING_SYSTEM_IDENTITY_SUPPORTED = true as const;
export const D5_IDENTITY_EQUALS_ENGINEERING_CONTENT = false as const;
export const D5_IDENTITY_EQUALS_VALIDATED_ENGINEERING = false as const;
export const D5_OBJECT_EXISTENCE_EQUALS_ENGINEERING_VALIDATED = false as const;
export const PIPING_LINE_IDENTITY_EQUALS_LINE_SERVICE_ENGINEERING = false as const;
export const PIPING_SYSTEM_IDENTITY_EQUALS_PROCESS_SYSTEM_DESIGN = false as const;
export const D5_EXPLICIT_IDENTITY_RELATIONSHIPS_SUPPORTED = true as const;
export const D5_INFERRED_ENGINEERING_RELATIONSHIPS_ALLOWED = false as const;
export const D5_EXPLICIT_RELATIONSHIP_KINDS = ["PARENT", "OBJECT_REFERENCE"] as const;
export const D5_IDENTITY_LIFECYCLE_GOVERNANCE_IMPLEMENTED = true as const;
export const D5_IDENTITY_MATURITY_GOVERNANCE_IMPLEMENTED = true as const;
export const D5_AUTOMATIC_MATURITY_PROGRESSION_ALLOWED = false as const;
export const D5_R1_PROVENANCE_REQUIRED = true as const;
export const D5_R1_PROVENANCE_PRESERVED = true as const;
export const D5_R1_AUTO_REPOINTED = false as const;
export const SILENT_D5_R1_MUTATION_ALLOWED = false as const;
export const D5_R1_HISTORY_PRESERVED = true as const;
export const TENANT_WORKSPACE_PROJECT_D5_R1_SCOPE_ENFORCED = true as const;
export const CROSS_TENANT_D5_IDENTITY_ACCESS_ALLOWED = false as const;
export const D5_R1_DUPLICATE_GOVERNANCE_IMPLEMENTED = true as const;
export const D5_R1_REPLAY_PROTECTION_IMPLEMENTED = true as const;
export const D5_R1_SPOOFING_PROTECTION_IMPLEMENTED = true as const;
export const D5_SYSTEM_LINE_SERVICE_CONTEXT_RUNTIME_COUNT = 0 as const;
export const D5_DESIGN_CONDITION_SPECIFICATION_RUNTIME_COUNT = 0 as const;
export const D5_COMPONENT_CONNECTION_VALVE_RUNTIME_COUNT = 0 as const;
export const D5_ROUTING_ARRANGEMENT_FABRICATION_RUNTIME_COUNT = 0 as const;
export const D5_STRESS_SUPPORT_TEST_EVIDENCE_RUNTIME_COUNT = 0 as const;
export const D5_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_COUNT = 0 as const;
export const D5_DISCIPLINE_INTERFACE_RUNTIME_COUNT = 0 as const;
export const D5_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_COUNT = 0 as const;
export const D5_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT = 0 as const;
export const D5_CONTEXT_AUTHORITY = "PIPING_CONTEXT_AUTHORITY" as const;
export const D5_DISCIPLINE = "PIPING" as const;
export const D6_RUNTIME_STARTED = false as const;
export const D7_RUNTIME_STARTED = false as const;
export const D8_RUNTIME_STARTED = false as const;
export const D9_RUNTIME_STARTED = false as const;
export const D9_RUNTIME_COUNT = 0 as const;
export const DATABASE_SCHEMA_CHANGED = false as const;
export const NEW_DEPENDENCY_ADDED = false as const;
export const UNAUTHORIZED_D1_PACK_COMPLETION = false as const;
export const UNAUTHORIZED_D2_REOPEN = false as const;
export const UNAUTHORIZED_D3_REOPEN = false as const;
export const UNAUTHORIZED_D4_REOPEN = false as const;
export const UNAUTHORIZED_D5_R2_R12_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_D6_D8_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_D9_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_PIPING_CALCULATION_PROMOTION = false as const;
export const UNAUTHORIZED_PIPING_VALIDATION_PROMOTION = false as const;
export const UNAUTHORIZED_CROSS_DISCIPLINE_REASONING_PROMOTION = false as const;
export const UNAUTHORIZED_GA_PROMOTION = false as const;
export const UNAUTHORIZED_PRODUCT_CLAIM = false as const;
export const D5_R2_CANONICAL_PHASE = D5_IMPLEMENTATION_PHASES[1];
export const D5_R2_PHASE_TYPE = D5_IMPLEMENTATION_PHASE_TYPES[1];
export const D5_R2_CANONICAL_SCOPE =
  "Implement governed Piping system, line, service/function and explicit system/line membership context using exact R1 identities. Preserve the distinction between Piping service context and Process design. Do not implement design conditions/specifications, components, routing, stress/support, review/validation, interfaces, D9 source contract or calculations." as const;
export const D5_R2_STARTED = false as const;
export const D5_R1_READY_FOR_NEXT_PHASE = true as const;
export const D5_R1_NEXT_PHASE = D5_R2_CANONICAL_PHASE;
export const D5_R1_NEXT_PHASE_TYPE = D5_R2_PHASE_TYPE;
export const D5_R1_CANONICAL_NEXT_PHASE = D5_R2_CANONICAL_PHASE;
export const D5_R1_CANONICAL_NEXT_PHASE_SCOPE = D5_R2_CANONICAL_SCOPE;
export const D5_R1_BLOCKER = "NONE" as const;
export const D5_R1_MACHINE_READABLE_ROADMAP_UPDATED = true as const;

export {
  D5_ARCHITECTURE_DEFINED,
  D5_ARCHITECTURE_READY,
  D5_REUSES_CANONICAL_IDENTITY_GOVERNANCE,
  D5_REUSES_CANONICAL_CURRENTNESS,
  D5_REUSES_CANONICAL_FINGERPRINT,
  PARALLEL_D5_IDENTITY_SYSTEM_CREATED,
  PARALLEL_D5_CURRENTNESS_ENGINE_CREATED,
  SECOND_D5_FINGERPRINT_ALGORITHM_CREATED,
  FREEFORM_AUTHORITATIVE_D5_OBJECT_TYPES_ALLOWED,
  UNKNOWN_D5_OBJECT_TYPE_AUTO_ACCEPTED,
  PIPING_LINE_IDENTITY_EQUALS_PROCESS_STREAM,
  AI_EQUALS_D5_PIPING_ENGINEERING_AUTHORITY,
  ADMIN_EQUALS_D5_PIPING_ENGINEERING_AUTHORITY,
  D5_EQUALS_D1_STRUCTURAL_AUTHORITY,
  D5_EQUALS_D2_CIVIL_AUTHORITY,
  D5_EQUALS_D3_GEOTECHNICAL_AUTHORITY,
  D5_EQUALS_D4_MECHANICAL_AUTHORITY,
  D5_EQUALS_D6_PROCESS_AUTHORITY,
  D5_EQUALS_D7_ELECTRICAL_AUTHORITY,
  D5_EQUALS_D8_INSTRUMENTATION_CONTROL_AUTHORITY,
  D5_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
  D5_D9_RUNTIME_INTEGRATION_COUNT,
  D5_PIPE_SIZING_RUNTIME_COUNT,
  D5_HYDRAULIC_CALCULATION_RUNTIME_COUNT,
  D5_PRESSURE_DROP_CALCULATION_RUNTIME_COUNT,
  D5_WALL_THICKNESS_CALCULATION_RUNTIME_COUNT,
  D5_BRANCH_REINFORCEMENT_CALCULATION_RUNTIME_COUNT,
  D5_FLANGE_RATING_CALCULATION_RUNTIME_COUNT,
  D5_PIPING_STRESS_CALCULATION_RUNTIME_COUNT,
  D5_FLEXIBILITY_CALCULATION_RUNTIME_COUNT,
  D5_SUPPORT_LOAD_CALCULATION_RUNTIME_COUNT,
  D5_ROUTE_OPTIMIZATION_RUNTIME_COUNT,
  D5_AUTOMATIC_ROUTING_RUNTIME_COUNT,
  D5_SPATIAL_CLASH_DETECTION_RUNTIME_COUNT,
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
};

const FLOATING = new Set(["latest", "current", "newest", "head", "active", "active model"]);
const INFERRED = new Set(["tag_similarity", "line_number_similarity", "document_proximity", "shared_vendor", "semantic_similarity", "filename", "drawing_placement", "ai_inference", "inferred", "matching_tag"]);

type Prohibited = {
  lineServiceEngineering?: boolean;
  processStream?: boolean;
  processSystemDesign?: boolean;
  designCondition?: boolean;
  specification?: boolean;
  componentData?: boolean;
  routing?: boolean;
  stressSupport?: boolean;
  testing?: boolean;
  reviewValidation?: boolean;
  disciplineInterface?: boolean;
  d9Source?: boolean;
  engineeringValidated?: boolean;
  advanceMaturity?: boolean;
  inferredRelationship?: boolean;
  pipeSizing?: boolean;
  hydraulic?: boolean;
  stressCalculation?: boolean;
  automaticRouting?: boolean;
  clashDetection?: boolean;
};

export type D5R1Actor = {
  actorId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  authority: string;
};

export type D5R1Relationship = {
  kind: (typeof D5_EXPLICIT_RELATIONSHIP_KINDS)[number];
  targetObjectId: string;
};

export type D5R1ContextInput = Prohibited & {
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

export type D5R1ContextRecord = {
  contextId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  discipline: typeof D5_DISCIPLINE;
  citedLifecycleStage: (typeof D5_MATURITY_STATES)[number];
  authority: typeof D5_CONTEXT_AUTHORITY;
  pipingEngineeringAuthority: false;
  engineeringValidated: false;
  provenanceRef: string;
  fingerprint: string;
  recordedBy: string;
  recordedAt: string;
  recordStatus: "CURRENT" | "SUPERSEDED";
  currentness: "CURRENT" | "SUPERSEDED";
  predecessorContextId: string | null;
};

export type D5R1ObjectInput = Prohibited & {
  objectId: string;
  contextId: string;
  objectType: string;
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

export type D5R1ObjectRecord = {
  objectId: string;
  contextId: string;
  objectType: (typeof D5_PIPING_OBJECT_TYPES)[number];
  tenantId: string;
  workspaceId: string;
  projectId: string;
  discipline: typeof D5_DISCIPLINE;
  citedLifecycleStage: (typeof D5_MATURITY_STATES)[number];
  parentObjectId: string | null;
  relationships: readonly D5R1Relationship[];
  authority: typeof D5_CONTEXT_AUTHORITY;
  pipingEngineeringAuthority: false;
  engineeringValidated: false;
  serviceEstablished: false;
  designConditionEstablished: false;
  specificationEstablished: false;
  routingEstablished: false;
  stressAdequacyEstablished: false;
  supportAdequacyEstablished: false;
  testingEstablished: false;
  provenanceRef: string;
  fingerprint: string;
  recordedBy: string;
  recordedAt: string;
  recordStatus: "CURRENT" | "SUPERSEDED";
  currentness: "CURRENT" | "SUPERSEDED";
  predecessorObjectId: string | null;
};

export type D5R1History = {
  historyId: string;
  subjectKind: "CONTEXT" | "OBJECT";
  subjectId: string;
  action: "CREATED" | "SUPERSEDED";
  fingerprint: string;
  actorId: string;
  authority: typeof D5_CONTEXT_AUTHORITY;
  recordedAt: string;
};

export type D5R1Store = {
  now: () => string;
  contexts: D5R1ContextRecord[];
  objects: D5R1ObjectRecord[];
  history: D5R1History[];
};

function fail(code: string): never {
  throw new Error(`D5_R1_${code}`);
}

function blockedParty(value: string): boolean {
  return /^AI(?:\b|_)/i.test(value) || /LLM/i.test(value) || /OPTIMIZER/i.test(value);
}

function isStage(value: string): value is (typeof D5_MATURITY_STATES)[number] {
  return (D5_MATURITY_STATES as readonly string[]).includes(value);
}

function isObjectType(value: string): value is (typeof D5_PIPING_OBJECT_TYPES)[number] {
  return (D5_PIPING_OBJECT_TYPES as readonly string[]).includes(value);
}

function assertActor(actor: D5R1Actor): void {
  if (!actor.actorId.trim() || !actor.tenantId.trim() || !actor.workspaceId.trim() || !actor.projectId.trim()) fail("SCOPE_REQUIRED");
  if (blockedParty(actor.actorId) || blockedParty(actor.authority)) fail("AI_NOT_PIPING_AUTHORITY");
  if (actor.authority === "ADMINISTRATOR" || actor.authority === "ADMIN") fail("ADMIN_NOT_PIPING_AUTHORITY");
  if (actor.authority === "PIPING_ENGINEERING_AUTHORITY") fail("RECORDER_NOT_PIPING_ENGINEERING_AUTHORITY");
  if (actor.authority !== D5_CONTEXT_AUTHORITY) fail("UNAUTHORIZED");
}

function assertScope(actor: D5R1Actor, input: { tenantId?: string; workspaceId?: string; projectId?: string }): void {
  if (input.tenantId != null && input.tenantId !== actor.tenantId) fail("CROSS_TENANT_OPERATION");
  if (input.workspaceId != null && input.workspaceId !== actor.workspaceId) fail("CROSS_WORKSPACE_OPERATION");
  if (input.projectId != null && input.projectId !== actor.projectId) fail("CROSS_PROJECT_OPERATION");
}

function assertProhibited(input: Prohibited): void {
  if (input.lineServiceEngineering === true || input.processStream === true || input.processSystemDesign === true) fail("LINE_SERVICE_NOT_IN_R1");
  if (input.designCondition === true) fail("DESIGN_CONDITION_NOT_IN_R1");
  if (input.specification === true) fail("SPECIFICATION_NOT_IN_R1");
  if (input.componentData === true) fail("COMPONENT_NOT_IN_R1");
  if (input.routing === true) fail("ROUTING_NOT_IN_R1");
  if (input.stressSupport === true) fail("STRESS_SUPPORT_NOT_IN_R1");
  if (input.testing === true) fail("TESTING_NOT_IN_R1");
  if (input.reviewValidation === true) fail("REVIEW_VALIDATION_NOT_IN_R1");
  if (input.disciplineInterface === true) fail("DISCIPLINE_INTERFACE_NOT_IN_R1");
  if (input.d9Source === true) fail("D9_SOURCE_NOT_IN_R1");
  if (input.engineeringValidated === true) fail("VALIDATION_NOT_IN_R1");
  if (input.advanceMaturity === true) fail("MATURITY_PROGRESSION_NOT_IN_R1");
  if (input.inferredRelationship === true) fail("INFERRED_RELATIONSHIP_REJECTED");
  if (input.pipeSizing === true || input.hydraulic === true || input.stressCalculation === true || input.automaticRouting === true || input.clashDetection === true) fail("CALCULATION_NOT_IN_R1");
}

function assertIdentityToken(value: string, code: string): string {
  const token = value.trim();
  if (!token || FLOATING.has(token.toLowerCase()) || blockedParty(token)) fail(code);
  return token;
}

function remember(store: D5R1Store, subjectKind: D5R1History["subjectKind"], subjectId: string, action: D5R1History["action"], fingerprint: string, actor: D5R1Actor): void {
  store.history.push({
    historyId: `hist-${store.history.length + 1}`,
    subjectKind,
    subjectId,
    action,
    fingerprint,
    actorId: actor.actorId,
    authority: D5_CONTEXT_AUTHORITY,
    recordedAt: store.now(),
  });
}

export function createD5R1Store(now: () => string = () => "2026-10-24T00:00:00.000Z"): D5R1Store {
  return { now, contexts: [], objects: [], history: [] };
}

export function recordPipingContext(store: D5R1Store, actor: D5R1Actor, input: D5R1ContextInput): D5R1ContextRecord {
  assertActor(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const contextId = assertIdentityToken(input.contextId, "CONTEXT_IDENTITY_REQUIRED");
  if (!input.provenanceRef.trim() || blockedParty(input.provenanceRef)) fail("MISSING_PROVENANCE");
  if (input.discipline != null && input.discipline !== D5_DISCIPLINE) fail("DISCIPLINE_NOT_PIPING");
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
    discipline: D5_DISCIPLINE,
    citedLifecycleStage: stage,
    provenanceRef: input.provenanceRef.trim(),
    authority: D5_CONTEXT_AUTHORITY,
    predecessorContextId: predecessor?.contextId ?? null,
  });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.contexts.find((row) => row.contextId === contextId);
  if (existing) {
    if (existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId) return existing;
    fail("DUPLICATE_CONTEXT_REJECTED");
  }
  const duplicate = store.contexts.find((row) => row.recordStatus === "CURRENT" && row.contextId !== predecessor?.contextId && row.tenantId === actor.tenantId && row.workspaceId === actor.workspaceId && row.projectId === actor.projectId);
  if (duplicate) fail("DUPLICATE_CONTEXT_REJECTED");
  const record: D5R1ContextRecord = Object.freeze({
    contextId,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
    discipline: D5_DISCIPLINE,
    citedLifecycleStage: stage,
    authority: D5_CONTEXT_AUTHORITY,
    pipingEngineeringAuthority: false,
    engineeringValidated: false,
    provenanceRef: input.provenanceRef.trim(),
    fingerprint,
    recordedBy: actor.actorId,
    recordedAt: store.now(),
    recordStatus: "CURRENT",
    currentness: "CURRENT",
    predecessorContextId: predecessor?.contextId ?? null,
  });
  if (predecessor) {
    const index = store.contexts.findIndex((row) => row.contextId === predecessor.contextId);
    const superseded: D5R1ContextRecord = Object.freeze({ ...predecessor, recordStatus: "SUPERSEDED", currentness: "SUPERSEDED" });
    store.contexts[index] = superseded;
    remember(store, "CONTEXT", superseded.contextId, "SUPERSEDED", superseded.fingerprint, actor);
  }
  store.contexts.push(record);
  remember(store, "CONTEXT", record.contextId, "CREATED", record.fingerprint, actor);
  return record;
}

function normalizeRelationships(store: D5R1Store, actor: D5R1Actor, contextId: string, parentObjectId: string | null, relationships: D5R1ObjectInput["relationships"]): D5R1Relationship[] {
  const explicit = [...(relationships ?? [])];
  if (parentObjectId) explicit.push({ kind: "PARENT", targetObjectId: parentObjectId });
  const normalized: D5R1Relationship[] = [];
  for (const link of explicit) {
    if (INFERRED.has(link.kind.trim().toLowerCase())) fail("INFERRED_RELATIONSHIP_REJECTED");
    if (!(D5_EXPLICIT_RELATIONSHIP_KINDS as readonly string[]).includes(link.kind)) fail("RELATIONSHIP_KIND_NOT_EXPLICIT");
    const target = store.objects.find((row) => row.objectId === link.targetObjectId && row.recordStatus === "CURRENT");
    if (!target) fail("RELATIONSHIP_TARGET_NOT_FOUND");
    if (target.tenantId !== actor.tenantId) fail("CROSS_TENANT_OPERATION");
    if (target.workspaceId !== actor.workspaceId) fail("CROSS_WORKSPACE_OPERATION");
    if (target.projectId !== actor.projectId) fail("CROSS_PROJECT_OPERATION");
    if (target.contextId !== contextId) fail("RELATIONSHIP_CONTEXT_MISMATCH");
    normalized.push({ kind: link.kind as D5R1Relationship["kind"], targetObjectId: target.objectId });
  }
  normalized.sort((left, right) => `${left.kind}:${left.targetObjectId}`.localeCompare(`${right.kind}:${right.targetObjectId}`));
  return normalized;
}

export function recordPipingObjectIdentity(store: D5R1Store, actor: D5R1Actor, input: D5R1ObjectInput): D5R1ObjectRecord {
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
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
    discipline: D5_DISCIPLINE,
    citedLifecycleStage: stage,
    parentObjectId,
    relationships,
    provenanceRef: input.provenanceRef.trim(),
    authority: D5_CONTEXT_AUTHORITY,
    predecessorObjectId: predecessor?.objectId ?? null,
  });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.objects.find((row) => row.objectId === objectId);
  if (existing) {
    if (existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId) return existing;
    fail("DUPLICATE_OBJECT_REJECTED");
  }
  const signature = JSON.stringify(relationships);
  const duplicate = store.objects.find((row) => row.recordStatus === "CURRENT" && row.objectId !== predecessor?.objectId && row.contextId === context.contextId && row.objectType === input.objectType && row.provenanceRef === input.provenanceRef.trim() && row.parentObjectId === parentObjectId && JSON.stringify(row.relationships) === signature);
  if (duplicate) fail("DUPLICATE_OBJECT_REJECTED");
  const record: D5R1ObjectRecord = Object.freeze({
    objectId,
    contextId: context.contextId,
    objectType: input.objectType,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
    discipline: D5_DISCIPLINE,
    citedLifecycleStage: stage,
    parentObjectId,
    relationships: Object.freeze(relationships),
    authority: D5_CONTEXT_AUTHORITY,
    pipingEngineeringAuthority: false,
    engineeringValidated: false,
    serviceEstablished: false,
    designConditionEstablished: false,
    specificationEstablished: false,
    routingEstablished: false,
    stressAdequacyEstablished: false,
    supportAdequacyEstablished: false,
    testingEstablished: false,
    provenanceRef: input.provenanceRef.trim(),
    fingerprint,
    recordedBy: actor.actorId,
    recordedAt: store.now(),
    recordStatus: "CURRENT",
    currentness: "CURRENT",
    predecessorObjectId: predecessor?.objectId ?? null,
  });
  if (predecessor) {
    const index = store.objects.findIndex((row) => row.objectId === predecessor.objectId);
    const superseded: D5R1ObjectRecord = Object.freeze({ ...predecessor, recordStatus: "SUPERSEDED", currentness: "SUPERSEDED" });
    store.objects[index] = superseded;
    remember(store, "OBJECT", superseded.objectId, "SUPERSEDED", superseded.fingerprint, actor);
  }
  store.objects.push(record);
  remember(store, "OBJECT", record.objectId, "CREATED", record.fingerprint, actor);
  return record;
}

export function reconstructPipingContext(store: D5R1Store, contextId: string): D5R1ContextRecord {
  const record = store.contexts.find((row) => row.contextId === contextId);
  if (!record) fail("CONTEXT_NOT_FOUND");
  return record;
}

export function reconstructPipingObject(store: D5R1Store, objectId: string): D5R1ObjectRecord {
  const record = store.objects.find((row) => row.objectId === objectId);
  if (!record) fail("OBJECT_NOT_FOUND");
  return record;
}

export function mutatePipingIdentity(): never {
  return fail("IDENTITY_MUTATION_REJECTED");
}

export function repointPipingIdentity(): never {
  return fail("AUTO_REPOINT_REJECTED");
}

export function advancePipingMaturity(): never {
  return fail("MATURITY_PROGRESSION_NOT_IN_R1");
}

export function recordPipingLineService(): never {
  return fail("LINE_SERVICE_NOT_IN_R1");
}

export function recordPipingDesignCondition(): never {
  return fail("DESIGN_CONDITION_NOT_IN_R1");
}

export function recordPipingSpecification(): never {
  return fail("SPECIFICATION_NOT_IN_R1");
}

export function recordPipingRoute(): never {
  return fail("ROUTING_NOT_IN_R1");
}

export function recordPipingStressSupport(): never {
  return fail("STRESS_SUPPORT_NOT_IN_R1");
}

export function calculatePiping(): never {
  return fail("CALCULATION_NOT_IN_R1");
}

export function validatePipingEngineering(): never {
  return fail("VALIDATION_NOT_IN_R1");
}
