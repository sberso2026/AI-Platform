import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { D5_RUNTIME_COUNT as ARCHITECTURE_D5_RUNTIME_COUNT, D5_RUNTIME_STARTED as TYPES_D5_RUNTIME_STARTED } from "@rtb/types";
import { describe, expect, it } from "vitest";
import { D2_CONTEXT_AUTHORITY, createD2R1Store, recordCivilContext, recordCivilObjectIdentity, type D2R1Actor } from "../civil/identity-foundation";
import { D4_CONTEXT_AUTHORITY, createD4R1Store, recordMechanicalContext, recordMechanicalObjectIdentity, type D4R1Actor } from "../mechanical/identity-foundation";
import { D3_CONTEXT_AUTHORITY, createD3R1Store, recordGeotechnicalContext, recordGeotechnicalObjectIdentity, type D3R1Actor } from "../geotechnical/identity-foundation";
import { STRUCTURAL_CAPABILITY_MANIFEST } from "../structural-concrete/capability";
import { scanAnalysisFormulaBypass } from "../structural-systems/formula-scan";
import { createD1kR1Store, registerStructuralInterfaceIdentity, type D1kR1Actor, type D1kR1Catalog, type D1kR1CatalogSource, type D1kR1InterfaceInput, type D1kR1StructuralTarget } from "../structural-systems/interface-identity-foundation";
import { createD5R4Store, recordPipingComponentContext, recordPipingConnectionContext } from "./component-connection-valve-context";
import { createD5R3Store, recordPipingDesignCondition, recordPipingSpecificationContext } from "./design-condition-specification-context";
import {
  ADMIN_EQUALS_D5_PIPING_ENGINEERING_AUTHORITY,
  AI_EQUALS_D5_PIPING_ENGINEERING_AUTHORITY,
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
  D5_COMPONENT_SIZING_RUNTIME_COUNT,
  D5_CONFORMANCE_DETERMINATION_RUNTIME_COUNT,
  D5_CREATES_AUTHORITATIVE_PROCESS_DESIGN,
  D5_CROSS_DISCIPLINE_CONFLICT_DETECTION_RUNTIME_COUNT,
  D5_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT,
  D5_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT,
  D5_CROSS_DISCIPLINE_RECOMMENDATION_RUNTIME_COUNT,
  D5_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT,
  D5_D3_CREATES_GEOTECHNICAL_CONCLUSION,
  D5_D4_REUSES_D4_FUTURE_PIPING_CONTRACT,
  D5_D6_FUTURE_INTERFACE_CONTRACT_DEFINED,
  D5_D7_FUTURE_INTERFACE_CONTRACT_DEFINED,
  D5_D8_FUTURE_INTERFACE_CONTRACT_DEFINED,
  D5_D9_RUNTIME_INTEGRATION_COUNT,
  D5_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
  D5_DISCIPLINE_INTERFACE_RUNTIME_COUNT,
  D5_DISCIPLINE_INTERFACE_RUNTIME_IMPLEMENTED,
  D5_DISCIPLINE_INTERFACE_RUNTIME_READY,
  D5_EQUALS_D1_STRUCTURAL_AUTHORITY,
  D5_EQUALS_D2_CIVIL_AUTHORITY,
  D5_EQUALS_D3_GEOTECHNICAL_AUTHORITY,
  D5_EQUALS_D4_MECHANICAL_AUTHORITY,
  D5_EQUALS_D6_PROCESS_AUTHORITY,
  D5_EQUALS_D7_ELECTRICAL_AUTHORITY,
  D5_EQUALS_D8_INSTRUMENTATION_CONTROL_AUTHORITY,
  D5_EXACT_COUNTERPART_REFERENCE_REQUIRED,
  D5_FLEXIBILITY_CALCULATION_RUNTIME_COUNT,
  D5_FLANGE_RATING_CALCULATION_RUNTIME_COUNT,
  D5_GEOMETRY_SOLVER_RUNTIME_COUNT,
  D5_HYDRAULIC_CALCULATION_RUNTIME_COUNT,
  D5_INFERRED_COUNTERPART_REFERENCE_ALLOWED,
  D5_INSTRUMENT_CONNECTION_CONTEXT_EQUALS_IAC_DESIGN,
  D5_INTERFACE_COUNTERPART_AUTO_REPOINTED,
  D5_INTERFACE_HISTORICAL_REFERENCE_AUTO_REPOINTED,
  D5_INTERFACE_SOURCE_AUTO_REPOINTED,
  D5_MISSING_COUNTERPART_AUTO_FABRICATED,
  D5_PIPE_SIZING_RUNTIME_COUNT,
  D5_PIPING_STRESS_CALCULATION_RUNTIME_COUNT,
  D5_PRESSURE_DROP_CALCULATION_RUNTIME_COUNT,
  D5_R1_R7_EXACT_SOURCE_REVISIONS_REUSED,
  D5_R7_CHANGE_INTERFACE_INTEGRATION_IMPLEMENTED,
  D5_R7_DISCIPLINE_INTERFACE_RUNTIME_COUNT,
  D5_R7_RUNTIME_COUNT,
  D5_R8_AUTO_MUTATES_R3_DESIGN_CONDITION,
  D5_R8_AUTO_MUTATES_R3_SPECIFICATION,
  D5_R8_AUTO_MUTATES_R4_COMPONENT_CONTEXT,
  D5_R8_AUTO_MUTATES_R5_ROUTING_CONTEXT,
  D5_R8_AUTO_MUTATES_R6_EVIDENCE,
  D5_R8_AUTO_MUTATES_R7_CHANGE_GOVERNANCE,
  D5_R8_BLOCKER,
  D5_R8_CANONICAL_NEXT_PHASE,
  D5_R8_CANONICAL_NEXT_PHASE_SCOPE,
  D5_R8_CHANGE_AUTO_RECALCULATES_ENGINEERING,
  D5_R8_CHANGE_AUTO_REDESIGNS_ENGINEERING,
  D5_R8_CHANGE_AUTO_REPOINTS_COUNTERPART,
  D5_R8_CHANGE_AUTO_REVALIDATES_INTERFACE,
  D5_R8_DUPLICATE_GOVERNANCE_IMPLEMENTED,
  D5_R8_HANDOFF_STATUSES,
  D5_R8_HISTORY_PRESERVED,
  D5_R8_MATURITY,
  D5_R8_NEXT_PHASE_TYPE,
  D5_R8_PROVENANCE_PRESERVED,
  D5_R8_PROVENANCE_REQUIRED,
  D5_R8_REPLAY_PROTECTION_IMPLEMENTED,
  D5_R8_SPOOFING_PROTECTION_IMPLEMENTED,
  D5_R8_STATUS,
  D5_R8_TRANSFERS_DISCIPLINE_AUTHORITY,
  D5_R8_VALIDATES_COUNTERPART_ENGINEERING,
  D5_R8_VALIDATES_D1_STRUCTURAL_ENGINEERING,
  D5_R8_VALIDATES_D2_CIVIL_ENGINEERING,
  D5_R8_VALIDATES_D3_GEOTECHNICAL_ENGINEERING,
  D5_R8_VALIDATES_D4_MECHANICAL_ENGINEERING,
  D5_R9_STARTED,
  D5_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY,
  D5_REUSES_CANONICAL_CURRENTNESS,
  D5_REUSES_CANONICAL_FINGERPRINT,
  D5_REUSES_CANONICAL_INTERFACE_GOVERNANCE,
  D5_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_COUNT,
  D5_ROUTE_OPTIMIZATION_RUNTIME_COUNT,
  D5_RUNTIME_COUNT,
  D5_RUNTIME_STARTED,
  D5_SPATIAL_CLASH_DETECTION_RUNTIME_COUNT,
  D5_SUPPORT_LOAD_CALCULATION_RUNTIME_COUNT,
  D5_TRANSFERS_CIVIL_AUTHORITY,
  D5_TRANSFERS_ELECTRICAL_AUTHORITY,
  D5_TRANSFERS_GEOTECHNICAL_AUTHORITY,
  D5_TRANSFERS_IAC_AUTHORITY,
  D5_TRANSFERS_MECHANICAL_AUTHORITY,
  D5_TRANSFERS_PROCESS_AUTHORITY,
  D5_TRANSFERS_STRUCTURAL_AUTHORITY,
  D5_VALVE_SIZING_RUNTIME_COUNT,
  D5_WALL_THICKNESS_CALCULATION_RUNTIME_COUNT,
  D6_RUNTIME_STARTED,
  D7_RUNTIME_STARTED,
  D8_RUNTIME_STARTED,
  D9_RUNTIME_COUNT,
  D9_RUNTIME_STARTED,
  DATABASE_SCHEMA_CHANGED,
  EXACT_D1_COUNTERPART_REVISION_REQUIRED,
  EXACT_D2_COUNTERPART_REVISION_REQUIRED,
  EXACT_D3_COUNTERPART_REVISION_REQUIRED,
  EXACT_D4_COUNTERPART_REVISION_REQUIRED,
  EXACT_D5_INTERFACE_SOURCE_REVISION_REQUIRED,
  FLOATING_D5_INTERFACE_SOURCE_REFERENCE_ALLOWED,
  MECHANICAL_NOZZLE_CONTEXT_EQUALS_PIPING_DESIGN,
  MISSING_D5_COUNTERPART_EQUALS_INTERFACE_COMPLETE,
  NEW_DEPENDENCY_ADDED,
  PARALLEL_D5_CURRENTNESS_ENGINE_CREATED,
  PARALLEL_D5_INTERFACE_FRAMEWORK_CREATED,
  PIPING_CONNECTION_CONTEXT_EQUALS_MECHANICAL_EQUIPMENT_DESIGN,
  PIPING_HEAT_TRACING_REQUIREMENT_EQUALS_ELECTRICAL_DESIGN,
  PIPING_SUPPORT_LOAD_REFERENCE_EQUALS_STRUCTURAL_VALIDATION,
  PIPING_SUPPORT_REQUIREMENT_EQUALS_STRUCTURAL_SUPPORT_DESIGN,
  SECOND_D5_FINGERPRINT_ALGORITHM_CREATED,
  SILENT_D5_R8_MUTATION_ALLOWED,
  STALE_D5_HANDOFF_EXPOSED_AS_CURRENT,
  TENANT_WORKSPACE_PROJECT_D5_R8_SCOPE_ENFORCED,
  createD5R8Store,
  fabricatePipingCounterpart,
  markPipingInterfaceFromChange,
  mutatePipingInterface,
  reasonAcrossPipingDisciplines,
  recalculateFromPipingInterface,
  recordPipingInterfaceHandoff,
  redesignFromPipingInterface,
  repointPipingHandoff,
  startFuturePipingDisciplineRuntime,
  validatePipingCounterpart,
} from "./discipline-interfaces-handoffs";
import { D5_CONTEXT_AUTHORITY, createD5R1Store, recordPipingContext, recordPipingObjectIdentity, type D5R1Actor } from "./identity-foundation";
import { D5_R8_STARTED, D5_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_COUNT, D5_RUNTIME_COUNT as R7_COUNT, createD5R7Store, recordPipingChange, recordPipingGovernedRequirement } from "./requirements-assumptions-change";
import { D5_RUNTIME_COUNT as R5_COUNT, createD5R5Store, recordPipingRoutingContext } from "./routing-arrangement-fabrication-context";
import { D5_RUNTIME_COUNT as R6_COUNT, D5_STRESS_SUPPORT_TEST_EVIDENCE_RUNTIME_COUNT, createD5R6Store, recordPipingSupportRestraintContext } from "./stress-support-test-evidence-context";
import { createD5R2Store, recordPipingLineContext, recordPipingServiceFunction, recordPipingSystemContext } from "./system-line-service-context";

const here = dirname(fileURLToPath(import.meta.url));
const actor: D5R1Actor = { actorId: "piping-recorder", tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a", authority: D5_CONTEXT_AUTHORITY };
const civilActor: D2R1Actor = { actorId: "civil-recorder", tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a", authority: D2_CONTEXT_AUTHORITY };
const geotechActor: D3R1Actor = { actorId: "geotech-recorder", tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a", authority: D3_CONTEXT_AUTHORITY };
const mechanicalActor: D4R1Actor = { actorId: "mechanical-recorder", tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a", authority: D4_CONTEXT_AUTHORITY };
const d1Actor: D1kR1Actor = { actorId: "engineer-1", tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a", authority: "HUMAN_ENGINEER" };

function throws(run: () => unknown): string {
  try {
    run();
    return "NO_THROW";
  } catch (error) {
    return error instanceof Error ? error.message : "UNKNOWN";
  }
}

function target(): D1kR1StructuralTarget {
  return { kind: "FOUNDATION_INTERFACE", id: "foundation-target-1", structuralSystemId: "system-1", tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a", revision: "sys-4" };
}

function source(): D1kR1CatalogSource {
  return {
    sourceId: "src-piping-8", tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a",
    sourceClass: "MANUAL_GOVERNED_REFERENCE", sourceDiscipline: "piping", objectId: "support-1", documentId: "doc-piping-8",
    revision: "rev-8", evidenceId: "evidence-8", evidenceKind: "source_document", authority: "PIPING_ENGINEER_OF_RECORD",
    provenanceRef: "provenance-piping-8", issuedAt: "2026-10-20T00:00:00.000Z", nativePackContractExposed: false, operationalExternalReference: false,
  };
}

function catalog(): D1kR1Catalog {
  return { targets: [target(), { ...target(), kind: "STRUCTURAL_SYSTEM", id: "system-1" }], sources: [source()] };
}

function d1Input(): D1kR1InterfaceInput {
  return {
    interfaceId: "interface-piping-1", relation: "PROVIDES_INPUT_TO", sourceDiscipline: "piping", targetDiscipline: "structural",
    counterpartyDiscipline: "piping", structuralTargetKind: "FOUNDATION_INTERFACE", structuralTargetId: "foundation-target-1",
    sourceId: "src-piping-8", humanReviewRequired: true, description: "Piping support requirement supplied to the structural interface",
  };
}

describe("EOS-D5-R8 discipline interfaces and handoffs", () => {
  it("records exact Piping handoffs without transferring authority or fabricating counterparts", () => {
    expect(D5_R8_STATUS).toBe("DISCIPLINE_INTERFACES_AND_HANDOFFS_IMPLEMENTED");
    expect(D5_R8_MATURITY).toBe(D5_R8_STATUS);
    expect(D5_RUNTIME_STARTED).toBe(true);
    expect(D5_RUNTIME_COUNT).toBe(8);
    expect(D5_R7_RUNTIME_COUNT).toBe(7);
    expect(R7_COUNT).toBe(7);
    expect(R6_COUNT).toBe(6);
    expect(R5_COUNT).toBe(5);
    expect(ARCHITECTURE_D5_RUNTIME_COUNT).toBe(0);
    expect(TYPES_D5_RUNTIME_STARTED).toBe(false);
    expect(D5_R8_STARTED).toBe(false);
    expect(D5_R9_STARTED).toBe(false);
    expect(D5_R7_DISCIPLINE_INTERFACE_RUNTIME_COUNT).toBe(0);
    expect(D5_DISCIPLINE_INTERFACE_RUNTIME_IMPLEMENTED).toBe(true);
    expect(D5_DISCIPLINE_INTERFACE_RUNTIME_COUNT).toBe(1);
    expect(D5_DISCIPLINE_INTERFACE_RUNTIME_READY).toBe(true);
    expect(D5_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY).toBe(true);
    expect(D5_STRESS_SUPPORT_TEST_EVIDENCE_RUNTIME_COUNT).toBe(1);
    expect(D5_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_COUNT).toBe(1);
    expect(D5_REUSES_CANONICAL_INTERFACE_GOVERNANCE).toBe(true);
    expect(PARALLEL_D5_INTERFACE_FRAMEWORK_CREATED).toBe(false);
    expect(D5_R8_HANDOFF_STATUSES).toContain("COMPLETE");
    expect(D5_R8_HANDOFF_STATUSES).toContain("AWAITING_COUNTERPART");
    expect(D5_R1_R7_EXACT_SOURCE_REVISIONS_REUSED).toBe(true);
    expect(EXACT_D5_INTERFACE_SOURCE_REVISION_REQUIRED).toBe(true);
    expect(FLOATING_D5_INTERFACE_SOURCE_REFERENCE_ALLOWED).toBe(false);
    expect(D5_INTERFACE_SOURCE_AUTO_REPOINTED).toBe(false);
    expect(D5_EXACT_COUNTERPART_REFERENCE_REQUIRED).toBe(true);
    expect(D5_INFERRED_COUNTERPART_REFERENCE_ALLOWED).toBe(false);
    expect(D5_MISSING_COUNTERPART_AUTO_FABRICATED).toBe(false);
    expect(MISSING_D5_COUNTERPART_EQUALS_INTERFACE_COMPLETE).toBe(false);
    expect(EXACT_D1_COUNTERPART_REVISION_REQUIRED).toBe(true);
    expect(EXACT_D2_COUNTERPART_REVISION_REQUIRED).toBe(true);
    expect(EXACT_D3_COUNTERPART_REVISION_REQUIRED).toBe(true);
    expect(EXACT_D4_COUNTERPART_REVISION_REQUIRED).toBe(true);
    expect(PIPING_SUPPORT_REQUIREMENT_EQUALS_STRUCTURAL_SUPPORT_DESIGN).toBe(false);
    expect(PIPING_SUPPORT_LOAD_REFERENCE_EQUALS_STRUCTURAL_VALIDATION).toBe(false);
    expect(D5_TRANSFERS_STRUCTURAL_AUTHORITY).toBe(false);
    expect(D5_R8_VALIDATES_D1_STRUCTURAL_ENGINEERING).toBe(false);
    expect(D5_EQUALS_D1_STRUCTURAL_AUTHORITY).toBe(false);
    expect(D5_TRANSFERS_CIVIL_AUTHORITY).toBe(false);
    expect(D5_R8_VALIDATES_D2_CIVIL_ENGINEERING).toBe(false);
    expect(D5_EQUALS_D2_CIVIL_AUTHORITY).toBe(false);
    expect(D5_TRANSFERS_GEOTECHNICAL_AUTHORITY).toBe(false);
    expect(D5_R8_VALIDATES_D3_GEOTECHNICAL_ENGINEERING).toBe(false);
    expect(D5_EQUALS_D3_GEOTECHNICAL_AUTHORITY).toBe(false);
    expect(D5_D3_CREATES_GEOTECHNICAL_CONCLUSION).toBe(false);
    expect(D5_TRANSFERS_MECHANICAL_AUTHORITY).toBe(false);
    expect(D5_R8_VALIDATES_D4_MECHANICAL_ENGINEERING).toBe(false);
    expect(D5_EQUALS_D4_MECHANICAL_AUTHORITY).toBe(false);
    expect(MECHANICAL_NOZZLE_CONTEXT_EQUALS_PIPING_DESIGN).toBe(false);
    expect(PIPING_CONNECTION_CONTEXT_EQUALS_MECHANICAL_EQUIPMENT_DESIGN).toBe(false);
    expect(D5_D4_REUSES_D4_FUTURE_PIPING_CONTRACT).toBe(true);
    expect(D5_D6_FUTURE_INTERFACE_CONTRACT_DEFINED).toBe(true);
    expect(D5_CREATES_AUTHORITATIVE_PROCESS_DESIGN).toBe(false);
    expect(D5_TRANSFERS_PROCESS_AUTHORITY).toBe(false);
    expect(D5_EQUALS_D6_PROCESS_AUTHORITY).toBe(false);
    expect(D5_D7_FUTURE_INTERFACE_CONTRACT_DEFINED).toBe(true);
    expect(PIPING_HEAT_TRACING_REQUIREMENT_EQUALS_ELECTRICAL_DESIGN).toBe(false);
    expect(D5_TRANSFERS_ELECTRICAL_AUTHORITY).toBe(false);
    expect(D5_EQUALS_D7_ELECTRICAL_AUTHORITY).toBe(false);
    expect(D5_D8_FUTURE_INTERFACE_CONTRACT_DEFINED).toBe(true);
    expect(D5_INSTRUMENT_CONNECTION_CONTEXT_EQUALS_IAC_DESIGN).toBe(false);
    expect(D5_TRANSFERS_IAC_AUTHORITY).toBe(false);
    expect(D5_EQUALS_D8_INSTRUMENTATION_CONTROL_AUTHORITY).toBe(false);
    expect(D5_REUSES_CANONICAL_CURRENTNESS).toBe(true);
    expect(PARALLEL_D5_CURRENTNESS_ENGINE_CREATED).toBe(false);
    expect(D5_INTERFACE_HISTORICAL_REFERENCE_AUTO_REPOINTED).toBe(false);
    expect(D5_INTERFACE_COUNTERPART_AUTO_REPOINTED).toBe(false);
    expect(STALE_D5_HANDOFF_EXPOSED_AS_CURRENT).toBe(false);
    expect(D5_R7_CHANGE_INTERFACE_INTEGRATION_IMPLEMENTED).toBe(true);
    expect(D5_R8_CHANGE_AUTO_RECALCULATES_ENGINEERING).toBe(false);
    expect(D5_R8_CHANGE_AUTO_REDESIGNS_ENGINEERING).toBe(false);
    expect(D5_R8_CHANGE_AUTO_REVALIDATES_INTERFACE).toBe(false);
    expect(D5_R8_CHANGE_AUTO_REPOINTS_COUNTERPART).toBe(false);
    expect(D5_R8_AUTO_MUTATES_R3_DESIGN_CONDITION).toBe(false);
    expect(D5_R8_AUTO_MUTATES_R3_SPECIFICATION).toBe(false);
    expect(D5_R8_AUTO_MUTATES_R4_COMPONENT_CONTEXT).toBe(false);
    expect(D5_R8_AUTO_MUTATES_R5_ROUTING_CONTEXT).toBe(false);
    expect(D5_R8_AUTO_MUTATES_R6_EVIDENCE).toBe(false);
    expect(D5_R8_AUTO_MUTATES_R7_CHANGE_GOVERNANCE).toBe(false);
    expect(AI_EQUALS_D5_PIPING_ENGINEERING_AUTHORITY).toBe(false);
    expect(ADMIN_EQUALS_D5_PIPING_ENGINEERING_AUTHORITY).toBe(false);
    expect(D5_R8_VALIDATES_COUNTERPART_ENGINEERING).toBe(false);
    expect(D5_R8_TRANSFERS_DISCIPLINE_AUTHORITY).toBe(false);
    expect(D5_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_COUNT).toBe(0);
    expect(D5_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT).toBe(0);
    expect(D5_D9_SOURCE_CONTRACT_RUNTIME_COUNT).toBe(0);
    expect(D5_D9_RUNTIME_INTEGRATION_COUNT).toBe(0);
    expect(D5_PIPE_SIZING_RUNTIME_COUNT + D5_HYDRAULIC_CALCULATION_RUNTIME_COUNT + D5_PRESSURE_DROP_CALCULATION_RUNTIME_COUNT + D5_WALL_THICKNESS_CALCULATION_RUNTIME_COUNT).toBe(0);
    expect(D5_BRANCH_REINFORCEMENT_CALCULATION_RUNTIME_COUNT + D5_FLANGE_RATING_CALCULATION_RUNTIME_COUNT + D5_VALVE_SIZING_RUNTIME_COUNT + D5_COMPONENT_SIZING_RUNTIME_COUNT).toBe(0);
    expect(D5_PIPING_STRESS_CALCULATION_RUNTIME_COUNT + D5_FLEXIBILITY_CALCULATION_RUNTIME_COUNT + D5_SUPPORT_LOAD_CALCULATION_RUNTIME_COUNT).toBe(0);
    expect(D5_AUTOMATIC_ROUTING_RUNTIME_COUNT + D5_ROUTE_OPTIMIZATION_RUNTIME_COUNT + D5_SPATIAL_CLASH_DETECTION_RUNTIME_COUNT + D5_GEOMETRY_SOLVER_RUNTIME_COUNT + D5_AUTOMATIC_REDESIGN_RUNTIME_COUNT).toBe(0);
    expect(D5_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT + D5_CONFORMANCE_DETERMINATION_RUNTIME_COUNT + D5_APPROVAL_RUNTIME_COUNT + D5_CERTIFICATION_RUNTIME_COUNT).toBe(0);
    expect(D5_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT + D5_CROSS_DISCIPLINE_CONFLICT_DETECTION_RUNTIME_COUNT + D5_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT + D5_CROSS_DISCIPLINE_RECOMMENDATION_RUNTIME_COUNT).toBe(0);
    expect(D5_REUSES_CANONICAL_FINGERPRINT).toBe(true);
    expect(SECOND_D5_FINGERPRINT_ALGORITHM_CREATED).toBe(false);
    expect(D5_R8_PROVENANCE_REQUIRED).toBe(true);
    expect(D5_R8_PROVENANCE_PRESERVED).toBe(true);
    expect(SILENT_D5_R8_MUTATION_ALLOWED).toBe(false);
    expect(D5_R8_HISTORY_PRESERVED).toBe(true);
    expect(TENANT_WORKSPACE_PROJECT_D5_R8_SCOPE_ENFORCED).toBe(true);
    expect(D5_R8_DUPLICATE_GOVERNANCE_IMPLEMENTED).toBe(true);
    expect(D5_R8_REPLAY_PROTECTION_IMPLEMENTED).toBe(true);
    expect(D5_R8_SPOOFING_PROTECTION_IMPLEMENTED).toBe(true);
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
    expect(D5_R8_CANONICAL_NEXT_PHASE).toBe("EOS-D5-R9-REVIEW-AND-VALIDATION-GOVERNANCE");
    expect(D5_R8_NEXT_PHASE_TYPE).toBe("REVIEW_AND_VALIDATION_GOVERNANCE");
    expect(D5_R8_CANONICAL_NEXT_PHASE_SCOPE).toContain("exact R1-R8 revisions");
    expect(D5_R8_BLOCKER).toBe("NONE");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D5.R8.DISCIPLINE_INTERFACES_AND_HANDOFFS")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D5.R9.REVIEW_AND_VALIDATION_GOVERNANCE")?.implementationState).toBe("NOT_IMPLEMENTED");

    const r1 = createD5R1Store();
    recordPipingContext(r1, actor, { contextId: "ctx-1", citedLifecycleStage: "FEED", provenanceRef: "prov-ctx" });
    const system = recordPipingObjectIdentity(r1, actor, { objectId: "sys-1", contextId: "ctx-1", objectType: "PIPING_SYSTEM_CONTEXT", citedLifecycleStage: "FEED", provenanceRef: "prov-sys" });
    const line = recordPipingObjectIdentity(r1, actor, { objectId: "line-1", contextId: "ctx-1", objectType: "PIPING_LINE", citedLifecycleStage: "FEED", provenanceRef: "prov-line" });
    const serviceIdentity = recordPipingObjectIdentity(r1, actor, { objectId: "svc-1", contextId: "ctx-1", objectType: "PIPING_SERVICE_CONTEXT", citedLifecycleStage: "FEED", provenanceRef: "prov-svc" });
    const flange = recordPipingObjectIdentity(r1, actor, { objectId: "flange-1", contextId: "ctx-1", objectType: "PIPING_COMPONENT_CONTEXT", citedLifecycleStage: "FEED", provenanceRef: "prov-flange" });
    const routeIdentity = recordPipingObjectIdentity(r1, actor, { objectId: "route-1", contextId: "ctx-1", objectType: "PIPING_ROUTE_CONTEXT", citedLifecycleStage: "FEED", provenanceRef: "prov-route" });
    const connectionIdentity = recordPipingObjectIdentity(r1, actor, { objectId: "conn-id-1", contextId: "ctx-1", objectType: "PIPING_CONNECTION_CONTEXT", citedLifecycleStage: "FEED", provenanceRef: "prov-conn" });
    const supportIdentity = recordPipingObjectIdentity(r1, actor, { objectId: "support-1", contextId: "ctx-1", objectType: "PIPING_SUPPORT_REQUIREMENT_CONTEXT", citedLifecycleStage: "FEED", provenanceRef: "prov-support" });
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
    const r6 = createD5R6Store(r5);
    const support = recordPipingSupportRestraintContext(r6, actor, {
      contextId: "ctx-1", lineRecordId: lineContext.lineRecordId, lineContextFingerprint: lineContext.fingerprint,
      conditionId: condition.conditionId, conditionRevisionFingerprint: condition.fingerprint,
      componentRecordId: component.componentRecordId, componentRevisionFingerprint: component.fingerprint,
      connectionRecordId: connection.connectionRecordId, connectionRevisionFingerprint: connection.fingerprint,
      routeRecordId: route.routeRecordId, routeRevisionFingerprint: route.fingerprint,
      citedLifecycleStage: "FEED", citedCurrentness: "CURRENT", provenanceRef: "prov-r6",
      sourceBasisRef: "support-note-1", sourceBasisCategory: "PROJECT_PIPING_DATA",
      limitations: "Supplied guide location only", identityBasis: "EXPLICIT",
      objectId: supportIdentity.objectId, objectRevisionFingerprint: supportIdentity.fingerprint, applicabilityRef: supportIdentity.objectId,
      supportRecordId: "sup-1", supportFunction: "GUIDE", supportLocation: "rack A bay 3 supplied", loadReference: { value: "4.2", unit: "kN" },
    });
    const r7 = createD5R7Store(r6);
    const subject = {
      contextId: "ctx-1", objectId: support.objectId, objectRevisionFingerprint: support.objectRevisionFingerprint,
      lineRecordId: lineContext.lineRecordId, lineContextFingerprint: lineContext.fingerprint,
      conditionId: condition.conditionId, conditionRevisionFingerprint: condition.fingerprint,
      componentRecordId: component.componentRecordId, componentRevisionFingerprint: component.fingerprint,
      connectionRecordId: connection.connectionRecordId, connectionRevisionFingerprint: connection.fingerprint,
      routeRecordId: route.routeRecordId, routeRevisionFingerprint: route.fingerprint,
      r6SubjectKind: "SUPPORT" as const, r6SubjectId: support.supportRecordId, r6RevisionFingerprint: support.fingerprint,
      citedLifecycleStage: "FEED", citedCurrentness: "CURRENT" as const, applicabilityRef: support.objectId,
      limitations: "CW-100 guide at bay 3 only", provenanceRef: "prov-r7", identityBasis: "EXPLICIT",
    };
    const requirement = recordPipingGovernedRequirement(r7, actor, {
      ...subject, requirementId: "req-support-1", statement: "Adopt a guide requirement at bay 3 for CW-100",
      requirementCategory: "DESIGN_CRITERIA", sourceBasis: "PROJECT_PIPING_DATA", sourceRef: "support-note-1", sourceRevision: "rev-a",
      adoptionRationale: "Piping recorder adopts the supplied guide note for this line revision only",
    });
    const change = recordPipingChange(r7, actor, {
      ...subject, changeId: "chg-support-1", changeCategory: "SUPPORT_CONTEXT_CHANGED", originRef: "change-note-9",
      reason: "Support location note changed for this exact requirement",
      dependencies: [{ kind: "OBJECT_REFERENCE", targetKind: "R6_SUPPORT", targetId: support.supportRecordId, targetFingerprint: support.fingerprint }],
    });
    const d1 = createD1kR1Store(catalog(), () => "2026-10-24T00:00:00.000Z");
    const structural = registerStructuralInterfaceIdentity(d1, d1Actor, d1Input());
    const d2 = createD2R1Store();
    const civilContext = recordCivilContext(d2, civilActor, { contextId: "civil-context-1", citedLifecycleStage: "CONCEPT", provenanceRef: "prov-civil-context" });
    const civilSite = recordCivilObjectIdentity(d2, civilActor, { objectId: "civil-site-1", contextId: civilContext.contextId, objectType: "CIVIL_SITE", citedLifecycleStage: "CONCEPT", provenanceRef: "prov-civil-site" });
    const d3 = createD3R1Store();
    const geotechContext = recordGeotechnicalContext(d3, geotechActor, { contextId: "geotech-context-1", citedLifecycleStage: "CONCEPT", provenanceRef: "prov-geotech-context" });
    const geotechSite = recordGeotechnicalObjectIdentity(d3, geotechActor, { objectId: "geotech-site-1", contextId: geotechContext.contextId, objectType: "GEOTECHNICAL_SITE_CONTEXT", citedLifecycleStage: "CONCEPT", provenanceRef: "prov-geotech-site" });
    const d4 = createD4R1Store();
    const mechanicalContext = recordMechanicalContext(d4, mechanicalActor, { contextId: "mech-context-1", citedLifecycleStage: "CONCEPT", provenanceRef: "prov-mech-context" });
    const nozzle = recordMechanicalObjectIdentity(d4, mechanicalActor, { objectId: "nozzle-1", contextId: mechanicalContext.contextId, objectType: "MECHANICAL_INTERFACE_POINT", citedLifecycleStage: "CONCEPT", provenanceRef: "prov-nozzle" });
    const upstream = JSON.stringify({
      condition: condition.fingerprint, specification: specification.fingerprint, component: component.fingerprint,
      route: route.fingerprint, support: support.fingerprint, requirement: requirement.fingerprint, change: change.fingerprint,
      structural: structural.fingerprint, civil: civilSite.fingerprint, geotech: geotechSite.fingerprint, nozzle: nozzle.fingerprint,
    });
    const store = createD5R8Store(r7, d1, d2, d3, d4);
    const shared = {
      tenantId: actor.tenantId, workspaceId: actor.workspaceId, projectId: actor.projectId,
      contextId: "ctx-1", objectId: support.objectId, objectRevisionFingerprint: support.objectRevisionFingerprint,
      lineRecordId: lineContext.lineRecordId, lineContextFingerprint: lineContext.fingerprint,
      conditionId: condition.conditionId, conditionRevisionFingerprint: condition.fingerprint,
      componentRecordId: component.componentRecordId, componentRevisionFingerprint: component.fingerprint,
      connectionRecordId: connection.connectionRecordId, connectionRevisionFingerprint: connection.fingerprint,
      routeRecordId: route.routeRecordId, routeRevisionFingerprint: route.fingerprint,
      r6SubjectKind: "SUPPORT", r6SubjectId: support.supportRecordId, r6RevisionFingerprint: support.fingerprint,
      r7SubjectKind: "REQUIREMENT", r7SubjectId: requirement.requirementId, r7RevisionFingerprint: requirement.fingerprint,
      citedCurrentness: "CURRENT" as const, citedLifecycleStage: "FEED", applicabilityRef: support.objectId,
      limitations: "Handoff cites the exact Piping source and does not design the counterpart",
      provenanceRef: "prov-handoff", identityBasis: "EXPLICIT",
    };
    const toStructural = recordPipingInterfaceHandoff(store, actor, {
      ...shared, handoffId: "handoff-d1", counterpartDiscipline: "structural", direction: "D5_TO_COUNTERPART",
      interfaceTopic: "SUPPORT_OR_RESTRAINT_REQUIREMENT", counterpartInterfaceId: structural.interfaceId,
      counterpartSourceRevision: structural.sourceRevision, counterpartFingerprint: structural.fingerprint, handoffStatus: "COMPLETE",
    });
    expect(toStructural.interfaceComplete).toBe(true);
    expect(toStructural.engineeringValidated).toBe(false);
    expect(toStructural.authorityTransferred).toBe(false);
    expect(toStructural.reviewed).toBe(false);
    expect(toStructural.objectRevisionFingerprint).toBe(support.objectRevisionFingerprint);
    expect(toStructural.r7RevisionFingerprint).toBe(requirement.fingerprint);
    expect(toStructural.counterpart?.sourceRevision).toBe(structural.sourceRevision);
    expect(toStructural.sourceAuthority).toBe(D5_CONTEXT_AUTHORITY);
    expect(recordPipingInterfaceHandoff(store, actor, {
      ...shared, handoffId: "handoff-d1", counterpartDiscipline: "structural", direction: "D5_TO_COUNTERPART",
      interfaceTopic: "SUPPORT_OR_RESTRAINT_REQUIREMENT", counterpartInterfaceId: structural.interfaceId,
      counterpartSourceRevision: structural.sourceRevision, counterpartFingerprint: structural.fingerprint, handoffStatus: "COMPLETE",
    })).toBe(toStructural);
    const fromStructural = recordPipingInterfaceHandoff(store, actor, {
      ...shared, handoffId: "handoff-d1-in", counterpartDiscipline: "structural", direction: "COUNTERPART_TO_D5",
      interfaceTopic: "ANCHOR_LOADS", counterpartInterfaceId: structural.interfaceId,
      counterpartSourceRevision: structural.sourceRevision, handoffStatus: "INCOMPLETE",
    });
    expect(fromStructural.interfaceComplete).toBe(false);
    const toCivil = recordPipingInterfaceHandoff(store, actor, {
      ...shared, handoffId: "handoff-d2", counterpartDiscipline: "civil", direction: "D5_TO_COUNTERPART", interfaceTopic: "BURIED_PIPING_CONTEXT",
      counterpartInterfaceId: civilSite.objectId, counterpartSourceRevision: civilSite.provenanceRef, counterpartFingerprint: civilSite.fingerprint, handoffStatus: "COMPLETE",
    });
    expect(toCivil.authorityTransferred).toBe(false);
    expect(toCivil.engineeringValidated).toBe(false);
    const toGeotech = recordPipingInterfaceHandoff(store, actor, {
      ...shared, handoffId: "handoff-d3", counterpartDiscipline: "geotechnical", direction: "D5_TO_COUNTERPART", interfaceTopic: "SETTLEMENT_RELATED_PIPING_REQUIREMENT",
      counterpartInterfaceId: geotechSite.objectId, counterpartSourceRevision: geotechSite.provenanceRef, counterpartFingerprint: geotechSite.fingerprint, handoffStatus: "COMPLETE",
    });
    expect(toGeotech.geotechnicalConclusion).toBe(false);
    expect(toGeotech.authorityTransferred).toBe(false);
    const toMechanical = recordPipingInterfaceHandoff(store, actor, {
      ...shared, handoffId: "handoff-d4", counterpartDiscipline: "mechanical", direction: "D5_TO_COUNTERPART", interfaceTopic: "NOZZLE_ORIENTATION",
      counterpartInterfaceId: nozzle.objectId, counterpartSourceRevision: nozzle.provenanceRef, counterpartFingerprint: nozzle.fingerprint, handoffStatus: "COMPLETE",
    });
    expect(toMechanical.authorityTransferred).toBe(false);
    expect(toMechanical.engineeringValidated).toBe(false);
    expect(toMechanical.counterpart?.discipline).toBe("mechanical");
    const awaiting = recordPipingInterfaceHandoff(store, actor, {
      ...shared, handoffId: "handoff-missing", counterpartDiscipline: "structural", direction: "D5_TO_COUNTERPART",
      interfaceTopic: "STRUCTURAL_PENETRATION_OR_SUPPORT_REQUIREMENT", handoffStatus: "AWAITING_COUNTERPART",
    });
    expect(awaiting.counterpart).toBeNull();
    expect(awaiting.interfaceComplete).toBe(false);
    const processContract = recordPipingInterfaceHandoff(store, actor, {
      ...shared, handoffId: "handoff-d6", counterpartDiscipline: "process", direction: "COUNTERPART_TO_D5",
      interfaceTopic: "PROCESS_CONDITION", handoffStatus: "NOT_YET_AVAILABLE",
    });
    const electricalContract = recordPipingInterfaceHandoff(store, actor, {
      ...shared, handoffId: "handoff-d7", counterpartDiscipline: "electrical", direction: "D5_TO_COUNTERPART",
      interfaceTopic: "ELECTRIC_HEAT_TRACING_REQUIREMENT", handoffStatus: "AWAITING_COUNTERPART",
    });
    const iacContract = recordPipingInterfaceHandoff(store, actor, {
      ...shared, handoffId: "handoff-d8", counterpartDiscipline: "instrumentation_control", direction: "D5_TO_COUNTERPART",
      interfaceTopic: "INLINE_INSTRUMENT", handoffStatus: "NOT_YET_AVAILABLE",
    });
    expect(processContract.interfaceComplete).toBe(false);
    expect(electricalContract.interfaceComplete).toBe(false);
    expect(iacContract.interfaceComplete).toBe(false);
    expect(D6_RUNTIME_STARTED).toBe(false);
    const replaced = recordPipingInterfaceHandoff(store, actor, {
      ...shared, handoffId: "handoff-d1-b", predecessorHandoffId: toStructural.handoffId, counterpartDiscipline: "structural",
      direction: "D5_TO_COUNTERPART", interfaceTopic: "SUPPORT_OR_RESTRAINT_REQUIREMENT", counterpartInterfaceId: structural.interfaceId,
      counterpartSourceRevision: structural.sourceRevision, counterpartFingerprint: structural.fingerprint, handoffStatus: "COMPLETE",
      limitations: "Replacement handoff keeps the original counterpart revision",
    });
    const historical = store.handoffs.find((row) => row.handoffId === toStructural.handoffId);
    expect(historical?.fingerprint).toBe(toStructural.fingerprint);
    expect(historical?.currentness).toBe("SUPERSEDED");
    expect(historical?.counterpart?.sourceRevision).toBe(structural.sourceRevision);
    expect(replaced.predecessorFingerprint).toBe(toStructural.fingerprint);
    const marked = markPipingInterfaceFromChange(store, actor, {
      handoffId: toCivil.handoffId, handoffFingerprint: toCivil.fingerprint, changeId: change.changeId, changeFingerprint: change.fingerprint, mark: "STALE",
    });
    expect(marked.fingerprint).toBe(toCivil.fingerprint);
    expect(marked.currentness).toBe("STALE");
    expect(marked.interfaceComplete).toBe(false);
    expect(marked.engineeringValidated).toBe(false);
    expect(marked.counterpart?.fingerprint).toBe(civilSite.fingerprint);
    expect(JSON.stringify({
      condition: condition.fingerprint, specification: specification.fingerprint, component: component.fingerprint,
      route: route.fingerprint, support: support.fingerprint, requirement: requirement.fingerprint, change: change.fingerprint,
      structural: structural.fingerprint, civil: civilSite.fingerprint, geotech: geotechSite.fingerprint, nozzle: nozzle.fingerprint,
    })).toBe(upstream);
    expect(throws(() => recordPipingInterfaceHandoff(store, actor, {
      ...shared, handoffId: "handoff-dup", counterpartDiscipline: "mechanical", direction: "D5_TO_COUNTERPART", interfaceTopic: "NOZZLE_ORIENTATION",
      counterpartInterfaceId: nozzle.objectId, counterpartSourceRevision: nozzle.provenanceRef, handoffStatus: "COMPLETE",
    }))).toBe("D5_R8_DUPLICATE_HANDOFF_REJECTED");
    expect(throws(() => recordPipingInterfaceHandoff(store, actor, {
      ...shared, handoffId: "handoff-d1", counterpartDiscipline: "structural", direction: "D5_TO_COUNTERPART",
      interfaceTopic: "SUPPORT_REACTION_OR_LOAD_CONTEXT", counterpartInterfaceId: structural.interfaceId, counterpartSourceRevision: structural.sourceRevision, handoffStatus: "INCOMPLETE",
    }))).toBe("D5_R8_HANDOFF_ALREADY_RECORDED");
    expect(throws(() => recordPipingInterfaceHandoff(store, actor, {
      ...shared, handoffId: "handoff-spoof", assertedFingerprint: "spoofed", counterpartDiscipline: "structural", direction: "D5_TO_COUNTERPART",
      interfaceTopic: "SUPPORT_REACTION_OR_LOAD_CONTEXT", counterpartInterfaceId: structural.interfaceId, counterpartSourceRevision: structural.sourceRevision, handoffStatus: "INCOMPLETE",
    }))).toBe("D5_R8_FINGERPRINT_MISMATCH");
    expect(throws(() => recordPipingInterfaceHandoff(store, actor, {
      ...shared, handoffId: "handoff-float", objectRevisionFingerprint: "latest", counterpartDiscipline: "structural", direction: "D5_TO_COUNTERPART",
      interfaceTopic: "ANCHOR_LOADS", handoffStatus: "AWAITING_COUNTERPART",
    }))).toBe("D5_R8_R1_REVISION_REQUIRED");
    expect(throws(() => recordPipingInterfaceHandoff(store, actor, {
      ...shared, handoffId: "handoff-wrong-rev", counterpartDiscipline: "structural", direction: "D5_TO_COUNTERPART",
      interfaceTopic: "EQUIPMENT_OR_PIPING_IMPOSED_LOAD_CONTEXT", counterpartInterfaceId: structural.interfaceId, counterpartSourceRevision: "rev-wrong", handoffStatus: "INCOMPLETE",
    }))).toBe("D5_R8_COUNTERPART_REVISION_MISMATCH");
    expect(throws(() => recordPipingInterfaceHandoff(store, actor, {
      ...shared, handoffId: "handoff-wrong-fp", counterpartDiscipline: "civil", direction: "COUNTERPART_TO_D5", interfaceTopic: "TRENCH",
      counterpartInterfaceId: civilSite.objectId, counterpartSourceRevision: civilSite.provenanceRef, counterpartFingerprint: "not-the-site", handoffStatus: "INCOMPLETE",
    }))).toBe("D5_R8_FINGERPRINT_MISMATCH");
    expect(throws(() => recordPipingInterfaceHandoff(store, actor, {
      ...shared, handoffId: "handoff-complete-missing", counterpartDiscipline: "civil", direction: "D5_TO_COUNTERPART", interfaceTopic: "CROSSING", handoffStatus: "COMPLETE",
    }))).toBe("D5_R8_INCOMPLETE_COUNTERPART_NOT_COMPLETE");
    expect(throws(() => recordPipingInterfaceHandoff(store, actor, {
      ...shared, handoffId: "handoff-infer", inference: "ai_inference", counterpartDiscipline: "geotechnical", direction: "D5_TO_COUNTERPART",
      interfaceTopic: "TRENCH_GEOTECHNICAL_SOURCE", handoffStatus: "AWAITING_COUNTERPART",
    }))).toBe("D5_R8_INFERRED_COUNTERPART_REJECTED");
    expect(throws(() => recordPipingInterfaceHandoff(store, actor, {
      ...shared, handoffId: "handoff-fab", counterpartDiscipline: "process", direction: "COUNTERPART_TO_D5", interfaceTopic: "FLUID_OR_SERVICE_IDENTITY",
      counterpartInterfaceId: "invented-process", counterpartSourceRevision: "rev-x", handoffStatus: "NOT_YET_AVAILABLE",
    }))).toBe("D5_R8_COUNTERPART_FABRICATION_REJECTED");
    expect(throws(() => recordPipingInterfaceHandoff(store, actor, {
      ...shared, handoffId: "handoff-stale-current", citedCurrentness: "CURRENT", counterpartDiscipline: "electrical", direction: "D5_TO_COUNTERPART",
      interfaceTopic: "BONDING_OR_EARTHING_REQUIREMENT_CONTEXT", handoffStatus: "STALE",
    }))).toBe("D5_R8_CURRENTNESS_STATUS_MISMATCH");
    expect(throws(() => recordPipingInterfaceHandoff(store, actor, {
      ...shared, tenantId: "tenant-b", handoffId: "handoff-scope", counterpartDiscipline: "structural", direction: "D5_TO_COUNTERPART",
      interfaceTopic: "ANCHOR_LOADS", handoffStatus: "AWAITING_COUNTERPART",
    }))).toBe("D5_R8_SCOPE_MISMATCH");
    expect(throws(() => recordPipingInterfaceHandoff(store, { ...actor, actorId: "AI_agent" }, {
      ...shared, handoffId: "handoff-ai", counterpartDiscipline: "structural", direction: "D5_TO_COUNTERPART", interfaceTopic: "ANCHOR_LOADS", handoffStatus: "AWAITING_COUNTERPART",
    }))).toBe("D5_R8_AI_NOT_PIPING_AUTHORITY");
    expect(throws(() => recordPipingInterfaceHandoff(store, { ...actor, actorId: "ADMIN" }, {
      ...shared, handoffId: "handoff-admin", counterpartDiscipline: "structural", direction: "D5_TO_COUNTERPART", interfaceTopic: "ANCHOR_LOADS", handoffStatus: "AWAITING_COUNTERPART",
    }))).toBe("D5_R8_ADMIN_NOT_PIPING_AUTHORITY");
    expect(throws(() => recordPipingInterfaceHandoff(store, { ...actor, authority: "PIPING_ENGINEERING_AUTHORITY" }, {
      ...shared, handoffId: "handoff-auth", counterpartDiscipline: "structural", direction: "D5_TO_COUNTERPART", interfaceTopic: "ANCHOR_LOADS", handoffStatus: "AWAITING_COUNTERPART",
    }))).toBe("D5_R8_AUTHORITY_SPOOFING_REJECTED");
    expect(throws(() => recordPipingInterfaceHandoff(store, actor, {
      ...shared, transferAuthority: true, handoffId: "handoff-transfer", counterpartDiscipline: "mechanical", direction: "COUNTERPART_TO_D5",
      interfaceTopic: "PACKAGE_PIPING_BOUNDARY", handoffStatus: "AWAITING_COUNTERPART",
    }))).toBe("D5_R8_AUTHORITY_TRANSFER_REJECTED");
    expect(throws(() => recordPipingInterfaceHandoff(store, actor, {
      ...shared, validateCounterpart: true, handoffId: "handoff-validate", counterpartDiscipline: "civil", direction: "D5_TO_COUNTERPART",
      interfaceTopic: "DRAINAGE_INTERACTION", handoffStatus: "AWAITING_COUNTERPART",
    }))).toBe("D5_R8_COUNTERPART_VALIDATION_NOT_IN_R8");
    expect(throws(() => recordPipingInterfaceHandoff(store, actor, {
      ...shared, reasonAcrossDisciplines: true, handoffId: "handoff-reason", counterpartDiscipline: "geotechnical", direction: "D5_TO_COUNTERPART",
      interfaceTopic: "BURIED_PIPE_GROUND_INTERACTION_SOURCE", handoffStatus: "AWAITING_COUNTERPART",
    }))).toBe("D5_R8_CROSS_DISCIPLINE_REASONING_NOT_IN_R8");
    expect(throws(() => markPipingInterfaceFromChange(store, actor, {
      repoint: true, handoffId: toGeotech.handoffId, handoffFingerprint: toGeotech.fingerprint, changeId: change.changeId, changeFingerprint: change.fingerprint, mark: "REASSESSMENT_REQUIRED",
    }))).toBe("D5_R8_AUTO_REPOINT_REJECTED");
    expect(throws(() => markPipingInterfaceFromChange(store, actor, {
      recalculate: true, handoffId: toGeotech.handoffId, handoffFingerprint: toGeotech.fingerprint, changeId: change.changeId, changeFingerprint: change.fingerprint, mark: "STALE",
    }))).toBe("D5_R8_RECALCULATION_NOT_IN_R8");
    expect(throws(() => markPipingInterfaceFromChange(store, actor, {
      redesign: true, handoffId: toGeotech.handoffId, handoffFingerprint: toGeotech.fingerprint, changeId: change.changeId, changeFingerprint: change.fingerprint, mark: "STALE",
    }))).toBe("D5_R8_REDESIGN_NOT_IN_R8");
    expect(throws(() => markPipingInterfaceFromChange(store, actor, {
      revalidateInterface: true, handoffId: toGeotech.handoffId, handoffFingerprint: toGeotech.fingerprint, changeId: change.changeId, changeFingerprint: change.fingerprint, mark: "STALE",
    }))).toBe("D5_R8_COUNTERPART_VALIDATION_NOT_IN_R8");
    expect(throws(() => repointPipingHandoff())).toBe("D5_R8_AUTO_REPOINT_REJECTED");
    expect(throws(() => mutatePipingInterface())).toBe("D5_R8_SILENT_MUTATION_REJECTED");
    expect(throws(() => reasonAcrossPipingDisciplines())).toBe("D5_R8_CROSS_DISCIPLINE_REASONING_NOT_IN_R8");
    expect(throws(() => validatePipingCounterpart())).toBe("D5_R8_COUNTERPART_VALIDATION_NOT_IN_R8");
    expect(throws(() => fabricatePipingCounterpart())).toBe("D5_R8_COUNTERPART_FABRICATION_REJECTED");
    expect(throws(() => recalculateFromPipingInterface())).toBe("D5_R8_RECALCULATION_NOT_IN_R8");
    expect(throws(() => redesignFromPipingInterface())).toBe("D5_R8_REDESIGN_NOT_IN_R8");
    expect(throws(() => startFuturePipingDisciplineRuntime())).toBe("D5_R8_FUTURE_DISCIPLINE_RUNTIME_REJECTED");
    const sourceText = readFileSync(join(here, "discipline-interfaces-handoffs.ts"), "utf8");
    expect(sourceText).toContain("D2_R8_HANDOFF_STATUSES");
    expect(sourceText).toContain("D5_D4_INTERFACE_SUBJECTS");
    expect(sourceText).not.toContain("createHash");
    expect(scanAnalysisFormulaBypass("discipline-interfaces-handoffs.ts", sourceText)).toEqual([]);
    const packageJson = JSON.parse(readFileSync(join(here, "../../package.json"), "utf8")) as { dependencies: Record<string, string> };
    expect(packageJson.dependencies.zod).toBeTruthy();
    expect(packageJson.dependencies["@rtb/piping-solver"]).toBeUndefined();
  });
});
