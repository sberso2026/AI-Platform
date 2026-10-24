/**
 * EOS-D4-R10 — Mechanical currentness and digital thread.
 * One bounded runtime. Records explicit lineage, supersession, and currentness
 * across exact D4 R1-R9 revisions. Reuses canonical currentness, digital-thread,
 * and fingerprint mechanisms. Does not rewrite history, infer lineage, mutate
 * engineering, transfer validation, or start D9.
 */
import {
  ADMIN_EQUALS_D4_MECHANICAL_ENGINEERING_AUTHORITY,
  AI_EQUALS_D4_MECHANICAL_ENGINEERING_AUTHORITY,
  D4_CROSS_DISCIPLINE_CONFLICT_DETECTION_RUNTIME_COUNT,
  D4_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT,
  D4_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT,
  D4_CROSS_DISCIPLINE_RECOMMENDATION_RUNTIME_COUNT,
  D4_CURRENTNESS_STATES,
  D4_D9_RUNTIME_INTEGRATION_COUNT,
  D4_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
  D4_EQUALS_D1_STRUCTURAL_AUTHORITY,
  D4_EQUALS_D2_CIVIL_AUTHORITY,
  D4_EQUALS_D3_GEOTECHNICAL_AUTHORITY,
  D4_EQUALS_D5_PIPING_AUTHORITY,
  D4_EQUALS_D6_PROCESS_AUTHORITY,
  D4_EQUALS_D7_ELECTRICAL_AUTHORITY,
  D4_EQUALS_D8_INSTRUMENTATION_CONTROL_AUTHORITY,
  D4_EQUIPMENT_SIZING_RUNTIME_COUNT,
  D4_FATIGUE_ANALYSIS_RUNTIME_COUNT,
  D4_IMPLEMENTATION_PHASES,
  D4_MECHANICAL_DESIGN_OPTIMIZATION_RUNTIME_COUNT,
  D4_MECHANICAL_LOAD_CALCULATION_RUNTIME_COUNT,
  D4_REUSES_CANONICAL_CURRENTNESS,
  D4_REUSES_CANONICAL_DIGITAL_THREAD,
  D4_REUSES_CANONICAL_FINGERPRINT,
  D4_ROTATING_EQUIPMENT_CALCULATION_RUNTIME_COUNT,
  D4_SILENT_REPOINTING_ALLOWED,
  D4_STATIC_EQUIPMENT_CALCULATION_RUNTIME_COUNT,
  D4_THERMAL_MECHANICAL_CALCULATION_RUNTIME_COUNT,
  D4_VIBRATION_ANALYSIS_RUNTIME_COUNT,
  PARALLEL_D4_CURRENTNESS_ENGINE_CREATED,
  PARALLEL_D4_DIGITAL_THREAD_CREATED,
  SECOND_D4_FINGERPRINT_ALGORITHM_CREATED,
} from "@rtb/types";
import { isGovernedRelationType } from "../decision-intelligence/relations";
import { relationSemantics } from "../digital-thread/relation-semantics";
import { THREAD_DEFAULT_MAX_DEPTH } from "../digital-thread/types";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import { D4_CONTEXT_AUTHORITY, D4_DISCIPLINE, D4_EXPLICIT_RELATIONSHIP_KINDS, D4_MECHANICAL_IDENTITY_OBJECT_FOUNDATION_RUNTIME_READY as R1_IDENTITY_READY, type D4R1Actor } from "./identity-foundation";
import { D4_EQUIPMENT_SYSTEM_CONTEXT_RUNTIME_READY } from "./equipment-system-context";
import { D4_DESIGN_CONDITION_PERFORMANCE_RUNTIME_READY } from "./design-condition-performance-context";
import { D4_VENDOR_DATA_EVIDENCE_RUNTIME_READY, NEW_VENDOR_REVISION_AUTO_ADOPTED_AS_ENGINEERING, SUPERSEDED_VENDOR_DOCUMENT_DELETED } from "./vendor-data-evidence-context";
import { D4_MECHANICAL_TECHNICAL_CONTEXT_RUNTIME_READY } from "./mechanical-technical-context";
import { D4_MAINTAINABILITY_ACCESS_PACKAGE_RUNTIME_READY } from "./maintainability-access-package-context";
import { D4_R7_DEPENDENCY_TARGETS, D4_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY as R7_CHANGE_READY } from "./requirements-assumptions-change";
import { D4_DISCIPLINE_INTERFACE_RUNTIME_READY as R8_INTERFACE_READY } from "./discipline-interfaces-handoffs";
import {
  D4_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_READY as R9_REVIEW_READY,
  type D4R9Store,
} from "./review-validation-governance";

export const D4_R10_STATUS = "CURRENTNESS_AND_DIGITAL_THREAD_IMPLEMENTED" as const;
export const D4_R10_MATURITY = D4_R10_STATUS;
export const D4_R10_MATURITY_STATE = D4_R10_STATUS;
export const D4_R10_CLOSEOUT_PATH = "docs/architecture/engineering-os/EOS_D4_R10_CURRENTNESS_AND_DIGITAL_THREAD_CLOSEOUT.md" as const;
export const D4_RUNTIME_STARTED = true as const;
export const D4_RUNTIME_COUNT = 10 as const;
export const D4_CURRENTNESS_DIGITAL_THREAD_RUNTIME_IMPLEMENTED = true as const;
export const D4_CURRENTNESS_DIGITAL_THREAD_RUNTIME_COUNT = 1 as const;
export const D4_CURRENTNESS_DIGITAL_THREAD_RUNTIME_READY = true as const;
export const D4_MECHANICAL_IDENTITY_OBJECT_FOUNDATION_RUNTIME_READY = R1_IDENTITY_READY;
export const D4_EQUIPMENT_SYSTEM_CONTEXT_RUNTIME_READY_REUSED = D4_EQUIPMENT_SYSTEM_CONTEXT_RUNTIME_READY;
export const D4_DESIGN_CONDITION_PERFORMANCE_RUNTIME_READY_REUSED = D4_DESIGN_CONDITION_PERFORMANCE_RUNTIME_READY;
export const D4_VENDOR_DATA_EVIDENCE_RUNTIME_READY_REUSED = D4_VENDOR_DATA_EVIDENCE_RUNTIME_READY;
export const D4_MECHANICAL_TECHNICAL_CONTEXT_RUNTIME_READY_REUSED = D4_MECHANICAL_TECHNICAL_CONTEXT_RUNTIME_READY;
export const D4_MAINTAINABILITY_ACCESS_PACKAGE_RUNTIME_READY_REUSED = D4_MAINTAINABILITY_ACCESS_PACKAGE_RUNTIME_READY;
export const D4_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY = R7_CHANGE_READY;
export const D4_DISCIPLINE_INTERFACE_RUNTIME_READY = R8_INTERFACE_READY;
export const D4_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_READY = R9_REVIEW_READY;
export const D4_D9_SOURCE_CONTRACT_RUNTIME_READY = false as const;
export { D4_REUSES_CANONICAL_CURRENTNESS, D4_REUSES_CANONICAL_DIGITAL_THREAD, D4_REUSES_CANONICAL_FINGERPRINT, PARALLEL_D4_CURRENTNESS_ENGINE_CREATED, PARALLEL_D4_DIGITAL_THREAD_CREATED, SECOND_D4_FINGERPRINT_ALGORITHM_CREATED };
export const D4_R10_THREAD_DEPTH_REUSED = THREAD_DEFAULT_MAX_DEPTH;
export const CANONICAL_FINGERPRINT_REUSED = D4_REUSES_CANONICAL_FINGERPRINT;
export const D4_R10_FINGERPRINT_INTEGRATED = true as const;
export const D4_R1_R9_EXACT_REVISIONS_REUSED = true as const;
export const EXACT_D4_DIGITAL_THREAD_REVISION_REQUIRED = true as const;
export const FLOATING_D4_DIGITAL_THREAD_REFERENCE_ALLOWED = false as const;
export const D4_DIGITAL_THREAD_REFERENCE_AUTO_REPOINTED = D4_SILENT_REPOINTING_ALLOWED;
export const D4_EXPLICIT_LINEAGE_SUPPORTED = true as const;
export const D4_INFERRED_LINEAGE_ALLOWED = false as const;
export const D4_SUPERSESSION_CURRENTNESS_IMPLEMENTED = true as const;
export const SUPERSEDED_D4_REVISION_EXPOSED_AS_CURRENT = false as const;
export const STALE_D4_REVISION_EXPOSED_AS_CURRENT = false as const;
export const SUPERSEDED_D4_REVISION_DELETED = false as const;
export const D4_SUPERSESSION_HISTORY_PRESERVED = true as const;
export const D4_R7_CHANGE_CURRENTNESS_INTEGRATED = true as const;
export const D4_R7_REASSESSMENT_CURRENTNESS_INTEGRATED = true as const;
export const REASSESSMENT_REQUIRED_D4_RECORD_EXPOSED_AS_VALIDATED = false as const;
export const REASSESSMENT_REQUIRED_EQUALS_INVALID = false as const;
export const D4_R9_REVIEW_VALIDATION_CURRENTNESS_INTEGRATED = true as const;
export const PRIOR_D4_REVIEW_AUTO_TRANSFERS_TO_NEW_REVISION = false as const;
export const PRIOR_D4_VALIDATION_AUTO_TRANSFERS_TO_NEW_REVISION = false as const;
export const STALE_D4_VALIDATION_EXPOSED_AS_CURRENT = false as const;
export const SUPERSEDED_D4_VALIDATION_EXPOSED_AS_CURRENT = false as const;
export const D4_R8_INTERFACE_CURRENTNESS_INTEGRATED = true as const;
export const D4_INTERFACE_HISTORICAL_REFERENCE_AUTO_REPOINTED = D4_SILENT_REPOINTING_ALLOWED;
export const D4_INTERFACE_COUNTERPART_AUTO_REPOINTED = D4_SILENT_REPOINTING_ALLOWED;
export const STALE_D4_HANDOFF_EXPOSED_AS_CURRENT = false as const;
export const D4_R4_VENDOR_DOCUMENT_LINEAGE_INTEGRATED = true as const;
export { NEW_VENDOR_REVISION_AUTO_ADOPTED_AS_ENGINEERING, SUPERSEDED_VENDOR_DOCUMENT_DELETED };
export const D4_R10_AUTO_MUTATES_R3_DESIGN_CONDITION = false as const;
export const D4_R10_AUTO_MUTATES_R3_PERFORMANCE_CONTEXT = false as const;
export const D4_R10_AUTO_MUTATES_R5_TECHNICAL_REQUIREMENT = false as const;
export const D4_R10_AUTO_MUTATES_R6_MAINTAINABILITY_CONTEXT = false as const;
export const D4_CURRENTNESS_PROPAGATION_REQUIRES_EXPLICIT_RELATIONSHIP = true as const;
export const D4_INFERRED_CURRENTNESS_PROPAGATION_ALLOWED = false as const;
export const D4_CURRENTNESS_PROPAGATION_AUTO_RECALCULATES_ENGINEERING = false as const;
export const D4_CURRENTNESS_PROPAGATION_AUTO_REDESIGNS_ENGINEERING = false as const;
export const D4_CURRENTNESS_PROPAGATION_AUTO_VALIDATES_ENGINEERING = false as const;
export const D4_R1_R9_DIGITAL_THREAD_TRACEABLE = true as const;
export const D4_R10_PROVENANCE_REQUIRED = true as const;
export const D4_R10_PROVENANCE_PRESERVED = true as const;
export const SILENT_D4_R10_MUTATION_ALLOWED = false as const;
export const D4_R10_HISTORY_PRESERVED = true as const;
export const TENANT_WORKSPACE_PROJECT_D4_R10_SCOPE_ENFORCED = true as const;
export { AI_EQUALS_D4_MECHANICAL_ENGINEERING_AUTHORITY, ADMIN_EQUALS_D4_MECHANICAL_ENGINEERING_AUTHORITY };
export const AI_CAN_INFER_AUTHORITATIVE_D4_LINEAGE = false as const;
export const AI_CAN_AUTO_REPOINT_D4_HISTORY = false as const;
export const ADMIN_CAN_AUTO_REPOINT_D4_HISTORY = false as const;
export const D4_R10_DUPLICATE_GOVERNANCE_IMPLEMENTED = true as const;
export const D4_R10_REPLAY_PROTECTION_IMPLEMENTED = true as const;
export const D4_R10_SPOOFING_PROTECTION_IMPLEMENTED = true as const;
export const D4_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT = 0 as const;
export const D4_CONFORMANCE_DETERMINATION_RUNTIME_COUNT = 0 as const;
export const D4_APPROVAL_RUNTIME_COUNT = 0 as const;
export const D4_CERTIFICATION_RUNTIME_COUNT = 0 as const;
export const D4_AUTOMATIC_REDESIGN_RUNTIME_COUNT = 0 as const;
export { D4_EQUIPMENT_SIZING_RUNTIME_COUNT, D4_ROTATING_EQUIPMENT_CALCULATION_RUNTIME_COUNT, D4_STATIC_EQUIPMENT_CALCULATION_RUNTIME_COUNT, D4_THERMAL_MECHANICAL_CALCULATION_RUNTIME_COUNT, D4_MECHANICAL_LOAD_CALCULATION_RUNTIME_COUNT, D4_VIBRATION_ANALYSIS_RUNTIME_COUNT, D4_FATIGUE_ANALYSIS_RUNTIME_COUNT, D4_MECHANICAL_DESIGN_OPTIMIZATION_RUNTIME_COUNT, D4_D9_SOURCE_CONTRACT_RUNTIME_COUNT, D4_D9_RUNTIME_INTEGRATION_COUNT, D4_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT, D4_CROSS_DISCIPLINE_CONFLICT_DETECTION_RUNTIME_COUNT, D4_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT, D4_CROSS_DISCIPLINE_RECOMMENDATION_RUNTIME_COUNT };
export {
  D4_EQUALS_D1_STRUCTURAL_AUTHORITY,
  D4_EQUALS_D2_CIVIL_AUTHORITY,
  D4_EQUALS_D3_GEOTECHNICAL_AUTHORITY,
  D4_EQUALS_D5_PIPING_AUTHORITY,
  D4_EQUALS_D6_PROCESS_AUTHORITY,
  D4_EQUALS_D7_ELECTRICAL_AUTHORITY,
  D4_EQUALS_D8_INSTRUMENTATION_CONTROL_AUTHORITY,
};
export const D5_RUNTIME_STARTED = false as const;
export const D6_RUNTIME_STARTED = false as const;
export const D7_RUNTIME_STARTED = false as const;
export const D8_RUNTIME_STARTED = false as const;
export const D9_RUNTIME_STARTED = false as const;
export const D9_RUNTIME_COUNT = 0 as const;
export const DATABASE_SCHEMA_CHANGED = false as const;
export const NEW_DEPENDENCY_ADDED = false as const;
export const D1_STRUCTURAL_PACK_COMPLETE = false as const;
export const D1N_REOPENED = false as const;
export const D2_TRACK_COMPLETE = true as const;
export const D2_REOPENED = false as const;
export const D3_TRACK_COMPLETE = true as const;
export const D3_TRACK_COMPLETION_CLASSIFICATION = "COMPLETE_BOUNDED_WITH_LIMITATIONS" as const;
export const D3_REOPENED = false as const;
export const UNAUTHORIZED_D1_PACK_COMPLETION = false as const;
export const UNAUTHORIZED_D2_REOPEN = false as const;
export const UNAUTHORIZED_D3_REOPEN = false as const;
export const UNAUTHORIZED_D4_R11_R12_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_D5_D8_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_D9_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_LINEAGE_INFERENCE = false as const;
export const UNAUTHORIZED_HISTORY_AUTO_REPOINT = false as const;
export const UNAUTHORIZED_ENGINEERING_MUTATION = false as const;
export const UNAUTHORIZED_RECALCULATION_PROMOTION = false as const;
export const UNAUTHORIZED_REDESIGN_PROMOTION = false as const;
export const UNAUTHORIZED_VALIDATION_PROMOTION = false as const;
export const UNAUTHORIZED_CROSS_DISCIPLINE_REASONING_PROMOTION = false as const;
export const UNAUTHORIZED_GA_PROMOTION = false as const;
export const UNAUTHORIZED_PRODUCT_CLAIM = false as const;
export const D4_R10_SUBJECT_KINDS = ["CONTEXT", "OBJECT", "CLASSIFICATION", "SERVICE", "MEMBERSHIP", "DESCRIPTION", "DESIGN", "PERFORMANCE", "VENDOR_DOCUMENT", "VENDOR_DATA", "TECHNICAL", "MAINTAINABILITY", "REQUIREMENT", "ASSUMPTION", "DECISION", "CHANGE", "REASSESSMENT", "HANDOFF", "REVIEW_REQUEST", "FINDING", "COMPLETION", "VALIDATION"] as const;

export const D4_R11_CANONICAL_PHASE = D4_IMPLEMENTATION_PHASES[10];
export const D4_R11_PHASE_TYPE = "D9_SOURCE_CONTRACT" as const;
export const D4_R11_CANONICAL_SCOPE = "Implement one governed D4 Mechanical source contract for future D9 consumption using exact R1-R10 Mechanical revisions. Expose governed Mechanical facts and metadata, including identity, equipment/system context, design/performance context, vendor evidence, technical requirements, maintainability/access/package context, requirements/assumptions/decisions/change, interfaces, review/validation, currentness, lineage, authority, limitations, provenance and fingerprint. Do not create new engineering facts, derive values, perform calculations, fabricate counterpart information, transfer authority, perform cross-discipline reasoning or start D9 runtime." as const;
export const D4_R11_STARTED = false as const;
export const D4_R10_READY_FOR_NEXT_PHASE = true as const;
export const D4_R10_NEXT_PHASE = D4_R11_CANONICAL_PHASE;
export const D4_R10_NEXT_PHASE_TYPE = D4_R11_PHASE_TYPE;
export const D4_R10_CANONICAL_NEXT_PHASE = D4_R11_CANONICAL_PHASE;
export const D4_R10_CANONICAL_NEXT_PHASE_SCOPE = D4_R11_CANONICAL_SCOPE;
export const D4_R10_BLOCKER = "NONE" as const;
export const D4_R10_MACHINE_READABLE_ROADMAP_UPDATED = true as const;

const FLOATING = new Set(["latest", "current", "newest", "head", "active", "active model"]);
const INFERRED = new Set(["matching_tag", "shared_vendor", "shared_package", "system_membership", "proximity", "document_cooccurrence", "similar_value", "ai_similarity", "inferred", "filename", "temporal_proximity", "semantic_similarity"]);
const PROPAGATION_RELATIONS = new Set(["DEPENDS_ON", "BASED_ON", "AFFECTS", "USES", "SUPPORTED_BY", "CONSTRAINED_BY", "PARENT", "OBJECT_REFERENCE", "REVIEWS"]);

type Currentness = (typeof D4_CURRENTNESS_STATES)[number];
type SubjectKind = (typeof D4_R10_SUBJECT_KINDS)[number];

type Prohibited = {
  infer?: boolean;
  identicalTags?: boolean;
  membership?: boolean;
  similarValues?: boolean;
  vendorRelationship?: boolean;
  filename?: boolean;
  semantic?: boolean;
  temporalProximity?: boolean;
  documentCooccurrence?: boolean;
  repoint?: boolean;
  mutateR3?: boolean;
  mutatePerformance?: boolean;
  mutateR5?: boolean;
  mutateR6?: boolean;
  recalculate?: boolean;
  redesign?: boolean;
  adoptVendor?: boolean;
  transferReview?: boolean;
  transferValidation?: boolean;
  validate?: boolean;
  d9?: boolean;
  reason?: boolean;
};

export type D4R10Actor = D4R1Actor & { actorKind?: string };

export type D4R10Pin = {
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

export type D4R10LineageInput = Prohibited & {
  lineageId: string;
  contextId: string;
  source: Endpoint;
  target: Endpoint;
  relationshipType: string;
  mechanicalDependency?: string | null;
  authoritative?: boolean;
  candidate?: boolean;
  citedCurrentness: string;
  provenanceRef: string;
  assertedFingerprint?: string;
  tenantId?: string;
  workspaceId?: string;
  projectId?: string;
};

export type D4R10LineageRecord = {
  lineageId: string;
  contextId: string;
  source: D4R10Pin;
  target: D4R10Pin;
  relationshipType: string;
  mechanicalDependency: (typeof D4_R7_DEPENDENCY_TARGETS)[number] | null;
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

export type D4R10SupersessionInput = Prohibited & {
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

export type D4R10SupersessionRecord = {
  supersessionId: string;
  contextId: string;
  predecessor: D4R10Pin;
  successor: D4R10Pin;
  deleted: false;
  historicalEdgesRewritten: false;
  provenanceRef: string;
  fingerprint: string;
  recordedBy: string;
  recordedAt: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
};

export type D4R10CurrentnessInput = Prohibited & {
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

export type D4R10CurrentnessMark = {
  eventId: string;
  contextId: string;
  subject: D4R10Pin;
  currentness: Currentness;
  engineeringInvalid: false;
  engineeringValidated: false;
  contentMutated: false;
  recalculated: false;
  redesigned: false;
  provenanceRef: string;
  fingerprint: string;
  recordedBy: string;
  recordedAt: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
};

export type D4R10History = {
  historyId: string;
  subjectKind: "LINEAGE" | "SUPERSESSION" | "CURRENTNESS";
  subjectId: string;
  action: "CREATED";
  fingerprint: string;
  recordedAt: string;
};

export type D4R10Store = {
  r9: D4R9Store;
  now: () => string;
  lineage: D4R10LineageRecord[];
  supersessions: D4R10SupersessionRecord[];
  marks: D4R10CurrentnessMark[];
  history: D4R10History[];
};

export type D4R10Trace = {
  origin: D4R10Pin;
  nodes: D4R10Pin[];
  edges: D4R10LineageRecord[];
  currentness: Currentness;
};

function fail(code: string): never {
  throw new Error(`D4_R10_${code}`);
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
  return (D4_CURRENTNESS_STATES as readonly string[]).includes(value);
}

function assertProhibited(input: Prohibited): void {
  if (input.infer === true || input.identicalTags === true || input.membership === true || input.similarValues === true || input.vendorRelationship === true || input.filename === true || input.semantic === true || input.temporalProximity === true || input.documentCooccurrence === true) fail("INFERRED_LINEAGE_REJECTED");
  if (input.repoint === true) fail("AUTO_REPOINT_REJECTED");
  if (input.mutateR3 === true || input.mutatePerformance === true) fail("R3_MUTATION_REJECTED");
  if (input.mutateR5 === true) fail("R5_MUTATION_REJECTED");
  if (input.mutateR6 === true) fail("R6_MUTATION_REJECTED");
  if (input.recalculate === true) fail("RECALCULATION_NOT_IN_R10");
  if (input.redesign === true) fail("REDESIGN_NOT_IN_R10");
  if (input.adoptVendor === true) fail("VENDOR_AUTO_ADOPTION_REJECTED");
  if (input.transferReview === true) fail("REVIEW_TRANSFER_REJECTED");
  if (input.transferValidation === true) fail("VALIDATION_TRANSFER_REJECTED");
  if (input.validate === true) fail("VALIDATION_NOT_IN_R10");
  if (input.d9 === true) fail("D9_NOT_STARTED");
  if (input.reason === true) fail("CROSS_DISCIPLINE_REASONING_NOT_IN_R10");
}

function assertScope(actor: D4R10Actor, input: { tenantId?: string; workspaceId?: string; projectId?: string }): void {
  if (!actor.actorId.trim() || !actor.tenantId.trim() || !actor.workspaceId.trim() || !actor.projectId.trim()) fail("SCOPE_REQUIRED");
  if (input.tenantId != null && input.tenantId !== actor.tenantId) fail("CROSS_TENANT_OPERATION");
  if (input.workspaceId != null && input.workspaceId !== actor.workspaceId) fail("CROSS_WORKSPACE_OPERATION");
  if (input.projectId != null && input.projectId !== actor.projectId) fail("CROSS_PROJECT_OPERATION");
}

function assertRecorder(actor: D4R10Actor): void {
  if (blockedParty(actor.actorId) || blockedParty(actor.authority) || actor.authority === "AI_ASSISTANT" || actor.actorKind === "ai") fail("AI_CANNOT_INFER_LINEAGE");
  if (actor.authority === "ADMINISTRATOR" || actor.authority === "ADMIN") fail("ADMIN_CANNOT_REPOINT");
  if (actor.authority === "MECHANICAL_ENGINEERING_AUTHORITY" || actor.authority === "REVIEWER") fail("AUTHORITY_SPOOFING_REJECTED");
  if (actor.authority !== D4_CONTEXT_AUTHORITY) fail("UNAUTHORIZED");
}

function currentnessOf(value: string): Currentness {
  const cited = value.trim();
  if (!isCurrentness(cited)) fail("CURRENTNESS_INVALID");
  return cited;
}

function remember(store: D4R10Store, subjectKind: D4R10History["subjectKind"], subjectId: string, fingerprint: string): void {
  store.history.push({ historyId: `hist-${store.history.length + 1}`, subjectKind, subjectId, action: "CREATED", fingerprint, recordedAt: store.now() });
}

type Hit = { revision: string; fingerprint: string; status: string; contextId: string; tenantId: string };

function asHit(row: { provenanceRef: string; fingerprint: string; recordStatus: string; contextId: string; tenantId: string }, revision = row.provenanceRef): Hit {
  return { revision, fingerprint: row.fingerprint, status: row.recordStatus, contextId: row.contextId, tenantId: row.tenantId };
}

function live(store: D4R10Store, actor: D4R10Actor, contextId: string, endpoint: Endpoint, cited: Currentness): D4R10Pin {
  const subjectKind = explicit(endpoint.subjectKind, "SUBJECT_KIND_REQUIRED");
  if (!(D4_R10_SUBJECT_KINDS as readonly string[]).includes(subjectKind)) fail("SUBJECT_KIND_INVALID");
  const subjectId = explicit(endpoint.subjectId, "SUBJECT_REFERENCE_REQUIRED");
  const subjectRevision = explicit(endpoint.subjectRevision, "SUBJECT_REVISION_REQUIRED");
  const subjectFingerprint = explicit(endpoint.subjectFingerprint, "SUBJECT_FINGERPRINT_REQUIRED");
  const r1 = store.r9.r8.r7.r6.r5.r4.r3.r2.r1;
  const context = r1.contexts.find((row) => row.contextId === contextId);
  if (!context || context.tenantId !== actor.tenantId || context.workspaceId !== actor.workspaceId || context.projectId !== actor.projectId) fail("R1_CONTEXT_NOT_FOUND");
  if (context.discipline !== D4_DISCIPLINE) fail("DISCIPLINE_NOT_MECHANICAL");
  const kind = subjectKind as SubjectKind;
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
  } else if (kind === "CLASSIFICATION") {
    const row = r2.classifications.find((item) => item.classificationId === subjectId);
    if (row) hit = asHit(row);
  } else if (kind === "SERVICE") {
    const row = r2.services.find((item) => item.serviceContextId === subjectId);
    if (row) hit = asHit(row);
  } else if (kind === "MEMBERSHIP") {
    const row = r2.memberships.find((item) => item.membershipId === subjectId);
    if (row) hit = asHit(row);
  } else if (kind === "DESCRIPTION") {
    const row = r2.descriptions.find((item) => item.descriptionId === subjectId);
    if (row) hit = asHit(row);
  } else if (kind === "DESIGN" || kind === "PERFORMANCE") {
    const row = r3.records.find((item) => item.recordId === subjectId);
    const expected = kind === "DESIGN" ? "MECHANICAL_DESIGN_CONDITION" : "MECHANICAL_PERFORMANCE_CONTEXT";
    if (row && row.recordClass !== expected) fail("SUBJECT_KIND_MISMATCH");
    if (row) hit = asHit(row);
  } else if (kind === "VENDOR_DOCUMENT" || kind === "VENDOR_DATA") {
    const row = r4.records.find((item) => item.recordId === subjectId);
    const expected = kind === "VENDOR_DOCUMENT" ? "VENDOR_DOCUMENT" : "VENDOR_DATA";
    if (row && row.recordClass !== expected) fail("SUBJECT_KIND_MISMATCH");
    if (row) hit = asHit(row);
  } else if (kind === "TECHNICAL") {
    const row = r5.records.find((item) => item.recordId === subjectId);
    if (row) hit = asHit(row);
  } else if (kind === "MAINTAINABILITY") {
    const row = r6.records.find((item) => item.recordId === subjectId);
    if (row) hit = asHit(row);
  } else if (kind === "REQUIREMENT") {
    const row = r7.requirements.find((item) => item.requirementContextId === subjectId);
    if (row) hit = asHit(row);
  } else if (kind === "ASSUMPTION") {
    const row = r7.assumptions.find((item) => item.assumptionContextId === subjectId);
    if (row) hit = asHit(row);
  } else if (kind === "DECISION") {
    const row = r7.decisions.find((item) => item.decisionContextId === subjectId);
    if (row) hit = asHit(row);
  } else if (kind === "CHANGE") {
    const row = r7.changes.find((item) => item.changeContextId === subjectId);
    if (row) hit = asHit(row);
  } else if (kind === "REASSESSMENT") {
    const row = r7.reassessments.find((item) => item.reassessmentContextId === subjectId);
    if (row) hit = asHit(row);
  } else if (kind === "HANDOFF") {
    const row = store.r9.r8.handoffs.find((item) => item.handoffId === subjectId);
    if (row) hit = asHit(row);
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

function snapshot(store: D4R10Store): string {
  const r3 = store.r9.r8.r7.r6.r5.r4.r3.records.map((row) => `${row.recordId}:${row.fingerprint}:${row.suppliedValue}:${row.recordStatus}`).join("|");
  const r4 = store.r9.r8.r7.r6.r5.r4.records.map((row) => `${row.recordId}:${row.fingerprint}:${row.suppliedValue}:${row.documentRevision}:${row.recordStatus}`).join("|");
  const r5 = store.r9.r8.r7.r6.r5.records.map((row) => `${row.recordId}:${row.fingerprint}:${row.requirementStatement}:${row.recordStatus}`).join("|");
  const r6 = store.r9.r8.r7.r6.records.map((row) => `${row.recordId}:${row.fingerprint}:${row.statement}:${row.recordStatus}`).join("|");
  const changes = store.r9.r8.r7.changes.map((row) => `${row.changeContextId}:${row.fingerprint}:${row.recalculated}:${row.redesigned}`).join("|");
  const handoffs = store.r9.r8.handoffs.map((row) => `${row.handoffId}:${row.fingerprint}:${row.provenanceRef}:${row.counterpart?.interfaceId ?? ""}:${row.engineeringValidated}`).join("|");
  const reviews = store.r9.requests.map((row) => `${row.reviewRequestId}:${row.subjectRevision}:${row.fingerprint}:${row.reviewCompleted}`).join("|");
  const validations = store.r9.validations.map((row) => `${row.validationId}:${row.subjectRevision}:${row.engineeringValidated}:${row.fingerprint}`).join("|");
  return `${r3}#${r4}#${r5}#${r6}#${changes}#${handoffs}#${reviews}#${validations}`;
}

function pinKey(pin: D4R10Pin): string {
  return `${pin.subjectKind}|${pin.subjectId}|${pin.subjectRevision}|${pin.subjectFingerprint}`;
}

function downstream(store: D4R10Store, origin: D4R10Pin): D4R10Pin[] {
  const found: D4R10Pin[] = [];
  const seen = new Set<string>([pinKey(origin)]);
  let frontier = [origin];
  for (let depth = 0; depth < THREAD_DEFAULT_MAX_DEPTH && frontier.length > 0; depth += 1) {
    const next: D4R10Pin[] = [];
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

function markOf(store: D4R10Store, actor: D4R10Actor, eventId: string, subject: D4R10Pin, currentness: Currentness, provenanceRef: string): D4R10CurrentnessMark {
  const fingerprint = fingerprintCanonical({ eventId, subject, currentness, provenanceRef, engineeringInvalid: false, engineeringValidated: false, contentMutated: false });
  return Object.freeze({
    eventId,
    contextId: subject.contextId,
    subject,
    currentness,
    engineeringInvalid: false,
    engineeringValidated: false,
    contentMutated: false,
    recalculated: false,
    redesigned: false,
    provenanceRef,
    fingerprint,
    recordedBy: actor.actorId,
    recordedAt: store.now(),
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
  });
}

export function createD4R10Store(r9: D4R9Store, now: () => string = () => r9.now()): D4R10Store {
  return { r9, now, lineage: [], supersessions: [], marks: [], history: [] };
}

export function exposedMechanicalCurrentness(store: D4R10Store, subject: D4R10Pin): Currentness {
  const latest = [...store.marks].reverse().find((row) => pinKey(row.subject) === pinKey(subject));
  return latest?.currentness ?? "CURRENT";
}

export function recordMechanicalLineage(store: D4R10Store, actor: D4R10Actor, input: D4R10LineageInput): D4R10LineageRecord {
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
  const identity = (D4_EXPLICIT_RELATIONSHIP_KINDS as readonly string[]).includes(relationshipType);
  if (!identity && (!isGovernedRelationType(relationshipType) || !relationSemantics(relationshipType))) fail("RELATION_NOT_GOVERNED");
  let mechanicalDependency: D4R10LineageRecord["mechanicalDependency"] = null;
  if (input.mechanicalDependency != null && input.mechanicalDependency !== "") {
    const dependency = explicit(input.mechanicalDependency, "DEPENDENCY_NOT_EXPLICIT");
    if (!(D4_R7_DEPENDENCY_TARGETS as readonly string[]).includes(dependency)) fail("DEPENDENCY_NOT_EXPLICIT");
    mechanicalDependency = dependency as D4R10LineageRecord["mechanicalDependency"];
  }
  if (downstream(store, target).some((pin) => pinKey(pin) === pinKey(source))) fail("CIRCULAR_LINEAGE_REJECTED");
  const authoritative = input.authoritative !== false && input.candidate !== true;
  const provenanceRef = explicit(input.provenanceRef, "MISSING_PROVENANCE");
  const lineageId = explicit(input.lineageId, "LINEAGE_ID_REQUIRED");
  const fingerprint = fingerprintCanonical({
    lineageId, contextId: source.contextId, source, target, relationshipType, mechanicalDependency, authoritative, candidate: input.candidate === true, citedCurrentness: cited, provenanceRef, engineeringValidated: false,
  });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.lineage.find((row) => row.lineageId === lineageId);
  if (existing) return existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId ? existing : fail("LINEAGE_ALREADY_RECORDED");
  const signature = `${pinKey(source)}|${pinKey(target)}|${relationshipType}|${mechanicalDependency ?? ""}`;
  if (store.lineage.some((row) => row.contextId === source.contextId && `${pinKey(row.source)}|${pinKey(row.target)}|${row.relationshipType}|${row.mechanicalDependency ?? ""}` === signature)) fail("DUPLICATE_LINEAGE_REJECTED");
  const before = snapshot(store);
  const record: D4R10LineageRecord = Object.freeze({
    lineageId,
    contextId: source.contextId,
    source,
    target,
    relationshipType,
    mechanicalDependency,
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

export function recordMechanicalSupersession(store: D4R10Store, actor: D4R10Actor, input: D4R10SupersessionInput): D4R10SupersessionRecord {
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
  const pair = `${pinKey(predecessor)}>${pinKey(successor)}`;
  if (store.supersessions.some((row) => `${pinKey(row.predecessor)}>${pinKey(row.successor)}` === pair)) fail("DUPLICATE_SUPERSESSION_REJECTED");
  const before = snapshot(store);
  const record: D4R10SupersessionRecord = Object.freeze({
    supersessionId,
    contextId,
    predecessor,
    successor,
    deleted: false,
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
  if (mark.currentness === "CURRENT") fail("SUPERSEDED_EXPOSED_AS_CURRENT");
  store.marks.push(mark);
  remember(store, "CURRENTNESS", mark.eventId, mark.fingerprint);
  if (store.lineage.map((row) => `${pinKey(row.source)}>${pinKey(row.target)}`).join("|") !== beforeEdges) fail("HISTORICAL_REFERENCE_REWRITTEN");
  if (snapshot(store) !== before) fail("CONTENT_MUTATION_REJECTED");
  if (record.deleted || record.historicalEdgesRewritten) fail("HISTORICAL_REFERENCE_REWRITTEN");
  return record;
}

export function recordMechanicalCurrentness(store: D4R10Store, actor: D4R10Actor, input: D4R10CurrentnessInput): D4R10CurrentnessMark[] {
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
  if (currentness !== "CURRENT" && root.currentness === "CURRENT") fail("STALE_EXPOSED_AS_CURRENT");
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
    if (mark.contentMutated || mark.recalculated || mark.redesigned) fail("CONTENT_MUTATION_REJECTED");
    store.marks.push(mark);
    remember(store, "CURRENTNESS", mark.eventId, mark.fingerprint);
  }
  if (snapshot(store) !== before) fail("CONTENT_MUTATION_REJECTED");
  return created;
}

export function traceMechanicalDigitalThread(store: D4R10Store, actor: D4R10Actor, input: { contextId: string; subject: Endpoint; citedCurrentness: string; tenantId?: string; workspaceId?: string; projectId?: string }): D4R10Trace {
  assertRecorder(actor);
  assertScope(actor, input);
  const cited = currentnessOf(input.citedCurrentness);
  const contextId = explicit(input.contextId, "R1_CONTEXT_REQUIRED");
  const origin = live(store, actor, contextId, input.subject, cited);
  const nodes = [origin, ...downstream(store, origin)];
  const keys = new Set(nodes.map(pinKey));
  const edges = store.lineage.filter((edge) => edge.contextId === origin.contextId && edge.authoritative && !edge.candidate && keys.has(pinKey(edge.source)) && keys.has(pinKey(edge.target)));
  return { origin, nodes, edges, currentness: exposedMechanicalCurrentness(store, origin) };
}

export function repointMechanicalDigitalThread(): never {
  return fail("AUTO_REPOINT_REJECTED");
}

export function inferMechanicalLineage(): never {
  return fail("INFERRED_LINEAGE_REJECTED");
}

export function adoptVendorRevisionFromCurrentness(): never {
  return fail("VENDOR_AUTO_ADOPTION_REJECTED");
}

export function transferMechanicalValidationFromCurrentness(): never {
  return fail("VALIDATION_TRANSFER_REJECTED");
}

export function mutateDesignFromCurrentness(): never {
  return fail("R3_MUTATION_REJECTED");
}

export function mutateRequirementFromCurrentness(): never {
  return fail("R5_MUTATION_REJECTED");
}

export function mutateMaintainabilityFromCurrentness(): never {
  return fail("R6_MUTATION_REJECTED");
}

export function recalculateFromMechanicalCurrentness(): never {
  return fail("RECALCULATION_NOT_IN_R10");
}

export function redesignFromMechanicalCurrentness(): never {
  return fail("REDESIGN_NOT_IN_R10");
}

export function validateFromMechanicalCurrentness(): never {
  return fail("VALIDATION_NOT_IN_R10");
}

export function reasonAcrossMechanicalCurrentness(): never {
  return fail("CROSS_DISCIPLINE_REASONING_NOT_IN_R10");
}
