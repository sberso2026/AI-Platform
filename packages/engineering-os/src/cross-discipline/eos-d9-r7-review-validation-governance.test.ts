import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { D6_REOPENED, D7_REOPENED, D8_REOPENED } from "@rtb/types";
import { D2_CONTEXT_AUTHORITY, D2_DISCIPLINE } from "../civil/identity-foundation";
import { D2_R11_STATUS } from "../civil/d9-source-contract";
import {
  D1_STRUCTURAL_PACK_COMPLETE,
  D2_TRACK_COMPLETE,
  D3_TRACK_COMPLETE,
  D4_TRACK_COMPLETE,
  D5_TRACK_COMPLETE,
  D6_STATUS,
  D6_TRACK_COMPLETE,
  D7_STATUS,
  D7_TRACK_COMPLETE,
  D8_STATUS,
  D8_TRACK_COMPLETE,
} from "../instrumentation-control/instrumentation-control-bounded-closeout";
import { D6_CONTEXT_AUTHORITY, D6_DISCIPLINE } from "../process/identity-foundation";
import { D6_R11_STATUS } from "../process/d9-source-contract";
import { D1N_REOPENED, D2_REOPENED, D3_REOPENED, D4_REOPENED, D5_REOPENED } from "../process/process-bounded-closeout";
import { STRUCTURAL_CAPABILITY_MANIFEST } from "../structural-concrete/capability";
import { scanAnalysisFormulaBypass } from "../structural-systems/formula-scan";
import { D9_R3_DETECTION_VERSION, D9_R3_RECORDER_AUTHORITY, createD9R3Store, recordD9ConflictCandidate } from "./conflict-candidate-detection";
import { D9_R4_GOVERNANCE_VERSION, D9_R4_RECORDER_AUTHORITY, createD9R4Store, recordD9ConflictGovernance } from "./conflict-governance-escalation";
import { D9_R2_RECORDER_AUTHORITY, createD9R2Store, recordD9CrossDisciplineObservation } from "./cross-discipline-observation";
import { D9_R6_CURRENTNESS_VERSION, D9_R7_STARTED, D9_REVIEW_VALIDATION_RUNTIME_COUNT as R6_REVIEW_COUNT, D9_RUNTIME_COUNT as R6_RUNTIME_COUNT, createD9R6Store, recordD9CurrentnessAssessment } from "./currentness-digital-thread";
import { D9_R5_RECOMMENDATION_VERSION, createD9R5Store, recordD9Recommendation } from "./recommendation-support";
import {
  ADMIN_CAN_AUTHORITATIVELY_VALIDATE_D9_WITHOUT_ENGINEERING_AUTHORITY,
  ADMIN_EQUALS_D9_ENGINEERING_AUTHORITY,
  ADMIN_EQUALS_D9_REVIEW_AUTHORITY,
  AI_ASSISTED_REVIEW_EQUALS_HUMAN_REVIEW,
  AI_CAN_ASSIST_D9_REVIEW,
  AI_CAN_AUTHORITATIVELY_VALIDATE_D9,
  AI_EQUALS_D9_ENGINEERING_AUTHORITY,
  AI_EQUALS_D9_REVIEW_AUTHORITY,
  AI_REVIEW_OUTPUT_EQUALS_ENGINEERING_VALIDATION,
  CONFLICT_REVIEWED_EQUALS_CONFLICT_CONFIRMED,
  CONFLICT_REVIEWED_EQUALS_CONFLICT_RESOLVED,
  CONFLICT_REVIEWED_EQUALS_ENGINEERING_VALIDATED,
  CROSS_TENANT_D9_R7_ACCESS_ALLOWED,
  CURRENT_REVIEW_EQUALS_ENGINEERING_VALIDATED,
  CURRENT_VALIDATION_RECORD_EQUALS_APPROVAL,
  D9_APPROVAL_RUNTIME_COUNT,
  D9_AUTO_VALIDATES_D1_STRUCTURAL,
  D9_AUTO_VALIDATES_D8_IAC,
  D9_AUTOMATIC_CONFLICT_RESOLUTION_RUNTIME_COUNT,
  D9_AUTOMATIC_ENGINEERING_DESIGN_RUNTIME_COUNT,
  D9_AUTOMATIC_ENGINEERING_REDESIGN_RUNTIME_COUNT,
  D9_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT,
  D9_CANONICAL_MILESTONE_COUNT,
  D9_CANONICAL_PHASE_LIST,
  D9_CERTIFICATION_RUNTIME_COUNT,
  D9_CONFLICT_DETECTION_RUNTIME_COUNT,
  D9_CONFLICT_GOVERNANCE_ESCALATION_RUNTIME_READY,
  D9_CONFLICT_RESOLUTION_RUNTIME_COUNT,
  D9_CONFORMANCE_DETERMINATION_RUNTIME_COUNT,
  D9_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT,
  D9_CURRENTNESS_DIGITAL_THREAD_RUNTIME_READY,
  D9_ENGINEERING_DECISION_RUNTIME_COUNT,
  D9_ENGINEERING_OPTIMIZATION_RUNTIME_COUNT,
  D9_EQUALS_D1_STRUCTURAL_AUTHORITY,
  D9_EQUALS_D8_IAC_AUTHORITY,
  D9_EXPLICIT_LINEAGE_REQUIRED,
  D9_IGNORES_D1_STRUCTURAL_LIMITATIONS,
  D9_INFERRED_LINEAGE_ALLOWED,
  D9_R7_APPLICABILITY_EXPLICIT,
  D9_R7_ARCHITECTURE_REUSE_REMAINS,
  D9_R7_AUTO_MUTATES_D1_STRUCTURAL,
  D9_R7_AUTO_MUTATES_D8_IAC,
  D9_R7_AUTO_PROPAGATES_OUTSIDE_APPLICABILITY,
  D9_R7_BLOCKER,
  D9_R7_CAN_REVIEW_R1_READ_MODEL,
  D9_R7_CAN_REVIEW_R2_OBSERVATION,
  D9_R7_CAN_REVIEW_R3_CONFLICT_CANDIDATE,
  D9_R7_CAN_REVIEW_R4_CONFLICT_GOVERNANCE,
  D9_R7_CAN_REVIEW_R5_RECOMMENDATION,
  D9_R7_CAN_REVIEW_R6_CURRENTNESS_THREAD,
  D9_R7_CANONICAL_NEXT_PHASE,
  D9_R7_CANONICAL_NEXT_PHASE_SCOPE,
  D9_R7_CAN_SILENTLY_DROP_SOURCE_LIMITATIONS,
  D9_R7_CHANGE_CAN_REQUIRE_REASSESSMENT,
  D9_R7_DUPLICATE_GOVERNANCE_IMPLEMENTED,
  D9_R7_EXACT_SUBJECT_REVISION_REQUIRED,
  D9_R7_FINDING_CLOSURE_AUTHORITY_REQUIRED,
  D9_R7_FINDING_CLOSURE_AUTHORITY_TRACEABLE,
  D9_R7_FINDING_CONTEXT_SUPPORTED,
  D9_R7_FINDING_EVIDENCE_REQUIRED,
  D9_R7_FINDING_EVIDENCE_TRACEABLE,
  D9_R7_FLOATING_SUBJECT_REFERENCE_ALLOWED,
  D9_R7_GENERATES_NEW_RECOMMENDATION,
  D9_R7_HISTORY_PRESERVED,
  D9_R7_HISTORICAL_REFERENCE_AUTO_REPOINTED,
  D9_R7_LIMITATIONS_EXPLICIT,
  D9_R7_MACHINE_READABLE_ROADMAP_UPDATED,
  D9_R7_MAKES_ENGINEERING_DECISION,
  D9_R7_MATURITY,
  D9_R7_NEW_REVISION_INHERITS_APPROVAL,
  D9_R7_NEW_REVISION_INHERITS_VALIDATION,
  D9_R7_NEXT_PHASE_TYPE,
  D9_R7_PERFORMS_AUTOMATIC_ENGINEERING_VALIDATION,
  D9_R7_PRESERVES_CLOSED_TRACKS,
  D9_R7_PRESERVES_D1_INCOMPLETE_STATUS,
  D9_R7_PRESERVES_D1_LIMITATIONS,
  D9_R7_PROVENANCE_PRESERVED,
  D9_R7_PROVENANCE_REQUIRED,
  D9_R7_R6_RUNTIME_REMAINS_SIX,
  D9_R7_REPLAY_PROTECTION_IMPLEMENTED,
  D9_R7_RESOLVES_ENGINEERING_CONFLICT,
  D9_R7_REVIEW_REQUIRES_TRACEABLE_REVIEWER,
  D9_R7_REVIEW_VALIDATION_FINGERPRINT_VERIFICATION_SUPPORTED,
  D9_R7_REVIEW_VALIDATION_LINEAGE_PRESERVED,
  D9_R7_REVIEW_VERSION,
  D9_R7_REVIEWER_AUTHORITY_TRACEABLE,
  D9_R7_SOURCE_BASIS_REQUIRED,
  D9_R7_SOURCE_BASIS_TRACEABLE,
  D9_R7_SOURCE_LIMITATIONS_PRESERVED,
  D9_R7_SPOOFING_PROTECTION_IMPLEMENTED,
  D9_R7_STATUS,
  D9_R7_SUBJECT_AUTO_REPOINTED,
  D9_R7_VALIDATION_AUTHORITY_TRACEABLE,
  D9_R7_VALIDATION_EXACT_REVISION_REQUIRED,
  D9_R7_VALIDATION_FLOATING_REFERENCE_ALLOWED,
  D9_R7_VALIDATION_REQUIRES_HUMAN_AUTHORITY,
  D9_R8_STARTED,
  D9_RECOMMENDATION_RUNTIME_COUNT,
  D9_RECOMMENDATION_SUPPORT_RUNTIME_READY,
  D9_REUSES_CANONICAL_CURRENTNESS,
  D9_REUSES_CANONICAL_DIGITAL_THREAD,
  D9_REUSES_CANONICAL_FINGERPRINT,
  D9_REVIEW_RECORD_IMPLEMENTED,
  D9_REVIEW_VALIDATION_RUNTIME_COUNT,
  D9_REVIEW_VALIDATION_RUNTIME_IMPLEMENTED,
  D9_REVIEW_VALIDATION_RUNTIME_READY,
  D9_RUNTIME_COUNT,
  D9_RUNTIME_STARTED,
  D9_SOURCE_CONTRACT_READ_MODEL_RUNTIME_READY,
  D9_TREATS_D1_STRUCTURAL_AS_COMPLETE,
  D9_VALIDATION_EQUALS_APPROVAL,
  D9_VALIDATION_EQUALS_CERTIFICATION,
  D9_VALIDATION_EQUALS_CONFORMANCE,
  D9_VALIDATION_EQUALS_D1_STRUCTURAL_VALIDATION,
  D9_VALIDATION_EQUALS_D8_IAC_VALIDATION,
  D9_VALIDATION_EQUALS_REGULATORY_APPROVAL,
  D9_VALIDATION_RECORD_IMPLEMENTED,
  EOS_ALL_DISCIPLINES_COMPLETE,
  EOS_GA_READY,
  FINDING_ACCEPTED_EQUALS_APPROVED,
  FINDING_CLOSED_EQUALS_CONFLICT_RESOLVED,
  FINDING_CLOSED_EQUALS_ENGINEERING_VALIDATED,
  FINGERPRINT_MATCH_EQUALS_APPROVAL,
  FINGERPRINT_MATCH_EQUALS_ENGINEERING_VALIDATED,
  PARALLEL_D9_CURRENTNESS_ENGINE_CREATED,
  PARALLEL_D9_DIGITAL_THREAD_CREATED,
  REASSESSMENT_COMPLETED_EQUALS_VALIDATED,
  REASSESSMENT_REQUIRED_EQUALS_VALIDATION_FAILED,
  RECOMMENDATION_ACCEPTED_EQUALS_APPROVAL,
  RECOMMENDATION_ACCEPTED_EQUALS_ENGINEERING_DECISION,
  RECOMMENDATION_REVIEWED_EQUALS_APPROVAL,
  RECOMMENDATION_REVIEWED_EQUALS_CONFLICT_RESOLUTION,
  RECOMMENDATION_REVIEWED_EQUALS_ENGINEERING_DECISION,
  REVIEW_ASSIGNED_EQUALS_REVIEW_COMPLETED,
  REVIEW_COMPLETED_EQUALS_ENGINEERING_VALIDATED,
  REVIEW_REQUESTED_EQUALS_REVIEW_ASSIGNED,
  SECOND_D9_FINGERPRINT_ALGORITHM_CREATED,
  SILENT_D9_R7_MUTATION_ALLOWED,
  STALE_REVIEW_EQUALS_INVALID,
  STALE_VALIDATION_RECORD_EQUALS_VALIDATION_FAILED,
  SUPERSEDED_VALIDATION_RECORD_EQUALS_INVALID,
  TENANT_WORKSPACE_PROJECT_D9_R7_SCOPE_ENFORCED,
  aiAssistD9Review,
  approveFromD9Review,
  certifyFromD9Review,
  createD9R7Store,
  decideFromD9Review,
  inheritD9Validation,
  mutateD9ReviewSource,
  recordD9Review,
  recordD9Validation,
  repointD9Review,
  resolveFromD9Review,
  validateDisciplineFromD9Review,
  type D9R7ReviewInput,
  type D9R7ValidationInput,
} from "./review-validation-governance";
import { D9_R1_D1_STANDING_LIMITATION, D9_R1_RECORDER_AUTHORITY, createD9R1Store, recordD1IncompletePosture, recordD9SourceContractEntry, type D9R1SourceEntryInput } from "./source-contract-read-model";
import { describe, expect, it } from "vitest";

const here = dirname(fileURLToPath(import.meta.url));
const reader = { actorId: "reader-1", authority: D9_R1_RECORDER_AUTHORITY, tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a" };
const observer = { actorId: "observer-1", authority: D9_R2_RECORDER_AUTHORITY, tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a" };
const detector = { actorId: "detector-1", authority: D9_R3_RECORDER_AUTHORITY, tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a" };
const governor = { actorId: "governor-1", authority: D9_R4_RECORDER_AUTHORITY, tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a" };
const recommender = { actorId: "recommender-1", authority: "D9_RECOMMENDATION_RECORDER", tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a" };
const assessor = { actorId: "assessor-1", authority: "D9_CURRENTNESS_THREAD_RECORDER", tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a" };
const reviewer = { actorId: "reviewer-1", authority: "D9_REVIEW_VALIDATION_RECORDER", tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a" };

function entry(overrides: Partial<D9R1SourceEntryInput> = {}): D9R1SourceEntryInput {
  return {
    entryId: "entry-civil-1",
    sourceDiscipline: "D2_CIVIL",
    sourceDisciplineToken: D2_DISCIPLINE,
    contractId: "civil-contract-1",
    contractVersion: D2_R11_STATUS,
    objectId: "civil-object-1",
    objectType: "CIVIL_SURFACE",
    exactRevision: "rev-civil-1",
    currentness: "STALE",
    provenanceRef: "prov-civil-1",
    sourceBasisRef: "basis-civil-1",
    applicability: "site pad A only",
    limitations: "survey control not closed",
    authority: D2_CONTEXT_AUTHORITY,
    lineage: [{ lineageId: "lin-1", fromRevision: "rev-civil-0", toRevision: "rev-civil-1" }],
    relationships: [],
    sourceValues: [{ quantityId: "pad-level", valueText: "12.5", unitText: "m" }],
    ...overrides,
  };
}

describe("EOS-D9-R7 review and validation governance", () => {
  it("adds one review runtime over exact R1-R6 records", () => {
    expect(D9_R7_STATUS).toBe("REVIEW_AND_VALIDATION_GOVERNANCE_IMPLEMENTED");
    expect(D9_R7_MATURITY).toBe(D9_R7_STATUS);
    expect(D9_REVIEW_VALIDATION_RUNTIME_IMPLEMENTED && D9_REVIEW_VALIDATION_RUNTIME_READY && D9_REVIEW_RECORD_IMPLEMENTED && D9_VALIDATION_RECORD_IMPLEMENTED).toBe(true);
    expect(D9_REVIEW_VALIDATION_RUNTIME_COUNT).toBe(1);
    expect(D9_RUNTIME_STARTED).toBe(true);
    expect(D9_RUNTIME_COUNT).toBe(7);
    expect(D9_R7_R6_RUNTIME_REMAINS_SIX && D9_R7_ARCHITECTURE_REUSE_REMAINS).toBe(true);
    expect(R6_RUNTIME_COUNT).toBe(6);
    expect(R6_REVIEW_COUNT).toBe(0);
    expect(D9_R7_STARTED).toBe(false);
    expect(D9_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT).toBe(1);
    expect(D9_CURRENTNESS_DIGITAL_THREAD_RUNTIME_READY).toBe(true);
    expect(D9_RECOMMENDATION_RUNTIME_COUNT).toBe(1);
    expect(D9_RECOMMENDATION_SUPPORT_RUNTIME_READY).toBe(true);
    expect(D9_CONFLICT_DETECTION_RUNTIME_COUNT).toBe(1);
    expect(D9_CONFLICT_GOVERNANCE_ESCALATION_RUNTIME_READY).toBe(true);
    expect(D9_SOURCE_CONTRACT_READ_MODEL_RUNTIME_READY).toBe(true);
    expect(D9_CANONICAL_MILESTONE_COUNT).toBe(9);
    expect(D9_CANONICAL_PHASE_LIST[7]).toBe("EOS-D9-R7-REVIEW-AND-VALIDATION-GOVERNANCE");
    expect(D9_CANONICAL_PHASE_LIST[8]).toBe("EOS-D9-R8-CROSS-DISCIPLINE-BOUNDED-CLOSEOUT");
    expect(D9_CANONICAL_PHASE_LIST).toHaveLength(9);
    expect(D9_R7_EXACT_SUBJECT_REVISION_REQUIRED && D9_R7_CAN_REVIEW_R1_READ_MODEL && D9_R7_CAN_REVIEW_R2_OBSERVATION && D9_R7_CAN_REVIEW_R3_CONFLICT_CANDIDATE && D9_R7_CAN_REVIEW_R4_CONFLICT_GOVERNANCE && D9_R7_CAN_REVIEW_R5_RECOMMENDATION && D9_R7_CAN_REVIEW_R6_CURRENTNESS_THREAD).toBe(true);
    expect(D9_R7_FLOATING_SUBJECT_REFERENCE_ALLOWED || D9_R7_SUBJECT_AUTO_REPOINTED || REVIEW_REQUESTED_EQUALS_REVIEW_ASSIGNED || REVIEW_ASSIGNED_EQUALS_REVIEW_COMPLETED || REVIEW_COMPLETED_EQUALS_ENGINEERING_VALIDATED).toBe(false);
    expect(D9_R7_REVIEW_REQUIRES_TRACEABLE_REVIEWER && D9_R7_REVIEWER_AUTHORITY_TRACEABLE && AI_CAN_ASSIST_D9_REVIEW && D9_R7_FINDING_CONTEXT_SUPPORTED && D9_R7_FINDING_EVIDENCE_REQUIRED && D9_R7_FINDING_EVIDENCE_TRACEABLE && D9_R7_FINDING_CLOSURE_AUTHORITY_REQUIRED && D9_R7_FINDING_CLOSURE_AUTHORITY_TRACEABLE).toBe(true);
    expect(AI_EQUALS_D9_REVIEW_AUTHORITY || ADMIN_EQUALS_D9_REVIEW_AUTHORITY || AI_ASSISTED_REVIEW_EQUALS_HUMAN_REVIEW || AI_REVIEW_OUTPUT_EQUALS_ENGINEERING_VALIDATION).toBe(false);
    expect(FINDING_CLOSED_EQUALS_ENGINEERING_VALIDATED || FINDING_ACCEPTED_EQUALS_APPROVED || FINDING_CLOSED_EQUALS_CONFLICT_RESOLVED).toBe(false);
    expect(D9_VALIDATION_EQUALS_D1_STRUCTURAL_VALIDATION || D9_VALIDATION_EQUALS_D8_IAC_VALIDATION || D9_VALIDATION_EQUALS_CONFORMANCE || D9_VALIDATION_EQUALS_APPROVAL || D9_VALIDATION_EQUALS_CERTIFICATION || D9_VALIDATION_EQUALS_REGULATORY_APPROVAL).toBe(false);
    expect(D9_R7_VALIDATION_REQUIRES_HUMAN_AUTHORITY && D9_R7_VALIDATION_AUTHORITY_TRACEABLE && D9_R7_VALIDATION_EXACT_REVISION_REQUIRED).toBe(true);
    expect(AI_CAN_AUTHORITATIVELY_VALIDATE_D9 || ADMIN_CAN_AUTHORITATIVELY_VALIDATE_D9_WITHOUT_ENGINEERING_AUTHORITY || D9_R7_PERFORMS_AUTOMATIC_ENGINEERING_VALIDATION || D9_R7_VALIDATION_FLOATING_REFERENCE_ALLOWED).toBe(false);
    expect(D9_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT).toBe(0);
    expect(CONFLICT_REVIEWED_EQUALS_CONFLICT_CONFIRMED || CONFLICT_REVIEWED_EQUALS_CONFLICT_RESOLVED || CONFLICT_REVIEWED_EQUALS_ENGINEERING_VALIDATED).toBe(false);
    expect(RECOMMENDATION_REVIEWED_EQUALS_ENGINEERING_DECISION || RECOMMENDATION_REVIEWED_EQUALS_APPROVAL || RECOMMENDATION_REVIEWED_EQUALS_CONFLICT_RESOLUTION || RECOMMENDATION_ACCEPTED_EQUALS_ENGINEERING_DECISION || RECOMMENDATION_ACCEPTED_EQUALS_APPROVAL).toBe(false);
    expect(CURRENT_REVIEW_EQUALS_ENGINEERING_VALIDATED || STALE_REVIEW_EQUALS_INVALID || CURRENT_VALIDATION_RECORD_EQUALS_APPROVAL || STALE_VALIDATION_RECORD_EQUALS_VALIDATION_FAILED || SUPERSEDED_VALIDATION_RECORD_EQUALS_INVALID).toBe(false);
    expect(D9_R7_NEW_REVISION_INHERITS_VALIDATION || D9_R7_NEW_REVISION_INHERITS_APPROVAL || REASSESSMENT_REQUIRED_EQUALS_VALIDATION_FAILED || REASSESSMENT_COMPLETED_EQUALS_VALIDATED).toBe(false);
    expect(D9_R7_CHANGE_CAN_REQUIRE_REASSESSMENT && D9_REUSES_CANONICAL_CURRENTNESS && D9_REUSES_CANONICAL_DIGITAL_THREAD && D9_EXPLICIT_LINEAGE_REQUIRED && D9_R7_REVIEW_VALIDATION_LINEAGE_PRESERVED && D9_REUSES_CANONICAL_FINGERPRINT && D9_R7_REVIEW_VALIDATION_FINGERPRINT_VERIFICATION_SUPPORTED && D9_R7_HISTORY_PRESERVED).toBe(true);
    expect(PARALLEL_D9_CURRENTNESS_ENGINE_CREATED || PARALLEL_D9_DIGITAL_THREAD_CREATED || D9_INFERRED_LINEAGE_ALLOWED || SECOND_D9_FINGERPRINT_ALGORITHM_CREATED || D9_R7_HISTORICAL_REFERENCE_AUTO_REPOINTED || SILENT_D9_R7_MUTATION_ALLOWED || FINGERPRINT_MATCH_EQUALS_ENGINEERING_VALIDATED || FINGERPRINT_MATCH_EQUALS_APPROVAL).toBe(false);
    expect(D9_R7_SOURCE_BASIS_REQUIRED && D9_R7_SOURCE_BASIS_TRACEABLE && D9_R7_PROVENANCE_REQUIRED && D9_R7_PROVENANCE_PRESERVED && D9_R7_APPLICABILITY_EXPLICIT && D9_R7_LIMITATIONS_EXPLICIT && D9_R7_SOURCE_LIMITATIONS_PRESERVED && D9_R7_PRESERVES_D1_INCOMPLETE_STATUS && D9_R7_PRESERVES_D1_LIMITATIONS).toBe(true);
    expect(D9_R7_AUTO_PROPAGATES_OUTSIDE_APPLICABILITY || D9_R7_CAN_SILENTLY_DROP_SOURCE_LIMITATIONS || D9_TREATS_D1_STRUCTURAL_AS_COMPLETE || D9_IGNORES_D1_STRUCTURAL_LIMITATIONS || D1_STRUCTURAL_PACK_COMPLETE).toBe(false);
    expect(D9_EQUALS_D1_STRUCTURAL_AUTHORITY || D9_EQUALS_D8_IAC_AUTHORITY || AI_EQUALS_D9_ENGINEERING_AUTHORITY || ADMIN_EQUALS_D9_ENGINEERING_AUTHORITY || D9_AUTO_VALIDATES_D1_STRUCTURAL || D9_AUTO_VALIDATES_D8_IAC || D9_R7_AUTO_MUTATES_D1_STRUCTURAL || D9_R7_AUTO_MUTATES_D8_IAC).toBe(false);
    expect([D9_CONFLICT_RESOLUTION_RUNTIME_COUNT, D9_AUTOMATIC_CONFLICT_RESOLUTION_RUNTIME_COUNT, D9_ENGINEERING_DECISION_RUNTIME_COUNT, D9_CONFORMANCE_DETERMINATION_RUNTIME_COUNT, D9_APPROVAL_RUNTIME_COUNT, D9_CERTIFICATION_RUNTIME_COUNT, D9_AUTOMATIC_ENGINEERING_DESIGN_RUNTIME_COUNT, D9_AUTOMATIC_ENGINEERING_REDESIGN_RUNTIME_COUNT, D9_ENGINEERING_OPTIMIZATION_RUNTIME_COUNT]).toEqual(Array(9).fill(0));
    expect(D9_R7_RESOLVES_ENGINEERING_CONFLICT || D9_R7_MAKES_ENGINEERING_DECISION || D9_R7_GENERATES_NEW_RECOMMENDATION).toBe(false);
    expect(D9_R8_STARTED).toBe(false);
    expect(TENANT_WORKSPACE_PROJECT_D9_R7_SCOPE_ENFORCED).toBe(true);
    expect(CROSS_TENANT_D9_R7_ACCESS_ALLOWED).toBe(false);
    expect(D9_R7_DUPLICATE_GOVERNANCE_IMPLEMENTED && D9_R7_REPLAY_PROTECTION_IMPLEMENTED && D9_R7_SPOOFING_PROTECTION_IMPLEMENTED && D9_R7_PRESERVES_CLOSED_TRACKS).toBe(true);
    expect(D9_R7_CANONICAL_NEXT_PHASE).toBe("EOS-D9-R8-CROSS-DISCIPLINE-BOUNDED-CLOSEOUT");
    expect(D9_R7_NEXT_PHASE_TYPE).toBe("CROSS_DISCIPLINE_BOUNDED_CLOSEOUT");
    expect(D9_R7_CANONICAL_NEXT_PHASE_SCOPE).toContain("without adding a substantive runtime");
    expect(D1N_REOPENED || D2_REOPENED || D3_REOPENED || D4_REOPENED || D5_REOPENED || D6_REOPENED || D7_REOPENED || D8_REOPENED).toBe(false);
    expect(D2_TRACK_COMPLETE && D3_TRACK_COMPLETE && D4_TRACK_COMPLETE && D5_TRACK_COMPLETE && D6_TRACK_COMPLETE && D7_TRACK_COMPLETE && D8_TRACK_COMPLETE).toBe(true);
    expect(D6_STATUS).toBe("COMPLETE_BOUNDED_WITH_LIMITATIONS");
    expect(D7_STATUS).toBe("COMPLETE_BOUNDED_WITH_LIMITATIONS");
    expect(D8_STATUS).toBe("COMPLETE_BOUNDED_WITH_LIMITATIONS");
    expect(EOS_ALL_DISCIPLINES_COMPLETE || EOS_GA_READY).toBe(false);
    expect(D9_R7_MACHINE_READABLE_ROADMAP_UPDATED).toBe(true);
    expect(D9_R7_BLOCKER).toBe("NONE");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D9.R7.REVIEW_AND_VALIDATION_GOVERNANCE")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D9.R8.CROSS_DISCIPLINE_BOUNDED_CLOSEOUT")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    const sourceText = readFileSync(join(here, "review-validation-governance.ts"), "utf8");
    expect(sourceText).not.toMatch(/createHash|from ["']@rtb\/engineering-review["']|CREATE TABLE|eval\(|child_process|new Function/);
    expect(scanAnalysisFormulaBypass(join(here, "review-validation-governance.ts"), sourceText)).toEqual([]);
  });

  it("records review and D9 validation without validating a discipline or resolving a conflict", () => {
    const r1 = createD9R1Store({ tenantId: reader.tenantId, workspaceId: reader.workspaceId, projectId: reader.projectId });
    const civil = recordD9SourceContractEntry(r1, reader, entry());
    const process = recordD9SourceContractEntry(r1, reader, entry({
      entryId: "entry-process-1",
      sourceDiscipline: "D6_PROCESS",
      sourceDisciplineToken: D6_DISCIPLINE,
      contractId: "process-contract-1",
      contractVersion: D6_R11_STATUS,
      objectId: "process-object-1",
      objectType: "PROCESS_STREAM",
      exactRevision: "rev-process-1",
      currentness: "CURRENT",
      provenanceRef: "prov-process-1",
      sourceBasisRef: "basis-process-1",
      applicability: "train 1",
      limitations: "composition not validated",
      authority: D6_CONTEXT_AUTHORITY,
      lineage: [{ lineageId: "lin-2", fromRevision: "rev-process-0", toRevision: "rev-process-1" }],
      sourceValues: [{ quantityId: "flow", valueText: "10", unitText: "m3/h" }],
    }));
    recordD1IncompletePosture(r1, reader);
    const observations = createD9R2Store(r1);
    const sharedLimitations = `survey control not closed; composition not validated; ${D9_R1_D1_STANDING_LIMITATION}`;
    const observed = recordD9CrossDisciplineObservation(r1, observations, observer, {
      observationId: "obs-1",
      observationType: "EXPLICIT_DIFFERENCE",
      sourceAContractId: civil.contractId,
      sourceAExactRevision: civil.exactRevision,
      sourceAFingerprint: civil.fingerprint,
      sourceBContractId: process.contractId,
      sourceBExactRevision: process.exactRevision,
      sourceBFingerprint: process.fingerprint,
      observedStatement: "Civil revision specifies pad level 12.5 m; Process revision specifies flow 10 m3/h.",
      sourceBasisRef: "basis-civil-1 and basis-process-1",
      provenanceRef: "civil-contract-1 and process-contract-1",
      applicability: "site pad A only; train 1",
      limitations: sharedLimitations,
      citedCurrentness: "STALE",
    });
    const candidates = createD9R3Store(r1, observations);
    const candidate = recordD9ConflictCandidate(r1, observations, candidates, detector, {
      candidateId: "cand-1",
      detectionRuleId: "EXPLICIT_DIFFERENCE_CURRENTNESS_STATE",
      observationId: observed.observationId,
      observationFingerprint: observed.fingerprint,
      sourceAContractId: civil.contractId,
      sourceAExactRevision: civil.exactRevision,
      sourceAFingerprint: civil.fingerprint,
      sourceBContractId: process.contractId,
      sourceBExactRevision: process.exactRevision,
      sourceBFingerprint: process.fingerprint,
      detectedInconsistency: "Rule EXPLICIT_DIFFERENCE_CURRENTNESS_STATE sees civil-contract-1 state STALE and process-contract-1 state CURRENT.",
      uncertainty: "The state tokens differ. This band does not settle an engineering question.",
      confidenceBand: "HIGH",
      severityContext: "REVIEW_CONTEXT",
      sourceBasisRef: observed.sourceBasisRef,
      provenanceRef: `civil-contract-1 process-contract-1 ${observed.observationId} EXPLICIT_DIFFERENCE_CURRENTNESS_STATE ${D9_R3_DETECTION_VERSION}`,
      applicability: observed.applicability,
      limitations: `${observed.limitations}; ${sharedLimitations}`,
      citedCurrentness: "STALE",
    });
    const governanceStore = createD9R4Store(r1, observations, candidates);
    const governance = recordD9ConflictGovernance(r1, observations, candidates, governanceStore, governor, {
      governanceId: "gov-review",
      action: "REVIEW",
      candidateId: candidate.candidateId,
      candidateFingerprint: candidate.fingerprint,
      observationId: observed.observationId,
      observationFingerprint: observed.fingerprint,
      sourceAContractId: civil.contractId,
      sourceAExactRevision: civil.exactRevision,
      sourceAFingerprint: civil.fingerprint,
      sourceBContractId: process.contractId,
      sourceBExactRevision: process.exactRevision,
      sourceBFingerprint: process.fingerprint,
      humanAuthorityId: governor.actorId,
      evidence: "obs-1 cand-1 civil-contract-1 process-contract-1",
      rationale: "Governance record only.",
      sourceBasisRef: candidate.sourceBasisRef,
      provenanceRef: `cand-1 civil-contract-1 process-contract-1 obs-1 ${D9_R4_GOVERNANCE_VERSION}`,
      applicability: candidate.applicability,
      limitations: candidate.limitations,
      citedCurrentness: "STALE",
    });
    const recommendations = createD9R5Store(r1, observations, candidates, governanceStore);
    const recommendation = recordD9Recommendation(r1, observations, candidates, governanceStore, recommendations, recommender, {
      recommendationId: "rec-1",
      governanceId: governance.governanceId,
      governanceFingerprint: governance.fingerprint,
      candidateId: candidate.candidateId,
      candidateFingerprint: candidate.fingerprint,
      observationId: observed.observationId,
      observationFingerprint: observed.fingerprint,
      sourceAContractId: civil.contractId,
      sourceAExactRevision: civil.exactRevision,
      sourceAFingerprint: civil.fingerprint,
      sourceBContractId: process.contractId,
      sourceBExactRevision: process.exactRevision,
      sourceBFingerprint: process.fingerprint,
      statement: "Two advisory options exist for the cited revisions.",
      rationale: "The governance record and both source revisions are the only basis.",
      evidence: `${governance.governanceId} ${candidate.candidateId} civil-contract-1 process-contract-1`,
      assumptions: "Both cited revisions remain the revisions named on the governance record.",
      uncertainty: "The option ranking is informational and can be set aside.",
      confidenceBand: "HIGH",
      alternatives: [
        { alternativeId: "alt-1", statement: "Inspect the cited revisions together.", rank: 1 },
        { alternativeId: "alt-2", statement: "Leave both records unchanged until a human authority looks at them.", rank: 2 },
      ],
      reviewStatus: "REVIEWED",
      sourceBasisRef: governance.sourceBasisRef,
      provenanceRef: `${governance.governanceId} ${candidate.candidateId} ${observed.observationId} civil-contract-1 process-contract-1 ${D9_R5_RECOMMENDATION_VERSION}`,
      applicability: governance.applicability,
      limitations: governance.limitations,
      citedCurrentness: "STALE",
    });
    const currentness = createD9R6Store(r1, observations, candidates, governanceStore, recommendations);
    const assessed = recordD9CurrentnessAssessment(r1, observations, candidates, governanceStore, recommendations, currentness, assessor, {
      assessmentId: "assess-1",
      subjectKind: "RECOMMENDATION",
      subjectId: recommendation.recommendationId,
      subjectFingerprint: recommendation.fingerprint,
      priorCurrentness: recommendation.citedCurrentness,
      assessedCurrentness: "REASSESSMENT_REQUIRED",
      recommendationId: recommendation.recommendationId,
      recommendationFingerprint: recommendation.fingerprint,
      governanceId: governance.governanceId,
      governanceFingerprint: governance.fingerprint,
      candidateId: candidate.candidateId,
      candidateFingerprint: candidate.fingerprint,
      observationId: observed.observationId,
      observationFingerprint: observed.fingerprint,
      sourceAContractId: civil.contractId,
      sourceAExactRevision: civil.exactRevision,
      sourceAFingerprint: civil.fingerprint,
      sourceBContractId: process.contractId,
      sourceBExactRevision: process.exactRevision,
      sourceBFingerprint: process.fingerprint,
      dependencyKind: "GOVERNANCE",
      dependencyId: governance.governanceId,
      dependencyRevision: civil.exactRevision,
      dependencyFingerprint: governance.fingerprint,
      relationshipKind: "GOVERNANCE_TO_RECOMMENDATION",
      lineageFromRevision: "rev-civil-0",
      lineageToRevision: "rev-civil-1",
      transitionBasis: `Assessment ${recommendation.recommendationId} depends on ${governance.governanceId} from rev-civil-0 to rev-civil-1 for civil-contract-1 and process-contract-1.`,
      sourceBasisRef: recommendation.sourceBasisRef,
      provenanceRef: `${recommendation.recommendationId} ${governance.governanceId} ${candidate.candidateId} ${observed.observationId} civil-contract-1 process-contract-1 ${D9_R6_CURRENTNESS_VERSION}`,
      applicability: recommendation.applicability,
      limitations: recommendation.limitations,
    });
    const entriesBefore = JSON.stringify(r1.entries);
    const recommendationsBefore = JSON.stringify(recommendations.recommendations);
    const assessmentsBefore = JSON.stringify(currentness.assessments);
    const store = createD9R7Store(r1, observations, candidates, governanceStore, recommendations, currentness);
    const chain = {
      assessmentId: assessed.assessmentId,
      assessmentFingerprint: assessed.fingerprint,
      recommendationId: recommendation.recommendationId,
      recommendationFingerprint: recommendation.fingerprint,
      governanceId: governance.governanceId,
      governanceFingerprint: governance.fingerprint,
      candidateId: candidate.candidateId,
      candidateFingerprint: candidate.fingerprint,
      observationId: observed.observationId,
      observationFingerprint: observed.fingerprint,
      sourceAContractId: civil.contractId,
      sourceAExactRevision: civil.exactRevision,
      sourceAFingerprint: civil.fingerprint,
      sourceBContractId: process.contractId,
      sourceBExactRevision: process.exactRevision,
      sourceBFingerprint: process.fingerprint,
      lineageFromRevision: "rev-civil-0",
      lineageToRevision: "rev-civil-1",
      sourceBasisRef: assessed.sourceBasisRef,
      provenanceRef: `${recommendation.recommendationId} ${governance.governanceId} ${candidate.candidateId} ${observed.observationId} ${assessed.assessmentId} civil-contract-1 process-contract-1 ${D9_R7_REVIEW_VERSION}`,
      applicability: assessed.applicability,
      limitations: assessed.limitations,
      citedCurrentness: assessed.assessedCurrentness,
    };
    const completedInput: D9R7ReviewInput = {
      ...chain,
      reviewId: "review-1",
      subjectKind: "RECOMMENDATION",
      subjectId: recommendation.recommendationId,
      subjectFingerprint: recommendation.fingerprint,
      reviewStatus: "COMPLETED",
      reviewerId: reviewer.actorId,
      assigneeId: reviewer.actorId,
      findings: [{
        findingId: "find-1",
        statement: "The cited revisions were inspected together.",
        evidence: `${recommendation.recommendationId} civil-contract-1 process-contract-1 ${reviewer.actorId}`,
        status: "CLOSED",
        closureAuthorityId: reviewer.actorId,
      }],
      rationale: "The named reviewer inspected the exact cited revisions.",
      aiAssisted: true,
      noteReassessment: true,
      reassessmentCompleted: true,
    };
    const completed = recordD9Review(r1, observations, candidates, governanceStore, recommendations, currentness, store, reviewer, completedInput);
    expect(completed.reviewStatus).toBe("COMPLETED");
    expect(completed.engineeringValidated || completed.disciplineValidated || completed.approved || completed.certified || completed.conformance || completed.resolved || completed.engineeringDecision || completed.authoritative || completed.completedEqualsValidated || completed.recommendationReviewedEqualsDecision || completed.conflictReviewedEqualsResolved).toBe(false);
    expect(completed.findings[0]?.status).toBe("CLOSED");
    expect(completed.findings[0]?.closedEqualsValidated || completed.findings[0]?.closedEqualsResolved).toBe(false);
    expect(completed.reassessmentNoted).toBe(true);
    expect(completed.reassessmentCompletedEqualsValidated || completed.reassessmentRequiredEqualsValidationFailed).toBe(false);
    expect(completed.aiAssisted).toBe(true);
    expect(completed.reviewerId).toBe(reviewer.actorId);
    expect(completed.reviewerAuthority).toBe("D9_REVIEW_VALIDATION_RECORDER");
    expect(completed.d1PackComplete).toBe(false);
    expect(completed.d1Limitations).toContain("incomplete");
    expect(completed.citedCurrentness).toBe("REASSESSMENT_REQUIRED");
    expect(completed.lineageFromRevision).toBe("rev-civil-0");
    expect(recommendation.engineeringDecision || candidate.confirmedConflict || governance.resolved).toBe(false);
    expect(JSON.stringify(r1.entries)).toBe(entriesBefore);
    expect(JSON.stringify(recommendations.recommendations)).toBe(recommendationsBefore);
    expect(JSON.stringify(currentness.assessments)).toBe(assessmentsBefore);
    expect(recordD9Review(r1, observations, candidates, governanceStore, recommendations, currentness, store, reviewer, completedInput)).toBe(completed);
    const requested = recordD9Review(r1, observations, candidates, governanceStore, recommendations, currentness, store, reviewer, {
      ...chain,
      reviewId: "review-requested",
      subjectKind: "READ_MODEL",
      subjectId: civil.entryId,
      subjectFingerprint: civil.fingerprint,
      reviewStatus: "REQUESTED",
      reviewerId: reviewer.actorId,
      findings: [{
        findingId: "find-open",
        statement: "A requested review names the source entry only.",
        evidence: `${civil.entryId} civil-contract-1 process-contract-1`,
        status: "OPEN",
      }],
      rationale: "The request names the exact source entry.",
    });
    expect(requested.reviewStatus).toBe("REQUESTED");
    expect(requested.assigneeId).toBeNull();
    expect(requested.requestedEqualsAssigned || requested.assignedEqualsCompleted || requested.engineeringValidated).toBe(false);
    const validationInput: D9R7ValidationInput = {
      ...chain,
      validationId: "val-1",
      reviewId: completed.reviewId,
      reviewFingerprint: completed.fingerprint,
      subjectKind: "RECOMMENDATION",
      subjectId: recommendation.recommendationId,
      subjectFingerprint: recommendation.fingerprint,
      validatorId: reviewer.actorId,
      validationEvidence: `${completed.reviewId} ${recommendation.recommendationId} civil-contract-1 process-contract-1 ${reviewer.actorId}`,
      validationBasis: "basis-civil-1 and basis-process-1",
    };
    const validation = recordD9Validation(r1, observations, candidates, governanceStore, recommendations, currentness, store, reviewer, validationInput);
    expect(validation.validationScope).toBe("D9_ARTEFACT_INTEGRITY");
    expect(validation.engineeringValidated || validation.disciplineValidated || validation.approved || validation.certified || validation.conformance || validation.regulatoryApproval || validation.currentEqualsApproval || validation.inheritedFromNewRevision || validation.authoritative).toBe(false);
    expect(validation.sourceAExactRevision).toBe("rev-civil-1");
    expect(store.reviews).toHaveLength(2);
    expect(store.validations).toHaveLength(1);
    expect(recommendations.recommendations).toHaveLength(1);
    expect(() => recordD9Review(r1, observations, candidates, governanceStore, recommendations, currentness, store, reviewer, { ...completedInput, rationale: `${completedInput.rationale} extra` })).toThrow(/REPLAY_REJECTED/);
    expect(() => recordD9Review(r1, observations, candidates, governanceStore, recommendations, currentness, store, reviewer, { ...completedInput, reviewId: "review-dup" })).toThrow(/DUPLICATE_REVIEW_REJECTED/);
    expect(() => recordD9Review(r1, observations, candidates, governanceStore, recommendations, currentness, store, reviewer, { ...completedInput, reviewId: "float", sourceAExactRevision: "current" })).toThrow(/EXACT_REVISION_REQUIRED/);
    expect(() => recordD9Review(r1, observations, candidates, governanceStore, recommendations, currentness, store, reviewer, { ...completedInput, reviewId: "bad-subject", subjectFingerprint: "deadbeef" })).toThrow(/SUBJECT_REVISION_MISMATCH/);
    expect(() => recordD9Review(r1, observations, candidates, governanceStore, recommendations, currentness, store, reviewer, { ...completedInput, reviewId: "status", reviewStatus: "APPROVED" })).toThrow(/REVIEW_STATUS_SPOOFED/);
    expect(() => recordD9Review(r1, observations, candidates, governanceStore, recommendations, currentness, store, reviewer, { ...completedInput, reviewId: "finding", findings: [{ ...completedInput.findings[0]!, status: "APPROVED" }] })).toThrow(/FINDING_STATUS_SPOOFED/);
    expect(() => recordD9Review(r1, observations, candidates, governanceStore, recommendations, currentness, store, reviewer, { ...completedInput, reviewId: "discipline", validateDiscipline: true })).toThrow(/VALIDATION_PROMOTION_REJECTED/);
    expect(() => recordD9Review(r1, observations, candidates, governanceStore, recommendations, currentness, store, reviewer, { ...completedInput, reviewId: "resolve", resolve: true })).toThrow(/CONFLICT_RESOLUTION_REJECTED/);
    expect(() => recordD9Review(r1, observations, candidates, governanceStore, recommendations, currentness, store, reviewer, { ...completedInput, reviewId: "decide", decide: true })).toThrow(/DECISION_REJECTED/);
    expect(() => recordD9Review(r1, observations, candidates, governanceStore, recommendations, currentness, store, reviewer, { ...completedInput, reviewId: "ai-complete", completeAsAi: true })).toThrow(/AI_REVIEW_AUTHORITY_REJECTED/);
    expect(() => recordD9Review(r1, observations, candidates, governanceStore, recommendations, currentness, store, reviewer, { ...completedInput, reviewId: "stripped", limitations: "survey control not closed only" })).toThrow(/SOURCE_LIMITATION_NOT_PRESERVED/);
    expect(() => recordD9Review(r1, observations, candidates, governanceStore, recommendations, currentness, store, { ...reviewer, tenantId: "tenant-b" }, { ...completedInput, reviewId: "cross" })).toThrow(/SCOPE_REQUIRED|CROSS_SCOPE_REJECTED/);
    expect(() => recordD9Review(r1, observations, candidates, governanceStore, recommendations, currentness, store, { ...reviewer, actorKind: "ai" }, { ...completedInput, reviewId: "ai" })).toThrow(/AI_NOT_D9_AUTHORITY/);
    expect(() => recordD9Review(r1, observations, candidates, governanceStore, recommendations, currentness, store, { ...reviewer, authority: "ADMIN" }, { ...completedInput, reviewId: "admin" })).toThrow(/ADMIN_CANNOT_OVERRIDE/);
    expect(() => recordD9Validation(r1, observations, candidates, governanceStore, recommendations, currentness, store, reviewer, { ...validationInput, validationId: "val-dup" })).toThrow(/DUPLICATE_VALIDATION_REJECTED/);
    expect(() => recordD9Validation(r1, observations, candidates, governanceStore, recommendations, currentness, store, reviewer, { ...validationInput, validationId: "val-open", reviewId: requested.reviewId, reviewFingerprint: requested.fingerprint, subjectKind: "READ_MODEL", subjectId: civil.entryId, subjectFingerprint: civil.fingerprint })).toThrow(/REVIEW_NOT_COMPLETED/);
    const note = aiAssistD9Review({ note: "A non-authoritative review note.", evidence: completedInput.findings[0]!.evidence });
    expect(note.aiAssisted).toBe(true);
    expect(note.authoritative || note.humanReview || note.engineeringValidated).toBe(false);
    expect(store.reviews).toHaveLength(2);
    expect(() => aiAssistD9Review({ note: "no", evidence: "x", complete: true })).toThrow(/AI_REVIEW_AUTHORITY_REJECTED/);
    expect(() => repointD9Review()).toThrow(/AUTO_REPOINT_REJECTED/);
    expect(() => inheritD9Validation()).toThrow(/VALIDATION_INHERITANCE_REJECTED/);
    expect(() => resolveFromD9Review()).toThrow(/CONFLICT_RESOLUTION_REJECTED/);
    expect(() => decideFromD9Review()).toThrow(/DECISION_REJECTED/);
    expect(() => approveFromD9Review()).toThrow(/VALIDATION_PROMOTION_REJECTED/);
    expect(() => certifyFromD9Review()).toThrow(/VALIDATION_PROMOTION_REJECTED/);
    expect(() => validateDisciplineFromD9Review()).toThrow(/DISCIPLINE_VALIDATION_REJECTED/);
    expect(() => mutateD9ReviewSource()).toThrow(/SOURCE_MUTATION_REJECTED/);
    recordD9SourceContractEntry(r1, reader, entry({ entryId: "entry-civil-2", exactRevision: "rev-civil-9", currentness: "CURRENT", lineage: [{ lineageId: "lin-9", fromRevision: "rev-civil-1", toRevision: "rev-civil-9" }] }));
    expect(completed.sourceAExactRevision).toBe("rev-civil-1");
    expect(validation.sourceAExactRevision).toBe("rev-civil-1");
    expect(validation.inheritedFromNewRevision).toBe(false);
    expect(recommendation.sourceA.exactRevision).toBe("rev-civil-1");
    expect(assessed.sourceAExactRevision).toBe("rev-civil-1");
    expect(store.validations).toHaveLength(1);
    expect(recommendations.recommendations).toHaveLength(1);
    expect(candidate.confirmedConflict).toBe(false);
    expect(governance.resolved).toBe(false);
  });
});
