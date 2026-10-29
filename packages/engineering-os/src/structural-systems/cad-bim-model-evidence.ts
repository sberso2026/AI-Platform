/**
 * EOS-D1M-R3 geometry and semantic evidence.
 * In-memory source-derived evidence only. No parser, conversion, or engineering validation.
 */
import type { EosEvidenceSourceKind } from "@rtb/types";
import {
  AXIS_SIGN_ARCHITECTURE_REUSED,
  COORDINATE_ARCHITECTURE_REUSED,
  D1M_0_COORDINATE_IDENTITIES,
  D1M_0_GEOMETRY_EVIDENCE_CANDIDATES,
  D1M_0_SEMANTIC_EVIDENCE_CANDIDATES,
  EOS_EVIDENCE_SOURCE_KINDS,
  UNIT_ARCHITECTURE_REUSED,
} from "@rtb/types";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import type { D1mR1Record } from "./cad-bim-source-revision";
import type { D1mR2Record } from "./cad-bim-object-mapping";
import { D1M_R3_CANONICAL_PHASE, D1M_R3_CANONICAL_SCOPE } from "./cad-bim-object-mapping";
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

export const D1M_R3_PHASE = D1M_R3_CANONICAL_PHASE;
export const D1M_R3_PHASE_TYPE = "CAD_OR_BIM_GEOMETRY_SEMANTIC_EVIDENCE" as const;
export const D1M_R3_STATUS = "MODEL_EVIDENCE_IMPLEMENTED" as const;
export const D1M_R3_MATURITY_STATE = "STRUCTURAL_CAD_OR_BIM_GEOMETRY_SEMANTIC_EVIDENCE_IMPLEMENTED" as const;
export const D1M_R3_SCOPE = D1M_R3_CANONICAL_SCOPE;
export const D1M_R3_CLOSEOUT_PATH =
  "docs/architecture/engineering-os/EOS_D1M_R3_GEOMETRY_SEMANTIC_EVIDENCE_CLOSEOUT.md" as const;
export const D1M_R3_PARENT_ARCHITECTURE_PATH =
  "docs/architecture/engineering-os/EOS_D1M_0_CAD_OR_BIM_INTELLIGENCE_ARCHITECTURE.md" as const;
export const D1M_R3_R1_CLOSEOUT_PATH =
  "docs/architecture/engineering-os/EOS_D1M_R1_CAD_OR_BIM_ARTIFACT_SOURCE_REVISION_FOUNDATION_CLOSEOUT.md" as const;
export const D1M_R3_R2_CLOSEOUT_PATH =
  "docs/architecture/engineering-os/EOS_D1M_R2_SOURCE_OBJECT_STRUCTURAL_TARGET_MAPPING_CLOSEOUT.md" as const;

export const D1M_R3_ARCHITECTURE_READY = true as const;
export const D1M_R3_SOURCE_REFERENCE_RUNTIME_READY = true as const;
export const D1M_R3_MODEL_EVIDENCE_RUNTIME_READY = true as const;
export const D1M_R3_FORMAT_ADAPTER_RUNTIME_READY = false as const;
export const D1M_R3_STRUCTURAL_INTERPRETATION_RUNTIME_READY = false as const;
export const D1M_R3_CHANGE_GOVERNANCE_RUNTIME_READY = false as const;
export const D1M_R3_R1_SOURCE_REFERENCE_REQUIRED = true as const;
export const D1M_R3_EXACT_ARTIFACT_REVISION_BINDING_REQUIRED = true as const;
export const D1M_R3_R2_OBJECT_MAPPING_REQUIRED = true as const;
export const D1M_R3_EXACT_OBJECT_MAPPING_BINDING_REQUIRED = true as const;
export const D1M_R3_CAN_CREATE_STRUCTURAL_TARGET_MAPPING = false as const;
export const D1M_R3_NEW_MAPPING_RUNTIME_COUNT = 0 as const;
export const D1M_R3_SOURCE_OBJECT_REVISION_BINDING_PRESERVED = true as const;
export const D1M_R3_GEOMETRY_RUNTIME_IMPLEMENTED = true as const;
export const D1M_R3_GEOMETRY_RUNTIME_COUNT = 1 as const;
export const D1M_R3_GEOMETRY_EVIDENCE_TYPES = D1M_0_GEOMETRY_EVIDENCE_CANDIDATES;
export const D1M_R3_GEOMETRY_TYPE_ALLOWLIST_ENFORCED = true as const;
export const D1M_R3_FREEFORM_GEOMETRY_TYPE_ALLOWED = false as const;
export const D1M_R3_GENERAL_GEOMETRY_ENGINE_RUNTIME_COUNT = 0 as const;
export const D1M_R3_SEMANTIC_RUNTIME_IMPLEMENTED = true as const;
export const D1M_R3_SEMANTIC_RUNTIME_COUNT = 1 as const;
export const D1M_R3_SEMANTIC_EVIDENCE_TYPES = D1M_0_SEMANTIC_EVIDENCE_CANDIDATES;
export const D1M_R3_SEMANTIC_TYPE_ALLOWLIST_ENFORCED = true as const;
export const D1M_R3_FREEFORM_ENGINEERING_SEMANTIC_TYPE_ALLOWED = false as const;
export const D1M_R3_SOURCE_GEOMETRY_EQUALS_VALIDATED_EOS_GEOMETRY = false as const;
export const D1M_R3_GEOMETRY_RECORDED_EQUALS_GEOMETRY_VALIDATED = false as const;
export const D1M_R3_GEOMETRY_AUTHORIZED_EQUALS_GEOMETRY_VALIDATED = false as const;
export const D1M_R3_GEOMETRY_FINGERPRINT_VERIFIED_EQUALS_GEOMETRY_VALIDATED = false as const;
export const D1M_R3_GEOMETRY_RECORDED_EQUALS_STRUCTURAL_ADEQUACY = false as const;
export const D1M_R3_SOURCE_SEMANTIC_EQUALS_GOVERNED_ENGINEERING_SEMANTIC = false as const;
export const D1M_R3_UNKNOWN_MODEL_SEMANTIC_AUTO_MAPPED = false as const;
export const D1M_R3_UNKNOWN_LABEL_MEANING_INFERRED = false as const;
export const D1M_R3_SOURCE_CLASS_EQUALS_VALIDATED_STRUCTURAL_CLASS = false as const;
export const D1M_R3_MATERIAL_EQUALS_VALIDATED_MATERIAL = false as const;
export const D1M_R3_SECTION_EQUALS_VALIDATED_SECTION = false as const;
export const D1M_R3_LOAD_EQUALS_VALIDATED_LOAD = false as const;
export const D1M_R3_SUPPORT_EQUALS_VALIDATED_BOUNDARY = false as const;
export const D1M_R3_REINFORCEMENT_EQUALS_VALIDATED_REINFORCEMENT = false as const;
export const D1M_R3_MODEL_EVIDENCE_EQUALS_STRUCTURAL_INTERPRETATION_APPROVED = false as const;
export const D1M_R3_MODEL_EVIDENCE_EQUALS_ENGINEERING_VALIDATED = false as const;
export const D1M_R3_MODEL_EVIDENCE_EQUALS_STRUCTURAL_ADEQUACY = false as const;
export const D1M_R3_EVIDENCE_AUTHORITY_PRESERVED = true as const;
export const D1M_R3_EVIDENCE_PROVENANCE_PRESERVED = true as const;
export const D1M_R3_EVIDENCE_AUTHORITY_EQUALS_ENGINEERING_APPROVAL = false as const;
export const D1M_R3_EVIDENCE_AUTHORITY_EQUALS_CERTIFICATION_AUTHORITY = false as const;
export const D1M_R3_ADMIN_EQUALS_EVIDENCE_ENGINEERING_AUTHORITY = false as const;
export const D1M_R3_AI_CAN_INVENT_GEOMETRY_EVIDENCE = false as const;
export const D1M_R3_AI_CAN_INVENT_SEMANTIC_EVIDENCE = false as const;
export const D1M_R3_AI_CAN_INVENT_SOURCE_PROPERTY = false as const;
export const D1M_R3_AI_CAN_INFER_UNKNOWN_ENGINEERING_SEMANTIC = false as const;
export const D1M_R3_AI_CAN_MARK_EVIDENCE_ENGINEERING_VALIDATED = false as const;
export const D1M_R3_AI_MODEL_EXTRACTION_RUNTIME_COUNT = 0 as const;
export const D1M_R3_AI_GEOMETRY_EXTRACTION_RUNTIME_COUNT = 0 as const;
export const D1M_R3_AI_SEMANTIC_EXTRACTION_RUNTIME_COUNT = 0 as const;
export const D1M_R3_EVIDENCE_RECORDED_EQUALS_EXTRACTED_FROM_FILE = false as const;
export const D1M_R3_EVIDENCE_RECORDED_EQUALS_FORMAT_SUPPORTED = false as const;
export const D1M_R3_GEOMETRY_FINGERPRINT_IMPLEMENTED = true as const;
export const D1M_R3_SEMANTIC_FINGERPRINT_IMPLEMENTED = true as const;
export const D1M_R3_CANONICAL_FINGERPRINT_REUSED = true as const;
export const D1M_R3_SECOND_FINGERPRINT_ALGORITHM_CREATED = false as const;
export const D1M_R3_GEOMETRY_FINGERPRINT_EQUALS_ENGINEERING_VALIDATED = false as const;
export const D1M_R3_SEMANTIC_FINGERPRINT_EQUALS_ENGINEERING_VALIDATED = false as const;
export const D1M_R3_SILENT_GEOMETRY_MUTATION_ALLOWED = false as const;
export const D1M_R3_SILENT_SEMANTIC_MUTATION_ALLOWED = false as const;
export const D1M_R3_GEOMETRY_REVISION_AUTO_UPGRADED = false as const;
export const D1M_R3_SEMANTIC_REVISION_AUTO_UPGRADED = false as const;
export const D1M_R3_MAPPING_REFERENCE_AUTO_UPGRADED = false as const;
export const D1M_R3_GEOMETRY_HISTORY_PRESERVED = true as const;
export const D1M_R3_SEMANTIC_HISTORY_PRESERVED = true as const;
export const D1M_R3_CONFLICTING_EVIDENCE_AUTO_RESOLVED = false as const;
export const D1M_R3_HUMAN_REVIEW_SUPPORTED = true as const;
export const D1M_R3_HUMAN_REVIEW_EQUALS_ENGINEERING_VALIDATION = false as const;
export const D1M_R3_SCOPE_ENFORCED = true as const;
export const D1M_R3_CROSS_WORKSPACE_EVIDENCE_ALLOWED = false as const;
export const D1M_R3_CROSS_PROJECT_EVIDENCE_ALLOWED = false as const;
export const D1M_R3_EVIDENCE_SPOOFING_PROTECTION_IMPLEMENTED = true as const;
export const D1M_R3_R1_REUSED = true as const;
export const D1M_R3_PARALLEL_ARTIFACT_REFERENCE_CREATED = false as const;
export const D1M_R3_R2_REUSED = true as const;
export const D1M_R3_PARALLEL_MAPPING_ENGINE_CREATED = false as const;
export const D1M_R3_D1A_REUSED = true as const;
export const D1M_R3_PARALLEL_STRUCTURAL_IDENTITY_CREATED = false as const;
export const D1M_R3_D1K_UNIT_ARCHITECTURE_REUSED = UNIT_ARCHITECTURE_REUSED;
export const D1M_R3_D1K_COORDINATE_ARCHITECTURE_REUSED = COORDINATE_ARCHITECTURE_REUSED;
export const D1M_R3_D1K_AXIS_ARCHITECTURE_REUSED = AXIS_SIGN_ARCHITECTURE_REUSED;
export const D1M_R3_D1K_GOVERNANCE_REUSED = true as const;
export const D1M_R3_PARALLEL_CROSS_DISCIPLINE_INTERFACE_CREATED = false as const;
export const D1M_R3_MISSING_UNIT_AUTO_INFERRED = false as const;
export const D1M_R3_MISSING_COORDINATE_AUTO_INFERRED = false as const;
export const D1M_R3_OBJECT_EXTRACTION_RUNTIME_COUNT = 0 as const;
export const D1M_R3_PARSE_RUNTIME_COUNT = 0 as const;
export const D1M_R3_FILE_INGESTION_RUNTIME_COUNT = 0 as const;
export const D1M_R3_GENERIC_FILE_INGESTION_RUNTIME_COUNT = 0 as const;
export const D1M_R3_RELATIONSHIP_RUNTIME_COUNT = 0 as const;
export const D1M_R3_CHANGE_DETECTION_RUNTIME_COUNT = 0 as const;
export const D1M_R3_FORMAT_ADAPTER_RUNTIME_COUNT = 0 as const;
export const D1M_R3_CONNECTOR_RUNTIME_COUNT = 0 as const;
export const D1M_R3_GEOMETRY_MATCHING_RUNTIME_COUNT = 0 as const;
export const D1M_R3_SEMANTIC_MATCHING_RUNTIME_COUNT = 0 as const;
export const D1M_R3_UNIT_CONVERSION_RUNTIME_COUNT = 0 as const;
export const D1M_R3_COORDINATE_TRANSFORMATION_RUNTIME_COUNT = 0 as const;
export const D1M_R3_AXIS_INFERENCE_RUNTIME_COUNT = 0 as const;
export const D1M_R3_CONNECTIVITY_INFERENCE_RUNTIME_COUNT = 0 as const;
export const D1M_R3_LOAD_PATH_INFERENCE_RUNTIME_COUNT = 0 as const;
export const D1M_R3_ENGINEERING_PROPERTY_INTERPRETATION_RUNTIME_COUNT = 0 as const;
export const D1M_R3_MODEL_CORRECTION_RUNTIME_COUNT = 0 as const;
export const D1M_R3_CAD_AUTHORING_RUNTIME_COUNT = 0 as const;
export const D1M_R3_BIM_AUTHORING_RUNTIME_COUNT = 0 as const;
export const D1M_R3_CANONICAL_DIGITAL_THREAD_REUSED = true as const;
export const D1M_R3_PARALLEL_DIGITAL_THREAD_CREATED = false as const;
export const D1M_R3_D1K_INTERNAL_INTEGRATION_READY = D1K_R5_INTERNAL_DISCIPLINE_INTEGRATION_READY;
export const D1M_R3_D1K_INTELLIGENCE_READY = D1K_R5_CROSS_DISCIPLINE_INTELLIGENCE_READY;
export const D1M_R3_D1L_TRACK_COMPLETE = D1L_R6_TRACK_COMPLETE;
export const D1M_R3_D1L_TRACK_STATUS = D1L_R6_TRACK_STATUS;
export const D1M_R3_MODEL_EVIDENCE_EQUALS_D1L_CERTIFICATION_ELIGIBLE = false as const;
export const D1M_R3_D1N_CURRENT_STATUS = "NOT_ABSORBED" as const;
export const D1M_R3_D1N_ABSORBED = false as const;
export const D1M_R3_D1N_RUNTIME_STARTED = false as const;
export const D1M_R3_D1N_RUNTIME_COUNT = 0 as const;
export const D1M_R3_D9_ABSORBED = false as const;
export const D1M_R3_D9_RUNTIME_STARTED = false as const;
export const D1M_R3_D9_RUNTIME_COUNT = 0 as const;
export const D1M_R3_GLOBAL_CYCLE_DETECTION_RUNTIME_COUNT = 0 as const;
export const D1M_R3_D2_D8_RUNTIME_STARTED = false as const;
export const D1M_R3_D2_D8_RUNTIME_COUNT = 0 as const;
export const D1M_R3_RUNTIME_STARTED = true as const;
export const D1M_R3_RUNTIME_COUNT = 3 as const;
export const D1M_R3_SOURCE_REFERENCE_RUNTIME_COUNT = 1 as const;
export const D1M_R3_ARTIFACT_RUNTIME_COUNT = 1 as const;
export const D1M_R3_SOURCE_OBJECT_IDENTITY_RUNTIME_COUNT = 1 as const;
export const D1M_R3_MAPPING_RUNTIME_COUNT = 1 as const;
export const D1M_R3_DATABASE_SCHEMA_CHANGED = false as const;
export const D1M_R3_NEW_DEPENDENCY_ADDED = false as const;
export const D1M_R3_STRUCTURAL_PACK_COMPLETE = D1_STRUCTURAL_PACK_COMPLETE;
export const D1M_R3_D1G_BLOCKER_PRESERVED = D1G_LIVE_VALIDATED === false && D1G_ENGINEER_VALIDATED === false && D1G_CONFORMANCE_VALIDATED === false && D1G_CERTIFIED_SOLVER_STATUS === "NOT_CERTIFIED";
export const D1M_R3_POST_D1J_DEBT_PRESERVED = POST_D1J_STRUCTURAL_DEBT_LEDGER;
export const D1M_R3_D1K_LIMITATIONS_PRESERVED = D1M_R3_D1K_INTERNAL_INTEGRATION_READY === false && D1M_R3_D1K_INTELLIGENCE_READY === false;
export const D1M_R3_GA_SECURITY_DEBT_BLOCKS_GENERAL_AVAILABILITY = GA_SECURITY_DEBT_BLOCKS_GENERAL_AVAILABILITY;
export const D1M_R3_UNAUTHORIZED_PRODUCT_CLAIM = false as const;
export const D1M_R3_FLOATING_ARTIFACT_REFERENCE_ALLOWED = false as const;
export const D1M_R3_EVIDENCE_ARTIFACT_AUTO_UPGRADED = false as const;
export const D1M_R4_CANONICAL_PHASE = "EOS-D1M-R4-UNIT-COORDINATE-AXIS-REFERENCE" as const;
export const D1M_R4_PHASE_TYPE = "CAD_OR_BIM_UNIT_COORDINATE_AXIS_REFERENCE" as const;
export const D1M_R4_CANONICAL_SCOPE =
  "Govern exact unit, coordinate-system, and axis or sign references for D1M geometry and semantic evidence using canonical D1K-compatible primitives. Determine compatibility and explicit reference context. Do not silently convert geometry, transform coordinates, or invent engineering axes." as const;

const FLOATING = new Set(["latest", "current", "newest", "head", "active", "active model", "current bim", "current drawing"]);
const RECORDER = "INTERFACE_RECORD_AUTHORITY";
const REVIEWER = "REVIEWER_AUTHORITY";
const MAX_COMPONENTS = 32;

export type D1mR3Actor = {
  actorId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  authority: string;
};

export type D1mR3ContextStatus = "DECLARED_SOURCE" | "UNRESOLVED_PENDING_R4";

export type D1mR3GeometryInput = {
  evidenceId: string;
  mappingId: string;
  geometryType: string;
  components: readonly number[];
  labels?: readonly string[];
  declaredUnit?: string | null;
  coordinateIdentity?: string | null;
  declaredAxis?: string | null;
  evidenceKind: string;
  evidenceRef: string;
  provenanceRef: string;
  declaredFormat?: string | null;
  expectedSourceRevision?: string;
  expectedSourceObjectId?: string;
  expectedStructuralTargetId?: string;
  expectedMappingFingerprint?: string;
  predecessorEvidenceId?: string | null;
  ambiguous?: boolean;
  inferEngineeringMeaning?: boolean;
  engineeringValidated?: boolean;
  geometryValidated?: boolean;
  certified?: boolean;
  extractedFromFile?: boolean;
  formatSupported?: boolean;
  convertUnits?: boolean;
  transformCoordinates?: boolean;
  inferAxis?: boolean;
  createMapping?: boolean;
  tenantId?: string;
  workspaceId?: string;
  projectId?: string;
};

export type D1mR3SemanticInput = {
  evidenceId: string;
  mappingId: string;
  semanticType: string;
  sourcePropertyName: string;
  sourceValue: string;
  declaredUnit?: string | null;
  evidenceKind: string;
  evidenceRef: string;
  provenanceRef: string;
  declaredFormat?: string | null;
  expectedSourceRevision?: string;
  expectedSourceObjectId?: string;
  expectedStructuralTargetId?: string;
  expectedMappingFingerprint?: string;
  predecessorEvidenceId?: string | null;
  ambiguous?: boolean;
  inferEngineeringMeaning?: boolean;
  engineeringSemanticId?: string;
  engineeringValidated?: boolean;
  certified?: boolean;
  extractedFromFile?: boolean;
  formatSupported?: boolean;
  validatedMaterial?: boolean;
  validatedSection?: boolean;
  validatedLoad?: boolean;
  validatedSupport?: boolean;
  validatedReinforcement?: boolean;
  validatedStructuralClass?: boolean;
  createMapping?: boolean;
  tenantId?: string;
  workspaceId?: string;
  projectId?: string;
};

export type D1mR3Provenance = {
  provenanceRef: string;
  evidenceRef: string;
  evidenceKind: EosEvidenceSourceKind;
  actorId: string;
  recordedAt: string;
  referenceId: string;
  sourceRevision: string;
  sourceObjectId: string;
  mappingId: string;
  mappingFingerprint: string;
  structuralTargetId: string;
  sourceAuthority: "SOURCE_AUTHORITY";
  evidenceAuthority: typeof RECORDER;
  aiGenerated: false;
};

export type D1mR3Record = {
  evidenceId: string;
  evidenceFamily: "GEOMETRY" | "SEMANTIC";
  referenceId: string;
  artifactId: string;
  sourceRevision: string;
  r1MetadataFingerprint: string;
  mappingId: string;
  mappingFingerprint: string;
  sourceObjectId: string;
  structuralTargetId: string;
  structuralTargetKind: D1mR2Record["structuralTargetKind"];
  evidenceType: string;
  sourcePropertyName: string | null;
  components: readonly number[] | null;
  labels: readonly string[] | null;
  sourceValue: string | null;
  declaredUnit: string | null;
  unitContextStatus: D1mR3ContextStatus;
  coordinateIdentity: (typeof D1M_0_COORDINATE_IDENTITIES)[number] | null;
  coordinateContextStatus: D1mR3ContextStatus;
  declaredAxis: string | null;
  axisContextStatus: D1mR3ContextStatus;
  declaredFormat: string | null;
  formatSupported: false;
  origin: "DECLARED_SOURCE";
  extractedFromFile: false;
  sourceAuthority: "SOURCE_AUTHORITY";
  evidenceAuthority: typeof RECORDER;
  engineeringApprover: null;
  certificationAuthority: null;
  provenance: D1mR3Provenance;
  evidenceFingerprint: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  recordedBy: string;
  recordStatus: "CURRENT" | "SUPERSEDED";
  evidenceStatus: "RECORDED" | "CONFIRMED";
  predecessorEvidenceId: string | null;
  humanReviewRecorded: boolean;
  geometryValidated: false;
  engineeringValidated: false;
  structuralAdequacyConfirmed: false;
  structuralInterpretationApproved: false;
  sourceEqualsGovernedEngineeringSemantic: false;
  sourceClassEqualsValidatedStructuralClass: false;
  materialValidated: false;
  sectionValidated: false;
  loadValidated: false;
  supportValidated: false;
  reinforcementValidated: false;
  engineeringAxisAssigned: false;
  certified: false;
};

export type D1mR3History = {
  historyId: string;
  evidenceId: string;
  evidenceFamily: "GEOMETRY" | "SEMANTIC";
  action: "CREATED" | "SUPERSEDED" | "CONFIRMED";
  mappingId: string;
  sourceRevision: string;
  evidenceFingerprint: string;
  recordedAt: string;
};

export type D1mR3Store = {
  references: readonly D1mR1Record[];
  mappings: readonly D1mR2Record[];
  now: () => string;
  records: D1mR3Record[];
  history: D1mR3History[];
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

function isEvidenceKind(value: string): value is EosEvidenceSourceKind {
  return (EOS_EVIDENCE_SOURCE_KINDS as readonly string[]).includes(value);
}

function isGeometryType(value: string): boolean {
  return (D1M_0_GEOMETRY_EVIDENCE_CANDIDATES as readonly string[]).includes(value);
}

function isSemanticType(value: string): boolean {
  return (D1M_0_SEMANTIC_EVIDENCE_CANDIDATES as readonly string[]).includes(value);
}

function isCoordinate(value: string): value is (typeof D1M_0_COORDINATE_IDENTITIES)[number] {
  return (D1M_0_COORDINATE_IDENTITIES as readonly string[]).includes(value);
}

function assertScope(actor: D1mR3Actor, row: { tenantId: string; workspaceId: string; projectId: string }): void {
  if (actor.tenantId !== row.tenantId) fail("CROSS_TENANT_OPERATION");
  if (actor.workspaceId !== row.workspaceId || actor.projectId !== row.projectId) fail("CROSS_PROJECT_OPERATION");
}

function assertRecorder(actor: D1mR3Actor): void {
  if (!actor.actorId.trim() || !actor.tenantId.trim() || !actor.workspaceId.trim() || !actor.projectId.trim()) fail("SCOPE_REQUIRED");
  if (blockedParty(actor.actorId) || blockedParty(actor.authority)) fail("AI_NOT_EVIDENCE_AUTHORITY");
  if (actor.authority === "ADMINISTRATOR" || actor.authority === "ADMIN") fail("ADMIN_NOT_EVIDENCE_AUTHORITY");
  if (actor.authority === "ENGINEERING_APPROVAL_AUTHORITY") fail("EVIDENCE_AUTHORITY_NOT_ENGINEERING_APPROVAL");
  if (actor.authority === "CERTIFICATION_AUTHORITY") fail("EVIDENCE_AUTHORITY_NOT_CERTIFIER");
  if (actor.authority !== RECORDER) fail("UNAUTHORIZED");
}

function contextStatus(value: string | null): D1mR3ContextStatus {
  return value == null ? "UNRESOLVED_PENDING_R4" : "DECLARED_SOURCE";
}

function declaredText(value: string | null | undefined, code: string): string | null {
  if (value == null || value === "") return null;
  if (floating(value) || blockedParty(value)) fail(code);
  return value;
}

function bind(store: D1mR3Store, actor: D1mR3Actor, input: {
  evidenceId: string;
  mappingId: string;
  expectedSourceRevision?: string;
  expectedSourceObjectId?: string;
  expectedStructuralTargetId?: string;
  expectedMappingFingerprint?: string;
  tenantId?: string;
  workspaceId?: string;
  projectId?: string;
  ambiguous?: boolean;
  createMapping?: boolean;
  extractedFromFile?: boolean;
  formatSupported?: boolean;
  engineeringValidated?: boolean;
  certified?: boolean;
  evidenceKind: string;
  evidenceRef: string;
  provenanceRef: string;
}): { mapping: D1mR2Record; reference: D1mR1Record } {
  assertRecorder(actor);
  if (input.tenantId != null && input.tenantId !== actor.tenantId) fail("CROSS_TENANT_OPERATION");
  if (input.workspaceId != null && input.workspaceId !== actor.workspaceId) fail("CROSS_PROJECT_OPERATION");
  if (input.projectId != null && input.projectId !== actor.projectId) fail("CROSS_PROJECT_OPERATION");
  if (input.ambiguous === true) fail("AMBIGUOUS_EVIDENCE_UNRESOLVED");
  if (input.createMapping === true) fail("MAPPING_CREATION_NOT_IN_R3");
  if (input.extractedFromFile === true) fail("EXTRACTION_NOT_IN_R3");
  if (input.formatSupported === true) fail("FORMAT_SUPPORT_NOT_CLAIMED");
  if (input.engineeringValidated === true) fail("ENGINEERING_VALIDATION_NOT_IN_R3");
  if (input.certified === true) fail("EVIDENCE_NOT_CERTIFICATION");
  if (!input.evidenceId.trim() || floating(input.evidenceId) || blockedParty(input.evidenceId)) fail("EVIDENCE_IDENTITY_REQUIRED");
  if (!input.mappingId.trim()) fail("R2_MAPPING_REQUIRED");
  if (floating(input.mappingId)) fail("FLOATING_ARTIFACT_REFERENCE_REJECTED");
  if (input.expectedSourceRevision != null && floating(input.expectedSourceRevision)) fail("FLOATING_ARTIFACT_REFERENCE_REJECTED");
  if (!isEvidenceKind(input.evidenceKind) || !input.evidenceRef.trim() || blockedParty(input.evidenceRef)) fail("MISSING_EVIDENCE_PROVENANCE");
  if (!input.provenanceRef.trim() || blockedParty(input.provenanceRef)) fail("MISSING_EVIDENCE_PROVENANCE");
  const mapping = store.mappings.find((row) => row.mappingId === input.mappingId);
  if (!mapping) fail("R2_MAPPING_REQUIRED");
  if (mapping.recordStatus !== "CURRENT") fail("MAPPING_NOT_CURRENT");
  assertScope(actor, mapping);
  const reference = store.references.find((row) => row.referenceId === mapping.referenceId);
  if (!reference) fail("R1_REFERENCE_REQUIRED");
  assertScope(actor, reference);
  if (reference.sourceRevision !== mapping.sourceRevision || reference.metadataFingerprint !== mapping.r1MetadataFingerprint) {
    fail("REVISION_SUBSTITUTION_REJECTED");
  }
  if (input.expectedSourceRevision != null && input.expectedSourceRevision !== mapping.sourceRevision) fail("ARTIFACT_REVISION_MISMATCH");
  if (input.expectedSourceObjectId != null && input.expectedSourceObjectId !== mapping.sourceObjectId) fail("SOURCE_OBJECT_MISMATCH");
  if (input.expectedStructuralTargetId != null && input.expectedStructuralTargetId !== mapping.structuralTargetId) fail("TARGET_SUBSTITUTION_REJECTED");
  if (input.expectedMappingFingerprint != null && input.expectedMappingFingerprint !== mapping.mappingFingerprint) fail("FINGERPRINT_MISMATCH");
  return { mapping, reference };
}

function remember(store: D1mR3Store, record: D1mR3Record, action: D1mR3History["action"]): void {
  store.history.push({
    historyId: `hist-${store.history.length + 1}`,
    evidenceId: record.evidenceId,
    evidenceFamily: record.evidenceFamily,
    action,
    mappingId: record.mappingId,
    sourceRevision: record.sourceRevision,
    evidenceFingerprint: record.evidenceFingerprint,
    recordedAt: store.now(),
  });
}

function finish(
  store: D1mR3Store,
  actor: D1mR3Actor,
  mapping: D1mR2Record,
  reference: D1mR1Record,
  draft: Omit<D1mR3Record, "provenance" | "evidenceFingerprint" | "tenantId" | "workspaceId" | "projectId" | "recordedBy" | "recordStatus" | "evidenceStatus" | "humanReviewRecorded" | "predecessorEvidenceId"> & {
    evidenceKind: EosEvidenceSourceKind;
    evidenceRef: string;
    provenanceRef: string;
    predecessorEvidenceId: string | null;
  },
): D1mR3Record {
  const predecessor = draft.predecessorEvidenceId
    ? store.records.find((row) => row.evidenceId === draft.predecessorEvidenceId)
    : null;
  if (draft.predecessorEvidenceId) {
    if (!predecessor || predecessor.evidenceFamily !== draft.evidenceFamily) fail("EVIDENCE_NOT_FOUND");
    assertScope(actor, predecessor);
    if (predecessor.recordStatus !== "CURRENT" || predecessor.mappingId !== mapping.mappingId) fail("PREDECESSOR_NOT_CURRENT");
    if (predecessor.evidenceType !== draft.evidenceType || predecessor.sourcePropertyName !== draft.sourcePropertyName) fail("EVIDENCE_SUPERSESSION_MISMATCH");
  }
  const active = store.records.find((row) =>
    row.recordStatus === "CURRENT"
    && row.mappingId === mapping.mappingId
    && row.evidenceFamily === draft.evidenceFamily
    && row.evidenceType === draft.evidenceType
    && row.sourcePropertyName === draft.sourcePropertyName);
  if (active && active.evidenceId !== draft.evidenceId && active.evidenceId !== predecessor?.evidenceId) fail("EVIDENCE_CONFLICT");
  const body = {
    evidenceId: draft.evidenceId,
    evidenceFamily: draft.evidenceFamily,
    mappingId: mapping.mappingId,
    mappingFingerprint: mapping.mappingFingerprint,
    referenceId: reference.referenceId,
    sourceRevision: reference.sourceRevision,
    r1MetadataFingerprint: reference.metadataFingerprint,
    sourceObjectId: mapping.sourceObjectId,
    structuralTargetId: mapping.structuralTargetId,
    evidenceType: draft.evidenceType,
    sourcePropertyName: draft.sourcePropertyName,
    components: draft.components,
    labels: draft.labels,
    sourceValue: draft.sourceValue,
    declaredUnit: draft.declaredUnit,
    unitContextStatus: draft.unitContextStatus,
    coordinateIdentity: draft.coordinateIdentity,
    coordinateContextStatus: draft.coordinateContextStatus,
    declaredAxis: draft.declaredAxis,
    axisContextStatus: draft.axisContextStatus,
    provenanceRef: draft.provenanceRef,
    evidenceRef: draft.evidenceRef,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
    predecessorEvidenceId: predecessor?.evidenceId ?? null,
  };
  const evidenceFingerprint = fingerprintCanonical(body);
  if (predecessor) {
    const sameValue = predecessor.evidenceFingerprint === fingerprintCanonical({ ...body, evidenceId: predecessor.evidenceId, predecessorEvidenceId: predecessor.predecessorEvidenceId });
    if (sameValue) fail("EVIDENCE_UNCHANGED");
  }
  const existing = store.records.find((row) => row.evidenceId === draft.evidenceId);
  if (existing) {
    if (existing.evidenceFingerprint === evidenceFingerprint && !predecessor) return existing;
    fail("EVIDENCE_ALREADY_RECORDED");
  }
  const recordedAt = store.now();
  const record: D1mR3Record = {
    ...draft,
    evidenceFingerprint,
    provenance: {
      provenanceRef: draft.provenanceRef,
      evidenceRef: draft.evidenceRef,
      evidenceKind: draft.evidenceKind,
      actorId: actor.actorId,
      recordedAt,
      referenceId: reference.referenceId,
      sourceRevision: reference.sourceRevision,
      sourceObjectId: mapping.sourceObjectId,
      mappingId: mapping.mappingId,
      mappingFingerprint: mapping.mappingFingerprint,
      structuralTargetId: mapping.structuralTargetId,
      sourceAuthority: "SOURCE_AUTHORITY",
      evidenceAuthority: RECORDER,
      aiGenerated: false,
    },
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
    recordedBy: actor.actorId,
    recordStatus: "CURRENT",
    evidenceStatus: "RECORDED",
    predecessorEvidenceId: predecessor?.evidenceId ?? null,
    humanReviewRecorded: false,
  };
  if (predecessor) {
    predecessor.recordStatus = "SUPERSEDED";
    remember(store, predecessor, "SUPERSEDED");
  }
  store.records.push(record);
  remember(store, record, "CREATED");
  return record;
}

export function createD1mR3Store(input: { references: readonly D1mR1Record[]; mappings: readonly D1mR2Record[] }, now: () => string): D1mR3Store {
  return { references: input.references, mappings: input.mappings, now, records: [], history: [] };
}

export function recordGeometryEvidence(store: D1mR3Store, actor: D1mR3Actor, input: D1mR3GeometryInput): D1mR3Record {
  if (input.geometryValidated === true) fail("GEOMETRY_VALIDATION_NOT_IN_R3");
  if (input.inferEngineeringMeaning === true) fail("UNKNOWN_SEMANTIC_NOT_INFERRED");
  if (input.convertUnits === true) fail("UNIT_CONVERSION_NOT_IN_R3");
  if (input.transformCoordinates === true) fail("COORDINATE_TRANSFORMATION_NOT_IN_R3");
  if (input.inferAxis === true) fail("AXIS_INFERENCE_NOT_IN_R3");
  const bound = bind(store, actor, input);
  if (!isGeometryType(input.geometryType)) fail("GEOMETRY_TYPE_INVALID");
  if (!Array.isArray(input.components) || input.components.length === 0 || input.components.length > MAX_COMPONENTS) fail("GEOMETRY_VALUE_INVALID");
  const components = input.components.map((item) => {
    if (typeof item !== "number" || !Number.isFinite(item)) fail("GEOMETRY_VALUE_INVALID");
    return item;
  });
  const labels = (input.labels ?? []).map((item) => {
    if (typeof item !== "string" || item.length === 0 || item.length > 200) fail("GEOMETRY_VALUE_INVALID");
    return item;
  });
  if (labels.length > 8) fail("GEOMETRY_VALUE_INVALID");
  const declaredUnit = declaredText(input.declaredUnit, "UNIT_CONTEXT_INVALID");
  const declaredAxis = declaredText(input.declaredAxis, "AXIS_CONTEXT_INVALID");
  let coordinateIdentity: D1mR3Record["coordinateIdentity"] = null;
  if (input.coordinateIdentity != null && input.coordinateIdentity !== "") {
    if (!isCoordinate(input.coordinateIdentity)) fail("COORDINATE_CONTEXT_UNSUPPORTED");
    coordinateIdentity = input.coordinateIdentity;
  }
  if (!isEvidenceKind(input.evidenceKind)) fail("MISSING_EVIDENCE_PROVENANCE");
  return finish(store, actor, bound.mapping, bound.reference, {
    evidenceId: input.evidenceId,
    evidenceFamily: "GEOMETRY",
    referenceId: bound.reference.referenceId,
    artifactId: bound.reference.artifactId,
    sourceRevision: bound.reference.sourceRevision,
    r1MetadataFingerprint: bound.reference.metadataFingerprint,
    mappingId: bound.mapping.mappingId,
    mappingFingerprint: bound.mapping.mappingFingerprint,
    sourceObjectId: bound.mapping.sourceObjectId,
    structuralTargetId: bound.mapping.structuralTargetId,
    structuralTargetKind: bound.mapping.structuralTargetKind,
    evidenceType: input.geometryType,
    sourcePropertyName: null,
    components,
    labels,
    sourceValue: null,
    declaredUnit,
    unitContextStatus: contextStatus(declaredUnit),
    coordinateIdentity,
    coordinateContextStatus: contextStatus(coordinateIdentity),
    declaredAxis,
    axisContextStatus: contextStatus(declaredAxis),
    declaredFormat: input.declaredFormat ?? null,
    formatSupported: false,
    origin: "DECLARED_SOURCE",
    extractedFromFile: false,
    sourceAuthority: "SOURCE_AUTHORITY",
    evidenceAuthority: RECORDER,
    engineeringApprover: null,
    certificationAuthority: null,
    geometryValidated: false,
    engineeringValidated: false,
    structuralAdequacyConfirmed: false,
    structuralInterpretationApproved: false,
    sourceEqualsGovernedEngineeringSemantic: false,
    sourceClassEqualsValidatedStructuralClass: false,
    materialValidated: false,
    sectionValidated: false,
    loadValidated: false,
    supportValidated: false,
    reinforcementValidated: false,
    engineeringAxisAssigned: false,
    certified: false,
    evidenceKind: input.evidenceKind,
    evidenceRef: input.evidenceRef,
    provenanceRef: input.provenanceRef,
    predecessorEvidenceId: input.predecessorEvidenceId ?? null,
  });
}

export function recordSemanticEvidence(store: D1mR3Store, actor: D1mR3Actor, input: D1mR3SemanticInput): D1mR3Record {
  if (input.inferEngineeringMeaning === true || input.engineeringSemanticId != null) fail("UNKNOWN_SEMANTIC_NOT_INFERRED");
  if (input.validatedMaterial === true) fail("MATERIAL_VALIDATION_NOT_IN_R3");
  if (input.validatedSection === true) fail("SECTION_VALIDATION_NOT_IN_R3");
  if (input.validatedLoad === true) fail("LOAD_VALIDATION_NOT_IN_R3");
  if (input.validatedSupport === true) fail("SUPPORT_VALIDATION_NOT_IN_R3");
  if (input.validatedReinforcement === true) fail("REINFORCEMENT_VALIDATION_NOT_IN_R3");
  if (input.validatedStructuralClass === true) fail("STRUCTURAL_CLASS_VALIDATION_NOT_IN_R3");
  const bound = bind(store, actor, input);
  if (!isSemanticType(input.semanticType)) fail("SEMANTIC_TYPE_INVALID");
  if (!input.sourcePropertyName || blockedParty(input.sourcePropertyName)) fail("SOURCE_PROPERTY_REQUIRED");
  if (typeof input.sourceValue !== "string" || input.sourceValue.length === 0 || input.sourceValue.length > 400) fail("SOURCE_VALUE_REQUIRED");
  const declaredUnit = declaredText(input.declaredUnit, "UNIT_CONTEXT_INVALID");
  if (!isEvidenceKind(input.evidenceKind)) fail("MISSING_EVIDENCE_PROVENANCE");
  return finish(store, actor, bound.mapping, bound.reference, {
    evidenceId: input.evidenceId,
    evidenceFamily: "SEMANTIC",
    referenceId: bound.reference.referenceId,
    artifactId: bound.reference.artifactId,
    sourceRevision: bound.reference.sourceRevision,
    r1MetadataFingerprint: bound.reference.metadataFingerprint,
    mappingId: bound.mapping.mappingId,
    mappingFingerprint: bound.mapping.mappingFingerprint,
    sourceObjectId: bound.mapping.sourceObjectId,
    structuralTargetId: bound.mapping.structuralTargetId,
    structuralTargetKind: bound.mapping.structuralTargetKind,
    evidenceType: input.semanticType,
    sourcePropertyName: input.sourcePropertyName,
    components: null,
    labels: null,
    sourceValue: input.sourceValue,
    declaredUnit,
    unitContextStatus: contextStatus(declaredUnit),
    coordinateIdentity: null,
    coordinateContextStatus: "UNRESOLVED_PENDING_R4",
    declaredAxis: null,
    axisContextStatus: "UNRESOLVED_PENDING_R4",
    declaredFormat: input.declaredFormat ?? null,
    formatSupported: false,
    origin: "DECLARED_SOURCE",
    extractedFromFile: false,
    sourceAuthority: "SOURCE_AUTHORITY",
    evidenceAuthority: RECORDER,
    engineeringApprover: null,
    certificationAuthority: null,
    geometryValidated: false,
    engineeringValidated: false,
    structuralAdequacyConfirmed: false,
    structuralInterpretationApproved: false,
    sourceEqualsGovernedEngineeringSemantic: false,
    sourceClassEqualsValidatedStructuralClass: false,
    materialValidated: false,
    sectionValidated: false,
    loadValidated: false,
    supportValidated: false,
    reinforcementValidated: false,
    engineeringAxisAssigned: false,
    certified: false,
    evidenceKind: input.evidenceKind,
    evidenceRef: input.evidenceRef,
    provenanceRef: input.provenanceRef,
    predecessorEvidenceId: input.predecessorEvidenceId ?? null,
  });
}

export function confirmModelEvidence(store: D1mR3Store, actor: D1mR3Actor, evidenceId: string): D1mR3Record {
  if (!actor.actorId.trim()) fail("SCOPE_REQUIRED");
  if (blockedParty(actor.actorId) || blockedParty(actor.authority)) fail("AI_NOT_EVIDENCE_AUTHORITY");
  if (actor.authority === "ADMINISTRATOR" || actor.authority === "ADMIN") fail("ADMIN_NOT_EVIDENCE_AUTHORITY");
  if (actor.authority === "ENGINEERING_APPROVAL_AUTHORITY") fail("EVIDENCE_AUTHORITY_NOT_ENGINEERING_APPROVAL");
  if (actor.authority === "CERTIFICATION_AUTHORITY") fail("EVIDENCE_AUTHORITY_NOT_CERTIFIER");
  if (actor.authority !== REVIEWER) fail("UNAUTHORIZED");
  const record = store.records.find((row) => row.evidenceId === evidenceId);
  if (!record) fail("EVIDENCE_NOT_FOUND");
  assertScope(actor, record);
  if (record.recordStatus !== "CURRENT") fail("EVIDENCE_NOT_CURRENT");
  const fingerprintBefore = record.evidenceFingerprint;
  const componentsBefore = record.components?.slice() ?? null;
  const valueBefore = record.sourceValue;
  record.evidenceStatus = "CONFIRMED";
  record.humanReviewRecorded = true;
  record.geometryValidated = false;
  record.engineeringValidated = false;
  record.structuralAdequacyConfirmed = false;
  record.certified = false;
  if (record.evidenceFingerprint !== fingerprintBefore || record.sourceValue !== valueBefore) fail("EVIDENCE_MUTATED");
  if (componentsBefore && record.components?.some((item, index) => item !== componentsBefore[index])) fail("EVIDENCE_MUTATED");
  remember(store, record, "CONFIRMED");
  return record;
}

export function supersedeGeometryEvidence(store: D1mR3Store, actor: D1mR3Actor, input: D1mR3GeometryInput): D1mR3Record {
  if (!input.predecessorEvidenceId) fail("EVIDENCE_NOT_FOUND");
  return recordGeometryEvidence(store, actor, input);
}

export function supersedeSemanticEvidence(store: D1mR3Store, actor: D1mR3Actor, input: D1mR3SemanticInput): D1mR3Record {
  if (!input.predecessorEvidenceId) fail("EVIDENCE_NOT_FOUND");
  return recordSemanticEvidence(store, actor, input);
}

export function createSourceObjectMapping(): never {
  return fail("MAPPING_CREATION_NOT_IN_R3");
}

export function upgradeEvidenceArtifactRevision(): never {
  return fail("EVIDENCE_ARTIFACT_REVISION_AUTO_UPGRADE_REJECTED");
}

export function upgradeEvidenceMapping(): never {
  return fail("EVIDENCE_MAPPING_AUTO_UPGRADE_REJECTED");
}

export function mutateGeometryEvidence(): never {
  return fail("SILENT_GEOMETRY_MUTATION_REJECTED");
}

export function mutateSemanticEvidence(): never {
  return fail("SILENT_SEMANTIC_MUTATION_REJECTED");
}

export function parseCadBimArtifact(): never {
  return fail("PARSE_NOT_IN_R3");
}

export function ingestCadBimFile(): never {
  return fail("FILE_INGESTION_NOT_IN_R3");
}

export function extractCadBimObjects(): never {
  return fail("OBJECT_EXTRACTION_NOT_IN_R3");
}

export function adaptCadBimFormat(): never {
  return fail("FORMAT_ADAPTER_NOT_IN_R3");
}

export function connectCadBimVendor(): never {
  return fail("CONNECTOR_NOT_IN_R3");
}

export function matchObjectByGeometry(): never {
  return fail("GEOMETRY_MATCHING_NOT_IN_R3");
}

export function matchObjectBySemantics(): never {
  return fail("SEMANTIC_MATCHING_NOT_IN_R3");
}

export function convertCadBimUnits(): never {
  return fail("UNIT_CONVERSION_NOT_IN_R3");
}

export function transformCadBimCoordinates(): never {
  return fail("COORDINATE_TRANSFORMATION_NOT_IN_R3");
}

export function inferCadBimAxes(): never {
  return fail("AXIS_INFERENCE_NOT_IN_R3");
}

export function inferStructuralConnectivity(): never {
  return fail("CONNECTIVITY_INFERENCE_NOT_IN_R3");
}

export function inferLoadPath(): never {
  return fail("LOAD_PATH_INFERENCE_NOT_IN_R3");
}

export function inferCadBimRelationships(): never {
  return fail("RELATIONSHIP_NOT_IN_R3");
}

export function interpretCadBimEngineeringProperties(): never {
  return fail("ENGINEERING_PROPERTY_INTERPRETATION_NOT_IN_R3");
}

export function extractModelByAi(): never {
  return fail("AI_EXTRACTION_NOT_IN_R3");
}

export function runGeometryEngine(): never {
  return fail("GEOMETRY_ENGINE_NOT_IN_R3");
}

export function correctCadBimModel(): never {
  return fail("MODEL_CORRECTION_NOT_IN_R3");
}

export function authorCadModel(): never {
  return fail("CAD_AUTHORING_NOT_IN_R3");
}

export function authorBimModel(): never {
  return fail("BIM_AUTHORING_NOT_IN_R3");
}
