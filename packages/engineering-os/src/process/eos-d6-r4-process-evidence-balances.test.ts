import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  D6_PROCESS_EVIDENCE_RUNTIME_COUNT as ARCHITECTURE_EVIDENCE_COUNT,
  D6_RUNTIME_COUNT as ARCHITECTURE_D6_RUNTIME_COUNT,
} from "@rtb/types";
import { describe, expect, it } from "vitest";
import { D5_CONTEXT_AUTHORITY, createD5R1Store, recordPipingContext, recordPipingObjectIdentity } from "../piping/identity-foundation";
import { STRUCTURAL_CAPABILITY_MANIFEST } from "../structural-concrete/capability";
import { scanAnalysisFormulaBypass } from "../structural-systems/formula-scan";
import { D6_CONTEXT_AUTHORITY, createD6R1Store, recordProcessContext, recordProcessObjectIdentity } from "./identity-foundation";
import {
  createD6R2Store,
  recordProcessStreamContext,
  recordProcessSystemContext,
} from "./system-stream-service-context";
import {
  D6_PROCESS_EVIDENCE_RUNTIME_COUNT as R3_EVIDENCE_COUNT,
  D6_R4_STARTED,
  D6_RUNTIME_COUNT as R3_RUNTIME_COUNT,
  createD6R3Store,
  recordProcessDesignBasisContext,
  recordProcessDesignCaseContext,
  recordProcessOperatingCaseContext,
  recordProcessOperatingCondition,
} from "./operating-design-basis-conditions";
import {
  ADMIN_CAN_PROMOTE_UNGOVERNED_D6_EVIDENCE_TO_VALIDATED,
  ADMIN_EQUALS_D6_PROCESS_ENGINEERING_AUTHORITY,
  AI_CAN_INVENT_AUTHORITATIVE_D6_PROCESS_EVIDENCE,
  AI_CAN_INVENT_AUTHORITATIVE_D6_PROCESS_RESULT,
  AI_CAN_INVENT_D6_R4_ENGINEERING_ASSUMPTION,
  AI_CAN_SILENTLY_CHANGE_D6_R4_EVIDENCE_UNITS,
  AI_EQUALS_D6_PROCESS_ENGINEERING_AUTHORITY,
  BASISLESS_AUTHORITATIVE_D6_R4_EVIDENCE_AUTO_ACCEPTED,
  CROSS_TENANT_D6_R4_ACCESS_ALLOWED,
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
  D6_DISCIPLINE_INTERFACE_RUNTIME_COUNT,
  D6_ENERGY_BALANCE_CALCULATION_RUNTIME_COUNT,
  D6_ENERGY_BALANCE_EVIDENCE_CONTEXT_IMPLEMENTED,
  D6_EQUIPMENT_DUTY_CALCULATION_RUNTIME_COUNT,
  D6_EQUIPMENT_DUTY_RUNTIME_COUNT,
  D6_EXTERNAL_PROCESS_CALCULATION_EVIDENCE_SUPPORTED,
  D6_HYDRAULIC_CALCULATION_RUNTIME_COUNT,
  D6_HYDRAULIC_EVIDENCE_CONTEXT_IMPLEMENTED,
  D6_MASS_BALANCE_CALCULATION_RUNTIME_COUNT,
  D6_MASS_BALANCE_EVIDENCE_CONTEXT_IMPLEMENTED,
  D6_PRESSURE_DROP_CALCULATION_RUNTIME_COUNT,
  D6_PRESSURE_DROP_EVIDENCE_CONTEXT_IMPLEMENTED,
  D6_PROCESS_CALCULATION_RUNTIME_COUNT,
  D6_PROCESS_EVIDENCE_RUNTIME_COUNT,
  D6_PROCESS_EVIDENCE_RUNTIME_IMPLEMENTED,
  D6_PROCESS_EVIDENCE_RUNTIME_READY,
  D6_PROCESS_IDENTITY_RUNTIME_READY,
  D6_PROCESS_SAFETY_RELIEF_RUNTIME_COUNT,
  D6_R1_IDENTITY_REUSED,
  D6_R2_SYSTEM_STREAM_SERVICE_CONTEXT_REUSED,
  D6_R3_DESIGN_BASIS_CONDITION_CONTEXT_REUSED,
  D6_R4_ADJUSTS_EVIDENCE_TO_FORCE_BALANCE,
  D6_R4_APPLICABILITY_EXPLICIT,
  D6_R4_AUTO_CLOSES_ENERGY_BALANCE,
  D6_R4_AUTO_CLOSES_MASS_BALANCE,
  D6_R4_AUTO_MUTATES_R3_DESIGN_BASIS,
  D6_R4_AUTO_MUTATES_R3_DESIGN_CONDITION,
  D6_R4_AUTO_MUTATES_R3_OPERATING_CONDITION,
  D6_R4_AUTO_REPOINTED,
  D6_R4_AUTO_REPOINTS_R3_CASE,
  D6_R4_DERIVES_MISSING_FLOW,
  D6_R4_DERIVES_MISSING_PRESSURE,
  D6_R4_DERIVES_MISSING_PROPERTY,
  D6_R4_DERIVES_MISSING_TEMPERATURE,
  D6_R4_DUPLICATE_GOVERNANCE_IMPLEMENTED,
  D6_R4_EVIDENCE_ASSUMPTIONS_EXPLICIT,
  D6_R4_EVIDENCE_INPUT_BASIS_TRACEABLE,
  D6_R4_EVIDENCE_QUALITY_CONTEXT_SUPPORTED,
  D6_R4_EVIDENCE_UNITS_PRESERVED,
  D6_R4_EVIDENCE_UNITS_REQUIRED,
  D6_R4_HIDDEN_CALCULATION_ALLOWED,
  D6_R4_HISTORY_PRESERVED,
  D6_R4_INPUT_VALUES_EXPLICIT,
  D6_R4_LIMITATIONS_EXPLICIT,
  D6_R4_NORMALIZES_COMPOSITION_TO_ENGINEERING_TRUTH,
  D6_R4_PROVENANCE_PRESERVED,
  D6_R4_PROVENANCE_REQUIRED,
  D6_R4_REPLAY_PROTECTION_IMPLEMENTED,
  D6_R4_RESULT_VALUES_EXPLICIT,
  D6_R4_SOURCE_AUTO_REPOINTED,
  D6_R4_SOURCE_BASIS_REQUIRED,
  D6_R4_SOURCE_BASIS_TRACEABLE,
  D6_R4_SOURCE_MODEL_REVISION_TRACEABLE,
  D6_R4_SOURCE_TOOL_TRACEABLE,
  D6_R4_SPOOFING_PROTECTION_IMPLEMENTED,
  D6_R4_TRANSFERS_D5_AUTHORITY,
  D6_R4_VALIDATES_D5_PIPING_ENGINEERING,
  D6_R5_STARTED,
  D6_RELIEF_CALCULATION_RUNTIME_COUNT,
  D6_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_COUNT,
  D6_REUSES_CANONICAL_CURRENTNESS,
  D6_REUSES_CANONICAL_DIGITAL_THREAD,
  D6_REUSES_CANONICAL_FINGERPRINT,
  D6_REVIEW_VALIDATION_RUNTIME_COUNT,
  D6_RUNTIME_COUNT,
  D6_RUNTIME_STARTED,
  D6_SYSTEM_STREAM_SERVICE_RUNTIME_READY,
  D6_THERMODYNAMIC_PROPERTY_EVIDENCE_CONTEXT_IMPLEMENTED,
  D6_UTILITY_CALCULATION_RUNTIME_COUNT,
  D7_RUNTIME_STARTED,
  D8_RUNTIME_STARTED,
  D9_RUNTIME_COUNT,
  D9_RUNTIME_STARTED,
  DATABASE_SCHEMA_CHANGED,
  ENERGY_BALANCE_EVIDENCE_AUTO_PROMOTED_TO_VALIDATED,
  ENERGY_BALANCE_EVIDENCE_EQUALS_ENERGY_BALANCE_CALCULATED_BY_EOS,
  ENERGY_BALANCE_EVIDENCE_EQUALS_VALIDATED_PROCESS_DESIGN,
  EVIDENCE_QUALITY_CONTEXT_EQUALS_ENGINEERING_ACCEPTANCE,
  EXACT_D6_R1_R3_REFERENCE_REQUIRED,
  EXACT_D6_R3_CASE_REVISION_REQUIRED_FOR_R4_EVIDENCE,
  EXACT_D6_R3_CONDITION_REVISION_REQUIRED_WHEN_REFERENCED,
  EXTERNAL_PROCESS_EVIDENCE_EQUALS_EOS_VALIDATION,
  EXTERNAL_TOOL_RESULT_EQUALS_PROCESS_APPROVAL,
  EXTERNAL_TOOL_RESULT_EQUALS_PROCESS_CONFORMANCE,
  FLOATING_D6_R4_SOURCE_REFERENCE_ALLOWED,
  HYDRAULIC_EVIDENCE_AUTO_PROMOTED_TO_VALIDATED,
  HYDRAULIC_EVIDENCE_EQUALS_HYDRAULIC_CALCULATION_BY_EOS,
  HYDRAULIC_EVIDENCE_EQUALS_PIPING_LINE_SIZING_VALIDATED,
  HYDRAULIC_EVIDENCE_EQUALS_VALIDATED_PROCESS_DESIGN,
  MASS_BALANCE_EVIDENCE_AUTO_PROMOTED_TO_VALIDATED,
  MASS_BALANCE_EVIDENCE_EQUALS_CODE_CONFORMANCE,
  MASS_BALANCE_EVIDENCE_EQUALS_MASS_BALANCE_CALCULATED_BY_EOS,
  MASS_BALANCE_EVIDENCE_EQUALS_VALIDATED_PROCESS_DESIGN,
  NEW_DEPENDENCY_ADDED,
  PARALLEL_D6_CURRENTNESS_ENGINE_CREATED,
  PARALLEL_D6_DIGITAL_THREAD_CREATED,
  PHASE_EQUILIBRIUM_EVIDENCE_EQUALS_EOS_PHASE_CALCULATION,
  PRESSURE_DROP_EVIDENCE_EQUALS_PIPING_DESIGN_CONFORMANT,
  PRESSURE_DROP_EVIDENCE_EQUALS_PIPING_DESIGN_VALIDATED,
  PRESSURE_DROP_EVIDENCE_EQUALS_PRESSURE_DROP_CALCULATED_BY_EOS,
  PROCESS_INPUT_VALUE_EQUALS_PROCESS_RESULT_VALUE,
  PROPERTY_EVIDENCE_EQUALS_VALIDATED_PROPERTY_MODEL,
  SECOND_D6_FINGERPRINT_ALGORITHM_CREATED,
  SILENT_D6_R4_MUTATION_ALLOWED,
  SUPPLIED_RESULT_EQUALS_ADOPTED_PROCESS_CONDITION,
  TENANT_WORKSPACE_PROJECT_D6_R4_SCOPE_ENFORCED,
  THERMODYNAMIC_EVIDENCE_AUTO_PROMOTED_TO_VALIDATED,
  THERMODYNAMIC_EVIDENCE_EQUALS_THERMODYNAMIC_CALCULATION_BY_EOS,
  adoptEvidenceResultAsCondition,
  calculateEnergyBalance,
  calculateMassBalance,
  calculateProcessHydraulic,
  calculateProcessProperty,
  closeEnergyBalance,
  closeMassBalance,
  createD6R4Store,
  deriveMissingProcessValue,
  mutateR3ConditionFromEvidence,
  recordProcessCalculationEvidence,
  recordProcessEquipmentDuty,
  recordProcessSafetyRelief,
  transferPipingAuthorityFromEvidence,
  validateProcessEvidence,
} from "./process-evidence-balances";

describe("EOS-D6-R4 process evidence and balances", () => {
  it("records supplied calculation evidence without calculating or rewriting conditions", () => {
    expect(D6_RUNTIME_STARTED).toBe(true);
    expect(D6_RUNTIME_COUNT).toBe(4);
    expect(R3_RUNTIME_COUNT).toBe(3);
    expect(ARCHITECTURE_D6_RUNTIME_COUNT).toBe(0);
    expect(D6_PROCESS_EVIDENCE_RUNTIME_IMPLEMENTED).toBe(true);
    expect(D6_PROCESS_EVIDENCE_RUNTIME_COUNT).toBe(1);
    expect(R3_EVIDENCE_COUNT).toBe(0);
    expect(ARCHITECTURE_EVIDENCE_COUNT).toBe(0);
    expect(D6_PROCESS_EVIDENCE_RUNTIME_READY).toBe(true);
    expect(D6_R4_STARTED).toBe(false);
    expect(D6_R5_STARTED).toBe(false);
    expect(D6_R1_IDENTITY_REUSED).toBe(true);
    expect(D6_R2_SYSTEM_STREAM_SERVICE_CONTEXT_REUSED).toBe(true);
    expect(D6_R3_DESIGN_BASIS_CONDITION_CONTEXT_REUSED).toBe(true);
    expect(D6_PROCESS_IDENTITY_RUNTIME_READY).toBe(true);
    expect(D6_SYSTEM_STREAM_SERVICE_RUNTIME_READY).toBe(true);
    expect(D6_DESIGN_BASIS_CONDITION_RUNTIME_READY).toBe(true);
    expect(EXACT_D6_R1_R3_REFERENCE_REQUIRED).toBe(true);
    expect(FLOATING_D6_R4_SOURCE_REFERENCE_ALLOWED).toBe(false);
    expect(D6_R4_SOURCE_AUTO_REPOINTED).toBe(false);
    expect(D6_EXTERNAL_PROCESS_CALCULATION_EVIDENCE_SUPPORTED).toBe(true);
    expect(D6_MASS_BALANCE_EVIDENCE_CONTEXT_IMPLEMENTED).toBe(true);
    expect(MASS_BALANCE_EVIDENCE_EQUALS_MASS_BALANCE_CALCULATED_BY_EOS).toBe(false);
    expect(MASS_BALANCE_EVIDENCE_EQUALS_VALIDATED_PROCESS_DESIGN).toBe(false);
    expect(MASS_BALANCE_EVIDENCE_EQUALS_CODE_CONFORMANCE).toBe(false);
    expect(D6_ENERGY_BALANCE_EVIDENCE_CONTEXT_IMPLEMENTED).toBe(true);
    expect(ENERGY_BALANCE_EVIDENCE_EQUALS_ENERGY_BALANCE_CALCULATED_BY_EOS).toBe(false);
    expect(ENERGY_BALANCE_EVIDENCE_EQUALS_VALIDATED_PROCESS_DESIGN).toBe(false);
    expect(D6_HYDRAULIC_EVIDENCE_CONTEXT_IMPLEMENTED).toBe(true);
    expect(HYDRAULIC_EVIDENCE_EQUALS_HYDRAULIC_CALCULATION_BY_EOS).toBe(false);
    expect(HYDRAULIC_EVIDENCE_EQUALS_VALIDATED_PROCESS_DESIGN).toBe(false);
    expect(HYDRAULIC_EVIDENCE_EQUALS_PIPING_LINE_SIZING_VALIDATED).toBe(false);
    expect(D6_PRESSURE_DROP_EVIDENCE_CONTEXT_IMPLEMENTED).toBe(true);
    expect(PRESSURE_DROP_EVIDENCE_EQUALS_PRESSURE_DROP_CALCULATED_BY_EOS).toBe(false);
    expect(PRESSURE_DROP_EVIDENCE_EQUALS_PIPING_DESIGN_VALIDATED).toBe(false);
    expect(PRESSURE_DROP_EVIDENCE_EQUALS_PIPING_DESIGN_CONFORMANT).toBe(false);
    expect(D6_THERMODYNAMIC_PROPERTY_EVIDENCE_CONTEXT_IMPLEMENTED).toBe(true);
    expect(THERMODYNAMIC_EVIDENCE_EQUALS_THERMODYNAMIC_CALCULATION_BY_EOS).toBe(false);
    expect(PROPERTY_EVIDENCE_EQUALS_VALIDATED_PROPERTY_MODEL).toBe(false);
    expect(PHASE_EQUILIBRIUM_EVIDENCE_EQUALS_EOS_PHASE_CALCULATION).toBe(false);
    expect(EXACT_D6_R3_CASE_REVISION_REQUIRED_FOR_R4_EVIDENCE).toBe(true);
    expect(EXACT_D6_R3_CONDITION_REVISION_REQUIRED_WHEN_REFERENCED).toBe(true);
    expect(D6_R4_INPUT_VALUES_EXPLICIT).toBe(true);
    expect(D6_R4_RESULT_VALUES_EXPLICIT).toBe(true);
    expect(PROCESS_INPUT_VALUE_EQUALS_PROCESS_RESULT_VALUE).toBe(false);
    expect(SUPPLIED_RESULT_EQUALS_ADOPTED_PROCESS_CONDITION).toBe(false);
    expect(D6_R4_AUTO_MUTATES_R3_OPERATING_CONDITION).toBe(false);
    expect(D6_R4_AUTO_MUTATES_R3_DESIGN_CONDITION).toBe(false);
    expect(D6_R4_AUTO_MUTATES_R3_DESIGN_BASIS).toBe(false);
    expect(D6_R4_AUTO_REPOINTS_R3_CASE).toBe(false);
    expect(D6_R4_EVIDENCE_UNITS_REQUIRED).toBe(true);
    expect(D6_R4_EVIDENCE_UNITS_PRESERVED).toBe(true);
    expect(AI_CAN_SILENTLY_CHANGE_D6_R4_EVIDENCE_UNITS).toBe(false);
    expect(D6_R4_EVIDENCE_ASSUMPTIONS_EXPLICIT).toBe(true);
    expect(D6_R4_EVIDENCE_INPUT_BASIS_TRACEABLE).toBe(true);
    expect(AI_CAN_INVENT_D6_R4_ENGINEERING_ASSUMPTION).toBe(false);
    expect(D6_R4_SOURCE_TOOL_TRACEABLE).toBe(true);
    expect(D6_R4_SOURCE_MODEL_REVISION_TRACEABLE).toBe(true);
    expect(EXTERNAL_PROCESS_EVIDENCE_EQUALS_EOS_VALIDATION).toBe(false);
    expect(EXTERNAL_TOOL_RESULT_EQUALS_PROCESS_CONFORMANCE).toBe(false);
    expect(EXTERNAL_TOOL_RESULT_EQUALS_PROCESS_APPROVAL).toBe(false);
    expect(D6_R4_HIDDEN_CALCULATION_ALLOWED).toBe(false);
    expect(D6_R4_AUTO_CLOSES_MASS_BALANCE).toBe(false);
    expect(D6_R4_AUTO_CLOSES_ENERGY_BALANCE).toBe(false);
    expect(D6_R4_ADJUSTS_EVIDENCE_TO_FORCE_BALANCE).toBe(false);
    expect(D6_R4_NORMALIZES_COMPOSITION_TO_ENGINEERING_TRUTH).toBe(false);
    expect(D6_R4_DERIVES_MISSING_FLOW).toBe(false);
    expect(D6_R4_DERIVES_MISSING_PROPERTY).toBe(false);
    expect(D6_R4_DERIVES_MISSING_PRESSURE).toBe(false);
    expect(D6_R4_DERIVES_MISSING_TEMPERATURE).toBe(false);
    expect(D6_R4_EVIDENCE_QUALITY_CONTEXT_SUPPORTED).toBe(true);
    expect(D6_R4_LIMITATIONS_EXPLICIT).toBe(true);
    expect(D6_R4_APPLICABILITY_EXPLICIT).toBe(true);
    expect(EVIDENCE_QUALITY_CONTEXT_EQUALS_ENGINEERING_ACCEPTANCE).toBe(false);
    expect(MASS_BALANCE_EVIDENCE_AUTO_PROMOTED_TO_VALIDATED).toBe(false);
    expect(ENERGY_BALANCE_EVIDENCE_AUTO_PROMOTED_TO_VALIDATED).toBe(false);
    expect(HYDRAULIC_EVIDENCE_AUTO_PROMOTED_TO_VALIDATED).toBe(false);
    expect(THERMODYNAMIC_EVIDENCE_AUTO_PROMOTED_TO_VALIDATED).toBe(false);
    expect(D6_R4_VALIDATES_D5_PIPING_ENGINEERING).toBe(false);
    expect(D6_R4_TRANSFERS_D5_AUTHORITY).toBe(false);
    expect(D6_R4_SOURCE_BASIS_REQUIRED).toBe(true);
    expect(D6_R4_SOURCE_BASIS_TRACEABLE).toBe(true);
    expect(BASISLESS_AUTHORITATIVE_D6_R4_EVIDENCE_AUTO_ACCEPTED).toBe(false);
    expect(D6_REUSES_CANONICAL_CURRENTNESS).toBe(true);
    expect(D6_REUSES_CANONICAL_DIGITAL_THREAD).toBe(true);
    expect(D6_REUSES_CANONICAL_FINGERPRINT).toBe(true);
    expect(PARALLEL_D6_CURRENTNESS_ENGINE_CREATED).toBe(false);
    expect(PARALLEL_D6_DIGITAL_THREAD_CREATED).toBe(false);
    expect(SECOND_D6_FINGERPRINT_ALGORITHM_CREATED).toBe(false);
    expect(D6_R4_HISTORY_PRESERVED).toBe(true);
    expect(D6_R4_AUTO_REPOINTED).toBe(false);
    expect(SILENT_D6_R4_MUTATION_ALLOWED).toBe(false);
    expect(D6_R4_PROVENANCE_REQUIRED).toBe(true);
    expect(D6_R4_PROVENANCE_PRESERVED).toBe(true);
    expect(TENANT_WORKSPACE_PROJECT_D6_R4_SCOPE_ENFORCED).toBe(true);
    expect(CROSS_TENANT_D6_R4_ACCESS_ALLOWED).toBe(false);
    expect(AI_EQUALS_D6_PROCESS_ENGINEERING_AUTHORITY).toBe(false);
    expect(ADMIN_EQUALS_D6_PROCESS_ENGINEERING_AUTHORITY).toBe(false);
    expect(AI_CAN_INVENT_AUTHORITATIVE_D6_PROCESS_EVIDENCE).toBe(false);
    expect(AI_CAN_INVENT_AUTHORITATIVE_D6_PROCESS_RESULT).toBe(false);
    expect(ADMIN_CAN_PROMOTE_UNGOVERNED_D6_EVIDENCE_TO_VALIDATED).toBe(false);
    expect(D6_R4_DUPLICATE_GOVERNANCE_IMPLEMENTED).toBe(true);
    expect(D6_R4_REPLAY_PROTECTION_IMPLEMENTED).toBe(true);
    expect(D6_R4_SPOOFING_PROTECTION_IMPLEMENTED).toBe(true);
    expect([
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
    ]).toEqual(Array(27).fill(0));
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
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D6.R4.PROCESS_EVIDENCE_AND_BALANCES")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D6.R5.EQUIPMENT_DUTY_AND_UTILITY_CONTEXT")?.implementationState).toBe("IMPLEMENTED_BOUNDED");

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
    const evidenceIdentity = identity("ev-1", "PROCESS_CALCULATION_EVIDENCE");
    const d5 = createD5R1Store();
    const piping = { actorId: "piping-recorder", tenantId: "t1", workspaceId: "w1", projectId: "p1", authority: D5_CONTEXT_AUTHORITY };
    recordPipingContext(d5, piping, { contextId: "d5-ctx", citedLifecycleStage: "FEED", provenanceRef: "d5-prov" });
    const line = recordPipingObjectIdentity(d5, piping, { objectId: "line-1", contextId: "d5-ctx", objectType: "PIPING_LINE", citedLifecycleStage: "FEED", provenanceRef: "d5-line" });
    const r2 = createD6R2Store(r1, d5);
    const bound2 = (objectId: string, fingerprint: string, extra: Record<string, unknown> = {}) => ({
      contextId: "ctx-1", objectId, objectRevisionFingerprint: fingerprint, citedLifecycleStage: "FEED", provenanceRef: "prov-r2", sourceBasisRef: "basis-r2",
      citedCurrentness: "CURRENT", applicability: `applies only to ${objectId}`, limitations: "descriptive context only", ...extra,
    });
    const systemContext = recordProcessSystemContext(r2, actor, { ...bound2(system.objectId, system.fingerprint), systemRecordId: "sys-rec", purpose: "Feed preparation system", systemFunction: "SEPARATION", systemCategory: "PRIMARY_PROCESS_SYSTEM" });
    const streamContext = recordProcessStreamContext(r2, actor, {
      ...bound2(stream.objectId, stream.fingerprint), streamRecordId: "stream-rec", streamFunction: "FEED",
      pipingLineObjectId: line.objectId, pipingLineRevisionFingerprint: line.fingerprint,
    });
    recordProcessStreamContext(r2, actor, { ...bound2(stream2.objectId, stream2.fingerprint), streamRecordId: "stream-rec-2", streamFunction: "PRODUCT" });
    const r3 = createD6R3Store(r2);
    const bound = (objectId: string, fingerprint: string, extra: Record<string, unknown> = {}) => ({
      contextId: "ctx-1", objectId, objectRevisionFingerprint: fingerprint, citedLifecycleStage: "FEED", provenanceRef: "prov-r3", sourceBasisRef: "basis-r3",
      citedCurrentness: "CURRENT", applicability: `applies only to ${objectId}`, limitations: "supplied value only", ...extra,
    });
    const operatingCase = recordProcessOperatingCaseContext(r3, actor, { ...bound(operatingIdentity.objectId, operatingIdentity.fingerprint), caseRecordId: "op-rec", caseName: "Normal operation", caseType: "NORMAL_OPERATION" });
    const designCase = recordProcessDesignCaseContext(r3, actor, { ...bound(designIdentity.objectId, designIdentity.fingerprint), caseRecordId: "des-rec", caseName: "Design case", caseType: "DESIGN" });
    const basis = recordProcessDesignBasisContext(r3, actor, {
      ...bound(basisIdentity.objectId, basisIdentity.fingerprint), basisRecordId: "basis-rec", basisStatement: "Design basis supplied by the process basis document",
      sourceDocumentRef: "PDB-001-A", operatingCaseRecordId: operatingCase.caseRecordId, operatingCaseFingerprint: operatingCase.fingerprint,
      designCaseRecordId: designCase.caseRecordId, designCaseFingerprint: designCase.fingerprint,
    });
    const operating = recordProcessOperatingCondition(r3, actor, {
      ...bound(stream.objectId, stream.fingerprint), conditionId: "op-cond", caseRecordId: operatingCase.caseRecordId, caseContextFingerprint: operatingCase.fingerprint,
      quantityKind: "PRESSURE", conditionRole: "NORMAL", value: "150", unit: "kPa",
      r2StreamRecordId: streamContext.streamRecordId, r2StreamFingerprint: streamContext.fingerprint,
    });
    const before = {
      conditions: JSON.stringify(r3.conditions),
      bases: JSON.stringify(r3.bases),
      cases: JSON.stringify(r3.operatingCases),
      d5: d5.objects.length,
    };
    const store = createD6R4Store(r3);
    const tool = {
      sourceToolName: "SupplierBalance", sourceToolVersion: "4.2", sourceModelRevision: "model-a", sourceReportRef: "HMB-014",
      executionTimestamp: "2026-10-01T08:00:00Z", sourceAuthorityRef: "balance author PE-14",
    };
    const scoped = (evidenceId: string, evidenceObjectId: string, evidenceFingerprint: string) => ({
      contextId: "ctx-1", objectId: evidenceObjectId, objectRevisionFingerprint: evidenceFingerprint,
      subjectObjectId: stream.objectId, subjectRevisionFingerprint: stream.fingerprint,
      evidenceId, citedLifecycleStage: "FEED", provenanceRef: "prov-r4", sourceBasisRef: "basis-r4",
      citedCurrentness: "CURRENT", applicability: `applies only to ${stream.objectId} and ${evidenceObjectId}`, limitations: "supplied external evidence only",
      caseClass: "OPERATING", caseRecordId: operatingCase.caseRecordId, caseContextFingerprint: operatingCase.fingerprint,
      r2StreamRecordId: streamContext.streamRecordId, r2StreamFingerprint: streamContext.fingerprint, ...tool,
    });
    const mass = recordProcessCalculationEvidence(store, actor, {
      ...scoped("mass-1", evidenceIdentity.objectId, evidenceIdentity.fingerprint),
      evidenceClass: "MASS_BALANCE",
      conditionReferences: [{ conditionId: operating.conditionId, fingerprint: operating.fingerprint }],
      designBasisRecordId: basis.basisRecordId, designBasisFingerprint: basis.fingerprint,
      assumptions: ["Steady flow was stated in HMB-014"],
      qualityStatement: "Supplier marked the balance preliminary",
      values: [
        { valueId: "in-1", role: "INPUT", name: "FEED_FLOW", valueKind: "QUANTITY", value: "100", unit: "kg/h", basisRef: "HMB-014-in" },
        { valueId: "in-2", role: "INPUT", name: "RECYCLE_FLOW", valueKind: "QUANTITY", value: "20", unit: "kg/h", basisRef: "HMB-014-in" },
        { valueId: "out-1", role: "RESULT", name: "TOTAL_FLOW", valueKind: "QUANTITY", value: "120", unit: "kg/h", basisRef: "HMB-014-out" },
        { valueId: "out-2", role: "RESULT", name: "BALANCE_RESIDUAL", valueKind: "QUANTITY", value: "0.4", unit: "kg/h", basisRef: "HMB-014-out" },
      ],
    });
    expect(mass.calculatedByEos).toBe(false);
    expect(mass.balanceClosedByEos).toBe(false);
    expect(mass.valuesAdjusted).toBe(false);
    expect(mass.validatedProcessDesign).toBe(false);
    expect(mass.codeConformance).toBe(false);
    expect(mass.eosValidation).toBe(false);
    expect(mass.engineeringAcceptance).toBe(false);
    expect(mass.adoptedConditionCreated).toBe(false);
    expect(mass.inputs.map((row) => row.measure)).toEqual([{ value: "100", unit: "kg/h" }, { value: "20", unit: "kg/h" }]);
    expect(mass.results.find((row) => row.name === "BALANCE_RESIDUAL")?.measure).toEqual({ value: "0.4", unit: "kg/h" });
    expect(mass.conditionReferences).toEqual([{ conditionId: operating.conditionId, fingerprint: operating.fingerprint, conditionClass: "OPERATING" }]);
    expect(mass.caseContextFingerprint).toBe(operatingCase.fingerprint);
    expect(recordProcessCalculationEvidence(store, actor, {
      ...scoped("mass-1", evidenceIdentity.objectId, evidenceIdentity.fingerprint),
      evidenceClass: "MASS_BALANCE",
      conditionReferences: [{ conditionId: operating.conditionId, fingerprint: operating.fingerprint }],
      designBasisRecordId: basis.basisRecordId, designBasisFingerprint: basis.fingerprint,
      assumptions: ["Steady flow was stated in HMB-014"],
      qualityStatement: "Supplier marked the balance preliminary",
      values: [
        { valueId: "in-1", role: "INPUT", name: "FEED_FLOW", valueKind: "QUANTITY", value: "100", unit: "kg/h", basisRef: "HMB-014-in" },
        { valueId: "in-2", role: "INPUT", name: "RECYCLE_FLOW", valueKind: "QUANTITY", value: "20", unit: "kg/h", basisRef: "HMB-014-in" },
        { valueId: "out-1", role: "RESULT", name: "TOTAL_FLOW", valueKind: "QUANTITY", value: "120", unit: "kg/h", basisRef: "HMB-014-out" },
        { valueId: "out-2", role: "RESULT", name: "BALANCE_RESIDUAL", valueKind: "QUANTITY", value: "0.4", unit: "kg/h", basisRef: "HMB-014-out" },
      ],
    })).toBe(mass);
    const energyIdentity = identity("ev-2", "PROCESS_CALCULATION_EVIDENCE");
    const energy = recordProcessCalculationEvidence(store, actor, {
      ...scoped("energy-1", energyIdentity.objectId, energyIdentity.fingerprint),
      evidenceClass: "ENERGY_BALANCE",
      assumptions: ["Enthalpy reference was stated by the supplier"],
      values: [
        { valueId: "ein", role: "INPUT", name: "ENTHALPY_IN", valueKind: "QUANTITY", value: "400", unit: "kJ/kg", basisRef: "EB-2-in" },
        { valueId: "eout", role: "RESULT", name: "DUTY", valueKind: "QUANTITY", value: "1500", unit: "kW", basisRef: "EB-2-out" },
      ],
    });
    expect(energy.evidenceContext).toBe("ENERGY_BALANCE");
    expect(energy.equipmentDutyCreated).toBe(false);
    expect(energy.results[0]?.measure).toEqual({ value: "1500", unit: "kW" });
    const hydraulicIdentity = identity("ev-3", "PROCESS_CALCULATION_EVIDENCE");
    const hydraulic = recordProcessCalculationEvidence(store, actor, {
      ...scoped("hyd-1", hydraulicIdentity.objectId, hydraulicIdentity.fingerprint),
      evidenceClass: "HYDRAULIC",
      assumptions: ["Hydraulic profile was supplied for this stream only"],
      values: [
        { valueId: "hin", role: "INPUT", name: "FLOW", valueKind: "QUANTITY", value: "12", unit: "m3/h", basisRef: "HY-1-in" },
        { valueId: "hout", role: "RESULT", name: "VELOCITY", valueKind: "QUANTITY", value: "2.1", unit: "m/s", basisRef: "HY-1-out" },
      ],
    });
    expect(hydraulic.pipingLineSizingValidated).toBe(false);
    expect(hydraulic.calculatedByEos).toBe(false);
    const dropIdentity = identity("ev-4", "PROCESS_CALCULATION_EVIDENCE");
    const drop = recordProcessCalculationEvidence(store, actor, {
      ...scoped("drop-1", dropIdentity.objectId, dropIdentity.fingerprint),
      evidenceClass: "PRESSURE_DROP",
      pipingLineObjectId: line.objectId, pipingLineRevisionFingerprint: line.fingerprint,
      assumptions: ["Pressure loss was supplied for the cited line revision"],
      values: [
        { valueId: "pin", role: "INPUT", name: "INLET_PRESSURE", valueKind: "QUANTITY", value: "500", unit: "kPa", basisRef: "PD-1-in" },
        { valueId: "pout", role: "RESULT", name: "PRESSURE_LOSS", valueKind: "QUANTITY", value: "35", unit: "kPa", basisRef: "PD-1-out" },
      ],
    });
    expect(drop.pipingLineRevisionFingerprint).toBe(line.fingerprint);
    expect(drop.pipingDesignValidated).toBe(false);
    expect(drop.pipingDesignConformant).toBe(false);
    const propertyIdentity = identity("ev-5", "PROCESS_CALCULATION_EVIDENCE");
    const property = recordProcessCalculationEvidence(store, actor, {
      ...scoped("prop-1", propertyIdentity.objectId, propertyIdentity.fingerprint),
      evidenceClass: "OTHER_PROCESS_CALCULATION", evidenceContext: "THERMODYNAMIC_PROPERTY",
      assumptions: ["Property package result was copied from the supplier file"],
      values: [
        { valueId: "pref", role: "INPUT", name: "PROPERTY_PACKAGE", valueKind: "REFERENCE", value: "PR-78", unit: "identifier", basisRef: "PP-1" },
        { valueId: "pdens", role: "RESULT", name: "DENSITY", valueKind: "QUANTITY", value: "2.4", unit: "kg/m3", basisRef: "PP-1-out" },
        { valueId: "pphase", role: "RESULT", name: "PHASE_EQUILIBRIUM", valueKind: "QUANTITY", value: "VAPOR", unit: "phase", basisRef: "PP-1-out" },
      ],
    });
    expect(property.evidenceContext).toBe("THERMODYNAMIC_PROPERTY");
    expect(property.validatedPropertyModel).toBe(false);
    expect(property.phaseCalculatedByEos).toBe(false);
    expect(property.results.find((row) => row.name === "DENSITY")?.measure.unit).toBe("kg/m3");
    const flowIdentity = identity("ev-6", "PROCESS_CALCULATION_EVIDENCE");
    const flow = recordProcessCalculationEvidence(store, actor, {
      ...scoped("flow-1", flowIdentity.objectId, flowIdentity.fingerprint),
      evidenceClass: "OTHER_PROCESS_CALCULATION", evidenceContext: "FLOW_PROPERTY",
      assumptions: ["Flow result was supplied and not recomputed"],
      values: [
        { valueId: "fin", role: "INPUT", name: "MASS_FLOW", valueKind: "QUANTITY", value: "100", unit: "kg/h", basisRef: "FP-1-in" },
        { valueId: "fout", role: "RESULT", name: "VOLUMETRIC_FLOW", valueKind: "QUANTITY", value: "41.7", unit: "m3/h", basisRef: "FP-1-out" },
      ],
    });
    expect(flow.evidenceContext).toBe("FLOW_PROPERTY");
    expect(flow.calculatedByEos).toBe(false);
    expect(store.evidence.filter((row) => row.subjectObjectId === stream2.objectId)).toEqual([]);
    expect(JSON.stringify(r3.conditions)).toBe(before.conditions);
    expect(JSON.stringify(r3.bases)).toBe(before.bases);
    expect(JSON.stringify(r3.operatingCases)).toBe(before.cases);
    expect(r3.conditions.find((row) => row.conditionId === operating.conditionId)?.measure).toEqual({ value: "150", unit: "kPa" });
    expect(d5.objects).toHaveLength(before.d5);
    const replaced = identity("ev-7", "PROCESS_CALCULATION_EVIDENCE", { predecessorObjectId: evidenceIdentity.objectId });
    const next = recordProcessCalculationEvidence(store, actor, {
      ...scoped("mass-2", replaced.objectId, replaced.fingerprint),
      evidenceClass: "MASS_BALANCE", predecessorEvidenceId: mass.evidenceId,
      assumptions: ["Revised supplier balance for the same case"],
      values: [
        { valueId: "in-1", role: "INPUT", name: "FEED_FLOW", valueKind: "QUANTITY", value: "110", unit: "kg/h", basisRef: "HMB-015-in" },
        { valueId: "out-1", role: "RESULT", name: "TOTAL_FLOW", valueKind: "QUANTITY", value: "110", unit: "kg/h", basisRef: "HMB-015-out" },
      ],
    });
    expect(next.predecessorEvidenceId).toBe(mass.evidenceId);
    expect(store.evidence.find((row) => row.evidenceId === mass.evidenceId)?.fingerprint).toBe(mass.fingerprint);
    expect(store.evidence.find((row) => row.evidenceId === mass.evidenceId)?.recordStatus).toBe("SUPERSEDED");

    const reject = (run: () => void) => expect(run).toThrow(/D6_R4_/);
    const baseReject = { ...scoped("bad", evidenceIdentity.objectId, evidenceIdentity.fingerprint), evidenceClass: "MASS_BALANCE", assumptions: ["Explicit assumption"], values: [
      { valueId: "in-1", role: "INPUT", name: "FEED_FLOW", valueKind: "QUANTITY", value: "90", unit: "kg/h", basisRef: "bad-in" },
      { valueId: "out-1", role: "RESULT", name: "TOTAL_FLOW", valueKind: "QUANTITY", value: "90", unit: "kg/h", basisRef: "bad-out" },
    ] };
    reject(() => recordProcessCalculationEvidence(store, actor, { ...baseReject, evidenceId: "bad-close", closeMassBalance: true }));
    reject(() => recordProcessCalculationEvidence(store, actor, { ...baseReject, evidenceId: "bad-adjust", adjustToForceBalance: true }));
    reject(() => recordProcessCalculationEvidence(store, actor, { ...baseReject, evidenceId: "bad-derive", deriveFlow: true }));
    reject(() => recordProcessCalculationEvidence(store, actor, { ...baseReject, evidenceId: "bad-property", deriveProperty: true }));
    reject(() => recordProcessCalculationEvidence(store, actor, { ...baseReject, evidenceId: "bad-pressure", derivePressure: true }));
    reject(() => recordProcessCalculationEvidence(store, actor, { ...baseReject, evidenceId: "bad-temp", deriveTemperature: true }));
    reject(() => recordProcessCalculationEvidence(store, actor, { ...baseReject, evidenceId: "bad-norm", normalizeComposition: true }));
    reject(() => recordProcessCalculationEvidence(store, actor, { ...baseReject, evidenceId: "bad-hidden", hiddenCalculation: true }));
    reject(() => recordProcessCalculationEvidence(store, actor, { ...baseReject, evidenceId: "bad-calc", calculation: true }));
    reject(() => recordProcessCalculationEvidence(store, actor, { ...baseReject, evidenceId: "bad-thermo", thermodynamicCalculation: true }));
    reject(() => recordProcessCalculationEvidence(store, actor, { ...baseReject, evidenceId: "bad-phase", phaseEquilibriumCalculation: true }));
    reject(() => recordProcessCalculationEvidence(store, actor, { ...baseReject, evidenceId: "bad-package", propertyPackageCalculation: true }));
    reject(() => recordProcessCalculationEvidence(store, actor, { ...baseReject, evidenceId: "bad-copy", copyResultFromInput: true }));
    reject(() => recordProcessCalculationEvidence(store, actor, { ...baseReject, evidenceId: "bad-mutate", mutateOperatingCondition: true }));
    reject(() => recordProcessCalculationEvidence(store, actor, { ...baseReject, evidenceId: "bad-basis-mut", mutateDesignBasis: true }));
    reject(() => recordProcessCalculationEvidence(store, actor, { ...baseReject, evidenceId: "bad-repoint", repointCase: true }));
    reject(() => recordProcessCalculationEvidence(store, actor, { ...baseReject, evidenceId: "bad-adopt", adoptResult: true }));
    reject(() => recordProcessCalculationEvidence(store, actor, { ...baseReject, evidenceId: "bad-promote", autoPromote: true }));
    reject(() => recordProcessCalculationEvidence(store, actor, { ...baseReject, evidenceId: "bad-accept", acceptEvidence: true }));
    reject(() => recordProcessCalculationEvidence(store, actor, { ...baseReject, evidenceId: "bad-tool", toolValidated: true }));
    reject(() => recordProcessCalculationEvidence(store, actor, { ...baseReject, evidenceId: "bad-assume", inventAssumption: true }));
    reject(() => recordProcessCalculationEvidence(store, actor, { ...baseReject, evidenceId: "bad-invent", inventResult: true }));
    reject(() => recordProcessCalculationEvidence(store, actor, { ...baseReject, evidenceId: "bad-unit", normalizedUnit: "lb/h" }));
    reject(() => recordProcessCalculationEvidence(store, actor, { ...baseReject, evidenceId: "bad-relief", evidenceClass: "RELIEF_LOAD" }));
    reject(() => recordProcessCalculationEvidence(store, actor, { ...baseReject, evidenceId: "bad-depress", evidenceClass: "DEPRESSURING" }));
    reject(() => recordProcessCalculationEvidence(store, actor, { ...baseReject, evidenceId: "bad-duty", evidenceClass: "EQUIPMENT_DUTY" }));
    reject(() => recordProcessCalculationEvidence(store, actor, { ...baseReject, evidenceId: "bad-utility", evidenceClass: "UTILITY_CONSUMPTION" }));
    reject(() => recordProcessCalculationEvidence(store, actor, { ...baseReject, evidenceId: "bad-case", caseContextFingerprint: "latest" }));
    reject(() => recordProcessCalculationEvidence(store, actor, { ...baseReject, evidenceId: "bad-cond", conditionReferences: [{ conditionId: operating.conditionId, fingerprint: "spoof" }] }));
    reject(() => recordProcessCalculationEvidence(store, actor, { ...baseReject, evidenceId: "bad-line", pipingLineObjectId: "missing-line", pipingLineRevisionFingerprint: "missing" }));
    reject(() => recordProcessCalculationEvidence(store, actor, { ...baseReject, evidenceId: "bad-piping", validatePiping: true }));
    reject(() => recordProcessCalculationEvidence(store, actor, { ...baseReject, evidenceId: "bad-transfer", transferD5Authority: true }));
    reject(() => recordProcessCalculationEvidence(store, actor, { ...baseReject, evidenceId: "bad-blank-assumption", assumptions: [] }));
    reject(() => recordProcessCalculationEvidence(store, actor, { ...baseReject, evidenceId: "bad-tool-version", sourceToolVersion: " " }));
    reject(() => recordProcessCalculationEvidence(store, actor, { ...baseReject, evidenceId: "bad-basis", sourceBasisRef: " " }));
    reject(() => recordProcessCalculationEvidence(store, actor, { ...baseReject, evidenceId: "bad-scope", tenantId: "t2" }));
    reject(() => recordProcessCalculationEvidence(store, { ...actor, actorId: "AI_1" }, { ...baseReject, evidenceId: "bad-ai" }));
    reject(() => recordProcessCalculationEvidence(store, { ...actor, authority: "ADMIN" }, { ...baseReject, evidenceId: "bad-admin", autoPromote: true }));
    reject(() => recordProcessCalculationEvidence(store, actor, { ...baseReject, evidenceId: "bad-fp", assertedFingerprint: "spoof" }));
    reject(() => recordProcessCalculationEvidence(store, actor, {
      ...scoped("bad-dup", energyIdentity.objectId, energyIdentity.fingerprint),
      evidenceClass: "ENERGY_BALANCE",
      assumptions: ["Another copy of the same supplied duty"],
      values: [
        { valueId: "ein", role: "INPUT", name: "ENTHALPY_IN", valueKind: "QUANTITY", value: "400", unit: "kJ/kg", basisRef: "EB-2-in" },
        { valueId: "eout", role: "RESULT", name: "DUTY", valueKind: "QUANTITY", value: "1500", unit: "kW", basisRef: "EB-2-out" },
      ],
    }));
    expect(JSON.stringify(r3.conditions)).toBe(before.conditions);
    expect(d5.objects).toHaveLength(1);
    expect(r3.conditions).toHaveLength(1);
    expect(calculateMassBalance).toThrow(/D6_R4_/);
    expect(calculateEnergyBalance).toThrow(/D6_R4_/);
    expect(closeMassBalance).toThrow(/D6_R4_/);
    expect(closeEnergyBalance).toThrow(/D6_R4_/);
    expect(deriveMissingProcessValue).toThrow(/D6_R4_/);
    expect(calculateProcessHydraulic).toThrow(/D6_R4_/);
    expect(calculateProcessProperty).toThrow(/D6_R4_/);
    expect(mutateR3ConditionFromEvidence).toThrow(/D6_R4_/);
    expect(adoptEvidenceResultAsCondition).toThrow(/D6_R4_/);
    expect(validateProcessEvidence).toThrow(/D6_R4_/);
    expect(recordProcessEquipmentDuty).toThrow(/D6_R4_/);
    expect(recordProcessSafetyRelief).toThrow(/D6_R4_/);
    expect(transferPipingAuthorityFromEvidence).toThrow(/D6_R4_/);
    const here = dirname(fileURLToPath(import.meta.url));
    const sourceText = readFileSync(join(here, "process-evidence-balances.ts"), "utf8");
    expect(sourceText).not.toMatch(/createHash|from ["']@rtb\/engineering-review["']|CREATE TABLE/);
    expect(scanAnalysisFormulaBypass(join(here, "process-evidence-balances.ts"), sourceText)).toEqual([]);
    const packageJson = JSON.parse(readFileSync(join(here, "../../package.json"), "utf8")) as { dependencies: Record<string, string> };
    expect(Object.keys(packageJson.dependencies).sort()).toEqual(["@rtb/database", "@rtb/platform-commerce", "@rtb/platform-intelligence", "@rtb/platform-kernel", "@rtb/types", "docx", "exceljs", "pptxgenjs", "zod"]);
    expect(systemContext.objectId).toBe(system.objectId);
  });
});
