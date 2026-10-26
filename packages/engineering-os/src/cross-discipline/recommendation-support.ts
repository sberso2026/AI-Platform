/**
 * EOS-D9-R5 recommendation support.
 * One bounded runtime of advisory recommendations over exact D9-R4 governance records.
 * A recommendation is not a decision, an approval, a conflict resolution, or a design change.
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
  D9_RECOMMENDATION_RUNTIME_COUNT as ARCHITECTURE_RECOMMENDATION_COUNT,
  D9_REUSES_CANONICAL_DECISION_GOVERNANCE as ARCHITECTURE_REUSES_DECISION,
  PARALLEL_D9_ENGINEERING_DECISION_ENGINE_CREATED as ARCHITECTURE_PARALLEL_DECISION,
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
import {
  D9_CONFLICT_CANDIDATE_DETECTION_RUNTIME_READY,
  D9_CONFLICT_DETECTION_RUNTIME_COUNT,
  D9_CONFLICT_GOVERNANCE_ESCALATION_RUNTIME_COUNT as R4_GOVERNANCE_COUNT,
  D9_CONFLICT_GOVERNANCE_ESCALATION_RUNTIME_READY,
  D9_CROSS_DISCIPLINE_OBSERVATION_RUNTIME_COUNT,
  D9_CROSS_DISCIPLINE_OBSERVATION_RUNTIME_READY,
  D9_R5_CANONICAL_PHASE,
  D9_R5_PHASE_TYPE,
  D9_R5_STARTED,
  D9_RECOMMENDATION_RUNTIME_COUNT as R4_RECOMMENDATION_COUNT,
  D9_RUNTIME_COUNT as R4_RUNTIME_COUNT,
  D9_SOURCE_CONTRACT_READ_MODEL_RUNTIME_COUNT,
  D9_SOURCE_CONTRACT_READ_MODEL_RUNTIME_READY,
  type D9R4GovernanceRecord,
  type D9R4Store,
} from "./conflict-governance-escalation";
import { type D9R2Store } from "./cross-discipline-observation";
import {
  D9_R1_D1_STANDING_LIMITATION,
  buildD9SourceManifest,
  type D9R1Actor,
  type D9R1SourceEntry,
  type D9R1Store,
} from "./source-contract-read-model";

export const D9_R5_STATUS = "RECOMMENDATION_SUPPORT_IMPLEMENTED" as const;
export const D9_R5_MATURITY = D9_R5_STATUS;
export const D9_R5_MATURITY_STATE = D9_R5_STATUS;
export const D9_R5_CLOSEOUT_PATH = "docs/architecture/engineering-os/EOS_D9_R5_RECOMMENDATION_SUPPORT_CLOSEOUT.md" as const;
export const D9_R5_PHASE = D9_R5_CANONICAL_PHASE;
export const D9_RECOMMENDATION_SUPPORT_RUNTIME_IMPLEMENTED = true as const;
export const D9_RECOMMENDATION_RUNTIME_COUNT = 1 as const;
export const D9_RECOMMENDATION_SUPPORT_RUNTIME_READY = true as const;
export const D9_RUNTIME_STARTED = true as const;
export const D9_RUNTIME_COUNT = 5 as const;
export const D9_R5_R4_RUNTIME_REMAINS_FOUR = R4_RUNTIME_COUNT === 4 && R4_RECOMMENDATION_COUNT === 0 && D9_R5_STARTED === false && R4_GOVERNANCE_COUNT === 1 && D9_CONFLICT_GOVERNANCE_ESCALATION_RUNTIME_READY === true && D9_CONFLICT_DETECTION_RUNTIME_COUNT === 1 && D9_CONFLICT_CANDIDATE_DETECTION_RUNTIME_READY === true && D9_CROSS_DISCIPLINE_OBSERVATION_RUNTIME_COUNT === 1 && D9_CROSS_DISCIPLINE_OBSERVATION_RUNTIME_READY === true && D9_SOURCE_CONTRACT_READ_MODEL_RUNTIME_COUNT === 1 && D9_SOURCE_CONTRACT_READ_MODEL_RUNTIME_READY === true;
export const D9_R5_ARCHITECTURE_RECOMMENDATION_REMAINS_ZERO = ARCHITECTURE_RECOMMENDATION_COUNT === 0 && ARCHITECTURE_PARALLEL_DECISION === false && ARCHITECTURE_REUSES_DECISION === true;
export { D9_CONFLICT_CANDIDATE_DETECTION_RUNTIME_READY, D9_CONFLICT_DETECTION_RUNTIME_COUNT, R4_GOVERNANCE_COUNT as D9_CONFLICT_GOVERNANCE_ESCALATION_RUNTIME_COUNT, D9_CONFLICT_GOVERNANCE_ESCALATION_RUNTIME_READY, D9_CROSS_DISCIPLINE_OBSERVATION_RUNTIME_COUNT, D9_CROSS_DISCIPLINE_OBSERVATION_RUNTIME_READY, D9_SOURCE_CONTRACT_READ_MODEL_RUNTIME_COUNT, D9_SOURCE_CONTRACT_READ_MODEL_RUNTIME_READY };
export const D9_R5_USES_R4_GOVERNED_CONFLICT_RECORDS = true as const;
export const D9_R5_EXACT_CONFLICT_REVISION_REQUIRED = true as const;
export const D9_R5_FLOATING_CONFLICT_REFERENCE_ALLOWED = false as const;
export const D9_R5_CONFLICT_REFERENCE_AUTO_REPOINTED = false as const;
export const D9_R5_PRESERVES_R1_SOURCE_REVISION_MANIFEST = true as const;
export const D9_R5_PRESERVES_R2_OBSERVATION_REFERENCES = true as const;
export const D9_R5_PRESERVES_R3_CANDIDATE_REFERENCES = true as const;
export const D9_R5_EXACT_SOURCE_REVISION_REQUIRED = true as const;
export const D9_R5_EXACT_OBSERVATION_REVISION_REQUIRED = true as const;
export const D9_R5_EXACT_CANDIDATE_REVISION_REQUIRED = true as const;
export const D9_RECOMMENDATION_RECORD_IMPLEMENTED = true as const;
export const D9_R5_RECOMMENDATION_REQUIRES_EVIDENCE = true as const;
export const D9_R5_RECOMMENDATION_EVIDENCE_TRACEABLE = true as const;
export const D9_R5_RECOMMENDATION_REQUIRES_EXACT_SOURCE_REVISIONS = true as const;
export const D9_RECOMMENDATION_EQUALS_ENGINEERING_DECISION = false as const;
export const D9_RECOMMENDATION_EQUALS_APPROVAL = false as const;
export const D9_RECOMMENDATION_EQUALS_CONFLICT_RESOLUTION = false as const;
export const D9_RECOMMENDATION_EQUALS_ENGINEERING_VALIDATION = false as const;
export const D9_RECOMMENDATION_EQUALS_AUTOMATIC_DESIGN_CHANGE = false as const;
export const D9_RECOMMENDATION_EQUALS_REQUIREMENT_ADOPTION = false as const;
export const RECOMMENDATION_ACCEPTED_EQUALS_APPROVAL = false as const;
export const RECOMMENDATION_REVIEWED_EQUALS_APPROVAL = false as const;
export const D9_CONFLICT_RESOLUTION_RUNTIME_COUNT = 0 as const;
export const D9_AUTOMATIC_CONFLICT_RESOLUTION_RUNTIME_COUNT = 0 as const;
export const D9_R5_AUTOMATICALLY_RESOLVES_CONFLICT = false as const;
export const D9_ENGINEERING_DECISION_RUNTIME_COUNT = 0 as const;
export const D9_R5_MAKES_ENGINEERING_DECISION = false as const;
export const D9_REUSES_CANONICAL_DECISION_GOVERNANCE = ARCHITECTURE_REUSES_DECISION;
export const PARALLEL_D9_ENGINEERING_DECISION_ENGINE_CREATED = false as const;
export const D9_R5_RECOMMENDATION_REVIEW_CONTEXT_SUPPORTED = true as const;
export const RECOMMENDATION_REVIEWED_EQUALS_ENGINEERING_VALIDATED = false as const;
export const RECOMMENDATION_ACCEPTED_EQUALS_ENGINEERING_DECISION = false as const;
export const RECOMMENDATION_ACCEPTED_EQUALS_CONFLICT_RESOLVED = false as const;
export const RECOMMENDATION_ACCEPTED_EQUALS_AUTOMATIC_CHANGE = false as const;
export const AI_CAN_GENERATE_D9_RECOMMENDATION_CANDIDATE = true as const;
export const AI_RECOMMENDATION_EQUALS_ENGINEERING_DECISION = false as const;
export const AI_RECOMMENDATION_EQUALS_APPROVAL = false as const;
export const AI_RECOMMENDATION_EQUALS_CONFLICT_RESOLUTION = false as const;
export const AI_RECOMMENDATION_EQUALS_VALIDATED_SOLUTION = false as const;
export const D9_R5_AI_RECOMMENDATION_SOURCE_TRACEABILITY_REQUIRED = true as const;
export const D9_R5_AI_RECOMMENDATION_LIMITATIONS_REQUIRED = true as const;
export const D9_R5_AI_RECOMMENDATION_UNCERTAINTY_REQUIRED = true as const;
export const D9_R5_ALTERNATIVE_RECOMMENDATIONS_SUPPORTED = true as const;
export const TOP_RANKED_RECOMMENDATION_EQUALS_ENGINEERING_DECISION = false as const;
export const TOP_RANKED_RECOMMENDATION_EQUALS_APPROVED_SOLUTION = false as const;
export const D9_R5_RECOMMENDATION_CONFIDENCE_CONTEXT_SUPPORTED = true as const;
export const HIGH_CONFIDENCE_RECOMMENDATION_EQUALS_ENGINEERING_VALIDATED = false as const;
export const HIGH_RANK_RECOMMENDATION_EQUALS_APPROVED_ENGINEERING_SOLUTION = false as const;
export const D9_R5_AUTO_APPLIES_RECOMMENDATION = false as const;
export const D9_R5_AUTO_MUTATES_ENGINEERING_DESIGN = false as const;
export const D9_R5_AUTO_CREATES_DESIGN_CHANGE = false as const;
export const D9_R5_RECOMMENDATION_AUTO_ADOPTS_REQUIREMENT = false as const;
export const D9_R5_RECOMMENDATION_AUTO_CHANGES_REQUIREMENT = false as const;
export const D9_R5_RECOMMENDATION_AUTO_PROMOTES_ASSUMPTION_TO_FACT = false as const;
export const D9_R5_PRESERVES_D1_INCOMPLETE_STATUS = D1_STRUCTURAL_PACK_COMPLETE === false;
export const D9_R5_PRESERVES_D1_LIMITATIONS = true as const;
export const D9_TREATS_D1_STRUCTURAL_AS_COMPLETE = false as const;
export const D9_IGNORES_D1_STRUCTURAL_LIMITATIONS = false as const;
export const D9_R5_PRESERVES_SOURCE_DISCIPLINE = true as const;
export const D9_R5_PRESERVES_SOURCE_IDENTITY = true as const;
export const D9_R5_PRESERVES_AUTHORITY_METADATA = true as const;
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
export const D9_AUTO_VALIDATES_D1_STRUCTURAL = false as const;
export const D9_AUTO_VALIDATES_D2_CIVIL = false as const;
export const D9_AUTO_VALIDATES_D3_GEOTECHNICAL = false as const;
export const D9_AUTO_VALIDATES_D4_MECHANICAL = false as const;
export const D9_AUTO_VALIDATES_D5_PIPING = false as const;
export const D9_AUTO_VALIDATES_D6_PROCESS = false as const;
export const D9_AUTO_VALIDATES_D7_ELECTRICAL = false as const;
export const D9_AUTO_VALIDATES_D8_IAC = false as const;
export const D9_R5_AUTO_MUTATES_D1_STRUCTURAL = false as const;
export const D9_R5_AUTO_MUTATES_D2_CIVIL = false as const;
export const D9_R5_AUTO_MUTATES_D3_GEOTECHNICAL = false as const;
export const D9_R5_AUTO_MUTATES_D4_MECHANICAL = false as const;
export const D9_R5_AUTO_MUTATES_D5_PIPING = false as const;
export const D9_R5_AUTO_MUTATES_D6_PROCESS = false as const;
export const D9_R5_AUTO_MUTATES_D7_ELECTRICAL = false as const;
export const D9_R5_AUTO_MUTATES_D8_IAC = false as const;
export const D9_CONFORMANCE_DETERMINATION_RUNTIME_COUNT = 0 as const;
export const D9_APPROVAL_RUNTIME_COUNT = 0 as const;
export const D9_CERTIFICATION_RUNTIME_COUNT = 0 as const;
export const D9_AUTOMATIC_ENGINEERING_DESIGN_RUNTIME_COUNT = 0 as const;
export const D9_AUTOMATIC_ENGINEERING_REDESIGN_RUNTIME_COUNT = 0 as const;
export const D9_ENGINEERING_OPTIMIZATION_RUNTIME_COUNT = 0 as const;
export const D9_R5_SOURCE_BASIS_REQUIRED = true as const;
export const D9_R5_SOURCE_BASIS_TRACEABLE = true as const;
export const D9_R5_PROVENANCE_REQUIRED = true as const;
export const D9_R5_PROVENANCE_PRESERVED = true as const;
export const D9_R5_APPLICABILITY_EXPLICIT = true as const;
export const D9_R5_AUTO_PROPAGATES_OUTSIDE_APPLICABILITY = false as const;
export const D9_R5_LIMITATIONS_EXPLICIT = true as const;
export const D9_R5_SOURCE_LIMITATIONS_PRESERVED = true as const;
export const D9_R5_CAN_SILENTLY_DROP_SOURCE_LIMITATIONS = false as const;
export const D9_R5_RECOMMENDATION_ASSUMPTIONS_EXPLICIT = true as const;
export const RECOMMENDATION_ASSUMPTION_EQUALS_VALIDATED_FACT = false as const;
export const D9_REUSES_CANONICAL_CURRENTNESS = true as const;
export const PARALLEL_D9_CURRENTNESS_ENGINE_CREATED = false as const;
export const D9_R5_RECOMMENDATION_CURRENTNESS_INTEGRATED = true as const;
export const CURRENT_RECOMMENDATION_EQUALS_ENGINEERING_DECISION = false as const;
export const STALE_RECOMMENDATION_EQUALS_WRONG = false as const;
export const SUPERSEDED_RECOMMENDATION_EQUALS_INVALID = false as const;
export const D9_R5_SOURCE_CHANGE_AUTO_REPOINTS_RECOMMENDATION = false as const;
export const D9_R5_SOURCE_CHANGE_AUTO_REGENERATES_RECOMMENDATION = false as const;
export const D9_R5_SOURCE_CHANGE_AUTO_APPLIES_RECOMMENDATION = false as const;
export const D9_R5_CONFLICT_CHANGE_AUTO_REPOINTS_RECOMMENDATION = false as const;
export const D9_R5_CONFLICT_CHANGE_AUTO_REGENERATES_RECOMMENDATION = false as const;
export const D9_REUSES_CANONICAL_DIGITAL_THREAD = true as const;
export const D9_R5_DIGITAL_THREAD_MODULE = D9_DIGITAL_THREAD_MODULE;
export const PARALLEL_D9_DIGITAL_THREAD_CREATED = false as const;
export const D9_EXPLICIT_LINEAGE_REQUIRED = true as const;
export const D9_INFERRED_LINEAGE_ALLOWED = false as const;
export const D9_R5_RECOMMENDATION_LINEAGE_PRESERVED = true as const;
export const D9_REUSES_CANONICAL_FINGERPRINT = D9_FINGERPRINT_ALGORITHM === "fingerprintCanonical";
export const SECOND_D9_FINGERPRINT_ALGORITHM_CREATED = false as const;
export const D9_R5_RECOMMENDATION_FINGERPRINT_VERIFICATION_SUPPORTED = true as const;
export const FINGERPRINT_MATCH_EQUALS_ENGINEERING_VALIDATED = false as const;
export const FINGERPRINT_MATCH_EQUALS_APPROVAL = false as const;
export const D9_R5_HISTORY_PRESERVED = true as const;
export const D9_R5_HISTORICAL_REFERENCE_AUTO_REPOINTED = false as const;
export const SILENT_D9_R5_MUTATION_ALLOWED = false as const;
export const D9_R5_HUMAN_REVIEW_SUPPORTED = true as const;
export const HUMAN_REVIEWED_RECOMMENDATION_EQUALS_ENGINEERING_DECISION = false as const;
export const HUMAN_ACCEPTED_RECOMMENDATION_EQUALS_APPROVED_ENGINEERING = false as const;
export const AI_CAN_MAKE_AUTHORITATIVE_CROSS_DISCIPLINE_DECISION = false as const;
export const AI_CAN_APPROVE_CROSS_DISCIPLINE_RESOLUTION = false as const;
export const AI_CAN_AUTO_APPLY_D9_RECOMMENDATION = false as const;
export const ADMIN_CAN_PROMOTE_RECOMMENDATION_TO_ENGINEERING_DECISION = false as const;
export const ADMIN_CAN_PROMOTE_RECOMMENDATION_TO_APPROVAL = false as const;
export const ADMIN_CAN_AUTO_APPLY_RECOMMENDATION_WITHOUT_ENGINEERING_AUTHORITY = false as const;
export const D9_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT = 0 as const;
export const D9_REVIEW_VALIDATION_RUNTIME_COUNT = 0 as const;
export const TENANT_WORKSPACE_PROJECT_D9_R5_SCOPE_ENFORCED = true as const;
export const CROSS_TENANT_D9_R5_ACCESS_ALLOWED = false as const;
export const D9_R5_DUPLICATE_GOVERNANCE_IMPLEMENTED = true as const;
export const D9_R5_REPLAY_PROTECTION_IMPLEMENTED = true as const;
export const D9_R5_SPOOFING_PROTECTION_IMPLEMENTED = true as const;
export const D9_R5_RECORDER_AUTHORITY = "D9_RECOMMENDATION_RECORDER" as const;
export const D9_R5_RECOMMENDATION_VERSION = "D9-R5-RECOMMENDATION-1" as const;
export const D9_R5_RECOMMENDATION_TYPES = ["ADVISORY"] as const;
export const D9_R5_REVIEW_STATUSES = ["UNREVIEWED", "REVIEWED", "ACCEPTED_AS_ADVICE"] as const;
export const D9_R5_CONFIDENCE_BANDS = ["LOW", "MODERATE", "HIGH"] as const;
export const D9_R6_CANONICAL_PHASE = D9_IMPLEMENTATION_PHASES[5];
export const D9_R6_PHASE_TYPE = D9_IMPLEMENTATION_PHASE_TYPES[5];
export const D9_R6_CANONICAL_SCOPE = "Provide a dedicated D9 currentness and digital-thread runtime over exact source, observation, conflict-candidate, governance, and recommendation revisions. Current is not validated. Stale is not invalid. Superseded is not invalid. A current conflict is not a resolved conflict. A current recommendation is not an engineering decision. A digital-thread relationship is not engineering authority. Lineage is not validation. A fingerprint match is not approval. Do not decide, approve, resolve, validate a discipline, or mutate a source record." as const;
export const D9_R6_STARTED = false as const;
export const D9_R5_READY_FOR_NEXT_PHASE = true as const;
export const D9_R5_NEXT_PHASE = D9_R6_CANONICAL_PHASE;
export const D9_R5_NEXT_PHASE_TYPE = D9_R6_PHASE_TYPE;
export const D9_R5_CANONICAL_NEXT_PHASE = D9_R6_CANONICAL_PHASE;
export const D9_R5_CANONICAL_NEXT_PHASE_SCOPE = D9_R6_CANONICAL_SCOPE;
export const D9_R5_BLOCKER = "NONE" as const;
export const D9_R5_MACHINE_READABLE_ROADMAP_UPDATED = true as const;
export const D9_R5_DATABASE_SCHEMA_CHANGED = false as const;
export const D9_R5_NEW_DEPENDENCY_ADDED = false as const;
export const EOS_ALL_DISCIPLINES_COMPLETE = false as const;
export const EOS_GA_READY = false as const;
export const D9_R5_PRESERVES_CLOSED_TRACKS = D6_STATUS === "COMPLETE_BOUNDED_WITH_LIMITATIONS" && D7_STATUS === "COMPLETE_BOUNDED_WITH_LIMITATIONS" && D8_STATUS === "COMPLETE_BOUNDED_WITH_LIMITATIONS" && D8_TRACK_COMPLETE === true && D8_REOPENED === false;
export { D9_CANONICAL_MILESTONE_COUNT, D9_CANONICAL_PHASE_LIST };

const FLOATING = new Set(["latest", "head", "floating", "tip", "unspecified", "current"]);
const CONCLUSION = /\b(therefore|incorrect|confirmed|recommend|approved|validated|escalate|decide|resolve)\b/i;

export type D9R5Actor = D9R1Actor;
export type D9R5AlternativeInput = { alternativeId: string; statement: string; rank: number };
export type D9R5Alternative = { alternativeId: string; statement: string; rank: number };
export type D9R5RecommendationInput = {
  recommendationId: string;
  recommendationType?: string;
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
  statement: string;
  rationale: string;
  evidence: string;
  assumptions: string;
  uncertainty: string;
  confidenceBand: string;
  alternatives: readonly D9R5AlternativeInput[];
  reviewStatus?: string;
  sourceBasisRef: string;
  provenanceRef: string;
  applicability: string;
  limitations: string;
  citedCurrentness: string;
  assertedFingerprint?: string | null;
  tenantId?: string;
  aiAssisted?: boolean;
  createDecision?: boolean;
  decisionId?: string;
  apply?: boolean;
  mutateDesign?: boolean;
  createDesignChange?: boolean;
  adoptRequirement?: boolean;
  changeRequirement?: boolean;
  promoteAssumption?: boolean;
  resolve?: boolean;
  decide?: boolean;
  approve?: boolean;
  validate?: boolean;
  design?: boolean;
  redesign?: boolean;
  optimize?: boolean;
  mutateSource?: boolean;
  repoint?: boolean;
  regenerate?: boolean;
  topRankIsDecision?: boolean;
  stripLimitations?: boolean;
  stripApplicability?: boolean;
  stripAssumptions?: boolean;
  stripProvenance?: boolean;
};

export type D9R5Recommendation = {
  recommendationId: string;
  recommendationType: "ADVISORY";
  recommendationVersion: typeof D9_R5_RECOMMENDATION_VERSION;
  governanceId: string;
  governanceFingerprint: string;
  candidateId: string;
  candidateFingerprint: string;
  observationId: string;
  observationFingerprint: string;
  sourceA: D9R4GovernanceRecord["sourceA"];
  sourceB: D9R4GovernanceRecord["sourceB"];
  statement: string;
  rationale: string;
  evidence: string;
  assumptions: string;
  uncertainty: string;
  confidenceBand: (typeof D9_R5_CONFIDENCE_BANDS)[number];
  alternatives: readonly D9R5Alternative[];
  topRank: number;
  reviewStatus: (typeof D9_R5_REVIEW_STATUSES)[number];
  sourceBasisRef: string;
  provenanceRef: string;
  applicability: string;
  limitations: string;
  d1Limitations: typeof D9_R1_D1_STANDING_LIMITATION;
  d1PackComplete: false;
  citedCurrentness: (typeof D9_CURRENTNESS_STATES)[number];
  sourceACurrentness: (typeof D9_CURRENTNESS_STATES)[number];
  sourceBCurrentness: (typeof D9_CURRENTNESS_STATES)[number];
  authority: { sourceA: string; sourceB: string; recorder: typeof D9_R5_RECORDER_AUTHORITY };
  threadLinks: readonly ({ kind: "GOVERNANCE"; governanceId: string; fingerprint: string } | { kind: "CANDIDATE"; candidateId: string; fingerprint: string } | { kind: "SOURCE"; contractId: string; exactRevision: string; fingerprint: string } | { kind: "OBSERVATION"; observationId: string; fingerprint: string })[];
  lineage: D9R4GovernanceRecord["lineage"];
  tenantId: string;
  workspaceId: string;
  projectId: string;
  fingerprint: string;
  aiProposed: boolean;
  reviewed: boolean;
  acceptedAsAdvice: boolean;
  engineeringDecision: false;
  approved: false;
  resolved: false;
  validated: false;
  applied: false;
  requirementAdopted: false;
  assumptionPromoted: false;
  assumptionEqualsFact: false;
  topRankEqualsDecision: false;
  topRankEqualsApproved: false;
  confidenceEqualsValidated: false;
  reviewedEqualsValidated: false;
  acceptedEqualsDecision: false;
  acceptedEqualsResolved: false;
  acceptedEqualsAutomaticChange: false;
  acceptedEqualsApproval: false;
  decisionCreated: false;
  canonicalDecisionGovernanceReused: true;
  authoritative: false;
  recordedAt: string;
};

export type D9R5History = { historyId: string; recommendationId: string; action: "CREATED"; fingerprint: string; recordedAt: string };
export type D9R5Store = { tenantId: string; workspaceId: string; projectId: string; now: () => string; recommendations: D9R5Recommendation[]; history: D9R5History[] };
export type D9R5AiDraft = { aiProposed: true; authoritative: false; engineeringDecision: false; uncertainty: string; limitations: string };

function fail(code: string): never {
  throw new Error(`D9_R5_${code}`);
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

function assertActor(actor: D9R5Actor, r1: D9R1Store, r2: D9R2Store, r3: D9R3Store, r4: D9R4Store, store: D9R5Store): void {
  if (!actor.actorId.trim() || actor.tenantId !== r1.tenantId || actor.workspaceId !== r1.workspaceId || actor.projectId !== r1.projectId) fail("SCOPE_REQUIRED");
  if (actor.tenantId !== r2.tenantId || actor.workspaceId !== r2.workspaceId || actor.projectId !== r2.projectId) fail("CROSS_SCOPE_REJECTED");
  if (actor.tenantId !== r3.tenantId || actor.workspaceId !== r3.workspaceId || actor.projectId !== r3.projectId) fail("CROSS_SCOPE_REJECTED");
  if (actor.tenantId !== r4.tenantId || actor.workspaceId !== r4.workspaceId || actor.projectId !== r4.projectId) fail("CROSS_SCOPE_REJECTED");
  if (actor.tenantId !== store.tenantId || actor.workspaceId !== store.workspaceId || actor.projectId !== store.projectId) fail("CROSS_SCOPE_REJECTED");
  if (blockedParty(actor.actorId) || blockedParty(actor.authority) || actor.actorKind === "ai") fail("AI_NOT_D9_AUTHORITY");
  if (actor.authority === "ADMIN" || actor.authority === "ADMINISTRATOR" || actor.actorId === "ADMIN") fail("ADMIN_CANNOT_OVERRIDE");
  if (actor.authority !== D9_R5_RECORDER_AUTHORITY) fail("RECORDER_AUTHORITY_REQUIRED");
}

function assertProhibited(input: D9R5RecommendationInput): void {
  if (input.resolve) fail("CONFLICT_RESOLUTION_REJECTED");
  if (input.decide || input.createDecision || input.decisionId) fail("DECISION_REJECTED");
  if (input.approve || input.validate) fail("VALIDATION_REJECTED");
  if (input.apply || input.mutateDesign || input.createDesignChange || input.design || input.redesign) fail("DESIGN_CHANGE_REJECTED");
  if (input.optimize) fail("OPTIMIZATION_REJECTED");
  if (input.adoptRequirement || input.changeRequirement) fail("REQUIREMENT_ADOPTION_REJECTED");
  if (input.promoteAssumption) fail("ASSUMPTION_PROMOTION_REJECTED");
  if (input.mutateSource) fail("SOURCE_MUTATION_REJECTED");
  if (input.repoint) fail("AUTO_REPOINT_REJECTED");
  if (input.regenerate) fail("AUTO_REGENERATE_REJECTED");
  if (input.topRankIsDecision) fail("RANK_AUTHORITY_REJECTED");
  if (input.stripLimitations) fail("LIMITATION_STRIPPING_REJECTED");
  if (input.stripApplicability) fail("APPLICABILITY_STRIPPING_REJECTED");
  if (input.stripAssumptions) fail("ASSUMPTION_STRIPPING_REJECTED");
  if (input.stripProvenance) fail("PROVENANCE_STRIPPING_REJECTED");
}

function findEntry(r1: D9R1Store, contractId: string, exactRevision: string, fingerprint: string): D9R1SourceEntry {
  const entry = r1.entries.find((row) => row.contractId === contractId && row.exactRevision === exactRevision && row.tenantId === r1.tenantId);
  if (!entry) fail("SOURCE_REVISION_NOT_ON_MANIFEST");
  if (entry.fingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  return entry;
}

function alternativesOf(input: readonly D9R5AlternativeInput[]): D9R5Alternative[] {
  if (input.length < 2) fail("ALTERNATIVES_REQUIRED");
  const rows = input.map((row) => ({
    alternativeId: explicit(row.alternativeId, "ALTERNATIVE_ID_REQUIRED"),
    statement: prose(row.statement, "ALTERNATIVE_STATEMENT_REQUIRED"),
    rank: row.rank,
  }));
  if (new Set(rows.map((row) => row.alternativeId)).size !== rows.length) fail("DUPLICATE_ALTERNATIVE_REJECTED");
  if (rows.some((row) => !Number.isInteger(row.rank) || row.rank < 1)) fail("RANK_SPOOFED");
  if (new Set(rows.map((row) => row.rank)).size !== rows.length) fail("RANK_SPOOFED");
  return rows.sort((left, right) => left.rank - right.rank);
}

export function createD9R5Store(r1: D9R1Store, r2: D9R2Store, r3: D9R3Store, r4: D9R4Store, now: () => string = () => r4.now()): D9R5Store {
  if (r1.tenantId !== r2.tenantId || r1.workspaceId !== r2.workspaceId || r1.projectId !== r2.projectId) fail("SCOPE_REQUIRED");
  if (r1.tenantId !== r3.tenantId || r1.workspaceId !== r3.workspaceId || r1.projectId !== r3.projectId) fail("SCOPE_REQUIRED");
  if (r1.tenantId !== r4.tenantId || r1.workspaceId !== r4.workspaceId || r1.projectId !== r4.projectId) fail("SCOPE_REQUIRED");
  if (!D9_R5_R4_RUNTIME_REMAINS_FOUR || !D9_R5_ARCHITECTURE_RECOMMENDATION_REMAINS_ZERO || D9_CANONICAL_MILESTONE_COUNT !== 9 || D9_R5_PHASE_TYPE !== "RECOMMENDATION_SUPPORT" || !D9_CANONICAL_PHASE_LIST.includes(D9_R5_PHASE)) fail("PHASE_LIST_UNEXPECTED");
  return { tenantId: r1.tenantId, workspaceId: r1.workspaceId, projectId: r1.projectId, now, recommendations: [], history: [] };
}

export function aiGenerateD9RecommendationCandidate(input: { uncertainty: string; limitations: string; evidence: string; decide?: boolean }): D9R5AiDraft {
  if (input.decide) fail("DECISION_REJECTED");
  const uncertainty = prose(input.uncertainty, "UNCERTAINTY_REQUIRED");
  const limitations = explicit(input.limitations, "LIMITATIONS_REQUIRED");
  explicit(input.evidence, "EVIDENCE_REQUIRED");
  return Object.freeze({ aiProposed: true as const, authoritative: false as const, engineeringDecision: false as const, uncertainty, limitations });
}

export function recordD9Recommendation(r1: D9R1Store, r2: D9R2Store, r3: D9R3Store, r4: D9R4Store, store: D9R5Store, actor: D9R5Actor, input: D9R5RecommendationInput): D9R5Recommendation {
  assertActor(actor, r1, r2, r3, r4, store);
  assertProhibited(input);
  if (input.tenantId != null && input.tenantId !== actor.tenantId) fail("CROSS_SCOPE_REJECTED");
  if ((input.recommendationType ?? "ADVISORY") !== "ADVISORY") fail("RECOMMENDATION_TYPE_SPOOFED");
  if (!(D9_R5_CONFIDENCE_BANDS as readonly string[]).includes(input.confidenceBand)) fail("CONFIDENCE_SPOOFED");
  const reviewStatus = input.reviewStatus ?? "UNREVIEWED";
  if (!(D9_R5_REVIEW_STATUSES as readonly string[]).includes(reviewStatus)) fail("REVIEW_SPOOFED");
  if (!(D9_CURRENTNESS_STATES as readonly string[]).includes(input.citedCurrentness)) fail("CURRENTNESS_INVALID");
  const governance = r4.records.find((row) => row.governanceId === input.governanceId && row.tenantId === store.tenantId);
  if (!governance) fail("GOVERNANCE_NOT_RECORDED");
  if (governance.fingerprint !== explicit(input.governanceFingerprint, "EXACT_CONFLICT_REVISION_REQUIRED")) fail("CONFLICT_REVISION_MISMATCH");
  const candidate = r3.candidates.find((row) => row.candidateId === input.candidateId && row.tenantId === store.tenantId);
  if (!candidate || candidate.fingerprint !== input.candidateFingerprint || candidate.candidateId !== governance.candidateId || candidate.fingerprint !== governance.candidateFingerprint) fail("CANDIDATE_REVISION_MISMATCH");
  const observation = r2.observations.find((row) => row.observationId === input.observationId && row.tenantId === store.tenantId);
  if (!observation || observation.fingerprint !== input.observationFingerprint || observation.observationId !== governance.observationId || observation.fingerprint !== governance.observationFingerprint) fail("OBSERVATION_REVISION_MISMATCH");
  const sourceARevision = explicit(input.sourceAExactRevision, "EXACT_REVISION_REQUIRED");
  const sourceBRevision = explicit(input.sourceBExactRevision, "EXACT_REVISION_REQUIRED");
  const sourceAContractId = explicit(input.sourceAContractId, "SOURCE_A_REQUIRED");
  const sourceBContractId = explicit(input.sourceBContractId, "SOURCE_B_REQUIRED");
  if (sourceAContractId !== governance.sourceA.contractId || sourceARevision !== governance.sourceA.exactRevision || input.sourceAFingerprint !== governance.sourceA.fingerprint) fail("EXACT_REVISION_MISMATCH");
  if (sourceBContractId !== governance.sourceB.contractId || sourceBRevision !== governance.sourceB.exactRevision || input.sourceBFingerprint !== governance.sourceB.fingerprint) fail("EXACT_REVISION_MISMATCH");
  const manifest = buildD9SourceManifest(r1);
  if (manifest.d1.packComplete || manifest.d1.limitations !== D9_R1_D1_STANDING_LIMITATION) fail("D1_LIMITATION_MISSING");
  const sourceAEntry = findEntry(r1, sourceAContractId, sourceARevision, input.sourceAFingerprint);
  const sourceBEntry = findEntry(r1, sourceBContractId, sourceBRevision, input.sourceBFingerprint);
  if (sourceAEntry.sourceDiscipline !== governance.sourceA.sourceDiscipline || sourceBEntry.sourceDiscipline !== governance.sourceB.sourceDiscipline) fail("SOURCE_DISCIPLINE_SPOOFED");
  if (sourceAEntry.objectId !== governance.sourceA.objectId || sourceBEntry.objectId !== governance.sourceB.objectId) fail("SOURCE_IDENTITY_SPOOFED");
  if (sourceAEntry.authority !== governance.sourceA.authority || sourceBEntry.authority !== governance.sourceB.authority) fail("AUTHORITY_SPOOFED");
  const alternatives = alternativesOf(input.alternatives);
  const statement = prose(input.statement, "STATEMENT_REQUIRED");
  const rationale = prose(input.rationale, "RATIONALE_REQUIRED");
  const evidence = prose(input.evidence, "EVIDENCE_REQUIRED");
  const assumptions = prose(input.assumptions, "ASSUMPTIONS_REQUIRED");
  const uncertainty = prose(input.uncertainty, "UNCERTAINTY_REQUIRED");
  const sourceBasisRef = explicit(input.sourceBasisRef, "SOURCE_BASIS_REQUIRED");
  const provenanceRef = explicit(input.provenanceRef, "PROVENANCE_REQUIRED");
  const applicability = explicit(input.applicability, "APPLICABILITY_REQUIRED");
  const limitations = explicit(input.limitations, "LIMITATIONS_REQUIRED");
  if (!evidence.includes(governance.governanceId) || !evidence.includes(sourceAContractId) || !evidence.includes(sourceBContractId) || !evidence.includes(candidate.candidateId)) fail("EVIDENCE_NOT_TRACEABLE");
  if (!sourceBasisRef.includes(governance.sourceBasisRef) || !sourceBasisRef.includes(governance.sourceA.sourceBasisRef) || !sourceBasisRef.includes(governance.sourceB.sourceBasisRef)) fail("SOURCE_BASIS_NOT_TRACEABLE");
  if (!provenanceRef.includes(governance.governanceId) || !provenanceRef.includes(candidate.candidateId) || !provenanceRef.includes(observation.observationId) || !provenanceRef.includes(sourceAContractId) || !provenanceRef.includes(sourceBContractId) || !provenanceRef.includes(D9_R5_RECOMMENDATION_VERSION)) fail("PROVENANCE_NOT_TRACEABLE");
  if (!applicability.includes(governance.applicability)) fail("APPLICABILITY_NOT_PRESERVED");
  if (!limitations.includes(governance.limitations) || !limitations.includes(governance.sourceA.limitations) || !limitations.includes(governance.sourceB.limitations) || !limitations.includes(D9_R1_D1_STANDING_LIMITATION)) fail("SOURCE_LIMITATION_NOT_PRESERVED");
  const sourceA = { ...governance.sourceA, lineage: governance.sourceA.lineage.map((row) => ({ ...row })), sourceValues: governance.sourceA.sourceValues.map((row) => ({ ...row })) };
  const sourceB = { ...governance.sourceB, lineage: governance.sourceB.lineage.map((row) => ({ ...row })), sourceValues: governance.sourceB.sourceValues.map((row) => ({ ...row })) };
  const topRank = alternatives[0]?.rank ?? 1;
  const body = {
    recommendationType: "ADVISORY" as const,
    recommendationVersion: D9_R5_RECOMMENDATION_VERSION,
    governanceId: governance.governanceId,
    governanceFingerprint: governance.fingerprint,
    candidateId: candidate.candidateId,
    candidateFingerprint: candidate.fingerprint,
    observationId: observation.observationId,
    observationFingerprint: observation.fingerprint,
    sourceA,
    sourceB,
    statement,
    rationale,
    evidence,
    assumptions,
    uncertainty,
    confidenceBand: input.confidenceBand as (typeof D9_R5_CONFIDENCE_BANDS)[number],
    alternatives,
    topRank,
    reviewStatus: reviewStatus as (typeof D9_R5_REVIEW_STATUSES)[number],
    sourceBasisRef,
    provenanceRef,
    applicability,
    limitations,
    d1Limitations: manifest.d1.limitations,
    d1PackComplete: false as const,
    citedCurrentness: input.citedCurrentness as (typeof D9_CURRENTNESS_STATES)[number],
    sourceACurrentness: sourceA.currentness,
    sourceBCurrentness: sourceB.currentness,
    authority: { sourceA: sourceA.authority, sourceB: sourceB.authority, recorder: D9_R5_RECORDER_AUTHORITY },
    threadLinks: [
      { kind: "GOVERNANCE" as const, governanceId: governance.governanceId, fingerprint: governance.fingerprint },
      { kind: "CANDIDATE" as const, candidateId: candidate.candidateId, fingerprint: candidate.fingerprint },
      { kind: "SOURCE" as const, contractId: sourceA.contractId, exactRevision: sourceA.exactRevision, fingerprint: sourceA.fingerprint },
      { kind: "SOURCE" as const, contractId: sourceB.contractId, exactRevision: sourceB.exactRevision, fingerprint: sourceB.fingerprint },
      { kind: "OBSERVATION" as const, observationId: observation.observationId, fingerprint: observation.fingerprint },
    ],
    lineage: [...sourceA.lineage, ...sourceB.lineage],
    tenantId: store.tenantId,
    workspaceId: store.workspaceId,
    projectId: store.projectId,
    aiProposed: input.aiAssisted === true,
    reviewed: reviewStatus !== "UNREVIEWED",
    acceptedAsAdvice: reviewStatus === "ACCEPTED_AS_ADVICE",
    engineeringDecision: false as const,
    approved: false as const,
    resolved: false as const,
    validated: false as const,
    applied: false as const,
    requirementAdopted: false as const,
    assumptionPromoted: false as const,
    assumptionEqualsFact: false as const,
    topRankEqualsDecision: false as const,
    topRankEqualsApproved: false as const,
    confidenceEqualsValidated: false as const,
    reviewedEqualsValidated: false as const,
    acceptedEqualsDecision: false as const,
    acceptedEqualsResolved: false as const,
    acceptedEqualsAutomaticChange: false as const,
    acceptedEqualsApproval: false as const,
    decisionCreated: false as const,
    canonicalDecisionGovernanceReused: true as const,
    authoritative: false as const,
    digitalThreadModule: D9_R5_DIGITAL_THREAD_MODULE,
  };
  const fingerprint = fingerprintCanonical(body);
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const recommendationId = explicit(input.recommendationId, "RECOMMENDATION_ID_REQUIRED");
  const existing = store.recommendations.find((row) => row.recommendationId === recommendationId);
  if (existing) return existing.fingerprint === fingerprint ? existing : fail("REPLAY_REJECTED");
  if (store.recommendations.some((row) => row.governanceId === governance.governanceId && row.governanceFingerprint === governance.fingerprint && row.statement === statement)) fail("DUPLICATE_RECOMMENDATION_REJECTED");
  const recommendation: D9R5Recommendation = Object.freeze({ ...body, recommendationId, fingerprint, recordedAt: store.now() });
  store.recommendations.push(recommendation);
  store.history.push({ historyId: `d9-r5-hist-${store.history.length + 1}`, recommendationId, action: "CREATED", fingerprint, recordedAt: recommendation.recordedAt });
  return recommendation;
}

export function readD9Recommendations(r1: D9R1Store, r2: D9R2Store, r3: D9R3Store, r4: D9R4Store, store: D9R5Store, actor: D9R5Actor): readonly D9R5Recommendation[] {
  assertActor(actor, r1, r2, r3, r4, store);
  return store.recommendations.filter((row) => row.tenantId === actor.tenantId && row.workspaceId === actor.workspaceId && row.projectId === actor.projectId);
}

export function applyD9Recommendation(): never { return fail("DESIGN_CHANGE_REJECTED"); }
export function decideFromD9Recommendation(): never { return fail("DECISION_REJECTED"); }
export function approveD9Recommendation(): never { return fail("VALIDATION_REJECTED"); }
export function resolveFromD9Recommendation(): never { return fail("CONFLICT_RESOLUTION_REJECTED"); }
export function regenerateD9Recommendation(): never { return fail("AUTO_REGENERATE_REJECTED"); }
export function repointD9Recommendation(): never { return fail("AUTO_REPOINT_REJECTED"); }
export function mutateD9RecommendationSource(): never { return fail("SOURCE_MUTATION_REJECTED"); }
export function adoptRequirementFromD9Recommendation(): never { return fail("REQUIREMENT_ADOPTION_REJECTED"); }
export function promoteAssumptionFromD9Recommendation(): never { return fail("ASSUMPTION_PROMOTION_REJECTED"); }
