import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { D4_RUNTIME_COUNT as ARCHITECTURE_RUNTIME_COUNT } from "@rtb/types";
import { describe, expect, it } from "vitest";
import { D2_CONTEXT_AUTHORITY, createD2R1Store, recordCivilContext, recordCivilObjectIdentity, type D2R1Actor } from "../civil/identity-foundation";
import { D2_REOPENED, D2_TRACK_COMPLETE, D3_TRACK_COMPLETE, D4_0_STARTED } from "../geotechnical/geotechnical-bounded-closeout";
import { STRUCTURAL_CAPABILITY_MANIFEST } from "../structural-concrete/capability";
import { scanAnalysisFormulaBypass } from "../structural-systems/formula-scan";
import { createD1kR1Store, registerStructuralInterfaceIdentity, type D1kR1Actor, type D1kR1Catalog, type D1kR1CatalogSource, type D1kR1InterfaceInput, type D1kR1StructuralTarget } from "../structural-systems/interface-identity-foundation";
import { D1_STRUCTURAL_PACK_COMPLETE, D1N_REOPENED } from "../structural-systems/structural-pack-sequencing";
import { D3_CONTEXT_AUTHORITY, createD3R1Store, recordGeotechnicalContext, recordGeotechnicalObjectIdentity, type D3R1Actor } from "../geotechnical/identity-foundation";
import { D4_CONTEXT_AUTHORITY, D4_RUNTIME_COUNT as R1_RUNTIME_COUNT, createD4R1Store, recordMechanicalContext, recordMechanicalObjectIdentity, type D4R1Actor } from "./identity-foundation";
import { D4_RUNTIME_COUNT as R2_RUNTIME_COUNT, createD4R2Store, recordMechanicalEquipmentClassification } from "./equipment-system-context";
import { D4_RUNTIME_COUNT as R3_RUNTIME_COUNT, createD4R3Store, recordMechanicalDesignCondition } from "./design-condition-performance-context";
import { D4_RUNTIME_COUNT as R4_RUNTIME_COUNT, createD4R4Store, recordMechanicalVendorData, recordMechanicalVendorDocument } from "./vendor-data-evidence-context";
import { D4_RUNTIME_COUNT as R5_RUNTIME_COUNT, createD4R5Store, recordMechanicalTechnicalRequirement } from "./mechanical-technical-context";
import { D4_RUNTIME_COUNT as R6_RUNTIME_COUNT, createD4R6Store, recordMechanicalMaintainabilityContext } from "./maintainability-access-package-context";
import {
  D4_DISCIPLINE_INTERFACE_RUNTIME_COUNT as R7_INTERFACE_COUNT,
  D4_DISCIPLINE_INTERFACE_RUNTIME_READY as R7_INTERFACE_READY,
  D4_R8_STARTED,
  D4_RUNTIME_COUNT as R7_RUNTIME_COUNT,
  createD4R7Store,
  recordMechanicalChange,
} from "./requirements-assumptions-change";
import {
  ADMIN_CAN_PROMOTE_D4_HANDOFF_TO_ENGINEERING_VALIDATED,
  ADMIN_EQUALS_D4_MECHANICAL_ENGINEERING_AUTHORITY,
  AI_CAN_FABRICATE_D4_INTERFACE_COUNTERPART,
  AI_CAN_PROMOTE_D4_HANDOFF_TO_ENGINEERING_VALIDATED,
  AI_EQUALS_D4_MECHANICAL_ENGINEERING_AUTHORITY,
  D1_COUNTERPART_REFERENCE_EQUALS_D4_VALIDATION,
  D1_STRUCTURAL_PACK_COMPLETE as R8_D1,
  D1_TO_D4_COUNTERPART_REFERENCE_SUPPORTED,
  D1N_REOPENED as R8_D1N,
  D2_REOPENED as R8_D2_REOPENED,
  D2_TO_D4_COUNTERPART_REFERENCE_SUPPORTED,
  D2_TRACK_COMPLETE as R8_D2,
  D3_REOPENED,
  D3_TO_D4_COUNTERPART_REFERENCE_SUPPORTED,
  D3_TRACK_COMPLETE as R8_D3,
  D3_TRACK_COMPLETION_CLASSIFICATION,
  D4_ACCESS_PATH_SOLVER_RUNTIME_COUNT,
  D4_APPROVAL_RUNTIME_COUNT,
  D4_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT,
  D4_AUTOMATIC_REDESIGN_RUNTIME_COUNT,
  D4_CERTIFICATION_RUNTIME_COUNT,
  D4_CONFORMANCE_DETERMINATION_RUNTIME_COUNT,
  D4_CONTROL_INTERFACE_CONTEXT_EQUALS_CONTROL_DESIGN,
  D4_CREATES_AUTHORITATIVE_PROCESS_CONDITION,
  D4_CROSS_DISCIPLINE_CONFLICT_DETECTION_RUNTIME_COUNT,
  D4_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT,
  D4_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT,
  D4_CROSS_DISCIPLINE_RECOMMENDATION_RUNTIME_COUNT,
  D4_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT,
  D4_CURRENTNESS_DIGITAL_THREAD_RUNTIME_READY,
  D4_D1_HANDOFF_EQUALS_STRUCTURAL_VALIDATION,
  D4_D1_INTERFACE_HANDOFF_IMPLEMENTED,
  D4_D1_INTERFACE_TRANSFERS_STRUCTURAL_AUTHORITY,
  D4_D2_HANDOFF_EQUALS_CIVIL_VALIDATION,
  D4_D2_INTERFACE_HANDOFF_IMPLEMENTED,
  D4_D2_INTERFACE_TRANSFERS_CIVIL_AUTHORITY,
  D4_D3_HANDOFF_EQUALS_GEOTECHNICAL_VALIDATION,
  D4_D3_INTERFACE_HANDOFF_IMPLEMENTED,
  D4_D3_INTERFACE_TRANSFERS_GEOTECHNICAL_AUTHORITY,
  D4_D5_FUTURE_INTERFACE_CONTRACT_DEFINED,
  D4_D6_FUTURE_INTERFACE_CONTRACT_DEFINED,
  D4_D7_FUTURE_INTERFACE_CONTRACT_DEFINED,
  D4_D8_FUTURE_INTERFACE_CONTRACT_DEFINED,
  D4_D9_RUNTIME_INTEGRATION_COUNT,
  D4_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
  D4_D9_SOURCE_CONTRACT_RUNTIME_READY,
  D4_DISCIPLINE_INTERFACE_RUNTIME_COUNT,
  D4_DISCIPLINE_INTERFACE_RUNTIME_IMPLEMENTED,
  D4_DISCIPLINE_INTERFACE_RUNTIME_READY,
  D4_ELECTRICAL_INTERFACE_CONTEXT_EQUALS_ELECTRICAL_DESIGN,
  D4_EQUALS_D1_STRUCTURAL_AUTHORITY,
  D4_EQUALS_D2_CIVIL_AUTHORITY,
  D4_EQUALS_D3_GEOTECHNICAL_AUTHORITY,
  D4_EQUALS_D5_PIPING_AUTHORITY,
  D4_EQUALS_D6_PROCESS_AUTHORITY,
  D4_EQUALS_D7_ELECTRICAL_AUTHORITY,
  D4_EQUALS_D8_INSTRUMENTATION_CONTROL_AUTHORITY,
  D4_EQUIPMENT_SIZING_RUNTIME_COUNT,
  D4_EXPLICIT_COUNTERPART_REFERENCE_REQUIRED,
  D4_FATIGUE_ANALYSIS_RUNTIME_COUNT,
  D4_INFERRED_COUNTERPART_REFERENCE_ALLOWED,
  D4_INTERFACE_CHANGE_AUTO_RECALCULATES_ENGINEERING,
  D4_INTERFACE_CHANGE_AUTO_REDESIGNS_ENGINEERING,
  D4_INTERFACE_CHANGE_AUTO_VALIDATES_ENGINEERING,
  D4_INTERFACE_COUNTERPART_AUTO_REPOINTED,
  D4_INTERFACE_CURRENTNESS_EXPLICIT,
  D4_INTERFACE_HISTORICAL_REFERENCE_AUTO_REPOINTED,
  D4_INTERFACE_HISTORY_PRESERVED,
  D4_INTERFACE_LIMITATIONS_EXPLICIT,
  D4_INTERFACE_SOURCE_AUTO_REPOINTED,
  D4_INTERFACE_TRANSFERS_DISCIPLINE_AUTHORITY,
  D4_LAYOUT_OPTIMIZATION_RUNTIME_COUNT,
  D4_MECHANICAL_DESIGN_OPTIMIZATION_RUNTIME_COUNT,
  D4_MECHANICAL_LOAD_CALCULATION_RUNTIME_COUNT,
  D4_MECHANICAL_LOAD_CONTEXT_EQUALS_STRUCTURAL_DESIGN,
  D4_MISSING_COUNTERPART_AUTO_FABRICATED,
  D4_NOZZLE_CONTEXT_EQUALS_PIPING_DESIGN,
  D4_R1_R7_EXACT_SOURCE_REVISIONS_REUSED,
  D4_R7_CHANGE_INTERFACE_GOVERNANCE_INTEGRATED,
  D4_R8_AUTO_MUTATES_R3_DESIGN_CONDITION,
  D4_R8_AUTO_MUTATES_R3_PERFORMANCE_CONTEXT,
  D4_R8_AUTO_MUTATES_R5_TECHNICAL_REQUIREMENT,
  D4_R8_AUTO_MUTATES_R6_MAINTAINABILITY_CONTEXT,
  D4_R8_BLOCKER,
  D4_R8_CANONICAL_NEXT_PHASE,
  D4_R8_CANONICAL_NEXT_PHASE_SCOPE,
  D4_R8_DUPLICATE_GOVERNANCE_IMPLEMENTED,
  D4_R8_HISTORY_PRESERVED,
  D4_R8_MATURITY,
  D4_R8_NEXT_PHASE_TYPE,
  D4_R8_PROVENANCE_PRESERVED,
  D4_R8_PROVENANCE_REQUIRED,
  D4_R8_REPLAY_PROTECTION_IMPLEMENTED,
  D4_R8_SPOOFING_PROTECTION_IMPLEMENTED,
  D4_R8_STATUS,
  D4_R8_VALIDATES_D1_ENGINEERING,
  D4_R8_VALIDATES_D2_ENGINEERING,
  D4_R8_VALIDATES_D3_ENGINEERING,
  D4_R8_VALIDATES_FUTURE_D5_D8_ENGINEERING,
  D4_R9_STARTED,
  D4_REMOVAL_ROUTE_SOLVER_RUNTIME_COUNT,
  D4_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY,
  D4_REUSES_CANONICAL_CURRENTNESS,
  D4_REUSES_CANONICAL_FINGERPRINT,
  D4_REUSES_CANONICAL_INTERFACE_GOVERNANCE,
  D4_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_COUNT,
  D4_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_READY,
  D4_ROTATING_EQUIPMENT_CALCULATION_RUNTIME_COUNT,
  D4_RUNTIME_COUNT,
  D4_RUNTIME_STARTED,
  D4_SPATIAL_CLASH_DETECTION_RUNTIME_COUNT,
  D4_STATIC_EQUIPMENT_CALCULATION_RUNTIME_COUNT,
  D4_THERMAL_MECHANICAL_CALCULATION_RUNTIME_COUNT,
  D4_TRANSFERS_ELECTRICAL_AUTHORITY,
  D4_TRANSFERS_IAC_AUTHORITY,
  D4_TRANSFERS_PIPING_AUTHORITY,
  D4_VALIDATES_D1_STRUCTURAL_ENGINEERING,
  D4_VIBRATION_ANALYSIS_RUNTIME_COUNT,
  D5_RUNTIME_STARTED,
  D6_RUNTIME_STARTED,
  D7_RUNTIME_STARTED,
  D8_RUNTIME_STARTED,
  D9_RUNTIME_COUNT,
  D9_RUNTIME_STARTED,
  DATABASE_SCHEMA_CHANGED,
  EXACT_D1_COUNTERPART_REVISION_REQUIRED,
  EXACT_D2_COUNTERPART_REVISION_REQUIRED,
  EXACT_D3_COUNTERPART_REVISION_REQUIRED,
  EXACT_D4_INTERFACE_SOURCE_REVISION_REQUIRED,
  FLOATING_D4_INTERFACE_SOURCE_REFERENCE_ALLOWED,
  HANDOFF_CREATED_EQUALS_APPROVED,
  HANDOFF_CREATED_EQUALS_REVIEWED,
  HANDOFF_CREATED_EQUALS_VALIDATED,
  INCOMPLETE_D4_HANDOFF_EXPOSED_AS_COMPLETE,
  MISSING_COUNTERPART_EQUALS_INTERFACE_COMPLETE,
  NEW_DEPENDENCY_ADDED,
  PARALLEL_D4_CURRENTNESS_ENGINE_CREATED,
  PARALLEL_D4_INTERFACE_FRAMEWORK_CREATED,
  SECOND_D4_FINGERPRINT_ALGORITHM_CREATED,
  SILENT_D4_R8_MUTATION_ALLOWED,
  STALE_D4_HANDOFF_EXPOSED_AS_CURRENT,
  TENANT_WORKSPACE_PROJECT_D4_R8_SCOPE_ENFORCED,
  createD4R8Store,
  detectMechanicalInterfaceConflict,
  fabricateMechanicalCounterpart,
  mutateDesignConditionFromInterface,
  mutateMaintainabilityFromInterface,
  mutateMechanicalInterface,
  mutatePerformanceFromInterface,
  mutateTechnicalRequirementFromInterface,
  promoteHandoffToValidated,
  reasonAcrossMechanicalDisciplines,
  recalculateFromInterface,
  recordMechanicalInterfaceHandoff,
  redesignFromInterface,
  repointMechanicalHandoff,
  resolveMechanicalInterfaceConflict,
  startFutureDisciplineRuntime,
  validateMechanicalCounterpart,
} from "./discipline-interfaces-handoffs";

const actor: D4R1Actor = {
  actorId: "mechanical-recorder",
  tenantId: "tenant-a",
  workspaceId: "workspace-a",
  projectId: "project-a",
  authority: D4_CONTEXT_AUTHORITY,
};

const civilActor: D2R1Actor = {
  actorId: "civil-recorder",
  tenantId: "tenant-a",
  workspaceId: "workspace-a",
  projectId: "project-a",
  authority: D2_CONTEXT_AUTHORITY,
};

const geotechActor: D3R1Actor = {
  actorId: "geotechnical-recorder",
  tenantId: "tenant-a",
  workspaceId: "workspace-a",
  projectId: "project-a",
  authority: D3_CONTEXT_AUTHORITY,
};

const d1Actor: D1kR1Actor = {
  actorId: "engineer-1",
  tenantId: "tenant-a",
  workspaceId: "workspace-a",
  projectId: "project-a",
  authority: "HUMAN_ENGINEER",
};

const R9_SCOPE = "Implement canonical Mechanical review and validation governance using exact D4 R1-R8 revisions. Support review requests, reviewer authority, findings, review completion, validation state and reassessment linkage while preserving the distinction between review, validation, conformance, approval and certification. AI/admin must not become engineering reviewer authority. Review or validation must not mutate engineering records or validate D1-D3 or future D5-D8 counterpart engineering. Do not start R10-R12 or D5-D9 runtime.";

function target(overrides: Partial<D1kR1StructuralTarget> = {}): D1kR1StructuralTarget {
  return { kind: "FOUNDATION_INTERFACE", id: "foundation-target-1", structuralSystemId: "system-1", tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a", revision: "sys-4", ...overrides };
}

function source(overrides: Partial<D1kR1CatalogSource> = {}): D1kR1CatalogSource {
  return {
    sourceId: "src-mechanical-8",
    tenantId: "tenant-a",
    workspaceId: "workspace-a",
    projectId: "project-a",
    sourceClass: "MANUAL_GOVERNED_REFERENCE",
    sourceDiscipline: "mechanical",
    objectId: "pump-identity-1",
    documentId: "doc-mechanical-8",
    revision: "rev-8",
    evidenceId: "evidence-8",
    evidenceKind: "source_document",
    authority: "MECHANICAL_ENGINEER_OF_RECORD",
    provenanceRef: "provenance-mechanical-8",
    issuedAt: "2026-10-20T00:00:00.000Z",
    nativePackContractExposed: false,
    operationalExternalReference: false,
    ...overrides,
  };
}

function catalog(): D1kR1Catalog {
  return { targets: [target(), target({ kind: "STRUCTURAL_SYSTEM", id: "system-1" })], sources: [source()] };
}

function d1Input(): D1kR1InterfaceInput {
  return {
    interfaceId: "interface-mechanical-1",
    relation: "PROVIDES_INPUT_TO",
    sourceDiscipline: "mechanical",
    targetDiscipline: "structural",
    counterpartyDiscipline: "mechanical",
    structuralTargetKind: "FOUNDATION_INTERFACE",
    structuralTargetId: "foundation-target-1",
    sourceId: "src-mechanical-8",
    humanReviewRequired: true,
    description: "Mechanical equipment mass context supplied to the structural support interface",
  };
}

describe("EOS-D4-R8 discipline interfaces and handoffs", () => {
  it("records exact Mechanical handoffs without transferring authority or fabricating counterparts", () => {
    expect(D4_R8_STATUS).toBe("DISCIPLINE_INTERFACES_AND_HANDOFFS_IMPLEMENTED");
    expect(D4_R8_MATURITY).toBe(D4_R8_STATUS);
    expect(D4_RUNTIME_STARTED).toBe(true);
    expect(D4_RUNTIME_COUNT).toBe(8);
    expect(R7_RUNTIME_COUNT).toBe(7);
    expect(R6_RUNTIME_COUNT).toBe(6);
    expect(R5_RUNTIME_COUNT).toBe(5);
    expect(R4_RUNTIME_COUNT).toBe(4);
    expect(R3_RUNTIME_COUNT).toBe(3);
    expect(R2_RUNTIME_COUNT).toBe(2);
    expect(R1_RUNTIME_COUNT).toBe(1);
    expect(ARCHITECTURE_RUNTIME_COUNT).toBe(0);
    expect(D4_0_STARTED).toBe(false);
    expect(D4_R8_STARTED).toBe(false);
    expect(R7_INTERFACE_READY).toBe(false);
    expect(R7_INTERFACE_COUNT).toBe(0);
    expect(D4_R9_STARTED).toBe(false);
    expect(D4_DISCIPLINE_INTERFACE_RUNTIME_IMPLEMENTED).toBe(true);
    expect(D4_DISCIPLINE_INTERFACE_RUNTIME_COUNT).toBe(1);
    expect(D4_DISCIPLINE_INTERFACE_RUNTIME_READY).toBe(true);
    expect(D4_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY).toBe(true);
    expect(D4_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_READY).toBe(false);
    expect(D4_CURRENTNESS_DIGITAL_THREAD_RUNTIME_READY).toBe(false);
    expect(D4_D9_SOURCE_CONTRACT_RUNTIME_READY).toBe(false);
    expect(D4_REUSES_CANONICAL_INTERFACE_GOVERNANCE).toBe(true);
    expect(PARALLEL_D4_INTERFACE_FRAMEWORK_CREATED).toBe(false);
    expect(D4_R1_R7_EXACT_SOURCE_REVISIONS_REUSED).toBe(true);
    expect(EXACT_D4_INTERFACE_SOURCE_REVISION_REQUIRED).toBe(true);
    expect(FLOATING_D4_INTERFACE_SOURCE_REFERENCE_ALLOWED).toBe(false);
    expect(D4_INTERFACE_SOURCE_AUTO_REPOINTED).toBe(false);
    expect(D4_D1_INTERFACE_HANDOFF_IMPLEMENTED).toBe(true);
    expect(D1_TO_D4_COUNTERPART_REFERENCE_SUPPORTED).toBe(true);
    expect(EXACT_D1_COUNTERPART_REVISION_REQUIRED).toBe(true);
    expect(D4_MECHANICAL_LOAD_CONTEXT_EQUALS_STRUCTURAL_DESIGN).toBe(false);
    expect(D4_D1_INTERFACE_TRANSFERS_STRUCTURAL_AUTHORITY).toBe(false);
    expect(D4_D1_HANDOFF_EQUALS_STRUCTURAL_VALIDATION).toBe(false);
    expect(D4_VALIDATES_D1_STRUCTURAL_ENGINEERING).toBe(false);
    expect(D1_COUNTERPART_REFERENCE_EQUALS_D4_VALIDATION).toBe(false);
    expect(D4_D2_INTERFACE_HANDOFF_IMPLEMENTED).toBe(true);
    expect(D2_TO_D4_COUNTERPART_REFERENCE_SUPPORTED).toBe(true);
    expect(EXACT_D2_COUNTERPART_REVISION_REQUIRED).toBe(true);
    expect(D4_D2_INTERFACE_TRANSFERS_CIVIL_AUTHORITY).toBe(false);
    expect(D4_D2_HANDOFF_EQUALS_CIVIL_VALIDATION).toBe(false);
    expect(D4_D3_INTERFACE_HANDOFF_IMPLEMENTED).toBe(true);
    expect(D3_TO_D4_COUNTERPART_REFERENCE_SUPPORTED).toBe(true);
    expect(EXACT_D3_COUNTERPART_REVISION_REQUIRED).toBe(true);
    expect(D4_D3_INTERFACE_TRANSFERS_GEOTECHNICAL_AUTHORITY).toBe(false);
    expect(D4_D3_HANDOFF_EQUALS_GEOTECHNICAL_VALIDATION).toBe(false);
    expect(D4_D5_FUTURE_INTERFACE_CONTRACT_DEFINED).toBe(true);
    expect(D4_D6_FUTURE_INTERFACE_CONTRACT_DEFINED).toBe(true);
    expect(D4_D7_FUTURE_INTERFACE_CONTRACT_DEFINED).toBe(true);
    expect(D4_D8_FUTURE_INTERFACE_CONTRACT_DEFINED).toBe(true);
    expect(D4_NOZZLE_CONTEXT_EQUALS_PIPING_DESIGN).toBe(false);
    expect(D4_TRANSFERS_PIPING_AUTHORITY).toBe(false);
    expect(D4_CREATES_AUTHORITATIVE_PROCESS_CONDITION).toBe(false);
    expect(D4_ELECTRICAL_INTERFACE_CONTEXT_EQUALS_ELECTRICAL_DESIGN).toBe(false);
    expect(D4_TRANSFERS_ELECTRICAL_AUTHORITY).toBe(false);
    expect(D4_CONTROL_INTERFACE_CONTEXT_EQUALS_CONTROL_DESIGN).toBe(false);
    expect(D4_TRANSFERS_IAC_AUTHORITY).toBe(false);
    expect(D4_EXPLICIT_COUNTERPART_REFERENCE_REQUIRED).toBe(true);
    expect(D4_INFERRED_COUNTERPART_REFERENCE_ALLOWED).toBe(false);
    expect(D4_MISSING_COUNTERPART_AUTO_FABRICATED).toBe(false);
    expect(MISSING_COUNTERPART_EQUALS_INTERFACE_COMPLETE).toBe(false);
    expect(D4_INTERFACE_CURRENTNESS_EXPLICIT).toBe(true);
    expect(D4_INTERFACE_LIMITATIONS_EXPLICIT).toBe(true);
    expect(STALE_D4_HANDOFF_EXPOSED_AS_CURRENT).toBe(false);
    expect(INCOMPLETE_D4_HANDOFF_EXPOSED_AS_COMPLETE).toBe(false);
    expect(D4_INTERFACE_HISTORICAL_REFERENCE_AUTO_REPOINTED).toBe(false);
    expect(D4_INTERFACE_COUNTERPART_AUTO_REPOINTED).toBe(false);
    expect(D4_INTERFACE_HISTORY_PRESERVED).toBe(true);
    expect(D4_R7_CHANGE_INTERFACE_GOVERNANCE_INTEGRATED).toBe(true);
    expect(D4_INTERFACE_CHANGE_AUTO_RECALCULATES_ENGINEERING).toBe(false);
    expect(D4_INTERFACE_CHANGE_AUTO_REDESIGNS_ENGINEERING).toBe(false);
    expect(D4_INTERFACE_CHANGE_AUTO_VALIDATES_ENGINEERING).toBe(false);
    expect(D4_R8_AUTO_MUTATES_R3_DESIGN_CONDITION).toBe(false);
    expect(D4_R8_AUTO_MUTATES_R3_PERFORMANCE_CONTEXT).toBe(false);
    expect(D4_R8_AUTO_MUTATES_R5_TECHNICAL_REQUIREMENT).toBe(false);
    expect(D4_R8_AUTO_MUTATES_R6_MAINTAINABILITY_CONTEXT).toBe(false);
    expect(D4_R8_VALIDATES_D1_ENGINEERING).toBe(false);
    expect(D4_R8_VALIDATES_D2_ENGINEERING).toBe(false);
    expect(D4_R8_VALIDATES_D3_ENGINEERING).toBe(false);
    expect(D4_R8_VALIDATES_FUTURE_D5_D8_ENGINEERING).toBe(false);
    expect(D4_INTERFACE_TRANSFERS_DISCIPLINE_AUTHORITY).toBe(false);
    expect(AI_EQUALS_D4_MECHANICAL_ENGINEERING_AUTHORITY).toBe(false);
    expect(ADMIN_EQUALS_D4_MECHANICAL_ENGINEERING_AUTHORITY).toBe(false);
    expect(AI_CAN_FABRICATE_D4_INTERFACE_COUNTERPART).toBe(false);
    expect(AI_CAN_PROMOTE_D4_HANDOFF_TO_ENGINEERING_VALIDATED).toBe(false);
    expect(ADMIN_CAN_PROMOTE_D4_HANDOFF_TO_ENGINEERING_VALIDATED).toBe(false);
    expect(D4_EQUALS_D1_STRUCTURAL_AUTHORITY).toBe(false);
    expect(D4_EQUALS_D2_CIVIL_AUTHORITY).toBe(false);
    expect(D4_EQUALS_D3_GEOTECHNICAL_AUTHORITY).toBe(false);
    expect(D4_EQUALS_D5_PIPING_AUTHORITY).toBe(false);
    expect(D4_EQUALS_D6_PROCESS_AUTHORITY).toBe(false);
    expect(D4_EQUALS_D7_ELECTRICAL_AUTHORITY).toBe(false);
    expect(D4_EQUALS_D8_INSTRUMENTATION_CONTROL_AUTHORITY).toBe(false);
    expect(HANDOFF_CREATED_EQUALS_REVIEWED).toBe(false);
    expect(HANDOFF_CREATED_EQUALS_VALIDATED).toBe(false);
    expect(HANDOFF_CREATED_EQUALS_APPROVED).toBe(false);
    expect([
      D4_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_COUNT,
      D4_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT,
      D4_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
      D4_D9_RUNTIME_INTEGRATION_COUNT,
      D4_EQUIPMENT_SIZING_RUNTIME_COUNT,
      D4_ROTATING_EQUIPMENT_CALCULATION_RUNTIME_COUNT,
      D4_STATIC_EQUIPMENT_CALCULATION_RUNTIME_COUNT,
      D4_THERMAL_MECHANICAL_CALCULATION_RUNTIME_COUNT,
      D4_MECHANICAL_LOAD_CALCULATION_RUNTIME_COUNT,
      D4_VIBRATION_ANALYSIS_RUNTIME_COUNT,
      D4_FATIGUE_ANALYSIS_RUNTIME_COUNT,
      D4_MECHANICAL_DESIGN_OPTIMIZATION_RUNTIME_COUNT,
      D4_AUTOMATIC_REDESIGN_RUNTIME_COUNT,
      D4_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT,
      D4_CONFORMANCE_DETERMINATION_RUNTIME_COUNT,
      D4_APPROVAL_RUNTIME_COUNT,
      D4_CERTIFICATION_RUNTIME_COUNT,
      D4_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT,
      D4_CROSS_DISCIPLINE_CONFLICT_DETECTION_RUNTIME_COUNT,
      D4_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT,
      D4_CROSS_DISCIPLINE_RECOMMENDATION_RUNTIME_COUNT,
      D4_SPATIAL_CLASH_DETECTION_RUNTIME_COUNT,
      D4_ACCESS_PATH_SOLVER_RUNTIME_COUNT,
      D4_REMOVAL_ROUTE_SOLVER_RUNTIME_COUNT,
      D4_LAYOUT_OPTIMIZATION_RUNTIME_COUNT,
      D9_RUNTIME_COUNT,
    ]).toEqual(Array(26).fill(0));
    expect(D5_RUNTIME_STARTED).toBe(false);
    expect(D6_RUNTIME_STARTED).toBe(false);
    expect(D7_RUNTIME_STARTED).toBe(false);
    expect(D8_RUNTIME_STARTED).toBe(false);
    expect(D9_RUNTIME_STARTED).toBe(false);
    expect(D1_STRUCTURAL_PACK_COMPLETE).toBe(false);
    expect(D1N_REOPENED).toBe(false);
    expect(R8_D1).toBe(false);
    expect(R8_D1N).toBe(false);
    expect(D2_TRACK_COMPLETE).toBe(true);
    expect(R8_D2).toBe(true);
    expect(D2_REOPENED).toBe(false);
    expect(R8_D2_REOPENED).toBe(false);
    expect(D3_TRACK_COMPLETE).toBe(true);
    expect(R8_D3).toBe(true);
    expect(D3_TRACK_COMPLETION_CLASSIFICATION).toBe("COMPLETE_BOUNDED_WITH_LIMITATIONS");
    expect(D3_REOPENED).toBe(false);
    expect(DATABASE_SCHEMA_CHANGED).toBe(false);
    expect(NEW_DEPENDENCY_ADDED).toBe(false);
    expect(D4_REUSES_CANONICAL_CURRENTNESS).toBe(true);
    expect(PARALLEL_D4_CURRENTNESS_ENGINE_CREATED).toBe(false);
    expect(D4_REUSES_CANONICAL_FINGERPRINT).toBe(true);
    expect(SECOND_D4_FINGERPRINT_ALGORITHM_CREATED).toBe(false);
    expect(D4_R8_PROVENANCE_REQUIRED).toBe(true);
    expect(D4_R8_PROVENANCE_PRESERVED).toBe(true);
    expect(SILENT_D4_R8_MUTATION_ALLOWED).toBe(false);
    expect(D4_R8_HISTORY_PRESERVED).toBe(true);
    expect(TENANT_WORKSPACE_PROJECT_D4_R8_SCOPE_ENFORCED).toBe(true);
    expect(D4_R8_DUPLICATE_GOVERNANCE_IMPLEMENTED).toBe(true);
    expect(D4_R8_REPLAY_PROTECTION_IMPLEMENTED).toBe(true);
    expect(D4_R8_SPOOFING_PROTECTION_IMPLEMENTED).toBe(true);
    expect(D4_R8_CANONICAL_NEXT_PHASE).toBe("EOS-D4-R9-REVIEW-AND-VALIDATION-GOVERNANCE");
    expect(D4_R8_NEXT_PHASE_TYPE).toBe("REVIEW_AND_VALIDATION_GOVERNANCE");
    expect(D4_R8_CANONICAL_NEXT_PHASE_SCOPE).toBe(R9_SCOPE);
    expect(D4_R8_BLOCKER).toBe("NONE");

    const r1 = createD4R1Store();
    const context = recordMechanicalContext(r1, actor, { contextId: "mechanical-context-1", citedLifecycleStage: "FEED", provenanceRef: "prov-context" });
    const equipment = recordMechanicalObjectIdentity(r1, actor, { objectId: "pump-identity-1", contextId: context.contextId, objectType: "ROTATING_EQUIPMENT", citedLifecycleStage: "FEED", provenanceRef: "prov-pump" });
    const r2 = createD4R2Store(r1);
    const classification = recordMechanicalEquipmentClassification(r2, actor, { classificationId: "class-1", contextId: context.contextId, objectId: equipment.objectId, objectRevisionFingerprint: equipment.fingerprint, classification: "PUMP", citedLifecycleStage: "FEED", provenanceRef: "prov-class", citedCurrentness: "CURRENT" });
    const r3 = createD4R3Store(r2);
    const design = recordMechanicalDesignCondition(r3, actor, {
      tenantId: actor.tenantId, workspaceId: actor.workspaceId, projectId: actor.projectId, contextId: context.contextId, objectId: equipment.objectId, objectRevisionFingerprint: equipment.fingerprint,
      r2SubjectKind: "CLASSIFICATION", r2SubjectId: classification.classificationId, r2RevisionFingerprint: classification.fingerprint, citedCurrentness: "CURRENT",
      applicabilityObjectId: equipment.objectId, applicabilityCase: "NORMAL_OPERATION", limitations: "This pump only", provenanceRef: "prov-design",
      recordId: "design-pressure", subjectKind: "DESIGN_PRESSURE", suppliedValue: "10", unit: "bar", sourceBasis: "PROJECT_SPECIFICATION", sourceRef: "spec-100", sourceRevision: "A", adoptionRationale: "Adopted casing pressure",
    });
    const r4 = createD4R4Store(r3);
    const upstream = {
      tenantId: actor.tenantId, workspaceId: actor.workspaceId, projectId: actor.projectId, contextId: context.contextId, objectId: equipment.objectId, objectRevisionFingerprint: equipment.fingerprint,
      r2SubjectKind: "CLASSIFICATION" as const, r2SubjectId: classification.classificationId, r2RevisionFingerprint: classification.fingerprint, r3RecordId: design.recordId, r3RevisionFingerprint: design.fingerprint,
      citedCurrentness: "CURRENT" as const, vendorIdentity: "Acme Pumps", sourceOrganization: "Acme Pumps Ltd", limitations: "Vendor claim only", provenanceRef: "prov-vendor",
    };
    const document = recordMechanicalVendorDocument(r4, actor, { ...upstream, recordId: "vendor-doc", documentRef: "MM-100", documentRevision: "C", evidenceClass: "MANUAL", sourceStatus: "FOR_INFORMATION" });
    const vendorData = recordMechanicalVendorData(r4, actor, { ...upstream, recordId: "vendor-mass", documentRef: "MM-100", documentRevision: "C", evidenceClass: "VENDOR_DATASHEET", dataKind: "DRY_MASS", suppliedValue: "500", unit: "kg", parentDocumentId: document.recordId, parentDocumentFingerprint: document.fingerprint });
    const r5 = createD4R5Store(r4);
    const requirement = recordMechanicalTechnicalRequirement(r5, actor, {
      ...upstream, r4RecordId: vendorData.recordId, r4RevisionFingerprint: vendorData.fingerprint, applicabilityObjectId: equipment.objectId, applicabilityCase: "NORMAL_OPERATION",
      limitations: "This pump identity only", provenanceRef: "prov-requirement", recordId: "maint-requirement", subjectKind: "MECHANICAL_EQUIPMENT_REQUIREMENT",
      requirementStatement: "Provide a governed maintenance envelope for this pump", sourceBasis: "PROJECT_SPECIFICATION", sourceRef: "spec-100", sourceRevision: "A", adoptionRationale: "Adopted maintenance envelope requirement",
    });
    const r6 = createD4R6Store(r5);
    const envelope = recordMechanicalMaintainabilityContext(r6, actor, {
      tenantId: actor.tenantId, workspaceId: actor.workspaceId, projectId: actor.projectId, contextId: context.contextId, objectId: equipment.objectId, objectRevisionFingerprint: equipment.fingerprint,
      r2SubjectKind: "CLASSIFICATION", r2SubjectId: classification.classificationId, r2RevisionFingerprint: classification.fingerprint,
      r3RecordId: design.recordId, r3RevisionFingerprint: design.fingerprint, r4RecordId: vendorData.recordId, r4RevisionFingerprint: vendorData.fingerprint,
      r5RecordId: requirement.recordId, r5RevisionFingerprint: requirement.fingerprint, citedCurrentness: "CURRENT", componentRef: "PUMP_CASING", orientationContext: "HORIZONTAL",
      applicabilityObjectId: equipment.objectId, applicabilityCase: "PLANNED_MAINTENANCE", limitations: "This pump and this maintenance case only", provenanceRef: "prov-maintainability",
      recordId: "maint-envelope", subjectKind: "MAINTENANCE_ENVELOPE", statement: "Maintain a service envelope around the non-drive end",
      sourceBasis: "R5_MECHANICAL_TECHNICAL_REQUIREMENT", sourceRef: requirement.recordId, sourceRevision: "A", adoptionRationale: "Adopted from the project maintenance requirement",
    });
    const r7 = createD4R7Store(r6);
    const subject = {
      tenantId: actor.tenantId, workspaceId: actor.workspaceId, projectId: actor.projectId, contextId: context.contextId, objectId: equipment.objectId, objectRevisionFingerprint: equipment.fingerprint,
      r2SubjectKind: "CLASSIFICATION" as const, r2SubjectId: classification.classificationId, r2RevisionFingerprint: classification.fingerprint,
      r3RecordId: design.recordId, r3RevisionFingerprint: design.fingerprint, r4RecordId: vendorData.recordId, r4RevisionFingerprint: vendorData.fingerprint,
      r5RecordId: requirement.recordId, r5RevisionFingerprint: requirement.fingerprint, r6RecordId: envelope.recordId, r6RevisionFingerprint: envelope.fingerprint,
      citedLifecycleStage: "FEED", applicability: "PLANNED_MAINTENANCE", limitations: "This pump only", provenanceRef: "prov-r7",
    };
    const change = recordMechanicalChange(r7, actor, {
      ...subject, citedCurrentness: "CURRENT", changeContextId: "change-reassess", changeCategory: "REASSESSMENT_REQUIRED", originRef: "spec-100-rev-b", reason: "Support context requires reassessment",
      dependencies: [{ kind: "OBJECT_REFERENCE", targetKind: "R6_MAINTAINABILITY", targetId: envelope.recordId, targetFingerprint: envelope.fingerprint }],
    });
    const d1 = createD1kR1Store(catalog(), () => "2026-10-24T00:00:00.000Z");
    const structural = registerStructuralInterfaceIdentity(d1, d1Actor, d1Input());
    const d2 = createD2R1Store();
    const civilContext = recordCivilContext(d2, civilActor, { contextId: "civil-context-1", citedLifecycleStage: "CONCEPT", provenanceRef: "prov-civil-context" });
    const civilSite = recordCivilObjectIdentity(d2, civilActor, { objectId: "civil-site-1", contextId: civilContext.contextId, objectType: "CIVIL_SITE", citedLifecycleStage: "CONCEPT", provenanceRef: "prov-civil-site" });
    const d3 = createD3R1Store();
    const geotechContext = recordGeotechnicalContext(d3, geotechActor, { contextId: "geotech-context-1", citedLifecycleStage: "CONCEPT", provenanceRef: "prov-geotech-context" });
    const geotechSite = recordGeotechnicalObjectIdentity(d3, geotechActor, { objectId: "geotech-site-1", contextId: geotechContext.contextId, objectType: "GEOTECHNICAL_SITE_CONTEXT", citedLifecycleStage: "CONCEPT", provenanceRef: "prov-geotech-site" });
    const store = createD4R8Store(r7, d1, d2, d3);
    const shared = {
      ...subject,
      citedCurrentness: "CURRENT" as const,
      provenanceRef: "prov-handoff",
      limitations: "Handoff records the Mechanical source and does not design the counterpart",
    };
    const toStructural = recordMechanicalInterfaceHandoff(store, actor, {
      ...shared, handoffId: "handoff-d1", counterpartDiscipline: "structural", direction: "D4_TO_COUNTERPART", interfaceTopic: "EQUIPMENT_MASS_OR_LOAD_CONTEXT",
      counterpartInterfaceId: structural.interfaceId, counterpartSourceRevision: structural.sourceRevision, counterpartFingerprint: structural.fingerprint, handoffStatus: "COMPLETE",
    });
    expect(toStructural.interfaceComplete).toBe(true);
    expect(toStructural.engineeringValidated).toBe(false);
    expect(toStructural.authorityTransferred).toBe(false);
    expect(toStructural.reviewed).toBe(false);
    expect(toStructural.objectRevisionFingerprint).toBe(equipment.fingerprint);
    expect(toStructural.r6RevisionFingerprint).toBe(envelope.fingerprint);
    expect(toStructural.counterpart?.fingerprint).toBe(structural.fingerprint);
    expect(toStructural.sourceAuthority).toBe(D4_CONTEXT_AUTHORITY);
    const fromStructural = recordMechanicalInterfaceHandoff(store, actor, {
      ...shared, handoffId: "handoff-d1-in", counterpartDiscipline: "structural", direction: "COUNTERPART_TO_D4", interfaceTopic: "STRUCTURAL_SUPPORT_GEOMETRY",
      counterpartInterfaceId: structural.interfaceId, counterpartSourceRevision: structural.sourceRevision, handoffStatus: "INCOMPLETE",
    });
    expect(fromStructural.interfaceComplete).toBe(false);
    expect(fromStructural.engineeringValidated).toBe(false);
    const toCivil = recordMechanicalInterfaceHandoff(store, actor, {
      ...shared, handoffId: "handoff-d2", counterpartDiscipline: "civil", direction: "D4_TO_COUNTERPART", interfaceTopic: "FOOTPRINT",
      counterpartInterfaceId: civilSite.objectId, counterpartSourceRevision: civilSite.provenanceRef, counterpartFingerprint: civilSite.fingerprint, handoffStatus: "COMPLETE",
    });
    expect(toCivil.authorityTransferred).toBe(false);
    expect(toCivil.counterpart?.discipline).toBe("civil");
    const toGeotech = recordMechanicalInterfaceHandoff(store, actor, {
      ...shared, handoffId: "handoff-d3", counterpartDiscipline: "geotechnical", direction: "D4_TO_COUNTERPART", interfaceTopic: "SETTLEMENT_CONTEXT",
      counterpartInterfaceId: geotechSite.objectId, counterpartSourceRevision: geotechSite.provenanceRef, handoffStatus: "COMPLETE",
    });
    expect(toGeotech.engineeringValidated).toBe(false);
    expect(toGeotech.counterpart?.sourceRevision).toBe(geotechSite.provenanceRef);
    const missing = recordMechanicalInterfaceHandoff(store, actor, {
      ...shared, handoffId: "handoff-missing", counterpartDiscipline: "structural", direction: "D4_TO_COUNTERPART", interfaceTopic: "ANCHOR_OR_INTERFACE_REQUIREMENTS",
      counterpartInterfaceId: null, counterpartSourceRevision: null, handoffStatus: "AWAITING_COUNTERPART",
    });
    expect(missing.counterpart).toBeNull();
    expect(missing.interfaceComplete).toBe(false);
    const futureTopics = [
      ["piping", "NOZZLE_OR_INTERFACE_POINTS"],
      ["process", "PROCESS_DUTY"],
      ["electrical", "MOTOR_REQUIREMENTS"],
      ["instrumentation_control", "TRIP_OR_ALARM_INTERFACES"],
    ] as const;
    for (const [discipline, topic] of futureTopics) {
      const placeholder = recordMechanicalInterfaceHandoff(store, actor, {
        ...shared, handoffId: `handoff-${discipline}`, counterpartDiscipline: discipline, direction: "D4_TO_COUNTERPART", interfaceTopic: topic,
        counterpartInterfaceId: null, counterpartSourceRevision: null, handoffStatus: "NOT_YET_AVAILABLE",
      });
      expect(placeholder.counterpart).toBeNull();
      expect(placeholder.interfaceComplete).toBe(false);
      expect(placeholder.engineeringValidated).toBe(false);
    }
    const stale = recordMechanicalInterfaceHandoff(store, actor, {
      ...shared, handoffId: "handoff-stale", counterpartDiscipline: "structural", direction: "D4_TO_COUNTERPART", interfaceTopic: "CENTER_OF_GRAVITY_CONTEXT",
      counterpartInterfaceId: null, counterpartSourceRevision: null, handoffStatus: "STALE", citedCurrentness: "STALE",
    });
    expect(stale.currentness).toBe("STALE");
    expect(stale.interfaceComplete).toBe(false);
    const reassessed = recordMechanicalInterfaceHandoff(store, actor, {
      ...shared, handoffId: "handoff-reassess", counterpartDiscipline: "structural", direction: "D4_TO_COUNTERPART", interfaceTopic: "SUPPORT_OR_BASEPLATE_CONTEXT",
      counterpartInterfaceId: structural.interfaceId, counterpartSourceRevision: structural.sourceRevision, handoffStatus: "REASSESSMENT_REQUIRED", citedCurrentness: "REASSESSMENT_REQUIRED",
      changeContextId: change.changeContextId, changeFingerprint: change.fingerprint,
    });
    expect(reassessed.engineeringValidated).toBe(false);
    expect(reassessed.recalculated).toBe(false);
    expect(reassessed.redesigned).toBe(false);
    expect(change.recalculated).toBe(false);
    expect(design.suppliedValue).toBe("10");
    expect(design.fingerprint).toBe(subject.r3RevisionFingerprint);
    expect(requirement.requirementStatement).toBe("Provide a governed maintenance envelope for this pump");
    expect(envelope.statement).toBe("Maintain a service envelope around the non-drive end");
    expect(structural.fingerprint).toBe(toStructural.counterpart?.fingerprint);
    expect(civilSite.fingerprint).toBe(toCivil.counterpart?.fingerprint);

    const preserved = toStructural.fingerprint;
    const successor = recordMechanicalInterfaceHandoff(store, actor, {
      ...shared, handoffId: "handoff-d1-b", predecessorHandoffId: toStructural.handoffId, counterpartDiscipline: "structural", direction: "D4_TO_COUNTERPART", interfaceTopic: "EQUIPMENT_MASS_OR_LOAD_CONTEXT",
      counterpartInterfaceId: structural.interfaceId, counterpartSourceRevision: structural.sourceRevision, handoffStatus: "COMPLETE", limitations: "Successor still cites the original source revision", provenanceRef: "prov-handoff-b",
    });
    expect(successor.predecessorFingerprint).toBe(preserved);
    expect(toStructural.fingerprint).toBe(preserved);
    expect(toStructural.objectRevisionFingerprint).toBe(equipment.fingerprint);
    expect(toStructural.recordStatus).toBe("SUPERSEDED");
    expect(toStructural.deleted).toBe(false);
    expect(toStructural.invalidated).toBe(false);
    expect(store.handoffs.some((row) => row.handoffId === toStructural.handoffId)).toBe(true);
    expect(store.history.some((row) => row.handoffId === toStructural.handoffId && row.action === "SUPERSEDED" && row.fingerprint === preserved)).toBe(true);
    const replay = recordMechanicalInterfaceHandoff(store, actor, {
      ...shared, handoffId: "handoff-d1", counterpartDiscipline: "structural", direction: "D4_TO_COUNTERPART", interfaceTopic: "EQUIPMENT_MASS_OR_LOAD_CONTEXT",
      counterpartInterfaceId: structural.interfaceId, counterpartSourceRevision: structural.sourceRevision, counterpartFingerprint: structural.fingerprint, handoffStatus: "COMPLETE",
    });
    expect(replay.fingerprint).toBe(preserved);

    expect(() => recordMechanicalInterfaceHandoff(store, actor, { ...shared, handoffId: "handoff-float", counterpartDiscipline: "structural", direction: "D4_TO_COUNTERPART", interfaceTopic: "DYNAMIC_LOAD_CONTEXT", counterpartInterfaceId: structural.interfaceId, counterpartSourceRevision: structural.sourceRevision, handoffStatus: "COMPLETE", objectRevisionFingerprint: "latest" })).toThrow(/R1_REVISION_REQUIRED/);
    expect(() => recordMechanicalInterfaceHandoff(store, actor, { ...shared, handoffId: "handoff-wrong-r6", r6RevisionFingerprint: "wrong", counterpartDiscipline: "civil", direction: "D4_TO_COUNTERPART", interfaceTopic: "ACCESS", counterpartInterfaceId: civilSite.objectId, counterpartSourceRevision: civilSite.provenanceRef, handoffStatus: "COMPLETE" })).toThrow(/R6_REVISION_MISMATCH/);
    expect(() => recordMechanicalInterfaceHandoff(store, actor, { ...shared, handoffId: "handoff-complete-missing", counterpartDiscipline: "structural", direction: "D4_TO_COUNTERPART", interfaceTopic: "DYNAMIC_LOAD_CONTEXT", counterpartInterfaceId: null, counterpartSourceRevision: null, handoffStatus: "COMPLETE" })).toThrow(/INCOMPLETE_COUNTERPART_NOT_COMPLETE/);
    expect(() => recordMechanicalInterfaceHandoff(store, actor, { ...shared, handoffId: "handoff-fabricated", counterpartDiscipline: "piping", direction: "D4_TO_COUNTERPART", interfaceTopic: "CONNECTION_GEOMETRY", counterpartInterfaceId: "invented-piping", counterpartSourceRevision: "rev-invented", handoffStatus: "AWAITING_COUNTERPART" })).toThrow(/COUNTERPART_FABRICATION_REJECTED/);
    expect(() => recordMechanicalInterfaceHandoff(store, actor, { ...shared, handoffId: "handoff-infer", counterpartDiscipline: "civil", direction: "D4_TO_COUNTERPART", interfaceTopic: "SITE_ARRANGEMENT", counterpartInterfaceId: civilSite.objectId, counterpartSourceRevision: civilSite.provenanceRef, handoffStatus: "COMPLETE", inference: "shared_package" })).toThrow(/INFERRED_COUNTERPART_REJECTED/);
    expect(() => recordMechanicalInterfaceHandoff(store, actor, { ...shared, handoffId: "handoff-stale-current", counterpartDiscipline: "civil", direction: "D4_TO_COUNTERPART", interfaceTopic: "DRAINAGE_OR_SITE_CONSTRAINTS", counterpartInterfaceId: null, counterpartSourceRevision: null, handoffStatus: "STALE" })).toThrow(/CURRENTNESS_STATUS_MISMATCH/);
    expect(() => recordMechanicalInterfaceHandoff(store, actor, { ...shared, handoffId: "handoff-wrong-rev", counterpartDiscipline: "structural", direction: "D4_TO_COUNTERPART", interfaceTopic: "DYNAMIC_LOAD_CONTEXT", counterpartInterfaceId: structural.interfaceId, counterpartSourceRevision: "rev-wrong", handoffStatus: "COMPLETE" })).toThrow(/COUNTERPART_REVISION_MISMATCH/);
    expect(() => recordMechanicalInterfaceHandoff(store, actor, { ...shared, handoffId: "handoff-mutate", counterpartDiscipline: "structural", direction: "D4_TO_COUNTERPART", interfaceTopic: "DYNAMIC_LOAD_CONTEXT", counterpartInterfaceId: structural.interfaceId, counterpartSourceRevision: structural.sourceRevision, handoffStatus: "COMPLETE", mutateR3: true })).toThrow(/R3_MUTATION_REJECTED/);
    expect(() => recordMechanicalInterfaceHandoff(store, actor, { ...shared, handoffId: "handoff-r5", counterpartDiscipline: "civil", direction: "D4_TO_COUNTERPART", interfaceTopic: "EQUIPMENT_PAD_OR_SITE_REQUIREMENTS", counterpartInterfaceId: civilSite.objectId, counterpartSourceRevision: civilSite.provenanceRef, handoffStatus: "COMPLETE", mutateR5: true })).toThrow(/R5_MUTATION_REJECTED/);
    expect(() => recordMechanicalInterfaceHandoff(store, actor, { ...shared, handoffId: "handoff-r6", counterpartDiscipline: "geotechnical", direction: "D4_TO_COUNTERPART", interfaceTopic: "GROUND_CONDITION_LIMITATIONS", counterpartInterfaceId: geotechSite.objectId, counterpartSourceRevision: geotechSite.provenanceRef, handoffStatus: "COMPLETE", mutateR6: true })).toThrow(/R6_MUTATION_REJECTED/);
    expect(() => recordMechanicalInterfaceHandoff(store, actor, { ...shared, handoffId: "handoff-validate", counterpartDiscipline: "structural", direction: "COUNTERPART_TO_D4", interfaceTopic: "SUPPORT_CAPACITY_CONTEXT", counterpartInterfaceId: structural.interfaceId, counterpartSourceRevision: structural.sourceRevision, handoffStatus: "COMPLETE", validateCounterpart: true })).toThrow(/COUNTERPART_VALIDATION_NOT_IN_R8/);
    expect(() => recordMechanicalInterfaceHandoff(store, actor, { ...shared, handoffId: "handoff-transfer", counterpartDiscipline: "structural", direction: "D4_TO_COUNTERPART", interfaceTopic: "DYNAMIC_LOAD_CONTEXT", counterpartInterfaceId: structural.interfaceId, counterpartSourceRevision: structural.sourceRevision, handoffStatus: "COMPLETE", transferAuthority: true })).toThrow(/AUTHORITY_TRANSFER_REJECTED/);
    expect(() => recordMechanicalInterfaceHandoff(store, actor, { ...shared, handoffId: "handoff-reason", counterpartDiscipline: "civil", direction: "D4_TO_COUNTERPART", interfaceTopic: "ACCESS", counterpartInterfaceId: civilSite.objectId, counterpartSourceRevision: civilSite.provenanceRef, handoffStatus: "COMPLETE", reasonAcrossDisciplines: true })).toThrow(/CROSS_DISCIPLINE_REASONING_NOT_IN_R8/);
    expect(() => recordMechanicalInterfaceHandoff(store, actor, { ...shared, handoffId: "handoff-calc", counterpartDiscipline: "geotechnical", direction: "D4_TO_COUNTERPART", interfaceTopic: "FOUNDATION_OR_SITE_CONSTRAINTS", counterpartInterfaceId: geotechSite.objectId, counterpartSourceRevision: geotechSite.provenanceRef, handoffStatus: "COMPLETE", recalculate: true })).toThrow(/RECALCULATION_NOT_IN_R8/);
    expect(() => recordMechanicalInterfaceHandoff(store, actor, { ...shared, handoffId: "handoff-redesign", counterpartDiscipline: "civil", direction: "D4_TO_COUNTERPART", interfaceTopic: "ACCESS", counterpartInterfaceId: civilSite.objectId, counterpartSourceRevision: civilSite.provenanceRef, handoffStatus: "COMPLETE", redesign: true })).toThrow(/REDESIGN_NOT_IN_R8/);
    expect(() => recordMechanicalInterfaceHandoff(store, { ...actor, actorId: "AI-assistant" }, { ...shared, handoffId: "handoff-ai", counterpartDiscipline: "structural", direction: "D4_TO_COUNTERPART", interfaceTopic: "DYNAMIC_LOAD_CONTEXT", counterpartInterfaceId: null, counterpartSourceRevision: null, handoffStatus: "AWAITING_COUNTERPART" })).toThrow(/AI_NOT_MECHANICAL_AUTHORITY/);
    expect(() => recordMechanicalInterfaceHandoff(store, { ...actor, authority: "ADMIN" }, { ...shared, handoffId: "handoff-admin", counterpartDiscipline: "civil", direction: "D4_TO_COUNTERPART", interfaceTopic: "ACCESS", counterpartInterfaceId: null, counterpartSourceRevision: null, handoffStatus: "AWAITING_COUNTERPART" })).toThrow(/ADMIN_NOT_MECHANICAL_AUTHORITY/);
    expect(() => recordMechanicalInterfaceHandoff(store, actor, { ...shared, tenantId: "tenant-b", handoffId: "handoff-scope", counterpartDiscipline: "structural", direction: "D4_TO_COUNTERPART", interfaceTopic: "DYNAMIC_LOAD_CONTEXT", counterpartInterfaceId: null, counterpartSourceRevision: null, handoffStatus: "AWAITING_COUNTERPART" })).toThrow(/SCOPE_MISMATCH/);
    expect(() => recordMechanicalInterfaceHandoff(store, actor, { ...shared, handoffId: "handoff-d1-dup", counterpartDiscipline: "structural", direction: "D4_TO_COUNTERPART", interfaceTopic: "EQUIPMENT_MASS_OR_LOAD_CONTEXT", counterpartInterfaceId: structural.interfaceId, counterpartSourceRevision: structural.sourceRevision, handoffStatus: "COMPLETE" })).toThrow(/DUPLICATE_HANDOFF_REJECTED/);
    expect(design.suppliedValue).toBe("10");
    expect(requirement.fingerprint).toBe(subject.r5RevisionFingerprint);
    expect(envelope.fingerprint).toBe(subject.r6RevisionFingerprint);
    expect(vendorData.suppliedValue).toBe("500");

    expect(repointMechanicalHandoff).toThrow(/AUTO_REPOINT_REJECTED/);
    expect(mutateMechanicalInterface).toThrow(/SILENT_MUTATION_REJECTED/);
    expect(reasonAcrossMechanicalDisciplines).toThrow(/CROSS_DISCIPLINE_REASONING_NOT_IN_R8/);
    expect(detectMechanicalInterfaceConflict).toThrow(/CONFLICT_DETECTION_NOT_IN_R8/);
    expect(resolveMechanicalInterfaceConflict).toThrow(/CONFLICT_RESOLUTION_NOT_IN_R8/);
    expect(validateMechanicalCounterpart).toThrow(/COUNTERPART_VALIDATION_NOT_IN_R8/);
    expect(recalculateFromInterface).toThrow(/RECALCULATION_NOT_IN_R8/);
    expect(redesignFromInterface).toThrow(/REDESIGN_NOT_IN_R8/);
    expect(mutateDesignConditionFromInterface).toThrow(/R3_MUTATION_REJECTED/);
    expect(mutatePerformanceFromInterface).toThrow(/R3_MUTATION_REJECTED/);
    expect(mutateTechnicalRequirementFromInterface).toThrow(/R5_MUTATION_REJECTED/);
    expect(mutateMaintainabilityFromInterface).toThrow(/R6_MUTATION_REJECTED/);
    expect(fabricateMechanicalCounterpart).toThrow(/COUNTERPART_FABRICATION_REJECTED/);
    expect(promoteHandoffToValidated).toThrow(/VALIDATION_PROMOTION_REJECTED/);
    expect(startFutureDisciplineRuntime).toThrow(/FUTURE_DISCIPLINE_RUNTIME_REJECTED/);

    const here = dirname(fileURLToPath(import.meta.url));
    const sourceText = readFileSync(join(here, "discipline-interfaces-handoffs.ts"), "utf8");
    expect(sourceText).toContain("fingerprintCanonical");
    expect(sourceText).toContain("D2_R8_HANDOFF_STATUSES");
    expect(sourceText).toContain("D1K_R3_SILENT_SOURCE_REPOINTING_ALLOWED");
    expect(sourceText).not.toMatch(/createHash|from ["']@rtb\/engineering-review["']|CREATE TABLE/);
    expect(scanAnalysisFormulaBypass(join(here, "discipline-interfaces-handoffs.ts"), sourceText)).toEqual([]);
    const packageJson = JSON.parse(readFileSync(join(here, "../../package.json"), "utf8")) as { dependencies: Record<string, string> };
    expect(Object.keys(packageJson.dependencies).sort()).toEqual(["@rtb/database", "@rtb/engineering-review", "@rtb/platform-commerce", "@rtb/platform-intelligence", "@rtb/platform-kernel", "@rtb/types", "docx", "exceljs", "pptxgenjs", "zod"]);
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D4.R8.DISCIPLINE_INTERFACES_AND_HANDOFFS")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D4.R9.REVIEW_AND_VALIDATION_GOVERNANCE")?.implementationState).toBe("NOT_IMPLEMENTED");
  });
});
