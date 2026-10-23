import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { STRUCTURAL_CAPABILITY_MANIFEST } from "../structural-concrete/capability";
import { scanAnalysisFormulaBypass } from "../structural-systems/formula-scan";
import { D1_STRUCTURAL_PACK_COMPLETE, D1N_REOPENED } from "../structural-systems/structural-pack-sequencing";
import { D2_CONTEXT_AUTHORITY, createD2R1Store, recordCivilContext, recordCivilObjectIdentity, type D2R1Actor } from "./identity-foundation";
import { createD2R2Store } from "./spatial-surface-context";
import { createD2R3Store } from "./grading-earthworks-context";
import { createD2R4Store } from "./roads-access-context";
import { createD2R5Store } from "./drainage-stormwater-context";
import { createD2R6Store } from "./utility-corridor-context";
import { createD2R7Store, recordCivilAssumption, recordCivilDecision, recordCivilRequirement } from "./requirements-assumptions-change";
import { D2_RUNTIME_COUNT as R8_RUNTIME_COUNT, createD2R8Store, recordCivilInterfaceHandoff } from "./discipline-interfaces-handoffs";
import { D2_CURRENTNESS_DIGITAL_THREAD_RUNTIME_READY as R9_THREAD_READY, D2_R10_STARTED as R9_R10_STARTED, D2_RUNTIME_COUNT as R9_COUNT, createD2R9Store, recordCivilReviewFinding, recordCivilReviewRequest, recordCivilValidationGovernance, type D2R9Actor } from "./review-validation-governance";
import {
  AI_CAN_SILENTLY_CREATE_AUTHORITATIVE_DEPENDENCY,
  AI_CAN_SILENTLY_REPOINT_HISTORICAL_REFERENCE,
  CANONICAL_CURRENTNESS_REUSED,
  CANONICAL_DIGITAL_THREAD_REUSED,
  CANONICAL_FINGERPRINT_REUSED,
  D2_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT,
  D2_CIVIL_APPROVAL_RUNTIME_COUNT,
  D2_CIVIL_CERTIFICATION_RUNTIME_COUNT,
  D2_CIVIL_REVIEW_EXECUTION_RUNTIME_COUNT,
  D2_CURRENTNESS_AUTO_OPTIMIZATION_RUNTIME_COUNT,
  D2_CURRENTNESS_AUTO_RECALCULATION_RUNTIME_COUNT,
  D2_CURRENTNESS_AUTO_REDESIGN_RUNTIME_COUNT,
  D2_CURRENTNESS_DIGITAL_THREAD_RUNTIME_READY,
  D2_CURRENTNESS_PROPAGATION_MUTATES_ENGINEERING_CONTENT,
  D2_CURRENTNESS_STATE_RUNTIME_IMPLEMENTED,
  D2_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
  D2_DEDICATED_CURRENTNESS_DIGITAL_THREAD_RUNTIME_COUNT,
  D2_EVIDENCE_LINEAGE_SUPPORTED,
  D2_EXPLICIT_LINEAGE_RUNTIME_IMPLEMENTED,
  D2_R10_HISTORY_PRESERVED,
  D2_R10_MATURITY,
  D2_R10_PROVENANCE_PRESERVED,
  D2_R10_PROVENANCE_REQUIRED,
  D2_R10_STATUS,
  D2_R11_CANONICAL_PHASE,
  D2_R11_PHASE_TYPE,
  D2_R11_STARTED,
  D2_R7_CHANGE_GOVERNANCE_INTEGRATED_WITH_CURRENTNESS,
  D2_R8_INTERFACE_CURRENTNESS_INTEGRATED,
  D2_R9_REVIEW_VALIDATION_CURRENTNESS_INTEGRATED,
  D2_RUNTIME_COUNT,
  D2_RUNTIME_STARTED,
  D2_SUPERSESSION_GOVERNANCE_IMPLEMENTED,
  D3_RUNTIME_STARTED,
  D9_RUNTIME_STARTED,
  DATABASE_SCHEMA_CHANGED,
  EVIDENCE_LINEAGE_EQUALS_ENGINEERING_VALIDATED,
  EXACT_D2_REVISION_REFERENCE_REQUIRED,
  EXPLICIT_D2_CURRENTNESS_PROPAGATION_IMPLEMENTED,
  FLOATING_D2_REVISION_REFERENCE_ALLOWED,
  HISTORICAL_REFERENCE_AUTO_REPOINTED,
  INFERRED_D2_DEPENDENCY_PROPAGATION_ALLOWED,
  INFERRED_D2_LINEAGE_ALLOWED,
  NEW_DEPENDENCY_ADDED,
  PARALLEL_D2_CURRENTNESS_ENGINE_CREATED,
  PARALLEL_D2_DIGITAL_THREAD_CREATED,
  PRIOR_REVIEW_AUTO_TRANSFERS_TO_NEW_REVISION,
  PRIOR_VALIDATION_AUTO_TRANSFERS_TO_NEW_REVISION,
  REASSESSMENT_REQUIRED_EQUALS_ENGINEERING_INVALID,
  SECOND_FINGERPRINT_ALGORITHM_CREATED,
  SILENT_D2_R10_MUTATION_ALLOWED,
  STALE_EQUALS_ENGINEERING_INVALID,
  STALE_EQUALS_ENGINEERING_REJECTED,
  STALE_HANDOFF_AUTO_REPOINTED,
  STALE_REVIEW_AUTO_REPOINTED,
  STALE_VALIDATION_AUTO_REPOINTED,
  SUPERSEDED_EQUALS_AUTOMATICALLY_REPLACED_EVERYWHERE,
  SUPERSEDED_EQUALS_DELETED,
  SUPERSEDED_EQUALS_INVALID,
  SUPERSESSION_REWRITES_HISTORICAL_REFERENCE,
  TENANT_WORKSPACE_PROJECT_D2_R10_SCOPE_ENFORCED,
  createD2R10Store,
  inferCivilLineage,
  optimizeFromCurrentness,
  recalculateFromCurrentness,
  recordCivilCurrentness,
  recordCivilLineage,
  recordCivilSupersession,
  redesignFromCurrentness,
  repointHistoricalReference,
} from "./currentness-digital-thread";

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

describe("EOS-D2-R10 currentness and digital thread", () => {
  it("records explicit lineage and currentness without rewriting history or redesigning Civil objects", () => {
    expect(D2_R10_STATUS).toBe("CURRENTNESS_AND_DIGITAL_THREAD_IMPLEMENTED");
    expect(D2_R10_MATURITY).toBe(D2_R10_STATUS);
    expect(D2_RUNTIME_STARTED).toBe(true);
    expect(D2_RUNTIME_COUNT).toBe(10);
    expect(R9_COUNT).toBe(9);
    expect(R8_RUNTIME_COUNT).toBe(8);
    expect(D2_CURRENTNESS_DIGITAL_THREAD_RUNTIME_READY).toBe(true);
    expect(R9_THREAD_READY).toBe(false);
    expect(R9_R10_STARTED).toBe(false);
    expect(D2_DEDICATED_CURRENTNESS_DIGITAL_THREAD_RUNTIME_COUNT).toBe(1);
    expect(CANONICAL_CURRENTNESS_REUSED).toBe(true);
    expect(PARALLEL_D2_CURRENTNESS_ENGINE_CREATED).toBe(false);
    expect(CANONICAL_DIGITAL_THREAD_REUSED).toBe(true);
    expect(PARALLEL_D2_DIGITAL_THREAD_CREATED).toBe(false);
    expect(CANONICAL_FINGERPRINT_REUSED).toBe(true);
    expect(SECOND_FINGERPRINT_ALGORITHM_CREATED).toBe(false);
    expect(EXACT_D2_REVISION_REFERENCE_REQUIRED).toBe(true);
    expect(FLOATING_D2_REVISION_REFERENCE_ALLOWED).toBe(false);
    expect(HISTORICAL_REFERENCE_AUTO_REPOINTED).toBe(false);
    expect(SUPERSESSION_REWRITES_HISTORICAL_REFERENCE).toBe(false);
    expect(D2_EXPLICIT_LINEAGE_RUNTIME_IMPLEMENTED).toBe(true);
    expect(INFERRED_D2_LINEAGE_ALLOWED).toBe(false);
    expect(D2_SUPERSESSION_GOVERNANCE_IMPLEMENTED).toBe(true);
    expect(SUPERSEDED_EQUALS_DELETED).toBe(false);
    expect(SUPERSEDED_EQUALS_INVALID).toBe(false);
    expect(SUPERSEDED_EQUALS_AUTOMATICALLY_REPLACED_EVERYWHERE).toBe(false);
    expect(D2_CURRENTNESS_STATE_RUNTIME_IMPLEMENTED).toBe(true);
    expect(STALE_EQUALS_ENGINEERING_INVALID).toBe(false);
    expect(STALE_EQUALS_ENGINEERING_REJECTED).toBe(false);
    expect(REASSESSMENT_REQUIRED_EQUALS_ENGINEERING_INVALID).toBe(false);
    expect(EXPLICIT_D2_CURRENTNESS_PROPAGATION_IMPLEMENTED).toBe(true);
    expect(INFERRED_D2_DEPENDENCY_PROPAGATION_ALLOWED).toBe(false);
    expect(D2_CURRENTNESS_PROPAGATION_MUTATES_ENGINEERING_CONTENT).toBe(false);
    expect(D2_CURRENTNESS_AUTO_RECALCULATION_RUNTIME_COUNT).toBe(0);
    expect(D2_CURRENTNESS_AUTO_REDESIGN_RUNTIME_COUNT).toBe(0);
    expect(D2_CURRENTNESS_AUTO_OPTIMIZATION_RUNTIME_COUNT).toBe(0);
    expect(D2_R7_CHANGE_GOVERNANCE_INTEGRATED_WITH_CURRENTNESS).toBe(true);
    expect(D2_R8_INTERFACE_CURRENTNESS_INTEGRATED).toBe(true);
    expect(D2_R9_REVIEW_VALIDATION_CURRENTNESS_INTEGRATED).toBe(true);
    expect(PRIOR_REVIEW_AUTO_TRANSFERS_TO_NEW_REVISION).toBe(false);
    expect(PRIOR_VALIDATION_AUTO_TRANSFERS_TO_NEW_REVISION).toBe(false);
    expect(STALE_REVIEW_AUTO_REPOINTED).toBe(false);
    expect(STALE_VALIDATION_AUTO_REPOINTED).toBe(false);
    expect(STALE_HANDOFF_AUTO_REPOINTED).toBe(false);
    expect(D2_EVIDENCE_LINEAGE_SUPPORTED).toBe(true);
    expect(EVIDENCE_LINEAGE_EQUALS_ENGINEERING_VALIDATED).toBe(false);
    expect(AI_CAN_SILENTLY_CREATE_AUTHORITATIVE_DEPENDENCY).toBe(false);
    expect(AI_CAN_SILENTLY_REPOINT_HISTORICAL_REFERENCE).toBe(false);
    expect(D2_R10_PROVENANCE_REQUIRED).toBe(true);
    expect(D2_R10_PROVENANCE_PRESERVED).toBe(true);
    expect(SILENT_D2_R10_MUTATION_ALLOWED).toBe(false);
    expect(D2_R10_HISTORY_PRESERVED).toBe(true);
    expect(TENANT_WORKSPACE_PROJECT_D2_R10_SCOPE_ENFORCED).toBe(true);
    expect(D2_CIVIL_REVIEW_EXECUTION_RUNTIME_COUNT).toBe(0);
    expect(D2_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT).toBe(0);
    expect(D2_CIVIL_APPROVAL_RUNTIME_COUNT).toBe(0);
    expect(D2_CIVIL_CERTIFICATION_RUNTIME_COUNT).toBe(0);
    expect(D2_D9_SOURCE_CONTRACT_RUNTIME_COUNT).toBe(0);
    expect(D3_RUNTIME_STARTED).toBe(false);
    expect(D9_RUNTIME_STARTED).toBe(false);
    expect(D1_STRUCTURAL_PACK_COMPLETE).toBe(false);
    expect(D1N_REOPENED).toBe(false);
    expect(DATABASE_SCHEMA_CHANGED).toBe(false);
    expect(NEW_DEPENDENCY_ADDED).toBe(false);
    expect(D2_R11_STARTED).toBe(false);
    expect(D2_R11_CANONICAL_PHASE).toBe("EOS-D2-R11-D9-SOURCE-CONTRACT");
    expect(D2_R11_PHASE_TYPE).toBe("D9_SOURCE_CONTRACT");

    const r1 = createD2R1Store();
    const context = recordCivilContext(r1, actor, { contextId: "civil-context-1", citedLifecycleStage: "CONCEPT", provenanceRef: "prov-context" });
    const made = (objectId: string, objectType: "SURFACE_REFERENCE" | "GRADING_ZONE" | "ROAD_CORRIDOR" | "DRAINAGE_NETWORK" | "CIVIL_UTILITY_CORRIDOR" | "FINISHED_LEVEL" | "CIVIL_INTERFACE" | "CIVIL_REQUIREMENT" | "CIVIL_ASSUMPTION" | "CIVIL_DECISION" | "CIVIL_EVIDENCE_REFERENCE") =>
      recordCivilObjectIdentity(r1, actor, { objectId, contextId: context.contextId, objectType, citedLifecycleStage: "CONCEPT", provenanceRef: `prov-${objectId}` });
    const surface = made("surface-object", "SURFACE_REFERENCE");
    const grading = made("grading-object", "GRADING_ZONE");
    const road = made("road-object", "ROAD_CORRIDOR");
    const drainage = made("drainage-object", "DRAINAGE_NETWORK");
    const utility = made("utility-object", "CIVIL_UTILITY_CORRIDOR");
    const unrelated = made("unrelated-object", "FINISHED_LEVEL");
    const interfaceObject = made("interface-object", "CIVIL_INTERFACE");
    const requirementObject = made("requirement-object", "CIVIL_REQUIREMENT");
    const assumptionObject = made("assumption-object", "CIVIL_ASSUMPTION");
    const decisionObject = made("decision-object", "CIVIL_DECISION");
    const evidence = made("evidence-object", "CIVIL_EVIDENCE_REFERENCE");
    const laterEvidence = made("evidence-later", "CIVIL_EVIDENCE_REFERENCE");
    const r7 = createD2R7Store(createD2R6Store(createD2R5Store(createD2R4Store(createD2R3Store(createD2R2Store(r1))))));
    const requirement = recordCivilRequirement(r7, actor, {
      requirementContextId: "requirement-1",
      contextId: context.contextId,
      objectId: requirementObject.objectId,
      requirementText: "Finished level remains the cited design surface.",
      sourceRef: "council-standard",
      sourceRevision: "2024-a",
      applicability: "site platform",
      affectedObjectIds: [grading.objectId],
      jurisdictionProfileId: "apac-other",
      evidenceObjectIds: [evidence.objectId],
      citedLifecycleStage: "CONCEPT",
      provenanceRef: "prov-requirement",
      citedCurrentness: "CURRENT",
    });
    const assumption = recordCivilAssumption(r7, actor, {
      assumptionContextId: "assumption-1",
      contextId: context.contextId,
      objectId: assumptionObject.objectId,
      statement: "The cited existing surface remains the reference.",
      sourceRef: "survey-authority",
      rationale: "Supplied by the survey record.",
      affectedObjectIds: [grading.objectId],
      evidenceObjectIds: [evidence.objectId],
      citedLifecycleStage: "CONCEPT",
      provenanceRef: "prov-assumption",
      citedCurrentness: "CURRENT",
    });
    const decision = recordCivilDecision(r7, actor, {
      decisionContextId: "decision-1",
      contextId: context.contextId,
      objectId: decisionObject.objectId,
      statement: "Retain the cited finished level.",
      rationale: "The requirement and assumption were supplied.",
      authorityRole: "DECISION_AUTHORITY",
      alternatives: [],
      affectedObjectIds: [grading.objectId],
      requirementObjectIds: [requirementObject.objectId],
      assumptionObjectIds: [assumptionObject.objectId],
      evidenceObjectIds: [evidence.objectId],
      citedLifecycleStage: "CONCEPT",
      provenanceRef: "prov-decision",
      citedCurrentness: "CURRENT",
    });
    const r8 = createD2R8Store(r7);
    const handoff = recordCivilInterfaceHandoff(r8, actor, {
      handoffId: "handoff-d3",
      contextId: context.contextId,
      objectId: interfaceObject.objectId,
      sourceObjectId: grading.objectId,
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
      changeContextIds: [],
      limitations: "Geotechnical truth is not created by this handoff.",
      handoffStatus: "AWAITING_COUNTERPART",
      citedCurrentness: "CURRENT",
      provenanceRef: "prov-handoff",
    });
    const r9 = createD2R9Store(r8);
    const request = recordCivilReviewRequest(r9, actor, {
      subjectKind: "OBJECT",
      subjectId: grading.objectId,
      subjectRevision: grading.fingerprint,
      subjectFingerprint: grading.fingerprint,
      contextId: context.contextId,
      evidenceObjectIds: [evidence.objectId],
      requirementContextIds: ["requirement-1"],
      assumptionContextIds: ["assumption-1"],
      decisionContextIds: ["decision-1"],
      handoffIds: [handoff.handoffId],
      reviewRequestId: "review-1",
      reviewType: "CIVIL_SUBJECT_REVIEW",
      requestedReviewerAuthority: "REVIEWER",
      limitations: "A request does not complete the review.",
      requestedAt: "2026-10-23T01:00:00.000Z",
      citedCurrentness: "CURRENT",
      provenanceRef: "prov-review",
    });
    const finding = recordCivilReviewFinding(r9, reviewer, {
      subjectKind: "OBJECT",
      subjectId: grading.objectId,
      subjectRevision: grading.fingerprint,
      subjectFingerprint: grading.fingerprint,
      contextId: context.contextId,
      evidenceObjectIds: [evidence.objectId],
      requirementContextIds: ["requirement-1"],
      assumptionContextIds: ["assumption-1"],
      decisionContextIds: ["decision-1"],
      handoffIds: [handoff.handoffId],
      findingId: "finding-1",
      reviewRequestId: request.reviewRequestId,
      severity: "INFORMATION_GAP",
      findingText: "The cited level still needs the supplied survey note checked by a reviewer.",
      disposition: "OPEN",
      affectedObjectId: grading.objectId,
      limitations: "A finding does not change the grading object.",
      citedCurrentness: "CURRENT",
      provenanceRef: "prov-finding",
    });
    const validation = recordCivilValidationGovernance(r9, reviewer, {
      subjectKind: "OBJECT",
      subjectId: grading.objectId,
      subjectRevision: grading.fingerprint,
      subjectFingerprint: grading.fingerprint,
      contextId: context.contextId,
      evidenceObjectIds: [evidence.objectId],
      requirementContextIds: ["requirement-1"],
      assumptionContextIds: ["assumption-1"],
      decisionContextIds: ["decision-1"],
      handoffIds: [handoff.handoffId],
      validationId: "validation-1",
      reviewRequestId: request.reviewRequestId,
      validationScope: "cited finished level record",
      requiredEvidenceObjectIds: [evidence.objectId],
      validationState: "VALIDATED",
      limitations: "Validation is not approval.",
      citedCurrentness: "CURRENT",
      provenanceRef: "prov-validation",
    });
    const store = createD2R10Store(r9);
    const objectPin = (row: { objectId: string; fingerprint: string }) => ({ subjectKind: "OBJECT", subjectId: row.objectId, subjectRevision: row.fingerprint, subjectFingerprint: row.fingerprint });
    const edge = recordCivilLineage(store, actor, {
      lineageId: "line-surface-grading",
      contextId: context.contextId,
      source: objectPin(surface),
      target: objectPin(grading),
      relationshipType: "DEPENDS_ON",
      civilDependency: "SURFACE_REFERENCE_TO_GRADING_AND_EARTHWORKS",
      citedCurrentness: "CURRENT",
      provenanceRef: "prov-line-1",
    });
    expect(edge.authoritative).toBe(true);
    expect(recordCivilLineage(store, actor, {
      lineageId: "line-surface-grading",
      contextId: context.contextId,
      source: objectPin(surface),
      target: objectPin(grading),
      relationshipType: "DEPENDS_ON",
      civilDependency: "SURFACE_REFERENCE_TO_GRADING_AND_EARTHWORKS",
      citedCurrentness: "CURRENT",
      provenanceRef: "prov-line-1",
    }).fingerprint).toBe(edge.fingerprint);
    recordCivilLineage(store, actor, { lineageId: "line-grading-road", contextId: context.contextId, source: objectPin(grading), target: objectPin(road), relationshipType: "DEPENDS_ON", civilDependency: "GRADING_OR_FINISHED_LEVEL_TO_ROAD_DRAINAGE_AND_INTERFACE", citedCurrentness: "CURRENT", provenanceRef: "prov-line-2" });
    recordCivilLineage(store, actor, { lineageId: "line-road-drainage", contextId: context.contextId, source: objectPin(road), target: objectPin(drainage), relationshipType: "DEPENDS_ON", civilDependency: "ROAD_CORRIDOR_TO_DRAINAGE_UTILITY_AND_D1_INTERFACE", citedCurrentness: "CURRENT", provenanceRef: "prov-line-3" });
    recordCivilLineage(store, actor, { lineageId: "line-drainage-utility", contextId: context.contextId, source: objectPin(drainage), target: objectPin(utility), relationshipType: "DEPENDS_ON", civilDependency: "ROAD_CORRIDOR_TO_DRAINAGE_UTILITY_AND_D1_INTERFACE", citedCurrentness: "CURRENT", provenanceRef: "prov-line-4" });
    recordCivilLineage(store, actor, { lineageId: "line-requirement", contextId: context.contextId, source: { subjectKind: "REQUIREMENT", subjectId: requirement.requirementContextId, subjectRevision: requirement.sourceRevision, subjectFingerprint: requirement.fingerprint }, target: objectPin(grading), relationshipType: "DEPENDS_ON", citedCurrentness: "CURRENT", provenanceRef: "prov-line-req" });
    recordCivilLineage(store, actor, { lineageId: "line-assumption", contextId: context.contextId, source: { subjectKind: "ASSUMPTION", subjectId: assumption.assumptionContextId, subjectRevision: assumption.fingerprint, subjectFingerprint: assumption.fingerprint }, target: objectPin(grading), relationshipType: "BASED_ON", citedCurrentness: "CURRENT", provenanceRef: "prov-line-asm" });
    recordCivilLineage(store, actor, { lineageId: "line-decision", contextId: context.contextId, source: { subjectKind: "DECISION", subjectId: decision.decisionContextId, subjectRevision: decision.fingerprint, subjectFingerprint: decision.fingerprint }, target: objectPin(grading), relationshipType: "BASED_ON", citedCurrentness: "CURRENT", provenanceRef: "prov-line-dec" });
    recordCivilLineage(store, actor, { lineageId: "line-handoff", contextId: context.contextId, source: objectPin(grading), target: { subjectKind: "HANDOFF", subjectId: handoff.handoffId, subjectRevision: handoff.sourceRevision, subjectFingerprint: handoff.fingerprint }, relationshipType: "DEPENDS_ON", citedCurrentness: "CURRENT", provenanceRef: "prov-line-handoff" });
    recordCivilLineage(store, actor, { lineageId: "line-review", contextId: context.contextId, source: objectPin(grading), target: { subjectKind: "REVIEW_REQUEST", subjectId: request.reviewRequestId, subjectRevision: request.subjectRevision, subjectFingerprint: request.fingerprint }, relationshipType: "REVIEWS", citedCurrentness: "CURRENT", provenanceRef: "prov-line-review" });
    recordCivilLineage(store, actor, { lineageId: "line-finding", contextId: context.contextId, source: { subjectKind: "REVIEW_REQUEST", subjectId: request.reviewRequestId, subjectRevision: request.subjectRevision, subjectFingerprint: request.fingerprint }, target: { subjectKind: "FINDING", subjectId: finding.findingId, subjectRevision: finding.subjectRevision, subjectFingerprint: finding.fingerprint }, relationshipType: "BASED_ON", citedCurrentness: "CURRENT", provenanceRef: "prov-line-finding" });
    recordCivilLineage(store, actor, { lineageId: "line-validation", contextId: context.contextId, source: objectPin(grading), target: { subjectKind: "VALIDATION", subjectId: validation.validationId, subjectRevision: validation.subjectRevision, subjectFingerprint: validation.fingerprint }, relationshipType: "BASED_ON", citedCurrentness: "CURRENT", provenanceRef: "prov-line-validation" });
    const evidenceEdge = recordCivilLineage(store, actor, { lineageId: "line-evidence", contextId: context.contextId, source: objectPin(grading), target: { subjectKind: "EVIDENCE", subjectId: evidence.objectId, subjectRevision: evidence.fingerprint, subjectFingerprint: evidence.fingerprint }, relationshipType: "SUPPORTED_BY", citedCurrentness: "CURRENT", provenanceRef: "prov-line-evidence" });
    const laterEdge = recordCivilLineage(store, actor, { lineageId: "line-evidence-later", contextId: context.contextId, source: objectPin(grading), target: { subjectKind: "EVIDENCE", subjectId: laterEvidence.objectId, subjectRevision: laterEvidence.fingerprint, subjectFingerprint: laterEvidence.fingerprint }, relationshipType: "SUPPORTED_BY", citedCurrentness: "CURRENT", provenanceRef: "prov-line-evidence-later" });
    expect(store.lineage.find((row) => row.lineageId === evidenceEdge.lineageId)?.target.subjectId).toBe(evidence.objectId);
    expect(laterEdge.target.subjectId).toBe(laterEvidence.objectId);
    expect(() => recordCivilLineage(store, actor, { lineageId: "line-float", contextId: context.contextId, source: { ...objectPin(surface), subjectRevision: "latest" }, target: objectPin(grading), relationshipType: "DEPENDS_ON", citedCurrentness: "CURRENT", provenanceRef: "prov-float" })).toThrow(/SUBJECT_REVISION_REQUIRED/);
    expect(() => recordCivilLineage(store, actor, { lineageId: "line-infer", contextId: context.contextId, source: objectPin(surface), target: objectPin(unrelated), relationshipType: "DEPENDS_ON", citedCurrentness: "CURRENT", provenanceRef: "prov-infer", infer: true })).toThrow(/INFERRED_LINEAGE_REJECTED/);
    expect(() => recordCivilLineage(store, actor, { lineageId: "line-near", contextId: context.contextId, source: objectPin(surface), target: objectPin(unrelated), relationshipType: "NEARBY", citedCurrentness: "CURRENT", provenanceRef: "prov-near" })).toThrow(/RELATION_NOT_GOVERNED/);
    expect(() => recordCivilLineage(store, actor, { lineageId: "line-missing-surface", contextId: context.contextId, source: { subjectKind: "SURFACE", subjectId: "missing-surface", subjectRevision: "rev-x", subjectFingerprint: "fp-x" }, target: objectPin(grading), relationshipType: "DEPENDS_ON", citedCurrentness: "CURRENT", provenanceRef: "prov-missing" })).toThrow(/SUBJECT_NOT_FOUND/);
    expect(() => recordCivilLineage(store, actor, { lineageId: "line-spoof", contextId: context.contextId, source: objectPin(surface), target: objectPin(grading), relationshipType: "USES", citedCurrentness: "CURRENT", provenanceRef: "prov-spoof", assertedFingerprint: "spoofed" })).toThrow(/FINGERPRINT_MISMATCH/);
    expect(() => recordCivilLineage(store, actor, { lineageId: "line-scope", contextId: context.contextId, source: objectPin(surface), target: objectPin(unrelated), relationshipType: "USES", citedCurrentness: "CURRENT", provenanceRef: "prov-scope", workspaceId: "workspace-b" })).toThrow(/CROSS_WORKSPACE_OPERATION/);
    expect(() => recordCivilLineage(store, { ...actor, actorId: "AI-assistant", authority: "AI_ASSISTANT", actorKind: "ai" }, { lineageId: "line-ai", contextId: context.contextId, source: objectPin(surface), target: objectPin(unrelated), relationshipType: "DEPENDS_ON", citedCurrentness: "CURRENT", provenanceRef: "prov-ai", authoritative: true })).toThrow(/AI_CANNOT_CREATE_AUTHORITATIVE_DEPENDENCY/);
    const candidate = recordCivilLineage(store, { ...actor, actorId: "AI-assistant", authority: "AI_ASSISTANT", actorKind: "ai" }, { lineageId: "line-candidate", contextId: context.contextId, source: objectPin(unrelated), target: objectPin(utility), relationshipType: "DEPENDS_ON", citedCurrentness: "CURRENT", provenanceRef: "prov-candidate", candidate: true, authoritative: false });
    expect(candidate.authoritative).toBe(false);

    const gradingFingerprint = grading.fingerprint;
    const marks = recordCivilCurrentness(store, actor, { eventId: "event-surface", contextId: context.contextId, subject: objectPin(surface), currentness: "STALE", propagate: true, provenanceRef: "prov-stale" });
    expect(marks[0].engineeringInvalid).toBe(false);
    expect(marks[0].engineeringRejected).toBe(false);
    expect(marks[0].contentMutated).toBe(false);
    expect(marks.some((row) => row.subject.subjectId === grading.objectId && row.currentness === "STALE")).toBe(true);
    expect(marks.some((row) => row.subject.subjectId === road.objectId)).toBe(true);
    expect(marks.some((row) => row.subject.subjectId === drainage.objectId)).toBe(true);
    expect(marks.some((row) => row.subject.subjectId === utility.objectId)).toBe(true);
    expect(marks.some((row) => row.subject.subjectId === handoff.handoffId)).toBe(true);
    expect(marks.some((row) => row.subject.subjectId === request.reviewRequestId)).toBe(true);
    expect(marks.some((row) => row.subject.subjectId === finding.findingId)).toBe(true);
    expect(marks.some((row) => row.subject.subjectId === validation.validationId)).toBe(true);
    expect(marks.some((row) => row.subject.subjectId === unrelated.objectId)).toBe(false);
    expect(marks.some((row) => row.subject.subjectId === utility.objectId && row.eventId.startsWith("event-surface") && store.lineage.some((edgeRow) => edgeRow.lineageId === "line-candidate" && edgeRow.target.subjectId === utility.objectId))).toBe(true);
    expect(grading.fingerprint).toBe(gradingFingerprint);
    expect(handoff.sourceRevision).toBe("rev-civil-1");
    expect(handoff.fingerprint).toBe(store.lineage.find((row) => row.lineageId === "line-handoff")?.target.subjectFingerprint);
    expect(request.subjectRevision).toBe(gradingFingerprint);
    expect(validation.subjectRevision).toBe(gradingFingerprint);
    expect(validation.engineeringValidated).toBe(true);
    expect(requirement.requirementText).toBe("Finished level remains the cited design surface.");

    const requirementMarks = recordCivilCurrentness(store, actor, { eventId: "event-requirement", contextId: context.contextId, subject: { subjectKind: "REQUIREMENT", subjectId: requirement.requirementContextId, subjectRevision: requirement.sourceRevision, subjectFingerprint: requirement.fingerprint }, currentness: "REASSESSMENT_REQUIRED", propagate: true, provenanceRef: "prov-req-mark" });
    expect(requirementMarks.some((row) => row.subject.subjectId === grading.objectId && row.currentness === "REASSESSMENT_REQUIRED" && row.engineeringInvalid === false)).toBe(true);
    const assumptionMarks = recordCivilCurrentness(store, actor, { eventId: "event-assumption", contextId: context.contextId, subject: { subjectKind: "ASSUMPTION", subjectId: assumption.assumptionContextId, subjectRevision: assumption.fingerprint, subjectFingerprint: assumption.fingerprint }, currentness: "REASSESSMENT_REQUIRED", propagate: true, provenanceRef: "prov-asm-mark" });
    expect(assumptionMarks.some((row) => row.subject.subjectId === grading.objectId)).toBe(true);
    const decisionMarks = recordCivilCurrentness(store, actor, { eventId: "event-decision", contextId: context.contextId, subject: { subjectKind: "DECISION", subjectId: decision.decisionContextId, subjectRevision: decision.fingerprint, subjectFingerprint: decision.fingerprint }, currentness: "REASSESSMENT_REQUIRED", propagate: true, provenanceRef: "prov-dec-mark" });
    expect(decisionMarks.some((row) => row.subject.subjectId === grading.objectId)).toBe(true);
    expect(grading.fingerprint).toBe(gradingFingerprint);

    const successor = recordCivilObjectIdentity(r1, actor, { objectId: "grading-object-2", contextId: context.contextId, objectType: "GRADING_ZONE", citedLifecycleStage: "CONCEPT", provenanceRef: "prov-grading-2", predecessorObjectId: grading.objectId });
    const historical = store.lineage.find((row) => row.lineageId === "line-surface-grading");
    const supersession = recordCivilSupersession(store, actor, {
      supersessionId: "super-1",
      contextId: context.contextId,
      predecessor: objectPin(grading),
      successor: objectPin(successor),
      citedCurrentness: "CURRENT",
      provenanceRef: "prov-super",
    });
    expect(supersession.deleted).toBe(false);
    expect(supersession.invalid).toBe(false);
    expect(supersession.historicalEdgesRewritten).toBe(false);
    expect(historical?.target.subjectId).toBe(grading.objectId);
    expect(historical?.target.subjectRevision).toBe(gradingFingerprint);
    expect(r1.objects.find((row) => row.objectId === grading.objectId)?.recordStatus).toBe("SUPERSEDED");
    expect(store.lineage.find((row) => row.lineageId === "line-review")?.target.subjectRevision).toBe(gradingFingerprint);
    expect(r9.validations).toHaveLength(1);
    expect(r9.validations[0].subjectId).toBe(grading.objectId);
    expect(() => recordCivilLineage(store, actor, { lineageId: "line-repoint", contextId: context.contextId, source: objectPin(surface), target: objectPin(successor), relationshipType: "DEPENDS_ON", citedCurrentness: "CURRENT", provenanceRef: "prov-repoint", repoint: true })).toThrow(/AUTO_REPOINT_REJECTED/);
    expect(() => inferCivilLineage()).toThrow(/INFERRED_LINEAGE_REJECTED/);
    expect(() => repointHistoricalReference()).toThrow(/AUTO_REPOINT_REJECTED/);
    expect(() => redesignFromCurrentness()).toThrow(/REDESIGN_NOT_IN_R10/);
    expect(() => recalculateFromCurrentness()).toThrow(/RECALCULATION_NOT_IN_R10/);
    expect(() => optimizeFromCurrentness()).toThrow(/OPTIMIZATION_NOT_IN_R10/);
    expect(store.history.length).toBeGreaterThan(1);
    expect(store.history[0].fingerprint).toBe(edge.fingerprint);
    const here = dirname(fileURLToPath(import.meta.url));
    const sourceText = readFileSync(join(here, "currentness-digital-thread.ts"), "utf8");
    expect(sourceText).toContain("fingerprintCanonical");
    expect(sourceText).toContain("relationSemantics");
    expect(sourceText).toContain("D2_CURRENTNESS_STATES");
    expect(sourceText).toContain("D2_EXPLICIT_CHANGE_DEPENDENCIES");
    expect(sourceText).not.toMatch(/createHash|from ["']@rtb\/engineering-review["']|CREATE TABLE/);
    expect(scanAnalysisFormulaBypass(join(here, "currentness-digital-thread.ts"), sourceText)).toEqual([]);
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D2.R10.CURRENTNESS_AND_DIGITAL_THREAD")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D2.R11.D9_SOURCE_CONTRACT")?.implementationState).toBe("NOT_IMPLEMENTED");
  });
});
