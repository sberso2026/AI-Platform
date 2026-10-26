/**
 * EOS-D9-R1 read-only source-contract read model.
 * One bounded runtime. Indexes exact D2-D8 source revisions and records that D1 has no governed source contract.
 * Does not observe, infer, detect, confirm, resolve, escalate, recommend, decide, validate, or mutate a source.
 */
import {
  D8_REOPENED,
  D9_CANONICAL_MILESTONE_COUNT,
  D9_CANONICAL_PHASE_LIST,
  D9_CURRENTNESS_STATES,
  D9_FINGERPRINT_ALGORITHM,
  D9_IMPLEMENTATION_PHASE_TYPES,
  D9_IMPLEMENTATION_PHASES,
  D9_RUNTIME_COUNT as ARCHITECTURE_D9_RUNTIME_COUNT,
  D9_RUNTIME_STARTED as ARCHITECTURE_D9_RUNTIME_STARTED,
  D9_SOURCE_DISCIPLINES,
} from "@rtb/types";
import { D2_CONTEXT_AUTHORITY, D2_DISCIPLINE } from "../civil/identity-foundation";
import { D2_R11_STATUS } from "../civil/d9-source-contract";
import { D7_CONTEXT_AUTHORITY, D7_DISCIPLINE } from "../electrical/identity-foundation";
import { D7_R11_STATUS } from "../electrical/d9-source-contract";
import { D3_CONTEXT_AUTHORITY, D3_DISCIPLINE } from "../geotechnical/identity-foundation";
import { D3_R11_STATUS } from "../geotechnical/d9-source-contract";
import { D8_CONTEXT_AUTHORITY, D8_DISCIPLINE } from "../instrumentation-control/identity-foundation";
import { D8_R11_SOURCE_CONTRACT_VERSION } from "../instrumentation-control/d9-source-contract";
import { D4_CONTEXT_AUTHORITY, D4_DISCIPLINE } from "../mechanical/identity-foundation";
import { D4_R11_STATUS } from "../mechanical/d9-source-contract";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import { D5_CONTEXT_AUTHORITY, D5_DISCIPLINE } from "../piping/identity-foundation";
import { D5_R11_STATUS } from "../piping/d9-source-contract";
import { D6_CONTEXT_AUTHORITY, D6_DISCIPLINE } from "../process/identity-foundation";
import { D6_R11_STATUS } from "../process/d9-source-contract";
import {
  D1_STRUCTURAL_PACK_COMPLETE,
  D6_STATUS,
  D7_STATUS,
  D8_STATUS,
  D8_TRACK_COMPLETE,
} from "../instrumentation-control/instrumentation-control-bounded-closeout";

export const D9_R1_STATUS = "SOURCE_CONTRACT_READ_MODEL_IMPLEMENTED" as const;
export const D9_R1_MATURITY = D9_R1_STATUS;
export const D9_R1_MATURITY_STATE = D9_R1_STATUS;
export const D9_R1_CLOSEOUT_PATH = "docs/architecture/engineering-os/EOS_D9_R1_SOURCE_CONTRACT_READ_MODEL_CLOSEOUT.md" as const;
export const D9_R1_PHASE = D9_IMPLEMENTATION_PHASES[0];
export const D9_R1_PHASE_TYPE = D9_IMPLEMENTATION_PHASE_TYPES[0];
export const D9_SOURCE_CONTRACT_READ_MODEL_RUNTIME_IMPLEMENTED = true as const;
export const D9_SOURCE_CONTRACT_READ_MODEL_RUNTIME_COUNT = 1 as const;
export const D9_SOURCE_CONTRACT_READ_MODEL_RUNTIME_READY = true as const;
export const D9_RUNTIME_STARTED = true as const;
export const D9_RUNTIME_COUNT = 1 as const;
export const D9_R1_ARCHITECTURE_RUNTIME_REMAINS_ZERO = ARCHITECTURE_D9_RUNTIME_STARTED === false && ARCHITECTURE_D9_RUNTIME_COUNT === 0;
export const D9_SOURCE_READ_MODEL_READ_ONLY = true as const;
export const D9_SOURCE_READ_MODEL_CAN_MUTATE_SOURCE_RECORD = false as const;
export const D9_SOURCE_READ_MODEL_CAN_MUTATE_DISCIPLINE_STATE = false as const;
export const D9_USES_D1_D8_SOURCE_CONTRACTS = true as const;
export const D9_BYPASSES_DISCIPLINE_SOURCE_CONTRACTS = false as const;
export const D9_R1_D1_SOURCE_CONTRACT_AVAILABLE = false as const;
export const D9_R1_PRESERVES_D1_INCOMPLETE_STATUS = D1_STRUCTURAL_PACK_COMPLETE === false;
export const D9_R1_PRESERVES_D1_LIMITATIONS = true as const;
export const D9_TREATS_D1_STRUCTURAL_AS_COMPLETE = false as const;
export const D9_IGNORES_D1_STRUCTURAL_LIMITATIONS = false as const;
export const D9_R1_D1_STANDING_LIMITATION =
  "D1 structural pack is incomplete. No governed D1 source contract is exposed, and D9 does not invent one." as const;
export const D9_R1_EXACT_SOURCE_REVISION_REQUIRED = true as const;
export const D9_R1_FLOATING_SOURCE_REFERENCE_ALLOWED = false as const;
export const D9_R1_SOURCE_AUTO_REPOINTED = false as const;
export const D9_R1_SOURCE_REVISION_MANIFEST_IMPLEMENTED = true as const;
export const D9_R1_SOURCE_REVISION_MANIFEST_EXACT = true as const;
export const D9_R1_PRESERVES_SOURCE_DISCIPLINE = true as const;
export const D9_R1_PRESERVES_SOURCE_IDENTITY = true as const;
export const D9_R1_PRESERVES_SOURCE_OBJECT_TYPE = true as const;
export const D9_R1_PRESERVES_SOURCE_CURRENTNESS = true as const;
export const CURRENT_SOURCE_RECORD_EQUALS_VALIDATED = false as const;
export const STALE_SOURCE_RECORD_EQUALS_INVALID = false as const;
export const SUPERSEDED_SOURCE_RECORD_EQUALS_INVALID = false as const;
export const D9_R1_PROVENANCE_REQUIRED = true as const;
export const D9_R1_PROVENANCE_PRESERVED = true as const;
export const D9_R1_SOURCE_BASIS_REQUIRED = true as const;
export const D9_R1_SOURCE_BASIS_PRESERVED = true as const;
export const D9_R1_SOURCE_BASIS_TRACEABLE = true as const;
export const D9_R1_APPLICABILITY_PRESERVED = true as const;
export const D9_R1_AUTO_PROPAGATES_SOURCE_OUTSIDE_APPLICABILITY = false as const;
export const D9_R1_LIMITATIONS_PRESERVED = true as const;
export const D9_R1_CAN_SILENTLY_DROP_SOURCE_LIMITATIONS = false as const;
export const D9_R1_AUTHORITY_METADATA_PRESERVED = true as const;
export const D9_READ_ACCESS_EQUALS_D1_STRUCTURAL_AUTHORITY = false as const;
export const D9_READ_ACCESS_EQUALS_D2_CIVIL_AUTHORITY = false as const;
export const D9_READ_ACCESS_EQUALS_D3_GEOTECHNICAL_AUTHORITY = false as const;
export const D9_READ_ACCESS_EQUALS_D4_MECHANICAL_AUTHORITY = false as const;
export const D9_READ_ACCESS_EQUALS_D5_PIPING_AUTHORITY = false as const;
export const D9_READ_ACCESS_EQUALS_D6_PROCESS_AUTHORITY = false as const;
export const D9_READ_ACCESS_EQUALS_D7_ELECTRICAL_AUTHORITY = false as const;
export const D9_READ_ACCESS_EQUALS_D8_IAC_AUTHORITY = false as const;
export const D9_R1_EXPLICIT_LINEAGE_PRESERVED = true as const;
export const D9_R1_INFERRED_LINEAGE_ALLOWED = false as const;
export const D9_R1_REUSES_CANONICAL_FINGERPRINT = D9_FINGERPRINT_ALGORITHM === "fingerprintCanonical";
export const SECOND_D9_R1_FINGERPRINT_ALGORITHM_CREATED = false as const;
export const FINGERPRINT_MATCH_EQUALS_VALIDATED = false as const;
export const FINGERPRINT_MATCH_EQUALS_APPROVED = false as const;
export const D9_R1_FINGERPRINT_VERIFICATION_SUPPORTED = true as const;
export const D9_R1_FINGERPRINT_MISMATCH_AUTO_REPAIRED = false as const;
export const D9_R1_FINGERPRINT_MISMATCH_AUTO_REBASELINED = false as const;
export const D9_R1_HISTORY_PRESERVED = true as const;
export const D9_R1_HISTORICAL_REFERENCE_AUTO_REPOINTED = false as const;
export const SILENT_D9_R1_SOURCE_MUTATION_ALLOWED = false as const;
export const D9_R1_NORMALIZATION_CREATES_NEW_ENGINEERING_FACT = false as const;
export const D9_R1_NORMALIZATION_PERFORMS_ENGINEERING_DERIVATION = false as const;
export const D9_R1_NORMALIZATION_PERFORMS_NUMERIC_DERIVATION = false as const;
export const D9_R1_SOURCE_UNITS_PRESERVED = true as const;
export const D9_R1_AUTO_CONVERTS_ENGINEERING_UNITS = false as const;
export const D9_R1_SOURCE_VALUES_PRESERVED = true as const;
export const D9_R1_INFERS_MISSING_ENGINEERING_VALUE = false as const;
export const D9_R1_CORRECTS_SOURCE_ENGINEERING_VALUE = false as const;
export const D9_R1_CREATES_NEW_ENGINEERING_FACT = false as const;
export const D9_R1_CREATES_NEW_DERIVED_VALUE = false as const;
export const D9_R1_CREATES_NEW_REQUIREMENT = false as const;
export const D9_R1_CREATES_NEW_ASSUMPTION = false as const;
export const D9_R1_CREATES_NEW_ENGINEERING_DECISION = false as const;
export const D9_R1_CREATES_NEW_RECOMMENDATION = false as const;
export const D9_R1_INFERS_RELATIONSHIP_FROM_NAME = false as const;
export const D9_R1_INFERS_RELATIONSHIP_FROM_TAG = false as const;
export const D9_R1_INFERS_RELATIONSHIP_FROM_DOCUMENT_PROXIMITY = false as const;
export const D9_R1_INFERS_RELATIONSHIP_FROM_SEMANTIC_SIMILARITY = false as const;
export const D9_R1_CAN_EXPOSE_EXISTING_GOVERNED_RELATIONSHIPS = true as const;
export const D9_R1_EXISTING_RELATIONSHIP_SOURCE_REVISION_REQUIRED = true as const;
export const READ_MODEL_AGGREGATION_EQUALS_ENGINEERING_RELATIONSHIP = false as const;
export const READ_MODEL_GROUPING_EQUALS_CROSS_DISCIPLINE_INFERENCE = false as const;
export const D9_CROSS_DISCIPLINE_OBSERVATION_RUNTIME_COUNT = 0 as const;
export const D9_R1_PERFORMS_CROSS_DISCIPLINE_OBSERVATION = false as const;
export const D9_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT = 0 as const;
export const D9_R1_PERFORMS_CROSS_DISCIPLINE_INFERENCE = false as const;
export const D9_CONFLICT_DETECTION_RUNTIME_COUNT = 0 as const;
export const D9_R1_PERFORMS_CONFLICT_DETECTION = false as const;
export const D9_R1_CREATES_CONFLICT_CANDIDATE = false as const;
export const D9_R1_CONFIRMS_ENGINEERING_CONFLICT = false as const;
export const D9_CONFLICT_RESOLUTION_RUNTIME_COUNT = 0 as const;
export const D9_AUTOMATIC_CONFLICT_RESOLUTION_RUNTIME_COUNT = 0 as const;
export const D9_R1_PERFORMS_CONFLICT_RESOLUTION = false as const;
export const D9_CONFLICT_GOVERNANCE_ESCALATION_RUNTIME_COUNT = 0 as const;
export const D9_R1_CREATES_ENGINEERING_ESCALATION = false as const;
export const D9_RECOMMENDATION_RUNTIME_COUNT = 0 as const;
export const D9_R1_GENERATES_ENGINEERING_RECOMMENDATION = false as const;
export const D9_R1_GENERATES_CROSS_DISCIPLINE_RECOMMENDATION = false as const;
export const D9_ENGINEERING_DECISION_RUNTIME_COUNT = 0 as const;
export const D9_R1_MAKES_ENGINEERING_DECISION = false as const;
export const D9_R1_AUTO_VALIDATES_SOURCE_RECORD = false as const;
export const D9_AUTO_VALIDATES_D1_STRUCTURAL = false as const;
export const D9_AUTO_VALIDATES_D2_CIVIL = false as const;
export const D9_AUTO_VALIDATES_D3_GEOTECHNICAL = false as const;
export const D9_AUTO_VALIDATES_D4_MECHANICAL = false as const;
export const D9_AUTO_VALIDATES_D5_PIPING = false as const;
export const D9_AUTO_VALIDATES_D6_PROCESS = false as const;
export const D9_AUTO_VALIDATES_D7_ELECTRICAL = false as const;
export const D9_AUTO_VALIDATES_D8_IAC = false as const;
export const D9_CONFORMANCE_DETERMINATION_RUNTIME_COUNT = 0 as const;
export const D9_APPROVAL_RUNTIME_COUNT = 0 as const;
export const D9_CERTIFICATION_RUNTIME_COUNT = 0 as const;
export const D9_AUTOMATIC_ENGINEERING_DESIGN_RUNTIME_COUNT = 0 as const;
export const D9_AUTOMATIC_ENGINEERING_REDESIGN_RUNTIME_COUNT = 0 as const;
export const D9_ENGINEERING_OPTIMIZATION_RUNTIME_COUNT = 0 as const;
export const D9_R1_AUTO_MUTATES_D1_STRUCTURAL = false as const;
export const D9_R1_AUTO_MUTATES_D2_CIVIL = false as const;
export const D9_R1_AUTO_MUTATES_D3_GEOTECHNICAL = false as const;
export const D9_R1_AUTO_MUTATES_D4_MECHANICAL = false as const;
export const D9_R1_AUTO_MUTATES_D5_PIPING = false as const;
export const D9_R1_AUTO_MUTATES_D6_PROCESS = false as const;
export const D9_R1_AUTO_MUTATES_D7_ELECTRICAL = false as const;
export const D9_R1_AUTO_MUTATES_D8_IAC = false as const;
export const D9_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT = 0 as const;
export const D9_REVIEW_VALIDATION_RUNTIME_COUNT = 0 as const;
export const D9_REUSES_CANONICAL_CURRENTNESS = true as const;
export const PARALLEL_D9_CURRENTNESS_ENGINE_CREATED = false as const;
export const D9_REUSES_CANONICAL_DIGITAL_THREAD = true as const;
export const PARALLEL_D9_DIGITAL_THREAD_CREATED = false as const;
export const D9_REUSES_CANONICAL_FINGERPRINT = true as const;
export const SECOND_D9_FINGERPRINT_ALGORITHM_CREATED = false as const;
export const TENANT_WORKSPACE_PROJECT_D9_R1_SCOPE_ENFORCED = true as const;
export const CROSS_TENANT_D9_R1_ACCESS_ALLOWED = false as const;
export const AI_EQUALS_D9_ENGINEERING_AUTHORITY = false as const;
export const ADMIN_EQUALS_D9_ENGINEERING_AUTHORITY = false as const;
export const AI_CAN_INVENT_D9_R1_AUTHORITATIVE_SOURCE_FACT = false as const;
export const AI_CAN_INVENT_D9_R1_AUTHORITATIVE_RELATIONSHIP = false as const;
export const AI_CAN_PROMOTE_READ_MODEL_ENTRY_TO_ENGINEERING_TRUTH = false as const;
export const ADMIN_CAN_PROMOTE_READ_MODEL_ENTRY_TO_ENGINEERING_TRUTH = false as const;
export const ADMIN_CAN_BYPASS_SOURCE_DISCIPLINE_AUTHORITY = false as const;
export const D9_R1_DUPLICATE_GOVERNANCE_IMPLEMENTED = true as const;
export const D9_R1_REPLAY_PROTECTION_IMPLEMENTED = true as const;
export const D9_R1_SPOOFING_PROTECTION_IMPLEMENTED = true as const;
export const D9_R1_RECORDER_AUTHORITY = "D9_SOURCE_READ_RECORDER" as const;
export const D9_R2_CANONICAL_PHASE = D9_IMPLEMENTATION_PHASES[1];
export const D9_R2_PHASE_TYPE = D9_IMPLEMENTATION_PHASE_TYPES[1];
export const D9_R2_CANONICAL_SCOPE =
  "Record explicit cross-discipline observations against the exact D9-R1 source revision manifest. Preserve source discipline, exact revision, provenance, applicability, and limitations. An observation is not an inference, a conflict candidate, a confirmed conflict, an escalation, a recommendation, or an engineering decision. Do not start conflict detection, recommendation, validation, or source mutation." as const;
export const D9_R2_STARTED = false as const;
export const D9_R1_READY_FOR_NEXT_PHASE = true as const;
export const D9_R1_NEXT_PHASE = D9_R2_CANONICAL_PHASE;
export const D9_R1_NEXT_PHASE_TYPE = D9_R2_PHASE_TYPE;
export const D9_R1_CANONICAL_NEXT_PHASE = D9_R2_CANONICAL_PHASE;
export const D9_R1_CANONICAL_NEXT_PHASE_SCOPE = D9_R2_CANONICAL_SCOPE;
export const D9_R1_BLOCKER = "NONE" as const;
export const D9_R1_MACHINE_READABLE_ROADMAP_UPDATED = true as const;
export const D9_R1_DATABASE_SCHEMA_CHANGED = false as const;
export const D9_R1_NEW_DEPENDENCY_ADDED = false as const;
export const EOS_ALL_DISCIPLINES_COMPLETE = false as const;
export const EOS_GA_READY = false as const;
export const D9_R1_PRESERVES_CLOSED_TRACKS = D6_STATUS === "COMPLETE_BOUNDED_WITH_LIMITATIONS" && D7_STATUS === "COMPLETE_BOUNDED_WITH_LIMITATIONS" && D8_STATUS === "COMPLETE_BOUNDED_WITH_LIMITATIONS" && D8_TRACK_COMPLETE === true && D8_REOPENED === false;
export { D9_CANONICAL_MILESTONE_COUNT, D9_CANONICAL_PHASE_LIST };

const GOVERNED = {
  D2_CIVIL: { token: D2_DISCIPLINE, authority: D2_CONTEXT_AUTHORITY, version: D2_R11_STATUS },
  D3_GEOTECHNICAL: { token: D3_DISCIPLINE, authority: D3_CONTEXT_AUTHORITY, version: D3_R11_STATUS },
  D4_MECHANICAL: { token: D4_DISCIPLINE, authority: D4_CONTEXT_AUTHORITY, version: D4_R11_STATUS },
  D5_PIPING: { token: D5_DISCIPLINE, authority: D5_CONTEXT_AUTHORITY, version: D5_R11_STATUS },
  D6_PROCESS: { token: D6_DISCIPLINE, authority: D6_CONTEXT_AUTHORITY, version: D6_R11_STATUS },
  D7_ELECTRICAL: { token: D7_DISCIPLINE, authority: D7_CONTEXT_AUTHORITY, version: D7_R11_STATUS },
  D8_INSTRUMENTATION_CONTROL: { token: D8_DISCIPLINE, authority: D8_CONTEXT_AUTHORITY, version: D8_R11_SOURCE_CONTRACT_VERSION },
} as const;

type GovernedDiscipline = keyof typeof GOVERNED;
const FLOATING = new Set(["latest", "head", "floating", "tip", "unspecified", "current"]);
const INFERRED = new Set(["inferred", "similar", "nearby", "proximity", "semantic"]);

export type D9R1Actor = {
  actorId: string;
  authority: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  actorKind?: string;
};

export type D9R1Lineage = { lineageId: string; fromRevision: string; toRevision: string };
export type D9R1Relationship = {
  relationshipId: string;
  sourceEndpointId: string;
  sourceRevision: string;
  targetEndpointId: string;
  targetRevision: string;
};
export type D9R1SourceValue = { quantityId: string; valueText: string; unitText: string };

export type D9R1SourceEntryInput = {
  entryId: string;
  sourceDiscipline: GovernedDiscipline;
  sourceDisciplineToken: string;
  contractId: string;
  contractVersion: string;
  objectId: string;
  objectType: string;
  exactRevision: string;
  currentness: string;
  provenanceRef: string;
  sourceBasisRef: string;
  applicability: string;
  limitations: string;
  authority: string;
  lineage?: readonly D9R1Lineage[];
  relationships?: readonly D9R1Relationship[];
  sourceValues?: readonly D9R1SourceValue[];
  assertedFingerprint?: string | null;
  tenantId?: string;
  workspaceId?: string;
  projectId?: string;
  infer?: boolean;
  inferFromName?: boolean;
  inferFromTag?: boolean;
  documentProximity?: boolean;
  semantic?: boolean;
  derive?: boolean;
  numeric?: boolean;
  fillMissing?: boolean;
  convertUnits?: boolean;
  correctValue?: boolean;
  createFact?: boolean;
  createRequirement?: boolean;
  createAssumption?: boolean;
  createDecision?: boolean;
  recommend?: boolean;
  observe?: boolean;
  detectConflict?: boolean;
  confirmConflict?: boolean;
  resolveConflict?: boolean;
  escalate?: boolean;
  validate?: boolean;
  approve?: boolean;
  certify?: boolean;
  mutateSource?: boolean;
  repoint?: boolean;
  repairFingerprint?: boolean;
  rebaselineFingerprint?: boolean;
  stripProvenance?: boolean;
  stripLimitations?: boolean;
  stripApplicability?: boolean;
  transferAuthority?: boolean;
};

export type D9R1SourceEntry = {
  entryId: string;
  sourceDiscipline: GovernedDiscipline;
  sourceDisciplineToken: string;
  contractId: string;
  contractVersion: string;
  objectId: string;
  objectType: string;
  exactRevision: string;
  currentness: (typeof D9_CURRENTNESS_STATES)[number];
  provenanceRef: string;
  sourceBasisRef: string;
  applicability: string;
  limitations: string;
  authority: string;
  lineage: readonly D9R1Lineage[];
  relationships: readonly D9R1Relationship[];
  sourceValues: readonly D9R1SourceValue[];
  tenantId: string;
  workspaceId: string;
  projectId: string;
  fingerprint: string;
  authoritative: true;
  engineeringFact: false;
  inference: false;
  validated: false;
  approved: false;
  readAccessEqualsDisciplineAuthority: false;
  recordedAt: string;
};

export type D9R1D1Posture = {
  sourceDiscipline: "D1_STRUCTURAL";
  sourceContractAvailable: false;
  packComplete: false;
  limitations: typeof D9_R1_D1_STANDING_LIMITATION;
  authoritative: false;
  fingerprint: string;
};

export type D9R1Manifest = {
  recordClass: "SOURCE_REVISION_MANIFEST";
  reasoningRecord: false;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  d1: D9R1D1Posture;
  entries: readonly { sourceDiscipline: GovernedDiscipline; contractId: string; exactRevision: string; fingerprint: string }[];
  fingerprint: string;
};

export type D9R1History = { historyId: string; entryId: string; action: "CREATED" | "D1_POSTURE_RECORDED"; fingerprint: string; recordedAt: string };
export type D9R1Store = {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  now: () => string;
  entries: D9R1SourceEntry[];
  d1Posture: D9R1D1Posture | null;
  history: D9R1History[];
};

function fail(code: string): never {
  throw new Error(`D9_R1_${code}`);
}

function blockedParty(value: string): boolean {
  const token = value.toUpperCase();
  return token === "AI" || token.startsWith("AI_") || token.startsWith("AI-") || token.startsWith("AI ") || token.includes("LLM");
}

function explicit(value: string, code: string): string {
  const token = value.trim();
  if (!token || FLOATING.has(token.toLowerCase()) || INFERRED.has(token.toLowerCase())) fail(code);
  if (/calc\(|solve\(/i.test(token)) fail("DERIVATION_REJECTED");
  return token;
}

function assertActor(actor: D9R1Actor, store: D9R1Store): void {
  if (!actor.actorId.trim() || !actor.tenantId.trim() || !actor.workspaceId.trim() || !actor.projectId.trim()) fail("SCOPE_REQUIRED");
  if (blockedParty(actor.actorId) || blockedParty(actor.authority) || actor.actorKind === "ai") fail("AI_NOT_D9_AUTHORITY");
  if (actor.authority === "ADMIN" || actor.authority === "ADMINISTRATOR" || actor.actorId === "ADMIN") fail("ADMIN_CANNOT_OVERRIDE");
  if (actor.authority !== D9_R1_RECORDER_AUTHORITY) fail("RECORDER_AUTHORITY_REQUIRED");
  if (actor.tenantId !== store.tenantId || actor.workspaceId !== store.workspaceId || actor.projectId !== store.projectId) fail("CROSS_SCOPE_REJECTED");
}

function assertProhibited(input: D9R1SourceEntryInput): void {
  if (input.infer || input.inferFromName || input.inferFromTag || input.documentProximity || input.semantic) fail("INFERRED_RELATIONSHIP_REJECTED");
  if (input.derive || input.numeric) fail("DERIVATION_REJECTED");
  if (input.fillMissing || input.correctValue) fail("VALUE_INFERENCE_REJECTED");
  if (input.convertUnits) fail("UNIT_CONVERSION_REJECTED");
  if (input.createFact || input.createRequirement || input.createAssumption || input.createDecision) fail("NEW_FACT_REJECTED");
  if (input.recommend) fail("RECOMMENDATION_REJECTED");
  if (input.observe) fail("OBSERVATION_NOT_IN_R1");
  if (input.detectConflict || input.confirmConflict) fail("CONFLICT_DETECTION_REJECTED");
  if (input.resolveConflict) fail("CONFLICT_RESOLUTION_REJECTED");
  if (input.escalate) fail("ESCALATION_REJECTED");
  if (input.validate || input.approve || input.certify) fail("VALIDATION_REJECTED");
  if (input.mutateSource) fail("SOURCE_MUTATION_REJECTED");
  if (input.repoint) fail("AUTO_REPOINT_REJECTED");
  if (input.repairFingerprint || input.rebaselineFingerprint) fail("FINGERPRINT_REBASELINE_REJECTED");
  if (input.stripProvenance) fail("PROVENANCE_STRIPPING_REJECTED");
  if (input.stripLimitations) fail("LIMITATION_STRIPPING_REJECTED");
  if (input.stripApplicability) fail("APPLICABILITY_STRIPPING_REJECTED");
  if (input.transferAuthority) fail("AUTHORITY_TRANSFER_REJECTED");
}

function projectionOf(input: {
  applicability: string;
  authority: string;
  contractId: string;
  contractVersion: string;
  currentness: string;
  exactRevision: string;
  limitations: string;
  lineage: readonly D9R1Lineage[];
  objectId: string;
  objectType: string;
  provenanceRef: string;
  relationships: readonly D9R1Relationship[];
  sourceBasisRef: string;
  sourceDiscipline: string;
  sourceDisciplineToken: string;
  sourceValues: readonly D9R1SourceValue[];
  tenantId: string;
  workspaceId: string;
  projectId: string;
}) {
  return {
    applicability: input.applicability,
    authority: input.authority,
    contractId: input.contractId,
    contractVersion: input.contractVersion,
    currentness: input.currentness,
    exactRevision: input.exactRevision,
    limitations: input.limitations,
    lineage: input.lineage,
    objectId: input.objectId,
    objectType: input.objectType,
    provenanceRef: input.provenanceRef,
    relationships: input.relationships,
    sourceBasisRef: input.sourceBasisRef,
    sourceDiscipline: input.sourceDiscipline,
    sourceDisciplineToken: input.sourceDisciplineToken,
    sourceValues: input.sourceValues,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    projectId: input.projectId,
  };
}

export function createD9R1Store(scope: { tenantId: string; workspaceId: string; projectId: string }, now: () => string = () => "2026-10-26T00:00:00.000Z"): D9R1Store {
  if (!D9_R1_ARCHITECTURE_RUNTIME_REMAINS_ZERO) fail("ARCHITECTURE_RUNTIME_UNEXPECTED");
  if (!D9_CANONICAL_PHASE_LIST.includes(D9_R1_PHASE) || D9_CANONICAL_MILESTONE_COUNT !== 9) fail("PHASE_LIST_UNEXPECTED");
  if (!scope.tenantId.trim() || !scope.workspaceId.trim() || !scope.projectId.trim()) fail("SCOPE_REQUIRED");
  return { ...scope, now, entries: [], d1Posture: null, history: [] };
}

export function recordD9SourceContractEntry(store: D9R1Store, actor: D9R1Actor, input: D9R1SourceEntryInput): D9R1SourceEntry {
  assertActor(actor, store);
  assertProhibited(input);
  if (input.tenantId != null && input.tenantId !== actor.tenantId) fail("CROSS_SCOPE_REJECTED");
  if (input.workspaceId != null && input.workspaceId !== actor.workspaceId) fail("CROSS_SCOPE_REJECTED");
  if (input.projectId != null && input.projectId !== actor.projectId) fail("CROSS_SCOPE_REJECTED");
  const governed = GOVERNED[input.sourceDiscipline];
  if (!governed || !(D9_SOURCE_DISCIPLINES as readonly string[]).includes(input.sourceDiscipline)) fail("SOURCE_DISCIPLINE_UNKNOWN");
  if (input.sourceDisciplineToken !== governed.token) fail("DISCIPLINE_SPOOF_REJECTED");
  if (input.authority !== governed.authority || input.contractVersion !== governed.version) fail("AUTHORITY_OR_VERSION_SPOOF_REJECTED");
  if (!(D9_CURRENTNESS_STATES as readonly string[]).includes(input.currentness)) fail("CURRENTNESS_INVALID");
  const lineage = (input.lineage ?? []).map((row) => ({
    lineageId: explicit(row.lineageId, "LINEAGE_REQUIRED"),
    fromRevision: explicit(row.fromRevision, "LINEAGE_REVISION_REQUIRED"),
    toRevision: explicit(row.toRevision, "LINEAGE_REVISION_REQUIRED"),
  }));
  const relationships = (input.relationships ?? []).map((row) => ({
    relationshipId: explicit(row.relationshipId, "RELATIONSHIP_ID_REQUIRED"),
    sourceEndpointId: explicit(row.sourceEndpointId, "RELATIONSHIP_ENDPOINT_REQUIRED"),
    sourceRevision: explicit(row.sourceRevision, "RELATIONSHIP_REVISION_REQUIRED"),
    targetEndpointId: explicit(row.targetEndpointId, "RELATIONSHIP_ENDPOINT_REQUIRED"),
    targetRevision: explicit(row.targetRevision, "RELATIONSHIP_REVISION_REQUIRED"),
  }));
  const sourceValues = (input.sourceValues ?? []).map((row) => ({
    quantityId: explicit(row.quantityId, "QUANTITY_ID_REQUIRED"),
    valueText: explicit(row.valueText, "SOURCE_VALUE_REQUIRED"),
    unitText: explicit(row.unitText, "SOURCE_UNIT_REQUIRED"),
  }));
  const body = {
    sourceDiscipline: input.sourceDiscipline,
    sourceDisciplineToken: governed.token,
    contractId: explicit(input.contractId, "CONTRACT_ID_REQUIRED"),
    contractVersion: governed.version,
    objectId: explicit(input.objectId, "OBJECT_ID_REQUIRED"),
    objectType: explicit(input.objectType, "OBJECT_TYPE_REQUIRED"),
    exactRevision: explicit(input.exactRevision, "EXACT_REVISION_REQUIRED"),
    currentness: input.currentness as (typeof D9_CURRENTNESS_STATES)[number],
    provenanceRef: explicit(input.provenanceRef, "PROVENANCE_REQUIRED"),
    sourceBasisRef: explicit(input.sourceBasisRef, "SOURCE_BASIS_REQUIRED"),
    applicability: explicit(input.applicability, "APPLICABILITY_REQUIRED"),
    limitations: explicit(input.limitations, "LIMITATIONS_REQUIRED"),
    authority: governed.authority,
    lineage,
    relationships,
    sourceValues,
    tenantId: store.tenantId,
    workspaceId: store.workspaceId,
    projectId: store.projectId,
  };
  const fingerprint = fingerprintCanonical(projectionOf(body));
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.entries.find((row) => row.entryId === input.entryId);
  if (existing) return existing.fingerprint === fingerprint ? existing : fail("REPLAY_REJECTED");
  if (store.entries.some((row) => row.sourceDiscipline === body.sourceDiscipline && row.contractId === body.contractId && row.exactRevision === body.exactRevision)) fail("DUPLICATE_SOURCE_ENTRY_REJECTED");
  const entry: D9R1SourceEntry = Object.freeze({
    ...body,
    entryId: explicit(input.entryId, "ENTRY_ID_REQUIRED"),
    fingerprint,
    authoritative: true,
    engineeringFact: false,
    inference: false,
    validated: false,
    approved: false,
    readAccessEqualsDisciplineAuthority: false,
    recordedAt: store.now(),
  });
  store.entries.push(entry);
  store.history.push({ historyId: `d9-r1-hist-${store.history.length + 1}`, entryId: entry.entryId, action: "CREATED", fingerprint, recordedAt: entry.recordedAt });
  return entry;
}

export function recordD1IncompletePosture(store: D9R1Store, actor: D9R1Actor): D9R1D1Posture {
  assertActor(actor, store);
  if (D1_STRUCTURAL_PACK_COMPLETE) fail("D1_PACK_COMPLETION_UNEXPECTED");
  const fingerprint = fingerprintCanonical({
    limitations: D9_R1_D1_STANDING_LIMITATION,
    packComplete: false as const,
    sourceContractAvailable: false as const,
    sourceDiscipline: "D1_STRUCTURAL" as const,
  });
  if (store.d1Posture) return store.d1Posture.fingerprint === fingerprint ? store.d1Posture : fail("D1_POSTURE_REPLAY_REJECTED");
  const posture: D9R1D1Posture = Object.freeze({
    sourceDiscipline: "D1_STRUCTURAL",
    sourceContractAvailable: false,
    packComplete: false,
    limitations: D9_R1_D1_STANDING_LIMITATION,
    authoritative: false,
    fingerprint,
  });
  store.d1Posture = posture;
  store.history.push({ historyId: `d9-r1-hist-${store.history.length + 1}`, entryId: "D1_STRUCTURAL_POSTURE", action: "D1_POSTURE_RECORDED", fingerprint, recordedAt: store.now() });
  return posture;
}

export function buildD9SourceManifest(store: D9R1Store): D9R1Manifest {
  if (!store.d1Posture) fail("D1_POSTURE_REQUIRED");
  const entries = [...store.entries]
    .map((row) => ({ sourceDiscipline: row.sourceDiscipline, contractId: row.contractId, exactRevision: row.exactRevision, fingerprint: row.fingerprint }))
    .sort((left, right) => `${left.sourceDiscipline}|${left.contractId}|${left.exactRevision}`.localeCompare(`${right.sourceDiscipline}|${right.contractId}|${right.exactRevision}`));
  return Object.freeze({
    recordClass: "SOURCE_REVISION_MANIFEST",
    reasoningRecord: false,
    tenantId: store.tenantId,
    workspaceId: store.workspaceId,
    projectId: store.projectId,
    d1: store.d1Posture,
    entries,
    fingerprint: fingerprintCanonical({ d1: store.d1Posture.fingerprint, entries }),
  });
}

export function readD9SourceManifest(store: D9R1Store, actor: D9R1Actor): D9R1Manifest {
  assertActor(actor, store);
  return buildD9SourceManifest(store);
}

export function readD9SourceEntries(store: D9R1Store, actor: D9R1Actor): readonly D9R1SourceEntry[] {
  assertActor(actor, store);
  return store.entries.filter((row) => row.tenantId === actor.tenantId && row.workspaceId === actor.workspaceId && row.projectId === actor.projectId);
}

export function groupD9SourceEntryIds(store: D9R1Store, actor: D9R1Actor): Record<string, readonly string[]> {
  const entries = readD9SourceEntries(store, actor);
  const grouped: Record<string, string[]> = {};
  for (const row of entries) {
    grouped[row.sourceDiscipline] = [...(grouped[row.sourceDiscipline] ?? []), row.entryId];
  }
  return grouped;
}

export function repointD9SourceEntry(): never { return fail("AUTO_REPOINT_REJECTED"); }
export function mutateD9SourceEntry(): never { return fail("SOURCE_MUTATION_REJECTED"); }
export function observeAcrossDisciplines(): never { return fail("OBSERVATION_NOT_IN_R1"); }
export function inferAcrossDisciplines(): never { return fail("INFERENCE_NOT_IN_R1"); }
export function detectD9Conflict(): never { return fail("CONFLICT_DETECTION_REJECTED"); }
export function confirmD9Conflict(): never { return fail("CONFLICT_CONFIRMATION_REJECTED"); }
export function resolveD9Conflict(): never { return fail("CONFLICT_RESOLUTION_REJECTED"); }
export function escalateD9Conflict(): never { return fail("ESCALATION_REJECTED"); }
export function recommendFromD9ReadModel(): never { return fail("RECOMMENDATION_REJECTED"); }
export function decideFromD9ReadModel(): never { return fail("DECISION_REJECTED"); }
export function validateFromD9ReadModel(): never { return fail("VALIDATION_REJECTED"); }
export function convertD9SourceUnits(): never { return fail("UNIT_CONVERSION_REJECTED"); }
export function repairD9SourceFingerprint(): never { return fail("FINGERPRINT_REBASELINE_REJECTED"); }
