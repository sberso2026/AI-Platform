import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { D2_TRACK_COMPLETE } from "../civil/civil-bounded-closeout";
import { D2_REOPENED, D3_TRACK_COMPLETE, D4_0_STARTED } from "../geotechnical/geotechnical-bounded-closeout";
import { STRUCTURAL_CAPABILITY_MANIFEST } from "../structural-concrete/capability";
import { scanAnalysisFormulaBypass } from "../structural-systems/formula-scan";
import { D1_STRUCTURAL_PACK_COMPLETE, D1N_REOPENED } from "../structural-systems/structural-pack-sequencing";
import { D4_CONTEXT_AUTHORITY, D4_RUNTIME_COUNT as R1_RUNTIME_COUNT, createD4R1Store, recordMechanicalContext, recordMechanicalObjectIdentity, type D4R1Actor } from "./identity-foundation";
import { D4_RUNTIME_COUNT as R2_RUNTIME_COUNT, createD4R2Store, recordMechanicalEquipmentClassification } from "./equipment-system-context";
import { D4_RUNTIME_COUNT as R3_RUNTIME_COUNT, createD4R3Store, recordMechanicalDesignCondition } from "./design-condition-performance-context";
import { D4_RUNTIME_COUNT as R4_RUNTIME_COUNT, createD4R4Store, recordMechanicalVendorData, recordMechanicalVendorDocument } from "./vendor-data-evidence-context";
import { D4_RUNTIME_COUNT as R5_RUNTIME_COUNT, createD4R5Store, recordMechanicalTechnicalRequirement } from "./mechanical-technical-context";
import {
  D4_R7_STARTED,
  D4_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_COUNT as R6_CHANGE_COUNT,
  D4_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY as R6_CHANGE_READY,
  D4_RUNTIME_COUNT as R6_RUNTIME_COUNT,
  createD4R6Store,
  recordMechanicalMaintainabilityContext,
} from "./maintainability-access-package-context";
import {
  ADMIN_ACTION_EQUALS_ENGINEERING_DECISION,
  ADMIN_CAN_CREATE_ENGINEERING_AUTHORITY_BY_ACTION,
  AI_CAN_CLOSE_D4_REASSESSMENT_AS_ENGINEERING_COMPLETE,
  AI_CAN_CREATE_AUTHORITATIVE_D4_ENGINEERING_DECISION,
  AI_CAN_INVENT_AUTHORITATIVE_D4_ASSUMPTION,
  AI_CAN_INVENT_AUTHORITATIVE_D4_REQUIREMENT,
  AI_EQUALS_D4_MECHANICAL_ENGINEERING_AUTHORITY,
  AI_RECOMMENDATION_EQUALS_ENGINEERING_DECISION,
  ASSUMPTION_EQUALS_ENGINEERING_VALIDATED,
  ASSUMPTION_EQUALS_VALIDATED_FACT,
  CHANGE_ACCEPTED_EQUALS_ENGINEERING_VALIDATED,
  D1_STRUCTURAL_PACK_COMPLETE as R7_D1,
  D1N_REOPENED as R7_D1N,
  D2_REOPENED as R7_D2_REOPENED,
  D2_TRACK_COMPLETE as R7_D2,
  D3_REOPENED,
  D3_TRACK_COMPLETE as R7_D3,
  D3_TRACK_COMPLETION_CLASSIFICATION,
  D4_ACCESS_PATH_SOLVER_RUNTIME_COUNT,
  D4_APPROVAL_RUNTIME_COUNT,
  D4_ASSUMPTION_GOVERNANCE_IMPLEMENTED,
  D4_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT,
  D4_CERTIFICATION_RUNTIME_COUNT,
  D4_CHANGE_AUTO_APPROVES_ENGINEERING,
  D4_CHANGE_AUTO_RECALCULATES_ENGINEERING,
  D4_CHANGE_AUTO_REDESIGNS_ENGINEERING,
  D4_CHANGE_AUTO_REVALIDATES_ENGINEERING,
  D4_CHANGE_GOVERNANCE_IMPLEMENTED,
  D4_CONFORMANCE_DETERMINATION_RUNTIME_COUNT,
  D4_CROSS_DISCIPLINE_CONFLICT_DETECTION_RUNTIME_COUNT,
  D4_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT,
  D4_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT,
  D4_CROSS_DISCIPLINE_RECOMMENDATION_RUNTIME_COUNT,
  D4_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT,
  D4_D9_RUNTIME_INTEGRATION_COUNT,
  D4_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
  D4_DISCIPLINE_INTERFACE_RUNTIME_COUNT,
  D4_ENGINEERING_DECISION_GOVERNANCE_IMPLEMENTED,
  D4_EQUALS_D1_STRUCTURAL_AUTHORITY,
  D4_EQUALS_D2_CIVIL_AUTHORITY,
  D4_EQUALS_D3_GEOTECHNICAL_AUTHORITY,
  D4_EQUALS_D5_PIPING_AUTHORITY,
  D4_EQUALS_D8_INSTRUMENTATION_CONTROL_AUTHORITY,
  D4_EQUIPMENT_SIZING_RUNTIME_COUNT,
  D4_EXPLICIT_CHANGE_DEPENDENCIES_SUPPORTED,
  D4_FATIGUE_ANALYSIS_RUNTIME_COUNT,
  D4_INFERRED_CHANGE_DEPENDENCY_ALLOWED,
  D4_LAYOUT_OPTIMIZATION_RUNTIME_COUNT,
  D4_MAINTAINABILITY_ACCESS_PACKAGE_RUNTIME_READY_REUSED,
  D4_MECHANICAL_DESIGN_OPTIMIZATION_RUNTIME_COUNT,
  D4_MECHANICAL_LOAD_CALCULATION_RUNTIME_COUNT,
  D4_MECHANICAL_TECHNICAL_CONTEXT_RUNTIME_READY_REUSED,
  D4_R1_R6_EXACT_SUBJECT_REVISIONS_REUSED,
  D4_R6_RUNTIME_COUNT_REUSED,
  D4_R7_AUTO_MUTATES_R3_DESIGN_CONDITION,
  D4_R7_AUTO_MUTATES_R3_PERFORMANCE_CONTEXT,
  D4_R7_AUTO_PERFORMS_LIFTING_ANALYSIS,
  D4_R7_AUTO_RECALCULATES_CLEARANCE,
  D4_R7_AUTO_RECALCULATES_R3_DESIGN_CONDITION,
  D4_R7_AUTO_REDESIGNS_PACKAGE_ARRANGEMENT,
  D4_R7_AUTO_REWRITES_R5_REQUIREMENT,
  D4_R7_AUTO_REWRITES_R5_TECHNICAL_CONTEXT,
  D4_R7_AUTO_SOLVES_ACCESS_PATH,
  D4_R7_AUTO_SOLVES_REMOVAL_ROUTE,
  D4_R7_BLOCKER,
  D4_R7_CANONICAL_NEXT_PHASE,
  D4_R7_CANONICAL_NEXT_PHASE_SCOPE,
  D4_R7_DUPLICATE_GOVERNANCE_IMPLEMENTED,
  D4_R7_HIDDEN_CALCULATION_ALLOWED,
  D4_R7_HISTORY_PRESERVED,
  D4_R7_MATURITY,
  D4_R7_NEXT_PHASE_TYPE,
  D4_R7_PROVENANCE_PRESERVED,
  D4_R7_PROVENANCE_REQUIRED,
  D4_R7_R3_CHANGE_GOVERNANCE_INTEGRATED,
  D4_R7_R4_VENDOR_CHANGE_GOVERNANCE_INTEGRATED,
  D4_R7_R5_TECHNICAL_REQUIREMENT_CHANGE_GOVERNANCE_INTEGRATED,
  D4_R7_R6_MAINTAINABILITY_CHANGE_GOVERNANCE_INTEGRATED,
  D4_R7_REPLAY_PROTECTION_IMPLEMENTED,
  D4_R7_SPOOFING_PROTECTION_IMPLEMENTED,
  D4_R7_STATUS,
  D4_R7_SUBJECT_AUTO_REPOINTED,
  D4_R7_SUPERSESSION_GOVERNANCE_IMPLEMENTED,
  D4_R8_STARTED,
  D4_REASSESSMENT_COMPLETED_STATE_IMPLEMENTED,
  D4_REASSESSMENT_REQUIRED_STATE_IMPLEMENTED,
  D4_REMOVAL_ROUTE_SOLVER_RUNTIME_COUNT,
  D4_REQUIREMENT_GOVERNANCE_IMPLEMENTED,
  D4_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_COUNT,
  D4_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_IMPLEMENTED,
  D4_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY,
  D4_REUSES_CANONICAL_ASSUMPTION_GOVERNANCE,
  D4_REUSES_CANONICAL_CHANGE_GOVERNANCE,
  D4_REUSES_CANONICAL_CURRENTNESS,
  D4_REUSES_CANONICAL_DECISION_GOVERNANCE,
  D4_REUSES_CANONICAL_FINGERPRINT,
  D4_REUSES_CANONICAL_REQUIREMENT_GOVERNANCE,
  D4_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_COUNT,
  D4_ROTATING_EQUIPMENT_CALCULATION_RUNTIME_COUNT,
  D4_RUNTIME_COUNT,
  D4_RUNTIME_STARTED,
  D4_SPATIAL_CLASH_DETECTION_RUNTIME_COUNT,
  D4_STATIC_EQUIPMENT_CALCULATION_RUNTIME_COUNT,
  D4_THERMAL_MECHANICAL_CALCULATION_RUNTIME_COUNT,
  D4_VIBRATION_ANALYSIS_RUNTIME_COUNT,
  D5_RUNTIME_STARTED,
  D6_RUNTIME_STARTED,
  D7_RUNTIME_STARTED,
  D8_RUNTIME_STARTED,
  D9_RUNTIME_COUNT,
  D9_RUNTIME_STARTED,
  DATABASE_SCHEMA_CHANGED,
  DECISION_RECORDED_EQUALS_ENGINEERING_VALIDATED,
  ENGINEERING_CONTEXT_AUTO_OVERRIDES_VENDOR_EVIDENCE,
  EXACT_D4_R7_SUBJECT_REVISION_REQUIRED,
  FLOATING_D4_R7_SUBJECT_REFERENCE_ALLOWED,
  NEW_DEPENDENCY_ADDED,
  NEW_VENDOR_REVISION_AUTO_ADOPTED_AS_ENGINEERING,
  PARALLEL_D4_ASSUMPTION_ENGINE_CREATED,
  PARALLEL_D4_CHANGE_ENGINE_CREATED,
  PARALLEL_D4_CURRENTNESS_ENGINE_CREATED,
  PARALLEL_D4_DECISION_ENGINE_CREATED,
  PARALLEL_D4_REQUIREMENT_ENGINE_CREATED,
  REASSESSMENT_COMPLETED_EQUALS_APPROVED,
  REASSESSMENT_COMPLETED_EQUALS_ENGINEERING_VALIDATED,
  REASSESSMENT_COMPLETED_EQUALS_VALIDATED,
  REASSESSMENT_REQUIRED_EQUALS_INVALID,
  REASSESSMENT_REQUIRED_EQUALS_RECALCULATED,
  REASSESSMENT_REQUIRED_EQUALS_REDESIGNED,
  REASSESSMENT_REQUIRED_EQUALS_VALIDATED,
  REQUIREMENT_PRESENT_EQUALS_CONFORMANT,
  REQUIREMENT_PRESENT_EQUALS_VALIDATED,
  SECOND_D4_FINGERPRINT_ALGORITHM_CREATED,
  SILENT_D4_R7_MUTATION_ALLOWED,
  SOURCE_REQUIREMENT_EQUALS_ADOPTED_MECHANICAL_REQUIREMENT,
  SUPERSEDED_D4_RECORD_AUTO_REPLACED_IN_HISTORY,
  SUPERSEDED_D4_RECORD_EQUALS_DELETED,
  SUPERSEDED_D4_RECORD_EQUALS_INVALID,
  TENANT_WORKSPACE_PROJECT_D4_R7_SCOPE_ENFORCED,
  VENDOR_CHANGE_AUTO_OVERRIDES_ENGINEERING,
  adoptVendorRevision,
  analyzeLifting,
  approveChange,
  certifyChange,
  closeReassessmentAsEngineeringComplete,
  createD4R7Store,
  inferChangeDependency,
  mutateDesignCondition,
  mutateGovernance,
  openDisciplineInterface,
  overrideEngineeringWithVendor,
  overrideVendorWithEngineering,
  recalculateClearance,
  recalculateFromChange,
  recordMechanicalAssumption,
  recordMechanicalChange,
  recordMechanicalEngineeringDecision,
  recordMechanicalGovernedRequirement,
  recordMechanicalGovernedSourceRequirement,
  recordMechanicalReassessment,
  redesignFromChange,
  redesignPackageArrangement,
  repointGovernance,
  rewriteTechnicalRequirement,
  sizeMechanicalEquipment,
  solveAccessPath,
  solveRemovalRoute,
  validateChange,
} from "./requirements-assumptions-change";

const actor: D4R1Actor = {
  actorId: "mechanical-recorder",
  tenantId: "tenant-a",
  workspaceId: "workspace-a",
  projectId: "project-a",
  authority: D4_CONTEXT_AUTHORITY,
};

describe("EOS-D4-R7 Requirements assumptions and change", () => {
  it("governs Mechanical change on exact R1-R6 revisions without performing the engineering", () => {
    expect(D4_R7_STATUS).toBe("REQUIREMENTS_ASSUMPTIONS_AND_CHANGE_IMPLEMENTED");
    expect(D4_R7_MATURITY).toBe(D4_R7_STATUS);
    expect(D4_RUNTIME_STARTED).toBe(true);
    expect(D4_RUNTIME_COUNT).toBe(7);
    expect(R1_RUNTIME_COUNT).toBe(1);
    expect(R2_RUNTIME_COUNT).toBe(2);
    expect(R3_RUNTIME_COUNT).toBe(3);
    expect(R4_RUNTIME_COUNT).toBe(4);
    expect(R5_RUNTIME_COUNT).toBe(5);
    expect(R6_RUNTIME_COUNT).toBe(6);
    expect(D4_R6_RUNTIME_COUNT_REUSED).toBe(6);
    expect(R6_CHANGE_READY).toBe(false);
    expect(R6_CHANGE_COUNT).toBe(0);
    expect(D4_R7_STARTED).toBe(false);
    expect(D4_R8_STARTED).toBe(false);
    expect(D4_0_STARTED).toBe(false);
    expect(D4_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_IMPLEMENTED).toBe(true);
    expect(D4_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_COUNT).toBe(1);
    expect(D4_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY).toBe(true);
    expect(D4_MECHANICAL_TECHNICAL_CONTEXT_RUNTIME_READY_REUSED).toBe(true);
    expect(D4_MAINTAINABILITY_ACCESS_PACKAGE_RUNTIME_READY_REUSED).toBe(true);
    expect(D4_REUSES_CANONICAL_REQUIREMENT_GOVERNANCE).toBe(true);
    expect(D4_REUSES_CANONICAL_ASSUMPTION_GOVERNANCE).toBe(true);
    expect(D4_REUSES_CANONICAL_DECISION_GOVERNANCE).toBe(true);
    expect(D4_REUSES_CANONICAL_CHANGE_GOVERNANCE).toBe(true);
    expect(PARALLEL_D4_REQUIREMENT_ENGINE_CREATED).toBe(false);
    expect(PARALLEL_D4_ASSUMPTION_ENGINE_CREATED).toBe(false);
    expect(PARALLEL_D4_DECISION_ENGINE_CREATED).toBe(false);
    expect(PARALLEL_D4_CHANGE_ENGINE_CREATED).toBe(false);
    expect(D4_R1_R6_EXACT_SUBJECT_REVISIONS_REUSED).toBe(true);
    expect(EXACT_D4_R7_SUBJECT_REVISION_REQUIRED).toBe(true);
    expect(FLOATING_D4_R7_SUBJECT_REFERENCE_ALLOWED).toBe(false);
    expect(D4_R7_SUBJECT_AUTO_REPOINTED).toBe(false);
    expect(D4_REQUIREMENT_GOVERNANCE_IMPLEMENTED).toBe(true);
    expect(D4_ASSUMPTION_GOVERNANCE_IMPLEMENTED).toBe(true);
    expect(D4_ENGINEERING_DECISION_GOVERNANCE_IMPLEMENTED).toBe(true);
    expect(D4_CHANGE_GOVERNANCE_IMPLEMENTED).toBe(true);
    expect(SOURCE_REQUIREMENT_EQUALS_ADOPTED_MECHANICAL_REQUIREMENT).toBe(false);
    expect(REQUIREMENT_PRESENT_EQUALS_VALIDATED).toBe(false);
    expect(REQUIREMENT_PRESENT_EQUALS_CONFORMANT).toBe(false);
    expect(ASSUMPTION_EQUALS_VALIDATED_FACT).toBe(false);
    expect(ASSUMPTION_EQUALS_ENGINEERING_VALIDATED).toBe(false);
    expect(AI_CAN_INVENT_AUTHORITATIVE_D4_ASSUMPTION).toBe(false);
    expect(AI_CAN_INVENT_AUTHORITATIVE_D4_REQUIREMENT).toBe(false);
    expect(AI_RECOMMENDATION_EQUALS_ENGINEERING_DECISION).toBe(false);
    expect(ADMIN_ACTION_EQUALS_ENGINEERING_DECISION).toBe(false);
    expect(AI_CAN_CREATE_AUTHORITATIVE_D4_ENGINEERING_DECISION).toBe(false);
    expect(ADMIN_CAN_CREATE_ENGINEERING_AUTHORITY_BY_ACTION).toBe(false);
    expect(D4_EXPLICIT_CHANGE_DEPENDENCIES_SUPPORTED).toBe(true);
    expect(D4_INFERRED_CHANGE_DEPENDENCY_ALLOWED).toBe(false);
    expect(D4_R7_SUPERSESSION_GOVERNANCE_IMPLEMENTED).toBe(true);
    expect(SUPERSEDED_D4_RECORD_EQUALS_DELETED).toBe(false);
    expect(SUPERSEDED_D4_RECORD_EQUALS_INVALID).toBe(false);
    expect(SUPERSEDED_D4_RECORD_AUTO_REPLACED_IN_HISTORY).toBe(false);
    expect(D4_REASSESSMENT_REQUIRED_STATE_IMPLEMENTED).toBe(true);
    expect(D4_REASSESSMENT_COMPLETED_STATE_IMPLEMENTED).toBe(true);
    expect(REASSESSMENT_REQUIRED_EQUALS_INVALID).toBe(false);
    expect(REASSESSMENT_REQUIRED_EQUALS_RECALCULATED).toBe(false);
    expect(REASSESSMENT_REQUIRED_EQUALS_REDESIGNED).toBe(false);
    expect(REASSESSMENT_REQUIRED_EQUALS_VALIDATED).toBe(false);
    expect(REASSESSMENT_COMPLETED_EQUALS_VALIDATED).toBe(false);
    expect(REASSESSMENT_COMPLETED_EQUALS_APPROVED).toBe(false);
    expect(REASSESSMENT_COMPLETED_EQUALS_ENGINEERING_VALIDATED).toBe(false);
    expect(D4_CHANGE_AUTO_RECALCULATES_ENGINEERING).toBe(false);
    expect(D4_CHANGE_AUTO_REDESIGNS_ENGINEERING).toBe(false);
    expect(D4_CHANGE_AUTO_REVALIDATES_ENGINEERING).toBe(false);
    expect(D4_CHANGE_AUTO_APPROVES_ENGINEERING).toBe(false);
    expect(D4_R7_R3_CHANGE_GOVERNANCE_INTEGRATED).toBe(true);
    expect(D4_R7_AUTO_MUTATES_R3_DESIGN_CONDITION).toBe(false);
    expect(D4_R7_AUTO_MUTATES_R3_PERFORMANCE_CONTEXT).toBe(false);
    expect(D4_R7_AUTO_RECALCULATES_R3_DESIGN_CONDITION).toBe(false);
    expect(D4_R7_R4_VENDOR_CHANGE_GOVERNANCE_INTEGRATED).toBe(true);
    expect(NEW_VENDOR_REVISION_AUTO_ADOPTED_AS_ENGINEERING).toBe(false);
    expect(VENDOR_CHANGE_AUTO_OVERRIDES_ENGINEERING).toBe(false);
    expect(ENGINEERING_CONTEXT_AUTO_OVERRIDES_VENDOR_EVIDENCE).toBe(false);
    expect(D4_R7_R5_TECHNICAL_REQUIREMENT_CHANGE_GOVERNANCE_INTEGRATED).toBe(true);
    expect(D4_R7_AUTO_REWRITES_R5_REQUIREMENT).toBe(false);
    expect(D4_R7_AUTO_REWRITES_R5_TECHNICAL_CONTEXT).toBe(false);
    expect(D4_R7_R6_MAINTAINABILITY_CHANGE_GOVERNANCE_INTEGRATED).toBe(true);
    expect(D4_R7_AUTO_RECALCULATES_CLEARANCE).toBe(false);
    expect(D4_R7_AUTO_SOLVES_ACCESS_PATH).toBe(false);
    expect(D4_R7_AUTO_SOLVES_REMOVAL_ROUTE).toBe(false);
    expect(D4_R7_AUTO_REDESIGNS_PACKAGE_ARRANGEMENT).toBe(false);
    expect(D4_R7_AUTO_PERFORMS_LIFTING_ANALYSIS).toBe(false);
    expect(AI_EQUALS_D4_MECHANICAL_ENGINEERING_AUTHORITY).toBe(false);
    expect(AI_CAN_CLOSE_D4_REASSESSMENT_AS_ENGINEERING_COMPLETE).toBe(false);
    expect(CHANGE_ACCEPTED_EQUALS_ENGINEERING_VALIDATED).toBe(false);
    expect(DECISION_RECORDED_EQUALS_ENGINEERING_VALIDATED).toBe(false);
    expect(D4_REUSES_CANONICAL_CURRENTNESS).toBe(true);
    expect(PARALLEL_D4_CURRENTNESS_ENGINE_CREATED).toBe(false);
    expect(D4_REUSES_CANONICAL_FINGERPRINT).toBe(true);
    expect(SECOND_D4_FINGERPRINT_ALGORITHM_CREATED).toBe(false);
    expect(D4_R7_PROVENANCE_REQUIRED).toBe(true);
    expect(D4_R7_PROVENANCE_PRESERVED).toBe(true);
    expect(SILENT_D4_R7_MUTATION_ALLOWED).toBe(false);
    expect(D4_R7_HISTORY_PRESERVED).toBe(true);
    expect(TENANT_WORKSPACE_PROJECT_D4_R7_SCOPE_ENFORCED).toBe(true);
    expect(D4_R7_HIDDEN_CALCULATION_ALLOWED).toBe(false);
    expect(D4_EQUALS_D1_STRUCTURAL_AUTHORITY).toBe(false);
    expect(D4_EQUALS_D2_CIVIL_AUTHORITY).toBe(false);
    expect(D4_EQUALS_D3_GEOTECHNICAL_AUTHORITY).toBe(false);
    expect(D4_EQUALS_D5_PIPING_AUTHORITY).toBe(false);
    expect(D4_EQUALS_D8_INSTRUMENTATION_CONTROL_AUTHORITY).toBe(false);
    expect(D4_R7_DUPLICATE_GOVERNANCE_IMPLEMENTED).toBe(true);
    expect(D4_R7_REPLAY_PROTECTION_IMPLEMENTED).toBe(true);
    expect(D4_R7_SPOOFING_PROTECTION_IMPLEMENTED).toBe(true);
    expect([
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
      D4_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT,
      D4_CONFORMANCE_DETERMINATION_RUNTIME_COUNT,
      D4_APPROVAL_RUNTIME_COUNT,
      D4_CERTIFICATION_RUNTIME_COUNT,
      D4_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT,
      D4_CROSS_DISCIPLINE_CONFLICT_DETECTION_RUNTIME_COUNT,
      D4_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT,
      D4_CROSS_DISCIPLINE_RECOMMENDATION_RUNTIME_COUNT,
      D4_D9_RUNTIME_INTEGRATION_COUNT,
    ]).toEqual(Array(25).fill(0));
    expect(D5_RUNTIME_STARTED).toBe(false);
    expect(D9_RUNTIME_STARTED).toBe(false);
    expect(D9_RUNTIME_COUNT).toBe(0);
    expect(D6_RUNTIME_STARTED).toBe(false);
    expect(D7_RUNTIME_STARTED).toBe(false);
    expect(D8_RUNTIME_STARTED).toBe(false);
    expect(DATABASE_SCHEMA_CHANGED).toBe(false);
    expect(NEW_DEPENDENCY_ADDED).toBe(false);
    expect(R7_D1).toBe(false);
    expect(D1_STRUCTURAL_PACK_COMPLETE).toBe(false);
    expect(R7_D1N).toBe(false);
    expect(D1N_REOPENED).toBe(false);
    expect(R7_D2).toBe(true);
    expect(D2_TRACK_COMPLETE).toBe(true);
    expect(R7_D2_REOPENED).toBe(false);
    expect(D2_REOPENED).toBe(false);
    expect(R7_D3).toBe(true);
    expect(D3_TRACK_COMPLETE).toBe(true);
    expect(D3_TRACK_COMPLETION_CLASSIFICATION).toBe("COMPLETE_BOUNDED_WITH_LIMITATIONS");
    expect(D3_REOPENED).toBe(false);
    expect(D4_R7_CANONICAL_NEXT_PHASE).toBe("EOS-D4-R8-DISCIPLINE-INTERFACES-AND-HANDOFFS");
    expect(D4_R7_NEXT_PHASE_TYPE).toBe("DISCIPLINE_INTERFACES_AND_HANDOFFS");
    expect(D4_R7_CANONICAL_NEXT_PHASE_SCOPE).toContain("Do not fabricate missing counterpart information");
    expect(D4_R7_BLOCKER).toBe("NONE");

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
    const store = createD4R7Store(r6);
    const subject = {
      tenantId: actor.tenantId, workspaceId: actor.workspaceId, projectId: actor.projectId, contextId: context.contextId, objectId: equipment.objectId, objectRevisionFingerprint: equipment.fingerprint,
      r2SubjectKind: "CLASSIFICATION" as const, r2SubjectId: classification.classificationId, r2RevisionFingerprint: classification.fingerprint,
      r3RecordId: design.recordId, r3RevisionFingerprint: design.fingerprint, r4RecordId: vendorData.recordId, r4RevisionFingerprint: vendorData.fingerprint,
      r5RecordId: requirement.recordId, r5RevisionFingerprint: requirement.fingerprint, r6RecordId: envelope.recordId, r6RevisionFingerprint: envelope.fingerprint,
      citedCurrentness: "CURRENT" as const, citedLifecycleStage: "FEED", applicability: "PLANNED_MAINTENANCE", limitations: "This pump only", provenanceRef: "prov-r7",
    };
    const source = recordMechanicalGovernedSourceRequirement(store, actor, {
      ...subject, requirementContextId: "gov-source", statement: "Project specification states a maintenance envelope", sourceBasis: "PROJECT_SPECIFICATION", sourceRef: "spec-100", sourceRevision: "A",
    });
    expect(source.adopted).toBe(false);
    expect(source.engineeringValidated).toBe(false);
    expect(source.conformant).toBe(false);
    expect(source.r6RevisionFingerprint).toBe(envelope.fingerprint);
    const adopted = recordMechanicalGovernedRequirement(store, actor, {
      ...subject, requirementContextId: "gov-adopted", statement: "Adopt the maintenance envelope for this pump", sourceBasis: "PROJECT_SPECIFICATION", sourceRef: "spec-100", sourceRevision: "A", adoptionRationale: "Mechanical context adoption",
    });
    expect(adopted.adopted).toBe(true);
    expect(adopted.engineeringValidated).toBe(false);
    expect(source.adopted).toBe(false);
    const assumption = recordMechanicalAssumption(store, actor, { ...subject, assumptionContextId: "assume-1", statement: "Cartridge removal remains along the drive axis", basis: "MAINTENANCE_STRATEGY", materiality: "high" });
    expect(assumption.validationStatus).toBe("unvalidated");
    expect(assumption.validatedFact).toBe(false);
    const decision = recordMechanicalEngineeringDecision(store, actor, {
      ...subject, decisionContextId: "decision-1", statement: "Keep the coupling side as the service side", basis: "AUTHORIZED_MECHANICAL_INPUT",
      alternatives: [{ id: "alt-a", statement: "Service from the coupling side", is_selected: true }, { id: "alt-b", statement: "Service from the opposite side", is_selected: false }],
    });
    expect(decision.authoritativeDecision).toBe(true);
    expect(decision.aiRecommendation).toBe(false);
    expect(decision.engineeringValidated).toBe(false);
    const change = recordMechanicalChange(store, actor, {
      ...subject, changeContextId: "change-1", changeCategory: "MAINTAINABILITY_CONTEXT_CHANGED", originRef: "spec-100-rev-b", reason: "Maintenance case revision requires reassessment",
      dependencies: [{ kind: "OBJECT_REFERENCE", targetKind: "R6_MAINTAINABILITY", targetId: envelope.recordId, targetFingerprint: envelope.fingerprint }],
    });
    expect(change.vendorAdopted).toBe(false);
    expect(change.recalculated).toBe(false);
    expect(change.redesigned).toBe(false);
    expect(design.suppliedValue).toBe("10");
    expect(design.fingerprint).toBe(subject.r3RevisionFingerprint);
    expect(requirement.requirementStatement).toBe("Provide a governed maintenance envelope for this pump");
    expect(envelope.statement).toBe("Maintain a service envelope around the non-drive end");
    expect(vendorData.suppliedValue).toBe("500");
    const required = recordMechanicalReassessment(store, actor, { ...subject, reassessmentContextId: "reassess-required", changeContextId: change.changeContextId, targetId: envelope.recordId, targetFingerprint: envelope.fingerprint, state: "REASSESSMENT_REQUIRED" });
    expect(required.state).toBe("REASSESSMENT_REQUIRED");
    expect(required.invalidated).toBe(false);
    expect(required.recalculated).toBe(false);
    expect(required.engineeringValidated).toBe(false);
    const completed = recordMechanicalReassessment(store, actor, { ...subject, reassessmentContextId: "reassess-done", changeContextId: change.changeContextId, targetId: envelope.recordId, targetFingerprint: envelope.fingerprint, state: "REASSESSMENT_COMPLETED" });
    expect(completed.state).toBe("REASSESSMENT_COMPLETED");
    expect(completed.engineeringValidated).toBe(false);
    expect(completed.engineeringApproved).toBe(false);
    expect(envelope.recordStatus).toBe("CURRENT");

    expect(() => recordMechanicalAssumption(store, actor, { ...subject, assumptionContextId: "assume-valid", statement: "Treat the assumption as fact", basis: "MAINTENANCE_STRATEGY", validationStatus: "validated" })).toThrow(/ASSUMPTION_NOT_VALIDATED_FACT/);
    expect(() => recordMechanicalEngineeringDecision(store, actor, { ...subject, decisionContextId: "decision-two", statement: "Pick both sides", basis: "AUTHORIZED_MECHANICAL_INPUT", alternatives: [{ id: "a", statement: "Side one", is_selected: true }, { id: "b", statement: "Side two", is_selected: true }] })).toThrow(/at most one alternative/);
    expect(() => recordMechanicalChange(store, actor, { ...subject, changeContextId: "change-infer", changeCategory: "MAINTAINABILITY_CONTEXT_CHANGED", originRef: "pkg", reason: "Shared package", dependencies: [{ kind: "OBJECT_REFERENCE", targetKind: "R6_MAINTAINABILITY", targetId: envelope.recordId, targetFingerprint: envelope.fingerprint, inference: "shared_package" }] })).toThrow(/INFERRED_DEPENDENCY_REJECTED/);
    expect(() => recordMechanicalChange(store, actor, { ...subject, changeContextId: "change-none", changeCategory: "DESIGN_CONDITION_CHANGED", originRef: "spec-100", reason: "No dependency", dependencies: [] })).toThrow(/EXPLICIT_DEPENDENCY_REQUIRED/);
    expect(() => recordMechanicalGovernedRequirement(store, actor, { ...subject, requirementContextId: "accepted", statement: "Accepted requirement", sourceBasis: "PROJECT_SPECIFICATION", sourceRef: "spec-100", sourceRevision: "A", adoptionRationale: "No", requirementStatus: "ACCEPTED_FOR_PURPOSE" })).toThrow(/REQUIREMENT_ACCEPTANCE_NOT_IN_R7/);
    expect(() => recordMechanicalGovernedSourceRequirement(store, actor, { ...subject, requirementContextId: "floating", statement: "Floating source", sourceBasis: "PROJECT_SPECIFICATION", sourceRef: "spec-100", sourceRevision: "latest" })).toThrow(/SOURCE_REVISION_REQUIRED/);
    expect(() => recordMechanicalGovernedRequirement(store, actor, { ...subject, r6RevisionFingerprint: "wrong", requirementContextId: "wrong-r6", statement: "Wrong maintainability revision", sourceBasis: "PROJECT_SPECIFICATION", sourceRef: "spec-100", sourceRevision: "A", adoptionRationale: "No" })).toThrow(/R6_REVISION_MISMATCH/);
    expect(() => recordMechanicalChange(store, actor, { ...subject, changeContextId: "mutate", changeCategory: "DESIGN_CONDITION_CHANGED", originRef: "spec-100", reason: "Rewrite design", dependencies: [{ kind: "OBJECT_REFERENCE", targetKind: "R3_DESIGN", targetId: design.recordId, targetFingerprint: design.fingerprint }], mutateR3: true })).toThrow(/R3_MUTATION_REJECTED/);
    expect(() => recordMechanicalChange(store, actor, { ...subject, changeContextId: "vendor-adopt", changeCategory: "VENDOR_EVIDENCE_CHANGED", originRef: "MM-100", reason: "Adopt the new vendor revision", dependencies: [{ kind: "OBJECT_REFERENCE", targetKind: "R4_VENDOR", targetId: vendorData.recordId, targetFingerprint: vendorData.fingerprint }], adoptVendorRevision: true })).toThrow(/VENDOR_AUTO_ADOPTION_REJECTED/);
    expect(() => recordMechanicalChange(store, actor, { ...subject, changeContextId: "rewrite", changeCategory: "TECHNICAL_REQUIREMENT_CHANGED", originRef: "spec-100", reason: "Rewrite the requirement", dependencies: [{ kind: "PARENT", targetKind: "R5_REQUIREMENT", targetId: requirement.recordId, targetFingerprint: requirement.fingerprint }], rewriteR5: true })).toThrow(/R5_REWRITE_REJECTED/);
    expect(() => recordMechanicalChange(store, actor, { ...subject, changeContextId: "clearance", changeCategory: "MAINTAINABILITY_CONTEXT_CHANGED", originRef: "spec-100", reason: "Recalculate clearance", dependencies: [{ kind: "OBJECT_REFERENCE", targetKind: "R6_MAINTAINABILITY", targetId: envelope.recordId, targetFingerprint: envelope.fingerprint }], recalculateClearance: true })).toThrow(/RECALCULATION_REJECTED/);
    expect(() => recordMechanicalReassessment(store, actor, { ...subject, reassessmentContextId: "close-eng", changeContextId: change.changeContextId, targetId: envelope.recordId, targetFingerprint: envelope.fingerprint, state: "REASSESSMENT_COMPLETED", closeAsEngineeringComplete: true })).toThrow(/REASSESSMENT_CLOSURE_REJECTED/);
    expect(() => recordMechanicalGovernedRequirement(store, { ...actor, actorId: "AI-assistant" }, { ...subject, requirementContextId: "ai", statement: "Invented requirement", sourceBasis: "PROJECT_SPECIFICATION", sourceRef: "spec-100", sourceRevision: "A", adoptionRationale: "No" })).toThrow(/AI_NOT_MECHANICAL_AUTHORITY/);
    expect(() => recordMechanicalEngineeringDecision(store, { ...actor, authority: "ADMIN" }, { ...subject, decisionContextId: "admin", statement: "Admin decision", basis: "ADMIN", alternatives: [{ id: "a", statement: "Admin side", is_selected: true }] })).toThrow(/ADMIN_NOT_MECHANICAL_AUTHORITY/);
    expect(() => recordMechanicalAssumption(store, actor, { ...subject, tenantId: "tenant-b", assumptionContextId: "cross", statement: "Cross tenant assumption", basis: "MAINTENANCE_STRATEGY" })).toThrow(/SCOPE_MISMATCH/);

    const replay = recordMechanicalGovernedSourceRequirement(store, actor, { ...subject, requirementContextId: "gov-source", statement: "Project specification states a maintenance envelope", sourceBasis: "PROJECT_SPECIFICATION", sourceRef: "spec-100", sourceRevision: "A" });
    expect(replay.fingerprint).toBe(source.fingerprint);
    expect(() => recordMechanicalGovernedSourceRequirement(store, actor, { ...subject, requirementContextId: "gov-source-dup", statement: "Project specification states a maintenance envelope", sourceBasis: "PROJECT_SPECIFICATION", sourceRef: "spec-100", sourceRevision: "A" })).toThrow(/DUPLICATE_RECORD_REJECTED/);
    const preserved = source.fingerprint;
    const successor = recordMechanicalGovernedSourceRequirement(store, actor, {
      ...subject, requirementContextId: "gov-source-b", predecessorRequirementContextId: source.requirementContextId, statement: "Project specification states a revised maintenance envelope", sourceBasis: "PROJECT_SPECIFICATION", sourceRef: "spec-100", sourceRevision: "B",
    });
    expect(successor.sourceRevision).toBe("B");
    expect(successor.predecessorFingerprint).toBe(preserved);
    expect(source.fingerprint).toBe(preserved);
    expect(source.recordStatus).toBe("SUPERSEDED");
    expect(source.deleted).toBe(false);
    expect(source.invalidated).toBe(false);
    expect(store.requirements.some((row) => row.requirementContextId === source.requirementContextId)).toBe(true);
    expect(store.history.some((row) => row.subjectId === source.requirementContextId && row.recordStatus === "SUPERSEDED" && row.fingerprint === preserved)).toBe(true);
    expect(design.suppliedValue).toBe("10");
    expect(requirement.fingerprint).toBe(subject.r5RevisionFingerprint);
    expect(envelope.fingerprint).toBe(subject.r6RevisionFingerprint);

    expect(recalculateFromChange).toThrow(/RECALCULATION_REJECTED/);
    expect(redesignFromChange).toThrow(/REDESIGN_REJECTED/);
    expect(mutateDesignCondition).toThrow(/R3_MUTATION_REJECTED/);
    expect(adoptVendorRevision).toThrow(/VENDOR_AUTO_ADOPTION_REJECTED/);
    expect(overrideEngineeringWithVendor).toThrow(/VENDOR_OVERRIDE_REJECTED/);
    expect(overrideVendorWithEngineering).toThrow(/ENGINEERING_OVERRIDE_REJECTED/);
    expect(rewriteTechnicalRequirement).toThrow(/R5_REWRITE_REJECTED/);
    expect(recalculateClearance).toThrow(/RECALCULATION_REJECTED/);
    expect(solveAccessPath).toThrow(/ACCESS_PATH_SOLVER_REJECTED/);
    expect(solveRemovalRoute).toThrow(/REMOVAL_ROUTE_SOLVER_REJECTED/);
    expect(redesignPackageArrangement).toThrow(/REDESIGN_REJECTED/);
    expect(analyzeLifting).toThrow(/LIFTING_ANALYSIS_REJECTED/);
    expect(inferChangeDependency).toThrow(/INFERRED_DEPENDENCY_REJECTED/);
    expect(repointGovernance).toThrow(/AUTO_REPOINT_REJECTED/);
    expect(mutateGovernance).toThrow(/SILENT_MUTATION_REJECTED/);
    expect(closeReassessmentAsEngineeringComplete).toThrow(/REASSESSMENT_CLOSURE_REJECTED/);
    expect(validateChange).toThrow(/VALIDATION_AUTHORITY_REJECTED/);
    expect(approveChange).toThrow(/APPROVAL_RUNTIME_REJECTED/);
    expect(certifyChange).toThrow(/CERTIFICATION_RUNTIME_REJECTED/);
    expect(openDisciplineInterface).toThrow(/DISCIPLINE_INTERFACE_REJECTED/);
    expect(sizeMechanicalEquipment).toThrow(/EQUIPMENT_SIZING_REJECTED/);

    const here = dirname(fileURLToPath(import.meta.url));
    const sourceText = readFileSync(join(here, "requirements-assumptions-change.ts"), "utf8");
    expect(sourceText).toContain("fingerprintCanonical");
    expect(sourceText).toContain("assertAssumptionMateriality");
    expect(sourceText).toContain("assertHumanApprovalActor");
    expect(sourceText).toContain("assertSingleSelectedAlternative");
    expect(sourceText).toContain("assertSupersessionPair");
    expect(sourceText).toContain("INFORMATION_REQUIREMENT_STATUSES");
    expect(sourceText).not.toMatch(/createHash|from ["']@rtb\/engineering-review["']|CREATE TABLE/);
    expect(scanAnalysisFormulaBypass(join(here, "requirements-assumptions-change.ts"), sourceText)).toEqual([]);
    const packageJson = JSON.parse(readFileSync(join(here, "../../package.json"), "utf8")) as { dependencies: Record<string, string> };
    expect(Object.keys(packageJson.dependencies).sort()).toEqual(["@rtb/database", "@rtb/engineering-review", "@rtb/platform-commerce", "@rtb/platform-intelligence", "@rtb/platform-kernel", "@rtb/types", "docx", "exceljs", "pptxgenjs", "zod"]);
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D4.R7.REQUIREMENTS_ASSUMPTIONS_AND_CHANGE")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D4.R8.DISCIPLINE_INTERFACES_AND_HANDOFFS")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
  });
});
