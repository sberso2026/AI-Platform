import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { D2_RUNTIME_COUNT as D2_ARCHITECTURE_RUNTIME_COUNT, D3_0_RUNTIME_STARTED, D3_RUNTIME_COUNT as ARCHITECTURE_RUNTIME_COUNT } from "@rtb/types";
import { describe, expect, it } from "vitest";
import { D2_RUNTIME_COUNT_AFTER_R12, D2_TRACK_COMPLETE, D2_TRACK_COMPLETION_CLASSIFICATION } from "../civil/civil-bounded-closeout";
import { STRUCTURAL_CAPABILITY_MANIFEST } from "../structural-concrete/capability";
import { scanAnalysisFormulaBypass } from "../structural-systems/formula-scan";
import { D1_STRUCTURAL_PACK_COMPLETE, D1N_REOPENED } from "../structural-systems/structural-pack-sequencing";
import { D3_CONTEXT_AUTHORITY, createD3R1Store, recordGeotechnicalContext, recordGeotechnicalObjectIdentity, type D3R1Actor } from "./identity-foundation";
import { createD3R2Store, recordInvestigationEvidenceReference } from "./site-investigation-evidence";
import { createD3R3Store } from "./stratigraphy-groundwater-material";
import { createD3R4Store } from "./field-lab-test-context";
import { createD3R5Store } from "./geotechnical-parameter-context";
import { createD3R6Store } from "./foundation-excavation-slope-context";
import { D3_R8_STARTED, D3_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_READY as R7_REVIEW_READY, D3_RUNTIME_COUNT as R7_RUNTIME_COUNT, createD3R7Store, recordGeotechnicalChange } from "./requirements-assumptions-change";
import { D3_R9_STARTED, D3_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_READY as R8_REVIEW_READY, D3_RUNTIME_COUNT as R8_RUNTIME_COUNT, createD3R8Store, recordGeotechnicalInterfaceHandoff } from "./discipline-interfaces-handoffs";
import {
  ADMIN_CAN_AUTOMATICALLY_VALIDATE_D3_ENGINEERING,
  ADMIN_EQUALS_D3_REVIEWER_AUTHORITY,
  ADMIN_REVIEW_ACTION_EQUALS_ENGINEERING_VALIDATION,
  AI_CAN_AUTOMATICALLY_VALIDATE_D3_ENGINEERING,
  AI_EQUALS_D3_REVIEWER_AUTHORITY,
  AI_GENERATED_REVIEW_EQUALS_ENGINEERING_VALIDATION,
  CANONICAL_CURRENTNESS_REUSED,
  CANONICAL_FINGERPRINT_REUSED,
  D2_REOPENED,
  D3_APPROVAL_RUNTIME_COUNT,
  D3_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT,
  D3_AUTOMATIC_PARAMETER_DERIVATION_RUNTIME_COUNT,
  D3_AUTOMATIC_REDESIGN_RUNTIME_COUNT,
  D3_BEARING_CAPACITY_RUNTIME_COUNT,
  D3_CERTIFICATION_RUNTIME_COUNT,
  D3_CONFORMANCE_CERTIFICATION_RUNTIME_COUNT,
  D3_CONFORMANCE_DETERMINATION_RUNTIME_COUNT,
  D3_CROSS_DISCIPLINE_CONFLICT_DETECTION_RUNTIME_COUNT,
  D3_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT,
  D3_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT,
  D3_CROSS_DISCIPLINE_RECOMMENDATION_RUNTIME_COUNT,
  D3_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT,
  D3_CURRENTNESS_DIGITAL_THREAD_RUNTIME_READY,
  D3_D9_RUNTIME_INTEGRATION_COUNT,
  D3_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
  D3_D9_SOURCE_CONTRACT_RUNTIME_READY,
  D3_DISCIPLINE_INTERFACE_RUNTIME_READY,
  D3_EARTH_PRESSURE_RUNTIME_COUNT,
  D3_EXCAVATION_SUPPORT_DESIGN_RUNTIME_COUNT,
  D3_FIELD_LAB_TEST_RUNTIME_READY,
  D3_FINDING_AUTO_CHANGES_R3_INTERPRETATION,
  D3_FINDING_AUTO_CHANGES_R4_TEST_RESULT,
  D3_FINDING_AUTO_CHANGES_R5_PARAMETER,
  D3_FINDING_AUTO_CHANGES_R6_RECOMMENDATION,
  D3_FINDING_AUTO_CHANGES_R7_DECISION,
  D3_FINDING_AUTO_CHANGES_R8_HANDOFF,
  D3_FINDING_AUTO_INVALIDATES_ENGINEERING,
  D3_FINDING_AUTO_MUTATES_ENGINEERING,
  D3_FOUNDATION_CALCULATION_RUNTIME_COUNT,
  D3_FOUNDATION_EXCAVATION_SLOPE_RUNTIME_READY,
  D3_GEOTECHNICAL_IDENTITY_OBJECT_FOUNDATION_RUNTIME_READY,
  D3_GEOTECHNICAL_PARAMETER_RUNTIME_READY,
  D3_GROUND_IMPROVEMENT_DESIGN_RUNTIME_COUNT,
  D3_PILE_CAPACITY_RUNTIME_COUNT,
  D3_R10_CANONICAL_PHASE,
  D3_R10_CANONICAL_SCOPE,
  D3_R10_PHASE_TYPE,
  D3_R10_STARTED,
  D3_R7_CHANGE_GOVERNANCE_REUSED,
  D3_R9_AUTO_REPOINTED,
  D3_R9_BLOCKER,
  D3_R9_CANONICAL_NEXT_PHASE,
  D3_R9_CANONICAL_NEXT_PHASE_SCOPE,
  D3_R9_DUPLICATE_GOVERNANCE_IMPLEMENTED,
  D3_R9_HISTORY_PRESERVED,
  D3_R9_MATURITY,
  D3_R9_NEXT_PHASE_TYPE,
  D3_R9_PROVENANCE_PRESERVED,
  D3_R9_PROVENANCE_REQUIRED,
  D3_R9_REPLAY_PROTECTION_IMPLEMENTED,
  D3_R9_SPOOFING_PROTECTION_IMPLEMENTED,
  D3_R9_STATUS,
  D3_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY,
  D3_RETAINING_SYSTEM_ANALYSIS_RUNTIME_COUNT,
  D3_REVIEW_COMPLETION_STATE_IMPLEMENTED,
  D3_REVIEW_FINDING_CONTEXT_IMPLEMENTED,
  D3_REVIEW_REQUEST_CONTEXT_IMPLEMENTED,
  D3_REVIEW_SUBJECT_AUTO_REPOINTED,
  D3_REVIEW_VALIDATES_D1_STRUCTURAL_ENGINEERING,
  D3_REVIEW_VALIDATES_D2_CIVIL_ENGINEERING,
  D3_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_COUNT,
  D3_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_IMPLEMENTED,
  D3_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_READY,
  D3_REVIEWER_AUTHORITY_EXPLICIT,
  D3_REUSES_CANONICAL_REVIEW_GOVERNANCE,
  D3_REUSES_CANONICAL_VALIDATION_GOVERNANCE,
  D3_RUNTIME_COUNT,
  D3_RUNTIME_STARTED,
  D3_SETTLEMENT_CALCULATION_RUNTIME_COUNT,
  D3_SITE_INVESTIGATION_EVIDENCE_RUNTIME_READY,
  D3_SLOPE_STABILITY_RUNTIME_COUNT,
  D3_STRATIGRAPHY_GROUNDWATER_MATERIAL_RUNTIME_READY,
  D3_VALIDATION_STATE_IMPLEMENTED,
  D3_VALIDATION_VALIDATES_COUNTERPART_DISCIPLINE,
  D4_RUNTIME_STARTED,
  D5_RUNTIME_STARTED,
  D6_RUNTIME_STARTED,
  D7_RUNTIME_STARTED,
  D8_RUNTIME_STARTED,
  D9_RUNTIME_COUNT,
  D9_RUNTIME_STARTED,
  DATABASE_SCHEMA_CHANGED,
  EXACT_D3_REVIEW_SUBJECT_REVISION_REQUIRED,
  FLOATING_D3_REVIEW_SUBJECT_REFERENCE_ALLOWED,
  NEW_DEPENDENCY_ADDED,
  PARALLEL_D3_CURRENTNESS_ENGINE_CREATED,
  PARALLEL_D3_REVIEW_SYSTEM_CREATED,
  PARALLEL_D3_VALIDATION_SYSTEM_CREATED,
  PRIOR_D3_REVIEW_AUTO_TRANSFERS_TO_NEW_REVISION,
  PRIOR_D3_VALIDATION_AUTO_TRANSFERS_TO_NEW_REVISION,
  REASSESSMENT_COMPLETED_EQUALS_ENGINEERING_VALIDATED,
  REASSESSMENT_REQUIRED_EQUALS_ENGINEERING_VALIDATED,
  REASSESSMENT_REQUIRED_RECORD_EXPOSED_AS_VALIDATED,
  REVIEW_COMPLETED_EQUALS_APPROVED,
  REVIEW_COMPLETED_EQUALS_CERTIFIED,
  REVIEW_COMPLETED_EQUALS_CONFORMANT,
  REVIEW_COMPLETED_EQUALS_ENGINEERING_VALIDATED,
  REVIEW_REQUEST_EQUALS_ENGINEERING_VALIDATED,
  REVIEW_REQUEST_EQUALS_REVIEW_COMPLETED,
  SECOND_FINGERPRINT_ALGORITHM_CREATED,
  SILENT_D3_R9_MUTATION_ALLOWED,
  STALE_D3_VALIDATION_EXPOSED_AS_CURRENT,
  TENANT_WORKSPACE_PROJECT_D3_R9_SCOPE_ENFORCED,
  VALIDATED_EQUALS_CERTIFIED,
  VALIDATED_EQUALS_CONFORMANT,
  VALIDATED_EQUALS_ENGINEERING_APPROVED,
  approveGeotechnicalEngineering,
  automaticallyValidateGeotechnicalEngineering,
  certifyGeotechnicalEngineering,
  conformGeotechnicalEngineering,
  createD3R9Store,
  mutateReviewedGeotechnicalSubject,
  recordGeotechnicalReviewCompletion,
  recordGeotechnicalReviewFinding,
  recordGeotechnicalReviewRequest,
  recordGeotechnicalValidationState,
  repointGeotechnicalReview,
  transferPriorGeotechnicalReview,
  transferPriorGeotechnicalValidation,
  type D3R9Actor,
} from "./review-validation-governance";

const actor: D3R1Actor = {
  actorId: "geotechnical-recorder",
  tenantId: "tenant-a",
  workspaceId: "workspace-a",
  projectId: "project-a",
  authority: D3_CONTEXT_AUTHORITY,
};

const reviewer: D3R9Actor = {
  actorId: "geotechnical-reviewer",
  tenantId: "tenant-a",
  workspaceId: "workspace-a",
  projectId: "project-a",
  authority: "REVIEWER",
  actorKind: "human",
  aal: "aal2",
};

const R10_SCOPE = "Integrate canonical currentness, exact revision lineage, supersession, explicit dependency/currentness propagation, reassessment semantics, review/validation currentness and interface/handoff currentness across D3 R1-R9. Reuse canonical EOS currentness, digital-thread and fingerprint mechanisms. Do not infer dependencies, auto-recalculate, redesign, revalidate, approve, certify or start D4-D9.";

describe("EOS-D3-R9 review and validation governance", () => {
  it("records review and explicit validation on exact revisions without promoting conformance, approval, or certification", () => {
    expect(D3_R9_STATUS).toBe("REVIEW_AND_VALIDATION_GOVERNANCE_IMPLEMENTED");
    expect(D3_R9_MATURITY).toBe(D3_R9_STATUS);
    expect(D3_RUNTIME_STARTED).toBe(true);
    expect(D3_RUNTIME_COUNT).toBe(9);
    expect(R8_RUNTIME_COUNT).toBe(8);
    expect(R7_RUNTIME_COUNT).toBe(7);
    expect(ARCHITECTURE_RUNTIME_COUNT).toBe(0);
    expect(D3_0_RUNTIME_STARTED).toBe(false);
    expect(D3_R8_STARTED).toBe(false);
    expect(D3_R9_STARTED).toBe(false);
    expect(R7_REVIEW_READY).toBe(false);
    expect(R8_REVIEW_READY).toBe(false);
    expect(D3_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_IMPLEMENTED).toBe(true);
    expect(D3_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_COUNT).toBe(1);
    expect(D3_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_READY).toBe(true);
    expect(D3_GEOTECHNICAL_IDENTITY_OBJECT_FOUNDATION_RUNTIME_READY).toBe(true);
    expect(D3_SITE_INVESTIGATION_EVIDENCE_RUNTIME_READY).toBe(true);
    expect(D3_STRATIGRAPHY_GROUNDWATER_MATERIAL_RUNTIME_READY).toBe(true);
    expect(D3_FIELD_LAB_TEST_RUNTIME_READY).toBe(true);
    expect(D3_GEOTECHNICAL_PARAMETER_RUNTIME_READY).toBe(true);
    expect(D3_FOUNDATION_EXCAVATION_SLOPE_RUNTIME_READY).toBe(true);
    expect(D3_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY).toBe(true);
    expect(D3_DISCIPLINE_INTERFACE_RUNTIME_READY).toBe(true);
    expect(D3_CURRENTNESS_DIGITAL_THREAD_RUNTIME_READY).toBe(false);
    expect(D3_D9_SOURCE_CONTRACT_RUNTIME_READY).toBe(false);
    expect(D3_REUSES_CANONICAL_REVIEW_GOVERNANCE).toBe(true);
    expect(D3_REUSES_CANONICAL_VALIDATION_GOVERNANCE).toBe(true);
    expect(PARALLEL_D3_REVIEW_SYSTEM_CREATED).toBe(false);
    expect(PARALLEL_D3_VALIDATION_SYSTEM_CREATED).toBe(false);
    expect(PARALLEL_D3_CURRENTNESS_ENGINE_CREATED).toBe(false);
    expect(EXACT_D3_REVIEW_SUBJECT_REVISION_REQUIRED).toBe(true);
    expect(FLOATING_D3_REVIEW_SUBJECT_REFERENCE_ALLOWED).toBe(false);
    expect(D3_REVIEW_SUBJECT_AUTO_REPOINTED).toBe(false);
    expect(D3_REVIEW_REQUEST_CONTEXT_IMPLEMENTED).toBe(true);
    expect(D3_REVIEWER_AUTHORITY_EXPLICIT).toBe(true);
    expect(D3_REVIEW_FINDING_CONTEXT_IMPLEMENTED).toBe(true);
    expect(D3_REVIEW_COMPLETION_STATE_IMPLEMENTED).toBe(true);
    expect(D3_VALIDATION_STATE_IMPLEMENTED).toBe(true);
    expect(REVIEW_REQUEST_EQUALS_REVIEW_COMPLETED).toBe(false);
    expect(REVIEW_REQUEST_EQUALS_ENGINEERING_VALIDATED).toBe(false);
    expect(REVIEW_COMPLETED_EQUALS_ENGINEERING_VALIDATED).toBe(false);
    expect(REVIEW_COMPLETED_EQUALS_CONFORMANT).toBe(false);
    expect(REVIEW_COMPLETED_EQUALS_APPROVED).toBe(false);
    expect(REVIEW_COMPLETED_EQUALS_CERTIFIED).toBe(false);
    expect(VALIDATED_EQUALS_CONFORMANT).toBe(false);
    expect(VALIDATED_EQUALS_ENGINEERING_APPROVED).toBe(false);
    expect(VALIDATED_EQUALS_CERTIFIED).toBe(false);
    expect(AI_EQUALS_D3_REVIEWER_AUTHORITY).toBe(false);
    expect(ADMIN_EQUALS_D3_REVIEWER_AUTHORITY).toBe(false);
    expect(AI_CAN_AUTOMATICALLY_VALIDATE_D3_ENGINEERING).toBe(false);
    expect(ADMIN_CAN_AUTOMATICALLY_VALIDATE_D3_ENGINEERING).toBe(false);
    expect(AI_GENERATED_REVIEW_EQUALS_ENGINEERING_VALIDATION).toBe(false);
    expect(ADMIN_REVIEW_ACTION_EQUALS_ENGINEERING_VALIDATION).toBe(false);
    expect(D3_FINDING_AUTO_MUTATES_ENGINEERING).toBe(false);
    expect(D3_FINDING_AUTO_INVALIDATES_ENGINEERING).toBe(false);
    expect(D3_FINDING_AUTO_CHANGES_R3_INTERPRETATION).toBe(false);
    expect(D3_FINDING_AUTO_CHANGES_R4_TEST_RESULT).toBe(false);
    expect(D3_FINDING_AUTO_CHANGES_R5_PARAMETER).toBe(false);
    expect(D3_FINDING_AUTO_CHANGES_R6_RECOMMENDATION).toBe(false);
    expect(D3_FINDING_AUTO_CHANGES_R7_DECISION).toBe(false);
    expect(D3_FINDING_AUTO_CHANGES_R8_HANDOFF).toBe(false);
    expect(PRIOR_D3_REVIEW_AUTO_TRANSFERS_TO_NEW_REVISION).toBe(false);
    expect(PRIOR_D3_VALIDATION_AUTO_TRANSFERS_TO_NEW_REVISION).toBe(false);
    expect(D3_R7_CHANGE_GOVERNANCE_REUSED).toBe(true);
    expect(REASSESSMENT_REQUIRED_EQUALS_ENGINEERING_VALIDATED).toBe(false);
    expect(REASSESSMENT_COMPLETED_EQUALS_ENGINEERING_VALIDATED).toBe(false);
    expect(D3_REVIEW_VALIDATES_D1_STRUCTURAL_ENGINEERING).toBe(false);
    expect(D3_REVIEW_VALIDATES_D2_CIVIL_ENGINEERING).toBe(false);
    expect(D3_VALIDATION_VALIDATES_COUNTERPART_DISCIPLINE).toBe(false);
    expect(STALE_D3_VALIDATION_EXPOSED_AS_CURRENT).toBe(false);
    expect(REASSESSMENT_REQUIRED_RECORD_EXPOSED_AS_VALIDATED).toBe(false);
    expect(CANONICAL_CURRENTNESS_REUSED).toBe(true);
    expect(CANONICAL_FINGERPRINT_REUSED).toBe(true);
    expect(SECOND_FINGERPRINT_ALGORITHM_CREATED).toBe(false);
    expect(D3_R9_PROVENANCE_REQUIRED).toBe(true);
    expect(D3_R9_PROVENANCE_PRESERVED).toBe(true);
    expect(D3_R9_AUTO_REPOINTED).toBe(false);
    expect(SILENT_D3_R9_MUTATION_ALLOWED).toBe(false);
    expect(D3_R9_HISTORY_PRESERVED).toBe(true);
    expect(TENANT_WORKSPACE_PROJECT_D3_R9_SCOPE_ENFORCED).toBe(true);
    expect(D3_R9_DUPLICATE_GOVERNANCE_IMPLEMENTED).toBe(true);
    expect(D3_R9_REPLAY_PROTECTION_IMPLEMENTED).toBe(true);
    expect(D3_R9_SPOOFING_PROTECTION_IMPLEMENTED).toBe(true);
    expect([
      D3_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT,
      D3_CONFORMANCE_DETERMINATION_RUNTIME_COUNT,
      D3_APPROVAL_RUNTIME_COUNT,
      D3_CERTIFICATION_RUNTIME_COUNT,
      D3_CONFORMANCE_CERTIFICATION_RUNTIME_COUNT,
      D3_AUTOMATIC_PARAMETER_DERIVATION_RUNTIME_COUNT,
      D3_FOUNDATION_CALCULATION_RUNTIME_COUNT,
      D3_BEARING_CAPACITY_RUNTIME_COUNT,
      D3_SETTLEMENT_CALCULATION_RUNTIME_COUNT,
      D3_PILE_CAPACITY_RUNTIME_COUNT,
      D3_SLOPE_STABILITY_RUNTIME_COUNT,
      D3_EARTH_PRESSURE_RUNTIME_COUNT,
      D3_RETAINING_SYSTEM_ANALYSIS_RUNTIME_COUNT,
      D3_EXCAVATION_SUPPORT_DESIGN_RUNTIME_COUNT,
      D3_GROUND_IMPROVEMENT_DESIGN_RUNTIME_COUNT,
      D3_AUTOMATIC_REDESIGN_RUNTIME_COUNT,
      D3_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT,
      D3_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
      D3_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT,
      D3_CROSS_DISCIPLINE_CONFLICT_DETECTION_RUNTIME_COUNT,
      D3_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT,
      D3_CROSS_DISCIPLINE_RECOMMENDATION_RUNTIME_COUNT,
      D3_D9_RUNTIME_INTEGRATION_COUNT,
      D9_RUNTIME_COUNT,
    ]).toEqual(Array(24).fill(0));
    expect(D4_RUNTIME_STARTED).toBe(false);
    expect(D5_RUNTIME_STARTED).toBe(false);
    expect(D6_RUNTIME_STARTED).toBe(false);
    expect(D7_RUNTIME_STARTED).toBe(false);
    expect(D8_RUNTIME_STARTED).toBe(false);
    expect(D9_RUNTIME_STARTED).toBe(false);
    expect(D1_STRUCTURAL_PACK_COMPLETE).toBe(false);
    expect(D1N_REOPENED).toBe(false);
    expect(D2_TRACK_COMPLETE).toBe(true);
    expect(D2_TRACK_COMPLETION_CLASSIFICATION).toBe("COMPLETE_BOUNDED_WITH_LIMITATIONS");
    expect(D2_REOPENED).toBe(false);
    expect(D2_RUNTIME_COUNT_AFTER_R12).toBe(11);
    expect(D2_ARCHITECTURE_RUNTIME_COUNT).toBe(0);
    expect(DATABASE_SCHEMA_CHANGED).toBe(false);
    expect(NEW_DEPENDENCY_ADDED).toBe(false);
    expect(D3_R10_STARTED).toBe(false);
    expect(D3_R10_CANONICAL_PHASE).toBe("EOS-D3-R10-CURRENTNESS-AND-DIGITAL-THREAD");
    expect(D3_R10_PHASE_TYPE).toBe("CURRENTNESS_AND_DIGITAL_THREAD");
    expect(D3_R9_CANONICAL_NEXT_PHASE).toBe(D3_R10_CANONICAL_PHASE);
    expect(D3_R9_NEXT_PHASE_TYPE).toBe("CURRENTNESS_AND_DIGITAL_THREAD");
    expect(D3_R9_CANONICAL_NEXT_PHASE_SCOPE).toBe(R10_SCOPE);
    expect(D3_R10_CANONICAL_SCOPE).toBe(R10_SCOPE);
    expect(D3_R9_BLOCKER).toBe("NONE");

    const r1 = createD3R1Store();
    const context = recordGeotechnicalContext(r1, actor, { contextId: "geotech-context-1", citedLifecycleStage: "CONCEPT", provenanceRef: "prov-geotech-context" });
    const site = recordGeotechnicalObjectIdentity(r1, actor, { objectId: "site-1", contextId: context.contextId, objectType: "GEOTECHNICAL_SITE_CONTEXT", citedLifecycleStage: "CONCEPT", provenanceRef: "prov-site" });
    const siteRevision = recordGeotechnicalObjectIdentity(r1, actor, { objectId: "site-2", contextId: context.contextId, objectType: "GEOTECHNICAL_SITE_CONTEXT", citedLifecycleStage: "CONCEPT", provenanceRef: "prov-site-2" });
    const borehole = recordGeotechnicalObjectIdentity(r1, actor, { objectId: "borehole-1", contextId: context.contextId, objectType: "BOREHOLE", citedLifecycleStage: "CONCEPT", provenanceRef: "prov-borehole-identity", parentObjectId: site.objectId });
    const governance = recordGeotechnicalObjectIdentity(r1, actor, { objectId: "governance-1", contextId: context.contextId, objectType: "GEOTECHNICAL_GOVERNANCE_RECORD", citedLifecycleStage: "CONCEPT", provenanceRef: "prov-governance" });
    const interfaceObject = recordGeotechnicalObjectIdentity(r1, actor, { objectId: "interface-object-1", contextId: context.contextId, objectType: "GEOTECHNICAL_INTERFACE", citedLifecycleStage: "CONCEPT", provenanceRef: "prov-interface-identity" });
    const r2 = createD3R2Store(r1);
    const evidence = recordInvestigationEvidenceReference(r2, actor, { evidenceReferenceId: "evidence-log-1", contextId: context.contextId, objectId: borehole.objectId, evidenceKind: "BOREHOLE_LOG", sourceRevision: "rev-a", provenanceRef: "prov-log", citedCurrentness: "CURRENT" });
    const r7 = createD3R7Store(createD3R6Store(createD3R5Store(createD3R4Store(createD3R3Store(r2)))));
    const change = recordGeotechnicalChange(r7, actor, {
      changeContextId: "change-1",
      contextId: context.contextId,
      objectId: governance.objectId,
      changeCategory: "REASSESSMENT_REQUIRED",
      changedObjectId: site.objectId,
      affectedRelationships: [{ kind: "OBJECT_REFERENCE", targetObjectId: site.objectId }],
      rationale: "A later borehole log is recorded against this site revision",
      limitations: "Recording the change does not perform the reassessment",
      reassessmentRequired: true,
      provenanceRef: "prov-change-1",
      citedCurrentness: "CURRENT",
      evidenceReferenceIds: [evidence.evidenceReferenceId],
    });
    const r8 = createD3R8Store(r7);
    const handoff = recordGeotechnicalInterfaceHandoff(r8, actor, {
      handoffId: "handoff-mech",
      contextId: context.contextId,
      objectId: interfaceObject.objectId,
      sourceObjectId: site.objectId,
      sourceRevision: site.provenanceRef,
      counterpartDiscipline: "mechanical",
      direction: "D3_TO_COUNTERPART",
      interfaceTopic: "DISCIPLINE_OBJECT_IDENTITY_CITATION",
      counterpartInterfaceId: null,
      counterpartSourceRevision: null,
      evidenceReferenceIds: [evidence.evidenceReferenceId],
      limitations: "Future-discipline placeholder with no fabricated counterpart",
      handoffStatus: "NOT_YET_AVAILABLE",
      provenanceRef: "prov-handoff-mech",
      citedCurrentness: "CURRENT",
    });
    const siteFingerprint = site.fingerprint;
    const evidenceFingerprint = evidence.fingerprint;
    const changeFingerprint = change.fingerprint;
    const handoffFingerprint = handoff.fingerprint;
    const store = createD3R9Store(r8);
    const subject = { contextId: context.contextId, subjectKind: "OBJECT", subjectId: site.objectId, subjectRevision: site.provenanceRef, subjectFingerprint: site.fingerprint, evidenceReferenceIds: [evidence.evidenceReferenceId] };
    const request = recordGeotechnicalReviewRequest(store, actor, { ...subject, reviewRequestId: "review-1", reviewType: "GEOTECHNICAL_SUBJECT_REVIEW", reviewScope: "Site geotechnical identity", purpose: "Request human review of this exact site revision", requestedReviewerAuthority: "REVIEWER", limitations: "A request is not a completed review", requestedAt: "2026-10-23T01:00:00.000Z", citedCurrentness: "CURRENT", provenanceRef: "prov-review-1" });
    expect(request.requestStatus).toBe("REQUESTED");
    expect(request.reviewCompleted).toBe(false);
    expect(request.engineeringValidated).toBe(false);
    expect(request.subjectRevision).toBe(site.provenanceRef);
    expect(recordGeotechnicalReviewRequest(store, actor, { ...subject, reviewRequestId: "review-1", reviewType: "GEOTECHNICAL_SUBJECT_REVIEW", reviewScope: "Site geotechnical identity", purpose: "Request human review of this exact site revision", requestedReviewerAuthority: "REVIEWER", limitations: "A request is not a completed review", requestedAt: "2026-10-23T01:00:00.000Z", citedCurrentness: "CURRENT", provenanceRef: "prov-review-1" }).fingerprint).toBe(request.fingerprint);
    const finding = recordGeotechnicalReviewFinding(store, reviewer, { ...subject, findingId: "finding-1", reviewRequestId: request.reviewRequestId, findingCategory: "OBSERVATION", severity: "REVIEW_CANDIDATE", findingText: "The borehole log is cited and remains subject to reviewer judgement", disposition: "OPEN", affectedObjectId: site.objectId, limitations: "A finding does not change the engineering record", citedCurrentness: "CURRENT", provenanceRef: "prov-finding-1" });
    expect(finding.engineeringValidated).toBe(false);
    expect(finding.engineeringInvalid).toBe(false);
    expect(finding.reviewerAuthority).toBe("REVIEWER");
    const candidate = recordGeotechnicalReviewFinding(store, reviewer, { ...subject, findingId: "finding-candidate", reviewRequestId: request.reviewRequestId, findingCategory: "NONCONFORMANCE_CANDIDATE", severity: "REQUIRES_ATTENTION", findingText: "Labelled only as a nonconformance candidate", disposition: "NOTED", affectedObjectId: site.objectId, limitations: "A candidate label is not a conformance determination", citedCurrentness: "CURRENT", provenanceRef: "prov-finding-candidate" });
    expect(candidate.nonconformanceCandidate).toBe(true);
    expect(candidate.conformanceDetermined).toBe(false);
    const reassessmentFinding = recordGeotechnicalReviewFinding(store, reviewer, { ...subject, findingId: "finding-reassess", reviewRequestId: request.reviewRequestId, findingCategory: "REASSESSMENT_RECOMMENDATION", severity: "INFORMATION_GAP", findingText: "The recorded change asks for reassessment", disposition: "REASSESSMENT_REQUESTED", affectedObjectId: site.objectId, changeContextId: change.changeContextId, limitations: "The finding cites the change and does not perform it", citedCurrentness: "CURRENT", provenanceRef: "prov-finding-reassess" });
    expect(reassessmentFinding.changeContextId).toBe(change.changeContextId);
    expect(reassessmentFinding.engineeringValidated).toBe(false);
    const completion = recordGeotechnicalReviewCompletion(store, reviewer, { ...subject, completionId: "completion-1", reviewRequestId: request.reviewRequestId, limitations: "Completion closes the review process only", citedCurrentness: "CURRENT", provenanceRef: "prov-completion-1" });
    expect(completion.reviewCompleted).toBe(true);
    expect(completion.engineeringValidated).toBe(false);
    expect(completion.conformant).toBe(false);
    expect(completion.engineeringApproved).toBe(false);
    expect(completion.certified).toBe(false);
    expect(completion.d1Validated).toBe(false);
    expect(completion.d2Validated).toBe(false);
    expect(request.reviewCompleted).toBe(false);
    expect(request.engineeringValidated).toBe(false);
    expect(recordGeotechnicalReviewCompletion(store, reviewer, { ...subject, completionId: "completion-1", reviewRequestId: request.reviewRequestId, limitations: "Completion closes the review process only", citedCurrentness: "CURRENT", provenanceRef: "prov-completion-1" }).fingerprint).toBe(completion.fingerprint);
    const unvalidated = recordGeotechnicalValidationState(store, reviewer, { ...subject, validationId: "validation-open", reviewRequestId: request.reviewRequestId, validationScope: "Site identity", requiredEvidenceReferenceIds: [evidence.evidenceReferenceId], validationState: "NOT_VALIDATED", limitations: "Evidence on file is not validation", citedCurrentness: "CURRENT", provenanceRef: "prov-validation-open" });
    expect(unvalidated.engineeringValidated).toBe(false);
    expect(unvalidated.conformant).toBe(false);
    const validated = recordGeotechnicalValidationState(store, reviewer, { ...subject, validationId: "validation-1", reviewRequestId: request.reviewRequestId, validationScope: "Site identity", requiredEvidenceReferenceIds: [evidence.evidenceReferenceId], validationState: "VALIDATED", limitations: "Validation is not approval or certification", citedCurrentness: "CURRENT", provenanceRef: "prov-validation-1" });
    expect(validated.engineeringValidated).toBe(true);
    expect(validated.conformant).toBe(false);
    expect(validated.engineeringApproved).toBe(false);
    expect(validated.certified).toBe(false);
    expect(validated.d1Validated).toBe(false);
    expect(validated.d2Validated).toBe(false);
    expect(validated.counterpartDisciplineValidated).toBe(false);
    expect(validated.subjectRevision).toBe(site.provenanceRef);
    const preservedValidation = validated.fingerprint;
    const stale = recordGeotechnicalValidationState(store, reviewer, { ...subject, validationId: "validation-stale", reviewRequestId: request.reviewRequestId, validationScope: "Site identity", requiredEvidenceReferenceIds: [evidence.evidenceReferenceId], validationState: "STALE", limitations: "The earlier validation stays on its original revision", citedCurrentness: "STALE", provenanceRef: "prov-validation-stale", predecessorValidationId: validated.validationId });
    const historicalValidation = store.validations.find((row) => row.validationId === validated.validationId);
    expect(stale.validationState).toBe("STALE");
    expect(stale.citedCurrentness).toBe("STALE");
    expect(stale.engineeringValidated).toBe(false);
    expect(historicalValidation?.fingerprint).toBe(preservedValidation);
    expect(historicalValidation?.subjectRevision).toBe(site.provenanceRef);
    expect(historicalValidation?.recordStatus).toBe("SUPERSEDED");
    expect(historicalValidation?.citedCurrentness).toBe("SUPERSEDED");
    expect(recordGeotechnicalValidationState(store, reviewer, { ...subject, validationId: "validation-stale", reviewRequestId: request.reviewRequestId, validationScope: "Site identity", requiredEvidenceReferenceIds: [evidence.evidenceReferenceId], validationState: "STALE", limitations: "The earlier validation stays on its original revision", citedCurrentness: "STALE", provenanceRef: "prov-validation-stale", predecessorValidationId: validated.validationId }).fingerprint).toBe(stale.fingerprint);
    const reassessment = recordGeotechnicalValidationState(store, reviewer, { ...subject, validationId: "validation-reassess", validationScope: "Reassessment watch", requiredEvidenceReferenceIds: [evidence.evidenceReferenceId], validationState: "REASSESSMENT_REQUIRED", changeContextId: change.changeContextId, limitations: "Reassessment required is not validation", citedCurrentness: "REASSESSMENT_REQUIRED", provenanceRef: "prov-validation-reassess" });
    expect(reassessment.engineeringValidated).toBe(false);
    expect(reassessment.validationState).toBe("REASSESSMENT_REQUIRED");
    expect(change.fingerprint).toBe(changeFingerprint);
    const handoffSubject = { contextId: context.contextId, subjectKind: "HANDOFF", subjectId: handoff.handoffId, subjectRevision: handoff.sourceRevision, subjectFingerprint: handoff.fingerprint, evidenceReferenceIds: [evidence.evidenceReferenceId] };
    const handoffRequest = recordGeotechnicalReviewRequest(store, actor, { ...handoffSubject, reviewRequestId: "review-handoff", reviewType: "INTERFACE_HANDOFF_REVIEW", reviewScope: "Mechanical placeholder", purpose: "Review the handoff record only", requestedReviewerAuthority: "REVIEWER", limitations: "Review of a handoff does not validate another discipline", requestedAt: "2026-10-23T02:00:00.000Z", citedCurrentness: "CURRENT", provenanceRef: "prov-review-handoff" });
    const handoffCompletion = recordGeotechnicalReviewCompletion(store, reviewer, { ...handoffSubject, completionId: "completion-handoff", reviewRequestId: handoffRequest.reviewRequestId, limitations: "Completed review still does not validate mechanical, structural, or civil engineering", citedCurrentness: "CURRENT", provenanceRef: "prov-completion-handoff" });
    expect(handoffCompletion.counterpartDisciplineValidated).toBe(false);
    expect(handoffCompletion.d1Validated).toBe(false);
    expect(handoffCompletion.d2Validated).toBe(false);
    const staleRequest = recordGeotechnicalReviewRequest(store, actor, { ...handoffSubject, reviewRequestId: "review-handoff-stale", reviewType: "INTERFACE_HANDOFF_REVIEW", reviewScope: "Mechanical placeholder", purpose: "Mark the prior request stale", requestedReviewerAuthority: "REVIEWER", limitations: "Stale review is not a current completed review", requestedAt: "2026-10-23T03:00:00.000Z", citedCurrentness: "STALE", provenanceRef: "prov-review-handoff-stale", predecessorReviewRequestId: handoffRequest.reviewRequestId });
    const historicalRequest = store.requests.find((row) => row.reviewRequestId === handoffRequest.reviewRequestId);
    expect(staleRequest.citedCurrentness).toBe("STALE");
    expect(staleRequest.reviewCompleted).toBe(false);
    expect(staleRequest.engineeringValidated).toBe(false);
    expect(historicalRequest?.fingerprint).toBe(handoffRequest.fingerprint);
    expect(historicalRequest?.subjectRevision).toBe(handoff.sourceRevision);
    expect(store.history.some((row) => row.action === "SUPERSEDED" && row.fingerprint === handoffRequest.fingerprint)).toBe(true);
    expect(recordGeotechnicalReviewRequest(store, actor, { ...handoffSubject, reviewRequestId: "review-handoff-stale", reviewType: "INTERFACE_HANDOFF_REVIEW", reviewScope: "Mechanical placeholder", purpose: "Mark the prior request stale", requestedReviewerAuthority: "REVIEWER", limitations: "Stale review is not a current completed review", requestedAt: "2026-10-23T03:00:00.000Z", citedCurrentness: "STALE", provenanceRef: "prov-review-handoff-stale", predecessorReviewRequestId: handoffRequest.reviewRequestId }).fingerprint).toBe(staleRequest.fingerprint);
    expect(site.fingerprint).toBe(siteFingerprint);
    expect(evidence.fingerprint).toBe(evidenceFingerprint);
    expect(change.fingerprint).toBe(changeFingerprint);
    expect(handoff.fingerprint).toBe(handoffFingerprint);
    expect(handoff.engineeringValidated).toBe(false);

    const otherSubject = { ...subject, subjectId: siteRevision.objectId, subjectRevision: siteRevision.provenanceRef, subjectFingerprint: siteRevision.fingerprint };
    expect(() => recordGeotechnicalReviewRequest(store, actor, { ...subject, reviewRequestId: "review-float", reviewType: "GEOTECHNICAL_SUBJECT_REVIEW", reviewScope: "Site geotechnical identity", purpose: "Floating revision", requestedReviewerAuthority: "REVIEWER", limitations: "Rejected", requestedAt: "2026-10-23T04:00:00.000Z", citedCurrentness: "CURRENT", provenanceRef: "prov-float", subjectRevision: "latest" })).toThrow(/SUBJECT_REVISION_REQUIRED/);
    expect(() => recordGeotechnicalReviewRequest(store, actor, { ...subject, reviewRequestId: "review-mismatch", reviewType: "GEOTECHNICAL_SUBJECT_REVIEW", reviewScope: "Site geotechnical identity", purpose: "Wrong revision", requestedReviewerAuthority: "REVIEWER", limitations: "Rejected", requestedAt: "2026-10-23T04:00:00.000Z", citedCurrentness: "CURRENT", provenanceRef: "prov-mismatch", subjectRevision: "prov-other" })).toThrow(/SUBJECT_REVISION_MISMATCH/);
    expect(() => recordGeotechnicalReviewRequest(store, actor, { ...otherSubject, reviewRequestId: "review-transfer", reviewType: "GEOTECHNICAL_SUBJECT_REVIEW", reviewScope: "Other site revision", purpose: "Transfer attempt", requestedReviewerAuthority: "REVIEWER", limitations: "Rejected", requestedAt: "2026-10-23T04:00:00.000Z", citedCurrentness: "STALE", provenanceRef: "prov-transfer", predecessorReviewRequestId: request.reviewRequestId })).toThrow(/REVIEW_TRANSFER_REJECTED/);
    expect(() => recordGeotechnicalValidationState(store, reviewer, { ...otherSubject, validationId: "validation-transfer", validationScope: "Site identity", requiredEvidenceReferenceIds: [evidence.evidenceReferenceId], validationState: "STALE", limitations: "Rejected", citedCurrentness: "STALE", provenanceRef: "prov-validation-transfer", predecessorValidationId: stale.validationId })).toThrow(/VALIDATION_TRANSFER_REJECTED/);
    expect(request.subjectRevision).toBe(site.provenanceRef);
    expect(store.validations.find((row) => row.validationId === validated.validationId)?.subjectRevision).toBe(site.provenanceRef);
    expect(() => recordGeotechnicalReviewRequest(store, actor, { ...subject, reviewRequestId: "review-done", reviewType: "GEOTECHNICAL_SUBJECT_REVIEW", reviewScope: "Site geotechnical identity", purpose: "Completion smuggled into a request", requestedReviewerAuthority: "REVIEWER", limitations: "Rejected", requestedAt: "2026-10-23T04:00:00.000Z", citedCurrentness: "CURRENT", provenanceRef: "prov-done", reviewCompleted: true })).toThrow(/REVIEW_REQUEST_NOT_COMPLETION/);
    expect(() => recordGeotechnicalValidationState(store, reviewer, { ...subject, validationId: "validation-stale-current", validationScope: "Site identity exposed current", requiredEvidenceReferenceIds: [evidence.evidenceReferenceId], validationState: "STALE", limitations: "Rejected", citedCurrentness: "CURRENT", provenanceRef: "prov-stale-current" })).toThrow(/CURRENTNESS_STATUS_MISMATCH/);
    expect(() => recordGeotechnicalValidationState(store, reviewer, { ...subject, validationId: "validation-reassess-as-valid", validationScope: "Reassessment watch", requiredEvidenceReferenceIds: [evidence.evidenceReferenceId], validationState: "VALIDATED", limitations: "Rejected", citedCurrentness: "REASSESSMENT_REQUIRED", provenanceRef: "prov-reassess-valid" })).toThrow(/CURRENTNESS_STATUS_MISMATCH/);
    expect(() => recordGeotechnicalValidationState(store, reviewer, { ...subject, validationId: "validation-infer", validationScope: "Inferred from reassessment", requiredEvidenceReferenceIds: [evidence.evidenceReferenceId], validationState: "NOT_VALIDATED", limitations: "Rejected", citedCurrentness: "CURRENT", provenanceRef: "prov-infer", reassessmentCompleted: true })).toThrow(/REASSESSMENT_NOT_VALIDATION/);
    expect(() => recordGeotechnicalReviewFinding(store, { ...reviewer, actorId: "AI_reviewer", actorKind: "ai" }, { ...subject, findingId: "finding-ai", reviewRequestId: request.reviewRequestId, findingCategory: "COMMENT", severity: "REVIEW_CANDIDATE", findingText: "AI comment", disposition: "OPEN", affectedObjectId: site.objectId, limitations: "Rejected", citedCurrentness: "CURRENT", provenanceRef: "prov-ai" })).toThrow(/AI_NOT_GEOTECHNICAL_REVIEWER/);
    expect(() => recordGeotechnicalValidationState(store, { ...reviewer, authority: "ADMIN" }, { ...subject, validationId: "validation-admin", validationScope: "Admin attempt", requiredEvidenceReferenceIds: [evidence.evidenceReferenceId], validationState: "VALIDATED", limitations: "Rejected", citedCurrentness: "CURRENT", provenanceRef: "prov-admin" })).toThrow(/ADMIN_NOT_GEOTECHNICAL_REVIEWER|ADMIN_CANNOT_VALIDATE/);
    expect(() => recordGeotechnicalReviewFinding(store, { ...reviewer, authority: "GEOTECHNICAL_ENGINEERING_AUTHORITY" }, { ...subject, findingId: "finding-authority", reviewRequestId: request.reviewRequestId, findingCategory: "CONCERN", severity: "REVIEW_CANDIDATE", findingText: "Authority spoof", disposition: "OPEN", affectedObjectId: site.objectId, limitations: "Rejected", citedCurrentness: "CURRENT", provenanceRef: "prov-authority" })).toThrow(/REVIEWER_AUTHORITY_REQUIRED/);
    expect(() => recordGeotechnicalReviewFinding(store, reviewer, { ...subject, findingId: "finding-r5", reviewRequestId: request.reviewRequestId, findingCategory: "COMMENT", severity: "REVIEW_CANDIDATE", findingText: "Do not change the parameter", disposition: "OPEN", affectedObjectId: site.objectId, limitations: "Rejected", citedCurrentness: "CURRENT", provenanceRef: "prov-r5", changeR5: true })).toThrow(/R5_CHANGE_REJECTED/);
    expect(() => recordGeotechnicalReviewFinding(store, reviewer, { ...subject, findingId: "finding-r8", reviewRequestId: request.reviewRequestId, findingCategory: "COMMENT", severity: "REVIEW_CANDIDATE", findingText: "Do not change the handoff", disposition: "OPEN", affectedObjectId: site.objectId, limitations: "Rejected", citedCurrentness: "CURRENT", provenanceRef: "prov-r8", changeR8: true })).toThrow(/R8_CHANGE_REJECTED/);
    expect(() => recordGeotechnicalReviewFinding(store, reviewer, { ...subject, findingId: "finding-mutate", reviewRequestId: request.reviewRequestId, findingCategory: "COMMENT", severity: "REVIEW_CANDIDATE", findingText: "Do not mutate", disposition: "OPEN", affectedObjectId: site.objectId, limitations: "Rejected", citedCurrentness: "CURRENT", provenanceRef: "prov-mutate", mutateEngineering: true })).toThrow(/FINDING_MUTATION_REJECTED/);
    expect(() => recordGeotechnicalValidationState(store, reviewer, { ...handoffSubject, validationId: "validation-d1", validationScope: "Counterpart", requiredEvidenceReferenceIds: [evidence.evidenceReferenceId], validationState: "NOT_VALIDATED", limitations: "Rejected", citedCurrentness: "CURRENT", provenanceRef: "prov-d1", validateD1: true })).toThrow(/D1_VALIDATION_REJECTED/);
    expect(() => recordGeotechnicalValidationState(store, reviewer, { ...handoffSubject, validationId: "validation-d2", validationScope: "Counterpart", requiredEvidenceReferenceIds: [evidence.evidenceReferenceId], validationState: "NOT_VALIDATED", limitations: "Rejected", citedCurrentness: "CURRENT", provenanceRef: "prov-d2", validateD2: true })).toThrow(/D2_VALIDATION_REJECTED/);
    expect(() => recordGeotechnicalReviewCompletion(store, reviewer, { ...subject, completionId: "completion-approve", reviewRequestId: request.reviewRequestId, limitations: "Rejected", citedCurrentness: "CURRENT", provenanceRef: "prov-approve", approve: true })).toThrow(/APPROVAL_NOT_IN_R9/);
    expect(() => recordGeotechnicalReviewCompletion(store, reviewer, { ...subject, completionId: "completion-cert", reviewRequestId: request.reviewRequestId, limitations: "Rejected", citedCurrentness: "CURRENT", provenanceRef: "prov-cert", certify: true })).toThrow(/CERTIFICATION_NOT_IN_R9/);
    expect(() => recordGeotechnicalReviewCompletion(store, reviewer, { ...subject, completionId: "completion-conform", reviewRequestId: request.reviewRequestId, limitations: "Rejected", citedCurrentness: "CURRENT", provenanceRef: "prov-conform", conform: true })).toThrow(/CONFORMANCE_NOT_IN_R9/);
    expect(() => recordGeotechnicalValidationState(store, reviewer, { ...subject, validationId: "validation-cross", validationScope: "Cross project", requiredEvidenceReferenceIds: [evidence.evidenceReferenceId], validationState: "NOT_VALIDATED", limitations: "Rejected", citedCurrentness: "CURRENT", provenanceRef: "prov-cross", projectId: "project-b" })).toThrow(/CROSS_PROJECT_OPERATION/);
    expect(() => recordGeotechnicalValidationState(store, reviewer, { ...subject, validationId: "validation-spoof", validationScope: "Spoof", requiredEvidenceReferenceIds: [evidence.evidenceReferenceId], validationState: "NOT_VALIDATED", limitations: "Rejected", citedCurrentness: "CURRENT", provenanceRef: "prov-spoof", assertedFingerprint: "spoofed" })).toThrow(/FINGERPRINT_MISMATCH/);
    expect(() => recordGeotechnicalReviewRequest(store, actor, { ...subject, reviewRequestId: "review-dup", reviewType: "GEOTECHNICAL_SUBJECT_REVIEW", reviewScope: "Duplicate", purpose: "Duplicate current request", requestedReviewerAuthority: "REVIEWER", limitations: "Rejected", requestedAt: "2026-10-23T05:00:00.000Z", citedCurrentness: "CURRENT", provenanceRef: "prov-dup" })).toThrow(/DUPLICATE_REVIEW_REQUEST_REJECTED/);
    expect(() => recordGeotechnicalReviewFinding(store, reviewer, { ...subject, findingId: "finding-dup", reviewRequestId: request.reviewRequestId, findingCategory: "OBSERVATION", severity: "REVIEW_CANDIDATE", findingText: "The borehole log is cited and remains subject to reviewer judgement", disposition: "OPEN", affectedObjectId: site.objectId, limitations: "Rejected", citedCurrentness: "CURRENT", provenanceRef: "prov-finding-dup" })).toThrow(/DUPLICATE_FINDING_REJECTED/);
    expect(() => recordGeotechnicalValidationState(store, reviewer, { ...subject, validationId: "validation-calc", validationScope: "Calculation", requiredEvidenceReferenceIds: [evidence.evidenceReferenceId], validationState: "NOT_VALIDATED", limitations: "Rejected", citedCurrentness: "CURRENT", provenanceRef: "prov-calc", bearing: true })).toThrow(/CALCULATION_NOT_IN_R9/);
    expect(() => recordGeotechnicalValidationState(store, reviewer, { ...subject, validationId: "validation-redesign", validationScope: "Redesign", requiredEvidenceReferenceIds: [evidence.evidenceReferenceId], validationState: "NOT_VALIDATED", limitations: "Rejected", citedCurrentness: "CURRENT", provenanceRef: "prov-redesign", redesign: true })).toThrow(/REDESIGN_NOT_IN_R9/);
    expect(() => transferPriorGeotechnicalReview()).toThrow(/REVIEW_TRANSFER_REJECTED/);
    expect(() => transferPriorGeotechnicalValidation()).toThrow(/VALIDATION_TRANSFER_REJECTED/);
    expect(() => repointGeotechnicalReview()).toThrow(/AUTO_REPOINT_REJECTED/);
    expect(() => automaticallyValidateGeotechnicalEngineering()).toThrow(/AUTOMATIC_VALIDATION_REJECTED/);
    expect(() => approveGeotechnicalEngineering()).toThrow(/APPROVAL_NOT_IN_R9/);
    expect(() => certifyGeotechnicalEngineering()).toThrow(/CERTIFICATION_NOT_IN_R9/);
    expect(() => conformGeotechnicalEngineering()).toThrow(/CONFORMANCE_NOT_IN_R9/);
    expect(() => mutateReviewedGeotechnicalSubject()).toThrow(/SUBJECT_MUTATION_REJECTED/);
    expect(() => { (validated as { limitations: string }).limitations = "silent"; }).toThrow();
    expect(site.fingerprint).toBe(siteFingerprint);
    expect(evidence.fingerprint).toBe(evidenceFingerprint);
    expect(change.fingerprint).toBe(changeFingerprint);
    expect(handoff.fingerprint).toBe(handoffFingerprint);
    const here = dirname(fileURLToPath(import.meta.url));
    const sourceText = readFileSync(join(here, "review-validation-governance.ts"), "utf8");
    expect(sourceText).toContain("fingerprintCanonical");
    expect(sourceText).toContain("D2_R9_VALIDATION_STATES");
    expect(sourceText).toContain("PRE_ISSUE_AI_BOUNDARY");
    expect(sourceText).toContain("assertHumanApprovalActor");
    expect(sourceText).toContain("resolveAuthAssuranceLevel");
    expect(sourceText).toContain("D3_R7_CHANGE_CATEGORIES");
    expect(sourceText).not.toMatch(/createHash|from ["']@rtb\/engineering-review["']|CREATE TABLE/);
    expect(scanAnalysisFormulaBypass(join(here, "review-validation-governance.ts"), sourceText)).toEqual([]);
    const packageJson = JSON.parse(readFileSync(join(here, "../../package.json"), "utf8")) as { dependencies: Record<string, string> };
    expect(Object.keys(packageJson.dependencies).sort()).toEqual(["@rtb/database", "@rtb/engineering-review", "@rtb/platform-commerce", "@rtb/platform-intelligence", "@rtb/platform-kernel", "@rtb/types", "docx", "exceljs", "pptxgenjs", "zod"]);
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D3.R9.REVIEW_AND_VALIDATION_GOVERNANCE")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D3.R10.CURRENTNESS_AND_DIGITAL_THREAD")?.implementationState).toBe("NOT_IMPLEMENTED");
  });
});
