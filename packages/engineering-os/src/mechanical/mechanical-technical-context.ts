/**
 * EOS-D4-R5 — Mechanical technical requirements and technical context.
 * Records supplied or explicitly adopted requirements. Does not calculate, adopt vendor claims, or resolve discrepancies.
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
  D4_FINGERPRINT_ALGORITHM,
  D4_IMPLEMENTATION_PHASES,
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
} from "./design-condition-performance-context";
import {
  D4_MECHANICAL_TECHNICAL_CONTEXT_RUNTIME_READY as R4_TECHNICAL_READY,
  D4_RUNTIME_COUNT as D4_R4_RUNTIME_COUNT,
  D4_VENDOR_DATA_EVIDENCE_RUNTIME_READY,
  type D4R4Store,
} from "./vendor-data-evidence-context";

export const D4_R5_STATUS = "MECHANICAL_REQUIREMENTS_AND_TECHNICAL_CONTEXT_IMPLEMENTED" as const;
export const D4_R5_MATURITY = D4_R5_STATUS;
export const D4_R5_MATURITY_STATE = D4_R5_STATUS;
export const D4_RUNTIME_STARTED = true as const;
export const D4_RUNTIME_COUNT = 5 as const;
export const D4_MECHANICAL_TECHNICAL_CONTEXT_RUNTIME_IMPLEMENTED = true as const;
export const D4_MECHANICAL_TECHNICAL_CONTEXT_RUNTIME_COUNT = 1 as const;
export const D4_MECHANICAL_TECHNICAL_CONTEXT_RUNTIME_READY = true as const;
export const D4_MECHANICAL_TECHNICAL_REQUIREMENT_CONTEXT_IMPLEMENTED = true as const;
export const D4_MECHANICAL_TECHNICAL_CONTEXT_IMPLEMENTED = true as const;
export const D4_R5_SOURCE_BASIS_REQUIRED = true as const;
export const D4_R5_SOURCE_BASIS_TRACEABLE = true as const;
export const BASISLESS_AUTHORITATIVE_D4_R5_RECORD_AUTO_ACCEPTED = false as const;
export const SOURCE_REQUIREMENT_EQUALS_ADOPTED_MECHANICAL_REQUIREMENT = false as const;
export const VENDOR_REQUIREMENT_EQUALS_ADOPTED_MECHANICAL_REQUIREMENT = false as const;
export const SOURCE_REQUIREMENT_AUTO_ADOPTED_AS_D4_REQUIREMENT = false as const;
export const VENDOR_REQUIREMENT_AUTO_ADOPTED_AS_D4_REQUIREMENT = false as const;
export const D4_MECHANICAL_CODE_STANDARD_REFERENCE_SUPPORTED = true as const;
export const CODE_STANDARD_REFERENCE_EQUALS_CONFORMANCE = false as const;
export const CODE_STANDARD_REFERENCE_EQUALS_CERTIFICATION = false as const;
export const D4_MECHANICAL_MATERIAL_CONSTRUCTION_CONTEXT_IMPLEMENTED = true as const;
export const D4_MATERIAL_CONTEXT_EQUALS_MATERIAL_SELECTION_CALCULATION = false as const;
export const D4_MATERIAL_CONTEXT_EQUALS_VALIDATED_MATERIAL_SELECTION = false as const;
export const D4_MECHANICAL_INSPECTION_TEST_REQUIREMENT_CONTEXT_IMPLEMENTED = true as const;
export const INSPECTION_REQUIREMENT_EQUALS_INSPECTION_COMPLETED = false as const;
export const TEST_REQUIREMENT_EQUALS_TEST_PASSED = false as const;
export const D4_R3_DESIGN_PERFORMANCE_REFERENCE_SUPPORTED = true as const;
export const D4_R5_AUTO_MUTATES_R3_DESIGN_CONDITION = false as const;
export const D4_R5_AUTO_MUTATES_R3_PERFORMANCE_CONTEXT = false as const;
export const D4_R4_VENDOR_EVIDENCE_REFERENCE_SUPPORTED = true as const;
export const VENDOR_EVIDENCE_EQUALS_ADOPTED_D4_REQUIREMENT = false as const;
export const VENDOR_EVIDENCE_EQUALS_ENGINEERING_VALIDATED = false as const;
export const D4_R5_VENDOR_ENGINEERING_DISCREPANCY_AUTO_RESOLVED = false as const;
export const D4_R5_VENDOR_VALUE_AUTO_OVERRIDES_ENGINEERING = false as const;
export const D4_R5_ENGINEERING_VALUE_AUTO_OVERRIDES_VENDOR = false as const;
export const D4_R5_APPLICABILITY_EXPLICIT = true as const;
export const D4_R5_LIMITATIONS_EXPLICIT = true as const;
export const D4_R5_AUTO_PROPAGATED_OUTSIDE_APPLICABILITY = false as const;
export const TECHNICAL_CONTEXT_EQUALS_CALCULATED_DESIGN = false as const;
export const TECHNICAL_CONTEXT_EQUALS_ENGINEERING_VALIDATED = false as const;
export const TECHNICAL_CONTEXT_EQUALS_APPROVED = false as const;
export const REQUIREMENT_PRESENT_EQUALS_VALIDATED = false as const;
export const TECHNICAL_CONTEXT_PRESENT_EQUALS_CONFORMANT = false as const;
export const CODE_REFERENCE_PRESENT_EQUALS_CONFORMANT = false as const;

export const D4_R1_IDENTITY_REUSED = true as const;
export const D4_R2_EQUIPMENT_SYSTEM_CONTEXT_REUSED = true as const;
export const D4_R3_DESIGN_CONDITION_PERFORMANCE_CONTEXT_REUSED = true as const;
export const D4_R4_VENDOR_DATA_EVIDENCE_CONTEXT_REUSED = true as const;
export const EXACT_D4_R1_R4_REFERENCE_REQUIRED = true as const;
export const FLOATING_D4_R5_SOURCE_REFERENCE_ALLOWED = false as const;
export const D4_R5_SOURCE_AUTO_REPOINTED = false as const;

export const AI_EQUALS_D4_MECHANICAL_ENGINEERING_AUTHORITY = false as const;
export const ADMIN_EQUALS_D4_MECHANICAL_ENGINEERING_AUTHORITY = false as const;
export const AI_CAN_INVENT_AUTHORITATIVE_D4_TECHNICAL_REQUIREMENT = false as const;
export const AI_CAN_PROMOTE_CANDIDATE_D4_REQUIREMENT_TO_AUTHORITATIVE = false as const;
export const ADMIN_CAN_PROMOTE_SOURCE_DATA_TO_ENGINEERING_TRUTH = false as const;
export const D4_R5_HIDDEN_CALCULATION_ALLOWED = false as const;
export const D4_MAINTAINABILITY_RUNTIME_COUNT = 0 as const;
export const D4_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_COUNT = 0 as const;
export const D4_R5_CHANGE_PROPAGATION_RUNTIME_COUNT = 0 as const;
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
export const D4_REUSES_CANONICAL_CURRENTNESS = true as const;
export const PARALLEL_D4_CURRENTNESS_ENGINE_CREATED = false as const;
export const D4_REUSES_CANONICAL_FINGERPRINT = true as const;
export const SECOND_D4_FINGERPRINT_ALGORITHM_CREATED = false as const;
export const D4_FINGERPRINT_ALGORITHM_REUSED = D4_FINGERPRINT_ALGORITHM;
export const D4_R5_PROVENANCE_REQUIRED = true as const;
export const D4_R5_PROVENANCE_PRESERVED = true as const;
export const D4_R5_AUTO_REPOINTED = false as const;
export const SILENT_D4_R5_MUTATION_ALLOWED = false as const;
export const D4_R5_HISTORY_PRESERVED = true as const;
export const TENANT_WORKSPACE_PROJECT_D4_R5_SCOPE_ENFORCED = true as const;
export const CHANGED_R5_SOURCE_AUTO_REWRITES_REQUIREMENT = false as const;
export const CHANGED_R5_SOURCE_AUTO_REWRITES_HISTORY = false as const;
export const CHANGED_R5_SOURCE_AUTO_REVALIDATES_ENGINEERING = false as const;
export {
  D4_EQUALS_D1_STRUCTURAL_AUTHORITY,
  D4_EQUALS_D2_CIVIL_AUTHORITY,
  D4_EQUALS_D3_GEOTECHNICAL_AUTHORITY,
  D4_EQUALS_D5_PIPING_AUTHORITY,
  D4_EQUALS_D6_PROCESS_AUTHORITY,
  D4_EQUALS_D7_ELECTRICAL_AUTHORITY,
  D4_EQUALS_D8_INSTRUMENTATION_CONTROL_AUTHORITY,
};
export const D4_R5_DUPLICATE_GOVERNANCE_IMPLEMENTED = true as const;
export const D4_R5_REPLAY_PROTECTION_IMPLEMENTED = true as const;
export const D4_R5_SPOOFING_PROTECTION_IMPLEMENTED = true as const;
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
export const D4_VENDOR_DATA_EVIDENCE_RUNTIME_READY_REUSED = D4_VENDOR_DATA_EVIDENCE_RUNTIME_READY;
export const D4_R4_TECHNICAL_CONTEXT_RUNTIME_READY = R4_TECHNICAL_READY;
export const D4_R2_RUNTIME_COUNT_REUSED = D4_R2_RUNTIME_COUNT;
export const D4_R3_RUNTIME_COUNT_REUSED = D4_R3_RUNTIME_COUNT;
export const D4_R4_RUNTIME_COUNT_REUSED = D4_R4_RUNTIME_COUNT;

export const D4_MAINTAINABILITY_ACCESS_PACKAGE_RUNTIME_READY = false as const;
export const D4_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY = false as const;
export const D4_DISCIPLINE_INTERFACE_RUNTIME_READY = false as const;
export const D4_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_READY = false as const;
export const D4_CURRENTNESS_DIGITAL_THREAD_RUNTIME_READY = false as const;
export const D4_D9_SOURCE_CONTRACT_RUNTIME_READY = false as const;

export const UNAUTHORIZED_D1_PACK_COMPLETION = false as const;
export const UNAUTHORIZED_D2_REOPEN = false as const;
export const UNAUTHORIZED_D3_REOPEN = false as const;
export const UNAUTHORIZED_D4_R6_R12_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_D5_D8_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_D9_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_VENDOR_ENGINEERING_RESOLUTION_PROMOTION = false as const;
export const UNAUTHORIZED_MECHANICAL_CALCULATION_PROMOTION = false as const;
export const UNAUTHORIZED_MECHANICAL_VALIDATION_PROMOTION = false as const;
export const UNAUTHORIZED_MECHANICAL_CONFORMANCE_PROMOTION = false as const;
export const UNAUTHORIZED_MECHANICAL_APPROVAL_PROMOTION = false as const;
export const UNAUTHORIZED_MECHANICAL_CERTIFICATION_PROMOTION = false as const;
export const UNAUTHORIZED_CROSS_DISCIPLINE_REASONING_PROMOTION = false as const;
export const UNAUTHORIZED_GA_PROMOTION = false as const;
export const UNAUTHORIZED_PRODUCT_CLAIM = false as const;

export const D4_R6_CANONICAL_PHASE = D4_IMPLEMENTATION_PHASES[5];
export const D4_R6_PHASE_TYPE = "MAINTAINABILITY_ACCESS_AND_PACKAGE_CONTEXT" as const;
export const D4_R6_CANONICAL_SCOPE =
  "Implement governed Mechanical maintainability, service-access, lifting/removal-space and package-context records using exact R1-R5 references. Record supplied/adopted maintenance envelopes, access constraints, lifting/removal requirements, package boundaries and Mechanical arrangement constraints without performing spatial clash detection, multidisciplinary optimization, structural lifting design, equipment calculations, discipline interfaces, review/validation or D5-D9 runtime." as const;
export const D4_R6_STARTED = false as const;
export const D4_R5_READY_FOR_NEXT_PHASE = true as const;
export const D4_R5_NEXT_PHASE = D4_R6_CANONICAL_PHASE;
export const D4_R5_NEXT_PHASE_TYPE = D4_R6_PHASE_TYPE;
export const D4_R5_CANONICAL_NEXT_PHASE = D4_R6_CANONICAL_PHASE;
export const D4_R5_CANONICAL_NEXT_PHASE_SCOPE = D4_R6_CANONICAL_SCOPE;
export const D4_R5_BLOCKER = "NONE" as const;
export const D4_R5_MACHINE_READABLE_ROADMAP_UPDATED = true as const;

export const D4_R5_SOURCE_BASIS_KINDS = [
  "PROJECT_SPECIFICATION",
  "CLIENT_REQUIREMENT",
  "MECHANICAL_DESIGN_BASIS",
  "R3_DESIGN_PERFORMANCE_CONTEXT",
  "R4_VENDOR_EVIDENCE",
  "CODE_OR_STANDARD_REFERENCE",
  "AUTHORIZED_ENGINEERING_INPUT",
  "GOVERNED_ASSUMPTION",
] as const;
export type D4R5SourceBasis = (typeof D4_R5_SOURCE_BASIS_KINDS)[number];

export const D4_R5_SUBJECT_KINDS = [
  "MECHANICAL_EQUIPMENT_REQUIREMENT",
  "MATERIALS_CONSTRUCTION_REQUIREMENT",
  "DESIGN_LIFE_REQUIREMENT",
  "MECHANICAL_RATING_CRITERIA",
  "FABRICATION_REQUIREMENT",
  "COATING_PROTECTION_REQUIREMENT",
  "INSPECTION_TESTING_REQUIREMENT",
  "MECHANICAL_QUALITY_CRITERIA",
  "ALLOWABLE_EQUIPMENT_CRITERIA",
  "PROJECT_MECHANICAL_SPECIFICATION",
  "CODE_STANDARD_REFERENCE",
  "PACKAGE_MECHANICAL_REQUIREMENT",
  "EQUIPMENT_CONFIGURATION",
  "SERVICE_MECHANICAL_CONSTRAINT",
  "FABRICATION_CONSTRAINT",
  "MECHANICAL_ENVIRONMENTAL_CONSTRAINT",
  "TECHNICAL_LIMITATION",
  "INTERFACE_CRITERIA_MECHANICAL_CONTEXT",
] as const;

export const D4_R5_RECORD_CLASSES = [
  "SOURCE_REQUIREMENT",
  "VENDOR_REQUIREMENT",
  "ADOPTED_MECHANICAL_REQUIREMENT",
  "TECHNICAL_CONTEXT",
  "CODE_STANDARD_REFERENCE",
  "MATERIAL_CONSTRUCTION_CONTEXT",
  "INSPECTION_TEST_REQUIREMENT",
  "CANDIDATE",
] as const;
export type D4R5RecordClass = (typeof D4_R5_RECORD_CLASSES)[number];
export type D4R5UpstreamKind = "CLASSIFICATION" | "SERVICE" | "MEMBERSHIP" | "DESCRIPTION";

const FLOATING = new Set(["latest", "current", "newest", "head", "active", "active model"]);
const BROAD = new Set(["all", "global", "every", "unspecified", "any"]);

export type D4R5Difference = {
  r4RecordId: string;
  r4Fingerprint: string;
  vendorValue: string;
  requirementValue: string;
  resolved: false;
};

export type D4R5Record = {
  recordId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  contextId: string;
  objectId: string;
  objectRevisionFingerprint: string;
  r2SubjectKind: D4R5UpstreamKind;
  r2SubjectId: string;
  r2RevisionFingerprint: string;
  r3RecordId: string;
  r3RevisionFingerprint: string;
  r4RecordId: string;
  r4RevisionFingerprint: string;
  recordClass: D4R5RecordClass;
  subjectKind: string;
  requirementStatement: string;
  sourceBasis: D4R5SourceBasis;
  sourceRef: string;
  sourceRevision: string;
  standardRef: string | null;
  suppliedValue: string | null;
  unit: string | null;
  applicabilityObjectId: string;
  applicabilityCase: string;
  limitations: string;
  adoptionRationale: string | null;
  adopted: boolean;
  authoritative: boolean;
  candidate: boolean;
  engineeringValidated: false;
  engineeringApproved: false;
  conformant: false;
  certified: false;
  calculated: false;
  inspectionCompleted: false;
  testPassed: false;
  materialSelectionCalculated: false;
  materialSelectionValidated: false;
  discrepancy: D4R5Difference | null;
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

export type D4R5HistoryRecord = {
  historyId: string;
  recordId: string;
  fingerprint: string;
  recordStatus: "CURRENT" | "SUPERSEDED";
  recordedAt: string;
};

export type D4R5Store = {
  r4: D4R4Store;
  now: () => string;
  records: D4R5Record[];
  history: D4R5HistoryRecord[];
};

type Actor = D4R1Actor;

type BoundInput = {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  contextId: string;
  objectId: string;
  objectRevisionFingerprint: string;
  r2SubjectKind: D4R5UpstreamKind;
  r2SubjectId: string;
  r2RevisionFingerprint: string;
  r3RecordId: string;
  r3RevisionFingerprint: string;
  r4RecordId: string;
  r4RevisionFingerprint: string;
  citedCurrentness?: (typeof D4_CURRENTNESS_STATES)[number] | null;
  recordId: string;
  subjectKind: string;
  requirementStatement: string;
  sourceBasis: string;
  sourceRef: string;
  sourceRevision: string;
  standardRef?: string | null;
  suppliedValue?: string | null;
  unit?: string | null;
  normalizedUnit?: string | null;
  applicabilityObjectId: string;
  applicabilityCase: string;
  limitations: string;
  provenanceRef: string;
  adoptionRationale?: string | null;
  predecessorRecordId?: string | null;
  explicitlyEstablished?: boolean;
  assumptionRef?: string | null;
  propagate?: boolean;
  formula?: boolean;
  calculatedResult?: boolean;
  materialCalculation?: boolean;
  inspectionCompleted?: boolean;
  testPassed?: boolean;
  conforms?: boolean;
  certified?: boolean;
  engineeringValidated?: boolean;
  mutateR3?: boolean;
  resolveDiscrepancy?: boolean;
  vendorOverridesEngineering?: boolean;
  engineeringOverridesVendor?: boolean;
  maintainabilityAnalysis?: boolean;
  changePropagation?: boolean;
  disciplineInterface?: boolean;
  invented?: boolean;
  promoteCandidate?: boolean;
};

function fail(code: string): never {
  throw new Error(`D4_R5_${code}`);
}

function explicit(value: string, code: string): string {
  const token = value.trim();
  if (!token || FLOATING.has(token.toLowerCase())) fail(code);
  return token;
}

function currentnessOf(
  value: (typeof D4_CURRENTNESS_STATES)[number] | null | undefined,
): (typeof D4_CURRENTNESS_STATES)[number] | null {
  if (value === undefined || value === null) return null;
  if (!(D4_CURRENTNESS_STATES as readonly string[]).includes(value)) fail("CURRENTNESS_INVALID");
  return value;
}

function assertActor(actor: Actor): void {
  if (/^AI(?:\b|_)/i.test(actor.actorId) || actor.actorId === "LLM" || actor.actorId === "OPTIMIZER") {
    fail("AI_NOT_MECHANICAL_AUTHORITY");
  }
  if (actor.actorId === "ADMIN" || actor.actorId === "ADMINISTRATOR" || actor.authority === "ADMIN" || actor.authority === "ADMINISTRATOR") {
    fail("ADMIN_NOT_MECHANICAL_AUTHORITY");
  }
  if (actor.authority === "MECHANICAL_ENGINEERING_AUTHORITY") fail("AUTHORITY_SPOOFING_REJECTED");
  if (actor.authority !== D4_CONTEXT_AUTHORITY) fail("RECORDER_AUTHORITY_INVALID");
}

function assertBoundaries(input: BoundInput): void {
  if (input.propagate === true) fail("AUTO_PROPAGATION_REJECTED");
  if (input.formula === true || input.calculatedResult === true || input.materialCalculation === true) fail("HIDDEN_CALCULATION_REJECTED");
  if (input.inspectionCompleted === true || input.testPassed === true) fail("INSPECTION_COMPLETION_REJECTED");
  if (input.conforms === true || input.certified === true || input.engineeringValidated === true) fail("VALIDATION_AUTHORITY_REJECTED");
  if (input.mutateR3 === true) fail("R3_MUTATION_REJECTED");
  if (input.resolveDiscrepancy === true) fail("DISCREPANCY_RESOLUTION_REJECTED");
  if (input.vendorOverridesEngineering === true) fail("VENDOR_OVERRIDE_REJECTED");
  if (input.engineeringOverridesVendor === true) fail("ENGINEERING_OVERRIDE_REJECTED");
  if (input.maintainabilityAnalysis === true) fail("MAINTAINABILITY_RUNTIME_REJECTED");
  if (input.changePropagation === true) fail("CHANGE_PROPAGATION_REJECTED");
  if (input.disciplineInterface === true) fail("DISCIPLINE_INTERFACE_REJECTED");
  if (input.invented === true) fail("INVENTED_REQUIREMENT_REJECTED");
  if (input.promoteCandidate === true) fail("CANDIDATE_PROMOTION_REJECTED");
  if (input.normalizedUnit) fail("UNIT_CHANGE_REJECTED");
}

function requireChain(store: D4R5Store, actor: Actor, input: BoundInput): {
  objectId: string;
  objectRevisionFingerprint: string;
  r2SubjectId: string;
  r2RevisionFingerprint: string;
  r3RecordId: string;
  r3RevisionFingerprint: string;
  r4RecordId: string;
  r4RevisionFingerprint: string;
  vendorValue: string | null;
} {
  assertActor(actor);
  const tenantId = explicit(input.tenantId, "SCOPE_REQUIRED");
  const workspaceId = explicit(input.workspaceId, "SCOPE_REQUIRED");
  const projectId = explicit(input.projectId, "SCOPE_REQUIRED");
  if (tenantId !== actor.tenantId || workspaceId !== actor.workspaceId || projectId !== actor.projectId) fail("SCOPE_MISMATCH");
  const contextId = explicit(input.contextId, "R1_CONTEXT_REQUIRED");
  const context = store.r4.r3.r2.r1.contexts.find((row) => row.contextId === contextId);
  if (!context) fail("R1_CONTEXT_NOT_FOUND");
  if (context.tenantId !== tenantId || context.workspaceId !== workspaceId || context.projectId !== projectId) {
    fail("CROSS_SCOPE_REFERENCE_REJECTED");
  }
  const objectId = explicit(input.objectId, "R1_OBJECT_REQUIRED");
  const objectRevision = explicit(input.objectRevisionFingerprint, "R1_REVISION_REQUIRED");
  const object = store.r4.r3.r2.r1.objects.find((row) => row.objectId === objectId);
  if (!object || object.contextId !== context.contextId || object.fingerprint !== objectRevision) fail("R1_REVISION_MISMATCH");
  const subjectKind = input.r2SubjectKind;
  if (!["CLASSIFICATION", "SERVICE", "MEMBERSHIP", "DESCRIPTION"].includes(subjectKind)) fail("R2_SUBJECT_KIND_INVALID");
  const subjectId = explicit(input.r2SubjectId, "R2_SUBJECT_REQUIRED");
  const subjectRevision = explicit(input.r2RevisionFingerprint, "R2_REVISION_REQUIRED");
  const rows =
    subjectKind === "CLASSIFICATION"
      ? store.r4.r3.r2.classifications
      : subjectKind === "SERVICE"
        ? store.r4.r3.r2.services
        : subjectKind === "MEMBERSHIP"
          ? store.r4.r3.r2.memberships
          : store.r4.r3.r2.descriptions;
  const subject = rows.find((row) => {
    if (subjectKind === "CLASSIFICATION" && "classificationId" in row) return row.classificationId === subjectId;
    if (subjectKind === "SERVICE" && "serviceContextId" in row) return row.serviceContextId === subjectId;
    if (subjectKind === "MEMBERSHIP" && "membershipId" in row) return row.membershipId === subjectId;
    if (subjectKind === "DESCRIPTION" && "descriptionId" in row) return row.descriptionId === subjectId;
    return false;
  });
  if (!subject || subject.fingerprint !== subjectRevision || subject.objectId !== object.objectId) fail("R2_REVISION_MISMATCH");
  const r3RecordId = explicit(input.r3RecordId, "R3_RECORD_REQUIRED");
  const r3Revision = explicit(input.r3RevisionFingerprint, "R3_REVISION_REQUIRED");
  const r3 = store.r4.r3.records.find((row) => row.recordId === r3RecordId);
  if (!r3 || r3.fingerprint !== r3Revision || r3.objectId !== object.objectId) fail("R3_REVISION_MISMATCH");
  const r4RecordId = explicit(input.r4RecordId, "R4_RECORD_REQUIRED");
  const r4Revision = explicit(input.r4RevisionFingerprint, "R4_REVISION_REQUIRED");
  const r4 = store.r4.records.find((row) => row.recordId === r4RecordId);
  if (!r4 || r4.fingerprint !== r4Revision || r4.objectId !== object.objectId) fail("R4_REVISION_MISMATCH");
  const cited = currentnessOf(input.citedCurrentness);
  if (
    (cited === null || cited === "CURRENT") &&
    (context.recordStatus !== "CURRENT" ||
      object.recordStatus !== "CURRENT" ||
      subject.recordStatus !== "CURRENT" ||
      r3.recordStatus !== "CURRENT" ||
      r4.recordStatus !== "CURRENT")
  ) {
    fail("SOURCE_NOT_CURRENT");
  }
  return {
    objectId,
    objectRevisionFingerprint: object.fingerprint,
    r2SubjectId: subjectId,
    r2RevisionFingerprint: subjectRevision,
    r3RecordId,
    r3RevisionFingerprint: r3.fingerprint,
    r4RecordId,
    r4RevisionFingerprint: r4.fingerprint,
    vendorValue: r4.suppliedValue,
  };
}

function basisOf(input: BoundInput): D4R5SourceBasis {
  if (!(D4_R5_SOURCE_BASIS_KINDS as readonly string[]).includes(input.sourceBasis)) fail("SOURCE_BASIS_REQUIRED");
  if (input.sourceBasis === "GOVERNED_ASSUMPTION") {
    if (input.explicitlyEstablished !== true) fail("ASSUMPTION_NOT_ESTABLISHED");
    explicit(input.assumptionRef ?? "", "ASSUMPTION_REFERENCE_REQUIRED");
  }
  return input.sourceBasis as D4R5SourceBasis;
}

function valueOf(input: BoundInput): { text: string | null; unit: string | null } {
  if (!input.suppliedValue || !input.suppliedValue.trim()) return { text: null, unit: null };
  const text = explicit(input.suppliedValue, "VALUE_REQUIRED");
  if (/[=*]|calc\(|sqrt\(/i.test(text)) fail("HIDDEN_CALCULATION_REJECTED");
  const numeric = /^-?\d+(\.\d+)?$/.test(text);
  if (numeric && (!input.unit || !input.unit.trim())) fail("UNITS_REQUIRED");
  return { text, unit: input.unit && input.unit.trim() ? explicit(input.unit, "UNIT_INVALID") : null };
}

function commit(
  store: D4R5Store,
  actor: Actor,
  input: BoundInput,
  recordClass: D4R5RecordClass,
): D4R5Record {
  assertBoundaries(input);
  if (!(D4_R5_SUBJECT_KINDS as readonly string[]).includes(input.subjectKind)) fail("SUBJECT_KIND_INVALID");
  const r3Before = store.r4.r3.records.map((row) => `${row.recordId}:${row.fingerprint}:${row.suppliedValue}`).join("|");
  const r4Before = store.r4.records.map((row) => `${row.recordId}:${row.fingerprint}:${row.suppliedValue}`).join("|");
  const bound = requireChain(store, actor, input);
  const basis = basisOf(input);
  const statement = explicit(input.requirementStatement, "REQUIREMENT_STATEMENT_REQUIRED");
  if (/[=*]|calc\(|sqrt\(/i.test(statement)) fail("HIDDEN_CALCULATION_REJECTED");
  const sourceRef = explicit(input.sourceRef, "SOURCE_REFERENCE_REQUIRED");
  const sourceRevision = explicit(input.sourceRevision, "SOURCE_REVISION_REQUIRED");
  const applicabilityObjectId = explicit(input.applicabilityObjectId, "APPLICABILITY_REQUIRED");
  if (applicabilityObjectId !== bound.objectId || BROAD.has(input.applicabilityCase.trim().toLowerCase())) {
    fail("APPLICABILITY_MISMATCH");
  }
  const applicabilityCase = explicit(input.applicabilityCase, "APPLICABILITY_REQUIRED");
  const limitations = explicit(input.limitations, "LIMITATIONS_REQUIRED");
  const provenanceRef = explicit(input.provenanceRef, "PROVENANCE_REQUIRED");
  const value = valueOf(input);
  const adopted = recordClass === "ADOPTED_MECHANICAL_REQUIREMENT" || recordClass === "TECHNICAL_CONTEXT" || recordClass === "MATERIAL_CONSTRUCTION_CONTEXT" || recordClass === "INSPECTION_TEST_REQUIREMENT" || recordClass === "CODE_STANDARD_REFERENCE";
  const rationale = input.adoptionRationale && input.adoptionRationale.trim() ? explicit(input.adoptionRationale, "ADOPTION_RATIONALE_REQUIRED") : null;
  if (adopted && !rationale) fail("ADOPTION_RATIONALE_REQUIRED");
  if (!adopted && rationale) fail("SOURCE_NOT_ADOPTED");
  const standardRef = input.standardRef && input.standardRef.trim() ? explicit(input.standardRef, "STANDARD_REFERENCE_INVALID") : null;
  if (recordClass === "CODE_STANDARD_REFERENCE" && !standardRef) fail("STANDARD_REFERENCE_REQUIRED");
  const candidate = recordClass === "CANDIDATE";
  const discrepancy: D4R5Difference | null =
    value.text !== null && bound.vendorValue !== null && value.text !== bound.vendorValue
      ? {
          r4RecordId: bound.r4RecordId,
          r4Fingerprint: bound.r4RevisionFingerprint,
          vendorValue: bound.vendorValue,
          requirementValue: value.text,
          resolved: false,
        }
      : null;
  const recordId = explicit(input.recordId, "RECORD_REQUIRED");
  const fingerprint = fingerprintCanonical({
    recordId,
    objectId: bound.objectId,
    objectRevisionFingerprint: bound.objectRevisionFingerprint,
    r2RevisionFingerprint: bound.r2RevisionFingerprint,
    r3RevisionFingerprint: bound.r3RevisionFingerprint,
    r4RevisionFingerprint: bound.r4RevisionFingerprint,
    recordClass,
    subjectKind: input.subjectKind,
    requirementStatement: statement,
    sourceBasis: basis,
    sourceRef,
    sourceRevision,
    standardRef,
    suppliedValue: value.text,
    unit: value.unit,
    applicabilityCase,
    limitations,
    adoptionRationale: rationale,
    provenanceRef,
    discrepancy,
  });
  const existing = store.records.find((row) => row.recordId === recordId);
  if (existing) {
    if (existing.fingerprint === fingerprint) return existing;
    fail("RECORD_ALREADY_RECORDED");
  }
  let predecessor: D4R5Record | null = null;
  if (input.predecessorRecordId) {
    const predecessorId = explicit(input.predecessorRecordId, "PREDECESSOR_INVALID");
    predecessor = store.records.find((row) => row.recordId === predecessorId) ?? null;
    if (!predecessor || predecessor.objectId !== bound.objectId || predecessor.recordClass !== recordClass || predecessor.recordStatus !== "CURRENT") {
      fail("PREDECESSOR_NOT_FOUND");
    }
  }
  const duplicate = store.records.find(
    (row) =>
      row.recordStatus === "CURRENT" &&
      row.recordId !== predecessor?.recordId &&
      row.objectId === bound.objectId &&
      row.recordClass === recordClass &&
      row.subjectKind === input.subjectKind &&
      row.requirementStatement === statement &&
      row.sourceRevision === sourceRevision &&
      row.applicabilityCase === applicabilityCase,
  );
  if (duplicate) fail("DUPLICATE_RECORD_REJECTED");
  if (predecessor) {
    predecessor.recordStatus = "SUPERSEDED";
    predecessor.currentness = "SUPERSEDED";
  }
  const cited = currentnessOf(input.citedCurrentness);
  const record: D4R5Record = {
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
    r4RecordId: bound.r4RecordId,
    r4RevisionFingerprint: bound.r4RevisionFingerprint,
    recordClass,
    subjectKind: input.subjectKind,
    requirementStatement: statement,
    sourceBasis: basis,
    sourceRef,
    sourceRevision,
    standardRef,
    suppliedValue: value.text,
    unit: value.unit,
    applicabilityObjectId,
    applicabilityCase,
    limitations,
    adoptionRationale: rationale,
    adopted,
    authoritative: adopted,
    candidate,
    engineeringValidated: false,
    engineeringApproved: false,
    conformant: false,
    certified: false,
    calculated: false,
    inspectionCompleted: false,
    testPassed: false,
    materialSelectionCalculated: false,
    materialSelectionValidated: false,
    discrepancy,
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
    historyId: `d4r5-history-${store.history.length + 1}`,
    recordId: record.recordId,
    fingerprint: record.fingerprint,
    recordStatus: "CURRENT",
    recordedAt: record.createdAt,
  });
  if (predecessor) {
    store.history.push({
      historyId: `d4r5-history-${store.history.length + 1}`,
      recordId: predecessor.recordId,
      fingerprint: predecessor.fingerprint,
      recordStatus: "SUPERSEDED",
      recordedAt: record.createdAt,
    });
  }
  const r3After = store.r4.r3.records.map((row) => `${row.recordId}:${row.fingerprint}:${row.suppliedValue}`).join("|");
  const r4After = store.r4.records.map((row) => `${row.recordId}:${row.fingerprint}:${row.suppliedValue}`).join("|");
  if (r3After !== r3Before || r4After !== r4Before) fail("UPSTREAM_MUTATED");
  return record;
}

export function createD4R5Store(r4: D4R4Store, now: () => string = () => "2026-10-24T00:00:00.000Z"): D4R5Store {
  return { r4, now, records: [], history: [] };
}

export function recordMechanicalSourceRequirement(store: D4R5Store, actor: Actor, input: BoundInput): D4R5Record {
  return commit(store, actor, input, "SOURCE_REQUIREMENT");
}

export function recordMechanicalVendorRequirement(store: D4R5Store, actor: Actor, input: BoundInput): D4R5Record {
  if (input.sourceBasis !== "R4_VENDOR_EVIDENCE") fail("VENDOR_BASIS_REQUIRED");
  return commit(store, actor, input, "VENDOR_REQUIREMENT");
}

export function recordMechanicalTechnicalRequirement(store: D4R5Store, actor: Actor, input: BoundInput): D4R5Record {
  return commit(store, actor, input, "ADOPTED_MECHANICAL_REQUIREMENT");
}

export function recordMechanicalTechnicalContext(store: D4R5Store, actor: Actor, input: BoundInput): D4R5Record {
  return commit(store, actor, input, "TECHNICAL_CONTEXT");
}

export function recordMechanicalCodeStandardReference(store: D4R5Store, actor: Actor, input: BoundInput): D4R5Record {
  return commit(store, actor, input, "CODE_STANDARD_REFERENCE");
}

export function recordMechanicalMaterialConstructionContext(store: D4R5Store, actor: Actor, input: BoundInput): D4R5Record {
  return commit(store, actor, input, "MATERIAL_CONSTRUCTION_CONTEXT");
}

export function recordMechanicalInspectionTestRequirement(store: D4R5Store, actor: Actor, input: BoundInput): D4R5Record {
  return commit(store, actor, input, "INSPECTION_TEST_REQUIREMENT");
}

export function recordMechanicalRequirementCandidate(store: D4R5Store, actor: Actor, input: BoundInput): D4R5Record {
  return commit(store, actor, input, "CANDIDATE");
}

export function adoptSourceRequirement(): never {
  fail("SOURCE_REQUIREMENT_AUTO_ADOPTION_REJECTED");
}

export function adoptVendorRequirement(): never {
  fail("VENDOR_REQUIREMENT_AUTO_ADOPTION_REJECTED");
}

export function promoteCandidateRequirement(): never {
  fail("CANDIDATE_PROMOTION_REJECTED");
}

export function resolveVendorEngineeringDiscrepancy(): never {
  fail("DISCREPANCY_RESOLUTION_REJECTED");
}

export function reviseDesignConditionFromRequirement(): never {
  fail("R3_DESIGN_CONDITION_MUTATION_REJECTED");
}

export function revisePerformanceFromRequirement(): never {
  fail("R3_PERFORMANCE_MUTATION_REJECTED");
}

export function applyChangedSourceToRequirement(): never {
  fail("SOURCE_CHANGE_AUTO_UPDATE_REJECTED");
}

export function repointRequirement(): never {
  fail("SOURCE_AUTO_REPOINT_REJECTED");
}

export function mutateRequirement(): never {
  fail("SILENT_MUTATION_REJECTED");
}

export function sizeMechanicalEquipment(): never {
  fail("EQUIPMENT_SIZING_REJECTED");
}

export function analyzeMaintainability(): never {
  fail("MAINTAINABILITY_RUNTIME_REJECTED");
}

export function propagateRequirementChange(): never {
  fail("CHANGE_PROPAGATION_REJECTED");
}

export function openDisciplineInterface(): never {
  fail("DISCIPLINE_INTERFACE_REJECTED");
}

export function validateRequirement(): never {
  fail("VALIDATION_RUNTIME_REJECTED");
}

export function determineConformance(): never {
  fail("CONFORMANCE_RUNTIME_REJECTED");
}

export function approveRequirement(): never {
  fail("APPROVAL_RUNTIME_REJECTED");
}

export function certifyRequirement(): never {
  fail("CERTIFICATION_RUNTIME_REJECTED");
}
