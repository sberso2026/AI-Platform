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
import {
  ADMIN_CAN_BYPASS_D9_CURRENTNESS_GOVERNANCE,
  ADMIN_CAN_INVENT_D9_LINEAGE,
  ADMIN_CAN_REBASELINE_D9_FINGERPRINT_WITHOUT_GOVERNANCE,
  ADMIN_EQUALS_D9_ENGINEERING_AUTHORITY,
  AI_CAN_INVENT_D9_LINEAGE,
  AI_CAN_MARK_D9_RECORD_CURRENT_WITHOUT_BASIS,
  AI_CAN_REBASELINE_D9_FINGERPRINT,
  AI_EQUALS_D9_ENGINEERING_AUTHORITY,
  CROSS_TENANT_D9_R6_ACCESS_ALLOWED,
  CURRENT_CLOSURE_EQUALS_ENGINEERING_VALIDATED,
  CURRENT_CONFLICT_CANDIDATE_EQUALS_CONFIRMED_CONFLICT,
  CURRENT_CONFIRMED_CONFLICT_EQUALS_RESOLVED_CONFLICT,
  CURRENT_DISPOSITION_EQUALS_APPROVAL,
  CURRENT_EQUALS_VALIDATED,
  CURRENT_ESCALATION_EQUALS_ENGINEERING_DECISION,
  CURRENT_OBSERVATION_EQUALS_VALIDATED,
  CURRENT_RECOMMENDATION_EQUALS_APPROVAL,
  CURRENT_RECOMMENDATION_EQUALS_CONFLICT_RESOLUTION,
  CURRENT_RECOMMENDATION_EQUALS_ENGINEERING_DECISION,
  CURRENT_SOURCE_RECORD_EQUALS_ENGINEERING_VALIDATED,
  D9_APPROVAL_RUNTIME_COUNT,
  D9_AUTO_VALIDATES_D1_STRUCTURAL,
  D9_AUTO_VALIDATES_D8_IAC,
  D9_AUTOMATIC_CONFLICT_RESOLUTION_RUNTIME_COUNT,
  D9_AUTOMATIC_ENGINEERING_DESIGN_RUNTIME_COUNT,
  D9_AUTOMATIC_ENGINEERING_REDESIGN_RUNTIME_COUNT,
  D9_CANONICAL_MILESTONE_COUNT,
  D9_CANONICAL_PHASE_LIST,
  D9_CERTIFICATION_RUNTIME_COUNT,
  D9_CONFLICT_DETECTION_RUNTIME_COUNT,
  D9_CONFLICT_GOVERNANCE_ESCALATION_RUNTIME_READY,
  D9_CONFLICT_RESOLUTION_RUNTIME_COUNT,
  D9_CONFORMANCE_DETERMINATION_RUNTIME_COUNT,
  D9_CROSS_DISCIPLINE_OBSERVATION_RUNTIME_READY,
  D9_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT,
  D9_CURRENTNESS_DIGITAL_THREAD_RUNTIME_IMPLEMENTED,
  D9_CURRENTNESS_DIGITAL_THREAD_RUNTIME_READY,
  D9_ENGINEERING_DECISION_RUNTIME_COUNT,
  D9_ENGINEERING_OPTIMIZATION_RUNTIME_COUNT,
  D9_EQUALS_D1_STRUCTURAL_AUTHORITY,
  D9_EQUALS_D8_IAC_AUTHORITY,
  D9_EXPLICIT_LINEAGE_REQUIRED,
  D9_IGNORES_D1_STRUCTURAL_LIMITATIONS,
  D9_INFERRED_LINEAGE_ALLOWED,
  D9_R6_APPLICABILITY_PRESERVED,
  D9_R6_ARCHITECTURE_CURRENTNESS_REUSED,
  D9_R6_AUTO_MUTATES_D1_STRUCTURAL,
  D9_R6_AUTO_MUTATES_D8_IAC,
  D9_R6_AUTO_PROPAGATES_OUTSIDE_APPLICABILITY,
  D9_R6_AUTO_REGENERATES_RECOMMENDATION,
  D9_R6_BLOCKER,
  D9_R6_CANONICAL_NEXT_PHASE,
  D9_R6_CANONICAL_NEXT_PHASE_SCOPE,
  D9_R6_CAN_SILENTLY_DROP_LIMITATIONS,
  D9_R6_CONFLICT_CANDIDATE_CURRENTNESS_INTEGRATED,
  D9_R6_CONFLICT_GOVERNANCE_CURRENTNESS_INTEGRATED,
  D9_R6_CURRENTNESS_TRANSITION_BASIS_REQUIRED,
  D9_R6_CURRENTNESS_TRANSITION_BASIS_TRACEABLE,
  D9_R6_CURRENTNESS_VERSION,
  D9_R6_DUPLICATE_GOVERNANCE_IMPLEMENTED,
  D9_R6_EXACT_SOURCE_REVISION_REQUIRED,
  D9_R6_EXPLICIT_DEPENDENCIES_REQUIRED,
  D9_R6_FINGERPRINT_MISMATCH_AUTO_REBASELINED,
  D9_R6_FINGERPRINT_MISMATCH_AUTO_REPAIRED,
  D9_R6_FINGERPRINT_VERIFICATION_IMPLEMENTED,
  D9_R6_FLOATING_SOURCE_REFERENCE_ALLOWED,
  D9_R6_GENERATES_NEW_RECOMMENDATION,
  D9_R6_HISTORICAL_REFERENCE_AUTO_REPOINTED,
  D9_R6_HISTORY_PRESERVED,
  D9_R6_INFERRED_DEPENDENCIES_ALLOWED,
  D9_R6_LIMITATIONS_PRESERVED,
  D9_R6_LINEAGE_INTEGRATED,
  D9_R6_MACHINE_READABLE_ROADMAP_UPDATED,
  D9_R6_MAKES_ENGINEERING_DECISION,
  D9_R6_MATURITY,
  D9_R6_NEXT_PHASE_TYPE,
  D9_R6_OBSERVATION_CURRENTNESS_INTEGRATED,
  D9_R6_PRESERVES_CLOSED_TRACKS,
  D9_R6_PRESERVES_D1_INCOMPLETE_STATUS,
  D9_R6_PRESERVES_D1_LIMITATIONS,
  D9_R6_PROVENANCE_PRESERVED,
  D9_R6_PROVENANCE_REQUIRED,
  D9_R6_R5_RUNTIME_REMAINS_FIVE,
  D9_R6_RECOMMENDATION_CURRENTNESS_INTEGRATED,
  D9_R6_REPLAY_PROTECTION_IMPLEMENTED,
  D9_R6_RESOLVES_ENGINEERING_CONFLICT,
  D9_R6_SOURCE_BASIS_REQUIRED,
  D9_R6_SOURCE_BASIS_TRACEABLE,
  D9_R6_SOURCE_CHANGE_AUTO_RECOMPUTES_OBSERVATION,
  D9_R6_SOURCE_CHANGE_AUTO_RECONFIRMS_CONFLICT,
  D9_R6_SOURCE_CHANGE_AUTO_REDETECTS_CONFLICT,
  D9_R6_SOURCE_CHANGE_AUTO_REGENERATES_RECOMMENDATION,
  D9_R6_SOURCE_CHANGE_AUTO_REPOINTS_DEPENDENT_RECORD,
  D9_R6_SOURCE_CHANGE_AUTO_RESOLVES_CONFLICT,
  D9_R6_SOURCE_CHANGE_AUTO_REVALIDATES_RECORD,
  D9_R6_SOURCE_LIMITATIONS_PRESERVED,
  D9_R6_SOURCE_MANIFEST_CURRENTNESS_INTEGRATED,
  D9_R6_SPOOFING_PROTECTION_IMPLEMENTED,
  D9_R6_STATUS,
  D9_R7_STARTED,
  D9_RECOMMENDATION_RUNTIME_COUNT,
  D9_RECOMMENDATION_SUPPORT_RUNTIME_READY,
  D9_REUSES_CANONICAL_CURRENTNESS,
  D9_REUSES_CANONICAL_DIGITAL_THREAD,
  D9_REUSES_CANONICAL_FINGERPRINT,
  D9_REVIEW_VALIDATION_RUNTIME_COUNT,
  D9_RUNTIME_COUNT,
  D9_RUNTIME_STARTED,
  D9_SOURCE_CONTRACT_READ_MODEL_RUNTIME_READY,
  D9_TREATS_D1_STRUCTURAL_AS_COMPLETE,
  DIGITAL_THREAD_RELATIONSHIP_EQUALS_APPROVAL,
  DIGITAL_THREAD_RELATIONSHIP_EQUALS_CONFLICT_RESOLUTION,
  DIGITAL_THREAD_RELATIONSHIP_EQUALS_ENGINEERING_AUTHORITY,
  DIGITAL_THREAD_RELATIONSHIP_EQUALS_ENGINEERING_VALIDATION,
  DIGITAL_THREAD_RELATIONSHIP_EQUALS_REQUIREMENT_ADOPTION,
  EOS_ALL_DISCIPLINES_COMPLETE,
  EOS_GA_READY,
  FINGERPRINT_MATCH_EQUALS_APPROVED,
  FINGERPRINT_MATCH_EQUALS_CONFLICT_RESOLVED,
  FINGERPRINT_MATCH_EQUALS_VALIDATED,
  PARALLEL_D9_CURRENTNESS_ENGINE_CREATED,
  PARALLEL_D9_DIGITAL_THREAD_CREATED,
  REASSESSMENT_COMPLETED_EQUALS_VALIDATED,
  REASSESSMENT_REQUIRED_EQUALS_STALE,
  REASSESSMENT_REQUIRED_EQUALS_VALIDATION_FAILED,
  SECOND_D9_FINGERPRINT_ALGORITHM_CREATED,
  STALE_CONFLICT_CANDIDATE_EQUALS_FALSE,
  STALE_EQUALS_INVALID,
  STALE_OBSERVATION_EQUALS_FALSE,
  STALE_RECOMMENDATION_EQUALS_WRONG,
  STALE_SOURCE_RECORD_EQUALS_ENGINEERING_INVALID,
  SUPERSEDED_CONFLICT_CANDIDATE_EQUALS_INVALID,
  SUPERSEDED_EQUALS_INVALID,
  SUPERSEDED_OBSERVATION_EQUALS_INVALID,
  SUPERSEDED_RECOMMENDATION_EQUALS_INVALID,
  TENANT_WORKSPACE_PROJECT_D9_R6_SCOPE_ENFORCED,
  aiDescribeD9Currentness,
  createD9R6Store,
  inferD9Dependency,
  inferD9Lineage,
  rebaselineD9Fingerprint,
  recomputeD9ObservationFromSourceChange,
  reconfirmD9ConflictFromSourceChange,
  redetectD9ConflictFromSourceChange,
  recordD9CurrentnessAssessment,
  regenerateD9RecommendationFromSourceChange,
  repairD9Fingerprint,
  repointD9Currentness,
  resolveD9ConflictFromSourceChange,
  revalidateD9RecordFromSourceChange,
  type D9R6AssessmentInput,
} from "./currentness-digital-thread";
import { D9_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT as R5_THREAD_COUNT, D9_R5_RECOMMENDATION_VERSION, D9_R6_STARTED, D9_RUNTIME_COUNT as R5_RUNTIME_COUNT, createD9R5Store, recordD9Recommendation } from "./recommendation-support";
import { D9_R1_D1_STANDING_LIMITATION, D9_R1_RECORDER_AUTHORITY, createD9R1Store, recordD1IncompletePosture, recordD9SourceContractEntry, type D9R1SourceEntryInput } from "./source-contract-read-model";
import { describe, expect, it } from "vitest";

const here = dirname(fileURLToPath(import.meta.url));
const reader = { actorId: "reader-1", authority: D9_R1_RECORDER_AUTHORITY, tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a" };
const observer = { actorId: "observer-1", authority: D9_R2_RECORDER_AUTHORITY, tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a" };
const detector = { actorId: "detector-1", authority: D9_R3_RECORDER_AUTHORITY, tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a" };
const governor = { actorId: "governor-1", authority: D9_R4_RECORDER_AUTHORITY, tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a" };
const recommender = { actorId: "recommender-1", authority: "D9_RECOMMENDATION_RECORDER", tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a" };
const assessor = { actorId: "assessor-1", authority: "D9_CURRENTNESS_THREAD_RECORDER", tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a" };

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

describe("EOS-D9-R6 currentness and digital thread", () => {
  it("adds one currentness runtime over exact R1-R5 records", () => {
    expect(D9_R6_STATUS).toBe("CURRENTNESS_AND_DIGITAL_THREAD_IMPLEMENTED");
    expect(D9_R6_MATURITY).toBe(D9_R6_STATUS);
    expect(D9_CURRENTNESS_DIGITAL_THREAD_RUNTIME_IMPLEMENTED && D9_CURRENTNESS_DIGITAL_THREAD_RUNTIME_READY).toBe(true);
    expect(D9_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT).toBe(1);
    expect(D9_RUNTIME_STARTED).toBe(true);
    expect(D9_RUNTIME_COUNT).toBe(6);
    expect(D9_R6_R5_RUNTIME_REMAINS_FIVE && D9_R6_ARCHITECTURE_CURRENTNESS_REUSED).toBe(true);
    expect(R5_RUNTIME_COUNT).toBe(5);
    expect(R5_THREAD_COUNT).toBe(0);
    expect(D9_R6_STARTED).toBe(false);
    expect(D9_RECOMMENDATION_RUNTIME_COUNT).toBe(1);
    expect(D9_RECOMMENDATION_SUPPORT_RUNTIME_READY).toBe(true);
    expect(D9_CONFLICT_DETECTION_RUNTIME_COUNT).toBe(1);
    expect(D9_CONFLICT_GOVERNANCE_ESCALATION_RUNTIME_READY).toBe(true);
    expect(D9_CROSS_DISCIPLINE_OBSERVATION_RUNTIME_READY).toBe(true);
    expect(D9_SOURCE_CONTRACT_READ_MODEL_RUNTIME_READY).toBe(true);
    expect(D9_CANONICAL_MILESTONE_COUNT).toBe(9);
    expect(D9_CANONICAL_PHASE_LIST[6]).toBe("EOS-D9-R6-CURRENTNESS-AND-DIGITAL-THREAD");
    expect(D9_CANONICAL_PHASE_LIST[7]).toBe("EOS-D9-R7-REVIEW-AND-VALIDATION-GOVERNANCE");
    expect(D9_CANONICAL_PHASE_LIST).toHaveLength(9);
    expect(D9_REUSES_CANONICAL_CURRENTNESS && D9_REUSES_CANONICAL_DIGITAL_THREAD && D9_REUSES_CANONICAL_FINGERPRINT && D9_EXPLICIT_LINEAGE_REQUIRED).toBe(true);
    expect(PARALLEL_D9_CURRENTNESS_ENGINE_CREATED || PARALLEL_D9_DIGITAL_THREAD_CREATED || SECOND_D9_FINGERPRINT_ALGORITHM_CREATED || D9_INFERRED_LINEAGE_ALLOWED).toBe(false);
    expect(D9_R6_SOURCE_MANIFEST_CURRENTNESS_INTEGRATED && D9_R6_OBSERVATION_CURRENTNESS_INTEGRATED && D9_R6_CONFLICT_CANDIDATE_CURRENTNESS_INTEGRATED && D9_R6_CONFLICT_GOVERNANCE_CURRENTNESS_INTEGRATED && D9_R6_RECOMMENDATION_CURRENTNESS_INTEGRATED).toBe(true);
    expect(D9_R6_EXACT_SOURCE_REVISION_REQUIRED && D9_R6_EXPLICIT_DEPENDENCIES_REQUIRED && D9_R6_CURRENTNESS_TRANSITION_BASIS_REQUIRED && D9_R6_CURRENTNESS_TRANSITION_BASIS_TRACEABLE && D9_R6_LINEAGE_INTEGRATED && D9_R6_FINGERPRINT_VERIFICATION_IMPLEMENTED).toBe(true);
    expect(D9_R6_FLOATING_SOURCE_REFERENCE_ALLOWED || D9_R6_INFERRED_DEPENDENCIES_ALLOWED || CURRENT_EQUALS_VALIDATED || STALE_EQUALS_INVALID || SUPERSEDED_EQUALS_INVALID).toBe(false);
    expect(CURRENT_SOURCE_RECORD_EQUALS_ENGINEERING_VALIDATED || STALE_SOURCE_RECORD_EQUALS_ENGINEERING_INVALID || CURRENT_OBSERVATION_EQUALS_VALIDATED || STALE_OBSERVATION_EQUALS_FALSE || SUPERSEDED_OBSERVATION_EQUALS_INVALID).toBe(false);
    expect(CURRENT_CONFLICT_CANDIDATE_EQUALS_CONFIRMED_CONFLICT || STALE_CONFLICT_CANDIDATE_EQUALS_FALSE || SUPERSEDED_CONFLICT_CANDIDATE_EQUALS_INVALID || CURRENT_CONFIRMED_CONFLICT_EQUALS_RESOLVED_CONFLICT).toBe(false);
    expect(CURRENT_ESCALATION_EQUALS_ENGINEERING_DECISION || CURRENT_DISPOSITION_EQUALS_APPROVAL || CURRENT_CLOSURE_EQUALS_ENGINEERING_VALIDATED).toBe(false);
    expect(CURRENT_RECOMMENDATION_EQUALS_ENGINEERING_DECISION || CURRENT_RECOMMENDATION_EQUALS_APPROVAL || CURRENT_RECOMMENDATION_EQUALS_CONFLICT_RESOLUTION || STALE_RECOMMENDATION_EQUALS_WRONG || SUPERSEDED_RECOMMENDATION_EQUALS_INVALID).toBe(false);
    expect(D9_R6_SOURCE_CHANGE_AUTO_REPOINTS_DEPENDENT_RECORD || D9_R6_SOURCE_CHANGE_AUTO_RECOMPUTES_OBSERVATION || D9_R6_SOURCE_CHANGE_AUTO_REDETECTS_CONFLICT || D9_R6_SOURCE_CHANGE_AUTO_RECONFIRMS_CONFLICT || D9_R6_SOURCE_CHANGE_AUTO_RESOLVES_CONFLICT || D9_R6_SOURCE_CHANGE_AUTO_REGENERATES_RECOMMENDATION || D9_R6_SOURCE_CHANGE_AUTO_REVALIDATES_RECORD).toBe(false);
    expect(REASSESSMENT_REQUIRED_EQUALS_STALE || REASSESSMENT_REQUIRED_EQUALS_VALIDATION_FAILED || REASSESSMENT_COMPLETED_EQUALS_VALIDATED).toBe(false);
    expect(DIGITAL_THREAD_RELATIONSHIP_EQUALS_ENGINEERING_AUTHORITY || DIGITAL_THREAD_RELATIONSHIP_EQUALS_REQUIREMENT_ADOPTION || DIGITAL_THREAD_RELATIONSHIP_EQUALS_ENGINEERING_VALIDATION || DIGITAL_THREAD_RELATIONSHIP_EQUALS_APPROVAL || DIGITAL_THREAD_RELATIONSHIP_EQUALS_CONFLICT_RESOLUTION).toBe(false);
    expect(D9_R6_HISTORICAL_REFERENCE_AUTO_REPOINTED || D9_R6_FINGERPRINT_MISMATCH_AUTO_REPAIRED || D9_R6_FINGERPRINT_MISMATCH_AUTO_REBASELINED || FINGERPRINT_MATCH_EQUALS_VALIDATED || FINGERPRINT_MATCH_EQUALS_APPROVED || FINGERPRINT_MATCH_EQUALS_CONFLICT_RESOLVED).toBe(false);
    expect(D9_R6_HISTORY_PRESERVED && D9_R6_SOURCE_BASIS_REQUIRED && D9_R6_SOURCE_BASIS_TRACEABLE && D9_R6_PROVENANCE_REQUIRED && D9_R6_PROVENANCE_PRESERVED && D9_R6_APPLICABILITY_PRESERVED && D9_R6_LIMITATIONS_PRESERVED && D9_R6_SOURCE_LIMITATIONS_PRESERVED).toBe(true);
    expect(D9_R6_AUTO_PROPAGATES_OUTSIDE_APPLICABILITY || D9_R6_CAN_SILENTLY_DROP_LIMITATIONS).toBe(false);
    expect(D9_R6_PRESERVES_D1_INCOMPLETE_STATUS && D9_R6_PRESERVES_D1_LIMITATIONS).toBe(true);
    expect(D9_TREATS_D1_STRUCTURAL_AS_COMPLETE || D9_IGNORES_D1_STRUCTURAL_LIMITATIONS || D1_STRUCTURAL_PACK_COMPLETE).toBe(false);
    expect(D9_EQUALS_D1_STRUCTURAL_AUTHORITY || D9_EQUALS_D8_IAC_AUTHORITY || AI_EQUALS_D9_ENGINEERING_AUTHORITY || ADMIN_EQUALS_D9_ENGINEERING_AUTHORITY).toBe(false);
    expect(AI_CAN_MARK_D9_RECORD_CURRENT_WITHOUT_BASIS || AI_CAN_INVENT_D9_LINEAGE || AI_CAN_REBASELINE_D9_FINGERPRINT || ADMIN_CAN_BYPASS_D9_CURRENTNESS_GOVERNANCE || ADMIN_CAN_INVENT_D9_LINEAGE || ADMIN_CAN_REBASELINE_D9_FINGERPRINT_WITHOUT_GOVERNANCE).toBe(false);
    expect(D9_AUTO_VALIDATES_D1_STRUCTURAL || D9_AUTO_VALIDATES_D8_IAC || D9_R6_AUTO_MUTATES_D1_STRUCTURAL || D9_R6_AUTO_MUTATES_D8_IAC).toBe(false);
    expect([D9_ENGINEERING_DECISION_RUNTIME_COUNT, D9_CONFLICT_RESOLUTION_RUNTIME_COUNT, D9_AUTOMATIC_CONFLICT_RESOLUTION_RUNTIME_COUNT, D9_AUTOMATIC_ENGINEERING_DESIGN_RUNTIME_COUNT, D9_AUTOMATIC_ENGINEERING_REDESIGN_RUNTIME_COUNT, D9_ENGINEERING_OPTIMIZATION_RUNTIME_COUNT, D9_CONFORMANCE_DETERMINATION_RUNTIME_COUNT, D9_APPROVAL_RUNTIME_COUNT, D9_CERTIFICATION_RUNTIME_COUNT, D9_REVIEW_VALIDATION_RUNTIME_COUNT]).toEqual(Array(10).fill(0));
    expect(D9_R6_MAKES_ENGINEERING_DECISION || D9_R6_RESOLVES_ENGINEERING_CONFLICT || D9_R6_GENERATES_NEW_RECOMMENDATION || D9_R6_AUTO_REGENERATES_RECOMMENDATION).toBe(false);
    expect(D9_R7_STARTED).toBe(false);
    expect(TENANT_WORKSPACE_PROJECT_D9_R6_SCOPE_ENFORCED).toBe(true);
    expect(CROSS_TENANT_D9_R6_ACCESS_ALLOWED).toBe(false);
    expect(D9_R6_DUPLICATE_GOVERNANCE_IMPLEMENTED && D9_R6_REPLAY_PROTECTION_IMPLEMENTED && D9_R6_SPOOFING_PROTECTION_IMPLEMENTED && D9_R6_PRESERVES_CLOSED_TRACKS).toBe(true);
    expect(D9_R6_CANONICAL_NEXT_PHASE).toBe("EOS-D9-R7-REVIEW-AND-VALIDATION-GOVERNANCE");
    expect(D9_R6_NEXT_PHASE_TYPE).toBe("REVIEW_AND_VALIDATION_GOVERNANCE");
    expect(D9_R6_CANONICAL_NEXT_PHASE_SCOPE).toContain("Review completed is not engineering validated");
    expect(D1N_REOPENED || D2_REOPENED || D3_REOPENED || D4_REOPENED || D5_REOPENED || D6_REOPENED || D7_REOPENED || D8_REOPENED).toBe(false);
    expect(D2_TRACK_COMPLETE && D3_TRACK_COMPLETE && D4_TRACK_COMPLETE && D5_TRACK_COMPLETE && D6_TRACK_COMPLETE && D7_TRACK_COMPLETE && D8_TRACK_COMPLETE).toBe(true);
    expect(D6_STATUS).toBe("COMPLETE_BOUNDED_WITH_LIMITATIONS");
    expect(D7_STATUS).toBe("COMPLETE_BOUNDED_WITH_LIMITATIONS");
    expect(D8_STATUS).toBe("COMPLETE_BOUNDED_WITH_LIMITATIONS");
    expect(EOS_ALL_DISCIPLINES_COMPLETE || EOS_GA_READY).toBe(false);
    expect(D9_R6_MACHINE_READABLE_ROADMAP_UPDATED).toBe(true);
    expect(D9_R6_BLOCKER).toBe("NONE");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D9.R6.CURRENTNESS_AND_DIGITAL_THREAD")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D9.R7.REVIEW_AND_VALIDATION_GOVERNANCE")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    const sourceText = readFileSync(join(here, "currentness-digital-thread.ts"), "utf8");
    expect(sourceText).not.toMatch(/createHash|from ["']@rtb\/engineering-review["']|CREATE TABLE|eval\(|child_process|new Function/);
    expect(scanAnalysisFormulaBypass(join(here, "currentness-digital-thread.ts"), sourceText)).toEqual([]);
  });

  it("records explicit currentness without repointing, recomputing, or promoting authority", () => {
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
      aiAssisted: true,
    });
    const entriesBefore = JSON.stringify(r1.entries);
    const observationsBefore = JSON.stringify(observations.observations);
    const candidatesBefore = JSON.stringify(candidates.candidates);
    const governanceBefore = JSON.stringify(governanceStore.records);
    const recommendationsBefore = JSON.stringify(recommendations.recommendations);
    const store = createD9R6Store(r1, observations, candidates, governanceStore, recommendations);
    const base: D9R6AssessmentInput = {
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
      reassessmentCompleted: true,
    };
    const assessed = recordD9CurrentnessAssessment(r1, observations, candidates, governanceStore, recommendations, store, assessor, base);
    expect(assessed.priorCurrentness).toBe("STALE");
    expect(assessed.assessedCurrentness).toBe("REASSESSMENT_REQUIRED");
    expect(assessed.reassessmentRequiredEqualsStale || assessed.reassessmentRequiredEqualsValidationFailed || assessed.reassessmentCompletedEqualsValidated).toBe(false);
    expect(assessed.reassessmentCompleted).toBe(true);
    expect(assessed.sourceACurrentness).toBe("STALE");
    expect(assessed.sourceBCurrentness).toBe("CURRENT");
    expect(assessed.observationCurrentness).toBe("STALE");
    expect(assessed.candidateCurrentness).toBe("STALE");
    expect(assessed.governanceCurrentness).toBe("STALE");
    expect(assessed.recommendationCurrentness).toBe("STALE");
    expect(assessed.currentEqualsValidated || assessed.currentRecommendationEqualsDecision || assessed.currentRecommendationEqualsApproval || assessed.currentRecommendationEqualsResolution || assessed.currentConfirmedEqualsResolved || assessed.threadEqualsAuthority || assessed.lineageEqualsValidation || assessed.validated || assessed.resolved || assessed.authoritative || assessed.decisionCreated || assessed.recommendationRegenerated).toBe(false);
    expect(assessed.d1PackComplete).toBe(false);
    expect(assessed.d1Limitations).toContain("incomplete");
    expect(assessed.lineageFromRevision).toBe("rev-civil-0");
    expect(assessed.lineageToRevision).toBe("rev-civil-1");
    expect(assessed.relationshipKind).toBe("GOVERNANCE_TO_RECOMMENDATION");
    expect(recommendation.citedCurrentness).toBe("STALE");
    expect(recommendation.engineeringDecision || recommendation.approved || recommendation.resolved).toBe(false);
    expect(candidate.confirmedConflict).toBe(false);
    expect(governance.resolved || governance.approved).toBe(false);
    expect(recommendation.sourceA.sourceValues[0]?.valueText).toBe("12.5");
    expect(JSON.stringify(r1.entries)).toBe(entriesBefore);
    expect(JSON.stringify(observations.observations)).toBe(observationsBefore);
    expect(JSON.stringify(candidates.candidates)).toBe(candidatesBefore);
    expect(JSON.stringify(governanceStore.records)).toBe(governanceBefore);
    expect(JSON.stringify(recommendations.recommendations)).toBe(recommendationsBefore);
    expect(recordD9CurrentnessAssessment(r1, observations, candidates, governanceStore, recommendations, store, assessor, base)).toBe(assessed);
    const derived = recordD9CurrentnessAssessment(r1, observations, candidates, governanceStore, recommendations, store, assessor, {
      ...base,
      assessmentId: "assess-derived",
      assessedCurrentness: "STALE",
      dependencyKind: "SOURCE",
      dependencyId: civil.entryId,
      dependencyRevision: "rev-civil-0",
      dependencyFingerprint: civil.fingerprint,
      relationshipKind: "SOURCE_TO_DERIVED",
      transitionBasis: `Assessment ${recommendation.recommendationId} depends on ${civil.entryId} from rev-civil-0 to rev-civil-1 for civil-contract-1 and process-contract-1.`,
      reassessmentCompleted: false,
    });
    expect(derived.threadEqualsAuthority || derived.threadEqualsValidation || derived.threadEqualsApproval || derived.staleEqualsInvalid || derived.currentSourceEqualsValidated).toBe(false);
    expect(store.history).toHaveLength(2);
    expect(recommendations.recommendations).toHaveLength(1);
    expect(() => recordD9CurrentnessAssessment(r1, observations, candidates, governanceStore, recommendations, store, assessor, { ...base, transitionBasis: `${base.transitionBasis} extra` })).toThrow(/REPLAY_REJECTED/);
    expect(() => recordD9CurrentnessAssessment(r1, observations, candidates, governanceStore, recommendations, store, assessor, { ...base, assessmentId: "assess-dup" })).toThrow(/DUPLICATE_ASSESSMENT_REJECTED/);
    expect(() => recordD9CurrentnessAssessment(r1, observations, candidates, governanceStore, recommendations, store, assessor, { ...base, assessmentId: "float", sourceAExactRevision: "current" })).toThrow(/EXACT_REVISION_REQUIRED/);
    expect(() => recordD9CurrentnessAssessment(r1, observations, candidates, governanceStore, recommendations, store, assessor, { ...base, assessmentId: "lineage", lineageFromRevision: "current" })).toThrow(/LINEAGE_REVISION_REQUIRED/);
    expect(() => recordD9CurrentnessAssessment(r1, observations, candidates, governanceStore, recommendations, store, assessor, { ...base, assessmentId: "bad-rec", recommendationFingerprint: "deadbeef" })).toThrow(/RECOMMENDATION_REVISION_MISMATCH/);
    expect(() => recordD9CurrentnessAssessment(r1, observations, candidates, governanceStore, recommendations, store, assessor, { ...base, assessmentId: "bad-gov", governanceFingerprint: "deadbeef" })).toThrow(/GOVERNANCE_REVISION_MISMATCH/);
    expect(() => recordD9CurrentnessAssessment(r1, observations, candidates, governanceStore, recommendations, store, assessor, { ...base, assessmentId: "infer", infer: true })).toThrow(/INFERRED_DEPENDENCY_REJECTED/);
    expect(() => recordD9CurrentnessAssessment(r1, observations, candidates, governanceStore, recommendations, store, assessor, { ...base, assessmentId: "similar", semanticSimilarity: true })).toThrow(/INFERRED_DEPENDENCY_REJECTED/);
    expect(() => recordD9CurrentnessAssessment(r1, observations, candidates, governanceStore, recommendations, store, assessor, { ...base, assessmentId: "invent", inventLineage: true })).toThrow(/INFERRED_LINEAGE_REJECTED/);
    expect(() => recordD9CurrentnessAssessment(r1, observations, candidates, governanceStore, recommendations, store, assessor, { ...base, assessmentId: "means", currentMeansValidated: true })).toThrow(/VALIDATION_REJECTED/);
    expect(() => recordD9CurrentnessAssessment(r1, observations, candidates, governanceStore, recommendations, store, assessor, { ...base, assessmentId: "state", assessedCurrentness: "VALIDATED" })).toThrow(/CURRENTNESS_SPOOFED/);
    expect(() => recordD9CurrentnessAssessment(r1, observations, candidates, governanceStore, recommendations, store, assessor, { ...base, assessmentId: "rel", relationshipKind: "CANDIDATE_TO_GOVERNANCE" })).toThrow(/RELATIONSHIP_MISMATCH/);
    expect(() => recordD9CurrentnessAssessment(r1, observations, candidates, governanceStore, recommendations, store, assessor, { ...base, assessmentId: "fp", assertedFingerprint: "deadbeef" })).toThrow(/FINGERPRINT_MISMATCH/);
    expect(() => recordD9CurrentnessAssessment(r1, observations, candidates, governanceStore, recommendations, store, assessor, { ...base, assessmentId: "stripped", limitations: "survey control not closed only" })).toThrow(/SOURCE_LIMITATION_NOT_PRESERVED/);
    expect(() => recordD9CurrentnessAssessment(r1, observations, candidates, governanceStore, recommendations, store, assessor, { ...base, assessmentId: "repoint", repoint: true })).toThrow(/AUTO_REPOINT_REJECTED/);
    expect(() => recordD9CurrentnessAssessment(r1, observations, candidates, governanceStore, recommendations, store, assessor, { ...base, assessmentId: "regen", regenerate: true })).toThrow(/AUTO_REGENERATE_REJECTED/);
    expect(() => recordD9CurrentnessAssessment(r1, observations, candidates, governanceStore, recommendations, store, assessor, { ...base, assessmentId: "resolve", resolve: true })).toThrow(/CONFLICT_RESOLUTION_REJECTED/);
    expect(() => recordD9CurrentnessAssessment(r1, observations, candidates, governanceStore, recommendations, store, { ...assessor, tenantId: "tenant-b" }, { ...base, assessmentId: "cross" })).toThrow(/SCOPE_REQUIRED|CROSS_SCOPE_REJECTED/);
    expect(() => recordD9CurrentnessAssessment(r1, observations, candidates, governanceStore, recommendations, store, { ...assessor, actorKind: "ai" }, { ...base, assessmentId: "ai" })).toThrow(/AI_NOT_D9_AUTHORITY/);
    expect(() => recordD9CurrentnessAssessment(r1, observations, candidates, governanceStore, recommendations, store, { ...assessor, authority: "ADMIN" }, { ...base, assessmentId: "admin" })).toThrow(/ADMIN_CANNOT_OVERRIDE/);
    const note = aiDescribeD9Currentness({ basis: "A non-authoritative note about the cited revisions.", limitations: recommendation.limitations });
    expect(note.aiDescribed).toBe(true);
    expect(note.authoritative || note.currentMeansValidated).toBe(false);
    expect(store.assessments).toHaveLength(2);
    expect(() => aiDescribeD9Currentness({ basis: "", limitations: "x", markCurrent: true })).toThrow(/AI_CURRENT_WITHOUT_BASIS/);
    expect(() => aiDescribeD9Currentness({ basis: "note", limitations: "x", inventLineage: true })).toThrow(/INFERRED_LINEAGE_REJECTED/);
    expect(() => aiDescribeD9Currentness({ basis: "note", limitations: "x", rebaseline: true })).toThrow(/FINGERPRINT_REPAIR_REJECTED/);
    expect(() => repointD9Currentness()).toThrow(/AUTO_REPOINT_REJECTED/);
    expect(() => recomputeD9ObservationFromSourceChange()).toThrow(/AUTO_RECOMPUTE_REJECTED/);
    expect(() => redetectD9ConflictFromSourceChange()).toThrow(/AUTO_REDETECT_REJECTED/);
    expect(() => reconfirmD9ConflictFromSourceChange()).toThrow(/AUTO_REDETECT_REJECTED/);
    expect(() => resolveD9ConflictFromSourceChange()).toThrow(/CONFLICT_RESOLUTION_REJECTED/);
    expect(() => regenerateD9RecommendationFromSourceChange()).toThrow(/AUTO_REGENERATE_REJECTED/);
    expect(() => revalidateD9RecordFromSourceChange()).toThrow(/VALIDATION_REJECTED/);
    expect(() => repairD9Fingerprint()).toThrow(/FINGERPRINT_REPAIR_REJECTED/);
    expect(() => rebaselineD9Fingerprint()).toThrow(/FINGERPRINT_REPAIR_REJECTED/);
    expect(() => inferD9Lineage()).toThrow(/INFERRED_LINEAGE_REJECTED/);
    expect(() => inferD9Dependency()).toThrow(/INFERRED_DEPENDENCY_REJECTED/);
    recordD9SourceContractEntry(r1, reader, entry({ entryId: "entry-civil-2", exactRevision: "rev-civil-9", currentness: "CURRENT", lineage: [{ lineageId: "lin-9", fromRevision: "rev-civil-1", toRevision: "rev-civil-9" }] }));
    expect(assessed.sourceAExactRevision).toBe("rev-civil-1");
    expect(assessed.recommendationFingerprint).toBe(recommendation.fingerprint);
    expect(recommendation.sourceA.exactRevision).toBe("rev-civil-1");
    expect(recommendation.citedCurrentness).toBe("STALE");
    expect(observed.citedCurrentness).toBe("STALE");
    expect(candidate.confirmedConflict).toBe(false);
    expect(governance.resolved).toBe(false);
    expect(recommendations.recommendations).toHaveLength(1);
    expect(store.assessments).toHaveLength(2);
  });
});
