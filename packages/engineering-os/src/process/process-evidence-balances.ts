/**
 * EOS-D6-R4 Process calculation evidence and balances.
 * One bounded runtime on exact R1-R3 revisions. Supplied external evidence only.
 */
import {
  D6_CALCULATION_EVIDENCE_CLASSES,
  D6_CURRENTNESS_STATES,
  D6_IMPLEMENTATION_PHASE_TYPES,
  D6_IMPLEMENTATION_PHASES,
  D6_MATURITY_STATES,
  D6_PHASE_CLASSIFICATIONS,
  PROCESS_CALCULATION_EVIDENCE_EQUALS_CODE_CONFORMANCE,
  PROCESS_CALCULATION_EVIDENCE_EQUALS_VALIDATED_PROCESS_DESIGN,
} from "@rtb/types";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
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
  D6_DESIGN_BASIS_CONDITION_RUNTIME_READY as R3_CONDITION_READY,
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
  D6_EQUIPMENT_DUTY_RUNTIME_COUNT,
  D6_HYDRAULIC_CALCULATION_RUNTIME_COUNT,
  D6_MASS_BALANCE_CALCULATION_RUNTIME_COUNT,
  D6_PRESSURE_DROP_CALCULATION_RUNTIME_COUNT,
  D6_PROCESS_CALCULATION_RUNTIME_COUNT,
  D6_PROCESS_IDENTITY_RUNTIME_READY as R1_IDENTITY_READY,
  D6_PROCESS_SAFETY_RELIEF_RUNTIME_COUNT,
  D6_RELIEF_CALCULATION_RUNTIME_COUNT,
  D6_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_COUNT,
  D6_REUSES_CANONICAL_CURRENTNESS,
  D6_REUSES_CANONICAL_DIGITAL_THREAD,
  D6_REUSES_CANONICAL_FINGERPRINT,
  D6_REVIEW_VALIDATION_RUNTIME_COUNT,
  D6_RUNTIME_COUNT as R3_RUNTIME_COUNT,
  D6_SYSTEM_STREAM_SERVICE_RUNTIME_READY as R2_CONTEXT_READY,
  D6_UTILITY_CALCULATION_RUNTIME_COUNT,
  D7_RUNTIME_STARTED,
  D8_RUNTIME_STARTED,
  D9_RUNTIME_COUNT,
  D9_RUNTIME_STARTED,
  DATABASE_SCHEMA_CHANGED,
  EXACT_D5_LINE_REVISION_REQUIRED_WHEN_REFERENCED,
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
  UNAUTHORIZED_PROCESS_EQUIPMENT_DUTY_PROMOTION,
  UNAUTHORIZED_PROCESS_SAFETY_PROMOTION,
  UNAUTHORIZED_PROCESS_VALIDATION_PROMOTION,
  UNAUTHORIZED_PRODUCT_CLAIM,
  UNAUTHORIZED_THERMODYNAMIC_CALCULATION_PROMOTION,
  type D6R3Store,
} from "./operating-design-basis-conditions";

export const D6_R4_STATUS = "PROCESS_EVIDENCE_AND_BALANCES_IMPLEMENTED" as const;
export const D6_R4_MATURITY = D6_R4_STATUS;
export const D6_R4_MATURITY_STATE = D6_R4_STATUS;
export const D6_R4_CLOSEOUT_PATH =
  "docs/architecture/engineering-os/EOS_D6_R4_PROCESS_EVIDENCE_AND_BALANCES_CLOSEOUT.md" as const;
export const D6_R1_IDENTITY_REUSED = R1_IDENTITY_READY;
export const D6_R2_SYSTEM_STREAM_SERVICE_CONTEXT_REUSED = R2_CONTEXT_READY;
export const D6_R3_DESIGN_BASIS_CONDITION_CONTEXT_REUSED = R3_CONDITION_READY;
export const EXACT_D6_R1_R3_REFERENCE_REQUIRED = true as const;
export const FLOATING_D6_R4_SOURCE_REFERENCE_ALLOWED = false as const;
export const D6_R4_SOURCE_AUTO_REPOINTED = false as const;
export const D6_RUNTIME_STARTED = true as const;
export const D6_RUNTIME_COUNT = 4 as const;
export const D6_R3_RUNTIME_COUNT = R3_RUNTIME_COUNT;
export const D6_PROCESS_IDENTITY_RUNTIME_READY = R1_IDENTITY_READY;
export const D6_SYSTEM_STREAM_SERVICE_RUNTIME_READY = R2_CONTEXT_READY;
export const D6_DESIGN_BASIS_CONDITION_RUNTIME_READY = R3_CONDITION_READY;
export const D6_PROCESS_EVIDENCE_RUNTIME_IMPLEMENTED = true as const;
export const D6_PROCESS_EVIDENCE_RUNTIME_COUNT = 1 as const;
export const D6_PROCESS_EVIDENCE_RUNTIME_READY = true as const;
export const D6_EXTERNAL_PROCESS_CALCULATION_EVIDENCE_SUPPORTED = true as const;
export const D6_MASS_BALANCE_EVIDENCE_CONTEXT_IMPLEMENTED = true as const;
export const MASS_BALANCE_EVIDENCE_EQUALS_MASS_BALANCE_CALCULATED_BY_EOS = false as const;
export const MASS_BALANCE_EVIDENCE_EQUALS_VALIDATED_PROCESS_DESIGN = false as const;
export const MASS_BALANCE_EVIDENCE_EQUALS_CODE_CONFORMANCE = false as const;
export const D6_ENERGY_BALANCE_EVIDENCE_CONTEXT_IMPLEMENTED = true as const;
export const ENERGY_BALANCE_EVIDENCE_EQUALS_ENERGY_BALANCE_CALCULATED_BY_EOS = false as const;
export const ENERGY_BALANCE_EVIDENCE_EQUALS_VALIDATED_PROCESS_DESIGN = false as const;
export const D6_HYDRAULIC_EVIDENCE_CONTEXT_IMPLEMENTED = true as const;
export const HYDRAULIC_EVIDENCE_EQUALS_HYDRAULIC_CALCULATION_BY_EOS = false as const;
export const HYDRAULIC_EVIDENCE_EQUALS_VALIDATED_PROCESS_DESIGN = false as const;
export const D6_PRESSURE_DROP_EVIDENCE_CONTEXT_IMPLEMENTED = true as const;
export const PRESSURE_DROP_EVIDENCE_EQUALS_PRESSURE_DROP_CALCULATED_BY_EOS = false as const;
export const PRESSURE_DROP_EVIDENCE_EQUALS_PIPING_DESIGN_VALIDATED = false as const;
export const D6_THERMODYNAMIC_PROPERTY_EVIDENCE_CONTEXT_IMPLEMENTED = true as const;
export const THERMODYNAMIC_EVIDENCE_EQUALS_THERMODYNAMIC_CALCULATION_BY_EOS = false as const;
export const PROPERTY_EVIDENCE_EQUALS_VALIDATED_PROPERTY_MODEL = false as const;
export const PHASE_EQUILIBRIUM_EVIDENCE_EQUALS_EOS_PHASE_CALCULATION = false as const;
export const EXACT_D6_R3_CASE_REVISION_REQUIRED_FOR_R4_EVIDENCE = true as const;
export const EXACT_D6_R3_CONDITION_REVISION_REQUIRED_WHEN_REFERENCED = true as const;
export const D6_R4_INPUT_VALUES_EXPLICIT = true as const;
export const D6_R4_RESULT_VALUES_EXPLICIT = true as const;
export const PROCESS_INPUT_VALUE_EQUALS_PROCESS_RESULT_VALUE = false as const;
export const SUPPLIED_RESULT_EQUALS_ADOPTED_PROCESS_CONDITION = false as const;
export const D6_R4_AUTO_MUTATES_R3_OPERATING_CONDITION = false as const;
export const D6_R4_AUTO_MUTATES_R3_DESIGN_CONDITION = false as const;
export const D6_R4_AUTO_MUTATES_R3_DESIGN_BASIS = false as const;
export const D6_R4_AUTO_REPOINTS_R3_CASE = false as const;
export const D6_R4_EVIDENCE_UNITS_REQUIRED = true as const;
export const D6_R4_EVIDENCE_UNITS_PRESERVED = true as const;
export const AI_CAN_SILENTLY_CHANGE_D6_R4_EVIDENCE_UNITS = false as const;
export const D6_R4_EVIDENCE_ASSUMPTIONS_EXPLICIT = true as const;
export const D6_R4_EVIDENCE_INPUT_BASIS_TRACEABLE = true as const;
export const AI_CAN_INVENT_D6_R4_ENGINEERING_ASSUMPTION = false as const;
export const D6_R4_SOURCE_TOOL_TRACEABLE = true as const;
export const D6_R4_SOURCE_MODEL_REVISION_TRACEABLE = true as const;
export const EXTERNAL_PROCESS_EVIDENCE_EQUALS_EOS_VALIDATION = false as const;
export const EXTERNAL_TOOL_RESULT_EQUALS_PROCESS_CONFORMANCE = false as const;
export const EXTERNAL_TOOL_RESULT_EQUALS_PROCESS_APPROVAL = false as const;
export const D6_R4_HIDDEN_CALCULATION_ALLOWED = false as const;
export const D6_R4_AUTO_CLOSES_MASS_BALANCE = false as const;
export const D6_R4_AUTO_CLOSES_ENERGY_BALANCE = false as const;
export const D6_R4_ADJUSTS_EVIDENCE_TO_FORCE_BALANCE = false as const;
export const D6_R4_NORMALIZES_COMPOSITION_TO_ENGINEERING_TRUTH = false as const;
export const D6_R4_DERIVES_MISSING_FLOW = false as const;
export const D6_R4_DERIVES_MISSING_PROPERTY = false as const;
export const D6_R4_DERIVES_MISSING_PRESSURE = false as const;
export const D6_R4_DERIVES_MISSING_TEMPERATURE = false as const;
export const D6_R4_EVIDENCE_QUALITY_CONTEXT_SUPPORTED = true as const;
export const D6_R4_LIMITATIONS_EXPLICIT = true as const;
export const D6_R4_APPLICABILITY_EXPLICIT = true as const;
export const EVIDENCE_QUALITY_CONTEXT_EQUALS_ENGINEERING_ACCEPTANCE = false as const;
export const MASS_BALANCE_EVIDENCE_AUTO_PROMOTED_TO_VALIDATED = false as const;
export const ENERGY_BALANCE_EVIDENCE_AUTO_PROMOTED_TO_VALIDATED = false as const;
export const HYDRAULIC_EVIDENCE_AUTO_PROMOTED_TO_VALIDATED = false as const;
export const THERMODYNAMIC_EVIDENCE_AUTO_PROMOTED_TO_VALIDATED = false as const;
export const D6_R4_VALIDATES_D5_PIPING_ENGINEERING = false as const;
export const D6_R4_TRANSFERS_D5_AUTHORITY = false as const;
export const HYDRAULIC_EVIDENCE_EQUALS_PIPING_LINE_SIZING_VALIDATED = false as const;
export const PRESSURE_DROP_EVIDENCE_EQUALS_PIPING_DESIGN_CONFORMANT = false as const;
export const D6_R4_SOURCE_BASIS_REQUIRED = true as const;
export const D6_R4_SOURCE_BASIS_TRACEABLE = true as const;
export const BASISLESS_AUTHORITATIVE_D6_R4_EVIDENCE_AUTO_ACCEPTED = false as const;
export const D6_R4_HISTORY_PRESERVED = true as const;
export const D6_R4_AUTO_REPOINTED = false as const;
export const SILENT_D6_R4_MUTATION_ALLOWED = false as const;
export const D6_R4_PROVENANCE_REQUIRED = true as const;
export const D6_R4_PROVENANCE_PRESERVED = true as const;
export const TENANT_WORKSPACE_PROJECT_D6_R4_SCOPE_ENFORCED = true as const;
export const CROSS_TENANT_D6_R4_ACCESS_ALLOWED = false as const;
export const AI_CAN_INVENT_AUTHORITATIVE_D6_PROCESS_EVIDENCE = false as const;
export const AI_CAN_INVENT_AUTHORITATIVE_D6_PROCESS_RESULT = false as const;
export const ADMIN_CAN_PROMOTE_UNGOVERNED_D6_EVIDENCE_TO_VALIDATED = false as const;
export const D6_R4_DUPLICATE_GOVERNANCE_IMPLEMENTED = true as const;
export const D6_R4_REPLAY_PROTECTION_IMPLEMENTED = true as const;
export const D6_R4_SPOOFING_PROTECTION_IMPLEMENTED = true as const;
export const UNAUTHORIZED_D6_R5_R12_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_BALANCE_CALCULATION_PROMOTION = false as const;
export const UNAUTHORIZED_EVIDENCE_PROMOTION = false as const;
export const D6_R5_CANONICAL_PHASE = D6_IMPLEMENTATION_PHASES[4];
export const D6_R5_PHASE_TYPE = D6_IMPLEMENTATION_PHASE_TYPES[4];
export const D6_R5_CANONICAL_SCOPE =
  "Implement governed Process equipment-duty, capacity/performance requirement and utility-context records using exact R1-R4 revisions and supplied evidence. Preserve the boundary between Process duty/requirement and D4 Mechanical equipment design or validated equipment selection. Do not calculate equipment duty, select equipment, size equipment, calculate utilities, mutate D4 records, perform Process-safety calculations, validate engineering or perform D9 reasoning." as const;
export const D6_R5_STARTED = false as const;
export const D6_R4_READY_FOR_NEXT_PHASE = true as const;
export const D6_R4_NEXT_PHASE = D6_R5_CANONICAL_PHASE;
export const D6_R4_NEXT_PHASE_TYPE = D6_R5_PHASE_TYPE;
export const D6_R4_CANONICAL_NEXT_PHASE = D6_R5_CANONICAL_PHASE;
export const D6_R4_CANONICAL_NEXT_PHASE_SCOPE = D6_R5_CANONICAL_SCOPE;
export const D6_R4_BLOCKER = "NONE" as const;
export const D6_R4_MACHINE_READABLE_ROADMAP_UPDATED = true as const;

const R4_EVIDENCE_CLASSES = ["MASS_BALANCE", "ENERGY_BALANCE", "HYDRAULIC", "PRESSURE_DROP", "HEAT_DUTY", "OTHER_PROCESS_CALCULATION"] as const;
const RESERVED_EVIDENCE_CLASSES = ["EQUIPMENT_DUTY", "RELIEF_LOAD", "DEPRESSURING", "UTILITY_CONSUMPTION"] as const;
const OTHER_CONTEXTS = ["THERMODYNAMIC_PROPERTY", "FLOW_PROPERTY"] as const;

export {
  D6_REUSES_CANONICAL_CURRENTNESS,
  D6_REUSES_CANONICAL_DIGITAL_THREAD,
  D6_REUSES_CANONICAL_FINGERPRINT,
  PARALLEL_D6_CURRENTNESS_ENGINE_CREATED,
  PARALLEL_D6_DIGITAL_THREAD_CREATED,
  SECOND_D6_FINGERPRINT_ALGORITHM_CREATED,
  PROCESS_CALCULATION_EVIDENCE_EQUALS_VALIDATED_PROCESS_DESIGN,
  PROCESS_CALCULATION_EVIDENCE_EQUALS_CODE_CONFORMANCE,
  EXACT_D5_LINE_REVISION_REQUIRED_WHEN_REFERENCED,
  AI_EQUALS_D6_PROCESS_ENGINEERING_AUTHORITY,
  ADMIN_EQUALS_D6_PROCESS_ENGINEERING_AUTHORITY,
  D6_EQUALS_D1_STRUCTURAL_AUTHORITY,
  D6_EQUALS_D2_CIVIL_AUTHORITY,
  D6_EQUALS_D3_GEOTECHNICAL_AUTHORITY,
  D6_EQUALS_D4_MECHANICAL_AUTHORITY,
  D6_EQUALS_D5_PIPING_AUTHORITY,
  D6_EQUALS_D7_ELECTRICAL_AUTHORITY,
  D6_EQUALS_D8_INSTRUMENTATION_CONTROL_AUTHORITY,
  D6_MASS_BALANCE_CALCULATION_RUNTIME_COUNT,
  D6_ENERGY_BALANCE_CALCULATION_RUNTIME_COUNT,
  D6_HYDRAULIC_CALCULATION_RUNTIME_COUNT,
  D6_PRESSURE_DROP_CALCULATION_RUNTIME_COUNT,
  D6_EQUIPMENT_DUTY_RUNTIME_COUNT,
  D6_EQUIPMENT_DUTY_CALCULATION_RUNTIME_COUNT,
  D6_UTILITY_CALCULATION_RUNTIME_COUNT,
  D6_PROCESS_SAFETY_RELIEF_RUNTIME_COUNT,
  D6_RELIEF_CALCULATION_RUNTIME_COUNT,
  D6_DEPRESSURING_CALCULATION_RUNTIME_COUNT,
  D6_DISCIPLINE_INTERFACE_RUNTIME_COUNT,
  D6_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_COUNT,
  D6_REVIEW_VALIDATION_RUNTIME_COUNT,
  D6_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT,
  D6_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
  D6_D9_RUNTIME_INTEGRATION_COUNT,
  D6_PROCESS_CALCULATION_RUNTIME_COUNT,
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
  UNAUTHORIZED_THERMODYNAMIC_CALCULATION_PROMOTION,
  UNAUTHORIZED_PROCESS_EQUIPMENT_DUTY_PROMOTION,
  UNAUTHORIZED_PROCESS_SAFETY_PROMOTION,
  UNAUTHORIZED_PROCESS_VALIDATION_PROMOTION,
  UNAUTHORIZED_DISCIPLINE_AUTHORITY_TRANSFER,
  UNAUTHORIZED_CROSS_DISCIPLINE_REASONING_PROMOTION,
  UNAUTHORIZED_GA_PROMOTION,
  UNAUTHORIZED_PRODUCT_CLAIM,
};

const FLOATING = new Set(["latest", "current", "newest", "head", "active", "active model", "now"]);
const INFERRED = new Set(["inferred", "matching_name", "similar_value", "document_proximity", "ai_inference", "auto_max", "auto_min"]);
const BROAD = new Set(["all", "global", "every", "any"]);

type Currentness = (typeof D6_CURRENTNESS_STATES)[number];
type Stage = (typeof D6_MATURITY_STATES)[number];
type EvidenceClass = (typeof R4_EVIDENCE_CLASSES)[number];
type EvidenceContext = "MASS_BALANCE" | "ENERGY_BALANCE" | "HYDRAULIC" | "PRESSURE_DROP" | "THERMODYNAMIC_PROPERTY" | "FLOW_PROPERTY";

type Prohibited = {
  calculation?: boolean;
  hiddenCalculation?: boolean;
  closeMassBalance?: boolean;
  closeEnergyBalance?: boolean;
  adjustToForceBalance?: boolean;
  normalizeComposition?: boolean;
  deriveFlow?: boolean;
  deriveProperty?: boolean;
  derivePressure?: boolean;
  deriveTemperature?: boolean;
  thermodynamicCalculation?: boolean;
  phaseEquilibriumCalculation?: boolean;
  propertyPackageCalculation?: boolean;
  equateInputToResult?: boolean;
  copyResultFromInput?: boolean;
  mutateOperatingCondition?: boolean;
  mutateDesignCondition?: boolean;
  mutateDesignBasis?: boolean;
  repointCase?: boolean;
  adoptResult?: boolean;
  autoPromote?: boolean;
  acceptEvidence?: boolean;
  toolValidated?: boolean;
  inventAssumption?: boolean;
  inventEvidence?: boolean;
  inventResult?: boolean;
  normalizedUnit?: string | null;
  convertedValue?: string | null;
  validatePiping?: boolean;
  transferD5Authority?: boolean;
  createEquipmentDuty?: boolean;
  relief?: boolean;
  depressuring?: boolean;
  utilityCalculation?: boolean;
  equipmentDuty?: boolean;
};

export type D6R4Measure = { value: string; unit: string };

export type D6R4ValueInput = {
  valueId: string;
  role: string;
  name: string;
  valueKind: string;
  value?: string | null;
  unit?: string | null;
  basisRef: string;
  normalizedUnit?: string | null;
  convertedValue?: string | null;
};

export type D6R4Value = {
  valueId: string;
  role: "INPUT" | "RESULT";
  name: string;
  valueKind: "QUANTITY" | "REFERENCE";
  measure: D6R4Measure;
  basisRef: string;
};

export type D6R4ConditionRef = { conditionId: string; fingerprint: string };

export type D6R4EvidenceInput = Prohibited & {
  contextId: string;
  objectId: string;
  objectRevisionFingerprint: string;
  subjectObjectId: string;
  subjectRevisionFingerprint: string;
  evidenceId: string;
  evidenceClass: string;
  evidenceContext?: string | null;
  caseClass: string;
  caseRecordId: string;
  caseContextFingerprint: string;
  conditionReferences?: D6R4ConditionRef[] | null;
  designBasisRecordId?: string | null;
  designBasisFingerprint?: string | null;
  r2StreamRecordId?: string | null;
  r2StreamFingerprint?: string | null;
  r2SystemRecordId?: string | null;
  r2SystemFingerprint?: string | null;
  pipingLineObjectId?: string | null;
  pipingLineRevisionFingerprint?: string | null;
  sourceToolName: string;
  sourceToolVersion: string;
  sourceModelRevision: string;
  sourceReportRef: string;
  executionTimestamp?: string | null;
  sourceAuthorityRef: string;
  assumptions?: string[] | null;
  values?: D6R4ValueInput[] | null;
  qualityStatement?: string | null;
  citedLifecycleStage: string;
  provenanceRef: string;
  sourceBasisRef: string;
  citedCurrentness: string;
  applicability: string;
  limitations: string;
  assertedFingerprint?: string;
  predecessorEvidenceId?: string | null;
  tenantId?: string;
  workspaceId?: string;
  projectId?: string;
};

export type D6R4EvidenceRecord = {
  evidenceId: string;
  contextId: string;
  objectId: string;
  objectType: "PROCESS_CALCULATION_EVIDENCE";
  objectRevisionFingerprint: string;
  subjectObjectId: string;
  subjectObjectType: "PROCESS_STREAM" | "PROCESS_SYSTEM";
  subjectRevisionFingerprint: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  discipline: typeof D6_DISCIPLINE;
  evidenceClass: EvidenceClass;
  evidenceContext: EvidenceContext;
  caseClass: "OPERATING" | "DESIGN";
  caseRecordId: string;
  caseContextFingerprint: string;
  caseObjectId: string;
  caseRevisionFingerprint: string;
  conditionReferences: { conditionId: string; fingerprint: string; conditionClass: "OPERATING" | "DESIGN" }[];
  designBasisRecordId: string | null;
  designBasisFingerprint: string | null;
  r2StreamRecordId: string | null;
  r2StreamFingerprint: string | null;
  r2SystemRecordId: string | null;
  r2SystemFingerprint: string | null;
  pipingLineObjectId: string | null;
  pipingLineRevisionFingerprint: string | null;
  sourceToolName: string;
  sourceToolVersion: string;
  sourceModelRevision: string;
  sourceReportRef: string;
  executionTimestamp: string | null;
  sourceAuthorityRef: string;
  assumptions: string[];
  inputs: D6R4Value[];
  results: D6R4Value[];
  qualityStatement: string | null;
  engineeringAcceptance: false;
  citedLifecycleStage: Stage;
  provenanceRef: string;
  sourceBasisRef: string;
  applicability: string;
  limitations: string;
  citedCurrentness: Currentness;
  authority: typeof D6_CONTEXT_AUTHORITY;
  processEngineeringAuthority: false;
  calculatedByEos: false;
  validatedProcessDesign: false;
  codeConformance: false;
  eosValidation: false;
  processConformance: false;
  processApproval: false;
  validatedPropertyModel: false;
  phaseCalculatedByEos: false;
  balanceClosedByEos: false;
  valuesAdjusted: false;
  pipingDesignValidated: false;
  pipingLineSizingValidated: false;
  pipingDesignConformant: false;
  adoptedConditionCreated: false;
  equipmentDutyCreated: false;
  processSafetyActivated: false;
  fingerprint: string;
  recordedBy: string;
  recordedAt: string;
  recordStatus: "CURRENT" | "SUPERSEDED";
  currentness: "CURRENT" | "SUPERSEDED";
  predecessorEvidenceId: string | null;
};

export type D6R4History = {
  historyId: string;
  subjectId: string;
  action: "CREATED" | "SUPERSEDED";
  fingerprint: string;
  recordedAt: string;
};

export type D6R4Store = {
  r3: D6R3Store;
  now: () => string;
  evidence: D6R4EvidenceRecord[];
  history: D6R4History[];
};

function fail(code: string): never {
  throw new Error(`D6_R4_${code}`);
}

function blockedParty(value: string): boolean {
  return /^AI(?:\b|_)/i.test(value) || /LLM/i.test(value) || /OPTIMIZER/i.test(value);
}

function explicit(value: string, code: string): string {
  const token = value.trim();
  if (!token || FLOATING.has(token.toLowerCase()) || INFERRED.has(token.toLowerCase()) || BROAD.has(token.toLowerCase()) || blockedParty(token)) fail(code);
  return token;
}

function isStage(value: string): value is Stage {
  return (D6_MATURITY_STATES as readonly string[]).includes(value);
}

function isCurrentness(value: string): value is Currentness {
  return (D6_CURRENTNESS_STATES as readonly string[]).includes(value);
}

function assertActor(actor: D6R1Actor): void {
  if (!actor.actorId.trim() || !actor.tenantId.trim() || !actor.workspaceId.trim() || !actor.projectId.trim()) fail("SCOPE_REQUIRED");
  if (blockedParty(actor.actorId) || blockedParty(actor.authority)) fail("AI_NOT_PROCESS_AUTHORITY");
  if (actor.authority === "ADMINISTRATOR" || actor.authority === "ADMIN") fail("ADMIN_NOT_PROCESS_AUTHORITY");
  if (actor.authority === "PROCESS_ENGINEERING_AUTHORITY") fail("RECORDER_NOT_PROCESS_ENGINEERING_AUTHORITY");
  if (actor.authority !== D6_CONTEXT_AUTHORITY) fail("UNAUTHORIZED");
}

function assertScope(actor: D6R1Actor, input: { tenantId?: string; workspaceId?: string; projectId?: string }): void {
  if (input.tenantId != null && input.tenantId !== actor.tenantId) fail("CROSS_TENANT_OPERATION");
  if (input.workspaceId != null && input.workspaceId !== actor.workspaceId) fail("CROSS_WORKSPACE_OPERATION");
  if (input.projectId != null && input.projectId !== actor.projectId) fail("CROSS_PROJECT_OPERATION");
}

function assertProhibited(input: Prohibited): void {
  if (input.calculation === true || input.hiddenCalculation === true) fail("CALCULATION_NOT_IN_R4");
  if (input.closeMassBalance === true || input.closeEnergyBalance === true || input.adjustToForceBalance === true) fail("BALANCE_NOT_CLOSED");
  if (input.normalizeComposition === true) fail("COMPOSITION_NOT_NORMALIZED");
  if (input.deriveFlow === true || input.deriveProperty === true || input.derivePressure === true || input.deriveTemperature === true) fail("DERIVED_VALUE_REJECTED");
  if (input.thermodynamicCalculation === true || input.phaseEquilibriumCalculation === true || input.propertyPackageCalculation === true) fail("THERMODYNAMIC_NOT_CALCULATED");
  if (input.equateInputToResult === true || input.copyResultFromInput === true) fail("INPUT_NOT_RESULT");
  if (input.mutateOperatingCondition === true || input.mutateDesignCondition === true || input.mutateDesignBasis === true || input.repointCase === true) fail("R3_NOT_MUTATED");
  if (input.adoptResult === true) fail("RESULT_NOT_ADOPTED");
  if (input.autoPromote === true || input.acceptEvidence === true) fail("EVIDENCE_NOT_PROMOTED");
  if (input.toolValidated === true) fail("EXTERNAL_TOOL_NOT_VALIDATION");
  if (input.inventAssumption === true) fail("ASSUMPTION_NOT_INVENTED");
  if (input.inventEvidence === true || input.inventResult === true) fail("EVIDENCE_NOT_INVENTED");
  if (input.normalizedUnit || input.convertedValue != null) fail("UNIT_CHANGE_REJECTED");
  if (input.validatePiping === true || input.transferD5Authority === true) fail("D5_AUTHORITY_NOT_TRANSFERRED");
  if (input.createEquipmentDuty === true || input.equipmentDuty === true || input.utilityCalculation === true) fail("DUTY_NOT_IN_R4");
  if (input.relief === true || input.depressuring === true) fail("PROCESS_SAFETY_NOT_IN_R4");
}

function quantity(value: string | null | undefined, unit: string | null | undefined): D6R4Measure {
  const token = explicit(value == null ? "" : String(value), "VALUE_REQUIRED");
  if (!/^-?\d+(\.\d+)?$/.test(token) && !(D6_PHASE_CLASSIFICATIONS as readonly string[]).includes(token)) fail("VALUE_NOT_SUPPLIED");
  if (!unit || !unit.trim()) fail("UNITS_REQUIRED");
  return { value: token, unit: explicit(unit, "UNIT_INVALID") };
}

function readValues(rows: D6R4ValueInput[] | null | undefined): { inputs: D6R4Value[]; results: D6R4Value[] } {
  if (!rows || rows.length === 0) fail("VALUES_REQUIRED");
  const seen = new Set<string>();
  const values: D6R4Value[] = rows.map((row) => {
    if (row.normalizedUnit || row.convertedValue != null) fail("UNIT_CHANGE_REJECTED");
    const role = row.role === "INPUT" || row.role === "RESULT" ? row.role : fail("VALUE_ROLE_INVALID");
    const valueKind = row.valueKind === "QUANTITY" || row.valueKind === "REFERENCE" ? row.valueKind : fail("VALUE_KIND_INVALID");
    const valueId = explicit(row.valueId, "VALUE_ID_REQUIRED");
    if (seen.has(valueId)) fail("DUPLICATE_VALUE_REJECTED");
    seen.add(valueId);
    const measure = valueKind === "QUANTITY"
      ? quantity(row.value, row.unit)
      : { value: explicit(row.value ?? "", "VALUE_REQUIRED"), unit: explicit(row.unit ?? "", "UNITS_REQUIRED") };
    return { valueId, role, name: explicit(row.name, "VALUE_NAME_REQUIRED"), valueKind, measure, basisRef: explicit(row.basisRef, "INPUT_BASIS_REQUIRED") };
  });
  const inputs = values.filter((row) => row.role === "INPUT");
  const results = values.filter((row) => row.role === "RESULT");
  if (inputs.length === 0) fail("INPUT_REQUIRED");
  if (results.length === 0) fail("RESULT_REQUIRED");
  return { inputs, results };
}

function readAssumptions(rows: string[] | null | undefined): string[] {
  if (!rows || rows.length === 0) fail("ASSUMPTIONS_REQUIRED");
  return rows.map((row) => explicit(row, "ASSUMPTION_INVALID"));
}

function evidenceContextFor(evidenceClass: EvidenceClass, requested: string | null | undefined): EvidenceContext {
  const expected = evidenceClass === "HEAT_DUTY" || evidenceClass === "ENERGY_BALANCE"
    ? "ENERGY_BALANCE"
    : evidenceClass === "OTHER_PROCESS_CALCULATION"
      ? null
      : evidenceClass;
  if (evidenceClass === "OTHER_PROCESS_CALCULATION") {
    const context = explicit(requested ?? "", "EVIDENCE_CONTEXT_REQUIRED");
    if (!(OTHER_CONTEXTS as readonly string[]).includes(context)) fail("EVIDENCE_CONTEXT_INVALID");
    return context as EvidenceContext;
  }
  if (requested != null && requested.trim() !== "" && requested !== expected) fail("EVIDENCE_CONTEXT_MISMATCH");
  return expected as EvidenceContext;
}

function requireObject(store: D6R4Store, actor: D6R1Actor, contextId: string, objectId: string, revision: string, allowed: readonly string[], cited: Currentness) {
  const id = explicit(objectId, "R1_OBJECT_REQUIRED");
  const rev = explicit(revision, "R1_REVISION_REQUIRED");
  const object = store.r3.r2.r1.objects.find((row) => row.objectId === id);
  if (!object || !allowed.includes(object.objectType)) fail("R1_OBJECT_NOT_FOUND");
  if (object.fingerprint !== rev) fail("R1_REVISION_MISMATCH");
  if (object.contextId !== contextId) fail("R1_CONTEXT_MISMATCH");
  if (object.tenantId !== actor.tenantId || object.workspaceId !== actor.workspaceId || object.projectId !== actor.projectId) fail("CROSS_SCOPE_OPERATION");
  if (cited === "CURRENT" && object.recordStatus !== "CURRENT") fail("R1_OBJECT_NOT_CURRENT");
  return object;
}

function requireCase(store: D6R4Store, actor: D6R1Actor, caseClass: string, recordId: string, fingerprint: string) {
  if (caseClass !== "OPERATING" && caseClass !== "DESIGN") fail("CASE_CLASS_INVALID");
  const rows = caseClass === "OPERATING" ? store.r3.operatingCases : store.r3.designCases;
  const id = explicit(recordId, "CASE_REVISION_REQUIRED");
  const revision = explicit(fingerprint, "CASE_REVISION_REQUIRED");
  const row = rows.find((item) => item.caseRecordId === id);
  if (!row || row.fingerprint !== revision || row.tenantId !== actor.tenantId || row.workspaceId !== actor.workspaceId || row.projectId !== actor.projectId || row.recordStatus !== "CURRENT") fail("CASE_REVISION_MISMATCH");
  return row;
}

function requireConditions(store: D6R4Store, actor: D6R1Actor, refs: D6R4ConditionRef[] | null | undefined, caseRecordId: string, subjectObjectId: string) {
  if (refs == null) return [];
  return refs.map((ref) => {
    const id = explicit(ref.conditionId, "CONDITION_REFERENCE_REQUIRED");
    const revision = explicit(ref.fingerprint ?? "", "CONDITION_REVISION_REQUIRED");
    const row = store.r3.conditions.find((item) => item.conditionId === id);
    if (!row || row.fingerprint !== revision || row.recordStatus !== "CURRENT") fail("CONDITION_REVISION_MISMATCH");
    if (row.tenantId !== actor.tenantId || row.workspaceId !== actor.workspaceId || row.projectId !== actor.projectId) fail("CROSS_SCOPE_OPERATION");
    if (row.caseRecordId !== caseRecordId || row.objectId !== subjectObjectId) fail("CONDITION_SUBJECT_MISMATCH");
    return { conditionId: row.conditionId, fingerprint: row.fingerprint, conditionClass: row.conditionClass };
  });
}

function optionalBasis(store: D6R4Store, actor: D6R1Actor, recordId: string | null | undefined, fingerprint: string | null | undefined) {
  const hasId = recordId != null && recordId.trim() !== "";
  const hasRevision = fingerprint != null && fingerprint.trim() !== "";
  if (!hasId && !hasRevision) return { recordId: null as string | null, fingerprint: null as string | null };
  if (!hasId || !hasRevision) fail("BASIS_REVISION_REQUIRED");
  const id = explicit(recordId as string, "BASIS_REFERENCE_REQUIRED");
  const revision = explicit(fingerprint as string, "BASIS_REVISION_REQUIRED");
  const row = store.r3.bases.find((item) => item.basisRecordId === id);
  if (!row || row.fingerprint !== revision || row.tenantId !== actor.tenantId || row.recordStatus !== "CURRENT") fail("BASIS_REVISION_MISMATCH");
  return { recordId: row.basisRecordId, fingerprint: row.fingerprint };
}

function requireSubjectContext(store: D6R4Store, actor: D6R1Actor, subject: D6R1ObjectRecord, input: D6R4EvidenceInput, cited: Currentness) {
  if (subject.objectType === "PROCESS_STREAM") {
    const id = explicit(input.r2StreamRecordId ?? "", "R2_STREAM_REQUIRED");
    const revision = explicit(input.r2StreamFingerprint ?? "", "R2_STREAM_REVISION_REQUIRED");
    const row = store.r3.r2.streams.find((item) => item.streamRecordId === id);
    if (!row || row.fingerprint !== revision || row.objectId !== subject.objectId || row.objectRevisionFingerprint !== subject.fingerprint) fail("R2_STREAM_REVISION_MISMATCH");
    if (row.tenantId !== actor.tenantId || row.workspaceId !== actor.workspaceId || row.projectId !== actor.projectId) fail("CROSS_SCOPE_OPERATION");
    if (cited === "CURRENT" && row.recordStatus !== "CURRENT") fail("R2_CONTEXT_NOT_CURRENT");
    return { streamRecordId: row.streamRecordId, streamFingerprint: row.fingerprint, systemRecordId: null as string | null, systemFingerprint: null as string | null, lineObjectId: row.pipingLineObjectId, lineFingerprint: row.pipingLineRevisionFingerprint };
  }
  const id = explicit(input.r2SystemRecordId ?? "", "R2_SYSTEM_REQUIRED");
  const revision = explicit(input.r2SystemFingerprint ?? "", "R2_SYSTEM_REVISION_REQUIRED");
  const row = store.r3.r2.systems.find((item) => item.systemRecordId === id);
  if (!row || row.fingerprint !== revision || row.objectId !== subject.objectId || row.objectRevisionFingerprint !== subject.fingerprint) fail("R2_SYSTEM_REVISION_MISMATCH");
  if (row.tenantId !== actor.tenantId || row.workspaceId !== actor.workspaceId || row.projectId !== actor.projectId) fail("CROSS_SCOPE_OPERATION");
  if (cited === "CURRENT" && row.recordStatus !== "CURRENT") fail("R2_CONTEXT_NOT_CURRENT");
  return { streamRecordId: null as string | null, streamFingerprint: null as string | null, systemRecordId: row.systemRecordId, systemFingerprint: row.fingerprint, lineObjectId: null as string | null, lineFingerprint: null as string | null };
}

function citeLine(streamLineId: string | null, streamLineFingerprint: string | null, objectId: string | null | undefined, revision: string | null | undefined, store: D6R4Store) {
  const hasId = objectId != null && objectId.trim() !== "";
  const hasRevision = revision != null && revision.trim() !== "";
  if (!hasId && !hasRevision) return { objectId: null as string | null, fingerprint: null as string | null };
  if (!hasId || !hasRevision) fail("D5_LINE_REVISION_REQUIRED");
  const id = explicit(objectId as string, "D5_LINE_REFERENCE_REQUIRED");
  const rev = explicit(revision as string, "D5_LINE_REVISION_REQUIRED");
  if (streamLineId !== id || streamLineFingerprint !== rev) fail("D5_REFERENCE_MISMATCH");
  const line = store.r3.r2.d5.objects.find((row) => row.objectId === id && row.objectType === "PIPING_LINE");
  if (!line || line.fingerprint !== rev) fail("D5_LINE_NOT_FOUND");
  return { objectId: id, fingerprint: rev };
}

function sameLineage(store: D6R4Store, object: D6R1ObjectRecord, priorObjectId: string): boolean {
  let cursor: D6R1ObjectRecord | undefined = object;
  const seen = new Set<string>();
  while (cursor && !seen.has(cursor.objectId)) {
    if (cursor.objectId === priorObjectId) return true;
    seen.add(cursor.objectId);
    cursor = cursor.predecessorObjectId ? store.r3.r2.r1.objects.find((row) => row.objectId === cursor?.predecessorObjectId) : undefined;
  }
  return false;
}

function valueKey(inputs: D6R4Value[], results: D6R4Value[]): string {
  return [...inputs, ...results].map((row) => `${row.role}|${row.name}|${row.measure.value}|${row.measure.unit}`).sort().join(";");
}

export function createD6R4Store(r3: D6R3Store, now: () => string = () => "2026-10-24T00:00:00.000Z"): D6R4Store {
  return { r3, now, evidence: [], history: [] };
}

export function recordProcessCalculationEvidence(store: D6R4Store, actor: D6R1Actor, input: D6R4EvidenceInput): D6R4EvidenceRecord {
  assertActor(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const cited = input.citedCurrentness.trim();
  if (!isCurrentness(cited)) fail("CURRENTNESS_INVALID");
  const contextId = explicit(input.contextId, "R1_CONTEXT_REQUIRED");
  const context = store.r3.r2.r1.contexts.find((row) => row.contextId === contextId);
  if (!context || context.tenantId !== actor.tenantId || context.workspaceId !== actor.workspaceId || context.projectId !== actor.projectId) fail("R1_CONTEXT_NOT_FOUND");
  if (cited === "CURRENT" && context.recordStatus !== "CURRENT") fail("R1_CONTEXT_NOT_CURRENT");
  const evidenceObject = requireObject(store, actor, context.contextId, input.objectId, input.objectRevisionFingerprint, ["PROCESS_CALCULATION_EVIDENCE"], cited);
  const subject = requireObject(store, actor, context.contextId, input.subjectObjectId, input.subjectRevisionFingerprint, ["PROCESS_STREAM", "PROCESS_SYSTEM"], cited);
  const stage = input.citedLifecycleStage.trim();
  if (!isStage(stage)) fail("MATURITY_STAGE_INVALID");
  const evidenceClassToken = explicit(input.evidenceClass, "EVIDENCE_CLASS_REQUIRED");
  if ((RESERVED_EVIDENCE_CLASSES as readonly string[]).includes(evidenceClassToken)) fail("EVIDENCE_CLASS_RESERVED");
  if (!(D6_CALCULATION_EVIDENCE_CLASSES as readonly string[]).includes(evidenceClassToken) || !(R4_EVIDENCE_CLASSES as readonly string[]).includes(evidenceClassToken)) fail("EVIDENCE_CLASS_NOT_IN_R4");
  const evidenceClass = evidenceClassToken as EvidenceClass;
  const evidenceContext = evidenceContextFor(evidenceClass, input.evidenceContext);
  const caseRow = requireCase(store, actor, input.caseClass, input.caseRecordId, input.caseContextFingerprint);
  const conditions = requireConditions(store, actor, input.conditionReferences, caseRow.caseRecordId, subject.objectId);
  const basis = optionalBasis(store, actor, input.designBasisRecordId, input.designBasisFingerprint);
  const bound = requireSubjectContext(store, actor, subject, input, cited);
  const line = citeLine(bound.lineObjectId, bound.lineFingerprint, input.pipingLineObjectId, input.pipingLineRevisionFingerprint, store);
  const assumptions = readAssumptions(input.assumptions);
  const { inputs, results } = readValues(input.values);
  const provenanceRef = explicit(input.provenanceRef, "MISSING_PROVENANCE");
  const sourceBasisRef = explicit(input.sourceBasisRef, "MISSING_SOURCE_BASIS");
  const applicability = explicit(input.applicability, "APPLICABILITY_REQUIRED");
  const limitations = explicit(input.limitations, "LIMITATIONS_REQUIRED");
  if (!applicability.includes(subject.objectId) || !applicability.includes(evidenceObject.objectId)) fail("APPLICABILITY_NOT_OBJECT_SCOPED");
  const sourceToolName = explicit(input.sourceToolName, "SOURCE_TOOL_REQUIRED");
  const sourceToolVersion = explicit(input.sourceToolVersion, "SOURCE_TOOL_VERSION_REQUIRED");
  const sourceModelRevision = explicit(input.sourceModelRevision, "SOURCE_MODEL_REVISION_REQUIRED");
  const sourceReportRef = explicit(input.sourceReportRef, "SOURCE_REPORT_REQUIRED");
  const sourceAuthorityRef = explicit(input.sourceAuthorityRef, "SOURCE_AUTHORITY_REQUIRED");
  const executionTimestamp = input.executionTimestamp == null || input.executionTimestamp.trim() === "" ? null : explicit(input.executionTimestamp, "EXECUTION_TIMESTAMP_INVALID");
  if (executionTimestamp && !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(executionTimestamp)) fail("EXECUTION_TIMESTAMP_INVALID");
  const qualityStatement = input.qualityStatement == null || input.qualityStatement.trim() === "" ? null : explicit(input.qualityStatement, "QUALITY_STATEMENT_INVALID");
  const evidenceId = explicit(input.evidenceId, "EVIDENCE_REQUIRED");
  const predecessor = input.predecessorEvidenceId ? store.evidence.find((row) => row.evidenceId === input.predecessorEvidenceId) : null;
  if (input.predecessorEvidenceId) {
    if (!predecessor || predecessor.tenantId !== actor.tenantId || predecessor.recordStatus !== "CURRENT") fail("PREDECESSOR_NOT_CURRENT");
    if (!sameLineage(store, evidenceObject, predecessor.objectId)) fail("LINEAGE_MISMATCH");
    if (predecessor.evidenceClass !== evidenceClass || predecessor.subjectObjectId !== subject.objectId || predecessor.caseRecordId !== caseRow.caseRecordId) fail("CASE_REPOINT_REJECTED");
  }
  const fingerprint = fingerprintCanonical({
    evidenceId,
    objectId: evidenceObject.objectId,
    objectRevisionFingerprint: evidenceObject.fingerprint,
    subjectObjectId: subject.objectId,
    subjectRevisionFingerprint: subject.fingerprint,
    evidenceClass,
    evidenceContext,
    caseRecordId: caseRow.caseRecordId,
    caseContextFingerprint: caseRow.fingerprint,
    conditions,
    designBasisRecordId: basis.recordId,
    designBasisFingerprint: basis.fingerprint,
    r2StreamRecordId: bound.streamRecordId,
    r2StreamFingerprint: bound.streamFingerprint,
    r2SystemRecordId: bound.systemRecordId,
    r2SystemFingerprint: bound.systemFingerprint,
    pipingLineObjectId: line.objectId,
    pipingLineRevisionFingerprint: line.fingerprint,
    sourceToolName,
    sourceToolVersion,
    sourceModelRevision,
    sourceReportRef,
    executionTimestamp,
    sourceAuthorityRef,
    assumptions,
    inputs,
    results,
    qualityStatement,
    provenanceRef,
    sourceBasisRef,
    applicability,
    limitations,
    predecessorEvidenceId: predecessor?.evidenceId ?? null,
  });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.evidence.find((row) => row.evidenceId === evidenceId);
  if (existing) return existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId ? existing : fail("DUPLICATE_EVIDENCE_REJECTED");
  const key = valueKey(inputs, results);
  const duplicate = store.evidence.find((row) => row.recordStatus === "CURRENT" && row.evidenceId !== predecessor?.evidenceId && row.evidenceClass === evidenceClass && row.subjectObjectId === subject.objectId && row.caseRecordId === caseRow.caseRecordId && row.sourceToolName === sourceToolName && row.sourceModelRevision === sourceModelRevision && valueKey(row.inputs, row.results) === key);
  if (duplicate) fail("DUPLICATE_EVIDENCE_REJECTED");
  if (predecessor) {
    const index = store.evidence.findIndex((row) => row.evidenceId === predecessor.evidenceId);
    store.evidence[index] = Object.freeze({ ...predecessor, recordStatus: "SUPERSEDED", currentness: "SUPERSEDED" });
    store.history.push({ historyId: `hist-${store.history.length + 1}`, subjectId: predecessor.evidenceId, action: "SUPERSEDED", fingerprint: predecessor.fingerprint, recordedAt: store.now() });
  }
  const record: D6R4EvidenceRecord = {
    evidenceId,
    contextId: context.contextId,
    objectId: evidenceObject.objectId,
    objectType: "PROCESS_CALCULATION_EVIDENCE",
    objectRevisionFingerprint: evidenceObject.fingerprint,
    subjectObjectId: subject.objectId,
    subjectObjectType: subject.objectType as "PROCESS_STREAM" | "PROCESS_SYSTEM",
    subjectRevisionFingerprint: subject.fingerprint,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
    discipline: D6_DISCIPLINE,
    evidenceClass,
    evidenceContext,
    caseClass: input.caseClass as "OPERATING" | "DESIGN",
    caseRecordId: caseRow.caseRecordId,
    caseContextFingerprint: caseRow.fingerprint,
    caseObjectId: caseRow.objectId,
    caseRevisionFingerprint: caseRow.objectRevisionFingerprint,
    conditionReferences: conditions,
    designBasisRecordId: basis.recordId,
    designBasisFingerprint: basis.fingerprint,
    r2StreamRecordId: bound.streamRecordId,
    r2StreamFingerprint: bound.streamFingerprint,
    r2SystemRecordId: bound.systemRecordId,
    r2SystemFingerprint: bound.systemFingerprint,
    pipingLineObjectId: line.objectId,
    pipingLineRevisionFingerprint: line.fingerprint,
    sourceToolName,
    sourceToolVersion,
    sourceModelRevision,
    sourceReportRef,
    executionTimestamp,
    sourceAuthorityRef,
    assumptions,
    inputs,
    results,
    qualityStatement,
    engineeringAcceptance: false,
    citedLifecycleStage: stage,
    provenanceRef,
    sourceBasisRef,
    applicability,
    limitations,
    citedCurrentness: cited,
    authority: D6_CONTEXT_AUTHORITY,
    processEngineeringAuthority: false,
    calculatedByEos: false,
    validatedProcessDesign: false,
    codeConformance: false,
    eosValidation: false,
    processConformance: false,
    processApproval: false,
    validatedPropertyModel: false,
    phaseCalculatedByEos: false,
    balanceClosedByEos: false,
    valuesAdjusted: false,
    pipingDesignValidated: false,
    pipingLineSizingValidated: false,
    pipingDesignConformant: false,
    adoptedConditionCreated: false,
    equipmentDutyCreated: false,
    processSafetyActivated: false,
    fingerprint,
    recordedBy: actor.actorId,
    recordedAt: store.now(),
    recordStatus: "CURRENT",
    currentness: "CURRENT",
    predecessorEvidenceId: predecessor?.evidenceId ?? null,
  };
  store.evidence.push(record);
  store.history.push({ historyId: `hist-${store.history.length + 1}`, subjectId: evidenceId, action: "CREATED", fingerprint, recordedAt: store.now() });
  return record;
}

export function calculateMassBalance(): never {
  return fail("MASS_BALANCE_NOT_CALCULATED");
}

export function calculateEnergyBalance(): never {
  return fail("ENERGY_BALANCE_NOT_CALCULATED");
}

export function closeMassBalance(): never {
  return fail("BALANCE_NOT_CLOSED");
}

export function closeEnergyBalance(): never {
  return fail("BALANCE_NOT_CLOSED");
}

export function deriveMissingProcessValue(): never {
  return fail("DERIVED_VALUE_REJECTED");
}

export function calculateProcessHydraulic(): never {
  return fail("HYDRAULIC_NOT_CALCULATED");
}

export function calculateProcessProperty(): never {
  return fail("PROPERTY_NOT_CALCULATED");
}

export function mutateR3ConditionFromEvidence(): never {
  return fail("R3_NOT_MUTATED");
}

export function adoptEvidenceResultAsCondition(): never {
  return fail("RESULT_NOT_ADOPTED");
}

export function validateProcessEvidence(): never {
  return fail("VALIDATION_NOT_IN_R4");
}

export function recordProcessEquipmentDuty(): never {
  return fail("DUTY_NOT_IN_R4");
}

export function recordProcessSafetyRelief(): never {
  return fail("PROCESS_SAFETY_NOT_IN_R4");
}

export function transferPipingAuthorityFromEvidence(): never {
  return fail("D5_AUTHORITY_NOT_TRANSFERRED");
}
