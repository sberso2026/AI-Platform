/**
 * EOS-D1M-R5 explicit model relationship evidence.
 * Records a declared relationship between exact mapped endpoints. It does not infer connectivity or a load path.
 */
import {
  BIM_CONNECTIVITY_EQUALS_VALIDATED_STRUCTURAL_CONNECTIVITY,
  D1M_0_SOURCE_RELATIONSHIP_KINDS,
  MODEL_RELATIONSHIP_EQUALS_ENGINEERING_LOAD_PATH,
} from "@rtb/types";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import type { D1mR2Record } from "./cad-bim-object-mapping";
import type { D1mR3Record } from "./cad-bim-model-evidence";
import type { D1mR4Record } from "./cad-bim-reference-context";
import { D1M_R5_CANONICAL_PHASE, D1M_R5_CANONICAL_SCOPE } from "./cad-bim-reference-context";
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

export const D1M_R5_PHASE = D1M_R5_CANONICAL_PHASE;
export const D1M_R5_PHASE_TYPE = "CAD_OR_BIM_MODEL_RELATIONSHIP_EVIDENCE" as const;
export const D1M_R5_STATUS = "MODEL_RELATIONSHIP_EVIDENCE_IMPLEMENTED" as const;
export const D1M_R5_MATURITY_STATE = "STRUCTURAL_CAD_OR_BIM_MODEL_RELATIONSHIP_EVIDENCE_IMPLEMENTED" as const;
export const D1M_R5_SCOPE = D1M_R5_CANONICAL_SCOPE;
export const D1M_R5_CLOSEOUT_PATH = "docs/architecture/engineering-os/EOS_D1M_R5_MODEL_RELATIONSHIP_EVIDENCE_CLOSEOUT.md" as const;
export const D1M_R5_PARENT_ARCHITECTURE_PATH = "docs/architecture/engineering-os/EOS_D1M_0_CAD_OR_BIM_INTELLIGENCE_ARCHITECTURE.md" as const;
export const D1M_R5_R1_CLOSEOUT_PATH = "docs/architecture/engineering-os/EOS_D1M_R1_CAD_OR_BIM_ARTIFACT_SOURCE_REVISION_FOUNDATION_CLOSEOUT.md" as const;
export const D1M_R5_R2_CLOSEOUT_PATH = "docs/architecture/engineering-os/EOS_D1M_R2_SOURCE_OBJECT_STRUCTURAL_TARGET_MAPPING_CLOSEOUT.md" as const;
export const D1M_R5_R3_CLOSEOUT_PATH = "docs/architecture/engineering-os/EOS_D1M_R3_GEOMETRY_SEMANTIC_EVIDENCE_CLOSEOUT.md" as const;
export const D1M_R5_R4_CLOSEOUT_PATH = "docs/architecture/engineering-os/EOS_D1M_R4_UNIT_COORDINATE_AXIS_REFERENCE_CLOSEOUT.md" as const;
export const D1M_R5_RELATIONSHIP_TYPES = D1M_0_SOURCE_RELATIONSHIP_KINDS;
export const D1M_R5_ARCHITECTURE_READY = true as const;
export const D1M_R5_SOURCE_REFERENCE_RUNTIME_READY = true as const;
export const D1M_R5_MODEL_EVIDENCE_RUNTIME_READY = true as const;
export const D1M_R5_FORMAT_ADAPTER_RUNTIME_READY = false as const;
export const D1M_R5_STRUCTURAL_INTERPRETATION_RUNTIME_READY = false as const;
export const D1M_R5_CHANGE_GOVERNANCE_RUNTIME_READY = false as const;
export const D1M_R5_R1_REUSED = true as const;
export const D1M_R5_PARALLEL_ARTIFACT_REFERENCE_CREATED = false as const;
export const D1M_R5_R2_REUSED = true as const;
export const D1M_R5_PARALLEL_MAPPING_ENGINE_CREATED = false as const;
export const D1M_R5_R3_REUSED = true as const;
export const D1M_R5_R4_REUSED = true as const;
export const D1M_R5_EXACT_ENDPOINT_BINDING_REQUIRED = true as const;
export const D1M_R5_CROSS_ARTIFACT_POLICY_GOVERNED = true as const;
export const D1M_R5_RELATIONSHIP_RUNTIME_IMPLEMENTED = true as const;
export const D1M_R5_RELATIONSHIP_RUNTIME_COUNT = 1 as const;
export const D1M_R5_RELATIONSHIP_IDENTITY_IMPLEMENTED = true as const;
export const D1M_R5_TYPE_ALLOWLIST_ENFORCED = true as const;
export const D1M_R5_FREEFORM_TYPE_ALLOWED = false as const;
export const D1M_R5_SOURCE_TYPE_EQUALS_ENGINEERING_TYPE = false as const;
export const D1M_R5_DIRECTION_PRESERVED = true as const;
export const D1M_R5_ENDPOINT_ROLE_PRESERVED = true as const;
export const D1M_R5_DUPLICATE_GOVERNED = true as const;
export const D1M_R5_EVIDENCE_PRESERVED = true as const;
export const D1M_R5_AUTHORITY_PRESERVED = true as const;
export const D1M_R5_PROVENANCE_PRESERVED = true as const;
export const D1M_R5_FINGERPRINT_IMPLEMENTED = true as const;
export const D1M_R5_CANONICAL_FINGERPRINT_REUSED = true as const;
export const D1M_R5_SECOND_FINGERPRINT_ALGORITHM_CREATED = false as const;
export const D1M_R5_HISTORY_PRESERVED = true as const;
export const D1M_R5_AUTHORITY_EQUALS_ENGINEERING_APPROVAL = false as const;
export const D1M_R5_AUTHORITY_EQUALS_CERTIFICATION_AUTHORITY = false as const;
export const D1M_R5_ADMIN_EQUALS_ENGINEERING_AUTHORITY = false as const;
export const D1M_R5_AI_CAN_CREATE_RELATIONSHIP = false as const;
export const D1M_R5_AI_CAN_APPROVE_RELATIONSHIP = false as const;
export const D1M_R5_AI_CAN_INVENT_ENDPOINT = false as const;
export const D1M_R5_AI_CAN_INVENT_TYPE = false as const;
export const D1M_R5_AI_CAN_MARK_CONNECTIVITY_VALIDATED = false as const;
export const D1M_R5_AI_CAN_MARK_LOAD_PATH = false as const;
export const D1M_R5_AI_INFERENCE_RUNTIME_COUNT = 0 as const;
export const D1M_R5_AMBIGUOUS_AUTO_RESOLVED = false as const;
export const D1M_R5_CONFLICT_AUTO_RESOLVED = false as const;
export const D1M_R5_HUMAN_REVIEW_SUPPORTED = true as const;
export const D1M_R5_HUMAN_REVIEW_EQUALS_CONNECTIVITY_VALIDATED = false as const;
export const D1M_R5_HUMAN_REVIEW_EQUALS_LOAD_PATH_VALIDATED = false as const;
export const D1M_R5_EQUALS_STRUCTURAL_CONNECTIVITY = BIM_CONNECTIVITY_EQUALS_VALIDATED_STRUCTURAL_CONNECTIVITY;
export const D1M_R5_EQUALS_LOAD_PATH = MODEL_RELATIONSHIP_EQUALS_ENGINEERING_LOAD_PATH;
export const D1M_R5_EQUALS_STRUCTURAL_ADEQUACY = false as const;
export const D1M_R5_RECORDED_EQUALS_CONNECTIVITY_VALIDATED = false as const;
export const D1M_R5_AUTHORIZED_EQUALS_CONNECTIVITY_VALIDATED = false as const;
export const D1M_R5_RECORDED_EQUALS_LOAD_PATH_VALIDATED = false as const;
export const D1M_R5_AUTHORIZED_EQUALS_LOAD_PATH_VALIDATED = false as const;
export const D1M_R5_EVIDENCE_EQUALS_CONNECTIVITY_VALIDATED = false as const;
export const D1M_R5_EVIDENCE_EQUALS_LOAD_PATH_VALIDATED = false as const;
export const D1M_R5_FINGERPRINT_EQUALS_CONNECTIVITY_VALIDATED = false as const;
export const D1M_R5_FINGERPRINT_EQUALS_LOAD_PATH_VALIDATED = false as const;
export const D1M_R5_SILENT_MUTATION_ALLOWED = false as const;
export const D1M_R5_SILENT_ENDPOINT_REPOINTING_ALLOWED = false as const;
export const D1M_R5_REVISION_AUTO_UPGRADED = false as const;
export const D1M_R5_MAPPING_AUTO_UPGRADED = false as const;
export const D1M_R5_EVIDENCE_AUTO_UPGRADED = false as const;
export const D1M_R5_GEOMETRY_INFERENCE_RUNTIME_COUNT = 0 as const;
export const D1M_R5_SEMANTIC_INFERENCE_RUNTIME_COUNT = 0 as const;
export const D1M_R5_TOPOLOGY_INFERENCE_RUNTIME_COUNT = 0 as const;
export const D1M_R5_TRANSITIVE_INFERENCE_RUNTIME_COUNT = 0 as const;
export const D1M_R5_COMPOSITION_REASONING_RUNTIME_COUNT = 0 as const;
export const D1M_R5_CONNECTIVITY_INFERENCE_RUNTIME_COUNT = 0 as const;
export const D1M_R5_CONNECTIVITY_VALIDATION_RUNTIME_COUNT = 0 as const;
export const D1M_R5_LOAD_PATH_INFERENCE_RUNTIME_COUNT = 0 as const;
export const D1M_R5_LOAD_PATH_VALIDATION_RUNTIME_COUNT = 0 as const;
export const D1M_R5_CLASH_DETECTION_RUNTIME_COUNT = 0 as const;
export const D1M_R5_COORDINATION_RUNTIME_COUNT = 0 as const;
export const D1M_R5_GLOBAL_DEPENDENCY_REASONING_RUNTIME_COUNT = 0 as const;
export const D1M_R5_GLOBAL_CYCLE_DETECTION_RUNTIME_COUNT = 0 as const;
export const D1M_R5_REFERENCE_COMPATIBLE_EQUALS_STRUCTURALLY_VALID = false as const;
export const D1M_R5_UNIT_CONVERSION_RUNTIME_COUNT = 0 as const;
export const D1M_R5_COORDINATE_TRANSFORMATION_RUNTIME_COUNT = 0 as const;
export const D1M_R5_AXIS_INFERENCE_RUNTIME_COUNT = 0 as const;
export const D1M_R5_AXIS_TRANSFORMATION_RUNTIME_COUNT = 0 as const;
export const D1M_R5_GEOMETRY_TRANSFORMATION_RUNTIME_COUNT = 0 as const;
export const D1M_R5_PARSE_RUNTIME_COUNT = 0 as const;
export const D1M_R5_OBJECT_EXTRACTION_RUNTIME_COUNT = 0 as const;
export const D1M_R5_FILE_INGESTION_RUNTIME_COUNT = 0 as const;
export const D1M_R5_GENERIC_FILE_INGESTION_RUNTIME_COUNT = 0 as const;
export const D1M_R5_FORMAT_ADAPTER_RUNTIME_COUNT = 0 as const;
export const D1M_R5_CONNECTOR_RUNTIME_COUNT = 0 as const;
export const D1M_R5_ENGINEERING_PROPERTY_INTERPRETATION_RUNTIME_COUNT = 0 as const;
export const D1M_R5_MODEL_CORRECTION_RUNTIME_COUNT = 0 as const;
export const D1M_R5_CAD_AUTHORING_RUNTIME_COUNT = 0 as const;
export const D1M_R5_BIM_AUTHORING_RUNTIME_COUNT = 0 as const;
export const D1M_R5_SCOPE_ENFORCED = true as const;
export const D1M_R5_CROSS_WORKSPACE_ALLOWED = false as const;
export const D1M_R5_CROSS_PROJECT_ALLOWED = false as const;
export const D1M_R5_SPOOFING_PROTECTION_IMPLEMENTED = true as const;
export const D1M_R5_CANONICAL_DIGITAL_THREAD_REUSED = true as const;
export const D1M_R5_PARALLEL_DIGITAL_THREAD_CREATED = false as const;
export const D1M_R5_D1K_GOVERNANCE_REUSED = true as const;
export const D1M_R5_PARALLEL_CROSS_DISCIPLINE_INTERFACE_CREATED = false as const;
export const D1M_R5_D1K_INTERNAL_INTEGRATION_READY = D1K_R5_INTERNAL_DISCIPLINE_INTEGRATION_READY;
export const D1M_R5_D1K_INTELLIGENCE_READY = D1K_R5_CROSS_DISCIPLINE_INTELLIGENCE_READY;
export const D1M_R5_D1L_TRACK_COMPLETE = D1L_R6_TRACK_COMPLETE;
export const D1M_R5_D1L_TRACK_STATUS = D1L_R6_TRACK_STATUS;
export const D1M_R5_EQUALS_D1L_CERTIFICATION_ELIGIBLE = false as const;
export const D1M_R5_D1N_CURRENT_STATUS = "NOT_ABSORBED" as const;
export const D1M_R5_D1N_ABSORBED = false as const;
export const D1M_R5_D1N_RUNTIME_STARTED = false as const;
export const D1M_R5_D1N_RUNTIME_COUNT = 0 as const;
export const D1M_R5_D9_ABSORBED = false as const;
export const D1M_R5_D9_RUNTIME_STARTED = false as const;
export const D1M_R5_D9_RUNTIME_COUNT = 0 as const;
export const D1M_R5_D2_D8_RUNTIME_STARTED = false as const;
export const D1M_R5_D2_D8_RUNTIME_COUNT = 0 as const;
export const D1M_R5_RUNTIME_STARTED = true as const;
export const D1M_R5_RUNTIME_COUNT = 5 as const;
export const D1M_R5_DATABASE_SCHEMA_CHANGED = false as const;
export const D1M_R5_NEW_DEPENDENCY_ADDED = false as const;
export const D1M_R5_STRUCTURAL_PACK_COMPLETE = D1_STRUCTURAL_PACK_COMPLETE;
export const D1M_R5_D1G_BLOCKER_PRESERVED = D1G_LIVE_VALIDATED === false && D1G_ENGINEER_VALIDATED === false && D1G_CONFORMANCE_VALIDATED === false && D1G_CERTIFIED_SOLVER_STATUS === "NOT_CERTIFIED";
export const D1M_R5_POST_D1J_DEBT_PRESERVED = POST_D1J_STRUCTURAL_DEBT_LEDGER;
export const D1M_R5_D1K_LIMITATIONS_PRESERVED = D1M_R5_D1K_INTERNAL_INTEGRATION_READY === false && D1M_R5_D1K_INTELLIGENCE_READY === false;
export const D1M_R5_GA_SECURITY_DEBT_BLOCKS_GENERAL_AVAILABILITY = GA_SECURITY_DEBT_BLOCKS_GENERAL_AVAILABILITY;
export const D1M_R5_UNAUTHORIZED_PRODUCT_CLAIM = false as const;
export const D1M_R6_CANONICAL_PHASE = "EOS-D1M-R6-FILE-API-ADAPTER-BOUNDARY" as const;
export const D1M_R6_PHASE_TYPE = "CAD_OR_BIM_FILE_API_ADAPTER_BOUNDARY" as const;
export const D1M_R6_CANONICAL_SCOPE =
  "Define the governed boundary by which a future format adapter or API may supply R1 through R5 evidence. Declare adapter contract, source authentication, format capability, parser trust, evidence provenance, unsupported formats, and file versus API separation. Do not treat that boundary as arbitrary format support or a vendor integration." as const;

const FLOATING = new Set(["latest", "current", "newest", "head", "active", "active model", "current bim", "current drawing"]);
const RECORDER = "INTERFACE_RECORD_AUTHORITY";
const REVIEWER = "REVIEWER_AUTHORITY";

export type D1mR5Actor = {
  actorId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  authority: string;
};

export type D1mR5Input = {
  relationshipId: string;
  relationshipType: string;
  subjectMappingId: string;
  objectMappingId: string;
  supportingEvidenceId: string;
  referenceContextId: string;
  evidenceRef: string;
  provenanceRef: string;
  expectedSubjectRevision?: string;
  expectedObjectRevision?: string;
  expectedSubjectMappingFingerprint?: string;
  expectedObjectMappingFingerprint?: string;
  expectedSubjectObjectId?: string;
  expectedObjectObjectId?: string;
  expectedSubjectTargetId?: string;
  expectedObjectTargetId?: string;
  expectedEvidenceFingerprint?: string;
  expectedContextFingerprint?: string;
  predecessorRelationshipId?: string | null;
  ambiguous?: boolean;
  reverseDirection?: boolean;
  inferFromGeometry?: boolean;
  inferFromSemantics?: boolean;
  inferByAi?: boolean;
  structurallyValidated?: boolean;
  loadPath?: boolean;
  confidence?: number;
  tenantId?: string;
  workspaceId?: string;
  projectId?: string;
};

export type D1mR5Endpoint = {
  role: "SUBJECT" | "OBJECT";
  mappingId: string;
  mappingFingerprint: string;
  referenceId: string;
  artifactId: string;
  sourceRevision: string;
  r1MetadataFingerprint: string;
  sourceObjectId: string;
  structuralTargetId: string;
};

export type D1mR5Record = {
  relationshipId: string;
  relationshipType: (typeof D1M_0_SOURCE_RELATIONSHIP_KINDS)[number];
  direction: "SUBJECT_TO_OBJECT";
  subject: D1mR5Endpoint;
  object: D1mR5Endpoint;
  supportingEvidenceId: string;
  evidenceFingerprint: string;
  referenceContextId: string;
  contextFingerprint: string;
  sourceRelationshipType: (typeof D1M_0_SOURCE_RELATIONSHIP_KINDS)[number];
  engineeringRelationshipType: null;
  sourceRelationshipEqualsEngineeringRelationship: false;
  structuralConnectivityValidated: false;
  loadPathValidated: false;
  structuralAdequacyConfirmed: false;
  referenceContextCompatibleEqualsStructurallyValid: false;
  relationshipAuthority: typeof RECORDER;
  engineeringApprover: null;
  certificationAuthority: null;
  provenanceRef: string;
  evidenceRef: string;
  relationshipFingerprint: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  recordedBy: string;
  recordStatus: "CURRENT" | "SUPERSEDED";
  relationshipStatus: "RECORDED" | "CONFIRMED";
  predecessorRelationshipId: string | null;
  humanReviewRecorded: boolean;
  engineeringValidated: false;
  certified: false;
};

export type D1mR5History = {
  historyId: string;
  relationshipId: string;
  action: "CREATED" | "SUPERSEDED" | "CONFIRMED";
  relationshipFingerprint: string;
  recordedAt: string;
};

export type D1mR5Store = {
  mappings: readonly D1mR2Record[];
  evidence: readonly D1mR3Record[];
  contexts: readonly D1mR4Record[];
  now: () => string;
  records: D1mR5Record[];
  history: D1mR5History[];
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

function assertScope(actor: D1mR5Actor, row: { tenantId: string; workspaceId: string; projectId: string }): void {
  if (actor.tenantId !== row.tenantId) fail("CROSS_TENANT_OPERATION");
  if (actor.workspaceId !== row.workspaceId || actor.projectId !== row.projectId) fail("CROSS_PROJECT_OPERATION");
}

function assertRecorder(actor: D1mR5Actor): void {
  if (!actor.actorId.trim() || !actor.tenantId.trim() || !actor.workspaceId.trim() || !actor.projectId.trim()) fail("SCOPE_REQUIRED");
  if (blockedParty(actor.actorId) || blockedParty(actor.authority)) fail("AI_NOT_RELATIONSHIP_AUTHORITY");
  if (actor.authority === "ADMINISTRATOR" || actor.authority === "ADMIN") fail("ADMIN_NOT_RELATIONSHIP_AUTHORITY");
  if (actor.authority === "ENGINEERING_APPROVAL_AUTHORITY") fail("RELATIONSHIP_AUTHORITY_NOT_ENGINEERING_APPROVAL");
  if (actor.authority === "CERTIFICATION_AUTHORITY") fail("RELATIONSHIP_AUTHORITY_NOT_CERTIFIER");
  if (actor.authority !== RECORDER) fail("UNAUTHORIZED");
}

function endpoint(mapping: D1mR2Record, role: D1mR5Endpoint["role"]): D1mR5Endpoint {
  return {
    role,
    mappingId: mapping.mappingId,
    mappingFingerprint: mapping.mappingFingerprint,
    referenceId: mapping.referenceId,
    artifactId: mapping.artifactId,
    sourceRevision: mapping.sourceRevision,
    r1MetadataFingerprint: mapping.r1MetadataFingerprint,
    sourceObjectId: mapping.sourceObjectId,
    structuralTargetId: mapping.structuralTargetId,
  };
}

function remember(store: D1mR5Store, record: D1mR5Record, action: D1mR5History["action"]): void {
  store.history.push({
    historyId: `hist-${store.history.length + 1}`,
    relationshipId: record.relationshipId,
    action,
    relationshipFingerprint: record.relationshipFingerprint,
    recordedAt: store.now(),
  });
}

export function createD1mR5Store(catalog: { mappings: readonly D1mR2Record[]; evidence: readonly D1mR3Record[]; contexts: readonly D1mR4Record[] }, now: () => string): D1mR5Store {
  return { mappings: catalog.mappings, evidence: catalog.evidence, contexts: catalog.contexts, now, records: [], history: [] };
}

export function recordModelRelationship(store: D1mR5Store, actor: D1mR5Actor, input: D1mR5Input): D1mR5Record {
  assertRecorder(actor);
  if (input.tenantId != null && input.tenantId !== actor.tenantId) fail("CROSS_TENANT_OPERATION");
  if ((input.workspaceId != null && input.workspaceId !== actor.workspaceId) || (input.projectId != null && input.projectId !== actor.projectId)) fail("CROSS_PROJECT_OPERATION");
  if (input.ambiguous === true) fail("AMBIGUOUS_RELATIONSHIP_UNRESOLVED");
  if (input.confidence != null) fail("CONFIDENCE_SCORE_NOT_AUTHORITATIVE");
  if (input.reverseDirection === true) fail("DIRECTION_REVERSAL_REJECTED");
  if (input.inferFromGeometry === true) fail("GEOMETRY_RELATIONSHIP_INFERENCE_NOT_IN_R5");
  if (input.inferFromSemantics === true) fail("SEMANTIC_RELATIONSHIP_INFERENCE_NOT_IN_R5");
  if (input.inferByAi === true) fail("AI_RELATIONSHIP_INFERENCE_NOT_IN_R5");
  if (input.structurallyValidated === true) fail("STRUCTURAL_CONNECTIVITY_VALIDATION_NOT_IN_R5");
  if (input.loadPath === true) fail("LOAD_PATH_VALIDATION_NOT_IN_R5");
  if (!input.relationshipId.trim() || floating(input.relationshipId) || blockedParty(input.relationshipId)) fail("RELATIONSHIP_IDENTITY_REQUIRED");
  if (!(D1M_0_SOURCE_RELATIONSHIP_KINDS as readonly string[]).includes(input.relationshipType)) fail("RELATIONSHIP_TYPE_UNSUPPORTED");
  if (!input.provenanceRef.trim() || blockedParty(input.provenanceRef) || !input.evidenceRef.trim() || blockedParty(input.evidenceRef)) fail("MISSING_RELATIONSHIP_PROVENANCE");
  for (const revision of [input.expectedSubjectRevision, input.expectedObjectRevision]) {
    if (revision != null && floating(revision)) fail("FLOATING_REFERENCE_REJECTED");
  }
  const subjectMapping = store.mappings.find((row) => row.mappingId === input.subjectMappingId);
  const objectMapping = store.mappings.find((row) => row.mappingId === input.objectMappingId);
  if (!subjectMapping || !objectMapping) fail("R2_MAPPING_REQUIRED");
  if (subjectMapping.recordStatus !== "CURRENT" || objectMapping.recordStatus !== "CURRENT") fail("MAPPING_NOT_CURRENT");
  if (subjectMapping.mappingId === objectMapping.mappingId) fail("SELF_ENDPOINT_REJECTED");
  assertScope(actor, subjectMapping);
  assertScope(actor, objectMapping);
  if (subjectMapping.tenantId !== objectMapping.tenantId) fail("CROSS_TENANT_OPERATION");
  if (subjectMapping.workspaceId !== objectMapping.workspaceId || subjectMapping.projectId !== objectMapping.projectId) fail("CROSS_PROJECT_OPERATION");
  if (input.expectedSubjectRevision != null && input.expectedSubjectRevision !== subjectMapping.sourceRevision) fail("ARTIFACT_REVISION_MISMATCH");
  if (input.expectedObjectRevision != null && input.expectedObjectRevision !== objectMapping.sourceRevision) fail("ARTIFACT_REVISION_MISMATCH");
  if (input.expectedSubjectMappingFingerprint != null && input.expectedSubjectMappingFingerprint !== subjectMapping.mappingFingerprint) fail("MAPPING_SUBSTITUTION_REJECTED");
  if (input.expectedObjectMappingFingerprint != null && input.expectedObjectMappingFingerprint !== objectMapping.mappingFingerprint) fail("MAPPING_SUBSTITUTION_REJECTED");
  if (input.expectedSubjectObjectId != null && input.expectedSubjectObjectId !== subjectMapping.sourceObjectId) fail("ENDPOINT_SUBSTITUTION_REJECTED");
  if (input.expectedObjectObjectId != null && input.expectedObjectObjectId !== objectMapping.sourceObjectId) fail("ENDPOINT_SUBSTITUTION_REJECTED");
  if (input.expectedSubjectTargetId != null && input.expectedSubjectTargetId !== subjectMapping.structuralTargetId) fail("ENDPOINT_SUBSTITUTION_REJECTED");
  if (input.expectedObjectTargetId != null && input.expectedObjectTargetId !== objectMapping.structuralTargetId) fail("ENDPOINT_SUBSTITUTION_REJECTED");
  const evidence = store.evidence.find((row) => row.evidenceId === input.supportingEvidenceId);
  if (!evidence || evidence.recordStatus !== "CURRENT") fail("R3_EVIDENCE_REQUIRED");
  if (evidence.mappingId !== subjectMapping.mappingId && evidence.mappingId !== objectMapping.mappingId) fail("EVIDENCE_ENDPOINT_MISMATCH");
  assertScope(actor, evidence);
  if (input.expectedEvidenceFingerprint != null && input.expectedEvidenceFingerprint !== evidence.evidenceFingerprint) fail("EVIDENCE_SUBSTITUTION_REJECTED");
  const context = store.contexts.find((row) => row.contextId === input.referenceContextId);
  if (!context || context.recordStatus !== "CURRENT") fail("R4_CONTEXT_REQUIRED");
  if (context.evidenceId !== evidence.evidenceId || context.evidenceFingerprint !== evidence.evidenceFingerprint) fail("REFERENCE_CONTEXT_MISMATCH");
  assertScope(actor, context);
  if (input.expectedContextFingerprint != null && input.expectedContextFingerprint !== context.contextFingerprint) fail("REFERENCE_CONTEXT_SUBSTITUTION_REJECTED");
  const valueBefore = evidence.sourceValue;
  const componentsBefore = evidence.components?.slice() ?? null;
  const contextFingerprintBefore = context.contextFingerprint;
  const relationshipType = input.relationshipType as D1mR5Record["relationshipType"];
  const subject = endpoint(subjectMapping, "SUBJECT");
  const object = endpoint(objectMapping, "OBJECT");
  const predecessor = input.predecessorRelationshipId ? store.records.find((row) => row.relationshipId === input.predecessorRelationshipId) : null;
  if (input.predecessorRelationshipId) {
    if (!predecessor) fail("RELATIONSHIP_NOT_FOUND");
    assertScope(actor, predecessor);
    if (predecessor.recordStatus !== "CURRENT") fail("PREDECESSOR_NOT_CURRENT");
    if (predecessor.subject.mappingId !== subject.mappingId || predecessor.object.mappingId !== object.mappingId || predecessor.relationshipType !== relationshipType) {
      fail("SILENT_ENDPOINT_REPOINTING_REJECTED");
    }
  }
  const sameId = store.records.find((row) => row.relationshipId === input.relationshipId);
  if (sameId && (sameId.subject.mappingId !== subject.mappingId || sameId.object.mappingId !== object.mappingId || sameId.relationshipType !== relationshipType)) {
    fail("RELATIONSHIP_ALREADY_RECORDED");
  }
  const active = store.records.find((row) => row.recordStatus === "CURRENT" && row.relationshipType === relationshipType && row.subject.mappingId === subject.mappingId && row.object.mappingId === object.mappingId);
  if (active && active.relationshipId !== input.relationshipId && active.relationshipId !== predecessor?.relationshipId) fail("RELATIONSHIP_CONFLICT");
  const relationshipFingerprint = fingerprintCanonical({
    relationshipId: input.relationshipId,
    relationshipType,
    direction: "SUBJECT_TO_OBJECT",
    subjectRole: subject.role,
    subjectMappingId: subject.mappingId,
    subjectMappingFingerprint: subject.mappingFingerprint,
    subjectRevision: subject.sourceRevision,
    subjectR1Fingerprint: subject.r1MetadataFingerprint,
    subjectObjectId: subject.sourceObjectId,
    subjectTargetId: subject.structuralTargetId,
    objectRole: object.role,
    objectMappingId: object.mappingId,
    objectMappingFingerprint: object.mappingFingerprint,
    objectRevision: object.sourceRevision,
    objectR1Fingerprint: object.r1MetadataFingerprint,
    objectObjectId: object.sourceObjectId,
    objectTargetId: object.structuralTargetId,
    supportingEvidenceId: evidence.evidenceId,
    evidenceFingerprint: evidence.evidenceFingerprint,
    referenceContextId: context.contextId,
    contextFingerprint: context.contextFingerprint,
    provenanceRef: input.provenanceRef,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
    predecessorRelationshipId: predecessor?.relationshipId ?? null,
  });
  if (predecessor && predecessor.evidenceFingerprint === evidence.evidenceFingerprint && predecessor.contextFingerprint === context.contextFingerprint && predecessor.provenanceRef === input.provenanceRef) {
    fail("RELATIONSHIP_UNCHANGED");
  }
  const existing = store.records.find((row) => row.relationshipId === input.relationshipId);
  if (existing) {
    if (existing.relationshipFingerprint === relationshipFingerprint && !predecessor) return existing;
    fail("RELATIONSHIP_ALREADY_RECORDED");
  }
  const record: D1mR5Record = {
    relationshipId: input.relationshipId,
    relationshipType,
    direction: "SUBJECT_TO_OBJECT",
    subject,
    object,
    supportingEvidenceId: evidence.evidenceId,
    evidenceFingerprint: evidence.evidenceFingerprint,
    referenceContextId: context.contextId,
    contextFingerprint: context.contextFingerprint,
    sourceRelationshipType: relationshipType,
    engineeringRelationshipType: null,
    sourceRelationshipEqualsEngineeringRelationship: false,
    structuralConnectivityValidated: false,
    loadPathValidated: false,
    structuralAdequacyConfirmed: false,
    referenceContextCompatibleEqualsStructurallyValid: false,
    relationshipAuthority: RECORDER,
    engineeringApprover: null,
    certificationAuthority: null,
    provenanceRef: input.provenanceRef,
    evidenceRef: input.evidenceRef,
    relationshipFingerprint,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
    recordedBy: actor.actorId,
    recordStatus: "CURRENT",
    relationshipStatus: "RECORDED",
    predecessorRelationshipId: predecessor?.relationshipId ?? null,
    humanReviewRecorded: false,
    engineeringValidated: false,
    certified: false,
  };
  if (predecessor) {
    predecessor.recordStatus = "SUPERSEDED";
    remember(store, predecessor, "SUPERSEDED");
  }
  store.records.push(record);
  remember(store, record, "CREATED");
  if (evidence.sourceValue !== valueBefore || context.contextFingerprint !== contextFingerprintBefore || (componentsBefore && evidence.components?.some((item, index) => item !== componentsBefore[index]))) {
    fail("PRIOR_EVIDENCE_MUTATED");
  }
  return record;
}

export function confirmModelRelationship(store: D1mR5Store, actor: D1mR5Actor, relationshipId: string): D1mR5Record {
  if (!actor.actorId.trim()) fail("SCOPE_REQUIRED");
  if (blockedParty(actor.actorId) || blockedParty(actor.authority)) fail("AI_NOT_RELATIONSHIP_AUTHORITY");
  if (actor.authority === "ADMINISTRATOR" || actor.authority === "ADMIN") fail("ADMIN_NOT_RELATIONSHIP_AUTHORITY");
  if (actor.authority === "ENGINEERING_APPROVAL_AUTHORITY") fail("RELATIONSHIP_AUTHORITY_NOT_ENGINEERING_APPROVAL");
  if (actor.authority === "CERTIFICATION_AUTHORITY") fail("RELATIONSHIP_AUTHORITY_NOT_CERTIFIER");
  if (actor.authority !== REVIEWER) fail("UNAUTHORIZED");
  const record = store.records.find((row) => row.relationshipId === relationshipId);
  if (!record) fail("RELATIONSHIP_NOT_FOUND");
  assertScope(actor, record);
  if (record.recordStatus !== "CURRENT") fail("RELATIONSHIP_NOT_CURRENT");
  const fingerprintBefore = record.relationshipFingerprint;
  record.relationshipStatus = "CONFIRMED";
  record.humanReviewRecorded = true;
  record.engineeringValidated = false;
  record.structuralConnectivityValidated = false;
  record.loadPathValidated = false;
  record.certified = false;
  if (record.relationshipFingerprint !== fingerprintBefore) fail("RELATIONSHIP_MUTATED");
  remember(store, record, "CONFIRMED");
  return record;
}

export function supersedeModelRelationship(store: D1mR5Store, actor: D1mR5Actor, input: D1mR5Input): D1mR5Record {
  if (!input.predecessorRelationshipId) fail("RELATIONSHIP_NOT_FOUND");
  return recordModelRelationship(store, actor, input);
}

export function mutateModelRelationship(): never {
  return fail("SILENT_RELATIONSHIP_MUTATION_REJECTED");
}
export function repointRelationshipEndpoint(): never {
  return fail("SILENT_ENDPOINT_REPOINTING_REJECTED");
}
export function upgradeRelationshipRevision(): never {
  return fail("RELATIONSHIP_REVISION_AUTO_UPGRADE_REJECTED");
}
export function inferRelationshipFromGeometry(): never {
  return fail("GEOMETRY_RELATIONSHIP_INFERENCE_NOT_IN_R5");
}
export function inferRelationshipFromSemantics(): never {
  return fail("SEMANTIC_RELATIONSHIP_INFERENCE_NOT_IN_R5");
}
export function inferRelationshipByAi(): never {
  return fail("AI_RELATIONSHIP_INFERENCE_NOT_IN_R5");
}
export function inferModelTopology(): never {
  return fail("TOPOLOGY_INFERENCE_NOT_IN_R5");
}
export function inferTransitiveRelationship(): never {
  return fail("TRANSITIVE_RELATIONSHIP_INFERENCE_NOT_IN_R5");
}
export function composeRelationships(): never {
  return fail("RELATIONSHIP_COMPOSITION_NOT_IN_R5");
}
export function inferStructuralConnectivity(): never {
  return fail("CONNECTIVITY_INFERENCE_NOT_IN_R5");
}
export function validateStructuralConnectivity(): never {
  return fail("STRUCTURAL_CONNECTIVITY_VALIDATION_NOT_IN_R5");
}
export function inferLoadPath(): never {
  return fail("LOAD_PATH_INFERENCE_NOT_IN_R5");
}
export function validateLoadPath(): never {
  return fail("LOAD_PATH_VALIDATION_NOT_IN_R5");
}
export function detectCadBimClash(): never {
  return fail("CLASH_DETECTION_NOT_IN_R5");
}
export function coordinateMultidisciplinaryBim(): never {
  return fail("MULTIDISCIPLINARY_COORDINATION_NOT_IN_R5");
}
export function reasonGlobalModelDependency(): never {
  return fail("GLOBAL_DEPENDENCY_REASONING_NOT_IN_R5");
}
export function detectGlobalCycle(): never {
  return fail("GLOBAL_CYCLE_DETECTION_NOT_IN_R5");
}
export function convertRelationshipUnits(): never {
  return fail("UNIT_CONVERSION_NOT_IN_R5");
}
export function transformRelationshipCoordinates(): never {
  return fail("COORDINATE_TRANSFORMATION_NOT_IN_R5");
}
export function inferRelationshipAxis(): never {
  return fail("AXIS_INFERENCE_NOT_IN_R5");
}
export function transformRelationshipAxis(): never {
  return fail("AXIS_TRANSFORMATION_NOT_IN_R5");
}
export function transformRelationshipGeometry(): never {
  return fail("GEOMETRY_TRANSFORMATION_NOT_IN_R5");
}
export function parseCadBimArtifact(): never {
  return fail("PARSE_NOT_IN_R5");
}
export function extractCadBimObjects(): never {
  return fail("OBJECT_EXTRACTION_NOT_IN_R5");
}
export function ingestCadBimFile(): never {
  return fail("FILE_INGESTION_NOT_IN_R5");
}
export function adaptCadBimFormat(): never {
  return fail("FORMAT_ADAPTER_NOT_IN_R5");
}
export function connectCadBimVendor(): never {
  return fail("CONNECTOR_NOT_IN_R5");
}
export function interpretCadBimEngineeringProperties(): never {
  return fail("ENGINEERING_PROPERTY_INTERPRETATION_NOT_IN_R5");
}
export function correctCadBimModel(): never {
  return fail("MODEL_CORRECTION_NOT_IN_R5");
}
export function authorCadModel(): never {
  return fail("CAD_AUTHORING_NOT_IN_R5");
}
export function authorBimModel(): never {
  return fail("BIM_AUTHORING_NOT_IN_R5");
}
