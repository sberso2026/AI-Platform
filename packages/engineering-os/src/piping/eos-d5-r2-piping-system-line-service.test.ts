import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { D5_RUNTIME_COUNT as ARCHITECTURE_D5_RUNTIME_COUNT } from "@rtb/types";
import { describe, expect, it } from "vitest";
import { STRUCTURAL_CAPABILITY_MANIFEST } from "../structural-concrete/capability";
import { scanAnalysisFormulaBypass } from "../structural-systems/formula-scan";
import {
  D5_RUNTIME_COUNT as R1_RUNTIME_COUNT,
  D5_SYSTEM_LINE_SERVICE_CONTEXT_RUNTIME_COUNT as R1_SERVICE_COUNT,
  createD5R1Store,
  recordPipingContext,
  recordPipingObjectIdentity,
  type D5R1Actor,
} from "./identity-foundation";
import {
  ADMIN_EQUALS_D5_PIPING_ENGINEERING_AUTHORITY,
  AI_EQUALS_D5_PIPING_ENGINEERING_AUTHORITY,
  BASISLESS_AUTHORITATIVE_D5_R2_CONTEXT_AUTO_ACCEPTED,
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
  D5_DISCIPLINE_INTERFACE_RUNTIME_COUNT,
  D5_EQUALS_D1_STRUCTURAL_AUTHORITY,
  D5_EQUALS_D2_CIVIL_AUTHORITY,
  D5_EQUALS_D3_GEOTECHNICAL_AUTHORITY,
  D5_EQUALS_D4_MECHANICAL_AUTHORITY,
  D5_EQUALS_D6_PROCESS_AUTHORITY,
  D5_EQUALS_D7_ELECTRICAL_AUTHORITY,
  D5_EQUALS_D8_INSTRUMENTATION_CONTROL_AUTHORITY,
  D5_EXPLICIT_LINE_SERVICE_ASSOCIATION_REQUIRED,
  D5_EXPLICIT_SYSTEM_LINE_MEMBERSHIP_IMPLEMENTED,
  D5_FLEXIBILITY_CALCULATION_RUNTIME_COUNT,
  D5_FLANGE_RATING_CALCULATION_RUNTIME_COUNT,
  D5_HYDRAULIC_CALCULATION_RUNTIME_COUNT,
  D5_INFERRED_LINE_SERVICE_ASSOCIATION_ALLOWED,
  D5_INFERRED_SYSTEM_LINE_MEMBERSHIP_ALLOWED,
  D5_PIPE_SIZING_RUNTIME_COUNT,
  D5_PIPING_IDENTITY_OBJECT_FOUNDATION_RUNTIME_READY,
  D5_PIPING_LINE_CONTEXT_IMPLEMENTED,
  D5_PIPING_SERVICE_FUNCTION_CONTEXT_IMPLEMENTED,
  D5_PIPING_STRESS_CALCULATION_RUNTIME_COUNT,
  D5_PIPING_SYSTEM_CONTEXT_IMPLEMENTED,
  D5_PRESSURE_DROP_CALCULATION_RUNTIME_COUNT,
  D5_PROCESS_SOURCE_REFERENCE_SUPPORTED,
  D5_R1_IDENTITY_REUSED,
  D5_R2_AUTO_REPOINTED,
  D5_R2_BLOCKER,
  D5_R2_CANONICAL_NEXT_PHASE,
  D5_R2_CANONICAL_NEXT_PHASE_SCOPE,
  D5_R2_DUPLICATE_GOVERNANCE_IMPLEMENTED,
  D5_R2_HISTORY_PRESERVED,
  D5_R2_IDENTITY_AUTO_REPOINTED,
  D5_R2_MATURITY,
  D5_R2_NEXT_PHASE_TYPE,
  D5_R2_PROVENANCE_PRESERVED,
  D5_R2_PROVENANCE_REQUIRED,
  D5_R2_REPLAY_PROTECTION_IMPLEMENTED,
  D5_R2_SERVICE_CONTEXT_AUTO_CREATES_DESIGN_CONDITION,
  D5_R2_SOURCE_BASIS_REQUIRED,
  D5_R2_SOURCE_BASIS_TRACEABLE,
  D5_R2_SPOOFING_PROTECTION_IMPLEMENTED,
  D5_R2_STATUS,
  D5_R3_STARTED,
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
  D5_SYSTEM_LINE_SERVICE_CONTEXT_RUNTIME_COUNT,
  D5_SYSTEM_LINE_SERVICE_CONTEXT_RUNTIME_IMPLEMENTED,
  D5_SYSTEM_LINE_SERVICE_CONTEXT_RUNTIME_READY,
  D5_WALL_THICKNESS_CALCULATION_RUNTIME_COUNT,
  D6_RUNTIME_STARTED,
  D7_RUNTIME_STARTED,
  D8_RUNTIME_STARTED,
  D9_RUNTIME_COUNT,
  D9_RUNTIME_STARTED,
  DATABASE_SCHEMA_CHANGED,
  EXACT_D5_R1_IDENTITY_REFERENCE_REQUIRED,
  FLOATING_D5_R2_IDENTITY_REFERENCE_ALLOWED,
  NEW_DEPENDENCY_ADDED,
  PARALLEL_D5_CURRENTNESS_ENGINE_CREATED,
  PARALLEL_D5_IDENTITY_SYSTEM_CREATED,
  PIPING_LINE_CONTEXT_EQUALS_DESIGN_CONDITION,
  PIPING_LINE_CONTEXT_EQUALS_PIPING_SPECIFICATION,
  PIPING_LINE_CONTEXT_EQUALS_PROCESS_STREAM,
  PIPING_SERVICE_CONTEXT_EQUALS_PROCESS_CONDITION,
  PIPING_SERVICE_CONTEXT_EQUALS_PROCESS_DESIGN,
  PIPING_SERVICE_CONTEXT_EQUALS_PROCESS_STREAM,
  PIPING_SYSTEM_CONTEXT_EQUALS_PROCESS_SYSTEM_DESIGN,
  PIPING_SYSTEM_CONTEXT_EQUALS_VALIDATED_ENGINEERING,
  PROCESS_SOURCE_REFERENCE_EQUALS_ADOPTED_PIPING_DESIGN_CONDITION,
  SECOND_D5_FINGERPRINT_ALGORITHM_CREATED,
  SILENT_D5_R2_MUTATION_ALLOWED,
  TENANT_WORKSPACE_PROJECT_D5_R2_SCOPE_ENFORCED,
  calculatePiping,
  createD5R2Store,
  mutatePipingSystemLineService,
  recordPipingComponent,
  recordPipingDesignCondition,
  recordPipingLineContext,
  recordPipingLineServiceAssociation,
  recordPipingRoute,
  recordPipingServiceFunction,
  recordPipingStressSupport,
  recordPipingSystemContext,
  recordPipingSystemLineMembership,
  repointPipingSystemLineService,
  validatePipingEngineering,
} from "./system-line-service-context";

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

describe("EOS-D5-R2 piping system line and service context", () => {
  it("records descriptive piping context on exact R1 identities", () => {
    expect(D5_R2_STATUS).toBe("PIPING_SYSTEM_LINE_AND_SERVICE_CONTEXT_IMPLEMENTED");
    expect(D5_R2_MATURITY).toBe(D5_R2_STATUS);
    expect(D5_RUNTIME_STARTED).toBe(true);
    expect(D5_RUNTIME_COUNT).toBe(2);
    expect(R1_RUNTIME_COUNT).toBe(1);
    expect(R1_SERVICE_COUNT).toBe(0);
    expect(ARCHITECTURE_D5_RUNTIME_COUNT).toBe(0);
    expect(D5_PIPING_IDENTITY_OBJECT_FOUNDATION_RUNTIME_READY).toBe(true);
    expect(D5_R1_IDENTITY_REUSED).toBe(true);
    expect(EXACT_D5_R1_IDENTITY_REFERENCE_REQUIRED).toBe(true);
    expect(FLOATING_D5_R2_IDENTITY_REFERENCE_ALLOWED).toBe(false);
    expect(D5_R2_IDENTITY_AUTO_REPOINTED).toBe(false);
    expect(D5_SYSTEM_LINE_SERVICE_CONTEXT_RUNTIME_IMPLEMENTED).toBe(true);
    expect(D5_SYSTEM_LINE_SERVICE_CONTEXT_RUNTIME_COUNT).toBe(1);
    expect(D5_SYSTEM_LINE_SERVICE_CONTEXT_RUNTIME_READY).toBe(true);
    expect(D5_PIPING_SYSTEM_CONTEXT_IMPLEMENTED).toBe(true);
    expect(D5_PIPING_LINE_CONTEXT_IMPLEMENTED).toBe(true);
    expect(D5_PIPING_SERVICE_FUNCTION_CONTEXT_IMPLEMENTED).toBe(true);
    expect(PIPING_SYSTEM_CONTEXT_EQUALS_PROCESS_SYSTEM_DESIGN).toBe(false);
    expect(PIPING_SYSTEM_CONTEXT_EQUALS_VALIDATED_ENGINEERING).toBe(false);
    expect(PIPING_LINE_CONTEXT_EQUALS_PROCESS_STREAM).toBe(false);
    expect(PIPING_LINE_CONTEXT_EQUALS_DESIGN_CONDITION).toBe(false);
    expect(PIPING_LINE_CONTEXT_EQUALS_PIPING_SPECIFICATION).toBe(false);
    expect(PIPING_SERVICE_CONTEXT_EQUALS_PROCESS_DESIGN).toBe(false);
    expect(PIPING_SERVICE_CONTEXT_EQUALS_PROCESS_STREAM).toBe(false);
    expect(PIPING_SERVICE_CONTEXT_EQUALS_PROCESS_CONDITION).toBe(false);
    expect(D5_PROCESS_SOURCE_REFERENCE_SUPPORTED).toBe(true);
    expect(D5_CREATES_AUTHORITATIVE_PROCESS_CONDITION).toBe(false);
    expect(PROCESS_SOURCE_REFERENCE_EQUALS_ADOPTED_PIPING_DESIGN_CONDITION).toBe(false);
    expect(D5_EXPLICIT_SYSTEM_LINE_MEMBERSHIP_IMPLEMENTED).toBe(true);
    expect(D5_INFERRED_SYSTEM_LINE_MEMBERSHIP_ALLOWED).toBe(false);
    expect(D5_EXPLICIT_LINE_SERVICE_ASSOCIATION_REQUIRED).toBe(true);
    expect(D5_INFERRED_LINE_SERVICE_ASSOCIATION_ALLOWED).toBe(false);
    expect(D5_R2_SOURCE_BASIS_REQUIRED).toBe(true);
    expect(D5_R2_SOURCE_BASIS_TRACEABLE).toBe(true);
    expect(BASISLESS_AUTHORITATIVE_D5_R2_CONTEXT_AUTO_ACCEPTED).toBe(false);
    expect(D5_R2_SERVICE_CONTEXT_AUTO_CREATES_DESIGN_CONDITION).toBe(false);
    expect(D5_REUSES_CANONICAL_CURRENTNESS).toBe(true);
    expect(PARALLEL_D5_CURRENTNESS_ENGINE_CREATED).toBe(false);
    expect(D5_REUSES_CANONICAL_FINGERPRINT).toBe(true);
    expect(SECOND_D5_FINGERPRINT_ALGORITHM_CREATED).toBe(false);
    expect(PARALLEL_D5_IDENTITY_SYSTEM_CREATED).toBe(false);
    expect(D5_R2_PROVENANCE_REQUIRED).toBe(true);
    expect(D5_R2_PROVENANCE_PRESERVED).toBe(true);
    expect(D5_R2_AUTO_REPOINTED).toBe(false);
    expect(SILENT_D5_R2_MUTATION_ALLOWED).toBe(false);
    expect(D5_R2_HISTORY_PRESERVED).toBe(true);
    expect(TENANT_WORKSPACE_PROJECT_D5_R2_SCOPE_ENFORCED).toBe(true);
    expect(AI_EQUALS_D5_PIPING_ENGINEERING_AUTHORITY).toBe(false);
    expect(ADMIN_EQUALS_D5_PIPING_ENGINEERING_AUTHORITY).toBe(false);
    expect(D5_EQUALS_D1_STRUCTURAL_AUTHORITY).toBe(false);
    expect(D5_EQUALS_D2_CIVIL_AUTHORITY).toBe(false);
    expect(D5_EQUALS_D3_GEOTECHNICAL_AUTHORITY).toBe(false);
    expect(D5_EQUALS_D4_MECHANICAL_AUTHORITY).toBe(false);
    expect(D5_EQUALS_D6_PROCESS_AUTHORITY).toBe(false);
    expect(D5_EQUALS_D7_ELECTRICAL_AUTHORITY).toBe(false);
    expect(D5_EQUALS_D8_INSTRUMENTATION_CONTROL_AUTHORITY).toBe(false);
    expect(D5_R2_DUPLICATE_GOVERNANCE_IMPLEMENTED).toBe(true);
    expect(D5_R2_REPLAY_PROTECTION_IMPLEMENTED).toBe(true);
    expect(D5_R2_SPOOFING_PROTECTION_IMPLEMENTED).toBe(true);
    expect(D5_R3_STARTED).toBe(false);
    expect(D5_R2_CANONICAL_NEXT_PHASE).toBe("EOS-D5-R3-DESIGN-CONDITIONS-AND-SPECIFICATION-CONTEXT");
    expect(D5_R2_NEXT_PHASE_TYPE).toBe("DESIGN_CONDITIONS_AND_SPECIFICATION_CONTEXT");
    expect(D5_R2_CANONICAL_NEXT_PHASE_SCOPE).toContain("exact R1-R2 identities");
    expect(D5_R2_BLOCKER).toBe("NONE");
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
    expect([
      D5_DESIGN_CONDITION_SPECIFICATION_RUNTIME_COUNT,
      D5_COMPONENT_CONNECTION_VALVE_RUNTIME_COUNT,
      D5_ROUTING_ARRANGEMENT_FABRICATION_RUNTIME_COUNT,
      D5_STRESS_SUPPORT_TEST_EVIDENCE_RUNTIME_COUNT,
      D5_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_COUNT,
      D5_DISCIPLINE_INTERFACE_RUNTIME_COUNT,
      D5_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_COUNT,
      D5_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT,
      D5_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
      D5_D9_RUNTIME_INTEGRATION_COUNT,
      D5_PIPE_SIZING_RUNTIME_COUNT,
      D5_HYDRAULIC_CALCULATION_RUNTIME_COUNT,
      D5_PRESSURE_DROP_CALCULATION_RUNTIME_COUNT,
      D5_WALL_THICKNESS_CALCULATION_RUNTIME_COUNT,
      D5_BRANCH_REINFORCEMENT_CALCULATION_RUNTIME_COUNT,
      D5_FLANGE_RATING_CALCULATION_RUNTIME_COUNT,
      D5_PIPING_STRESS_CALCULATION_RUNTIME_COUNT,
      D5_FLEXIBILITY_CALCULATION_RUNTIME_COUNT,
      D5_SUPPORT_LOAD_CALCULATION_RUNTIME_COUNT,
      D5_ROUTE_OPTIMIZATION_RUNTIME_COUNT,
      D5_AUTOMATIC_ROUTING_RUNTIME_COUNT,
      D5_SPATIAL_CLASH_DETECTION_RUNTIME_COUNT,
      D5_AUTOMATIC_REDESIGN_RUNTIME_COUNT,
      D5_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT,
      D5_CONFORMANCE_DETERMINATION_RUNTIME_COUNT,
      D5_APPROVAL_RUNTIME_COUNT,
      D5_CERTIFICATION_RUNTIME_COUNT,
      D5_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT,
      D5_CROSS_DISCIPLINE_CONFLICT_DETECTION_RUNTIME_COUNT,
      D5_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT,
      D5_CROSS_DISCIPLINE_RECOMMENDATION_RUNTIME_COUNT,
    ].every((count) => count === 0)).toBe(true);
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D5.R2.PIPING_SYSTEM_LINE_AND_SERVICE_CONTEXT")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D5.R3.DESIGN_CONDITIONS_AND_SPECIFICATION_CONTEXT")?.implementationState).toBe("IMPLEMENTED_BOUNDED");

    const r1 = createD5R1Store();
    recordPipingContext(r1, actor, { contextId: "ctx-1", citedLifecycleStage: "FEED", provenanceRef: "prov-ctx" });
    const system = recordPipingObjectIdentity(r1, actor, { objectId: "sys-1", contextId: "ctx-1", objectType: "PIPING_SYSTEM_CONTEXT", citedLifecycleStage: "FEED", provenanceRef: "prov-sys" });
    const line = recordPipingObjectIdentity(r1, actor, { objectId: "line-1", contextId: "ctx-1", objectType: "PIPING_LINE", citedLifecycleStage: "FEED", provenanceRef: "prov-line" });
    const service = recordPipingObjectIdentity(r1, actor, { objectId: "svc-1", contextId: "ctx-1", objectType: "PIPING_SERVICE_CONTEXT", citedLifecycleStage: "FEED", provenanceRef: "prov-svc" });
    const store = createD5R2Store(r1);
    const bound = { contextId: "ctx-1", citedLifecycleStage: "FEED", provenanceRef: "prov-r2", sourceBasisRef: "basis-line-list-a", citedCurrentness: "CURRENT", processSourceRef: "process-source-p100" };
    const systemContext = recordPipingSystemContext(store, actor, {
      ...bound, objectId: system.objectId, objectRevisionFingerprint: system.fingerprint, systemRecordId: "sys-ctx-1",
      systemName: "Cooling water", systemDescription: "Plant cooling water piping", systemClassification: "UTILITY_PIPING_SYSTEM",
      systemFunction: "SUPPLY", grouping: "utilities", applicableScope: "unit-10",
    });
    expect(systemContext.processDesign).toBe(false);
    expect(systemContext.engineeringValidated).toBe(false);
    expect(systemContext.adoptedDesignCondition).toBe(false);
    expect(systemContext.createsAuthoritativeProcessCondition).toBe(false);
    expect(systemContext.processSourceRef).toBe("process-source-p100");
    expect(systemContext.objectRevisionFingerprint).toBe(system.fingerprint);
    const lineContext = recordPipingLineContext(store, actor, {
      ...bound, objectId: line.objectId, objectRevisionFingerprint: line.fingerprint, lineRecordId: "line-ctx-1",
      lineTag: "CW-100", lineDescription: "Cooling water supply line", lineClassification: "UTILITY_LINE", lineFunction: "SUPPLY", applicableScope: "unit-10",
    });
    expect(lineContext.designConditionEstablished).toBe(false);
    expect(lineContext.specificationEstablished).toBe(false);
    expect(lineContext.processDesign).toBe(false);
    const serviceContext = recordPipingServiceFunction(store, actor, {
      ...bound, objectId: service.objectId, objectRevisionFingerprint: service.fingerprint, serviceRecordId: "svc-ctx-1",
      serviceFunction: "SUPPLY", serviceDescription: "Supplies cooling water", applicableScope: "unit-10",
    });
    expect(serviceContext.processStream).toBe(false);
    expect(serviceContext.processCondition).toBe(false);
    expect(serviceContext.adoptedDesignCondition).toBe(false);
    const membership = recordPipingSystemLineMembership(store, actor, {
      ...bound, objectId: line.objectId, objectRevisionFingerprint: line.fingerprint, membershipId: "mem-1",
      systemObjectId: system.objectId, systemRevisionFingerprint: system.fingerprint, membershipBasis: "EXPLICIT",
    });
    expect(membership.membershipBasis).toBe("EXPLICIT");
    expect(membership.inferred).toBe(false);
    const association = recordPipingLineServiceAssociation(store, actor, {
      ...bound, objectId: line.objectId, objectRevisionFingerprint: line.fingerprint, associationId: "assoc-1",
      serviceObjectId: service.objectId, serviceRevisionFingerprint: service.fingerprint, associationBasis: "EXPLICIT",
    });
    expect(association.associationBasis).toBe("EXPLICIT");
    expect(association.processDesign).toBe(false);
    expect(recordPipingLineContext(store, actor, {
      ...bound, objectId: line.objectId, objectRevisionFingerprint: line.fingerprint, lineRecordId: "line-ctx-1",
      lineTag: "CW-100", lineDescription: "Cooling water supply line", lineClassification: "UTILITY_LINE", lineFunction: "SUPPLY", applicableScope: "unit-10",
    })).toBe(lineContext);
    expect(store.memberships).toHaveLength(1);
    expect(throws(() => recordPipingLineContext(store, actor, {
      ...bound, objectId: line.objectId, objectRevisionFingerprint: "latest", lineRecordId: "line-float",
      lineTag: "CW-101", lineDescription: "Another line", lineClassification: "UTILITY_LINE", lineFunction: "RETURN", applicableScope: "unit-10",
    }))).toBe("D5_R2_R1_REVISION_REQUIRED");
    expect(throws(() => recordPipingLineContext(store, actor, {
      ...bound, objectId: line.objectId, objectRevisionFingerprint: "wrong-revision", lineRecordId: "line-wrong",
      lineTag: "CW-102", lineDescription: "Wrong revision", lineClassification: "UTILITY_LINE", lineFunction: "RETURN", applicableScope: "unit-10",
    }))).toBe("D5_R2_R1_REVISION_MISMATCH");
    expect(throws(() => recordPipingSystemContext(store, actor, {
      ...bound, sourceBasisRef: "", objectId: system.objectId, objectRevisionFingerprint: system.fingerprint, systemRecordId: "sys-basis",
      systemName: "No basis", systemDescription: "Missing basis", systemClassification: "UTILITY_PIPING_SYSTEM", systemFunction: "SUPPLY", grouping: "utilities", applicableScope: "unit-10",
    }))).toBe("D5_R2_MISSING_SOURCE_BASIS");
    expect(throws(() => recordPipingSystemLineMembership(store, actor, {
      ...bound, objectId: line.objectId, objectRevisionFingerprint: line.fingerprint, membershipId: "mem-inferred",
      systemObjectId: system.objectId, systemRevisionFingerprint: system.fingerprint, membershipBasis: "line_tag_pattern",
    }))).toBe("D5_R2_INFERRED_MEMBERSHIP_REJECTED");
    expect(throws(() => recordPipingLineServiceAssociation(store, actor, {
      ...bound, objectId: line.objectId, objectRevisionFingerprint: line.fingerprint, associationId: "assoc-inferred",
      serviceObjectId: service.objectId, serviceRevisionFingerprint: service.fingerprint, associationBasis: "common_service_name",
    }))).toBe("D5_R2_INFERRED_SERVICE_REJECTED");
    expect(throws(() => recordPipingServiceFunction(store, actor, {
      ...bound, objectId: service.objectId, objectRevisionFingerprint: service.fingerprint, serviceRecordId: "svc-adopt",
      serviceFunction: "SUPPLY", serviceDescription: "Adopted", applicableScope: "unit-10", adoptProcessCondition: true,
    }))).toBe("D5_R2_PROCESS_CONDITION_NOT_ADOPTED");
    expect(throws(() => recordPipingLineContext(store, actor, {
      ...bound, objectId: line.objectId, objectRevisionFingerprint: line.fingerprint, lineRecordId: "line-pressure",
      lineTag: "CW-200", lineDescription: "Pressure line", lineClassification: "UTILITY_LINE", lineFunction: "SUPPLY", applicableScope: "unit-10", designPressure: "10 bar",
    }))).toBe("D5_R2_DESIGN_CONDITION_NOT_IN_R2");
    expect(throws(() => recordPipingLineContext(store, { ...actor, tenantId: "tenant-b" }, {
      ...bound, objectId: line.objectId, objectRevisionFingerprint: line.fingerprint, lineRecordId: "line-cross",
      lineTag: "CW-300", lineDescription: "Cross tenant", lineClassification: "UTILITY_LINE", lineFunction: "SUPPLY", applicableScope: "unit-10",
    }))).toBe("D5_R2_CROSS_SCOPE_OPERATION");
    expect(throws(() => recordPipingLineContext(store, { ...actor, authority: "ADMIN" }, {
      ...bound, objectId: line.objectId, objectRevisionFingerprint: line.fingerprint, lineRecordId: "line-admin",
      lineTag: "CW-400", lineDescription: "Admin", lineClassification: "UTILITY_LINE", lineFunction: "SUPPLY", applicableScope: "unit-10",
    }))).toBe("D5_R2_ADMIN_NOT_PIPING_AUTHORITY");
    expect(throws(() => recordPipingLineContext(store, { ...actor, actorId: "AI-recorder" }, {
      ...bound, objectId: line.objectId, objectRevisionFingerprint: line.fingerprint, lineRecordId: "line-ai",
      lineTag: "CW-500", lineDescription: "AI", lineClassification: "UTILITY_LINE", lineFunction: "SUPPLY", applicableScope: "unit-10",
    }))).toBe("D5_R2_AI_NOT_PIPING_AUTHORITY");
    expect(throws(() => recordPipingLineContext(store, actor, {
      ...bound, objectId: line.objectId, objectRevisionFingerprint: line.fingerprint, lineRecordId: "line-spoof",
      lineTag: "CW-600", lineDescription: "Spoof", lineClassification: "UTILITY_LINE", lineFunction: "SUPPLY", applicableScope: "unit-10", assertedFingerprint: "not-canonical",
    }))).toBe("D5_R2_FINGERPRINT_MISMATCH");
    const revisedLine = recordPipingObjectIdentity(r1, actor, {
      objectId: "line-2", contextId: "ctx-1", objectType: "PIPING_LINE", citedLifecycleStage: "DETAILED_DESIGN", provenanceRef: "prov-line-2", predecessorObjectId: "line-1",
    });
    expect(throws(() => recordPipingLineContext(store, actor, {
      ...bound, objectId: line.objectId, objectRevisionFingerprint: line.fingerprint, lineRecordId: "line-stale",
      lineTag: "CW-700", lineDescription: "Stale", lineClassification: "UTILITY_LINE", lineFunction: "SUPPLY", applicableScope: "unit-10",
    }))).toBe("D5_R2_R1_OBJECT_NOT_CURRENT");
    const revisedContext = recordPipingLineContext(store, actor, {
      ...bound, objectId: revisedLine.objectId, objectRevisionFingerprint: revisedLine.fingerprint, lineRecordId: "line-ctx-2",
      lineTag: "CW-100", lineDescription: "Revised cooling water supply line", lineClassification: "UTILITY_LINE", lineFunction: "SUPPLY", applicableScope: "unit-10", predecessorLineRecordId: "line-ctx-1",
    });
    expect(revisedContext.predecessorLineRecordId).toBe("line-ctx-1");
    expect(store.lines.find((row) => row.lineRecordId === "line-ctx-1")?.fingerprint).toBe(lineContext.fingerprint);
    expect(store.lines.find((row) => row.lineRecordId === "line-ctx-1")?.currentness).toBe("SUPERSEDED");
    expect(store.history.some((row) => row.subjectId === "line-ctx-1" && row.action === "CREATED" && row.fingerprint === lineContext.fingerprint)).toBe(true);
    expect(throws(() => repointPipingSystemLineService())).toBe("D5_R2_AUTO_REPOINT_REJECTED");
    expect(throws(() => mutatePipingSystemLineService())).toBe("D5_R2_CONTEXT_MUTATION_REJECTED");
    expect(throws(() => recordPipingDesignCondition())).toBe("D5_R2_DESIGN_CONDITION_NOT_IN_R2");
    expect(throws(() => recordPipingComponent())).toBe("D5_R2_COMPONENT_NOT_IN_R2");
    expect(throws(() => recordPipingRoute())).toBe("D5_R2_ROUTING_NOT_IN_R2");
    expect(throws(() => recordPipingStressSupport())).toBe("D5_R2_STRESS_SUPPORT_NOT_IN_R2");
    expect(throws(() => calculatePiping())).toBe("D5_R2_CALCULATION_NOT_IN_R2");
    expect(throws(() => validatePipingEngineering())).toBe("D5_R2_VALIDATION_NOT_IN_R2");
    const source = readFileSync(join(here, "system-line-service-context.ts"), "utf8");
    expect(scanAnalysisFormulaBypass("system-line-service-context.ts", source)).toEqual([]);
    expect(source.includes("createHash")).toBe(false);
    const packageJson = JSON.parse(readFileSync(join(here, "../../package.json"), "utf8")) as { dependencies: Record<string, string> };
    expect(Object.keys(packageJson.dependencies).sort()).toEqual([
      "@rtb/database", "@rtb/platform-commerce", "@rtb/platform-intelligence",
      "@rtb/platform-kernel", "@rtb/types", "docx", "exceljs", "pptxgenjs", "zod",
    ]);
  });
});
