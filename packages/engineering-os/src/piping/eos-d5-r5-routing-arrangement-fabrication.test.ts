import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { D5_RUNTIME_COUNT as ARCHITECTURE_D5_RUNTIME_COUNT, D5_RUNTIME_STARTED as TYPES_D5_RUNTIME_STARTED } from "@rtb/types";
import { describe, expect, it } from "vitest";
import { STRUCTURAL_CAPABILITY_MANIFEST } from "../structural-concrete/capability";
import { scanAnalysisFormulaBypass } from "../structural-systems/formula-scan";
import { D5_RUNTIME_COUNT as R4_RUNTIME_COUNT, D5_R5_STARTED, D5_ROUTING_ARRANGEMENT_FABRICATION_RUNTIME_COUNT as R4_ROUTING_COUNT, createD5R4Store, recordPipingComponentContext, recordPipingConnectionContext } from "./component-connection-valve-context";
import { createD5R3Store, recordPipingSpecificationContext } from "./design-condition-specification-context";
import { createD5R1Store, recordPipingContext, recordPipingObjectIdentity, type D5R1Actor } from "./identity-foundation";
import {
  ADMIN_EQUALS_D5_PIPING_ENGINEERING_AUTHORITY,
  AI_CAN_INVENT_AUTHORITATIVE_D5_FABRICATION_CONTEXT,
  AI_CAN_INVENT_AUTHORITATIVE_D5_ROUTE,
  AI_CAN_INVENT_AUTHORITATIVE_D5_WELD_CONTEXT,
  AI_EQUALS_D5_PIPING_ENGINEERING_AUTHORITY,
  BASISLESS_AUTHORITATIVE_D5_R5_RECORD_AUTO_ACCEPTED,
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
  D5_COMPONENT_CONNECTION_VALVE_RUNTIME_READY,
  D5_COMPONENT_SIZING_RUNTIME_COUNT,
  D5_CONFORMANCE_DETERMINATION_RUNTIME_COUNT,
  D5_CONSTRUCTABILITY_DETERMINATION_RUNTIME_COUNT,
  D5_CROSS_DISCIPLINE_CONFLICT_DETECTION_RUNTIME_COUNT,
  D5_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT,
  D5_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT,
  D5_CROSS_DISCIPLINE_RECOMMENDATION_RUNTIME_COUNT,
  D5_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT,
  D5_D4_ACCESS_MAINTENANCE_REFERENCE_SUPPORTED,
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
  D5_EXPLICIT_ROUTE_RELATIONSHIPS_REQUIRED,
  D5_FLEXIBILITY_CALCULATION_RUNTIME_COUNT,
  D5_FLANGE_RATING_CALCULATION_RUNTIME_COUNT,
  D5_GEOMETRY_SOLVER_RUNTIME_COUNT,
  D5_HYDRAULIC_CALCULATION_RUNTIME_COUNT,
  D5_INFERRED_ROUTE_RELATIONSHIPS_ALLOWED,
  D5_PIPE_SIZING_RUNTIME_COUNT,
  D5_PIPING_ARRANGEMENT_CONTEXT_IMPLEMENTED,
  D5_PIPING_FABRICATION_CONTEXT_IMPLEMENTED,
  D5_PIPING_IDENTITY_OBJECT_FOUNDATION_RUNTIME_READY,
  D5_PIPING_ISOMETRIC_CONTEXT_IMPLEMENTED,
  D5_PIPING_ROUTING_CONTEXT_IMPLEMENTED,
  D5_PIPING_SPOOL_CONTEXT_IMPLEMENTED,
  D5_PIPING_STRESS_CALCULATION_RUNTIME_COUNT,
  D5_PIPING_WELD_JOINT_CONTEXT_IMPLEMENTED,
  D5_PRESSURE_DROP_CALCULATION_RUNTIME_COUNT,
  D5_R1_IDENTITY_REUSED,
  D5_R2_SYSTEM_LINE_SERVICE_CONTEXT_REUSED,
  D5_R3_DESIGN_CONDITION_SPECIFICATION_CONTEXT_REUSED,
  D5_R4_COMPONENT_CONNECTION_CONTEXT_REUSED,
  D5_R4_COMPONENT_CONNECTION_VALVE_CONTEXT_REUSED,
  D5_R5_APPLICABILITY_EXPLICIT,
  D5_R5_AUTO_MUTATES_R4_COMPONENT_CONTEXT,
  D5_R5_AUTO_MUTATES_R4_CONNECTION_CONTEXT,
  D5_R5_AUTO_PROPAGATED_OUTSIDE_APPLICABILITY,
  D5_R5_AUTO_REPOINTED,
  D5_R5_BLOCKER,
  D5_R5_CANONICAL_NEXT_PHASE,
  D5_R5_CANONICAL_NEXT_PHASE_SCOPE,
  D5_R5_DUPLICATE_GOVERNANCE_IMPLEMENTED,
  D5_R5_HIDDEN_SPATIAL_SOLVER_ALLOWED,
  D5_R5_HISTORY_PRESERVED,
  D5_R5_LIMITATIONS_EXPLICIT,
  D5_R5_MATURITY,
  D5_R5_NEXT_PHASE_TYPE,
  D5_R5_PROVENANCE_PRESERVED,
  D5_R5_PROVENANCE_REQUIRED,
  D5_R5_REPLAY_PROTECTION_IMPLEMENTED,
  D5_R5_SOURCE_AUTO_REPOINTED,
  D5_R5_SOURCE_BASIS_REQUIRED,
  D5_R5_SOURCE_BASIS_TRACEABLE,
  D5_R5_SPOOFING_PROTECTION_IMPLEMENTED,
  D5_R5_STATUS,
  D5_R5_VALIDATES_D4_MAINTAINABILITY,
  D5_R5_VALIDATES_MECHANICAL_ACCESS,
  D5_R6_STARTED,
  D5_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_COUNT,
  D5_REUSES_CANONICAL_CURRENTNESS,
  D5_REUSES_CANONICAL_FINGERPRINT,
  D5_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_COUNT,
  D5_ROUTE_ELEVATION_CONTEXT_SUPPORTED,
  D5_ROUTE_GEOMETRY_CONTEXT_SUPPORTED,
  D5_ROUTE_OPTIMIZATION_RUNTIME_COUNT,
  D5_ROUTE_SLOPE_CONTEXT_SUPPORTED,
  D5_ROUTING_ARRANGEMENT_FABRICATION_RUNTIME_COUNT,
  D5_ROUTING_ARRANGEMENT_FABRICATION_RUNTIME_IMPLEMENTED,
  D5_ROUTING_ARRANGEMENT_FABRICATION_RUNTIME_READY,
  D5_RUNTIME_COUNT,
  D5_RUNTIME_STARTED,
  D5_SPATIAL_CLASH_DETECTION_RUNTIME_COUNT,
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
  EXACT_D4_ACCESS_MAINTENANCE_REVISION_REQUIRED,
  EXACT_D5_R1_R4_REFERENCE_REQUIRED,
  EXACT_D5_R4_COMPONENT_CONNECTION_REVISION_REQUIRED,
  FABRICATION_CONTEXT_EQUALS_ENGINEERING_VALIDATED,
  FABRICATION_CONTEXT_EQUALS_FABRICATION_COMPLETE,
  FLOATING_D5_R5_SOURCE_REFERENCE_ALLOWED,
  NEW_DEPENDENCY_ADDED,
  PARALLEL_D5_CURRENTNESS_ENGINE_CREATED,
  PIPING_ARRANGEMENT_CONTEXT_EQUALS_ACCESS_VALIDATED,
  PIPING_ARRANGEMENT_CONTEXT_EQUALS_CLASH_FREE,
  PIPING_ARRANGEMENT_CONTEXT_EQUALS_MAINTAINABILITY_VALIDATED,
  PIPING_ARRANGEMENT_CONTEXT_EQUALS_SPATIAL_VALIDATION,
  PIPING_ISOMETRIC_EQUALS_ENGINEERING_VALIDATED,
  PIPING_ISOMETRIC_EQUALS_PIPING_IDENTITY,
  PIPING_ROUTE_CONTEXT_EQUALS_CLASH_FREE,
  PIPING_ROUTE_CONTEXT_EQUALS_CONSTRUCTABLE,
  PIPING_ROUTE_CONTEXT_EQUALS_OPTIMIZED,
  PIPING_ROUTE_CONTEXT_EQUALS_STRESS_VALIDATED,
  PIPING_SPOOL_CONTEXT_EQUALS_FABRICATED,
  PIPING_SPOOL_DOCUMENT_EQUALS_ENGINEERING_VALIDATED,
  ROUTE_GEOMETRY_CONTEXT_EQUALS_GEOMETRY_SOLVED,
  ROUTE_SLOPE_CONTEXT_EQUALS_HYDRAULIC_VALIDATION,
  SECOND_D5_FINGERPRINT_ALGORITHM_CREATED,
  SILENT_D5_R5_MUTATION_ALLOWED,
  TENANT_WORKSPACE_PROJECT_D5_R5_SCOPE_ENFORCED,
  WELD_JOINT_CONTEXT_EQUALS_CODE_CONFORMANT,
  WELD_JOINT_CONTEXT_EQUALS_NDE_PASSED,
  WELD_JOINT_CONTEXT_EQUALS_WELD_ACCEPTED,
  calculatePiping,
  createD5R5Store,
  detectPipingClash,
  recordPipingArrangementContext,
  recordPipingFabricationContext,
  recordPipingIsometricContext,
  recordPipingRoutingContext,
  recordPipingSpoolContext,
  recordPipingStressSupport,
  recordPipingWeldJointContext,
  repointPipingRoutingContext,
  solvePipingGeometry,
  validatePipingEngineering,
} from "./routing-arrangement-fabrication-context";
import { createD5R2Store, recordPipingLineContext, recordPipingServiceFunction, recordPipingSystemContext } from "./system-line-service-context";

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

describe("EOS-D5-R5 piping routing arrangement and fabrication context", () => {
  it("records supplied route and fabrication context without solving or validating it", () => {
    expect(D5_R5_STATUS).toBe("ROUTING_ARRANGEMENT_AND_FABRICATION_CONTEXT_IMPLEMENTED");
    expect(D5_R5_MATURITY).toBe(D5_R5_STATUS);
    expect(D5_RUNTIME_STARTED).toBe(true);
    expect(TYPES_D5_RUNTIME_STARTED).toBe(false);
    expect(D5_RUNTIME_COUNT).toBe(5);
    expect(ARCHITECTURE_D5_RUNTIME_COUNT).toBe(0);
    expect(R4_RUNTIME_COUNT).toBe(4);
    expect(R4_ROUTING_COUNT).toBe(0);
    expect(D5_ROUTING_ARRANGEMENT_FABRICATION_RUNTIME_IMPLEMENTED).toBe(true);
    expect(D5_ROUTING_ARRANGEMENT_FABRICATION_RUNTIME_COUNT).toBe(1);
    expect(D5_ROUTING_ARRANGEMENT_FABRICATION_RUNTIME_READY).toBe(true);
    expect(D5_R1_IDENTITY_REUSED).toBe(true);
    expect(D5_R2_SYSTEM_LINE_SERVICE_CONTEXT_REUSED).toBe(true);
    expect(D5_R3_DESIGN_CONDITION_SPECIFICATION_CONTEXT_REUSED).toBe(true);
    expect(D5_R4_COMPONENT_CONNECTION_VALVE_CONTEXT_REUSED).toBe(true);
    expect(D5_PIPING_IDENTITY_OBJECT_FOUNDATION_RUNTIME_READY).toBe(true);
    expect(D5_SYSTEM_LINE_SERVICE_CONTEXT_RUNTIME_READY).toBe(true);
    expect(D5_DESIGN_CONDITION_SPECIFICATION_RUNTIME_READY).toBe(true);
    expect(D5_COMPONENT_CONNECTION_VALVE_RUNTIME_READY).toBe(true);
    expect(EXACT_D5_R1_R4_REFERENCE_REQUIRED).toBe(true);
    expect(FLOATING_D5_R5_SOURCE_REFERENCE_ALLOWED).toBe(false);
    expect(D5_R5_SOURCE_AUTO_REPOINTED).toBe(false);
    expect(D5_PIPING_ROUTING_CONTEXT_IMPLEMENTED).toBe(true);
    expect(D5_EXPLICIT_ROUTE_RELATIONSHIPS_REQUIRED).toBe(true);
    expect(D5_INFERRED_ROUTE_RELATIONSHIPS_ALLOWED).toBe(false);
    expect(PIPING_ROUTE_CONTEXT_EQUALS_CLASH_FREE).toBe(false);
    expect(PIPING_ROUTE_CONTEXT_EQUALS_CONSTRUCTABLE).toBe(false);
    expect(PIPING_ROUTE_CONTEXT_EQUALS_OPTIMIZED).toBe(false);
    expect(PIPING_ROUTE_CONTEXT_EQUALS_STRESS_VALIDATED).toBe(false);
    expect(D5_PIPING_ARRANGEMENT_CONTEXT_IMPLEMENTED).toBe(true);
    expect(PIPING_ARRANGEMENT_CONTEXT_EQUALS_SPATIAL_VALIDATION).toBe(false);
    expect(PIPING_ARRANGEMENT_CONTEXT_EQUALS_CLASH_FREE).toBe(false);
    expect(PIPING_ARRANGEMENT_CONTEXT_EQUALS_ACCESS_VALIDATED).toBe(false);
    expect(PIPING_ARRANGEMENT_CONTEXT_EQUALS_MAINTAINABILITY_VALIDATED).toBe(false);
    expect(D5_ROUTE_SLOPE_CONTEXT_SUPPORTED).toBe(true);
    expect(D5_ROUTE_ELEVATION_CONTEXT_SUPPORTED).toBe(true);
    expect(D5_ROUTE_GEOMETRY_CONTEXT_SUPPORTED).toBe(true);
    expect(ROUTE_SLOPE_CONTEXT_EQUALS_HYDRAULIC_VALIDATION).toBe(false);
    expect(ROUTE_GEOMETRY_CONTEXT_EQUALS_GEOMETRY_SOLVED).toBe(false);
    expect(D5_D4_ACCESS_MAINTENANCE_REFERENCE_SUPPORTED).toBe(true);
    expect(EXACT_D4_ACCESS_MAINTENANCE_REVISION_REQUIRED).toBe(true);
    expect(D5_R5_VALIDATES_D4_MAINTAINABILITY).toBe(false);
    expect(D5_R5_VALIDATES_MECHANICAL_ACCESS).toBe(false);
    expect(D5_EQUALS_D4_MECHANICAL_AUTHORITY).toBe(false);
    expect(D5_PIPING_FABRICATION_CONTEXT_IMPLEMENTED).toBe(true);
    expect(FABRICATION_CONTEXT_EQUALS_FABRICATION_COMPLETE).toBe(false);
    expect(FABRICATION_CONTEXT_EQUALS_ENGINEERING_VALIDATED).toBe(false);
    expect(D5_PIPING_ISOMETRIC_CONTEXT_IMPLEMENTED).toBe(true);
    expect(PIPING_ISOMETRIC_EQUALS_PIPING_IDENTITY).toBe(false);
    expect(PIPING_ISOMETRIC_EQUALS_ENGINEERING_VALIDATED).toBe(false);
    expect(D5_PIPING_SPOOL_CONTEXT_IMPLEMENTED).toBe(true);
    expect(PIPING_SPOOL_CONTEXT_EQUALS_FABRICATED).toBe(false);
    expect(PIPING_SPOOL_DOCUMENT_EQUALS_ENGINEERING_VALIDATED).toBe(false);
    expect(D5_PIPING_WELD_JOINT_CONTEXT_IMPLEMENTED).toBe(true);
    expect(WELD_JOINT_CONTEXT_EQUALS_WELD_ACCEPTED).toBe(false);
    expect(WELD_JOINT_CONTEXT_EQUALS_NDE_PASSED).toBe(false);
    expect(WELD_JOINT_CONTEXT_EQUALS_CODE_CONFORMANT).toBe(false);
    expect(D5_R4_COMPONENT_CONNECTION_CONTEXT_REUSED).toBe(true);
    expect(EXACT_D5_R4_COMPONENT_CONNECTION_REVISION_REQUIRED).toBe(true);
    expect(D5_R5_AUTO_MUTATES_R4_COMPONENT_CONTEXT).toBe(false);
    expect(D5_R5_AUTO_MUTATES_R4_CONNECTION_CONTEXT).toBe(false);
    expect(D5_R5_SOURCE_BASIS_REQUIRED).toBe(true);
    expect(D5_R5_SOURCE_BASIS_TRACEABLE).toBe(true);
    expect(BASISLESS_AUTHORITATIVE_D5_R5_RECORD_AUTO_ACCEPTED).toBe(false);
    expect(D5_R5_APPLICABILITY_EXPLICIT).toBe(true);
    expect(D5_R5_LIMITATIONS_EXPLICIT).toBe(true);
    expect(D5_R5_AUTO_PROPAGATED_OUTSIDE_APPLICABILITY).toBe(false);
    expect([
      D5_AUTOMATIC_ROUTING_RUNTIME_COUNT, D5_ROUTE_OPTIMIZATION_RUNTIME_COUNT, D5_SPATIAL_CLASH_DETECTION_RUNTIME_COUNT,
      D5_GEOMETRY_SOLVER_RUNTIME_COUNT, D5_CONSTRUCTABILITY_DETERMINATION_RUNTIME_COUNT, D5_STRESS_SUPPORT_TEST_EVIDENCE_RUNTIME_COUNT,
      D5_PIPING_STRESS_CALCULATION_RUNTIME_COUNT, D5_FLEXIBILITY_CALCULATION_RUNTIME_COUNT, D5_SUPPORT_LOAD_CALCULATION_RUNTIME_COUNT,
      D5_PIPE_SIZING_RUNTIME_COUNT, D5_HYDRAULIC_CALCULATION_RUNTIME_COUNT, D5_PRESSURE_DROP_CALCULATION_RUNTIME_COUNT,
      D5_WALL_THICKNESS_CALCULATION_RUNTIME_COUNT, D5_BRANCH_REINFORCEMENT_CALCULATION_RUNTIME_COUNT, D5_FLANGE_RATING_CALCULATION_RUNTIME_COUNT,
      D5_VALVE_SIZING_RUNTIME_COUNT, D5_COMPONENT_SIZING_RUNTIME_COUNT, D5_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_COUNT,
      D5_DISCIPLINE_INTERFACE_RUNTIME_COUNT, D5_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_COUNT, D5_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT,
      D5_D9_SOURCE_CONTRACT_RUNTIME_COUNT, D5_D9_RUNTIME_INTEGRATION_COUNT, D5_AUTOMATIC_REDESIGN_RUNTIME_COUNT,
      D5_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT, D5_CONFORMANCE_DETERMINATION_RUNTIME_COUNT, D5_APPROVAL_RUNTIME_COUNT,
      D5_CERTIFICATION_RUNTIME_COUNT, D5_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT, D5_CROSS_DISCIPLINE_CONFLICT_DETECTION_RUNTIME_COUNT,
      D5_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT, D5_CROSS_DISCIPLINE_RECOMMENDATION_RUNTIME_COUNT,
    ].every((count) => count === 0)).toBe(true);
    expect(D5_R5_HIDDEN_SPATIAL_SOLVER_ALLOWED).toBe(false);
    expect(D5_REUSES_CANONICAL_CURRENTNESS).toBe(true);
    expect(PARALLEL_D5_CURRENTNESS_ENGINE_CREATED).toBe(false);
    expect(D5_REUSES_CANONICAL_FINGERPRINT).toBe(true);
    expect(SECOND_D5_FINGERPRINT_ALGORITHM_CREATED).toBe(false);
    expect(D5_R5_PROVENANCE_REQUIRED).toBe(true);
    expect(D5_R5_PROVENANCE_PRESERVED).toBe(true);
    expect(D5_R5_AUTO_REPOINTED).toBe(false);
    expect(SILENT_D5_R5_MUTATION_ALLOWED).toBe(false);
    expect(D5_R5_HISTORY_PRESERVED).toBe(true);
    expect(TENANT_WORKSPACE_PROJECT_D5_R5_SCOPE_ENFORCED).toBe(true);
    expect(AI_EQUALS_D5_PIPING_ENGINEERING_AUTHORITY).toBe(false);
    expect(ADMIN_EQUALS_D5_PIPING_ENGINEERING_AUTHORITY).toBe(false);
    expect(AI_CAN_INVENT_AUTHORITATIVE_D5_ROUTE).toBe(false);
    expect(AI_CAN_INVENT_AUTHORITATIVE_D5_FABRICATION_CONTEXT).toBe(false);
    expect(AI_CAN_INVENT_AUTHORITATIVE_D5_WELD_CONTEXT).toBe(false);
    expect(D5_EQUALS_D1_STRUCTURAL_AUTHORITY).toBe(false);
    expect(D5_EQUALS_D2_CIVIL_AUTHORITY).toBe(false);
    expect(D5_EQUALS_D3_GEOTECHNICAL_AUTHORITY).toBe(false);
    expect(D5_EQUALS_D6_PROCESS_AUTHORITY).toBe(false);
    expect(D5_EQUALS_D7_ELECTRICAL_AUTHORITY).toBe(false);
    expect(D5_EQUALS_D8_INSTRUMENTATION_CONTROL_AUTHORITY).toBe(false);
    expect(D5_R5_DUPLICATE_GOVERNANCE_IMPLEMENTED).toBe(true);
    expect(D5_R5_REPLAY_PROTECTION_IMPLEMENTED).toBe(true);
    expect(D5_R5_SPOOFING_PROTECTION_IMPLEMENTED).toBe(true);
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
    expect(D5_R5_STARTED).toBe(false);
    expect(D5_R6_STARTED).toBe(false);
    expect(D5_R5_CANONICAL_NEXT_PHASE).toBe("EOS-D5-R6-STRESS-SUPPORT-AND-TEST-EVIDENCE-CONTEXT");
    expect(D5_R5_NEXT_PHASE_TYPE).toBe("STRESS_SUPPORT_AND_TEST_EVIDENCE_CONTEXT");
    expect(D5_R5_CANONICAL_NEXT_PHASE_SCOPE).toContain("exact R1-R5 revisions");
    expect(D5_R5_BLOCKER).toBe("NONE");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D5.R5.ROUTING_ARRANGEMENT_AND_FABRICATION_CONTEXT")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D5.R6.STRESS_SUPPORT_AND_TEST_EVIDENCE_CONTEXT")?.implementationState).toBe("IMPLEMENTED_BOUNDED");

    const r1 = createD5R1Store();
    recordPipingContext(r1, actor, { contextId: "ctx-1", citedLifecycleStage: "FEED", provenanceRef: "prov-ctx" });
    const system = recordPipingObjectIdentity(r1, actor, { objectId: "sys-1", contextId: "ctx-1", objectType: "PIPING_SYSTEM_CONTEXT", citedLifecycleStage: "FEED", provenanceRef: "prov-sys" });
    const line = recordPipingObjectIdentity(r1, actor, { objectId: "line-1", contextId: "ctx-1", objectType: "PIPING_LINE", citedLifecycleStage: "FEED", provenanceRef: "prov-line" });
    const serviceIdentity = recordPipingObjectIdentity(r1, actor, { objectId: "svc-1", contextId: "ctx-1", objectType: "PIPING_SERVICE_CONTEXT", citedLifecycleStage: "FEED", provenanceRef: "prov-svc" });
    const flange = recordPipingObjectIdentity(r1, actor, { objectId: "flange-1", contextId: "ctx-1", objectType: "PIPING_COMPONENT_CONTEXT", citedLifecycleStage: "FEED", provenanceRef: "prov-flange" });
    const routeIdentity = recordPipingObjectIdentity(r1, actor, { objectId: "route-1", contextId: "ctx-1", objectType: "PIPING_ROUTE_CONTEXT", citedLifecycleStage: "FEED", provenanceRef: "prov-route" });
    const fabricationIdentity = recordPipingObjectIdentity(r1, actor, { objectId: "fab-1", contextId: "ctx-1", objectType: "PIPING_FABRICATION_CONTEXT", citedLifecycleStage: "FEED", provenanceRef: "prov-fab" });
    const connectionIdentity = recordPipingObjectIdentity(r1, actor, { objectId: "conn-id-1", contextId: "ctx-1", objectType: "PIPING_CONNECTION_CONTEXT", citedLifecycleStage: "FEED", provenanceRef: "prov-conn" });
    const r2 = createD5R2Store(r1);
    const r2Bound = { contextId: "ctx-1", citedLifecycleStage: "FEED", provenanceRef: "prov-r2", sourceBasisRef: "basis-a", citedCurrentness: "CURRENT" };
    recordPipingSystemContext(r2, actor, { ...r2Bound, objectId: system.objectId, objectRevisionFingerprint: system.fingerprint, systemRecordId: "sys-ctx", systemName: "Cooling water", systemDescription: "Utility", systemClassification: "UTILITY_PIPING_SYSTEM", systemFunction: "SUPPLY", grouping: "utilities", applicableScope: "unit-10" });
    const lineContext = recordPipingLineContext(r2, actor, { ...r2Bound, objectId: line.objectId, objectRevisionFingerprint: line.fingerprint, lineRecordId: "line-ctx", lineTag: "CW-100", lineDescription: "Supply", lineClassification: "UTILITY_LINE", lineFunction: "SUPPLY", applicableScope: "unit-10" });
    const service = recordPipingServiceFunction(r2, actor, { ...r2Bound, objectId: serviceIdentity.objectId, objectRevisionFingerprint: serviceIdentity.fingerprint, serviceRecordId: "svc-ctx", serviceFunction: "SUPPLY", serviceDescription: "Supplies cooling water", applicableScope: "unit-10" });
    const r3 = createD5R3Store(r1, r2);
    const specification = recordPipingSpecificationContext(r3, actor, {
      contextId: "ctx-1", objectId: line.objectId, objectRevisionFingerprint: line.fingerprint,
      lineRecordId: lineContext.lineRecordId, lineContextFingerprint: lineContext.fingerprint,
      serviceRecordId: service.serviceRecordId, serviceContextFingerprint: service.fingerprint,
      citedLifecycleStage: "FEED", citedCurrentness: "CURRENT", provenanceRef: "prov-r3",
      sourceBasisRef: "project-basis-cw", sourceBasisCategory: "PIPING_DESIGN_BASIS",
      applicabilityRef: line.objectId, limitations: "Unit 10 cooling water only",
      specificationId: "spec-1", specificationRef: "CW-CLASS-A", pipingClass: "A1",
      materialFamily: "CARBON_STEEL", pressureRatingContext: "Class 150 reference", flangeRatingContext: "ASME B16.5 class 150 reference",
      wallScheduleContext: "Schedule 40 reference", codeStandardRef: "ASME B31.3 reference", assignmentBasis: "EXPLICIT",
    });
    const r4 = createD5R4Store(r1, r2, r3);
    const component = recordPipingComponentContext(r4, actor, {
      contextId: "ctx-1", objectId: flange.objectId, objectRevisionFingerprint: flange.fingerprint,
      lineRecordId: lineContext.lineRecordId, lineContextFingerprint: lineContext.fingerprint,
      specificationId: specification.specificationId, specificationFingerprint: specification.fingerprint,
      citedLifecycleStage: "FEED", citedCurrentness: "CURRENT", provenanceRef: "prov-r4",
      sourceBasisRef: "class-a", sourceBasisCategory: "R3_SPECIFICATION_CLASS", applicabilityRef: flange.objectId,
      limitations: "Supplied flange only", identityBasis: "EXPLICIT", componentRecordId: "comp-flange", componentClassification: "FLANGE",
    });
    const connection = recordPipingConnectionContext(r4, actor, {
      contextId: "ctx-1", objectId: connectionIdentity.objectId, objectRevisionFingerprint: connectionIdentity.fingerprint,
      lineRecordId: lineContext.lineRecordId, lineContextFingerprint: lineContext.fingerprint,
      specificationId: specification.specificationId, specificationFingerprint: specification.fingerprint,
      citedLifecycleStage: "FEED", citedCurrentness: "CURRENT", provenanceRef: "prov-r4",
      sourceBasisRef: "class-a", sourceBasisCategory: "R3_SPECIFICATION_CLASS", applicabilityRef: connectionIdentity.objectId,
      limitations: "Explicit flange to line", identityBasis: "EXPLICIT", connectionRecordId: "conn-1",
      connectionKind: "LINE_TO_COMPONENT", connectionBasis: "EXPLICIT",
      fromObjectId: flange.objectId, fromRevisionFingerprint: flange.fingerprint, toObjectId: line.objectId, toRevisionFingerprint: line.fingerprint,
    });
    const access = { records: [{ recordId: "access-1", fingerprint: "access-fp-1", tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a", recordClass: "ACCESS_CLEARANCE_CONTEXT", recordStatus: "CURRENT" as const }] };
    const componentsBefore = JSON.stringify(r4.components);
    const connectionsBefore = JSON.stringify(r4.connections);
    const store = createD5R5Store(r4, access);
    const base = {
      contextId: "ctx-1",
      lineRecordId: lineContext.lineRecordId, lineContextFingerprint: lineContext.fingerprint,
      specificationId: specification.specificationId, specificationFingerprint: specification.fingerprint,
      componentRecordId: component.componentRecordId, componentRevisionFingerprint: component.fingerprint,
      connectionRecordId: connection.connectionRecordId, connectionRevisionFingerprint: connection.fingerprint,
      citedLifecycleStage: "FEED", citedCurrentness: "CURRENT", provenanceRef: "prov-r5",
      sourceBasisRef: "iso-basis", sourceBasisCategory: "APPROVED_ISOMETRIC",
      limitations: "Supplied route context only; not clash-free, constructable, or stress-validated",
      identityBasis: "EXPLICIT", relationshipBasis: "EXPLICIT",
    };
    const route = recordPipingRoutingContext(store, actor, {
      ...base, objectId: routeIdentity.objectId, objectRevisionFingerprint: routeIdentity.fingerprint, applicabilityRef: routeIdentity.objectId,
      routeRecordId: "route-rec-1", routeSegment: "CW-100 rack A", sourceObjectId: flange.objectId, sourceRevisionFingerprint: flange.fingerprint,
      destinationObjectId: line.objectId, destinationRevisionFingerprint: line.fingerprint, placement: "ABOVE_GROUND",
      routingConstraint: "stay on pipe rack A", slope: { value: "1:100", unit: "m/m" }, elevation: { value: "12.5", unit: "m" },
      geometryContext: "supplied centerline sketch", drainVentRequirement: "low-point drain supplied", accessConstraint: "walkway clearance reference only",
    });
    expect(route.clashFree).toBe(false);
    expect(route.constructable).toBe(false);
    expect(route.optimized).toBe(false);
    expect(route.stressValidated).toBe(false);
    expect(route.hydraulicValidation).toBe(false);
    expect(route.geometrySolved).toBe(false);
    expect(route.inferred).toBe(false);
    expect(route.slope).toEqual({ value: "1:100", unit: "m/m" });
    expect(route.componentRevisionFingerprint).toBe(component.fingerprint);
    expect(route.connectionRevisionFingerprint).toBe(connection.fingerprint);
    expect(recordPipingRoutingContext(store, actor, {
      ...base, objectId: routeIdentity.objectId, objectRevisionFingerprint: routeIdentity.fingerprint, applicabilityRef: routeIdentity.objectId,
      routeRecordId: "route-rec-1", routeSegment: "CW-100 rack A", sourceObjectId: flange.objectId, sourceRevisionFingerprint: flange.fingerprint,
      destinationObjectId: line.objectId, destinationRevisionFingerprint: line.fingerprint, placement: "ABOVE_GROUND",
      routingConstraint: "stay on pipe rack A", slope: { value: "1:100", unit: "m/m" }, elevation: { value: "12.5", unit: "m" },
      geometryContext: "supplied centerline sketch", drainVentRequirement: "low-point drain supplied", accessConstraint: "walkway clearance reference only",
    })).toBe(route);
    const absent = recordPipingArrangementContext(store, actor, {
      ...base, objectId: routeIdentity.objectId, objectRevisionFingerprint: routeIdentity.fingerprint, applicabilityRef: routeIdentity.objectId,
      arrangementRecordId: "arr-absent", arrangementStatement: "Rack A arrangement as supplied", placement: "ABOVE_GROUND", accessAbsent: true,
    });
    expect(absent.d4AccessPresent).toBe(false);
    expect(absent.spatialValidation).toBe(false);
    expect(absent.accessValidated).toBe(false);
    expect(absent.maintainabilityValidated).toBe(false);
    expect(access.records.length).toBe(1);
    const arranged = recordPipingArrangementContext(store, actor, {
      ...base, objectId: routeIdentity.objectId, objectRevisionFingerprint: routeIdentity.fingerprint, applicabilityRef: routeIdentity.objectId,
      arrangementRecordId: "arr-1", arrangementStatement: "Beside pump with supplied clearance note", placement: "ABOVE_GROUND",
      accessRecordId: "access-1", accessRevisionFingerprint: "access-fp-1",
    });
    expect(arranged.d4AccessPresent).toBe(true);
    expect(arranged.d4AccessRevisionFingerprint).toBe("access-fp-1");
    expect(arranged.accessValidated).toBe(false);
    expect(access.records.length).toBe(1);
    const fabrication = recordPipingFabricationContext(store, actor, {
      ...base, objectId: fabricationIdentity.objectId, objectRevisionFingerprint: fabricationIdentity.fingerprint, applicabilityRef: fabricationIdentity.objectId,
      fabricationRecordId: "fab-rec-1", fabricationClass: "SHOP", fabricationStatus: "status supplied", fabricationRequirement: "shop spool as drawn", evidenceRef: "fab-note-1",
    });
    expect(fabrication.fabricationComplete).toBe(false);
    expect(fabrication.engineeringValidated).toBe(false);
    const isometric = recordPipingIsometricContext(store, actor, {
      ...base, objectId: fabricationIdentity.objectId, objectRevisionFingerprint: fabricationIdentity.fingerprint, applicabilityRef: fabricationIdentity.objectId,
      isometricRecordId: "iso-1", documentId: "ISO-CW-100", documentRevision: "A",
    });
    expect(isometric.isometricEqualsIdentity).toBe(false);
    expect(isometric.engineeringValidated).toBe(false);
    expect(isometric.documentRevision).toBe("A");
    const spool = recordPipingSpoolContext(store, actor, {
      ...base, objectId: fabricationIdentity.objectId, objectRevisionFingerprint: fabricationIdentity.fingerprint, applicabilityRef: fabricationIdentity.objectId,
      spoolRecordId: "spool-1", spoolTag: "SP-100",
    });
    expect(spool.fabricated).toBe(false);
    expect(spool.documentValidated).toBe(false);
    expect(spool.componentRevisionFingerprint).toBe(component.fingerprint);
    const weld = recordPipingWeldJointContext(store, actor, {
      ...base, objectId: fabricationIdentity.objectId, objectRevisionFingerprint: fabricationIdentity.fingerprint, applicabilityRef: fabricationIdentity.objectId,
      weldRecordId: "weld-1", jointType: "BUTT",
    });
    expect(weld.weldAccepted).toBe(false);
    expect(weld.ndePassed).toBe(false);
    expect(weld.codeConformant).toBe(false);
    expect(JSON.stringify(r4.components)).toBe(componentsBefore);
    expect(JSON.stringify(r4.connections)).toBe(connectionsBefore);
    expect(throws(() => recordPipingRoutingContext(store, actor, {
      ...base, relationshipBasis: "drawing_geometry", objectId: routeIdentity.objectId, objectRevisionFingerprint: routeIdentity.fingerprint, applicabilityRef: routeIdentity.objectId,
      routeRecordId: "route-infer", routeSegment: "nearby", sourceObjectId: flange.objectId, sourceRevisionFingerprint: flange.fingerprint,
      destinationObjectId: line.objectId, destinationRevisionFingerprint: line.fingerprint, placement: "ABOVE_GROUND", routingConstraint: "none",
    }))).toBe("D5_R5_INFERRED_ROUTE_REJECTED");
    expect(throws(() => recordPipingRoutingContext(store, actor, {
      ...base, objectId: routeIdentity.objectId, objectRevisionFingerprint: routeIdentity.fingerprint, applicabilityRef: routeIdentity.objectId,
      routeRecordId: "route-solve", routeSegment: "solved", sourceObjectId: flange.objectId, sourceRevisionFingerprint: flange.fingerprint,
      destinationObjectId: line.objectId, destinationRevisionFingerprint: line.fingerprint, placement: "ABOVE_GROUND", routingConstraint: "none",
      slope: { value: "calc(drop)", unit: "m/m" },
    }))).toBe("D5_R5_SPATIAL_SOLVER_NOT_IN_R5");
    expect(throws(() => recordPipingRoutingContext(store, actor, {
      ...base, automaticRouting: true, objectId: routeIdentity.objectId, objectRevisionFingerprint: routeIdentity.fingerprint, applicabilityRef: routeIdentity.objectId,
      routeRecordId: "route-auto", routeSegment: "auto", sourceObjectId: flange.objectId, sourceRevisionFingerprint: flange.fingerprint,
      destinationObjectId: line.objectId, destinationRevisionFingerprint: line.fingerprint, placement: "ABOVE_GROUND", routingConstraint: "none",
    }))).toBe("D5_R5_SPATIAL_SOLVER_NOT_IN_R5");
    expect(throws(() => recordPipingRoutingContext(store, actor, {
      ...base, hydraulicDesign: true, objectId: routeIdentity.objectId, objectRevisionFingerprint: routeIdentity.fingerprint, applicabilityRef: routeIdentity.objectId,
      routeRecordId: "route-hyd", routeSegment: "hyd", sourceObjectId: flange.objectId, sourceRevisionFingerprint: flange.fingerprint,
      destinationObjectId: line.objectId, destinationRevisionFingerprint: line.fingerprint, placement: "BURIED", routingConstraint: "none",
    }))).toBe("D5_R5_CALCULATION_NOT_IN_R5");
    expect(throws(() => recordPipingRoutingContext(store, actor, {
      ...base, componentRevisionFingerprint: "not-the-component", objectId: routeIdentity.objectId, objectRevisionFingerprint: routeIdentity.fingerprint, applicabilityRef: routeIdentity.objectId,
      routeRecordId: "route-comp", routeSegment: "seg", sourceObjectId: flange.objectId, sourceRevisionFingerprint: flange.fingerprint,
      destinationObjectId: line.objectId, destinationRevisionFingerprint: line.fingerprint, placement: "ABOVE_GROUND", routingConstraint: "none",
    }))).toBe("D5_R5_R4_COMPONENT_REVISION_MISMATCH");
    expect(throws(() => recordPipingArrangementContext(store, actor, {
      ...base, fabricateAccess: true, accessAbsent: true, objectId: routeIdentity.objectId, objectRevisionFingerprint: routeIdentity.fingerprint, applicabilityRef: routeIdentity.objectId,
      arrangementRecordId: "arr-fab", arrangementStatement: "invented clearance", placement: "ABOVE_GROUND",
    }))).toBe("D5_R5_ACCESS_NOT_FABRICATED");
    expect(access.records.length).toBe(1);
    expect(throws(() => recordPipingArrangementContext(store, actor, {
      ...base, objectId: routeIdentity.objectId, objectRevisionFingerprint: routeIdentity.fingerprint, applicabilityRef: routeIdentity.objectId,
      arrangementRecordId: "arr-miss", arrangementStatement: "missing access", placement: "ABOVE_GROUND",
      accessRecordId: "access-missing", accessRevisionFingerprint: "access-fp-1",
    }))).toBe("D5_R5_D4_ACCESS_NOT_FOUND");
    expect(throws(() => recordPipingArrangementContext(store, actor, {
      ...base, objectId: routeIdentity.objectId, objectRevisionFingerprint: routeIdentity.fingerprint, applicabilityRef: routeIdentity.objectId,
      arrangementRecordId: "arr-rev", arrangementStatement: "wrong access revision", placement: "ABOVE_GROUND",
      accessRecordId: "access-1", accessRevisionFingerprint: "wrong-revision",
    }))).toBe("D5_R5_D4_ACCESS_REVISION_MISMATCH");
    expect(throws(() => recordPipingIsometricContext(store, actor, {
      ...base, objectId: fabricationIdentity.objectId, objectRevisionFingerprint: fabricationIdentity.fingerprint, applicabilityRef: fabricationIdentity.objectId,
      isometricRecordId: "iso-float", documentId: "ISO-CW-100", documentRevision: "latest",
    }))).toBe("D5_R5_DOCUMENT_REVISION_REQUIRED");
    expect(throws(() => recordPipingFabricationContext(store, actor, {
      ...base, fabricationComplete: true, objectId: fabricationIdentity.objectId, objectRevisionFingerprint: fabricationIdentity.fingerprint, applicabilityRef: fabricationIdentity.objectId,
      fabricationRecordId: "fab-done", fabricationClass: "FIELD", fabricationStatus: "claimed complete", fabricationRequirement: "field", evidenceRef: "none",
    }))).toBe("D5_R5_VALIDATION_NOT_IN_R5");
    expect(throws(() => recordPipingWeldJointContext(store, actor, {
      ...base, weldAccepted: true, objectId: fabricationIdentity.objectId, objectRevisionFingerprint: fabricationIdentity.fingerprint, applicabilityRef: fabricationIdentity.objectId,
      weldRecordId: "weld-ok", jointType: "FILLET",
    }))).toBe("D5_R5_WELD_ACCEPTANCE_NOT_IN_R5");
    expect(throws(() => recordPipingSpoolContext(store, actor, {
      ...base, mutateComponent: true, objectId: fabricationIdentity.objectId, objectRevisionFingerprint: fabricationIdentity.fingerprint, applicabilityRef: fabricationIdentity.objectId,
      spoolRecordId: "spool-mut", spoolTag: "SP-X",
    }))).toBe("D5_R5_R4_MUTATION_REJECTED");
    expect(throws(() => recordPipingRoutingContext(store, { ...actor, actorId: "AI-recorder" }, {
      ...base, objectId: routeIdentity.objectId, objectRevisionFingerprint: routeIdentity.fingerprint, applicabilityRef: routeIdentity.objectId,
      routeRecordId: "route-ai", routeSegment: "ai", sourceObjectId: flange.objectId, sourceRevisionFingerprint: flange.fingerprint,
      destinationObjectId: line.objectId, destinationRevisionFingerprint: line.fingerprint, placement: "ABOVE_GROUND", routingConstraint: "none",
    }))).toBe("D5_R5_AI_NOT_PIPING_AUTHORITY");
    expect(throws(() => recordPipingRoutingContext(store, { ...actor, authority: "ADMIN" }, {
      ...base, objectId: routeIdentity.objectId, objectRevisionFingerprint: routeIdentity.fingerprint, applicabilityRef: routeIdentity.objectId,
      routeRecordId: "route-admin", routeSegment: "admin", sourceObjectId: flange.objectId, sourceRevisionFingerprint: flange.fingerprint,
      destinationObjectId: line.objectId, destinationRevisionFingerprint: line.fingerprint, placement: "ABOVE_GROUND", routingConstraint: "none",
    }))).toBe("D5_R5_ADMIN_NOT_PIPING_AUTHORITY");
    expect(throws(() => recordPipingRoutingContext(store, actor, {
      ...base, sourceBasisRef: "", objectId: routeIdentity.objectId, objectRevisionFingerprint: routeIdentity.fingerprint, applicabilityRef: routeIdentity.objectId,
      routeRecordId: "route-basis", routeSegment: "basis", sourceObjectId: flange.objectId, sourceRevisionFingerprint: flange.fingerprint,
      destinationObjectId: line.objectId, destinationRevisionFingerprint: line.fingerprint, placement: "ABOVE_GROUND", routingConstraint: "none",
    }))).toBe("D5_R5_SOURCE_BASIS_REQUIRED");
    expect(throws(() => recordPipingRoutingContext(store, actor, {
      ...base, assertedFingerprint: "not-canonical", objectId: routeIdentity.objectId, objectRevisionFingerprint: routeIdentity.fingerprint, applicabilityRef: routeIdentity.objectId,
      routeRecordId: "route-spoof", routeSegment: "spoof", sourceObjectId: flange.objectId, sourceRevisionFingerprint: flange.fingerprint,
      destinationObjectId: line.objectId, destinationRevisionFingerprint: line.fingerprint, placement: "ABOVE_GROUND", routingConstraint: "none",
    }))).toBe("D5_R5_FINGERPRINT_MISMATCH");
    const revised = recordPipingRoutingContext(store, actor, {
      ...base, predecessorId: "route-rec-1", objectId: routeIdentity.objectId, objectRevisionFingerprint: routeIdentity.fingerprint, applicabilityRef: routeIdentity.objectId,
      routeRecordId: "route-rec-2", routeSegment: "CW-100 rack B", sourceObjectId: flange.objectId, sourceRevisionFingerprint: flange.fingerprint,
      destinationObjectId: line.objectId, destinationRevisionFingerprint: line.fingerprint, placement: "ABOVE_GROUND", routingConstraint: "rack B supplied",
    });
    expect(revised.predecessorId).toBe("route-rec-1");
    expect(store.routes.find((row) => row.routeRecordId === "route-rec-1")?.fingerprint).toBe(route.fingerprint);
    expect(store.routes.find((row) => row.routeRecordId === "route-rec-1")?.currentness).toBe("SUPERSEDED");
    const revisedIso = recordPipingIsometricContext(store, actor, {
      ...base, predecessorId: "iso-1", objectId: fabricationIdentity.objectId, objectRevisionFingerprint: fabricationIdentity.fingerprint, applicabilityRef: fabricationIdentity.objectId,
      isometricRecordId: "iso-2", documentId: "ISO-CW-100", documentRevision: "B",
    });
    expect(revisedIso.documentRevision).toBe("B");
    expect(store.isometrics.find((row) => row.isometricRecordId === "iso-1")?.fingerprint).toBe(isometric.fingerprint);
    expect(store.isometrics.find((row) => row.isometricRecordId === "iso-1")?.documentRevision).toBe("A");
    expect(JSON.stringify(r4.components)).toBe(componentsBefore);
    expect(JSON.stringify(r4.connections)).toBe(connectionsBefore);
    expect(throws(() => repointPipingRoutingContext())).toBe("D5_R5_AUTO_REPOINT_REJECTED");
    expect(throws(() => solvePipingGeometry())).toBe("D5_R5_SPATIAL_SOLVER_NOT_IN_R5");
    expect(throws(() => detectPipingClash())).toBe("D5_R5_SPATIAL_SOLVER_NOT_IN_R5");
    expect(throws(() => calculatePiping())).toBe("D5_R5_CALCULATION_NOT_IN_R5");
    expect(throws(() => recordPipingStressSupport())).toBe("D5_R5_STRESS_SUPPORT_NOT_IN_R5");
    expect(throws(() => validatePipingEngineering())).toBe("D5_R5_VALIDATION_NOT_IN_R5");
    const source = readFileSync(join(here, "routing-arrangement-fabrication-context.ts"), "utf8");
    expect(scanAnalysisFormulaBypass("routing-arrangement-fabrication-context.ts", source)).toEqual([]);
    expect(source.includes("createHash")).toBe(false);
    const packageJson = JSON.parse(readFileSync(join(here, "../../package.json"), "utf8")) as { dependencies: Record<string, string> };
    expect(Object.keys(packageJson.dependencies)).toContain("zod");
    expect(Object.keys(packageJson.dependencies)).not.toContain("@rtb/piping-solver");
  });
});
