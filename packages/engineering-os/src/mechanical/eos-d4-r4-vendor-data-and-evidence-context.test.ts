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
  D4_EQUIPMENT_SYSTEM_CONTEXT_RUNTIME_READY,
  D4_RUNTIME_COUNT as R2_RUNTIME_COUNT,
  createD4R2Store,
  recordMechanicalEquipmentClassification,
} from "./equipment-system-context";
import {
  D4_DESIGN_CONDITION_PERFORMANCE_RUNTIME_READY,
  D4_R4_STARTED as R3_R4_STARTED,
  D4_RUNTIME_COUNT as R3_RUNTIME_COUNT,
  D4_VENDOR_DATA_EVIDENCE_RUNTIME_READY as R3_VENDOR_READY,
  createD4R3Store,
  recordMechanicalDesignCondition,
  recordMechanicalPerformanceContext,
} from "./design-condition-performance-context";
import {
  ADMIN_CAN_AUTOMATICALLY_ADOPT_VENDOR_VALUE_AS_ENGINEERING,
  ADMIN_CAN_INVENT_VENDOR_VALUE_AS_VENDOR_SOURCE,
  AI_CAN_AUTOMATICALLY_ADOPT_VENDOR_VALUE,
  AI_CAN_INVENT_VENDOR_VALUE,
  AI_CAN_SILENTLY_CHANGE_D4_R4_UNIT,
  AI_EQUALS_D4_MECHANICAL_ENGINEERING_AUTHORITY,
  CERTIFICATE_EVIDENCE_EQUALS_ENGINEERING_VALIDATED,
  CERTIFICATE_EVIDENCE_EQUALS_EOS_CERTIFICATION,
  D1_STRUCTURAL_PACK_COMPLETE as R4_D1_PACK,
  D1N_REOPENED as R4_D1N,
  D2_REOPENED as R4_D2_REOPENED,
  D2_TRACK_COMPLETE as R4_D2_COMPLETE,
  D3_REOPENED,
  D3_TRACK_COMPLETE as R4_D3_COMPLETE,
  D3_TRACK_COMPLETION_CLASSIFICATION,
  D4_APPROVAL_RUNTIME_COUNT,
  D4_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT,
  D4_CERTIFICATION_RUNTIME_COUNT,
  D4_CONFORMANCE_DETERMINATION_RUNTIME_COUNT,
  D4_CROSS_DISCIPLINE_CONFLICT_DETECTION_RUNTIME_COUNT,
  D4_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT,
  D4_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT,
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
  D4_INFERRED_VENDOR_EQUIPMENT_ASSOCIATION_ALLOWED,
  D4_MAINTAINABILITY_RUNTIME_COUNT,
  D4_MECHANICAL_DESIGN_OPTIMIZATION_RUNTIME_COUNT,
  D4_MECHANICAL_LOAD_CALCULATION_RUNTIME_COUNT,
  D4_MECHANICAL_REQUIREMENT_RUNTIME_COUNT,
  D4_R1_IDENTITY_REUSED,
  D4_R2_EQUIPMENT_SYSTEM_CONTEXT_REUSED,
  D4_R3_DESIGN_CONDITION_PERFORMANCE_CONTEXT_REUSED,
  D4_R3_RUNTIME_COUNT_REUSED,
  D4_R4_AUTO_MUTATES_R3_DESIGN_CONDITION,
  D4_R4_AUTO_MUTATES_R3_PERFORMANCE_CONTEXT,
  D4_R4_AUTO_REPOINTED,
  D4_R4_BLOCKER,
  D4_R4_CANONICAL_NEXT_PHASE,
  D4_R4_CANONICAL_NEXT_PHASE_SCOPE,
  D4_R4_DUPLICATE_GOVERNANCE_IMPLEMENTED,
  D4_R4_HISTORY_PRESERVED,
  D4_R4_MATURITY,
  D4_R4_NEXT_PHASE_TYPE,
  D4_R4_PERFORMANCE_CURVE_CALCULATION_RUNTIME_COUNT,
  D4_R4_PROVENANCE_PRESERVED,
  D4_R4_PROVENANCE_REQUIRED,
  D4_R4_REPLAY_PROTECTION_IMPLEMENTED,
  D4_R4_SOURCE_AUTO_REPOINTED,
  D4_R4_SPOOFING_PROTECTION_IMPLEMENTED,
  D4_R4_STATUS,
  D4_R4_UNIT_SEMANTICS_PRESERVED,
  D4_R4_UNITS_REQUIRED_FOR_NUMERIC_VENDOR_DATA,
  D4_R5_STARTED,
  D4_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_COUNT,
  D4_REUSES_CANONICAL_CURRENTNESS,
  D4_REUSES_CANONICAL_FINGERPRINT,
  D4_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_COUNT,
  D4_ROTATING_EQUIPMENT_CALCULATION_RUNTIME_COUNT,
  D4_RUNTIME_COUNT,
  D4_RUNTIME_STARTED,
  D4_STATIC_EQUIPMENT_CALCULATION_RUNTIME_COUNT,
  D4_THERMAL_MECHANICAL_CALCULATION_RUNTIME_COUNT,
  D4_VENDOR_CERTIFICATE_EVIDENCE_SUPPORTED,
  D4_VENDOR_DATA_CONTEXT_IMPLEMENTED,
  D4_VENDOR_DATA_EVIDENCE_RUNTIME_COUNT,
  D4_VENDOR_DATA_EVIDENCE_RUNTIME_IMPLEMENTED,
  D4_VENDOR_DATA_EVIDENCE_RUNTIME_READY,
  D4_VENDOR_DOCUMENT_CURRENTNESS_IMPLEMENTED,
  D4_VENDOR_EVIDENCE_CLASSIFICATION_ALLOWLIST_ENFORCED,
  D4_VENDOR_EVIDENCE_CLASSIFICATION_IMPLEMENTED,
  D4_VENDOR_EVIDENCE_EQUIPMENT_ASSOCIATION_IMPLEMENTED,
  D4_VENDOR_INSPECTION_TEST_EVIDENCE_SUPPORTED,
  D4_VENDOR_MANUFACTURER_IDENTITY_CONTEXT_IMPLEMENTED,
  D4_VENDOR_PERFORMANCE_CURVE_EVIDENCE_SUPPORTED,
  D4_VENDOR_SOURCE_STATUS_CONTEXT_IMPLEMENTED,
  D4_VIBRATION_ANALYSIS_RUNTIME_COUNT,
  D5_RUNTIME_STARTED,
  D6_RUNTIME_STARTED,
  D7_RUNTIME_STARTED,
  D8_RUNTIME_STARTED,
  D9_RUNTIME_COUNT,
  D9_RUNTIME_STARTED,
  DATABASE_SCHEMA_CHANGED,
  EVIDENCE_EQUALS_MECHANICAL_APPROVAL,
  EVIDENCE_EQUALS_MECHANICAL_CONFORMANCE,
  EVIDENCE_EQUALS_MECHANICAL_VALIDATION,
  EXACT_D4_EQUIPMENT_REFERENCE_REQUIRED,
  EXACT_D4_R1_R3_REFERENCE_REQUIRED,
  EXACT_VENDOR_DOCUMENT_REVISION_REQUIRED,
  FLOATING_D4_R4_SOURCE_REFERENCE_ALLOWED,
  FLOATING_VENDOR_DOCUMENT_REFERENCE_ALLOWED,
  FREEFORM_AUTHORITATIVE_VENDOR_EVIDENCE_CLASS_ALLOWED,
  NEW_DEPENDENCY_ADDED,
  NEW_VENDOR_REVISION_AUTO_ADOPTED_AS_ENGINEERING,
  PARALLEL_D4_CURRENTNESS_ENGINE_CREATED,
  SECOND_D4_FINGERPRINT_ALGORITHM_CREATED,
  SILENT_D4_R4_MUTATION_ALLOWED,
  SUPERSEDED_VENDOR_DOCUMENT_DELETED,
  TENANT_WORKSPACE_PROJECT_D4_R4_SCOPE_ENFORCED,
  UNKNOWN_VENDOR_EVIDENCE_CLASS_AUTO_ACCEPTED,
  VENDOR_CERTIFIED_EQUALS_EOS_VALIDATED,
  VENDOR_CERTIFIED_EQUALS_PROJECT_APPROVED,
  VENDOR_CERTIFIED_EQUALS_REGULATORY_CERTIFIED,
  VENDOR_DATA_EQUALS_ENGINEERING_APPROVED,
  VENDOR_DATA_EQUALS_ENGINEERING_VALIDATED,
  VENDOR_DATA_EQUALS_EOS_CERTIFIED,
  VENDOR_DATA_EQUALS_MECHANICAL_ENGINEERING_ADOPTION,
  VENDOR_DOCUMENT_AUTO_REPOINTED,
  VENDOR_EQUALS_D4_PROJECT_ENGINEERING_AUTHORITY,
  VENDOR_INSPECTION_PASS_EQUALS_PROJECT_APPROVAL,
  VENDOR_PERFORMANCE_CURVE_EQUALS_VALIDATED_MECHANICAL_PERFORMANCE,
  VENDOR_TEST_RESULT_EQUALS_MECHANICAL_VALIDATION,
  VENDOR_VALUE_AUTO_ADOPTED_AS_MECHANICAL_ENGINEERING,
  adoptVendorValueAsEngineering,
  approveVendorDocument,
  certifyEquipmentFromVendorEvidence,
  createD4R4Store,
  interpolatePerformanceCurve,
  mutateVendorRecord,
  recordMechanicalCertificateEvidence,
  recordMechanicalInspectionTestEvidence,
  recordMechanicalPerformanceCurveEvidence,
  recordMechanicalVendorData,
  recordMechanicalVendorDocument,
  repointVendorDocument,
  reviseDesignConditionFromVendor,
  revisePerformanceContextFromVendor,
  sizeMechanicalEquipment,
  validateVendorEvidence,
} from "./vendor-data-evidence-context";

const actor: D4R1Actor = {
  actorId: "mechanical-recorder",
  tenantId: "tenant-a",
  workspaceId: "workspace-a",
  projectId: "project-a",
  authority: D4_CONTEXT_AUTHORITY,
};

describe("EOS-D4-R4 Mechanical vendor data and evidence context", () => {
  it("records vendor evidence on exact R1-R3 revisions without adopting it", () => {
    expect(D4_R4_STATUS).toBe("VENDOR_DATA_AND_EVIDENCE_CONTEXT_IMPLEMENTED");
    expect(D4_R4_MATURITY).toBe("VENDOR_DATA_AND_EVIDENCE_CONTEXT_IMPLEMENTED");
    expect(D4_RUNTIME_STARTED).toBe(true);
    expect(D4_RUNTIME_COUNT).toBe(4);
    expect(R1_RUNTIME_COUNT).toBe(1);
    expect(R2_RUNTIME_COUNT).toBe(2);
    expect(R3_RUNTIME_COUNT).toBe(3);
    expect(D4_R3_RUNTIME_COUNT_REUSED).toBe(3);
    expect(D4_EQUIPMENT_SYSTEM_CONTEXT_RUNTIME_READY).toBe(true);
    expect(D4_DESIGN_CONDITION_PERFORMANCE_RUNTIME_READY).toBe(true);
    expect(D4_VENDOR_DATA_EVIDENCE_RUNTIME_IMPLEMENTED).toBe(true);
    expect(D4_VENDOR_DATA_EVIDENCE_RUNTIME_COUNT).toBe(1);
    expect(D4_VENDOR_DATA_EVIDENCE_RUNTIME_READY).toBe(true);
    expect(R3_VENDOR_READY).toBe(false);
    expect(R3_R4_STARTED).toBe(false);
    expect(D4_R5_STARTED).toBe(false);
    expect(D4_0_STARTED).toBe(false);
    expect(D4_R1_IDENTITY_REUSED).toBe(true);
    expect(D4_R2_EQUIPMENT_SYSTEM_CONTEXT_REUSED).toBe(true);
    expect(D4_R3_DESIGN_CONDITION_PERFORMANCE_CONTEXT_REUSED).toBe(true);
    expect(EXACT_D4_R1_R3_REFERENCE_REQUIRED).toBe(true);
    expect(FLOATING_D4_R4_SOURCE_REFERENCE_ALLOWED).toBe(false);
    expect(D4_R4_SOURCE_AUTO_REPOINTED).toBe(false);
    expect(D4_VENDOR_MANUFACTURER_IDENTITY_CONTEXT_IMPLEMENTED).toBe(true);
    expect(EXACT_VENDOR_DOCUMENT_REVISION_REQUIRED).toBe(true);
    expect(FLOATING_VENDOR_DOCUMENT_REFERENCE_ALLOWED).toBe(false);
    expect(VENDOR_DOCUMENT_AUTO_REPOINTED).toBe(false);
    expect(D4_VENDOR_EVIDENCE_CLASSIFICATION_IMPLEMENTED).toBe(true);
    expect(D4_VENDOR_EVIDENCE_CLASSIFICATION_ALLOWLIST_ENFORCED).toBe(true);
    expect(FREEFORM_AUTHORITATIVE_VENDOR_EVIDENCE_CLASS_ALLOWED).toBe(false);
    expect(UNKNOWN_VENDOR_EVIDENCE_CLASS_AUTO_ACCEPTED).toBe(false);
    expect(D4_VENDOR_EVIDENCE_EQUIPMENT_ASSOCIATION_IMPLEMENTED).toBe(true);
    expect(EXACT_D4_EQUIPMENT_REFERENCE_REQUIRED).toBe(true);
    expect(D4_INFERRED_VENDOR_EQUIPMENT_ASSOCIATION_ALLOWED).toBe(false);
    expect(D4_VENDOR_DATA_CONTEXT_IMPLEMENTED).toBe(true);
    expect(AI_CAN_INVENT_VENDOR_VALUE).toBe(false);
    expect(ADMIN_CAN_INVENT_VENDOR_VALUE_AS_VENDOR_SOURCE).toBe(false);
    expect(D4_VENDOR_SOURCE_STATUS_CONTEXT_IMPLEMENTED).toBe(true);
    expect(VENDOR_DATA_EQUALS_MECHANICAL_ENGINEERING_ADOPTION).toBe(false);
    expect(VENDOR_DATA_EQUALS_ENGINEERING_VALIDATED).toBe(false);
    expect(VENDOR_DATA_EQUALS_ENGINEERING_APPROVED).toBe(false);
    expect(VENDOR_DATA_EQUALS_EOS_CERTIFIED).toBe(false);
    expect(VENDOR_CERTIFIED_EQUALS_EOS_VALIDATED).toBe(false);
    expect(VENDOR_CERTIFIED_EQUALS_PROJECT_APPROVED).toBe(false);
    expect(VENDOR_CERTIFIED_EQUALS_REGULATORY_CERTIFIED).toBe(false);
    expect(EVIDENCE_EQUALS_MECHANICAL_VALIDATION).toBe(false);
    expect(EVIDENCE_EQUALS_MECHANICAL_APPROVAL).toBe(false);
    expect(EVIDENCE_EQUALS_MECHANICAL_CONFORMANCE).toBe(false);
    expect(D4_R4_AUTO_MUTATES_R3_DESIGN_CONDITION).toBe(false);
    expect(D4_R4_AUTO_MUTATES_R3_PERFORMANCE_CONTEXT).toBe(false);
    expect(VENDOR_VALUE_AUTO_ADOPTED_AS_MECHANICAL_ENGINEERING).toBe(false);
    expect(AI_CAN_AUTOMATICALLY_ADOPT_VENDOR_VALUE).toBe(false);
    expect(ADMIN_CAN_AUTOMATICALLY_ADOPT_VENDOR_VALUE_AS_ENGINEERING).toBe(false);
    expect(D4_VENDOR_PERFORMANCE_CURVE_EVIDENCE_SUPPORTED).toBe(true);
    expect(D4_R4_PERFORMANCE_CURVE_CALCULATION_RUNTIME_COUNT).toBe(0);
    expect(VENDOR_PERFORMANCE_CURVE_EQUALS_VALIDATED_MECHANICAL_PERFORMANCE).toBe(false);
    expect(D4_VENDOR_INSPECTION_TEST_EVIDENCE_SUPPORTED).toBe(true);
    expect(VENDOR_TEST_RESULT_EQUALS_MECHANICAL_VALIDATION).toBe(false);
    expect(VENDOR_INSPECTION_PASS_EQUALS_PROJECT_APPROVAL).toBe(false);
    expect(D4_VENDOR_CERTIFICATE_EVIDENCE_SUPPORTED).toBe(true);
    expect(CERTIFICATE_EVIDENCE_EQUALS_EOS_CERTIFICATION).toBe(false);
    expect(CERTIFICATE_EVIDENCE_EQUALS_ENGINEERING_VALIDATED).toBe(false);
    expect(D4_R4_UNITS_REQUIRED_FOR_NUMERIC_VENDOR_DATA).toBe(true);
    expect(D4_R4_UNIT_SEMANTICS_PRESERVED).toBe(true);
    expect(AI_CAN_SILENTLY_CHANGE_D4_R4_UNIT).toBe(false);
    expect(D4_REUSES_CANONICAL_CURRENTNESS).toBe(true);
    expect(PARALLEL_D4_CURRENTNESS_ENGINE_CREATED).toBe(false);
    expect(D4_VENDOR_DOCUMENT_CURRENTNESS_IMPLEMENTED).toBe(true);
    expect(SUPERSEDED_VENDOR_DOCUMENT_DELETED).toBe(false);
    expect(NEW_VENDOR_REVISION_AUTO_ADOPTED_AS_ENGINEERING).toBe(false);
    expect(D4_REUSES_CANONICAL_FINGERPRINT).toBe(true);
    expect(SECOND_D4_FINGERPRINT_ALGORITHM_CREATED).toBe(false);
    expect(D4_R4_PROVENANCE_REQUIRED).toBe(true);
    expect(D4_R4_PROVENANCE_PRESERVED).toBe(true);
    expect(D4_R4_AUTO_REPOINTED).toBe(false);
    expect(SILENT_D4_R4_MUTATION_ALLOWED).toBe(false);
    expect(D4_R4_HISTORY_PRESERVED).toBe(true);
    expect(TENANT_WORKSPACE_PROJECT_D4_R4_SCOPE_ENFORCED).toBe(true);
    expect(AI_EQUALS_D4_MECHANICAL_ENGINEERING_AUTHORITY).toBe(false);
    expect(VENDOR_EQUALS_D4_PROJECT_ENGINEERING_AUTHORITY).toBe(false);
    expect(D4_EQUALS_D1_STRUCTURAL_AUTHORITY).toBe(false);
    expect(D4_EQUALS_D5_PIPING_AUTHORITY).toBe(false);
    expect(D4_EQUALS_D6_PROCESS_AUTHORITY).toBe(false);
    expect(D4_EQUALS_D7_ELECTRICAL_AUTHORITY).toBe(false);
    expect(D4_EQUALS_D8_INSTRUMENTATION_CONTROL_AUTHORITY).toBe(false);
    expect(D4_EQUALS_D2_CIVIL_AUTHORITY).toBe(false);
    expect(D4_EQUALS_D3_GEOTECHNICAL_AUTHORITY).toBe(false);
    expect([
      D4_MECHANICAL_REQUIREMENT_RUNTIME_COUNT,
      D4_MAINTAINABILITY_RUNTIME_COUNT,
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
      D4_R4_PERFORMANCE_CURVE_CALCULATION_RUNTIME_COUNT,
      D4_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT,
      D4_CONFORMANCE_DETERMINATION_RUNTIME_COUNT,
      D4_APPROVAL_RUNTIME_COUNT,
      D4_CERTIFICATION_RUNTIME_COUNT,
      D4_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT,
      D4_CROSS_DISCIPLINE_CONFLICT_DETECTION_RUNTIME_COUNT,
      D4_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT,
      D4_D9_RUNTIME_INTEGRATION_COUNT,
    ]).toEqual(Array(24).fill(0));
    expect(D4_R4_DUPLICATE_GOVERNANCE_IMPLEMENTED).toBe(true);
    expect(D4_R4_REPLAY_PROTECTION_IMPLEMENTED).toBe(true);
    expect(D4_R4_SPOOFING_PROTECTION_IMPLEMENTED).toBe(true);
    expect(D5_RUNTIME_STARTED).toBe(false);
    expect(D6_RUNTIME_STARTED).toBe(false);
    expect(D7_RUNTIME_STARTED).toBe(false);
    expect(D8_RUNTIME_STARTED).toBe(false);
    expect(D9_RUNTIME_STARTED).toBe(false);
    expect(D9_RUNTIME_COUNT).toBe(0);
    expect(DATABASE_SCHEMA_CHANGED).toBe(false);
    expect(NEW_DEPENDENCY_ADDED).toBe(false);
    expect(R4_D1_PACK).toBe(false);
    expect(D1_STRUCTURAL_PACK_COMPLETE).toBe(false);
    expect(R4_D1N).toBe(false);
    expect(D1N_REOPENED).toBe(false);
    expect(R4_D2_COMPLETE).toBe(true);
    expect(D2_TRACK_COMPLETE).toBe(true);
    expect(R4_D2_REOPENED).toBe(false);
    expect(D2_REOPENED).toBe(false);
    expect(R4_D3_COMPLETE).toBe(true);
    expect(D3_TRACK_COMPLETE).toBe(true);
    expect(D3_TRACK_COMPLETION_CLASSIFICATION).toBe("COMPLETE_BOUNDED_WITH_LIMITATIONS");
    expect(D3_REOPENED).toBe(false);
    expect(D4_R4_CANONICAL_NEXT_PHASE).toBe("EOS-D4-R5-MECHANICAL-REQUIREMENTS-AND-TECHNICAL-CONTEXT");
    expect(D4_R4_NEXT_PHASE_TYPE).toBe("MECHANICAL_REQUIREMENTS_AND_TECHNICAL_CONTEXT");
    expect(D4_R4_CANONICAL_NEXT_PHASE_SCOPE).toContain("Do not perform sizing/calculations");
    expect(D4_R4_BLOCKER).toBe("NONE");

    const r1 = createD4R1Store();
    const context = recordMechanicalContext(r1, actor, {
      contextId: "mechanical-context-1",
      citedLifecycleStage: "CONCEPT",
      provenanceRef: "prov-mechanical-context",
    });
    const equipment = recordMechanicalObjectIdentity(r1, actor, {
      objectId: "pump-identity-1",
      contextId: context.contextId,
      objectType: "ROTATING_EQUIPMENT",
      citedLifecycleStage: "FEED",
      provenanceRef: "prov-pump-identity",
    });
    const other = recordMechanicalObjectIdentity(r1, actor, {
      objectId: "other-pump",
      contextId: context.contextId,
      objectType: "ROTATING_EQUIPMENT",
      citedLifecycleStage: "FEED",
      provenanceRef: "prov-other",
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
      limitations: "Applies only to this pump identity",
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
    const performance = recordMechanicalPerformanceContext(r3, actor, {
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
      applicabilityCase: "RATED",
      limitations: "Supplied capacity only",
      provenanceRef: "prov-performance",
      recordId: "performance-capacity",
      subjectKind: "CAPACITY",
      suppliedValue: "100",
      unit: "m3/h",
      sourceBasis: "CLIENT_REQUIREMENT",
      sourceRef: "client-duty",
      sourceRevision: "A",
      adoptionRationale: "Supplied capacity requirement",
    });
    const store = createD4R4Store(r3);
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
      citedCurrentness: "CURRENT" as const,
      vendorIdentity: "Acme Pumps",
      sourceOrganization: "Acme Pumps Ltd",
      limitations: "Vendor claim for this pump identity only",
      provenanceRef: "prov-vendor",
    };
    const document = recordMechanicalVendorDocument(store, actor, {
      ...bound,
      recordId: "vendor-doc-1",
      documentRef: "DS-100",
      documentRevision: "C",
      evidenceClass: "VENDOR_DATASHEET",
      sourceStatus: "FOR_INFORMATION",
      sourceDate: "2026-01-15",
    });
    expect(document.vendorIdentity).toBe("Acme Pumps");
    expect(document.documentRevision).toBe("C");
    expect(document.objectRevisionFingerprint).toBe(equipment.fingerprint);
    expect(document.r2RevisionFingerprint).toBe(classification.fingerprint);
    expect(document.r3RevisionFingerprint).toBe(design.fingerprint);
    expect(document.sourceStatus).toBe("FOR_INFORMATION");
    expect(document.vendorCertifiedBySource).toBe(false);
    expect(document.mechanicalEngineeringAdoption).toBe(false);
    expect(document.engineeringValidated).toBe(false);
    expect(document.engineeringApproved).toBe(false);
    expect(document.eosCertified).toBe(false);
    expect(design.fingerprint).toBe(document.r3RevisionFingerprint);
    expect(design.suppliedValue).toBe("10");

    expect(() => recordMechanicalVendorDocument(store, actor, {
      ...bound,
      recordId: "vendor-floating",
      documentRef: "DS-100",
      documentRevision: "latest",
      evidenceClass: "DATASHEET",
    })).toThrow(/DOCUMENT_REVISION_REQUIRED/);
    expect(() => recordMechanicalVendorDocument(store, actor, {
      ...bound,
      recordId: "vendor-freeform",
      documentRef: "DS-101",
      documentRevision: "A",
      evidenceClass: "RANDOM_NOTE",
    })).toThrow(/EVIDENCE_CLASS_NOT_ALLOWLISTED/);
    expect(() => recordMechanicalVendorDocument(store, actor, {
      ...bound,
      recordId: "vendor-inferred-id",
      documentRef: "DS-101",
      documentRevision: "A",
      evidenceClass: "DATASHEET",
      inferFromFileName: true,
      fileName: "acme-pump.pdf",
    })).toThrow(/INFERRED_VENDOR_IDENTITY_REJECTED/);
    expect(() => recordMechanicalVendorDocument(store, actor, {
      ...bound,
      recordId: "vendor-inferred-equip",
      documentRef: "DS-101",
      documentRevision: "A",
      evidenceClass: "DATASHEET",
      similarTag: true,
    })).toThrow(/INFERRED_EQUIPMENT_ASSOCIATION_REJECTED/);
    expect(() => recordMechanicalVendorDocument(store, actor, {
      ...bound,
      recordId: "vendor-wrong-r3",
      r3RevisionFingerprint: "not-the-design-record",
      documentRef: "DS-101",
      documentRevision: "A",
      evidenceClass: "DATASHEET",
    })).toThrow(/R3_REVISION_MISMATCH/);
    expect(() => recordMechanicalVendorDocument(store, actor, {
      ...bound,
      recordId: "vendor-other-equipment",
      objectId: other.objectId,
      objectRevisionFingerprint: other.fingerprint,
      documentRef: "DS-101",
      documentRevision: "A",
      evidenceClass: "DATASHEET",
    })).toThrow(/R2_SUBJECT_MISMATCH/);

    const vendorPressure = recordMechanicalVendorData(store, actor, {
      ...bound,
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
    expect(vendorPressure.unit).toBe("bar");
    expect(vendorPressure.mechanicalEngineeringAdoption).toBe(false);
    expect(vendorPressure.engineeringValidated).toBe(false);
    expect(vendorPressure.sourceDifference?.r3Value).toBe("10");
    expect(vendorPressure.sourceDifference?.vendorValue).toBe("12");
    expect(vendorPressure.sourceDifference?.engineeringAcceptance).toBe(false);
    expect(design.suppliedValue).toBe("10");
    expect(design.fingerprint).toBe(vendorPressure.r3RevisionFingerprint);
    expect(performance.suppliedValue).toBe("100");
    expect(() => recordMechanicalVendorData(store, actor, {
      ...bound,
      recordId: "vendor-no-unit",
      documentRef: "DS-100",
      documentRevision: "C",
      evidenceClass: "WEIGHTS",
      dataKind: "DRY_MASS",
      suppliedValue: "850",
      parentDocumentId: document.recordId,
      parentDocumentFingerprint: document.fingerprint,
    })).toThrow(/UNITS_REQUIRED/);
    expect(() => recordMechanicalVendorData(store, actor, {
      ...bound,
      recordId: "vendor-convert",
      documentRef: "DS-100",
      documentRevision: "C",
      evidenceClass: "PERFORMANCE_DATA",
      dataKind: "DESIGN_RATING",
      suppliedValue: "12",
      unit: "bar",
      normalizedUnit: "kPa",
      parentDocumentId: document.recordId,
      parentDocumentFingerprint: document.fingerprint,
    })).toThrow(/UNIT_CHANGE_REJECTED/);
    expect(() => recordMechanicalVendorData(store, actor, {
      ...bound,
      recordId: "vendor-invented",
      documentRef: "DS-100",
      documentRevision: "C",
      evidenceClass: "PERFORMANCE_DATA",
      dataKind: "HEAD",
      suppliedValue: "40",
      unit: "m",
      invented: true,
      parentDocumentId: document.recordId,
      parentDocumentFingerprint: document.fingerprint,
    })).toThrow(/INVENTED_VENDOR_VALUE_REJECTED/);

    const certified = recordMechanicalVendorDocument(store, actor, {
      ...bound,
      recordId: "vendor-certified-drawing",
      documentRef: "DWG-9",
      documentRevision: "B",
      evidenceClass: "CERTIFIED_OR_VENDOR_DRAWING",
      sourceStatus: "CERTIFIED_BY_VENDOR",
    });
    expect(certified.vendorCertifiedBySource).toBe(true);
    expect(certified.engineeringValidated).toBe(false);
    expect(certified.projectApproved).toBe(false);
    expect(certified.regulatoryCertified).toBe(false);
    expect(certified.eosCertified).toBe(false);
    expect(() => recordMechanicalVendorDocument(store, actor, {
      ...bound,
      recordId: "vendor-status-spoof",
      documentRef: "DWG-10",
      documentRevision: "A",
      evidenceClass: "DRAWING",
      eosCertified: true,
    })).toThrow(/STATUS_SPOOFING_REJECTED/);
    expect(() => recordMechanicalVendorDocument(store, actor, {
      ...bound,
      recordId: "vendor-unknown-status",
      documentRef: "DWG-10",
      documentRevision: "A",
      evidenceClass: "DRAWING",
      sourceStatus: "EOS_CERTIFIED",
    })).toThrow(/SOURCE_STATUS_INVALID/);

    const curve = recordMechanicalPerformanceCurveEvidence(store, actor, {
      ...bound,
      r3RecordId: performance.recordId,
      r3RevisionFingerprint: performance.fingerprint,
      recordId: "vendor-curve",
      documentRef: "CURVE-1",
      documentRevision: "A",
      evidenceClass: "EQUIPMENT_CURVE",
      dataKind: "PERFORMANCE_CURVE",
      suppliedValue: "100",
      unit: "m3/h",
    });
    expect(curve.recordClass).toBe("PERFORMANCE_CURVE_EVIDENCE");
    expect(curve.calculated).toBe(false);
    expect(curve.engineeringValidated).toBe(false);
    expect(curve.sourceDifference).toBeNull();
    expect(performance.suppliedValue).toBe("100");
    expect(performance.fingerprint).toBe(curve.r3RevisionFingerprint);
    expect(() => recordMechanicalPerformanceCurveEvidence(store, actor, {
      ...bound,
      r3RecordId: performance.recordId,
      r3RevisionFingerprint: performance.fingerprint,
      recordId: "vendor-curve-calc",
      documentRef: "CURVE-1",
      documentRevision: "A",
      evidenceClass: "PERFORMANCE_CURVE",
      dataKind: "PERFORMANCE_CURVE",
      suppliedValue: "90",
      unit: "m3/h",
      interpolate: true,
    })).toThrow(/CURVE_CALCULATION_REJECTED/);

    const inspection = recordMechanicalInspectionTestEvidence(store, actor, {
      ...bound,
      recordId: "vendor-hydro",
      documentRef: "ITP-4",
      documentRevision: "A",
      evidenceClass: "INSPECTION_OR_TEST_REPORT",
      inspectionOrTestType: "HYDROSTATIC_TEST",
      statedResult: "PASS",
    });
    expect(inspection.statedResult).toBe("PASS");
    expect(inspection.mechanicalValidation).toBe(false);
    expect(inspection.engineeringApproved).toBe(false);
    expect(inspection.projectApproved).toBe(false);

    const certificate = recordMechanicalCertificateEvidence(store, actor, {
      ...bound,
      recordId: "vendor-certificate",
      documentRef: "CERT-7",
      documentRevision: "A",
      evidenceClass: "CERTIFICATE",
      sourceStatus: "CERTIFIED_BY_VENDOR",
    });
    expect(certificate.recordClass).toBe("CERTIFICATE_EVIDENCE");
    expect(certificate.eosCertified).toBe(false);
    expect(certificate.engineeringValidated).toBe(false);
    expect(certificate.vendorCertifiedBySource).toBe(true);

    expect(() => adoptVendorValueAsEngineering()).toThrow(/VENDOR_VALUE_AUTO_ADOPTION_REJECTED/);
    expect(() => reviseDesignConditionFromVendor()).toThrow(/R3_DESIGN_CONDITION_MUTATION_REJECTED/);
    expect(() => revisePerformanceContextFromVendor()).toThrow(/R3_PERFORMANCE_MUTATION_REJECTED/);
    expect(() => interpolatePerformanceCurve()).toThrow(/CURVE_CALCULATION_REJECTED/);
    expect(() => validateVendorEvidence()).toThrow(/VALIDATION_RUNTIME_REJECTED/);
    expect(() => approveVendorDocument()).toThrow(/APPROVAL_RUNTIME_REJECTED/);
    expect(() => certifyEquipmentFromVendorEvidence()).toThrow(/CERTIFICATION_RUNTIME_REJECTED/);
    expect(() => repointVendorDocument()).toThrow(/SOURCE_AUTO_REPOINT_REJECTED/);
    expect(() => mutateVendorRecord()).toThrow(/SILENT_MUTATION_REJECTED/);
    expect(() => sizeMechanicalEquipment()).toThrow(/EQUIPMENT_SIZING_REJECTED/);
    expect(() => recordMechanicalVendorDocument(store, { ...actor, actorId: "AI_ASSISTANT" }, {
      ...bound,
      recordId: "vendor-ai",
      documentRef: "DS-200",
      documentRevision: "A",
      evidenceClass: "MANUAL",
    })).toThrow(/AI_NOT_MECHANICAL_AUTHORITY/);
    expect(() => recordMechanicalVendorDocument(store, { ...actor, actorId: "ADMIN" }, {
      ...bound,
      recordId: "vendor-admin",
      documentRef: "DS-200",
      documentRevision: "A",
      evidenceClass: "MANUAL",
    })).toThrow(/ADMIN_NOT_MECHANICAL_AUTHORITY/);
    expect(() => recordMechanicalVendorDocument(store, { ...actor, actorId: "VENDOR", authority: "VENDOR" }, {
      ...bound,
      recordId: "vendor-party",
      documentRef: "DS-200",
      documentRevision: "A",
      evidenceClass: "MANUAL",
    })).toThrow(/VENDOR_NOT_PROJECT_ENGINEERING_AUTHORITY/);
    expect(() => recordMechanicalVendorDocument(store, { ...actor, tenantId: "tenant-b" }, {
      ...bound,
      recordId: "vendor-cross",
      documentRef: "DS-200",
      documentRevision: "A",
      evidenceClass: "MANUAL",
    })).toThrow(/SCOPE_MISMATCH/);
    expect(() => recordMechanicalVendorDocument(store, actor, {
      ...bound,
      recordId: "vendor-mutate-r3",
      documentRef: "DS-200",
      documentRevision: "A",
      evidenceClass: "MANUAL",
      mutateR3: true,
    })).toThrow(/R3_MUTATION_REJECTED/);
    expect(() => recordMechanicalVendorDocument(store, actor, {
      ...bound,
      recordId: "vendor-interface",
      documentRef: "NZ-1",
      documentRevision: "A",
      evidenceClass: "NOZZLE_INFORMATION",
      disciplineInterface: true,
    })).toThrow(/DISCIPLINE_INTERFACE_REJECTED/);

    const replay = recordMechanicalVendorDocument(store, actor, {
      ...bound,
      recordId: "vendor-doc-1",
      documentRef: "DS-100",
      documentRevision: "C",
      evidenceClass: "VENDOR_DATASHEET",
      sourceStatus: "FOR_INFORMATION",
      sourceDate: "2026-01-15",
    });
    expect(replay.fingerprint).toBe(document.fingerprint);
    expect(() => recordMechanicalVendorDocument(store, actor, {
      ...bound,
      recordId: "vendor-doc-1",
      documentRef: "DS-100",
      documentRevision: "D",
      evidenceClass: "VENDOR_DATASHEET",
      sourceStatus: "FOR_INFORMATION",
      sourceDate: "2026-01-15",
    })).toThrow(/RECORD_ALREADY_RECORDED/);
    expect(() => recordMechanicalVendorDocument(store, actor, {
      ...bound,
      recordId: "vendor-doc-dup",
      documentRef: "DS-100",
      documentRevision: "C",
      evidenceClass: "VENDOR_DATASHEET",
      sourceStatus: "FOR_REVIEW",
    })).toThrow(/DUPLICATE_RECORD_REJECTED/);

    const preserved = document.fingerprint;
    const preservedRevision = document.documentRevision;
    const successor = recordMechanicalVendorDocument(store, actor, {
      ...bound,
      recordId: "vendor-doc-2",
      predecessorRecordId: document.recordId,
      documentRef: "DS-100",
      documentRevision: "D",
      evidenceClass: "VENDOR_DATASHEET",
      sourceStatus: "FOR_REVIEW",
    });
    expect(successor.documentRevision).toBe("D");
    expect(successor.mechanicalEngineeringAdoption).toBe(false);
    expect(successor.predecessorFingerprint).toBe(preserved);
    expect(document.documentRevision).toBe(preservedRevision);
    expect(document.fingerprint).toBe(preserved);
    expect(document.recordStatus).toBe("SUPERSEDED");
    expect(store.records.some((row) => row.recordId === document.recordId)).toBe(true);
    expect(store.history.some((row) => row.recordId === document.recordId && row.fingerprint === preserved)).toBe(true);
    expect(design.suppliedValue).toBe("10");
    expect(design.fingerprint).toBe(vendorPressure.r3RevisionFingerprint);

    const here = dirname(fileURLToPath(import.meta.url));
    const source = readFileSync(join(here, "vendor-data-evidence-context.ts"), "utf8");
    expect(source).toContain("fingerprintCanonical");
    expect(source).not.toMatch(/createHash|from ["']@rtb\/engineering-review["']|CREATE TABLE/);
    expect(scanAnalysisFormulaBypass(join(here, "vendor-data-evidence-context.ts"), source)).toEqual([]);
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
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D4.R4.VENDOR_DATA_AND_EVIDENCE_CONTEXT")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D4.R5.MECHANICAL_REQUIREMENTS_AND_TECHNICAL_CONTEXT")?.implementationState).toBe("NOT_IMPLEMENTED");
  });
});
