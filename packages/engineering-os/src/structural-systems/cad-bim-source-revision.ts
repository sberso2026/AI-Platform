/**
 * EOS-D1M-R1 CAD or BIM artifact source-revision foundation.
 * In-memory reference records only. No parser, file payload, connector, or object mapping.
 */
import { D1K_SOURCE_CLASSES } from "@rtb/types";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
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

export const D1M_R1_PHASE = "EOS-D1M-R1-CAD-OR-BIM-ARTIFACT-SOURCE-REVISION-FOUNDATION" as const;
export const D1M_R1_PHASE_TYPE = "CAD_OR_BIM_ARTIFACT_SOURCE_REVISION_FOUNDATION" as const;
export const D1M_R1_STATUS = "SOURCE_REVISION_FOUNDATION_IMPLEMENTED" as const;
export const D1M_R1_MATURITY_STATE = "STRUCTURAL_CAD_OR_BIM_ARTIFACT_SOURCE_REVISION_FOUNDATION_IMPLEMENTED" as const;
export const D1M_R1_CLOSEOUT_PATH =
  "docs/architecture/engineering-os/EOS_D1M_R1_CAD_OR_BIM_ARTIFACT_SOURCE_REVISION_FOUNDATION_CLOSEOUT.md" as const;
export const D1M_R1_PARENT_ARCHITECTURE_PATH =
  "docs/architecture/engineering-os/EOS_D1M_0_CAD_OR_BIM_INTELLIGENCE_ARCHITECTURE.md" as const;
export const D1M_R1_CANONICAL_SCOPE =
  "Record one governed reference to an exact CAD or BIM source artifact revision, including source class, authority, provenance, content fingerprint, and tenant, workspace, and project scope. Do not parse the artifact, ingest a file, map an object, extract geometry, convert units, infer axes, start a connector, or treat the reference as engineering validation." as const;

export const D1M_R1_SOURCE_REFERENCE_RUNTIME_READY = true as const;
export const D1M_R1_MODEL_EVIDENCE_RUNTIME_READY = false as const;
export const D1M_R1_FORMAT_ADAPTER_RUNTIME_READY = false as const;
export const D1M_R1_STRUCTURAL_INTERPRETATION_RUNTIME_READY = false as const;
export const D1M_R1_CHANGE_GOVERNANCE_RUNTIME_READY = false as const;
export const D1M_R1_ARCHITECTURE_READY = true as const;
export const D1M_R1_RUNTIME_STARTED = true as const;
export const D1M_R1_RUNTIME_COUNT = 1 as const;
export const D1M_R1_SOURCE_REFERENCE_RUNTIME_IMPLEMENTED = true as const;
export const D1M_R1_SOURCE_REFERENCE_RUNTIME_COUNT = 1 as const;
export const D1M_R1_ARTIFACT_RUNTIME_IMPLEMENTED = true as const;
export const D1M_R1_ARTIFACT_RUNTIME_COUNT = 1 as const;
export const D1M_R1_EXACT_SOURCE_REVISION_REQUIRED = true as const;
export const D1M_R1_FLOATING_CAD_BIM_SOURCE_ALLOWED = false as const;
export const D1M_R1_FLOATING_SOURCE_AUTO_RESOLUTION_IMPLEMENTED = false as const;
export const D1M_R1_SOURCE_REFERENCE_AUTO_UPGRADED = false as const;
export const D1M_R1_DISPLAY_NAME_EQUALS_SOURCE_IDENTITY = false as const;
export const D1M_R1_CANONICAL_SOURCE_CLASSIFICATION_REUSED = true as const;
export const D1M_R1_SOURCE_CLASSES = D1K_SOURCE_CLASSES;
export const D1M_R1_FREEFORM_SOURCE_CLASSIFICATION_ALLOWED = false as const;
export const D1M_R1_SOURCE_SYSTEM_IDENTITY_IMPLIES_LIVE_CONNECTOR = false as const;
export const D1M_R1_SOURCE_AUTHORITY_PRESERVED = true as const;
export const D1M_R1_SOURCE_PROVENANCE_PRESERVED = true as const;
export const D1M_R1_MODEL_AUTHOR_EQUALS_ENGINEERING_APPROVER = false as const;
export const D1M_R1_SOURCE_AUTHORITY_EQUALS_CERTIFICATION_AUTHORITY = false as const;
export const D1M_R1_ADMIN_EQUALS_SOURCE_ENGINEERING_AUTHORITY = false as const;
export const D1M_R1_AI_EQUALS_SOURCE_AUTHORITY = false as const;
export const D1M_R1_CONTENT_FINGERPRINT_SUPPORTED = true as const;
export const D1M_R1_CONTENT_FINGERPRINT_IMPLEMENTED = true as const;
export const D1M_R1_SOURCE_REVISION_EQUALS_CONTENT_FINGERPRINT = false as const;
export const D1M_R1_IDENTICAL_CONTENT_EQUALS_ENGINEERING_EQUIVALENCE = false as const;
export const D1M_R1_CANONICAL_FINGERPRINT_REUSED = true as const;
export const D1M_R1_SECOND_FINGERPRINT_ALGORITHM_CREATED = false as const;
export const D1M_R1_SCOPE_ENFORCED = true as const;
export const D1M_R1_CROSS_WORKSPACE_ARTIFACT_REFERENCE_ALLOWED = false as const;
export const D1M_R1_SOURCE_REFERENCE_EQUALS_SOURCE_PAYLOAD = false as const;
export const D1M_R1_SOURCE_REFERENCE_EQUALS_PARSED_MODEL = false as const;
export const D1M_R1_SOURCE_REFERENCE_RECORDED_EQUALS_FORMAT_SUPPORTED = false as const;
export const D1M_R1_SOURCE_REFERENCE_RECORDED_EQUALS_ENGINEERING_VALIDATED = false as const;
export const D1M_R1_SOURCE_REVISION_PINNED_EQUALS_ENGINEERING_VALIDATED = false as const;
export const D1M_R1_CONTENT_FINGERPRINT_VERIFIED_EQUALS_ENGINEERING_VALIDATED = false as const;
export const D1M_R1_SOURCE_MODEL_APPROVED_EQUALS_EOS_ENGINEERING_APPROVED = false as const;
export const D1M_R1_SOURCE_MODEL_PUBLISHED_EQUALS_EOS_CERTIFIED = false as const;
export const D1M_R1_SILENT_SOURCE_REPOINTING_ALLOWED = false as const;
export const D1M_R1_SOURCE_REFERENCE_HISTORY_PRESERVED = true as const;
export const D1M_R1_SOURCE_SPOOFING_PROTECTION_IMPLEMENTED = true as const;
export const D1M_R1_D1A_STRUCTURAL_IDENTITY_REUSED = true as const;
export const D1M_R1_PARALLEL_STRUCTURAL_IDENTITY_CREATED = false as const;
export const D1M_R1_D1K_SOURCE_REFERENCE_PRIMITIVES_REUSED = true as const;
export const D1M_R1_D1K_CROSS_DISCIPLINE_GOVERNANCE_REUSED = true as const;
export const D1M_R1_PARALLEL_CROSS_DISCIPLINE_INTERFACE_CREATED = false as const;
export const D1M_R1_D1K_INTERNAL_INTEGRATION_READY = D1K_R5_INTERNAL_DISCIPLINE_INTEGRATION_READY;
export const D1M_R1_D1K_INTELLIGENCE_READY = D1K_R5_CROSS_DISCIPLINE_INTELLIGENCE_READY;
export const D1M_R1_D1L_TRACK_COMPLETE = D1L_R6_TRACK_COMPLETE;
export const D1M_R1_D1L_TRACK_STATUS = D1L_R6_TRACK_STATUS;
export const D1M_R1_SOURCE_REFERENCE_EQUALS_D1L_CERTIFICATION_ELIGIBLE = false as const;
export const D1M_R1_AI_CAN_INVENT_SOURCE_ARTIFACT_IDENTITY = false as const;
export const D1M_R1_AI_CAN_INVENT_SOURCE_REVISION = false as const;
export const D1M_R1_AI_CAN_INVENT_CONTENT_FINGERPRINT = false as const;
export const D1M_R1_AI_CAN_INVENT_SOURCE_AUTHORITY = false as const;
export const D1M_R1_AI_CAN_INVENT_SOURCE_PROVENANCE = false as const;
export const D1M_R1_AI_CAN_MARK_SOURCE_ENGINEERING_VALIDATED = false as const;
export const D1M_R1_OBJECT_RUNTIME_COUNT = 0 as const;
export const D1M_R1_OBJECT_MAPPING_RUNTIME_COUNT = 0 as const;
export const D1M_R1_PARSE_RUNTIME_COUNT = 0 as const;
export const D1M_R1_FILE_INGESTION_RUNTIME_COUNT = 0 as const;
export const D1M_R1_GEOMETRY_RUNTIME_COUNT = 0 as const;
export const D1M_R1_SEMANTIC_RUNTIME_COUNT = 0 as const;
export const D1M_R1_RELATIONSHIP_RUNTIME_COUNT = 0 as const;
export const D1M_R1_CHANGE_DETECTION_RUNTIME_COUNT = 0 as const;
export const D1M_R1_CAD_AUTHORING_RUNTIME_COUNT = 0 as const;
export const D1M_R1_BIM_AUTHORING_RUNTIME_COUNT = 0 as const;
export const D1M_R1_GENERIC_FILE_INGESTION_RUNTIME_COUNT = 0 as const;
export const D1M_R1_NEW_EXTERNAL_CONNECTOR_RUNTIME_COUNT = 0 as const;
export const D1M_R1_GEOMETRY_TRANSFORMATION_RUNTIME_COUNT = 0 as const;
export const D1M_R1_COORDINATE_TRANSFORMATION_RUNTIME_COUNT = 0 as const;
export const D1M_R1_UNIT_CONVERSION_RUNTIME_COUNT = 0 as const;
export const D1M_R1_AXIS_INFERENCE_RUNTIME_COUNT = 0 as const;
export const D1M_R1_AUTOMATIC_MODEL_CORRECTION_RUNTIME_COUNT = 0 as const;
export const D1M_R1_D2_D8_RUNTIME_STARTED = false as const;
export const D1M_R1_D2_D8_RUNTIME_COUNT = 0 as const;
export const D1M_R1_D9_RUNTIME_STARTED = false as const;
export const D1M_R1_D9_RUNTIME_COUNT = 0 as const;
export const D1M_R1_GLOBAL_CYCLE_DETECTION_RUNTIME_COUNT = 0 as const;
export const D1M_R1_D1N_CURRENT_STATUS = "NOT_ABSORBED" as const;
export const D1M_R1_D1N_ABSORBED = false as const;
export const D1M_R1_D1N_RUNTIME_STARTED = false as const;
export const D1M_R1_D1N_RUNTIME_COUNT = 0 as const;
export const D1M_R1_D9_ABSORBED = false as const;
export const D1M_R1_DATABASE_SCHEMA_CHANGED = false as const;
export const D1M_R1_NEW_DEPENDENCY_ADDED = false as const;
export const D1M_R1_STRUCTURAL_PACK_COMPLETE = D1_STRUCTURAL_PACK_COMPLETE;
export const D1M_R1_D1G_BLOCKER_PRESERVED = D1G_LIVE_VALIDATED === false && D1G_ENGINEER_VALIDATED === false && D1G_CONFORMANCE_VALIDATED === false && D1G_CERTIFIED_SOLVER_STATUS === "NOT_CERTIFIED";
export const D1M_R1_POST_D1J_DEBT_PRESERVED = POST_D1J_STRUCTURAL_DEBT_LEDGER;
export const D1M_R1_D1K_LIMITATIONS_PRESERVED = D1M_R1_D1K_INTERNAL_INTEGRATION_READY === false && D1M_R1_D1K_INTELLIGENCE_READY === false;
export const D1M_R1_GA_SECURITY_DEBT_BLOCKS_GENERAL_AVAILABILITY = GA_SECURITY_DEBT_BLOCKS_GENERAL_AVAILABILITY;
export const D1M_R1_UNAUTHORIZED_PRODUCT_CLAIM = false as const;
export const D1M_R1_CANONICAL_DIGITAL_THREAD_REUSED = true as const;
export const D1M_R1_PARALLEL_DIGITAL_THREAD_CREATED = false as const;
export const D1M_R2_CANONICAL_PHASE = "EOS-D1M-R2-SOURCE-OBJECT-STRUCTURAL-TARGET-MAPPING" as const;
export const D1M_R2_PHASE_TYPE = "CAD_OR_BIM_SOURCE_OBJECT_STRUCTURAL_TARGET_MAPPING" as const;
export const D1M_R2_CANONICAL_SCOPE =
  "Record a governed mapping from one source-model object identity on an exact D1M-R1 artifact revision to one existing D1A structural target. Preserve mapping evidence, authority, provenance, fingerprint, and history. Do not extract geometry or semantics, parse a file, ingest a payload, approve the mapping by AI, or treat the mapping as engineering validation." as const;

const FLOATING_REVISIONS = new Set([
  "latest",
  "current",
  "newest",
  "head",
  "active model",
  "current bim",
  "current drawing",
]);
const RECORDER_AUTHORITY = "INTERFACE_RECORD_AUTHORITY";
const SOURCE_AUTHORITY = "SOURCE_AUTHORITY";

export type D1mR1Actor = {
  actorId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  authority: string;
};

export type D1mR1StructuralContext = {
  id: string;
  kind: "STRUCTURAL_SYSTEM";
  tenantId: string;
  workspaceId: string;
  projectId: string;
};

export type D1mR1Catalog = {
  contexts: readonly D1mR1StructuralContext[];
};

export type D1mR1Input = {
  referenceId: string;
  artifactId: string;
  displayName: string;
  sourceClass: string;
  sourceSystemId: string;
  sourceRevision: string;
  sourceLocator: string | null;
  declaredFormat: string | null;
  sourceWorkflowState: string | null;
  provenanceRef: string;
  evidenceId: string;
  contentFingerprint: string;
  fingerprintProvenanceRef: string;
  fingerprintEvidenceId: string;
  structuralSystemId: string;
  sourceAuthority?: string;
  predecessorReferenceId?: string | null;
  payload?: unknown;
  fileBytes?: unknown;
  liveConnector?: boolean;
  formatSupported?: boolean;
  supportedFormats?: readonly string[];
  engineeringValidated?: boolean;
  eosApproved?: boolean;
  certified?: boolean;
  eosVerifiedFingerprint?: boolean;
  structuralObjectId?: string;
  tenantId?: string;
  workspaceId?: string;
  projectId?: string;
};

export type D1mR1Provenance = {
  provenanceRef: string;
  evidenceId: string;
  actorId: string;
  recordedAt: string;
  sourceClass: (typeof D1K_SOURCE_CLASSES)[number];
  sourceSystemId: string;
  sourceRevision: string;
  sourceAuthority: typeof SOURCE_AUTHORITY;
  contentFingerprint: string;
  fingerprintProvenanceRef: string;
  fingerprintEvidenceId: string;
  contentFingerprintOrigin: "DECLARED_SOURCE";
  tenantId: string;
  workspaceId: string;
  projectId: string;
  aiGenerated: false;
};

export type D1mR1Record = {
  referenceId: string;
  artifactId: string;
  displayName: string;
  sourceClass: (typeof D1K_SOURCE_CLASSES)[number];
  sourceSystemId: string;
  sourceRevision: string;
  sourceLocator: string | null;
  declaredFormat: string | null;
  formatSupported: false;
  adapterSupport: "NOT_CLAIMED";
  sourceWorkflowState: string | null;
  eosEngineeringApproved: false;
  certified: false;
  engineeringValidated: false;
  engineeringEquivalence: false;
  parsedModel: null;
  payloadStored: false;
  sourceSystemLiveConnector: false;
  structuralSystemId: string;
  structuralTargetKind: "STRUCTURAL_SYSTEM";
  sourceAuthority: typeof SOURCE_AUTHORITY;
  engineeringApprover: null;
  certificationAuthority: null;
  contentFingerprint: string;
  contentFingerprintOrigin: "DECLARED_SOURCE";
  contentFingerprintEosVerified: false;
  metadataFingerprint: string;
  provenance: D1mR1Provenance;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  recordedBy: string;
  recordStatus: "CURRENT" | "SUPERSEDED";
  predecessorReferenceId: string | null;
  referenceStatus: "RECORDED";
};

export type D1mR1History = {
  historyId: string;
  referenceId: string;
  action: "CREATED" | "SUPERSEDED";
  artifactId: string;
  sourceRevision: string;
  contentFingerprint: string;
  metadataFingerprint: string;
  actorId: string;
  authority: typeof SOURCE_AUTHORITY;
  recordedAt: string;
};

export type D1mR1Store = {
  catalog: D1mR1Catalog;
  now: () => string;
  records: D1mR1Record[];
  history: D1mR1History[];
};

function fail(code: string): never {
  throw new Error(code);
}

function blockedParty(value: string): boolean {
  return /^AI(?:\b|_)/i.test(value) || /LLM/i.test(value) || /OPTIMIZER/i.test(value);
}

function isSourceClass(value: string): value is (typeof D1K_SOURCE_CLASSES)[number] {
  return (D1K_SOURCE_CLASSES as readonly string[]).includes(value);
}

function assertExactRevision(revision: string): void {
  const token = revision.trim().toLowerCase();
  if (!token) fail("SOURCE_REVISION_REQUIRED");
  if (FLOATING_REVISIONS.has(token)) fail("FLOATING_SOURCE_REJECTED");
}

function assertLocator(locator: string | null): void {
  if (locator == null || locator === "") return;
  const value = locator.trim();
  if (!value || value.includes("..") || /^file:/i.test(value) || /^[a-zA-Z]:[\\/]/.test(value) || value.startsWith("/") || value.startsWith("\\")) {
    fail("SOURCE_LOCATOR_REJECTED");
  }
}

function assertActor(actor: D1mR1Actor): void {
  if (!actor.actorId.trim() || !actor.tenantId.trim() || !actor.workspaceId.trim() || !actor.projectId.trim()) fail("SCOPE_REQUIRED");
  if (blockedParty(actor.actorId) || blockedParty(actor.authority)) fail("AI_NOT_SOURCE_AUTHORITY");
  if (actor.authority === "ADMINISTRATOR" || actor.authority === "ADMIN") fail("ADMIN_NOT_SOURCE_AUTHORITY");
  if (actor.authority === "ENGINEERING_APPROVAL_AUTHORITY") fail("MODEL_AUTHOR_NOT_ENGINEERING_APPROVER");
  if (actor.authority === "CERTIFICATION_AUTHORITY") fail("SOURCE_AUTHORITY_NOT_CERTIFIER");
  if (actor.authority !== RECORDER_AUTHORITY) fail("UNAUTHORIZED");
}

function assertCallerScope(actor: D1mR1Actor, input: D1mR1Input): void {
  if (input.tenantId != null && input.tenantId !== actor.tenantId) fail("CROSS_TENANT_OPERATION");
  if (input.workspaceId != null && input.workspaceId !== actor.workspaceId) fail("CROSS_PROJECT_OPERATION");
  if (input.projectId != null && input.projectId !== actor.projectId) fail("CROSS_PROJECT_OPERATION");
}

function assertSourceAuthority(authority: string): void {
  if (blockedParty(authority)) fail("AI_NOT_SOURCE_AUTHORITY");
  if (authority === "ADMINISTRATOR" || authority === "ADMIN") fail("ADMIN_NOT_SOURCE_AUTHORITY");
  if (authority === "ENGINEERING_APPROVAL_AUTHORITY") fail("MODEL_AUTHOR_NOT_ENGINEERING_APPROVER");
  if (authority === "CERTIFICATION_AUTHORITY") fail("SOURCE_AUTHORITY_NOT_CERTIFIER");
  if (authority !== SOURCE_AUTHORITY) fail("SOURCE_AUTHORITY_INVALID");
}

function assertProhibited(input: D1mR1Input): void {
  if (input.payload != null || input.fileBytes != null) fail("SOURCE_PAYLOAD_NOT_IN_R1");
  if (input.liveConnector === true) fail("CONNECTOR_NOT_IN_R1");
  if (input.formatSupported === true || (input.supportedFormats != null && input.supportedFormats.length > 0)) fail("FORMAT_SUPPORT_NOT_CLAIMED");
  if (input.engineeringValidated === true) fail("ENGINEERING_VALIDATION_NOT_IN_R1");
  if (input.eosApproved === true) fail("SOURCE_APPROVAL_NOT_EOS_APPROVAL");
  if (input.certified === true) fail("SOURCE_PUBLISHED_NOT_CERTIFIED");
  if (input.eosVerifiedFingerprint === true) fail("FINGERPRINT_VERIFICATION_NOT_IN_R1");
  if (input.structuralObjectId != null && input.structuralObjectId !== "") fail("OBJECT_MAPPING_NOT_IN_R1");
}

function metadataFingerprintOf(body: {
  referenceId: string;
  artifactId: string;
  sourceClass: string;
  sourceSystemId: string;
  sourceRevision: string;
  sourceLocator: string | null;
  contentFingerprint: string;
  fingerprintProvenanceRef: string;
  fingerprintEvidenceId: string;
  provenanceRef: string;
  evidenceId: string;
  structuralSystemId: string;
  sourceAuthority: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  predecessorReferenceId: string | null;
}): string {
  return fingerprintCanonical(body);
}

function remember(store: D1mR1Store, record: D1mR1Record, action: D1mR1History["action"]): void {
  store.history.push({
    historyId: `hist-${store.history.length + 1}`,
    referenceId: record.referenceId,
    action,
    artifactId: record.artifactId,
    sourceRevision: record.sourceRevision,
    contentFingerprint: record.contentFingerprint,
    metadataFingerprint: record.metadataFingerprint,
    actorId: record.recordedBy,
    authority: record.sourceAuthority,
    recordedAt: store.now(),
  });
}

export function createD1mR1Store(catalog: D1mR1Catalog, now: () => string): D1mR1Store {
  return { catalog, now, records: [], history: [] };
}

export function recordCadBimSourceRevision(store: D1mR1Store, actor: D1mR1Actor, input: D1mR1Input): D1mR1Record {
  assertActor(actor);
  assertCallerScope(actor, input);
  assertProhibited(input);
  if (!input.referenceId.trim() || FLOATING_REVISIONS.has(input.referenceId.trim().toLowerCase())) fail("REFERENCE_IDENTITY_REQUIRED");
  if (!input.artifactId.trim() || FLOATING_REVISIONS.has(input.artifactId.trim().toLowerCase())) fail("ARTIFACT_IDENTITY_REQUIRED");
  if (!input.displayName.trim()) fail("DISPLAY_NAME_REQUIRED");
  if (!isSourceClass(input.sourceClass)) fail("SOURCE_CLASS_INVALID");
  if (!input.sourceSystemId.trim() || blockedParty(input.sourceSystemId)) fail("SOURCE_SYSTEM_IDENTITY_REQUIRED");
  assertExactRevision(input.sourceRevision);
  assertLocator(input.sourceLocator);
  assertSourceAuthority(input.sourceAuthority ?? SOURCE_AUTHORITY);
  if (!input.provenanceRef.trim() || blockedParty(input.provenanceRef)) fail("MISSING_PROVENANCE");
  if (!input.evidenceId.trim() || blockedParty(input.evidenceId)) fail("MISSING_PROVENANCE");
  if (!input.contentFingerprint.trim()) fail("MISSING_CONTENT_FINGERPRINT");
  if (blockedParty(input.contentFingerprint)) fail("AI_FINGERPRINT_REJECTED");
  if (!input.fingerprintProvenanceRef.trim() || !input.fingerprintEvidenceId.trim() || blockedParty(input.fingerprintProvenanceRef)) {
    fail("MISSING_FINGERPRINT_PROVENANCE");
  }
  const context = store.catalog.contexts.find((row) => row.id === input.structuralSystemId);
  if (!context || context.kind !== "STRUCTURAL_SYSTEM") fail("STRUCTURAL_CONTEXT_REQUIRED");
  if (context.tenantId !== actor.tenantId) fail("CROSS_TENANT_OPERATION");
  if (context.workspaceId !== actor.workspaceId || context.projectId !== actor.projectId) fail("CROSS_PROJECT_OPERATION");
  const predecessor = input.predecessorReferenceId
    ? store.records.find((row) => row.referenceId === input.predecessorReferenceId)
    : null;
  if (input.predecessorReferenceId) {
    if (!predecessor) fail("REFERENCE_NOT_FOUND");
    if (predecessor.tenantId !== actor.tenantId) fail("CROSS_TENANT_OPERATION");
    if (predecessor.workspaceId !== actor.workspaceId || predecessor.projectId !== actor.projectId) fail("CROSS_PROJECT_OPERATION");
    if (predecessor.recordStatus !== "CURRENT") fail("PREDECESSOR_NOT_CURRENT");
    if (predecessor.sourceRevision === input.sourceRevision && predecessor.contentFingerprint === input.contentFingerprint) {
      fail("SOURCE_REVISION_UNCHANGED");
    }
  }
  const metadataFingerprint = metadataFingerprintOf({
    referenceId: input.referenceId,
    artifactId: input.artifactId,
    sourceClass: input.sourceClass,
    sourceSystemId: input.sourceSystemId,
    sourceRevision: input.sourceRevision.trim(),
    sourceLocator: input.sourceLocator,
    contentFingerprint: input.contentFingerprint,
    fingerprintProvenanceRef: input.fingerprintProvenanceRef,
    fingerprintEvidenceId: input.fingerprintEvidenceId,
    provenanceRef: input.provenanceRef,
    evidenceId: input.evidenceId,
    structuralSystemId: context.id,
    sourceAuthority: SOURCE_AUTHORITY,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
    predecessorReferenceId: predecessor?.referenceId ?? null,
  });
  const existing = store.records.find((row) => row.referenceId === input.referenceId);
  if (existing) {
    if (existing.metadataFingerprint === metadataFingerprint && !predecessor) return existing;
    fail("REFERENCE_ALREADY_RECORDED");
  }
  const recordedAt = store.now();
  const provenance: D1mR1Provenance = {
    provenanceRef: input.provenanceRef,
    evidenceId: input.evidenceId,
    actorId: actor.actorId,
    recordedAt,
    sourceClass: input.sourceClass,
    sourceSystemId: input.sourceSystemId,
    sourceRevision: input.sourceRevision.trim(),
    sourceAuthority: SOURCE_AUTHORITY,
    contentFingerprint: input.contentFingerprint,
    fingerprintProvenanceRef: input.fingerprintProvenanceRef,
    fingerprintEvidenceId: input.fingerprintEvidenceId,
    contentFingerprintOrigin: "DECLARED_SOURCE",
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
    aiGenerated: false,
  };
  const record: D1mR1Record = {
    referenceId: input.referenceId,
    artifactId: input.artifactId,
    displayName: input.displayName,
    sourceClass: input.sourceClass,
    sourceSystemId: input.sourceSystemId,
    sourceRevision: input.sourceRevision.trim(),
    sourceLocator: input.sourceLocator,
    declaredFormat: input.declaredFormat,
    formatSupported: false,
    adapterSupport: "NOT_CLAIMED",
    sourceWorkflowState: input.sourceWorkflowState,
    eosEngineeringApproved: false,
    certified: false,
    engineeringValidated: false,
    engineeringEquivalence: false,
    parsedModel: null,
    payloadStored: false,
    sourceSystemLiveConnector: false,
    structuralSystemId: context.id,
    structuralTargetKind: "STRUCTURAL_SYSTEM",
    sourceAuthority: SOURCE_AUTHORITY,
    engineeringApprover: null,
    certificationAuthority: null,
    contentFingerprint: input.contentFingerprint,
    contentFingerprintOrigin: "DECLARED_SOURCE",
    contentFingerprintEosVerified: false,
    metadataFingerprint,
    provenance,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
    recordedBy: actor.actorId,
    recordStatus: "CURRENT",
    predecessorReferenceId: predecessor?.referenceId ?? null,
    referenceStatus: "RECORDED",
  };
  if (predecessor) {
    predecessor.recordStatus = "SUPERSEDED";
    remember(store, predecessor, "SUPERSEDED");
  }
  store.records.push(record);
  remember(store, record, "CREATED");
  return record;
}

export function supersedeCadBimSourceRevision(store: D1mR1Store, actor: D1mR1Actor, input: D1mR1Input): D1mR1Record {
  if (!input.predecessorReferenceId) fail("REFERENCE_NOT_FOUND");
  return recordCadBimSourceRevision(store, actor, input);
}

export function inspectCadBimSourceRevision(store: D1mR1Store, actor: D1mR1Actor, referenceId: string): D1mR1Record {
  assertActor(actor);
  const record = store.records.find((row) => row.referenceId === referenceId);
  if (!record) fail("REFERENCE_NOT_FOUND");
  if (record.tenantId !== actor.tenantId) fail("CROSS_TENANT_OPERATION");
  if (record.workspaceId !== actor.workspaceId || record.projectId !== actor.projectId) fail("CROSS_PROJECT_OPERATION");
  return record;
}

export function repointCadBimSourceRevision(): never {
  return fail("SILENT_SOURCE_REPOINTING_REJECTED");
}

export function upgradeCadBimSourceToLatest(): never {
  return fail("FLOATING_SOURCE_AUTO_RESOLUTION_REJECTED");
}

export function parseCadBimArtifact(): never {
  return fail("PARSE_NOT_IN_R1");
}

export function ingestCadBimFile(): never {
  return fail("FILE_INGESTION_NOT_IN_R1");
}

export function extractCadBimGeometry(): never {
  return fail("GEOMETRY_NOT_IN_R1");
}

export function extractCadBimSemantics(): never {
  return fail("SEMANTIC_NOT_IN_R1");
}

export function extractCadBimRelationships(): never {
  return fail("RELATIONSHIP_NOT_IN_R1");
}

export function connectCadBimVendor(): never {
  return fail("CONNECTOR_NOT_IN_R1");
}

export function convertCadBimUnits(): never {
  return fail("UNIT_CONVERSION_NOT_IN_R1");
}

export function transformCadBimCoordinates(): never {
  return fail("COORDINATE_TRANSFORMATION_NOT_IN_R1");
}

export function inferCadBimAxes(): never {
  return fail("AXIS_INFERENCE_NOT_IN_R1");
}

export function correctCadBimModel(): never {
  return fail("MODEL_CORRECTION_NOT_IN_R1");
}

export function authorCadModel(): never {
  return fail("CAD_AUTHORING_NOT_IN_R1");
}

export function authorBimModel(): never {
  return fail("BIM_AUTHORING_NOT_IN_R1");
}

export function mapCadBimObjectToStructuralTarget(): never {
  return fail("OBJECT_MAPPING_NOT_IN_R1");
}

export function markCadBimSourceEngineeringValidated(): never {
  return fail("ENGINEERING_VALIDATION_NOT_IN_R1");
}
