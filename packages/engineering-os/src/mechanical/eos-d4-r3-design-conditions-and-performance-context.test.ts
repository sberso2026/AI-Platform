import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { D2_TRACK_COMPLETE } from "../civil/civil-bounded-closeout";
import { D2_REOPENED, D3_TRACK_COMPLETE, D4_0_STARTED } from "../geotechnical/geotechnical-bounded-closeout";
import { STRUCTURAL_CAPABILITY_MANIFEST } from "../structural-concrete/capability";
import { scanAnalysisFormulaBypass } from "../structural-systems/formula-scan";
import { D1_STRUCTURAL_PACK_COMPLETE, D1N_REOPENED } from "../structural-systems/structural-pack-sequencing";
import {
  D4_CONTEXT_AUTHORITY,
  D4_RUNTIME_COUNT as R1_RUNTIME_COUNT,
  createD4R1Store,
  recordMechanicalContext,
  recordMechanicalObjectIdentity,
  type D4R1Actor,
} from "./identity-foundation";
import {
  D4_DESIGN_CONDITION_PERFORMANCE_RUNTIME_READY as R2_DESIGN_READY,
  D4_R3_STARTED,
  D4_RUNTIME_COUNT as R2_RUNTIME_COUNT,
  createD4R2Store,
  recordMechanicalEquipmentClassification,
  recordMechanicalServiceFunction,
} from "./equipment-system-context";
import {
  ADMIN_CAN_AUTOMATICALLY_ADOPT_MECHANICAL_DESIGN_CONDITION,
  ADMIN_EQUALS_D4_MECHANICAL_ENGINEERING_AUTHORITY,
  AI_CAN_AUTOMATICALLY_ADOPT_MECHANICAL_DESIGN_CONDITION,
  AI_CAN_INVENT_AUTHORITATIVE_D4_DESIGN_CONDITION,
  AI_CAN_INVENT_AUTHORITATIVE_D4_PERFORMANCE_VALUE,
  AI_CAN_SILENTLY_CHANGE_D4_R3_UNIT,
  AI_EQUALS_D4_MECHANICAL_ENGINEERING_AUTHORITY,
  BASISLESS_AUTHORITATIVE_D4_R3_RECORD_AUTO_ACCEPTED,
  CHANGED_R3_SOURCE_AUTO_REVALIDATES_ENGINEERING,
  CHANGED_R3_SOURCE_AUTO_REWRITES_HISTORY,
  CHANGED_R3_SOURCE_AUTO_UPDATES_DESIGN_CONDITION,
  D1N_REOPENED as R3_D1N_REOPENED,
  D1_STRUCTURAL_PACK_COMPLETE as R3_D1_PACK,
  D2_REOPENED as R3_D2_REOPENED,
  D2_TRACK_COMPLETE as R3_D2_COMPLETE,
  D3_REOPENED,
  D3_TRACK_COMPLETE as R3_D3_COMPLETE,
  D3_TRACK_COMPLETION_CLASSIFICATION,
  D4_APPROVAL_RUNTIME_COUNT,
  D4_AUTOMATIC_DESIGN_CONDITION_DERIVATION_RUNTIME_COUNT,
  D4_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT,
  D4_AUTOMATIC_PERFORMANCE_DERIVATION_RUNTIME_COUNT,
  D4_CERTIFICATION_RUNTIME_COUNT,
  D4_CONFORMANCE_DETERMINATION_RUNTIME_COUNT,
  D4_CREATES_AUTHORITATIVE_PROCESS_CONDITION,
  D4_CROSS_DISCIPLINE_CONFLICT_DETECTION_RUNTIME_COUNT,
  D4_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT,
  D4_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT,
  D4_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT,
  D4_D9_RUNTIME_INTEGRATION_COUNT,
  D4_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
  D4_DESIGN_CONDITION_CONTEXT_IMPLEMENTED,
  D4_DESIGN_CONDITION_PERFORMANCE_RUNTIME_COUNT,
  D4_DESIGN_CONDITION_PERFORMANCE_RUNTIME_IMPLEMENTED,
  D4_DESIGN_CONDITION_PERFORMANCE_RUNTIME_READY,
  D4_DISCIPLINE_INTERFACE_RUNTIME_COUNT,
  D4_EQUALS_D1_STRUCTURAL_AUTHORITY,
  D4_EQUALS_D2_CIVIL_AUTHORITY,
  D4_EQUALS_D3_GEOTECHNICAL_AUTHORITY,
  D4_EQUALS_D5_PIPING_AUTHORITY,
  D4_EQUALS_D6_PROCESS_AUTHORITY,
  D4_EQUALS_D7_ELECTRICAL_AUTHORITY,
  D4_EQUALS_D8_INSTRUMENTATION_CONTROL_AUTHORITY,
  D4_EQUIPMENT_SIZING_RUNTIME_COUNT,
  D4_FATIGUE_ANALYSIS_RUNTIME_COUNT,
  D4_MAINTAINABILITY_RUNTIME_COUNT,
  D4_MECHANICAL_DESIGN_CONDITION_EQUALS_VALIDATED_DESIGN_CONDITION,
  D4_MECHANICAL_DESIGN_OPTIMIZATION_RUNTIME_COUNT,
  D4_MECHANICAL_LOAD_CALCULATION_RUNTIME_COUNT,
  D4_MECHANICAL_REQUIREMENT_RUNTIME_COUNT,
  D4_PERFORMANCE_CONTEXT_EQUALS_VALIDATED_PERFORMANCE,
  D4_PERFORMANCE_CONTEXT_IMPLEMENTED,
  D4_PROCESS_CONDITION_REFERENCE_EQUALS_D4_AUTHORITY,
  D4_R1_IDENTITY_REUSED,
  D4_R2_EQUIPMENT_SYSTEM_CONTEXT_REUSED,
  D4_R2_RUNTIME_COUNT_REUSED,
  D4_R3_APPLICABILITY_EXPLICIT,
  D4_R3_AUTO_PROPAGATED_OUTSIDE_APPLICABILITY,
  D4_R3_AUTO_REPOINTED,
  D4_R3_BLOCKER,
  D4_R3_CALCULATED_RESULT_AUTO_ACCEPTED_AS_SOURCE_CONTEXT,
  D4_R3_CANONICAL_NEXT_PHASE,
  D4_R3_CANONICAL_NEXT_PHASE_SCOPE,
  D4_R3_DUPLICATE_GOVERNANCE_IMPLEMENTED,
  D4_R3_HIDDEN_CALCULATION_ALLOWED,
  D4_R3_HISTORY_PRESERVED,
  D4_R3_LIMITATIONS_EXPLICIT,
  D4_R3_MATURITY,
  D4_R3_NEXT_PHASE_TYPE,
  D4_R3_PROCESS_CONDITION_REFERENCE_SUPPORTED,
  D4_R3_PROVENANCE_PRESERVED,
  D4_R3_PROVENANCE_REQUIRED,
  D4_R3_REPLAY_PROTECTION_IMPLEMENTED,
  D4_R3_SOURCE_AUTO_REPOINTED,
  D4_R3_SOURCE_BASIS_REQUIRED,
  D4_R3_SOURCE_BASIS_TRACEABLE,
  D4_R3_SPOOFING_PROTECTION_IMPLEMENTED,
  D4_R3_STATUS,
  D4_R3_UNIT_SEMANTICS_PRESERVED,
  D4_R3_UNITS_REQUIRED_FOR_NUMERIC_CONDITIONS,
  D4_R3_VENDOR_SOURCE_REFERENCE_ALLOWED,
  D4_R4_STARTED,
  D4_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_COUNT,
  D4_REUSES_CANONICAL_CURRENTNESS,
  D4_REUSES_CANONICAL_FINGERPRINT,
  D4_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_COUNT,
  D4_ROTATING_EQUIPMENT_CALCULATION_RUNTIME_COUNT,
  D4_RUNTIME_COUNT,
  D4_RUNTIME_STARTED,
  D4_STATIC_EQUIPMENT_CALCULATION_RUNTIME_COUNT,
  D4_THERMAL_MECHANICAL_CALCULATION_RUNTIME_COUNT,
  D4_VENDOR_DATA_RUNTIME_COUNT,
  D4_VIBRATION_ANALYSIS_RUNTIME_COUNT,
  D5_RUNTIME_STARTED,
  D6_RUNTIME_STARTED,
  D7_RUNTIME_STARTED,
  D8_RUNTIME_STARTED,
  D9_RUNTIME_COUNT,
  D9_RUNTIME_STARTED,
  DATABASE_SCHEMA_CHANGED,
  DESIGN_CONDITION_PRESENT_EQUALS_VALIDATED,
  EXACT_D4_R1_R2_REFERENCE_REQUIRED,
  FLOATING_D4_R3_SOURCE_REFERENCE_ALLOWED,
  MECHANICAL_DESIGN_CONDITION_EQUALS_PERFORMANCE_RESULT,
  MECHANICAL_PERFORMANCE_CONTEXT_EQUALS_VALIDATED_ENGINEERING,
  MECHANICAL_PERFORMANCE_CONTEXT_EQUALS_VENDOR_DATA,
  NEW_DEPENDENCY_ADDED,
  PARALLEL_D4_CURRENTNESS_ENGINE_CREATED,
  PERFORMANCE_CONTEXT_PRESENT_EQUALS_APPROVED,
  PERFORMANCE_CONTEXT_PRESENT_EQUALS_VALIDATED,
  PROCESS_CONDITION_EQUALS_MECHANICAL_DESIGN_CONDITION,
  SECOND_D4_FINGERPRINT_ALGORITHM_CREATED,
  SILENT_D4_R3_MUTATION_ALLOWED,
  SOURCE_CONDITION_AUTO_PROMOTED_TO_MECHANICAL_DESIGN_CONDITION,
  SOURCE_REQUIREMENT_EQUALS_MECHANICAL_DESIGN_CONDITION,
  TENANT_WORKSPACE_PROJECT_D4_R3_SCOPE_ENFORCED,
  VENDOR_DATA_EQUALS_ENGINEERING_APPROVED,
  VENDOR_DATA_EQUALS_ENGINEERING_VALIDATED,
  VENDOR_SOURCE_REFERENCE_EQUALS_VENDOR_DATA_RUNTIME,
  adoptMechanicalDesignCondition,
  applyChangedSourceToDesignCondition,
  approveMechanicalCondition,
  createD4R3Store,
  deriveDesignCondition,
  derivePerformanceValue,
  ingestVendorData,
  mutateMechanicalCondition,
  promoteSourceCondition,
  recordMechanicalConditionCandidate,
  recordMechanicalDesignCondition,
  recordMechanicalPerformanceContext,
  recordMechanicalSourceRequirement,
  recordProcessConditionReference,
  repointMechanicalCondition,
  sizeMechanicalEquipment,
  validateMechanicalCondition,
} from "./design-condition-performance-context";

const actor: D4R1Actor = {
  actorId: "mechanical-recorder",
  tenantId: "tenant-a",
  workspaceId: "workspace-a",
  projectId: "project-a",
  authority: D4_CONTEXT_AUTHORITY,
};

describe("EOS-D4-R3 Mechanical design conditions and performance context", () => {
  it("records governed design and performance context on exact R1-R2 revisions", () => {
    expect(D4_R3_STATUS).toBe("DESIGN_CONDITIONS_AND_PERFORMANCE_CONTEXT_IMPLEMENTED");
    expect(D4_R3_MATURITY).toBe("DESIGN_CONDITIONS_AND_PERFORMANCE_CONTEXT_IMPLEMENTED");
    expect(D4_RUNTIME_STARTED).toBe(true);
    expect(D4_RUNTIME_COUNT).toBe(3);
    expect(R1_RUNTIME_COUNT).toBe(1);
    expect(R2_RUNTIME_COUNT).toBe(2);
    expect(D4_R2_RUNTIME_COUNT_REUSED).toBe(2);
    expect(D4_DESIGN_CONDITION_PERFORMANCE_RUNTIME_IMPLEMENTED).toBe(true);
    expect(D4_DESIGN_CONDITION_PERFORMANCE_RUNTIME_COUNT).toBe(1);
    expect(D4_DESIGN_CONDITION_PERFORMANCE_RUNTIME_READY).toBe(true);
    expect(R2_DESIGN_READY).toBe(false);
    expect(D4_R3_STARTED).toBe(false);
    expect(D4_R4_STARTED).toBe(false);
    expect(D4_0_STARTED).toBe(false);
    expect(D4_R1_IDENTITY_REUSED).toBe(true);
    expect(D4_R2_EQUIPMENT_SYSTEM_CONTEXT_REUSED).toBe(true);
    expect(EXACT_D4_R1_R2_REFERENCE_REQUIRED).toBe(true);
    expect(FLOATING_D4_R3_SOURCE_REFERENCE_ALLOWED).toBe(false);
    expect(D4_R3_SOURCE_AUTO_REPOINTED).toBe(false);
    expect(D4_R3_SOURCE_BASIS_REQUIRED).toBe(true);
    expect(D4_R3_SOURCE_BASIS_TRACEABLE).toBe(true);
    expect(BASISLESS_AUTHORITATIVE_D4_R3_RECORD_AUTO_ACCEPTED).toBe(false);
    expect(D4_DESIGN_CONDITION_CONTEXT_IMPLEMENTED).toBe(true);
    expect(D4_PERFORMANCE_CONTEXT_IMPLEMENTED).toBe(true);
    expect(SOURCE_REQUIREMENT_EQUALS_MECHANICAL_DESIGN_CONDITION).toBe(false);
    expect(PROCESS_CONDITION_EQUALS_MECHANICAL_DESIGN_CONDITION).toBe(false);
    expect(MECHANICAL_DESIGN_CONDITION_EQUALS_PERFORMANCE_RESULT).toBe(false);
    expect(MECHANICAL_PERFORMANCE_CONTEXT_EQUALS_VENDOR_DATA).toBe(false);
    expect(MECHANICAL_PERFORMANCE_CONTEXT_EQUALS_VALIDATED_ENGINEERING).toBe(false);
    expect(D4_MECHANICAL_DESIGN_CONDITION_EQUALS_VALIDATED_DESIGN_CONDITION).toBe(false);
    expect(D4_PERFORMANCE_CONTEXT_EQUALS_VALIDATED_PERFORMANCE).toBe(false);
    expect(D4_R3_UNITS_REQUIRED_FOR_NUMERIC_CONDITIONS).toBe(true);
    expect(D4_R3_UNIT_SEMANTICS_PRESERVED).toBe(true);
    expect(AI_CAN_SILENTLY_CHANGE_D4_R3_UNIT).toBe(false);
    expect(D4_R3_PROCESS_CONDITION_REFERENCE_SUPPORTED).toBe(true);
    expect(D4_PROCESS_CONDITION_REFERENCE_EQUALS_D4_AUTHORITY).toBe(false);
    expect(D4_CREATES_AUTHORITATIVE_PROCESS_CONDITION).toBe(false);
    expect(SOURCE_CONDITION_AUTO_PROMOTED_TO_MECHANICAL_DESIGN_CONDITION).toBe(false);
    expect(AI_CAN_AUTOMATICALLY_ADOPT_MECHANICAL_DESIGN_CONDITION).toBe(false);
    expect(ADMIN_CAN_AUTOMATICALLY_ADOPT_MECHANICAL_DESIGN_CONDITION).toBe(false);
    expect(D4_AUTOMATIC_DESIGN_CONDITION_DERIVATION_RUNTIME_COUNT).toBe(0);
    expect(D4_AUTOMATIC_PERFORMANCE_DERIVATION_RUNTIME_COUNT).toBe(0);
    expect(AI_CAN_INVENT_AUTHORITATIVE_D4_DESIGN_CONDITION).toBe(false);
    expect(AI_CAN_INVENT_AUTHORITATIVE_D4_PERFORMANCE_VALUE).toBe(false);
    expect(D4_VENDOR_DATA_RUNTIME_COUNT).toBe(0);
    expect(D4_R3_VENDOR_SOURCE_REFERENCE_ALLOWED).toBe(true);
    expect(VENDOR_SOURCE_REFERENCE_EQUALS_VENDOR_DATA_RUNTIME).toBe(false);
    expect(VENDOR_DATA_EQUALS_ENGINEERING_VALIDATED).toBe(false);
    expect(VENDOR_DATA_EQUALS_ENGINEERING_APPROVED).toBe(false);
    expect(D4_R3_HIDDEN_CALCULATION_ALLOWED).toBe(false);
    expect(D4_R3_CALCULATED_RESULT_AUTO_ACCEPTED_AS_SOURCE_CONTEXT).toBe(false);
    expect(D4_R3_APPLICABILITY_EXPLICIT).toBe(true);
    expect(D4_R3_LIMITATIONS_EXPLICIT).toBe(true);
    expect(D4_R3_AUTO_PROPAGATED_OUTSIDE_APPLICABILITY).toBe(false);
    expect(D4_REUSES_CANONICAL_CURRENTNESS).toBe(true);
    expect(PARALLEL_D4_CURRENTNESS_ENGINE_CREATED).toBe(false);
    expect(D4_REUSES_CANONICAL_FINGERPRINT).toBe(true);
    expect(SECOND_D4_FINGERPRINT_ALGORITHM_CREATED).toBe(false);
    expect(D4_R3_PROVENANCE_REQUIRED).toBe(true);
    expect(D4_R3_PROVENANCE_PRESERVED).toBe(true);
    expect(D4_R3_AUTO_REPOINTED).toBe(false);
    expect(SILENT_D4_R3_MUTATION_ALLOWED).toBe(false);
    expect(D4_R3_HISTORY_PRESERVED).toBe(true);
    expect(TENANT_WORKSPACE_PROJECT_D4_R3_SCOPE_ENFORCED).toBe(true);
    expect(CHANGED_R3_SOURCE_AUTO_REWRITES_HISTORY).toBe(false);
    expect(CHANGED_R3_SOURCE_AUTO_UPDATES_DESIGN_CONDITION).toBe(false);
    expect(CHANGED_R3_SOURCE_AUTO_REVALIDATES_ENGINEERING).toBe(false);
    expect(AI_EQUALS_D4_MECHANICAL_ENGINEERING_AUTHORITY).toBe(false);
    expect(ADMIN_EQUALS_D4_MECHANICAL_ENGINEERING_AUTHORITY).toBe(false);
    expect(D4_EQUALS_D1_STRUCTURAL_AUTHORITY).toBe(false);
    expect(D4_EQUALS_D2_CIVIL_AUTHORITY).toBe(false);
    expect(D4_EQUALS_D3_GEOTECHNICAL_AUTHORITY).toBe(false);
    expect(D4_EQUALS_D5_PIPING_AUTHORITY).toBe(false);
    expect(D4_EQUALS_D6_PROCESS_AUTHORITY).toBe(false);
    expect(D4_EQUALS_D7_ELECTRICAL_AUTHORITY).toBe(false);
    expect(D4_EQUALS_D8_INSTRUMENTATION_CONTROL_AUTHORITY).toBe(false);
    expect(DESIGN_CONDITION_PRESENT_EQUALS_VALIDATED).toBe(false);
    expect(PERFORMANCE_CONTEXT_PRESENT_EQUALS_VALIDATED).toBe(false);
    expect(PERFORMANCE_CONTEXT_PRESENT_EQUALS_APPROVED).toBe(false);
    expect(D4_R3_DUPLICATE_GOVERNANCE_IMPLEMENTED).toBe(true);
    expect(D4_R3_REPLAY_PROTECTION_IMPLEMENTED).toBe(true);
    expect(D4_R3_SPOOFING_PROTECTION_IMPLEMENTED).toBe(true);
    expect([
      D4_VENDOR_DATA_RUNTIME_COUNT,
      D4_MECHANICAL_REQUIREMENT_RUNTIME_COUNT,
      D4_MAINTAINABILITY_RUNTIME_COUNT,
      D4_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_COUNT,
      D4_DISCIPLINE_INTERFACE_RUNTIME_COUNT,
      D4_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_COUNT,
      D4_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT,
      D4_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
      D4_EQUIPMENT_SIZING_RUNTIME_COUNT,
      D4_ROTATING_EQUIPMENT_CALCULATION_RUNTIME_COUNT,
      D4_STATIC_EQUIPMENT_CALCULATION_RUNTIME_COUNT,
      D4_THERMAL_MECHANICAL_CALCULATION_RUNTIME_COUNT,
      D4_MECHANICAL_LOAD_CALCULATION_RUNTIME_COUNT,
      D4_VIBRATION_ANALYSIS_RUNTIME_COUNT,
      D4_FATIGUE_ANALYSIS_RUNTIME_COUNT,
      D4_MECHANICAL_DESIGN_OPTIMIZATION_RUNTIME_COUNT,
      D4_AUTOMATIC_DESIGN_CONDITION_DERIVATION_RUNTIME_COUNT,
      D4_AUTOMATIC_PERFORMANCE_DERIVATION_RUNTIME_COUNT,
      D4_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT,
      D4_CONFORMANCE_DETERMINATION_RUNTIME_COUNT,
      D4_APPROVAL_RUNTIME_COUNT,
      D4_CERTIFICATION_RUNTIME_COUNT,
      D4_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT,
      D4_CROSS_DISCIPLINE_CONFLICT_DETECTION_RUNTIME_COUNT,
      D4_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT,
      D4_D9_RUNTIME_INTEGRATION_COUNT,
    ]).toEqual(Array(26).fill(0));
    expect(D5_RUNTIME_STARTED).toBe(false);
    expect(D6_RUNTIME_STARTED).toBe(false);
    expect(D7_RUNTIME_STARTED).toBe(false);
    expect(D8_RUNTIME_STARTED).toBe(false);
    expect(D9_RUNTIME_STARTED).toBe(false);
    expect(D9_RUNTIME_COUNT).toBe(0);
    expect(DATABASE_SCHEMA_CHANGED).toBe(false);
    expect(NEW_DEPENDENCY_ADDED).toBe(false);
    expect(R3_D1_PACK).toBe(false);
    expect(R3_D1N_REOPENED).toBe(false);
    expect(D1_STRUCTURAL_PACK_COMPLETE).toBe(false);
    expect(D1N_REOPENED).toBe(false);
    expect(R3_D2_COMPLETE).toBe(true);
    expect(D2_TRACK_COMPLETE).toBe(true);
    expect(R3_D2_REOPENED).toBe(false);
    expect(D2_REOPENED).toBe(false);
    expect(R3_D3_COMPLETE).toBe(true);
    expect(D3_TRACK_COMPLETE).toBe(true);
    expect(D3_TRACK_COMPLETION_CLASSIFICATION).toBe("COMPLETE_BOUNDED_WITH_LIMITATIONS");
    expect(D3_REOPENED).toBe(false);
    expect(D4_R3_CANONICAL_NEXT_PHASE).toBe("EOS-D4-R4-VENDOR-DATA-AND-EVIDENCE-CONTEXT");
    expect(D4_R3_NEXT_PHASE_TYPE).toBe("VENDOR_DATA_AND_EVIDENCE_CONTEXT");
    expect(D4_R3_CANONICAL_NEXT_PHASE_SCOPE).toContain("Do not perform equipment calculations");
    expect(D4_R3_BLOCKER).toBe("NONE");

    const r1 = createD4R1Store();
    const context = recordMechanicalContext(r1, actor, {
      contextId: "mechanical-context-1",
      citedLifecycleStage: "CONCEPT",
      provenanceRef: "prov-mechanical-context",
    });
    const system = recordMechanicalObjectIdentity(r1, actor, {
      objectId: "system-1",
      contextId: context.contextId,
      objectType: "MECHANICAL_SYSTEM_CONTEXT",
      citedLifecycleStage: "CONCEPT",
      provenanceRef: "prov-system",
    });
    const equipment = recordMechanicalObjectIdentity(r1, actor, {
      objectId: "pump-identity-1",
      contextId: context.contextId,
      objectType: "ROTATING_EQUIPMENT",
      citedLifecycleStage: "FEED",
      provenanceRef: "prov-pump-identity",
      parentObjectId: system.objectId,
    });
    const r2 = createD4R2Store(r1);
    const classification = recordMechanicalEquipmentClassification(r2, actor, {
      classificationId: "class-1",
      contextId: context.contextId,
      objectId: equipment.objectId,
      objectRevisionFingerprint: equipment.fingerprint,
      classification: "PUMP",
      citedLifecycleStage: "FEED",
      provenanceRef: "prov-class",
      citedCurrentness: "CURRENT",
    });
    const service = recordMechanicalServiceFunction(r2, actor, {
      serviceContextId: "service-1",
      contextId: context.contextId,
      objectId: equipment.objectId,
      objectRevisionFingerprint: equipment.fingerprint,
      serviceFunction: "PUMPING",
      citedLifecycleStage: "FEED",
      provenanceRef: "prov-service",
      citedCurrentness: "CURRENT",
    });
    const store = createD4R3Store(r2);
    const bound = {
      tenantId: actor.tenantId,
      workspaceId: actor.workspaceId,
      projectId: actor.projectId,
      contextId: context.contextId,
      objectId: equipment.objectId,
      objectRevisionFingerprint: equipment.fingerprint,
      r2SubjectKind: "CLASSIFICATION" as const,
      r2SubjectId: classification.classificationId,
      r2RevisionFingerprint: classification.fingerprint,
      citedCurrentness: "CURRENT" as const,
      applicabilityObjectId: equipment.objectId,
      applicabilityCase: "NORMAL_OPERATION",
      limitations: "Applies only to this pump identity",
      provenanceRef: "prov-r3",
    };

    const sourceRequirement = recordMechanicalSourceRequirement(store, actor, {
      ...bound,
      recordId: "source-pressure",
      subjectKind: "DESIGN_PRESSURE",
      suppliedValue: "10",
      unit: "bar",
      sourceBasis: "PROJECT_SPECIFICATION",
      sourceRef: "spec-100",
      sourceRevision: "A",
    });
    expect(sourceRequirement.recordClass).toBe("SOURCE_REQUIREMENT");
    expect(sourceRequirement.mechanicalDesignCondition).toBe(false);
    expect(sourceRequirement.engineeringValidated).toBe(false);
    expect(sourceRequirement.unit).toBe("bar");
    expect(sourceRequirement.sourceClass).toBe("SOURCE_REQUIREMENT");

    const design = recordMechanicalDesignCondition(store, actor, {
      ...bound,
      recordId: "design-pressure",
      subjectKind: "DESIGN_PRESSURE",
      suppliedValue: "10",
      unit: "bar",
      sourceBasis: "PROJECT_SPECIFICATION",
      sourceRef: "spec-100",
      sourceRevision: "A",
      adoptionRationale: "Adopted for the pump casing design case",
    });
    expect(design.recordClass).toBe("MECHANICAL_DESIGN_CONDITION");
    expect(design.mechanicalDesignCondition).toBe(true);
    expect(design.engineeringValidated).toBe(false);
    expect(design.engineeringApproved).toBe(false);
    expect(design.calculated).toBe(false);
    expect(design.unit).toBe("bar");
    expect(design.objectRevisionFingerprint).toBe(equipment.fingerprint);
    expect(design.r2RevisionFingerprint).toBe(classification.fingerprint);
    expect(design.processAuthority).toBe(false);
    expect(design.authoritativeProcessCondition).toBe(false);
    expect(sourceRequirement.recordClass).not.toBe(design.recordClass);

    expect(() => recordMechanicalDesignCondition(store, actor, {
      ...bound,
      recordId: "design-no-unit",
      subjectKind: "DESIGN_TEMPERATURE",
      suppliedValue: "80",
      sourceBasis: "CLIENT_REQUIREMENT",
      sourceRef: "client-1",
      sourceRevision: "A",
      adoptionRationale: "Adopted operating temperature",
    })).toThrow(/UNITS_REQUIRED/);
    expect(() => recordMechanicalDesignCondition(store, actor, {
      ...bound,
      recordId: "design-convert",
      subjectKind: "DESIGN_PRESSURE",
      suppliedValue: "10",
      unit: "bar",
      normalizedUnit: "kPa",
      sourceBasis: "PROJECT_SPECIFICATION",
      sourceRef: "spec-100",
      sourceRevision: "B",
      adoptionRationale: "Would convert the unit",
    })).toThrow(/UNIT_CHANGE_REJECTED/);
    expect(() => recordMechanicalDesignCondition(store, actor, {
      ...bound,
      recordId: "design-no-rationale",
      subjectKind: "DESIGN_PRESSURE",
      suppliedValue: "12",
      unit: "bar",
      sourceBasis: "PROJECT_SPECIFICATION",
      sourceRef: "spec-100",
      sourceRevision: "B",
      adoptionRationale: " ",
    })).toThrow(/ADOPTION_RATIONALE_REQUIRED/);
    expect(() => recordMechanicalDesignCondition(store, actor, {
      ...bound,
      recordId: "design-floating",
      subjectKind: "DESIGN_PRESSURE",
      suppliedValue: "12",
      unit: "bar",
      sourceBasis: "PROJECT_SPECIFICATION",
      sourceRef: "spec-100",
      sourceRevision: "latest",
      adoptionRationale: "Floating source revision",
    })).toThrow(/SOURCE_REVISION_REQUIRED/);
    expect(() => recordMechanicalDesignCondition(store, actor, {
      ...bound,
      recordId: "design-basisless",
      subjectKind: "DESIGN_PRESSURE",
      suppliedValue: "12",
      unit: "bar",
      sourceBasis: "NOT_A_BASIS" as "PROJECT_SPECIFICATION",
      sourceRef: "spec-100",
      sourceRevision: "B",
      adoptionRationale: "Missing basis",
    })).toThrow(/SOURCE_BASIS_REQUIRED/);
    expect(() => recordMechanicalDesignCondition(store, actor, {
      ...bound,
      recordId: "design-wrong-r2",
      r2RevisionFingerprint: "not-the-classification",
      subjectKind: "DESIGN_PRESSURE",
      suppliedValue: "12",
      unit: "bar",
      sourceBasis: "PROJECT_SPECIFICATION",
      sourceRef: "spec-100",
      sourceRevision: "B",
      adoptionRationale: "Wrong equipment context revision",
    })).toThrow(/R2_REVISION_MISMATCH/);
    expect(() => recordMechanicalDesignCondition(store, actor, {
      ...bound,
      recordId: "design-other-object",
      applicabilityObjectId: system.objectId,
      subjectKind: "OPERATING_PRESSURE",
      suppliedValue: "6",
      unit: "bar",
      sourceBasis: "PROJECT_SPECIFICATION",
      sourceRef: "spec-100",
      sourceRevision: "A",
      adoptionRationale: "Would apply to another object",
    })).toThrow(/APPLICABILITY_MISMATCH/);
    expect(() => recordMechanicalDesignCondition(store, actor, {
      ...bound,
      recordId: "design-all",
      applicabilityCase: "ALL",
      subjectKind: "OPERATING_TEMPERATURE",
      suppliedValue: "40",
      unit: "C",
      sourceBasis: "PROJECT_SPECIFICATION",
      sourceRef: "spec-100",
      sourceRevision: "A",
      adoptionRationale: "Would propagate",
    })).toThrow(/AUTO_PROPAGATION_REJECTED/);
    expect(() => recordMechanicalDesignCondition(store, actor, {
      ...bound,
      recordId: "design-propagate",
      propagate: true,
      subjectKind: "OPERATING_TEMPERATURE",
      suppliedValue: "40",
      unit: "C",
      sourceBasis: "PROJECT_SPECIFICATION",
      sourceRef: "spec-100",
      sourceRevision: "A",
      adoptionRationale: "Would propagate",
    })).toThrow(/AUTO_PROPAGATION_REJECTED/);
    expect(() => recordMechanicalDesignCondition(store, actor, {
      ...bound,
      recordId: "design-limits",
      limitations: " ",
      subjectKind: "DESIGN_LIFE",
      suppliedValue: "20",
      unit: "a",
      sourceBasis: "PROJECT_SPECIFICATION",
      sourceRef: "spec-100",
      sourceRevision: "A",
      adoptionRationale: "Missing limitations",
    })).toThrow(/LIMITATIONS_REQUIRED/);
    expect(() => recordMechanicalDesignCondition(store, actor, {
      ...bound,
      recordId: "design-formula",
      subjectKind: "DESIGN_PRESSURE",
      suppliedValue: "10*1.2",
      unit: "bar",
      sourceBasis: "PROJECT_SPECIFICATION",
      sourceRef: "spec-100",
      sourceRevision: "C",
      adoptionRationale: "Hidden product",
    })).toThrow(/HIDDEN_CALCULATION_REJECTED/);
    expect(() => recordMechanicalDesignCondition(store, actor, {
      ...bound,
      recordId: "design-calculated",
      calculatedResult: true,
      subjectKind: "DESIGN_PRESSURE",
      suppliedValue: "11",
      unit: "bar",
      sourceBasis: "PROJECT_SPECIFICATION",
      sourceRef: "spec-100",
      sourceRevision: "C",
      adoptionRationale: "Calculated result",
    })).toThrow(/HIDDEN_CALCULATION_REJECTED/);

    const processReference = recordProcessConditionReference(store, actor, {
      ...bound,
      recordId: "process-pressure",
      subjectKind: "OPERATING_PRESSURE",
      suppliedValue: "8",
      unit: "bar",
      sourceBasis: "PROCESS_PROVIDED_CONDITION",
      sourceRef: "process-case-1",
      sourceRevision: "P1",
    });
    const processFingerprint = processReference.fingerprint;
    expect(processReference.recordClass).toBe("PROCESS_CONDITION_REFERENCE");
    expect(processReference.mechanicalDesignCondition).toBe(false);
    expect(processReference.processAuthority).toBe(false);
    expect(processReference.authoritativeProcessCondition).toBe(false);
    expect(processReference.sourceClass).toBe("PROCESS_CONDITION");
    expect(() => recordProcessConditionReference(store, actor, {
      ...bound,
      recordId: "process-fabricated",
      processFlow: true,
      subjectKind: "OPERATING_PRESSURE",
      suppliedValue: "9",
      unit: "bar",
      sourceBasis: "PROCESS_PROVIDED_CONDITION",
      sourceRef: "process-case-2",
      sourceRevision: "P2",
    })).toThrow(/PROCESS_FABRICATION_REJECTED/);
    expect(() => recordProcessConditionReference(store, actor, {
      ...bound,
      recordId: "process-authority",
      createsAuthoritativeProcessCondition: true,
      subjectKind: "OPERATING_PRESSURE",
      suppliedValue: "9",
      unit: "bar",
      sourceBasis: "PROCESS_PROVIDED_CONDITION",
      sourceRef: "process-case-2",
      sourceRevision: "P2",
    })).toThrow(/AUTHORITATIVE_PROCESS_CONDITION_REJECTED/);
    expect(() => promoteSourceCondition()).toThrow(/SOURCE_CONDITION_AUTO_PROMOTION_REJECTED/);
    expect(processReference.fingerprint).toBe(processFingerprint);
    expect(processReference.recordStatus).toBe("CURRENT");
    expect(() => adoptMechanicalDesignCondition(store, actor, {
      ...bound,
      recordId: "adopted-converted",
      adoptedFromRecordId: processReference.recordId,
      adoptionRationale: "Would change the unit",
      subjectKind: "OPERATING_PRESSURE",
      suppliedValue: "8",
      unit: "kPa",
      sourceBasis: "PROCESS_PROVIDED_CONDITION",
      sourceRef: "process-case-1",
      sourceRevision: "P1",
    })).toThrow(/ADOPTION_VALUE_CHANGED/);
    const adopted = adoptMechanicalDesignCondition(store, actor, {
      ...bound,
      recordId: "adopted-pressure",
      adoptedFromRecordId: processReference.recordId,
      adoptionRationale: "Explicitly adopted as the Mechanical operating pressure",
      subjectKind: "OPERATING_PRESSURE",
      suppliedValue: "8",
      unit: "bar",
      sourceBasis: "PROCESS_PROVIDED_CONDITION",
      sourceRef: "process-case-1",
      sourceRevision: "P1",
    });
    expect(adopted.recordClass).toBe("MECHANICAL_DESIGN_CONDITION");
    expect(adopted.sourceClass).toBe("PROCESS_CONDITION");
    expect(adopted.mechanicalDesignCondition).toBe(true);
    expect(adopted.processAuthority).toBe(false);
    expect(adopted.engineeringValidated).toBe(false);
    expect(adopted.adoptedFromRecordId).toBe(processReference.recordId);
    expect(processReference.fingerprint).toBe(processFingerprint);
    expect(processReference.recordClass).toBe("PROCESS_CONDITION_REFERENCE");
    expect(processReference.mechanicalDesignCondition).toBe(false);

    const candidate = recordMechanicalConditionCandidate(store, actor, {
      ...bound,
      recordId: "candidate-pressure",
      subjectKind: "DESIGN_PRESSURE",
      suppliedValue: "11",
      unit: "bar",
      sourceBasis: "ENGINEERING_ASSUMPTION",
      sourceRef: "assumption-1",
      sourceRevision: "A",
    });
    expect(candidate.recordClass).toBe("CANDIDATE");
    expect(candidate.authoritative).toBe(false);
    expect(candidate.mechanicalDesignCondition).toBe(false);
    expect(candidate.candidate).toBe(true);

    const performance = recordMechanicalPerformanceContext(store, actor, {
      ...bound,
      r2SubjectKind: "SERVICE",
      r2SubjectId: service.serviceContextId,
      r2RevisionFingerprint: service.fingerprint,
      recordId: "performance-capacity",
      subjectKind: "CAPACITY",
      suppliedValue: "100",
      unit: "m3/h",
      sourceBasis: "CLIENT_REQUIREMENT",
      sourceRef: "client-duty-1",
      sourceRevision: "A",
      adoptionRationale: "Recorded as the supplied capacity requirement",
    });
    expect(performance.recordClass).toBe("MECHANICAL_PERFORMANCE_CONTEXT");
    expect(performance.mechanicalPerformanceContext).toBe(true);
    expect(performance.calculated).toBe(false);
    expect(performance.engineeringValidated).toBe(false);
    expect(performance.unit).toBe("m3/h");
    expect(performance.r2RevisionFingerprint).toBe(service.fingerprint);
    const vendorReference = recordMechanicalPerformanceContext(store, actor, {
      ...bound,
      r2SubjectKind: "SERVICE",
      r2SubjectId: service.serviceContextId,
      r2RevisionFingerprint: service.fingerprint,
      recordId: "performance-speed",
      subjectKind: "SPEED",
      suppliedValue: "1500",
      unit: "rpm",
      sourceBasis: "VENDOR_INFORMATION_REFERENCE",
      sourceRef: "vendor-letter-1",
      sourceRevision: "V1",
      adoptionRationale: "Referenced supplied speed only",
      applicabilityCase: "RATED_SPEED",
    });
    expect(vendorReference.vendorSourceReferenced).toBe(true);
    expect(vendorReference.vendorDataRuntime).toBe(false);
    expect(vendorReference.engineeringValidated).toBe(false);
    expect(vendorReference.engineeringApproved).toBe(false);
    expect(() => ingestVendorData()).toThrow(/VENDOR_DATA_RUNTIME_REJECTED/);
    expect(() => deriveDesignCondition()).toThrow(/AUTOMATIC_DESIGN_CONDITION_DERIVATION_REJECTED/);
    expect(() => derivePerformanceValue()).toThrow(/AUTOMATIC_PERFORMANCE_DERIVATION_REJECTED/);
    expect(() => sizeMechanicalEquipment()).toThrow(/EQUIPMENT_SIZING_REJECTED/);
    expect(() => validateMechanicalCondition()).toThrow(/VALIDATION_RUNTIME_REJECTED/);
    expect(() => approveMechanicalCondition()).toThrow(/APPROVAL_RUNTIME_REJECTED/);
    expect(() => repointMechanicalCondition()).toThrow(/SOURCE_AUTO_REPOINT_REJECTED/);
    expect(() => mutateMechanicalCondition()).toThrow(/SILENT_MUTATION_REJECTED/);
    expect(() => applyChangedSourceToDesignCondition()).toThrow(/SOURCE_CHANGE_AUTO_UPDATE_REJECTED/);

    expect(() => recordMechanicalDesignCondition(store, {
      ...actor,
      actorId: "AI_ASSISTANT",
    }, {
      ...bound,
      recordId: "design-ai",
      subjectKind: "DESIGN_TEMPERATURE",
      suppliedValue: "90",
      unit: "C",
      sourceBasis: "PROJECT_SPECIFICATION",
      sourceRef: "spec-100",
      sourceRevision: "A",
      adoptionRationale: "AI adoption",
    })).toThrow(/AI_NOT_MECHANICAL_AUTHORITY/);
    expect(() => recordMechanicalDesignCondition(store, {
      ...actor,
      actorId: "ADMIN",
    }, {
      ...bound,
      recordId: "design-admin",
      subjectKind: "DESIGN_TEMPERATURE",
      suppliedValue: "90",
      unit: "C",
      sourceBasis: "PROJECT_SPECIFICATION",
      sourceRef: "spec-100",
      sourceRevision: "A",
      adoptionRationale: "Admin adoption",
    })).toThrow(/ADMIN_NOT_MECHANICAL_AUTHORITY/);
    expect(() => recordMechanicalDesignCondition(store, {
      ...actor,
      tenantId: "tenant-b",
    }, {
      ...bound,
      recordId: "design-cross",
      subjectKind: "DESIGN_TEMPERATURE",
      suppliedValue: "90",
      unit: "C",
      sourceBasis: "PROJECT_SPECIFICATION",
      sourceRef: "spec-100",
      sourceRevision: "A",
      adoptionRationale: "Cross-tenant",
    })).toThrow(/SCOPE_MISMATCH/);

    const replay = recordMechanicalDesignCondition(store, actor, {
      ...bound,
      recordId: "design-pressure",
      subjectKind: "DESIGN_PRESSURE",
      suppliedValue: "10",
      unit: "bar",
      sourceBasis: "PROJECT_SPECIFICATION",
      sourceRef: "spec-100",
      sourceRevision: "A",
      adoptionRationale: "Adopted for the pump casing design case",
    });
    expect(replay.fingerprint).toBe(design.fingerprint);
    expect(() => recordMechanicalDesignCondition(store, actor, {
      ...bound,
      recordId: "design-pressure",
      subjectKind: "DESIGN_PRESSURE",
      suppliedValue: "10",
      unit: "kPa",
      sourceBasis: "PROJECT_SPECIFICATION",
      sourceRef: "spec-100",
      sourceRevision: "A",
      adoptionRationale: "Adopted for the pump casing design case",
    })).toThrow(/RECORD_ALREADY_RECORDED/);
    expect(() => recordMechanicalDesignCondition(store, actor, {
      ...bound,
      recordId: "design-pressure-dup",
      subjectKind: "DESIGN_PRESSURE",
      suppliedValue: "10",
      unit: "bar",
      sourceBasis: "PROJECT_SPECIFICATION",
      sourceRef: "spec-100",
      sourceRevision: "A",
      adoptionRationale: "Duplicate current condition",
    })).toThrow(/DUPLICATE_RECORD_REJECTED/);

    const preserved = design.fingerprint;
    const preservedRevision = design.sourceRevision;
    const revised = recordMechanicalDesignCondition(store, actor, {
      ...bound,
      recordId: "design-pressure-b",
      predecessorRecordId: design.recordId,
      subjectKind: "DESIGN_PRESSURE",
      suppliedValue: "12",
      unit: "bar",
      sourceBasis: "PROJECT_SPECIFICATION",
      sourceRef: "spec-100",
      sourceRevision: "B",
      adoptionRationale: "Explicit new revision after the source changed",
    });
    expect(revised.sourceRevision).toBe("B");
    expect(revised.engineeringValidated).toBe(false);
    expect(revised.predecessorFingerprint).toBe(preserved);
    expect(design.sourceRevision).toBe(preservedRevision);
    expect(design.fingerprint).toBe(preserved);
    expect(design.recordStatus).toBe("SUPERSEDED");
    expect(design.engineeringValidated).toBe(false);
    expect(store.history.some((row) => row.recordId === design.recordId && row.fingerprint === preserved)).toBe(true);

    const envelope = recordMechanicalDesignCondition(store, actor, {
      ...bound,
      recordId: "design-envelope",
      subjectKind: "MECHANICAL_OPERATING_ENVELOPE",
      suppliedValue: "continuous service",
      sourceBasis: "ADOPTED_PROJECT_DESIGN_BASIS",
      sourceRef: "basis-1",
      sourceRevision: "A",
      adoptionRationale: "Supplied envelope description",
      applicabilityCase: "CONTINUOUS",
    });
    expect(envelope.unit).toBeNull();
    expect(envelope.suppliedValue).toBe("continuous service");

    const revisedEquipment = recordMechanicalObjectIdentity(r1, actor, {
      objectId: "pump-identity-1b",
      contextId: context.contextId,
      objectType: "ROTATING_EQUIPMENT",
      citedLifecycleStage: "DETAILED_DESIGN",
      provenanceRef: "prov-pump-identity-b",
      predecessorObjectId: equipment.objectId,
    });
    expect(design.objectRevisionFingerprint).toBe(equipment.fingerprint);
    expect(() => recordMechanicalDesignCondition(store, actor, {
      ...bound,
      recordId: "design-stale",
      subjectKind: "DESIGN_TEMPERATURE",
      suppliedValue: "90",
      unit: "C",
      sourceBasis: "PROJECT_SPECIFICATION",
      sourceRef: "spec-100",
      sourceRevision: "A",
      adoptionRationale: "Stale identity",
    })).toThrow(/R2_CONTEXT_NOT_CURRENT/);
    const successorClass = recordMechanicalEquipmentClassification(r2, actor, {
      classificationId: "class-1b",
      contextId: context.contextId,
      objectId: revisedEquipment.objectId,
      objectRevisionFingerprint: revisedEquipment.fingerprint,
      classification: "PUMP",
      citedLifecycleStage: "DETAILED_DESIGN",
      provenanceRef: "prov-class-b",
      citedCurrentness: "CURRENT",
      predecessorClassificationId: classification.classificationId,
    });
    const successorCondition = recordMechanicalDesignCondition(store, actor, {
      ...bound,
      recordId: "design-successor",
      objectId: revisedEquipment.objectId,
      objectRevisionFingerprint: revisedEquipment.fingerprint,
      r2SubjectId: successorClass.classificationId,
      r2RevisionFingerprint: successorClass.fingerprint,
      applicabilityObjectId: revisedEquipment.objectId,
      subjectKind: "DESIGN_TEMPERATURE",
      suppliedValue: "90",
      unit: "C",
      sourceBasis: "PROJECT_SPECIFICATION",
      sourceRef: "spec-100",
      sourceRevision: "A",
      adoptionRationale: "Bound only to the revised identity",
    });
    expect(successorCondition.objectId).toBe(revisedEquipment.objectId);
    expect(design.fingerprint).toBe(preserved);
    expect(design.objectId).toBe(equipment.objectId);

    const here = dirname(fileURLToPath(import.meta.url));
    const source = readFileSync(join(here, "design-condition-performance-context.ts"), "utf8");
    expect(source).toContain("fingerprintCanonical");
    expect(source).not.toMatch(/createHash|from ["']@rtb\/engineering-review["']|CREATE TABLE/);
    expect(scanAnalysisFormulaBypass(join(here, "design-condition-performance-context.ts"), source)).toEqual([]);
    const packageJson = JSON.parse(readFileSync(join(here, "../../package.json"), "utf8")) as { dependencies: Record<string, string> };
    expect(Object.keys(packageJson.dependencies).sort()).toEqual([
      "@rtb/database",
      "@rtb/engineering-review",
      "@rtb/platform-commerce",
      "@rtb/platform-intelligence",
      "@rtb/platform-kernel",
      "@rtb/types",
      "docx",
      "exceljs",
      "pptxgenjs",
      "zod",
    ]);
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D4.R3.DESIGN_CONDITIONS_AND_PERFORMANCE_CONTEXT")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D4.R4.VENDOR_DATA_AND_EVIDENCE_CONTEXT")?.implementationState).toBe("NOT_IMPLEMENTED");
  });
});
