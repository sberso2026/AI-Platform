/**
 * EOS-D4-R6 — Mechanical maintainability, access, lifting/removal, and package context.
 * Records supplied or explicitly adopted constraints. Does not verify space, analyze lifting, or prove feasibility.
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
} from "./vendor-data-evidence-context";
import {
  D4_MECHANICAL_TECHNICAL_CONTEXT_RUNTIME_READY as R5_TECHNICAL_READY,
  D4_RUNTIME_COUNT as D4_R5_RUNTIME_COUNT,
  type D4R5Store,
} from "./mechanical-technical-context";

export const D4_R6_STATUS = "MAINTAINABILITY_ACCESS_AND_PACKAGE_CONTEXT_IMPLEMENTED" as const;
export const D4_R6_MATURITY = D4_R6_STATUS;
export const D4_R6_MATURITY_STATE = D4_R6_STATUS;
export const D4_RUNTIME_STARTED = true as const;
export const D4_RUNTIME_COUNT = 6 as const;
export const D4_MAINTAINABILITY_ACCESS_PACKAGE_RUNTIME_IMPLEMENTED = true as const;
export const D4_MAINTAINABILITY_ACCESS_PACKAGE_RUNTIME_COUNT = 1 as const;
export const D4_MAINTAINABILITY_ACCESS_PACKAGE_RUNTIME_READY = true as const;
export const D4_MAINTAINABILITY_RUNTIME_COUNT = 0 as const;
export const D4_MAINTAINABILITY_CONTEXT_IMPLEMENTED = true as const;
export const MAINTAINABILITY_CONTEXT_EQUALS_SPATIAL_VALIDATION = false as const;
export const MAINTAINABILITY_CONTEXT_EQUALS_MAINTENANCE_FEASIBILITY_CONFIRMED = false as const;
export const D4_ACCESS_CLEARANCE_CONTEXT_IMPLEMENTED = true as const;
export const D4_R6_ACCESS_CLEARANCE_SOURCE_BASIS_REQUIRED = true as const;
export const D4_AUTOMATIC_CLEARANCE_VERIFICATION_RUNTIME_COUNT = 0 as const;
export const D4_SPATIAL_CLASH_DETECTION_RUNTIME_COUNT = 0 as const;
export const D4_REMOVAL_REPLACEMENT_CONTEXT_IMPLEMENTED = true as const;
export const REMOVAL_CONTEXT_EQUALS_ROUTE_VALIDATED = false as const;
export const REPLACEMENT_CONTEXT_EQUALS_INSTALLABILITY_VALIDATED = false as const;
export const D4_LIFTING_CONTEXT_IMPLEMENTED = true as const;
export const D4_LIFTING_CONTEXT_EQUALS_LIFTING_ANALYSIS = false as const;
export const D4_LIFTING_CONTEXT_EQUALS_RIGGING_DESIGN = false as const;
export const D4_LIFTING_CONTEXT_EQUALS_STRUCTURAL_LIFTING_DESIGN = false as const;
export const D4_PACKAGE_CONTEXT_IMPLEMENTED = true as const;
export const D4_PACKAGE_BOUNDARY_CONTEXT_IMPLEMENTED = true as const;
export const D4_R2_PACKAGE_MEMBERSHIP_REUSED = true as const;
export const D4_R6_INFERRED_PACKAGE_MEMBERSHIP_ALLOWED = false as const;
export const D4_MECHANICAL_ARRANGEMENT_CONSTRAINT_CONTEXT_IMPLEMENTED = true as const;
export const D4_ARRANGEMENT_CONTEXT_EQUALS_LAYOUT_OPTIMIZED = false as const;
export const D4_ARRANGEMENT_CONTEXT_EQUALS_CLASH_FREE = false as const;
export const D4_R6_SOURCE_BASIS_REQUIRED = true as const;
export const D4_R6_SOURCE_BASIS_TRACEABLE = true as const;
export const BASISLESS_AUTHORITATIVE_D4_R6_RECORD_AUTO_ACCEPTED = false as const;
export const D4_R4_VENDOR_EVIDENCE_REFERENCE_SUPPORTED = true as const;
export const VENDOR_MAINTENANCE_REQUIREMENT_EQUALS_ADOPTED_D4_MAINTAINABILITY = false as const;
export const VENDOR_LIFTING_DATA_EQUALS_VALIDATED_LIFTING_DESIGN = false as const;
export const D4_R5_TECHNICAL_REQUIREMENT_REFERENCE_SUPPORTED = true as const;
export const D4_R6_AUTO_MUTATES_R5_REQUIREMENT = false as const;
export const D4_R6_AUTO_REWRITES_R5_TECHNICAL_CONTEXT = false as const;
export const D4_R6_APPLICABILITY_EXPLICIT = true as const;
export const D4_R6_LIMITATIONS_EXPLICIT = true as const;
export const D4_R6_AUTO_PROPAGATED_OUTSIDE_APPLICABILITY = false as const;
export const D4_ACCESS_PATH_SOLVER_RUNTIME_COUNT = 0 as const;
export const D4_REMOVAL_ROUTE_SOLVER_RUNTIME_COUNT = 0 as const;
export const D4_LAYOUT_OPTIMIZATION_RUNTIME_COUNT = 0 as const;
export const D4_STRUCTURAL_LIFTING_DESIGN_RUNTIME_COUNT = 0 as const;
export const D4_RIGGING_ANALYSIS_RUNTIME_COUNT = 0 as const;
export const D4_LIFTING_LOAD_STRUCTURAL_VERIFICATION_RUNTIME_COUNT = 0 as const;
export const D4_LIFTING_REQUIREMENT_EQUALS_D1_STRUCTURAL_VERIFICATION = false as const;
export const D4_R6_HIDDEN_CALCULATION_ALLOWED = false as const;
export const MAINTENANCE_ENVELOPE_PRESENT_EQUALS_VALIDATED = false as const;
export const ACCESS_REQUIREMENT_PRESENT_EQUALS_LAYOUT_VALIDATED = false as const;
export const LIFTING_REQUIREMENT_PRESENT_EQUALS_LIFTING_VALIDATED = false as const;

export const D4_R1_IDENTITY_REUSED = true as const;
export const D4_R2_EQUIPMENT_SYSTEM_CONTEXT_REUSED = true as const;
export const D4_R3_DESIGN_CONDITION_PERFORMANCE_CONTEXT_REUSED = true as const;
export const D4_R4_VENDOR_DATA_EVIDENCE_CONTEXT_REUSED = true as const;
export const D4_R5_MECHANICAL_TECHNICAL_CONTEXT_REUSED = true as const;
export const EXACT_D4_R1_R5_REFERENCE_REQUIRED = true as const;
export const FLOATING_D4_R6_SOURCE_REFERENCE_ALLOWED = false as const;
export const D4_R6_SOURCE_AUTO_REPOINTED = false as const;

export const AI_EQUALS_D4_MECHANICAL_ENGINEERING_AUTHORITY = false as const;
export const ADMIN_EQUALS_D4_MECHANICAL_ENGINEERING_AUTHORITY = false as const;
export const AI_CAN_INVENT_AUTHORITATIVE_D4_MAINTAINABILITY_REQUIREMENT = false as const;
export const AI_CAN_INVENT_AUTHORITATIVE_D4_ACCESS_CLEARANCE = false as const;
export const AI_CAN_INVENT_AUTHORITATIVE_D4_LIFTING_REQUIREMENT = false as const;
export const D4_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_COUNT = 0 as const;
export const D4_R6_CHANGE_PROPAGATION_RUNTIME_COUNT = 0 as const;
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
export const D4_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT = 0 as const;
export const D4_CROSS_DISCIPLINE_CONFLICT_DETECTION_RUNTIME_COUNT = 0 as const;
export const D4_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT = 0 as const;
export const D4_CROSS_DISCIPLINE_RECOMMENDATION_RUNTIME_COUNT = 0 as const;
export const D4_D9_RUNTIME_INTEGRATION_COUNT = 0 as const;
export const D4_REUSES_CANONICAL_CURRENTNESS = true as const;
export const PARALLEL_D4_CURRENTNESS_ENGINE_CREATED = false as const;
export const D4_REUSES_CANONICAL_FINGERPRINT = true as const;
export const SECOND_D4_FINGERPRINT_ALGORITHM_CREATED = false as const;
export const D4_FINGERPRINT_ALGORITHM_REUSED = D4_FINGERPRINT_ALGORITHM;
export const D4_R6_PROVENANCE_REQUIRED = true as const;
export const D4_R6_PROVENANCE_PRESERVED = true as const;
export const D4_R6_AUTO_REPOINTED = false as const;
export const SILENT_D4_R6_MUTATION_ALLOWED = false as const;
export const D4_R6_HISTORY_PRESERVED = true as const;
export const TENANT_WORKSPACE_PROJECT_D4_R6_SCOPE_ENFORCED = true as const;
export const CHANGED_R6_SOURCE_AUTO_REWRITES_CONTEXT = false as const;
export const CHANGED_R6_SOURCE_AUTO_REWRITES_HISTORY = false as const;
export const CHANGED_R6_SOURCE_AUTO_REVALIDATES_ENGINEERING = false as const;
export {
  D4_EQUALS_D1_STRUCTURAL_AUTHORITY,
  D4_EQUALS_D2_CIVIL_AUTHORITY,
  D4_EQUALS_D3_GEOTECHNICAL_AUTHORITY,
  D4_EQUALS_D5_PIPING_AUTHORITY,
  D4_EQUALS_D6_PROCESS_AUTHORITY,
  D4_EQUALS_D7_ELECTRICAL_AUTHORITY,
  D4_EQUALS_D8_INSTRUMENTATION_CONTROL_AUTHORITY,
};
export const D4_R6_DUPLICATE_GOVERNANCE_IMPLEMENTED = true as const;
export const D4_R6_REPLAY_PROTECTION_IMPLEMENTED = true as const;
export const D4_R6_SPOOFING_PROTECTION_IMPLEMENTED = true as const;

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
export const D4_MECHANICAL_TECHNICAL_CONTEXT_RUNTIME_READY = R5_TECHNICAL_READY;
export const D4_R2_RUNTIME_COUNT_REUSED = D4_R2_RUNTIME_COUNT;
export const D4_R3_RUNTIME_COUNT_REUSED = D4_R3_RUNTIME_COUNT;
export const D4_R4_RUNTIME_COUNT_REUSED = D4_R4_RUNTIME_COUNT;
export const D4_R5_RUNTIME_COUNT_REUSED = D4_R5_RUNTIME_COUNT;

export const D4_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY = false as const;
export const D4_DISCIPLINE_INTERFACE_RUNTIME_READY = false as const;
export const D4_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_READY = false as const;
export const D4_CURRENTNESS_DIGITAL_THREAD_RUNTIME_READY = false as const;
export const D4_D9_SOURCE_CONTRACT_RUNTIME_READY = false as const;

export const UNAUTHORIZED_D1_PACK_COMPLETION = false as const;
export const UNAUTHORIZED_D2_REOPEN = false as const;
export const UNAUTHORIZED_D3_REOPEN = false as const;
export const UNAUTHORIZED_D4_R7_R12_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_D5_D8_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_D9_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_SPATIAL_REASONING_PROMOTION = false as const;
export const UNAUTHORIZED_LIFTING_ANALYSIS_PROMOTION = false as const;
export const UNAUTHORIZED_MECHANICAL_CALCULATION_PROMOTION = false as const;
export const UNAUTHORIZED_MECHANICAL_VALIDATION_PROMOTION = false as const;
export const UNAUTHORIZED_MECHANICAL_CONFORMANCE_PROMOTION = false as const;
export const UNAUTHORIZED_MECHANICAL_APPROVAL_PROMOTION = false as const;
export const UNAUTHORIZED_MECHANICAL_CERTIFICATION_PROMOTION = false as const;
export const UNAUTHORIZED_CROSS_DISCIPLINE_REASONING_PROMOTION = false as const;
export const UNAUTHORIZED_GA_PROMOTION = false as const;
export const UNAUTHORIZED_PRODUCT_CLAIM = false as const;

export const D4_R7_CANONICAL_PHASE = D4_IMPLEMENTATION_PHASES[6];
export const D4_R7_PHASE_TYPE = "REQUIREMENTS_ASSUMPTIONS_AND_CHANGE" as const;
export const D4_R7_CANONICAL_SCOPE =
  "Implement canonical requirement, assumption, engineering-decision and change/reassessment governance for D4 using exact R1-R6 Mechanical revisions. Reuse canonical EOS governance, preserve explicit dependencies, supersession and reassessment semantics, and prevent automatic recalculation/redesign or AI/admin engineering authority. Do not implement discipline interfaces, review/validation, currentness/digital-thread dedicated runtime, D9 source-contract runtime or D5-D9 runtime." as const;
export const D4_R7_STARTED = false as const;
export const D4_R6_READY_FOR_NEXT_PHASE = true as const;
export const D4_R6_NEXT_PHASE = D4_R7_CANONICAL_PHASE;
export const D4_R6_NEXT_PHASE_TYPE = D4_R7_PHASE_TYPE;
export const D4_R6_CANONICAL_NEXT_PHASE = D4_R7_CANONICAL_PHASE;
export const D4_R6_CANONICAL_NEXT_PHASE_SCOPE = D4_R7_CANONICAL_SCOPE;
export const D4_R6_BLOCKER = "NONE" as const;
export const D4_R6_MACHINE_READABLE_ROADMAP_UPDATED = true as const;

export const D4_R6_SOURCE_BASIS_KINDS = [
  "R5_MECHANICAL_TECHNICAL_REQUIREMENT",
  "R4_VENDOR_EVIDENCE",
  "PROJECT_SPECIFICATION",
  "MECHANICAL_DESIGN_BASIS",
  "MAINTENANCE_STRATEGY",
  "MANUFACTURER_INSTRUCTION",
  "AUTHORIZED_MECHANICAL_ENGINEERING_INPUT",
  "GOVERNED_PROJECT_REQUIREMENT",
] as const;
export type D4R6SourceBasis = (typeof D4_R6_SOURCE_BASIS_KINDS)[number];

export const D4_R6_SUBJECT_KINDS = [
  "MAINTENANCE_ENVELOPE",
  "SERVICE_ACCESS_REQUIREMENT",
  "INSPECTION_ACCESS_REQUIREMENT",
  "REMOVAL_ENVELOPE",
  "LIFTING_REMOVAL_REQUIREMENT",
  "MAINTENANCE_ORIENTATION",
  "REPLACEMENT_PATH_CONTEXT",
  "PACKAGE_BOUNDARY",
  "PACKAGE_CONTAINMENT",
  "MECHANICAL_ARRANGEMENT_CONSTRAINT",
  "MAINTENANCE_CLEARANCE",
  "SERVICE_CLEARANCE",
  "ACCESS_RESTRICTION",
  "PACKAGE_LIMITATION",
  "LIFTING_POINT_CONTEXT",
  "REMOVAL_DIRECTION",
  "REPLACEMENT_SPACE",
  "TEMPORARY_ACCESS",
  "MAINTENANCE_EXTRACTION",
  "LIFTING_MASS",
  "CENTER_OF_GRAVITY",
  "LIFTING_ORIENTATION",
  "TEMPORARY_HANDLING",
  "ACCESS_SIDE",
  "SERVICE_ZONE",
  "RESTRICTED_ZONE",
  "ADJACENCY_RESTRICTION",
  "MAINTENANCE_SIDE",
  "MINIMUM_CLEARANCE",
  "MAINTENANCE_INTERVAL",
] as const;

export const D4_R6_RECORD_CLASSES = [
  "MAINTAINABILITY_CONTEXT",
  "ACCESS_CLEARANCE_CONTEXT",
  "REMOVAL_REPLACEMENT_CONTEXT",
  "LIFTING_CONTEXT",
  "PACKAGE_CONTEXT",
  "PACKAGE_BOUNDARY",
  "ARRANGEMENT_CONSTRAINT",
  "VENDOR_SUPPLIED_CONTEXT",
  "CANDIDATE",
] as const;
export type D4R6RecordClass = (typeof D4_R6_RECORD_CLASSES)[number];
export type D4R6UpstreamKind = "CLASSIFICATION" | "SERVICE" | "MEMBERSHIP" | "DESCRIPTION";

const FLOATING = new Set(["latest", "current", "newest", "head", "active", "active model"]);
const BROAD = new Set(["all", "global", "every", "unspecified", "any"]);
const ADOPTED_CLASSES = new Set<D4R6RecordClass>([
  "MAINTAINABILITY_CONTEXT",
  "ACCESS_CLEARANCE_CONTEXT",
  "REMOVAL_REPLACEMENT_CONTEXT",
  "LIFTING_CONTEXT",
  "PACKAGE_CONTEXT",
  "PACKAGE_BOUNDARY",
  "ARRANGEMENT_CONSTRAINT",
]);
const PACKAGE_CLASSES = new Set<D4R6RecordClass>(["PACKAGE_CONTEXT", "PACKAGE_BOUNDARY"]);

export type D4R6Record = {
  recordId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  contextId: string;
  objectId: string;
  objectRevisionFingerprint: string;
  r2SubjectKind: D4R6UpstreamKind;
  r2SubjectId: string;
  r2RevisionFingerprint: string;
  r3RecordId: string;
  r3RevisionFingerprint: string;
  r4RecordId: string;
  r4RevisionFingerprint: string;
  r5RecordId: string;
  r5RevisionFingerprint: string;
  recordClass: D4R6RecordClass;
  subjectKind: string;
  statement: string;
  componentRef: string;
  orientationContext: string;
  sourceBasis: D4R6SourceBasis;
  sourceRef: string;
  sourceRevision: string;
  suppliedValue: string | null;
  unit: string | null;
  applicabilityObjectId: string;
  applicabilityCase: string;
  limitations: string;
  adoptionRationale: string | null;
  adopted: boolean;
  authoritative: boolean;
  candidate: boolean;
  spatialValidation: false;
  feasibilityConfirmed: false;
  clearanceVerified: false;
  routeValidated: false;
  installabilityValidated: false;
  liftingAnalysis: false;
  riggingDesign: false;
  structuralLiftingDesign: false;
  structuralVerification: false;
  layoutOptimized: false;
  clashFree: false;
  vendorAutoAdopted: false;
  engineeringValidated: false;
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

export type D4R6HistoryRecord = {
  historyId: string;
  recordId: string;
  fingerprint: string;
  recordStatus: "CURRENT" | "SUPERSEDED";
  recordedAt: string;
};

export type D4R6Store = {
  r5: D4R5Store;
  now: () => string;
  records: D4R6Record[];
  history: D4R6HistoryRecord[];
};

type Actor = D4R1Actor;

export type D4R6Input = {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  contextId: string;
  objectId: string;
  objectRevisionFingerprint: string;
  r2SubjectKind: D4R6UpstreamKind;
  r2SubjectId: string;
  r2RevisionFingerprint: string;
  r3RecordId: string;
  r3RevisionFingerprint: string;
  r4RecordId: string;
  r4RevisionFingerprint: string;
  r5RecordId: string;
  r5RevisionFingerprint: string;
  citedCurrentness?: (typeof D4_CURRENTNESS_STATES)[number] | null;
  recordId: string;
  subjectKind: string;
  statement: string;
  componentRef: string;
  orientationContext: string;
  sourceBasis: string;
  sourceRef: string;
  sourceRevision: string;
  suppliedValue?: string | null;
  unit?: string | null;
  normalizedUnit?: string | null;
  applicabilityObjectId: string;
  applicabilityCase: string;
  limitations: string;
  provenanceRef: string;
  adoptionRationale?: string | null;
  predecessorRecordId?: string | null;
  inferMembership?: boolean;
  membershipBasis?: string | null;
  propagate?: boolean;
  formula?: boolean;
  calculatedResult?: boolean;
  spatialClash?: boolean;
  geometrySolve?: boolean;
  verifyClearance?: boolean;
  accessPath?: boolean;
  removalRoute?: boolean;
  optimizeRoute?: boolean;
  layoutOptimized?: boolean;
  multidisciplinaryOptimization?: boolean;
  liftingAnalysis?: boolean;
  riggingDesign?: boolean;
  structuralLifting?: boolean;
  structuralVerification?: boolean;
  sizeEquipment?: boolean;
  pipingRoute?: boolean;
  processDesign?: boolean;
  disciplineInterface?: boolean;
  validate?: boolean;
  d9Reasoning?: boolean;
  clashFree?: boolean;
  routeValidated?: boolean;
  installabilityValidated?: boolean;
  feasibilityConfirmed?: boolean;
  spatialValidation?: boolean;
  mutateR5?: boolean;
  changePropagation?: boolean;
  invented?: boolean;
  autoAdoptVendor?: boolean;
  crossDisciplineConclusion?: boolean;
  conforms?: boolean;
  certified?: boolean;
  engineeringValidated?: boolean;
};

function fail(code: string): never {
  throw new Error(`D4_R6_${code}`);
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
  if (actor.actorId === "VENDOR" || actor.authority === "VENDOR") fail("VENDOR_AUTHORITY_REJECTED");
  if (actor.authority === "MECHANICAL_ENGINEERING_AUTHORITY") fail("AUTHORITY_SPOOFING_REJECTED");
  if (actor.authority !== D4_CONTEXT_AUTHORITY) fail("RECORDER_AUTHORITY_INVALID");
}

function assertBoundaries(input: D4R6Input): void {
  if (input.propagate === true) fail("AUTO_PROPAGATION_REJECTED");
  if (input.formula === true || input.calculatedResult === true) fail("HIDDEN_CALCULATION_REJECTED");
  if (input.spatialClash === true || input.geometrySolve === true) fail("SPATIAL_ANALYSIS_REJECTED");
  if (input.verifyClearance === true) fail("CLEARANCE_VERIFICATION_REJECTED");
  if (input.accessPath === true) fail("ACCESS_PATH_SOLVER_REJECTED");
  if (input.removalRoute === true || input.optimizeRoute === true) fail("REMOVAL_ROUTE_SOLVER_REJECTED");
  if (input.layoutOptimized === true || input.multidisciplinaryOptimization === true) fail("LAYOUT_OPTIMIZATION_REJECTED");
  if (input.liftingAnalysis === true) fail("LIFTING_ANALYSIS_REJECTED");
  if (input.riggingDesign === true) fail("RIGGING_DESIGN_REJECTED");
  if (input.structuralLifting === true || input.structuralVerification === true) fail("STRUCTURAL_LIFTING_REJECTED");
  if (input.sizeEquipment === true) fail("EQUIPMENT_SIZING_REJECTED");
  if (input.pipingRoute === true || input.processDesign === true) fail("COUNTERPART_DESIGN_REJECTED");
  if (input.disciplineInterface === true) fail("DISCIPLINE_INTERFACE_REJECTED");
  if (input.validate === true || input.conforms === true || input.certified === true || input.engineeringValidated === true) {
    fail("VALIDATION_AUTHORITY_REJECTED");
  }
  if (input.d9Reasoning === true || input.crossDisciplineConclusion === true) fail("CROSS_DISCIPLINE_REASONING_REJECTED");
  if (input.clashFree === true) fail("CLASH_FREE_CLAIM_REJECTED");
  if (input.routeValidated === true || input.installabilityValidated === true) fail("ROUTE_VALIDATION_REJECTED");
  if (input.feasibilityConfirmed === true || input.spatialValidation === true) fail("FEASIBILITY_CLAIM_REJECTED");
  if (input.mutateR5 === true) fail("R5_MUTATION_REJECTED");
  if (input.changePropagation === true) fail("CHANGE_PROPAGATION_REJECTED");
  if (input.invented === true) fail("INVENTED_CONTEXT_REJECTED");
  if (input.autoAdoptVendor === true) fail("VENDOR_AUTO_ADOPTION_REJECTED");
  if (input.inferMembership === true) fail("INFERRED_PACKAGE_MEMBERSHIP_REJECTED");
  if (input.membershipBasis != null && input.membershipBasis !== "EXPLICIT") fail("INFERRED_PACKAGE_MEMBERSHIP_REJECTED");
  if (input.normalizedUnit) fail("UNIT_CHANGE_REJECTED");
}

function requireChain(store: D4R6Store, actor: Actor, input: D4R6Input): {
  objectId: string;
  objectRevisionFingerprint: string;
  r2SubjectId: string;
  r2RevisionFingerprint: string;
  membershipKind: string | null;
  membershipBasis: string | null;
  r3RecordId: string;
  r3RevisionFingerprint: string;
  r4RecordId: string;
  r4RevisionFingerprint: string;
  r5RecordId: string;
  r5RevisionFingerprint: string;
} {
  assertActor(actor);
  const tenantId = explicit(input.tenantId, "SCOPE_REQUIRED");
  const workspaceId = explicit(input.workspaceId, "SCOPE_REQUIRED");
  const projectId = explicit(input.projectId, "SCOPE_REQUIRED");
  if (tenantId !== actor.tenantId || workspaceId !== actor.workspaceId || projectId !== actor.projectId) fail("SCOPE_MISMATCH");
  const contextId = explicit(input.contextId, "R1_CONTEXT_REQUIRED");
  const context = store.r5.r4.r3.r2.r1.contexts.find((row) => row.contextId === contextId);
  if (!context) fail("R1_CONTEXT_NOT_FOUND");
  if (context.tenantId !== tenantId || context.workspaceId !== workspaceId || context.projectId !== projectId) {
    fail("CROSS_SCOPE_REFERENCE_REJECTED");
  }
  const objectId = explicit(input.objectId, "R1_OBJECT_REQUIRED");
  const objectRevision = explicit(input.objectRevisionFingerprint, "R1_REVISION_REQUIRED");
  const object = store.r5.r4.r3.r2.r1.objects.find((row) => row.objectId === objectId);
  if (!object || object.contextId !== context.contextId || object.fingerprint !== objectRevision) fail("R1_REVISION_MISMATCH");
  const subjectKind = input.r2SubjectKind;
  if (!["CLASSIFICATION", "SERVICE", "MEMBERSHIP", "DESCRIPTION"].includes(subjectKind)) fail("R2_SUBJECT_KIND_INVALID");
  const subjectId = explicit(input.r2SubjectId, "R2_SUBJECT_REQUIRED");
  const subjectRevision = explicit(input.r2RevisionFingerprint, "R2_REVISION_REQUIRED");
  const rows =
    subjectKind === "CLASSIFICATION"
      ? store.r5.r4.r3.r2.classifications
      : subjectKind === "SERVICE"
        ? store.r5.r4.r3.r2.services
        : subjectKind === "MEMBERSHIP"
          ? store.r5.r4.r3.r2.memberships
          : store.r5.r4.r3.r2.descriptions;
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
  const r3 = store.r5.r4.r3.records.find((row) => row.recordId === r3RecordId);
  if (!r3 || r3.fingerprint !== r3Revision || r3.objectId !== object.objectId) fail("R3_REVISION_MISMATCH");
  const r4RecordId = explicit(input.r4RecordId, "R4_RECORD_REQUIRED");
  const r4Revision = explicit(input.r4RevisionFingerprint, "R4_REVISION_REQUIRED");
  const r4 = store.r5.r4.records.find((row) => row.recordId === r4RecordId);
  if (!r4 || r4.fingerprint !== r4Revision || r4.objectId !== object.objectId) fail("R4_REVISION_MISMATCH");
  const r5RecordId = explicit(input.r5RecordId, "R5_RECORD_REQUIRED");
  const r5Revision = explicit(input.r5RevisionFingerprint, "R5_REVISION_REQUIRED");
  const r5 = store.r5.records.find((row) => row.recordId === r5RecordId);
  if (!r5 || r5.fingerprint !== r5Revision || r5.objectId !== object.objectId) fail("R5_REVISION_MISMATCH");
  const cited = currentnessOf(input.citedCurrentness);
  if (
    (cited === null || cited === "CURRENT") &&
    (context.recordStatus !== "CURRENT" ||
      object.recordStatus !== "CURRENT" ||
      subject.recordStatus !== "CURRENT" ||
      r3.recordStatus !== "CURRENT" ||
      r4.recordStatus !== "CURRENT" ||
      r5.recordStatus !== "CURRENT")
  ) {
    fail("SOURCE_NOT_CURRENT");
  }
  return {
    objectId,
    objectRevisionFingerprint: object.fingerprint,
    r2SubjectId: subjectId,
    r2RevisionFingerprint: subjectRevision,
    membershipKind: "membershipKind" in subject ? subject.membershipKind : null,
    membershipBasis: "membershipBasis" in subject ? subject.membershipBasis : null,
    r3RecordId,
    r3RevisionFingerprint: r3.fingerprint,
    r4RecordId,
    r4RevisionFingerprint: r4.fingerprint,
    r5RecordId,
    r5RevisionFingerprint: r5.fingerprint,
  };
}

function basisOf(input: D4R6Input): D4R6SourceBasis {
  if (!(D4_R6_SOURCE_BASIS_KINDS as readonly string[]).includes(input.sourceBasis)) fail("SOURCE_BASIS_REQUIRED");
  return input.sourceBasis as D4R6SourceBasis;
}

function valueOf(input: D4R6Input): { text: string | null; unit: string | null } {
  if (!input.suppliedValue || !input.suppliedValue.trim()) return { text: null, unit: null };
  const text = explicit(input.suppliedValue, "VALUE_REQUIRED");
  if (/[=*]|calc\(|sqrt\(/i.test(text)) fail("HIDDEN_CALCULATION_REJECTED");
  const numeric = /^-?\d+(\.\d+)?$/.test(text);
  if (numeric && (!input.unit || !input.unit.trim())) fail("UNITS_REQUIRED");
  return { text, unit: input.unit && input.unit.trim() ? explicit(input.unit, "UNIT_INVALID") : null };
}

function commit(store: D4R6Store, actor: Actor, input: D4R6Input, recordClass: D4R6RecordClass): D4R6Record {
  assertBoundaries(input);
  if (!(D4_R6_SUBJECT_KINDS as readonly string[]).includes(input.subjectKind)) fail("SUBJECT_KIND_INVALID");
  const r5Before = store.r5.records.map((row) => `${row.recordId}:${row.fingerprint}:${row.requirementStatement}`).join("|");
  const r4Before = store.r5.r4.records.map((row) => `${row.recordId}:${row.fingerprint}:${row.suppliedValue}`).join("|");
  const bound = requireChain(store, actor, input);
  if (PACKAGE_CLASSES.has(recordClass)) {
    if (input.r2SubjectKind !== "MEMBERSHIP" || bound.membershipKind !== "PACKAGE" || bound.membershipBasis !== "EXPLICIT") {
      fail("PACKAGE_MEMBERSHIP_REQUIRED");
    }
  }
  const basis = basisOf(input);
  const statement = explicit(input.statement, "STATEMENT_REQUIRED");
  if (/[=*]|calc\(|sqrt\(/i.test(statement)) fail("HIDDEN_CALCULATION_REJECTED");
  const componentRef = explicit(input.componentRef, "COMPONENT_REQUIRED");
  const orientationContext = explicit(input.orientationContext, "ORIENTATION_REQUIRED");
  if (BROAD.has(componentRef.toLowerCase()) || BROAD.has(orientationContext.toLowerCase())) fail("APPLICABILITY_MISMATCH");
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
  const adopted = ADOPTED_CLASSES.has(recordClass);
  const rationale = input.adoptionRationale && input.adoptionRationale.trim() ? explicit(input.adoptionRationale, "ADOPTION_RATIONALE_REQUIRED") : null;
  if (adopted && !rationale) fail("ADOPTION_RATIONALE_REQUIRED");
  if (!adopted && rationale) fail("SOURCE_NOT_ADOPTED");
  const recordId = explicit(input.recordId, "RECORD_REQUIRED");
  const fingerprint = fingerprintCanonical({
    recordId,
    objectId: bound.objectId,
    objectRevisionFingerprint: bound.objectRevisionFingerprint,
    r2RevisionFingerprint: bound.r2RevisionFingerprint,
    r3RevisionFingerprint: bound.r3RevisionFingerprint,
    r4RevisionFingerprint: bound.r4RevisionFingerprint,
    r5RevisionFingerprint: bound.r5RevisionFingerprint,
    recordClass,
    subjectKind: input.subjectKind,
    statement,
    componentRef,
    orientationContext,
    sourceBasis: basis,
    sourceRef,
    sourceRevision,
    suppliedValue: value.text,
    unit: value.unit,
    applicabilityCase,
    limitations,
    adoptionRationale: rationale,
    provenanceRef,
  });
  const existing = store.records.find((row) => row.recordId === recordId);
  if (existing) {
    if (existing.fingerprint === fingerprint) return existing;
    fail("RECORD_ALREADY_RECORDED");
  }
  let predecessor: D4R6Record | null = null;
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
      row.statement === statement &&
      row.sourceRevision === sourceRevision &&
      row.applicabilityCase === applicabilityCase,
  );
  if (duplicate) fail("DUPLICATE_RECORD_REJECTED");
  if (predecessor) {
    predecessor.recordStatus = "SUPERSEDED";
    predecessor.currentness = "SUPERSEDED";
  }
  const cited = currentnessOf(input.citedCurrentness);
  const record: D4R6Record = {
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
    r5RecordId: bound.r5RecordId,
    r5RevisionFingerprint: bound.r5RevisionFingerprint,
    recordClass,
    subjectKind: input.subjectKind,
    statement,
    componentRef,
    orientationContext,
    sourceBasis: basis,
    sourceRef,
    sourceRevision,
    suppliedValue: value.text,
    unit: value.unit,
    applicabilityObjectId,
    applicabilityCase,
    limitations,
    adoptionRationale: rationale,
    adopted,
    authoritative: adopted,
    candidate: recordClass === "CANDIDATE",
    spatialValidation: false,
    feasibilityConfirmed: false,
    clearanceVerified: false,
    routeValidated: false,
    installabilityValidated: false,
    liftingAnalysis: false,
    riggingDesign: false,
    structuralLiftingDesign: false,
    structuralVerification: false,
    layoutOptimized: false,
    clashFree: false,
    vendorAutoAdopted: false,
    engineeringValidated: false,
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
    historyId: `d4r6-history-${store.history.length + 1}`,
    recordId: record.recordId,
    fingerprint: record.fingerprint,
    recordStatus: "CURRENT",
    recordedAt: record.createdAt,
  });
  if (predecessor) {
    store.history.push({
      historyId: `d4r6-history-${store.history.length + 1}`,
      recordId: predecessor.recordId,
      fingerprint: predecessor.fingerprint,
      recordStatus: "SUPERSEDED",
      recordedAt: record.createdAt,
    });
  }
  const r5After = store.r5.records.map((row) => `${row.recordId}:${row.fingerprint}:${row.requirementStatement}`).join("|");
  const r4After = store.r5.r4.records.map((row) => `${row.recordId}:${row.fingerprint}:${row.suppliedValue}`).join("|");
  if (r5After !== r5Before || r4After !== r4Before) fail("UPSTREAM_MUTATED");
  return record;
}

export function createD4R6Store(r5: D4R5Store, now: () => string = () => "2026-10-24T00:00:00.000Z"): D4R6Store {
  return { r5, now, records: [], history: [] };
}

export function recordMechanicalMaintainabilityContext(store: D4R6Store, actor: Actor, input: D4R6Input): D4R6Record {
  return commit(store, actor, input, "MAINTAINABILITY_CONTEXT");
}

export function recordMechanicalAccessClearanceContext(store: D4R6Store, actor: Actor, input: D4R6Input): D4R6Record {
  return commit(store, actor, input, "ACCESS_CLEARANCE_CONTEXT");
}

export function recordMechanicalRemovalReplacementContext(store: D4R6Store, actor: Actor, input: D4R6Input): D4R6Record {
  return commit(store, actor, input, "REMOVAL_REPLACEMENT_CONTEXT");
}

export function recordMechanicalLiftingContext(store: D4R6Store, actor: Actor, input: D4R6Input): D4R6Record {
  return commit(store, actor, input, "LIFTING_CONTEXT");
}

export function recordMechanicalPackageContext(store: D4R6Store, actor: Actor, input: D4R6Input): D4R6Record {
  return commit(store, actor, input, "PACKAGE_CONTEXT");
}

export function recordMechanicalPackageBoundaryContext(store: D4R6Store, actor: Actor, input: D4R6Input): D4R6Record {
  return commit(store, actor, input, "PACKAGE_BOUNDARY");
}

export function recordMechanicalArrangementConstraint(store: D4R6Store, actor: Actor, input: D4R6Input): D4R6Record {
  return commit(store, actor, input, "ARRANGEMENT_CONSTRAINT");
}

export function recordMechanicalVendorMaintainabilityContext(store: D4R6Store, actor: Actor, input: D4R6Input): D4R6Record {
  if (input.sourceBasis !== "R4_VENDOR_EVIDENCE") fail("VENDOR_BASIS_REQUIRED");
  return commit(store, actor, input, "VENDOR_SUPPLIED_CONTEXT");
}

export function recordMechanicalMaintainabilityCandidate(store: D4R6Store, actor: Actor, input: D4R6Input): D4R6Record {
  return commit(store, actor, input, "CANDIDATE");
}

export function verifyClearance(): never {
  fail("CLEARANCE_VERIFICATION_REJECTED");
}

export function detectSpatialClash(): never {
  fail("SPATIAL_ANALYSIS_REJECTED");
}

export function solveAccessPath(): never {
  fail("ACCESS_PATH_SOLVER_REJECTED");
}

export function solveRemovalRoute(): never {
  fail("REMOVAL_ROUTE_SOLVER_REJECTED");
}

export function optimizeLayout(): never {
  fail("LAYOUT_OPTIMIZATION_REJECTED");
}

export function analyzeLifting(): never {
  fail("LIFTING_ANALYSIS_REJECTED");
}

export function designRigging(): never {
  fail("RIGGING_DESIGN_REJECTED");
}

export function verifyStructuralLifting(): never {
  fail("STRUCTURAL_LIFTING_REJECTED");
}

export function adoptVendorMaintenanceRequirement(): never {
  fail("VENDOR_AUTO_ADOPTION_REJECTED");
}

export function reviseRequirementFromContext(): never {
  fail("R5_REQUIREMENT_MUTATION_REJECTED");
}

export function rewriteTechnicalContext(): never {
  fail("R5_TECHNICAL_CONTEXT_MUTATION_REJECTED");
}

export function applyChangedSourceToContext(): never {
  fail("SOURCE_CHANGE_AUTO_UPDATE_REJECTED");
}

export function repointContext(): never {
  fail("SOURCE_AUTO_REPOINT_REJECTED");
}

export function mutateContext(): never {
  fail("SILENT_MUTATION_REJECTED");
}

export function sizeMechanicalEquipment(): never {
  fail("EQUIPMENT_SIZING_REJECTED");
}

export function propagateContextChange(): never {
  fail("CHANGE_PROPAGATION_REJECTED");
}

export function openDisciplineInterface(): never {
  fail("DISCIPLINE_INTERFACE_REJECTED");
}

export function validateMaintenanceEnvelope(): never {
  fail("VALIDATION_RUNTIME_REJECTED");
}

export function determineConformance(): never {
  fail("CONFORMANCE_RUNTIME_REJECTED");
}

export function approveContext(): never {
  fail("APPROVAL_RUNTIME_REJECTED");
}

export function certifyContext(): never {
  fail("CERTIFICATION_RUNTIME_REJECTED");
}

export function concludeCrossDisciplineConflict(): never {
  fail("CROSS_DISCIPLINE_REASONING_REJECTED");
}
