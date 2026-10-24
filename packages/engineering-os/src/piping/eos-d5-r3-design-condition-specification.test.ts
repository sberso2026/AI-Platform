import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { D5_RUNTIME_COUNT as ARCHITECTURE_D5_RUNTIME_COUNT } from "@rtb/types";
import { describe, expect, it } from "vitest";
import { STRUCTURAL_CAPABILITY_MANIFEST } from "../structural-concrete/capability";
import { scanAnalysisFormulaBypass } from "../structural-systems/formula-scan";
import { D5_RUNTIME_COUNT as R1_RUNTIME_COUNT, createD5R1Store, recordPipingContext, recordPipingObjectIdentity, type D5R1Actor } from "./identity-foundation";
import {
  D5_DESIGN_CONDITION_SPECIFICATION_RUNTIME_COUNT as R2_DESIGN_COUNT,
  D5_R3_STARTED,
  D5_RUNTIME_COUNT as R2_RUNTIME_COUNT,
  createD5R2Store,
  recordPipingLineContext,
  recordPipingServiceFunction,
  recordPipingSystemContext,
} from "./system-line-service-context";
import {
  ADMIN_CAN_PROMOTE_SOURCE_DATA_TO_PIPING_ENGINEERING_TRUTH,
  ADMIN_EQUALS_D5_PIPING_ENGINEERING_AUTHORITY,
  AI_CAN_INVENT_AUTHORITATIVE_D5_DESIGN_CONDITION,
  AI_CAN_INVENT_AUTHORITATIVE_D5_SPECIFICATION,
  AI_CAN_PROMOTE_SOURCE_CONDITION_TO_ADOPTED_PIPING_CONDITION,
  AI_CAN_SILENTLY_CHANGE_D5_R3_UNITS,
  AI_EQUALS_D5_PIPING_ENGINEERING_AUTHORITY,
  BASISLESS_AUTHORITATIVE_D5_R3_RECORD_AUTO_ACCEPTED,
  CODE_STANDARD_REFERENCE_EQUALS_CERTIFICATION,
  CODE_STANDARD_REFERENCE_EQUALS_CONFORMANCE,
  D1_STRUCTURAL_PACK_COMPLETE,
  D1N_REOPENED,
  D2_REOPENED,
  D2_TRACK_COMPLETE,
  D3_REOPENED,
  D3_TRACK_COMPLETE,
  D4_REOPENED,
  D4_TRACK_COMPLETE,
  D5_APPROVAL_RUNTIME_COUNT,
  D5_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT,
  D5_AUTOMATIC_REDESIGN_RUNTIME_COUNT,
  D5_AUTOMATIC_ROUTING_RUNTIME_COUNT,
  D5_BRANCH_REINFORCEMENT_CALCULATION_RUNTIME_COUNT,
  D5_CERTIFICATION_RUNTIME_COUNT,
  D5_CODE_STANDARD_REFERENCE_SUPPORTED,
  D5_COMPONENT_CONNECTION_VALVE_RUNTIME_COUNT,
  D5_CONFORMANCE_DETERMINATION_RUNTIME_COUNT,
  D5_CREATES_AUTHORITATIVE_PROCESS_CONDITION,
  D5_CROSS_DISCIPLINE_CONFLICT_DETECTION_RUNTIME_COUNT,
  D5_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT,
  D5_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT,
  D5_CROSS_DISCIPLINE_RECOMMENDATION_RUNTIME_COUNT,
  D5_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT,
  D5_D9_RUNTIME_INTEGRATION_COUNT,
  D5_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
  D5_DESIGN_CONDITION_SPECIFICATION_RUNTIME_COUNT,
  D5_DESIGN_CONDITION_SPECIFICATION_RUNTIME_IMPLEMENTED,
  D5_DESIGN_CONDITION_SPECIFICATION_RUNTIME_READY,
  D5_DISCIPLINE_INTERFACE_RUNTIME_COUNT,
  D5_EQUALS_D1_STRUCTURAL_AUTHORITY,
  D5_EQUALS_D2_CIVIL_AUTHORITY,
  D5_EQUALS_D3_GEOTECHNICAL_AUTHORITY,
  D5_EQUALS_D4_MECHANICAL_AUTHORITY,
  D5_EQUALS_D6_PROCESS_AUTHORITY,
  D5_EQUALS_D7_ELECTRICAL_AUTHORITY,
  D5_EQUALS_D8_INSTRUMENTATION_CONTROL_AUTHORITY,
  D5_FLEXIBILITY_CALCULATION_RUNTIME_COUNT,
  D5_FLANGE_RATING_CALCULATION_RUNTIME_COUNT,
  D5_HYDRAULIC_CALCULATION_RUNTIME_COUNT,
  D5_MATERIAL_CONTEXT_EQUALS_MATERIAL_SELECTION_CALCULATION,
  D5_MATERIAL_CONTEXT_EQUALS_VALIDATED_MATERIAL_SELECTION,
  D5_PIPE_SIZING_RUNTIME_COUNT,
  D5_PIPING_CLASS_CONTEXT_IMPLEMENTED,
  D5_PIPING_DESIGN_CONDITION_CONTEXT_IMPLEMENTED,
  D5_PIPING_IDENTITY_OBJECT_FOUNDATION_RUNTIME_READY,
  D5_PIPING_MATERIAL_CONTEXT_IMPLEMENTED,
  D5_PIPING_SPECIFICATION_CONTEXT_IMPLEMENTED,
  D5_PIPING_STRESS_CALCULATION_RUNTIME_COUNT,
  D5_PRESSURE_DROP_CALCULATION_RUNTIME_COUNT,
  D5_PROCESS_CONDITION_SOURCE_REFERENCE_SUPPORTED,
  D5_R1_IDENTITY_REUSED,
  D5_R2_SERVICE_CONTEXT_REFERENCE_SUPPORTED,
  D5_R2_SYSTEM_LINE_SERVICE_CONTEXT_REUSED,
  D5_R3_APPLICABILITY_EXPLICIT,
  D5_R3_AUTO_MUTATES_R2_SERVICE_CONTEXT,
  D5_R3_AUTO_PROPAGATED_OUTSIDE_APPLICABILITY,
  D5_R3_AUTO_REPOINTED,
  D5_R3_AUTOMATIC_PIPING_CLASS_ASSIGNMENT_ALLOWED,
  D5_R3_AUTOMATIC_SPECIFICATION_ASSIGNMENT_ALLOWED,
  D5_R3_BLOCKER,
  D5_R3_CANONICAL_NEXT_PHASE,
  D5_R3_CANONICAL_NEXT_PHASE_SCOPE,
  D5_R3_DUPLICATE_GOVERNANCE_IMPLEMENTED,
  D5_R3_HIDDEN_CALCULATION_ALLOWED,
  D5_R3_HISTORY_PRESERVED,
  D5_R3_LIMITATIONS_EXPLICIT,
  D5_R3_MATURITY,
  D5_R3_NEXT_PHASE_TYPE,
  D5_R3_PROVENANCE_PRESERVED,
  D5_R3_PROVENANCE_REQUIRED,
  D5_R3_REPLAY_PROTECTION_IMPLEMENTED,
  D5_R3_SOURCE_AUTO_REPOINTED,
  D5_R3_SOURCE_BASIS_REQUIRED,
  D5_R3_SOURCE_BASIS_TRACEABLE,
  D5_R3_SPOOFING_PROTECTION_IMPLEMENTED,
  D5_R3_STATUS,
  D5_R3_UNITS_PRESERVED,
  D5_R3_UNITS_REQUIRED,
  D5_R4_STARTED,
  D5_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_COUNT,
  D5_REUSES_CANONICAL_CURRENTNESS,
  D5_REUSES_CANONICAL_FINGERPRINT,
  D5_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_COUNT,
  D5_ROUTE_OPTIMIZATION_RUNTIME_COUNT,
  D5_ROUTING_ARRANGEMENT_FABRICATION_RUNTIME_COUNT,
  D5_RUNTIME_COUNT,
  D5_RUNTIME_STARTED,
  D5_SPATIAL_CLASH_DETECTION_RUNTIME_COUNT,
  D5_STRESS_SUPPORT_TEST_EVIDENCE_RUNTIME_COUNT,
  D5_SUPPORT_LOAD_CALCULATION_RUNTIME_COUNT,
  D5_SYSTEM_LINE_SERVICE_CONTEXT_RUNTIME_READY,
  D5_WALL_THICKNESS_CALCULATION_RUNTIME_COUNT,
  D6_RUNTIME_STARTED,
  D7_RUNTIME_STARTED,
  D8_RUNTIME_STARTED,
  D9_RUNTIME_COUNT,
  D9_RUNTIME_STARTED,
  DATABASE_SCHEMA_CHANGED,
  EXACT_D5_R1_R2_REFERENCE_REQUIRED,
  FLOATING_D5_R3_SOURCE_REFERENCE_ALLOWED,
  NEW_DEPENDENCY_ADDED,
  PARALLEL_D5_CURRENTNESS_ENGINE_CREATED,
  PIPING_CLASS_EQUALS_VALIDATED_MATERIAL_SELECTION,
  PIPING_DESIGN_CONDITION_EQUALS_CALCULATED_RESULT,
  PIPING_DESIGN_CONDITION_EQUALS_CODE_CONFORMANCE,
  PIPING_DESIGN_CONDITION_EQUALS_VALIDATED_PIPING_DESIGN,
  PIPING_SPECIFICATION_EQUALS_ENGINEERING_VALIDATED,
  PIPING_SPECIFICATION_REFERENCE_EQUALS_CODE_CONFORMANCE,
  PROCESS_CONDITION_AUTO_ADOPTED_AS_PIPING_DESIGN_CONDITION,
  PROCESS_CONDITION_EQUALS_PIPING_DESIGN_CONDITION,
  SECOND_D5_FINGERPRINT_ALGORITHM_CREATED,
  SERVICE_CONTEXT_AUTO_DETERMINES_DESIGN_CONDITION,
  SERVICE_CONTEXT_AUTO_DETERMINES_PIPING_SPECIFICATION,
  SILENT_D5_R3_MUTATION_ALLOWED,
  SOURCE_CONDITION_EQUALS_ADOPTED_PIPING_DESIGN_CONDITION,
  TENANT_WORKSPACE_PROJECT_D5_R3_SCOPE_ENFORCED,
  calculatePiping,
  createD5R3Store,
  determinePipingConformance,
  recordPipingComponent,
  recordPipingDesignCondition,
  recordPipingRoute,
  recordPipingSpecificationContext,
  recordPipingStressSupport,
  repointPipingDesignCondition,
  validatePipingEngineering,
} from "./design-condition-specification-context";

const here = dirname(fileURLToPath(import.meta.url));
const actor: D5R1Actor = {
  actorId: "piping-recorder",
  tenantId: "tenant-a",
  workspaceId: "workspace-a",
  projectId: "project-a",
  authority: "PIPING_CONTEXT_AUTHORITY",
};

function throws(run: () => void): string {
  try {
    run();
  } catch (error) {
    return error instanceof Error ? error.message : "";
  }
  return "";
}

describe("EOS-D5-R3 piping design conditions and specification context", () => {
  it("records adopted design conditions and specification context without calculating them", () => {
    expect(D5_R3_STATUS).toBe("DESIGN_CONDITIONS_AND_SPECIFICATION_CONTEXT_IMPLEMENTED");
    expect(D5_R3_MATURITY).toBe(D5_R3_STATUS);
    expect(D5_RUNTIME_STARTED).toBe(true);
    expect(D5_RUNTIME_COUNT).toBe(3);
    expect(R1_RUNTIME_COUNT).toBe(1);
    expect(R2_RUNTIME_COUNT).toBe(2);
    expect(R2_DESIGN_COUNT).toBe(0);
    expect(ARCHITECTURE_D5_RUNTIME_COUNT).toBe(0);
    expect(D5_R3_STARTED).toBe(false);
    expect(D5_R4_STARTED).toBe(false);
    expect(D5_PIPING_IDENTITY_OBJECT_FOUNDATION_RUNTIME_READY).toBe(true);
    expect(D5_SYSTEM_LINE_SERVICE_CONTEXT_RUNTIME_READY).toBe(true);
    expect(D5_R1_IDENTITY_REUSED).toBe(true);
    expect(D5_R2_SYSTEM_LINE_SERVICE_CONTEXT_REUSED).toBe(true);
    expect(EXACT_D5_R1_R2_REFERENCE_REQUIRED).toBe(true);
    expect(FLOATING_D5_R3_SOURCE_REFERENCE_ALLOWED).toBe(false);
    expect(D5_R3_SOURCE_AUTO_REPOINTED).toBe(false);
    expect(D5_DESIGN_CONDITION_SPECIFICATION_RUNTIME_IMPLEMENTED).toBe(true);
    expect(D5_DESIGN_CONDITION_SPECIFICATION_RUNTIME_COUNT).toBe(1);
    expect(D5_DESIGN_CONDITION_SPECIFICATION_RUNTIME_READY).toBe(true);
    expect(D5_PIPING_DESIGN_CONDITION_CONTEXT_IMPLEMENTED).toBe(true);
    expect(D5_R3_SOURCE_BASIS_REQUIRED).toBe(true);
    expect(D5_R3_SOURCE_BASIS_TRACEABLE).toBe(true);
    expect(BASISLESS_AUTHORITATIVE_D5_R3_RECORD_AUTO_ACCEPTED).toBe(false);
    expect(D5_PROCESS_CONDITION_SOURCE_REFERENCE_SUPPORTED).toBe(true);
    expect(PROCESS_CONDITION_EQUALS_PIPING_DESIGN_CONDITION).toBe(false);
    expect(SOURCE_CONDITION_EQUALS_ADOPTED_PIPING_DESIGN_CONDITION).toBe(false);
    expect(PROCESS_CONDITION_AUTO_ADOPTED_AS_PIPING_DESIGN_CONDITION).toBe(false);
    expect(D5_CREATES_AUTHORITATIVE_PROCESS_CONDITION).toBe(false);
    expect(PIPING_DESIGN_CONDITION_EQUALS_CALCULATED_RESULT).toBe(false);
    expect(PIPING_DESIGN_CONDITION_EQUALS_VALIDATED_PIPING_DESIGN).toBe(false);
    expect(PIPING_DESIGN_CONDITION_EQUALS_CODE_CONFORMANCE).toBe(false);
    expect(D5_R3_UNITS_REQUIRED).toBe(true);
    expect(D5_R3_UNITS_PRESERVED).toBe(true);
    expect(AI_CAN_SILENTLY_CHANGE_D5_R3_UNITS).toBe(false);
    expect(D5_PIPING_SPECIFICATION_CONTEXT_IMPLEMENTED).toBe(true);
    expect(D5_PIPING_CLASS_CONTEXT_IMPLEMENTED).toBe(true);
    expect(PIPING_SPECIFICATION_REFERENCE_EQUALS_CODE_CONFORMANCE).toBe(false);
    expect(PIPING_CLASS_EQUALS_VALIDATED_MATERIAL_SELECTION).toBe(false);
    expect(PIPING_SPECIFICATION_EQUALS_ENGINEERING_VALIDATED).toBe(false);
    expect(D5_CODE_STANDARD_REFERENCE_SUPPORTED).toBe(true);
    expect(CODE_STANDARD_REFERENCE_EQUALS_CONFORMANCE).toBe(false);
    expect(CODE_STANDARD_REFERENCE_EQUALS_CERTIFICATION).toBe(false);
    expect(D5_PIPING_MATERIAL_CONTEXT_IMPLEMENTED).toBe(true);
    expect(D5_MATERIAL_CONTEXT_EQUALS_MATERIAL_SELECTION_CALCULATION).toBe(false);
    expect(D5_MATERIAL_CONTEXT_EQUALS_VALIDATED_MATERIAL_SELECTION).toBe(false);
    expect(D5_R2_SERVICE_CONTEXT_REFERENCE_SUPPORTED).toBe(true);
    expect(D5_R3_AUTO_MUTATES_R2_SERVICE_CONTEXT).toBe(false);
    expect(SERVICE_CONTEXT_AUTO_DETERMINES_PIPING_SPECIFICATION).toBe(false);
    expect(SERVICE_CONTEXT_AUTO_DETERMINES_DESIGN_CONDITION).toBe(false);
    expect(D5_R3_APPLICABILITY_EXPLICIT).toBe(true);
    expect(D5_R3_LIMITATIONS_EXPLICIT).toBe(true);
    expect(D5_R3_AUTO_PROPAGATED_OUTSIDE_APPLICABILITY).toBe(false);
    expect(D5_R3_AUTOMATIC_SPECIFICATION_ASSIGNMENT_ALLOWED).toBe(false);
    expect(D5_R3_AUTOMATIC_PIPING_CLASS_ASSIGNMENT_ALLOWED).toBe(false);
    expect(D5_R3_HIDDEN_CALCULATION_ALLOWED).toBe(false);
    expect(AI_EQUALS_D5_PIPING_ENGINEERING_AUTHORITY).toBe(false);
    expect(ADMIN_EQUALS_D5_PIPING_ENGINEERING_AUTHORITY).toBe(false);
    expect(AI_CAN_INVENT_AUTHORITATIVE_D5_DESIGN_CONDITION).toBe(false);
    expect(AI_CAN_INVENT_AUTHORITATIVE_D5_SPECIFICATION).toBe(false);
    expect(AI_CAN_PROMOTE_SOURCE_CONDITION_TO_ADOPTED_PIPING_CONDITION).toBe(false);
    expect(ADMIN_CAN_PROMOTE_SOURCE_DATA_TO_PIPING_ENGINEERING_TRUTH).toBe(false);
    expect(D5_EQUALS_D6_PROCESS_AUTHORITY).toBe(false);
    expect(D5_EQUALS_D1_STRUCTURAL_AUTHORITY).toBe(false);
    expect(D5_EQUALS_D4_MECHANICAL_AUTHORITY).toBe(false);
    expect(D5_R3_DUPLICATE_GOVERNANCE_IMPLEMENTED).toBe(true);
    expect(D5_R3_REPLAY_PROTECTION_IMPLEMENTED).toBe(true);
    expect(D5_R3_SPOOFING_PROTECTION_IMPLEMENTED).toBe(true);
    expect(D5_REUSES_CANONICAL_CURRENTNESS).toBe(true);
    expect(PARALLEL_D5_CURRENTNESS_ENGINE_CREATED).toBe(false);
    expect(D5_REUSES_CANONICAL_FINGERPRINT).toBe(true);
    expect(SECOND_D5_FINGERPRINT_ALGORITHM_CREATED).toBe(false);
    expect(D5_R3_PROVENANCE_REQUIRED).toBe(true);
    expect(D5_R3_PROVENANCE_PRESERVED).toBe(true);
    expect(D5_R3_AUTO_REPOINTED).toBe(false);
    expect(SILENT_D5_R3_MUTATION_ALLOWED).toBe(false);
    expect(D5_R3_HISTORY_PRESERVED).toBe(true);
    expect(TENANT_WORKSPACE_PROJECT_D5_R3_SCOPE_ENFORCED).toBe(true);
    expect(D1_STRUCTURAL_PACK_COMPLETE).toBe(false);
    expect(D1N_REOPENED).toBe(false);
    expect(D2_TRACK_COMPLETE).toBe(true);
    expect(D2_REOPENED).toBe(false);
    expect(D3_TRACK_COMPLETE).toBe(true);
    expect(D3_REOPENED).toBe(false);
    expect(D4_TRACK_COMPLETE).toBe(true);
    expect(D4_REOPENED).toBe(false);
    expect(D6_RUNTIME_STARTED).toBe(false);
    expect(D7_RUNTIME_STARTED).toBe(false);
    expect(D8_RUNTIME_STARTED).toBe(false);
    expect(D9_RUNTIME_STARTED).toBe(false);
    expect(D9_RUNTIME_COUNT).toBe(0);
    expect(DATABASE_SCHEMA_CHANGED).toBe(false);
    expect(NEW_DEPENDENCY_ADDED).toBe(false);
    expect(D5_EQUALS_D2_CIVIL_AUTHORITY).toBe(false);
    expect(D5_EQUALS_D3_GEOTECHNICAL_AUTHORITY).toBe(false);
    expect(D5_EQUALS_D7_ELECTRICAL_AUTHORITY).toBe(false);
    expect(D5_EQUALS_D8_INSTRUMENTATION_CONTROL_AUTHORITY).toBe(false);
    expect([
      D5_COMPONENT_CONNECTION_VALVE_RUNTIME_COUNT, D5_ROUTING_ARRANGEMENT_FABRICATION_RUNTIME_COUNT,
      D5_STRESS_SUPPORT_TEST_EVIDENCE_RUNTIME_COUNT, D5_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_COUNT,
      D5_DISCIPLINE_INTERFACE_RUNTIME_COUNT, D5_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_COUNT,
      D5_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT, D5_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
      D5_D9_RUNTIME_INTEGRATION_COUNT, D5_PIPE_SIZING_RUNTIME_COUNT, D5_HYDRAULIC_CALCULATION_RUNTIME_COUNT,
      D5_PRESSURE_DROP_CALCULATION_RUNTIME_COUNT, D5_WALL_THICKNESS_CALCULATION_RUNTIME_COUNT,
      D5_BRANCH_REINFORCEMENT_CALCULATION_RUNTIME_COUNT, D5_FLANGE_RATING_CALCULATION_RUNTIME_COUNT,
      D5_PIPING_STRESS_CALCULATION_RUNTIME_COUNT, D5_FLEXIBILITY_CALCULATION_RUNTIME_COUNT,
      D5_SUPPORT_LOAD_CALCULATION_RUNTIME_COUNT, D5_ROUTE_OPTIMIZATION_RUNTIME_COUNT,
      D5_AUTOMATIC_ROUTING_RUNTIME_COUNT, D5_SPATIAL_CLASH_DETECTION_RUNTIME_COUNT,
      D5_AUTOMATIC_REDESIGN_RUNTIME_COUNT, D5_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT,
      D5_CONFORMANCE_DETERMINATION_RUNTIME_COUNT, D5_APPROVAL_RUNTIME_COUNT, D5_CERTIFICATION_RUNTIME_COUNT,
      D5_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT, D5_CROSS_DISCIPLINE_CONFLICT_DETECTION_RUNTIME_COUNT,
      D5_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT, D5_CROSS_DISCIPLINE_RECOMMENDATION_RUNTIME_COUNT,
    ].every((count) => count === 0)).toBe(true);
    expect(D5_R3_CANONICAL_NEXT_PHASE).toBe("EOS-D5-R4-COMPONENT-CONNECTION-AND-VALVE-CONTEXT");
    expect(D5_R3_NEXT_PHASE_TYPE).toBe("COMPONENT_CONNECTION_AND_VALVE_CONTEXT");
    expect(D5_R3_CANONICAL_NEXT_PHASE_SCOPE).toContain("exact R1-R3 identities");
    expect(D5_R3_BLOCKER).toBe("NONE");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D5.R3.DESIGN_CONDITIONS_AND_SPECIFICATION_CONTEXT")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D5.R4.COMPONENT_CONNECTION_AND_VALVE_CONTEXT")?.implementationState).toBe("IMPLEMENTED_BOUNDED");

    const r1 = createD5R1Store();
    recordPipingContext(r1, actor, { contextId: "ctx-1", citedLifecycleStage: "FEED", provenanceRef: "prov-ctx" });
    const system = recordPipingObjectIdentity(r1, actor, { objectId: "sys-1", contextId: "ctx-1", objectType: "PIPING_SYSTEM_CONTEXT", citedLifecycleStage: "FEED", provenanceRef: "prov-sys" });
    const line = recordPipingObjectIdentity(r1, actor, { objectId: "line-1", contextId: "ctx-1", objectType: "PIPING_LINE", citedLifecycleStage: "FEED", provenanceRef: "prov-line" });
    const serviceIdentity = recordPipingObjectIdentity(r1, actor, { objectId: "svc-1", contextId: "ctx-1", objectType: "PIPING_SERVICE_CONTEXT", citedLifecycleStage: "FEED", provenanceRef: "prov-svc" });
    const r2 = createD5R2Store(r1);
    const bound = { contextId: "ctx-1", citedLifecycleStage: "FEED", provenanceRef: "prov-r2", sourceBasisRef: "basis-a", citedCurrentness: "CURRENT" };
    recordPipingSystemContext(r2, actor, { ...bound, objectId: system.objectId, objectRevisionFingerprint: system.fingerprint, systemRecordId: "sys-ctx", systemName: "Cooling water", systemDescription: "Utility", systemClassification: "UTILITY_PIPING_SYSTEM", systemFunction: "SUPPLY", grouping: "utilities", applicableScope: "unit-10" });
    const lineContext = recordPipingLineContext(r2, actor, { ...bound, objectId: line.objectId, objectRevisionFingerprint: line.fingerprint, lineRecordId: "line-ctx", lineTag: "CW-100", lineDescription: "Supply", lineClassification: "UTILITY_LINE", lineFunction: "SUPPLY", applicableScope: "unit-10" });
    const service = recordPipingServiceFunction(r2, actor, { ...bound, objectId: serviceIdentity.objectId, objectRevisionFingerprint: serviceIdentity.fingerprint, serviceRecordId: "svc-ctx", serviceFunction: "SUPPLY", serviceDescription: "Supplies cooling water", applicableScope: "unit-10" });
    const serviceBefore = JSON.stringify(r2.services);
    const store = createD5R3Store(r1, r2);
    const common = {
      contextId: "ctx-1", objectId: line.objectId, objectRevisionFingerprint: line.fingerprint,
      lineRecordId: lineContext.lineRecordId, lineContextFingerprint: lineContext.fingerprint,
      serviceRecordId: service.serviceRecordId, serviceContextFingerprint: service.fingerprint,
      citedLifecycleStage: "FEED", citedCurrentness: "CURRENT", provenanceRef: "prov-r3",
      sourceBasisRef: "project-basis-cw", sourceBasisCategory: "PIPING_DESIGN_BASIS",
      applicabilityRef: line.objectId, limitations: "Unit 10 cooling water only", processSourceRef: "process-source-p100",
    };
    const condition = recordPipingDesignCondition(store, actor, {
      ...common, conditionId: "cond-1", adoption: "EXPLICIT",
      designPressure: { value: "10", unit: "bar" }, designTemperature: { value: "80", unit: "degC" },
    });
    expect(condition.designPressure).toEqual({ value: "10", unit: "bar" });
    expect(condition.adoptedPipingDesignCondition).toBe(true);
    expect(condition.processConditionEqualsDesignCondition).toBe(false);
    expect(condition.sourceEqualsAdoptedCondition).toBe(false);
    expect(condition.calculatedResult).toBe(false);
    expect(condition.validatedPipingDesign).toBe(false);
    expect(condition.codeConformance).toBe(false);
    expect(condition.processSourceRef).toBe("process-source-p100");
    expect(JSON.stringify(r2.services)).toBe(serviceBefore);
    expect(recordPipingDesignCondition(store, actor, {
      ...common, conditionId: "cond-1", adoption: "EXPLICIT",
      designPressure: { value: "10", unit: "bar" }, designTemperature: { value: "80", unit: "degC" },
    })).toBe(condition);
    const specification = recordPipingSpecificationContext(store, actor, {
      ...common, specificationId: "spec-1", specificationRef: "CW-CLASS-A", pipingClass: "A1",
      materialFamily: "CARBON_STEEL", pressureRatingContext: "Class 150 reference", flangeRatingContext: "ASME B16.5 class 150 reference",
      wallScheduleContext: "Schedule 40 reference", codeStandardRef: "ASME B31.3 reference", assignmentBasis: "EXPLICIT",
    });
    expect(specification.codeConformance).toBe(false);
    expect(specification.certified).toBe(false);
    expect(specification.engineeringValidated).toBe(false);
    expect(specification.materialSelectionCalculated).toBe(false);
    expect(specification.materialValidated).toBe(false);
    expect(specification.classValidated).toBe(false);
    expect(specification.automaticAssignment).toBe(false);
    expect(JSON.stringify(r2.services)).toBe(serviceBefore);
    expect(throws(() => recordPipingDesignCondition(store, actor, {
      ...common, conditionId: "cond-auto", adoption: "EXPLICIT", autoAdopt: true,
      designPressure: { value: "10", unit: "bar" }, designTemperature: { value: "80", unit: "degC" },
    }))).toBe("D5_R3_PROCESS_CONDITION_NOT_AUTO_ADOPTED");
    expect(throws(() => recordPipingDesignCondition(store, actor, {
      ...common, conditionId: "cond-unit", adoption: "EXPLICIT",
      designPressure: { value: "10", unit: "bar", normalizedUnit: "kPa" }, designTemperature: { value: "80", unit: "degC" },
    }))).toBe("D5_R3_UNIT_CHANGE_REJECTED");
    expect(throws(() => recordPipingDesignCondition(store, actor, {
      ...common, conditionId: "cond-nounit", adoption: "EXPLICIT",
      designPressure: { value: "10", unit: "" }, designTemperature: { value: "80", unit: "degC" },
    }))).toBe("D5_R3_UNITS_REQUIRED");
    expect(throws(() => recordPipingDesignCondition(store, actor, {
      ...common, sourceBasisRef: "", conditionId: "cond-basis", adoption: "EXPLICIT",
      designPressure: { value: "10", unit: "bar" }, designTemperature: { value: "80", unit: "degC" },
    }))).toBe("D5_R3_SOURCE_BASIS_REQUIRED");
    expect(throws(() => recordPipingDesignCondition(store, actor, {
      ...common, objectRevisionFingerprint: "latest", conditionId: "cond-float", adoption: "EXPLICIT",
      designPressure: { value: "10", unit: "bar" }, designTemperature: { value: "80", unit: "degC" },
    }))).toBe("D5_R3_R1_REVISION_REQUIRED");
    expect(throws(() => recordPipingSpecificationContext(store, actor, {
      ...common, specificationId: "spec-infer", specificationRef: "CW-CLASS-B", pipingClass: "B1",
      materialFamily: "STAINLESS", pressureRatingContext: "reference", flangeRatingContext: "reference",
      wallScheduleContext: "reference", codeStandardRef: "ASME B31.3 reference", assignmentBasis: "service_name",
    }))).toBe("D5_R3_AUTOMATIC_ASSIGNMENT_REJECTED");
    expect(throws(() => recordPipingSpecificationContext(store, actor, {
      ...common, applicabilityRef: "line-other", specificationId: "spec-scope", specificationRef: "CW-CLASS-C", pipingClass: "C1",
      materialFamily: "CARBON_STEEL", pressureRatingContext: "reference", flangeRatingContext: "reference",
      wallScheduleContext: "reference", codeStandardRef: "ASME B31.3 reference", assignmentBasis: "EXPLICIT",
    }))).toBe("D5_R3_APPLICABILITY_MISMATCH");
    expect(throws(() => recordPipingDesignCondition(store, { ...actor, authority: "ADMIN" }, {
      ...common, conditionId: "cond-admin", adoption: "EXPLICIT",
      designPressure: { value: "10", unit: "bar" }, designTemperature: { value: "80", unit: "degC" },
    }))).toBe("D5_R3_ADMIN_NOT_PIPING_AUTHORITY");
    expect(throws(() => recordPipingDesignCondition(store, { ...actor, actorId: "AI-recorder" }, {
      ...common, conditionId: "cond-ai", adoption: "EXPLICIT",
      designPressure: { value: "10", unit: "bar" }, designTemperature: { value: "80", unit: "degC" },
    }))).toBe("D5_R3_AI_NOT_PIPING_AUTHORITY");
    expect(throws(() => recordPipingDesignCondition(store, actor, {
      ...common, conditionId: "cond-spoof", adoption: "EXPLICIT", assertedFingerprint: "not-canonical",
      designPressure: { value: "11", unit: "bar" }, designTemperature: { value: "80", unit: "degC" },
    }))).toBe("D5_R3_FINGERPRINT_MISMATCH");
    const revised = recordPipingDesignCondition(store, actor, {
      ...common, conditionId: "cond-2", adoption: "EXPLICIT", predecessorConditionId: "cond-1",
      designPressure: { value: "12", unit: "bar" }, designTemperature: { value: "80", unit: "degC" },
    });
    expect(revised.predecessorConditionId).toBe("cond-1");
    expect(store.conditions.find((row) => row.conditionId === "cond-1")?.fingerprint).toBe(condition.fingerprint);
    expect(store.conditions.find((row) => row.conditionId === "cond-1")?.currentness).toBe("SUPERSEDED");
    expect(store.history.some((row) => row.subjectId === "cond-1" && row.fingerprint === condition.fingerprint)).toBe(true);
    expect(throws(() => repointPipingDesignCondition())).toBe("D5_R3_AUTO_REPOINT_REJECTED");
    expect(throws(() => recordPipingComponent())).toBe("D5_R3_COMPONENT_NOT_IN_R3");
    expect(throws(() => recordPipingRoute())).toBe("D5_R3_ROUTING_NOT_IN_R3");
    expect(throws(() => recordPipingStressSupport())).toBe("D5_R3_STRESS_SUPPORT_NOT_IN_R3");
    expect(throws(() => calculatePiping())).toBe("D5_R3_CALCULATION_NOT_IN_R3");
    expect(throws(() => validatePipingEngineering())).toBe("D5_R3_VALIDATION_NOT_IN_R3");
    expect(throws(() => determinePipingConformance())).toBe("D5_R3_CONFORMANCE_NOT_IN_R3");
    const source = readFileSync(join(here, "design-condition-specification-context.ts"), "utf8");
    expect(scanAnalysisFormulaBypass("design-condition-specification-context.ts", source)).toEqual([]);
    expect(source.includes("createHash")).toBe(false);
    const packageJson = JSON.parse(readFileSync(join(here, "../../package.json"), "utf8")) as { dependencies: Record<string, string> };
    expect(Object.keys(packageJson.dependencies)).toContain("zod");
    expect(Object.keys(packageJson.dependencies)).not.toContain("@rtb/piping-solver");
  });
});
