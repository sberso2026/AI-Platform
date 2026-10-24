import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { D3_REOPENED } from "@rtb/types";
import { describe, expect, it } from "vitest";
import { D2_RUNTIME_COUNT_AFTER_R12, D2_TRACK_COMPLETE } from "../civil/civil-bounded-closeout";
import { D2_REOPENED, D3_RUNTIME_COUNT_AFTER_R12, D3_TRACK_COMPLETE, D4_0_STARTED } from "../geotechnical/geotechnical-bounded-closeout";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import { STRUCTURAL_CAPABILITY_MANIFEST } from "../structural-concrete/capability";
import { scanAnalysisFormulaBypass } from "../structural-systems/formula-scan";
import { D1_STRUCTURAL_PACK_COMPLETE, D1N_REOPENED } from "../structural-systems/structural-pack-sequencing";
import {
  ADMIN_EQUALS_D4_MECHANICAL_ENGINEERING_AUTHORITY,
  AI_EQUALS_D4_MECHANICAL_ENGINEERING_AUTHORITY,
  D4_CONTEXT_AUTHORITY,
  D4_D9_RUNTIME_INTEGRATION_COUNT,
  D4_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
  D4_D9_SOURCE_CONTRACT_RUNTIME_READY,
  D4_DESIGN_CONDITION_RUNTIME_COUNT,
  D4_DISCIPLINE_INTERFACE_RUNTIME_COUNT,
  D4_EQUALS_D1_STRUCTURAL_AUTHORITY,
  D4_EQUALS_D5_PIPING_AUTHORITY,
  D4_EQUIPMENT_SIZING_RUNTIME_COUNT,
  D4_EQUIPMENT_SYSTEM_CONTEXT_RUNTIME_READY as R1_EQUIPMENT_READY,
  D4_MECHANICAL_IDENTITY_OBJECT_FOUNDATION_RUNTIME_READY as R1_IDENTITY_READY,
  D4_PERFORMANCE_CONTEXT_RUNTIME_COUNT,
  D4_R2_STARTED,
  D4_RUNTIME_COUNT as R1_RUNTIME_COUNT,
  D4_RUNTIME_STARTED as R1_RUNTIME_STARTED,
  D4_VENDOR_DATA_RUNTIME_COUNT,
  D5_RUNTIME_STARTED as R1_D5_STARTED,
  D9_RUNTIME_COUNT as R1_D9_COUNT,
  D9_RUNTIME_STARTED as R1_D9_STARTED,
  createD4R1Store,
  recordMechanicalContext,
  recordMechanicalObjectIdentity,
  type D4R1Actor,
} from "./identity-foundation";
import {
  D4_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT,
  D4_DESCRIPTIVE_CONTEXT_EQUALS_DESIGN_CONDITION,
  D4_DESCRIPTIVE_CONTEXT_EQUALS_ENGINEERING_VALIDATED,
  D4_DESCRIPTIVE_CONTEXT_EQUALS_PERFORMANCE_DATA,
  D4_DESCRIPTIVE_CONTEXT_EQUALS_VENDOR_DATA,
  D4_DESCRIPTIVE_MECHANICAL_CONTEXT_IMPLEMENTED,
  D4_DESIGN_CONDITION_PERFORMANCE_RUNTIME_READY,
  D4_EQUALS_D2_CIVIL_AUTHORITY,
  D4_EQUALS_D3_GEOTECHNICAL_AUTHORITY,
  D4_EQUALS_D6_PROCESS_AUTHORITY,
  D4_EQUALS_D7_ELECTRICAL_AUTHORITY,
  D4_EQUALS_D8_INSTRUMENTATION_CONTROL_AUTHORITY,
  D4_EQUIPMENT_CLASSIFICATION_ALLOWLIST_ENFORCED,
  D4_EQUIPMENT_CLASSIFICATION_IMPLEMENTED,
  D4_EQUIPMENT_SERVICE_FUNCTION_CONTEXT_IMPLEMENTED,
  D4_EQUIPMENT_SYSTEM_CONTEXT_RUNTIME_COUNT,
  D4_EQUIPMENT_SYSTEM_CONTEXT_RUNTIME_IMPLEMENTED,
  D4_EQUIPMENT_SYSTEM_CONTEXT_RUNTIME_READY,
  D4_EXPLICIT_MEMBERSHIP_RELATIONSHIPS_REQUIRED,
  D4_FATIGUE_ANALYSIS_RUNTIME_COUNT,
  D4_INFERRED_PACKAGE_MEMBERSHIP_ALLOWED,
  D4_INFERRED_SYSTEM_MEMBERSHIP_ALLOWED,
  D4_MECHANICAL_DESIGN_OPTIMIZATION_RUNTIME_COUNT,
  D4_MECHANICAL_IDENTITY_OBJECT_FOUNDATION_RUNTIME_READY,
  D4_MECHANICAL_LOAD_CALCULATION_RUNTIME_COUNT,
  D4_MECHANICAL_REQUIREMENT_RUNTIME_COUNT,
  D4_PACKAGE_MEMBERSHIP_IMPLEMENTED,
  D4_R1_IDENTITY_REUSED,
  D4_R2_AUTO_REPOINTED,
  D4_R2_AUTOMATIC_MATURITY_PROGRESSION_ALLOWED,
  D4_R2_CANONICAL_NEXT_PHASE,
  D4_R2_CANONICAL_NEXT_PHASE_SCOPE,
  D4_R2_DUPLICATE_GOVERNANCE_IMPLEMENTED,
  D4_R2_HISTORY_PRESERVED,
  D4_R2_IDENTITY_REFERENCE_AUTO_REPOINTED,
  D4_R2_LIFECYCLE_MATURITY_GOVERNED,
  D4_R2_MATURITY,
  D4_R2_NEXT_PHASE_TYPE,
  D4_R2_PROVENANCE_PRESERVED,
  D4_R2_PROVENANCE_REQUIRED,
  D4_R2_REPLAY_PROTECTION_IMPLEMENTED,
  D4_R2_SPOOFING_PROTECTION_IMPLEMENTED,
  D4_R2_STATUS,
  D4_R3_STARTED,
  D4_REUSES_CANONICAL_CURRENTNESS,
  D4_REUSES_CANONICAL_FINGERPRINT,
  D4_ROTATING_EQUIPMENT_CALCULATION_RUNTIME_COUNT,
  D4_RUNTIME_COUNT,
  D4_RUNTIME_STARTED,
  D4_STATIC_EQUIPMENT_CALCULATION_RUNTIME_COUNT,
  D4_SYSTEM_MEMBERSHIP_IMPLEMENTED,
  D4_THERMAL_MECHANICAL_CALCULATION_RUNTIME_COUNT,
  D4_VIBRATION_ANALYSIS_RUNTIME_COUNT,
  D5_RUNTIME_STARTED,
  D6_RUNTIME_STARTED,
  D7_RUNTIME_STARTED,
  D8_RUNTIME_STARTED,
  D9_RUNTIME_COUNT,
  D9_RUNTIME_STARTED,
  DATABASE_SCHEMA_CHANGED,
  EXACT_D4_R1_IDENTITY_REFERENCE_REQUIRED,
  FLOATING_D4_R2_IDENTITY_REFERENCE_ALLOWED,
  FREEFORM_AUTHORITATIVE_D4_EQUIPMENT_CLASSIFICATION_ALLOWED,
  NEW_DEPENDENCY_ADDED,
  PARALLEL_D4_CURRENTNESS_ENGINE_CREATED,
  SECOND_D4_FINGERPRINT_ALGORITHM_CREATED,
  SERVICE_FUNCTION_EQUALS_MECHANICAL_PERFORMANCE_VALIDATED,
  SERVICE_FUNCTION_EQUALS_PROCESS_DESIGN,
  SILENT_D4_R2_MUTATION_ALLOWED,
  TENANT_WORKSPACE_PROJECT_D4_R2_SCOPE_ENFORCED,
  UNKNOWN_D4_EQUIPMENT_CLASSIFICATION_AUTO_ACCEPTED,
  advanceMechanicalEquipmentMaturity,
  createD4R2Store,
  mutateMechanicalEquipmentContext,
  recordDesignCondition,
  recordMechanicalDescriptiveContext,
  recordMechanicalEquipmentClassification,
  recordMechanicalPackageMembership,
  recordMechanicalServiceFunction,
  recordMechanicalSystemMembership,
  recordPerformanceContext,
  recordVendorData,
  repointMechanicalEquipmentContext,
  sizeMechanicalEquipment,
} from "./equipment-system-context";

const actor: D4R1Actor = {
  actorId: "mechanical-recorder",
  tenantId: "tenant-a",
  workspaceId: "workspace-a",
  projectId: "project-a",
  authority: D4_CONTEXT_AUTHORITY,
};

describe("EOS-D4-R2 Mechanical equipment and system context", () => {
  it("records classification, service, and explicit membership on exact R1 identities", () => {
    expect(D4_R2_STATUS).toBe("EQUIPMENT_AND_SYSTEM_CONTEXT_IMPLEMENTED");
    expect(D4_R2_MATURITY).toBe("EQUIPMENT_AND_SYSTEM_CONTEXT_IMPLEMENTED");
    expect(D4_RUNTIME_STARTED).toBe(true);
    expect(D4_RUNTIME_COUNT).toBe(2);
    expect(R1_RUNTIME_STARTED).toBe(true);
    expect(R1_RUNTIME_COUNT).toBe(1);
    expect(D4_MECHANICAL_IDENTITY_OBJECT_FOUNDATION_RUNTIME_READY).toBe(true);
    expect(R1_IDENTITY_READY).toBe(true);
    expect(D4_EQUIPMENT_SYSTEM_CONTEXT_RUNTIME_IMPLEMENTED).toBe(true);
    expect(D4_EQUIPMENT_SYSTEM_CONTEXT_RUNTIME_COUNT).toBe(1);
    expect(D4_EQUIPMENT_SYSTEM_CONTEXT_RUNTIME_READY).toBe(true);
    expect(R1_EQUIPMENT_READY).toBe(false);
    expect(D4_R2_STARTED).toBe(false);
    expect(D4_R3_STARTED).toBe(false);
    expect(D4_0_STARTED).toBe(false);
    expect(D4_DESIGN_CONDITION_PERFORMANCE_RUNTIME_READY).toBe(false);
    expect(D4_D9_SOURCE_CONTRACT_RUNTIME_READY).toBe(false);
    expect(D4_R1_IDENTITY_REUSED).toBe(true);
    expect(EXACT_D4_R1_IDENTITY_REFERENCE_REQUIRED).toBe(true);
    expect(FLOATING_D4_R2_IDENTITY_REFERENCE_ALLOWED).toBe(false);
    expect(D4_R2_IDENTITY_REFERENCE_AUTO_REPOINTED).toBe(false);
    expect(D4_EQUIPMENT_CLASSIFICATION_IMPLEMENTED).toBe(true);
    expect(D4_EQUIPMENT_CLASSIFICATION_ALLOWLIST_ENFORCED).toBe(true);
    expect(FREEFORM_AUTHORITATIVE_D4_EQUIPMENT_CLASSIFICATION_ALLOWED).toBe(false);
    expect(UNKNOWN_D4_EQUIPMENT_CLASSIFICATION_AUTO_ACCEPTED).toBe(false);
    expect(D4_EQUIPMENT_SERVICE_FUNCTION_CONTEXT_IMPLEMENTED).toBe(true);
    expect(SERVICE_FUNCTION_EQUALS_PROCESS_DESIGN).toBe(false);
    expect(SERVICE_FUNCTION_EQUALS_MECHANICAL_PERFORMANCE_VALIDATED).toBe(false);
    expect(D4_SYSTEM_MEMBERSHIP_IMPLEMENTED).toBe(true);
    expect(D4_PACKAGE_MEMBERSHIP_IMPLEMENTED).toBe(true);
    expect(D4_EXPLICIT_MEMBERSHIP_RELATIONSHIPS_REQUIRED).toBe(true);
    expect(D4_INFERRED_SYSTEM_MEMBERSHIP_ALLOWED).toBe(false);
    expect(D4_INFERRED_PACKAGE_MEMBERSHIP_ALLOWED).toBe(false);
    expect(D4_DESCRIPTIVE_MECHANICAL_CONTEXT_IMPLEMENTED).toBe(true);
    expect(D4_DESCRIPTIVE_CONTEXT_EQUALS_DESIGN_CONDITION).toBe(false);
    expect(D4_DESCRIPTIVE_CONTEXT_EQUALS_PERFORMANCE_DATA).toBe(false);
    expect(D4_DESCRIPTIVE_CONTEXT_EQUALS_VENDOR_DATA).toBe(false);
    expect(D4_DESCRIPTIVE_CONTEXT_EQUALS_ENGINEERING_VALIDATED).toBe(false);
    expect(D4_REUSES_CANONICAL_CURRENTNESS).toBe(true);
    expect(D4_REUSES_CANONICAL_FINGERPRINT).toBe(true);
    expect(PARALLEL_D4_CURRENTNESS_ENGINE_CREATED).toBe(false);
    expect(SECOND_D4_FINGERPRINT_ALGORITHM_CREATED).toBe(false);
    expect(D4_R2_PROVENANCE_REQUIRED).toBe(true);
    expect(D4_R2_PROVENANCE_PRESERVED).toBe(true);
    expect(D4_R2_AUTO_REPOINTED).toBe(false);
    expect(SILENT_D4_R2_MUTATION_ALLOWED).toBe(false);
    expect(D4_R2_HISTORY_PRESERVED).toBe(true);
    expect(TENANT_WORKSPACE_PROJECT_D4_R2_SCOPE_ENFORCED).toBe(true);
    expect(D4_R2_LIFECYCLE_MATURITY_GOVERNED).toBe(true);
    expect(D4_R2_AUTOMATIC_MATURITY_PROGRESSION_ALLOWED).toBe(false);
    expect(D4_R2_DUPLICATE_GOVERNANCE_IMPLEMENTED).toBe(true);
    expect(D4_R2_REPLAY_PROTECTION_IMPLEMENTED).toBe(true);
    expect(D4_R2_SPOOFING_PROTECTION_IMPLEMENTED).toBe(true);
    expect(AI_EQUALS_D4_MECHANICAL_ENGINEERING_AUTHORITY).toBe(false);
    expect(ADMIN_EQUALS_D4_MECHANICAL_ENGINEERING_AUTHORITY).toBe(false);
    expect(D4_EQUALS_D1_STRUCTURAL_AUTHORITY).toBe(false);
    expect(D4_EQUALS_D2_CIVIL_AUTHORITY).toBe(false);
    expect(D4_EQUALS_D3_GEOTECHNICAL_AUTHORITY).toBe(false);
    expect(D4_EQUALS_D5_PIPING_AUTHORITY).toBe(false);
    expect(D4_EQUALS_D6_PROCESS_AUTHORITY).toBe(false);
    expect(D4_EQUALS_D7_ELECTRICAL_AUTHORITY).toBe(false);
    expect(D4_EQUALS_D8_INSTRUMENTATION_CONTROL_AUTHORITY).toBe(false);
    expect([
      D4_DESIGN_CONDITION_RUNTIME_COUNT,
      D4_PERFORMANCE_CONTEXT_RUNTIME_COUNT,
      D4_VENDOR_DATA_RUNTIME_COUNT,
      D4_MECHANICAL_REQUIREMENT_RUNTIME_COUNT,
      D4_DISCIPLINE_INTERFACE_RUNTIME_COUNT,
      D4_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
      D4_EQUIPMENT_SIZING_RUNTIME_COUNT,
      D4_ROTATING_EQUIPMENT_CALCULATION_RUNTIME_COUNT,
      D4_STATIC_EQUIPMENT_CALCULATION_RUNTIME_COUNT,
      D4_THERMAL_MECHANICAL_CALCULATION_RUNTIME_COUNT,
      D4_MECHANICAL_LOAD_CALCULATION_RUNTIME_COUNT,
      D4_VIBRATION_ANALYSIS_RUNTIME_COUNT,
      D4_FATIGUE_ANALYSIS_RUNTIME_COUNT,
      D4_MECHANICAL_DESIGN_OPTIMIZATION_RUNTIME_COUNT,
      D4_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT,
      D4_D9_RUNTIME_INTEGRATION_COUNT,
    ]).toEqual(Array(16).fill(0));
    expect(D5_RUNTIME_STARTED).toBe(false);
    expect(D6_RUNTIME_STARTED).toBe(false);
    expect(D7_RUNTIME_STARTED).toBe(false);
    expect(D8_RUNTIME_STARTED).toBe(false);
    expect(D9_RUNTIME_STARTED).toBe(false);
    expect(D9_RUNTIME_COUNT).toBe(0);
    expect(R1_D5_STARTED).toBe(false);
    expect(R1_D9_STARTED).toBe(false);
    expect(R1_D9_COUNT).toBe(0);
    expect(DATABASE_SCHEMA_CHANGED).toBe(false);
    expect(NEW_DEPENDENCY_ADDED).toBe(false);
    expect(D1_STRUCTURAL_PACK_COMPLETE).toBe(false);
    expect(D1N_REOPENED).toBe(false);
    expect(D2_TRACK_COMPLETE).toBe(true);
    expect(D2_REOPENED).toBe(false);
    expect(D2_RUNTIME_COUNT_AFTER_R12).toBe(11);
    expect(D3_TRACK_COMPLETE).toBe(true);
    expect(D3_REOPENED).toBe(false);
    expect(D3_RUNTIME_COUNT_AFTER_R12).toBe(11);
    expect(D4_R2_CANONICAL_NEXT_PHASE).toBe("EOS-D4-R3-DESIGN-CONDITIONS-AND-PERFORMANCE-CONTEXT");
    expect(D4_R2_NEXT_PHASE_TYPE).toBe("DESIGN_CONDITIONS_AND_PERFORMANCE_CONTEXT");
    expect(D4_R2_CANONICAL_NEXT_PHASE_SCOPE).toContain("Do not perform equipment sizing");

    const r1 = createD4R1Store();
    const context = recordMechanicalContext(r1, actor, {
      contextId: "mechanical-context-1",
      citedLifecycleStage: "CONCEPT",
      provenanceRef: "prov-mechanical-context",
    });
    const system = recordMechanicalObjectIdentity(r1, actor, {
      objectId: "system-1",
      contextId: context.contextId,
      objectType: "MECHANICAL_SYSTEM_CONTEXT",
      citedLifecycleStage: "CONCEPT",
      provenanceRef: "prov-system",
    });
    const equipment = recordMechanicalObjectIdentity(r1, actor, {
      objectId: "pump-identity-1",
      contextId: context.contextId,
      objectType: "ROTATING_EQUIPMENT",
      citedLifecycleStage: "FEED",
      provenanceRef: "prov-pump-identity",
      parentObjectId: system.objectId,
    });
    const packageIdentity = recordMechanicalObjectIdentity(r1, actor, {
      objectId: "package-1",
      contextId: context.contextId,
      objectType: "MECHANICAL_PACKAGE",
      citedLifecycleStage: "CONCEPT",
      provenanceRef: "prov-package-identity",
    });
    const store = createD4R2Store(r1);
    const classification = recordMechanicalEquipmentClassification(store, actor, {
      classificationId: "class-1",
      contextId: context.contextId,
      objectId: equipment.objectId,
      objectRevisionFingerprint: equipment.fingerprint,
      classification: "PUMP",
      citedLifecycleStage: "FEED",
      provenanceRef: "prov-class",
      citedCurrentness: "CURRENT",
    });
    expect(classification.designAdequacyEstablished).toBe(false);
    expect(classification.objectRevisionFingerprint).toBe(equipment.fingerprint);
    expect(classification.fingerprint).toBe(fingerprintCanonical({
      classificationId: "class-1",
      contextId: context.contextId,
      objectId: equipment.objectId,
      objectRevisionFingerprint: equipment.fingerprint,
      classification: "PUMP",
      citedLifecycleStage: "FEED",
      provenanceRef: "prov-class",
      citedCurrentness: "CURRENT",
      authority: D4_CONTEXT_AUTHORITY,
      predecessorClassificationId: null,
    }));
    expect(recordMechanicalEquipmentClassification(store, actor, {
      classificationId: "class-1",
      contextId: context.contextId,
      objectId: equipment.objectId,
      objectRevisionFingerprint: equipment.fingerprint,
      classification: "PUMP",
      citedLifecycleStage: "FEED",
      provenanceRef: "prov-class",
      citedCurrentness: "CURRENT",
    }).fingerprint).toBe(classification.fingerprint);
    expect(() => recordMechanicalEquipmentClassification(store, actor, {
      classificationId: "class-2",
      contextId: context.contextId,
      objectId: equipment.objectId,
      objectRevisionFingerprint: equipment.fingerprint,
      classification: "PUMP",
      citedLifecycleStage: "FEED",
      provenanceRef: "prov-class-dup",
      citedCurrentness: "CURRENT",
    })).toThrow(/DUPLICATE_CLASSIFICATION_REJECTED/);
    expect(() => recordMechanicalEquipmentClassification(store, actor, {
      classificationId: "class-free",
      contextId: context.contextId,
      objectId: equipment.objectId,
      objectRevisionFingerprint: equipment.fingerprint,
      classification: "CUSTOM_PUMP",
      citedLifecycleStage: "FEED",
      provenanceRef: "prov-free",
      citedCurrentness: "CURRENT",
    })).toThrow(/CLASSIFICATION_NOT_ALLOWLISTED/);
    expect(() => recordMechanicalEquipmentClassification(store, actor, {
      classificationId: "class-mismatch",
      contextId: context.contextId,
      objectId: equipment.objectId,
      objectRevisionFingerprint: equipment.fingerprint,
      classification: "VESSEL",
      citedLifecycleStage: "FEED",
      provenanceRef: "prov-mismatch",
      citedCurrentness: "CURRENT",
    })).toThrow(/CLASSIFICATION_TYPE_MISMATCH/);
    expect(() => recordMechanicalEquipmentClassification(store, actor, {
      classificationId: "class-float",
      contextId: context.contextId,
      objectId: "latest",
      objectRevisionFingerprint: equipment.fingerprint,
      classification: "PUMP",
      citedLifecycleStage: "FEED",
      provenanceRef: "prov-float",
      citedCurrentness: "CURRENT",
    })).toThrow(/R1_OBJECT_REQUIRED/);
    expect(() => recordMechanicalEquipmentClassification(store, actor, {
      classificationId: "class-rev",
      contextId: context.contextId,
      objectId: equipment.objectId,
      objectRevisionFingerprint: "spoofed-revision",
      classification: "COMPRESSOR",
      citedLifecycleStage: "FEED",
      provenanceRef: "prov-rev",
      citedCurrentness: "CURRENT",
    })).toThrow(/R1_REVISION_MISMATCH/);
    expect(() => recordMechanicalEquipmentClassification(store, actor, {
      classificationId: "class-ai",
      contextId: context.contextId,
      objectId: equipment.objectId,
      objectRevisionFingerprint: equipment.fingerprint,
      classification: "FAN_OR_BLOWER",
      citedLifecycleStage: "FEED",
      provenanceRef: "AI_generated",
      citedCurrentness: "CURRENT",
    })).toThrow(/MISSING_PROVENANCE/);
    expect(() => recordMechanicalEquipmentClassification(store, { ...actor, authority: "ADMIN" }, {
      classificationId: "class-admin",
      contextId: context.contextId,
      objectId: equipment.objectId,
      objectRevisionFingerprint: equipment.fingerprint,
      classification: "TURBINE",
      citedLifecycleStage: "FEED",
      provenanceRef: "prov-admin",
      citedCurrentness: "CURRENT",
    })).toThrow(/ADMIN_NOT_MECHANICAL_AUTHORITY/);

    const service = recordMechanicalServiceFunction(store, actor, {
      serviceContextId: "service-1",
      contextId: context.contextId,
      objectId: equipment.objectId,
      objectRevisionFingerprint: equipment.fingerprint,
      serviceFunction: "PUMPING",
      citedLifecycleStage: "FEED",
      provenanceRef: "prov-service",
      citedCurrentness: "CURRENT",
    });
    expect(service.processDesign).toBe(false);
    expect(service.performanceValidated).toBe(false);
    expect(() => recordMechanicalServiceFunction(store, actor, {
      serviceContextId: "service-process",
      contextId: context.contextId,
      objectId: system.objectId,
      objectRevisionFingerprint: system.fingerprint,
      serviceFunction: "PUMPING",
      citedLifecycleStage: "CONCEPT",
      provenanceRef: "prov-process",
      citedCurrentness: "CURRENT",
      processDesignBasis: true,
    })).toThrow(/PROCESS_DESIGN_NOT_IN_R2/);
    expect(() => recordMechanicalServiceFunction(store, actor, {
      serviceContextId: "service-unknown",
      contextId: context.contextId,
      objectId: system.objectId,
      objectRevisionFingerprint: system.fingerprint,
      serviceFunction: "PROCESS_SIMULATION",
      citedLifecycleStage: "CONCEPT",
      provenanceRef: "prov-unknown-service",
      citedCurrentness: "CURRENT",
    })).toThrow(/SERVICE_FUNCTION_NOT_ALLOWLISTED/);

    const systemMembership = recordMechanicalSystemMembership(store, actor, {
      membershipId: "member-system-1",
      contextId: context.contextId,
      objectId: equipment.objectId,
      objectRevisionFingerprint: equipment.fingerprint,
      containerObjectId: system.objectId,
      containerRevisionFingerprint: system.fingerprint,
      citedLifecycleStage: "FEED",
      provenanceRef: "prov-system-member",
      citedCurrentness: "CURRENT",
    });
    expect(systemMembership.membershipKind).toBe("SYSTEM");
    expect(systemMembership.membershipBasis).toBe("EXPLICIT");
    expect(systemMembership.containerRevisionFingerprint).toBe(system.fingerprint);
    const packageMembership = recordMechanicalPackageMembership(store, actor, {
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
    expect(packageMembership.membershipKind).toBe("PACKAGE");
    for (const basis of ["SAME_TAG", "NEARBY", "SAME_DOCUMENT", "SPATIALLY_CLOSE", "SEMANTIC", "AI_SIMILARITY"]) {
      expect(() => recordMechanicalSystemMembership(store, actor, {
        membershipId: `member-${basis}`,
        contextId: context.contextId,
        objectId: packageIdentity.objectId,
        objectRevisionFingerprint: packageIdentity.fingerprint,
        containerObjectId: system.objectId,
        containerRevisionFingerprint: system.fingerprint,
        membershipBasis: basis,
        citedLifecycleStage: "CONCEPT",
        provenanceRef: `prov-${basis}`,
        citedCurrentness: "CURRENT",
      })).toThrow(/INFERRED_MEMBERSHIP_REJECTED/);
    }
    expect(() => recordMechanicalSystemMembership(store, actor, {
      membershipId: "member-dup",
      contextId: context.contextId,
      objectId: equipment.objectId,
      objectRevisionFingerprint: equipment.fingerprint,
      containerObjectId: system.objectId,
      containerRevisionFingerprint: system.fingerprint,
      citedLifecycleStage: "FEED",
      provenanceRef: "prov-member-dup",
      citedCurrentness: "CURRENT",
    })).toThrow(/DUPLICATE_MEMBERSHIP_REJECTED/);

    const description = recordMechanicalDescriptiveContext(store, actor, {
      descriptionId: "desc-1",
      contextId: context.contextId,
      objectId: equipment.objectId,
      objectRevisionFingerprint: equipment.fingerprint,
      description: "Horizontal process pump identity in the cooling-water system",
      equipmentRole: "PRIMARY_SERVICE",
      orientationCategory: "HORIZONTAL",
      operatingContextDescription: "Described as cooling-water service without a governed design value",
      citedLifecycleStage: "FEED",
      provenanceRef: "prov-desc",
      citedCurrentness: "CURRENT",
    });
    expect(description.designConditionAuthority).toBe(false);
    expect(description.performanceAuthority).toBe(false);
    expect(description.vendorDataAuthority).toBe(false);
    expect(description.engineeringValidated).toBe(false);
    expect(description).not.toHaveProperty("designPressure");
    expect(description).not.toHaveProperty("capacity");
    expect(description).not.toHaveProperty("vendorCurve");
    expect(() => recordMechanicalDescriptiveContext(store, actor, {
      descriptionId: "desc-pressure",
      contextId: context.contextId,
      objectId: equipment.objectId,
      objectRevisionFingerprint: equipment.fingerprint,
      description: "Must not become a design record",
      equipmentRole: "STANDBY",
      orientationCategory: "VERTICAL",
      citedLifecycleStage: "FEED",
      provenanceRef: "prov-pressure",
      citedCurrentness: "CURRENT",
      designPressure: "10 bar",
    })).toThrow(/DESIGN_CONDITION_NOT_IN_R2/);
    expect(() => recordMechanicalDescriptiveContext(store, actor, {
      descriptionId: "desc-performance",
      contextId: context.contextId,
      objectId: equipment.objectId,
      objectRevisionFingerprint: equipment.fingerprint,
      description: "Must not become performance",
      equipmentRole: "UTILITY",
      orientationCategory: "NOT_STATED",
      citedLifecycleStage: "FEED",
      provenanceRef: "prov-performance",
      citedCurrentness: "CURRENT",
      capacity: "100",
    })).toThrow(/PERFORMANCE_CONTEXT_NOT_IN_R2/);
    expect(() => recordMechanicalDescriptiveContext(store, actor, {
      descriptionId: "desc-vendor",
      contextId: context.contextId,
      objectId: equipment.objectId,
      objectRevisionFingerprint: equipment.fingerprint,
      description: "Must not become vendor data",
      equipmentRole: "HANDLING",
      orientationCategory: "INCLINED",
      citedLifecycleStage: "FEED",
      provenanceRef: "prov-vendor",
      citedCurrentness: "CURRENT",
      vendorCurve: "curve-a",
    })).toThrow(/VENDOR_DATA_NOT_IN_R2/);
    expect(() => recordMechanicalEquipmentClassification(store, actor, {
      classificationId: "class-size",
      contextId: context.contextId,
      objectId: equipment.objectId,
      objectRevisionFingerprint: equipment.fingerprint,
      classification: "COMPRESSOR",
      citedLifecycleStage: "FEED",
      provenanceRef: "prov-size",
      citedCurrentness: "CURRENT",
      equipmentSizing: true,
    })).toThrow(/EQUIPMENT_SIZING_NOT_IN_R2/);
    expect(() => recordMechanicalServiceFunction(store, actor, {
      serviceContextId: "service-pipe",
      contextId: context.contextId,
      objectId: system.objectId,
      objectRevisionFingerprint: system.fingerprint,
      serviceFunction: "COMPRESSION",
      citedLifecycleStage: "CONCEPT",
      provenanceRef: "prov-pipe",
      citedCurrentness: "CURRENT",
      pipingDesign: true,
    })).toThrow(/PIPING_DESIGN_NOT_IN_R2/);
    expect(() => recordMechanicalServiceFunction(store, actor, {
      serviceContextId: "service-elec",
      contextId: context.contextId,
      objectId: system.objectId,
      objectRevisionFingerprint: system.fingerprint,
      serviceFunction: "VENTILATION",
      citedLifecycleStage: "CONCEPT",
      provenanceRef: "prov-elec",
      citedCurrentness: "CURRENT",
      electricalDesign: true,
    })).toThrow(/ELECTRICAL_DESIGN_NOT_IN_R2/);
    expect(() => recordMechanicalServiceFunction(store, actor, {
      serviceContextId: "service-ic",
      contextId: context.contextId,
      objectId: system.objectId,
      objectRevisionFingerprint: system.fingerprint,
      serviceFunction: "HEAT_TRANSFER",
      citedLifecycleStage: "CONCEPT",
      provenanceRef: "prov-ic",
      citedCurrentness: "CURRENT",
      controlPhilosophy: true,
    })).toThrow(/CONTROL_PHILOSOPHY_NOT_IN_R2/);
    expect(() => recordDesignCondition()).toThrow(/DESIGN_CONDITION_NOT_IN_R2/);
    expect(() => recordPerformanceContext()).toThrow(/PERFORMANCE_CONTEXT_NOT_IN_R2/);
    expect(() => recordVendorData()).toThrow(/VENDOR_DATA_NOT_IN_R2/);
    expect(() => sizeMechanicalEquipment()).toThrow(/EQUIPMENT_SIZING_NOT_IN_R2/);
    expect(() => repointMechanicalEquipmentContext()).toThrow(/AUTO_REPOINT_REJECTED/);
    expect(() => mutateMechanicalEquipmentContext()).toThrow(/CONTEXT_MUTATION_REJECTED/);
    expect(() => advanceMechanicalEquipmentMaturity()).toThrow(/MATURITY_PROGRESSION_NOT_IN_R2/);

    const preserved = classification.fingerprint;
    const revisedEquipment = recordMechanicalObjectIdentity(r1, actor, {
      objectId: "pump-identity-1b",
      contextId: context.contextId,
      objectType: "ROTATING_EQUIPMENT",
      citedLifecycleStage: "DETAILED_DESIGN",
      provenanceRef: "prov-pump-identity-b",
      predecessorObjectId: equipment.objectId,
    });
    expect(store.classifications.find((row) => row.classificationId === classification.classificationId)?.objectRevisionFingerprint).toBe(equipment.fingerprint);
    expect(store.classifications.find((row) => row.classificationId === classification.classificationId)?.fingerprint).toBe(preserved);
    expect(() => recordMechanicalEquipmentClassification(store, actor, {
      classificationId: "class-stale",
      contextId: context.contextId,
      objectId: equipment.objectId,
      objectRevisionFingerprint: equipment.fingerprint,
      classification: "COMPRESSOR",
      citedLifecycleStage: "FEED",
      provenanceRef: "prov-stale",
      citedCurrentness: "CURRENT",
    })).toThrow(/R1_OBJECT_NOT_CURRENT/);
    const successor = recordMechanicalEquipmentClassification(store, actor, {
      classificationId: "class-1b",
      contextId: context.contextId,
      objectId: revisedEquipment.objectId,
      objectRevisionFingerprint: revisedEquipment.fingerprint,
      classification: "PUMP",
      citedLifecycleStage: "DETAILED_DESIGN",
      provenanceRef: "prov-class-b",
      citedCurrentness: "CURRENT",
      predecessorClassificationId: classification.classificationId,
    });
    expect(successor.recordStatus).toBe("CURRENT");
    expect(successor.objectRevisionFingerprint).toBe(revisedEquipment.fingerprint);
    const historical = store.classifications.find((row) => row.classificationId === classification.classificationId);
    expect(historical?.recordStatus).toBe("SUPERSEDED");
    expect(historical?.fingerprint).toBe(preserved);
    expect(historical?.objectRevisionFingerprint).toBe(equipment.fingerprint);
    expect(store.history.some((row) => row.action === "SUPERSEDED" && row.fingerprint === preserved)).toBe(true);
    expect(() => recordMechanicalEquipmentClassification(store, actor, {
      classificationId: "class-cross",
      contextId: context.contextId,
      objectId: revisedEquipment.objectId,
      objectRevisionFingerprint: revisedEquipment.fingerprint,
      classification: "FAN_OR_BLOWER",
      citedLifecycleStage: "DETAILED_DESIGN",
      provenanceRef: "prov-cross",
      citedCurrentness: "CURRENT",
      tenantId: "tenant-b",
    })).toThrow(/CROSS_TENANT_OPERATION/);

    const here = dirname(fileURLToPath(import.meta.url));
    const source = readFileSync(join(here, "equipment-system-context.ts"), "utf8");
    expect(source).toContain("fingerprintCanonical");
    expect(source).not.toMatch(/createHash|from ["']@rtb\/engineering-review["']|CREATE TABLE/);
    expect(scanAnalysisFormulaBypass(join(here, "equipment-system-context.ts"), source)).toEqual([]);
    const packageJson = JSON.parse(readFileSync(join(here, "../../package.json"), "utf8")) as { dependencies: Record<string, string> };
    expect(Object.keys(packageJson.dependencies).sort()).toEqual(["@rtb/database", "@rtb/engineering-review", "@rtb/platform-commerce", "@rtb/platform-intelligence", "@rtb/platform-kernel", "@rtb/types", "docx", "exceljs", "pptxgenjs", "zod"]);
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D4.R2.EQUIPMENT_AND_SYSTEM_CONTEXT")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D4.R3.DESIGN_CONDITIONS_AND_PERFORMANCE_CONTEXT")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
  });
});
