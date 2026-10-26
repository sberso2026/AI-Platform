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
import { D9_R4_GOVERNANCE_VERSION, D9_R4_RECORDER_AUTHORITY, D9_R5_STARTED, D9_RECOMMENDATION_RUNTIME_COUNT as R4_RECOMMENDATION_COUNT, D9_RUNTIME_COUNT as R4_RUNTIME_COUNT, createD9R4Store, recordD9ConflictGovernance } from "./conflict-governance-escalation";
import { D9_R2_RECORDER_AUTHORITY, createD9R2Store, recordD9CrossDisciplineObservation } from "./cross-discipline-observation";
import {
  ADMIN_CAN_AUTO_APPLY_RECOMMENDATION_WITHOUT_ENGINEERING_AUTHORITY,
  ADMIN_CAN_PROMOTE_RECOMMENDATION_TO_APPROVAL,
  ADMIN_CAN_PROMOTE_RECOMMENDATION_TO_ENGINEERING_DECISION,
  ADMIN_EQUALS_D9_ENGINEERING_AUTHORITY,
  AI_CAN_APPROVE_CROSS_DISCIPLINE_RESOLUTION,
  AI_CAN_AUTO_APPLY_D9_RECOMMENDATION,
  AI_CAN_GENERATE_D9_RECOMMENDATION_CANDIDATE,
  AI_CAN_MAKE_AUTHORITATIVE_CROSS_DISCIPLINE_DECISION,
  AI_EQUALS_D9_ENGINEERING_AUTHORITY,
  AI_RECOMMENDATION_EQUALS_APPROVAL,
  AI_RECOMMENDATION_EQUALS_CONFLICT_RESOLUTION,
  AI_RECOMMENDATION_EQUALS_ENGINEERING_DECISION,
  AI_RECOMMENDATION_EQUALS_VALIDATED_SOLUTION,
  CROSS_TENANT_D9_R5_ACCESS_ALLOWED,
  CURRENT_RECOMMENDATION_EQUALS_ENGINEERING_DECISION,
  D9_APPROVAL_RUNTIME_COUNT,
  D9_AUTO_VALIDATES_D1_STRUCTURAL,
  D9_AUTO_VALIDATES_D2_CIVIL,
  D9_AUTO_VALIDATES_D8_IAC,
  D9_AUTOMATIC_CONFLICT_RESOLUTION_RUNTIME_COUNT,
  D9_AUTOMATIC_ENGINEERING_DESIGN_RUNTIME_COUNT,
  D9_AUTOMATIC_ENGINEERING_REDESIGN_RUNTIME_COUNT,
  D9_CANONICAL_MILESTONE_COUNT,
  D9_CANONICAL_PHASE_LIST,
  D9_CERTIFICATION_RUNTIME_COUNT,
  D9_CONFLICT_CANDIDATE_DETECTION_RUNTIME_READY,
  D9_CONFLICT_DETECTION_RUNTIME_COUNT,
  D9_CONFLICT_GOVERNANCE_ESCALATION_RUNTIME_COUNT,
  D9_CONFLICT_GOVERNANCE_ESCALATION_RUNTIME_READY,
  D9_CONFLICT_RESOLUTION_RUNTIME_COUNT,
  D9_CONFORMANCE_DETERMINATION_RUNTIME_COUNT,
  D9_CROSS_DISCIPLINE_OBSERVATION_RUNTIME_COUNT,
  D9_CROSS_DISCIPLINE_OBSERVATION_RUNTIME_READY,
  D9_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT,
  D9_ENGINEERING_DECISION_RUNTIME_COUNT,
  D9_ENGINEERING_OPTIMIZATION_RUNTIME_COUNT,
  D9_EQUALS_D1_STRUCTURAL_AUTHORITY,
  D9_EQUALS_D2_CIVIL_AUTHORITY,
  D9_EQUALS_D8_IAC_AUTHORITY,
  D9_EXPLICIT_LINEAGE_REQUIRED,
  D9_IGNORES_D1_STRUCTURAL_LIMITATIONS,
  D9_INFERRED_LINEAGE_ALLOWED,
  D9_R5_AI_RECOMMENDATION_LIMITATIONS_REQUIRED,
  D9_R5_AI_RECOMMENDATION_SOURCE_TRACEABILITY_REQUIRED,
  D9_R5_AI_RECOMMENDATION_UNCERTAINTY_REQUIRED,
  D9_R5_ALTERNATIVE_RECOMMENDATIONS_SUPPORTED,
  D9_R5_APPLICABILITY_EXPLICIT,
  D9_R5_ARCHITECTURE_RECOMMENDATION_REMAINS_ZERO,
  D9_R5_AUTO_APPLIES_RECOMMENDATION,
  D9_R5_AUTO_CREATES_DESIGN_CHANGE,
  D9_R5_AUTO_MUTATES_D1_STRUCTURAL,
  D9_R5_AUTO_MUTATES_D2_CIVIL,
  D9_R5_AUTO_MUTATES_D8_IAC,
  D9_R5_AUTO_MUTATES_ENGINEERING_DESIGN,
  D9_R5_AUTO_PROPAGATES_OUTSIDE_APPLICABILITY,
  D9_R5_AUTOMATICALLY_RESOLVES_CONFLICT,
  D9_R5_BLOCKER,
  D9_R5_CANONICAL_NEXT_PHASE,
  D9_R5_CANONICAL_NEXT_PHASE_SCOPE,
  D9_R5_CAN_SILENTLY_DROP_SOURCE_LIMITATIONS,
  D9_R5_CONFLICT_CHANGE_AUTO_REGENERATES_RECOMMENDATION,
  D9_R5_CONFLICT_CHANGE_AUTO_REPOINTS_RECOMMENDATION,
  D9_R5_CONFLICT_REFERENCE_AUTO_REPOINTED,
  D9_R5_DUPLICATE_GOVERNANCE_IMPLEMENTED,
  D9_R5_EXACT_CANDIDATE_REVISION_REQUIRED,
  D9_R5_EXACT_CONFLICT_REVISION_REQUIRED,
  D9_R5_EXACT_OBSERVATION_REVISION_REQUIRED,
  D9_R5_EXACT_SOURCE_REVISION_REQUIRED,
  D9_R5_FLOATING_CONFLICT_REFERENCE_ALLOWED,
  D9_R5_HISTORICAL_REFERENCE_AUTO_REPOINTED,
  D9_R5_HISTORY_PRESERVED,
  D9_R5_HUMAN_REVIEW_SUPPORTED,
  D9_R5_LIMITATIONS_EXPLICIT,
  D9_R5_MACHINE_READABLE_ROADMAP_UPDATED,
  D9_R5_MAKES_ENGINEERING_DECISION,
  D9_R5_MATURITY,
  D9_R5_NEXT_PHASE_TYPE,
  D9_R5_PRESERVES_AUTHORITY_METADATA,
  D9_R5_PRESERVES_CLOSED_TRACKS,
  D9_R5_PRESERVES_D1_INCOMPLETE_STATUS,
  D9_R5_PRESERVES_D1_LIMITATIONS,
  D9_R5_PRESERVES_R1_SOURCE_REVISION_MANIFEST,
  D9_R5_PRESERVES_R2_OBSERVATION_REFERENCES,
  D9_R5_PRESERVES_R3_CANDIDATE_REFERENCES,
  D9_R5_PRESERVES_SOURCE_DISCIPLINE,
  D9_R5_PRESERVES_SOURCE_IDENTITY,
  D9_R5_PROVENANCE_PRESERVED,
  D9_R5_PROVENANCE_REQUIRED,
  D9_R5_R4_RUNTIME_REMAINS_FOUR,
  D9_R5_RECOMMENDATION_ASSUMPTIONS_EXPLICIT,
  D9_R5_RECOMMENDATION_CONFIDENCE_CONTEXT_SUPPORTED,
  D9_R5_RECOMMENDATION_CURRENTNESS_INTEGRATED,
  D9_R5_RECOMMENDATION_EVIDENCE_TRACEABLE,
  D9_R5_RECOMMENDATION_FINGERPRINT_VERIFICATION_SUPPORTED,
  D9_R5_RECOMMENDATION_LINEAGE_PRESERVED,
  D9_R5_RECOMMENDATION_REQUIRES_EVIDENCE,
  D9_R5_RECOMMENDATION_REQUIRES_EXACT_SOURCE_REVISIONS,
  D9_R5_RECOMMENDATION_REVIEW_CONTEXT_SUPPORTED,
  D9_R5_RECOMMENDATION_VERSION,
  D9_R5_REPLAY_PROTECTION_IMPLEMENTED,
  D9_R5_SOURCE_BASIS_REQUIRED,
  D9_R5_SOURCE_BASIS_TRACEABLE,
  D9_R5_SOURCE_CHANGE_AUTO_APPLIES_RECOMMENDATION,
  D9_R5_SOURCE_CHANGE_AUTO_REGENERATES_RECOMMENDATION,
  D9_R5_SOURCE_CHANGE_AUTO_REPOINTS_RECOMMENDATION,
  D9_R5_SOURCE_LIMITATIONS_PRESERVED,
  D9_R5_SPOOFING_PROTECTION_IMPLEMENTED,
  D9_R5_STATUS,
  D9_R5_USES_R4_GOVERNED_CONFLICT_RECORDS,
  D9_R6_STARTED,
  D9_RECOMMENDATION_EQUALS_APPROVAL,
  D9_RECOMMENDATION_EQUALS_AUTOMATIC_DESIGN_CHANGE,
  D9_RECOMMENDATION_EQUALS_CONFLICT_RESOLUTION,
  D9_RECOMMENDATION_EQUALS_ENGINEERING_DECISION,
  D9_RECOMMENDATION_RECORD_IMPLEMENTED,
  D9_RECOMMENDATION_RUNTIME_COUNT,
  D9_RECOMMENDATION_SUPPORT_RUNTIME_IMPLEMENTED,
  D9_RECOMMENDATION_SUPPORT_RUNTIME_READY,
  D9_REUSES_CANONICAL_CURRENTNESS,
  D9_REUSES_CANONICAL_DECISION_GOVERNANCE,
  D9_REUSES_CANONICAL_DIGITAL_THREAD,
  D9_REUSES_CANONICAL_FINGERPRINT,
  D9_REVIEW_VALIDATION_RUNTIME_COUNT,
  D9_RUNTIME_COUNT,
  D9_RUNTIME_STARTED,
  D9_SOURCE_CONTRACT_READ_MODEL_RUNTIME_COUNT,
  D9_SOURCE_CONTRACT_READ_MODEL_RUNTIME_READY,
  D9_TREATS_D1_STRUCTURAL_AS_COMPLETE,
  EOS_ALL_DISCIPLINES_COMPLETE,
  EOS_GA_READY,
  FINGERPRINT_MATCH_EQUALS_APPROVAL,
  FINGERPRINT_MATCH_EQUALS_ENGINEERING_VALIDATED,
  HIGH_CONFIDENCE_RECOMMENDATION_EQUALS_ENGINEERING_VALIDATED,
  HIGH_RANK_RECOMMENDATION_EQUALS_APPROVED_ENGINEERING_SOLUTION,
  HUMAN_ACCEPTED_RECOMMENDATION_EQUALS_APPROVED_ENGINEERING,
  HUMAN_REVIEWED_RECOMMENDATION_EQUALS_ENGINEERING_DECISION,
  PARALLEL_D9_CURRENTNESS_ENGINE_CREATED,
  PARALLEL_D9_DIGITAL_THREAD_CREATED,
  PARALLEL_D9_ENGINEERING_DECISION_ENGINE_CREATED,
  RECOMMENDATION_ACCEPTED_EQUALS_APPROVAL,
  RECOMMENDATION_ACCEPTED_EQUALS_AUTOMATIC_CHANGE,
  RECOMMENDATION_ACCEPTED_EQUALS_CONFLICT_RESOLVED,
  RECOMMENDATION_ACCEPTED_EQUALS_ENGINEERING_DECISION,
  RECOMMENDATION_ASSUMPTION_EQUALS_VALIDATED_FACT,
  RECOMMENDATION_REVIEWED_EQUALS_APPROVAL,
  RECOMMENDATION_REVIEWED_EQUALS_ENGINEERING_VALIDATED,
  SECOND_D9_FINGERPRINT_ALGORITHM_CREATED,
  SILENT_D9_R5_MUTATION_ALLOWED,
  STALE_RECOMMENDATION_EQUALS_WRONG,
  SUPERSEDED_RECOMMENDATION_EQUALS_INVALID,
  TENANT_WORKSPACE_PROJECT_D9_R5_SCOPE_ENFORCED,
  TOP_RANKED_RECOMMENDATION_EQUALS_APPROVED_SOLUTION,
  TOP_RANKED_RECOMMENDATION_EQUALS_ENGINEERING_DECISION,
  adoptRequirementFromD9Recommendation,
  aiGenerateD9RecommendationCandidate,
  applyD9Recommendation,
  approveD9Recommendation,
  createD9R5Store,
  decideFromD9Recommendation,
  mutateD9RecommendationSource,
  promoteAssumptionFromD9Recommendation,
  recordD9Recommendation,
  regenerateD9Recommendation,
  repointD9Recommendation,
  resolveFromD9Recommendation,
  type D9R5RecommendationInput,
} from "./recommendation-support";
import { D9_R1_D1_STANDING_LIMITATION, D9_R1_RECORDER_AUTHORITY, createD9R1Store, recordD1IncompletePosture, recordD9SourceContractEntry, type D9R1SourceEntryInput } from "./source-contract-read-model";
import { describe, expect, it } from "vitest";

const here = dirname(fileURLToPath(import.meta.url));
const reader = { actorId: "reader-1", authority: D9_R1_RECORDER_AUTHORITY, tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a" };
const observer = { actorId: "observer-1", authority: D9_R2_RECORDER_AUTHORITY, tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a" };
const detector = { actorId: "detector-1", authority: D9_R3_RECORDER_AUTHORITY, tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a" };
const governor = { actorId: "governor-1", authority: D9_R4_RECORDER_AUTHORITY, tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a" };
const recommender = { actorId: "recommender-1", authority: "D9_RECOMMENDATION_RECORDER", tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a" };

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

describe("EOS-D9-R5 recommendation support", () => {
  it("adds one advisory recommendation runtime over exact R4 governance records", () => {
    expect(D9_R5_STATUS).toBe("RECOMMENDATION_SUPPORT_IMPLEMENTED");
    expect(D9_R5_MATURITY).toBe(D9_R5_STATUS);
    expect(D9_RECOMMENDATION_SUPPORT_RUNTIME_IMPLEMENTED && D9_RECOMMENDATION_SUPPORT_RUNTIME_READY && D9_RECOMMENDATION_RECORD_IMPLEMENTED).toBe(true);
    expect(D9_RECOMMENDATION_RUNTIME_COUNT).toBe(1);
    expect(D9_RUNTIME_STARTED).toBe(true);
    expect(D9_RUNTIME_COUNT).toBe(5);
    expect(D9_R5_R4_RUNTIME_REMAINS_FOUR && D9_R5_ARCHITECTURE_RECOMMENDATION_REMAINS_ZERO).toBe(true);
    expect(R4_RUNTIME_COUNT).toBe(4);
    expect(R4_RECOMMENDATION_COUNT).toBe(0);
    expect(D9_R5_STARTED).toBe(false);
    expect(D9_CONFLICT_DETECTION_RUNTIME_COUNT).toBe(1);
    expect(D9_CONFLICT_CANDIDATE_DETECTION_RUNTIME_READY).toBe(true);
    expect(D9_CONFLICT_GOVERNANCE_ESCALATION_RUNTIME_COUNT).toBe(1);
    expect(D9_CONFLICT_GOVERNANCE_ESCALATION_RUNTIME_READY).toBe(true);
    expect(D9_CROSS_DISCIPLINE_OBSERVATION_RUNTIME_COUNT).toBe(1);
    expect(D9_CROSS_DISCIPLINE_OBSERVATION_RUNTIME_READY).toBe(true);
    expect(D9_SOURCE_CONTRACT_READ_MODEL_RUNTIME_COUNT).toBe(1);
    expect(D9_SOURCE_CONTRACT_READ_MODEL_RUNTIME_READY).toBe(true);
    expect(D9_CANONICAL_MILESTONE_COUNT).toBe(9);
    expect(D9_CANONICAL_PHASE_LIST[5]).toBe("EOS-D9-R5-RECOMMENDATION-SUPPORT");
    expect(D9_CANONICAL_PHASE_LIST[6]).toBe("EOS-D9-R6-CURRENTNESS-AND-DIGITAL-THREAD");
    expect(D9_CANONICAL_PHASE_LIST).toHaveLength(9);
    expect(D9_R5_USES_R4_GOVERNED_CONFLICT_RECORDS && D9_R5_EXACT_CONFLICT_REVISION_REQUIRED && D9_R5_PRESERVES_R1_SOURCE_REVISION_MANIFEST && D9_R5_PRESERVES_R2_OBSERVATION_REFERENCES && D9_R5_PRESERVES_R3_CANDIDATE_REFERENCES).toBe(true);
    expect(D9_R5_EXACT_SOURCE_REVISION_REQUIRED && D9_R5_EXACT_OBSERVATION_REVISION_REQUIRED && D9_R5_EXACT_CANDIDATE_REVISION_REQUIRED && D9_R5_RECOMMENDATION_REQUIRES_EVIDENCE && D9_R5_RECOMMENDATION_EVIDENCE_TRACEABLE && D9_R5_RECOMMENDATION_REQUIRES_EXACT_SOURCE_REVISIONS).toBe(true);
    expect(D9_R5_FLOATING_CONFLICT_REFERENCE_ALLOWED || D9_R5_CONFLICT_REFERENCE_AUTO_REPOINTED || D9_RECOMMENDATION_EQUALS_ENGINEERING_DECISION || D9_RECOMMENDATION_EQUALS_APPROVAL || D9_RECOMMENDATION_EQUALS_CONFLICT_RESOLUTION || D9_RECOMMENDATION_EQUALS_AUTOMATIC_DESIGN_CHANGE).toBe(false);
    expect(RECOMMENDATION_ACCEPTED_EQUALS_APPROVAL || RECOMMENDATION_REVIEWED_EQUALS_APPROVAL || RECOMMENDATION_REVIEWED_EQUALS_ENGINEERING_VALIDATED || RECOMMENDATION_ACCEPTED_EQUALS_ENGINEERING_DECISION || RECOMMENDATION_ACCEPTED_EQUALS_CONFLICT_RESOLVED || RECOMMENDATION_ACCEPTED_EQUALS_AUTOMATIC_CHANGE).toBe(false);
    expect(D9_R5_RECOMMENDATION_REVIEW_CONTEXT_SUPPORTED && D9_R5_ALTERNATIVE_RECOMMENDATIONS_SUPPORTED && D9_R5_RECOMMENDATION_CONFIDENCE_CONTEXT_SUPPORTED && D9_R5_HUMAN_REVIEW_SUPPORTED).toBe(true);
    expect(AI_CAN_GENERATE_D9_RECOMMENDATION_CANDIDATE && D9_R5_AI_RECOMMENDATION_SOURCE_TRACEABILITY_REQUIRED && D9_R5_AI_RECOMMENDATION_LIMITATIONS_REQUIRED && D9_R5_AI_RECOMMENDATION_UNCERTAINTY_REQUIRED).toBe(true);
    expect(AI_RECOMMENDATION_EQUALS_ENGINEERING_DECISION || AI_RECOMMENDATION_EQUALS_APPROVAL || AI_RECOMMENDATION_EQUALS_CONFLICT_RESOLUTION || AI_RECOMMENDATION_EQUALS_VALIDATED_SOLUTION).toBe(false);
    expect(TOP_RANKED_RECOMMENDATION_EQUALS_ENGINEERING_DECISION || TOP_RANKED_RECOMMENDATION_EQUALS_APPROVED_SOLUTION || HIGH_CONFIDENCE_RECOMMENDATION_EQUALS_ENGINEERING_VALIDATED || HIGH_RANK_RECOMMENDATION_EQUALS_APPROVED_ENGINEERING_SOLUTION).toBe(false);
    expect(D9_R5_AUTOMATICALLY_RESOLVES_CONFLICT || D9_R5_MAKES_ENGINEERING_DECISION || D9_R5_AUTO_APPLIES_RECOMMENDATION || D9_R5_AUTO_MUTATES_ENGINEERING_DESIGN || D9_R5_AUTO_CREATES_DESIGN_CHANGE).toBe(false);
    expect([D9_CONFLICT_RESOLUTION_RUNTIME_COUNT, D9_AUTOMATIC_CONFLICT_RESOLUTION_RUNTIME_COUNT, D9_ENGINEERING_DECISION_RUNTIME_COUNT, D9_CONFORMANCE_DETERMINATION_RUNTIME_COUNT, D9_APPROVAL_RUNTIME_COUNT, D9_CERTIFICATION_RUNTIME_COUNT, D9_AUTOMATIC_ENGINEERING_DESIGN_RUNTIME_COUNT, D9_AUTOMATIC_ENGINEERING_REDESIGN_RUNTIME_COUNT, D9_ENGINEERING_OPTIMIZATION_RUNTIME_COUNT, D9_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT, D9_REVIEW_VALIDATION_RUNTIME_COUNT]).toEqual(Array(11).fill(0));
    expect(D9_REUSES_CANONICAL_DECISION_GOVERNANCE && D9_REUSES_CANONICAL_CURRENTNESS && D9_REUSES_CANONICAL_DIGITAL_THREAD && D9_REUSES_CANONICAL_FINGERPRINT && D9_EXPLICIT_LINEAGE_REQUIRED).toBe(true);
    expect(PARALLEL_D9_ENGINEERING_DECISION_ENGINE_CREATED || PARALLEL_D9_CURRENTNESS_ENGINE_CREATED || PARALLEL_D9_DIGITAL_THREAD_CREATED || SECOND_D9_FINGERPRINT_ALGORITHM_CREATED || D9_INFERRED_LINEAGE_ALLOWED).toBe(false);
    expect(D9_R5_PRESERVES_D1_INCOMPLETE_STATUS && D9_R5_PRESERVES_D1_LIMITATIONS && D9_R5_PRESERVES_SOURCE_DISCIPLINE && D9_R5_PRESERVES_SOURCE_IDENTITY && D9_R5_PRESERVES_AUTHORITY_METADATA).toBe(true);
    expect(D9_TREATS_D1_STRUCTURAL_AS_COMPLETE || D9_IGNORES_D1_STRUCTURAL_LIMITATIONS || D1_STRUCTURAL_PACK_COMPLETE).toBe(false);
    expect(D9_EQUALS_D1_STRUCTURAL_AUTHORITY || D9_EQUALS_D2_CIVIL_AUTHORITY || D9_EQUALS_D8_IAC_AUTHORITY || AI_EQUALS_D9_ENGINEERING_AUTHORITY || ADMIN_EQUALS_D9_ENGINEERING_AUTHORITY).toBe(false);
    expect(D9_AUTO_VALIDATES_D1_STRUCTURAL || D9_AUTO_VALIDATES_D2_CIVIL || D9_AUTO_VALIDATES_D8_IAC || D9_R5_AUTO_MUTATES_D1_STRUCTURAL || D9_R5_AUTO_MUTATES_D2_CIVIL || D9_R5_AUTO_MUTATES_D8_IAC).toBe(false);
    expect(D9_R5_SOURCE_BASIS_REQUIRED && D9_R5_SOURCE_BASIS_TRACEABLE && D9_R5_PROVENANCE_REQUIRED && D9_R5_PROVENANCE_PRESERVED && D9_R5_APPLICABILITY_EXPLICIT && D9_R5_LIMITATIONS_EXPLICIT && D9_R5_SOURCE_LIMITATIONS_PRESERVED && D9_R5_RECOMMENDATION_ASSUMPTIONS_EXPLICIT).toBe(true);
    expect(D9_R5_AUTO_PROPAGATES_OUTSIDE_APPLICABILITY || D9_R5_CAN_SILENTLY_DROP_SOURCE_LIMITATIONS || RECOMMENDATION_ASSUMPTION_EQUALS_VALIDATED_FACT).toBe(false);
    expect(D9_R5_RECOMMENDATION_CURRENTNESS_INTEGRATED && D9_R5_RECOMMENDATION_LINEAGE_PRESERVED && D9_R5_RECOMMENDATION_FINGERPRINT_VERIFICATION_SUPPORTED && D9_R5_HISTORY_PRESERVED).toBe(true);
    expect(CURRENT_RECOMMENDATION_EQUALS_ENGINEERING_DECISION || STALE_RECOMMENDATION_EQUALS_WRONG || SUPERSEDED_RECOMMENDATION_EQUALS_INVALID || FINGERPRINT_MATCH_EQUALS_ENGINEERING_VALIDATED || FINGERPRINT_MATCH_EQUALS_APPROVAL).toBe(false);
    expect(D9_R5_SOURCE_CHANGE_AUTO_REPOINTS_RECOMMENDATION || D9_R5_SOURCE_CHANGE_AUTO_REGENERATES_RECOMMENDATION || D9_R5_SOURCE_CHANGE_AUTO_APPLIES_RECOMMENDATION || D9_R5_CONFLICT_CHANGE_AUTO_REPOINTS_RECOMMENDATION || D9_R5_CONFLICT_CHANGE_AUTO_REGENERATES_RECOMMENDATION || D9_R5_HISTORICAL_REFERENCE_AUTO_REPOINTED || SILENT_D9_R5_MUTATION_ALLOWED).toBe(false);
    expect(HUMAN_REVIEWED_RECOMMENDATION_EQUALS_ENGINEERING_DECISION || HUMAN_ACCEPTED_RECOMMENDATION_EQUALS_APPROVED_ENGINEERING).toBe(false);
    expect(AI_CAN_MAKE_AUTHORITATIVE_CROSS_DISCIPLINE_DECISION || AI_CAN_APPROVE_CROSS_DISCIPLINE_RESOLUTION || AI_CAN_AUTO_APPLY_D9_RECOMMENDATION || ADMIN_CAN_PROMOTE_RECOMMENDATION_TO_ENGINEERING_DECISION || ADMIN_CAN_PROMOTE_RECOMMENDATION_TO_APPROVAL || ADMIN_CAN_AUTO_APPLY_RECOMMENDATION_WITHOUT_ENGINEERING_AUTHORITY).toBe(false);
    expect(D9_R6_STARTED).toBe(false);
    expect(TENANT_WORKSPACE_PROJECT_D9_R5_SCOPE_ENFORCED).toBe(true);
    expect(CROSS_TENANT_D9_R5_ACCESS_ALLOWED).toBe(false);
    expect(D9_R5_DUPLICATE_GOVERNANCE_IMPLEMENTED && D9_R5_REPLAY_PROTECTION_IMPLEMENTED && D9_R5_SPOOFING_PROTECTION_IMPLEMENTED && D9_R5_PRESERVES_CLOSED_TRACKS).toBe(true);
    expect(D9_R5_CANONICAL_NEXT_PHASE).toBe("EOS-D9-R6-CURRENTNESS-AND-DIGITAL-THREAD");
    expect(D9_R5_NEXT_PHASE_TYPE).toBe("CURRENTNESS_AND_DIGITAL_THREAD");
    expect(D9_R5_CANONICAL_NEXT_PHASE_SCOPE).toContain("current recommendation is not an engineering decision");
    expect(D1N_REOPENED || D2_REOPENED || D3_REOPENED || D4_REOPENED || D5_REOPENED || D6_REOPENED || D7_REOPENED || D8_REOPENED).toBe(false);
    expect(D2_TRACK_COMPLETE && D3_TRACK_COMPLETE && D4_TRACK_COMPLETE && D5_TRACK_COMPLETE && D6_TRACK_COMPLETE && D7_TRACK_COMPLETE && D8_TRACK_COMPLETE).toBe(true);
    expect(D6_STATUS).toBe("COMPLETE_BOUNDED_WITH_LIMITATIONS");
    expect(D7_STATUS).toBe("COMPLETE_BOUNDED_WITH_LIMITATIONS");
    expect(D8_STATUS).toBe("COMPLETE_BOUNDED_WITH_LIMITATIONS");
    expect(EOS_ALL_DISCIPLINES_COMPLETE || EOS_GA_READY).toBe(false);
    expect(D9_R5_MACHINE_READABLE_ROADMAP_UPDATED).toBe(true);
    expect(D9_R5_BLOCKER).toBe("NONE");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D9.R5.RECOMMENDATION_SUPPORT")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D9.R6.CURRENTNESS_AND_DIGITAL_THREAD")?.implementationState).toBe("NOT_IMPLEMENTED");
    const sourceText = readFileSync(join(here, "recommendation-support.ts"), "utf8");
    expect(sourceText).not.toMatch(/createHash|from ["']@rtb\/engineering-review["']|CREATE TABLE|eval\(|child_process|new Function/);
    expect(scanAnalysisFormulaBypass(join(here, "recommendation-support.ts"), sourceText)).toEqual([]);
  });

  it("records advisory alternatives without deciding, approving, resolving, or mutating sources", () => {
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
    const entriesBefore = JSON.stringify(r1.entries);
    const observationsBefore = JSON.stringify(observations.observations);
    const candidatesBefore = JSON.stringify(candidates.candidates);
    const governanceBefore = JSON.stringify(governanceStore.records);
    const store = createD9R5Store(r1, observations, candidates, governanceStore);
    const alternatives = [
      { alternativeId: "alt-1", statement: "Inspect the cited revisions together.", rank: 1 },
      { alternativeId: "alt-2", statement: "Leave both records unchanged until a human authority looks at them.", rank: 2 },
    ];
    const base: D9R5RecommendationInput = {
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
      alternatives,
      reviewStatus: "REVIEWED",
      sourceBasisRef: governance.sourceBasisRef,
      provenanceRef: `${governance.governanceId} ${candidate.candidateId} ${observed.observationId} civil-contract-1 process-contract-1 ${D9_R5_RECOMMENDATION_VERSION}`,
      applicability: governance.applicability,
      limitations: governance.limitations,
      citedCurrentness: "STALE",
      aiAssisted: true,
    };
    const recorded = recordD9Recommendation(r1, observations, candidates, governanceStore, store, recommender, base);
    expect(recorded.recommendationType).toBe("ADVISORY");
    expect(recorded.engineeringDecision || recorded.approved || recorded.resolved || recorded.validated || recorded.applied || recorded.requirementAdopted || recorded.assumptionPromoted || recorded.authoritative || recorded.decisionCreated).toBe(false);
    expect(recorded.reviewed).toBe(true);
    expect(recorded.reviewedEqualsValidated || recorded.acceptedEqualsDecision || recorded.acceptedEqualsApproval || recorded.confidenceEqualsValidated || recorded.topRankEqualsDecision || recorded.topRankEqualsApproved).toBe(false);
    expect(recorded.aiProposed).toBe(true);
    expect(recorded.topRank).toBe(1);
    expect(recorded.alternatives).toHaveLength(2);
    expect(recorded.d1PackComplete).toBe(false);
    expect(recorded.d1Limitations).toContain("incomplete");
    expect(recorded.sourceA.sourceValues[0]).toEqual({ quantityId: "pad-level", valueText: "12.5", unitText: "m" });
    expect(recorded.sourceB.sourceValues[0]).toEqual({ quantityId: "flow", valueText: "10", unitText: "m3/h" });
    expect(recorded.sourceA.sourceDiscipline).toBe("D2_CIVIL");
    expect(recorded.sourceB.authority).toBe(D6_CONTEXT_AUTHORITY);
    expect(recorded.threadLinks.map((link) => link.kind)).toEqual(["GOVERNANCE", "CANDIDATE", "SOURCE", "SOURCE", "OBSERVATION"]);
    expect(recorded.lineage.map((row) => row.lineageId)).toEqual(["lin-1", "lin-2"]);
    expect(recorded.canonicalDecisionGovernanceReused).toBe(true);
    expect(candidate.confirmedConflict).toBe(false);
    expect(governance.resolved || governance.approved || governance.engineeringDecision).toBe(false);
    expect(JSON.stringify(r1.entries)).toBe(entriesBefore);
    expect(JSON.stringify(observations.observations)).toBe(observationsBefore);
    expect(JSON.stringify(candidates.candidates)).toBe(candidatesBefore);
    expect(JSON.stringify(governanceStore.records)).toBe(governanceBefore);
    expect(recordD9Recommendation(r1, observations, candidates, governanceStore, store, recommender, base)).toBe(recorded);
    const accepted = recordD9Recommendation(r1, observations, candidates, governanceStore, store, recommender, {
      ...base,
      recommendationId: "rec-accepted",
      statement: "A second advisory option set can be marked accepted as advice only.",
      reviewStatus: "ACCEPTED_AS_ADVICE",
    });
    expect(accepted.acceptedAsAdvice).toBe(true);
    expect(accepted.acceptedEqualsDecision || accepted.acceptedEqualsResolved || accepted.acceptedEqualsAutomaticChange || accepted.acceptedEqualsApproval || accepted.engineeringDecision || accepted.approved).toBe(false);
    expect(store.history).toHaveLength(2);
    expect(() => recordD9Recommendation(r1, observations, candidates, governanceStore, store, recommender, { ...base, rationale: `${base.rationale} extra` })).toThrow(/REPLAY_REJECTED/);
    expect(() => recordD9Recommendation(r1, observations, candidates, governanceStore, store, recommender, { ...base, recommendationId: "rec-dup" })).toThrow(/DUPLICATE_RECOMMENDATION_REJECTED/);
    expect(() => recordD9Recommendation(r1, observations, candidates, governanceStore, store, recommender, { ...base, recommendationId: "float", sourceAExactRevision: "current" })).toThrow(/EXACT_REVISION_REQUIRED/);
    expect(() => recordD9Recommendation(r1, observations, candidates, governanceStore, store, recommender, { ...base, recommendationId: "bad-gov", governanceFingerprint: "deadbeef" })).toThrow(/CONFLICT_REVISION_MISMATCH/);
    expect(() => recordD9Recommendation(r1, observations, candidates, governanceStore, store, recommender, { ...base, recommendationId: "bad-cand", candidateFingerprint: "deadbeef" })).toThrow(/CANDIDATE_REVISION_MISMATCH/);
    expect(() => recordD9Recommendation(r1, observations, candidates, governanceStore, store, recommender, { ...base, recommendationId: "bad-obs", observationFingerprint: "deadbeef" })).toThrow(/OBSERVATION_REVISION_MISMATCH/);
    expect(() => recordD9Recommendation(r1, observations, candidates, governanceStore, store, recommender, { ...base, recommendationId: "stripped", limitations: "survey control not closed only" })).toThrow(/SOURCE_LIMITATION_NOT_PRESERVED/);
    expect(() => recordD9Recommendation(r1, observations, candidates, governanceStore, store, recommender, { ...base, recommendationId: "therefore", statement: "Therefore this resolves the conflict." })).toThrow(/CONCLUSION_REJECTED/);
    expect(() => recordD9Recommendation(r1, observations, candidates, governanceStore, store, recommender, { ...base, recommendationId: "resolve", resolve: true })).toThrow(/CONFLICT_RESOLUTION_REJECTED/);
    expect(() => recordD9Recommendation(r1, observations, candidates, governanceStore, store, recommender, { ...base, recommendationId: "decide", decide: true })).toThrow(/DECISION_REJECTED/);
    expect(() => recordD9Recommendation(r1, observations, candidates, governanceStore, store, recommender, { ...base, recommendationId: "decision", decisionId: "dec-1" })).toThrow(/DECISION_REJECTED/);
    expect(() => recordD9Recommendation(r1, observations, candidates, governanceStore, store, recommender, { ...base, recommendationId: "approve", approve: true })).toThrow(/VALIDATION_REJECTED/);
    expect(() => recordD9Recommendation(r1, observations, candidates, governanceStore, store, recommender, { ...base, recommendationId: "apply", apply: true })).toThrow(/DESIGN_CHANGE_REJECTED/);
    expect(() => recordD9Recommendation(r1, observations, candidates, governanceStore, store, recommender, { ...base, recommendationId: "adopt", adoptRequirement: true })).toThrow(/REQUIREMENT_ADOPTION_REJECTED/);
    expect(() => recordD9Recommendation(r1, observations, candidates, governanceStore, store, recommender, { ...base, recommendationId: "assume", promoteAssumption: true })).toThrow(/ASSUMPTION_PROMOTION_REJECTED/);
    expect(() => recordD9Recommendation(r1, observations, candidates, governanceStore, store, recommender, { ...base, recommendationId: "design", design: true })).toThrow(/DESIGN_CHANGE_REJECTED/);
    expect(() => recordD9Recommendation(r1, observations, candidates, governanceStore, store, recommender, { ...base, recommendationId: "reviewed", reviewStatus: "APPROVED" })).toThrow(/REVIEW_SPOOFED/);
    expect(() => recordD9Recommendation(r1, observations, candidates, governanceStore, store, recommender, { ...base, recommendationId: "rank", topRankIsDecision: true })).toThrow(/RANK_AUTHORITY_REJECTED/);
    expect(() => recordD9Recommendation(r1, observations, candidates, governanceStore, store, recommender, { ...base, recommendationId: "type", recommendationType: "DECISION" })).toThrow(/RECOMMENDATION_TYPE_SPOOFED/);
    expect(() => recordD9Recommendation(r1, observations, candidates, governanceStore, store, recommender, { ...base, recommendationId: "fp", assertedFingerprint: "deadbeef" })).toThrow(/FINGERPRINT_MISMATCH/);
    expect(() => recordD9Recommendation(r1, observations, candidates, governanceStore, store, { ...recommender, tenantId: "tenant-b" }, { ...base, recommendationId: "cross" })).toThrow(/SCOPE_REQUIRED|CROSS_SCOPE_REJECTED/);
    expect(() => recordD9Recommendation(r1, observations, candidates, governanceStore, store, { ...recommender, actorKind: "ai" }, { ...base, recommendationId: "ai" })).toThrow(/AI_NOT_D9_AUTHORITY/);
    expect(() => recordD9Recommendation(r1, observations, candidates, governanceStore, store, { ...recommender, authority: "ADMIN" }, { ...base, recommendationId: "admin" })).toThrow(/ADMIN_CANNOT_OVERRIDE/);
    const draft = aiGenerateD9RecommendationCandidate({ uncertainty: "This draft is uncertain.", limitations: governance.limitations, evidence: base.evidence });
    expect(draft.aiProposed).toBe(true);
    expect(draft.authoritative || draft.engineeringDecision).toBe(false);
    expect(store.recommendations).toHaveLength(2);
    expect(() => aiGenerateD9RecommendationCandidate({ uncertainty: "no", limitations: "x", evidence: "x", decide: true })).toThrow(/DECISION_REJECTED/);
    expect(() => applyD9Recommendation()).toThrow(/DESIGN_CHANGE_REJECTED/);
    expect(() => decideFromD9Recommendation()).toThrow(/DECISION_REJECTED/);
    expect(() => approveD9Recommendation()).toThrow(/VALIDATION_REJECTED/);
    expect(() => resolveFromD9Recommendation()).toThrow(/CONFLICT_RESOLUTION_REJECTED/);
    expect(() => regenerateD9Recommendation()).toThrow(/AUTO_REGENERATE_REJECTED/);
    expect(() => repointD9Recommendation()).toThrow(/AUTO_REPOINT_REJECTED/);
    expect(() => mutateD9RecommendationSource()).toThrow(/SOURCE_MUTATION_REJECTED/);
    expect(() => adoptRequirementFromD9Recommendation()).toThrow(/REQUIREMENT_ADOPTION_REJECTED/);
    expect(() => promoteAssumptionFromD9Recommendation()).toThrow(/ASSUMPTION_PROMOTION_REJECTED/);
    recordD9SourceContractEntry(r1, reader, entry({ entryId: "entry-civil-2", exactRevision: "rev-civil-9", currentness: "CURRENT" }));
    expect(recorded.sourceA.exactRevision).toBe("rev-civil-1");
    expect(recorded.governanceFingerprint).toBe(governance.fingerprint);
    expect(recorded.candidateFingerprint).toBe(candidate.fingerprint);
    expect(candidate.confirmedConflict).toBe(false);
    expect(governance.resolved).toBe(false);
  });
});
