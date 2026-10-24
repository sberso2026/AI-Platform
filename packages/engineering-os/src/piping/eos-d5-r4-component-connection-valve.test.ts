import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { D5_RUNTIME_COUNT as ARCHITECTURE_D5_RUNTIME_COUNT, D5_RUNTIME_STARTED as TYPES_D5_RUNTIME_STARTED } from "@rtb/types";
import { describe, expect, it } from "vitest";
import { createD4R1Store, recordMechanicalContext, recordMechanicalObjectIdentity, type D4R1Actor } from "../mechanical/identity-foundation";
import { STRUCTURAL_CAPABILITY_MANIFEST } from "../structural-concrete/capability";
import { scanAnalysisFormulaBypass } from "../structural-systems/formula-scan";
import { D5_RUNTIME_COUNT as R1_RUNTIME_COUNT, createD5R1Store, recordPipingContext, recordPipingObjectIdentity, type D5R1Actor } from "./identity-foundation";
import { D5_RUNTIME_COUNT as R2_RUNTIME_COUNT, createD5R2Store, recordPipingLineContext, recordPipingServiceFunction, recordPipingSystemContext } from "./system-line-service-context";
import {
  D5_COMPONENT_CONNECTION_VALVE_RUNTIME_COUNT as R3_COMPONENT_COUNT,
  D5_R4_STARTED,
  D5_RUNTIME_COUNT as R3_RUNTIME_COUNT,
  createD5R3Store,
  recordPipingSpecificationContext,
} from "./design-condition-specification-context";
import {
  ADMIN_CAN_PROMOTE_CANDIDATE_COMPONENT_TO_ENGINEERING_TRUTH,
  ADMIN_EQUALS_D5_PIPING_ENGINEERING_AUTHORITY,
  AI_CAN_INVENT_AUTHORITATIVE_D5_COMPONENT,
  AI_CAN_INVENT_AUTHORITATIVE_D5_CONNECTION,
  AI_CAN_INVENT_AUTHORITATIVE_D5_VALVE,
  AI_EQUALS_D5_PIPING_ENGINEERING_AUTHORITY,
  BASISLESS_AUTHORITATIVE_D5_R4_RECORD_AUTO_ACCEPTED,
  BRANCH_CONNECTION_CONTEXT_EQUALS_BRANCH_REINFORCEMENT_CALCULATION,
  BRANCH_CONNECTION_CONTEXT_EQUALS_CODE_COMPLIANT_BRANCH,
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
  D5_BRANCH_CONNECTION_CONTEXT_SUPPORTED,
  D5_BRANCH_REINFORCEMENT_CALCULATION_RUNTIME_COUNT,
  D5_CERTIFICATION_RUNTIME_COUNT,
  D5_COMPONENT_CONNECTION_VALVE_RUNTIME_COUNT,
  D5_COMPONENT_CONNECTION_VALVE_RUNTIME_IMPLEMENTED,
  D5_COMPONENT_CONNECTION_VALVE_RUNTIME_READY,
  D5_COMPONENT_IDENTITY_REQUIRED,
  D5_COMPONENT_SIZING_RUNTIME_COUNT,
  D5_CONFORMANCE_DETERMINATION_RUNTIME_COUNT,
  D5_CROSS_DISCIPLINE_CONFLICT_DETECTION_RUNTIME_COUNT,
  D5_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT,
  D5_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT,
  D5_CROSS_DISCIPLINE_RECOMMENDATION_RUNTIME_COUNT,
  D5_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT,
  D5_D4_EQUIPMENT_CONNECTION_REFERENCE_SUPPORTED,
  D5_D9_RUNTIME_INTEGRATION_COUNT,
  D5_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
  D5_DESIGN_CONDITION_SPECIFICATION_RUNTIME_READY,
  D5_DISCIPLINE_INTERFACE_RUNTIME_COUNT,
  D5_EQUALS_D1_STRUCTURAL_AUTHORITY,
  D5_EQUALS_D2_CIVIL_AUTHORITY,
  D5_EQUALS_D3_GEOTECHNICAL_AUTHORITY,
  D5_EQUALS_D4_MECHANICAL_AUTHORITY,
  D5_EQUALS_D6_PROCESS_AUTHORITY,
  D5_EQUALS_D7_ELECTRICAL_AUTHORITY,
  D5_EQUALS_D8_INSTRUMENTATION_CONTROL_AUTHORITY,
  D5_EXPLICIT_CONNECTION_RELATIONSHIP_REQUIRED,
  D5_FLANGE_CONTEXT_SUPPORTED,
  D5_FLANGE_RATING_CALCULATION_RUNTIME_COUNT,
  D5_FLEXIBILITY_CALCULATION_RUNTIME_COUNT,
  D5_HYDRAULIC_CALCULATION_RUNTIME_COUNT,
  D5_INFERRED_COMPONENT_IDENTITY_ALLOWED,
  D5_INFERRED_CONNECTION_RELATIONSHIP_ALLOWED,
  D5_PIPE_SIZING_RUNTIME_COUNT,
  D5_PIPING_COMPONENT_CONTEXT_IMPLEMENTED,
  D5_PIPING_CONNECTION_CONTEXT_IMPLEMENTED,
  D5_PIPING_IDENTITY_OBJECT_FOUNDATION_RUNTIME_READY,
  D5_PIPING_SPECIALTY_CONTEXT_IMPLEMENTED,
  D5_PIPING_STRESS_CALCULATION_RUNTIME_COUNT,
  D5_PIPING_VALVE_CONTEXT_IMPLEMENTED,
  D5_PRESSURE_DROP_CALCULATION_RUNTIME_COUNT,
  D5_R1_IDENTITY_REUSED,
  D5_R2_SYSTEM_LINE_SERVICE_CONTEXT_REUSED,
  D5_R3_DESIGN_CONDITION_SPECIFICATION_CONTEXT_REUSED,
  D5_R3_SPECIFICATION_CLASS_REFERENCE_SUPPORTED,
  D5_R4_APPLICABILITY_EXPLICIT,
  D5_R4_AUTO_PROPAGATED_OUTSIDE_APPLICABILITY,
  D5_R4_AUTO_REPOINTED,
  D5_R4_AUTOMATIC_COMPONENT_SELECTION_ALLOWED,
  D5_R4_AUTOMATIC_SPECIALTY_SELECTION_ALLOWED,
  D5_R4_AUTOMATIC_VALVE_SELECTION_ALLOWED,
  D5_R4_BLOCKER,
  D5_R4_CANONICAL_NEXT_PHASE,
  D5_R4_CANONICAL_NEXT_PHASE_SCOPE,
  D5_R4_DIMENSION_CONTEXT_EQUALS_CALCULATED_SIZE,
  D5_R4_DUPLICATE_GOVERNANCE_IMPLEMENTED,
  D5_R4_HIDDEN_CALCULATION_ALLOWED,
  D5_R4_HISTORY_PRESERVED,
  D5_R4_INFERRED_D4_COUNTERPART_ALLOWED,
  D5_R4_LIMITATIONS_EXPLICIT,
  D5_R4_MATURITY,
  D5_R4_MISSING_D4_COUNTERPART_AUTO_FABRICATED,
  D5_R4_NEXT_PHASE_TYPE,
  D5_R4_PROVENANCE_PRESERVED,
  D5_R4_PROVENANCE_REQUIRED,
  D5_R4_RATING_CONTEXT_EQUALS_CALCULATED_PRESSURE_RATING,
  D5_R4_REPLAY_PROTECTION_IMPLEMENTED,
  D5_R4_SOURCE_AUTO_REPOINTED,
  D5_R4_SOURCE_BASIS_REQUIRED,
  D5_R4_SOURCE_BASIS_TRACEABLE,
  D5_R4_SPOOFING_PROTECTION_IMPLEMENTED,
  D5_R4_STATUS,
  D5_R5_STARTED,
  D5_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_COUNT,
  D5_REUSES_CANONICAL_CURRENTNESS,
  D5_REUSES_CANONICAL_FINGERPRINT,
  D5_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_COUNT,
  D5_ROUTING_ARRANGEMENT_FABRICATION_RUNTIME_COUNT,
  D5_RUNTIME_COUNT,
  D5_RUNTIME_STARTED,
  D5_STRESS_SUPPORT_TEST_EVIDENCE_RUNTIME_COUNT,
  D5_SUPPORT_LOAD_CALCULATION_RUNTIME_COUNT,
  D5_SYSTEM_LINE_SERVICE_CONTEXT_RUNTIME_READY,
  D5_VALVE_SIZING_RUNTIME_COUNT,
  D5_WALL_THICKNESS_CALCULATION_RUNTIME_COUNT,
  D6_RUNTIME_STARTED,
  D7_RUNTIME_STARTED,
  D8_RUNTIME_STARTED,
  D9_RUNTIME_COUNT,
  D9_RUNTIME_STARTED,
  DATABASE_SCHEMA_CHANGED,
  EXACT_D4_EQUIPMENT_INTERFACE_REVISION_REQUIRED,
  EXACT_D5_R1_R3_REFERENCE_REQUIRED,
  EXACT_D5_R3_SPECIFICATION_CLASS_REVISION_REQUIRED,
  FLANGE_CONTEXT_EQUALS_CODE_CONFORMANCE,
  FLANGE_RATING_CONTEXT_EQUALS_FLANGE_ADEQUACY,
  FLOATING_D5_R4_SOURCE_REFERENCE_ALLOWED,
  MECHANICAL_NOZZLE_CONTEXT_EQUALS_PIPING_DESIGN,
  NEW_DEPENDENCY_ADDED,
  PARALLEL_D5_CURRENTNESS_ENGINE_CREATED,
  PIPING_CLASS_REFERENCE_EQUALS_COMPONENT_VALIDATED,
  PIPING_COMPONENT_CONTEXT_EQUALS_COMPONENT_SIZING_CALCULATION,
  PIPING_COMPONENT_PRESENT_EQUALS_ENGINEERING_VALIDATED,
  PIPING_CONNECTION_CONTEXT_EQUALS_CONNECTION_ADEQUACY,
  PIPING_CONNECTION_CONTEXT_EQUALS_MECHANICAL_EQUIPMENT_DESIGN,
  PIPING_CONNECTION_CONTEXT_EQUALS_STRESS_VALIDATED,
  PIPING_SPECIFICATION_APPLICABLE_EQUALS_COMPONENT_ADEQUATE,
  SECOND_D5_FINGERPRINT_ALGORITHM_CREATED,
  SILENT_D5_R4_MUTATION_ALLOWED,
  TENANT_WORKSPACE_PROJECT_D5_R4_SCOPE_ENFORCED,
  VALVE_ACTUATION_CONTEXT_EQUALS_ELECTRICAL_DESIGN,
  VALVE_ACTUATION_CONTEXT_EQUALS_IAC_DESIGN,
  VALVE_CONTEXT_EQUALS_PROCESS_CONTROL_DESIGN,
  VALVE_CONTEXT_EQUALS_VALIDATED_VALVE_SELECTION,
  VALVE_CONTEXT_EQUALS_VALVE_SIZING,
  calculatePiping,
  createD5R4Store,
  recordPipingComponentContext,
  recordPipingConnectionContext,
  recordPipingRoute,
  recordPipingSpecialtyContext,
  recordPipingStressSupport,
  recordPipingValveContext,
  repointPipingComponentContext,
  selectPipingComponent,
  validatePipingEngineering,
} from "./component-connection-valve-context";

const here = dirname(fileURLToPath(import.meta.url));
const actor: D5R1Actor = {
  actorId: "piping-recorder",
  tenantId: "tenant-a",
  workspaceId: "workspace-a",
  projectId: "project-a",
  authority: "PIPING_CONTEXT_AUTHORITY",
};
const mechanical: D4R1Actor = {
  actorId: "mechanical-recorder",
  tenantId: "tenant-a",
  workspaceId: "workspace-a",
  projectId: "project-a",
  authority: "MECHANICAL_CONTEXT_AUTHORITY",
};

function throws(run: () => void): string {
  try {
    run();
  } catch (error) {
    return error instanceof Error ? error.message : "";
  }
  return "";
}

describe("EOS-D5-R4 piping component connection and valve context", () => {
  it("records explicit component, connection, valve, and specialty context without calculating adequacy", () => {
    expect(D5_R4_STATUS).toBe("COMPONENT_CONNECTION_AND_VALVE_CONTEXT_IMPLEMENTED");
    expect(D5_R4_MATURITY).toBe(D5_R4_STATUS);
    expect(D5_RUNTIME_STARTED).toBe(true);
    expect(TYPES_D5_RUNTIME_STARTED).toBe(false);
    expect(D5_RUNTIME_COUNT).toBe(4);
    expect(ARCHITECTURE_D5_RUNTIME_COUNT).toBe(0);
    expect(R1_RUNTIME_COUNT).toBe(1);
    expect(R2_RUNTIME_COUNT).toBe(2);
    expect(R3_RUNTIME_COUNT).toBe(3);
    expect(R3_COMPONENT_COUNT).toBe(0);
    expect(D5_COMPONENT_CONNECTION_VALVE_RUNTIME_IMPLEMENTED).toBe(true);
    expect(D5_COMPONENT_CONNECTION_VALVE_RUNTIME_COUNT).toBe(1);
    expect(D5_COMPONENT_CONNECTION_VALVE_RUNTIME_READY).toBe(true);
    expect(D5_R1_IDENTITY_REUSED).toBe(true);
    expect(D5_R2_SYSTEM_LINE_SERVICE_CONTEXT_REUSED).toBe(true);
    expect(D5_R3_DESIGN_CONDITION_SPECIFICATION_CONTEXT_REUSED).toBe(true);
    expect(D5_PIPING_IDENTITY_OBJECT_FOUNDATION_RUNTIME_READY).toBe(true);
    expect(D5_SYSTEM_LINE_SERVICE_CONTEXT_RUNTIME_READY).toBe(true);
    expect(D5_DESIGN_CONDITION_SPECIFICATION_RUNTIME_READY).toBe(true);
    expect(EXACT_D5_R1_R3_REFERENCE_REQUIRED).toBe(true);
    expect(FLOATING_D5_R4_SOURCE_REFERENCE_ALLOWED).toBe(false);
    expect(D5_R4_SOURCE_AUTO_REPOINTED).toBe(false);
    expect(D5_PIPING_COMPONENT_CONTEXT_IMPLEMENTED).toBe(true);
    expect(D5_R3_SPECIFICATION_CLASS_REFERENCE_SUPPORTED).toBe(true);
    expect(EXACT_D5_R3_SPECIFICATION_CLASS_REVISION_REQUIRED).toBe(true);
    expect(D5_COMPONENT_IDENTITY_REQUIRED).toBe(true);
    expect(D5_INFERRED_COMPONENT_IDENTITY_ALLOWED).toBe(false);
    expect(PIPING_COMPONENT_PRESENT_EQUALS_ENGINEERING_VALIDATED).toBe(false);
    expect(PIPING_COMPONENT_CONTEXT_EQUALS_COMPONENT_SIZING_CALCULATION).toBe(false);
    expect(PIPING_SPECIFICATION_APPLICABLE_EQUALS_COMPONENT_ADEQUATE).toBe(false);
    expect(PIPING_CLASS_REFERENCE_EQUALS_COMPONENT_VALIDATED).toBe(false);
    expect(D5_PIPING_CONNECTION_CONTEXT_IMPLEMENTED).toBe(true);
    expect(D5_EXPLICIT_CONNECTION_RELATIONSHIP_REQUIRED).toBe(true);
    expect(D5_INFERRED_CONNECTION_RELATIONSHIP_ALLOWED).toBe(false);
    expect(PIPING_CONNECTION_CONTEXT_EQUALS_CONNECTION_ADEQUACY).toBe(false);
    expect(PIPING_CONNECTION_CONTEXT_EQUALS_STRESS_VALIDATED).toBe(false);
    expect(D5_PIPING_VALVE_CONTEXT_IMPLEMENTED).toBe(true);
    expect(VALVE_CONTEXT_EQUALS_VALVE_SIZING).toBe(false);
    expect(VALVE_CONTEXT_EQUALS_PROCESS_CONTROL_DESIGN).toBe(false);
    expect(VALVE_CONTEXT_EQUALS_VALIDATED_VALVE_SELECTION).toBe(false);
    expect(D5_PIPING_SPECIALTY_CONTEXT_IMPLEMENTED).toBe(true);
    expect(D5_D4_EQUIPMENT_CONNECTION_REFERENCE_SUPPORTED).toBe(true);
    expect(EXACT_D4_EQUIPMENT_INTERFACE_REVISION_REQUIRED).toBe(true);
    expect(MECHANICAL_NOZZLE_CONTEXT_EQUALS_PIPING_DESIGN).toBe(false);
    expect(PIPING_CONNECTION_CONTEXT_EQUALS_MECHANICAL_EQUIPMENT_DESIGN).toBe(false);
    expect(D5_R4_MISSING_D4_COUNTERPART_AUTO_FABRICATED).toBe(false);
    expect(D5_R4_INFERRED_D4_COUNTERPART_ALLOWED).toBe(false);
    expect(D5_R4_DIMENSION_CONTEXT_EQUALS_CALCULATED_SIZE).toBe(false);
    expect(D5_R4_RATING_CONTEXT_EQUALS_CALCULATED_PRESSURE_RATING).toBe(false);
    expect(D5_BRANCH_CONNECTION_CONTEXT_SUPPORTED).toBe(true);
    expect(BRANCH_CONNECTION_CONTEXT_EQUALS_BRANCH_REINFORCEMENT_CALCULATION).toBe(false);
    expect(BRANCH_CONNECTION_CONTEXT_EQUALS_CODE_COMPLIANT_BRANCH).toBe(false);
    expect(D5_FLANGE_CONTEXT_SUPPORTED).toBe(true);
    expect(FLANGE_RATING_CONTEXT_EQUALS_FLANGE_ADEQUACY).toBe(false);
    expect(FLANGE_CONTEXT_EQUALS_CODE_CONFORMANCE).toBe(false);
    expect(VALVE_ACTUATION_CONTEXT_EQUALS_ELECTRICAL_DESIGN).toBe(false);
    expect(VALVE_ACTUATION_CONTEXT_EQUALS_IAC_DESIGN).toBe(false);
    expect(D5_R4_SOURCE_BASIS_REQUIRED).toBe(true);
    expect(D5_R4_SOURCE_BASIS_TRACEABLE).toBe(true);
    expect(BASISLESS_AUTHORITATIVE_D5_R4_RECORD_AUTO_ACCEPTED).toBe(false);
    expect(D5_R4_APPLICABILITY_EXPLICIT).toBe(true);
    expect(D5_R4_LIMITATIONS_EXPLICIT).toBe(true);
    expect(D5_R4_AUTO_PROPAGATED_OUTSIDE_APPLICABILITY).toBe(false);
    expect(D5_R4_AUTOMATIC_COMPONENT_SELECTION_ALLOWED).toBe(false);
    expect(D5_R4_AUTOMATIC_VALVE_SELECTION_ALLOWED).toBe(false);
    expect(D5_R4_AUTOMATIC_SPECIALTY_SELECTION_ALLOWED).toBe(false);
    expect([
      D5_PIPE_SIZING_RUNTIME_COUNT, D5_HYDRAULIC_CALCULATION_RUNTIME_COUNT, D5_PRESSURE_DROP_CALCULATION_RUNTIME_COUNT,
      D5_WALL_THICKNESS_CALCULATION_RUNTIME_COUNT, D5_BRANCH_REINFORCEMENT_CALCULATION_RUNTIME_COUNT,
      D5_FLANGE_RATING_CALCULATION_RUNTIME_COUNT, D5_VALVE_SIZING_RUNTIME_COUNT, D5_COMPONENT_SIZING_RUNTIME_COUNT,
      D5_PIPING_STRESS_CALCULATION_RUNTIME_COUNT, D5_FLEXIBILITY_CALCULATION_RUNTIME_COUNT, D5_SUPPORT_LOAD_CALCULATION_RUNTIME_COUNT,
      D5_ROUTING_ARRANGEMENT_FABRICATION_RUNTIME_COUNT, D5_STRESS_SUPPORT_TEST_EVIDENCE_RUNTIME_COUNT,
      D5_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_COUNT, D5_DISCIPLINE_INTERFACE_RUNTIME_COUNT,
      D5_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_COUNT, D5_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT,
      D5_D9_SOURCE_CONTRACT_RUNTIME_COUNT, D5_D9_RUNTIME_INTEGRATION_COUNT, D5_AUTOMATIC_REDESIGN_RUNTIME_COUNT,
      D5_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT, D5_CONFORMANCE_DETERMINATION_RUNTIME_COUNT,
      D5_APPROVAL_RUNTIME_COUNT, D5_CERTIFICATION_RUNTIME_COUNT, D5_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT,
      D5_CROSS_DISCIPLINE_CONFLICT_DETECTION_RUNTIME_COUNT, D5_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT,
      D5_CROSS_DISCIPLINE_RECOMMENDATION_RUNTIME_COUNT,
    ].every((count) => count === 0)).toBe(true);
    expect(D5_R4_HIDDEN_CALCULATION_ALLOWED).toBe(false);
    expect(D5_REUSES_CANONICAL_CURRENTNESS).toBe(true);
    expect(PARALLEL_D5_CURRENTNESS_ENGINE_CREATED).toBe(false);
    expect(D5_REUSES_CANONICAL_FINGERPRINT).toBe(true);
    expect(SECOND_D5_FINGERPRINT_ALGORITHM_CREATED).toBe(false);
    expect(D5_R4_PROVENANCE_REQUIRED).toBe(true);
    expect(D5_R4_PROVENANCE_PRESERVED).toBe(true);
    expect(D5_R4_AUTO_REPOINTED).toBe(false);
    expect(SILENT_D5_R4_MUTATION_ALLOWED).toBe(false);
    expect(D5_R4_HISTORY_PRESERVED).toBe(true);
    expect(TENANT_WORKSPACE_PROJECT_D5_R4_SCOPE_ENFORCED).toBe(true);
    expect(AI_EQUALS_D5_PIPING_ENGINEERING_AUTHORITY).toBe(false);
    expect(ADMIN_EQUALS_D5_PIPING_ENGINEERING_AUTHORITY).toBe(false);
    expect(AI_CAN_INVENT_AUTHORITATIVE_D5_COMPONENT).toBe(false);
    expect(AI_CAN_INVENT_AUTHORITATIVE_D5_CONNECTION).toBe(false);
    expect(AI_CAN_INVENT_AUTHORITATIVE_D5_VALVE).toBe(false);
    expect(ADMIN_CAN_PROMOTE_CANDIDATE_COMPONENT_TO_ENGINEERING_TRUTH).toBe(false);
    expect(D5_EQUALS_D1_STRUCTURAL_AUTHORITY).toBe(false);
    expect(D5_EQUALS_D2_CIVIL_AUTHORITY).toBe(false);
    expect(D5_EQUALS_D3_GEOTECHNICAL_AUTHORITY).toBe(false);
    expect(D5_EQUALS_D4_MECHANICAL_AUTHORITY).toBe(false);
    expect(D5_EQUALS_D6_PROCESS_AUTHORITY).toBe(false);
    expect(D5_EQUALS_D7_ELECTRICAL_AUTHORITY).toBe(false);
    expect(D5_EQUALS_D8_INSTRUMENTATION_CONTROL_AUTHORITY).toBe(false);
    expect(D5_R4_DUPLICATE_GOVERNANCE_IMPLEMENTED).toBe(true);
    expect(D5_R4_REPLAY_PROTECTION_IMPLEMENTED).toBe(true);
    expect(D5_R4_SPOOFING_PROTECTION_IMPLEMENTED).toBe(true);
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
    expect(D5_R4_STARTED).toBe(false);
    expect(D5_R5_STARTED).toBe(false);
    expect(D5_R4_CANONICAL_NEXT_PHASE).toBe("EOS-D5-R5-ROUTING-ARRANGEMENT-AND-FABRICATION-CONTEXT");
    expect(D5_R4_NEXT_PHASE_TYPE).toBe("ROUTING_ARRANGEMENT_AND_FABRICATION_CONTEXT");
    expect(D5_R4_CANONICAL_NEXT_PHASE_SCOPE).toContain("exact R1-R4 revisions");
    expect(D5_R4_BLOCKER).toBe("NONE");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D5.R3.DESIGN_CONDITIONS_AND_SPECIFICATION_CONTEXT")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D5.R4.COMPONENT_CONNECTION_AND_VALVE_CONTEXT")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D5.R5.ROUTING_ARRANGEMENT_AND_FABRICATION_CONTEXT")?.implementationState).toBe("IMPLEMENTED_BOUNDED");

    const r1 = createD5R1Store();
    recordPipingContext(r1, actor, { contextId: "ctx-1", citedLifecycleStage: "FEED", provenanceRef: "prov-ctx" });
    const system = recordPipingObjectIdentity(r1, actor, { objectId: "sys-1", contextId: "ctx-1", objectType: "PIPING_SYSTEM_CONTEXT", citedLifecycleStage: "FEED", provenanceRef: "prov-sys" });
    const line = recordPipingObjectIdentity(r1, actor, { objectId: "line-1", contextId: "ctx-1", objectType: "PIPING_LINE", citedLifecycleStage: "FEED", provenanceRef: "prov-line" });
    const serviceIdentity = recordPipingObjectIdentity(r1, actor, { objectId: "svc-1", contextId: "ctx-1", objectType: "PIPING_SERVICE_CONTEXT", citedLifecycleStage: "FEED", provenanceRef: "prov-svc" });
    const flange = recordPipingObjectIdentity(r1, actor, { objectId: "flange-1", contextId: "ctx-1", objectType: "PIPING_COMPONENT_CONTEXT", citedLifecycleStage: "FEED", provenanceRef: "prov-flange" });
    const branch = recordPipingObjectIdentity(r1, actor, { objectId: "branch-1", contextId: "ctx-1", objectType: "PIPING_COMPONENT_CONTEXT", citedLifecycleStage: "FEED", provenanceRef: "prov-branch" });
    const valveIdentity = recordPipingObjectIdentity(r1, actor, { objectId: "valve-1", contextId: "ctx-1", objectType: "PIPING_VALVE_CONTEXT", citedLifecycleStage: "FEED", provenanceRef: "prov-valve" });
    const specialtyIdentity = recordPipingObjectIdentity(r1, actor, { objectId: "specialty-1", contextId: "ctx-1", objectType: "PIPING_SPECIALTY_CONTEXT", citedLifecycleStage: "FEED", provenanceRef: "prov-specialty" });
    const connectionIdentity = recordPipingObjectIdentity(r1, actor, { objectId: "conn-id-1", contextId: "ctx-1", objectType: "PIPING_CONNECTION_CONTEXT", citedLifecycleStage: "FEED", provenanceRef: "prov-conn" });
    const r2 = createD5R2Store(r1);
    const r2Bound = { contextId: "ctx-1", citedLifecycleStage: "FEED", provenanceRef: "prov-r2", sourceBasisRef: "basis-a", citedCurrentness: "CURRENT" };
    recordPipingSystemContext(r2, actor, { ...r2Bound, objectId: system.objectId, objectRevisionFingerprint: system.fingerprint, systemRecordId: "sys-ctx", systemName: "Cooling water", systemDescription: "Utility", systemClassification: "UTILITY_PIPING_SYSTEM", systemFunction: "SUPPLY", grouping: "utilities", applicableScope: "unit-10" });
    const lineContext = recordPipingLineContext(r2, actor, { ...r2Bound, objectId: line.objectId, objectRevisionFingerprint: line.fingerprint, lineRecordId: "line-ctx", lineTag: "CW-100", lineDescription: "Supply", lineClassification: "UTILITY_LINE", lineFunction: "SUPPLY", applicableScope: "unit-10" });
    const service = recordPipingServiceFunction(r2, actor, { ...r2Bound, objectId: serviceIdentity.objectId, objectRevisionFingerprint: serviceIdentity.fingerprint, serviceRecordId: "svc-ctx", serviceFunction: "SUPPLY", serviceDescription: "Supplies cooling water", applicableScope: "unit-10" });
    const r3 = createD5R3Store(r1, r2);
    const specCommon = {
      contextId: "ctx-1", objectId: line.objectId, objectRevisionFingerprint: line.fingerprint,
      lineRecordId: lineContext.lineRecordId, lineContextFingerprint: lineContext.fingerprint,
      serviceRecordId: service.serviceRecordId, serviceContextFingerprint: service.fingerprint,
      citedLifecycleStage: "FEED", citedCurrentness: "CURRENT", provenanceRef: "prov-r3",
      sourceBasisRef: "project-basis-cw", sourceBasisCategory: "PIPING_DESIGN_BASIS",
      applicabilityRef: line.objectId, limitations: "Unit 10 cooling water only", processSourceRef: "process-source-p100",
    };
    const specification = recordPipingSpecificationContext(r3, actor, {
      ...specCommon, specificationId: "spec-1", specificationRef: "CW-CLASS-A", pipingClass: "A1",
      materialFamily: "CARBON_STEEL", pressureRatingContext: "Class 150 reference", flangeRatingContext: "ASME B16.5 class 150 reference",
      wallScheduleContext: "Schedule 40 reference", codeStandardRef: "ASME B31.3 reference", assignmentBasis: "EXPLICIT",
    });
    const d4 = createD4R1Store();
    const mechanicalContext = recordMechanicalContext(d4, mechanical, { contextId: "mechanical-context-1", citedLifecycleStage: "FEED", provenanceRef: "prov-mech" });
    const nozzle = recordMechanicalObjectIdentity(d4, mechanical, { objectId: "nozzle-1", contextId: mechanicalContext.contextId, objectType: "MECHANICAL_INTERFACE_POINT", citedLifecycleStage: "FEED", provenanceRef: "prov-nozzle" });
    const d4Before = d4.objects.length;
    const specBefore = JSON.stringify(r3.specifications);
    const r1Before = r1.objects.length;
    const store = createD5R4Store(r1, r2, r3, d4);
    const base = {
      contextId: "ctx-1",
      lineRecordId: lineContext.lineRecordId,
      lineContextFingerprint: lineContext.fingerprint,
      specificationId: specification.specificationId,
      specificationFingerprint: specification.fingerprint,
      citedLifecycleStage: "FEED",
      citedCurrentness: "CURRENT",
      provenanceRef: "prov-r4",
      sourceBasisRef: "class-a-adoption",
      sourceBasisCategory: "R3_SPECIFICATION_CLASS",
      limitations: "Supplied context only; not sizing, rating, or adequacy",
      identityBasis: "EXPLICIT",
    };
    const flangeRecord = recordPipingComponentContext(store, actor, {
      ...base, componentRecordId: "comp-flange", objectId: flange.objectId, objectRevisionFingerprint: flange.fingerprint,
      applicabilityRef: flange.objectId, componentClassification: "FLANGE",
      size: { value: "6", unit: "in" }, materialContext: "CARBON_STEEL", ratingContext: "Class 150 supplied",
    });
    expect(flangeRecord.engineeringValidated).toBe(false);
    expect(flangeRecord.sizingCalculation).toBe(false);
    expect(flangeRecord.specificationImpliesAdequate).toBe(false);
    expect(flangeRecord.classValidated).toBe(false);
    expect(flangeRecord.calculatedSize).toBe(false);
    expect(flangeRecord.calculatedRating).toBe(false);
    expect(flangeRecord.flangeAdequacy).toBe(false);
    expect(flangeRecord.flangeConformance).toBe(false);
    expect(flangeRecord.size).toEqual({ value: "6", unit: "in" });
    expect(flangeRecord.specificationFingerprint).toBe(specification.fingerprint);
    expect(flangeRecord.lineContextFingerprint).toBe(lineContext.fingerprint);
    expect(recordPipingComponentContext(store, actor, {
      ...base, componentRecordId: "comp-flange", objectId: flange.objectId, objectRevisionFingerprint: flange.fingerprint,
      applicabilityRef: flange.objectId, componentClassification: "FLANGE",
      size: { value: "6", unit: "in" }, materialContext: "CARBON_STEEL", ratingContext: "Class 150 supplied",
    })).toBe(flangeRecord);
    const branchRecord = recordPipingComponentContext(store, actor, {
      ...base, componentRecordId: "comp-branch", objectId: branch.objectId, objectRevisionFingerprint: branch.fingerprint,
      applicabilityRef: branch.objectId, componentClassification: "BRANCH_CONNECTION",
    });
    expect(branchRecord.branchReinforcementCalculation).toBe(false);
    expect(branchRecord.codeCompliantBranch).toBe(false);
    const connection = recordPipingConnectionContext(store, actor, {
      ...base, connectionRecordId: "conn-1", objectId: connectionIdentity.objectId, objectRevisionFingerprint: connectionIdentity.fingerprint,
      applicabilityRef: connectionIdentity.objectId, connectionKind: "COMPONENT_TO_COMPONENT", connectionBasis: "EXPLICIT",
      fromObjectId: flange.objectId, fromRevisionFingerprint: flange.fingerprint, toObjectId: branch.objectId, toRevisionFingerprint: branch.fingerprint,
    });
    expect(connection.inferred).toBe(false);
    expect(connection.connectionAdequacy).toBe(false);
    expect(connection.stressValidated).toBe(false);
    expect(connection.connectionBasis).toBe("EXPLICIT");
    const absent = recordPipingConnectionContext(store, actor, {
      ...base, connectionRecordId: "conn-absent", objectId: connectionIdentity.objectId, objectRevisionFingerprint: connectionIdentity.fingerprint,
      applicabilityRef: connectionIdentity.objectId, connectionKind: "EQUIPMENT", connectionBasis: "EXPLICIT",
      fromObjectId: flange.objectId, fromRevisionFingerprint: flange.fingerprint, toObjectId: line.objectId, toRevisionFingerprint: line.fingerprint,
      counterpartAbsent: true, limitations: "No exact D4 nozzle counterpart is recorded",
    });
    expect(absent.d4CounterpartPresent).toBe(false);
    expect(absent.d4EquipmentObjectId).toBeNull();
    expect(absent.mechanicalEquipmentDesign).toBe(false);
    expect(absent.nozzleEqualsPipingDesign).toBe(false);
    expect(d4.objects.length).toBe(d4Before);
    const equipmentConnection = recordPipingConnectionContext(store, actor, {
      ...base, connectionRecordId: "conn-eq", objectId: connectionIdentity.objectId, objectRevisionFingerprint: connectionIdentity.fingerprint,
      applicabilityRef: connectionIdentity.objectId, connectionKind: "EQUIPMENT", connectionBasis: "EXPLICIT",
      fromObjectId: flange.objectId, fromRevisionFingerprint: flange.fingerprint, toObjectId: valveIdentity.objectId, toRevisionFingerprint: valveIdentity.fingerprint,
      equipmentObjectId: nozzle.objectId, equipmentRevisionFingerprint: nozzle.fingerprint,
    });
    expect(equipmentConnection.d4CounterpartPresent).toBe(true);
    expect(equipmentConnection.d4EquipmentRevisionFingerprint).toBe(nozzle.fingerprint);
    expect(equipmentConnection.mechanicalEquipmentDesign).toBe(false);
    expect(equipmentConnection.nozzleEqualsPipingDesign).toBe(false);
    expect(d4.objects.length).toBe(d4Before);
    const valve = recordPipingValveContext(store, actor, {
      ...base, valveRecordId: "valve-rec-1", objectId: valveIdentity.objectId, objectRevisionFingerprint: valveIdentity.fingerprint,
      applicabilityRef: valveIdentity.objectId, valveTag: "HV-100", valveType: "GATE",
      actuationContext: "manual supplied", failPosition: "as-supplied closed", size: { value: "6", unit: "in" }, ratingContext: "Class 150 supplied",
    });
    expect(valve.valveSizing).toBe(false);
    expect(valve.processControlDesign).toBe(false);
    expect(valve.validatedSelection).toBe(false);
    expect(valve.electricalDesign).toBe(false);
    expect(valve.iacDesign).toBe(false);
    const specialty = recordPipingSpecialtyContext(store, actor, {
      ...base, specialtyRecordId: "spec-item-1", objectId: specialtyIdentity.objectId, objectRevisionFingerprint: specialtyIdentity.fingerprint,
      applicabilityRef: specialtyIdentity.objectId, specialtyDescription: "Supplied strainer as specialty item",
    });
    expect(specialty.engineeringAdequate).toBe(false);
    expect(specialty.automaticSelection).toBe(false);
    expect(JSON.stringify(r3.specifications)).toBe(specBefore);
    expect(r1.objects.length).toBe(r1Before);
    expect(throws(() => recordPipingComponentContext(store, actor, {
      ...base, componentRecordId: "comp-infer", objectId: flange.objectId, objectRevisionFingerprint: flange.fingerprint,
      applicabilityRef: flange.objectId, componentClassification: "FLANGE", identityBasis: "drawing_proximity",
    }))).toBe("D5_R4_INFERRED_IDENTITY_REJECTED");
    expect(throws(() => recordPipingComponentContext(store, actor, {
      ...base, componentRecordId: "comp-float", objectId: flange.objectId, objectRevisionFingerprint: "latest",
      applicabilityRef: flange.objectId, componentClassification: "FLANGE",
    }))).toBe("D5_R4_R1_REVISION_REQUIRED");
    expect(throws(() => recordPipingComponentContext(store, actor, {
      ...base, componentRecordId: "comp-spec", objectId: flange.objectId, objectRevisionFingerprint: flange.fingerprint,
      applicabilityRef: flange.objectId, componentClassification: "PIPE", specificationFingerprint: "not-the-spec",
    }))).toBe("D5_R4_R3_REVISION_MISMATCH");
    expect(throws(() => recordPipingComponentContext(store, actor, {
      ...base, componentRecordId: "comp-line", objectId: flange.objectId, objectRevisionFingerprint: flange.fingerprint,
      applicabilityRef: flange.objectId, componentClassification: "ELBOW", lineContextFingerprint: "not-the-line",
    }))).toBe("D5_R4_R2_REVISION_MISMATCH");
    expect(throws(() => recordPipingComponentContext(store, actor, {
      ...base, componentRecordId: "comp-scope", objectId: flange.objectId, objectRevisionFingerprint: flange.fingerprint,
      applicabilityRef: line.objectId, componentClassification: "TEE",
    }))).toBe("D5_R4_APPLICABILITY_MISMATCH");
    expect(throws(() => recordPipingComponentContext(store, actor, {
      ...base, componentRecordId: "comp-select", objectId: branch.objectId, objectRevisionFingerprint: branch.fingerprint,
      applicabilityRef: branch.objectId, componentClassification: "REDUCER", autoSelect: true,
    }))).toBe("D5_R4_AUTOMATIC_SELECTION_REJECTED");
    expect(throws(() => recordPipingComponentContext(store, actor, {
      ...base, componentRecordId: "comp-calc", objectId: branch.objectId, objectRevisionFingerprint: branch.fingerprint,
      applicabilityRef: branch.objectId, componentClassification: "PIPE", size: { value: "t=PD/2SE", unit: "in" },
    }))).toBe("D5_R4_CALCULATION_NOT_IN_R4");
    expect(throws(() => recordPipingComponentContext(store, actor, {
      ...base, sourceBasisRef: "", componentRecordId: "comp-basis", objectId: branch.objectId, objectRevisionFingerprint: branch.fingerprint,
      applicabilityRef: branch.objectId, componentClassification: "FITTING",
    }))).toBe("D5_R4_SOURCE_BASIS_REQUIRED");
    expect(throws(() => recordPipingComponentContext(store, { ...actor, tenantId: "tenant-b" }, {
      ...base, componentRecordId: "comp-tenant", objectId: flange.objectId, objectRevisionFingerprint: flange.fingerprint,
      applicabilityRef: flange.objectId, componentClassification: "FLANGE",
    }))).toBe("D5_R4_CROSS_SCOPE_OPERATION");
    expect(throws(() => recordPipingComponentContext(store, { ...actor, authority: "ADMIN" }, {
      ...base, componentRecordId: "comp-admin", objectId: flange.objectId, objectRevisionFingerprint: flange.fingerprint,
      applicabilityRef: flange.objectId, componentClassification: "FLANGE",
    }))).toBe("D5_R4_ADMIN_NOT_PIPING_AUTHORITY");
    expect(throws(() => recordPipingComponentContext(store, { ...actor, actorId: "AI-recorder" }, {
      ...base, componentRecordId: "comp-ai", objectId: flange.objectId, objectRevisionFingerprint: flange.fingerprint,
      applicabilityRef: flange.objectId, componentClassification: "FLANGE",
    }))).toBe("D5_R4_AI_NOT_PIPING_AUTHORITY");
    expect(throws(() => recordPipingComponentContext(store, actor, {
      ...base, componentRecordId: "comp-spoof", objectId: flange.objectId, objectRevisionFingerprint: flange.fingerprint,
      applicabilityRef: flange.objectId, componentClassification: "STRAINER", assertedFingerprint: "not-canonical",
    }))).toBe("D5_R4_FINGERPRINT_MISMATCH");
    expect(throws(() => recordPipingComponentContext(store, actor, {
      ...base, componentRecordId: "comp-dup", objectId: flange.objectId, objectRevisionFingerprint: flange.fingerprint,
      applicabilityRef: flange.objectId, componentClassification: "FLANGE", ratingContext: "other supplied rating",
    }))).toBe("D5_R4_DUPLICATE_COMPONENT_REJECTED");
    expect(throws(() => recordPipingConnectionContext(store, actor, {
      ...base, connectionRecordId: "conn-infer", objectId: connectionIdentity.objectId, objectRevisionFingerprint: connectionIdentity.fingerprint,
      applicabilityRef: connectionIdentity.objectId, connectionKind: "BRANCH", connectionBasis: "geometry",
      fromObjectId: flange.objectId, fromRevisionFingerprint: flange.fingerprint, toObjectId: line.objectId, toRevisionFingerprint: line.fingerprint,
    }))).toBe("D5_R4_INFERRED_CONNECTION_REJECTED");
    expect(throws(() => recordPipingConnectionContext(store, actor, {
      ...base, connectionRecordId: "conn-fab", objectId: connectionIdentity.objectId, objectRevisionFingerprint: connectionIdentity.fingerprint,
      applicabilityRef: connectionIdentity.objectId, connectionKind: "EQUIPMENT", connectionBasis: "EXPLICIT",
      fromObjectId: line.objectId, fromRevisionFingerprint: line.fingerprint, toObjectId: specialtyIdentity.objectId, toRevisionFingerprint: specialtyIdentity.fingerprint,
      fabricateCounterpart: true, counterpartAbsent: true,
    }))).toBe("D5_R4_COUNTERPART_NOT_FABRICATED");
    expect(d4.objects.length).toBe(d4Before);
    expect(throws(() => recordPipingConnectionContext(store, actor, {
      ...base, connectionRecordId: "conn-miss", objectId: connectionIdentity.objectId, objectRevisionFingerprint: connectionIdentity.fingerprint,
      applicabilityRef: connectionIdentity.objectId, connectionKind: "EQUIPMENT", connectionBasis: "EXPLICIT",
      fromObjectId: line.objectId, fromRevisionFingerprint: line.fingerprint, toObjectId: specialtyIdentity.objectId, toRevisionFingerprint: specialtyIdentity.fingerprint,
      equipmentObjectId: "nozzle-missing", equipmentRevisionFingerprint: nozzle.fingerprint,
    }))).toBe("D5_R4_D4_COUNTERPART_NOT_FOUND");
    expect(throws(() => recordPipingConnectionContext(store, actor, {
      ...base, connectionRecordId: "conn-rev", objectId: connectionIdentity.objectId, objectRevisionFingerprint: connectionIdentity.fingerprint,
      applicabilityRef: connectionIdentity.objectId, connectionKind: "EQUIPMENT", connectionBasis: "EXPLICIT",
      fromObjectId: line.objectId, fromRevisionFingerprint: line.fingerprint, toObjectId: specialtyIdentity.objectId, toRevisionFingerprint: specialtyIdentity.fingerprint,
      equipmentObjectId: nozzle.objectId, equipmentRevisionFingerprint: "wrong-revision",
    }))).toBe("D5_R4_D4_REVISION_MISMATCH");
    expect(throws(() => recordPipingValveContext(store, actor, {
      ...base, valveRecordId: "valve-size", objectId: valveIdentity.objectId, objectRevisionFingerprint: valveIdentity.fingerprint,
      applicabilityRef: valveIdentity.objectId, valveTag: "HV-200", valveType: "GLOBE", valveSizing: true,
    }))).toBe("D5_R4_CALCULATION_NOT_IN_R4");
    expect(throws(() => recordPipingValveContext(store, actor, {
      ...base, valveRecordId: "valve-elec", objectId: valveIdentity.objectId, objectRevisionFingerprint: valveIdentity.fingerprint,
      applicabilityRef: valveIdentity.objectId, valveTag: "HV-201", valveType: "BALL", electricalDesign: true,
    }))).toBe("D5_R4_ELECTRICAL_DESIGN_NOT_IN_R4");
    expect(throws(() => recordPipingValveContext(store, actor, {
      ...base, valveRecordId: "valve-iac", objectId: valveIdentity.objectId, objectRevisionFingerprint: valveIdentity.fingerprint,
      applicabilityRef: valveIdentity.objectId, valveTag: "HV-202", valveType: "BALL", iacDesign: true,
    }))).toBe("D5_R4_IAC_DESIGN_NOT_IN_R4");
    expect(throws(() => recordPipingSpecialtyContext(store, actor, {
      ...base, specialtyRecordId: "spec-auto", objectId: specialtyIdentity.objectId, objectRevisionFingerprint: specialtyIdentity.fingerprint,
      applicabilityRef: specialtyIdentity.objectId, specialtyDescription: "another specialty", autoSelect: true,
    }))).toBe("D5_R4_AUTOMATIC_SELECTION_REJECTED");
    const revised = recordPipingComponentContext(store, actor, {
      ...base, componentRecordId: "comp-flange-2", objectId: flange.objectId, objectRevisionFingerprint: flange.fingerprint,
      applicabilityRef: flange.objectId, componentClassification: "FLANGE", predecessorId: "comp-flange",
      ratingContext: "Class 300 supplied",
    });
    expect(revised.predecessorId).toBe("comp-flange");
    expect(store.components.find((row) => row.componentRecordId === "comp-flange")?.fingerprint).toBe(flangeRecord.fingerprint);
    expect(store.components.find((row) => row.componentRecordId === "comp-flange")?.currentness).toBe("SUPERSEDED");
    expect(store.history.some((row) => row.subjectId === "comp-flange" && row.fingerprint === flangeRecord.fingerprint)).toBe(true);
    expect(JSON.stringify(r3.specifications)).toBe(specBefore);
    expect(throws(() => repointPipingComponentContext())).toBe("D5_R4_AUTO_REPOINT_REJECTED");
    expect(throws(() => selectPipingComponent())).toBe("D5_R4_AUTOMATIC_SELECTION_REJECTED");
    expect(throws(() => calculatePiping())).toBe("D5_R4_CALCULATION_NOT_IN_R4");
    expect(throws(() => recordPipingRoute())).toBe("D5_R4_ROUTING_NOT_IN_R4");
    expect(throws(() => recordPipingStressSupport())).toBe("D5_R4_STRESS_SUPPORT_NOT_IN_R4");
    expect(throws(() => validatePipingEngineering())).toBe("D5_R4_VALIDATION_NOT_IN_R4");
    const source = readFileSync(join(here, "component-connection-valve-context.ts"), "utf8");
    expect(scanAnalysisFormulaBypass("component-connection-valve-context.ts", source)).toEqual([]);
    expect(source.includes("createHash")).toBe(false);
    const packageJson = JSON.parse(readFileSync(join(here, "../../package.json"), "utf8")) as { dependencies: Record<string, string> };
    expect(Object.keys(packageJson.dependencies)).toContain("zod");
    expect(Object.keys(packageJson.dependencies)).not.toContain("@rtb/piping-solver");
  });
});
