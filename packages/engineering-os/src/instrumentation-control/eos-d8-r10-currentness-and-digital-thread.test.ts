import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  D8_CANONICAL_MILESTONE_COUNT,
  D8_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT as ARCHITECTURE_THREAD_COUNT,
  D8_RUNTIME_COUNT as ARCHITECTURE_RUNTIME_COUNT,
} from "@rtb/types";
import { describe, expect, it } from "vitest";
import { STRUCTURAL_CAPABILITY_MANIFEST } from "../structural-concrete/capability";
import { scanAnalysisFormulaBypass } from "../structural-systems/formula-scan";
import { createD8R5Store } from "./control-system-architecture-context";
import {
  ADMIN_CAN_PROMOTE_CURRENTNESS_TO_ENGINEERING_TRUTH,
  ADMIN_CAN_REBASELINE_D8_FINGERPRINT_WITHOUT_GOVERNANCE,
  ADMIN_EQUALS_D8_IAC_ENGINEERING_AUTHORITY,
  AI_CAN_INVENT_AUTHORITATIVE_D8_LINEAGE,
  AI_CAN_MARK_D8_RECORD_CURRENT_WITHOUT_GOVERNED_BASIS,
  AI_CAN_PROMOTE_CURRENTNESS_TO_VALIDATION,
  AI_CAN_REBASELINE_D8_FINGERPRINT,
  AI_EQUALS_D8_IAC_ENGINEERING_AUTHORITY,
  CROSS_TENANT_D8_R10_ACCESS_ALLOWED,
  CURRENT_D8_HANDOFF_EQUALS_COUNTERPART_VALIDATED,
  CURRENT_D8_RECORD_EQUALS_APPROVED,
  CURRENT_D8_RECORD_EQUALS_CONFORMANT,
  CURRENT_D8_RECORD_EQUALS_VALIDATED,
  CURRENT_REVIEW_EQUALS_ENGINEERING_VALIDATED,
  CURRENT_VALIDATION_RECORD_EQUALS_APPROVED,
  D8_ACTUATOR_SIZING_RUNTIME_COUNT,
  D8_APPROVAL_RUNTIME_COUNT,
  D8_AUTOMATIC_CONTROL_LOGIC_GENERATION_RUNTIME_COUNT,
  D8_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT,
  D8_AUTOMATIC_IAC_DESIGN_RUNTIME_COUNT,
  D8_AUTOMATIC_IAC_REDESIGN_RUNTIME_COUNT,
  D8_CERTIFICATION_RUNTIME_COUNT,
  D8_CHANGE_AUTO_MARKS_UNRELATED_RECORD_STALE,
  D8_CHANGE_AUTO_REPOINTS_HISTORICAL_REFERENCE,
  D8_CONFORMANCE_DETERMINATION_RUNTIME_COUNT,
  D8_CONTROL_LOGIC_DESIGN_RUNTIME_COUNT,
  D8_CONTROL_LOOP_TUNING_RUNTIME_COUNT,
  D8_CONTROL_SYSTEM_ARCHITECTURE_RUNTIME_READY,
  D8_CONTROL_VALVE_SIZING_RUNTIME_COUNT,
  D8_CROSS_DISCIPLINE_CONFLICT_DETECTION_RUNTIME_COUNT,
  D8_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT,
  D8_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT,
  D8_CROSS_DISCIPLINE_RECOMMENDATION_RUNTIME_COUNT,
  D8_CURRENT_STATE_SUPPORTED,
  D8_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT,
  D8_CURRENTNESS_DIGITAL_THREAD_RUNTIME_IMPLEMENTED,
  D8_CURRENTNESS_DIGITAL_THREAD_RUNTIME_READY,
  D8_CURRENTNESS_INFERRED_FROM_SEMANTIC_SIMILARITY,
  D8_CURRENTNESS_INFERRED_FROM_TAG_SIMILARITY,
  D8_CURRENTNESS_TRANSITION_GOVERNED,
  D8_CURRENTNESS_TRANSITION_REQUIRES_EXPLICIT_BASIS,
  D8_D9_RUNTIME_INTEGRATION_COUNT,
  D8_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
  D8_DIGITAL_THREAD_RELATIONSHIP_EXPLICIT,
  D8_DIGITAL_THREAD_RELATIONSHIP_IMPLEMENTED,
  D8_DISCIPLINE_INTERFACE_RUNTIME_READY,
  D8_EQUALS_D1_STRUCTURAL_AUTHORITY,
  D8_EQUALS_D2_CIVIL_AUTHORITY,
  D8_EQUALS_D3_GEOTECHNICAL_AUTHORITY,
  D8_EQUALS_D4_MECHANICAL_AUTHORITY,
  D8_EQUALS_D5_PIPING_AUTHORITY,
  D8_EQUALS_D6_PROCESS_AUTHORITY,
  D8_EQUALS_D7_ELECTRICAL_AUTHORITY,
  D8_EXACT_REVISION_CURRENTNESS_IMPLEMENTED,
  D8_EXPLICIT_LINEAGE_REQUIRED,
  D8_FUNCTIONAL_SAFETY_VALIDATION_RUNTIME_COUNT,
  D8_INFERRED_DIGITAL_THREAD_RELATIONSHIP_ALLOWED,
  D8_INFERRED_LINEAGE_ALLOWED,
  D8_INSTRUMENT_DEVICE_CONTEXT_RUNTIME_READY,
  D8_INSTRUMENT_SELECTION_RUNTIME_COUNT,
  D8_INSTRUMENT_SIZING_RUNTIME_COUNT,
  D8_INSTRUMENTATION_CONTROL_IDENTITY_RUNTIME_READY,
  D8_PROCESS_MEASUREMENT_TAG_RUNTIME_READY,
  D8_R10_AI_AUTO_CREATES_AUTHORITATIVE_THREAD_RELATIONSHIP,
  D8_R10_APPLICABILITY_EXPLICIT,
  D8_R10_AUTO_MUTATES_D1_STRUCTURAL,
  D8_R10_AUTO_MUTATES_D2_CIVIL,
  D8_R10_AUTO_MUTATES_D3_GEOTECHNICAL,
  D8_R10_AUTO_MUTATES_D4_MECHANICAL,
  D8_R10_AUTO_MUTATES_D5_PIPING,
  D8_R10_AUTO_MUTATES_D6_PROCESS,
  D8_R10_AUTO_MUTATES_D7_ELECTRICAL,
  D8_R10_AUTO_MUTATES_R1_IDENTITY,
  D8_R10_AUTO_MUTATES_R2_MEASUREMENT_TAG_CONTEXT,
  D8_R10_AUTO_MUTATES_R3_INSTRUMENT_DEVICE_CONTEXT,
  D8_R10_AUTO_MUTATES_R4_SIGNAL_IO_LOOP_CONTEXT,
  D8_R10_AUTO_MUTATES_R5_CONTROL_SYSTEM_CONTEXT,
  D8_R10_AUTO_MUTATES_R6_SAFETY_CONTEXT,
  D8_R10_AUTO_MUTATES_R7_CHANGE_GOVERNANCE,
  D8_R10_AUTO_MUTATES_R8_INTERFACE_HANDOFF,
  D8_R10_AUTO_MUTATES_R9_REVIEW_VALIDATION,
  D8_R10_AUTO_PROPAGATED_OUTSIDE_APPLICABILITY,
  D8_R10_CANONICAL_NEXT_PHASE,
  D8_R10_CANONICAL_NEXT_PHASE_SCOPE,
  D8_R10_COUNTERPART_REFERENCE_AUTO_REPOINTED,
  D8_R10_DUPLICATE_GOVERNANCE_IMPLEMENTED,
  D8_R10_FINGERPRINT_MISMATCH_AUTO_REBASELINED,
  D8_R10_FINGERPRINT_MISMATCH_AUTO_REPAIRED,
  D8_R10_FINGERPRINT_VERIFICATION_IMPLEMENTED,
  D8_R10_HISTORICAL_REFERENCE_AUTO_REPOINTED,
  D8_R10_HISTORY_PRESERVED,
  D8_R10_INFERRED_RELATIONSHIP_FROM_DOCUMENT_PROXIMITY,
  D8_R10_INFERRED_RELATIONSHIP_FROM_NAME,
  D8_R10_INFERRED_RELATIONSHIP_FROM_SEMANTIC_SIMILARITY,
  D8_R10_INFERRED_RELATIONSHIP_FROM_TAG,
  D8_R10_LIMITATIONS_EXPLICIT,
  D8_R10_MATURITY,
  D8_R10_PERFORMS_AUTOMATIC_ENGINEERING_VALIDATION,
  D8_R10_R7_CHANGE_CURRENTNESS_INTEGRATION_IMPLEMENTED,
  D8_R10_R7_REASSESSMENT_CURRENTNESS_INTEGRATION_IMPLEMENTED,
  D8_R10_R8_HANDOFF_CURRENTNESS_INTEGRATION_IMPLEMENTED,
  D8_R10_R9_REVIEW_CURRENTNESS_INTEGRATION_IMPLEMENTED,
  D8_R10_R9_VALIDATION_CURRENTNESS_INTEGRATION_IMPLEMENTED,
  D8_R10_REPLAY_PROTECTION_IMPLEMENTED,
  D8_R10_SOURCE_AUTO_REPOINTED,
  D8_R10_SOURCE_BASIS_REQUIRED,
  D8_R10_SOURCE_BASIS_TRACEABLE,
  D8_R10_SPOOFING_PROTECTION_IMPLEMENTED,
  D8_R10_STATUS,
  D8_R10_THREAD_PROVENANCE_PRESERVED,
  D8_R10_THREAD_PROVENANCE_REQUIRED,
  D8_R11_CANONICAL_PHASE,
  D8_R11_CANONICAL_SCOPE,
  D8_R11_PHASE_TYPE,
  D8_R11_STARTED,
  D8_R1_R9_EXACT_REVISIONS_REUSED,
  D8_R9_RUNTIME_COUNT,
  D8_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY,
  D8_REVIEW_VALIDATION_RUNTIME_READY,
  D8_REVISION_LINEAGE_IMPLEMENTED,
  D8_REUSES_CANONICAL_CURRENTNESS,
  D8_REUSES_CANONICAL_DIGITAL_THREAD,
  D8_REUSES_CANONICAL_FINGERPRINT,
  D8_RUNTIME_COUNT,
  D8_RUNTIME_STARTED,
  D8_SAFETY_INTERLOCK_SHUTDOWN_RUNTIME_READY,
  D8_SIGNAL_IO_CONTROL_LOOP_RUNTIME_READY,
  D8_SIL_CALCULATION_RUNTIME_COUNT,
  D8_SIL_VERIFICATION_RUNTIME_COUNT,
  D8_STALE_STATE_SUPPORTED,
  D8_SUPERSEDED_STATE_SUPPORTED,
  D9_RUNTIME_COUNT,
  D9_RUNTIME_STARTED,
  DATABASE_SCHEMA_CHANGED,
  DIGITAL_THREAD_RELATIONSHIP_EQUALS_APPROVAL,
  DIGITAL_THREAD_RELATIONSHIP_EQUALS_ENGINEERING_AUTHORITY,
  DIGITAL_THREAD_RELATIONSHIP_EQUALS_REQUIREMENT_ADOPTION,
  DIGITAL_THREAD_RELATIONSHIP_EQUALS_VALIDATION,
  EXACT_D8_PREDECESSOR_REVISION_REQUIRED,
  EXACT_D8_R10_SOURCE_REVISION_REQUIRED,
  EXACT_D8_R8_COUNTERPART_REVISION_REQUIRED,
  EXACT_D8_SUCCESSOR_REVISION_REQUIRED_WHEN_PRESENT,
  FINGERPRINT_MATCH_EQUALS_APPROVED,
  FINGERPRINT_MATCH_EQUALS_CONFORMANT,
  FINGERPRINT_MATCH_EQUALS_VALIDATED,
  FLOATING_COUNTERPART_REFERENCE_ALLOWED,
  FLOATING_D8_R10_SOURCE_REFERENCE_ALLOWED,
  LINEAGE_EQUALS_APPROVAL,
  LINEAGE_EQUALS_AUTHORITY,
  LINEAGE_EQUALS_VALIDATION,
  NEW_D8_REVISION_INHERITS_PRIOR_APPROVAL_AUTOMATICALLY,
  NEW_D8_REVISION_INHERITS_PRIOR_VALIDATION_AUTOMATICALLY,
  NEW_DEPENDENCY_ADDED,
  PARALLEL_D8_CURRENTNESS_ENGINE_CREATED,
  PARALLEL_D8_DIGITAL_THREAD_CREATED,
  REASSESSMENT_COMPLETED_EQUALS_CURRENT,
  REASSESSMENT_COMPLETED_EQUALS_VALIDATED,
  REASSESSMENT_REQUIRED_EQUALS_STALE,
  SECOND_D8_FINGERPRINT_ALGORITHM_CREATED,
  SILENT_D8_R10_MUTATION_ALLOWED,
  STALE_D8_HANDOFF_EQUALS_COUNTERPART_INVALID,
  STALE_D8_RECORD_EQUALS_INVALID,
  STALE_REVIEW_EQUALS_INVALID,
  STALE_VALIDATION_RECORD_EQUALS_VALIDATION_FAILED,
  SUPERSEDED_D8_HANDOFF_EQUALS_COUNTERPART_INVALID,
  SUPERSEDED_D8_RECORD_EQUALS_INVALID,
  SUPERSEDED_REVIEW_EQUALS_INVALID,
  SUPERSEDED_VALIDATION_RECORD_EQUALS_INVALID,
  TENANT_WORKSPACE_PROJECT_D8_R10_SCOPE_ENFORCED,
  automaticallyValidateIacFromCurrentness,
  createD8R10Store,
  inferIacLineage,
  inferIacThreadRelationship,
  inheritIacValidation,
  promoteIacCurrentnessToValidation,
  promoteIacFingerprintToApproval,
  promoteIacLineageToAuthority,
  reasonAcrossIacCurrentness,
  rebaselineIacFingerprint,
  recordIacCurrentnessTransition,
  recordIacRevisionLineage,
  recordIacRevisionSupersession,
  recordIacThreadRelationship,
  repairIacFingerprint,
  repointIacHistoricalReference,
  verifyIacRecordFingerprint,
} from "./currentness-digital-thread";
import { createD8R8Store, recordIacInterfaceHandoff } from "./discipline-interfaces-handoffs";
import { D8_CONTEXT_AUTHORITY, type D8R1Actor, createD8R1Store, recordIacContext, recordIacObjectIdentity } from "./identity-foundation";
import { createD8R3Store } from "./instrument-device-context";
import { createD8R2Store } from "./process-measurement-tag-context";
import { createD8R7Store, recordIacChange, recordIacReassessment } from "./requirements-assumptions-change";
import { D8_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT as R9_THREAD_COUNT, D8_R10_STARTED, D8_RUNTIME_COUNT as R9_RUNTIME_COUNT, createD8R9Store, recordIacReviewRequest, recordIacReviewerAssignment, recordIacValidationState } from "./review-validation-governance";
import { createD8R6Store } from "./safety-interlock-shutdown-context";
import { createD8R4Store } from "./signal-io-control-loop-context";

const here = dirname(fileURLToPath(import.meta.url));

function actor(overrides: Partial<D8R1Actor> = {}): D8R1Actor {
  return { actorId: "iac-recorder", tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a", authority: D8_CONTEXT_AUTHORITY, ...overrides };
}

function identity(id: string) {
  return { citedLifecycleStage: "FEED" as const, provenanceRef: `prov-${id}`, sourceBasisRef: `basis-${id}`, applicability: `${id} identity scope`, limitations: "identity only" };
}

describe("EOS-D8-R10 currentness and digital thread", () => {
  it("records exact-revision currentness without treating it as validation or authority", () => {
    expect(D8_R1_R9_EXACT_REVISIONS_REUSED && EXACT_D8_R10_SOURCE_REVISION_REQUIRED && EXACT_D8_PREDECESSOR_REVISION_REQUIRED && EXACT_D8_SUCCESSOR_REVISION_REQUIRED_WHEN_PRESENT && EXACT_D8_R8_COUNTERPART_REVISION_REQUIRED).toBe(true);
    expect(FLOATING_D8_R10_SOURCE_REFERENCE_ALLOWED || FLOATING_COUNTERPART_REFERENCE_ALLOWED || D8_R10_SOURCE_AUTO_REPOINTED || D8_R10_COUNTERPART_REFERENCE_AUTO_REPOINTED).toBe(false);
    expect(D8_RUNTIME_STARTED).toBe(true);
    expect(D8_RUNTIME_COUNT).toBe(10);
    expect(D8_R9_RUNTIME_COUNT).toBe(9);
    expect(R9_RUNTIME_COUNT).toBe(9);
    expect(ARCHITECTURE_RUNTIME_COUNT).toBe(0);
    expect(ARCHITECTURE_THREAD_COUNT).toBe(0);
    expect(R9_THREAD_COUNT).toBe(0);
    expect(D8_CURRENTNESS_DIGITAL_THREAD_RUNTIME_IMPLEMENTED && D8_CURRENTNESS_DIGITAL_THREAD_RUNTIME_READY).toBe(true);
    expect(D8_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT).toBe(1);
    expect(D8_INSTRUMENTATION_CONTROL_IDENTITY_RUNTIME_READY && D8_PROCESS_MEASUREMENT_TAG_RUNTIME_READY && D8_INSTRUMENT_DEVICE_CONTEXT_RUNTIME_READY && D8_SIGNAL_IO_CONTROL_LOOP_RUNTIME_READY && D8_CONTROL_SYSTEM_ARCHITECTURE_RUNTIME_READY && D8_SAFETY_INTERLOCK_SHUTDOWN_RUNTIME_READY && D8_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY && D8_DISCIPLINE_INTERFACE_RUNTIME_READY && D8_REVIEW_VALIDATION_RUNTIME_READY).toBe(true);
    expect(D8_REUSES_CANONICAL_CURRENTNESS && D8_REUSES_CANONICAL_DIGITAL_THREAD && D8_REUSES_CANONICAL_FINGERPRINT).toBe(true);
    expect(PARALLEL_D8_CURRENTNESS_ENGINE_CREATED || PARALLEL_D8_DIGITAL_THREAD_CREATED || SECOND_D8_FINGERPRINT_ALGORITHM_CREATED).toBe(false);
    expect(D8_EXACT_REVISION_CURRENTNESS_IMPLEMENTED && D8_CURRENT_STATE_SUPPORTED && D8_STALE_STATE_SUPPORTED && D8_SUPERSEDED_STATE_SUPPORTED).toBe(true);
    expect(CURRENT_D8_RECORD_EQUALS_VALIDATED || CURRENT_D8_RECORD_EQUALS_APPROVED || CURRENT_D8_RECORD_EQUALS_CONFORMANT || STALE_D8_RECORD_EQUALS_INVALID || SUPERSEDED_D8_RECORD_EQUALS_INVALID).toBe(false);
    expect(D8_CURRENTNESS_TRANSITION_GOVERNED && D8_CURRENTNESS_TRANSITION_REQUIRES_EXPLICIT_BASIS).toBe(true);
    expect(D8_CURRENTNESS_INFERRED_FROM_SEMANTIC_SIMILARITY || D8_CURRENTNESS_INFERRED_FROM_TAG_SIMILARITY).toBe(false);
    expect(D8_EXPLICIT_LINEAGE_REQUIRED && D8_REVISION_LINEAGE_IMPLEMENTED).toBe(true);
    expect(D8_INFERRED_LINEAGE_ALLOWED || LINEAGE_EQUALS_VALIDATION || LINEAGE_EQUALS_APPROVAL || LINEAGE_EQUALS_AUTHORITY).toBe(false);
    expect(D8_R10_FINGERPRINT_VERIFICATION_IMPLEMENTED).toBe(true);
    expect(FINGERPRINT_MATCH_EQUALS_VALIDATED || FINGERPRINT_MATCH_EQUALS_APPROVED || FINGERPRINT_MATCH_EQUALS_CONFORMANT || D8_R10_FINGERPRINT_MISMATCH_AUTO_REPAIRED || D8_R10_FINGERPRINT_MISMATCH_AUTO_REBASELINED).toBe(false);
    expect(D8_R10_HISTORY_PRESERVED).toBe(true);
    expect(D8_R10_HISTORICAL_REFERENCE_AUTO_REPOINTED || SILENT_D8_R10_MUTATION_ALLOWED || D8_CHANGE_AUTO_MARKS_UNRELATED_RECORD_STALE || D8_CHANGE_AUTO_REPOINTS_HISTORICAL_REFERENCE).toBe(false);
    expect(D8_R10_R7_CHANGE_CURRENTNESS_INTEGRATION_IMPLEMENTED && D8_R10_R7_REASSESSMENT_CURRENTNESS_INTEGRATION_IMPLEMENTED && D8_R10_R8_HANDOFF_CURRENTNESS_INTEGRATION_IMPLEMENTED && D8_R10_R9_REVIEW_CURRENTNESS_INTEGRATION_IMPLEMENTED && D8_R10_R9_VALIDATION_CURRENTNESS_INTEGRATION_IMPLEMENTED).toBe(true);
    expect(REASSESSMENT_REQUIRED_EQUALS_STALE || REASSESSMENT_COMPLETED_EQUALS_CURRENT || REASSESSMENT_COMPLETED_EQUALS_VALIDATED).toBe(false);
    expect(CURRENT_D8_HANDOFF_EQUALS_COUNTERPART_VALIDATED || STALE_D8_HANDOFF_EQUALS_COUNTERPART_INVALID || SUPERSEDED_D8_HANDOFF_EQUALS_COUNTERPART_INVALID).toBe(false);
    expect(CURRENT_REVIEW_EQUALS_ENGINEERING_VALIDATED || STALE_REVIEW_EQUALS_INVALID || SUPERSEDED_REVIEW_EQUALS_INVALID).toBe(false);
    expect(CURRENT_VALIDATION_RECORD_EQUALS_APPROVED || STALE_VALIDATION_RECORD_EQUALS_VALIDATION_FAILED || SUPERSEDED_VALIDATION_RECORD_EQUALS_INVALID).toBe(false);
    expect(NEW_D8_REVISION_INHERITS_PRIOR_VALIDATION_AUTOMATICALLY || NEW_D8_REVISION_INHERITS_PRIOR_APPROVAL_AUTOMATICALLY).toBe(false);
    expect(D8_DIGITAL_THREAD_RELATIONSHIP_IMPLEMENTED && D8_DIGITAL_THREAD_RELATIONSHIP_EXPLICIT).toBe(true);
    expect(D8_INFERRED_DIGITAL_THREAD_RELATIONSHIP_ALLOWED || DIGITAL_THREAD_RELATIONSHIP_EQUALS_ENGINEERING_AUTHORITY || DIGITAL_THREAD_RELATIONSHIP_EQUALS_REQUIREMENT_ADOPTION || DIGITAL_THREAD_RELATIONSHIP_EQUALS_VALIDATION || DIGITAL_THREAD_RELATIONSHIP_EQUALS_APPROVAL).toBe(false);
    expect(D8_R10_INFERRED_RELATIONSHIP_FROM_NAME || D8_R10_INFERRED_RELATIONSHIP_FROM_TAG || D8_R10_INFERRED_RELATIONSHIP_FROM_DOCUMENT_PROXIMITY || D8_R10_INFERRED_RELATIONSHIP_FROM_SEMANTIC_SIMILARITY || D8_R10_AI_AUTO_CREATES_AUTHORITATIVE_THREAD_RELATIONSHIP).toBe(false);
    expect(D8_R10_THREAD_PROVENANCE_REQUIRED && D8_R10_THREAD_PROVENANCE_PRESERVED && D8_R10_SOURCE_BASIS_REQUIRED && D8_R10_SOURCE_BASIS_TRACEABLE && D8_R10_APPLICABILITY_EXPLICIT && D8_R10_LIMITATIONS_EXPLICIT && TENANT_WORKSPACE_PROJECT_D8_R10_SCOPE_ENFORCED).toBe(true);
    expect(D8_R10_AUTO_PROPAGATED_OUTSIDE_APPLICABILITY || CROSS_TENANT_D8_R10_ACCESS_ALLOWED).toBe(false);
    expect(D8_R10_AUTO_MUTATES_R1_IDENTITY || D8_R10_AUTO_MUTATES_R2_MEASUREMENT_TAG_CONTEXT || D8_R10_AUTO_MUTATES_R3_INSTRUMENT_DEVICE_CONTEXT || D8_R10_AUTO_MUTATES_R4_SIGNAL_IO_LOOP_CONTEXT || D8_R10_AUTO_MUTATES_R5_CONTROL_SYSTEM_CONTEXT || D8_R10_AUTO_MUTATES_R6_SAFETY_CONTEXT || D8_R10_AUTO_MUTATES_R7_CHANGE_GOVERNANCE || D8_R10_AUTO_MUTATES_R8_INTERFACE_HANDOFF || D8_R10_AUTO_MUTATES_R9_REVIEW_VALIDATION).toBe(false);
    expect(D8_R10_AUTO_MUTATES_D1_STRUCTURAL || D8_R10_AUTO_MUTATES_D2_CIVIL || D8_R10_AUTO_MUTATES_D3_GEOTECHNICAL || D8_R10_AUTO_MUTATES_D4_MECHANICAL || D8_R10_AUTO_MUTATES_D5_PIPING || D8_R10_AUTO_MUTATES_D6_PROCESS || D8_R10_AUTO_MUTATES_D7_ELECTRICAL).toBe(false);
    expect(D8_EQUALS_D1_STRUCTURAL_AUTHORITY || D8_EQUALS_D2_CIVIL_AUTHORITY || D8_EQUALS_D3_GEOTECHNICAL_AUTHORITY || D8_EQUALS_D4_MECHANICAL_AUTHORITY || D8_EQUALS_D5_PIPING_AUTHORITY || D8_EQUALS_D6_PROCESS_AUTHORITY || D8_EQUALS_D7_ELECTRICAL_AUTHORITY || AI_EQUALS_D8_IAC_ENGINEERING_AUTHORITY || ADMIN_EQUALS_D8_IAC_ENGINEERING_AUTHORITY).toBe(false);
    expect(AI_CAN_MARK_D8_RECORD_CURRENT_WITHOUT_GOVERNED_BASIS || AI_CAN_INVENT_AUTHORITATIVE_D8_LINEAGE || AI_CAN_REBASELINE_D8_FINGERPRINT || AI_CAN_PROMOTE_CURRENTNESS_TO_VALIDATION || ADMIN_CAN_PROMOTE_CURRENTNESS_TO_ENGINEERING_TRUTH || ADMIN_CAN_REBASELINE_D8_FINGERPRINT_WITHOUT_GOVERNANCE || D8_R10_PERFORMS_AUTOMATIC_ENGINEERING_VALIDATION).toBe(false);
    expect(D8_R10_DUPLICATE_GOVERNANCE_IMPLEMENTED && D8_R10_REPLAY_PROTECTION_IMPLEMENTED && D8_R10_SPOOFING_PROTECTION_IMPLEMENTED).toBe(true);
    expect([D8_INSTRUMENT_SIZING_RUNTIME_COUNT, D8_INSTRUMENT_SELECTION_RUNTIME_COUNT, D8_CONTROL_VALVE_SIZING_RUNTIME_COUNT, D8_ACTUATOR_SIZING_RUNTIME_COUNT, D8_CONTROL_LOOP_TUNING_RUNTIME_COUNT, D8_CONTROL_LOGIC_DESIGN_RUNTIME_COUNT, D8_AUTOMATIC_CONTROL_LOGIC_GENERATION_RUNTIME_COUNT, D8_SIL_CALCULATION_RUNTIME_COUNT, D8_SIL_VERIFICATION_RUNTIME_COUNT, D8_FUNCTIONAL_SAFETY_VALIDATION_RUNTIME_COUNT, D8_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT, D8_CONFORMANCE_DETERMINATION_RUNTIME_COUNT, D8_APPROVAL_RUNTIME_COUNT, D8_CERTIFICATION_RUNTIME_COUNT, D8_AUTOMATIC_IAC_DESIGN_RUNTIME_COUNT, D8_AUTOMATIC_IAC_REDESIGN_RUNTIME_COUNT, D8_D9_SOURCE_CONTRACT_RUNTIME_COUNT, D8_D9_RUNTIME_INTEGRATION_COUNT, D8_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT, D8_CROSS_DISCIPLINE_CONFLICT_DETECTION_RUNTIME_COUNT, D8_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT, D8_CROSS_DISCIPLINE_RECOMMENDATION_RUNTIME_COUNT, D9_RUNTIME_COUNT]).toEqual(Array(23).fill(0));
    expect(D9_RUNTIME_STARTED || DATABASE_SCHEMA_CHANGED || NEW_DEPENDENCY_ADDED || D8_R10_STARTED || D8_R11_STARTED).toBe(false);
    expect(D8_CANONICAL_MILESTONE_COUNT).toBe(13);
    expect(D8_R10_STATUS).toBe("CURRENTNESS_AND_DIGITAL_THREAD_IMPLEMENTED");
    expect(D8_R10_MATURITY).toBe(D8_R10_STATUS);
    expect(D8_R11_CANONICAL_PHASE).toBe("EOS-D8-R11-D9-SOURCE-CONTRACT");
    expect(D8_R11_PHASE_TYPE).toBe("D9_SOURCE_CONTRACT");
    expect(D8_R10_CANONICAL_NEXT_PHASE).toBe(D8_R11_CANONICAL_PHASE);
    expect(D8_R10_CANONICAL_NEXT_PHASE_SCOPE).toBe(D8_R11_CANONICAL_SCOPE);

    const r1 = createD8R1Store();
    const who = actor();
    const reviewer = { ...actor({ actorId: "iac-reviewer", authority: "REVIEWER" }), actorKind: "human" as const, aal: "aal2" };
    const validator = { ...actor({ actorId: "iac-validator", authority: "IAC_VALIDATION_AUTHORITY" }), actorKind: "human" as const, aal: "aal2" };
    recordIacContext(r1, who, { contextId: "ctx-1", ...identity("ctx") });
    const face = recordIacObjectIdentity(r1, who, { objectId: "ifc-101", contextId: "ctx-1", objectType: "IAC_INTERFACE", ...identity("ifc-101") });
    const next = recordIacObjectIdentity(r1, who, { objectId: "ifc-102", contextId: "ctx-1", objectType: "IAC_INTERFACE", ...identity("ifc-102") });
    const r7 = createD8R7Store(createD8R6Store(createD8R5Store(createD8R4Store(createD8R3Store(createD8R2Store(r1))))));
    const governed = { contextId: "ctx-1", objectId: face.objectId, objectRevisionFingerprint: face.fingerprint, citedLifecycleStage: "FEED", citedCurrentness: "CURRENT", provenanceRef: "prov-ifc", sourceBasisRef: "basis-ifc", applicability: "ifc-101 handoff scope", limitations: "handoff is not counterpart design" };
    const counterparts = [{ discipline: "process" as const, counterpartId: "d6-meas-1", sourceRevision: "rev-d6-1", fingerprint: "fp-d6-1", tenantId: "tenant-a", recordStatus: "CURRENT" as const }];
    const handoffs = createD8R8Store(r7, counterparts);
    const handoff = recordIacInterfaceHandoff(handoffs, who, { ...governed, handoffId: "hof-d6", direction: "D8_TO_COUNTERPART", suppliedContent: "supplied interface content", handoffStatus: "COMPLETE", counterpartDiscipline: "process", interfaceTopic: "PROCESS_MEASUREMENT_REQUIREMENT", counterpartId: "d6-meas-1", counterpartRevision: "rev-d6-1", counterpartFingerprint: "fp-d6-1", dependencies: [{ targetKind: "R1_OBJECT", targetId: face.objectId, targetFingerprint: face.fingerprint }] });
    const reviews = createD8R9Store(handoffs);
    const scope = { tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a", citedLifecycleStage: "FEED", citedCurrentness: "CURRENT", provenanceRef: "prov-review", sourceBasisRef: "basis-review", limitations: "review is not validation" };
    const objectChain = { ...scope, contextId: "ctx-1", objectId: face.objectId, objectRevisionFingerprint: face.fingerprint, subjectKind: "OBJECT", subjectId: face.objectId, subjectRevision: face.provenanceRef, subjectFingerprint: face.fingerprint, applicability: "ifc-101 review scope", reviewScope: "ifc-101 subject review" };
    const request = recordIacReviewRequest(reviews, who, { ...objectChain, reviewRequestId: "rev-req-1", reviewType: "IAC_SUBJECT_REVIEW" });
    recordIacReviewerAssignment(reviews, who, { ...objectChain, assignmentId: "rev-asg-1", reviewRequestId: request.reviewRequestId, reviewerId: reviewer.actorId, reviewerAuthority: "REVIEWER" });
    const validated = recordIacValidationState(reviews, validator, { ...objectChain, validationId: "rev-val-1", validationState: "VALIDATED", validationScope: "ifc-101 validation scope", basis: [{ kind: "R1_OBJECT", id: face.objectId, fingerprint: face.fingerprint }] });
    const change = recordIacChange(r7, who, { ...governed, changeId: "chg-ifc-1", changeCategory: "REQUIREMENT_CHANGED", reason: "Supplied interface source text was revised", priorRevisionFingerprint: face.fingerprint, currentRevisionFingerprint: face.fingerprint, dependencies: [{ targetKind: "R1_OBJECT", targetId: face.objectId, targetFingerprint: face.fingerprint }] });
    const reassessment = recordIacReassessment(r7, who, { ...governed, reassessmentId: "ras-ifc-1", changeId: change.changeId, targetKind: "R1_OBJECT", targetId: face.objectId, targetFingerprint: face.fingerprint, state: "REASSESSMENT_REQUIRED" });
    const later = { ...governed, objectId: next.objectId, objectRevisionFingerprint: next.fingerprint, applicability: "ifc-102 change scope" };
    const laterChange = recordIacChange(r7, who, { ...later, changeId: "chg-ifc-2", changeCategory: "REQUIREMENT_CHANGED", reason: "Successor interface text was recorded", priorRevisionFingerprint: next.fingerprint, currentRevisionFingerprint: next.fingerprint, dependencies: [{ targetKind: "R1_OBJECT", targetId: next.objectId, targetFingerprint: next.fingerprint }] });
    const completed = recordIacReassessment(r7, who, { ...later, reassessmentId: "ras-ifc-2", changeId: laterChange.changeId, targetKind: "R1_OBJECT", targetId: next.objectId, targetFingerprint: next.fingerprint, state: "REASSESSMENT_COMPLETED" });
    const before = JSON.stringify({ objects: r1.objects, handoffs: handoffs.handoffs, changes: r7.changes, reassessments: r7.reassessments, requests: reviews.requests, validations: reviews.validations });
    const store = createD8R10Store(reviews);
    const objectPin = { subjectKind: "OBJECT", subjectId: face.objectId, subjectRevision: face.provenanceRef, subjectFingerprint: face.fingerprint };
    const successorPin = { subjectKind: "OBJECT", subjectId: next.objectId, subjectRevision: next.provenanceRef, subjectFingerprint: next.fingerprint };
    const handoffPin = { subjectKind: "HANDOFF", subjectId: handoff.handoffId, subjectRevision: handoff.provenanceRef, subjectFingerprint: handoff.fingerprint };
    const reviewPin = { subjectKind: "REVIEW_REQUEST", subjectId: request.reviewRequestId, subjectRevision: request.provenanceRef, subjectFingerprint: request.fingerprint };
    const validationPin = { subjectKind: "VALIDATION", subjectId: validated.validationId, subjectRevision: validated.provenanceRef, subjectFingerprint: validated.fingerprint };
    const basis = { contextId: "ctx-1", tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a", citedCurrentness: "CURRENT", provenanceRef: "prov-thread", sourceBasisRef: "basis-thread", limitations: "thread is not authority" };
    const lineage = recordIacRevisionLineage(store, who, { ...basis, lineageId: "lin-1", predecessor: objectPin, successor: handoffPin, relationshipType: "DEPENDS_ON", applicability: "ifc-101 lineage scope", counterpartRevision: "rev-d6-1", counterpartFingerprint: "fp-d6-1" });
    const thread = recordIacThreadRelationship(store, who, { ...basis, relationshipId: "thr-1", source: objectPin, target: reviewPin, relationshipType: "REVIEWS", applicability: "ifc-101 thread scope", counterpartRevision: null, counterpartFingerprint: null });
    const verified = verifyIacRecordFingerprint(store, who, { contextId: "ctx-1", subject: objectPin, tenantId: "tenant-a" });
    const historyBeforeMismatch = store.history.length;
    const edgesBeforeMismatch = store.edges.length;

    expect(lineage.engineeringValidated || lineage.approved || lineage.engineeringAuthority || lineage.authoritative).toBe(false);
    expect(lineage.source.subjectFingerprint).toBe(face.fingerprint);
    expect(lineage.target.subjectFingerprint).toBe(handoff.fingerprint);
    expect(thread.requirementAdopted || thread.engineeringValidated || thread.approved || thread.engineeringAuthority).toBe(false);
    expect(thread.provenanceRef).toBe("prov-thread");
    const replay = recordIacRevisionLineage(store, who, { ...basis, lineageId: "lin-1", predecessor: objectPin, successor: handoffPin, relationshipType: "DEPENDS_ON", applicability: "ifc-101 lineage scope", counterpartRevision: "rev-d6-1", counterpartFingerprint: "fp-d6-1" });
    expect(replay.fingerprint).toBe(lineage.fingerprint);
    expect(() => recordIacThreadRelationship(store, who, { ...basis, relationshipId: "thr-dup", source: objectPin, target: reviewPin, relationshipType: "REVIEWS", applicability: "ifc-101 thread scope" })).toThrow(/DUPLICATE_THREAD_REJECTED/);
    expect(verified.match).toBe(true);
    expect(verified.validated || verified.approved || verified.conformant).toBe(false);
    expect(() => verifyIacRecordFingerprint(store, who, { contextId: "ctx-1", subject: { ...objectPin, subjectFingerprint: "fp-mismatch" }, tenantId: "tenant-a" })).toThrow(/FINGERPRINT_MISMATCH/);
    expect(store.history).toHaveLength(historyBeforeMismatch);
    expect(store.edges).toHaveLength(edgesBeforeMismatch);
    expect(() => recordIacRevisionLineage(store, who, { ...basis, lineageId: "lin-bad", predecessor: objectPin, successor: handoffPin, relationshipType: "DEPENDS_ON", applicability: "ifc-101 lineage scope", counterpartRevision: "rev-d6-1", counterpartFingerprint: "fp-d6-1", assertedFingerprint: "fp-mismatch" })).toThrow(/FINGERPRINT_MISMATCH/);
    expect(store.edges).toHaveLength(edgesBeforeMismatch);

    const stale = recordIacCurrentnessTransition(store, who, { ...basis, eventId: "cur-stale", subject: objectPin, currentness: "STALE", changeId: change.changeId, changeFingerprint: change.fingerprint, applicability: "ifc-101 stale scope", propagate: true });
    expect(stale.currentness).toBe("STALE");
    expect(stale.invalid || stale.engineeringValidated || stale.approved || stale.historicalRepointed || stale.fingerprintRepaired).toBe(false);
    expect(store.marks.filter((row) => row.subject.subjectKind === "HANDOFF")).toHaveLength(0);
    expect(store.edges[0].target.subjectId).toBe(handoff.handoffId);
    expect(() => recordIacCurrentnessTransition(store, who, { ...basis, eventId: "cur-unrelated", subject: successorPin, currentness: "STALE", changeId: change.changeId, changeFingerprint: change.fingerprint, applicability: "ifc-102 stale scope" })).toThrow(/UNRELATED_CURRENTNESS_REJECTED/);
    const required = recordIacCurrentnessTransition(store, who, { ...basis, eventId: "cur-ras", subject: objectPin, currentness: "REASSESSMENT_REQUIRED", changeId: change.changeId, changeFingerprint: change.fingerprint, reassessmentId: reassessment.reassessmentId, reassessmentFingerprint: reassessment.fingerprint, applicability: "ifc-101 reassessment scope" });
    expect(required.currentness).toBe("REASSESSMENT_REQUIRED");
    expect(required.currentness === "STALE" || required.engineeringValidated || reassessment.validated).toBe(false);
    expect(() => recordIacCurrentnessTransition(store, who, { ...basis, eventId: "cur-done", subject: successorPin, currentness: "CURRENT", reassessmentId: completed.reassessmentId, reassessmentFingerprint: completed.fingerprint, applicability: "ifc-102 current scope" })).toThrow(/REASSESSMENT_COMPLETED_NOT_CURRENT/);
    const handoffCurrent = recordIacCurrentnessTransition(store, who, { ...basis, eventId: "cur-hof", subject: handoffPin, currentness: "CURRENT", applicability: "hof-d6 handoff scope", counterpartRevision: "rev-d6-1", counterpartFingerprint: "fp-d6-1" });
    expect(handoffCurrent.currentness).toBe("CURRENT");
    expect(handoffCurrent.counterpartValidated || handoffCurrent.engineeringValidated).toBe(false);
    const reviewCurrent = recordIacCurrentnessTransition(store, who, { ...basis, eventId: "cur-rev", subject: reviewPin, currentness: "CURRENT", applicability: "rev-req-1 review scope" });
    expect(reviewCurrent.engineeringValidated || reviewCurrent.approved).toBe(false);
    const validationCurrent = recordIacCurrentnessTransition(store, who, { ...basis, eventId: "cur-val", subject: validationPin, currentness: "CURRENT", applicability: "rev-val-1 validation scope" });
    expect(validationCurrent.approved || validationCurrent.engineeringValidated).toBe(false);
    const validationStale = recordIacCurrentnessTransition(store, who, { ...basis, eventId: "cur-val-stale", subject: validationPin, currentness: "STALE", changeId: change.changeId, changeFingerprint: change.fingerprint, applicability: "rev-val-1 validation scope" });
    expect(validationStale.validationFailed || validationStale.invalid || validationStale.approved).toBe(false);
    expect(validated.engineeringValidated).toBe(true);
    expect(validated.approved).toBe(false);
    expect(() => recordIacRevisionSupersession(store, who, { ...basis, supersessionId: "sup-inherit", predecessor: objectPin, successor: successorPin, applicability: "ifc-101 supersession scope", inheritValidation: true })).toThrow(/VALIDATION_TRANSFER_REJECTED/);
    const superseded = recordIacRevisionSupersession(store, who, { ...basis, supersessionId: "sup-1", predecessor: objectPin, successor: successorPin, applicability: "ifc-101 supersession scope" });
    expect(superseded.validationInherited || superseded.approvalInherited || superseded.historicalEdgesRewritten || superseded.priorRevisionInvalidated).toBe(false);
    expect(store.edges[0].source.subjectId).toBe(face.objectId);
    expect(store.edges[0].target.subjectId).toBe(handoff.handoffId);
    expect(reviews.validations.some((row) => row.subjectId === next.objectId && row.engineeringValidated)).toBe(false);
    expect(store.marks.find((row) => row.eventId === `mark-${superseded.supersessionId}`)?.currentness).toBe("SUPERSEDED");
    expect(store.marks.find((row) => row.eventId === `mark-${superseded.supersessionId}`)?.invalid).toBe(false);
    expect(() => recordIacRevisionLineage(store, who, { ...basis, lineageId: "lin-tag", predecessor: successorPin, successor: handoffPin, relationshipType: "tag_name", applicability: "ifc-102 lineage scope" })).toThrow(/INFERRED_RELATIONSHIP_REJECTED/);
    expect(() => recordIacThreadRelationship(store, who, { ...basis, relationshipId: "thr-infer", source: objectPin, target: reviewPin, relationshipType: "DEPENDS_ON", applicability: "ifc-101 thread scope", semantic: true })).toThrow(/INFERRED_RELATIONSHIP_REJECTED/);
    expect(() => recordIacCurrentnessTransition(store, actor({ actorId: "AI-recorder", authority: "AI" }), { ...basis, eventId: "cur-ai", subject: successorPin, currentness: "CURRENT", applicability: "ifc-102 current scope" })).toThrow(/AI_NOT_IAC_AUTHORITY/);
    expect(() => recordIacRevisionLineage(store, actor({ actorId: "ADMIN", authority: "ADMIN" }), { ...basis, lineageId: "lin-admin", predecessor: successorPin, successor: handoffPin, relationshipType: "DEPENDS_ON", applicability: "ifc-102 lineage scope" })).toThrow(/ADMIN_CANNOT_OVERRIDE/);
    expect(() => recordIacCurrentnessTransition(store, actor({ tenantId: "tenant-b" }), { ...basis, eventId: "cur-cross", subject: successorPin, currentness: "CURRENT", applicability: "ifc-102 current scope", tenantId: "tenant-b" })).toThrow(/CROSS_TENANT_OPERATION|R1_CONTEXT_NOT_FOUND/);
    expect(() => recordIacCurrentnessTransition(store, who, { ...basis, eventId: "cur-float", subject: handoffPin, currentness: "CURRENT", applicability: "hof-d6 handoff scope", counterpartRevision: "latest", counterpartFingerprint: "fp-d6-1" })).toThrow(/COUNTERPART_REVISION_REQUIRED/);
    expect(() => recordIacCurrentnessTransition(store, who, { ...basis, eventId: "cur-spoof", subject: handoffPin, currentness: "CURRENT", applicability: "hof-d6 handoff scope", counterpartRevision: "rev-d6-1", counterpartFingerprint: "fp-other" })).toThrow(/COUNTERPART_REVISION_MISMATCH/);
    expect(() => recordIacCurrentnessTransition(store, who, { ...basis, eventId: "cur-promote", subject: successorPin, currentness: "CURRENT", applicability: "ifc-102 current scope", promoteValidated: true })).toThrow(/CURRENT_NOT_VALIDATED/);
    expect(() => repointIacHistoricalReference()).toThrow(/AUTO_REPOINT_REJECTED/);
    expect(() => inferIacLineage()).toThrow(/INFERRED_RELATIONSHIP_REJECTED/);
    expect(() => inferIacThreadRelationship()).toThrow(/INFERRED_RELATIONSHIP_REJECTED/);
    expect(() => repairIacFingerprint()).toThrow(/FINGERPRINT_OVERRIDE_REJECTED/);
    expect(() => rebaselineIacFingerprint()).toThrow(/FINGERPRINT_OVERRIDE_REJECTED/);
    expect(() => promoteIacCurrentnessToValidation()).toThrow(/CURRENT_NOT_VALIDATED/);
    expect(() => promoteIacFingerprintToApproval()).toThrow(/FINGERPRINT_NOT_APPROVAL/);
    expect(() => promoteIacLineageToAuthority()).toThrow(/LINEAGE_NOT_AUTHORITY/);
    expect(() => inheritIacValidation()).toThrow(/VALIDATION_TRANSFER_REJECTED/);
    expect(() => automaticallyValidateIacFromCurrentness()).toThrow(/AUTOMATIC_VALIDATION_REJECTED/);
    expect(() => reasonAcrossIacCurrentness()).toThrow(/CROSS_DISCIPLINE_REASONING_NOT_IN_R10/);
    expect(JSON.stringify({ objects: r1.objects, handoffs: handoffs.handoffs, changes: r7.changes, reassessments: r7.reassessments, requests: reviews.requests, validations: reviews.validations })).toBe(before);
    expect(r1.objects[0].fingerprint).toBe(face.fingerprint);
    expect(completed.validated).toBe(false);

    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D8.R10.CURRENTNESS_AND_DIGITAL_THREAD")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D8.R11.D9_SOURCE_CONTRACT")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    const sourceText = readFileSync(join(here, "currentness-digital-thread.ts"), "utf8");
    expect(sourceText).toMatch(/fingerprintCanonical/);
    expect(sourceText).toMatch(/isGovernedRelationType/);
    expect(sourceText).toMatch(/relationSemantics/);
    expect(sourceText).toMatch(/THREAD_DEFAULT_MAX_DEPTH/);
    expect(sourceText).not.toMatch(/createHash|from ["']@rtb\/engineering-review["']|CREATE TABLE|eval\(|child_process|new Function/);
    expect(scanAnalysisFormulaBypass(join(here, "currentness-digital-thread.ts"), sourceText)).toEqual([]);
    const pkg = JSON.parse(readFileSync(join(here, "../../package.json"), "utf8")) as { dependencies: Record<string, string> };
    expect(Object.keys(pkg.dependencies).sort()).toEqual(["@rtb/database", "@rtb/engineering-review", "@rtb/platform-commerce", "@rtb/platform-intelligence", "@rtb/platform-kernel", "@rtb/types", "docx", "exceljs", "pptxgenjs", "zod"]);
  });
});
