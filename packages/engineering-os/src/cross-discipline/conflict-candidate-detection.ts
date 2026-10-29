/**
 * EOS-D9-R3 governed conflict-candidate detection.
 * One bounded runtime over the exact D9-R1 source revision manifest and explicit D9-R2 observations.
 * A candidate is provisional. Detection does not confirm, resolve, escalate, recommend, decide, or approve.
 */
import {
  D8_REOPENED,
  D9_CANONICAL_MILESTONE_COUNT,
  D9_CANONICAL_PHASE_LIST,
  D9_CONFLICT_CANDIDATE_EQUALS_CONFIRMED_ENGINEERING_CONFLICT as ARCHITECTURE_CANDIDATE_EQUALS_CONFIRMED,
  D9_CONFLICT_CLASSES,
  D9_CONFLICT_DETECTION_RUNTIME_COUNT as ARCHITECTURE_DETECTION_COUNT,
  D9_CURRENTNESS_STATES,
  D9_DIGITAL_THREAD_MODULE,
  D9_FINGERPRINT_ALGORITHM,
  D9_IMPLEMENTATION_PHASE_TYPES,
  D9_IMPLEMENTATION_PHASES,
} from "@rtb/types";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import {
  D1_STRUCTURAL_PACK_COMPLETE,
  D6_STATUS,
  D7_STATUS,
  D8_STATUS,
  D8_TRACK_COMPLETE,
} from "../instrumentation-control/instrumentation-control-bounded-closeout";
import {
  D9_CONFLICT_DETECTION_RUNTIME_COUNT as R2_DETECTION_COUNT,
  D9_CROSS_DISCIPLINE_OBSERVATION_RUNTIME_COUNT,
  D9_CROSS_DISCIPLINE_OBSERVATION_RUNTIME_READY,
  D9_R3_CANONICAL_PHASE,
  D9_R3_PHASE_TYPE,
  D9_R3_STARTED,
  D9_RUNTIME_COUNT as R2_RUNTIME_COUNT,
  D9_SOURCE_CONTRACT_READ_MODEL_RUNTIME_COUNT,
  D9_SOURCE_CONTRACT_READ_MODEL_RUNTIME_READY,
  type D9R2Actor,
  type D9R2Endpoint,
  type D9R2Observation,
  type D9R2Store,
} from "./cross-discipline-observation";
import {
  D9_R1_D1_STANDING_LIMITATION,
  buildD9SourceManifest,
  type D9R1Actor,
  type D9R1SourceEntry,
  type D9R1Store,
} from "./source-contract-read-model";

export const D9_R3_STATUS = "CONFLICT_CANDIDATE_DETECTION_IMPLEMENTED" as const;
export const D9_R3_MATURITY = D9_R3_STATUS;
export const D9_R3_MATURITY_STATE = D9_R3_STATUS;
export const D9_R3_CLOSEOUT_PATH = "docs/architecture/engineering-os/EOS_D9_R3_CONFLICT_CANDIDATE_DETECTION_CLOSEOUT.md" as const;
export const D9_R3_PHASE = D9_R3_CANONICAL_PHASE;
export const D9_CONFLICT_CANDIDATE_DETECTION_RUNTIME_IMPLEMENTED = true as const;
export const D9_CONFLICT_DETECTION_RUNTIME_COUNT = 1 as const;
export const D9_CONFLICT_CANDIDATE_DETECTION_RUNTIME_READY = true as const;
export const D9_RUNTIME_STARTED = true as const;
export const D9_RUNTIME_COUNT = 3 as const;
export const D9_R3_R2_RUNTIME_REMAINS_TWO = R2_RUNTIME_COUNT === 2 && R2_DETECTION_COUNT === 0 && D9_R3_STARTED === false && D9_CROSS_DISCIPLINE_OBSERVATION_RUNTIME_COUNT === 1 && D9_CROSS_DISCIPLINE_OBSERVATION_RUNTIME_READY === true && D9_SOURCE_CONTRACT_READ_MODEL_RUNTIME_COUNT === 1 && D9_SOURCE_CONTRACT_READ_MODEL_RUNTIME_READY === true;
export const D9_R3_ARCHITECTURE_DETECTION_REMAINS_ZERO = ARCHITECTURE_DETECTION_COUNT === 0 && ARCHITECTURE_CANDIDATE_EQUALS_CONFIRMED === false;
export { D9_CROSS_DISCIPLINE_OBSERVATION_RUNTIME_COUNT, D9_CROSS_DISCIPLINE_OBSERVATION_RUNTIME_READY, D9_SOURCE_CONTRACT_READ_MODEL_RUNTIME_COUNT, D9_SOURCE_CONTRACT_READ_MODEL_RUNTIME_READY };
export const D9_R3_USES_R1_SOURCE_REVISION_MANIFEST = true as const;
export const D9_R3_EXACT_SOURCE_REVISION_REQUIRED = true as const;
export const D9_R3_FLOATING_SOURCE_REFERENCE_ALLOWED = false as const;
export const D9_R3_SOURCE_AUTO_REPOINTED = false as const;
export const D9_R3_USES_R2_OBSERVATIONS = true as const;
export const D9_R3_EXACT_OBSERVATION_REVISION_REQUIRED = true as const;
export const D9_R3_OBSERVATION_AUTO_REPOINTED = false as const;
export const D9_CONFLICT_CANDIDATE_RECORD_IMPLEMENTED = true as const;
export const D9_CONFLICT_CANDIDATE_EQUALS_CONFIRMED_ENGINEERING_CONFLICT = false as const;
export const D9_CONFLICT_CANDIDATE_EQUALS_ENGINEERING_FACT = false as const;
export const D9_R3_DETECTION_BASIS_REQUIRED = true as const;
export const D9_R3_DETECTION_BASIS_TRACEABLE = true as const;
export const D9_R3_CANDIDATE_REQUIRES_EXPLICIT_SOURCE_REFERENCES = true as const;
export const D9_R3_CANDIDATE_REQUIRES_EXACT_SOURCE_REVISIONS = true as const;
export const D9_R3_PRESERVES_SOURCE_DISCIPLINE = true as const;
export const D9_R3_PRESERVES_SOURCE_IDENTITY = true as const;
export const D9_R3_PRESERVES_SOURCE_OBJECT_TYPE = true as const;
export const D9_R3_PRESERVES_D1_INCOMPLETE_STATUS = D1_STRUCTURAL_PACK_COMPLETE === false;
export const D9_R3_PRESERVES_D1_LIMITATIONS = true as const;
export const D9_TREATS_D1_STRUCTURAL_AS_COMPLETE = false as const;
export const D9_IGNORES_D1_STRUCTURAL_LIMITATIONS = false as const;
export const D9_R3_REUSES_CANONICAL_CONFLICT_TAXONOMY = true as const;
export const PARALLEL_D9_CONFLICT_TAXONOMY_CREATED = false as const;
export const D9_R3_DETECTION_RULE_REQUIRED = true as const;
export const D9_R3_DETECTION_RULE_TRACEABLE = true as const;
export const D9_R3_DETECTION_VERSION = "D9-R3-DETECTION-1" as const;
export const D9_R3_DETECTION_RULES = [
  { ruleId: "EXPLICIT_DIFFERENCE_CURRENTNESS_STATE", conflictClass: "CURRENTNESS_MISMATCH", observationType: "EXPLICIT_DIFFERENCE" },
  { ruleId: "EXPLICIT_RELATIONSHIP_REVISION_BINDING", conflictClass: "SOURCE_REVISION_MISMATCH", observationType: "EXPLICIT_RELATIONSHIP" },
] as const;
export const D9_R3_SEVERITY_CONTEXTS = ["INFORMATIONAL", "REVIEW_CONTEXT"] as const;
export const D9_R3_CONFIDENCE_BANDS = ["LOW", "MODERATE", "HIGH"] as const;
export const AI_CAN_PROPOSE_D9_CONFLICT_CANDIDATE = true as const;
export const AI_PROPOSED_CONFLICT_CANDIDATE_EQUALS_CONFIRMED_CONFLICT = false as const;
export const AI_CAN_CONFIRM_ENGINEERING_CONFLICT = false as const;
export const D9_R3_CONFIRMS_ENGINEERING_CONFLICT = false as const;
export const ADMIN_CAN_CONFIRM_ENGINEERING_CONFLICT_WITHOUT_AUTHORITY = false as const;
export const D9_CONFLICT_RESOLUTION_RUNTIME_COUNT = 0 as const;
export const D9_AUTOMATIC_CONFLICT_RESOLUTION_RUNTIME_COUNT = 0 as const;
export const D9_R3_PERFORMS_CONFLICT_RESOLUTION = false as const;
export const D9_CONFLICT_GOVERNANCE_ESCALATION_RUNTIME_COUNT = 0 as const;
export const D9_R3_CREATES_ENGINEERING_ESCALATION = false as const;
export const D9_RECOMMENDATION_RUNTIME_COUNT = 0 as const;
export const D9_R3_GENERATES_ENGINEERING_RECOMMENDATION = false as const;
export const D9_R3_GENERATES_CROSS_DISCIPLINE_RECOMMENDATION = false as const;
export const D9_ENGINEERING_DECISION_RUNTIME_COUNT = 0 as const;
export const D9_R3_MAKES_ENGINEERING_DECISION = false as const;
export const D9_R3_CANDIDATE_UNCERTAINTY_EXPLICIT = true as const;
export const HIGH_CONFIDENCE_CONFLICT_CANDIDATE_EQUALS_CONFIRMED_CONFLICT = false as const;
export const LOW_UNCERTAINTY_EQUALS_ENGINEERING_VALIDATED = false as const;
export const D9_R3_CANDIDATE_SEVERITY_CONTEXT_SUPPORTED = true as const;
export const CANDIDATE_SEVERITY_EQUALS_APPROVED_ENGINEERING_PRIORITY = false as const;
export const CANDIDATE_SEVERITY_EQUALS_ESCALATION = false as const;
export const D9_R3_SOURCE_BASIS_REQUIRED = true as const;
export const D9_R3_SOURCE_BASIS_TRACEABLE = true as const;
export const D9_R3_PROVENANCE_REQUIRED = true as const;
export const D9_R3_PROVENANCE_PRESERVED = true as const;
export const D9_R3_APPLICABILITY_EXPLICIT = true as const;
export const D9_R3_AUTO_PROPAGATES_OUTSIDE_APPLICABILITY = false as const;
export const D9_R3_LIMITATIONS_EXPLICIT = true as const;
export const D9_R3_SOURCE_LIMITATIONS_PRESERVED = true as const;
export const D9_R3_CAN_SILENTLY_DROP_SOURCE_LIMITATIONS = false as const;
export const D9_REUSES_CANONICAL_CURRENTNESS = true as const;
export const PARALLEL_D9_CURRENTNESS_ENGINE_CREATED = false as const;
export const D9_R3_CANDIDATE_CURRENTNESS_INTEGRATED = true as const;
export const CURRENT_CONFLICT_CANDIDATE_EQUALS_CONFIRMED_CONFLICT = false as const;
export const STALE_CONFLICT_CANDIDATE_EQUALS_FALSE = false as const;
export const SUPERSEDED_CONFLICT_CANDIDATE_EQUALS_INVALID = false as const;
export const D9_R3_SOURCE_CHANGE_AUTO_REPOINTS_CANDIDATE = false as const;
export const D9_R3_SOURCE_CHANGE_AUTO_RECOMPUTES_CANDIDATE = false as const;
export const D9_R3_SOURCE_CHANGE_AUTO_CONFIRMS_CANDIDATE = false as const;
export const D9_R3_OBSERVATION_CHANGE_AUTO_REPOINTS_CANDIDATE = false as const;
export const D9_R3_OBSERVATION_CHANGE_AUTO_RECOMPUTES_CANDIDATE = false as const;
export const D9_REUSES_CANONICAL_DIGITAL_THREAD = true as const;
export const D9_R3_DIGITAL_THREAD_MODULE = D9_DIGITAL_THREAD_MODULE;
export const PARALLEL_D9_DIGITAL_THREAD_CREATED = false as const;
export const D9_EXPLICIT_LINEAGE_REQUIRED = true as const;
export const D9_INFERRED_LINEAGE_ALLOWED = false as const;
export const D9_R3_CANDIDATE_LINEAGE_PRESERVED = true as const;
export const D9_REUSES_CANONICAL_FINGERPRINT = D9_FINGERPRINT_ALGORITHM === "fingerprintCanonical";
export const SECOND_D9_FINGERPRINT_ALGORITHM_CREATED = false as const;
export const D9_R3_CANDIDATE_FINGERPRINT_VERIFICATION_SUPPORTED = true as const;
export const FINGERPRINT_MATCH_EQUALS_CONFIRMED_CONFLICT = false as const;
export const FINGERPRINT_MATCH_EQUALS_VALIDATED = false as const;
export const FINGERPRINT_MATCH_EQUALS_APPROVED = false as const;
export const D9_R3_HISTORY_PRESERVED = true as const;
export const D9_R3_HISTORICAL_REFERENCE_AUTO_REPOINTED = false as const;
export const SILENT_D9_R3_MUTATION_ALLOWED = false as const;
export const D9_R3_PERFORMS_AUTOMATIC_ENGINEERING_DESIGN = false as const;
export const D9_R3_PERFORMS_AUTOMATIC_ENGINEERING_REDESIGN = false as const;
export const D9_R3_COMPARISON_EQUALS_ENGINEERING_CALCULATION = false as const;
export const D9_R3_DETECTION_EQUALS_ENGINEERING_VALIDATION = false as const;
export const D9_R3_SOURCE_UNITS_PRESERVED = true as const;
export const D9_R3_UNGOVERNED_UNIT_CONVERSION_ALLOWED = false as const;
export const D9_R3_SOURCE_VALUES_PRESERVED = true as const;
export const D9_R3_CORRECTS_SOURCE_ENGINEERING_VALUE = false as const;
export const D9_R3_INFERS_MISSING_ENGINEERING_VALUE = false as const;
export const D9_R3_INFERS_AUTHORITATIVE_RELATIONSHIP_FROM_NAME = false as const;
export const D9_R3_INFERS_AUTHORITATIVE_RELATIONSHIP_FROM_TAG = false as const;
export const D9_R3_INFERS_AUTHORITATIVE_RELATIONSHIP_FROM_DOCUMENT_PROXIMITY = false as const;
export const D9_R3_INFERS_AUTHORITATIVE_RELATIONSHIP_FROM_SEMANTIC_SIMILARITY = false as const;
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
export const AI_CAN_PROMOTE_CONFLICT_CANDIDATE_TO_ENGINEERING_FACT = false as const;
export const AI_CAN_MAKE_AUTHORITATIVE_CROSS_DISCIPLINE_DECISION = false as const;
export const AI_CAN_APPROVE_CROSS_DISCIPLINE_RESOLUTION = false as const;
export const ADMIN_CAN_PROMOTE_CONFLICT_CANDIDATE_TO_CONFIRMED_CONFLICT_WITHOUT_AUTHORITY = false as const;
export const ADMIN_CAN_PROMOTE_CONFLICT_CANDIDATE_TO_APPROVAL = false as const;
export const D9_AUTO_VALIDATES_D1_STRUCTURAL = false as const;
export const D9_AUTO_VALIDATES_D2_CIVIL = false as const;
export const D9_AUTO_VALIDATES_D3_GEOTECHNICAL = false as const;
export const D9_AUTO_VALIDATES_D4_MECHANICAL = false as const;
export const D9_AUTO_VALIDATES_D5_PIPING = false as const;
export const D9_AUTO_VALIDATES_D6_PROCESS = false as const;
export const D9_AUTO_VALIDATES_D7_ELECTRICAL = false as const;
export const D9_AUTO_VALIDATES_D8_IAC = false as const;
export const D9_R3_AUTO_MUTATES_D1_STRUCTURAL = false as const;
export const D9_R3_AUTO_MUTATES_D2_CIVIL = false as const;
export const D9_R3_AUTO_MUTATES_D3_GEOTECHNICAL = false as const;
export const D9_R3_AUTO_MUTATES_D4_MECHANICAL = false as const;
export const D9_R3_AUTO_MUTATES_D5_PIPING = false as const;
export const D9_R3_AUTO_MUTATES_D6_PROCESS = false as const;
export const D9_R3_AUTO_MUTATES_D7_ELECTRICAL = false as const;
export const D9_R3_AUTO_MUTATES_D8_IAC = false as const;
export const D9_CONFORMANCE_DETERMINATION_RUNTIME_COUNT = 0 as const;
export const D9_APPROVAL_RUNTIME_COUNT = 0 as const;
export const D9_CERTIFICATION_RUNTIME_COUNT = 0 as const;
export const D9_AUTOMATIC_ENGINEERING_DESIGN_RUNTIME_COUNT = 0 as const;
export const D9_AUTOMATIC_ENGINEERING_REDESIGN_RUNTIME_COUNT = 0 as const;
export const D9_ENGINEERING_OPTIMIZATION_RUNTIME_COUNT = 0 as const;
export const D9_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT = 0 as const;
export const D9_REVIEW_VALIDATION_RUNTIME_COUNT = 0 as const;
export const D9_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT = 0 as const;
export const TENANT_WORKSPACE_PROJECT_D9_R3_SCOPE_ENFORCED = true as const;
export const CROSS_TENANT_D9_R3_ACCESS_ALLOWED = false as const;
export const D9_R3_DUPLICATE_GOVERNANCE_IMPLEMENTED = true as const;
export const D9_R3_REPLAY_PROTECTION_IMPLEMENTED = true as const;
export const D9_R3_SPOOFING_PROTECTION_IMPLEMENTED = true as const;
export const D9_R3_RECORDER_AUTHORITY = "D9_CONFLICT_CANDIDATE_RECORDER" as const;
export const D9_R4_CANONICAL_PHASE = D9_IMPLEMENTATION_PHASES[3];
export const D9_R4_PHASE_TYPE = D9_IMPLEMENTATION_PHASE_TYPES[3];
export const D9_R4_CANONICAL_SCOPE =
  "Govern human handling of conflict candidates, including confirmation status, ownership, escalation, and disposition. A conflict candidate is not a confirmed engineering conflict. A confirmed engineering conflict is not a resolved conflict. An escalation is not an engineering decision, an approval, or conflict resolution. Closing a conflict is not engineering validation. Do not automatically resolve conflicts, recommend engineering solutions, make engineering decisions, approve designs, validate a discipline, or mutate a source record." as const;
export const D9_R4_STARTED = false as const;
export const D9_R3_READY_FOR_NEXT_PHASE = true as const;
export const D9_R3_NEXT_PHASE = D9_R4_CANONICAL_PHASE;
export const D9_R3_NEXT_PHASE_TYPE = D9_R4_PHASE_TYPE;
export const D9_R3_CANONICAL_NEXT_PHASE = D9_R4_CANONICAL_PHASE;
export const D9_R3_CANONICAL_NEXT_PHASE_SCOPE = D9_R4_CANONICAL_SCOPE;
export const D9_R3_BLOCKER = "NONE" as const;
export const D9_R3_MACHINE_READABLE_ROADMAP_UPDATED = true as const;
export const D9_R3_DATABASE_SCHEMA_CHANGED = false as const;
export const D9_R3_NEW_DEPENDENCY_ADDED = false as const;
export const EOS_ALL_DISCIPLINES_COMPLETE = false as const;
export const EOS_GA_READY = false as const;
export const D9_R3_PRESERVES_CLOSED_TRACKS = D6_STATUS === "COMPLETE_BOUNDED_WITH_LIMITATIONS" && D7_STATUS === "COMPLETE_BOUNDED_WITH_LIMITATIONS" && D8_STATUS === "COMPLETE_BOUNDED_WITH_LIMITATIONS" && D8_TRACK_COMPLETE === true && D8_REOPENED === false;
export { D9_CANONICAL_MILESTONE_COUNT, D9_CANONICAL_PHASE_LIST, D9_CONFLICT_CLASSES };

const FLOATING = new Set(["latest", "head", "floating", "tip", "unspecified", "current"]);
const CONCLUSION = /\b(therefore|incorrect|confirmed|recommend|approved|validated|escalate|decide|resolve)\b/i;

export type D9R3Actor = D9R1Actor;
export type D9R3RuleId = (typeof D9_R3_DETECTION_RULES)[number]["ruleId"];
export type D9R3CandidateInput = {
  candidateId: string;
  detectionRuleId: string;
  observationId: string;
  observationFingerprint: string;
  sourceAContractId: string;
  sourceAExactRevision: string;
  sourceAFingerprint: string;
  sourceBContractId: string;
  sourceBExactRevision: string;
  sourceBFingerprint: string;
  conflictClass?: string;
  detectedInconsistency: string;
  uncertainty: string;
  confidenceBand: string;
  severityContext: string;
  sourceBasisRef: string;
  provenanceRef: string;
  applicability: string;
  limitations: string;
  citedCurrentness: string;
  assertedFingerprint?: string | null;
  tenantId?: string;
  aiAssisted?: boolean;
  semanticSimilarity?: boolean;
  confirm?: boolean;
  confirmed?: boolean;
  resolve?: boolean;
  escalate?: boolean;
  recommend?: boolean;
  decide?: boolean;
  approve?: boolean;
  certify?: boolean;
  validate?: boolean;
  promoteFact?: boolean;
  design?: boolean;
  redesign?: boolean;
  optimize?: boolean;
  mutateSource?: boolean;
  repoint?: boolean;
  recompute?: boolean;
  convertUnits?: boolean;
  correctValue?: boolean;
  fillMissing?: boolean;
  inferFromName?: boolean;
  inferFromTag?: boolean;
  documentProximity?: boolean;
  numericCompare?: boolean;
  stripLimitations?: boolean;
  stripApplicability?: boolean;
  stripProvenance?: boolean;
};

export type D9R3ThreadLink =
  | { kind: "SOURCE"; contractId: string; exactRevision: string; fingerprint: string }
  | { kind: "OBSERVATION"; observationId: string; fingerprint: string };

export type D9R3Candidate = {
  candidateId: string;
  conflictClass: (typeof D9_CONFLICT_CLASSES)[number];
  detectionRuleId: D9R3RuleId;
  detectionVersion: typeof D9_R3_DETECTION_VERSION;
  detectionBasis: string;
  manifestFingerprint: string;
  observationId: string;
  observationFingerprint: string;
  sourceA: D9R2Endpoint;
  sourceB: D9R2Endpoint;
  detectedInconsistency: string;
  uncertainty: string;
  confidenceBand: (typeof D9_R3_CONFIDENCE_BANDS)[number];
  severityContext: (typeof D9_R3_SEVERITY_CONTEXTS)[number];
  sourceBasisRef: string;
  provenanceRef: string;
  applicability: string;
  limitations: string;
  d1Limitations: typeof D9_R1_D1_STANDING_LIMITATION;
  d1PackComplete: false;
  citedCurrentness: (typeof D9_CURRENTNESS_STATES)[number];
  sourceACurrentness: (typeof D9_CURRENTNESS_STATES)[number];
  sourceBCurrentness: (typeof D9_CURRENTNESS_STATES)[number];
  observationCitedCurrentness: (typeof D9_CURRENTNESS_STATES)[number];
  threadLinks: readonly D9R3ThreadLink[];
  lineage: D9R2Endpoint["lineage"];
  authority: { sourceA: string; sourceB: string; recorder: typeof D9_R3_RECORDER_AUTHORITY };
  tenantId: string;
  workspaceId: string;
  projectId: string;
  fingerprint: string;
  aiProposed: boolean;
  similaritySignalUsed: boolean;
  similaritySignalAuthoritative: false;
  authoritative: false;
  confirmedConflict: false;
  engineeringFact: false;
  escalation: false;
  recommendation: false;
  engineeringDecision: false;
  approved: false;
  validated: false;
  resolved: false;
  severityEqualsEscalation: false;
  severityEqualsApprovedPriority: false;
  confidenceEqualsConfirmedConflict: false;
  recordedAt: string;
};

export type D9R3History = { historyId: string; candidateId: string; action: "CREATED"; fingerprint: string; recordedAt: string };
export type D9R3Store = {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  now: () => string;
  candidates: D9R3Candidate[];
  history: D9R3History[];
};

export type D9R3AiProposal = {
  aiProposed: true;
  confirmedConflict: false;
  authoritative: false;
  uncertainty: string;
};

function fail(code: string): never {
  throw new Error(`D9_R3_${code}`);
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

function assertActor(actor: D9R3Actor, r1: D9R1Store, r2: D9R2Store, store: D9R3Store): void {
  if (!actor.actorId.trim() || actor.tenantId !== r1.tenantId || actor.workspaceId !== r1.workspaceId || actor.projectId !== r1.projectId) fail("SCOPE_REQUIRED");
  if (actor.tenantId !== r2.tenantId || actor.workspaceId !== r2.workspaceId || actor.projectId !== r2.projectId) fail("CROSS_SCOPE_REJECTED");
  if (actor.tenantId !== store.tenantId || actor.workspaceId !== store.workspaceId || actor.projectId !== store.projectId) fail("CROSS_SCOPE_REJECTED");
  if (blockedParty(actor.actorId) || blockedParty(actor.authority) || actor.actorKind === "ai") fail("AI_NOT_D9_AUTHORITY");
  if (actor.authority === "ADMIN" || actor.authority === "ADMINISTRATOR" || actor.actorId === "ADMIN") fail("ADMIN_CANNOT_OVERRIDE");
  if (actor.authority !== D9_R3_RECORDER_AUTHORITY) fail("RECORDER_AUTHORITY_REQUIRED");
}

function assertProhibited(input: D9R3CandidateInput): void {
  if (input.confirm || input.confirmed) fail("CONFLICT_CONFIRMATION_REJECTED");
  if (input.resolve) fail("CONFLICT_RESOLUTION_REJECTED");
  if (input.escalate) fail("ESCALATION_REJECTED");
  if (input.recommend) fail("RECOMMENDATION_REJECTED");
  if (input.decide) fail("DECISION_REJECTED");
  if (input.approve || input.certify || input.validate || input.promoteFact) fail("VALIDATION_REJECTED");
  if (input.design || input.redesign || input.optimize) fail("DESIGN_REJECTED");
  if (input.mutateSource) fail("SOURCE_MUTATION_REJECTED");
  if (input.repoint) fail("AUTO_REPOINT_REJECTED");
  if (input.recompute) fail("AUTO_RECOMPUTE_REJECTED");
  if (input.convertUnits) fail("UNIT_CONVERSION_REJECTED");
  if (input.correctValue || input.fillMissing) fail("VALUE_INFERENCE_REJECTED");
  if (input.inferFromName || input.inferFromTag || input.documentProximity) fail("INFERRED_RELATIONSHIP_REJECTED");
  if (input.semanticSimilarity && !input.aiAssisted) fail("INFERRED_RELATIONSHIP_REJECTED");
  if (input.numericCompare) fail("COMPARISON_IS_NOT_CALCULATION");
  if (input.stripLimitations) fail("LIMITATION_STRIPPING_REJECTED");
  if (input.stripApplicability) fail("APPLICABILITY_STRIPPING_REJECTED");
  if (input.stripProvenance) fail("PROVENANCE_STRIPPING_REJECTED");
}

function copyEndpoint(endpoint: D9R2Endpoint): D9R2Endpoint {
  return {
    ...endpoint,
    lineage: endpoint.lineage.map((row) => ({ ...row })),
    sourceValues: endpoint.sourceValues.map((row) => ({ ...row })),
  };
}

function findEntry(r1: D9R1Store, contractId: string, exactRevision: string, fingerprint: string): D9R1SourceEntry {
  const entry = r1.entries.find((row) => row.contractId === contractId && row.exactRevision === exactRevision && row.tenantId === r1.tenantId);
  if (!entry) fail("SOURCE_REVISION_NOT_ON_MANIFEST");
  if (entry.fingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  return entry;
}

function revisionsAlign(observation: D9R2Observation, rel: D9R1SourceEntry["relationships"][number]): boolean {
  const forward = rel.sourceEndpointId === observation.sourceA.objectId && rel.sourceRevision === observation.sourceA.exactRevision && rel.targetEndpointId === observation.sourceB.objectId && rel.targetRevision === observation.sourceB.exactRevision;
  const reverse = rel.sourceEndpointId === observation.sourceB.objectId && rel.sourceRevision === observation.sourceB.exactRevision && rel.targetEndpointId === observation.sourceA.objectId && rel.targetRevision === observation.sourceA.exactRevision;
  return forward || reverse;
}

function ruleHolds(ruleId: string, observation: D9R2Observation, sourceA: D9R1SourceEntry, sourceB: D9R1SourceEntry): boolean {
  if (ruleId === "EXPLICIT_DIFFERENCE_CURRENTNESS_STATE") {
    return observation.observationType === "EXPLICIT_DIFFERENCE" && observation.sourceA.currentness !== observation.sourceB.currentness;
  }
  if (ruleId === "EXPLICIT_RELATIONSHIP_REVISION_BINDING") {
    if (observation.observationType !== "EXPLICIT_RELATIONSHIP" || !observation.relationshipId) return false;
    const rel = [...sourceA.relationships, ...sourceB.relationships].find((row) => row.relationshipId === observation.relationshipId);
    return rel != null && !revisionsAlign(observation, rel);
  }
  return false;
}

export function createD9R3Store(r1: D9R1Store, r2: D9R2Store, now: () => string = () => r2.now()): D9R3Store {
  if (r1.tenantId !== r2.tenantId || r1.workspaceId !== r2.workspaceId || r1.projectId !== r2.projectId) fail("SCOPE_REQUIRED");
  if (!D9_R3_R2_RUNTIME_REMAINS_TWO || !D9_R3_ARCHITECTURE_DETECTION_REMAINS_ZERO || D9_CANONICAL_MILESTONE_COUNT !== 9 || D9_R3_PHASE_TYPE !== "CONFLICT_CANDIDATE_DETECTION" || !D9_CANONICAL_PHASE_LIST.includes(D9_R3_PHASE)) fail("PHASE_LIST_UNEXPECTED");
  for (const rule of D9_R3_DETECTION_RULES) {
    if (!(D9_CONFLICT_CLASSES as readonly string[]).includes(rule.conflictClass)) fail("TAXONOMY_REJECTED");
  }
  return { tenantId: r1.tenantId, workspaceId: r1.workspaceId, projectId: r1.projectId, now, candidates: [], history: [] };
}

export function aiProposeD9ConflictCandidate(input: { uncertainty: string; confirm?: boolean }): D9R3AiProposal {
  if (input.confirm) fail("CONFLICT_CONFIRMATION_REJECTED");
  const uncertainty = prose(input.uncertainty, "UNCERTAINTY_REQUIRED");
  return Object.freeze({ aiProposed: true as const, confirmedConflict: false as const, authoritative: false as const, uncertainty });
}

export function recordD9ConflictCandidate(r1: D9R1Store, r2: D9R2Store, store: D9R3Store, actor: D9R3Actor, input: D9R3CandidateInput): D9R3Candidate {
  assertActor(actor, r1, r2, store);
  assertProhibited(input);
  if (input.tenantId != null && input.tenantId !== actor.tenantId) fail("CROSS_SCOPE_REJECTED");
  const rule = D9_R3_DETECTION_RULES.find((row) => row.ruleId === input.detectionRuleId);
  if (!rule) fail("DETECTION_RULE_REQUIRED");
  if (!(D9_CONFLICT_CLASSES as readonly string[]).includes(rule.conflictClass)) fail("TAXONOMY_REJECTED");
  if (input.conflictClass != null && input.conflictClass !== rule.conflictClass) fail("CANDIDATE_TYPE_SPOOFED");
  if (!(D9_R3_CONFIDENCE_BANDS as readonly string[]).includes(input.confidenceBand)) fail("CONFIDENCE_SPOOFED");
  if (!(D9_R3_SEVERITY_CONTEXTS as readonly string[]).includes(input.severityContext)) fail("SEVERITY_SPOOFED");
  if (!(D9_CURRENTNESS_STATES as readonly string[]).includes(input.citedCurrentness)) fail("CURRENTNESS_INVALID");
  const observation = r2.observations.find((row) => row.observationId === input.observationId && row.tenantId === store.tenantId);
  if (!observation) fail("OBSERVATION_NOT_RECORDED");
  if (observation.fingerprint !== input.observationFingerprint) fail("OBSERVATION_REVISION_MISMATCH");
  if (observation.observationType !== rule.observationType) fail("DETECTION_RULE_NOT_SATISFIED");
  const sourceARevision = explicit(input.sourceAExactRevision, "EXACT_REVISION_REQUIRED");
  const sourceBRevision = explicit(input.sourceBExactRevision, "EXACT_REVISION_REQUIRED");
  const sourceAContractId = explicit(input.sourceAContractId, "SOURCE_A_REQUIRED");
  const sourceBContractId = explicit(input.sourceBContractId, "SOURCE_B_REQUIRED");
  if (sourceAContractId !== observation.sourceA.contractId || sourceARevision !== observation.sourceA.exactRevision || input.sourceAFingerprint !== observation.sourceA.fingerprint) fail("EXACT_REVISION_MISMATCH");
  if (sourceBContractId !== observation.sourceB.contractId || sourceBRevision !== observation.sourceB.exactRevision || input.sourceBFingerprint !== observation.sourceB.fingerprint) fail("EXACT_REVISION_MISMATCH");
  const manifest = buildD9SourceManifest(r1);
  if (manifest.d1.packComplete || manifest.d1.limitations !== D9_R1_D1_STANDING_LIMITATION) fail("D1_LIMITATION_MISSING");
  const sourceAEntry = findEntry(r1, sourceAContractId, sourceARevision, input.sourceAFingerprint);
  const sourceBEntry = findEntry(r1, sourceBContractId, sourceBRevision, input.sourceBFingerprint);
  if (sourceAEntry.sourceDiscipline !== observation.sourceA.sourceDiscipline || sourceBEntry.sourceDiscipline !== observation.sourceB.sourceDiscipline) fail("SOURCE_DISCIPLINE_SPOOFED");
  if (sourceAEntry.objectId !== observation.sourceA.objectId || sourceBEntry.objectId !== observation.sourceB.objectId) fail("SOURCE_IDENTITY_SPOOFED");
  if (sourceAEntry.objectType !== observation.sourceA.objectType || sourceBEntry.objectType !== observation.sourceB.objectType) fail("SOURCE_OBJECT_TYPE_SPOOFED");
  if (!ruleHolds(rule.ruleId, observation, sourceAEntry, sourceBEntry)) fail("DETECTION_RULE_NOT_SATISFIED");
  const sourceA = copyEndpoint(observation.sourceA);
  const sourceB = copyEndpoint(observation.sourceB);
  const detectedInconsistency = prose(input.detectedInconsistency, "DETECTED_INCONSISTENCY_REQUIRED");
  const uncertainty = prose(input.uncertainty, "UNCERTAINTY_REQUIRED");
  const sourceBasisRef = explicit(input.sourceBasisRef, "SOURCE_BASIS_REQUIRED");
  const provenanceRef = explicit(input.provenanceRef, "PROVENANCE_REQUIRED");
  const applicability = explicit(input.applicability, "APPLICABILITY_REQUIRED");
  const limitations = explicit(input.limitations, "LIMITATIONS_REQUIRED");
  if (!detectedInconsistency.includes(rule.ruleId) || !detectedInconsistency.includes(sourceA.contractId) || !detectedInconsistency.includes(sourceB.contractId)) fail("DETECTION_BASIS_NOT_TRACEABLE");
  if (!sourceBasisRef.includes(observation.sourceBasisRef) || !sourceBasisRef.includes(sourceA.sourceBasisRef) || !sourceBasisRef.includes(sourceB.sourceBasisRef)) fail("SOURCE_BASIS_NOT_TRACEABLE");
  if (!provenanceRef.includes(sourceA.contractId) || !provenanceRef.includes(sourceB.contractId) || !provenanceRef.includes(observation.observationId) || !provenanceRef.includes(rule.ruleId) || !provenanceRef.includes(D9_R3_DETECTION_VERSION)) fail("PROVENANCE_NOT_TRACEABLE");
  if (!applicability.includes(observation.applicability)) fail("APPLICABILITY_NOT_PRESERVED");
  if (!limitations.includes(sourceA.limitations) || !limitations.includes(sourceB.limitations) || !limitations.includes(observation.limitations) || !limitations.includes(D9_R1_D1_STANDING_LIMITATION)) fail("SOURCE_LIMITATION_NOT_PRESERVED");
  const detectionBasis = `${rule.ruleId}@${D9_R3_DETECTION_VERSION}`;
  const body = {
    conflictClass: rule.conflictClass,
    detectionRuleId: rule.ruleId,
    detectionVersion: D9_R3_DETECTION_VERSION,
    detectionBasis,
    manifestFingerprint: manifest.fingerprint,
    observationId: observation.observationId,
    observationFingerprint: observation.fingerprint,
    sourceA,
    sourceB,
    detectedInconsistency,
    uncertainty,
    confidenceBand: input.confidenceBand as (typeof D9_R3_CONFIDENCE_BANDS)[number],
    severityContext: input.severityContext as (typeof D9_R3_SEVERITY_CONTEXTS)[number],
    sourceBasisRef,
    provenanceRef,
    applicability,
    limitations,
    d1Limitations: manifest.d1.limitations,
    d1PackComplete: false as const,
    citedCurrentness: input.citedCurrentness as (typeof D9_CURRENTNESS_STATES)[number],
    sourceACurrentness: sourceA.currentness,
    sourceBCurrentness: sourceB.currentness,
    observationCitedCurrentness: observation.citedCurrentness,
    threadLinks: [
      { kind: "SOURCE" as const, contractId: sourceA.contractId, exactRevision: sourceA.exactRevision, fingerprint: sourceA.fingerprint },
      { kind: "SOURCE" as const, contractId: sourceB.contractId, exactRevision: sourceB.exactRevision, fingerprint: sourceB.fingerprint },
      { kind: "OBSERVATION" as const, observationId: observation.observationId, fingerprint: observation.fingerprint },
    ],
    lineage: [...sourceA.lineage, ...sourceB.lineage],
    authority: { sourceA: sourceA.authority, sourceB: sourceB.authority, recorder: D9_R3_RECORDER_AUTHORITY },
    tenantId: store.tenantId,
    workspaceId: store.workspaceId,
    projectId: store.projectId,
    aiProposed: input.aiAssisted === true,
    similaritySignalUsed: input.semanticSimilarity === true,
    similaritySignalAuthoritative: false as const,
    authoritative: false as const,
    confirmedConflict: false as const,
    engineeringFact: false as const,
    escalation: false as const,
    recommendation: false as const,
    engineeringDecision: false as const,
    approved: false as const,
    validated: false as const,
    resolved: false as const,
    severityEqualsEscalation: false as const,
    severityEqualsApprovedPriority: false as const,
    confidenceEqualsConfirmedConflict: false as const,
    digitalThreadModule: D9_R3_DIGITAL_THREAD_MODULE,
  };
  const fingerprint = fingerprintCanonical(body);
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const candidateId = explicit(input.candidateId, "CANDIDATE_ID_REQUIRED");
  const existing = store.candidates.find((row) => row.candidateId === candidateId);
  if (existing) return existing.fingerprint === fingerprint ? existing : fail("REPLAY_REJECTED");
  const binding = `${observation.observationId}|${rule.ruleId}|${sourceA.exactRevision}|${sourceB.exactRevision}`;
  if (store.candidates.some((row) => `${row.observationId}|${row.detectionRuleId}|${row.sourceA.exactRevision}|${row.sourceB.exactRevision}` === binding)) fail("DUPLICATE_CANDIDATE_REJECTED");
  const candidate: D9R3Candidate = Object.freeze({ ...body, candidateId, fingerprint, recordedAt: store.now() });
  store.candidates.push(candidate);
  store.history.push({ historyId: `d9-r3-hist-${store.history.length + 1}`, candidateId, action: "CREATED", fingerprint, recordedAt: candidate.recordedAt });
  return candidate;
}

export function readD9ConflictCandidates(r1: D9R1Store, r2: D9R2Store, store: D9R3Store, actor: D9R3Actor): readonly D9R3Candidate[] {
  assertActor(actor, r1, r2, store);
  return store.candidates.filter((row) => row.tenantId === actor.tenantId && row.workspaceId === actor.workspaceId && row.projectId === actor.projectId);
}

export function repointD9ConflictCandidate(): never { return fail("AUTO_REPOINT_REJECTED"); }
export function recomputeD9ConflictCandidate(): never { return fail("AUTO_RECOMPUTE_REJECTED"); }
export function confirmD9ConflictCandidate(): never { return fail("CONFLICT_CONFIRMATION_REJECTED"); }
export function resolveD9ConflictCandidate(): never { return fail("CONFLICT_RESOLUTION_REJECTED"); }
export function escalateD9ConflictCandidate(): never { return fail("ESCALATION_REJECTED"); }
export function recommendFromD9ConflictCandidate(): never { return fail("RECOMMENDATION_REJECTED"); }
export function decideFromD9ConflictCandidate(): never { return fail("DECISION_REJECTED"); }
export function approveD9ConflictCandidate(): never { return fail("VALIDATION_REJECTED"); }
export function validateFromD9ConflictCandidate(): never { return fail("VALIDATION_REJECTED"); }
export function designFromD9ConflictCandidate(): never { return fail("DESIGN_REJECTED"); }
export function redesignFromD9ConflictCandidate(): never { return fail("DESIGN_REJECTED"); }
export function mutateD9ConflictCandidateSource(): never { return fail("SOURCE_MUTATION_REJECTED"); }
export function convertD9ConflictCandidateUnits(): never { return fail("UNIT_CONVERSION_REJECTED"); }
export function inferAuthoritativeRelationshipFromName(): never { return fail("INFERRED_RELATIONSHIP_REJECTED"); }
