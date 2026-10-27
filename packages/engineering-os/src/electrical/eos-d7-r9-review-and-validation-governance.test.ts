import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { D7_REVIEW_VALIDATION_RUNTIME_COUNT as ARCHITECTURE_REVIEW_COUNT, D7_RUNTIME_COUNT as ARCHITECTURE_RUNTIME_COUNT } from "@rtb/types";
import { describe, expect, it } from "vitest";
import { STRUCTURAL_CAPABILITY_MANIFEST } from "../structural-concrete/capability";
import { scanAnalysisFormulaBypass } from "../structural-systems/formula-scan";
import { createD7R5Store, recordElectricalCalculationEvidence } from "./calculation-evidence";
import { D7_R9_STARTED, D7_REVIEW_VALIDATION_RUNTIME_COUNT as R8_REVIEW_COUNT, D7_RUNTIME_COUNT as R8_RUNTIME_COUNT, createD7R8Store, recordElectricalInterfaceHandoff } from "./discipline-interfaces-handoffs";
import { createD7R4Store, recordElectricalFeederContext } from "./feeder-cable-rating-context";
import { D7_CONTEXT_AUTHORITY, createD7R1Store, recordElectricalContext, recordElectricalObjectIdentity, type D7R1Actor } from "./identity-foundation";
import { createD7R3Store, recordElectricalLoadContext } from "./load-consumer-equipment-context";
import { createD7R6Store, recordElectricalProtectionDeviceContext, recordElectricalProtectionSetting } from "./protection-grounding-hazardous-area-context";
import { D7_R8_STARTED, D7_RUNTIME_COUNT as R7_RUNTIME_COUNT, createD7R7Store, recordElectricalChange, recordElectricalReassessment, recordElectricalSourceRequirement } from "./requirements-assumptions-change";
import {
  AI_EQUALS_D7_REVIEWER_AUTHORITY,
  AI_EQUALS_D7_VALIDATION_AUTHORITY,
  D7_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT,
  D7_ELECTRICAL_CALCULATION_RUNTIME_COUNT,
  D7_R10_CANONICAL_PHASE,
  D7_R10_STARTED,
  D7_R9_CAN_REVIEW_R8_HANDOFF,
  D7_R9_R7_CHANGE_INTEGRATION_IMPLEMENTED,
  D7_R9_R7_REASSESSMENT_INTEGRATION_IMPLEMENTED,
  D7_REVIEW_VALIDATION_RUNTIME_COUNT,
  D7_REVIEW_VALIDATION_RUNTIME_READY,
  D7_RUNTIME_COUNT,
  D8_RUNTIME_STARTED,
  D9_RUNTIME_COUNT,
  D9_RUNTIME_STARTED,
  ELECTRICAL_CALCULATION_EVIDENCE_EQUALS_ENGINEERING_VALIDATION,
  ELECTRICAL_REVIEW_COMPLETED_EQUALS_VALIDATED,
  ELECTRICAL_VALIDATED_EQUALS_APPROVED,
  ELECTRICAL_VALIDATED_EQUALS_CONFORMANT,
  ELECTRICAL_VALIDATED_EQUALS_REGULATORY_APPROVED,
  PROTECTION_SETTING_PRESENT_EQUALS_VALIDATED_PROTECTION_DESIGN,
  automaticallyValidateElectricalEngineering,
  approveElectricalFromValidation,
  certifyElectricalFromValidation,
  closeElectricalFindingAsValidated,
  closeElectricalReassessmentAsValidated,
  createD7R9Store,
  currentElectricalValidations,
  determineElectricalConformanceFromValidation,
  recordElectricalFindingDisposition,
  recordElectricalReviewCompletion,
  recordElectricalReviewFinding,
  recordElectricalReviewRequest,
  recordElectricalValidationState,
  repointElectricalReview,
  transferElectricalValidation,
  validateElectricalCounterpart,
} from "./review-validation-governance";
import { createD7R2Store, recordElectricalSystemContext } from "./system-source-distribution-context";

const here = dirname(fileURLToPath(import.meta.url));

function actor(overrides: Partial<D7R1Actor> = {}): D7R1Actor {
  return { actorId: "elec-recorder", tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a", authority: D7_CONTEXT_AUTHORITY, ...overrides };
}

describe("EOS-D7-R9 review and validation governance", () => {
  it("records Electrical review and explicit validation without auto-validating engineering", () => {
    expect(ARCHITECTURE_RUNTIME_COUNT).toBe(0);
    expect(ARCHITECTURE_REVIEW_COUNT).toBe(0);
    expect(R7_RUNTIME_COUNT).toBe(7);
    expect(R8_RUNTIME_COUNT).toBe(8);
    expect(R8_REVIEW_COUNT).toBe(0);
    expect(D7_R8_STARTED).toBe(false);
    expect(D7_R9_STARTED).toBe(false);
    expect(D7_RUNTIME_COUNT).toBe(9);
    expect(D7_REVIEW_VALIDATION_RUNTIME_COUNT).toBe(1);
    expect(D7_REVIEW_VALIDATION_RUNTIME_READY).toBe(true);
    expect(D7_R10_STARTED).toBe(false);
    expect(D7_R10_CANONICAL_PHASE).toBe("EOS-D7-R10-CURRENTNESS-AND-DIGITAL-THREAD");
    expect(D7_R9_CAN_REVIEW_R8_HANDOFF).toBe(true);
    expect(D7_R9_R7_CHANGE_INTEGRATION_IMPLEMENTED).toBe(true);
    expect(D7_R9_R7_REASSESSMENT_INTEGRATION_IMPLEMENTED).toBe(true);
    expect(ELECTRICAL_REVIEW_COMPLETED_EQUALS_VALIDATED).toBe(false);
    expect(ELECTRICAL_VALIDATED_EQUALS_CONFORMANT).toBe(false);
    expect(ELECTRICAL_VALIDATED_EQUALS_APPROVED).toBe(false);
    expect(ELECTRICAL_VALIDATED_EQUALS_REGULATORY_APPROVED).toBe(false);
    expect(ELECTRICAL_CALCULATION_EVIDENCE_EQUALS_ENGINEERING_VALIDATION).toBe(false);
    expect(PROTECTION_SETTING_PRESENT_EQUALS_VALIDATED_PROTECTION_DESIGN).toBe(false);
    expect(AI_EQUALS_D7_REVIEWER_AUTHORITY).toBe(false);
    expect(AI_EQUALS_D7_VALIDATION_AUTHORITY).toBe(false);
    expect(D7_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT).toBe(0);
    expect(D7_ELECTRICAL_CALCULATION_RUNTIME_COUNT).toBe(0);
    expect(D8_RUNTIME_STARTED).toBe(false);
    expect(D9_RUNTIME_STARTED).toBe(false);
    expect(D9_RUNTIME_COUNT).toBe(0);

    const r1 = createD7R1Store();
    const who = actor();
    const reviewer = { ...actor({ actorId: "elec-reviewer", authority: "REVIEWER" }), actorKind: "human" as const, aal: "aal2" };
    const validator = { ...actor({ actorId: "elec-validator", authority: "ELECTRICAL_VALIDATION_AUTHORITY" }), actorKind: "human" as const, aal: "aal2" };
    recordElectricalContext(r1, who, { contextId: "ctx-1", citedLifecycleStage: "FEED", provenanceRef: "prov-ctx", sourceBasisRef: "basis-ctx" });
    const load = recordElectricalObjectIdentity(r1, who, { objectId: "load-1", contextId: "ctx-1", objectType: "ELECTRICAL_LOAD", citedLifecycleStage: "FEED", provenanceRef: "prov-load-1", sourceBasisRef: "basis-load-1" });
    const system = recordElectricalObjectIdentity(r1, who, { objectId: "sys-1", contextId: "ctx-1", objectType: "ELECTRICAL_SYSTEM", citedLifecycleStage: "FEED", provenanceRef: "prov-sys-1", sourceBasisRef: "basis-sys-1" });
    const feeder = recordElectricalObjectIdentity(r1, who, { objectId: "feeder-1", contextId: "ctx-1", objectType: "ELECTRICAL_FEEDER", citedLifecycleStage: "FEED", provenanceRef: "prov-feeder-1", sourceBasisRef: "basis-feeder-1" });
    const deviceObject = recordElectricalObjectIdentity(r1, who, { objectId: "device-1", contextId: "ctx-1", objectType: "ELECTRICAL_PROTECTION_CONTEXT", citedLifecycleStage: "FEED", provenanceRef: "prov-device-1", sourceBasisRef: "basis-device-1" });
    const evidenceObject = recordElectricalObjectIdentity(r1, who, { objectId: "evidence-1", contextId: "ctx-1", objectType: "ELECTRICAL_CALCULATION_EVIDENCE", citedLifecycleStage: "FEED", provenanceRef: "prov-evidence-1", sourceBasisRef: "basis-evidence-1" });
    const identityFingerprint = load.fingerprint;
    const r2 = createD7R2Store(r1);
    const bound = (objectId: string, fingerprint: string) => ({ contextId: "ctx-1", objectId, objectRevisionFingerprint: fingerprint, citedLifecycleStage: "FEED", citedCurrentness: "CURRENT", provenanceRef: `prov-${objectId}`, sourceBasisRef: `basis-${objectId}`, applicability: `Applies only to ${objectId}`, limitations: `Context only for ${objectId}` });
    recordElectricalSystemContext(r2, who, { ...bound(system.objectId, system.fingerprint), systemRecordId: "sys-rec", systemRole: "DISTRIBUTION_SYSTEM", nominalClassification: "MEDIUM_VOLTAGE_CLASS" });
    const r3 = createD7R3Store(r1, r2);
    const suppliedLoad = recordElectricalLoadContext(r3, who, { ...bound(load.objectId, load.fingerprint), caseName: "NORMAL_CASE", duty: "CONTINUOUS", availability: "REQUIRED", applicability: "Applies only to load-1 in NORMAL_CASE", limitations: "Supplied value is not a calculation", loadRecordId: "load-supplied", statementRole: "SUPPLIED_LOAD_REQUIREMENT", suppliedValue: "250", unit: "kW" });
    const r4 = createD7R4Store(r1, r2, r3);
    const feederContext = recordElectricalFeederContext(r4, who, { ...bound(feeder.objectId, feeder.fingerprint), feederRecordId: "feeder-rec", feederRole: "DISTRIBUTION_FEEDER" });
    const r5 = createD7R5Store(r1, r4);
    const protectionEvidence = recordElectricalCalculationEvidence(r5, who, { contextId: "ctx-1", objectId: evidenceObject.objectId, objectRevisionFingerprint: evidenceObject.fingerprint, subjectObjectId: deviceObject.objectId, subjectRevisionFingerprint: deviceObject.fingerprint, citedLifecycleStage: "FEED", citedCurrentness: "CURRENT", provenanceRef: "prov-evidence", sourceBasisRef: "basis-evidence", sourceOrigin: "EXTERNAL_ENGINEERING_SOFTWARE", sourceToolName: "ETAP", sourceToolVersion: "22.0", sourceOrganization: "External study office", applicability: "Applies only to evidence-1 and device-1", limitations: "Supplied study evidence is not an EOS calculation", assumptions: ["External study assumption retained"], inputs: [{ name: "SUPPLIED_INPUT", value: "10", unit: "kA" }], evidenceId: "evidence-protection", evidenceClass: "PROTECTION_COORDINATION", sourceDocumentRef: "RPT-PROTECTION", results: [{ name: "SUPPLIED_RESULT", value: "12", unit: "kA" }] });
    const r6 = createD7R6Store(r1, r5);
    const device = recordElectricalProtectionDeviceContext(r6, who, { ...bound(deviceObject.objectId, deviceObject.fingerprint), deviceRecordId: "device-rec", deviceClass: "BREAKER" });
    const suppliedSetting = recordElectricalProtectionSetting(r6, who, { ...bound(deviceObject.objectId, deviceObject.fingerprint), settingRecordId: "setting-supplied", statementRole: "SUPPLIED_PROTECTION_SETTING", settingCategory: "CURRENT", suppliedValue: "800", unit: "A", jurisdictionProfileId: "australia", standardReference: "AS/NZS 3000 reference" });
    const r7 = createD7R7Store(r1, r6);
    recordElectricalSourceRequirement(r7, who, { ...bound(load.objectId, load.fingerprint), requirementId: "req-source", statement: "Retain the supplied continuous load basis", requirementRole: "SOURCE_REQUIREMENT", requirementCategory: "DESIGN_INPUT", sourceClass: "PROJECT_REQUIREMENT", sourceRef: "PR-LOAD-001", sourceRevision: "rev-2" });
    const change = recordElectricalChange(r7, who, { ...bound(load.objectId, load.fingerprint), changeId: "chg-1", changeCategory: "R3_LOAD_CHANGED", reason: "The cited load requirement changed", dependencies: [{ kind: "OBJECT_REFERENCE", targetKind: "R3_LOAD", targetId: suppliedLoad.loadRecordId, targetFingerprint: suppliedLoad.fingerprint }] });
    const reassessment = recordElectricalReassessment(r7, who, { ...bound(load.objectId, load.fingerprint), reassessmentId: "ras-required", changeId: change.changeId, targetId: suppliedLoad.loadRecordId, targetFingerprint: suppliedLoad.fingerprint, state: "REASSESSMENT_REQUIRED" });
    const scope = { tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a", recordStatus: "CURRENT" as const };
    const counterparts = [{ discipline: "mechanical" as const, counterpartId: "mech-1", sourceRevision: "rev-mech", fingerprint: "fp-mech", ...scope }];
    const r8 = createD7R8Store(r7, counterparts);
    const handoff = recordElectricalInterfaceHandoff(r8, who, { ...bound(load.objectId, load.fingerprint), sourceKind: "R3_LOAD", sourceId: suppliedLoad.loadRecordId, sourceFingerprint: suppliedLoad.fingerprint, dependencies: [{ kind: "OBJECT_REFERENCE", targetKind: "R3_LOAD", targetId: suppliedLoad.loadRecordId, targetFingerprint: suppliedLoad.fingerprint }], direction: "D7_TO_COUNTERPART", suppliedContent: "Supplied electrical load context for the named counterpart", handoffStatus: "COMPLETE", identityBasis: "EXPLICIT", tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a", handoffId: "ho-mech", counterpartDiscipline: "mechanical", interfaceTopic: "MOTOR_REQUIREMENTS", counterpartId: "mech-1", counterpartRevision: "rev-mech", counterpartFingerprint: "fp-mech" });
    const store = createD7R9Store(r8);
    const governed = { tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a", citedCurrentness: "CURRENT", citedLifecycleStage: "FEED" };
    const loadPin = { ...governed, contextId: "ctx-1", objectId: load.objectId, objectRevisionFingerprint: load.fingerprint, subjectKind: "LOAD", subjectId: suppliedLoad.loadRecordId, subjectRevision: suppliedLoad.provenanceRef, subjectFingerprint: suppliedLoad.fingerprint, applicability: "Applies only to load-1", limitations: "Review does not validate the load", provenanceRef: "prov-review-load", sourceBasisRef: "basis-review-load" };
    const feederPin = { ...governed, contextId: "ctx-1", objectId: feeder.objectId, objectRevisionFingerprint: feeder.fingerprint, subjectKind: "FEEDER", subjectId: feederContext.feederRecordId, subjectRevision: feederContext.provenanceRef, subjectFingerprint: feederContext.fingerprint, applicability: "Applies only to feeder-1", limitations: "Review does not validate the feeder", provenanceRef: "prov-review-feeder", sourceBasisRef: "basis-review-feeder" };
    const evidencePin = { ...governed, contextId: "ctx-1", objectId: evidenceObject.objectId, objectRevisionFingerprint: evidenceObject.fingerprint, subjectKind: "EVIDENCE", subjectId: protectionEvidence.evidenceId, subjectRevision: protectionEvidence.provenanceRef, subjectFingerprint: protectionEvidence.fingerprint, applicability: "Applies only to evidence-1", limitations: "Evidence remains evidence", provenanceRef: "prov-review-evidence", sourceBasisRef: "basis-review-evidence" };
    const settingPin = { ...governed, contextId: "ctx-1", objectId: deviceObject.objectId, objectRevisionFingerprint: deviceObject.fingerprint, subjectKind: "SETTING", subjectId: suppliedSetting.settingRecordId, subjectRevision: suppliedSetting.provenanceRef, subjectFingerprint: suppliedSetting.fingerprint, applicability: "Applies only to device-1", limitations: "A setting record is not a validated protection design", provenanceRef: "prov-review-setting", sourceBasisRef: "basis-review-setting" };
    const handoffPin = { ...governed, contextId: "ctx-1", objectId: load.objectId, objectRevisionFingerprint: load.fingerprint, subjectKind: "HANDOFF", subjectId: handoff.handoffId, subjectRevision: handoff.provenanceRef, subjectFingerprint: handoff.fingerprint, applicability: "Applies only to load-1", limitations: "Handoff review is not counterpart validation", provenanceRef: "prov-review-handoff", sourceBasisRef: "basis-review-handoff" };

    const request = recordElectricalReviewRequest(store, who, { ...loadPin, reviewRequestId: "rev-load", reviewType: "ELECTRICAL_SUBJECT_REVIEW", reviewScope: "Electrical load review scope", requestedReviewerAuthority: "REVIEWER" });
    const replay = recordElectricalReviewRequest(store, who, { ...loadPin, reviewRequestId: "rev-load", reviewType: "ELECTRICAL_SUBJECT_REVIEW", reviewScope: "Electrical load review scope", requestedReviewerAuthority: "REVIEWER", assertedFingerprint: request.fingerprint });
    const finding = recordElectricalReviewFinding(store, reviewer, { ...loadPin, findingId: "find-load", reviewRequestId: request.reviewRequestId, findingCategory: "OBSERVATION", severity: "REVIEW_CANDIDATE", findingText: "Supplied load basis needs a reviewer note", disposition: "OPEN" });
    const reassessmentFinding = recordElectricalReviewFinding(store, reviewer, { ...loadPin, findingId: "find-reassess", reviewRequestId: request.reviewRequestId, findingCategory: "REASSESSMENT_RECOMMENDATION", severity: "REQUIRES_ATTENTION", findingText: "The load change still needs reassessment", disposition: "REASSESSMENT_REQUESTED" });
    const disposition = recordElectricalFindingDisposition(store, reviewer, { ...loadPin, dispositionId: "disp-noted", findingId: finding.findingId, disposition: "NOTED" });
    const linkedDisposition = recordElectricalFindingDisposition(store, reviewer, { ...loadPin, dispositionId: "disp-reassess", findingId: reassessmentFinding.findingId, disposition: "REASSESSMENT_REQUESTED", changeId: change.changeId, changeFingerprint: change.fingerprint, reassessmentId: reassessment.reassessmentId, reassessmentFingerprint: reassessment.fingerprint });
    const completion = recordElectricalReviewCompletion(store, reviewer, { ...loadPin, completionId: "comp-load", reviewRequestId: request.reviewRequestId });
    const reassessmentValidation = recordElectricalValidationState(store, validator, { ...loadPin, citedCurrentness: "REASSESSMENT_REQUIRED", validationId: "val-reassess", validationScope: "Load reassessment state", validationState: "REASSESSMENT_REQUIRED", changeId: change.changeId, changeFingerprint: change.fingerprint, reassessmentId: reassessment.reassessmentId, reassessmentFingerprint: reassessment.fingerprint, reviewRequestId: request.reviewRequestId });
    const feederRequest = recordElectricalReviewRequest(store, who, { ...feederPin, reviewRequestId: "rev-feeder", reviewType: "ELECTRICAL_SUBJECT_REVIEW", reviewScope: "Electrical feeder review scope", requestedReviewerAuthority: "REVIEWER" });
    const feederCompletion = recordElectricalReviewCompletion(store, reviewer, { ...feederPin, completionId: "comp-feeder", reviewRequestId: feederRequest.reviewRequestId });
    const validated = recordElectricalValidationState(store, validator, { ...feederPin, validationId: "val-feeder", validationScope: "Feeder context validation", validationState: "VALIDATED", reviewRequestId: feederRequest.reviewRequestId, basis: [{ kind: "R4_FEEDER", id: feederContext.feederRecordId, fingerprint: feederContext.fingerprint }] });
    const staleValidation = recordElectricalValidationState(store, validator, { ...feederPin, citedCurrentness: "STALE", validationId: "val-feeder-stale", validationScope: "Feeder stale validation", validationState: "STALE" });
    const superseded = recordElectricalValidationState(store, validator, { ...feederPin, validationId: "val-feeder-next", validationScope: "Feeder context validation", validationState: "EVIDENCE_INCOMPLETE", predecessorValidationId: validated.validationId });
    const evidenceValidation = recordElectricalValidationState(store, validator, { ...evidencePin, validationId: "val-evidence", validationScope: "Evidence record validation", validationState: "VALIDATED", basis: [{ kind: "R5_EVIDENCE", id: protectionEvidence.evidenceId, fingerprint: protectionEvidence.fingerprint }] });
    const settingRequest = recordElectricalReviewRequest(store, who, { ...settingPin, reviewRequestId: "rev-setting", reviewType: "ELECTRICAL_SUBJECT_REVIEW", reviewScope: "Protection setting review scope", requestedReviewerAuthority: "REVIEWER" });
    const settingCompletion = recordElectricalReviewCompletion(store, reviewer, { ...settingPin, completionId: "comp-setting", reviewRequestId: settingRequest.reviewRequestId });
    const handoffRequest = recordElectricalReviewRequest(store, who, { ...handoffPin, reviewRequestId: "rev-handoff", reviewType: "INTERFACE_HANDOFF_REVIEW", reviewScope: "Mechanical handoff review scope", requestedReviewerAuthority: "REVIEWER" });
    const handoffCompletion = recordElectricalReviewCompletion(store, reviewer, { ...handoffPin, completionId: "comp-handoff", reviewRequestId: handoffRequest.reviewRequestId });

    expect(replay).toBe(request);
    expect(request.reviewCompleted).toBe(false);
    expect(request.requestStatus).toBe("REQUESTED");
    expect(request.engineeringValidated).toBe(false);
    expect(finding.engineeringInvalid).toBe(false);
    expect(finding.engineeringValidated).toBe(false);
    expect(disposition.approved).toBe(false);
    expect(disposition.conformant).toBe(false);
    expect(linkedDisposition.engineeringValidated).toBe(false);
    expect(linkedDisposition.changeId).toBe(change.changeId);
    expect(completion.reviewCompleted).toBe(true);
    expect(completion.engineeringValidated).toBe(false);
    expect(completion.approved).toBe(false);
    expect(completion.certified).toBe(false);
    expect(completion.conformant).toBe(false);
    expect(request.reviewCompleted).toBe(false);
    expect(reassessmentValidation.validationState).toBe("REASSESSMENT_REQUIRED");
    expect(reassessmentValidation.currentness).toBe("REASSESSMENT_REQUIRED");
    expect(reassessmentValidation.engineeringValidated).toBe(false);
    expect(currentElectricalValidations(store, validator).some((row) => row.validationId === reassessmentValidation.validationId)).toBe(false);
    expect(validated.validationState).toBe("VALIDATED");
    expect(validated.engineeringValidated).toBe(true);
    expect(validated.approved).toBe(false);
    expect(validated.conformant).toBe(false);
    expect(validated.certified).toBe(false);
    expect(validated.regulatoryApproved).toBe(false);
    expect(validated.evidenceEqualsValidation).toBe(false);
    expect(feederCompletion.engineeringValidated).toBe(false);
    expect(feederContext.validatedFeederDesign).toBe(false);
    expect(staleValidation.currentness).toBe("STALE");
    expect(currentElectricalValidations(store, validator).some((row) => row.validationId === staleValidation.validationId)).toBe(false);
    expect(superseded.predecessorValidationId).toBe(validated.validationId);
    expect(store.validations.find((row) => row.validationId === validated.validationId)?.recordStatus).toBe("SUPERSEDED");
    expect(currentElectricalValidations(store, validator).some((row) => row.validationId === validated.validationId)).toBe(false);
    expect(evidenceValidation.evidenceEqualsValidation).toBe(false);
    expect(evidenceValidation.engineeringValidated).toBe(true);
    expect(protectionEvidence.engineeringValidated).toBe(false);
    expect(protectionEvidence.eosCalculated).toBe(false);
    expect(protectionEvidence.results[0]?.value).toBe("12");
    expect(settingCompletion.engineeringValidated).toBe(false);
    expect(settingCompletion.protectionDesignValidated).toBe(false);
    expect(suppliedSetting.validatedSetting).toBe(false);
    expect(suppliedSetting.calculated).toBe(false);
    expect(device.validatedProtectionDesign).toBe(false);
    expect(handoff.interfaceAccepted).toBe(true);
    expect(handoff.engineeringValidated).toBe(false);
    expect(handoffCompletion.counterpartValidated).toBe(false);
    expect(handoffCompletion.engineeringValidated).toBe(false);
    expect(handoff.counterpart?.sourceRevision).toBe("rev-mech");
    expect(handoff.counterpart?.fingerprint).toBe("fp-mech");
    expect(currentElectricalValidations(store, validator).some((row) => row.subjectKind === "HANDOFF")).toBe(false);
    expect(suppliedLoad.suppliedValue).toBe("250");
    expect(load.fingerprint).toBe(identityFingerprint);
    expect(store.history.some((row) => row.subjectId === request.reviewRequestId && row.action === "CREATED")).toBe(true);

    expect(() => createD7R9Store(createD7R8Store(createD7R7Store(createD7R1Store(), r6), counterparts))).toThrow(/R1_R6_STORE_MISMATCH/);
    expect(() => recordElectricalValidationState(store, validator, { ...loadPin, validationId: "val-load-auto", validationScope: "Load context validation", validationState: "VALIDATED", basis: [{ kind: "R3_LOAD", id: suppliedLoad.loadRecordId, fingerprint: suppliedLoad.fingerprint }] })).toThrow(/REASSESSMENT_NOT_VALIDATED/);
    expect(() => recordElectricalValidationState(store, validator, { ...loadPin, validationId: "val-transfer", validationScope: "Transferred validation", validationState: "NOT_VALIDATED", predecessorValidationId: superseded.validationId })).toThrow(/VALIDATION_TRANSFER_REJECTED/);
    expect(() => recordElectricalReviewRequest(store, who, { ...loadPin, reviewRequestId: "rev-float", reviewType: "ELECTRICAL_SUBJECT_REVIEW", reviewScope: "Floating subject", requestedReviewerAuthority: "REVIEWER", subjectRevision: "latest" })).toThrow(/SUBJECT_REVISION_REQUIRED/);
    expect(() => recordElectricalReviewRequest(store, who, { ...loadPin, reviewRequestId: "rev-spoof", reviewType: "ELECTRICAL_SUBJECT_REVIEW", reviewScope: "Spoofed revision", requestedReviewerAuthority: "REVIEWER", subjectFingerprint: "spoof" })).toThrow(/SUBJECT_REVISION_MISMATCH/);
    expect(() => recordElectricalReviewRequest(store, who, { ...loadPin, reviewRequestId: "rev-dup", reviewType: "ELECTRICAL_SUBJECT_REVIEW", reviewScope: "Duplicate request", requestedReviewerAuthority: "REVIEWER" })).toThrow(/DUPLICATE_REVIEW_REQUEST_REJECTED/);
    expect(() => recordElectricalReviewFinding(store, reviewer, { ...loadPin, findingId: "find-closed", reviewRequestId: request.reviewRequestId, findingCategory: "OBSERVATION", severity: "REVIEW_CANDIDATE", findingText: "Closed is not validation", disposition: "closed" })).toThrow(/FINDING_DISPOSITION_INVALID/);
    expect(() => recordElectricalFindingDisposition(store, reviewer, { ...loadPin, dispositionId: "disp-accepted", findingId: finding.findingId, disposition: "accepted" })).toThrow(/FINDING_DISPOSITION_INVALID/);
    expect(() => recordElectricalReviewRequest(store, who, { ...loadPin, reviewRequestId: "rev-auto", reviewType: "ELECTRICAL_SUBJECT_REVIEW", reviewScope: "Automatic validation", requestedReviewerAuthority: "REVIEWER", automaticValidation: true })).toThrow(/AUTOMATIC_VALIDATION_REJECTED/);
    expect(() => recordElectricalValidationState(store, validator, { ...evidencePin, validationId: "val-evidence-auto", validationScope: "Evidence auto validation", validationState: "NOT_VALIDATED", evidenceEqualsValidation: true })).toThrow(/EVIDENCE_NOT_VALIDATION/);
    expect(() => recordElectricalReviewCompletion(store, reviewer, { ...handoffPin, completionId: "comp-handoff-validate", reviewRequestId: handoffRequest.reviewRequestId, validateMechanical: true })).toThrow(/COUNTERPART_VALIDATION_REJECTED/);
    expect(() => recordElectricalReviewRequest(store, { ...who, actorId: "AI_ASSISTANT", authority: "AI_ASSISTANT" }, { ...feederPin, reviewRequestId: "rev-ai", reviewType: "ELECTRICAL_SUBJECT_REVIEW", reviewScope: "AI request", requestedReviewerAuthority: "REVIEWER" })).toThrow(/AI_NOT_ELECTRICAL_AUTHORITY/);
    expect(() => recordElectricalValidationState(store, { ...validator, actorId: "ADMIN", authority: "ADMIN" }, { ...feederPin, validationId: "val-admin", validationScope: "Admin validation", validationState: "VALIDATED", basis: [{ kind: "R4_FEEDER", id: feederContext.feederRecordId, fingerprint: feederContext.fingerprint }] })).toThrow(/AI_CANNOT_VALIDATE/);
    expect(() => recordElectricalReviewRequest(store, who, { ...loadPin, reviewRequestId: "rev-tenant", reviewType: "ELECTRICAL_SUBJECT_REVIEW", reviewScope: "Cross tenant", requestedReviewerAuthority: "REVIEWER", tenantId: "tenant-b" })).toThrow(/SCOPE_MISMATCH/);
    expect(() => recordElectricalValidationState(store, validator, { ...feederPin, validationId: "val-reg", validationScope: "Regulatory claim", validationState: "NOT_VALIDATED", regulatoryApproval: true })).toThrow(/REGULATORY_APPROVAL_NOT_IN_R9/);
    expect(() => repointElectricalReview()).toThrow(/AUTO_REPOINT_REJECTED/);
    expect(() => transferElectricalValidation()).toThrow(/VALIDATION_TRANSFER_REJECTED/);
    expect(() => automaticallyValidateElectricalEngineering()).toThrow(/AUTOMATIC_VALIDATION_REJECTED/);
    expect(() => closeElectricalFindingAsValidated()).toThrow(/FINDING_CLOSURE_NOT_VALIDATION/);
    expect(() => closeElectricalReassessmentAsValidated()).toThrow(/REASSESSMENT_NOT_VALIDATION/);
    expect(() => validateElectricalCounterpart()).toThrow(/COUNTERPART_VALIDATION_REJECTED/);
    expect(() => approveElectricalFromValidation()).toThrow(/APPROVAL_NOT_IN_R9/);
    expect(() => certifyElectricalFromValidation()).toThrow(/CERTIFICATION_NOT_IN_R9/);
    expect(() => determineElectricalConformanceFromValidation()).toThrow(/CONFORMANCE_NOT_IN_R9/);
    expect(suppliedLoad.suppliedValue).toBe("250");
    expect(load.fingerprint).toBe(identityFingerprint);
    expect(handoff.fingerprint).toBe(handoffPin.subjectFingerprint);
    expect(counterparts[0]?.sourceRevision).toBe("rev-mech");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D7.R9.REVIEW_AND_VALIDATION_GOVERNANCE")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D7.R10.CURRENTNESS_AND_DIGITAL_THREAD")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    const sourceText = readFileSync(join(here, "review-validation-governance.ts"), "utf8");
    expect(sourceText).toMatch(/fingerprintCanonical/);
    expect(sourceText).not.toMatch(/createHash|from ["']@rtb\/engineering-review["']|CREATE TABLE|eval\(|child_process|new Function/);
    expect(scanAnalysisFormulaBypass(join(here, "review-validation-governance.ts"), sourceText)).toEqual([]);
    const packageJson = JSON.parse(readFileSync(join(here, "../../package.json"), "utf8")) as { dependencies: Record<string, string> };
    expect(Object.keys(packageJson.dependencies).sort()).toEqual(["@rtb/database", "@rtb/platform-commerce", "@rtb/platform-intelligence", "@rtb/platform-kernel", "@rtb/types", "docx", "exceljs", "pptxgenjs", "zod"]);
  });
});
