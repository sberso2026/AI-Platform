/**
 * EOS-D4-R1 Mechanical identity and object foundation.
 * One bounded runtime. Identity only. No equipment data, design conditions, performance, vendor data, or calculations.
 */
import {
  ADMIN_EQUALS_D4_MECHANICAL_ENGINEERING_AUTHORITY as ARCH_ADMIN_EQUALS,
  AI_EQUALS_D4_MECHANICAL_ENGINEERING_AUTHORITY as ARCH_AI_EQUALS,
  D4_ARCHITECTURE_DEFINED,
  D4_ARCHITECTURE_READY,
  D4_CURRENTNESS_STATES,
  D4_EQUALS_D1_STRUCTURAL_AUTHORITY as ARCH_EQUALS_D1,
  D4_EQUALS_D2_CIVIL_AUTHORITY as ARCH_EQUALS_D2,
  D4_EQUALS_D3_GEOTECHNICAL_AUTHORITY as ARCH_EQUALS_D3,
  D4_EQUALS_D5_PIPING_AUTHORITY as ARCH_EQUALS_D5,
  D4_EQUALS_D6_PROCESS_AUTHORITY as ARCH_EQUALS_D6,
  D4_EQUALS_D7_ELECTRICAL_AUTHORITY as ARCH_EQUALS_D7,
  D4_EQUALS_D8_INSTRUMENTATION_CONTROL_AUTHORITY as ARCH_EQUALS_D8,
  D4_IMPLEMENTATION_PHASES,
  D4_MATURITY_STATES,
  D4_MECHANICAL_DESIGN_CONDITION_EQUALS_VALIDATED_DESIGN_CONDITION as ARCH_DESIGN_EQUALS_VALIDATED,
  D4_MECHANICAL_OBJECT_TYPES,
  D4_REUSES_CANONICAL_CURRENTNESS as ARCH_REUSES_CURRENTNESS,
  D4_REUSES_CANONICAL_FINGERPRINT as ARCH_REUSES_FINGERPRINT,
  D4_VALIDATED_EQUALS_APPROVED as ARCH_VALIDATED_EQUALS_APPROVED,
  D4_VALIDATED_EQUALS_CERTIFIED as ARCH_VALIDATED_EQUALS_CERTIFIED,
  D4_VALIDATED_EQUALS_CONFORMANT as ARCH_VALIDATED_EQUALS_CONFORMANT,
  PARALLEL_D4_CURRENTNESS_ENGINE_CREATED as ARCH_PARALLEL_CURRENTNESS,
  PROCESS_CONDITION_EQUALS_MECHANICAL_DESIGN_CONDITION as ARCH_PROCESS_EQUALS,
  REVIEWED_EQUALS_VALIDATED as ARCH_REVIEWED_EQUALS_VALIDATED,
  SECOND_D4_FINGERPRINT_ALGORITHM_CREATED as ARCH_SECOND_FINGERPRINT,
  SOURCE_REQUIREMENT_EQUALS_MECHANICAL_INTERPRETATION as ARCH_SOURCE_EQUALS,
  VENDOR_DATA_EQUALS_ENGINEERING_APPROVAL as ARCH_VENDOR_EQUALS_APPROVAL,
} from "@rtb/types";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";

export const D4_R1_STATUS = "MECHANICAL_IDENTITY_AND_OBJECT_FOUNDATION_IMPLEMENTED" as const;
export const D4_R1_MATURITY = "MECHANICAL_IDENTITY_AND_OBJECT_FOUNDATION_IMPLEMENTED" as const;
export const D4_R1_MATURITY_STATE = D4_R1_MATURITY;
export const D4_R1_CLOSEOUT_PATH =
  "docs/architecture/engineering-os/EOS_D4_R1_MECHANICAL_IDENTITY_AND_OBJECT_FOUNDATION_CLOSEOUT.md" as const;
export const D4_R1_PARENT_ARCHITECTURE_PATH =
  "docs/architecture/engineering-os/EOS_D4_0_MECHANICAL_ARCHITECTURE.md" as const;
export const D4_R1_ARCHITECTURE_DEFINED = D4_ARCHITECTURE_DEFINED;
export const D4_R1_ARCHITECTURE_READY = D4_ARCHITECTURE_READY;

export const D4_RUNTIME_STARTED = true as const;
export const D4_RUNTIME_COUNT = 1 as const;
export const D4_MECHANICAL_CONTEXT_RUNTIME_IMPLEMENTED = true as const;
export const D4_MECHANICAL_CONTEXT_RUNTIME_COUNT = 1 as const;
export const D4_MECHANICAL_IDENTITY_OBJECT_FOUNDATION_RUNTIME_READY = true as const;
export const D4_OBJECT_TYPE_ALLOWLIST_ENFORCED = true as const;
export const FREEFORM_AUTHORITATIVE_D4_OBJECT_TYPE_ALLOWED = false as const;
export const UNKNOWN_D4_OBJECT_TYPE_AUTO_ACCEPTED = false as const;
export const D4_OBJECT_IDENTITY_EQUALS_ENGINEERING_CONTENT = false as const;
export const D4_OBJECT_IDENTITY_EQUALS_ENGINEERING_VALIDATED = false as const;
export const D4_MECHANICAL_CONTEXT_EQUALS_ENGINEERING_DESIGN = false as const;
export const D4_MECHANICAL_CONTEXT_EQUALS_ENGINEERING_VALIDATED = false as const;
export const D4_EXPLICIT_RELATIONSHIPS_SUPPORTED = true as const;
export const D4_INFERRED_ENGINEERING_RELATIONSHIPS_ALLOWED = false as const;
export const D4_EXPLICIT_RELATIONSHIP_KINDS = ["PARENT", "OBJECT_REFERENCE"] as const;
export const D4_LIFECYCLE_MATURITY_GOVERNED = true as const;
export const D4_AUTOMATIC_MATURITY_PROGRESSION_ALLOWED = false as const;
export const TENANT_WORKSPACE_PROJECT_D4_SCOPE_ENFORCED = true as const;
export const CROSS_TENANT_D4_OBJECT_ACCESS_ALLOWED = false as const;
export const D4_PROVENANCE_REQUIRED = true as const;
export const D4_PROVENANCE_PRESERVED = true as const;
export const D4_REUSES_CANONICAL_OBJECT_IDENTITY = true as const;
export const D4_REUSES_CANONICAL_CURRENTNESS = ARCH_REUSES_CURRENTNESS;
export const D4_REUSES_CANONICAL_FINGERPRINT = ARCH_REUSES_FINGERPRINT;
export const PARALLEL_D4_IDENTITY_SYSTEM_CREATED = false as const;
export const PARALLEL_D4_CURRENTNESS_ENGINE_CREATED = ARCH_PARALLEL_CURRENTNESS;
export const CANONICAL_FINGERPRINT_REUSED = ARCH_REUSES_FINGERPRINT;
export const D4_OBJECT_FINGERPRINT_IMPLEMENTED = true as const;
export const SECOND_D4_FINGERPRINT_ALGORITHM_CREATED = ARCH_SECOND_FINGERPRINT;
export const SILENT_D4_OBJECT_MUTATION_ALLOWED = false as const;
export const D4_OBJECT_HISTORY_PRESERVED = true as const;
export const D4_DUPLICATE_GOVERNANCE_IMPLEMENTED = true as const;
export const D4_REPLAY_PROTECTION_IMPLEMENTED = true as const;
export const D4_SPOOFING_PROTECTION_IMPLEMENTED = true as const;
export const AI_EQUALS_D4_MECHANICAL_ENGINEERING_AUTHORITY = ARCH_AI_EQUALS;
export const ADMIN_EQUALS_D4_MECHANICAL_ENGINEERING_AUTHORITY = ARCH_ADMIN_EQUALS;
export const D4_EQUALS_D1_STRUCTURAL_AUTHORITY = ARCH_EQUALS_D1;
export const D4_EQUALS_D2_CIVIL_AUTHORITY = ARCH_EQUALS_D2;
export const D4_EQUALS_D3_GEOTECHNICAL_AUTHORITY = ARCH_EQUALS_D3;
export const D4_EQUALS_D5_PIPING_AUTHORITY = ARCH_EQUALS_D5;
export const D4_EQUALS_D6_PROCESS_AUTHORITY = ARCH_EQUALS_D6;
export const D4_EQUALS_D7_ELECTRICAL_AUTHORITY = ARCH_EQUALS_D7;
export const D4_EQUALS_D8_INSTRUMENTATION_CONTROL_AUTHORITY = ARCH_EQUALS_D8;
export const SOURCE_REQUIREMENT_EQUALS_MECHANICAL_INTERPRETATION = ARCH_SOURCE_EQUALS;
export const PROCESS_CONDITION_EQUALS_MECHANICAL_DESIGN_CONDITION = ARCH_PROCESS_EQUALS;
export const MECHANICAL_DESIGN_CONDITION_EQUALS_VALIDATED_DESIGN_CONDITION = ARCH_DESIGN_EQUALS_VALIDATED;
export const VENDOR_DATA_EQUALS_ENGINEERING_APPROVAL = ARCH_VENDOR_EQUALS_APPROVAL;
export const REVIEWED_EQUALS_VALIDATED = ARCH_REVIEWED_EQUALS_VALIDATED;
export const VALIDATED_EQUALS_CONFORMANT = ARCH_VALIDATED_EQUALS_CONFORMANT;
export const VALIDATED_EQUALS_APPROVED = ARCH_VALIDATED_EQUALS_APPROVED;
export const VALIDATED_EQUALS_CERTIFIED = ARCH_VALIDATED_EQUALS_CERTIFIED;
export const D4_CONTEXT_AUTHORITY = "MECHANICAL_CONTEXT_AUTHORITY" as const;
export const D4_DISCIPLINE = "MECHANICAL" as const;
export const D4_R1_CURRENTNESS_STATES = D4_CURRENTNESS_STATES;

export const D4_EQUIPMENT_SYSTEM_CONTEXT_RUNTIME_READY = false as const;
export const D4_DESIGN_CONDITION_PERFORMANCE_RUNTIME_READY = false as const;
export const D4_VENDOR_DATA_EVIDENCE_RUNTIME_READY = false as const;
export const D4_MECHANICAL_TECHNICAL_CONTEXT_RUNTIME_READY = false as const;
export const D4_MAINTAINABILITY_ACCESS_PACKAGE_RUNTIME_READY = false as const;
export const D4_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY = false as const;
export const D4_DISCIPLINE_INTERFACE_RUNTIME_READY = false as const;
export const D4_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_READY = false as const;
export const D4_CURRENTNESS_DIGITAL_THREAD_RUNTIME_READY = false as const;
export const D4_D9_SOURCE_CONTRACT_RUNTIME_READY = false as const;

export const D4_EQUIPMENT_CONTEXT_RUNTIME_COUNT = 0 as const;
export const D4_DESIGN_CONDITION_RUNTIME_COUNT = 0 as const;
export const D4_PERFORMANCE_CONTEXT_RUNTIME_COUNT = 0 as const;
export const D4_VENDOR_DATA_RUNTIME_COUNT = 0 as const;
export const D4_MECHANICAL_REQUIREMENT_RUNTIME_COUNT = 0 as const;
export const D4_MAINTAINABILITY_RUNTIME_COUNT = 0 as const;
export const D4_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_COUNT = 0 as const;
export const D4_DISCIPLINE_INTERFACE_RUNTIME_COUNT = 0 as const;
export const D4_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_COUNT = 0 as const;
export const D4_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT = 0 as const;
export const D4_D9_SOURCE_CONTRACT_RUNTIME_COUNT = 0 as const;
export const D4_EQUIPMENT_SIZING_RUNTIME_COUNT = 0 as const;
export const D4_ROTATING_EQUIPMENT_CALCULATION_RUNTIME_COUNT = 0 as const;
export const D4_STATIC_EQUIPMENT_CALCULATION_RUNTIME_COUNT = 0 as const;
export const D4_THERMAL_MECHANICAL_CALCULATION_RUNTIME_COUNT = 0 as const;
export const D4_MECHANICAL_LOAD_CALCULATION_RUNTIME_COUNT = 0 as const;
export const D4_VIBRATION_ANALYSIS_RUNTIME_COUNT = 0 as const;
export const D4_FATIGUE_ANALYSIS_RUNTIME_COUNT = 0 as const;
export const D4_MECHANICAL_DESIGN_OPTIMIZATION_RUNTIME_COUNT = 0 as const;
export const D4_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT = 0 as const;
export const D4_APPROVAL_RUNTIME_COUNT = 0 as const;
export const D4_CERTIFICATION_RUNTIME_COUNT = 0 as const;
export const D4_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT = 0 as const;
export const D4_CROSS_DISCIPLINE_CONFLICT_DETECTION_RUNTIME_COUNT = 0 as const;
export const D4_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT = 0 as const;
export const D4_CROSS_DISCIPLINE_RECOMMENDATION_RUNTIME_COUNT = 0 as const;
export const D4_D9_RUNTIME_INTEGRATION_COUNT = 0 as const;
export const D5_RUNTIME_STARTED = false as const;
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
export const UNAUTHORIZED_D4_R2_R12_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_D5_D8_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_D9_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_MECHANICAL_CALCULATION_PROMOTION = false as const;
export const UNAUTHORIZED_MECHANICAL_VALIDATION_PROMOTION = false as const;
export const UNAUTHORIZED_MECHANICAL_APPROVAL_PROMOTION = false as const;
export const UNAUTHORIZED_MECHANICAL_CERTIFICATION_PROMOTION = false as const;
export const UNAUTHORIZED_CROSS_DISCIPLINE_REASONING_PROMOTION = false as const;
export const UNAUTHORIZED_GA_PROMOTION = false as const;
export const UNAUTHORIZED_PRODUCT_CLAIM = false as const;

export const D4_R2_CANONICAL_PHASE = D4_IMPLEMENTATION_PHASES[1];
export const D4_R2_PHASE_TYPE = "EQUIPMENT_AND_SYSTEM_CONTEXT" as const;
export const D4_R2_CANONICAL_SCOPE =
  "Implement governed Mechanical equipment and system context using exact R1 identities. Record equipment/system classification, service/function, package/system membership, equipment category and governed descriptive Mechanical context without yet implementing design conditions, performance data, vendor data, equipment sizing/calculations, discipline interfaces, review/validation or D5-D9 runtime." as const;
export const D4_R2_STARTED = false as const;
export const D4_R1_READY_FOR_NEXT_PHASE = true as const;
export const D4_R1_NEXT_PHASE = D4_R2_CANONICAL_PHASE;
export const D4_R1_NEXT_PHASE_TYPE = D4_R2_PHASE_TYPE;
export const D4_R1_CANONICAL_NEXT_PHASE = D4_R2_CANONICAL_PHASE;
export const D4_R1_CANONICAL_NEXT_PHASE_SCOPE = D4_R2_CANONICAL_SCOPE;
export const D4_R1_BLOCKER = "NONE" as const;
export const D4_R1_MACHINE_READABLE_ROADMAP_UPDATED = true as const;

const FLOATING = new Set(["latest", "current", "newest", "head", "active", "active model"]);

export type D4R1Actor = {
  actorId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  authority: string;
};

export type D4R1Relationship = {
  kind: (typeof D4_EXPLICIT_RELATIONSHIP_KINDS)[number];
  targetObjectId: string;
};

type Prohibited = {
  equipmentEngineeringData?: boolean;
  designCondition?: boolean;
  performanceData?: boolean;
  vendorData?: boolean;
  mechanicalRequirementContent?: boolean;
  maintainabilityData?: boolean;
  requirementsAssumptionsChange?: boolean;
  disciplineInterface?: boolean;
  reviewValidation?: boolean;
  engineeringValidated?: boolean;
  engineeringApproved?: boolean;
  certified?: boolean;
  advanceMaturity?: boolean;
  equipmentSizing?: boolean;
  rotatingCalculation?: boolean;
  staticCalculation?: boolean;
  thermalMechanicalCalculation?: boolean;
  mechanicalLoadCalculation?: boolean;
  vibrationAnalysis?: boolean;
  fatigueAnalysis?: boolean;
  designOptimization?: boolean;
  d1Integration?: boolean;
  d2Integration?: boolean;
  d3Integration?: boolean;
  d5Integration?: boolean;
  d9Reasoning?: boolean;
  inferredRelationship?: boolean;
};

export type D4R1ContextInput = Prohibited & {
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

export type D4R1ContextRecord = {
  contextId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  discipline: typeof D4_DISCIPLINE;
  citedLifecycleStage: (typeof D4_MATURITY_STATES)[number];
  authority: typeof D4_CONTEXT_AUTHORITY;
  mechanicalEngineeringAuthority: false;
  provenanceRef: string;
  fingerprint: string;
  recordedBy: string;
  recordedAt: string;
  recordStatus: "CURRENT" | "SUPERSEDED";
  currentness: "CURRENT" | "SUPERSEDED";
  predecessorContextId: string | null;
};

export type D4R1ObjectInput = Prohibited & {
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

export type D4R1ObjectRecord = {
  objectId: string;
  contextId: string;
  objectType: (typeof D4_MECHANICAL_OBJECT_TYPES)[number];
  tenantId: string;
  workspaceId: string;
  projectId: string;
  discipline: typeof D4_DISCIPLINE;
  citedLifecycleStage: (typeof D4_MATURITY_STATES)[number];
  parentObjectId: string | null;
  relationships: readonly D4R1Relationship[];
  authority: typeof D4_CONTEXT_AUTHORITY;
  mechanicalEngineeringAuthority: false;
  provenanceRef: string;
  fingerprint: string;
  recordedBy: string;
  recordedAt: string;
  recordStatus: "CURRENT" | "SUPERSEDED";
  currentness: "CURRENT" | "SUPERSEDED";
  predecessorObjectId: string | null;
};

export type D4R1History = {
  historyId: string;
  subjectKind: "CONTEXT" | "OBJECT";
  subjectId: string;
  action: "CREATED" | "SUPERSEDED";
  fingerprint: string;
  actorId: string;
  authority: typeof D4_CONTEXT_AUTHORITY;
  recordedAt: string;
};

export type D4R1Store = {
  now: () => string;
  contexts: D4R1ContextRecord[];
  objects: D4R1ObjectRecord[];
  history: D4R1History[];
};

function fail(code: string): never {
  throw new Error(code);
}

function blockedParty(value: string): boolean {
  return /^AI(?:\b|_)/i.test(value) || /LLM/i.test(value) || /OPTIMIZER/i.test(value);
}

function isStage(value: string): value is (typeof D4_MATURITY_STATES)[number] {
  return (D4_MATURITY_STATES as readonly string[]).includes(value);
}

function isObjectType(value: string): value is (typeof D4_MECHANICAL_OBJECT_TYPES)[number] {
  return (D4_MECHANICAL_OBJECT_TYPES as readonly string[]).includes(value);
}

function assertActor(actor: D4R1Actor): void {
  if (!actor.actorId.trim() || !actor.tenantId.trim() || !actor.workspaceId.trim() || !actor.projectId.trim()) fail("SCOPE_REQUIRED");
  if (blockedParty(actor.actorId) || blockedParty(actor.authority)) fail("AI_NOT_MECHANICAL_AUTHORITY");
  if (actor.authority === "ADMINISTRATOR" || actor.authority === "ADMIN") fail("ADMIN_NOT_MECHANICAL_AUTHORITY");
  if (actor.authority === "MECHANICAL_ENGINEERING_AUTHORITY") fail("RECORDER_NOT_MECHANICAL_ENGINEERING_AUTHORITY");
  if (actor.authority !== D4_CONTEXT_AUTHORITY) fail("UNAUTHORIZED");
}

function assertScope(actor: D4R1Actor, input: { tenantId?: string; workspaceId?: string; projectId?: string }): void {
  if (input.tenantId != null && input.tenantId !== actor.tenantId) fail("CROSS_TENANT_OPERATION");
  if (input.workspaceId != null && input.workspaceId !== actor.workspaceId) fail("CROSS_WORKSPACE_OPERATION");
  if (input.projectId != null && input.projectId !== actor.projectId) fail("CROSS_PROJECT_OPERATION");
}

function assertProhibited(input: Prohibited): void {
  if (input.equipmentEngineeringData === true) fail("EQUIPMENT_CONTEXT_NOT_IN_R1");
  if (input.designCondition === true) fail("DESIGN_CONDITION_NOT_IN_R1");
  if (input.performanceData === true) fail("PERFORMANCE_CONTEXT_NOT_IN_R1");
  if (input.vendorData === true) fail("VENDOR_DATA_NOT_IN_R1");
  if (input.mechanicalRequirementContent === true) fail("MECHANICAL_REQUIREMENT_NOT_IN_R1");
  if (input.maintainabilityData === true) fail("MAINTAINABILITY_NOT_IN_R1");
  if (input.requirementsAssumptionsChange === true) fail("REQUIREMENTS_ASSUMPTIONS_CHANGE_NOT_IN_R1");
  if (input.disciplineInterface === true) fail("DISCIPLINE_INTERFACE_NOT_IN_R1");
  if (input.reviewValidation === true) fail("REVIEW_VALIDATION_NOT_IN_R1");
  if (input.engineeringValidated === true) fail("VALIDATION_NOT_IN_R1");
  if (input.engineeringApproved === true) fail("APPROVAL_NOT_IN_R1");
  if (input.certified === true) fail("CERTIFICATION_NOT_IN_R1");
  if (input.advanceMaturity === true) fail("MATURITY_PROGRESSION_NOT_IN_R1");
  if (input.equipmentSizing === true) fail("EQUIPMENT_SIZING_NOT_IN_R1");
  if (input.rotatingCalculation === true) fail("ROTATING_CALCULATION_NOT_IN_R1");
  if (input.staticCalculation === true) fail("STATIC_CALCULATION_NOT_IN_R1");
  if (input.thermalMechanicalCalculation === true) fail("THERMAL_MECHANICAL_CALCULATION_NOT_IN_R1");
  if (input.mechanicalLoadCalculation === true) fail("MECHANICAL_LOAD_CALCULATION_NOT_IN_R1");
  if (input.vibrationAnalysis === true) fail("VIBRATION_ANALYSIS_NOT_IN_R1");
  if (input.fatigueAnalysis === true) fail("FATIGUE_ANALYSIS_NOT_IN_R1");
  if (input.designOptimization === true) fail("DESIGN_OPTIMIZATION_NOT_IN_R1");
  if (input.d1Integration === true) fail("D1_INTEGRATION_NOT_IN_R1");
  if (input.d2Integration === true) fail("D2_INTEGRATION_NOT_IN_R1");
  if (input.d3Integration === true) fail("D3_INTEGRATION_NOT_IN_R1");
  if (input.d5Integration === true) fail("D5_D8_INTEGRATION_NOT_IN_R1");
  if (input.d9Reasoning === true) fail("D9_NOT_IN_R1");
  if (input.inferredRelationship === true) fail("INFERRED_RELATIONSHIP_REJECTED");
}

function assertIdentityToken(value: string, code: string): string {
  const token = value.trim();
  if (!token || FLOATING.has(token.toLowerCase()) || blockedParty(token)) fail(code);
  return token;
}

function remember(store: D4R1Store, subjectKind: D4R1History["subjectKind"], subjectId: string, action: D4R1History["action"], fingerprint: string, actor: D4R1Actor): void {
  store.history.push({
    historyId: `hist-${store.history.length + 1}`,
    subjectKind,
    subjectId,
    action,
    fingerprint,
    actorId: actor.actorId,
    authority: D4_CONTEXT_AUTHORITY,
    recordedAt: store.now(),
  });
}

export function createD4R1Store(now: () => string = () => "2026-10-24T00:00:00.000Z"): D4R1Store {
  return { now, contexts: [], objects: [], history: [] };
}

export function recordMechanicalContext(store: D4R1Store, actor: D4R1Actor, input: D4R1ContextInput): D4R1ContextRecord {
  assertActor(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const contextId = assertIdentityToken(input.contextId, "CONTEXT_IDENTITY_REQUIRED");
  if (!input.provenanceRef.trim() || blockedParty(input.provenanceRef)) fail("MISSING_PROVENANCE");
  if (input.discipline != null && input.discipline !== D4_DISCIPLINE) fail("DISCIPLINE_NOT_MECHANICAL");
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
    discipline: D4_DISCIPLINE,
    citedLifecycleStage: stage,
    provenanceRef: input.provenanceRef.trim(),
    authority: D4_CONTEXT_AUTHORITY,
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
  const record: D4R1ContextRecord = Object.freeze({
    contextId,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
    discipline: D4_DISCIPLINE,
    citedLifecycleStage: stage,
    authority: D4_CONTEXT_AUTHORITY,
    mechanicalEngineeringAuthority: false,
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
    const superseded: D4R1ContextRecord = Object.freeze({ ...predecessor, recordStatus: "SUPERSEDED", currentness: "SUPERSEDED" });
    store.contexts[index] = superseded;
    remember(store, "CONTEXT", superseded.contextId, "SUPERSEDED", superseded.fingerprint, actor);
  }
  store.contexts.push(record);
  remember(store, "CONTEXT", record.contextId, "CREATED", record.fingerprint, actor);
  return record;
}

function normalizeRelationships(store: D4R1Store, actor: D4R1Actor, contextId: string, parentObjectId: string | null, relationships: D4R1ObjectInput["relationships"]): D4R1Relationship[] {
  const explicit = [...(relationships ?? [])];
  if (parentObjectId) explicit.push({ kind: "PARENT", targetObjectId: parentObjectId });
  const normalized: D4R1Relationship[] = [];
  for (const link of explicit) {
    if (!(D4_EXPLICIT_RELATIONSHIP_KINDS as readonly string[]).includes(link.kind)) fail("RELATIONSHIP_KIND_NOT_EXPLICIT");
    const target = store.objects.find((row) => row.objectId === link.targetObjectId && row.recordStatus === "CURRENT");
    if (!target) fail("RELATIONSHIP_TARGET_NOT_FOUND");
    if (target.tenantId !== actor.tenantId) fail("CROSS_TENANT_OPERATION");
    if (target.workspaceId !== actor.workspaceId) fail("CROSS_WORKSPACE_OPERATION");
    if (target.projectId !== actor.projectId) fail("CROSS_PROJECT_OPERATION");
    if (target.contextId !== contextId) fail("RELATIONSHIP_CONTEXT_MISMATCH");
    normalized.push({ kind: link.kind as D4R1Relationship["kind"], targetObjectId: target.objectId });
  }
  normalized.sort((left, right) => `${left.kind}:${left.targetObjectId}`.localeCompare(`${right.kind}:${right.targetObjectId}`));
  return normalized;
}

export function recordMechanicalObjectIdentity(store: D4R1Store, actor: D4R1Actor, input: D4R1ObjectInput): D4R1ObjectRecord {
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
    discipline: D4_DISCIPLINE,
    citedLifecycleStage: stage,
    parentObjectId,
    relationships,
    provenanceRef: input.provenanceRef.trim(),
    authority: D4_CONTEXT_AUTHORITY,
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
  const record: D4R1ObjectRecord = Object.freeze({
    objectId,
    contextId: context.contextId,
    objectType: input.objectType,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
    discipline: D4_DISCIPLINE,
    citedLifecycleStage: stage,
    parentObjectId,
    relationships: Object.freeze(relationships),
    authority: D4_CONTEXT_AUTHORITY,
    mechanicalEngineeringAuthority: false,
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
    const superseded: D4R1ObjectRecord = Object.freeze({ ...predecessor, recordStatus: "SUPERSEDED", currentness: "SUPERSEDED" });
    store.objects[index] = superseded;
    remember(store, "OBJECT", superseded.objectId, "SUPERSEDED", superseded.fingerprint, actor);
  }
  store.objects.push(record);
  remember(store, "OBJECT", record.objectId, "CREATED", record.fingerprint, actor);
  return record;
}

export function reconstructMechanicalContext(store: D4R1Store, contextId: string): D4R1ContextRecord {
  const record = store.contexts.find((row) => row.contextId === contextId);
  if (!record) fail("CONTEXT_NOT_FOUND");
  return record;
}

export function reconstructMechanicalObject(store: D4R1Store, objectId: string): D4R1ObjectRecord {
  const record = store.objects.find((row) => row.objectId === objectId);
  if (!record) fail("OBJECT_NOT_FOUND");
  return record;
}

export function mutateMechanicalContext(): never {
  return fail("CONTEXT_MUTATION_REJECTED");
}

export function mutateMechanicalObject(): never {
  return fail("OBJECT_MUTATION_REJECTED");
}

export function advanceMechanicalMaturity(): never {
  return fail("MATURITY_PROGRESSION_NOT_IN_R1");
}

export function recordEquipmentEngineeringContext(): never {
  return fail("EQUIPMENT_CONTEXT_NOT_IN_R1");
}

export function recordDesignCondition(): never {
  return fail("DESIGN_CONDITION_NOT_IN_R1");
}

export function recordPerformanceContext(): never {
  return fail("PERFORMANCE_CONTEXT_NOT_IN_R1");
}

export function recordVendorData(): never {
  return fail("VENDOR_DATA_NOT_IN_R1");
}

export function sizeMechanicalEquipment(): never {
  return fail("EQUIPMENT_SIZING_NOT_IN_R1");
}

export function validateMechanicalEngineering(): never {
  return fail("VALIDATION_NOT_IN_R1");
}

export function approveMechanicalEngineering(): never {
  return fail("APPROVAL_NOT_IN_R1");
}

export function certifyMechanicalEngineering(): never {
  return fail("CERTIFICATION_NOT_IN_R1");
}
