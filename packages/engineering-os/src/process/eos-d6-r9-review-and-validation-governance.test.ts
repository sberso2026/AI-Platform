import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { D6_REVIEW_VALIDATION_RUNTIME_COUNT as ARCHITECTURE_REVIEW_COUNT, D6_RUNTIME_COUNT as ARCHITECTURE_RUNTIME_COUNT } from "@rtb/types";
import { describe, expect, it } from "vitest";
import { D4_CONTEXT_AUTHORITY, createD4R1Store, recordMechanicalContext, recordMechanicalObjectIdentity } from "../mechanical/identity-foundation";
import { createD5R1Store } from "../piping/identity-foundation";
import { STRUCTURAL_CAPABILITY_MANIFEST } from "../structural-concrete/capability";
import { scanAnalysisFormulaBypass } from "../structural-systems/formula-scan";
import { D6_CONTEXT_AUTHORITY, createD6R1Store, recordProcessContext, recordProcessObjectIdentity } from "./identity-foundation";
import { createD6R2Store, recordProcessStreamContext } from "./system-stream-service-context";
import { createD6R3Store, recordProcessOperatingCaseContext, recordProcessOperatingCondition } from "./operating-design-basis-conditions";
import { createD6R4Store, recordProcessCalculationEvidence } from "./process-evidence-balances";
import { createD6R5Store, recordProcessEquipmentDutyContext } from "./equipment-duty-utility-context";
import { createD6R6Store, recordProcessSafetyContext } from "./process-safety-relief-context";
import { createD6R7Store, recordProcessChange, recordProcessReassessment, recordProcessSourceRequirement } from "./requirements-assumptions-change";
import { D6_R9_STARTED, D6_REVIEW_VALIDATION_RUNTIME_COUNT as R8_REVIEW_COUNT, D6_RUNTIME_COUNT as R8_RUNTIME_COUNT, createD6R8Store, recordProcessInterfaceHandoff } from "./discipline-interfaces-handoffs";
import {
  ADMIN_CAN_PROMOTE_D6_REVIEW_TO_VALIDATION,
  ADMIN_EQUALS_D6_PROCESS_ENGINEERING_AUTHORITY,
  ADMIN_EQUALS_D6_PROCESS_ENGINEERING_REVIEWER_AUTHORITY,
  ADMIN_EQUALS_D6_VALIDATION_AUTHORITY,
  AI_CAN_CLOSE_D6_REVIEW_AS_ENGINEERING_VALIDATED,
  AI_CAN_SET_AUTHORITATIVE_D6_VALIDATION_STATE,
  AI_EQUALS_D6_PROCESS_ENGINEERING_AUTHORITY,
  AI_EQUALS_D6_PROCESS_ENGINEERING_REVIEWER_AUTHORITY,
  AI_EQUALS_D6_VALIDATION_AUTHORITY,
  CROSS_TENANT_D6_R9_ACCESS_ALLOWED,
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
  D6_DISCIPLINE_INTERFACE_RUNTIME_READY,
  D6_ENERGY_BALANCE_CALCULATION_RUNTIME_COUNT,
  D6_EQUIPMENT_DUTY_CALCULATION_RUNTIME_COUNT,
  D6_EQUIPMENT_DUTY_RUNTIME_READY,
  D6_HYDRAULIC_CALCULATION_RUNTIME_COUNT,
  D6_MASS_BALANCE_CALCULATION_RUNTIME_COUNT,
  D6_PRESSURE_DROP_CALCULATION_RUNTIME_COUNT,
  D6_PROCESS_CALCULATION_RUNTIME_COUNT,
  D6_PROCESS_EVIDENCE_RUNTIME_READY,
  D6_PROCESS_FINDING_DISPOSITION_IMPLEMENTED,
  D6_PROCESS_IDENTITY_RUNTIME_READY,
  D6_PROCESS_REVIEW_COMPLETION_IMPLEMENTED,
  D6_PROCESS_REVIEW_FINDING_IMPLEMENTED,
  D6_PROCESS_REVIEW_REQUEST_IMPLEMENTED,
  D6_PROCESS_SAFETY_RELIEF_RUNTIME_READY,
  D6_PROCESS_VALIDATION_STATE_IMPLEMENTED,
  D6_R1_R8_EXACT_SOURCE_REVISIONS_REUSED,
  D6_R10_CANONICAL_PHASE,
  D6_R10_CANONICAL_SCOPE,
  D6_R10_PHASE_TYPE,
  D6_R10_STARTED,
  D6_R7_CHANGE_REVIEW_INTEGRATION_IMPLEMENTED,
  D6_R7_REASSESSMENT_REVIEW_INTEGRATION_IMPLEMENTED,
  D6_R8_INTERFACE_REVIEW_CONTEXT_SUPPORTED,
  D6_R8_RUNTIME_COUNT,
  D6_R9_AUTO_VALIDATES_FROM_EXTERNAL_EVIDENCE,
  D6_R9_AUTO_VALIDATES_FROM_FINDING_CLOSURE,
  D6_R9_AUTO_VALIDATES_FROM_REASSESSMENT_COMPLETION,
  D6_R9_AUTO_VALIDATES_FROM_REVIEW_COMPLETION,
  D6_R9_AUTO_VALIDATES_PROCESS_ENGINEERING,
  D6_R9_DUPLICATE_GOVERNANCE_IMPLEMENTED,
  D6_R9_HISTORICAL_REFERENCE_AUTO_REPOINTED,
  D6_R9_HISTORY_PRESERVED,
  D6_R9_MATURITY,
  D6_R9_PROVENANCE_PRESERVED,
  D6_R9_PROVENANCE_REQUIRED,
  D6_R9_REPLAY_PROTECTION_IMPLEMENTED,
  D6_R9_REVIEW_AI_BOUNDARY_REUSED,
  D6_R9_SOURCE_BASIS_REQUIRED,
  D6_R9_SOURCE_BASIS_TRACEABLE,
  D6_R9_SPOOFING_PROTECTION_IMPLEMENTED,
  D6_R9_STATUS,
  D6_R9_VALIDATES_D4_EQUIPMENT_SELECTION,
  D6_R9_VALIDATES_D4_MECHANICAL_ENGINEERING,
  D6_R9_VALIDATES_D5_PIPING_ENGINEERING,
  D6_R9_VALIDATES_D7_ELECTRICAL_ENGINEERING,
  D6_R9_VALIDATES_D8_IAC_ENGINEERING,
  D6_RELIEF_CALCULATION_RUNTIME_COUNT,
  D6_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY,
  D6_REUSES_CANONICAL_CURRENTNESS,
  D6_REUSES_CANONICAL_DIGITAL_THREAD,
  D6_REUSES_CANONICAL_FINGERPRINT,
  D6_REUSES_CANONICAL_REVIEW_GOVERNANCE,
  D6_REUSES_CANONICAL_VALIDATION_GOVERNANCE,
  D6_REVIEW_OF_HANDOFF_EQUALS_COUNTERPART_VALIDATION,
  D6_REVIEW_SUBJECT_AUTO_REPOINTED,
  D6_REVIEW_VALIDATION_RUNTIME_COUNT,
  D6_REVIEW_VALIDATION_RUNTIME_IMPLEMENTED,
  D6_REVIEW_VALIDATION_RUNTIME_READY,
  D6_REVIEWER_AUTHORITY_REQUIRED,
  D6_REVIEWER_AUTHORITY_TRACEABLE,
  D6_RUNTIME_COUNT,
  D6_RUNTIME_STARTED,
  D6_SYSTEM_STREAM_SERVICE_RUNTIME_READY,
  D6_UTILITY_CALCULATION_RUNTIME_COUNT,
  D6_VALIDATION_AUTHORITY_REQUIRED,
  D6_VALIDATION_AUTHORITY_TRACEABLE,
  D6_VALIDATION_AUTO_APPROVES_ENGINEERING,
  D6_VALIDATION_AUTO_CERTIFIES_ENGINEERING,
  D6_VALIDATION_AUTO_DETERMINES_CONFORMANCE,
  D6_VALIDATION_OF_HANDOFF_EQUALS_COUNTERPART_ENGINEERING_VALIDATED,
  D7_RUNTIME_STARTED,
  D8_RUNTIME_STARTED,
  D9_RUNTIME_COUNT,
  D9_RUNTIME_STARTED,
  DATABASE_SCHEMA_CHANGED,
  EXACT_D6_REVIEW_SUBJECT_REVISION_REQUIRED,
  EXTERNAL_PROCESS_EVIDENCE_EQUALS_PROCESS_VALIDATION,
  EXTERNAL_TOOL_RESULT_EQUALS_PROCESS_VALIDATION,
  FINDING_ACCEPTED_EQUALS_APPROVED,
  FINDING_CLOSED_EQUALS_VALIDATED,
  FINDING_DISPOSITION_EQUALS_CONFORMANCE,
  FLOATING_D6_REVIEW_SUBJECT_REFERENCE_ALLOWED,
  NEW_DEPENDENCY_ADDED,
  PARALLEL_D6_CURRENTNESS_ENGINE_CREATED,
  PARALLEL_D6_DIGITAL_THREAD_CREATED,
  PARALLEL_D6_REVIEW_ENGINE_CREATED,
  PARALLEL_D6_VALIDATION_ENGINE_CREATED,
  PRIOR_D6_REVIEW_AUTO_TRANSFERS_TO_NEW_REVISION,
  PRIOR_D6_VALIDATION_AUTO_TRANSFERS_TO_NEW_REVISION,
  PROCESS_EQUIPMENT_REQUIREMENT_EQUALS_VALIDATED_MECHANICAL_SELECTION,
  PROCESS_SAFETY_CONTEXT_EQUALS_FUNCTIONAL_SAFETY_VALIDATION,
  REASSESSMENT_COMPLETED_EQUALS_APPROVED,
  REASSESSMENT_COMPLETED_EQUALS_VALIDATED,
  REASSESSMENT_REQUIRED_D6_RECORD_EXPOSED_AS_VALIDATED,
  REASSESSMENT_REQUIRED_EQUALS_VALIDATION_FAILED,
  RELIEF_SCENARIO_EQUALS_RELIEF_DEVICE_VALIDATED,
  REVIEW_COMPLETED_EQUALS_APPROVED,
  REVIEW_COMPLETED_EQUALS_CERTIFIED,
  REVIEW_COMPLETED_EQUALS_CONFORMANT,
  REVIEW_COMPLETED_EQUALS_VALIDATED,
  REVIEW_FINDING_EQUALS_PROCESS_DESIGN_INVALID,
  REVIEW_FINDING_EQUALS_VALIDATION_FAILURE,
  REVIEW_REQUESTED_EQUALS_REVIEW_COMPLETED,
  REVIEW_REQUESTED_EQUALS_VALIDATED,
  SAFEGUARD_REQUIREMENT_EQUALS_SIF_VALIDATED,
  SECOND_D6_FINGERPRINT_ALGORITHM_CREATED,
  SILENT_D6_R9_MUTATION_ALLOWED,
  STALE_D6_VALIDATION_EXPOSED_AS_CURRENT,
  SUPERSEDED_D6_VALIDATION_EXPOSED_AS_CURRENT,
  TENANT_WORKSPACE_PROJECT_D6_R9_SCOPE_ENFORCED,
  VALIDATED_EQUALS_APPROVED,
  VALIDATED_EQUALS_CERTIFIED,
  VALIDATED_EQUALS_CONFORMANT,
  VALIDATED_EQUALS_REGULATORY_APPROVED,
  approveProcessFromValidation,
  automaticallyValidateProcessEngineering,
  certifyProcessFromValidation,
  closeProcessReassessmentAsValidated,
  createD6R9Store,
  currentProcessValidations,
  determineProcessConformanceFromValidation,
  recordProcessFindingDisposition,
  recordProcessReviewCompletion,
  recordProcessReviewFinding,
  recordProcessReviewRequest,
  recordProcessValidationState,
  repointProcessReview,
  transferProcessValidation,
  validateProcessCounterpart,
} from "./review-validation-governance";

describe("EOS-D6-R9 review and validation governance", () => {
  it("records review without turning it into validation, conformance, or another discipline", () => {
    expect(D6_R9_STATUS).toBe("REVIEW_AND_VALIDATION_GOVERNANCE_IMPLEMENTED");
    expect(D6_R9_MATURITY).toBe(D6_R9_STATUS);
    expect(D6_RUNTIME_STARTED).toBe(true);
    expect(D6_RUNTIME_COUNT).toBe(9);
    expect(D6_R8_RUNTIME_COUNT).toBe(8);
    expect(R8_RUNTIME_COUNT).toBe(8);
    expect(ARCHITECTURE_RUNTIME_COUNT).toBe(0);
    expect(D6_REVIEW_VALIDATION_RUNTIME_IMPLEMENTED).toBe(true);
    expect(D6_REVIEW_VALIDATION_RUNTIME_COUNT).toBe(1);
    expect(D6_REVIEW_VALIDATION_RUNTIME_READY).toBe(true);
    expect(R8_REVIEW_COUNT).toBe(0);
    expect(ARCHITECTURE_REVIEW_COUNT).toBe(0);
    expect(D6_R9_STARTED).toBe(false);
    expect(D6_R10_STARTED).toBe(false);
    expect(D6_R10_CANONICAL_PHASE).toBe("EOS-D6-R10-CURRENTNESS-AND-DIGITAL-THREAD");
    expect(D6_R10_PHASE_TYPE).toBe("CURRENTNESS_AND_DIGITAL_THREAD");
    expect(D6_R10_CANONICAL_SCOPE).toContain("exact D6 R1-R9 revisions");
    expect(D6_R1_R8_EXACT_SOURCE_REVISIONS_REUSED && EXACT_D6_REVIEW_SUBJECT_REVISION_REQUIRED).toBe(true);
    expect(FLOATING_D6_REVIEW_SUBJECT_REFERENCE_ALLOWED || D6_REVIEW_SUBJECT_AUTO_REPOINTED).toBe(false);
    expect(D6_REUSES_CANONICAL_REVIEW_GOVERNANCE && D6_REUSES_CANONICAL_VALIDATION_GOVERNANCE).toBe(true);
    expect(PARALLEL_D6_REVIEW_ENGINE_CREATED || PARALLEL_D6_VALIDATION_ENGINE_CREATED).toBe(false);
    expect(D6_R9_REVIEW_AI_BOUNDARY_REUSED.mayApproveDesign).toBe(false);
    expect(D6_PROCESS_REVIEW_REQUEST_IMPLEMENTED && D6_PROCESS_REVIEW_FINDING_IMPLEMENTED && D6_PROCESS_FINDING_DISPOSITION_IMPLEMENTED && D6_PROCESS_REVIEW_COMPLETION_IMPLEMENTED && D6_PROCESS_VALIDATION_STATE_IMPLEMENTED).toBe(true);
    expect(REVIEW_REQUESTED_EQUALS_REVIEW_COMPLETED || REVIEW_REQUESTED_EQUALS_VALIDATED).toBe(false);
    expect(D6_REVIEWER_AUTHORITY_REQUIRED && D6_REVIEWER_AUTHORITY_TRACEABLE).toBe(true);
    expect(AI_EQUALS_D6_PROCESS_ENGINEERING_REVIEWER_AUTHORITY || ADMIN_EQUALS_D6_PROCESS_ENGINEERING_REVIEWER_AUTHORITY).toBe(false);
    expect(REVIEW_FINDING_EQUALS_PROCESS_DESIGN_INVALID || REVIEW_FINDING_EQUALS_VALIDATION_FAILURE).toBe(false);
    expect(FINDING_CLOSED_EQUALS_VALIDATED || FINDING_ACCEPTED_EQUALS_APPROVED || FINDING_DISPOSITION_EQUALS_CONFORMANCE).toBe(false);
    expect(REVIEW_COMPLETED_EQUALS_VALIDATED || REVIEW_COMPLETED_EQUALS_CONFORMANT || REVIEW_COMPLETED_EQUALS_APPROVED || REVIEW_COMPLETED_EQUALS_CERTIFIED).toBe(false);
    expect(VALIDATED_EQUALS_CONFORMANT || VALIDATED_EQUALS_APPROVED || VALIDATED_EQUALS_CERTIFIED || VALIDATED_EQUALS_REGULATORY_APPROVED).toBe(false);
    expect(D6_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT).toBe(0);
    expect(D6_R9_AUTO_VALIDATES_PROCESS_ENGINEERING || D6_R9_AUTO_VALIDATES_FROM_REVIEW_COMPLETION || D6_R9_AUTO_VALIDATES_FROM_FINDING_CLOSURE || D6_R9_AUTO_VALIDATES_FROM_EXTERNAL_EVIDENCE || D6_R9_AUTO_VALIDATES_FROM_REASSESSMENT_COMPLETION).toBe(false);
    expect(D6_VALIDATION_AUTHORITY_REQUIRED && D6_VALIDATION_AUTHORITY_TRACEABLE).toBe(true);
    expect(AI_EQUALS_D6_VALIDATION_AUTHORITY || ADMIN_EQUALS_D6_VALIDATION_AUTHORITY).toBe(false);
    expect(D6_R7_REASSESSMENT_REVIEW_INTEGRATION_IMPLEMENTED && D6_R7_CHANGE_REVIEW_INTEGRATION_IMPLEMENTED).toBe(true);
    expect(REASSESSMENT_REQUIRED_EQUALS_VALIDATION_FAILED || REASSESSMENT_COMPLETED_EQUALS_VALIDATED || REASSESSMENT_COMPLETED_EQUALS_APPROVED).toBe(false);
    expect(PRIOR_D6_REVIEW_AUTO_TRANSFERS_TO_NEW_REVISION || PRIOR_D6_VALIDATION_AUTO_TRANSFERS_TO_NEW_REVISION).toBe(false);
    expect(STALE_D6_VALIDATION_EXPOSED_AS_CURRENT || SUPERSEDED_D6_VALIDATION_EXPOSED_AS_CURRENT || REASSESSMENT_REQUIRED_D6_RECORD_EXPOSED_AS_VALIDATED).toBe(false);
    expect(D6_R8_INTERFACE_REVIEW_CONTEXT_SUPPORTED).toBe(true);
    expect(D6_REVIEW_OF_HANDOFF_EQUALS_COUNTERPART_VALIDATION || D6_VALIDATION_OF_HANDOFF_EQUALS_COUNTERPART_ENGINEERING_VALIDATED).toBe(false);
    expect(D6_R9_VALIDATES_D4_MECHANICAL_ENGINEERING || D6_R9_VALIDATES_D5_PIPING_ENGINEERING || D6_R9_VALIDATES_D7_ELECTRICAL_ENGINEERING || D6_R9_VALIDATES_D8_IAC_ENGINEERING || D6_R9_VALIDATES_D4_EQUIPMENT_SELECTION).toBe(false);
    expect(EXTERNAL_PROCESS_EVIDENCE_EQUALS_PROCESS_VALIDATION || EXTERNAL_TOOL_RESULT_EQUALS_PROCESS_VALIDATION).toBe(false);
    expect(PROCESS_EQUIPMENT_REQUIREMENT_EQUALS_VALIDATED_MECHANICAL_SELECTION || PROCESS_SAFETY_CONTEXT_EQUALS_FUNCTIONAL_SAFETY_VALIDATION || RELIEF_SCENARIO_EQUALS_RELIEF_DEVICE_VALIDATED || SAFEGUARD_REQUIREMENT_EQUALS_SIF_VALIDATED).toBe(false);
    expect(D6_CONFORMANCE_DETERMINATION_RUNTIME_COUNT + D6_APPROVAL_RUNTIME_COUNT + D6_CERTIFICATION_RUNTIME_COUNT).toBe(0);
    expect(D6_VALIDATION_AUTO_APPROVES_ENGINEERING || D6_VALIDATION_AUTO_CERTIFIES_ENGINEERING || D6_VALIDATION_AUTO_DETERMINES_CONFORMANCE).toBe(false);
    expect(D6_REUSES_CANONICAL_CURRENTNESS && D6_REUSES_CANONICAL_DIGITAL_THREAD && D6_REUSES_CANONICAL_FINGERPRINT).toBe(true);
    expect(PARALLEL_D6_CURRENTNESS_ENGINE_CREATED || PARALLEL_D6_DIGITAL_THREAD_CREATED || SECOND_D6_FINGERPRINT_ALGORITHM_CREATED).toBe(false);
    expect(D6_R9_HISTORY_PRESERVED && D6_R9_PROVENANCE_REQUIRED && D6_R9_PROVENANCE_PRESERVED && D6_R9_SOURCE_BASIS_REQUIRED && D6_R9_SOURCE_BASIS_TRACEABLE).toBe(true);
    expect(D6_R9_HISTORICAL_REFERENCE_AUTO_REPOINTED || SILENT_D6_R9_MUTATION_ALLOWED).toBe(false);
    expect(TENANT_WORKSPACE_PROJECT_D6_R9_SCOPE_ENFORCED).toBe(true);
    expect(CROSS_TENANT_D6_R9_ACCESS_ALLOWED).toBe(false);
    expect(AI_EQUALS_D6_PROCESS_ENGINEERING_AUTHORITY || ADMIN_EQUALS_D6_PROCESS_ENGINEERING_AUTHORITY).toBe(false);
    expect(AI_CAN_CLOSE_D6_REVIEW_AS_ENGINEERING_VALIDATED || AI_CAN_SET_AUTHORITATIVE_D6_VALIDATION_STATE || ADMIN_CAN_PROMOTE_D6_REVIEW_TO_VALIDATION).toBe(false);
    expect(D6_R9_DUPLICATE_GOVERNANCE_IMPLEMENTED && D6_R9_REPLAY_PROTECTION_IMPLEMENTED && D6_R9_SPOOFING_PROTECTION_IMPLEMENTED).toBe(true);
    expect([
      D6_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT, D6_D9_SOURCE_CONTRACT_RUNTIME_COUNT, D6_D9_RUNTIME_INTEGRATION_COUNT,
      D6_PROCESS_CALCULATION_RUNTIME_COUNT, D6_MASS_BALANCE_CALCULATION_RUNTIME_COUNT, D6_ENERGY_BALANCE_CALCULATION_RUNTIME_COUNT,
      D6_HYDRAULIC_CALCULATION_RUNTIME_COUNT, D6_PRESSURE_DROP_CALCULATION_RUNTIME_COUNT, D6_EQUIPMENT_DUTY_CALCULATION_RUNTIME_COUNT,
      D6_RELIEF_CALCULATION_RUNTIME_COUNT, D6_DEPRESSURING_CALCULATION_RUNTIME_COUNT, D6_UTILITY_CALCULATION_RUNTIME_COUNT,
      D6_AUTOMATIC_PROCESS_CALCULATION_RUNTIME_COUNT, D6_AUTOMATIC_REDESIGN_RUNTIME_COUNT, D6_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT,
      D6_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT, D6_CROSS_DISCIPLINE_CONFLICT_DETECTION_RUNTIME_COUNT, D6_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT, D6_CROSS_DISCIPLINE_RECOMMENDATION_RUNTIME_COUNT,
    ]).toEqual([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    expect(D1_STRUCTURAL_PACK_COMPLETE || D1N_REOPENED || D2_REOPENED || D3_REOPENED || D4_REOPENED || D5_REOPENED).toBe(false);
    expect(D2_TRACK_COMPLETE && D3_TRACK_COMPLETE && D4_TRACK_COMPLETE && D5_TRACK_COMPLETE).toBe(true);
    expect(D7_RUNTIME_STARTED || D8_RUNTIME_STARTED || D9_RUNTIME_STARTED).toBe(false);
    expect(D9_RUNTIME_COUNT).toBe(0);
    expect(DATABASE_SCHEMA_CHANGED || NEW_DEPENDENCY_ADDED).toBe(false);
    expect(D6_PROCESS_IDENTITY_RUNTIME_READY && D6_SYSTEM_STREAM_SERVICE_RUNTIME_READY && D6_DESIGN_BASIS_CONDITION_RUNTIME_READY && D6_PROCESS_EVIDENCE_RUNTIME_READY && D6_EQUIPMENT_DUTY_RUNTIME_READY && D6_PROCESS_SAFETY_RELIEF_RUNTIME_READY && D6_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY && D6_DISCIPLINE_INTERFACE_RUNTIME_READY).toBe(true);
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D6.R9.REVIEW_AND_VALIDATION_GOVERNANCE")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D6.R10.CURRENTNESS_AND_DIGITAL_THREAD")?.implementationState).toBe("IMPLEMENTED_BOUNDED");

    const actor = { actorId: "proc-recorder", tenantId: "t1", workspaceId: "w1", projectId: "p1", authority: D6_CONTEXT_AUTHORITY };
    const reviewer = { ...actor, actorId: "rev-1", authority: "REVIEWER" as const, actorKind: "human" as const, aal: "aal2" };
    const validator = { ...actor, actorId: "val-1", authority: "PROCESS_VALIDATION_AUTHORITY" as const, actorKind: "human" as const, aal: "aal2" };
    const r1 = createD6R1Store();
    recordProcessContext(r1, actor, { contextId: "ctx-1", citedLifecycleStage: "FEED", provenanceRef: "prov-ctx", sourceBasisRef: "basis-ctx" });
    const identity = (objectId: string, objectType: string) => recordProcessObjectIdentity(r1, actor, {
      objectId, contextId: "ctx-1", objectType, citedLifecycleStage: "FEED", provenanceRef: `prov-${objectId}`, sourceBasisRef: `basis-${objectId}`,
    });
    const stream = identity("stream-1", "PROCESS_STREAM");
    const operatingIdentity = identity("op-1", "PROCESS_OPERATING_CASE");
    const evidenceIdentity = identity("ev-1", "PROCESS_CALCULATION_EVIDENCE");
    const dutyIdentity = identity("duty-1", "PROCESS_EQUIPMENT_DUTY");
    const safetyIdentity = identity("safety-1", "PROCESS_SAFETY_CONTEXT");
    const r2 = createD6R2Store(r1, createD5R1Store());
    const streamContext = recordProcessStreamContext(r2, actor, {
      contextId: "ctx-1", objectId: stream.objectId, objectRevisionFingerprint: stream.fingerprint, citedLifecycleStage: "FEED",
      provenanceRef: "prov-r2", sourceBasisRef: "basis-r2", citedCurrentness: "CURRENT", applicability: `applies only to ${stream.objectId}`,
      limitations: "descriptive context only", streamRecordId: "stream-rec", streamFunction: "FEED",
    });
    const r3 = createD6R3Store(r2);
    const operatingCase = recordProcessOperatingCaseContext(r3, actor, {
      contextId: "ctx-1", objectId: operatingIdentity.objectId, objectRevisionFingerprint: operatingIdentity.fingerprint, citedLifecycleStage: "FEED",
      provenanceRef: "prov-r3", sourceBasisRef: "basis-r3", citedCurrentness: "CURRENT", applicability: `applies only to ${operatingIdentity.objectId}`,
      limitations: "supplied value only", caseRecordId: "op-rec", caseName: "Normal operation", caseType: "NORMAL_OPERATION",
    });
    const condition = recordProcessOperatingCondition(r3, actor, {
      contextId: "ctx-1", objectId: stream.objectId, objectRevisionFingerprint: stream.fingerprint, citedLifecycleStage: "FEED",
      provenanceRef: "prov-cond", sourceBasisRef: "basis-cond", citedCurrentness: "CURRENT", applicability: `applies only to ${stream.objectId}`,
      limitations: "supplied value only", conditionId: "op-cond", caseRecordId: operatingCase.caseRecordId, caseContextFingerprint: operatingCase.fingerprint,
      quantityKind: "PRESSURE", conditionRole: "NORMAL", value: "150", unit: "kPa", r2StreamRecordId: streamContext.streamRecordId, r2StreamFingerprint: streamContext.fingerprint,
    });
    const r4 = createD6R4Store(r3);
    const energy = recordProcessCalculationEvidence(r4, actor, {
      contextId: "ctx-1", objectId: evidenceIdentity.objectId, objectRevisionFingerprint: evidenceIdentity.fingerprint,
      subjectObjectId: stream.objectId, subjectRevisionFingerprint: stream.fingerprint, evidenceId: "energy-1",
      citedLifecycleStage: "FEED", provenanceRef: "prov-r4", sourceBasisRef: "basis-r4", citedCurrentness: "CURRENT",
      applicability: `applies only to ${stream.objectId} and ${evidenceIdentity.objectId}`, limitations: "supplied external evidence only",
      caseClass: "OPERATING", caseRecordId: operatingCase.caseRecordId, caseContextFingerprint: operatingCase.fingerprint,
      r2StreamRecordId: streamContext.streamRecordId, r2StreamFingerprint: streamContext.fingerprint,
      sourceToolName: "SupplierBalance", sourceToolVersion: "4.2", sourceModelRevision: "model-a", sourceReportRef: "HMB-014", sourceAuthorityRef: "balance author PE-14",
      evidenceClass: "ENERGY_BALANCE", assumptions: ["Enthalpy reference was stated by the supplier"],
      values: [
        { valueId: "ein", role: "INPUT", name: "ENTHALPY_IN", valueKind: "QUANTITY", value: "400", unit: "kJ/kg", basisRef: "EB-2-in" },
        { valueId: "eout", role: "RESULT", name: "DUTY", valueKind: "QUANTITY", value: "1500", unit: "kW", basisRef: "EB-2-out" },
      ],
    });
    const r5 = createD6R5Store(r4);
    const duty = recordProcessEquipmentDutyContext(r5, actor, {
      contextId: "ctx-1", objectId: dutyIdentity.objectId, objectRevisionFingerprint: dutyIdentity.fingerprint,
      subjectObjectId: stream.objectId, subjectRevisionFingerprint: stream.fingerprint, requirementId: "duty-rec",
      citedLifecycleStage: "FEED", provenanceRef: "prov-r5", sourceBasisRef: "basis-r5", citedCurrentness: "CURRENT",
      applicability: `applies only to ${stream.objectId} and ${dutyIdentity.objectId}`, limitations: "process requirement only",
      caseClass: "OPERATING", caseRecordId: operatingCase.caseRecordId, caseContextFingerprint: operatingCase.fingerprint,
      r2StreamRecordId: streamContext.streamRecordId, r2StreamFingerprint: streamContext.fingerprint,
      requirementKind: "HEAT_DUTY", serviceRole: "feed heater process duty", value: "1400", unit: "kW",
    });
    const r6 = createD6R6Store(r5);
    const safety = recordProcessSafetyContext(r6, actor, {
      contextId: "ctx-1", objectId: safetyIdentity.objectId, objectRevisionFingerprint: safetyIdentity.fingerprint,
      subjectObjectId: stream.objectId, subjectRevisionFingerprint: stream.fingerprint, recordId: "safety-rec",
      citedLifecycleStage: "FEED", provenanceRef: "prov-r6", sourceBasisRef: "basis-r6", citedCurrentness: "CURRENT",
      applicability: `applies only to ${stream.objectId} and ${safetyIdentity.objectId}`, limitations: "supplied safety context only",
      assumptions: "The scenario boundary was stated by the supplied study", statement: "Process safety context for the feed stream",
      caseClass: "OPERATING", caseRecordId: operatingCase.caseRecordId, caseContextFingerprint: operatingCase.fingerprint,
      r2StreamRecordId: streamContext.streamRecordId, r2StreamFingerprint: streamContext.fingerprint,
    });
    const r7 = createD6R7Store(r6);
    const subject = {
      contextId: "ctx-1", objectId: stream.objectId, objectRevisionFingerprint: stream.fingerprint,
      r2Kind: "STREAM", r2RecordId: streamContext.streamRecordId, r2Fingerprint: streamContext.fingerprint,
      citedCurrentness: "CURRENT", citedLifecycleStage: "FEED", applicability: `applies only to ${stream.objectId}`,
      limitations: "governed process context only", provenanceRef: "prov-r7", sourceBasisRef: "basis-r7",
    };
    recordProcessSourceRequirement(r7, actor, {
      ...subject, requirementId: "req-source", statement: "The feed stream shall retain the supplied operating pressure",
      requirementCategory: "DESIGN_INPUT", sourceClass: "SOURCE_REQUIREMENT", sourceRef: "PDB-1", sourceRevision: "A",
    });
    const link = (targetKind: string, targetId: string, targetFingerprint: string) => ({ kind: "OBJECT_REFERENCE", targetKind, targetId, targetFingerprint });
    const change = recordProcessChange(r7, actor, {
      ...subject, changeId: "chg-1", changeCategory: "R5_DUTY_CHANGED", reason: "The source document revision was explicitly replaced",
      dependencies: [
        link("R3_CONDITION", condition.conditionId, condition.fingerprint),
        link("R4_EVIDENCE", energy.evidenceId, energy.fingerprint),
        link("R5_DUTY", duty.requirementId, duty.fingerprint),
        link("R6_SAFETY", safety.recordId, safety.fingerprint),
      ],
    });
    const reassessment = recordProcessReassessment(r7, actor, {
      ...subject, reassessmentId: "ras-duty", changeId: change.changeId, targetId: duty.requirementId, targetFingerprint: duty.fingerprint, state: "REASSESSMENT_REQUIRED",
    });
    const completed = recordProcessReassessment(r7, actor, {
      ...subject, reassessmentId: "ras-done", changeId: change.changeId, targetId: duty.requirementId, targetFingerprint: duty.fingerprint, state: "REASSESSMENT_COMPLETED",
    });
    const mechActor = { ...actor, actorId: "mech-recorder", authority: D4_CONTEXT_AUTHORITY };
    const d4 = createD4R1Store();
    recordMechanicalContext(d4, mechActor, { contextId: "mctx", citedLifecycleStage: "FEED", provenanceRef: "prov-mctx" });
    const equipment = recordMechanicalObjectIdentity(d4, mechActor, { objectId: "eq-1", contextId: "mctx", objectType: "MECHANICAL_EQUIPMENT", citedLifecycleStage: "FEED", provenanceRef: "prov-eq-1" });
    const r8 = createD6R8Store(r7, d4);
    const handoff = recordProcessInterfaceHandoff(r8, actor, {
      contextId: "ctx-1", objectId: stream.objectId, objectRevisionFingerprint: stream.fingerprint,
      r2Kind: "STREAM", r2RecordId: streamContext.streamRecordId, r2Fingerprint: streamContext.fingerprint,
      citedCurrentness: "CURRENT", citedLifecycleStage: "FEED", applicability: `applies only to ${stream.objectId}`,
      limitations: "handoff communicates process context only", provenanceRef: "prov-r8", sourceBasisRef: "basis-r8",
      direction: "D6_TO_COUNTERPART", identityBasis: "EXPLICIT", tenantId: "t1", workspaceId: "w1", projectId: "p1",
      handoffId: "hof-d4", sourceKind: "R5_DUTY", sourceId: duty.requirementId, sourceFingerprint: duty.fingerprint,
      dependencies: [link("R5_DUTY", duty.requirementId, duty.fingerprint)], counterpartDiscipline: "mechanical", interfaceTopic: "PROCESS_DUTY",
      counterpartId: equipment.objectId, counterpartRevision: equipment.provenanceRef, counterpartFingerprint: equipment.fingerprint, handoffStatus: "COMPLETE",
    });
    const before = { condition: JSON.stringify(r3.conditions), evidence: JSON.stringify(r4.evidence), duty: JSON.stringify(r5.duties), safety: JSON.stringify(r6.records), equipment: JSON.stringify(d4.objects), reassessment: completed.engineeringValidated };
    const review = createD6R9Store(r8);
    const chain = (subjectKind: string, subjectId: string, subjectRevision: string, subjectFingerprint: string, citedCurrentness = "CURRENT") => ({
      contextId: "ctx-1", objectId: stream.objectId, objectRevisionFingerprint: stream.fingerprint,
      r2Kind: "STREAM", r2RecordId: streamContext.streamRecordId, r2Fingerprint: streamContext.fingerprint,
      subjectKind, subjectId, subjectRevision, subjectFingerprint, citedCurrentness,
      tenantId: "t1", workspaceId: "w1", projectId: "p1", citedLifecycleStage: "FEED",
      applicability: `applies only to ${stream.objectId}`, limitations: "review records the governed activity only",
      provenanceRef: "prov-r9", sourceBasisRef: "basis-r9",
    });
    const dutyChain = chain("DUTY", duty.requirementId, duty.provenanceRef, duty.fingerprint);
    const request = recordProcessReviewRequest(review, actor, {
      ...dutyChain, reviewRequestId: "req-duty", reviewType: "PROCESS_SUBJECT_REVIEW", reviewScope: "duty requirement wording", requestedReviewerAuthority: "REVIEWER",
    });
    expect(recordProcessReviewRequest(review, actor, {
      ...dutyChain, reviewRequestId: "req-duty", reviewType: "PROCESS_SUBJECT_REVIEW", reviewScope: "duty requirement wording", requestedReviewerAuthority: "REVIEWER",
    })).toBe(request);
    expect(request.requestStatus).toBe("REQUESTED");
    expect(request.reviewCompleted).toBe(false);
    expect(request.engineeringValidated).toBe(false);
    const finding = recordProcessReviewFinding(review, reviewer, {
      ...dutyChain, findingId: "find-1", reviewRequestId: request.reviewRequestId, findingCategory: "OBSERVATION", severity: "REQUIRES_ATTENTION",
      findingText: "The supplied duty remains an open review item", disposition: "OPEN",
    });
    const noted = recordProcessFindingDisposition(review, reviewer, { ...dutyChain, dispositionId: "disp-noted", findingId: finding.findingId, disposition: "NOTED" });
    const asked = recordProcessFindingDisposition(review, reviewer, {
      ...dutyChain, dispositionId: "disp-ras", findingId: finding.findingId, disposition: "REASSESSMENT_REQUESTED",
      changeId: change.changeId, changeFingerprint: change.fingerprint, reassessmentId: reassessment.reassessmentId, reassessmentFingerprint: reassessment.fingerprint,
    });
    expect(finding.engineeringInvalid).toBe(false);
    expect(finding.engineeringValidated).toBe(false);
    expect(finding.fingerprint).toBe(recordProcessReviewFinding(review, reviewer, {
      ...dutyChain, findingId: "find-1", reviewRequestId: request.reviewRequestId, findingCategory: "OBSERVATION", severity: "REQUIRES_ATTENTION",
      findingText: "The supplied duty remains an open review item", disposition: "OPEN",
    }).fingerprint);
    expect(noted.engineeringValidated).toBe(false);
    expect(asked.approved).toBe(false);
    expect(asked.conformant).toBe(false);
    expect(completed.engineeringValidated).toBe(false);
    const completion = recordProcessReviewCompletion(review, reviewer, { ...dutyChain, completionId: "done-duty", reviewRequestId: request.reviewRequestId });
    expect(completion.reviewCompleted).toBe(true);
    expect(completion.engineeringValidated).toBe(false);
    expect(completion.conformant).toBe(false);
    expect(completion.approved).toBe(false);
    expect(completion.certified).toBe(false);
    expect(request.reviewCompleted).toBe(false);
    expect(request.requestStatus).toBe("REQUESTED");
    expect(request.engineeringValidated).toBe(false);
    const reassessmentState = recordProcessValidationState(review, validator, {
      ...dutyChain, citedCurrentness: "REASSESSMENT_REQUIRED", validationId: "val-ras", validationScope: "duty reassessment state", validationState: "REASSESSMENT_REQUIRED",
      changeId: change.changeId, changeFingerprint: change.fingerprint, reassessmentId: reassessment.reassessmentId, reassessmentFingerprint: reassessment.fingerprint,
    });
    expect(reassessmentState.engineeringValidated).toBe(false);
    expect(currentProcessValidations(review, validator).some((row) => row.validationId === reassessmentState.validationId)).toBe(false);
    const conditionChain = chain("CONDITION", condition.conditionId, condition.provenanceRef, condition.fingerprint);
    const conditionRequest = recordProcessReviewRequest(review, actor, {
      ...conditionChain, reviewRequestId: "req-cond", reviewType: "PROCESS_SUBJECT_REVIEW", reviewScope: "supplied pressure", requestedReviewerAuthority: "REVIEWER",
    });
    recordProcessReviewCompletion(review, reviewer, { ...conditionChain, completionId: "done-cond", reviewRequestId: conditionRequest.reviewRequestId });
    const validated = recordProcessValidationState(review, validator, {
      ...conditionChain, validationId: "val-cond", validationScope: "supplied operating pressure", validationState: "VALIDATED",
      basis: [{ kind: "R3_CONDITION", id: condition.conditionId, fingerprint: condition.fingerprint }], reviewRequestId: conditionRequest.reviewRequestId,
    });
    expect(validated.engineeringValidated).toBe(true);
    expect(validated.conformant).toBe(false);
    expect(validated.approved).toBe(false);
    expect(validated.certified).toBe(false);
    expect(validated.validationAuthority).toBe("PROCESS_VALIDATION_AUTHORITY");
    expect(currentProcessValidations(review, validator).map((row) => row.validationId)).toEqual(["val-cond"]);
    const stale = recordProcessValidationState(review, validator, {
      ...conditionChain, citedCurrentness: "STALE", validationId: "val-stale", validationScope: "supplied operating pressure", validationState: "STALE",
      predecessorValidationId: validated.validationId,
    });
    expect(stale.currentness).toBe("STALE");
    expect(review.validations.find((row) => row.validationId === validated.validationId)?.recordStatus).toBe("SUPERSEDED");
    expect(review.validations.find((row) => row.validationId === validated.validationId)?.fingerprint).toBe(validated.fingerprint);
    expect(currentProcessValidations(review, validator)).toEqual([]);
    const handoffChain = chain("HANDOFF", handoff.handoffId, handoff.provenanceRef, handoff.fingerprint);
    const handoffReview = recordProcessReviewRequest(review, actor, {
      ...handoffChain, reviewRequestId: "req-hof", reviewType: "INTERFACE_HANDOFF_REVIEW", reviewScope: "mechanical duty handoff", requestedReviewerAuthority: "REVIEWER",
    });
    expect(handoffReview.counterpartValidated).toBe(false);
    expect(handoffReview.engineeringValidated).toBe(false);
    const handoffValidation = recordProcessValidationState(review, validator, {
      ...handoffChain, validationId: "val-hof", validationScope: "handoff communication only", validationState: "NOT_VALIDATED",
    });
    expect(handoffValidation.counterpartValidated).toBe(false);
    expect(handoffValidation.mechanicalSelectionValidated).toBe(false);
    expect(JSON.stringify(d4.objects)).toBe(before.equipment);
    expect(JSON.stringify(r3.conditions)).toBe(before.condition);
    expect(JSON.stringify(r4.evidence)).toBe(before.evidence);
    expect(JSON.stringify(r5.duties)).toBe(before.duty);
    expect(JSON.stringify(r6.records)).toBe(before.safety);
    const reject = (fn: () => unknown) => expect(fn).toThrow(/D6_R9_/);
    reject(() => recordProcessValidationState(review, validator, {
      ...dutyChain, validationId: "val-duty", validationScope: "duty requirement wording", validationState: "VALIDATED",
      basis: [{ kind: "R5_DUTY", id: duty.requirementId, fingerprint: duty.fingerprint }],
    }));
    reject(() => recordProcessReviewRequest(review, actor, {
      ...handoffChain, reviewRequestId: "req-transfer", reviewType: "INTERFACE_HANDOFF_REVIEW", reviewScope: "mechanical duty handoff", requestedReviewerAuthority: "REVIEWER", predecessorReviewRequestId: request.reviewRequestId,
    }));
    reject(() => recordProcessValidationState(review, validator, {
      ...handoffChain, validationId: "val-transfer", validationScope: "handoff communication only", validationState: "NOT_VALIDATED", predecessorValidationId: stale.validationId,
    }));
    reject(() => recordProcessReviewRequest(review, actor, {
      ...chain("EVIDENCE", energy.evidenceId, energy.provenanceRef, energy.fingerprint), reviewRequestId: "req-ev", reviewType: "PROCESS_SUBJECT_REVIEW", reviewScope: "external evidence", requestedReviewerAuthority: "REVIEWER", evidenceEqualsValidation: true,
    }));
    reject(() => recordProcessReviewRequest(review, actor, {
      ...chain("SAFETY", safety.recordId, safety.provenanceRef, safety.fingerprint), reviewRequestId: "req-safe", reviewType: "PROCESS_SUBJECT_REVIEW", reviewScope: "safety context", requestedReviewerAuthority: "REVIEWER", functionalSafety: true,
    }));
    reject(() => recordProcessReviewRequest(review, actor, { ...dutyChain, reviewRequestId: "req-mech", reviewType: "PROCESS_SUBJECT_REVIEW", reviewScope: "duty wording", requestedReviewerAuthority: "REVIEWER", mechanicalSelection: true }));
    reject(() => recordProcessReviewFinding(review, { ...reviewer, actorId: "AI_1", actorKind: "ai" }, {
      ...dutyChain, findingId: "find-ai", reviewRequestId: request.reviewRequestId, findingCategory: "OBSERVATION", severity: "REQUIRES_ATTENTION", findingText: "ai finding", disposition: "OPEN",
    }));
    reject(() => recordProcessValidationState(review, { ...validator, actorId: "admin-1", authority: "ADMIN" }, {
      ...conditionChain, validationId: "val-admin", validationScope: "supplied operating pressure", validationState: "VALIDATED", basis: [{ kind: "R3_CONDITION", id: condition.conditionId, fingerprint: condition.fingerprint }],
    }));
    reject(() => recordProcessReviewRequest(review, actor, { ...dutyChain, reviewRequestId: "req-scope", tenantId: "t2", reviewType: "PROCESS_SUBJECT_REVIEW", reviewScope: "duty wording", requestedReviewerAuthority: "REVIEWER" }));
    reject(() => recordProcessReviewRequest(review, actor, { ...dutyChain, reviewRequestId: "req-float", subjectFingerprint: "latest", reviewType: "PROCESS_SUBJECT_REVIEW", reviewScope: "duty wording", requestedReviewerAuthority: "REVIEWER" }));
    reject(() => recordProcessReviewRequest(review, actor, { ...dutyChain, reviewRequestId: "req-fp", reviewType: "PROCESS_SUBJECT_REVIEW", reviewScope: "duty wording", requestedReviewerAuthority: "REVIEWER", assertedFingerprint: "spoof" }));
    reject(() => recordProcessReviewRequest(review, actor, { ...dutyChain, reviewRequestId: "req-dup", reviewType: "PROCESS_SUBJECT_REVIEW", reviewScope: "duty requirement wording", requestedReviewerAuthority: "REVIEWER" }));
    reject(() => recordProcessFindingDisposition(review, reviewer, { ...dutyChain, dispositionId: "disp-closed", findingId: finding.findingId, disposition: "CLOSED" }));
    reject(() => recordProcessReviewCompletion(review, reviewer, { ...dutyChain, completionId: "done-auto", reviewRequestId: request.reviewRequestId, validated: true }));
    expect(repointProcessReview).toThrow(/D6_R9_/);
    expect(transferProcessValidation).toThrow(/D6_R9_/);
    expect(automaticallyValidateProcessEngineering).toThrow(/D6_R9_/);
    expect(closeProcessReassessmentAsValidated).toThrow(/D6_R9_/);
    expect(validateProcessCounterpart).toThrow(/D6_R9_/);
    expect(approveProcessFromValidation).toThrow(/D6_R9_/);
    expect(certifyProcessFromValidation).toThrow(/D6_R9_/);
    expect(determineProcessConformanceFromValidation).toThrow(/D6_R9_/);
    expect(review.history.length).toBeGreaterThan(0);
    const here = dirname(fileURLToPath(import.meta.url));
    const sourceText = readFileSync(join(here, "review-validation-governance.ts"), "utf8");
    expect(sourceText).toMatch(/D2_R9_VALIDATION_STATES|PRE_ISSUE_AI_BOUNDARY|assertHumanApprovalActor/);
    expect(sourceText).not.toMatch(/createHash|from ["']@rtb\/engineering-review["']|CREATE TABLE/);
    expect(scanAnalysisFormulaBypass(join(here, "review-validation-governance.ts"), sourceText)).toEqual([]);
    const packageJson = JSON.parse(readFileSync(join(here, "../../package.json"), "utf8")) as { dependencies: Record<string, string> };
    expect(Object.keys(packageJson.dependencies).sort()).toEqual(["@rtb/database", "@rtb/engineering-review", "@rtb/platform-commerce", "@rtb/platform-intelligence", "@rtb/platform-kernel", "@rtb/types", "docx", "exceljs", "pptxgenjs", "zod"]);
  });
});
