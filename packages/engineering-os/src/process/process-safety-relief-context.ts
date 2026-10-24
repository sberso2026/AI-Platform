/**
 * EOS-D6-R6 Process safety and relief context.
 * One bounded runtime on exact R1-R5 revisions. Supplied safety context only.
 */
import {
  D4_MECHANICAL_OBJECT_TYPES,
  D6_CURRENTNESS_STATES,
  D6_IMPLEMENTATION_PHASE_TYPES,
  D6_IMPLEMENTATION_PHASES,
  D6_MATURITY_STATES,
  PROCESS_HAZARD_FINDING_EQUALS_APPROVED_SAFEGUARD,
  PROCESS_SAFETY_CONTEXT_EQUALS_FUNCTIONAL_SAFETY_VALIDATION,
  RELIEF_REQUIREMENT_EQUALS_VALIDATED_RELIEF_DEVICE_SELECTION,
  RELIEF_SCENARIO_EQUALS_RELIEF_DEVICE_DESIGN,
} from "@rtb/types";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import type { D4R1Store } from "../mechanical/identity-foundation";
import {
  D6_CONTEXT_AUTHORITY,
  D6_DISCIPLINE,
  type D6R1Actor,
  type D6R1ObjectRecord,
} from "./identity-foundation";
import {
  ADMIN_EQUALS_D6_PROCESS_ENGINEERING_AUTHORITY,
  AI_EQUALS_D6_PROCESS_ENGINEERING_AUTHORITY,
  D1_STRUCTURAL_PACK_COMPLETE,
  D1N_REOPENED,
  D2_REOPENED,
  D2_TRACK_COMPLETE,
  D3_REOPENED,
  D3_TRACK_COMPLETE,
  D4_REOPENED,
  D4_TRACK_COMPLETE,
  D5_REOPENED,
  D5_TRACK_COMPLETE,
  D6_APPROVAL_RUNTIME_COUNT,
  D6_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT,
  D6_AUTOMATIC_PROCESS_CALCULATION_RUNTIME_COUNT,
  D6_AUTOMATIC_REDESIGN_RUNTIME_COUNT,
  D6_CERTIFICATION_RUNTIME_COUNT,
  D6_CONFORMANCE_DETERMINATION_RUNTIME_COUNT,
  D6_CROSS_DISCIPLINE_CONFLICT_DETECTION_RUNTIME_COUNT,
  D6_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT,
  D6_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT,
  D6_CROSS_DISCIPLINE_RECOMMENDATION_RUNTIME_COUNT,
  D6_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT,
  D6_D9_RUNTIME_INTEGRATION_COUNT,
  D6_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
  D6_DEPRESSURING_CALCULATION_RUNTIME_COUNT,
  D6_DESIGN_BASIS_CONDITION_RUNTIME_READY,
  D6_DISCIPLINE_INTERFACE_RUNTIME_COUNT,
  D6_ENERGY_BALANCE_CALCULATION_RUNTIME_COUNT,
  D6_EQUALS_D1_STRUCTURAL_AUTHORITY,
  D6_EQUALS_D2_CIVIL_AUTHORITY,
  D6_EQUALS_D3_GEOTECHNICAL_AUTHORITY,
  D6_EQUALS_D4_MECHANICAL_AUTHORITY,
  D6_EQUALS_D5_PIPING_AUTHORITY,
  D6_EQUALS_D7_ELECTRICAL_AUTHORITY,
  D6_EQUALS_D8_INSTRUMENTATION_CONTROL_AUTHORITY,
  D6_EQUIPMENT_DUTY_CALCULATION_RUNTIME_COUNT,
  D6_EQUIPMENT_DUTY_RUNTIME_READY as R5_DUTY_READY,
  D6_HYDRAULIC_CALCULATION_RUNTIME_COUNT,
  D6_MASS_BALANCE_CALCULATION_RUNTIME_COUNT,
  D6_PRESSURE_DROP_CALCULATION_RUNTIME_COUNT,
  D6_PROCESS_CALCULATION_RUNTIME_COUNT,
  D6_PROCESS_EVIDENCE_RUNTIME_READY,
  D6_PROCESS_IDENTITY_RUNTIME_READY,
  D6_R1_IDENTITY_REUSED,
  D6_R2_SYSTEM_STREAM_SERVICE_CONTEXT_REUSED,
  D6_R3_DESIGN_BASIS_CONDITION_CONTEXT_REUSED,
  D6_R4_PROCESS_EVIDENCE_CONTEXT_REUSED,
  D6_RELIEF_CALCULATION_RUNTIME_COUNT,
  D6_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_COUNT,
  D6_REUSES_CANONICAL_CURRENTNESS,
  D6_REUSES_CANONICAL_DIGITAL_THREAD,
  D6_REUSES_CANONICAL_FINGERPRINT,
  D6_REVIEW_VALIDATION_RUNTIME_COUNT,
  D6_RUNTIME_COUNT as R5_RUNTIME_COUNT,
  D6_SYSTEM_STREAM_SERVICE_RUNTIME_READY,
  D6_UTILITY_CALCULATION_RUNTIME_COUNT,
  D7_RUNTIME_STARTED,
  D8_RUNTIME_STARTED,
  D9_RUNTIME_COUNT,
  D9_RUNTIME_STARTED,
  DATABASE_SCHEMA_CHANGED,
  NEW_DEPENDENCY_ADDED,
  PARALLEL_D6_CURRENTNESS_ENGINE_CREATED,
  PARALLEL_D6_DIGITAL_THREAD_CREATED,
  SECOND_D6_FINGERPRINT_ALGORITHM_CREATED,
  UNAUTHORIZED_CROSS_DISCIPLINE_REASONING_PROMOTION,
  UNAUTHORIZED_D1_PACK_COMPLETION,
  UNAUTHORIZED_D2_REOPEN,
  UNAUTHORIZED_D3_REOPEN,
  UNAUTHORIZED_D4_REOPEN,
  UNAUTHORIZED_D5_REOPEN,
  UNAUTHORIZED_D7_RUNTIME_PROMOTION,
  UNAUTHORIZED_D8_RUNTIME_PROMOTION,
  UNAUTHORIZED_D9_RUNTIME_PROMOTION,
  UNAUTHORIZED_DISCIPLINE_AUTHORITY_TRANSFER,
  UNAUTHORIZED_GA_PROMOTION,
  UNAUTHORIZED_PROCESS_CALCULATION_PROMOTION,
  UNAUTHORIZED_PROCESS_SAFETY_PROMOTION,
  UNAUTHORIZED_PROCESS_VALIDATION_PROMOTION,
  UNAUTHORIZED_PRODUCT_CLAIM,
  type D6R5Store,
} from "./equipment-duty-utility-context";

export const D6_R6_STATUS = "PROCESS_SAFETY_AND_RELIEF_CONTEXT_IMPLEMENTED" as const;
export const D6_R6_MATURITY = D6_R6_STATUS;
export const D6_R6_MATURITY_STATE = D6_R6_STATUS;
export const D6_R6_CLOSEOUT_PATH =
  "docs/architecture/engineering-os/EOS_D6_R6_PROCESS_SAFETY_AND_RELIEF_CONTEXT_CLOSEOUT.md" as const;
export const D6_R5_EQUIPMENT_DUTY_CONTEXT_REUSED = R5_DUTY_READY;
export const EXACT_D6_R1_R5_REFERENCE_REQUIRED = true as const;
export const FLOATING_D6_R6_SOURCE_REFERENCE_ALLOWED = false as const;
export const D6_R6_SOURCE_AUTO_REPOINTED = false as const;
export const D6_RUNTIME_STARTED = true as const;
export const D6_RUNTIME_COUNT = 6 as const;
export const D6_R5_RUNTIME_COUNT = R5_RUNTIME_COUNT;
export const D6_EQUIPMENT_DUTY_RUNTIME_READY = R5_DUTY_READY;
export const D6_PROCESS_SAFETY_RELIEF_RUNTIME_IMPLEMENTED = true as const;
export const D6_PROCESS_SAFETY_RELIEF_RUNTIME_COUNT = 1 as const;
export const D6_PROCESS_SAFETY_RELIEF_RUNTIME_READY = true as const;
export const D6_PROCESS_SAFETY_CONTEXT_IMPLEMENTED = true as const;
export const PROCESS_SAFETY_CONTEXT_EQUALS_VALIDATED_SAFETY_DESIGN = false as const;
export const PROCESS_SAFETY_CONTEXT_EQUALS_REGULATORY_APPROVAL = false as const;
export const PROCESS_SAFETY_CONTEXT_EQUALS_APPROVED_SAFETY_CASE = false as const;
export const D6_HAZARD_STUDY_CONTEXT_SUPPORTED = true as const;
export const HAZARD_STUDY_RECORD_EQUALS_EOS_HAZARD_ANALYSIS = false as const;
export const HAZARD_STUDY_FINDING_EQUALS_APPROVED_SAFEGUARD = false as const;
export const HAZARD_STUDY_FINDING_EQUALS_ENGINEERING_VALIDATED = false as const;
export const D6_PROCESS_HAZARD_FINDING_CONTEXT_IMPLEMENTED = true as const;
export const PROCESS_HAZARD_FINDING_EQUALS_PROCESS_DESIGN_INVALID = false as const;
export const PROCESS_HAZARD_FINDING_EQUALS_VALIDATED_RISK_REDUCTION = false as const;
export const D6_RELIEF_SCENARIO_CONTEXT_IMPLEMENTED = true as const;
export const RELIEF_SCENARIO_EQUALS_RELIEF_LOAD_CALCULATED_BY_EOS = false as const;
export const RELIEF_SCENARIO_EQUALS_RELIEF_DEVICE_SELECTION = false as const;
export const RELIEF_SCENARIO_EQUALS_ENGINEERING_APPROVAL = false as const;
export const D6_SUPPLIED_RELIEF_LOAD_EVIDENCE_SUPPORTED = true as const;
export const SUPPLIED_RELIEF_LOAD_EQUALS_RELIEF_LOAD_CALCULATED_BY_EOS = false as const;
export const SUPPLIED_RELIEF_LOAD_EQUALS_VALIDATED_RELIEF_DEVICE_SIZE = false as const;
export const SUPPLIED_RELIEF_LOAD_AUTO_ADOPTED_AS_VALIDATED = false as const;
export const D6_R6_CALCULATES_RELIEF_LOAD = false as const;
export const D6_R6_DERIVES_MISSING_RELIEF_LOAD = false as const;
export const D6_R6_HIDDEN_RELIEF_CALCULATION_ALLOWED = false as const;
export const D6_R6_SIZES_RELIEF_DEVICE = false as const;
export const D6_R6_SELECTS_RELIEF_DEVICE = false as const;
export const D6_R6_SELECTS_RELIEF_DEVICE_TYPE = false as const;
export const D6_R6_SELECTS_RELIEF_DEVICE_VENDOR = false as const;
export const D6_R6_AUTO_MATCHES_RELIEF_DEVICE_TO_SCENARIO = false as const;
export const RELIEF_REQUIREMENT_EQUALS_RELIEF_DEVICE_DESIGN = false as const;
export const RELIEF_REQUIREMENT_EQUALS_VALIDATED_MECHANICAL_SELECTION = false as const;
export const D6_R6_VALIDATES_D4_MECHANICAL_ENGINEERING = false as const;
export const D6_R6_TRANSFERS_D4_AUTHORITY = false as const;
export const D6_R6_CAN_REFERENCE_D5_PIPING_CONTEXT = true as const;
export const EXACT_D5_PIPING_REVISION_REQUIRED_WHEN_REFERENCED = true as const;
export const D6_R6_VALIDATES_D5_PIPING_ENGINEERING = false as const;
export const D6_R6_TRANSFERS_D5_AUTHORITY = false as const;
export const D6_R6_AUTO_MUTATES_D5_PIPING_CONTEXT = false as const;
export const D6_R6_AUTO_CREATES_D5_RELIEF_PIPING_DESIGN = false as const;
export const D6_DEPRESSURING_CONTEXT_IMPLEMENTED = true as const;
export const DEPRESSURING_CONTEXT_EQUALS_DEPRESSURING_CALCULATION_BY_EOS = false as const;
export const DEPRESSURING_REQUIREMENT_EQUALS_VALIDATED_BLOWDOWN_DESIGN = false as const;
export const D6_R6_PERFORMS_DEPRESSURING_CALCULATION = false as const;
export const D6_R6_DERIVES_DEPRESSURING_TIME = false as const;
export const D6_R6_DERIVES_BLOWDOWN_RATE = false as const;
export const D6_PROCESS_SAFEGUARD_REQUIREMENT_CONTEXT_IMPLEMENTED = true as const;
export const PROCESS_SAFEGUARD_REQUIREMENT_EQUALS_APPROVED_SAFEGUARD_DESIGN = false as const;
export const PROCESS_SAFEGUARD_REQUIREMENT_EQUALS_IAC_IMPLEMENTATION = false as const;
export const PROCESS_SAFEGUARD_REQUIREMENT_EQUALS_VALIDATED_RISK_REDUCTION = false as const;
export const SAFEGUARD_REQUIREMENT_EQUALS_ENGINEERING_APPROVAL = false as const;
export const D6_R6_CREATES_D8_IAC_DESIGN = false as const;
export const D6_R6_TRANSFERS_D8_AUTHORITY = false as const;
export const D6_R6_VALIDATES_D8_IAC_ENGINEERING = false as const;
export const D6_R6_SIL_CALCULATION_ALLOWED = false as const;
export const D6_R6_DETERMINES_SIL_TARGET = false as const;
export const D6_R6_PERFORMS_LOPA = false as const;
export const D6_R6_PERFORMS_RISK_REDUCTION_CALCULATION = false as const;
export const D6_R6_VALIDATES_SIF = false as const;
export const D6_SUPPLIED_SIL_LOPA_EVIDENCE_SUPPORTED = true as const;
export const SUPPLIED_SIL_TARGET_EQUALS_EOS_SIL_DETERMINATION = false as const;
export const SUPPLIED_LOPA_RESULT_EQUALS_EOS_RISK_VALIDATION = false as const;
export const EXACT_D6_R3_OPERATING_CASE_REVISION_REQUIRED_WHEN_REFERENCED = true as const;
export const EXACT_D6_R3_DESIGN_CASE_REVISION_REQUIRED_WHEN_REFERENCED = true as const;
export const EXACT_D6_R3_CONDITION_REVISION_REQUIRED_WHEN_REFERENCED = true as const;
export const EXACT_D6_R4_EVIDENCE_REVISION_REQUIRED_WHEN_REFERENCED = true as const;
export const D6_R6_REUSES_R4_EVIDENCE_WITHOUT_MUTATION = true as const;
export const R4_EVIDENCE_EQUALS_R6_ENGINEERING_VALIDATION = false as const;
export const D6_R6_AUTO_REVALIDATES_R4_EVIDENCE = false as const;
export const EXACT_D6_R5_DUTY_REVISION_REQUIRED_WHEN_REFERENCED = true as const;
export const D6_R6_REUSES_R5_CONTEXT_WITHOUT_MUTATION = true as const;
export const D6_R6_AUTO_MUTATES_R3_DESIGN_CONDITION = false as const;
export const D6_R6_AUTO_MUTATES_R3_OPERATING_CONDITION = false as const;
export const D6_R6_AUTO_MUTATES_R4_EVIDENCE = false as const;
export const D6_R6_AUTO_MUTATES_R5_EQUIPMENT_DUTY = false as const;
export const D6_R6_AUTO_MUTATES_R5_UTILITY_CONTEXT = false as const;
export const D6_R6_SOURCE_BASIS_REQUIRED = true as const;
export const D6_R6_SOURCE_BASIS_TRACEABLE = true as const;
export const BASISLESS_AUTHORITATIVE_D6_R6_RECORD_AUTO_ACCEPTED = false as const;
export const D6_R6_APPLICABILITY_EXPLICIT = true as const;
export const D6_R6_LIMITATIONS_EXPLICIT = true as const;
export const D6_R6_AUTO_PROPAGATED_OUTSIDE_APPLICABILITY = false as const;
export const D6_R6_ASSUMPTIONS_EXPLICIT = true as const;
export const AI_CAN_INVENT_D6_R6_ENGINEERING_ASSUMPTION = false as const;
export const D6_R6_AUTO_ACCEPTS_PROCESS_RISK = false as const;
export const D6_R6_AUTO_CLOSES_HAZARD_FINDING = false as const;
export const D6_R6_AUTO_APPROVES_SAFEGUARD = false as const;
export const D6_R6_HISTORY_PRESERVED = true as const;
export const D6_R6_AUTO_REPOINTED = false as const;
export const SILENT_D6_R6_MUTATION_ALLOWED = false as const;
export const D6_R6_PROVENANCE_REQUIRED = true as const;
export const D6_R6_PROVENANCE_PRESERVED = true as const;
export const TENANT_WORKSPACE_PROJECT_D6_R6_SCOPE_ENFORCED = true as const;
export const CROSS_TENANT_D6_R6_ACCESS_ALLOWED = false as const;
export const AI_CAN_INVENT_AUTHORITATIVE_D6_HAZARD_FINDING = false as const;
export const AI_CAN_INVENT_AUTHORITATIVE_D6_RELIEF_SCENARIO = false as const;
export const AI_CAN_INVENT_AUTHORITATIVE_D6_SAFEGUARD_REQUIREMENT = false as const;
export const ADMIN_CAN_PROMOTE_UNGOVERNED_D6_R6_CONTEXT_TO_ENGINEERING_TRUTH = false as const;
export const D6_R6_DUPLICATE_GOVERNANCE_IMPLEMENTED = true as const;
export const D6_R6_REPLAY_PROTECTION_IMPLEMENTED = true as const;
export const D6_R6_SPOOFING_PROTECTION_IMPLEMENTED = true as const;
export const UNAUTHORIZED_D6_R7_R12_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_RELIEF_CALCULATION = false as const;
export const UNAUTHORIZED_RELIEF_DEVICE_SIZING = false as const;
export const UNAUTHORIZED_RELIEF_DEVICE_SELECTION = false as const;
export const UNAUTHORIZED_DEPRESSURING_CALCULATION = false as const;
export const UNAUTHORIZED_SIL_CALCULATION = false as const;
export const UNAUTHORIZED_SIL_TARGET_DETERMINATION = false as const;
export const UNAUTHORIZED_SAFEGUARD_DESIGN = false as const;
export const UNAUTHORIZED_RISK_ACCEPTANCE = false as const;
export const UNAUTHORIZED_FUNCTIONAL_SAFETY_PROMOTION = false as const;
export const D6_R7_CANONICAL_PHASE = D6_IMPLEMENTATION_PHASES[6];
export const D6_R7_PHASE_TYPE = D6_IMPLEMENTATION_PHASE_TYPES[6];
export const D6_R7_CANONICAL_SCOPE =
  "Implement canonical Process requirements, assumptions, engineering decisions, change, supersession and reassessment governance across exact R1-R6 revisions. Preserve source requirement != adopted Process requirement, assumption != validated fact, AI recommendation != Process engineering decision, change != automatic recalculation/redesign/revalidation, and explicit dependency/reassessment semantics. Do not perform calculations, mutate engineering truth automatically, start interface/review/currentness/D9 runtimes or perform cross-discipline reasoning." as const;
export const D6_R7_STARTED = false as const;
export const D6_R6_READY_FOR_NEXT_PHASE = true as const;
export const D6_R6_NEXT_PHASE = D6_R7_CANONICAL_PHASE;
export const D6_R6_NEXT_PHASE_TYPE = D6_R7_PHASE_TYPE;
export const D6_R6_CANONICAL_NEXT_PHASE = D6_R7_CANONICAL_PHASE;
export const D6_R6_CANONICAL_NEXT_PHASE_SCOPE = D6_R7_CANONICAL_SCOPE;
export const D6_R6_BLOCKER = "NONE" as const;
export const D6_R6_MACHINE_READABLE_ROADMAP_UPDATED = true as const;

export const D6_R6_STUDY_KINDS = ["HAZID", "HAZOP", "EQUIVALENT_SUPPLIED_STUDY"] as const;
export const D6_R6_SAFEGUARD_INTENTS = [
  "PREVENTION",
  "DETECTION",
  "SHUTDOWN",
  "ISOLATION",
  "ALARM",
  "RELIEF",
  "MITIGATION",
  "OTHER_PROCESS_SAFEGUARD_INTENT",
] as const;
const MECHANICAL_REFERENCE_TYPES = ["MECHANICAL_EQUIPMENT", "ROTATING_EQUIPMENT", "STATIC_EQUIPMENT", "MECHANICAL_PACKAGE"] as const;
const RECORD_KINDS = ["SAFETY_CONTEXT", "HAZARD_STUDY", "HAZARD_FINDING", "RELIEF_SCENARIO", "DEPRESSURING", "SAFEGUARD_REQUIREMENT"] as const;

export {
  D6_R1_IDENTITY_REUSED,
  D6_R2_SYSTEM_STREAM_SERVICE_CONTEXT_REUSED,
  D6_R3_DESIGN_BASIS_CONDITION_CONTEXT_REUSED,
  D6_R4_PROCESS_EVIDENCE_CONTEXT_REUSED,
  D6_PROCESS_IDENTITY_RUNTIME_READY,
  D6_SYSTEM_STREAM_SERVICE_RUNTIME_READY,
  D6_DESIGN_BASIS_CONDITION_RUNTIME_READY,
  D6_PROCESS_EVIDENCE_RUNTIME_READY,
  D6_REUSES_CANONICAL_CURRENTNESS,
  D6_REUSES_CANONICAL_DIGITAL_THREAD,
  D6_REUSES_CANONICAL_FINGERPRINT,
  PARALLEL_D6_CURRENTNESS_ENGINE_CREATED,
  PARALLEL_D6_DIGITAL_THREAD_CREATED,
  SECOND_D6_FINGERPRINT_ALGORITHM_CREATED,
  PROCESS_HAZARD_FINDING_EQUALS_APPROVED_SAFEGUARD,
  PROCESS_SAFETY_CONTEXT_EQUALS_FUNCTIONAL_SAFETY_VALIDATION,
  RELIEF_SCENARIO_EQUALS_RELIEF_DEVICE_DESIGN,
  RELIEF_REQUIREMENT_EQUALS_VALIDATED_RELIEF_DEVICE_SELECTION,
  D6_EQUALS_D1_STRUCTURAL_AUTHORITY,
  D6_EQUALS_D2_CIVIL_AUTHORITY,
  D6_EQUALS_D3_GEOTECHNICAL_AUTHORITY,
  D6_EQUALS_D4_MECHANICAL_AUTHORITY,
  D6_EQUALS_D5_PIPING_AUTHORITY,
  D6_EQUALS_D7_ELECTRICAL_AUTHORITY,
  D6_EQUALS_D8_INSTRUMENTATION_CONTROL_AUTHORITY,
  AI_EQUALS_D6_PROCESS_ENGINEERING_AUTHORITY,
  ADMIN_EQUALS_D6_PROCESS_ENGINEERING_AUTHORITY,
  D6_EQUIPMENT_DUTY_CALCULATION_RUNTIME_COUNT,
  D6_UTILITY_CALCULATION_RUNTIME_COUNT,
  D6_RELIEF_CALCULATION_RUNTIME_COUNT,
  D6_DEPRESSURING_CALCULATION_RUNTIME_COUNT,
  D6_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_COUNT,
  D6_DISCIPLINE_INTERFACE_RUNTIME_COUNT,
  D6_REVIEW_VALIDATION_RUNTIME_COUNT,
  D6_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT,
  D6_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
  D6_D9_RUNTIME_INTEGRATION_COUNT,
  D6_PROCESS_CALCULATION_RUNTIME_COUNT,
  D6_MASS_BALANCE_CALCULATION_RUNTIME_COUNT,
  D6_ENERGY_BALANCE_CALCULATION_RUNTIME_COUNT,
  D6_HYDRAULIC_CALCULATION_RUNTIME_COUNT,
  D6_PRESSURE_DROP_CALCULATION_RUNTIME_COUNT,
  D6_AUTOMATIC_PROCESS_CALCULATION_RUNTIME_COUNT,
  D6_AUTOMATIC_REDESIGN_RUNTIME_COUNT,
  D6_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT,
  D6_CONFORMANCE_DETERMINATION_RUNTIME_COUNT,
  D6_APPROVAL_RUNTIME_COUNT,
  D6_CERTIFICATION_RUNTIME_COUNT,
  D6_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT,
  D6_CROSS_DISCIPLINE_CONFLICT_DETECTION_RUNTIME_COUNT,
  D6_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT,
  D6_CROSS_DISCIPLINE_RECOMMENDATION_RUNTIME_COUNT,
  D1_STRUCTURAL_PACK_COMPLETE,
  D1N_REOPENED,
  D2_TRACK_COMPLETE,
  D2_REOPENED,
  D3_TRACK_COMPLETE,
  D3_REOPENED,
  D4_TRACK_COMPLETE,
  D4_REOPENED,
  D5_TRACK_COMPLETE,
  D5_REOPENED,
  D7_RUNTIME_STARTED,
  D8_RUNTIME_STARTED,
  D9_RUNTIME_STARTED,
  D9_RUNTIME_COUNT,
  DATABASE_SCHEMA_CHANGED,
  NEW_DEPENDENCY_ADDED,
  UNAUTHORIZED_D1_PACK_COMPLETION,
  UNAUTHORIZED_D2_REOPEN,
  UNAUTHORIZED_D3_REOPEN,
  UNAUTHORIZED_D4_REOPEN,
  UNAUTHORIZED_D5_REOPEN,
  UNAUTHORIZED_D7_RUNTIME_PROMOTION,
  UNAUTHORIZED_D8_RUNTIME_PROMOTION,
  UNAUTHORIZED_D9_RUNTIME_PROMOTION,
  UNAUTHORIZED_PROCESS_CALCULATION_PROMOTION,
  UNAUTHORIZED_PROCESS_SAFETY_PROMOTION,
  UNAUTHORIZED_PROCESS_VALIDATION_PROMOTION,
  UNAUTHORIZED_DISCIPLINE_AUTHORITY_TRANSFER,
  UNAUTHORIZED_CROSS_DISCIPLINE_REASONING_PROMOTION,
  UNAUTHORIZED_GA_PROMOTION,
  UNAUTHORIZED_PRODUCT_CLAIM,
};

const FLOATING = new Set(["latest", "current", "newest", "head", "active", "active model", "now"]);
const INFERRED = new Set(["inferred", "matching_name", "similar_value", "document_proximity", "ai_inference", "auto_max"]);
const BROAD = new Set(["all", "global", "every", "any"]);

type Currentness = (typeof D6_CURRENTNESS_STATES)[number];
type Stage = (typeof D6_MATURITY_STATES)[number];
type RecordKind = (typeof RECORD_KINDS)[number];
type StudyKind = (typeof D6_R6_STUDY_KINDS)[number];
type SafeguardIntent = (typeof D6_R6_SAFEGUARD_INTENTS)[number];

type Prohibited = {
  calculateReliefLoad?: boolean;
  deriveReliefLoad?: boolean;
  hiddenReliefCalculation?: boolean;
  hiddenCalculation?: boolean;
  sizeReliefDevice?: boolean;
  selectReliefDevice?: boolean;
  selectReliefDeviceType?: boolean;
  selectReliefVendor?: boolean;
  autoMatchReliefDevice?: boolean;
  validateMechanical?: boolean;
  transferD4?: boolean;
  mutateD4?: boolean;
  validatePiping?: boolean;
  transferD5?: boolean;
  mutateD5?: boolean;
  createReliefPiping?: boolean;
  performDepressuring?: boolean;
  deriveDepressuringTime?: boolean;
  deriveBlowdownRate?: boolean;
  createIac?: boolean;
  transferD8?: boolean;
  validateIac?: boolean;
  createElectrical?: boolean;
  transferD7?: boolean;
  determineSil?: boolean;
  performLopa?: boolean;
  calculateRiskReduction?: boolean;
  validateSif?: boolean;
  inferSil?: boolean;
  inferLopa?: boolean;
  mutateOperatingCondition?: boolean;
  mutateDesignCondition?: boolean;
  mutateEvidence?: boolean;
  revalidateEvidence?: boolean;
  mutateDuty?: boolean;
  mutateUtility?: boolean;
  propagate?: boolean;
  acceptRisk?: boolean;
  closeFinding?: boolean;
  approveSafeguard?: boolean;
  inventAssumption?: boolean;
  inventFinding?: boolean;
  inventScenario?: boolean;
  inventSafeguard?: boolean;
  promoteToTruth?: boolean;
  designSafeguard?: boolean;
  autoAdoptLoad?: boolean;
  copyEvidenceResult?: boolean;
};

export type D6R6Measure = { value: string; unit: string };

type Bound = Prohibited & {
  contextId: string;
  objectId: string;
  objectRevisionFingerprint: string;
  subjectObjectId: string;
  subjectRevisionFingerprint: string;
  caseClass: string;
  caseRecordId: string;
  caseContextFingerprint: string;
  citedLifecycleStage: string;
  provenanceRef: string;
  sourceBasisRef: string;
  citedCurrentness: string;
  applicability: string;
  limitations: string;
  assumptions: string;
  statement: string;
  assertedFingerprint?: string;
  tenantId?: string;
  workspaceId?: string;
  projectId?: string;
  value?: string | null;
  unit?: string | null;
  r2StreamRecordId?: string | null;
  r2StreamFingerprint?: string | null;
  r2SystemRecordId?: string | null;
  r2SystemFingerprint?: string | null;
  evidenceId?: string | null;
  evidenceFingerprint?: string | null;
  conditionId?: string | null;
  conditionFingerprint?: string | null;
  dutyRequirementId?: string | null;
  dutyRevisionFingerprint?: string | null;
  utilityRecordId?: string | null;
  utilityRevisionFingerprint?: string | null;
  mechanicalObjectId?: string | null;
  mechanicalRevisionFingerprint?: string | null;
  pipingLineObjectId?: string | null;
  pipingLineRevisionFingerprint?: string | null;
  initiatingCondition?: string | null;
  studyKind?: string | null;
  studyReference?: string | null;
  safeguardIntent?: string | null;
  silEvidenceRef?: string | null;
  lopaEvidenceRef?: string | null;
  predecessorRecordId?: string | null;
};

export type D6R6Input = Bound & { recordId: string };

export type D6R6Record = {
  recordId: string;
  recordKind: RecordKind;
  objectType: "PROCESS_SAFETY_CONTEXT" | "PROCESS_RELIEF_SCENARIO";
  scenarioClass: "RELIEF" | "DEPRESSURING" | "SAFEGUARDING" | null;
  studyKind: StudyKind | null;
  studyReference: string | null;
  safeguardIntent: SafeguardIntent | null;
  statement: string;
  initiatingCondition: string | null;
  assumptions: string;
  suppliedLoad: D6R6Measure | null;
  silEvidenceRef: string | null;
  lopaEvidenceRef: string | null;
  contextId: string;
  objectId: string;
  objectRevisionFingerprint: string;
  subjectObjectId: string;
  subjectRevisionFingerprint: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  discipline: typeof D6_DISCIPLINE;
  caseClass: "OPERATING" | "DESIGN";
  caseRecordId: string;
  caseContextFingerprint: string;
  conditionId: string | null;
  conditionFingerprint: string | null;
  evidenceId: string | null;
  evidenceFingerprint: string | null;
  dutyRequirementId: string | null;
  dutyRevisionFingerprint: string | null;
  utilityRecordId: string | null;
  utilityRevisionFingerprint: string | null;
  mechanicalObjectId: string | null;
  mechanicalRevisionFingerprint: string | null;
  pipingLineObjectId: string | null;
  pipingLineRevisionFingerprint: string | null;
  citedLifecycleStage: Stage;
  provenanceRef: string;
  sourceBasisRef: string;
  applicability: string;
  limitations: string;
  citedCurrentness: Currentness;
  authority: typeof D6_CONTEXT_AUTHORITY;
  processEngineeringAuthority: false;
  validatedSafetyDesign: false;
  functionalSafetyValidation: false;
  regulatoryApproval: false;
  approvedSafetyCase: false;
  eosHazardAnalysis: false;
  approvedSafeguard: false;
  engineeringValidated: false;
  processDesignInvalid: false;
  validatedRiskReduction: false;
  reliefLoadCalculatedByEos: false;
  reliefDeviceDesign: false;
  reliefDeviceSelection: false;
  validatedReliefDeviceSize: false;
  validatedMechanicalSelection: false;
  depressuringCalculatedByEos: false;
  validatedBlowdownDesign: false;
  iacImplementation: false;
  approvedSafeguardDesign: false;
  engineeringApproval: false;
  silCalculatedByEos: false;
  silTargetDeterminedByEos: false;
  lopaPerformedByEos: false;
  riskReductionCalculatedByEos: false;
  sifValidated: false;
  eosSilDetermination: false;
  eosRiskValidation: false;
  riskAccepted: false;
  hazardClosed: false;
  safeguardApproved: false;
  autoAdoptedLoad: false;
  fingerprint: string;
  recordedBy: string;
  recordedAt: string;
  recordStatus: "CURRENT" | "SUPERSEDED";
  currentness: "CURRENT" | "SUPERSEDED";
  predecessorRecordId: string | null;
};

export type D6R6History = {
  historyId: string;
  subjectKind: RecordKind;
  subjectId: string;
  action: "CREATED" | "SUPERSEDED";
  fingerprint: string;
  recordedAt: string;
};

export type D6R6Store = {
  r5: D6R5Store;
  d4: D4R1Store | null;
  now: () => string;
  records: D6R6Record[];
  history: D6R6History[];
};

function fail(code: string): never {
  throw new Error(`D6_R6_${code}`);
}

function blockedParty(value: string): boolean {
  return /^AI(?:\b|_)/i.test(value) || /LLM/i.test(value) || /OPTIMIZER/i.test(value);
}

function explicit(value: string, code: string): string {
  const token = value.trim();
  if (!token || FLOATING.has(token.toLowerCase()) || INFERRED.has(token.toLowerCase()) || BROAD.has(token.toLowerCase()) || blockedParty(token)) fail(code);
  return token;
}

function optionalExplicit(value: string | null | undefined, code: string): string | null {
  if (value == null || value.trim() === "") return null;
  return explicit(value, code);
}

function assertActor(actor: D6R1Actor): void {
  if (!actor.actorId.trim() || !actor.tenantId.trim() || !actor.workspaceId.trim() || !actor.projectId.trim()) fail("SCOPE_REQUIRED");
  if (blockedParty(actor.actorId) || blockedParty(actor.authority)) fail("AI_NOT_PROCESS_AUTHORITY");
  if (actor.authority === "ADMINISTRATOR" || actor.authority === "ADMIN") fail("ADMIN_NOT_PROCESS_AUTHORITY");
  if (actor.authority === "PROCESS_ENGINEERING_AUTHORITY") fail("RECORDER_NOT_PROCESS_ENGINEERING_AUTHORITY");
  if (actor.authority !== D6_CONTEXT_AUTHORITY) fail("UNAUTHORIZED");
}

function assertProhibited(input: Prohibited): void {
  if (input.calculateReliefLoad === true || input.deriveReliefLoad === true || input.hiddenReliefCalculation === true || input.hiddenCalculation === true) fail("RELIEF_NOT_CALCULATED");
  if (input.sizeReliefDevice === true) fail("RELIEF_DEVICE_NOT_SIZED");
  if (input.selectReliefDevice === true || input.selectReliefDeviceType === true || input.selectReliefVendor === true || input.autoMatchReliefDevice === true) fail("RELIEF_DEVICE_NOT_SELECTED");
  if (input.validateMechanical === true || input.transferD4 === true || input.mutateD4 === true) fail("D4_AUTHORITY_NOT_TRANSFERRED");
  if (input.validatePiping === true || input.transferD5 === true || input.mutateD5 === true || input.createReliefPiping === true) fail("D5_AUTHORITY_NOT_TRANSFERRED");
  if (input.performDepressuring === true || input.deriveDepressuringTime === true || input.deriveBlowdownRate === true) fail("DEPRESSURING_NOT_CALCULATED");
  if (input.createIac === true || input.transferD8 === true || input.validateIac === true) fail("D8_AUTHORITY_NOT_TRANSFERRED");
  if (input.createElectrical === true || input.transferD7 === true) fail("D7_AUTHORITY_NOT_TRANSFERRED");
  if (input.determineSil === true || input.performLopa === true || input.calculateRiskReduction === true || input.validateSif === true || input.inferSil === true || input.inferLopa === true) fail("SIL_NOT_DETERMINED");
  if (input.mutateOperatingCondition === true || input.mutateDesignCondition === true) fail("R3_NOT_MUTATED");
  if (input.mutateEvidence === true || input.revalidateEvidence === true || input.copyEvidenceResult === true) fail("R4_EVIDENCE_NOT_MUTATED");
  if (input.mutateDuty === true || input.mutateUtility === true) fail("R5_NOT_MUTATED");
  if (input.propagate === true) fail("PROPAGATION_REJECTED");
  if (input.acceptRisk === true || input.closeFinding === true || input.approveSafeguard === true) fail("RISK_NOT_ACCEPTED");
  if (input.inventAssumption === true || input.inventFinding === true || input.inventScenario === true || input.inventSafeguard === true || input.promoteToTruth === true) fail("SAFETY_CONTEXT_NOT_INVENTED");
  if (input.designSafeguard === true) fail("SAFEGUARD_NOT_DESIGNED");
  if (input.autoAdoptLoad === true) fail("SUPPLIED_LOAD_NOT_AUTO_ADOPTED");
}

function optionalMeasure(value: string | null | undefined, unit: string | null | undefined): D6R6Measure | null {
  const hasValue = value != null && String(value).trim() !== "";
  const hasUnit = unit != null && unit.trim() !== "";
  if (!hasValue && !hasUnit) return null;
  const token = explicit(value == null ? "" : String(value), "VALUE_REQUIRED");
  if (!/^-?\d+(\.\d+)?$/.test(token)) fail("VALUE_NOT_SUPPLIED");
  if (!hasUnit) fail("UNITS_REQUIRED");
  return { value: token, unit: explicit(unit as string, "UNIT_INVALID") };
}

function requireObject(store: D6R6Store, actor: D6R1Actor, contextId: string, objectId: string, revision: string, allowed: readonly string[], cited: Currentness) {
  const id = explicit(objectId, "R1_OBJECT_REQUIRED");
  const rev = explicit(revision, "R1_REVISION_REQUIRED");
  const object = store.r5.r4.r3.r2.r1.objects.find((row) => row.objectId === id);
  if (!object || !allowed.includes(object.objectType)) fail("R1_OBJECT_NOT_FOUND");
  if (object.fingerprint !== rev) fail("R1_REVISION_MISMATCH");
  if (object.contextId !== contextId) fail("R1_CONTEXT_MISMATCH");
  if (object.tenantId !== actor.tenantId || object.workspaceId !== actor.workspaceId || object.projectId !== actor.projectId) fail("CROSS_SCOPE_OPERATION");
  if (cited === "CURRENT" && object.recordStatus !== "CURRENT") fail("R1_OBJECT_NOT_CURRENT");
  return object;
}

function requireCase(store: D6R6Store, actor: D6R1Actor, caseClass: string, recordId: string, fingerprint: string) {
  if (caseClass !== "OPERATING" && caseClass !== "DESIGN") fail("CASE_CLASS_INVALID");
  const rows = caseClass === "OPERATING" ? store.r5.r4.r3.operatingCases : store.r5.r4.r3.designCases;
  const id = explicit(recordId, "CASE_REVISION_REQUIRED");
  const revision = explicit(fingerprint, "CASE_REVISION_REQUIRED");
  const row = rows.find((item) => item.caseRecordId === id);
  if (!row || row.fingerprint !== revision || row.tenantId !== actor.tenantId || row.workspaceId !== actor.workspaceId || row.projectId !== actor.projectId || row.recordStatus !== "CURRENT") fail("CASE_REVISION_MISMATCH");
  return row;
}

function requireSubjectContext(store: D6R6Store, actor: D6R1Actor, subject: D6R1ObjectRecord, input: Bound, cited: Currentness) {
  if (subject.objectType === "PROCESS_STREAM") {
    const id = explicit(input.r2StreamRecordId ?? "", "R2_STREAM_REQUIRED");
    const revision = explicit(input.r2StreamFingerprint ?? "", "R2_STREAM_REVISION_REQUIRED");
    const row = store.r5.r4.r3.r2.streams.find((item) => item.streamRecordId === id);
    if (!row || row.fingerprint !== revision || row.objectId !== subject.objectId || (cited === "CURRENT" && row.recordStatus !== "CURRENT")) fail("R2_STREAM_REVISION_MISMATCH");
    if (row.tenantId !== actor.tenantId) fail("CROSS_SCOPE_OPERATION");
    return { lineObjectId: row.pipingLineObjectId, lineFingerprint: row.pipingLineRevisionFingerprint };
  }
  const id = explicit(input.r2SystemRecordId ?? "", "R2_SYSTEM_REQUIRED");
  const revision = explicit(input.r2SystemFingerprint ?? "", "R2_SYSTEM_REVISION_REQUIRED");
  const row = store.r5.r4.r3.r2.systems.find((item) => item.systemRecordId === id);
  if (!row || row.fingerprint !== revision || row.objectId !== subject.objectId) fail("R2_SYSTEM_REVISION_MISMATCH");
  if (row.tenantId !== actor.tenantId || (cited === "CURRENT" && row.recordStatus !== "CURRENT")) fail("R2_SYSTEM_REVISION_MISMATCH");
  return { lineObjectId: null as string | null, lineFingerprint: null as string | null };
}

function citePair(id: string | null | undefined, revision: string | null | undefined, code: string): { id: string; revision: string } | null {
  const hasId = id != null && id.trim() !== "";
  const hasRevision = revision != null && revision.trim() !== "";
  if (!hasId && !hasRevision) return null;
  if (!hasId || !hasRevision) fail(code);
  return { id: explicit(id as string, code), revision: explicit(revision as string, code) };
}

function citeEvidence(store: D6R6Store, actor: D6R1Actor, evidenceId: string | null | undefined, fingerprint: string | null | undefined, subjectObjectId: string, caseRecordId: string) {
  const pair = citePair(evidenceId, fingerprint, "EVIDENCE_REVISION_REQUIRED");
  if (!pair) return null;
  const row = store.r5.r4.evidence.find((item) => item.evidenceId === pair.id);
  if (!row || row.fingerprint !== pair.revision || row.recordStatus !== "CURRENT") fail("EVIDENCE_REVISION_MISMATCH");
  if (row.tenantId !== actor.tenantId || row.workspaceId !== actor.workspaceId || row.projectId !== actor.projectId) fail("CROSS_SCOPE_OPERATION");
  if (row.subjectObjectId !== subjectObjectId || row.caseRecordId !== caseRecordId) fail("EVIDENCE_SUBJECT_MISMATCH");
  return { evidenceId: row.evidenceId, fingerprint: row.fingerprint };
}

function citeCondition(store: D6R6Store, actor: D6R1Actor, conditionId: string | null | undefined, fingerprint: string | null | undefined, subjectObjectId: string, caseRecordId: string) {
  const pair = citePair(conditionId, fingerprint, "CONDITION_REVISION_REQUIRED");
  if (!pair) return null;
  const row = store.r5.r4.r3.conditions.find((item) => item.conditionId === pair.id);
  if (!row || row.fingerprint !== pair.revision || row.recordStatus !== "CURRENT") fail("CONDITION_REVISION_MISMATCH");
  if (row.tenantId !== actor.tenantId || row.workspaceId !== actor.workspaceId || row.projectId !== actor.projectId) fail("CROSS_SCOPE_OPERATION");
  if (row.objectId !== subjectObjectId || row.caseRecordId !== caseRecordId) fail("CONDITION_SUBJECT_MISMATCH");
  return { conditionId: row.conditionId, fingerprint: row.fingerprint };
}

function citeDuty(store: D6R6Store, actor: D6R1Actor, requirementId: string | null | undefined, fingerprint: string | null | undefined, subjectObjectId: string, caseRecordId: string) {
  const pair = citePair(requirementId, fingerprint, "DUTY_REVISION_REQUIRED");
  if (!pair) return null;
  const row = store.r5.duties.find((item) => item.requirementId === pair.id);
  if (!row || row.fingerprint !== pair.revision || row.recordStatus !== "CURRENT") fail("DUTY_REVISION_MISMATCH");
  if (row.tenantId !== actor.tenantId || row.workspaceId !== actor.workspaceId || row.projectId !== actor.projectId) fail("CROSS_SCOPE_OPERATION");
  if (row.subjectObjectId !== subjectObjectId || row.caseRecordId !== caseRecordId) fail("DUTY_SUBJECT_MISMATCH");
  return { dutyRequirementId: row.requirementId, fingerprint: row.fingerprint };
}

function citeUtility(store: D6R6Store, actor: D6R1Actor, utilityRecordId: string | null | undefined, fingerprint: string | null | undefined, subjectObjectId: string, caseRecordId: string) {
  const pair = citePair(utilityRecordId, fingerprint, "UTILITY_REVISION_REQUIRED");
  if (!pair) return null;
  const row = store.r5.utilities.find((item) => item.utilityRecordId === pair.id);
  if (!row || row.fingerprint !== pair.revision || row.recordStatus !== "CURRENT") fail("UTILITY_REVISION_MISMATCH");
  if (row.tenantId !== actor.tenantId || row.workspaceId !== actor.workspaceId || row.projectId !== actor.projectId) fail("CROSS_SCOPE_OPERATION");
  if (row.subjectObjectId !== subjectObjectId || row.caseRecordId !== caseRecordId) fail("UTILITY_SUBJECT_MISMATCH");
  return { utilityRecordId: row.utilityRecordId, fingerprint: row.fingerprint };
}

function citeMechanical(store: D6R6Store, actor: D6R1Actor, objectId: string | null | undefined, fingerprint: string | null | undefined) {
  const pair = citePair(objectId, fingerprint, "D4_REVISION_REQUIRED");
  if (!pair) return null;
  if (!store.d4) fail("D4_CONTEXT_NOT_SUPPLIED");
  const row = store.d4.objects.find((item) => item.objectId === pair.id);
  if (!row || row.fingerprint !== pair.revision || row.recordStatus !== "CURRENT") fail("D4_REVISION_MISMATCH");
  if (!(MECHANICAL_REFERENCE_TYPES as readonly string[]).includes(row.objectType)) fail("D4_OBJECT_NOT_EQUIPMENT");
  if (!(D4_MECHANICAL_OBJECT_TYPES as readonly string[]).includes(row.objectType)) fail("D4_OBJECT_NOT_EQUIPMENT");
  if (row.tenantId !== actor.tenantId || row.workspaceId !== actor.workspaceId || row.projectId !== actor.projectId) fail("CROSS_SCOPE_OPERATION");
  return { objectId: row.objectId, fingerprint: row.fingerprint };
}

function citeLine(streamLineId: string | null, streamLineFingerprint: string | null, objectId: string | null | undefined, revision: string | null | undefined, store: D6R6Store, actor: D6R1Actor) {
  const pair = citePair(objectId, revision, "D5_LINE_REVISION_REQUIRED");
  if (!pair) return { objectId: null as string | null, fingerprint: null as string | null };
  if (streamLineId && streamLineFingerprint && (streamLineId !== pair.id || streamLineFingerprint !== pair.revision)) fail("D5_REFERENCE_MISMATCH");
  const line = store.r5.r4.r3.r2.d5.objects.find((row) => row.objectId === pair.id && row.objectType === "PIPING_LINE");
  if (!line || line.fingerprint !== pair.revision || line.recordStatus !== "CURRENT") fail("D5_LINE_NOT_FOUND");
  if (line.tenantId !== actor.tenantId || line.workspaceId !== actor.workspaceId || line.projectId !== actor.projectId) fail("CROSS_SCOPE_OPERATION");
  return { objectId: line.objectId, fingerprint: line.fingerprint };
}

function sameLineage(store: D6R6Store, object: D6R1ObjectRecord, priorObjectId: string): boolean {
  let cursor: D6R1ObjectRecord | undefined = object;
  const seen = new Set<string>();
  while (cursor && !seen.has(cursor.objectId)) {
    if (cursor.objectId === priorObjectId) return true;
    seen.add(cursor.objectId);
    cursor = cursor.predecessorObjectId ? store.r5.r4.r3.r2.r1.objects.find((row) => row.objectId === cursor?.predecessorObjectId) : undefined;
  }
  return false;
}

function prepare(store: D6R6Store, actor: D6R1Actor, input: Bound, allowed: readonly string[]) {
  assertActor(actor);
  assertProhibited(input);
  if (input.tenantId != null && input.tenantId !== actor.tenantId) fail("CROSS_TENANT_OPERATION");
  if (input.workspaceId != null && input.workspaceId !== actor.workspaceId) fail("CROSS_WORKSPACE_OPERATION");
  if (input.projectId != null && input.projectId !== actor.projectId) fail("CROSS_PROJECT_OPERATION");
  const cited = input.citedCurrentness.trim();
  if (!(D6_CURRENTNESS_STATES as readonly string[]).includes(cited)) fail("CURRENTNESS_INVALID");
  const contextId = explicit(input.contextId, "R1_CONTEXT_REQUIRED");
  const context = store.r5.r4.r3.r2.r1.contexts.find((row) => row.contextId === contextId);
  if (!context || context.tenantId !== actor.tenantId || context.workspaceId !== actor.workspaceId || context.projectId !== actor.projectId) fail("R1_CONTEXT_NOT_FOUND");
  if (cited === "CURRENT" && context.recordStatus !== "CURRENT") fail("R1_CONTEXT_NOT_CURRENT");
  const object = requireObject(store, actor, context.contextId, input.objectId, input.objectRevisionFingerprint, allowed, cited as Currentness);
  const subject = requireObject(store, actor, context.contextId, input.subjectObjectId, input.subjectRevisionFingerprint, ["PROCESS_STREAM", "PROCESS_SYSTEM"], cited as Currentness);
  const stage = input.citedLifecycleStage.trim();
  if (!(D6_MATURITY_STATES as readonly string[]).includes(stage)) fail("MATURITY_STAGE_INVALID");
  const caseRow = requireCase(store, actor, input.caseClass, input.caseRecordId, input.caseContextFingerprint);
  const bound = requireSubjectContext(store, actor, subject, input, cited as Currentness);
  const applicability = explicit(input.applicability, "APPLICABILITY_REQUIRED");
  const limitations = explicit(input.limitations, "LIMITATIONS_REQUIRED");
  if (!applicability.includes(subject.objectId) || !applicability.includes(object.objectId)) fail("APPLICABILITY_NOT_OBJECT_SCOPED");
  return {
    context, object, subject, stage: stage as Stage, cited: cited as Currentness, caseRow,
    statement: explicit(input.statement, "STATEMENT_REQUIRED"),
    assumptions: explicit(input.assumptions, "ASSUMPTIONS_REQUIRED"),
    suppliedLoad: optionalMeasure(input.value, input.unit),
    evidence: citeEvidence(store, actor, input.evidenceId, input.evidenceFingerprint, subject.objectId, caseRow.caseRecordId),
    condition: citeCondition(store, actor, input.conditionId, input.conditionFingerprint, subject.objectId, caseRow.caseRecordId),
    duty: citeDuty(store, actor, input.dutyRequirementId, input.dutyRevisionFingerprint, subject.objectId, caseRow.caseRecordId),
    utility: citeUtility(store, actor, input.utilityRecordId, input.utilityRevisionFingerprint, subject.objectId, caseRow.caseRecordId),
    mechanical: citeMechanical(store, actor, input.mechanicalObjectId, input.mechanicalRevisionFingerprint),
    line: citeLine(bound.lineObjectId, bound.lineFingerprint, input.pipingLineObjectId, input.pipingLineRevisionFingerprint, store, actor),
    provenanceRef: explicit(input.provenanceRef, "MISSING_PROVENANCE"),
    sourceBasisRef: explicit(input.sourceBasisRef, "MISSING_SOURCE_BASIS"),
    applicability, limitations,
    initiatingCondition: optionalExplicit(input.initiatingCondition, "INITIATING_CONDITION_INVALID"),
    studyReference: optionalExplicit(input.studyReference, "STUDY_REFERENCE_INVALID"),
    silEvidenceRef: optionalExplicit(input.silEvidenceRef, "SIL_EVIDENCE_INVALID"),
    lopaEvidenceRef: optionalExplicit(input.lopaEvidenceRef, "LOPA_EVIDENCE_INVALID"),
  };
}

function remember(store: D6R6Store, subjectKind: RecordKind, subjectId: string, action: D6R6History["action"], fingerprint: string) {
  store.history.push({ historyId: `hist-${store.history.length + 1}`, subjectKind, subjectId, action, fingerprint, recordedAt: store.now() });
}

const CLOSED_FLAGS = {
  processEngineeringAuthority: false,
  validatedSafetyDesign: false,
  functionalSafetyValidation: false,
  regulatoryApproval: false,
  approvedSafetyCase: false,
  eosHazardAnalysis: false,
  approvedSafeguard: false,
  engineeringValidated: false,
  processDesignInvalid: false,
  validatedRiskReduction: false,
  reliefLoadCalculatedByEos: false,
  reliefDeviceDesign: false,
  reliefDeviceSelection: false,
  validatedReliefDeviceSize: false,
  validatedMechanicalSelection: false,
  depressuringCalculatedByEos: false,
  validatedBlowdownDesign: false,
  iacImplementation: false,
  approvedSafeguardDesign: false,
  engineeringApproval: false,
  silCalculatedByEos: false,
  silTargetDeterminedByEos: false,
  lopaPerformedByEos: false,
  riskReductionCalculatedByEos: false,
  sifValidated: false,
  eosSilDetermination: false,
  eosRiskValidation: false,
  riskAccepted: false,
  hazardClosed: false,
  safeguardApproved: false,
  autoAdoptedLoad: false,
} as const;

export function createD6R6Store(r5: D6R5Store, d4: D4R1Store | null = r5.d4, now: () => string = () => "2026-10-24T00:00:00.000Z"): D6R6Store {
  return { r5, d4, now, records: [], history: [] };
}

function recordContext(store: D6R6Store, actor: D6R1Actor, input: D6R6Input, recordKind: RecordKind): D6R6Record {
  const allowed = recordKind === "RELIEF_SCENARIO" || recordKind === "DEPRESSURING" || recordKind === "SAFEGUARD_REQUIREMENT"
    ? ["PROCESS_RELIEF_SCENARIO"]
    : ["PROCESS_SAFETY_CONTEXT"];
  const prepared = prepare(store, actor, input, allowed);
  let studyKind: StudyKind | null = null;
  let safeguardIntent: SafeguardIntent | null = null;
  if (recordKind === "HAZARD_STUDY") {
    const kind = explicit(input.studyKind ?? "", "STUDY_KIND_REQUIRED");
    if (!(D6_R6_STUDY_KINDS as readonly string[]).includes(kind)) fail("STUDY_KIND_INVALID");
    if (!prepared.studyReference) fail("STUDY_REFERENCE_REQUIRED");
    studyKind = kind as StudyKind;
  }
  if (recordKind === "SAFEGUARD_REQUIREMENT") {
    const intent = explicit(input.safeguardIntent ?? "", "SAFEGUARD_INTENT_REQUIRED");
    if (!(D6_R6_SAFEGUARD_INTENTS as readonly string[]).includes(intent)) fail("SAFEGUARD_INTENT_INVALID");
    safeguardIntent = intent as SafeguardIntent;
  }
  if ((recordKind === "RELIEF_SCENARIO" || recordKind === "DEPRESSURING") && !prepared.initiatingCondition) fail("INITIATING_CONDITION_REQUIRED");
  const recordId = explicit(input.recordId, "RECORD_REQUIRED");
  const predecessor = input.predecessorRecordId ? store.records.find((row) => row.recordId === input.predecessorRecordId) : null;
  if (input.predecessorRecordId) {
    if (!predecessor || predecessor.recordStatus !== "CURRENT" || predecessor.tenantId !== actor.tenantId) fail("PREDECESSOR_NOT_CURRENT");
    if (!sameLineage(store, prepared.object, predecessor.objectId) || predecessor.recordKind !== recordKind || predecessor.caseRecordId !== prepared.caseRow.caseRecordId) fail("CASE_REPOINT_REJECTED");
  }
  const scenarioClass = recordKind === "RELIEF_SCENARIO" ? "RELIEF" : recordKind === "DEPRESSURING" ? "DEPRESSURING" : recordKind === "SAFEGUARD_REQUIREMENT" ? "SAFEGUARDING" : null;
  const objectType = allowed[0] === "PROCESS_RELIEF_SCENARIO" ? "PROCESS_RELIEF_SCENARIO" : "PROCESS_SAFETY_CONTEXT";
  const fingerprint = fingerprintCanonical({
    recordId, recordKind, scenarioClass, studyKind, studyReference: prepared.studyReference, safeguardIntent,
    statement: prepared.statement, initiatingCondition: prepared.initiatingCondition, assumptions: prepared.assumptions,
    suppliedLoad: prepared.suppliedLoad, silEvidenceRef: prepared.silEvidenceRef, lopaEvidenceRef: prepared.lopaEvidenceRef,
    objectId: prepared.object.objectId, objectRevisionFingerprint: prepared.object.fingerprint,
    subjectObjectId: prepared.subject.objectId, subjectRevisionFingerprint: prepared.subject.fingerprint,
    caseRecordId: prepared.caseRow.caseRecordId, caseContextFingerprint: prepared.caseRow.fingerprint,
    conditionId: prepared.condition?.conditionId ?? null, conditionFingerprint: prepared.condition?.fingerprint ?? null,
    evidenceId: prepared.evidence?.evidenceId ?? null, evidenceFingerprint: prepared.evidence?.fingerprint ?? null,
    dutyRequirementId: prepared.duty?.dutyRequirementId ?? null, dutyRevisionFingerprint: prepared.duty?.fingerprint ?? null,
    utilityRecordId: prepared.utility?.utilityRecordId ?? null, utilityRevisionFingerprint: prepared.utility?.fingerprint ?? null,
    mechanicalObjectId: prepared.mechanical?.objectId ?? null, mechanicalRevisionFingerprint: prepared.mechanical?.fingerprint ?? null,
    pipingLineObjectId: prepared.line.objectId, pipingLineRevisionFingerprint: prepared.line.fingerprint,
    provenanceRef: prepared.provenanceRef, sourceBasisRef: prepared.sourceBasisRef, applicability: prepared.applicability, limitations: prepared.limitations,
    predecessorRecordId: predecessor?.recordId ?? null,
  });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.records.find((row) => row.recordId === recordId);
  if (existing) return existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId ? existing : fail("DUPLICATE_RECORD_REJECTED");
  const duplicate = store.records.find((row) => row.recordStatus === "CURRENT" && row.recordId !== predecessor?.recordId && row.recordKind === recordKind && row.subjectObjectId === prepared.subject.objectId && row.caseRecordId === prepared.caseRow.caseRecordId && row.statement === prepared.statement && row.studyKind === studyKind && row.safeguardIntent === safeguardIntent && row.suppliedLoad?.value === prepared.suppliedLoad?.value && row.suppliedLoad?.unit === prepared.suppliedLoad?.unit);
  if (duplicate) fail("DUPLICATE_RECORD_REJECTED");
  if (predecessor) {
    const index = store.records.findIndex((row) => row.recordId === predecessor.recordId);
    store.records[index] = Object.freeze({ ...predecessor, recordStatus: "SUPERSEDED", currentness: "SUPERSEDED" });
    remember(store, predecessor.recordKind, predecessor.recordId, "SUPERSEDED", predecessor.fingerprint);
  }
  const record: D6R6Record = {
    recordId, recordKind, objectType, scenarioClass, studyKind, studyReference: prepared.studyReference, safeguardIntent,
    statement: prepared.statement, initiatingCondition: prepared.initiatingCondition, assumptions: prepared.assumptions,
    suppliedLoad: prepared.suppliedLoad, silEvidenceRef: prepared.silEvidenceRef, lopaEvidenceRef: prepared.lopaEvidenceRef,
    contextId: prepared.context.contextId, objectId: prepared.object.objectId, objectRevisionFingerprint: prepared.object.fingerprint,
    subjectObjectId: prepared.subject.objectId, subjectRevisionFingerprint: prepared.subject.fingerprint,
    tenantId: actor.tenantId, workspaceId: actor.workspaceId, projectId: actor.projectId, discipline: D6_DISCIPLINE,
    caseClass: input.caseClass as "OPERATING" | "DESIGN", caseRecordId: prepared.caseRow.caseRecordId, caseContextFingerprint: prepared.caseRow.fingerprint,
    conditionId: prepared.condition?.conditionId ?? null, conditionFingerprint: prepared.condition?.fingerprint ?? null,
    evidenceId: prepared.evidence?.evidenceId ?? null, evidenceFingerprint: prepared.evidence?.fingerprint ?? null,
    dutyRequirementId: prepared.duty?.dutyRequirementId ?? null, dutyRevisionFingerprint: prepared.duty?.fingerprint ?? null,
    utilityRecordId: prepared.utility?.utilityRecordId ?? null, utilityRevisionFingerprint: prepared.utility?.fingerprint ?? null,
    mechanicalObjectId: prepared.mechanical?.objectId ?? null, mechanicalRevisionFingerprint: prepared.mechanical?.fingerprint ?? null,
    pipingLineObjectId: prepared.line.objectId, pipingLineRevisionFingerprint: prepared.line.fingerprint,
    citedLifecycleStage: prepared.stage, provenanceRef: prepared.provenanceRef, sourceBasisRef: prepared.sourceBasisRef,
    applicability: prepared.applicability, limitations: prepared.limitations, citedCurrentness: prepared.cited,
    authority: D6_CONTEXT_AUTHORITY, ...CLOSED_FLAGS, fingerprint, recordedBy: actor.actorId, recordedAt: store.now(),
    recordStatus: "CURRENT", currentness: "CURRENT", predecessorRecordId: predecessor?.recordId ?? null,
  };
  store.records.push(record);
  remember(store, recordKind, recordId, "CREATED", fingerprint);
  return record;
}

export function recordProcessSafetyContext(store: D6R6Store, actor: D6R1Actor, input: D6R6Input): D6R6Record {
  return recordContext(store, actor, input, "SAFETY_CONTEXT");
}

export function recordHazardStudyContext(store: D6R6Store, actor: D6R1Actor, input: D6R6Input): D6R6Record {
  return recordContext(store, actor, input, "HAZARD_STUDY");
}

export function recordProcessHazardFinding(store: D6R6Store, actor: D6R1Actor, input: D6R6Input): D6R6Record {
  return recordContext(store, actor, input, "HAZARD_FINDING");
}

export function recordReliefScenarioContext(store: D6R6Store, actor: D6R1Actor, input: D6R6Input): D6R6Record {
  return recordContext(store, actor, input, "RELIEF_SCENARIO");
}

export function recordDepressuringContext(store: D6R6Store, actor: D6R1Actor, input: D6R6Input): D6R6Record {
  return recordContext(store, actor, input, "DEPRESSURING");
}

export function recordProcessSafeguardRequirement(store: D6R6Store, actor: D6R1Actor, input: D6R6Input): D6R6Record {
  return recordContext(store, actor, input, "SAFEGUARD_REQUIREMENT");
}

export function calculateReliefLoad(): never {
  return fail("RELIEF_NOT_CALCULATED");
}

export function sizeReliefDevice(): never {
  return fail("RELIEF_DEVICE_NOT_SIZED");
}

export function selectReliefDevice(): never {
  return fail("RELIEF_DEVICE_NOT_SELECTED");
}

export function performDepressuringCalculation(): never {
  return fail("DEPRESSURING_NOT_CALCULATED");
}

export function determineSilTarget(): never {
  return fail("SIL_NOT_DETERMINED");
}

export function performLopa(): never {
  return fail("SIL_NOT_DETERMINED");
}

export function designProcessSafeguard(): never {
  return fail("SAFEGUARD_NOT_DESIGNED");
}

export function acceptProcessRisk(): never {
  return fail("RISK_NOT_ACCEPTED");
}

export function validateProcessSafety(): never {
  return fail("VALIDATION_NOT_IN_R6");
}
