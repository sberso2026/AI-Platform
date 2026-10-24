import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { D5_RUNTIME_COUNT as ARCHITECTURE_D5_RUNTIME_COUNT, D5_RUNTIME_STARTED as TYPES_D5_RUNTIME_STARTED } from "@rtb/types";
import { describe, expect, it } from "vitest";
import { STRUCTURAL_CAPABILITY_MANIFEST } from "../structural-concrete/capability";
import { scanAnalysisFormulaBypass } from "../structural-systems/formula-scan";
import { createD5R4Store, recordPipingComponentContext, recordPipingConnectionContext } from "./component-connection-valve-context";
import { createD5R3Store, recordPipingDesignCondition, recordPipingSpecificationContext } from "./design-condition-specification-context";
import { createD5R1Store, recordPipingContext, recordPipingObjectIdentity, type D5R1Actor } from "./identity-foundation";
import {
  ADMIN_ACTION_EQUALS_PIPING_ENGINEERING_DECISION,
  ADMIN_CAN_CLOSE_D5_ENGINEERING_REASSESSMENT_AS_VALIDATED,
  ADMIN_EQUALS_D5_PIPING_ENGINEERING_AUTHORITY,
  AI_CAN_CLOSE_D5_ENGINEERING_REASSESSMENT_AS_VALIDATED,
  AI_CAN_INVENT_AUTHORITATIVE_D5_ASSUMPTION,
  AI_EQUALS_D5_PIPING_ENGINEERING_AUTHORITY,
  AI_RECOMMENDATION_EQUALS_PIPING_ENGINEERING_DECISION,
  ASSUMPTION_EQUALS_ENGINEERING_VALIDATED,
  ASSUMPTION_EQUALS_VALIDATED_FACT,
  CURRENT_D5_RECORD_EQUALS_VALIDATED,
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
  D5_CHANGE_AUTO_APPROVES_ENGINEERING,
  D5_CHANGE_AUTO_DETERMINES_CONFORMANCE,
  D5_CHANGE_AUTO_RECALCULATES_ENGINEERING,
  D5_CHANGE_AUTO_REDESIGNS_ENGINEERING,
  D5_CHANGE_AUTO_REVALIDATES_ENGINEERING,
  D5_COMPONENT_SIZING_RUNTIME_COUNT,
  D5_CONFORMANCE_DETERMINATION_RUNTIME_COUNT,
  D5_CROSS_DISCIPLINE_CONFLICT_DETECTION_RUNTIME_COUNT,
  D5_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT,
  D5_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT,
  D5_CROSS_DISCIPLINE_RECOMMENDATION_RUNTIME_COUNT,
  D5_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT,
  D5_D9_RUNTIME_INTEGRATION_COUNT,
  D5_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
  D5_DISCIPLINE_INTERFACE_RUNTIME_COUNT,
  D5_EQUALS_D1_STRUCTURAL_AUTHORITY,
  D5_EQUALS_D2_CIVIL_AUTHORITY,
  D5_EQUALS_D3_GEOTECHNICAL_AUTHORITY,
  D5_EQUALS_D4_MECHANICAL_AUTHORITY,
  D5_EQUALS_D6_PROCESS_AUTHORITY,
  D5_EQUALS_D7_ELECTRICAL_AUTHORITY,
  D5_EQUALS_D8_INSTRUMENTATION_CONTROL_AUTHORITY,
  D5_EXPLICIT_CHANGE_DEPENDENCIES_SUPPORTED,
  D5_FLEXIBILITY_CALCULATION_RUNTIME_COUNT,
  D5_FLANGE_RATING_CALCULATION_RUNTIME_COUNT,
  D5_GEOMETRY_SOLVER_RUNTIME_COUNT,
  D5_HYDRAULIC_CALCULATION_RUNTIME_COUNT,
  D5_INFERRED_CHANGE_DEPENDENCIES_ALLOWED,
  D5_PIPE_SIZING_RUNTIME_COUNT,
  D5_PIPING_ASSUMPTION_GOVERNANCE_IMPLEMENTED,
  D5_PIPING_CHANGE_GOVERNANCE_IMPLEMENTED,
  D5_PIPING_ENGINEERING_DECISION_GOVERNANCE_IMPLEMENTED,
  D5_PIPING_REQUIREMENT_GOVERNANCE_IMPLEMENTED,
  D5_PIPING_STRESS_CALCULATION_RUNTIME_COUNT,
  D5_PRESSURE_DROP_CALCULATION_RUNTIME_COUNT,
  D5_R1_R6_EXACT_SUBJECT_REVISIONS_REUSED,
  D5_R3_CHANGE_INTEGRATION_IMPLEMENTED,
  D5_R4_CHANGE_INTEGRATION_IMPLEMENTED,
  D5_R5_CHANGE_INTEGRATION_IMPLEMENTED,
  D5_R6_CHANGE_INTEGRATION_IMPLEMENTED,
  D5_R6_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_COUNT,
  D5_R6_RUNTIME_COUNT,
  D5_R7_AUTO_CHANGES_GEOMETRY,
  D5_R7_AUTO_CHANGES_R3_PIPING_CLASS,
  D5_R7_AUTO_CHANGES_R3_SPECIFICATION,
  D5_R7_AUTO_RECALCULATES_FLEXIBILITY,
  D5_R7_AUTO_RECALCULATES_R3_DESIGN_CONDITION,
  D5_R7_AUTO_RECALCULATES_STRESS,
  D5_R7_AUTO_RECALCULATES_SUPPORT_LOAD,
  D5_R7_AUTO_REGENERATES_ISOMETRIC,
  D5_R7_AUTO_REGENERATES_SPOOL,
  D5_R7_AUTO_REPLACES_COMPONENT,
  D5_R7_AUTO_REPOINTS_DEPENDENT_HISTORY,
  D5_R7_AUTO_RESELECTS_COMPONENT,
  D5_R7_AUTO_RESELECTS_VALVE,
  D5_R7_AUTO_REVALIDATES_EXTERNAL_EVIDENCE,
  D5_R7_AUTO_REWRITES_NDE_RESULT,
  D5_R7_AUTO_REWRITES_TEST_RESULT,
  D5_R7_AUTO_REROUTES_PIPING,
  D5_R7_BLOCKER,
  D5_R7_CANONICAL_NEXT_PHASE,
  D5_R7_CANONICAL_NEXT_PHASE_SCOPE,
  D5_R7_CHANGE_CAN_MARK_EXPLICIT_DEPENDENT_RECORD_STALE,
  D5_R7_CHANGE_CAN_REQUIRE_REASSESSMENT,
  D5_R7_DUPLICATE_GOVERNANCE_IMPLEMENTED,
  D5_R7_HIDDEN_CALCULATION_ALLOWED,
  D5_R7_HISTORY_PRESERVED,
  D5_R7_INFERRED_STALENESS_PROPAGATION_ALLOWED,
  D5_R7_MATURITY,
  D5_R7_NEXT_PHASE_TYPE,
  D5_R7_PROVENANCE_PRESERVED,
  D5_R7_PROVENANCE_REQUIRED,
  D5_R7_REPLAY_PROTECTION_IMPLEMENTED,
  D5_R7_SPOOFING_PROTECTION_IMPLEMENTED,
  D5_R7_STATUS,
  D5_R7_SUBJECT_AUTO_REPOINTED,
  D5_R8_STARTED,
  D5_REASSESSMENT_GOVERNANCE_IMPLEMENTED,
  D5_REQUIREMENT_SOURCE_BASIS_REQUIRED,
  D5_REQUIREMENT_SOURCE_BASIS_TRACEABLE,
  D5_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_COUNT,
  D5_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_IMPLEMENTED,
  D5_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY,
  D5_REUSES_CANONICAL_ASSUMPTION_GOVERNANCE,
  D5_REUSES_CANONICAL_CHANGE_GOVERNANCE,
  D5_REUSES_CANONICAL_CURRENTNESS,
  D5_REUSES_CANONICAL_DECISION_GOVERNANCE,
  D5_REUSES_CANONICAL_FINGERPRINT,
  D5_REUSES_CANONICAL_REQUIREMENT_GOVERNANCE,
  D5_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_COUNT,
  D5_ROUTE_OPTIMIZATION_RUNTIME_COUNT,
  D5_RUNTIME_COUNT,
  D5_RUNTIME_STARTED,
  D5_SPATIAL_CLASH_DETECTION_RUNTIME_COUNT,
  D5_SUPERSESSION_GOVERNANCE_IMPLEMENTED,
  D5_SUPERSESSION_HISTORY_PRESERVED,
  D5_SUPPORT_LOAD_CALCULATION_RUNTIME_COUNT,
  D5_VALVE_SIZING_RUNTIME_COUNT,
  D5_WALL_THICKNESS_CALCULATION_RUNTIME_COUNT,
  D6_RUNTIME_STARTED,
  D9_RUNTIME_COUNT,
  D9_RUNTIME_STARTED,
  DATABASE_SCHEMA_CHANGED,
  EXACT_D5_R7_SUBJECT_REVISION_REQUIRED,
  FLOATING_D5_R7_SUBJECT_REFERENCE_ALLOWED,
  NEW_DEPENDENCY_ADDED,
  PARALLEL_D5_ASSUMPTION_ENGINE_CREATED,
  PARALLEL_D5_CHANGE_ENGINE_CREATED,
  PARALLEL_D5_CURRENTNESS_ENGINE_CREATED,
  PARALLEL_D5_DECISION_ENGINE_CREATED,
  PARALLEL_D5_REQUIREMENT_ENGINE_CREATED,
  REASSESSMENT_COMPLETED_EQUALS_APPROVED,
  REASSESSMENT_COMPLETED_EQUALS_VALIDATED,
  REASSESSMENT_REQUIRED_EQUALS_INVALID,
  REASSESSMENT_REQUIRED_EQUALS_RECALCULATED,
  REASSESSMENT_REQUIRED_EQUALS_REDESIGNED,
  REASSESSMENT_REQUIRED_EQUALS_VALIDATED,
  REQUIREMENT_PRESENT_EQUALS_CONFORMANT,
  REQUIREMENT_PRESENT_EQUALS_VALIDATED,
  SECOND_D5_FINGERPRINT_ALGORITHM_CREATED,
  SILENT_D5_R7_MUTATION_ALLOWED,
  SOURCE_REQUIREMENT_AUTO_ADOPTED_AS_D5_REQUIREMENT,
  SOURCE_REQUIREMENT_EQUALS_ADOPTED_PIPING_REQUIREMENT,
  STALE_D5_RECORD_EQUALS_INVALID,
  SUPERSEDED_D5_RECORD_DELETED,
  SUPERSEDED_D5_RECORD_EQUALS_INVALID,
  TENANT_WORKSPACE_PROJECT_D5_R7_SCOPE_ENFORCED,
  VENDOR_REQUIREMENT_AUTO_ADOPTED_AS_D5_REQUIREMENT,
  approvePipingChange,
  changePipingSpecification,
  closePipingReassessmentAsValidated,
  createD5R7Store,
  determinePipingConformance,
  inferPipingChangeDependency,
  markPipingDependentCurrentness,
  mutatePipingGovernance,
  recalculatePipingFromChange,
  recordPipingAssumption,
  recordPipingChange,
  recordPipingEngineeringDecision,
  recordPipingGovernedRequirement,
  recordPipingReassessment,
  recordPipingSourceRequirement,
  redesignPipingFromChange,
  regeneratePipingIsometric,
  repointPipingGovernance,
  reselectPipingComponent,
  reroutePiping,
  rewritePipingEvidence,
  validatePipingChange,
} from "./requirements-assumptions-change";
import { D5_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_COUNT as R5_CHANGE_COUNT, D5_RUNTIME_COUNT as R5_RUNTIME_COUNT, createD5R5Store, recordPipingRoutingContext, recordPipingWeldJointContext } from "./routing-arrangement-fabrication-context";
import {
  D5_R7_STARTED,
  D5_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_COUNT as R6_CHANGE_COUNT,
  D5_RUNTIME_COUNT as R6_RUNTIME_COUNT,
  createD5R6Store,
  recordPipingNdeContext,
  recordPipingPressureLeakTestContext,
  recordPipingStressFlexibilityEvidence,
} from "./stress-support-test-evidence-context";
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

describe("EOS-D5-R7 piping requirements assumptions and change", () => {
  it("governs requirements and change without performing the engineering", () => {
    expect(D5_R7_STATUS).toBe("REQUIREMENTS_ASSUMPTIONS_AND_CHANGE_IMPLEMENTED");
    expect(D5_R7_MATURITY).toBe("REQUIREMENTS_ASSUMPTIONS_AND_CHANGE_IMPLEMENTED");
    expect(D5_RUNTIME_STARTED).toBe(true);
    expect(TYPES_D5_RUNTIME_STARTED).toBe(false);
    expect(D5_RUNTIME_COUNT).toBe(7);
    expect(ARCHITECTURE_D5_RUNTIME_COUNT).toBe(0);
    expect(R5_RUNTIME_COUNT).toBe(5);
    expect(R5_CHANGE_COUNT).toBe(0);
    expect(R6_RUNTIME_COUNT).toBe(6);
    expect(D5_R6_RUNTIME_COUNT).toBe(6);
    expect(R6_CHANGE_COUNT).toBe(0);
    expect(D5_R6_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_COUNT).toBe(0);
    expect(D5_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_IMPLEMENTED).toBe(true);
    expect(D5_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_COUNT).toBe(1);
    expect(D5_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY).toBe(true);
    expect(D5_R1_R6_EXACT_SUBJECT_REVISIONS_REUSED).toBe(true);
    expect(EXACT_D5_R7_SUBJECT_REVISION_REQUIRED).toBe(true);
    expect(FLOATING_D5_R7_SUBJECT_REFERENCE_ALLOWED).toBe(false);
    expect(D5_R7_SUBJECT_AUTO_REPOINTED).toBe(false);
    expect(D5_REUSES_CANONICAL_REQUIREMENT_GOVERNANCE).toBe(true);
    expect(D5_REUSES_CANONICAL_ASSUMPTION_GOVERNANCE).toBe(true);
    expect(D5_REUSES_CANONICAL_DECISION_GOVERNANCE).toBe(true);
    expect(D5_REUSES_CANONICAL_CHANGE_GOVERNANCE).toBe(true);
    expect(PARALLEL_D5_REQUIREMENT_ENGINE_CREATED).toBe(false);
    expect(PARALLEL_D5_ASSUMPTION_ENGINE_CREATED).toBe(false);
    expect(PARALLEL_D5_DECISION_ENGINE_CREATED).toBe(false);
    expect(PARALLEL_D5_CHANGE_ENGINE_CREATED).toBe(false);
    expect(D5_PIPING_REQUIREMENT_GOVERNANCE_IMPLEMENTED).toBe(true);
    expect(SOURCE_REQUIREMENT_EQUALS_ADOPTED_PIPING_REQUIREMENT).toBe(false);
    expect(REQUIREMENT_PRESENT_EQUALS_VALIDATED).toBe(false);
    expect(REQUIREMENT_PRESENT_EQUALS_CONFORMANT).toBe(false);
    expect(D5_REQUIREMENT_SOURCE_BASIS_REQUIRED).toBe(true);
    expect(D5_REQUIREMENT_SOURCE_BASIS_TRACEABLE).toBe(true);
    expect(SOURCE_REQUIREMENT_AUTO_ADOPTED_AS_D5_REQUIREMENT).toBe(false);
    expect(VENDOR_REQUIREMENT_AUTO_ADOPTED_AS_D5_REQUIREMENT).toBe(false);
    expect(D5_PIPING_ASSUMPTION_GOVERNANCE_IMPLEMENTED).toBe(true);
    expect(ASSUMPTION_EQUALS_VALIDATED_FACT).toBe(false);
    expect(ASSUMPTION_EQUALS_ENGINEERING_VALIDATED).toBe(false);
    expect(AI_CAN_INVENT_AUTHORITATIVE_D5_ASSUMPTION).toBe(false);
    expect(D5_PIPING_ENGINEERING_DECISION_GOVERNANCE_IMPLEMENTED).toBe(true);
    expect(AI_RECOMMENDATION_EQUALS_PIPING_ENGINEERING_DECISION).toBe(false);
    expect(ADMIN_ACTION_EQUALS_PIPING_ENGINEERING_DECISION).toBe(false);
    expect(D5_PIPING_CHANGE_GOVERNANCE_IMPLEMENTED).toBe(true);
    expect(D5_EXPLICIT_CHANGE_DEPENDENCIES_SUPPORTED).toBe(true);
    expect(D5_INFERRED_CHANGE_DEPENDENCIES_ALLOWED).toBe(false);
    expect(D5_SUPERSESSION_GOVERNANCE_IMPLEMENTED).toBe(true);
    expect(SUPERSEDED_D5_RECORD_DELETED).toBe(false);
    expect(SUPERSEDED_D5_RECORD_EQUALS_INVALID).toBe(false);
    expect(D5_SUPERSESSION_HISTORY_PRESERVED).toBe(true);
    expect(D5_REASSESSMENT_GOVERNANCE_IMPLEMENTED).toBe(true);
    expect(REASSESSMENT_REQUIRED_EQUALS_INVALID).toBe(false);
    expect(REASSESSMENT_REQUIRED_EQUALS_RECALCULATED).toBe(false);
    expect(REASSESSMENT_REQUIRED_EQUALS_REDESIGNED).toBe(false);
    expect(REASSESSMENT_REQUIRED_EQUALS_VALIDATED).toBe(false);
    expect(REASSESSMENT_COMPLETED_EQUALS_VALIDATED).toBe(false);
    expect(REASSESSMENT_COMPLETED_EQUALS_APPROVED).toBe(false);
    expect(D5_R3_CHANGE_INTEGRATION_IMPLEMENTED).toBe(true);
    expect(D5_R7_AUTO_RECALCULATES_R3_DESIGN_CONDITION).toBe(false);
    expect(D5_R7_AUTO_CHANGES_R3_SPECIFICATION).toBe(false);
    expect(D5_R7_AUTO_CHANGES_R3_PIPING_CLASS).toBe(false);
    expect(D5_R4_CHANGE_INTEGRATION_IMPLEMENTED).toBe(true);
    expect(D5_R7_AUTO_RESELECTS_COMPONENT).toBe(false);
    expect(D5_R7_AUTO_RESELECTS_VALVE).toBe(false);
    expect(D5_R7_AUTO_REPLACES_COMPONENT).toBe(false);
    expect(D5_R5_CHANGE_INTEGRATION_IMPLEMENTED).toBe(true);
    expect(D5_R7_AUTO_REROUTES_PIPING).toBe(false);
    expect(D5_R7_AUTO_CHANGES_GEOMETRY).toBe(false);
    expect(D5_R7_AUTO_REGENERATES_ISOMETRIC).toBe(false);
    expect(D5_R7_AUTO_REGENERATES_SPOOL).toBe(false);
    expect(D5_R6_CHANGE_INTEGRATION_IMPLEMENTED).toBe(true);
    expect(D5_R7_AUTO_RECALCULATES_STRESS).toBe(false);
    expect(D5_R7_AUTO_RECALCULATES_FLEXIBILITY).toBe(false);
    expect(D5_R7_AUTO_RECALCULATES_SUPPORT_LOAD).toBe(false);
    expect(D5_R7_AUTO_REWRITES_NDE_RESULT).toBe(false);
    expect(D5_R7_AUTO_REWRITES_TEST_RESULT).toBe(false);
    expect(D5_R7_AUTO_REVALIDATES_EXTERNAL_EVIDENCE).toBe(false);
    expect(D5_REUSES_CANONICAL_CURRENTNESS).toBe(true);
    expect(PARALLEL_D5_CURRENTNESS_ENGINE_CREATED).toBe(false);
    expect(D5_R7_CHANGE_CAN_MARK_EXPLICIT_DEPENDENT_RECORD_STALE).toBe(true);
    expect(D5_R7_CHANGE_CAN_REQUIRE_REASSESSMENT).toBe(true);
    expect(D5_R7_INFERRED_STALENESS_PROPAGATION_ALLOWED).toBe(false);
    expect(D5_R7_AUTO_REPOINTS_DEPENDENT_HISTORY).toBe(false);
    expect(CURRENT_D5_RECORD_EQUALS_VALIDATED).toBe(false);
    expect(STALE_D5_RECORD_EQUALS_INVALID).toBe(false);
    expect(SUPERSEDED_D5_RECORD_EQUALS_INVALID).toBe(false);
    expect(D5_CHANGE_AUTO_RECALCULATES_ENGINEERING).toBe(false);
    expect(D5_CHANGE_AUTO_REDESIGNS_ENGINEERING).toBe(false);
    expect(D5_CHANGE_AUTO_REVALIDATES_ENGINEERING).toBe(false);
    expect(D5_CHANGE_AUTO_APPROVES_ENGINEERING).toBe(false);
    expect(D5_CHANGE_AUTO_DETERMINES_CONFORMANCE).toBe(false);
    expect(D5_PIPE_SIZING_RUNTIME_COUNT + D5_HYDRAULIC_CALCULATION_RUNTIME_COUNT + D5_PRESSURE_DROP_CALCULATION_RUNTIME_COUNT + D5_WALL_THICKNESS_CALCULATION_RUNTIME_COUNT).toBe(0);
    expect(D5_BRANCH_REINFORCEMENT_CALCULATION_RUNTIME_COUNT + D5_FLANGE_RATING_CALCULATION_RUNTIME_COUNT + D5_VALVE_SIZING_RUNTIME_COUNT + D5_COMPONENT_SIZING_RUNTIME_COUNT).toBe(0);
    expect(D5_PIPING_STRESS_CALCULATION_RUNTIME_COUNT + D5_FLEXIBILITY_CALCULATION_RUNTIME_COUNT + D5_SUPPORT_LOAD_CALCULATION_RUNTIME_COUNT).toBe(0);
    expect(D5_AUTOMATIC_ROUTING_RUNTIME_COUNT + D5_ROUTE_OPTIMIZATION_RUNTIME_COUNT + D5_SPATIAL_CLASH_DETECTION_RUNTIME_COUNT + D5_GEOMETRY_SOLVER_RUNTIME_COUNT).toBe(0);
    expect(D5_R7_HIDDEN_CALCULATION_ALLOWED).toBe(false);
    expect(D5_DISCIPLINE_INTERFACE_RUNTIME_COUNT).toBe(0);
    expect(D5_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_COUNT).toBe(0);
    expect(D5_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT).toBe(0);
    expect(D5_D9_SOURCE_CONTRACT_RUNTIME_COUNT).toBe(0);
    expect(D5_D9_RUNTIME_INTEGRATION_COUNT).toBe(0);
    expect(D5_AUTOMATIC_REDESIGN_RUNTIME_COUNT + D5_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT + D5_CONFORMANCE_DETERMINATION_RUNTIME_COUNT + D5_APPROVAL_RUNTIME_COUNT + D5_CERTIFICATION_RUNTIME_COUNT).toBe(0);
    expect(AI_EQUALS_D5_PIPING_ENGINEERING_AUTHORITY).toBe(false);
    expect(ADMIN_EQUALS_D5_PIPING_ENGINEERING_AUTHORITY).toBe(false);
    expect(AI_CAN_CLOSE_D5_ENGINEERING_REASSESSMENT_AS_VALIDATED).toBe(false);
    expect(ADMIN_CAN_CLOSE_D5_ENGINEERING_REASSESSMENT_AS_VALIDATED).toBe(false);
    expect(D5_REUSES_CANONICAL_FINGERPRINT).toBe(true);
    expect(SECOND_D5_FINGERPRINT_ALGORITHM_CREATED).toBe(false);
    expect(D5_R7_PROVENANCE_REQUIRED).toBe(true);
    expect(D5_R7_PROVENANCE_PRESERVED).toBe(true);
    expect(SILENT_D5_R7_MUTATION_ALLOWED).toBe(false);
    expect(D5_R7_HISTORY_PRESERVED).toBe(true);
    expect(TENANT_WORKSPACE_PROJECT_D5_R7_SCOPE_ENFORCED).toBe(true);
    expect(D5_R7_DUPLICATE_GOVERNANCE_IMPLEMENTED).toBe(true);
    expect(D5_R7_REPLAY_PROTECTION_IMPLEMENTED).toBe(true);
    expect(D5_R7_SPOOFING_PROTECTION_IMPLEMENTED).toBe(true);
    expect(D5_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT + D5_CROSS_DISCIPLINE_CONFLICT_DETECTION_RUNTIME_COUNT + D5_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT + D5_CROSS_DISCIPLINE_RECOMMENDATION_RUNTIME_COUNT).toBe(0);
    expect(D1_STRUCTURAL_PACK_COMPLETE).toBe(false);
    expect(D1N_REOPENED).toBe(false);
    expect(D2_TRACK_COMPLETE).toBe(true);
    expect(D2_REOPENED).toBe(false);
    expect(D3_TRACK_COMPLETE).toBe(true);
    expect(D3_REOPENED).toBe(false);
    expect(D4_TRACK_COMPLETE).toBe(true);
    expect(D4_REOPENED).toBe(false);
    expect(D6_RUNTIME_STARTED).toBe(false);
    expect(D9_RUNTIME_STARTED).toBe(false);
    expect(D9_RUNTIME_COUNT).toBe(0);
    expect(DATABASE_SCHEMA_CHANGED).toBe(false);
    expect(NEW_DEPENDENCY_ADDED).toBe(false);
    expect(D5_EQUALS_D1_STRUCTURAL_AUTHORITY).toBe(false);
    expect(D5_EQUALS_D2_CIVIL_AUTHORITY).toBe(false);
    expect(D5_EQUALS_D3_GEOTECHNICAL_AUTHORITY).toBe(false);
    expect(D5_EQUALS_D4_MECHANICAL_AUTHORITY).toBe(false);
    expect(D5_EQUALS_D6_PROCESS_AUTHORITY).toBe(false);
    expect(D5_EQUALS_D7_ELECTRICAL_AUTHORITY).toBe(false);
    expect(D5_EQUALS_D8_INSTRUMENTATION_CONTROL_AUTHORITY).toBe(false);
    expect(D5_R7_STARTED).toBe(false);
    expect(D5_R8_STARTED).toBe(false);
    expect(D5_R7_CANONICAL_NEXT_PHASE).toBe("EOS-D5-R8-DISCIPLINE-INTERFACES-AND-HANDOFFS");
    expect(D5_R7_NEXT_PHASE_TYPE).toBe("DISCIPLINE_INTERFACES_AND_HANDOFFS");
    expect(D5_R7_CANONICAL_NEXT_PHASE_SCOPE).toContain("exact R1-R7 revisions");
    expect(D5_R7_BLOCKER).toBe("NONE");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D5.R7.REQUIREMENTS_ASSUMPTIONS_AND_CHANGE")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D5.R8.DISCIPLINE_INTERFACES_AND_HANDOFFS")?.implementationState).toBe("NOT_IMPLEMENTED");

    const r1 = createD5R1Store();
    recordPipingContext(r1, actor, { contextId: "ctx-1", citedLifecycleStage: "FEED", provenanceRef: "prov-ctx" });
    const system = recordPipingObjectIdentity(r1, actor, { objectId: "sys-1", contextId: "ctx-1", objectType: "PIPING_SYSTEM_CONTEXT", citedLifecycleStage: "FEED", provenanceRef: "prov-sys" });
    const line = recordPipingObjectIdentity(r1, actor, { objectId: "line-1", contextId: "ctx-1", objectType: "PIPING_LINE", citedLifecycleStage: "FEED", provenanceRef: "prov-line" });
    const serviceIdentity = recordPipingObjectIdentity(r1, actor, { objectId: "svc-1", contextId: "ctx-1", objectType: "PIPING_SERVICE_CONTEXT", citedLifecycleStage: "FEED", provenanceRef: "prov-svc" });
    const flange = recordPipingObjectIdentity(r1, actor, { objectId: "flange-1", contextId: "ctx-1", objectType: "PIPING_COMPONENT_CONTEXT", citedLifecycleStage: "FEED", provenanceRef: "prov-flange" });
    const routeIdentity = recordPipingObjectIdentity(r1, actor, { objectId: "route-1", contextId: "ctx-1", objectType: "PIPING_ROUTE_CONTEXT", citedLifecycleStage: "FEED", provenanceRef: "prov-route" });
    const fabricationIdentity = recordPipingObjectIdentity(r1, actor, { objectId: "fab-1", contextId: "ctx-1", objectType: "PIPING_FABRICATION_CONTEXT", citedLifecycleStage: "FEED", provenanceRef: "prov-fab" });
    const connectionIdentity = recordPipingObjectIdentity(r1, actor, { objectId: "conn-id-1", contextId: "ctx-1", objectType: "PIPING_CONNECTION_CONTEXT", citedLifecycleStage: "FEED", provenanceRef: "prov-conn" });
    const stressIdentity = recordPipingObjectIdentity(r1, actor, { objectId: "stress-1", contextId: "ctx-1", objectType: "PIPING_STRESS_FLEXIBILITY_CONTEXT", citedLifecycleStage: "FEED", provenanceRef: "prov-stress" });
    const testIdentity = recordPipingObjectIdentity(r1, actor, { objectId: "test-1", contextId: "ctx-1", objectType: "PIPING_TEST_INSPECTION_CONTEXT", citedLifecycleStage: "FEED", provenanceRef: "prov-test" });
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
      applicabilityRef: line.objectId, limitations: "Unit 10 cooling water only",
    };
    const condition = recordPipingDesignCondition(r3, actor, {
      ...specCommon, conditionId: "cond-1", adoption: "EXPLICIT",
      designPressure: { value: "10", unit: "bar" }, designTemperature: { value: "80", unit: "degC" },
    });
    const specification = recordPipingSpecificationContext(r3, actor, {
      ...specCommon, specificationId: "spec-1", specificationRef: "CW-CLASS-A", pipingClass: "A1",
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
    const r5 = createD5R5Store(r4);
    const route = recordPipingRoutingContext(r5, actor, {
      contextId: "ctx-1", lineRecordId: lineContext.lineRecordId, lineContextFingerprint: lineContext.fingerprint,
      specificationId: specification.specificationId, specificationFingerprint: specification.fingerprint,
      componentRecordId: component.componentRecordId, componentRevisionFingerprint: component.fingerprint,
      connectionRecordId: connection.connectionRecordId, connectionRevisionFingerprint: connection.fingerprint,
      citedLifecycleStage: "FEED", citedCurrentness: "CURRENT", provenanceRef: "prov-r5",
      sourceBasisRef: "iso-basis", sourceBasisCategory: "APPROVED_ISOMETRIC",
      limitations: "Supplied route only", identityBasis: "EXPLICIT", relationshipBasis: "EXPLICIT",
      objectId: routeIdentity.objectId, objectRevisionFingerprint: routeIdentity.fingerprint, applicabilityRef: routeIdentity.objectId,
      routeRecordId: "route-rec-1", routeSegment: "CW-100 rack A", sourceObjectId: flange.objectId, sourceRevisionFingerprint: flange.fingerprint,
      destinationObjectId: line.objectId, destinationRevisionFingerprint: line.fingerprint, placement: "ABOVE_GROUND", routingConstraint: "rack A",
    });
    const weld = recordPipingWeldJointContext(r5, actor, {
      contextId: "ctx-1", lineRecordId: lineContext.lineRecordId, lineContextFingerprint: lineContext.fingerprint,
      specificationId: specification.specificationId, specificationFingerprint: specification.fingerprint,
      componentRecordId: component.componentRecordId, componentRevisionFingerprint: component.fingerprint,
      connectionRecordId: connection.connectionRecordId, connectionRevisionFingerprint: connection.fingerprint,
      citedLifecycleStage: "FEED", citedCurrentness: "CURRENT", provenanceRef: "prov-r5",
      sourceBasisRef: "iso-basis", sourceBasisCategory: "APPROVED_ISOMETRIC",
      limitations: "Supplied weld only", identityBasis: "EXPLICIT", relationshipBasis: "EXPLICIT",
      objectId: fabricationIdentity.objectId, objectRevisionFingerprint: fabricationIdentity.fingerprint, applicabilityRef: fabricationIdentity.objectId,
      weldRecordId: "weld-1", jointType: "BUTT",
    });
    const r6 = createD5R6Store(r5);
    const evidenceBase = {
      contextId: "ctx-1", lineRecordId: lineContext.lineRecordId, lineContextFingerprint: lineContext.fingerprint,
      conditionId: condition.conditionId, conditionRevisionFingerprint: condition.fingerprint,
      componentRecordId: component.componentRecordId, componentRevisionFingerprint: component.fingerprint,
      connectionRecordId: connection.connectionRecordId, connectionRevisionFingerprint: connection.fingerprint,
      routeRecordId: route.routeRecordId, routeRevisionFingerprint: route.fingerprint,
      citedLifecycleStage: "FEED", citedCurrentness: "CURRENT", provenanceRef: "prov-r6",
      sourceBasisRef: "caesar-report-1", sourceBasisCategory: "EXTERNAL_ANALYSIS",
      limitations: "External evidence for CW-100 case LC-1 only", identityBasis: "EXPLICIT",
    };
    const stress = recordPipingStressFlexibilityEvidence(r6, actor, {
      ...evidenceBase, objectId: stressIdentity.objectId, objectRevisionFingerprint: stressIdentity.fingerprint, applicabilityRef: stressIdentity.objectId,
      evidenceRecordId: "stress-ev-1", analysisReference: "CAESAR-CW-100", loadCaseId: "LC-1", toolIdentity: "CAESAR II",
      modelRevision: "model-a", sourceAuthority: "piping-analyst", evidenceVersion: "2026-10-01", assumptions: "supplied restraint set",
      stressResult: { value: "120", unit: "MPa" },
    });
    const nde = recordPipingNdeContext(r6, actor, {
      ...evidenceBase, objectId: testIdentity.objectId, objectRevisionFingerprint: testIdentity.fingerprint, applicabilityRef: testIdentity.objectId,
      sourceBasisCategory: "NDE_EVIDENCE", ndeRecordId: "nde-1", ndeMethod: "RT", extent: "10 percent supplied",
      observedStatus: "report status as supplied", evidenceRevision: "nde-rev-a",
      weldRecordId: weld.weldRecordId, weldRevisionFingerprint: weld.fingerprint,
    });
    const testEvidence = recordPipingPressureLeakTestContext(r6, actor, {
      ...evidenceBase, objectId: testIdentity.objectId, objectRevisionFingerprint: testIdentity.fingerprint, applicabilityRef: testIdentity.objectId,
      sourceBasisCategory: "TEST_EVIDENCE", testRecordId: "test-rec-1", testKind: "HYDROTEST", testReference: "TP-100",
      observedStatus: "gauge reading as supplied", evidenceRef: "test-cert-a", testPressure: { value: "15", unit: "bar" },
    });
    const upstreamBefore = JSON.stringify({
      conditions: r3.conditions,
      specifications: r3.specifications,
      components: r4.components,
      routes: r5.routes,
      welds: r5.welds,
      stress: r6.stressEvidence,
      nde: r6.nde,
      tests: r6.tests,
    });
    const store = createD5R7Store(r6);
    const subject = {
      contextId: "ctx-1",
      objectId: stress.objectId,
      objectRevisionFingerprint: stress.objectRevisionFingerprint,
      lineRecordId: lineContext.lineRecordId,
      lineContextFingerprint: lineContext.fingerprint,
      conditionId: condition.conditionId,
      conditionRevisionFingerprint: condition.fingerprint,
      componentRecordId: component.componentRecordId,
      componentRevisionFingerprint: component.fingerprint,
      connectionRecordId: connection.connectionRecordId,
      connectionRevisionFingerprint: connection.fingerprint,
      routeRecordId: route.routeRecordId,
      routeRevisionFingerprint: route.fingerprint,
      r6SubjectKind: "STRESS",
      r6SubjectId: stress.evidenceRecordId,
      r6RevisionFingerprint: stress.fingerprint,
      citedLifecycleStage: "FEED",
      citedCurrentness: "CURRENT" as const,
      applicabilityRef: stress.objectId,
      limitations: "CW-100 case LC-1 only",
      provenanceRef: "prov-r7",
      identityBasis: "EXPLICIT",
    };
    const source = recordPipingSourceRequirement(store, actor, {
      ...subject, requirementId: "req-source-1", statement: "Source text requires a guide at bay 3",
      requirementCategory: "DESIGN_CRITERIA", sourceBasis: "SOURCE_REQUIREMENT", sourceRef: "spec-note-4", sourceRevision: "rev-a",
    });
    expect(source.adopted).toBe(false);
    expect(source.engineeringValidated).toBe(false);
    expect(source.conformant).toBe(false);
    expect(source.authority).toBe("PIPING_CONTEXT_AUTHORITY");
    expect(recordPipingSourceRequirement(store, actor, {
      ...subject, requirementId: "req-source-1", statement: "Source text requires a guide at bay 3",
      requirementCategory: "DESIGN_CRITERIA", sourceBasis: "SOURCE_REQUIREMENT", sourceRef: "spec-note-4", sourceRevision: "rev-a",
    })).toBe(source);
    const adopted = recordPipingGovernedRequirement(store, actor, {
      ...subject, requirementId: "req-adopted-1", statement: "Adopt a guide requirement at bay 3 for CW-100",
      requirementCategory: "DESIGN_CRITERIA", sourceBasis: "VENDOR_REQUIREMENT", sourceRef: "vendor-note-2", sourceRevision: "rev-b",
      adoptionRationale: "Piping recorder adopts the vendor note for this line revision only",
    });
    expect(adopted.adopted).toBe(true);
    expect(adopted.adoptionRationale).toContain("vendor note");
    expect(SOURCE_REQUIREMENT_EQUALS_ADOPTED_PIPING_REQUIREMENT).toBe(false);
    const revised = recordPipingGovernedRequirement(store, actor, {
      ...subject, requirementId: "req-adopted-2", predecessorRequirementId: "req-adopted-1",
      statement: "Adopt a guide requirement at bay 4 for CW-100",
      requirementCategory: "DESIGN_CRITERIA", sourceBasis: "VENDOR_REQUIREMENT", sourceRef: "vendor-note-2", sourceRevision: "rev-c",
      adoptionRationale: "Later explicit adoption for the same line",
    });
    const prior = store.requirements.find((row) => row.requirementId === "req-adopted-1");
    expect(prior?.recordStatus).toBe("SUPERSEDED");
    expect(prior?.currentness).toBe("SUPERSEDED");
    expect(prior?.deleted).toBe(false);
    expect(prior?.invalidated).toBe(false);
    expect(prior?.fingerprint).toBe(adopted.fingerprint);
    expect(revised.predecessorFingerprint).toBe(adopted.fingerprint);
    expect(store.history.some((row) => row.subjectId === "req-adopted-1" && row.recordStatus === "SUPERSEDED" && row.fingerprint === adopted.fingerprint)).toBe(true);
    const assumption = recordPipingAssumption(store, actor, {
      ...subject, assumptionId: "asm-1", statement: "Bay 3 steel is available for a guide", basis: "site note rev-a", materiality: "medium",
    });
    expect(assumption.validationStatus).toBe("unvalidated");
    expect(assumption.validatedFact).toBe(false);
    expect(assumption.engineeringValidated).toBe(false);
    const decision = recordPipingEngineeringDecision(store, actor, {
      ...subject, decisionId: "dec-1", statement: "Record the bay 3 guide as the governed requirement",
      basis: "adopted requirement req-adopted-2",
      alternatives: [
        { id: "alt-keep", statement: "keep bay 3", is_selected: true },
        { id: "alt-move", statement: "move to bay 4", is_selected: false },
      ],
    });
    expect(decision.authoritativeDecision).toBe(true);
    expect(decision.aiRecommendation).toBe(false);
    expect(decision.pipingEngineeringAuthority).toBe(false);
    expect(decision.engineeringValidated).toBe(false);
    const change = recordPipingChange(store, actor, {
      ...subject, changeId: "chg-1", changeCategory: "DESIGN_CONDITION_CHANGED", originRef: "change-note-9",
      reason: "Design pressure source note changed for this exact condition",
      dependencies: [
        { kind: "OBJECT_REFERENCE", targetKind: "R3_CONDITION", targetId: condition.conditionId, targetFingerprint: condition.fingerprint },
        { kind: "OBJECT_REFERENCE", targetKind: "R3_SPECIFICATION", targetId: specification.specificationId, targetFingerprint: specification.fingerprint },
        { kind: "PARENT", targetKind: "R4_COMPONENT", targetId: component.componentRecordId, targetFingerprint: component.fingerprint },
        { kind: "OBJECT_REFERENCE", targetKind: "R5_ROUTE", targetId: route.routeRecordId, targetFingerprint: route.fingerprint },
        { kind: "OBJECT_REFERENCE", targetKind: "R6_STRESS", targetId: stress.evidenceRecordId, targetFingerprint: stress.fingerprint },
        { kind: "OBJECT_REFERENCE", targetKind: "R7_REQUIREMENT", targetId: revised.requirementId, targetFingerprint: revised.fingerprint },
      ],
    });
    expect(change.recalculated).toBe(false);
    expect(change.redesigned).toBe(false);
    expect(change.engineeringValidated).toBe(false);
    const stale = markPipingDependentCurrentness(store, actor, {
      ...subject, markId: "mark-1", changeId: change.changeId, targetKind: "R3_CONDITION",
      targetId: condition.conditionId, targetFingerprint: condition.fingerprint, mark: "STALE",
    });
    expect(stale.mark).toBe("STALE");
    expect(stale.invalidated).toBe(false);
    expect(stale.engineeringValidated).toBe(false);
    expect(stale.upstreamFingerprint).toBe(condition.fingerprint);
    expect(condition.currentness).toBe("CURRENT");
    expect(condition.designPressure).toEqual({ value: "10", unit: "bar" });
    expect(specification.pipingClass).toBe("A1");
    const required = recordPipingReassessment(store, actor, {
      ...subject, reassessmentId: "ras-1", changeId: change.changeId, targetId: stress.evidenceRecordId,
      targetFingerprint: stress.fingerprint, state: "REASSESSMENT_REQUIRED",
    });
    expect(required.state).toBe("REASSESSMENT_REQUIRED");
    expect(required.recalculated).toBe(false);
    expect(required.redesigned).toBe(false);
    expect(required.invalidated).toBe(false);
    const completed = recordPipingReassessment(store, actor, {
      ...subject, reassessmentId: "ras-2", changeId: change.changeId, targetId: condition.conditionId,
      targetFingerprint: condition.fingerprint, state: "REASSESSMENT_COMPLETED",
    });
    expect(completed.state).toBe("REASSESSMENT_COMPLETED");
    expect(completed.engineeringValidated).toBe(false);
    expect(completed.approved).toBe(false);
    expect(completed.conformant).toBe(false);
    expect(stress.stressResult).toEqual({ value: "120", unit: "MPa" });
    expect(nde.observedStatus).toBe("report status as supplied");
    expect(testEvidence.observedStatus).toBe("gauge reading as supplied");
    expect(testEvidence.testPressure).toEqual({ value: "15", unit: "bar" });
    expect(JSON.stringify({
      conditions: r3.conditions,
      specifications: r3.specifications,
      components: r4.components,
      routes: r5.routes,
      welds: r5.welds,
      stress: r6.stressEvidence,
      nde: r6.nde,
      tests: r6.tests,
    })).toBe(upstreamBefore);
    expect(throws(() => recordPipingGovernedRequirement(store, actor, {
      ...subject, requirementId: "req-no-rationale", statement: "Adopt without rationale",
      requirementCategory: "DESIGN_INPUT", sourceBasis: "SOURCE_REQUIREMENT", sourceRef: "note", sourceRevision: "rev-d",
    }))).toBe("D5_R7_ADOPTION_RATIONALE_REQUIRED");
    expect(throws(() => recordPipingGovernedRequirement(store, actor, {
      ...subject, vendorAutoAdopt: true, requirementId: "req-vendor-auto", statement: "Silent vendor adoption",
      requirementCategory: "VENDOR_DATA", sourceBasis: "VENDOR_REQUIREMENT", sourceRef: "note", sourceRevision: "rev-e",
      adoptionRationale: "should not auto adopt",
    }))).toBe("D5_R7_VENDOR_AUTO_ADOPTION_REJECTED");
    expect(throws(() => recordPipingSourceRequirement(store, actor, {
      ...subject, sourceAutoAdopt: true, requirementId: "req-source-auto", statement: "Silent source adoption",
      requirementCategory: "DESIGN_INPUT", sourceBasis: "SOURCE_REQUIREMENT", sourceRef: "note", sourceRevision: "rev-f",
    }))).toBe("D5_R7_SOURCE_AUTO_ADOPTION_REJECTED");
    expect(throws(() => recordPipingGovernedRequirement(store, actor, {
      ...subject, requirementId: "req-accepted", statement: "Treat presence as acceptance",
      requirementCategory: "DESIGN_CRITERIA", sourceBasis: "PROJECT_PIPING_DATA", sourceRef: "note", sourceRevision: "rev-g",
      adoptionRationale: "explicit", requirementStatus: "ACCEPTED_FOR_PURPOSE",
    }))).toBe("D5_R7_REQUIREMENT_ACCEPTANCE_NOT_IN_R7");
    expect(throws(() => recordPipingAssumption(store, actor, {
      ...subject, assumptionId: "asm-valid", statement: "This is now a fact", basis: "none", validationStatus: "validated",
    }))).toBe("D5_R7_ASSUMPTION_NOT_VALIDATED_FACT");
    expect(throws(() => recordPipingAssumption(store, { ...actor, actorId: "AI-recorder" }, {
      ...subject, assumptionId: "asm-ai", statement: "Invented assumption", basis: "model",
    }))).toBe("D5_R7_AI_NOT_PIPING_AUTHORITY");
    expect(throws(() => recordPipingEngineeringDecision(store, actor, {
      ...subject, aiRecommendation: true, decisionId: "dec-ai", statement: "AI picked bay 3", basis: "model",
      alternatives: [{ id: "alt-ai", statement: "bay 3", is_selected: true }],
    }))).toBe("D5_R7_AI_RECOMMENDATION_NOT_DECISION");
    expect(throws(() => recordPipingEngineeringDecision(store, { ...actor, authority: "ADMIN" }, {
      ...subject, decisionId: "dec-admin", statement: "Admin picked bay 3", basis: "ticket",
      alternatives: [{ id: "alt-admin", statement: "bay 3", is_selected: true }],
    }))).toBe("D5_R7_ADMIN_NOT_PIPING_AUTHORITY");
    expect(throws(() => recordPipingChange(store, actor, {
      ...subject, changeId: "chg-infer", changeCategory: "ROUTE_CHANGED", originRef: "note", reason: "nearby route",
      dependencies: [{ kind: "OBJECT_REFERENCE", targetKind: "R5_ROUTE", targetId: route.routeRecordId, targetFingerprint: route.fingerprint, inference: "geometry_proximity" }],
    }))).toBe("D5_R7_INFERRED_DEPENDENCY_REJECTED");
    expect(throws(() => recordPipingChange(store, actor, {
      ...subject, changeId: "chg-stale-rev", changeCategory: "SPECIFICATION_CHANGED", originRef: "note", reason: "wrong revision",
      dependencies: [{ kind: "OBJECT_REFERENCE", targetKind: "R3_SPECIFICATION", targetId: specification.specificationId, targetFingerprint: "not-the-spec" }],
    }))).toBe("D5_R7_DEPENDENCY_REVISION_MISMATCH");
    expect(throws(() => recordPipingChange(store, actor, {
      ...subject, recalculateDesign: true, changeId: "chg-calc", changeCategory: "DESIGN_CONDITION_CHANGED", originRef: "note", reason: "recalculate",
      dependencies: [{ kind: "OBJECT_REFERENCE", targetKind: "R3_CONDITION", targetId: condition.conditionId, targetFingerprint: condition.fingerprint }],
    }))).toBe("D5_R7_RECALCULATION_REJECTED");
    expect(throws(() => recordPipingChange(store, actor, {
      ...subject, changeSpecification: true, changeId: "chg-spec", changeCategory: "SPECIFICATION_CHANGED", originRef: "note", reason: "change class",
      dependencies: [{ kind: "OBJECT_REFERENCE", targetKind: "R3_SPECIFICATION", targetId: specification.specificationId, targetFingerprint: specification.fingerprint }],
    }))).toBe("D5_R7_SPECIFICATION_MUTATION_REJECTED");
    expect(throws(() => recordPipingChange(store, actor, {
      ...subject, reselectComponent: true, changeId: "chg-comp", changeCategory: "COMPONENT_CHANGED", originRef: "note", reason: "reselect",
      dependencies: [{ kind: "PARENT", targetKind: "R4_COMPONENT", targetId: component.componentRecordId, targetFingerprint: component.fingerprint }],
    }))).toBe("D5_R7_COMPONENT_RESELECTION_REJECTED");
    expect(throws(() => recordPipingChange(store, actor, {
      ...subject, reselectValve: true, changeId: "chg-valve", changeCategory: "VALVE_CHANGED", originRef: "note", reason: "reselect valve",
      dependencies: [{ kind: "PARENT", targetKind: "R4_COMPONENT", targetId: component.componentRecordId, targetFingerprint: component.fingerprint }],
    }))).toBe("D5_R7_COMPONENT_RESELECTION_REJECTED");
    expect(throws(() => recordPipingChange(store, actor, {
      ...subject, reroute: true, changeId: "chg-route", changeCategory: "ROUTE_CHANGED", originRef: "note", reason: "reroute",
      dependencies: [{ kind: "OBJECT_REFERENCE", targetKind: "R5_ROUTE", targetId: route.routeRecordId, targetFingerprint: route.fingerprint }],
    }))).toBe("D5_R7_REROUTE_REJECTED");
    expect(throws(() => recordPipingChange(store, actor, {
      ...subject, regenerateIsometric: true, changeId: "chg-iso", changeCategory: "FABRICATION_CHANGED", originRef: "note", reason: "regen",
      dependencies: [{ kind: "OBJECT_REFERENCE", targetKind: "R5_ROUTE", targetId: route.routeRecordId, targetFingerprint: route.fingerprint }],
    }))).toBe("D5_R7_FABRICATION_REGENERATION_REJECTED");
    expect(throws(() => recordPipingChange(store, actor, {
      ...subject, recalculateStress: true, changeId: "chg-stress", changeCategory: "STRESS_EVIDENCE_CHANGED", originRef: "note", reason: "recalc",
      dependencies: [{ kind: "OBJECT_REFERENCE", targetKind: "R6_STRESS", targetId: stress.evidenceRecordId, targetFingerprint: stress.fingerprint }],
    }))).toBe("D5_R7_RECALCULATION_REJECTED");
    expect(throws(() => recordPipingChange(store, actor, {
      ...subject, rewriteNde: true, changeId: "chg-nde", changeCategory: "NDE_EVIDENCE_CHANGED", originRef: "note", reason: "rewrite",
      dependencies: [{ kind: "OBJECT_REFERENCE", targetKind: "R6_STRESS", targetId: stress.evidenceRecordId, targetFingerprint: stress.fingerprint }],
    }))).toBe("D5_R7_EVIDENCE_REWRITE_REJECTED");
    expect(throws(() => recordPipingChange(store, actor, {
      ...subject, rewriteTest: true, changeId: "chg-test", changeCategory: "TEST_EVIDENCE_CHANGED", originRef: "note", reason: "rewrite test",
      dependencies: [{ kind: "OBJECT_REFERENCE", targetKind: "R6_STRESS", targetId: stress.evidenceRecordId, targetFingerprint: stress.fingerprint }],
    }))).toBe("D5_R7_EVIDENCE_REWRITE_REJECTED");
    expect(throws(() => recordPipingChange(store, actor, {
      ...subject, revalidateExternal: true, changeId: "chg-ext", changeCategory: "STRESS_EVIDENCE_CHANGED", originRef: "note", reason: "revalidate",
      dependencies: [{ kind: "OBJECT_REFERENCE", targetKind: "R6_STRESS", targetId: stress.evidenceRecordId, targetFingerprint: stress.fingerprint }],
    }))).toBe("D5_R7_EVIDENCE_REWRITE_REJECTED");
    expect(throws(() => markPipingDependentCurrentness(store, actor, {
      ...subject, inferredStaleness: true, markId: "mark-infer", changeId: change.changeId, targetKind: "R5_ROUTE",
      targetId: route.routeRecordId, targetFingerprint: route.fingerprint, mark: "STALE",
    }))).toBe("D5_R7_INFERRED_STALENESS_REJECTED");
    expect(throws(() => markPipingDependentCurrentness(store, actor, {
      ...subject, repoint: true, markId: "mark-repoint", changeId: change.changeId, targetKind: "R3_CONDITION",
      targetId: condition.conditionId, targetFingerprint: condition.fingerprint, mark: "STALE",
    }))).toBe("D5_R7_AUTO_REPOINT_REJECTED");
    expect(throws(() => recordPipingReassessment(store, actor, {
      ...subject, closeAsValidated: true, reassessmentId: "ras-close", changeId: change.changeId,
      targetId: condition.conditionId, targetFingerprint: condition.fingerprint, state: "REASSESSMENT_COMPLETED",
    }))).toBe("D5_R7_REASSESSMENT_CLOSURE_REJECTED");
    expect(throws(() => recordPipingGovernedRequirement(store, actor, {
      ...subject, objectRevisionFingerprint: "latest", requirementId: "req-float", statement: "floating subject",
      requirementCategory: "DESIGN_INPUT", sourceBasis: "PROJECT_PIPING_DATA", sourceRef: "note", sourceRevision: "rev-h",
      adoptionRationale: "explicit",
    }))).toBe("D5_R7_R1_REVISION_REQUIRED");
    expect(throws(() => recordPipingChange(store, actor, {
      ...subject, assertedFingerprint: "spoofed", changeId: "chg-spoof", changeCategory: "REQUIREMENT_CHANGED", originRef: "note", reason: "spoof",
      dependencies: [{ kind: "OBJECT_REFERENCE", targetKind: "R7_REQUIREMENT", targetId: revised.requirementId, targetFingerprint: revised.fingerprint }],
    }))).toBe("D5_R7_FINGERPRINT_MISMATCH");
    expect(throws(() => recordPipingAssumption(store, actor, {
      ...subject, tenantId: "tenant-b", assumptionId: "asm-scope", statement: "other tenant", basis: "note",
    }))).toBe("D5_R7_CROSS_TENANT_OPERATION");
    expect(throws(() => recordPipingGovernedRequirement(store, actor, {
      ...subject, requirementId: "req-formula", statement: "t=PD/2S",
      requirementCategory: "DESIGN_CRITERIA", sourceBasis: "PROJECT_PIPING_DATA", sourceRef: "note", sourceRevision: "rev-i",
      adoptionRationale: "explicit",
    }))).toBe("D5_R7_HIDDEN_CALCULATION_REJECTED");
    expect(throws(() => recalculatePipingFromChange())).toBe("D5_R7_RECALCULATION_REJECTED");
    expect(throws(() => redesignPipingFromChange())).toBe("D5_R7_REDESIGN_REJECTED");
    expect(throws(() => changePipingSpecification())).toBe("D5_R7_SPECIFICATION_MUTATION_REJECTED");
    expect(throws(() => reselectPipingComponent())).toBe("D5_R7_COMPONENT_RESELECTION_REJECTED");
    expect(throws(() => reroutePiping())).toBe("D5_R7_REROUTE_REJECTED");
    expect(throws(() => regeneratePipingIsometric())).toBe("D5_R7_FABRICATION_REGENERATION_REJECTED");
    expect(throws(() => rewritePipingEvidence())).toBe("D5_R7_EVIDENCE_REWRITE_REJECTED");
    expect(throws(() => validatePipingChange())).toBe("D5_R7_VALIDATION_REJECTED");
    expect(throws(() => approvePipingChange())).toBe("D5_R7_APPROVAL_REJECTED");
    expect(throws(() => determinePipingConformance())).toBe("D5_R7_CONFORMANCE_REJECTED");
    expect(throws(() => inferPipingChangeDependency())).toBe("D5_R7_INFERRED_DEPENDENCY_REJECTED");
    expect(throws(() => repointPipingGovernance())).toBe("D5_R7_AUTO_REPOINT_REJECTED");
    expect(throws(() => closePipingReassessmentAsValidated())).toBe("D5_R7_REASSESSMENT_CLOSURE_REJECTED");
    expect(throws(() => mutatePipingGovernance())).toBe("D5_R7_SILENT_MUTATION_REJECTED");
    expect(condition.fingerprint).toBe(stale.upstreamFingerprint);
    expect(stress.fingerprint).toBe(required.targetFingerprint);
    const sourceText = readFileSync(join(here, "requirements-assumptions-change.ts"), "utf8");
    expect(scanAnalysisFormulaBypass("requirements-assumptions-change.ts", sourceText)).toEqual([]);
    expect(sourceText.includes("createHash")).toBe(false);
    const packageJson = JSON.parse(readFileSync(join(here, "../../package.json"), "utf8")) as { dependencies: Record<string, string> };
    expect(Object.keys(packageJson.dependencies)).toContain("zod");
    expect(Object.keys(packageJson.dependencies)).not.toContain("@rtb/piping-solver");
  });
});
