/**
 * EOS-D4-R2 Mechanical equipment and system context.
 * One bounded runtime on exact R1 identities. Classification and membership only.
 */
import {
  ADMIN_EQUALS_D4_MECHANICAL_ENGINEERING_AUTHORITY as ARCH_ADMIN_EQUALS,
  AI_EQUALS_D4_MECHANICAL_ENGINEERING_AUTHORITY as ARCH_AI_EQUALS,
  D4_CURRENTNESS_STATES,
  D4_EQUALS_D1_STRUCTURAL_AUTHORITY as ARCH_EQUALS_D1,
  D4_EQUALS_D2_CIVIL_AUTHORITY as ARCH_EQUALS_D2,
  D4_EQUALS_D3_GEOTECHNICAL_AUTHORITY as ARCH_EQUALS_D3,
  D4_EQUALS_D5_PIPING_AUTHORITY as ARCH_EQUALS_D5,
  D4_EQUALS_D6_PROCESS_AUTHORITY as ARCH_EQUALS_D6,
  D4_EQUALS_D7_ELECTRICAL_AUTHORITY as ARCH_EQUALS_D7,
  D4_EQUALS_D8_INSTRUMENTATION_CONTROL_AUTHORITY as ARCH_EQUALS_D8,
  D4_IMPLEMENTATION_PHASES,
  D4_MATURITY_STATES,
  D4_OTHER_MECHANICAL_CATEGORIES,
  D4_PACKAGED_EQUIPMENT_CATEGORIES,
  D4_REUSES_CANONICAL_CURRENTNESS as ARCH_REUSES_CURRENTNESS,
  D4_REUSES_CANONICAL_FINGERPRINT as ARCH_REUSES_FINGERPRINT,
  D4_ROTATING_EQUIPMENT_CATEGORIES,
  D4_STATIC_EQUIPMENT_CATEGORIES,
  PARALLEL_D4_CURRENTNESS_ENGINE_CREATED as ARCH_PARALLEL_CURRENTNESS,
  SECOND_D4_FINGERPRINT_ALGORITHM_CREATED as ARCH_SECOND_FINGERPRINT,
} from "@rtb/types";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import {
  D4_CONTEXT_AUTHORITY,
  D4_DISCIPLINE,
  D4_MECHANICAL_IDENTITY_OBJECT_FOUNDATION_RUNTIME_READY as R1_IDENTITY_READY,
  PARALLEL_D4_IDENTITY_SYSTEM_CREATED as R1_PARALLEL_IDENTITY,
  type D4R1Actor,
  type D4R1ObjectRecord,
  type D4R1Store,
} from "./identity-foundation";

export const D4_R2_STATUS = "EQUIPMENT_AND_SYSTEM_CONTEXT_IMPLEMENTED" as const;
export const D4_R2_MATURITY = "EQUIPMENT_AND_SYSTEM_CONTEXT_IMPLEMENTED" as const;
export const D4_R2_MATURITY_STATE = D4_R2_MATURITY;
export const D4_R2_CLOSEOUT_PATH =
  "docs/architecture/engineering-os/EOS_D4_R2_EQUIPMENT_AND_SYSTEM_CONTEXT_CLOSEOUT.md" as const;
export const D4_R1_IDENTITY_REUSED = R1_IDENTITY_READY;
export const EXACT_D4_R1_IDENTITY_REFERENCE_REQUIRED = true as const;
export const FLOATING_D4_R2_IDENTITY_REFERENCE_ALLOWED = false as const;
export const D4_R2_IDENTITY_REFERENCE_AUTO_REPOINTED = false as const;
export const PARALLEL_D4_IDENTITY_SYSTEM_CREATED = R1_PARALLEL_IDENTITY;
export const D4_RUNTIME_STARTED = true as const;
export const D4_RUNTIME_COUNT = 2 as const;
export const D4_EQUIPMENT_SYSTEM_CONTEXT_RUNTIME_IMPLEMENTED = true as const;
export const D4_EQUIPMENT_SYSTEM_CONTEXT_RUNTIME_COUNT = 1 as const;
export const D4_EQUIPMENT_SYSTEM_CONTEXT_RUNTIME_READY = true as const;
export const D4_MECHANICAL_IDENTITY_OBJECT_FOUNDATION_RUNTIME_READY = R1_IDENTITY_READY;
export const D4_EQUIPMENT_CLASSIFICATION_IMPLEMENTED = true as const;
export const D4_EQUIPMENT_CLASSIFICATION_ALLOWLIST_ENFORCED = true as const;
export const FREEFORM_AUTHORITATIVE_D4_EQUIPMENT_CLASSIFICATION_ALLOWED = false as const;
export const UNKNOWN_D4_EQUIPMENT_CLASSIFICATION_AUTO_ACCEPTED = false as const;
export const D4_EQUIPMENT_SERVICE_FUNCTION_CONTEXT_IMPLEMENTED = true as const;
export const SERVICE_FUNCTION_EQUALS_PROCESS_DESIGN = false as const;
export const SERVICE_FUNCTION_EQUALS_MECHANICAL_PERFORMANCE_VALIDATED = false as const;
export const D4_SYSTEM_MEMBERSHIP_IMPLEMENTED = true as const;
export const D4_PACKAGE_MEMBERSHIP_IMPLEMENTED = true as const;
export const D4_EXPLICIT_MEMBERSHIP_RELATIONSHIPS_REQUIRED = true as const;
export const D4_INFERRED_SYSTEM_MEMBERSHIP_ALLOWED = false as const;
export const D4_INFERRED_PACKAGE_MEMBERSHIP_ALLOWED = false as const;
export const D4_DESCRIPTIVE_MECHANICAL_CONTEXT_IMPLEMENTED = true as const;
export const D4_DESCRIPTIVE_CONTEXT_EQUALS_DESIGN_CONDITION = false as const;
export const D4_DESCRIPTIVE_CONTEXT_EQUALS_PERFORMANCE_DATA = false as const;
export const D4_DESCRIPTIVE_CONTEXT_EQUALS_VENDOR_DATA = false as const;
export const D4_DESCRIPTIVE_CONTEXT_EQUALS_ENGINEERING_VALIDATED = false as const;
export const D4_REUSES_CANONICAL_CURRENTNESS = ARCH_REUSES_CURRENTNESS;
export const D4_REUSES_CANONICAL_FINGERPRINT = ARCH_REUSES_FINGERPRINT;
export const PARALLEL_D4_CURRENTNESS_ENGINE_CREATED = ARCH_PARALLEL_CURRENTNESS;
export const SECOND_D4_FINGERPRINT_ALGORITHM_CREATED = ARCH_SECOND_FINGERPRINT;
export const CANONICAL_FINGERPRINT_REUSED = ARCH_REUSES_FINGERPRINT;
export const D4_R2_PROVENANCE_REQUIRED = true as const;
export const D4_R2_PROVENANCE_PRESERVED = true as const;
export const D4_R2_AUTO_REPOINTED = false as const;
export const SILENT_D4_R2_MUTATION_ALLOWED = false as const;
export const D4_R2_HISTORY_PRESERVED = true as const;
export const TENANT_WORKSPACE_PROJECT_D4_R2_SCOPE_ENFORCED = true as const;
export const D4_R2_LIFECYCLE_MATURITY_GOVERNED = true as const;
export const D4_R2_AUTOMATIC_MATURITY_PROGRESSION_ALLOWED = false as const;
export const D4_R2_DUPLICATE_GOVERNANCE_IMPLEMENTED = true as const;
export const D4_R2_REPLAY_PROTECTION_IMPLEMENTED = true as const;
export const D4_R2_SPOOFING_PROTECTION_IMPLEMENTED = true as const;
export const AI_EQUALS_D4_MECHANICAL_ENGINEERING_AUTHORITY = ARCH_AI_EQUALS;
export const ADMIN_EQUALS_D4_MECHANICAL_ENGINEERING_AUTHORITY = ARCH_ADMIN_EQUALS;
export const D4_EQUALS_D1_STRUCTURAL_AUTHORITY = ARCH_EQUALS_D1;
export const D4_EQUALS_D2_CIVIL_AUTHORITY = ARCH_EQUALS_D2;
export const D4_EQUALS_D3_GEOTECHNICAL_AUTHORITY = ARCH_EQUALS_D3;
export const D4_EQUALS_D5_PIPING_AUTHORITY = ARCH_EQUALS_D5;
export const D4_EQUALS_D6_PROCESS_AUTHORITY = ARCH_EQUALS_D6;
export const D4_EQUALS_D7_ELECTRICAL_AUTHORITY = ARCH_EQUALS_D7;
export const D4_EQUALS_D8_INSTRUMENTATION_CONTROL_AUTHORITY = ARCH_EQUALS_D8;

export const D4_R2_EQUIPMENT_CLASSIFICATIONS = [
  ...D4_ROTATING_EQUIPMENT_CATEGORIES,
  ...D4_STATIC_EQUIPMENT_CATEGORIES,
  ...D4_PACKAGED_EQUIPMENT_CATEGORIES,
  ...D4_OTHER_MECHANICAL_CATEGORIES,
] as const;
export const D4_R2_SERVICE_FUNCTIONS = [
  "PUMPING",
  "COMPRESSION",
  "VENTILATION",
  "HEAT_TRANSFER",
  "STORAGE",
  "SEPARATION",
  "LIFTING",
  "MATERIAL_HANDLING",
  "PACKAGED_UTILITY_FUNCTION",
  "OTHER_MECHANICAL_FUNCTION",
] as const;
export const D4_R2_EQUIPMENT_ROLES = [
  "PRIMARY_SERVICE",
  "STANDBY",
  "UTILITY",
  "HVAC_SERVICE",
  "HANDLING",
  "PACKAGED_ASSEMBLY",
  "OTHER_DESCRIPTIVE_ROLE",
] as const;
export const D4_R2_ORIENTATION_CATEGORIES = ["HORIZONTAL", "VERTICAL", "INCLINED", "NOT_STATED"] as const;
export const D4_R2_MEMBERSHIP_KINDS = ["SYSTEM", "PACKAGE", "COMPONENT_OF"] as const;

export const D4_DESIGN_CONDITION_PERFORMANCE_RUNTIME_READY = false as const;
export const D4_VENDOR_DATA_EVIDENCE_RUNTIME_READY = false as const;
export const D4_MECHANICAL_TECHNICAL_CONTEXT_RUNTIME_READY = false as const;
export const D4_MAINTAINABILITY_ACCESS_PACKAGE_RUNTIME_READY = false as const;
export const D4_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY = false as const;
export const D4_DISCIPLINE_INTERFACE_RUNTIME_READY = false as const;
export const D4_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_READY = false as const;
export const D4_CURRENTNESS_DIGITAL_THREAD_RUNTIME_READY = false as const;
export const D4_D9_SOURCE_CONTRACT_RUNTIME_READY = false as const;

export const D4_DESIGN_CONDITION_RUNTIME_COUNT = 0 as const;
export const D4_PERFORMANCE_CONTEXT_RUNTIME_COUNT = 0 as const;
export const D4_VENDOR_DATA_RUNTIME_COUNT = 0 as const;
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
export const D4_APPROVAL_RUNTIME_COUNT = 0 as const;
export const D4_CERTIFICATION_RUNTIME_COUNT = 0 as const;
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
export const UNAUTHORIZED_D1_PACK_COMPLETION = false as const;
export const UNAUTHORIZED_D2_REOPEN = false as const;
export const UNAUTHORIZED_D3_REOPEN = false as const;
export const UNAUTHORIZED_D4_R3_R12_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_D5_D8_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_D9_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_MECHANICAL_CALCULATION_PROMOTION = false as const;
export const UNAUTHORIZED_MECHANICAL_VALIDATION_PROMOTION = false as const;
export const UNAUTHORIZED_MECHANICAL_APPROVAL_PROMOTION = false as const;
export const UNAUTHORIZED_MECHANICAL_CERTIFICATION_PROMOTION = false as const;
export const UNAUTHORIZED_CROSS_DISCIPLINE_REASONING_PROMOTION = false as const;
export const UNAUTHORIZED_GA_PROMOTION = false as const;
export const UNAUTHORIZED_PRODUCT_CLAIM = false as const;

export const D4_R3_CANONICAL_PHASE = D4_IMPLEMENTATION_PHASES[2];
export const D4_R3_PHASE_TYPE = "DESIGN_CONDITIONS_AND_PERFORMANCE_CONTEXT" as const;
export const D4_R3_CANONICAL_SCOPE =
  "Implement governed Mechanical design-condition and performance context using exact R1-R2 identities/context and governed source basis. Preserve the distinction between source requirements, Process conditions, Mechanical design conditions, performance data and validated engineering. Do not perform equipment sizing, vendor-data ingestion, Mechanical calculations, discipline interfaces, review/validation or D5-D9 runtime." as const;
export const D4_R3_STARTED = false as const;
export const D4_R2_READY_FOR_NEXT_PHASE = true as const;
export const D4_R2_NEXT_PHASE = D4_R3_CANONICAL_PHASE;
export const D4_R2_NEXT_PHASE_TYPE = D4_R3_PHASE_TYPE;
export const D4_R2_CANONICAL_NEXT_PHASE = D4_R3_CANONICAL_PHASE;
export const D4_R2_CANONICAL_NEXT_PHASE_SCOPE = D4_R3_CANONICAL_SCOPE;
export const D4_R2_BLOCKER = "NONE" as const;
export const D4_R2_MACHINE_READABLE_ROADMAP_UPDATED = true as const;

const FLOATING = new Set(["latest", "current", "newest", "head", "active", "active model"]);
const INFERRED = new Set(["inferred", "unknown", "auto", "default", "nearby", "same_tag", "same_document", "spatially_close", "semantic", "commonly_associated", "ai_similarity"]);
const EQUIPMENT_TYPES = ["MECHANICAL_EQUIPMENT", "ROTATING_EQUIPMENT", "STATIC_EQUIPMENT", "MECHANICAL_PACKAGE", "MECHANICAL_COMPONENT_CONTEXT"] as const;
const SERVICE_TYPES = ["MECHANICAL_SYSTEM_CONTEXT", ...EQUIPMENT_TYPES] as const;
const CLASSIFICATION_FOR_TYPE: Record<string, readonly string[]> = {
  ROTATING_EQUIPMENT: D4_ROTATING_EQUIPMENT_CATEGORIES,
  STATIC_EQUIPMENT: D4_STATIC_EQUIPMENT_CATEGORIES,
  MECHANICAL_PACKAGE: D4_PACKAGED_EQUIPMENT_CATEGORIES,
  MECHANICAL_EQUIPMENT: D4_R2_EQUIPMENT_CLASSIFICATIONS,
  MECHANICAL_COMPONENT_CONTEXT: [...D4_ROTATING_EQUIPMENT_CATEGORIES, ...D4_STATIC_EQUIPMENT_CATEGORIES, ...D4_OTHER_MECHANICAL_CATEGORIES],
};

type Prohibited = {
  designCondition?: boolean;
  performanceData?: boolean;
  vendorData?: boolean;
  designPressure?: unknown;
  designTemperature?: unknown;
  operatingPressure?: unknown;
  operatingTemperature?: unknown;
  flow?: unknown;
  capacity?: unknown;
  head?: unknown;
  speed?: unknown;
  power?: unknown;
  torque?: unknown;
  efficiency?: unknown;
  equipmentDuty?: unknown;
  allowableLoad?: unknown;
  vibrationLimit?: unknown;
  noiseLimit?: unknown;
  thermalDuty?: unknown;
  vendorCurve?: unknown;
  certifiedWeight?: unknown;
  centerOfGravity?: unknown;
  nozzleData?: unknown;
  equipmentSizing?: boolean;
  rotatingCalculation?: boolean;
  staticCalculation?: boolean;
  thermalMechanicalCalculation?: boolean;
  mechanicalLoadCalculation?: boolean;
  vibrationAnalysis?: boolean;
  fatigueAnalysis?: boolean;
  designOptimization?: boolean;
  mechanicalRequirement?: boolean;
  maintainability?: boolean;
  disciplineInterface?: boolean;
  reviewValidation?: boolean;
  engineeringValidated?: boolean;
  approval?: boolean;
  certification?: boolean;
  processDesignBasis?: boolean;
  pipingDesign?: boolean;
  electricalDesign?: boolean;
  controlPhilosophy?: boolean;
  structuralDesign?: boolean;
  civilDesign?: boolean;
  geotechnicalDesign?: boolean;
  d9Reasoning?: boolean;
  inferredMembership?: boolean;
  repoint?: boolean;
  advanceMaturity?: boolean;
};

type BoundInput = Prohibited & {
  contextId: string;
  objectId: string;
  objectRevisionFingerprint: string;
  citedLifecycleStage: string;
  provenanceRef: string;
  citedCurrentness: string;
  assertedFingerprint?: string;
  tenantId?: string;
  workspaceId?: string;
  projectId?: string;
};

export type D4R2ClassificationInput = BoundInput & {
  classificationId: string;
  classification: string;
  predecessorClassificationId?: string | null;
};

export type D4R2ClassificationRecord = {
  classificationId: string;
  contextId: string;
  objectId: string;
  objectType: D4R1ObjectRecord["objectType"];
  objectRevisionFingerprint: string;
  classification: (typeof D4_R2_EQUIPMENT_CLASSIFICATIONS)[number];
  tenantId: string;
  workspaceId: string;
  projectId: string;
  discipline: typeof D4_DISCIPLINE;
  citedLifecycleStage: (typeof D4_MATURITY_STATES)[number];
  provenanceRef: string;
  citedCurrentness: (typeof D4_CURRENTNESS_STATES)[number];
  authority: typeof D4_CONTEXT_AUTHORITY;
  mechanicalEngineeringAuthority: false;
  engineeringValidated: false;
  designAdequacyEstablished: false;
  fingerprint: string;
  recordedBy: string;
  recordedAt: string;
  recordStatus: "CURRENT" | "SUPERSEDED";
  predecessorClassificationId: string | null;
};

export type D4R2ServiceInput = BoundInput & {
  serviceContextId: string;
  serviceFunction: string;
  predecessorServiceContextId?: string | null;
};

export type D4R2ServiceRecord = {
  serviceContextId: string;
  contextId: string;
  objectId: string;
  objectType: D4R1ObjectRecord["objectType"];
  objectRevisionFingerprint: string;
  serviceFunction: (typeof D4_R2_SERVICE_FUNCTIONS)[number];
  tenantId: string;
  workspaceId: string;
  projectId: string;
  discipline: typeof D4_DISCIPLINE;
  citedLifecycleStage: (typeof D4_MATURITY_STATES)[number];
  provenanceRef: string;
  citedCurrentness: (typeof D4_CURRENTNESS_STATES)[number];
  authority: typeof D4_CONTEXT_AUTHORITY;
  mechanicalEngineeringAuthority: false;
  engineeringValidated: false;
  processDesign: false;
  performanceValidated: false;
  fingerprint: string;
  recordedBy: string;
  recordedAt: string;
  recordStatus: "CURRENT" | "SUPERSEDED";
  predecessorServiceContextId: string | null;
};

export type D4R2MembershipInput = BoundInput & {
  membershipId: string;
  containerObjectId: string;
  containerRevisionFingerprint: string;
  membershipBasis?: string;
  predecessorMembershipId?: string | null;
};

export type D4R2MembershipRecord = {
  membershipId: string;
  membershipKind: (typeof D4_R2_MEMBERSHIP_KINDS)[number];
  contextId: string;
  objectId: string;
  objectType: D4R1ObjectRecord["objectType"];
  objectRevisionFingerprint: string;
  containerObjectId: string;
  containerObjectType: D4R1ObjectRecord["objectType"];
  containerRevisionFingerprint: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  discipline: typeof D4_DISCIPLINE;
  citedLifecycleStage: (typeof D4_MATURITY_STATES)[number];
  provenanceRef: string;
  citedCurrentness: (typeof D4_CURRENTNESS_STATES)[number];
  authority: typeof D4_CONTEXT_AUTHORITY;
  mechanicalEngineeringAuthority: false;
  membershipBasis: "EXPLICIT";
  fingerprint: string;
  recordedBy: string;
  recordedAt: string;
  recordStatus: "CURRENT" | "SUPERSEDED";
  predecessorMembershipId: string | null;
};

export type D4R2DescriptionInput = BoundInput & {
  descriptionId: string;
  description: string;
  equipmentRole: string;
  orientationCategory: string;
  operatingContextDescription?: string | null;
  predecessorDescriptionId?: string | null;
};

export type D4R2DescriptionRecord = {
  descriptionId: string;
  contextId: string;
  objectId: string;
  objectType: D4R1ObjectRecord["objectType"];
  objectRevisionFingerprint: string;
  description: string;
  equipmentRole: (typeof D4_R2_EQUIPMENT_ROLES)[number];
  orientationCategory: (typeof D4_R2_ORIENTATION_CATEGORIES)[number];
  operatingContextDescription: string | null;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  discipline: typeof D4_DISCIPLINE;
  citedLifecycleStage: (typeof D4_MATURITY_STATES)[number];
  provenanceRef: string;
  citedCurrentness: (typeof D4_CURRENTNESS_STATES)[number];
  authority: typeof D4_CONTEXT_AUTHORITY;
  mechanicalEngineeringAuthority: false;
  engineeringValidated: false;
  designConditionAuthority: false;
  performanceAuthority: false;
  vendorDataAuthority: false;
  fingerprint: string;
  recordedBy: string;
  recordedAt: string;
  recordStatus: "CURRENT" | "SUPERSEDED";
  predecessorDescriptionId: string | null;
};

export type D4R2History = {
  historyId: string;
  subjectKind: "CLASSIFICATION" | "SERVICE" | "MEMBERSHIP" | "DESCRIPTION";
  subjectId: string;
  action: "CREATED" | "SUPERSEDED";
  fingerprint: string;
  recordedAt: string;
};

export type D4R2Store = {
  r1: D4R1Store;
  now: () => string;
  classifications: D4R2ClassificationRecord[];
  services: D4R2ServiceRecord[];
  memberships: D4R2MembershipRecord[];
  descriptions: D4R2DescriptionRecord[];
  history: D4R2History[];
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

function isStage(value: string): value is (typeof D4_MATURITY_STATES)[number] {
  return (D4_MATURITY_STATES as readonly string[]).includes(value);
}

function isCurrentness(value: string): value is (typeof D4_CURRENTNESS_STATES)[number] {
  return (D4_CURRENTNESS_STATES as readonly string[]).includes(value);
}

function currentnessOf(value: string): (typeof D4_CURRENTNESS_STATES)[number] {
  const token = value.trim();
  if (!isCurrentness(token)) fail("CURRENTNESS_INVALID");
  return token;
}

function assertActor(actor: D4R1Actor): void {
  if (!actor.actorId.trim() || !actor.tenantId.trim() || !actor.workspaceId.trim() || !actor.projectId.trim()) fail("SCOPE_REQUIRED");
  if (blockedParty(actor.actorId) || blockedParty(actor.authority)) fail("AI_NOT_MECHANICAL_AUTHORITY");
  if (actor.authority === "ADMINISTRATOR" || actor.authority === "ADMIN") fail("ADMIN_NOT_MECHANICAL_AUTHORITY");
  if (actor.authority === "MECHANICAL_ENGINEERING_AUTHORITY") fail("RECORDER_NOT_MECHANICAL_ENGINEERING_AUTHORITY");
  if (actor.authority !== D4_CONTEXT_AUTHORITY) fail("UNAUTHORIZED");
}

function assertScope(actor: D4R1Actor, input: { tenantId?: string; workspaceId?: string; projectId?: string }): void {
  if (input.tenantId != null && input.tenantId !== actor.tenantId) fail("CROSS_TENANT_OPERATION");
  if (input.workspaceId != null && input.workspaceId !== actor.workspaceId) fail("CROSS_WORKSPACE_OPERATION");
  if (input.projectId != null && input.projectId !== actor.projectId) fail("CROSS_PROJECT_OPERATION");
}

function assertProhibited(input: Prohibited): void {
  if (input.designCondition === true || input.designPressure != null || input.designTemperature != null || input.operatingPressure != null || input.operatingTemperature != null || input.allowableLoad != null || input.thermalDuty != null) fail("DESIGN_CONDITION_NOT_IN_R2");
  if (input.performanceData === true || input.flow != null || input.capacity != null || input.head != null || input.speed != null || input.power != null || input.torque != null || input.efficiency != null || input.equipmentDuty != null || input.vibrationLimit != null || input.noiseLimit != null) fail("PERFORMANCE_CONTEXT_NOT_IN_R2");
  if (input.vendorData === true || input.vendorCurve != null || input.certifiedWeight != null || input.centerOfGravity != null || input.nozzleData != null) fail("VENDOR_DATA_NOT_IN_R2");
  if (input.equipmentSizing === true) fail("EQUIPMENT_SIZING_NOT_IN_R2");
  if (input.rotatingCalculation === true) fail("ROTATING_CALCULATION_NOT_IN_R2");
  if (input.staticCalculation === true) fail("STATIC_CALCULATION_NOT_IN_R2");
  if (input.thermalMechanicalCalculation === true) fail("THERMAL_MECHANICAL_CALCULATION_NOT_IN_R2");
  if (input.mechanicalLoadCalculation === true) fail("MECHANICAL_LOAD_CALCULATION_NOT_IN_R2");
  if (input.vibrationAnalysis === true) fail("VIBRATION_ANALYSIS_NOT_IN_R2");
  if (input.fatigueAnalysis === true) fail("FATIGUE_ANALYSIS_NOT_IN_R2");
  if (input.designOptimization === true) fail("DESIGN_OPTIMIZATION_NOT_IN_R2");
  if (input.mechanicalRequirement === true) fail("MECHANICAL_REQUIREMENT_NOT_IN_R2");
  if (input.maintainability === true) fail("MAINTAINABILITY_NOT_IN_R2");
  if (input.disciplineInterface === true) fail("DISCIPLINE_INTERFACE_NOT_IN_R2");
  if (input.reviewValidation === true || input.engineeringValidated === true) fail("VALIDATION_NOT_IN_R2");
  if (input.approval === true) fail("APPROVAL_NOT_IN_R2");
  if (input.certification === true) fail("CERTIFICATION_NOT_IN_R2");
  if (input.processDesignBasis === true) fail("PROCESS_DESIGN_NOT_IN_R2");
  if (input.pipingDesign === true) fail("PIPING_DESIGN_NOT_IN_R2");
  if (input.electricalDesign === true) fail("ELECTRICAL_DESIGN_NOT_IN_R2");
  if (input.controlPhilosophy === true) fail("CONTROL_PHILOSOPHY_NOT_IN_R2");
  if (input.structuralDesign === true) fail("STRUCTURAL_DESIGN_NOT_IN_R2");
  if (input.civilDesign === true) fail("CIVIL_DESIGN_NOT_IN_R2");
  if (input.geotechnicalDesign === true) fail("GEOTECHNICAL_DESIGN_NOT_IN_R2");
  if (input.d9Reasoning === true) fail("D9_NOT_IN_R2");
  if (input.inferredMembership === true) fail("INFERRED_MEMBERSHIP_REJECTED");
  if (input.repoint === true) fail("AUTO_REPOINT_REJECTED");
  if (input.advanceMaturity === true) fail("MATURITY_PROGRESSION_NOT_IN_R2");
}

function remember(store: D4R2Store, subjectKind: D4R2History["subjectKind"], subjectId: string, action: D4R2History["action"], fingerprint: string): void {
  store.history.push({
    historyId: `hist-${store.history.length + 1}`,
    subjectKind,
    subjectId,
    action,
    fingerprint,
    recordedAt: store.now(),
  });
}

function requireContext(store: D4R2Store, actor: D4R1Actor, contextId: string, citedCurrentness: (typeof D4_CURRENTNESS_STATES)[number]) {
  const id = explicit(contextId, "R1_CONTEXT_REQUIRED");
  const context = store.r1.contexts.find((row) => row.contextId === id);
  if (!context) fail("R1_CONTEXT_NOT_FOUND");
  if (context.tenantId !== actor.tenantId) fail("CROSS_TENANT_OPERATION");
  if (context.workspaceId !== actor.workspaceId) fail("CROSS_WORKSPACE_OPERATION");
  if (context.projectId !== actor.projectId) fail("CROSS_PROJECT_OPERATION");
  if (context.discipline !== D4_DISCIPLINE) fail("DISCIPLINE_NOT_MECHANICAL");
  if (citedCurrentness === "CURRENT" && context.recordStatus !== "CURRENT") fail("R1_CONTEXT_NOT_CURRENT");
  return context;
}

function requireObject(store: D4R2Store, actor: D4R1Actor, contextId: string, objectId: string, revisionFingerprint: string, allowed: readonly string[], citedCurrentness: (typeof D4_CURRENTNESS_STATES)[number]) {
  const id = explicit(objectId, "R1_OBJECT_REQUIRED");
  const revision = explicit(revisionFingerprint, "R1_REVISION_REQUIRED");
  const object = store.r1.objects.find((row) => row.objectId === id);
  if (!object) fail("R1_OBJECT_NOT_FOUND");
  if (object.fingerprint !== revision) fail("R1_REVISION_MISMATCH");
  if (!allowed.includes(object.objectType)) fail("R1_OBJECT_TYPE_MISMATCH");
  if (object.contextId !== contextId) fail("R1_CONTEXT_MISMATCH");
  if (object.tenantId !== actor.tenantId) fail("CROSS_TENANT_OPERATION");
  if (object.workspaceId !== actor.workspaceId) fail("CROSS_WORKSPACE_OPERATION");
  if (object.projectId !== actor.projectId) fail("CROSS_PROJECT_OPERATION");
  if (citedCurrentness === "CURRENT" && object.recordStatus !== "CURRENT") fail("R1_OBJECT_NOT_CURRENT");
  return object;
}

function sameLineage(store: D4R2Store, object: D4R1ObjectRecord, priorObjectId: string): boolean {
  let cursor: D4R1ObjectRecord | undefined = object;
  const seen = new Set<string>();
  while (cursor && !seen.has(cursor.objectId)) {
    if (cursor.objectId === priorObjectId) return true;
    seen.add(cursor.objectId);
    const predecessorId: string | null = cursor.predecessorObjectId;
    cursor = predecessorId ? store.r1.objects.find((row) => row.objectId === predecessorId) : undefined;
  }
  return false;
}

function stageOf(value: string): (typeof D4_MATURITY_STATES)[number] {
  const stage = value.trim();
  if (!isStage(stage)) fail("MATURITY_STAGE_INVALID");
  return stage;
}

function provenanceOf(value: string): string {
  const provenance = explicit(value, "MISSING_PROVENANCE");
  if (blockedParty(provenance)) fail("MISSING_PROVENANCE");
  return provenance;
}

export function createD4R2Store(r1: D4R1Store, now: () => string = () => "2026-10-24T00:00:00.000Z"): D4R2Store {
  return { r1, now, classifications: [], services: [], memberships: [], descriptions: [], history: [] };
}

export function recordMechanicalEquipmentClassification(store: D4R2Store, actor: D4R1Actor, input: D4R2ClassificationInput): D4R2ClassificationRecord {
  assertActor(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const citedCurrentness = currentnessOf(input.citedCurrentness);
  const context = requireContext(store, actor, input.contextId, citedCurrentness);
  const object = requireObject(store, actor, context.contextId, input.objectId, input.objectRevisionFingerprint, EQUIPMENT_TYPES, citedCurrentness);
  const classificationId = explicit(input.classificationId, "CLASSIFICATION_REQUIRED");
  const classification = explicit(input.classification, "CLASSIFICATION_REQUIRED");
  if (!(D4_R2_EQUIPMENT_CLASSIFICATIONS as readonly string[]).includes(classification)) fail("CLASSIFICATION_NOT_ALLOWLISTED");
  const allowed = CLASSIFICATION_FOR_TYPE[object.objectType] ?? [];
  if (!allowed.includes(classification)) fail("CLASSIFICATION_TYPE_MISMATCH");
  const stage = stageOf(input.citedLifecycleStage);
  const provenanceRef = provenanceOf(input.provenanceRef);
  const predecessor = input.predecessorClassificationId ? store.classifications.find((row) => row.classificationId === input.predecessorClassificationId) : null;
  if (input.predecessorClassificationId) {
    if (!predecessor) fail("CLASSIFICATION_NOT_FOUND");
    if (predecessor.tenantId !== actor.tenantId || !sameLineage(store, object, predecessor.objectId)) fail("R1_CONTEXT_MISMATCH");
    if (predecessor.recordStatus !== "CURRENT") fail("PREDECESSOR_NOT_CURRENT");
  }
  const fingerprint = fingerprintCanonical({
    classificationId,
    contextId: context.contextId,
    objectId: object.objectId,
    objectRevisionFingerprint: object.fingerprint,
    classification,
    citedLifecycleStage: stage,
    provenanceRef,
    citedCurrentness,
    authority: D4_CONTEXT_AUTHORITY,
    predecessorClassificationId: predecessor?.classificationId ?? null,
  });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.classifications.find((row) => row.classificationId === classificationId);
  if (existing) {
    if (existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId) return existing;
    fail("CLASSIFICATION_ALREADY_RECORDED");
  }
  const duplicate = store.classifications.find((row) => row.recordStatus === "CURRENT" && row.classificationId !== predecessor?.classificationId && row.objectId === object.objectId && row.objectRevisionFingerprint === object.fingerprint && row.classification === classification);
  if (duplicate) fail("DUPLICATE_CLASSIFICATION_REJECTED");
  const record: D4R2ClassificationRecord = Object.freeze({
    classificationId,
    contextId: context.contextId,
    objectId: object.objectId,
    objectType: object.objectType,
    objectRevisionFingerprint: object.fingerprint,
    classification: classification as D4R2ClassificationRecord["classification"],
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
    discipline: D4_DISCIPLINE,
    citedLifecycleStage: stage,
    provenanceRef,
    citedCurrentness,
    authority: D4_CONTEXT_AUTHORITY,
    mechanicalEngineeringAuthority: false,
    engineeringValidated: false,
    designAdequacyEstablished: false,
    fingerprint,
    recordedBy: actor.actorId,
    recordedAt: store.now(),
    recordStatus: "CURRENT",
    predecessorClassificationId: predecessor?.classificationId ?? null,
  });
  if (predecessor) {
    const index = store.classifications.findIndex((row) => row.classificationId === predecessor.classificationId);
    const superseded = Object.freeze({ ...predecessor, recordStatus: "SUPERSEDED" as const });
    store.classifications[index] = superseded;
    remember(store, "CLASSIFICATION", superseded.classificationId, "SUPERSEDED", superseded.fingerprint);
  }
  store.classifications.push(record);
  remember(store, "CLASSIFICATION", record.classificationId, "CREATED", record.fingerprint);
  return record;
}

export function recordMechanicalServiceFunction(store: D4R2Store, actor: D4R1Actor, input: D4R2ServiceInput): D4R2ServiceRecord {
  assertActor(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const citedCurrentness = currentnessOf(input.citedCurrentness);
  const context = requireContext(store, actor, input.contextId, citedCurrentness);
  const object = requireObject(store, actor, context.contextId, input.objectId, input.objectRevisionFingerprint, SERVICE_TYPES, citedCurrentness);
  const serviceContextId = explicit(input.serviceContextId, "SERVICE_CONTEXT_REQUIRED");
  const serviceFunction = explicit(input.serviceFunction, "SERVICE_FUNCTION_REQUIRED");
  if (!(D4_R2_SERVICE_FUNCTIONS as readonly string[]).includes(serviceFunction)) fail("SERVICE_FUNCTION_NOT_ALLOWLISTED");
  const stage = stageOf(input.citedLifecycleStage);
  const provenanceRef = provenanceOf(input.provenanceRef);
  const predecessor = input.predecessorServiceContextId ? store.services.find((row) => row.serviceContextId === input.predecessorServiceContextId) : null;
  if (input.predecessorServiceContextId) {
    if (!predecessor) fail("SERVICE_CONTEXT_NOT_FOUND");
    if (predecessor.tenantId !== actor.tenantId || !sameLineage(store, object, predecessor.objectId)) fail("R1_CONTEXT_MISMATCH");
    if (predecessor.recordStatus !== "CURRENT") fail("PREDECESSOR_NOT_CURRENT");
  }
  const fingerprint = fingerprintCanonical({
    serviceContextId,
    contextId: context.contextId,
    objectId: object.objectId,
    objectRevisionFingerprint: object.fingerprint,
    serviceFunction,
    citedLifecycleStage: stage,
    provenanceRef,
    citedCurrentness,
    authority: D4_CONTEXT_AUTHORITY,
    predecessorServiceContextId: predecessor?.serviceContextId ?? null,
  });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.services.find((row) => row.serviceContextId === serviceContextId);
  if (existing) {
    if (existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId) return existing;
    fail("SERVICE_ALREADY_RECORDED");
  }
  const duplicate = store.services.find((row) => row.recordStatus === "CURRENT" && row.serviceContextId !== predecessor?.serviceContextId && row.objectId === object.objectId && row.objectRevisionFingerprint === object.fingerprint && row.serviceFunction === serviceFunction);
  if (duplicate) fail("DUPLICATE_SERVICE_REJECTED");
  const record: D4R2ServiceRecord = Object.freeze({
    serviceContextId,
    contextId: context.contextId,
    objectId: object.objectId,
    objectType: object.objectType,
    objectRevisionFingerprint: object.fingerprint,
    serviceFunction: serviceFunction as D4R2ServiceRecord["serviceFunction"],
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
    discipline: D4_DISCIPLINE,
    citedLifecycleStage: stage,
    provenanceRef,
    citedCurrentness,
    authority: D4_CONTEXT_AUTHORITY,
    mechanicalEngineeringAuthority: false,
    engineeringValidated: false,
    processDesign: false,
    performanceValidated: false,
    fingerprint,
    recordedBy: actor.actorId,
    recordedAt: store.now(),
    recordStatus: "CURRENT",
    predecessorServiceContextId: predecessor?.serviceContextId ?? null,
  });
  if (predecessor) {
    const index = store.services.findIndex((row) => row.serviceContextId === predecessor.serviceContextId);
    const superseded = Object.freeze({ ...predecessor, recordStatus: "SUPERSEDED" as const });
    store.services[index] = superseded;
    remember(store, "SERVICE", superseded.serviceContextId, "SUPERSEDED", superseded.fingerprint);
  }
  store.services.push(record);
  remember(store, "SERVICE", record.serviceContextId, "CREATED", record.fingerprint);
  return record;
}

function recordMembership(store: D4R2Store, actor: D4R1Actor, input: D4R2MembershipInput, kind: D4R2MembershipRecord["membershipKind"]): D4R2MembershipRecord {
  assertActor(actor);
  assertProhibited(input);
  assertScope(actor, input);
  if (input.membershipBasis != null && input.membershipBasis !== "EXPLICIT") fail("INFERRED_MEMBERSHIP_REJECTED");
  const citedCurrentness = currentnessOf(input.citedCurrentness);
  const context = requireContext(store, actor, input.contextId, citedCurrentness);
  const memberAllowed = kind === "COMPONENT_OF" ? ["MECHANICAL_COMPONENT_CONTEXT"] : EQUIPMENT_TYPES;
  const containerAllowed = kind === "SYSTEM" ? ["MECHANICAL_SYSTEM_CONTEXT"] : kind === "PACKAGE" ? ["MECHANICAL_PACKAGE"] : ["MECHANICAL_EQUIPMENT", "ROTATING_EQUIPMENT", "STATIC_EQUIPMENT", "MECHANICAL_PACKAGE"];
  const object = requireObject(store, actor, context.contextId, input.objectId, input.objectRevisionFingerprint, memberAllowed, citedCurrentness);
  const container = requireObject(store, actor, context.contextId, input.containerObjectId, input.containerRevisionFingerprint, containerAllowed, citedCurrentness);
  if (container.objectId === object.objectId) fail("MEMBERSHIP_SELF_REJECTED");
  const membershipId = explicit(input.membershipId, "MEMBERSHIP_REQUIRED");
  const stage = stageOf(input.citedLifecycleStage);
  const provenanceRef = provenanceOf(input.provenanceRef);
  const predecessor = input.predecessorMembershipId ? store.memberships.find((row) => row.membershipId === input.predecessorMembershipId) : null;
  if (input.predecessorMembershipId) {
    if (!predecessor) fail("MEMBERSHIP_NOT_FOUND");
    if (predecessor.tenantId !== actor.tenantId || predecessor.membershipKind !== kind || !sameLineage(store, object, predecessor.objectId)) fail("R1_CONTEXT_MISMATCH");
    if (predecessor.recordStatus !== "CURRENT") fail("PREDECESSOR_NOT_CURRENT");
  }
  const fingerprint = fingerprintCanonical({
    membershipId,
    membershipKind: kind,
    contextId: context.contextId,
    objectId: object.objectId,
    objectRevisionFingerprint: object.fingerprint,
    containerObjectId: container.objectId,
    containerRevisionFingerprint: container.fingerprint,
    citedLifecycleStage: stage,
    provenanceRef,
    citedCurrentness,
    authority: D4_CONTEXT_AUTHORITY,
    predecessorMembershipId: predecessor?.membershipId ?? null,
  });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.memberships.find((row) => row.membershipId === membershipId);
  if (existing) {
    if (existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId) return existing;
    fail("MEMBERSHIP_ALREADY_RECORDED");
  }
  const duplicate = store.memberships.find((row) => row.recordStatus === "CURRENT" && row.membershipId !== predecessor?.membershipId && row.membershipKind === kind && row.objectId === object.objectId && row.containerObjectId === container.objectId && row.objectRevisionFingerprint === object.fingerprint && row.containerRevisionFingerprint === container.fingerprint);
  if (duplicate) fail("DUPLICATE_MEMBERSHIP_REJECTED");
  const record: D4R2MembershipRecord = Object.freeze({
    membershipId,
    membershipKind: kind,
    contextId: context.contextId,
    objectId: object.objectId,
    objectType: object.objectType,
    objectRevisionFingerprint: object.fingerprint,
    containerObjectId: container.objectId,
    containerObjectType: container.objectType,
    containerRevisionFingerprint: container.fingerprint,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
    discipline: D4_DISCIPLINE,
    citedLifecycleStage: stage,
    provenanceRef,
    citedCurrentness,
    authority: D4_CONTEXT_AUTHORITY,
    mechanicalEngineeringAuthority: false,
    membershipBasis: "EXPLICIT",
    fingerprint,
    recordedBy: actor.actorId,
    recordedAt: store.now(),
    recordStatus: "CURRENT",
    predecessorMembershipId: predecessor?.membershipId ?? null,
  });
  if (predecessor) {
    const index = store.memberships.findIndex((row) => row.membershipId === predecessor.membershipId);
    const superseded = Object.freeze({ ...predecessor, recordStatus: "SUPERSEDED" as const });
    store.memberships[index] = superseded;
    remember(store, "MEMBERSHIP", superseded.membershipId, "SUPERSEDED", superseded.fingerprint);
  }
  store.memberships.push(record);
  remember(store, "MEMBERSHIP", record.membershipId, "CREATED", record.fingerprint);
  return record;
}

export function recordMechanicalSystemMembership(store: D4R2Store, actor: D4R1Actor, input: D4R2MembershipInput): D4R2MembershipRecord {
  return recordMembership(store, actor, input, "SYSTEM");
}

export function recordMechanicalPackageMembership(store: D4R2Store, actor: D4R1Actor, input: D4R2MembershipInput): D4R2MembershipRecord {
  return recordMembership(store, actor, input, "PACKAGE");
}

export function recordMechanicalComponentMembership(store: D4R2Store, actor: D4R1Actor, input: D4R2MembershipInput): D4R2MembershipRecord {
  return recordMembership(store, actor, input, "COMPONENT_OF");
}

export function recordMechanicalDescriptiveContext(store: D4R2Store, actor: D4R1Actor, input: D4R2DescriptionInput): D4R2DescriptionRecord {
  assertActor(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const citedCurrentness = currentnessOf(input.citedCurrentness);
  const context = requireContext(store, actor, input.contextId, citedCurrentness);
  const object = requireObject(store, actor, context.contextId, input.objectId, input.objectRevisionFingerprint, SERVICE_TYPES, citedCurrentness);
  const descriptionId = explicit(input.descriptionId, "DESCRIPTION_REQUIRED");
  const description = explicit(input.description, "DESCRIPTION_REQUIRED");
  const equipmentRole = explicit(input.equipmentRole, "EQUIPMENT_ROLE_REQUIRED");
  if (!(D4_R2_EQUIPMENT_ROLES as readonly string[]).includes(equipmentRole)) fail("EQUIPMENT_ROLE_NOT_ALLOWLISTED");
  const orientationCategory = explicit(input.orientationCategory, "ORIENTATION_REQUIRED");
  if (!(D4_R2_ORIENTATION_CATEGORIES as readonly string[]).includes(orientationCategory)) fail("ORIENTATION_NOT_ALLOWLISTED");
  const operatingContextDescription = input.operatingContextDescription == null || input.operatingContextDescription === "" ? null : explicit(input.operatingContextDescription, "OPERATING_CONTEXT_INVALID");
  const stage = stageOf(input.citedLifecycleStage);
  const provenanceRef = provenanceOf(input.provenanceRef);
  const predecessor = input.predecessorDescriptionId ? store.descriptions.find((row) => row.descriptionId === input.predecessorDescriptionId) : null;
  if (input.predecessorDescriptionId) {
    if (!predecessor) fail("DESCRIPTION_NOT_FOUND");
    if (predecessor.tenantId !== actor.tenantId || !sameLineage(store, object, predecessor.objectId)) fail("R1_CONTEXT_MISMATCH");
    if (predecessor.recordStatus !== "CURRENT") fail("PREDECESSOR_NOT_CURRENT");
  }
  const fingerprint = fingerprintCanonical({
    descriptionId,
    contextId: context.contextId,
    objectId: object.objectId,
    objectRevisionFingerprint: object.fingerprint,
    description,
    equipmentRole,
    orientationCategory,
    operatingContextDescription,
    citedLifecycleStage: stage,
    provenanceRef,
    citedCurrentness,
    authority: D4_CONTEXT_AUTHORITY,
    predecessorDescriptionId: predecessor?.descriptionId ?? null,
  });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.descriptions.find((row) => row.descriptionId === descriptionId);
  if (existing) {
    if (existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId) return existing;
    fail("DESCRIPTION_ALREADY_RECORDED");
  }
  const duplicate = store.descriptions.find((row) => row.recordStatus === "CURRENT" && row.descriptionId !== predecessor?.descriptionId && row.objectId === object.objectId && row.objectRevisionFingerprint === object.fingerprint && row.description === description && row.equipmentRole === equipmentRole);
  if (duplicate) fail("DUPLICATE_DESCRIPTION_REJECTED");
  const record: D4R2DescriptionRecord = Object.freeze({
    descriptionId,
    contextId: context.contextId,
    objectId: object.objectId,
    objectType: object.objectType,
    objectRevisionFingerprint: object.fingerprint,
    description,
    equipmentRole: equipmentRole as D4R2DescriptionRecord["equipmentRole"],
    orientationCategory: orientationCategory as D4R2DescriptionRecord["orientationCategory"],
    operatingContextDescription,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
    discipline: D4_DISCIPLINE,
    citedLifecycleStage: stage,
    provenanceRef,
    citedCurrentness,
    authority: D4_CONTEXT_AUTHORITY,
    mechanicalEngineeringAuthority: false,
    engineeringValidated: false,
    designConditionAuthority: false,
    performanceAuthority: false,
    vendorDataAuthority: false,
    fingerprint,
    recordedBy: actor.actorId,
    recordedAt: store.now(),
    recordStatus: "CURRENT",
    predecessorDescriptionId: predecessor?.descriptionId ?? null,
  });
  if (predecessor) {
    const index = store.descriptions.findIndex((row) => row.descriptionId === predecessor.descriptionId);
    const superseded = Object.freeze({ ...predecessor, recordStatus: "SUPERSEDED" as const });
    store.descriptions[index] = superseded;
    remember(store, "DESCRIPTION", superseded.descriptionId, "SUPERSEDED", superseded.fingerprint);
  }
  store.descriptions.push(record);
  remember(store, "DESCRIPTION", record.descriptionId, "CREATED", record.fingerprint);
  return record;
}

export function repointMechanicalEquipmentContext(): never {
  return fail("AUTO_REPOINT_REJECTED");
}

export function mutateMechanicalEquipmentContext(): never {
  return fail("CONTEXT_MUTATION_REJECTED");
}

export function advanceMechanicalEquipmentMaturity(): never {
  return fail("MATURITY_PROGRESSION_NOT_IN_R2");
}

export function recordDesignCondition(): never {
  return fail("DESIGN_CONDITION_NOT_IN_R2");
}

export function recordPerformanceContext(): never {
  return fail("PERFORMANCE_CONTEXT_NOT_IN_R2");
}

export function recordVendorData(): never {
  return fail("VENDOR_DATA_NOT_IN_R2");
}

export function sizeMechanicalEquipment(): never {
  return fail("EQUIPMENT_SIZING_NOT_IN_R2");
}
