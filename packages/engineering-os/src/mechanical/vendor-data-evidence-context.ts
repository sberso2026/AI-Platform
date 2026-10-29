/**
 * EOS-D4-R4 — Mechanical vendor data and evidence context.
 * Records supplied vendor documents and evidence. Does not adopt, validate, or calculate them.
 */
import {
  D4_CURRENTNESS_STATES,
  D4_EQUALS_D1_STRUCTURAL_AUTHORITY,
  D4_EQUALS_D2_CIVIL_AUTHORITY,
  D4_EQUALS_D3_GEOTECHNICAL_AUTHORITY,
  D4_EQUALS_D5_PIPING_AUTHORITY,
  D4_EQUALS_D6_PROCESS_AUTHORITY,
  D4_EQUALS_D7_ELECTRICAL_AUTHORITY,
  D4_EQUALS_D8_INSTRUMENTATION_CONTROL_AUTHORITY,
  D4_EVIDENCE_CLASSES,
  D4_FINGERPRINT_ALGORITHM,
  D4_IMPLEMENTATION_PHASES,
  D4_VENDOR_INFORMATION_KINDS,
  EVIDENCE_EQUALS_MECHANICAL_VALIDATION,
  VENDOR_DATA_EQUALS_ENGINEERING_VALIDATED,
} from "@rtb/types";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import {
  D4_CONTEXT_AUTHORITY,
  D4_MECHANICAL_IDENTITY_OBJECT_FOUNDATION_RUNTIME_READY as R1_IDENTITY_READY,
  type D4R1Actor,
} from "./identity-foundation";
import {
  D4_EQUIPMENT_SYSTEM_CONTEXT_RUNTIME_READY,
  D4_RUNTIME_COUNT as D4_R2_RUNTIME_COUNT,
} from "./equipment-system-context";
import {
  D4_DESIGN_CONDITION_PERFORMANCE_RUNTIME_READY,
  D4_RUNTIME_COUNT as D4_R3_RUNTIME_COUNT,
  D4_VENDOR_DATA_EVIDENCE_RUNTIME_READY as R3_VENDOR_READY,
  type D4R3Store,
} from "./design-condition-performance-context";

export const D4_R4_STATUS = "VENDOR_DATA_AND_EVIDENCE_CONTEXT_IMPLEMENTED" as const;
export const D4_R4_MATURITY = D4_R4_STATUS;
export const D4_R4_MATURITY_STATE = D4_R4_STATUS;
export const D4_RUNTIME_STARTED = true as const;
export const D4_RUNTIME_COUNT = 4 as const;
export const D4_VENDOR_DATA_EVIDENCE_RUNTIME_IMPLEMENTED = true as const;
export const D4_VENDOR_DATA_EVIDENCE_RUNTIME_COUNT = 1 as const;
export const D4_VENDOR_DATA_EVIDENCE_RUNTIME_READY = true as const;
export const D4_VENDOR_MANUFACTURER_IDENTITY_CONTEXT_IMPLEMENTED = true as const;
export const EXACT_VENDOR_DOCUMENT_REVISION_REQUIRED = true as const;
export const FLOATING_VENDOR_DOCUMENT_REFERENCE_ALLOWED = false as const;
export const VENDOR_DOCUMENT_AUTO_REPOINTED = false as const;
export const D4_VENDOR_EVIDENCE_CLASSIFICATION_IMPLEMENTED = true as const;
export const D4_VENDOR_EVIDENCE_CLASSIFICATION_ALLOWLIST_ENFORCED = true as const;
export const FREEFORM_AUTHORITATIVE_VENDOR_EVIDENCE_CLASS_ALLOWED = false as const;
export const UNKNOWN_VENDOR_EVIDENCE_CLASS_AUTO_ACCEPTED = false as const;
export const D4_VENDOR_EVIDENCE_EQUIPMENT_ASSOCIATION_IMPLEMENTED = true as const;
export const EXACT_D4_EQUIPMENT_REFERENCE_REQUIRED = true as const;
export const D4_INFERRED_VENDOR_EQUIPMENT_ASSOCIATION_ALLOWED = false as const;
export const D4_VENDOR_DATA_CONTEXT_IMPLEMENTED = true as const;
export const AI_CAN_INVENT_VENDOR_VALUE = false as const;
export const ADMIN_CAN_INVENT_VENDOR_VALUE_AS_VENDOR_SOURCE = false as const;
export const D4_VENDOR_SOURCE_STATUS_CONTEXT_IMPLEMENTED = true as const;

export const D4_R1_IDENTITY_REUSED = true as const;
export const D4_R2_EQUIPMENT_SYSTEM_CONTEXT_REUSED = true as const;
export const D4_R3_DESIGN_CONDITION_PERFORMANCE_CONTEXT_REUSED = true as const;
export const EXACT_D4_R1_R3_REFERENCE_REQUIRED = true as const;
export const FLOATING_D4_R4_SOURCE_REFERENCE_ALLOWED = false as const;
export const D4_R4_SOURCE_AUTO_REPOINTED = false as const;

export const VENDOR_DATA_EQUALS_MECHANICAL_ENGINEERING_ADOPTION = false as const;
export const VENDOR_DATA_EQUALS_ENGINEERING_APPROVED = false as const;
export const VENDOR_DATA_EQUALS_EOS_CERTIFIED = false as const;
export { VENDOR_DATA_EQUALS_ENGINEERING_VALIDATED };
export const VENDOR_CERTIFIED_EQUALS_EOS_VALIDATED = false as const;
export const VENDOR_CERTIFIED_EQUALS_PROJECT_APPROVED = false as const;
export const VENDOR_CERTIFIED_EQUALS_REGULATORY_CERTIFIED = false as const;
export { EVIDENCE_EQUALS_MECHANICAL_VALIDATION };
export const EVIDENCE_EQUALS_MECHANICAL_APPROVAL = false as const;
export const EVIDENCE_EQUALS_MECHANICAL_CONFORMANCE = false as const;
export const D4_R4_AUTO_MUTATES_R3_DESIGN_CONDITION = false as const;
export const D4_R4_AUTO_MUTATES_R3_PERFORMANCE_CONTEXT = false as const;
export const VENDOR_VALUE_AUTO_ADOPTED_AS_MECHANICAL_ENGINEERING = false as const;
export const AI_CAN_AUTOMATICALLY_ADOPT_VENDOR_VALUE = false as const;
export const ADMIN_CAN_AUTOMATICALLY_ADOPT_VENDOR_VALUE_AS_ENGINEERING = false as const;
export const D4_VENDOR_PERFORMANCE_CURVE_EVIDENCE_SUPPORTED = true as const;
export const D4_R4_PERFORMANCE_CURVE_CALCULATION_RUNTIME_COUNT = 0 as const;
export const VENDOR_PERFORMANCE_CURVE_EQUALS_VALIDATED_MECHANICAL_PERFORMANCE = false as const;
export const D4_VENDOR_INSPECTION_TEST_EVIDENCE_SUPPORTED = true as const;
export const VENDOR_TEST_RESULT_EQUALS_MECHANICAL_VALIDATION = false as const;
export const VENDOR_INSPECTION_PASS_EQUALS_PROJECT_APPROVAL = false as const;
export const D4_VENDOR_CERTIFICATE_EVIDENCE_SUPPORTED = true as const;
export const CERTIFICATE_EVIDENCE_EQUALS_EOS_CERTIFICATION = false as const;
export const CERTIFICATE_EVIDENCE_EQUALS_ENGINEERING_VALIDATED = false as const;
export const D4_R4_UNITS_REQUIRED_FOR_NUMERIC_VENDOR_DATA = true as const;
export const D4_R4_UNIT_SEMANTICS_PRESERVED = true as const;
export const AI_CAN_SILENTLY_CHANGE_D4_R4_UNIT = false as const;
export const D4_REUSES_CANONICAL_CURRENTNESS = true as const;
export const PARALLEL_D4_CURRENTNESS_ENGINE_CREATED = false as const;
export const D4_VENDOR_DOCUMENT_CURRENTNESS_IMPLEMENTED = true as const;
export const SUPERSEDED_VENDOR_DOCUMENT_DELETED = false as const;
export const NEW_VENDOR_REVISION_AUTO_ADOPTED_AS_ENGINEERING = false as const;
export const D4_REUSES_CANONICAL_FINGERPRINT = true as const;
export const SECOND_D4_FINGERPRINT_ALGORITHM_CREATED = false as const;
export const D4_FINGERPRINT_ALGORITHM_REUSED = D4_FINGERPRINT_ALGORITHM;
export const D4_R4_PROVENANCE_REQUIRED = true as const;
export const D4_R4_PROVENANCE_PRESERVED = true as const;
export const D4_R4_AUTO_REPOINTED = false as const;
export const SILENT_D4_R4_MUTATION_ALLOWED = false as const;
export const D4_R4_HISTORY_PRESERVED = true as const;
export const TENANT_WORKSPACE_PROJECT_D4_R4_SCOPE_ENFORCED = true as const;

export const AI_EQUALS_D4_MECHANICAL_ENGINEERING_AUTHORITY = false as const;
export const ADMIN_EQUALS_D4_MECHANICAL_ENGINEERING_AUTHORITY = false as const;
export const VENDOR_EQUALS_D4_PROJECT_ENGINEERING_AUTHORITY = false as const;
export {
  D4_EQUALS_D1_STRUCTURAL_AUTHORITY,
  D4_EQUALS_D2_CIVIL_AUTHORITY,
  D4_EQUALS_D3_GEOTECHNICAL_AUTHORITY,
  D4_EQUALS_D5_PIPING_AUTHORITY,
  D4_EQUALS_D6_PROCESS_AUTHORITY,
  D4_EQUALS_D7_ELECTRICAL_AUTHORITY,
  D4_EQUALS_D8_INSTRUMENTATION_CONTROL_AUTHORITY,
};

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
export const D4_CONFORMANCE_DETERMINATION_RUNTIME_COUNT = 0 as const;
export const D4_APPROVAL_RUNTIME_COUNT = 0 as const;
export const D4_CERTIFICATION_RUNTIME_COUNT = 0 as const;
export const D4_R4_DUPLICATE_GOVERNANCE_IMPLEMENTED = true as const;
export const D4_R4_REPLAY_PROTECTION_IMPLEMENTED = true as const;
export const D4_R4_SPOOFING_PROTECTION_IMPLEMENTED = true as const;
export const D4_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT = 0 as const;
export const D4_CROSS_DISCIPLINE_CONFLICT_DETECTION_RUNTIME_COUNT = 0 as const;
export const D4_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT = 0 as const;
export const D4_D9_RUNTIME_INTEGRATION_COUNT = 0 as const;

export const D5_RUNTIME_STARTED = false as const;
export const D6_RUNTIME_STARTED = false as const;
export const D7_RUNTIME_STARTED = false as const;
export const D8_RUNTIME_STARTED = false as const;
export const D9_RUNTIME_STARTED = false as const;
export const D9_RUNTIME_COUNT = 0 as const;
export const DATABASE_SCHEMA_CHANGED = false as const;
export const NEW_DEPENDENCY_ADDED = false as const;
export const NEW_SUBSTANTIVE_RUNTIME_ADDED = false as const;

export const D1_STRUCTURAL_PACK_COMPLETE = false as const;
export const D1N_REOPENED = false as const;
export const D2_TRACK_COMPLETE = true as const;
export const D2_REOPENED = false as const;
export const D3_TRACK_COMPLETE = true as const;
export const D3_TRACK_COMPLETION_CLASSIFICATION = "COMPLETE_BOUNDED_WITH_LIMITATIONS" as const;
export const D3_REOPENED = false as const;

export const D4_MECHANICAL_IDENTITY_OBJECT_FOUNDATION_RUNTIME_READY = R1_IDENTITY_READY;
export const D4_EQUIPMENT_SYSTEM_CONTEXT_RUNTIME_READY_REUSED = D4_EQUIPMENT_SYSTEM_CONTEXT_RUNTIME_READY;
export const D4_DESIGN_CONDITION_PERFORMANCE_RUNTIME_READY_REUSED = D4_DESIGN_CONDITION_PERFORMANCE_RUNTIME_READY;
export const D4_R2_RUNTIME_COUNT_REUSED = D4_R2_RUNTIME_COUNT;
export const D4_R3_RUNTIME_COUNT_REUSED = D4_R3_RUNTIME_COUNT;
export const D4_R3_VENDOR_DATA_EVIDENCE_RUNTIME_READY = R3_VENDOR_READY;

export const D4_MECHANICAL_TECHNICAL_CONTEXT_RUNTIME_READY = false as const;
export const D4_MAINTAINABILITY_ACCESS_PACKAGE_RUNTIME_READY = false as const;
export const D4_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY = false as const;
export const D4_DISCIPLINE_INTERFACE_RUNTIME_READY = false as const;
export const D4_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_READY = false as const;
export const D4_CURRENTNESS_DIGITAL_THREAD_RUNTIME_READY = false as const;
export const D4_D9_SOURCE_CONTRACT_RUNTIME_READY = false as const;

export const UNAUTHORIZED_D1_PACK_COMPLETION = false as const;
export const UNAUTHORIZED_D2_REOPEN = false as const;
export const UNAUTHORIZED_D3_REOPEN = false as const;
export const UNAUTHORIZED_D4_R5_R12_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_D5_D8_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_D9_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_VENDOR_AUTO_ADOPTION_PROMOTION = false as const;
export const UNAUTHORIZED_MECHANICAL_CALCULATION_PROMOTION = false as const;
export const UNAUTHORIZED_MECHANICAL_VALIDATION_PROMOTION = false as const;
export const UNAUTHORIZED_MECHANICAL_APPROVAL_PROMOTION = false as const;
export const UNAUTHORIZED_MECHANICAL_CERTIFICATION_PROMOTION = false as const;
export const UNAUTHORIZED_CROSS_DISCIPLINE_REASONING_PROMOTION = false as const;
export const UNAUTHORIZED_GA_PROMOTION = false as const;
export const UNAUTHORIZED_PRODUCT_CLAIM = false as const;

export const D4_R5_CANONICAL_PHASE = D4_IMPLEMENTATION_PHASES[4];
export const D4_R5_PHASE_TYPE = "MECHANICAL_REQUIREMENTS_AND_TECHNICAL_CONTEXT" as const;
export const D4_R5_CANONICAL_SCOPE =
  "Implement governed Mechanical technical requirements and equipment-specific technical context using exact R1-R4 identities, design/performance context and vendor evidence. Preserve source/basis, authority, applicability and limitations. Do not perform sizing/calculations, automatically resolve vendor/engineering discrepancies, implement maintainability/package context, discipline interfaces, review/validation or D5-D9 runtime." as const;
export const D4_R5_STARTED = false as const;
export const D4_R4_READY_FOR_NEXT_PHASE = true as const;
export const D4_R4_NEXT_PHASE = D4_R5_CANONICAL_PHASE;
export const D4_R4_NEXT_PHASE_TYPE = D4_R5_PHASE_TYPE;
export const D4_R4_CANONICAL_NEXT_PHASE = D4_R5_CANONICAL_PHASE;
export const D4_R4_CANONICAL_NEXT_PHASE_SCOPE = D4_R5_CANONICAL_SCOPE;
export const D4_R4_BLOCKER = "NONE" as const;
export const D4_R4_MACHINE_READABLE_ROADMAP_UPDATED = true as const;

export const D4_R4_EVIDENCE_CLASSES = [
  ...D4_EVIDENCE_CLASSES,
  ...D4_VENDOR_INFORMATION_KINDS,
  "MANUFACTURER_DATASHEET",
  "VENDOR_DRAWING",
  "PERFORMANCE_CURVE",
  "INSPECTION_REPORT",
  "TEST_REPORT",
  "VENDOR_DEVIATION",
  "PROJECT_SUPPLIED_MECHANICAL_EVIDENCE",
] as const;
export type D4R4EvidenceClass = (typeof D4_R4_EVIDENCE_CLASSES)[number];

export const D4_R4_SOURCE_STATUSES = [
  "PRELIMINARY",
  "FOR_INFORMATION",
  "FOR_REVIEW",
  "APPROVED_BY_VENDOR",
  "CERTIFIED_BY_VENDOR",
  "AS_BUILT",
  "SUPERSEDED",
] as const;
export type D4R4SourceStatus = (typeof D4_R4_SOURCE_STATUSES)[number];

export const D4_R4_VENDOR_DATA_KINDS = [
  "DIMENSIONS",
  "DRY_MASS",
  "OPERATING_MASS",
  "TEST_MASS",
  "TRANSPORT_MASS",
  "CENTER_OF_GRAVITY",
  "EQUIPMENT_GEOMETRY",
  "NOZZLE_INTERFACE",
  "PERFORMANCE_CURVE",
  "SPEED",
  "POWER",
  "EFFICIENCY",
  "CAPACITY",
  "HEAD",
  "ALLOWABLE_LOAD",
  "VIBRATION_INFORMATION",
  "NOISE_INFORMATION",
  "MATERIAL",
  "PACKAGE_LIMIT",
  "DESIGN_RATING",
  "OPERATING_RATING",
  "MAINTENANCE_INFORMATION",
  "VENDOR_LIMITATION",
] as const;

export const D4_R4_RECORD_CLASSES = [
  "VENDOR_DOCUMENT",
  "VENDOR_DATA",
  "PERFORMANCE_CURVE_EVIDENCE",
  "INSPECTION_TEST_EVIDENCE",
  "CERTIFICATE_EVIDENCE",
] as const;
export type D4R4RecordClass = (typeof D4_R4_RECORD_CLASSES)[number];
export type D4R4SubjectKind = "CLASSIFICATION" | "SERVICE" | "MEMBERSHIP" | "DESCRIPTION";

const FLOATING = new Set(["latest", "current", "newest", "head", "active", "active model"]);

export type D4R4SourceDifference = {
  r3RecordId: string;
  r3Fingerprint: string;
  r3Value: string;
  vendorValue: string;
  engineeringAcceptance: false;
};

export type D4R4Record = {
  recordId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  contextId: string;
  objectId: string;
  objectRevisionFingerprint: string;
  r2SubjectKind: D4R4SubjectKind;
  r2SubjectId: string;
  r2RevisionFingerprint: string;
  r3RecordId: string;
  r3RevisionFingerprint: string;
  recordClass: D4R4RecordClass;
  vendorIdentity: string;
  sourceOrganization: string;
  documentRef: string;
  documentRevision: string;
  evidenceClass: string;
  sourceStatus: D4R4SourceStatus | null;
  sourceDate: string | null;
  dataKind: string | null;
  suppliedValue: string | null;
  unit: string | null;
  statedResult: string | null;
  inspectionOrTestType: string | null;
  parentDocumentId: string | null;
  parentDocumentFingerprint: string | null;
  sourceDifference: D4R4SourceDifference | null;
  vendorData: true;
  mechanicalEngineeringAdoption: false;
  engineeringValidated: false;
  engineeringApproved: false;
  eosCertified: false;
  vendorCertifiedBySource: boolean;
  projectApproved: false;
  regulatoryCertified: false;
  mechanicalValidation: false;
  mechanicalConformance: false;
  calculated: false;
  limitations: string;
  provenanceRef: string;
  fingerprint: string;
  predecessorRecordId: string | null;
  predecessorFingerprint: string | null;
  recordStatus: "CURRENT" | "SUPERSEDED";
  currentness: (typeof D4_CURRENTNESS_STATES)[number];
  citedCurrentness: (typeof D4_CURRENTNESS_STATES)[number] | null;
  createdAt: string;
  createdBy: string;
};

export type D4R4HistoryRecord = {
  historyId: string;
  recordId: string;
  fingerprint: string;
  recordStatus: "CURRENT" | "SUPERSEDED";
  recordedAt: string;
};

export type D4R4Store = {
  r3: D4R3Store;
  now: () => string;
  records: D4R4Record[];
  history: D4R4HistoryRecord[];
};

type Actor = D4R1Actor;

type BoundInput = {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  contextId: string;
  objectId: string;
  objectRevisionFingerprint: string;
  r2SubjectKind: D4R4SubjectKind;
  r2SubjectId: string;
  r2RevisionFingerprint: string;
  r3RecordId: string;
  r3RevisionFingerprint: string;
  citedCurrentness?: (typeof D4_CURRENTNESS_STATES)[number] | null;
  vendorIdentity: string;
  sourceOrganization: string;
  documentRef: string;
  documentRevision: string;
  evidenceClass: string;
  sourceStatus?: string | null;
  sourceDate?: string | null;
  limitations: string;
  provenanceRef: string;
  recordId: string;
  predecessorRecordId?: string | null;
  suppliedValue?: string | null;
  unit?: string | null;
  normalizedUnit?: string | null;
  dataKind?: string | null;
  statedResult?: string | null;
  inspectionOrTestType?: string | null;
  parentDocumentId?: string | null;
  parentDocumentFingerprint?: string | null;
  inferFromFileName?: boolean;
  fileName?: string | null;
  similarTag?: boolean;
  filenameAssociation?: boolean;
  textSimilarity?: boolean;
  documentProximity?: boolean;
  vendorNamingConvention?: boolean;
  invented?: boolean;
  adminSuppliedAsVendor?: boolean;
  eosValidated?: boolean;
  eosCertified?: boolean;
  projectApproved?: boolean;
  regulatoryCertified?: boolean;
  mechanicalEngineeringAdoption?: boolean;
  interpolate?: boolean;
  calculateDuty?: boolean;
  mutateR3?: boolean;
  disciplineInterface?: boolean;
  formula?: boolean;
};

function fail(code: string): never {
  throw new Error(`D4_R4_${code}`);
}

function explicit(value: string, code: string): string {
  const token = value.trim();
  if (!token || FLOATING.has(token.toLowerCase())) fail(code);
  return token;
}

function currentnessOf(
  value: (typeof D4_CURRENTNESS_STATES)[number] | null | undefined,
  code: string,
): (typeof D4_CURRENTNESS_STATES)[number] | null {
  if (value === undefined || value === null) return null;
  if (!(D4_CURRENTNESS_STATES as readonly string[]).includes(value)) fail(code);
  return value;
}

function assertActor(actor: Actor): void {
  if (/^AI(?:\b|_)/i.test(actor.actorId) || actor.actorId === "LLM" || actor.actorId === "OPTIMIZER") {
    fail("AI_NOT_MECHANICAL_AUTHORITY");
  }
  if (actor.actorId === "ADMIN" || actor.actorId === "ADMINISTRATOR" || actor.authority === "ADMIN" || actor.authority === "ADMINISTRATOR") {
    fail("ADMIN_NOT_MECHANICAL_AUTHORITY");
  }
  if (actor.actorId === "VENDOR" || actor.authority === "VENDOR") fail("VENDOR_NOT_PROJECT_ENGINEERING_AUTHORITY");
  if (actor.authority === "MECHANICAL_ENGINEERING_AUTHORITY") fail("AUTHORITY_SPOOFING_REJECTED");
  if (actor.authority !== D4_CONTEXT_AUTHORITY) fail("RECORDER_AUTHORITY_INVALID");
}

function assertNoPromotion(input: BoundInput): void {
  if (input.inferFromFileName === true) fail("INFERRED_VENDOR_IDENTITY_REJECTED");
  if (
    input.similarTag === true ||
    input.filenameAssociation === true ||
    input.textSimilarity === true ||
    input.documentProximity === true ||
    input.vendorNamingConvention === true
  ) {
    fail("INFERRED_EQUIPMENT_ASSOCIATION_REJECTED");
  }
  if (input.invented === true) fail("INVENTED_VENDOR_VALUE_REJECTED");
  if (input.adminSuppliedAsVendor === true) fail("ADMIN_VENDOR_VALUE_REJECTED");
  if (input.eosValidated === true || input.eosCertified === true || input.projectApproved === true || input.regulatoryCertified === true) {
    fail("STATUS_SPOOFING_REJECTED");
  }
  if (input.mechanicalEngineeringAdoption === true) fail("ENGINEERING_ADOPTION_REJECTED");
  if (input.interpolate === true || input.calculateDuty === true || input.formula === true) fail("CURVE_CALCULATION_REJECTED");
  if (input.mutateR3 === true) fail("R3_MUTATION_REJECTED");
  if (input.disciplineInterface === true) fail("DISCIPLINE_INTERFACE_REJECTED");
  if (input.normalizedUnit) fail("UNIT_CHANGE_REJECTED");
}

function requireChain(store: D4R4Store, actor: Actor, input: BoundInput): {
  objectId: string;
  objectRevisionFingerprint: string;
  r2SubjectId: string;
  r2RevisionFingerprint: string;
  r3RecordId: string;
  r3RevisionFingerprint: string;
  r3Value: string;
} {
  assertActor(actor);
  const tenantId = explicit(input.tenantId, "SCOPE_REQUIRED");
  const workspaceId = explicit(input.workspaceId, "SCOPE_REQUIRED");
  const projectId = explicit(input.projectId, "SCOPE_REQUIRED");
  if (tenantId !== actor.tenantId || workspaceId !== actor.workspaceId || projectId !== actor.projectId) {
    fail("SCOPE_MISMATCH");
  }
  const contextId = explicit(input.contextId, "R1_CONTEXT_REQUIRED");
  const context = store.r3.r2.r1.contexts.find((row) => row.contextId === contextId);
  if (!context) fail("R1_CONTEXT_NOT_FOUND");
  if (context.tenantId !== tenantId || context.workspaceId !== workspaceId || context.projectId !== projectId) {
    fail("CROSS_SCOPE_REFERENCE_REJECTED");
  }
  const objectId = explicit(input.objectId, "R1_OBJECT_REQUIRED");
  const objectRevision = explicit(input.objectRevisionFingerprint, "R1_REVISION_REQUIRED");
  const object = store.r3.r2.r1.objects.find((row) => row.objectId === objectId);
  if (!object || object.contextId !== context.contextId) fail("R1_OBJECT_NOT_FOUND");
  if (object.fingerprint !== objectRevision) fail("R1_REVISION_MISMATCH");
  if (object.tenantId !== tenantId || object.workspaceId !== workspaceId || object.projectId !== projectId) {
    fail("CROSS_SCOPE_REFERENCE_REJECTED");
  }
  const subjectKind = input.r2SubjectKind;
  if (!["CLASSIFICATION", "SERVICE", "MEMBERSHIP", "DESCRIPTION"].includes(subjectKind)) fail("R2_SUBJECT_KIND_INVALID");
  const subjectId = explicit(input.r2SubjectId, "R2_SUBJECT_REQUIRED");
  const subjectRevision = explicit(input.r2RevisionFingerprint, "R2_REVISION_REQUIRED");
  const rows =
    subjectKind === "CLASSIFICATION"
      ? store.r3.r2.classifications
      : subjectKind === "SERVICE"
        ? store.r3.r2.services
        : subjectKind === "MEMBERSHIP"
          ? store.r3.r2.memberships
          : store.r3.r2.descriptions;
  const subject = rows.find((row) => {
    if (subjectKind === "CLASSIFICATION" && "classificationId" in row) return row.classificationId === subjectId;
    if (subjectKind === "SERVICE" && "serviceContextId" in row) return row.serviceContextId === subjectId;
    if (subjectKind === "MEMBERSHIP" && "membershipId" in row) return row.membershipId === subjectId;
    if (subjectKind === "DESCRIPTION" && "descriptionId" in row) return row.descriptionId === subjectId;
    return false;
  });
  if (!subject) fail("R2_SUBJECT_NOT_FOUND");
  if (subject.fingerprint !== subjectRevision) fail("R2_REVISION_MISMATCH");
  if (subject.objectId !== object.objectId || subject.objectRevisionFingerprint !== object.fingerprint) fail("R2_SUBJECT_MISMATCH");
  const r3RecordId = explicit(input.r3RecordId, "R3_RECORD_REQUIRED");
  const r3Revision = explicit(input.r3RevisionFingerprint, "R3_REVISION_REQUIRED");
  const r3 = store.r3.records.find((row) => row.recordId === r3RecordId);
  if (!r3) fail("R3_RECORD_NOT_FOUND");
  if (r3.fingerprint !== r3Revision) fail("R3_REVISION_MISMATCH");
  if (r3.objectId !== object.objectId || r3.objectRevisionFingerprint !== object.fingerprint) fail("R3_SUBJECT_MISMATCH");
  if (r3.tenantId !== tenantId || r3.workspaceId !== workspaceId || r3.projectId !== projectId) fail("CROSS_SCOPE_REFERENCE_REJECTED");
  const cited = currentnessOf(input.citedCurrentness, "CURRENTNESS_INVALID");
  if (
    (cited === null || cited === "CURRENT") &&
    (context.recordStatus !== "CURRENT" ||
      object.recordStatus !== "CURRENT" ||
      subject.recordStatus !== "CURRENT" ||
      r3.recordStatus !== "CURRENT")
  ) {
    fail("SOURCE_NOT_CURRENT");
  }
  return {
    objectId: object.objectId,
    objectRevisionFingerprint: object.fingerprint,
    r2SubjectId: subjectId,
    r2RevisionFingerprint: subjectRevision,
    r3RecordId: r3.recordId,
    r3RevisionFingerprint: r3.fingerprint,
    r3Value: r3.suppliedValue,
  };
}

function valueOf(input: BoundInput, required: boolean): { text: string | null; unit: string | null } {
  if (!input.suppliedValue || !input.suppliedValue.trim()) {
    if (required) fail("VALUE_REQUIRED");
    return { text: null, unit: null };
  }
  const text = explicit(input.suppliedValue, "VALUE_REQUIRED");
  if (/[=*]|calc\(|sqrt\(/i.test(text)) fail("HIDDEN_CALCULATION_REJECTED");
  const numeric = /^-?\d+(\.\d+)?$/.test(text);
  if (numeric && (!input.unit || !input.unit.trim())) fail("UNITS_REQUIRED");
  const unit = input.unit && input.unit.trim() ? explicit(input.unit, "UNIT_INVALID") : null;
  return { text, unit };
}

function statusOf(input: BoundInput): D4R4SourceStatus | null {
  if (input.sourceStatus === undefined || input.sourceStatus === null || input.sourceStatus.trim() === "") return null;
  const token = explicit(input.sourceStatus, "SOURCE_STATUS_INVALID");
  if (!(D4_R4_SOURCE_STATUSES as readonly string[]).includes(token)) fail("SOURCE_STATUS_INVALID");
  return token as D4R4SourceStatus;
}

function commit(store: D4R4Store, actor: Actor, input: BoundInput, recordClass: D4R4RecordClass, valueRequired: boolean): D4R4Record {
  assertNoPromotion(input);
  if (!(D4_R4_EVIDENCE_CLASSES as readonly string[]).includes(input.evidenceClass)) fail("EVIDENCE_CLASS_NOT_ALLOWLISTED");
  const before = store.r3.records.map((row) => `${row.recordId}:${row.fingerprint}:${row.suppliedValue}:${row.recordStatus}`).join("|");
  const bound = requireChain(store, actor, input);
  const vendorIdentity = explicit(input.vendorIdentity, "VENDOR_IDENTITY_REQUIRED");
  const sourceOrganization = explicit(input.sourceOrganization, "SOURCE_ORGANIZATION_REQUIRED");
  const documentRef = explicit(input.documentRef, "DOCUMENT_REFERENCE_REQUIRED");
  const documentRevision = explicit(input.documentRevision, "DOCUMENT_REVISION_REQUIRED");
  const limitations = explicit(input.limitations, "LIMITATIONS_REQUIRED");
  const provenanceRef = explicit(input.provenanceRef, "PROVENANCE_REQUIRED");
  const sourceStatus = statusOf(input);
  const sourceDate = input.sourceDate && input.sourceDate.trim() ? explicit(input.sourceDate, "SOURCE_DATE_INVALID") : null;
  const value = valueOf(input, valueRequired);
  const dataKind = input.dataKind && input.dataKind.trim() ? explicit(input.dataKind, "DATA_KIND_INVALID") : null;
  if (dataKind && !(D4_R4_VENDOR_DATA_KINDS as readonly string[]).includes(dataKind)) fail("DATA_KIND_NOT_ALLOWLISTED");
  if ((recordClass === "VENDOR_DATA" || recordClass === "PERFORMANCE_CURVE_EVIDENCE") && !dataKind) fail("DATA_KIND_REQUIRED");
  let parentDocumentId: string | null = null;
  let parentDocumentFingerprint: string | null = null;
  if (input.parentDocumentId) {
    parentDocumentId = explicit(input.parentDocumentId, "PARENT_DOCUMENT_REQUIRED");
    parentDocumentFingerprint = explicit(input.parentDocumentFingerprint ?? "", "PARENT_DOCUMENT_REVISION_REQUIRED");
    const parent = store.records.find((row) => row.recordId === parentDocumentId);
    if (!parent || parent.fingerprint !== parentDocumentFingerprint || parent.objectId !== bound.objectId) {
      fail("PARENT_DOCUMENT_MISMATCH");
    }
    if (parent.documentRef !== documentRef || parent.documentRevision !== documentRevision) fail("PARENT_REVISION_MISMATCH");
  }
  const statedResult = input.statedResult && input.statedResult.trim() ? explicit(input.statedResult, "STATED_RESULT_INVALID") : null;
  const inspectionOrTestType =
    input.inspectionOrTestType && input.inspectionOrTestType.trim()
      ? explicit(input.inspectionOrTestType, "INSPECTION_TYPE_INVALID")
      : null;
  if (recordClass === "INSPECTION_TEST_EVIDENCE" && !inspectionOrTestType) fail("INSPECTION_TYPE_REQUIRED");
  if (recordClass === "CERTIFICATE_EVIDENCE" && input.evidenceClass !== "CERTIFICATE") fail("CERTIFICATE_CLASS_REQUIRED");
  const sourceDifference: D4R4SourceDifference | null =
    value.text !== null && value.text !== bound.r3Value
      ? {
          r3RecordId: bound.r3RecordId,
          r3Fingerprint: bound.r3RevisionFingerprint,
          r3Value: bound.r3Value,
          vendorValue: value.text,
          engineeringAcceptance: false,
        }
      : null;
  const recordId = explicit(input.recordId, "RECORD_REQUIRED");
  const fingerprint = fingerprintCanonical({
    recordId,
    contextId: explicit(input.contextId, "R1_CONTEXT_REQUIRED"),
    objectId: bound.objectId,
    objectRevisionFingerprint: bound.objectRevisionFingerprint,
    r2SubjectKind: input.r2SubjectKind,
    r2SubjectId: bound.r2SubjectId,
    r2RevisionFingerprint: bound.r2RevisionFingerprint,
    r3RecordId: bound.r3RecordId,
    r3RevisionFingerprint: bound.r3RevisionFingerprint,
    recordClass,
    vendorIdentity,
    sourceOrganization,
    documentRef,
    documentRevision,
    evidenceClass: input.evidenceClass,
    sourceStatus,
    sourceDate,
    dataKind,
    suppliedValue: value.text,
    unit: value.unit,
    statedResult,
    inspectionOrTestType,
    parentDocumentId,
    parentDocumentFingerprint,
    limitations,
    provenanceRef,
    sourceDifference,
  });
  const existing = store.records.find((row) => row.recordId === recordId);
  if (existing) {
    if (existing.fingerprint === fingerprint) return existing;
    fail("RECORD_ALREADY_RECORDED");
  }
  let predecessor: D4R4Record | null = null;
  if (input.predecessorRecordId) {
    const predecessorId = explicit(input.predecessorRecordId, "PREDECESSOR_INVALID");
    predecessor = store.records.find((row) => row.recordId === predecessorId) ?? null;
    if (!predecessor || predecessor.objectId !== bound.objectId || predecessor.recordClass !== recordClass) fail("PREDECESSOR_NOT_FOUND");
    if (predecessor.recordStatus !== "CURRENT") fail("PREDECESSOR_NOT_CURRENT");
  }
  const duplicate = store.records.find(
    (row) =>
      row.recordStatus === "CURRENT" &&
      row.recordId !== predecessor?.recordId &&
      row.objectId === bound.objectId &&
      row.recordClass === recordClass &&
      row.documentRef === documentRef &&
      row.documentRevision === documentRevision &&
      row.evidenceClass === input.evidenceClass &&
      row.suppliedValue === value.text &&
      row.unit === value.unit,
  );
  if (duplicate) fail("DUPLICATE_RECORD_REJECTED");
  if (predecessor) {
    predecessor.recordStatus = "SUPERSEDED";
    predecessor.currentness = "SUPERSEDED";
  }
  const cited = currentnessOf(input.citedCurrentness, "CURRENTNESS_INVALID");
  const record: D4R4Record = {
    recordId,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
    contextId: explicit(input.contextId, "R1_CONTEXT_REQUIRED"),
    objectId: bound.objectId,
    objectRevisionFingerprint: bound.objectRevisionFingerprint,
    r2SubjectKind: input.r2SubjectKind,
    r2SubjectId: bound.r2SubjectId,
    r2RevisionFingerprint: bound.r2RevisionFingerprint,
    r3RecordId: bound.r3RecordId,
    r3RevisionFingerprint: bound.r3RevisionFingerprint,
    recordClass,
    vendorIdentity,
    sourceOrganization,
    documentRef,
    documentRevision,
    evidenceClass: input.evidenceClass,
    sourceStatus,
    sourceDate,
    dataKind,
    suppliedValue: value.text,
    unit: value.unit,
    statedResult,
    inspectionOrTestType,
    parentDocumentId,
    parentDocumentFingerprint,
    sourceDifference,
    vendorData: true,
    mechanicalEngineeringAdoption: false,
    engineeringValidated: false,
    engineeringApproved: false,
    eosCertified: false,
    vendorCertifiedBySource: sourceStatus === "CERTIFIED_BY_VENDOR",
    projectApproved: false,
    regulatoryCertified: false,
    mechanicalValidation: false,
    mechanicalConformance: false,
    calculated: false,
    limitations,
    provenanceRef,
    fingerprint,
    predecessorRecordId: predecessor?.recordId ?? null,
    predecessorFingerprint: predecessor?.fingerprint ?? null,
    recordStatus: "CURRENT",
    currentness: cited ?? "CURRENT",
    citedCurrentness: cited,
    createdAt: store.now(),
    createdBy: actor.actorId,
  };
  store.records.push(record);
  store.history.push({
    historyId: `d4r4-history-${store.history.length + 1}`,
    recordId: record.recordId,
    fingerprint: record.fingerprint,
    recordStatus: "CURRENT",
    recordedAt: record.createdAt,
  });
  if (predecessor) {
    store.history.push({
      historyId: `d4r4-history-${store.history.length + 1}`,
      recordId: predecessor.recordId,
      fingerprint: predecessor.fingerprint,
      recordStatus: "SUPERSEDED",
      recordedAt: record.createdAt,
    });
  }
  const after = store.r3.records.map((row) => `${row.recordId}:${row.fingerprint}:${row.suppliedValue}:${row.recordStatus}`).join("|");
  if (after !== before) fail("R3_MUTATED");
  return record;
}

export function createD4R4Store(r3: D4R3Store, now: () => string = () => "2026-10-24T00:00:00.000Z"): D4R4Store {
  return { r3, now, records: [], history: [] };
}

export function recordMechanicalVendorDocument(store: D4R4Store, actor: Actor, input: BoundInput): D4R4Record {
  return commit(store, actor, input, "VENDOR_DOCUMENT", false);
}

export function recordMechanicalVendorData(store: D4R4Store, actor: Actor, input: BoundInput): D4R4Record {
  return commit(store, actor, input, "VENDOR_DATA", true);
}

export function recordMechanicalPerformanceCurveEvidence(store: D4R4Store, actor: Actor, input: BoundInput): D4R4Record {
  return commit(store, actor, input, "PERFORMANCE_CURVE_EVIDENCE", true);
}

export function recordMechanicalInspectionTestEvidence(store: D4R4Store, actor: Actor, input: BoundInput): D4R4Record {
  return commit(store, actor, input, "INSPECTION_TEST_EVIDENCE", false);
}

export function recordMechanicalCertificateEvidence(store: D4R4Store, actor: Actor, input: BoundInput): D4R4Record {
  return commit(store, actor, input, "CERTIFICATE_EVIDENCE", false);
}

export function adoptVendorValueAsEngineering(): never {
  fail("VENDOR_VALUE_AUTO_ADOPTION_REJECTED");
}

export function reviseDesignConditionFromVendor(): never {
  fail("R3_DESIGN_CONDITION_MUTATION_REJECTED");
}

export function revisePerformanceContextFromVendor(): never {
  fail("R3_PERFORMANCE_MUTATION_REJECTED");
}

export function interpolatePerformanceCurve(): never {
  fail("CURVE_CALCULATION_REJECTED");
}

export function validateVendorEvidence(): never {
  fail("VALIDATION_RUNTIME_REJECTED");
}

export function approveVendorDocument(): never {
  fail("APPROVAL_RUNTIME_REJECTED");
}

export function certifyEquipmentFromVendorEvidence(): never {
  fail("CERTIFICATION_RUNTIME_REJECTED");
}

export function repointVendorDocument(): never {
  fail("SOURCE_AUTO_REPOINT_REJECTED");
}

export function mutateVendorRecord(): never {
  fail("SILENT_MUTATION_REJECTED");
}

export function sizeMechanicalEquipment(): never {
  fail("EQUIPMENT_SIZING_REJECTED");
}
