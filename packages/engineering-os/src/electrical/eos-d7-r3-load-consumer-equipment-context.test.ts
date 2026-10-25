import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { D7_LOAD_CONSUMER_EQUIPMENT_RUNTIME_COUNT as ARCHITECTURE_LOAD_COUNT, D7_RUNTIME_COUNT as ARCHITECTURE_RUNTIME_COUNT } from "@rtb/types";
import { describe, expect, it } from "vitest";
import { STRUCTURAL_CAPABILITY_MANIFEST } from "../structural-concrete/capability";
import { scanAnalysisFormulaBypass } from "../structural-systems/formula-scan";
import { D7_CONTEXT_AUTHORITY, D7_RUNTIME_COUNT as R1_RUNTIME_COUNT, createD7R1Store, recordElectricalContext, recordElectricalObjectIdentity, type D7R1Actor } from "./identity-foundation";
import {
  D7_LOAD_CONSUMER_EQUIPMENT_RUNTIME_COUNT as R2_LOAD_COUNT,
  D7_R3_STARTED,
  D7_RUNTIME_COUNT as R2_RUNTIME_COUNT,
  createD7R2Store,
  recordElectricalDistributionContext,
  recordElectricalSourceContext,
  recordElectricalSystemContext,
} from "./system-source-distribution-context";
import {
  D6_POWER_LOAD_REQUIREMENT_EQUALS_ADOPTED_D7_ELECTRICAL_LOAD,
  D7_ADOPTED_ELECTRICAL_LOAD_SUPPORTED,
  D7_ELECTRICAL_CALCULATION_RUNTIME_COUNT,
  D7_FEEDER_CABLE_RATING_RUNTIME_COUNT,
  D7_IDENTITY_RUNTIME_COUNT,
  D7_LOAD_CONSUMER_EQUIPMENT_RUNTIME_COUNT,
  D7_LOAD_CONSUMER_EQUIPMENT_RUNTIME_READY,
  D7_PROTECTION_GROUNDING_HAZARDOUS_AREA_RUNTIME_COUNT,
  D7_R1_IDENTITY_REUSED,
  D7_R2_SYSTEM_SOURCE_DISTRIBUTION_CONTEXT_REUSED,
  D7_R3_AUTO_ADOPTS_D6_PROCESS_LOAD_REQUIREMENT,
  D7_R3_AUTO_ADOPTS_MECHANICAL_DUTY_AS_ELECTRICAL_LOAD,
  D7_R3_AUTO_PROPAGATES_LOAD_ACROSS_CASES,
  D7_R3_CALCULATES_CONNECTED_LOAD,
  D7_R3_NEXT_PHASE,
  D7_R3_NEXT_PHASE_TYPE,
  D7_R4_STARTED,
  D7_RUNTIME_COUNT,
  D7_SUPPLIED_LOAD_REQUIREMENT_SUPPORTED,
  D8_RUNTIME_STARTED,
  D9_RUNTIME_COUNT,
  D9_RUNTIME_STARTED,
  MECHANICAL_EQUIPMENT_DUTY_EQUALS_ADOPTED_ELECTRICAL_LOAD,
  SOURCE_LOAD_REQUIREMENT_EQUALS_ADOPTED_ELECTRICAL_LOAD,
  SUPPLIED_LOAD_AUTO_ADOPTED,
  createD7R3Store,
  recordElectricalConsumerContext,
  recordElectricalConsumerRelationship,
  recordElectricalEquipmentSupplyContext,
  recordElectricalFeederDesign,
  recordElectricalLoadContext,
  recordElectricalProtectionContext,
  reconstructElectricalLoad,
  repointElectricalLoadContext,
} from "./load-consumer-equipment-context";

const here = dirname(fileURLToPath(import.meta.url));

function actor(overrides: Partial<D7R1Actor> = {}): D7R1Actor {
  return { actorId: "elec-recorder", tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a", authority: D7_CONTEXT_AUTHORITY, ...overrides };
}

describe("EOS-D7-R3 electrical load consumer and equipment context", () => {
  it("records supplied and adopted load context without calculating or adopting it", () => {
    expect(D7_R1_IDENTITY_REUSED && D7_R2_SYSTEM_SOURCE_DISTRIBUTION_CONTEXT_REUSED).toBe(true);
    expect(R1_RUNTIME_COUNT).toBe(1);
    expect(R2_RUNTIME_COUNT).toBe(2);
    expect(R2_LOAD_COUNT).toBe(0);
    expect(ARCHITECTURE_RUNTIME_COUNT).toBe(0);
    expect(ARCHITECTURE_LOAD_COUNT).toBe(0);
    expect(D7_RUNTIME_COUNT).toBe(3);
    expect(D7_LOAD_CONSUMER_EQUIPMENT_RUNTIME_COUNT).toBe(1);
    expect(D7_LOAD_CONSUMER_EQUIPMENT_RUNTIME_READY).toBe(true);
    expect(D7_IDENTITY_RUNTIME_COUNT).toBe(1);
    expect(D7_R3_STARTED).toBe(false);
    expect(D7_R4_STARTED).toBe(false);
    expect(D7_SUPPLIED_LOAD_REQUIREMENT_SUPPORTED && D7_ADOPTED_ELECTRICAL_LOAD_SUPPORTED).toBe(true);
    expect(SOURCE_LOAD_REQUIREMENT_EQUALS_ADOPTED_ELECTRICAL_LOAD || SUPPLIED_LOAD_AUTO_ADOPTED || D6_POWER_LOAD_REQUIREMENT_EQUALS_ADOPTED_D7_ELECTRICAL_LOAD || MECHANICAL_EQUIPMENT_DUTY_EQUALS_ADOPTED_ELECTRICAL_LOAD || D7_R3_AUTO_ADOPTS_D6_PROCESS_LOAD_REQUIREMENT || D7_R3_AUTO_ADOPTS_MECHANICAL_DUTY_AS_ELECTRICAL_LOAD || D7_R3_CALCULATES_CONNECTED_LOAD || D7_R3_AUTO_PROPAGATES_LOAD_ACROSS_CASES).toBe(false);
    expect([D7_FEEDER_CABLE_RATING_RUNTIME_COUNT, D7_PROTECTION_GROUNDING_HAZARDOUS_AREA_RUNTIME_COUNT, D7_ELECTRICAL_CALCULATION_RUNTIME_COUNT, D9_RUNTIME_COUNT]).toEqual([0, 0, 0, 0]);
    expect(D8_RUNTIME_STARTED || D9_RUNTIME_STARTED).toBe(false);
    expect(D7_R3_NEXT_PHASE).toBe("EOS-D7-R4-FEEDER-CABLE-AND-RATING-CONTEXT");
    expect(D7_R3_NEXT_PHASE_TYPE).toBe("FEEDER_CABLE_AND_RATING_CONTEXT");

    const r1 = createD7R1Store();
    const who = actor();
    recordElectricalContext(r1, who, { contextId: "ctx-1", citedLifecycleStage: "FEED", provenanceRef: "prov-ctx", sourceBasisRef: "basis-ctx" });
    const system = recordElectricalObjectIdentity(r1, who, { objectId: "sys-1", contextId: "ctx-1", objectType: "ELECTRICAL_SYSTEM", citedLifecycleStage: "FEED", provenanceRef: "prov-sys", sourceBasisRef: "basis-sys" });
    const source = recordElectricalObjectIdentity(r1, who, { objectId: "src-1", contextId: "ctx-1", objectType: "ELECTRICAL_POWER_SOURCE", citedLifecycleStage: "FEED", provenanceRef: "prov-src", sourceBasisRef: "basis-src" });
    const bus = recordElectricalObjectIdentity(r1, who, { objectId: "bus-1", contextId: "ctx-1", objectType: "ELECTRICAL_DISTRIBUTION_EQUIPMENT", citedLifecycleStage: "FEED", provenanceRef: "prov-bus", sourceBasisRef: "basis-bus" });
    const load = recordElectricalObjectIdentity(r1, who, { objectId: "load-1", contextId: "ctx-1", objectType: "ELECTRICAL_LOAD", citedLifecycleStage: "FEED", provenanceRef: "prov-load", sourceBasisRef: "basis-load" });
    const consumer = recordElectricalObjectIdentity(r1, who, { objectId: "consumer-1", contextId: "ctx-1", objectType: "ELECTRICAL_CONSUMER", citedLifecycleStage: "FEED", provenanceRef: "prov-consumer", sourceBasisRef: "basis-consumer" });
    const motor = recordElectricalObjectIdentity(r1, who, { objectId: "motor-1", contextId: "ctx-1", objectType: "ELECTRICAL_MOTOR_DRIVE", citedLifecycleStage: "FEED", provenanceRef: "prov-motor", sourceBasisRef: "basis-motor" });
    const r2 = createD7R2Store(r1);
    const bound = (objectId: string, fingerprint: string) => ({ contextId: "ctx-1", objectId, objectRevisionFingerprint: fingerprint, citedLifecycleStage: "FEED", citedCurrentness: "CURRENT", provenanceRef: `prov-${objectId}`, sourceBasisRef: `basis-${objectId}`, applicability: `Applies only to ${objectId}`, limitations: `Context only for ${objectId}` });
    const systemContext = recordElectricalSystemContext(r2, who, { ...bound(system.objectId, system.fingerprint), systemRecordId: "sys-rec", systemRole: "DISTRIBUTION_SYSTEM", nominalClassification: "MEDIUM_VOLTAGE_CLASS" });
    const sourceContext = recordElectricalSourceContext(r2, who, { ...bound(source.objectId, source.fingerprint), sourceRecordId: "src-rec", sourceClass: "UTILITY_SUPPLY", sourceRole: "UTILITY_GRID" });
    const busContext = recordElectricalDistributionContext(r2, who, { ...bound(bus.objectId, bus.fingerprint), distributionRecordId: "bus-rec", equipmentClass: "BUS", hierarchyRole: "BUS_NODE" });
    const systemFingerprint = systemContext.fingerprint;
    const store = createD7R3Store(r1, r2, {
      process: { requirements: [{ recordId: "pr-1", requirementId: "pr-1", fingerprint: "fp-process", tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a", recordStatus: "CURRENT" }] },
      mechanical: { records: [{ recordId: "mech-1", fingerprint: "fp-mech", tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a", recordStatus: "CURRENT" }] },
    });
    const loadBound = { ...bound(load.objectId, load.fingerprint), caseName: "NORMAL_CASE", duty: "CONTINUOUS", availability: "REQUIRED", applicability: "Applies only to load-1 in NORMAL_CASE", limitations: "Supplied value is not a calculation" };
    const supplied = recordElectricalLoadContext(store, who, { ...loadBound, loadRecordId: "load-supplied", statementRole: "SUPPLIED_LOAD_REQUIREMENT", suppliedValue: "250", unit: "kW" });
    const adopted = recordElectricalLoadContext(store, who, { ...loadBound, loadRecordId: "load-adopted", statementRole: "ADOPTED_ELECTRICAL_LOAD", suppliedValue: "250", unit: "kW", adoptedFromLoadRecordId: supplied.loadRecordId, adoptionRationale: "Electrical adoption of the supplied requirement" });
    expect(supplied.adopted).toBe(false);
    expect(supplied.statementRole).toBe("SUPPLIED_LOAD_REQUIREMENT");
    expect(adopted.adopted).toBe(true);
    expect(adopted.adoptedFromLoadRecordId).toBe(supplied.loadRecordId);
    expect(adopted.validatedLoadCalculation).toBe(false);
    expect(adopted.unit).toBe("kW");
    expect(reconstructElectricalLoad(store, supplied.loadRecordId)).toBe(supplied);
    expect(store.loads.filter((row) => row.caseName === "EMERGENCY_CASE")).toHaveLength(0);
    const replay = recordElectricalLoadContext(store, who, { ...loadBound, loadRecordId: "load-supplied", statementRole: "SUPPLIED_LOAD_REQUIREMENT", suppliedValue: "250", unit: "kW", assertedFingerprint: supplied.fingerprint });
    expect(replay).toBe(supplied);
    const consumerContext = recordElectricalConsumerContext(store, who, { ...bound(consumer.objectId, consumer.fingerprint), consumerRecordId: "consumer-rec", consumerClass: "MOTOR_CONSUMER", caseName: "NORMAL_CASE", duty: "CONTINUOUS", availability: "REQUIRED", applicability: "Applies only to consumer-1 in NORMAL_CASE", limitations: "Consumer context is not equipment selection", loadRecordId: supplied.loadRecordId, loadRevisionFingerprint: supplied.fingerprint });
    const relation = recordElectricalConsumerRelationship(store, who, { relationshipId: "rel-consumer", kind: "CONSUMER_TO_SYSTEM", contextId: "ctx-1", consumerObjectId: consumer.objectId, consumerObjectRevisionFingerprint: consumer.fingerprint, consumerRecordId: consumerContext.consumerRecordId, consumerRevisionFingerprint: consumerContext.fingerprint, targetRecordId: systemContext.systemRecordId, targetRevisionFingerprint: systemContext.fingerprint, citedLifecycleStage: "FEED", citedCurrentness: "CURRENT", provenanceRef: "prov-rel", sourceBasisRef: "basis-rel", applicability: "Applies only to consumer-1", limitations: "Explicit system link only" });
    expect(relation.inferred).toBe(false);
    expect(relation.targetRevisionFingerprint).toBe(systemFingerprint);
    const supply = recordElectricalEquipmentSupplyContext(store, who, { ...bound(motor.objectId, motor.fingerprint), supplyRecordId: "supply-1", caseName: "NORMAL_CASE", duty: "CONTINUOUS", availability: "REQUIRED", applicability: "Applies only to motor-1 in NORMAL_CASE", limitations: "Supply context is not feeder design", systemRecordId: systemContext.systemRecordId, systemRevisionFingerprint: systemContext.fingerprint, sourceRecordId: sourceContext.sourceRecordId, sourceRevisionFingerprint: sourceContext.fingerprint, distributionRecordId: busContext.distributionRecordId, distributionRevisionFingerprint: busContext.fingerprint, voltageContext: "MEDIUM_VOLTAGE_SUPPLY_CONTEXT", phaseContext: "THREE_PHASE", loadRecordId: supplied.loadRecordId, loadRevisionFingerprint: supplied.fingerprint, processRequirementId: "pr-1", processRequirementFingerprint: "fp-process", mechanicalRecordId: "mech-1", mechanicalRevisionFingerprint: "fp-mech" });
    expect(supply.processRequirementAdopted).toBe(false);
    expect(supply.mechanicalDutyAdopted).toBe(false);
    expect(supply.validatedFeederDesign).toBe(false);
    expect(supply.validatedCableDesign).toBe(false);
    expect(systemContext.fingerprint).toBe(systemFingerprint);
    expect(sourceContext.capacityValidated).toBe(false);
    expect(() => recordElectricalLoadContext(store, who, { ...loadBound, loadRecordId: "load-sum", statementRole: "SUPPLIED_LOAD_REQUIREMENT", suppliedValue: "250+10", unit: "kW" })).toThrow(/HIDDEN_LOAD_CALCULATION/);
    expect(() => recordElectricalLoadContext(store, who, { ...loadBound, loadRecordId: "load-unit", statementRole: "SUPPLIED_LOAD_REQUIREMENT", suppliedValue: "250", unit: "hp" })).toThrow(/UNIT_NOT_PRESERVED/);
    expect(() => recordElectricalLoadContext(store, who, { ...loadBound, loadRecordId: "load-auto", statementRole: "SUPPLIED_LOAD_REQUIREMENT", suppliedValue: "10", unit: "kW", autoAdopt: true })).toThrow(/AUTO_ADOPTION_REJECTED/);
    expect(() => recordElectricalLoadContext(store, who, { ...loadBound, loadRecordId: "load-case", statementRole: "SUPPLIED_LOAD_REQUIREMENT", suppliedValue: "10", unit: "kW", propagateAcrossCases: true })).toThrow(/AUTO_PROPAGATION_REJECTED/);
    expect(() => recordElectricalLoadContext(store, who, { ...loadBound, loadRecordId: "load-flow", statementRole: "SUPPLIED_LOAD_REQUIREMENT", suppliedValue: "10", unit: "kW", loadFlow: true })).toThrow(/LOAD_FLOW_NOT_IN_R3/);
    expect(() => recordElectricalLoadContext(store, who, { ...loadBound, loadRecordId: "load-calc", statementRole: "SUPPLIED_LOAD_REQUIREMENT", suppliedValue: "10", unit: "kW", connectedLoadCalculation: true })).toThrow(/LOAD_CALCULATION_NOT_IN_R3/);
    expect(() => recordElectricalLoadContext(store, who, { ...loadBound, loadRecordId: "load-size", statementRole: "SUPPLIED_LOAD_REQUIREMENT", suppliedValue: "10", unit: "kW", sizeMotor: true })).toThrow(/SIZING_NOT_IN_R3/);
    expect(() => recordElectricalConsumerRelationship(store, who, { relationshipId: "rel-inferred", kind: "tag_similarity", contextId: "ctx-1", consumerObjectId: consumer.objectId, consumerObjectRevisionFingerprint: consumer.fingerprint, consumerRecordId: consumerContext.consumerRecordId, consumerRevisionFingerprint: consumerContext.fingerprint, targetRecordId: systemContext.systemRecordId, targetRevisionFingerprint: systemContext.fingerprint, citedLifecycleStage: "FEED", citedCurrentness: "CURRENT", provenanceRef: "prov-bad", sourceBasisRef: "basis-bad", applicability: "Applies only to consumer-1", limitations: "no inference" })).toThrow(/INFERRED_RELATIONSHIP_REJECTED/);
    expect(() => recordElectricalLoadContext(store, who, { ...loadBound, objectRevisionFingerprint: "latest", loadRecordId: "load-float", statementRole: "SUPPLIED_LOAD_REQUIREMENT", suppliedValue: "10", unit: "kW" })).toThrow(/R1_REVISION_REQUIRED/);
    expect(() => recordElectricalEquipmentSupplyContext(store, who, { ...bound(motor.objectId, motor.fingerprint), supplyRecordId: "supply-bad-process", caseName: "STARTUP_CASE", duty: "STANDBY", availability: "NONESSENTIAL", applicability: "Applies only to motor-1 in STARTUP_CASE", limitations: "Wrong process revision", systemRecordId: systemContext.systemRecordId, systemRevisionFingerprint: systemContext.fingerprint, voltageContext: "VOLTAGE_CONTEXT_UNSTATED", phaseContext: "PHASE_CONTEXT_UNSTATED", processRequirementId: "pr-1", processRequirementFingerprint: "spoof" })).toThrow(/PROCESS_REQUIREMENT_NOT_FOUND/);
    expect(() => recordElectricalEquipmentSupplyContext(store, who, { ...bound(motor.objectId, motor.fingerprint), supplyRecordId: "supply-bad-mech", caseName: "SHUTDOWN_CASE", duty: "INTERMITTENT", availability: "UNSPECIFIED_AVAILABILITY", applicability: "Applies only to motor-1 in SHUTDOWN_CASE", limitations: "Wrong mechanical revision", systemRecordId: systemContext.systemRecordId, systemRevisionFingerprint: systemContext.fingerprint, voltageContext: "LOW_VOLTAGE_SUPPLY_CONTEXT", phaseContext: "SINGLE_PHASE", mechanicalRecordId: "mech-1", mechanicalRevisionFingerprint: "spoof" })).toThrow(/MECHANICAL_CONTEXT_NOT_FOUND/);
    expect(() => recordElectricalLoadContext(store, actor({ tenantId: "tenant-b" }), { ...loadBound, loadRecordId: "load-tenant", statementRole: "SUPPLIED_LOAD_REQUIREMENT", suppliedValue: "10", unit: "kW" })).toThrow(/CROSS_SCOPE_OPERATION/);
    expect(() => recordElectricalLoadContext(store, actor({ authority: "AI_ASSISTANT" }), { ...loadBound, loadRecordId: "load-ai", statementRole: "SUPPLIED_LOAD_REQUIREMENT", suppliedValue: "10", unit: "kW" })).toThrow(/AI_NOT_ELECTRICAL_AUTHORITY/);
    expect(() => recordElectricalConsumerRelationship(store, actor({ authority: "ADMIN" }), { relationshipId: "rel-admin", kind: "CONSUMER_TO_SYSTEM", contextId: "ctx-1", consumerObjectId: consumer.objectId, consumerObjectRevisionFingerprint: consumer.fingerprint, consumerRecordId: consumerContext.consumerRecordId, consumerRevisionFingerprint: consumerContext.fingerprint, targetRecordId: systemContext.systemRecordId, targetRevisionFingerprint: systemContext.fingerprint, citedLifecycleStage: "FEED", citedCurrentness: "CURRENT", provenanceRef: "prov-admin", sourceBasisRef: "basis-admin", applicability: "Applies only to consumer-1", limitations: "admin cannot promote" })).toThrow(/ADMIN_NOT_ELECTRICAL_AUTHORITY/);
    expect(() => recordElectricalLoadContext(store, who, { ...loadBound, loadRecordId: "load-conflict", statementRole: "ADOPTED_ELECTRICAL_LOAD", suppliedValue: "300", unit: "kW", adoptedFromLoadRecordId: supplied.loadRecordId, adoptionRationale: "Second adoption conflicts" })).toThrow(/DUPLICATE_LOAD_REJECTED/);
    expect(() => recordElectricalFeederDesign()).toThrow(/FEEDER_CABLE_NOT_IN_R3/);
    expect(() => recordElectricalProtectionContext()).toThrow(/PROTECTION_GROUNDING_NOT_IN_R3/);
    expect(() => repointElectricalLoadContext()).toThrow(/AUTO_REPOINT_REJECTED/);
    expect(systemContext.fingerprint).toBe(systemFingerprint);
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D7.R3.LOAD_CONSUMER_AND_EQUIPMENT_CONTEXT")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D7.R4.FEEDER_CABLE_AND_RATING_CONTEXT")?.implementationState).toBe("NOT_IMPLEMENTED");
    const sourceText = readFileSync(join(here, "load-consumer-equipment-context.ts"), "utf8");
    expect(sourceText).toMatch(/fingerprintCanonical/);
    expect(sourceText).not.toMatch(/createHash|from ["']@rtb\/engineering-review["']|CREATE TABLE|eval\(|child_process|new Function/);
    expect(scanAnalysisFormulaBypass(join(here, "load-consumer-equipment-context.ts"), sourceText)).toEqual([]);
    const packageJson = JSON.parse(readFileSync(join(here, "../../package.json"), "utf8")) as { dependencies: Record<string, string> };
    expect(Object.keys(packageJson.dependencies).sort()).toEqual(["@rtb/database", "@rtb/engineering-review", "@rtb/platform-commerce", "@rtb/platform-intelligence", "@rtb/platform-kernel", "@rtb/types", "docx", "exceljs", "pptxgenjs", "zod"]);
  });
});
