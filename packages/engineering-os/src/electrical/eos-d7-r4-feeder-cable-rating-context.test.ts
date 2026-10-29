import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { D7_FEEDER_CABLE_RATING_RUNTIME_COUNT as ARCHITECTURE_FEEDER_COUNT, D7_RUNTIME_COUNT as ARCHITECTURE_RUNTIME_COUNT } from "@rtb/types";
import { describe, expect, it } from "vitest";
import { STRUCTURAL_CAPABILITY_MANIFEST } from "../structural-concrete/capability";
import { scanAnalysisFormulaBypass } from "../structural-systems/formula-scan";
import { D7_CONTEXT_AUTHORITY, D7_RUNTIME_COUNT as R1_RUNTIME_COUNT, createD7R1Store, recordElectricalContext, recordElectricalObjectIdentity, type D7R1Actor } from "./identity-foundation";
import { D7_RUNTIME_COUNT as R2_RUNTIME_COUNT, createD7R2Store, recordElectricalDistributionContext, recordElectricalSourceContext, recordElectricalSystemContext } from "./system-source-distribution-context";
import {
  D7_FEEDER_CABLE_RATING_RUNTIME_COUNT as R3_FEEDER_COUNT,
  D7_R4_STARTED,
  D7_RUNTIME_COUNT as R3_RUNTIME_COUNT,
  createD7R3Store,
  recordElectricalConsumerContext,
  recordElectricalEquipmentSupplyContext,
  recordElectricalLoadContext,
} from "./load-consumer-equipment-context";
import {
  ADOPTED_ELECTRICAL_RATING_EQUALS_VALIDATED_RATING,
  CABLE_CONTEXT_EQUALS_VALIDATED_CABLE_SIZING,
  D7_ELECTRICAL_CALCULATION_EVIDENCE_RUNTIME_COUNT,
  D7_ELECTRICAL_CALCULATION_RUNTIME_COUNT,
  D7_FEEDER_CABLE_RATING_RUNTIME_COUNT,
  D7_FEEDER_CABLE_RATING_RUNTIME_READY,
  D7_PROTECTION_GROUNDING_HAZARDOUS_AREA_RUNTIME_COUNT,
  D7_R3_LOAD_CONSUMER_EQUIPMENT_CONTEXT_REUSED,
  D7_R4_AUTO_SELECTS_CABLE,
  D7_R4_CALCULATES_AMPACITY,
  D7_R4_CALCULATES_CABLE_SIZE,
  D7_R4_CALCULATES_DERATING,
  D7_R4_CALCULATES_VOLTAGE_DROP,
  D7_R4_NEXT_PHASE,
  D7_R4_NEXT_PHASE_TYPE,
  D7_R5_STARTED,
  D7_RUNTIME_COUNT,
  D8_RUNTIME_STARTED,
  D9_RUNTIME_COUNT,
  D9_RUNTIME_STARTED,
  FEEDER_CONTEXT_EQUALS_VALIDATED_FEEDER_DESIGN,
  INSTALLATION_CONTEXT_AUTO_DERIVES_DERATING_FACTOR,
  SUPPLIED_ELECTRICAL_RATING_AUTO_ADOPTED,
  SUPPLIED_ELECTRICAL_RATING_EQUALS_ADOPTED_ELECTRICAL_RATING,
  calculateElectricalCableSize,
  createD7R4Store,
  deriveInstallationDerating,
  recordElectricalCableContext,
  recordElectricalCalculationEvidence,
  recordElectricalFeederCableRelationship,
  recordElectricalFeederContext,
  recordElectricalFeederEndpoint,
  recordElectricalProtectionContext,
  recordElectricalRatingContext,
  reconstructElectricalFeeder,
  repointElectricalFeederContext,
} from "./feeder-cable-rating-context";

const here = dirname(fileURLToPath(import.meta.url));

function actor(overrides: Partial<D7R1Actor> = {}): D7R1Actor {
  return { actorId: "elec-recorder", tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a", authority: D7_CONTEXT_AUTHORITY, ...overrides };
}

describe("EOS-D7-R4 electrical feeder cable and rating context", () => {
  it("records supplied feeder cable and rating context without sizing or validating it", () => {
    expect(D7_R3_LOAD_CONSUMER_EQUIPMENT_CONTEXT_REUSED).toBe(true);
    expect(R1_RUNTIME_COUNT).toBe(1);
    expect(R2_RUNTIME_COUNT).toBe(2);
    expect(R3_RUNTIME_COUNT).toBe(3);
    expect(R3_FEEDER_COUNT).toBe(0);
    expect(ARCHITECTURE_RUNTIME_COUNT).toBe(0);
    expect(ARCHITECTURE_FEEDER_COUNT).toBe(0);
    expect(D7_RUNTIME_COUNT).toBe(4);
    expect(D7_FEEDER_CABLE_RATING_RUNTIME_COUNT).toBe(1);
    expect(D7_FEEDER_CABLE_RATING_RUNTIME_READY).toBe(true);
    expect(D7_R4_STARTED).toBe(false);
    expect(D7_R5_STARTED).toBe(false);
    expect(FEEDER_CONTEXT_EQUALS_VALIDATED_FEEDER_DESIGN || CABLE_CONTEXT_EQUALS_VALIDATED_CABLE_SIZING || SUPPLIED_ELECTRICAL_RATING_EQUALS_ADOPTED_ELECTRICAL_RATING || SUPPLIED_ELECTRICAL_RATING_AUTO_ADOPTED || ADOPTED_ELECTRICAL_RATING_EQUALS_VALIDATED_RATING || INSTALLATION_CONTEXT_AUTO_DERIVES_DERATING_FACTOR || D7_R4_CALCULATES_CABLE_SIZE || D7_R4_CALCULATES_AMPACITY || D7_R4_CALCULATES_DERATING || D7_R4_CALCULATES_VOLTAGE_DROP || D7_R4_AUTO_SELECTS_CABLE).toBe(false);
    expect([D7_ELECTRICAL_CALCULATION_EVIDENCE_RUNTIME_COUNT, D7_PROTECTION_GROUNDING_HAZARDOUS_AREA_RUNTIME_COUNT, D7_ELECTRICAL_CALCULATION_RUNTIME_COUNT, D9_RUNTIME_COUNT]).toEqual([0, 0, 0, 0]);
    expect(D8_RUNTIME_STARTED || D9_RUNTIME_STARTED).toBe(false);
    expect(D7_R4_NEXT_PHASE).toBe("EOS-D7-R5-ELECTRICAL-CALCULATION-EVIDENCE");
    expect(D7_R4_NEXT_PHASE_TYPE).toBe("ELECTRICAL_CALCULATION_EVIDENCE");

    const r1 = createD7R1Store();
    const who = actor();
    recordElectricalContext(r1, who, { contextId: "ctx-1", citedLifecycleStage: "FEED", provenanceRef: "prov-ctx", sourceBasisRef: "basis-ctx" });
    const identity = (objectId: string, objectType: "ELECTRICAL_SYSTEM" | "ELECTRICAL_POWER_SOURCE" | "ELECTRICAL_DISTRIBUTION_EQUIPMENT" | "ELECTRICAL_LOAD" | "ELECTRICAL_CONSUMER" | "ELECTRICAL_MOTOR_DRIVE" | "ELECTRICAL_FEEDER" | "ELECTRICAL_CABLE" | "ELECTRICAL_EQUIPMENT_RATING") =>
      recordElectricalObjectIdentity(r1, who, { objectId, contextId: "ctx-1", objectType, citedLifecycleStage: "FEED", provenanceRef: `prov-${objectId}`, sourceBasisRef: `basis-${objectId}` });
    const system = identity("sys-1", "ELECTRICAL_SYSTEM");
    const source = identity("src-1", "ELECTRICAL_POWER_SOURCE");
    const bus = identity("bus-1", "ELECTRICAL_DISTRIBUTION_EQUIPMENT");
    const load = identity("load-1", "ELECTRICAL_LOAD");
    const consumer = identity("consumer-1", "ELECTRICAL_CONSUMER");
    const motor = identity("motor-1", "ELECTRICAL_MOTOR_DRIVE");
    const feeder = identity("feeder-1", "ELECTRICAL_FEEDER");
    const cable = identity("cable-1", "ELECTRICAL_CABLE");
    const rating = identity("rating-1", "ELECTRICAL_EQUIPMENT_RATING");
    const r2 = createD7R2Store(r1);
    const bound = (objectId: string, fingerprint: string) => ({ contextId: "ctx-1", objectId, objectRevisionFingerprint: fingerprint, citedLifecycleStage: "FEED", citedCurrentness: "CURRENT", provenanceRef: `prov-${objectId}`, sourceBasisRef: `basis-${objectId}`, applicability: `Applies only to ${objectId}`, limitations: `Context only for ${objectId}` });
    const systemContext = recordElectricalSystemContext(r2, who, { ...bound(system.objectId, system.fingerprint), systemRecordId: "sys-rec", systemRole: "DISTRIBUTION_SYSTEM", nominalClassification: "MEDIUM_VOLTAGE_CLASS" });
    const sourceContext = recordElectricalSourceContext(r2, who, { ...bound(source.objectId, source.fingerprint), sourceRecordId: "src-rec", sourceClass: "UTILITY_SUPPLY", sourceRole: "UTILITY_GRID" });
    const busContext = recordElectricalDistributionContext(r2, who, { ...bound(bus.objectId, bus.fingerprint), distributionRecordId: "bus-rec", equipmentClass: "BUS", hierarchyRole: "BUS_NODE" });
    const r3 = createD7R3Store(r1, r2);
    const loadBound = { ...bound(load.objectId, load.fingerprint), caseName: "NORMAL_CASE", duty: "CONTINUOUS", availability: "REQUIRED", applicability: "Applies only to load-1 in NORMAL_CASE", limitations: "Supplied value is not a calculation" };
    const suppliedLoad = recordElectricalLoadContext(r3, who, { ...loadBound, loadRecordId: "load-supplied", statementRole: "SUPPLIED_LOAD_REQUIREMENT", suppliedValue: "250", unit: "kW" });
    const consumerContext = recordElectricalConsumerContext(r3, who, { ...bound(consumer.objectId, consumer.fingerprint), consumerRecordId: "consumer-rec", consumerClass: "MOTOR_CONSUMER", caseName: "NORMAL_CASE", duty: "CONTINUOUS", availability: "REQUIRED", applicability: "Applies only to consumer-1 in NORMAL_CASE", limitations: "Consumer context is not equipment selection" });
    const supply = recordElectricalEquipmentSupplyContext(r3, who, { ...bound(motor.objectId, motor.fingerprint), supplyRecordId: "supply-1", caseName: "NORMAL_CASE", duty: "CONTINUOUS", availability: "REQUIRED", applicability: "Applies only to motor-1 in NORMAL_CASE", limitations: "Supply context is not feeder design", systemRecordId: systemContext.systemRecordId, systemRevisionFingerprint: systemContext.fingerprint, voltageContext: "MEDIUM_VOLTAGE_SUPPLY_CONTEXT", phaseContext: "THREE_PHASE" });
    const loadFingerprint = suppliedLoad.fingerprint;
    const systemFingerprint = systemContext.fingerprint;
    const store = createD7R4Store(r1, r2, r3);
    const ratingBound = { ...bound(rating.objectId, rating.fingerprint), applicability: "Applies only to rating-1", limitations: "Rating context is not a calculation" };
    const suppliedRating = recordElectricalRatingContext(store, who, { ...ratingBound, ratingRecordId: "rating-supplied", statementRole: "SUPPLIED_ELECTRICAL_RATING", ratingCategory: "CURRENT_RATING", suppliedValue: "400", unit: "A" });
    const adoptedRating = recordElectricalRatingContext(store, who, { ...ratingBound, ratingRecordId: "rating-adopted", statementRole: "ADOPTED_ELECTRICAL_RATING", ratingCategory: "CURRENT_RATING", suppliedValue: "400", unit: "A", adoptedFromRatingRecordId: suppliedRating.ratingRecordId, adoptionRationale: "Electrical adoption of the supplied rating" });
    expect(suppliedRating.adopted).toBe(false);
    expect(adoptedRating.adopted).toBe(true);
    expect(adoptedRating.validatedRating).toBe(false);
    expect(adoptedRating.validatedEquipmentSelection).toBe(false);
    expect(adoptedRating.unit).toBe("A");
    const feederContext = recordElectricalFeederContext(store, who, { ...bound(feeder.objectId, feeder.fingerprint), feederRecordId: "feeder-rec", feederRole: "SOURCE_FEEDER", ratingRecordId: suppliedRating.ratingRecordId, ratingRevisionFingerprint: suppliedRating.fingerprint });
    expect(feederContext.validatedFeederDesign).toBe(false);
    expect(feederContext.validatedCableSelection).toBe(false);
    expect(feederContext.protectionCoordination).toBe(false);
    expect(reconstructElectricalFeeder(store, feederContext.feederRecordId)).toBe(feederContext);
    const sourceEndpoint = recordElectricalFeederEndpoint(store, who, { endpointId: "end-source", kind: "SOURCE_ENDPOINT", contextId: "ctx-1", feederObjectId: feeder.objectId, feederObjectRevisionFingerprint: feeder.fingerprint, feederRecordId: feederContext.feederRecordId, feederRevisionFingerprint: feederContext.fingerprint, targetRecordId: sourceContext.sourceRecordId, targetRevisionFingerprint: sourceContext.fingerprint, citedLifecycleStage: "FEED", citedCurrentness: "CURRENT", provenanceRef: "prov-end", sourceBasisRef: "basis-end", applicability: "Applies only to feeder-1", limitations: "Explicit source endpoint only" });
    const loadEndpoint = recordElectricalFeederEndpoint(store, who, { endpointId: "end-load", kind: "LOAD_ENDPOINT", contextId: "ctx-1", feederObjectId: feeder.objectId, feederObjectRevisionFingerprint: feeder.fingerprint, feederRecordId: feederContext.feederRecordId, feederRevisionFingerprint: feederContext.fingerprint, targetRecordId: suppliedLoad.loadRecordId, targetRevisionFingerprint: suppliedLoad.fingerprint, citedLifecycleStage: "FEED", citedCurrentness: "CURRENT", provenanceRef: "prov-end-load", sourceBasisRef: "basis-end-load", applicability: "Applies only to feeder-1", limitations: "Explicit load endpoint only" });
    expect(sourceEndpoint.inferred).toBe(false);
    expect(sourceEndpoint.targetRevisionFingerprint).toBe(sourceContext.fingerprint);
    expect(loadEndpoint.targetRevisionFingerprint).toBe(loadFingerprint);
    expect(r3.loads).toHaveLength(1);
    const cableContext = recordElectricalCableContext(store, who, { ...bound(cable.objectId, cable.fingerprint), cableRecordId: "cable-rec", conductorMaterial: "COPPER", suppliedCoreCount: "3", insulationContext: "XLPE", suppliedSizeAttribute: "4/0", sizeUnit: "AWG", installationEnvironment: "INDOOR", routingCategory: "TRAY", installationMethod: "TRAY_REFERENCE", ambientContext: "40C", associatedFeederRecordId: feederContext.feederRecordId, associatedFeederRevisionFingerprint: feederContext.fingerprint });
    expect(cableContext.sizeCalculated).toBe(false);
    expect(cableContext.validatedCableSizing).toBe(false);
    expect(cableContext.validatedAmpacity).toBe(false);
    expect(cableContext.validatedVoltageDrop).toBe(false);
    expect(cableContext.shortCircuitWithstandValidated).toBe(false);
    expect(cableContext.deratingFactorDerived).toBe(false);
    expect(cableContext.validatedInstallationDesign).toBe(false);
    expect(cableContext.sizeUnit).toBe("AWG");
    expect(store.relationships).toHaveLength(0);
    const relation = recordElectricalFeederCableRelationship(store, who, { relationshipId: "rel-feeder-cable", kind: "FEEDER_TO_CABLE", contextId: "ctx-1", feederObjectId: feeder.objectId, feederObjectRevisionFingerprint: feeder.fingerprint, feederRecordId: feederContext.feederRecordId, feederRevisionFingerprint: feederContext.fingerprint, cableObjectId: cable.objectId, cableObjectRevisionFingerprint: cable.fingerprint, cableRecordId: cableContext.cableRecordId, cableRevisionFingerprint: cableContext.fingerprint, citedLifecycleStage: "FEED", citedCurrentness: "CURRENT", provenanceRef: "prov-rel", sourceBasisRef: "basis-rel", applicability: "Applies only to feeder-1 and cable-1", limitations: "Explicit feeder cable link only" });
    expect(relation.inferred).toBe(false);
    expect(relation.feederRevisionFingerprint).toBe(feederContext.fingerprint);
    expect(relation.cableRevisionFingerprint).toBe(cableContext.fingerprint);
    const replay = recordElectricalRatingContext(store, who, { ...ratingBound, ratingRecordId: "rating-supplied", statementRole: "SUPPLIED_ELECTRICAL_RATING", ratingCategory: "CURRENT_RATING", suppliedValue: "400", unit: "A", assertedFingerprint: suppliedRating.fingerprint });
    expect(replay).toBe(suppliedRating);
    expect(suppliedLoad.fingerprint).toBe(loadFingerprint);
    expect(systemContext.fingerprint).toBe(systemFingerprint);
    expect(sourceContext.capacityValidated).toBe(false);
    expect(busContext.busRatingValidated).toBe(false);
    expect(busContext.shortCircuitValidated).toBe(false);
    expect(consumerContext.validatedEquipmentSelection).toBe(false);
    expect(supply.validatedFeederDesign).toBe(false);
    expect(() => createD7R4Store(createD7R1Store(), r2, r3)).toThrow(/R1_R3_STORE_MISMATCH/);
    expect(() => recordElectricalRatingContext(store, who, { ...ratingBound, ratingRecordId: "rating-sum", statementRole: "SUPPLIED_ELECTRICAL_RATING", ratingCategory: "CURRENT_RATING", suppliedValue: "400+10", unit: "A" })).toThrow(/RATING_CALCULATION_NOT_IN_R4/);
    expect(() => recordElectricalRatingContext(store, who, { ...ratingBound, ratingRecordId: "rating-unit", statementRole: "SUPPLIED_ELECTRICAL_RATING", ratingCategory: "VOLTAGE_RATING", suppliedValue: "415", unit: "kW" })).toThrow(/UNIT_NOT_PRESERVED/);
    expect(() => recordElectricalRatingContext(store, who, { ...ratingBound, ratingRecordId: "rating-auto", statementRole: "SUPPLIED_ELECTRICAL_RATING", ratingCategory: "CURRENT_RATING", suppliedValue: "10", unit: "A", autoAdopt: true })).toThrow(/AUTO_ADOPTION_REJECTED/);
    expect(() => recordElectricalCableContext(store, who, { ...bound(cable.objectId, cable.fingerprint), cableRecordId: "cable-size", conductorMaterial: "COPPER", suppliedCoreCount: "3", insulationContext: "XLPE", suppliedSizeAttribute: "185*1.2", sizeUnit: "mm2", installationEnvironment: "OUTDOOR", routingCategory: "CONDUIT", installationMethod: "CONDUIT_REFERENCE", ambientContext: "30C", calculateCableSize: true })).toThrow(/CABLE_SIZING_NOT_IN_R4/);
    expect(() => recordElectricalCableContext(store, who, { ...bound(cable.objectId, cable.fingerprint), cableRecordId: "cable-derate", conductorMaterial: "ALUMINIUM", suppliedCoreCount: "4", insulationContext: "PVC", suppliedSizeAttribute: "185", sizeUnit: "mm2", installationEnvironment: "OUTDOOR", routingCategory: "DIRECT_BURIED", installationMethod: "BURIAL_REFERENCE", ambientContext: "25C", deratingFactor: "0.82" })).toThrow(/AMPACITY_DERATING_NOT_IN_R4/);
    expect(() => recordElectricalFeederContext(store, who, { ...bound(feeder.objectId, feeder.fingerprint), feederRecordId: "feeder-drop", feederRole: "DISTRIBUTION_FEEDER", calculateVoltageDrop: true })).toThrow(/VOLTAGE_DROP_NOT_IN_R4/);
    expect(() => recordElectricalFeederEndpoint(store, who, { endpointId: "end-size", kind: "LOAD_ENDPOINT", contextId: "ctx-1", feederObjectId: feeder.objectId, feederObjectRevisionFingerprint: feeder.fingerprint, feederRecordId: feederContext.feederRecordId, feederRevisionFingerprint: feederContext.fingerprint, targetRecordId: suppliedLoad.loadRecordId, targetRevisionFingerprint: suppliedLoad.fingerprint, citedLifecycleStage: "FEED", citedCurrentness: "CURRENT", provenanceRef: "prov-size", sourceBasisRef: "basis-size", applicability: "Applies only to feeder-1", limitations: "load does not size", autoSizeCable: true })).toThrow(/LOAD_DOES_NOT_SIZE_FEEDER_OR_CABLE/);
    expect(() => recordElectricalFeederEndpoint(store, who, { endpointId: "end-breaker", kind: "EQUIPMENT_SUPPLY_ENDPOINT", contextId: "ctx-1", feederObjectId: feeder.objectId, feederObjectRevisionFingerprint: feeder.fingerprint, feederRecordId: feederContext.feederRecordId, feederRevisionFingerprint: feederContext.fingerprint, targetRecordId: supply.supplyRecordId, targetRevisionFingerprint: supply.fingerprint, citedLifecycleStage: "FEED", citedCurrentness: "CURRENT", provenanceRef: "prov-breaker", sourceBasisRef: "basis-breaker", applicability: "Applies only to feeder-1", limitations: "no breaker", selectBreaker: true })).toThrow(/PROTECTION_SELECTION_NOT_IN_R4/);
    expect(() => recordElectricalFeederEndpoint(store, who, { endpointId: "end-inferred", kind: "tag_similarity", contextId: "ctx-1", feederObjectId: feeder.objectId, feederObjectRevisionFingerprint: feeder.fingerprint, feederRecordId: feederContext.feederRecordId, feederRevisionFingerprint: feederContext.fingerprint, targetRecordId: sourceContext.sourceRecordId, targetRevisionFingerprint: sourceContext.fingerprint, citedLifecycleStage: "FEED", citedCurrentness: "CURRENT", provenanceRef: "prov-bad", sourceBasisRef: "basis-bad", applicability: "Applies only to feeder-1", limitations: "no inference" })).toThrow(/INFERRED_RELATIONSHIP_REJECTED/);
    expect(() => recordElectricalFeederCableRelationship(store, who, { relationshipId: "rel-inferred", kind: "semantic_similarity", contextId: "ctx-1", feederObjectId: feeder.objectId, feederObjectRevisionFingerprint: feeder.fingerprint, feederRecordId: feederContext.feederRecordId, feederRevisionFingerprint: feederContext.fingerprint, cableObjectId: cable.objectId, cableObjectRevisionFingerprint: cable.fingerprint, cableRecordId: cableContext.cableRecordId, cableRevisionFingerprint: cableContext.fingerprint, citedLifecycleStage: "FEED", citedCurrentness: "CURRENT", provenanceRef: "prov-bad-rel", sourceBasisRef: "basis-bad-rel", applicability: "Applies only to feeder-1 and cable-1", limitations: "no inference" })).toThrow(/INFERRED_RELATIONSHIP_REJECTED/);
    expect(() => recordElectricalFeederEndpoint(store, who, { endpointId: "end-spoof", kind: "LOAD_ENDPOINT", contextId: "ctx-1", feederObjectId: feeder.objectId, feederObjectRevisionFingerprint: feeder.fingerprint, feederRecordId: feederContext.feederRecordId, feederRevisionFingerprint: feederContext.fingerprint, targetRecordId: suppliedLoad.loadRecordId, targetRevisionFingerprint: "spoof", citedLifecycleStage: "FEED", citedCurrentness: "CURRENT", provenanceRef: "prov-spoof", sourceBasisRef: "basis-spoof", applicability: "Applies only to feeder-1", limitations: "wrong load revision" })).toThrow(/R3_LOAD_REVISION_MISMATCH/);
    expect(() => recordElectricalFeederContext(store, who, { ...bound(feeder.objectId, feeder.fingerprint), objectRevisionFingerprint: "latest", feederRecordId: "feeder-float", feederRole: "CONSUMER_FEEDER" })).toThrow(/R1_REVISION_REQUIRED/);
    expect(() => recordElectricalCableContext(store, actor({ tenantId: "tenant-b" }), { ...bound(cable.objectId, cable.fingerprint), cableRecordId: "cable-tenant", conductorMaterial: "COPPER", suppliedCoreCount: "1", insulationContext: "EPR", suppliedSizeAttribute: "16", sizeUnit: "mm2", installationEnvironment: "INDOOR", routingCategory: "TRAY", installationMethod: "TRAY_REFERENCE", ambientContext: "20C" })).toThrow(/CROSS_SCOPE_OPERATION/);
    expect(() => recordElectricalRatingContext(store, actor({ authority: "AI_ASSISTANT" }), { ...ratingBound, ratingRecordId: "rating-ai", statementRole: "SUPPLIED_ELECTRICAL_RATING", ratingCategory: "FREQUENCY_RATING", suppliedValue: "50", unit: "Hz" })).toThrow(/AI_NOT_ELECTRICAL_AUTHORITY/);
    expect(() => recordElectricalFeederCableRelationship(store, actor({ authority: "ADMIN" }), { relationshipId: "rel-admin", kind: "FEEDER_TO_CABLE", contextId: "ctx-1", feederObjectId: feeder.objectId, feederObjectRevisionFingerprint: feeder.fingerprint, feederRecordId: feederContext.feederRecordId, feederRevisionFingerprint: feederContext.fingerprint, cableObjectId: cable.objectId, cableObjectRevisionFingerprint: cable.fingerprint, cableRecordId: cableContext.cableRecordId, cableRevisionFingerprint: cableContext.fingerprint, citedLifecycleStage: "FEED", citedCurrentness: "CURRENT", provenanceRef: "prov-admin", sourceBasisRef: "basis-admin", applicability: "Applies only to feeder-1 and cable-1", limitations: "admin cannot promote" })).toThrow(/ADMIN_NOT_ELECTRICAL_AUTHORITY/);
    expect(() => recordElectricalRatingContext(store, who, { ...ratingBound, ratingRecordId: "rating-conflict", statementRole: "ADOPTED_ELECTRICAL_RATING", ratingCategory: "CURRENT_RATING", suppliedValue: "630", unit: "A", adoptedFromRatingRecordId: suppliedRating.ratingRecordId, adoptionRationale: "Second adoption conflicts" })).toThrow(/DUPLICATE_RATING_REJECTED/);
    expect(() => recordElectricalFeederContext(store, who, { ...bound(feeder.objectId, feeder.fingerprint), feederRecordId: "feeder-capacity", feederRole: "OTHER_CANONICAL_FEEDER_ROLE", validateSourceCapacity: true })).toThrow(/CAPACITY_VALIDATION_NOT_IN_R4/);
    expect(() => recordElectricalFeederEndpoint(store, who, { endpointId: "end-consumer-spoof", kind: "CONSUMER_ENDPOINT", contextId: "ctx-1", feederObjectId: feeder.objectId, feederObjectRevisionFingerprint: feeder.fingerprint, feederRecordId: feederContext.feederRecordId, feederRevisionFingerprint: feederContext.fingerprint, targetRecordId: consumerContext.consumerRecordId, targetRevisionFingerprint: "spoof", citedLifecycleStage: "FEED", citedCurrentness: "CURRENT", provenanceRef: "prov-consumer", sourceBasisRef: "basis-consumer", applicability: "Applies only to feeder-1", limitations: "wrong consumer revision" })).toThrow(/R3_CONSUMER_REVISION_MISMATCH/);
    expect(() => calculateElectricalCableSize()).toThrow(/CABLE_SIZING_NOT_IN_R4/);
    expect(() => deriveInstallationDerating()).toThrow(/AMPACITY_DERATING_NOT_IN_R4/);
    expect(() => recordElectricalCalculationEvidence()).toThrow(/CALCULATION_EVIDENCE_NOT_IN_R4/);
    expect(() => recordElectricalProtectionContext()).toThrow(/PROTECTION_GROUNDING_NOT_IN_R4/);
    expect(() => repointElectricalFeederContext()).toThrow(/AUTO_REPOINT_REJECTED/);
    expect(suppliedLoad.fingerprint).toBe(loadFingerprint);
    expect(systemContext.fingerprint).toBe(systemFingerprint);
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D7.R4.FEEDER_CABLE_AND_RATING_CONTEXT")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D7.R5.ELECTRICAL_CALCULATION_EVIDENCE")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    const sourceText = readFileSync(join(here, "feeder-cable-rating-context.ts"), "utf8");
    expect(sourceText).toMatch(/fingerprintCanonical/);
    expect(sourceText).not.toMatch(/createHash|from ["']@rtb\/engineering-review["']|CREATE TABLE|eval\(|child_process|new Function/);
    expect(scanAnalysisFormulaBypass(join(here, "feeder-cable-rating-context.ts"), sourceText)).toEqual([]);
    const packageJson = JSON.parse(readFileSync(join(here, "../../package.json"), "utf8")) as { dependencies: Record<string, string> };
    expect(Object.keys(packageJson.dependencies).sort()).toEqual(["@rtb/database", "@rtb/platform-commerce", "@rtb/platform-intelligence", "@rtb/platform-kernel", "@rtb/types", "docx", "exceljs", "pptxgenjs", "zod"]);
  });
});
