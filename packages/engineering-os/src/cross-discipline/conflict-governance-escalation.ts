/**
 * EOS-D9-R4 conflict governance and escalation.
 * One bounded runtime for human handling of exact D9-R3 conflict candidates.
 * Governance status is not resolution, recommendation, decision, approval, validation, or source mutation.
 */
import {
  CONFLICT_CONFIRMED_EQUALS_CONFLICT_RESOLVED as ARCHITECTURE_CONFIRMED_EQUALS_RESOLVED,
  D8_REOPENED,
  D9_CANONICAL_MILESTONE_COUNT,
  D9_CANONICAL_PHASE_LIST,
  D9_CONFLICT_CANDIDATE_EQUALS_CONFIRMED_ENGINEERING_CONFLICT as ARCHITECTURE_CANDIDATE_EQUALS_CONFIRMED,
  D9_CONFLICT_DETECTION_RUNTIME_COUNT as ARCHITECTURE_DETECTION_COUNT,
  D9_CURRENTNESS_STATES,
  D9_DIGITAL_THREAD_MODULE,
  D9_ESCALATION_EQUALS_APPROVAL as ARCHITECTURE_ESCALATION_EQUALS_APPROVAL,
  D9_ESCALATION_EQUALS_CONFLICT_RESOLUTION as ARCHITECTURE_ESCALATION_EQUALS_RESOLUTION,
  D9_ESCALATION_EQUALS_ENGINEERING_DECISION as ARCHITECTURE_ESCALATION_EQUALS_DECISION,
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
  D9_CONFLICT_CANDIDATE_DETECTION_RUNTIME_READY,
  D9_CONFLICT_DETECTION_RUNTIME_COUNT as R3_DETECTION_COUNT,
  D9_CONFLICT_GOVERNANCE_ESCALATION_RUNTIME_COUNT as R3_ESCALATION_COUNT,
  D9_CROSS_DISCIPLINE_OBSERVATION_RUNTIME_COUNT,
  D9_CROSS_DISCIPLINE_OBSERVATION_RUNTIME_READY,
  D9_R4_CANONICAL_PHASE,
  D9_R4_PHASE_TYPE,
  D9_R4_STARTED,
  D9_RUNTIME_COUNT as R3_RUNTIME_COUNT,
  D9_SOURCE_CONTRACT_READ_MODEL_RUNTIME_COUNT,
  D9_SOURCE_CONTRACT_READ_MODEL_RUNTIME_READY,
  type D9R3Candidate,
  type D9R3Store,
} from "./conflict-candidate-detection";
import { type D9R2Store } from "./cross-discipline-observation";
import {
  D9_R1_D1_STANDING_LIMITATION,
  buildD9SourceManifest,
  type D9R1Actor,
  type D9R1SourceEntry,
  type D9R1Store,
} from "./source-contract-read-model";

export const D9_R4_STATUS = "CONFLICT_GOVERNANCE_AND_ESCALATION_IMPLEMENTED" as const;
export const D9_R4_MATURITY = D9_R4_STATUS;
export const D9_R4_MATURITY_STATE = D9_R4_STATUS;
export const D9_R4_CLOSEOUT_PATH = "docs/architecture/engineering-os/EOS_D9_R4_CONFLICT_GOVERNANCE_AND_ESCALATION_CLOSEOUT.md" as const;
export const D9_R4_PHASE = D9_R4_CANONICAL_PHASE;
export const D9_CONFLICT_GOVERNANCE_ESCALATION_RUNTIME_IMPLEMENTED = true as const;
export const D9_CONFLICT_GOVERNANCE_ESCALATION_RUNTIME_COUNT = 1 as const;
export const D9_CONFLICT_GOVERNANCE_ESCALATION_RUNTIME_READY = true as const;
export const D9_RUNTIME_STARTED = true as const;
export const D9_RUNTIME_COUNT = 4 as const;
export const D9_R4_R3_RUNTIME_REMAINS_THREE = R3_RUNTIME_COUNT === 3 && R3_DETECTION_COUNT === 1 && R3_ESCALATION_COUNT === 0 && D9_R4_STARTED === false && D9_CONFLICT_CANDIDATE_DETECTION_RUNTIME_READY === true && D9_CROSS_DISCIPLINE_OBSERVATION_RUNTIME_COUNT === 1 && D9_CROSS_DISCIPLINE_OBSERVATION_RUNTIME_READY === true && D9_SOURCE_CONTRACT_READ_MODEL_RUNTIME_COUNT === 1 && D9_SOURCE_CONTRACT_READ_MODEL_RUNTIME_READY === true;
export const D9_R4_ARCHITECTURE_BOUNDARIES_REMAIN = ARCHITECTURE_DETECTION_COUNT === 0 && ARCHITECTURE_CANDIDATE_EQUALS_CONFIRMED === false && ARCHITECTURE_CONFIRMED_EQUALS_RESOLVED === false && ARCHITECTURE_ESCALATION_EQUALS_DECISION === false && ARCHITECTURE_ESCALATION_EQUALS_APPROVAL === false && ARCHITECTURE_ESCALATION_EQUALS_RESOLUTION === false;
export { D9_CONFLICT_CANDIDATE_DETECTION_RUNTIME_READY, R3_DETECTION_COUNT as D9_CONFLICT_DETECTION_RUNTIME_COUNT, D9_CROSS_DISCIPLINE_OBSERVATION_RUNTIME_COUNT, D9_CROSS_DISCIPLINE_OBSERVATION_RUNTIME_READY, D9_SOURCE_CONTRACT_READ_MODEL_RUNTIME_COUNT, D9_SOURCE_CONTRACT_READ_MODEL_RUNTIME_READY };
export const D9_R4_USES_R3_CONFLICT_CANDIDATES = true as const;
export const D9_R4_EXACT_CANDIDATE_REVISION_REQUIRED = true as const;
export const D9_R4_FLOATING_CANDIDATE_REFERENCE_ALLOWED = false as const;
export const D9_R4_CANDIDATE_AUTO_REPOINTED = false as const;
export const D9_R4_PRESERVES_R1_SOURCE_REVISION_MANIFEST = true as const;
export const D9_R4_EXACT_SOURCE_REVISION_REQUIRED = true as const;
export const D9_R4_SOURCE_AUTO_REPOINTED = false as const;
export const D9_R4_PRESERVES_R2_OBSERVATION_REFERENCES = true as const;
export const D9_R4_EXACT_OBSERVATION_REVISION_REQUIRED = true as const;
export const D9_R4_OBSERVATION_AUTO_REPOINTED = false as const;
export const D9_CONFLICT_GOVERNANCE_RECORD_IMPLEMENTED = true as const;
export const D9_R4_CANDIDATE_REVIEW_SUPPORTED = true as const;
export const D9_R4_CANDIDATE_REVIEW_REQUIRES_HUMAN_AUTHORITY = true as const;
export const CANDIDATE_REVIEWED_EQUALS_CONFIRMED_CONFLICT = false as const;
export const CANDIDATE_REVIEWED_EQUALS_RESOLVED_CONFLICT = false as const;
export const D9_R4_CONFLICT_CONFIRMATION_STATUS_SUPPORTED = true as const;
export const D9_R4_CONFLICT_CONFIRMATION_REQUIRES_AUTHORITY = true as const;
export const D9_R4_CONFLICT_CONFIRMATION_AUTHORITY_TRACEABLE = true as const;
export const CONFLICT_CANDIDATE_EQUALS_CONFIRMED_ENGINEERING_CONFLICT = false as const;
export const CONFIRMED_ENGINEERING_CONFLICT_EQUALS_CONFLICT_RESOLVED = false as const;
export const AI_CAN_CONFIRM_ENGINEERING_CONFLICT = false as const;
export const AI_CAN_PROMOTE_CANDIDATE_TO_CONFIRMED_CONFLICT = false as const;
export const ADMIN_CAN_CONFIRM_ENGINEERING_CONFLICT_WITHOUT_AUTHORITY = false as const;
export const ADMIN_CAN_PROMOTE_CANDIDATE_TO_CONFIRMED_CONFLICT_WITHOUT_AUTHORITY = false as const;
export const D9_R4_CONFIRMATION_BASIS_REQUIRED = true as const;
export const D9_R4_CONFIRMATION_BASIS_TRACEABLE = true as const;
export const D9_R4_CONFLICT_OWNERSHIP_SUPPORTED = true as const;
export const D9_R4_CONFLICT_OWNER_EXPLICIT = true as const;
export const CONFLICT_OWNER_EQUALS_SOURCE_DISCIPLINE_AUTHORITY = false as const;
export const D9_R4_RESPONSIBLE_DISCIPLINE_CONTEXT_SUPPORTED = true as const;
export const RESPONSIBLE_DISCIPLINE_ASSIGNMENT_EQUALS_ENGINEERING_DECISION = false as const;
export const RESPONSIBLE_DISCIPLINE_ASSIGNMENT_EQUALS_AUTHORITY_TRANSFER = false as const;
export const D9_R4_ESCALATION_CONTEXT_IMPLEMENTED = true as const;
export const D9_ESCALATION_EQUALS_ENGINEERING_DECISION = false as const;
export const D9_ESCALATION_EQUALS_APPROVAL = false as const;
export const D9_ESCALATION_EQUALS_CONFLICT_RESOLUTION = false as const;
export const D9_ESCALATION_EQUALS_ENGINEERING_VALIDATION = false as const;
export const D9_R4_ESCALATION_AUTHORITY_REQUIRED = true as const;
export const D9_R4_ESCALATION_AUTHORITY_TRACEABLE = true as const;
export const D9_R4_DISPOSITION_CONTEXT_IMPLEMENTED = true as const;
export const DISPOSITION_EQUALS_ENGINEERING_DECISION = false as const;
export const DISPOSITION_EQUALS_CONFLICT_RESOLUTION = false as const;
export const DISPOSITION_EQUALS_APPROVAL = false as const;
export const D9_R4_CONFLICT_CLOSURE_GOVERNANCE_IMPLEMENTED = true as const;
export const D9_R4_CONFLICT_CLOSURE_AUTHORITY_REQUIRED = true as const;
export const CONFLICT_CLOSED_EQUALS_ENGINEERING_VALIDATED = false as const;
export const CONFLICT_CLOSED_EQUALS_DISCIPLINE_VALIDATED = false as const;
export const CONFLICT_CLOSED_EQUALS_APPROVED = false as const;
export const CONFLICT_CLOSED_EQUALS_CONFORMANT = false as const;
export const D9_CONFLICT_RESOLUTION_RUNTIME_COUNT = 0 as const;
export const D9_AUTOMATIC_CONFLICT_RESOLUTION_RUNTIME_COUNT = 0 as const;
export const D9_R4_PERFORMS_AUTOMATIC_CONFLICT_RESOLUTION = false as const;
export const D9_R4_GENERATES_RESOLUTION_ENGINEERING = false as const;
export const D9_RECOMMENDATION_RUNTIME_COUNT = 0 as const;
export const D9_R4_GENERATES_ENGINEERING_RECOMMENDATION = false as const;
export const D9_R4_GENERATES_CROSS_DISCIPLINE_RECOMMENDATION = false as const;
export const D9_ENGINEERING_DECISION_RUNTIME_COUNT = 0 as const;
export const D9_R4_MAKES_ENGINEERING_DECISION = false as const;
export const D9_APPROVAL_RUNTIME_COUNT = 0 as const;
export const D9_R4_APPROVES_ENGINEERING = false as const;
export const D9_R4_PRESERVES_D1_INCOMPLETE_STATUS = D1_STRUCTURAL_PACK_COMPLETE === false;
export const D9_R4_PRESERVES_D1_LIMITATIONS = true as const;
export const D9_TREATS_D1_STRUCTURAL_AS_COMPLETE = false as const;
export const D9_IGNORES_D1_STRUCTURAL_LIMITATIONS = false as const;
export const D9_R4_PRESERVES_SOURCE_DISCIPLINE = true as const;
export const D9_R4_PRESERVES_SOURCE_IDENTITY = true as const;
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
export const D9_R4_AUTO_MUTATES_D1_STRUCTURAL = false as const;
export const D9_R4_AUTO_MUTATES_D2_CIVIL = false as const;
export const D9_R4_AUTO_MUTATES_D3_GEOTECHNICAL = false as const;
export const D9_R4_AUTO_MUTATES_D4_MECHANICAL = false as const;
export const D9_R4_AUTO_MUTATES_D5_PIPING = false as const;
export const D9_R4_AUTO_MUTATES_D6_PROCESS = false as const;
export const D9_R4_AUTO_MUTATES_D7_ELECTRICAL = false as const;
export const D9_R4_AUTO_MUTATES_D8_IAC = false as const;
export const D9_AUTOMATIC_ENGINEERING_DESIGN_RUNTIME_COUNT = 0 as const;
export const D9_AUTOMATIC_ENGINEERING_REDESIGN_RUNTIME_COUNT = 0 as const;
export const D9_ENGINEERING_OPTIMIZATION_RUNTIME_COUNT = 0 as const;
export const D9_R4_SOURCE_BASIS_REQUIRED = true as const;
export const D9_R4_SOURCE_BASIS_TRACEABLE = true as const;
export const D9_R4_PROVENANCE_REQUIRED = true as const;
export const D9_R4_PROVENANCE_PRESERVED = true as const;
export const D9_R4_APPLICABILITY_EXPLICIT = true as const;
export const D9_R4_AUTO_PROPAGATES_OUTSIDE_APPLICABILITY = false as const;
export const D9_R4_LIMITATIONS_EXPLICIT = true as const;
export const D9_R4_SOURCE_LIMITATIONS_PRESERVED = true as const;
export const D9_R4_CAN_SILENTLY_DROP_SOURCE_LIMITATIONS = false as const;
export const D9_REUSES_CANONICAL_CURRENTNESS = true as const;
export const PARALLEL_D9_CURRENTNESS_ENGINE_CREATED = false as const;
export const D9_R4_CONFLICT_GOVERNANCE_CURRENTNESS_INTEGRATED = true as const;
export const CURRENT_CONFIRMED_CONFLICT_EQUALS_RESOLVED_CONFLICT = false as const;
export const STALE_CONFIRMED_CONFLICT_EQUALS_FALSE = false as const;
export const SUPERSEDED_CONFLICT_RECORD_EQUALS_INVALID = false as const;
export const D9_R4_SOURCE_CHANGE_AUTO_REPOINTS_CONFLICT = false as const;
export const D9_R4_SOURCE_CHANGE_AUTO_RESOLVES_CONFLICT = false as const;
export const D9_R4_SOURCE_CHANGE_AUTO_CLOSES_CONFLICT = false as const;
export const D9_R4_CANDIDATE_CHANGE_AUTO_REPOINTS_GOVERNANCE = false as const;
export const D9_R4_CANDIDATE_CHANGE_AUTO_RECONFIRMS_CONFLICT = false as const;
export const D9_REUSES_CANONICAL_DIGITAL_THREAD = true as const;
export const D9_R4_DIGITAL_THREAD_MODULE = D9_DIGITAL_THREAD_MODULE;
export const PARALLEL_D9_DIGITAL_THREAD_CREATED = false as const;
export const D9_EXPLICIT_LINEAGE_REQUIRED = true as const;
export const D9_INFERRED_LINEAGE_ALLOWED = false as const;
export const D9_R4_CONFLICT_GOVERNANCE_LINEAGE_PRESERVED = true as const;
export const D9_REUSES_CANONICAL_FINGERPRINT = D9_FINGERPRINT_ALGORITHM === "fingerprintCanonical";
export const SECOND_D9_FINGERPRINT_ALGORITHM_CREATED = false as const;
export const D9_R4_CONFLICT_GOVERNANCE_FINGERPRINT_VERIFICATION_SUPPORTED = true as const;
export const FINGERPRINT_MATCH_EQUALS_CONFIRMED_CONFLICT = false as const;
export const FINGERPRINT_MATCH_EQUALS_RESOLVED = false as const;
export const FINGERPRINT_MATCH_EQUALS_VALIDATED = false as const;
export const FINGERPRINT_MATCH_EQUALS_APPROVED = false as const;
export const D9_R4_HISTORY_PRESERVED = true as const;
export const D9_R4_HISTORICAL_REFERENCE_AUTO_REPOINTED = false as const;
export const SILENT_D9_R4_MUTATION_ALLOWED = false as const;
export const AI_CAN_RESOLVE_ENGINEERING_CONFLICT = false as const;
export const AI_CAN_MAKE_AUTHORITATIVE_CROSS_DISCIPLINE_DECISION = false as const;
export const AI_CAN_APPROVE_CROSS_DISCIPLINE_RESOLUTION = false as const;
export const ADMIN_CAN_RESOLVE_ENGINEERING_CONFLICT_WITHOUT_AUTHORITY = false as const;
export const ADMIN_CAN_PROMOTE_ESCALATION_TO_APPROVAL = false as const;
export const D9_AUTO_VALIDATES_D1_STRUCTURAL = false as const;
export const D9_AUTO_VALIDATES_D2_CIVIL = false as const;
export const D9_AUTO_VALIDATES_D3_GEOTECHNICAL = false as const;
export const D9_AUTO_VALIDATES_D4_MECHANICAL = false as const;
export const D9_AUTO_VALIDATES_D5_PIPING = false as const;
export const D9_AUTO_VALIDATES_D6_PROCESS = false as const;
export const D9_AUTO_VALIDATES_D7_ELECTRICAL = false as const;
export const D9_AUTO_VALIDATES_D8_IAC = false as const;
export const D9_CONFORMANCE_DETERMINATION_RUNTIME_COUNT = 0 as const;
export const D9_CERTIFICATION_RUNTIME_COUNT = 0 as const;
export const D9_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT = 0 as const;
export const D9_REVIEW_VALIDATION_RUNTIME_COUNT = 0 as const;
export const TENANT_WORKSPACE_PROJECT_D9_R4_SCOPE_ENFORCED = true as const;
export const CROSS_TENANT_D9_R4_ACCESS_ALLOWED = false as const;
export const D9_R4_DUPLICATE_GOVERNANCE_IMPLEMENTED = true as const;
export const D9_R4_REPLAY_PROTECTION_IMPLEMENTED = true as const;
export const D9_R4_SPOOFING_PROTECTION_IMPLEMENTED = true as const;
export const D9_R4_RECORDER_AUTHORITY = "D9_CONFLICT_GOVERNANCE_RECORDER" as const;
export const D9_R4_GOVERNANCE_VERSION = "D9-R4-GOVERNANCE-1" as const;
export const D9_R4_ACTIONS = ["REVIEW", "CONFIRM", "ASSIGN_OWNER", "ASSIGN_DISCIPLINE", "ESCALATE", "DISPOSE", "CLOSE"] as const;
export const D9_R4_DISPOSITIONS = ["ACKNOWLEDGED", "HELD", "RETURNED_FOR_EVIDENCE"] as const;
export const D9_R4_SEVERITY_CONTEXTS = ["INFORMATIONAL", "REVIEW_CONTEXT"] as const;
export const D9_R5_CANONICAL_PHASE = D9_IMPLEMENTATION_PHASES[4];
export const D9_R5_PHASE_TYPE = D9_IMPLEMENTATION_PHASE_TYPES[4];
export const D9_R5_CANONICAL_SCOPE =
  "Provide bounded, evidence-traceable recommendation support for governed conflicts. A recommendation is not an engineering decision, an approval, conflict resolution, or an automatic design change. Preserve human engineering authority, exact source revisions, applicability, and limitations. Do not decide, approve, resolve a conflict, validate a discipline, or mutate a source record." as const;
export const D9_R5_STARTED = false as const;
export const D9_R4_READY_FOR_NEXT_PHASE = true as const;
export const D9_R4_NEXT_PHASE = D9_R5_CANONICAL_PHASE;
export const D9_R4_NEXT_PHASE_TYPE = D9_R5_PHASE_TYPE;
export const D9_R4_CANONICAL_NEXT_PHASE = D9_R5_CANONICAL_PHASE;
export const D9_R4_CANONICAL_NEXT_PHASE_SCOPE = D9_R5_CANONICAL_SCOPE;
export const D9_R4_BLOCKER = "NONE" as const;
export const D9_R4_MACHINE_READABLE_ROADMAP_UPDATED = true as const;
export const D9_R4_DATABASE_SCHEMA_CHANGED = false as const;
export const D9_R4_NEW_DEPENDENCY_ADDED = false as const;
export const EOS_ALL_DISCIPLINES_COMPLETE = false as const;
export const EOS_GA_READY = false as const;
export const D9_R4_PRESERVES_CLOSED_TRACKS = D6_STATUS === "COMPLETE_BOUNDED_WITH_LIMITATIONS" && D7_STATUS === "COMPLETE_BOUNDED_WITH_LIMITATIONS" && D8_STATUS === "COMPLETE_BOUNDED_WITH_LIMITATIONS" && D8_TRACK_COMPLETE === true && D8_REOPENED === false;
export { D9_CANONICAL_MILESTONE_COUNT, D9_CANONICAL_PHASE_LIST };

const STATUS_FOR = {
  REVIEW: "REVIEWED",
  CONFIRM: "CONFIRMED",
  ASSIGN_OWNER: "OWNER_ASSIGNED",
  ASSIGN_DISCIPLINE: "DISCIPLINE_CONTEXT_RECORDED",
  ESCALATE: "ESCALATED",
  DISPOSE: "DISPOSITION_RECORDED",
  CLOSE: "CLOSED",
} as const;

const FLOATING = new Set(["latest", "head", "floating", "tip", "unspecified", "current"]);
const CONCLUSION = /\b(therefore|incorrect|confirmed|recommend|approved|validated|escalate|decide|resolve)\b/i;

export type D9R4Actor = D9R1Actor;
export type D9R4Action = (typeof D9_R4_ACTIONS)[number];
export type D9R4GovernanceInput = {
  governanceId: string;
  action: string;
  status?: string;
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
  humanAuthorityId: string;
  ownerId?: string;
  responsibleDiscipline?: string;
  confirmationBasis?: string;
  escalationReason?: string;
  escalationRecipient?: string;
  requiredAction?: string;
  severityContext?: string;
  disposition?: string;
  evidence: string;
  rationale: string;
  sourceBasisRef: string;
  provenanceRef: string;
  applicability: string;
  limitations: string;
  citedCurrentness: string;
  assertedFingerprint?: string | null;
  tenantId?: string;
  confirm?: boolean;
  resolve?: boolean;
  recommend?: boolean;
  decide?: boolean;
  approve?: boolean;
  certify?: boolean;
  validate?: boolean;
  design?: boolean;
  redesign?: boolean;
  optimize?: boolean;
  mutateSource?: boolean;
  repoint?: boolean;
  recompute?: boolean;
  autoClose?: boolean;
  autoReconfirm?: boolean;
  stripLimitations?: boolean;
  stripApplicability?: boolean;
  stripProvenance?: boolean;
};

export type D9R4GovernanceRecord = {
  governanceId: string;
  action: D9R4Action;
  status: (typeof STATUS_FOR)[D9R4Action];
  governanceVersion: typeof D9_R4_GOVERNANCE_VERSION;
  candidateId: string;
  candidateFingerprint: string;
  conflictClass: D9R3Candidate["conflictClass"];
  observationId: string;
  observationFingerprint: string;
  sourceA: D9R3Candidate["sourceA"];
  sourceB: D9R3Candidate["sourceB"];
  humanAuthorityId: string;
  recorderAuthority: typeof D9_R4_RECORDER_AUTHORITY;
  ownerId: string | null;
  responsibleDiscipline: string | null;
  confirmationStatus: "UNCONFIRMED" | "CONFIRMED";
  confirmationBasis: string | null;
  escalationReason: string | null;
  escalationRecipient: string | null;
  requiredAction: string | null;
  severityContext: (typeof D9_R4_SEVERITY_CONTEXTS)[number] | null;
  disposition: (typeof D9_R4_DISPOSITIONS)[number] | null;
  closureStatus: "OPEN" | "CLOSED";
  evidence: string;
  rationale: string;
  sourceBasisRef: string;
  provenanceRef: string;
  applicability: string;
  limitations: string;
  d1Limitations: typeof D9_R1_D1_STANDING_LIMITATION;
  d1PackComplete: false;
  citedCurrentness: (typeof D9_CURRENTNESS_STATES)[number];
  sourceACurrentness: (typeof D9_CURRENTNESS_STATES)[number];
  sourceBCurrentness: (typeof D9_CURRENTNESS_STATES)[number];
  threadLinks: readonly ({ kind: "CANDIDATE"; candidateId: string; fingerprint: string } | { kind: "SOURCE"; contractId: string; exactRevision: string; fingerprint: string } | { kind: "OBSERVATION"; observationId: string; fingerprint: string })[];
  lineage: D9R3Candidate["lineage"];
  tenantId: string;
  workspaceId: string;
  projectId: string;
  fingerprint: string;
  reviewed: boolean;
  reviewedEqualsConfirmed: false;
  reviewedEqualsResolved: false;
  ownerEqualsSourceAuthority: false;
  responsibleDisciplineEqualsDecision: false;
  responsibleDisciplineEqualsAuthorityTransfer: false;
  escalationEqualsDecision: false;
  escalationEqualsApproval: false;
  escalationEqualsResolution: false;
  escalationEqualsValidation: false;
  dispositionEqualsDecision: false;
  dispositionEqualsResolution: false;
  dispositionEqualsApproval: false;
  closedEqualsValidated: false;
  closedEqualsDisciplineValidated: false;
  closedEqualsApproved: false;
  closedEqualsConformant: false;
  resolved: false;
  validated: false;
  approved: false;
  conformant: false;
  engineeringDecision: false;
  recommendation: false;
  authoritative: false;
  recordedAt: string;
};

export type D9R4History = { historyId: string; governanceId: string; action: "CREATED"; fingerprint: string; recordedAt: string };
export type D9R4Store = {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  now: () => string;
  records: D9R4GovernanceRecord[];
  history: D9R4History[];
};
export type D9R4AiEscalationSuggestion = { aiSuggested: true; authoritative: false; confirmedConflict: false; reason: string };

function fail(code: string): never {
  throw new Error(`D9_R4_${code}`);
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

function assertActor(actor: D9R4Actor, r1: D9R1Store, r2: D9R2Store, r3: D9R3Store, store: D9R4Store): void {
  if (!actor.actorId.trim() || actor.tenantId !== r1.tenantId || actor.workspaceId !== r1.workspaceId || actor.projectId !== r1.projectId) fail("SCOPE_REQUIRED");
  if (actor.tenantId !== r2.tenantId || actor.workspaceId !== r2.workspaceId || actor.projectId !== r2.projectId) fail("CROSS_SCOPE_REJECTED");
  if (actor.tenantId !== r3.tenantId || actor.workspaceId !== r3.workspaceId || actor.projectId !== r3.projectId) fail("CROSS_SCOPE_REJECTED");
  if (actor.tenantId !== store.tenantId || actor.workspaceId !== store.workspaceId || actor.projectId !== store.projectId) fail("CROSS_SCOPE_REJECTED");
  if (blockedParty(actor.actorId) || blockedParty(actor.authority) || actor.actorKind === "ai") fail("AI_NOT_D9_AUTHORITY");
  if (actor.authority === "ADMIN" || actor.authority === "ADMINISTRATOR" || actor.actorId === "ADMIN") fail("ADMIN_CANNOT_OVERRIDE");
  if (actor.authority !== D9_R4_RECORDER_AUTHORITY) fail("RECORDER_AUTHORITY_REQUIRED");
}

function assertProhibited(input: D9R4GovernanceInput): void {
  if (input.resolve || input.autoClose) fail("CONFLICT_RESOLUTION_REJECTED");
  if (input.recommend) fail("RECOMMENDATION_REJECTED");
  if (input.decide) fail("DECISION_REJECTED");
  if (input.approve || input.certify || input.validate) fail("VALIDATION_REJECTED");
  if (input.design || input.redesign || input.optimize) fail("DESIGN_REJECTED");
  if (input.mutateSource) fail("SOURCE_MUTATION_REJECTED");
  if (input.repoint) fail("AUTO_REPOINT_REJECTED");
  if (input.recompute || input.autoReconfirm) fail("AUTO_RECONFIRM_REJECTED");
  if (input.stripLimitations) fail("LIMITATION_STRIPPING_REJECTED");
  if (input.stripApplicability) fail("APPLICABILITY_STRIPPING_REJECTED");
  if (input.stripProvenance) fail("PROVENANCE_STRIPPING_REJECTED");
}

function findEntry(r1: D9R1Store, contractId: string, exactRevision: string, fingerprint: string): D9R1SourceEntry {
  const entry = r1.entries.find((row) => row.contractId === contractId && row.exactRevision === exactRevision && row.tenantId === r1.tenantId);
  if (!entry) fail("SOURCE_REVISION_NOT_ON_MANIFEST");
  if (entry.fingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  return entry;
}

function copyEndpoint(endpoint: D9R3Candidate["sourceA"]): D9R3Candidate["sourceA"] {
  return { ...endpoint, lineage: endpoint.lineage.map((row) => ({ ...row })), sourceValues: endpoint.sourceValues.map((row) => ({ ...row })) };
}

export function createD9R4Store(r1: D9R1Store, r2: D9R2Store, r3: D9R3Store, now: () => string = () => r3.now()): D9R4Store {
  if (r1.tenantId !== r2.tenantId || r1.workspaceId !== r2.workspaceId || r1.projectId !== r2.projectId) fail("SCOPE_REQUIRED");
  if (r1.tenantId !== r3.tenantId || r1.workspaceId !== r3.workspaceId || r1.projectId !== r3.projectId) fail("SCOPE_REQUIRED");
  if (!D9_R4_R3_RUNTIME_REMAINS_THREE || !D9_R4_ARCHITECTURE_BOUNDARIES_REMAIN || D9_CANONICAL_MILESTONE_COUNT !== 9 || D9_R4_PHASE_TYPE !== "CONFLICT_GOVERNANCE_AND_ESCALATION" || !D9_CANONICAL_PHASE_LIST.includes(D9_R4_PHASE)) fail("PHASE_LIST_UNEXPECTED");
  return { tenantId: r1.tenantId, workspaceId: r1.workspaceId, projectId: r1.projectId, now, records: [], history: [] };
}

export function aiSuggestD9Escalation(input: { reason: string; confirm?: boolean }): D9R4AiEscalationSuggestion {
  if (input.confirm) fail("CONFLICT_CONFIRMATION_REJECTED");
  return Object.freeze({ aiSuggested: true as const, authoritative: false as const, confirmedConflict: false as const, reason: prose(input.reason, "ESCALATION_REASON_REQUIRED") });
}

export function recordD9ConflictGovernance(r1: D9R1Store, r2: D9R2Store, r3: D9R3Store, store: D9R4Store, actor: D9R4Actor, input: D9R4GovernanceInput): D9R4GovernanceRecord {
  assertActor(actor, r1, r2, r3, store);
  assertProhibited(input);
  if (input.tenantId != null && input.tenantId !== actor.tenantId) fail("CROSS_SCOPE_REJECTED");
  if (!(D9_R4_ACTIONS as readonly string[]).includes(input.action)) fail("GOVERNANCE_ACTION_REJECTED");
  const action = input.action as D9R4Action;
  const status = STATUS_FOR[action];
  if (input.status != null && input.status !== status) fail("STATUS_SPOOFED");
  if (input.confirm && action !== "CONFIRM") fail("CONFIRMATION_SPOOFED");
  const humanAuthorityId = explicit(input.humanAuthorityId, "HUMAN_AUTHORITY_REQUIRED");
  if (blockedParty(humanAuthorityId) || humanAuthorityId === "ADMIN" || humanAuthorityId === "ADMINISTRATOR") fail("AUTHORITY_SPOOFED");
  if (humanAuthorityId !== actor.actorId) fail("AUTHORITY_NOT_TRACEABLE");
  if (!(D9_CURRENTNESS_STATES as readonly string[]).includes(input.citedCurrentness)) fail("CURRENTNESS_INVALID");
  const candidate = r3.candidates.find((row) => row.candidateId === input.candidateId && row.tenantId === store.tenantId);
  if (!candidate) fail("CANDIDATE_NOT_RECORDED");
  if (candidate.fingerprint !== explicit(input.candidateFingerprint, "EXACT_CANDIDATE_REVISION_REQUIRED")) fail("CANDIDATE_REVISION_MISMATCH");
  const observation = r2.observations.find((row) => row.observationId === input.observationId && row.tenantId === store.tenantId);
  if (!observation || observation.fingerprint !== input.observationFingerprint || observation.observationId !== candidate.observationId || observation.fingerprint !== candidate.observationFingerprint) fail("OBSERVATION_REVISION_MISMATCH");
  const sourceARevision = explicit(input.sourceAExactRevision, "EXACT_REVISION_REQUIRED");
  const sourceBRevision = explicit(input.sourceBExactRevision, "EXACT_REVISION_REQUIRED");
  const sourceAContractId = explicit(input.sourceAContractId, "SOURCE_A_REQUIRED");
  const sourceBContractId = explicit(input.sourceBContractId, "SOURCE_B_REQUIRED");
  if (sourceAContractId !== candidate.sourceA.contractId || sourceARevision !== candidate.sourceA.exactRevision || input.sourceAFingerprint !== candidate.sourceA.fingerprint) fail("EXACT_REVISION_MISMATCH");
  if (sourceBContractId !== candidate.sourceB.contractId || sourceBRevision !== candidate.sourceB.exactRevision || input.sourceBFingerprint !== candidate.sourceB.fingerprint) fail("EXACT_REVISION_MISMATCH");
  const manifest = buildD9SourceManifest(r1);
  if (manifest.d1.packComplete || manifest.d1.limitations !== D9_R1_D1_STANDING_LIMITATION) fail("D1_LIMITATION_MISSING");
  const sourceAEntry = findEntry(r1, sourceAContractId, sourceARevision, input.sourceAFingerprint);
  const sourceBEntry = findEntry(r1, sourceBContractId, sourceBRevision, input.sourceBFingerprint);
  if (sourceAEntry.sourceDiscipline !== candidate.sourceA.sourceDiscipline || sourceBEntry.sourceDiscipline !== candidate.sourceB.sourceDiscipline) fail("SOURCE_DISCIPLINE_SPOOFED");
  if (sourceAEntry.objectId !== candidate.sourceA.objectId || sourceBEntry.objectId !== candidate.sourceB.objectId) fail("SOURCE_IDENTITY_SPOOFED");
  const sourceA = copyEndpoint(candidate.sourceA);
  const sourceB = copyEndpoint(candidate.sourceB);
  let ownerId: string | null = null;
  let responsibleDiscipline: string | null = null;
  let confirmationBasis: string | null = null;
  let escalationReason: string | null = null;
  let escalationRecipient: string | null = null;
  let requiredAction: string | null = null;
  let severityContext: (typeof D9_R4_SEVERITY_CONTEXTS)[number] | null = null;
  let disposition: (typeof D9_R4_DISPOSITIONS)[number] | null = null;
  if (action === "ASSIGN_OWNER") {
    ownerId = explicit(input.ownerId ?? "", "OWNER_REQUIRED");
    if (blockedParty(ownerId) || ownerId === sourceA.authority || ownerId === sourceB.authority || ownerId === sourceA.sourceDiscipline || ownerId === sourceB.sourceDiscipline) fail("OWNER_AUTHORITY_SPOOFED");
  } else if (input.ownerId) fail("OWNER_SPOOFED");
  if (action === "ASSIGN_DISCIPLINE") {
    responsibleDiscipline = explicit(input.responsibleDiscipline ?? "", "RESPONSIBLE_DISCIPLINE_REQUIRED");
    if (responsibleDiscipline !== sourceA.sourceDiscipline && responsibleDiscipline !== sourceB.sourceDiscipline) fail("DISCIPLINE_NOT_ON_CANDIDATE");
  } else if (input.responsibleDiscipline) fail("DISCIPLINE_SPOOFED");
  if (action === "CONFIRM") {
    confirmationBasis = prose(input.confirmationBasis ?? "", "CONFIRMATION_BASIS_REQUIRED");
    if (!confirmationBasis.includes(humanAuthorityId) || !confirmationBasis.includes(sourceA.contractId) || !confirmationBasis.includes(sourceB.contractId)) fail("CONFIRMATION_BASIS_NOT_TRACEABLE");
  } else if (input.confirmationBasis) fail("CONFIRMATION_SPOOFED");
  if (action === "ESCALATE") {
    escalationReason = prose(input.escalationReason ?? "", "ESCALATION_REASON_REQUIRED");
    escalationRecipient = explicit(input.escalationRecipient ?? "", "ESCALATION_AUTHORITY_REQUIRED");
    requiredAction = prose(input.requiredAction ?? "", "ESCALATION_ACTION_REQUIRED");
    if (blockedParty(escalationRecipient) || escalationRecipient === "ADMIN" || escalationRecipient === "ADMINISTRATOR") fail("ESCALATION_AUTHORITY_SPOOFED");
    if (!(D9_R4_SEVERITY_CONTEXTS as readonly string[]).includes(input.severityContext ?? "")) fail("SEVERITY_SPOOFED");
    severityContext = input.severityContext as (typeof D9_R4_SEVERITY_CONTEXTS)[number];
  } else if (input.escalationReason || input.escalationRecipient || input.requiredAction || input.severityContext) fail("ESCALATION_SPOOFED");
  if (action === "DISPOSE") {
    if (!(D9_R4_DISPOSITIONS as readonly string[]).includes(input.disposition ?? "")) fail("DISPOSITION_SPOOFED");
    disposition = input.disposition as (typeof D9_R4_DISPOSITIONS)[number];
  } else if (input.disposition) fail("DISPOSITION_SPOOFED");
  const evidence = prose(input.evidence, "EVIDENCE_REQUIRED");
  const rationale = prose(input.rationale, "RATIONALE_REQUIRED");
  const sourceBasisRef = explicit(input.sourceBasisRef, "SOURCE_BASIS_REQUIRED");
  const provenanceRef = explicit(input.provenanceRef, "PROVENANCE_REQUIRED");
  const applicability = explicit(input.applicability, "APPLICABILITY_REQUIRED");
  const limitations = explicit(input.limitations, "LIMITATIONS_REQUIRED");
  if (action === "CONFIRM" && confirmationBasis && !confirmationBasis.includes(evidence)) fail("CONFIRMATION_BASIS_NOT_TRACEABLE");
  if (!sourceBasisRef.includes(candidate.sourceBasisRef) || !sourceBasisRef.includes(sourceA.sourceBasisRef) || !sourceBasisRef.includes(sourceB.sourceBasisRef)) fail("SOURCE_BASIS_NOT_TRACEABLE");
  if (!provenanceRef.includes(candidate.candidateId) || !provenanceRef.includes(sourceA.contractId) || !provenanceRef.includes(sourceB.contractId) || !provenanceRef.includes(observation.observationId) || !provenanceRef.includes(D9_R4_GOVERNANCE_VERSION)) fail("PROVENANCE_NOT_TRACEABLE");
  if (!applicability.includes(candidate.applicability)) fail("APPLICABILITY_NOT_PRESERVED");
  if (!limitations.includes(candidate.limitations) || !limitations.includes(sourceA.limitations) || !limitations.includes(sourceB.limitations) || !limitations.includes(D9_R1_D1_STANDING_LIMITATION)) fail("SOURCE_LIMITATION_NOT_PRESERVED");
  const body = {
    action,
    status,
    governanceVersion: D9_R4_GOVERNANCE_VERSION,
    candidateId: candidate.candidateId,
    candidateFingerprint: candidate.fingerprint,
    conflictClass: candidate.conflictClass,
    observationId: observation.observationId,
    observationFingerprint: observation.fingerprint,
    sourceA,
    sourceB,
    humanAuthorityId,
    recorderAuthority: D9_R4_RECORDER_AUTHORITY,
    ownerId,
    responsibleDiscipline,
    confirmationStatus: action === "CONFIRM" ? "CONFIRMED" as const : "UNCONFIRMED" as const,
    confirmationBasis,
    escalationReason,
    escalationRecipient,
    requiredAction,
    severityContext,
    disposition,
    closureStatus: action === "CLOSE" ? "CLOSED" as const : "OPEN" as const,
    evidence,
    rationale,
    sourceBasisRef,
    provenanceRef,
    applicability,
    limitations,
    d1Limitations: manifest.d1.limitations,
    d1PackComplete: false as const,
    citedCurrentness: input.citedCurrentness as (typeof D9_CURRENTNESS_STATES)[number],
    sourceACurrentness: sourceA.currentness,
    sourceBCurrentness: sourceB.currentness,
    threadLinks: [
      { kind: "CANDIDATE" as const, candidateId: candidate.candidateId, fingerprint: candidate.fingerprint },
      { kind: "SOURCE" as const, contractId: sourceA.contractId, exactRevision: sourceA.exactRevision, fingerprint: sourceA.fingerprint },
      { kind: "SOURCE" as const, contractId: sourceB.contractId, exactRevision: sourceB.exactRevision, fingerprint: sourceB.fingerprint },
      { kind: "OBSERVATION" as const, observationId: observation.observationId, fingerprint: observation.fingerprint },
    ],
    lineage: [...sourceA.lineage, ...sourceB.lineage],
    tenantId: store.tenantId,
    workspaceId: store.workspaceId,
    projectId: store.projectId,
    reviewed: action === "REVIEW",
    reviewedEqualsConfirmed: false as const,
    reviewedEqualsResolved: false as const,
    ownerEqualsSourceAuthority: false as const,
    responsibleDisciplineEqualsDecision: false as const,
    responsibleDisciplineEqualsAuthorityTransfer: false as const,
    escalationEqualsDecision: false as const,
    escalationEqualsApproval: false as const,
    escalationEqualsResolution: false as const,
    escalationEqualsValidation: false as const,
    dispositionEqualsDecision: false as const,
    dispositionEqualsResolution: false as const,
    dispositionEqualsApproval: false as const,
    closedEqualsValidated: false as const,
    closedEqualsDisciplineValidated: false as const,
    closedEqualsApproved: false as const,
    closedEqualsConformant: false as const,
    resolved: false as const,
    validated: false as const,
    approved: false as const,
    conformant: false as const,
    engineeringDecision: false as const,
    recommendation: false as const,
    authoritative: false as const,
    digitalThreadModule: D9_R4_DIGITAL_THREAD_MODULE,
  };
  const fingerprint = fingerprintCanonical(body);
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const governanceId = explicit(input.governanceId, "GOVERNANCE_ID_REQUIRED");
  const existing = store.records.find((row) => row.governanceId === governanceId);
  if (existing) return existing.fingerprint === fingerprint ? existing : fail("REPLAY_REJECTED");
  if (store.records.some((row) => row.candidateId === candidate.candidateId && row.candidateFingerprint === candidate.fingerprint && row.action === action)) fail("DUPLICATE_GOVERNANCE_REJECTED");
  const record: D9R4GovernanceRecord = Object.freeze({ ...body, governanceId, fingerprint, recordedAt: store.now() });
  store.records.push(record);
  store.history.push({ historyId: `d9-r4-hist-${store.history.length + 1}`, governanceId, action: "CREATED", fingerprint, recordedAt: record.recordedAt });
  return record;
}

export function readD9ConflictGovernance(r1: D9R1Store, r2: D9R2Store, r3: D9R3Store, store: D9R4Store, actor: D9R4Actor): readonly D9R4GovernanceRecord[] {
  assertActor(actor, r1, r2, r3, store);
  return store.records.filter((row) => row.tenantId === actor.tenantId && row.workspaceId === actor.workspaceId && row.projectId === actor.projectId);
}

export function repointD9ConflictGovernance(): never { return fail("AUTO_REPOINT_REJECTED"); }
export function reconfirmD9ConflictGovernance(): never { return fail("AUTO_RECONFIRM_REJECTED"); }
export function resolveD9ConflictGovernance(): never { return fail("CONFLICT_RESOLUTION_REJECTED"); }
export function recommendFromD9Governance(): never { return fail("RECOMMENDATION_REJECTED"); }
export function decideFromD9Governance(): never { return fail("DECISION_REJECTED"); }
export function approveD9Governance(): never { return fail("VALIDATION_REJECTED"); }
export function validateFromD9Governance(): never { return fail("VALIDATION_REJECTED"); }
export function closeD9ConflictFromSourceChange(): never { return fail("AUTO_CLOSE_REJECTED"); }
export function mutateD9GovernanceSource(): never { return fail("SOURCE_MUTATION_REJECTED"); }
export function designFromD9Governance(): never { return fail("DESIGN_REJECTED"); }
