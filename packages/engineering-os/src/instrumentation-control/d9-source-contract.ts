/**
 * EOS-D8-R11 read-only Instrumentation and Control source contract for future D9 consumption.
 * One bounded runtime. Exposes exact R1-R10 governed facts. Does not create facts, derive values,
 * infer relationships, transfer authority, mutate D8, or start D9.
 */
import {
  D8_CURRENTNESS_STATES,
  D8_D9_SOURCE_CONTRACT_ARCHITECTURE_DEFINED,
  D8_D9_SOURCE_CONTRACT_CREATES_NEW_ENGINEERING_FACT,
  D8_D9_SOURCE_CONTRACT_DERIVES_NEW_ENGINEERING_VALUE,
  D8_D9_SOURCE_CONTRACT_FIELDS,
  D8_D9_SOURCE_CONTRACT_TRANSFERS_ENGINEERING_AUTHORITY,
  D8_D9_SOURCE_CONTRACT_TRANSFERS_IAC_AUTHORITY,
  D8_IAC_OBJECT_TYPES,
  D8_IMPLEMENTATION_PHASE_TYPES,
  D8_IMPLEMENTATION_PHASES,
} from "@rtb/types";
import { isGovernedRelationType } from "../decision-intelligence/relations";
import { relationSemantics } from "../digital-thread/relation-semantics";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import { D1K_R3_SILENT_SOURCE_REPOINTING_ALLOWED } from "../structural-systems/interface-handoff-governance";
import {
  ADMIN_EQUALS_D8_IAC_ENGINEERING_AUTHORITY,
  AI_EQUALS_D8_IAC_ENGINEERING_AUTHORITY,
  CURRENT_D8_RECORD_EQUALS_APPROVED,
  CURRENT_D8_RECORD_EQUALS_CONFORMANT,
  CURRENT_D8_RECORD_EQUALS_VALIDATED,
  D1_STRUCTURAL_PACK_COMPLETE,
  D1N_REOPENED,
  D2_REOPENED,
  D2_TRACK_COMPLETE,
  D3_REOPENED,
  D3_TRACK_COMPLETE,
  D4_REOPENED,
  D4_TRACK_COMPLETE,
  D5_REOPENED,
  D5_TRACK_COMPLETE,
  D6_REOPENED,
  D6_STATUS,
  D6_TRACK_COMPLETE,
  D7_REOPENED,
  D7_STATUS,
  D7_TRACK_COMPLETE,
  D8_ACTUATOR_SIZING_RUNTIME_COUNT,
  D8_APPROVAL_RUNTIME_COUNT,
  D8_AUTOMATIC_CONTROL_LOGIC_GENERATION_RUNTIME_COUNT,
  D8_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT,
  D8_AUTOMATIC_IAC_DESIGN_RUNTIME_COUNT,
  D8_AUTOMATIC_IAC_REDESIGN_RUNTIME_COUNT,
  D8_CANONICAL_MILESTONE_COUNT,
  D8_CERTIFICATION_RUNTIME_COUNT,
  D8_CONFORMANCE_DETERMINATION_RUNTIME_COUNT,
  D8_CONTROL_LOGIC_DESIGN_RUNTIME_COUNT,
  D8_CONTROL_LOOP_TUNING_RUNTIME_COUNT,
  D8_CONTROL_SYSTEM_ARCHITECTURE_RUNTIME_READY,
  D8_CONTROL_VALVE_SIZING_RUNTIME_COUNT,
  D8_CROSS_DISCIPLINE_CONFLICT_DETECTION_RUNTIME_COUNT,
  D8_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT,
  D8_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT,
  D8_CROSS_DISCIPLINE_RECOMMENDATION_RUNTIME_COUNT,
  D8_CURRENTNESS_DIGITAL_THREAD_RUNTIME_READY,
  D8_D9_RUNTIME_INTEGRATION_COUNT,
  D8_DISCIPLINE_INTERFACE_RUNTIME_READY,
  D8_EQUALS_D1_STRUCTURAL_AUTHORITY,
  D8_EQUALS_D2_CIVIL_AUTHORITY,
  D8_EQUALS_D3_GEOTECHNICAL_AUTHORITY,
  D8_EQUALS_D4_MECHANICAL_AUTHORITY,
  D8_EQUALS_D5_PIPING_AUTHORITY,
  D8_EQUALS_D6_PROCESS_AUTHORITY,
  D8_EQUALS_D7_ELECTRICAL_AUTHORITY,
  D8_EXPLICIT_LINEAGE_REQUIRED,
  D8_FUNCTIONAL_SAFETY_VALIDATION_RUNTIME_COUNT,
  D8_INFERRED_LINEAGE_ALLOWED,
  D8_INSTRUMENT_DEVICE_CONTEXT_RUNTIME_READY,
  D8_INSTRUMENT_SELECTION_RUNTIME_COUNT,
  D8_INSTRUMENT_SIZING_RUNTIME_COUNT,
  D8_INSTRUMENTATION_CONTROL_IDENTITY_RUNTIME_READY,
  D8_PROCESS_MEASUREMENT_TAG_RUNTIME_READY,
  D8_R10_SUBJECT_KINDS,
  D8_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY,
  D8_REVIEW_VALIDATION_RUNTIME_READY,
  D8_REUSES_CANONICAL_CURRENTNESS,
  D8_REUSES_CANONICAL_DIGITAL_THREAD,
  D8_REUSES_CANONICAL_FINGERPRINT,
  D8_RUNTIME_COUNT as R10_RUNTIME_COUNT,
  D8_SAFETY_INTERLOCK_SHUTDOWN_RUNTIME_READY,
  D8_SIGNAL_IO_CONTROL_LOOP_RUNTIME_READY,
  D8_SIL_CALCULATION_RUNTIME_COUNT,
  D8_SIL_VERIFICATION_RUNTIME_COUNT,
  D9_RUNTIME_COUNT,
  D9_RUNTIME_STARTED,
  DATABASE_SCHEMA_CHANGED,
  NEW_DEPENDENCY_ADDED,
  PARALLEL_D8_CURRENTNESS_ENGINE_CREATED,
  PARALLEL_D8_DIGITAL_THREAD_CREATED,
  SECOND_D8_FINGERPRINT_ALGORITHM_CREATED,
  STALE_D8_RECORD_EQUALS_INVALID,
  SUPERSEDED_D8_RECORD_EQUALS_INVALID,
  exposedIacCurrentness,
  type D8R10Store,
} from "./currentness-digital-thread";
import { D8_CONTEXT_AUTHORITY, D8_DISCIPLINE, type D8R1Actor } from "./identity-foundation";

export const D8_R11_STATUS = "D9_SOURCE_CONTRACT_IMPLEMENTED" as const;
export const D8_R11_MATURITY = D8_R11_STATUS;
export const D8_R11_MATURITY_STATE = D8_R11_STATUS;
export const D8_R11_CLOSEOUT_PATH = "docs/architecture/engineering-os/EOS_D8_R11_D9_SOURCE_CONTRACT_CLOSEOUT.md" as const;
export const D8_RUNTIME_STARTED = true as const;
export const D8_RUNTIME_COUNT = 11 as const;
export const D8_R10_RUNTIME_COUNT = R10_RUNTIME_COUNT;
export const D8_D9_SOURCE_CONTRACT_RUNTIME_IMPLEMENTED = true as const;
export const D8_D9_SOURCE_CONTRACT_RUNTIME_COUNT = 1 as const;
export const D8_D9_SOURCE_CONTRACT_RUNTIME_READY = true as const;
export const D8_R1_R10_EXACT_REVISIONS_REUSED = true as const;
export const EXACT_D8_R11_SOURCE_REVISION_REQUIRED = true as const;
export const FLOATING_D8_R11_SOURCE_REFERENCE_ALLOWED = false as const;
export const D8_R11_SOURCE_AUTO_REPOINTED = D1K_R3_SILENT_SOURCE_REPOINTING_ALLOWED;
export const D8_D9_SOURCE_CONTRACT_READ_ONLY = true as const;
export const D8_D9_SOURCE_CONTRACT_CAN_MUTATE_D8 = false as const;
export const D8_D9_SOURCE_CONTRACT_CAN_MUTATE_COUNTERPART_DISCIPLINE = false as const;
export const D8_R11_SOURCE_CONTRACT_FIELDS = D8_D9_SOURCE_CONTRACT_FIELDS;
export const D8_R11_SOURCE_CONTRACT_VERSION = "D8-D9-SOURCE-CONTRACT-1" as const;
export const D8_R11_SOURCE_CONTRACT_VERSION_GOVERNED = D8_D9_SOURCE_CONTRACT_ARCHITECTURE_DEFINED;
export const PARALLEL_D8_CONTRACT_VERSION_ENGINE_CREATED = false as const;
export const D8_R11_EXPOSES_IDENTITY_CONTEXT = true as const;
export const D9_IDENTITY_READ_EQUALS_D8_AUTHORITY = D8_D9_SOURCE_CONTRACT_TRANSFERS_IAC_AUTHORITY;
export const D8_R11_EXPOSES_MEASUREMENT_TAG_CONTEXT = true as const;
export const D9_MEASUREMENT_CONTEXT_EQUALS_VALIDATED_PROCESS_VALUE = false as const;
export const D9_TAG_CONTEXT_EQUALS_VALIDATED_IAC_DESIGN = false as const;
export const D8_R11_EXPOSES_INSTRUMENT_DEVICE_CONTEXT = true as const;
export const D9_DEVICE_CONTEXT_EQUALS_VALIDATED_INSTRUMENT_SELECTION = false as const;
export const D9_VENDOR_DATA_EQUALS_PROJECT_VALIDATION = false as const;
export const D8_R11_EXPOSES_SIGNAL_IO_LOOP_CONTEXT = true as const;
export const D9_SIGNAL_CONTEXT_EQUALS_VALIDATED_IO_DESIGN = false as const;
export const D9_LOOP_CONTEXT_EQUALS_CONTROL_LOGIC = false as const;
export const D8_R11_EXPOSES_CONTROL_SYSTEM_CONTEXT = true as const;
export const D9_CONTROL_SYSTEM_CONTEXT_EQUALS_VALIDATED_CONTROL_SYSTEM_DESIGN = false as const;
export const D9_NETWORK_CONTEXT_EQUALS_CYBERSECURITY_VALIDATED = false as const;
export const D8_R11_EXPOSES_SAFETY_INTERLOCK_SHUTDOWN_CONTEXT = true as const;
export const D9_SIF_CONTEXT_EQUALS_FUNCTIONAL_SAFETY_VALIDATED = false as const;
export const D9_SIL_CONTEXT_EQUALS_SIL_VERIFIED = false as const;
export const D9_CAUSE_EFFECT_CONTEXT_EQUALS_IMPLEMENTED_CONTROL_LOGIC = false as const;
export const D8_R11_EXPOSES_REQUIREMENT_CONTEXT = true as const;
export const D8_R11_EXPOSES_ASSUMPTION_CONTEXT = true as const;
export const D8_R11_EXPOSES_DECISION_CONTEXT = true as const;
export const D8_R11_EXPOSES_CHANGE_CONTEXT = true as const;
export const D8_R11_EXPOSES_REASSESSMENT_CONTEXT = true as const;
export const D9_REQUIREMENT_READ_EQUALS_REQUIREMENT_ADOPTION = false as const;
export const D9_ASSUMPTION_READ_EQUALS_VALIDATED_FACT = false as const;
export const D9_DECISION_READ_EQUALS_APPROVAL = false as const;
export const D9_CHANGE_READ_EQUALS_AUTOMATIC_REDESIGN = false as const;
export const D9_REASSESSMENT_READ_EQUALS_VALIDATION = false as const;
export const D8_R11_EXPOSES_DISCIPLINE_HANDOFF_CONTEXT = true as const;
export const D9_HANDOFF_READ_EQUALS_COUNTERPART_ENGINEERING_TRUTH = false as const;
export const D9_HANDOFF_READ_EQUALS_COUNTERPART_VALIDATED = false as const;
export const D9_HANDOFF_READ_EQUALS_AUTHORITY_TRANSFER = false as const;
export const D8_R11_EXPOSES_REVIEW_CONTEXT = true as const;
export const D8_R11_EXPOSES_FINDING_CONTEXT = true as const;
export const D8_R11_EXPOSES_VALIDATION_GOVERNANCE_CONTEXT = true as const;
export const D9_REVIEW_READ_EQUALS_ENGINEERING_VALIDATED = false as const;
export const D9_FINDING_READ_EQUALS_ENGINEERING_VALIDATED = false as const;
export const D9_VALIDATION_RECORD_READ_EQUALS_APPROVAL = false as const;
export const D8_R11_EXPOSES_CURRENTNESS = true as const;
export const D8_R11_EXPOSES_LINEAGE = true as const;
export const D8_R11_EXPOSES_DIGITAL_THREAD_RELATIONSHIPS = true as const;
export const D8_R11_EXPOSES_FINGERPRINT_STATUS = true as const;
export const D9_CURRENTNESS_READ_EQUALS_VALIDATION = false as const;
export const D9_LINEAGE_READ_EQUALS_ENGINEERING_AUTHORITY = false as const;
export const D9_FINGERPRINT_READ_EQUALS_APPROVAL = false as const;
export const D8_R11_EXACT_REVISION_EXPORT_REQUIRED = true as const;
export const D8_R11_FLOATING_CURRENT_EXPORT_ALLOWED = false as const;
export const D8_R11_HISTORICAL_REFERENCE_AUTO_REPOINTED = D1K_R3_SILENT_SOURCE_REPOINTING_ALLOWED;
export const D8_R11_D9_CONTRACT_AUTO_REPOINTS_SOURCE_REVISION = D1K_R3_SILENT_SOURCE_REPOINTING_ALLOWED;
export const D8_R11_PRESERVES_CURRENTNESS_STATE = true as const;
export const D9_CURRENT_RECORD_EQUALS_VALIDATED = false as const;
export const D9_STALE_RECORD_EQUALS_INVALID = false as const;
export const D9_SUPERSEDED_RECORD_EQUALS_INVALID = false as const;
export const D8_R11_PRESERVES_EXPLICIT_LINEAGE = true as const;
export const D8_R11_INFERRED_LINEAGE_ALLOWED = false as const;
export const D8_R11_PROVENANCE_REQUIRED = true as const;
export const D8_R11_PROVENANCE_PRESERVED = true as const;
export const D8_R11_APPLICABILITY_PRESERVED = true as const;
export const D8_R11_LIMITATIONS_PRESERVED = true as const;
export const D8_R11_AUTO_PROPAGATES_OUTSIDE_APPLICABILITY = false as const;
export const D8_R11_SOURCE_BASIS_PRESERVED = true as const;
export const D8_R11_SOURCE_BASIS_TRACEABLE = true as const;
export const TENANT_WORKSPACE_PROJECT_D8_R11_SCOPE_ENFORCED = true as const;
export const CROSS_TENANT_D8_R11_ACCESS_ALLOWED = false as const;
export const D8_R11_PRESERVES_AUTHORITY_METADATA = true as const;
export const D9_READ_ACCESS_EQUALS_D8_ENGINEERING_AUTHORITY = D8_D9_SOURCE_CONTRACT_TRANSFERS_IAC_AUTHORITY;
export const D9_READ_ACCESS_EQUALS_COUNTERPART_ENGINEERING_AUTHORITY = D8_D9_SOURCE_CONTRACT_TRANSFERS_ENGINEERING_AUTHORITY;
export const D9_EQUALS_D8_IAC_ENGINEERING_AUTHORITY = false as const;
export const D8_R11_CREATES_NEW_ENGINEERING_FACT = D8_D9_SOURCE_CONTRACT_CREATES_NEW_ENGINEERING_FACT;
export const D8_R11_CREATES_NEW_DERIVED_VALUE = D8_D9_SOURCE_CONTRACT_DERIVES_NEW_ENGINEERING_VALUE;
export const D8_R11_CREATES_NEW_REQUIREMENT = false as const;
export const D8_R11_CREATES_NEW_ASSUMPTION = false as const;
export const D8_R11_CREATES_NEW_ENGINEERING_DECISION = false as const;
export const D8_R11_CREATES_NEW_RECOMMENDATION = false as const;
export const D8_R11_PERFORMS_ENGINEERING_DERIVATION = false as const;
export const D8_R11_PERFORMS_NUMERIC_DERIVATION = false as const;
export const D8_R11_INFERS_MISSING_ENGINEERING_VALUE = false as const;
export const D8_R11_INFERS_RELATIONSHIP_FROM_NAME = false as const;
export const D8_R11_INFERS_RELATIONSHIP_FROM_TAG = false as const;
export const D8_R11_INFERS_RELATIONSHIP_FROM_DOCUMENT_PROXIMITY = false as const;
export const D8_R11_INFERS_RELATIONSHIP_FROM_SEMANTIC_SIMILARITY = false as const;
export const D8_R11_PERFORMS_CROSS_DISCIPLINE_CONFLICT_DETECTION = false as const;
export const D8_R11_PERFORMS_CROSS_DISCIPLINE_CONFLICT_RESOLUTION = false as const;
export const D8_R11_GENERATES_CROSS_DISCIPLINE_RECOMMENDATION = false as const;
export const D8_R11_GENERATES_ENGINEERING_RECOMMENDATION = false as const;
export const D8_R11_AUTO_MUTATES_R1_IDENTITY = false as const;
export const D8_R11_AUTO_MUTATES_R2_MEASUREMENT_TAG_CONTEXT = false as const;
export const D8_R11_AUTO_MUTATES_R3_INSTRUMENT_DEVICE_CONTEXT = false as const;
export const D8_R11_AUTO_MUTATES_R4_SIGNAL_IO_LOOP_CONTEXT = false as const;
export const D8_R11_AUTO_MUTATES_R5_CONTROL_SYSTEM_CONTEXT = false as const;
export const D8_R11_AUTO_MUTATES_R6_SAFETY_CONTEXT = false as const;
export const D8_R11_AUTO_MUTATES_R7_CHANGE_GOVERNANCE = false as const;
export const D8_R11_AUTO_MUTATES_R8_INTERFACE_HANDOFF = false as const;
export const D8_R11_AUTO_MUTATES_R9_REVIEW_VALIDATION = false as const;
export const D8_R11_AUTO_MUTATES_R10_CURRENTNESS_THREAD = false as const;
export const D8_R11_AUTO_MUTATES_D1_STRUCTURAL = false as const;
export const D8_R11_AUTO_MUTATES_D2_CIVIL = false as const;
export const D8_R11_AUTO_MUTATES_D3_GEOTECHNICAL = false as const;
export const D8_R11_AUTO_MUTATES_D4_MECHANICAL = false as const;
export const D8_R11_AUTO_MUTATES_D5_PIPING = false as const;
export const D8_R11_AUTO_MUTATES_D6_PROCESS = false as const;
export const D8_R11_AUTO_MUTATES_D7_ELECTRICAL = false as const;
export const D8_R11_PERFORMS_AUTOMATIC_ENGINEERING_VALIDATION = false as const;
export const D8_R11_PROMOTES_SOURCE_TO_VALIDATED = false as const;
export const D8_R11_PROMOTES_CURRENT_TO_VALIDATED = false as const;
export const D8_R11_CONTRACT_FINGERPRINT_VERIFICATION_IMPLEMENTED = true as const;
export const D8_R11_CONTRACT_FINGERPRINT_MISMATCH_AUTO_REPAIRED = false as const;
export const D8_R11_CONTRACT_FINGERPRINT_MISMATCH_AUTO_REBASELINED = false as const;
export const D8_R11_CONTRACT_HISTORY_PRESERVED = true as const;
export const SILENT_D8_R11_CONTRACT_MUTATION_ALLOWED = false as const;
export const AI_CAN_INVENT_D8_R11_AUTHORITATIVE_SOURCE_FACT = false as const;
export const AI_CAN_INVENT_D8_R11_AUTHORITATIVE_RELATIONSHIP = false as const;
export const AI_CAN_PROMOTE_D9_READ_ACCESS_TO_ENGINEERING_AUTHORITY = false as const;
export const ADMIN_CAN_BYPASS_D8_R11_AUTHORITY_BOUNDARY = false as const;
export const D8_R11_DUPLICATE_GOVERNANCE_IMPLEMENTED = true as const;
export const D8_R11_REPLAY_PROTECTION_IMPLEMENTED = true as const;
export const D8_R11_SPOOFING_PROTECTION_IMPLEMENTED = true as const;
export const D8_R12_CANONICAL_PHASE = D8_IMPLEMENTATION_PHASES[11];
export const D8_R12_PHASE_TYPE = D8_IMPLEMENTATION_PHASE_TYPES[11];
export const D8_R12_CANONICAL_SCOPE = "Perform the bounded D8 Instrumentation and Control closeout over D8-0 and R1-R11. Verify the canonical milestone count, that R1-R11 substantive runtimes are ready, that the substantive runtime count is 11, and that R12 adds no engineering runtime. Preserve zero I&C calculation and design automation, zero D9 runtime, a read-only D9 source contract, authority boundaries, canonical currentness, thread, and fingerprint, and review and validation truth boundaries. Document limitations explicitly. Mark D8 complete only as COMPLETE_BOUNDED_WITH_LIMITATIONS if the closeout gates pass. Do not claim engineering conformance, approval, certification, regulatory approval, automatic functional-safety validation, D9 completion, or EOS GA readiness." as const;
export const D8_R12_STARTED = false as const;
export const D8_R12_NEW_SUBSTANTIVE_RUNTIME_COUNT = 0 as const;
export const D8_R11_READY_FOR_NEXT_PHASE = true as const;
export const D8_R11_NEXT_PHASE = D8_R12_CANONICAL_PHASE;
export const D8_R11_NEXT_PHASE_TYPE = D8_R12_PHASE_TYPE;
export const D8_R11_CANONICAL_NEXT_PHASE = D8_R12_CANONICAL_PHASE;
export const D8_R11_CANONICAL_NEXT_PHASE_SCOPE = D8_R12_CANONICAL_SCOPE;
export const D8_R11_BLOCKER = "NONE" as const;
export const D8_R11_MACHINE_READABLE_ROADMAP_UPDATED = true as const;
export const D8_R11_STANDING_LIMITATION = "This source contract exposes governed Instrumentation and Control facts for future D9 consumption. It does not create facts, derive values, infer relationships, transfer authority, or start D9." as const;
export const UNAUTHORIZED_D8_R12_RUNTIME_PROMOTION = false as const;

export {
  D8_CURRENTNESS_DIGITAL_THREAD_RUNTIME_READY,
  D8_INSTRUMENTATION_CONTROL_IDENTITY_RUNTIME_READY,
  D8_PROCESS_MEASUREMENT_TAG_RUNTIME_READY,
  D8_INSTRUMENT_DEVICE_CONTEXT_RUNTIME_READY,
  D8_SIGNAL_IO_CONTROL_LOOP_RUNTIME_READY,
  D8_CONTROL_SYSTEM_ARCHITECTURE_RUNTIME_READY,
  D8_SAFETY_INTERLOCK_SHUTDOWN_RUNTIME_READY,
  D8_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY,
  D8_DISCIPLINE_INTERFACE_RUNTIME_READY,
  D8_REVIEW_VALIDATION_RUNTIME_READY,
  D8_REUSES_CANONICAL_CURRENTNESS,
  PARALLEL_D8_CURRENTNESS_ENGINE_CREATED,
  D8_REUSES_CANONICAL_DIGITAL_THREAD,
  PARALLEL_D8_DIGITAL_THREAD_CREATED,
  D8_REUSES_CANONICAL_FINGERPRINT,
  SECOND_D8_FINGERPRINT_ALGORITHM_CREATED,
  D8_EXPLICIT_LINEAGE_REQUIRED,
  D8_INFERRED_LINEAGE_ALLOWED,
  CURRENT_D8_RECORD_EQUALS_VALIDATED,
  CURRENT_D8_RECORD_EQUALS_APPROVED,
  CURRENT_D8_RECORD_EQUALS_CONFORMANT,
  STALE_D8_RECORD_EQUALS_INVALID,
  SUPERSEDED_D8_RECORD_EQUALS_INVALID,
  D8_INSTRUMENT_SIZING_RUNTIME_COUNT,
  D8_INSTRUMENT_SELECTION_RUNTIME_COUNT,
  D8_CONTROL_VALVE_SIZING_RUNTIME_COUNT,
  D8_ACTUATOR_SIZING_RUNTIME_COUNT,
  D8_CONTROL_LOOP_TUNING_RUNTIME_COUNT,
  D8_CONTROL_LOGIC_DESIGN_RUNTIME_COUNT,
  D8_AUTOMATIC_CONTROL_LOGIC_GENERATION_RUNTIME_COUNT,
  D8_SIL_CALCULATION_RUNTIME_COUNT,
  D8_SIL_VERIFICATION_RUNTIME_COUNT,
  D8_FUNCTIONAL_SAFETY_VALIDATION_RUNTIME_COUNT,
  D8_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT,
  D8_CONFORMANCE_DETERMINATION_RUNTIME_COUNT,
  D8_APPROVAL_RUNTIME_COUNT,
  D8_CERTIFICATION_RUNTIME_COUNT,
  D8_AUTOMATIC_IAC_DESIGN_RUNTIME_COUNT,
  D8_AUTOMATIC_IAC_REDESIGN_RUNTIME_COUNT,
  D8_D9_RUNTIME_INTEGRATION_COUNT,
  D8_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT,
  D8_CROSS_DISCIPLINE_CONFLICT_DETECTION_RUNTIME_COUNT,
  D8_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT,
  D8_CROSS_DISCIPLINE_RECOMMENDATION_RUNTIME_COUNT,
  D8_EQUALS_D1_STRUCTURAL_AUTHORITY,
  D8_EQUALS_D2_CIVIL_AUTHORITY,
  D8_EQUALS_D3_GEOTECHNICAL_AUTHORITY,
  D8_EQUALS_D4_MECHANICAL_AUTHORITY,
  D8_EQUALS_D5_PIPING_AUTHORITY,
  D8_EQUALS_D6_PROCESS_AUTHORITY,
  D8_EQUALS_D7_ELECTRICAL_AUTHORITY,
  AI_EQUALS_D8_IAC_ENGINEERING_AUTHORITY,
  ADMIN_EQUALS_D8_IAC_ENGINEERING_AUTHORITY,
  D1_STRUCTURAL_PACK_COMPLETE,
  D1N_REOPENED,
  D2_TRACK_COMPLETE,
  D2_REOPENED,
  D3_TRACK_COMPLETE,
  D3_REOPENED,
  D4_TRACK_COMPLETE,
  D4_REOPENED,
  D5_TRACK_COMPLETE,
  D5_REOPENED,
  D6_TRACK_COMPLETE,
  D6_STATUS,
  D6_REOPENED,
  D7_TRACK_COMPLETE,
  D7_STATUS,
  D7_REOPENED,
  D9_RUNTIME_STARTED,
  D9_RUNTIME_COUNT,
  DATABASE_SCHEMA_CHANGED,
  NEW_DEPENDENCY_ADDED,
  D8_CANONICAL_MILESTONE_COUNT,
};

const FLOATING = new Set(["latest", "current", "newest", "head", "active", "active model", "now"]);
const INFERRED = new Set(["inferred", "similarity", "semantic", "semantic_similarity", "tag_name", "tag_match", "similar_tag", "document_proximity", "filename", "name", "tag"]);
type Currentness = (typeof D8_CURRENTNESS_STATES)[number];
type SubjectKind = (typeof D8_R10_SUBJECT_KINDS)[number];
type Prohibited = {
  infer?: boolean;
  inferFromName?: boolean;
  inferFromTag?: boolean;
  documentProximity?: boolean;
  semantic?: boolean;
  derive?: boolean;
  numeric?: boolean;
  fillMissing?: boolean;
  createRequirement?: boolean;
  createAssumption?: boolean;
  createDecision?: boolean;
  recommend?: boolean;
  detectConflict?: boolean;
  resolveConflict?: boolean;
  validate?: boolean;
  promoteValidated?: boolean;
  approve?: boolean;
  certify?: boolean;
  transferAuthority?: boolean;
  mutateUpstream?: boolean;
  mutateCounterpart?: boolean;
  repoint?: boolean;
  repairFingerprint?: boolean;
  rebaselineFingerprint?: boolean;
  d9Reasoning?: boolean;
  stripProvenance?: boolean;
  stripLimitations?: boolean;
  stripApplicability?: boolean;
};

export type D8R11Actor = D8R1Actor & { actorKind?: string };
export type D8R11SourceContractInput = Prohibited & {
  contractId: string;
  contractVersion: string;
  contextId: string;
  objectId: string;
  sourceRevision: string;
  citedCurrentness: string;
  provenanceRef: string;
  assertedFingerprint?: string | null;
  tenantId?: string;
  workspaceId?: string;
  projectId?: string;
};

type Item = {
  subjectId: string;
  exactRevision: string;
  fingerprint: string;
  currentness: Currentness;
  sourceBasisRef: string;
  applicability: string;
  limitations: string;
  authority: string;
  engineeringValidated: boolean;
  approved: false;
  conformant: false;
};

export type D8R11SourceContract = {
  contractId: string;
  contractVersion: typeof D8_R11_SOURCE_CONTRACT_VERSION;
  contextId: string;
  objectId: string;
  exactRevision: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  discipline: typeof D8_DISCIPLINE;
  currentness: Currentness;
  authority: typeof D8_CONTEXT_AUTHORITY;
  authorityTransferred: false;
  readOnly: true;
  engineeringFactCreated: false;
  derivedValueCreated: false;
  requirementCreated: false;
  assumptionCreated: false;
  decisionCreated: false;
  recommendationCreated: false;
  conflictDetected: false;
  conflictResolved: false;
  d9Started: false;
  validatesEngineering: false;
  approved: false;
  conformant: false;
  certified: false;
  fields: Record<(typeof D8_D9_SOURCE_CONTRACT_FIELDS)[number], unknown>;
  provenanceRef: string;
  fingerprint: string;
  fingerprintMatchEqualsApproval: false;
  fingerprintMatchEqualsValidated: false;
  recordedBy: string;
  recordedAt: string;
  recordStatus: "CURRENT";
};

export type D8R11History = { historyId: string; contractId: string; action: "CREATED"; fingerprint: string; recordedAt: string };
export type D8R11Store = { r10: D8R10Store; now: () => string; contracts: D8R11SourceContract[]; history: D8R11History[] };

function fail(code: string): never {
  throw new Error(`D8_R11_${code}`);
}

function blockedParty(value: string): boolean {
  const token = value.toUpperCase();
  return token === "AI" || token.startsWith("AI_") || token.startsWith("AI-") || token.startsWith("AI ") || token.includes("LLM") || token.includes("OPTIMIZER");
}

function explicit(value: string, code: string): string {
  const token = value.trim();
  if (!token || FLOATING.has(token.toLowerCase())) fail(code);
  if (INFERRED.has(token.toLowerCase()) || blockedParty(token)) fail("INFERRED_RELATIONSHIP_REJECTED");
  if (/[=]|calc\(|solve\(/i.test(token)) fail("DERIVATION_NOT_IN_R11");
  return token;
}

function isCurrentness(value: string): value is Currentness {
  return (D8_CURRENTNESS_STATES as readonly string[]).includes(value);
}

function assertProhibited(input: Prohibited): void {
  if (input.infer === true || input.inferFromName === true || input.inferFromTag === true || input.documentProximity === true || input.semantic === true) fail("INFERRED_RELATIONSHIP_REJECTED");
  if (input.derive === true || input.numeric === true || input.fillMissing === true) fail("DERIVATION_NOT_IN_R11");
  if (input.createRequirement === true) fail("REQUIREMENT_CREATION_REJECTED");
  if (input.createAssumption === true) fail("ASSUMPTION_CREATION_REJECTED");
  if (input.createDecision === true) fail("DECISION_CREATION_REJECTED");
  if (input.recommend === true) fail("RECOMMENDATION_NOT_IN_R11");
  if (input.detectConflict === true) fail("CONFLICT_DETECTION_NOT_IN_R11");
  if (input.resolveConflict === true) fail("CONFLICT_RESOLUTION_NOT_IN_R11");
  if (input.validate === true || input.promoteValidated === true) fail("VALIDATION_NOT_IN_R11");
  if (input.approve === true) fail("APPROVAL_NOT_IN_R11");
  if (input.certify === true) fail("CERTIFICATION_NOT_IN_R11");
  if (input.transferAuthority === true) fail("AUTHORITY_TRANSFER_REJECTED");
  if (input.mutateUpstream === true) fail("UPSTREAM_MUTATION_REJECTED");
  if (input.mutateCounterpart === true) fail("COUNTERPART_MUTATION_REJECTED");
  if (input.repoint === true) fail("AUTO_REPOINT_REJECTED");
  if (input.repairFingerprint === true || input.rebaselineFingerprint === true) fail("FINGERPRINT_REBASELINE_REJECTED");
  if (input.d9Reasoning === true) fail("D9_NOT_STARTED");
  if (input.stripProvenance === true) fail("PROVENANCE_STRIPPING_REJECTED");
  if (input.stripLimitations === true) fail("LIMITATION_STRIPPING_REJECTED");
  if (input.stripApplicability === true) fail("APPLICABILITY_STRIPPING_REJECTED");
}

function assertScope(actor: D8R11Actor, input: { tenantId?: string; workspaceId?: string; projectId?: string }): void {
  if (!actor.actorId.trim() || !actor.tenantId.trim() || !actor.workspaceId.trim() || !actor.projectId.trim()) fail("SCOPE_REQUIRED");
  if (input.tenantId != null && input.tenantId !== actor.tenantId) fail("CROSS_TENANT_OPERATION");
  if (input.workspaceId != null && input.workspaceId !== actor.workspaceId) fail("CROSS_WORKSPACE_OPERATION");
  if (input.projectId != null && input.projectId !== actor.projectId) fail("CROSS_PROJECT_OPERATION");
}

function assertRecorder(actor: D8R11Actor): void {
  if (blockedParty(actor.actorId) || blockedParty(actor.authority) || actor.actorKind === "ai") fail("AI_NOT_IAC_AUTHORITY");
  if (actor.authority === "ADMIN" || actor.authority === "ADMINISTRATOR" || actor.actorId === "ADMIN" || actor.actorId === "ADMINISTRATOR") fail("ADMIN_CANNOT_OVERRIDE");
  if (actor.authority === "IAC_VALIDATION_AUTHORITY" || actor.authority === "REVIEWER" || actor.authority === "IAC_ENGINEERING_AUTHORITY" || actor.authority === "D9") fail("AUTHORITY_SPOOFING_REJECTED");
  if (actor.authority !== D8_CONTEXT_AUTHORITY) fail("UNAUTHORIZED");
}

function kept(value: string): string {
  if (/[=]|calc\(|solve\(/i.test(value)) fail("DERIVATION_NOT_IN_R11");
  return value;
}

function shown(store: D8R11Store, kind: string, subjectId: string, revision: string, fingerprint: string, contextId: string, stored: string): Currentness {
  const value = (D8_R10_SUBJECT_KINDS as readonly string[]).includes(kind)
    ? exposedIacCurrentness(store.r10, { subjectKind: kind as SubjectKind, subjectId, subjectRevision: revision, subjectFingerprint: fingerprint, contextId })
    : stored;
  if (!isCurrentness(value)) fail("CURRENTNESS_INVALID");
  return value;
}

function item(subjectId: string, exactRevision: string, fingerprint: string, currentness: Currentness, sourceBasisRef: string, applicability: string, limitations: string, authority: string, engineeringValidated = false): Item {
  return {
    subjectId,
    exactRevision,
    fingerprint,
    currentness,
    sourceBasisRef: explicit(sourceBasisRef, "MISSING_SOURCE_BASIS"),
    applicability: kept(applicability),
    limitations: kept(limitations),
    authority,
    engineeringValidated: currentness === "CURRENT" && engineeringValidated,
    approved: false,
    conformant: false,
  };
}

function byId<T extends { subjectId: string }>(rows: T[]): T[] {
  return [...rows].sort((left, right) => left.subjectId.localeCompare(right.subjectId));
}

function snapshot(store: D8R11Store): string {
  const r8 = store.r10.r9.r8;
  const r7 = r8.r7;
  const r6 = r7.r6;
  const r5 = r6.r5;
  const r4 = r5.r4;
  const r3 = r4.r3;
  const r2 = r3.r2;
  return JSON.stringify({
    objects: r2.r1.objects,
    measurements: r2.measurements,
    tags: r2.tags,
    devices: r3.devices,
    signals: r4.signals,
    ioRecords: r4.ioRecords,
    loops: r4.loops,
    systems: r5.systems,
    networks: r5.networks,
    contexts: r6.contexts,
    requirements: r7.requirements,
    assumptions: r7.assumptions,
    decisions: r7.decisions,
    changes: r7.changes,
    reassessments: r7.reassessments,
    handoffs: r8.handoffs,
    requests: store.r10.r9.requests,
    findings: store.r10.r9.findings,
    validations: store.r10.r9.validations,
    edges: store.r10.edges,
    marks: store.r10.marks,
    supersessions: store.r10.supersessions,
  });
}

export function createD8R11Store(r10: D8R10Store, now: () => string = () => r10.now()): D8R11Store {
  if (R10_RUNTIME_COUNT !== 10) fail("R10_RUNTIME_COUNT_UNEXPECTED");
  const r1 = r10.r9.r8.r7.r6.r5.r4.r3.r2.r1;
  if (!Array.isArray(r1.objects) || r10.r9.r8.r7.r6.r5.r4.r3.r2.r1 !== r1) fail("R1_R10_STORE_MISMATCH");
  return { r10, now, contracts: [], history: [] };
}

export function recordIacD9SourceContract(store: D8R11Store, actor: D8R11Actor, input: D8R11SourceContractInput): D8R11SourceContract {
  assertRecorder(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const cited = input.citedCurrentness.trim();
  if (!isCurrentness(cited)) fail("CURRENTNESS_INVALID");
  if (input.contractVersion !== D8_R11_SOURCE_CONTRACT_VERSION) fail("CONTRACT_VERSION_NOT_GOVERNED");
  const contextId = explicit(input.contextId, "R1_CONTEXT_REQUIRED");
  const r8 = store.r10.r9.r8;
  const r7 = r8.r7;
  const r6 = r7.r6;
  const r5 = r6.r5;
  const r4 = r5.r4;
  const r3 = r4.r3;
  const r2 = r3.r2;
  const r1 = r2.r1;
  const context = r1.contexts.find((row) => row.contextId === contextId);
  if (!context || context.tenantId !== actor.tenantId || context.workspaceId !== actor.workspaceId || context.projectId !== actor.projectId) fail("R1_CONTEXT_NOT_FOUND");
  if (context.discipline !== D8_DISCIPLINE) fail("DISCIPLINE_NOT_IAC");
  const objectId = explicit(input.objectId, "OBJECT_REFERENCE_REQUIRED");
  const sourceRevision = explicit(input.sourceRevision, "SUBJECT_REVISION_REQUIRED");
  const object = r1.objects.find((row) => row.objectId === objectId && row.contextId === context.contextId && row.tenantId === actor.tenantId);
  if (!object || object.provenanceRef !== sourceRevision) fail("SUBJECT_REVISION_MISMATCH");
  if (!(D8_IAC_OBJECT_TYPES as readonly string[]).includes(object.objectType)) fail("OBJECT_TYPE_NOT_AUTHORITATIVE");
  const currentness = shown(store, "OBJECT", object.objectId, object.provenanceRef, object.fingerprint, context.contextId, object.currentness);
  if (cited === "CURRENT" && currentness !== "CURRENT") fail("CURRENTNESS_MISMATCH");
  if (cited !== currentness) fail("CURRENTNESS_MISMATCH");
  const provenanceRef = explicit(input.provenanceRef, "MISSING_PROVENANCE");
  const contractId = explicit(input.contractId, "CONTRACT_ID_REQUIRED");
  const sameObject = <T extends { objectId: string; objectRevisionFingerprint: string; tenantId: string }>(rows: readonly T[]) => rows.filter((row) => row.objectId === object.objectId && row.objectRevisionFingerprint === object.fingerprint && row.tenantId === actor.tenantId);
  const measurements = byId(sameObject(r2.measurements).map((row) => ({ ...item(row.measurementRecordId, row.provenanceRef, row.fingerprint, shown(store, "MEASUREMENT", row.measurementRecordId, row.provenanceRef, row.fingerprint, row.contextId, row.currentness), row.sourceBasisRef, row.applicability, row.limitations, row.authority), validatedProcessValue: false as const, processCalculation: false as const })));
  const tags = byId(sameObject(r2.tags).map((row) => ({ ...item(row.tagRecordId, row.provenanceRef, row.fingerprint, shown(store, "TAG", row.tagRecordId, row.provenanceRef, row.fingerprint, row.contextId, row.currentness), row.sourceBasisRef, row.applicability, row.limitations, row.authority), tagToken: kept(row.tagToken), validatedIacDesign: false as const })));
  const devices = byId(sameObject(r3.devices).map((row) => ({ ...item(row.deviceRecordId, row.provenanceRef, row.fingerprint, shown(store, "DEVICE", row.deviceRecordId, row.provenanceRef, row.fingerprint, row.contextId, row.currentness), row.sourceBasisRef, row.applicability, row.limitations, row.authority), deviceClass: row.deviceClass, manufacturer: row.manufacturer, modelReference: row.modelReference, validatedInstrumentSelection: false as const, vendorDataValidated: false as const })));
  const signals = byId(sameObject(r4.signals).map((row) => ({ ...item(row.signalRecordId, row.provenanceRef, row.fingerprint, shown(store, "SIGNAL", row.signalRecordId, row.provenanceRef, row.fingerprint, row.contextId, row.currentness), row.sourceBasisRef, row.applicability, row.limitations, row.authority), signalType: row.signalType, validatedIoDesign: false as const })));
  const ioRecords = byId(sameObject(r4.ioRecords).map((row) => ({ ...item(row.ioRecordId, row.provenanceRef, row.fingerprint, shown(store, "IO", row.ioRecordId, row.provenanceRef, row.fingerprint, row.contextId, row.currentness), row.sourceBasisRef, row.applicability, row.limitations, row.authority), suppliedIoType: row.suppliedIoType, validatedIoDesign: false as const, allocatedByEos: false as const })));
  const loops = byId(sameObject(r4.loops).map((row) => ({ ...item(row.loopRecordId, row.provenanceRef, row.fingerprint, shown(store, "LOOP", row.loopRecordId, row.provenanceRef, row.fingerprint, row.contextId, row.currentness), row.sourceBasisRef, row.applicability, row.limitations, row.authority), loopPurpose: row.loopPurpose, controlLogic: false as const, tuned: false as const })));
  const systems = byId(sameObject(r5.systems).map((row) => ({ ...item(row.systemRecordId, row.provenanceRef, row.fingerprint, shown(store, "SYSTEM", row.systemRecordId, row.provenanceRef, row.fingerprint, row.contextId, row.currentness), row.sourceBasisRef, row.applicability, row.limitations, row.authority), systemType: row.systemType, validatedDesign: false as const, configured: false as const })));
  const networks = byId(r5.networks.filter((row) => row.tenantId === actor.tenantId && ((row.sourceObjectId === object.objectId && row.sourceObjectRevisionFingerprint === object.fingerprint) || (row.destinationObjectId === object.objectId && row.destinationObjectRevisionFingerprint === object.fingerprint))).map((row) => ({ ...item(row.networkRecordId, row.provenanceRef, row.fingerprint, shown(store, "NETWORK", row.networkRecordId, row.provenanceRef, row.fingerprint, context.contextId, row.currentness), row.sourceBasisRef, row.applicability, row.limitations, D8_CONTEXT_AUTHORITY), cybersecurityValidated: false as const, validatedNetworkDesign: false as const })));
  const safety = byId(sameObject(r6.contexts).map((row) => ({ ...item(row.contextRecordId, row.provenanceRef, row.fingerprint, shown(store, "SAFETY", row.contextRecordId, row.provenanceRef, row.fingerprint, row.contextId, row.currentness), row.sourceBasisRef, row.applicability, row.limitations, row.authority), kind: row.kind, suppliedSilRequirement: row.suppliedSilRequirement, functionalSafetyValidated: false as const, silVerified: false as const, logicImplemented: false as const })));
  const requirements = byId(sameObject(r7.requirements).map((row) => ({ ...item(row.requirementId, row.provenanceRef, row.fingerprint, shown(store, "REQUIREMENT", row.requirementId, row.provenanceRef, row.fingerprint, context.contextId, row.currentness), row.sourceBasisRef, row.applicability, row.limitations, row.authority), statement: kept(row.statement), adopted: row.adopted, createdByContract: false as const })));
  const assumptions = byId(sameObject(r7.assumptions).map((row) => ({ ...item(row.assumptionId, row.provenanceRef, row.fingerprint, shown(store, "ASSUMPTION", row.assumptionId, row.provenanceRef, row.fingerprint, context.contextId, row.currentness), row.sourceBasisRef, row.applicability, row.limitations, row.authorityId), statement: kept(row.statement), validatedFact: false as const, createdByContract: false as const })));
  const decisions = byId(sameObject(r7.decisions).map((row) => ({ ...item(row.decisionId, row.provenanceRef, row.fingerprint, shown(store, "DECISION", row.decisionId, row.provenanceRef, row.fingerprint, context.contextId, row.currentness), row.sourceBasisRef, row.applicability, row.limitations, row.authorityId), statement: kept(row.statement), approved: false as const, createdByContract: false as const })));
  const changes = byId(sameObject(r7.changes).map((row) => ({ ...item(row.changeId, row.provenanceRef, row.fingerprint, shown(store, "CHANGE", row.changeId, row.provenanceRef, row.fingerprint, context.contextId, row.currentness), row.sourceBasisRef, row.applicability, row.limitations, row.authorityId), changeCategory: row.changeCategory, dependencies: row.dependencies, automaticRedesign: false as const })));
  const reassessments = byId(sameObject(r7.reassessments).map((row) => {
    const change = r7.changes.find((entry) => entry.changeId === row.changeId && entry.tenantId === actor.tenantId);
    if (!change) fail("MISSING_SOURCE_BASIS");
    return { ...item(row.reassessmentId, row.fingerprint, row.fingerprint, shown(store, "REASSESSMENT", row.reassessmentId, row.fingerprint, row.fingerprint, context.contextId, row.currentness), change.sourceBasisRef, change.applicability, change.limitations, change.authorityId), state: row.state, changeId: change.changeId, changeFingerprint: change.fingerprint, validated: false as const, designInvalid: false as const };
  }));
  const handoffs = byId(sameObject(r8.handoffs).map((row) => ({ ...item(row.handoffId, row.provenanceRef, row.fingerprint, shown(store, "HANDOFF", row.handoffId, row.provenanceRef, row.fingerprint, row.contextId, row.currentness), row.sourceBasisRef, row.applicability, row.limitations, row.authority), handoffStatus: row.handoffStatus, counterpart: row.counterpart, counterpartTruth: false as const, counterpartValidated: false as const, authorityTransferred: false as const })));
  const reviews = byId(sameObject(store.r10.r9.requests).map((row) => ({ ...item(row.reviewRequestId, row.provenanceRef, row.fingerprint, shown(store, "REVIEW_REQUEST", row.reviewRequestId, row.provenanceRef, row.fingerprint, row.contextId, row.currentness), row.sourceBasisRef, row.applicability, row.limitations, D8_CONTEXT_AUTHORITY), reviewCompleted: row.reviewCompleted, engineeringValidated: false as const })));
  const findings = byId(sameObject(store.r10.r9.findings).map((row) => ({ ...item(row.findingId, row.provenanceRef, row.fingerprint, shown(store, "FINDING", row.findingId, row.provenanceRef, row.fingerprint, row.contextId, row.currentness), row.sourceBasisRef, row.applicability, row.limitations, row.reviewerAuthority), disposition: row.disposition, engineeringValidated: false as const })));
  const validations = byId(sameObject(store.r10.r9.validations).map((row) => ({ ...item(row.validationId, row.provenanceRef, row.fingerprint, shown(store, "VALIDATION", row.validationId, row.provenanceRef, row.fingerprint, row.contextId, row.currentness), row.sourceBasisRef, row.applicability, row.limitations, row.validationAuthority, row.engineeringValidated && row.validationState === "VALIDATED"), validationState: row.validationState, basis: row.basis.map((entry) => ({ kind: entry.kind, id: entry.id, fingerprint: entry.fingerprint, provenanceRef: entry.provenanceRef })), approved: false as const })));
  const exposed = new Set<string>([object.objectId, ...[...measurements, ...tags, ...devices, ...signals, ...ioRecords, ...loops, ...systems, ...networks, ...safety, ...requirements, ...assumptions, ...decisions, ...changes, ...reassessments, ...handoffs, ...reviews, ...findings, ...validations].map((row) => row.subjectId)]);
  const lineage = store.r10.edges.filter((row) => row.contextId === context.contextId && row.tenantId === actor.tenantId && row.edgeClass === "LINEAGE" && (exposed.has(row.source.subjectId) || exposed.has(row.target.subjectId))).map((row) => {
    const governed = isGovernedRelationType(row.relationshipType) ? relationSemantics(row.relationshipType) : null;
    return { edgeId: row.edgeId, relationshipType: governed?.code ?? row.relationshipType, source: row.source, target: row.target, fingerprint: row.fingerprint, inferred: false as const, engineeringAuthority: false as const };
  }).sort((left, right) => left.edgeId.localeCompare(right.edgeId));
  const threads = store.r10.edges.filter((row) => row.contextId === context.contextId && row.tenantId === actor.tenantId && row.edgeClass === "THREAD" && (exposed.has(row.source.subjectId) || exposed.has(row.target.subjectId))).map((row) => {
    const governed = isGovernedRelationType(row.relationshipType) ? relationSemantics(row.relationshipType) : null;
    return { edgeId: row.edgeId, relationshipType: governed?.code ?? row.relationshipType, source: row.source, target: row.target, fingerprint: row.fingerprint, inferred: false as const, engineeringAuthority: false as const, requirementAdopted: false as const };
  }).sort((left, right) => left.edgeId.localeCompare(right.edgeId));
  const marks = store.r10.marks.filter((row) => row.contextId === context.contextId && row.tenantId === actor.tenantId && exposed.has(row.subject.subjectId)).map((row) => ({ eventId: row.eventId, subject: row.subject, currentness: row.currentness, fingerprint: row.fingerprint, engineeringValidated: false as const, invalid: false as const, approved: false as const }));
  const limitations = [D8_R11_STANDING_LIMITATION, object.limitations, ...[...measurements, ...handoffs, ...reviews, ...validations].map((row) => row.limitations)].filter((row, index, all) => row.trim().length > 0 && all.indexOf(row) === index).sort();
  if (!limitations.some((row) => row.includes(object.objectId) || row === D8_R11_STANDING_LIMITATION)) fail("LIMITATIONS_REQUIRED");
  const applicability = [object.applicability, ...[...measurements, ...handoffs, ...reviews].map((row) => row.applicability)].filter((row, index, all) => row.includes(object.objectId) && all.indexOf(row) === index).sort();
  if (applicability.length === 0) fail("APPLICABILITY_REQUIRED");
  const projection = {
    IDENTITY: { objectId: object.objectId, objectType: object.objectType, exactRevision: object.provenanceRef, fingerprint: object.fingerprint, sourceBasisRef: object.sourceBasisRef, provenanceRef: object.provenanceRef, contextId: context.contextId, discipline: D8_DISCIPLINE, authority: D8_CONTEXT_AUTHORITY, currentness, validatedDesign: false as const, newIdentityCreated: false as const },
    MEASUREMENT_OR_INSTRUMENT: { measurements, tags, devices, validatedProcessValue: false as const, validatedIacDesign: false as const, validatedInstrumentSelection: false as const, vendorDataValidated: false as const },
    SIGNAL_IO_OR_CONTROL_LOOP: { signals, ioRecords, loops, validatedIoDesign: false as const, controlLogic: false as const },
    CONTROL_SYSTEM: { systems, networks, validatedDesign: false as const, cybersecurityValidated: false as const },
    ALARM_INTERLOCK_OR_SHUTDOWN: { safety, functionalSafetyValidated: false as const, silVerified: false as const, logicImplemented: false as const },
    FUNCTIONAL_SAFETY_CONTEXT: { safety, functionalSafetyValidated: false as const, silVerified: false as const },
    REQUIREMENTS: requirements,
    ASSUMPTIONS: assumptions,
    ENGINEERING_DECISIONS: decisions,
    EVIDENCE: validations.map((row) => ({ validationId: row.subjectId, exactRevision: row.exactRevision, basis: row.basis, createdByContract: false as const })),
    INTERFACES: handoffs,
    REVIEW_VALIDATION: { reviews, findings, validations, reviewEqualsValidated: false as const, findingEqualsValidated: false as const, validationEqualsApproved: false as const },
    CURRENTNESS: { state: currentness, currentEqualsValidated: false as const, staleEqualsInvalid: false as const, supersededEqualsInvalid: false as const, changes, reassessments, marks, fingerprint: object.fingerprint, fingerprintEqualsApproval: false as const, fingerprintEqualsValidated: false as const },
    LINEAGE: { lineage, threads, inferred: false as const, lineageEqualsAuthority: false as const },
    APPLICABILITY: applicability,
    LIMITATIONS: limitations,
    PROVENANCE: { provenanceRef, sourceBasisRef: object.sourceBasisRef, exactRevision: object.provenanceRef },
    AUTHORITY: { instrumentationControl: D8_CONTEXT_AUTHORITY, d9: false as const, transferred: false as const, counterpartAuthority: false as const },
    FINGERPRINT: { fingerprint: object.fingerprint, matchEqualsApproval: false as const, matchEqualsValidated: false as const, repaired: false as const, rebaselined: false as const },
  };
  const fingerprint = fingerprintCanonical({ contractVersion: D8_R11_SOURCE_CONTRACT_VERSION, projection });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.contracts.find((row) => row.contractId === contractId);
  if (existing) return existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId && existing.exactRevision === object.provenanceRef ? existing : fail("SOURCE_CONTRACT_ALREADY_RECORDED");
  if (store.contracts.some((row) => row.objectId === object.objectId && row.exactRevision === object.provenanceRef && row.contractVersion === D8_R11_SOURCE_CONTRACT_VERSION && row.tenantId === actor.tenantId)) fail("DUPLICATE_SOURCE_CONTRACT_REJECTED");
  const before = snapshot(store);
  const record: D8R11SourceContract = Object.freeze({
    contractId,
    contractVersion: D8_R11_SOURCE_CONTRACT_VERSION,
    contextId: context.contextId,
    objectId: object.objectId,
    exactRevision: object.provenanceRef,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
    discipline: D8_DISCIPLINE,
    currentness,
    authority: D8_CONTEXT_AUTHORITY,
    authorityTransferred: false,
    readOnly: true,
    engineeringFactCreated: false,
    derivedValueCreated: false,
    requirementCreated: false,
    assumptionCreated: false,
    decisionCreated: false,
    recommendationCreated: false,
    conflictDetected: false,
    conflictResolved: false,
    d9Started: false,
    validatesEngineering: false,
    approved: false,
    conformant: false,
    certified: false,
    fields: projection,
    provenanceRef,
    fingerprint,
    fingerprintMatchEqualsApproval: false,
    fingerprintMatchEqualsValidated: false,
    recordedBy: actor.actorId,
    recordedAt: store.now(),
    recordStatus: "CURRENT",
  });
  store.contracts.push(record);
  store.history.push({ historyId: `d8r11-history-${store.history.length + 1}`, contractId, action: "CREATED", fingerprint, recordedAt: store.now() });
  if (snapshot(store) !== before) fail("UPSTREAM_MUTATED");
  return record;
}

export function repointIacSourceContract(): never { return fail("AUTO_REPOINT_REJECTED"); }
export function inferIacSourceRelationship(): never { return fail("INFERRED_RELATIONSHIP_REJECTED"); }
export function deriveIacSourceValue(): never { return fail("DERIVATION_NOT_IN_R11"); }
export function createIacRequirementFromSource(): never { return fail("REQUIREMENT_CREATION_REJECTED"); }
export function createIacAssumptionFromSource(): never { return fail("ASSUMPTION_CREATION_REJECTED"); }
export function createIacDecisionFromSource(): never { return fail("DECISION_CREATION_REJECTED"); }
export function recommendFromIacSource(): never { return fail("RECOMMENDATION_NOT_IN_R11"); }
export function detectIacCrossDisciplineConflict(): never { return fail("CONFLICT_DETECTION_NOT_IN_R11"); }
export function resolveIacCrossDisciplineConflict(): never { return fail("CONFLICT_RESOLUTION_NOT_IN_R11"); }
export function startD9FromIacSource(): never { return fail("D9_NOT_STARTED"); }
export function mutateIacSourceTruth(): never { return fail("UPSTREAM_MUTATION_REJECTED"); }
export function rebaselineIacSourceFingerprint(): never { return fail("FINGERPRINT_REBASELINE_REJECTED"); }
export function validateIacFromSource(): never { return fail("VALIDATION_NOT_IN_R11"); }
