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
import { D9_R2_RECORDER_AUTHORITY, createD9R2Store, recordD9CrossDisciplineObservation } from "./cross-discipline-observation";
import {
  ADMIN_CAN_CONFIRM_ENGINEERING_CONFLICT_WITHOUT_AUTHORITY,
  ADMIN_CAN_PROMOTE_ESCALATION_TO_APPROVAL,
  ADMIN_EQUALS_D9_ENGINEERING_AUTHORITY,
  AI_CAN_CONFIRM_ENGINEERING_CONFLICT,
  AI_CAN_PROMOTE_CANDIDATE_TO_CONFIRMED_CONFLICT,
  AI_CAN_RESOLVE_ENGINEERING_CONFLICT,
  AI_EQUALS_D9_ENGINEERING_AUTHORITY,
  CANDIDATE_REVIEWED_EQUALS_CONFIRMED_CONFLICT,
  CANDIDATE_REVIEWED_EQUALS_RESOLVED_CONFLICT,
  CONFLICT_CANDIDATE_EQUALS_CONFIRMED_ENGINEERING_CONFLICT,
  CONFLICT_CLOSED_EQUALS_APPROVED,
  CONFLICT_CLOSED_EQUALS_CONFORMANT,
  CONFLICT_CLOSED_EQUALS_ENGINEERING_VALIDATED,
  CONFLICT_OWNER_EQUALS_SOURCE_DISCIPLINE_AUTHORITY,
  CONFIRMED_ENGINEERING_CONFLICT_EQUALS_CONFLICT_RESOLVED,
  CROSS_TENANT_D9_R4_ACCESS_ALLOWED,
  CURRENT_CONFIRMED_CONFLICT_EQUALS_RESOLVED_CONFLICT,
  D9_APPROVAL_RUNTIME_COUNT,
  D9_AUTO_VALIDATES_D1_STRUCTURAL,
  D9_AUTOMATIC_CONFLICT_RESOLUTION_RUNTIME_COUNT,
  D9_AUTOMATIC_ENGINEERING_DESIGN_RUNTIME_COUNT,
  D9_AUTOMATIC_ENGINEERING_REDESIGN_RUNTIME_COUNT,
  D9_CANONICAL_MILESTONE_COUNT,
  D9_CANONICAL_PHASE_LIST,
  D9_CERTIFICATION_RUNTIME_COUNT,
  D9_CONFLICT_CANDIDATE_DETECTION_RUNTIME_READY,
  D9_CONFLICT_DETECTION_RUNTIME_COUNT,
  D9_CONFLICT_GOVERNANCE_ESCALATION_RUNTIME_COUNT,
  D9_CONFLICT_GOVERNANCE_ESCALATION_RUNTIME_IMPLEMENTED,
  D9_CONFLICT_GOVERNANCE_ESCALATION_RUNTIME_READY,
  D9_CONFLICT_GOVERNANCE_RECORD_IMPLEMENTED,
  D9_CONFLICT_RESOLUTION_RUNTIME_COUNT,
  D9_CONFORMANCE_DETERMINATION_RUNTIME_COUNT,
  D9_CROSS_DISCIPLINE_OBSERVATION_RUNTIME_COUNT,
  D9_CROSS_DISCIPLINE_OBSERVATION_RUNTIME_READY,
  D9_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT,
  D9_ENGINEERING_DECISION_RUNTIME_COUNT,
  D9_ENGINEERING_OPTIMIZATION_RUNTIME_COUNT,
  D9_EQUALS_D1_STRUCTURAL_AUTHORITY,
  D9_EQUALS_D8_IAC_AUTHORITY,
  D9_ESCALATION_EQUALS_APPROVAL,
  D9_ESCALATION_EQUALS_CONFLICT_RESOLUTION,
  D9_ESCALATION_EQUALS_ENGINEERING_DECISION,
  D9_ESCALATION_EQUALS_ENGINEERING_VALIDATION,
  D9_R4_ARCHITECTURE_BOUNDARIES_REMAIN,
  D9_R4_AUTO_MUTATES_D1_STRUCTURAL,
  D9_R4_AUTO_MUTATES_D8_IAC,
  D9_R4_BLOCKER,
  D9_R4_CANDIDATE_AUTO_REPOINTED,
  D9_R4_CANDIDATE_CHANGE_AUTO_RECONFIRMS_CONFLICT,
  D9_R4_CANDIDATE_CHANGE_AUTO_REPOINTS_GOVERNANCE,
  D9_R4_CANDIDATE_REVIEW_REQUIRES_HUMAN_AUTHORITY,
  D9_R4_CANDIDATE_REVIEW_SUPPORTED,
  D9_R4_CANONICAL_NEXT_PHASE,
  D9_R4_CANONICAL_NEXT_PHASE_SCOPE,
  D9_R4_CONFLICT_CLOSURE_AUTHORITY_REQUIRED,
  D9_R4_CONFLICT_CLOSURE_GOVERNANCE_IMPLEMENTED,
  D9_R4_CONFLICT_CONFIRMATION_AUTHORITY_TRACEABLE,
  D9_R4_CONFLICT_CONFIRMATION_REQUIRES_AUTHORITY,
  D9_R4_CONFLICT_CONFIRMATION_STATUS_SUPPORTED,
  D9_R4_CONFLICT_OWNER_EXPLICIT,
  D9_R4_CONFLICT_OWNERSHIP_SUPPORTED,
  D9_R4_DISPOSITION_CONTEXT_IMPLEMENTED,
  D9_R4_DUPLICATE_GOVERNANCE_IMPLEMENTED,
  D9_R4_ESCALATION_AUTHORITY_TRACEABLE,
  D9_R4_ESCALATION_CONTEXT_IMPLEMENTED,
  D9_R4_EXACT_CANDIDATE_REVISION_REQUIRED,
  D9_R4_EXACT_OBSERVATION_REVISION_REQUIRED,
  D9_R4_EXACT_SOURCE_REVISION_REQUIRED,
  D9_R4_FLOATING_CANDIDATE_REFERENCE_ALLOWED,
  D9_R4_GENERATES_ENGINEERING_RECOMMENDATION,
  D9_R4_GENERATES_RESOLUTION_ENGINEERING,
  D9_R4_GOVERNANCE_VERSION,
  D9_R4_HISTORICAL_REFERENCE_AUTO_REPOINTED,
  D9_R4_LIMITATIONS_EXPLICIT,
  D9_R4_MACHINE_READABLE_ROADMAP_UPDATED,
  D9_R4_MAKES_ENGINEERING_DECISION,
  D9_R4_MATURITY,
  D9_R4_OBSERVATION_AUTO_REPOINTED,
  D9_R4_PERFORMS_AUTOMATIC_CONFLICT_RESOLUTION,
  D9_R4_PRESERVES_CLOSED_TRACKS,
  D9_R4_PRESERVES_D1_INCOMPLETE_STATUS,
  D9_R4_PRESERVES_R1_SOURCE_REVISION_MANIFEST,
  D9_R4_PRESERVES_R2_OBSERVATION_REFERENCES,
  D9_R4_PRESERVES_SOURCE_DISCIPLINE,
  D9_R4_PRESERVES_SOURCE_IDENTITY,
  D9_R4_PROVENANCE_PRESERVED,
  D9_R4_R3_RUNTIME_REMAINS_THREE,
  D9_R4_RECORDER_AUTHORITY,
  D9_R4_REPLAY_PROTECTION_IMPLEMENTED,
  D9_R4_RESPONSIBLE_DISCIPLINE_CONTEXT_SUPPORTED,
  D9_R4_SOURCE_AUTO_REPOINTED,
  D9_R4_SOURCE_BASIS_TRACEABLE,
  D9_R4_SOURCE_CHANGE_AUTO_CLOSES_CONFLICT,
  D9_R4_SOURCE_CHANGE_AUTO_RESOLVES_CONFLICT,
  D9_R4_SOURCE_LIMITATIONS_PRESERVED,
  D9_R4_SPOOFING_PROTECTION_IMPLEMENTED,
  D9_R4_STATUS,
  D9_R4_USES_R3_CONFLICT_CANDIDATES,
  D9_R5_STARTED,
  D9_RECOMMENDATION_RUNTIME_COUNT,
  D9_REVIEW_VALIDATION_RUNTIME_COUNT,
  D9_REUSES_CANONICAL_CURRENTNESS,
  D9_REUSES_CANONICAL_DIGITAL_THREAD,
  D9_REUSES_CANONICAL_FINGERPRINT,
  D9_RUNTIME_COUNT,
  D9_RUNTIME_STARTED,
  D9_SOURCE_CONTRACT_READ_MODEL_RUNTIME_COUNT,
  D9_SOURCE_CONTRACT_READ_MODEL_RUNTIME_READY,
  D9_TREATS_D1_STRUCTURAL_AS_COMPLETE,
  DISPOSITION_EQUALS_APPROVAL,
  DISPOSITION_EQUALS_CONFLICT_RESOLUTION,
  DISPOSITION_EQUALS_ENGINEERING_DECISION,
  EOS_ALL_DISCIPLINES_COMPLETE,
  EOS_GA_READY,
  PARALLEL_D9_CURRENTNESS_ENGINE_CREATED,
  PARALLEL_D9_DIGITAL_THREAD_CREATED,
  RESPONSIBLE_DISCIPLINE_ASSIGNMENT_EQUALS_AUTHORITY_TRANSFER,
  RESPONSIBLE_DISCIPLINE_ASSIGNMENT_EQUALS_ENGINEERING_DECISION,
  SECOND_D9_FINGERPRINT_ALGORITHM_CREATED,
  STALE_CONFIRMED_CONFLICT_EQUALS_FALSE,
  SUPERSEDED_CONFLICT_RECORD_EQUALS_INVALID,
  TENANT_WORKSPACE_PROJECT_D9_R4_SCOPE_ENFORCED,
  aiSuggestD9Escalation,
  approveD9Governance,
  closeD9ConflictFromSourceChange,
  createD9R4Store,
  decideFromD9Governance,
  designFromD9Governance,
  mutateD9GovernanceSource,
  reconfirmD9ConflictGovernance,
  recommendFromD9Governance,
  recordD9ConflictGovernance,
  repointD9ConflictGovernance,
  resolveD9ConflictGovernance,
  type D9R4GovernanceInput,
} from "./conflict-governance-escalation";
import { D9_R1_D1_STANDING_LIMITATION, D9_R1_RECORDER_AUTHORITY, createD9R1Store, recordD1IncompletePosture, recordD9SourceContractEntry, type D9R1SourceEntryInput } from "./source-contract-read-model";
import { describe, expect, it } from "vitest";

const here = dirname(fileURLToPath(import.meta.url));
const reader = { actorId: "reader-1", authority: D9_R1_RECORDER_AUTHORITY, tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a" };
const observer = { actorId: "observer-1", authority: D9_R2_RECORDER_AUTHORITY, tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a" };
const detector = { actorId: "detector-1", authority: D9_R3_RECORDER_AUTHORITY, tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a" };
const governor = { actorId: "governor-1", authority: D9_R4_RECORDER_AUTHORITY, tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a" };

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

describe("EOS-D9-R4 conflict governance and escalation", () => {
  it("adds one governance runtime over exact R3 candidates", () => {
    expect(D9_R4_STATUS).toBe("CONFLICT_GOVERNANCE_AND_ESCALATION_IMPLEMENTED");
    expect(D9_R4_MATURITY).toBe(D9_R4_STATUS);
    expect(D9_CONFLICT_GOVERNANCE_ESCALATION_RUNTIME_IMPLEMENTED && D9_CONFLICT_GOVERNANCE_ESCALATION_RUNTIME_READY && D9_CONFLICT_GOVERNANCE_RECORD_IMPLEMENTED).toBe(true);
    expect(D9_CONFLICT_GOVERNANCE_ESCALATION_RUNTIME_COUNT).toBe(1);
    expect(D9_RUNTIME_STARTED).toBe(true);
    expect(D9_RUNTIME_COUNT).toBe(4);
    expect(D9_R4_R3_RUNTIME_REMAINS_THREE && D9_R4_ARCHITECTURE_BOUNDARIES_REMAIN).toBe(true);
    expect(D9_CONFLICT_DETECTION_RUNTIME_COUNT).toBe(1);
    expect(D9_CONFLICT_CANDIDATE_DETECTION_RUNTIME_READY).toBe(true);
    expect(D9_CROSS_DISCIPLINE_OBSERVATION_RUNTIME_COUNT).toBe(1);
    expect(D9_CROSS_DISCIPLINE_OBSERVATION_RUNTIME_READY).toBe(true);
    expect(D9_SOURCE_CONTRACT_READ_MODEL_RUNTIME_COUNT).toBe(1);
    expect(D9_SOURCE_CONTRACT_READ_MODEL_RUNTIME_READY).toBe(true);
    expect(D9_CANONICAL_MILESTONE_COUNT).toBe(9);
    expect(D9_CANONICAL_PHASE_LIST[4]).toBe("EOS-D9-R4-CONFLICT-GOVERNANCE-AND-ESCALATION");
    expect(D9_CANONICAL_PHASE_LIST[5]).toBe("EOS-D9-R5-RECOMMENDATION-SUPPORT");
    expect(D9_CANONICAL_PHASE_LIST).toHaveLength(9);
    expect(D9_R4_USES_R3_CONFLICT_CANDIDATES && D9_R4_EXACT_CANDIDATE_REVISION_REQUIRED && D9_R4_PRESERVES_R1_SOURCE_REVISION_MANIFEST && D9_R4_EXACT_SOURCE_REVISION_REQUIRED && D9_R4_PRESERVES_R2_OBSERVATION_REFERENCES && D9_R4_EXACT_OBSERVATION_REVISION_REQUIRED).toBe(true);
    expect(D9_R4_FLOATING_CANDIDATE_REFERENCE_ALLOWED || D9_R4_CANDIDATE_AUTO_REPOINTED || D9_R4_SOURCE_AUTO_REPOINTED || D9_R4_OBSERVATION_AUTO_REPOINTED || D9_TREATS_D1_STRUCTURAL_AS_COMPLETE || D1_STRUCTURAL_PACK_COMPLETE).toBe(false);
    expect(D9_R4_CANDIDATE_REVIEW_SUPPORTED && D9_R4_CANDIDATE_REVIEW_REQUIRES_HUMAN_AUTHORITY && D9_R4_CONFLICT_CONFIRMATION_STATUS_SUPPORTED && D9_R4_CONFLICT_CONFIRMATION_REQUIRES_AUTHORITY && D9_R4_CONFLICT_CONFIRMATION_AUTHORITY_TRACEABLE).toBe(true);
    expect(CANDIDATE_REVIEWED_EQUALS_CONFIRMED_CONFLICT || CANDIDATE_REVIEWED_EQUALS_RESOLVED_CONFLICT || CONFLICT_CANDIDATE_EQUALS_CONFIRMED_ENGINEERING_CONFLICT || CONFIRMED_ENGINEERING_CONFLICT_EQUALS_CONFLICT_RESOLVED).toBe(false);
    expect(AI_CAN_CONFIRM_ENGINEERING_CONFLICT || AI_CAN_PROMOTE_CANDIDATE_TO_CONFIRMED_CONFLICT || ADMIN_CAN_CONFIRM_ENGINEERING_CONFLICT_WITHOUT_AUTHORITY || AI_CAN_RESOLVE_ENGINEERING_CONFLICT || ADMIN_CAN_PROMOTE_ESCALATION_TO_APPROVAL).toBe(false);
    expect(D9_R4_CONFLICT_OWNERSHIP_SUPPORTED && D9_R4_CONFLICT_OWNER_EXPLICIT && D9_R4_RESPONSIBLE_DISCIPLINE_CONTEXT_SUPPORTED && D9_R4_ESCALATION_CONTEXT_IMPLEMENTED && D9_R4_ESCALATION_AUTHORITY_TRACEABLE && D9_R4_DISPOSITION_CONTEXT_IMPLEMENTED).toBe(true);
    expect(CONFLICT_OWNER_EQUALS_SOURCE_DISCIPLINE_AUTHORITY || RESPONSIBLE_DISCIPLINE_ASSIGNMENT_EQUALS_ENGINEERING_DECISION || RESPONSIBLE_DISCIPLINE_ASSIGNMENT_EQUALS_AUTHORITY_TRANSFER).toBe(false);
    expect(D9_ESCALATION_EQUALS_ENGINEERING_DECISION || D9_ESCALATION_EQUALS_APPROVAL || D9_ESCALATION_EQUALS_CONFLICT_RESOLUTION || D9_ESCALATION_EQUALS_ENGINEERING_VALIDATION).toBe(false);
    expect(DISPOSITION_EQUALS_ENGINEERING_DECISION || DISPOSITION_EQUALS_CONFLICT_RESOLUTION || DISPOSITION_EQUALS_APPROVAL).toBe(false);
    expect(D9_R4_CONFLICT_CLOSURE_GOVERNANCE_IMPLEMENTED && D9_R4_CONFLICT_CLOSURE_AUTHORITY_REQUIRED).toBe(true);
    expect(CONFLICT_CLOSED_EQUALS_ENGINEERING_VALIDATED || CONFLICT_CLOSED_EQUALS_APPROVED || CONFLICT_CLOSED_EQUALS_CONFORMANT).toBe(false);
    expect(D9_R4_PERFORMS_AUTOMATIC_CONFLICT_RESOLUTION || D9_R4_GENERATES_RESOLUTION_ENGINEERING || D9_R4_GENERATES_ENGINEERING_RECOMMENDATION || D9_R4_MAKES_ENGINEERING_DECISION).toBe(false);
    expect([D9_CONFLICT_RESOLUTION_RUNTIME_COUNT, D9_AUTOMATIC_CONFLICT_RESOLUTION_RUNTIME_COUNT, D9_RECOMMENDATION_RUNTIME_COUNT, D9_ENGINEERING_DECISION_RUNTIME_COUNT, D9_APPROVAL_RUNTIME_COUNT, D9_CONFORMANCE_DETERMINATION_RUNTIME_COUNT, D9_CERTIFICATION_RUNTIME_COUNT, D9_AUTOMATIC_ENGINEERING_DESIGN_RUNTIME_COUNT, D9_AUTOMATIC_ENGINEERING_REDESIGN_RUNTIME_COUNT, D9_ENGINEERING_OPTIMIZATION_RUNTIME_COUNT, D9_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT, D9_REVIEW_VALIDATION_RUNTIME_COUNT]).toEqual(Array(12).fill(0));
    expect(D9_R4_PRESERVES_D1_INCOMPLETE_STATUS && D9_R4_PRESERVES_SOURCE_DISCIPLINE && D9_R4_PRESERVES_SOURCE_IDENTITY && D9_R4_SOURCE_BASIS_TRACEABLE && D9_R4_PROVENANCE_PRESERVED && D9_R4_LIMITATIONS_EXPLICIT && D9_R4_SOURCE_LIMITATIONS_PRESERVED).toBe(true);
    expect(D9_EQUALS_D1_STRUCTURAL_AUTHORITY || D9_EQUALS_D8_IAC_AUTHORITY || AI_EQUALS_D9_ENGINEERING_AUTHORITY || ADMIN_EQUALS_D9_ENGINEERING_AUTHORITY || D9_AUTO_VALIDATES_D1_STRUCTURAL || D9_R4_AUTO_MUTATES_D1_STRUCTURAL || D9_R4_AUTO_MUTATES_D8_IAC).toBe(false);
    expect(D9_REUSES_CANONICAL_CURRENTNESS && D9_REUSES_CANONICAL_DIGITAL_THREAD && D9_REUSES_CANONICAL_FINGERPRINT).toBe(true);
    expect(PARALLEL_D9_CURRENTNESS_ENGINE_CREATED || PARALLEL_D9_DIGITAL_THREAD_CREATED || SECOND_D9_FINGERPRINT_ALGORITHM_CREATED || CURRENT_CONFIRMED_CONFLICT_EQUALS_RESOLVED_CONFLICT || STALE_CONFIRMED_CONFLICT_EQUALS_FALSE || SUPERSEDED_CONFLICT_RECORD_EQUALS_INVALID).toBe(false);
    expect(D9_R4_SOURCE_CHANGE_AUTO_RESOLVES_CONFLICT || D9_R4_SOURCE_CHANGE_AUTO_CLOSES_CONFLICT || D9_R4_CANDIDATE_CHANGE_AUTO_REPOINTS_GOVERNANCE || D9_R4_CANDIDATE_CHANGE_AUTO_RECONFIRMS_CONFLICT || D9_R4_HISTORICAL_REFERENCE_AUTO_REPOINTED).toBe(false);
    expect(TENANT_WORKSPACE_PROJECT_D9_R4_SCOPE_ENFORCED).toBe(true);
    expect(CROSS_TENANT_D9_R4_ACCESS_ALLOWED).toBe(false);
    expect(D9_R4_DUPLICATE_GOVERNANCE_IMPLEMENTED && D9_R4_REPLAY_PROTECTION_IMPLEMENTED && D9_R4_SPOOFING_PROTECTION_IMPLEMENTED && D9_R4_PRESERVES_CLOSED_TRACKS).toBe(true);
    expect(D9_R5_STARTED).toBe(false);
    expect(D9_R4_CANONICAL_NEXT_PHASE).toBe("EOS-D9-R5-RECOMMENDATION-SUPPORT");
    expect(D9_R4_CANONICAL_NEXT_PHASE_SCOPE).toContain("recommendation is not an engineering decision");
    expect(D1N_REOPENED || D2_REOPENED || D3_REOPENED || D4_REOPENED || D5_REOPENED || D6_REOPENED || D7_REOPENED || D8_REOPENED).toBe(false);
    expect(D2_TRACK_COMPLETE && D3_TRACK_COMPLETE && D4_TRACK_COMPLETE && D5_TRACK_COMPLETE && D6_TRACK_COMPLETE && D7_TRACK_COMPLETE && D8_TRACK_COMPLETE).toBe(true);
    expect(D6_STATUS).toBe("COMPLETE_BOUNDED_WITH_LIMITATIONS");
    expect(D7_STATUS).toBe("COMPLETE_BOUNDED_WITH_LIMITATIONS");
    expect(D8_STATUS).toBe("COMPLETE_BOUNDED_WITH_LIMITATIONS");
    expect(EOS_ALL_DISCIPLINES_COMPLETE || EOS_GA_READY).toBe(false);
    expect(D9_R4_MACHINE_READABLE_ROADMAP_UPDATED).toBe(true);
    expect(D9_R4_BLOCKER).toBe("NONE");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D9.R4.CONFLICT_GOVERNANCE_AND_ESCALATION")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D9.R5.RECOMMENDATION_SUPPORT")?.implementationState).toBe("NOT_IMPLEMENTED");
    const sourceText = readFileSync(join(here, "conflict-governance-escalation.ts"), "utf8");
    expect(sourceText).not.toMatch(/createHash|from ["']@rtb\/engineering-review["']|CREATE TABLE|eval\(|child_process|new Function/);
    expect(scanAnalysisFormulaBypass(join(here, "conflict-governance-escalation.ts"), sourceText)).toEqual([]);
  });

  it("governs review, confirmation, escalation, disposition, and closure without resolving the candidate", () => {
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
    const entriesBefore = JSON.stringify(r1.entries);
    const observationsBefore = JSON.stringify(observations.observations);
    const candidatesBefore = JSON.stringify(candidates.candidates);
    const store = createD9R4Store(r1, observations, candidates);
    const evidence = "obs-1 cand-1 civil-contract-1 process-contract-1";
    const base: D9R4GovernanceInput = {
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
      evidence,
      rationale: "Governance record only.",
      sourceBasisRef: candidate.sourceBasisRef,
      provenanceRef: `cand-1 civil-contract-1 process-contract-1 obs-1 ${D9_R4_GOVERNANCE_VERSION}`,
      applicability: candidate.applicability,
      limitations: candidate.limitations,
      citedCurrentness: "STALE",
    };
    const review = recordD9ConflictGovernance(r1, observations, candidates, store, governor, base);
    expect(review.status).toBe("REVIEWED");
    expect(review.reviewed).toBe(true);
    expect(review.confirmationStatus).toBe("UNCONFIRMED");
    expect(review.reviewedEqualsConfirmed || review.reviewedEqualsResolved || review.resolved || review.validated || review.approved).toBe(false);
    expect(candidate.confirmedConflict).toBe(false);
    expect(recordD9ConflictGovernance(r1, observations, candidates, store, governor, base)).toBe(review);
    const confirmed = recordD9ConflictGovernance(r1, observations, candidates, store, governor, {
      ...base,
      governanceId: "gov-confirm",
      action: "CONFIRM",
      confirmationBasis: `${governor.actorId} ${evidence} civil-contract-1 process-contract-1`,
    });
    expect(confirmed.confirmationStatus).toBe("CONFIRMED");
    expect(confirmed.resolved || confirmed.validated || confirmed.approved || confirmed.engineeringDecision || confirmed.authoritative).toBe(false);
    expect(candidate.confirmedConflict).toBe(false);
    expect(confirmed.humanAuthorityId).toBe(governor.actorId);
    const owned = recordD9ConflictGovernance(r1, observations, candidates, store, governor, { ...base, governanceId: "gov-owner", action: "ASSIGN_OWNER", ownerId: "owner-human-1" });
    expect(owned.ownerId).toBe("owner-human-1");
    expect(owned.ownerEqualsSourceAuthority).toBe(false);
    const discipline = recordD9ConflictGovernance(r1, observations, candidates, store, governor, { ...base, governanceId: "gov-discipline", action: "ASSIGN_DISCIPLINE", responsibleDiscipline: candidate.sourceA.sourceDiscipline });
    expect(discipline.responsibleDiscipline).toBe("D2_CIVIL");
    expect(discipline.responsibleDisciplineEqualsDecision || discipline.responsibleDisciplineEqualsAuthorityTransfer).toBe(false);
    const escalation = recordD9ConflictGovernance(r1, observations, candidates, store, governor, {
      ...base,
      governanceId: "gov-escalate",
      action: "ESCALATE",
      escalationReason: "Currentness tokens differ and a named recipient should inspect them.",
      escalationRecipient: "human-recipient-1",
      requiredAction: "Inspect the cited revisions.",
      severityContext: "REVIEW_CONTEXT",
    });
    expect(escalation.status).toBe("ESCALATED");
    expect(escalation.escalationEqualsDecision || escalation.escalationEqualsApproval || escalation.escalationEqualsResolution || escalation.escalationEqualsValidation).toBe(false);
    const disposition = recordD9ConflictGovernance(r1, observations, candidates, store, governor, { ...base, governanceId: "gov-disposition", action: "DISPOSE", disposition: "HELD" });
    expect(disposition.disposition).toBe("HELD");
    expect(disposition.dispositionEqualsDecision || disposition.dispositionEqualsResolution || disposition.dispositionEqualsApproval).toBe(false);
    const closed = recordD9ConflictGovernance(r1, observations, candidates, store, governor, { ...base, governanceId: "gov-close", action: "CLOSE" });
    expect(closed.closureStatus).toBe("CLOSED");
    expect(closed.closedEqualsValidated || closed.closedEqualsApproved || closed.closedEqualsConformant || closed.resolved).toBe(false);
    expect(JSON.stringify(r1.entries)).toBe(entriesBefore);
    expect(JSON.stringify(observations.observations)).toBe(observationsBefore);
    expect(JSON.stringify(candidates.candidates)).toBe(candidatesBefore);
    expect(candidate.sourceA.exactRevision).toBe("rev-civil-1");
    expect(review.threadLinks.map((link) => link.kind)).toEqual(["CANDIDATE", "SOURCE", "SOURCE", "OBSERVATION"]);
    expect(store.history).toHaveLength(7);
    expect(() => recordD9ConflictGovernance(r1, observations, candidates, store, governor, { ...base, rationale: `${base.rationale} extra` })).toThrow(/REPLAY_REJECTED/);
    expect(() => recordD9ConflictGovernance(r1, observations, candidates, store, governor, { ...base, governanceId: "gov-dup" })).toThrow(/DUPLICATE_GOVERNANCE_REJECTED/);
    expect(() => recordD9ConflictGovernance(r1, observations, candidates, store, governor, { ...base, governanceId: "float", sourceAExactRevision: "current" })).toThrow(/EXACT_REVISION_REQUIRED/);
    expect(() => recordD9ConflictGovernance(r1, observations, candidates, store, governor, { ...base, governanceId: "bad-cand", candidateFingerprint: "deadbeef" })).toThrow(/CANDIDATE_REVISION_MISMATCH/);
    expect(() => recordD9ConflictGovernance(r1, observations, candidates, store, governor, { ...base, governanceId: "bad-obs", observationFingerprint: "deadbeef" })).toThrow(/OBSERVATION_REVISION_MISMATCH/);
    expect(() => recordD9ConflictGovernance(r1, observations, candidates, store, governor, { ...base, governanceId: "stripped", action: "CLOSE", limitations: "survey control not closed only" })).toThrow(/SOURCE_LIMITATION_NOT_PRESERVED/);
    expect(() => recordD9ConflictGovernance(r1, observations, candidates, store, governor, { ...base, governanceId: "therefore", action: "CLOSE", rationale: "Therefore this resolves the conflict." })).toThrow(/CONCLUSION_REJECTED/);
    expect(() => recordD9ConflictGovernance(r1, observations, candidates, store, governor, { ...base, governanceId: "resolve", resolve: true })).toThrow(/CONFLICT_RESOLUTION_REJECTED/);
    expect(() => recordD9ConflictGovernance(r1, observations, candidates, store, governor, { ...base, governanceId: "recommend", recommend: true })).toThrow(/RECOMMENDATION_REJECTED/);
    expect(() => recordD9ConflictGovernance(r1, observations, candidates, store, governor, { ...base, governanceId: "decide", decide: true })).toThrow(/DECISION_REJECTED/);
    expect(() => recordD9ConflictGovernance(r1, observations, candidates, store, governor, { ...base, governanceId: "approve", approve: true })).toThrow(/VALIDATION_REJECTED/);
    expect(() => recordD9ConflictGovernance(r1, observations, candidates, store, governor, { ...base, governanceId: "design", design: true })).toThrow(/DESIGN_REJECTED/);
    expect(() => recordD9ConflictGovernance(r1, observations, candidates, store, governor, { ...base, governanceId: "owner-auth", action: "ASSIGN_OWNER", ownerId: civil.authority })).toThrow(/OWNER_AUTHORITY_SPOOFED/);
    expect(() => recordD9ConflictGovernance(r1, observations, candidates, store, governor, { ...base, governanceId: "discipline", action: "ASSIGN_DISCIPLINE", responsibleDiscipline: "D9" })).toThrow(/DISCIPLINE_NOT_ON_CANDIDATE/);
    expect(() => recordD9ConflictGovernance(r1, observations, candidates, store, governor, { ...base, governanceId: "status", status: "CLOSED" })).toThrow(/STATUS_SPOOFED/);
    expect(() => recordD9ConflictGovernance(r1, observations, candidates, store, governor, { ...base, governanceId: "severity", action: "ESCALATE", escalationReason: "Inspect the tokens.", escalationRecipient: "human-recipient-1", requiredAction: "Inspect the cited revisions.", severityContext: "ESCALATION" })).toThrow(/SEVERITY_SPOOFED/);
    expect(() => recordD9ConflictGovernance(r1, observations, candidates, store, governor, { ...base, governanceId: "disp", action: "DISPOSE", disposition: "APPROVED" })).toThrow(/DISPOSITION_SPOOFED/);
    expect(() => recordD9ConflictGovernance(r1, observations, candidates, store, { ...governor, tenantId: "tenant-b" }, { ...base, governanceId: "cross" })).toThrow(/SCOPE_REQUIRED|CROSS_SCOPE_REJECTED/);
    expect(() => recordD9ConflictGovernance(r1, observations, candidates, store, { ...governor, actorKind: "ai" }, { ...base, governanceId: "ai", action: "CONFIRM", confirmationBasis: "x" })).toThrow(/AI_NOT_D9_AUTHORITY/);
    expect(() => recordD9ConflictGovernance(r1, observations, candidates, store, { ...governor, authority: "ADMIN" }, { ...base, governanceId: "admin" })).toThrow(/ADMIN_CANNOT_OVERRIDE/);
    const suggestion = aiSuggestD9Escalation({ reason: "A non-authoritative suggestion only." });
    expect(suggestion.aiSuggested).toBe(true);
    expect(suggestion.authoritative || suggestion.confirmedConflict).toBe(false);
    expect(() => aiSuggestD9Escalation({ reason: "no", confirm: true })).toThrow(/CONFLICT_CONFIRMATION_REJECTED/);
    expect(() => repointD9ConflictGovernance()).toThrow(/AUTO_REPOINT_REJECTED/);
    expect(() => reconfirmD9ConflictGovernance()).toThrow(/AUTO_RECONFIRM_REJECTED/);
    expect(() => resolveD9ConflictGovernance()).toThrow(/CONFLICT_RESOLUTION_REJECTED/);
    expect(() => recommendFromD9Governance()).toThrow(/RECOMMENDATION_REJECTED/);
    expect(() => decideFromD9Governance()).toThrow(/DECISION_REJECTED/);
    expect(() => approveD9Governance()).toThrow(/VALIDATION_REJECTED/);
    expect(() => closeD9ConflictFromSourceChange()).toThrow(/AUTO_CLOSE_REJECTED/);
    expect(() => mutateD9GovernanceSource()).toThrow(/SOURCE_MUTATION_REJECTED/);
    expect(() => designFromD9Governance()).toThrow(/DESIGN_REJECTED/);
    recordD9SourceContractEntry(r1, reader, entry({ entryId: "entry-civil-2", exactRevision: "rev-civil-9", currentness: "CURRENT" }));
    expect(review.sourceA.exactRevision).toBe("rev-civil-1");
    expect(confirmed.candidateFingerprint).toBe(candidate.fingerprint);
    expect(candidate.confirmedConflict).toBe(false);
    expect(store.records).toHaveLength(7);
  });
});
