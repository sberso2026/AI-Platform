import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { D6_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT as ARCHITECTURE_THREAD_COUNT, D6_RUNTIME_COUNT as ARCHITECTURE_RUNTIME_COUNT } from "@rtb/types";
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
import { createD6R8Store, recordProcessInterfaceHandoff } from "./discipline-interfaces-handoffs";
import { D6_R10_STARTED, D6_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT as R9_THREAD_COUNT, D6_RUNTIME_COUNT as R9_RUNTIME_COUNT, createD6R9Store, recordProcessReviewCompletion, recordProcessReviewRequest, recordProcessValidationState } from "./review-validation-governance";
import {
  ADMIN_CAN_OVERRIDE_D6_FINGERPRINT_MISMATCH_AS_VALID,
  ADMIN_EQUALS_D6_PROCESS_ENGINEERING_AUTHORITY,
  AI_CAN_INVENT_D6_LINEAGE_RELATIONSHIP,
  AI_CAN_REPOINT_D6_HISTORICAL_REFERENCE,
  AI_EQUALS_D6_PROCESS_ENGINEERING_AUTHORITY,
  CROSS_TENANT_D6_R10_ACCESS_ALLOWED,
  CURRENT_D6_RECORD_EQUALS_APPROVED,
  CURRENT_D6_RECORD_EQUALS_CERTIFIED,
  CURRENT_D6_RECORD_EQUALS_CONFORMANT,
  CURRENT_D6_RECORD_EQUALS_VALIDATED,
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
  D6_CURRENT_RECORD_IDENTIFICATION_IMPLEMENTED,
  D6_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT,
  D6_CURRENTNESS_DIGITAL_THREAD_RUNTIME_IMPLEMENTED,
  D6_CURRENTNESS_DIGITAL_THREAD_RUNTIME_READY,
  D6_D9_RUNTIME_INTEGRATION_COUNT,
  D6_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
  D6_DEPRESSURING_CALCULATION_RUNTIME_COUNT,
  D6_ENERGY_BALANCE_CALCULATION_RUNTIME_COUNT,
  D6_EQUALS_D1_STRUCTURAL_AUTHORITY,
  D6_EQUALS_D2_CIVIL_AUTHORITY,
  D6_EQUALS_D3_GEOTECHNICAL_AUTHORITY,
  D6_EQUALS_D4_MECHANICAL_AUTHORITY,
  D6_EQUALS_D5_PIPING_AUTHORITY,
  D6_EQUALS_D7_ELECTRICAL_AUTHORITY,
  D6_EQUALS_D8_INSTRUMENTATION_CONTROL_AUTHORITY,
  D6_EQUIPMENT_DUTY_CALCULATION_RUNTIME_COUNT,
  D6_EXPLICIT_LINEAGE_SUPPORTED,
  D6_HISTORICAL_REFERENCE_AUTO_REPOINT_ALLOWED,
  D6_HYDRAULIC_CALCULATION_RUNTIME_COUNT,
  D6_INFERRED_LINEAGE_ALLOWED,
  D6_MASS_BALANCE_CALCULATION_RUNTIME_COUNT,
  D6_PRESSURE_DROP_CALCULATION_RUNTIME_COUNT,
  D6_PROCESS_CALCULATION_RUNTIME_COUNT,
  D6_R10_AUTO_MUTATES_INTERFACE_COUNTERPART,
  D6_R10_AUTO_MUTATES_R1_IDENTITY,
  D6_R10_AUTO_MUTATES_R2_CONTEXT,
  D6_R10_AUTO_MUTATES_R3_CONDITIONS,
  D6_R10_AUTO_MUTATES_R4_EVIDENCE,
  D6_R10_AUTO_MUTATES_R5_DUTY_UTILITY,
  D6_R10_AUTO_MUTATES_R6_SAFETY_RELIEF,
  D6_R10_AUTO_MUTATES_R7_CHANGE_GOVERNANCE,
  D6_R10_AUTO_MUTATES_R8_HANDOFF,
  D6_R10_AUTO_MUTATES_R9_REVIEW_VALIDATION,
  D6_R10_AUTO_REPOINTS_INTERFACE_COUNTERPART,
  D6_R10_AUTO_REPOINTS_STALE_REFERENCE,
  D6_R10_AUTO_REPOINTS_SUPERSEDED_REFERENCE,
  D6_R10_CANONICAL_THREAD_RELATIONSHIPS_IMPLEMENTED,
  D6_R10_FINGERPRINT_CURRENTNESS_INTEGRATED,
  D6_R10_FINGERPRINT_MISMATCH_AUTO_REBASELINED,
  D6_R10_FINGERPRINT_MISMATCH_AUTO_REPAIRED,
  D6_R10_FINGERPRINT_MISMATCH_DETECTED,
  D6_R10_HISTORICAL_RECORD_MUTATED_TO_CURRENT,
  D6_R10_HISTORICAL_REFERENCE_AUTO_REPOINTED,
  D6_R10_HISTORY_PRESERVED,
  D6_R10_INFERRED_THREAD_RELATIONSHIP_ALLOWED,
  D6_R10_MATURITY,
  D6_R10_R1_IDENTITY_CURRENTNESS_INTEGRATED,
  D6_R10_R2_CONTEXT_CURRENTNESS_INTEGRATED,
  D6_R10_R3_CONDITION_CURRENTNESS_INTEGRATED,
  D6_R10_R4_EVIDENCE_CURRENTNESS_INTEGRATED,
  D6_R10_R5_DUTY_UTILITY_CURRENTNESS_INTEGRATED,
  D6_R10_R6_SAFETY_RELIEF_CURRENTNESS_INTEGRATED,
  D6_R10_R7_CHANGE_CURRENTNESS_INTEGRATED,
  D6_R10_R7_REASSESSMENT_CURRENTNESS_INTEGRATED,
  D6_R10_R7_SUPERSESSION_INTEGRATED,
  D6_R10_R8_INTERFACE_CURRENTNESS_INTEGRATED,
  D6_R10_R9_REVIEW_CURRENTNESS_INTEGRATED,
  D6_R10_R9_VALIDATION_CURRENTNESS_INTEGRATED,
  D6_R10_REVIEW_STATE_AUTO_TRANSFER_ALLOWED,
  D6_R10_SOURCE_AUTO_REPOINTED,
  D6_R10_STATUS,
  D6_R10_TRIGGERS_AUTOMATIC_APPROVAL,
  D6_R10_TRIGGERS_AUTOMATIC_REDESIGN,
  D6_R10_TRIGGERS_AUTOMATIC_REVALIDATION,
  D6_R10_TRIGGERS_PROCESS_RECALCULATION,
  D6_R10_VALIDATION_STATE_AUTO_TRANSFER_ALLOWED,
  D6_R11_CANONICAL_PHASE,
  D6_R11_CANONICAL_SCOPE,
  D6_R11_PHASE_TYPE,
  D6_R11_STARTED,
  D6_R1_R9_EXACT_REVISIONS_REUSED,
  D6_R9_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT,
  D6_R9_RUNTIME_COUNT,
  D6_RELIEF_CALCULATION_RUNTIME_COUNT,
  D6_REUSES_CANONICAL_CURRENTNESS,
  D6_REUSES_CANONICAL_DIGITAL_THREAD,
  D6_REUSES_CANONICAL_FINGERPRINT,
  D6_RUNTIME_COUNT,
  D6_RUNTIME_STARTED,
  D6_STALE_RECORD_STATE_SUPPORTED,
  D6_SUPERSEDED_RECORD_STATE_SUPPORTED,
  D6_UTILITY_CALCULATION_RUNTIME_COUNT,
  D7_RUNTIME_STARTED,
  D8_RUNTIME_STARTED,
  D9_RUNTIME_COUNT,
  D9_RUNTIME_STARTED,
  DATABASE_SCHEMA_CHANGED,
  EXACT_D6_R10_SOURCE_REVISION_REQUIRED,
  FLOATING_D6_R10_REFERENCE_ALLOWED,
  NEW_DEPENDENCY_ADDED,
  NEW_DESIGN_CONDITION_AUTO_REPLACES_PRIOR_DESIGN_CONDITION,
  NEW_D6_IDENTITY_REVISION_AUTO_INVALIDATES_PRIOR_REVISION,
  NEW_D6_IDENTITY_REVISION_AUTO_REPOINTS_HISTORY,
  NEW_DUTY_EVIDENCE_AUTO_REPLACES_ADOPTED_DUTY,
  NEW_EXTERNAL_EVIDENCE_AUTO_REPLACES_PRIOR_EVIDENCE,
  NEW_HAZARD_STUDY_OUTPUT_AUTO_CLOSES_PRIOR_FINDING,
  NEW_OPERATING_CONDITION_AUTO_REPLACES_PRIOR_OPERATING_CONDITION,
  NEW_R2_CONTEXT_AUTO_REWRITES_HISTORICAL_RELATIONSHIP,
  NEW_RELIEF_EVIDENCE_AUTO_REPLACES_RELIEF_SCENARIO,
  NEW_SIL_LOPA_EVIDENCE_AUTO_REPLACES_PRIOR_SAFETY_REQUIREMENT,
  NEW_SOURCE_CONDITION_AUTO_REPLACES_ADOPTED_PROCESS_CONDITION,
  NEW_UTILITY_EVIDENCE_AUTO_REPLACES_ADOPTED_REQUIREMENT,
  PARALLEL_D6_CURRENTNESS_ENGINE_CREATED,
  PARALLEL_D6_DIGITAL_THREAD_CREATED,
  PRIOR_D6_REVIEW_AUTO_TRANSFERS_TO_NEW_REVISION,
  PRIOR_D6_VALIDATION_AUTO_TRANSFERS_TO_NEW_REVISION,
  REASSESSMENT_REQUIRED_D6_RECORD_EXPOSED_AS_FULLY_CURRENT,
  REASSESSMENT_REQUIRED_D6_RECORD_EXPOSED_AS_VALIDATED,
  SECOND_D6_FINGERPRINT_ALGORITHM_CREATED,
  STALE_D6_HANDOFF_EXPOSED_AS_CURRENT,
  STALE_D6_RECORD_EQUALS_INVALID,
  STALE_D6_RECORD_EQUALS_REJECTED,
  STALE_D6_REVIEW_EXPOSED_AS_CURRENT_REVIEW,
  STALE_D6_VALIDATION_EXPOSED_AS_CURRENT,
  STALE_PROCESS_EVIDENCE_EXPOSED_AS_CURRENT,
  STALE_R2_CONTEXT_EXPOSED_AS_CURRENT,
  SUPERSEDED_D6_HANDOFF_EXPOSED_AS_CURRENT,
  SUPERSEDED_D6_RECORD_DELETED,
  SUPERSEDED_D6_RECORD_EQUALS_INVALID,
  SUPERSEDED_D6_RECORD_EQUALS_REJECTED,
  SUPERSEDED_D6_RECORD_EXPOSED_AS_CURRENT,
  SUPERSEDED_D6_VALIDATION_EXPOSED_AS_CURRENT,
  TENANT_WORKSPACE_PROJECT_D6_R10_SCOPE_ENFORCED,
  D6_R10_DUPLICATE_GOVERNANCE_IMPLEMENTED,
  D6_R10_PROVENANCE_PRESERVED,
  D6_R10_PROVENANCE_REQUIRED,
  D6_R10_REPLAY_PROTECTION_IMPLEMENTED,
  D6_R10_SPOOFING_PROTECTION_IMPLEMENTED,
  approveFromProcessCurrentness,
  createD6R10Store,
  currentProcessPins,
  exposedProcessCurrentness,
  inferProcessLineage,
  recalculateFromProcessCurrentness,
  recordProcessCurrentness,
  recordProcessLineage,
  recordProcessSupersession,
  redesignFromProcessCurrentness,
  repointProcessDigitalThread,
  replaceAdoptedDutyFromCurrentness,
  replaceAdoptedProcessConditionFromCurrentness,
  replaceAdoptedUtilityFromCurrentness,
  replaceDesignConditionFromCurrentness,
  replaceOperatingConditionFromCurrentness,
  replaceProcessEvidenceFromCurrentness,
  replaceReliefScenarioFromCurrentness,
  replaceSafetyRequirementFromCurrentness,
  revalidateFromProcessCurrentness,
  traceProcessDigitalThread,
  transferProcessReviewFromCurrentness,
  transferProcessValidationFromCurrentness,
} from "./currentness-digital-thread";

describe("EOS-D6-R10 currentness and digital thread", () => {
  it("keeps exact Process revisions current without validating, inferring, or repointing them", () => {
    expect(D6_R10_STATUS).toBe("CURRENTNESS_AND_DIGITAL_THREAD_IMPLEMENTED");
    expect(D6_R10_MATURITY).toBe(D6_R10_STATUS);
    expect(D6_RUNTIME_STARTED).toBe(true);
    expect(D6_RUNTIME_COUNT).toBe(10);
    expect(D6_R9_RUNTIME_COUNT).toBe(9);
    expect(R9_RUNTIME_COUNT).toBe(9);
    expect(ARCHITECTURE_RUNTIME_COUNT).toBe(0);
    expect(D6_CURRENTNESS_DIGITAL_THREAD_RUNTIME_IMPLEMENTED).toBe(true);
    expect(D6_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT).toBe(1);
    expect(D6_CURRENTNESS_DIGITAL_THREAD_RUNTIME_READY).toBe(true);
    expect(D6_R9_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT).toBe(0);
    expect(R9_THREAD_COUNT).toBe(0);
    expect(ARCHITECTURE_THREAD_COUNT).toBe(0);
    expect(D6_R10_STARTED).toBe(false);
    expect(D6_R11_STARTED).toBe(false);
    expect(D6_R11_CANONICAL_PHASE).toBe("EOS-D6-R11-D9-SOURCE-CONTRACT");
    expect(D6_R11_PHASE_TYPE).toBe("D9_SOURCE_CONTRACT");
    expect(D6_R11_CANONICAL_SCOPE).toContain("exact R1-R10 revisions");
    expect(D6_R1_R9_EXACT_REVISIONS_REUSED && EXACT_D6_R10_SOURCE_REVISION_REQUIRED && D6_EXPLICIT_LINEAGE_SUPPORTED && D6_CURRENT_RECORD_IDENTIFICATION_IMPLEMENTED && D6_STALE_RECORD_STATE_SUPPORTED && D6_SUPERSEDED_RECORD_STATE_SUPPORTED).toBe(true);
    expect(FLOATING_D6_R10_REFERENCE_ALLOWED || D6_R10_SOURCE_AUTO_REPOINTED || D6_INFERRED_LINEAGE_ALLOWED || D6_HISTORICAL_REFERENCE_AUTO_REPOINT_ALLOWED).toBe(false);
    expect(D6_REUSES_CANONICAL_CURRENTNESS && D6_REUSES_CANONICAL_DIGITAL_THREAD && D6_REUSES_CANONICAL_FINGERPRINT && D6_R10_CANONICAL_THREAD_RELATIONSHIPS_IMPLEMENTED && D6_R10_FINGERPRINT_CURRENTNESS_INTEGRATED && D6_R10_FINGERPRINT_MISMATCH_DETECTED).toBe(true);
    expect(PARALLEL_D6_CURRENTNESS_ENGINE_CREATED || PARALLEL_D6_DIGITAL_THREAD_CREATED || SECOND_D6_FINGERPRINT_ALGORITHM_CREATED || D6_R10_INFERRED_THREAD_RELATIONSHIP_ALLOWED || D6_R10_FINGERPRINT_MISMATCH_AUTO_REPAIRED || D6_R10_FINGERPRINT_MISMATCH_AUTO_REBASELINED).toBe(false);
    expect(CURRENT_D6_RECORD_EQUALS_VALIDATED || CURRENT_D6_RECORD_EQUALS_APPROVED || CURRENT_D6_RECORD_EQUALS_CONFORMANT || CURRENT_D6_RECORD_EQUALS_CERTIFIED).toBe(false);
    expect(STALE_D6_RECORD_EQUALS_INVALID || STALE_D6_RECORD_EQUALS_REJECTED || SUPERSEDED_D6_RECORD_EQUALS_INVALID || SUPERSEDED_D6_RECORD_EQUALS_REJECTED).toBe(false);
    expect(D6_R10_HISTORY_PRESERVED && D6_R10_PROVENANCE_REQUIRED && D6_R10_PROVENANCE_PRESERVED && D6_R10_DUPLICATE_GOVERNANCE_IMPLEMENTED && D6_R10_REPLAY_PROTECTION_IMPLEMENTED && D6_R10_SPOOFING_PROTECTION_IMPLEMENTED).toBe(true);
    expect(D6_R10_HISTORICAL_REFERENCE_AUTO_REPOINTED || D6_R10_HISTORICAL_RECORD_MUTATED_TO_CURRENT || D6_R10_AUTO_REPOINTS_STALE_REFERENCE || D6_R10_AUTO_REPOINTS_SUPERSEDED_REFERENCE).toBe(false);
    expect(D6_R10_R1_IDENTITY_CURRENTNESS_INTEGRATED && D6_R10_R2_CONTEXT_CURRENTNESS_INTEGRATED && D6_R10_R3_CONDITION_CURRENTNESS_INTEGRATED && D6_R10_R4_EVIDENCE_CURRENTNESS_INTEGRATED && D6_R10_R5_DUTY_UTILITY_CURRENTNESS_INTEGRATED && D6_R10_R6_SAFETY_RELIEF_CURRENTNESS_INTEGRATED).toBe(true);
    expect(D6_R10_R7_CHANGE_CURRENTNESS_INTEGRATED && D6_R10_R7_REASSESSMENT_CURRENTNESS_INTEGRATED && D6_R10_R7_SUPERSESSION_INTEGRATED && D6_R10_R8_INTERFACE_CURRENTNESS_INTEGRATED && D6_R10_R9_REVIEW_CURRENTNESS_INTEGRATED && D6_R10_R9_VALIDATION_CURRENTNESS_INTEGRATED).toBe(true);
    expect(NEW_D6_IDENTITY_REVISION_AUTO_REPOINTS_HISTORY || NEW_D6_IDENTITY_REVISION_AUTO_INVALIDATES_PRIOR_REVISION || NEW_R2_CONTEXT_AUTO_REWRITES_HISTORICAL_RELATIONSHIP || STALE_R2_CONTEXT_EXPOSED_AS_CURRENT).toBe(false);
    expect(NEW_SOURCE_CONDITION_AUTO_REPLACES_ADOPTED_PROCESS_CONDITION || NEW_OPERATING_CONDITION_AUTO_REPLACES_PRIOR_OPERATING_CONDITION || NEW_DESIGN_CONDITION_AUTO_REPLACES_PRIOR_DESIGN_CONDITION).toBe(false);
    expect(NEW_EXTERNAL_EVIDENCE_AUTO_REPLACES_PRIOR_EVIDENCE || STALE_PROCESS_EVIDENCE_EXPOSED_AS_CURRENT || NEW_DUTY_EVIDENCE_AUTO_REPLACES_ADOPTED_DUTY || NEW_UTILITY_EVIDENCE_AUTO_REPLACES_ADOPTED_REQUIREMENT).toBe(false);
    expect(NEW_RELIEF_EVIDENCE_AUTO_REPLACES_RELIEF_SCENARIO || NEW_HAZARD_STUDY_OUTPUT_AUTO_CLOSES_PRIOR_FINDING || NEW_SIL_LOPA_EVIDENCE_AUTO_REPLACES_PRIOR_SAFETY_REQUIREMENT).toBe(false);
    expect(REASSESSMENT_REQUIRED_D6_RECORD_EXPOSED_AS_VALIDATED || REASSESSMENT_REQUIRED_D6_RECORD_EXPOSED_AS_FULLY_CURRENT || SUPERSEDED_D6_RECORD_DELETED || SUPERSEDED_D6_RECORD_EXPOSED_AS_CURRENT).toBe(false);
    expect(STALE_D6_HANDOFF_EXPOSED_AS_CURRENT || SUPERSEDED_D6_HANDOFF_EXPOSED_AS_CURRENT || D6_R10_AUTO_REPOINTS_INTERFACE_COUNTERPART || D6_R10_AUTO_MUTATES_INTERFACE_COUNTERPART).toBe(false);
    expect(PRIOR_D6_REVIEW_AUTO_TRANSFERS_TO_NEW_REVISION || STALE_D6_REVIEW_EXPOSED_AS_CURRENT_REVIEW || PRIOR_D6_VALIDATION_AUTO_TRANSFERS_TO_NEW_REVISION || STALE_D6_VALIDATION_EXPOSED_AS_CURRENT || SUPERSEDED_D6_VALIDATION_EXPOSED_AS_CURRENT).toBe(false);
    expect(D6_R10_REVIEW_STATE_AUTO_TRANSFER_ALLOWED || D6_R10_VALIDATION_STATE_AUTO_TRANSFER_ALLOWED).toBe(false);
    expect(D6_R10_AUTO_MUTATES_R1_IDENTITY || D6_R10_AUTO_MUTATES_R2_CONTEXT || D6_R10_AUTO_MUTATES_R3_CONDITIONS || D6_R10_AUTO_MUTATES_R4_EVIDENCE || D6_R10_AUTO_MUTATES_R5_DUTY_UTILITY || D6_R10_AUTO_MUTATES_R6_SAFETY_RELIEF || D6_R10_AUTO_MUTATES_R7_CHANGE_GOVERNANCE || D6_R10_AUTO_MUTATES_R8_HANDOFF || D6_R10_AUTO_MUTATES_R9_REVIEW_VALIDATION).toBe(false);
    expect(D6_R10_TRIGGERS_PROCESS_RECALCULATION || D6_R10_TRIGGERS_AUTOMATIC_REDESIGN || D6_R10_TRIGGERS_AUTOMATIC_REVALIDATION || D6_R10_TRIGGERS_AUTOMATIC_APPROVAL).toBe(false);
    expect(TENANT_WORKSPACE_PROJECT_D6_R10_SCOPE_ENFORCED).toBe(true);
    expect(CROSS_TENANT_D6_R10_ACCESS_ALLOWED || AI_EQUALS_D6_PROCESS_ENGINEERING_AUTHORITY || ADMIN_EQUALS_D6_PROCESS_ENGINEERING_AUTHORITY || AI_CAN_INVENT_D6_LINEAGE_RELATIONSHIP || AI_CAN_REPOINT_D6_HISTORICAL_REFERENCE || ADMIN_CAN_OVERRIDE_D6_FINGERPRINT_MISMATCH_AS_VALID).toBe(false);
    expect(D6_EQUALS_D1_STRUCTURAL_AUTHORITY || D6_EQUALS_D2_CIVIL_AUTHORITY || D6_EQUALS_D3_GEOTECHNICAL_AUTHORITY || D6_EQUALS_D4_MECHANICAL_AUTHORITY || D6_EQUALS_D5_PIPING_AUTHORITY || D6_EQUALS_D7_ELECTRICAL_AUTHORITY || D6_EQUALS_D8_INSTRUMENTATION_CONTROL_AUTHORITY).toBe(false);
    expect([
      D6_D9_SOURCE_CONTRACT_RUNTIME_COUNT, D6_D9_RUNTIME_INTEGRATION_COUNT,
      D6_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT, D6_CROSS_DISCIPLINE_CONFLICT_DETECTION_RUNTIME_COUNT, D6_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT, D6_CROSS_DISCIPLINE_RECOMMENDATION_RUNTIME_COUNT,
      D6_PROCESS_CALCULATION_RUNTIME_COUNT, D6_MASS_BALANCE_CALCULATION_RUNTIME_COUNT, D6_ENERGY_BALANCE_CALCULATION_RUNTIME_COUNT, D6_HYDRAULIC_CALCULATION_RUNTIME_COUNT, D6_PRESSURE_DROP_CALCULATION_RUNTIME_COUNT,
      D6_EQUIPMENT_DUTY_CALCULATION_RUNTIME_COUNT, D6_RELIEF_CALCULATION_RUNTIME_COUNT, D6_DEPRESSURING_CALCULATION_RUNTIME_COUNT, D6_UTILITY_CALCULATION_RUNTIME_COUNT, D6_AUTOMATIC_PROCESS_CALCULATION_RUNTIME_COUNT, D6_AUTOMATIC_REDESIGN_RUNTIME_COUNT,
      D6_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT, D6_CONFORMANCE_DETERMINATION_RUNTIME_COUNT, D6_APPROVAL_RUNTIME_COUNT, D6_CERTIFICATION_RUNTIME_COUNT,
    ]).toEqual([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    expect(D1_STRUCTURAL_PACK_COMPLETE || D1N_REOPENED || D2_REOPENED || D3_REOPENED || D4_REOPENED || D5_REOPENED).toBe(false);
    expect(D2_TRACK_COMPLETE && D3_TRACK_COMPLETE && D4_TRACK_COMPLETE && D5_TRACK_COMPLETE).toBe(true);
    expect(D7_RUNTIME_STARTED || D8_RUNTIME_STARTED || D9_RUNTIME_STARTED).toBe(false);
    expect(D9_RUNTIME_COUNT).toBe(0);
    expect(DATABASE_SCHEMA_CHANGED || NEW_DEPENDENCY_ADDED).toBe(false);
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D6.R10.CURRENTNESS_AND_DIGITAL_THREAD")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D6.R11.D9_SOURCE_CONTRACT")?.implementationState).toBe("IMPLEMENTED_BOUNDED");

    const actor = { actorId: "proc-recorder", tenantId: "t1", workspaceId: "w1", projectId: "p1", authority: D6_CONTEXT_AUTHORITY };
    const reviewer = { ...actor, actorId: "rev-1", authority: "REVIEWER" as const, actorKind: "human" as const, aal: "aal2" };
    const validator = { ...actor, actorId: "val-1", authority: "PROCESS_VALIDATION_AUTHORITY" as const, actorKind: "human" as const, aal: "aal2" };
    const r1 = createD6R1Store();
    recordProcessContext(r1, actor, { contextId: "ctx-1", citedLifecycleStage: "FEED", provenanceRef: "prov-ctx", sourceBasisRef: "basis-ctx" });
    const identity = (objectId: string, objectType: string) => recordProcessObjectIdentity(r1, actor, {
      objectId, contextId: "ctx-1", objectType, citedLifecycleStage: "FEED", provenanceRef: `prov-${objectId}`, sourceBasisRef: `basis-${objectId}`,
    });
    const stream = identity("stream-1", "PROCESS_STREAM");
    const nextStream = identity("stream-2", "PROCESS_STREAM");
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
      dependencies: [link("R5_DUTY", duty.requirementId, duty.fingerprint), link("R3_CONDITION", condition.conditionId, condition.fingerprint)],
    });
    const reassessment = recordProcessReassessment(r7, actor, {
      ...subject, reassessmentId: "ras-duty", changeId: change.changeId, targetId: duty.requirementId, targetFingerprint: duty.fingerprint, state: "REASSESSMENT_REQUIRED",
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
      handoffId: "hof-d4", sourceKind: "R3_CONDITION", sourceId: condition.conditionId, sourceFingerprint: condition.fingerprint,
      dependencies: [link("R3_CONDITION", condition.conditionId, condition.fingerprint)], counterpartDiscipline: "mechanical", interfaceTopic: "OPERATING_OR_DESIGN_CONDITION_SOURCE",
      counterpartId: equipment.objectId, counterpartRevision: equipment.provenanceRef, counterpartFingerprint: equipment.fingerprint, handoffStatus: "COMPLETE",
    });
    const review = createD6R9Store(r8);
    const chain = {
      contextId: "ctx-1", objectId: stream.objectId, objectRevisionFingerprint: stream.fingerprint,
      r2Kind: "STREAM", r2RecordId: streamContext.streamRecordId, r2Fingerprint: streamContext.fingerprint,
      subjectKind: "CONDITION", subjectId: condition.conditionId, subjectRevision: condition.provenanceRef, subjectFingerprint: condition.fingerprint,
      tenantId: "t1", workspaceId: "w1", projectId: "p1", citedCurrentness: "CURRENT", citedLifecycleStage: "FEED",
      applicability: `applies only to ${stream.objectId}`, limitations: "review records the governed activity only", provenanceRef: "prov-r9", sourceBasisRef: "basis-r9",
    };
    const request = recordProcessReviewRequest(review, actor, { ...chain, reviewRequestId: "req-cond", reviewType: "PROCESS_SUBJECT_REVIEW", reviewScope: "supplied pressure", requestedReviewerAuthority: "REVIEWER" });
    recordProcessReviewCompletion(review, reviewer, { ...chain, completionId: "done-cond", reviewRequestId: request.reviewRequestId });
    const validated = recordProcessValidationState(review, validator, {
      ...chain, validationId: "val-cond", validationScope: "supplied operating pressure", validationState: "VALIDATED",
      basis: [{ kind: "R3_CONDITION", id: condition.conditionId, fingerprint: condition.fingerprint }], reviewRequestId: request.reviewRequestId,
    });
    const before = {
      objects: JSON.stringify(r1.objects),
      streams: JSON.stringify(r2.streams),
      conditions: JSON.stringify(r3.conditions),
      evidence: JSON.stringify(r4.evidence),
      duties: JSON.stringify(r5.duties),
      safety: JSON.stringify(r6.records),
      handoff: JSON.stringify(r8.handoffs),
      reviews: JSON.stringify(review.requests),
      validations: JSON.stringify(review.validations),
      equipment: JSON.stringify(d4.objects),
    };
    const thread = createD6R10Store(review);
    const end = <T extends "OBJECT" | "OPERATING_CONDITION" | "EVIDENCE" | "SAFETY" | "HANDOFF" | "REVIEW_REQUEST" | "VALIDATION" | "STREAM">(subjectKind: T, subjectId: string, subjectRevision: string, subjectFingerprint: string) => ({ subjectKind, subjectId, subjectRevision, subjectFingerprint });
    const streamEnd = end("OBJECT", stream.objectId, stream.provenanceRef, stream.fingerprint);
    const conditionEnd = end("OPERATING_CONDITION", condition.conditionId, condition.provenanceRef, condition.fingerprint);
    const lineage = recordProcessLineage(thread, actor, {
      lineageId: "lin-1", contextId: "ctx-1", source: streamEnd, target: conditionEnd, relationshipType: "OBJECT_REFERENCE", citedCurrentness: "CURRENT", provenanceRef: "prov-r10",
    });
    expect(recordProcessLineage(thread, actor, {
      lineageId: "lin-1", contextId: "ctx-1", source: streamEnd, target: conditionEnd, relationshipType: "OBJECT_REFERENCE", citedCurrentness: "CURRENT", provenanceRef: "prov-r10",
    })).toBe(lineage);
    expect(lineage.engineeringValidated).toBe(false);
    const traced = traceProcessDigitalThread(thread, actor, { contextId: "ctx-1", subject: streamEnd, citedCurrentness: "CURRENT" });
    expect(traced.nodes.map((row) => row.subjectId)).toEqual([stream.objectId, condition.conditionId]);
    expect(traced.currentness).toBe("CURRENT");
    expect(currentProcessPins(thread, actor).some((row) => row.subjectId === condition.conditionId)).toBe(true);
    expect(currentProcessPins(thread, actor).some((row) => row.subjectId === duty.requirementId)).toBe(false);
    expect(exposedProcessCurrentness(thread, { subjectKind: "DUTY", subjectId: duty.requirementId, subjectRevision: duty.provenanceRef, subjectFingerprint: duty.fingerprint, contextId: "ctx-1" })).toBe("REASSESSMENT_REQUIRED");
    expect(reassessment.engineeringValidated).toBe(false);
    expect(exposedProcessCurrentness(thread, { subjectKind: "REASSESSMENT", subjectId: reassessment.reassessmentId, subjectRevision: reassessment.provenanceRef, subjectFingerprint: reassessment.fingerprint, contextId: "ctx-1" })).toBe("REASSESSMENT_REQUIRED");
    const staleCondition = recordProcessCurrentness(thread, actor, { eventId: "cur-cond", contextId: "ctx-1", subject: conditionEnd, currentness: "STALE", provenanceRef: "prov-stale-cond" })[0];
    expect(staleCondition?.currentness).toBe("STALE");
    expect(staleCondition?.engineeringInvalid).toBe(false);
    expect(staleCondition?.engineeringValidated).toBe(false);
    expect(staleCondition?.rejected).toBe(false);
    expect(currentProcessPins(thread, actor).some((row) => row.subjectId === condition.conditionId)).toBe(false);
    recordProcessCurrentness(thread, actor, { eventId: "cur-ev", contextId: "ctx-1", subject: end("EVIDENCE", energy.evidenceId, energy.provenanceRef, energy.fingerprint), currentness: "STALE", provenanceRef: "prov-stale-ev" });
    recordProcessCurrentness(thread, actor, { eventId: "cur-safe", contextId: "ctx-1", subject: end("SAFETY", safety.recordId, safety.provenanceRef, safety.fingerprint), currentness: "STALE", provenanceRef: "prov-stale-safe" });
    recordProcessCurrentness(thread, actor, { eventId: "cur-hof", contextId: "ctx-1", subject: end("HANDOFF", handoff.handoffId, handoff.provenanceRef, handoff.fingerprint), currentness: "STALE", provenanceRef: "prov-stale-hof" });
    recordProcessCurrentness(thread, actor, { eventId: "cur-rev", contextId: "ctx-1", subject: end("REVIEW_REQUEST", request.reviewRequestId, request.subjectRevision, request.fingerprint), currentness: "STALE", provenanceRef: "prov-stale-rev" });
    recordProcessCurrentness(thread, actor, { eventId: "cur-val", contextId: "ctx-1", subject: end("VALIDATION", validated.validationId, validated.subjectRevision, validated.fingerprint), currentness: "STALE", provenanceRef: "prov-stale-val" });
    expect(currentProcessPins(thread, actor).some((row) => row.subjectKind === "VALIDATION" && row.subjectId === validated.validationId)).toBe(false);
    expect(currentProcessPins(thread, actor).some((row) => row.subjectKind === "REVIEW_REQUEST" && row.subjectId === request.reviewRequestId)).toBe(false);
    expect(currentProcessPins(thread, actor).some((row) => row.subjectKind === "HANDOFF")).toBe(false);
    expect(currentProcessPins(thread, actor).some((row) => row.subjectKind === "EVIDENCE")).toBe(false);
    const superseded = recordProcessSupersession(thread, actor, {
      supersessionId: "sup-1", contextId: "ctx-1", predecessor: streamEnd, successor: end("OBJECT", nextStream.objectId, nextStream.provenanceRef, nextStream.fingerprint), citedCurrentness: "CURRENT", provenanceRef: "prov-sup",
    });
    expect(superseded.deleted).toBe(false);
    expect(superseded.historicalEdgesRewritten).toBe(false);
    expect(superseded.priorRevisionInvalidated).toBe(false);
    expect(thread.lineage[0]?.source.subjectFingerprint).toBe(stream.fingerprint);
    expect(exposedProcessCurrentness(thread, { ...streamEnd, contextId: "ctx-1" })).toBe("SUPERSEDED");
    expect(currentProcessPins(thread, actor).some((row) => row.subjectId === stream.objectId)).toBe(false);
    expect(r1.objects.find((row) => row.objectId === stream.objectId)?.recordStatus).toBe("CURRENT");
    expect(r1.objects.find((row) => row.objectId === stream.objectId)?.fingerprint).toBe(stream.fingerprint);
    expect(request.requestStatus).toBe("REQUESTED");
    expect(request.reviewCompleted).toBe(false);
    expect(validated.engineeringValidated).toBe(true);
    expect(validated.approved).toBe(false);
    expect(safety.hazardClosed).toBe(false);
    expect(handoff.counterpart?.fingerprint).toBe(equipment.fingerprint);
    expect(JSON.stringify(r1.objects)).toBe(before.objects);
    expect(JSON.stringify(r2.streams)).toBe(before.streams);
    expect(JSON.stringify(r3.conditions)).toBe(before.conditions);
    expect(JSON.stringify(r4.evidence)).toBe(before.evidence);
    expect(JSON.stringify(r5.duties)).toBe(before.duties);
    expect(JSON.stringify(r6.records)).toBe(before.safety);
    expect(JSON.stringify(r8.handoffs)).toBe(before.handoff);
    expect(JSON.stringify(review.requests)).toBe(before.reviews);
    expect(JSON.stringify(review.validations)).toBe(before.validations);
    expect(JSON.stringify(d4.objects)).toBe(before.equipment);
    expect(thread.history.length).toBeGreaterThan(0);
    const reject = (fn: () => unknown) => expect(fn).toThrow(/D6_R10_/);
    reject(() => traceProcessDigitalThread(thread, actor, { contextId: "ctx-1", subject: streamEnd, citedCurrentness: "CURRENT" }));
    reject(() => recordProcessLineage(thread, actor, { lineageId: "lin-spoof", contextId: "ctx-1", source: streamEnd, target: conditionEnd, relationshipType: "OBJECT_REFERENCE", citedCurrentness: "STALE", provenanceRef: "prov-spoof", assertedFingerprint: "spoof" }));
    reject(() => recordProcessLineage(thread, actor, { lineageId: "lin-dup", contextId: "ctx-1", source: end("OBJECT", nextStream.objectId, nextStream.provenanceRef, nextStream.fingerprint), target: end("STREAM", streamContext.streamRecordId, streamContext.provenanceRef, streamContext.fingerprint), relationshipType: "OBJECT_REFERENCE", citedCurrentness: "CURRENT", provenanceRef: "prov-dup", tenantId: "t2" }));
    reject(() => recordProcessLineage(thread, { ...actor, actorId: "AI_1", actorKind: "ai" }, { lineageId: "lin-ai", contextId: "ctx-1", source: end("OBJECT", nextStream.objectId, nextStream.provenanceRef, nextStream.fingerprint), target: end("STREAM", streamContext.streamRecordId, streamContext.provenanceRef, streamContext.fingerprint), relationshipType: "OBJECT_REFERENCE", citedCurrentness: "CURRENT", provenanceRef: "prov-ai" }));
    reject(() => recordProcessCurrentness(thread, { ...actor, authority: "ADMIN" }, { eventId: "cur-admin", contextId: "ctx-1", subject: end("STREAM", streamContext.streamRecordId, streamContext.provenanceRef, streamContext.fingerprint), currentness: "CURRENT", provenanceRef: "prov-admin", overrideMismatch: true }));
    reject(() => recordProcessLineage(thread, actor, { lineageId: "lin-infer", contextId: "ctx-1", source: end("OBJECT", nextStream.objectId, nextStream.provenanceRef, nextStream.fingerprint), target: end("STREAM", streamContext.streamRecordId, streamContext.provenanceRef, streamContext.fingerprint), relationshipType: "OBJECT_REFERENCE", citedCurrentness: "CURRENT", provenanceRef: "prov-infer", infer: true }));
    reject(() => recordProcessCurrentness(thread, actor, { eventId: "cur-transfer", contextId: "ctx-1", subject: end("STREAM", streamContext.streamRecordId, streamContext.provenanceRef, streamContext.fingerprint), currentness: "STALE", provenanceRef: "prov-transfer", transferReview: true }));
    reject(() => recordProcessLineage(thread, actor, { lineageId: "lin-float", contextId: "ctx-1", source: { ...streamEnd, subjectFingerprint: "latest" }, target: conditionEnd, relationshipType: "OBJECT_REFERENCE", citedCurrentness: "CURRENT", provenanceRef: "prov-float" }));
    expect(repointProcessDigitalThread).toThrow(/D6_R10_/);
    expect(inferProcessLineage).toThrow(/D6_R10_/);
    expect(replaceAdoptedProcessConditionFromCurrentness).toThrow(/D6_R10_/);
    expect(replaceOperatingConditionFromCurrentness).toThrow(/D6_R10_/);
    expect(replaceDesignConditionFromCurrentness).toThrow(/D6_R10_/);
    expect(replaceProcessEvidenceFromCurrentness).toThrow(/D6_R10_/);
    expect(replaceAdoptedDutyFromCurrentness).toThrow(/D6_R10_/);
    expect(replaceAdoptedUtilityFromCurrentness).toThrow(/D6_R10_/);
    expect(replaceReliefScenarioFromCurrentness).toThrow(/D6_R10_/);
    expect(replaceSafetyRequirementFromCurrentness).toThrow(/D6_R10_/);
    expect(transferProcessReviewFromCurrentness).toThrow(/D6_R10_/);
    expect(transferProcessValidationFromCurrentness).toThrow(/D6_R10_/);
    expect(recalculateFromProcessCurrentness).toThrow(/D6_R10_/);
    expect(redesignFromProcessCurrentness).toThrow(/D6_R10_/);
    expect(revalidateFromProcessCurrentness).toThrow(/D6_R10_/);
    expect(approveFromProcessCurrentness).toThrow(/D6_R10_/);
    const here = dirname(fileURLToPath(import.meta.url));
    const sourceText = readFileSync(join(here, "currentness-digital-thread.ts"), "utf8");
    expect(sourceText).toMatch(/relationSemantics|fingerprintCanonical|THREAD_DEFAULT_MAX_DEPTH|D6_CURRENTNESS_STATES/);
    expect(sourceText).not.toMatch(/createHash|from ["']@rtb\/engineering-review["']|CREATE TABLE/);
    expect(scanAnalysisFormulaBypass(join(here, "currentness-digital-thread.ts"), sourceText)).toEqual([]);
    const packageJson = JSON.parse(readFileSync(join(here, "../../package.json"), "utf8")) as { dependencies: Record<string, string> };
    expect(Object.keys(packageJson.dependencies).sort()).toEqual(["@rtb/database", "@rtb/platform-commerce", "@rtb/platform-intelligence", "@rtb/platform-kernel", "@rtb/types", "docx", "exceljs", "pptxgenjs", "zod"]);
  });
});
