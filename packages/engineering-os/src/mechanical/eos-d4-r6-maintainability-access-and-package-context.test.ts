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
  D4_RUNTIME_COUNT as R2_RUNTIME_COUNT,
  createD4R2Store,
  recordMechanicalEquipmentClassification,
  recordMechanicalPackageMembership,
} from "./equipment-system-context";
import {
  D4_DESIGN_CONDITION_PERFORMANCE_RUNTIME_READY,
  D4_RUNTIME_COUNT as R3_RUNTIME_COUNT,
  createD4R3Store,
  recordMechanicalDesignCondition,
} from "./design-condition-performance-context";
import {
  D4_MECHANICAL_TECHNICAL_CONTEXT_RUNTIME_READY as R4_TECHNICAL_READY,
  D4_RUNTIME_COUNT as R4_RUNTIME_COUNT,
  D4_VENDOR_DATA_EVIDENCE_RUNTIME_READY,
  createD4R4Store,
  recordMechanicalVendorData,
  recordMechanicalVendorDocument,
} from "./vendor-data-evidence-context";
import {
  D4_MAINTAINABILITY_ACCESS_PACKAGE_RUNTIME_READY as R5_MAINTAINABILITY_READY,
  D4_MECHANICAL_TECHNICAL_CONTEXT_RUNTIME_READY as R5_TECHNICAL_READY,
  D4_R6_STARTED,
  D4_RUNTIME_COUNT as R5_RUNTIME_COUNT,
  createD4R5Store,
  recordMechanicalTechnicalRequirement,
} from "./mechanical-technical-context";
import {
  ACCESS_REQUIREMENT_PRESENT_EQUALS_LAYOUT_VALIDATED,
  ADMIN_EQUALS_D4_MECHANICAL_ENGINEERING_AUTHORITY,
  AI_CAN_INVENT_AUTHORITATIVE_D4_ACCESS_CLEARANCE,
  AI_CAN_INVENT_AUTHORITATIVE_D4_LIFTING_REQUIREMENT,
  AI_CAN_INVENT_AUTHORITATIVE_D4_MAINTAINABILITY_REQUIREMENT,
  AI_EQUALS_D4_MECHANICAL_ENGINEERING_AUTHORITY,
  BASISLESS_AUTHORITATIVE_D4_R6_RECORD_AUTO_ACCEPTED,
  CHANGED_R6_SOURCE_AUTO_REVALIDATES_ENGINEERING,
  CHANGED_R6_SOURCE_AUTO_REWRITES_CONTEXT,
  CHANGED_R6_SOURCE_AUTO_REWRITES_HISTORY,
  D1_STRUCTURAL_PACK_COMPLETE as R6_D1,
  D1N_REOPENED as R6_D1N,
  D2_REOPENED as R6_D2_REOPENED,
  D2_TRACK_COMPLETE as R6_D2,
  D3_REOPENED,
  D3_TRACK_COMPLETE as R6_D3,
  D3_TRACK_COMPLETION_CLASSIFICATION,
  D4_ACCESS_CLEARANCE_CONTEXT_IMPLEMENTED,
  D4_ACCESS_PATH_SOLVER_RUNTIME_COUNT,
  D4_APPROVAL_RUNTIME_COUNT,
  D4_ARRANGEMENT_CONTEXT_EQUALS_CLASH_FREE,
  D4_ARRANGEMENT_CONTEXT_EQUALS_LAYOUT_OPTIMIZED,
  D4_AUTOMATIC_CLEARANCE_VERIFICATION_RUNTIME_COUNT,
  D4_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT,
  D4_CERTIFICATION_RUNTIME_COUNT,
  D4_CONFORMANCE_DETERMINATION_RUNTIME_COUNT,
  D4_CROSS_DISCIPLINE_CONFLICT_DETECTION_RUNTIME_COUNT,
  D4_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT,
  D4_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT,
  D4_CROSS_DISCIPLINE_RECOMMENDATION_RUNTIME_COUNT,
  D4_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT,
  D4_D9_RUNTIME_INTEGRATION_COUNT,
  D4_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
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
  D4_LAYOUT_OPTIMIZATION_RUNTIME_COUNT,
  D4_LIFTING_CONTEXT_EQUALS_LIFTING_ANALYSIS,
  D4_LIFTING_CONTEXT_EQUALS_RIGGING_DESIGN,
  D4_LIFTING_CONTEXT_EQUALS_STRUCTURAL_LIFTING_DESIGN,
  D4_LIFTING_CONTEXT_IMPLEMENTED,
  D4_LIFTING_LOAD_STRUCTURAL_VERIFICATION_RUNTIME_COUNT,
  D4_LIFTING_REQUIREMENT_EQUALS_D1_STRUCTURAL_VERIFICATION,
  D4_MAINTAINABILITY_ACCESS_PACKAGE_RUNTIME_COUNT,
  D4_MAINTAINABILITY_ACCESS_PACKAGE_RUNTIME_IMPLEMENTED,
  D4_MAINTAINABILITY_ACCESS_PACKAGE_RUNTIME_READY,
  D4_MAINTAINABILITY_CONTEXT_IMPLEMENTED,
  D4_MAINTAINABILITY_RUNTIME_COUNT,
  D4_MECHANICAL_ARRANGEMENT_CONSTRAINT_CONTEXT_IMPLEMENTED,
  D4_MECHANICAL_DESIGN_OPTIMIZATION_RUNTIME_COUNT,
  D4_MECHANICAL_LOAD_CALCULATION_RUNTIME_COUNT,
  D4_MECHANICAL_TECHNICAL_CONTEXT_RUNTIME_READY,
  D4_PACKAGE_BOUNDARY_CONTEXT_IMPLEMENTED,
  D4_PACKAGE_CONTEXT_IMPLEMENTED,
  D4_R1_IDENTITY_REUSED,
  D4_R2_EQUIPMENT_SYSTEM_CONTEXT_REUSED,
  D4_R2_PACKAGE_MEMBERSHIP_REUSED,
  D4_R3_DESIGN_CONDITION_PERFORMANCE_CONTEXT_REUSED,
  D4_R4_VENDOR_DATA_EVIDENCE_CONTEXT_REUSED,
  D4_R4_VENDOR_EVIDENCE_REFERENCE_SUPPORTED,
  D4_R5_MECHANICAL_TECHNICAL_CONTEXT_REUSED,
  D4_R5_RUNTIME_COUNT_REUSED,
  D4_R5_TECHNICAL_REQUIREMENT_REFERENCE_SUPPORTED,
  D4_R6_ACCESS_CLEARANCE_SOURCE_BASIS_REQUIRED,
  D4_R6_APPLICABILITY_EXPLICIT,
  D4_R6_AUTO_MUTATES_R5_REQUIREMENT,
  D4_R6_AUTO_PROPAGATED_OUTSIDE_APPLICABILITY,
  D4_R6_AUTO_REPOINTED,
  D4_R6_AUTO_REWRITES_R5_TECHNICAL_CONTEXT,
  D4_R6_BLOCKER,
  D4_R6_CANONICAL_NEXT_PHASE,
  D4_R6_CANONICAL_NEXT_PHASE_SCOPE,
  D4_R6_CHANGE_PROPAGATION_RUNTIME_COUNT,
  D4_R6_DUPLICATE_GOVERNANCE_IMPLEMENTED,
  D4_R6_HIDDEN_CALCULATION_ALLOWED,
  D4_R6_HISTORY_PRESERVED,
  D4_R6_INFERRED_PACKAGE_MEMBERSHIP_ALLOWED,
  D4_R6_LIMITATIONS_EXPLICIT,
  D4_R6_MATURITY,
  D4_R6_NEXT_PHASE_TYPE,
  D4_R6_PROVENANCE_PRESERVED,
  D4_R6_PROVENANCE_REQUIRED,
  D4_R6_REPLAY_PROTECTION_IMPLEMENTED,
  D4_R6_SOURCE_AUTO_REPOINTED,
  D4_R6_SOURCE_BASIS_REQUIRED,
  D4_R6_SOURCE_BASIS_TRACEABLE,
  D4_R6_SPOOFING_PROTECTION_IMPLEMENTED,
  D4_R6_STATUS,
  D4_R7_STARTED,
  D4_REMOVAL_REPLACEMENT_CONTEXT_IMPLEMENTED,
  D4_REMOVAL_ROUTE_SOLVER_RUNTIME_COUNT,
  D4_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_COUNT,
  D4_REUSES_CANONICAL_CURRENTNESS,
  D4_REUSES_CANONICAL_FINGERPRINT,
  D4_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_COUNT,
  D4_RIGGING_ANALYSIS_RUNTIME_COUNT,
  D4_ROTATING_EQUIPMENT_CALCULATION_RUNTIME_COUNT,
  D4_RUNTIME_COUNT,
  D4_RUNTIME_STARTED,
  D4_SPATIAL_CLASH_DETECTION_RUNTIME_COUNT,
  D4_STATIC_EQUIPMENT_CALCULATION_RUNTIME_COUNT,
  D4_STRUCTURAL_LIFTING_DESIGN_RUNTIME_COUNT,
  D4_THERMAL_MECHANICAL_CALCULATION_RUNTIME_COUNT,
  D4_VIBRATION_ANALYSIS_RUNTIME_COUNT,
  D5_RUNTIME_STARTED,
  D6_RUNTIME_STARTED,
  D7_RUNTIME_STARTED,
  D8_RUNTIME_STARTED,
  D9_RUNTIME_COUNT,
  D9_RUNTIME_STARTED,
  DATABASE_SCHEMA_CHANGED,
  EXACT_D4_R1_R5_REFERENCE_REQUIRED,
  FLOATING_D4_R6_SOURCE_REFERENCE_ALLOWED,
  LIFTING_REQUIREMENT_PRESENT_EQUALS_LIFTING_VALIDATED,
  MAINTAINABILITY_CONTEXT_EQUALS_MAINTENANCE_FEASIBILITY_CONFIRMED,
  MAINTAINABILITY_CONTEXT_EQUALS_SPATIAL_VALIDATION,
  MAINTENANCE_ENVELOPE_PRESENT_EQUALS_VALIDATED,
  NEW_DEPENDENCY_ADDED,
  PARALLEL_D4_CURRENTNESS_ENGINE_CREATED,
  REMOVAL_CONTEXT_EQUALS_ROUTE_VALIDATED,
  REPLACEMENT_CONTEXT_EQUALS_INSTALLABILITY_VALIDATED,
  SECOND_D4_FINGERPRINT_ALGORITHM_CREATED,
  SILENT_D4_R6_MUTATION_ALLOWED,
  TENANT_WORKSPACE_PROJECT_D4_R6_SCOPE_ENFORCED,
  VENDOR_LIFTING_DATA_EQUALS_VALIDATED_LIFTING_DESIGN,
  VENDOR_MAINTENANCE_REQUIREMENT_EQUALS_ADOPTED_D4_MAINTAINABILITY,
  adoptVendorMaintenanceRequirement,
  analyzeLifting,
  applyChangedSourceToContext,
  approveContext,
  certifyContext,
  concludeCrossDisciplineConflict,
  createD4R6Store,
  designRigging,
  detectSpatialClash,
  determineConformance,
  mutateContext,
  openDisciplineInterface,
  optimizeLayout,
  propagateContextChange,
  recordMechanicalAccessClearanceContext,
  recordMechanicalArrangementConstraint,
  recordMechanicalLiftingContext,
  recordMechanicalMaintainabilityCandidate,
  recordMechanicalMaintainabilityContext,
  recordMechanicalPackageBoundaryContext,
  recordMechanicalPackageContext,
  recordMechanicalRemovalReplacementContext,
  recordMechanicalVendorMaintainabilityContext,
  repointContext,
  reviseRequirementFromContext,
  rewriteTechnicalContext,
  sizeMechanicalEquipment,
  solveAccessPath,
  solveRemovalRoute,
  validateMaintenanceEnvelope,
  verifyClearance,
  verifyStructuralLifting,
} from "./maintainability-access-package-context";

const actor: D4R1Actor = {
  actorId: "mechanical-recorder",
  tenantId: "tenant-a",
  workspaceId: "workspace-a",
  projectId: "project-a",
  authority: D4_CONTEXT_AUTHORITY,
};

describe("EOS-D4-R6 Maintainability access and package context", () => {
  it("records access, removal, lifting, and package constraints without spatial verification", () => {
    expect(D4_R6_STATUS).toBe("MAINTAINABILITY_ACCESS_AND_PACKAGE_CONTEXT_IMPLEMENTED");
    expect(D4_R6_MATURITY).toBe("MAINTAINABILITY_ACCESS_AND_PACKAGE_CONTEXT_IMPLEMENTED");
    expect(D4_RUNTIME_STARTED).toBe(true);
    expect(D4_RUNTIME_COUNT).toBe(6);
    expect(R1_RUNTIME_COUNT).toBe(1);
    expect(R2_RUNTIME_COUNT).toBe(2);
    expect(R3_RUNTIME_COUNT).toBe(3);
    expect(R4_RUNTIME_COUNT).toBe(4);
    expect(R5_RUNTIME_COUNT).toBe(5);
    expect(D4_R5_RUNTIME_COUNT_REUSED).toBe(5);
    expect(D4_DESIGN_CONDITION_PERFORMANCE_RUNTIME_READY).toBe(true);
    expect(D4_VENDOR_DATA_EVIDENCE_RUNTIME_READY).toBe(true);
    expect(R5_TECHNICAL_READY).toBe(true);
    expect(D4_MECHANICAL_TECHNICAL_CONTEXT_RUNTIME_READY).toBe(true);
    expect(R4_TECHNICAL_READY).toBe(false);
    expect(R5_MAINTAINABILITY_READY).toBe(false);
    expect(D4_R6_STARTED).toBe(false);
    expect(D4_R7_STARTED).toBe(false);
    expect(D4_0_STARTED).toBe(false);
    expect(D4_MAINTAINABILITY_ACCESS_PACKAGE_RUNTIME_IMPLEMENTED).toBe(true);
    expect(D4_MAINTAINABILITY_ACCESS_PACKAGE_RUNTIME_COUNT).toBe(1);
    expect(D4_MAINTAINABILITY_ACCESS_PACKAGE_RUNTIME_READY).toBe(true);
    expect(D4_MAINTAINABILITY_RUNTIME_COUNT).toBe(0);
    expect(D4_MAINTAINABILITY_CONTEXT_IMPLEMENTED).toBe(true);
    expect(MAINTAINABILITY_CONTEXT_EQUALS_SPATIAL_VALIDATION).toBe(false);
    expect(MAINTAINABILITY_CONTEXT_EQUALS_MAINTENANCE_FEASIBILITY_CONFIRMED).toBe(false);
    expect(D4_ACCESS_CLEARANCE_CONTEXT_IMPLEMENTED).toBe(true);
    expect(D4_R6_ACCESS_CLEARANCE_SOURCE_BASIS_REQUIRED).toBe(true);
    expect(D4_AUTOMATIC_CLEARANCE_VERIFICATION_RUNTIME_COUNT).toBe(0);
    expect(D4_SPATIAL_CLASH_DETECTION_RUNTIME_COUNT).toBe(0);
    expect(D4_REMOVAL_REPLACEMENT_CONTEXT_IMPLEMENTED).toBe(true);
    expect(REMOVAL_CONTEXT_EQUALS_ROUTE_VALIDATED).toBe(false);
    expect(REPLACEMENT_CONTEXT_EQUALS_INSTALLABILITY_VALIDATED).toBe(false);
    expect(D4_LIFTING_CONTEXT_IMPLEMENTED).toBe(true);
    expect(D4_LIFTING_CONTEXT_EQUALS_LIFTING_ANALYSIS).toBe(false);
    expect(D4_LIFTING_CONTEXT_EQUALS_RIGGING_DESIGN).toBe(false);
    expect(D4_LIFTING_CONTEXT_EQUALS_STRUCTURAL_LIFTING_DESIGN).toBe(false);
    expect(D4_PACKAGE_CONTEXT_IMPLEMENTED).toBe(true);
    expect(D4_PACKAGE_BOUNDARY_CONTEXT_IMPLEMENTED).toBe(true);
    expect(D4_R2_PACKAGE_MEMBERSHIP_REUSED).toBe(true);
    expect(D4_R6_INFERRED_PACKAGE_MEMBERSHIP_ALLOWED).toBe(false);
    expect(D4_MECHANICAL_ARRANGEMENT_CONSTRAINT_CONTEXT_IMPLEMENTED).toBe(true);
    expect(D4_ARRANGEMENT_CONTEXT_EQUALS_LAYOUT_OPTIMIZED).toBe(false);
    expect(D4_ARRANGEMENT_CONTEXT_EQUALS_CLASH_FREE).toBe(false);
    expect(D4_R1_IDENTITY_REUSED).toBe(true);
    expect(D4_R2_EQUIPMENT_SYSTEM_CONTEXT_REUSED).toBe(true);
    expect(D4_R3_DESIGN_CONDITION_PERFORMANCE_CONTEXT_REUSED).toBe(true);
    expect(D4_R4_VENDOR_DATA_EVIDENCE_CONTEXT_REUSED).toBe(true);
    expect(D4_R5_MECHANICAL_TECHNICAL_CONTEXT_REUSED).toBe(true);
    expect(EXACT_D4_R1_R5_REFERENCE_REQUIRED).toBe(true);
    expect(FLOATING_D4_R6_SOURCE_REFERENCE_ALLOWED).toBe(false);
    expect(D4_R6_SOURCE_AUTO_REPOINTED).toBe(false);
    expect(D4_R6_SOURCE_BASIS_REQUIRED).toBe(true);
    expect(D4_R6_SOURCE_BASIS_TRACEABLE).toBe(true);
    expect(BASISLESS_AUTHORITATIVE_D4_R6_RECORD_AUTO_ACCEPTED).toBe(false);
    expect(D4_R4_VENDOR_EVIDENCE_REFERENCE_SUPPORTED).toBe(true);
    expect(VENDOR_MAINTENANCE_REQUIREMENT_EQUALS_ADOPTED_D4_MAINTAINABILITY).toBe(false);
    expect(VENDOR_LIFTING_DATA_EQUALS_VALIDATED_LIFTING_DESIGN).toBe(false);
    expect(D4_R5_TECHNICAL_REQUIREMENT_REFERENCE_SUPPORTED).toBe(true);
    expect(D4_R6_AUTO_MUTATES_R5_REQUIREMENT).toBe(false);
    expect(D4_R6_AUTO_REWRITES_R5_TECHNICAL_CONTEXT).toBe(false);
    expect(D4_R6_APPLICABILITY_EXPLICIT).toBe(true);
    expect(D4_R6_LIMITATIONS_EXPLICIT).toBe(true);
    expect(D4_R6_AUTO_PROPAGATED_OUTSIDE_APPLICABILITY).toBe(false);
    expect(D4_LIFTING_REQUIREMENT_EQUALS_D1_STRUCTURAL_VERIFICATION).toBe(false);
    expect(D4_R6_HIDDEN_CALCULATION_ALLOWED).toBe(false);
    expect(MAINTENANCE_ENVELOPE_PRESENT_EQUALS_VALIDATED).toBe(false);
    expect(ACCESS_REQUIREMENT_PRESENT_EQUALS_LAYOUT_VALIDATED).toBe(false);
    expect(LIFTING_REQUIREMENT_PRESENT_EQUALS_LIFTING_VALIDATED).toBe(false);
    expect(AI_EQUALS_D4_MECHANICAL_ENGINEERING_AUTHORITY).toBe(false);
    expect(ADMIN_EQUALS_D4_MECHANICAL_ENGINEERING_AUTHORITY).toBe(false);
    expect(AI_CAN_INVENT_AUTHORITATIVE_D4_MAINTAINABILITY_REQUIREMENT).toBe(false);
    expect(AI_CAN_INVENT_AUTHORITATIVE_D4_ACCESS_CLEARANCE).toBe(false);
    expect(AI_CAN_INVENT_AUTHORITATIVE_D4_LIFTING_REQUIREMENT).toBe(false);
    expect(D4_REUSES_CANONICAL_CURRENTNESS).toBe(true);
    expect(PARALLEL_D4_CURRENTNESS_ENGINE_CREATED).toBe(false);
    expect(D4_REUSES_CANONICAL_FINGERPRINT).toBe(true);
    expect(SECOND_D4_FINGERPRINT_ALGORITHM_CREATED).toBe(false);
    expect(D4_R6_PROVENANCE_REQUIRED).toBe(true);
    expect(D4_R6_PROVENANCE_PRESERVED).toBe(true);
    expect(D4_R6_AUTO_REPOINTED).toBe(false);
    expect(SILENT_D4_R6_MUTATION_ALLOWED).toBe(false);
    expect(D4_R6_HISTORY_PRESERVED).toBe(true);
    expect(TENANT_WORKSPACE_PROJECT_D4_R6_SCOPE_ENFORCED).toBe(true);
    expect(CHANGED_R6_SOURCE_AUTO_REWRITES_CONTEXT).toBe(false);
    expect(CHANGED_R6_SOURCE_AUTO_REWRITES_HISTORY).toBe(false);
    expect(CHANGED_R6_SOURCE_AUTO_REVALIDATES_ENGINEERING).toBe(false);
    expect(D4_EQUALS_D1_STRUCTURAL_AUTHORITY).toBe(false);
    expect(D4_EQUALS_D2_CIVIL_AUTHORITY).toBe(false);
    expect(D4_EQUALS_D3_GEOTECHNICAL_AUTHORITY).toBe(false);
    expect(D4_EQUALS_D5_PIPING_AUTHORITY).toBe(false);
    expect(D4_EQUALS_D6_PROCESS_AUTHORITY).toBe(false);
    expect(D4_EQUALS_D7_ELECTRICAL_AUTHORITY).toBe(false);
    expect(D4_EQUALS_D8_INSTRUMENTATION_CONTROL_AUTHORITY).toBe(false);
    expect(D4_R6_DUPLICATE_GOVERNANCE_IMPLEMENTED).toBe(true);
    expect(D4_R6_REPLAY_PROTECTION_IMPLEMENTED).toBe(true);
    expect(D4_R6_SPOOFING_PROTECTION_IMPLEMENTED).toBe(true);
    expect([
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
      D4_SPATIAL_CLASH_DETECTION_RUNTIME_COUNT,
      D4_ACCESS_PATH_SOLVER_RUNTIME_COUNT,
      D4_REMOVAL_ROUTE_SOLVER_RUNTIME_COUNT,
      D4_LAYOUT_OPTIMIZATION_RUNTIME_COUNT,
      D4_STRUCTURAL_LIFTING_DESIGN_RUNTIME_COUNT,
      D4_RIGGING_ANALYSIS_RUNTIME_COUNT,
      D4_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT,
      D4_CONFORMANCE_DETERMINATION_RUNTIME_COUNT,
      D4_APPROVAL_RUNTIME_COUNT,
      D4_CERTIFICATION_RUNTIME_COUNT,
      D4_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT,
      D4_CROSS_DISCIPLINE_CONFLICT_DETECTION_RUNTIME_COUNT,
      D4_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT,
      D4_CROSS_DISCIPLINE_RECOMMENDATION_RUNTIME_COUNT,
      D4_D9_RUNTIME_INTEGRATION_COUNT,
    ]).toEqual(Array(28).fill(0));
    expect(D4_R6_CHANGE_PROPAGATION_RUNTIME_COUNT).toBe(0);
    expect(D4_AUTOMATIC_CLEARANCE_VERIFICATION_RUNTIME_COUNT).toBe(0);
    expect(D4_LIFTING_LOAD_STRUCTURAL_VERIFICATION_RUNTIME_COUNT).toBe(0);
    expect(D5_RUNTIME_STARTED).toBe(false);
    expect(D6_RUNTIME_STARTED).toBe(false);
    expect(D7_RUNTIME_STARTED).toBe(false);
    expect(D8_RUNTIME_STARTED).toBe(false);
    expect(D9_RUNTIME_STARTED).toBe(false);
    expect(D9_RUNTIME_COUNT).toBe(0);
    expect(DATABASE_SCHEMA_CHANGED).toBe(false);
    expect(NEW_DEPENDENCY_ADDED).toBe(false);
    expect(R6_D1).toBe(false);
    expect(D1_STRUCTURAL_PACK_COMPLETE).toBe(false);
    expect(R6_D1N).toBe(false);
    expect(D1N_REOPENED).toBe(false);
    expect(R6_D2).toBe(true);
    expect(D2_TRACK_COMPLETE).toBe(true);
    expect(R6_D2_REOPENED).toBe(false);
    expect(D2_REOPENED).toBe(false);
    expect(R6_D3).toBe(true);
    expect(D3_TRACK_COMPLETE).toBe(true);
    expect(D3_TRACK_COMPLETION_CLASSIFICATION).toBe("COMPLETE_BOUNDED_WITH_LIMITATIONS");
    expect(D3_REOPENED).toBe(false);
    expect(D4_R6_CANONICAL_NEXT_PHASE).toBe("EOS-D4-R7-REQUIREMENTS-ASSUMPTIONS-AND-CHANGE");
    expect(D4_R6_NEXT_PHASE_TYPE).toBe("REQUIREMENTS_ASSUMPTIONS_AND_CHANGE");
    expect(D4_R6_CANONICAL_NEXT_PHASE_SCOPE).toContain("Do not implement discipline interfaces");
    expect(D4_R6_BLOCKER).toBe("NONE");

    const r1 = createD4R1Store();
    const context = recordMechanicalContext(r1, actor, {
      contextId: "mechanical-context-1",
      citedLifecycleStage: "FEED",
      provenanceRef: "prov-context",
    });
    const equipment = recordMechanicalObjectIdentity(r1, actor, {
      objectId: "pump-identity-1",
      contextId: context.contextId,
      objectType: "ROTATING_EQUIPMENT",
      citedLifecycleStage: "FEED",
      provenanceRef: "prov-pump",
    });
    const packageIdentity = recordMechanicalObjectIdentity(r1, actor, {
      objectId: "package-1",
      contextId: context.contextId,
      objectType: "MECHANICAL_PACKAGE",
      citedLifecycleStage: "FEED",
      provenanceRef: "prov-package",
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
    const membership = recordMechanicalPackageMembership(r2, actor, {
      membershipId: "member-package-1",
      contextId: context.contextId,
      objectId: equipment.objectId,
      objectRevisionFingerprint: equipment.fingerprint,
      containerObjectId: packageIdentity.objectId,
      containerRevisionFingerprint: packageIdentity.fingerprint,
      membershipBasis: "EXPLICIT",
      citedLifecycleStage: "FEED",
      provenanceRef: "prov-package-member",
      citedCurrentness: "CURRENT",
    });
    const r3 = createD4R3Store(r2);
    const design = recordMechanicalDesignCondition(r3, actor, {
      tenantId: actor.tenantId,
      workspaceId: actor.workspaceId,
      projectId: actor.projectId,
      contextId: context.contextId,
      objectId: equipment.objectId,
      objectRevisionFingerprint: equipment.fingerprint,
      r2SubjectKind: "CLASSIFICATION",
      r2SubjectId: classification.classificationId,
      r2RevisionFingerprint: classification.fingerprint,
      citedCurrentness: "CURRENT",
      applicabilityObjectId: equipment.objectId,
      applicabilityCase: "NORMAL_OPERATION",
      limitations: "This pump only",
      provenanceRef: "prov-design",
      recordId: "design-pressure",
      subjectKind: "DESIGN_PRESSURE",
      suppliedValue: "10",
      unit: "bar",
      sourceBasis: "PROJECT_SPECIFICATION",
      sourceRef: "spec-100",
      sourceRevision: "A",
      adoptionRationale: "Adopted casing pressure",
    });
    const r4 = createD4R4Store(r3);
    const upstream = {
      tenantId: actor.tenantId,
      workspaceId: actor.workspaceId,
      projectId: actor.projectId,
      contextId: context.contextId,
      objectId: equipment.objectId,
      objectRevisionFingerprint: equipment.fingerprint,
      r2SubjectKind: "CLASSIFICATION" as const,
      r2SubjectId: classification.classificationId,
      r2RevisionFingerprint: classification.fingerprint,
      r3RecordId: design.recordId,
      r3RevisionFingerprint: design.fingerprint,
      citedCurrentness: "CURRENT" as const,
      vendorIdentity: "Acme Pumps",
      sourceOrganization: "Acme Pumps Ltd",
      limitations: "Vendor claim only",
      provenanceRef: "prov-vendor",
    };
    const document = recordMechanicalVendorDocument(r4, actor, {
      ...upstream,
      recordId: "vendor-doc",
      documentRef: "MM-100",
      documentRevision: "C",
      evidenceClass: "MANUAL",
      sourceStatus: "FOR_INFORMATION",
    });
    const vendorData = recordMechanicalVendorData(r4, actor, {
      ...upstream,
      recordId: "vendor-mass",
      documentRef: "MM-100",
      documentRevision: "C",
      evidenceClass: "VENDOR_DATASHEET",
      dataKind: "DRY_MASS",
      suppliedValue: "500",
      unit: "kg",
      parentDocumentId: document.recordId,
      parentDocumentFingerprint: document.fingerprint,
    });
    const r5 = createD4R5Store(r4);
    const requirement = recordMechanicalTechnicalRequirement(r5, actor, {
      ...upstream,
      r4RecordId: vendorData.recordId,
      r4RevisionFingerprint: vendorData.fingerprint,
      applicabilityObjectId: equipment.objectId,
      applicabilityCase: "NORMAL_OPERATION",
      limitations: "This pump identity only",
      provenanceRef: "prov-requirement",
      recordId: "maint-requirement",
      subjectKind: "MECHANICAL_EQUIPMENT_REQUIREMENT",
      requirementStatement: "Provide a governed maintenance envelope for this pump",
      sourceBasis: "PROJECT_SPECIFICATION",
      sourceRef: "spec-100",
      sourceRevision: "A",
      adoptionRationale: "Adopted maintenance envelope requirement",
    });
    const preservedRequirement = requirement.requirementStatement;
    const preservedFingerprint = requirement.fingerprint;
    const store = createD4R6Store(r5);
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
      r3RecordId: design.recordId,
      r3RevisionFingerprint: design.fingerprint,
      r4RecordId: vendorData.recordId,
      r4RevisionFingerprint: vendorData.fingerprint,
      r5RecordId: requirement.recordId,
      r5RevisionFingerprint: requirement.fingerprint,
      citedCurrentness: "CURRENT" as const,
      componentRef: "PUMP_CASING",
      orientationContext: "HORIZONTAL",
      applicabilityObjectId: equipment.objectId,
      applicabilityCase: "PLANNED_MAINTENANCE",
      limitations: "This pump and this maintenance case only",
      provenanceRef: "prov-maintainability",
    };
    const envelope = recordMechanicalMaintainabilityContext(store, actor, {
      ...bound,
      recordId: "maint-envelope",
      subjectKind: "MAINTENANCE_ENVELOPE",
      statement: "Maintain a service envelope around the non-drive end",
      sourceBasis: "R5_MECHANICAL_TECHNICAL_REQUIREMENT",
      sourceRef: requirement.recordId,
      sourceRevision: "A",
      adoptionRationale: "Adopted from the project maintenance requirement",
    });
    expect(envelope.adopted).toBe(true);
    expect(envelope.spatialValidation).toBe(false);
    expect(envelope.feasibilityConfirmed).toBe(false);
    expect(envelope.engineeringValidated).toBe(false);
    expect(envelope.r5RevisionFingerprint).toBe(requirement.fingerprint);
    expect(requirement.requirementStatement).toBe(preservedRequirement);
    expect(requirement.fingerprint).toBe(preservedFingerprint);
    const access = recordMechanicalAccessClearanceContext(store, actor, {
      ...bound,
      recordId: "access-clearance",
      subjectKind: "MAINTENANCE_CLEARANCE",
      statement: "Keep the stated service clearance at the coupling",
      sourceBasis: "PROJECT_SPECIFICATION",
      sourceRef: "spec-100",
      sourceRevision: "A",
      suppliedValue: "800",
      unit: "mm",
      adoptionRationale: "Adopted service clearance",
    });
    expect(access.clearanceVerified).toBe(false);
    expect(access.unit).toBe("mm");
    const removal = recordMechanicalRemovalReplacementContext(store, actor, {
      ...bound,
      recordId: "removal-envelope",
      subjectKind: "REMOVAL_ENVELOPE",
      statement: "Extract the cartridge along the drive axis",
      sourceBasis: "MAINTENANCE_STRATEGY",
      sourceRef: "strategy-1",
      sourceRevision: "A",
      adoptionRationale: "Adopted removal envelope",
    });
    expect(removal.routeValidated).toBe(false);
    expect(removal.installabilityValidated).toBe(false);
    const lifting = recordMechanicalLiftingContext(store, actor, {
      ...bound,
      recordId: "lifting-mass",
      subjectKind: "LIFTING_MASS",
      statement: "Use the supplied dry mass as lifting context",
      sourceBasis: "R4_VENDOR_EVIDENCE",
      sourceRef: vendorData.recordId,
      sourceRevision: "C",
      suppliedValue: "500",
      unit: "kg",
      adoptionRationale: "Explicitly adopted vendor lifting mass as context",
    });
    expect(lifting.liftingAnalysis).toBe(false);
    expect(lifting.riggingDesign).toBe(false);
    expect(lifting.structuralLiftingDesign).toBe(false);
    expect(lifting.structuralVerification).toBe(false);
    const vendorContext = recordMechanicalVendorMaintainabilityContext(store, actor, {
      ...bound,
      recordId: "vendor-maint",
      subjectKind: "SERVICE_ACCESS_REQUIREMENT",
      statement: "Vendor manual states a coupling access side",
      sourceBasis: "R4_VENDOR_EVIDENCE",
      sourceRef: document.recordId,
      sourceRevision: "C",
    });
    expect(vendorContext.adopted).toBe(false);
    expect(vendorContext.authoritative).toBe(false);
    expect(vendorContext.vendorAutoAdopted).toBe(false);
    const packageContext = recordMechanicalPackageContext(store, actor, {
      ...bound,
      r2SubjectKind: "MEMBERSHIP",
      r2SubjectId: membership.membershipId,
      r2RevisionFingerprint: membership.fingerprint,
      recordId: "package-context",
      subjectKind: "PACKAGE_CONTAINMENT",
      statement: "This pump remains inside the named package boundary",
      sourceBasis: "GOVERNED_PROJECT_REQUIREMENT",
      sourceRef: "pkg-req-1",
      sourceRevision: "A",
      adoptionRationale: "Adopted explicit package membership",
    });
    expect(packageContext.r2SubjectId).toBe(membership.membershipId);
    expect(membership.membershipBasis).toBe("EXPLICIT");
    const boundary = recordMechanicalPackageBoundaryContext(store, actor, {
      ...bound,
      r2SubjectKind: "MEMBERSHIP",
      r2SubjectId: membership.membershipId,
      r2RevisionFingerprint: membership.fingerprint,
      recordId: "package-boundary",
      subjectKind: "PACKAGE_BOUNDARY",
      statement: "Package maintenance stays inside the supplied package limit",
      sourceBasis: "MANUFACTURER_INSTRUCTION",
      sourceRef: "pkg-limit-1",
      sourceRevision: "A",
      adoptionRationale: "Adopted package boundary",
    });
    expect(boundary.recordClass).toBe("PACKAGE_BOUNDARY");
    expect(boundary.clashFree).toBe(false);
    const arrangement = recordMechanicalArrangementConstraint(store, actor, {
      ...bound,
      recordId: "arrangement",
      subjectKind: "MAINTENANCE_SIDE",
      statement: "Service the pump from the coupling side",
      sourceBasis: "AUTHORIZED_MECHANICAL_ENGINEERING_INPUT",
      sourceRef: "input-1",
      sourceRevision: "A",
      adoptionRationale: "Adopted arrangement constraint",
    });
    expect(arrangement.layoutOptimized).toBe(false);
    expect(arrangement.clashFree).toBe(false);
    const candidate = recordMechanicalMaintainabilityCandidate(store, actor, {
      ...bound,
      recordId: "candidate-access",
      subjectKind: "ACCESS_RESTRICTION",
      statement: "Candidate note about a restricted side",
      sourceBasis: "MECHANICAL_DESIGN_BASIS",
      sourceRef: "basis-1",
      sourceRevision: "A",
    });
    expect(candidate.candidate).toBe(true);
    expect(candidate.authoritative).toBe(false);

    expect(() => recordMechanicalMaintainabilityContext(store, actor, { ...bound, recordId: "bad-basis", subjectKind: "MAINTENANCE_ENVELOPE", statement: "Missing basis", sourceBasis: "VENDOR_CLAIM", sourceRef: "x", sourceRevision: "A", adoptionRationale: "No" })).toThrow(/SOURCE_BASIS_REQUIRED/);
    expect(() => recordMechanicalMaintainabilityContext(store, actor, { ...bound, recordId: "floating", subjectKind: "MAINTENANCE_ENVELOPE", statement: "Floating revision", sourceBasis: "PROJECT_SPECIFICATION", sourceRef: "spec-100", sourceRevision: "latest", adoptionRationale: "No" })).toThrow(/SOURCE_REVISION_REQUIRED/);
    expect(() => recordMechanicalAccessClearanceContext(store, actor, { ...bound, recordId: "no-rationale", subjectKind: "SERVICE_CLEARANCE", statement: "Clearance without adoption", sourceBasis: "PROJECT_SPECIFICATION", sourceRef: "spec-100", sourceRevision: "A" })).toThrow(/ADOPTION_RATIONALE_REQUIRED/);
    expect(() => recordMechanicalVendorMaintainabilityContext(store, actor, { ...bound, recordId: "vendor-adopted", subjectKind: "SERVICE_ACCESS_REQUIREMENT", statement: "Vendor text with a rationale", sourceBasis: "R4_VENDOR_EVIDENCE", sourceRef: document.recordId, sourceRevision: "C", adoptionRationale: "Silent adoption" })).toThrow(/SOURCE_NOT_ADOPTED/);
    expect(() => recordMechanicalMaintainabilityContext(store, actor, { ...bound, r5RevisionFingerprint: "wrong", recordId: "wrong-r5", subjectKind: "MAINTENANCE_ENVELOPE", statement: "Wrong requirement revision", sourceBasis: "R5_MECHANICAL_TECHNICAL_REQUIREMENT", sourceRef: requirement.recordId, sourceRevision: "A", adoptionRationale: "No" })).toThrow(/R5_REVISION_MISMATCH/);
    expect(() => recordMechanicalAccessClearanceContext(store, actor, { ...bound, recordId: "broad", subjectKind: "MAINTENANCE_CLEARANCE", statement: "Applies everywhere", sourceBasis: "PROJECT_SPECIFICATION", sourceRef: "spec-100", sourceRevision: "A", applicabilityCase: "ALL", adoptionRationale: "No" })).toThrow(/APPLICABILITY_MISMATCH/);
    expect(() => recordMechanicalMaintainabilityContext(store, actor, { ...bound, recordId: "calc", subjectKind: "MAINTENANCE_ENVELOPE", statement: "Envelope is 10*1.2", sourceBasis: "PROJECT_SPECIFICATION", sourceRef: "spec-100", sourceRevision: "A", adoptionRationale: "No" })).toThrow(/HIDDEN_CALCULATION_REJECTED/);
    expect(() => recordMechanicalAccessClearanceContext(store, actor, { ...bound, recordId: "verify", subjectKind: "MINIMUM_CLEARANCE", statement: "Check the gap", sourceBasis: "PROJECT_SPECIFICATION", sourceRef: "spec-100", sourceRevision: "A", adoptionRationale: "No", verifyClearance: true })).toThrow(/CLEARANCE_VERIFICATION_REJECTED/);
    expect(() => recordMechanicalArrangementConstraint(store, actor, { ...bound, recordId: "clash", subjectKind: "ADJACENCY_RESTRICTION", statement: "Detect clashes", sourceBasis: "PROJECT_SPECIFICATION", sourceRef: "spec-100", sourceRevision: "A", adoptionRationale: "No", spatialClash: true })).toThrow(/SPATIAL_ANALYSIS_REJECTED/);
    expect(() => recordMechanicalRemovalReplacementContext(store, actor, { ...bound, recordId: "path", subjectKind: "REPLACEMENT_PATH_CONTEXT", statement: "Solve a path", sourceBasis: "MAINTENANCE_STRATEGY", sourceRef: "strategy-1", sourceRevision: "A", adoptionRationale: "No", accessPath: true })).toThrow(/ACCESS_PATH_SOLVER_REJECTED/);
    expect(() => recordMechanicalRemovalReplacementContext(store, actor, { ...bound, recordId: "route", subjectKind: "REMOVAL_DIRECTION", statement: "Solve a route", sourceBasis: "MAINTENANCE_STRATEGY", sourceRef: "strategy-1", sourceRevision: "A", adoptionRationale: "No", removalRoute: true })).toThrow(/REMOVAL_ROUTE_SOLVER_REJECTED/);
    expect(() => recordMechanicalArrangementConstraint(store, actor, { ...bound, recordId: "layout", subjectKind: "MECHANICAL_ARRANGEMENT_CONSTRAINT", statement: "Optimize the layout", sourceBasis: "PROJECT_SPECIFICATION", sourceRef: "spec-100", sourceRevision: "A", adoptionRationale: "No", layoutOptimized: true })).toThrow(/LAYOUT_OPTIMIZATION_REJECTED/);
    expect(() => recordMechanicalLiftingContext(store, actor, { ...bound, recordId: "lift-calc", subjectKind: "LIFTING_POINT_CONTEXT", statement: "Analyze the lift", sourceBasis: "R4_VENDOR_EVIDENCE", sourceRef: vendorData.recordId, sourceRevision: "C", adoptionRationale: "No", liftingAnalysis: true })).toThrow(/LIFTING_ANALYSIS_REJECTED/);
    expect(() => recordMechanicalLiftingContext(store, actor, { ...bound, recordId: "rigging", subjectKind: "TEMPORARY_HANDLING", statement: "Design the rigging", sourceBasis: "R4_VENDOR_EVIDENCE", sourceRef: vendorData.recordId, sourceRevision: "C", adoptionRationale: "No", riggingDesign: true })).toThrow(/RIGGING_DESIGN_REJECTED/);
    expect(() => recordMechanicalLiftingContext(store, actor, { ...bound, recordId: "structural-lift", subjectKind: "LIFTING_ORIENTATION", statement: "Check the structure", sourceBasis: "R4_VENDOR_EVIDENCE", sourceRef: vendorData.recordId, sourceRevision: "C", adoptionRationale: "No", structuralLifting: true })).toThrow(/STRUCTURAL_LIFTING_REJECTED/);
    expect(() => recordMechanicalPackageContext(store, actor, { ...bound, recordId: "inferred-package", subjectKind: "PACKAGE_CONTAINMENT", statement: "Infer the package", sourceBasis: "GOVERNED_PROJECT_REQUIREMENT", sourceRef: "pkg-req-1", sourceRevision: "A", adoptionRationale: "No", inferMembership: true })).toThrow(/INFERRED_PACKAGE_MEMBERSHIP_REJECTED/);
    expect(() => recordMechanicalPackageContext(store, actor, { ...bound, recordId: "class-package", subjectKind: "PACKAGE_CONTAINMENT", statement: "Package without membership", sourceBasis: "GOVERNED_PROJECT_REQUIREMENT", sourceRef: "pkg-req-1", sourceRevision: "A", adoptionRationale: "No" })).toThrow(/PACKAGE_MEMBERSHIP_REQUIRED/);
    expect(() => recordMechanicalMaintainabilityContext(store, actor, { ...bound, recordId: "mutate", subjectKind: "MAINTENANCE_ENVELOPE", statement: "Rewrite the requirement", sourceBasis: "R5_MECHANICAL_TECHNICAL_REQUIREMENT", sourceRef: requirement.recordId, sourceRevision: "A", adoptionRationale: "No", mutateR5: true })).toThrow(/R5_MUTATION_REJECTED/);
    expect(() => recordMechanicalMaintainabilityContext(store, { ...actor, actorId: "AI-assistant" }, { ...bound, recordId: "ai", subjectKind: "MAINTENANCE_ENVELOPE", statement: "Invented envelope", sourceBasis: "PROJECT_SPECIFICATION", sourceRef: "spec-100", sourceRevision: "A", adoptionRationale: "No" })).toThrow(/AI_NOT_MECHANICAL_AUTHORITY/);
    expect(() => recordMechanicalMaintainabilityContext(store, { ...actor, actorId: "ADMIN", authority: "ADMIN" }, { ...bound, recordId: "admin", subjectKind: "MAINTENANCE_ENVELOPE", statement: "Admin envelope", sourceBasis: "PROJECT_SPECIFICATION", sourceRef: "spec-100", sourceRevision: "A", adoptionRationale: "No" })).toThrow(/ADMIN_NOT_MECHANICAL_AUTHORITY/);
    expect(() => recordMechanicalMaintainabilityContext(store, actor, { ...bound, tenantId: "tenant-b", recordId: "cross", subjectKind: "MAINTENANCE_ENVELOPE", statement: "Cross tenant", sourceBasis: "PROJECT_SPECIFICATION", sourceRef: "spec-100", sourceRevision: "A", adoptionRationale: "No" })).toThrow(/SCOPE_MISMATCH/);
    expect(() => recordMechanicalAccessClearanceContext(store, actor, { ...bound, recordId: "unit-spoof", subjectKind: "MINIMUM_CLEARANCE", statement: "Converted clearance", sourceBasis: "PROJECT_SPECIFICATION", sourceRef: "spec-100", sourceRevision: "A", suppliedValue: "800", unit: "mm", normalizedUnit: "m", adoptionRationale: "No" })).toThrow(/UNIT_CHANGE_REJECTED/);
    expect(verifyClearance).toThrow(/CLEARANCE_VERIFICATION_REJECTED/);
    expect(detectSpatialClash).toThrow(/SPATIAL_ANALYSIS_REJECTED/);
    expect(solveAccessPath).toThrow(/ACCESS_PATH_SOLVER_REJECTED/);
    expect(solveRemovalRoute).toThrow(/REMOVAL_ROUTE_SOLVER_REJECTED/);
    expect(optimizeLayout).toThrow(/LAYOUT_OPTIMIZATION_REJECTED/);
    expect(analyzeLifting).toThrow(/LIFTING_ANALYSIS_REJECTED/);
    expect(designRigging).toThrow(/RIGGING_DESIGN_REJECTED/);
    expect(verifyStructuralLifting).toThrow(/STRUCTURAL_LIFTING_REJECTED/);
    expect(adoptVendorMaintenanceRequirement).toThrow(/VENDOR_AUTO_ADOPTION_REJECTED/);
    expect(reviseRequirementFromContext).toThrow(/R5_REQUIREMENT_MUTATION_REJECTED/);
    expect(rewriteTechnicalContext).toThrow(/R5_TECHNICAL_CONTEXT_MUTATION_REJECTED/);
    expect(applyChangedSourceToContext).toThrow(/SOURCE_CHANGE_AUTO_UPDATE_REJECTED/);
    expect(repointContext).toThrow(/SOURCE_AUTO_REPOINT_REJECTED/);
    expect(mutateContext).toThrow(/SILENT_MUTATION_REJECTED/);
    expect(sizeMechanicalEquipment).toThrow(/EQUIPMENT_SIZING_REJECTED/);
    expect(propagateContextChange).toThrow(/CHANGE_PROPAGATION_REJECTED/);
    expect(openDisciplineInterface).toThrow(/DISCIPLINE_INTERFACE_REJECTED/);
    expect(validateMaintenanceEnvelope).toThrow(/VALIDATION_RUNTIME_REJECTED/);
    expect(determineConformance).toThrow(/CONFORMANCE_RUNTIME_REJECTED/);
    expect(approveContext).toThrow(/APPROVAL_RUNTIME_REJECTED/);
    expect(certifyContext).toThrow(/CERTIFICATION_RUNTIME_REJECTED/);
    expect(concludeCrossDisciplineConflict).toThrow(/CROSS_DISCIPLINE_REASONING_REJECTED/);

    const replay = recordMechanicalMaintainabilityContext(store, actor, {
      ...bound,
      recordId: "maint-envelope",
      subjectKind: "MAINTENANCE_ENVELOPE",
      statement: "Maintain a service envelope around the non-drive end",
      sourceBasis: "R5_MECHANICAL_TECHNICAL_REQUIREMENT",
      sourceRef: requirement.recordId,
      sourceRevision: "A",
      adoptionRationale: "Adopted from the project maintenance requirement",
    });
    expect(replay.recordId).toBe(envelope.recordId);
    expect(() => recordMechanicalMaintainabilityContext(store, actor, {
      ...bound,
      recordId: "maint-dup",
      subjectKind: "MAINTENANCE_ENVELOPE",
      statement: "Maintain a service envelope around the non-drive end",
      sourceBasis: "R5_MECHANICAL_TECHNICAL_REQUIREMENT",
      sourceRef: requirement.recordId,
      sourceRevision: "A",
      adoptionRationale: "Adopted from the project maintenance requirement",
    })).toThrow(/DUPLICATE_RECORD_REJECTED/);
    const preserved = envelope.fingerprint;
    const preservedRevision = envelope.sourceRevision;
    const successor = recordMechanicalMaintainabilityContext(store, actor, {
      ...bound,
      recordId: "maint-envelope-b",
      predecessorRecordId: envelope.recordId,
      subjectKind: "MAINTENANCE_ENVELOPE",
      statement: "Maintain a revised service envelope around the non-drive end",
      sourceBasis: "R5_MECHANICAL_TECHNICAL_REQUIREMENT",
      sourceRef: requirement.recordId,
      sourceRevision: "B",
      adoptionRationale: "Explicit new revision",
    });
    expect(successor.sourceRevision).toBe("B");
    expect(successor.engineeringValidated).toBe(false);
    expect(successor.predecessorFingerprint).toBe(preserved);
    expect(envelope.sourceRevision).toBe(preservedRevision);
    expect(envelope.fingerprint).toBe(preserved);
    expect(envelope.recordStatus).toBe("SUPERSEDED");
    expect(requirement.requirementStatement).toBe(preservedRequirement);
    expect(requirement.fingerprint).toBe(preservedFingerprint);
    expect(vendorData.suppliedValue).toBe("500");

    const here = dirname(fileURLToPath(import.meta.url));
    const sourceText = readFileSync(join(here, "maintainability-access-package-context.ts"), "utf8");
    expect(sourceText).toContain("fingerprintCanonical");
    expect(sourceText).not.toMatch(/createHash|from ["']@rtb\/engineering-review["']|CREATE TABLE/);
    expect(scanAnalysisFormulaBypass(join(here, "maintainability-access-package-context.ts"), sourceText)).toEqual([]);
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
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D4.R6.MAINTAINABILITY_ACCESS_AND_PACKAGE_CONTEXT")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D4.R7.REQUIREMENTS_ASSUMPTIONS_AND_CHANGE")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
  });
});
