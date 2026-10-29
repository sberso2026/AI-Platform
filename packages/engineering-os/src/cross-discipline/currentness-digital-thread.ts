/**
 * EOS-D9-R6 currentness and digital thread.
 * One bounded runtime over exact D9 R1-R5 records.
 * Currentness, lineage, thread relationships, and fingerprints are not authority.
 */
import {
  D8_REOPENED,
  D9_CANONICAL_MILESTONE_COUNT,
  D9_CANONICAL_PHASE_LIST,
  D9_CURRENTNESS_STATES,
  D9_DIGITAL_THREAD_MODULE,
  D9_FINGERPRINT_ALGORITHM,
  D9_IMPLEMENTATION_PHASE_TYPES,
  D9_IMPLEMENTATION_PHASES,
  D9_REUSES_CANONICAL_CURRENTNESS as ARCHITECTURE_REUSES_CURRENTNESS,
  D9_REUSES_CANONICAL_DIGITAL_THREAD as ARCHITECTURE_REUSES_THREAD,
  D9_REUSES_CANONICAL_FINGERPRINT as ARCHITECTURE_REUSES_FINGERPRINT,
  PARALLEL_D9_CURRENTNESS_ENGINE_CREATED as ARCHITECTURE_PARALLEL_CURRENTNESS,
  PARALLEL_D9_DIGITAL_THREAD_CREATED as ARCHITECTURE_PARALLEL_THREAD,
} from "@rtb/types";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import {
  D1_STRUCTURAL_PACK_COMPLETE,
  D6_STATUS,
  D7_STATUS,
  D8_STATUS,
  D8_TRACK_COMPLETE,
} from "../instrumentation-control/instrumentation-control-bounded-closeout";
import { type D9R3Store } from "./conflict-candidate-detection";
import { type D9R4Store } from "./conflict-governance-escalation";
import { type D9R2Store } from "./cross-discipline-observation";
import {
  D9_CONFLICT_CANDIDATE_DETECTION_RUNTIME_READY,
  D9_CONFLICT_DETECTION_RUNTIME_COUNT,
  D9_CONFLICT_GOVERNANCE_ESCALATION_RUNTIME_COUNT,
  D9_CONFLICT_GOVERNANCE_ESCALATION_RUNTIME_READY,
  D9_CROSS_DISCIPLINE_OBSERVATION_RUNTIME_COUNT,
  D9_CROSS_DISCIPLINE_OBSERVATION_RUNTIME_READY,
  D9_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT as R5_THREAD_COUNT,
  D9_R6_CANONICAL_PHASE,
  D9_R6_PHASE_TYPE,
  D9_R6_STARTED,
  D9_RECOMMENDATION_RUNTIME_COUNT,
  D9_RECOMMENDATION_SUPPORT_RUNTIME_READY,
  D9_REVIEW_VALIDATION_RUNTIME_COUNT as R5_REVIEW_COUNT,
  D9_RUNTIME_COUNT as R5_RUNTIME_COUNT,
  D9_SOURCE_CONTRACT_READ_MODEL_RUNTIME_COUNT,
  D9_SOURCE_CONTRACT_READ_MODEL_RUNTIME_READY,
  type D9R5Store,
} from "./recommendation-support";
import {
  D9_R1_D1_STANDING_LIMITATION,
  buildD9SourceManifest,
  type D9R1Actor,
  type D9R1SourceEntry,
  type D9R1Store,
} from "./source-contract-read-model";

export const D9_R6_STATUS = "CURRENTNESS_AND_DIGITAL_THREAD_IMPLEMENTED" as const;
export const D9_R6_MATURITY = D9_R6_STATUS;
export const D9_R6_MATURITY_STATE = D9_R6_STATUS;
export const D9_R6_CLOSEOUT_PATH = "docs/architecture/engineering-os/EOS_D9_R6_CURRENTNESS_AND_DIGITAL_THREAD_CLOSEOUT.md" as const;
export const D9_R6_PHASE = D9_R6_CANONICAL_PHASE;
export const D9_CURRENTNESS_DIGITAL_THREAD_RUNTIME_IMPLEMENTED = true as const;
export const D9_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT = 1 as const;
export const D9_CURRENTNESS_DIGITAL_THREAD_RUNTIME_READY = true as const;
export const D9_RUNTIME_STARTED = true as const;
export const D9_RUNTIME_COUNT = 6 as const;
export const D9_R6_R5_RUNTIME_REMAINS_FIVE = R5_RUNTIME_COUNT === 5 && R5_THREAD_COUNT === 0 && D9_R6_STARTED === false && D9_RECOMMENDATION_RUNTIME_COUNT === 1 && D9_RECOMMENDATION_SUPPORT_RUNTIME_READY === true && D9_CONFLICT_GOVERNANCE_ESCALATION_RUNTIME_COUNT === 1 && D9_CONFLICT_GOVERNANCE_ESCALATION_RUNTIME_READY === true && D9_CONFLICT_DETECTION_RUNTIME_COUNT === 1 && D9_CONFLICT_CANDIDATE_DETECTION_RUNTIME_READY === true && D9_CROSS_DISCIPLINE_OBSERVATION_RUNTIME_COUNT === 1 && D9_CROSS_DISCIPLINE_OBSERVATION_RUNTIME_READY === true && D9_SOURCE_CONTRACT_READ_MODEL_RUNTIME_COUNT === 1 && D9_SOURCE_CONTRACT_READ_MODEL_RUNTIME_READY === true && R5_REVIEW_COUNT === 0;
export const D9_R6_ARCHITECTURE_CURRENTNESS_REUSED = ARCHITECTURE_REUSES_CURRENTNESS === true && ARCHITECTURE_PARALLEL_CURRENTNESS === false && ARCHITECTURE_REUSES_THREAD === true && ARCHITECTURE_PARALLEL_THREAD === false && ARCHITECTURE_REUSES_FINGERPRINT === true;
export { D9_CONFLICT_CANDIDATE_DETECTION_RUNTIME_READY, D9_CONFLICT_DETECTION_RUNTIME_COUNT, D9_CONFLICT_GOVERNANCE_ESCALATION_RUNTIME_COUNT, D9_CONFLICT_GOVERNANCE_ESCALATION_RUNTIME_READY, D9_CROSS_DISCIPLINE_OBSERVATION_RUNTIME_COUNT, D9_CROSS_DISCIPLINE_OBSERVATION_RUNTIME_READY, D9_RECOMMENDATION_RUNTIME_COUNT, D9_RECOMMENDATION_SUPPORT_RUNTIME_READY, D9_SOURCE_CONTRACT_READ_MODEL_RUNTIME_COUNT, D9_SOURCE_CONTRACT_READ_MODEL_RUNTIME_READY };
export const D9_REUSES_CANONICAL_CURRENTNESS = true as const;
export const PARALLEL_D9_CURRENTNESS_ENGINE_CREATED = false as const;
export const D9_R6_SOURCE_MANIFEST_CURRENTNESS_INTEGRATED = true as const;
export const D9_R6_EXACT_SOURCE_REVISION_REQUIRED = true as const;
export const D9_R6_FLOATING_SOURCE_REFERENCE_ALLOWED = false as const;
export const D9_R6_OBSERVATION_CURRENTNESS_INTEGRATED = true as const;
export const D9_R6_CONFLICT_CANDIDATE_CURRENTNESS_INTEGRATED = true as const;
export const D9_R6_CONFLICT_GOVERNANCE_CURRENTNESS_INTEGRATED = true as const;
export const D9_R6_RECOMMENDATION_CURRENTNESS_INTEGRATED = true as const;
export const CURRENT_EQUALS_VALIDATED = false as const;
export const STALE_EQUALS_INVALID = false as const;
export const SUPERSEDED_EQUALS_INVALID = false as const;
export const CURRENT_SOURCE_RECORD_EQUALS_ENGINEERING_VALIDATED = false as const;
export const STALE_SOURCE_RECORD_EQUALS_ENGINEERING_INVALID = false as const;
export const CURRENT_OBSERVATION_EQUALS_VALIDATED = false as const;
export const STALE_OBSERVATION_EQUALS_FALSE = false as const;
export const SUPERSEDED_OBSERVATION_EQUALS_INVALID = false as const;
export const CURRENT_CONFLICT_CANDIDATE_EQUALS_CONFIRMED_CONFLICT = false as const;
export const STALE_CONFLICT_CANDIDATE_EQUALS_FALSE = false as const;
export const SUPERSEDED_CONFLICT_CANDIDATE_EQUALS_INVALID = false as const;
export const CURRENT_CONFIRMED_CONFLICT_EQUALS_RESOLVED_CONFLICT = false as const;
export const CURRENT_ESCALATION_EQUALS_ENGINEERING_DECISION = false as const;
export const CURRENT_DISPOSITION_EQUALS_APPROVAL = false as const;
export const CURRENT_CLOSURE_EQUALS_ENGINEERING_VALIDATED = false as const;
export const CURRENT_RECOMMENDATION_EQUALS_ENGINEERING_DECISION = false as const;
export const CURRENT_RECOMMENDATION_EQUALS_APPROVAL = false as const;
export const CURRENT_RECOMMENDATION_EQUALS_CONFLICT_RESOLUTION = false as const;
export const STALE_RECOMMENDATION_EQUALS_WRONG = false as const;
export const SUPERSEDED_RECOMMENDATION_EQUALS_INVALID = false as const;
export const D9_R6_EXPLICIT_DEPENDENCIES_REQUIRED = true as const;
export const D9_R6_INFERRED_DEPENDENCIES_ALLOWED = false as const;
export const D9_R6_SOURCE_CHANGE_AUTO_REPOINTS_DEPENDENT_RECORD = false as const;
export const D9_R6_SOURCE_CHANGE_AUTO_RECOMPUTES_OBSERVATION = false as const;
export const D9_R6_SOURCE_CHANGE_AUTO_REDETECTS_CONFLICT = false as const;
export const D9_R6_SOURCE_CHANGE_AUTO_RECONFIRMS_CONFLICT = false as const;
export const D9_R6_SOURCE_CHANGE_AUTO_RESOLVES_CONFLICT = false as const;
export const D9_R6_SOURCE_CHANGE_AUTO_REGENERATES_RECOMMENDATION = false as const;
export const D9_R6_SOURCE_CHANGE_AUTO_REVALIDATES_RECORD = false as const;
export const D9_R6_CURRENTNESS_TRANSITION_BASIS_REQUIRED = true as const;
export const D9_R6_CURRENTNESS_TRANSITION_BASIS_TRACEABLE = true as const;
export const REASSESSMENT_REQUIRED_EQUALS_STALE = false as const;
export const REASSESSMENT_REQUIRED_EQUALS_VALIDATION_FAILED = false as const;
export const REASSESSMENT_COMPLETED_EQUALS_VALIDATED = false as const;
export const D9_REUSES_CANONICAL_DIGITAL_THREAD = true as const;
export const D9_R6_DIGITAL_THREAD_MODULE = D9_DIGITAL_THREAD_MODULE;
export const PARALLEL_D9_DIGITAL_THREAD_CREATED = false as const;
export const DIGITAL_THREAD_RELATIONSHIP_EQUALS_ENGINEERING_AUTHORITY = false as const;
export const DIGITAL_THREAD_RELATIONSHIP_EQUALS_REQUIREMENT_ADOPTION = false as const;
export const DIGITAL_THREAD_RELATIONSHIP_EQUALS_ENGINEERING_VALIDATION = false as const;
export const DIGITAL_THREAD_RELATIONSHIP_EQUALS_APPROVAL = false as const;
export const DIGITAL_THREAD_RELATIONSHIP_EQUALS_CONFLICT_RESOLUTION = false as const;
export const D9_EXPLICIT_LINEAGE_REQUIRED = true as const;
export const D9_INFERRED_LINEAGE_ALLOWED = false as const;
export const D9_R6_LINEAGE_INTEGRATED = true as const;
export const D9_R6_HISTORICAL_REFERENCE_AUTO_REPOINTED = false as const;
export const D9_R6_HISTORY_PRESERVED = true as const;
export const D9_REUSES_CANONICAL_FINGERPRINT = D9_FINGERPRINT_ALGORITHM === "fingerprintCanonical" && ARCHITECTURE_REUSES_FINGERPRINT === true;
export const SECOND_D9_FINGERPRINT_ALGORITHM_CREATED = false as const;
export const D9_R6_FINGERPRINT_VERIFICATION_IMPLEMENTED = true as const;
export const D9_R6_FINGERPRINT_MISMATCH_AUTO_REPAIRED = false as const;
export const D9_R6_FINGERPRINT_MISMATCH_AUTO_REBASELINED = false as const;
export const FINGERPRINT_MATCH_EQUALS_VALIDATED = false as const;
export const FINGERPRINT_MATCH_EQUALS_APPROVED = false as const;
export const FINGERPRINT_MATCH_EQUALS_CONFLICT_RESOLVED = false as const;
export const D9_R6_SOURCE_BASIS_REQUIRED = true as const;
export const D9_R6_SOURCE_BASIS_TRACEABLE = true as const;
export const D9_R6_PROVENANCE_REQUIRED = true as const;
export const D9_R6_PROVENANCE_PRESERVED = true as const;
export const D9_R6_APPLICABILITY_PRESERVED = true as const;
export const D9_R6_AUTO_PROPAGATES_OUTSIDE_APPLICABILITY = false as const;
export const D9_R6_LIMITATIONS_PRESERVED = true as const;
export const D9_R6_SOURCE_LIMITATIONS_PRESERVED = true as const;
export const D9_R6_CAN_SILENTLY_DROP_LIMITATIONS = false as const;
export const D9_R6_PRESERVES_D1_INCOMPLETE_STATUS = D1_STRUCTURAL_PACK_COMPLETE === false;
export const D9_R6_PRESERVES_D1_LIMITATIONS = true as const;
export const D9_TREATS_D1_STRUCTURAL_AS_COMPLETE = false as const;
export const D9_IGNORES_D1_STRUCTURAL_LIMITATIONS = false as const;
export const D9_EQUALS_D1_STRUCTURAL_AUTHORITY = false as const;
export const D9_EQUALS_D2_CIVIL_AUTHORITY = false as const;
export const D9_EQUALS_D3_GEOTECHNICAL_AUTHORITY = false as const;
export const D9_EQUALS_D4_MECHANICAL_AUTHORITY = false as const;
export const D9_EQUALS_D5_PIPING_AUTHORITY = false as const;
export const D9_EQUALS_D6_PROCESS_AUTHORITY = false as const;
export const D9_EQUALS_D7_ELECTRICAL_AUTHORITY = false as const;
export const D9_EQUALS_D8_IAC_AUTHORITY = false as const;
export const AI_EQUALS_D9_ENGINEERING_AUTHORITY = false as const;
export const ADMIN_EQUALS_D9_ENGINEERING_AUTHORITY = false as const;
export const AI_CAN_MARK_D9_RECORD_CURRENT_WITHOUT_BASIS = false as const;
export const AI_CAN_INVENT_D9_LINEAGE = false as const;
export const AI_CAN_REBASELINE_D9_FINGERPRINT = false as const;
export const ADMIN_CAN_BYPASS_D9_CURRENTNESS_GOVERNANCE = false as const;
export const ADMIN_CAN_INVENT_D9_LINEAGE = false as const;
export const ADMIN_CAN_REBASELINE_D9_FINGERPRINT_WITHOUT_GOVERNANCE = false as const;
export const D9_ENGINEERING_DECISION_RUNTIME_COUNT = 0 as const;
export const D9_R6_MAKES_ENGINEERING_DECISION = false as const;
export const D9_CONFLICT_RESOLUTION_RUNTIME_COUNT = 0 as const;
export const D9_AUTOMATIC_CONFLICT_RESOLUTION_RUNTIME_COUNT = 0 as const;
export const D9_R6_RESOLVES_ENGINEERING_CONFLICT = false as const;
export const D9_R6_GENERATES_NEW_RECOMMENDATION = false as const;
export const D9_R6_AUTO_REGENERATES_RECOMMENDATION = false as const;
export const D9_AUTO_VALIDATES_D1_STRUCTURAL = false as const;
export const D9_AUTO_VALIDATES_D2_CIVIL = false as const;
export const D9_AUTO_VALIDATES_D3_GEOTECHNICAL = false as const;
export const D9_AUTO_VALIDATES_D4_MECHANICAL = false as const;
export const D9_AUTO_VALIDATES_D5_PIPING = false as const;
export const D9_AUTO_VALIDATES_D6_PROCESS = false as const;
export const D9_AUTO_VALIDATES_D7_ELECTRICAL = false as const;
export const D9_AUTO_VALIDATES_D8_IAC = false as const;
export const D9_R6_AUTO_MUTATES_D1_STRUCTURAL = false as const;
export const D9_R6_AUTO_MUTATES_D2_CIVIL = false as const;
export const D9_R6_AUTO_MUTATES_D3_GEOTECHNICAL = false as const;
export const D9_R6_AUTO_MUTATES_D4_MECHANICAL = false as const;
export const D9_R6_AUTO_MUTATES_D5_PIPING = false as const;
export const D9_R6_AUTO_MUTATES_D6_PROCESS = false as const;
export const D9_R6_AUTO_MUTATES_D7_ELECTRICAL = false as const;
export const D9_R6_AUTO_MUTATES_D8_IAC = false as const;
export const D9_AUTOMATIC_ENGINEERING_DESIGN_RUNTIME_COUNT = 0 as const;
export const D9_AUTOMATIC_ENGINEERING_REDESIGN_RUNTIME_COUNT = 0 as const;
export const D9_ENGINEERING_OPTIMIZATION_RUNTIME_COUNT = 0 as const;
export const D9_CONFORMANCE_DETERMINATION_RUNTIME_COUNT = 0 as const;
export const D9_APPROVAL_RUNTIME_COUNT = 0 as const;
export const D9_CERTIFICATION_RUNTIME_COUNT = 0 as const;
export const D9_REVIEW_VALIDATION_RUNTIME_COUNT = 0 as const;
export const TENANT_WORKSPACE_PROJECT_D9_R6_SCOPE_ENFORCED = true as const;
export const CROSS_TENANT_D9_R6_ACCESS_ALLOWED = false as const;
export const D9_R6_DUPLICATE_GOVERNANCE_IMPLEMENTED = true as const;
export const D9_R6_REPLAY_PROTECTION_IMPLEMENTED = true as const;
export const D9_R6_SPOOFING_PROTECTION_IMPLEMENTED = true as const;
export const D9_R6_RECORDER_AUTHORITY = "D9_CURRENTNESS_THREAD_RECORDER" as const;
export const D9_R6_CURRENTNESS_VERSION = "D9-R6-CURRENTNESS-1" as const;
export const D9_R6_SUBJECT_KINDS = ["SOURCE", "OBSERVATION", "CANDIDATE", "GOVERNANCE", "RECOMMENDATION"] as const;
export const D9_R6_RELATIONSHIP_KINDS = ["SOURCE_TO_OBSERVATION", "OBSERVATION_TO_CANDIDATE", "CANDIDATE_TO_GOVERNANCE", "GOVERNANCE_TO_RECOMMENDATION", "SOURCE_TO_DERIVED", "PREDECESSOR_TO_SUCCESSOR"] as const;
export const D9_R7_CANONICAL_PHASE = D9_IMPLEMENTATION_PHASES[6];
export const D9_R7_PHASE_TYPE = D9_IMPLEMENTATION_PHASE_TYPES[6];
export const D9_R7_CANONICAL_SCOPE = "Govern review and validation records over exact D9 currentness, thread, lineage, and fingerprint revisions. Review completed is not engineering validated. A closed finding is not engineering validated. D9 validation is not source-discipline validation, conformance, approval, or certification. A reviewed recommendation is not an engineering decision. A reviewed conflict is not a resolved conflict. Do not decide, approve, resolve, certify, validate a source discipline, or mutate a source record." as const;
export const D9_R7_STARTED = false as const;
export const D9_R6_READY_FOR_NEXT_PHASE = true as const;
export const D9_R6_NEXT_PHASE = D9_R7_CANONICAL_PHASE;
export const D9_R6_NEXT_PHASE_TYPE = D9_R7_PHASE_TYPE;
export const D9_R6_CANONICAL_NEXT_PHASE = D9_R7_CANONICAL_PHASE;
export const D9_R6_CANONICAL_NEXT_PHASE_SCOPE = D9_R7_CANONICAL_SCOPE;
export const D9_R6_BLOCKER = "NONE" as const;
export const D9_R6_MACHINE_READABLE_ROADMAP_UPDATED = true as const;
export const D9_R6_DATABASE_SCHEMA_CHANGED = false as const;
export const D9_R6_NEW_DEPENDENCY_ADDED = false as const;
export const EOS_ALL_DISCIPLINES_COMPLETE = false as const;
export const EOS_GA_READY = false as const;
export const D9_R6_PRESERVES_CLOSED_TRACKS = D6_STATUS === "COMPLETE_BOUNDED_WITH_LIMITATIONS" && D7_STATUS === "COMPLETE_BOUNDED_WITH_LIMITATIONS" && D8_STATUS === "COMPLETE_BOUNDED_WITH_LIMITATIONS" && D8_TRACK_COMPLETE === true && D8_REOPENED === false;
export { D9_CANONICAL_MILESTONE_COUNT, D9_CANONICAL_PHASE_LIST, D9_CURRENTNESS_STATES };

const FLOATING = new Set(["latest", "head", "floating", "tip", "unspecified", "current"]);
const CONCLUSION = /\b(therefore|incorrect|confirmed|recommend|approved|validated|escalate|decide|resolve)\b/i;
const RELATION_FOR = {
  SOURCE: "PREDECESSOR_TO_SUCCESSOR",
  OBSERVATION: "SOURCE_TO_OBSERVATION",
  CANDIDATE: "OBSERVATION_TO_CANDIDATE",
  GOVERNANCE: "CANDIDATE_TO_GOVERNANCE",
  RECOMMENDATION: "GOVERNANCE_TO_RECOMMENDATION",
} as const;

export type D9R6Actor = D9R1Actor;
export type D9R6SubjectKind = (typeof D9_R6_SUBJECT_KINDS)[number];
export type D9R6AssessmentInput = {
  assessmentId: string;
  subjectKind: string;
  subjectId: string;
  subjectFingerprint: string;
  priorCurrentness: string;
  assessedCurrentness: string;
  recommendationId: string;
  recommendationFingerprint: string;
  governanceId: string;
  governanceFingerprint: string;
  candidateId: string;
  candidateFingerprint: string;
  observationId: string;
  observationFingerprint: string;
  sourceAContractId: string;
  sourceAExactRevision: string;
  sourceAFingerprint: string;
  sourceBContractId: string;
  sourceBExactRevision: string;
  sourceBFingerprint: string;
  dependencyKind: string;
  dependencyId: string;
  dependencyRevision: string;
  dependencyFingerprint: string;
  relationshipKind: string;
  lineageFromRevision: string;
  lineageToRevision: string;
  transitionBasis: string;
  sourceBasisRef: string;
  provenanceRef: string;
  applicability: string;
  limitations: string;
  assertedFingerprint?: string | null;
  tenantId?: string;
  reassessmentCompleted?: boolean;
  infer?: boolean;
  semanticSimilarity?: boolean;
  nameMatch?: boolean;
  tagMatch?: boolean;
  proximity?: boolean;
  timestampMatch?: boolean;
  repoint?: boolean;
  recompute?: boolean;
  redetect?: boolean;
  reconfirm?: boolean;
  resolve?: boolean;
  regenerate?: boolean;
  revalidate?: boolean;
  repairFingerprint?: boolean;
  rebaseline?: boolean;
  decide?: boolean;
  approve?: boolean;
  validate?: boolean;
  mutateSource?: boolean;
  design?: boolean;
  optimize?: boolean;
  stripLimitations?: boolean;
  stripApplicability?: boolean;
  stripProvenance?: boolean;
  grantAuthority?: boolean;
  adoptRequirement?: boolean;
  currentMeansValidated?: boolean;
  inventLineage?: boolean;
};

export type D9R6Assessment = {
  assessmentId: string;
  currentnessVersion: typeof D9_R6_CURRENTNESS_VERSION;
  subjectKind: D9R6SubjectKind;
  subjectId: string;
  subjectFingerprint: string;
  priorCurrentness: (typeof D9_CURRENTNESS_STATES)[number];
  assessedCurrentness: (typeof D9_CURRENTNESS_STATES)[number];
  sourceACurrentness: (typeof D9_CURRENTNESS_STATES)[number];
  sourceBCurrentness: (typeof D9_CURRENTNESS_STATES)[number];
  observationCurrentness: (typeof D9_CURRENTNESS_STATES)[number];
  candidateCurrentness: (typeof D9_CURRENTNESS_STATES)[number];
  governanceCurrentness: (typeof D9_CURRENTNESS_STATES)[number];
  recommendationCurrentness: (typeof D9_CURRENTNESS_STATES)[number];
  recommendationId: string;
  recommendationFingerprint: string;
  governanceId: string;
  governanceFingerprint: string;
  candidateId: string;
  candidateFingerprint: string;
  observationId: string;
  observationFingerprint: string;
  sourceAContractId: string;
  sourceAExactRevision: string;
  sourceAFingerprint: string;
  sourceBContractId: string;
  sourceBExactRevision: string;
  sourceBFingerprint: string;
  dependencyKind: string;
  dependencyId: string;
  dependencyRevision: string;
  dependencyFingerprint: string;
  relationshipKind: (typeof D9_R6_RELATIONSHIP_KINDS)[number];
  lineageFromRevision: string;
  lineageToRevision: string;
  transitionBasis: string;
  sourceBasisRef: string;
  provenanceRef: string;
  applicability: string;
  limitations: string;
  d1Limitations: typeof D9_R1_D1_STANDING_LIMITATION;
  d1PackComplete: false;
  digitalThreadModule: typeof D9_R6_DIGITAL_THREAD_MODULE;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  fingerprint: string;
  reassessmentCompleted: boolean;
  currentEqualsValidated: false;
  staleEqualsInvalid: false;
  supersededEqualsInvalid: false;
  currentSourceEqualsValidated: false;
  staleSourceEqualsInvalid: false;
  currentObservationEqualsValidated: false;
  staleObservationEqualsFalse: false;
  supersededObservationEqualsInvalid: false;
  currentCandidateEqualsConfirmed: false;
  staleCandidateEqualsFalse: false;
  supersededCandidateEqualsInvalid: false;
  currentConfirmedEqualsResolved: false;
  currentEscalationEqualsDecision: false;
  currentDispositionEqualsApproval: false;
  currentClosureEqualsValidated: false;
  currentRecommendationEqualsDecision: false;
  currentRecommendationEqualsApproval: false;
  currentRecommendationEqualsResolution: false;
  staleRecommendationEqualsWrong: false;
  supersededRecommendationEqualsInvalid: false;
  reassessmentRequiredEqualsStale: false;
  reassessmentRequiredEqualsValidationFailed: false;
  reassessmentCompletedEqualsValidated: false;
  threadEqualsAuthority: false;
  threadEqualsRequirementAdoption: false;
  threadEqualsValidation: false;
  threadEqualsApproval: false;
  threadEqualsResolution: false;
  lineageEqualsValidation: false;
  lineageEqualsAuthority: false;
  fingerprintMatchEqualsValidated: false;
  fingerprintMatchEqualsApproved: false;
  fingerprintMatchEqualsResolved: false;
  recommendationRegenerated: false;
  decisionCreated: false;
  resolved: false;
  validated: false;
  authoritative: false;
  recordedAt: string;
};

export type D9R6History = { historyId: string; assessmentId: string; action: "CREATED"; fingerprint: string; recordedAt: string };
export type D9R6Store = { tenantId: string; workspaceId: string; projectId: string; now: () => string; assessments: D9R6Assessment[]; history: D9R6History[] };
export type D9R6AiNote = { aiDescribed: true; authoritative: false; currentMeansValidated: false; basis: string };

function fail(code: string): never {
  throw new Error(`D9_R6_${code}`);
}

function blockedParty(value: string): boolean {
  const token = value.toUpperCase();
  return token === "AI" || token.startsWith("AI_") || token.startsWith("AI-") || token.startsWith("AI ") || token.includes("LLM");
}

function explicit(value: string, code: string): string {
  const token = value.trim();
  if (!token || FLOATING.has(token.toLowerCase())) fail(code);
  if (/calc\(|solve\(/i.test(token)) fail("DERIVATION_REJECTED");
  return token;
}

function prose(value: string, code: string): string {
  const token = explicit(value, code);
  if (CONCLUSION.test(token)) fail("CONCLUSION_REJECTED");
  return token;
}

function stateOf(value: string): (typeof D9_CURRENTNESS_STATES)[number] {
  if (!(D9_CURRENTNESS_STATES as readonly string[]).includes(value)) fail("CURRENTNESS_SPOOFED");
  return value as (typeof D9_CURRENTNESS_STATES)[number];
}

function assertActor(actor: D9R6Actor, r1: D9R1Store, r2: D9R2Store, r3: D9R3Store, r4: D9R4Store, r5: D9R5Store, store: D9R6Store): void {
  if (!actor.actorId.trim() || actor.tenantId !== r1.tenantId || actor.workspaceId !== r1.workspaceId || actor.projectId !== r1.projectId) fail("SCOPE_REQUIRED");
  for (const scoped of [r2, r3, r4, r5, store]) {
    if (actor.tenantId !== scoped.tenantId || actor.workspaceId !== scoped.workspaceId || actor.projectId !== scoped.projectId) fail("CROSS_SCOPE_REJECTED");
  }
  if (blockedParty(actor.actorId) || blockedParty(actor.authority) || actor.actorKind === "ai") fail("AI_NOT_D9_AUTHORITY");
  if (actor.authority === "ADMIN" || actor.authority === "ADMINISTRATOR" || actor.actorId === "ADMIN") fail("ADMIN_CANNOT_OVERRIDE");
  if (actor.authority !== D9_R6_RECORDER_AUTHORITY) fail("RECORDER_AUTHORITY_REQUIRED");
}

function assertProhibited(input: D9R6AssessmentInput): void {
  if (input.infer || input.semanticSimilarity || input.nameMatch || input.tagMatch || input.proximity || input.timestampMatch) fail("INFERRED_DEPENDENCY_REJECTED");
  if (input.inventLineage) fail("INFERRED_LINEAGE_REJECTED");
  if (input.repoint) fail("AUTO_REPOINT_REJECTED");
  if (input.recompute) fail("AUTO_RECOMPUTE_REJECTED");
  if (input.redetect || input.reconfirm) fail("AUTO_REDETECT_REJECTED");
  if (input.resolve) fail("CONFLICT_RESOLUTION_REJECTED");
  if (input.regenerate) fail("AUTO_REGENERATE_REJECTED");
  if (input.revalidate || input.validate || input.currentMeansValidated) fail("VALIDATION_REJECTED");
  if (input.repairFingerprint || input.rebaseline) fail("FINGERPRINT_REPAIR_REJECTED");
  if (input.decide) fail("DECISION_REJECTED");
  if (input.approve) fail("APPROVAL_REJECTED");
  if (input.mutateSource) fail("SOURCE_MUTATION_REJECTED");
  if (input.design || input.optimize) fail("DESIGN_REJECTED");
  if (input.stripLimitations) fail("LIMITATION_STRIPPING_REJECTED");
  if (input.stripApplicability) fail("APPLICABILITY_STRIPPING_REJECTED");
  if (input.stripProvenance) fail("PROVENANCE_STRIPPING_REJECTED");
  if (input.grantAuthority || input.adoptRequirement) fail("AUTHORITY_PROMOTION_REJECTED");
}

function findEntry(r1: D9R1Store, contractId: string, exactRevision: string, fingerprint: string): D9R1SourceEntry {
  const entry = r1.entries.find((row) => row.contractId === contractId && row.exactRevision === exactRevision && row.tenantId === r1.tenantId);
  if (!entry) fail("SOURCE_REVISION_NOT_ON_MANIFEST");
  if (entry.fingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  return entry;
}

export function createD9R6Store(r1: D9R1Store, r2: D9R2Store, r3: D9R3Store, r4: D9R4Store, r5: D9R5Store, now: () => string = () => r5.now()): D9R6Store {
  for (const scoped of [r2, r3, r4, r5]) {
    if (r1.tenantId !== scoped.tenantId || r1.workspaceId !== scoped.workspaceId || r1.projectId !== scoped.projectId) fail("SCOPE_REQUIRED");
  }
  if (!D9_R6_R5_RUNTIME_REMAINS_FIVE || !D9_R6_ARCHITECTURE_CURRENTNESS_REUSED || D9_CANONICAL_MILESTONE_COUNT !== 9 || D9_R6_PHASE_TYPE !== "CURRENTNESS_AND_DIGITAL_THREAD" || !D9_CANONICAL_PHASE_LIST.includes(D9_R6_PHASE)) fail("PHASE_LIST_UNEXPECTED");
  return { tenantId: r1.tenantId, workspaceId: r1.workspaceId, projectId: r1.projectId, now, assessments: [], history: [] };
}

export function aiDescribeD9Currentness(input: { basis: string; limitations: string; markCurrent?: boolean; inventLineage?: boolean; rebaseline?: boolean }): D9R6AiNote {
  if (input.markCurrent || !input.basis.trim()) fail("AI_CURRENT_WITHOUT_BASIS");
  if (input.inventLineage) fail("INFERRED_LINEAGE_REJECTED");
  if (input.rebaseline) fail("FINGERPRINT_REPAIR_REJECTED");
  return Object.freeze({ aiDescribed: true as const, authoritative: false as const, currentMeansValidated: false as const, basis: prose(input.basis, "TRANSITION_BASIS_REQUIRED") });
}

export function recordD9CurrentnessAssessment(r1: D9R1Store, r2: D9R2Store, r3: D9R3Store, r4: D9R4Store, r5: D9R5Store, store: D9R6Store, actor: D9R6Actor, input: D9R6AssessmentInput): D9R6Assessment {
  assertActor(actor, r1, r2, r3, r4, r5, store);
  assertProhibited(input);
  if (input.tenantId != null && input.tenantId !== actor.tenantId) fail("CROSS_SCOPE_REJECTED");
  if (!(D9_R6_SUBJECT_KINDS as readonly string[]).includes(input.subjectKind)) fail("SUBJECT_SPOOFED");
  const subjectKind = input.subjectKind as D9R6SubjectKind;
  const relationshipKind = input.relationshipKind;
  if (!(D9_R6_RELATIONSHIP_KINDS as readonly string[]).includes(relationshipKind)) fail("RELATIONSHIP_SPOOFED");
  const derived = relationshipKind === "SOURCE_TO_DERIVED" && input.dependencyKind === "SOURCE";
  if (!derived && relationshipKind !== RELATION_FOR[subjectKind]) fail("RELATIONSHIP_MISMATCH");
  const recommendation = r5.recommendations.find((row) => row.recommendationId === input.recommendationId && row.tenantId === store.tenantId);
  if (!recommendation || recommendation.fingerprint !== input.recommendationFingerprint) fail("RECOMMENDATION_REVISION_MISMATCH");
  const governance = r4.records.find((row) => row.governanceId === input.governanceId && row.tenantId === store.tenantId);
  if (!governance || governance.fingerprint !== input.governanceFingerprint || governance.governanceId !== recommendation.governanceId || governance.fingerprint !== recommendation.governanceFingerprint) fail("GOVERNANCE_REVISION_MISMATCH");
  const candidate = r3.candidates.find((row) => row.candidateId === input.candidateId && row.tenantId === store.tenantId);
  if (!candidate || candidate.fingerprint !== input.candidateFingerprint || candidate.candidateId !== governance.candidateId || candidate.fingerprint !== governance.candidateFingerprint) fail("CANDIDATE_REVISION_MISMATCH");
  const observation = r2.observations.find((row) => row.observationId === input.observationId && row.tenantId === store.tenantId);
  if (!observation || observation.fingerprint !== input.observationFingerprint || observation.observationId !== governance.observationId || observation.fingerprint !== governance.observationFingerprint) fail("OBSERVATION_REVISION_MISMATCH");
  const sourceARevision = explicit(input.sourceAExactRevision, "EXACT_REVISION_REQUIRED");
  const sourceBRevision = explicit(input.sourceBExactRevision, "EXACT_REVISION_REQUIRED");
  const sourceAContractId = explicit(input.sourceAContractId, "SOURCE_A_REQUIRED");
  const sourceBContractId = explicit(input.sourceBContractId, "SOURCE_B_REQUIRED");
  if (sourceAContractId !== recommendation.sourceA.contractId || sourceARevision !== recommendation.sourceA.exactRevision || input.sourceAFingerprint !== recommendation.sourceA.fingerprint) fail("EXACT_REVISION_MISMATCH");
  if (sourceBContractId !== recommendation.sourceB.contractId || sourceBRevision !== recommendation.sourceB.exactRevision || input.sourceBFingerprint !== recommendation.sourceB.fingerprint) fail("EXACT_REVISION_MISMATCH");
  const manifest = buildD9SourceManifest(r1);
  if (manifest.d1.packComplete || manifest.d1.limitations !== D9_R1_D1_STANDING_LIMITATION) fail("D1_LIMITATION_MISSING");
  const sourceA = findEntry(r1, sourceAContractId, sourceARevision, input.sourceAFingerprint);
  const sourceB = findEntry(r1, sourceBContractId, sourceBRevision, input.sourceBFingerprint);
  const priorCurrentness = stateOf(input.priorCurrentness);
  const assessedCurrentness = stateOf(input.assessedCurrentness);
  const subjectCurrentness = subjectKind === "SOURCE"
    ? (input.subjectId === sourceA.entryId ? sourceA.currentness : input.subjectId === sourceB.entryId ? sourceB.currentness : fail("SUBJECT_REVISION_MISMATCH"))
    : subjectKind === "OBSERVATION" ? observation.citedCurrentness
    : subjectKind === "CANDIDATE" ? candidate.citedCurrentness
    : subjectKind === "GOVERNANCE" ? governance.citedCurrentness
    : recommendation.citedCurrentness;
  const subjectId = explicit(input.subjectId, "SUBJECT_ID_REQUIRED");
  const expectedSubjectId = subjectKind === "SOURCE" ? subjectId : subjectKind === "OBSERVATION" ? observation.observationId : subjectKind === "CANDIDATE" ? candidate.candidateId : subjectKind === "GOVERNANCE" ? governance.governanceId : recommendation.recommendationId;
  if (subjectId !== expectedSubjectId) fail("SUBJECT_REVISION_MISMATCH");
  const expectedFingerprint = subjectKind === "SOURCE"
    ? (subjectId === sourceA.entryId ? sourceA.fingerprint : sourceB.fingerprint)
    : subjectKind === "OBSERVATION" ? observation.fingerprint
    : subjectKind === "CANDIDATE" ? candidate.fingerprint
    : subjectKind === "GOVERNANCE" ? governance.fingerprint
    : recommendation.fingerprint;
  if (input.subjectFingerprint !== expectedFingerprint || priorCurrentness !== subjectCurrentness) fail("CURRENTNESS_MISMATCH");
  const dependencyRevision = explicit(input.dependencyRevision, "DEPENDENCY_REVISION_REQUIRED");
  const dependencyId = explicit(input.dependencyId, "DEPENDENCY_ID_REQUIRED");
  const lineageFromRevision = explicit(input.lineageFromRevision, "LINEAGE_REVISION_REQUIRED");
  const lineageToRevision = explicit(input.lineageToRevision, "LINEAGE_REVISION_REQUIRED");
  const lineageEntry = [sourceA, sourceB].find((entry) => entry.lineage.some((row) => row.fromRevision === lineageFromRevision && row.toRevision === lineageToRevision) && entry.exactRevision === lineageToRevision);
  if (!lineageEntry) fail("LINEAGE_NOT_EXPLICIT");
  const dependencyMatches = input.dependencyKind === "GOVERNANCE"
    ? dependencyId === governance.governanceId && input.dependencyFingerprint === governance.fingerprint && (dependencyRevision === governance.sourceA.exactRevision || dependencyRevision === governance.sourceB.exactRevision)
    : input.dependencyKind === "CANDIDATE"
    ? dependencyId === candidate.candidateId && input.dependencyFingerprint === candidate.fingerprint && (dependencyRevision === candidate.sourceA.exactRevision || dependencyRevision === candidate.sourceB.exactRevision)
    : input.dependencyKind === "OBSERVATION"
    ? dependencyId === observation.observationId && input.dependencyFingerprint === observation.fingerprint && (dependencyRevision === observation.sourceA.exactRevision || dependencyRevision === observation.sourceB.exactRevision)
    : input.dependencyKind === "RECOMMENDATION"
    ? dependencyId === recommendation.recommendationId && input.dependencyFingerprint === recommendation.fingerprint && (dependencyRevision === recommendation.sourceA.exactRevision || dependencyRevision === recommendation.sourceB.exactRevision)
    : input.dependencyKind === "SOURCE" || input.dependencyKind === "PREDECESSOR"
    ? (dependencyId === sourceA.entryId || dependencyId === sourceB.entryId) && (input.dependencyFingerprint === sourceA.fingerprint || input.dependencyFingerprint === sourceB.fingerprint) && dependencyRevision === lineageFromRevision
    : false;
  if (!dependencyMatches) fail("DEPENDENCY_MISMATCH");
  if (derived && input.dependencyFingerprint !== sourceA.fingerprint && input.dependencyFingerprint !== sourceB.fingerprint) fail("DEPENDENCY_MISMATCH");
  const transitionBasis = prose(input.transitionBasis, "TRANSITION_BASIS_REQUIRED");
  const sourceBasisRef = explicit(input.sourceBasisRef, "SOURCE_BASIS_REQUIRED");
  const provenanceRef = explicit(input.provenanceRef, "PROVENANCE_REQUIRED");
  const applicability = explicit(input.applicability, "APPLICABILITY_REQUIRED");
  const limitations = explicit(input.limitations, "LIMITATIONS_REQUIRED");
  if (!transitionBasis.includes(subjectId) || !transitionBasis.includes(dependencyId) || !transitionBasis.includes(lineageFromRevision) || !transitionBasis.includes(lineageToRevision) || !transitionBasis.includes(sourceAContractId) || !transitionBasis.includes(sourceBContractId)) fail("TRANSITION_BASIS_NOT_TRACEABLE");
  if (!sourceBasisRef.includes(recommendation.sourceBasisRef) || !sourceBasisRef.includes(sourceA.sourceBasisRef) || !sourceBasisRef.includes(sourceB.sourceBasisRef)) fail("SOURCE_BASIS_NOT_TRACEABLE");
  if (!provenanceRef.includes(recommendation.recommendationId) || !provenanceRef.includes(governance.governanceId) || !provenanceRef.includes(candidate.candidateId) || !provenanceRef.includes(observation.observationId) || !provenanceRef.includes(sourceAContractId) || !provenanceRef.includes(sourceBContractId) || !provenanceRef.includes(D9_R6_CURRENTNESS_VERSION)) fail("PROVENANCE_NOT_TRACEABLE");
  if (!applicability.includes(recommendation.applicability)) fail("APPLICABILITY_NOT_PRESERVED");
  if (!limitations.includes(recommendation.limitations) || !limitations.includes(governance.limitations) || !limitations.includes(sourceA.limitations) || !limitations.includes(sourceB.limitations) || !limitations.includes(D9_R1_D1_STANDING_LIMITATION)) fail("SOURCE_LIMITATION_NOT_PRESERVED");
  const body = {
    currentnessVersion: D9_R6_CURRENTNESS_VERSION,
    subjectKind,
    subjectId,
    subjectFingerprint: expectedFingerprint,
    priorCurrentness,
    assessedCurrentness,
    sourceACurrentness: sourceA.currentness,
    sourceBCurrentness: sourceB.currentness,
    observationCurrentness: observation.citedCurrentness,
    candidateCurrentness: candidate.citedCurrentness,
    governanceCurrentness: governance.citedCurrentness,
    recommendationCurrentness: recommendation.citedCurrentness,
    recommendationId: recommendation.recommendationId,
    recommendationFingerprint: recommendation.fingerprint,
    governanceId: governance.governanceId,
    governanceFingerprint: governance.fingerprint,
    candidateId: candidate.candidateId,
    candidateFingerprint: candidate.fingerprint,
    observationId: observation.observationId,
    observationFingerprint: observation.fingerprint,
    sourceAContractId,
    sourceAExactRevision: sourceA.exactRevision,
    sourceAFingerprint: sourceA.fingerprint,
    sourceBContractId,
    sourceBExactRevision: sourceB.exactRevision,
    sourceBFingerprint: sourceB.fingerprint,
    dependencyKind: input.dependencyKind,
    dependencyId,
    dependencyRevision,
    dependencyFingerprint: input.dependencyFingerprint,
    relationshipKind: relationshipKind as (typeof D9_R6_RELATIONSHIP_KINDS)[number],
    lineageFromRevision,
    lineageToRevision,
    transitionBasis,
    sourceBasisRef,
    provenanceRef,
    applicability,
    limitations,
    d1Limitations: manifest.d1.limitations,
    d1PackComplete: false as const,
    digitalThreadModule: D9_R6_DIGITAL_THREAD_MODULE,
    tenantId: store.tenantId,
    workspaceId: store.workspaceId,
    projectId: store.projectId,
    reassessmentCompleted: input.reassessmentCompleted === true,
    currentEqualsValidated: false as const,
    staleEqualsInvalid: false as const,
    supersededEqualsInvalid: false as const,
    currentSourceEqualsValidated: false as const,
    staleSourceEqualsInvalid: false as const,
    currentObservationEqualsValidated: false as const,
    staleObservationEqualsFalse: false as const,
    supersededObservationEqualsInvalid: false as const,
    currentCandidateEqualsConfirmed: false as const,
    staleCandidateEqualsFalse: false as const,
    supersededCandidateEqualsInvalid: false as const,
    currentConfirmedEqualsResolved: false as const,
    currentEscalationEqualsDecision: false as const,
    currentDispositionEqualsApproval: false as const,
    currentClosureEqualsValidated: false as const,
    currentRecommendationEqualsDecision: false as const,
    currentRecommendationEqualsApproval: false as const,
    currentRecommendationEqualsResolution: false as const,
    staleRecommendationEqualsWrong: false as const,
    supersededRecommendationEqualsInvalid: false as const,
    reassessmentRequiredEqualsStale: false as const,
    reassessmentRequiredEqualsValidationFailed: false as const,
    reassessmentCompletedEqualsValidated: false as const,
    threadEqualsAuthority: false as const,
    threadEqualsRequirementAdoption: false as const,
    threadEqualsValidation: false as const,
    threadEqualsApproval: false as const,
    threadEqualsResolution: false as const,
    lineageEqualsValidation: false as const,
    lineageEqualsAuthority: false as const,
    fingerprintMatchEqualsValidated: false as const,
    fingerprintMatchEqualsApproved: false as const,
    fingerprintMatchEqualsResolved: false as const,
    recommendationRegenerated: false as const,
    decisionCreated: false as const,
    resolved: false as const,
    validated: false as const,
    authoritative: false as const,
  };
  const fingerprint = fingerprintCanonical(body);
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const assessmentId = explicit(input.assessmentId, "ASSESSMENT_ID_REQUIRED");
  const existing = store.assessments.find((row) => row.assessmentId === assessmentId);
  if (existing) return existing.fingerprint === fingerprint ? existing : fail("REPLAY_REJECTED");
  if (store.assessments.some((row) => row.subjectKind === subjectKind && row.subjectFingerprint === expectedFingerprint && row.priorCurrentness === priorCurrentness && row.assessedCurrentness === assessedCurrentness && row.dependencyFingerprint === input.dependencyFingerprint && row.relationshipKind === relationshipKind)) fail("DUPLICATE_ASSESSMENT_REJECTED");
  const assessment: D9R6Assessment = Object.freeze({ ...body, assessmentId, fingerprint, recordedAt: store.now() });
  store.assessments.push(assessment);
  store.history.push({ historyId: `d9-r6-hist-${store.history.length + 1}`, assessmentId, action: "CREATED", fingerprint, recordedAt: assessment.recordedAt });
  return assessment;
}

export function readD9CurrentnessAssessments(r1: D9R1Store, r2: D9R2Store, r3: D9R3Store, r4: D9R4Store, r5: D9R5Store, store: D9R6Store, actor: D9R6Actor): readonly D9R6Assessment[] {
  assertActor(actor, r1, r2, r3, r4, r5, store);
  return store.assessments.filter((row) => row.tenantId === actor.tenantId && row.workspaceId === actor.workspaceId && row.projectId === actor.projectId);
}

export function repointD9Currentness(): never { return fail("AUTO_REPOINT_REJECTED"); }
export function recomputeD9ObservationFromSourceChange(): never { return fail("AUTO_RECOMPUTE_REJECTED"); }
export function redetectD9ConflictFromSourceChange(): never { return fail("AUTO_REDETECT_REJECTED"); }
export function reconfirmD9ConflictFromSourceChange(): never { return fail("AUTO_REDETECT_REJECTED"); }
export function resolveD9ConflictFromSourceChange(): never { return fail("CONFLICT_RESOLUTION_REJECTED"); }
export function regenerateD9RecommendationFromSourceChange(): never { return fail("AUTO_REGENERATE_REJECTED"); }
export function revalidateD9RecordFromSourceChange(): never { return fail("VALIDATION_REJECTED"); }
export function repairD9Fingerprint(): never { return fail("FINGERPRINT_REPAIR_REJECTED"); }
export function rebaselineD9Fingerprint(): never { return fail("FINGERPRINT_REPAIR_REJECTED"); }
export function inferD9Lineage(): never { return fail("INFERRED_LINEAGE_REJECTED"); }
export function inferD9Dependency(): never { return fail("INFERRED_DEPENDENCY_REJECTED"); }
