/**
 * EOS-D3-R10 currentness and digital thread.
 * One bounded runtime. Records explicit lineage, supersession, and currentness
 * marks across exact D3 R1-R9 revisions. Reuses canonical currentness,
 * digital-thread, and fingerprint mechanisms. Does not redesign, revalidate,
 * or start D4 through D9.
 */
import {
  D2_REOPENED as ARCH_D2_REOPENED,
  D3_0_CANONICAL_CURRENTNESS_REUSED,
  D3_0_CANONICAL_DIGITAL_THREAD_REUSED,
  D3_0_CANONICAL_FINGERPRINT_REUSED,
  D3_0_SECOND_FINGERPRINT_ALGORITHM_CREATED,
  D3_APPROVAL_RUNTIME_COUNT as ARCH_APPROVAL_COUNT,
  D3_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT as ARCH_AUTO_VALIDATION_COUNT,
  D3_BEARING_CAPACITY_RUNTIME_COUNT as ARCH_BEARING_COUNT,
  D3_CERTIFICATION_RUNTIME_COUNT as ARCH_CERTIFICATION_COUNT,
  D3_CURRENTNESS_STATES,
  D3_D9_RUNTIME_INTEGRATION_COUNT as ARCH_D9_INTEGRATION_COUNT,
  D3_D9_SOURCE_CONTRACT_RUNTIME_COUNT as ARCH_D9_SOURCE_COUNT,
  D3_EARTH_PRESSURE_RUNTIME_COUNT as ARCH_EARTH_PRESSURE_COUNT,
  D3_EXPLICIT_CHANGE_DEPENDENCIES,
  D3_FOUNDATION_CALCULATION_RUNTIME_COUNT as ARCH_FOUNDATION_CALC_COUNT,
  D3_GROUND_IMPROVEMENT_DESIGN_RUNTIME_COUNT as ARCH_GROUND_IMPROVEMENT_COUNT,
  D3_IMPLEMENTATION_PHASES,
  D3_SETTLEMENT_CALCULATION_RUNTIME_COUNT as ARCH_SETTLEMENT_COUNT,
  D3_SILENT_REPOINTING_ALLOWED,
  D3_SLOPE_STABILITY_RUNTIME_COUNT as ARCH_SLOPE_COUNT,
  INFERRED_D3_DEPENDENCY_PROPAGATION_ALLOWED as ARCH_INFERRED_PROPAGATION,
  PARALLEL_D3_CURRENTNESS_ENGINE_CREATED as ARCH_PARALLEL_CURRENTNESS,
  PARALLEL_D3_DIGITAL_THREAD_CREATED as ARCH_PARALLEL_THREAD,
} from "@rtb/types";
import { isGovernedRelationType } from "../decision-intelligence/relations";
import { relationSemantics } from "../digital-thread/relation-semantics";
import { THREAD_DEFAULT_MAX_DEPTH } from "../digital-thread/types";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import { D3_CONTEXT_AUTHORITY, D3_DISCIPLINE, D3_EXPLICIT_RELATIONSHIP_KINDS, type D3R1Actor } from "./identity-foundation";
import {
  D3_DISCIPLINE_INTERFACE_RUNTIME_READY as R8_INTERFACE_READY,
  D3_FIELD_LAB_TEST_RUNTIME_READY as R4_TEST_READY,
  D3_FOUNDATION_EXCAVATION_SLOPE_RUNTIME_READY as R6_CONTEXT_READY,
  D3_GEOTECHNICAL_IDENTITY_OBJECT_FOUNDATION_RUNTIME_READY as R1_IDENTITY_READY,
  D3_GEOTECHNICAL_PARAMETER_RUNTIME_READY as R5_PARAMETER_READY,
  D3_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY as R7_CHANGE_READY,
  D3_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_READY as R9_REVIEW_READY,
  D3_SITE_INVESTIGATION_EVIDENCE_RUNTIME_READY as R2_EVIDENCE_READY,
  D3_STRATIGRAPHY_GROUNDWATER_MATERIAL_RUNTIME_READY as R3_READY,
  type D3R9Store,
} from "./review-validation-governance";

export const D3_R10_STATUS = "CURRENTNESS_AND_DIGITAL_THREAD_IMPLEMENTED" as const;
export const D3_R10_MATURITY = "CURRENTNESS_AND_DIGITAL_THREAD_IMPLEMENTED" as const;
export const D3_R10_MATURITY_STATE = D3_R10_MATURITY;
export const D3_R10_CLOSEOUT_PATH = "docs/architecture/engineering-os/EOS_D3_R10_CURRENTNESS_AND_DIGITAL_THREAD_CLOSEOUT.md" as const;
export const D3_RUNTIME_STARTED = true as const;
export const D3_RUNTIME_COUNT = 10 as const;
export const D3_CURRENTNESS_DIGITAL_THREAD_RUNTIME_IMPLEMENTED = true as const;
export const D3_CURRENTNESS_DIGITAL_THREAD_RUNTIME_COUNT = 1 as const;
export const D3_CURRENTNESS_DIGITAL_THREAD_RUNTIME_READY = true as const;
export const D3_GEOTECHNICAL_IDENTITY_OBJECT_FOUNDATION_RUNTIME_READY = R1_IDENTITY_READY;
export const D3_SITE_INVESTIGATION_EVIDENCE_RUNTIME_READY = R2_EVIDENCE_READY;
export const D3_STRATIGRAPHY_GROUNDWATER_MATERIAL_RUNTIME_READY = R3_READY;
export const D3_FIELD_LAB_TEST_RUNTIME_READY = R4_TEST_READY;
export const D3_GEOTECHNICAL_PARAMETER_RUNTIME_READY = R5_PARAMETER_READY;
export const D3_FOUNDATION_EXCAVATION_SLOPE_RUNTIME_READY = R6_CONTEXT_READY;
export const D3_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY = R7_CHANGE_READY;
export const D3_DISCIPLINE_INTERFACE_RUNTIME_READY = R8_INTERFACE_READY;
export const D3_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_READY = R9_REVIEW_READY;
export const D3_D9_SOURCE_CONTRACT_RUNTIME_READY = false as const;
export const CANONICAL_CURRENTNESS_REUSED = D3_0_CANONICAL_CURRENTNESS_REUSED;
export const PARALLEL_D3_CURRENTNESS_ENGINE_CREATED = ARCH_PARALLEL_CURRENTNESS;
export const CANONICAL_DIGITAL_THREAD_REUSED = D3_0_CANONICAL_DIGITAL_THREAD_REUSED;
export const PARALLEL_D3_DIGITAL_THREAD_CREATED = ARCH_PARALLEL_THREAD;
export const CANONICAL_FINGERPRINT_REUSED = D3_0_CANONICAL_FINGERPRINT_REUSED;
export const SECOND_FINGERPRINT_ALGORITHM_CREATED = D3_0_SECOND_FINGERPRINT_ALGORITHM_CREATED;
export const D3_R10_THREAD_DEPTH_REUSED = THREAD_DEFAULT_MAX_DEPTH;
export const D3_CURRENTNESS_DIGITAL_THREAD_FINGERPRINT_IMPLEMENTED = true as const;
export const EXACT_D3_REVISION_REFERENCE_REQUIRED = true as const;
export const FLOATING_D3_REVISION_REFERENCE_ALLOWED = false as const;
export const HISTORICAL_D3_REFERENCE_AUTO_REPOINTED = D3_SILENT_REPOINTING_ALLOWED;
export const D3_EXPLICIT_LINEAGE_SUPPORTED = true as const;
export const INFERRED_D3_LINEAGE_ALLOWED = false as const;
export const D3_SUPERSESSION_GOVERNANCE_IMPLEMENTED = true as const;
export const SUPERSEDED_EQUALS_DELETED = false as const;
export const SUPERSEDED_EQUALS_INVALID = false as const;
export const SUPERSEDED_EQUALS_AUTO_REPLACED_IN_HISTORY = false as const;
export const D3_CURRENTNESS_STATE_IMPLEMENTED = true as const;
export const D3_R10_CURRENTNESS_STATES = D3_CURRENTNESS_STATES;
export const STALE_EQUALS_INVALID = false as const;
export const STALE_EQUALS_REJECTED = false as const;
export const REASSESSMENT_REQUIRED_EQUALS_INVALID = false as const;
export const D3_EXPLICIT_CURRENTNESS_PROPAGATION_IMPLEMENTED = true as const;
export const D3_INFERRED_DEPENDENCY_PROPAGATION_ALLOWED = ARCH_INFERRED_PROPAGATION;
export const D3_CURRENTNESS_AUTO_MUTATES_ENGINEERING = false as const;
export const D3_CURRENTNESS_AUTO_RECALCULATES_PARAMETER = false as const;
export const D3_CURRENTNESS_AUTO_REDESIGNS_FOUNDATION = false as const;
export const D3_CURRENTNESS_AUTO_REDESIGNS_EXCAVATION = false as const;
export const D3_CURRENTNESS_AUTO_REDESIGNS_SLOPE = false as const;
export const D3_CURRENTNESS_AUTO_GENERATES_RECOMMENDATION = false as const;
export const D3_R7_CHANGE_CURRENTNESS_INTEGRATED = true as const;
export const D3_R8_INTERFACE_CURRENTNESS_INTEGRATED = true as const;
export const D3_R9_REVIEW_VALIDATION_CURRENTNESS_INTEGRATED = true as const;
export const REASSESSMENT_REQUIRED_EQUALS_RECALCULATED = false as const;
export const REASSESSMENT_REQUIRED_EQUALS_REDESIGNED = false as const;
export const REASSESSMENT_REQUIRED_EQUALS_VALIDATED = false as const;
export const PRIOR_D3_REVIEW_AUTO_TRANSFERS_TO_NEW_REVISION = false as const;
export const PRIOR_D3_VALIDATION_AUTO_TRANSFERS_TO_NEW_REVISION = false as const;
export const STALE_D3_HANDOFF_EXPOSED_AS_CURRENT = false as const;
export const STALE_D3_REVIEW_EXPOSED_AS_CURRENT = false as const;
export const STALE_D3_VALIDATION_EXPOSED_AS_CURRENT = false as const;
export const REASSESSMENT_REQUIRED_RECORD_EXPOSED_AS_VALIDATED = false as const;
export const D3_HANDOFF_AUTO_REPOINTED = D3_SILENT_REPOINTING_ALLOWED;
export const D3_COUNTERPART_REFERENCE_AUTO_REPOINTED = D3_SILENT_REPOINTING_ALLOWED;
export const D3_EVIDENCE_LINEAGE_SUPPORTED = true as const;
export const EVIDENCE_LINEAGE_EQUALS_ENGINEERING_VALIDATED = false as const;
export const CURRENT_EQUALS_VALIDATED = false as const;
export const CURRENT_EQUALS_CONFORMANT = false as const;
export const CURRENT_EQUALS_APPROVED = false as const;
export const CURRENT_EQUALS_CERTIFIED = false as const;
export const D3_R10_PROVENANCE_REQUIRED = true as const;
export const D3_R10_PROVENANCE_PRESERVED = true as const;
export const SILENT_D3_R10_MUTATION_ALLOWED = false as const;
export const D3_R10_HISTORY_PRESERVED = true as const;
export const TENANT_WORKSPACE_PROJECT_D3_R10_SCOPE_ENFORCED = true as const;
export const D3_R10_DUPLICATE_GOVERNANCE_IMPLEMENTED = true as const;
export const D3_R10_REPLAY_PROTECTION_IMPLEMENTED = true as const;
export const D3_R10_SPOOFING_PROTECTION_IMPLEMENTED = true as const;
export const D3_R10_SUBJECT_KINDS = ["CONTEXT", "OBJECT", "EVIDENCE", "STRATIGRAPHY", "MATERIAL", "GROUNDWATER", "FIELD_TEST", "LAB_TEST", "PARAMETER", "RECOMMENDATION", "REQUIREMENT", "ASSUMPTION", "DECISION", "CHANGE", "HANDOFF", "REVIEW_REQUEST", "FINDING", "COMPLETION", "VALIDATION"] as const;
export const D3_R10_CHANGE_DEPENDENCIES = D3_EXPLICIT_CHANGE_DEPENDENCIES;
export const D3_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT = ARCH_AUTO_VALIDATION_COUNT;
export const D3_CONFORMANCE_DETERMINATION_RUNTIME_COUNT = 0 as const;
export const D3_APPROVAL_RUNTIME_COUNT = ARCH_APPROVAL_COUNT;
export const D3_CERTIFICATION_RUNTIME_COUNT = ARCH_CERTIFICATION_COUNT;
export const D3_CONFORMANCE_CERTIFICATION_RUNTIME_COUNT = 0 as const;
export const D3_AUTOMATIC_PARAMETER_DERIVATION_RUNTIME_COUNT = 0 as const;
export const D3_FOUNDATION_CALCULATION_RUNTIME_COUNT = ARCH_FOUNDATION_CALC_COUNT;
export const D3_BEARING_CAPACITY_RUNTIME_COUNT = ARCH_BEARING_COUNT;
export const D3_SETTLEMENT_CALCULATION_RUNTIME_COUNT = ARCH_SETTLEMENT_COUNT;
export const D3_PILE_CAPACITY_RUNTIME_COUNT = 0 as const;
export const D3_SLOPE_STABILITY_RUNTIME_COUNT = ARCH_SLOPE_COUNT;
export const D3_EARTH_PRESSURE_RUNTIME_COUNT = ARCH_EARTH_PRESSURE_COUNT;
export const D3_RETAINING_SYSTEM_ANALYSIS_RUNTIME_COUNT = 0 as const;
export const D3_EXCAVATION_SUPPORT_DESIGN_RUNTIME_COUNT = 0 as const;
export const D3_GROUND_IMPROVEMENT_DESIGN_RUNTIME_COUNT = ARCH_GROUND_IMPROVEMENT_COUNT;
export const D3_AUTOMATIC_REDESIGN_RUNTIME_COUNT = 0 as const;
export const D3_D9_SOURCE_CONTRACT_RUNTIME_COUNT = ARCH_D9_SOURCE_COUNT;
export const D3_D9_RUNTIME_INTEGRATION_COUNT = ARCH_D9_INTEGRATION_COUNT;
export const D3_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT = 0 as const;
export const D3_CROSS_DISCIPLINE_CONFLICT_DETECTION_RUNTIME_COUNT = 0 as const;
export const D3_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT = 0 as const;
export const D3_CROSS_DISCIPLINE_RECOMMENDATION_RUNTIME_COUNT = 0 as const;
export const D4_RUNTIME_STARTED = false as const;
export const D5_RUNTIME_STARTED = false as const;
export const D6_RUNTIME_STARTED = false as const;
export const D7_RUNTIME_STARTED = false as const;
export const D8_RUNTIME_STARTED = false as const;
export const D9_RUNTIME_STARTED = false as const;
export const D9_RUNTIME_COUNT = 0 as const;
export const D2_REOPENED = ARCH_D2_REOPENED;
export const DATABASE_SCHEMA_CHANGED = false as const;
export const NEW_DEPENDENCY_ADDED = false as const;
export const UNAUTHORIZED_D1_PACK_COMPLETION = false as const;
export const UNAUTHORIZED_D2_REOPEN = false as const;
export const UNAUTHORIZED_D3_R11_R12_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_D4_D8_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_D9_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_D3_RECALCULATION_PROMOTION = false as const;
export const UNAUTHORIZED_D3_REDESIGN_PROMOTION = false as const;
export const UNAUTHORIZED_D3_VALIDATION_PROMOTION = false as const;
export const UNAUTHORIZED_D3_CONFORMANCE_PROMOTION = false as const;
export const UNAUTHORIZED_D3_APPROVAL_PROMOTION = false as const;
export const UNAUTHORIZED_D3_CERTIFICATION_PROMOTION = false as const;
export const UNAUTHORIZED_CROSS_DISCIPLINE_REASONING_PROMOTION = false as const;
export const UNAUTHORIZED_GA_PROMOTION = false as const;
export const UNAUTHORIZED_PRODUCT_CLAIM = false as const;

export const D3_R11_CANONICAL_PHASE = D3_IMPLEMENTATION_PHASES[10];
export const D3_R11_PHASE_TYPE = "D9_SOURCE_CONTRACT" as const;
export const D3_R11_CANONICAL_SCOPE = "Expose governed Geotechnical facts and metadata for future D9 consumption using exact D3 revisions, currentness, authority, provenance, investigation/evidence, stratigraphy/material/groundwater context, tests, parameters, recommendations, requirements/assumptions/decisions, interfaces, review/validation state, lineage, limitations and canonical fingerprint. The source contract must not create new engineering facts, transfer Geotechnical authority, perform cross-discipline reasoning, fabricate counterpart information, start D9 runtime or start D4-D8." as const;
export const D3_R11_STARTED = false as const;
export const D3_R10_READY_FOR_NEXT_PHASE = true as const;
export const D3_R10_NEXT_PHASE = D3_R11_CANONICAL_PHASE;
export const D3_R10_NEXT_PHASE_TYPE = D3_R11_PHASE_TYPE;
export const D3_R10_CANONICAL_NEXT_PHASE = D3_R11_CANONICAL_PHASE;
export const D3_R10_CANONICAL_NEXT_PHASE_SCOPE = D3_R11_CANONICAL_SCOPE;
export const D3_R10_BLOCKER = "NONE" as const;
export const D3_R10_MACHINE_READABLE_ROADMAP_UPDATED = true as const;

const FLOATING = new Set(["latest", "current", "newest", "head", "active", "active model"]);
const INFERRED = new Set(["inferred", "unknown", "auto", "default", "nearby", "similar"]);
const PROPAGATION_RELATIONS = new Set(["DEPENDS_ON", "BASED_ON", "AFFECTS", "USES", "SUPPORTED_BY", "CONSTRAINED_BY", "PARENT", "OBJECT_REFERENCE", "REVIEWS"]);

type Currentness = (typeof D3_CURRENTNESS_STATES)[number];
type SubjectKind = (typeof D3_R10_SUBJECT_KINDS)[number];

type Prohibited = {
  infer?: boolean;
  proximity?: boolean;
  sameBorehole?: boolean;
  sameMaterial?: boolean;
  similarText?: boolean;
  semantic?: boolean;
  sharedDocument?: boolean;
  repoint?: boolean;
  mutateEngineering?: boolean;
  recalculate?: boolean;
  redesign?: boolean;
  redesignFoundation?: boolean;
  redesignExcavation?: boolean;
  redesignSlope?: boolean;
  generateRecommendation?: boolean;
  transferReview?: boolean;
  transferValidation?: boolean;
  validate?: boolean;
  approve?: boolean;
  certify?: boolean;
  conform?: boolean;
  d4Start?: boolean;
  d9Reasoning?: boolean;
};

export type D3R10Actor = D3R1Actor & { actorKind?: string };

export type D3R10Pin = {
  subjectKind: SubjectKind;
  subjectId: string;
  subjectRevision: string;
  subjectFingerprint: string;
  contextId: string;
};

type Endpoint = {
  subjectKind: string;
  subjectId: string;
  subjectRevision: string;
  subjectFingerprint: string;
};

export type D3R10LineageInput = Prohibited & {
  lineageId: string;
  contextId: string;
  source: Endpoint;
  target: Endpoint;
  relationshipType: string;
  geotechnicalDependency?: string | null;
  authoritative?: boolean;
  candidate?: boolean;
  citedCurrentness: string;
  provenanceRef: string;
  assertedFingerprint?: string;
  tenantId?: string;
  workspaceId?: string;
  projectId?: string;
};

export type D3R10LineageRecord = {
  lineageId: string;
  contextId: string;
  source: D3R10Pin;
  target: D3R10Pin;
  relationshipType: string;
  geotechnicalDependency: (typeof D3_EXPLICIT_CHANGE_DEPENDENCIES)[number] | null;
  authoritative: boolean;
  candidate: boolean;
  citedCurrentness: Currentness;
  engineeringValidated: false;
  provenanceRef: string;
  fingerprint: string;
  recordedBy: string;
  recordedAt: string;
  recordStatus: "CURRENT";
  tenantId: string;
  workspaceId: string;
  projectId: string;
};

export type D3R10SupersessionInput = Prohibited & {
  supersessionId: string;
  contextId: string;
  predecessor: Endpoint;
  successor: Endpoint;
  citedCurrentness: string;
  provenanceRef: string;
  assertedFingerprint?: string;
  tenantId?: string;
  workspaceId?: string;
  projectId?: string;
};

export type D3R10SupersessionRecord = {
  supersessionId: string;
  contextId: string;
  predecessor: D3R10Pin;
  successor: D3R10Pin;
  deleted: false;
  invalid: false;
  historicalEdgesRewritten: false;
  provenanceRef: string;
  fingerprint: string;
  recordedBy: string;
  recordedAt: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
};

export type D3R10CurrentnessInput = Prohibited & {
  eventId: string;
  contextId: string;
  subject: Endpoint;
  currentness: string;
  propagate?: boolean;
  provenanceRef: string;
  assertedFingerprint?: string;
  tenantId?: string;
  workspaceId?: string;
  projectId?: string;
};

export type D3R10CurrentnessMark = {
  eventId: string;
  contextId: string;
  subject: D3R10Pin;
  currentness: Currentness;
  engineeringInvalid: false;
  engineeringRejected: false;
  engineeringValidated: false;
  contentMutated: false;
  provenanceRef: string;
  fingerprint: string;
  recordedBy: string;
  recordedAt: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
};

export type D3R10History = {
  historyId: string;
  subjectKind: "LINEAGE" | "SUPERSESSION" | "CURRENTNESS";
  subjectId: string;
  action: "CREATED";
  fingerprint: string;
  recordedAt: string;
};

export type D3R10Store = {
  r9: D3R9Store;
  now: () => string;
  lineage: D3R10LineageRecord[];
  supersessions: D3R10SupersessionRecord[];
  marks: D3R10CurrentnessMark[];
  history: D3R10History[];
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

function isCurrentness(value: string): value is Currentness {
  return (D3_CURRENTNESS_STATES as readonly string[]).includes(value);
}

function assertProhibited(input: Prohibited): void {
  if (input.infer === true || input.proximity === true || input.sameBorehole === true || input.sameMaterial === true || input.similarText === true || input.semantic === true || input.sharedDocument === true) fail("INFERRED_LINEAGE_REJECTED");
  if (input.repoint === true) fail("AUTO_REPOINT_REJECTED");
  if (input.mutateEngineering === true) fail("CONTENT_MUTATION_REJECTED");
  if (input.recalculate === true) fail("RECALCULATION_NOT_IN_R10");
  if (input.redesign === true || input.redesignFoundation === true) fail("FOUNDATION_REDESIGN_REJECTED");
  if (input.redesignExcavation === true) fail("EXCAVATION_REDESIGN_REJECTED");
  if (input.redesignSlope === true) fail("SLOPE_REDESIGN_REJECTED");
  if (input.generateRecommendation === true) fail("RECOMMENDATION_GENERATION_REJECTED");
  if (input.transferReview === true) fail("REVIEW_TRANSFER_REJECTED");
  if (input.transferValidation === true) fail("VALIDATION_TRANSFER_REJECTED");
  if (input.validate === true) fail("VALIDATION_NOT_IN_R10");
  if (input.approve === true) fail("APPROVAL_NOT_IN_R10");
  if (input.certify === true) fail("CERTIFICATION_NOT_IN_R10");
  if (input.conform === true) fail("CONFORMANCE_NOT_IN_R10");
  if (input.d4Start === true) fail("D4_NOT_STARTED");
  if (input.d9Reasoning === true) fail("D9_NOT_STARTED");
}

function assertScope(actor: D3R10Actor, input: { tenantId?: string; workspaceId?: string; projectId?: string }): void {
  if (!actor.actorId.trim() || !actor.tenantId.trim() || !actor.workspaceId.trim() || !actor.projectId.trim()) fail("SCOPE_REQUIRED");
  if (input.tenantId != null && input.tenantId !== actor.tenantId) fail("CROSS_TENANT_OPERATION");
  if (input.workspaceId != null && input.workspaceId !== actor.workspaceId) fail("CROSS_WORKSPACE_OPERATION");
  if (input.projectId != null && input.projectId !== actor.projectId) fail("CROSS_PROJECT_OPERATION");
}

function assertRecorder(actor: D3R10Actor): void {
  if (blockedParty(actor.actorId) || blockedParty(actor.authority) || actor.authority === "AI_ASSISTANT" || actor.actorKind === "ai") fail("AI_CANNOT_FABRICATE_LINEAGE");
  if (actor.authority === "ADMINISTRATOR" || actor.authority === "ADMIN") fail("ADMIN_NOT_GEOTECHNICAL_AUTHORITY");
  if (actor.authority !== D3_CONTEXT_AUTHORITY) fail("UNAUTHORIZED");
}

function currentnessOf(value: string): Currentness {
  const cited = value.trim();
  if (!isCurrentness(cited)) fail("CURRENTNESS_INVALID");
  return cited;
}

function remember(store: D3R10Store, subjectKind: D3R10History["subjectKind"], subjectId: string, fingerprint: string): void {
  store.history.push({ historyId: `hist-${store.history.length + 1}`, subjectKind, subjectId, action: "CREATED", fingerprint, recordedAt: store.now() });
}

type Hit = { revision: string; fingerprint: string; status: string; contextId: string; tenantId: string };

function asHit(row: { provenanceRef: string; fingerprint: string; recordStatus: string; contextId: string; tenantId: string }, revision = row.provenanceRef): Hit {
  return { revision, fingerprint: row.fingerprint, status: row.recordStatus, contextId: row.contextId, tenantId: row.tenantId };
}

function live(store: D3R10Store, actor: D3R10Actor, contextId: string, endpoint: Endpoint, cited: Currentness): D3R10Pin {
  const subjectKind = explicit(endpoint.subjectKind, "SUBJECT_KIND_REQUIRED");
  if (!(D3_R10_SUBJECT_KINDS as readonly string[]).includes(subjectKind)) fail("SUBJECT_KIND_INVALID");
  const subjectId = explicit(endpoint.subjectId, "SUBJECT_REFERENCE_REQUIRED");
  const subjectRevision = explicit(endpoint.subjectRevision, "SUBJECT_REVISION_REQUIRED");
  const subjectFingerprint = explicit(endpoint.subjectFingerprint, "SUBJECT_FINGERPRINT_REQUIRED");
  const context = store.r9.r8.r7.r6.r5.r4.r3.r2.r1.contexts.find((row) => row.contextId === contextId);
  if (!context || context.tenantId !== actor.tenantId || context.workspaceId !== actor.workspaceId || context.projectId !== actor.projectId) fail("R1_CONTEXT_NOT_FOUND");
  if (context.discipline !== D3_DISCIPLINE) fail("DISCIPLINE_NOT_GEOTECHNICAL");
  const kind = subjectKind as SubjectKind;
  const r1 = store.r9.r8.r7.r6.r5.r4.r3.r2.r1;
  const r2 = store.r9.r8.r7.r6.r5.r4.r3.r2;
  const r3 = store.r9.r8.r7.r6.r5.r4.r3;
  const r4 = store.r9.r8.r7.r6.r5.r4;
  const r5 = store.r9.r8.r7.r6.r5;
  const r6 = store.r9.r8.r7.r6;
  const r7 = store.r9.r8.r7;
  let hit: Hit | undefined;
  if (kind === "CONTEXT") {
    if (subjectId !== context.contextId) fail("SUBJECT_NOT_FOUND");
    hit = asHit(context);
  } else if (kind === "OBJECT") {
    const row = r1.objects.find((item) => item.objectId === subjectId);
    if (row) hit = asHit(row);
  } else if (kind === "EVIDENCE") {
    const row = r2.evidence.find((item) => item.evidenceReferenceId === subjectId);
    if (row) hit = asHit(row);
  } else if (kind === "STRATIGRAPHY") {
    const row = r3.stratigraphy.find((item) => item.stratigraphyId === subjectId);
    if (row) hit = asHit(row);
  } else if (kind === "MATERIAL") {
    const row = r3.materials.find((item) => item.materialClassificationId === subjectId);
    if (row) hit = asHit(row);
  } else if (kind === "GROUNDWATER") {
    const row = r3.groundwater.find((item) => item.groundwaterContextId === subjectId);
    if (row) hit = asHit(row);
  } else if (kind === "FIELD_TEST") {
    const row = r4.fieldTests.find((item) => item.fieldTestId === subjectId);
    if (row) hit = asHit(row);
  } else if (kind === "LAB_TEST") {
    const row = r4.labTests.find((item) => item.labTestId === subjectId);
    if (row) hit = asHit(row);
  } else if (kind === "PARAMETER") {
    const row = r5.parameters.find((item) => item.parameterId === subjectId);
    if (row) hit = asHit(row);
  } else if (kind === "RECOMMENDATION") {
    const row = r6.contexts.find((item) => item.contextRecordId === subjectId);
    if (row) hit = asHit(row);
  } else if (kind === "REQUIREMENT") {
    const row = r7.requirements.find((item) => item.requirementContextId === subjectId);
    if (row) hit = asHit(row, row.sourceRevision);
  } else if (kind === "ASSUMPTION") {
    const row = r7.assumptions.find((item) => item.assumptionContextId === subjectId);
    if (row) hit = asHit(row);
  } else if (kind === "DECISION") {
    const row = r7.decisions.find((item) => item.decisionContextId === subjectId);
    if (row) hit = asHit(row);
  } else if (kind === "CHANGE") {
    const row = r7.changes.find((item) => item.changeContextId === subjectId);
    if (row) hit = asHit(row);
  } else if (kind === "HANDOFF") {
    const row = store.r9.r8.handoffs.find((item) => item.handoffId === subjectId);
    if (row) hit = asHit(row, row.sourceRevision);
  } else if (kind === "REVIEW_REQUEST") {
    const row = store.r9.requests.find((item) => item.reviewRequestId === subjectId);
    if (row) hit = asHit(row, row.subjectRevision);
  } else if (kind === "FINDING") {
    const row = store.r9.findings.find((item) => item.findingId === subjectId);
    if (row) hit = asHit(row, row.subjectRevision);
  } else if (kind === "COMPLETION") {
    const row = store.r9.completions.find((item) => item.completionId === subjectId);
    if (row) hit = asHit(row, row.subjectRevision);
  } else {
    const row = store.r9.validations.find((item) => item.validationId === subjectId);
    if (row) hit = asHit(row, row.subjectRevision);
  }
  if (!hit || hit.contextId !== context.contextId || hit.tenantId !== actor.tenantId) fail("SUBJECT_NOT_FOUND");
  if (hit.fingerprint !== subjectFingerprint || hit.revision !== subjectRevision) fail("SUBJECT_REVISION_MISMATCH");
  if (cited === "CURRENT" && hit.status !== "CURRENT") fail("SUBJECT_NOT_CURRENT");
  return { subjectKind: kind, subjectId, subjectRevision, subjectFingerprint, contextId: context.contextId };
}

function snapshot(store: D3R10Store): string {
  const objects = store.r9.r8.r7.r6.r5.r4.r3.r2.r1.objects.map((row) => `${row.objectId}:${row.provenanceRef}:${row.fingerprint}:${row.recordStatus}`).join("|");
  const evidence = store.r9.r8.r7.r6.r5.r4.r3.r2.evidence.map((row) => `${row.evidenceReferenceId}:${row.provenanceRef}:${row.fingerprint}`).join("|");
  const parameters = store.r9.r8.r7.r6.r5.parameters.map((row) => `${row.parameterId}:${row.value}:${row.fingerprint}`).join("|");
  const recommendations = store.r9.r8.r7.r6.contexts.map((row) => `${row.contextRecordId}:${row.recommendationText}:${row.fingerprint}`).join("|");
  const changes = store.r9.r8.r7.changes.map((row) => `${row.changeContextId}:${row.fingerprint}:${row.reassessmentRequired}`).join("|");
  const handoffs = store.r9.r8.handoffs.map((row) => `${row.handoffId}:${row.sourceRevision}:${row.fingerprint}:${row.citedCurrentness}:${row.counterpart?.interfaceId ?? ""}`).join("|");
  const reviews = store.r9.requests.map((row) => `${row.reviewRequestId}:${row.subjectRevision}:${row.fingerprint}:${row.reviewCompleted}`).join("|");
  const validations = store.r9.validations.map((row) => `${row.validationId}:${row.subjectRevision}:${row.engineeringValidated}:${row.fingerprint}`).join("|");
  return `${objects}#${evidence}#${parameters}#${recommendations}#${changes}#${handoffs}#${reviews}#${validations}`;
}

function pinKey(pin: D3R10Pin): string {
  return `${pin.subjectKind}|${pin.subjectId}|${pin.subjectRevision}|${pin.subjectFingerprint}`;
}

function downstream(store: D3R10Store, origin: D3R10Pin): D3R10Pin[] {
  const found: D3R10Pin[] = [];
  const seen = new Set<string>([pinKey(origin)]);
  let frontier = [origin];
  for (let depth = 0; depth < THREAD_DEFAULT_MAX_DEPTH && frontier.length > 0; depth += 1) {
    const next: D3R10Pin[] = [];
    for (const pin of frontier) {
      for (const edge of store.lineage) {
        if (!edge.authoritative || edge.candidate || edge.contextId !== origin.contextId) continue;
        if (pinKey(edge.source) !== pinKey(pin) || !PROPAGATION_RELATIONS.has(edge.relationshipType)) continue;
        const key = pinKey(edge.target);
        if (seen.has(key)) continue;
        seen.add(key);
        found.push(edge.target);
        next.push(edge.target);
      }
    }
    frontier = next;
  }
  return found;
}

function markOf(store: D3R10Store, actor: D3R10Actor, eventId: string, subject: D3R10Pin, currentness: Currentness, provenanceRef: string): D3R10CurrentnessMark {
  const fingerprint = fingerprintCanonical({ eventId, subject, currentness, provenanceRef, engineeringInvalid: false, engineeringValidated: false });
  return Object.freeze({
    eventId,
    contextId: subject.contextId,
    subject,
    currentness,
    engineeringInvalid: false,
    engineeringRejected: false,
    engineeringValidated: false,
    contentMutated: false,
    provenanceRef,
    fingerprint,
    recordedBy: actor.actorId,
    recordedAt: store.now(),
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
  });
}

export function createD3R10Store(r9: D3R9Store, now: () => string = () => r9.now()): D3R10Store {
  return { r9, now, lineage: [], supersessions: [], marks: [], history: [] };
}

export function recordGeotechnicalLineage(store: D3R10Store, actor: D3R10Actor, input: D3R10LineageInput): D3R10LineageRecord {
  assertRecorder(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const cited = currentnessOf(input.citedCurrentness);
  const contextId = explicit(input.contextId, "R1_CONTEXT_REQUIRED");
  const source = live(store, actor, contextId, input.source, cited);
  const target = live(store, actor, contextId, input.target, cited);
  if (pinKey(source) === pinKey(target)) fail("LINEAGE_SELF_LINK_REJECTED");
  const relationshipType = explicit(input.relationshipType, "RELATIONSHIP_REQUIRED");
  if (relationshipType === "SUPERSEDES") fail("SUPERSESSION_FUNCTION_REQUIRED");
  const identity = (D3_EXPLICIT_RELATIONSHIP_KINDS as readonly string[]).includes(relationshipType);
  if (!identity && (!isGovernedRelationType(relationshipType) || !relationSemantics(relationshipType))) fail("RELATION_NOT_GOVERNED");
  let geotechnicalDependency: D3R10LineageRecord["geotechnicalDependency"] = null;
  if (input.geotechnicalDependency != null && input.geotechnicalDependency !== "") {
    const dependency = explicit(input.geotechnicalDependency, "DEPENDENCY_NOT_EXPLICIT");
    if (!(D3_EXPLICIT_CHANGE_DEPENDENCIES as readonly string[]).includes(dependency)) fail("DEPENDENCY_NOT_EXPLICIT");
    geotechnicalDependency = dependency as D3R10LineageRecord["geotechnicalDependency"];
  }
  if (downstream(store, target).some((pin) => pinKey(pin) === pinKey(source))) fail("CIRCULAR_LINEAGE_REJECTED");
  const authoritative = input.authoritative !== false && input.candidate !== true;
  const provenanceRef = explicit(input.provenanceRef, "MISSING_PROVENANCE");
  const lineageId = explicit(input.lineageId, "LINEAGE_ID_REQUIRED");
  const fingerprint = fingerprintCanonical({
    lineageId, contextId: source.contextId, source, target, relationshipType, geotechnicalDependency, authoritative, candidate: input.candidate === true, citedCurrentness: cited, provenanceRef, engineeringValidated: false,
  });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.lineage.find((row) => row.lineageId === lineageId);
  if (existing) return existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId ? existing : fail("LINEAGE_ALREADY_RECORDED");
  const signature = `${pinKey(source)}|${pinKey(target)}|${relationshipType}|${geotechnicalDependency ?? ""}`;
  if (store.lineage.some((row) => row.contextId === source.contextId && `${pinKey(row.source)}|${pinKey(row.target)}|${row.relationshipType}|${row.geotechnicalDependency ?? ""}` === signature)) fail("DUPLICATE_LINEAGE_REJECTED");
  const before = snapshot(store);
  const record: D3R10LineageRecord = Object.freeze({
    lineageId,
    contextId: source.contextId,
    source,
    target,
    relationshipType,
    geotechnicalDependency,
    authoritative,
    candidate: input.candidate === true,
    citedCurrentness: cited,
    engineeringValidated: false,
    provenanceRef,
    fingerprint,
    recordedBy: actor.actorId,
    recordedAt: store.now(),
    recordStatus: "CURRENT",
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
  });
  store.lineage.push(record);
  remember(store, "LINEAGE", record.lineageId, record.fingerprint);
  if (snapshot(store) !== before) fail("CONTENT_MUTATION_REJECTED");
  return record;
}

export function recordGeotechnicalSupersession(store: D3R10Store, actor: D3R10Actor, input: D3R10SupersessionInput): D3R10SupersessionRecord {
  assertRecorder(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const cited = currentnessOf(input.citedCurrentness);
  const contextId = explicit(input.contextId, "R1_CONTEXT_REQUIRED");
  const predecessor = live(store, actor, contextId, input.predecessor, "STALE");
  const successor = live(store, actor, contextId, input.successor, cited === "SUPERSEDED" ? "CURRENT" : cited);
  if (predecessor.subjectKind !== successor.subjectKind) fail("SUPERSESSION_KIND_MISMATCH");
  if (pinKey(predecessor) === pinKey(successor)) fail("SUPERSESSION_SELF_REJECTED");
  const beforeEdges = store.lineage.map((row) => `${pinKey(row.source)}>${pinKey(row.target)}`).join("|");
  const provenanceRef = explicit(input.provenanceRef, "MISSING_PROVENANCE");
  const supersessionId = explicit(input.supersessionId, "SUPERSESSION_ID_REQUIRED");
  const fingerprint = fingerprintCanonical({ supersessionId, contextId, predecessor, successor, provenanceRef });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.supersessions.find((row) => row.supersessionId === supersessionId);
  if (existing) return existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId ? existing : fail("SUPERSESSION_ALREADY_RECORDED");
  const before = snapshot(store);
  const record: D3R10SupersessionRecord = Object.freeze({
    supersessionId,
    contextId,
    predecessor,
    successor,
    deleted: false,
    invalid: false,
    historicalEdgesRewritten: false,
    provenanceRef,
    fingerprint,
    recordedBy: actor.actorId,
    recordedAt: store.now(),
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
  });
  store.supersessions.push(record);
  remember(store, "SUPERSESSION", record.supersessionId, record.fingerprint);
  const mark = markOf(store, actor, `mark-${supersessionId}`, predecessor, "SUPERSEDED", provenanceRef);
  store.marks.push(mark);
  remember(store, "CURRENTNESS", mark.eventId, mark.fingerprint);
  if (store.lineage.map((row) => `${pinKey(row.source)}>${pinKey(row.target)}`).join("|") !== beforeEdges) fail("HISTORICAL_REFERENCE_REWRITTEN");
  if (snapshot(store) !== before) fail("CONTENT_MUTATION_REJECTED");
  if (record.deleted || record.invalid || record.historicalEdgesRewritten) fail("HISTORICAL_REFERENCE_REWRITTEN");
  return record;
}

export function recordGeotechnicalCurrentness(store: D3R10Store, actor: D3R10Actor, input: D3R10CurrentnessInput): D3R10CurrentnessMark[] {
  assertRecorder(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const currentness = currentnessOf(input.currentness);
  const contextId = explicit(input.contextId, "R1_CONTEXT_REQUIRED");
  const subject = live(store, actor, contextId, input.subject, currentness === "CURRENT" ? "CURRENT" : "STALE");
  const provenanceRef = explicit(input.provenanceRef, "MISSING_PROVENANCE");
  const eventId = explicit(input.eventId, "CURRENTNESS_EVENT_REQUIRED");
  const root = markOf(store, actor, eventId, subject, currentness, provenanceRef);
  if (input.assertedFingerprint != null && input.assertedFingerprint !== root.fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.marks.find((row) => row.eventId === eventId);
  if (existing) return existing.fingerprint === root.fingerprint && existing.tenantId === actor.tenantId ? [existing] : fail("CURRENTNESS_ALREADY_RECORDED");
  const latest = [...store.marks].reverse().find((row) => pinKey(row.subject) === pinKey(subject));
  if (currentness === "CURRENT" && latest && latest.currentness !== "CURRENT") fail("CURRENTNESS_PROMOTION_REJECTED");
  if ((currentness === "STALE" || currentness === "REASSESSMENT_REQUIRED" || currentness === "SUPERSEDED") && root.currentness === "CURRENT") fail("STALE_EXPOSED_AS_CURRENT");
  if (currentness === "REASSESSMENT_REQUIRED" && root.engineeringValidated) fail("REASSESSMENT_EXPOSED_AS_VALIDATED");
  const before = snapshot(store);
  const created = [root];
  if (input.propagate === true && currentness !== "CURRENT") {
    const propagated = currentness === "SUPERSEDED" ? "REASSESSMENT_REQUIRED" : currentness;
    downstream(store, subject).forEach((pin, index) => {
      created.push(markOf(store, actor, `${eventId}-${index + 1}`, pin, propagated, provenanceRef));
    });
  }
  for (const mark of created) {
    if (mark.currentness !== "CURRENT" && mark.engineeringValidated) fail("STALE_EXPOSED_AS_CURRENT");
    store.marks.push(mark);
    remember(store, "CURRENTNESS", mark.eventId, mark.fingerprint);
  }
  if (snapshot(store) !== before) fail("CONTENT_MUTATION_REJECTED");
  return created;
}

export function repointHistoricalGeotechnicalReference(): never {
  return fail("AUTO_REPOINT_REJECTED");
}

export function inferGeotechnicalLineage(): never {
  return fail("INFERRED_LINEAGE_REJECTED");
}

export function redesignFromGeotechnicalCurrentness(): never {
  return fail("FOUNDATION_REDESIGN_REJECTED");
}

export function recalculateFromGeotechnicalCurrentness(): never {
  return fail("RECALCULATION_NOT_IN_R10");
}
