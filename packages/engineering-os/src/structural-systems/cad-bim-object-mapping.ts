/**
 * EOS-D1M-R2 source-object to structural-target mapping.
 * In-memory identity correspondence only. No parser, extraction, or engineering validation.
 */
import type { EosEvidenceSourceKind, StructuralObjectKind } from "@rtb/types";
import { EOS_EVIDENCE_SOURCE_KINDS, STRUCTURAL_OBJECT_KINDS } from "@rtb/types";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import type { D1mR1Record } from "./cad-bim-source-revision";
import { D1L_R6_TRACK_COMPLETE, D1L_R6_TRACK_STATUS } from "./certification-gate-closeout";
import { D1K_R5_CROSS_DISCIPLINE_INTELLIGENCE_READY, D1K_R5_INTERNAL_DISCIPLINE_INTEGRATION_READY } from "./interface-closeout";
import { POST_D1J_STRUCTURAL_DEBT_LEDGER } from "./post-d1j-roadmap";
import {
  D1_STRUCTURAL_PACK_COMPLETE,
  D1G_CERTIFIED_SOLVER_STATUS,
  D1G_CONFORMANCE_VALIDATED,
  D1G_ENGINEER_VALIDATED,
  D1G_LIVE_VALIDATED,
  GA_SECURITY_DEBT_BLOCKS_GENERAL_AVAILABILITY,
} from "./roadmap-after-twin-closeout";

export const D1M_R2_PHASE = "EOS-D1M-R2-SOURCE-OBJECT-STRUCTURAL-TARGET-MAPPING" as const;
export const D1M_R2_PHASE_TYPE = "CAD_OR_BIM_SOURCE_OBJECT_STRUCTURAL_TARGET_MAPPING" as const;
export const D1M_R2_STATUS = "SOURCE_OBJECT_MAPPING_IMPLEMENTED" as const;
export const D1M_R2_MATURITY_STATE = "STRUCTURAL_CAD_OR_BIM_SOURCE_OBJECT_STRUCTURAL_TARGET_MAPPING_IMPLEMENTED" as const;
export const D1M_R2_CLOSEOUT_PATH =
  "docs/architecture/engineering-os/EOS_D1M_R2_SOURCE_OBJECT_STRUCTURAL_TARGET_MAPPING_CLOSEOUT.md" as const;
export const D1M_R2_PARENT_ARCHITECTURE_PATH =
  "docs/architecture/engineering-os/EOS_D1M_0_CAD_OR_BIM_INTELLIGENCE_ARCHITECTURE.md" as const;
export const D1M_R2_R1_CLOSEOUT_PATH =
  "docs/architecture/engineering-os/EOS_D1M_R1_CAD_OR_BIM_ARTIFACT_SOURCE_REVISION_FOUNDATION_CLOSEOUT.md" as const;
export const D1M_R2_CANONICAL_SCOPE =
  "Record a governed mapping from one source-model object identity on an exact D1M-R1 artifact revision to one existing D1A structural target. Preserve mapping evidence, authority, provenance, fingerprint, and history. Do not extract geometry or semantics, parse a file, ingest a payload, approve the mapping by AI, or treat the mapping as engineering validation." as const;

export const D1M_R2_ARCHITECTURE_READY = true as const;
export const D1M_R2_SOURCE_REFERENCE_RUNTIME_READY = true as const;
export const D1M_R2_MODEL_EVIDENCE_RUNTIME_READY = false as const;
export const D1M_R2_FORMAT_ADAPTER_RUNTIME_READY = false as const;
export const D1M_R2_STRUCTURAL_INTERPRETATION_RUNTIME_READY = false as const;
export const D1M_R2_CHANGE_GOVERNANCE_RUNTIME_READY = false as const;
export const D1M_R2_R1_SOURCE_REFERENCE_REQUIRED = true as const;
export const D1M_R2_EXACT_ARTIFACT_REVISION_BINDING_REQUIRED = true as const;
export const D1M_R2_FLOATING_ARTIFACT_REFERENCE_ALLOWED = false as const;
export const D1M_R2_MAPPING_ARTIFACT_REFERENCE_AUTO_UPGRADED = false as const;
export const D1M_R2_SOURCE_OBJECT_IDENTITY_RUNTIME_IMPLEMENTED = true as const;
export const D1M_R2_SOURCE_OBJECT_IDENTITY_RUNTIME_COUNT = 1 as const;
export const D1M_R2_OBJECT_RUNTIME_COUNT = 1 as const;
export const D1M_R2_OBJECT_RUNTIME_MEANING = "SOURCE_OBJECT_IDENTITY_REFERENCE_ONLY" as const;
export const D1M_R2_SOURCE_OBJECT_REVISION_BINDING_ENFORCED = true as const;
export const D1M_R2_SOURCE_MODEL_OBJECT_ID_EQUALS_STRUCTURAL_OBJECT_ID = false as const;
export const D1M_R2_SOURCE_OBJECT_ID_RECORDED_EQUALS_OBJECT_CONTENT_VERIFIED = false as const;
export const D1M_R2_SAME_SOURCE_OBJECT_ID_ACROSS_REVISIONS_EQUALS_ENGINEERING_EQUIVALENT = false as const;
export const D1M_R2_EXISTING_D1A_STRUCTURAL_TARGET_REQUIRED = true as const;
export const D1M_R2_D1A_STRUCTURAL_IDENTITY_REUSED = true as const;
export const D1M_R2_PARALLEL_STRUCTURAL_IDENTITY_CREATED = false as const;
export const D1M_R2_MISSING_STRUCTURAL_TARGET_AUTO_CREATED = false as const;
export const D1M_R2_MAPPING_RUNTIME_IMPLEMENTED = true as const;
export const D1M_R2_MAPPING_RUNTIME_COUNT = 1 as const;
export const D1M_R2_MAPPING_CARDINALITY = "ONE_SOURCE_OBJECT_TO_ONE_STRUCTURAL_TARGET" as const;
export const D1M_R2_MAPPING_DUPLICATE_CONFLICT_GOVERNED = true as const;
export const D1M_R2_MAPPING_EVIDENCE_PRESERVED = true as const;
export const D1M_R2_MAPPING_AUTHORITY_PRESERVED = true as const;
export const D1M_R2_MAPPING_PROVENANCE_PRESERVED = true as const;
export const D1M_R2_MAPPING_FINGERPRINT_IMPLEMENTED = true as const;
export const D1M_R2_CANONICAL_FINGERPRINT_REUSED = true as const;
export const D1M_R2_SECOND_FINGERPRINT_ALGORITHM_CREATED = false as const;
export const D1M_R2_MAPPING_HISTORY_PRESERVED = true as const;
export const D1M_R2_MAPPING_AUTHORITY_EQUALS_ENGINEERING_APPROVAL_AUTHORITY = false as const;
export const D1M_R2_MAPPING_AUTHORITY_EQUALS_CERTIFICATION_AUTHORITY = false as const;
export const D1M_R2_ADMIN_EQUALS_MAPPING_ENGINEERING_AUTHORITY = false as const;
export const D1M_R2_AI_CAN_CREATE_AUTHORITATIVE_OBJECT_MAPPING = false as const;
export const D1M_R2_AI_CAN_APPROVE_OBJECT_MAPPING = false as const;
export const D1M_R2_AI_CAN_INVENT_SOURCE_OBJECT_IDENTITY = false as const;
export const D1M_R2_AI_CAN_INVENT_STRUCTURAL_TARGET_IDENTITY = false as const;
export const D1M_R2_AI_OBJECT_MATCHING_RUNTIME_COUNT = 0 as const;
export const D1M_R2_AUTHORITATIVE_MAPPING_CONFIDENCE_SCORE_IMPLEMENTED = false as const;
export const D1M_R2_AMBIGUOUS_MAPPING_AUTO_RESOLVED = false as const;
export const D1M_R2_MAPPING_HUMAN_REVIEW_SUPPORTED = true as const;
export const D1M_R2_MAPPING_HUMAN_REVIEW_EQUALS_ENGINEERING_VALIDATION = false as const;
export const D1M_R2_SCOPE_ENFORCED = true as const;
export const D1M_R2_CROSS_WORKSPACE_OBJECT_MAPPING_ALLOWED = false as const;
export const D1M_R2_CROSS_PROJECT_OBJECT_MAPPING_ALLOWED = false as const;
export const D1M_R2_SOURCE_OBJECT_SPOOFING_PROTECTION_IMPLEMENTED = true as const;
export const D1M_R2_STRUCTURAL_TARGET_SPOOFING_PROTECTION_IMPLEMENTED = true as const;
export const D1M_R2_SOURCE_OBJECT_RECORDED_EQUALS_ENGINEERING_VALIDATED = false as const;
export const D1M_R2_OBJECT_MAPPING_RECORDED_EQUALS_ENGINEERING_VALIDATED = false as const;
export const D1M_R2_MAPPING_AUTHORIZED_EQUALS_ENGINEERING_VALIDATED = false as const;
export const D1M_R2_MAPPING_RECORDED_EQUALS_ENGINEERING_VALIDATED = false as const;
export const D1M_R2_MAPPING_CONFIRMED_EQUALS_STRUCTURAL_ADEQUACY_CONFIRMED = false as const;
export const D1M_R2_MAPPING_EVIDENCE_PRESENT_EQUALS_ENGINEERING_VALIDATED = false as const;
export const D1M_R2_MAPPING_FINGERPRINT_VERIFIED_EQUALS_ENGINEERING_VALIDATED = false as const;
export const D1M_R2_OBJECT_MAPPING_RECORDED_EQUALS_CERTIFIED = false as const;
export const D1M_R2_SILENT_MAPPING_REPOINTING_ALLOWED = false as const;
export const D1M_R2_MAPPING_SOURCE_OBJECT_AUTO_REPOINTED = false as const;
export const D1M_R2_MAPPING_STRUCTURAL_TARGET_AUTO_REPOINTED = false as const;
export const D1M_R2_SOURCE_OBJECT_DISCOVERY_BY_FILE_PARSING_IMPLEMENTED = false as const;
export const D1M_R2_OBJECT_EXTRACTION_RUNTIME_COUNT = 0 as const;
export const D1M_R2_PARSE_RUNTIME_COUNT = 0 as const;
export const D1M_R2_FILE_INGESTION_RUNTIME_COUNT = 0 as const;
export const D1M_R2_GENERIC_FILE_INGESTION_RUNTIME_COUNT = 0 as const;
export const D1M_R2_GEOMETRY_RUNTIME_COUNT = 0 as const;
export const D1M_R2_SEMANTIC_RUNTIME_COUNT = 0 as const;
export const D1M_R2_RELATIONSHIP_RUNTIME_COUNT = 0 as const;
export const D1M_R2_CHANGE_DETECTION_RUNTIME_COUNT = 0 as const;
export const D1M_R2_GEOMETRY_BASED_OBJECT_MATCHING_RUNTIME_COUNT = 0 as const;
export const D1M_R2_SEMANTIC_BASED_OBJECT_MATCHING_RUNTIME_COUNT = 0 as const;
export const D1M_R2_FORMAT_ADAPTER_RUNTIME_COUNT = 0 as const;
export const D1M_R2_NEW_EXTERNAL_CONNECTOR_RUNTIME_COUNT = 0 as const;
export const D1M_R2_UNIT_CONVERSION_RUNTIME_COUNT = 0 as const;
export const D1M_R2_COORDINATE_TRANSFORMATION_RUNTIME_COUNT = 0 as const;
export const D1M_R2_AXIS_INFERENCE_RUNTIME_COUNT = 0 as const;
export const D1M_R2_ENGINEERING_PROPERTY_INTERPRETATION_RUNTIME_COUNT = 0 as const;
export const D1M_R2_AUTOMATIC_MODEL_CORRECTION_RUNTIME_COUNT = 0 as const;
export const D1M_R2_CAD_AUTHORING_RUNTIME_COUNT = 0 as const;
export const D1M_R2_BIM_AUTHORING_RUNTIME_COUNT = 0 as const;
export const D1M_R2_CANONICAL_DIGITAL_THREAD_REUSED = true as const;
export const D1M_R2_PARALLEL_DIGITAL_THREAD_CREATED = false as const;
export const D1M_R2_D1K_CROSS_DISCIPLINE_GOVERNANCE_REUSED = true as const;
export const D1M_R2_PARALLEL_CROSS_DISCIPLINE_INTERFACE_CREATED = false as const;
export const D1M_R2_D1K_INTERNAL_INTEGRATION_READY = D1K_R5_INTERNAL_DISCIPLINE_INTEGRATION_READY;
export const D1M_R2_D1K_INTELLIGENCE_READY = D1K_R5_CROSS_DISCIPLINE_INTELLIGENCE_READY;
export const D1M_R2_D1L_TRACK_COMPLETE = D1L_R6_TRACK_COMPLETE;
export const D1M_R2_D1L_TRACK_STATUS = D1L_R6_TRACK_STATUS;
export const D1M_R2_OBJECT_MAPPING_EQUALS_D1L_CERTIFICATION_ELIGIBLE = false as const;
export const D1M_R2_D1N_CURRENT_STATUS = "NOT_ABSORBED" as const;
export const D1M_R2_D1N_ABSORBED = false as const;
export const D1M_R2_D1N_RUNTIME_STARTED = false as const;
export const D1M_R2_D1N_RUNTIME_COUNT = 0 as const;
export const D1M_R2_D9_ABSORBED = false as const;
export const D1M_R2_D9_RUNTIME_STARTED = false as const;
export const D1M_R2_D9_RUNTIME_COUNT = 0 as const;
export const D1M_R2_GLOBAL_CYCLE_DETECTION_RUNTIME_COUNT = 0 as const;
export const D1M_R2_D2_D8_RUNTIME_STARTED = false as const;
export const D1M_R2_D2_D8_RUNTIME_COUNT = 0 as const;
export const D1M_R2_RUNTIME_STARTED = true as const;
export const D1M_R2_RUNTIME_COUNT = 2 as const;
export const D1M_R2_DATABASE_SCHEMA_CHANGED = false as const;
export const D1M_R2_NEW_DEPENDENCY_ADDED = false as const;
export const D1M_R2_STRUCTURAL_PACK_COMPLETE = D1_STRUCTURAL_PACK_COMPLETE;
export const D1M_R2_D1G_BLOCKER_PRESERVED = D1G_LIVE_VALIDATED === false && D1G_ENGINEER_VALIDATED === false && D1G_CONFORMANCE_VALIDATED === false && D1G_CERTIFIED_SOLVER_STATUS === "NOT_CERTIFIED";
export const D1M_R2_POST_D1J_DEBT_PRESERVED = POST_D1J_STRUCTURAL_DEBT_LEDGER;
export const D1M_R2_D1K_LIMITATIONS_PRESERVED = D1M_R2_D1K_INTERNAL_INTEGRATION_READY === false && D1M_R2_D1K_INTELLIGENCE_READY === false;
export const D1M_R2_GA_SECURITY_DEBT_BLOCKS_GENERAL_AVAILABILITY = GA_SECURITY_DEBT_BLOCKS_GENERAL_AVAILABILITY;
export const D1M_R2_UNAUTHORIZED_PRODUCT_CLAIM = false as const;
export const D1M_R2_SOURCE_REFERENCE_RUNTIME_COUNT = 1 as const;
export const D1M_R2_ARTIFACT_RUNTIME_COUNT = 1 as const;
export const D1M_R3_CANONICAL_PHASE = "EOS-D1M-R3-GEOMETRY-SEMANTIC-EVIDENCE" as const;
export const D1M_R3_PHASE_TYPE = "CAD_OR_BIM_GEOMETRY_SEMANTIC_EVIDENCE" as const;
export const D1M_R3_CANONICAL_SCOPE =
  "Record governed geometry and semantic evidence for an exact D1M-R1 artifact revision and an exact D1M-R2 source-object mapping. Keep source-derived evidence distinct from validated engineering truth. Do not parse a file, infer an unknown label, convert units, or treat the evidence as structural adequacy." as const;

const FLOATING = new Set(["latest", "current", "newest", "head", "active", "active model", "current bim", "current drawing"]);
const RECORDER = "INTERFACE_RECORD_AUTHORITY";
const REVIEWER = "REVIEWER_AUTHORITY";

export type D1mR2Actor = {
  actorId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  authority: string;
};

export type D1mR2Target = {
  id: string;
  kind: StructuralObjectKind;
  tenantId: string;
  workspaceId: string;
  projectId: string;
};

export type D1mR2Catalog = {
  references: readonly D1mR1Record[];
  targets: readonly D1mR2Target[];
};

export type D1mR2Input = {
  mappingId: string;
  referenceId: string;
  expectedSourceRevision?: string;
  sourceObjectId: string;
  structuralTargetId: string;
  structuralTargetKind: string;
  evidenceId: string;
  evidenceKind: string;
  provenanceRef: string;
  predecessorMappingId?: string | null;
  ambiguous?: boolean;
  confidence?: number;
  objectContentVerified?: boolean;
  createTarget?: boolean;
  formatSupported?: boolean;
  engineeringValidated?: boolean;
  certified?: boolean;
  tenantId?: string;
  workspaceId?: string;
  projectId?: string;
};

export type D1mR2Provenance = {
  provenanceRef: string;
  evidenceId: string;
  evidenceKind: EosEvidenceSourceKind;
  actorId: string;
  recordedAt: string;
  referenceId: string;
  sourceRevision: string;
  sourceObjectId: string;
  structuralTargetId: string;
  structuralTargetKind: StructuralObjectKind;
  r1MetadataFingerprint: string;
  aiGenerated: false;
};

export type D1mR2Record = {
  mappingId: string;
  referenceId: string;
  artifactId: string;
  sourceRevision: string;
  r1MetadataFingerprint: string;
  sourceObjectId: string;
  sourceObjectOrigin: "DECLARED_SOURCE";
  sourceObjectContentVerified: false;
  structuralTargetId: string;
  structuralTargetKind: StructuralObjectKind;
  engineeringEquivalentAcrossRevisions: false;
  evidenceId: string;
  evidenceKind: EosEvidenceSourceKind;
  mappingAuthority: typeof RECORDER;
  engineeringApprover: null;
  certificationAuthority: null;
  provenance: D1mR2Provenance;
  mappingFingerprint: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  recordedBy: string;
  recordStatus: "CURRENT" | "SUPERSEDED";
  mappingStatus: "RECORDED" | "CONFIRMED";
  predecessorMappingId: string | null;
  humanReviewRecorded: boolean;
  engineeringValidated: false;
  structuralAdequacyConfirmed: false;
  certified: false;
};

export type D1mR2History = {
  historyId: string;
  mappingId: string;
  action: "CREATED" | "SUPERSEDED" | "CONFIRMED";
  referenceId: string;
  sourceRevision: string;
  sourceObjectId: string;
  structuralTargetId: string;
  mappingFingerprint: string;
  recordedAt: string;
};

export type D1mR2Store = {
  catalog: D1mR2Catalog;
  now: () => string;
  records: D1mR2Record[];
  history: D1mR2History[];
};

function fail(code: string): never {
  throw new Error(code);
}

function blockedParty(value: string): boolean {
  return /^AI(?:\b|_)/i.test(value) || /LLM/i.test(value) || /OPTIMIZER/i.test(value);
}

function floating(value: string): boolean {
  return FLOATING.has(value.trim().toLowerCase());
}

function isTargetKind(value: string): value is StructuralObjectKind {
  return (STRUCTURAL_OBJECT_KINDS as readonly string[]).includes(value);
}

function isEvidenceKind(value: string): value is EosEvidenceSourceKind {
  return (EOS_EVIDENCE_SOURCE_KINDS as readonly string[]).includes(value);
}

function assertScope(actor: D1mR2Actor, row: { tenantId: string; workspaceId: string; projectId: string }): void {
  if (actor.tenantId !== row.tenantId) fail("CROSS_TENANT_OPERATION");
  if (actor.workspaceId !== row.workspaceId || actor.projectId !== row.projectId) fail("CROSS_PROJECT_OPERATION");
}

function assertRecorder(actor: D1mR2Actor): void {
  if (!actor.actorId.trim() || !actor.tenantId.trim() || !actor.workspaceId.trim() || !actor.projectId.trim()) fail("SCOPE_REQUIRED");
  if (blockedParty(actor.actorId) || blockedParty(actor.authority)) fail("AI_NOT_MAPPING_AUTHORITY");
  if (actor.authority === "ADMINISTRATOR" || actor.authority === "ADMIN") fail("ADMIN_NOT_MAPPING_AUTHORITY");
  if (actor.authority === "ENGINEERING_APPROVAL_AUTHORITY") fail("MAPPING_AUTHORITY_NOT_ENGINEERING_APPROVAL");
  if (actor.authority === "CERTIFICATION_AUTHORITY") fail("MAPPING_AUTHORITY_NOT_CERTIFIER");
  if (actor.authority !== RECORDER) fail("UNAUTHORIZED");
}

function mappingFingerprintOf(body: {
  mappingId: string;
  referenceId: string;
  sourceRevision: string;
  r1MetadataFingerprint: string;
  sourceObjectId: string;
  structuralTargetKind: string;
  structuralTargetId: string;
  evidenceId: string;
  evidenceKind: string;
  provenanceRef: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  predecessorMappingId: string | null;
}): string {
  return fingerprintCanonical(body);
}

function remember(store: D1mR2Store, record: D1mR2Record, action: D1mR2History["action"]): void {
  store.history.push({
    historyId: `hist-${store.history.length + 1}`,
    mappingId: record.mappingId,
    action,
    referenceId: record.referenceId,
    sourceRevision: record.sourceRevision,
    sourceObjectId: record.sourceObjectId,
    structuralTargetId: record.structuralTargetId,
    mappingFingerprint: record.mappingFingerprint,
    recordedAt: store.now(),
  });
}

export function createD1mR2Store(catalog: D1mR2Catalog, now: () => string): D1mR2Store {
  return { catalog, now, records: [], history: [] };
}

export function recordSourceObjectMapping(store: D1mR2Store, actor: D1mR2Actor, input: D1mR2Input): D1mR2Record {
  assertRecorder(actor);
  if (input.tenantId != null && input.tenantId !== actor.tenantId) fail("CROSS_TENANT_OPERATION");
  if (input.workspaceId != null && input.workspaceId !== actor.workspaceId) fail("CROSS_PROJECT_OPERATION");
  if (input.projectId != null && input.projectId !== actor.projectId) fail("CROSS_PROJECT_OPERATION");
  if (input.ambiguous === true) fail("AMBIGUOUS_MAPPING_UNRESOLVED");
  if (input.confidence != null) fail("CONFIDENCE_SCORE_NOT_AUTHORITATIVE");
  if (input.objectContentVerified === true) fail("OBJECT_CONTENT_VERIFICATION_NOT_IN_R2");
  if (input.createTarget === true) fail("TARGET_AUTO_CREATE_REJECTED");
  if (input.formatSupported === true) fail("FORMAT_SUPPORT_NOT_CLAIMED");
  if (input.engineeringValidated === true) fail("ENGINEERING_VALIDATION_NOT_IN_R2");
  if (input.certified === true) fail("MAPPING_NOT_CERTIFICATION");
  if (!input.mappingId.trim() || floating(input.mappingId) || blockedParty(input.mappingId)) fail("MAPPING_IDENTITY_REQUIRED");
  if (!input.referenceId.trim()) fail("R1_REFERENCE_REQUIRED");
  if (floating(input.referenceId) || (input.expectedSourceRevision != null && floating(input.expectedSourceRevision))) {
    fail("FLOATING_ARTIFACT_REFERENCE_REJECTED");
  }
  if (!input.sourceObjectId.trim() || floating(input.sourceObjectId) || blockedParty(input.sourceObjectId)) fail("SOURCE_OBJECT_IDENTITY_REQUIRED");
  if (!input.structuralTargetId.trim() || blockedParty(input.structuralTargetId)) fail("STRUCTURAL_TARGET_INVALID");
  if (!input.evidenceId.trim() || blockedParty(input.evidenceId) || !isEvidenceKind(input.evidenceKind)) fail("MISSING_MAPPING_EVIDENCE");
  if (!input.provenanceRef.trim() || blockedParty(input.provenanceRef)) fail("MISSING_MAPPING_PROVENANCE");
  const reference = store.catalog.references.find((row) => row.referenceId === input.referenceId);
  if (!reference) fail("R1_REFERENCE_REQUIRED");
  assertScope(actor, reference);
  if (input.expectedSourceRevision != null && input.expectedSourceRevision !== reference.sourceRevision) fail("ARTIFACT_REVISION_MISMATCH");
  if (!isTargetKind(input.structuralTargetKind)) fail("STRUCTURAL_TARGET_INVALID");
  const target = store.catalog.targets.find((row) => row.id === input.structuralTargetId);
  if (!target) fail("TARGET_NOT_FOUND");
  if (target.kind !== input.structuralTargetKind) fail("TARGET_KIND_MISMATCH");
  assertScope(actor, target);
  const predecessor = input.predecessorMappingId
    ? store.records.find((row) => row.mappingId === input.predecessorMappingId)
    : null;
  if (input.predecessorMappingId) {
    if (!predecessor) fail("MAPPING_NOT_FOUND");
    assertScope(actor, predecessor);
    if (predecessor.recordStatus !== "CURRENT") fail("PREDECESSOR_NOT_CURRENT");
    if (
      predecessor.referenceId === reference.referenceId
      && predecessor.sourceObjectId === input.sourceObjectId
      && predecessor.structuralTargetId === target.id
      && predecessor.structuralTargetKind === target.kind
    ) fail("MAPPING_UNCHANGED");
  }
  const active = store.records.find((row) => row.recordStatus === "CURRENT" && row.referenceId === reference.referenceId && row.sourceObjectId === input.sourceObjectId);
  if (active && active.mappingId !== input.mappingId && active.mappingId !== predecessor?.mappingId) fail("MAPPING_CONFLICT");
  const mappingFingerprint = mappingFingerprintOf({
    mappingId: input.mappingId,
    referenceId: reference.referenceId,
    sourceRevision: reference.sourceRevision,
    r1MetadataFingerprint: reference.metadataFingerprint,
    sourceObjectId: input.sourceObjectId,
    structuralTargetKind: target.kind,
    structuralTargetId: target.id,
    evidenceId: input.evidenceId,
    evidenceKind: input.evidenceKind,
    provenanceRef: input.provenanceRef,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
    predecessorMappingId: predecessor?.mappingId ?? null,
  });
  const existing = store.records.find((row) => row.mappingId === input.mappingId);
  if (existing) {
    if (existing.mappingFingerprint === mappingFingerprint && !predecessor) return existing;
    fail("MAPPING_ALREADY_RECORDED");
  }
  const recordedAt = store.now();
  const provenance: D1mR2Provenance = {
    provenanceRef: input.provenanceRef,
    evidenceId: input.evidenceId,
    evidenceKind: input.evidenceKind,
    actorId: actor.actorId,
    recordedAt,
    referenceId: reference.referenceId,
    sourceRevision: reference.sourceRevision,
    sourceObjectId: input.sourceObjectId,
    structuralTargetId: target.id,
    structuralTargetKind: target.kind,
    r1MetadataFingerprint: reference.metadataFingerprint,
    aiGenerated: false,
  };
  const record: D1mR2Record = {
    mappingId: input.mappingId,
    referenceId: reference.referenceId,
    artifactId: reference.artifactId,
    sourceRevision: reference.sourceRevision,
    r1MetadataFingerprint: reference.metadataFingerprint,
    sourceObjectId: input.sourceObjectId,
    sourceObjectOrigin: "DECLARED_SOURCE",
    sourceObjectContentVerified: false,
    structuralTargetId: target.id,
    structuralTargetKind: target.kind,
    engineeringEquivalentAcrossRevisions: false,
    evidenceId: input.evidenceId,
    evidenceKind: input.evidenceKind,
    mappingAuthority: RECORDER,
    engineeringApprover: null,
    certificationAuthority: null,
    provenance,
    mappingFingerprint,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
    recordedBy: actor.actorId,
    recordStatus: "CURRENT",
    mappingStatus: "RECORDED",
    predecessorMappingId: predecessor?.mappingId ?? null,
    humanReviewRecorded: false,
    engineeringValidated: false,
    structuralAdequacyConfirmed: false,
    certified: false,
  };
  if (predecessor) {
    predecessor.recordStatus = "SUPERSEDED";
    remember(store, predecessor, "SUPERSEDED");
  }
  store.records.push(record);
  remember(store, record, "CREATED");
  return record;
}

export function confirmSourceObjectMapping(store: D1mR2Store, actor: D1mR2Actor, mappingId: string): D1mR2Record {
  if (!actor.actorId.trim()) fail("SCOPE_REQUIRED");
  if (blockedParty(actor.actorId) || blockedParty(actor.authority)) fail("AI_NOT_MAPPING_AUTHORITY");
  if (actor.authority === "ADMINISTRATOR" || actor.authority === "ADMIN") fail("ADMIN_NOT_MAPPING_AUTHORITY");
  if (actor.authority === "ENGINEERING_APPROVAL_AUTHORITY") fail("MAPPING_AUTHORITY_NOT_ENGINEERING_APPROVAL");
  if (actor.authority === "CERTIFICATION_AUTHORITY") fail("MAPPING_AUTHORITY_NOT_CERTIFIER");
  if (actor.authority !== REVIEWER) fail("UNAUTHORIZED");
  const record = store.records.find((row) => row.mappingId === mappingId);
  if (!record) fail("MAPPING_NOT_FOUND");
  assertScope(actor, record);
  if (record.recordStatus !== "CURRENT") fail("MAPPING_NOT_CURRENT");
  const fingerprintBefore = record.mappingFingerprint;
  record.mappingStatus = "CONFIRMED";
  record.humanReviewRecorded = true;
  record.engineeringValidated = false;
  record.structuralAdequacyConfirmed = false;
  record.certified = false;
  if (record.mappingFingerprint !== fingerprintBefore) fail("MAPPING_FINGERPRINT_MUTATED");
  remember(store, record, "CONFIRMED");
  return record;
}

export function supersedeSourceObjectMapping(store: D1mR2Store, actor: D1mR2Actor, input: D1mR2Input): D1mR2Record {
  if (!input.predecessorMappingId) fail("MAPPING_NOT_FOUND");
  return recordSourceObjectMapping(store, actor, input);
}

export function repointSourceObjectMapping(): never {
  return fail("SILENT_MAPPING_REPOINTING_REJECTED");
}

export function upgradeMappedArtifactRevision(): never {
  return fail("MAPPING_ARTIFACT_REVISION_AUTO_UPGRADE_REJECTED");
}

export function discoverSourceObjectByParsing(): never {
  return fail("OBJECT_DISCOVERY_NOT_IN_R2");
}

export function extractCadBimObjects(): never {
  return fail("OBJECT_EXTRACTION_NOT_IN_R2");
}

export function parseCadBimArtifact(): never {
  return fail("PARSE_NOT_IN_R2");
}

export function ingestCadBimFile(): never {
  return fail("FILE_INGESTION_NOT_IN_R2");
}

export function extractCadBimGeometry(): never {
  return fail("GEOMETRY_NOT_IN_R2");
}

export function extractCadBimSemantics(): never {
  return fail("SEMANTIC_NOT_IN_R2");
}

export function matchObjectByGeometry(): never {
  return fail("GEOMETRY_MATCHING_NOT_IN_R2");
}

export function matchObjectBySemantics(): never {
  return fail("SEMANTIC_MATCHING_NOT_IN_R2");
}

export function inferCadBimRelationships(): never {
  return fail("RELATIONSHIP_NOT_IN_R2");
}

export function adaptCadBimFormat(): never {
  return fail("FORMAT_ADAPTER_NOT_IN_R2");
}

export function connectCadBimVendor(): never {
  return fail("CONNECTOR_NOT_IN_R2");
}

export function convertCadBimUnits(): never {
  return fail("UNIT_CONVERSION_NOT_IN_R2");
}

export function transformCadBimCoordinates(): never {
  return fail("COORDINATE_TRANSFORMATION_NOT_IN_R2");
}

export function inferCadBimAxes(): never {
  return fail("AXIS_INFERENCE_NOT_IN_R2");
}

export function interpretCadBimEngineeringProperties(): never {
  return fail("ENGINEERING_PROPERTY_INTERPRETATION_NOT_IN_R2");
}

export function correctCadBimModel(): never {
  return fail("MODEL_CORRECTION_NOT_IN_R2");
}

export function authorCadModel(): never {
  return fail("CAD_AUTHORING_NOT_IN_R2");
}

export function authorBimModel(): never {
  return fail("BIM_AUTHORING_NOT_IN_R2");
}

export function matchObjectByAi(): never {
  return fail("AI_OBJECT_MATCHING_NOT_IN_R2");
}
