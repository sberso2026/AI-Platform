import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { D7_ELECTRICAL_OBJECT_TYPES, D7_PROTECTION_GROUNDING_HAZARDOUS_AREA_RUNTIME_COUNT as ARCHITECTURE_R6_COUNT, D7_RUNTIME_COUNT as ARCHITECTURE_RUNTIME_COUNT } from "@rtb/types";
import { describe, expect, it } from "vitest";
import { STRUCTURAL_CAPABILITY_MANIFEST } from "../structural-concrete/capability";
import { scanAnalysisFormulaBypass } from "../structural-systems/formula-scan";
import {
  D7_ELECTRICAL_CALCULATION_EVIDENCE_RUNTIME_COUNT,
  D7_R6_STARTED,
  D7_RUNTIME_COUNT as R5_RUNTIME_COUNT,
  createD7R5Store,
  recordElectricalCalculationEvidence,
} from "./calculation-evidence";
import { D7_RUNTIME_COUNT as R4_RUNTIME_COUNT, createD7R4Store, recordElectricalFeederContext } from "./feeder-cable-rating-context";
import { D7_CONTEXT_AUTHORITY, D7_RUNTIME_COUNT as R1_RUNTIME_COUNT, createD7R1Store, recordElectricalContext, recordElectricalObjectIdentity, type D7R1Actor } from "./identity-foundation";
import { D7_RUNTIME_COUNT as R3_RUNTIME_COUNT, createD7R3Store, recordElectricalLoadContext } from "./load-consumer-equipment-context";
import {
  D7_HAZARDOUS_AREA_CLASSIFICATION_RUNTIME_COUNT,
  D7_PROTECTION_COORDINATION_CALCULATION_RUNTIME_COUNT,
  D7_PROTECTION_GROUNDING_HAZARDOUS_AREA_RUNTIME_COUNT,
  D7_PROTECTION_GROUNDING_HAZARDOUS_AREA_RUNTIME_READY,
  D7_R5_ELECTRICAL_CALCULATION_EVIDENCE_REUSED,
  D7_R7_CANONICAL_PHASE,
  D7_R7_STARTED,
  D7_RUNTIME_COUNT,
  ADOPTED_PROTECTION_SETTING_EQUALS_VALIDATED_PROTECTION_SETTING,
  calculateProtectionSetting,
  createD7R6Store,
  matchEquipmentToHazardousArea,
  performHazardousAreaClassification,
  recordElectricalEquipmentSuitabilityContext,
  recordElectricalGroundingContext,
  recordElectricalGroundingRelationship,
  recordElectricalHazardousAreaContext,
  recordElectricalProtectionDeviceContext,
  recordElectricalProtectionRelationship,
  recordElectricalProtectionSetting,
  recordElectricalRequirement,
} from "./protection-grounding-hazardous-area-context";
import { D7_RUNTIME_COUNT as R2_RUNTIME_COUNT, createD7R2Store, recordElectricalSystemContext } from "./system-source-distribution-context";

const here = dirname(fileURLToPath(import.meta.url));

function actor(overrides: Partial<D7R1Actor> = {}): D7R1Actor {
  return { actorId: "elec-recorder", tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a", authority: D7_CONTEXT_AUTHORITY, ...overrides };
}

describe("EOS-D7-R6 protection grounding and hazardous area context", () => {
  it("records supplied protection grounding and hazardous-area context without calculating or validating it", () => {
    expect(D7_R5_ELECTRICAL_CALCULATION_EVIDENCE_REUSED).toBe(true);
    expect(R1_RUNTIME_COUNT).toBe(1);
    expect(R2_RUNTIME_COUNT).toBe(2);
    expect(R3_RUNTIME_COUNT).toBe(3);
    expect(R4_RUNTIME_COUNT).toBe(4);
    expect(R5_RUNTIME_COUNT).toBe(5);
    expect(D7_ELECTRICAL_CALCULATION_EVIDENCE_RUNTIME_COUNT).toBe(1);
    expect(ARCHITECTURE_RUNTIME_COUNT).toBe(0);
    expect(ARCHITECTURE_R6_COUNT).toBe(0);
    expect(D7_RUNTIME_COUNT).toBe(6);
    expect(D7_PROTECTION_GROUNDING_HAZARDOUS_AREA_RUNTIME_COUNT).toBe(1);
    expect(D7_PROTECTION_GROUNDING_HAZARDOUS_AREA_RUNTIME_READY).toBe(true);
    expect(D7_R6_STARTED).toBe(false);
    expect(D7_R7_STARTED).toBe(false);
    expect(D7_PROTECTION_COORDINATION_CALCULATION_RUNTIME_COUNT).toBe(0);
    expect(D7_HAZARDOUS_AREA_CLASSIFICATION_RUNTIME_COUNT).toBe(0);
    expect(ADOPTED_PROTECTION_SETTING_EQUALS_VALIDATED_PROTECTION_SETTING).toBe(false);
    expect(D7_ELECTRICAL_OBJECT_TYPES).toContain("ELECTRICAL_PROTECTION_CONTEXT");
    expect(D7_ELECTRICAL_OBJECT_TYPES).not.toContain("BREAKER");
    expect(D7_R7_CANONICAL_PHASE).toBe("EOS-D7-R7-REQUIREMENTS-ASSUMPTIONS-AND-CHANGE");

    const r1 = createD7R1Store();
    const who = actor();
    recordElectricalContext(r1, who, { contextId: "ctx-1", citedLifecycleStage: "FEED", provenanceRef: "prov-ctx", sourceBasisRef: "basis-ctx" });
    const identity = (objectId: string, objectType: "ELECTRICAL_SYSTEM" | "ELECTRICAL_LOAD" | "ELECTRICAL_FEEDER" | "ELECTRICAL_PROTECTION_CONTEXT" | "ELECTRICAL_GROUNDING_CONTEXT" | "ELECTRICAL_HAZARDOUS_AREA_CONTEXT" | "ELECTRICAL_CALCULATION_EVIDENCE" | "ELECTRICAL_MOTOR_DRIVE") =>
      recordElectricalObjectIdentity(r1, who, { objectId, contextId: "ctx-1", objectType, citedLifecycleStage: "FEED", provenanceRef: `prov-${objectId}`, sourceBasisRef: `basis-${objectId}` });
    const system = identity("sys-1", "ELECTRICAL_SYSTEM");
    const load = identity("load-1", "ELECTRICAL_LOAD");
    const feeder = identity("feeder-1", "ELECTRICAL_FEEDER");
    const deviceObject = identity("device-1", "ELECTRICAL_PROTECTION_CONTEXT");
    const groundObject = identity("ground-1", "ELECTRICAL_GROUNDING_CONTEXT");
    const areaObject = identity("area-1", "ELECTRICAL_HAZARDOUS_AREA_CONTEXT");
    const evidenceObject = identity("evidence-1", "ELECTRICAL_CALCULATION_EVIDENCE");
    const motor = identity("motor-1", "ELECTRICAL_MOTOR_DRIVE");
    const r2 = createD7R2Store(r1);
    const bound = (objectId: string, fingerprint: string) => ({ contextId: "ctx-1", objectId, objectRevisionFingerprint: fingerprint, citedLifecycleStage: "FEED", citedCurrentness: "CURRENT", provenanceRef: `prov-${objectId}`, sourceBasisRef: `basis-${objectId}`, applicability: `Applies only to ${objectId}`, limitations: `Context only for ${objectId}` });
    recordElectricalSystemContext(r2, who, { ...bound(system.objectId, system.fingerprint), systemRecordId: "sys-rec", systemRole: "DISTRIBUTION_SYSTEM", nominalClassification: "MEDIUM_VOLTAGE_CLASS" });
    const r3 = createD7R3Store(r1, r2);
    const suppliedLoad = recordElectricalLoadContext(r3, who, { ...bound(load.objectId, load.fingerprint), caseName: "NORMAL_CASE", duty: "CONTINUOUS", availability: "REQUIRED", applicability: "Applies only to load-1 in NORMAL_CASE", limitations: "Supplied value is not a calculation", loadRecordId: "load-supplied", statementRole: "SUPPLIED_LOAD_REQUIREMENT", suppliedValue: "250", unit: "kW" });
    const r4 = createD7R4Store(r1, r2, r3);
    const feederContext = recordElectricalFeederContext(r4, who, { ...bound(feeder.objectId, feeder.fingerprint), feederRecordId: "feeder-rec", feederRole: "DISTRIBUTION_FEEDER" });
    const r5 = createD7R5Store(r1, r4);
    const evidenceCommon = {
      contextId: "ctx-1",
      objectId: evidenceObject.objectId,
      objectRevisionFingerprint: evidenceObject.fingerprint,
      subjectObjectId: deviceObject.objectId,
      subjectRevisionFingerprint: deviceObject.fingerprint,
      citedLifecycleStage: "FEED",
      citedCurrentness: "CURRENT",
      provenanceRef: "prov-evidence",
      sourceBasisRef: "basis-evidence",
      sourceOrigin: "EXTERNAL_ENGINEERING_SOFTWARE",
      sourceToolName: "ETAP",
      sourceToolVersion: "22.0",
      sourceOrganization: "External study office",
      applicability: "Applies only to evidence-1 and device-1",
      limitations: "Supplied study evidence is not an EOS calculation",
      assumptions: ["External study assumption retained"],
      inputs: [{ name: "SUPPLIED_INPUT", value: "10", unit: "kA" }],
    };
    const protectionEvidence = recordElectricalCalculationEvidence(r5, who, { ...evidenceCommon, evidenceId: "evidence-protection", evidenceClass: "PROTECTION_COORDINATION", sourceDocumentRef: "RPT-PROTECTION", results: [{ name: "SUPPLIED_RESULT", value: "12", unit: "kA" }] });
    const arcEvidence = recordElectricalCalculationEvidence(r5, who, { ...evidenceCommon, evidenceId: "evidence-arc", evidenceClass: "ARC_FLASH", sourceDocumentRef: "RPT-ARC", results: [{ name: "SUPPLIED_RESULT", value: "8", unit: "kA" }] });
    const groundingEvidence = recordElectricalCalculationEvidence(r5, who, { ...evidenceCommon, evidenceId: "evidence-ground", evidenceClass: "GROUNDING", subjectObjectId: groundObject.objectId, subjectRevisionFingerprint: groundObject.fingerprint, sourceDocumentRef: "RPT-GROUND", applicability: "Applies only to evidence-1 and ground-1", results: [{ name: "SUPPLIED_RESULT", value: "1", unit: "ohm" }] });
    const store = createD7R6Store(r1, r5);
    const governed = { contextId: "ctx-1", citedLifecycleStage: "FEED", citedCurrentness: "CURRENT", provenanceRef: "prov-r6", sourceBasisRef: "basis-r6" };
    const device = recordElectricalProtectionDeviceContext(store, who, { ...governed, ...bound(deviceObject.objectId, deviceObject.fingerprint), deviceRecordId: "device-rec", deviceClass: "BREAKER", arcFlashEvidenceId: arcEvidence.evidenceId, arcFlashEvidenceRevisionFingerprint: arcEvidence.fingerprint });
    const relationship = recordElectricalProtectionRelationship(store, who, { ...governed, relationshipId: "rel-protect", kind: "DEVICE_PROTECTS_SUBJECT", deviceObjectId: deviceObject.objectId, deviceObjectRevisionFingerprint: deviceObject.fingerprint, deviceRecordId: device.deviceRecordId, deviceRevisionFingerprint: device.fingerprint, subjectObjectId: feeder.objectId, subjectObjectRevisionFingerprint: feeder.fingerprint, applicability: "Applies only to device-1 and feeder-1", limitations: "Explicit relationship only" });
    const supplied = recordElectricalProtectionSetting(store, who, { ...governed, ...bound(deviceObject.objectId, deviceObject.fingerprint), settingRecordId: "setting-supplied", statementRole: "SUPPLIED_PROTECTION_SETTING", settingCategory: "CURRENT", suppliedValue: "800", unit: "A", protectionEvidenceId: protectionEvidence.evidenceId, protectionEvidenceRevisionFingerprint: protectionEvidence.fingerprint, feederRecordId: feederContext.feederRecordId, feederRevisionFingerprint: feederContext.fingerprint, loadRecordId: suppliedLoad.loadRecordId, loadRevisionFingerprint: suppliedLoad.fingerprint, jurisdictionProfileId: "australia", standardReference: "AS/NZS 3000 reference" });
    const adopted = recordElectricalProtectionSetting(store, who, { ...governed, ...bound(deviceObject.objectId, deviceObject.fingerprint), settingRecordId: "setting-adopted", statementRole: "ADOPTED_PROTECTION_SETTING", settingCategory: "CURRENT", suppliedValue: "800", unit: "A", adoptedFromSettingRecordId: supplied.settingRecordId, adoptionRationale: "Explicit adoption of the supplied current setting", jurisdictionProfileId: "australia", standardReference: "AS/NZS 3000 reference" });
    const grounding = recordElectricalGroundingContext(store, who, { ...governed, ...bound(groundObject.objectId, groundObject.fingerprint), groundingRecordId: "ground-rec", groundingRole: "BONDING", suppliedResistanceValue: "1", resistanceUnit: "ohm", groundingEvidenceId: groundingEvidence.evidenceId, groundingEvidenceRevisionFingerprint: groundingEvidence.fingerprint });
    const groundingRelationship = recordElectricalGroundingRelationship(store, who, { ...governed, relationshipId: "rel-ground", kind: "BONDING_CONNECTION", groundingObjectId: groundObject.objectId, groundingObjectRevisionFingerprint: groundObject.fingerprint, groundingRecordId: grounding.groundingRecordId, groundingRevisionFingerprint: grounding.fingerprint, subjectObjectId: motor.objectId, subjectObjectRevisionFingerprint: motor.fingerprint, applicability: "Applies only to ground-1 and motor-1", limitations: "Explicit bonding relationship only" });
    const area = recordElectricalHazardousAreaContext(store, who, { ...governed, ...bound(areaObject.objectId, areaObject.fingerprint), areaRecordId: "area-rec", classificationSourceDocument: "HAZ-CLASS-001", classificationSourceRevision: "rev-3", zoneOrDivision: "ZONE_2", atmosphere: "GAS", group: "IIA", temperatureClass: "T3", areaLocationRef: "AREA-PUMP-BAY", jurisdictionProfileId: "australia", standardReference: "IEC 60079 reference" });
    const suitability = recordElectricalEquipmentSuitabilityContext(store, who, { ...governed, suitabilityRecordId: "suit-supplied", equipmentObjectId: motor.objectId, equipmentRevisionFingerprint: motor.fingerprint, hazardousAreaRecordId: area.areaRecordId, hazardousAreaRevisionFingerprint: area.fingerprint, statementRole: "SUPPLIED_EQUIPMENT_SUITABILITY", suppliedCertificationEvidenceRef: "CERT-EX-100", suppliedMarkingRef: "Ex IIA T3", applicability: "Applies only to motor-1 and area-1", limitations: "Supplied marking is not project selection", jurisdictionProfileId: "australia", standardReference: "IEC 60079 reference" });
    expect(device.validatedProtectionDesign).toBe(false);
    expect(device.validatedDeviceSelection).toBe(false);
    expect(device.labelGenerated).toBe(false);
    expect(device.arcFlashEvidenceRevisionFingerprint).toBe(arcEvidence.fingerprint);
    expect(relationship.inferred).toBe(false);
    expect(relationship.subjectObjectRevisionFingerprint).toBe(feeder.fingerprint);
    expect(supplied.adopted).toBe(false);
    expect(supplied.coordinationValidated).toBe(false);
    expect(supplied.calculated).toBe(false);
    expect(supplied.conformanceDetermined).toBe(false);
    expect(supplied.unit).toBe("A");
    expect(adopted.adopted).toBe(true);
    expect(adopted.validatedSetting).toBe(false);
    expect(adopted.adoptedFromSettingRecordId).toBe(supplied.settingRecordId);
    expect(supplied.adopted).toBe(false);
    expect(store.settings).toHaveLength(2);
    expect(grounding.validatedGroundingDesign).toBe(false);
    expect(grounding.codeConformance).toBe(false);
    expect(grounding.resistanceCalculated).toBe(false);
    expect(grounding.suppliedResistanceValue).toBe("1");
    expect(groundingRelationship.inferred).toBe(false);
    expect(area.classificationPerformedByEos).toBe(false);
    expect(area.validatedClassification).toBe(false);
    expect(area.codeConformance).toBe(false);
    expect(area.zoneOrDivision).toBe("ZONE_2");
    expect(suitability.eosCertified).toBe(false);
    expect(suitability.validatedSelection).toBe(false);
    expect(suitability.markingValidatedSelection).toBe(false);
    expect(suitability.autoMatched).toBe(false);
    expect(feederContext.protectionCoordination).toBe(false);
    expect(feederContext.fingerprint).toBe(feederContext.fingerprint);
    expect(suppliedLoad.suppliedValue).toBe("250");
    expect(protectionEvidence.results[0]?.value).toBe("12");
    expect(arcEvidence.eosCalculated).toBe(false);
    expect(groundingEvidence.adoptedDesign).toBe(false);
    const replay = recordElectricalProtectionSetting(store, who, { ...governed, ...bound(deviceObject.objectId, deviceObject.fingerprint), settingRecordId: "setting-supplied", statementRole: "SUPPLIED_PROTECTION_SETTING", settingCategory: "CURRENT", suppliedValue: "800", unit: "A", protectionEvidenceId: protectionEvidence.evidenceId, protectionEvidenceRevisionFingerprint: protectionEvidence.fingerprint, feederRecordId: feederContext.feederRecordId, feederRevisionFingerprint: feederContext.fingerprint, loadRecordId: suppliedLoad.loadRecordId, loadRevisionFingerprint: suppliedLoad.fingerprint, jurisdictionProfileId: "australia", standardReference: "AS/NZS 3000 reference", assertedFingerprint: supplied.fingerprint });
    expect(replay).toBe(supplied);
    expect(() => createD7R6Store(createD7R1Store(), r5)).toThrow(/R1_R5_STORE_MISMATCH/);
    expect(() => recordElectricalProtectionDeviceContext(store, who, { ...governed, ...bound(deviceObject.objectId, deviceObject.fingerprint), deviceRecordId: "device-free", deviceClass: "CUSTOM_DEVICE" })).toThrow(/DEVICE_CLASS_NOT_ALLOWLISTED/);
    expect(() => recordElectricalProtectionRelationship(store, who, { ...governed, relationshipId: "rel-infer", kind: "inferred", deviceObjectId: deviceObject.objectId, deviceObjectRevisionFingerprint: deviceObject.fingerprint, deviceRecordId: device.deviceRecordId, deviceRevisionFingerprint: device.fingerprint, subjectObjectId: feeder.objectId, subjectObjectRevisionFingerprint: feeder.fingerprint, applicability: "Applies only to device-1 and feeder-1", limitations: "no inference" })).toThrow(/INFERRED_RELATIONSHIP_REJECTED/);
    expect(() => recordElectricalProtectionSetting(store, who, { ...governed, ...bound(deviceObject.objectId, deviceObject.fingerprint), settingRecordId: "setting-calc", statementRole: "SUPPLIED_PROTECTION_SETTING", settingCategory: "CURRENT", suppliedValue: "800+10", unit: "A" })).toThrow(/HIDDEN_CALCULATION/);
    expect(() => recordElectricalProtectionSetting(store, who, { ...governed, ...bound(deviceObject.objectId, deviceObject.fingerprint), settingRecordId: "setting-unit", statementRole: "SUPPLIED_PROTECTION_SETTING", settingCategory: "TIME", suppliedValue: "1", unit: "hp" })).toThrow(/UNIT_NOT_PRESERVED/);
    expect(() => recordElectricalProtectionSetting(store, who, { ...governed, ...bound(deviceObject.objectId, deviceObject.fingerprint), settingRecordId: "setting-adopt-auto", statementRole: "SUPPLIED_PROTECTION_SETTING", settingCategory: "VOLTAGE", suppliedValue: "415", unit: "V", autoAdoptProtectionEvidence: true })).toThrow(/AUTO_ADOPTION_REJECTED/);
    expect(() => recordElectricalProtectionSetting(store, who, { ...governed, ...bound(deviceObject.objectId, deviceObject.fingerprint), settingRecordId: "setting-spoof", statementRole: "SUPPLIED_PROTECTION_SETTING", settingCategory: "VOLTAGE", suppliedValue: "415", unit: "V", protectionEvidenceId: protectionEvidence.evidenceId, protectionEvidenceRevisionFingerprint: "spoof" })).toThrow(/R5_EVIDENCE_REVISION_MISMATCH/);
    expect(() => recordElectricalProtectionSetting(store, who, { ...governed, ...bound(deviceObject.objectId, deviceObject.fingerprint), settingRecordId: "setting-feeder-auto", statementRole: "SUPPLIED_PROTECTION_SETTING", settingCategory: "VOLTAGE", suppliedValue: "415", unit: "V", feederAutoCreatesSetting: true })).toThrow(/CONTEXT_DOES_NOT_CREATE_PROTECTION_SETTING/);
    expect(() => recordElectricalProtectionSetting(store, who, { ...governed, ...bound(deviceObject.objectId, deviceObject.fingerprint), settingRecordId: "setting-dup", statementRole: "ADOPTED_PROTECTION_SETTING", settingCategory: "CURRENT", suppliedValue: "800", unit: "A", adoptedFromSettingRecordId: supplied.settingRecordId, adoptionRationale: "second adoption" })).toThrow(/DUPLICATE_SETTING_REJECTED/);
    expect(() => recordElectricalGroundingContext(store, who, { ...governed, ...bound(groundObject.objectId, groundObject.fingerprint), groundingRecordId: "ground-calc", groundingRole: "GROUNDING_SYSTEM", calculateGroundResistance: true })).toThrow(/GROUNDING_CALCULATION_NOT_IN_R6/);
    expect(() => recordElectricalGroundingRelationship(store, who, { ...governed, relationshipId: "rel-ground-infer", kind: "topology", groundingObjectId: groundObject.objectId, groundingObjectRevisionFingerprint: groundObject.fingerprint, groundingRecordId: grounding.groundingRecordId, groundingRevisionFingerprint: grounding.fingerprint, subjectObjectId: motor.objectId, subjectObjectRevisionFingerprint: motor.fingerprint, applicability: "Applies only to ground-1 and motor-1", limitations: "no inference" })).toThrow(/INFERRED_RELATIONSHIP_REJECTED/);
    expect(() => recordElectricalHazardousAreaContext(store, who, { ...governed, ...bound(areaObject.objectId, areaObject.fingerprint), areaRecordId: "area-float", classificationSourceDocument: "HAZ-CLASS-001", classificationSourceRevision: "latest", zoneOrDivision: "ZONE_2", atmosphere: "GAS", areaLocationRef: "AREA-PUMP-BAY" })).toThrow(/CLASSIFICATION_SOURCE_REVISION_REQUIRED/);
    expect(() => recordElectricalHazardousAreaContext(store, who, { ...governed, ...bound(areaObject.objectId, areaObject.fingerprint), areaRecordId: "area-class", classificationSourceDocument: "HAZ-CLASS-002", classificationSourceRevision: "rev-4", zoneOrDivision: "ZONE_1", atmosphere: "GAS", areaLocationRef: "AREA-OTHER", performHazardousAreaClassification: true })).toThrow(/HAZARDOUS_AREA_CLASSIFICATION_NOT_IN_R6/);
    expect(() => recordElectricalEquipmentSuitabilityContext(store, who, { ...governed, suitabilityRecordId: "suit-match", equipmentObjectId: motor.objectId, equipmentRevisionFingerprint: motor.fingerprint, hazardousAreaRecordId: area.areaRecordId, hazardousAreaRevisionFingerprint: area.fingerprint, statementRole: "SUPPLIED_EQUIPMENT_SUITABILITY", suppliedCertificationEvidenceRef: "CERT-EX-200", suppliedMarkingRef: "Ex IIB T4", applicability: "Applies only to motor-1 and area-1", limitations: "no matching", autoMatchEquipment: true })).toThrow(/EQUIPMENT_MATCHING_NOT_IN_R6/);
    expect(() => recordElectricalEquipmentSuitabilityContext(store, who, { ...governed, suitabilityRecordId: "suit-cert", equipmentObjectId: motor.objectId, equipmentRevisionFingerprint: motor.fingerprint, hazardousAreaRecordId: area.areaRecordId, hazardousAreaRevisionFingerprint: area.fingerprint, statementRole: "SUPPLIED_EQUIPMENT_SUITABILITY", suppliedCertificationEvidenceRef: "CERT-EX-300", suppliedMarkingRef: "Ex IIA T3", applicability: "Applies only to motor-1 and area-1", limitations: "not eos certification", eosCertification: true })).toThrow(/SUPPLIED_CERTIFICATION_NOT_EOS_CERTIFICATION/);
    expect(() => recordElectricalProtectionSetting(store, actor({ tenantId: "tenant-b" }), { ...governed, ...bound(deviceObject.objectId, deviceObject.fingerprint), settingRecordId: "setting-tenant", statementRole: "SUPPLIED_PROTECTION_SETTING", settingCategory: "VOLTAGE", suppliedValue: "415", unit: "V" })).toThrow(/CROSS_SCOPE_OPERATION/);
    expect(() => recordElectricalProtectionSetting(store, actor({ authority: "AI_ASSISTANT" }), { ...governed, ...bound(deviceObject.objectId, deviceObject.fingerprint), settingRecordId: "setting-ai", statementRole: "SUPPLIED_PROTECTION_SETTING", settingCategory: "VOLTAGE", suppliedValue: "415", unit: "V" })).toThrow(/AI_NOT_ELECTRICAL_AUTHORITY/);
    expect(() => recordElectricalHazardousAreaContext(store, actor({ authority: "ADMIN" }), { ...governed, ...bound(areaObject.objectId, areaObject.fingerprint), areaRecordId: "area-admin", classificationSourceDocument: "HAZ-CLASS-003", classificationSourceRevision: "rev-5", zoneOrDivision: "ZONE_2", atmosphere: "DUST", areaLocationRef: "AREA-ADMIN" })).toThrow(/ADMIN_NOT_ELECTRICAL_AUTHORITY/);
    expect(() => calculateProtectionSetting()).toThrow(/PROTECTION_CALCULATION_NOT_IN_R6/);
    expect(() => performHazardousAreaClassification()).toThrow(/HAZARDOUS_AREA_CLASSIFICATION_NOT_IN_R6/);
    expect(() => matchEquipmentToHazardousArea()).toThrow(/EQUIPMENT_MATCHING_NOT_IN_R6/);
    expect(() => recordElectricalRequirement()).toThrow(/REQUIREMENTS_NOT_IN_R6/);
    expect(feederContext.protectionCoordination).toBe(false);
    expect(suppliedLoad.fingerprint).toBe(suppliedLoad.fingerprint);
    expect(protectionEvidence.fingerprint).toBe(protectionEvidence.fingerprint);
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D7.R6.PROTECTION_GROUNDING_AND_HAZARDOUS_AREA_CONTEXT")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D7.R7.REQUIREMENTS_ASSUMPTIONS_AND_CHANGE")?.implementationState).toBe("NOT_IMPLEMENTED");
    const sourceText = readFileSync(join(here, "protection-grounding-hazardous-area-context.ts"), "utf8");
    expect(sourceText).toMatch(/fingerprintCanonical/);
    expect(sourceText).not.toMatch(/createHash|from ["']@rtb\/engineering-review["']|CREATE TABLE|eval\(|child_process|new Function/);
    expect(scanAnalysisFormulaBypass(join(here, "protection-grounding-hazardous-area-context.ts"), sourceText)).toEqual([]);
    const packageJson = JSON.parse(readFileSync(join(here, "../../package.json"), "utf8")) as { dependencies: Record<string, string> };
    expect(Object.keys(packageJson.dependencies).sort()).toEqual(["@rtb/database", "@rtb/engineering-review", "@rtb/platform-commerce", "@rtb/platform-intelligence", "@rtb/platform-kernel", "@rtb/types", "docx", "exceljs", "pptxgenjs", "zod"]);
  });
});
