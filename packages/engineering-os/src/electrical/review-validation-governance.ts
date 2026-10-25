/**
 * EOS-D7-R9 Electrical review and validation governance.
 * One bounded runtime on exact R1-R8 revisions. Canonical review governance only.
 * A completed review, closed finding, accepted handoff, or external result is not Electrical validation.
 * Electrical validation is not conformance, approval, certification, or regulatory approval.
 */
import {
  D7_CURRENTNESS_STATES,
  D7_IMPLEMENTATION_PHASE_TYPES,
  D7_IMPLEMENTATION_PHASES,
  D7_MATURITY_STATES,
} from "@rtb/types";
import {
  D2_R9_FINDING_DISPOSITIONS,
  D2_R9_REQUEST_STATUSES,
  D2_R9_SUBJECT_KINDS,
  D2_R9_VALIDATION_STATES,
  REVIEW_COMPLETED_EQUALS_ENGINEERING_VALIDATED,
  REVIEW_REQUEST_PRESENT_EQUALS_ENGINEERING_VALIDATED,
  REVIEW_REQUEST_PRESENT_EQUALS_REVIEW_COMPLETED,
  VALIDATED_EQUALS_CERTIFIED,
  VALIDATED_EQUALS_CONFORMANT,
  VALIDATED_EQUALS_ENGINEERING_APPROVED,
} from "../civil/review-validation-governance";
import { assertHumanApprovalActor } from "../decision-intelligence/invariants";
import { D3_R9_FINDING_CATEGORIES } from "../geotechnical/review-validation-governance";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import { FORBIDDEN_PRE_ISSUE_VERDICTS, PRE_ISSUE_AI_BOUNDARY, PRE_ISSUE_MATERIALITY } from "../pre-issue-review/types";
import { resolveAuthAssuranceLevel } from "../security-closure/privileged-mfa";
import { D1K_R3_SILENT_SOURCE_REPOINTING_ALLOWED } from "../structural-systems/interface-handoff-governance";
import {
  D7_APPROVAL_RUNTIME_COUNT,
  D7_ARC_FLASH_CALCULATION_RUNTIME_COUNT,
  D7_AUTOMATIC_ELECTRICAL_DESIGN_RUNTIME_COUNT,
  D7_AUTOMATIC_ELECTRICAL_REDESIGN_RUNTIME_COUNT,
  D7_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT,
  D7_BATTERY_UPS_CALCULATION_RUNTIME_COUNT,
  D7_CABLE_SIZING_CALCULATION_RUNTIME_COUNT,
  D7_CERTIFICATION_RUNTIME_COUNT,
  D7_CONFORMANCE_DETERMINATION_RUNTIME_COUNT,
  D7_CROSS_DISCIPLINE_CONFLICT_DETECTION_RUNTIME_COUNT,
  D7_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT,
  D7_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT,
  D7_CROSS_DISCIPLINE_RECOMMENDATION_RUNTIME_COUNT,
  D7_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT,
  D7_D8_RUNTIME_INTEGRATION_COUNT,
  D7_D9_RUNTIME_INTEGRATION_COUNT,
  D7_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
  D7_DISCIPLINE_INTERFACE_RUNTIME_READY,
  D7_ELECTRICAL_CALCULATION_RUNTIME_COUNT,
  D7_EQUALS_D1_STRUCTURAL_AUTHORITY,
  D7_EQUALS_D2_CIVIL_AUTHORITY,
  D7_EQUALS_D3_GEOTECHNICAL_AUTHORITY,
  D7_EQUALS_D4_MECHANICAL_AUTHORITY,
  D7_EQUALS_D5_PIPING_AUTHORITY,
  D7_EQUALS_D6_PROCESS_AUTHORITY,
  D7_EQUALS_D8_INSTRUMENTATION_CONTROL_AUTHORITY,
  D7_EXPLICIT_LINEAGE_REQUIRED,
  D7_GROUNDING_CALCULATION_RUNTIME_COUNT,
  D7_HARMONIC_CALCULATION_RUNTIME_COUNT,
  D7_HAZARDOUS_AREA_CLASSIFICATION_RUNTIME_COUNT,
  D7_INFERRED_LINEAGE_ALLOWED,
  D7_LOAD_CALCULATION_RUNTIME_COUNT,
  D7_LOAD_FLOW_CALCULATION_RUNTIME_COUNT,
  D7_MOTOR_STARTING_CALCULATION_RUNTIME_COUNT,
  D7_POWER_QUALITY_CALCULATION_RUNTIME_COUNT,
  D7_PROTECTION_COORDINATION_CALCULATION_RUNTIME_COUNT,
  D7_REUSES_CANONICAL_CURRENTNESS,
  D7_REUSES_CANONICAL_DIGITAL_THREAD,
  D7_REUSES_CANONICAL_FINGERPRINT,
  D7_RUNTIME_COUNT as R8_RUNTIME_COUNT,
  D7_SHORT_CIRCUIT_CALCULATION_RUNTIME_COUNT,
  D7_VOLTAGE_DROP_CALCULATION_RUNTIME_COUNT,
  D8_RUNTIME_STARTED,
  D9_RUNTIME_COUNT,
  D9_RUNTIME_STARTED,
  ADMIN_EQUALS_D7_ELECTRICAL_ENGINEERING_AUTHORITY,
  AI_EQUALS_D7_ELECTRICAL_ENGINEERING_AUTHORITY,
  CURRENT_D7_RECORD_EQUALS_VALIDATED,
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
  D6_REOPENED,
  D6_STATUS,
  D6_TRACK_COMPLETE,
  DATABASE_SCHEMA_CHANGED,
  NEW_DEPENDENCY_ADDED,
  PARALLEL_D7_CURRENTNESS_ENGINE_CREATED,
  PARALLEL_D7_DIGITAL_THREAD_CREATED,
  SECOND_D7_FINGERPRINT_ALGORITHM_CREATED,
  STALE_D7_RECORD_EQUALS_INVALID,
  SUPERSEDED_D7_RECORD_EQUALS_INVALID,
  UNAUTHORIZED_APPROVAL_PROMOTION,
  UNAUTHORIZED_CERTIFICATION_PROMOTION,
  UNAUTHORIZED_CONFORMANCE_PROMOTION,
  UNAUTHORIZED_D8_RUNTIME_PROMOTION,
  UNAUTHORIZED_D9_RUNTIME_PROMOTION,
  UNAUTHORIZED_DISCIPLINE_AUTHORITY_TRANSFER,
  UNAUTHORIZED_ELECTRICAL_CALCULATION_PROMOTION,
  UNAUTHORIZED_ELECTRICAL_DESIGN_PROMOTION,
  UNAUTHORIZED_ELECTRICAL_VALIDATION_PROMOTION,
  UNAUTHORIZED_GA_PROMOTION,
  UNAUTHORIZED_PRODUCT_CLAIM,
  type D7R8Store,
} from "./discipline-interfaces-handoffs";
import { D7_CONTEXT_AUTHORITY, D7_DISCIPLINE, type D7R1Actor } from "./identity-foundation";

export const D7_R9_STATUS = "REVIEW_AND_VALIDATION_GOVERNANCE_IMPLEMENTED" as const;
export const D7_R9_MATURITY = D7_R9_STATUS;
export const D7_R9_MATURITY_STATE = D7_R9_STATUS;
export const D7_R9_CLOSEOUT_PATH =
  "docs/architecture/engineering-os/EOS_D7_R9_REVIEW_AND_VALIDATION_GOVERNANCE_CLOSEOUT.md" as const;
export const D7_RUNTIME_STARTED = true as const;
export const D7_RUNTIME_COUNT = 9 as const;
export const D7_REVIEW_VALIDATION_RUNTIME_IMPLEMENTED = true as const;
export const D7_REVIEW_VALIDATION_RUNTIME_COUNT = 1 as const;
export const D7_REVIEW_VALIDATION_RUNTIME_READY = true as const;
export const D7_R1_R8_EXACT_SOURCE_REVISIONS_REUSED = true as const;
export const EXACT_D7_R9_REVIEW_SUBJECT_REVISION_REQUIRED = true as const;
export const FLOATING_D7_R9_SUBJECT_REFERENCE_ALLOWED = false as const;
export const D7_R9_SUBJECT_AUTO_REPOINTED = D1K_R3_SILENT_SOURCE_REPOINTING_ALLOWED;
export const D7_REUSES_CANONICAL_REVIEW_GOVERNANCE = true as const;
export const PARALLEL_D7_REVIEW_ENGINE_CREATED = false as const;
export const D7_ELECTRICAL_REVIEW_REQUEST_IMPLEMENTED = true as const;
export const ELECTRICAL_REVIEW_REQUESTED_EQUALS_REVIEW_COMPLETED = REVIEW_REQUEST_PRESENT_EQUALS_REVIEW_COMPLETED;
export const ELECTRICAL_REVIEW_REQUESTED_EQUALS_VALIDATED = REVIEW_REQUEST_PRESENT_EQUALS_ENGINEERING_VALIDATED;
export const D7_REVIEWER_AUTHORITY_REQUIRED = true as const;
export const D7_REVIEWER_AUTHORITY_TRACEABLE = true as const;
export const AI_EQUALS_D7_REVIEWER_AUTHORITY = false as const;
export const ADMIN_EQUALS_D7_REVIEWER_AUTHORITY = false as const;
export const D7_ELECTRICAL_REVIEW_FINDING_IMPLEMENTED = true as const;
export const ELECTRICAL_REVIEW_FINDING_EQUALS_DESIGN_INVALID = false as const;
export const ELECTRICAL_REVIEW_FINDING_EQUALS_VALIDATION_FAILURE = false as const;
export const D7_ELECTRICAL_FINDING_DISPOSITION_IMPLEMENTED = true as const;
export const ELECTRICAL_FINDING_CLOSED_EQUALS_VALIDATED = false as const;
export const ELECTRICAL_FINDING_ACCEPTED_EQUALS_APPROVED = PRE_ISSUE_AI_BOUNDARY.mayApproveDesign;
export const ELECTRICAL_FINDING_DISPOSITION_EQUALS_CONFORMANCE = PRE_ISSUE_AI_BOUNDARY.mayDeclareCodeCompliance;
export const D7_ELECTRICAL_REVIEW_COMPLETION_IMPLEMENTED = true as const;
export const ELECTRICAL_REVIEW_COMPLETED_EQUALS_VALIDATED = REVIEW_COMPLETED_EQUALS_ENGINEERING_VALIDATED;
export const ELECTRICAL_REVIEW_COMPLETED_EQUALS_CONFORMANT = PRE_ISSUE_AI_BOUNDARY.mayDeclareCodeCompliance;
export const ELECTRICAL_REVIEW_COMPLETED_EQUALS_APPROVED = PRE_ISSUE_AI_BOUNDARY.mayApproveDesign;
export const ELECTRICAL_REVIEW_COMPLETED_EQUALS_CERTIFIED = PRE_ISSUE_AI_BOUNDARY.mayCertifyCalculation;
export const D7_ELECTRICAL_VALIDATION_STATE_IMPLEMENTED = true as const;
export const ELECTRICAL_VALIDATED_EQUALS_CONFORMANT = VALIDATED_EQUALS_CONFORMANT;
export const ELECTRICAL_VALIDATED_EQUALS_APPROVED = VALIDATED_EQUALS_ENGINEERING_APPROVED;
export const ELECTRICAL_VALIDATED_EQUALS_CERTIFIED = VALIDATED_EQUALS_CERTIFIED;
export const ELECTRICAL_VALIDATED_EQUALS_REGULATORY_APPROVED = false as const;
export const D7_VALIDATION_AUTHORITY_REQUIRED = true as const;
export const D7_VALIDATION_AUTHORITY_TRACEABLE = true as const;
export const AI_EQUALS_D7_VALIDATION_AUTHORITY = false as const;
export const ADMIN_EQUALS_D7_VALIDATION_AUTHORITY = false as const;
export const D7_R9_REVIEW_COMPLETION_AUTO_VALIDATES_ENGINEERING = false as const;
export const D7_R9_FINDING_CLOSURE_AUTO_VALIDATES_ENGINEERING = false as const;
export const D7_R9_EXTERNAL_EVIDENCE_AUTO_VALIDATES_ENGINEERING = false as const;
export const D7_R9_R7_REASSESSMENT_INTEGRATION_IMPLEMENTED = true as const;
export const REASSESSMENT_REQUIRED_EQUALS_VALIDATION_FAILED = false as const;
export const REASSESSMENT_COMPLETED_EQUALS_VALIDATED = false as const;
export const REASSESSMENT_COMPLETED_EQUALS_APPROVED = false as const;
export const D7_R9_R7_CHANGE_INTEGRATION_IMPLEMENTED = true as const;
export const D7_PRIOR_REVIEW_AUTO_TRANSFERS_TO_NEW_REVISION = false as const;
export const D7_PRIOR_VALIDATION_AUTO_TRANSFERS_TO_NEW_REVISION = false as const;
export const STALE_D7_VALIDATION_EXPOSED_AS_CURRENT_VALIDATION = false as const;
export const SUPERSEDED_D7_VALIDATION_EXPOSED_AS_CURRENT_VALIDATION = false as const;
export const REASSESSMENT_REQUIRED_D7_VALIDATION_EXPOSED_AS_FULLY_CURRENT = false as const;
export const D7_R9_CAN_REVIEW_R8_HANDOFF = true as const;
export const D7_REVIEW_OF_HANDOFF_EQUALS_COUNTERPART_VALIDATION = false as const;
export const D7_VALIDATION_OF_D7_HANDOFF_EQUALS_COUNTERPART_ENGINEERING_VALIDATED = false as const;
export const D7_R9_VALIDATES_D1_STRUCTURAL_ENGINEERING = false as const;
export const D7_R9_VALIDATES_D2_CIVIL_ENGINEERING = false as const;
export const D7_R9_VALIDATES_D3_GEOTECHNICAL_ENGINEERING = false as const;
export const D7_R9_VALIDATES_D4_MECHANICAL_ENGINEERING = false as const;
export const D7_R9_VALIDATES_D5_PIPING_ENGINEERING = false as const;
export const D7_R9_VALIDATES_D6_PROCESS_ENGINEERING = false as const;
export const D7_R9_VALIDATES_D8_IAC_ENGINEERING = false as const;
export const D7_HANDOFF_ACCEPTED_EQUALS_ELECTRICAL_VALIDATION = false as const;
export const D7_HANDOFF_ACCEPTED_EQUALS_COUNTERPART_VALIDATION = false as const;
export const ELECTRICAL_CALCULATION_EVIDENCE_EQUALS_ENGINEERING_VALIDATION = false as const;
export const EXTERNAL_ELECTRICAL_TOOL_RESULT_EQUALS_D7_VALIDATION = false as const;
export const PROTECTION_SETTING_PRESENT_EQUALS_VALIDATED_PROTECTION_DESIGN = false as const;
export const GROUNDING_CONTEXT_EQUALS_VALIDATED_GROUNDING_DESIGN = false as const;
export const HAZARDOUS_AREA_CONTEXT_EQUALS_VALIDATED_HAZARDOUS_AREA_CLASSIFICATION = false as const;
export const HAZARDOUS_AREA_EQUIPMENT_SUITABILITY_CONTEXT_EQUALS_VALIDATED_SELECTION = false as const;
export const D7_R9_CLAIMS_REGULATORY_APPROVAL = false as const;
export const D7_R9_HISTORY_PRESERVED = true as const;
export const D7_R9_HISTORICAL_REFERENCE_AUTO_REPOINTED = D1K_R3_SILENT_SOURCE_REPOINTING_ALLOWED;
export const SILENT_D7_R9_MUTATION_ALLOWED = false as const;
export const D7_R9_AUTO_MUTATES_R1_IDENTITY = false as const;
export const D7_R9_AUTO_MUTATES_R2_SYSTEM_SOURCE_DISTRIBUTION = false as const;
export const D7_R9_AUTO_MUTATES_R3_LOAD_CONSUMER_EQUIPMENT = false as const;
export const D7_R9_AUTO_MUTATES_R4_FEEDER_CABLE_RATING = false as const;
export const D7_R9_AUTO_MUTATES_R5_CALCULATION_EVIDENCE = false as const;
export const D7_R9_AUTO_MUTATES_R6_PROTECTION_GROUNDING_HAZARDOUS_AREA = false as const;
export const D7_R9_AUTO_MUTATES_R7_CHANGE_GOVERNANCE = false as const;
export const D7_R9_AUTO_MUTATES_R8_HANDOFF = false as const;
export const D7_R9_REVIEW_PERFORMS_ENGINEERING_CALCULATION = false as const;
export const D7_R9_VALIDATION_PERFORMS_ENGINEERING_CALCULATION = false as const;
export const D7_R9_SOURCE_BASIS_REQUIRED = true as const;
export const D7_R9_SOURCE_BASIS_TRACEABLE = true as const;
export const D7_R9_APPLICABILITY_EXPLICIT = true as const;
export const D7_R9_LIMITATIONS_EXPLICIT = true as const;
export const D7_R9_AUTO_PROPAGATED_OUTSIDE_APPLICABILITY = false as const;
export const D7_R9_PROVENANCE_REQUIRED = true as const;
export const D7_R9_PROVENANCE_PRESERVED = true as const;
export const TENANT_WORKSPACE_PROJECT_D7_R9_SCOPE_ENFORCED = true as const;
export const CROSS_TENANT_D7_R9_ACCESS_ALLOWED = false as const;
export const AI_CAN_CLOSE_D7_FINDING_AS_VALIDATED = PRE_ISSUE_AI_BOUNDARY.mayApproveDesign;
export const AI_CAN_PROMOTE_D7_REVIEW_TO_VALIDATION = false as const;
export const ADMIN_CAN_PROMOTE_D7_REVIEW_TO_VALIDATION = false as const;
export const D7_R9_DUPLICATE_GOVERNANCE_IMPLEMENTED = true as const;
export const D7_R9_REPLAY_PROTECTION_IMPLEMENTED = true as const;
export const D7_R9_SPOOFING_PROTECTION_IMPLEMENTED = true as const;
export const UNAUTHORIZED_D7_R10_R12_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_REVIEW_TO_VALIDATION_PROMOTION = false as const;
export const UNAUTHORIZED_FINDING_TO_VALIDATION_PROMOTION = false as const;
export const UNAUTHORIZED_EVIDENCE_TO_VALIDATION_PROMOTION = false as const;
export const UNAUTHORIZED_HANDOFF_TO_VALIDATION_PROMOTION = false as const;
export const UNAUTHORIZED_PRIOR_VALIDATION_TRANSFER = false as const;
export const UNAUTHORIZED_AUTOMATIC_VALIDATION_PROMOTION = false as const;
export const UNAUTHORIZED_COUNTERPART_VALIDATION_TRANSFER = false as const;
export const UNAUTHORIZED_PARALLEL_CURRENTNESS_ENGINE = false as const;
export const UNAUTHORIZED_PARALLEL_DIGITAL_THREAD = false as const;
export const UNAUTHORIZED_SECOND_FINGERPRINT_ALGORITHM = false as const;
export const UNAUTHORIZED_INFERRED_LINEAGE = false as const;
export const UNAUTHORIZED_HISTORICAL_AUTO_REPOINT = false as const;
export const D7_R9_REQUEST_STATUSES = D2_R9_REQUEST_STATUSES;
export const D7_R9_FINDING_DISPOSITIONS = D2_R9_FINDING_DISPOSITIONS;
export const D7_R9_VALIDATION_STATES = D2_R9_VALIDATION_STATES;
export const D7_R9_SUBJECT_KINDS = [
  ...D2_R9_SUBJECT_KINDS,
  "SYSTEM",
  "SOURCE",
  "DISTRIBUTION",
  "LOAD",
  "CONSUMER",
  "SUPPLY",
  "FEEDER",
  "CABLE",
  "RATING",
  "EVIDENCE",
  "PROTECTION",
  "SETTING",
  "GROUNDING",
  "HAZARDOUS_AREA",
  "SUITABILITY",
] as const;
export const D7_R9_REVIEW_TYPES = ["ELECTRICAL_SUBJECT_REVIEW", "INTERFACE_HANDOFF_REVIEW"] as const;
export const D7_R9_FINDING_CATEGORIES = D3_R9_FINDING_CATEGORIES;
export const D7_R9_BASIS_KINDS = [
  "R2_SYSTEM",
  "R3_LOAD",
  "R4_FEEDER",
  "R5_EVIDENCE",
  "R6_DEVICE",
  "R6_SETTING",
  "R6_GROUNDING",
  "R6_HAZARDOUS_AREA",
  "R6_SUITABILITY",
  "R7_REQUIREMENT",
  "R7_DECISION",
  "R7_REASSESSMENT",
  "R8_HANDOFF",
] as const;
export const D7_R9_VALIDATION_AUTHORITY = "ELECTRICAL_VALIDATION_AUTHORITY" as const;
export const D7_R9_REVIEW_AI_BOUNDARY_REUSED = PRE_ISSUE_AI_BOUNDARY;
export const D7_R10_CANONICAL_PHASE = D7_IMPLEMENTATION_PHASES[9];
export const D7_R10_PHASE_TYPE = D7_IMPLEMENTATION_PHASE_TYPES[9];
export const D7_R10_CANONICAL_SCOPE =
  "Implement the dedicated D7 currentness and digital-thread runtime across exact R1-R9 revisions using the canonical EOS currentness, digital-thread and fingerprint mechanisms. Integrate identity, system/source/distribution, load/consumer/equipment, feeder/cable/rating, calculation evidence, protection/grounding/hazardous-area, requirements/change, interfaces and review/validation states. Preserve current != validated, stale/superseded != invalid, explicit lineage only, no historical auto-repointing, and no review/validation state transfer to newer revisions. Do not create a parallel currentness engine, digital thread or fingerprint algorithm." as const;
export const D7_R10_STARTED = false as const;
export const D7_R9_READY_FOR_NEXT_PHASE = true as const;
export const D7_R9_NEXT_PHASE = D7_R10_CANONICAL_PHASE;
export const D7_R9_NEXT_PHASE_TYPE = D7_R10_PHASE_TYPE;
export const D7_R9_CANONICAL_NEXT_PHASE = D7_R10_CANONICAL_PHASE;
export const D7_R9_CANONICAL_NEXT_PHASE_SCOPE = D7_R10_CANONICAL_SCOPE;
export const D7_R9_BLOCKER = "NONE" as const;
export const D7_R9_MACHINE_READABLE_ROADMAP_UPDATED = true as const;

export {
  D7_DISCIPLINE_INTERFACE_RUNTIME_READY,
  D7_ELECTRICAL_CALCULATION_RUNTIME_COUNT,
  D7_LOAD_CALCULATION_RUNTIME_COUNT,
  D7_LOAD_FLOW_CALCULATION_RUNTIME_COUNT,
  D7_SHORT_CIRCUIT_CALCULATION_RUNTIME_COUNT,
  D7_MOTOR_STARTING_CALCULATION_RUNTIME_COUNT,
  D7_VOLTAGE_DROP_CALCULATION_RUNTIME_COUNT,
  D7_CABLE_SIZING_CALCULATION_RUNTIME_COUNT,
  D7_PROTECTION_COORDINATION_CALCULATION_RUNTIME_COUNT,
  D7_ARC_FLASH_CALCULATION_RUNTIME_COUNT,
  D7_GROUNDING_CALCULATION_RUNTIME_COUNT,
  D7_POWER_QUALITY_CALCULATION_RUNTIME_COUNT,
  D7_HARMONIC_CALCULATION_RUNTIME_COUNT,
  D7_BATTERY_UPS_CALCULATION_RUNTIME_COUNT,
  D7_HAZARDOUS_AREA_CLASSIFICATION_RUNTIME_COUNT,
  D7_AUTOMATIC_ELECTRICAL_DESIGN_RUNTIME_COUNT,
  D7_AUTOMATIC_ELECTRICAL_REDESIGN_RUNTIME_COUNT,
  D7_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT,
  D7_CONFORMANCE_DETERMINATION_RUNTIME_COUNT,
  D7_APPROVAL_RUNTIME_COUNT,
  D7_CERTIFICATION_RUNTIME_COUNT,
  D7_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT,
  D7_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
  D7_D9_RUNTIME_INTEGRATION_COUNT,
  D7_D8_RUNTIME_INTEGRATION_COUNT,
  D7_REUSES_CANONICAL_CURRENTNESS,
  PARALLEL_D7_CURRENTNESS_ENGINE_CREATED,
  CURRENT_D7_RECORD_EQUALS_VALIDATED,
  STALE_D7_RECORD_EQUALS_INVALID,
  SUPERSEDED_D7_RECORD_EQUALS_INVALID,
  D7_REUSES_CANONICAL_DIGITAL_THREAD,
  PARALLEL_D7_DIGITAL_THREAD_CREATED,
  D7_EXPLICIT_LINEAGE_REQUIRED,
  D7_INFERRED_LINEAGE_ALLOWED,
  D7_REUSES_CANONICAL_FINGERPRINT,
  SECOND_D7_FINGERPRINT_ALGORITHM_CREATED,
  D7_EQUALS_D1_STRUCTURAL_AUTHORITY,
  D7_EQUALS_D2_CIVIL_AUTHORITY,
  D7_EQUALS_D3_GEOTECHNICAL_AUTHORITY,
  D7_EQUALS_D4_MECHANICAL_AUTHORITY,
  D7_EQUALS_D5_PIPING_AUTHORITY,
  D7_EQUALS_D6_PROCESS_AUTHORITY,
  D7_EQUALS_D8_INSTRUMENTATION_CONTROL_AUTHORITY,
  AI_EQUALS_D7_ELECTRICAL_ENGINEERING_AUTHORITY,
  ADMIN_EQUALS_D7_ELECTRICAL_ENGINEERING_AUTHORITY,
  D7_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT,
  D7_CROSS_DISCIPLINE_CONFLICT_DETECTION_RUNTIME_COUNT,
  D7_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT,
  D7_CROSS_DISCIPLINE_RECOMMENDATION_RUNTIME_COUNT,
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
  D6_TRACK_COMPLETE,
  D6_STATUS,
  D6_REOPENED,
  D8_RUNTIME_STARTED,
  D9_RUNTIME_STARTED,
  D9_RUNTIME_COUNT,
  DATABASE_SCHEMA_CHANGED,
  NEW_DEPENDENCY_ADDED,
  UNAUTHORIZED_APPROVAL_PROMOTION,
  UNAUTHORIZED_CERTIFICATION_PROMOTION,
  UNAUTHORIZED_CONFORMANCE_PROMOTION,
  UNAUTHORIZED_ELECTRICAL_VALIDATION_PROMOTION,
  UNAUTHORIZED_ELECTRICAL_CALCULATION_PROMOTION,
  UNAUTHORIZED_ELECTRICAL_DESIGN_PROMOTION,
  UNAUTHORIZED_D8_RUNTIME_PROMOTION,
  UNAUTHORIZED_D9_RUNTIME_PROMOTION,
  UNAUTHORIZED_DISCIPLINE_AUTHORITY_TRANSFER,
  UNAUTHORIZED_GA_PROMOTION,
  UNAUTHORIZED_PRODUCT_CLAIM,
};

const FLOATING = new Set(["latest", "current", "newest", "head", "active", "active model", "now"]);
const FORBIDDEN = new Set<string>(FORBIDDEN_PRE_ISSUE_VERDICTS);
const CLOSED = new Set(["closed", "accepted", "approved", "validated", "conformant", "certified"]);

type Currentness = (typeof D7_CURRENTNESS_STATES)[number];
type SubjectKind = (typeof D7_R9_SUBJECT_KINDS)[number];
type Prohibited = {
  automaticValidation?: boolean;
  validated?: boolean;
  reviewCompleted?: boolean;
  closeFindingAsValidated?: boolean;
  closeReassessmentAsValidated?: boolean;
  evidenceEqualsValidation?: boolean;
  transferReview?: boolean;
  transferValidation?: boolean;
  repoint?: boolean;
  approve?: boolean;
  certify?: boolean;
  conform?: boolean;
  regulatoryApproval?: boolean;
  validateCounterpart?: boolean;
  validateStructural?: boolean;
  validateCivil?: boolean;
  validateGeotechnical?: boolean;
  validateMechanical?: boolean;
  validatePiping?: boolean;
  validateProcess?: boolean;
  validateIac?: boolean;
  handoffAcceptedEqualsValidation?: boolean;
  protectionDesignValidated?: boolean;
  groundingDesignValidated?: boolean;
  hazardousAreaValidated?: boolean;
  suitabilityValidated?: boolean;
  calculate?: boolean;
  redesign?: boolean;
  mutateUpstream?: boolean;
  mutateHandoff?: boolean;
  d9Reasoning?: boolean;
  reasonAcrossDisciplines?: boolean;
  inferLineage?: boolean;
};

export type D7R9Actor = D7R1Actor & { actorKind?: "human" | "ai"; aal?: string; amr?: string[] };

type SourcePin = {
  objectId?: string;
  equipmentObjectId?: string;
  fingerprint: string;
  provenanceRef: string;
  recordStatus: string;
  currentness: string;
  tenantId: string;
  engineeringValidated?: boolean;
  state?: string;
};

export type D7R9SubjectPin = {
  subjectKind: SubjectKind;
  subjectId: string;
  subjectRevision: string;
  subjectFingerprint: string;
  contextId: string;
  objectId: string;
  objectRevisionFingerprint: string;
  subjectRecordStatus: string;
  subjectCurrentness: string;
};

type Basis = { kind: (typeof D7_R9_BASIS_KINDS)[number]; id: string; fingerprint: string };

type Governed = D7R9SubjectPin & {
  applicability: string;
  limitations: string;
  provenanceRef: string;
  sourceBasisRef: string;
  citedCurrentness: Currentness;
  currentness: Currentness;
  citedLifecycleStage: (typeof D7_MATURITY_STATES)[number];
  fingerprint: string;
  recordStatus: "CURRENT" | "SUPERSEDED";
  tenantId: string;
  workspaceId: string;
  projectId: string;
  engineeringValidated: boolean;
  conformant: false;
  approved: false;
  certified: false;
  regulatoryApproved: false;
  counterpartValidated: false;
  evidenceEqualsValidation: false;
  protectionDesignValidated: false;
  groundingDesignValidated: false;
  hazardousAreaValidated: false;
  suitabilityValidated: false;
  deleted: false;
  invalidated: false;
  createdAt: string;
  createdBy: string;
};

export type D7R9ReviewRequestRecord = Governed & {
  reviewRequestId: string;
  reviewType: (typeof D7_R9_REVIEW_TYPES)[number];
  reviewScope: string;
  requestStatus: (typeof D7_R9_REQUEST_STATUSES)[number];
  requestedReviewerAuthority: "REVIEWER";
  reviewCompleted: false;
  predecessorReviewRequestId: string | null;
  predecessorFingerprint: string | null;
};

export type D7R9FindingRecord = Governed & {
  findingId: string;
  reviewRequestId: string;
  findingCategory: (typeof D7_R9_FINDING_CATEGORIES)[number];
  severity: (typeof PRE_ISSUE_MATERIALITY)[number];
  findingText: string;
  disposition: (typeof D7_R9_FINDING_DISPOSITIONS)[number];
  reviewerId: string;
  reviewerAuthority: "REVIEWER";
  engineeringInvalid: false;
};

export type D7R9DispositionRecord = Governed & {
  dispositionId: string;
  findingId: string;
  disposition: (typeof D7_R9_FINDING_DISPOSITIONS)[number];
  reviewerId: string;
  reviewerAuthority: "REVIEWER";
  changeId: string | null;
  changeFingerprint: string | null;
  reassessmentId: string | null;
  reassessmentFingerprint: string | null;
};

export type D7R9CompletionRecord = Governed & {
  completionId: string;
  reviewRequestId: string;
  reviewCompleted: true;
  reviewerId: string;
  reviewerAuthority: "REVIEWER";
  predecessorCompletionId: string | null;
  predecessorFingerprint: string | null;
};

export type D7R9ValidationRecord = Governed & {
  validationId: string;
  validationScope: string;
  validationState: (typeof D7_R9_VALIDATION_STATES)[number];
  validationAuthority: typeof D7_R9_VALIDATION_AUTHORITY;
  validatorId: string;
  basis: Basis[];
  reviewRequestId: string | null;
  changeId: string | null;
  changeFingerprint: string | null;
  reassessmentId: string | null;
  reassessmentFingerprint: string | null;
  predecessorValidationId: string | null;
  predecessorFingerprint: string | null;
};

export type D7R9History = {
  historyId: string;
  subjectKind: "REQUEST" | "FINDING" | "DISPOSITION" | "COMPLETION" | "VALIDATION";
  subjectId: string;
  action: "CREATED" | "SUPERSEDED";
  fingerprint: string;
  recordedAt: string;
};

export type D7R9Store = {
  r8: D7R8Store;
  now: () => string;
  requests: D7R9ReviewRequestRecord[];
  findings: D7R9FindingRecord[];
  dispositions: D7R9DispositionRecord[];
  completions: D7R9CompletionRecord[];
  validations: D7R9ValidationRecord[];
  history: D7R9History[];
};

type Chain = {
  contextId: string;
  objectId: string;
  objectRevisionFingerprint: string;
  subjectKind: string;
  subjectId: string;
  subjectRevision: string;
  subjectFingerprint: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
};

function fail(code: string): never {
  throw new Error(`D7_R9_${code}`);
}

function blockedParty(value: string): boolean {
  return /^AI(?:\b|_)/i.test(value) || /LLM/i.test(value) || /OPTIMIZER/i.test(value);
}

function explicit(value: string, code: string): string {
  const token = value.trim();
  if (!token || FLOATING.has(token.toLowerCase()) || blockedParty(token)) fail(code);
  if (/[=]|calc\(|solve\(/i.test(token)) fail("HIDDEN_CALCULATION_REJECTED");
  return token;
}

function sameScope(row: { tenantId: string; workspaceId: string; projectId: string }, actor: D7R9Actor): boolean {
  return row.tenantId === actor.tenantId && row.workspaceId === actor.workspaceId && row.projectId === actor.projectId;
}

function assertScope(actor: D7R9Actor, input: { tenantId: string; workspaceId: string; projectId: string }): void {
  if (!actor.actorId.trim() || !actor.tenantId.trim() || !actor.workspaceId.trim() || !actor.projectId.trim()) fail("SCOPE_REQUIRED");
  if (explicit(input.tenantId, "SCOPE_REQUIRED") !== actor.tenantId || explicit(input.workspaceId, "SCOPE_REQUIRED") !== actor.workspaceId || explicit(input.projectId, "SCOPE_REQUIRED") !== actor.projectId) {
    fail("SCOPE_MISMATCH");
  }
}

function assertHuman(actor: D7R9Actor, code: string): void {
  if (blockedParty(actor.actorId) || blockedParty(actor.authority) || actor.actorKind === "ai") fail(code);
  if (actor.actorId === "ADMIN" || actor.actorId === "ADMINISTRATOR" || actor.authority === "ADMIN" || actor.authority === "ADMINISTRATOR") fail(code);
  if (actor.authority === "ELECTRICAL_ENGINEERING_AUTHORITY") fail("AUTHORITY_SPOOFING_REJECTED");
  assertHumanApprovalActor("human", actor.actorId);
}

function assertRecorder(actor: D7R9Actor): void {
  assertHuman(actor, "AI_NOT_ELECTRICAL_AUTHORITY");
  if (actor.authority !== D7_CONTEXT_AUTHORITY) fail("RECORDER_AUTHORITY_INVALID");
}

function assertReviewer(actor: D7R9Actor): void {
  assertHuman(actor, "AI_NOT_ELECTRICAL_REVIEWER");
  if (actor.authority !== "REVIEWER" || actor.actorKind !== "human") fail("REVIEWER_AUTHORITY_REQUIRED");
  if (resolveAuthAssuranceLevel({ aal: actor.aal, amr: actor.amr }) !== "aal2") fail("AAL2_REQUIRED");
}

function assertValidator(actor: D7R9Actor): void {
  assertHuman(actor, "AI_NOT_VALIDATION_AUTHORITY");
  if (actor.authority !== D7_R9_VALIDATION_AUTHORITY || actor.actorKind !== "human") fail("VALIDATION_AUTHORITY_REQUIRED");
  if (resolveAuthAssuranceLevel({ aal: actor.aal, amr: actor.amr }) !== "aal2") fail("AAL2_REQUIRED");
}

function assertProhibited(input: Prohibited): void {
  if (input.automaticValidation === true || input.validated === true) fail("AUTOMATIC_VALIDATION_REJECTED");
  if (input.reviewCompleted === true) fail("REVIEW_REQUEST_NOT_COMPLETION");
  if (input.closeFindingAsValidated === true) fail("FINDING_CLOSURE_NOT_VALIDATION");
  if (input.closeReassessmentAsValidated === true) fail("REASSESSMENT_NOT_VALIDATION");
  if (input.evidenceEqualsValidation === true) fail("EVIDENCE_NOT_VALIDATION");
  if (input.transferReview === true) fail("REVIEW_TRANSFER_REJECTED");
  if (input.transferValidation === true) fail("VALIDATION_TRANSFER_REJECTED");
  if (input.repoint === true) fail("AUTO_REPOINT_REJECTED");
  if (input.approve === true) fail("APPROVAL_NOT_IN_R9");
  if (input.certify === true) fail("CERTIFICATION_NOT_IN_R9");
  if (input.conform === true) fail("CONFORMANCE_NOT_IN_R9");
  if (input.regulatoryApproval === true) fail("REGULATORY_APPROVAL_NOT_IN_R9");
  if (
    input.validateCounterpart === true || input.validateStructural === true || input.validateCivil === true || input.validateGeotechnical === true
    || input.validateMechanical === true || input.validatePiping === true || input.validateProcess === true || input.validateIac === true
  ) fail("COUNTERPART_VALIDATION_REJECTED");
  if (input.handoffAcceptedEqualsValidation === true) fail("HANDOFF_NOT_VALIDATION");
  if (input.protectionDesignValidated === true || input.groundingDesignValidated === true || input.hazardousAreaValidated === true || input.suitabilityValidated === true) {
    fail("CONTEXT_NOT_VALIDATION");
  }
  if (input.calculate === true || input.redesign === true) fail("CALCULATION_NOT_IN_R9");
  if (input.mutateUpstream === true || input.mutateHandoff === true) fail("UPSTREAM_MUTATION_REJECTED");
  if (input.d9Reasoning === true || input.reasonAcrossDisciplines === true) fail("CROSS_DISCIPLINE_REASONING_NOT_IN_R9");
  if (input.inferLineage === true) fail("INFERRED_LINEAGE_REJECTED");
}

function governedObject(row: SourcePin): string {
  return row.objectId ?? row.equipmentObjectId ?? "";
}

function locate(store: D7R8Store, kind: string, id: string): SourcePin | undefined {
  const r7 = store.r7;
  const r6 = r7.r6;
  const r5 = r6.r5;
  const r4 = r5.r4;
  const r3 = r4.r3;
  const r2 = r3.r2;
  const r1 = r2.r1;
  if (kind === "OBJECT") return r1.objects.find((row) => row.objectId === id);
  if (kind === "SYSTEM") return r2.systems.find((row) => row.systemRecordId === id);
  if (kind === "SOURCE") return r2.sources.find((row) => row.sourceRecordId === id);
  if (kind === "DISTRIBUTION") return r2.distributions.find((row) => row.distributionRecordId === id);
  if (kind === "LOAD") return r3.loads.find((row) => row.loadRecordId === id);
  if (kind === "CONSUMER") return r3.consumers.find((row) => row.consumerRecordId === id);
  if (kind === "SUPPLY") return r3.supplies.find((row) => row.supplyRecordId === id);
  if (kind === "FEEDER") return r4.feeders.find((row) => row.feederRecordId === id);
  if (kind === "CABLE") return r4.cables.find((row) => row.cableRecordId === id);
  if (kind === "RATING") return r4.ratings.find((row) => row.ratingRecordId === id);
  if (kind === "EVIDENCE") return r5.evidence.find((row) => row.evidenceId === id);
  if (kind === "PROTECTION") return r6.devices.find((row) => row.deviceRecordId === id);
  if (kind === "SETTING") return r6.settings.find((row) => row.settingRecordId === id);
  if (kind === "GROUNDING") return r6.grounding.find((row) => row.groundingRecordId === id);
  if (kind === "HAZARDOUS_AREA") return r6.hazardousAreas.find((row) => row.areaRecordId === id);
  if (kind === "SUITABILITY") return r6.suitability.find((row) => row.suitabilityRecordId === id);
  if (kind === "REQUIREMENT") return r7.requirements.find((row) => row.requirementId === id);
  if (kind === "ASSUMPTION") return r7.assumptions.find((row) => row.assumptionId === id);
  if (kind === "DECISION") return r7.decisions.find((row) => row.decisionId === id);
  if (kind === "CHANGE") return r7.changes.find((row) => row.changeId === id);
  if (kind === "HANDOFF") return store.handoffs.find((row) => row.handoffId === id);
  return undefined;
}

function seal(store: D7R9Store): string {
  const r7 = store.r8.r7;
  const r6 = r7.r6;
  const r4 = r6.r5.r4;
  return JSON.stringify({
    objects: r6.r5.r4.r3.r2.r1.objects,
    systems: r4.r3.r2.systems,
    sources: r4.r3.r2.sources,
    distributions: r4.r3.r2.distributions,
    loads: r4.r3.loads,
    feeders: r4.feeders,
    evidence: r6.r5.evidence,
    devices: r6.devices,
    settings: r6.settings,
    grounding: r6.grounding,
    hazardousAreas: r6.hazardousAreas,
    suitability: r6.suitability,
    requirements: r7.requirements,
    changes: r7.changes,
    reassessments: r7.reassessments,
    handoffs: store.r8.handoffs,
    counterparts: store.r8.counterparts,
  });
}

function bind(store: D7R9Store, actor: D7R9Actor, input: Chain, cited: Currentness): D7R9SubjectPin {
  const context = store.r8.r7.r1.contexts.find((row) => row.contextId === explicit(input.contextId, "R1_CONTEXT_REQUIRED"));
  if (!context || !sameScope(context, actor)) fail("R1_CONTEXT_NOT_FOUND");
  const object = store.r8.r7.r1.objects.find((row) => row.objectId === explicit(input.objectId, "R1_OBJECT_REQUIRED"));
  if (!object || object.fingerprint !== explicit(input.objectRevisionFingerprint, "R1_REVISION_REQUIRED") || !sameScope(object, actor)) fail("R1_REVISION_MISMATCH");
  const subjectKind = explicit(input.subjectKind, "SUBJECT_KIND_REQUIRED");
  if (!(D7_R9_SUBJECT_KINDS as readonly string[]).includes(subjectKind)) fail("SUBJECT_KIND_INVALID");
  const subjectId = explicit(input.subjectId, "SUBJECT_REFERENCE_REQUIRED");
  const subject = locate(store.r8, subjectKind, subjectId);
  const subjectFingerprint = explicit(input.subjectFingerprint, "SUBJECT_FINGERPRINT_REQUIRED");
  const subjectRevision = explicit(input.subjectRevision, "SUBJECT_REVISION_REQUIRED");
  if (!subject || subject.fingerprint !== subjectFingerprint || subject.provenanceRef !== subjectRevision || subject.tenantId !== actor.tenantId || governedObject(subject) !== object.objectId) {
    fail("SUBJECT_REVISION_MISMATCH");
  }
  if (cited === "CURRENT" && (subject.recordStatus !== "CURRENT" || object.recordStatus !== "CURRENT" || context.recordStatus !== "CURRENT")) fail("SUBJECT_NOT_CURRENT");
  return {
    subjectKind: subjectKind as SubjectKind,
    subjectId,
    subjectRevision: subject.provenanceRef,
    subjectFingerprint: subject.fingerprint,
    contextId: context.contextId,
    objectId: object.objectId,
    objectRevisionFingerprint: object.fingerprint,
    subjectRecordStatus: subject.recordStatus,
    subjectCurrentness: subject.currentness,
  };
}

function samePin(left: D7R9SubjectPin, right: D7R9SubjectPin): boolean {
  return left.subjectKind === right.subjectKind && left.subjectId === right.subjectId && left.subjectFingerprint === right.subjectFingerprint && left.subjectRevision === right.subjectRevision;
}

function remember(store: D7R9Store, subjectKind: D7R9History["subjectKind"], subjectId: string, action: D7R9History["action"], fingerprint: string): void {
  store.history.push({ historyId: `d7r9-history-${store.history.length + 1}`, subjectKind, subjectId, action, fingerprint, recordedAt: store.now() });
}

function governedFields(store: D7R9Store, actor: D7R9Actor, pin: D7R9SubjectPin, applicability: string, limitations: string, provenanceRef: string, sourceBasisRef: string, cited: Currentness, lifecycle: string, fingerprint: string, engineeringValidated: boolean): Omit<Governed, keyof D7R9SubjectPin> & D7R9SubjectPin {
  const stage = lifecycle.trim();
  if (!(D7_MATURITY_STATES as readonly string[]).includes(stage)) fail("LIFECYCLE_INVALID");
  if (!applicability.includes(pin.objectId)) fail("APPLICABILITY_NOT_OBJECT_SCOPED");
  return {
    ...pin,
    applicability,
    limitations,
    provenanceRef,
    sourceBasisRef,
    citedCurrentness: cited,
    currentness: cited,
    citedLifecycleStage: stage as Governed["citedLifecycleStage"],
    fingerprint,
    recordStatus: "CURRENT",
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
    engineeringValidated,
    conformant: false,
    approved: false,
    certified: false,
    regulatoryApproved: false,
    counterpartValidated: false,
    evidenceEqualsValidation: false,
    protectionDesignValidated: false,
    groundingDesignValidated: false,
    hazardousAreaValidated: false,
    suitabilityValidated: false,
    deleted: false,
    invalidated: false,
    createdAt: store.now(),
    createdBy: actor.actorId,
  };
}

function linkedReassessment(store: D7R9Store, actor: D7R9Actor, pin: D7R9SubjectPin, changeId: string | null | undefined, changeFingerprint: string | null | undefined, reassessmentId: string | null | undefined, reassessmentFingerprint: string | null | undefined) {
  const change = store.r8.r7.changes.find((row) => row.changeId === explicit(changeId ?? "", "CHANGE_REFERENCE_REQUIRED") && sameScope(row, actor));
  if (!change || change.fingerprint !== explicit(changeFingerprint ?? "", "CHANGE_REVISION_REQUIRED") || change.recordStatus !== "CURRENT") fail("CHANGE_REVISION_MISMATCH");
  if (!change.dependencies.some((link) => link.targetId === pin.subjectId && link.targetFingerprint === pin.subjectFingerprint)) fail("CHANGE_SUBJECT_NOT_EXPLICIT");
  const reassessment = store.r8.r7.reassessments.find((row) => row.reassessmentId === explicit(reassessmentId ?? "", "REASSESSMENT_REFERENCE_REQUIRED") && sameScope(row, actor));
  if (!reassessment || reassessment.fingerprint !== explicit(reassessmentFingerprint ?? "", "REASSESSMENT_REVISION_REQUIRED") || reassessment.changeId !== change.changeId || reassessment.targetId !== pin.subjectId || reassessment.targetFingerprint !== pin.subjectFingerprint) {
    fail("REASSESSMENT_REVISION_MISMATCH");
  }
  return { changeId: change.changeId, changeFingerprint: change.fingerprint, reassessmentId: reassessment.reassessmentId, reassessmentFingerprint: reassessment.fingerprint, engineeringValidated: reassessment.engineeringValidated, state: reassessment.state };
}

function basisKind(kind: string): string {
  if (kind === "R2_SYSTEM") return "SYSTEM";
  if (kind === "R3_LOAD") return "LOAD";
  if (kind === "R4_FEEDER") return "FEEDER";
  if (kind === "R5_EVIDENCE") return "EVIDENCE";
  if (kind === "R6_DEVICE") return "PROTECTION";
  if (kind === "R6_SETTING") return "SETTING";
  if (kind === "R6_GROUNDING") return "GROUNDING";
  if (kind === "R6_HAZARDOUS_AREA") return "HAZARDOUS_AREA";
  if (kind === "R6_SUITABILITY") return "SUITABILITY";
  if (kind === "R7_REQUIREMENT") return "REQUIREMENT";
  if (kind === "R7_DECISION") return "DECISION";
  if (kind === "R8_HANDOFF") return "HANDOFF";
  return "REASSESSMENT";
}

function resolveBasis(store: D7R9Store, items: readonly { kind: string; id: string; fingerprint: string }[] | undefined, requireCurrent: boolean, validationState: string): Basis[] {
  const resolved: Basis[] = [];
  for (const item of items ?? []) {
    const kind = explicit(item.kind, "BASIS_KIND_REQUIRED");
    if (!(D7_R9_BASIS_KINDS as readonly string[]).includes(kind)) fail("BASIS_KIND_INVALID");
    if (validationState === "VALIDATED" && kind === "R7_REASSESSMENT") fail("REASSESSMENT_NOT_VALIDATION");
    const id = explicit(item.id, "BASIS_REFERENCE_REQUIRED");
    const fingerprint = explicit(item.fingerprint, "BASIS_REVISION_REQUIRED");
    const mapped = basisKind(kind);
    const row = mapped === "REASSESSMENT"
      ? store.r8.r7.reassessments.find((entry) => entry.reassessmentId === id && entry.fingerprint === fingerprint)
      : locate(store.r8, mapped, id);
    if (!row || row.fingerprint !== fingerprint) fail("BASIS_REVISION_MISMATCH");
    if (requireCurrent && row.recordStatus !== "CURRENT") fail("BASIS_NOT_CURRENT");
    resolved.push({ kind: kind as Basis["kind"], id, fingerprint: row.fingerprint });
  }
  return resolved;
}

export function createD7R9Store(r8: D7R8Store, now: () => string = () => r8.now()): D7R9Store {
  if (R8_RUNTIME_COUNT !== 8) fail("R8_RUNTIME_COUNT_UNEXPECTED");
  const r7 = r8.r7;
  if (r7.r6.r5.r1 !== r7.r1 || r7.r6.r5.r4.r1 !== r7.r1 || r7.r6.r5.r4.r2.r1 !== r7.r1 || r7.r6.r5.r4.r3.r1 !== r7.r1 || r7.r6.r5.r4.r3.r2 !== r7.r6.r5.r4.r2) fail("R1_R8_STORE_MISMATCH");
  return { r8, now, requests: [], findings: [], dispositions: [], completions: [], validations: [], history: [] };
}

export function currentElectricalValidations(store: D7R9Store, actor: D7R9Actor): D7R9ValidationRecord[] {
  return store.validations.filter((row) => sameScope(row, actor) && row.recordStatus === "CURRENT" && row.currentness === "CURRENT" && row.validationState === "VALIDATED");
}

export function recordElectricalReviewRequest(store: D7R9Store, actor: D7R9Actor, input: Prohibited & Chain & {
  reviewRequestId: string; reviewType: string; reviewScope: string; requestedReviewerAuthority: string; applicability: string; limitations: string; provenanceRef: string; sourceBasisRef: string; citedCurrentness: string; citedLifecycleStage: string; assertedFingerprint?: string | null; predecessorReviewRequestId?: string | null;
}): D7R9ReviewRequestRecord {
  assertRecorder(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const cited = input.citedCurrentness.trim();
  if (!(D7_CURRENTNESS_STATES as readonly string[]).includes(cited)) fail("CURRENTNESS_INVALID");
  const before = seal(store);
  const pin = bind(store, actor, input, cited as Currentness);
  const reviewType = explicit(input.reviewType, "REVIEW_TYPE_REQUIRED");
  if (!(D7_R9_REVIEW_TYPES as readonly string[]).includes(reviewType)) fail("REVIEW_TYPE_INVALID");
  if (reviewType === "INTERFACE_HANDOFF_REVIEW" && pin.subjectKind !== "HANDOFF") fail("HANDOFF_SUBJECT_REQUIRED");
  if (explicit(input.requestedReviewerAuthority, "REVIEWER_AUTHORITY_REQUIRED") !== "REVIEWER") fail("REVIEWER_AUTHORITY_REQUIRED");
  const reviewScope = explicit(input.reviewScope, "REVIEW_SCOPE_REQUIRED");
  const applicability = explicit(input.applicability, "APPLICABILITY_REQUIRED");
  const limitations = explicit(input.limitations, "LIMITATIONS_REQUIRED");
  const provenanceRef = explicit(input.provenanceRef, "PROVENANCE_REQUIRED");
  const sourceBasisRef = explicit(input.sourceBasisRef, "SOURCE_BASIS_REQUIRED");
  const reviewRequestId = explicit(input.reviewRequestId, "REVIEW_REQUEST_REQUIRED");
  const predecessor = input.predecessorReviewRequestId ? store.requests.find((row) => row.reviewRequestId === explicit(input.predecessorReviewRequestId ?? "", "REVIEW_REQUEST_REQUIRED")) : null;
  if (input.predecessorReviewRequestId && (!predecessor || predecessor.tenantId !== actor.tenantId)) fail("REVIEW_REQUEST_NOT_FOUND");
  if (predecessor && !samePin(predecessor, pin)) fail("REVIEW_TRANSFER_REJECTED");
  if (predecessor && predecessor.recordStatus !== "CURRENT") fail("PREDECESSOR_NOT_CURRENT");
  const fingerprint = fingerprintCanonical({ reviewRequestId, ...pin, reviewType, reviewScope, requestedReviewerAuthority: "REVIEWER", applicability, limitations, cited, provenanceRef, sourceBasisRef, predecessorReviewRequestId: predecessor?.reviewRequestId ?? null, discipline: D7_DISCIPLINE });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.requests.find((row) => row.reviewRequestId === reviewRequestId);
  if (existing) return existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId ? existing : fail("REVIEW_REQUEST_ALREADY_RECORDED");
  const signature = `${pin.subjectKind}|${pin.subjectId}|${pin.subjectFingerprint}|${reviewType}`;
  if (store.requests.some((row) => row.recordStatus === "CURRENT" && row.reviewRequestId !== predecessor?.reviewRequestId && `${row.subjectKind}|${row.subjectId}|${row.subjectFingerprint}|${row.reviewType}` === signature)) fail("DUPLICATE_REVIEW_REQUEST_REJECTED");
  if (predecessor) {
    const index = store.requests.findIndex((row) => row.reviewRequestId === predecessor.reviewRequestId);
    store.requests[index] = Object.freeze({ ...predecessor, recordStatus: "SUPERSEDED", currentness: "SUPERSEDED" });
    remember(store, "REQUEST", predecessor.reviewRequestId, "SUPERSEDED", predecessor.fingerprint);
  }
  const record: D7R9ReviewRequestRecord = {
    ...governedFields(store, actor, pin, applicability, limitations, provenanceRef, sourceBasisRef, cited as Currentness, input.citedLifecycleStage, fingerprint, false),
    reviewRequestId, reviewType: reviewType as D7R9ReviewRequestRecord["reviewType"], reviewScope, requestStatus: "REQUESTED", requestedReviewerAuthority: "REVIEWER", reviewCompleted: false,
    predecessorReviewRequestId: predecessor?.reviewRequestId ?? null, predecessorFingerprint: predecessor?.fingerprint ?? null,
  };
  store.requests.push(record);
  remember(store, "REQUEST", record.reviewRequestId, "CREATED", record.fingerprint);
  if (seal(store) !== before) fail("UPSTREAM_MUTATED");
  return record;
}

export function recordElectricalReviewFinding(store: D7R9Store, actor: D7R9Actor, input: Prohibited & Chain & {
  findingId: string; reviewRequestId: string; findingCategory: string; severity: string; findingText: string; disposition: string; applicability: string; limitations: string; provenanceRef: string; sourceBasisRef: string; citedCurrentness: string; citedLifecycleStage: string; assertedFingerprint?: string | null;
}): D7R9FindingRecord {
  assertReviewer(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const cited = input.citedCurrentness.trim();
  if (!(D7_CURRENTNESS_STATES as readonly string[]).includes(cited)) fail("CURRENTNESS_INVALID");
  const before = seal(store);
  const pin = bind(store, actor, input, cited as Currentness);
  const request = store.requests.find((row) => row.reviewRequestId === explicit(input.reviewRequestId, "REVIEW_REQUEST_REQUIRED") && row.recordStatus === "CURRENT" && row.tenantId === actor.tenantId);
  if (!request || !samePin(request, pin)) fail("REVIEW_REQUEST_NOT_FOUND");
  const findingCategory = explicit(input.findingCategory, "FINDING_CATEGORY_REQUIRED");
  if (FORBIDDEN.has(findingCategory) || !(D7_R9_FINDING_CATEGORIES as readonly string[]).includes(findingCategory)) fail("FINDING_CATEGORY_INVALID");
  const severity = explicit(input.severity, "FINDING_SEVERITY_REQUIRED");
  if (!(PRE_ISSUE_MATERIALITY as readonly string[]).includes(severity)) fail("FINDING_SEVERITY_INVALID");
  const disposition = explicit(input.disposition, "FINDING_DISPOSITION_REQUIRED");
  if (CLOSED.has(disposition.toLowerCase()) || FORBIDDEN.has(disposition) || !(D7_R9_FINDING_DISPOSITIONS as readonly string[]).includes(disposition)) fail("FINDING_DISPOSITION_INVALID");
  if (findingCategory === "REASSESSMENT_RECOMMENDATION" && disposition !== "REASSESSMENT_REQUESTED") fail("FINDING_DISPOSITION_INVALID");
  if (findingCategory !== "REASSESSMENT_RECOMMENDATION" && disposition === "REASSESSMENT_REQUESTED") fail("FINDING_DISPOSITION_INVALID");
  const findingText = explicit(input.findingText, "FINDING_TEXT_REQUIRED");
  const applicability = explicit(input.applicability, "APPLICABILITY_REQUIRED");
  const limitations = explicit(input.limitations, "LIMITATIONS_REQUIRED");
  const provenanceRef = explicit(input.provenanceRef, "PROVENANCE_REQUIRED");
  const sourceBasisRef = explicit(input.sourceBasisRef, "SOURCE_BASIS_REQUIRED");
  const findingId = explicit(input.findingId, "FINDING_ID_REQUIRED");
  const fingerprint = fingerprintCanonical({ findingId, reviewRequestId: request.reviewRequestId, ...pin, findingCategory, severity, findingText, disposition, applicability, limitations, cited, provenanceRef, sourceBasisRef, reviewerId: actor.actorId });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.findings.find((row) => row.findingId === findingId);
  if (existing) return existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId ? existing : fail("FINDING_ALREADY_RECORDED");
  const signature = `${request.reviewRequestId}|${pin.subjectFingerprint}|${findingCategory}|${findingText}`;
  if (store.findings.some((row) => `${row.reviewRequestId}|${row.subjectFingerprint}|${row.findingCategory}|${row.findingText}` === signature)) fail("DUPLICATE_FINDING_REJECTED");
  const record: D7R9FindingRecord = {
    ...governedFields(store, actor, pin, applicability, limitations, provenanceRef, sourceBasisRef, cited as Currentness, input.citedLifecycleStage, fingerprint, false),
    findingId, reviewRequestId: request.reviewRequestId, findingCategory: findingCategory as D7R9FindingRecord["findingCategory"], severity: severity as D7R9FindingRecord["severity"], findingText, disposition: disposition as D7R9FindingRecord["disposition"],
    reviewerId: actor.actorId, reviewerAuthority: "REVIEWER", engineeringInvalid: false,
  };
  store.findings.push(record);
  remember(store, "FINDING", record.findingId, "CREATED", record.fingerprint);
  if (seal(store) !== before || request.reviewCompleted !== false || request.engineeringValidated !== false) fail("UPSTREAM_MUTATED");
  return record;
}

export function recordElectricalFindingDisposition(store: D7R9Store, actor: D7R9Actor, input: Prohibited & Chain & {
  dispositionId: string; findingId: string; disposition: string; changeId?: string | null; changeFingerprint?: string | null; reassessmentId?: string | null; reassessmentFingerprint?: string | null; applicability: string; limitations: string; provenanceRef: string; sourceBasisRef: string; citedCurrentness: string; citedLifecycleStage: string; assertedFingerprint?: string | null;
}): D7R9DispositionRecord {
  assertReviewer(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const cited = input.citedCurrentness.trim();
  if (!(D7_CURRENTNESS_STATES as readonly string[]).includes(cited)) fail("CURRENTNESS_INVALID");
  const before = seal(store);
  const pin = bind(store, actor, input, cited as Currentness);
  const finding = store.findings.find((row) => row.findingId === explicit(input.findingId, "FINDING_ID_REQUIRED") && row.tenantId === actor.tenantId);
  if (!finding || !samePin(finding, pin)) fail("FINDING_NOT_FOUND");
  const originalFingerprint = finding.fingerprint;
  const disposition = explicit(input.disposition, "FINDING_DISPOSITION_REQUIRED");
  if (CLOSED.has(disposition.toLowerCase()) || FORBIDDEN.has(disposition) || !(D7_R9_FINDING_DISPOSITIONS as readonly string[]).includes(disposition)) fail("FINDING_DISPOSITION_INVALID");
  const linked = disposition === "REASSESSMENT_REQUESTED" ? linkedReassessment(store, actor, pin, input.changeId, input.changeFingerprint, input.reassessmentId, input.reassessmentFingerprint) : null;
  if (linked && (linked.engineeringValidated || linked.state === "REASSESSMENT_COMPLETED")) fail("REASSESSMENT_NOT_VALIDATION");
  if (!linked && (input.changeId || input.reassessmentId)) fail("CHANGE_REFERENCE_UNEXPECTED");
  const applicability = explicit(input.applicability, "APPLICABILITY_REQUIRED");
  const limitations = explicit(input.limitations, "LIMITATIONS_REQUIRED");
  const provenanceRef = explicit(input.provenanceRef, "PROVENANCE_REQUIRED");
  const sourceBasisRef = explicit(input.sourceBasisRef, "SOURCE_BASIS_REQUIRED");
  const dispositionId = explicit(input.dispositionId, "DISPOSITION_ID_REQUIRED");
  const fingerprint = fingerprintCanonical({ dispositionId, findingId: finding.findingId, ...pin, disposition, linked, applicability, limitations, cited, provenanceRef, sourceBasisRef, reviewerId: actor.actorId });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.dispositions.find((row) => row.dispositionId === dispositionId);
  if (existing) return existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId ? existing : fail("DISPOSITION_ALREADY_RECORDED");
  if (store.dispositions.some((row) => row.findingId === finding.findingId && row.disposition === disposition && row.subjectFingerprint === pin.subjectFingerprint)) fail("DUPLICATE_DISPOSITION_REJECTED");
  const record: D7R9DispositionRecord = {
    ...governedFields(store, actor, pin, applicability, limitations, provenanceRef, sourceBasisRef, cited as Currentness, input.citedLifecycleStage, fingerprint, false),
    dispositionId, findingId: finding.findingId, disposition: disposition as D7R9DispositionRecord["disposition"], reviewerId: actor.actorId, reviewerAuthority: "REVIEWER",
    changeId: linked?.changeId ?? null, changeFingerprint: linked?.changeFingerprint ?? null, reassessmentId: linked?.reassessmentId ?? null, reassessmentFingerprint: linked?.reassessmentFingerprint ?? null,
  };
  store.dispositions.push(record);
  remember(store, "DISPOSITION", record.dispositionId, "CREATED", record.fingerprint);
  if (finding.fingerprint !== originalFingerprint || finding.engineeringValidated !== false || finding.engineeringInvalid !== false) fail("SILENT_MUTATION_REJECTED");
  if (seal(store) !== before) fail("UPSTREAM_MUTATED");
  return record;
}

export function recordElectricalReviewCompletion(store: D7R9Store, actor: D7R9Actor, input: Prohibited & Chain & {
  completionId: string; reviewRequestId: string; applicability: string; limitations: string; provenanceRef: string; sourceBasisRef: string; citedCurrentness: string; citedLifecycleStage: string; assertedFingerprint?: string | null; predecessorCompletionId?: string | null;
}): D7R9CompletionRecord {
  assertReviewer(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const cited = input.citedCurrentness.trim();
  if (!(D7_CURRENTNESS_STATES as readonly string[]).includes(cited)) fail("CURRENTNESS_INVALID");
  const before = seal(store);
  const pin = bind(store, actor, input, cited as Currentness);
  const request = store.requests.find((row) => row.reviewRequestId === explicit(input.reviewRequestId, "REVIEW_REQUEST_REQUIRED") && row.recordStatus === "CURRENT" && row.tenantId === actor.tenantId);
  if (!request || !samePin(request, pin)) fail("REVIEW_REQUEST_NOT_FOUND");
  const applicability = explicit(input.applicability, "APPLICABILITY_REQUIRED");
  const limitations = explicit(input.limitations, "LIMITATIONS_REQUIRED");
  const provenanceRef = explicit(input.provenanceRef, "PROVENANCE_REQUIRED");
  const sourceBasisRef = explicit(input.sourceBasisRef, "SOURCE_BASIS_REQUIRED");
  const completionId = explicit(input.completionId, "COMPLETION_ID_REQUIRED");
  const predecessor = input.predecessorCompletionId ? store.completions.find((row) => row.completionId === explicit(input.predecessorCompletionId ?? "", "COMPLETION_ID_REQUIRED")) : null;
  if (input.predecessorCompletionId && (!predecessor || predecessor.tenantId !== actor.tenantId)) fail("COMPLETION_NOT_FOUND");
  if (predecessor && !samePin(predecessor, pin)) fail("REVIEW_TRANSFER_REJECTED");
  if (predecessor && predecessor.recordStatus !== "CURRENT") fail("PREDECESSOR_NOT_CURRENT");
  const fingerprint = fingerprintCanonical({ completionId, reviewRequestId: request.reviewRequestId, ...pin, applicability, limitations, cited, provenanceRef, sourceBasisRef, reviewerId: actor.actorId, predecessorCompletionId: predecessor?.completionId ?? null });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.completions.find((row) => row.completionId === completionId);
  if (existing) return existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId ? existing : fail("COMPLETION_ALREADY_RECORDED");
  const signature = `${request.reviewRequestId}|${pin.subjectFingerprint}`;
  if (store.completions.some((row) => row.recordStatus === "CURRENT" && row.completionId !== predecessor?.completionId && `${row.reviewRequestId}|${row.subjectFingerprint}` === signature)) fail("DUPLICATE_COMPLETION_REJECTED");
  if (predecessor) {
    const index = store.completions.findIndex((row) => row.completionId === predecessor.completionId);
    store.completions[index] = Object.freeze({ ...predecessor, recordStatus: "SUPERSEDED", currentness: "SUPERSEDED" });
    remember(store, "COMPLETION", predecessor.completionId, "SUPERSEDED", predecessor.fingerprint);
  }
  const record: D7R9CompletionRecord = {
    ...governedFields(store, actor, pin, applicability, limitations, provenanceRef, sourceBasisRef, cited as Currentness, input.citedLifecycleStage, fingerprint, false),
    completionId, reviewRequestId: request.reviewRequestId, reviewCompleted: true, reviewerId: actor.actorId, reviewerAuthority: "REVIEWER",
    predecessorCompletionId: predecessor?.completionId ?? null, predecessorFingerprint: predecessor?.fingerprint ?? null,
  };
  store.completions.push(record);
  remember(store, "COMPLETION", record.completionId, "CREATED", record.fingerprint);
  if (seal(store) !== before || request.reviewCompleted !== false || request.engineeringValidated !== false || request.requestStatus !== "REQUESTED") fail("UPSTREAM_MUTATED");
  return record;
}

export function recordElectricalValidationState(store: D7R9Store, actor: D7R9Actor, input: Prohibited & Chain & {
  validationId: string; validationScope: string; validationState: string; basis?: readonly { kind: string; id: string; fingerprint: string }[]; reviewRequestId?: string | null; changeId?: string | null; changeFingerprint?: string | null; reassessmentId?: string | null; reassessmentFingerprint?: string | null; applicability: string; limitations: string; provenanceRef: string; sourceBasisRef: string; citedCurrentness: string; citedLifecycleStage: string; assertedFingerprint?: string | null; predecessorValidationId?: string | null;
}): D7R9ValidationRecord {
  if ((blockedParty(actor.actorId) || actor.actorKind === "ai" || actor.authority === "ADMIN" || actor.authority === "ADMINISTRATOR" || actor.actorId === "ADMIN" || actor.actorId === "ADMINISTRATOR") && input.validationState === "VALIDATED") fail("AI_CANNOT_VALIDATE");
  assertValidator(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const cited = input.citedCurrentness.trim();
  if (!(D7_CURRENTNESS_STATES as readonly string[]).includes(cited)) fail("CURRENTNESS_INVALID");
  const before = seal(store);
  const pin = bind(store, actor, input, cited as Currentness);
  const validationState = explicit(input.validationState, "VALIDATION_STATE_REQUIRED");
  if (FORBIDDEN.has(validationState) || !(D7_R9_VALIDATION_STATES as readonly string[]).includes(validationState)) fail("VALIDATION_STATE_INVALID");
  if (validationState === "STALE" && cited !== "STALE") fail("CURRENTNESS_STATUS_MISMATCH");
  if (validationState === "REASSESSMENT_REQUIRED" && cited !== "REASSESSMENT_REQUIRED") fail("CURRENTNESS_STATUS_MISMATCH");
  if (validationState === "VALIDATED" && cited !== "CURRENT") fail("CURRENTNESS_STATUS_MISMATCH");
  if (validationState === "VALIDATED" && (pin.subjectCurrentness === "STALE" || pin.subjectCurrentness === "SUPERSEDED" || pin.subjectCurrentness === "REASSESSMENT_REQUIRED" || pin.subjectRecordStatus !== "CURRENT")) fail("STALE_NOT_VALIDATED");
  if (validationState === "VALIDATED" && store.r8.r7.reassessments.some((row) => row.recordStatus === "CURRENT" && row.targetId === pin.subjectId && row.targetFingerprint === pin.subjectFingerprint && row.state === "REASSESSMENT_REQUIRED")) fail("REASSESSMENT_NOT_VALIDATED");
  if (validationState === "VALIDATED" && (input.changeId || input.reassessmentId)) fail("REASSESSMENT_NOT_VALIDATION");
  const basis = resolveBasis(store, input.basis, validationState === "VALIDATED", validationState);
  if (validationState === "VALIDATED" && basis.length === 0) fail("BASIS_REQUIRED");
  const linked = validationState === "REASSESSMENT_REQUIRED" ? linkedReassessment(store, actor, pin, input.changeId, input.changeFingerprint, input.reassessmentId, input.reassessmentFingerprint) : null;
  if (linked && linked.engineeringValidated) fail("REASSESSMENT_NOT_VALIDATION");
  if (!linked && (input.changeId || input.reassessmentId)) fail("CHANGE_REFERENCE_UNEXPECTED");
  const validationScope = explicit(input.validationScope, "VALIDATION_SCOPE_REQUIRED");
  const applicability = explicit(input.applicability, "APPLICABILITY_REQUIRED");
  const limitations = explicit(input.limitations, "LIMITATIONS_REQUIRED");
  const provenanceRef = explicit(input.provenanceRef, "PROVENANCE_REQUIRED");
  const sourceBasisRef = explicit(input.sourceBasisRef, "SOURCE_BASIS_REQUIRED");
  const validationId = explicit(input.validationId, "VALIDATION_ID_REQUIRED");
  const reviewRequestId = input.reviewRequestId ? explicit(input.reviewRequestId, "REVIEW_REQUEST_REQUIRED") : null;
  if (reviewRequestId) {
    const request = store.requests.find((row) => row.reviewRequestId === reviewRequestId && row.recordStatus === "CURRENT");
    if (!request || !samePin(request, pin) || request.tenantId !== actor.tenantId) fail("REVIEW_REQUEST_NOT_FOUND");
    if (request.engineeringValidated) fail("REVIEW_REQUEST_NOT_VALIDATION");
  }
  const predecessor = input.predecessorValidationId ? store.validations.find((row) => row.validationId === explicit(input.predecessorValidationId ?? "", "VALIDATION_ID_REQUIRED")) : null;
  if (input.predecessorValidationId && (!predecessor || predecessor.tenantId !== actor.tenantId)) fail("VALIDATION_NOT_FOUND");
  if (predecessor && !samePin(predecessor, pin)) fail("VALIDATION_TRANSFER_REJECTED");
  if (predecessor && predecessor.recordStatus !== "CURRENT") fail("PREDECESSOR_NOT_CURRENT");
  const engineeringValidated = validationState === "VALIDATED";
  const fingerprint = fingerprintCanonical({ validationId, reviewRequestId, ...pin, validationScope, basis, validationState, linked, engineeringValidated, applicability, limitations, cited, provenanceRef, sourceBasisRef, validatorId: actor.actorId, validationAuthority: D7_R9_VALIDATION_AUTHORITY, predecessorValidationId: predecessor?.validationId ?? null });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.validations.find((row) => row.validationId === validationId);
  if (existing) return existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId ? existing : fail("VALIDATION_ALREADY_RECORDED");
  const signature = `${pin.subjectKind}|${pin.subjectId}|${pin.subjectFingerprint}|${validationScope}|${validationState}`;
  if (store.validations.some((row) => row.recordStatus === "CURRENT" && row.validationId !== predecessor?.validationId && `${row.subjectKind}|${row.subjectId}|${row.subjectFingerprint}|${row.validationScope}|${row.validationState}` === signature)) fail("DUPLICATE_VALIDATION_REJECTED");
  if (predecessor) {
    const index = store.validations.findIndex((row) => row.validationId === predecessor.validationId);
    store.validations[index] = Object.freeze({ ...predecessor, recordStatus: "SUPERSEDED", currentness: "SUPERSEDED" });
    remember(store, "VALIDATION", predecessor.validationId, "SUPERSEDED", predecessor.fingerprint);
  }
  const record: D7R9ValidationRecord = {
    ...governedFields(store, actor, pin, applicability, limitations, provenanceRef, sourceBasisRef, cited as Currentness, input.citedLifecycleStage, fingerprint, engineeringValidated),
    validationId, validationScope, validationState: validationState as D7R9ValidationRecord["validationState"], validationAuthority: D7_R9_VALIDATION_AUTHORITY, validatorId: actor.actorId, basis, reviewRequestId,
    changeId: linked?.changeId ?? null, changeFingerprint: linked?.changeFingerprint ?? null, reassessmentId: linked?.reassessmentId ?? null, reassessmentFingerprint: linked?.reassessmentFingerprint ?? null,
    predecessorValidationId: predecessor?.validationId ?? null, predecessorFingerprint: predecessor?.fingerprint ?? null,
  };
  store.validations.push(record);
  remember(store, "VALIDATION", record.validationId, "CREATED", record.fingerprint);
  if (seal(store) !== before) fail("UPSTREAM_MUTATED");
  if (record.validationState === "VALIDATED" && (record.currentness !== "CURRENT" || currentElectricalValidations(store, actor).some((row) => row.validationId === record.validationId && row.currentness !== "CURRENT"))) fail("STALE_EXPOSED_AS_CURRENT");
  if ((record.currentness === "STALE" || record.currentness === "REASSESSMENT_REQUIRED" || record.recordStatus === "SUPERSEDED") && currentElectricalValidations(store, actor).some((row) => row.validationId === record.validationId)) fail("STALE_EXPOSED_AS_CURRENT");
  return record;
}

export function repointElectricalReview(): never {
  return fail("AUTO_REPOINT_REJECTED");
}
export function transferElectricalValidation(): never {
  return fail("VALIDATION_TRANSFER_REJECTED");
}
export function automaticallyValidateElectricalEngineering(): never {
  return fail("AUTOMATIC_VALIDATION_REJECTED");
}
export function closeElectricalFindingAsValidated(): never {
  return fail("FINDING_CLOSURE_NOT_VALIDATION");
}
export function closeElectricalReassessmentAsValidated(): never {
  return fail("REASSESSMENT_NOT_VALIDATION");
}
export function validateElectricalCounterpart(): never {
  return fail("COUNTERPART_VALIDATION_REJECTED");
}
export function approveElectricalFromValidation(): never {
  return fail("APPROVAL_NOT_IN_R9");
}
export function certifyElectricalFromValidation(): never {
  return fail("CERTIFICATION_NOT_IN_R9");
}
export function determineElectricalConformanceFromValidation(): never {
  return fail("CONFORMANCE_NOT_IN_R9");
}
