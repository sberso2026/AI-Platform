import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { D7_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT as ARCHITECTURE_THREAD_COUNT, D7_RUNTIME_COUNT as ARCHITECTURE_RUNTIME_COUNT } from "@rtb/types";
import { describe, expect, it } from "vitest";
import { STRUCTURAL_CAPABILITY_MANIFEST } from "../structural-concrete/capability";
import { scanAnalysisFormulaBypass } from "../structural-systems/formula-scan";
import { createD7R5Store, recordElectricalCalculationEvidence } from "./calculation-evidence";
import {
  CURRENT_D7_RECORD_EQUALS_VALIDATED,
  D7_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT,
  D7_CURRENTNESS_DIGITAL_THREAD_RUNTIME_READY,
  D7_R10_FINGERPRINT_MISMATCH_AUTO_REPAIRED,
  D7_R10_INFERRED_THREAD_RELATIONSHIP_ALLOWED,
  D7_R10_R1_IDENTITY_CURRENTNESS_INTEGRATED,
  D7_R10_R9_VALIDATION_CURRENTNESS_INTEGRATED,
  D7_R10_REVIEW_STATE_AUTO_TRANSFER_ALLOWED,
  D7_R11_CANONICAL_PHASE,
  D7_R11_STARTED,
  D7_RUNTIME_COUNT,
  D8_RUNTIME_STARTED,
  D9_RUNTIME_COUNT,
  D9_RUNTIME_STARTED,
  STALE_D7_RECORD_EQUALS_INVALID,
  SUPERSEDED_D7_RECORD_EQUALS_INVALID,
  approveFromElectricalCurrentness,
  createD7R10Store,
  currentElectricalThreadPins,
  exposedElectricalCurrentness,
  inferElectricalLineage,
  recalculateFromElectricalCurrentness,
  recordElectricalCurrentness,
  recordElectricalLineage,
  recordElectricalSupersession,
  repairElectricalFingerprint,
  repointElectricalDigitalThread,
  revalidateFromElectricalCurrentness,
  traceElectricalDigitalThread,
  transferElectricalReviewFromCurrentness,
  transferElectricalValidationFromCurrentness,
} from "./currentness-digital-thread";
import { createD7R8Store, recordElectricalInterfaceHandoff } from "./discipline-interfaces-handoffs";
import { createD7R4Store, recordElectricalFeederContext } from "./feeder-cable-rating-context";
import { D7_CONTEXT_AUTHORITY, createD7R1Store, recordElectricalContext, recordElectricalObjectIdentity, type D7R1Actor } from "./identity-foundation";
import { createD7R3Store, recordElectricalLoadContext } from "./load-consumer-equipment-context";
import { createD7R6Store, recordElectricalGroundingContext, recordElectricalHazardousAreaContext, recordElectricalProtectionDeviceContext, recordElectricalProtectionSetting } from "./protection-grounding-hazardous-area-context";
import { createD7R7Store, recordElectricalAssumption, recordElectricalChange, recordElectricalEngineeringDecision, recordElectricalReassessment, recordElectricalSourceRequirement } from "./requirements-assumptions-change";
import { D7_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT as R9_THREAD_COUNT, D7_R10_STARTED, D7_RUNTIME_COUNT as R9_RUNTIME_COUNT, createD7R9Store, recordElectricalReviewCompletion, recordElectricalReviewRequest, recordElectricalValidationState } from "./review-validation-governance";
import { createD7R2Store, recordElectricalSystemContext } from "./system-source-distribution-context";

const here = dirname(fileURLToPath(import.meta.url));

function actor(overrides: Partial<D7R1Actor> = {}): D7R1Actor {
  return { actorId: "elec-recorder", tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a", authority: D7_CONTEXT_AUTHORITY, ...overrides };
}

describe("EOS-D7-R10 currentness and digital thread", () => {
  it("integrates exact Electrical revisions without rewriting history or transferring validation", () => {
    expect(ARCHITECTURE_RUNTIME_COUNT).toBe(0);
    expect(ARCHITECTURE_THREAD_COUNT).toBe(0);
    expect(R9_RUNTIME_COUNT).toBe(9);
    expect(R9_THREAD_COUNT).toBe(0);
    expect(D7_R10_STARTED).toBe(false);
    expect(D7_RUNTIME_COUNT).toBe(10);
    expect(D7_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT).toBe(1);
    expect(D7_CURRENTNESS_DIGITAL_THREAD_RUNTIME_READY).toBe(true);
    expect(D7_R11_STARTED).toBe(false);
    expect(D7_R11_CANONICAL_PHASE).toBe("EOS-D7-R11-D9-SOURCE-CONTRACT");
    expect(CURRENT_D7_RECORD_EQUALS_VALIDATED).toBe(false);
    expect(STALE_D7_RECORD_EQUALS_INVALID).toBe(false);
    expect(SUPERSEDED_D7_RECORD_EQUALS_INVALID).toBe(false);
    expect(D7_R10_INFERRED_THREAD_RELATIONSHIP_ALLOWED).toBe(false);
    expect(D7_R10_FINGERPRINT_MISMATCH_AUTO_REPAIRED).toBe(false);
    expect(D7_R10_REVIEW_STATE_AUTO_TRANSFER_ALLOWED).toBe(false);
    expect(D7_R10_R1_IDENTITY_CURRENTNESS_INTEGRATED).toBe(true);
    expect(D7_R10_R9_VALIDATION_CURRENTNESS_INTEGRATED).toBe(true);
    expect(D8_RUNTIME_STARTED).toBe(false);
    expect(D9_RUNTIME_STARTED).toBe(false);
    expect(D9_RUNTIME_COUNT).toBe(0);

    const r1 = createD7R1Store();
    const who = actor();
    const reviewer = { ...actor({ actorId: "elec-reviewer", authority: "REVIEWER" }), actorKind: "human" as const, aal: "aal2" };
    const validator = { ...actor({ actorId: "elec-validator", authority: "ELECTRICAL_VALIDATION_AUTHORITY" }), actorKind: "human" as const, aal: "aal2" };
    const context = recordElectricalContext(r1, who, { contextId: "ctx-1", citedLifecycleStage: "FEED", provenanceRef: "prov-ctx", sourceBasisRef: "basis-ctx" });
    const load = recordElectricalObjectIdentity(r1, who, { objectId: "load-1", contextId: "ctx-1", objectType: "ELECTRICAL_LOAD", citedLifecycleStage: "FEED", provenanceRef: "prov-load-1", sourceBasisRef: "basis-load-1" });
    const system = recordElectricalObjectIdentity(r1, who, { objectId: "sys-1", contextId: "ctx-1", objectType: "ELECTRICAL_SYSTEM", citedLifecycleStage: "FEED", provenanceRef: "prov-sys-1", sourceBasisRef: "basis-sys-1" });
    const feeder = recordElectricalObjectIdentity(r1, who, { objectId: "feeder-1", contextId: "ctx-1", objectType: "ELECTRICAL_FEEDER", citedLifecycleStage: "FEED", provenanceRef: "prov-feeder-1", sourceBasisRef: "basis-feeder-1" });
    const deviceObject = recordElectricalObjectIdentity(r1, who, { objectId: "device-1", contextId: "ctx-1", objectType: "ELECTRICAL_PROTECTION_CONTEXT", citedLifecycleStage: "FEED", provenanceRef: "prov-device-1", sourceBasisRef: "basis-device-1" });
    const evidenceObject = recordElectricalObjectIdentity(r1, who, { objectId: "evidence-1", contextId: "ctx-1", objectType: "ELECTRICAL_CALCULATION_EVIDENCE", citedLifecycleStage: "FEED", provenanceRef: "prov-evidence-1", sourceBasisRef: "basis-evidence-1" });
    const groundObject = recordElectricalObjectIdentity(r1, who, { objectId: "ground-1", contextId: "ctx-1", objectType: "ELECTRICAL_GROUNDING_CONTEXT", citedLifecycleStage: "FEED", provenanceRef: "prov-ground-1", sourceBasisRef: "basis-ground-1" });
    const areaObject = recordElectricalObjectIdentity(r1, who, { objectId: "area-1", contextId: "ctx-1", objectType: "ELECTRICAL_HAZARDOUS_AREA_CONTEXT", citedLifecycleStage: "FEED", provenanceRef: "prov-area-1", sourceBasisRef: "basis-area-1" });
    const identityFingerprint = load.fingerprint;
    const r2 = createD7R2Store(r1);
    const bound = (objectId: string, fingerprint: string) => ({ contextId: "ctx-1", objectId, objectRevisionFingerprint: fingerprint, citedLifecycleStage: "FEED", citedCurrentness: "CURRENT", provenanceRef: `prov-${objectId}`, sourceBasisRef: `basis-${objectId}`, applicability: `Applies only to ${objectId}`, limitations: `Context only for ${objectId}` });
    const systemContext = recordElectricalSystemContext(r2, who, { ...bound(system.objectId, system.fingerprint), systemRecordId: "sys-rec", systemRole: "DISTRIBUTION_SYSTEM", nominalClassification: "MEDIUM_VOLTAGE_CLASS" });
    const r3 = createD7R3Store(r1, r2);
    const suppliedLoad = recordElectricalLoadContext(r3, who, { ...bound(load.objectId, load.fingerprint), caseName: "NORMAL_CASE", duty: "CONTINUOUS", availability: "REQUIRED", applicability: "Applies only to load-1 in NORMAL_CASE", limitations: "Supplied value is not a calculation", loadRecordId: "load-supplied", statementRole: "SUPPLIED_LOAD_REQUIREMENT", suppliedValue: "250", unit: "kW" });
    const r4 = createD7R4Store(r1, r2, r3);
    const feederContext = recordElectricalFeederContext(r4, who, { ...bound(feeder.objectId, feeder.fingerprint), feederRecordId: "feeder-rec", feederRole: "DISTRIBUTION_FEEDER" });
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
    const settingReviewPin = { ...governed, contextId: "ctx-1", objectId: deviceObject.objectId, objectRevisionFingerprint: deviceObject.fingerprint, subjectKind: "SETTING", subjectId: suppliedSetting.settingRecordId, subjectRevision: suppliedSetting.provenanceRef, subjectFingerprint: suppliedSetting.fingerprint, applicability: "Applies only to device-1", limitations: "A setting record is not a validated protection design", provenanceRef: "prov-review-setting", sourceBasisRef: "basis-review-setting" };
    const feederRequest = recordElectricalReviewRequest(r9, who, { ...feederReviewPin, reviewRequestId: "rev-feeder", reviewType: "ELECTRICAL_SUBJECT_REVIEW", reviewScope: "Electrical feeder review scope", requestedReviewerAuthority: "REVIEWER" });
    const settingRequest = recordElectricalReviewRequest(r9, who, { ...settingReviewPin, reviewRequestId: "rev-setting", reviewType: "ELECTRICAL_SUBJECT_REVIEW", reviewScope: "Protection setting review scope", requestedReviewerAuthority: "REVIEWER" });
    recordElectricalReviewCompletion(r9, reviewer, { ...feederReviewPin, completionId: "comp-feeder", reviewRequestId: feederRequest.reviewRequestId });
    const validated = recordElectricalValidationState(r9, validator, { ...feederReviewPin, validationId: "val-feeder", validationScope: "Feeder context validation", validationState: "VALIDATED", reviewRequestId: feederRequest.reviewRequestId, basis: [{ kind: "R4_FEEDER", id: feederContext.feederRecordId, fingerprint: feederContext.fingerprint }] });
    const store = createD7R10Store(r9);
    const end = (subjectKind: string, subjectId: string, subjectRevision: string, subjectFingerprint: string) => ({ subjectKind, subjectId, subjectRevision, subjectFingerprint });
    const feederEnd = end("FEEDER", feederContext.feederRecordId, feederContext.provenanceRef, feederContext.fingerprint);
    const evidenceEnd = end("EVIDENCE", protectionEvidence.evidenceId, protectionEvidence.provenanceRef, protectionEvidence.fingerprint);
    const settingEnd = end("SETTING", suppliedSetting.settingRecordId, suppliedSetting.provenanceRef, suppliedSetting.fingerprint);
    const groundingEnd = end("GROUNDING", grounding.groundingRecordId, grounding.provenanceRef, grounding.fingerprint);
    const areaEnd = end("HAZARDOUS_AREA", area.areaRecordId, area.provenanceRef, area.fingerprint);
    const requirementEnd = end("REQUIREMENT", requirement.requirementId, requirement.provenanceRef, requirement.fingerprint);
    const handoffEnd = end("HANDOFF", handoff.handoffId, handoff.provenanceRef, handoff.fingerprint);
    const validationEnd = end("VALIDATION", validated.validationId, validated.subjectRevision, validated.fingerprint);
    const feederReviewEnd = end("REVIEW_REQUEST", feederRequest.reviewRequestId, feederRequest.subjectRevision, feederRequest.fingerprint);
    const settingReviewEnd = end("REVIEW_REQUEST", settingRequest.reviewRequestId, settingRequest.subjectRevision, settingRequest.fingerprint);
    const loadEnd = end("LOAD", suppliedLoad.loadRecordId, suppliedLoad.provenanceRef, suppliedLoad.fingerprint);
    const edge = { contextId: "ctx-1", relationshipType: "OBJECT_REFERENCE", citedCurrentness: "CURRENT", provenanceRef: "prov-lineage", tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a" };
    const lineage = recordElectricalLineage(store, who, { ...edge, lineageId: "lin-feeder-evidence", source: feederEnd, target: evidenceEnd, electricalDependency: "R5_EVIDENCE" });
    const replay = recordElectricalLineage(store, who, { ...edge, lineageId: "lin-feeder-evidence", source: feederEnd, target: evidenceEnd, electricalDependency: "R5_EVIDENCE", assertedFingerprint: lineage.fingerprint });
    recordElectricalLineage(store, who, { ...edge, lineageId: "lin-evidence-setting", source: evidenceEnd, target: settingEnd, provenanceRef: "prov-lineage-setting" });
    recordElectricalLineage(store, who, { ...edge, lineageId: "lin-ground", source: feederEnd, target: groundingEnd, provenanceRef: "prov-lineage-ground" });
    recordElectricalLineage(store, who, { ...edge, lineageId: "lin-area", source: feederEnd, target: areaEnd, provenanceRef: "prov-lineage-area" });
    recordElectricalLineage(store, who, { ...edge, lineageId: "lin-requirement", source: feederEnd, target: requirementEnd, provenanceRef: "prov-lineage-requirement" });
    recordElectricalLineage(store, who, { ...edge, lineageId: "lin-handoff", source: feederEnd, target: handoffEnd, provenanceRef: "prov-lineage-handoff" });
    recordElectricalLineage(store, who, { ...edge, lineageId: "lin-validation", source: feederEnd, target: validationEnd, provenanceRef: "prov-lineage-validation" });
    const trace = traceElectricalDigitalThread(store, who, { contextId: "ctx-1", subject: feederEnd, citedCurrentness: "CURRENT", tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a" });
    const beforeEdges = store.lineage.map((row) => `${row.source.subjectFingerprint}>${row.target.subjectFingerprint}`).join("|");
    const superseded = recordElectricalSupersession(store, who, { supersessionId: "sup-review", contextId: "ctx-1", predecessor: settingReviewEnd, successor: feederReviewEnd, citedCurrentness: "CURRENT", provenanceRef: "prov-supersession", tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a" });
    const staleHandoff = recordElectricalCurrentness(store, who, { eventId: "cur-handoff", contextId: "ctx-1", subject: handoffEnd, currentness: "STALE", provenanceRef: "prov-stale-handoff", tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a" });
    const staleValidation = recordElectricalCurrentness(store, who, { eventId: "cur-validation", contextId: "ctx-1", subject: validationEnd, currentness: "STALE", provenanceRef: "prov-stale-validation", tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a" });
    const staleEvidence = recordElectricalCurrentness(store, who, { eventId: "cur-evidence", contextId: "ctx-1", subject: evidenceEnd, currentness: "STALE", propagate: true, provenanceRef: "prov-stale-evidence", tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a" });
    const currentPins = currentElectricalThreadPins(store, who);
    const loadPin = { subjectKind: "LOAD" as const, subjectId: suppliedLoad.loadRecordId, subjectRevision: suppliedLoad.provenanceRef, subjectFingerprint: suppliedLoad.fingerprint, contextId: "ctx-1" };

    expect(replay).toBe(lineage);
    expect(lineage.engineeringValidated).toBe(false);
    expect(lineage.approved).toBe(false);
    expect(lineage.conformant).toBe(false);
    expect(lineage.certified).toBe(false);
    expect(trace.currentness).toBe("CURRENT");
    expect(trace.nodes.some((row) => row.subjectId === protectionEvidence.evidenceId)).toBe(true);
    expect(trace.nodes.some((row) => row.subjectId === suppliedSetting.settingRecordId)).toBe(true);
    expect(trace.edges.every((row) => row.relationshipType === "OBJECT_REFERENCE")).toBe(true);
    expect(exposedElectricalCurrentness(store, loadPin)).toBe("REASSESSMENT_REQUIRED");
    expect(currentPins.some((row) => row.subjectId === suppliedLoad.loadRecordId)).toBe(false);
    expect(currentPins.some((row) => row.subjectId === reassessment.reassessmentId && row.subjectKind === "REASSESSMENT")).toBe(false);
    expect(currentPins.some((row) => row.subjectKind === "SYSTEM" && row.subjectId === systemContext.systemRecordId)).toBe(true);
    expect(currentPins.some((row) => row.subjectKind === "OBJECT" && row.subjectId === load.objectId)).toBe(true);
    expect(currentPins.some((row) => row.subjectKind === "ASSUMPTION" && row.subjectId === assumption.assumptionId)).toBe(true);
    expect(currentPins.some((row) => row.subjectKind === "DECISION" && row.subjectId === decision.decisionId)).toBe(true);
    expect(currentPins.some((row) => row.subjectKind === "GROUNDING")).toBe(true);
    expect(currentPins.some((row) => row.subjectKind === "HAZARDOUS_AREA")).toBe(true);
    expect(currentPins.some((row) => row.subjectId === handoff.handoffId)).toBe(false);
    expect(currentPins.some((row) => row.subjectId === validated.validationId)).toBe(false);
    expect(currentPins.some((row) => row.subjectId === settingRequest.reviewRequestId)).toBe(false);
    expect(currentPins.some((row) => row.subjectId === feederRequest.reviewRequestId)).toBe(true);
    expect(currentPins.some((row) => row.subjectId === protectionEvidence.evidenceId)).toBe(false);
    expect(staleHandoff[0]?.currentness).toBe("STALE");
    expect(staleHandoff[0]?.engineeringValidated).toBe(false);
    expect(staleValidation[0]?.approved).toBe(false);
    expect(staleEvidence.length).toBeGreaterThan(1);
    expect(superseded.deleted).toBe(false);
    expect(superseded.priorRevisionInvalidated).toBe(false);
    expect(superseded.historicalEdgesRewritten).toBe(false);
    expect(store.lineage.map((row) => `${row.source.subjectFingerprint}>${row.target.subjectFingerprint}`).join("|")).toBe(beforeEdges);
    expect(handoff.currentness).toBe("CURRENT");
    expect(handoff.counterpart?.sourceRevision).toBe("rev-mech");
    expect(handoff.fingerprint).toBe(handoffEnd.subjectFingerprint);
    expect(validated.currentness).toBe("CURRENT");
    expect(validated.engineeringValidated).toBe(true);
    expect(validated.approved).toBe(false);
    expect(feederRequest.reviewCompleted).toBe(false);
    expect(settingRequest.subjectRevision).toBe(settingReviewEnd.subjectRevision);
    expect(suppliedLoad.suppliedValue).toBe("250");
    expect(suppliedSetting.validatedSetting).toBe(false);
    expect(suppliedSetting.calculated).toBe(false);
    expect(device.validatedProtectionDesign).toBe(false);
    expect(grounding.validatedGroundingDesign).toBe(false);
    expect(area.validatedClassification).toBe(false);
    expect(protectionEvidence.eosCalculated).toBe(false);
    expect(protectionEvidence.engineeringValidated).toBe(false);
    expect(assumption.validatedFact).toBe(false);
    expect(requirement.adopted).toBe(false);
    expect(decision.decisionId).toBe("dec-1");
    expect(load.fingerprint).toBe(identityFingerprint);
    expect(context.recordStatus).toBe("CURRENT");
    expect(store.history.some((row) => row.subjectId === lineage.lineageId)).toBe(true);

    expect(() => createD7R10Store(createD7R9Store(createD7R8Store(createD7R7Store(createD7R1Store(), r6), counterparts)))).toThrow(/R1_R6_STORE_MISMATCH/);
    expect(() => recordElectricalLineage(store, who, { ...edge, lineageId: "lin-missing-cable", source: feederEnd, target: end("CABLE", "cable-missing", "prov-cable", "fp-cable") })).toThrow(/SUBJECT_NOT_FOUND/);
    expect(() => recordElectricalLineage(store, who, { ...edge, lineageId: "lin-suitability", source: feederEnd, target: end("SUITABILITY", "suit-missing", "prov-suit", "fp-suit") })).toThrow(/SUBJECT_NOT_FOUND/);
    expect(() => recordElectricalLineage(store, who, { ...edge, lineageId: "lin-source", source: feederEnd, target: end("SOURCE", "source-missing", "prov-source", "fp-source") })).toThrow(/SUBJECT_NOT_FOUND/);
    expect(() => recordElectricalLineage(store, who, { ...edge, lineageId: "lin-load", source: loadEnd, target: feederEnd })).toThrow(/REASSESSMENT_EXPOSED_AS_CURRENT/);
    expect(() => recordElectricalLineage(store, who, { ...edge, lineageId: "lin-float", source: { ...feederEnd, subjectRevision: "latest" }, target: evidenceEnd })).toThrow(/SUBJECT_REVISION_REQUIRED/);
    expect(() => recordElectricalLineage(store, who, { ...edge, lineageId: "lin-infer", source: feederEnd, target: evidenceEnd, relationshipType: "semantic_similarity" })).toThrow(/INFERRED_LINEAGE_REJECTED/);
    expect(() => recordElectricalLineage(store, who, { ...edge, lineageId: "lin-spoof", source: feederEnd, target: groundingEnd, assertedFingerprint: "spoof" })).toThrow(/FINGERPRINT_MISMATCH/);
    expect(() => recordElectricalLineage(store, who, { ...edge, lineageId: "lin-dup", source: feederEnd, target: groundingEnd })).toThrow(/DUPLICATE_LINEAGE_REJECTED/);
    expect(() => recordElectricalLineage(store, who, { ...edge, lineageId: "lin-tenant", source: feederEnd, target: groundingEnd, tenantId: "tenant-b" })).toThrow(/CROSS_TENANT_OPERATION/);
    expect(() => recordElectricalLineage(store, actor({ actorId: "AI_ASSISTANT", authority: "AI_ASSISTANT" }), { ...edge, lineageId: "lin-ai", source: feederEnd, target: areaEnd })).toThrow(/AI_CANNOT_INVENT_LINEAGE/);
    expect(() => recordElectricalCurrentness(store, actor({ authority: "ADMIN" }), { eventId: "cur-admin", contextId: "ctx-1", subject: feederEnd, currentness: "CURRENT", provenanceRef: "prov-admin", overrideMismatch: true })).toThrow(/ADMIN_CANNOT_OVERRIDE/);
    expect(() => recordElectricalCurrentness(store, who, { eventId: "cur-promote", contextId: "ctx-1", subject: feederEnd, currentness: "CURRENT", provenanceRef: "prov-promote", promoteValidated: true })).toThrow(/CURRENT_NOT_VALIDATED/);
    expect(() => recordElectricalCurrentness(store, who, { eventId: "cur-back", contextId: "ctx-1", subject: validationEnd, currentness: "CURRENT", provenanceRef: "prov-back" })).toThrow(/STALE_EXPOSED_AS_CURRENT/);
    expect(() => recordElectricalSupersession(store, who, { supersessionId: "sup-transfer", contextId: "ctx-1", predecessor: validationEnd, successor: feederReviewEnd, citedCurrentness: "CURRENT", provenanceRef: "prov-transfer" })).toThrow(/SUPERSESSION_KIND_MISMATCH/);
    expect(() => repointElectricalDigitalThread()).toThrow(/AUTO_REPOINT_REJECTED/);
    expect(() => inferElectricalLineage()).toThrow(/INFERRED_LINEAGE_REJECTED/);
    expect(() => repairElectricalFingerprint()).toThrow(/FINGERPRINT_OVERRIDE_REJECTED/);
    expect(() => transferElectricalReviewFromCurrentness()).toThrow(/REVIEW_TRANSFER_REJECTED/);
    expect(() => transferElectricalValidationFromCurrentness()).toThrow(/VALIDATION_TRANSFER_REJECTED/);
    expect(() => recalculateFromElectricalCurrentness()).toThrow(/RECALCULATION_NOT_IN_R10/);
    expect(() => revalidateFromElectricalCurrentness()).toThrow(/REVALIDATION_NOT_IN_R10/);
    expect(() => approveFromElectricalCurrentness()).toThrow(/APPROVAL_NOT_IN_R10/);
    expect(suppliedLoad.suppliedValue).toBe("250");
    expect(load.fingerprint).toBe(identityFingerprint);
    expect(handoff.counterpart?.fingerprint).toBe("fp-mech");
    expect(validated.fingerprint).toBe(validationEnd.subjectFingerprint);
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D7.R10.CURRENTNESS_AND_DIGITAL_THREAD")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D7.R11.D9_SOURCE_CONTRACT")?.implementationState).toBe("NOT_IMPLEMENTED");
    const sourceText = readFileSync(join(here, "currentness-digital-thread.ts"), "utf8");
    expect(sourceText).toMatch(/fingerprintCanonical/);
    expect(sourceText).toMatch(/THREAD_DEFAULT_MAX_DEPTH/);
    expect(sourceText).not.toMatch(/createHash|from ["']@rtb\/engineering-review["']|CREATE TABLE|eval\(|child_process|new Function/);
    expect(scanAnalysisFormulaBypass(join(here, "currentness-digital-thread.ts"), sourceText)).toEqual([]);
    const packageJson = JSON.parse(readFileSync(join(here, "../../package.json"), "utf8")) as { dependencies: Record<string, string> };
    expect(Object.keys(packageJson.dependencies).sort()).toEqual(["@rtb/database", "@rtb/engineering-review", "@rtb/platform-commerce", "@rtb/platform-intelligence", "@rtb/platform-kernel", "@rtb/types", "docx", "exceljs", "pptxgenjs", "zod"]);
  });
});
