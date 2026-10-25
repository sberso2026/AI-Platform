import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { D7_D9_SOURCE_CONTRACT_RUNTIME_COUNT as ARCHITECTURE_SOURCE_COUNT, D7_ELECTRICAL_OBJECT_TYPES, D7_RUNTIME_COUNT as ARCHITECTURE_RUNTIME_COUNT } from "@rtb/types";
import { describe, expect, it } from "vitest";
import { STRUCTURAL_CAPABILITY_MANIFEST } from "../structural-concrete/capability";
import { scanAnalysisFormulaBypass } from "../structural-systems/formula-scan";
import { createD7R5Store, recordElectricalCalculationEvidence } from "./calculation-evidence";
import { D7_R11_STARTED, D7_RUNTIME_COUNT as R10_RUNTIME_COUNT, createD7R10Store, recordElectricalCurrentness, recordElectricalLineage } from "./currentness-digital-thread";
import {
  D7_D9_SOURCE_CONTRACT_READ_ONLY,
  D7_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
  D7_D9_SOURCE_CONTRACT_RUNTIME_READY,
  D7_D9_SOURCE_ENVELOPE_IMPLEMENTED,
  D7_R11_CREATES_NEW_ELECTRICAL_FACT,
  D7_R11_DERIVES_MISSING_ENGINEERING_VALUE,
  D7_R11_FINGERPRINT_MISMATCH_AUTO_REPAIRED,
  D7_R12_CANONICAL_PHASE,
  D7_R12_STARTED,
  D7_RUNTIME_COUNT,
  D9_CAN_MUTATE_D7_THROUGH_SOURCE_CONTRACT,
  D9_RUNTIME_COUNT,
  D9_RUNTIME_STARTED,
  D9_SOURCE_CALCULATION_EVIDENCE_EQUALS_CALCULATION_PERFORMED_BY_EOS,
  D9_SOURCE_VALIDATED_EQUALS_APPROVED,
  calculateElectricalFromSource,
  createD7R11Store,
  deriveElectricalSourceValue,
  inferElectricalSourceLineage,
  recordElectricalSourceContract,
  startD9FromElectricalSource,
} from "./d9-source-contract";
import { createD7R8Store, recordElectricalInterfaceHandoff } from "./discipline-interfaces-handoffs";
import { createD7R4Store, recordElectricalCableContext, recordElectricalFeederContext, recordElectricalRatingContext } from "./feeder-cable-rating-context";
import { D7_CONTEXT_AUTHORITY, createD7R1Store, recordElectricalContext, recordElectricalObjectIdentity, type D7R1Actor } from "./identity-foundation";
import { createD7R3Store, recordElectricalLoadContext } from "./load-consumer-equipment-context";
import { createD7R6Store, recordElectricalGroundingContext, recordElectricalHazardousAreaContext, recordElectricalProtectionDeviceContext, recordElectricalProtectionSetting } from "./protection-grounding-hazardous-area-context";
import { createD7R7Store, recordElectricalAssumption, recordElectricalChange, recordElectricalEngineeringDecision, recordElectricalReassessment, recordElectricalSourceRequirement } from "./requirements-assumptions-change";
import { createD7R9Store, recordElectricalReviewCompletion, recordElectricalReviewFinding, recordElectricalReviewRequest, recordElectricalValidationState } from "./review-validation-governance";
import { createD7R2Store, recordElectricalDistributionContext, recordElectricalSourceContext, recordElectricalSystemContext } from "./system-source-distribution-context";

const here = dirname(fileURLToPath(import.meta.url));

function actor(overrides: Partial<D7R1Actor> = {}): D7R1Actor {
  return { actorId: "elec-recorder", tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a", authority: D7_CONTEXT_AUTHORITY, ...overrides };
}

describe("EOS-D7-R11 D9 source contract", () => {
  it("exposes exact Electrical revisions without creating truth or starting D9", () => {
    expect(ARCHITECTURE_RUNTIME_COUNT).toBe(0);
    expect(ARCHITECTURE_SOURCE_COUNT).toBe(0);
    expect(R10_RUNTIME_COUNT).toBe(10);
    expect(D7_R11_STARTED).toBe(false);
    expect(D7_RUNTIME_COUNT).toBe(11);
    expect(D7_D9_SOURCE_CONTRACT_RUNTIME_COUNT).toBe(1);
    expect(D7_D9_SOURCE_CONTRACT_RUNTIME_READY).toBe(true);
    expect(D7_D9_SOURCE_CONTRACT_READ_ONLY).toBe(true);
    expect(D9_CAN_MUTATE_D7_THROUGH_SOURCE_CONTRACT).toBe(false);
    expect(D7_D9_SOURCE_ENVELOPE_IMPLEMENTED).toBe(true);
    expect(D7_R11_CREATES_NEW_ELECTRICAL_FACT).toBe(false);
    expect(D7_R11_DERIVES_MISSING_ENGINEERING_VALUE).toBe(false);
    expect(D7_R11_FINGERPRINT_MISMATCH_AUTO_REPAIRED).toBe(false);
    expect(D9_SOURCE_CALCULATION_EVIDENCE_EQUALS_CALCULATION_PERFORMED_BY_EOS).toBe(false);
    expect(D9_SOURCE_VALIDATED_EQUALS_APPROVED).toBe(false);
    expect(D7_R12_STARTED).toBe(false);
    expect(D7_R12_CANONICAL_PHASE).toBe("EOS-D7-R12-ELECTRICAL-BOUNDED-CLOSEOUT");
    expect(D9_RUNTIME_STARTED).toBe(false);
    expect(D9_RUNTIME_COUNT).toBe(0);

    const r1 = createD7R1Store();
    const who = actor();
    const reviewer = { ...actor({ actorId: "elec-reviewer", authority: "REVIEWER" }), actorKind: "human" as const, aal: "aal2" };
    const validator = { ...actor({ actorId: "elec-validator", authority: "ELECTRICAL_VALIDATION_AUTHORITY" }), actorKind: "human" as const, aal: "aal2" };
    recordElectricalContext(r1, who, { contextId: "ctx-1", citedLifecycleStage: "FEED", provenanceRef: "prov-ctx", sourceBasisRef: "basis-ctx" });
    const identity = (objectId: string, objectType: (typeof D7_ELECTRICAL_OBJECT_TYPES)[number]) => recordElectricalObjectIdentity(r1, who, { objectId, contextId: "ctx-1", objectType, citedLifecycleStage: "FEED", provenanceRef: `prov-${objectId}`, sourceBasisRef: `basis-${objectId}` });
    const load = identity("load-1", "ELECTRICAL_LOAD");
    const system = identity("sys-1", "ELECTRICAL_SYSTEM");
    const sourceObject = identity("source-1", "ELECTRICAL_POWER_SOURCE");
    const bus = identity("bus-1", "ELECTRICAL_DISTRIBUTION_EQUIPMENT");
    const feeder = identity("feeder-1", "ELECTRICAL_FEEDER");
    const cable = identity("cable-1", "ELECTRICAL_CABLE");
    const ratingObject = identity("rating-1", "ELECTRICAL_EQUIPMENT_RATING");
    const deviceObject = identity("device-1", "ELECTRICAL_PROTECTION_CONTEXT");
    const evidenceObject = identity("evidence-1", "ELECTRICAL_CALCULATION_EVIDENCE");
    const groundObject = identity("ground-1", "ELECTRICAL_GROUNDING_CONTEXT");
    const areaObject = identity("area-1", "ELECTRICAL_HAZARDOUS_AREA_CONTEXT");
    const identityFingerprint = feeder.fingerprint;
    const r2 = createD7R2Store(r1);
    const bound = (objectId: string, fingerprint: string) => ({ contextId: "ctx-1", objectId, objectRevisionFingerprint: fingerprint, citedLifecycleStage: "FEED", citedCurrentness: "CURRENT", provenanceRef: `prov-${objectId}`, sourceBasisRef: `basis-${objectId}`, applicability: `Applies only to ${objectId}`, limitations: `Context only for ${objectId}` });
    const systemContext = recordElectricalSystemContext(r2, who, { ...bound(system.objectId, system.fingerprint), systemRecordId: "sys-rec", systemRole: "DISTRIBUTION_SYSTEM", nominalClassification: "MEDIUM_VOLTAGE_CLASS" });
    const sourceContext = recordElectricalSourceContext(r2, who, { ...bound(sourceObject.objectId, sourceObject.fingerprint), sourceRecordId: "src-rec", sourceClass: "UTILITY_SUPPLY", sourceRole: "UTILITY_GRID" });
    const busContext = recordElectricalDistributionContext(r2, who, { ...bound(bus.objectId, bus.fingerprint), distributionRecordId: "bus-rec", equipmentClass: "BUS", hierarchyRole: "BUS_NODE" });
    const r3 = createD7R3Store(r1, r2);
    const suppliedLoad = recordElectricalLoadContext(r3, who, { ...bound(load.objectId, load.fingerprint), caseName: "NORMAL_CASE", duty: "CONTINUOUS", availability: "REQUIRED", applicability: "Applies only to load-1 in NORMAL_CASE", limitations: "Supplied value is not a calculation", loadRecordId: "load-supplied", statementRole: "SUPPLIED_LOAD_REQUIREMENT", suppliedValue: "250", unit: "kW" });
    const r4 = createD7R4Store(r1, r2, r3);
    const feederContext = recordElectricalFeederContext(r4, who, { ...bound(feeder.objectId, feeder.fingerprint), feederRecordId: "feeder-rec", feederRole: "DISTRIBUTION_FEEDER" });
    const cableContext = recordElectricalCableContext(r4, who, { ...bound(cable.objectId, cable.fingerprint), cableRecordId: "cable-rec", conductorMaterial: "COPPER", suppliedCoreCount: "3", insulationContext: "XLPE", suppliedSizeAttribute: "4/0", sizeUnit: "AWG", installationEnvironment: "INDOOR", routingCategory: "TRAY", installationMethod: "TRAY_REFERENCE", ambientContext: "40C", associatedFeederRecordId: feederContext.feederRecordId, associatedFeederRevisionFingerprint: feederContext.fingerprint });
    const rating = recordElectricalRatingContext(r4, who, { ...bound(ratingObject.objectId, ratingObject.fingerprint), ratingRecordId: "rating-supplied", statementRole: "SUPPLIED_ELECTRICAL_RATING", ratingCategory: "CURRENT_RATING", suppliedValue: "400", unit: "A" });
    const r5 = createD7R5Store(r1, r4);
    const protectionEvidence = recordElectricalCalculationEvidence(r5, who, { contextId: "ctx-1", objectId: evidenceObject.objectId, objectRevisionFingerprint: evidenceObject.fingerprint, subjectObjectId: deviceObject.objectId, subjectRevisionFingerprint: deviceObject.fingerprint, citedLifecycleStage: "FEED", citedCurrentness: "CURRENT", provenanceRef: "prov-evidence", sourceBasisRef: "basis-evidence", sourceOrigin: "EXTERNAL_ENGINEERING_SOFTWARE", sourceToolName: "ETAP", sourceToolVersion: "22.0", sourceOrganization: "External study office", applicability: "Applies only to evidence-1 and device-1", limitations: "Supplied study evidence is not an EOS calculation", assumptions: ["External study assumption retained"], inputs: [{ name: "SUPPLIED_INPUT", value: "10", unit: "kA" }], evidenceId: "evidence-protection", evidenceClass: "PROTECTION_COORDINATION", sourceDocumentRef: "RPT-PROTECTION", results: [{ name: "SUPPLIED_RESULT", value: "12", unit: "kA" }] });
    const r6 = createD7R6Store(r1, r5);
    const device = recordElectricalProtectionDeviceContext(r6, who, { ...bound(deviceObject.objectId, deviceObject.fingerprint), deviceRecordId: "device-rec", deviceClass: "BREAKER" });
    const suppliedSetting = recordElectricalProtectionSetting(r6, who, { ...bound(deviceObject.objectId, deviceObject.fingerprint), settingRecordId: "setting-supplied", statementRole: "SUPPLIED_PROTECTION_SETTING", settingCategory: "CURRENT", suppliedValue: "800", unit: "A", jurisdictionProfileId: "australia", standardReference: "AS/NZS 3000 reference" });
    const grounding = recordElectricalGroundingContext(r6, who, { ...bound(groundObject.objectId, groundObject.fingerprint), groundingRecordId: "ground-rec", groundingRole: "BONDING" });
    const area = recordElectricalHazardousAreaContext(r6, who, { ...bound(areaObject.objectId, areaObject.fingerprint), areaRecordId: "area-rec", classificationSourceDocument: "HAZ-CLASS-001", classificationSourceRevision: "rev-3", zoneOrDivision: "ZONE_2", atmosphere: "GAS", areaLocationRef: "AREA-PUMP-BAY" });
    const r7 = createD7R7Store(r1, r6);
    const requirement = recordElectricalSourceRequirement(r7, who, { ...bound(feeder.objectId, feeder.fingerprint), requirementId: "req-source", statement: "Retain the supplied feeder basis", requirementRole: "SOURCE_REQUIREMENT", requirementCategory: "DESIGN_INPUT", sourceClass: "PROJECT_REQUIREMENT", sourceRef: "PR-FEEDER-001", sourceRevision: "rev-2" });
    const assumption = recordElectricalAssumption(r7, who, { ...bound(feeder.objectId, feeder.fingerprint), assumptionId: "asm-1", statement: "Ambient grouping remains as supplied", materiality: "medium" });
    const decision = recordElectricalEngineeringDecision(r7, who, { ...bound(feeder.objectId, feeder.fingerprint), decisionId: "dec-1", statement: "Keep the supplied feeder basis until reassessment", alternatives: [{ id: "alt-keep", statement: "Keep the supplied basis", is_selected: true }, { id: "alt-hold", statement: "Hold for later reassessment", is_selected: false }] });
    const change = recordElectricalChange(r7, who, { ...bound(load.objectId, load.fingerprint), changeId: "chg-1", changeCategory: "R3_LOAD_CHANGED", reason: "The cited load requirement changed", dependencies: [{ kind: "OBJECT_REFERENCE", targetKind: "R3_LOAD", targetId: suppliedLoad.loadRecordId, targetFingerprint: suppliedLoad.fingerprint }] });
    const reassessment = recordElectricalReassessment(r7, who, { ...bound(load.objectId, load.fingerprint), reassessmentId: "ras-required", changeId: change.changeId, targetId: suppliedLoad.loadRecordId, targetFingerprint: suppliedLoad.fingerprint, state: "REASSESSMENT_REQUIRED" });
    const scope = { tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a", recordStatus: "CURRENT" as const };
    const counterparts = [{ discipline: "mechanical" as const, counterpartId: "mech-1", sourceRevision: "rev-mech", fingerprint: "fp-mech", ...scope }];
    const r8 = createD7R8Store(r7, counterparts);
    const handoff = recordElectricalInterfaceHandoff(r8, who, { ...bound(feeder.objectId, feeder.fingerprint), sourceKind: "R4_FEEDER", sourceId: feederContext.feederRecordId, sourceFingerprint: feederContext.fingerprint, dependencies: [{ kind: "OBJECT_REFERENCE", targetKind: "R4_FEEDER", targetId: feederContext.feederRecordId, targetFingerprint: feederContext.fingerprint }], direction: "D7_TO_COUNTERPART", suppliedContent: "Supplied feeder context for the named counterpart", handoffStatus: "COMPLETE", identityBasis: "EXPLICIT", tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a", handoffId: "ho-mech", counterpartDiscipline: "mechanical", interfaceTopic: "MOTOR_REQUIREMENTS", counterpartId: "mech-1", counterpartRevision: "rev-mech", counterpartFingerprint: "fp-mech" });
    const r9 = createD7R9Store(r8);
    const governed = { tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a", citedCurrentness: "CURRENT", citedLifecycleStage: "FEED", applicability: "Applies only to feeder-1", limitations: "Review does not validate the feeder", provenanceRef: "prov-review-feeder", sourceBasisRef: "basis-review-feeder" };
    const feederReviewPin = { ...governed, contextId: "ctx-1", objectId: feeder.objectId, objectRevisionFingerprint: feeder.fingerprint, subjectKind: "FEEDER", subjectId: feederContext.feederRecordId, subjectRevision: feederContext.provenanceRef, subjectFingerprint: feederContext.fingerprint };
    const feederRequest = recordElectricalReviewRequest(r9, who, { ...feederReviewPin, reviewRequestId: "rev-feeder", reviewType: "ELECTRICAL_SUBJECT_REVIEW", reviewScope: "Electrical feeder review scope", requestedReviewerAuthority: "REVIEWER" });
    const finding = recordElectricalReviewFinding(r9, reviewer, { ...feederReviewPin, findingId: "find-feeder", reviewRequestId: feederRequest.reviewRequestId, findingCategory: "OBSERVATION", severity: "REVIEW_CANDIDATE", findingText: "Supplied feeder basis needs a reviewer note", disposition: "OPEN" });
    const completion = recordElectricalReviewCompletion(r9, reviewer, { ...feederReviewPin, completionId: "comp-feeder", reviewRequestId: feederRequest.reviewRequestId });
    const validated = recordElectricalValidationState(r9, validator, { ...feederReviewPin, validationId: "val-feeder", validationScope: "Feeder context validation", validationState: "VALIDATED", reviewRequestId: feederRequest.reviewRequestId, basis: [{ kind: "R4_FEEDER", id: feederContext.feederRecordId, fingerprint: feederContext.fingerprint }] });
    const thread = createD7R10Store(r9);
    const end = (subjectKind: string, subjectId: string, subjectRevision: string, subjectFingerprint: string) => ({ subjectKind, subjectId, subjectRevision, subjectFingerprint });
    recordElectricalLineage(thread, who, { contextId: "ctx-1", relationshipType: "OBJECT_REFERENCE", citedCurrentness: "CURRENT", provenanceRef: "prov-lineage", tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a", lineageId: "lin-feeder-evidence", source: end("FEEDER", feederContext.feederRecordId, feederContext.provenanceRef, feederContext.fingerprint), target: end("EVIDENCE", protectionEvidence.evidenceId, protectionEvidence.provenanceRef, protectionEvidence.fingerprint), electricalDependency: "R5_EVIDENCE" });
    recordElectricalCurrentness(thread, who, { eventId: "cur-evidence", contextId: "ctx-1", subject: end("EVIDENCE", protectionEvidence.evidenceId, protectionEvidence.provenanceRef, protectionEvidence.fingerprint), currentness: "STALE", provenanceRef: "prov-stale-evidence", tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a" });
    recordElectricalCurrentness(thread, who, { eventId: "cur-area", contextId: "ctx-1", subject: end("OBJECT", areaObject.objectId, areaObject.provenanceRef, areaObject.fingerprint), currentness: "SUPERSEDED", provenanceRef: "prov-superseded-area", tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a" });
    const source = createD7R11Store(thread);
    const contractInput = { contractId: "src-feeder", contextId: "ctx-1", objectId: feeder.objectId, sourceRevision: feeder.provenanceRef, citedCurrentness: "CURRENT", provenanceRef: "prov-d7-r11", tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a" };
    const contract = recordElectricalSourceContract(source, who, contractInput);
    const replay = recordElectricalSourceContract(source, who, { ...contractInput, assertedFingerprint: contract.fingerprint });
    const loadContract = recordElectricalSourceContract(source, who, { ...contractInput, contractId: "src-load", objectId: load.objectId, sourceRevision: load.provenanceRef, provenanceRef: "prov-d7-r11-load" });
    const deviceContract = recordElectricalSourceContract(source, who, { ...contractInput, contractId: "src-device", objectId: deviceObject.objectId, sourceRevision: deviceObject.provenanceRef, provenanceRef: "prov-d7-r11-device" });
    const sourceContract = recordElectricalSourceContract(source, who, { ...contractInput, contractId: "src-source", objectId: sourceObject.objectId, sourceRevision: sourceObject.provenanceRef, provenanceRef: "prov-d7-r11-source" });
    const busContract = recordElectricalSourceContract(source, who, { ...contractInput, contractId: "src-bus", objectId: bus.objectId, sourceRevision: bus.provenanceRef, provenanceRef: "prov-d7-r11-bus" });
    const systemContract = recordElectricalSourceContract(source, who, { ...contractInput, contractId: "src-system", objectId: system.objectId, sourceRevision: system.provenanceRef, provenanceRef: "prov-d7-r11-system" });
    const cableContract = recordElectricalSourceContract(source, who, { ...contractInput, contractId: "src-cable", objectId: cable.objectId, sourceRevision: cable.provenanceRef, provenanceRef: "prov-d7-r11-cable" });
    const ratingContract = recordElectricalSourceContract(source, who, { ...contractInput, contractId: "src-rating", objectId: ratingObject.objectId, sourceRevision: ratingObject.provenanceRef, provenanceRef: "prov-d7-r11-rating" });
    const groundContract = recordElectricalSourceContract(source, who, { ...contractInput, contractId: "src-ground", objectId: groundObject.objectId, sourceRevision: groundObject.provenanceRef, provenanceRef: "prov-d7-r11-ground" });
    const areaContract = recordElectricalSourceContract(source, who, { ...contractInput, contractId: "src-area", objectId: areaObject.objectId, sourceRevision: areaObject.provenanceRef, citedCurrentness: "SUPERSEDED", provenanceRef: "prov-d7-r11-area" });
    const feederFields = contract.fields as {
      IDENTITY: { objectType: string; exactRevision: string; sourceBasisRef: string; validatedDesign: boolean; discipline: string };
      FEEDER_CABLE_OR_RATING: { feeders: { validatedFeederDesign: boolean }[]; cables: { cableRecordId?: string; validatedCableSizing: boolean; associatedFeederRevisionFingerprint: string }[]; ratings: unknown[] };
      REQUIREMENTS: { adopted: boolean; requirementRole: string; sourceRevision: string }[];
      ASSUMPTIONS: { validatedFact: boolean }[];
      ENGINEERING_DECISIONS: { approved: boolean; d9Decision: boolean }[];
      INTERFACES: { interfaceAccepted: boolean; counterpartTruth: boolean; counterpartValidated: boolean; counterpartApproved: boolean; counterpart: { sourceRevision: string; fingerprint: string } | null }[];
      REVIEW_VALIDATION: { reviews: { reviewCompleted: boolean; validated: boolean }[]; findings: { disposition: string; closedEqualsValidated: boolean }[]; completions: { reviewCompleted: boolean; validated: boolean }[]; validations: { validationState: string; approved: boolean; certified: boolean; conformant: boolean; regulatoryApproved: boolean; engineeringValidated: boolean }[]; reviewCompletedEqualsValidated: boolean };
      EVIDENCE: unknown[];
      LINEAGE: { inferred: boolean; sourceRevision: string; targetRevision: string }[];
      CURRENTNESS: { state: string; currentEqualsValidated: boolean };
      PROVENANCE: string;
      LIMITATIONS: string[];
      APPLICABILITY: string[];
      AUTHORITY: { transferred: boolean; d9: boolean };
      FINGERPRINT: string;
    };
    const loadFields = loadContract.fields as { LOAD_CONSUMER_OR_EQUIPMENT: { loads: { suppliedValue: string; adopted: boolean; calculated: boolean; validatedLoad: boolean; currentness: string }[]; calculated: boolean }; CURRENTNESS: { reassessments: { state: string; designInvalid: boolean; validated: boolean }[] } };
    const deviceFields = deviceContract.fields as { EVIDENCE: { currentness: string; eosCalculated: boolean; calculatedByD9: boolean; engineeringValidation: boolean; results: { value: string }[] }[]; PROTECTION_GROUNDING_OR_HAZARDOUS_AREA: { settings: { suppliedValue: string; validatedSetting: boolean; coordinationValidated: boolean }[]; protection: { validatedProtectionDesign: boolean }[] } };
    const beforeContracts = source.contracts.length;

    expect(replay).toBe(contract);
    expect(contract.readOnly).toBe(true);
    expect(contract.d9Started).toBe(false);
    expect(contract.engineeringFactCreated).toBe(false);
    expect(contract.exactRevision).toBe(feeder.provenanceRef);
    expect(contract.currentness).toBe("CURRENT");
    expect(contract.authorityTransferred).toBe(false);
    expect(feederFields.IDENTITY.objectType).toBe("ELECTRICAL_FEEDER");
    expect((D7_ELECTRICAL_OBJECT_TYPES as readonly string[]).includes(feederFields.IDENTITY.objectType)).toBe(true);
    expect(feederFields.IDENTITY.validatedDesign).toBe(false);
    expect(feederFields.IDENTITY.sourceBasisRef).toBe(feeder.sourceBasisRef);
    expect(feederFields.IDENTITY.discipline).toBe("ELECTRICAL");
    expect(feederFields.FEEDER_CABLE_OR_RATING.feeders[0]?.validatedFeederDesign).toBe(false);
    expect(feederFields.FEEDER_CABLE_OR_RATING.cables[0]?.associatedFeederRevisionFingerprint).toBe(feederContext.fingerprint);
    expect(feederFields.FEEDER_CABLE_OR_RATING.cables[0]?.validatedCableSizing).toBe(false);
    expect(feederFields.REQUIREMENTS[0]?.adopted).toBe(false);
    expect(feederFields.REQUIREMENTS[0]?.requirementRole).toBe("SOURCE_REQUIREMENT");
    expect(feederFields.REQUIREMENTS[0]?.sourceRevision).toBe(requirement.sourceRevision);
    expect(feederFields.ASSUMPTIONS[0]?.validatedFact).toBe(false);
    expect(feederFields.ENGINEERING_DECISIONS[0]?.approved).toBe(false);
    expect(feederFields.ENGINEERING_DECISIONS[0]?.d9Decision).toBe(false);
    expect(feederFields.INTERFACES[0]?.interfaceAccepted).toBe(true);
    expect(feederFields.INTERFACES[0]?.counterpartTruth).toBe(false);
    expect(feederFields.INTERFACES[0]?.counterpartValidated).toBe(false);
    expect(feederFields.INTERFACES[0]?.counterpartApproved).toBe(false);
    expect(feederFields.INTERFACES[0]?.counterpart?.sourceRevision).toBe("rev-mech");
    expect(feederFields.INTERFACES[0]?.counterpart?.fingerprint).toBe("fp-mech");
    expect(feederFields.REVIEW_VALIDATION.reviews[0]?.reviewCompleted).toBe(false);
    expect(feederFields.REVIEW_VALIDATION.reviews[0]?.validated).toBe(false);
    expect(feederFields.REVIEW_VALIDATION.findings[0]?.disposition).toBe("OPEN");
    expect(feederFields.REVIEW_VALIDATION.findings[0]?.closedEqualsValidated).toBe(false);
    expect(feederFields.REVIEW_VALIDATION.completions[0]?.reviewCompleted).toBe(true);
    expect(feederFields.REVIEW_VALIDATION.completions[0]?.validated).toBe(false);
    expect(feederFields.REVIEW_VALIDATION.validations[0]?.validationState).toBe("VALIDATED");
    expect(feederFields.REVIEW_VALIDATION.validations[0]?.approved).toBe(false);
    expect(feederFields.REVIEW_VALIDATION.validations[0]?.certified).toBe(false);
    expect(feederFields.REVIEW_VALIDATION.validations[0]?.conformant).toBe(false);
    expect(feederFields.REVIEW_VALIDATION.validations[0]?.regulatoryApproved).toBe(false);
    expect(feederFields.REVIEW_VALIDATION.reviewCompletedEqualsValidated).toBe(false);
    expect(feederFields.LINEAGE[0]?.inferred).toBe(false);
    expect(feederFields.LINEAGE[0]?.sourceRevision).toBe(feederContext.provenanceRef);
    expect(feederFields.LINEAGE[0]?.targetRevision).toBe(protectionEvidence.provenanceRef);
    expect(feederFields.CURRENTNESS.state).toBe("CURRENT");
    expect(feederFields.CURRENTNESS.currentEqualsValidated).toBe(false);
    expect(feederFields.PROVENANCE).toBe("prov-d7-r11");
    expect(feederFields.APPLICABILITY).toContain("feeder-1");
    expect(feederFields.LIMITATIONS.length).toBeGreaterThan(0);
    expect(feederFields.AUTHORITY.transferred).toBe(false);
    expect(feederFields.AUTHORITY.d9).toBe(false);
    expect(feederFields.FINGERPRINT).toBe(contract.fingerprint);
    expect(loadFields.LOAD_CONSUMER_OR_EQUIPMENT.loads[0]?.suppliedValue).toBe("250");
    expect(loadFields.LOAD_CONSUMER_OR_EQUIPMENT.loads[0]?.adopted).toBe(false);
    expect(loadFields.LOAD_CONSUMER_OR_EQUIPMENT.loads[0]?.calculated).toBe(false);
    expect(loadFields.LOAD_CONSUMER_OR_EQUIPMENT.loads[0]?.validatedLoad).toBe(false);
    expect(loadFields.LOAD_CONSUMER_OR_EQUIPMENT.loads[0]?.currentness).toBe("REASSESSMENT_REQUIRED");
    expect(loadFields.LOAD_CONSUMER_OR_EQUIPMENT.calculated).toBe(false);
    expect(loadFields.CURRENTNESS.reassessments[0]?.state).toBe("REASSESSMENT_REQUIRED");
    expect(loadFields.CURRENTNESS.reassessments[0]?.designInvalid).toBe(false);
    expect(loadFields.CURRENTNESS.reassessments[0]?.validated).toBe(false);
    expect(deviceFields.EVIDENCE[0]?.currentness).toBe("STALE");
    expect(deviceFields.EVIDENCE[0]?.eosCalculated).toBe(false);
    expect(deviceFields.EVIDENCE[0]?.calculatedByD9).toBe(false);
    expect(deviceFields.EVIDENCE[0]?.engineeringValidation).toBe(false);
    expect(deviceFields.EVIDENCE[0]?.results[0]?.value).toBe("12");
    expect(deviceFields.PROTECTION_GROUNDING_OR_HAZARDOUS_AREA.settings[0]?.suppliedValue).toBe("800");
    expect(deviceFields.PROTECTION_GROUNDING_OR_HAZARDOUS_AREA.settings[0]?.validatedSetting).toBe(false);
    expect(deviceFields.PROTECTION_GROUNDING_OR_HAZARDOUS_AREA.settings[0]?.coordinationValidated).toBe(false);
    expect(deviceFields.PROTECTION_GROUNDING_OR_HAZARDOUS_AREA.protection[0]?.validatedProtectionDesign).toBe(false);
    expect((sourceContract.fields as { SYSTEM_SOURCE_OR_DISTRIBUTION: { sources: { capacityValidated: boolean; loadFlowResult: boolean }[] } }).SYSTEM_SOURCE_OR_DISTRIBUTION.sources[0]?.capacityValidated).toBe(false);
    expect((busContract.fields as { SYSTEM_SOURCE_OR_DISTRIBUTION: { distributions: { shortCircuitValidated: boolean; validatedNetworkDesign: boolean }[] } }).SYSTEM_SOURCE_OR_DISTRIBUTION.distributions[0]?.validatedNetworkDesign).toBe(false);
    expect((systemContract.fields as { SYSTEM_SOURCE_OR_DISTRIBUTION: { systems: { subjectId: string; loadFlowResult: boolean }[] } }).SYSTEM_SOURCE_OR_DISTRIBUTION.systems[0]?.subjectId).toBe(systemContext.systemRecordId);
    expect((cableContract.fields as { FEEDER_CABLE_OR_RATING: { cables: { subjectId: string; validatedCableSizing: boolean }[] } }).FEEDER_CABLE_OR_RATING.cables[0]?.subjectId).toBe(cableContext.cableRecordId);
    expect((ratingContract.fields as { FEEDER_CABLE_OR_RATING: { ratings: { suppliedValue: string; adopted: boolean; validatedRating: boolean }[] } }).FEEDER_CABLE_OR_RATING.ratings[0]?.suppliedValue).toBe("400");
    expect((ratingContract.fields as { FEEDER_CABLE_OR_RATING: { ratings: { validatedRating: boolean }[] } }).FEEDER_CABLE_OR_RATING.ratings[0]?.validatedRating).toBe(false);
    expect((groundContract.fields as { PROTECTION_GROUNDING_OR_HAZARDOUS_AREA: { grounding: { validatedGroundingDesign: boolean; codeConformance: boolean }[] } }).PROTECTION_GROUNDING_OR_HAZARDOUS_AREA.grounding[0]?.validatedGroundingDesign).toBe(false);
    expect(areaContract.currentness).toBe("SUPERSEDED");
    expect((areaContract.fields as { PROTECTION_GROUNDING_OR_HAZARDOUS_AREA: { hazardousAreas: { validatedClassification: boolean; classifiedByD9: boolean; classificationSourceRevision: string }[] } }).PROTECTION_GROUNDING_OR_HAZARDOUS_AREA.hazardousAreas[0]?.classificationSourceRevision).toBe("rev-3");
    expect((areaContract.fields as { PROTECTION_GROUNDING_OR_HAZARDOUS_AREA: { hazardousAreas: { validatedClassification: boolean; classifiedByD9: boolean }[] } }).PROTECTION_GROUNDING_OR_HAZARDOUS_AREA.hazardousAreas[0]?.classifiedByD9).toBe(false);
    expect(feeder.fingerprint).toBe(identityFingerprint);
    expect(suppliedLoad.suppliedValue).toBe("250");
    expect(suppliedSetting.validatedSetting).toBe(false);
    expect(protectionEvidence.eosCalculated).toBe(false);
    expect(protectionEvidence.currentness).toBe("CURRENT");
    expect(area.validatedClassification).toBe(false);
    expect(areaObject.currentness).toBe("CURRENT");
    expect(grounding.validatedGroundingDesign).toBe(false);
    expect(device.validatedProtectionDesign).toBe(false);
    expect(assumption.validatedFact).toBe(false);
    expect(decision.decisionId).toBe("dec-1");
    expect(handoff.counterpart?.fingerprint).toBe("fp-mech");
    expect(finding.disposition).toBe("OPEN");
    expect(completion.reviewCompleted).toBe(true);
    expect(feederRequest.reviewCompleted).toBe(false);
    expect(validated.approved).toBe(false);
    expect(rating.validatedRating).toBe(false);
    expect(sourceContext.capacityValidated).toBe(false);
    expect(busContext.shortCircuitValidated).toBe(false);
    expect(reassessment.state).toBe("REASSESSMENT_REQUIRED");
    expect(source.history.some((row) => row.contractId === contract.contractId)).toBe(true);

    expect(() => createD7R11Store(createD7R10Store(createD7R9Store(createD7R8Store(createD7R7Store(createD7R1Store(), r6), counterparts))))).toThrow(/R1_R6_STORE_MISMATCH/);
    expect(() => recordElectricalSourceContract(source, who, { ...contractInput, contractId: "src-dup" })).toThrow(/DUPLICATE_SOURCE_CONTRACT_REJECTED/);
    expect(() => recordElectricalSourceContract(source, who, { ...contractInput, contractId: "src-spoof", assertedFingerprint: "spoof" })).toThrow(/FINGERPRINT_MISMATCH/);
    expect(source.contracts.length).toBe(beforeContracts);
    expect(() => recordElectricalSourceContract(source, who, { ...contractInput, contractId: "src-float", sourceRevision: "latest" })).toThrow(/SUBJECT_REVISION_REQUIRED/);
    expect(() => recordElectricalSourceContract(source, who, { ...contractInput, contractId: "src-area-current", objectId: areaObject.objectId, sourceRevision: areaObject.provenanceRef, citedCurrentness: "CURRENT" })).toThrow(/SUPERSEDED_EXPOSED_AS_CURRENT/);
    expect(() => recordElectricalSourceContract(source, who, { ...contractInput, contractId: "src-type", claimedObjectType: "freeform-panel" })).toThrow(/OBJECT_TYPE_SPOOFING_REJECTED/);
    expect(() => recordElectricalSourceContract(source, who, { ...contractInput, contractId: "src-discipline", claimedDiscipline: "mechanical" })).toThrow(/DISCIPLINE_SPOOFING_REJECTED/);
    expect(() => recordElectricalSourceContract(source, who, { ...contractInput, contractId: "src-tenant", tenantId: "tenant-b" })).toThrow(/CROSS_TENANT_OPERATION/);
    expect(() => recordElectricalSourceContract(source, actor({ actorId: "AI_ASSISTANT", authority: "AI_ASSISTANT" }), { ...contractInput, contractId: "src-ai" })).toThrow(/AI_CANNOT_INVENT_SOURCE_FACT/);
    expect(() => recordElectricalSourceContract(source, actor({ authority: "ADMIN" }), { ...contractInput, contractId: "src-admin", approve: true })).toThrow(/ADMIN_CANNOT_OVERRIDE_AUTHORITY/);
    expect(() => recordElectricalSourceContract(source, who, { ...contractInput, contractId: "src-infer", infer: true })).toThrow(/INFERRED_LINEAGE_REJECTED/);
    expect(() => recordElectricalSourceContract(source, who, { ...contractInput, contractId: "src-derive", derive: true })).toThrow(/DERIVATION_NOT_IN_R11/);
    expect(() => recordElectricalSourceContract(source, who, { ...contractInput, contractId: "src-req", createRequirement: true })).toThrow(/REQUIREMENT_GENERATION_NOT_IN_R11/);
    expect(() => recordElectricalSourceContract(source, who, { ...contractInput, contractId: "src-recommend", recommend: true })).toThrow(/RECOMMENDATION_NOT_IN_R11/);
    expect(() => recordElectricalSourceContract(source, who, { ...contractInput, contractId: "src-d9", d9Reasoning: true })).toThrow(/D9_NOT_STARTED/);
    expect(() => recordElectricalSourceContract(source, who, { ...contractInput, contractId: "src-mutate", mutateUpstream: true })).toThrow(/UPSTREAM_MUTATION_REJECTED/);
    expect(() => inferElectricalSourceLineage()).toThrow(/INFERRED_LINEAGE_REJECTED/);
    expect(() => deriveElectricalSourceValue()).toThrow(/DERIVATION_NOT_IN_R11/);
    expect(() => calculateElectricalFromSource()).toThrow(/CALCULATION_NOT_IN_R11/);
    expect(() => startD9FromElectricalSource()).toThrow(/D9_NOT_STARTED/);
    expect(suppliedLoad.suppliedValue).toBe("250");
    expect(feeder.fingerprint).toBe(identityFingerprint);
    expect(handoff.counterpart?.sourceRevision).toBe("rev-mech");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D7.R11.D9_SOURCE_CONTRACT")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D7.R12.ELECTRICAL_BOUNDED_CLOSEOUT")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    const sourceText = readFileSync(join(here, "d9-source-contract.ts"), "utf8");
    expect(sourceText).toMatch(/fingerprintCanonical/);
    expect(sourceText).toMatch(/D7_D9_SOURCE_CONTRACT_FIELDS/);
    expect(sourceText).not.toMatch(/createHash|from ["']@rtb\/engineering-review["']|CREATE TABLE|eval\(|child_process|new Function/);
    expect(scanAnalysisFormulaBypass(join(here, "d9-source-contract.ts"), sourceText)).toEqual([]);
    const packageJson = JSON.parse(readFileSync(join(here, "../../package.json"), "utf8")) as { dependencies: Record<string, string> };
    expect(Object.keys(packageJson.dependencies).sort()).toEqual(["@rtb/database", "@rtb/engineering-review", "@rtb/platform-commerce", "@rtb/platform-intelligence", "@rtb/platform-kernel", "@rtb/types", "docx", "exceljs", "pptxgenjs", "zod"]);
  });
});
