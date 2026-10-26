import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  D8_CANONICAL_MILESTONE_COUNT,
  D8_D9_SOURCE_CONTRACT_RUNTIME_COUNT as ARCHITECTURE_CONTRACT_COUNT,
  D8_RUNTIME_COUNT as ARCHITECTURE_RUNTIME_COUNT,
} from "@rtb/types";
import { describe, expect, it } from "vitest";
import { STRUCTURAL_CAPABILITY_MANIFEST } from "../structural-concrete/capability";
import { scanAnalysisFormulaBypass } from "../structural-systems/formula-scan";
import { createD8R5Store } from "./control-system-architecture-context";
import {
  ADMIN_CAN_BYPASS_D8_R11_AUTHORITY_BOUNDARY,
  ADMIN_EQUALS_D8_IAC_ENGINEERING_AUTHORITY,
  AI_CAN_INVENT_D8_R11_AUTHORITATIVE_RELATIONSHIP,
  AI_CAN_INVENT_D8_R11_AUTHORITATIVE_SOURCE_FACT,
  AI_CAN_PROMOTE_D9_READ_ACCESS_TO_ENGINEERING_AUTHORITY,
  AI_EQUALS_D8_IAC_ENGINEERING_AUTHORITY,
  CROSS_TENANT_D8_R11_ACCESS_ALLOWED,
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
  D8_CURRENTNESS_DIGITAL_THREAD_RUNTIME_READY,
  D8_D9_RUNTIME_INTEGRATION_COUNT,
  D8_D9_SOURCE_CONTRACT_CAN_MUTATE_COUNTERPART_DISCIPLINE,
  D8_D9_SOURCE_CONTRACT_CAN_MUTATE_D8,
  D8_D9_SOURCE_CONTRACT_READ_ONLY,
  D8_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
  D8_D9_SOURCE_CONTRACT_RUNTIME_IMPLEMENTED,
  D8_D9_SOURCE_CONTRACT_RUNTIME_READY,
  D8_DISCIPLINE_INTERFACE_RUNTIME_READY,
  D8_EQUALS_D1_STRUCTURAL_AUTHORITY,
  D8_EQUALS_D2_CIVIL_AUTHORITY,
  D8_EQUALS_D3_GEOTECHNICAL_AUTHORITY,
  D8_EQUALS_D4_MECHANICAL_AUTHORITY,
  D8_EQUALS_D5_PIPING_AUTHORITY,
  D8_EQUALS_D6_PROCESS_AUTHORITY,
  D8_EQUALS_D7_ELECTRICAL_AUTHORITY,
  D8_FUNCTIONAL_SAFETY_VALIDATION_RUNTIME_COUNT,
  D8_INSTRUMENT_DEVICE_CONTEXT_RUNTIME_READY,
  D8_INSTRUMENT_SELECTION_RUNTIME_COUNT,
  D8_INSTRUMENT_SIZING_RUNTIME_COUNT,
  D8_INSTRUMENTATION_CONTROL_IDENTITY_RUNTIME_READY,
  D8_PROCESS_MEASUREMENT_TAG_RUNTIME_READY,
  D8_R10_RUNTIME_COUNT,
  D8_R11_APPLICABILITY_PRESERVED,
  D8_R11_AUTO_MUTATES_D1_STRUCTURAL,
  D8_R11_AUTO_MUTATES_D2_CIVIL,
  D8_R11_AUTO_MUTATES_D3_GEOTECHNICAL,
  D8_R11_AUTO_MUTATES_D4_MECHANICAL,
  D8_R11_AUTO_MUTATES_D5_PIPING,
  D8_R11_AUTO_MUTATES_D6_PROCESS,
  D8_R11_AUTO_MUTATES_D7_ELECTRICAL,
  D8_R11_AUTO_MUTATES_R1_IDENTITY,
  D8_R11_AUTO_MUTATES_R10_CURRENTNESS_THREAD,
  D8_R11_AUTO_MUTATES_R2_MEASUREMENT_TAG_CONTEXT,
  D8_R11_AUTO_MUTATES_R3_INSTRUMENT_DEVICE_CONTEXT,
  D8_R11_AUTO_MUTATES_R4_SIGNAL_IO_LOOP_CONTEXT,
  D8_R11_AUTO_MUTATES_R5_CONTROL_SYSTEM_CONTEXT,
  D8_R11_AUTO_MUTATES_R6_SAFETY_CONTEXT,
  D8_R11_AUTO_MUTATES_R7_CHANGE_GOVERNANCE,
  D8_R11_AUTO_MUTATES_R8_INTERFACE_HANDOFF,
  D8_R11_AUTO_MUTATES_R9_REVIEW_VALIDATION,
  D8_R11_AUTO_PROPAGATES_OUTSIDE_APPLICABILITY,
  D8_R11_CANONICAL_NEXT_PHASE,
  D8_R11_CANONICAL_NEXT_PHASE_SCOPE,
  D8_R11_CONTRACT_FINGERPRINT_MISMATCH_AUTO_REBASELINED,
  D8_R11_CONTRACT_FINGERPRINT_MISMATCH_AUTO_REPAIRED,
  D8_R11_CONTRACT_FINGERPRINT_VERIFICATION_IMPLEMENTED,
  D8_R11_CONTRACT_HISTORY_PRESERVED,
  D8_R11_CREATES_NEW_ASSUMPTION,
  D8_R11_CREATES_NEW_DERIVED_VALUE,
  D8_R11_CREATES_NEW_ENGINEERING_DECISION,
  D8_R11_CREATES_NEW_ENGINEERING_FACT,
  D8_R11_CREATES_NEW_RECOMMENDATION,
  D8_R11_CREATES_NEW_REQUIREMENT,
  D8_R11_D9_CONTRACT_AUTO_REPOINTS_SOURCE_REVISION,
  D8_R11_DUPLICATE_GOVERNANCE_IMPLEMENTED,
  D8_R11_EXACT_REVISION_EXPORT_REQUIRED,
  D8_R11_EXPOSES_ASSUMPTION_CONTEXT,
  D8_R11_EXPOSES_CHANGE_CONTEXT,
  D8_R11_EXPOSES_CONTROL_SYSTEM_CONTEXT,
  D8_R11_EXPOSES_CURRENTNESS,
  D8_R11_EXPOSES_DECISION_CONTEXT,
  D8_R11_EXPOSES_DIGITAL_THREAD_RELATIONSHIPS,
  D8_R11_EXPOSES_DISCIPLINE_HANDOFF_CONTEXT,
  D8_R11_EXPOSES_FINDING_CONTEXT,
  D8_R11_EXPOSES_FINGERPRINT_STATUS,
  D8_R11_EXPOSES_IDENTITY_CONTEXT,
  D8_R11_EXPOSES_INSTRUMENT_DEVICE_CONTEXT,
  D8_R11_EXPOSES_LINEAGE,
  D8_R11_EXPOSES_MEASUREMENT_TAG_CONTEXT,
  D8_R11_EXPOSES_REASSESSMENT_CONTEXT,
  D8_R11_EXPOSES_REQUIREMENT_CONTEXT,
  D8_R11_EXPOSES_REVIEW_CONTEXT,
  D8_R11_EXPOSES_SAFETY_INTERLOCK_SHUTDOWN_CONTEXT,
  D8_R11_EXPOSES_SIGNAL_IO_LOOP_CONTEXT,
  D8_R11_EXPOSES_VALIDATION_GOVERNANCE_CONTEXT,
  D8_R11_FLOATING_CURRENT_EXPORT_ALLOWED,
  D8_R11_GENERATES_CROSS_DISCIPLINE_RECOMMENDATION,
  D8_R11_GENERATES_ENGINEERING_RECOMMENDATION,
  D8_R11_HISTORICAL_REFERENCE_AUTO_REPOINTED,
  D8_R11_INFERS_MISSING_ENGINEERING_VALUE,
  D8_R11_INFERS_RELATIONSHIP_FROM_DOCUMENT_PROXIMITY,
  D8_R11_INFERS_RELATIONSHIP_FROM_NAME,
  D8_R11_INFERS_RELATIONSHIP_FROM_SEMANTIC_SIMILARITY,
  D8_R11_INFERS_RELATIONSHIP_FROM_TAG,
  D8_R11_INFERRED_LINEAGE_ALLOWED,
  D8_R11_LIMITATIONS_PRESERVED,
  D8_R11_MATURITY,
  D8_R11_PERFORMS_AUTOMATIC_ENGINEERING_VALIDATION,
  D8_R11_PERFORMS_CROSS_DISCIPLINE_CONFLICT_DETECTION,
  D8_R11_PERFORMS_CROSS_DISCIPLINE_CONFLICT_RESOLUTION,
  D8_R11_PERFORMS_ENGINEERING_DERIVATION,
  D8_R11_PERFORMS_NUMERIC_DERIVATION,
  D8_R11_PRESERVES_AUTHORITY_METADATA,
  D8_R11_PRESERVES_CURRENTNESS_STATE,
  D8_R11_PRESERVES_EXPLICIT_LINEAGE,
  D8_R11_PROMOTES_CURRENT_TO_VALIDATED,
  D8_R11_PROMOTES_SOURCE_TO_VALIDATED,
  D8_R11_PROVENANCE_PRESERVED,
  D8_R11_PROVENANCE_REQUIRED,
  D8_R11_REPLAY_PROTECTION_IMPLEMENTED,
  D8_R11_SOURCE_AUTO_REPOINTED,
  D8_R11_SOURCE_BASIS_PRESERVED,
  D8_R11_SOURCE_BASIS_TRACEABLE,
  D8_R11_SOURCE_CONTRACT_VERSION,
  D8_R11_SOURCE_CONTRACT_VERSION_GOVERNED,
  D8_R11_SPOOFING_PROTECTION_IMPLEMENTED,
  D8_R11_STATUS,
  D8_R12_CANONICAL_PHASE,
  D8_R12_CANONICAL_SCOPE,
  D8_R12_PHASE_TYPE,
  D8_R12_STARTED,
  D8_R1_R10_EXACT_REVISIONS_REUSED,
  D8_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY,
  D8_REVIEW_VALIDATION_RUNTIME_READY,
  D8_RUNTIME_COUNT,
  D8_RUNTIME_STARTED,
  D8_SAFETY_INTERLOCK_SHUTDOWN_RUNTIME_READY,
  D8_SIGNAL_IO_CONTROL_LOOP_RUNTIME_READY,
  D8_SIL_CALCULATION_RUNTIME_COUNT,
  D8_SIL_VERIFICATION_RUNTIME_COUNT,
  D9_ASSUMPTION_READ_EQUALS_VALIDATED_FACT,
  D9_CHANGE_READ_EQUALS_AUTOMATIC_REDESIGN,
  D9_CURRENT_RECORD_EQUALS_VALIDATED,
  D9_CURRENTNESS_READ_EQUALS_VALIDATION,
  D9_DECISION_READ_EQUALS_APPROVAL,
  D9_EQUALS_D8_IAC_ENGINEERING_AUTHORITY,
  D9_FINGERPRINT_READ_EQUALS_APPROVAL,
  D9_HANDOFF_READ_EQUALS_AUTHORITY_TRANSFER,
  D9_HANDOFF_READ_EQUALS_COUNTERPART_ENGINEERING_TRUTH,
  D9_HANDOFF_READ_EQUALS_COUNTERPART_VALIDATED,
  D9_IDENTITY_READ_EQUALS_D8_AUTHORITY,
  D9_LINEAGE_READ_EQUALS_ENGINEERING_AUTHORITY,
  D9_MEASUREMENT_CONTEXT_EQUALS_VALIDATED_PROCESS_VALUE,
  D9_READ_ACCESS_EQUALS_COUNTERPART_ENGINEERING_AUTHORITY,
  D9_READ_ACCESS_EQUALS_D8_ENGINEERING_AUTHORITY,
  D9_REASSESSMENT_READ_EQUALS_VALIDATION,
  D9_REQUIREMENT_READ_EQUALS_REQUIREMENT_ADOPTION,
  D9_REVIEW_READ_EQUALS_ENGINEERING_VALIDATED,
  D9_RUNTIME_COUNT,
  D9_RUNTIME_STARTED,
  D9_STALE_RECORD_EQUALS_INVALID,
  D9_SUPERSEDED_RECORD_EQUALS_INVALID,
  D9_TAG_CONTEXT_EQUALS_VALIDATED_IAC_DESIGN,
  D9_VALIDATION_RECORD_READ_EQUALS_APPROVAL,
  DATABASE_SCHEMA_CHANGED,
  EXACT_D8_R11_SOURCE_REVISION_REQUIRED,
  FLOATING_D8_R11_SOURCE_REFERENCE_ALLOWED,
  NEW_DEPENDENCY_ADDED,
  PARALLEL_D8_CONTRACT_VERSION_ENGINE_CREATED,
  SILENT_D8_R11_CONTRACT_MUTATION_ALLOWED,
  TENANT_WORKSPACE_PROJECT_D8_R11_SCOPE_ENFORCED,
  createD8R11Store,
  createIacAssumptionFromSource,
  createIacDecisionFromSource,
  createIacRequirementFromSource,
  deriveIacSourceValue,
  detectIacCrossDisciplineConflict,
  inferIacSourceRelationship,
  mutateIacSourceTruth,
  rebaselineIacSourceFingerprint,
  recommendFromIacSource,
  recordIacD9SourceContract,
  repointIacSourceContract,
  resolveIacCrossDisciplineConflict,
  startD9FromIacSource,
  validateIacFromSource,
} from "./d9-source-contract";
import { D8_R11_STARTED, createD8R10Store, recordIacRevisionLineage, recordIacThreadRelationship } from "./currentness-digital-thread";
import { createD8R8Store, recordIacInterfaceHandoff } from "./discipline-interfaces-handoffs";
import { D8_CONTEXT_AUTHORITY, type D8R1Actor, createD8R1Store, recordIacContext, recordIacObjectIdentity } from "./identity-foundation";
import { createD8R3Store } from "./instrument-device-context";
import { createD8R2Store, recordProcessMeasurementContext } from "./process-measurement-tag-context";
import { createD8R7Store, recordIacChange, recordIacReassessment } from "./requirements-assumptions-change";
import { createD8R9Store, recordIacReviewRequest, recordIacReviewerAssignment, recordIacValidationState } from "./review-validation-governance";
import { createD8R6Store } from "./safety-interlock-shutdown-context";
import { createD8R4Store } from "./signal-io-control-loop-context";

const here = dirname(fileURLToPath(import.meta.url));

function actor(overrides: Partial<D8R1Actor> = {}): D8R1Actor {
  return { actorId: "iac-recorder", tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a", authority: D8_CONTEXT_AUTHORITY, ...overrides };
}

function identity(id: string) {
  return { citedLifecycleStage: "FEED" as const, provenanceRef: `prov-${id}`, sourceBasisRef: `basis-${id}`, applicability: `${id} identity scope`, limitations: "identity only" };
}

describe("EOS-D8-R11 D9 source contract", () => {
  it("exposes exact D8 revisions without creating engineering truth or starting D9", () => {
    expect(D8_R1_R10_EXACT_REVISIONS_REUSED && EXACT_D8_R11_SOURCE_REVISION_REQUIRED).toBe(true);
    expect(FLOATING_D8_R11_SOURCE_REFERENCE_ALLOWED || D8_R11_SOURCE_AUTO_REPOINTED || D8_R11_FLOATING_CURRENT_EXPORT_ALLOWED || D8_R11_HISTORICAL_REFERENCE_AUTO_REPOINTED || D8_R11_D9_CONTRACT_AUTO_REPOINTS_SOURCE_REVISION).toBe(false);
    expect(D8_RUNTIME_STARTED).toBe(true);
    expect(D8_RUNTIME_COUNT).toBe(11);
    expect(D8_R10_RUNTIME_COUNT).toBe(10);
    expect(ARCHITECTURE_RUNTIME_COUNT).toBe(0);
    expect(ARCHITECTURE_CONTRACT_COUNT).toBe(0);
    expect(D8_D9_SOURCE_CONTRACT_RUNTIME_IMPLEMENTED && D8_D9_SOURCE_CONTRACT_RUNTIME_READY && D8_D9_SOURCE_CONTRACT_READ_ONLY).toBe(true);
    expect(D8_D9_SOURCE_CONTRACT_RUNTIME_COUNT).toBe(1);
    expect(D8_D9_RUNTIME_INTEGRATION_COUNT).toBe(0);
    expect(D8_D9_SOURCE_CONTRACT_CAN_MUTATE_D8 || D8_D9_SOURCE_CONTRACT_CAN_MUTATE_COUNTERPART_DISCIPLINE).toBe(false);
    expect(D8_INSTRUMENTATION_CONTROL_IDENTITY_RUNTIME_READY && D8_PROCESS_MEASUREMENT_TAG_RUNTIME_READY && D8_INSTRUMENT_DEVICE_CONTEXT_RUNTIME_READY && D8_SIGNAL_IO_CONTROL_LOOP_RUNTIME_READY && D8_CONTROL_SYSTEM_ARCHITECTURE_RUNTIME_READY && D8_SAFETY_INTERLOCK_SHUTDOWN_RUNTIME_READY && D8_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY && D8_DISCIPLINE_INTERFACE_RUNTIME_READY && D8_REVIEW_VALIDATION_RUNTIME_READY && D8_CURRENTNESS_DIGITAL_THREAD_RUNTIME_READY).toBe(true);
    expect(D8_R11_EXPOSES_IDENTITY_CONTEXT && D8_R11_EXPOSES_MEASUREMENT_TAG_CONTEXT && D8_R11_EXPOSES_INSTRUMENT_DEVICE_CONTEXT && D8_R11_EXPOSES_SIGNAL_IO_LOOP_CONTEXT && D8_R11_EXPOSES_CONTROL_SYSTEM_CONTEXT && D8_R11_EXPOSES_SAFETY_INTERLOCK_SHUTDOWN_CONTEXT).toBe(true);
    expect(D8_R11_EXPOSES_REQUIREMENT_CONTEXT && D8_R11_EXPOSES_ASSUMPTION_CONTEXT && D8_R11_EXPOSES_DECISION_CONTEXT && D8_R11_EXPOSES_CHANGE_CONTEXT && D8_R11_EXPOSES_REASSESSMENT_CONTEXT && D8_R11_EXPOSES_DISCIPLINE_HANDOFF_CONTEXT).toBe(true);
    expect(D8_R11_EXPOSES_REVIEW_CONTEXT && D8_R11_EXPOSES_FINDING_CONTEXT && D8_R11_EXPOSES_VALIDATION_GOVERNANCE_CONTEXT && D8_R11_EXPOSES_CURRENTNESS && D8_R11_EXPOSES_LINEAGE && D8_R11_EXPOSES_DIGITAL_THREAD_RELATIONSHIPS && D8_R11_EXPOSES_FINGERPRINT_STATUS).toBe(true);
    expect(D9_IDENTITY_READ_EQUALS_D8_AUTHORITY || D9_MEASUREMENT_CONTEXT_EQUALS_VALIDATED_PROCESS_VALUE || D9_TAG_CONTEXT_EQUALS_VALIDATED_IAC_DESIGN || D9_HANDOFF_READ_EQUALS_COUNTERPART_ENGINEERING_TRUTH || D9_HANDOFF_READ_EQUALS_COUNTERPART_VALIDATED || D9_HANDOFF_READ_EQUALS_AUTHORITY_TRANSFER).toBe(false);
    expect(D9_REQUIREMENT_READ_EQUALS_REQUIREMENT_ADOPTION || D9_ASSUMPTION_READ_EQUALS_VALIDATED_FACT || D9_DECISION_READ_EQUALS_APPROVAL || D9_CHANGE_READ_EQUALS_AUTOMATIC_REDESIGN || D9_REASSESSMENT_READ_EQUALS_VALIDATION).toBe(false);
    expect(D9_REVIEW_READ_EQUALS_ENGINEERING_VALIDATED || D9_VALIDATION_RECORD_READ_EQUALS_APPROVAL || D9_CURRENTNESS_READ_EQUALS_VALIDATION || D9_LINEAGE_READ_EQUALS_ENGINEERING_AUTHORITY || D9_FINGERPRINT_READ_EQUALS_APPROVAL).toBe(false);
    expect(D8_R11_EXACT_REVISION_EXPORT_REQUIRED && D8_R11_PRESERVES_CURRENTNESS_STATE && D8_R11_PRESERVES_EXPLICIT_LINEAGE && D8_R11_PROVENANCE_REQUIRED && D8_R11_PROVENANCE_PRESERVED && D8_R11_APPLICABILITY_PRESERVED && D8_R11_LIMITATIONS_PRESERVED && D8_R11_SOURCE_BASIS_PRESERVED && D8_R11_SOURCE_BASIS_TRACEABLE && D8_R11_PRESERVES_AUTHORITY_METADATA && TENANT_WORKSPACE_PROJECT_D8_R11_SCOPE_ENFORCED).toBe(true);
    expect(D8_R11_INFERRED_LINEAGE_ALLOWED || D8_R11_AUTO_PROPAGATES_OUTSIDE_APPLICABILITY || CROSS_TENANT_D8_R11_ACCESS_ALLOWED || D9_CURRENT_RECORD_EQUALS_VALIDATED || D9_STALE_RECORD_EQUALS_INVALID || D9_SUPERSEDED_RECORD_EQUALS_INVALID).toBe(false);
    expect(D9_READ_ACCESS_EQUALS_D8_ENGINEERING_AUTHORITY || D9_READ_ACCESS_EQUALS_COUNTERPART_ENGINEERING_AUTHORITY || D9_EQUALS_D8_IAC_ENGINEERING_AUTHORITY).toBe(false);
    expect(D8_EQUALS_D1_STRUCTURAL_AUTHORITY || D8_EQUALS_D2_CIVIL_AUTHORITY || D8_EQUALS_D3_GEOTECHNICAL_AUTHORITY || D8_EQUALS_D4_MECHANICAL_AUTHORITY || D8_EQUALS_D5_PIPING_AUTHORITY || D8_EQUALS_D6_PROCESS_AUTHORITY || D8_EQUALS_D7_ELECTRICAL_AUTHORITY || AI_EQUALS_D8_IAC_ENGINEERING_AUTHORITY || ADMIN_EQUALS_D8_IAC_ENGINEERING_AUTHORITY).toBe(false);
    expect(D8_R11_CREATES_NEW_ENGINEERING_FACT || D8_R11_CREATES_NEW_DERIVED_VALUE || D8_R11_CREATES_NEW_REQUIREMENT || D8_R11_CREATES_NEW_ASSUMPTION || D8_R11_CREATES_NEW_ENGINEERING_DECISION || D8_R11_CREATES_NEW_RECOMMENDATION).toBe(false);
    expect(D8_R11_PERFORMS_ENGINEERING_DERIVATION || D8_R11_PERFORMS_NUMERIC_DERIVATION || D8_R11_INFERS_MISSING_ENGINEERING_VALUE || D8_R11_INFERS_RELATIONSHIP_FROM_NAME || D8_R11_INFERS_RELATIONSHIP_FROM_TAG || D8_R11_INFERS_RELATIONSHIP_FROM_DOCUMENT_PROXIMITY || D8_R11_INFERS_RELATIONSHIP_FROM_SEMANTIC_SIMILARITY).toBe(false);
    expect(D8_R11_PERFORMS_CROSS_DISCIPLINE_CONFLICT_DETECTION || D8_R11_PERFORMS_CROSS_DISCIPLINE_CONFLICT_RESOLUTION || D8_R11_GENERATES_CROSS_DISCIPLINE_RECOMMENDATION || D8_R11_GENERATES_ENGINEERING_RECOMMENDATION).toBe(false);
    expect(D8_R11_AUTO_MUTATES_R1_IDENTITY || D8_R11_AUTO_MUTATES_R2_MEASUREMENT_TAG_CONTEXT || D8_R11_AUTO_MUTATES_R3_INSTRUMENT_DEVICE_CONTEXT || D8_R11_AUTO_MUTATES_R4_SIGNAL_IO_LOOP_CONTEXT || D8_R11_AUTO_MUTATES_R5_CONTROL_SYSTEM_CONTEXT || D8_R11_AUTO_MUTATES_R6_SAFETY_CONTEXT || D8_R11_AUTO_MUTATES_R7_CHANGE_GOVERNANCE || D8_R11_AUTO_MUTATES_R8_INTERFACE_HANDOFF || D8_R11_AUTO_MUTATES_R9_REVIEW_VALIDATION || D8_R11_AUTO_MUTATES_R10_CURRENTNESS_THREAD).toBe(false);
    expect(D8_R11_AUTO_MUTATES_D1_STRUCTURAL || D8_R11_AUTO_MUTATES_D2_CIVIL || D8_R11_AUTO_MUTATES_D3_GEOTECHNICAL || D8_R11_AUTO_MUTATES_D4_MECHANICAL || D8_R11_AUTO_MUTATES_D5_PIPING || D8_R11_AUTO_MUTATES_D6_PROCESS || D8_R11_AUTO_MUTATES_D7_ELECTRICAL).toBe(false);
    expect(D8_R11_PERFORMS_AUTOMATIC_ENGINEERING_VALIDATION || D8_R11_PROMOTES_SOURCE_TO_VALIDATED || D8_R11_PROMOTES_CURRENT_TO_VALIDATED).toBe(false);
    expect(D8_R11_SOURCE_CONTRACT_VERSION_GOVERNED).toBe(true);
    expect(PARALLEL_D8_CONTRACT_VERSION_ENGINE_CREATED || D8_R11_CONTRACT_FINGERPRINT_MISMATCH_AUTO_REPAIRED || D8_R11_CONTRACT_FINGERPRINT_MISMATCH_AUTO_REBASELINED || SILENT_D8_R11_CONTRACT_MUTATION_ALLOWED).toBe(false);
    expect(D8_R11_CONTRACT_FINGERPRINT_VERIFICATION_IMPLEMENTED && D8_R11_CONTRACT_HISTORY_PRESERVED && D8_R11_DUPLICATE_GOVERNANCE_IMPLEMENTED && D8_R11_REPLAY_PROTECTION_IMPLEMENTED && D8_R11_SPOOFING_PROTECTION_IMPLEMENTED).toBe(true);
    expect(AI_CAN_INVENT_D8_R11_AUTHORITATIVE_SOURCE_FACT || AI_CAN_INVENT_D8_R11_AUTHORITATIVE_RELATIONSHIP || AI_CAN_PROMOTE_D9_READ_ACCESS_TO_ENGINEERING_AUTHORITY || ADMIN_CAN_BYPASS_D8_R11_AUTHORITY_BOUNDARY).toBe(false);
    expect([D8_INSTRUMENT_SIZING_RUNTIME_COUNT, D8_INSTRUMENT_SELECTION_RUNTIME_COUNT, D8_CONTROL_VALVE_SIZING_RUNTIME_COUNT, D8_ACTUATOR_SIZING_RUNTIME_COUNT, D8_CONTROL_LOOP_TUNING_RUNTIME_COUNT, D8_CONTROL_LOGIC_DESIGN_RUNTIME_COUNT, D8_AUTOMATIC_CONTROL_LOGIC_GENERATION_RUNTIME_COUNT, D8_SIL_CALCULATION_RUNTIME_COUNT, D8_SIL_VERIFICATION_RUNTIME_COUNT, D8_FUNCTIONAL_SAFETY_VALIDATION_RUNTIME_COUNT, D8_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT, D8_CONFORMANCE_DETERMINATION_RUNTIME_COUNT, D8_APPROVAL_RUNTIME_COUNT, D8_CERTIFICATION_RUNTIME_COUNT, D8_AUTOMATIC_IAC_DESIGN_RUNTIME_COUNT, D8_AUTOMATIC_IAC_REDESIGN_RUNTIME_COUNT, D8_D9_RUNTIME_INTEGRATION_COUNT, D8_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT, D8_CROSS_DISCIPLINE_CONFLICT_DETECTION_RUNTIME_COUNT, D8_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT, D8_CROSS_DISCIPLINE_RECOMMENDATION_RUNTIME_COUNT, D9_RUNTIME_COUNT]).toEqual(Array(22).fill(0));
    expect(D9_RUNTIME_STARTED || DATABASE_SCHEMA_CHANGED || NEW_DEPENDENCY_ADDED || D8_R11_STARTED || D8_R12_STARTED).toBe(false);
    expect(D8_CANONICAL_MILESTONE_COUNT).toBe(13);
    expect(D8_R11_STATUS).toBe("D9_SOURCE_CONTRACT_IMPLEMENTED");
    expect(D8_R11_MATURITY).toBe(D8_R11_STATUS);
    expect(D8_R12_CANONICAL_PHASE).toBe("EOS-D8-R12-INSTRUMENTATION-CONTROL-BOUNDED-CLOSEOUT");
    expect(D8_R12_PHASE_TYPE).toBe("INSTRUMENTATION_CONTROL_BOUNDED_CLOSEOUT");
    expect(D8_R11_CANONICAL_NEXT_PHASE).toBe(D8_R12_CANONICAL_PHASE);
    expect(D8_R11_CANONICAL_NEXT_PHASE_SCOPE).toBe(D8_R12_CANONICAL_SCOPE);

    const r1 = createD8R1Store();
    const who = actor();
    const reviewer = { ...actor({ actorId: "iac-reviewer", authority: "REVIEWER" }), actorKind: "human" as const, aal: "aal2" };
    const validator = { ...actor({ actorId: "iac-validator", authority: "IAC_VALIDATION_AUTHORITY" }), actorKind: "human" as const, aal: "aal2" };
    recordIacContext(r1, who, { contextId: "ctx-1", ...identity("ctx") });
    const face = recordIacObjectIdentity(r1, who, { objectId: "ifc-101", contextId: "ctx-1", objectType: "IAC_MEASUREMENT_POINT", ...identity("ifc-101") });
    const r2 = createD8R2Store(r1);
    const measured = recordProcessMeasurementContext(r2, who, { measurementRecordId: "meas-1", contextId: "ctx-1", objectId: face.objectId, objectRevisionFingerprint: face.fingerprint, citedLifecycleStage: "FEED", citedCurrentness: "CURRENT", measurementPurpose: "PROCESS_MONITORING", processVariableType: "PRESSURE", locationReference: "line-explicit-12", provenanceRef: "prov-meas", sourceBasisRef: "basis-meas", applicability: "ifc-101 measurement context", limitations: "context only" });
    const r7 = createD8R7Store(createD8R6Store(createD8R5Store(createD8R4Store(createD8R3Store(r2)))));
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
    const threadStore = createD8R10Store(reviews);
    const basis = { contextId: "ctx-1", tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a", citedCurrentness: "CURRENT", provenanceRef: "prov-thread", sourceBasisRef: "basis-thread", limitations: "thread is not authority" };
    const objectPin = { subjectKind: "OBJECT", subjectId: face.objectId, subjectRevision: face.provenanceRef, subjectFingerprint: face.fingerprint };
    const handoffPin = { subjectKind: "HANDOFF", subjectId: handoff.handoffId, subjectRevision: handoff.provenanceRef, subjectFingerprint: handoff.fingerprint };
    const reviewPin = { subjectKind: "REVIEW_REQUEST", subjectId: request.reviewRequestId, subjectRevision: request.provenanceRef, subjectFingerprint: request.fingerprint };
    recordIacRevisionLineage(threadStore, who, { ...basis, lineageId: "lin-1", predecessor: objectPin, successor: handoffPin, relationshipType: "DEPENDS_ON", applicability: "ifc-101 lineage scope", counterpartRevision: "rev-d6-1", counterpartFingerprint: "fp-d6-1" });
    recordIacThreadRelationship(threadStore, who, { ...basis, relationshipId: "thr-1", source: objectPin, target: reviewPin, relationshipType: "REVIEWS", applicability: "ifc-101 thread scope" });
    const before = JSON.stringify({ objects: r1.objects, measurements: r2.measurements, handoffs: handoffs.handoffs, changes: r7.changes, reassessments: r7.reassessments, requests: reviews.requests, validations: reviews.validations, edges: threadStore.edges });
    const store = createD8R11Store(threadStore);
    const contract = recordIacD9SourceContract(store, who, { contractId: "src-1", contractVersion: D8_R11_SOURCE_CONTRACT_VERSION, contextId: "ctx-1", objectId: face.objectId, sourceRevision: face.provenanceRef, citedCurrentness: "CURRENT", provenanceRef: "prov-source", tenantId: "tenant-a" });
    const fields = contract.fields as {
      IDENTITY: { exactRevision: string; fingerprint: string; newIdentityCreated: boolean; authority: string };
      MEASUREMENT_OR_INSTRUMENT: { measurements: { subjectId: string; validatedProcessValue: boolean }[]; tags: unknown[]; devices: unknown[]; validatedInstrumentSelection: boolean };
      SIGNAL_IO_OR_CONTROL_LOOP: { signals: unknown[]; ioRecords: unknown[]; loops: unknown[]; controlLogic: boolean };
      CONTROL_SYSTEM: { systems: unknown[]; networks: unknown[]; cybersecurityValidated: boolean };
      ALARM_INTERLOCK_OR_SHUTDOWN: { safety: unknown[]; functionalSafetyValidated: boolean; silVerified: boolean };
      REQUIREMENTS: unknown[];
      ASSUMPTIONS: unknown[];
      ENGINEERING_DECISIONS: unknown[];
      EVIDENCE: { validationId: string; createdByContract: boolean }[];
      INTERFACES: { subjectId: string; counterpartValidated: boolean; authorityTransferred: boolean; counterpart: { fingerprint: string } }[];
      REVIEW_VALIDATION: { reviews: { engineeringValidated: boolean }[]; findings: unknown[]; validations: { approved: boolean; engineeringValidated: boolean }[]; validationEqualsApproved: boolean };
      CURRENTNESS: { state: string; currentEqualsValidated: boolean; changes: { subjectId: string; automaticRedesign: boolean }[]; reassessments: { subjectId: string; validated: boolean; state: string }[]; fingerprintEqualsApproval: boolean };
      LINEAGE: { lineage: { edgeId: string; inferred: boolean; engineeringAuthority: boolean; source: { subjectRevision: string } }[]; threads: { inferred: boolean; engineeringAuthority: boolean }[]; inferred: boolean };
      APPLICABILITY: string[];
      LIMITATIONS: string[];
      PROVENANCE: { provenanceRef: string; exactRevision: string };
      AUTHORITY: { d9: boolean; transferred: boolean };
    };

    expect(contract.readOnly).toBe(true);
    expect(contract.exactRevision).toBe(face.provenanceRef);
    expect(contract.engineeringFactCreated || contract.derivedValueCreated || contract.requirementCreated || contract.assumptionCreated || contract.decisionCreated || contract.recommendationCreated || contract.d9Started || contract.validatesEngineering || contract.authorityTransferred || contract.approved).toBe(false);
    expect(contract.fingerprintMatchEqualsApproval || contract.fingerprintMatchEqualsValidated).toBe(false);
    expect(fields.IDENTITY.exactRevision).toBe(face.provenanceRef);
    expect(fields.IDENTITY.fingerprint).toBe(face.fingerprint);
    expect(fields.IDENTITY.newIdentityCreated).toBe(false);
    expect(fields.IDENTITY.authority).toBe(D8_CONTEXT_AUTHORITY);
    expect(fields.MEASUREMENT_OR_INSTRUMENT.measurements).toHaveLength(1);
    expect(fields.MEASUREMENT_OR_INSTRUMENT.measurements[0].subjectId).toBe(measured.measurementRecordId);
    expect(fields.MEASUREMENT_OR_INSTRUMENT.measurements[0].validatedProcessValue || fields.MEASUREMENT_OR_INSTRUMENT.validatedInstrumentSelection).toBe(false);
    expect(Array.isArray(fields.MEASUREMENT_OR_INSTRUMENT.tags) && Array.isArray(fields.MEASUREMENT_OR_INSTRUMENT.devices)).toBe(true);
    expect(fields.SIGNAL_IO_OR_CONTROL_LOOP.controlLogic).toBe(false);
    expect(Array.isArray(fields.SIGNAL_IO_OR_CONTROL_LOOP.signals) && Array.isArray(fields.SIGNAL_IO_OR_CONTROL_LOOP.ioRecords) && Array.isArray(fields.SIGNAL_IO_OR_CONTROL_LOOP.loops)).toBe(true);
    expect(fields.CONTROL_SYSTEM.cybersecurityValidated).toBe(false);
    expect(Array.isArray(fields.CONTROL_SYSTEM.systems) && Array.isArray(fields.CONTROL_SYSTEM.networks)).toBe(true);
    expect(fields.ALARM_INTERLOCK_OR_SHUTDOWN.functionalSafetyValidated || fields.ALARM_INTERLOCK_OR_SHUTDOWN.silVerified).toBe(false);
    expect(Array.isArray(fields.ALARM_INTERLOCK_OR_SHUTDOWN.safety) && Array.isArray(fields.REQUIREMENTS) && Array.isArray(fields.ASSUMPTIONS) && Array.isArray(fields.ENGINEERING_DECISIONS)).toBe(true);
    expect(fields.EVIDENCE[0].validationId).toBe(validated.validationId);
    expect(fields.EVIDENCE[0].createdByContract).toBe(false);
    expect(fields.INTERFACES[0].subjectId).toBe(handoff.handoffId);
    expect(fields.INTERFACES[0].counterpart.fingerprint).toBe("fp-d6-1");
    expect(fields.INTERFACES[0].counterpartValidated || fields.INTERFACES[0].authorityTransferred).toBe(false);
    expect(fields.REVIEW_VALIDATION.reviews[0].engineeringValidated).toBe(false);
    expect(fields.REVIEW_VALIDATION.validations[0].engineeringValidated).toBe(true);
    expect(fields.REVIEW_VALIDATION.validations[0].approved || fields.REVIEW_VALIDATION.validationEqualsApproved).toBe(false);
    expect(Array.isArray(fields.REVIEW_VALIDATION.findings)).toBe(true);
    expect(fields.CURRENTNESS.state).toBe("CURRENT");
    expect(fields.CURRENTNESS.currentEqualsValidated || fields.CURRENTNESS.fingerprintEqualsApproval).toBe(false);
    expect(fields.CURRENTNESS.changes[0].subjectId).toBe(change.changeId);
    expect(fields.CURRENTNESS.changes[0].automaticRedesign).toBe(false);
    expect(fields.CURRENTNESS.reassessments[0].subjectId).toBe(reassessment.reassessmentId);
    expect(fields.CURRENTNESS.reassessments[0].state).toBe("REASSESSMENT_REQUIRED");
    expect(fields.CURRENTNESS.reassessments[0].validated).toBe(false);
    expect(fields.LINEAGE.lineage[0].edgeId).toBe("lin-1");
    expect(fields.LINEAGE.lineage[0].source.subjectRevision).toBe(face.provenanceRef);
    expect(fields.LINEAGE.lineage[0].inferred || fields.LINEAGE.lineage[0].engineeringAuthority || fields.LINEAGE.threads[0].engineeringAuthority || fields.LINEAGE.inferred).toBe(false);
    expect(fields.APPLICABILITY.some((row) => row.includes(face.objectId))).toBe(true);
    expect(fields.LIMITATIONS.length).toBeGreaterThan(0);
    expect(fields.PROVENANCE.provenanceRef).toBe("prov-source");
    expect(fields.PROVENANCE.exactRevision).toBe(face.provenanceRef);
    expect(fields.AUTHORITY.d9 || fields.AUTHORITY.transferred).toBe(false);
    const replay = recordIacD9SourceContract(store, who, { contractId: "src-1", contractVersion: D8_R11_SOURCE_CONTRACT_VERSION, contextId: "ctx-1", objectId: face.objectId, sourceRevision: face.provenanceRef, citedCurrentness: "CURRENT", provenanceRef: "prov-source", tenantId: "tenant-a" });
    expect(replay.fingerprint).toBe(contract.fingerprint);
    expect(store.history).toHaveLength(1);
    expect(() => recordIacD9SourceContract(store, who, { contractId: "src-dup", contractVersion: D8_R11_SOURCE_CONTRACT_VERSION, contextId: "ctx-1", objectId: face.objectId, sourceRevision: face.provenanceRef, citedCurrentness: "CURRENT", provenanceRef: "prov-source-2", tenantId: "tenant-a" })).toThrow(/DUPLICATE_SOURCE_CONTRACT_REJECTED/);
    expect(() => recordIacD9SourceContract(store, who, { contractId: "src-float", contractVersion: D8_R11_SOURCE_CONTRACT_VERSION, contextId: "ctx-1", objectId: face.objectId, sourceRevision: "latest", citedCurrentness: "CURRENT", provenanceRef: "prov-source", tenantId: "tenant-a" })).toThrow(/SUBJECT_REVISION_REQUIRED/);
    expect(() => recordIacD9SourceContract(store, who, { contractId: "src-bad", contractVersion: D8_R11_SOURCE_CONTRACT_VERSION, contextId: "ctx-1", objectId: face.objectId, sourceRevision: face.provenanceRef, citedCurrentness: "CURRENT", provenanceRef: "prov-source", tenantId: "tenant-a", assertedFingerprint: "fp-mismatch" })).toThrow(/FINGERPRINT_MISMATCH/);
    expect(() => recordIacD9SourceContract(store, who, { contractId: "src-version", contractVersion: "D8-D9-SOURCE-CONTRACT-2", contextId: "ctx-1", objectId: face.objectId, sourceRevision: face.provenanceRef, citedCurrentness: "CURRENT", provenanceRef: "prov-source", tenantId: "tenant-a" })).toThrow(/CONTRACT_VERSION_NOT_GOVERNED/);
    expect(() => recordIacD9SourceContract(store, actor({ actorId: "AI-recorder", authority: "AI" }), { contractId: "src-ai", contractVersion: D8_R11_SOURCE_CONTRACT_VERSION, contextId: "ctx-1", objectId: face.objectId, sourceRevision: face.provenanceRef, citedCurrentness: "CURRENT", provenanceRef: "prov-source", tenantId: "tenant-a" })).toThrow(/AI_NOT_IAC_AUTHORITY/);
    expect(() => recordIacD9SourceContract(store, actor({ actorId: "ADMIN", authority: "ADMIN" }), { contractId: "src-admin", contractVersion: D8_R11_SOURCE_CONTRACT_VERSION, contextId: "ctx-1", objectId: face.objectId, sourceRevision: face.provenanceRef, citedCurrentness: "CURRENT", provenanceRef: "prov-source", tenantId: "tenant-a" })).toThrow(/ADMIN_CANNOT_OVERRIDE/);
    expect(() => recordIacD9SourceContract(store, actor({ tenantId: "tenant-b" }), { contractId: "src-cross", contractVersion: D8_R11_SOURCE_CONTRACT_VERSION, contextId: "ctx-1", objectId: face.objectId, sourceRevision: face.provenanceRef, citedCurrentness: "CURRENT", provenanceRef: "prov-source", tenantId: "tenant-b" })).toThrow(/CROSS_TENANT_OPERATION|R1_CONTEXT_NOT_FOUND/);
    expect(() => recordIacD9SourceContract(store, who, { contractId: "src-derive", contractVersion: D8_R11_SOURCE_CONTRACT_VERSION, contextId: "ctx-1", objectId: face.objectId, sourceRevision: face.provenanceRef, citedCurrentness: "CURRENT", provenanceRef: "prov-source", tenantId: "tenant-a", derive: true })).toThrow(/DERIVATION_NOT_IN_R11/);
    expect(() => recordIacD9SourceContract(store, who, { contractId: "src-infer", contractVersion: D8_R11_SOURCE_CONTRACT_VERSION, contextId: "ctx-1", objectId: face.objectId, sourceRevision: face.provenanceRef, citedCurrentness: "CURRENT", provenanceRef: "prov-source", tenantId: "tenant-a", inferFromTag: true })).toThrow(/INFERRED_RELATIONSHIP_REJECTED/);
    expect(() => recordIacD9SourceContract(store, who, { contractId: "src-conflict", contractVersion: D8_R11_SOURCE_CONTRACT_VERSION, contextId: "ctx-1", objectId: face.objectId, sourceRevision: face.provenanceRef, citedCurrentness: "CURRENT", provenanceRef: "prov-source", tenantId: "tenant-a", detectConflict: true })).toThrow(/CONFLICT_DETECTION_NOT_IN_R11/);
    expect(() => recordIacD9SourceContract(store, who, { contractId: "src-recommend", contractVersion: D8_R11_SOURCE_CONTRACT_VERSION, contextId: "ctx-1", objectId: face.objectId, sourceRevision: face.provenanceRef, citedCurrentness: "CURRENT", provenanceRef: "prov-source", tenantId: "tenant-a", recommend: true })).toThrow(/RECOMMENDATION_NOT_IN_R11/);
    expect(() => recordIacD9SourceContract(store, who, { contractId: "src-strip", contractVersion: D8_R11_SOURCE_CONTRACT_VERSION, contextId: "ctx-1", objectId: face.objectId, sourceRevision: face.provenanceRef, citedCurrentness: "CURRENT", provenanceRef: "prov-source", tenantId: "tenant-a", stripLimitations: true })).toThrow(/LIMITATION_STRIPPING_REJECTED/);
    expect(() => recordIacD9SourceContract(store, who, { contractId: "src-validate", contractVersion: D8_R11_SOURCE_CONTRACT_VERSION, contextId: "ctx-1", objectId: face.objectId, sourceRevision: face.provenanceRef, citedCurrentness: "CURRENT", provenanceRef: "prov-source", tenantId: "tenant-a", promoteValidated: true })).toThrow(/VALIDATION_NOT_IN_R11/);
    expect(() => repointIacSourceContract()).toThrow(/AUTO_REPOINT_REJECTED/);
    expect(() => inferIacSourceRelationship()).toThrow(/INFERRED_RELATIONSHIP_REJECTED/);
    expect(() => deriveIacSourceValue()).toThrow(/DERIVATION_NOT_IN_R11/);
    expect(() => createIacRequirementFromSource()).toThrow(/REQUIREMENT_CREATION_REJECTED/);
    expect(() => createIacAssumptionFromSource()).toThrow(/ASSUMPTION_CREATION_REJECTED/);
    expect(() => createIacDecisionFromSource()).toThrow(/DECISION_CREATION_REJECTED/);
    expect(() => recommendFromIacSource()).toThrow(/RECOMMENDATION_NOT_IN_R11/);
    expect(() => detectIacCrossDisciplineConflict()).toThrow(/CONFLICT_DETECTION_NOT_IN_R11/);
    expect(() => resolveIacCrossDisciplineConflict()).toThrow(/CONFLICT_RESOLUTION_NOT_IN_R11/);
    expect(() => startD9FromIacSource()).toThrow(/D9_NOT_STARTED/);
    expect(() => mutateIacSourceTruth()).toThrow(/UPSTREAM_MUTATION_REJECTED/);
    expect(() => rebaselineIacSourceFingerprint()).toThrow(/FINGERPRINT_REBASELINE_REJECTED/);
    expect(() => validateIacFromSource()).toThrow(/VALIDATION_NOT_IN_R11/);
    expect(JSON.stringify({ objects: r1.objects, measurements: r2.measurements, handoffs: handoffs.handoffs, changes: r7.changes, reassessments: r7.reassessments, requests: reviews.requests, validations: reviews.validations, edges: threadStore.edges })).toBe(before);
    expect(store.contracts).toHaveLength(1);

    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D8.R11.D9_SOURCE_CONTRACT")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D8.R12.INSTRUMENTATION_CONTROL_BOUNDED_CLOSEOUT")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    const sourceText = readFileSync(join(here, "d9-source-contract.ts"), "utf8");
    expect(sourceText).toMatch(/fingerprintCanonical/);
    expect(sourceText).toMatch(/D8_D9_SOURCE_CONTRACT_FIELDS/);
    expect(sourceText).toMatch(/exposedIacCurrentness/);
    expect(sourceText).not.toMatch(/createHash|from ["']@rtb\/engineering-review["']|CREATE TABLE|eval\(|child_process|new Function/);
    expect(scanAnalysisFormulaBypass(join(here, "d9-source-contract.ts"), sourceText)).toEqual([]);
    const pkg = JSON.parse(readFileSync(join(here, "../../package.json"), "utf8")) as { dependencies: Record<string, string> };
    expect(Object.keys(pkg.dependencies).sort()).toEqual(["@rtb/database", "@rtb/engineering-review", "@rtb/platform-commerce", "@rtb/platform-intelligence", "@rtb/platform-kernel", "@rtb/types", "docx", "exceljs", "pptxgenjs", "zod"]);
  });
});
