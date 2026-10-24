import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { D4_D9_SOURCE_CONTRACT_RUNTIME_COUNT as ARCHITECTURE_SOURCE_COUNT, D4_RUNTIME_COUNT as ARCHITECTURE_RUNTIME_COUNT } from "@rtb/types";
import { describe, expect, it } from "vitest";
import { D2_REOPENED, D2_TRACK_COMPLETE, D3_TRACK_COMPLETE, D4_0_STARTED } from "../geotechnical/geotechnical-bounded-closeout";
import { STRUCTURAL_CAPABILITY_MANIFEST } from "../structural-concrete/capability";
import { scanAnalysisFormulaBypass } from "../structural-systems/formula-scan";
import { D1_STRUCTURAL_PACK_COMPLETE, D1N_REOPENED } from "../structural-systems/structural-pack-sequencing";
import { D4_CONTEXT_AUTHORITY, createD4R1Store, recordMechanicalContext, recordMechanicalObjectIdentity } from "./identity-foundation";
import { createD4R2Store, recordMechanicalEquipmentClassification } from "./equipment-system-context";
import { createD4R3Store, recordMechanicalDesignCondition } from "./design-condition-performance-context";
import { createD4R4Store, recordMechanicalVendorData, recordMechanicalVendorDocument } from "./vendor-data-evidence-context";
import { createD4R5Store, recordMechanicalTechnicalRequirement } from "./mechanical-technical-context";
import { createD4R6Store, recordMechanicalMaintainabilityContext } from "./maintainability-access-package-context";
import { createD4R7Store, recordMechanicalChange } from "./requirements-assumptions-change";
import { createD4R8Store, recordMechanicalInterfaceHandoff } from "./discipline-interfaces-handoffs";
import { createD4R9Store, recordMechanicalReviewRequest, recordMechanicalValidationState, type D4R9Actor } from "./review-validation-governance";
import {
  D4_D9_SOURCE_CONTRACT_RUNTIME_COUNT as R10_SOURCE_COUNT,
  D4_D9_SOURCE_CONTRACT_RUNTIME_READY as R10_SOURCE_READY,
  D4_R11_STARTED,
  D4_RUNTIME_COUNT as R10_RUNTIME_COUNT,
  createD4R10Store,
  recordMechanicalCurrentness,
  recordMechanicalLineage,
  recordMechanicalSupersession,
  type D4R10Actor,
} from "./currentness-digital-thread";
import {
  ADMIN_EQUALS_D4_MECHANICAL_ENGINEERING_AUTHORITY,
  AI_EQUALS_D4_MECHANICAL_ENGINEERING_AUTHORITY,
  CROSS_TENANT_D4_D9_SOURCE_ACCESS_ALLOWED,
  D1_STRUCTURAL_PACK_COMPLETE as R11_D1,
  D1N_REOPENED as R11_D1N,
  D2_REOPENED as R11_D2_REOPENED,
  D2_TRACK_COMPLETE as R11_D2,
  D3_REOPENED,
  D3_TRACK_COMPLETE as R11_D3,
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
  D4_CURRENTNESS_DIGITAL_THREAD_RUNTIME_READY,
  D4_D9_RUNTIME_INTEGRATION_COUNT,
  D4_D9_SOURCE_CONTRACT_AUTO_APPROVES_ENGINEERING,
  D4_D9_SOURCE_CONTRACT_AUTO_CERTIFIES_ENGINEERING,
  D4_D9_SOURCE_CONTRACT_AUTO_REPOINTS_HISTORY,
  D4_D9_SOURCE_CONTRACT_AUTO_VALIDATES_ENGINEERING,
  D4_D9_SOURCE_CONTRACT_CALCULATION_RUNTIME_COUNT,
  D4_D9_SOURCE_CONTRACT_CREATES_D9_ENGINEERING_AUTHORITY,
  D4_D9_SOURCE_CONTRACT_CREATES_NEW_ENGINEERING_FACT,
  D4_D9_SOURCE_CONTRACT_DERIVES_NEW_ENGINEERING_VALUE,
  D4_D9_SOURCE_CONTRACT_EXPOSES_AUTHORITY,
  D4_D9_SOURCE_CONTRACT_EXPOSES_CURRENTNESS,
  D4_D9_SOURCE_CONTRACT_EXPOSES_FINGERPRINT,
  D4_D9_SOURCE_CONTRACT_EXPOSES_GOVERNED_D4_FACTS,
  D4_D9_SOURCE_CONTRACT_EXPOSES_LIMITATIONS,
  D4_D9_SOURCE_CONTRACT_EXPOSES_LINEAGE,
  D4_D9_SOURCE_CONTRACT_EXPOSES_PROVENANCE,
  D4_D9_SOURCE_CONTRACT_EXPOSES_REVIEW_VALIDATION_STATE,
  D4_D9_SOURCE_CONTRACT_FABRICATES_COUNTERPART,
  D4_D9_SOURCE_CONTRACT_GENERATES_NEW_DECISION,
  D4_D9_SOURCE_CONTRACT_GENERATES_NEW_RECOMMENDATION,
  D4_D9_SOURCE_CONTRACT_GENERATES_NEW_REQUIREMENT,
  D4_D9_SOURCE_CONTRACT_HIDDEN_CALCULATION_ALLOWED,
  D4_D9_SOURCE_CONTRACT_INFERS_LINEAGE,
  D4_D9_SOURCE_CONTRACT_INFERS_MISSING_COUNTERPART,
  D4_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
  D4_D9_SOURCE_CONTRACT_RUNTIME_IMPLEMENTED,
  D4_D9_SOURCE_CONTRACT_RUNTIME_READY,
  D4_D9_SOURCE_CONTRACT_TRANSFERS_ENGINEERING_AUTHORITY,
  D4_D9_SOURCE_LIMITATIONS_PRESERVED,
  D4_D9_SOURCE_PROVENANCE_PRESERVED,
  D4_D9_SOURCE_PROVENANCE_REQUIRED,
  D4_D9_SOURCE_REFERENCE_AUTO_REPOINTED,
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
  D4_MAINTAINABILITY_ACCESS_PACKAGE_RUNTIME_READY_REUSED,
  D4_MECHANICAL_DESIGN_OPTIMIZATION_RUNTIME_COUNT,
  D4_MECHANICAL_LOAD_CALCULATION_RUNTIME_COUNT,
  D4_R10_CURRENTNESS_REUSED_BY_SOURCE_CONTRACT,
  D4_R10_LINEAGE_REUSED_BY_SOURCE_CONTRACT,
  D4_R11_AUTO_MUTATES_R10_CURRENTNESS,
  D4_R11_AUTO_MUTATES_R3_DESIGN_CONDITION,
  D4_R11_AUTO_MUTATES_R3_PERFORMANCE_CONTEXT,
  D4_R11_AUTO_MUTATES_R4_VENDOR_EVIDENCE,
  D4_R11_AUTO_MUTATES_R5_TECHNICAL_REQUIREMENT,
  D4_R11_AUTO_MUTATES_R6_MAINTAINABILITY_CONTEXT,
  D4_R11_AUTO_MUTATES_R7_CHANGE_GOVERNANCE,
  D4_R11_AUTO_MUTATES_R8_INTERFACE_HANDOFF,
  D4_R11_AUTO_MUTATES_R9_VALIDATION_STATE,
  D4_R11_BLOCKER,
  D4_R11_CANONICAL_NEXT_PHASE,
  D4_R11_CANONICAL_NEXT_PHASE_SCOPE,
  D4_R11_DUPLICATE_GOVERNANCE_IMPLEMENTED,
  D4_R11_HISTORY_PRESERVED,
  D4_R11_MATURITY,
  D4_R11_NEXT_PHASE_TYPE,
  D4_R11_REPLAY_PROTECTION_IMPLEMENTED,
  D4_R11_SPOOFING_PROTECTION_IMPLEMENTED,
  D4_R11_STATUS,
  D4_R12_STARTED,
  D4_R1_R10_EXACT_SOURCE_REVISIONS_REUSED,
  D4_R8_INTERFACE_RECORDS_REUSED,
  D4_R9_REVIEW_VALIDATION_STATE_REUSED,
  D4_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY,
  D4_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_READY,
  D4_REUSES_CANONICAL_CURRENTNESS,
  D4_REUSES_CANONICAL_DIGITAL_THREAD,
  D4_REUSES_CANONICAL_FINGERPRINT,
  D4_ROTATING_EQUIPMENT_CALCULATION_RUNTIME_COUNT,
  D4_RUNTIME_COUNT,
  D4_RUNTIME_STARTED,
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
  EXACT_D4_D9_INTERFACE_REVISION_REQUIRED,
  EXACT_D4_D9_SOURCE_REVISION_REQUIRED,
  FLOATING_D4_D9_SOURCE_REFERENCE_ALLOWED,
  MISSING_COUNTERPART_EQUALS_INTERFACE_COMPLETE,
  NEW_DEPENDENCY_ADDED,
  PARALLEL_D4_CURRENTNESS_ENGINE_CREATED,
  PARALLEL_D4_DIGITAL_THREAD_CREATED,
  PROCESS_CONDITION_EQUALS_MECHANICAL_DESIGN_CONDITION,
  REASSESSMENT_REQUIRED_D4_SOURCE_EXPOSED_AS_VALIDATED_TO_D9,
  REVIEWED_EQUALS_VALIDATED,
  SECOND_D4_FINGERPRINT_ALGORITHM_CREATED,
  SILENT_D4_R11_MUTATION_ALLOWED,
  SOURCE_REQUIREMENT_EQUALS_MECHANICAL_INTERPRETATION,
  STALE_D4_SOURCE_EXPOSED_AS_CURRENT_TO_D9,
  SUPERSEDED_D4_SOURCE_EXPOSED_AS_CURRENT_TO_D9,
  TENANT_WORKSPACE_PROJECT_D4_R11_SCOPE_ENFORCED,
  VALIDATED_EQUALS_APPROVED,
  VALIDATED_EQUALS_CERTIFIED,
  VALIDATED_EQUALS_CONFORMANT,
  VENDOR_DATA_EQUALS_ENGINEERING_VALIDATED,
  calculateFromMechanicalSource,
  createD4R11Store,
  deriveMechanicalSourceFact,
  fabricateMechanicalCounterpart,
  inferMechanicalSourceLineage,
  recordMechanicalSourceContract,
  repointMechanicalSourceContract,
  startD9FromMechanicalSource,
  type D4R11Actor,
} from "./d9-source-contract";

const actor: D4R11Actor = {
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
const threadActor = actor as D4R10Actor;
const R12_SCOPE = "Perform D4 Mechanical bounded closeout. Verify R1-R11 capability readiness, architecture/runtime/governance coherence, truth and authority boundaries, exact currentness/digital-thread lineage, source-contract integrity, security/dependency/release state and remaining limitations. Add no new substantive Mechanical runtime. Do not claim engineering validation, conformance, approval, certification, project validation or GA readiness. Preserve D1 incomplete, D2/D3 complete bounded, D5-D9 unstarted.";

describe("EOS-D4-R11 D9 source contract", () => {
  it("projects exact Mechanical revisions without manufacturing engineering or starting D9", () => {
    expect(D4_R11_STATUS).toBe("D9_SOURCE_CONTRACT_IMPLEMENTED");
    expect(D4_R11_MATURITY).toBe(D4_R11_STATUS);
    expect(D4_RUNTIME_STARTED).toBe(true);
    expect(D4_RUNTIME_COUNT).toBe(11);
    expect(R10_RUNTIME_COUNT).toBe(10);
    expect(ARCHITECTURE_RUNTIME_COUNT).toBe(0);
    expect(D4_0_STARTED).toBe(false);
    expect(D4_R11_STARTED).toBe(false);
    expect(D4_R12_STARTED).toBe(false);
    expect(R10_SOURCE_READY).toBe(false);
    expect(R10_SOURCE_COUNT).toBe(0);
    expect(ARCHITECTURE_SOURCE_COUNT).toBe(0);
    expect(D4_D9_SOURCE_CONTRACT_RUNTIME_IMPLEMENTED).toBe(true);
    expect(D4_D9_SOURCE_CONTRACT_RUNTIME_COUNT).toBe(1);
    expect(D4_D9_SOURCE_CONTRACT_RUNTIME_READY).toBe(true);
    expect(D4_CURRENTNESS_DIGITAL_THREAD_RUNTIME_READY).toBe(true);
    expect(D4_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_READY).toBe(true);
    expect(D4_DISCIPLINE_INTERFACE_RUNTIME_READY).toBe(true);
    expect(D4_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY).toBe(true);
    expect(D4_MAINTAINABILITY_ACCESS_PACKAGE_RUNTIME_READY_REUSED).toBe(true);
    expect(D4_R1_R10_EXACT_SOURCE_REVISIONS_REUSED).toBe(true);
    expect(EXACT_D4_D9_SOURCE_REVISION_REQUIRED).toBe(true);
    expect(FLOATING_D4_D9_SOURCE_REFERENCE_ALLOWED).toBe(false);
    expect(D4_D9_SOURCE_REFERENCE_AUTO_REPOINTED).toBe(false);
    expect(D4_D9_SOURCE_CONTRACT_EXPOSES_GOVERNED_D4_FACTS).toBe(true);
    expect(D4_D9_SOURCE_CONTRACT_EXPOSES_CURRENTNESS).toBe(true);
    expect(D4_D9_SOURCE_CONTRACT_EXPOSES_AUTHORITY).toBe(true);
    expect(D4_D9_SOURCE_CONTRACT_EXPOSES_LIMITATIONS).toBe(true);
    expect(D4_D9_SOURCE_CONTRACT_EXPOSES_PROVENANCE).toBe(true);
    expect(D4_D9_SOURCE_CONTRACT_EXPOSES_LINEAGE).toBe(true);
    expect(D4_D9_SOURCE_CONTRACT_EXPOSES_FINGERPRINT).toBe(true);
    expect(D4_D9_SOURCE_CONTRACT_EXPOSES_REVIEW_VALIDATION_STATE).toBe(true);
    expect(D4_D9_SOURCE_CONTRACT_CREATES_NEW_ENGINEERING_FACT).toBe(false);
    expect(D4_D9_SOURCE_CONTRACT_DERIVES_NEW_ENGINEERING_VALUE).toBe(false);
    expect(D4_D9_SOURCE_CONTRACT_GENERATES_NEW_REQUIREMENT).toBe(false);
    expect(D4_D9_SOURCE_CONTRACT_GENERATES_NEW_RECOMMENDATION).toBe(false);
    expect(D4_D9_SOURCE_CONTRACT_GENERATES_NEW_DECISION).toBe(false);
    expect(D4_D9_SOURCE_CONTRACT_CALCULATION_RUNTIME_COUNT).toBe(0);
    expect(D4_D9_SOURCE_CONTRACT_HIDDEN_CALCULATION_ALLOWED).toBe(false);
    expect(SOURCE_REQUIREMENT_EQUALS_MECHANICAL_INTERPRETATION).toBe(false);
    expect(PROCESS_CONDITION_EQUALS_MECHANICAL_DESIGN_CONDITION).toBe(false);
    expect(VENDOR_DATA_EQUALS_ENGINEERING_VALIDATED).toBe(false);
    expect(REVIEWED_EQUALS_VALIDATED).toBe(false);
    expect(VALIDATED_EQUALS_CONFORMANT).toBe(false);
    expect(VALIDATED_EQUALS_APPROVED).toBe(false);
    expect(VALIDATED_EQUALS_CERTIFIED).toBe(false);
    expect(AI_EQUALS_D4_MECHANICAL_ENGINEERING_AUTHORITY).toBe(false);
    expect(ADMIN_EQUALS_D4_MECHANICAL_ENGINEERING_AUTHORITY).toBe(false);
    expect(D4_D9_SOURCE_CONTRACT_TRANSFERS_ENGINEERING_AUTHORITY).toBe(false);
    expect(D4_D9_SOURCE_CONTRACT_CREATES_D9_ENGINEERING_AUTHORITY).toBe(false);
    expect(D4_EQUALS_D1_STRUCTURAL_AUTHORITY).toBe(false);
    expect(D4_EQUALS_D2_CIVIL_AUTHORITY).toBe(false);
    expect(D4_EQUALS_D3_GEOTECHNICAL_AUTHORITY).toBe(false);
    expect(D4_EQUALS_D5_PIPING_AUTHORITY).toBe(false);
    expect(D4_EQUALS_D6_PROCESS_AUTHORITY).toBe(false);
    expect(D4_EQUALS_D7_ELECTRICAL_AUTHORITY).toBe(false);
    expect(D4_EQUALS_D8_INSTRUMENTATION_CONTROL_AUTHORITY).toBe(false);
    expect(D4_R8_INTERFACE_RECORDS_REUSED).toBe(true);
    expect(EXACT_D4_D9_INTERFACE_REVISION_REQUIRED).toBe(true);
    expect(D4_D9_SOURCE_CONTRACT_FABRICATES_COUNTERPART).toBe(false);
    expect(D4_D9_SOURCE_CONTRACT_INFERS_MISSING_COUNTERPART).toBe(false);
    expect(MISSING_COUNTERPART_EQUALS_INTERFACE_COMPLETE).toBe(false);
    expect(D4_REUSES_CANONICAL_CURRENTNESS).toBe(true);
    expect(D4_REUSES_CANONICAL_DIGITAL_THREAD).toBe(true);
    expect(D4_REUSES_CANONICAL_FINGERPRINT).toBe(true);
    expect(PARALLEL_D4_CURRENTNESS_ENGINE_CREATED).toBe(false);
    expect(PARALLEL_D4_DIGITAL_THREAD_CREATED).toBe(false);
    expect(SECOND_D4_FINGERPRINT_ALGORITHM_CREATED).toBe(false);
    expect(D4_R10_CURRENTNESS_REUSED_BY_SOURCE_CONTRACT).toBe(true);
    expect(D4_R10_LINEAGE_REUSED_BY_SOURCE_CONTRACT).toBe(true);
    expect(D4_D9_SOURCE_CONTRACT_INFERS_LINEAGE).toBe(false);
    expect(D4_D9_SOURCE_CONTRACT_AUTO_REPOINTS_HISTORY).toBe(false);
    expect(STALE_D4_SOURCE_EXPOSED_AS_CURRENT_TO_D9).toBe(false);
    expect(SUPERSEDED_D4_SOURCE_EXPOSED_AS_CURRENT_TO_D9).toBe(false);
    expect(REASSESSMENT_REQUIRED_D4_SOURCE_EXPOSED_AS_VALIDATED_TO_D9).toBe(false);
    expect(D4_R9_REVIEW_VALIDATION_STATE_REUSED).toBe(true);
    expect(D4_D9_SOURCE_CONTRACT_AUTO_VALIDATES_ENGINEERING).toBe(false);
    expect(D4_D9_SOURCE_CONTRACT_AUTO_APPROVES_ENGINEERING).toBe(false);
    expect(D4_D9_SOURCE_CONTRACT_AUTO_CERTIFIES_ENGINEERING).toBe(false);
    expect(D4_D9_SOURCE_PROVENANCE_REQUIRED).toBe(true);
    expect(D4_D9_SOURCE_PROVENANCE_PRESERVED).toBe(true);
    expect(D4_D9_SOURCE_LIMITATIONS_PRESERVED).toBe(true);
    expect(SILENT_D4_R11_MUTATION_ALLOWED).toBe(false);
    expect(D4_R11_HISTORY_PRESERVED).toBe(true);
    expect(TENANT_WORKSPACE_PROJECT_D4_R11_SCOPE_ENFORCED).toBe(true);
    expect(CROSS_TENANT_D4_D9_SOURCE_ACCESS_ALLOWED).toBe(false);
    expect(D4_R11_AUTO_MUTATES_R3_DESIGN_CONDITION).toBe(false);
    expect(D4_R11_AUTO_MUTATES_R3_PERFORMANCE_CONTEXT).toBe(false);
    expect(D4_R11_AUTO_MUTATES_R4_VENDOR_EVIDENCE).toBe(false);
    expect(D4_R11_AUTO_MUTATES_R5_TECHNICAL_REQUIREMENT).toBe(false);
    expect(D4_R11_AUTO_MUTATES_R6_MAINTAINABILITY_CONTEXT).toBe(false);
    expect(D4_R11_AUTO_MUTATES_R7_CHANGE_GOVERNANCE).toBe(false);
    expect(D4_R11_AUTO_MUTATES_R8_INTERFACE_HANDOFF).toBe(false);
    expect(D4_R11_AUTO_MUTATES_R9_VALIDATION_STATE).toBe(false);
    expect(D4_R11_AUTO_MUTATES_R10_CURRENTNESS).toBe(false);
    expect(D4_R11_DUPLICATE_GOVERNANCE_IMPLEMENTED).toBe(true);
    expect(D4_R11_REPLAY_PROTECTION_IMPLEMENTED).toBe(true);
    expect(D4_R11_SPOOFING_PROTECTION_IMPLEMENTED).toBe(true);
    expect([
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
    ]).toEqual(Array(19).fill(0));
    expect(D5_RUNTIME_STARTED).toBe(false);
    expect(D6_RUNTIME_STARTED).toBe(false);
    expect(D7_RUNTIME_STARTED).toBe(false);
    expect(D8_RUNTIME_STARTED).toBe(false);
    expect(D9_RUNTIME_STARTED).toBe(false);
    expect(D1_STRUCTURAL_PACK_COMPLETE).toBe(false);
    expect(R11_D1).toBe(false);
    expect(D1N_REOPENED).toBe(false);
    expect(R11_D1N).toBe(false);
    expect(D2_TRACK_COMPLETE).toBe(true);
    expect(R11_D2).toBe(true);
    expect(D2_REOPENED).toBe(false);
    expect(R11_D2_REOPENED).toBe(false);
    expect(D3_TRACK_COMPLETE).toBe(true);
    expect(R11_D3).toBe(true);
    expect(D3_TRACK_COMPLETION_CLASSIFICATION).toBe("COMPLETE_BOUNDED_WITH_LIMITATIONS");
    expect(D3_REOPENED).toBe(false);
    expect(DATABASE_SCHEMA_CHANGED).toBe(false);
    expect(NEW_DEPENDENCY_ADDED).toBe(false);
    expect(D4_R11_CANONICAL_NEXT_PHASE).toBe("EOS-D4-R12-MECHANICAL-BOUNDED-CLOSEOUT");
    expect(D4_R11_NEXT_PHASE_TYPE).toBe("MECHANICAL_BOUNDED_CLOSEOUT");
    expect(D4_R11_CANONICAL_NEXT_PHASE_SCOPE).toBe(R12_SCOPE);
    expect(D4_R11_BLOCKER).toBe("NONE");

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
    const newerDocument = recordMechanicalVendorDocument(r4, actor, { ...upstream, recordId: "vendor-doc-d", documentRef: "MM-100", documentRevision: "D", evidenceClass: "MANUAL", sourceStatus: "FOR_INFORMATION", provenanceRef: "prov-vendor-d" });
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
    const r9 = createD4R9Store(r8);
    const chain = {
      ...changeSubject, r8HandoffId: handoff.handoffId, r8RevisionFingerprint: handoff.fingerprint, subjectKind: "DESIGN" as const, subjectId: design.recordId, subjectRevision: design.provenanceRef, subjectFingerprint: design.fingerprint,
      applicability: "NORMAL_OPERATION", limitations: "Review of this exact design revision only", provenanceRef: "prov-review", citedLifecycleStage: "FEED" as const,
    };
    const request = recordMechanicalReviewRequest(r9, actor, { ...chain, citedCurrentness: "CURRENT", reviewRequestId: "review-1", reviewType: "MECHANICAL_SUBJECT_REVIEW", reviewScope: "Casing design pressure context", requestedReviewerAuthority: "REVIEWER" });
    const validated = recordMechanicalValidationState(r9, reviewer, { ...chain, citedCurrentness: "CURRENT", validationId: "validation-1", validationState: "VALIDATED", validationScope: "Design pressure context with basis", basis: [{ kind: "R3_DESIGN", id: design.recordId, fingerprint: design.fingerprint }] });
    const r10 = createD4R10Store(r9);
    recordMechanicalLineage(r10, threadActor, {
      lineageId: "line-design", contextId: context.contextId, source: { subjectKind: "OBJECT", subjectId: equipment.objectId, subjectRevision: equipment.provenanceRef, subjectFingerprint: equipment.fingerprint }, target: { subjectKind: "DESIGN", subjectId: design.recordId, subjectRevision: design.provenanceRef, subjectFingerprint: design.fingerprint }, relationshipType: "DEPENDS_ON", citedCurrentness: "CURRENT", provenanceRef: "prov-line-design",
    });
    recordMechanicalSupersession(r10, threadActor, {
      supersessionId: "super-doc", contextId: context.contextId, predecessor: { subjectKind: "VENDOR_DOCUMENT", subjectId: document.recordId, subjectRevision: document.provenanceRef, subjectFingerprint: document.fingerprint }, successor: { subjectKind: "VENDOR_DOCUMENT", subjectId: newerDocument.recordId, subjectRevision: newerDocument.provenanceRef, subjectFingerprint: newerDocument.fingerprint }, citedCurrentness: "CURRENT", provenanceRef: "prov-super-doc",
    });
    recordMechanicalCurrentness(r10, threadActor, { eventId: "mark-change", contextId: context.contextId, subject: { subjectKind: "CHANGE", subjectId: change.changeContextId, subjectRevision: change.provenanceRef, subjectFingerprint: change.fingerprint }, currentness: "REASSESSMENT_REQUIRED", provenanceRef: "prov-reassess" });
    recordMechanicalCurrentness(r10, threadActor, { eventId: "mark-validation", contextId: context.contextId, subject: { subjectKind: "VALIDATION", subjectId: validated.validationId, subjectRevision: validated.subjectRevision, subjectFingerprint: validated.fingerprint }, currentness: "STALE", provenanceRef: "prov-validation-stale" });
    const markCount = r10.marks.length;
    const store = createD4R11Store(r10);
    const contract = recordMechanicalSourceContract(store, actor, { contractId: "source-1", contextId: context.contextId, objectId: equipment.objectId, sourceRevision: equipment.provenanceRef, citedCurrentness: "CURRENT", provenanceRef: "prov-source" });
    const fields = contract.fields as {
      EQUIPMENT_TYPE: string;
      EQUIPMENT_CONTEXT: { classifications: Array<{ classification: string }> };
      DESIGN_CONDITION_CONTEXT: Array<{ suppliedValue: string; limitations: string; currentness: string; processAuthority: boolean }>;
      PERFORMANCE_CONTEXT: unknown[];
      VENDOR_INFORMATION: { documents: Array<{ subjectId: string; documentRevision: string; currentness: string; mechanicalEngineeringAdoption: boolean }>; data: Array<{ suppliedValue: string; engineeringValidated: boolean }> };
      TECHNICAL_REQUIREMENTS: Array<{ requirementStatement: string }>;
      MAINTAINABILITY_CONSTRAINTS: Array<{ statement: string }>;
      DECISIONS: unknown[];
      CHANGE_OR_REASSESSMENT_STATE: Array<{ changeCategory: string; currentness: string; engineeringValidated: boolean; recalculated: boolean }>;
      MECHANICAL_INTERFACES: Array<{ counterpart: unknown; complete: boolean; futureRuntimeStarted: boolean; exactRevision: string }>;
      REVIEW_VALIDATION_STATE: { reviews: Array<{ requestStatus: string; reviewCompleted: boolean; subjectRevision: string }>; validations: Array<{ validationState: string; currentness: string; engineeringValidated: boolean; conformant: boolean; engineeringApproved: boolean; certified: boolean; subjectRevision: string }> };
      LINEAGE: Array<{ lineageId: string; inferred: boolean; sourceRevision: string }>;
      LIMITATIONS: string[];
      PROVENANCE: string;
      AUTHORITY: string;
      CURRENTNESS: string;
      CANONICAL_FINGERPRINT: string;
    };
    expect(contract.exactRevision).toBe(equipment.provenanceRef);
    expect(contract.authority).toBe(D4_CONTEXT_AUTHORITY);
    expect(contract.authorityTransferred).toBe(false);
    expect(contract.d9Started).toBe(false);
    expect(contract.engineeringDerived).toBe(false);
    expect(contract.representedAsValidated).toBe(false);
    expect(contract.conformant).toBe(false);
    expect(fields.EQUIPMENT_TYPE).toBe("ROTATING_EQUIPMENT");
    expect(fields.EQUIPMENT_CONTEXT.classifications[0]?.classification).toBe("PUMP");
    expect(fields.DESIGN_CONDITION_CONTEXT[0]?.suppliedValue).toBe("10");
    expect(fields.DESIGN_CONDITION_CONTEXT[0]?.processAuthority).toBe(false);
    expect(fields.DESIGN_CONDITION_CONTEXT[0]?.limitations).toBe("This pump only");
    expect(fields.PERFORMANCE_CONTEXT).toEqual([]);
    expect(fields.VENDOR_INFORMATION.documents.find((row) => row.subjectId === document.recordId)?.currentness).toBe("SUPERSEDED");
    expect(fields.VENDOR_INFORMATION.documents.find((row) => row.subjectId === document.recordId)?.documentRevision).toBe("C");
    expect(fields.VENDOR_INFORMATION.documents.every((row) => row.mechanicalEngineeringAdoption === false)).toBe(true);
    expect(fields.VENDOR_INFORMATION.data[0]?.engineeringValidated).toBe(false);
    expect(fields.TECHNICAL_REQUIREMENTS[0]?.requirementStatement).toBe(requirement.requirementStatement);
    expect(fields.MAINTAINABILITY_CONSTRAINTS[0]?.statement).toBe(envelope.statement);
    expect(fields.DECISIONS).toEqual([]);
    expect(fields.CHANGE_OR_REASSESSMENT_STATE[0]?.changeCategory).toBe("REASSESSMENT_REQUIRED");
    expect(fields.CHANGE_OR_REASSESSMENT_STATE[0]?.currentness).toBe("REASSESSMENT_REQUIRED");
    expect(fields.CHANGE_OR_REASSESSMENT_STATE[0]?.engineeringValidated).toBe(false);
    expect(fields.MECHANICAL_INTERFACES[0]?.counterpart).toBeNull();
    expect(fields.MECHANICAL_INTERFACES[0]?.complete).toBe(false);
    expect(fields.MECHANICAL_INTERFACES[0]?.futureRuntimeStarted).toBe(false);
    expect(fields.MECHANICAL_INTERFACES[0]?.exactRevision).toBe(handoff.provenanceRef);
    expect(fields.REVIEW_VALIDATION_STATE.reviews[0]?.requestStatus).toBe("REQUESTED");
    expect(fields.REVIEW_VALIDATION_STATE.reviews[0]?.reviewCompleted).toBe(false);
    expect(fields.REVIEW_VALIDATION_STATE.reviews[0]?.subjectRevision).toBe(design.provenanceRef);
    expect(fields.REVIEW_VALIDATION_STATE.validations[0]?.validationState).toBe("VALIDATED");
    expect(fields.REVIEW_VALIDATION_STATE.validations[0]?.currentness).toBe("STALE");
    expect(fields.REVIEW_VALIDATION_STATE.validations[0]?.engineeringValidated).toBe(false);
    expect(fields.REVIEW_VALIDATION_STATE.validations[0]?.conformant).toBe(false);
    expect(fields.REVIEW_VALIDATION_STATE.validations[0]?.subjectRevision).toBe(design.provenanceRef);
    expect(fields.LINEAGE.some((row) => row.lineageId === "line-design" && row.inferred === false && row.sourceRevision === equipment.provenanceRef)).toBe(true);
    expect(fields.LIMITATIONS).toContain("This pump only");
    expect(fields.PROVENANCE).toBe("prov-source");
    expect(fields.AUTHORITY).toBe(D4_CONTEXT_AUTHORITY);
    expect(fields.CURRENTNESS).toBe("CURRENT");
    expect(fields.CANONICAL_FINGERPRINT).toBe(contract.fingerprint);
    expect(design.suppliedValue).toBe("10");
    expect(requirement.requirementStatement).toBe("Provide a governed maintenance envelope for this pump");
    expect(envelope.statement).toBe("Maintain a service envelope around the non-drive end");
    expect(handoff.fingerprint).toBe(chain.r8RevisionFingerprint);
    expect(validated.engineeringValidated).toBe(true);
    expect(validated.subjectRevision).toBe(design.provenanceRef);
    expect(change.recalculated).toBe(false);
    expect(r10.marks.length).toBe(markCount);
    expect(request.reviewCompleted).toBe(false);
    const replay = recordMechanicalSourceContract(store, actor, { contractId: "source-1", contextId: context.contextId, objectId: equipment.objectId, sourceRevision: equipment.provenanceRef, citedCurrentness: "CURRENT", provenanceRef: "prov-source" });
    expect(replay.fingerprint).toBe(contract.fingerprint);
    expect(store.history.some((row) => row.contractId === contract.contractId && row.fingerprint === contract.fingerprint)).toBe(true);

    expect(() => recordMechanicalSourceContract(store, actor, { contractId: "source-float", contextId: context.contextId, objectId: equipment.objectId, sourceRevision: "latest", citedCurrentness: "CURRENT", provenanceRef: "prov-float" })).toThrow(/D4_R11_SUBJECT_REVISION_REQUIRED/);
    expect(() => recordMechanicalSourceContract(store, actor, { contractId: "source-1", contextId: context.contextId, objectId: equipment.objectId, sourceRevision: equipment.provenanceRef, citedCurrentness: "CURRENT", provenanceRef: "prov-other" })).toThrow(/D4_R11_DUPLICATE_SOURCE_CONTRACT_REJECTED/);
    expect(() => recordMechanicalSourceContract(store, { ...actor, actorId: "AI-recorder", actorKind: "ai" }, { contractId: "source-ai", contextId: context.contextId, objectId: equipment.objectId, sourceRevision: equipment.provenanceRef, citedCurrentness: "CURRENT", provenanceRef: "prov-ai" })).toThrow(/D4_R11_AI_NOT_MECHANICAL_AUTHORITY/);
    expect(() => recordMechanicalSourceContract(store, { ...actor, authority: "ADMIN" }, { contractId: "source-admin", contextId: context.contextId, objectId: equipment.objectId, sourceRevision: equipment.provenanceRef, citedCurrentness: "CURRENT", provenanceRef: "prov-admin" })).toThrow(/D4_R11_ADMIN_NOT_MECHANICAL_AUTHORITY/);
    expect(() => recordMechanicalSourceContract(store, actor, { contractId: "source-scope", contextId: context.contextId, tenantId: "tenant-b", objectId: equipment.objectId, sourceRevision: equipment.provenanceRef, citedCurrentness: "CURRENT", provenanceRef: "prov-scope" })).toThrow(/D4_R11_CROSS_TENANT_OPERATION/);
    expect(() => recordMechanicalSourceContract(store, actor, { contractId: "source-infer", contextId: context.contextId, objectId: equipment.objectId, sourceRevision: equipment.provenanceRef, citedCurrentness: "CURRENT", provenanceRef: "prov-infer", infer: true })).toThrow(/D4_R11_INFERRED_LINEAGE_REJECTED/);
    expect(() => recordMechanicalSourceContract(store, actor, { contractId: "source-fab", contextId: context.contextId, objectId: equipment.objectId, sourceRevision: equipment.provenanceRef, citedCurrentness: "CURRENT", provenanceRef: "prov-fab", fabricateCounterpart: true })).toThrow(/D4_R11_COUNTERPART_FABRICATION_REJECTED/);
    expect(() => recordMechanicalSourceContract(store, actor, { contractId: "source-strip", contextId: context.contextId, objectId: equipment.objectId, sourceRevision: equipment.provenanceRef, citedCurrentness: "CURRENT", provenanceRef: "prov-strip", stripLimitations: true })).toThrow(/D4_R11_LIMITATION_STRIPPING_REJECTED/);
    recordMechanicalCurrentness(r10, threadActor, { eventId: "mark-object", contextId: context.contextId, subject: { subjectKind: "OBJECT", subjectId: equipment.objectId, subjectRevision: equipment.provenanceRef, subjectFingerprint: equipment.fingerprint }, currentness: "STALE", provenanceRef: "prov-object-stale" });
    expect(() => recordMechanicalSourceContract(store, actor, { contractId: "source-stale", contextId: context.contextId, objectId: equipment.objectId, sourceRevision: equipment.provenanceRef, citedCurrentness: "CURRENT", provenanceRef: "prov-stale" })).toThrow(/D4_R11_STALE_EXPOSED_AS_CURRENT/);
    const stale = recordMechanicalSourceContract(store, actor, { contractId: "source-stale", contextId: context.contextId, objectId: equipment.objectId, sourceRevision: equipment.provenanceRef, citedCurrentness: "STALE", provenanceRef: "prov-stale-ok" });
    expect(stale.currentness).toBe("STALE");
    expect(stale.exactRevision).toBe(equipment.provenanceRef);
    expect(design.suppliedValue).toBe("10");

    expect(repointMechanicalSourceContract).toThrow(/D4_R11_AUTO_REPOINT_REJECTED/);
    expect(inferMechanicalSourceLineage).toThrow(/D4_R11_INFERRED_LINEAGE_REJECTED/);
    expect(deriveMechanicalSourceFact).toThrow(/D4_R11_DERIVATION_NOT_IN_R11/);
    expect(fabricateMechanicalCounterpart).toThrow(/D4_R11_COUNTERPART_FABRICATION_REJECTED/);
    expect(startD9FromMechanicalSource).toThrow(/D4_R11_D9_NOT_STARTED/);
    expect(calculateFromMechanicalSource).toThrow(/D4_R11_CALCULATION_NOT_IN_R11/);

    const here = dirname(fileURLToPath(import.meta.url));
    const sourceText = readFileSync(join(here, "d9-source-contract.ts"), "utf8");
    expect(sourceText).toContain("fingerprintCanonical");
    expect(sourceText).toContain("D4_D9_SOURCE_CONTRACT_FIELDS");
    expect(sourceText).not.toMatch(/createHash|from ["']@rtb\/engineering-review["']|CREATE TABLE/);
    expect(scanAnalysisFormulaBypass(join(here, "d9-source-contract.ts"), sourceText)).toEqual([]);
    const packageJson = JSON.parse(readFileSync(join(here, "../../package.json"), "utf8")) as { dependencies: Record<string, string> };
    expect(Object.keys(packageJson.dependencies).sort()).toEqual(["@rtb/database", "@rtb/engineering-review", "@rtb/platform-commerce", "@rtb/platform-intelligence", "@rtb/platform-kernel", "@rtb/types", "docx", "exceljs", "pptxgenjs", "zod"]);
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D4.R11.D9_SOURCE_CONTRACT")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D4.R12.MECHANICAL_BOUNDED_CLOSEOUT")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
  });
});
