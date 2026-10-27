import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  D6_DESIGN_BASIS_CONDITION_RUNTIME_COUNT as ARCHITECTURE_CONDITION_COUNT,
  D6_RUNTIME_COUNT as ARCHITECTURE_D6_RUNTIME_COUNT,
} from "@rtb/types";
import { describe, expect, it } from "vitest";
import { D5_CONTEXT_AUTHORITY, createD5R1Store, recordPipingContext, recordPipingObjectIdentity } from "../piping/identity-foundation";
import { STRUCTURAL_CAPABILITY_MANIFEST } from "../structural-concrete/capability";
import { scanAnalysisFormulaBypass } from "../structural-systems/formula-scan";
import { D6_CONTEXT_AUTHORITY, createD6R1Store, recordProcessContext, recordProcessObjectIdentity } from "./identity-foundation";
import {
  D6_R3_STARTED,
  createD6R2Store,
  recordProcessFluidContext,
  recordProcessPhaseContext,
  recordProcessStreamContext,
  recordProcessSuppliedCompositionContext,
  recordProcessSystemContext,
} from "./system-stream-service-context";
import {
  ADMIN_EQUALS_D6_PROCESS_ENGINEERING_AUTHORITY,
  AI_CAN_INVENT_AUTHORITATIVE_D6_DESIGN_BASIS,
  AI_CAN_INVENT_AUTHORITATIVE_D6_DESIGN_CONDITION,
  AI_CAN_INVENT_AUTHORITATIVE_D6_OPERATING_CONDITION,
  AI_CAN_SILENTLY_CHANGE_D6_R3_UNITS,
  AI_EQUALS_D6_PROCESS_ENGINEERING_AUTHORITY,
  BASISLESS_AUTHORITATIVE_D6_R3_RECORD_AUTO_ACCEPTED,
  CROSS_TENANT_D6_R3_ACCESS_ALLOWED,
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
  D6_ADOPTED_PROCESS_CONDITION_SUPPORTED,
  D6_APPROVAL_RUNTIME_COUNT,
  D6_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT,
  D6_AUTOMATIC_PROCESS_CALCULATION_RUNTIME_COUNT,
  D6_AUTOMATIC_REDESIGN_RUNTIME_COUNT,
  D6_CERTIFICATION_RUNTIME_COUNT,
  D6_CONDITION_ROLE_AUTO_INFERRED,
  D6_CONDITION_ROLE_EXPLICIT,
  D6_CONFORMANCE_DETERMINATION_RUNTIME_COUNT,
  D6_CREATES_D5_ADOPTED_PIPING_DESIGN_CONDITION,
  D6_CROSS_DISCIPLINE_CONFLICT_DETECTION_RUNTIME_COUNT,
  D6_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT,
  D6_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT,
  D6_CROSS_DISCIPLINE_RECOMMENDATION_RUNTIME_COUNT,
  D6_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT,
  D6_D9_RUNTIME_INTEGRATION_COUNT,
  D6_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
  D6_DEPRESSURING_CALCULATION_RUNTIME_COUNT,
  D6_DESIGN_BASIS_CONDITION_RUNTIME_COUNT,
  D6_DESIGN_BASIS_CONDITION_RUNTIME_IMPLEMENTED,
  D6_DESIGN_BASIS_CONDITION_RUNTIME_READY,
  D6_DISCIPLINE_INTERFACE_RUNTIME_COUNT,
  D6_ENERGY_BALANCE_CALCULATION_RUNTIME_COUNT,
  D6_EQUALS_D5_PIPING_AUTHORITY,
  D6_EQUIPMENT_DUTY_CALCULATION_RUNTIME_COUNT,
  D6_EQUIPMENT_DUTY_RUNTIME_COUNT,
  D6_EXPLICIT_CASE_CONDITION_RELATIONSHIP_REQUIRED,
  D6_HYDRAULIC_CALCULATION_RUNTIME_COUNT,
  D6_INFERRED_CASE_CONDITION_RELATIONSHIP_ALLOWED,
  D6_MASS_BALANCE_CALCULATION_RUNTIME_COUNT,
  D6_PRESSURE_DROP_CALCULATION_RUNTIME_COUNT,
  D6_PROCESS_CALCULATION_RUNTIME_COUNT,
  D6_PROCESS_DESIGN_BASIS_CONTEXT_IMPLEMENTED,
  D6_PROCESS_DESIGN_CASE_CONTEXT_IMPLEMENTED,
  D6_PROCESS_DESIGN_CONDITION_CONTEXT_IMPLEMENTED,
  D6_PROCESS_EVIDENCE_RUNTIME_COUNT,
  D6_PROCESS_OPERATING_CASE_CONTEXT_IMPLEMENTED,
  D6_PROCESS_OPERATING_CONDITION_CONTEXT_IMPLEMENTED,
  D6_PROCESS_SAFETY_RELIEF_RUNTIME_COUNT,
  D6_R1_IDENTITY_REUSED,
  D6_R2_FLUID_PHASE_CONTEXT_REUSED,
  D6_R2_RUNTIME_COUNT,
  D6_R2_SYSTEM_STREAM_SERVICE_CONTEXT_REUSED,
  D6_R3_APPLICABILITY_EXPLICIT,
  D6_R3_AUTO_MUTATES_D5_LINE,
  D6_R3_AUTO_PROPAGATED_OUTSIDE_APPLICABILITY,
  D6_R3_AUTO_REPOINTS_D5_REFERENCE,
  D6_R3_AUTO_REPOINTED,
  D6_R3_AUTO_WRITES_D5_DESIGN_CONDITION,
  D6_R3_BLOCKER,
  D6_R3_CANONICAL_NEXT_PHASE,
  D6_R3_CANONICAL_NEXT_PHASE_SCOPE,
  D6_R3_COMPOSITION_CALCULATION_ALLOWED,
  D6_R3_DERIVES_MISSING_PROCESS_VALUE,
  D6_R3_DUPLICATE_GOVERNANCE_IMPLEMENTED,
  D6_R3_ESTIMATES_AUTHORITATIVE_PROCESS_VALUE,
  D6_R3_HIDDEN_CALCULATION_ALLOWED,
  D6_R3_HISTORY_PRESERVED,
  D6_R3_INTERPOLATES_AUTHORITATIVE_PROCESS_VALUE,
  D6_R3_LIMITATIONS_EXPLICIT,
  D6_R3_MATURITY,
  D6_R3_NEXT_PHASE_TYPE,
  D6_R3_NORMALIZES_PROCESS_VALUE_TO_ENGINEERING_TRUTH,
  D6_R3_PHASE_EQUILIBRIUM_CALCULATION_ALLOWED,
  D6_R3_PROPERTY_PACKAGE_CALCULATION_ALLOWED,
  D6_R3_PROVENANCE_PRESERVED,
  D6_R3_PROVENANCE_REQUIRED,
  D6_R3_REPLAY_PROTECTION_IMPLEMENTED,
  D6_R3_SOURCE_AUTO_REPOINTED,
  D6_R3_SOURCE_BASIS_REQUIRED,
  D6_R3_SOURCE_BASIS_TRACEABLE,
  D6_R3_SPOOFING_PROTECTION_IMPLEMENTED,
  D6_R3_STATUS,
  D6_R3_THERMODYNAMIC_CALCULATION_ALLOWED,
  D6_R3_UNITS_PRESERVED,
  D6_R3_UNITS_REQUIRED,
  D6_R4_STARTED,
  D6_RELIEF_CALCULATION_RUNTIME_COUNT,
  D6_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_COUNT,
  D6_REUSES_CANONICAL_CURRENTNESS,
  D6_REUSES_CANONICAL_DIGITAL_THREAD,
  D6_REUSES_CANONICAL_FINGERPRINT,
  D6_REVIEW_VALIDATION_RUNTIME_COUNT,
  D6_RUNTIME_COUNT,
  D6_RUNTIME_STARTED,
  D6_SUPPLIED_PROCESS_CONDITION_SUPPORTED,
  D6_SUPPLIED_PROPERTY_CONTEXT_SUPPORTED,
  D6_UTILITY_CALCULATION_RUNTIME_COUNT,
  D7_RUNTIME_STARTED,
  D8_RUNTIME_STARTED,
  D9_RUNTIME_COUNT,
  D9_RUNTIME_STARTED,
  DATABASE_SCHEMA_CHANGED,
  DESIGN_CASE_CONTEXT_EQUALS_PROCESS_DESIGN_CALCULATED,
  DESIGN_CASE_CONTEXT_EQUALS_VALIDATED_PROCESS_DESIGN,
  EXACT_D5_LINE_REVISION_REQUIRED_WHEN_REFERENCED,
  EXACT_D6_R1_R2_REFERENCE_REQUIRED,
  FLOATING_D6_R3_SOURCE_REFERENCE_ALLOWED,
  NEW_DEPENDENCY_ADDED,
  OPERATING_CASE_CONTEXT_EQUALS_OPERATING_CONDITION_CALCULATED,
  OPERATING_CASE_CONTEXT_EQUALS_VALIDATED_PROCESS_DESIGN,
  OPERATING_CONDITION_AUTO_PROMOTED_TO_DESIGN_CONDITION,
  OPERATING_CONDITION_EQUALS_DESIGN_CONDITION,
  PARALLEL_D6_CURRENTNESS_ENGINE_CREATED,
  PARALLEL_D6_DIGITAL_THREAD_CREATED,
  PROCESS_CONDITION_EQUALS_PIPING_DESIGN_CONDITION,
  PROCESS_DESIGN_BASIS_EQUALS_CODE_CONFORMANCE,
  PROCESS_DESIGN_BASIS_EQUALS_VALIDATED_PROCESS_DESIGN,
  PROCESS_DESIGN_CONDITION_EQUALS_PIPING_DESIGN_CONDITION,
  PROCESS_DESIGN_CONDITION_EQUALS_VALIDATED_PROCESS_DESIGN,
  PROCESS_SOURCE_CONDITION_EQUALS_ADOPTED_PIPING_DESIGN_CONDITION,
  SECOND_D6_FINGERPRINT_ALGORITHM_CREATED,
  SILENT_D6_R3_MUTATION_ALLOWED,
  SUPPLIED_COMPOSITION_CONTEXT_EQUALS_VALIDATED_COMPOSITION,
  SUPPLIED_PROCESS_CONDITION_AUTO_ADOPTED,
  SUPPLIED_PROCESS_CONDITION_EQUALS_ADOPTED_PROCESS_CONDITION,
  SUPPLIED_PROPERTY_CONTEXT_EQUALS_VALIDATED_PROPERTY_MODEL,
  TENANT_WORKSPACE_PROJECT_D6_R3_SCOPE_ENFORCED,
  UNAUTHORIZED_D6_R4_R12_RUNTIME_PROMOTION,
  UNAUTHORIZED_PIPING_CONDITION_ADOPTION,
  UNAUTHORIZED_THERMODYNAMIC_CALCULATION_PROMOTION,
  calculateProcessBalance,
  calculateProcessHydraulic,
  calculateProcessProperty,
  calculateProcessThermodynamic,
  createD6R3Store,
  deriveProcessCondition,
  mutateProcessCondition,
  recordAdoptedProcessCondition,
  recordProcessDesignBasisContext,
  recordProcessDesignCaseContext,
  recordProcessDesignCondition,
  recordProcessEquipmentDuty,
  recordProcessOperatingCaseContext,
  recordProcessOperatingCondition,
  recordProcessSafetyRelief,
  recordProcessSuppliedProperty,
  repointProcessCondition,
  validateProcessEngineering,
  writePipingDesignConditionFromProcess,
} from "./operating-design-basis-conditions";

describe("EOS-D6-R3 operating and design basis and conditions", () => {
  it("records supplied and adopted Process conditions without deriving them", () => {
    expect(D6_R3_STATUS).toBe("OPERATING_AND_DESIGN_BASIS_AND_CONDITIONS_IMPLEMENTED");
    expect(D6_R3_MATURITY).toBe(D6_R3_STATUS);
    expect(D6_RUNTIME_STARTED).toBe(true);
    expect(D6_RUNTIME_COUNT).toBe(3);
    expect(D6_R2_RUNTIME_COUNT).toBe(2);
    expect(ARCHITECTURE_D6_RUNTIME_COUNT).toBe(0);
    expect(ARCHITECTURE_CONDITION_COUNT).toBe(0);
    expect(D6_R3_STARTED).toBe(false);
    expect(D6_R4_STARTED).toBe(false);
    expect(D6_R1_IDENTITY_REUSED).toBe(true);
    expect(D6_R2_SYSTEM_STREAM_SERVICE_CONTEXT_REUSED).toBe(true);
    expect(EXACT_D6_R1_R2_REFERENCE_REQUIRED).toBe(true);
    expect(FLOATING_D6_R3_SOURCE_REFERENCE_ALLOWED).toBe(false);
    expect(D6_R3_SOURCE_AUTO_REPOINTED).toBe(false);
    expect(D6_DESIGN_BASIS_CONDITION_RUNTIME_IMPLEMENTED).toBe(true);
    expect(D6_DESIGN_BASIS_CONDITION_RUNTIME_COUNT).toBe(1);
    expect(D6_DESIGN_BASIS_CONDITION_RUNTIME_READY).toBe(true);
    expect(D6_PROCESS_OPERATING_CASE_CONTEXT_IMPLEMENTED).toBe(true);
    expect(OPERATING_CASE_CONTEXT_EQUALS_OPERATING_CONDITION_CALCULATED).toBe(false);
    expect(OPERATING_CASE_CONTEXT_EQUALS_VALIDATED_PROCESS_DESIGN).toBe(false);
    expect(D6_PROCESS_DESIGN_CASE_CONTEXT_IMPLEMENTED).toBe(true);
    expect(DESIGN_CASE_CONTEXT_EQUALS_PROCESS_DESIGN_CALCULATED).toBe(false);
    expect(DESIGN_CASE_CONTEXT_EQUALS_VALIDATED_PROCESS_DESIGN).toBe(false);
    expect(D6_PROCESS_DESIGN_BASIS_CONTEXT_IMPLEMENTED).toBe(true);
    expect(PROCESS_DESIGN_BASIS_EQUALS_VALIDATED_PROCESS_DESIGN).toBe(false);
    expect(PROCESS_DESIGN_BASIS_EQUALS_CODE_CONFORMANCE).toBe(false);
    expect(D6_PROCESS_OPERATING_CONDITION_CONTEXT_IMPLEMENTED).toBe(true);
    expect(D6_PROCESS_DESIGN_CONDITION_CONTEXT_IMPLEMENTED).toBe(true);
    expect(PROCESS_DESIGN_CONDITION_EQUALS_VALIDATED_PROCESS_DESIGN).toBe(false);
    expect(PROCESS_DESIGN_CONDITION_EQUALS_PIPING_DESIGN_CONDITION).toBe(false);
    expect(D6_SUPPLIED_PROCESS_CONDITION_SUPPORTED).toBe(true);
    expect(D6_ADOPTED_PROCESS_CONDITION_SUPPORTED).toBe(true);
    expect(SUPPLIED_PROCESS_CONDITION_EQUALS_ADOPTED_PROCESS_CONDITION).toBe(false);
    expect(SUPPLIED_PROCESS_CONDITION_AUTO_ADOPTED).toBe(false);
    expect(D6_R3_UNITS_REQUIRED).toBe(true);
    expect(D6_R3_UNITS_PRESERVED).toBe(true);
    expect(AI_CAN_SILENTLY_CHANGE_D6_R3_UNITS).toBe(false);
    expect(D6_R3_DERIVES_MISSING_PROCESS_VALUE).toBe(false);
    expect(D6_R3_INTERPOLATES_AUTHORITATIVE_PROCESS_VALUE).toBe(false);
    expect(D6_R3_ESTIMATES_AUTHORITATIVE_PROCESS_VALUE).toBe(false);
    expect(D6_R3_NORMALIZES_PROCESS_VALUE_TO_ENGINEERING_TRUTH).toBe(false);
    expect(PROCESS_CONDITION_EQUALS_PIPING_DESIGN_CONDITION).toBe(false);
    expect(PROCESS_SOURCE_CONDITION_EQUALS_ADOPTED_PIPING_DESIGN_CONDITION).toBe(false);
    expect(D6_CREATES_D5_ADOPTED_PIPING_DESIGN_CONDITION).toBe(false);
    expect(EXACT_D5_LINE_REVISION_REQUIRED_WHEN_REFERENCED).toBe(true);
    expect(D6_R3_AUTO_MUTATES_D5_LINE).toBe(false);
    expect(D6_R3_AUTO_WRITES_D5_DESIGN_CONDITION).toBe(false);
    expect(D6_R3_AUTO_REPOINTS_D5_REFERENCE).toBe(false);
    expect(D6_R2_FLUID_PHASE_CONTEXT_REUSED).toBe(true);
    expect(SUPPLIED_COMPOSITION_CONTEXT_EQUALS_VALIDATED_COMPOSITION).toBe(false);
    expect(D6_R3_COMPOSITION_CALCULATION_ALLOWED).toBe(false);
    expect(D6_R3_PHASE_EQUILIBRIUM_CALCULATION_ALLOWED).toBe(false);
    expect(D6_R3_THERMODYNAMIC_CALCULATION_ALLOWED).toBe(false);
    expect(D6_SUPPLIED_PROPERTY_CONTEXT_SUPPORTED).toBe(true);
    expect(SUPPLIED_PROPERTY_CONTEXT_EQUALS_VALIDATED_PROPERTY_MODEL).toBe(false);
    expect(D6_R3_PROPERTY_PACKAGE_CALCULATION_ALLOWED).toBe(false);
    expect(D6_R3_SOURCE_BASIS_REQUIRED).toBe(true);
    expect(D6_R3_SOURCE_BASIS_TRACEABLE).toBe(true);
    expect(BASISLESS_AUTHORITATIVE_D6_R3_RECORD_AUTO_ACCEPTED).toBe(false);
    expect(D6_R3_APPLICABILITY_EXPLICIT).toBe(true);
    expect(D6_R3_LIMITATIONS_EXPLICIT).toBe(true);
    expect(D6_R3_AUTO_PROPAGATED_OUTSIDE_APPLICABILITY).toBe(false);
    expect(D6_EXPLICIT_CASE_CONDITION_RELATIONSHIP_REQUIRED).toBe(true);
    expect(D6_INFERRED_CASE_CONDITION_RELATIONSHIP_ALLOWED).toBe(false);
    expect(OPERATING_CONDITION_EQUALS_DESIGN_CONDITION).toBe(false);
    expect(OPERATING_CONDITION_AUTO_PROMOTED_TO_DESIGN_CONDITION).toBe(false);
    expect(D6_CONDITION_ROLE_EXPLICIT).toBe(true);
    expect(D6_CONDITION_ROLE_AUTO_INFERRED).toBe(false);
    expect(D6_REUSES_CANONICAL_CURRENTNESS).toBe(true);
    expect(D6_REUSES_CANONICAL_DIGITAL_THREAD).toBe(true);
    expect(D6_REUSES_CANONICAL_FINGERPRINT).toBe(true);
    expect(PARALLEL_D6_CURRENTNESS_ENGINE_CREATED).toBe(false);
    expect(PARALLEL_D6_DIGITAL_THREAD_CREATED).toBe(false);
    expect(SECOND_D6_FINGERPRINT_ALGORITHM_CREATED).toBe(false);
    expect(D6_R3_HISTORY_PRESERVED).toBe(true);
    expect(D6_R3_AUTO_REPOINTED).toBe(false);
    expect(SILENT_D6_R3_MUTATION_ALLOWED).toBe(false);
    expect(D6_R3_PROVENANCE_REQUIRED).toBe(true);
    expect(D6_R3_PROVENANCE_PRESERVED).toBe(true);
    expect(TENANT_WORKSPACE_PROJECT_D6_R3_SCOPE_ENFORCED).toBe(true);
    expect(CROSS_TENANT_D6_R3_ACCESS_ALLOWED).toBe(false);
    expect(AI_EQUALS_D6_PROCESS_ENGINEERING_AUTHORITY).toBe(false);
    expect(ADMIN_EQUALS_D6_PROCESS_ENGINEERING_AUTHORITY).toBe(false);
    expect(AI_CAN_INVENT_AUTHORITATIVE_D6_OPERATING_CONDITION).toBe(false);
    expect(AI_CAN_INVENT_AUTHORITATIVE_D6_DESIGN_CONDITION).toBe(false);
    expect(AI_CAN_INVENT_AUTHORITATIVE_D6_DESIGN_BASIS).toBe(false);
    expect(D6_EQUALS_D5_PIPING_AUTHORITY).toBe(false);
    expect(D6_R3_DUPLICATE_GOVERNANCE_IMPLEMENTED).toBe(true);
    expect(D6_R3_REPLAY_PROTECTION_IMPLEMENTED).toBe(true);
    expect(D6_R3_SPOOFING_PROTECTION_IMPLEMENTED).toBe(true);
    expect(D6_R3_HIDDEN_CALCULATION_ALLOWED).toBe(false);
    expect([
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
    ]).toEqual(Array(28).fill(0));
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
    expect(UNAUTHORIZED_D6_R4_R12_RUNTIME_PROMOTION).toBe(false);
    expect(UNAUTHORIZED_THERMODYNAMIC_CALCULATION_PROMOTION).toBe(false);
    expect(UNAUTHORIZED_PIPING_CONDITION_ADOPTION).toBe(false);
    expect(D6_R3_CANONICAL_NEXT_PHASE).toBe("EOS-D6-R4-PROCESS-EVIDENCE-AND-BALANCES");
    expect(D6_R3_NEXT_PHASE_TYPE).toBe("PROCESS_EVIDENCE_AND_BALANCES");
    expect(D6_R3_CANONICAL_NEXT_PHASE_SCOPE).toContain("exact R1-R3 revisions");
    expect(D6_R3_BLOCKER).toBe("NONE");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D6.R3.OPERATING_AND_DESIGN_BASIS_AND_CONDITIONS")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D6.R4.PROCESS_EVIDENCE_AND_BALANCES")?.implementationState).toBe("IMPLEMENTED_BOUNDED");

    const actor = { actorId: "proc-recorder", tenantId: "t1", workspaceId: "w1", projectId: "p1", authority: D6_CONTEXT_AUTHORITY };
    const r1 = createD6R1Store();
    recordProcessContext(r1, actor, { contextId: "ctx-1", citedLifecycleStage: "FEED", provenanceRef: "prov-ctx", sourceBasisRef: "basis-ctx" });
    const identity = (objectId: string, objectType: string, extra: Record<string, unknown> = {}) => recordProcessObjectIdentity(r1, actor, {
      objectId, contextId: "ctx-1", objectType, citedLifecycleStage: "FEED", provenanceRef: `prov-${objectId}`, sourceBasisRef: `basis-${objectId}`, ...extra,
    });
    const system = identity("sys-1", "PROCESS_SYSTEM");
    const stream = identity("stream-1", "PROCESS_STREAM");
    const stream2 = identity("stream-2", "PROCESS_STREAM");
    const operatingIdentity = identity("op-1", "PROCESS_OPERATING_CASE");
    const designIdentity = identity("des-1", "PROCESS_DESIGN_CASE");
    const basisIdentity = identity("basis-1", "PROCESS_DESIGN_BASIS");
    const fluid = identity("fluid-1", "PROCESS_FLUID", { phaseClassification: "VAPOR" });
    const composition = identity("comp-1", "PROCESS_COMPOSITION_CONTEXT", { phaseClassification: "LIQUID" });
    const d5 = createD5R1Store();
    const piping = { actorId: "piping-recorder", tenantId: "t1", workspaceId: "w1", projectId: "p1", authority: D5_CONTEXT_AUTHORITY };
    recordPipingContext(d5, piping, { contextId: "d5-ctx", citedLifecycleStage: "FEED", provenanceRef: "d5-prov" });
    const line = recordPipingObjectIdentity(d5, piping, { objectId: "line-1", contextId: "d5-ctx", objectType: "PIPING_LINE", citedLifecycleStage: "FEED", provenanceRef: "d5-line" });
    const r2 = createD6R2Store(r1, d5);
    const bound2 = (objectId: string, fingerprint: string, extra: Record<string, unknown> = {}) => ({
      contextId: "ctx-1", objectId, objectRevisionFingerprint: fingerprint, citedLifecycleStage: "FEED", provenanceRef: "prov-r2", sourceBasisRef: "basis-r2",
      citedCurrentness: "CURRENT", applicability: `applies only to ${objectId}`, limitations: "descriptive context only", ...extra,
    });
    recordProcessSystemContext(r2, actor, { ...bound2(system.objectId, system.fingerprint), systemRecordId: "sys-rec", purpose: "Feed preparation system", systemFunction: "SEPARATION", systemCategory: "PRIMARY_PROCESS_SYSTEM" });
    const streamContext = recordProcessStreamContext(r2, actor, {
      ...bound2(stream.objectId, stream.fingerprint), streamRecordId: "stream-rec", streamFunction: "FEED",
      fluidObjectId: fluid.objectId, fluidRevisionFingerprint: fluid.fingerprint, citedPhaseClassification: "VAPOR",
      pipingLineObjectId: line.objectId, pipingLineRevisionFingerprint: line.fingerprint,
    });
    recordProcessStreamContext(r2, actor, { ...bound2(stream2.objectId, stream2.fingerprint), streamRecordId: "stream-rec-2", streamFunction: "PRODUCT" });
    const fluidContext = recordProcessFluidContext(r2, actor, { ...bound2(fluid.objectId, fluid.fingerprint), fluidRecordId: "fluid-rec", descriptiveContext: "Supplied hydrocarbon vapor" });
    const phaseContext = recordProcessPhaseContext(r2, actor, { ...bound2(fluid.objectId, fluid.fingerprint), phaseRecordId: "phase-rec", citedPhaseClassification: "VAPOR" });
    const compositionContext = recordProcessSuppliedCompositionContext(r2, actor, { ...bound2(composition.objectId, composition.fingerprint), compositionRecordId: "comp-rec", suppliedStatement: "Supplier stated a liquid mixture" });
    const store = createD6R3Store(r2);
    const bound = (objectId: string, fingerprint: string, extra: Record<string, unknown> = {}) => ({
      contextId: "ctx-1", objectId, objectRevisionFingerprint: fingerprint, citedLifecycleStage: "FEED", provenanceRef: "prov-r3", sourceBasisRef: "basis-r3",
      citedCurrentness: "CURRENT", applicability: `applies only to ${objectId}`, limitations: "supplied value only", ...extra,
    });
    const operatingCase = recordProcessOperatingCaseContext(store, actor, { ...bound(operatingIdentity.objectId, operatingIdentity.fingerprint), caseRecordId: "op-rec", caseName: "Normal operation", caseType: "NORMAL_OPERATION" });
    expect(operatingCase.calculated).toBe(false);
    expect(operatingCase.validatedProcessDesign).toBe(false);
    const designCase = recordProcessDesignCaseContext(store, actor, { ...bound(designIdentity.objectId, designIdentity.fingerprint), caseRecordId: "des-rec", caseName: "Design case", caseType: "DESIGN" });
    expect(designCase.calculated).toBe(false);
    const basis = recordProcessDesignBasisContext(store, actor, {
      ...bound(basisIdentity.objectId, basisIdentity.fingerprint), basisRecordId: "basis-rec", basisStatement: "Design basis supplied by the process basis document",
      sourceDocumentRef: "PDB-001-A", operatingCaseRecordId: operatingCase.caseRecordId, operatingCaseFingerprint: operatingCase.fingerprint,
      designCaseRecordId: designCase.caseRecordId, designCaseFingerprint: designCase.fingerprint, assumptionStatement: "Continuous operation was explicitly stated",
    });
    expect(basis.validatedProcessDesign).toBe(false);
    expect(basis.codeConformance).toBe(false);
    expect(basis.operatingCaseFingerprint).toBe(operatingCase.fingerprint);
    const operating = recordProcessOperatingCondition(store, actor, {
      ...bound(stream.objectId, stream.fingerprint), conditionId: "op-cond", caseRecordId: operatingCase.caseRecordId, caseContextFingerprint: operatingCase.fingerprint,
      quantityKind: "PRESSURE", conditionRole: "NORMAL", value: "150", unit: "kPa",
      r2StreamRecordId: streamContext.streamRecordId, r2StreamFingerprint: streamContext.fingerprint,
      fluidRecordId: fluidContext.fluidRecordId, fluidRecordFingerprint: fluidContext.fingerprint,
      pipingLineObjectId: line.objectId, pipingLineRevisionFingerprint: line.fingerprint,
    });
    expect(operating.disposition).toBe("SUPPLIED");
    expect(operating.conditionClass).toBe("OPERATING");
    expect(operating.measure).toEqual({ value: "150", unit: "kPa" });
    expect(operating.calculated).toBe(false);
    expect(operating.pipingDesignCondition).toBe(false);
    expect(operating.adoptedPipingDesignCondition).toBe(false);
    expect(operating.pipingLineRevisionFingerprint).toBe(line.fingerprint);
    expect(operating.relationshipBasis).toBe("EXPLICIT");
    expect(recordProcessOperatingCondition(store, actor, {
      ...bound(stream.objectId, stream.fingerprint), conditionId: "op-cond", caseRecordId: operatingCase.caseRecordId, caseContextFingerprint: operatingCase.fingerprint,
      quantityKind: "PRESSURE", conditionRole: "NORMAL", value: "150", unit: "kPa",
      r2StreamRecordId: streamContext.streamRecordId, r2StreamFingerprint: streamContext.fingerprint,
      fluidRecordId: fluidContext.fluidRecordId, fluidRecordFingerprint: fluidContext.fingerprint,
      pipingLineObjectId: line.objectId, pipingLineRevisionFingerprint: line.fingerprint,
    })).toBe(operating);
    const designCondition = recordProcessDesignCondition(store, actor, {
      ...bound(stream.objectId, stream.fingerprint), conditionId: "des-cond", caseRecordId: designCase.caseRecordId, caseContextFingerprint: designCase.fingerprint,
      quantityKind: "PRESSURE", conditionRole: "MAXIMUM", value: "500", unit: "kPa",
      r2StreamRecordId: streamContext.streamRecordId, r2StreamFingerprint: streamContext.fingerprint,
      operatingConditionRecordId: operating.conditionId,
    });
    expect(designCondition.conditionClass).toBe("DESIGN");
    expect(designCondition.disposition).toBe("SUPPLIED");
    expect(designCondition.measure.value).toBe("500");
    expect(designCondition.sourceOperatingConditionId).toBe(operating.conditionId);
    expect(designCondition.pipingDesignCondition).toBe(false);
    const adopted = recordAdoptedProcessCondition(store, actor, {
      ...bound(stream.objectId, stream.fingerprint), conditionId: "adopted-cond", suppliedConditionId: operating.conditionId, value: "150", unit: "kPa",
    });
    expect(adopted.disposition).toBe("ADOPTED");
    expect(adopted.conditionClass).toBe("OPERATING");
    expect(adopted.suppliedConditionFingerprint).toBe(operating.fingerprint);
    expect(store.conditions.find((row) => row.conditionId === operating.conditionId)?.recordStatus).toBe("CURRENT");
    expect(store.conditions.find((row) => row.conditionId === operating.conditionId)?.measure).toEqual(operating.measure);
    const phaseCondition = recordProcessOperatingCondition(store, actor, {
      ...bound(stream.objectId, stream.fingerprint), conditionId: "phase-cond", caseRecordId: operatingCase.caseRecordId, caseContextFingerprint: operatingCase.fingerprint,
      quantityKind: "PHASE", conditionRole: "NORMAL", value: "VAPOR", unit: "phase",
      r2StreamRecordId: streamContext.streamRecordId, r2StreamFingerprint: streamContext.fingerprint,
      phaseRecordId: phaseContext.phaseRecordId, phaseRecordFingerprint: phaseContext.fingerprint,
      compositionRecordId: compositionContext.compositionRecordId, compositionRecordFingerprint: compositionContext.fingerprint,
    });
    expect(phaseCondition.calculated).toBe(false);
    expect(phaseCondition.compositionRecordFingerprint).toBe(compositionContext.fingerprint);
    const property = recordProcessSuppliedProperty(store, actor, {
      ...bound(stream.objectId, stream.fingerprint), propertyRecordId: "prop-1", propertyKind: "DENSITY", value: "2.4", unit: "kg/m3",
      r2StreamRecordId: streamContext.streamRecordId, r2StreamFingerprint: streamContext.fingerprint,
    });
    expect(property.validatedPropertyModel).toBe(false);
    expect(property.calculated).toBe(false);
    expect(store.conditions.filter((row) => row.objectId === stream2.objectId)).toEqual([]);
    const replaced = identity("op-2", "PROCESS_OPERATING_CASE", { predecessorObjectId: operatingIdentity.objectId });
    const nextCase = recordProcessOperatingCaseContext(store, actor, {
      ...bound(replaced.objectId, replaced.fingerprint), caseRecordId: "op-rec-2", caseName: "Revised normal operation", caseType: "NORMAL_OPERATION", predecessorCaseRecordId: operatingCase.caseRecordId,
    });
    expect(nextCase.predecessorCaseRecordId).toBe(operatingCase.caseRecordId);
    expect(store.operatingCases.find((row) => row.caseRecordId === operatingCase.caseRecordId)?.fingerprint).toBe(operatingCase.fingerprint);
    expect(store.operatingCases.find((row) => row.caseRecordId === operatingCase.caseRecordId)?.recordStatus).toBe("SUPERSEDED");

    const reject = (run: () => void) => expect(run).toThrow(/D6_R3_/);
    const streamBound = { ...bound(stream.objectId, stream.fingerprint), r2StreamRecordId: streamContext.streamRecordId, r2StreamFingerprint: streamContext.fingerprint };
    reject(() => recordProcessOperatingCondition(store, actor, { ...streamBound, conditionId: "bad-missing", caseRecordId: operatingCase.caseRecordId, caseContextFingerprint: operatingCase.fingerprint, quantityKind: "PRESSURE", conditionRole: "NORMAL", value: "", unit: "kPa" }));
    reject(() => recordProcessOperatingCondition(store, actor, { ...streamBound, conditionId: "bad-derive", caseRecordId: operatingCase.caseRecordId, caseContextFingerprint: operatingCase.fingerprint, quantityKind: "PRESSURE", conditionRole: "NORMAL", value: "150", unit: "kPa", deriveMissing: true }));
    reject(() => recordProcessOperatingCondition(store, actor, { ...streamBound, conditionId: "bad-interp", caseRecordId: operatingCase.caseRecordId, caseContextFingerprint: operatingCase.fingerprint, quantityKind: "TEMPERATURE", conditionRole: "NORMAL", value: "40", unit: "degC", interpolate: true }));
    reject(() => recordProcessOperatingCondition(store, actor, { ...streamBound, conditionId: "bad-est", caseRecordId: operatingCase.caseRecordId, caseContextFingerprint: operatingCase.fingerprint, quantityKind: "FLOW", conditionRole: "NORMAL", value: "10", unit: "kg/h", estimate: true }));
    reject(() => recordProcessOperatingCondition(store, actor, { ...streamBound, conditionId: "bad-norm", caseRecordId: operatingCase.caseRecordId, caseContextFingerprint: operatingCase.fingerprint, quantityKind: "PRESSURE", conditionRole: "MINIMUM", value: "100", unit: "kPa", normalizeToTruth: true }));
    reject(() => recordProcessOperatingCondition(store, actor, { ...streamBound, conditionId: "bad-unit", caseRecordId: operatingCase.caseRecordId, caseContextFingerprint: operatingCase.fingerprint, quantityKind: "PRESSURE", conditionRole: "MINIMUM", value: "100", unit: "kPa", normalizedUnit: "bar" }));
    reject(() => recordProcessOperatingCondition(store, actor, { ...streamBound, conditionId: "bad-adopt", caseRecordId: operatingCase.caseRecordId, caseContextFingerprint: operatingCase.fingerprint, quantityKind: "PRESSURE", conditionRole: "MINIMUM", value: "100", unit: "kPa", autoAdopt: true }));
    reject(() => recordProcessDesignCondition(store, actor, { ...streamBound, conditionId: "bad-promote", caseRecordId: designCase.caseRecordId, caseContextFingerprint: designCase.fingerprint, quantityKind: "PRESSURE", conditionRole: "MAXIMUM", value: "150", unit: "kPa", autoPromote: true }));
    reject(() => recordProcessDesignCondition(store, actor, { ...streamBound, conditionId: "bad-copy", caseRecordId: designCase.caseRecordId, caseContextFingerprint: designCase.fingerprint, quantityKind: "PRESSURE", conditionRole: "MAXIMUM", operatingConditionRecordId: operating.conditionId }));
    reject(() => recordProcessOperatingCondition(store, actor, { ...streamBound, conditionId: "bad-rel", caseRecordId: operatingCase.caseRecordId, caseContextFingerprint: operatingCase.fingerprint, quantityKind: "PRESSURE", conditionRole: "NORMAL", value: "140", unit: "kPa", relationshipBasis: "SIMILAR_VALUE" }));
    reject(() => recordProcessOperatingCondition(store, actor, { ...streamBound, conditionId: "bad-role", caseRecordId: operatingCase.caseRecordId, caseContextFingerprint: operatingCase.fingerprint, quantityKind: "PRESSURE", conditionRole: "AUTO_MAX", value: "140", unit: "kPa" }));
    reject(() => recordProcessOperatingCondition(store, actor, { ...streamBound, conditionId: "bad-line", caseRecordId: operatingCase.caseRecordId, caseContextFingerprint: operatingCase.fingerprint, quantityKind: "PRESSURE", conditionRole: "STARTUP", value: "140", unit: "kPa", pipingLineObjectId: "missing-line", pipingLineRevisionFingerprint: "missing" }));
    reject(() => recordProcessOperatingCondition(store, actor, { ...streamBound, conditionId: "bad-d5", caseRecordId: operatingCase.caseRecordId, caseContextFingerprint: operatingCase.fingerprint, quantityKind: "PRESSURE", conditionRole: "STARTUP", value: "140", unit: "kPa", writeD5DesignCondition: true }));
    reject(() => recordProcessOperatingCondition(store, actor, { ...streamBound, conditionId: "bad-rev", caseRecordId: operatingCase.caseRecordId, caseContextFingerprint: operatingCase.fingerprint, quantityKind: "PRESSURE", conditionRole: "SHUTDOWN", value: "90", unit: "kPa", objectRevisionFingerprint: "latest" }));
    reject(() => recordProcessOperatingCondition(store, actor, { ...streamBound, conditionId: "bad-dup", caseRecordId: operatingCase.caseRecordId, caseContextFingerprint: operatingCase.fingerprint, quantityKind: "PRESSURE", conditionRole: "NORMAL", value: "150", unit: "kPa" }));
    reject(() => recordProcessOperatingCondition(store, actor, { ...streamBound, conditionId: "bad-balance", caseRecordId: operatingCase.caseRecordId, caseContextFingerprint: operatingCase.fingerprint, quantityKind: "FLOW", conditionRole: "NORMAL", value: "12", unit: "kg/h", massBalance: true }));
    reject(() => recordProcessOperatingCondition(store, actor, { ...streamBound, conditionId: "bad-hyd", caseRecordId: operatingCase.caseRecordId, caseContextFingerprint: operatingCase.fingerprint, quantityKind: "PRESSURE", conditionRole: "UPSET", value: "180", unit: "kPa", hydraulic: true }));
    reject(() => recordProcessOperatingCondition(store, actor, { ...streamBound, conditionId: "bad-thermo", caseRecordId: operatingCase.caseRecordId, caseContextFingerprint: operatingCase.fingerprint, quantityKind: "TEMPERATURE", conditionRole: "NORMAL", value: "40", unit: "degC", thermodynamic: true }));
    reject(() => recordProcessOperatingCondition(store, actor, { ...streamBound, conditionId: "bad-eq", caseRecordId: operatingCase.caseRecordId, caseContextFingerprint: operatingCase.fingerprint, quantityKind: "PHASE", conditionRole: "NORMAL", value: "VAPOR", unit: "phase", phaseEquilibrium: true }));
    reject(() => recordProcessSuppliedProperty(store, actor, { ...streamBound, propertyRecordId: "bad-prop", propertyKind: "DENSITY", value: "2.4", unit: "kg/m3", propertyPackage: true }));
    reject(() => recordProcessOperatingCondition(store, actor, { ...streamBound, conditionId: "bad-duty", caseRecordId: operatingCase.caseRecordId, caseContextFingerprint: operatingCase.fingerprint, quantityKind: "DUTY_CONTEXT", conditionRole: "NORMAL", value: "1", unit: "kW", equipmentDuty: true }));
    reject(() => recordProcessOperatingCondition(store, actor, { ...streamBound, conditionId: "bad-relief", caseRecordId: operatingCase.caseRecordId, caseContextFingerprint: operatingCase.fingerprint, quantityKind: "PRESSURE", conditionRole: "UPSET", value: "200", unit: "kPa", relief: true }));
    reject(() => recordProcessOperatingCondition(store, actor, { ...streamBound, conditionId: "bad-basis", caseRecordId: operatingCase.caseRecordId, caseContextFingerprint: operatingCase.fingerprint, quantityKind: "LEVEL", conditionRole: "NORMAL", value: "50", unit: "percent", sourceBasisRef: " " }));
    reject(() => recordProcessOperatingCondition(store, actor, { ...streamBound, conditionId: "bad-scope", caseRecordId: operatingCase.caseRecordId, caseContextFingerprint: operatingCase.fingerprint, quantityKind: "LEVEL", conditionRole: "NORMAL", value: "50", unit: "percent", tenantId: "t2" }));
    reject(() => recordProcessOperatingCondition(store, { ...actor, actorId: "AI_1" }, { ...streamBound, conditionId: "bad-ai", caseRecordId: operatingCase.caseRecordId, caseContextFingerprint: operatingCase.fingerprint, quantityKind: "LEVEL", conditionRole: "NORMAL", value: "50", unit: "percent" }));
    reject(() => recordProcessDesignBasisContext(store, { ...actor, authority: "ADMIN" }, { ...bound(basisIdentity.objectId, basisIdentity.fingerprint), basisRecordId: "bad-admin", basisStatement: "invented", sourceDocumentRef: "none" }));
    reject(() => recordProcessOperatingCondition(store, actor, { ...streamBound, conditionId: "bad-fp", caseRecordId: operatingCase.caseRecordId, caseContextFingerprint: operatingCase.fingerprint, quantityKind: "LEVEL", conditionRole: "MAXIMUM", value: "80", unit: "percent", assertedFingerprint: "spoof" }));
    reject(() => recordAdoptedProcessCondition(store, actor, { ...bound(stream.objectId, stream.fingerprint), conditionId: "bad-adopt-unit", suppliedConditionId: operating.conditionId, value: "150", unit: "bar" }));
    reject(() => recordProcessOperatingCondition(store, actor, { ...bound(stream2.objectId, stream2.fingerprint), conditionId: "bad-spread", r2StreamRecordId: "stream-rec-2", caseRecordId: operatingCase.caseRecordId, caseContextFingerprint: operatingCase.fingerprint, quantityKind: "PRESSURE", conditionRole: "NORMAL", value: "150", unit: "kPa", propagate: true }));
    expect(d5.objects).toHaveLength(1);
    expect(mutateProcessCondition).toThrow(/D6_R3_/);
    expect(repointProcessCondition).toThrow(/D6_R3_/);
    expect(deriveProcessCondition).toThrow(/D6_R3_/);
    expect(calculateProcessBalance).toThrow(/D6_R3_/);
    expect(calculateProcessHydraulic).toThrow(/D6_R3_/);
    expect(calculateProcessThermodynamic).toThrow(/D6_R3_/);
    expect(calculateProcessProperty).toThrow(/D6_R3_/);
    expect(recordProcessEquipmentDuty).toThrow(/D6_R3_/);
    expect(recordProcessSafetyRelief).toThrow(/D6_R3_/);
    expect(writePipingDesignConditionFromProcess).toThrow(/D6_R3_/);
    expect(validateProcessEngineering).toThrow(/D6_R3_/);
    const here = dirname(fileURLToPath(import.meta.url));
    const sourceText = readFileSync(join(here, "operating-design-basis-conditions.ts"), "utf8");
    expect(sourceText).not.toMatch(/createHash|from ["']@rtb\/engineering-review["']|CREATE TABLE/);
    expect(scanAnalysisFormulaBypass(join(here, "operating-design-basis-conditions.ts"), sourceText)).toEqual([]);
    const packageJson = JSON.parse(readFileSync(join(here, "../../package.json"), "utf8")) as { dependencies: Record<string, string> };
    expect(Object.keys(packageJson.dependencies).sort()).toEqual(["@rtb/database", "@rtb/platform-commerce", "@rtb/platform-intelligence", "@rtb/platform-kernel", "@rtb/types", "docx", "exceljs", "pptxgenjs", "zod"]);
  });
});
