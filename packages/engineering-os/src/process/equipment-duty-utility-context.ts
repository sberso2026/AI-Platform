/**
 * EOS-D6-R5 Process equipment duty and utility context.
 * One bounded runtime on exact R1-R4 revisions. Requirements and supplied evidence only.
 */
import {
  D4_MECHANICAL_OBJECT_TYPES,
  D6_CURRENTNESS_STATES,
  D6_IMPLEMENTATION_PHASE_TYPES,
  D6_IMPLEMENTATION_PHASES,
  D6_MATURITY_STATES,
  PROCESS_EQUIPMENT_DUTY_EQUALS_MECHANICAL_EQUIPMENT_DESIGN as ARCHITECTURE_DUTY_IS_NOT_MECHANICAL_DESIGN,
  PROCESS_EQUIPMENT_REQUIREMENT_EQUALS_VALIDATED_MECHANICAL_SELECTION,
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
  D6_HYDRAULIC_CALCULATION_RUNTIME_COUNT,
  D6_MASS_BALANCE_CALCULATION_RUNTIME_COUNT,
  D6_PRESSURE_DROP_CALCULATION_RUNTIME_COUNT,
  D6_PROCESS_CALCULATION_RUNTIME_COUNT,
  D6_PROCESS_EVIDENCE_RUNTIME_READY as R4_EVIDENCE_READY,
  D6_PROCESS_IDENTITY_RUNTIME_READY as R1_IDENTITY_READY,
  D6_PROCESS_SAFETY_RELIEF_RUNTIME_COUNT,
  D6_RELIEF_CALCULATION_RUNTIME_COUNT,
  D6_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_COUNT,
  D6_REUSES_CANONICAL_CURRENTNESS,
  D6_REUSES_CANONICAL_DIGITAL_THREAD,
  D6_REUSES_CANONICAL_FINGERPRINT,
  D6_REVIEW_VALIDATION_RUNTIME_COUNT,
  D6_RUNTIME_COUNT as R4_RUNTIME_COUNT,
  D6_SYSTEM_STREAM_SERVICE_RUNTIME_READY as R2_CONTEXT_READY,
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
  type D6R4Store,
} from "./process-evidence-balances";

export const D6_R5_STATUS = "EQUIPMENT_DUTY_AND_UTILITY_CONTEXT_IMPLEMENTED" as const;
export const D6_R5_MATURITY = D6_R5_STATUS;
export const D6_R5_MATURITY_STATE = D6_R5_STATUS;
export const D6_R5_CLOSEOUT_PATH =
  "docs/architecture/engineering-os/EOS_D6_R5_EQUIPMENT_DUTY_AND_UTILITY_CONTEXT_CLOSEOUT.md" as const;
export const D6_R1_IDENTITY_REUSED = R1_IDENTITY_READY;
export const D6_R2_SYSTEM_STREAM_SERVICE_CONTEXT_REUSED = R2_CONTEXT_READY;
export const D6_R3_DESIGN_BASIS_CONDITION_CONTEXT_REUSED = R3_CONDITION_READY;
export const D6_R4_PROCESS_EVIDENCE_CONTEXT_REUSED = R4_EVIDENCE_READY;
export const EXACT_D6_R1_R4_REFERENCE_REQUIRED = true as const;
export const FLOATING_D6_R5_SOURCE_REFERENCE_ALLOWED = false as const;
export const D6_R5_SOURCE_AUTO_REPOINTED = false as const;
export const D6_RUNTIME_STARTED = true as const;
export const D6_RUNTIME_COUNT = 5 as const;
export const D6_R4_RUNTIME_COUNT = R4_RUNTIME_COUNT;
export const D6_PROCESS_IDENTITY_RUNTIME_READY = R1_IDENTITY_READY;
export const D6_SYSTEM_STREAM_SERVICE_RUNTIME_READY = R2_CONTEXT_READY;
export const D6_DESIGN_BASIS_CONDITION_RUNTIME_READY = R3_CONDITION_READY;
export const D6_PROCESS_EVIDENCE_RUNTIME_READY = R4_EVIDENCE_READY;
export const D6_EQUIPMENT_DUTY_RUNTIME_IMPLEMENTED = true as const;
export const D6_EQUIPMENT_DUTY_RUNTIME_COUNT = 1 as const;
export const D6_EQUIPMENT_DUTY_RUNTIME_READY = true as const;
export const D6_PROCESS_EQUIPMENT_DUTY_CONTEXT_IMPLEMENTED = true as const;
export const PROCESS_EQUIPMENT_DUTY_EQUALS_MECHANICAL_EQUIPMENT_DESIGN = ARCHITECTURE_DUTY_IS_NOT_MECHANICAL_DESIGN;
export const PROCESS_EQUIPMENT_DUTY_EQUALS_VALIDATED_MECHANICAL_SELECTION = false as const;
export const PROCESS_EQUIPMENT_DUTY_EQUALS_EQUIPMENT_SIZED_BY_EOS = false as const;
export const D6_PROCESS_CAPACITY_PERFORMANCE_REQUIREMENT_IMPLEMENTED = true as const;
export const PROCESS_CAPACITY_REQUIREMENT_EQUALS_MECHANICAL_DESIGN = false as const;
export const PROCESS_PERFORMANCE_REQUIREMENT_EQUALS_VALIDATED_EQUIPMENT_PERFORMANCE = false as const;
export const D6_SUPPLIED_EQUIPMENT_DUTY_EVIDENCE_SUPPORTED = true as const;
export const D6_ADOPTED_PROCESS_EQUIPMENT_REQUIREMENT_SUPPORTED = true as const;
export const SUPPLIED_EQUIPMENT_DUTY_EQUALS_ADOPTED_PROCESS_REQUIREMENT = false as const;
export const SUPPLIED_EQUIPMENT_DUTY_AUTO_ADOPTED = false as const;
export const EXACT_D6_R4_EVIDENCE_REVISION_REQUIRED = true as const;
export const D6_R5_REUSES_R4_EVIDENCE_WITHOUT_MUTATION = true as const;
export const R4_EVIDENCE_REFERENCE_EQUALS_R5_ENGINEERING_VALIDATION = false as const;
export const D6_R5_AUTO_REVALIDATES_R4_EVIDENCE = false as const;
export const D6_R5_CALCULATES_EQUIPMENT_DUTY = false as const;
export const D6_R5_DERIVES_MISSING_EQUIPMENT_DUTY = false as const;
export const D6_R5_HIDDEN_EQUIPMENT_DUTY_CALCULATION_ALLOWED = false as const;
export const D6_R5_SELECTS_EQUIPMENT = false as const;
export const D6_R5_SELECTS_EQUIPMENT_TYPE = false as const;
export const D6_R5_SELECTS_VENDOR = false as const;
export const D6_R5_SELECTS_MODEL = false as const;
export const D6_R5_AUTO_MATCHES_EQUIPMENT_TO_DUTY = false as const;
export const D6_R5_SIZES_PUMP = false as const;
export const D6_R5_SIZES_COMPRESSOR = false as const;
export const D6_R5_SIZES_HEAT_EXCHANGER = false as const;
export const D6_R5_SIZES_VESSEL = false as const;
export const D6_R5_SIZES_OTHER_MECHANICAL_EQUIPMENT = false as const;
export const D6_R5_CAN_REFERENCE_D4_MECHANICAL_CONTEXT = true as const;
export const EXACT_D4_MECHANICAL_REVISION_REQUIRED_WHEN_REFERENCED = true as const;
export const D6_R5_TRANSFERS_D4_AUTHORITY = false as const;
export const D6_R5_VALIDATES_D4_MECHANICAL_ENGINEERING = false as const;
export const D6_R5_AUTO_MUTATES_D4_RECORD = false as const;
export const D6_R5_AUTO_REPOINTS_D4_REFERENCE = false as const;
export const D6_PROCESS_UTILITY_CONTEXT_IMPLEMENTED = true as const;
export const PROCESS_UTILITY_REQUIREMENT_EQUALS_UTILITY_CALCULATED_BY_EOS = false as const;
export const PROCESS_UTILITY_REQUIREMENT_EQUALS_VALIDATED_UTILITY_SYSTEM_DESIGN = false as const;
export const D6_R5_CALCULATES_UTILITY_CONSUMPTION = false as const;
export const D6_R5_DERIVES_MISSING_UTILITY_DEMAND = false as const;
export const D6_SUPPLIED_UTILITY_EVIDENCE_SUPPORTED = true as const;
export const SUPPLIED_UTILITY_EVIDENCE_EQUALS_VALIDATED_UTILITY_REQUIREMENT = false as const;
export const SUPPLIED_UTILITY_EVIDENCE_AUTO_ADOPTED = false as const;
export const D6_R5_CAN_REFERENCE_R4_ENERGY_BALANCE_EVIDENCE = true as const;
export const ENERGY_BALANCE_RESULT_EQUALS_ADOPTED_EQUIPMENT_DUTY = false as const;
export const ENERGY_BALANCE_RESULT_AUTO_CREATES_MECHANICAL_REQUIREMENT = false as const;
export const D6_R5_CAN_REFERENCE_R4_HYDRAULIC_EVIDENCE = true as const;
export const HYDRAULIC_RESULT_EQUALS_VALIDATED_PUMP_DUTY = false as const;
export const HYDRAULIC_RESULT_AUTO_CREATES_MECHANICAL_SELECTION = false as const;
export const EXACT_D6_R3_OPERATING_CASE_REVISION_REQUIRED_WHEN_REFERENCED = true as const;
export const EXACT_D6_R3_DESIGN_CASE_REVISION_REQUIRED_WHEN_REFERENCED = true as const;
export const D6_EQUIPMENT_DUTY_CASE_APPLICABILITY_EXPLICIT = true as const;
export const D6_UTILITY_REQUIREMENT_CASE_APPLICABILITY_EXPLICIT = true as const;
export const D6_R5_AUTO_PROPAGATES_DUTY_ACROSS_CASES = false as const;
export const D6_R5_AUTO_PROPAGATES_UTILITY_REQUIREMENT_ACROSS_CASES = false as const;
export const D6_R5_UNITS_REQUIRED = true as const;
export const D6_R5_UNITS_PRESERVED = true as const;
export const AI_CAN_SILENTLY_CHANGE_D6_R5_UNITS = false as const;
export const D6_R5_SOURCE_BASIS_REQUIRED = true as const;
export const D6_R5_SOURCE_BASIS_TRACEABLE = true as const;
export const BASISLESS_AUTHORITATIVE_D6_R5_RECORD_AUTO_ACCEPTED = false as const;
export const D6_R5_APPLICABILITY_EXPLICIT = true as const;
export const D6_R5_LIMITATIONS_EXPLICIT = true as const;
export const D6_R5_AUTO_PROPAGATED_OUTSIDE_APPLICABILITY = false as const;
export const D6_R5_AUTO_MUTATES_R3_OPERATING_CONDITION = false as const;
export const D6_R5_AUTO_MUTATES_R3_DESIGN_CONDITION = false as const;
export const D6_R5_AUTO_MUTATES_R3_DESIGN_BASIS = false as const;
export const D6_R5_AUTO_MUTATES_R4_EVIDENCE = false as const;
export const D6_R5_AUTO_CREATES_RELIEF_SCENARIO = false as const;
export const D6_R5_AUTO_CREATES_PROCESS_SAFETY_REQUIREMENT = false as const;
export const D6_R5_AUTO_INFERS_SAFEGUARD = false as const;
export const D6_R5_CREATES_D7_ELECTRICAL_DESIGN = false as const;
export const D6_R5_TRANSFERS_D7_AUTHORITY = false as const;
export const D6_R5_CREATES_D8_IAC_DESIGN = false as const;
export const D6_R5_TRANSFERS_D8_AUTHORITY = false as const;
export const D6_R5_VALIDATES_D5_PIPING_ENGINEERING = false as const;
export const D6_R5_TRANSFERS_D5_AUTHORITY = false as const;
export const D6_R5_AUTO_MUTATES_D5_LINE_OR_PIPING_CONTEXT = false as const;
export const D6_R5_HISTORY_PRESERVED = true as const;
export const D6_R5_AUTO_REPOINTED = false as const;
export const SILENT_D6_R5_MUTATION_ALLOWED = false as const;
export const D6_R5_PROVENANCE_REQUIRED = true as const;
export const D6_R5_PROVENANCE_PRESERVED = true as const;
export const TENANT_WORKSPACE_PROJECT_D6_R5_SCOPE_ENFORCED = true as const;
export const CROSS_TENANT_D6_R5_ACCESS_ALLOWED = false as const;
export const AI_CAN_INVENT_AUTHORITATIVE_D6_EQUIPMENT_DUTY = false as const;
export const AI_CAN_INVENT_AUTHORITATIVE_D6_UTILITY_REQUIREMENT = false as const;
export const ADMIN_CAN_PROMOTE_UNGOVERNED_D6_R5_CONTEXT_TO_ENGINEERING_TRUTH = false as const;
export const D6_R5_DUPLICATE_GOVERNANCE_IMPLEMENTED = true as const;
export const D6_R5_REPLAY_PROTECTION_IMPLEMENTED = true as const;
export const D6_R5_SPOOFING_PROTECTION_IMPLEMENTED = true as const;
export const D6_R5_HIDDEN_CALCULATION_ALLOWED = false as const;
export const UNAUTHORIZED_D6_R6_R12_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_EQUIPMENT_DUTY_CALCULATION = false as const;
export const UNAUTHORIZED_EQUIPMENT_SELECTION = false as const;
export const UNAUTHORIZED_EQUIPMENT_SIZING = false as const;
export const UNAUTHORIZED_UTILITY_CALCULATION = false as const;
export const UNAUTHORIZED_MECHANICAL_AUTHORITY_TRANSFER = false as const;
export const D6_R6_CANONICAL_PHASE = D6_IMPLEMENTATION_PHASES[5];
export const D6_R6_PHASE_TYPE = D6_IMPLEMENTATION_PHASE_TYPES[5];
export const D6_R6_CANONICAL_SCOPE =
  "Implement governed Process-safety, hazard-study, relief-scenario, safeguarding-requirement and depressuring-context records using exact R1-R5 revisions and supplied evidence. Preserve the distinction between Process hazard/safety context and approved safeguards, relief scenario and relief-device design, Process requirement and I&C functional-safety implementation. Do not calculate relief loads, size relief devices, perform depressuring calculations, perform SIL calculations, design safeguards, validate engineering or perform D9 reasoning." as const;
export const D6_R6_STARTED = false as const;
export const D6_R5_READY_FOR_NEXT_PHASE = true as const;
export const D6_R5_NEXT_PHASE = D6_R6_CANONICAL_PHASE;
export const D6_R5_NEXT_PHASE_TYPE = D6_R6_PHASE_TYPE;
export const D6_R5_CANONICAL_NEXT_PHASE = D6_R6_CANONICAL_PHASE;
export const D6_R5_CANONICAL_NEXT_PHASE_SCOPE = D6_R6_CANONICAL_SCOPE;
export const D6_R5_BLOCKER = "NONE" as const;
export const D6_R5_MACHINE_READABLE_ROADMAP_UPDATED = true as const;

export const D6_R5_REQUIREMENT_KINDS = [
  "REQUIRED_PROCESS_DUTY",
  "FLOW_CAPACITY",
  "HEAT_DUTY",
  "PRESSURE_HEAD",
  "SEPARATION_DUTY",
  "RESIDENCE_HOLDING",
  "COMPRESSION",
  "PUMPING",
  "EXCHANGER_DUTY",
  "VESSEL_PROCESS",
  "OTHER_PROCESS_PERFORMANCE",
] as const;
export const D6_R5_UTILITY_TYPES = [
  "COOLING_WATER",
  "CHILLED_WATER",
  "HEATING_WATER",
  "STEAM",
  "CONDENSATE",
  "FUEL_GAS",
  "INSTRUMENT_AIR",
  "PLANT_AIR",
  "NITROGEN",
  "PROCESS_WATER",
  "DEMINERALIZED_WATER",
  "OTHER_CANONICAL_UTILITY",
] as const;
const MECHANICAL_REFERENCE_TYPES = ["MECHANICAL_EQUIPMENT", "ROTATING_EQUIPMENT", "STATIC_EQUIPMENT", "MECHANICAL_PACKAGE"] as const;

export {
  D6_REUSES_CANONICAL_CURRENTNESS,
  D6_REUSES_CANONICAL_DIGITAL_THREAD,
  D6_REUSES_CANONICAL_FINGERPRINT,
  PARALLEL_D6_CURRENTNESS_ENGINE_CREATED,
  PARALLEL_D6_DIGITAL_THREAD_CREATED,
  SECOND_D6_FINGERPRINT_ALGORITHM_CREATED,
  PROCESS_EQUIPMENT_REQUIREMENT_EQUALS_VALIDATED_MECHANICAL_SELECTION,
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
  D6_PROCESS_SAFETY_RELIEF_RUNTIME_COUNT,
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
type RequirementKind = (typeof D6_R5_REQUIREMENT_KINDS)[number];
type UtilityType = (typeof D6_R5_UTILITY_TYPES)[number];
type Family = "EQUIPMENT_DUTY" | "CAPACITY_PERFORMANCE";

type Prohibited = {
  calculateDuty?: boolean;
  deriveDuty?: boolean;
  hiddenCalculation?: boolean;
  calculateUtility?: boolean;
  deriveUtility?: boolean;
  selectEquipment?: boolean;
  selectEquipmentType?: boolean;
  selectVendor?: boolean;
  selectModel?: boolean;
  autoMatch?: boolean;
  sizePump?: boolean;
  sizeCompressor?: boolean;
  sizeHeatExchanger?: boolean;
  sizeVessel?: boolean;
  sizeOther?: boolean;
  autoAdopt?: boolean;
  propagateAcrossCases?: boolean;
  propagate?: boolean;
  revalidateEvidence?: boolean;
  mutateEvidence?: boolean;
  mutateOperatingCondition?: boolean;
  mutateDesignCondition?: boolean;
  mutateDesignBasis?: boolean;
  copyEvidenceResult?: boolean;
  autoCreateFromEnergy?: boolean;
  autoCreateFromHydraulic?: boolean;
  validateMechanical?: boolean;
  transferD4?: boolean;
  mutateD4?: boolean;
  repointD4?: boolean;
  createRelief?: boolean;
  createProcessSafety?: boolean;
  inferSafeguard?: boolean;
  createElectrical?: boolean;
  transferD7?: boolean;
  createIac?: boolean;
  transferD8?: boolean;
  validatePiping?: boolean;
  transferD5?: boolean;
  mutateD5?: boolean;
  normalizedUnit?: string | null;
  convertedValue?: string | null;
  inventDuty?: boolean;
  inventUtility?: boolean;
  promoteToTruth?: boolean;
};

export type D6R5Measure = { value: string; unit: string };

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
  mechanicalObjectId?: string | null;
  mechanicalRevisionFingerprint?: string | null;
  pipingLineObjectId?: string | null;
  pipingLineRevisionFingerprint?: string | null;
  serviceRole?: string | null;
  availabilityStatement?: string | null;
  predecessorRecordId?: string | null;
};

export type D6R5DutyInput = Bound & { requirementId: string; requirementKind: string };
export type D6R5AdoptionInput = Bound & { requirementId: string; suppliedRequirementId: string };
export type D6R5UtilityInput = Bound & { utilityRecordId: string; utilityType: string };
export type D6R5UtilityAdoptionInput = Bound & { utilityRecordId: string; suppliedUtilityRecordId: string };

type EvidenceCitation = { evidenceId: string; fingerprint: string; evidenceClass: string; evidenceContext: string } | null;
type MechanicalCitation = { objectId: string; fingerprint: string; objectType: string } | null;

export type D6R5DutyRecord = {
  requirementId: string;
  family: Family;
  disposition: "SUPPLIED" | "ADOPTED";
  requirementKind: RequirementKind;
  serviceRole: string;
  availabilityStatement: string | null;
  measure: D6R5Measure;
  contextId: string;
  objectId: string;
  objectType: "PROCESS_EQUIPMENT_DUTY";
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
  evidenceId: string | null;
  evidenceFingerprint: string | null;
  evidenceClass: string | null;
  mechanicalObjectId: string | null;
  mechanicalRevisionFingerprint: string | null;
  pipingLineObjectId: string | null;
  pipingLineRevisionFingerprint: string | null;
  suppliedRequirementId: string | null;
  suppliedRequirementFingerprint: string | null;
  citedLifecycleStage: Stage;
  provenanceRef: string;
  sourceBasisRef: string;
  applicability: string;
  limitations: string;
  citedCurrentness: Currentness;
  authority: typeof D6_CONTEXT_AUTHORITY;
  processEngineeringAuthority: false;
  mechanicalDesign: false;
  validatedMechanicalSelection: false;
  sizedByEos: false;
  equipmentSelected: false;
  calculatedByEos: false;
  eosValidation: false;
  adoptedFromEvidenceResult: false;
  reliefScenarioCreated: false;
  fingerprint: string;
  recordedBy: string;
  recordedAt: string;
  recordStatus: "CURRENT" | "SUPERSEDED";
  currentness: "CURRENT" | "SUPERSEDED";
  predecessorRecordId: string | null;
};

export type D6R5UtilityRecord = {
  utilityRecordId: string;
  utilityType: UtilityType;
  disposition: "SUPPLIED" | "ADOPTED";
  measure: D6R5Measure;
  contextId: string;
  objectId: string;
  objectType: "PROCESS_UTILITY_REQUIREMENT";
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
  evidenceId: string | null;
  evidenceFingerprint: string | null;
  suppliedUtilityRecordId: string | null;
  suppliedUtilityFingerprint: string | null;
  citedLifecycleStage: Stage;
  provenanceRef: string;
  sourceBasisRef: string;
  applicability: string;
  limitations: string;
  citedCurrentness: Currentness;
  authority: typeof D6_CONTEXT_AUTHORITY;
  processEngineeringAuthority: false;
  calculatedByEos: false;
  validatedUtilityRequirement: false;
  validatedUtilitySystemDesign: false;
  fingerprint: string;
  recordedBy: string;
  recordedAt: string;
  recordStatus: "CURRENT" | "SUPERSEDED";
  currentness: "CURRENT" | "SUPERSEDED";
  predecessorRecordId: string | null;
};

export type D6R5History = { historyId: string; subjectKind: "DUTY" | "UTILITY"; subjectId: string; action: "CREATED" | "SUPERSEDED"; fingerprint: string; recordedAt: string };

export type D6R5Store = {
  r4: D6R4Store;
  d4: D4R1Store | null;
  now: () => string;
  duties: D6R5DutyRecord[];
  utilities: D6R5UtilityRecord[];
  history: D6R5History[];
};

function fail(code: string): never {
  throw new Error(`D6_R5_${code}`);
}

function blockedParty(value: string): boolean {
  return /^AI(?:\b|_)/i.test(value) || /LLM/i.test(value) || /OPTIMIZER/i.test(value);
}

function explicit(value: string, code: string): string {
  const token = value.trim();
  if (!token || FLOATING.has(token.toLowerCase()) || INFERRED.has(token.toLowerCase()) || BROAD.has(token.toLowerCase()) || blockedParty(token)) fail(code);
  return token;
}

function assertActor(actor: D6R1Actor): void {
  if (!actor.actorId.trim() || !actor.tenantId.trim() || !actor.workspaceId.trim() || !actor.projectId.trim()) fail("SCOPE_REQUIRED");
  if (blockedParty(actor.actorId) || blockedParty(actor.authority)) fail("AI_NOT_PROCESS_AUTHORITY");
  if (actor.authority === "ADMINISTRATOR" || actor.authority === "ADMIN") fail("ADMIN_NOT_PROCESS_AUTHORITY");
  if (actor.authority === "PROCESS_ENGINEERING_AUTHORITY") fail("RECORDER_NOT_PROCESS_ENGINEERING_AUTHORITY");
  if (actor.authority !== D6_CONTEXT_AUTHORITY) fail("UNAUTHORIZED");
}

function assertProhibited(input: Prohibited): void {
  if (input.calculateDuty === true || input.deriveDuty === true || input.hiddenCalculation === true || input.calculateUtility === true || input.deriveUtility === true) fail("CALCULATION_NOT_IN_R5");
  if (input.selectEquipment === true || input.selectEquipmentType === true || input.selectVendor === true || input.selectModel === true || input.autoMatch === true) fail("SELECTION_NOT_IN_R5");
  if (input.sizePump === true || input.sizeCompressor === true || input.sizeHeatExchanger === true || input.sizeVessel === true || input.sizeOther === true) fail("SIZING_NOT_IN_R5");
  if (input.autoAdopt === true) fail("SUPPLIED_NOT_AUTO_ADOPTED");
  if (input.propagateAcrossCases === true || input.propagate === true) fail("CROSS_CASE_PROPAGATION_REJECTED");
  if (input.revalidateEvidence === true || input.mutateEvidence === true) fail("R4_EVIDENCE_NOT_MUTATED");
  if (input.mutateOperatingCondition === true || input.mutateDesignCondition === true || input.mutateDesignBasis === true) fail("R3_NOT_MUTATED");
  if (input.copyEvidenceResult === true || input.autoCreateFromEnergy === true || input.autoCreateFromHydraulic === true) fail("EVIDENCE_NOT_ADOPTED_AS_DUTY");
  if (input.validateMechanical === true || input.transferD4 === true || input.mutateD4 === true || input.repointD4 === true) fail("D4_AUTHORITY_NOT_TRANSFERRED");
  if (input.createRelief === true || input.createProcessSafety === true || input.inferSafeguard === true) fail("PROCESS_SAFETY_NOT_IN_R5");
  if (input.createElectrical === true || input.transferD7 === true) fail("D7_AUTHORITY_NOT_TRANSFERRED");
  if (input.createIac === true || input.transferD8 === true) fail("D8_AUTHORITY_NOT_TRANSFERRED");
  if (input.validatePiping === true || input.transferD5 === true || input.mutateD5 === true) fail("D5_AUTHORITY_NOT_TRANSFERRED");
  if (input.normalizedUnit || input.convertedValue != null) fail("UNIT_CHANGE_REJECTED");
  if (input.inventDuty === true || input.inventUtility === true || input.promoteToTruth === true) fail("REQUIREMENT_NOT_INVENTED");
}

function measure(value: string | null | undefined, unit: string | null | undefined): D6R5Measure {
  const token = explicit(value == null ? "" : String(value), "VALUE_REQUIRED");
  if (!/^-?\d+(\.\d+)?$/.test(token)) fail("VALUE_NOT_SUPPLIED");
  if (!unit || !unit.trim()) fail("UNITS_REQUIRED");
  return { value: token, unit: explicit(unit, "UNIT_INVALID") };
}

function requireObject(store: D6R5Store, actor: D6R1Actor, contextId: string, objectId: string, revision: string, allowed: readonly string[], cited: Currentness) {
  const id = explicit(objectId, "R1_OBJECT_REQUIRED");
  const rev = explicit(revision, "R1_REVISION_REQUIRED");
  const object = store.r4.r3.r2.r1.objects.find((row) => row.objectId === id);
  if (!object || !allowed.includes(object.objectType)) fail("R1_OBJECT_NOT_FOUND");
  if (object.fingerprint !== rev) fail("R1_REVISION_MISMATCH");
  if (object.contextId !== contextId) fail("R1_CONTEXT_MISMATCH");
  if (object.tenantId !== actor.tenantId || object.workspaceId !== actor.workspaceId || object.projectId !== actor.projectId) fail("CROSS_SCOPE_OPERATION");
  if (cited === "CURRENT" && object.recordStatus !== "CURRENT") fail("R1_OBJECT_NOT_CURRENT");
  return object;
}

function requireCase(store: D6R5Store, actor: D6R1Actor, caseClass: string, recordId: string, fingerprint: string) {
  if (caseClass !== "OPERATING" && caseClass !== "DESIGN") fail("CASE_CLASS_INVALID");
  const rows = caseClass === "OPERATING" ? store.r4.r3.operatingCases : store.r4.r3.designCases;
  const id = explicit(recordId, "CASE_REVISION_REQUIRED");
  const revision = explicit(fingerprint, "CASE_REVISION_REQUIRED");
  const row = rows.find((item) => item.caseRecordId === id);
  if (!row || row.fingerprint !== revision || row.tenantId !== actor.tenantId || row.workspaceId !== actor.workspaceId || row.projectId !== actor.projectId || row.recordStatus !== "CURRENT") fail("CASE_REVISION_MISMATCH");
  return row;
}

function requireSubjectContext(store: D6R5Store, actor: D6R1Actor, subject: D6R1ObjectRecord, input: Bound, cited: Currentness) {
  if (subject.objectType === "PROCESS_STREAM") {
    const id = explicit(input.r2StreamRecordId ?? "", "R2_STREAM_REQUIRED");
    const revision = explicit(input.r2StreamFingerprint ?? "", "R2_STREAM_REVISION_REQUIRED");
    const row = store.r4.r3.r2.streams.find((item) => item.streamRecordId === id);
    if (!row || row.fingerprint !== revision || row.objectId !== subject.objectId || (cited === "CURRENT" && row.recordStatus !== "CURRENT")) fail("R2_STREAM_REVISION_MISMATCH");
    if (row.tenantId !== actor.tenantId) fail("CROSS_SCOPE_OPERATION");
    return { lineObjectId: row.pipingLineObjectId, lineFingerprint: row.pipingLineRevisionFingerprint };
  }
  const id = explicit(input.r2SystemRecordId ?? "", "R2_SYSTEM_REQUIRED");
  const revision = explicit(input.r2SystemFingerprint ?? "", "R2_SYSTEM_REVISION_REQUIRED");
  const row = store.r4.r3.r2.systems.find((item) => item.systemRecordId === id);
  if (!row || row.fingerprint !== revision || row.objectId !== subject.objectId) fail("R2_SYSTEM_REVISION_MISMATCH");
  if (row.tenantId !== actor.tenantId || (cited === "CURRENT" && row.recordStatus !== "CURRENT")) fail("R2_SYSTEM_REVISION_MISMATCH");
  return { lineObjectId: null as string | null, lineFingerprint: null as string | null };
}

function citeEvidence(store: D6R5Store, actor: D6R1Actor, evidenceId: string | null | undefined, fingerprint: string | null | undefined, subjectObjectId: string, caseRecordId: string): EvidenceCitation {
  const hasId = evidenceId != null && evidenceId.trim() !== "";
  const hasRevision = fingerprint != null && fingerprint.trim() !== "";
  if (!hasId && !hasRevision) return null;
  if (!hasId || !hasRevision) fail("EVIDENCE_REVISION_REQUIRED");
  const id = explicit(evidenceId as string, "EVIDENCE_REFERENCE_REQUIRED");
  const revision = explicit(fingerprint as string, "EVIDENCE_REVISION_REQUIRED");
  const row = store.r4.evidence.find((item) => item.evidenceId === id);
  if (!row || row.fingerprint !== revision || row.recordStatus !== "CURRENT") fail("EVIDENCE_REVISION_MISMATCH");
  if (row.tenantId !== actor.tenantId || row.workspaceId !== actor.workspaceId || row.projectId !== actor.projectId) fail("CROSS_SCOPE_OPERATION");
  if (row.subjectObjectId !== subjectObjectId || row.caseRecordId !== caseRecordId) fail("EVIDENCE_SUBJECT_MISMATCH");
  return { evidenceId: row.evidenceId, fingerprint: row.fingerprint, evidenceClass: row.evidenceClass, evidenceContext: row.evidenceContext };
}

function citeMechanical(store: D6R5Store, actor: D6R1Actor, objectId: string | null | undefined, fingerprint: string | null | undefined): MechanicalCitation {
  const hasId = objectId != null && objectId.trim() !== "";
  const hasRevision = fingerprint != null && fingerprint.trim() !== "";
  if (!hasId && !hasRevision) return null;
  if (!hasId || !hasRevision) fail("D4_REVISION_REQUIRED");
  if (!store.d4) fail("D4_CONTEXT_NOT_SUPPLIED");
  const id = explicit(objectId as string, "D4_REFERENCE_REQUIRED");
  const revision = explicit(fingerprint as string, "D4_REVISION_REQUIRED");
  const row = store.d4.objects.find((item) => item.objectId === id);
  if (!row || row.fingerprint !== revision || row.recordStatus !== "CURRENT") fail("D4_REVISION_MISMATCH");
  if (!(MECHANICAL_REFERENCE_TYPES as readonly string[]).includes(row.objectType)) fail("D4_OBJECT_NOT_EQUIPMENT");
  if (!(D4_MECHANICAL_OBJECT_TYPES as readonly string[]).includes(row.objectType)) fail("D4_OBJECT_NOT_EQUIPMENT");
  if (row.tenantId !== actor.tenantId || row.workspaceId !== actor.workspaceId || row.projectId !== actor.projectId) fail("CROSS_SCOPE_OPERATION");
  return { objectId: row.objectId, fingerprint: row.fingerprint, objectType: row.objectType };
}

function citeLine(streamLineId: string | null, streamLineFingerprint: string | null, objectId: string | null | undefined, revision: string | null | undefined, store: D6R5Store) {
  const hasId = objectId != null && objectId.trim() !== "";
  const hasRevision = revision != null && revision.trim() !== "";
  if (!hasId && !hasRevision) return { objectId: null as string | null, fingerprint: null as string | null };
  if (!hasId || !hasRevision) fail("D5_LINE_REVISION_REQUIRED");
  const id = explicit(objectId as string, "D5_LINE_REFERENCE_REQUIRED");
  const rev = explicit(revision as string, "D5_LINE_REVISION_REQUIRED");
  if (streamLineId !== id || streamLineFingerprint !== rev) fail("D5_REFERENCE_MISMATCH");
  const line = store.r4.r3.r2.d5.objects.find((row) => row.objectId === id && row.objectType === "PIPING_LINE");
  if (!line || line.fingerprint !== rev) fail("D5_LINE_NOT_FOUND");
  return { objectId: id, fingerprint: rev };
}

function sameLineage(store: D6R5Store, object: D6R1ObjectRecord, priorObjectId: string): boolean {
  let cursor: D6R1ObjectRecord | undefined = object;
  const seen = new Set<string>();
  while (cursor && !seen.has(cursor.objectId)) {
    if (cursor.objectId === priorObjectId) return true;
    seen.add(cursor.objectId);
    cursor = cursor.predecessorObjectId ? store.r4.r3.r2.r1.objects.find((row) => row.objectId === cursor?.predecessorObjectId) : undefined;
  }
  return false;
}

function prepare(store: D6R5Store, actor: D6R1Actor, input: Bound, allowed: readonly string[]) {
  assertActor(actor);
  assertProhibited(input);
  if (input.tenantId != null && input.tenantId !== actor.tenantId) fail("CROSS_TENANT_OPERATION");
  if (input.workspaceId != null && input.workspaceId !== actor.workspaceId) fail("CROSS_WORKSPACE_OPERATION");
  if (input.projectId != null && input.projectId !== actor.projectId) fail("CROSS_PROJECT_OPERATION");
  const cited = input.citedCurrentness.trim();
  if (!(D6_CURRENTNESS_STATES as readonly string[]).includes(cited)) fail("CURRENTNESS_INVALID");
  const contextId = explicit(input.contextId, "R1_CONTEXT_REQUIRED");
  const context = store.r4.r3.r2.r1.contexts.find((row) => row.contextId === contextId);
  if (!context || context.tenantId !== actor.tenantId || context.workspaceId !== actor.workspaceId || context.projectId !== actor.projectId) fail("R1_CONTEXT_NOT_FOUND");
  if (cited === "CURRENT" && context.recordStatus !== "CURRENT") fail("R1_CONTEXT_NOT_CURRENT");
  const object = requireObject(store, actor, context.contextId, input.objectId, input.objectRevisionFingerprint, allowed, cited as Currentness);
  const subject = requireObject(store, actor, context.contextId, input.subjectObjectId, input.subjectRevisionFingerprint, ["PROCESS_STREAM", "PROCESS_SYSTEM"], cited as Currentness);
  const stage = input.citedLifecycleStage.trim();
  if (!(D6_MATURITY_STATES as readonly string[]).includes(stage)) fail("MATURITY_STAGE_INVALID");
  const caseRow = requireCase(store, actor, input.caseClass, input.caseRecordId, input.caseContextFingerprint);
  const reading = measure(input.value, input.unit);
  const bound = requireSubjectContext(store, actor, subject, input, cited as Currentness);
  const evidence = citeEvidence(store, actor, input.evidenceId, input.evidenceFingerprint, subject.objectId, caseRow.caseRecordId);
  const mechanical = citeMechanical(store, actor, input.mechanicalObjectId, input.mechanicalRevisionFingerprint);
  const line = citeLine(bound.lineObjectId, bound.lineFingerprint, input.pipingLineObjectId, input.pipingLineRevisionFingerprint, store);
  const applicability = explicit(input.applicability, "APPLICABILITY_REQUIRED");
  const limitations = explicit(input.limitations, "LIMITATIONS_REQUIRED");
  if (!applicability.includes(subject.objectId) || !applicability.includes(object.objectId)) fail("APPLICABILITY_NOT_OBJECT_SCOPED");
  return {
    context, object, subject, stage: stage as Stage, cited: cited as Currentness, caseRow, reading, evidence, mechanical, line,
    provenanceRef: explicit(input.provenanceRef, "MISSING_PROVENANCE"),
    sourceBasisRef: explicit(input.sourceBasisRef, "MISSING_SOURCE_BASIS"),
    applicability, limitations,
    serviceRole: input.serviceRole == null || input.serviceRole.trim() === "" ? null : explicit(input.serviceRole, "SERVICE_ROLE_INVALID"),
    availabilityStatement: input.availabilityStatement == null || input.availabilityStatement.trim() === "" ? null : explicit(input.availabilityStatement, "AVAILABILITY_INVALID"),
  };
}

function remember(store: D6R5Store, subjectKind: D6R5History["subjectKind"], subjectId: string, action: D6R5History["action"], fingerprint: string) {
  store.history.push({ historyId: `hist-${store.history.length + 1}`, subjectKind, subjectId, action, fingerprint, recordedAt: store.now() });
}

export function createD6R5Store(r4: D6R4Store, d4: D4R1Store | null = null, now: () => string = () => "2026-10-24T00:00:00.000Z"): D6R5Store {
  return { r4, d4, now, duties: [], utilities: [], history: [] };
}

function recordDuty(store: D6R5Store, actor: D6R1Actor, input: D6R5DutyInput, family: Family): D6R5DutyRecord {
  const prepared = prepare(store, actor, input, ["PROCESS_EQUIPMENT_DUTY"]);
  const requirementKind = explicit(input.requirementKind, "REQUIREMENT_KIND_REQUIRED");
  if (!(D6_R5_REQUIREMENT_KINDS as readonly string[]).includes(requirementKind)) fail("REQUIREMENT_KIND_INVALID");
  if (family === "EQUIPMENT_DUTY" && !prepared.serviceRole) fail("SERVICE_ROLE_REQUIRED");
  const requirementId = explicit(input.requirementId, "REQUIREMENT_REQUIRED");
  const predecessor = input.predecessorRecordId ? store.duties.find((row) => row.requirementId === input.predecessorRecordId) : null;
  if (input.predecessorRecordId) {
    if (!predecessor || predecessor.recordStatus !== "CURRENT" || predecessor.tenantId !== actor.tenantId) fail("PREDECESSOR_NOT_CURRENT");
    if (!sameLineage(store, prepared.object, predecessor.objectId) || predecessor.family !== family || predecessor.caseRecordId !== prepared.caseRow.caseRecordId) fail("CASE_REPOINT_REJECTED");
  }
  const fingerprint = fingerprintCanonical({
    requirementId, family, disposition: "SUPPLIED", requirementKind, serviceRole: prepared.serviceRole, availabilityStatement: prepared.availabilityStatement,
    measure: prepared.reading, objectId: prepared.object.objectId, objectRevisionFingerprint: prepared.object.fingerprint,
    subjectObjectId: prepared.subject.objectId, subjectRevisionFingerprint: prepared.subject.fingerprint,
    caseRecordId: prepared.caseRow.caseRecordId, caseContextFingerprint: prepared.caseRow.fingerprint,
    evidenceId: prepared.evidence?.evidenceId ?? null, evidenceFingerprint: prepared.evidence?.fingerprint ?? null,
    mechanicalObjectId: prepared.mechanical?.objectId ?? null, mechanicalRevisionFingerprint: prepared.mechanical?.fingerprint ?? null,
    pipingLineObjectId: prepared.line.objectId, pipingLineRevisionFingerprint: prepared.line.fingerprint,
    provenanceRef: prepared.provenanceRef, sourceBasisRef: prepared.sourceBasisRef, applicability: prepared.applicability, limitations: prepared.limitations,
    predecessorRecordId: predecessor?.requirementId ?? null,
  });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.duties.find((row) => row.requirementId === requirementId);
  if (existing) return existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId ? existing : fail("DUPLICATE_DUTY_REJECTED");
  const duplicate = store.duties.find((row) => row.recordStatus === "CURRENT" && row.requirementId !== predecessor?.requirementId && row.family === family && row.disposition === "SUPPLIED" && row.requirementKind === requirementKind && row.subjectObjectId === prepared.subject.objectId && row.caseRecordId === prepared.caseRow.caseRecordId && row.measure.value === prepared.reading.value && row.measure.unit === prepared.reading.unit);
  if (duplicate) fail("DUPLICATE_DUTY_REJECTED");
  if (predecessor) {
    const index = store.duties.findIndex((row) => row.requirementId === predecessor.requirementId);
    store.duties[index] = Object.freeze({ ...predecessor, recordStatus: "SUPERSEDED", currentness: "SUPERSEDED" });
    remember(store, "DUTY", predecessor.requirementId, "SUPERSEDED", predecessor.fingerprint);
  }
  const record: D6R5DutyRecord = {
    requirementId, family, disposition: "SUPPLIED", requirementKind: requirementKind as RequirementKind, serviceRole: prepared.serviceRole ?? "capacity performance requirement",
    availabilityStatement: prepared.availabilityStatement, measure: prepared.reading, contextId: prepared.context.contextId,
    objectId: prepared.object.objectId, objectType: "PROCESS_EQUIPMENT_DUTY", objectRevisionFingerprint: prepared.object.fingerprint,
    subjectObjectId: prepared.subject.objectId, subjectRevisionFingerprint: prepared.subject.fingerprint,
    tenantId: actor.tenantId, workspaceId: actor.workspaceId, projectId: actor.projectId, discipline: D6_DISCIPLINE,
    caseClass: input.caseClass as "OPERATING" | "DESIGN", caseRecordId: prepared.caseRow.caseRecordId, caseContextFingerprint: prepared.caseRow.fingerprint,
    evidenceId: prepared.evidence?.evidenceId ?? null, evidenceFingerprint: prepared.evidence?.fingerprint ?? null, evidenceClass: prepared.evidence?.evidenceClass ?? null,
    mechanicalObjectId: prepared.mechanical?.objectId ?? null, mechanicalRevisionFingerprint: prepared.mechanical?.fingerprint ?? null,
    pipingLineObjectId: prepared.line.objectId, pipingLineRevisionFingerprint: prepared.line.fingerprint,
    suppliedRequirementId: null, suppliedRequirementFingerprint: null, citedLifecycleStage: prepared.stage,
    provenanceRef: prepared.provenanceRef, sourceBasisRef: prepared.sourceBasisRef, applicability: prepared.applicability, limitations: prepared.limitations,
    citedCurrentness: prepared.cited, authority: D6_CONTEXT_AUTHORITY, processEngineeringAuthority: false, mechanicalDesign: false,
    validatedMechanicalSelection: false, sizedByEos: false, equipmentSelected: false, calculatedByEos: false, eosValidation: false,
    adoptedFromEvidenceResult: false, reliefScenarioCreated: false, fingerprint, recordedBy: actor.actorId, recordedAt: store.now(),
    recordStatus: "CURRENT", currentness: "CURRENT", predecessorRecordId: predecessor?.requirementId ?? null,
  };
  store.duties.push(record);
  remember(store, "DUTY", requirementId, "CREATED", fingerprint);
  return record;
}

export function recordProcessEquipmentDutyContext(store: D6R5Store, actor: D6R1Actor, input: D6R5DutyInput): D6R5DutyRecord {
  return recordDuty(store, actor, input, "EQUIPMENT_DUTY");
}

export function recordProcessCapacityPerformanceRequirement(store: D6R5Store, actor: D6R1Actor, input: D6R5DutyInput): D6R5DutyRecord {
  return recordDuty(store, actor, input, "CAPACITY_PERFORMANCE");
}

export function recordAdoptedProcessEquipmentRequirement(store: D6R5Store, actor: D6R1Actor, input: D6R5AdoptionInput): D6R5DutyRecord {
  const prepared = prepare(store, actor, input, ["PROCESS_EQUIPMENT_DUTY"]);
  const supplied = store.duties.find((row) => row.requirementId === explicit(input.suppliedRequirementId, "SUPPLIED_REQUIREMENT_REQUIRED"));
  if (!supplied || supplied.disposition !== "SUPPLIED" || supplied.recordStatus !== "CURRENT" || supplied.tenantId !== actor.tenantId) fail("SUPPLIED_REQUIREMENT_NOT_CURRENT");
  if (supplied.measure.value !== prepared.reading.value || supplied.measure.unit !== prepared.reading.unit) fail("UNIT_OR_VALUE_MISMATCH");
  if (supplied.caseRecordId !== prepared.caseRow.caseRecordId || supplied.subjectObjectId !== prepared.subject.objectId || supplied.objectId !== prepared.object.objectId) fail("CASE_REPOINT_REJECTED");
  const requirementId = explicit(input.requirementId, "REQUIREMENT_REQUIRED");
  const fingerprint = fingerprintCanonical({
    requirementId, family: supplied.family, disposition: "ADOPTED", requirementKind: supplied.requirementKind, measure: prepared.reading,
    suppliedRequirementId: supplied.requirementId, suppliedRequirementFingerprint: supplied.fingerprint,
    caseRecordId: supplied.caseRecordId, subjectObjectId: supplied.subjectObjectId, objectId: supplied.objectId,
  });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.duties.find((row) => row.requirementId === requirementId);
  if (existing) return existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId ? existing : fail("DUPLICATE_DUTY_REJECTED");
  const record: D6R5DutyRecord = {
    ...supplied,
    requirementId, disposition: "ADOPTED", measure: prepared.reading, suppliedRequirementId: supplied.requirementId, suppliedRequirementFingerprint: supplied.fingerprint,
    provenanceRef: prepared.provenanceRef, sourceBasisRef: prepared.sourceBasisRef, applicability: prepared.applicability, limitations: prepared.limitations,
    fingerprint, recordedBy: actor.actorId, recordedAt: store.now(), recordStatus: "CURRENT", currentness: "CURRENT", predecessorRecordId: null,
    mechanicalDesign: false, validatedMechanicalSelection: false, sizedByEos: false, equipmentSelected: false, calculatedByEos: false, eosValidation: false,
    adoptedFromEvidenceResult: false, reliefScenarioCreated: false, processEngineeringAuthority: false,
  };
  store.duties.push(record);
  remember(store, "DUTY", requirementId, "CREATED", fingerprint);
  return record;
}

function recordUtility(store: D6R5Store, actor: D6R1Actor, input: D6R5UtilityInput, disposition: "SUPPLIED"): D6R5UtilityRecord {
  const prepared = prepare(store, actor, input, ["PROCESS_UTILITY_REQUIREMENT"]);
  const utilityType = explicit(input.utilityType, "UTILITY_TYPE_REQUIRED");
  if (!(D6_R5_UTILITY_TYPES as readonly string[]).includes(utilityType)) fail("UTILITY_TYPE_INVALID");
  const utilityRecordId = explicit(input.utilityRecordId, "UTILITY_REQUIRED");
  const predecessor = input.predecessorRecordId ? store.utilities.find((row) => row.utilityRecordId === input.predecessorRecordId) : null;
  if (input.predecessorRecordId) {
    if (!predecessor || predecessor.recordStatus !== "CURRENT" || predecessor.tenantId !== actor.tenantId) fail("PREDECESSOR_NOT_CURRENT");
    if (!sameLineage(store, prepared.object, predecessor.objectId) || predecessor.utilityType !== utilityType || predecessor.caseRecordId !== prepared.caseRow.caseRecordId) fail("CASE_REPOINT_REJECTED");
  }
  const fingerprint = fingerprintCanonical({
    utilityRecordId, utilityType, disposition, measure: prepared.reading, objectId: prepared.object.objectId, objectRevisionFingerprint: prepared.object.fingerprint,
    subjectObjectId: prepared.subject.objectId, caseRecordId: prepared.caseRow.caseRecordId, caseContextFingerprint: prepared.caseRow.fingerprint,
    evidenceId: prepared.evidence?.evidenceId ?? null, evidenceFingerprint: prepared.evidence?.fingerprint ?? null,
    provenanceRef: prepared.provenanceRef, sourceBasisRef: prepared.sourceBasisRef, applicability: prepared.applicability, limitations: prepared.limitations,
    predecessorRecordId: predecessor?.utilityRecordId ?? null,
  });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.utilities.find((row) => row.utilityRecordId === utilityRecordId);
  if (existing) return existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId ? existing : fail("DUPLICATE_UTILITY_REJECTED");
  const duplicate = store.utilities.find((row) => row.recordStatus === "CURRENT" && row.utilityRecordId !== predecessor?.utilityRecordId && row.disposition === "SUPPLIED" && row.utilityType === utilityType && row.subjectObjectId === prepared.subject.objectId && row.caseRecordId === prepared.caseRow.caseRecordId && row.measure.value === prepared.reading.value && row.measure.unit === prepared.reading.unit);
  if (duplicate) fail("DUPLICATE_UTILITY_REJECTED");
  if (predecessor) {
    const index = store.utilities.findIndex((row) => row.utilityRecordId === predecessor.utilityRecordId);
    store.utilities[index] = Object.freeze({ ...predecessor, recordStatus: "SUPERSEDED", currentness: "SUPERSEDED" });
    remember(store, "UTILITY", predecessor.utilityRecordId, "SUPERSEDED", predecessor.fingerprint);
  }
  const record: D6R5UtilityRecord = {
    utilityRecordId, utilityType: utilityType as UtilityType, disposition, measure: prepared.reading, contextId: prepared.context.contextId,
    objectId: prepared.object.objectId, objectType: "PROCESS_UTILITY_REQUIREMENT", objectRevisionFingerprint: prepared.object.fingerprint,
    subjectObjectId: prepared.subject.objectId, subjectRevisionFingerprint: prepared.subject.fingerprint,
    tenantId: actor.tenantId, workspaceId: actor.workspaceId, projectId: actor.projectId, discipline: D6_DISCIPLINE,
    caseClass: input.caseClass as "OPERATING" | "DESIGN", caseRecordId: prepared.caseRow.caseRecordId, caseContextFingerprint: prepared.caseRow.fingerprint,
    evidenceId: prepared.evidence?.evidenceId ?? null, evidenceFingerprint: prepared.evidence?.fingerprint ?? null,
    suppliedUtilityRecordId: null, suppliedUtilityFingerprint: null, citedLifecycleStage: prepared.stage,
    provenanceRef: prepared.provenanceRef, sourceBasisRef: prepared.sourceBasisRef, applicability: prepared.applicability, limitations: prepared.limitations,
    citedCurrentness: prepared.cited, authority: D6_CONTEXT_AUTHORITY, processEngineeringAuthority: false, calculatedByEos: false,
    validatedUtilityRequirement: false, validatedUtilitySystemDesign: false, fingerprint, recordedBy: actor.actorId, recordedAt: store.now(),
    recordStatus: "CURRENT", currentness: "CURRENT", predecessorRecordId: predecessor?.utilityRecordId ?? null,
  };
  store.utilities.push(record);
  remember(store, "UTILITY", utilityRecordId, "CREATED", fingerprint);
  return record;
}

export function recordSuppliedProcessUtilityEvidence(store: D6R5Store, actor: D6R1Actor, input: D6R5UtilityInput): D6R5UtilityRecord {
  return recordUtility(store, actor, input, "SUPPLIED");
}

export function recordAdoptedProcessUtilityRequirement(store: D6R5Store, actor: D6R1Actor, input: D6R5UtilityAdoptionInput): D6R5UtilityRecord {
  const prepared = prepare(store, actor, input, ["PROCESS_UTILITY_REQUIREMENT"]);
  const supplied = store.utilities.find((row) => row.utilityRecordId === explicit(input.suppliedUtilityRecordId, "SUPPLIED_UTILITY_REQUIRED"));
  if (!supplied || supplied.disposition !== "SUPPLIED" || supplied.recordStatus !== "CURRENT" || supplied.tenantId !== actor.tenantId) fail("SUPPLIED_UTILITY_NOT_CURRENT");
  if (supplied.measure.value !== prepared.reading.value || supplied.measure.unit !== prepared.reading.unit) fail("UNIT_OR_VALUE_MISMATCH");
  if (supplied.caseRecordId !== prepared.caseRow.caseRecordId || supplied.subjectObjectId !== prepared.subject.objectId) fail("CASE_REPOINT_REJECTED");
  const utilityRecordId = explicit(input.utilityRecordId, "UTILITY_REQUIRED");
  const fingerprint = fingerprintCanonical({
    utilityRecordId, disposition: "ADOPTED", utilityType: supplied.utilityType, measure: prepared.reading,
    suppliedUtilityRecordId: supplied.utilityRecordId, suppliedUtilityFingerprint: supplied.fingerprint, caseRecordId: supplied.caseRecordId,
  });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.utilities.find((row) => row.utilityRecordId === utilityRecordId);
  if (existing) return existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId ? existing : fail("DUPLICATE_UTILITY_REJECTED");
  const record: D6R5UtilityRecord = {
    ...supplied,
    utilityRecordId, disposition: "ADOPTED", measure: prepared.reading, suppliedUtilityRecordId: supplied.utilityRecordId, suppliedUtilityFingerprint: supplied.fingerprint,
    provenanceRef: prepared.provenanceRef, sourceBasisRef: prepared.sourceBasisRef, applicability: prepared.applicability, limitations: prepared.limitations,
    calculatedByEos: false, validatedUtilityRequirement: false, validatedUtilitySystemDesign: false, processEngineeringAuthority: false,
    fingerprint, recordedBy: actor.actorId, recordedAt: store.now(), recordStatus: "CURRENT", currentness: "CURRENT", predecessorRecordId: null,
  };
  store.utilities.push(record);
  remember(store, "UTILITY", utilityRecordId, "CREATED", fingerprint);
  return record;
}

export function calculateEquipmentDuty(): never {
  return fail("DUTY_NOT_CALCULATED");
}

export function selectProcessEquipment(): never {
  return fail("SELECTION_NOT_IN_R5");
}

export function sizeProcessEquipment(): never {
  return fail("SIZING_NOT_IN_R5");
}

export function calculateUtilityConsumption(): never {
  return fail("UTILITY_NOT_CALCULATED");
}

export function createReliefScenarioFromDuty(): never {
  return fail("PROCESS_SAFETY_NOT_IN_R5");
}

export function mutateMechanicalRecordFromDuty(): never {
  return fail("D4_AUTHORITY_NOT_TRANSFERRED");
}

export function validateProcessDuty(): never {
  return fail("VALIDATION_NOT_IN_R5");
}
