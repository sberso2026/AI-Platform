/**
 * EOS-D8-R9 Instrumentation and Control review and validation governance.
 * One bounded runtime on exact R1-R8 revisions. Canonical review and validation governance only.
 * Review completion, finding closure, and handoff review are not engineering validation.
 * Engineering validation is not conformance, approval, certification, regulatory approval, or counterpart validation.
 */
import {
  CURRENT_D8_RECORD_EQUALS_VALIDATED,
  D8_CANONICAL_MILESTONE_COUNT,
  D8_CURRENTNESS_STATES,
  D8_IMPLEMENTATION_PHASE_TYPES,
  D8_IMPLEMENTATION_PHASES,
  D8_MATURITY_STATES,
  STALE_D8_RECORD_EQUALS_INVALID,
  SUPERSEDED_D8_RECORD_EQUALS_INVALID,
} from "@rtb/types";
import {
  D2_R9_FINDING_DISPOSITIONS,
  D2_R9_REQUEST_STATUSES,
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
  D8_ACTUATOR_SIZING_RUNTIME_COUNT,
  D8_APPROVAL_RUNTIME_COUNT,
  D8_AUTOMATIC_CONTROL_LOGIC_GENERATION_RUNTIME_COUNT,
  D8_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT,
  D8_AUTOMATIC_IAC_DESIGN_RUNTIME_COUNT,
  D8_AUTOMATIC_IAC_REDESIGN_RUNTIME_COUNT,
  D8_CERTIFICATION_RUNTIME_COUNT,
  D8_CONFORMANCE_DETERMINATION_RUNTIME_COUNT,
  D8_CONTROL_LOGIC_DESIGN_RUNTIME_COUNT,
  D8_CONTROL_LOOP_TUNING_RUNTIME_COUNT,
  D8_CONTROL_SYSTEM_ARCHITECTURE_RUNTIME_READY,
  D8_CONTROL_VALVE_SIZING_RUNTIME_COUNT,
  D8_CROSS_DISCIPLINE_CONFLICT_DETECTION_RUNTIME_COUNT,
  D8_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT,
  D8_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT,
  D8_CROSS_DISCIPLINE_RECOMMENDATION_RUNTIME_COUNT,
  D8_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT,
  D8_D9_RUNTIME_INTEGRATION_COUNT,
  D8_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
  D8_DISCIPLINE_INTERFACE_RUNTIME_READY,
  D8_EQUALS_D1_STRUCTURAL_AUTHORITY,
  D8_EQUALS_D2_CIVIL_AUTHORITY,
  D8_EQUALS_D3_GEOTECHNICAL_AUTHORITY,
  D8_EQUALS_D4_MECHANICAL_AUTHORITY,
  D8_EQUALS_D5_PIPING_AUTHORITY,
  D8_EQUALS_D6_PROCESS_AUTHORITY,
  D8_EQUALS_D7_ELECTRICAL_AUTHORITY,
  D8_EXPLICIT_LINEAGE_REQUIRED,
  D8_FUNCTIONAL_SAFETY_VALIDATION_RUNTIME_COUNT,
  D8_INFERRED_LINEAGE_ALLOWED,
  D8_INSTRUMENT_DEVICE_CONTEXT_RUNTIME_READY,
  D8_INSTRUMENT_SELECTION_RUNTIME_COUNT,
  D8_INSTRUMENT_SIZING_RUNTIME_COUNT,
  D8_INSTRUMENTATION_CONTROL_IDENTITY_RUNTIME_READY,
  D8_PROCESS_MEASUREMENT_TAG_RUNTIME_READY,
  D8_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY,
  D8_REUSES_CANONICAL_CURRENTNESS,
  D8_REUSES_CANONICAL_DIGITAL_THREAD,
  D8_REUSES_CANONICAL_FINGERPRINT,
  D8_RUNTIME_COUNT as R8_RUNTIME_COUNT,
  D8_SAFETY_INTERLOCK_SHUTDOWN_RUNTIME_READY,
  D8_SIGNAL_IO_CONTROL_LOOP_RUNTIME_READY,
  D8_SIL_CALCULATION_RUNTIME_COUNT,
  D8_SIL_VERIFICATION_RUNTIME_COUNT,
  D9_RUNTIME_COUNT,
  D9_RUNTIME_STARTED,
  ADMIN_EQUALS_D8_IAC_ENGINEERING_AUTHORITY,
  AI_EQUALS_D8_IAC_ENGINEERING_AUTHORITY,
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
  D7_REOPENED,
  D7_STATUS,
  D7_TRACK_COMPLETE,
  DATABASE_SCHEMA_CHANGED,
  NEW_DEPENDENCY_ADDED,
  PARALLEL_D8_CURRENTNESS_ENGINE_CREATED,
  PARALLEL_D8_DIGITAL_THREAD_CREATED,
  SECOND_D8_FINGERPRINT_ALGORITHM_CREATED,
  type D8R8Store,
} from "./discipline-interfaces-handoffs";
import { D8_CONTEXT_AUTHORITY, D8_DISCIPLINE, type D8R1Actor } from "./identity-foundation";

export const D8_R9_STATUS = "REVIEW_AND_VALIDATION_GOVERNANCE_IMPLEMENTED" as const;
export const D8_R9_MATURITY = D8_R9_STATUS;
export const D8_R9_MATURITY_STATE = D8_R9_STATUS;
export const D8_R9_CLOSEOUT_PATH = "docs/architecture/engineering-os/EOS_D8_R9_REVIEW_AND_VALIDATION_GOVERNANCE_CLOSEOUT.md" as const;
export const D8_RUNTIME_STARTED = true as const;
export const D8_RUNTIME_COUNT = 9 as const;
export const D8_R8_RUNTIME_COUNT = R8_RUNTIME_COUNT;
export const D8_R1_R8_EXACT_REVISIONS_REUSED = true as const;
export const EXACT_D8_R9_SUBJECT_REVISION_REQUIRED = true as const;
export const FLOATING_D8_R9_SUBJECT_REFERENCE_ALLOWED = false as const;
export const D8_R9_SUBJECT_AUTO_REPOINTED = D1K_R3_SILENT_SOURCE_REPOINTING_ALLOWED;
export const D8_REVIEW_VALIDATION_RUNTIME_IMPLEMENTED = true as const;
export const D8_REVIEW_VALIDATION_RUNTIME_COUNT = 1 as const;
export const D8_REVIEW_VALIDATION_RUNTIME_READY = true as const;
export const D8_REUSES_CANONICAL_REVIEW_GOVERNANCE = true as const;
export const PARALLEL_D8_REVIEW_ENGINE_CREATED = false as const;
export const D8_REUSES_CANONICAL_VALIDATION_GOVERNANCE = true as const;
export const PARALLEL_D8_VALIDATION_ENGINE_CREATED = false as const;
export const D8_REVIEW_REQUEST_CONTEXT_IMPLEMENTED = true as const;
export const REVIEW_REQUESTED_EQUALS_REVIEW_COMPLETED = REVIEW_REQUEST_PRESENT_EQUALS_REVIEW_COMPLETED;
export const REVIEW_REQUESTED_EQUALS_ENGINEERING_VALIDATED = REVIEW_REQUEST_PRESENT_EQUALS_ENGINEERING_VALIDATED;
export const D8_REVIEWER_ASSIGNMENT_IMPLEMENTED = true as const;
export const D8_REVIEWER_ASSIGNMENT_EXPLICIT = true as const;
export const REVIEW_ASSIGNED_EQUALS_REVIEW_COMPLETED = false as const;
export const REVIEW_ASSIGNED_EQUALS_ENGINEERING_VALIDATED = false as const;
export const D8_REVIEWER_AUTHORITY_REQUIRED = true as const;
export const D8_REVIEWER_AUTHORITY_TRACEABLE = true as const;
export const AI_EQUALS_D8_REVIEWER_AUTHORITY = false as const;
export const ADMIN_EQUALS_D8_ENGINEERING_REVIEW_AUTHORITY = false as const;
export const EXACT_D8_REVIEW_SUBJECT_REVISION_REQUIRED = true as const;
export const FLOATING_D8_REVIEW_SUBJECT_REVISION_ALLOWED = false as const;
export const D8_REVIEW_SCOPE_EXPLICIT = true as const;
export const D8_REVIEW_SCOPE_LIMITATIONS_EXPLICIT = true as const;
export const D8_REVIEW_COMPLETION_CONTEXT_IMPLEMENTED = true as const;
export const REVIEW_COMPLETED_EQUALS_APPROVED = PRE_ISSUE_AI_BOUNDARY.mayApproveDesign;
export const REVIEW_COMPLETED_EQUALS_CONFORMANT = PRE_ISSUE_AI_BOUNDARY.mayDeclareCodeCompliance;
export const REVIEW_COMPLETED_EQUALS_CERTIFIED = PRE_ISSUE_AI_BOUNDARY.mayCertifyCalculation;
export const D8_REVIEW_FINDING_CONTEXT_IMPLEMENTED = true as const;
export const D8_FINDING_CLOSURE_GOVERNANCE_IMPLEMENTED = true as const;
export const D8_FINDING_CLOSURE_AUTHORITY_REQUIRED = true as const;
export const FINDING_CLOSED_EQUALS_ENGINEERING_VALIDATED = false as const;
export const FINDING_CLOSED_EQUALS_APPROVED = false as const;
export const FINDING_CLOSED_EQUALS_CONFORMANT = false as const;
export const FINDING_ACCEPTED_EQUALS_APPROVED = PRE_ISSUE_AI_BOUNDARY.mayApproveDesign;
export const FINDING_ACCEPTED_EQUALS_CONFORMANT = PRE_ISSUE_AI_BOUNDARY.mayDeclareCodeCompliance;
export const FINDING_ACCEPTED_EQUALS_CERTIFIED = PRE_ISSUE_AI_BOUNDARY.mayCertifyCalculation;
export const D8_VALIDATION_EVIDENCE_CONTEXT_IMPLEMENTED = true as const;
export const D8_VALIDATION_EVIDENCE_REQUIRED_FOR_VALIDATED_STATE = true as const;
export const D8_ENGINEERING_VALIDATION_AUTHORITY_REQUIRED = true as const;
export const D8_ENGINEERING_VALIDATION_AUTHORITY_TRACEABLE = true as const;
export const AI_EQUALS_D8_ENGINEERING_VALIDATION_AUTHORITY = false as const;
export const ADMIN_EQUALS_D8_ENGINEERING_VALIDATION_AUTHORITY = false as const;
export const D8_ENGINEERING_VALIDATED_STATE_SUPPORTED = true as const;
export const ENGINEERING_VALIDATED_EQUALS_CONFORMANT = VALIDATED_EQUALS_CONFORMANT;
export const ENGINEERING_VALIDATED_EQUALS_APPROVED = VALIDATED_EQUALS_ENGINEERING_APPROVED;
export const ENGINEERING_VALIDATED_EQUALS_CERTIFIED = VALIDATED_EQUALS_CERTIFIED;
export const ENGINEERING_VALIDATED_EQUALS_REGULATORY_APPROVED = false as const;
export const D8_VALIDATED_STATE_EXACT_REVISION_BOUND = true as const;
export const D8_VALIDATED_STATE_AUTO_PROPAGATES_TO_NEW_REVISION = false as const;
export const D8_R9_R7_CHANGE_INTEGRATION_IMPLEMENTED = true as const;
export const D8_R9_R7_REASSESSMENT_INTEGRATION_IMPLEMENTED = true as const;
export const NEW_REVISION_INHERITS_PRIOR_VALIDATION_AUTOMATICALLY = false as const;
export const REASSESSMENT_REQUIRED_EQUALS_VALIDATION_FAILED = false as const;
export const REASSESSMENT_COMPLETED_EQUALS_ENGINEERING_VALIDATED = false as const;
export const D8_R9_CAN_REVIEW_R8_HANDOFF = true as const;
export const EXACT_D8_R8_HANDOFF_REVISION_REQUIRED_FOR_REVIEW = true as const;
export const HANDOFF_REVIEW_COMPLETED_EQUALS_COUNTERPART_VALIDATED = false as const;
export const HANDOFF_FINDING_CLOSED_EQUALS_COUNTERPART_VALIDATED = false as const;
export const D8_HANDOFF_VALIDATED_EQUALS_COUNTERPART_ENGINEERING_VALIDATED = false as const;
export const D8_HANDOFF_VALIDATED_EQUALS_COUNTERPART_APPROVED = false as const;
export const D8_HANDOFF_VALIDATED_EQUALS_COUNTERPART_CONFORMANT = false as const;
export const D8_R9_AUTO_VALIDATES_D1_STRUCTURAL = false as const;
export const D8_R9_AUTO_VALIDATES_D2_CIVIL = false as const;
export const D8_R9_AUTO_VALIDATES_D3_GEOTECHNICAL = false as const;
export const D8_R9_AUTO_VALIDATES_D4_MECHANICAL = false as const;
export const D8_R9_AUTO_VALIDATES_D5_PIPING = false as const;
export const D8_R9_AUTO_VALIDATES_D6_PROCESS = false as const;
export const D8_R9_AUTO_VALIDATES_D7_ELECTRICAL = false as const;
export const D8_R9_AUTO_MUTATES_D1_STRUCTURAL = false as const;
export const D8_R9_AUTO_MUTATES_D2_CIVIL = false as const;
export const D8_R9_AUTO_MUTATES_D3_GEOTECHNICAL = false as const;
export const D8_R9_AUTO_MUTATES_D4_MECHANICAL = false as const;
export const D8_R9_AUTO_MUTATES_D5_PIPING = false as const;
export const D8_R9_AUTO_MUTATES_D6_PROCESS = false as const;
export const D8_R9_AUTO_MUTATES_D7_ELECTRICAL = false as const;
export const D8_R9_AUTO_MUTATES_R1_IDENTITY = false as const;
export const D8_R9_AUTO_MUTATES_R2_MEASUREMENT_TAG_CONTEXT = false as const;
export const D8_R9_AUTO_MUTATES_R3_INSTRUMENT_DEVICE_CONTEXT = false as const;
export const D8_R9_AUTO_MUTATES_R4_SIGNAL_IO_LOOP_CONTEXT = false as const;
export const D8_R9_AUTO_MUTATES_R5_CONTROL_SYSTEM_CONTEXT = false as const;
export const D8_R9_AUTO_MUTATES_R6_SAFETY_CONTEXT = false as const;
export const D8_R9_AUTO_MUTATES_R7_CHANGE_GOVERNANCE = false as const;
export const D8_R9_AUTO_MUTATES_R8_INTERFACE_HANDOFF = false as const;
export const D8_R9_PERFORMS_AUTOMATIC_ENGINEERING_VALIDATION = false as const;
export const AI_CAN_MARK_D8_ENGINEERING_VALIDATED = false as const;
export const AI_CAN_CLOSE_REVIEW_AS_ENGINEERING_VALIDATED = false as const;
export const AI_CAN_PROMOTE_FINDING_CLOSURE_TO_VALIDATION = false as const;
export const ADMIN_CAN_MARK_D8_ENGINEERING_VALIDATED_WITHOUT_AUTHORITY = false as const;
export const ADMIN_CAN_PROMOTE_REVIEW_COMPLETION_TO_VALIDATION = false as const;
export const D8_ENGINEERING_VALIDATED_EQUALS_REGULATORY_APPROVED = false as const;
export const D8_REVIEW_COMPLETED_EQUALS_REGULATORY_APPROVED = false as const;
export const STANDARD_REFERENCE_EQUALS_CONFORMANCE = false as const;
export const JURISDICTION_REFERENCE_EQUALS_REGULATORY_APPROVAL = false as const;
export const FUNCTIONAL_SAFETY_STANDARD_REFERENCE_EQUALS_COMPLIANCE = false as const;
export const D8_R9_CAN_REVIEW_R6_SAFETY_CONTEXT = true as const;
export const D8_R9_PERFORMS_FUNCTIONAL_SAFETY_VALIDATION = false as const;
export const REVIEWED_SIF_CONTEXT_EQUALS_SIF_VALIDATED = false as const;
export const REVIEWED_SIL_REQUIREMENT_EQUALS_SIL_VERIFIED = false as const;
export const D8_R9_PERFORMS_SIL_CALCULATION = false as const;
export const D8_R9_PERFORMS_SIL_VERIFICATION = false as const;
export const D8_R9_PERFORMS_PFD_CALCULATION = false as const;
export const D8_R9_PERFORMS_PFH_CALCULATION = false as const;
export const D8_R9_REVIEW_AUTO_REDESIGNS_IAC = false as const;
export const D8_R9_REVIEW_AUTO_RECONFIGURES_CONTROL_SYSTEM = false as const;
export const D8_R9_REVIEW_AUTO_RETUNES_CONTROL_LOOP = false as const;
export const D8_R9_REVIEW_AUTO_REWRITES_LOGIC = false as const;
export const REVIEW_FINDING_EQUALS_DESIGN_CHANGE = false as const;
export const REVIEW_FINDING_EQUALS_ENGINEERING_DECISION = false as const;
export const FINDING_DISPOSITION_EQUALS_ENGINEERING_DECISION = false as const;
export const D8_R9_CAN_REFERENCE_R7_ENGINEERING_DECISION = true as const;
export const EXACT_D8_R7_DECISION_REVISION_REQUIRED_WHEN_REFERENCED = true as const;
export const D8_R9_SOURCE_BASIS_REQUIRED = true as const;
export const D8_R9_SOURCE_BASIS_TRACEABLE = true as const;
export const D8_R9_EVIDENCE_PROVENANCE_REQUIRED = true as const;
export const D8_R9_EVIDENCE_PROVENANCE_PRESERVED = true as const;
export const D8_R9_APPLICABILITY_EXPLICIT = true as const;
export const D8_R9_LIMITATIONS_EXPLICIT = true as const;
export const D8_R9_AUTO_PROPAGATED_OUTSIDE_APPLICABILITY = false as const;
export const TENANT_WORKSPACE_PROJECT_D8_R9_SCOPE_ENFORCED = true as const;
export const CROSS_TENANT_D8_R9_ACCESS_ALLOWED = false as const;
export const D8_REVIEW_CURRENTNESS_INTEGRATED = true as const;
export const D8_VALIDATION_CURRENTNESS_INTEGRATED = true as const;
export const CURRENT_REVIEW_EQUALS_ENGINEERING_VALIDATED = false as const;
export const STALE_REVIEW_EQUALS_INVALID = false as const;
export const D8_R9_HISTORY_PRESERVED = true as const;
export const D8_R9_HISTORICAL_REFERENCE_AUTO_REPOINTED = D1K_R3_SILENT_SOURCE_REPOINTING_ALLOWED;
export const SILENT_D8_R9_MUTATION_ALLOWED = false as const;
export const AI_CAN_COMPLETE_D8_ENGINEERING_REVIEW_AS_HUMAN = false as const;
export const AI_CAN_PROMOTE_VALIDATION_TO_APPROVAL = false as const;
export const ADMIN_CAN_PROMOTE_D8_VALIDATION_TO_APPROVAL = false as const;
export const D8_R9_DUPLICATE_GOVERNANCE_IMPLEMENTED = true as const;
export const D8_R9_REPLAY_PROTECTION_IMPLEMENTED = true as const;
export const D8_R9_SPOOFING_PROTECTION_IMPLEMENTED = true as const;
export const UNAUTHORIZED_D8_R10_R12_RUNTIME_PROMOTION = false as const;
export const D8_R9_REQUEST_STATUSES = D2_R9_REQUEST_STATUSES;
export const D8_R9_FINDING_DISPOSITIONS = D2_R9_FINDING_DISPOSITIONS;
export const D8_R9_VALIDATION_STATES = D2_R9_VALIDATION_STATES;
export const D8_R9_FINDING_CATEGORIES = D3_R9_FINDING_CATEGORIES;
export const D8_R9_REVIEW_AI_BOUNDARY_REUSED = PRE_ISSUE_AI_BOUNDARY;
export const D8_R9_SUBJECT_KINDS = ["OBJECT", "MEASUREMENT", "DEVICE", "SIGNAL", "SYSTEM", "SAFETY", "REQUIREMENT", "DECISION", "CHANGE", "HANDOFF"] as const;
export const D8_R9_REVIEW_TYPES = ["IAC_SUBJECT_REVIEW", "INTERFACE_HANDOFF_REVIEW", "SAFETY_CONTEXT_REVIEW"] as const;
export const D8_R9_BASIS_KINDS = ["R1_OBJECT", "R2_MEASUREMENT", "R3_DEVICE", "R4_SIGNAL", "R5_SYSTEM", "R6_SAFETY", "R7_REQUIREMENT", "R7_DECISION", "R7_REASSESSMENT", "R8_HANDOFF"] as const;
export const D8_R9_VALIDATION_AUTHORITY = "IAC_VALIDATION_AUTHORITY" as const;
export const D8_R9_REVIEWER_AUTHORITY = "REVIEWER" as const;
export const D8_R10_CANONICAL_PHASE = D8_IMPLEMENTATION_PHASES[9];
export const D8_R10_PHASE_TYPE = D8_IMPLEMENTATION_PHASE_TYPES[9];
export const D8_R10_CANONICAL_SCOPE = "Implement the dedicated D8 currentness and digital-thread runtime using exact R1-R9 revisions and canonical EOS currentness, thread, and fingerprint governance. Support exact revision currentness, current, stale, and superseded state, explicit lineage, canonical fingerprint verification, exact historical references, explicit dependency and currentness relationships, and review, validation, handoff, and change currentness. Preserve current distinct from validated, stale and superseded distinct from invalid, current review distinct from engineering validated, current handoff distinct from counterpart validated, a digital-thread relationship distinct from engineering authority, lineage distinct from validation, and a fingerprint match distinct from approval. Do not introduce a parallel currentness engine, parallel digital thread, second fingerprint algorithm, inferred lineage, silent historical repointing, automatic validation, D9 reasoning, or cross-discipline recommendations." as const;
export const D8_R10_STARTED = false as const;
export const D8_R9_READY_FOR_NEXT_PHASE = true as const;
export const D8_R9_NEXT_PHASE = D8_R10_CANONICAL_PHASE;
export const D8_R9_NEXT_PHASE_TYPE = D8_R10_PHASE_TYPE;
export const D8_R9_CANONICAL_NEXT_PHASE = D8_R10_CANONICAL_PHASE;
export const D8_R9_CANONICAL_NEXT_PHASE_SCOPE = D8_R10_CANONICAL_SCOPE;
export const D8_R9_BLOCKER = "NONE" as const;
export const D8_R9_MACHINE_READABLE_ROADMAP_UPDATED = true as const;

export {
  REVIEW_COMPLETED_EQUALS_ENGINEERING_VALIDATED,
  CURRENT_D8_RECORD_EQUALS_VALIDATED,
  STALE_D8_RECORD_EQUALS_INVALID,
  SUPERSEDED_D8_RECORD_EQUALS_INVALID,
  D8_CANONICAL_MILESTONE_COUNT,
  D8_DISCIPLINE_INTERFACE_RUNTIME_READY,
  D8_INSTRUMENTATION_CONTROL_IDENTITY_RUNTIME_READY,
  D8_PROCESS_MEASUREMENT_TAG_RUNTIME_READY,
  D8_INSTRUMENT_DEVICE_CONTEXT_RUNTIME_READY,
  D8_SIGNAL_IO_CONTROL_LOOP_RUNTIME_READY,
  D8_CONTROL_SYSTEM_ARCHITECTURE_RUNTIME_READY,
  D8_SAFETY_INTERLOCK_SHUTDOWN_RUNTIME_READY,
  D8_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY,
  D8_INSTRUMENT_SIZING_RUNTIME_COUNT,
  D8_INSTRUMENT_SELECTION_RUNTIME_COUNT,
  D8_CONTROL_VALVE_SIZING_RUNTIME_COUNT,
  D8_ACTUATOR_SIZING_RUNTIME_COUNT,
  D8_CONTROL_LOOP_TUNING_RUNTIME_COUNT,
  D8_CONTROL_LOGIC_DESIGN_RUNTIME_COUNT,
  D8_AUTOMATIC_CONTROL_LOGIC_GENERATION_RUNTIME_COUNT,
  D8_SIL_CALCULATION_RUNTIME_COUNT,
  D8_SIL_VERIFICATION_RUNTIME_COUNT,
  D8_FUNCTIONAL_SAFETY_VALIDATION_RUNTIME_COUNT,
  D8_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT,
  D8_CONFORMANCE_DETERMINATION_RUNTIME_COUNT,
  D8_APPROVAL_RUNTIME_COUNT,
  D8_CERTIFICATION_RUNTIME_COUNT,
  D8_AUTOMATIC_IAC_DESIGN_RUNTIME_COUNT,
  D8_AUTOMATIC_IAC_REDESIGN_RUNTIME_COUNT,
  D8_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT,
  D8_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
  D8_D9_RUNTIME_INTEGRATION_COUNT,
  D8_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT,
  D8_CROSS_DISCIPLINE_CONFLICT_DETECTION_RUNTIME_COUNT,
  D8_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT,
  D8_CROSS_DISCIPLINE_RECOMMENDATION_RUNTIME_COUNT,
  D8_REUSES_CANONICAL_CURRENTNESS,
  PARALLEL_D8_CURRENTNESS_ENGINE_CREATED,
  D8_REUSES_CANONICAL_DIGITAL_THREAD,
  PARALLEL_D8_DIGITAL_THREAD_CREATED,
  D8_REUSES_CANONICAL_FINGERPRINT,
  SECOND_D8_FINGERPRINT_ALGORITHM_CREATED,
  D8_EXPLICIT_LINEAGE_REQUIRED,
  D8_INFERRED_LINEAGE_ALLOWED,
  D8_EQUALS_D1_STRUCTURAL_AUTHORITY,
  D8_EQUALS_D2_CIVIL_AUTHORITY,
  D8_EQUALS_D3_GEOTECHNICAL_AUTHORITY,
  D8_EQUALS_D4_MECHANICAL_AUTHORITY,
  D8_EQUALS_D5_PIPING_AUTHORITY,
  D8_EQUALS_D6_PROCESS_AUTHORITY,
  D8_EQUALS_D7_ELECTRICAL_AUTHORITY,
  AI_EQUALS_D8_IAC_ENGINEERING_AUTHORITY,
  ADMIN_EQUALS_D8_IAC_ENGINEERING_AUTHORITY,
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
  D7_TRACK_COMPLETE,
  D7_STATUS,
  D7_REOPENED,
  D9_RUNTIME_STARTED,
  D9_RUNTIME_COUNT,
  DATABASE_SCHEMA_CHANGED,
  NEW_DEPENDENCY_ADDED,
};

const FLOATING = new Set(["latest", "current", "newest", "head", "active", "active model", "now"]);
const FORBIDDEN = new Set<string>(FORBIDDEN_PRE_ISSUE_VERDICTS);
const CLOSED = new Set(["closed", "accepted", "approved", "validated", "conformant", "certified"]);

type Currentness = (typeof D8_CURRENTNESS_STATES)[number];
type SubjectKind = (typeof D8_R9_SUBJECT_KINDS)[number];
type BasisKind = (typeof D8_R9_BASIS_KINDS)[number];

type Prohibited = {
  automaticValidation?: boolean;
  reviewCompleted?: boolean;
  closeFindingAsValidated?: boolean;
  findingAcceptedEqualsApproved?: boolean;
  transferReview?: boolean;
  transferValidation?: boolean;
  inheritValidation?: boolean;
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
  validateElectrical?: boolean;
  functionalSafetyValidation?: boolean;
  silCalculation?: boolean;
  silVerification?: boolean;
  pfdCalculation?: boolean;
  pfhCalculation?: boolean;
  redesign?: boolean;
  reconfigure?: boolean;
  retune?: boolean;
  rewriteLogic?: boolean;
  designChange?: boolean;
  engineeringDecision?: boolean;
  mutateUpstream?: boolean;
  mutateHandoff?: boolean;
  inferLineage?: boolean;
  d9Reasoning?: boolean;
  standardEqualsConformance?: boolean;
  jurisdictionEqualsApproval?: boolean;
  functionalSafetyCompliance?: boolean;
};

export type D8R9Actor = D8R1Actor & { actorKind?: "human" | "ai"; aal?: string; amr?: string[] };

type Located = {
  fingerprint: string;
  provenanceRef: string;
  recordStatus: string;
  currentness: string;
  tenantId: string;
  objectId: string;
};

export type D8R9SubjectPin = {
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

type Basis = { kind: BasisKind; id: string; fingerprint: string; provenanceRef: string };

type Governed = D8R9SubjectPin & {
  applicability: string;
  limitations: string;
  provenanceRef: string;
  sourceBasisRef: string;
  citedCurrentness: Currentness;
  currentness: Currentness;
  citedLifecycleStage: (typeof D8_MATURITY_STATES)[number];
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
  counterpartApproved: false;
  counterpartConformant: false;
  sifValidated: false;
  silVerified: false;
  standardEqualsConformance: false;
  jurisdictionEqualsApproval: false;
  functionalSafetyCompliance: false;
  engineeringDecision: false;
  designChange: false;
  deleted: false;
  invalidated: false;
  createdAt: string;
  createdBy: string;
};

export type D8R9ReviewRequestRecord = Governed & {
  reviewRequestId: string;
  reviewType: (typeof D8_R9_REVIEW_TYPES)[number];
  reviewScope: string;
  requestStatus: (typeof D8_R9_REQUEST_STATUSES)[number];
  reviewCompleted: false;
  decisionId: string | null;
  decisionFingerprint: string | null;
  standardReference: string | null;
  predecessorReviewRequestId: string | null;
  predecessorFingerprint: string | null;
};

export type D8R9AssignmentRecord = Governed & {
  assignmentId: string;
  reviewRequestId: string;
  reviewerId: string;
  reviewerAuthority: typeof D8_R9_REVIEWER_AUTHORITY;
  reviewAssigned: true;
  reviewCompleted: false;
};

export type D8R9FindingRecord = Governed & {
  findingId: string;
  reviewRequestId: string;
  findingCategory: (typeof D8_R9_FINDING_CATEGORIES)[number];
  severity: (typeof PRE_ISSUE_MATERIALITY)[number];
  findingText: string;
  disposition: (typeof D8_R9_FINDING_DISPOSITIONS)[number];
  reviewerId: string;
  reviewerAuthority: typeof D8_R9_REVIEWER_AUTHORITY;
  evidenceRef: string;
  decisionId: string | null;
  decisionFingerprint: string | null;
};

export type D8R9DispositionRecord = Governed & {
  dispositionId: string;
  findingId: string;
  disposition: (typeof D8_R9_FINDING_DISPOSITIONS)[number];
  reviewerId: string;
  reviewerAuthority: typeof D8_R9_REVIEWER_AUTHORITY;
  findingClosed: boolean;
  findingAccepted: boolean;
  changeId: string | null;
  changeFingerprint: string | null;
  reassessmentId: string | null;
  reassessmentFingerprint: string | null;
};

export type D8R9CompletionRecord = Governed & {
  completionId: string;
  reviewRequestId: string;
  reviewCompleted: true;
  reviewerId: string;
  reviewerAuthority: typeof D8_R9_REVIEWER_AUTHORITY;
  predecessorCompletionId: string | null;
  predecessorFingerprint: string | null;
};

export type D8R9ValidationRecord = Governed & {
  validationId: string;
  validationScope: string;
  validationState: (typeof D8_R9_VALIDATION_STATES)[number];
  validationAuthority: typeof D8_R9_VALIDATION_AUTHORITY;
  validatorId: string;
  basis: Basis[];
  reviewRequestId: string | null;
  standardReference: string | null;
  jurisdictionReference: string | null;
  changeId: string | null;
  changeFingerprint: string | null;
  reassessmentId: string | null;
  reassessmentFingerprint: string | null;
  predecessorValidationId: string | null;
  predecessorFingerprint: string | null;
};

export type D8R9History = {
  historyId: string;
  subjectKind: "REQUEST" | "ASSIGNMENT" | "FINDING" | "DISPOSITION" | "COMPLETION" | "VALIDATION";
  subjectId: string;
  action: "CREATED" | "SUPERSEDED";
  fingerprint: string;
  recordedAt: string;
};

export type D8R9Store = {
  r8: D8R8Store;
  now: () => string;
  requests: D8R9ReviewRequestRecord[];
  assignments: D8R9AssignmentRecord[];
  findings: D8R9FindingRecord[];
  dispositions: D8R9DispositionRecord[];
  completions: D8R9CompletionRecord[];
  validations: D8R9ValidationRecord[];
  history: D8R9History[];
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
  throw new Error(`D8_R9_${code}`);
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

function sameScope(row: { tenantId: string; workspaceId: string; projectId: string }, actor: D8R9Actor): boolean {
  return row.tenantId === actor.tenantId && row.workspaceId === actor.workspaceId && row.projectId === actor.projectId;
}

function assertScope(actor: D8R9Actor, input: { tenantId: string; workspaceId: string; projectId: string }): void {
  if (!actor.actorId.trim() || !actor.tenantId.trim() || !actor.workspaceId.trim() || !actor.projectId.trim()) fail("SCOPE_REQUIRED");
  if (explicit(input.tenantId, "SCOPE_REQUIRED") !== actor.tenantId || explicit(input.workspaceId, "SCOPE_REQUIRED") !== actor.workspaceId || explicit(input.projectId, "SCOPE_REQUIRED") !== actor.projectId) {
    fail("SCOPE_MISMATCH");
  }
}

function assertHuman(actor: D8R9Actor, code: string): void {
  if (blockedParty(actor.actorId) || blockedParty(actor.authority) || actor.actorKind === "ai") fail(code);
  if (actor.actorId === "ADMIN" || actor.actorId === "ADMINISTRATOR" || actor.authority === "ADMIN" || actor.authority === "ADMINISTRATOR") fail(code);
  assertHumanApprovalActor("human", actor.actorId);
}

function assertRecorder(actor: D8R9Actor): void {
  assertHuman(actor, "AI_NOT_IAC_AUTHORITY");
  if (actor.authority !== D8_CONTEXT_AUTHORITY) fail("RECORDER_AUTHORITY_INVALID");
}

function assertReviewer(actor: D8R9Actor): void {
  assertHuman(actor, "AI_NOT_IAC_REVIEWER");
  if (actor.authority !== D8_R9_REVIEWER_AUTHORITY || actor.actorKind !== "human") fail("REVIEWER_AUTHORITY_REQUIRED");
  if (resolveAuthAssuranceLevel({ aal: actor.aal, amr: actor.amr }) !== "aal2") fail("AAL2_REQUIRED");
}

function assertValidator(actor: D8R9Actor): void {
  assertHuman(actor, "AI_NOT_VALIDATION_AUTHORITY");
  if (actor.authority !== D8_R9_VALIDATION_AUTHORITY || actor.actorKind !== "human") fail("VALIDATION_AUTHORITY_REQUIRED");
  if (resolveAuthAssuranceLevel({ aal: actor.aal, amr: actor.amr }) !== "aal2") fail("AAL2_REQUIRED");
}

function assertProhibited(input: Prohibited): void {
  if (input.automaticValidation === true) fail("AUTOMATIC_VALIDATION_REJECTED");
  if (input.reviewCompleted === true) fail("REVIEW_REQUEST_NOT_COMPLETION");
  if (input.closeFindingAsValidated === true) fail("FINDING_CLOSURE_NOT_VALIDATION");
  if (input.findingAcceptedEqualsApproved === true || input.approve === true) fail("APPROVAL_NOT_IN_R9");
  if (input.transferReview === true) fail("REVIEW_TRANSFER_REJECTED");
  if (input.transferValidation === true || input.inheritValidation === true) fail("VALIDATION_TRANSFER_REJECTED");
  if (input.repoint === true) fail("AUTO_REPOINT_REJECTED");
  if (input.certify === true) fail("CERTIFICATION_NOT_IN_R9");
  if (input.conform === true || input.standardEqualsConformance === true) fail("CONFORMANCE_NOT_IN_R9");
  if (input.regulatoryApproval === true || input.jurisdictionEqualsApproval === true) fail("REGULATORY_APPROVAL_NOT_IN_R9");
  if (input.functionalSafetyValidation === true || input.functionalSafetyCompliance === true) fail("FUNCTIONAL_SAFETY_VALIDATION_NOT_IN_R9");
  if (input.silCalculation === true || input.silVerification === true || input.pfdCalculation === true || input.pfhCalculation === true) fail("SIL_CALCULATION_NOT_IN_R9");
  if (
    input.validateCounterpart === true || input.validateStructural === true || input.validateCivil === true || input.validateGeotechnical === true
    || input.validateMechanical === true || input.validatePiping === true || input.validateProcess === true || input.validateElectrical === true
  ) fail("COUNTERPART_VALIDATION_REJECTED");
  if (input.redesign === true || input.reconfigure === true || input.retune === true || input.rewriteLogic === true || input.designChange === true) fail("REVIEW_DOES_NOT_REDESIGN");
  if (input.engineeringDecision === true) fail("FINDING_NOT_ENGINEERING_DECISION");
  if (input.mutateUpstream === true || input.mutateHandoff === true) fail("UPSTREAM_MUTATION_REJECTED");
  if (input.d9Reasoning === true) fail("CROSS_DISCIPLINE_REASONING_NOT_IN_R9");
  if (input.inferLineage === true) fail("INFERRED_LINEAGE_REJECTED");
}

function locate(store: D8R8Store, kind: string, id: string): Located | undefined {
  const r7 = store.r7;
  const r6 = r7.r6;
  const r5 = r6.r5;
  const r4 = r5.r4;
  const r3 = r4.r3;
  const r2 = r3.r2;
  const r1 = r2.r1;
  if (kind === "OBJECT") return r1.objects.find((row) => row.objectId === id);
  if (kind === "MEASUREMENT") return r2.measurements.find((row) => row.measurementRecordId === id);
  if (kind === "DEVICE") return r3.devices.find((row) => row.deviceRecordId === id);
  if (kind === "SIGNAL") return r4.signals.find((row) => row.signalRecordId === id);
  if (kind === "SYSTEM") return r5.systems.find((row) => row.systemRecordId === id);
  if (kind === "SAFETY") return r6.contexts.find((row) => row.contextRecordId === id);
  if (kind === "REQUIREMENT") return r7.requirements.find((row) => row.requirementId === id);
  if (kind === "DECISION") return r7.decisions.find((row) => row.decisionId === id);
  if (kind === "CHANGE") return r7.changes.find((row) => row.changeId === id);
  if (kind === "HANDOFF") return store.handoffs.find((row) => row.handoffId === id);
  return undefined;
}

function seal(store: D8R9Store): string {
  const r7 = store.r8.r7;
  const r6 = r7.r6;
  return JSON.stringify({
    objects: r6.r5.r4.r3.r2.r1.objects,
    measurements: r6.r5.r4.r3.r2.measurements,
    devices: r6.r5.r4.r3.devices,
    signals: r6.r5.r4.signals,
    systems: r6.r5.systems,
    contexts: r6.contexts,
    requirements: r7.requirements,
    decisions: r7.decisions,
    changes: r7.changes,
    reassessments: r7.reassessments,
    handoffs: store.r8.handoffs,
  });
}

function bind(store: D8R9Store, actor: D8R9Actor, input: Chain, cited: Currentness): D8R9SubjectPin {
  const context = store.r8.r7.r6.r5.r4.r3.r2.r1.contexts.find((row) => row.contextId === explicit(input.contextId, "R1_CONTEXT_REQUIRED"));
  if (!context || !sameScope(context, actor)) fail("R1_CONTEXT_NOT_FOUND");
  const object = store.r8.r7.r6.r5.r4.r3.r2.r1.objects.find((row) => row.objectId === explicit(input.objectId, "R1_OBJECT_REQUIRED"));
  if (!object || object.fingerprint !== explicit(input.objectRevisionFingerprint, "R1_REVISION_REQUIRED") || !sameScope(object, actor)) fail("R1_REVISION_MISMATCH");
  const subjectKind = explicit(input.subjectKind, "SUBJECT_KIND_REQUIRED");
  if (!(D8_R9_SUBJECT_KINDS as readonly string[]).includes(subjectKind)) fail("SUBJECT_KIND_INVALID");
  const subject = locate(store.r8, subjectKind, explicit(input.subjectId, "SUBJECT_REFERENCE_REQUIRED"));
  const subjectFingerprint = explicit(input.subjectFingerprint, "SUBJECT_FINGERPRINT_REQUIRED");
  const subjectRevision = explicit(input.subjectRevision, "SUBJECT_REVISION_REQUIRED");
  if (!subject || subject.fingerprint !== subjectFingerprint || subject.provenanceRef !== subjectRevision || subject.tenantId !== actor.tenantId || subject.objectId !== object.objectId) {
    fail("SUBJECT_REVISION_MISMATCH");
  }
  if (cited === "CURRENT" && (subject.recordStatus !== "CURRENT" || object.recordStatus !== "CURRENT" || context.recordStatus !== "CURRENT")) fail("SUBJECT_NOT_CURRENT");
  return {
    subjectKind: subjectKind as SubjectKind,
    subjectId: subject.objectId === object.objectId && subjectKind === "OBJECT" ? object.objectId : explicit(input.subjectId, "SUBJECT_REFERENCE_REQUIRED"),
    subjectRevision: subject.provenanceRef,
    subjectFingerprint: subject.fingerprint,
    contextId: context.contextId,
    objectId: object.objectId,
    objectRevisionFingerprint: object.fingerprint,
    subjectRecordStatus: subject.recordStatus,
    subjectCurrentness: subject.currentness,
  };
}

function samePin(left: D8R9SubjectPin, right: D8R9SubjectPin): boolean {
  return left.subjectKind === right.subjectKind && left.subjectId === right.subjectId && left.subjectFingerprint === right.subjectFingerprint && left.subjectRevision === right.subjectRevision;
}

function remember(store: D8R9Store, subjectKind: D8R9History["subjectKind"], subjectId: string, action: D8R9History["action"], fingerprint: string): void {
  store.history.push({ historyId: `d8r9-history-${store.history.length + 1}`, subjectKind, subjectId, action, fingerprint, recordedAt: store.now() });
}

function governedFields(store: D8R9Store, actor: D8R9Actor, pin: D8R9SubjectPin, applicability: string, limitations: string, provenanceRef: string, sourceBasisRef: string, cited: Currentness, lifecycle: string, fingerprint: string, engineeringValidated: boolean): Governed {
  const stage = lifecycle.trim();
  if (!(D8_MATURITY_STATES as readonly string[]).includes(stage)) fail("LIFECYCLE_INVALID");
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
    counterpartApproved: false,
    counterpartConformant: false,
    sifValidated: false,
    silVerified: false,
    standardEqualsConformance: false,
    jurisdictionEqualsApproval: false,
    functionalSafetyCompliance: false,
    engineeringDecision: false,
    designChange: false,
    deleted: false,
    invalidated: false,
    createdAt: store.now(),
    createdBy: actor.actorId,
  };
}

function citedDecision(store: D8R9Store, actor: D8R9Actor, pin: D8R9SubjectPin, decisionId: string | null | undefined, decisionFingerprint: string | null | undefined): { decisionId: string; decisionFingerprint: string } | null {
  if (!decisionId && !decisionFingerprint) return null;
  const decision = store.r8.r7.decisions.find((row) => row.decisionId === explicit(decisionId ?? "", "DECISION_REFERENCE_REQUIRED") && sameScope(row, actor));
  if (!decision || decision.fingerprint !== explicit(decisionFingerprint ?? "", "DECISION_REVISION_REQUIRED") || decision.recordStatus !== "CURRENT" || decision.objectId !== pin.objectId) {
    fail("DECISION_REVISION_MISMATCH");
  }
  return { decisionId: decision.decisionId, decisionFingerprint: decision.fingerprint };
}

function linkedReassessment(store: D8R9Store, actor: D8R9Actor, pin: D8R9SubjectPin, changeId: string | null | undefined, changeFingerprint: string | null | undefined, reassessmentId: string | null | undefined, reassessmentFingerprint: string | null | undefined) {
  const change = store.r8.r7.changes.find((row) => row.changeId === explicit(changeId ?? "", "CHANGE_REFERENCE_REQUIRED") && sameScope(row, actor));
  if (!change || change.fingerprint !== explicit(changeFingerprint ?? "", "CHANGE_REVISION_REQUIRED") || change.recordStatus !== "CURRENT") fail("CHANGE_REVISION_MISMATCH");
  if (!change.dependencies.some((link) => link.targetId === pin.subjectId && link.targetFingerprint === pin.subjectFingerprint)) fail("CHANGE_SUBJECT_NOT_EXPLICIT");
  const reassessment = store.r8.r7.reassessments.find((row) => row.reassessmentId === explicit(reassessmentId ?? "", "REASSESSMENT_REFERENCE_REQUIRED") && row.tenantId === actor.tenantId);
  if (!reassessment || reassessment.fingerprint !== explicit(reassessmentFingerprint ?? "", "REASSESSMENT_REVISION_REQUIRED") || reassessment.changeId !== change.changeId || reassessment.targetId !== pin.subjectId || reassessment.targetFingerprint !== pin.subjectFingerprint) {
    fail("REASSESSMENT_REVISION_MISMATCH");
  }
  if (reassessment.validated || reassessment.state === "REASSESSMENT_COMPLETED") fail("REASSESSMENT_NOT_VALIDATION");
  return { changeId: change.changeId, changeFingerprint: change.fingerprint, reassessmentId: reassessment.reassessmentId, reassessmentFingerprint: reassessment.fingerprint };
}

function basisKind(kind: string): string {
  if (kind === "R1_OBJECT") return "OBJECT";
  if (kind === "R2_MEASUREMENT") return "MEASUREMENT";
  if (kind === "R3_DEVICE") return "DEVICE";
  if (kind === "R4_SIGNAL") return "SIGNAL";
  if (kind === "R5_SYSTEM") return "SYSTEM";
  if (kind === "R6_SAFETY") return "SAFETY";
  if (kind === "R7_REQUIREMENT") return "REQUIREMENT";
  if (kind === "R7_DECISION") return "DECISION";
  if (kind === "R8_HANDOFF") return "HANDOFF";
  return "REASSESSMENT";
}

function resolveBasis(store: D8R9Store, pin: D8R9SubjectPin, items: readonly { kind: string; id: string; fingerprint: string }[] | undefined, validationState: string): Basis[] {
  const resolved: Basis[] = [];
  for (const item of items ?? []) {
    const kind = explicit(item.kind, "BASIS_KIND_REQUIRED");
    if (!(D8_R9_BASIS_KINDS as readonly string[]).includes(kind)) fail("BASIS_KIND_INVALID");
    if (validationState === "VALIDATED" && kind === "R7_REASSESSMENT") fail("REASSESSMENT_NOT_VALIDATION");
    const id = explicit(item.id, "BASIS_REFERENCE_REQUIRED");
    const fingerprint = explicit(item.fingerprint, "BASIS_REVISION_REQUIRED");
    const mapped = basisKind(kind);
    const row = mapped === "REASSESSMENT"
      ? store.r8.r7.reassessments.find((entry) => entry.reassessmentId === id && entry.fingerprint === fingerprint)
      : locate(store.r8, mapped, id);
    if (!row || row.fingerprint !== fingerprint) fail("BASIS_REVISION_MISMATCH");
    if (validationState === "VALIDATED" && row.recordStatus !== "CURRENT") fail("BASIS_NOT_CURRENT");
    if (mapped !== "REASSESSMENT" && "objectId" in row && row.objectId !== pin.objectId && !(mapped === pin.subjectKind && id === pin.subjectId)) fail("BASIS_NOT_SUBJECT");
    const provenanceRef = "provenanceRef" in row ? row.provenanceRef : "";
    if (validationState === "VALIDATED" && !provenanceRef) fail("EVIDENCE_PROVENANCE_REQUIRED");
    resolved.push({ kind: kind as BasisKind, id, fingerprint: row.fingerprint, provenanceRef });
  }
  return resolved;
}

function textFields(input: { applicability: string; limitations: string; provenanceRef: string; sourceBasisRef: string }): { applicability: string; limitations: string; provenanceRef: string; sourceBasisRef: string } {
  return {
    applicability: explicit(input.applicability, "APPLICABILITY_REQUIRED"),
    limitations: explicit(input.limitations, "LIMITATIONS_REQUIRED"),
    provenanceRef: explicit(input.provenanceRef, "PROVENANCE_REQUIRED"),
    sourceBasisRef: explicit(input.sourceBasisRef, "SOURCE_BASIS_REQUIRED"),
  };
}

function currentnessOf(value: string): Currentness {
  const cited = value.trim();
  if (!(D8_CURRENTNESS_STATES as readonly string[]).includes(cited)) fail("CURRENTNESS_INVALID");
  return cited as Currentness;
}

export function createD8R9Store(r8: D8R8Store, now: () => string = () => r8.now()): D8R9Store {
  if (R8_RUNTIME_COUNT !== 8) fail("R8_RUNTIME_COUNT_UNEXPECTED");
  return { r8, now, requests: [], assignments: [], findings: [], dispositions: [], completions: [], validations: [], history: [] };
}

export function currentIacValidations(store: D8R9Store, actor: D8R9Actor): D8R9ValidationRecord[] {
  return store.validations.filter((row) => sameScope(row, actor) && row.recordStatus === "CURRENT" && row.currentness === "CURRENT" && row.validationState === "VALIDATED");
}

export function recordIacReviewRequest(store: D8R9Store, actor: D8R9Actor, input: Prohibited & Chain & {
  reviewRequestId: string; reviewType: string; reviewScope: string; applicability: string; limitations: string; provenanceRef: string; sourceBasisRef: string; citedCurrentness: string; citedLifecycleStage: string; decisionId?: string | null; decisionFingerprint?: string | null; standardReference?: string | null; assertedFingerprint?: string | null; predecessorReviewRequestId?: string | null;
}): D8R9ReviewRequestRecord {
  assertRecorder(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const cited = currentnessOf(input.citedCurrentness);
  const before = seal(store);
  const pin = bind(store, actor, input, cited);
  const reviewType = explicit(input.reviewType, "REVIEW_TYPE_REQUIRED");
  if (!(D8_R9_REVIEW_TYPES as readonly string[]).includes(reviewType)) fail("REVIEW_TYPE_INVALID");
  if (reviewType === "INTERFACE_HANDOFF_REVIEW" && pin.subjectKind !== "HANDOFF") fail("HANDOFF_SUBJECT_REQUIRED");
  if (reviewType === "SAFETY_CONTEXT_REVIEW" && pin.subjectKind !== "SAFETY") fail("SAFETY_SUBJECT_REQUIRED");
  if (reviewType === "IAC_SUBJECT_REVIEW" && (pin.subjectKind === "HANDOFF" || pin.subjectKind === "SAFETY")) fail("REVIEW_SCOPE_INVALID");
  const reviewScope = explicit(input.reviewScope, "REVIEW_SCOPE_REQUIRED");
  if (!reviewScope.includes(pin.subjectId)) fail("REVIEW_SCOPE_NOT_SUBJECT");
  const text = textFields(input);
  const decision = citedDecision(store, actor, pin, input.decisionId, input.decisionFingerprint);
  const standardReference = input.standardReference ? explicit(input.standardReference, "STANDARD_REFERENCE_REQUIRED") : null;
  const reviewRequestId = explicit(input.reviewRequestId, "REVIEW_REQUEST_REQUIRED");
  const predecessor = input.predecessorReviewRequestId ? store.requests.find((row) => row.reviewRequestId === explicit(input.predecessorReviewRequestId ?? "", "REVIEW_REQUEST_REQUIRED")) ?? null : null;
  if (input.predecessorReviewRequestId && (!predecessor || predecessor.tenantId !== actor.tenantId)) fail("REVIEW_REQUEST_NOT_FOUND");
  if (predecessor && (!samePin(predecessor, pin) || predecessor.subjectFingerprint !== pin.subjectFingerprint)) fail("REVIEW_TRANSFER_REJECTED");
  if (predecessor && predecessor.recordStatus !== "CURRENT") fail("PREDECESSOR_NOT_CURRENT");
  const fingerprint = fingerprintCanonical({ reviewRequestId, ...pin, reviewType, reviewScope, ...text, cited, decision, standardReference, predecessorReviewRequestId: predecessor?.reviewRequestId ?? null, discipline: D8_DISCIPLINE });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.requests.find((row) => row.reviewRequestId === reviewRequestId);
  if (existing) return existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId ? existing : fail("REVIEW_REQUEST_ALREADY_RECORDED");
  const signature = `${pin.subjectKind}|${pin.subjectId}|${pin.subjectFingerprint}|${reviewType}`;
  if (store.requests.some((row) => row.recordStatus === "CURRENT" && row.reviewRequestId !== predecessor?.reviewRequestId && `${row.subjectKind}|${row.subjectId}|${row.subjectFingerprint}|${row.reviewType}` === signature)) fail("DUPLICATE_REVIEW_REQUEST_REJECTED");
  if (predecessor) {
    const kept = predecessor.subjectFingerprint;
    const index = store.requests.findIndex((row) => row.reviewRequestId === predecessor.reviewRequestId);
    store.requests[index] = Object.freeze({ ...predecessor, recordStatus: "SUPERSEDED", currentness: "SUPERSEDED" });
    if (store.requests[index].subjectFingerprint !== kept) fail("HISTORICAL_AUTO_REPOINT_REJECTED");
    remember(store, "REQUEST", predecessor.reviewRequestId, "SUPERSEDED", predecessor.fingerprint);
  }
  const record: D8R9ReviewRequestRecord = {
    ...governedFields(store, actor, pin, text.applicability, text.limitations, text.provenanceRef, text.sourceBasisRef, cited, input.citedLifecycleStage, fingerprint, false),
    reviewRequestId, reviewType: reviewType as D8R9ReviewRequestRecord["reviewType"], reviewScope, requestStatus: "REQUESTED", reviewCompleted: false,
    decisionId: decision?.decisionId ?? null, decisionFingerprint: decision?.decisionFingerprint ?? null, standardReference,
    predecessorReviewRequestId: predecessor?.reviewRequestId ?? null, predecessorFingerprint: predecessor?.fingerprint ?? null,
  };
  store.requests.push(record);
  remember(store, "REQUEST", record.reviewRequestId, "CREATED", record.fingerprint);
  if (seal(store) !== before) fail("UPSTREAM_MUTATED");
  return record;
}

export function recordIacReviewerAssignment(store: D8R9Store, actor: D8R9Actor, input: Prohibited & Chain & {
  assignmentId: string; reviewRequestId: string; reviewerId: string; reviewerAuthority: string; applicability: string; limitations: string; provenanceRef: string; sourceBasisRef: string; citedCurrentness: string; citedLifecycleStage: string; assertedFingerprint?: string | null;
}): D8R9AssignmentRecord {
  assertRecorder(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const cited = currentnessOf(input.citedCurrentness);
  const before = seal(store);
  const pin = bind(store, actor, input, cited);
  const request = store.requests.find((row) => row.reviewRequestId === explicit(input.reviewRequestId, "REVIEW_REQUEST_REQUIRED") && row.recordStatus === "CURRENT" && row.tenantId === actor.tenantId);
  if (!request || !samePin(request, pin)) fail("REVIEW_REQUEST_NOT_FOUND");
  if (blockedParty(input.reviewerId) || input.reviewerId === "ADMIN" || input.reviewerId === "ADMINISTRATOR") fail("REVIEWER_AUTHORITY_SPOOFING_REJECTED");
  const reviewerId = explicit(input.reviewerId, "REVIEWER_REQUIRED");
  if (explicit(input.reviewerAuthority, "REVIEWER_AUTHORITY_REQUIRED") !== D8_R9_REVIEWER_AUTHORITY) fail("REVIEWER_AUTHORITY_REQUIRED");
  const text = textFields(input);
  const assignmentId = explicit(input.assignmentId, "ASSIGNMENT_REQUIRED");
  const fingerprint = fingerprintCanonical({ assignmentId, reviewRequestId: request.reviewRequestId, reviewerId, reviewerAuthority: D8_R9_REVIEWER_AUTHORITY, ...pin, ...text, cited });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.assignments.find((row) => row.assignmentId === assignmentId);
  if (existing) return existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId ? existing : fail("ASSIGNMENT_ALREADY_RECORDED");
  if (store.assignments.some((row) => row.recordStatus === "CURRENT" && row.reviewRequestId === request.reviewRequestId && row.reviewerId === reviewerId)) fail("DUPLICATE_ASSIGNMENT_REJECTED");
  const record: D8R9AssignmentRecord = {
    ...governedFields(store, actor, pin, text.applicability, text.limitations, text.provenanceRef, text.sourceBasisRef, cited, input.citedLifecycleStage, fingerprint, false),
    assignmentId, reviewRequestId: request.reviewRequestId, reviewerId, reviewerAuthority: D8_R9_REVIEWER_AUTHORITY, reviewAssigned: true, reviewCompleted: false,
  };
  store.assignments.push(record);
  remember(store, "ASSIGNMENT", record.assignmentId, "CREATED", record.fingerprint);
  if (seal(store) !== before || request.reviewCompleted !== false || request.engineeringValidated !== false) fail("UPSTREAM_MUTATED");
  return record;
}

function assignedReviewer(store: D8R9Store, actor: D8R9Actor, requestId: string, pin: D8R9SubjectPin): D8R9AssignmentRecord {
  const assignment = store.assignments.find((row) => row.reviewRequestId === requestId && row.reviewerId === actor.actorId && row.recordStatus === "CURRENT" && row.tenantId === actor.tenantId);
  if (!assignment || !samePin(assignment, pin) || assignment.reviewCompleted !== false) fail("REVIEWER_ASSIGNMENT_REQUIRED");
  return assignment;
}

export function recordIacReviewFinding(store: D8R9Store, actor: D8R9Actor, input: Prohibited & Chain & {
  findingId: string; reviewRequestId: string; findingCategory: string; severity: string; findingText: string; disposition: string; evidenceRef: string; applicability: string; limitations: string; provenanceRef: string; sourceBasisRef: string; citedCurrentness: string; citedLifecycleStage: string; decisionId?: string | null; decisionFingerprint?: string | null; assertedFingerprint?: string | null;
}): D8R9FindingRecord {
  assertReviewer(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const cited = currentnessOf(input.citedCurrentness);
  const before = seal(store);
  const pin = bind(store, actor, input, cited);
  const request = store.requests.find((row) => row.reviewRequestId === explicit(input.reviewRequestId, "REVIEW_REQUEST_REQUIRED") && row.recordStatus === "CURRENT" && row.tenantId === actor.tenantId);
  if (!request || !samePin(request, pin)) fail("REVIEW_REQUEST_NOT_FOUND");
  assignedReviewer(store, actor, request.reviewRequestId, pin);
  const findingCategory = explicit(input.findingCategory, "FINDING_CATEGORY_REQUIRED");
  if (FORBIDDEN.has(findingCategory) || !(D8_R9_FINDING_CATEGORIES as readonly string[]).includes(findingCategory)) fail("FINDING_CATEGORY_INVALID");
  const severity = explicit(input.severity, "FINDING_SEVERITY_REQUIRED");
  if (!(PRE_ISSUE_MATERIALITY as readonly string[]).includes(severity)) fail("FINDING_SEVERITY_INVALID");
  const disposition = explicit(input.disposition, "FINDING_DISPOSITION_REQUIRED");
  if (CLOSED.has(disposition.toLowerCase()) || FORBIDDEN.has(disposition) || !(D8_R9_FINDING_DISPOSITIONS as readonly string[]).includes(disposition)) fail("FINDING_DISPOSITION_INVALID");
  const findingText = explicit(input.findingText, "FINDING_TEXT_REQUIRED");
  const evidenceRef = explicit(input.evidenceRef, "EVIDENCE_REQUIRED");
  const text = textFields(input);
  const decision = citedDecision(store, actor, pin, input.decisionId, input.decisionFingerprint);
  const findingId = explicit(input.findingId, "FINDING_ID_REQUIRED");
  const fingerprint = fingerprintCanonical({ findingId, reviewRequestId: request.reviewRequestId, ...pin, findingCategory, severity, findingText, disposition, evidenceRef, ...text, cited, decision, reviewerId: actor.actorId });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.findings.find((row) => row.findingId === findingId);
  if (existing) return existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId ? existing : fail("FINDING_ALREADY_RECORDED");
  const signature = `${request.reviewRequestId}|${pin.subjectFingerprint}|${findingCategory}|${findingText}`;
  if (store.findings.some((row) => `${row.reviewRequestId}|${row.subjectFingerprint}|${row.findingCategory}|${row.findingText}` === signature)) fail("DUPLICATE_FINDING_REJECTED");
  const record: D8R9FindingRecord = {
    ...governedFields(store, actor, pin, text.applicability, text.limitations, text.provenanceRef, text.sourceBasisRef, cited, input.citedLifecycleStage, fingerprint, false),
    findingId, reviewRequestId: request.reviewRequestId, findingCategory: findingCategory as D8R9FindingRecord["findingCategory"], severity: severity as D8R9FindingRecord["severity"], findingText,
    disposition: disposition as D8R9FindingRecord["disposition"], reviewerId: actor.actorId, reviewerAuthority: D8_R9_REVIEWER_AUTHORITY, evidenceRef,
    decisionId: decision?.decisionId ?? null, decisionFingerprint: decision?.decisionFingerprint ?? null,
  };
  store.findings.push(record);
  remember(store, "FINDING", record.findingId, "CREATED", record.fingerprint);
  if (seal(store) !== before || request.reviewCompleted !== false || request.engineeringValidated !== false) fail("UPSTREAM_MUTATED");
  return record;
}

export function recordIacFindingDisposition(store: D8R9Store, actor: D8R9Actor, input: Prohibited & Chain & {
  dispositionId: string; findingId: string; disposition: string; findingAccepted?: boolean; changeId?: string | null; changeFingerprint?: string | null; reassessmentId?: string | null; reassessmentFingerprint?: string | null; applicability: string; limitations: string; provenanceRef: string; sourceBasisRef: string; citedCurrentness: string; citedLifecycleStage: string; assertedFingerprint?: string | null;
}): D8R9DispositionRecord {
  assertReviewer(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const cited = currentnessOf(input.citedCurrentness);
  const before = seal(store);
  const pin = bind(store, actor, input, cited);
  const finding = store.findings.find((row) => row.findingId === explicit(input.findingId, "FINDING_ID_REQUIRED") && row.tenantId === actor.tenantId);
  if (!finding || !samePin(finding, pin)) fail("FINDING_NOT_FOUND");
  assignedReviewer(store, actor, finding.reviewRequestId, pin);
  const originalFingerprint = finding.fingerprint;
  const disposition = explicit(input.disposition, "FINDING_DISPOSITION_REQUIRED");
  if (CLOSED.has(disposition.toLowerCase()) || FORBIDDEN.has(disposition) || !(D8_R9_FINDING_DISPOSITIONS as readonly string[]).includes(disposition)) fail("FINDING_DISPOSITION_INVALID");
  const linked = disposition === "REASSESSMENT_REQUESTED" ? linkedReassessment(store, actor, pin, input.changeId, input.changeFingerprint, input.reassessmentId, input.reassessmentFingerprint) : null;
  if (!linked && (input.changeId || input.reassessmentId)) fail("CHANGE_REFERENCE_UNEXPECTED");
  const findingAccepted = input.findingAccepted === true;
  if (findingAccepted && disposition !== "NOTED") fail("FINDING_DISPOSITION_INVALID");
  const text = textFields(input);
  const dispositionId = explicit(input.dispositionId, "DISPOSITION_ID_REQUIRED");
  const findingClosed = disposition === "NOTED";
  const fingerprint = fingerprintCanonical({ dispositionId, findingId: finding.findingId, ...pin, disposition, findingClosed, findingAccepted, linked, ...text, cited, reviewerId: actor.actorId });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.dispositions.find((row) => row.dispositionId === dispositionId);
  if (existing) return existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId ? existing : fail("DISPOSITION_ALREADY_RECORDED");
  if (store.dispositions.some((row) => row.findingId === finding.findingId && row.disposition === disposition && row.subjectFingerprint === pin.subjectFingerprint)) fail("DUPLICATE_DISPOSITION_REJECTED");
  const record: D8R9DispositionRecord = {
    ...governedFields(store, actor, pin, text.applicability, text.limitations, text.provenanceRef, text.sourceBasisRef, cited, input.citedLifecycleStage, fingerprint, false),
    dispositionId, findingId: finding.findingId, disposition: disposition as D8R9DispositionRecord["disposition"], reviewerId: actor.actorId, reviewerAuthority: D8_R9_REVIEWER_AUTHORITY,
    findingClosed, findingAccepted, changeId: linked?.changeId ?? null, changeFingerprint: linked?.changeFingerprint ?? null, reassessmentId: linked?.reassessmentId ?? null, reassessmentFingerprint: linked?.reassessmentFingerprint ?? null,
  };
  store.dispositions.push(record);
  remember(store, "DISPOSITION", record.dispositionId, "CREATED", record.fingerprint);
  if (finding.fingerprint !== originalFingerprint || finding.engineeringValidated !== false || finding.engineeringDecision !== false || record.approved !== false || record.counterpartValidated !== false) fail("SILENT_MUTATION_REJECTED");
  if (seal(store) !== before) fail("UPSTREAM_MUTATED");
  return record;
}

export function recordIacReviewCompletion(store: D8R9Store, actor: D8R9Actor, input: Prohibited & Chain & {
  completionId: string; reviewRequestId: string; applicability: string; limitations: string; provenanceRef: string; sourceBasisRef: string; citedCurrentness: string; citedLifecycleStage: string; assertedFingerprint?: string | null; predecessorCompletionId?: string | null;
}): D8R9CompletionRecord {
  assertReviewer(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const cited = currentnessOf(input.citedCurrentness);
  const before = seal(store);
  const pin = bind(store, actor, input, cited);
  const request = store.requests.find((row) => row.reviewRequestId === explicit(input.reviewRequestId, "REVIEW_REQUEST_REQUIRED") && row.recordStatus === "CURRENT" && row.tenantId === actor.tenantId);
  if (!request || !samePin(request, pin)) fail("REVIEW_REQUEST_NOT_FOUND");
  assignedReviewer(store, actor, request.reviewRequestId, pin);
  const text = textFields(input);
  const completionId = explicit(input.completionId, "COMPLETION_ID_REQUIRED");
  const predecessor = input.predecessorCompletionId ? store.completions.find((row) => row.completionId === explicit(input.predecessorCompletionId ?? "", "COMPLETION_ID_REQUIRED")) ?? null : null;
  if (input.predecessorCompletionId && (!predecessor || predecessor.tenantId !== actor.tenantId)) fail("COMPLETION_NOT_FOUND");
  if (predecessor && !samePin(predecessor, pin)) fail("REVIEW_TRANSFER_REJECTED");
  if (predecessor && predecessor.recordStatus !== "CURRENT") fail("PREDECESSOR_NOT_CURRENT");
  const fingerprint = fingerprintCanonical({ completionId, reviewRequestId: request.reviewRequestId, ...pin, ...text, cited, reviewerId: actor.actorId, predecessorCompletionId: predecessor?.completionId ?? null });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.completions.find((row) => row.completionId === completionId);
  if (existing) return existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId ? existing : fail("COMPLETION_ALREADY_RECORDED");
  const signature = `${request.reviewRequestId}|${pin.subjectFingerprint}`;
  if (store.completions.some((row) => row.recordStatus === "CURRENT" && row.completionId !== predecessor?.completionId && `${row.reviewRequestId}|${row.subjectFingerprint}` === signature)) fail("DUPLICATE_COMPLETION_REJECTED");
  if (predecessor) {
    const kept = predecessor.subjectFingerprint;
    const index = store.completions.findIndex((row) => row.completionId === predecessor.completionId);
    store.completions[index] = Object.freeze({ ...predecessor, recordStatus: "SUPERSEDED", currentness: "SUPERSEDED" });
    if (store.completions[index].subjectFingerprint !== kept) fail("HISTORICAL_AUTO_REPOINT_REJECTED");
    remember(store, "COMPLETION", predecessor.completionId, "SUPERSEDED", predecessor.fingerprint);
  }
  const record: D8R9CompletionRecord = {
    ...governedFields(store, actor, pin, text.applicability, text.limitations, text.provenanceRef, text.sourceBasisRef, cited, input.citedLifecycleStage, fingerprint, false),
    completionId, reviewRequestId: request.reviewRequestId, reviewCompleted: true, reviewerId: actor.actorId, reviewerAuthority: D8_R9_REVIEWER_AUTHORITY,
    predecessorCompletionId: predecessor?.completionId ?? null, predecessorFingerprint: predecessor?.fingerprint ?? null,
  };
  store.completions.push(record);
  remember(store, "COMPLETION", record.completionId, "CREATED", record.fingerprint);
  if (seal(store) !== before || request.reviewCompleted !== false || request.engineeringValidated !== false || request.requestStatus !== "REQUESTED") fail("UPSTREAM_MUTATED");
  return record;
}

export function recordIacValidationState(store: D8R9Store, actor: D8R9Actor, input: Prohibited & Chain & {
  validationId: string; validationScope: string; validationState: string; basis?: readonly { kind: string; id: string; fingerprint: string }[]; reviewRequestId?: string | null; standardReference?: string | null; jurisdictionReference?: string | null; changeId?: string | null; changeFingerprint?: string | null; reassessmentId?: string | null; reassessmentFingerprint?: string | null; applicability: string; limitations: string; provenanceRef: string; sourceBasisRef: string; citedCurrentness: string; citedLifecycleStage: string; assertedFingerprint?: string | null; predecessorValidationId?: string | null;
}): D8R9ValidationRecord {
  if ((blockedParty(actor.actorId) || actor.actorKind === "ai" || actor.authority === "ADMIN" || actor.authority === "ADMINISTRATOR" || actor.actorId === "ADMIN" || actor.actorId === "ADMINISTRATOR") && input.validationState === "VALIDATED") fail("AI_CANNOT_VALIDATE");
  assertValidator(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const cited = currentnessOf(input.citedCurrentness);
  const before = seal(store);
  const pin = bind(store, actor, input, cited);
  const validationState = explicit(input.validationState, "VALIDATION_STATE_REQUIRED");
  if (FORBIDDEN.has(validationState) || !(D8_R9_VALIDATION_STATES as readonly string[]).includes(validationState)) fail("VALIDATION_STATE_INVALID");
  if (validationState === "STALE" && cited !== "STALE") fail("CURRENTNESS_STATUS_MISMATCH");
  if (validationState === "REASSESSMENT_REQUIRED" && cited !== "REASSESSMENT_REQUIRED") fail("CURRENTNESS_STATUS_MISMATCH");
  if ((validationState === "VALIDATED" || validationState === "NOT_VALIDATED" || validationState === "EVIDENCE_INCOMPLETE") && cited !== "CURRENT") fail("CURRENTNESS_STATUS_MISMATCH");
  if (validationState === "VALIDATED" && (pin.subjectRecordStatus !== "CURRENT" || pin.subjectCurrentness === "STALE" || pin.subjectCurrentness === "SUPERSEDED" || pin.subjectCurrentness === "REASSESSMENT_REQUIRED")) fail("STALE_NOT_VALIDATED");
  if (validationState === "VALIDATED" && store.r8.r7.reassessments.some((row) => row.recordStatus === "CURRENT" && row.targetId === pin.subjectId && row.targetFingerprint === pin.subjectFingerprint && row.state === "REASSESSMENT_REQUIRED")) fail("REASSESSMENT_NOT_VALIDATED");
  if (validationState === "VALIDATED" && (input.changeId || input.reassessmentId)) fail("REASSESSMENT_NOT_VALIDATION");
  const basis = resolveBasis(store, pin, input.basis, validationState);
  if (validationState === "VALIDATED" && basis.length === 0) fail("VALIDATION_EVIDENCE_REQUIRED");
  const linked = validationState === "REASSESSMENT_REQUIRED" || validationState === "STALE" ? linkedReassessment(store, actor, pin, input.changeId, input.changeFingerprint, input.reassessmentId, input.reassessmentFingerprint) : null;
  if (!linked && (input.changeId || input.reassessmentId)) fail("CHANGE_REFERENCE_UNEXPECTED");
  const validationScope = explicit(input.validationScope, "VALIDATION_SCOPE_REQUIRED");
  if (!validationScope.includes(pin.subjectId)) fail("VALIDATION_SCOPE_NOT_SUBJECT");
  const text = textFields(input);
  const validationId = explicit(input.validationId, "VALIDATION_ID_REQUIRED");
  const reviewRequestId = input.reviewRequestId ? explicit(input.reviewRequestId, "REVIEW_REQUEST_REQUIRED") : null;
  if (reviewRequestId) {
    const request = store.requests.find((row) => row.reviewRequestId === reviewRequestId && row.recordStatus === "CURRENT");
    if (!request || !samePin(request, pin) || request.tenantId !== actor.tenantId) fail("REVIEW_REQUEST_NOT_FOUND");
    if (request.engineeringValidated) fail("REVIEW_REQUEST_NOT_VALIDATION");
  }
  const standardReference = input.standardReference ? explicit(input.standardReference, "STANDARD_REFERENCE_REQUIRED") : null;
  const jurisdictionReference = input.jurisdictionReference ? explicit(input.jurisdictionReference, "JURISDICTION_REFERENCE_REQUIRED") : null;
  const predecessor = input.predecessorValidationId ? store.validations.find((row) => row.validationId === explicit(input.predecessorValidationId ?? "", "VALIDATION_ID_REQUIRED")) ?? null : null;
  if (input.predecessorValidationId && (!predecessor || predecessor.tenantId !== actor.tenantId)) fail("VALIDATION_NOT_FOUND");
  if (predecessor && !samePin(predecessor, pin)) fail("VALIDATION_TRANSFER_REJECTED");
  if (predecessor && predecessor.recordStatus !== "CURRENT") fail("PREDECESSOR_NOT_CURRENT");
  const engineeringValidated = validationState === "VALIDATED";
  const fingerprint = fingerprintCanonical({ validationId, reviewRequestId, ...pin, validationScope, basis, validationState, linked, engineeringValidated, standardReference, jurisdictionReference, ...text, cited, validatorId: actor.actorId, validationAuthority: D8_R9_VALIDATION_AUTHORITY, predecessorValidationId: predecessor?.validationId ?? null });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.validations.find((row) => row.validationId === validationId);
  if (existing) return existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId ? existing : fail("VALIDATION_ALREADY_RECORDED");
  const signature = `${pin.subjectKind}|${pin.subjectId}|${pin.subjectFingerprint}|${validationScope}|${validationState}`;
  if (store.validations.some((row) => row.recordStatus === "CURRENT" && row.validationId !== predecessor?.validationId && `${row.subjectKind}|${row.subjectId}|${row.subjectFingerprint}|${row.validationScope}|${row.validationState}` === signature)) fail("DUPLICATE_VALIDATION_REJECTED");
  if (predecessor) {
    const kept = predecessor.subjectFingerprint;
    const index = store.validations.findIndex((row) => row.validationId === predecessor.validationId);
    store.validations[index] = Object.freeze({ ...predecessor, recordStatus: "SUPERSEDED", currentness: "SUPERSEDED" });
    if (store.validations[index].subjectFingerprint !== kept) fail("HISTORICAL_AUTO_REPOINT_REJECTED");
    remember(store, "VALIDATION", predecessor.validationId, "SUPERSEDED", predecessor.fingerprint);
  }
  const record: D8R9ValidationRecord = {
    ...governedFields(store, actor, pin, text.applicability, text.limitations, text.provenanceRef, text.sourceBasisRef, cited, input.citedLifecycleStage, fingerprint, engineeringValidated),
    validationId, validationScope, validationState: validationState as D8R9ValidationRecord["validationState"], validationAuthority: D8_R9_VALIDATION_AUTHORITY, validatorId: actor.actorId, basis, reviewRequestId, standardReference, jurisdictionReference,
    changeId: linked?.changeId ?? null, changeFingerprint: linked?.changeFingerprint ?? null, reassessmentId: linked?.reassessmentId ?? null, reassessmentFingerprint: linked?.reassessmentFingerprint ?? null,
    predecessorValidationId: predecessor?.validationId ?? null, predecessorFingerprint: predecessor?.fingerprint ?? null,
  };
  store.validations.push(record);
  remember(store, "VALIDATION", record.validationId, "CREATED", record.fingerprint);
  if (seal(store) !== before) fail("UPSTREAM_MUTATED");
  if (record.conformant || record.approved || record.certified || record.regulatoryApproved || record.counterpartValidated || record.counterpartApproved || record.counterpartConformant || record.sifValidated || record.silVerified) fail("VALIDATION_BOUNDARY_BROKEN");
  if (record.validationState === "VALIDATED" && record.currentness !== "CURRENT") fail("STALE_EXPOSED_AS_CURRENT");
  if ((record.currentness === "STALE" || record.currentness === "REASSESSMENT_REQUIRED" || record.recordStatus === "SUPERSEDED") && currentIacValidations(store, actor).some((row) => row.validationId === record.validationId)) fail("STALE_EXPOSED_AS_CURRENT");
  return record;
}

export function repointIacReview(): never {
  return fail("AUTO_REPOINT_REJECTED");
}
export function transferIacValidation(): never {
  return fail("VALIDATION_TRANSFER_REJECTED");
}
export function automaticallyValidateIacEngineering(): never {
  return fail("AUTOMATIC_VALIDATION_REJECTED");
}
export function closeIacFindingAsValidated(): never {
  return fail("FINDING_CLOSURE_NOT_VALIDATION");
}
export function closeIacReassessmentAsValidated(): never {
  return fail("REASSESSMENT_NOT_VALIDATION");
}
export function validateIacCounterpartFromReview(): never {
  return fail("COUNTERPART_VALIDATION_REJECTED");
}
export function approveIacFromValidation(): never {
  return fail("APPROVAL_NOT_IN_R9");
}
export function certifyIacFromValidation(): never {
  return fail("CERTIFICATION_NOT_IN_R9");
}
export function determineIacConformanceFromValidation(): never {
  return fail("CONFORMANCE_NOT_IN_R9");
}
export function promoteIacFindingToDecision(): never {
  return fail("FINDING_NOT_ENGINEERING_DECISION");
}
export function redesignIacFromReview(): never {
  return fail("REVIEW_DOES_NOT_REDESIGN");
}
