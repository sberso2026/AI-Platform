import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { STRUCTURAL_CAPABILITY_MANIFEST } from "../structural-concrete/capability";
import { scanAnalysisFormulaBypass } from "../structural-systems/formula-scan";
import { D1_STRUCTURAL_PACK_COMPLETE, D1N_REOPENED } from "../structural-systems/structural-pack-sequencing";
import { D2_CONTEXT_AUTHORITY, D2_RUNTIME_COUNT as R1_RUNTIME_COUNT, createD2R1Store, recordCivilContext, recordCivilObjectIdentity, type D2R1Actor } from "./identity-foundation";
import { D2_RUNTIME_COUNT as R2_RUNTIME_COUNT, createD2R2Store } from "./spatial-surface-context";
import { D2_RUNTIME_COUNT as R3_RUNTIME_COUNT, createD2R3Store } from "./grading-earthworks-context";
import { D2_RUNTIME_COUNT as R4_RUNTIME_COUNT, createD2R4Store } from "./roads-access-context";
import { D2_RUNTIME_COUNT as R5_RUNTIME_COUNT, createD2R5Store } from "./drainage-stormwater-context";
import { D2_RUNTIME_COUNT as R6_RUNTIME_COUNT, createD2R6Store } from "./utility-corridor-context";
import {
  D2_RUNTIME_COUNT as R7_RUNTIME_COUNT,
  createD2R7Store,
  recordCivilAssumption,
  recordCivilChange,
  recordCivilDecision,
  recordCivilRequirement,
} from "./requirements-assumptions-change";
import {
  D2_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_READY as R8_REVIEW_READY,
  D2_R9_STARTED as R8_R9_STARTED,
  D2_RUNTIME_COUNT as R8_RUNTIME_COUNT,
  createD2R8Store,
  recordCivilInterfaceHandoff,
} from "./discipline-interfaces-handoffs";
import {
  ADMIN_CAN_AUTOMATICALLY_VALIDATE_CIVIL_ENGINEERING,
  ADMIN_EQUALS_D2_CIVIL_REVIEWER,
  AI_CAN_AUTOMATICALLY_VALIDATE_CIVIL_ENGINEERING,
  AI_EQUALS_D2_CIVIL_REVIEWER,
  CANONICAL_AUTHORITY_GOVERNANCE_REUSED,
  CANONICAL_CURRENTNESS_REUSED,
  CANONICAL_FINGERPRINT_REUSED,
  CANONICAL_REVIEW_GOVERNANCE_REUSED,
  D2_AUTOMATIC_COUNTERPART_VALIDATION_RUNTIME_COUNT,
  D2_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT,
  D2_AUTOMATIC_REVIEW_FINDING_RESOLUTION_RUNTIME_COUNT,
  D2_CIVIL_APPROVAL_RUNTIME_COUNT,
  D2_CIVIL_CERTIFICATION_RUNTIME_COUNT,
  D2_CIVIL_CONFORMANCE_CERTIFICATION_RUNTIME_COUNT,
  D2_CIVIL_REVIEW_FINDING_RUNTIME_IMPLEMENTED,
  D2_CIVIL_REVIEW_REQUEST_RUNTIME_IMPLEMENTED,
  D2_CIVIL_VALIDATION_GOVERNANCE_RUNTIME_IMPLEMENTED,
  D2_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT,
  D2_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
  D2_DEDICATED_CURRENTNESS_DIGITAL_THREAD_RUNTIME_COUNT,
  D2_R10_CANONICAL_PHASE,
  D2_R10_PHASE_TYPE,
  D2_R10_STARTED,
  D2_R11_STARTED,
  D2_R9_HISTORY_PRESERVED,
  D2_R9_MATURITY,
  D2_R9_PROVENANCE_PRESERVED,
  D2_R9_PROVENANCE_REQUIRED,
  D2_R9_STATUS,
  D2_REVIEW_AUTO_MUTATES_ENGINEERING_OBJECT,
  D2_REVIEW_OF_INTERFACE_EQUALS_COUNTERPART_DISCIPLINE_VALIDATION,
  D2_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_READY,
  D2_REVIEWER_AUTHORITY_GOVERNED,
  D2_RUNTIME_COUNT,
  D2_RUNTIME_STARTED,
  D2_VALIDATION_AUTO_MUTATES_ENGINEERING_OBJECT,
  D2_VALIDATION_OF_CIVIL_HANDOFF_EQUALS_D1_VALIDATION,
  D2_VALIDATION_OF_CIVIL_HANDOFF_EQUALS_D3_VALIDATION,
  D3_RUNTIME_STARTED,
  D4_RUNTIME_STARTED,
  D5_RUNTIME_STARTED,
  D6_RUNTIME_STARTED,
  D7_RUNTIME_STARTED,
  D8_RUNTIME_STARTED,
  D9_RUNTIME_STARTED,
  DATABASE_SCHEMA_CHANGED,
  EVIDENCE_PRESENT_EQUALS_ENGINEERING_VALIDATED,
  EXACT_D2_REVIEW_SUBJECT_REFERENCE_REQUIRED,
  FLOATING_D2_REVIEW_SUBJECT_REFERENCE_ALLOWED,
  NEW_DEPENDENCY_ADDED,
  PARALLEL_D2_CURRENTNESS_ENGINE_CREATED,
  PARALLEL_D2_REVIEW_AUTHORITY_FRAMEWORK_CREATED,
  PRIOR_REVIEW_AUTO_TRANSFERS_TO_NEW_REVISION,
  PRIOR_VALIDATION_AUTO_TRANSFERS_TO_NEW_REVISION,
  REVIEW_COMPLETED_EQUALS_ENGINEERING_VALIDATED,
  REVIEW_FINDING_EQUALS_AUTOMATIC_DESIGN_CHANGE,
  REVIEW_FINDING_EQUALS_ENGINEERING_INVALID,
  REVIEW_REQUEST_PRESENT_EQUALS_ENGINEERING_VALIDATED,
  REVIEW_REQUEST_PRESENT_EQUALS_REVIEW_COMPLETED,
  SECOND_FINGERPRINT_ALGORITHM_CREATED,
  SILENT_D2_R9_MUTATION_ALLOWED,
  STALE_REVIEW_AUTO_REPOINTED,
  STALE_VALIDATION_AUTO_REPOINTED,
  TENANT_WORKSPACE_PROJECT_D2_R9_SCOPE_ENFORCED,
  VALIDATED_EQUALS_CERTIFIED,
  VALIDATED_EQUALS_CONFORMANT,
  VALIDATED_EQUALS_ENGINEERING_APPROVED,
  approveCivilWork,
  automaticallyValidateCivilEngineering,
  certifyCivilWork,
  createD2R9Store,
  mutateReviewedSubject,
  recordCivilReviewFinding,
  recordCivilReviewRequest,
  recordCivilValidationGovernance,
  repointStaleReview,
  repointStaleValidation,
  resolveReviewFinding,
  transferPriorReview,
  transferPriorValidation,
  type D2R9Actor,
} from "./review-validation-governance";

const actor: D2R1Actor = {
  actorId: "civil-recorder",
  tenantId: "tenant-a",
  workspaceId: "workspace-a",
  projectId: "project-a",
  authority: D2_CONTEXT_AUTHORITY,
};

const reviewer: D2R9Actor = {
  actorId: "reviewer-1",
  tenantId: "tenant-a",
  workspaceId: "workspace-a",
  projectId: "project-a",
  authority: "REVIEWER",
  actorKind: "human",
  aal: "aal2",
};

describe("EOS-D2-R9 review and validation governance", () => {
  it("records review and validation governance without approving, certifying, or mutating the subject", () => {
    expect(D2_R9_STATUS).toBe("REVIEW_AND_VALIDATION_GOVERNANCE_IMPLEMENTED");
    expect(D2_R9_MATURITY).toBe(D2_R9_STATUS);
    expect(D2_RUNTIME_STARTED).toBe(true);
    expect(D2_RUNTIME_COUNT).toBe(9);
    expect(R8_RUNTIME_COUNT).toBe(8);
    expect(R7_RUNTIME_COUNT).toBe(7);
    expect(R6_RUNTIME_COUNT).toBe(6);
    expect(R5_RUNTIME_COUNT).toBe(5);
    expect(R4_RUNTIME_COUNT).toBe(4);
    expect(R3_RUNTIME_COUNT).toBe(3);
    expect(R2_RUNTIME_COUNT).toBe(2);
    expect(R1_RUNTIME_COUNT).toBe(1);
    expect(D2_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_READY).toBe(true);
    expect(R8_REVIEW_READY).toBe(false);
    expect(R8_R9_STARTED).toBe(false);
    expect(D2_CIVIL_REVIEW_REQUEST_RUNTIME_IMPLEMENTED).toBe(true);
    expect(D2_CIVIL_REVIEW_FINDING_RUNTIME_IMPLEMENTED).toBe(true);
    expect(D2_CIVIL_VALIDATION_GOVERNANCE_RUNTIME_IMPLEMENTED).toBe(true);
    expect(CANONICAL_REVIEW_GOVERNANCE_REUSED).toBe(true);
    expect(CANONICAL_AUTHORITY_GOVERNANCE_REUSED).toBe(true);
    expect(PARALLEL_D2_REVIEW_AUTHORITY_FRAMEWORK_CREATED).toBe(false);
    expect(EXACT_D2_REVIEW_SUBJECT_REFERENCE_REQUIRED).toBe(true);
    expect(FLOATING_D2_REVIEW_SUBJECT_REFERENCE_ALLOWED).toBe(false);
    expect(D2_REVIEWER_AUTHORITY_GOVERNED).toBe(true);
    expect(AI_EQUALS_D2_CIVIL_REVIEWER).toBe(false);
    expect(ADMIN_EQUALS_D2_CIVIL_REVIEWER).toBe(false);
    expect(REVIEW_REQUEST_PRESENT_EQUALS_REVIEW_COMPLETED).toBe(false);
    expect(REVIEW_REQUEST_PRESENT_EQUALS_ENGINEERING_VALIDATED).toBe(false);
    expect(REVIEW_FINDING_EQUALS_AUTOMATIC_DESIGN_CHANGE).toBe(false);
    expect(REVIEW_FINDING_EQUALS_ENGINEERING_INVALID).toBe(false);
    expect(AI_CAN_AUTOMATICALLY_VALIDATE_CIVIL_ENGINEERING).toBe(false);
    expect(ADMIN_CAN_AUTOMATICALLY_VALIDATE_CIVIL_ENGINEERING).toBe(false);
    expect(EVIDENCE_PRESENT_EQUALS_ENGINEERING_VALIDATED).toBe(false);
    expect(REVIEW_COMPLETED_EQUALS_ENGINEERING_VALIDATED).toBe(false);
    expect(VALIDATED_EQUALS_CONFORMANT).toBe(false);
    expect(VALIDATED_EQUALS_ENGINEERING_APPROVED).toBe(false);
    expect(VALIDATED_EQUALS_CERTIFIED).toBe(false);
    expect(D2_REVIEW_AUTO_MUTATES_ENGINEERING_OBJECT).toBe(false);
    expect(D2_VALIDATION_AUTO_MUTATES_ENGINEERING_OBJECT).toBe(false);
    expect(PRIOR_REVIEW_AUTO_TRANSFERS_TO_NEW_REVISION).toBe(false);
    expect(PRIOR_VALIDATION_AUTO_TRANSFERS_TO_NEW_REVISION).toBe(false);
    expect(CANONICAL_CURRENTNESS_REUSED).toBe(true);
    expect(PARALLEL_D2_CURRENTNESS_ENGINE_CREATED).toBe(false);
    expect(STALE_REVIEW_AUTO_REPOINTED).toBe(false);
    expect(STALE_VALIDATION_AUTO_REPOINTED).toBe(false);
    expect(D2_REVIEW_OF_INTERFACE_EQUALS_COUNTERPART_DISCIPLINE_VALIDATION).toBe(false);
    expect(D2_VALIDATION_OF_CIVIL_HANDOFF_EQUALS_D1_VALIDATION).toBe(false);
    expect(D2_VALIDATION_OF_CIVIL_HANDOFF_EQUALS_D3_VALIDATION).toBe(false);
    expect(D2_R9_PROVENANCE_REQUIRED).toBe(true);
    expect(D2_R9_PROVENANCE_PRESERVED).toBe(true);
    expect(CANONICAL_FINGERPRINT_REUSED).toBe(true);
    expect(SECOND_FINGERPRINT_ALGORITHM_CREATED).toBe(false);
    expect(SILENT_D2_R9_MUTATION_ALLOWED).toBe(false);
    expect(D2_R9_HISTORY_PRESERVED).toBe(true);
    expect(TENANT_WORKSPACE_PROJECT_D2_R9_SCOPE_ENFORCED).toBe(true);
    expect(D2_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT).toBe(0);
    expect(D2_AUTOMATIC_REVIEW_FINDING_RESOLUTION_RUNTIME_COUNT).toBe(0);
    expect(D2_CIVIL_APPROVAL_RUNTIME_COUNT).toBe(0);
    expect(D2_CIVIL_CERTIFICATION_RUNTIME_COUNT).toBe(0);
    expect(D2_CIVIL_CONFORMANCE_CERTIFICATION_RUNTIME_COUNT).toBe(0);
    expect(D2_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT).toBe(0);
    expect(D2_AUTOMATIC_COUNTERPART_VALIDATION_RUNTIME_COUNT).toBe(0);
    expect(D2_DEDICATED_CURRENTNESS_DIGITAL_THREAD_RUNTIME_COUNT).toBe(0);
    expect(D2_D9_SOURCE_CONTRACT_RUNTIME_COUNT).toBe(0);
    expect(D3_RUNTIME_STARTED).toBe(false);
    expect(D4_RUNTIME_STARTED).toBe(false);
    expect(D5_RUNTIME_STARTED).toBe(false);
    expect(D6_RUNTIME_STARTED).toBe(false);
    expect(D7_RUNTIME_STARTED).toBe(false);
    expect(D8_RUNTIME_STARTED).toBe(false);
    expect(D9_RUNTIME_STARTED).toBe(false);
    expect(D1_STRUCTURAL_PACK_COMPLETE).toBe(false);
    expect(D1N_REOPENED).toBe(false);
    expect(DATABASE_SCHEMA_CHANGED).toBe(false);
    expect(NEW_DEPENDENCY_ADDED).toBe(false);
    expect(D2_R10_STARTED).toBe(false);
    expect(D2_R11_STARTED).toBe(false);
    expect(D2_R10_CANONICAL_PHASE).toBe("EOS-D2-R10-CURRENTNESS-AND-DIGITAL-THREAD");
    expect(D2_R10_PHASE_TYPE).toBe("CURRENTNESS_AND_DIGITAL_THREAD");

    const r1 = createD2R1Store();
    const context = recordCivilContext(r1, actor, { contextId: "civil-context-1", citedLifecycleStage: "CONCEPT", provenanceRef: "prov-context" });
    const object = (objectId: string, objectType: "GRADING_ZONE" | "CIVIL_INTERFACE" | "CIVIL_REQUIREMENT" | "CIVIL_ASSUMPTION" | "CIVIL_DECISION" | "CIVIL_EVIDENCE_REFERENCE") =>
      recordCivilObjectIdentity(r1, actor, { objectId, contextId: context.contextId, objectType, citedLifecycleStage: "CONCEPT", provenanceRef: `prov-${objectId}` });
    const gradingObject = object("grading-object", "GRADING_ZONE");
    const interfaceObject = object("interface-object", "CIVIL_INTERFACE");
    const requirementObject = object("requirement-object", "CIVIL_REQUIREMENT");
    const assumptionObject = object("assumption-object", "CIVIL_ASSUMPTION");
    const decisionObject = object("decision-object", "CIVIL_DECISION");
    const evidence = object("evidence-object", "CIVIL_EVIDENCE_REFERENCE");
    const r7 = createD2R7Store(createD2R6Store(createD2R5Store(createD2R4Store(createD2R3Store(createD2R2Store(r1))))));
    const requirement = recordCivilRequirement(r7, actor, {
      requirementContextId: "requirement-1",
      contextId: context.contextId,
      objectId: requirementObject.objectId,
      requirementText: "Finished level remains the cited design surface.",
      sourceRef: "council-standard",
      sourceRevision: "2024-a",
      applicability: "site platform",
      affectedObjectIds: [gradingObject.objectId],
      jurisdictionProfileId: "apac-other",
      evidenceObjectIds: [evidence.objectId],
      citedLifecycleStage: "CONCEPT",
      provenanceRef: "prov-requirement",
      citedCurrentness: "CURRENT",
    });
    recordCivilAssumption(r7, actor, {
      assumptionContextId: "assumption-1",
      contextId: context.contextId,
      objectId: assumptionObject.objectId,
      statement: "The cited existing surface remains the reference.",
      sourceRef: "survey-authority",
      rationale: "Supplied by the survey record.",
      affectedObjectIds: [gradingObject.objectId],
      evidenceObjectIds: [evidence.objectId],
      citedLifecycleStage: "CONCEPT",
      provenanceRef: "prov-assumption",
      citedCurrentness: "CURRENT",
    });
    recordCivilDecision(r7, actor, {
      decisionContextId: "decision-1",
      contextId: context.contextId,
      objectId: decisionObject.objectId,
      statement: "Retain the cited finished level.",
      rationale: "The requirement and assumption were supplied.",
      authorityRole: "DECISION_AUTHORITY",
      alternatives: [],
      affectedObjectIds: [gradingObject.objectId],
      requirementObjectIds: [requirementObject.objectId],
      assumptionObjectIds: [assumptionObject.objectId],
      evidenceObjectIds: [evidence.objectId],
      citedLifecycleStage: "CONCEPT",
      provenanceRef: "prov-decision",
      citedCurrentness: "CURRENT",
    });
    recordCivilChange(r7, actor, {
      changeContextId: "change-1",
      contextId: context.contextId,
      initiatingSource: "survey-revision-note",
      changedObjectId: gradingObject.objectId,
      affectedRelationships: [{ kind: "PARENT", targetObjectId: gradingObject.objectId }],
      rationale: "The cited survey note asks for reassessment of the explicit link.",
      reassessmentRequired: true,
      authorityRole: "AUTHOR",
      provenanceRef: "prov-change",
      citedCurrentness: "REASSESSMENT_REQUIRED",
    });
    const r8 = createD2R8Store(r7);
    const handoff = recordCivilInterfaceHandoff(r8, actor, {
      handoffId: "handoff-d3",
      contextId: context.contextId,
      objectId: interfaceObject.objectId,
      sourceObjectId: gradingObject.objectId,
      sourceRevision: "rev-civil-1",
      counterpartDiscipline: "geotechnical",
      direction: "D2_TO_COUNTERPART",
      interfaceTopic: "GROUNDWATER",
      counterpartInterfaceId: null,
      counterpartSourceRevision: null,
      evidenceObjectIds: [evidence.objectId],
      requirementContextIds: ["requirement-1"],
      assumptionContextIds: ["assumption-1"],
      decisionContextIds: ["decision-1"],
      changeContextIds: ["change-1"],
      limitations: "Geotechnical truth is not created by this handoff.",
      handoffStatus: "AWAITING_COUNTERPART",
      citedCurrentness: "CURRENT",
      provenanceRef: "prov-handoff",
    });
    const store = createD2R9Store(r8);
    const subject = {
      subjectKind: "OBJECT",
      subjectId: gradingObject.objectId,
      subjectRevision: gradingObject.fingerprint,
      subjectFingerprint: gradingObject.fingerprint,
      contextId: context.contextId,
      evidenceObjectIds: [evidence.objectId],
      requirementContextIds: [requirement.requirementContextId],
      assumptionContextIds: ["assumption-1"],
      decisionContextIds: ["decision-1"],
      handoffIds: [handoff.handoffId],
    };
    const request = recordCivilReviewRequest(store, actor, {
      ...subject,
      reviewRequestId: "review-1",
      reviewType: "CIVIL_SUBJECT_REVIEW",
      requestedReviewerAuthority: "REVIEWER",
      limitations: "A request does not complete the review.",
      requestedAt: "2026-10-23T01:00:00.000Z",
      citedCurrentness: "CURRENT",
      provenanceRef: "prov-review",
    });
    expect(request.requestStatus).toBe("REQUESTED");
    expect(request.reviewCompleted).toBe(false);
    expect(request.engineeringValidated).toBe(false);
    expect(request.subjectRevision).toBe(gradingObject.fingerprint);
    expect(recordCivilReviewRequest(store, actor, {
      ...subject,
      reviewRequestId: "review-1",
      reviewType: "CIVIL_SUBJECT_REVIEW",
      requestedReviewerAuthority: "REVIEWER",
      limitations: "A request does not complete the review.",
      requestedAt: "2026-10-23T01:00:00.000Z",
      citedCurrentness: "CURRENT",
      provenanceRef: "prov-review",
    }).fingerprint).toBe(request.fingerprint);
    expect(store.history.filter((row) => row.subjectId === "review-1")).toHaveLength(1);
    expect(() => recordCivilReviewRequest(store, actor, { ...subject, subjectRevision: "latest", reviewRequestId: "review-float", reviewType: "CIVIL_SUBJECT_REVIEW", requestedReviewerAuthority: "REVIEWER", limitations: "Floating revision.", requestedAt: "2026-10-23T01:00:00.000Z", citedCurrentness: "CURRENT", provenanceRef: "prov-float" })).toThrow(/SUBJECT_REVISION_REQUIRED/);
    expect(() => recordCivilReviewRequest(store, actor, { ...subject, reviewRequestId: "review-2", reviewType: "CIVIL_SUBJECT_REVIEW", requestedReviewerAuthority: "REVIEWER", limitations: "Duplicate subject.", requestedAt: "2026-10-23T01:00:00.000Z", citedCurrentness: "CURRENT", provenanceRef: "prov-dup" })).toThrow(/DUPLICATE_REVIEW_REQUEST_REJECTED/);
    expect(() => recordCivilReviewRequest(store, actor, { ...subject, subjectFingerprint: "spoofed-fingerprint", reviewRequestId: "review-spoof", reviewType: "CIVIL_SUBJECT_REVIEW", requestedReviewerAuthority: "REVIEWER", limitations: "Spoofed fingerprint.", requestedAt: "2026-10-23T01:00:00.000Z", citedCurrentness: "CURRENT", provenanceRef: "prov-spoof" })).toThrow(/SUBJECT_REVISION_MISMATCH/);
    expect(() => recordCivilReviewRequest(store, actor, { ...subject, reviewRequestId: "review-scope", reviewType: "CIVIL_SUBJECT_REVIEW", requestedReviewerAuthority: "REVIEWER", limitations: "Wrong workspace.", requestedAt: "2026-10-23T01:00:00.000Z", citedCurrentness: "CURRENT", provenanceRef: "prov-scope", workspaceId: "workspace-b" })).toThrow(/CROSS_WORKSPACE_OPERATION/);
    expect(() => recordCivilReviewRequest(store, { ...actor, actorId: "AI-assistant", authority: "AI_ASSISTANT" }, { ...subject, reviewRequestId: "review-ai", reviewType: "CIVIL_SUBJECT_REVIEW", requestedReviewerAuthority: "REVIEWER", limitations: "AI request.", requestedAt: "2026-10-23T01:00:00.000Z", citedCurrentness: "CURRENT", provenanceRef: "prov-ai" })).toThrow(/AI_NOT_CIVIL_AUTHORITY/);
    expect(() => recordCivilReviewRequest(store, { ...actor, authority: "ADMINISTRATOR" }, { ...subject, reviewRequestId: "review-admin", reviewType: "CIVIL_SUBJECT_REVIEW", requestedReviewerAuthority: "ADMINISTRATOR", limitations: "Admin request.", requestedAt: "2026-10-23T01:00:00.000Z", citedCurrentness: "CURRENT", provenanceRef: "prov-admin" })).toThrow(/ADMIN_NOT_CIVIL_AUTHORITY/);
    expect(() => recordCivilReviewRequest(store, actor, { ...subject, reviewRequestId: "review-done", reviewType: "CIVIL_SUBJECT_REVIEW", requestedReviewerAuthority: "REVIEWER", limitations: "Completion is not a request.", requestedAt: "2026-10-23T01:00:00.000Z", citedCurrentness: "CURRENT", provenanceRef: "prov-done", reviewCompleted: true })).toThrow(/REVIEW_REQUEST_NOT_COMPLETION/);

    const finding = recordCivilReviewFinding(store, reviewer, {
      ...subject,
      findingId: "finding-1",
      reviewRequestId: request.reviewRequestId,
      severity: "INFORMATION_GAP",
      findingText: "The cited level still needs the supplied survey note checked by a reviewer.",
      disposition: "REASSESSMENT_REQUESTED",
      affectedObjectId: gradingObject.objectId,
      changeContextId: "change-1",
      limitations: "A finding does not change the grading object.",
      citedCurrentness: "CURRENT",
      provenanceRef: "prov-finding",
    });
    expect(finding.engineeringInvalid).toBe(false);
    expect(finding.automaticDesignChange).toBe(false);
    expect(finding.engineeringValidated).toBe(false);
    expect(finding.reviewerAuthority).toBe("REVIEWER");
    expect(finding.aal).toBe("aal2");
    expect(request.reviewCompleted).toBe(false);
    expect(gradingObject.fingerprint).toBe(subject.subjectFingerprint);
    expect(r7.reassessments).toHaveLength(1);
    expect(() => recordCivilReviewFinding(store, { ...reviewer, actorId: "AI-reviewer", authority: "AI_ASSISTANT", actorKind: "ai" }, { ...subject, findingId: "finding-ai", reviewRequestId: request.reviewRequestId, severity: "INFORMATION_GAP", findingText: "AI finding.", disposition: "OPEN", affectedObjectId: gradingObject.objectId, limitations: "AI is not a reviewer.", citedCurrentness: "CURRENT", provenanceRef: "prov-finding-ai" })).toThrow(/AI_NOT_CIVIL_REVIEWER/);
    expect(() => recordCivilReviewFinding(store, { ...reviewer, actorId: "admin-1", authority: "ADMINISTRATOR", actorKind: "human" }, { ...subject, findingId: "finding-admin", reviewRequestId: request.reviewRequestId, severity: "INFORMATION_GAP", findingText: "Admin finding.", disposition: "OPEN", affectedObjectId: gradingObject.objectId, limitations: "Admin is not a reviewer.", citedCurrentness: "CURRENT", provenanceRef: "prov-finding-admin" })).toThrow(/ADMIN_NOT_CIVIL_REVIEWER/);
    expect(() => recordCivilReviewFinding(store, { ...reviewer, aal: "aal1" }, { ...subject, findingId: "finding-aal", reviewRequestId: request.reviewRequestId, severity: "INFORMATION_GAP", findingText: "Weak assurance.", disposition: "OPEN", affectedObjectId: gradingObject.objectId, limitations: "AAL2 is required.", citedCurrentness: "CURRENT", provenanceRef: "prov-aal" })).toThrow(/AAL2_REQUIRED/);
    expect(() => recordCivilReviewFinding(store, { ...reviewer, authority: D2_CONTEXT_AUTHORITY }, { ...subject, findingId: "finding-unauth", reviewRequestId: request.reviewRequestId, severity: "INFORMATION_GAP", findingText: "Recorder is not a reviewer.", disposition: "OPEN", affectedObjectId: gradingObject.objectId, limitations: "Authority is required.", citedCurrentness: "CURRENT", provenanceRef: "prov-unauth" })).toThrow(/REVIEWER_AUTHORITY_REQUIRED/);
    expect(() => recordCivilReviewFinding(store, reviewer, { ...subject, findingId: "finding-change", reviewRequestId: request.reviewRequestId, severity: "INFORMATION_GAP", findingText: "No automatic change.", disposition: "OPEN", affectedObjectId: gradingObject.objectId, limitations: "No design change.", citedCurrentness: "CURRENT", provenanceRef: "prov-no-change", automaticResolution: true })).toThrow(/AUTOMATIC_FINDING_RESOLUTION_REJECTED/);

    const notValidated = recordCivilValidationGovernance(store, reviewer, {
      ...subject,
      validationId: "validation-open",
      reviewRequestId: request.reviewRequestId,
      validationScope: "cited finished level",
      requiredEvidenceObjectIds: [evidence.objectId],
      validationState: "NOT_VALIDATED",
      limitations: "Evidence on its own is not validation.",
      citedCurrentness: "CURRENT",
      provenanceRef: "prov-validation-open",
    });
    expect(notValidated.engineeringValidated).toBe(false);
    expect(notValidated.evidenceActuallyPresent).toEqual([evidence.objectId]);
    const validated = recordCivilValidationGovernance(store, reviewer, {
      ...subject,
      validationId: "validation-1",
      reviewRequestId: request.reviewRequestId,
      validationScope: "cited finished level record",
      requiredEvidenceObjectIds: [evidence.objectId],
      validationState: "VALIDATED",
      limitations: "Validation is not approval, conformance, or certification.",
      citedCurrentness: "CURRENT",
      provenanceRef: "prov-validation",
    });
    expect(validated.engineeringValidated).toBe(true);
    expect(validated.conformant).toBe(false);
    expect(validated.engineeringApproved).toBe(false);
    expect(validated.certified).toBe(false);
    expect(validated.subjectRevision).toBe(gradingObject.fingerprint);
    expect(gradingObject.fingerprint).toBe(subject.subjectFingerprint);
    expect(() => recordCivilValidationGovernance(store, reviewer, { ...subject, evidenceObjectIds: [], validationId: "validation-empty", validationScope: "missing evidence", requiredEvidenceObjectIds: [], validationState: "VALIDATED", limitations: "Missing evidence.", citedCurrentness: "CURRENT", provenanceRef: "prov-empty" })).toThrow(/EVIDENCE_REQUIRED_FOR_VALIDATION/);
    expect(() => recordCivilValidationGovernance(store, { ...reviewer, actorId: "AI-validator", authority: "AI", actorKind: "ai" }, { ...subject, validationId: "validation-ai", validationScope: "ai", requiredEvidenceObjectIds: [evidence.objectId], validationState: "VALIDATED", limitations: "AI cannot validate.", citedCurrentness: "CURRENT", provenanceRef: "prov-val-ai" })).toThrow(/AI_CANNOT_VALIDATE/);
    expect(() => recordCivilValidationGovernance(store, { ...reviewer, authority: "ADMIN" }, { ...subject, validationId: "validation-admin", validationScope: "admin", requiredEvidenceObjectIds: [evidence.objectId], validationState: "VALIDATED", limitations: "Admin cannot validate.", citedCurrentness: "CURRENT", provenanceRef: "prov-val-admin" })).toThrow(/ADMIN_CANNOT_VALIDATE/);
    expect(() => recordCivilValidationGovernance(store, reviewer, { ...subject, validationId: "validation-approve", validationScope: "approval", requiredEvidenceObjectIds: [evidence.objectId], validationState: "VALIDATED", limitations: "No approval.", citedCurrentness: "CURRENT", provenanceRef: "prov-approve", approve: true })).toThrow(/APPROVAL_NOT_IN_R9/);
    expect(() => recordCivilValidationGovernance(store, reviewer, { ...subject, validationId: "validation-cert", validationScope: "certification", requiredEvidenceObjectIds: [evidence.objectId], validationState: "NOT_VALIDATED", limitations: "No certification.", citedCurrentness: "CURRENT", provenanceRef: "prov-cert", certify: true })).toThrow(/CERTIFICATION_NOT_IN_R9/);
    expect(() => recordCivilValidationGovernance(store, reviewer, { ...subject, validationId: "validation-conform", validationScope: "conformance", requiredEvidenceObjectIds: [evidence.objectId], validationState: "NOT_VALIDATED", limitations: "No conformance.", citedCurrentness: "CURRENT", provenanceRef: "prov-conform", conform: true })).toThrow(/CONFORMANCE_NOT_IN_R9/);

    const successor = recordCivilObjectIdentity(r1, actor, {
      objectId: "grading-object-2",
      contextId: context.contextId,
      objectType: "GRADING_ZONE",
      citedLifecycleStage: "CONCEPT",
      provenanceRef: "prov-grading-2",
      predecessorObjectId: gradingObject.objectId,
    });
    expect(r1.objects.find((row) => row.objectId === gradingObject.objectId)?.recordStatus).toBe("SUPERSEDED");
    expect(validated.subjectId).toBe(gradingObject.objectId);
    expect(validated.subjectRevision).toBe(subject.subjectFingerprint);
    expect(successor.fingerprint).not.toBe(gradingObject.fingerprint);
    expect(() => recordCivilValidationGovernance(store, reviewer, { ...subject, validationId: "validation-stale-current", validationScope: "old revision as current", requiredEvidenceObjectIds: [evidence.objectId], validationState: "NOT_VALIDATED", limitations: "The old revision is not current.", citedCurrentness: "CURRENT", provenanceRef: "prov-old-current" })).toThrow(/SUBJECT_NOT_CURRENT/);
    expect(() => recordCivilValidationGovernance(store, reviewer, {
      subjectKind: "OBJECT",
      subjectId: successor.objectId,
      subjectRevision: successor.fingerprint,
      subjectFingerprint: successor.fingerprint,
      contextId: context.contextId,
      evidenceObjectIds: [evidence.objectId],
      requirementContextIds: ["requirement-1"],
      assumptionContextIds: ["assumption-1"],
      decisionContextIds: ["decision-1"],
      handoffIds: [handoff.handoffId],
      validationId: "validation-transfer",
      validationScope: "new revision",
      requiredEvidenceObjectIds: [evidence.objectId],
      validationState: "VALIDATED",
      limitations: "Prior validation does not move.",
      citedCurrentness: "CURRENT",
      provenanceRef: "prov-transfer",
      predecessorValidationId: validated.validationId,
    })).toThrow(/VALIDATION_TRANSFER_REJECTED/);
    const fresh = recordCivilValidationGovernance(store, reviewer, {
      subjectKind: "OBJECT",
      subjectId: successor.objectId,
      subjectRevision: successor.fingerprint,
      subjectFingerprint: successor.fingerprint,
      contextId: context.contextId,
      evidenceObjectIds: [evidence.objectId],
      requirementContextIds: ["requirement-1"],
      assumptionContextIds: ["assumption-1"],
      decisionContextIds: ["decision-1"],
      handoffIds: [handoff.handoffId],
      validationId: "validation-new",
      validationScope: "new revision",
      requiredEvidenceObjectIds: [evidence.objectId],
      validationState: "NOT_VALIDATED",
      limitations: "The new revision needs its own review.",
      citedCurrentness: "CURRENT",
      provenanceRef: "prov-new",
    });
    expect(fresh.engineeringValidated).toBe(false);
    expect(fresh.subjectId).toBe(successor.objectId);
    const stale = recordCivilValidationGovernance(store, reviewer, {
      ...subject,
      validationId: "validation-stale",
      validationScope: "cited finished level record",
      requiredEvidenceObjectIds: [evidence.objectId],
      validationState: "STALE",
      limitations: "The original revision is stale and is not repointed.",
      citedCurrentness: "STALE",
      provenanceRef: "prov-stale",
      predecessorValidationId: validated.validationId,
    });
    expect(stale.subjectId).toBe(gradingObject.objectId);
    expect(stale.subjectRevision).toBe(subject.subjectFingerprint);
    expect(stale.subjectId).not.toBe(successor.objectId);
    expect(store.validations.find((row) => row.validationId === validated.validationId)?.recordStatus).toBe("SUPERSEDED");
    expect(store.validations.find((row) => row.validationId === validated.validationId)?.subjectRevision).toBe(subject.subjectFingerprint);
    expect(store.history.some((row) => row.action === "SUPERSEDED" && row.subjectId === validated.validationId)).toBe(true);

    const handoffRequest = recordCivilReviewRequest(store, actor, {
      subjectKind: "HANDOFF",
      subjectId: handoff.handoffId,
      subjectRevision: handoff.sourceRevision,
      subjectFingerprint: handoff.fingerprint,
      contextId: context.contextId,
      evidenceObjectIds: [evidence.objectId],
      requirementContextIds: ["requirement-1"],
      assumptionContextIds: ["assumption-1"],
      decisionContextIds: ["decision-1"],
      handoffIds: [handoff.handoffId],
      reviewRequestId: "review-handoff",
      reviewType: "INTERFACE_HANDOFF_REVIEW",
      requestedReviewerAuthority: "REVIEWER",
      limitations: "Civil review of the handoff is not geotechnical validation.",
      requestedAt: "2026-10-23T02:00:00.000Z",
      citedCurrentness: "CURRENT",
      provenanceRef: "prov-handoff-review",
    });
    const handoffValidation = recordCivilValidationGovernance(store, reviewer, {
      subjectKind: "HANDOFF",
      subjectId: handoff.handoffId,
      subjectRevision: handoff.sourceRevision,
      subjectFingerprint: handoff.fingerprint,
      contextId: context.contextId,
      evidenceObjectIds: [evidence.objectId],
      requirementContextIds: ["requirement-1"],
      assumptionContextIds: ["assumption-1"],
      decisionContextIds: ["decision-1"],
      handoffIds: [handoff.handoffId],
      validationId: "validation-handoff",
      reviewRequestId: handoffRequest.reviewRequestId,
      validationScope: "civil handoff record",
      requiredEvidenceObjectIds: [evidence.objectId],
      validationState: "VALIDATED",
      limitations: "The counterpart discipline is not validated.",
      citedCurrentness: "CURRENT",
      provenanceRef: "prov-handoff-validation",
    });
    expect(handoffValidation.counterpartDisciplineValidated).toBe(false);
    expect(handoffValidation.d1Validated).toBe(false);
    expect(handoffValidation.d3Validated).toBe(false);
    expect(handoff.fingerprint).toBe(handoffValidation.subjectFingerprint);
    expect(() => recordCivilValidationGovernance(store, reviewer, {
      subjectKind: "HANDOFF",
      subjectId: handoff.handoffId,
      subjectRevision: handoff.sourceRevision,
      subjectFingerprint: handoff.fingerprint,
      contextId: context.contextId,
      evidenceObjectIds: [evidence.objectId],
      requirementContextIds: [],
      assumptionContextIds: [],
      decisionContextIds: [],
      handoffIds: [],
      validationId: "validation-d1",
      validationScope: "structural truth",
      requiredEvidenceObjectIds: [evidence.objectId],
      validationState: "NOT_VALIDATED",
      limitations: "D1 is not validated here.",
      citedCurrentness: "CURRENT",
      provenanceRef: "prov-d1",
      validateD1: true,
    })).toThrow(/COUNTERPART_VALIDATION_REJECTED/);
    expect(() => mutateReviewedSubject()).toThrow(/SUBJECT_MUTATION_REJECTED/);
    expect(() => transferPriorReview()).toThrow(/REVIEW_TRANSFER_REJECTED/);
    expect(() => transferPriorValidation()).toThrow(/VALIDATION_TRANSFER_REJECTED/);
    expect(() => repointStaleReview()).toThrow(/AUTO_REPOINT_REJECTED/);
    expect(() => repointStaleValidation()).toThrow(/AUTO_REPOINT_REJECTED/);
    expect(() => automaticallyValidateCivilEngineering()).toThrow(/AUTOMATIC_VALIDATION_REJECTED/);
    expect(() => approveCivilWork()).toThrow(/APPROVAL_NOT_IN_R9/);
    expect(() => certifyCivilWork()).toThrow(/CERTIFICATION_NOT_IN_R9/);
    expect(() => resolveReviewFinding()).toThrow(/AUTOMATIC_FINDING_RESOLUTION_REJECTED/);
    const here = dirname(fileURLToPath(import.meta.url));
    const sourceText = readFileSync(join(here, "review-validation-governance.ts"), "utf8");
    expect(sourceText).toContain("fingerprintCanonical");
    expect(sourceText).toContain("resolveAuthAssuranceLevel");
    expect(sourceText).toContain("assertHumanApprovalActor");
    expect(sourceText).toContain("PRE_ISSUE_AI_BOUNDARY");
    expect(sourceText).not.toMatch(/createHash|from ["']@rtb\/engineering-review["']|CREATE TABLE/);
    expect(scanAnalysisFormulaBypass(join(here, "review-validation-governance.ts"), sourceText)).toEqual([]);
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D2.R9.REVIEW_AND_VALIDATION_GOVERNANCE")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D2.R10.CURRENTNESS_AND_DIGITAL_THREAD")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
  });
});
