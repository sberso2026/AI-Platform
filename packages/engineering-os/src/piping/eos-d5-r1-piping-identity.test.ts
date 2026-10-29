import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  D5_PIPING_OBJECT_TYPES,
  D5_R1_STARTED,
  D5_RUNTIME_COUNT as ARCHITECTURE_D5_RUNTIME_COUNT,
  D5_RUNTIME_STARTED as ARCHITECTURE_D5_RUNTIME_STARTED,
} from "@rtb/types";
import { describe, expect, it } from "vitest";
import { D4_RUNTIME_COUNT as LIVE_D4_RUNTIME_COUNT } from "../mechanical/d9-source-contract";
import { D5_0_STARTED } from "../mechanical/mechanical-bounded-closeout";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import { STRUCTURAL_CAPABILITY_MANIFEST } from "../structural-concrete/capability";
import { scanAnalysisFormulaBypass } from "../structural-systems/formula-scan";
import {
  ADMIN_EQUALS_D5_PIPING_ENGINEERING_AUTHORITY,
  AI_EQUALS_D5_PIPING_ENGINEERING_AUTHORITY,
  CROSS_TENANT_D5_IDENTITY_ACCESS_ALLOWED,
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
  D5_AUTOMATIC_MATURITY_PROGRESSION_ALLOWED,
  D5_AUTOMATIC_REDESIGN_RUNTIME_COUNT,
  D5_AUTOMATIC_ROUTING_RUNTIME_COUNT,
  D5_BRANCH_REINFORCEMENT_CALCULATION_RUNTIME_COUNT,
  D5_CANONICAL_OBJECT_TAXONOMY_REUSED,
  D5_CERTIFICATION_RUNTIME_COUNT,
  D5_COMPONENT_CONNECTION_VALVE_RUNTIME_COUNT,
  D5_CONFORMANCE_DETERMINATION_RUNTIME_COUNT,
  D5_CONTEXT_AUTHORITY,
  D5_CROSS_DISCIPLINE_CONFLICT_DETECTION_RUNTIME_COUNT,
  D5_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT,
  D5_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT,
  D5_CROSS_DISCIPLINE_RECOMMENDATION_RUNTIME_COUNT,
  D5_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT,
  D5_D9_RUNTIME_INTEGRATION_COUNT,
  D5_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
  D5_DESIGN_CONDITION_SPECIFICATION_RUNTIME_COUNT,
  D5_DISCIPLINE,
  D5_DISCIPLINE_INTERFACE_RUNTIME_COUNT,
  D5_EQUALS_D1_STRUCTURAL_AUTHORITY,
  D5_EQUALS_D2_CIVIL_AUTHORITY,
  D5_EQUALS_D3_GEOTECHNICAL_AUTHORITY,
  D5_EQUALS_D4_MECHANICAL_AUTHORITY,
  D5_EQUALS_D6_PROCESS_AUTHORITY,
  D5_EQUALS_D7_ELECTRICAL_AUTHORITY,
  D5_EQUALS_D8_INSTRUMENTATION_CONTROL_AUTHORITY,
  D5_EXPLICIT_IDENTITY_RELATIONSHIPS_SUPPORTED,
  D5_FLEXIBILITY_CALCULATION_RUNTIME_COUNT,
  D5_FLANGE_RATING_CALCULATION_RUNTIME_COUNT,
  D5_HYDRAULIC_CALCULATION_RUNTIME_COUNT,
  D5_IDENTITY_EQUALS_ENGINEERING_CONTENT,
  D5_IDENTITY_EQUALS_VALIDATED_ENGINEERING,
  D5_IDENTITY_LIFECYCLE_GOVERNANCE_IMPLEMENTED,
  D5_IDENTITY_MATURITY_GOVERNANCE_IMPLEMENTED,
  D5_INFERRED_ENGINEERING_RELATIONSHIPS_ALLOWED,
  D5_OBJECT_EXISTENCE_EQUALS_ENGINEERING_VALIDATED,
  D5_OBJECT_TYPE_ALLOWLIST_ENFORCED,
  D5_PIPE_SIZING_RUNTIME_COUNT,
  D5_PIPING_IDENTITY_IMPLEMENTED,
  D5_PIPING_IDENTITY_OBJECT_FOUNDATION_RUNTIME_COUNT,
  D5_PIPING_IDENTITY_OBJECT_FOUNDATION_RUNTIME_IMPLEMENTED,
  D5_PIPING_IDENTITY_OBJECT_FOUNDATION_RUNTIME_READY,
  D5_PIPING_LINE_IDENTITY_SUPPORTED,
  D5_PIPING_STRESS_CALCULATION_RUNTIME_COUNT,
  D5_PIPING_SYSTEM_IDENTITY_SUPPORTED,
  D5_PRESSURE_DROP_CALCULATION_RUNTIME_COUNT,
  D5_R1_AUTO_REPOINTED,
  D5_R1_BLOCKER,
  D5_R1_CANONICAL_NEXT_PHASE,
  D5_R1_CANONICAL_NEXT_PHASE_SCOPE,
  D5_R1_DUPLICATE_GOVERNANCE_IMPLEMENTED,
  D5_R1_HISTORY_PRESERVED,
  D5_R1_MATURITY,
  D5_R1_NEXT_PHASE_TYPE,
  D5_R1_PROVENANCE_PRESERVED,
  D5_R1_PROVENANCE_REQUIRED,
  D5_R1_REPLAY_PROTECTION_IMPLEMENTED,
  D5_R1_SPOOFING_PROTECTION_IMPLEMENTED,
  D5_R1_STATUS,
  D5_R2_STARTED,
  D5_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_COUNT,
  D5_REUSES_CANONICAL_CURRENTNESS,
  D5_REUSES_CANONICAL_FINGERPRINT,
  D5_REUSES_CANONICAL_IDENTITY_GOVERNANCE,
  D5_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_COUNT,
  D5_ROUTE_OPTIMIZATION_RUNTIME_COUNT,
  D5_ROUTING_ARRANGEMENT_FABRICATION_RUNTIME_COUNT,
  D5_RUNTIME_COUNT,
  D5_RUNTIME_STARTED,
  D5_SPATIAL_CLASH_DETECTION_RUNTIME_COUNT,
  D5_STRESS_SUPPORT_TEST_EVIDENCE_RUNTIME_COUNT,
  D5_SUPPORT_LOAD_CALCULATION_RUNTIME_COUNT,
  D5_SYSTEM_LINE_SERVICE_CONTEXT_RUNTIME_COUNT,
  D5_WALL_THICKNESS_CALCULATION_RUNTIME_COUNT,
  DATABASE_SCHEMA_CHANGED,
  FREEFORM_AUTHORITATIVE_D5_OBJECT_TYPES_ALLOWED,
  NEW_DEPENDENCY_ADDED,
  PARALLEL_D5_CURRENTNESS_ENGINE_CREATED,
  PARALLEL_D5_IDENTITY_SYSTEM_CREATED,
  PIPING_LINE_IDENTITY_EQUALS_LINE_SERVICE_ENGINEERING,
  PIPING_LINE_IDENTITY_EQUALS_PROCESS_STREAM,
  PIPING_SYSTEM_IDENTITY_EQUALS_PROCESS_SYSTEM_DESIGN,
  SECOND_D5_FINGERPRINT_ALGORITHM_CREATED,
  SILENT_D5_R1_MUTATION_ALLOWED,
  TENANT_WORKSPACE_PROJECT_D5_R1_SCOPE_ENFORCED,
  UNKNOWN_D5_OBJECT_TYPE_AUTO_ACCEPTED,
  advancePipingMaturity,
  calculatePiping,
  createD5R1Store,
  mutatePipingIdentity,
  recordPipingContext,
  recordPipingDesignCondition,
  recordPipingLineService,
  recordPipingObjectIdentity,
  recordPipingRoute,
  recordPipingSpecification,
  recordPipingStressSupport,
  repointPipingIdentity,
  validatePipingEngineering,
  type D5R1Actor,
} from "./identity-foundation";

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

describe("EOS-D5-R1 piping identity and object foundation", () => {
  it("records governed piping identity without engineering content", () => {
    expect(D5_R1_STATUS).toBe("PIPING_IDENTITY_AND_OBJECT_FOUNDATION_IMPLEMENTED");
    expect(D5_R1_MATURITY).toBe(D5_R1_STATUS);
    expect(D5_RUNTIME_STARTED).toBe(true);
    expect(D5_RUNTIME_COUNT).toBe(1);
    expect(ARCHITECTURE_D5_RUNTIME_COUNT).toBe(0);
    expect(ARCHITECTURE_D5_RUNTIME_STARTED).toBe(false);
    expect(D5_R1_STARTED).toBe(false);
    expect(D5_0_STARTED).toBe(false);
    expect(LIVE_D4_RUNTIME_COUNT).toBe(11);
    expect(D5_PIPING_IDENTITY_OBJECT_FOUNDATION_RUNTIME_IMPLEMENTED).toBe(true);
    expect(D5_PIPING_IDENTITY_OBJECT_FOUNDATION_RUNTIME_COUNT).toBe(1);
    expect(D5_PIPING_IDENTITY_OBJECT_FOUNDATION_RUNTIME_READY).toBe(true);
    expect(D5_CANONICAL_OBJECT_TAXONOMY_REUSED).toBe(true);
    expect(D5_OBJECT_TYPE_ALLOWLIST_ENFORCED).toBe(true);
    expect(FREEFORM_AUTHORITATIVE_D5_OBJECT_TYPES_ALLOWED).toBe(false);
    expect(UNKNOWN_D5_OBJECT_TYPE_AUTO_ACCEPTED).toBe(false);
    expect(D5_PIPING_OBJECT_TYPES).toEqual([
      "PIPING_SYSTEM_CONTEXT",
      "PIPING_LINE",
      "PIPING_SERVICE_CONTEXT",
      "PIPING_DESIGN_CONDITION_CONTEXT",
      "PIPING_SPECIFICATION_CONTEXT",
      "PIPING_COMPONENT_CONTEXT",
      "PIPING_VALVE_CONTEXT",
      "PIPING_SPECIALTY_CONTEXT",
      "PIPING_CONNECTION_CONTEXT",
      "PIPING_ROUTE_CONTEXT",
      "PIPING_SUPPORT_REQUIREMENT_CONTEXT",
      "PIPING_STRESS_FLEXIBILITY_CONTEXT",
      "PIPING_FABRICATION_CONTEXT",
      "PIPING_TEST_INSPECTION_CONTEXT",
      "PIPING_INTERFACE_POINT",
      "PIPING_GOVERNANCE_RECORD",
    ]);
    expect(D5_PIPING_IDENTITY_IMPLEMENTED).toBe(true);
    expect(D5_PIPING_LINE_IDENTITY_SUPPORTED).toBe(true);
    expect(D5_PIPING_SYSTEM_IDENTITY_SUPPORTED).toBe(true);
    expect(D5_REUSES_CANONICAL_IDENTITY_GOVERNANCE).toBe(true);
    expect(D5_REUSES_CANONICAL_CURRENTNESS).toBe(true);
    expect(D5_REUSES_CANONICAL_FINGERPRINT).toBe(true);
    expect(PARALLEL_D5_IDENTITY_SYSTEM_CREATED).toBe(false);
    expect(PARALLEL_D5_CURRENTNESS_ENGINE_CREATED).toBe(false);
    expect(SECOND_D5_FINGERPRINT_ALGORITHM_CREATED).toBe(false);
    expect(D5_IDENTITY_EQUALS_ENGINEERING_CONTENT).toBe(false);
    expect(D5_IDENTITY_EQUALS_VALIDATED_ENGINEERING).toBe(false);
    expect(D5_OBJECT_EXISTENCE_EQUALS_ENGINEERING_VALIDATED).toBe(false);
    expect(PIPING_LINE_IDENTITY_EQUALS_PROCESS_STREAM).toBe(false);
    expect(PIPING_LINE_IDENTITY_EQUALS_LINE_SERVICE_ENGINEERING).toBe(false);
    expect(PIPING_SYSTEM_IDENTITY_EQUALS_PROCESS_SYSTEM_DESIGN).toBe(false);
    expect(D5_EXPLICIT_IDENTITY_RELATIONSHIPS_SUPPORTED).toBe(true);
    expect(D5_INFERRED_ENGINEERING_RELATIONSHIPS_ALLOWED).toBe(false);
    expect(D5_IDENTITY_LIFECYCLE_GOVERNANCE_IMPLEMENTED).toBe(true);
    expect(D5_IDENTITY_MATURITY_GOVERNANCE_IMPLEMENTED).toBe(true);
    expect(D5_AUTOMATIC_MATURITY_PROGRESSION_ALLOWED).toBe(false);
    expect(D5_R1_PROVENANCE_REQUIRED).toBe(true);
    expect(D5_R1_PROVENANCE_PRESERVED).toBe(true);
    expect(D5_R1_AUTO_REPOINTED).toBe(false);
    expect(SILENT_D5_R1_MUTATION_ALLOWED).toBe(false);
    expect(D5_R1_HISTORY_PRESERVED).toBe(true);
    expect(TENANT_WORKSPACE_PROJECT_D5_R1_SCOPE_ENFORCED).toBe(true);
    expect(CROSS_TENANT_D5_IDENTITY_ACCESS_ALLOWED).toBe(false);
    expect(AI_EQUALS_D5_PIPING_ENGINEERING_AUTHORITY).toBe(false);
    expect(ADMIN_EQUALS_D5_PIPING_ENGINEERING_AUTHORITY).toBe(false);
    expect(D5_EQUALS_D1_STRUCTURAL_AUTHORITY).toBe(false);
    expect(D5_EQUALS_D2_CIVIL_AUTHORITY).toBe(false);
    expect(D5_EQUALS_D3_GEOTECHNICAL_AUTHORITY).toBe(false);
    expect(D5_EQUALS_D4_MECHANICAL_AUTHORITY).toBe(false);
    expect(D5_EQUALS_D6_PROCESS_AUTHORITY).toBe(false);
    expect(D5_EQUALS_D7_ELECTRICAL_AUTHORITY).toBe(false);
    expect(D5_EQUALS_D8_INSTRUMENTATION_CONTROL_AUTHORITY).toBe(false);
    expect(D5_R1_DUPLICATE_GOVERNANCE_IMPLEMENTED).toBe(true);
    expect(D5_R1_REPLAY_PROTECTION_IMPLEMENTED).toBe(true);
    expect(D5_R1_SPOOFING_PROTECTION_IMPLEMENTED).toBe(true);
    expect([
      D5_SYSTEM_LINE_SERVICE_CONTEXT_RUNTIME_COUNT,
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
    expect(D1_STRUCTURAL_PACK_COMPLETE).toBe(false);
    expect(D1N_REOPENED).toBe(false);
    expect(D2_TRACK_COMPLETE).toBe(true);
    expect(D2_REOPENED).toBe(false);
    expect(D3_TRACK_COMPLETE).toBe(true);
    expect(D3_REOPENED).toBe(false);
    expect(D4_TRACK_COMPLETE).toBe(true);
    expect(D4_REOPENED).toBe(false);
    expect(DATABASE_SCHEMA_CHANGED).toBe(false);
    expect(NEW_DEPENDENCY_ADDED).toBe(false);
    expect(D5_R2_STARTED).toBe(false);
    expect(D5_R1_CANONICAL_NEXT_PHASE).toBe("EOS-D5-R2-PIPING-SYSTEM-LINE-AND-SERVICE-CONTEXT");
    expect(D5_R1_NEXT_PHASE_TYPE).toBe("PIPING_SYSTEM_LINE_AND_SERVICE_CONTEXT");
    expect(D5_R1_CANONICAL_NEXT_PHASE_SCOPE).toContain("exact R1 identities");
    expect(D5_R1_BLOCKER).toBe("NONE");
    expect(D5_CONTEXT_AUTHORITY).toBe("PIPING_CONTEXT_AUTHORITY");
    expect(D5_DISCIPLINE).toBe("PIPING");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D5.R1.PIPING_IDENTITY_AND_OBJECT_FOUNDATION")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D5.R2.PIPING_SYSTEM_LINE_AND_SERVICE_CONTEXT")?.implementationState).toBe("IMPLEMENTED_BOUNDED");

    const store = createD5R1Store();
    const context = recordPipingContext(store, actor, {
      contextId: "ctx-1",
      citedLifecycleStage: "FEED",
      provenanceRef: "prov-ctx-1",
    });
    expect(context.pipingEngineeringAuthority).toBe(false);
    expect(context.engineeringValidated).toBe(false);
    expect(context.currentness).toBe("CURRENT");
    expect(recordPipingContext(store, actor, { contextId: "ctx-1", citedLifecycleStage: "FEED", provenanceRef: "prov-ctx-1" })).toBe(context);

    const system = recordPipingObjectIdentity(store, actor, {
      objectId: "sys-1",
      contextId: "ctx-1",
      objectType: "PIPING_SYSTEM_CONTEXT",
      citedLifecycleStage: "FEED",
      provenanceRef: "prov-sys-1",
    });
    const line = recordPipingObjectIdentity(store, actor, {
      objectId: "line-1",
      contextId: "ctx-1",
      objectType: "PIPING_LINE",
      citedLifecycleStage: "FEED",
      provenanceRef: "prov-line-1",
      parentObjectId: "sys-1",
    });
    expect(system.objectType).toBe("PIPING_SYSTEM_CONTEXT");
    expect(line.serviceEstablished).toBe(false);
    expect(line.designConditionEstablished).toBe(false);
    expect(line.specificationEstablished).toBe(false);
    expect(line.routingEstablished).toBe(false);
    expect(line.stressAdequacyEstablished).toBe(false);
    expect(line.supportAdequacyEstablished).toBe(false);
    expect(line.testingEstablished).toBe(false);
    expect(line.engineeringValidated).toBe(false);
    expect(line.relationships).toEqual([{ kind: "PARENT", targetObjectId: "sys-1" }]);
    expect(line.fingerprint).toBe(fingerprintCanonical({
      objectId: "line-1",
      contextId: "ctx-1",
      objectType: "PIPING_LINE",
      tenantId: actor.tenantId,
      workspaceId: actor.workspaceId,
      projectId: actor.projectId,
      discipline: "PIPING",
      citedLifecycleStage: "FEED",
      parentObjectId: "sys-1",
      relationships: [{ kind: "PARENT", targetObjectId: "sys-1" }],
      provenanceRef: "prov-line-1",
      authority: "PIPING_CONTEXT_AUTHORITY",
      predecessorObjectId: null,
    }));
    expect(recordPipingObjectIdentity(store, actor, {
      objectId: "line-1",
      contextId: "ctx-1",
      objectType: "PIPING_LINE",
      citedLifecycleStage: "FEED",
      provenanceRef: "prov-line-1",
      parentObjectId: "sys-1",
    })).toBe(line);

    const revised = recordPipingObjectIdentity(store, actor, {
      objectId: "line-2",
      contextId: "ctx-1",
      objectType: "PIPING_LINE",
      citedLifecycleStage: "DETAILED_DESIGN",
      provenanceRef: "prov-line-2",
      parentObjectId: "sys-1",
      predecessorObjectId: "line-1",
    });
    expect(revised.predecessorObjectId).toBe("line-1");
    expect(store.objects.find((row) => row.objectId === "line-1")?.currentness).toBe("SUPERSEDED");
    expect(store.objects.find((row) => row.objectId === "line-1")?.fingerprint).toBe(line.fingerprint);
    expect(store.history.some((row) => row.subjectId === "line-1" && row.action === "CREATED" && row.fingerprint === line.fingerprint)).toBe(true);
    expect(throws(() => repointPipingIdentity())).toBe("D5_R1_AUTO_REPOINT_REJECTED");
    expect(throws(() => mutatePipingIdentity())).toBe("D5_R1_IDENTITY_MUTATION_REJECTED");
    expect(throws(() => advancePipingMaturity())).toBe("D5_R1_MATURITY_PROGRESSION_NOT_IN_R1");
    expect(throws(() => recordPipingObjectIdentity(store, actor, {
      objectId: "bad-type",
      contextId: "ctx-1",
      objectType: "FREEFORM_PIPE",
      citedLifecycleStage: "FEED",
      provenanceRef: "prov-bad",
    }))).toBe("D5_R1_OBJECT_TYPE_NOT_ALLOWLISTED");
    expect(throws(() => recordPipingObjectIdentity(store, actor, {
      objectId: "inferred",
      contextId: "ctx-1",
      objectType: "PIPING_LINE",
      citedLifecycleStage: "FEED",
      provenanceRef: "prov-inferred",
      relationships: [{ kind: "tag_similarity", targetObjectId: "sys-1" }],
    }))).toBe("D5_R1_INFERRED_RELATIONSHIP_REJECTED");
    expect(throws(() => recordPipingObjectIdentity(store, actor, {
      objectId: "service",
      contextId: "ctx-1",
      objectType: "PIPING_LINE",
      citedLifecycleStage: "FEED",
      provenanceRef: "prov-service",
      lineServiceEngineering: true,
    }))).toBe("D5_R1_LINE_SERVICE_NOT_IN_R1");
    expect(throws(() => recordPipingObjectIdentity(store, { ...actor, tenantId: "tenant-b" }, {
      objectId: "cross",
      contextId: "ctx-1",
      objectType: "PIPING_LINE",
      citedLifecycleStage: "FEED",
      provenanceRef: "prov-cross",
    }))).toBe("D5_R1_CROSS_TENANT_OPERATION");
    expect(throws(() => recordPipingObjectIdentity(store, { ...actor, authority: "ADMIN" }, {
      objectId: "admin",
      contextId: "ctx-1",
      objectType: "PIPING_LINE",
      citedLifecycleStage: "FEED",
      provenanceRef: "prov-admin",
    }))).toBe("D5_R1_ADMIN_NOT_PIPING_AUTHORITY");
    expect(throws(() => recordPipingObjectIdentity(store, { ...actor, actorId: "AI-candidate" }, {
      objectId: "ai",
      contextId: "ctx-1",
      objectType: "PIPING_LINE",
      citedLifecycleStage: "FEED",
      provenanceRef: "prov-ai",
    }))).toBe("D5_R1_AI_NOT_PIPING_AUTHORITY");
    expect(throws(() => recordPipingObjectIdentity(store, actor, {
      objectId: "spoof",
      contextId: "ctx-1",
      objectType: "PIPING_LINE",
      citedLifecycleStage: "FEED",
      provenanceRef: "prov-spoof",
      assertedFingerprint: "not-the-fingerprint",
    }))).toBe("D5_R1_FINGERPRINT_MISMATCH");
    expect(throws(() => recordPipingObjectIdentity(store, actor, {
      objectId: "line-2",
      contextId: "ctx-1",
      objectType: "PIPING_LINE",
      citedLifecycleStage: "FEED",
      provenanceRef: "prov-replay-mismatch",
      parentObjectId: "sys-1",
    }))).toBe("D5_R1_DUPLICATE_OBJECT_REJECTED");
    expect(throws(() => recordPipingLineService())).toBe("D5_R1_LINE_SERVICE_NOT_IN_R1");
    expect(throws(() => recordPipingDesignCondition())).toBe("D5_R1_DESIGN_CONDITION_NOT_IN_R1");
    expect(throws(() => recordPipingSpecification())).toBe("D5_R1_SPECIFICATION_NOT_IN_R1");
    expect(throws(() => recordPipingRoute())).toBe("D5_R1_ROUTING_NOT_IN_R1");
    expect(throws(() => recordPipingStressSupport())).toBe("D5_R1_STRESS_SUPPORT_NOT_IN_R1");
    expect(throws(() => calculatePiping())).toBe("D5_R1_CALCULATION_NOT_IN_R1");
    expect(throws(() => validatePipingEngineering())).toBe("D5_R1_VALIDATION_NOT_IN_R1");

    const source = readFileSync(join(here, "identity-foundation.ts"), "utf8");
    expect(scanAnalysisFormulaBypass("identity-foundation.ts", source)).toEqual([]);
    expect(source.includes("createHash")).toBe(false);
    expect(source.includes("eval(")).toBe(false);
    expect(source.includes("child_process")).toBe(false);
    const packageJson = JSON.parse(readFileSync(join(here, "../../package.json"), "utf8")) as { dependencies: Record<string, string> };
    expect(Object.keys(packageJson.dependencies).sort()).toEqual([
      "@rtb/database",
            "@rtb/platform-commerce",
      "@rtb/platform-intelligence",
      "@rtb/platform-kernel",
      "@rtb/types",
      "docx",
      "exceljs",
      "pptxgenjs",
      "zod",
    ]);
  });
});
