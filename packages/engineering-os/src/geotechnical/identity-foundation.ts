/**
 * EOS-D3-R1 Geotechnical identity and object foundation.
 * One bounded runtime. Identity only. No investigation data, parameters, or calculations.
 */
import {
  ADMIN_EQUALS_D3_GEOTECHNICAL_ENGINEERING_AUTHORITY as ARCH_ADMIN_EQUALS,
  AI_EQUALS_D3_GEOTECHNICAL_ENGINEERING_AUTHORITY as ARCH_AI_EQUALS,
  D2_REOPENED as ARCH_D2_REOPENED,
  D3_0_CANONICAL_CURRENTNESS_REUSED,
  D3_0_CANONICAL_FINGERPRINT_REUSED,
  D3_0_SECOND_FINGERPRINT_ALGORITHM_CREATED,
  D3_ARCHITECTURE_DEFINED,
  D3_ARCHITECTURE_READY,
  D3_CURRENTNESS_STATES,
  D3_EQUALS_D1_STRUCTURAL_AUTHORITY as ARCH_EQUALS_D1,
  D3_EQUALS_D2_CIVIL_AUTHORITY as ARCH_EQUALS_D2,
  D3_GEOTECHNICAL_OBJECT_CATEGORIES,
  D3_GEOTECHNICAL_OBJECT_TYPES,
  D3_IMPLEMENTATION_PHASES,
  D3_MATURITY_STATES,
  ENGINEERING_PARAMETER_EQUALS_VALIDATED_PARAMETER as ARCH_PARAMETER_EQUALS,
  OBSERVATION_EQUALS_INTERPRETATION as ARCH_OBSERVATION_EQUALS,
  PARALLEL_D3_CURRENTNESS_ENGINE_CREATED as ARCH_PARALLEL_CURRENTNESS,
  RECOMMENDATION_EQUALS_APPROVAL as ARCH_RECOMMENDATION_EQUALS,
  TEST_RESULT_EQUALS_ENGINEERING_PARAMETER as ARCH_TEST_EQUALS,
} from "@rtb/types";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";

export const D3_R1_STATUS = "GEOTECHNICAL_IDENTITY_AND_OBJECT_FOUNDATION_IMPLEMENTED" as const;
export const D3_R1_MATURITY = "GEOTECHNICAL_IDENTITY_AND_OBJECT_FOUNDATION_IMPLEMENTED" as const;
export const D3_R1_MATURITY_STATE = D3_R1_MATURITY;
export const D3_R1_CLOSEOUT_PATH =
  "docs/architecture/engineering-os/EOS_D3_R1_GEOTECHNICAL_IDENTITY_AND_OBJECT_FOUNDATION_CLOSEOUT.md" as const;
export const D3_R1_PARENT_ARCHITECTURE_PATH =
  "docs/architecture/engineering-os/EOS_D3_0_GEOTECHNICAL_ARCHITECTURE.md" as const;
export const D3_R1_ARCHITECTURE_DEFINED = D3_ARCHITECTURE_DEFINED;
export const D3_R1_ARCHITECTURE_READY = D3_ARCHITECTURE_READY;

export const D3_RUNTIME_STARTED = true as const;
export const D3_RUNTIME_COUNT = 1 as const;
export const D3_GEOTECHNICAL_CONTEXT_RUNTIME_IMPLEMENTED = true as const;
export const D3_GEOTECHNICAL_CONTEXT_RUNTIME_COUNT = 1 as const;
export const D3_GEOTECHNICAL_OBJECT_IDENTITY_RUNTIME_IMPLEMENTED = true as const;
export const D3_GEOTECHNICAL_IDENTITY_OBJECT_FOUNDATION_RUNTIME_READY = true as const;
export const D3_OBJECT_TYPE_ALLOWLIST_ENFORCED = true as const;
export const FREEFORM_AUTHORITATIVE_D3_OBJECT_TYPE_ALLOWED = false as const;
export const UNKNOWN_D3_OBJECT_TYPE_AUTO_ACCEPTED = false as const;
export const D3_OBJECT_IDENTITY_EQUALS_ENGINEERING_CONTENT = false as const;
export const D3_OBJECT_IDENTITY_EQUALS_ENGINEERING_VALIDATED = false as const;
export const D3_EXPLICIT_RELATIONSHIPS_SUPPORTED = true as const;
export const D3_INFERRED_ENGINEERING_RELATIONSHIPS_ALLOWED = false as const;
export const D3_EXPLICIT_RELATIONSHIP_KINDS = ["PARENT", "OBJECT_REFERENCE"] as const;
export const D3_LIFECYCLE_MATURITY_GOVERNED = true as const;
export const D3_AUTOMATIC_MATURITY_PROGRESSION_ALLOWED = false as const;
export const TENANT_WORKSPACE_PROJECT_D3_SCOPE_ENFORCED = true as const;
export const CROSS_TENANT_D3_OBJECT_ACCESS_ALLOWED = false as const;
export const D3_PROVENANCE_REQUIRED = true as const;
export const D3_PROVENANCE_PRESERVED = true as const;
export const D3_REUSES_CANONICAL_OBJECT_IDENTITY = true as const;
export const D3_REUSES_CANONICAL_CURRENTNESS = D3_0_CANONICAL_CURRENTNESS_REUSED;
export const D3_REUSES_CANONICAL_FINGERPRINT = D3_0_CANONICAL_FINGERPRINT_REUSED;
export const PARALLEL_D3_IDENTITY_SYSTEM_CREATED = false as const;
export const PARALLEL_D3_CURRENTNESS_ENGINE_CREATED = ARCH_PARALLEL_CURRENTNESS;
export const CANONICAL_FINGERPRINT_REUSED = D3_0_CANONICAL_FINGERPRINT_REUSED;
export const D3_OBJECT_FINGERPRINT_IMPLEMENTED = true as const;
export const SECOND_FINGERPRINT_ALGORITHM_CREATED = D3_0_SECOND_FINGERPRINT_ALGORITHM_CREATED;
export const SILENT_D3_OBJECT_MUTATION_ALLOWED = false as const;
export const D3_OBJECT_HISTORY_PRESERVED = true as const;
export const D3_DUPLICATE_GOVERNANCE_IMPLEMENTED = true as const;
export const D3_REPLAY_PROTECTION_IMPLEMENTED = true as const;
export const D3_SPOOFING_PROTECTION_IMPLEMENTED = true as const;
export const AI_EQUALS_D3_GEOTECHNICAL_ENGINEERING_AUTHORITY = ARCH_AI_EQUALS;
export const ADMIN_EQUALS_D3_GEOTECHNICAL_ENGINEERING_AUTHORITY = ARCH_ADMIN_EQUALS;
export const D3_EQUALS_D1_STRUCTURAL_AUTHORITY = ARCH_EQUALS_D1;
export const D3_EQUALS_D2_CIVIL_AUTHORITY = ARCH_EQUALS_D2;
export const OBSERVATION_EQUALS_INTERPRETATION = ARCH_OBSERVATION_EQUALS;
export const TEST_RESULT_EQUALS_ENGINEERING_PARAMETER = ARCH_TEST_EQUALS;
export const ENGINEERING_PARAMETER_EQUALS_VALIDATED_PARAMETER = ARCH_PARAMETER_EQUALS;
export const RECOMMENDATION_EQUALS_APPROVAL = ARCH_RECOMMENDATION_EQUALS;
export const D3_CONTEXT_AUTHORITY = "GEOTECHNICAL_CONTEXT_AUTHORITY" as const;
export const D3_DISCIPLINE = "GEOTECHNICAL" as const;
export const D3_R1_CURRENTNESS_STATES = D3_CURRENTNESS_STATES;

export const D3_SITE_INVESTIGATION_EVIDENCE_RUNTIME_READY = false as const;
export const D3_STRATIGRAPHY_GROUNDWATER_MATERIAL_RUNTIME_READY = false as const;
export const D3_FIELD_LAB_TEST_RUNTIME_READY = false as const;
export const D3_GEOTECHNICAL_PARAMETER_RUNTIME_READY = false as const;
export const D3_FOUNDATION_EXCAVATION_SLOPE_RUNTIME_READY = false as const;
export const D3_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY = false as const;
export const D3_DISCIPLINE_INTERFACE_RUNTIME_READY = false as const;
export const D3_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_READY = false as const;
export const D3_CURRENTNESS_DIGITAL_THREAD_RUNTIME_READY = false as const;
export const D3_D9_SOURCE_CONTRACT_RUNTIME_READY = false as const;

export const D3_SITE_INVESTIGATION_RUNTIME_COUNT = 0 as const;
export const D3_BOREHOLE_DATA_RUNTIME_COUNT = 0 as const;
export const D3_TEST_PIT_DATA_RUNTIME_COUNT = 0 as const;
export const D3_STRATIGRAPHY_RUNTIME_COUNT = 0 as const;
export const D3_GROUNDWATER_DATA_RUNTIME_COUNT = 0 as const;
export const D3_MATERIAL_CLASSIFICATION_RUNTIME_COUNT = 0 as const;
export const D3_FIELD_TEST_DATA_RUNTIME_COUNT = 0 as const;
export const D3_LAB_TEST_DATA_RUNTIME_COUNT = 0 as const;
export const D3_PARAMETER_RUNTIME_COUNT = 0 as const;
export const D3_PARAMETER_CALCULATION_RUNTIME_COUNT = 0 as const;
export const D3_PARAMETER_INFERENCE_RUNTIME_COUNT = 0 as const;
export const D3_FOUNDATION_RECOMMENDATION_RUNTIME_COUNT = 0 as const;
export const D3_EXCAVATION_RECOMMENDATION_RUNTIME_COUNT = 0 as const;
export const D3_SLOPE_RECOMMENDATION_RUNTIME_COUNT = 0 as const;
export const D3_FOUNDATION_CALCULATION_RUNTIME_COUNT = 0 as const;
export const D3_BEARING_CAPACITY_RUNTIME_COUNT = 0 as const;
export const D3_SETTLEMENT_CALCULATION_RUNTIME_COUNT = 0 as const;
export const D3_SLOPE_STABILITY_RUNTIME_COUNT = 0 as const;
export const D3_EARTH_PRESSURE_RUNTIME_COUNT = 0 as const;
export const D3_GROUND_IMPROVEMENT_DESIGN_RUNTIME_COUNT = 0 as const;
export const D3_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_COUNT = 0 as const;
export const D3_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT = 0 as const;
export const D3_APPROVAL_RUNTIME_COUNT = 0 as const;
export const D3_CERTIFICATION_RUNTIME_COUNT = 0 as const;
export const D3_DISCIPLINE_INTERFACE_RUNTIME_COUNT = 0 as const;
export const D3_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT = 0 as const;
export const D3_D9_SOURCE_CONTRACT_RUNTIME_COUNT = 0 as const;
export const D3_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT = 0 as const;
export const D3_D9_RUNTIME_INTEGRATION_COUNT = 0 as const;
export const D4_RUNTIME_STARTED = false as const;
export const D5_RUNTIME_STARTED = false as const;
export const D6_RUNTIME_STARTED = false as const;
export const D7_RUNTIME_STARTED = false as const;
export const D8_RUNTIME_STARTED = false as const;
export const D9_RUNTIME_STARTED = false as const;
export const D2_REOPENED = ARCH_D2_REOPENED;
export const DATABASE_SCHEMA_CHANGED = false as const;
export const NEW_DEPENDENCY_ADDED = false as const;
export const UNAUTHORIZED_D1_PACK_COMPLETION = false as const;
export const UNAUTHORIZED_D2_REOPEN = false as const;
export const UNAUTHORIZED_D3_R2_R12_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_D4_D8_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_D9_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_D3_VALIDATION_PROMOTION = false as const;
export const UNAUTHORIZED_D3_APPROVAL_PROMOTION = false as const;
export const UNAUTHORIZED_D3_CERTIFICATION_PROMOTION = false as const;
export const UNAUTHORIZED_GA_PROMOTION = false as const;
export const UNAUTHORIZED_PRODUCT_CLAIM = false as const;

export const D3_R2_CANONICAL_PHASE = D3_IMPLEMENTATION_PHASES[1];
export const D3_R2_PHASE_TYPE = "SITE_INVESTIGATION_AND_EVIDENCE_CONTEXT" as const;
export const D3_R2_CANONICAL_SCOPE =
  "Implement governed Geotechnical site-investigation and evidence context using exact R1 identities. Record investigation program/context, investigation-location identity references, borehole/test-pit evidence references, source documents, field records and provenance without yet interpreting stratigraphy, deriving parameters, performing calculations, producing foundation recommendations, validating engineering, or starting D4-D9." as const;
export const D3_R2_STARTED = false as const;
export const D3_R1_READY_FOR_NEXT_PHASE = true as const;
export const D3_R1_NEXT_PHASE = D3_R2_CANONICAL_PHASE;
export const D3_R1_NEXT_PHASE_TYPE = D3_R2_PHASE_TYPE;
export const D3_R1_CANONICAL_NEXT_PHASE = D3_R2_CANONICAL_PHASE;
export const D3_R1_CANONICAL_NEXT_PHASE_SCOPE = D3_R2_CANONICAL_SCOPE;
export const D3_R1_BLOCKER = "NONE" as const;
export const D3_R1_MACHINE_READABLE_ROADMAP_UPDATED = true as const;

const OBJECT_CATEGORY = {
  GEOTECHNICAL_SITE_CONTEXT: "SITE_INVESTIGATION_CONTEXT",
  INVESTIGATION_LOCATION: "SITE_INVESTIGATION_CONTEXT",
  BOREHOLE: "SITE_INVESTIGATION_CONTEXT",
  TEST_PIT: "SITE_INVESTIGATION_CONTEXT",
  STRATIGRAPHIC_LAYER: "STRATIGRAPHY_AND_GROUNDWATER",
  GROUNDWATER_OBSERVATION: "STRATIGRAPHY_AND_GROUNDWATER",
  FIELD_TEST_RECORD: "FIELD_AND_LAB_TEST_CONTEXT",
  LAB_TEST_RECORD: "FIELD_AND_LAB_TEST_CONTEXT",
  MATERIAL_CLASSIFICATION: "STRATIGRAPHY_AND_GROUNDWATER",
  GEOTECHNICAL_PARAMETER_SET: "GEOTECHNICAL_PARAMETER_CONTEXT",
  FOUNDATION_GEOTECHNICAL_CONTEXT: "FOUNDATION_EXCAVATION_AND_SLOPE",
  EXCAVATION_GEOTECHNICAL_CONTEXT: "FOUNDATION_EXCAVATION_AND_SLOPE",
  SLOPE_GEOTECHNICAL_CONTEXT: "FOUNDATION_EXCAVATION_AND_SLOPE",
  EARTHWORKS_MATERIAL_CONTEXT: "EARTHWORKS_SUBGRADE_AND_IMPROVEMENT",
  PAVEMENT_SUBGRADE_CONTEXT: "EARTHWORKS_SUBGRADE_AND_IMPROVEMENT",
  GROUND_IMPROVEMENT_CONTEXT: "EARTHWORKS_SUBGRADE_AND_IMPROVEMENT",
  GEOHAZARD_CONTEXT: "GEOHAZARD_CONTEXT",
  GEOTECHNICAL_GOVERNANCE_RECORD: "GEOTECHNICAL_GOVERNANCE_RECORDS",
  GEOTECHNICAL_REQUIREMENT: "GEOTECHNICAL_GOVERNANCE_RECORDS",
  GEOTECHNICAL_ASSUMPTION: "GEOTECHNICAL_GOVERNANCE_RECORDS",
  GEOTECHNICAL_DECISION: "GEOTECHNICAL_GOVERNANCE_RECORDS",
  GEOTECHNICAL_EVIDENCE_REFERENCE: "GEOTECHNICAL_GOVERNANCE_RECORDS",
  GEOTECHNICAL_INTERFACE: "GEOTECHNICAL_GOVERNANCE_RECORDS",
  GEOTECHNICAL_STANDARD_REFERENCE: "GEOTECHNICAL_GOVERNANCE_RECORDS",
} as const satisfies Record<(typeof D3_GEOTECHNICAL_OBJECT_TYPES)[number], (typeof D3_GEOTECHNICAL_OBJECT_CATEGORIES)[number]>;

const FLOATING = new Set(["latest", "current", "newest", "head", "active", "active model"]);

export type D3R1Actor = {
  actorId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  authority: string;
};

export type D3R1Relationship = {
  kind: (typeof D3_EXPLICIT_RELATIONSHIP_KINDS)[number];
  targetObjectId: string;
};

type Prohibited = {
  boreholeData?: boolean;
  testPitData?: boolean;
  stratigraphy?: boolean;
  groundwaterData?: boolean;
  materialClassification?: boolean;
  fieldTestData?: boolean;
  labTestData?: boolean;
  parameter?: boolean;
  parameterCalculation?: boolean;
  parameterInference?: boolean;
  foundationRecommendation?: boolean;
  excavationRecommendation?: boolean;
  slopeRecommendation?: boolean;
  foundationCalculation?: boolean;
  bearingCapacity?: boolean;
  settlementCalculation?: boolean;
  slopeStability?: boolean;
  earthPressure?: boolean;
  groundImprovementDesign?: boolean;
  reviewValidation?: boolean;
  engineeringValidated?: boolean;
  engineeringApproved?: boolean;
  certified?: boolean;
  advanceMaturity?: boolean;
  d1Integration?: boolean;
  d2Integration?: boolean;
  d4Integration?: boolean;
  d9Reasoning?: boolean;
  inferredRelationship?: boolean;
};

export type D3R1ContextInput = Prohibited & {
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

export type D3R1ContextRecord = {
  contextId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  discipline: typeof D3_DISCIPLINE;
  citedLifecycleStage: (typeof D3_MATURITY_STATES)[number];
  authority: typeof D3_CONTEXT_AUTHORITY;
  geotechnicalEngineeringAuthority: false;
  provenanceRef: string;
  fingerprint: string;
  recordedBy: string;
  recordedAt: string;
  recordStatus: "CURRENT" | "SUPERSEDED";
  currentness: "CURRENT" | "SUPERSEDED";
  predecessorContextId: string | null;
};

export type D3R1ObjectInput = Prohibited & {
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

export type D3R1ObjectRecord = {
  objectId: string;
  contextId: string;
  objectType: (typeof D3_GEOTECHNICAL_OBJECT_TYPES)[number];
  objectCategory: (typeof D3_GEOTECHNICAL_OBJECT_CATEGORIES)[number];
  tenantId: string;
  workspaceId: string;
  projectId: string;
  discipline: typeof D3_DISCIPLINE;
  citedLifecycleStage: (typeof D3_MATURITY_STATES)[number];
  parentObjectId: string | null;
  relationships: readonly D3R1Relationship[];
  authority: typeof D3_CONTEXT_AUTHORITY;
  geotechnicalEngineeringAuthority: false;
  provenanceRef: string;
  fingerprint: string;
  recordedBy: string;
  recordedAt: string;
  recordStatus: "CURRENT" | "SUPERSEDED";
  currentness: "CURRENT" | "SUPERSEDED";
  predecessorObjectId: string | null;
};

export type D3R1History = {
  historyId: string;
  subjectKind: "CONTEXT" | "OBJECT";
  subjectId: string;
  action: "CREATED" | "SUPERSEDED";
  fingerprint: string;
  actorId: string;
  authority: typeof D3_CONTEXT_AUTHORITY;
  recordedAt: string;
};

export type D3R1Store = {
  now: () => string;
  contexts: D3R1ContextRecord[];
  objects: D3R1ObjectRecord[];
  history: D3R1History[];
};

function fail(code: string): never {
  throw new Error(code);
}

function blockedParty(value: string): boolean {
  return /^AI(?:\b|_)/i.test(value) || /LLM/i.test(value) || /OPTIMIZER/i.test(value);
}

function isStage(value: string): value is (typeof D3_MATURITY_STATES)[number] {
  return (D3_MATURITY_STATES as readonly string[]).includes(value);
}

function isObjectType(value: string): value is (typeof D3_GEOTECHNICAL_OBJECT_TYPES)[number] {
  return (D3_GEOTECHNICAL_OBJECT_TYPES as readonly string[]).includes(value);
}

function assertActor(actor: D3R1Actor): void {
  if (!actor.actorId.trim() || !actor.tenantId.trim() || !actor.workspaceId.trim() || !actor.projectId.trim()) fail("SCOPE_REQUIRED");
  if (blockedParty(actor.actorId) || blockedParty(actor.authority)) fail("AI_NOT_GEOTECHNICAL_AUTHORITY");
  if (actor.authority === "ADMINISTRATOR" || actor.authority === "ADMIN") fail("ADMIN_NOT_GEOTECHNICAL_AUTHORITY");
  if (actor.authority === "GEOTECHNICAL_ENGINEERING_AUTHORITY") fail("RECORDER_NOT_GEOTECHNICAL_ENGINEERING_AUTHORITY");
  if (actor.authority !== D3_CONTEXT_AUTHORITY) fail("UNAUTHORIZED");
}

function assertScope(actor: D3R1Actor, input: { tenantId?: string; workspaceId?: string; projectId?: string }): void {
  if (input.tenantId != null && input.tenantId !== actor.tenantId) fail("CROSS_TENANT_OPERATION");
  if (input.workspaceId != null && input.workspaceId !== actor.workspaceId) fail("CROSS_WORKSPACE_OPERATION");
  if (input.projectId != null && input.projectId !== actor.projectId) fail("CROSS_PROJECT_OPERATION");
}

function assertProhibited(input: Prohibited): void {
  if (input.boreholeData === true) fail("BOREHOLE_DATA_NOT_IN_R1");
  if (input.testPitData === true) fail("TEST_PIT_DATA_NOT_IN_R1");
  if (input.stratigraphy === true) fail("STRATIGRAPHY_NOT_IN_R1");
  if (input.groundwaterData === true) fail("GROUNDWATER_DATA_NOT_IN_R1");
  if (input.materialClassification === true) fail("MATERIAL_CLASSIFICATION_NOT_IN_R1");
  if (input.fieldTestData === true) fail("FIELD_TEST_DATA_NOT_IN_R1");
  if (input.labTestData === true) fail("LAB_TEST_DATA_NOT_IN_R1");
  if (input.parameter === true) fail("PARAMETER_NOT_IN_R1");
  if (input.parameterCalculation === true) fail("PARAMETER_CALCULATION_NOT_IN_R1");
  if (input.parameterInference === true) fail("PARAMETER_INFERENCE_NOT_IN_R1");
  if (input.foundationRecommendation === true) fail("FOUNDATION_RECOMMENDATION_NOT_IN_R1");
  if (input.excavationRecommendation === true) fail("EXCAVATION_RECOMMENDATION_NOT_IN_R1");
  if (input.slopeRecommendation === true) fail("SLOPE_RECOMMENDATION_NOT_IN_R1");
  if (input.foundationCalculation === true) fail("FOUNDATION_CALCULATION_NOT_IN_R1");
  if (input.bearingCapacity === true) fail("BEARING_CAPACITY_NOT_IN_R1");
  if (input.settlementCalculation === true) fail("SETTLEMENT_CALCULATION_NOT_IN_R1");
  if (input.slopeStability === true) fail("SLOPE_STABILITY_NOT_IN_R1");
  if (input.earthPressure === true) fail("EARTH_PRESSURE_NOT_IN_R1");
  if (input.groundImprovementDesign === true) fail("GROUND_IMPROVEMENT_DESIGN_NOT_IN_R1");
  if (input.reviewValidation === true) fail("REVIEW_VALIDATION_NOT_IN_R1");
  if (input.engineeringValidated === true) fail("VALIDATION_NOT_IN_R1");
  if (input.engineeringApproved === true) fail("APPROVAL_NOT_IN_R1");
  if (input.certified === true) fail("CERTIFICATION_NOT_IN_R1");
  if (input.advanceMaturity === true) fail("MATURITY_PROGRESSION_NOT_IN_R1");
  if (input.d1Integration === true) fail("D1_INTEGRATION_NOT_IN_R1");
  if (input.d2Integration === true) fail("D2_INTEGRATION_NOT_IN_R1");
  if (input.d4Integration === true) fail("D4_D8_INTEGRATION_NOT_IN_R1");
  if (input.d9Reasoning === true) fail("D9_NOT_IN_R1");
  if (input.inferredRelationship === true) fail("INFERRED_RELATIONSHIP_REJECTED");
}

function assertIdentityToken(value: string, code: string): string {
  const token = value.trim();
  if (!token || FLOATING.has(token.toLowerCase()) || blockedParty(token)) fail(code);
  return token;
}

function remember(store: D3R1Store, subjectKind: D3R1History["subjectKind"], subjectId: string, action: D3R1History["action"], fingerprint: string, actor: D3R1Actor): void {
  store.history.push({
    historyId: `hist-${store.history.length + 1}`,
    subjectKind,
    subjectId,
    action,
    fingerprint,
    actorId: actor.actorId,
    authority: D3_CONTEXT_AUTHORITY,
    recordedAt: store.now(),
  });
}

export function createD3R1Store(now: () => string = () => "2026-10-23T00:00:00.000Z"): D3R1Store {
  return { now, contexts: [], objects: [], history: [] };
}

export function recordGeotechnicalContext(store: D3R1Store, actor: D3R1Actor, input: D3R1ContextInput): D3R1ContextRecord {
  assertActor(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const contextId = assertIdentityToken(input.contextId, "CONTEXT_IDENTITY_REQUIRED");
  if (!input.provenanceRef.trim() || blockedParty(input.provenanceRef)) fail("MISSING_PROVENANCE");
  if (input.discipline != null && input.discipline !== D3_DISCIPLINE) fail("DISCIPLINE_NOT_GEOTECHNICAL");
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
    discipline: D3_DISCIPLINE,
    citedLifecycleStage: stage,
    provenanceRef: input.provenanceRef.trim(),
    authority: D3_CONTEXT_AUTHORITY,
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
  const record: D3R1ContextRecord = Object.freeze({
    contextId,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
    discipline: D3_DISCIPLINE,
    citedLifecycleStage: stage,
    authority: D3_CONTEXT_AUTHORITY,
    geotechnicalEngineeringAuthority: false,
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
    const superseded: D3R1ContextRecord = Object.freeze({ ...predecessor, recordStatus: "SUPERSEDED", currentness: "SUPERSEDED" });
    store.contexts[index] = superseded;
    remember(store, "CONTEXT", superseded.contextId, "SUPERSEDED", superseded.fingerprint, actor);
  }
  store.contexts.push(record);
  remember(store, "CONTEXT", record.contextId, "CREATED", record.fingerprint, actor);
  return record;
}

function normalizeRelationships(store: D3R1Store, actor: D3R1Actor, contextId: string, parentObjectId: string | null, relationships: D3R1ObjectInput["relationships"]): D3R1Relationship[] {
  const explicit = [...(relationships ?? [])];
  if (parentObjectId) explicit.push({ kind: "PARENT", targetObjectId: parentObjectId });
  const normalized: D3R1Relationship[] = [];
  for (const link of explicit) {
    if (!(D3_EXPLICIT_RELATIONSHIP_KINDS as readonly string[]).includes(link.kind)) fail("RELATIONSHIP_KIND_NOT_EXPLICIT");
    const target = store.objects.find((row) => row.objectId === link.targetObjectId && row.recordStatus === "CURRENT");
    if (!target) fail("RELATIONSHIP_TARGET_NOT_FOUND");
    if (target.tenantId !== actor.tenantId) fail("CROSS_TENANT_OPERATION");
    if (target.workspaceId !== actor.workspaceId) fail("CROSS_WORKSPACE_OPERATION");
    if (target.projectId !== actor.projectId) fail("CROSS_PROJECT_OPERATION");
    if (target.contextId !== contextId) fail("RELATIONSHIP_CONTEXT_MISMATCH");
    normalized.push({ kind: link.kind as D3R1Relationship["kind"], targetObjectId: target.objectId });
  }
  normalized.sort((left, right) => `${left.kind}:${left.targetObjectId}`.localeCompare(`${right.kind}:${right.targetObjectId}`));
  return normalized;
}

export function recordGeotechnicalObjectIdentity(store: D3R1Store, actor: D3R1Actor, input: D3R1ObjectInput): D3R1ObjectRecord {
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
    discipline: D3_DISCIPLINE,
    citedLifecycleStage: stage,
    parentObjectId,
    relationships,
    provenanceRef: input.provenanceRef.trim(),
    authority: D3_CONTEXT_AUTHORITY,
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
  const record: D3R1ObjectRecord = Object.freeze({
    objectId,
    contextId: context.contextId,
    objectType: input.objectType,
    objectCategory,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
    discipline: D3_DISCIPLINE,
    citedLifecycleStage: stage,
    parentObjectId,
    relationships: Object.freeze(relationships),
    authority: D3_CONTEXT_AUTHORITY,
    geotechnicalEngineeringAuthority: false,
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
    const superseded: D3R1ObjectRecord = Object.freeze({ ...predecessor, recordStatus: "SUPERSEDED", currentness: "SUPERSEDED" });
    store.objects[index] = superseded;
    remember(store, "OBJECT", superseded.objectId, "SUPERSEDED", superseded.fingerprint, actor);
  }
  store.objects.push(record);
  remember(store, "OBJECT", record.objectId, "CREATED", record.fingerprint, actor);
  return record;
}

export function reconstructGeotechnicalContext(store: D3R1Store, contextId: string): D3R1ContextRecord {
  const record = store.contexts.find((row) => row.contextId === contextId);
  if (!record) fail("CONTEXT_NOT_FOUND");
  return record;
}

export function reconstructGeotechnicalObject(store: D3R1Store, objectId: string): D3R1ObjectRecord {
  const record = store.objects.find((row) => row.objectId === objectId);
  if (!record) fail("OBJECT_NOT_FOUND");
  return record;
}

export function mutateGeotechnicalContext(): never {
  return fail("CONTEXT_MUTATION_REJECTED");
}

export function mutateGeotechnicalObject(): never {
  return fail("OBJECT_MUTATION_REJECTED");
}

export function advanceGeotechnicalMaturity(): never {
  return fail("MATURITY_PROGRESSION_NOT_IN_R1");
}

export function recordBoreholeData(): never {
  return fail("BOREHOLE_DATA_NOT_IN_R1");
}

export function deriveGeotechnicalParameter(): never {
  return fail("PARAMETER_NOT_IN_R1");
}

export function recommendFoundation(): never {
  return fail("FOUNDATION_RECOMMENDATION_NOT_IN_R1");
}
