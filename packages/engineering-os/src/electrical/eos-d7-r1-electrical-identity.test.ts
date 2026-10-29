import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  D7_ELECTRICAL_OBJECT_TYPES,
  D7_IDENTITY_RUNTIME_COUNT as ARCHITECTURE_IDENTITY_COUNT,
  D7_R1_STARTED,
  D7_RUNTIME_COUNT as ARCHITECTURE_RUNTIME_COUNT,
  D7_RUNTIME_STARTED as ARCHITECTURE_RUNTIME_STARTED,
} from "@rtb/types";
import { describe, expect, it } from "vitest";
import { STRUCTURAL_CAPABILITY_MANIFEST } from "../structural-concrete/capability";
import { scanAnalysisFormulaBypass } from "../structural-systems/formula-scan";
import {
  AI_EQUALS_D7_ELECTRICAL_ENGINEERING_AUTHORITY,
  BASISLESS_AUTHORITATIVE_D7_IDENTITY_AUTO_ACCEPTED,
  D6_STATUS,
  D6_TRACK_COMPLETE,
  D7_0_ARCHITECTURE_REUSED,
  D7_AUTHORITATIVE_OBJECT_TYPES_ALLOWLIST_ENFORCED,
  D7_AUTOMATIC_ELECTRICAL_DESIGN_RUNTIME_COUNT,
  D7_CANONICAL_OBJECT_TAXONOMY_REUSED,
  D7_CONTEXT_AUTHORITY,
  D7_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT,
  D7_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
  D7_ELECTRICAL_CALCULATION_RUNTIME_COUNT,
  D7_ELECTRICAL_OBJECT_IDENTITY_IMPLEMENTED,
  D7_ELECTRICAL_OBJECT_REVISION_IDENTITY_IMPLEMENTED,
  D7_FEEDER_CABLE_RATING_RUNTIME_COUNT,
  D7_IDENTITY_RUNTIME_COUNT,
  D7_IDENTITY_RUNTIME_READY,
  D7_LOAD_CONSUMER_EQUIPMENT_RUNTIME_COUNT,
  D7_PROTECTION_GROUNDING_HAZARDOUS_AREA_RUNTIME_COUNT,
  D7_R1_AUTO_ADVANCES_MATURITY,
  D7_R1_FINGERPRINT_MISMATCH_AUTO_REPAIRED,
  D7_R1_HISTORICAL_REFERENCE_AUTO_REPOINTED,
  D7_R1_NEXT_PHASE,
  D7_R1_NEXT_PHASE_TYPE,
  D7_R2_STARTED,
  D7_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_COUNT,
  D7_RUNTIME_COUNT,
  D7_RUNTIME_STARTED,
  D7_SYSTEM_SOURCE_DISTRIBUTION_RUNTIME_COUNT,
  D8_RUNTIME_STARTED,
  D9_RUNTIME_COUNT,
  D9_RUNTIME_STARTED,
  ELECTRICAL_MATURITY_EQUALS_VALIDATED,
  ELECTRICAL_OBJECT_IDENTITY_EQUALS_VALIDATED_ELECTRICAL_DESIGN,
  createD7R1Store,
  recordElectricalContext,
  recordElectricalLoadContext,
  recordElectricalObjectIdentity,
  reconstructElectricalObject,
  repairElectricalFingerprint,
  repointElectricalIdentity,
  type D7R1Actor,
} from "./identity-foundation";

const here = dirname(fileURLToPath(import.meta.url));

function actor(overrides: Partial<D7R1Actor> = {}): D7R1Actor {
  return {
    actorId: "elec-recorder",
    tenantId: "tenant-a",
    workspaceId: "workspace-a",
    projectId: "project-a",
    authority: D7_CONTEXT_AUTHORITY,
    ...overrides,
  };
}

function contextInput(overrides: Record<string, unknown> = {}) {
  return {
    contextId: "ctx-1",
    citedLifecycleStage: "FEED",
    provenanceRef: "prov-ctx-1",
    sourceBasisRef: "basis-electrical-identity",
    ...overrides,
  };
}

function objectInput(overrides: Record<string, unknown> = {}) {
  return {
    objectId: "load-1",
    contextId: "ctx-1",
    objectType: "ELECTRICAL_LOAD",
    citedLifecycleStage: "FEED",
    provenanceRef: "prov-load-1",
    sourceBasisRef: "basis-load-identity",
    ...overrides,
  };
}

describe("EOS-D7-R1 electrical identity and object foundation", () => {
  it("records exact Electrical identity without promoting engineering truth", () => {
    expect(D7_0_ARCHITECTURE_REUSED).toBe(true);
    expect(D7_CANONICAL_OBJECT_TAXONOMY_REUSED && D7_AUTHORITATIVE_OBJECT_TYPES_ALLOWLIST_ENFORCED).toBe(true);
    expect(ARCHITECTURE_RUNTIME_STARTED).toBe(false);
    expect(ARCHITECTURE_RUNTIME_COUNT).toBe(0);
    expect(ARCHITECTURE_IDENTITY_COUNT).toBe(0);
    expect(D7_R1_STARTED).toBe(false);
    expect(D7_RUNTIME_STARTED).toBe(true);
    expect(D7_RUNTIME_COUNT).toBe(1);
    expect(D7_IDENTITY_RUNTIME_COUNT).toBe(1);
    expect(D7_IDENTITY_RUNTIME_READY).toBe(true);
    expect(D7_ELECTRICAL_OBJECT_TYPES).toContain("ELECTRICAL_LOAD");
    expect(D7_ELECTRICAL_OBJECT_TYPES).not.toContain("TRANSFORMER");
    expect([
      D7_SYSTEM_SOURCE_DISTRIBUTION_RUNTIME_COUNT,
      D7_LOAD_CONSUMER_EQUIPMENT_RUNTIME_COUNT,
      D7_FEEDER_CABLE_RATING_RUNTIME_COUNT,
      D7_PROTECTION_GROUNDING_HAZARDOUS_AREA_RUNTIME_COUNT,
      D7_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_COUNT,
      D7_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT,
      D7_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
      D7_ELECTRICAL_CALCULATION_RUNTIME_COUNT,
      D7_AUTOMATIC_ELECTRICAL_DESIGN_RUNTIME_COUNT,
      D9_RUNTIME_COUNT,
    ]).toEqual(Array.from({ length: 10 }, () => 0));
    expect(D8_RUNTIME_STARTED || D9_RUNTIME_STARTED || D7_R2_STARTED).toBe(false);
    expect(D6_TRACK_COMPLETE).toBe(true);
    expect(D6_STATUS).toBe("COMPLETE_BOUNDED_WITH_LIMITATIONS");
    expect(ELECTRICAL_OBJECT_IDENTITY_EQUALS_VALIDATED_ELECTRICAL_DESIGN || ELECTRICAL_MATURITY_EQUALS_VALIDATED || D7_R1_AUTO_ADVANCES_MATURITY || BASISLESS_AUTHORITATIVE_D7_IDENTITY_AUTO_ACCEPTED || D7_R1_HISTORICAL_REFERENCE_AUTO_REPOINTED || D7_R1_FINGERPRINT_MISMATCH_AUTO_REPAIRED || AI_EQUALS_D7_ELECTRICAL_ENGINEERING_AUTHORITY).toBe(false);
    expect(D7_R1_NEXT_PHASE).toBe("EOS-D7-R2-ELECTRICAL-SYSTEM-SOURCE-AND-DISTRIBUTION-CONTEXT");
    expect(D7_R1_NEXT_PHASE_TYPE).toBe("ELECTRICAL_SYSTEM_SOURCE_AND_DISTRIBUTION_CONTEXT");

    const store = createD7R1Store();
    const who = actor();
    const context = recordElectricalContext(store, who, contextInput());
    const created = recordElectricalObjectIdentity(store, who, objectInput({ displayName: "Crusher feeder identity", projectTag: "EF-101" }));
    expect(created.engineeringValidated).toBe(false);
    expect(created.conformant).toBe(false);
    expect(created.approved).toBe(false);
    expect(created.certified).toBe(false);
    expect(created.loadContextEstablished).toBe(false);
    expect(created.systemContextEstablished).toBe(false);
    expect(created.currentness).toBe("CURRENT");
    expect(created.citedLifecycleStage).toBe("FEED");
    const replay = recordElectricalObjectIdentity(store, who, { ...objectInput({ displayName: "Crusher feeder identity", projectTag: "EF-101" }), assertedFingerprint: created.fingerprint });
    expect(replay).toBe(created);
    expect(store.history.filter((row) => row.subjectId === created.objectId && row.action === "CREATED")).toHaveLength(1);

    const revised = recordElectricalObjectIdentity(store, who, objectInput({
      objectId: "load-1-r2",
      predecessorObjectId: created.objectId,
      provenanceRef: "prov-load-1-r2",
      sourceBasisRef: "basis-load-identity-r2",
      displayName: "Crusher feeder identity",
      projectTag: "EF-101",
    }));
    const historical = reconstructElectricalObject(store, created.objectId);
    expect(historical.objectId).toBe(created.objectId);
    expect(historical.fingerprint).toBe(created.fingerprint);
    expect(historical.currentness).toBe("SUPERSEDED");
    expect(historical.recordStatus).toBe("SUPERSEDED");
    expect(revised.predecessorObjectId).toBe(created.objectId);
    expect(revised.engineeringValidated).toBe(false);
    expect(revised.citedLifecycleStage).toBe("FEED");

    expect(() => recordElectricalObjectIdentity(store, who, objectInput({ objectType: "TRANSFORMER" }))).toThrow(/OBJECT_TYPE_NOT_ALLOWLISTED/);
    expect(() => recordElectricalObjectIdentity(store, who, objectInput({ objectId: "cable-1", objectType: "ELECTRICAL_CABLE", provenanceRef: "prov-cable", sourceBasisRef: "basis-cable", cableSize: true }))).toThrow(/FEEDER_CABLE_NOT_IN_R1/);
    expect(() => recordElectricalObjectIdentity(store, who, objectInput({ objectId: "sys-1", objectType: "ELECTRICAL_SYSTEM", provenanceRef: "prov-sys", sourceBasisRef: "basis-sys", systemTopology: true }))).toThrow(/SYSTEM_CONTEXT_NOT_IN_R1/);
    expect(() => recordElectricalObjectIdentity(store, who, objectInput({ objectId: "motor-1", objectType: "ELECTRICAL_MOTOR_DRIVE", provenanceRef: "prov-motor", sourceBasisRef: "basis-motor", connectedLoad: true }))).toThrow(/LOAD_CONTEXT_NOT_IN_R1/);
    expect(() => recordElectricalObjectIdentity(store, who, objectInput({ objectId: "prot-1", objectType: "ELECTRICAL_PROTECTION_CONTEXT", provenanceRef: "prov-prot", sourceBasisRef: "basis-prot", protectionSetting: true }))).toThrow(/PROTECTION_GROUNDING_NOT_IN_R1/);
    expect(() => recordElectricalObjectIdentity(store, who, objectInput({ objectId: "gnd-1", objectType: "ELECTRICAL_GROUNDING_CONTEXT", provenanceRef: "prov-gnd", sourceBasisRef: "basis-gnd", groundingDesign: true }))).toThrow(/PROTECTION_GROUNDING_NOT_IN_R1/);
    expect(() => recordElectricalObjectIdentity(store, who, objectInput({ assertedFingerprint: "spoofed" }))).toThrow(/FINGERPRINT_MISMATCH/);
    expect(reconstructElectricalObject(store, created.objectId).fingerprint).toBe(created.fingerprint);
    expect(() => recordElectricalObjectIdentity(store, who, objectInput({ objectId: "latest", provenanceRef: "prov-float", sourceBasisRef: "basis-float" }))).toThrow(/OBJECT_IDENTITY_REQUIRED/);
    expect(() => recordElectricalObjectIdentity(store, actor({ tenantId: "tenant-b" }), objectInput({ objectId: "other", provenanceRef: "prov-other", sourceBasisRef: "basis-other" }))).toThrow(/CROSS_SCOPE_OPERATION/);
    expect(() => recordElectricalObjectIdentity(store, actor({ authority: "AI_ASSISTANT" }), objectInput())).toThrow(/AI_NOT_ELECTRICAL_AUTHORITY/);
    expect(() => recordElectricalObjectIdentity(store, actor({ authority: "ADMIN" }), objectInput())).toThrow(/ADMIN_NOT_ELECTRICAL_AUTHORITY/);
    expect(() => recordElectricalObjectIdentity(store, who, objectInput({ objectId: "rel-1", provenanceRef: "prov-rel", sourceBasisRef: "basis-rel", relationships: [{ kind: "tag_similarity", targetObjectId: created.objectId }] }))).toThrow(/INFERRED_RELATIONSHIP_REJECTED/);
    expect(() => recordElectricalContext(store, who, contextInput({ provenanceRef: "", sourceBasisRef: "" }))).toThrow(/MISSING_PROVENANCE/);
    expect(() => recordElectricalObjectIdentity(store, who, objectInput({ objectId: "adv", provenanceRef: "prov-adv", sourceBasisRef: "basis-adv", advanceMaturity: true }))).toThrow(/MATURITY_PROGRESSION_NOT_IN_R1/);
    expect(() => recordElectricalLoadContext()).toThrow(/LOAD_CONTEXT_NOT_IN_R1/);
    expect(() => repointElectricalIdentity()).toThrow(/AUTO_REPOINT_REJECTED/);
    expect(() => repairElectricalFingerprint()).toThrow(/FINGERPRINT_REPAIR_REJECTED/);
    expect(context.electricalEngineeringAuthority).toBe(false);

    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D7.R1.ELECTRICAL_IDENTITY_AND_OBJECT_FOUNDATION")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D7.R2.ELECTRICAL_SYSTEM_SOURCE_AND_DISTRIBUTION_CONTEXT")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    const sourceText = readFileSync(join(here, "identity-foundation.ts"), "utf8");
    expect(sourceText).toMatch(/fingerprintCanonical/);
    expect(sourceText).not.toMatch(/createHash|from ["']@rtb\/engineering-review["']|CREATE TABLE|eval\(|child_process|new Function/);
    expect(scanAnalysisFormulaBypass(join(here, "identity-foundation.ts"), sourceText)).toEqual([]);
    const packageJson = JSON.parse(readFileSync(join(here, "../../package.json"), "utf8")) as { dependencies: Record<string, string> };
    expect(Object.keys(packageJson.dependencies).sort()).toEqual(["@rtb/database", "@rtb/platform-commerce", "@rtb/platform-intelligence", "@rtb/platform-kernel", "@rtb/types", "docx", "exceljs", "pptxgenjs", "zod"]);
  });
});
