/**
 * EOS-D4-R3 — Mechanical design-condition and performance context.
 * Records supplied or explicitly adopted conditions and performance context.
 * Does not calculate, size, ingest vendor data, or validate engineering.
 */
import {
  D4_CURRENTNESS_STATES,
  D4_MECHANICAL_DESIGN_CONDITION_EQUALS_VALIDATED_DESIGN_CONDITION,
  D4_EQUALS_D1_STRUCTURAL_AUTHORITY,
  D4_EQUALS_D2_CIVIL_AUTHORITY,
  D4_EQUALS_D3_GEOTECHNICAL_AUTHORITY,
  D4_EQUALS_D5_PIPING_AUTHORITY,
  D4_EQUALS_D6_PROCESS_AUTHORITY,
  D4_EQUALS_D7_ELECTRICAL_AUTHORITY,
  D4_EQUALS_D8_INSTRUMENTATION_CONTROL_AUTHORITY,
  D4_FINGERPRINT_ALGORITHM,
  D4_IMPLEMENTATION_PHASES,
  D4_PERFORMANCE_CONTEXT_EQUALS_VALIDATED_PERFORMANCE,
  D4_PERFORMANCE_CONTEXT_FIELDS,
  PROCESS_CONDITION_EQUALS_MECHANICAL_DESIGN_CONDITION,
  SOURCE_REQUIREMENT_EQUALS_MECHANICAL_INTERPRETATION,
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
  type D4R2Store,
} from "./equipment-system-context";

export const D4_R3_STATUS = "DESIGN_CONDITIONS_AND_PERFORMANCE_CONTEXT_IMPLEMENTED" as const;
export const D4_R3_MATURITY = D4_R3_STATUS;
export const D4_R3_MATURITY_STATE = D4_R3_STATUS;
export const D4_RUNTIME_STARTED = true as const;
export const D4_RUNTIME_COUNT = 3 as const;
export const D4_DESIGN_CONDITION_PERFORMANCE_RUNTIME_IMPLEMENTED = true as const;
export const D4_DESIGN_CONDITION_PERFORMANCE_RUNTIME_COUNT = 1 as const;
export const D4_DESIGN_CONDITION_PERFORMANCE_RUNTIME_READY = true as const;
export const D4_DESIGN_CONDITION_CONTEXT_IMPLEMENTED = true as const;
export const D4_PERFORMANCE_CONTEXT_IMPLEMENTED = true as const;

export const D4_R1_IDENTITY_REUSED = true as const;
export const D4_R2_EQUIPMENT_SYSTEM_CONTEXT_REUSED = true as const;
export const EXACT_D4_R1_R2_REFERENCE_REQUIRED = true as const;
export const FLOATING_D4_R3_SOURCE_REFERENCE_ALLOWED = false as const;
export const D4_R3_SOURCE_AUTO_REPOINTED = false as const;
export const D4_R3_SOURCE_BASIS_REQUIRED = true as const;
export const D4_R3_SOURCE_BASIS_TRACEABLE = true as const;
export const BASISLESS_AUTHORITATIVE_D4_R3_RECORD_AUTO_ACCEPTED = false as const;

export const SOURCE_REQUIREMENT_EQUALS_MECHANICAL_DESIGN_CONDITION = false as const;
export const MECHANICAL_DESIGN_CONDITION_EQUALS_PERFORMANCE_RESULT = false as const;
export const MECHANICAL_PERFORMANCE_CONTEXT_EQUALS_VENDOR_DATA = false as const;
export const MECHANICAL_PERFORMANCE_CONTEXT_EQUALS_VALIDATED_ENGINEERING = false as const;
export { PROCESS_CONDITION_EQUALS_MECHANICAL_DESIGN_CONDITION };
export { SOURCE_REQUIREMENT_EQUALS_MECHANICAL_INTERPRETATION };
export { VENDOR_DATA_EQUALS_ENGINEERING_VALIDATED };
export const VENDOR_DATA_EQUALS_ENGINEERING_APPROVED = false as const;
export { D4_PERFORMANCE_CONTEXT_EQUALS_VALIDATED_PERFORMANCE };
export { D4_MECHANICAL_DESIGN_CONDITION_EQUALS_VALIDATED_DESIGN_CONDITION };

export const D4_R3_UNITS_REQUIRED_FOR_NUMERIC_CONDITIONS = true as const;
export const D4_R3_UNIT_SEMANTICS_PRESERVED = true as const;
export const AI_CAN_SILENTLY_CHANGE_D4_R3_UNIT = false as const;
export const D4_R3_PROCESS_CONDITION_REFERENCE_SUPPORTED = true as const;
export const D4_PROCESS_CONDITION_REFERENCE_EQUALS_D4_AUTHORITY = false as const;
export const D4_CREATES_AUTHORITATIVE_PROCESS_CONDITION = false as const;
export const SOURCE_CONDITION_AUTO_PROMOTED_TO_MECHANICAL_DESIGN_CONDITION = false as const;
export const AI_CAN_AUTOMATICALLY_ADOPT_MECHANICAL_DESIGN_CONDITION = false as const;
export const ADMIN_CAN_AUTOMATICALLY_ADOPT_MECHANICAL_DESIGN_CONDITION = false as const;
export const D4_AUTOMATIC_DESIGN_CONDITION_DERIVATION_RUNTIME_COUNT = 0 as const;
export const D4_AUTOMATIC_PERFORMANCE_DERIVATION_RUNTIME_COUNT = 0 as const;
export const AI_CAN_INVENT_AUTHORITATIVE_D4_DESIGN_CONDITION = false as const;
export const AI_CAN_INVENT_AUTHORITATIVE_D4_PERFORMANCE_VALUE = false as const;

export const D4_VENDOR_DATA_RUNTIME_COUNT = 0 as const;
export const D4_R3_VENDOR_SOURCE_REFERENCE_ALLOWED = true as const;
export const VENDOR_SOURCE_REFERENCE_EQUALS_VENDOR_DATA_RUNTIME = false as const;
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
export const D4_R3_HIDDEN_CALCULATION_ALLOWED = false as const;
export const D4_R3_CALCULATED_RESULT_AUTO_ACCEPTED_AS_SOURCE_CONTEXT = false as const;
export const D4_R3_APPLICABILITY_EXPLICIT = true as const;
export const D4_R3_LIMITATIONS_EXPLICIT = true as const;
export const D4_R3_AUTO_PROPAGATED_OUTSIDE_APPLICABILITY = false as const;

export const D4_REUSES_CANONICAL_CURRENTNESS = true as const;
export const PARALLEL_D4_CURRENTNESS_ENGINE_CREATED = false as const;
export const D4_REUSES_CANONICAL_FINGERPRINT = true as const;
export const SECOND_D4_FINGERPRINT_ALGORITHM_CREATED = false as const;
export const D4_FINGERPRINT_ALGORITHM_REUSED = D4_FINGERPRINT_ALGORITHM;
export const D4_R3_PROVENANCE_REQUIRED = true as const;
export const D4_R3_PROVENANCE_PRESERVED = true as const;
export const D4_R3_AUTO_REPOINTED = false as const;
export const SILENT_D4_R3_MUTATION_ALLOWED = false as const;
export const D4_R3_HISTORY_PRESERVED = true as const;
export const TENANT_WORKSPACE_PROJECT_D4_R3_SCOPE_ENFORCED = true as const;
export const CHANGED_R3_SOURCE_AUTO_REWRITES_HISTORY = false as const;
export const CHANGED_R3_SOURCE_AUTO_UPDATES_DESIGN_CONDITION = false as const;
export const CHANGED_R3_SOURCE_AUTO_REVALIDATES_ENGINEERING = false as const;

export const AI_EQUALS_D4_MECHANICAL_ENGINEERING_AUTHORITY = false as const;
export const ADMIN_EQUALS_D4_MECHANICAL_ENGINEERING_AUTHORITY = false as const;
export {
  D4_EQUALS_D1_STRUCTURAL_AUTHORITY,
  D4_EQUALS_D2_CIVIL_AUTHORITY,
  D4_EQUALS_D3_GEOTECHNICAL_AUTHORITY,
  D4_EQUALS_D5_PIPING_AUTHORITY,
  D4_EQUALS_D6_PROCESS_AUTHORITY,
  D4_EQUALS_D7_ELECTRICAL_AUTHORITY,
  D4_EQUALS_D8_INSTRUMENTATION_CONTROL_AUTHORITY,
};

export const D4_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT = 0 as const;
export const D4_CONFORMANCE_DETERMINATION_RUNTIME_COUNT = 0 as const;
export const D4_APPROVAL_RUNTIME_COUNT = 0 as const;
export const D4_CERTIFICATION_RUNTIME_COUNT = 0 as const;
export const DESIGN_CONDITION_PRESENT_EQUALS_VALIDATED = false as const;
export const PERFORMANCE_CONTEXT_PRESENT_EQUALS_VALIDATED = false as const;
export const PERFORMANCE_CONTEXT_PRESENT_EQUALS_APPROVED = false as const;
export const D4_R3_DUPLICATE_GOVERNANCE_IMPLEMENTED = true as const;
export const D4_R3_REPLAY_PROTECTION_IMPLEMENTED = true as const;
export const D4_R3_SPOOFING_PROTECTION_IMPLEMENTED = true as const;
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
export const D4_EQUIPMENT_SYSTEM_CONTEXT_RUNTIME_READY_REUSED =
  D4_EQUIPMENT_SYSTEM_CONTEXT_RUNTIME_READY;
export const D4_R2_RUNTIME_COUNT_REUSED = D4_R2_RUNTIME_COUNT;

export const D4_VENDOR_DATA_EVIDENCE_RUNTIME_READY = false as const;
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
export const UNAUTHORIZED_D4_R4_R12_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_D5_D8_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_D9_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_MECHANICAL_CALCULATION_PROMOTION = false as const;
export const UNAUTHORIZED_MECHANICAL_VALIDATION_PROMOTION = false as const;
export const UNAUTHORIZED_MECHANICAL_APPROVAL_PROMOTION = false as const;
export const UNAUTHORIZED_MECHANICAL_CERTIFICATION_PROMOTION = false as const;
export const UNAUTHORIZED_CROSS_DISCIPLINE_REASONING_PROMOTION = false as const;
export const UNAUTHORIZED_GA_PROMOTION = false as const;
export const UNAUTHORIZED_PRODUCT_CLAIM = false as const;

export const D4_R4_CANONICAL_PHASE = D4_IMPLEMENTATION_PHASES[3];
export const D4_R4_PHASE_TYPE = "VENDOR_DATA_AND_EVIDENCE_CONTEXT" as const;
export const D4_R4_CANONICAL_SCOPE =
  "Implement governed vendor/manufacturer data and Mechanical evidence context using exact R1-R3 identities/context. Support exact vendor-document revisions, equipment association, data provenance, certified/non-certified status where explicitly supplied, evidence classification and currentness while preserving the distinction between vendor data, engineering adoption, validation and approval. Do not perform equipment calculations, automatically adopt vendor values as engineering truth, implement discipline interfaces, review/validation or D5-D9 runtime." as const;
export const D4_R4_STARTED = false as const;
export const D4_R3_READY_FOR_NEXT_PHASE = true as const;
export const D4_R3_NEXT_PHASE = D4_R4_CANONICAL_PHASE;
export const D4_R3_NEXT_PHASE_TYPE = D4_R4_PHASE_TYPE;
export const D4_R3_CANONICAL_NEXT_PHASE = D4_R4_CANONICAL_PHASE;
export const D4_R3_CANONICAL_NEXT_PHASE_SCOPE = D4_R4_CANONICAL_SCOPE;
export const D4_R3_BLOCKER = "NONE" as const;
export const D4_R3_MACHINE_READABLE_ROADMAP_UPDATED = true as const;

export const D4_R3_DESIGN_CONDITION_KINDS = [
  "DESIGN_PRESSURE",
  "DESIGN_TEMPERATURE",
  "OPERATING_PRESSURE",
  "OPERATING_TEMPERATURE",
  "ENVIRONMENTAL_MECHANICAL_CONDITION",
  "DESIGN_LIFE",
  "CYCLIC_OPERATING_CONTEXT",
  "MECHANICAL_OPERATING_ENVELOPE",
  "EQUIPMENT_DUTY_BASIS",
  "MECHANICAL_LOAD_CRITERION",
] as const;
export type D4R3DesignConditionKind = (typeof D4_R3_DESIGN_CONDITION_KINDS)[number];

export const D4_R3_PERFORMANCE_KINDS = [
  ...D4_PERFORMANCE_CONTEXT_FIELDS,
  "FLOW_REFERENCE",
  "THERMAL_DUTY_CONTEXT",
  "OPERATING_RANGE",
] as const;
export type D4R3PerformanceKind = (typeof D4_R3_PERFORMANCE_KINDS)[number];

export const D4_R3_SOURCE_BASIS_KINDS = [
  "PROJECT_SPECIFICATION",
  "CLIENT_REQUIREMENT",
  "PROCESS_PROVIDED_CONDITION",
  "ADOPTED_PROJECT_DESIGN_BASIS",
  "MECHANICAL_REQUIREMENT",
  "ENGINEERING_ASSUMPTION",
  "AUTHORIZED_ENGINEERING_DECISION",
  "VENDOR_INFORMATION_REFERENCE",
  "GOVERNED_EVIDENCE_REFERENCE",
] as const;
export type D4R3SourceBasisKind = (typeof D4_R3_SOURCE_BASIS_KINDS)[number];

export const D4_R3_RECORD_CLASSES = [
  "SOURCE_REQUIREMENT",
  "PROCESS_CONDITION_REFERENCE",
  "MECHANICAL_DESIGN_CONDITION",
  "MECHANICAL_PERFORMANCE_CONTEXT",
  "CANDIDATE",
] as const;
export type D4R3RecordClass = (typeof D4_R3_RECORD_CLASSES)[number];

const FLOATING = new Set(["latest", "current", "newest", "head", "active", "active model"]);
const BROAD = new Set(["all", "global", "every", "unspecified", "any"]);

export type D4R3SubjectKind = "CLASSIFICATION" | "SERVICE" | "MEMBERSHIP" | "DESCRIPTION";

export type D4R3Record = {
  recordId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  contextId: string;
  objectId: string;
  objectRevisionFingerprint: string;
  r2SubjectKind: D4R3SubjectKind;
  r2SubjectId: string;
  r2RevisionFingerprint: string;
  recordClass: D4R3RecordClass;
  subjectKind: string;
  suppliedValue: string;
  unit: string | null;
  sourceBasis: D4R3SourceBasisKind;
  sourceClass: "SOURCE_REQUIREMENT" | "PROCESS_CONDITION" | "VENDOR_SOURCE" | "GOVERNED_BASIS";
  sourceRef: string;
  sourceRevision: string;
  applicabilityObjectId: string;
  applicabilityCase: string;
  limitations: string;
  adoptionRationale: string | null;
  adoptedFromRecordId: string | null;
  mechanicalDesignCondition: boolean;
  mechanicalPerformanceContext: boolean;
  processAuthority: false;
  authoritativeProcessCondition: false;
  vendorDataRuntime: false;
  vendorSourceReferenced: boolean;
  engineeringValidated: false;
  engineeringApproved: false;
  calculated: false;
  authoritative: boolean;
  candidate: boolean;
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

export type D4R3HistoryRecord = {
  historyId: string;
  recordId: string;
  fingerprint: string;
  recordStatus: "CURRENT" | "SUPERSEDED";
  recordedAt: string;
};

export type D4R3Store = {
  r2: D4R2Store;
  now: () => string;
  records: D4R3Record[];
  history: D4R3HistoryRecord[];
};

type Actor = D4R1Actor;

type BoundInput = {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  contextId: string;
  objectId: string;
  objectRevisionFingerprint: string;
  r2SubjectKind: D4R3SubjectKind;
  r2SubjectId: string;
  r2RevisionFingerprint: string;
  citedCurrentness?: (typeof D4_CURRENTNESS_STATES)[number] | null;
};

type ValueInput = BoundInput & {
  recordId: string;
  subjectKind: string;
  suppliedValue: string;
  unit?: string | null;
  normalizedUnit?: string | null;
  sourceBasis: D4R3SourceBasisKind;
  sourceRef: string;
  sourceRevision: string;
  applicabilityObjectId: string;
  applicabilityCase: string;
  limitations: string;
  provenanceRef: string;
  predecessorRecordId?: string | null;
  candidate?: boolean;
  propagate?: boolean;
  calculatedResult?: boolean;
  formula?: boolean;
  processFlow?: boolean;
  composition?: boolean;
  heatBalance?: boolean;
  processSimulation?: boolean;
  vendorDocumentIngestion?: boolean;
  createsAuthoritativeProcessCondition?: boolean;
  mechanicalEngineeringAuthority?: boolean;
  engineeringValidated?: boolean;
  authoritative?: boolean;
};

function fail(code: string): never {
  throw new Error(`D4_R3_${code}`);
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
  if (actor.authority === "MECHANICAL_ENGINEERING_AUTHORITY") fail("AUTHORITY_SPOOFING_REJECTED");
  if (actor.authority !== D4_CONTEXT_AUTHORITY) fail("RECORDER_AUTHORITY_INVALID");
}

function assertNoCalculation(input: {
  calculatedResult?: boolean;
  formula?: boolean;
  processFlow?: boolean;
  composition?: boolean;
  heatBalance?: boolean;
  processSimulation?: boolean;
  vendorDocumentIngestion?: boolean;
  createsAuthoritativeProcessCondition?: boolean;
  propagate?: boolean;
  normalizedUnit?: string | null;
  mechanicalEngineeringAuthority?: boolean;
  engineeringValidated?: boolean;
}): void {
  if (input.calculatedResult === true || input.formula === true) fail("HIDDEN_CALCULATION_REJECTED");
  if (input.processFlow === true || input.composition === true || input.heatBalance === true || input.processSimulation === true) {
    fail("PROCESS_FABRICATION_REJECTED");
  }
  if (input.vendorDocumentIngestion === true) fail("VENDOR_DATA_RUNTIME_REJECTED");
  if (input.createsAuthoritativeProcessCondition === true) fail("AUTHORITATIVE_PROCESS_CONDITION_REJECTED");
  if (input.propagate === true) fail("AUTO_PROPAGATION_REJECTED");
  if (input.normalizedUnit) fail("UNIT_CHANGE_REJECTED");
  if (input.mechanicalEngineeringAuthority === true || input.engineeringValidated === true) {
    fail("VALIDATION_AUTHORITY_REJECTED");
  }
}

function sourceClassOf(basis: D4R3SourceBasisKind): D4R3Record["sourceClass"] {
  if (basis === "PROCESS_PROVIDED_CONDITION") return "PROCESS_CONDITION";
  if (basis === "VENDOR_INFORMATION_REFERENCE") return "VENDOR_SOURCE";
  if (basis === "CLIENT_REQUIREMENT" || basis === "PROJECT_SPECIFICATION" || basis === "MECHANICAL_REQUIREMENT") {
    return "SOURCE_REQUIREMENT";
  }
  return "GOVERNED_BASIS";
}

function suppliedValue(value: string): { text: string; unit: string | null; numeric: boolean } {
  const text = explicit(value, "VALUE_REQUIRED");
  if (/[=*]|calc\(|sqrt\(/i.test(text)) fail("HIDDEN_CALCULATION_REJECTED");
  const numeric = /^-?\d+(\.\d+)?$/.test(text);
  return { text, unit: null, numeric };
}

function requireUnit(unit: string | null | undefined, numeric: boolean): string | null {
  if (!numeric) return unit && unit.trim() ? explicit(unit, "UNIT_INVALID") : null;
  if (!unit || !unit.trim()) fail("UNITS_REQUIRED");
  return explicit(unit, "UNIT_INVALID");
}

function requireR2(store: D4R3Store, actor: Actor, input: BoundInput): {
  objectId: string;
  objectRevisionFingerprint: string;
  subjectId: string;
  subjectRevision: string;
} {
  assertActor(actor);
  const tenantId = explicit(input.tenantId, "SCOPE_REQUIRED");
  const workspaceId = explicit(input.workspaceId, "SCOPE_REQUIRED");
  const projectId = explicit(input.projectId, "SCOPE_REQUIRED");
  if (tenantId !== actor.tenantId || workspaceId !== actor.workspaceId || projectId !== actor.projectId) {
    fail("SCOPE_MISMATCH");
  }
  const contextId = explicit(input.contextId, "R1_CONTEXT_REQUIRED");
  const context = store.r2.r1.contexts.find((row) => row.contextId === contextId);
  if (!context) fail("R1_CONTEXT_NOT_FOUND");
  if (context.tenantId !== tenantId || context.workspaceId !== workspaceId || context.projectId !== projectId) {
    fail("CROSS_SCOPE_REFERENCE_REJECTED");
  }
  const objectId = explicit(input.objectId, "R1_OBJECT_REQUIRED");
  const objectRevision = explicit(input.objectRevisionFingerprint, "R1_REVISION_REQUIRED");
  const object = store.r2.r1.objects.find((row) => row.objectId === objectId);
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
      ? store.r2.classifications
      : subjectKind === "SERVICE"
        ? store.r2.services
        : subjectKind === "MEMBERSHIP"
          ? store.r2.memberships
          : store.r2.descriptions;
  const subject = rows.find((row) => {
    if (subjectKind === "CLASSIFICATION" && "classificationId" in row) return row.classificationId === subjectId;
    if (subjectKind === "SERVICE" && "serviceContextId" in row) return row.serviceContextId === subjectId;
    if (subjectKind === "MEMBERSHIP" && "membershipId" in row) return row.membershipId === subjectId;
    if (subjectKind === "DESCRIPTION" && "descriptionId" in row) return row.descriptionId === subjectId;
    return false;
  });
  if (!subject) fail("R2_SUBJECT_NOT_FOUND");
  if (subject.fingerprint !== subjectRevision) fail("R2_REVISION_MISMATCH");
  if (subject.objectId !== object.objectId || subject.objectRevisionFingerprint !== object.fingerprint) {
    fail("R2_SUBJECT_MISMATCH");
  }
  if (subject.tenantId !== tenantId || subject.workspaceId !== workspaceId || subject.projectId !== projectId) {
    fail("CROSS_SCOPE_REFERENCE_REJECTED");
  }
  const cited = currentnessOf(input.citedCurrentness, "CURRENTNESS_INVALID");
  if (
    (cited === null || cited === "CURRENT") &&
    (context.recordStatus !== "CURRENT" || object.recordStatus !== "CURRENT" || subject.recordStatus !== "CURRENT")
  ) {
    fail("R2_CONTEXT_NOT_CURRENT");
  }
  return { objectId: object.objectId, objectRevisionFingerprint: object.fingerprint, subjectId, subjectRevision };
}

function applicabilityOf(input: ValueInput, objectId: string): { objectId: string; applicabilityCase: string; limitations: string } {
  const applicabilityObjectId = explicit(input.applicabilityObjectId, "APPLICABILITY_REQUIRED");
  if (applicabilityObjectId !== objectId || BROAD.has(applicabilityObjectId.toLowerCase())) fail("APPLICABILITY_MISMATCH");
  const applicabilityCase = explicit(input.applicabilityCase, "APPLICABILITY_REQUIRED");
  if (BROAD.has(applicabilityCase.toLowerCase())) fail("AUTO_PROPAGATION_REJECTED");
  const limitations = explicit(input.limitations, "LIMITATIONS_REQUIRED");
  return { objectId: applicabilityObjectId, applicabilityCase, limitations };
}

function commit(
  store: D4R3Store,
  actor: Actor,
  input: ValueInput,
  recordClass: D4R3RecordClass,
  allowed: readonly string[],
  adoption: { rationale: string | null; fromRecordId: string | null },
): D4R3Record {
  assertNoCalculation(input);
  if (!(allowed as readonly string[]).includes(input.subjectKind)) fail("SUBJECT_KIND_INVALID");
  if (!(D4_R3_SOURCE_BASIS_KINDS as readonly string[]).includes(input.sourceBasis)) fail("SOURCE_BASIS_REQUIRED");
  const bound = requireR2(store, actor, input);
  const value = suppliedValue(input.suppliedValue);
  const unit = requireUnit(input.unit, value.numeric);
  const sourceRef = explicit(input.sourceRef, "SOURCE_REFERENCE_REQUIRED");
  const sourceRevision = explicit(input.sourceRevision, "SOURCE_REVISION_REQUIRED");
  const provenanceRef = explicit(input.provenanceRef, "PROVENANCE_REQUIRED");
  const scope = applicabilityOf(input, bound.objectId);
  const candidate = input.candidate === true;
  if (candidate && recordClass !== "CANDIDATE") fail("CANDIDATE_NOT_AUTHORITATIVE");
  if (input.authoritative === true && candidate) fail("CANDIDATE_NOT_AUTHORITATIVE");
  const authoritative = recordClass === "MECHANICAL_DESIGN_CONDITION" || recordClass === "MECHANICAL_PERFORMANCE_CONTEXT";
  if (authoritative && !adoption.rationale) fail("ADOPTION_RATIONALE_REQUIRED");
  const recordId = explicit(input.recordId, "RECORD_REQUIRED");
  const existing = store.records.find((row) => row.recordId === recordId);
  const sourceClass = sourceClassOf(input.sourceBasis);
  const fingerprint = fingerprintCanonical({
    recordId,
    contextId: explicit(input.contextId, "R1_CONTEXT_REQUIRED"),
    objectId: bound.objectId,
    objectRevisionFingerprint: bound.objectRevisionFingerprint,
    r2SubjectKind: input.r2SubjectKind,
    r2SubjectId: bound.subjectId,
    r2RevisionFingerprint: bound.subjectRevision,
    recordClass,
    subjectKind: input.subjectKind,
    suppliedValue: value.text,
    unit,
    sourceBasis: input.sourceBasis,
    sourceClass,
    sourceRef,
    sourceRevision,
    applicabilityObjectId: scope.objectId,
    applicabilityCase: scope.applicabilityCase,
    limitations: scope.limitations,
    adoptionRationale: adoption.rationale,
    adoptedFromRecordId: adoption.fromRecordId,
    provenanceRef,
  });
  if (existing) {
    if (existing.fingerprint === fingerprint) return existing;
    fail("RECORD_ALREADY_RECORDED");
  }
  let predecessor: D4R3Record | null = null;
  if (input.predecessorRecordId) {
    const predecessorId = explicit(input.predecessorRecordId, "PREDECESSOR_INVALID");
    predecessor = store.records.find((row) => row.recordId === predecessorId) ?? null;
    if (!predecessor || predecessor.objectId !== bound.objectId || predecessor.recordClass !== recordClass) {
      fail("PREDECESSOR_NOT_FOUND");
    }
    if (predecessor.recordStatus !== "CURRENT") fail("PREDECESSOR_NOT_CURRENT");
  }
  const duplicate = store.records.find(
    (row) =>
      row.recordStatus === "CURRENT" &&
      row.recordId !== predecessor?.recordId &&
      row.objectId === bound.objectId &&
      row.r2RevisionFingerprint === bound.subjectRevision &&
      row.recordClass === recordClass &&
      row.subjectKind === input.subjectKind &&
      row.applicabilityCase === scope.applicabilityCase &&
      row.sourceRevision === sourceRevision &&
      row.suppliedValue === value.text &&
      row.unit === unit,
  );
  if (duplicate) fail("DUPLICATE_RECORD_REJECTED");
  if (predecessor) {
    predecessor.recordStatus = "SUPERSEDED";
    predecessor.currentness = "SUPERSEDED";
  }
  const cited = currentnessOf(input.citedCurrentness, "CURRENTNESS_INVALID");
  const record: D4R3Record = {
    recordId,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
    contextId: explicit(input.contextId, "R1_CONTEXT_REQUIRED"),
    objectId: bound.objectId,
    objectRevisionFingerprint: bound.objectRevisionFingerprint,
    r2SubjectKind: input.r2SubjectKind,
    r2SubjectId: bound.subjectId,
    r2RevisionFingerprint: bound.subjectRevision,
    recordClass,
    subjectKind: input.subjectKind,
    suppliedValue: value.text,
    unit,
    sourceBasis: input.sourceBasis,
    sourceClass,
    sourceRef,
    sourceRevision,
    applicabilityObjectId: scope.objectId,
    applicabilityCase: scope.applicabilityCase,
    limitations: scope.limitations,
    adoptionRationale: adoption.rationale,
    adoptedFromRecordId: adoption.fromRecordId,
    mechanicalDesignCondition: recordClass === "MECHANICAL_DESIGN_CONDITION",
    mechanicalPerformanceContext: recordClass === "MECHANICAL_PERFORMANCE_CONTEXT",
    processAuthority: false,
    authoritativeProcessCondition: false,
    vendorDataRuntime: false,
    vendorSourceReferenced: input.sourceBasis === "VENDOR_INFORMATION_REFERENCE",
    engineeringValidated: false,
    engineeringApproved: false,
    calculated: false,
    authoritative,
    candidate,
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
    historyId: `d4r3-history-${store.history.length + 1}`,
    recordId: record.recordId,
    fingerprint: record.fingerprint,
    recordStatus: "CURRENT",
    recordedAt: record.createdAt,
  });
  if (predecessor) {
    store.history.push({
      historyId: `d4r3-history-${store.history.length + 1}`,
      recordId: predecessor.recordId,
      fingerprint: predecessor.fingerprint,
      recordStatus: "SUPERSEDED",
      recordedAt: record.createdAt,
    });
  }
  return record;
}

export function createD4R3Store(r2: D4R2Store, now: () => string = () => "2026-10-24T00:00:00.000Z"): D4R3Store {
  return { r2, now, records: [], history: [] };
}

export function recordMechanicalSourceRequirement(store: D4R3Store, actor: Actor, input: ValueInput): D4R3Record {
  if (input.sourceBasis === "PROCESS_PROVIDED_CONDITION") fail("PROCESS_REFERENCE_IS_NOT_SOURCE_REQUIREMENT");
  return commit(store, actor, input, "SOURCE_REQUIREMENT", D4_R3_DESIGN_CONDITION_KINDS, {
    rationale: null,
    fromRecordId: null,
  });
}

export function recordProcessConditionReference(store: D4R3Store, actor: Actor, input: ValueInput): D4R3Record {
  if (input.sourceBasis !== "PROCESS_PROVIDED_CONDITION") fail("PROCESS_BASIS_REQUIRED");
  return commit(store, actor, input, "PROCESS_CONDITION_REFERENCE", D4_R3_DESIGN_CONDITION_KINDS, {
    rationale: null,
    fromRecordId: null,
  });
}

export function recordMechanicalDesignCondition(
  store: D4R3Store,
  actor: Actor,
  input: ValueInput & { adoptionRationale: string },
): D4R3Record {
  const rationale = explicit(input.adoptionRationale, "ADOPTION_RATIONALE_REQUIRED");
  return commit(store, actor, input, "MECHANICAL_DESIGN_CONDITION", D4_R3_DESIGN_CONDITION_KINDS, {
    rationale,
    fromRecordId: null,
  });
}

export function recordMechanicalPerformanceContext(
  store: D4R3Store,
  actor: Actor,
  input: ValueInput & { adoptionRationale: string },
): D4R3Record {
  const rationale = explicit(input.adoptionRationale, "ADOPTION_RATIONALE_REQUIRED");
  return commit(store, actor, input, "MECHANICAL_PERFORMANCE_CONTEXT", D4_R3_PERFORMANCE_KINDS, {
    rationale,
    fromRecordId: null,
  });
}

export function recordMechanicalConditionCandidate(store: D4R3Store, actor: Actor, input: ValueInput): D4R3Record {
  return commit(store, actor, { ...input, candidate: true }, "CANDIDATE", D4_R3_DESIGN_CONDITION_KINDS, {
    rationale: null,
    fromRecordId: null,
  });
}

export function adoptMechanicalDesignCondition(
  store: D4R3Store,
  actor: Actor,
  input: ValueInput & { adoptedFromRecordId: string; adoptionRationale: string },
): D4R3Record {
  const fromId = explicit(input.adoptedFromRecordId, "ADOPTION_SOURCE_REQUIRED");
  const rationale = explicit(input.adoptionRationale, "ADOPTION_RATIONALE_REQUIRED");
  const source = store.records.find((row) => row.recordId === fromId);
  if (!source || (source.recordClass !== "SOURCE_REQUIREMENT" && source.recordClass !== "PROCESS_CONDITION_REFERENCE")) {
    fail("ADOPTION_SOURCE_NOT_FOUND");
  }
  const value = suppliedValue(input.suppliedValue);
  const unit = requireUnit(input.unit, value.numeric);
  if (value.text !== source.suppliedValue || unit !== source.unit) fail("ADOPTION_VALUE_CHANGED");
  const before = source.fingerprint;
  const adopted = commit(
    store,
    actor,
    input,
    "MECHANICAL_DESIGN_CONDITION",
    D4_R3_DESIGN_CONDITION_KINDS,
    { rationale, fromRecordId: source.recordId },
  );
  if (source.fingerprint !== before || source.recordStatus !== "CURRENT") fail("SOURCE_HISTORY_REWRITTEN");
  return adopted;
}

export function promoteSourceCondition(): never {
  fail("SOURCE_CONDITION_AUTO_PROMOTION_REJECTED");
}

export function deriveDesignCondition(): never {
  fail("AUTOMATIC_DESIGN_CONDITION_DERIVATION_REJECTED");
}

export function derivePerformanceValue(): never {
  fail("AUTOMATIC_PERFORMANCE_DERIVATION_REJECTED");
}

export function applyChangedSourceToDesignCondition(): never {
  fail("SOURCE_CHANGE_AUTO_UPDATE_REJECTED");
}

export function repointMechanicalCondition(): never {
  fail("SOURCE_AUTO_REPOINT_REJECTED");
}

export function mutateMechanicalCondition(): never {
  fail("SILENT_MUTATION_REJECTED");
}

export function sizeMechanicalEquipment(): never {
  fail("EQUIPMENT_SIZING_REJECTED");
}

export function ingestVendorData(): never {
  fail("VENDOR_DATA_RUNTIME_REJECTED");
}

export function validateMechanicalCondition(): never {
  fail("VALIDATION_RUNTIME_REJECTED");
}

export function approveMechanicalCondition(): never {
  fail("APPROVAL_RUNTIME_REJECTED");
}
