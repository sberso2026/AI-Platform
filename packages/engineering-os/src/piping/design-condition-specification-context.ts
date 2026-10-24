/**
 * EOS-D5-R3 Piping design-condition and specification context.
 * One bounded runtime on exact R1 identities and R2 context. No calculations.
 */
import {
  D5_CREATES_AUTHORITATIVE_PROCESS_CONDITION,
  D5_CURRENTNESS_STATES,
  D5_IMPLEMENTATION_PHASE_TYPES,
  D5_IMPLEMENTATION_PHASES,
  D5_MATURITY_STATES,
  PIPING_CLASS_EQUALS_VALIDATED_MATERIAL_SELECTION,
  PIPING_DESIGN_CONDITION_EQUALS_VALIDATED_PIPING_DESIGN,
  PIPING_SPECIFICATION_REFERENCE_EQUALS_CODE_CONFORMANCE,
  PROCESS_CONDITION_EQUALS_PIPING_DESIGN_CONDITION,
  SOURCE_CONDITION_EQUALS_ADOPTED_PIPING_DESIGN_CONDITION,
} from "@rtb/types";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import {
  D5_CONTEXT_AUTHORITY,
  D5_DISCIPLINE,
  D5_PIPING_IDENTITY_OBJECT_FOUNDATION_RUNTIME_READY as R1_IDENTITY_READY,
  type D5R1Actor,
  type D5R1Store,
} from "./identity-foundation";
import {
  ADMIN_EQUALS_D5_PIPING_ENGINEERING_AUTHORITY,
  AI_EQUALS_D5_PIPING_ENGINEERING_AUTHORITY,
  D1_STRUCTURAL_PACK_COMPLETE,
  D1N_REOPENED,
  D2_REOPENED,
  D2_TRACK_COMPLETE,
  D3_REOPENED,
  D3_TRACK_COMPLETE,
  D4_REOPENED,
  D4_TRACK_COMPLETE,
  D5_APPROVAL_RUNTIME_COUNT,
  D5_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT,
  D5_AUTOMATIC_REDESIGN_RUNTIME_COUNT,
  D5_AUTOMATIC_ROUTING_RUNTIME_COUNT,
  D5_BRANCH_REINFORCEMENT_CALCULATION_RUNTIME_COUNT,
  D5_CERTIFICATION_RUNTIME_COUNT,
  D5_COMPONENT_CONNECTION_VALVE_RUNTIME_COUNT,
  D5_CONFORMANCE_DETERMINATION_RUNTIME_COUNT,
  D5_CROSS_DISCIPLINE_CONFLICT_DETECTION_RUNTIME_COUNT,
  D5_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT,
  D5_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT,
  D5_CROSS_DISCIPLINE_RECOMMENDATION_RUNTIME_COUNT,
  D5_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT,
  D5_D9_RUNTIME_INTEGRATION_COUNT,
  D5_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
  D5_DISCIPLINE_INTERFACE_RUNTIME_COUNT,
  D5_EQUALS_D1_STRUCTURAL_AUTHORITY,
  D5_EQUALS_D2_CIVIL_AUTHORITY,
  D5_EQUALS_D3_GEOTECHNICAL_AUTHORITY,
  D5_EQUALS_D4_MECHANICAL_AUTHORITY,
  D5_EQUALS_D6_PROCESS_AUTHORITY,
  D5_EQUALS_D7_ELECTRICAL_AUTHORITY,
  D5_EQUALS_D8_INSTRUMENTATION_CONTROL_AUTHORITY,
  D5_FLEXIBILITY_CALCULATION_RUNTIME_COUNT,
  D5_FLANGE_RATING_CALCULATION_RUNTIME_COUNT,
  D5_HYDRAULIC_CALCULATION_RUNTIME_COUNT,
  D5_PIPE_SIZING_RUNTIME_COUNT,
  D5_PIPING_STRESS_CALCULATION_RUNTIME_COUNT,
  D5_PRESSURE_DROP_CALCULATION_RUNTIME_COUNT,
  D5_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_COUNT,
  D5_REUSES_CANONICAL_CURRENTNESS,
  D5_REUSES_CANONICAL_FINGERPRINT,
  D5_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_COUNT,
  D5_ROUTE_OPTIMIZATION_RUNTIME_COUNT,
  D5_ROUTING_ARRANGEMENT_FABRICATION_RUNTIME_COUNT,
  D5_RUNTIME_COUNT as R2_RUNTIME_COUNT,
  D5_SPATIAL_CLASH_DETECTION_RUNTIME_COUNT,
  D5_STRESS_SUPPORT_TEST_EVIDENCE_RUNTIME_COUNT,
  D5_SUPPORT_LOAD_CALCULATION_RUNTIME_COUNT,
  D5_SYSTEM_LINE_SERVICE_CONTEXT_RUNTIME_READY as R2_CONTEXT_READY,
  D5_WALL_THICKNESS_CALCULATION_RUNTIME_COUNT,
  DATABASE_SCHEMA_CHANGED,
  NEW_DEPENDENCY_ADDED,
  PARALLEL_D5_CURRENTNESS_ENGINE_CREATED,
  SECOND_D5_FINGERPRINT_ALGORITHM_CREATED,
  type D5R2Store,
} from "./system-line-service-context";

export const D5_R3_STATUS = "DESIGN_CONDITIONS_AND_SPECIFICATION_CONTEXT_IMPLEMENTED" as const;
export const D5_R3_MATURITY = D5_R3_STATUS;
export const D5_R3_MATURITY_STATE = D5_R3_STATUS;
export const D5_R3_CLOSEOUT_PATH =
  "docs/architecture/engineering-os/EOS_D5_R3_DESIGN_CONDITIONS_AND_SPECIFICATION_CONTEXT_CLOSEOUT.md" as const;
export const D5_RUNTIME_STARTED = true as const;
export const D5_RUNTIME_COUNT = 3 as const;
export const D5_R2_RUNTIME_COUNT = R2_RUNTIME_COUNT;
export const D5_PIPING_IDENTITY_OBJECT_FOUNDATION_RUNTIME_READY = R1_IDENTITY_READY;
export const D5_SYSTEM_LINE_SERVICE_CONTEXT_RUNTIME_READY = R2_CONTEXT_READY;
export const D5_R1_IDENTITY_REUSED = R1_IDENTITY_READY;
export const D5_R2_SYSTEM_LINE_SERVICE_CONTEXT_REUSED = R2_CONTEXT_READY;
export const EXACT_D5_R1_R2_REFERENCE_REQUIRED = true as const;
export const FLOATING_D5_R3_SOURCE_REFERENCE_ALLOWED = false as const;
export const D5_R3_SOURCE_AUTO_REPOINTED = false as const;
export const D5_DESIGN_CONDITION_SPECIFICATION_RUNTIME_IMPLEMENTED = true as const;
export const D5_DESIGN_CONDITION_SPECIFICATION_RUNTIME_COUNT = 1 as const;
export const D5_DESIGN_CONDITION_SPECIFICATION_RUNTIME_READY = true as const;
export const D5_PIPING_DESIGN_CONDITION_CONTEXT_IMPLEMENTED = true as const;
export const D5_R3_SOURCE_BASIS_REQUIRED = true as const;
export const D5_R3_SOURCE_BASIS_TRACEABLE = true as const;
export const BASISLESS_AUTHORITATIVE_D5_R3_RECORD_AUTO_ACCEPTED = false as const;
export const D5_PROCESS_CONDITION_SOURCE_REFERENCE_SUPPORTED = true as const;
export const PROCESS_CONDITION_AUTO_ADOPTED_AS_PIPING_DESIGN_CONDITION = false as const;
export const PIPING_DESIGN_CONDITION_EQUALS_CALCULATED_RESULT = false as const;
export const PIPING_DESIGN_CONDITION_EQUALS_CODE_CONFORMANCE = false as const;
export const D5_R3_UNITS_REQUIRED = true as const;
export const D5_R3_UNITS_PRESERVED = true as const;
export const AI_CAN_SILENTLY_CHANGE_D5_R3_UNITS = false as const;
export const D5_PIPING_SPECIFICATION_CONTEXT_IMPLEMENTED = true as const;
export const D5_PIPING_CLASS_CONTEXT_IMPLEMENTED = true as const;
export const PIPING_SPECIFICATION_EQUALS_ENGINEERING_VALIDATED = false as const;
export const D5_CODE_STANDARD_REFERENCE_SUPPORTED = true as const;
export const CODE_STANDARD_REFERENCE_EQUALS_CONFORMANCE = false as const;
export const CODE_STANDARD_REFERENCE_EQUALS_CERTIFICATION = false as const;
export const D5_PIPING_MATERIAL_CONTEXT_IMPLEMENTED = true as const;
export const D5_MATERIAL_CONTEXT_EQUALS_MATERIAL_SELECTION_CALCULATION = false as const;
export const D5_MATERIAL_CONTEXT_EQUALS_VALIDATED_MATERIAL_SELECTION = false as const;
export const D5_R2_SERVICE_CONTEXT_REFERENCE_SUPPORTED = true as const;
export const D5_R3_AUTO_MUTATES_R2_SERVICE_CONTEXT = false as const;
export const SERVICE_CONTEXT_AUTO_DETERMINES_PIPING_SPECIFICATION = false as const;
export const SERVICE_CONTEXT_AUTO_DETERMINES_DESIGN_CONDITION = false as const;
export const D5_R3_APPLICABILITY_EXPLICIT = true as const;
export const D5_R3_LIMITATIONS_EXPLICIT = true as const;
export const D5_R3_AUTO_PROPAGATED_OUTSIDE_APPLICABILITY = false as const;
export const D5_R3_AUTOMATIC_SPECIFICATION_ASSIGNMENT_ALLOWED = false as const;
export const D5_R3_AUTOMATIC_PIPING_CLASS_ASSIGNMENT_ALLOWED = false as const;
export const D5_R3_HIDDEN_CALCULATION_ALLOWED = false as const;
export const AI_CAN_INVENT_AUTHORITATIVE_D5_DESIGN_CONDITION = false as const;
export const AI_CAN_INVENT_AUTHORITATIVE_D5_SPECIFICATION = false as const;
export const AI_CAN_PROMOTE_SOURCE_CONDITION_TO_ADOPTED_PIPING_CONDITION = false as const;
export const ADMIN_CAN_PROMOTE_SOURCE_DATA_TO_PIPING_ENGINEERING_TRUTH = false as const;
export const D5_R3_PROVENANCE_REQUIRED = true as const;
export const D5_R3_PROVENANCE_PRESERVED = true as const;
export const D5_R3_AUTO_REPOINTED = false as const;
export const SILENT_D5_R3_MUTATION_ALLOWED = false as const;
export const D5_R3_HISTORY_PRESERVED = true as const;
export const TENANT_WORKSPACE_PROJECT_D5_R3_SCOPE_ENFORCED = true as const;
export const D5_R3_DUPLICATE_GOVERNANCE_IMPLEMENTED = true as const;
export const D5_R3_REPLAY_PROTECTION_IMPLEMENTED = true as const;
export const D5_R3_SPOOFING_PROTECTION_IMPLEMENTED = true as const;
export const D6_RUNTIME_STARTED = false as const;
export const D7_RUNTIME_STARTED = false as const;
export const D8_RUNTIME_STARTED = false as const;
export const D9_RUNTIME_STARTED = false as const;
export const D9_RUNTIME_COUNT = 0 as const;
export const UNAUTHORIZED_D1_PACK_COMPLETION = false as const;
export const UNAUTHORIZED_D2_REOPEN = false as const;
export const UNAUTHORIZED_D3_REOPEN = false as const;
export const UNAUTHORIZED_D4_REOPEN = false as const;
export const UNAUTHORIZED_D5_R4_R12_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_D6_D8_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_D9_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_PROCESS_AUTHORITY_PROMOTION = false as const;
export const UNAUTHORIZED_PIPING_CALCULATION_PROMOTION = false as const;
export const UNAUTHORIZED_PIPING_VALIDATION_PROMOTION = false as const;
export const UNAUTHORIZED_CONFORMANCE_PROMOTION = false as const;
export const UNAUTHORIZED_CROSS_DISCIPLINE_REASONING_PROMOTION = false as const;
export const UNAUTHORIZED_GA_PROMOTION = false as const;
export const UNAUTHORIZED_PRODUCT_CLAIM = false as const;
export const D5_R4_CANONICAL_PHASE = D5_IMPLEMENTATION_PHASES[3];
export const D5_R4_PHASE_TYPE = D5_IMPLEMENTATION_PHASE_TYPES[3];
export const D5_R4_CANONICAL_SCOPE =
  "Implement governed Piping component, connection, valve, specialty and equipment-connection context using exact R1-R3 identities, service/design-condition and specification context. Preserve Mechanical equipment/nozzle authority, explicit component identity and specification applicability. Do not calculate component sizing, pressure rating, branch reinforcement, valve sizing or flange adequacy, and do not implement routing, fabrication, stress/support/test evidence, review/validation, interfaces or D9 runtime." as const;
export const D5_R4_STARTED = false as const;
export const D5_R3_READY_FOR_NEXT_PHASE = true as const;
export const D5_R3_NEXT_PHASE = D5_R4_CANONICAL_PHASE;
export const D5_R3_NEXT_PHASE_TYPE = D5_R4_PHASE_TYPE;
export const D5_R3_CANONICAL_NEXT_PHASE = D5_R4_CANONICAL_PHASE;
export const D5_R3_CANONICAL_NEXT_PHASE_SCOPE = D5_R4_CANONICAL_SCOPE;
export const D5_R3_BLOCKER = "NONE" as const;
export const D5_R3_MACHINE_READABLE_ROADMAP_UPDATED = true as const;

export const D5_R3_SOURCE_BASIS_CATEGORIES = [
  "PROCESS_SOURCE_REFERENCE",
  "PROJECT_DESIGN_BASIS",
  "CLIENT_REQUIREMENT",
  "PIPING_DESIGN_BASIS",
  "PROJECT_SPECIFICATION",
  "CODE_STANDARD_REFERENCE",
  "AUTHORIZED_ENGINEERING_INPUT",
  "GOVERNED_ASSUMPTION",
] as const;

export {
  PROCESS_CONDITION_EQUALS_PIPING_DESIGN_CONDITION,
  SOURCE_CONDITION_EQUALS_ADOPTED_PIPING_DESIGN_CONDITION,
  D5_CREATES_AUTHORITATIVE_PROCESS_CONDITION,
  PIPING_DESIGN_CONDITION_EQUALS_VALIDATED_PIPING_DESIGN,
  PIPING_SPECIFICATION_REFERENCE_EQUALS_CODE_CONFORMANCE,
  PIPING_CLASS_EQUALS_VALIDATED_MATERIAL_SELECTION,
  D5_REUSES_CANONICAL_CURRENTNESS,
  PARALLEL_D5_CURRENTNESS_ENGINE_CREATED,
  D5_REUSES_CANONICAL_FINGERPRINT,
  SECOND_D5_FINGERPRINT_ALGORITHM_CREATED,
  AI_EQUALS_D5_PIPING_ENGINEERING_AUTHORITY,
  ADMIN_EQUALS_D5_PIPING_ENGINEERING_AUTHORITY,
  D5_EQUALS_D1_STRUCTURAL_AUTHORITY,
  D5_EQUALS_D2_CIVIL_AUTHORITY,
  D5_EQUALS_D3_GEOTECHNICAL_AUTHORITY,
  D5_EQUALS_D4_MECHANICAL_AUTHORITY,
  D5_EQUALS_D6_PROCESS_AUTHORITY,
  D5_EQUALS_D7_ELECTRICAL_AUTHORITY,
  D5_EQUALS_D8_INSTRUMENTATION_CONTROL_AUTHORITY,
  D5_COMPONENT_CONNECTION_VALVE_RUNTIME_COUNT,
  D5_ROUTING_ARRANGEMENT_FABRICATION_RUNTIME_COUNT,
  D5_STRESS_SUPPORT_TEST_EVIDENCE_RUNTIME_COUNT,
  D5_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_COUNT,
  D5_DISCIPLINE_INTERFACE_RUNTIME_COUNT,
  D5_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_COUNT,
  D5_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT,
  D5_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
  D5_D9_RUNTIME_INTEGRATION_COUNT,
  D5_PIPE_SIZING_RUNTIME_COUNT,
  D5_HYDRAULIC_CALCULATION_RUNTIME_COUNT,
  D5_PRESSURE_DROP_CALCULATION_RUNTIME_COUNT,
  D5_WALL_THICKNESS_CALCULATION_RUNTIME_COUNT,
  D5_BRANCH_REINFORCEMENT_CALCULATION_RUNTIME_COUNT,
  D5_FLANGE_RATING_CALCULATION_RUNTIME_COUNT,
  D5_PIPING_STRESS_CALCULATION_RUNTIME_COUNT,
  D5_FLEXIBILITY_CALCULATION_RUNTIME_COUNT,
  D5_SUPPORT_LOAD_CALCULATION_RUNTIME_COUNT,
  D5_ROUTE_OPTIMIZATION_RUNTIME_COUNT,
  D5_AUTOMATIC_ROUTING_RUNTIME_COUNT,
  D5_SPATIAL_CLASH_DETECTION_RUNTIME_COUNT,
  D5_AUTOMATIC_REDESIGN_RUNTIME_COUNT,
  D5_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT,
  D5_CONFORMANCE_DETERMINATION_RUNTIME_COUNT,
  D5_APPROVAL_RUNTIME_COUNT,
  D5_CERTIFICATION_RUNTIME_COUNT,
  D5_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT,
  D5_CROSS_DISCIPLINE_CONFLICT_DETECTION_RUNTIME_COUNT,
  D5_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT,
  D5_CROSS_DISCIPLINE_RECOMMENDATION_RUNTIME_COUNT,
  D1_STRUCTURAL_PACK_COMPLETE,
  D1N_REOPENED,
  D2_TRACK_COMPLETE,
  D2_REOPENED,
  D3_TRACK_COMPLETE,
  D3_REOPENED,
  D4_TRACK_COMPLETE,
  D4_REOPENED,
  DATABASE_SCHEMA_CHANGED,
  NEW_DEPENDENCY_ADDED,
};

const FLOATING = new Set(["latest", "current", "newest", "head", "active", "active model"]);
const INFERRED = new Set([
  "inferred", "service_name", "line_tag", "pressure", "temperature", "material", "document_context",
  "neighboring_line", "ai_similarity", "semantic_similarity", "all", "global", "unspecified",
]);

export type D5R3Measure = { value: string; unit: string };

type MeasureInput = { value?: string | null; unit?: string | null; normalizedUnit?: string | null };

type Prohibited = {
  autoAdopt?: boolean;
  inferFromService?: boolean;
  inferClass?: boolean;
  propagate?: boolean;
  calculatedResult?: boolean;
  hiddenCalculation?: boolean;
  componentData?: boolean;
  routing?: boolean;
  stressSupport?: boolean;
  conformance?: boolean;
  engineeringValidated?: boolean;
  materialSelectionCalculation?: boolean;
  normalizedUnit?: string | null;
  createsAuthoritativeProcessCondition?: boolean;
};

type BoundInput = Prohibited & {
  contextId: string;
  objectId: string;
  objectRevisionFingerprint: string;
  lineRecordId: string;
  lineContextFingerprint: string;
  serviceRecordId?: string | null;
  serviceContextFingerprint?: string | null;
  citedLifecycleStage: string;
  citedCurrentness: string;
  provenanceRef: string;
  sourceBasisRef: string;
  sourceBasisCategory: string;
  applicabilityRef: string;
  limitations: string;
  processSourceRef?: string | null;
  assertedFingerprint?: string;
  tenantId?: string;
  workspaceId?: string;
  projectId?: string;
};

export type D5R3ConditionInput = BoundInput & {
  conditionId: string;
  adoption: string;
  designPressure: MeasureInput;
  designTemperature: MeasureInput;
  operatingPressure?: MeasureInput | null;
  operatingTemperature?: MeasureInput | null;
  vacuumCondition?: MeasureInput | null;
  testCondition?: MeasureInput | null;
  corrosionAllowance?: MeasureInput | null;
  designLife?: string | null;
  environmentalBasis?: string | null;
  predecessorConditionId?: string | null;
};

export type D5R3ConditionRecord = {
  conditionId: string;
  contextId: string;
  objectId: string;
  objectRevisionFingerprint: string;
  lineRecordId: string;
  lineContextFingerprint: string;
  serviceRecordId: string | null;
  serviceContextFingerprint: string | null;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  discipline: typeof D5_DISCIPLINE;
  citedLifecycleStage: (typeof D5_MATURITY_STATES)[number];
  citedCurrentness: (typeof D5_CURRENTNESS_STATES)[number];
  provenanceRef: string;
  sourceBasisRef: string;
  sourceBasisCategory: (typeof D5_R3_SOURCE_BASIS_CATEGORIES)[number];
  processSourceRef: string | null;
  applicabilityRef: string;
  limitations: string;
  adoption: "EXPLICIT" | "SOURCE_REFERENCE_ONLY";
  adoptedPipingDesignCondition: boolean;
  processConditionEqualsDesignCondition: false;
  sourceEqualsAdoptedCondition: false;
  calculatedResult: false;
  validatedPipingDesign: false;
  codeConformance: false;
  designPressure: D5R3Measure;
  designTemperature: D5R3Measure;
  operatingPressure: D5R3Measure | null;
  operatingTemperature: D5R3Measure | null;
  vacuumCondition: D5R3Measure | null;
  testCondition: D5R3Measure | null;
  corrosionAllowance: D5R3Measure | null;
  designLife: string | null;
  environmentalBasis: string | null;
  authority: typeof D5_CONTEXT_AUTHORITY;
  pipingEngineeringAuthority: false;
  fingerprint: string;
  recordedBy: string;
  recordedAt: string;
  recordStatus: "CURRENT" | "SUPERSEDED";
  currentness: "CURRENT" | "SUPERSEDED";
  predecessorConditionId: string | null;
};

export type D5R3SpecificationInput = BoundInput & {
  specificationId: string;
  specificationRef: string;
  pipingClass: string;
  materialFamily: string;
  pressureRatingContext: string;
  flangeRatingContext: string;
  wallScheduleContext: string;
  corrosionAllowance?: MeasureInput | null;
  codeStandardRef: string;
  insulationReference?: string | null;
  assignmentBasis: string;
  predecessorSpecificationId?: string | null;
};

export type D5R3SpecificationRecord = {
  specificationId: string;
  contextId: string;
  objectId: string;
  objectRevisionFingerprint: string;
  lineRecordId: string;
  lineContextFingerprint: string;
  serviceRecordId: string | null;
  serviceContextFingerprint: string | null;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  discipline: typeof D5_DISCIPLINE;
  citedLifecycleStage: (typeof D5_MATURITY_STATES)[number];
  citedCurrentness: (typeof D5_CURRENTNESS_STATES)[number];
  provenanceRef: string;
  sourceBasisRef: string;
  sourceBasisCategory: (typeof D5_R3_SOURCE_BASIS_CATEGORIES)[number];
  applicabilityRef: string;
  limitations: string;
  specificationRef: string;
  pipingClass: string;
  materialFamily: string;
  pressureRatingContext: string;
  flangeRatingContext: string;
  wallScheduleContext: string;
  corrosionAllowance: D5R3Measure | null;
  codeStandardRef: string;
  insulationReference: string | null;
  assignmentBasis: "EXPLICIT";
  codeConformance: false;
  certified: false;
  engineeringValidated: false;
  materialSelectionCalculated: false;
  materialValidated: false;
  classValidated: false;
  automaticAssignment: false;
  authority: typeof D5_CONTEXT_AUTHORITY;
  fingerprint: string;
  recordedBy: string;
  recordedAt: string;
  recordStatus: "CURRENT" | "SUPERSEDED";
  currentness: "CURRENT" | "SUPERSEDED";
  predecessorSpecificationId: string | null;
};

export type D5R3History = {
  historyId: string;
  subjectKind: "CONDITION" | "SPECIFICATION";
  subjectId: string;
  action: "CREATED" | "SUPERSEDED";
  fingerprint: string;
  recordedAt: string;
};

export type D5R3Store = {
  r1: D5R1Store;
  r2: D5R2Store;
  now: () => string;
  conditions: D5R3ConditionRecord[];
  specifications: D5R3SpecificationRecord[];
  history: D5R3History[];
};

function fail(code: string): never {
  throw new Error(`D5_R3_${code}`);
}

function blockedParty(value: string): boolean {
  return /^AI(?:\b|_)/i.test(value) || /LLM/i.test(value) || /OPTIMIZER/i.test(value);
}

function explicit(value: string, code: string): string {
  const token = value.trim();
  if (!token || FLOATING.has(token.toLowerCase()) || INFERRED.has(token.toLowerCase()) || blockedParty(token)) fail(code);
  return token;
}

function isStage(value: string): value is (typeof D5_MATURITY_STATES)[number] {
  return (D5_MATURITY_STATES as readonly string[]).includes(value);
}

function isCurrentness(value: string): value is (typeof D5_CURRENTNESS_STATES)[number] {
  return (D5_CURRENTNESS_STATES as readonly string[]).includes(value);
}

function assertActor(actor: D5R1Actor): void {
  if (!actor.actorId.trim() || !actor.tenantId.trim() || !actor.workspaceId.trim() || !actor.projectId.trim()) fail("SCOPE_REQUIRED");
  if (blockedParty(actor.actorId) || blockedParty(actor.authority)) fail("AI_NOT_PIPING_AUTHORITY");
  if (actor.authority === "ADMINISTRATOR" || actor.authority === "ADMIN") fail("ADMIN_NOT_PIPING_AUTHORITY");
  if (actor.authority === "PIPING_ENGINEERING_AUTHORITY" || actor.authority === "PROCESS_AUTHORITY") fail("RECORDER_NOT_PIPING_ENGINEERING_AUTHORITY");
  if (actor.authority !== D5_CONTEXT_AUTHORITY) fail("UNAUTHORIZED");
}

function assertScope(actor: D5R1Actor, input: { tenantId?: string; workspaceId?: string; projectId?: string }): void {
  if (input.tenantId != null && input.tenantId !== actor.tenantId) fail("CROSS_TENANT_OPERATION");
  if (input.workspaceId != null && input.workspaceId !== actor.workspaceId) fail("CROSS_WORKSPACE_OPERATION");
  if (input.projectId != null && input.projectId !== actor.projectId) fail("CROSS_PROJECT_OPERATION");
}

function assertProhibited(input: Prohibited): void {
  if (input.autoAdopt === true) fail("PROCESS_CONDITION_NOT_AUTO_ADOPTED");
  if (input.inferFromService === true || input.inferClass === true) fail("AUTOMATIC_ASSIGNMENT_REJECTED");
  if (input.propagate === true) fail("AUTO_PROPAGATION_REJECTED");
  if (input.calculatedResult === true || input.hiddenCalculation === true || input.materialSelectionCalculation === true) fail("CALCULATION_NOT_IN_R3");
  if (input.normalizedUnit) fail("UNIT_CHANGE_REJECTED");
  if (input.componentData === true) fail("COMPONENT_NOT_IN_R3");
  if (input.routing === true) fail("ROUTING_NOT_IN_R3");
  if (input.stressSupport === true) fail("STRESS_SUPPORT_NOT_IN_R3");
  if (input.conformance === true || input.engineeringValidated === true) fail("VALIDATION_NOT_IN_R3");
  if (input.createsAuthoritativeProcessCondition === true) fail("AUTHORITATIVE_PROCESS_CONDITION_REJECTED");
}

function measure(input: MeasureInput | null | undefined, required: boolean): D5R3Measure | null {
  if (input?.normalizedUnit) fail("UNIT_CHANGE_REJECTED");
  const raw = input?.value == null ? "" : String(input.value).trim();
  if (!raw && !required) return null;
  const value = explicit(raw, "VALUE_REQUIRED");
  if (/[=]|calc\(/i.test(value)) fail("CALCULATION_NOT_IN_R3");
  if (!input?.unit || !input.unit.trim()) fail("UNITS_REQUIRED");
  return { value, unit: explicit(input.unit, "UNIT_INVALID") };
}

function remember(store: D5R3Store, subjectKind: D5R3History["subjectKind"], subjectId: string, action: D5R3History["action"], fingerprint: string): void {
  store.history.push({ historyId: `hist-${store.history.length + 1}`, subjectKind, subjectId, action, fingerprint, recordedAt: store.now() });
}

function prepare(store: D5R3Store, actor: D5R1Actor, input: BoundInput) {
  assertActor(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const cited = input.citedCurrentness.trim();
  if (!isCurrentness(cited)) fail("CURRENTNESS_INVALID");
  const contextId = explicit(input.contextId, "R1_CONTEXT_REQUIRED");
  const context = store.r1.contexts.find((row) => row.contextId === contextId);
  if (!context) fail("R1_CONTEXT_NOT_FOUND");
  if (context.tenantId !== actor.tenantId || context.workspaceId !== actor.workspaceId || context.projectId !== actor.projectId) fail("CROSS_SCOPE_OPERATION");
  if (cited === "CURRENT" && context.recordStatus !== "CURRENT") fail("R1_CONTEXT_NOT_CURRENT");
  const objectId = explicit(input.objectId, "R1_OBJECT_REQUIRED");
  const revision = explicit(input.objectRevisionFingerprint, "R1_REVISION_REQUIRED");
  const object = store.r1.objects.find((row) => row.objectId === objectId);
  if (!object) fail("R1_OBJECT_NOT_FOUND");
  if (object.fingerprint !== revision) fail("R1_REVISION_MISMATCH");
  if (object.objectType !== "PIPING_LINE" && object.objectType !== "PIPING_DESIGN_CONDITION_CONTEXT" && object.objectType !== "PIPING_SPECIFICATION_CONTEXT") fail("R1_OBJECT_TYPE_MISMATCH");
  if (object.contextId !== context.contextId) fail("R1_CONTEXT_MISMATCH");
  if (object.tenantId !== actor.tenantId || object.workspaceId !== actor.workspaceId || object.projectId !== actor.projectId) fail("CROSS_SCOPE_OPERATION");
  if (cited === "CURRENT" && object.recordStatus !== "CURRENT") fail("R1_OBJECT_NOT_CURRENT");
  const lineRecordId = explicit(input.lineRecordId, "R2_LINE_REQUIRED");
  const lineRevision = explicit(input.lineContextFingerprint, "R2_REVISION_REQUIRED");
  const line = store.r2.lines.find((row) => row.lineRecordId === lineRecordId);
  if (!line) fail("R2_LINE_NOT_FOUND");
  if (line.fingerprint !== lineRevision) fail("R2_REVISION_MISMATCH");
  if (line.objectId !== object.objectId && object.objectType === "PIPING_LINE") fail("R2_LINE_MISMATCH");
  if (line.tenantId !== actor.tenantId || line.workspaceId !== actor.workspaceId || line.projectId !== actor.projectId) fail("CROSS_SCOPE_OPERATION");
  if (cited === "CURRENT" && line.recordStatus !== "CURRENT") fail("R2_CONTEXT_NOT_CURRENT");
  let serviceRecordId: string | null = null;
  let serviceContextFingerprint: string | null = null;
  if (input.serviceRecordId) {
    serviceRecordId = explicit(input.serviceRecordId, "R2_SERVICE_REQUIRED");
    serviceContextFingerprint = explicit(input.serviceContextFingerprint ?? "", "R2_SERVICE_REVISION_REQUIRED");
    const service = store.r2.services.find((row) => row.serviceRecordId === serviceRecordId);
    if (!service || service.fingerprint !== serviceContextFingerprint) fail("R2_SERVICE_REVISION_MISMATCH");
    if (service.tenantId !== actor.tenantId) fail("CROSS_SCOPE_OPERATION");
    if (cited === "CURRENT" && service.recordStatus !== "CURRENT") fail("R2_SERVICE_NOT_CURRENT");
  }
  const stage = input.citedLifecycleStage.trim();
  if (!isStage(stage)) fail("MATURITY_STAGE_INVALID");
  const applicabilityRef = explicit(input.applicabilityRef, "APPLICABILITY_REQUIRED");
  if (applicabilityRef !== object.objectId) fail("APPLICABILITY_MISMATCH");
  const limitations = explicit(input.limitations, "LIMITATIONS_REQUIRED");
  const sourceBasisCategory = explicit(input.sourceBasisCategory, "SOURCE_BASIS_REQUIRED");
  if (!(D5_R3_SOURCE_BASIS_CATEGORIES as readonly string[]).includes(sourceBasisCategory)) fail("SOURCE_BASIS_NOT_ALLOWLISTED");
  const sourceBasisRef = explicit(input.sourceBasisRef, "SOURCE_BASIS_REQUIRED");
  const provenanceRef = explicit(input.provenanceRef, "MISSING_PROVENANCE");
  const processSourceRef = input.processSourceRef == null || input.processSourceRef === "" ? null : explicit(input.processSourceRef, "PROCESS_SOURCE_INVALID");
  return {
    context, object, line, stage, citedCurrentness: cited, applicabilityRef, limitations,
    sourceBasisCategory: sourceBasisCategory as (typeof D5_R3_SOURCE_BASIS_CATEGORIES)[number],
    sourceBasisRef, provenanceRef, processSourceRef, serviceRecordId, serviceContextFingerprint,
  };
}

export function createD5R3Store(r1: D5R1Store, r2: D5R2Store, now: () => string = () => "2026-10-24T00:00:00.000Z"): D5R3Store {
  return { r1, r2, now, conditions: [], specifications: [], history: [] };
}

export function recordPipingDesignCondition(store: D5R3Store, actor: D5R1Actor, input: D5R3ConditionInput): D5R3ConditionRecord {
  const prepared = prepare(store, actor, input);
  const conditionId = explicit(input.conditionId, "CONDITION_REQUIRED");
  const adoptionToken = explicit(input.adoption, "ADOPTION_REQUIRED");
  if (adoptionToken !== "EXPLICIT" && adoptionToken !== "SOURCE_REFERENCE_ONLY") fail("ADOPTION_NOT_EXPLICIT");
  const adoption = adoptionToken === "EXPLICIT" ? "EXPLICIT" as const : "SOURCE_REFERENCE_ONLY" as const;
  const designPressure = measure(input.designPressure, true);
  const designTemperature = measure(input.designTemperature, true);
  if (!designPressure || !designTemperature) fail("UNITS_REQUIRED");
  const operatingPressure = measure(input.operatingPressure, false);
  const operatingTemperature = measure(input.operatingTemperature, false);
  const vacuumCondition = measure(input.vacuumCondition, false);
  const testCondition = measure(input.testCondition, false);
  const corrosionAllowance = measure(input.corrosionAllowance, false);
  const designLife = input.designLife == null || input.designLife === "" ? null : explicit(input.designLife, "DESIGN_LIFE_INVALID");
  const environmentalBasis = input.environmentalBasis == null || input.environmentalBasis === "" ? null : explicit(input.environmentalBasis, "ENVIRONMENTAL_BASIS_INVALID");
  const predecessor = input.predecessorConditionId ? store.conditions.find((row) => row.conditionId === input.predecessorConditionId) : null;
  if (input.predecessorConditionId && (!predecessor || predecessor.recordStatus !== "CURRENT" || predecessor.tenantId !== actor.tenantId || predecessor.objectId !== prepared.object.objectId)) fail("PREDECESSOR_NOT_CURRENT");
  const adopted = adoptionToken === "EXPLICIT";
  const fingerprint = fingerprintCanonical({
    conditionId, objectId: prepared.object.objectId, objectRevisionFingerprint: prepared.object.fingerprint,
    lineRecordId: prepared.line.lineRecordId, lineContextFingerprint: prepared.line.fingerprint,
    serviceRecordId: prepared.serviceRecordId, serviceContextFingerprint: prepared.serviceContextFingerprint,
    adoption, designPressure, designTemperature, operatingPressure, operatingTemperature,
    vacuumCondition, testCondition, corrosionAllowance, designLife, environmentalBasis,
    sourceBasisRef: prepared.sourceBasisRef, sourceBasisCategory: prepared.sourceBasisCategory,
    processSourceRef: prepared.processSourceRef, applicabilityRef: prepared.applicabilityRef, limitations: prepared.limitations,
    provenanceRef: prepared.provenanceRef, citedLifecycleStage: prepared.stage, citedCurrentness: prepared.citedCurrentness,
    predecessorConditionId: predecessor?.conditionId ?? null,
  });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.conditions.find((row) => row.conditionId === conditionId);
  if (existing) return existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId ? existing : fail("DUPLICATE_CONDITION_REJECTED");
  const duplicate = store.conditions.find((row) => row.recordStatus === "CURRENT" && row.conditionId !== predecessor?.conditionId && row.objectId === prepared.object.objectId && row.objectRevisionFingerprint === prepared.object.fingerprint && row.designPressure.value === designPressure.value && row.designPressure.unit === designPressure.unit && row.designTemperature.value === designTemperature.value && row.designTemperature.unit === designTemperature.unit);
  if (duplicate) fail("DUPLICATE_CONDITION_REJECTED");
  const record: D5R3ConditionRecord = Object.freeze({
    conditionId,
    contextId: prepared.context.contextId,
    objectId: prepared.object.objectId,
    objectRevisionFingerprint: prepared.object.fingerprint,
    lineRecordId: prepared.line.lineRecordId,
    lineContextFingerprint: prepared.line.fingerprint,
    serviceRecordId: prepared.serviceRecordId,
    serviceContextFingerprint: prepared.serviceContextFingerprint,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
    discipline: D5_DISCIPLINE,
    citedLifecycleStage: prepared.stage,
    citedCurrentness: prepared.citedCurrentness,
    provenanceRef: prepared.provenanceRef,
    sourceBasisRef: prepared.sourceBasisRef,
    sourceBasisCategory: prepared.sourceBasisCategory,
    processSourceRef: prepared.processSourceRef,
    applicabilityRef: prepared.applicabilityRef,
    limitations: prepared.limitations,
    adoption,
    adoptedPipingDesignCondition: adopted,
    processConditionEqualsDesignCondition: false,
    sourceEqualsAdoptedCondition: false,
    calculatedResult: false,
    validatedPipingDesign: false,
    codeConformance: false,
    designPressure,
    designTemperature,
    operatingPressure,
    operatingTemperature,
    vacuumCondition,
    testCondition,
    corrosionAllowance,
    designLife,
    environmentalBasis,
    authority: D5_CONTEXT_AUTHORITY,
    pipingEngineeringAuthority: false,
    fingerprint,
    recordedBy: actor.actorId,
    recordedAt: store.now(),
    recordStatus: "CURRENT",
    currentness: "CURRENT",
    predecessorConditionId: predecessor?.conditionId ?? null,
  });
  if (predecessor) {
    const index = store.conditions.findIndex((row) => row.conditionId === predecessor.conditionId);
    const superseded = Object.freeze({ ...predecessor, recordStatus: "SUPERSEDED" as const, currentness: "SUPERSEDED" as const });
    store.conditions[index] = superseded;
    remember(store, "CONDITION", superseded.conditionId, "SUPERSEDED", superseded.fingerprint);
  }
  store.conditions.push(record);
  remember(store, "CONDITION", record.conditionId, "CREATED", record.fingerprint);
  return record;
}

export function recordPipingSpecificationContext(store: D5R3Store, actor: D5R1Actor, input: D5R3SpecificationInput): D5R3SpecificationRecord {
  const prepared = prepare(store, actor, input);
  const specificationId = explicit(input.specificationId, "SPECIFICATION_REQUIRED");
  if (!input.assignmentBasis.trim()) fail("ASSIGNMENT_BASIS_REQUIRED");
  if (input.assignmentBasis.trim() !== "EXPLICIT") fail("AUTOMATIC_ASSIGNMENT_REJECTED");
  const assignmentBasis = "EXPLICIT" as const;
  const specificationRef = explicit(input.specificationRef, "SPECIFICATION_REF_REQUIRED");
  const pipingClass = explicit(input.pipingClass, "PIPING_CLASS_REQUIRED");
  const materialFamily = explicit(input.materialFamily, "MATERIAL_CONTEXT_REQUIRED");
  const pressureRatingContext = explicit(input.pressureRatingContext, "PRESSURE_RATING_CONTEXT_REQUIRED");
  const flangeRatingContext = explicit(input.flangeRatingContext, "FLANGE_RATING_CONTEXT_REQUIRED");
  const wallScheduleContext = explicit(input.wallScheduleContext, "WALL_SCHEDULE_CONTEXT_REQUIRED");
  const corrosionAllowance = measure(input.corrosionAllowance, false);
  const codeStandardRef = explicit(input.codeStandardRef, "CODE_STANDARD_REQUIRED");
  const insulationReference = input.insulationReference == null || input.insulationReference === "" ? null : explicit(input.insulationReference, "INSULATION_REFERENCE_INVALID");
  const predecessor = input.predecessorSpecificationId ? store.specifications.find((row) => row.specificationId === input.predecessorSpecificationId) : null;
  if (input.predecessorSpecificationId && (!predecessor || predecessor.recordStatus !== "CURRENT" || predecessor.tenantId !== actor.tenantId || predecessor.objectId !== prepared.object.objectId)) fail("PREDECESSOR_NOT_CURRENT");
  const fingerprint = fingerprintCanonical({
    specificationId, objectId: prepared.object.objectId, objectRevisionFingerprint: prepared.object.fingerprint,
    lineRecordId: prepared.line.lineRecordId, lineContextFingerprint: prepared.line.fingerprint,
    serviceRecordId: prepared.serviceRecordId, specificationRef, pipingClass, materialFamily,
    pressureRatingContext, flangeRatingContext, wallScheduleContext, corrosionAllowance, codeStandardRef, insulationReference,
    assignmentBasis, sourceBasisRef: prepared.sourceBasisRef, sourceBasisCategory: prepared.sourceBasisCategory,
    applicabilityRef: prepared.applicabilityRef, limitations: prepared.limitations, provenanceRef: prepared.provenanceRef,
    citedLifecycleStage: prepared.stage, citedCurrentness: prepared.citedCurrentness, predecessorSpecificationId: predecessor?.specificationId ?? null,
  });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.specifications.find((row) => row.specificationId === specificationId);
  if (existing) return existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId ? existing : fail("DUPLICATE_SPECIFICATION_REJECTED");
  const duplicate = store.specifications.find((row) => row.recordStatus === "CURRENT" && row.specificationId !== predecessor?.specificationId && row.objectId === prepared.object.objectId && row.objectRevisionFingerprint === prepared.object.fingerprint && row.specificationRef === specificationRef && row.pipingClass === pipingClass);
  if (duplicate) fail("DUPLICATE_SPECIFICATION_REJECTED");
  const record: D5R3SpecificationRecord = Object.freeze({
    specificationId,
    contextId: prepared.context.contextId,
    objectId: prepared.object.objectId,
    objectRevisionFingerprint: prepared.object.fingerprint,
    lineRecordId: prepared.line.lineRecordId,
    lineContextFingerprint: prepared.line.fingerprint,
    serviceRecordId: prepared.serviceRecordId,
    serviceContextFingerprint: prepared.serviceContextFingerprint,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
    discipline: D5_DISCIPLINE,
    citedLifecycleStage: prepared.stage,
    citedCurrentness: prepared.citedCurrentness,
    provenanceRef: prepared.provenanceRef,
    sourceBasisRef: prepared.sourceBasisRef,
    sourceBasisCategory: prepared.sourceBasisCategory,
    applicabilityRef: prepared.applicabilityRef,
    limitations: prepared.limitations,
    specificationRef,
    pipingClass,
    materialFamily,
    pressureRatingContext,
    flangeRatingContext,
    wallScheduleContext,
    corrosionAllowance,
    codeStandardRef,
    insulationReference,
    assignmentBasis: "EXPLICIT",
    codeConformance: false,
    certified: false,
    engineeringValidated: false,
    materialSelectionCalculated: false,
    materialValidated: false,
    classValidated: false,
    automaticAssignment: false,
    authority: D5_CONTEXT_AUTHORITY,
    fingerprint,
    recordedBy: actor.actorId,
    recordedAt: store.now(),
    recordStatus: "CURRENT",
    currentness: "CURRENT",
    predecessorSpecificationId: predecessor?.specificationId ?? null,
  });
  if (predecessor) {
    const index = store.specifications.findIndex((row) => row.specificationId === predecessor.specificationId);
    const superseded = Object.freeze({ ...predecessor, recordStatus: "SUPERSEDED" as const, currentness: "SUPERSEDED" as const });
    store.specifications[index] = superseded;
    remember(store, "SPECIFICATION", superseded.specificationId, "SUPERSEDED", superseded.fingerprint);
  }
  store.specifications.push(record);
  remember(store, "SPECIFICATION", record.specificationId, "CREATED", record.fingerprint);
  return record;
}

export function mutatePipingDesignCondition(): never {
  return fail("CONTEXT_MUTATION_REJECTED");
}

export function repointPipingDesignCondition(): never {
  return fail("AUTO_REPOINT_REJECTED");
}

export function recordPipingComponent(): never {
  return fail("COMPONENT_NOT_IN_R3");
}

export function recordPipingRoute(): never {
  return fail("ROUTING_NOT_IN_R3");
}

export function recordPipingStressSupport(): never {
  return fail("STRESS_SUPPORT_NOT_IN_R3");
}

export function calculatePiping(): never {
  return fail("CALCULATION_NOT_IN_R3");
}

export function validatePipingEngineering(): never {
  return fail("VALIDATION_NOT_IN_R3");
}

export function determinePipingConformance(): never {
  return fail("CONFORMANCE_NOT_IN_R3");
}
