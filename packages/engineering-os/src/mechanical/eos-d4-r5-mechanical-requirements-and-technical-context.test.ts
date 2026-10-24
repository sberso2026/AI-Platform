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
import { D4_RUNTIME_COUNT as R2_RUNTIME_COUNT, createD4R2Store, recordMechanicalEquipmentClassification } from "./equipment-system-context";
import {
  D4_DESIGN_CONDITION_PERFORMANCE_RUNTIME_READY,
  D4_RUNTIME_COUNT as R3_RUNTIME_COUNT,
  createD4R3Store,
  recordMechanicalDesignCondition,
} from "./design-condition-performance-context";
import {
  D4_MECHANICAL_TECHNICAL_CONTEXT_RUNTIME_READY as R4_TECHNICAL_READY,
  D4_R5_STARTED as R4_R5_STARTED,
  D4_RUNTIME_COUNT as R4_RUNTIME_COUNT,
  D4_VENDOR_DATA_EVIDENCE_RUNTIME_READY,
  createD4R4Store,
  recordMechanicalVendorData,
  recordMechanicalVendorDocument,
} from "./vendor-data-evidence-context";
import {
  ADMIN_CAN_PROMOTE_SOURCE_DATA_TO_ENGINEERING_TRUTH,
  AI_CAN_INVENT_AUTHORITATIVE_D4_TECHNICAL_REQUIREMENT,
  AI_CAN_PROMOTE_CANDIDATE_D4_REQUIREMENT_TO_AUTHORITATIVE,
  AI_EQUALS_D4_MECHANICAL_ENGINEERING_AUTHORITY,
  BASISLESS_AUTHORITATIVE_D4_R5_RECORD_AUTO_ACCEPTED,
  CHANGED_R5_SOURCE_AUTO_REVALIDATES_ENGINEERING,
  CHANGED_R5_SOURCE_AUTO_REWRITES_HISTORY,
  CHANGED_R5_SOURCE_AUTO_REWRITES_REQUIREMENT,
  CODE_REFERENCE_PRESENT_EQUALS_CONFORMANT,
  CODE_STANDARD_REFERENCE_EQUALS_CERTIFICATION,
  CODE_STANDARD_REFERENCE_EQUALS_CONFORMANCE,
  D1_STRUCTURAL_PACK_COMPLETE as R5_D1,
  D1N_REOPENED as R5_D1N,
  D2_REOPENED as R5_D2_REOPENED,
  D2_TRACK_COMPLETE as R5_D2,
  D3_REOPENED,
  D3_TRACK_COMPLETE as R5_D3,
  D3_TRACK_COMPLETION_CLASSIFICATION,
  D4_APPROVAL_RUNTIME_COUNT,
  D4_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT,
  D4_CERTIFICATION_RUNTIME_COUNT,
  D4_CONFORMANCE_DETERMINATION_RUNTIME_COUNT,
  D4_CROSS_DISCIPLINE_CONFLICT_DETECTION_RUNTIME_COUNT,
  D4_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT,
  D4_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT,
  D4_D9_RUNTIME_INTEGRATION_COUNT,
  D4_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
  D4_DISCIPLINE_INTERFACE_RUNTIME_COUNT,
  D4_EQUALS_D1_STRUCTURAL_AUTHORITY,
  D4_EQUALS_D5_PIPING_AUTHORITY,
  D4_EQUALS_D6_PROCESS_AUTHORITY,
  D4_EQUALS_D7_ELECTRICAL_AUTHORITY,
  D4_EQUALS_D8_INSTRUMENTATION_CONTROL_AUTHORITY,
  D4_EQUIPMENT_SIZING_RUNTIME_COUNT,
  D4_FATIGUE_ANALYSIS_RUNTIME_COUNT,
  D4_MAINTAINABILITY_RUNTIME_COUNT,
  D4_MATERIAL_CONTEXT_EQUALS_MATERIAL_SELECTION_CALCULATION,
  D4_MATERIAL_CONTEXT_EQUALS_VALIDATED_MATERIAL_SELECTION,
  D4_MECHANICAL_CODE_STANDARD_REFERENCE_SUPPORTED,
  D4_MECHANICAL_DESIGN_OPTIMIZATION_RUNTIME_COUNT,
  D4_MECHANICAL_INSPECTION_TEST_REQUIREMENT_CONTEXT_IMPLEMENTED,
  D4_MECHANICAL_LOAD_CALCULATION_RUNTIME_COUNT,
  D4_MECHANICAL_MATERIAL_CONSTRUCTION_CONTEXT_IMPLEMENTED,
  D4_MECHANICAL_TECHNICAL_CONTEXT_IMPLEMENTED,
  D4_MECHANICAL_TECHNICAL_CONTEXT_RUNTIME_COUNT,
  D4_MECHANICAL_TECHNICAL_CONTEXT_RUNTIME_IMPLEMENTED,
  D4_MECHANICAL_TECHNICAL_CONTEXT_RUNTIME_READY,
  D4_MECHANICAL_TECHNICAL_REQUIREMENT_CONTEXT_IMPLEMENTED,
  D4_R1_IDENTITY_REUSED,
  D4_R2_EQUIPMENT_SYSTEM_CONTEXT_REUSED,
  D4_R3_DESIGN_CONDITION_PERFORMANCE_CONTEXT_REUSED,
  D4_R3_DESIGN_PERFORMANCE_REFERENCE_SUPPORTED,
  D4_R4_RUNTIME_COUNT_REUSED,
  D4_R4_VENDOR_DATA_EVIDENCE_CONTEXT_REUSED,
  D4_R4_VENDOR_EVIDENCE_REFERENCE_SUPPORTED,
  D4_R5_APPLICABILITY_EXPLICIT,
  D4_R5_AUTO_MUTATES_R3_DESIGN_CONDITION,
  D4_R5_AUTO_MUTATES_R3_PERFORMANCE_CONTEXT,
  D4_R5_AUTO_PROPAGATED_OUTSIDE_APPLICABILITY,
  D4_R5_AUTO_REPOINTED,
  D4_R5_BLOCKER,
  D4_R5_CANONICAL_NEXT_PHASE,
  D4_R5_CANONICAL_NEXT_PHASE_SCOPE,
  D4_R5_CHANGE_PROPAGATION_RUNTIME_COUNT,
  D4_R5_DUPLICATE_GOVERNANCE_IMPLEMENTED,
  D4_R5_ENGINEERING_VALUE_AUTO_OVERRIDES_VENDOR,
  D4_R5_HIDDEN_CALCULATION_ALLOWED,
  D4_R5_HISTORY_PRESERVED,
  D4_R5_LIMITATIONS_EXPLICIT,
  D4_R5_MATURITY,
  D4_R5_NEXT_PHASE_TYPE,
  D4_R5_PROVENANCE_PRESERVED,
  D4_R5_PROVENANCE_REQUIRED,
  D4_R5_REPLAY_PROTECTION_IMPLEMENTED,
  D4_R5_SOURCE_AUTO_REPOINTED,
  D4_R5_SOURCE_BASIS_REQUIRED,
  D4_R5_SOURCE_BASIS_TRACEABLE,
  D4_R5_SPOOFING_PROTECTION_IMPLEMENTED,
  D4_R5_STATUS,
  D4_R5_VENDOR_ENGINEERING_DISCREPANCY_AUTO_RESOLVED,
  D4_R5_VENDOR_VALUE_AUTO_OVERRIDES_ENGINEERING,
  D4_R6_STARTED,
  D4_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_COUNT,
  D4_REUSES_CANONICAL_CURRENTNESS,
  D4_REUSES_CANONICAL_FINGERPRINT,
  D4_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_COUNT,
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
  EXACT_D4_R1_R4_REFERENCE_REQUIRED,
  FLOATING_D4_R5_SOURCE_REFERENCE_ALLOWED,
  INSPECTION_REQUIREMENT_EQUALS_INSPECTION_COMPLETED,
  NEW_DEPENDENCY_ADDED,
  PARALLEL_D4_CURRENTNESS_ENGINE_CREATED,
  REQUIREMENT_PRESENT_EQUALS_VALIDATED,
  SECOND_D4_FINGERPRINT_ALGORITHM_CREATED,
  SILENT_D4_R5_MUTATION_ALLOWED,
  SOURCE_REQUIREMENT_AUTO_ADOPTED_AS_D4_REQUIREMENT,
  SOURCE_REQUIREMENT_EQUALS_ADOPTED_MECHANICAL_REQUIREMENT,
  TECHNICAL_CONTEXT_EQUALS_APPROVED,
  TECHNICAL_CONTEXT_EQUALS_CALCULATED_DESIGN,
  TECHNICAL_CONTEXT_EQUALS_ENGINEERING_VALIDATED,
  TECHNICAL_CONTEXT_PRESENT_EQUALS_CONFORMANT,
  TENANT_WORKSPACE_PROJECT_D4_R5_SCOPE_ENFORCED,
  TEST_REQUIREMENT_EQUALS_TEST_PASSED,
  VENDOR_EVIDENCE_EQUALS_ADOPTED_D4_REQUIREMENT,
  VENDOR_EVIDENCE_EQUALS_ENGINEERING_VALIDATED,
  VENDOR_REQUIREMENT_AUTO_ADOPTED_AS_D4_REQUIREMENT,
  VENDOR_REQUIREMENT_EQUALS_ADOPTED_MECHANICAL_REQUIREMENT,
  adoptSourceRequirement,
  adoptVendorRequirement,
  analyzeMaintainability,
  applyChangedSourceToRequirement,
  approveRequirement,
  certifyRequirement,
  createD4R5Store,
  determineConformance,
  mutateRequirement,
  openDisciplineInterface,
  promoteCandidateRequirement,
  propagateRequirementChange,
  recordMechanicalCodeStandardReference,
  recordMechanicalInspectionTestRequirement,
  recordMechanicalMaterialConstructionContext,
  recordMechanicalRequirementCandidate,
  recordMechanicalSourceRequirement,
  recordMechanicalTechnicalContext,
  recordMechanicalTechnicalRequirement,
  recordMechanicalVendorRequirement,
  repointRequirement,
  resolveVendorEngineeringDiscrepancy,
  reviseDesignConditionFromRequirement,
  sizeMechanicalEquipment,
  validateRequirement,
} from "./mechanical-technical-context";

const actor: D4R1Actor = {
  actorId: "mechanical-recorder",
  tenantId: "tenant-a",
  workspaceId: "workspace-a",
  projectId: "project-a",
  authority: D4_CONTEXT_AUTHORITY,
};

describe("EOS-D4-R5 Mechanical requirements and technical context", () => {
  it("records technical requirements on exact R1-R4 revisions without calculating or adopting vendor claims", () => {
    expect(D4_R5_STATUS).toBe("MECHANICAL_REQUIREMENTS_AND_TECHNICAL_CONTEXT_IMPLEMENTED");
    expect(D4_R5_MATURITY).toBe("MECHANICAL_REQUIREMENTS_AND_TECHNICAL_CONTEXT_IMPLEMENTED");
    expect(D4_RUNTIME_STARTED).toBe(true);
    expect(D4_RUNTIME_COUNT).toBe(5);
    expect(R1_RUNTIME_COUNT).toBe(1);
    expect(R2_RUNTIME_COUNT).toBe(2);
    expect(R3_RUNTIME_COUNT).toBe(3);
    expect(R4_RUNTIME_COUNT).toBe(4);
    expect(D4_R4_RUNTIME_COUNT_REUSED).toBe(4);
    expect(D4_DESIGN_CONDITION_PERFORMANCE_RUNTIME_READY).toBe(true);
    expect(D4_VENDOR_DATA_EVIDENCE_RUNTIME_READY).toBe(true);
    expect(D4_MECHANICAL_TECHNICAL_CONTEXT_RUNTIME_IMPLEMENTED).toBe(true);
    expect(D4_MECHANICAL_TECHNICAL_CONTEXT_RUNTIME_COUNT).toBe(1);
    expect(D4_MECHANICAL_TECHNICAL_CONTEXT_RUNTIME_READY).toBe(true);
    expect(R4_TECHNICAL_READY).toBe(false);
    expect(R4_R5_STARTED).toBe(false);
    expect(D4_R6_STARTED).toBe(false);
    expect(D4_0_STARTED).toBe(false);
    expect(D4_R1_IDENTITY_REUSED).toBe(true);
    expect(D4_R2_EQUIPMENT_SYSTEM_CONTEXT_REUSED).toBe(true);
    expect(D4_R3_DESIGN_CONDITION_PERFORMANCE_CONTEXT_REUSED).toBe(true);
    expect(D4_R4_VENDOR_DATA_EVIDENCE_CONTEXT_REUSED).toBe(true);
    expect(EXACT_D4_R1_R4_REFERENCE_REQUIRED).toBe(true);
    expect(FLOATING_D4_R5_SOURCE_REFERENCE_ALLOWED).toBe(false);
    expect(D4_R5_SOURCE_AUTO_REPOINTED).toBe(false);
    expect(D4_MECHANICAL_TECHNICAL_REQUIREMENT_CONTEXT_IMPLEMENTED).toBe(true);
    expect(D4_MECHANICAL_TECHNICAL_CONTEXT_IMPLEMENTED).toBe(true);
    expect(D4_R5_SOURCE_BASIS_REQUIRED).toBe(true);
    expect(D4_R5_SOURCE_BASIS_TRACEABLE).toBe(true);
    expect(BASISLESS_AUTHORITATIVE_D4_R5_RECORD_AUTO_ACCEPTED).toBe(false);
    expect(SOURCE_REQUIREMENT_EQUALS_ADOPTED_MECHANICAL_REQUIREMENT).toBe(false);
    expect(VENDOR_REQUIREMENT_EQUALS_ADOPTED_MECHANICAL_REQUIREMENT).toBe(false);
    expect(SOURCE_REQUIREMENT_AUTO_ADOPTED_AS_D4_REQUIREMENT).toBe(false);
    expect(VENDOR_REQUIREMENT_AUTO_ADOPTED_AS_D4_REQUIREMENT).toBe(false);
    expect(D4_MECHANICAL_CODE_STANDARD_REFERENCE_SUPPORTED).toBe(true);
    expect(CODE_STANDARD_REFERENCE_EQUALS_CONFORMANCE).toBe(false);
    expect(CODE_STANDARD_REFERENCE_EQUALS_CERTIFICATION).toBe(false);
    expect(CODE_REFERENCE_PRESENT_EQUALS_CONFORMANT).toBe(false);
    expect(D4_MECHANICAL_MATERIAL_CONSTRUCTION_CONTEXT_IMPLEMENTED).toBe(true);
    expect(D4_MATERIAL_CONTEXT_EQUALS_MATERIAL_SELECTION_CALCULATION).toBe(false);
    expect(D4_MATERIAL_CONTEXT_EQUALS_VALIDATED_MATERIAL_SELECTION).toBe(false);
    expect(D4_MECHANICAL_INSPECTION_TEST_REQUIREMENT_CONTEXT_IMPLEMENTED).toBe(true);
    expect(INSPECTION_REQUIREMENT_EQUALS_INSPECTION_COMPLETED).toBe(false);
    expect(TEST_REQUIREMENT_EQUALS_TEST_PASSED).toBe(false);
    expect(D4_R3_DESIGN_PERFORMANCE_REFERENCE_SUPPORTED).toBe(true);
    expect(D4_R5_AUTO_MUTATES_R3_DESIGN_CONDITION).toBe(false);
    expect(D4_R5_AUTO_MUTATES_R3_PERFORMANCE_CONTEXT).toBe(false);
    expect(D4_R4_VENDOR_EVIDENCE_REFERENCE_SUPPORTED).toBe(true);
    expect(VENDOR_EVIDENCE_EQUALS_ADOPTED_D4_REQUIREMENT).toBe(false);
    expect(VENDOR_EVIDENCE_EQUALS_ENGINEERING_VALIDATED).toBe(false);
    expect(D4_R5_VENDOR_ENGINEERING_DISCREPANCY_AUTO_RESOLVED).toBe(false);
    expect(D4_R5_VENDOR_VALUE_AUTO_OVERRIDES_ENGINEERING).toBe(false);
    expect(D4_R5_ENGINEERING_VALUE_AUTO_OVERRIDES_VENDOR).toBe(false);
    expect(D4_R5_APPLICABILITY_EXPLICIT).toBe(true);
    expect(D4_R5_LIMITATIONS_EXPLICIT).toBe(true);
    expect(D4_R5_AUTO_PROPAGATED_OUTSIDE_APPLICABILITY).toBe(false);
    expect(TECHNICAL_CONTEXT_EQUALS_CALCULATED_DESIGN).toBe(false);
    expect(TECHNICAL_CONTEXT_EQUALS_ENGINEERING_VALIDATED).toBe(false);
    expect(TECHNICAL_CONTEXT_EQUALS_APPROVED).toBe(false);
    expect(REQUIREMENT_PRESENT_EQUALS_VALIDATED).toBe(false);
    expect(TECHNICAL_CONTEXT_PRESENT_EQUALS_CONFORMANT).toBe(false);
    expect(AI_EQUALS_D4_MECHANICAL_ENGINEERING_AUTHORITY).toBe(false);
    expect(AI_CAN_INVENT_AUTHORITATIVE_D4_TECHNICAL_REQUIREMENT).toBe(false);
    expect(AI_CAN_PROMOTE_CANDIDATE_D4_REQUIREMENT_TO_AUTHORITATIVE).toBe(false);
    expect(ADMIN_CAN_PROMOTE_SOURCE_DATA_TO_ENGINEERING_TRUTH).toBe(false);
    expect(D4_R5_HIDDEN_CALCULATION_ALLOWED).toBe(false);
    expect(D4_REUSES_CANONICAL_CURRENTNESS).toBe(true);
    expect(PARALLEL_D4_CURRENTNESS_ENGINE_CREATED).toBe(false);
    expect(D4_REUSES_CANONICAL_FINGERPRINT).toBe(true);
    expect(SECOND_D4_FINGERPRINT_ALGORITHM_CREATED).toBe(false);
    expect(D4_R5_PROVENANCE_REQUIRED).toBe(true);
    expect(D4_R5_PROVENANCE_PRESERVED).toBe(true);
    expect(D4_R5_AUTO_REPOINTED).toBe(false);
    expect(SILENT_D4_R5_MUTATION_ALLOWED).toBe(false);
    expect(D4_R5_HISTORY_PRESERVED).toBe(true);
    expect(TENANT_WORKSPACE_PROJECT_D4_R5_SCOPE_ENFORCED).toBe(true);
    expect(CHANGED_R5_SOURCE_AUTO_REWRITES_REQUIREMENT).toBe(false);
    expect(CHANGED_R5_SOURCE_AUTO_REWRITES_HISTORY).toBe(false);
    expect(CHANGED_R5_SOURCE_AUTO_REVALIDATES_ENGINEERING).toBe(false);
    expect(D4_EQUALS_D1_STRUCTURAL_AUTHORITY).toBe(false);
    expect(D4_EQUALS_D5_PIPING_AUTHORITY).toBe(false);
    expect(D4_EQUALS_D6_PROCESS_AUTHORITY).toBe(false);
    expect(D4_EQUALS_D7_ELECTRICAL_AUTHORITY).toBe(false);
    expect(D4_EQUALS_D8_INSTRUMENTATION_CONTROL_AUTHORITY).toBe(false);
    expect(D4_R5_DUPLICATE_GOVERNANCE_IMPLEMENTED).toBe(true);
    expect(D4_R5_REPLAY_PROTECTION_IMPLEMENTED).toBe(true);
    expect(D4_R5_SPOOFING_PROTECTION_IMPLEMENTED).toBe(true);
    expect([
      D4_MAINTAINABILITY_RUNTIME_COUNT,
      D4_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_COUNT,
      D4_R5_CHANGE_PROPAGATION_RUNTIME_COUNT,
      D4_DISCIPLINE_INTERFACE_RUNTIME_COUNT,
      D4_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_COUNT,
      D4_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
      D4_EQUIPMENT_SIZING_RUNTIME_COUNT,
      D4_ROTATING_EQUIPMENT_CALCULATION_RUNTIME_COUNT,
      D4_STATIC_EQUIPMENT_CALCULATION_RUNTIME_COUNT,
      D4_THERMAL_MECHANICAL_CALCULATION_RUNTIME_COUNT,
      D4_MECHANICAL_LOAD_CALCULATION_RUNTIME_COUNT,
      D4_VIBRATION_ANALYSIS_RUNTIME_COUNT,
      D4_FATIGUE_ANALYSIS_RUNTIME_COUNT,
      D4_MECHANICAL_DESIGN_OPTIMIZATION_RUNTIME_COUNT,
      D4_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT,
      D4_CONFORMANCE_DETERMINATION_RUNTIME_COUNT,
      D4_APPROVAL_RUNTIME_COUNT,
      D4_CERTIFICATION_RUNTIME_COUNT,
      D4_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT,
      D4_CROSS_DISCIPLINE_CONFLICT_DETECTION_RUNTIME_COUNT,
      D4_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT,
      D4_D9_RUNTIME_INTEGRATION_COUNT,
    ]).toEqual(Array(22).fill(0));
    expect(D5_RUNTIME_STARTED).toBe(false);
    expect(D6_RUNTIME_STARTED).toBe(false);
    expect(D7_RUNTIME_STARTED).toBe(false);
    expect(D8_RUNTIME_STARTED).toBe(false);
    expect(D9_RUNTIME_STARTED).toBe(false);
    expect(D9_RUNTIME_COUNT).toBe(0);
    expect(DATABASE_SCHEMA_CHANGED).toBe(false);
    expect(NEW_DEPENDENCY_ADDED).toBe(false);
    expect(R5_D1).toBe(false);
    expect(D1_STRUCTURAL_PACK_COMPLETE).toBe(false);
    expect(R5_D1N).toBe(false);
    expect(D1N_REOPENED).toBe(false);
    expect(R5_D2).toBe(true);
    expect(D2_TRACK_COMPLETE).toBe(true);
    expect(R5_D2_REOPENED).toBe(false);
    expect(D2_REOPENED).toBe(false);
    expect(R5_D3).toBe(true);
    expect(D3_TRACK_COMPLETE).toBe(true);
    expect(D3_TRACK_COMPLETION_CLASSIFICATION).toBe("COMPLETE_BOUNDED_WITH_LIMITATIONS");
    expect(D3_REOPENED).toBe(false);
    expect(D4_R5_CANONICAL_NEXT_PHASE).toBe("EOS-D4-R6-MAINTAINABILITY-ACCESS-AND-PACKAGE-CONTEXT");
    expect(D4_R5_NEXT_PHASE_TYPE).toBe("MAINTAINABILITY_ACCESS_AND_PACKAGE_CONTEXT");
    expect(D4_R5_CANONICAL_NEXT_PHASE_SCOPE).toContain("without performing spatial clash detection");
    expect(D4_R5_BLOCKER).toBe("NONE");

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
      documentRef: "DS-100",
      documentRevision: "C",
      evidenceClass: "VENDOR_DATASHEET",
      sourceStatus: "FOR_INFORMATION",
    });
    const vendorData = recordMechanicalVendorData(r4, actor, {
      ...upstream,
      recordId: "vendor-pressure",
      documentRef: "DS-100",
      documentRevision: "C",
      evidenceClass: "PERFORMANCE_DATA",
      dataKind: "DESIGN_RATING",
      suppliedValue: "12",
      unit: "bar",
      parentDocumentId: document.recordId,
      parentDocumentFingerprint: document.fingerprint,
    });
    const store = createD4R5Store(r4);
    const bound = {
      ...upstream,
      r4RecordId: vendorData.recordId,
      r4RevisionFingerprint: vendorData.fingerprint,
      applicabilityObjectId: equipment.objectId,
      applicabilityCase: "NORMAL_OPERATION",
      limitations: "Applies only to this pump identity",
      provenanceRef: "prov-requirement",
    };
    const source = recordMechanicalSourceRequirement(store, actor, {
      ...bound,
      recordId: "source-req",
      subjectKind: "MECHANICAL_EQUIPMENT_REQUIREMENT",
      requirementStatement: "Casing design pressure shall match the project specification",
      sourceBasis: "PROJECT_SPECIFICATION",
      sourceRef: "spec-100",
      sourceRevision: "A",
    });
    expect(source.recordClass).toBe("SOURCE_REQUIREMENT");
    expect(source.adopted).toBe(false);
    expect(source.authoritative).toBe(false);
    expect(source.engineeringValidated).toBe(false);
    const vendorRequirement = recordMechanicalVendorRequirement(store, actor, {
      ...bound,
      recordId: "vendor-req",
      subjectKind: "MECHANICAL_RATING_CRITERIA",
      requirementStatement: "Vendor datasheet states a casing rating",
      sourceBasis: "R4_VENDOR_EVIDENCE",
      sourceRef: "DS-100",
      sourceRevision: "C",
      suppliedValue: "12",
      unit: "bar",
    });
    expect(vendorRequirement.recordClass).toBe("VENDOR_REQUIREMENT");
    expect(vendorRequirement.adopted).toBe(false);
    expect(vendorRequirement.r4RevisionFingerprint).toBe(vendorData.fingerprint);
    expect(vendorRequirement.engineeringValidated).toBe(false);
    const adopted = recordMechanicalTechnicalRequirement(store, actor, {
      ...bound,
      recordId: "adopted-req",
      subjectKind: "MECHANICAL_EQUIPMENT_REQUIREMENT",
      requirementStatement: "Adopt the project casing pressure as the Mechanical requirement",
      sourceBasis: "MECHANICAL_DESIGN_BASIS",
      sourceRef: "spec-100",
      sourceRevision: "A",
      suppliedValue: "10",
      unit: "bar",
      adoptionRationale: "Explicit Mechanical adoption of the project specification",
    });
    expect(adopted.recordClass).toBe("ADOPTED_MECHANICAL_REQUIREMENT");
    expect(adopted.adopted).toBe(true);
    expect(adopted.engineeringValidated).toBe(false);
    expect(adopted.conformant).toBe(false);
    expect(adopted.discrepancy?.vendorValue).toBe("12");
    expect(adopted.discrepancy?.requirementValue).toBe("10");
    expect(adopted.discrepancy?.resolved).toBe(false);
    expect(design.suppliedValue).toBe("10");
    expect(design.fingerprint).toBe(adopted.r3RevisionFingerprint);
    expect(vendorData.suppliedValue).toBe("12");
    expect(vendorData.fingerprint).toBe(adopted.r4RevisionFingerprint);
    expect(source.recordClass).not.toBe(adopted.recordClass);
    expect(vendorRequirement.recordClass).not.toBe(adopted.recordClass);

    const contextRecord = recordMechanicalTechnicalContext(store, actor, {
      ...bound,
      recordId: "tech-context",
      subjectKind: "EQUIPMENT_CONFIGURATION",
      requirementStatement: "Horizontal end-suction configuration as supplied",
      sourceBasis: "AUTHORIZED_ENGINEERING_INPUT",
      sourceRef: "basis-note-1",
      sourceRevision: "A",
      applicabilityCase: "CONFIGURATION",
      adoptionRationale: "Recorded as supplied configuration context",
    });
    expect(contextRecord.recordClass).toBe("TECHNICAL_CONTEXT");
    expect(contextRecord.calculated).toBe(false);
    expect(contextRecord.engineeringValidated).toBe(false);
    expect(contextRecord.engineeringApproved).toBe(false);
    const standard = recordMechanicalCodeStandardReference(store, actor, {
      ...bound,
      recordId: "code-ref",
      subjectKind: "CODE_STANDARD_REFERENCE",
      requirementStatement: "API 610 is the cited pump standard",
      sourceBasis: "CODE_OR_STANDARD_REFERENCE",
      sourceRef: "API-610",
      sourceRevision: "12",
      standardRef: "API 610",
      applicabilityCase: "DESIGN_CODE",
      adoptionRationale: "Cited as the applicable pump standard",
    });
    expect(standard.conformant).toBe(false);
    expect(standard.certified).toBe(false);
    const material = recordMechanicalMaterialConstructionContext(store, actor, {
      ...bound,
      recordId: "material-context",
      subjectKind: "MATERIALS_CONSTRUCTION_REQUIREMENT",
      requirementStatement: "Carbon steel casing as specified",
      sourceBasis: "PROJECT_SPECIFICATION",
      sourceRef: "spec-100",
      sourceRevision: "A",
      applicabilityCase: "MATERIALS",
      adoptionRationale: "Specified material category only",
    });
    expect(material.materialSelectionCalculated).toBe(false);
    expect(material.materialSelectionValidated).toBe(false);
    const inspection = recordMechanicalInspectionTestRequirement(store, actor, {
      ...bound,
      recordId: "inspection-req",
      subjectKind: "INSPECTION_TESTING_REQUIREMENT",
      requirementStatement: "Hydrostatic test is required",
      sourceBasis: "PROJECT_SPECIFICATION",
      sourceRef: "spec-100",
      sourceRevision: "A",
      applicabilityCase: "INSPECTION",
      adoptionRationale: "Inspection requirement only",
    });
    expect(inspection.inspectionCompleted).toBe(false);
    expect(inspection.testPassed).toBe(false);
    const candidate = recordMechanicalRequirementCandidate(store, actor, {
      ...bound,
      recordId: "candidate-req",
      subjectKind: "MECHANICAL_QUALITY_CRITERIA",
      requirementStatement: "Candidate quality note",
      sourceBasis: "CLIENT_REQUIREMENT",
      sourceRef: "client-1",
      sourceRevision: "A",
      applicabilityCase: "QUALITY",
    });
    expect(candidate.candidate).toBe(true);
    expect(candidate.authoritative).toBe(false);

    expect(() => recordMechanicalTechnicalRequirement(store, actor, {
      ...bound,
      recordId: "basisless",
      subjectKind: "MECHANICAL_EQUIPMENT_REQUIREMENT",
      requirementStatement: "No basis",
      sourceBasis: "NOT_A_BASIS",
      sourceRef: "spec-100",
      sourceRevision: "A",
      adoptionRationale: "Missing basis",
    })).toThrow(/SOURCE_BASIS_REQUIRED/);
    expect(() => recordMechanicalTechnicalRequirement(store, actor, {
      ...bound,
      recordId: "floating",
      subjectKind: "MECHANICAL_EQUIPMENT_REQUIREMENT",
      requirementStatement: "Floating revision",
      sourceBasis: "PROJECT_SPECIFICATION",
      sourceRef: "spec-100",
      sourceRevision: "latest",
      adoptionRationale: "Floating",
    })).toThrow(/SOURCE_REVISION_REQUIRED/);
    expect(() => recordMechanicalTechnicalRequirement(store, actor, {
      ...bound,
      recordId: "no-rationale",
      subjectKind: "MECHANICAL_EQUIPMENT_REQUIREMENT",
      requirementStatement: "Missing adoption",
      sourceBasis: "PROJECT_SPECIFICATION",
      sourceRef: "spec-100",
      sourceRevision: "B",
      adoptionRationale: " ",
    })).toThrow(/ADOPTION_RATIONALE_REQUIRED/);
    expect(() => recordMechanicalTechnicalRequirement(store, actor, {
      ...bound,
      recordId: "wrong-r4",
      r4RevisionFingerprint: "not-the-vendor-record",
      subjectKind: "MECHANICAL_EQUIPMENT_REQUIREMENT",
      requirementStatement: "Wrong vendor revision",
      sourceBasis: "PROJECT_SPECIFICATION",
      sourceRef: "spec-100",
      sourceRevision: "B",
      adoptionRationale: "Wrong binding",
    })).toThrow(/R4_REVISION_MISMATCH/);
    expect(() => recordMechanicalTechnicalRequirement(store, actor, {
      ...bound,
      recordId: "propagate",
      subjectKind: "PACKAGE_MECHANICAL_REQUIREMENT",
      requirementStatement: "Would apply everywhere",
      sourceBasis: "PROJECT_SPECIFICATION",
      sourceRef: "spec-100",
      sourceRevision: "B",
      applicabilityCase: "ALL",
      adoptionRationale: "Too broad",
    })).toThrow(/APPLICABILITY_MISMATCH/);
    expect(() => recordMechanicalTechnicalRequirement(store, actor, {
      ...bound,
      recordId: "hidden",
      subjectKind: "MECHANICAL_RATING_CRITERIA",
      requirementStatement: "Rating is 10*1.2",
      sourceBasis: "PROJECT_SPECIFICATION",
      sourceRef: "spec-100",
      sourceRevision: "B",
      adoptionRationale: "Hidden product",
    })).toThrow(/HIDDEN_CALCULATION_REJECTED/);
    expect(() => recordMechanicalCodeStandardReference(store, actor, {
      ...bound,
      recordId: "code-conform",
      subjectKind: "CODE_STANDARD_REFERENCE",
      requirementStatement: "Would claim conformance",
      sourceBasis: "CODE_OR_STANDARD_REFERENCE",
      sourceRef: "API-610",
      sourceRevision: "12",
      standardRef: "API 610",
      applicabilityCase: "DESIGN_CODE_B",
      adoptionRationale: "Cited only",
      conforms: true,
    })).toThrow(/VALIDATION_AUTHORITY_REJECTED/);
    expect(() => recordMechanicalMaterialConstructionContext(store, actor, {
      ...bound,
      recordId: "material-calc",
      subjectKind: "MATERIALS_CONSTRUCTION_REQUIREMENT",
      requirementStatement: "Would calculate a material",
      sourceBasis: "PROJECT_SPECIFICATION",
      sourceRef: "spec-100",
      sourceRevision: "B",
      applicabilityCase: "MATERIALS_B",
      adoptionRationale: "No calculation",
      materialCalculation: true,
    })).toThrow(/HIDDEN_CALCULATION_REJECTED/);
    expect(() => recordMechanicalInspectionTestRequirement(store, actor, {
      ...bound,
      recordId: "inspection-done",
      subjectKind: "INSPECTION_TESTING_REQUIREMENT",
      requirementStatement: "Would mark the test passed",
      sourceBasis: "PROJECT_SPECIFICATION",
      sourceRef: "spec-100",
      sourceRevision: "B",
      applicabilityCase: "INSPECTION_B",
      adoptionRationale: "Requirement only",
      testPassed: true,
    })).toThrow(/INSPECTION_COMPLETION_REJECTED/);
    expect(() => recordMechanicalTechnicalRequirement(store, actor, {
      ...bound,
      recordId: "assumption",
      subjectKind: "TECHNICAL_LIMITATION",
      requirementStatement: "Unestablished assumption",
      sourceBasis: "GOVERNED_ASSUMPTION",
      sourceRef: "assumption-1",
      sourceRevision: "A",
      adoptionRationale: "Not established",
    })).toThrow(/ASSUMPTION_NOT_ESTABLISHED/);
    expect(() => adoptSourceRequirement()).toThrow(/SOURCE_REQUIREMENT_AUTO_ADOPTION_REJECTED/);
    expect(() => adoptVendorRequirement()).toThrow(/VENDOR_REQUIREMENT_AUTO_ADOPTION_REJECTED/);
    expect(() => promoteCandidateRequirement()).toThrow(/CANDIDATE_PROMOTION_REJECTED/);
    expect(() => resolveVendorEngineeringDiscrepancy()).toThrow(/DISCREPANCY_RESOLUTION_REJECTED/);
    expect(() => reviseDesignConditionFromRequirement()).toThrow(/R3_DESIGN_CONDITION_MUTATION_REJECTED/);
    expect(() => applyChangedSourceToRequirement()).toThrow(/SOURCE_CHANGE_AUTO_UPDATE_REJECTED/);
    expect(() => repointRequirement()).toThrow(/SOURCE_AUTO_REPOINT_REJECTED/);
    expect(() => mutateRequirement()).toThrow(/SILENT_MUTATION_REJECTED/);
    expect(() => sizeMechanicalEquipment()).toThrow(/EQUIPMENT_SIZING_REJECTED/);
    expect(() => analyzeMaintainability()).toThrow(/MAINTAINABILITY_RUNTIME_REJECTED/);
    expect(() => propagateRequirementChange()).toThrow(/CHANGE_PROPAGATION_REJECTED/);
    expect(() => openDisciplineInterface()).toThrow(/DISCIPLINE_INTERFACE_REJECTED/);
    expect(() => validateRequirement()).toThrow(/VALIDATION_RUNTIME_REJECTED/);
    expect(() => determineConformance()).toThrow(/CONFORMANCE_RUNTIME_REJECTED/);
    expect(() => approveRequirement()).toThrow(/APPROVAL_RUNTIME_REJECTED/);
    expect(() => certifyRequirement()).toThrow(/CERTIFICATION_RUNTIME_REJECTED/);
    expect(() => recordMechanicalTechnicalRequirement(store, { ...actor, actorId: "AI_ASSISTANT" }, {
      ...bound,
      recordId: "ai-req",
      subjectKind: "MECHANICAL_EQUIPMENT_REQUIREMENT",
      requirementStatement: "AI requirement",
      sourceBasis: "PROJECT_SPECIFICATION",
      sourceRef: "spec-100",
      sourceRevision: "B",
      adoptionRationale: "AI",
    })).toThrow(/AI_NOT_MECHANICAL_AUTHORITY/);
    expect(() => recordMechanicalTechnicalRequirement(store, { ...actor, actorId: "ADMIN" }, {
      ...bound,
      recordId: "admin-req",
      subjectKind: "MECHANICAL_EQUIPMENT_REQUIREMENT",
      requirementStatement: "Admin requirement",
      sourceBasis: "PROJECT_SPECIFICATION",
      sourceRef: "spec-100",
      sourceRevision: "B",
      adoptionRationale: "Admin",
    })).toThrow(/ADMIN_NOT_MECHANICAL_AUTHORITY/);
    expect(() => recordMechanicalTechnicalRequirement(store, { ...actor, tenantId: "tenant-b" }, {
      ...bound,
      recordId: "cross-req",
      subjectKind: "MECHANICAL_EQUIPMENT_REQUIREMENT",
      requirementStatement: "Cross tenant",
      sourceBasis: "PROJECT_SPECIFICATION",
      sourceRef: "spec-100",
      sourceRevision: "B",
      adoptionRationale: "Cross",
    })).toThrow(/SCOPE_MISMATCH/);
    expect(() => recordMechanicalTechnicalRequirement(store, actor, {
      ...bound,
      recordId: "mutate-r3",
      subjectKind: "MECHANICAL_EQUIPMENT_REQUIREMENT",
      requirementStatement: "Would rewrite design pressure",
      sourceBasis: "PROJECT_SPECIFICATION",
      sourceRef: "spec-100",
      sourceRevision: "B",
      adoptionRationale: "No rewrite",
      mutateR3: true,
    })).toThrow(/R3_MUTATION_REJECTED/);
    expect(() => recordMechanicalTechnicalRequirement(store, actor, {
      ...bound,
      recordId: "resolve",
      subjectKind: "MECHANICAL_EQUIPMENT_REQUIREMENT",
      requirementStatement: "Would resolve the vendor difference",
      sourceBasis: "PROJECT_SPECIFICATION",
      sourceRef: "spec-100",
      sourceRevision: "B",
      adoptionRationale: "No resolution",
      resolveDiscrepancy: true,
    })).toThrow(/DISCREPANCY_RESOLUTION_REJECTED/);

    const replay = recordMechanicalTechnicalRequirement(store, actor, {
      ...bound,
      recordId: "adopted-req",
      subjectKind: "MECHANICAL_EQUIPMENT_REQUIREMENT",
      requirementStatement: "Adopt the project casing pressure as the Mechanical requirement",
      sourceBasis: "MECHANICAL_DESIGN_BASIS",
      sourceRef: "spec-100",
      sourceRevision: "A",
      suppliedValue: "10",
      unit: "bar",
      adoptionRationale: "Explicit Mechanical adoption of the project specification",
    });
    expect(replay.fingerprint).toBe(adopted.fingerprint);
    expect(() => recordMechanicalTechnicalRequirement(store, actor, {
      ...bound,
      recordId: "adopted-dup",
      subjectKind: "MECHANICAL_EQUIPMENT_REQUIREMENT",
      requirementStatement: "Adopt the project casing pressure as the Mechanical requirement",
      sourceBasis: "MECHANICAL_DESIGN_BASIS",
      sourceRef: "spec-100",
      sourceRevision: "A",
      suppliedValue: "10",
      unit: "bar",
      adoptionRationale: "Duplicate",
    })).toThrow(/DUPLICATE_RECORD_REJECTED/);
    const preserved = adopted.fingerprint;
    const preservedRevision = adopted.sourceRevision;
    const successor = recordMechanicalTechnicalRequirement(store, actor, {
      ...bound,
      recordId: "adopted-req-b",
      predecessorRecordId: adopted.recordId,
      subjectKind: "MECHANICAL_EQUIPMENT_REQUIREMENT",
      requirementStatement: "Revised Mechanical casing requirement after the specification changed",
      sourceBasis: "MECHANICAL_DESIGN_BASIS",
      sourceRef: "spec-100",
      sourceRevision: "B",
      suppliedValue: "11",
      unit: "bar",
      adoptionRationale: "Explicit new revision",
    });
    expect(successor.sourceRevision).toBe("B");
    expect(successor.engineeringValidated).toBe(false);
    expect(successor.predecessorFingerprint).toBe(preserved);
    expect(adopted.sourceRevision).toBe(preservedRevision);
    expect(adopted.fingerprint).toBe(preserved);
    expect(adopted.recordStatus).toBe("SUPERSEDED");
    expect(design.suppliedValue).toBe("10");
    expect(vendorData.suppliedValue).toBe("12");

    const here = dirname(fileURLToPath(import.meta.url));
    const sourceText = readFileSync(join(here, "mechanical-technical-context.ts"), "utf8");
    expect(sourceText).toContain("fingerprintCanonical");
    expect(sourceText).not.toMatch(/createHash|from ["']@rtb\/engineering-review["']|CREATE TABLE/);
    expect(scanAnalysisFormulaBypass(join(here, "mechanical-technical-context.ts"), sourceText)).toEqual([]);
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
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D4.R5.MECHANICAL_REQUIREMENTS_AND_TECHNICAL_CONTEXT")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D4.R6.MAINTAINABILITY_ACCESS_AND_PACKAGE_CONTEXT")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
  });
});
