import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { D4_RUNTIME_COUNT as ARCHITECTURE_RUNTIME_COUNT } from "@rtb/types";
import { describe, expect, it } from "vitest";
import { D2_REOPENED, D2_TRACK_COMPLETE, D3_TRACK_COMPLETE, D4_0_STARTED } from "../geotechnical/geotechnical-bounded-closeout";
import { STRUCTURAL_CAPABILITY_MANIFEST } from "../structural-concrete/capability";
import { scanAnalysisFormulaBypass } from "../structural-systems/formula-scan";
import { D1_STRUCTURAL_PACK_COMPLETE, D1N_REOPENED } from "../structural-systems/structural-pack-sequencing";
import { D4_CONTEXT_AUTHORITY, D4_RUNTIME_COUNT as R1_RUNTIME_COUNT, createD4R1Store, recordMechanicalContext, recordMechanicalObjectIdentity, type D4R1Actor } from "./identity-foundation";
import { D4_RUNTIME_COUNT as R2_RUNTIME_COUNT, createD4R2Store, recordMechanicalEquipmentClassification } from "./equipment-system-context";
import { D4_RUNTIME_COUNT as R3_RUNTIME_COUNT, createD4R3Store, recordMechanicalDesignCondition } from "./design-condition-performance-context";
import { D4_RUNTIME_COUNT as R4_RUNTIME_COUNT, createD4R4Store, recordMechanicalVendorData, recordMechanicalVendorDocument } from "./vendor-data-evidence-context";
import { D4_RUNTIME_COUNT as R5_RUNTIME_COUNT, createD4R5Store, recordMechanicalTechnicalRequirement } from "./mechanical-technical-context";
import { D4_RUNTIME_COUNT as R6_RUNTIME_COUNT, createD4R6Store, recordMechanicalMaintainabilityContext } from "./maintainability-access-package-context";
import { D4_RUNTIME_COUNT as R7_RUNTIME_COUNT, createD4R7Store, recordMechanicalChange } from "./requirements-assumptions-change";
import {
  D4_R9_STARTED,
  D4_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_COUNT as R8_REVIEW_COUNT,
  D4_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_READY as R8_REVIEW_READY,
  D4_RUNTIME_COUNT as R8_RUNTIME_COUNT,
  createD4R8Store,
  recordMechanicalInterfaceHandoff,
} from "./discipline-interfaces-handoffs";
import {
  ADMIN_CAN_AUTOMATICALLY_VALIDATE_D4_ENGINEERING,
  ADMIN_EQUALS_D4_ENGINEERING_REVIEWER_AUTHORITY,
  ADMIN_REVIEW_ACTION_EQUALS_ENGINEERING_REVIEW,
  AI_CAN_AUTOMATICALLY_VALIDATE_D4_ENGINEERING,
  AI_EQUALS_D4_ENGINEERING_REVIEWER_AUTHORITY,
  AI_REVIEW_OUTPUT_EQUALS_ENGINEERING_REVIEW,
  AI_REVIEW_OUTPUT_EQUALS_ENGINEERING_VALIDATION,
  BASISLESS_D4_VALIDATION_AUTO_ACCEPTED,
  D1_STRUCTURAL_PACK_COMPLETE as R9_D1,
  D1N_REOPENED as R9_D1N,
  D2_REOPENED as R9_D2_REOPENED,
  D2_TRACK_COMPLETE as R9_D2,
  D3_REOPENED,
  D3_TRACK_COMPLETE as R9_D3,
  D3_TRACK_COMPLETION_CLASSIFICATION,
  D4_ACCESS_PATH_SOLVER_RUNTIME_COUNT,
  D4_APPROVAL_RUNTIME_COUNT,
  D4_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT,
  D4_AUTOMATIC_REDESIGN_RUNTIME_COUNT,
  D4_CERTIFICATION_RUNTIME_COUNT,
  D4_CONFORMANCE_DETERMINATION_RUNTIME_COUNT,
  D4_CROSS_DISCIPLINE_CONFLICT_DETECTION_RUNTIME_COUNT,
  D4_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT,
  D4_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT,
  D4_CROSS_DISCIPLINE_RECOMMENDATION_RUNTIME_COUNT,
  D4_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT,
  D4_CURRENTNESS_DIGITAL_THREAD_RUNTIME_READY,
  D4_D9_RUNTIME_INTEGRATION_COUNT,
  D4_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
  D4_D9_SOURCE_CONTRACT_RUNTIME_READY,
  D4_DISCIPLINE_INTERFACE_RUNTIME_READY,
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
  D4_MAINTAINABILITY_ACCESS_PACKAGE_RUNTIME_READY_REUSED,
  D4_MECHANICAL_DESIGN_OPTIMIZATION_RUNTIME_COUNT,
  D4_MECHANICAL_LOAD_CALCULATION_RUNTIME_COUNT,
  D4_R1_R8_EXACT_SUBJECT_REVISIONS_REUSED,
  D4_R7_REASSESSMENT_REVIEW_INTEGRATION_IMPLEMENTED,
  D4_R9_AUTO_MUTATES_R3_DESIGN_CONDITION,
  D4_R9_AUTO_MUTATES_R3_PERFORMANCE_CONTEXT,
  D4_R9_AUTO_MUTATES_R4_VENDOR_EVIDENCE,
  D4_R9_AUTO_MUTATES_R5_TECHNICAL_REQUIREMENT,
  D4_R9_AUTO_MUTATES_R6_MAINTAINABILITY_CONTEXT,
  D4_R9_AUTO_MUTATES_R8_INTERFACE_HANDOFF,
  D4_R9_BLOCKER,
  D4_R9_CANONICAL_NEXT_PHASE,
  D4_R9_CANONICAL_NEXT_PHASE_SCOPE,
  D4_R9_DUPLICATE_GOVERNANCE_IMPLEMENTED,
  D4_R9_HISTORY_PRESERVED,
  D4_R9_MATURITY,
  D4_R9_NEXT_PHASE_TYPE,
  D4_R9_PROVENANCE_PRESERVED,
  D4_R9_PROVENANCE_REQUIRED,
  D4_R9_REPLAY_PROTECTION_IMPLEMENTED,
  D4_R9_SPOOFING_PROTECTION_IMPLEMENTED,
  D4_R9_STATUS,
  D4_R9_VALIDATES_D1_STRUCTURAL_ENGINEERING,
  D4_R9_VALIDATES_D2_CIVIL_ENGINEERING,
  D4_R9_VALIDATES_D3_GEOTECHNICAL_ENGINEERING,
  D4_R9_VALIDATES_FUTURE_D5_D8_ENGINEERING,
  D4_R10_STARTED,
  D4_REMOVAL_ROUTE_SOLVER_RUNTIME_COUNT,
  D4_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY,
  D4_REUSES_CANONICAL_CURRENTNESS,
  D4_REUSES_CANONICAL_FINGERPRINT,
  D4_REUSES_CANONICAL_REVIEW_GOVERNANCE,
  D4_REUSES_CANONICAL_VALIDATION_GOVERNANCE,
  D4_REVIEW_COMPLETION_GOVERNANCE_IMPLEMENTED,
  D4_REVIEW_FINDING_DISPOSITION_GOVERNANCE_IMPLEMENTED,
  D4_REVIEW_FINDING_GOVERNANCE_IMPLEMENTED,
  D4_REVIEW_REQUEST_GOVERNANCE_IMPLEMENTED,
  D4_REVIEW_SUBJECT_AUTO_REPOINTED,
  D4_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_COUNT,
  D4_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_IMPLEMENTED,
  D4_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_READY,
  D4_REVIEW_VALIDATION_HISTORY_PRESERVED,
  D4_REVIEWER_AUTHORITY_EXPLICIT,
  D4_REVIEWER_AUTHORITY_REQUIRED,
  D4_ROTATING_EQUIPMENT_CALCULATION_RUNTIME_COUNT,
  D4_RUNTIME_COUNT,
  D4_RUNTIME_STARTED,
  D4_SPATIAL_CLASH_DETECTION_RUNTIME_COUNT,
  D4_STATIC_EQUIPMENT_CALCULATION_RUNTIME_COUNT,
  D4_THERMAL_MECHANICAL_CALCULATION_RUNTIME_COUNT,
  D4_VALIDATION_BASIS_REQUIRED,
  D4_VALIDATION_BASIS_TRACEABLE,
  D4_VALIDATION_EQUALS_CERTIFICATION,
  D4_VALIDATION_EQUALS_CODE_CONFORMANCE,
  D4_VALIDATION_EQUALS_PROJECT_APPROVAL,
  D4_VALIDATION_STATE_GOVERNANCE_IMPLEMENTED,
  D4_VIBRATION_ANALYSIS_RUNTIME_COUNT,
  D5_RUNTIME_STARTED,
  D6_RUNTIME_STARTED,
  D7_RUNTIME_STARTED,
  D8_RUNTIME_STARTED,
  D9_RUNTIME_COUNT,
  D9_RUNTIME_STARTED,
  DATABASE_SCHEMA_CHANGED,
  EXACT_D4_REVIEW_SUBJECT_REVISION_REQUIRED,
  FINDING_ADDRESSED_EQUALS_ENGINEERING_APPROVED,
  FINDING_CLOSED_EQUALS_ENGINEERING_VALIDATED,
  FLOATING_D4_REVIEW_SUBJECT_REFERENCE_ALLOWED,
  NEW_DEPENDENCY_ADDED,
  PARALLEL_D4_CURRENTNESS_ENGINE_CREATED,
  PARALLEL_D4_REVIEW_ENGINE_CREATED,
  PARALLEL_D4_VALIDATION_ENGINE_CREATED,
  PRIOR_D4_REVIEW_AUTO_TRANSFERS_TO_NEW_REVISION,
  PRIOR_D4_VALIDATION_AUTO_TRANSFERS_TO_NEW_REVISION,
  REASSESSMENT_COMPLETED_EQUALS_VALIDATED,
  REASSESSMENT_REQUIRED_D4_SUBJECT_EXPOSED_AS_VALIDATED,
  REASSESSMENT_REQUIRED_EQUALS_VALIDATED,
  REVIEW_COMPLETED_EQUALS_APPROVED,
  REVIEW_COMPLETED_EQUALS_CERTIFIED,
  REVIEW_COMPLETED_EQUALS_CONFORMANT,
  REVIEW_COMPLETED_EQUALS_VALIDATED,
  REVIEW_FINDING_EQUALS_ENGINEERING_INVALID,
  REVIEW_FINDING_EQUALS_ENGINEERING_REDESIGNED,
  REVIEW_REQUESTED_EQUALS_REVIEW_COMPLETED,
  REVIEW_REQUESTED_EQUALS_VALIDATED,
  SECOND_D4_FINGERPRINT_ALGORITHM_CREATED,
  SILENT_D4_R9_MUTATION_ALLOWED,
  STALE_D4_VALIDATION_EXPOSED_AS_CURRENT,
  SUPERSEDED_D4_VALIDATION_EXPOSED_AS_CURRENT,
  TENANT_WORKSPACE_PROJECT_D4_R9_SCOPE_ENFORCED,
  VALIDATED_EQUALS_APPROVED,
  VALIDATED_EQUALS_CERTIFIED,
  VALIDATED_EQUALS_CONFORMANT,
  automaticallyValidateMechanicalEngineering,
  closeReassessmentAsValidated,
  createD4R9Store,
  mutateDesignFromReview,
  mutateHandoffFromReview,
  mutateMaintainabilityFromReview,
  mutateTechnicalRequirementFromReview,
  mutateVendorEvidenceFromReview,
  reasonAcrossMechanicalReview,
  recordMechanicalReviewCompletion,
  recordMechanicalReviewFinding,
  recordMechanicalReviewRequest,
  recordMechanicalValidationState,
  repointMechanicalReview,
  transferMechanicalValidation,
  validateMechanicalCounterpart,
  type D4R9Actor,
} from "./review-validation-governance";

const actor: D4R1Actor = {
  actorId: "mechanical-recorder",
  tenantId: "tenant-a",
  workspaceId: "workspace-a",
  projectId: "project-a",
  authority: D4_CONTEXT_AUTHORITY,
  actorKind: "human",
} as D4R9Actor;

const reviewer: D4R9Actor = {
  actorId: "mechanical-reviewer",
  tenantId: "tenant-a",
  workspaceId: "workspace-a",
  projectId: "project-a",
  authority: "REVIEWER",
  actorKind: "human",
  aal: "aal2",
};

const R10_SCOPE = "Implement dedicated D4 currentness and digital-thread runtime using canonical EOS mechanisms across exact R1-R9 Mechanical revisions. Support exact lineage, supersession/currentness propagation semantics, review/validation currentness and immutable history without inferred lineage, silent auto-repointing, engineering mutation, recalculation, redesign, cross-discipline reasoning, D9 integration or D5-D9 runtime.";

describe("EOS-D4-R9 review and validation governance", () => {
  it("governs Mechanical review and validation on exact R1-R8 revisions without performing the engineering", () => {
    expect(D4_R9_STATUS).toBe("REVIEW_AND_VALIDATION_GOVERNANCE_IMPLEMENTED");
    expect(D4_R9_MATURITY).toBe(D4_R9_STATUS);
    expect(D4_RUNTIME_STARTED).toBe(true);
    expect(D4_RUNTIME_COUNT).toBe(9);
    expect(R8_RUNTIME_COUNT).toBe(8);
    expect(R7_RUNTIME_COUNT).toBe(7);
    expect(R6_RUNTIME_COUNT).toBe(6);
    expect(R5_RUNTIME_COUNT).toBe(5);
    expect(R4_RUNTIME_COUNT).toBe(4);
    expect(R3_RUNTIME_COUNT).toBe(3);
    expect(R2_RUNTIME_COUNT).toBe(2);
    expect(R1_RUNTIME_COUNT).toBe(1);
    expect(ARCHITECTURE_RUNTIME_COUNT).toBe(0);
    expect(D4_0_STARTED).toBe(false);
    expect(D4_R9_STARTED).toBe(false);
    expect(R8_REVIEW_READY).toBe(false);
    expect(R8_REVIEW_COUNT).toBe(0);
    expect(D4_R10_STARTED).toBe(false);
    expect(D4_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_IMPLEMENTED).toBe(true);
    expect(D4_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_COUNT).toBe(1);
    expect(D4_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_READY).toBe(true);
    expect(D4_DISCIPLINE_INTERFACE_RUNTIME_READY).toBe(true);
    expect(D4_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY).toBe(true);
    expect(D4_MAINTAINABILITY_ACCESS_PACKAGE_RUNTIME_READY_REUSED).toBe(true);
    expect(D4_CURRENTNESS_DIGITAL_THREAD_RUNTIME_READY).toBe(false);
    expect(D4_D9_SOURCE_CONTRACT_RUNTIME_READY).toBe(false);
    expect(D4_REUSES_CANONICAL_REVIEW_GOVERNANCE).toBe(true);
    expect(D4_REUSES_CANONICAL_VALIDATION_GOVERNANCE).toBe(true);
    expect(PARALLEL_D4_REVIEW_ENGINE_CREATED).toBe(false);
    expect(PARALLEL_D4_VALIDATION_ENGINE_CREATED).toBe(false);
    expect(D4_R1_R8_EXACT_SUBJECT_REVISIONS_REUSED).toBe(true);
    expect(EXACT_D4_REVIEW_SUBJECT_REVISION_REQUIRED).toBe(true);
    expect(FLOATING_D4_REVIEW_SUBJECT_REFERENCE_ALLOWED).toBe(false);
    expect(D4_REVIEW_SUBJECT_AUTO_REPOINTED).toBe(false);
    expect(D4_REVIEW_REQUEST_GOVERNANCE_IMPLEMENTED).toBe(true);
    expect(REVIEW_REQUESTED_EQUALS_REVIEW_COMPLETED).toBe(false);
    expect(REVIEW_REQUESTED_EQUALS_VALIDATED).toBe(false);
    expect(D4_REVIEWER_AUTHORITY_REQUIRED).toBe(true);
    expect(D4_REVIEWER_AUTHORITY_EXPLICIT).toBe(true);
    expect(AI_EQUALS_D4_ENGINEERING_REVIEWER_AUTHORITY).toBe(false);
    expect(ADMIN_EQUALS_D4_ENGINEERING_REVIEWER_AUTHORITY).toBe(false);
    expect(AI_REVIEW_OUTPUT_EQUALS_ENGINEERING_REVIEW).toBe(false);
    expect(AI_REVIEW_OUTPUT_EQUALS_ENGINEERING_VALIDATION).toBe(false);
    expect(ADMIN_REVIEW_ACTION_EQUALS_ENGINEERING_REVIEW).toBe(false);
    expect(D4_REVIEW_FINDING_GOVERNANCE_IMPLEMENTED).toBe(true);
    expect(D4_REVIEW_FINDING_DISPOSITION_GOVERNANCE_IMPLEMENTED).toBe(true);
    expect(REVIEW_FINDING_EQUALS_ENGINEERING_INVALID).toBe(false);
    expect(REVIEW_FINDING_EQUALS_ENGINEERING_REDESIGNED).toBe(false);
    expect(FINDING_CLOSED_EQUALS_ENGINEERING_VALIDATED).toBe(false);
    expect(FINDING_ADDRESSED_EQUALS_ENGINEERING_APPROVED).toBe(false);
    expect(D4_REVIEW_COMPLETION_GOVERNANCE_IMPLEMENTED).toBe(true);
    expect(REVIEW_COMPLETED_EQUALS_VALIDATED).toBe(false);
    expect(REVIEW_COMPLETED_EQUALS_CONFORMANT).toBe(false);
    expect(REVIEW_COMPLETED_EQUALS_APPROVED).toBe(false);
    expect(REVIEW_COMPLETED_EQUALS_CERTIFIED).toBe(false);
    expect(D4_VALIDATION_STATE_GOVERNANCE_IMPLEMENTED).toBe(true);
    expect(D4_VALIDATION_BASIS_REQUIRED).toBe(true);
    expect(D4_VALIDATION_BASIS_TRACEABLE).toBe(true);
    expect(BASISLESS_D4_VALIDATION_AUTO_ACCEPTED).toBe(false);
    expect(VALIDATED_EQUALS_CONFORMANT).toBe(false);
    expect(VALIDATED_EQUALS_APPROVED).toBe(false);
    expect(VALIDATED_EQUALS_CERTIFIED).toBe(false);
    expect(D4_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT).toBe(0);
    expect(AI_CAN_AUTOMATICALLY_VALIDATE_D4_ENGINEERING).toBe(false);
    expect(ADMIN_CAN_AUTOMATICALLY_VALIDATE_D4_ENGINEERING).toBe(false);
    expect(D4_R9_AUTO_MUTATES_R3_DESIGN_CONDITION).toBe(false);
    expect(D4_R9_AUTO_MUTATES_R3_PERFORMANCE_CONTEXT).toBe(false);
    expect(D4_R9_AUTO_MUTATES_R4_VENDOR_EVIDENCE).toBe(false);
    expect(D4_R9_AUTO_MUTATES_R5_TECHNICAL_REQUIREMENT).toBe(false);
    expect(D4_R9_AUTO_MUTATES_R6_MAINTAINABILITY_CONTEXT).toBe(false);
    expect(D4_R9_AUTO_MUTATES_R8_INTERFACE_HANDOFF).toBe(false);
    expect(D4_R7_REASSESSMENT_REVIEW_INTEGRATION_IMPLEMENTED).toBe(true);
    expect(REASSESSMENT_REQUIRED_EQUALS_VALIDATED).toBe(false);
    expect(REASSESSMENT_COMPLETED_EQUALS_VALIDATED).toBe(false);
    expect(PRIOR_D4_REVIEW_AUTO_TRANSFERS_TO_NEW_REVISION).toBe(false);
    expect(PRIOR_D4_VALIDATION_AUTO_TRANSFERS_TO_NEW_REVISION).toBe(false);
    expect(D4_REVIEW_VALIDATION_HISTORY_PRESERVED).toBe(true);
    expect(D4_REUSES_CANONICAL_CURRENTNESS).toBe(true);
    expect(PARALLEL_D4_CURRENTNESS_ENGINE_CREATED).toBe(false);
    expect(STALE_D4_VALIDATION_EXPOSED_AS_CURRENT).toBe(false);
    expect(SUPERSEDED_D4_VALIDATION_EXPOSED_AS_CURRENT).toBe(false);
    expect(REASSESSMENT_REQUIRED_D4_SUBJECT_EXPOSED_AS_VALIDATED).toBe(false);
    expect(D4_R9_VALIDATES_D1_STRUCTURAL_ENGINEERING).toBe(false);
    expect(D4_R9_VALIDATES_D2_CIVIL_ENGINEERING).toBe(false);
    expect(D4_R9_VALIDATES_D3_GEOTECHNICAL_ENGINEERING).toBe(false);
    expect(D4_R9_VALIDATES_FUTURE_D5_D8_ENGINEERING).toBe(false);
    expect(D4_EQUALS_D1_STRUCTURAL_AUTHORITY).toBe(false);
    expect(D4_EQUALS_D2_CIVIL_AUTHORITY).toBe(false);
    expect(D4_EQUALS_D3_GEOTECHNICAL_AUTHORITY).toBe(false);
    expect(D4_EQUALS_D5_PIPING_AUTHORITY).toBe(false);
    expect(D4_EQUALS_D6_PROCESS_AUTHORITY).toBe(false);
    expect(D4_EQUALS_D7_ELECTRICAL_AUTHORITY).toBe(false);
    expect(D4_EQUALS_D8_INSTRUMENTATION_CONTROL_AUTHORITY).toBe(false);
    expect(D4_VALIDATION_EQUALS_CODE_CONFORMANCE).toBe(false);
    expect(D4_VALIDATION_EQUALS_PROJECT_APPROVAL).toBe(false);
    expect(D4_VALIDATION_EQUALS_CERTIFICATION).toBe(false);
    expect([
      D4_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT,
      D4_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
      D4_D9_RUNTIME_INTEGRATION_COUNT,
      D4_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT,
      D4_CONFORMANCE_DETERMINATION_RUNTIME_COUNT,
      D4_APPROVAL_RUNTIME_COUNT,
      D4_CERTIFICATION_RUNTIME_COUNT,
      D4_EQUIPMENT_SIZING_RUNTIME_COUNT,
      D4_ROTATING_EQUIPMENT_CALCULATION_RUNTIME_COUNT,
      D4_STATIC_EQUIPMENT_CALCULATION_RUNTIME_COUNT,
      D4_THERMAL_MECHANICAL_CALCULATION_RUNTIME_COUNT,
      D4_MECHANICAL_LOAD_CALCULATION_RUNTIME_COUNT,
      D4_VIBRATION_ANALYSIS_RUNTIME_COUNT,
      D4_FATIGUE_ANALYSIS_RUNTIME_COUNT,
      D4_MECHANICAL_DESIGN_OPTIMIZATION_RUNTIME_COUNT,
      D4_AUTOMATIC_REDESIGN_RUNTIME_COUNT,
      D4_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT,
      D4_CROSS_DISCIPLINE_CONFLICT_DETECTION_RUNTIME_COUNT,
      D4_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT,
      D4_CROSS_DISCIPLINE_RECOMMENDATION_RUNTIME_COUNT,
      D4_SPATIAL_CLASH_DETECTION_RUNTIME_COUNT,
      D4_ACCESS_PATH_SOLVER_RUNTIME_COUNT,
      D4_REMOVAL_ROUTE_SOLVER_RUNTIME_COUNT,
      D4_LAYOUT_OPTIMIZATION_RUNTIME_COUNT,
      D9_RUNTIME_COUNT,
    ]).toEqual(Array(25).fill(0));
    expect(D5_RUNTIME_STARTED).toBe(false);
    expect(D6_RUNTIME_STARTED).toBe(false);
    expect(D7_RUNTIME_STARTED).toBe(false);
    expect(D8_RUNTIME_STARTED).toBe(false);
    expect(D9_RUNTIME_STARTED).toBe(false);
    expect(D1_STRUCTURAL_PACK_COMPLETE).toBe(false);
    expect(D1N_REOPENED).toBe(false);
    expect(R9_D1).toBe(false);
    expect(R9_D1N).toBe(false);
    expect(D2_TRACK_COMPLETE).toBe(true);
    expect(R9_D2).toBe(true);
    expect(D2_REOPENED).toBe(false);
    expect(R9_D2_REOPENED).toBe(false);
    expect(D3_TRACK_COMPLETE).toBe(true);
    expect(R9_D3).toBe(true);
    expect(D3_TRACK_COMPLETION_CLASSIFICATION).toBe("COMPLETE_BOUNDED_WITH_LIMITATIONS");
    expect(D3_REOPENED).toBe(false);
    expect(DATABASE_SCHEMA_CHANGED).toBe(false);
    expect(NEW_DEPENDENCY_ADDED).toBe(false);
    expect(D4_REUSES_CANONICAL_FINGERPRINT).toBe(true);
    expect(SECOND_D4_FINGERPRINT_ALGORITHM_CREATED).toBe(false);
    expect(D4_R9_PROVENANCE_REQUIRED).toBe(true);
    expect(D4_R9_PROVENANCE_PRESERVED).toBe(true);
    expect(SILENT_D4_R9_MUTATION_ALLOWED).toBe(false);
    expect(D4_R9_HISTORY_PRESERVED).toBe(true);
    expect(TENANT_WORKSPACE_PROJECT_D4_R9_SCOPE_ENFORCED).toBe(true);
    expect(D4_R9_DUPLICATE_GOVERNANCE_IMPLEMENTED).toBe(true);
    expect(D4_R9_REPLAY_PROTECTION_IMPLEMENTED).toBe(true);
    expect(D4_R9_SPOOFING_PROTECTION_IMPLEMENTED).toBe(true);
    expect(D4_R9_CANONICAL_NEXT_PHASE).toBe("EOS-D4-R10-CURRENTNESS-AND-DIGITAL-THREAD");
    expect(D4_R9_NEXT_PHASE_TYPE).toBe("CURRENTNESS_AND_DIGITAL_THREAD");
    expect(D4_R9_CANONICAL_NEXT_PHASE_SCOPE).toBe(R10_SCOPE);
    expect(D4_R9_BLOCKER).toBe("NONE");

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
    const changeSubject = {
      tenantId: actor.tenantId, workspaceId: actor.workspaceId, projectId: actor.projectId, contextId: context.contextId, objectId: equipment.objectId, objectRevisionFingerprint: equipment.fingerprint,
      r2SubjectKind: "CLASSIFICATION" as const, r2SubjectId: classification.classificationId, r2RevisionFingerprint: classification.fingerprint,
      r3RecordId: design.recordId, r3RevisionFingerprint: design.fingerprint, r4RecordId: vendorData.recordId, r4RevisionFingerprint: vendorData.fingerprint,
      r5RecordId: requirement.recordId, r5RevisionFingerprint: requirement.fingerprint, r6RecordId: envelope.recordId, r6RevisionFingerprint: envelope.fingerprint,
      citedCurrentness: "CURRENT" as const, citedLifecycleStage: "FEED", applicability: "PLANNED_MAINTENANCE", limitations: "This pump only", provenanceRef: "prov-r7",
    };
    const change = recordMechanicalChange(r7, actor, {
      ...changeSubject, changeContextId: "change-reassess", changeCategory: "REASSESSMENT_REQUIRED", originRef: "spec-100-rev-b", reason: "Support context requires reassessment",
      dependencies: [{ kind: "OBJECT_REFERENCE", targetKind: "R6_MAINTAINABILITY", targetId: envelope.recordId, targetFingerprint: envelope.fingerprint }],
    });
    const r8 = createD4R8Store(r7);
    const handoff = recordMechanicalInterfaceHandoff(r8, actor, {
      ...changeSubject, citedCurrentness: "CURRENT", provenanceRef: "prov-handoff", limitations: "Handoff does not design the counterpart",
      handoffId: "handoff-missing", counterpartDiscipline: "structural", direction: "D4_TO_COUNTERPART", interfaceTopic: "ANCHOR_OR_INTERFACE_REQUIREMENTS",
      counterpartInterfaceId: null, counterpartSourceRevision: null, handoffStatus: "AWAITING_COUNTERPART",
    });
    const store = createD4R9Store(r8);
    const chain = {
      ...changeSubject,
      r8HandoffId: handoff.handoffId,
      r8RevisionFingerprint: handoff.fingerprint,
      subjectKind: "DESIGN",
      subjectId: design.recordId,
      subjectRevision: design.provenanceRef,
      subjectFingerprint: design.fingerprint,
      applicability: "NORMAL_OPERATION",
      limitations: "Review of this exact design revision only",
      provenanceRef: "prov-review",
      citedLifecycleStage: "FEED",
    };
    const request = recordMechanicalReviewRequest(store, actor, {
      ...chain, citedCurrentness: "CURRENT", reviewRequestId: "review-1", reviewType: "MECHANICAL_SUBJECT_REVIEW", reviewScope: "Casing design pressure context", requestedReviewerAuthority: "REVIEWER",
    });
    expect(request.requestStatus).toBe("REQUESTED");
    expect(request.reviewCompleted).toBe(false);
    expect(request.engineeringValidated).toBe(false);
    expect(request.r3RevisionFingerprint).toBe(design.fingerprint);
    expect(request.r8RevisionFingerprint).toBe(handoff.fingerprint);
    const finding = recordMechanicalReviewFinding(store, reviewer, {
      ...chain, citedCurrentness: "CURRENT", findingId: "finding-1", reviewRequestId: request.reviewRequestId, findingCategory: "COMMENT", severity: "REVIEW_CANDIDATE", findingText: "Confirm the cited pressure remains the governed value", disposition: "OPEN",
    });
    expect(finding.engineeringInvalid).toBe(false);
    expect(finding.engineeringValidated).toBe(false);
    expect(finding.aiReview).toBe(false);
    expect(finding.reviewerAuthority).toBe("REVIEWER");
    const reassessmentFinding = recordMechanicalReviewFinding(store, reviewer, {
      ...chain, citedCurrentness: "CURRENT", findingId: "finding-reassess", reviewRequestId: request.reviewRequestId, findingCategory: "REASSESSMENT_RECOMMENDATION", severity: "REQUIRES_ATTENTION", findingText: "The support context needs a governed reassessment", disposition: "REASSESSMENT_REQUESTED", changeContextId: change.changeContextId, changeFingerprint: change.fingerprint,
    });
    expect(reassessmentFinding.engineeringValidated).toBe(false);
    expect(reassessmentFinding.changeContextId).toBe(change.changeContextId);
    expect(change.recalculated).toBe(false);
    const completed = recordMechanicalReviewCompletion(store, reviewer, {
      ...chain, citedCurrentness: "CURRENT", completionId: "complete-1", reviewRequestId: request.reviewRequestId,
    });
    expect(completed.reviewCompleted).toBe(true);
    expect(completed.engineeringValidated).toBe(false);
    expect(completed.conformant).toBe(false);
    expect(completed.engineeringApproved).toBe(false);
    expect(completed.certified).toBe(false);
    expect(completed.d1Validated).toBe(false);
    expect(request.reviewCompleted).toBe(false);
    const notValidated = recordMechanicalValidationState(store, reviewer, {
      ...chain, citedCurrentness: "CURRENT", validationId: "validation-open", validationState: "NOT_VALIDATED", validationScope: "Design pressure context",
    });
    expect(notValidated.engineeringValidated).toBe(false);
    const validated = recordMechanicalValidationState(store, reviewer, {
      ...chain, citedCurrentness: "CURRENT", validationId: "validation-1", validationState: "VALIDATED", validationScope: "Design pressure context with basis",
      basis: [{ kind: "R3_DESIGN", id: design.recordId, fingerprint: design.fingerprint }, { kind: "R5_REQUIREMENT", id: requirement.recordId, fingerprint: requirement.fingerprint }],
    });
    expect(validated.engineeringValidated).toBe(true);
    expect(validated.conformant).toBe(false);
    expect(validated.engineeringApproved).toBe(false);
    expect(validated.certified).toBe(false);
    expect(validated.currentness).toBe("CURRENT");
    expect(validated.basis).toHaveLength(2);
    const handoffChain = { ...chain, subjectKind: "HANDOFF", subjectId: handoff.handoffId, subjectRevision: handoff.provenanceRef, subjectFingerprint: handoff.fingerprint, reviewType: "INTERFACE_HANDOFF_REVIEW" };
    const handoffRequest = recordMechanicalReviewRequest(store, actor, {
      ...handoffChain, citedCurrentness: "CURRENT", reviewRequestId: "review-handoff", reviewScope: "Handoff record only", requestedReviewerAuthority: "REVIEWER",
    });
    const handoffCompletion = recordMechanicalReviewCompletion(store, reviewer, {
      ...handoffChain, citedCurrentness: "CURRENT", completionId: "complete-handoff", reviewRequestId: handoffRequest.reviewRequestId,
    });
    expect(handoffCompletion.engineeringValidated).toBe(false);
    expect(handoffCompletion.d1Validated).toBe(false);
    expect(handoff.engineeringValidated).toBe(false);
    expect(handoff.fingerprint).toBe(chain.r8RevisionFingerprint);
    const stale = recordMechanicalValidationState(store, reviewer, {
      ...chain, citedCurrentness: "STALE", validationId: "validation-stale", validationState: "STALE", validationScope: "Prior design pressure context",
    });
    expect(stale.currentness).toBe("STALE");
    expect(stale.engineeringValidated).toBe(false);
    const reassessState = recordMechanicalValidationState(store, reviewer, {
      ...chain, citedCurrentness: "REASSESSMENT_REQUIRED", validationId: "validation-reassess", validationState: "REASSESSMENT_REQUIRED", validationScope: "Design pressure awaiting reassessment", changeContextId: change.changeContextId, changeFingerprint: change.fingerprint,
    });
    expect(reassessState.engineeringValidated).toBe(false);
    expect(reassessState.currentness).not.toBe("CURRENT");
    const preserved = validated.fingerprint;
    const successor = recordMechanicalValidationState(store, reviewer, {
      ...chain, citedCurrentness: "STALE", validationId: "validation-1b", predecessorValidationId: validated.validationId, validationState: "STALE", validationScope: "Design pressure context with basis", limitations: "Successor keeps the original revision",
    });
    expect(successor.predecessorFingerprint).toBe(preserved);
    expect(validated.fingerprint).toBe(preserved);
    expect(validated.currentness).toBe("SUPERSEDED");
    expect(validated.deleted).toBe(false);
    expect(validated.engineeringValidated).toBe(true);
    expect(store.validations.some((row) => row.validationId === validated.validationId)).toBe(true);
    expect(store.history.some((row) => row.subjectId === validated.validationId && row.action === "SUPERSEDED" && row.fingerprint === preserved)).toBe(true);
    const replay = recordMechanicalReviewRequest(store, actor, {
      ...chain, citedCurrentness: "CURRENT", reviewRequestId: "review-1", reviewType: "MECHANICAL_SUBJECT_REVIEW", reviewScope: "Casing design pressure context", requestedReviewerAuthority: "REVIEWER",
    });
    expect(replay.fingerprint).toBe(request.fingerprint);
    expect(design.suppliedValue).toBe("10");
    expect(vendorData.suppliedValue).toBe("500");
    expect(requirement.requirementStatement).toBe("Provide a governed maintenance envelope for this pump");
    expect(envelope.statement).toBe("Maintain a service envelope around the non-drive end");
    expect(envelope.fingerprint).toBe(chain.r6RevisionFingerprint);

    expect(() => recordMechanicalReviewRequest(store, actor, { ...chain, citedCurrentness: "CURRENT", reviewRequestId: "review-float", reviewType: "MECHANICAL_SUBJECT_REVIEW", reviewScope: "Floating", requestedReviewerAuthority: "REVIEWER", objectRevisionFingerprint: "latest" })).toThrow(/R1_REVISION_REQUIRED/);
    expect(() => recordMechanicalReviewRequest(store, actor, { ...chain, citedCurrentness: "CURRENT", reviewRequestId: "review-dup", reviewType: "MECHANICAL_SUBJECT_REVIEW", reviewScope: "Duplicate", requestedReviewerAuthority: "REVIEWER" })).toThrow(/DUPLICATE_REVIEW_REQUEST_REJECTED/);
    expect(() => recordMechanicalReviewFinding(store, { ...reviewer, actorId: "AI-reviewer", actorKind: "ai" }, { ...chain, citedCurrentness: "CURRENT", findingId: "finding-ai", reviewRequestId: request.reviewRequestId, findingCategory: "COMMENT", severity: "REVIEW_CANDIDATE", findingText: "AI comment", disposition: "OPEN" })).toThrow(/AI_NOT_MECHANICAL_REVIEWER/);
    expect(() => recordMechanicalReviewFinding(store, { ...reviewer, authority: "ADMIN" }, { ...chain, citedCurrentness: "CURRENT", findingId: "finding-admin", reviewRequestId: request.reviewRequestId, findingCategory: "COMMENT", severity: "REVIEW_CANDIDATE", findingText: "Admin comment", disposition: "OPEN" })).toThrow(/ADMIN_NOT_MECHANICAL_REVIEWER/);
    expect(() => recordMechanicalReviewFinding(store, actor, { ...chain, citedCurrentness: "CURRENT", findingId: "finding-recorder", reviewRequestId: request.reviewRequestId, findingCategory: "COMMENT", severity: "REVIEW_CANDIDATE", findingText: "Recorder comment", disposition: "OPEN" })).toThrow(/REVIEWER_AUTHORITY_REQUIRED/);
    expect(() => recordMechanicalValidationState(store, reviewer, { ...chain, citedCurrentness: "CURRENT", validationId: "validation-empty", validationState: "VALIDATED", validationScope: "No basis" })).toThrow(/BASIS_REQUIRED/);
    expect(() => recordMechanicalValidationState(store, reviewer, { ...chain, citedCurrentness: "CURRENT", validationId: "validation-mutate", validationState: "NOT_VALIDATED", validationScope: "Mutation", mutateR3: true })).toThrow(/R3_MUTATION_REJECTED/);
    expect(() => recordMechanicalValidationState(store, reviewer, { ...handoffChain, citedCurrentness: "CURRENT", validationId: "validation-d1", validationState: "NOT_VALIDATED", validationScope: "Counterpart", validateD1: true })).toThrow(/D1_VALIDATION_REJECTED/);
    expect(() => recordMechanicalValidationState(store, reviewer, { ...chain, subjectFingerprint: "other-fingerprint", citedCurrentness: "STALE", validationId: "validation-transfer", predecessorValidationId: stale.validationId, validationState: "STALE", validationScope: "Transferred" })).toThrow(/SUBJECT_REVISION_MISMATCH/);
    expect(() => recordMechanicalReviewRequest(store, actor, { ...chain, tenantId: "tenant-b", citedCurrentness: "CURRENT", reviewRequestId: "review-scope", reviewType: "MECHANICAL_SUBJECT_REVIEW", reviewScope: "Other tenant", requestedReviewerAuthority: "REVIEWER" })).toThrow(/SCOPE_MISMATCH/);
    expect(() => recordMechanicalValidationState(store, reviewer, { ...chain, citedCurrentness: "REASSESSMENT_REQUIRED", validationId: "validation-as-valid", validationState: "VALIDATED", validationScope: "Reassessment is not validation", basis: [{ kind: "R3_DESIGN", id: design.recordId, fingerprint: design.fingerprint }] })).toThrow(/CURRENTNESS_STATUS_MISMATCH/);
    expect(design.suppliedValue).toBe("10");
    expect(handoff.fingerprint).toBe(chain.r8RevisionFingerprint);

    expect(repointMechanicalReview).toThrow(/AUTO_REPOINT_REJECTED/);
    expect(transferMechanicalValidation).toThrow(/VALIDATION_TRANSFER_REJECTED/);
    expect(mutateDesignFromReview).toThrow(/R3_MUTATION_REJECTED/);
    expect(mutateVendorEvidenceFromReview).toThrow(/R4_MUTATION_REJECTED/);
    expect(mutateTechnicalRequirementFromReview).toThrow(/R5_MUTATION_REJECTED/);
    expect(mutateMaintainabilityFromReview).toThrow(/R6_MUTATION_REJECTED/);
    expect(mutateHandoffFromReview).toThrow(/R8_MUTATION_REJECTED/);
    expect(validateMechanicalCounterpart).toThrow(/D1_VALIDATION_REJECTED/);
    expect(automaticallyValidateMechanicalEngineering).toThrow(/AUTOMATIC_VALIDATION_REJECTED/);
    expect(closeReassessmentAsValidated).toThrow(/REASSESSMENT_NOT_VALIDATION/);
    expect(reasonAcrossMechanicalReview).toThrow(/CROSS_DISCIPLINE_REASONING_NOT_IN_R9/);

    const here = dirname(fileURLToPath(import.meta.url));
    const sourceText = readFileSync(join(here, "review-validation-governance.ts"), "utf8");
    expect(sourceText).toContain("fingerprintCanonical");
    expect(sourceText).toContain("D2_R9_VALIDATION_STATES");
    expect(sourceText).toContain("PRE_ISSUE_AI_BOUNDARY");
    expect(sourceText).toContain("assertHumanApprovalActor");
    expect(sourceText).not.toMatch(/createHash|from ["']@rtb\/engineering-review["']|CREATE TABLE/);
    expect(scanAnalysisFormulaBypass(join(here, "review-validation-governance.ts"), sourceText)).toEqual([]);
    const packageJson = JSON.parse(readFileSync(join(here, "../../package.json"), "utf8")) as { dependencies: Record<string, string> };
    expect(Object.keys(packageJson.dependencies).sort()).toEqual(["@rtb/database", "@rtb/engineering-review", "@rtb/platform-commerce", "@rtb/platform-intelligence", "@rtb/platform-kernel", "@rtb/types", "docx", "exceljs", "pptxgenjs", "zod"]);
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D4.R9.REVIEW_AND_VALIDATION_GOVERNANCE")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D4.R10.CURRENTNESS_AND_DIGITAL_THREAD")?.implementationState).toBe("NOT_IMPLEMENTED");
  });
});
