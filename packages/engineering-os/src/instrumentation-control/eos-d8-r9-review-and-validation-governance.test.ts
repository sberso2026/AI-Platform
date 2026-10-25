import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  D8_CANONICAL_MILESTONE_COUNT,
  D8_REVIEW_VALIDATION_RUNTIME_COUNT as ARCHITECTURE_REVIEW_COUNT,
  D8_RUNTIME_COUNT as ARCHITECTURE_RUNTIME_COUNT,
} from "@rtb/types";
import { describe, expect, it } from "vitest";
import { STRUCTURAL_CAPABILITY_MANIFEST } from "../structural-concrete/capability";
import { scanAnalysisFormulaBypass } from "../structural-systems/formula-scan";
import { createD8R5Store } from "./control-system-architecture-context";
import { createD8R8Store, D8_RUNTIME_COUNT as R8_RUNTIME_COUNT, recordIacInterfaceHandoff } from "./discipline-interfaces-handoffs";
import { createD8R3Store } from "./instrument-device-context";
import { createD8R2Store } from "./process-measurement-tag-context";
import { createD8R4Store } from "./signal-io-control-loop-context";
import { D8_CONTEXT_AUTHORITY, type D8R1Actor, createD8R1Store, recordIacContext, recordIacObjectIdentity } from "./identity-foundation";
import { createD8R7Store, recordIacChange, recordIacEngineeringDecision, recordIacReassessment } from "./requirements-assumptions-change";
import {
  ADMIN_CAN_MARK_D8_ENGINEERING_VALIDATED_WITHOUT_AUTHORITY,
  ADMIN_CAN_PROMOTE_D8_VALIDATION_TO_APPROVAL,
  ADMIN_CAN_PROMOTE_REVIEW_COMPLETION_TO_VALIDATION,
  ADMIN_EQUALS_D8_ENGINEERING_REVIEW_AUTHORITY,
  ADMIN_EQUALS_D8_ENGINEERING_VALIDATION_AUTHORITY,
  ADMIN_EQUALS_D8_IAC_ENGINEERING_AUTHORITY,
  AI_CAN_CLOSE_REVIEW_AS_ENGINEERING_VALIDATED,
  AI_CAN_COMPLETE_D8_ENGINEERING_REVIEW_AS_HUMAN,
  AI_CAN_MARK_D8_ENGINEERING_VALIDATED,
  AI_CAN_PROMOTE_FINDING_CLOSURE_TO_VALIDATION,
  AI_CAN_PROMOTE_VALIDATION_TO_APPROVAL,
  AI_EQUALS_D8_ENGINEERING_VALIDATION_AUTHORITY,
  AI_EQUALS_D8_IAC_ENGINEERING_AUTHORITY,
  AI_EQUALS_D8_REVIEWER_AUTHORITY,
  CROSS_TENANT_D8_R9_ACCESS_ALLOWED,
  CURRENT_D8_RECORD_EQUALS_VALIDATED,
  CURRENT_REVIEW_EQUALS_ENGINEERING_VALIDATED,
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
  D8_ENGINEERING_VALIDATED_EQUALS_REGULATORY_APPROVED,
  D8_ENGINEERING_VALIDATED_STATE_SUPPORTED,
  D8_ENGINEERING_VALIDATION_AUTHORITY_REQUIRED,
  D8_ENGINEERING_VALIDATION_AUTHORITY_TRACEABLE,
  D8_EQUALS_D1_STRUCTURAL_AUTHORITY,
  D8_EQUALS_D2_CIVIL_AUTHORITY,
  D8_EQUALS_D3_GEOTECHNICAL_AUTHORITY,
  D8_EQUALS_D4_MECHANICAL_AUTHORITY,
  D8_EQUALS_D5_PIPING_AUTHORITY,
  D8_EQUALS_D6_PROCESS_AUTHORITY,
  D8_EQUALS_D7_ELECTRICAL_AUTHORITY,
  D8_EXPLICIT_LINEAGE_REQUIRED,
  D8_FINDING_CLOSURE_AUTHORITY_REQUIRED,
  D8_FINDING_CLOSURE_GOVERNANCE_IMPLEMENTED,
  D8_FUNCTIONAL_SAFETY_VALIDATION_RUNTIME_COUNT,
  D8_HANDOFF_VALIDATED_EQUALS_COUNTERPART_APPROVED,
  D8_HANDOFF_VALIDATED_EQUALS_COUNTERPART_CONFORMANT,
  D8_HANDOFF_VALIDATED_EQUALS_COUNTERPART_ENGINEERING_VALIDATED,
  D8_INFERRED_LINEAGE_ALLOWED,
  D8_INSTRUMENT_DEVICE_CONTEXT_RUNTIME_READY,
  D8_INSTRUMENT_SELECTION_RUNTIME_COUNT,
  D8_INSTRUMENT_SIZING_RUNTIME_COUNT,
  D8_INSTRUMENTATION_CONTROL_IDENTITY_RUNTIME_READY,
  D8_PROCESS_MEASUREMENT_TAG_RUNTIME_READY,
  D8_R10_CANONICAL_PHASE,
  D8_R10_PHASE_TYPE,
  D8_R10_STARTED,
  D8_R1_R8_EXACT_REVISIONS_REUSED,
  D8_R8_RUNTIME_COUNT,
  D8_R9_AUTO_MUTATES_D1_STRUCTURAL,
  D8_R9_AUTO_MUTATES_D2_CIVIL,
  D8_R9_AUTO_MUTATES_D3_GEOTECHNICAL,
  D8_R9_AUTO_MUTATES_D4_MECHANICAL,
  D8_R9_AUTO_MUTATES_D5_PIPING,
  D8_R9_AUTO_MUTATES_D6_PROCESS,
  D8_R9_AUTO_MUTATES_D7_ELECTRICAL,
  D8_R9_AUTO_MUTATES_R1_IDENTITY,
  D8_R9_AUTO_MUTATES_R2_MEASUREMENT_TAG_CONTEXT,
  D8_R9_AUTO_MUTATES_R3_INSTRUMENT_DEVICE_CONTEXT,
  D8_R9_AUTO_MUTATES_R4_SIGNAL_IO_LOOP_CONTEXT,
  D8_R9_AUTO_MUTATES_R5_CONTROL_SYSTEM_CONTEXT,
  D8_R9_AUTO_MUTATES_R6_SAFETY_CONTEXT,
  D8_R9_AUTO_MUTATES_R7_CHANGE_GOVERNANCE,
  D8_R9_APPLICABILITY_EXPLICIT,
  D8_R9_AUTO_MUTATES_R8_INTERFACE_HANDOFF,
  D8_R9_AUTO_PROPAGATED_OUTSIDE_APPLICABILITY,
  D8_R9_AUTO_VALIDATES_D1_STRUCTURAL,
  D8_R9_AUTO_VALIDATES_D2_CIVIL,
  D8_R9_AUTO_VALIDATES_D3_GEOTECHNICAL,
  D8_R9_AUTO_VALIDATES_D4_MECHANICAL,
  D8_R9_AUTO_VALIDATES_D5_PIPING,
  D8_R9_AUTO_VALIDATES_D6_PROCESS,
  D8_R9_AUTO_VALIDATES_D7_ELECTRICAL,
  D8_R9_CAN_REFERENCE_R7_ENGINEERING_DECISION,
  D8_R9_CAN_REVIEW_R6_SAFETY_CONTEXT,
  D8_R9_CAN_REVIEW_R8_HANDOFF,
  D8_R9_DUPLICATE_GOVERNANCE_IMPLEMENTED,
  D8_R9_EVIDENCE_PROVENANCE_PRESERVED,
  D8_R9_EVIDENCE_PROVENANCE_REQUIRED,
  D8_R9_HISTORY_PRESERVED,
  D8_R9_HISTORICAL_REFERENCE_AUTO_REPOINTED,
  D8_R9_LIMITATIONS_EXPLICIT,
  D8_R9_MATURITY,
  D8_R9_PERFORMS_AUTOMATIC_ENGINEERING_VALIDATION,
  D8_R9_PERFORMS_FUNCTIONAL_SAFETY_VALIDATION,
  D8_R9_PERFORMS_PFD_CALCULATION,
  D8_R9_PERFORMS_PFH_CALCULATION,
  D8_R9_PERFORMS_SIL_CALCULATION,
  D8_R9_PERFORMS_SIL_VERIFICATION,
  D8_R9_R7_CHANGE_INTEGRATION_IMPLEMENTED,
  D8_R9_R7_REASSESSMENT_INTEGRATION_IMPLEMENTED,
  D8_R9_REPLAY_PROTECTION_IMPLEMENTED,
  D8_R9_REVIEW_AUTO_RECONFIGURES_CONTROL_SYSTEM,
  D8_R9_REVIEW_AUTO_REDESIGNS_IAC,
  D8_R9_REVIEW_AUTO_RETUNES_CONTROL_LOOP,
  D8_R9_REVIEW_AUTO_REWRITES_LOGIC,
  D8_R9_SOURCE_BASIS_REQUIRED,
  D8_R9_SOURCE_BASIS_TRACEABLE,
  D8_R9_SPOOFING_PROTECTION_IMPLEMENTED,
  D8_R9_STATUS,
  D8_R9_SUBJECT_AUTO_REPOINTED,
  D8_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY,
  D8_REUSES_CANONICAL_CURRENTNESS,
  D8_REUSES_CANONICAL_DIGITAL_THREAD,
  D8_REUSES_CANONICAL_FINGERPRINT,
  D8_REUSES_CANONICAL_REVIEW_GOVERNANCE,
  D8_REUSES_CANONICAL_VALIDATION_GOVERNANCE,
  D8_REVIEW_COMPLETION_CONTEXT_IMPLEMENTED,
  D8_REVIEW_COMPLETED_EQUALS_REGULATORY_APPROVED,
  D8_REVIEW_CURRENTNESS_INTEGRATED,
  D8_REVIEW_FINDING_CONTEXT_IMPLEMENTED,
  D8_REVIEW_REQUEST_CONTEXT_IMPLEMENTED,
  D8_REVIEW_SCOPE_EXPLICIT,
  D8_REVIEW_SCOPE_LIMITATIONS_EXPLICIT,
  D8_REVIEW_VALIDATION_RUNTIME_COUNT,
  D8_REVIEW_VALIDATION_RUNTIME_IMPLEMENTED,
  D8_REVIEW_VALIDATION_RUNTIME_READY,
  D8_REVIEWER_ASSIGNMENT_EXPLICIT,
  D8_REVIEWER_ASSIGNMENT_IMPLEMENTED,
  D8_REVIEWER_AUTHORITY_REQUIRED,
  D8_REVIEWER_AUTHORITY_TRACEABLE,
  D8_RUNTIME_COUNT,
  D8_RUNTIME_STARTED,
  D8_SAFETY_INTERLOCK_SHUTDOWN_RUNTIME_READY,
  D8_SIGNAL_IO_CONTROL_LOOP_RUNTIME_READY,
  D8_SIL_CALCULATION_RUNTIME_COUNT,
  D8_SIL_VERIFICATION_RUNTIME_COUNT,
  D8_VALIDATED_STATE_AUTO_PROPAGATES_TO_NEW_REVISION,
  D8_VALIDATED_STATE_EXACT_REVISION_BOUND,
  D8_VALIDATION_CURRENTNESS_INTEGRATED,
  D8_VALIDATION_EVIDENCE_CONTEXT_IMPLEMENTED,
  D8_VALIDATION_EVIDENCE_REQUIRED_FOR_VALIDATED_STATE,
  D9_RUNTIME_COUNT,
  D9_RUNTIME_STARTED,
  DATABASE_SCHEMA_CHANGED,
  ENGINEERING_VALIDATED_EQUALS_APPROVED,
  ENGINEERING_VALIDATED_EQUALS_CERTIFIED,
  ENGINEERING_VALIDATED_EQUALS_CONFORMANT,
  ENGINEERING_VALIDATED_EQUALS_REGULATORY_APPROVED,
  EXACT_D8_R7_DECISION_REVISION_REQUIRED_WHEN_REFERENCED,
  EXACT_D8_R8_HANDOFF_REVISION_REQUIRED_FOR_REVIEW,
  EXACT_D8_R9_SUBJECT_REVISION_REQUIRED,
  EXACT_D8_REVIEW_SUBJECT_REVISION_REQUIRED,
  FINDING_ACCEPTED_EQUALS_APPROVED,
  FINDING_ACCEPTED_EQUALS_CERTIFIED,
  FINDING_ACCEPTED_EQUALS_CONFORMANT,
  FINDING_CLOSED_EQUALS_APPROVED,
  FINDING_CLOSED_EQUALS_CONFORMANT,
  FINDING_CLOSED_EQUALS_ENGINEERING_VALIDATED,
  FINDING_DISPOSITION_EQUALS_ENGINEERING_DECISION,
  FLOATING_D8_R9_SUBJECT_REFERENCE_ALLOWED,
  FLOATING_D8_REVIEW_SUBJECT_REVISION_ALLOWED,
  FUNCTIONAL_SAFETY_STANDARD_REFERENCE_EQUALS_COMPLIANCE,
  HANDOFF_FINDING_CLOSED_EQUALS_COUNTERPART_VALIDATED,
  HANDOFF_REVIEW_COMPLETED_EQUALS_COUNTERPART_VALIDATED,
  JURISDICTION_REFERENCE_EQUALS_REGULATORY_APPROVAL,
  NEW_DEPENDENCY_ADDED,
  NEW_REVISION_INHERITS_PRIOR_VALIDATION_AUTOMATICALLY,
  PARALLEL_D8_CURRENTNESS_ENGINE_CREATED,
  PARALLEL_D8_DIGITAL_THREAD_CREATED,
  PARALLEL_D8_REVIEW_ENGINE_CREATED,
  PARALLEL_D8_VALIDATION_ENGINE_CREATED,
  REASSESSMENT_COMPLETED_EQUALS_ENGINEERING_VALIDATED,
  REASSESSMENT_REQUIRED_EQUALS_VALIDATION_FAILED,
  REVIEW_ASSIGNED_EQUALS_ENGINEERING_VALIDATED,
  REVIEW_ASSIGNED_EQUALS_REVIEW_COMPLETED,
  REVIEW_COMPLETED_EQUALS_APPROVED,
  REVIEW_COMPLETED_EQUALS_CERTIFIED,
  REVIEW_COMPLETED_EQUALS_CONFORMANT,
  REVIEW_COMPLETED_EQUALS_ENGINEERING_VALIDATED,
  REVIEW_FINDING_EQUALS_DESIGN_CHANGE,
  REVIEW_FINDING_EQUALS_ENGINEERING_DECISION,
  REVIEW_REQUESTED_EQUALS_ENGINEERING_VALIDATED,
  REVIEW_REQUESTED_EQUALS_REVIEW_COMPLETED,
  REVIEWED_SIF_CONTEXT_EQUALS_SIF_VALIDATED,
  REVIEWED_SIL_REQUIREMENT_EQUALS_SIL_VERIFIED,
  SECOND_D8_FINGERPRINT_ALGORITHM_CREATED,
  SILENT_D8_R9_MUTATION_ALLOWED,
  STALE_D8_RECORD_EQUALS_INVALID,
  STALE_REVIEW_EQUALS_INVALID,
  STANDARD_REFERENCE_EQUALS_CONFORMANCE,
  SUPERSEDED_D8_RECORD_EQUALS_INVALID,
  TENANT_WORKSPACE_PROJECT_D8_R9_SCOPE_ENFORCED,
  approveIacFromValidation,
  automaticallyValidateIacEngineering,
  certifyIacFromValidation,
  closeIacFindingAsValidated,
  closeIacReassessmentAsValidated,
  createD8R9Store,
  determineIacConformanceFromValidation,
  promoteIacFindingToDecision,
  recordIacFindingDisposition,
  recordIacReviewCompletion,
  recordIacReviewFinding,
  recordIacReviewRequest,
  recordIacReviewerAssignment,
  recordIacValidationState,
  redesignIacFromReview,
  repointIacReview,
  transferIacValidation,
  validateIacCounterpartFromReview,
} from "./review-validation-governance";
import { createD8R6Store, recordIacSafetyContext } from "./safety-interlock-shutdown-context";

const here = dirname(fileURLToPath(import.meta.url));

function actor(overrides: Partial<D8R1Actor> = {}): D8R1Actor {
  return { actorId: "iac-recorder", tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a", authority: D8_CONTEXT_AUTHORITY, ...overrides };
}

function identity(id: string) {
  return { citedLifecycleStage: "FEED" as const, provenanceRef: `prov-${id}`, sourceBasisRef: `basis-${id}`, applicability: `${id} identity scope`, limitations: "identity only" };
}

describe("EOS-D8-R9 review and validation governance", () => {
  it("records exact-revision review without promoting it to validation or counterpart truth", () => {
    expect(D8_R1_R8_EXACT_REVISIONS_REUSED && EXACT_D8_R9_SUBJECT_REVISION_REQUIRED && EXACT_D8_REVIEW_SUBJECT_REVISION_REQUIRED && EXACT_D8_R8_HANDOFF_REVISION_REQUIRED_FOR_REVIEW && EXACT_D8_R7_DECISION_REVISION_REQUIRED_WHEN_REFERENCED).toBe(true);
    expect(FLOATING_D8_R9_SUBJECT_REFERENCE_ALLOWED || FLOATING_D8_REVIEW_SUBJECT_REVISION_ALLOWED || D8_R9_SUBJECT_AUTO_REPOINTED).toBe(false);
    expect(D8_RUNTIME_STARTED).toBe(true);
    expect(D8_RUNTIME_COUNT).toBe(9);
    expect(D8_R8_RUNTIME_COUNT).toBe(8);
    expect(R8_RUNTIME_COUNT).toBe(8);
    expect(ARCHITECTURE_RUNTIME_COUNT).toBe(0);
    expect(ARCHITECTURE_REVIEW_COUNT).toBe(0);
    expect(D8_REVIEW_VALIDATION_RUNTIME_IMPLEMENTED && D8_REVIEW_VALIDATION_RUNTIME_READY).toBe(true);
    expect(D8_REVIEW_VALIDATION_RUNTIME_COUNT).toBe(1);
    expect(D8_INSTRUMENTATION_CONTROL_IDENTITY_RUNTIME_READY && D8_PROCESS_MEASUREMENT_TAG_RUNTIME_READY && D8_INSTRUMENT_DEVICE_CONTEXT_RUNTIME_READY && D8_SIGNAL_IO_CONTROL_LOOP_RUNTIME_READY && D8_CONTROL_SYSTEM_ARCHITECTURE_RUNTIME_READY && D8_SAFETY_INTERLOCK_SHUTDOWN_RUNTIME_READY && D8_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY && D8_DISCIPLINE_INTERFACE_RUNTIME_READY).toBe(true);
    expect(D8_REUSES_CANONICAL_REVIEW_GOVERNANCE && D8_REUSES_CANONICAL_VALIDATION_GOVERNANCE).toBe(true);
    expect(PARALLEL_D8_REVIEW_ENGINE_CREATED || PARALLEL_D8_VALIDATION_ENGINE_CREATED).toBe(false);
    expect(D8_REVIEW_REQUEST_CONTEXT_IMPLEMENTED && D8_REVIEWER_ASSIGNMENT_IMPLEMENTED && D8_REVIEWER_ASSIGNMENT_EXPLICIT && D8_REVIEWER_AUTHORITY_REQUIRED && D8_REVIEWER_AUTHORITY_TRACEABLE).toBe(true);
    expect(REVIEW_REQUESTED_EQUALS_REVIEW_COMPLETED || REVIEW_REQUESTED_EQUALS_ENGINEERING_VALIDATED || REVIEW_ASSIGNED_EQUALS_REVIEW_COMPLETED || REVIEW_ASSIGNED_EQUALS_ENGINEERING_VALIDATED).toBe(false);
    expect(AI_EQUALS_D8_REVIEWER_AUTHORITY || ADMIN_EQUALS_D8_ENGINEERING_REVIEW_AUTHORITY).toBe(false);
    expect(D8_REVIEW_SCOPE_EXPLICIT && D8_REVIEW_SCOPE_LIMITATIONS_EXPLICIT && D8_REVIEW_COMPLETION_CONTEXT_IMPLEMENTED && D8_REVIEW_FINDING_CONTEXT_IMPLEMENTED).toBe(true);
    expect(REVIEW_COMPLETED_EQUALS_ENGINEERING_VALIDATED || REVIEW_COMPLETED_EQUALS_APPROVED || REVIEW_COMPLETED_EQUALS_CONFORMANT || REVIEW_COMPLETED_EQUALS_CERTIFIED || D8_REVIEW_COMPLETED_EQUALS_REGULATORY_APPROVED).toBe(false);
    expect(D8_FINDING_CLOSURE_GOVERNANCE_IMPLEMENTED && D8_FINDING_CLOSURE_AUTHORITY_REQUIRED).toBe(true);
    expect(FINDING_CLOSED_EQUALS_ENGINEERING_VALIDATED || FINDING_CLOSED_EQUALS_APPROVED || FINDING_CLOSED_EQUALS_CONFORMANT || FINDING_ACCEPTED_EQUALS_APPROVED || FINDING_ACCEPTED_EQUALS_CONFORMANT || FINDING_ACCEPTED_EQUALS_CERTIFIED).toBe(false);
    expect(D8_VALIDATION_EVIDENCE_CONTEXT_IMPLEMENTED && D8_VALIDATION_EVIDENCE_REQUIRED_FOR_VALIDATED_STATE && D8_ENGINEERING_VALIDATION_AUTHORITY_REQUIRED && D8_ENGINEERING_VALIDATION_AUTHORITY_TRACEABLE && D8_ENGINEERING_VALIDATED_STATE_SUPPORTED && D8_VALIDATED_STATE_EXACT_REVISION_BOUND).toBe(true);
    expect(AI_EQUALS_D8_ENGINEERING_VALIDATION_AUTHORITY || ADMIN_EQUALS_D8_ENGINEERING_VALIDATION_AUTHORITY || ENGINEERING_VALIDATED_EQUALS_CONFORMANT || ENGINEERING_VALIDATED_EQUALS_APPROVED || ENGINEERING_VALIDATED_EQUALS_CERTIFIED || ENGINEERING_VALIDATED_EQUALS_REGULATORY_APPROVED || D8_ENGINEERING_VALIDATED_EQUALS_REGULATORY_APPROVED).toBe(false);
    expect(D8_VALIDATED_STATE_AUTO_PROPAGATES_TO_NEW_REVISION || NEW_REVISION_INHERITS_PRIOR_VALIDATION_AUTOMATICALLY).toBe(false);
    expect(D8_R9_R7_CHANGE_INTEGRATION_IMPLEMENTED && D8_R9_R7_REASSESSMENT_INTEGRATION_IMPLEMENTED && D8_R9_CAN_REVIEW_R8_HANDOFF && D8_R9_CAN_REVIEW_R6_SAFETY_CONTEXT && D8_R9_CAN_REFERENCE_R7_ENGINEERING_DECISION).toBe(true);
    expect(REASSESSMENT_REQUIRED_EQUALS_VALIDATION_FAILED || REASSESSMENT_COMPLETED_EQUALS_ENGINEERING_VALIDATED || HANDOFF_REVIEW_COMPLETED_EQUALS_COUNTERPART_VALIDATED || HANDOFF_FINDING_CLOSED_EQUALS_COUNTERPART_VALIDATED).toBe(false);
    expect(D8_HANDOFF_VALIDATED_EQUALS_COUNTERPART_ENGINEERING_VALIDATED || D8_HANDOFF_VALIDATED_EQUALS_COUNTERPART_APPROVED || D8_HANDOFF_VALIDATED_EQUALS_COUNTERPART_CONFORMANT).toBe(false);
    expect(D8_R9_AUTO_VALIDATES_D1_STRUCTURAL || D8_R9_AUTO_VALIDATES_D2_CIVIL || D8_R9_AUTO_VALIDATES_D3_GEOTECHNICAL || D8_R9_AUTO_VALIDATES_D4_MECHANICAL || D8_R9_AUTO_VALIDATES_D5_PIPING || D8_R9_AUTO_VALIDATES_D6_PROCESS || D8_R9_AUTO_VALIDATES_D7_ELECTRICAL).toBe(false);
    expect(D8_R9_AUTO_MUTATES_D1_STRUCTURAL || D8_R9_AUTO_MUTATES_D2_CIVIL || D8_R9_AUTO_MUTATES_D3_GEOTECHNICAL || D8_R9_AUTO_MUTATES_D4_MECHANICAL || D8_R9_AUTO_MUTATES_D5_PIPING || D8_R9_AUTO_MUTATES_D6_PROCESS || D8_R9_AUTO_MUTATES_D7_ELECTRICAL).toBe(false);
    expect(D8_R9_AUTO_MUTATES_R1_IDENTITY || D8_R9_AUTO_MUTATES_R2_MEASUREMENT_TAG_CONTEXT || D8_R9_AUTO_MUTATES_R3_INSTRUMENT_DEVICE_CONTEXT || D8_R9_AUTO_MUTATES_R4_SIGNAL_IO_LOOP_CONTEXT || D8_R9_AUTO_MUTATES_R5_CONTROL_SYSTEM_CONTEXT || D8_R9_AUTO_MUTATES_R6_SAFETY_CONTEXT || D8_R9_AUTO_MUTATES_R7_CHANGE_GOVERNANCE || D8_R9_AUTO_MUTATES_R8_INTERFACE_HANDOFF).toBe(false);
    expect(D8_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT).toBe(0);
    expect(D8_R9_PERFORMS_AUTOMATIC_ENGINEERING_VALIDATION || AI_CAN_MARK_D8_ENGINEERING_VALIDATED || AI_CAN_CLOSE_REVIEW_AS_ENGINEERING_VALIDATED || AI_CAN_PROMOTE_FINDING_CLOSURE_TO_VALIDATION || ADMIN_CAN_MARK_D8_ENGINEERING_VALIDATED_WITHOUT_AUTHORITY || ADMIN_CAN_PROMOTE_REVIEW_COMPLETION_TO_VALIDATION).toBe(false);
    expect(D8_CONFORMANCE_DETERMINATION_RUNTIME_COUNT + D8_APPROVAL_RUNTIME_COUNT + D8_CERTIFICATION_RUNTIME_COUNT).toBe(0);
    expect(STANDARD_REFERENCE_EQUALS_CONFORMANCE || JURISDICTION_REFERENCE_EQUALS_REGULATORY_APPROVAL || FUNCTIONAL_SAFETY_STANDARD_REFERENCE_EQUALS_COMPLIANCE || D8_R9_PERFORMS_FUNCTIONAL_SAFETY_VALIDATION || REVIEWED_SIF_CONTEXT_EQUALS_SIF_VALIDATED || REVIEWED_SIL_REQUIREMENT_EQUALS_SIL_VERIFIED).toBe(false);
    expect(D8_R9_PERFORMS_SIL_CALCULATION || D8_R9_PERFORMS_SIL_VERIFICATION || D8_R9_PERFORMS_PFD_CALCULATION || D8_R9_PERFORMS_PFH_CALCULATION).toBe(false);
    expect(D8_R9_REVIEW_AUTO_REDESIGNS_IAC || D8_R9_REVIEW_AUTO_RECONFIGURES_CONTROL_SYSTEM || D8_R9_REVIEW_AUTO_RETUNES_CONTROL_LOOP || D8_R9_REVIEW_AUTO_REWRITES_LOGIC || REVIEW_FINDING_EQUALS_DESIGN_CHANGE || REVIEW_FINDING_EQUALS_ENGINEERING_DECISION || FINDING_DISPOSITION_EQUALS_ENGINEERING_DECISION).toBe(false);
    expect(D8_R9_SOURCE_BASIS_REQUIRED && D8_R9_SOURCE_BASIS_TRACEABLE && D8_R9_EVIDENCE_PROVENANCE_REQUIRED && D8_R9_EVIDENCE_PROVENANCE_PRESERVED && D8_R9_APPLICABILITY_EXPLICIT && D8_R9_LIMITATIONS_EXPLICIT && TENANT_WORKSPACE_PROJECT_D8_R9_SCOPE_ENFORCED).toBe(true);
    expect(D8_R9_AUTO_PROPAGATED_OUTSIDE_APPLICABILITY || CROSS_TENANT_D8_R9_ACCESS_ALLOWED).toBe(false);
    expect(D8_REUSES_CANONICAL_CURRENTNESS && D8_REUSES_CANONICAL_DIGITAL_THREAD && D8_REUSES_CANONICAL_FINGERPRINT && D8_EXPLICIT_LINEAGE_REQUIRED && D8_REVIEW_CURRENTNESS_INTEGRATED && D8_VALIDATION_CURRENTNESS_INTEGRATED && D8_R9_HISTORY_PRESERVED).toBe(true);
    expect(PARALLEL_D8_CURRENTNESS_ENGINE_CREATED || PARALLEL_D8_DIGITAL_THREAD_CREATED || SECOND_D8_FINGERPRINT_ALGORITHM_CREATED || D8_INFERRED_LINEAGE_ALLOWED || CURRENT_D8_RECORD_EQUALS_VALIDATED || STALE_D8_RECORD_EQUALS_INVALID || SUPERSEDED_D8_RECORD_EQUALS_INVALID || CURRENT_REVIEW_EQUALS_ENGINEERING_VALIDATED || STALE_REVIEW_EQUALS_INVALID || D8_R9_HISTORICAL_REFERENCE_AUTO_REPOINTED || SILENT_D8_R9_MUTATION_ALLOWED).toBe(false);
    expect(D8_EQUALS_D1_STRUCTURAL_AUTHORITY || D8_EQUALS_D2_CIVIL_AUTHORITY || D8_EQUALS_D3_GEOTECHNICAL_AUTHORITY || D8_EQUALS_D4_MECHANICAL_AUTHORITY || D8_EQUALS_D5_PIPING_AUTHORITY || D8_EQUALS_D6_PROCESS_AUTHORITY || D8_EQUALS_D7_ELECTRICAL_AUTHORITY || AI_EQUALS_D8_IAC_ENGINEERING_AUTHORITY || ADMIN_EQUALS_D8_IAC_ENGINEERING_AUTHORITY || AI_CAN_COMPLETE_D8_ENGINEERING_REVIEW_AS_HUMAN || AI_CAN_PROMOTE_VALIDATION_TO_APPROVAL || ADMIN_CAN_PROMOTE_D8_VALIDATION_TO_APPROVAL).toBe(false);
    expect([D8_INSTRUMENT_SIZING_RUNTIME_COUNT, D8_INSTRUMENT_SELECTION_RUNTIME_COUNT, D8_CONTROL_VALVE_SIZING_RUNTIME_COUNT, D8_ACTUATOR_SIZING_RUNTIME_COUNT, D8_CONTROL_LOOP_TUNING_RUNTIME_COUNT, D8_SIL_CALCULATION_RUNTIME_COUNT, D8_SIL_VERIFICATION_RUNTIME_COUNT, D8_FUNCTIONAL_SAFETY_VALIDATION_RUNTIME_COUNT, D8_CONTROL_LOGIC_DESIGN_RUNTIME_COUNT, D8_AUTOMATIC_CONTROL_LOGIC_GENERATION_RUNTIME_COUNT, D8_AUTOMATIC_IAC_DESIGN_RUNTIME_COUNT, D8_AUTOMATIC_IAC_REDESIGN_RUNTIME_COUNT, D8_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT, D8_CONFORMANCE_DETERMINATION_RUNTIME_COUNT, D8_APPROVAL_RUNTIME_COUNT, D8_CERTIFICATION_RUNTIME_COUNT, D8_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT, D8_D9_SOURCE_CONTRACT_RUNTIME_COUNT, D8_D9_RUNTIME_INTEGRATION_COUNT, D8_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT, D8_CROSS_DISCIPLINE_CONFLICT_DETECTION_RUNTIME_COUNT, D8_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT, D8_CROSS_DISCIPLINE_RECOMMENDATION_RUNTIME_COUNT, D9_RUNTIME_COUNT]).toEqual(Array(24).fill(0));
    expect(D9_RUNTIME_STARTED || DATABASE_SCHEMA_CHANGED || NEW_DEPENDENCY_ADDED || D8_R10_STARTED).toBe(false);
    expect(D8_CANONICAL_MILESTONE_COUNT).toBe(13);
    expect(D8_R9_STATUS).toBe("REVIEW_AND_VALIDATION_GOVERNANCE_IMPLEMENTED");
    expect(D8_R9_MATURITY).toBe(D8_R9_STATUS);
    expect(D8_R10_CANONICAL_PHASE).toBe("EOS-D8-R10-CURRENTNESS-AND-DIGITAL-THREAD");
    expect(D8_R10_PHASE_TYPE).toBe("CURRENTNESS_AND_DIGITAL_THREAD");

    const r1 = createD8R1Store();
    const who = actor();
    const reviewer = { ...actor({ actorId: "iac-reviewer", authority: "REVIEWER" }), actorKind: "human" as const, aal: "aal2" };
    const validator = { ...actor({ actorId: "iac-validator", authority: "IAC_VALIDATION_AUTHORITY" }), actorKind: "human" as const, aal: "aal2" };
    recordIacContext(r1, who, { contextId: "ctx-1", ...identity("ctx") });
    const face = recordIacObjectIdentity(r1, who, { objectId: "ifc-101", contextId: "ctx-1", objectType: "IAC_INTERFACE", ...identity("ifc-101") });
    const interlockObject = recordIacObjectIdentity(r1, who, { objectId: "ilk-101", contextId: "ctx-1", objectType: "IAC_INTERLOCK_CONTEXT", ...identity("ilk-101") });
    const r7 = createD8R7Store(createD8R6Store(createD8R5Store(createD8R4Store(createD8R3Store(createD8R2Store(r1))))));
    const safety = recordIacSafetyContext(r7.r6, who, { contextId: "ctx-1", objectId: interlockObject.objectId, objectRevisionFingerprint: interlockObject.fingerprint, contextRecordId: "ilk-rec-1", kind: "INTERLOCK", citedLifecycleStage: "FEED", citedCurrentness: "CURRENT", provenanceRef: "prov-ilk", sourceBasisRef: "basis-ilk", applicability: "ilk-101 interlock context", limitations: "context only" });
    const governed = { contextId: "ctx-1", objectId: face.objectId, objectRevisionFingerprint: face.fingerprint, citedLifecycleStage: "FEED", citedCurrentness: "CURRENT", provenanceRef: "prov-ifc", sourceBasisRef: "basis-ifc", applicability: "ifc-101 handoff scope", limitations: "handoff is not counterpart design" };
    const decision = recordIacEngineeringDecision(r7, who, { ...governed, decisionId: "dec-ifc-1", statement: "Keep the supplied interface context", alternatives: [{ id: "alt-a", statement: "Retain the supplied interface text", is_selected: true }, { id: "alt-b", statement: "Leave a later human review", is_selected: false }] });
    const counterparts = [{ discipline: "process" as const, counterpartId: "d6-meas-1", sourceRevision: "rev-d6-1", fingerprint: "fp-d6-1", tenantId: "tenant-a", recordStatus: "CURRENT" as const }];
    const handoffs = createD8R8Store(r7, counterparts);
    const handoff = recordIacInterfaceHandoff(handoffs, who, { ...governed, handoffId: "hof-d6", direction: "D8_TO_COUNTERPART", suppliedContent: "supplied interface content", handoffStatus: "COMPLETE", counterpartDiscipline: "process", interfaceTopic: "PROCESS_MEASUREMENT_REQUIREMENT", counterpartId: "d6-meas-1", counterpartRevision: "rev-d6-1", counterpartFingerprint: "fp-d6-1", dependencies: [{ targetKind: "R1_OBJECT", targetId: face.objectId, targetFingerprint: face.fingerprint }] });
    const before = JSON.stringify({ objects: r1.objects, handoffs: handoffs.handoffs, decisions: r7.decisions, contexts: r7.r6.contexts });
    const store = createD8R9Store(handoffs);
    const scope = { tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a", citedLifecycleStage: "FEED", citedCurrentness: "CURRENT", provenanceRef: "prov-review", sourceBasisRef: "basis-review", limitations: "review is not validation" };
    const objectChain = { ...scope, contextId: "ctx-1", objectId: face.objectId, objectRevisionFingerprint: face.fingerprint, subjectKind: "OBJECT", subjectId: face.objectId, subjectRevision: face.provenanceRef, subjectFingerprint: face.fingerprint, applicability: "ifc-101 review scope", reviewScope: "ifc-101 subject review" };
    const request = recordIacReviewRequest(store, who, { ...objectChain, reviewRequestId: "rev-req-1", reviewType: "IAC_SUBJECT_REVIEW", decisionId: decision.decisionId, decisionFingerprint: decision.fingerprint, standardReference: "IEC 61511" });
    const assignment = recordIacReviewerAssignment(store, who, { ...objectChain, assignmentId: "rev-asg-1", reviewRequestId: request.reviewRequestId, reviewerId: reviewer.actorId, reviewerAuthority: "REVIEWER" });
    const finding = recordIacReviewFinding(store, reviewer, { ...objectChain, findingId: "rev-fnd-1", reviewRequestId: request.reviewRequestId, findingCategory: "OBSERVATION", severity: "REVIEW_CANDIDATE", findingText: "Supplied interface text needs a human check", disposition: "OPEN", evidenceRef: "evidence-note-1", decisionId: decision.decisionId, decisionFingerprint: decision.fingerprint });
    const closed = recordIacFindingDisposition(store, reviewer, { ...objectChain, dispositionId: "rev-dsp-1", findingId: finding.findingId, disposition: "NOTED", findingAccepted: true });
    const completion = recordIacReviewCompletion(store, reviewer, { ...objectChain, completionId: "rev-cmp-1", reviewRequestId: request.reviewRequestId });
    const validated = recordIacValidationState(store, validator, { ...objectChain, validationId: "rev-val-1", validationState: "VALIDATED", validationScope: "ifc-101 validation scope", basis: [{ kind: "R1_OBJECT", id: face.objectId, fingerprint: face.fingerprint }], reviewRequestId: request.reviewRequestId, standardReference: "IEC 61511", jurisdictionReference: "project jurisdiction note" });
    const handoffChain = { ...scope, contextId: "ctx-1", objectId: face.objectId, objectRevisionFingerprint: face.fingerprint, subjectKind: "HANDOFF", subjectId: handoff.handoffId, subjectRevision: handoff.provenanceRef, subjectFingerprint: handoff.fingerprint, applicability: "ifc-101 handoff review scope", reviewScope: "hof-d6 handoff review" };
    const handoffRequest = recordIacReviewRequest(store, who, { ...handoffChain, reviewRequestId: "rev-req-hof", reviewType: "INTERFACE_HANDOFF_REVIEW" });
    recordIacReviewerAssignment(store, who, { ...handoffChain, assignmentId: "rev-asg-hof", reviewRequestId: handoffRequest.reviewRequestId, reviewerId: reviewer.actorId, reviewerAuthority: "REVIEWER" });
    const handoffCompletion = recordIacReviewCompletion(store, reviewer, { ...handoffChain, completionId: "rev-cmp-hof", reviewRequestId: handoffRequest.reviewRequestId });
    const handoffValidation = recordIacValidationState(store, validator, { ...handoffChain, validationId: "rev-val-hof", validationState: "VALIDATED", validationScope: "hof-d6 validation scope", basis: [{ kind: "R8_HANDOFF", id: handoff.handoffId, fingerprint: handoff.fingerprint }] });
    const safetyChain = { ...scope, contextId: "ctx-1", objectId: interlockObject.objectId, objectRevisionFingerprint: interlockObject.fingerprint, subjectKind: "SAFETY", subjectId: safety.contextRecordId, subjectRevision: safety.provenanceRef, subjectFingerprint: safety.fingerprint, applicability: "ilk-101 safety review scope", reviewScope: "ilk-rec-1 safety review" };
    const safetyRequest = recordIacReviewRequest(store, who, { ...safetyChain, reviewRequestId: "rev-req-sif", reviewType: "SAFETY_CONTEXT_REVIEW", standardReference: "IEC 61511" });
    recordIacReviewerAssignment(store, who, { ...safetyChain, assignmentId: "rev-asg-sif", reviewRequestId: safetyRequest.reviewRequestId, reviewerId: reviewer.actorId, reviewerAuthority: "REVIEWER" });
    const safetyCompletion = recordIacReviewCompletion(store, reviewer, { ...safetyChain, completionId: "rev-cmp-sif", reviewRequestId: safetyRequest.reviewRequestId });
    const change = recordIacChange(r7, who, { ...governed, changeId: "chg-ifc-1", changeCategory: "REQUIREMENT_CHANGED", reason: "Supplied interface source text was revised", priorRevisionFingerprint: face.fingerprint, currentRevisionFingerprint: face.fingerprint, dependencies: [{ targetKind: "R1_OBJECT", targetId: face.objectId, targetFingerprint: face.fingerprint }] });
    const reassessment = recordIacReassessment(r7, who, { ...governed, reassessmentId: "ras-ifc-1", changeId: change.changeId, targetKind: "R1_OBJECT", targetId: face.objectId, targetFingerprint: face.fingerprint, state: "REASSESSMENT_REQUIRED" });
    const reassessed = recordIacValidationState(store, validator, { ...objectChain, validationId: "rev-val-ras", validationState: "REASSESSMENT_REQUIRED", citedCurrentness: "REASSESSMENT_REQUIRED", validationScope: "ifc-101 reassessment scope", changeId: change.changeId, changeFingerprint: change.fingerprint, reassessmentId: reassessment.reassessmentId, reassessmentFingerprint: reassessment.fingerprint });

    expect(request.reviewCompleted || request.engineeringValidated || request.approved || request.standardEqualsConformance).toBe(false);
    expect(request.requestStatus).toBe("REQUESTED");
    expect(request.decisionId).toBe(decision.decisionId);
    expect(request.decisionFingerprint).toBe(decision.fingerprint);
    expect(request.engineeringDecision).toBe(false);
    expect(assignment.reviewAssigned).toBe(true);
    expect(assignment.reviewCompleted || assignment.engineeringValidated).toBe(false);
    expect(assignment.reviewerId).toBe(reviewer.actorId);
    expect(finding.engineeringValidated || finding.engineeringDecision || finding.designChange).toBe(false);
    expect(closed.findingClosed).toBe(true);
    expect(closed.findingAccepted).toBe(true);
    expect(closed.engineeringValidated || closed.approved || closed.conformant || closed.certified || closed.counterpartValidated).toBe(false);
    expect(completion.reviewCompleted).toBe(true);
    expect(completion.engineeringValidated || completion.approved || completion.conformant || completion.certified || completion.regulatoryApproved).toBe(false);
    expect(request.reviewCompleted).toBe(false);
    expect(validated.engineeringValidated).toBe(true);
    expect(validated.validationAuthority).toBe("IAC_VALIDATION_AUTHORITY");
    expect(validated.validatorId).toBe(validator.actorId);
    expect(validated.basis[0].fingerprint).toBe(face.fingerprint);
    expect(validated.conformant || validated.approved || validated.certified || validated.regulatoryApproved || validated.standardEqualsConformance || validated.jurisdictionEqualsApproval).toBe(false);
    expect(validated.subjectFingerprint).toBe(face.fingerprint);
    expect(handoffCompletion.reviewCompleted).toBe(true);
    expect(handoffCompletion.counterpartValidated || handoffCompletion.engineeringValidated).toBe(false);
    expect(handoffValidation.engineeringValidated).toBe(true);
    expect(handoffValidation.counterpartValidated || handoffValidation.counterpartApproved || handoffValidation.counterpartConformant).toBe(false);
    expect(handoffs.handoffs[0].fingerprint).toBe(handoff.fingerprint);
    expect(handoffs.handoffs[0].counterpartValidated).toBe(false);
    expect(safetyCompletion.reviewCompleted).toBe(true);
    expect(safetyCompletion.engineeringValidated || safetyCompletion.sifValidated || safetyCompletion.silVerified || safetyCompletion.functionalSafetyCompliance).toBe(false);
    expect(reassessed.validationState).toBe("REASSESSMENT_REQUIRED");
    expect(reassessed.engineeringValidated).toBe(false);
    expect(reassessment.validated).toBe(false);
    expect(store.validations.find((row) => row.validationId === validated.validationId)?.subjectFingerprint).toBe(face.fingerprint);
    expect(store.validations.find((row) => row.validationId === validated.validationId)?.engineeringValidated).toBe(true);
    expect(r7.changes).toHaveLength(1);
    expect(r7.decisions[0].fingerprint).toBe(decision.fingerprint);
    expect(JSON.stringify({ objects: r1.objects, handoffs: handoffs.handoffs, decisions: r7.decisions, contexts: r7.r6.contexts })).toBe(before);
    const replay = recordIacReviewRequest(store, who, { ...objectChain, reviewRequestId: "rev-req-1", reviewType: "IAC_SUBJECT_REVIEW", decisionId: decision.decisionId, decisionFingerprint: decision.fingerprint, standardReference: "IEC 61511" });
    expect(replay.fingerprint).toBe(request.fingerprint);

    expect(() => recordIacReviewRequest(store, who, { ...objectChain, reviewRequestId: "rev-dup", reviewType: "IAC_SUBJECT_REVIEW" })).toThrow(/DUPLICATE_REVIEW_REQUEST_REJECTED/);
    expect(() => recordIacReviewRequest(store, who, { ...objectChain, reviewRequestId: "rev-float", reviewType: "IAC_SUBJECT_REVIEW", objectRevisionFingerprint: "latest" })).toThrow(/R1_REVISION_REQUIRED/);
    expect(() => recordIacReviewRequest(store, who, { ...objectChain, reviewRequestId: "rev-done", reviewType: "IAC_SUBJECT_REVIEW", reviewCompleted: true })).toThrow(/REVIEW_REQUEST_NOT_COMPLETION/);
    expect(() => recordIacReviewerAssignment(store, who, { ...objectChain, assignmentId: "rev-ai-asg", reviewRequestId: request.reviewRequestId, reviewerId: "AI_reviewer", reviewerAuthority: "REVIEWER" })).toThrow(/REVIEWER_AUTHORITY_SPOOFING_REJECTED/);
    expect(() => recordIacReviewFinding(store, { ...reviewer, actorId: "AI-reviewer", authority: "AI", actorKind: "ai" }, { ...objectChain, findingId: "rev-ai", reviewRequestId: request.reviewRequestId, findingCategory: "OBSERVATION", severity: "REVIEW_CANDIDATE", findingText: "AI finding", disposition: "OPEN", evidenceRef: "evidence-ai" })).toThrow(/AI_NOT_IAC_REVIEWER/);
    expect(() => recordIacFindingDisposition(store, reviewer, { ...objectChain, dispositionId: "rev-closed", findingId: finding.findingId, disposition: "CLOSED", closeFindingAsValidated: true })).toThrow(/FINDING_CLOSURE_NOT_VALIDATION|FINDING_DISPOSITION_INVALID/);
    expect(() => recordIacValidationState(store, validator, { ...handoffChain, validationId: "rev-empty", validationState: "VALIDATED", validationScope: "hof-d6 empty scope" })).toThrow(/VALIDATION_EVIDENCE_REQUIRED/);
    expect(() => recordIacValidationState(store, { ...validator, actorKind: "ai", authority: "AI", actorId: "AI-validator" }, { ...objectChain, validationId: "rev-ai-val", validationState: "VALIDATED", validationScope: "ifc-101 ai scope", basis: [{ kind: "R1_OBJECT", id: face.objectId, fingerprint: face.fingerprint }] })).toThrow(/AI_CANNOT_VALIDATE|AI_NOT_VALIDATION_AUTHORITY/);
    expect(() => recordIacValidationState(store, { ...validator, authority: "ADMIN", actorId: "ADMIN" }, { ...objectChain, validationId: "rev-admin", validationState: "VALIDATED", validationScope: "ifc-101 admin scope", basis: [{ kind: "R1_OBJECT", id: face.objectId, fingerprint: face.fingerprint }] })).toThrow(/AI_CANNOT_VALIDATE/);
    expect(() => recordIacValidationState(store, reviewer, { ...handoffChain, validationId: "rev-reviewer-val", validationState: "VALIDATED", validationScope: "hof-d6 reviewer scope", basis: [{ kind: "R8_HANDOFF", id: handoff.handoffId, fingerprint: handoff.fingerprint }] })).toThrow(/VALIDATION_AUTHORITY_REQUIRED/);
    expect(() => recordIacValidationState(store, validator, { ...handoffChain, validationId: "rev-transfer", validationState: "NOT_VALIDATED", validationScope: "hof-d6 transfer scope", predecessorValidationId: validated.validationId })).toThrow(/VALIDATION_TRANSFER_REJECTED/);
    expect(() => recordIacValidationState(store, validator, { ...handoffChain, validationId: "rev-counterpart", validationState: "NOT_VALIDATED", validationScope: "hof-d6 counterpart scope", validateCounterpart: true })).toThrow(/COUNTERPART_VALIDATION_REJECTED/);
    expect(() => recordIacReviewCompletion(store, reviewer, { ...safetyChain, completionId: "rev-fs", reviewRequestId: safetyRequest.reviewRequestId, functionalSafetyValidation: true })).toThrow(/FUNCTIONAL_SAFETY_VALIDATION_NOT_IN_R9/);
    expect(() => recordIacReviewRequest(store, actor({ tenantId: "tenant-b" }), { ...objectChain, reviewRequestId: "rev-cross", reviewType: "IAC_SUBJECT_REVIEW" })).toThrow(/SCOPE_MISMATCH|R1_CONTEXT_NOT_FOUND/);
    expect(() => recordIacReviewRequest(store, who, { ...objectChain, reviewRequestId: "rev-lineage", reviewType: "IAC_SUBJECT_REVIEW", inferLineage: true })).toThrow(/INFERRED_LINEAGE_REJECTED/);
    expect(() => recordIacReviewFinding(store, reviewer, { ...objectChain, findingId: "rev-decision", reviewRequestId: request.reviewRequestId, findingCategory: "COMMENT", severity: "INFORMATION_GAP", findingText: "This would be a decision", disposition: "OPEN", evidenceRef: "evidence-decision", engineeringDecision: true })).toThrow(/FINDING_NOT_ENGINEERING_DECISION/);
    expect(() => recordIacReviewRequest(store, who, { ...objectChain, reviewRequestId: "rev-redesign", reviewType: "IAC_SUBJECT_REVIEW", redesign: true })).toThrow(/REVIEW_DOES_NOT_REDESIGN/);
    expect(() => repointIacReview()).toThrow(/AUTO_REPOINT_REJECTED/);
    expect(() => transferIacValidation()).toThrow(/VALIDATION_TRANSFER_REJECTED/);
    expect(() => automaticallyValidateIacEngineering()).toThrow(/AUTOMATIC_VALIDATION_REJECTED/);
    expect(() => closeIacFindingAsValidated()).toThrow(/FINDING_CLOSURE_NOT_VALIDATION/);
    expect(() => closeIacReassessmentAsValidated()).toThrow(/REASSESSMENT_NOT_VALIDATION/);
    expect(() => validateIacCounterpartFromReview()).toThrow(/COUNTERPART_VALIDATION_REJECTED/);
    expect(() => approveIacFromValidation()).toThrow(/APPROVAL_NOT_IN_R9/);
    expect(() => certifyIacFromValidation()).toThrow(/CERTIFICATION_NOT_IN_R9/);
    expect(() => determineIacConformanceFromValidation()).toThrow(/CONFORMANCE_NOT_IN_R9/);
    expect(() => promoteIacFindingToDecision()).toThrow(/FINDING_NOT_ENGINEERING_DECISION/);
    expect(() => redesignIacFromReview()).toThrow(/REVIEW_DOES_NOT_REDESIGN/);
    expect(r1.objects[0].fingerprint).toBe(face.fingerprint);
    expect(r7.r6.contexts[0].fingerprint).toBe(safety.fingerprint);

    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D8.R9.REVIEW_AND_VALIDATION_GOVERNANCE")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D8.R10.CURRENTNESS_AND_DIGITAL_THREAD")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    const sourceText = readFileSync(join(here, "review-validation-governance.ts"), "utf8");
    expect(sourceText).toMatch(/fingerprintCanonical/);
    expect(sourceText).toMatch(/D2_R9_REQUEST_STATUSES/);
    expect(sourceText).toMatch(/D2_R9_VALIDATION_STATES/);
    expect(sourceText).not.toMatch(/createHash|from ["']@rtb\/engineering-review["']|CREATE TABLE|eval\(|child_process|new Function/);
    expect(scanAnalysisFormulaBypass(join(here, "review-validation-governance.ts"), sourceText)).toEqual([]);
    const pkg = JSON.parse(readFileSync(join(here, "../../package.json"), "utf8")) as { dependencies: Record<string, string> };
    expect(Object.keys(pkg.dependencies).sort()).toEqual(["@rtb/database", "@rtb/engineering-review", "@rtb/platform-commerce", "@rtb/platform-intelligence", "@rtb/platform-kernel", "@rtb/types", "docx", "exceljs", "pptxgenjs", "zod"]);
  });
});
