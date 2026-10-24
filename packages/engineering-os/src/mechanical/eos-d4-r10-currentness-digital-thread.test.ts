import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { D4_RUNTIME_COUNT as ARCHITECTURE_RUNTIME_COUNT } from "@rtb/types";
import { describe, expect, it } from "vitest";
import { D2_REOPENED, D2_TRACK_COMPLETE, D3_TRACK_COMPLETE, D4_0_STARTED } from "../geotechnical/geotechnical-bounded-closeout";
import { STRUCTURAL_CAPABILITY_MANIFEST } from "../structural-concrete/capability";
import { scanAnalysisFormulaBypass } from "../structural-systems/formula-scan";
import { D1_STRUCTURAL_PACK_COMPLETE, D1N_REOPENED } from "../structural-systems/structural-pack-sequencing";
import { D4_CONTEXT_AUTHORITY, createD4R1Store, recordMechanicalContext, recordMechanicalObjectIdentity, type D4R1Actor } from "./identity-foundation";
import { createD4R2Store, recordMechanicalEquipmentClassification } from "./equipment-system-context";
import { createD4R3Store, recordMechanicalDesignCondition } from "./design-condition-performance-context";
import { createD4R4Store, recordMechanicalVendorData, recordMechanicalVendorDocument } from "./vendor-data-evidence-context";
import { createD4R5Store, recordMechanicalTechnicalRequirement } from "./mechanical-technical-context";
import { createD4R6Store, recordMechanicalMaintainabilityContext } from "./maintainability-access-package-context";
import { createD4R7Store, recordMechanicalChange } from "./requirements-assumptions-change";
import { createD4R8Store, recordMechanicalInterfaceHandoff } from "./discipline-interfaces-handoffs";
import {
  D4_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT,
  D4_CURRENTNESS_DIGITAL_THREAD_RUNTIME_READY as R9_THREAD_READY,
  D4_R10_STARTED,
  D4_RUNTIME_COUNT as R9_RUNTIME_COUNT,
  createD4R9Store,
  recordMechanicalReviewRequest,
  recordMechanicalValidationState,
  type D4R9Actor,
} from "./review-validation-governance";
import {
  ADMIN_CAN_AUTO_REPOINT_D4_HISTORY,
  ADMIN_EQUALS_D4_MECHANICAL_ENGINEERING_AUTHORITY,
  AI_CAN_AUTO_REPOINT_D4_HISTORY,
  AI_CAN_INFER_AUTHORITATIVE_D4_LINEAGE,
  AI_EQUALS_D4_MECHANICAL_ENGINEERING_AUTHORITY,
  CANONICAL_FINGERPRINT_REUSED,
  D1_STRUCTURAL_PACK_COMPLETE as R10_D1,
  D1N_REOPENED as R10_D1N,
  D2_REOPENED as R10_D2_REOPENED,
  D2_TRACK_COMPLETE as R10_D2,
  D3_REOPENED,
  D3_TRACK_COMPLETE as R10_D3,
  D3_TRACK_COMPLETION_CLASSIFICATION,
  D4_APPROVAL_RUNTIME_COUNT,
  D4_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT,
  D4_AUTOMATIC_REDESIGN_RUNTIME_COUNT,
  D4_CERTIFICATION_RUNTIME_COUNT,
  D4_CONFORMANCE_DETERMINATION_RUNTIME_COUNT,
  D4_CROSS_DISCIPLINE_CONFLICT_DETECTION_RUNTIME_COUNT,
  D4_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT,
  D4_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT,
  D4_CROSS_DISCIPLINE_RECOMMENDATION_RUNTIME_COUNT,
  D4_CURRENTNESS_DIGITAL_THREAD_RUNTIME_COUNT,
  D4_CURRENTNESS_DIGITAL_THREAD_RUNTIME_IMPLEMENTED,
  D4_CURRENTNESS_DIGITAL_THREAD_RUNTIME_READY,
  D4_CURRENTNESS_PROPAGATION_AUTO_RECALCULATES_ENGINEERING,
  D4_CURRENTNESS_PROPAGATION_AUTO_REDESIGNS_ENGINEERING,
  D4_CURRENTNESS_PROPAGATION_AUTO_VALIDATES_ENGINEERING,
  D4_CURRENTNESS_PROPAGATION_REQUIRES_EXPLICIT_RELATIONSHIP,
  D4_D9_RUNTIME_INTEGRATION_COUNT,
  D4_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
  D4_D9_SOURCE_CONTRACT_RUNTIME_READY,
  D4_DIGITAL_THREAD_REFERENCE_AUTO_REPOINTED,
  D4_DISCIPLINE_INTERFACE_RUNTIME_READY,
  D4_EQUALS_D1_STRUCTURAL_AUTHORITY,
  D4_EQUALS_D2_CIVIL_AUTHORITY,
  D4_EQUALS_D3_GEOTECHNICAL_AUTHORITY,
  D4_EQUALS_D5_PIPING_AUTHORITY,
  D4_EQUALS_D6_PROCESS_AUTHORITY,
  D4_EQUALS_D7_ELECTRICAL_AUTHORITY,
  D4_EQUALS_D8_INSTRUMENTATION_CONTROL_AUTHORITY,
  D4_EQUIPMENT_SIZING_RUNTIME_COUNT,
  D4_EXPLICIT_LINEAGE_SUPPORTED,
  D4_FATIGUE_ANALYSIS_RUNTIME_COUNT,
  D4_INFERRED_CURRENTNESS_PROPAGATION_ALLOWED,
  D4_INFERRED_LINEAGE_ALLOWED,
  D4_INTERFACE_COUNTERPART_AUTO_REPOINTED,
  D4_INTERFACE_HISTORICAL_REFERENCE_AUTO_REPOINTED,
  D4_MAINTAINABILITY_ACCESS_PACKAGE_RUNTIME_READY_REUSED,
  D4_MECHANICAL_DESIGN_OPTIMIZATION_RUNTIME_COUNT,
  D4_MECHANICAL_LOAD_CALCULATION_RUNTIME_COUNT,
  D4_R10_AUTO_MUTATES_R3_DESIGN_CONDITION,
  D4_R10_AUTO_MUTATES_R3_PERFORMANCE_CONTEXT,
  D4_R10_AUTO_MUTATES_R5_TECHNICAL_REQUIREMENT,
  D4_R10_AUTO_MUTATES_R6_MAINTAINABILITY_CONTEXT,
  D4_R10_BLOCKER,
  D4_R10_CANONICAL_NEXT_PHASE,
  D4_R10_CANONICAL_NEXT_PHASE_SCOPE,
  D4_R10_DUPLICATE_GOVERNANCE_IMPLEMENTED,
  D4_R10_FINGERPRINT_INTEGRATED,
  D4_R10_HISTORY_PRESERVED,
  D4_R10_MATURITY,
  D4_R10_NEXT_PHASE_TYPE,
  D4_R10_PROVENANCE_PRESERVED,
  D4_R10_PROVENANCE_REQUIRED,
  D4_R10_REPLAY_PROTECTION_IMPLEMENTED,
  D4_R10_SPOOFING_PROTECTION_IMPLEMENTED,
  D4_R10_STATUS,
  D4_R11_STARTED,
  D4_R1_R9_DIGITAL_THREAD_TRACEABLE,
  D4_R1_R9_EXACT_REVISIONS_REUSED,
  D4_R4_VENDOR_DOCUMENT_LINEAGE_INTEGRATED,
  D4_R7_CHANGE_CURRENTNESS_INTEGRATED,
  D4_R7_REASSESSMENT_CURRENTNESS_INTEGRATED,
  D4_R8_INTERFACE_CURRENTNESS_INTEGRATED,
  D4_R9_REVIEW_VALIDATION_CURRENTNESS_INTEGRATED,
  D4_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY,
  D4_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_READY,
  D4_REUSES_CANONICAL_CURRENTNESS,
  D4_REUSES_CANONICAL_DIGITAL_THREAD,
  D4_REUSES_CANONICAL_FINGERPRINT,
  D4_ROTATING_EQUIPMENT_CALCULATION_RUNTIME_COUNT,
  D4_RUNTIME_COUNT,
  D4_RUNTIME_STARTED,
  D4_STATIC_EQUIPMENT_CALCULATION_RUNTIME_COUNT,
  D4_SUPERSESSION_CURRENTNESS_IMPLEMENTED,
  D4_SUPERSESSION_HISTORY_PRESERVED,
  D4_THERMAL_MECHANICAL_CALCULATION_RUNTIME_COUNT,
  D4_VIBRATION_ANALYSIS_RUNTIME_COUNT,
  D5_RUNTIME_STARTED,
  D6_RUNTIME_STARTED,
  D7_RUNTIME_STARTED,
  D8_RUNTIME_STARTED,
  D9_RUNTIME_COUNT,
  D9_RUNTIME_STARTED,
  DATABASE_SCHEMA_CHANGED,
  EXACT_D4_DIGITAL_THREAD_REVISION_REQUIRED,
  FLOATING_D4_DIGITAL_THREAD_REFERENCE_ALLOWED,
  NEW_DEPENDENCY_ADDED,
  NEW_VENDOR_REVISION_AUTO_ADOPTED_AS_ENGINEERING,
  PARALLEL_D4_CURRENTNESS_ENGINE_CREATED,
  PARALLEL_D4_DIGITAL_THREAD_CREATED,
  PRIOR_D4_REVIEW_AUTO_TRANSFERS_TO_NEW_REVISION,
  PRIOR_D4_VALIDATION_AUTO_TRANSFERS_TO_NEW_REVISION,
  REASSESSMENT_REQUIRED_D4_RECORD_EXPOSED_AS_VALIDATED,
  REASSESSMENT_REQUIRED_EQUALS_INVALID,
  SECOND_D4_FINGERPRINT_ALGORITHM_CREATED,
  SILENT_D4_R10_MUTATION_ALLOWED,
  STALE_D4_HANDOFF_EXPOSED_AS_CURRENT,
  STALE_D4_REVISION_EXPOSED_AS_CURRENT,
  STALE_D4_VALIDATION_EXPOSED_AS_CURRENT,
  SUPERSEDED_D4_REVISION_DELETED,
  SUPERSEDED_D4_REVISION_EXPOSED_AS_CURRENT,
  SUPERSEDED_D4_VALIDATION_EXPOSED_AS_CURRENT,
  SUPERSEDED_VENDOR_DOCUMENT_DELETED,
  TENANT_WORKSPACE_PROJECT_D4_R10_SCOPE_ENFORCED,
  adoptVendorRevisionFromCurrentness,
  createD4R10Store,
  exposedMechanicalCurrentness,
  inferMechanicalLineage,
  mutateDesignFromCurrentness,
  mutateMaintainabilityFromCurrentness,
  mutateRequirementFromCurrentness,
  reasonAcrossMechanicalCurrentness,
  recalculateFromMechanicalCurrentness,
  recordMechanicalCurrentness,
  recordMechanicalLineage,
  recordMechanicalSupersession,
  redesignFromMechanicalCurrentness,
  repointMechanicalDigitalThread,
  traceMechanicalDigitalThread,
  transferMechanicalValidationFromCurrentness,
  validateFromMechanicalCurrentness,
  type D4R10Actor,
} from "./currentness-digital-thread";

const actor: D4R10Actor = {
  actorId: "mechanical-recorder",
  tenantId: "tenant-a",
  workspaceId: "workspace-a",
  projectId: "project-a",
  authority: D4_CONTEXT_AUTHORITY,
  actorKind: "human",
};

const reviewer: D4R9Actor = {
  actorId: "mechanical-reviewer",
  tenantId: "tenant-a",
  workspaceId: "workspace-a",
  projectId: "project-a",
  authority: "REVIEWER",
  actorKind: "human",
  aal: "aal2",
};

const recorder = actor as D4R1Actor;

const R11_SCOPE = "Implement one governed D4 Mechanical source contract for future D9 consumption using exact R1-R10 Mechanical revisions. Expose governed Mechanical facts and metadata, including identity, equipment/system context, design/performance context, vendor evidence, technical requirements, maintainability/access/package context, requirements/assumptions/decisions/change, interfaces, review/validation, currentness, lineage, authority, limitations, provenance and fingerprint. Do not create new engineering facts, derive values, perform calculations, fabricate counterpart information, transfer authority, perform cross-discipline reasoning or start D9 runtime.";

function end(subjectKind: string, subjectId: string, subjectRevision: string, subjectFingerprint: string) {
  return { subjectKind, subjectId, subjectRevision, subjectFingerprint };
}

describe("EOS-D4-R10 currentness and digital thread", () => {
  it("connects exact Mechanical revisions through explicit lineage without rewriting engineering", () => {
    expect(D4_R10_STATUS).toBe("CURRENTNESS_AND_DIGITAL_THREAD_IMPLEMENTED");
    expect(D4_R10_MATURITY).toBe(D4_R10_STATUS);
    expect(D4_RUNTIME_STARTED).toBe(true);
    expect(D4_RUNTIME_COUNT).toBe(10);
    expect(R9_RUNTIME_COUNT).toBe(9);
    expect(ARCHITECTURE_RUNTIME_COUNT).toBe(0);
    expect(D4_0_STARTED).toBe(false);
    expect(D4_R10_STARTED).toBe(false);
    expect(D4_R11_STARTED).toBe(false);
    expect(R9_THREAD_READY).toBe(false);
    expect(D4_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT).toBe(0);
    expect(D4_CURRENTNESS_DIGITAL_THREAD_RUNTIME_IMPLEMENTED).toBe(true);
    expect(D4_CURRENTNESS_DIGITAL_THREAD_RUNTIME_COUNT).toBe(1);
    expect(D4_CURRENTNESS_DIGITAL_THREAD_RUNTIME_READY).toBe(true);
    expect(D4_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_READY).toBe(true);
    expect(D4_DISCIPLINE_INTERFACE_RUNTIME_READY).toBe(true);
    expect(D4_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY).toBe(true);
    expect(D4_MAINTAINABILITY_ACCESS_PACKAGE_RUNTIME_READY_REUSED).toBe(true);
    expect(D4_D9_SOURCE_CONTRACT_RUNTIME_READY).toBe(false);
    expect(D4_REUSES_CANONICAL_CURRENTNESS).toBe(true);
    expect(D4_REUSES_CANONICAL_DIGITAL_THREAD).toBe(true);
    expect(D4_REUSES_CANONICAL_FINGERPRINT).toBe(true);
    expect(PARALLEL_D4_CURRENTNESS_ENGINE_CREATED).toBe(false);
    expect(PARALLEL_D4_DIGITAL_THREAD_CREATED).toBe(false);
    expect(SECOND_D4_FINGERPRINT_ALGORITHM_CREATED).toBe(false);
    expect(CANONICAL_FINGERPRINT_REUSED).toBe(true);
    expect(D4_R10_FINGERPRINT_INTEGRATED).toBe(true);
    expect(D4_R1_R9_EXACT_REVISIONS_REUSED).toBe(true);
    expect(EXACT_D4_DIGITAL_THREAD_REVISION_REQUIRED).toBe(true);
    expect(FLOATING_D4_DIGITAL_THREAD_REFERENCE_ALLOWED).toBe(false);
    expect(D4_DIGITAL_THREAD_REFERENCE_AUTO_REPOINTED).toBe(false);
    expect(D4_EXPLICIT_LINEAGE_SUPPORTED).toBe(true);
    expect(D4_INFERRED_LINEAGE_ALLOWED).toBe(false);
    expect(D4_SUPERSESSION_CURRENTNESS_IMPLEMENTED).toBe(true);
    expect(SUPERSEDED_D4_REVISION_EXPOSED_AS_CURRENT).toBe(false);
    expect(STALE_D4_REVISION_EXPOSED_AS_CURRENT).toBe(false);
    expect(SUPERSEDED_D4_REVISION_DELETED).toBe(false);
    expect(D4_SUPERSESSION_HISTORY_PRESERVED).toBe(true);
    expect(D4_R7_CHANGE_CURRENTNESS_INTEGRATED).toBe(true);
    expect(D4_R7_REASSESSMENT_CURRENTNESS_INTEGRATED).toBe(true);
    expect(REASSESSMENT_REQUIRED_D4_RECORD_EXPOSED_AS_VALIDATED).toBe(false);
    expect(REASSESSMENT_REQUIRED_EQUALS_INVALID).toBe(false);
    expect(D4_R9_REVIEW_VALIDATION_CURRENTNESS_INTEGRATED).toBe(true);
    expect(PRIOR_D4_REVIEW_AUTO_TRANSFERS_TO_NEW_REVISION).toBe(false);
    expect(PRIOR_D4_VALIDATION_AUTO_TRANSFERS_TO_NEW_REVISION).toBe(false);
    expect(STALE_D4_VALIDATION_EXPOSED_AS_CURRENT).toBe(false);
    expect(SUPERSEDED_D4_VALIDATION_EXPOSED_AS_CURRENT).toBe(false);
    expect(D4_R8_INTERFACE_CURRENTNESS_INTEGRATED).toBe(true);
    expect(D4_INTERFACE_HISTORICAL_REFERENCE_AUTO_REPOINTED).toBe(false);
    expect(D4_INTERFACE_COUNTERPART_AUTO_REPOINTED).toBe(false);
    expect(STALE_D4_HANDOFF_EXPOSED_AS_CURRENT).toBe(false);
    expect(D4_R4_VENDOR_DOCUMENT_LINEAGE_INTEGRATED).toBe(true);
    expect(NEW_VENDOR_REVISION_AUTO_ADOPTED_AS_ENGINEERING).toBe(false);
    expect(SUPERSEDED_VENDOR_DOCUMENT_DELETED).toBe(false);
    expect(D4_R10_AUTO_MUTATES_R3_DESIGN_CONDITION).toBe(false);
    expect(D4_R10_AUTO_MUTATES_R3_PERFORMANCE_CONTEXT).toBe(false);
    expect(D4_R10_AUTO_MUTATES_R5_TECHNICAL_REQUIREMENT).toBe(false);
    expect(D4_R10_AUTO_MUTATES_R6_MAINTAINABILITY_CONTEXT).toBe(false);
    expect(D4_CURRENTNESS_PROPAGATION_REQUIRES_EXPLICIT_RELATIONSHIP).toBe(true);
    expect(D4_INFERRED_CURRENTNESS_PROPAGATION_ALLOWED).toBe(false);
    expect(D4_CURRENTNESS_PROPAGATION_AUTO_RECALCULATES_ENGINEERING).toBe(false);
    expect(D4_CURRENTNESS_PROPAGATION_AUTO_REDESIGNS_ENGINEERING).toBe(false);
    expect(D4_CURRENTNESS_PROPAGATION_AUTO_VALIDATES_ENGINEERING).toBe(false);
    expect(D4_R1_R9_DIGITAL_THREAD_TRACEABLE).toBe(true);
    expect(D4_R10_PROVENANCE_REQUIRED).toBe(true);
    expect(D4_R10_PROVENANCE_PRESERVED).toBe(true);
    expect(SILENT_D4_R10_MUTATION_ALLOWED).toBe(false);
    expect(D4_R10_HISTORY_PRESERVED).toBe(true);
    expect(TENANT_WORKSPACE_PROJECT_D4_R10_SCOPE_ENFORCED).toBe(true);
    expect(AI_EQUALS_D4_MECHANICAL_ENGINEERING_AUTHORITY).toBe(false);
    expect(ADMIN_EQUALS_D4_MECHANICAL_ENGINEERING_AUTHORITY).toBe(false);
    expect(AI_CAN_INFER_AUTHORITATIVE_D4_LINEAGE).toBe(false);
    expect(AI_CAN_AUTO_REPOINT_D4_HISTORY).toBe(false);
    expect(ADMIN_CAN_AUTO_REPOINT_D4_HISTORY).toBe(false);
    expect(D4_EQUALS_D1_STRUCTURAL_AUTHORITY).toBe(false);
    expect(D4_EQUALS_D2_CIVIL_AUTHORITY).toBe(false);
    expect(D4_EQUALS_D3_GEOTECHNICAL_AUTHORITY).toBe(false);
    expect(D4_EQUALS_D5_PIPING_AUTHORITY).toBe(false);
    expect(D4_EQUALS_D6_PROCESS_AUTHORITY).toBe(false);
    expect(D4_EQUALS_D7_ELECTRICAL_AUTHORITY).toBe(false);
    expect(D4_EQUALS_D8_INSTRUMENTATION_CONTROL_AUTHORITY).toBe(false);
    expect([
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
      D9_RUNTIME_COUNT,
    ]).toEqual(Array(20).fill(0));
    expect(D5_RUNTIME_STARTED).toBe(false);
    expect(D6_RUNTIME_STARTED).toBe(false);
    expect(D7_RUNTIME_STARTED).toBe(false);
    expect(D8_RUNTIME_STARTED).toBe(false);
    expect(D9_RUNTIME_STARTED).toBe(false);
    expect(D1_STRUCTURAL_PACK_COMPLETE).toBe(false);
    expect(R10_D1).toBe(false);
    expect(D1N_REOPENED).toBe(false);
    expect(R10_D1N).toBe(false);
    expect(D2_TRACK_COMPLETE).toBe(true);
    expect(R10_D2).toBe(true);
    expect(D2_REOPENED).toBe(false);
    expect(R10_D2_REOPENED).toBe(false);
    expect(D3_TRACK_COMPLETE).toBe(true);
    expect(R10_D3).toBe(true);
    expect(D3_TRACK_COMPLETION_CLASSIFICATION).toBe("COMPLETE_BOUNDED_WITH_LIMITATIONS");
    expect(D3_REOPENED).toBe(false);
    expect(DATABASE_SCHEMA_CHANGED).toBe(false);
    expect(NEW_DEPENDENCY_ADDED).toBe(false);
    expect(D4_R10_DUPLICATE_GOVERNANCE_IMPLEMENTED).toBe(true);
    expect(D4_R10_REPLAY_PROTECTION_IMPLEMENTED).toBe(true);
    expect(D4_R10_SPOOFING_PROTECTION_IMPLEMENTED).toBe(true);
    expect(D4_R10_CANONICAL_NEXT_PHASE).toBe("EOS-D4-R11-D9-SOURCE-CONTRACT");
    expect(D4_R10_NEXT_PHASE_TYPE).toBe("D9_SOURCE_CONTRACT");
    expect(D4_R10_CANONICAL_NEXT_PHASE_SCOPE).toBe(R11_SCOPE);
    expect(D4_R10_BLOCKER).toBe("NONE");

    const r1 = createD4R1Store();
    const context = recordMechanicalContext(r1, recorder, { contextId: "mechanical-context-1", citedLifecycleStage: "FEED", provenanceRef: "prov-context" });
    const equipment = recordMechanicalObjectIdentity(r1, recorder, { objectId: "pump-identity-1", contextId: context.contextId, objectType: "ROTATING_EQUIPMENT", citedLifecycleStage: "FEED", provenanceRef: "prov-pump" });
    const r2 = createD4R2Store(r1);
    const classification = recordMechanicalEquipmentClassification(r2, recorder, { classificationId: "class-1", contextId: context.contextId, objectId: equipment.objectId, objectRevisionFingerprint: equipment.fingerprint, classification: "PUMP", citedLifecycleStage: "FEED", provenanceRef: "prov-class", citedCurrentness: "CURRENT" });
    const r3 = createD4R3Store(r2);
    const design = recordMechanicalDesignCondition(r3, recorder, {
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
    const document = recordMechanicalVendorDocument(r4, recorder, { ...upstream, recordId: "vendor-doc", documentRef: "MM-100", documentRevision: "C", evidenceClass: "MANUAL", sourceStatus: "FOR_INFORMATION" });
    const newerDocument = recordMechanicalVendorDocument(r4, recorder, { ...upstream, recordId: "vendor-doc-d", documentRef: "MM-100", documentRevision: "D", evidenceClass: "MANUAL", sourceStatus: "FOR_INFORMATION", provenanceRef: "prov-vendor-d" });
    const vendorData = recordMechanicalVendorData(r4, recorder, { ...upstream, recordId: "vendor-mass", documentRef: "MM-100", documentRevision: "C", evidenceClass: "VENDOR_DATASHEET", dataKind: "DRY_MASS", suppliedValue: "500", unit: "kg", parentDocumentId: document.recordId, parentDocumentFingerprint: document.fingerprint });
    const r5 = createD4R5Store(r4);
    const requirement = recordMechanicalTechnicalRequirement(r5, recorder, {
      ...upstream, r4RecordId: vendorData.recordId, r4RevisionFingerprint: vendorData.fingerprint, applicabilityObjectId: equipment.objectId, applicabilityCase: "NORMAL_OPERATION",
      limitations: "This pump identity only", provenanceRef: "prov-requirement", recordId: "maint-requirement", subjectKind: "MECHANICAL_EQUIPMENT_REQUIREMENT",
      requirementStatement: "Provide a governed maintenance envelope for this pump", sourceBasis: "PROJECT_SPECIFICATION", sourceRef: "spec-100", sourceRevision: "A", adoptionRationale: "Adopted maintenance envelope requirement",
    });
    const r6 = createD4R6Store(r5);
    const envelope = recordMechanicalMaintainabilityContext(r6, recorder, {
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
    const change = recordMechanicalChange(r7, recorder, {
      ...changeSubject, changeContextId: "change-reassess", changeCategory: "REASSESSMENT_REQUIRED", originRef: "spec-100-rev-b", reason: "Support context requires reassessment",
      dependencies: [{ kind: "OBJECT_REFERENCE", targetKind: "R6_MAINTAINABILITY", targetId: envelope.recordId, targetFingerprint: envelope.fingerprint }],
    });
    const r8 = createD4R8Store(r7);
    const handoff = recordMechanicalInterfaceHandoff(r8, recorder, {
      ...changeSubject, citedCurrentness: "CURRENT", provenanceRef: "prov-handoff", limitations: "Handoff does not design the counterpart",
      handoffId: "handoff-missing", counterpartDiscipline: "structural", direction: "D4_TO_COUNTERPART", interfaceTopic: "ANCHOR_OR_INTERFACE_REQUIREMENTS",
      counterpartInterfaceId: null, counterpartSourceRevision: null, handoffStatus: "AWAITING_COUNTERPART",
    });
    const r9 = createD4R9Store(r8);
    const chain = {
      ...changeSubject,
      r8HandoffId: handoff.handoffId,
      r8RevisionFingerprint: handoff.fingerprint,
      subjectKind: "DESIGN" as const,
      subjectId: design.recordId,
      subjectRevision: design.provenanceRef,
      subjectFingerprint: design.fingerprint,
      applicability: "NORMAL_OPERATION",
      limitations: "Review of this exact design revision only",
      provenanceRef: "prov-review",
      citedLifecycleStage: "FEED" as const,
    };
    const request = recordMechanicalReviewRequest(r9, recorder, {
      ...chain, citedCurrentness: "CURRENT", reviewRequestId: "review-1", reviewType: "MECHANICAL_SUBJECT_REVIEW", reviewScope: "Casing design pressure context", requestedReviewerAuthority: "REVIEWER",
    });
    const validated = recordMechanicalValidationState(r9, reviewer, {
      ...chain, citedCurrentness: "CURRENT", validationId: "validation-1", validationState: "VALIDATED", validationScope: "Design pressure context with basis",
      basis: [{ kind: "R3_DESIGN", id: design.recordId, fingerprint: design.fingerprint }],
    });
    const store = createD4R10Store(r9);
    const pins = {
      object: end("OBJECT", equipment.objectId, equipment.provenanceRef, equipment.fingerprint),
      classification: end("CLASSIFICATION", classification.classificationId, classification.provenanceRef, classification.fingerprint),
      design: end("DESIGN", design.recordId, design.provenanceRef, design.fingerprint),
      document: end("VENDOR_DOCUMENT", document.recordId, document.provenanceRef, document.fingerprint),
      newer: end("VENDOR_DOCUMENT", newerDocument.recordId, newerDocument.provenanceRef, newerDocument.fingerprint),
      technical: end("TECHNICAL", requirement.recordId, requirement.provenanceRef, requirement.fingerprint),
      maintainability: end("MAINTAINABILITY", envelope.recordId, envelope.provenanceRef, envelope.fingerprint),
      change: end("CHANGE", change.changeContextId, change.provenanceRef, change.fingerprint),
      handoff: end("HANDOFF", handoff.handoffId, handoff.provenanceRef, handoff.fingerprint),
      review: end("REVIEW_REQUEST", request.reviewRequestId, request.subjectRevision, request.fingerprint),
      validation: end("VALIDATION", validated.validationId, validated.subjectRevision, validated.fingerprint),
    };
    const pairs = [
      ["line-1", pins.object, pins.classification],
      ["line-2", pins.object, pins.design],
      ["line-3", pins.object, pins.document],
      ["line-4", pins.object, pins.technical],
      ["line-5", pins.object, pins.maintainability],
      ["line-6", pins.object, pins.change],
      ["line-7", pins.object, pins.handoff],
      ["line-8", pins.object, pins.review],
      ["line-9", pins.object, pins.validation],
      ["line-10", pins.design, pins.document],
      ["line-11", pins.document, pins.technical],
      ["line-12", pins.technical, pins.maintainability],
    ] as const;
    const edges = pairs.map(([lineageId, source, target]) => recordMechanicalLineage(store, actor, {
      lineageId, contextId: context.contextId, source, target, relationshipType: "DEPENDS_ON", citedCurrentness: "CURRENT", provenanceRef: `prov-${lineageId}`,
    }));
    expect(edges.every((row) => row.engineeringValidated === false)).toBe(true);
    const replay = recordMechanicalLineage(store, actor, {
      lineageId: "line-1", contextId: context.contextId, source: pins.object, target: pins.classification, relationshipType: "DEPENDS_ON", citedCurrentness: "CURRENT", provenanceRef: "prov-line-1",
    });
    expect(replay.fingerprint).toBe(edges[0]?.fingerprint);
    const trace = traceMechanicalDigitalThread(store, actor, { contextId: context.contextId, subject: pins.object, citedCurrentness: "CURRENT" });
    const traced = trace.nodes.map((row) => row.subjectKind);
    expect(traced).toEqual(["OBJECT", "CLASSIFICATION", "DESIGN", "VENDOR_DOCUMENT", "TECHNICAL", "MAINTAINABILITY", "CHANGE", "HANDOFF", "REVIEW_REQUEST", "VALIDATION"]);
    expect(trace.nodes.some((row) => row.subjectId === newerDocument.recordId)).toBe(false);
    expect(trace.currentness).toBe("CURRENT");
    const documentEdge = edges.find((row) => row.lineageId === "line-10");
    const preservedEdge = documentEdge?.fingerprint;
    const superseded = recordMechanicalSupersession(store, actor, {
      supersessionId: "super-doc", contextId: context.contextId, predecessor: pins.document, successor: pins.newer, citedCurrentness: "CURRENT", provenanceRef: "prov-super-doc",
    });
    expect(superseded.deleted).toBe(false);
    expect(superseded.historicalEdgesRewritten).toBe(false);
    expect(exposedMechanicalCurrentness(store, superseded.predecessor)).toBe("SUPERSEDED");
    expect(exposedMechanicalCurrentness(store, superseded.predecessor)).not.toBe("CURRENT");
    expect(document.recordStatus).toBe("CURRENT");
    expect(r4.records.some((row) => row.recordId === document.recordId)).toBe(true);
    expect(documentEdge?.fingerprint).toBe(preservedEdge);
    expect(documentEdge?.target.subjectFingerprint).toBe(document.fingerprint);
    expect(design.suppliedValue).toBe("10");
    expect(vendorData.suppliedValue).toBe("500");
    const propagated = recordMechanicalCurrentness(store, actor, {
      eventId: "mark-design-stale", contextId: context.contextId, subject: pins.design, currentness: "STALE", propagate: true, provenanceRef: "prov-stale-design",
    });
    expect(propagated[0]?.currentness).toBe("STALE");
    expect(propagated[0]?.engineeringValidated).toBe(false);
    expect(propagated[0]?.contentMutated).toBe(false);
    expect(propagated.some((row) => row.subject.subjectId === requirement.recordId && row.currentness === "STALE")).toBe(true);
    expect(propagated.some((row) => row.subject.subjectId === newerDocument.recordId)).toBe(false);
    expect(design.suppliedValue).toBe("10");
    expect(requirement.requirementStatement).toBe("Provide a governed maintenance envelope for this pump");
    expect(envelope.statement).toBe("Maintain a service envelope around the non-drive end");
    const reassess = recordMechanicalCurrentness(store, actor, {
      eventId: "mark-change", contextId: context.contextId, subject: pins.change, currentness: "REASSESSMENT_REQUIRED", provenanceRef: "prov-reassess",
    });
    expect(reassess[0]?.engineeringValidated).toBe(false);
    expect(reassess[0]?.currentness).toBe("REASSESSMENT_REQUIRED");
    expect(change.recalculated).toBe(false);
    expect(change.redesigned).toBe(false);
    const handoffMark = recordMechanicalCurrentness(store, actor, {
      eventId: "mark-handoff", contextId: context.contextId, subject: pins.handoff, currentness: "STALE", provenanceRef: "prov-handoff-stale",
    });
    expect(handoffMark[0]?.currentness).toBe("STALE");
    expect(handoff.fingerprint).toBe(pins.handoff.subjectFingerprint);
    expect(handoff.counterpart).toBeNull();
    const validationMark = recordMechanicalCurrentness(store, actor, {
      eventId: "mark-validation", contextId: context.contextId, subject: pins.validation, currentness: "STALE", provenanceRef: "prov-validation-stale",
    });
    expect(validationMark[0]?.currentness).not.toBe("CURRENT");
    expect(validated.engineeringValidated).toBe(true);
    expect(validated.subjectRevision).toBe(design.provenanceRef);
    expect(validated.subjectFingerprint).toBe(design.fingerprint);
    expect(request.reviewCompleted).toBe(false);
    expect(store.history.some((row) => row.subjectId === superseded.supersessionId && row.fingerprint === superseded.fingerprint)).toBe(true);

    expect(() => recordMechanicalLineage(store, actor, { lineageId: "line-float", contextId: context.contextId, source: { ...pins.object, subjectRevision: "latest" }, target: pins.design, relationshipType: "DEPENDS_ON", citedCurrentness: "CURRENT", provenanceRef: "prov-float" })).toThrow(/D4_R10_SUBJECT_REVISION_REQUIRED/);
    expect(() => recordMechanicalLineage(store, actor, { lineageId: "line-dup", contextId: context.contextId, source: pins.object, target: pins.classification, relationshipType: "DEPENDS_ON", citedCurrentness: "CURRENT", provenanceRef: "prov-dup" })).toThrow(/D4_R10_DUPLICATE_LINEAGE_REJECTED/);
    expect(() => recordMechanicalLineage(store, actor, { lineageId: "line-infer", contextId: context.contextId, source: pins.object, target: pins.newer, relationshipType: "DEPENDS_ON", citedCurrentness: "CURRENT", provenanceRef: "prov-infer", infer: true })).toThrow(/D4_R10_INFERRED_LINEAGE_REJECTED/);
    expect(() => recordMechanicalLineage(store, { ...actor, actorId: "AI-recorder", actorKind: "ai" }, { lineageId: "line-ai", contextId: context.contextId, source: pins.object, target: pins.newer, relationshipType: "DEPENDS_ON", citedCurrentness: "CURRENT", provenanceRef: "prov-ai" })).toThrow(/D4_R10_AI_CANNOT_INFER_LINEAGE/);
    expect(() => recordMechanicalLineage(store, { ...actor, authority: "ADMIN" }, { lineageId: "line-admin", contextId: context.contextId, source: pins.object, target: pins.newer, relationshipType: "DEPENDS_ON", citedCurrentness: "CURRENT", provenanceRef: "prov-admin" })).toThrow(/D4_R10_ADMIN_CANNOT_REPOINT/);
    expect(() => recordMechanicalLineage(store, actor, { lineageId: "line-scope", contextId: context.contextId, tenantId: "tenant-b", source: pins.object, target: pins.newer, relationshipType: "DEPENDS_ON", citedCurrentness: "CURRENT", provenanceRef: "prov-scope" })).toThrow(/D4_R10_CROSS_TENANT_OPERATION/);
    expect(() => recordMechanicalLineage(store, actor, { lineageId: "line-fp", contextId: context.contextId, source: pins.object, target: pins.newer, relationshipType: "DEPENDS_ON", citedCurrentness: "CURRENT", provenanceRef: "prov-fp", assertedFingerprint: "wrong" })).toThrow(/D4_R10_FINGERPRINT_MISMATCH/);
    expect(() => recordMechanicalCurrentness(store, actor, { eventId: "mark-transfer", contextId: context.contextId, subject: { ...pins.validation, subjectFingerprint: "other-fingerprint" }, currentness: "STALE", provenanceRef: "prov-transfer", transferValidation: true })).toThrow(/D4_R10_VALIDATION_TRANSFER_REJECTED/);
    expect(() => recordMechanicalCurrentness(store, actor, { eventId: "mark-mutate", contextId: context.contextId, subject: pins.design, currentness: "STALE", provenanceRef: "prov-mutate", mutateR3: true })).toThrow(/D4_R10_R3_MUTATION_REJECTED/);
    expect(() => recordMechanicalCurrentness(store, actor, { eventId: "mark-promote", contextId: context.contextId, subject: pins.design, currentness: "CURRENT", provenanceRef: "prov-promote" })).toThrow(/D4_R10_CURRENTNESS_PROMOTION_REJECTED/);
    expect(design.suppliedValue).toBe("10");
    expect(handoff.fingerprint).toBe(pins.handoff.subjectFingerprint);
    expect(validated.subjectFingerprint).toBe(design.fingerprint);

    expect(repointMechanicalDigitalThread).toThrow(/D4_R10_AUTO_REPOINT_REJECTED/);
    expect(inferMechanicalLineage).toThrow(/D4_R10_INFERRED_LINEAGE_REJECTED/);
    expect(adoptVendorRevisionFromCurrentness).toThrow(/D4_R10_VENDOR_AUTO_ADOPTION_REJECTED/);
    expect(transferMechanicalValidationFromCurrentness).toThrow(/D4_R10_VALIDATION_TRANSFER_REJECTED/);
    expect(mutateDesignFromCurrentness).toThrow(/D4_R10_R3_MUTATION_REJECTED/);
    expect(mutateRequirementFromCurrentness).toThrow(/D4_R10_R5_MUTATION_REJECTED/);
    expect(mutateMaintainabilityFromCurrentness).toThrow(/D4_R10_R6_MUTATION_REJECTED/);
    expect(recalculateFromMechanicalCurrentness).toThrow(/D4_R10_RECALCULATION_NOT_IN_R10/);
    expect(redesignFromMechanicalCurrentness).toThrow(/D4_R10_REDESIGN_NOT_IN_R10/);
    expect(validateFromMechanicalCurrentness).toThrow(/D4_R10_VALIDATION_NOT_IN_R10/);
    expect(reasonAcrossMechanicalCurrentness).toThrow(/D4_R10_CROSS_DISCIPLINE_REASONING_NOT_IN_R10/);

    const here = dirname(fileURLToPath(import.meta.url));
    const sourceText = readFileSync(join(here, "currentness-digital-thread.ts"), "utf8");
    expect(sourceText).toContain("fingerprintCanonical");
    expect(sourceText).toContain("relationSemantics");
    expect(sourceText).toContain("THREAD_DEFAULT_MAX_DEPTH");
    expect(sourceText).toContain("D4_CURRENTNESS_STATES");
    expect(sourceText).not.toMatch(/createHash|from ["']@rtb\/engineering-review["']|CREATE TABLE/);
    expect(scanAnalysisFormulaBypass(join(here, "currentness-digital-thread.ts"), sourceText)).toEqual([]);
    const packageJson = JSON.parse(readFileSync(join(here, "../../package.json"), "utf8")) as { dependencies: Record<string, string> };
    expect(Object.keys(packageJson.dependencies).sort()).toEqual(["@rtb/database", "@rtb/engineering-review", "@rtb/platform-commerce", "@rtb/platform-intelligence", "@rtb/platform-kernel", "@rtb/types", "docx", "exceljs", "pptxgenjs", "zod"]);
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D4.R10.CURRENTNESS_AND_DIGITAL_THREAD")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D4.R11.D9_SOURCE_CONTRACT")?.implementationState).toBe("NOT_IMPLEMENTED");
  });
});
