import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  D6_PROCESS_OBJECT_TYPES,
  D6_RUNTIME_COUNT as ARCHITECTURE_D6_RUNTIME_COUNT,
  D6_SYSTEM_STREAM_SERVICE_RUNTIME_COUNT as ARCHITECTURE_CONTEXT_COUNT,
} from "@rtb/types";
import { describe, expect, it } from "vitest";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import { D5_CONTEXT_AUTHORITY, createD5R1Store, recordPipingContext, recordPipingObjectIdentity } from "../piping/identity-foundation";
import { STRUCTURAL_CAPABILITY_MANIFEST } from "../structural-concrete/capability";
import { scanAnalysisFormulaBypass } from "../structural-systems/formula-scan";
import { D6_CONTEXT_AUTHORITY, D6_R2_STARTED, createD6R1Store, recordProcessContext, recordProcessObjectIdentity } from "./identity-foundation";
import {
  ADMIN_CAN_PROMOTE_CANDIDATE_D6_R2_CONTEXT_TO_ENGINEERING_TRUTH,
  ADMIN_EQUALS_D6_PROCESS_ENGINEERING_AUTHORITY,
  AI_CAN_INVENT_AUTHORITATIVE_D6_SERVICE_CONTEXT,
  AI_CAN_INVENT_AUTHORITATIVE_D6_SYSTEM_STREAM_RELATIONSHIP,
  AI_EQUALS_D6_PROCESS_ENGINEERING_AUTHORITY,
  BASISLESS_AUTHORITATIVE_D6_R2_RECORD_AUTO_ACCEPTED,
  CROSS_TENANT_D6_R2_ACCESS_ALLOWED,
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
  D6_AUTO_CREATES_D5_LINE_FROM_PROCESS_STREAM,
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
  D6_DESIGN_BASIS_CONDITION_RUNTIME_COUNT,
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
  D6_EXPLICIT_STREAM_ORIGIN_DESTINATION_RELATIONSHIP_SUPPORTED,
  D6_EXPLICIT_STREAM_SERVICE_ASSOCIATION_REQUIRED,
  D6_EXPLICIT_SYSTEM_STREAM_MEMBERSHIP_REQUIRED,
  D6_HYDRAULIC_CALCULATION_RUNTIME_COUNT,
  D6_INFERRED_D5_LINE_MEMBERSHIP_ALLOWED,
  D6_INFERRED_STREAM_ORIGIN_DESTINATION_ALLOWED,
  D6_INFERRED_STREAM_SERVICE_ASSOCIATION_ALLOWED,
  D6_INFERRED_SYSTEM_STREAM_MEMBERSHIP_ALLOWED,
  D6_MASS_BALANCE_CALCULATION_RUNTIME_COUNT,
  D6_PRESSURE_DROP_CALCULATION_RUNTIME_COUNT,
  D6_PROCESS_CALCULATION_RUNTIME_COUNT,
  D6_PROCESS_EVIDENCE_RUNTIME_COUNT,
  D6_PROCESS_FLUID_CONTEXT_SUPPORTED,
  D6_PROCESS_PHASE_CONTEXT_SUPPORTED,
  D6_PROCESS_SAFETY_RELIEF_RUNTIME_COUNT,
  D6_PROCESS_SERVICE_FUNCTION_CONTEXT_IMPLEMENTED,
  D6_PROCESS_STREAM_CAN_REFERENCE_D5_LINE,
  D6_PROCESS_STREAM_CONTEXT_IMPLEMENTED,
  D6_PROCESS_STREAM_REFERENCE_TRANSFERS_D5_AUTHORITY,
  D6_PROCESS_SYSTEM_CONTEXT_IMPLEMENTED,
  D6_R1_IDENTITY_REUSED,
  D6_R1_RUNTIME_COUNT,
  D6_R2_APPLICABILITY_EXPLICIT,
  D6_R2_AUTO_PROPAGATED_OUTSIDE_APPLICABILITY,
  D6_R2_AUTO_REPOINTED,
  D6_R2_BLOCKER,
  D6_R2_CANONICAL_NEXT_PHASE,
  D6_R2_CANONICAL_NEXT_PHASE_SCOPE,
  D6_R2_COMPOSITION_CALCULATION_ALLOWED,
  D6_R2_DESIGN_BASIS_ENGINEERING_IMPLEMENTED,
  D6_R2_DESIGN_CONDITION_ENGINEERING_IMPLEMENTED,
  D6_R2_DUPLICATE_GOVERNANCE_IMPLEMENTED,
  D6_R2_HIDDEN_CALCULATION_ALLOWED,
  D6_R2_HISTORY_PRESERVED,
  D6_R2_LIMITATIONS_EXPLICIT,
  D6_R2_MACHINE_READABLE_ROADMAP_UPDATED,
  D6_R2_MATURITY,
  D6_R2_NEXT_PHASE_TYPE,
  D6_R2_NORMALIZES_COMPOSITION_TO_ENGINEERING_TRUTH,
  D6_R2_OPERATING_CONDITION_ENGINEERING_IMPLEMENTED,
  D6_R2_PROVENANCE_PRESERVED,
  D6_R2_PROVENANCE_REQUIRED,
  D6_R2_REPLAY_PROTECTION_IMPLEMENTED,
  D6_R2_SOURCE_AUTO_REPOINTED,
  D6_R2_SOURCE_BASIS_REQUIRED,
  D6_R2_SOURCE_BASIS_TRACEABLE,
  D6_R2_SPOOFING_PROTECTION_IMPLEMENTED,
  D6_R2_STATUS,
  D6_R3_STARTED,
  D6_RELIEF_CALCULATION_RUNTIME_COUNT,
  D6_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_COUNT,
  D6_REUSES_CANONICAL_CURRENTNESS,
  D6_REUSES_CANONICAL_DIGITAL_THREAD,
  D6_REUSES_CANONICAL_FINGERPRINT,
  D6_REVIEW_VALIDATION_RUNTIME_COUNT,
  D6_RUNTIME_COUNT,
  D6_RUNTIME_STARTED,
  D6_SUPPLIED_COMPOSITION_CONTEXT_SUPPORTED,
  D6_SYSTEM_STREAM_SERVICE_RUNTIME_COUNT,
  D6_SYSTEM_STREAM_SERVICE_RUNTIME_IMPLEMENTED,
  D6_SYSTEM_STREAM_SERVICE_RUNTIME_READY,
  D6_UTILITY_CALCULATION_RUNTIME_COUNT,
  D7_RUNTIME_STARTED,
  D8_RUNTIME_STARTED,
  D9_RUNTIME_COUNT,
  D9_RUNTIME_STARTED,
  DATABASE_SCHEMA_CHANGED,
  EXACT_D5_LINE_REVISION_REQUIRED_WHEN_REFERENCED,
  EXACT_D6_FLUID_IDENTITY_REVISION_REQUIRED,
  EXACT_D6_R1_IDENTITY_REVISION_REQUIRED,
  FLOATING_D6_R2_SOURCE_REFERENCE_ALLOWED,
  NEW_DEPENDENCY_ADDED,
  PARALLEL_D6_CURRENTNESS_ENGINE_CREATED,
  PARALLEL_D6_DIGITAL_THREAD_CREATED,
  PROCESS_FLUID_CONTEXT_EQUALS_THERMODYNAMIC_MODEL,
  PROCESS_FLUID_CONTEXT_EQUALS_VALIDATED_COMPOSITION,
  PROCESS_PHASE_CONTEXT_EQUALS_PHASE_EQUILIBRIUM_CALCULATION,
  PROCESS_PHASE_CONTEXT_EQUALS_VALIDATED_PHASE_BEHAVIOR,
  PROCESS_SERVICE_AUTO_CREATES_D5_PIPING_SERVICE,
  PROCESS_SERVICE_CONTEXT_EQUALS_PROCESS_DESIGN,
  PROCESS_SERVICE_EQUALS_PIPING_SERVICE_CONTEXT,
  PROCESS_STREAM_CONTEXT_EQUALS_PROCESS_STREAM_CALCULATION,
  PROCESS_STREAM_CONTEXT_EQUALS_VALIDATED_PROCESS_DESIGN,
  PROCESS_STREAM_EQUALS_PIPING_LINE,
  PROCESS_STREAM_IDENTITY_EQUALS_PIPING_LINE_IDENTITY,
  PROCESS_SYSTEM_CONTEXT_EQUALS_ENGINEERING_VALIDATED,
  PROCESS_SYSTEM_CONTEXT_EQUALS_PROCESS_SYSTEM_DESIGN,
  SECOND_D6_FINGERPRINT_ALGORITHM_CREATED,
  SILENT_D6_R2_MUTATION_ALLOWED,
  SUPPLIED_COMPOSITION_CONTEXT_EQUALS_VALIDATED_COMPOSITION,
  TENANT_WORKSPACE_PROJECT_D6_R2_SCOPE_ENFORCED,
  UNAUTHORIZED_D6_R3_R12_RUNTIME_PROMOTION,
  UNAUTHORIZED_PROCESS_CONDITION_PROMOTION,
  UNAUTHORIZED_PROCESS_EQUIPMENT_DUTY_PROMOTION,
  UNAUTHORIZED_PROCESS_SAFETY_PROMOTION,
  calculateProcessBalance,
  calculateProcessComposition,
  calculateProcessHydraulic,
  createD6R2Store,
  createPipingLineFromProcessStream,
  createPipingServiceFromProcessService,
  mutateProcessSystemStreamService,
  propagateProcessContext,
  recordProcessDesignBasis,
  recordProcessEquipmentDuty,
  recordProcessFluidContext,
  recordProcessOperatingCondition,
  recordProcessPhaseContext,
  recordProcessSafetyRelief,
  recordProcessServiceFunction,
  recordProcessStreamContext,
  recordProcessStreamOriginDestination,
  recordProcessStreamServiceAssociation,
  recordProcessSuppliedCompositionContext,
  recordProcessSystemContext,
  recordProcessSystemStreamMembership,
  repointProcessSystemStreamService,
  validateProcessEngineering,
} from "./system-stream-service-context";

describe("EOS-D6-R2 Process system stream and service context", () => {
  it("records descriptive Process context on exact R1 identities without later engineering", () => {
    expect(D6_R2_STATUS).toBe("PROCESS_SYSTEM_STREAM_AND_SERVICE_CONTEXT_IMPLEMENTED");
    expect(D6_R2_MATURITY).toBe(D6_R2_STATUS);
    expect(D6_RUNTIME_STARTED).toBe(true);
    expect(D6_RUNTIME_COUNT).toBe(2);
    expect(D6_R1_RUNTIME_COUNT).toBe(1);
    expect(ARCHITECTURE_D6_RUNTIME_COUNT).toBe(0);
    expect(ARCHITECTURE_CONTEXT_COUNT).toBe(0);
    expect(D6_R2_STARTED).toBe(false);
    expect(D6_R3_STARTED).toBe(false);
    expect(D6_R1_IDENTITY_REUSED).toBe(true);
    expect(EXACT_D6_R1_IDENTITY_REVISION_REQUIRED).toBe(true);
    expect(FLOATING_D6_R2_SOURCE_REFERENCE_ALLOWED).toBe(false);
    expect(D6_R2_SOURCE_AUTO_REPOINTED).toBe(false);
    expect(D6_SYSTEM_STREAM_SERVICE_RUNTIME_IMPLEMENTED).toBe(true);
    expect(D6_SYSTEM_STREAM_SERVICE_RUNTIME_COUNT).toBe(1);
    expect(D6_SYSTEM_STREAM_SERVICE_RUNTIME_READY).toBe(true);
    expect(D6_PROCESS_SYSTEM_CONTEXT_IMPLEMENTED).toBe(true);
    expect(PROCESS_SYSTEM_CONTEXT_EQUALS_PROCESS_SYSTEM_DESIGN).toBe(false);
    expect(PROCESS_SYSTEM_CONTEXT_EQUALS_ENGINEERING_VALIDATED).toBe(false);
    expect(D6_PROCESS_STREAM_CONTEXT_IMPLEMENTED).toBe(true);
    expect(PROCESS_STREAM_CONTEXT_EQUALS_PROCESS_STREAM_CALCULATION).toBe(false);
    expect(PROCESS_STREAM_CONTEXT_EQUALS_VALIDATED_PROCESS_DESIGN).toBe(false);
    expect(D6_PROCESS_SERVICE_FUNCTION_CONTEXT_IMPLEMENTED).toBe(true);
    expect(PROCESS_SERVICE_CONTEXT_EQUALS_PROCESS_DESIGN).toBe(false);
    expect(D6_EXPLICIT_SYSTEM_STREAM_MEMBERSHIP_REQUIRED).toBe(true);
    expect(D6_INFERRED_SYSTEM_STREAM_MEMBERSHIP_ALLOWED).toBe(false);
    expect(D6_EXPLICIT_STREAM_SERVICE_ASSOCIATION_REQUIRED).toBe(true);
    expect(D6_INFERRED_STREAM_SERVICE_ASSOCIATION_ALLOWED).toBe(false);
    expect(D6_EXPLICIT_STREAM_ORIGIN_DESTINATION_RELATIONSHIP_SUPPORTED).toBe(true);
    expect(D6_INFERRED_STREAM_ORIGIN_DESTINATION_ALLOWED).toBe(false);
    expect(D6_PROCESS_FLUID_CONTEXT_SUPPORTED).toBe(true);
    expect(EXACT_D6_FLUID_IDENTITY_REVISION_REQUIRED).toBe(true);
    expect(PROCESS_FLUID_CONTEXT_EQUALS_VALIDATED_COMPOSITION).toBe(false);
    expect(PROCESS_FLUID_CONTEXT_EQUALS_THERMODYNAMIC_MODEL).toBe(false);
    expect(D6_PROCESS_PHASE_CONTEXT_SUPPORTED).toBe(true);
    expect(PROCESS_PHASE_CONTEXT_EQUALS_PHASE_EQUILIBRIUM_CALCULATION).toBe(false);
    expect(PROCESS_PHASE_CONTEXT_EQUALS_VALIDATED_PHASE_BEHAVIOR).toBe(false);
    expect(D6_SUPPLIED_COMPOSITION_CONTEXT_SUPPORTED).toBe(true);
    expect(SUPPLIED_COMPOSITION_CONTEXT_EQUALS_VALIDATED_COMPOSITION).toBe(false);
    expect(D6_R2_COMPOSITION_CALCULATION_ALLOWED).toBe(false);
    expect(D6_R2_NORMALIZES_COMPOSITION_TO_ENGINEERING_TRUTH).toBe(false);
    expect(D6_PROCESS_STREAM_CAN_REFERENCE_D5_LINE).toBe(true);
    expect(EXACT_D5_LINE_REVISION_REQUIRED_WHEN_REFERENCED).toBe(true);
    expect(D6_PROCESS_STREAM_REFERENCE_TRANSFERS_D5_AUTHORITY).toBe(false);
    expect(PROCESS_STREAM_EQUALS_PIPING_LINE).toBe(false);
    expect(PROCESS_STREAM_IDENTITY_EQUALS_PIPING_LINE_IDENTITY).toBe(false);
    expect(D6_AUTO_CREATES_D5_LINE_FROM_PROCESS_STREAM).toBe(false);
    expect(D6_INFERRED_D5_LINE_MEMBERSHIP_ALLOWED).toBe(false);
    expect(PROCESS_SERVICE_EQUALS_PIPING_SERVICE_CONTEXT).toBe(false);
    expect(PROCESS_SERVICE_AUTO_CREATES_D5_PIPING_SERVICE).toBe(false);
    expect(D6_R2_OPERATING_CONDITION_ENGINEERING_IMPLEMENTED).toBe(false);
    expect(D6_R2_DESIGN_CONDITION_ENGINEERING_IMPLEMENTED).toBe(false);
    expect(D6_R2_DESIGN_BASIS_ENGINEERING_IMPLEMENTED).toBe(false);
    expect(D6_R2_SOURCE_BASIS_REQUIRED).toBe(true);
    expect(D6_R2_SOURCE_BASIS_TRACEABLE).toBe(true);
    expect(BASISLESS_AUTHORITATIVE_D6_R2_RECORD_AUTO_ACCEPTED).toBe(false);
    expect(D6_R2_APPLICABILITY_EXPLICIT).toBe(true);
    expect(D6_R2_LIMITATIONS_EXPLICIT).toBe(true);
    expect(D6_R2_AUTO_PROPAGATED_OUTSIDE_APPLICABILITY).toBe(false);
    expect(D6_REUSES_CANONICAL_CURRENTNESS).toBe(true);
    expect(D6_REUSES_CANONICAL_DIGITAL_THREAD).toBe(true);
    expect(D6_REUSES_CANONICAL_FINGERPRINT).toBe(true);
    expect(PARALLEL_D6_CURRENTNESS_ENGINE_CREATED).toBe(false);
    expect(PARALLEL_D6_DIGITAL_THREAD_CREATED).toBe(false);
    expect(SECOND_D6_FINGERPRINT_ALGORITHM_CREATED).toBe(false);
    expect(D6_R2_HISTORY_PRESERVED).toBe(true);
    expect(D6_R2_AUTO_REPOINTED).toBe(false);
    expect(SILENT_D6_R2_MUTATION_ALLOWED).toBe(false);
    expect(D6_R2_PROVENANCE_REQUIRED).toBe(true);
    expect(D6_R2_PROVENANCE_PRESERVED).toBe(true);
    expect(TENANT_WORKSPACE_PROJECT_D6_R2_SCOPE_ENFORCED).toBe(true);
    expect(CROSS_TENANT_D6_R2_ACCESS_ALLOWED).toBe(false);
    expect(AI_EQUALS_D6_PROCESS_ENGINEERING_AUTHORITY).toBe(false);
    expect(ADMIN_EQUALS_D6_PROCESS_ENGINEERING_AUTHORITY).toBe(false);
    expect(AI_CAN_INVENT_AUTHORITATIVE_D6_SYSTEM_STREAM_RELATIONSHIP).toBe(false);
    expect(AI_CAN_INVENT_AUTHORITATIVE_D6_SERVICE_CONTEXT).toBe(false);
    expect(ADMIN_CAN_PROMOTE_CANDIDATE_D6_R2_CONTEXT_TO_ENGINEERING_TRUTH).toBe(false);
    expect(D6_EQUALS_D1_STRUCTURAL_AUTHORITY).toBe(false);
    expect(D6_EQUALS_D2_CIVIL_AUTHORITY).toBe(false);
    expect(D6_EQUALS_D3_GEOTECHNICAL_AUTHORITY).toBe(false);
    expect(D6_EQUALS_D4_MECHANICAL_AUTHORITY).toBe(false);
    expect(D6_EQUALS_D5_PIPING_AUTHORITY).toBe(false);
    expect(D6_EQUALS_D7_ELECTRICAL_AUTHORITY).toBe(false);
    expect(D6_EQUALS_D8_INSTRUMENTATION_CONTROL_AUTHORITY).toBe(false);
    expect(D6_R2_DUPLICATE_GOVERNANCE_IMPLEMENTED).toBe(true);
    expect(D6_R2_REPLAY_PROTECTION_IMPLEMENTED).toBe(true);
    expect(D6_R2_SPOOFING_PROTECTION_IMPLEMENTED).toBe(true);
    expect(D6_R2_HIDDEN_CALCULATION_ALLOWED).toBe(false);
    expect([
      D6_DESIGN_BASIS_CONDITION_RUNTIME_COUNT,
      D6_PROCESS_EVIDENCE_RUNTIME_COUNT,
      D6_EQUIPMENT_DUTY_RUNTIME_COUNT,
      D6_PROCESS_SAFETY_RELIEF_RUNTIME_COUNT,
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
      D6_EQUIPMENT_DUTY_CALCULATION_RUNTIME_COUNT,
      D6_RELIEF_CALCULATION_RUNTIME_COUNT,
      D6_DEPRESSURING_CALCULATION_RUNTIME_COUNT,
      D6_UTILITY_CALCULATION_RUNTIME_COUNT,
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
    ]).toEqual(Array(29).fill(0));
    expect(D1_STRUCTURAL_PACK_COMPLETE).toBe(false);
    expect(D1N_REOPENED).toBe(false);
    expect(D2_TRACK_COMPLETE).toBe(true);
    expect(D2_REOPENED).toBe(false);
    expect(D3_TRACK_COMPLETE).toBe(true);
    expect(D3_REOPENED).toBe(false);
    expect(D4_TRACK_COMPLETE).toBe(true);
    expect(D4_REOPENED).toBe(false);
    expect(D5_TRACK_COMPLETE).toBe(true);
    expect(D5_REOPENED).toBe(false);
    expect(D7_RUNTIME_STARTED).toBe(false);
    expect(D8_RUNTIME_STARTED).toBe(false);
    expect(D9_RUNTIME_STARTED).toBe(false);
    expect(D9_RUNTIME_COUNT).toBe(0);
    expect(DATABASE_SCHEMA_CHANGED).toBe(false);
    expect(NEW_DEPENDENCY_ADDED).toBe(false);
    expect(UNAUTHORIZED_D6_R3_R12_RUNTIME_PROMOTION).toBe(false);
    expect(UNAUTHORIZED_PROCESS_CONDITION_PROMOTION).toBe(false);
    expect(UNAUTHORIZED_PROCESS_EQUIPMENT_DUTY_PROMOTION).toBe(false);
    expect(UNAUTHORIZED_PROCESS_SAFETY_PROMOTION).toBe(false);
    expect(D6_R2_CANONICAL_NEXT_PHASE).toBe("EOS-D6-R3-OPERATING-AND-DESIGN-BASIS-AND-CONDITIONS");
    expect(D6_R2_NEXT_PHASE_TYPE).toBe("OPERATING_AND_DESIGN_BASIS_AND_CONDITIONS");
    expect(D6_R2_CANONICAL_NEXT_PHASE_SCOPE).toContain("exact R1-R2 revisions");
    expect(D6_R2_BLOCKER).toBe("NONE");
    expect(D6_R2_MACHINE_READABLE_ROADMAP_UPDATED).toBe(true);
    expect(D6_PROCESS_OBJECT_TYPES).not.toContain("PROCESS_PHASE");
    expect(D6_PROCESS_OBJECT_TYPES).not.toContain("PIPING_LINE");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D6.R2.PROCESS_SYSTEM_STREAM_AND_SERVICE_CONTEXT")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D6.R3.OPERATING_AND_DESIGN_BASIS_AND_CONDITIONS")?.implementationState).toBe("IMPLEMENTED_BOUNDED");

    const actor = { actorId: "proc-recorder", tenantId: "t1", workspaceId: "w1", projectId: "p1", authority: D6_CONTEXT_AUTHORITY };
    const r1 = createD6R1Store();
    recordProcessContext(r1, actor, { contextId: "ctx-1", citedLifecycleStage: "FEED", provenanceRef: "prov-ctx", sourceBasisRef: "basis-ctx" });
    const identity = (objectId: string, objectType: string, extra: Record<string, unknown> = {}) => recordProcessObjectIdentity(r1, actor, {
      objectId, contextId: "ctx-1", objectType, citedLifecycleStage: "FEED", provenanceRef: `prov-${objectId}`, sourceBasisRef: `basis-${objectId}`, ...extra,
    });
    const system = identity("sys-1", "PROCESS_SYSTEM");
    const unit = identity("unit-1", "PROCESS_UNIT");
    const stream = identity("stream-1", "PROCESS_STREAM");
    const stream2 = identity("stream-2", "PROCESS_STREAM");
    const service = identity("svc-1", "PROCESS_SERVICE");
    const fluid = identity("fluid-1", "PROCESS_FLUID", { phaseClassification: "VAPOR" });
    const composition = identity("comp-1", "PROCESS_COMPOSITION_CONTEXT", { phaseClassification: "LIQUID" });
    const d5 = createD5R1Store();
    const piping = { actorId: "piping-recorder", tenantId: "t1", workspaceId: "w1", projectId: "p1", authority: D5_CONTEXT_AUTHORITY };
    recordPipingContext(d5, piping, { contextId: "d5-ctx", citedLifecycleStage: "FEED", provenanceRef: "d5-prov" });
    const line = recordPipingObjectIdentity(d5, piping, { objectId: "line-1", contextId: "d5-ctx", objectType: "PIPING_LINE", citedLifecycleStage: "FEED", provenanceRef: "d5-line" });
    const store = createD6R2Store(r1, d5);
    const bound = (objectId: string, fingerprint: string, extra: Record<string, unknown> = {}) => ({
      contextId: "ctx-1",
      objectId,
      objectRevisionFingerprint: fingerprint,
      citedLifecycleStage: "FEED",
      provenanceRef: "prov-r2",
      sourceBasisRef: "basis-r2",
      citedCurrentness: "CURRENT",
      applicability: `applies only to ${objectId}`,
      limitations: "descriptive context only",
      ...extra,
    });
    const systemContext = recordProcessSystemContext(store, actor, {
      ...bound(system.objectId, system.fingerprint),
      systemRecordId: "sys-rec-1",
      purpose: "Feed preparation system",
      systemFunction: "SEPARATION",
      systemCategory: "PRIMARY_PROCESS_SYSTEM",
      unitObjectId: unit.objectId,
      unitRevisionFingerprint: unit.fingerprint,
    });
    expect(systemContext.systemDesign).toBe(false);
    expect(systemContext.engineeringValidated).toBe(false);
    expect(systemContext.unitObjectId).toBe(unit.objectId);
    expect(systemContext.fingerprint).toBe(fingerprintCanonical({
      systemRecordId: "sys-rec-1", contextId: "ctx-1", objectId: system.objectId, objectRevisionFingerprint: system.fingerprint,
      purpose: "Feed preparation system", systemFunction: "SEPARATION", systemCategory: "PRIMARY_PROCESS_SYSTEM",
      unitObjectId: unit.objectId, unitRevisionFingerprint: unit.fingerprint,
      applicability: "applies only to sys-1", limitations: "descriptive context only", provenanceRef: "prov-r2", sourceBasisRef: "basis-r2",
      citedLifecycleStage: "FEED", citedCurrentness: "CURRENT", predecessorSystemRecordId: null,
    }));
    expect(recordProcessSystemContext(store, actor, {
      ...bound(system.objectId, system.fingerprint),
      systemRecordId: "sys-rec-1",
      purpose: "Feed preparation system",
      systemFunction: "SEPARATION",
      systemCategory: "PRIMARY_PROCESS_SYSTEM",
      unitObjectId: unit.objectId,
      unitRevisionFingerprint: unit.fingerprint,
    })).toBe(systemContext);
    const streamContext = recordProcessStreamContext(store, actor, {
      ...bound(stream.objectId, stream.fingerprint),
      streamRecordId: "stream-rec-1",
      streamFunction: "FEED",
      fluidObjectId: fluid.objectId,
      fluidRevisionFingerprint: fluid.fingerprint,
      citedPhaseClassification: "VAPOR",
      compositionObjectId: composition.objectId,
      compositionRevisionFingerprint: composition.fingerprint,
      pipingLineObjectId: line.objectId,
      pipingLineRevisionFingerprint: line.fingerprint,
    });
    expect(streamContext.streamCalculation).toBe(false);
    expect(streamContext.validatedProcessDesign).toBe(false);
    expect(streamContext.transfersD5Authority).toBe(false);
    expect(streamContext.pipingLineCreated).toBe(false);
    expect(streamContext.pipingLineIdentity).toBe(false);
    expect(streamContext.pipingLineObjectId).toBe(line.objectId);
    expect(streamContext.pipingLineRevisionFingerprint).toBe(line.fingerprint);
    const serviceContext = recordProcessServiceFunction(store, actor, {
      ...bound(service.objectId, service.fingerprint),
      serviceRecordId: "svc-rec-1",
      serviceFunction: "SEPARATION",
      serviceDescription: "Separates the feed stream",
    });
    expect(serviceContext.processDesign).toBe(false);
    expect(serviceContext.pipingServiceContext).toBe(false);
    expect(serviceContext.pipingServiceCreated).toBe(false);
    const membership = recordProcessSystemStreamMembership(store, actor, {
      ...bound(stream.objectId, stream.fingerprint),
      membershipId: "mem-1",
      systemObjectId: system.objectId,
      systemRevisionFingerprint: system.fingerprint,
    });
    expect(membership.inferred).toBe(false);
    expect(membership.membershipBasis).toBe("EXPLICIT");
    const association = recordProcessStreamServiceAssociation(store, actor, {
      ...bound(stream.objectId, stream.fingerprint),
      associationId: "assoc-1",
      serviceObjectId: service.objectId,
      serviceRevisionFingerprint: service.fingerprint,
    });
    expect(association.inferred).toBe(false);
    expect(association.processDesign).toBe(false);
    const endpoint = recordProcessStreamOriginDestination(store, actor, {
      ...bound(stream.objectId, stream.fingerprint),
      endpointId: "end-1",
      relatedObjectId: unit.objectId,
      relatedRevisionFingerprint: unit.fingerprint,
      role: "ORIGIN",
    });
    expect(endpoint.inferred).toBe(false);
    expect(endpoint.role).toBe("ORIGIN");
    const fluidContext = recordProcessFluidContext(store, actor, {
      ...bound(fluid.objectId, fluid.fingerprint),
      fluidRecordId: "fluid-rec-1",
      descriptiveContext: "Supplied hydrocarbon vapor",
    });
    expect(fluidContext.validatedComposition).toBe(false);
    expect(fluidContext.thermodynamicModel).toBe(false);
    expect(fluidContext.objectRevisionFingerprint).toBe(fluid.fingerprint);
    const phaseContext = recordProcessPhaseContext(store, actor, {
      ...bound(fluid.objectId, fluid.fingerprint),
      phaseRecordId: "phase-rec-1",
      citedPhaseClassification: "VAPOR",
    });
    expect(phaseContext.equilibriumCalculation).toBe(false);
    expect(phaseContext.validatedPhaseBehavior).toBe(false);
    const compositionContext = recordProcessSuppliedCompositionContext(store, actor, {
      ...bound(composition.objectId, composition.fingerprint),
      compositionRecordId: "comp-rec-1",
      suppliedStatement: "Supplier stated a liquid mixture",
    });
    expect(compositionContext.validatedComposition).toBe(false);
    expect(compositionContext.normalizedToTruth).toBe(false);
    expect(store.memberships.filter((row) => row.streamObjectId === stream2.objectId)).toEqual([]);
    const replaced = identity("sys-2", "PROCESS_SYSTEM", { predecessorObjectId: system.objectId });
    const next = recordProcessSystemContext(store, actor, {
      ...bound(replaced.objectId, replaced.fingerprint),
      systemRecordId: "sys-rec-2",
      purpose: "Revised feed preparation system",
      systemFunction: "SEPARATION",
      systemCategory: "PRIMARY_PROCESS_SYSTEM",
      predecessorSystemRecordId: systemContext.systemRecordId,
    });
    expect(next.predecessorSystemRecordId).toBe(systemContext.systemRecordId);
    expect(store.systems.find((row) => row.systemRecordId === systemContext.systemRecordId)?.fingerprint).toBe(systemContext.fingerprint);
    expect(store.systems.find((row) => row.systemRecordId === systemContext.systemRecordId)?.recordStatus).toBe("SUPERSEDED");
    expect(store.history.some((row) => row.subjectId === systemContext.systemRecordId && row.action === "SUPERSEDED" && row.fingerprint === systemContext.fingerprint)).toBe(true);

    const reject = (run: () => void) => expect(run).toThrow(/D6_R2_/);
    reject(() => recordProcessStreamContext(store, actor, { ...bound(stream.objectId, "latest"), streamRecordId: "bad-rev", streamFunction: "FEED" }));
    reject(() => recordProcessStreamContext(store, actor, { ...bound("missing", stream.fingerprint), streamRecordId: "bad-id", streamFunction: "FEED" }));
    reject(() => recordProcessStreamContext(store, actor, { ...bound(stream.objectId, stream.fingerprint), streamRecordId: "bad-line", streamFunction: "FEED", pipingLineObjectId: "missing-line", pipingLineRevisionFingerprint: "missing" }));
    reject(() => recordProcessStreamContext(store, actor, { ...bound(stream.objectId, stream.fingerprint), streamRecordId: "bad-tag", streamFunction: "FEED", pipingLineTag: "L-100" }));
    reject(() => recordProcessStreamContext(store, actor, { ...bound(stream.objectId, stream.fingerprint), streamRecordId: "bad-create", streamFunction: "FEED", createPipingLine: true }));
    reject(() => recordProcessStreamContext(store, actor, { ...bound(stream.objectId, stream.fingerprint), streamRecordId: "bad-phase", streamFunction: "FEED", fluidObjectId: fluid.objectId, fluidRevisionFingerprint: fluid.fingerprint, citedPhaseClassification: "LIQUID" }));
    reject(() => recordProcessStreamContext(store, actor, { ...bound(stream.objectId, stream.fingerprint), streamRecordId: "dup-stream", streamFunction: "FEED", pipingLineObjectId: line.objectId, pipingLineRevisionFingerprint: line.fingerprint, fluidObjectId: fluid.objectId, fluidRevisionFingerprint: fluid.fingerprint, citedPhaseClassification: "VAPOR", compositionObjectId: composition.objectId, compositionRevisionFingerprint: composition.fingerprint }));
    reject(() => recordProcessServiceFunction(store, actor, { ...bound(service.objectId, service.fingerprint), serviceRecordId: "bad-svc", serviceFunction: "SEPARATION", serviceDescription: "x", createPipingService: true }));
    reject(() => recordProcessSystemStreamMembership(store, actor, { ...bound(stream.objectId, stream.fingerprint), membershipId: "bad-mem", systemObjectId: system.objectId, systemRevisionFingerprint: system.fingerprint, membershipBasis: "MATCHING_TAG" }));
    reject(() => recordProcessSystemStreamMembership(store, actor, { ...bound(stream.objectId, stream.fingerprint), membershipId: "bad-prop", systemObjectId: system.objectId, systemRevisionFingerprint: system.fingerprint, propagate: true }));
    reject(() => recordProcessStreamOriginDestination(store, actor, { ...bound(stream.objectId, stream.fingerprint), endpointId: "bad-end", relatedObjectId: unit.objectId, relatedRevisionFingerprint: unit.fingerprint, role: "TAG_ORDERING" }));
    reject(() => recordProcessFluidContext(store, actor, { ...bound(fluid.objectId, fluid.fingerprint), fluidRecordId: "bad-fluid", descriptiveContext: "model", thermodynamicModel: true }));
    reject(() => recordProcessPhaseContext(store, actor, { ...bound(fluid.objectId, fluid.fingerprint), phaseRecordId: "bad-phase", citedPhaseClassification: "VAPOR", equilibriumCalculation: true }));
    reject(() => recordProcessSuppliedCompositionContext(store, actor, { ...bound(composition.objectId, composition.fingerprint), compositionRecordId: "bad-comp", suppliedStatement: "stated", normalizeComposition: true }));
    reject(() => recordProcessSuppliedCompositionContext(store, actor, { ...bound(composition.objectId, composition.fingerprint), compositionRecordId: "bad-frac", suppliedStatement: "stated", componentFractions: [1] }));
    reject(() => recordProcessSystemContext(store, actor, { ...bound(system.objectId, system.fingerprint), systemRecordId: "bad-cond", purpose: "x", systemFunction: "STORAGE", systemCategory: "OTHER_PROCESS_SYSTEM", operatingPressure: 10 }));
    reject(() => recordProcessSystemContext(store, actor, { ...bound(system.objectId, system.fingerprint), systemRecordId: "bad-basis", purpose: "x", systemFunction: "STORAGE", systemCategory: "OTHER_PROCESS_SYSTEM", sourceBasisRef: " " }));
    reject(() => recordProcessSystemContext(store, actor, { ...bound(system.objectId, system.fingerprint), systemRecordId: "bad-scope", purpose: "x", systemFunction: "STORAGE", systemCategory: "OTHER_PROCESS_SYSTEM", tenantId: "t2" }));
    reject(() => recordProcessSystemContext(store, { ...actor, actorId: "AI_1" }, { ...bound(replaced.objectId, replaced.fingerprint), systemRecordId: "bad-ai", purpose: "x", systemFunction: "STORAGE", systemCategory: "OTHER_PROCESS_SYSTEM" }));
    reject(() => recordProcessSystemContext(store, { ...actor, authority: "ADMIN" }, { ...bound(replaced.objectId, replaced.fingerprint), systemRecordId: "bad-admin", purpose: "x", systemFunction: "STORAGE", systemCategory: "OTHER_PROCESS_SYSTEM" }));
    reject(() => recordProcessSystemContext(store, actor, { ...bound(replaced.objectId, replaced.fingerprint), systemRecordId: "bad-fp", purpose: "x", systemFunction: "STORAGE", systemCategory: "OTHER_PROCESS_SYSTEM", assertedFingerprint: "spoof" }));
    reject(() => recordProcessStreamContext(store, actor, { ...bound(stream.objectId, stream.fingerprint), streamRecordId: "bad-calc", streamFunction: "FEED", massBalance: true }));
    reject(() => recordProcessStreamContext(store, actor, { ...bound(stream.objectId, stream.fingerprint), streamRecordId: "bad-hyd", streamFunction: "FEED", hydraulic: true }));
    reject(() => recordProcessServiceFunction(store, actor, { ...bound(service.objectId, service.fingerprint), serviceRecordId: "bad-duty", serviceFunction: "STORAGE", serviceDescription: "hold", equipmentDuty: true }));
    reject(() => recordProcessServiceFunction(store, actor, { ...bound(service.objectId, service.fingerprint), serviceRecordId: "bad-relief", serviceFunction: "STORAGE", serviceDescription: "hold", relief: true }));
    expect(mutateProcessSystemStreamService).toThrow(/D6_R2_/);
    expect(repointProcessSystemStreamService).toThrow(/D6_R2_/);
    expect(recordProcessOperatingCondition).toThrow(/D6_R2_/);
    expect(recordProcessDesignBasis).toThrow(/D6_R2_/);
    expect(calculateProcessComposition).toThrow(/D6_R2_/);
    expect(calculateProcessBalance).toThrow(/D6_R2_/);
    expect(calculateProcessHydraulic).toThrow(/D6_R2_/);
    expect(recordProcessEquipmentDuty).toThrow(/D6_R2_/);
    expect(recordProcessSafetyRelief).toThrow(/D6_R2_/);
    expect(createPipingLineFromProcessStream).toThrow(/D6_R2_/);
    expect(createPipingServiceFromProcessService).toThrow(/D6_R2_/);
    expect(validateProcessEngineering).toThrow(/D6_R2_/);
    expect(propagateProcessContext).toThrow(/D6_R2_/);
    const here = dirname(fileURLToPath(import.meta.url));
    const sourceText = readFileSync(join(here, "system-stream-service-context.ts"), "utf8");
    expect(sourceText).not.toMatch(/createHash|from ["']@rtb\/engineering-review["']|CREATE TABLE/);
    expect(scanAnalysisFormulaBypass(join(here, "system-stream-service-context.ts"), sourceText)).toEqual([]);
    const packageJson = JSON.parse(readFileSync(join(here, "../../package.json"), "utf8")) as { dependencies: Record<string, string> };
    expect(Object.keys(packageJson.dependencies).sort()).toEqual(["@rtb/database", "@rtb/platform-commerce", "@rtb/platform-intelligence", "@rtb/platform-kernel", "@rtb/types", "docx", "exceljs", "pptxgenjs", "zod"]);
  });
});
