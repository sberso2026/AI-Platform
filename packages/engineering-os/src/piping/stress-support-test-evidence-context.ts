/**
 * EOS-D5-R6 Piping stress, support, and test evidence context.
 * One bounded runtime on exact R1-R5 revisions. Evidence is not calculation or validation.
 */
import {
  D5_CURRENTNESS_STATES,
  D5_IMPLEMENTATION_PHASE_TYPES,
  D5_IMPLEMENTATION_PHASES,
  D5_MATURITY_STATES,
  NDE_RESULT_EQUALS_CODE_CONFORMANCE,
  PIPING_SUPPORT_CONTEXT_EQUALS_STRUCTURAL_ADEQUACY,
  PIPING_SUPPORT_REQUIREMENT_EQUALS_STRUCTURAL_SUPPORT_DESIGN,
  STRESS_ANALYSIS_RESULT_EQUALS_STRUCTURAL_SUPPORT_VALIDATION,
  STRESS_ANALYSIS_RESULT_EQUALS_VALIDATED_PIPING_DESIGN,
  TEST_REQUIREMENT_EQUALS_TEST_COMPLETED,
} from "@rtb/types";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import { D5_CONTEXT_AUTHORITY, type D5R1Actor } from "./identity-foundation";
import {
  D5_COMPONENT_CONNECTION_VALVE_RUNTIME_READY as R4_READY,
  D5_COMPONENT_SIZING_RUNTIME_COUNT,
  D5_CONSTRUCTABILITY_DETERMINATION_RUNTIME_COUNT,
  D5_DESIGN_CONDITION_SPECIFICATION_RUNTIME_READY as R3_READY,
  D5_GEOMETRY_SOLVER_RUNTIME_COUNT,
  D5_PIPING_IDENTITY_OBJECT_FOUNDATION_RUNTIME_READY as R1_READY,
  D5_R4_COMPONENT_CONNECTION_VALVE_CONTEXT_REUSED as R4_REUSED,
  D5_ROUTING_ARRANGEMENT_FABRICATION_RUNTIME_READY as R5_READY,
  D5_RUNTIME_COUNT as R5_RUNTIME_COUNT,
  D5_STRESS_SUPPORT_TEST_EVIDENCE_RUNTIME_COUNT as R5_STRESS_COUNT,
  D5_SYSTEM_LINE_SERVICE_CONTEXT_RUNTIME_READY as R2_READY,
  D5_VALVE_SIZING_RUNTIME_COUNT,
  type D5R5Store,
} from "./routing-arrangement-fabrication-context";
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
  D5_SPATIAL_CLASH_DETECTION_RUNTIME_COUNT,
  D5_SUPPORT_LOAD_CALCULATION_RUNTIME_COUNT,
  D5_WALL_THICKNESS_CALCULATION_RUNTIME_COUNT,
  DATABASE_SCHEMA_CHANGED,
  NEW_DEPENDENCY_ADDED,
  PARALLEL_D5_CURRENTNESS_ENGINE_CREATED,
  SECOND_D5_FINGERPRINT_ALGORITHM_CREATED,
} from "./system-line-service-context";

export const D5_R6_STATUS = "STRESS_SUPPORT_AND_TEST_EVIDENCE_CONTEXT_IMPLEMENTED" as const;
export const D5_R6_MATURITY = D5_R6_STATUS;
export const D5_R6_MATURITY_STATE = D5_R6_STATUS;
export const D5_R6_CLOSEOUT_PATH =
  "docs/architecture/engineering-os/EOS_D5_R6_STRESS_SUPPORT_AND_TEST_EVIDENCE_CONTEXT_CLOSEOUT.md" as const;
export const D5_RUNTIME_STARTED = true as const;
export const D5_RUNTIME_COUNT = 6 as const;
export const D5_R5_RUNTIME_COUNT = R5_RUNTIME_COUNT;
export const D5_R5_STRESS_SUPPORT_TEST_EVIDENCE_RUNTIME_COUNT = R5_STRESS_COUNT;
export const D5_PIPING_IDENTITY_OBJECT_FOUNDATION_RUNTIME_READY = R1_READY;
export const D5_SYSTEM_LINE_SERVICE_CONTEXT_RUNTIME_READY = R2_READY;
export const D5_DESIGN_CONDITION_SPECIFICATION_RUNTIME_READY = R3_READY;
export const D5_COMPONENT_CONNECTION_VALVE_RUNTIME_READY = R4_READY;
export const D5_ROUTING_ARRANGEMENT_FABRICATION_RUNTIME_READY = R5_READY;
export const D5_R1_IDENTITY_REUSED = R1_READY;
export const D5_R2_SYSTEM_LINE_SERVICE_CONTEXT_REUSED = R2_READY;
export const D5_R3_DESIGN_CONDITION_SPECIFICATION_CONTEXT_REUSED = R3_READY;
export const D5_R4_COMPONENT_CONNECTION_VALVE_CONTEXT_REUSED = R4_REUSED;
export const D5_R5_ROUTING_ARRANGEMENT_FABRICATION_CONTEXT_REUSED = R5_READY;
export const EXACT_D5_R1_R5_REFERENCE_REQUIRED = true as const;
export const FLOATING_D5_R6_SOURCE_REFERENCE_ALLOWED = false as const;
export const D5_R6_SOURCE_AUTO_REPOINTED = false as const;
export const D5_STRESS_SUPPORT_TEST_EVIDENCE_RUNTIME_IMPLEMENTED = true as const;
export const D5_STRESS_SUPPORT_TEST_EVIDENCE_RUNTIME_COUNT = 1 as const;
export const D5_STRESS_SUPPORT_TEST_EVIDENCE_RUNTIME_READY = true as const;
export const D5_PIPING_STRESS_FLEXIBILITY_EVIDENCE_CONTEXT_IMPLEMENTED = true as const;
export const STRESS_ANALYSIS_RESULT_EQUALS_CODE_CONFORMANCE = false as const;
export const D5_R6_HIDDEN_STRESS_CALCULATION_ALLOWED = false as const;
export const D5_STRESS_LOAD_CASE_CONTEXT_SUPPORTED = true as const;
export const LOAD_CASE_CONTEXT_EQUALS_ANALYSIS_EXECUTED = false as const;
export const LOAD_CASE_CONTEXT_EQUALS_ANALYSIS_VALIDATED = false as const;
export const D5_R6_EVIDENCE_UNITS_REQUIRED = true as const;
export const D5_R6_EVIDENCE_UNITS_PRESERVED = true as const;
export const AI_CAN_SILENTLY_CHANGE_D5_R6_EVIDENCE_UNITS = false as const;
export const D5_PIPING_SUPPORT_RESTRAINT_CONTEXT_IMPLEMENTED = true as const;
export const PIPING_SUPPORT_LOAD_REFERENCE_EQUALS_STRUCTURAL_VALIDATION = false as const;
export const D5_R6_VALIDATES_D1_STRUCTURAL_SUPPORT = false as const;
export const D5_R6_PERFORMS_STRUCTURAL_SUPPORT_DESIGN = false as const;
export const D5_R6_AUTOMATIC_SUPPORT_SELECTION_ALLOWED = false as const;
export const D5_R6_AUTOMATIC_RESTRAINT_SELECTION_ALLOWED = false as const;
export const D5_R6_AUTOMATIC_SUPPORT_LOCATION_DERIVATION_ALLOWED = false as const;
export const D5_PIPING_INSPECTION_REQUIREMENT_CONTEXT_IMPLEMENTED = true as const;
export const INSPECTION_REQUIREMENT_EQUALS_INSPECTION_COMPLETED = false as const;
export const INSPECTION_REQUIREMENT_EQUALS_INSPECTION_PASSED = false as const;
export const D5_PIPING_NDE_CONTEXT_IMPLEMENTED = true as const;
export const NDE_REQUIREMENT_EQUALS_NDE_COMPLETED = false as const;
export const NDE_COMPLETED_EQUALS_NDE_ACCEPTED = false as const;
export const NDE_RESULT_EQUALS_ENGINEERING_VALIDATED = false as const;
export const D5_PIPING_PRESSURE_LEAK_TEST_CONTEXT_IMPLEMENTED = true as const;
export const TEST_COMPLETED_EQUALS_TEST_PASSED = false as const;
export const TEST_PASSED_EQUALS_ENGINEERING_VALIDATED = false as const;
export const TEST_RESULT_EQUALS_CODE_CONFORMANCE = false as const;
export const D5_R3_DESIGN_TEST_CONDITION_REFERENCE_SUPPORTED = true as const;
export const EXACT_D5_R3_DESIGN_TEST_CONDITION_REVISION_REQUIRED = true as const;
export const TEST_EVIDENCE_AUTO_MUTATES_R3_DESIGN_CONDITION = false as const;
export const TEST_RESULT_AUTO_REWRITES_R3_TEST_CONDITION = false as const;
export const D5_R5_WELD_JOINT_CONTEXT_REUSED = true as const;
export const EXACT_D5_R5_WELD_JOINT_REVISION_REQUIRED = true as const;
export const D5_R6_AUTO_MUTATES_R5_WELD_JOINT_CONTEXT = false as const;
export const NDE_EVIDENCE_AUTO_MARKS_R5_WELD_ACCEPTED = false as const;
export const D5_EXTERNAL_ANALYSIS_EVIDENCE_SUPPORTED = true as const;
export const EXTERNAL_ANALYSIS_EVIDENCE_EQUALS_EOS_VALIDATION = false as const;
export const EXTERNAL_TOOL_RESULT_EQUALS_CODE_CONFORMANCE = false as const;
export const D5_R6_SOURCE_BASIS_REQUIRED = true as const;
export const D5_R6_SOURCE_BASIS_TRACEABLE = true as const;
export const BASISLESS_AUTHORITATIVE_D5_R6_RECORD_AUTO_ACCEPTED = false as const;
export const D5_R6_APPLICABILITY_EXPLICIT = true as const;
export const D5_R6_LIMITATIONS_EXPLICIT = true as const;
export const D5_R6_AUTO_PROPAGATED_OUTSIDE_APPLICABILITY = false as const;
export const STRESS_EVIDENCE_AUTO_PROMOTED_TO_VALIDATED = false as const;
export const SUPPORT_EVIDENCE_AUTO_PROMOTED_TO_STRUCTURAL_ADEQUATE = false as const;
export const NDE_EVIDENCE_AUTO_PROMOTED_TO_CODE_CONFORMANT = false as const;
export const TEST_EVIDENCE_AUTO_PROMOTED_TO_ENGINEERING_VALIDATED = false as const;
export const AI_CAN_INVENT_AUTHORITATIVE_D5_STRESS_EVIDENCE = false as const;
export const AI_CAN_INVENT_AUTHORITATIVE_D5_SUPPORT_REQUIREMENT = false as const;
export const AI_CAN_INVENT_AUTHORITATIVE_D5_NDE_RESULT = false as const;
export const AI_CAN_INVENT_AUTHORITATIVE_D5_TEST_RESULT = false as const;
export const D5_R6_PROVENANCE_REQUIRED = true as const;
export const D5_R6_PROVENANCE_PRESERVED = true as const;
export const D5_R6_AUTO_REPOINTED = false as const;
export const SILENT_D5_R6_MUTATION_ALLOWED = false as const;
export const D5_R6_HISTORY_PRESERVED = true as const;
export const TENANT_WORKSPACE_PROJECT_D5_R6_SCOPE_ENFORCED = true as const;
export const D5_R6_DUPLICATE_GOVERNANCE_IMPLEMENTED = true as const;
export const D5_R6_REPLAY_PROTECTION_IMPLEMENTED = true as const;
export const D5_R6_SPOOFING_PROTECTION_IMPLEMENTED = true as const;
export const D6_RUNTIME_STARTED = false as const;
export const D7_RUNTIME_STARTED = false as const;
export const D8_RUNTIME_STARTED = false as const;
export const D9_RUNTIME_STARTED = false as const;
export const D9_RUNTIME_COUNT = 0 as const;
export const UNAUTHORIZED_D1_PACK_COMPLETION = false as const;
export const UNAUTHORIZED_D2_REOPEN = false as const;
export const UNAUTHORIZED_D3_REOPEN = false as const;
export const UNAUTHORIZED_D4_REOPEN = false as const;
export const UNAUTHORIZED_D5_R7_R12_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_D6_D8_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_D9_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_STRESS_CALCULATION_PROMOTION = false as const;
export const UNAUTHORIZED_SUPPORT_CALCULATION_PROMOTION = false as const;
export const UNAUTHORIZED_STRUCTURAL_VALIDATION_PROMOTION = false as const;
export const UNAUTHORIZED_NDE_CONFORMANCE_PROMOTION = false as const;
export const UNAUTHORIZED_TEST_VALIDATION_PROMOTION = false as const;
export const UNAUTHORIZED_PIPING_VALIDATION_PROMOTION = false as const;
export const UNAUTHORIZED_CROSS_DISCIPLINE_REASONING_PROMOTION = false as const;
export const UNAUTHORIZED_GA_PROMOTION = false as const;
export const UNAUTHORIZED_PRODUCT_CLAIM = false as const;
export const D5_R7_CANONICAL_PHASE = D5_IMPLEMENTATION_PHASES[6];
export const D5_R7_PHASE_TYPE = D5_IMPLEMENTATION_PHASE_TYPES[6];
export const D5_R7_CANONICAL_SCOPE =
  "Implement canonical Piping requirement, assumption, engineering-decision, change, supersession and reassessment governance across exact R1-R6 revisions. Reuse canonical EOS governance and explicit dependency semantics. Changes may mark affected exact records stale or requiring reassessment but must not automatically recalculate hydraulics, wall thickness, stress/flexibility, supports, routing, components or test results, and must not automatically validate, approve or determine conformance." as const;
export const D5_R7_STARTED = false as const;
export const D5_R6_READY_FOR_NEXT_PHASE = true as const;
export const D5_R6_NEXT_PHASE = D5_R7_CANONICAL_PHASE;
export const D5_R6_NEXT_PHASE_TYPE = D5_R7_PHASE_TYPE;
export const D5_R6_CANONICAL_NEXT_PHASE = D5_R7_CANONICAL_PHASE;
export const D5_R6_CANONICAL_NEXT_PHASE_SCOPE = D5_R7_CANONICAL_SCOPE;
export const D5_R6_BLOCKER = "NONE" as const;
export const D5_R6_MACHINE_READABLE_ROADMAP_UPDATED = true as const;
export const D5_R6_SUPPORT_FUNCTIONS = ["GUIDE", "ANCHOR", "LINE_STOP", "SPRING", "OTHER_SUPPORT"] as const;
export const D5_R6_NDE_METHODS = ["RT", "UT", "MT", "PT", "VT", "OTHER_NDE"] as const;
export const D5_R6_TEST_KINDS = ["HYDROTEST", "PNEUMATIC", "LEAK", "TEST_PACK"] as const;
export const D5_R6_SOURCE_BASIS_CATEGORIES = [
  "EXTERNAL_ANALYSIS",
  "R3_DESIGN_CONDITION",
  "PROJECT_PIPING_DATA",
  "INSPECTION_EVIDENCE",
  "NDE_EVIDENCE",
  "TEST_EVIDENCE",
  "AUTHORIZED_PIPING_ENGINEERING_INPUT",
] as const;

export {
  STRESS_ANALYSIS_RESULT_EQUALS_VALIDATED_PIPING_DESIGN,
  STRESS_ANALYSIS_RESULT_EQUALS_STRUCTURAL_SUPPORT_VALIDATION,
  PIPING_SUPPORT_REQUIREMENT_EQUALS_STRUCTURAL_SUPPORT_DESIGN,
  PIPING_SUPPORT_CONTEXT_EQUALS_STRUCTURAL_ADEQUACY,
  TEST_REQUIREMENT_EQUALS_TEST_COMPLETED,
  NDE_RESULT_EQUALS_CODE_CONFORMANCE,
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
  D5_PIPING_STRESS_CALCULATION_RUNTIME_COUNT,
  D5_FLEXIBILITY_CALCULATION_RUNTIME_COUNT,
  D5_SUPPORT_LOAD_CALCULATION_RUNTIME_COUNT,
  D5_PIPE_SIZING_RUNTIME_COUNT,
  D5_HYDRAULIC_CALCULATION_RUNTIME_COUNT,
  D5_PRESSURE_DROP_CALCULATION_RUNTIME_COUNT,
  D5_WALL_THICKNESS_CALCULATION_RUNTIME_COUNT,
  D5_BRANCH_REINFORCEMENT_CALCULATION_RUNTIME_COUNT,
  D5_FLANGE_RATING_CALCULATION_RUNTIME_COUNT,
  D5_VALVE_SIZING_RUNTIME_COUNT,
  D5_COMPONENT_SIZING_RUNTIME_COUNT,
  D5_AUTOMATIC_ROUTING_RUNTIME_COUNT,
  D5_ROUTE_OPTIMIZATION_RUNTIME_COUNT,
  D5_SPATIAL_CLASH_DETECTION_RUNTIME_COUNT,
  D5_GEOMETRY_SOLVER_RUNTIME_COUNT,
  D5_CONSTRUCTABILITY_DETERMINATION_RUNTIME_COUNT,
  D5_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_COUNT,
  D5_DISCIPLINE_INTERFACE_RUNTIME_COUNT,
  D5_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_COUNT,
  D5_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT,
  D5_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
  D5_D9_RUNTIME_INTEGRATION_COUNT,
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
  "inferred", "route_geometry", "nearby_structure", "ai_reasoning", "stress_evidence", "proximity", "all", "global",
]);

type MeasureInput = { value?: string | null; unit?: string | null; normalizedUnit?: string | null } | null | undefined;
type Measure = { value: string; unit: string };
type SubjectKind = "STRESS" | "SUPPORT" | "INSPECTION" | "NDE" | "TEST";
type Prohibited = {
  calculateStress?: boolean;
  calculateFlexibility?: boolean;
  calculateSupportLoad?: boolean;
  hiddenCalculation?: boolean;
  autoSelectSupport?: boolean;
  autoSelectRestraint?: boolean;
  deriveLocation?: boolean;
  structuralDesign?: boolean;
  structuralValidation?: boolean;
  promoteValidated?: boolean;
  promoteAdequate?: boolean;
  promoteConformant?: boolean;
  analysisExecuted?: boolean;
  analysisValidated?: boolean;
  mutateCondition?: boolean;
  mutateWeld?: boolean;
  markWeldAccepted?: boolean;
  propagate?: boolean;
  engineeringValidated?: boolean;
  codeConformant?: boolean;
  redesignRoute?: boolean;
  inspectionCompleted?: boolean;
  inspectionPassed?: boolean;
  ndeCompleted?: boolean;
  ndeAccepted?: boolean;
  testCompleted?: boolean;
  testPassed?: boolean;
};

export type D5R6BoundInput = Prohibited & {
  contextId: string;
  objectId: string;
  objectRevisionFingerprint: string;
  lineRecordId: string;
  lineContextFingerprint: string;
  conditionId: string;
  conditionRevisionFingerprint: string;
  componentRecordId: string;
  componentRevisionFingerprint: string;
  connectionRecordId: string;
  connectionRevisionFingerprint: string;
  routeRecordId: string;
  routeRevisionFingerprint: string;
  weldRecordId?: string | null;
  weldRevisionFingerprint?: string | null;
  citedLifecycleStage: string;
  citedCurrentness: string;
  provenanceRef: string;
  sourceBasisRef: string;
  sourceBasisCategory: string;
  applicabilityRef: string;
  limitations: string;
  identityBasis: string;
  assertedFingerprint?: string;
  tenantId?: string;
  workspaceId?: string;
  projectId?: string;
  predecessorId?: string | null;
};

type Bound = {
  objectId: string;
  objectRevisionFingerprint: string;
  lineRecordId: string;
  lineContextFingerprint: string;
  conditionId: string;
  conditionRevisionFingerprint: string;
  componentRecordId: string;
  componentRevisionFingerprint: string;
  connectionRecordId: string;
  connectionRevisionFingerprint: string;
  routeRecordId: string;
  routeRevisionFingerprint: string;
  weldRecordId: string | null;
  weldRevisionFingerprint: string | null;
  applicabilityRef: string;
  limitations: string;
  sourceBasisRef: string;
  sourceBasisCategory: (typeof D5_R6_SOURCE_BASIS_CATEGORIES)[number];
  provenanceRef: string;
  citedCurrentness: (typeof D5_CURRENTNESS_STATES)[number];
};

type Status = {
  fingerprint: string;
  recordedBy: string;
  recordedAt: string;
  recordStatus: "CURRENT" | "SUPERSEDED";
  currentness: "CURRENT" | "SUPERSEDED";
  predecessorId: string | null;
  tenantId: string;
};

export type D5R6StressInput = D5R6BoundInput & {
  evidenceRecordId: string;
  analysisReference: string;
  loadCaseId: string;
  toolIdentity: string;
  modelRevision: string;
  sourceAuthority: string;
  evidenceVersion: string;
  assumptions: string;
  stressResult: MeasureInput;
  displacementResult?: MeasureInput;
  allowableReference?: string | null;
};

export type D5R6StressRecord = Bound & Status & {
  evidenceRecordId: string;
  analysisReference: string;
  loadCaseId: string;
  toolIdentity: string;
  modelRevision: string;
  sourceAuthority: string;
  evidenceVersion: string;
  assumptions: string;
  stressResult: Measure;
  displacementResult: Measure | null;
  allowableReference: string | null;
  analysisExecuted: false;
  analysisValidated: false;
  validatedPipingDesign: false;
  codeConformance: false;
  structuralSupportValidation: false;
  eosValidation: false;
  calculated: false;
};

export type D5R6SupportInput = D5R6BoundInput & {
  supportRecordId: string;
  supportFunction: string;
  supportLocation: string;
  loadReference?: MeasureInput;
};

export type D5R6SupportRecord = Bound & Status & {
  supportRecordId: string;
  supportFunction: (typeof D5_R6_SUPPORT_FUNCTIONS)[number];
  supportLocation: string;
  loadReference: Measure | null;
  structuralDesign: false;
  structuralAdequacy: false;
  structuralValidation: false;
  automaticSelection: false;
};

export type D5R6InspectionInput = D5R6BoundInput & {
  inspectionRecordId: string;
  inspectionRequirement: string;
};

export type D5R6InspectionRecord = Bound & Status & {
  inspectionRecordId: string;
  inspectionRequirement: string;
  inspectionCompleted: false;
  inspectionPassed: false;
};

export type D5R6NdeInput = D5R6BoundInput & {
  ndeRecordId: string;
  ndeMethod: string;
  extent: string;
  observedStatus: string;
  evidenceRevision: string;
};

export type D5R6NdeRecord = Bound & Status & {
  ndeRecordId: string;
  ndeMethod: (typeof D5_R6_NDE_METHODS)[number];
  extent: string;
  observedStatus: string;
  evidenceRevision: string;
  ndeCompleted: false;
  ndeAccepted: false;
  codeConformance: false;
  engineeringValidated: false;
  weldMarkedAccepted: false;
};

export type D5R6TestInput = D5R6BoundInput & {
  testRecordId: string;
  testKind: string;
  testReference: string;
  observedStatus: string;
  evidenceRef: string;
  testPressure?: MeasureInput;
};

export type D5R6TestRecord = Bound & Status & {
  testRecordId: string;
  testKind: (typeof D5_R6_TEST_KINDS)[number];
  testReference: string;
  observedStatus: string;
  evidenceRef: string;
  testPressure: Measure | null;
  testCompleted: false;
  testPassed: false;
  engineeringValidated: false;
  codeConformance: false;
};

export type D5R6History = {
  historyId: string;
  subjectKind: SubjectKind;
  subjectId: string;
  action: "CREATED" | "SUPERSEDED";
  fingerprint: string;
  recordedAt: string;
};

export type D5R6Store = {
  r5: D5R5Store;
  now: () => string;
  stressEvidence: D5R6StressRecord[];
  supports: D5R6SupportRecord[];
  inspections: D5R6InspectionRecord[];
  nde: D5R6NdeRecord[];
  tests: D5R6TestRecord[];
  history: D5R6History[];
};

function fail(code: string): never {
  throw new Error(`D5_R6_${code}`);
}

function blockedParty(value: string): boolean {
  return /^AI(?:\b|_)/i.test(value) || /LLM/i.test(value) || /OPTIMIZER/i.test(value);
}

function explicit(value: string, code: string): string {
  const token = value.trim();
  if (!token || FLOATING.has(token.toLowerCase()) || INFERRED.has(token.toLowerCase()) || blockedParty(token)) fail(code);
  if (/[=]|calc\(|solve\(/i.test(token)) fail("CALCULATION_NOT_IN_R6");
  return token;
}

function assertActor(actor: D5R1Actor): void {
  if (!actor.actorId.trim() || !actor.tenantId.trim() || !actor.workspaceId.trim() || !actor.projectId.trim()) fail("SCOPE_REQUIRED");
  if (blockedParty(actor.actorId) || blockedParty(actor.authority)) fail("AI_NOT_PIPING_AUTHORITY");
  if (actor.authority === "ADMINISTRATOR" || actor.authority === "ADMIN") fail("ADMIN_NOT_PIPING_AUTHORITY");
  if (actor.authority !== D5_CONTEXT_AUTHORITY) fail("UNAUTHORIZED");
}

function assertProhibited(input: Prohibited): void {
  if (input.calculateStress === true || input.calculateFlexibility === true || input.calculateSupportLoad === true || input.hiddenCalculation === true) fail("CALCULATION_NOT_IN_R6");
  if (input.autoSelectSupport === true || input.autoSelectRestraint === true || input.deriveLocation === true) fail("AUTOMATIC_SUPPORT_REJECTED");
  if (input.structuralDesign === true || input.structuralValidation === true) fail("STRUCTURAL_AUTHORITY_NOT_IN_R6");
  if (input.promoteValidated === true || input.promoteAdequate === true || input.promoteConformant === true || input.engineeringValidated === true || input.codeConformant === true) fail("EVIDENCE_NOT_PROMOTED");
  if (input.analysisExecuted === true || input.analysisValidated === true) fail("LOAD_CASE_NOT_EXECUTION");
  if (input.mutateCondition === true || input.mutateWeld === true || input.markWeldAccepted === true) fail("UPSTREAM_MUTATION_REJECTED");
  if (input.propagate === true) fail("AUTO_PROPAGATION_REJECTED");
  if (input.redesignRoute === true) fail("ROUTING_NOT_IN_R6");
  if (input.inspectionCompleted === true || input.inspectionPassed === true || input.ndeCompleted === true || input.ndeAccepted === true || input.testCompleted === true || input.testPassed === true) fail("REQUIREMENT_NOT_RESULT");
}

function evidence(input: MeasureInput, required: boolean): Measure | null {
  if (!input || (input.value == null && input.unit == null && input.normalizedUnit == null)) return required ? fail("EVIDENCE_VALUE_REQUIRED") : null;
  if (input.normalizedUnit != null && input.normalizedUnit !== "") fail("UNIT_CHANGE_REJECTED");
  const value = explicit(input.value ?? "", "EVIDENCE_VALUE_REQUIRED");
  if (!input.unit?.trim()) fail("UNITS_REQUIRED");
  return { value, unit: explicit(input.unit, "UNIT_INVALID") };
}

function remember(store: D5R6Store, subjectKind: SubjectKind, subjectId: string, action: D5R6History["action"], fingerprint: string): void {
  store.history.push({ historyId: `hist-${store.history.length + 1}`, subjectKind, subjectId, action, fingerprint, recordedAt: store.now() });
}

function prepare(store: D5R6Store, actor: D5R1Actor, input: D5R6BoundInput, allowedTypes: readonly string[], weldRequired: boolean): Bound {
  assertActor(actor);
  assertProhibited(input);
  if (input.tenantId != null && input.tenantId !== actor.tenantId) fail("CROSS_TENANT_OPERATION");
  if (input.workspaceId != null && input.workspaceId !== actor.workspaceId) fail("CROSS_WORKSPACE_OPERATION");
  if (input.projectId != null && input.projectId !== actor.projectId) fail("CROSS_PROJECT_OPERATION");
  if (input.identityBasis.trim() !== "EXPLICIT") fail("INFERRED_EVIDENCE_REJECTED");
  const cited = input.citedCurrentness.trim();
  if (!(D5_CURRENTNESS_STATES as readonly string[]).includes(cited)) fail("CURRENTNESS_INVALID");
  if (!(D5_MATURITY_STATES as readonly string[]).includes(input.citedLifecycleStage.trim())) fail("MATURITY_STAGE_INVALID");
  const objectId = explicit(input.objectId, "R1_OBJECT_REQUIRED");
  const revision = explicit(input.objectRevisionFingerprint, "R1_REVISION_REQUIRED");
  const object = store.r5.r4.r1.objects.find((row) => row.objectId === objectId);
  if (!object || object.fingerprint !== revision) fail(object ? "R1_REVISION_MISMATCH" : "R1_OBJECT_NOT_FOUND");
  if (!allowedTypes.includes(object.objectType)) fail("R1_OBJECT_TYPE_MISMATCH");
  if (object.tenantId !== actor.tenantId) fail("CROSS_SCOPE_OPERATION");
  if (cited === "CURRENT" && object.recordStatus !== "CURRENT") fail("R1_OBJECT_NOT_CURRENT");
  const line = store.r5.r4.r2.lines.find((row) => row.lineRecordId === explicit(input.lineRecordId, "R2_LINE_REQUIRED"));
  const lineRevision = explicit(input.lineContextFingerprint, "R2_REVISION_REQUIRED");
  if (!line || line.fingerprint !== lineRevision) fail(line ? "R2_REVISION_MISMATCH" : "R2_LINE_NOT_FOUND");
  if (line.tenantId !== actor.tenantId) fail("CROSS_SCOPE_OPERATION");
  const condition = store.r5.r4.r3.conditions.find((row) => row.conditionId === explicit(input.conditionId, "R3_CONDITION_REQUIRED"));
  const conditionRevision = explicit(input.conditionRevisionFingerprint, "R3_CONDITION_REVISION_REQUIRED");
  if (!condition || condition.fingerprint !== conditionRevision) fail(condition ? "R3_CONDITION_REVISION_MISMATCH" : "R3_CONDITION_NOT_FOUND");
  if (condition.tenantId !== actor.tenantId) fail("CROSS_SCOPE_OPERATION");
  if (cited === "CURRENT" && condition.recordStatus !== "CURRENT") fail("R3_CONDITION_NOT_CURRENT");
  const component = store.r5.r4.components.find((row) => row.componentRecordId === explicit(input.componentRecordId, "R4_COMPONENT_REQUIRED"));
  const componentRevision = explicit(input.componentRevisionFingerprint, "R4_COMPONENT_REVISION_REQUIRED");
  if (!component || component.fingerprint !== componentRevision) fail(component ? "R4_COMPONENT_REVISION_MISMATCH" : "R4_COMPONENT_NOT_FOUND");
  const connection = store.r5.r4.connections.find((row) => row.connectionRecordId === explicit(input.connectionRecordId, "R4_CONNECTION_REQUIRED"));
  const connectionRevision = explicit(input.connectionRevisionFingerprint, "R4_CONNECTION_REVISION_REQUIRED");
  if (!connection || connection.fingerprint !== connectionRevision) fail(connection ? "R4_CONNECTION_REVISION_MISMATCH" : "R4_CONNECTION_NOT_FOUND");
  const route = store.r5.routes.find((row) => row.routeRecordId === explicit(input.routeRecordId, "R5_ROUTE_REQUIRED"));
  const routeRevision = explicit(input.routeRevisionFingerprint, "R5_ROUTE_REVISION_REQUIRED");
  if (!route || route.fingerprint !== routeRevision) fail(route ? "R5_ROUTE_REVISION_MISMATCH" : "R5_ROUTE_NOT_FOUND");
  if (route.tenantId !== actor.tenantId) fail("CROSS_SCOPE_OPERATION");
  let weldRecordId: string | null = null;
  let weldRevisionFingerprint: string | null = null;
  if (weldRequired || input.weldRecordId) {
    const weld = store.r5.welds.find((row) => row.weldRecordId === explicit(input.weldRecordId ?? "", "R5_WELD_REQUIRED"));
    const weldRevision = explicit(input.weldRevisionFingerprint ?? "", "R5_WELD_REVISION_REQUIRED");
    if (!weld || weld.fingerprint !== weldRevision) fail(weld ? "R5_WELD_REVISION_MISMATCH" : "R5_WELD_NOT_FOUND");
    if (weld.tenantId !== actor.tenantId) fail("CROSS_SCOPE_OPERATION");
    weldRecordId = weld.weldRecordId;
    weldRevisionFingerprint = weld.fingerprint;
  }
  const applicabilityRef = explicit(input.applicabilityRef, "APPLICABILITY_REQUIRED");
  if (applicabilityRef !== object.objectId) fail("APPLICABILITY_MISMATCH");
  const sourceBasisCategory = explicit(input.sourceBasisCategory, "SOURCE_BASIS_REQUIRED");
  if (!(D5_R6_SOURCE_BASIS_CATEGORIES as readonly string[]).includes(sourceBasisCategory)) fail("SOURCE_BASIS_NOT_ALLOWLISTED");
  return {
    objectId: object.objectId,
    objectRevisionFingerprint: object.fingerprint,
    lineRecordId: line.lineRecordId,
    lineContextFingerprint: line.fingerprint,
    conditionId: condition.conditionId,
    conditionRevisionFingerprint: condition.fingerprint,
    componentRecordId: component.componentRecordId,
    componentRevisionFingerprint: component.fingerprint,
    connectionRecordId: connection.connectionRecordId,
    connectionRevisionFingerprint: connection.fingerprint,
    routeRecordId: route.routeRecordId,
    routeRevisionFingerprint: route.fingerprint,
    weldRecordId,
    weldRevisionFingerprint,
    applicabilityRef,
    limitations: explicit(input.limitations, "LIMITATIONS_REQUIRED"),
    sourceBasisRef: explicit(input.sourceBasisRef, "SOURCE_BASIS_REQUIRED"),
    sourceBasisCategory: sourceBasisCategory as Bound["sourceBasisCategory"],
    provenanceRef: explicit(input.provenanceRef, "MISSING_PROVENANCE"),
    citedCurrentness: cited as Bound["citedCurrentness"],
  };
}

function stamp(store: D5R6Store, actor: D5R1Actor, fingerprint: string, predecessorId: string | null): Status {
  return { fingerprint, recordedBy: actor.actorId, recordedAt: store.now(), recordStatus: "CURRENT", currentness: "CURRENT", predecessorId, tenantId: actor.tenantId };
}

export function createD5R6Store(r5: D5R5Store, now: () => string = () => "2026-10-24T00:00:00.000Z"): D5R6Store {
  return { r5, now, stressEvidence: [], supports: [], inspections: [], nde: [], tests: [], history: [] };
}

export function recordPipingStressFlexibilityEvidence(store: D5R6Store, actor: D5R1Actor, input: D5R6StressInput): D5R6StressRecord {
  const bound = prepare(store, actor, input, ["PIPING_STRESS_FLEXIBILITY_CONTEXT"], false);
  const evidenceRecordId = explicit(input.evidenceRecordId, "EVIDENCE_REQUIRED");
  const stressResult = evidence(input.stressResult, true);
  if (!stressResult) fail("EVIDENCE_VALUE_REQUIRED");
  const displacementResult = evidence(input.displacementResult, false);
  const predecessor = input.predecessorId ? store.stressEvidence.find((row) => row.evidenceRecordId === input.predecessorId) : null;
  if (input.predecessorId && (!predecessor || predecessor.recordStatus !== "CURRENT" || predecessor.objectId !== bound.objectId)) fail("PREDECESSOR_NOT_CURRENT");
  const payload = {
    evidenceRecordId,
    analysisReference: explicit(input.analysisReference, "ANALYSIS_REFERENCE_REQUIRED"),
    loadCaseId: explicit(input.loadCaseId, "LOAD_CASE_REQUIRED"),
    toolIdentity: explicit(input.toolIdentity, "TOOL_IDENTITY_REQUIRED"),
    modelRevision: explicit(input.modelRevision, "MODEL_REVISION_REQUIRED"),
    sourceAuthority: explicit(input.sourceAuthority, "SOURCE_AUTHORITY_REQUIRED"),
    evidenceVersion: explicit(input.evidenceVersion, "EVIDENCE_VERSION_REQUIRED"),
    assumptions: explicit(input.assumptions, "ASSUMPTIONS_REQUIRED"),
    stressResult,
    displacementResult,
    allowableReference: input.allowableReference == null || input.allowableReference === "" ? null : explicit(input.allowableReference, "ALLOWABLE_REFERENCE_INVALID"),
    ...bound,
    predecessorId: predecessor?.evidenceRecordId ?? null,
  };
  const fingerprint = fingerprintCanonical(payload);
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.stressEvidence.find((row) => row.evidenceRecordId === evidenceRecordId);
  if (existing) return existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId ? existing : fail("DUPLICATE_STRESS_EVIDENCE_REJECTED");
  const duplicate = store.stressEvidence.find((row) => row.recordStatus === "CURRENT" && row.evidenceRecordId !== predecessor?.evidenceRecordId && row.objectId === bound.objectId && row.loadCaseId === payload.loadCaseId && row.objectRevisionFingerprint === bound.objectRevisionFingerprint);
  if (duplicate) fail("DUPLICATE_STRESS_EVIDENCE_REJECTED");
  const record: D5R6StressRecord = Object.freeze({
    ...payload,
    analysisExecuted: false,
    analysisValidated: false,
    validatedPipingDesign: false,
    codeConformance: false,
    structuralSupportValidation: false,
    eosValidation: false,
    calculated: false,
    ...stamp(store, actor, fingerprint, predecessor?.evidenceRecordId ?? null),
  });
  if (predecessor) {
    const index = store.stressEvidence.findIndex((row) => row.evidenceRecordId === predecessor.evidenceRecordId);
    const superseded = Object.freeze({ ...predecessor, recordStatus: "SUPERSEDED" as const, currentness: "SUPERSEDED" as const });
    store.stressEvidence[index] = superseded;
    remember(store, "STRESS", superseded.evidenceRecordId, "SUPERSEDED", superseded.fingerprint);
  }
  store.stressEvidence.push(record);
  remember(store, "STRESS", record.evidenceRecordId, "CREATED", record.fingerprint);
  return record;
}

export function recordPipingSupportRestraintContext(store: D5R6Store, actor: D5R1Actor, input: D5R6SupportInput): D5R6SupportRecord {
  const bound = prepare(store, actor, input, ["PIPING_SUPPORT_REQUIREMENT_CONTEXT"], false);
  const supportRecordId = explicit(input.supportRecordId, "SUPPORT_REQUIRED");
  const supportFunction = explicit(input.supportFunction, "SUPPORT_FUNCTION_REQUIRED");
  if (!(D5_R6_SUPPORT_FUNCTIONS as readonly string[]).includes(supportFunction)) fail("SUPPORT_FUNCTION_NOT_ALLOWLISTED");
  const supportLocation = explicit(input.supportLocation, "SUPPORT_LOCATION_REQUIRED");
  const loadReference = evidence(input.loadReference, false);
  const fingerprint = fingerprintCanonical({ supportRecordId, supportFunction, supportLocation, loadReference, ...bound });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.supports.find((row) => row.supportRecordId === supportRecordId);
  if (existing) return existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId ? existing : fail("DUPLICATE_SUPPORT_REJECTED");
  const record: D5R6SupportRecord = Object.freeze({
    ...bound, supportRecordId, supportFunction: supportFunction as D5R6SupportRecord["supportFunction"], supportLocation, loadReference,
    structuralDesign: false, structuralAdequacy: false, structuralValidation: false, automaticSelection: false,
    ...stamp(store, actor, fingerprint, null),
  });
  store.supports.push(record);
  remember(store, "SUPPORT", record.supportRecordId, "CREATED", record.fingerprint);
  return record;
}

export function recordPipingInspectionRequirement(store: D5R6Store, actor: D5R1Actor, input: D5R6InspectionInput): D5R6InspectionRecord {
  const bound = prepare(store, actor, input, ["PIPING_TEST_INSPECTION_CONTEXT"], false);
  const inspectionRecordId = explicit(input.inspectionRecordId, "INSPECTION_REQUIRED");
  const inspectionRequirement = explicit(input.inspectionRequirement, "INSPECTION_REQUIREMENT_REQUIRED");
  const fingerprint = fingerprintCanonical({ inspectionRecordId, inspectionRequirement, ...bound });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.inspections.find((row) => row.inspectionRecordId === inspectionRecordId);
  if (existing) return existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId ? existing : fail("DUPLICATE_INSPECTION_REJECTED");
  const record: D5R6InspectionRecord = Object.freeze({
    ...bound, inspectionRecordId, inspectionRequirement, inspectionCompleted: false, inspectionPassed: false, ...stamp(store, actor, fingerprint, null),
  });
  store.inspections.push(record);
  remember(store, "INSPECTION", record.inspectionRecordId, "CREATED", record.fingerprint);
  return record;
}

export function recordPipingNdeContext(store: D5R6Store, actor: D5R1Actor, input: D5R6NdeInput): D5R6NdeRecord {
  const bound = prepare(store, actor, input, ["PIPING_TEST_INSPECTION_CONTEXT"], true);
  const ndeRecordId = explicit(input.ndeRecordId, "NDE_REQUIRED");
  const ndeMethod = explicit(input.ndeMethod, "NDE_METHOD_REQUIRED");
  if (!(D5_R6_NDE_METHODS as readonly string[]).includes(ndeMethod)) fail("NDE_METHOD_NOT_ALLOWLISTED");
  const extent = explicit(input.extent, "NDE_EXTENT_REQUIRED");
  const observedStatus = explicit(input.observedStatus, "NDE_STATUS_REQUIRED");
  const evidenceRevision = explicit(input.evidenceRevision, "NDE_EVIDENCE_REVISION_REQUIRED");
  const fingerprint = fingerprintCanonical({ ndeRecordId, ndeMethod, extent, observedStatus, evidenceRevision, ...bound });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.nde.find((row) => row.ndeRecordId === ndeRecordId);
  if (existing) return existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId ? existing : fail("DUPLICATE_NDE_REJECTED");
  const record: D5R6NdeRecord = Object.freeze({
    ...bound, ndeRecordId, ndeMethod: ndeMethod as D5R6NdeRecord["ndeMethod"], extent, observedStatus, evidenceRevision,
    ndeCompleted: false, ndeAccepted: false, codeConformance: false, engineeringValidated: false, weldMarkedAccepted: false,
    ...stamp(store, actor, fingerprint, null),
  });
  store.nde.push(record);
  remember(store, "NDE", record.ndeRecordId, "CREATED", record.fingerprint);
  return record;
}

export function recordPipingPressureLeakTestContext(store: D5R6Store, actor: D5R1Actor, input: D5R6TestInput): D5R6TestRecord {
  const bound = prepare(store, actor, input, ["PIPING_TEST_INSPECTION_CONTEXT"], false);
  const testRecordId = explicit(input.testRecordId, "TEST_REQUIRED");
  const testKind = explicit(input.testKind, "TEST_KIND_REQUIRED");
  if (!(D5_R6_TEST_KINDS as readonly string[]).includes(testKind)) fail("TEST_KIND_NOT_ALLOWLISTED");
  const testReference = explicit(input.testReference, "TEST_REFERENCE_REQUIRED");
  const observedStatus = explicit(input.observedStatus, "TEST_STATUS_REQUIRED");
  const evidenceRef = explicit(input.evidenceRef, "TEST_EVIDENCE_REQUIRED");
  const testPressure = evidence(input.testPressure, false);
  const fingerprint = fingerprintCanonical({ testRecordId, testKind, testReference, observedStatus, evidenceRef, testPressure, ...bound });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.tests.find((row) => row.testRecordId === testRecordId);
  if (existing) return existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId ? existing : fail("DUPLICATE_TEST_REJECTED");
  const record: D5R6TestRecord = Object.freeze({
    ...bound, testRecordId, testKind: testKind as D5R6TestRecord["testKind"], testReference, observedStatus, evidenceRef, testPressure,
    testCompleted: false, testPassed: false, engineeringValidated: false, codeConformance: false, ...stamp(store, actor, fingerprint, null),
  });
  store.tests.push(record);
  remember(store, "TEST", record.testRecordId, "CREATED", record.fingerprint);
  return record;
}

export function mutatePipingEvidence(): never {
  return fail("CONTEXT_MUTATION_REJECTED");
}

export function repointPipingEvidence(): never {
  return fail("AUTO_REPOINT_REJECTED");
}

export function calculatePipingStress(): never {
  return fail("CALCULATION_NOT_IN_R6");
}

export function selectPipingSupport(): never {
  return fail("AUTOMATIC_SUPPORT_REJECTED");
}

export function validatePipingEngineering(): never {
  return fail("VALIDATION_NOT_IN_R6");
}

export function determinePipingConformance(): never {
  return fail("CONFORMANCE_NOT_IN_R6");
}

export function recordPipingRequirement(): never {
  return fail("REQUIREMENTS_NOT_IN_R6");
}
