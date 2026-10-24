import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  D4_0_RUNTIME_STARTED,
  D4_MATURITY_STATES,
  D4_MECHANICAL_OBJECT_TYPES,
  D4_R1_STARTED,
  D4_RUNTIME_COUNT as ARCHITECTURE_RUNTIME_COUNT,
} from "@rtb/types";
import { describe, expect, it } from "vitest";
import { D2_RUNTIME_COUNT_AFTER_R12, D2_TRACK_COMPLETE, D2_TRACK_COMPLETION_CLASSIFICATION } from "../civil/civil-bounded-closeout";
import { D2_REOPENED, D3_RUNTIME_COUNT_AFTER_R12, D3_TRACK_COMPLETE, D3_TRACK_COMPLETION_CLASSIFICATION, D4_0_STARTED } from "../geotechnical/geotechnical-bounded-closeout";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import { STRUCTURAL_CAPABILITY_MANIFEST } from "../structural-concrete/capability";
import { scanAnalysisFormulaBypass } from "../structural-systems/formula-scan";
import { D1_STRUCTURAL_PACK_COMPLETE, D1N_REOPENED } from "../structural-systems/structural-pack-sequencing";
import {
  ADMIN_EQUALS_D4_MECHANICAL_ENGINEERING_AUTHORITY,
  AI_EQUALS_D4_MECHANICAL_ENGINEERING_AUTHORITY,
  CANONICAL_FINGERPRINT_REUSED,
  CROSS_TENANT_D4_OBJECT_ACCESS_ALLOWED,
  D4_APPROVAL_RUNTIME_COUNT,
  D4_AUTOMATIC_MATURITY_PROGRESSION_ALLOWED,
  D4_CERTIFICATION_RUNTIME_COUNT,
  D4_CONTEXT_AUTHORITY,
  D4_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT,
  D4_D9_RUNTIME_INTEGRATION_COUNT,
  D4_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
  D4_D9_SOURCE_CONTRACT_RUNTIME_READY,
  D4_DESIGN_CONDITION_PERFORMANCE_RUNTIME_READY,
  D4_DESIGN_CONDITION_RUNTIME_COUNT,
  D4_DISCIPLINE,
  D4_DISCIPLINE_INTERFACE_RUNTIME_COUNT,
  D4_DISCIPLINE_INTERFACE_RUNTIME_READY,
  D4_DUPLICATE_GOVERNANCE_IMPLEMENTED,
  D4_EQUALS_D1_STRUCTURAL_AUTHORITY,
  D4_EQUALS_D2_CIVIL_AUTHORITY,
  D4_EQUALS_D3_GEOTECHNICAL_AUTHORITY,
  D4_EQUALS_D5_PIPING_AUTHORITY,
  D4_EQUALS_D6_PROCESS_AUTHORITY,
  D4_EQUALS_D7_ELECTRICAL_AUTHORITY,
  D4_EQUALS_D8_INSTRUMENTATION_CONTROL_AUTHORITY,
  D4_EQUIPMENT_CONTEXT_RUNTIME_COUNT,
  D4_EQUIPMENT_SIZING_RUNTIME_COUNT,
  D4_EQUIPMENT_SYSTEM_CONTEXT_RUNTIME_READY,
  D4_EXPLICIT_RELATIONSHIPS_SUPPORTED,
  D4_FATIGUE_ANALYSIS_RUNTIME_COUNT,
  D4_INFERRED_ENGINEERING_RELATIONSHIPS_ALLOWED,
  D4_LIFECYCLE_MATURITY_GOVERNED,
  D4_MAINTAINABILITY_RUNTIME_COUNT,
  D4_MECHANICAL_CONTEXT_EQUALS_ENGINEERING_DESIGN,
  D4_MECHANICAL_CONTEXT_RUNTIME_COUNT,
  D4_MECHANICAL_CONTEXT_RUNTIME_IMPLEMENTED,
  D4_MECHANICAL_DESIGN_OPTIMIZATION_RUNTIME_COUNT,
  D4_MECHANICAL_IDENTITY_OBJECT_FOUNDATION_RUNTIME_READY,
  D4_MECHANICAL_REQUIREMENT_RUNTIME_COUNT,
  D4_OBJECT_FINGERPRINT_IMPLEMENTED,
  D4_OBJECT_HISTORY_PRESERVED,
  D4_OBJECT_IDENTITY_EQUALS_ENGINEERING_CONTENT,
  D4_OBJECT_IDENTITY_EQUALS_ENGINEERING_VALIDATED,
  D4_OBJECT_TYPE_ALLOWLIST_ENFORCED,
  D4_PERFORMANCE_CONTEXT_RUNTIME_COUNT,
  D4_PROVENANCE_PRESERVED,
  D4_PROVENANCE_REQUIRED,
  D4_R1_CANONICAL_NEXT_PHASE,
  D4_R1_CANONICAL_NEXT_PHASE_SCOPE,
  D4_R1_MATURITY,
  D4_R1_NEXT_PHASE_TYPE,
  D4_R1_STATUS,
  D4_R2_STARTED,
  D4_REPLAY_PROTECTION_IMPLEMENTED,
  D4_REUSES_CANONICAL_CURRENTNESS,
  D4_REUSES_CANONICAL_FINGERPRINT,
  D4_REUSES_CANONICAL_OBJECT_IDENTITY,
  D4_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_COUNT,
  D4_ROTATING_EQUIPMENT_CALCULATION_RUNTIME_COUNT,
  D4_RUNTIME_COUNT,
  D4_RUNTIME_STARTED,
  D4_SPOOFING_PROTECTION_IMPLEMENTED,
  D4_STATIC_EQUIPMENT_CALCULATION_RUNTIME_COUNT,
  D4_VENDOR_DATA_RUNTIME_COUNT,
  D4_VIBRATION_ANALYSIS_RUNTIME_COUNT,
  D5_RUNTIME_STARTED,
  D6_RUNTIME_STARTED,
  D7_RUNTIME_STARTED,
  D8_RUNTIME_STARTED,
  D9_RUNTIME_COUNT,
  D9_RUNTIME_STARTED,
  DATABASE_SCHEMA_CHANGED,
  FREEFORM_AUTHORITATIVE_D4_OBJECT_TYPE_ALLOWED,
  MECHANICAL_DESIGN_CONDITION_EQUALS_VALIDATED_DESIGN_CONDITION,
  NEW_DEPENDENCY_ADDED,
  PARALLEL_D4_CURRENTNESS_ENGINE_CREATED,
  PARALLEL_D4_IDENTITY_SYSTEM_CREATED,
  PROCESS_CONDITION_EQUALS_MECHANICAL_DESIGN_CONDITION,
  REVIEWED_EQUALS_VALIDATED,
  SECOND_D4_FINGERPRINT_ALGORITHM_CREATED,
  SILENT_D4_OBJECT_MUTATION_ALLOWED,
  SOURCE_REQUIREMENT_EQUALS_MECHANICAL_INTERPRETATION,
  TENANT_WORKSPACE_PROJECT_D4_SCOPE_ENFORCED,
  UNKNOWN_D4_OBJECT_TYPE_AUTO_ACCEPTED,
  VALIDATED_EQUALS_APPROVED,
  VALIDATED_EQUALS_CERTIFIED,
  VALIDATED_EQUALS_CONFORMANT,
  VENDOR_DATA_EQUALS_ENGINEERING_APPROVAL,
  advanceMechanicalMaturity,
  approveMechanicalEngineering,
  certifyMechanicalEngineering,
  createD4R1Store,
  mutateMechanicalContext,
  recordDesignCondition,
  recordEquipmentEngineeringContext,
  recordMechanicalContext,
  recordMechanicalObjectIdentity,
  recordPerformanceContext,
  recordVendorData,
  sizeMechanicalEquipment,
  validateMechanicalEngineering,
  type D4R1Actor,
} from "./identity-foundation";

const actor: D4R1Actor = {
  actorId: "mechanical-recorder",
  tenantId: "tenant-a",
  workspaceId: "workspace-a",
  projectId: "project-a",
  authority: D4_CONTEXT_AUTHORITY,
};

function contextInput(overrides: Record<string, unknown> = {}) {
  return {
    contextId: "mechanical-context-1",
    citedLifecycleStage: "CONCEPT",
    provenanceRef: "prov-mechanical-context",
    ...overrides,
  };
}

describe("EOS-D4-R1 Mechanical identity and object foundation", () => {
  it("records scoped Mechanical identity without equipment engineering content", () => {
    expect(D4_R1_STATUS).toBe("MECHANICAL_IDENTITY_AND_OBJECT_FOUNDATION_IMPLEMENTED");
    expect(D4_R1_MATURITY).toBe("MECHANICAL_IDENTITY_AND_OBJECT_FOUNDATION_IMPLEMENTED");
    expect(D4_RUNTIME_STARTED).toBe(true);
    expect(D4_RUNTIME_COUNT).toBe(1);
    expect(D4_MECHANICAL_CONTEXT_RUNTIME_IMPLEMENTED).toBe(true);
    expect(D4_MECHANICAL_CONTEXT_RUNTIME_COUNT).toBe(1);
    expect(D4_MECHANICAL_IDENTITY_OBJECT_FOUNDATION_RUNTIME_READY).toBe(true);
    expect(D4_0_RUNTIME_STARTED).toBe(false);
    expect(ARCHITECTURE_RUNTIME_COUNT).toBe(0);
    expect(D4_R1_STARTED).toBe(false);
    expect(D4_0_STARTED).toBe(false);
    expect(D4_EQUIPMENT_SYSTEM_CONTEXT_RUNTIME_READY).toBe(false);
    expect(D4_DESIGN_CONDITION_PERFORMANCE_RUNTIME_READY).toBe(false);
    expect(D4_DISCIPLINE_INTERFACE_RUNTIME_READY).toBe(false);
    expect(D4_D9_SOURCE_CONTRACT_RUNTIME_READY).toBe(false);
    expect(D4_R2_STARTED).toBe(false);
    expect(D4_R1_CANONICAL_NEXT_PHASE).toBe("EOS-D4-R2-EQUIPMENT-AND-SYSTEM-CONTEXT");
    expect(D4_R1_NEXT_PHASE_TYPE).toBe("EQUIPMENT_AND_SYSTEM_CONTEXT");
    expect(D4_R1_CANONICAL_NEXT_PHASE_SCOPE).toContain("without yet implementing design conditions");
    expect(D1_STRUCTURAL_PACK_COMPLETE).toBe(false);
    expect(D1N_REOPENED).toBe(false);
    expect(D2_TRACK_COMPLETE).toBe(true);
    expect(D2_TRACK_COMPLETION_CLASSIFICATION).toBe("COMPLETE_BOUNDED_WITH_LIMITATIONS");
    expect(D2_REOPENED).toBe(false);
    expect(D2_RUNTIME_COUNT_AFTER_R12).toBe(11);
    expect(D3_TRACK_COMPLETE).toBe(true);
    expect(D3_TRACK_COMPLETION_CLASSIFICATION).toBe("COMPLETE_BOUNDED_WITH_LIMITATIONS");
    expect(D3_RUNTIME_COUNT_AFTER_R12).toBe(11);
    expect(D4_REUSES_CANONICAL_OBJECT_IDENTITY).toBe(true);
    expect(D4_REUSES_CANONICAL_CURRENTNESS).toBe(true);
    expect(D4_REUSES_CANONICAL_FINGERPRINT).toBe(true);
    expect(PARALLEL_D4_IDENTITY_SYSTEM_CREATED).toBe(false);
    expect(PARALLEL_D4_CURRENTNESS_ENGINE_CREATED).toBe(false);
    expect(CANONICAL_FINGERPRINT_REUSED).toBe(true);
    expect(D4_OBJECT_FINGERPRINT_IMPLEMENTED).toBe(true);
    expect(SECOND_D4_FINGERPRINT_ALGORITHM_CREATED).toBe(false);
    expect(D4_OBJECT_TYPE_ALLOWLIST_ENFORCED).toBe(true);
    expect(FREEFORM_AUTHORITATIVE_D4_OBJECT_TYPE_ALLOWED).toBe(false);
    expect(UNKNOWN_D4_OBJECT_TYPE_AUTO_ACCEPTED).toBe(false);
    expect(D4_OBJECT_IDENTITY_EQUALS_ENGINEERING_CONTENT).toBe(false);
    expect(D4_OBJECT_IDENTITY_EQUALS_ENGINEERING_VALIDATED).toBe(false);
    expect(D4_MECHANICAL_CONTEXT_EQUALS_ENGINEERING_DESIGN).toBe(false);
    expect(D4_EXPLICIT_RELATIONSHIPS_SUPPORTED).toBe(true);
    expect(D4_INFERRED_ENGINEERING_RELATIONSHIPS_ALLOWED).toBe(false);
    expect(D4_LIFECYCLE_MATURITY_GOVERNED).toBe(true);
    expect(D4_AUTOMATIC_MATURITY_PROGRESSION_ALLOWED).toBe(false);
    expect(TENANT_WORKSPACE_PROJECT_D4_SCOPE_ENFORCED).toBe(true);
    expect(CROSS_TENANT_D4_OBJECT_ACCESS_ALLOWED).toBe(false);
    expect(D4_PROVENANCE_REQUIRED).toBe(true);
    expect(D4_PROVENANCE_PRESERVED).toBe(true);
    expect(SILENT_D4_OBJECT_MUTATION_ALLOWED).toBe(false);
    expect(D4_OBJECT_HISTORY_PRESERVED).toBe(true);
    expect(D4_DUPLICATE_GOVERNANCE_IMPLEMENTED).toBe(true);
    expect(D4_REPLAY_PROTECTION_IMPLEMENTED).toBe(true);
    expect(D4_SPOOFING_PROTECTION_IMPLEMENTED).toBe(true);
    expect(AI_EQUALS_D4_MECHANICAL_ENGINEERING_AUTHORITY).toBe(false);
    expect(ADMIN_EQUALS_D4_MECHANICAL_ENGINEERING_AUTHORITY).toBe(false);
    expect(D4_EQUALS_D1_STRUCTURAL_AUTHORITY).toBe(false);
    expect(D4_EQUALS_D2_CIVIL_AUTHORITY).toBe(false);
    expect(D4_EQUALS_D3_GEOTECHNICAL_AUTHORITY).toBe(false);
    expect(D4_EQUALS_D5_PIPING_AUTHORITY).toBe(false);
    expect(D4_EQUALS_D6_PROCESS_AUTHORITY).toBe(false);
    expect(D4_EQUALS_D7_ELECTRICAL_AUTHORITY).toBe(false);
    expect(D4_EQUALS_D8_INSTRUMENTATION_CONTROL_AUTHORITY).toBe(false);
    expect(SOURCE_REQUIREMENT_EQUALS_MECHANICAL_INTERPRETATION).toBe(false);
    expect(PROCESS_CONDITION_EQUALS_MECHANICAL_DESIGN_CONDITION).toBe(false);
    expect(MECHANICAL_DESIGN_CONDITION_EQUALS_VALIDATED_DESIGN_CONDITION).toBe(false);
    expect(VENDOR_DATA_EQUALS_ENGINEERING_APPROVAL).toBe(false);
    expect(REVIEWED_EQUALS_VALIDATED).toBe(false);
    expect(VALIDATED_EQUALS_CONFORMANT).toBe(false);
    expect(VALIDATED_EQUALS_APPROVED).toBe(false);
    expect(VALIDATED_EQUALS_CERTIFIED).toBe(false);
    expect([
      D4_EQUIPMENT_CONTEXT_RUNTIME_COUNT,
      D4_DESIGN_CONDITION_RUNTIME_COUNT,
      D4_PERFORMANCE_CONTEXT_RUNTIME_COUNT,
      D4_VENDOR_DATA_RUNTIME_COUNT,
      D4_MECHANICAL_REQUIREMENT_RUNTIME_COUNT,
      D4_MAINTAINABILITY_RUNTIME_COUNT,
      D4_DISCIPLINE_INTERFACE_RUNTIME_COUNT,
      D4_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_COUNT,
      D4_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
      D4_EQUIPMENT_SIZING_RUNTIME_COUNT,
      D4_ROTATING_EQUIPMENT_CALCULATION_RUNTIME_COUNT,
      D4_STATIC_EQUIPMENT_CALCULATION_RUNTIME_COUNT,
      D4_VIBRATION_ANALYSIS_RUNTIME_COUNT,
      D4_FATIGUE_ANALYSIS_RUNTIME_COUNT,
      D4_MECHANICAL_DESIGN_OPTIMIZATION_RUNTIME_COUNT,
      D4_APPROVAL_RUNTIME_COUNT,
      D4_CERTIFICATION_RUNTIME_COUNT,
      D4_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT,
      D4_D9_RUNTIME_INTEGRATION_COUNT,
    ]).toEqual(Array(19).fill(0));
    expect(D5_RUNTIME_STARTED).toBe(false);
    expect(D6_RUNTIME_STARTED).toBe(false);
    expect(D7_RUNTIME_STARTED).toBe(false);
    expect(D8_RUNTIME_STARTED).toBe(false);
    expect(D9_RUNTIME_STARTED).toBe(false);
    expect(D9_RUNTIME_COUNT).toBe(0);
    expect(DATABASE_SCHEMA_CHANGED).toBe(false);
    expect(NEW_DEPENDENCY_ADDED).toBe(false);

    const store = createD4R1Store();
    const context = recordMechanicalContext(store, actor, contextInput());
    expect(context.discipline).toBe(D4_DISCIPLINE);
    expect(context.tenantId).toBe(actor.tenantId);
    expect(context.currentness).toBe("CURRENT");
    expect(context.mechanicalEngineeringAuthority).toBe(false);
    expect(context.fingerprint).toBe(fingerprintCanonical({
      contextId: context.contextId,
      tenantId: actor.tenantId,
      workspaceId: actor.workspaceId,
      projectId: actor.projectId,
      discipline: D4_DISCIPLINE,
      citedLifecycleStage: "CONCEPT",
      provenanceRef: "prov-mechanical-context",
      authority: D4_CONTEXT_AUTHORITY,
      predecessorContextId: null,
    }));
    const replayStore = createD4R1Store(() => "2099-01-01T00:00:00.000Z");
    expect(recordMechanicalContext(replayStore, actor, contextInput()).fingerprint).toBe(context.fingerprint);
    expect(recordMechanicalContext(store, actor, contextInput()).contextId).toBe(context.contextId);
    expect(store.history).toHaveLength(1);
    expect(() => recordMechanicalContext(store, actor, contextInput({ contextId: "mechanical-context-2" }))).toThrow(/DUPLICATE_CONTEXT_REJECTED/);
    expect(() => recordMechanicalContext(store, actor, contextInput({ tenantId: "tenant-b" }))).toThrow(/CROSS_TENANT_OPERATION/);
    expect(() => recordMechanicalContext(store, actor, contextInput({ workspaceId: "workspace-b" }))).toThrow(/CROSS_WORKSPACE_OPERATION/);
    expect(() => recordMechanicalContext(store, actor, contextInput({ projectId: "project-b" }))).toThrow(/CROSS_PROJECT_OPERATION/);
    expect(() => recordMechanicalContext(store, { ...actor, actorId: "AI_assistant" }, contextInput())).toThrow(/AI_NOT_MECHANICAL_AUTHORITY/);
    expect(() => recordMechanicalContext(store, { ...actor, authority: "ADMIN" }, contextInput())).toThrow(/ADMIN_NOT_MECHANICAL_AUTHORITY/);
    expect(() => recordMechanicalContext(store, { ...actor, authority: "MECHANICAL_ENGINEERING_AUTHORITY" }, contextInput())).toThrow(/RECORDER_NOT_MECHANICAL_ENGINEERING_AUTHORITY/);
    expect(() => recordMechanicalContext(store, actor, contextInput({ citedLifecycleStage: "CONSTRUCTION" }))).toThrow(/MATURITY_STAGE_INVALID/);
    expect(() => recordMechanicalContext(store, actor, contextInput({ contextId: "latest" }))).toThrow(/CONTEXT_IDENTITY_REQUIRED/);
    expect(() => recordMechanicalContext(store, actor, contextInput({ assertedFingerprint: "spoofed" }))).toThrow(/FINGERPRINT_MISMATCH/);
    expect(() => recordMechanicalContext(store, actor, contextInput({ provenanceRef: "AI_generated" }))).toThrow(/MISSING_PROVENANCE/);
    expect(() => recordMechanicalContext(store, actor, contextInput({ equipmentEngineeringData: true }))).toThrow(/EQUIPMENT_CONTEXT_NOT_IN_R1/);
    expect(() => recordMechanicalContext(store, actor, contextInput({ designCondition: true }))).toThrow(/DESIGN_CONDITION_NOT_IN_R1/);
    expect(() => recordMechanicalContext(store, actor, contextInput({ performanceData: true }))).toThrow(/PERFORMANCE_CONTEXT_NOT_IN_R1/);
    expect(() => recordMechanicalContext(store, actor, contextInput({ vendorData: true }))).toThrow(/VENDOR_DATA_NOT_IN_R1/);
    expect(() => advanceMechanicalMaturity()).toThrow(/MATURITY_PROGRESSION_NOT_IN_R1/);
    expect(() => mutateMechanicalContext()).toThrow(/CONTEXT_MUTATION_REJECTED/);
    expect(() => recordEquipmentEngineeringContext()).toThrow(/EQUIPMENT_CONTEXT_NOT_IN_R1/);
    expect(() => recordDesignCondition()).toThrow(/DESIGN_CONDITION_NOT_IN_R1/);
    expect(() => recordPerformanceContext()).toThrow(/PERFORMANCE_CONTEXT_NOT_IN_R1/);
    expect(() => recordVendorData()).toThrow(/VENDOR_DATA_NOT_IN_R1/);
    expect(() => sizeMechanicalEquipment()).toThrow(/EQUIPMENT_SIZING_NOT_IN_R1/);
    expect(() => validateMechanicalEngineering()).toThrow(/VALIDATION_NOT_IN_R1/);
    expect(() => approveMechanicalEngineering()).toThrow(/APPROVAL_NOT_IN_R1/);
    expect(() => certifyMechanicalEngineering()).toThrow(/CERTIFICATION_NOT_IN_R1/);
    for (const stage of D4_MATURITY_STATES) {
      expect(["CONCEPT", "PREFEASIBILITY", "FEASIBILITY", "FEED", "DETAILED_DESIGN"]).toContain(stage);
    }

    const system = recordMechanicalObjectIdentity(store, actor, {
      objectId: "system-1",
      contextId: context.contextId,
      objectType: "MECHANICAL_SYSTEM_CONTEXT",
      citedLifecycleStage: "CONCEPT",
      provenanceRef: "prov-system",
    });
    expect(system.objectType).toBe("MECHANICAL_SYSTEM_CONTEXT");
    expect(system.mechanicalEngineeringAuthority).toBe(false);
    expect(system).not.toHaveProperty("designPressure");
    expect(system).not.toHaveProperty("capacity");
    expect(system).not.toHaveProperty("vendorName");
    const equipment = recordMechanicalObjectIdentity(store, actor, {
      objectId: "equipment-identity-1",
      contextId: context.contextId,
      objectType: "MECHANICAL_EQUIPMENT",
      citedLifecycleStage: "FEED",
      provenanceRef: "prov-equipment-identity",
      parentObjectId: system.objectId,
    });
    expect(equipment.objectType).toBe("MECHANICAL_EQUIPMENT");
    expect(equipment).not.toHaveProperty("duty");
    expect(equipment).not.toHaveProperty("speed");
    expect(equipment).not.toHaveProperty("mass");
    expect(equipment.relationships).toEqual([{ kind: "PARENT", targetObjectId: system.objectId }]);
    expect(() => recordMechanicalObjectIdentity(store, actor, {
      objectId: "freeform-1",
      contextId: context.contextId,
      objectType: "CUSTOM_PUMP",
      citedLifecycleStage: "CONCEPT",
      provenanceRef: "prov-custom",
    })).toThrow(/OBJECT_TYPE_NOT_ALLOWLISTED/);
    expect(() => recordMechanicalObjectIdentity(store, actor, {
      objectId: "unknown-1",
      contextId: context.contextId,
      objectType: "PUMP",
      citedLifecycleStage: "CONCEPT",
      provenanceRef: "prov-unknown",
    })).toThrow(/OBJECT_TYPE_NOT_ALLOWLISTED/);
    for (const kind of ["NEARBY", "SAME_TAG", "SAME_DOCUMENT", "SPATIALLY_CLOSE", "SEMANTIC", "COMMONLY_ASSOCIATED"]) {
      expect(() => recordMechanicalObjectIdentity(store, actor, {
        objectId: `inferred-${kind}`,
        contextId: context.contextId,
        objectType: "ROTATING_EQUIPMENT",
        citedLifecycleStage: "CONCEPT",
        provenanceRef: `prov-inferred-${kind}`,
        relationships: [{ kind, targetObjectId: system.objectId }],
      })).toThrow(/RELATIONSHIP_KIND_NOT_EXPLICIT/);
    }
    expect(() => recordMechanicalObjectIdentity(store, actor, {
      objectId: "design-identity",
      contextId: context.contextId,
      objectType: "MECHANICAL_DESIGN_CONDITION_CONTEXT",
      citedLifecycleStage: "CONCEPT",
      provenanceRef: "prov-design",
      designCondition: true,
    })).toThrow(/DESIGN_CONDITION_NOT_IN_R1/);
    const replay = recordMechanicalObjectIdentity(store, actor, {
      objectId: system.objectId,
      contextId: context.contextId,
      objectType: "MECHANICAL_SYSTEM_CONTEXT",
      citedLifecycleStage: "CONCEPT",
      provenanceRef: "prov-system",
    });
    expect(replay.fingerprint).toBe(system.fingerprint);
    expect(() => recordMechanicalObjectIdentity(store, actor, {
      objectId: "system-2",
      contextId: context.contextId,
      objectType: "MECHANICAL_SYSTEM_CONTEXT",
      citedLifecycleStage: "CONCEPT",
      provenanceRef: "prov-system",
    })).toThrow(/DUPLICATE_OBJECT_REJECTED/);
    expect(() => recordMechanicalObjectIdentity(store, actor, {
      objectId: system.objectId,
      contextId: context.contextId,
      objectType: "STATIC_EQUIPMENT",
      citedLifecycleStage: "CONCEPT",
      provenanceRef: "prov-type-spoof",
    })).toThrow(/OBJECT_ALREADY_RECORDED/);
    const other = createD4R1Store();
    const otherActor = { ...actor, tenantId: "tenant-b", workspaceId: "workspace-b", projectId: "project-b" };
    const otherContext = recordMechanicalContext(other, otherActor, contextInput());
    recordMechanicalObjectIdentity(other, otherActor, {
      objectId: "foreign-system",
      contextId: otherContext.contextId,
      objectType: "MECHANICAL_SYSTEM_CONTEXT",
      citedLifecycleStage: "CONCEPT",
      provenanceRef: "prov-foreign",
    });
    store.objects.push(other.objects[0]!);
    expect(() => recordMechanicalObjectIdentity(store, actor, {
      objectId: "system-3",
      contextId: context.contextId,
      objectType: "MECHANICAL_SYSTEM_CONTEXT",
      citedLifecycleStage: "DETAILED_DESIGN",
      provenanceRef: "prov-spoof-parent",
      parentObjectId: "foreign-system",
    })).toThrow(/CROSS_TENANT_OPERATION/);
    const preservedFingerprint = context.fingerprint;
    const revised = recordMechanicalContext(store, actor, contextInput({
      contextId: "mechanical-context-1b",
      predecessorContextId: context.contextId,
      provenanceRef: "prov-mechanical-context-b",
    }));
    const historical = store.contexts.find((row) => row.contextId === context.contextId);
    expect(revised.recordStatus).toBe("CURRENT");
    expect(historical?.recordStatus).toBe("SUPERSEDED");
    expect(historical?.currentness).toBe("SUPERSEDED");
    expect(historical?.fingerprint).toBe(preservedFingerprint);
    expect(store.history.some((row) => row.action === "SUPERSEDED" && row.fingerprint === preservedFingerprint)).toBe(true);
    expect(new Set(D4_MECHANICAL_OBJECT_TYPES).size).toBe(D4_MECHANICAL_OBJECT_TYPES.length);
    expect(D4_MECHANICAL_OBJECT_TYPES).toContain("MECHANICAL_GOVERNANCE_RECORD");
    const here = dirname(fileURLToPath(import.meta.url));
    const source = readFileSync(join(here, "identity-foundation.ts"), "utf8");
    expect(source).toContain("fingerprintCanonical");
    expect(source).not.toMatch(/createHash|from ["']@rtb\/engineering-review["']|CREATE TABLE/);
    expect(scanAnalysisFormulaBypass(join(here, "identity-foundation.ts"), source)).toEqual([]);
    const packageJson = JSON.parse(readFileSync(join(here, "../../package.json"), "utf8")) as { dependencies: Record<string, string> };
    expect(Object.keys(packageJson.dependencies).sort()).toEqual(["@rtb/database", "@rtb/engineering-review", "@rtb/platform-commerce", "@rtb/platform-intelligence", "@rtb/platform-kernel", "@rtb/types", "docx", "exceljs", "pptxgenjs", "zod"]);
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D4.R1.MECHANICAL_IDENTITY_AND_OBJECT_FOUNDATION")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D4.R2.EQUIPMENT_AND_SYSTEM_CONTEXT")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
  });
});
