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
import {
  D9_R2_RECORDER_AUTHORITY,
  createD9R2Store,
  recordD9CrossDisciplineObservation,
  type D9R2ObservationInput,
} from "./cross-discipline-observation";
import {
  ADMIN_CAN_CONFIRM_ENGINEERING_CONFLICT_WITHOUT_AUTHORITY,
  ADMIN_CAN_PROMOTE_CONFLICT_CANDIDATE_TO_APPROVAL,
  ADMIN_EQUALS_D9_ENGINEERING_AUTHORITY,
  AI_CAN_CONFIRM_ENGINEERING_CONFLICT,
  AI_CAN_PROMOTE_CONFLICT_CANDIDATE_TO_ENGINEERING_FACT,
  AI_CAN_PROPOSE_D9_CONFLICT_CANDIDATE,
  AI_EQUALS_D9_ENGINEERING_AUTHORITY,
  AI_PROPOSED_CONFLICT_CANDIDATE_EQUALS_CONFIRMED_CONFLICT,
  CANDIDATE_SEVERITY_EQUALS_APPROVED_ENGINEERING_PRIORITY,
  CANDIDATE_SEVERITY_EQUALS_ESCALATION,
  CROSS_TENANT_D9_R3_ACCESS_ALLOWED,
  CURRENT_CONFLICT_CANDIDATE_EQUALS_CONFIRMED_CONFLICT,
  D9_APPROVAL_RUNTIME_COUNT,
  D9_AUTO_VALIDATES_D1_STRUCTURAL,
  D9_AUTOMATIC_CONFLICT_RESOLUTION_RUNTIME_COUNT,
  D9_AUTOMATIC_ENGINEERING_DESIGN_RUNTIME_COUNT,
  D9_AUTOMATIC_ENGINEERING_REDESIGN_RUNTIME_COUNT,
  D9_CANONICAL_MILESTONE_COUNT,
  D9_CANONICAL_PHASE_LIST,
  D9_CERTIFICATION_RUNTIME_COUNT,
  D9_CONFLICT_CANDIDATE_DETECTION_RUNTIME_IMPLEMENTED,
  D9_CONFLICT_CANDIDATE_DETECTION_RUNTIME_READY,
  D9_CONFLICT_CANDIDATE_EQUALS_CONFIRMED_ENGINEERING_CONFLICT,
  D9_CONFLICT_CANDIDATE_EQUALS_ENGINEERING_FACT,
  D9_CONFLICT_CANDIDATE_RECORD_IMPLEMENTED,
  D9_CONFLICT_CLASSES,
  D9_CONFLICT_DETECTION_RUNTIME_COUNT,
  D9_CONFLICT_GOVERNANCE_ESCALATION_RUNTIME_COUNT,
  D9_CONFLICT_RESOLUTION_RUNTIME_COUNT,
  D9_CONFORMANCE_DETERMINATION_RUNTIME_COUNT,
  D9_CROSS_DISCIPLINE_OBSERVATION_RUNTIME_COUNT,
  D9_CROSS_DISCIPLINE_OBSERVATION_RUNTIME_READY,
  D9_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT,
  D9_ENGINEERING_DECISION_RUNTIME_COUNT,
  D9_ENGINEERING_OPTIMIZATION_RUNTIME_COUNT,
  D9_EQUALS_D1_STRUCTURAL_AUTHORITY,
  D9_EQUALS_D8_IAC_AUTHORITY,
  D9_R3_ARCHITECTURE_DETECTION_REMAINS_ZERO,
  D9_R3_AUTO_MUTATES_D1_STRUCTURAL,
  D9_R3_AUTO_MUTATES_D8_IAC,
  D9_R3_BLOCKER,
  D9_R3_CAN_SILENTLY_DROP_SOURCE_LIMITATIONS,
  D9_R3_CANDIDATE_REQUIRES_EXACT_SOURCE_REVISIONS,
  D9_R3_CANDIDATE_SEVERITY_CONTEXT_SUPPORTED,
  D9_R3_CANDIDATE_UNCERTAINTY_EXPLICIT,
  D9_R3_CANONICAL_NEXT_PHASE,
  D9_R3_CANONICAL_NEXT_PHASE_SCOPE,
  D9_R3_COMPARISON_EQUALS_ENGINEERING_CALCULATION,
  D9_R3_CONFIRMS_ENGINEERING_CONFLICT,
  D9_R3_CREATES_ENGINEERING_ESCALATION,
  D9_R3_DETECTION_BASIS_TRACEABLE,
  D9_R3_DETECTION_EQUALS_ENGINEERING_VALIDATION,
  D9_R3_DETECTION_RULE_TRACEABLE,
  D9_R3_DETECTION_VERSION,
  D9_R3_DUPLICATE_GOVERNANCE_IMPLEMENTED,
  D9_R3_EXACT_OBSERVATION_REVISION_REQUIRED,
  D9_R3_EXACT_SOURCE_REVISION_REQUIRED,
  D9_R3_FLOATING_SOURCE_REFERENCE_ALLOWED,
  D9_R3_GENERATES_ENGINEERING_RECOMMENDATION,
  D9_R3_HISTORICAL_REFERENCE_AUTO_REPOINTED,
  D9_R3_INFERS_AUTHORITATIVE_RELATIONSHIP_FROM_NAME,
  D9_R3_INFERS_MISSING_ENGINEERING_VALUE,
  D9_R3_LIMITATIONS_EXPLICIT,
  D9_R3_MACHINE_READABLE_ROADMAP_UPDATED,
  D9_R3_MAKES_ENGINEERING_DECISION,
  D9_R3_MATURITY,
  D9_R3_OBSERVATION_AUTO_REPOINTED,
  D9_R3_OBSERVATION_CHANGE_AUTO_RECOMPUTES_CANDIDATE,
  D9_R3_OBSERVATION_CHANGE_AUTO_REPOINTS_CANDIDATE,
  D9_R3_PERFORMS_AUTOMATIC_ENGINEERING_DESIGN,
  D9_R3_PERFORMS_AUTOMATIC_ENGINEERING_REDESIGN,
  D9_R3_PERFORMS_CONFLICT_RESOLUTION,
  D9_R3_PRESERVES_CLOSED_TRACKS,
  D9_R3_PRESERVES_D1_INCOMPLETE_STATUS,
  D9_R3_PRESERVES_SOURCE_DISCIPLINE,
  D9_R3_PRESERVES_SOURCE_IDENTITY,
  D9_R3_PRESERVES_SOURCE_OBJECT_TYPE,
  D9_R3_PROVENANCE_PRESERVED,
  D9_R3_R2_RUNTIME_REMAINS_TWO,
  D9_R3_RECORDER_AUTHORITY,
  D9_R3_REPLAY_PROTECTION_IMPLEMENTED,
  D9_R3_REUSES_CANONICAL_CONFLICT_TAXONOMY,
  D9_R3_SOURCE_AUTO_REPOINTED,
  D9_R3_SOURCE_BASIS_TRACEABLE,
  D9_R3_SOURCE_CHANGE_AUTO_CONFIRMS_CANDIDATE,
  D9_R3_SOURCE_CHANGE_AUTO_RECOMPUTES_CANDIDATE,
  D9_R3_SOURCE_CHANGE_AUTO_REPOINTS_CANDIDATE,
  D9_R3_SOURCE_LIMITATIONS_PRESERVED,
  D9_R3_SOURCE_UNITS_PRESERVED,
  D9_R3_SOURCE_VALUES_PRESERVED,
  D9_R3_SPOOFING_PROTECTION_IMPLEMENTED,
  D9_R3_STATUS,
  D9_R3_UNGOVERNED_UNIT_CONVERSION_ALLOWED,
  D9_R3_USES_R1_SOURCE_REVISION_MANIFEST,
  D9_R3_USES_R2_OBSERVATIONS,
  D9_R4_STARTED,
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
  EOS_ALL_DISCIPLINES_COMPLETE,
  EOS_GA_READY,
  FINGERPRINT_MATCH_EQUALS_CONFIRMED_CONFLICT,
  HIGH_CONFIDENCE_CONFLICT_CANDIDATE_EQUALS_CONFIRMED_CONFLICT,
  LOW_UNCERTAINTY_EQUALS_ENGINEERING_VALIDATED,
  PARALLEL_D9_CONFLICT_TAXONOMY_CREATED,
  PARALLEL_D9_CURRENTNESS_ENGINE_CREATED,
  PARALLEL_D9_DIGITAL_THREAD_CREATED,
  SECOND_D9_FINGERPRINT_ALGORITHM_CREATED,
  STALE_CONFLICT_CANDIDATE_EQUALS_FALSE,
  SUPERSEDED_CONFLICT_CANDIDATE_EQUALS_INVALID,
  TENANT_WORKSPACE_PROJECT_D9_R3_SCOPE_ENFORCED,
  aiProposeD9ConflictCandidate,
  confirmD9ConflictCandidate,
  convertD9ConflictCandidateUnits,
  createD9R3Store,
  decideFromD9ConflictCandidate,
  designFromD9ConflictCandidate,
  escalateD9ConflictCandidate,
  inferAuthoritativeRelationshipFromName,
  mutateD9ConflictCandidateSource,
  recomputeD9ConflictCandidate,
  recordD9ConflictCandidate,
  recommendFromD9ConflictCandidate,
  repointD9ConflictCandidate,
  resolveD9ConflictCandidate,
  type D9R3CandidateInput,
} from "./conflict-candidate-detection";
import { D9_R1_D1_STANDING_LIMITATION, D9_R1_RECORDER_AUTHORITY, createD9R1Store, recordD1IncompletePosture, recordD9SourceContractEntry, type D9R1SourceEntryInput } from "./source-contract-read-model";
import { describe, expect, it } from "vitest";

const here = dirname(fileURLToPath(import.meta.url));
const reader = { actorId: "reader-1", authority: D9_R1_RECORDER_AUTHORITY, tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a" };
const observer = { actorId: "observer-1", authority: D9_R2_RECORDER_AUTHORITY, tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a" };
const recorder = { actorId: "recorder-1", authority: D9_R3_RECORDER_AUTHORITY, tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a" };

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
    relationships: [
      { relationshipId: "rel-1", sourceEndpointId: "civil-object-1", sourceRevision: "rev-civil-1", targetEndpointId: "process-object-1", targetRevision: "rev-process-1" },
      { relationshipId: "rel-mismatch", sourceEndpointId: "civil-object-1", sourceRevision: "rev-civil-0", targetEndpointId: "process-object-1", targetRevision: "rev-process-1" },
    ],
    sourceValues: [{ quantityId: "pad-level", valueText: "12.5", unitText: "m" }],
    ...overrides,
  };
}

describe("EOS-D9-R3 conflict candidate detection", () => {
  it("adds one candidate-detection runtime over exact R1 revisions and R2 observations", () => {
    expect(D9_R3_STATUS).toBe("CONFLICT_CANDIDATE_DETECTION_IMPLEMENTED");
    expect(D9_R3_MATURITY).toBe(D9_R3_STATUS);
    expect(D9_CONFLICT_CANDIDATE_DETECTION_RUNTIME_IMPLEMENTED && D9_CONFLICT_CANDIDATE_DETECTION_RUNTIME_READY && D9_CONFLICT_CANDIDATE_RECORD_IMPLEMENTED).toBe(true);
    expect(D9_CONFLICT_DETECTION_RUNTIME_COUNT).toBe(1);
    expect(D9_RUNTIME_STARTED).toBe(true);
    expect(D9_RUNTIME_COUNT).toBe(3);
    expect(D9_R3_R2_RUNTIME_REMAINS_TWO && D9_R3_ARCHITECTURE_DETECTION_REMAINS_ZERO).toBe(true);
    expect(D9_SOURCE_CONTRACT_READ_MODEL_RUNTIME_COUNT).toBe(1);
    expect(D9_SOURCE_CONTRACT_READ_MODEL_RUNTIME_READY).toBe(true);
    expect(D9_CROSS_DISCIPLINE_OBSERVATION_RUNTIME_COUNT).toBe(1);
    expect(D9_CROSS_DISCIPLINE_OBSERVATION_RUNTIME_READY).toBe(true);
    expect(D9_CANONICAL_MILESTONE_COUNT).toBe(9);
    expect(D9_CANONICAL_PHASE_LIST[3]).toBe("EOS-D9-R3-CONFLICT-CANDIDATE-DETECTION");
    expect(D9_CANONICAL_PHASE_LIST[4]).toBe("EOS-D9-R4-CONFLICT-GOVERNANCE-AND-ESCALATION");
    expect(D9_CANONICAL_PHASE_LIST).toHaveLength(9);
    expect(D9_R3_USES_R1_SOURCE_REVISION_MANIFEST && D9_R3_USES_R2_OBSERVATIONS && D9_R3_EXACT_SOURCE_REVISION_REQUIRED && D9_R3_EXACT_OBSERVATION_REVISION_REQUIRED && D9_R3_CANDIDATE_REQUIRES_EXACT_SOURCE_REVISIONS).toBe(true);
    expect(D9_R3_FLOATING_SOURCE_REFERENCE_ALLOWED || D9_R3_SOURCE_AUTO_REPOINTED || D9_R3_OBSERVATION_AUTO_REPOINTED || D9_TREATS_D1_STRUCTURAL_AS_COMPLETE || D1_STRUCTURAL_PACK_COMPLETE).toBe(false);
    expect(D9_R3_PRESERVES_D1_INCOMPLETE_STATUS && D9_R3_PRESERVES_SOURCE_DISCIPLINE && D9_R3_PRESERVES_SOURCE_IDENTITY && D9_R3_PRESERVES_SOURCE_OBJECT_TYPE).toBe(true);
    expect(D9_R3_REUSES_CANONICAL_CONFLICT_TAXONOMY).toBe(true);
    expect(PARALLEL_D9_CONFLICT_TAXONOMY_CREATED).toBe(false);
    expect(D9_CONFLICT_CLASSES).toContain("CURRENTNESS_MISMATCH");
    expect(D9_CONFLICT_CLASSES).toContain("SOURCE_REVISION_MISMATCH");
    expect(D9_CONFLICT_CANDIDATE_EQUALS_CONFIRMED_ENGINEERING_CONFLICT || D9_CONFLICT_CANDIDATE_EQUALS_ENGINEERING_FACT || D9_R3_CONFIRMS_ENGINEERING_CONFLICT || AI_CAN_CONFIRM_ENGINEERING_CONFLICT || ADMIN_CAN_CONFIRM_ENGINEERING_CONFLICT_WITHOUT_AUTHORITY).toBe(false);
    expect(AI_CAN_PROPOSE_D9_CONFLICT_CANDIDATE).toBe(true);
    expect(AI_PROPOSED_CONFLICT_CANDIDATE_EQUALS_CONFIRMED_CONFLICT).toBe(false);
    expect(D9_R3_PERFORMS_CONFLICT_RESOLUTION || D9_R3_CREATES_ENGINEERING_ESCALATION || D9_R3_GENERATES_ENGINEERING_RECOMMENDATION || D9_R3_MAKES_ENGINEERING_DECISION || D9_R3_PERFORMS_AUTOMATIC_ENGINEERING_DESIGN || D9_R3_PERFORMS_AUTOMATIC_ENGINEERING_REDESIGN).toBe(false);
    expect([D9_CONFLICT_RESOLUTION_RUNTIME_COUNT, D9_AUTOMATIC_CONFLICT_RESOLUTION_RUNTIME_COUNT, D9_CONFLICT_GOVERNANCE_ESCALATION_RUNTIME_COUNT, D9_RECOMMENDATION_RUNTIME_COUNT, D9_ENGINEERING_DECISION_RUNTIME_COUNT, D9_CONFORMANCE_DETERMINATION_RUNTIME_COUNT, D9_APPROVAL_RUNTIME_COUNT, D9_CERTIFICATION_RUNTIME_COUNT, D9_AUTOMATIC_ENGINEERING_DESIGN_RUNTIME_COUNT, D9_AUTOMATIC_ENGINEERING_REDESIGN_RUNTIME_COUNT, D9_ENGINEERING_OPTIMIZATION_RUNTIME_COUNT, D9_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT, D9_REVIEW_VALIDATION_RUNTIME_COUNT]).toEqual(Array(13).fill(0));
    expect(D9_R3_DETECTION_BASIS_TRACEABLE && D9_R3_DETECTION_RULE_TRACEABLE && D9_R3_SOURCE_BASIS_TRACEABLE && D9_R3_PROVENANCE_PRESERVED && D9_R3_LIMITATIONS_EXPLICIT && D9_R3_SOURCE_LIMITATIONS_PRESERVED && D9_R3_CANDIDATE_UNCERTAINTY_EXPLICIT && D9_R3_CANDIDATE_SEVERITY_CONTEXT_SUPPORTED).toBe(true);
    expect(D9_R3_CAN_SILENTLY_DROP_SOURCE_LIMITATIONS || HIGH_CONFIDENCE_CONFLICT_CANDIDATE_EQUALS_CONFIRMED_CONFLICT || LOW_UNCERTAINTY_EQUALS_ENGINEERING_VALIDATED || CANDIDATE_SEVERITY_EQUALS_ESCALATION || CANDIDATE_SEVERITY_EQUALS_APPROVED_ENGINEERING_PRIORITY).toBe(false);
    expect(CURRENT_CONFLICT_CANDIDATE_EQUALS_CONFIRMED_CONFLICT || STALE_CONFLICT_CANDIDATE_EQUALS_FALSE || SUPERSEDED_CONFLICT_CANDIDATE_EQUALS_INVALID || D9_R3_SOURCE_CHANGE_AUTO_REPOINTS_CANDIDATE || D9_R3_SOURCE_CHANGE_AUTO_RECOMPUTES_CANDIDATE || D9_R3_SOURCE_CHANGE_AUTO_CONFIRMS_CANDIDATE).toBe(false);
    expect(D9_R3_OBSERVATION_CHANGE_AUTO_REPOINTS_CANDIDATE || D9_R3_OBSERVATION_CHANGE_AUTO_RECOMPUTES_CANDIDATE || D9_R3_HISTORICAL_REFERENCE_AUTO_REPOINTED || FINGERPRINT_MATCH_EQUALS_CONFIRMED_CONFLICT).toBe(false);
    expect(D9_REUSES_CANONICAL_CURRENTNESS && D9_REUSES_CANONICAL_DIGITAL_THREAD && D9_REUSES_CANONICAL_FINGERPRINT && D9_R3_SOURCE_UNITS_PRESERVED && D9_R3_SOURCE_VALUES_PRESERVED).toBe(true);
    expect(PARALLEL_D9_CURRENTNESS_ENGINE_CREATED || PARALLEL_D9_DIGITAL_THREAD_CREATED || SECOND_D9_FINGERPRINT_ALGORITHM_CREATED || D9_R3_COMPARISON_EQUALS_ENGINEERING_CALCULATION || D9_R3_DETECTION_EQUALS_ENGINEERING_VALIDATION || D9_R3_UNGOVERNED_UNIT_CONVERSION_ALLOWED || D9_R3_INFERS_MISSING_ENGINEERING_VALUE || D9_R3_INFERS_AUTHORITATIVE_RELATIONSHIP_FROM_NAME).toBe(false);
    expect(D9_EQUALS_D1_STRUCTURAL_AUTHORITY || D9_EQUALS_D8_IAC_AUTHORITY || AI_EQUALS_D9_ENGINEERING_AUTHORITY || ADMIN_EQUALS_D9_ENGINEERING_AUTHORITY || AI_CAN_PROMOTE_CONFLICT_CANDIDATE_TO_ENGINEERING_FACT || ADMIN_CAN_PROMOTE_CONFLICT_CANDIDATE_TO_APPROVAL).toBe(false);
    expect(D9_AUTO_VALIDATES_D1_STRUCTURAL || D9_R3_AUTO_MUTATES_D1_STRUCTURAL || D9_R3_AUTO_MUTATES_D8_IAC).toBe(false);
    expect(TENANT_WORKSPACE_PROJECT_D9_R3_SCOPE_ENFORCED).toBe(true);
    expect(CROSS_TENANT_D9_R3_ACCESS_ALLOWED).toBe(false);
    expect(D9_R3_DUPLICATE_GOVERNANCE_IMPLEMENTED && D9_R3_REPLAY_PROTECTION_IMPLEMENTED && D9_R3_SPOOFING_PROTECTION_IMPLEMENTED && D9_R3_PRESERVES_CLOSED_TRACKS).toBe(true);
    expect(D9_R4_STARTED).toBe(false);
    expect(D9_R3_CANONICAL_NEXT_PHASE).toBe("EOS-D9-R4-CONFLICT-GOVERNANCE-AND-ESCALATION");
    expect(D9_R3_CANONICAL_NEXT_PHASE_SCOPE).toContain("conflict candidate is not a confirmed engineering conflict");
    expect(D1N_REOPENED || D2_REOPENED || D3_REOPENED || D4_REOPENED || D5_REOPENED || D6_REOPENED || D7_REOPENED || D8_REOPENED).toBe(false);
    expect(D2_TRACK_COMPLETE && D3_TRACK_COMPLETE && D4_TRACK_COMPLETE && D5_TRACK_COMPLETE && D6_TRACK_COMPLETE && D7_TRACK_COMPLETE && D8_TRACK_COMPLETE).toBe(true);
    expect(D6_STATUS).toBe("COMPLETE_BOUNDED_WITH_LIMITATIONS");
    expect(D7_STATUS).toBe("COMPLETE_BOUNDED_WITH_LIMITATIONS");
    expect(D8_STATUS).toBe("COMPLETE_BOUNDED_WITH_LIMITATIONS");
    expect(EOS_ALL_DISCIPLINES_COMPLETE || EOS_GA_READY).toBe(false);
    expect(D9_R3_MACHINE_READABLE_ROADMAP_UPDATED).toBe(true);
    expect(D9_R3_BLOCKER).toBe("NONE");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D9.R3.CONFLICT_CANDIDATE_DETECTION")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D9.R4.CONFLICT_GOVERNANCE_AND_ESCALATION")?.implementationState).toBe("NOT_IMPLEMENTED");
    const sourceText = readFileSync(join(here, "conflict-candidate-detection.ts"), "utf8");
    expect(sourceText).not.toMatch(/createHash|from ["']@rtb\/engineering-review["']|CREATE TABLE|eval\(|child_process|new Function/);
    expect(scanAnalysisFormulaBypass(join(here, "conflict-candidate-detection.ts"), sourceText)).toEqual([]);
  });

  it("detects a provisional candidate without confirming, resolving, or repointing it", () => {
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
      relationships: [],
      sourceValues: [{ quantityId: "flow", valueText: "10", unitText: "m3/h" }],
    }));
    recordD1IncompletePosture(r1, reader);
    const observations = createD9R2Store(r1);
    const sharedLimitations = `survey control not closed; composition not validated; ${D9_R1_D1_STANDING_LIMITATION}`;
    const difference: D9R2ObservationInput = {
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
    };
    const observed = recordD9CrossDisciplineObservation(r1, observations, observer, difference);
    const aligned = recordD9CrossDisciplineObservation(r1, observations, observer, {
      ...difference,
      observationId: "obs-aligned",
      observationType: "EXPLICIT_RELATIONSHIP",
      relationshipId: "rel-1",
      observedStatement: "Civil revision rel-1 names Process revision rev-process-1.",
    });
    const mismatched = recordD9CrossDisciplineObservation(r1, observations, observer, {
      ...difference,
      observationId: "obs-mismatch",
      observationType: "EXPLICIT_RELATIONSHIP",
      relationshipId: "rel-mismatch",
      observedStatement: "Civil revision rel-mismatch names an earlier civil revision.",
    });
    const entriesBefore = JSON.stringify(r1.entries);
    const r1History = r1.history.length;
    const observationsBefore = JSON.stringify(observations.observations);
    const observationHistory = observations.history.length;
    const store = createD9R3Store(r1, observations);
    const input: D9R3CandidateInput = {
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
      aiAssisted: true,
      semanticSimilarity: true,
    };
    const candidate = recordD9ConflictCandidate(r1, observations, store, recorder, input);
    expect(JSON.stringify(r1.entries)).toBe(entriesBefore);
    expect(r1.history).toHaveLength(r1History);
    expect(JSON.stringify(observations.observations)).toBe(observationsBefore);
    expect(observations.history).toHaveLength(observationHistory);
    expect(candidate.conflictClass).toBe("CURRENTNESS_MISMATCH");
    expect(candidate.detectionRuleId).toBe("EXPLICIT_DIFFERENCE_CURRENTNESS_STATE");
    expect(candidate.detectionVersion).toBe(D9_R3_DETECTION_VERSION);
    expect(candidate.confirmedConflict || candidate.engineeringFact || candidate.escalation || candidate.recommendation || candidate.engineeringDecision || candidate.approved || candidate.validated || candidate.resolved || candidate.authoritative).toBe(false);
    expect(candidate.aiProposed).toBe(true);
    expect(candidate.similaritySignalAuthoritative).toBe(false);
    expect(candidate.confidenceEqualsConfirmedConflict).toBe(false);
    expect(candidate.severityEqualsEscalation || candidate.severityEqualsApprovedPriority).toBe(false);
    expect(candidate.sourceA.exactRevision).toBe("rev-civil-1");
    expect(candidate.sourceA.objectType).toBe("CIVIL_SURFACE");
    expect(candidate.sourceA.sourceDiscipline).toBe("D2_CIVIL");
    expect(candidate.sourceA.sourceValues[0]?.unitText).toBe("m");
    expect(candidate.sourceA.sourceValues[0]?.valueText).toBe("12.5");
    expect(candidate.sourceB.sourceValues[0]?.unitText).toBe("m3/h");
    expect(candidate.sourceB.sourceValues[0]?.valueText).toBe("10");
    expect(candidate.observationFingerprint).toBe(observed.fingerprint);
    expect(candidate.d1PackComplete).toBe(false);
    expect(candidate.d1Limitations).toContain("incomplete");
    expect(candidate.citedCurrentness).toBe("STALE");
    expect(candidate.sourceBCurrentness).toBe("CURRENT");
    expect(candidate.threadLinks.map((link) => link.kind)).toEqual(["SOURCE", "SOURCE", "OBSERVATION"]);
    expect(recordD9ConflictCandidate(r1, observations, store, recorder, input)).toBe(candidate);
    expect(store.history).toHaveLength(1);
    const revisionCandidate = recordD9ConflictCandidate(r1, observations, store, recorder, {
      ...input,
      candidateId: "cand-2",
      detectionRuleId: "EXPLICIT_RELATIONSHIP_REVISION_BINDING",
      observationId: mismatched.observationId,
      observationFingerprint: mismatched.fingerprint,
      detectedInconsistency: "Rule EXPLICIT_RELATIONSHIP_REVISION_BINDING sees civil-contract-1 revision text and process-contract-1 revision text differ from the cited relationship.",
      provenanceRef: `civil-contract-1 process-contract-1 ${mismatched.observationId} EXPLICIT_RELATIONSHIP_REVISION_BINDING ${D9_R3_DETECTION_VERSION}`,
      aiAssisted: false,
      semanticSimilarity: false,
    });
    expect(revisionCandidate.conflictClass).toBe("SOURCE_REVISION_MISMATCH");
    expect(revisionCandidate.confirmedConflict).toBe(false);
    expect(revisionCandidate.sourceA.exactRevision).toBe("rev-civil-1");
    expect(() => recordD9ConflictCandidate(r1, observations, store, recorder, {
      ...input,
      candidateId: "cand-aligned",
      detectionRuleId: "EXPLICIT_RELATIONSHIP_REVISION_BINDING",
      observationId: aligned.observationId,
      observationFingerprint: aligned.fingerprint,
      detectedInconsistency: "Rule EXPLICIT_RELATIONSHIP_REVISION_BINDING sees civil-contract-1 and process-contract-1.",
      provenanceRef: `civil-contract-1 process-contract-1 ${aligned.observationId} EXPLICIT_RELATIONSHIP_REVISION_BINDING ${D9_R3_DETECTION_VERSION}`,
    })).toThrow(/DETECTION_RULE_NOT_SATISFIED/);
    expect(() => recordD9ConflictCandidate(r1, observations, store, recorder, { ...input, candidateId: "float", sourceAExactRevision: "current" })).toThrow(/EXACT_REVISION_REQUIRED/);
    expect(() => recordD9ConflictCandidate(r1, observations, store, recorder, { ...input, candidateId: "missing", sourceAExactRevision: "rev-civil-2" })).toThrow(/EXACT_REVISION_MISMATCH/);
    expect(() => recordD9ConflictCandidate(r1, observations, store, recorder, { ...input, candidateId: "bad-obs", observationFingerprint: "deadbeef" })).toThrow(/OBSERVATION_REVISION_MISMATCH/);
    expect(() => recordD9ConflictCandidate(r1, observations, store, recorder, { ...input, candidateId: "bad-fp", sourceAFingerprint: "deadbeef" })).toThrow(/EXACT_REVISION_MISMATCH|FINGERPRINT_MISMATCH/);
    expect(() => recordD9ConflictCandidate(r1, observations, store, recorder, { ...input, candidateId: "stripped", limitations: "survey control not closed only" })).toThrow(/SOURCE_LIMITATION_NOT_PRESERVED/);
    expect(() => recordD9ConflictCandidate(r1, observations, store, recorder, { ...input, candidateId: "therefore", detectedInconsistency: "Therefore the conflict is confirmed." })).toThrow(/CONCLUSION_REJECTED/);
    expect(() => recordD9ConflictCandidate(r1, observations, store, recorder, { ...input, candidateId: "confirm", confirm: true })).toThrow(/CONFLICT_CONFIRMATION_REJECTED/);
    expect(() => recordD9ConflictCandidate(r1, observations, store, recorder, { ...input, candidateId: "resolve", resolve: true })).toThrow(/CONFLICT_RESOLUTION_REJECTED/);
    expect(() => recordD9ConflictCandidate(r1, observations, store, recorder, { ...input, candidateId: "escalate", escalate: true })).toThrow(/ESCALATION_REJECTED/);
    expect(() => recordD9ConflictCandidate(r1, observations, store, recorder, { ...input, candidateId: "recommend", recommend: true })).toThrow(/RECOMMENDATION_REJECTED/);
    expect(() => recordD9ConflictCandidate(r1, observations, store, recorder, { ...input, candidateId: "decide", decide: true })).toThrow(/DECISION_REJECTED/);
    expect(() => recordD9ConflictCandidate(r1, observations, store, recorder, { ...input, candidateId: "design", design: true })).toThrow(/DESIGN_REJECTED/);
    expect(() => recordD9ConflictCandidate(r1, observations, store, recorder, { ...input, candidateId: "units", convertUnits: true })).toThrow(/UNIT_CONVERSION_REJECTED/);
    expect(() => recordD9ConflictCandidate(r1, observations, store, recorder, { ...input, candidateId: "name", inferFromName: true })).toThrow(/INFERRED_RELATIONSHIP_REJECTED/);
    expect(() => recordD9ConflictCandidate(r1, observations, store, recorder, { ...input, candidateId: "semantic", aiAssisted: false, semanticSimilarity: true })).toThrow(/INFERRED_RELATIONSHIP_REJECTED/);
    expect(() => recordD9ConflictCandidate(r1, observations, store, recorder, { ...input, candidateId: "class", conflictClass: "INTERFACE_MISMATCH" })).toThrow(/CANDIDATE_TYPE_SPOOFED/);
    expect(() => recordD9ConflictCandidate(r1, observations, store, recorder, { ...input, candidateId: "severity", severityContext: "ESCALATION" })).toThrow(/SEVERITY_SPOOFED/);
    expect(() => recordD9ConflictCandidate(r1, observations, store, recorder, { ...input, uncertainty: `${input.uncertainty} extra` })).toThrow(/REPLAY_REJECTED/);
    expect(() => recordD9ConflictCandidate(r1, observations, store, recorder, { ...input, candidateId: "dup" })).toThrow(/DUPLICATE_CANDIDATE_REJECTED/);
    expect(() => recordD9ConflictCandidate(r1, observations, store, { ...recorder, tenantId: "tenant-b" }, { ...input, candidateId: "cross" })).toThrow(/SCOPE_REQUIRED|CROSS_SCOPE_REJECTED/);
    expect(() => recordD9ConflictCandidate(r1, observations, store, { ...recorder, actorKind: "ai" }, { ...input, candidateId: "ai" })).toThrow(/AI_NOT_D9_AUTHORITY/);
    expect(() => recordD9ConflictCandidate(r1, observations, store, { ...recorder, authority: "ADMIN" }, { ...input, candidateId: "admin" })).toThrow(/ADMIN_CANNOT_OVERRIDE/);
    const proposal = aiProposeD9ConflictCandidate({ uncertainty: "A non-authoritative proposal only." });
    expect(proposal.aiProposed).toBe(true);
    expect(proposal.confirmedConflict || proposal.authoritative).toBe(false);
    expect(() => aiProposeD9ConflictCandidate({ uncertainty: "no", confirm: true })).toThrow(/CONFLICT_CONFIRMATION_REJECTED/);
    expect(() => repointD9ConflictCandidate()).toThrow(/AUTO_REPOINT_REJECTED/);
    expect(() => recomputeD9ConflictCandidate()).toThrow(/AUTO_RECOMPUTE_REJECTED/);
    expect(() => confirmD9ConflictCandidate()).toThrow(/CONFLICT_CONFIRMATION_REJECTED/);
    expect(() => resolveD9ConflictCandidate()).toThrow(/CONFLICT_RESOLUTION_REJECTED/);
    expect(() => escalateD9ConflictCandidate()).toThrow(/ESCALATION_REJECTED/);
    expect(() => recommendFromD9ConflictCandidate()).toThrow(/RECOMMENDATION_REJECTED/);
    expect(() => decideFromD9ConflictCandidate()).toThrow(/DECISION_REJECTED/);
    expect(() => designFromD9ConflictCandidate()).toThrow(/DESIGN_REJECTED/);
    expect(() => mutateD9ConflictCandidateSource()).toThrow(/SOURCE_MUTATION_REJECTED/);
    expect(() => convertD9ConflictCandidateUnits()).toThrow(/UNIT_CONVERSION_REJECTED/);
    expect(() => inferAuthoritativeRelationshipFromName()).toThrow(/INFERRED_RELATIONSHIP_REJECTED/);
    recordD9SourceContractEntry(r1, reader, entry({ entryId: "entry-civil-2", exactRevision: "rev-civil-9", currentness: "CURRENT" }));
    expect(candidate.sourceA.exactRevision).toBe("rev-civil-1");
    expect(candidate.observationFingerprint).toBe(observed.fingerprint);
    expect(store.candidates).toHaveLength(2);
    expect(store.history[0]?.fingerprint).toBe(candidate.fingerprint);
  });
});
