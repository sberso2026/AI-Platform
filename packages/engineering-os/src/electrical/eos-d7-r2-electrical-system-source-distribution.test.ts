import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  D7_IDENTITY_RUNTIME_COUNT as ARCHITECTURE_IDENTITY_COUNT,
  D7_RUNTIME_COUNT as ARCHITECTURE_RUNTIME_COUNT,
  D7_SYSTEM_SOURCE_DISTRIBUTION_RUNTIME_COUNT as ARCHITECTURE_SYSTEM_COUNT,
} from "@rtb/types";
import { describe, expect, it } from "vitest";
import { STRUCTURAL_CAPABILITY_MANIFEST } from "../structural-concrete/capability";
import { scanAnalysisFormulaBypass } from "../structural-systems/formula-scan";
import {
  D7_CONTEXT_AUTHORITY,
  D7_IDENTITY_RUNTIME_COUNT,
  D7_RUNTIME_COUNT as R1_RUNTIME_COUNT,
  D7_SYSTEM_SOURCE_DISTRIBUTION_RUNTIME_COUNT as R1_SYSTEM_COUNT,
  createD7R1Store,
  recordElectricalContext,
  recordElectricalObjectIdentity,
  type D7R1Actor,
} from "./identity-foundation";
import {
  BUS_CONTEXT_EQUALS_VALIDATED_BUS_RATING,
  D6_STATUS,
  D6_TRACK_COMPLETE,
  D7_BUS_CONTEXT_SUPPORTED,
  D7_DISTRIBUTION_HIERARCHY_EQUALS_LOAD_FLOW_RESULT,
  D7_ELECTRICAL_CALCULATION_RUNTIME_COUNT,
  D7_ELECTRICAL_DISTRIBUTION_CONTEXT_IMPLEMENTED,
  D7_ELECTRICAL_SOURCE_CONTEXT_IMPLEMENTED,
  D7_ELECTRICAL_SYSTEM_CONTEXT_IMPLEMENTED,
  D7_EXPLICIT_DISTRIBUTION_RELATIONSHIP_REQUIRED,
  D7_EXPLICIT_SYSTEM_SOURCE_RELATIONSHIP_REQUIRED,
  D7_FEEDER_CABLE_RATING_RUNTIME_COUNT,
  D7_GENERATOR_CONTEXT_SUPPORTED,
  D7_IDENTITY_RUNTIME_COUNT as LIVE_IDENTITY_COUNT,
  D7_INFERRED_DISTRIBUTION_RELATIONSHIP_ALLOWED,
  D7_INFERRED_SYSTEM_SOURCE_RELATIONSHIP_ALLOWED,
  D7_LOAD_CONSUMER_EQUIPMENT_RUNTIME_COUNT,
  D7_PROTECTION_GROUNDING_HAZARDOUS_AREA_RUNTIME_COUNT,
  D7_R1_IDENTITY_REUSED,
  D7_R2_HISTORICAL_REFERENCE_AUTO_REPOINTED,
  D7_R2_NEXT_PHASE,
  D7_R2_NEXT_PHASE_TYPE,
  D7_R3_STARTED,
  D7_RUNTIME_COUNT,
  D7_SWITCHBOARD_SWITCHGEAR_CONTEXT_SUPPORTED,
  D7_SYSTEM_SOURCE_DISTRIBUTION_RUNTIME_COUNT,
  D7_SYSTEM_SOURCE_DISTRIBUTION_RUNTIME_READY,
  D7_TRANSFORMER_CONTEXT_SUPPORTED,
  D8_RUNTIME_STARTED,
  D9_RUNTIME_COUNT,
  D9_RUNTIME_STARTED,
  ELECTRICAL_SOURCE_PRESENT_EQUALS_CAPACITY_VALIDATED,
  ELECTRICAL_SYSTEM_CONTEXT_EQUALS_VALIDATED_ELECTRICAL_DESIGN,
  GENERATOR_CONTEXT_EQUALS_VALIDATED_GENERATOR_SIZING,
  SWITCHGEAR_CONTEXT_EQUALS_VALIDATED_SWITCHGEAR_RATING,
  TRANSFORMER_CONTEXT_EQUALS_VALIDATED_TRANSFORMER_SIZING,
  createD7R2Store,
  mutateElectricalDistributionContext,
  recordElectricalCalculationEvidence,
  recordElectricalDistributionContext,
  recordElectricalDistributionRelationship,
  recordElectricalFeederDesign,
  recordElectricalLoadContext,
  recordElectricalProtectionContext,
  recordElectricalSourceContext,
  recordElectricalSystemContext,
  reconstructElectricalRelationship,
  repointElectricalDistributionRelationship,
} from "./system-source-distribution-context";

const here = dirname(fileURLToPath(import.meta.url));

function actor(overrides: Partial<D7R1Actor> = {}): D7R1Actor {
  return { actorId: "elec-recorder", tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a", authority: D7_CONTEXT_AUTHORITY, ...overrides };
}

describe("EOS-D7-R2 electrical system source and distribution context", () => {
  it("binds explicit system, source, and distribution context to exact R1 revisions", () => {
    expect(D7_R1_IDENTITY_REUSED).toBe(true);
    expect(R1_RUNTIME_COUNT).toBe(1);
    expect(R1_SYSTEM_COUNT).toBe(0);
    expect(ARCHITECTURE_RUNTIME_COUNT).toBe(0);
    expect(ARCHITECTURE_SYSTEM_COUNT).toBe(0);
    expect(ARCHITECTURE_IDENTITY_COUNT).toBe(0);
    expect(D7_RUNTIME_COUNT).toBe(2);
    expect(D7_SYSTEM_SOURCE_DISTRIBUTION_RUNTIME_COUNT).toBe(1);
    expect(D7_SYSTEM_SOURCE_DISTRIBUTION_RUNTIME_READY).toBe(true);
    expect(LIVE_IDENTITY_COUNT).toBe(D7_IDENTITY_RUNTIME_COUNT);
    expect(D7_IDENTITY_RUNTIME_COUNT).toBe(1);
    expect(D7_ELECTRICAL_SYSTEM_CONTEXT_IMPLEMENTED && D7_ELECTRICAL_SOURCE_CONTEXT_IMPLEMENTED && D7_ELECTRICAL_DISTRIBUTION_CONTEXT_IMPLEMENTED).toBe(true);
    expect(D7_EXPLICIT_SYSTEM_SOURCE_RELATIONSHIP_REQUIRED && D7_EXPLICIT_DISTRIBUTION_RELATIONSHIP_REQUIRED).toBe(true);
    expect(D7_INFERRED_SYSTEM_SOURCE_RELATIONSHIP_ALLOWED || D7_INFERRED_DISTRIBUTION_RELATIONSHIP_ALLOWED).toBe(false);
    expect(D7_BUS_CONTEXT_SUPPORTED && D7_SWITCHBOARD_SWITCHGEAR_CONTEXT_SUPPORTED && D7_TRANSFORMER_CONTEXT_SUPPORTED && D7_GENERATOR_CONTEXT_SUPPORTED).toBe(true);
    expect(ELECTRICAL_SYSTEM_CONTEXT_EQUALS_VALIDATED_ELECTRICAL_DESIGN || ELECTRICAL_SOURCE_PRESENT_EQUALS_CAPACITY_VALIDATED || BUS_CONTEXT_EQUALS_VALIDATED_BUS_RATING || SWITCHGEAR_CONTEXT_EQUALS_VALIDATED_SWITCHGEAR_RATING || TRANSFORMER_CONTEXT_EQUALS_VALIDATED_TRANSFORMER_SIZING || GENERATOR_CONTEXT_EQUALS_VALIDATED_GENERATOR_SIZING || D7_DISTRIBUTION_HIERARCHY_EQUALS_LOAD_FLOW_RESULT || D7_R2_HISTORICAL_REFERENCE_AUTO_REPOINTED).toBe(false);
    expect([D7_LOAD_CONSUMER_EQUIPMENT_RUNTIME_COUNT, D7_FEEDER_CABLE_RATING_RUNTIME_COUNT, D7_PROTECTION_GROUNDING_HAZARDOUS_AREA_RUNTIME_COUNT, D7_ELECTRICAL_CALCULATION_RUNTIME_COUNT, D9_RUNTIME_COUNT]).toEqual([0, 0, 0, 0, 0]);
    expect(D8_RUNTIME_STARTED || D9_RUNTIME_STARTED || D7_R3_STARTED).toBe(false);
    expect(D6_TRACK_COMPLETE).toBe(true);
    expect(D6_STATUS).toBe("COMPLETE_BOUNDED_WITH_LIMITATIONS");
    expect(D7_R2_NEXT_PHASE).toBe("EOS-D7-R3-LOAD-CONSUMER-AND-EQUIPMENT-CONTEXT");
    expect(D7_R2_NEXT_PHASE_TYPE).toBe("LOAD_CONSUMER_AND_EQUIPMENT_CONTEXT");

    const r1 = createD7R1Store();
    const who = actor();
    recordElectricalContext(r1, who, { contextId: "ctx-1", citedLifecycleStage: "FEED", provenanceRef: "prov-ctx", sourceBasisRef: "basis-ctx" });
    const system = recordElectricalObjectIdentity(r1, who, { objectId: "sys-1", contextId: "ctx-1", objectType: "ELECTRICAL_SYSTEM", citedLifecycleStage: "FEED", provenanceRef: "prov-sys", sourceBasisRef: "basis-sys" });
    const source = recordElectricalObjectIdentity(r1, who, { objectId: "src-1", contextId: "ctx-1", objectType: "ELECTRICAL_POWER_SOURCE", citedLifecycleStage: "FEED", provenanceRef: "prov-src", sourceBasisRef: "basis-src" });
    const bus = recordElectricalObjectIdentity(r1, who, { objectId: "bus-1", contextId: "ctx-1", objectType: "ELECTRICAL_DISTRIBUTION_EQUIPMENT", citedLifecycleStage: "FEED", provenanceRef: "prov-bus", sourceBasisRef: "basis-bus" });
    const gear = recordElectricalObjectIdentity(r1, who, { objectId: "gear-1", contextId: "ctx-1", objectType: "ELECTRICAL_DISTRIBUTION_EQUIPMENT", citedLifecycleStage: "FEED", provenanceRef: "prov-gear", sourceBasisRef: "basis-gear" });
    const transformer = recordElectricalObjectIdentity(r1, who, { objectId: "xfmr-1", contextId: "ctx-1", objectType: "ELECTRICAL_DISTRIBUTION_EQUIPMENT", citedLifecycleStage: "FEED", provenanceRef: "prov-xfmr", sourceBasisRef: "basis-xfmr" });
    const generator = recordElectricalObjectIdentity(r1, who, { objectId: "gen-1", contextId: "ctx-1", objectType: "ELECTRICAL_DISTRIBUTION_EQUIPMENT", citedLifecycleStage: "FEED", provenanceRef: "prov-gen", sourceBasisRef: "basis-gen" });
    const board = recordElectricalObjectIdentity(r1, who, { objectId: "board-1", contextId: "ctx-1", objectType: "ELECTRICAL_DISTRIBUTION_EQUIPMENT", citedLifecycleStage: "FEED", provenanceRef: "prov-board", sourceBasisRef: "basis-board" });
    const store = createD7R2Store(r1);
    const bound = (objectId: string, fingerprint: string) => ({
      contextId: "ctx-1",
      objectId,
      objectRevisionFingerprint: fingerprint,
      citedLifecycleStage: "FEED",
      citedCurrentness: "CURRENT",
      provenanceRef: `prov-${objectId}`,
      sourceBasisRef: `basis-${objectId}`,
      applicability: `Applies only to ${objectId}`,
      limitations: `Identity context only for ${objectId}`,
    });
    const systemContext = recordElectricalSystemContext(store, who, { ...bound(system.objectId, system.fingerprint), systemRecordId: "sys-rec", systemRole: "DISTRIBUTION_SYSTEM", nominalClassification: "MEDIUM_VOLTAGE_CLASS" });
    const sourceContext = recordElectricalSourceContext(store, who, { ...bound(source.objectId, source.fingerprint), sourceRecordId: "src-rec", sourceClass: "UTILITY_SUPPLY", sourceRole: "UTILITY_GRID" });
    const busContext = recordElectricalDistributionContext(store, who, { ...bound(bus.objectId, bus.fingerprint), distributionRecordId: "bus-rec", equipmentClass: "BUS", hierarchyRole: "BUS_NODE" });
    const gearContext = recordElectricalDistributionContext(store, who, { ...bound(gear.objectId, gear.fingerprint), distributionRecordId: "gear-rec", equipmentClass: "SWITCHGEAR", hierarchyRole: "DISTRIBUTION_NODE" });
    recordElectricalDistributionContext(store, who, { ...bound(transformer.objectId, transformer.fingerprint), distributionRecordId: "xfmr-rec", equipmentClass: "TRANSFORMER", hierarchyRole: "SUPPLY_NODE" });
    recordElectricalDistributionContext(store, who, { ...bound(generator.objectId, generator.fingerprint), distributionRecordId: "gen-rec", equipmentClass: "GENERATOR", hierarchyRole: "SUPPLY_NODE" });
    recordElectricalDistributionContext(store, who, { ...bound(board.objectId, board.fingerprint), distributionRecordId: "board-rec", equipmentClass: "SWITCHBOARD", hierarchyRole: "DISTRIBUTION_NODE" });
    expect(systemContext.validatedElectricalDesign).toBe(false);
    expect(systemContext.loadFlowModel).toBe(false);
    expect(sourceContext.capacityValidated).toBe(false);
    expect(busContext.busRatingValidated).toBe(false);
    expect(busContext.shortCircuitWithstandValidated).toBe(false);
    expect(gearContext.switchgearRatingValidated).toBe(false);
    const replay = recordElectricalSystemContext(store, who, { ...bound(system.objectId, system.fingerprint), systemRecordId: "sys-rec", systemRole: "DISTRIBUTION_SYSTEM", nominalClassification: "MEDIUM_VOLTAGE_CLASS", assertedFingerprint: systemContext.fingerprint });
    expect(replay).toBe(systemContext);
    expect(store.history.filter((row) => row.subjectId === "sys-rec" && row.action === "CREATED")).toHaveLength(1);
    const link = recordElectricalDistributionRelationship(store, who, {
      relationshipId: "rel-source",
      kind: "SOURCE_TO_SYSTEM",
      contextId: "ctx-1",
      fromObjectId: source.objectId,
      fromObjectRevisionFingerprint: source.fingerprint,
      toObjectId: system.objectId,
      toObjectRevisionFingerprint: system.fingerprint,
      fromContextRecordId: sourceContext.sourceRecordId,
      fromContextFingerprint: sourceContext.fingerprint,
      toContextRecordId: systemContext.systemRecordId,
      toContextFingerprint: systemContext.fingerprint,
      citedLifecycleStage: "FEED",
      citedCurrentness: "CURRENT",
      provenanceRef: "prov-rel-source",
      sourceBasisRef: "basis-rel-source",
      applicability: "Applies only to src-1 and sys-1",
      limitations: "Relationship is not a load-flow result",
    });
    const busLink = recordElectricalDistributionRelationship(store, who, {
      relationshipId: "rel-bus",
      kind: "SYSTEM_TO_BUS",
      contextId: "ctx-1",
      fromObjectId: system.objectId,
      fromObjectRevisionFingerprint: system.fingerprint,
      toObjectId: bus.objectId,
      toObjectRevisionFingerprint: bus.fingerprint,
      fromContextRecordId: systemContext.systemRecordId,
      fromContextFingerprint: systemContext.fingerprint,
      toContextRecordId: busContext.distributionRecordId,
      toContextFingerprint: busContext.fingerprint,
      citedLifecycleStage: "FEED",
      citedCurrentness: "CURRENT",
      provenanceRef: "prov-rel-bus",
      sourceBasisRef: "basis-rel-bus",
      applicability: "Applies only to sys-1 and bus-1",
      limitations: "Bus context is not a rating",
    });
    recordElectricalDistributionRelationship(store, who, {
      relationshipId: "rel-gear",
      kind: "BUS_TO_DISTRIBUTION",
      contextId: "ctx-1",
      fromObjectId: bus.objectId,
      fromObjectRevisionFingerprint: bus.fingerprint,
      toObjectId: gear.objectId,
      toObjectRevisionFingerprint: gear.fingerprint,
      fromContextRecordId: busContext.distributionRecordId,
      fromContextFingerprint: busContext.fingerprint,
      toContextRecordId: gearContext.distributionRecordId,
      toContextFingerprint: gearContext.fingerprint,
      citedLifecycleStage: "FEED",
      citedCurrentness: "CURRENT",
      provenanceRef: "prov-rel-gear",
      sourceBasisRef: "basis-rel-gear",
      applicability: "Applies only to bus-1 and gear-1",
      limitations: "Hierarchy is not energized-state truth",
    });
    expect(link.loadFlowResult).toBe(false);
    expect(link.energized).toBe(false);
    expect(link.inferred).toBe(false);
    const revisedSystem = recordElectricalObjectIdentity(r1, who, { objectId: "sys-1-r2", contextId: "ctx-1", objectType: "ELECTRICAL_SYSTEM", citedLifecycleStage: "FEED", provenanceRef: "prov-sys-r2", sourceBasisRef: "basis-sys-r2", predecessorObjectId: system.objectId });
    const historical = reconstructElectricalRelationship(store, link.relationshipId);
    expect(historical.toObjectId).toBe(system.objectId);
    expect(historical.toObjectRevisionFingerprint).toBe(system.fingerprint);
    expect(revisedSystem.objectId).not.toBe(historical.toObjectId);
    expect(busLink.toObjectRevisionFingerprint).toBe(bus.fingerprint);
    expect(() => recordElectricalDistributionRelationship(store, who, { relationshipId: "rel-inferred", kind: "tag_similarity", contextId: "ctx-1", fromObjectId: source.objectId, fromObjectRevisionFingerprint: source.fingerprint, toObjectId: system.objectId, toObjectRevisionFingerprint: system.fingerprint, fromContextRecordId: sourceContext.sourceRecordId, fromContextFingerprint: sourceContext.fingerprint, toContextRecordId: systemContext.systemRecordId, toContextFingerprint: systemContext.fingerprint, citedLifecycleStage: "FEED", citedCurrentness: "CURRENT", provenanceRef: "prov-bad", sourceBasisRef: "basis-bad", applicability: "Applies only to src-1 and sys-1", limitations: "no inference" })).toThrow(/INFERRED_RELATIONSHIP_REJECTED/);
    expect(() => recordElectricalSystemContext(store, who, { ...bound(system.objectId, "latest"), systemRecordId: "sys-float", systemRole: "DISTRIBUTION_SYSTEM", nominalClassification: "LOW_VOLTAGE_CLASS" })).toThrow(/R1_REVISION_REQUIRED/);
    expect(() => recordElectricalSourceContext(store, who, { ...bound(source.objectId, source.fingerprint), sourceRecordId: "src-bad", sourceClass: "TRANSFORMER", sourceRole: "UTILITY_GRID" })).toThrow(/SOURCE_CLASS_NOT_ALLOWLISTED/);
    expect(() => recordElectricalDistributionContext(store, who, { ...bound(bus.objectId, bus.fingerprint), distributionRecordId: "bus-size", equipmentClass: "BUS", hierarchyRole: "BUS_NODE", busRating: true })).toThrow(/SIZING_NOT_IN_R2/);
    expect(() => recordElectricalSystemContext(store, who, { ...bound(system.objectId, system.fingerprint), systemRecordId: "sys-load", systemRole: "DISTRIBUTION_SYSTEM", nominalClassification: "LOW_VOLTAGE_CLASS", connectedLoad: true })).toThrow(/LOAD_CONTEXT_NOT_IN_R2/);
    expect(() => recordElectricalDistributionContext(store, who, { ...bound(gear.objectId, gear.fingerprint), distributionRecordId: "gear-cable", equipmentClass: "SWITCHGEAR", hierarchyRole: "DISTRIBUTION_NODE", cableSize: true })).toThrow(/FEEDER_CABLE_NOT_IN_R2/);
    expect(() => recordElectricalDistributionContext(store, who, { ...bound(transformer.objectId, transformer.fingerprint), distributionRecordId: "xfmr-calc", equipmentClass: "TRANSFORMER", hierarchyRole: "SUPPLY_NODE", loadFlow: true })).toThrow(/CALCULATION_NOT_IN_R2/);
    expect(() => recordElectricalDistributionContext(store, who, { ...bound(generator.objectId, generator.fingerprint), distributionRecordId: "gen-prot", equipmentClass: "GENERATOR", hierarchyRole: "SUPPLY_NODE", protectionSetting: true })).toThrow(/PROTECTION_GROUNDING_NOT_IN_R2/);
    expect(() => recordElectricalSourceContext(store, who, { ...bound(source.objectId, source.fingerprint), sourceRecordId: "src-fp", sourceClass: "BATTERY", sourceRole: "EMERGENCY_SOURCE", assertedFingerprint: "spoof" })).toThrow(/FINGERPRINT_MISMATCH/);
    expect(store.sources.find((row) => row.sourceRecordId === "src-fp")).toBeUndefined();
    expect(() => recordElectricalSourceContext(store, actor({ tenantId: "tenant-b" }), { ...bound(source.objectId, source.fingerprint), sourceRecordId: "src-tenant", sourceClass: "UTILITY_SUPPLY", sourceRole: "UTILITY_GRID" })).toThrow(/CROSS_SCOPE_OPERATION/);
    expect(() => recordElectricalSystemContext(store, actor({ authority: "AI_ASSISTANT" }), { ...bound(system.objectId, system.fingerprint), systemRecordId: "sys-ai", systemRole: "DISTRIBUTION_SYSTEM", nominalClassification: "LOW_VOLTAGE_CLASS" })).toThrow(/AI_NOT_ELECTRICAL_AUTHORITY/);
    expect(() => recordElectricalDistributionRelationship(store, actor({ authority: "ADMIN" }), { relationshipId: "rel-admin", kind: "SOURCE_TO_SYSTEM", contextId: "ctx-1", fromObjectId: source.objectId, fromObjectRevisionFingerprint: source.fingerprint, toObjectId: system.objectId, toObjectRevisionFingerprint: system.fingerprint, fromContextRecordId: sourceContext.sourceRecordId, fromContextFingerprint: sourceContext.fingerprint, toContextRecordId: systemContext.systemRecordId, toContextFingerprint: systemContext.fingerprint, citedLifecycleStage: "FEED", citedCurrentness: "CURRENT", provenanceRef: "prov-admin", sourceBasisRef: "basis-admin", applicability: "Applies only to src-1 and sys-1", limitations: "admin cannot promote" })).toThrow(/ADMIN_NOT_ELECTRICAL_AUTHORITY/);
    expect(() => recordElectricalSourceContext(store, who, { ...bound(source.objectId, source.fingerprint), sourceRecordId: "src-basis", sourceClass: "UPS", sourceRole: "UPS_OR_DC_SOURCE", sourceBasisRef: " " })).toThrow(/MISSING_SOURCE_BASIS/);
    expect(() => recordElectricalSystemContext(store, who, { ...bound(system.objectId, system.fingerprint), systemRecordId: "sys-prop", systemRole: "UTILITY_POWER_SYSTEM", nominalClassification: "DC_CLASS", propagate: true })).toThrow(/AUTO_PROPAGATION_REJECTED/);
    expect(() => recordElectricalLoadContext()).toThrow(/LOAD_CONTEXT_NOT_IN_R2/);
    expect(() => recordElectricalFeederDesign()).toThrow(/FEEDER_CABLE_NOT_IN_R2/);
    expect(() => recordElectricalCalculationEvidence()).toThrow(/CALCULATION_NOT_IN_R2/);
    expect(() => recordElectricalProtectionContext()).toThrow(/PROTECTION_GROUNDING_NOT_IN_R2/);
    expect(() => repointElectricalDistributionRelationship()).toThrow(/AUTO_REPOINT_REJECTED/);
    expect(() => mutateElectricalDistributionContext()).toThrow(/SILENT_MUTATION_REJECTED/);
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D7.R2.ELECTRICAL_SYSTEM_SOURCE_AND_DISTRIBUTION_CONTEXT")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D7.R3.LOAD_CONSUMER_AND_EQUIPMENT_CONTEXT")?.implementationState).toBe("NOT_IMPLEMENTED");
    const sourceText = readFileSync(join(here, "system-source-distribution-context.ts"), "utf8");
    expect(sourceText).toMatch(/fingerprintCanonical/);
    expect(sourceText).not.toMatch(/createHash|from ["']@rtb\/engineering-review["']|CREATE TABLE|eval\(|child_process|new Function/);
    expect(scanAnalysisFormulaBypass(join(here, "system-source-distribution-context.ts"), sourceText)).toEqual([]);
    const packageJson = JSON.parse(readFileSync(join(here, "../../package.json"), "utf8")) as { dependencies: Record<string, string> };
    expect(Object.keys(packageJson.dependencies).sort()).toEqual(["@rtb/database", "@rtb/engineering-review", "@rtb/platform-commerce", "@rtb/platform-intelligence", "@rtb/platform-kernel", "@rtb/types", "docx", "exceljs", "pptxgenjs", "zod"]);
  });
});
