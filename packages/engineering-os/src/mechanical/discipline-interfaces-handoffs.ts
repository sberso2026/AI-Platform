/**
 * EOS-D4-R8 — Mechanical discipline interfaces and handoffs.
 * One bounded runtime. Reuses canonical EOS interface governance and exact D4 R1-R7 revisions.
 * A handoff records governed information. It does not transfer authority or perform the engineering.
 */
import {
  D1_TO_D4_REFERENCE_SUBJECTS,
  D4_CURRENTNESS_STATES,
  D4_D5_FUTURE_CONTRACT_SUBJECTS,
  D4_D6_FUTURE_CONTRACT_SUBJECTS,
  D4_D7_FUTURE_CONTRACT_SUBJECTS,
  D4_D8_FUTURE_CONTRACT_SUBJECTS,
  D4_EQUALS_D1_STRUCTURAL_AUTHORITY,
  D4_EQUALS_D2_CIVIL_AUTHORITY,
  D4_EQUALS_D3_GEOTECHNICAL_AUTHORITY,
  D4_EQUALS_D5_PIPING_AUTHORITY,
  D4_EQUALS_D6_PROCESS_AUTHORITY,
  D4_EQUALS_D7_ELECTRICAL_AUTHORITY,
  D4_EQUALS_D8_INSTRUMENTATION_CONTROL_AUTHORITY,
  D4_FINGERPRINT_ALGORITHM,
  D4_IMPLEMENTATION_PHASES,
  D4_MATURITY_STATES,
  D4_MECHANICAL_LOAD_CONTEXT_EQUALS_STRUCTURAL_DESIGN,
  D4_NOZZLE_CONTEXT_TRANSFERS_PIPING_AUTHORITY,
  D4_TO_D1_HANDOFF_SUBJECTS,
  D4_TO_D2_HANDOFF_SUBJECTS,
  D4_TO_D3_REFERENCE_SUBJECTS,
  D4_TRANSFERS_CIVIL_AUTHORITY,
  D4_TRANSFERS_GEOTECHNICAL_AUTHORITY,
  D4_TRANSFERS_PROCESS_AUTHORITY,
  D4_TRANSFERS_STRUCTURAL_AUTHORITY,
} from "@rtb/types";
import { D2_R8_HANDOFF_STATUSES } from "../civil/discipline-interfaces-handoffs";
import { assertHumanApprovalActor } from "../decision-intelligence/invariants";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import {
  D1K_R3_ACKNOWLEDGED_EQUALS_ENGINEERING_APPROVED,
  D1K_R3_AI_CAN_APPROVE_INTERFACE,
  D1K_R3_SILENT_SOURCE_REPOINTING_ALLOWED,
} from "../structural-systems/interface-handoff-governance";
import type { D1kR1Store } from "../structural-systems/interface-identity-foundation";
import type { D2R1Store } from "../civil/identity-foundation";
import type { D3R1Store } from "../geotechnical/identity-foundation";
import {
  D4_CONTEXT_AUTHORITY,
  D4_MECHANICAL_IDENTITY_OBJECT_FOUNDATION_RUNTIME_READY as R1_IDENTITY_READY,
  type D4R1Actor,
} from "./identity-foundation";
import { D4_EQUIPMENT_SYSTEM_CONTEXT_RUNTIME_READY } from "./equipment-system-context";
import { D4_DESIGN_CONDITION_PERFORMANCE_RUNTIME_READY } from "./design-condition-performance-context";
import { D4_VENDOR_DATA_EVIDENCE_RUNTIME_READY } from "./vendor-data-evidence-context";
import { D4_MECHANICAL_TECHNICAL_CONTEXT_RUNTIME_READY } from "./mechanical-technical-context";
import { D4_MAINTAINABILITY_ACCESS_PACKAGE_RUNTIME_READY, type D4R6UpstreamKind } from "./maintainability-access-package-context";
import {
  D4_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY as R7_CHANGE_READY,
  type D4R7Store,
} from "./requirements-assumptions-change";

export const D4_R8_STATUS = "DISCIPLINE_INTERFACES_AND_HANDOFFS_IMPLEMENTED" as const;
export const D4_R8_MATURITY = D4_R8_STATUS;
export const D4_R8_MATURITY_STATE = D4_R8_STATUS;
export const D4_R8_CLOSEOUT_PATH = "docs/architecture/engineering-os/EOS_D4_R8_DISCIPLINE_INTERFACES_AND_HANDOFFS_CLOSEOUT.md" as const;
export const D4_REUSES_CANONICAL_INTERFACE_GOVERNANCE = true as const;
export const PARALLEL_D4_INTERFACE_FRAMEWORK_CREATED = false as const;
export const D4_RUNTIME_STARTED = true as const;
export const D4_RUNTIME_COUNT = 8 as const;
export const D4_DISCIPLINE_INTERFACE_RUNTIME_IMPLEMENTED = true as const;
export const D4_DISCIPLINE_INTERFACE_RUNTIME_COUNT = 1 as const;
export const D4_DISCIPLINE_INTERFACE_RUNTIME_READY = true as const;
export const D4_MECHANICAL_IDENTITY_OBJECT_FOUNDATION_RUNTIME_READY = R1_IDENTITY_READY;
export const D4_EQUIPMENT_SYSTEM_CONTEXT_RUNTIME_READY_REUSED = D4_EQUIPMENT_SYSTEM_CONTEXT_RUNTIME_READY;
export const D4_DESIGN_CONDITION_PERFORMANCE_RUNTIME_READY_REUSED = D4_DESIGN_CONDITION_PERFORMANCE_RUNTIME_READY;
export const D4_VENDOR_DATA_EVIDENCE_RUNTIME_READY_REUSED = D4_VENDOR_DATA_EVIDENCE_RUNTIME_READY;
export const D4_MECHANICAL_TECHNICAL_CONTEXT_RUNTIME_READY_REUSED = D4_MECHANICAL_TECHNICAL_CONTEXT_RUNTIME_READY;
export const D4_MAINTAINABILITY_ACCESS_PACKAGE_RUNTIME_READY_REUSED = D4_MAINTAINABILITY_ACCESS_PACKAGE_RUNTIME_READY;
export const D4_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY = R7_CHANGE_READY;
export const D4_R1_R7_EXACT_SOURCE_REVISIONS_REUSED = true as const;
export const EXACT_D4_INTERFACE_SOURCE_REVISION_REQUIRED = true as const;
export const FLOATING_D4_INTERFACE_SOURCE_REFERENCE_ALLOWED = false as const;
export const D4_INTERFACE_SOURCE_AUTO_REPOINTED = D1K_R3_SILENT_SOURCE_REPOINTING_ALLOWED;
export const D4_D1_INTERFACE_HANDOFF_IMPLEMENTED = true as const;
export const D1_TO_D4_COUNTERPART_REFERENCE_SUPPORTED = true as const;
export const EXACT_D1_COUNTERPART_REVISION_REQUIRED = true as const;
export const D4_D1_INTERFACE_TRANSFERS_STRUCTURAL_AUTHORITY = D4_TRANSFERS_STRUCTURAL_AUTHORITY;
export const D4_D1_HANDOFF_EQUALS_STRUCTURAL_VALIDATION = false as const;
export const D4_VALIDATES_D1_STRUCTURAL_ENGINEERING = false as const;
export const D1_COUNTERPART_REFERENCE_EQUALS_D4_VALIDATION = false as const;
export const D4_D2_INTERFACE_HANDOFF_IMPLEMENTED = true as const;
export const D2_TO_D4_COUNTERPART_REFERENCE_SUPPORTED = true as const;
export const EXACT_D2_COUNTERPART_REVISION_REQUIRED = true as const;
export const D4_D2_INTERFACE_TRANSFERS_CIVIL_AUTHORITY = D4_TRANSFERS_CIVIL_AUTHORITY;
export const D4_D2_HANDOFF_EQUALS_CIVIL_VALIDATION = false as const;
export const D4_D3_INTERFACE_HANDOFF_IMPLEMENTED = true as const;
export const D3_TO_D4_COUNTERPART_REFERENCE_SUPPORTED = true as const;
export const EXACT_D3_COUNTERPART_REVISION_REQUIRED = true as const;
export const D4_D3_INTERFACE_TRANSFERS_GEOTECHNICAL_AUTHORITY = D4_TRANSFERS_GEOTECHNICAL_AUTHORITY;
export const D4_D3_HANDOFF_EQUALS_GEOTECHNICAL_VALIDATION = false as const;
export const D4_D5_FUTURE_INTERFACE_CONTRACT_DEFINED = true as const;
export const D4_D6_FUTURE_INTERFACE_CONTRACT_DEFINED = true as const;
export const D4_D7_FUTURE_INTERFACE_CONTRACT_DEFINED = true as const;
export const D4_D8_FUTURE_INTERFACE_CONTRACT_DEFINED = true as const;
export const D4_NOZZLE_CONTEXT_EQUALS_PIPING_DESIGN = false as const;
export const D4_TRANSFERS_PIPING_AUTHORITY = D4_NOZZLE_CONTEXT_TRANSFERS_PIPING_AUTHORITY;
export const D4_CREATES_AUTHORITATIVE_PROCESS_CONDITION = false as const;
export const D4_ELECTRICAL_INTERFACE_CONTEXT_EQUALS_ELECTRICAL_DESIGN = false as const;
export const D4_TRANSFERS_ELECTRICAL_AUTHORITY = false as const;
export const D4_CONTROL_INTERFACE_CONTEXT_EQUALS_CONTROL_DESIGN = false as const;
export const D4_TRANSFERS_IAC_AUTHORITY = false as const;
export const D4_EXPLICIT_COUNTERPART_REFERENCE_REQUIRED = true as const;
export const D4_INFERRED_COUNTERPART_REFERENCE_ALLOWED = false as const;
export const D4_MISSING_COUNTERPART_AUTO_FABRICATED = false as const;
export const MISSING_COUNTERPART_EQUALS_INTERFACE_COMPLETE = false as const;
export const D4_INTERFACE_CURRENTNESS_EXPLICIT = true as const;
export const D4_INTERFACE_LIMITATIONS_EXPLICIT = true as const;
export const STALE_D4_HANDOFF_EXPOSED_AS_CURRENT = false as const;
export const INCOMPLETE_D4_HANDOFF_EXPOSED_AS_COMPLETE = false as const;
export const D4_INTERFACE_HISTORICAL_REFERENCE_AUTO_REPOINTED = D1K_R3_SILENT_SOURCE_REPOINTING_ALLOWED;
export const D4_INTERFACE_COUNTERPART_AUTO_REPOINTED = D1K_R3_SILENT_SOURCE_REPOINTING_ALLOWED;
export const D4_INTERFACE_HISTORY_PRESERVED = true as const;
export const D4_R7_CHANGE_INTERFACE_GOVERNANCE_INTEGRATED = true as const;
export const D4_INTERFACE_CHANGE_AUTO_RECALCULATES_ENGINEERING = false as const;
export const D4_INTERFACE_CHANGE_AUTO_REDESIGNS_ENGINEERING = false as const;
export const D4_INTERFACE_CHANGE_AUTO_VALIDATES_ENGINEERING = false as const;
export const D4_R8_AUTO_MUTATES_R3_DESIGN_CONDITION = false as const;
export const D4_R8_AUTO_MUTATES_R3_PERFORMANCE_CONTEXT = false as const;
export const D4_R8_AUTO_MUTATES_R5_TECHNICAL_REQUIREMENT = false as const;
export const D4_R8_AUTO_MUTATES_R6_MAINTAINABILITY_CONTEXT = false as const;
export const D4_R8_VALIDATES_D1_ENGINEERING = false as const;
export const D4_R8_VALIDATES_D2_ENGINEERING = false as const;
export const D4_R8_VALIDATES_D3_ENGINEERING = false as const;
export const D4_R8_VALIDATES_FUTURE_D5_D8_ENGINEERING = false as const;
export const D4_INTERFACE_TRANSFERS_DISCIPLINE_AUTHORITY = false as const;
export const AI_EQUALS_D4_MECHANICAL_ENGINEERING_AUTHORITY = false as const;
export const ADMIN_EQUALS_D4_MECHANICAL_ENGINEERING_AUTHORITY = false as const;
export const AI_CAN_FABRICATE_D4_INTERFACE_COUNTERPART = false as const;
export const AI_CAN_PROMOTE_D4_HANDOFF_TO_ENGINEERING_VALIDATED = D1K_R3_AI_CAN_APPROVE_INTERFACE;
export const ADMIN_CAN_PROMOTE_D4_HANDOFF_TO_ENGINEERING_VALIDATED = false as const;
export const HANDOFF_CREATED_EQUALS_REVIEWED = false as const;
export const HANDOFF_CREATED_EQUALS_VALIDATED = false as const;
export const HANDOFF_CREATED_EQUALS_APPROVED = D1K_R3_ACKNOWLEDGED_EQUALS_ENGINEERING_APPROVED;
export const D4_REUSES_CANONICAL_CURRENTNESS = true as const;
export const PARALLEL_D4_CURRENTNESS_ENGINE_CREATED = false as const;
export const D4_REUSES_CANONICAL_FINGERPRINT = true as const;
export const SECOND_D4_FINGERPRINT_ALGORITHM_CREATED = false as const;
export const D4_FINGERPRINT_ALGORITHM_REUSED = D4_FINGERPRINT_ALGORITHM;
export const D4_R8_PROVENANCE_REQUIRED = true as const;
export const D4_R8_PROVENANCE_PRESERVED = true as const;
export const SILENT_D4_R8_MUTATION_ALLOWED = false as const;
export const D4_R8_HISTORY_PRESERVED = true as const;
export const TENANT_WORKSPACE_PROJECT_D4_R8_SCOPE_ENFORCED = true as const;
export const D4_R8_DUPLICATE_GOVERNANCE_IMPLEMENTED = true as const;
export const D4_R8_REPLAY_PROTECTION_IMPLEMENTED = true as const;
export const D4_R8_SPOOFING_PROTECTION_IMPLEMENTED = true as const;
export const D4_R8_HANDOFF_STATUSES = D2_R8_HANDOFF_STATUSES;
export const D4_R8_DIRECTIONS = ["D4_TO_COUNTERPART", "COUNTERPART_TO_D4"] as const;
export const D4_R8_FUTURE_DISCIPLINES = ["piping", "process", "electrical", "instrumentation_control"] as const;
export const D4_R8_LIVE_DISCIPLINES = ["structural", "civil", "geotechnical"] as const;

export {
  D4_EQUALS_D1_STRUCTURAL_AUTHORITY,
  D4_EQUALS_D2_CIVIL_AUTHORITY,
  D4_EQUALS_D3_GEOTECHNICAL_AUTHORITY,
  D4_EQUALS_D5_PIPING_AUTHORITY,
  D4_EQUALS_D6_PROCESS_AUTHORITY,
  D4_EQUALS_D7_ELECTRICAL_AUTHORITY,
  D4_EQUALS_D8_INSTRUMENTATION_CONTROL_AUTHORITY,
  D4_MECHANICAL_LOAD_CONTEXT_EQUALS_STRUCTURAL_DESIGN,
  D4_TRANSFERS_PROCESS_AUTHORITY,
};

export const D4_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_COUNT = 0 as const;
export const D4_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_READY = false as const;
export const D4_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT = 0 as const;
export const D4_CURRENTNESS_DIGITAL_THREAD_RUNTIME_READY = false as const;
export const D4_D9_SOURCE_CONTRACT_RUNTIME_COUNT = 0 as const;
export const D4_D9_SOURCE_CONTRACT_RUNTIME_READY = false as const;
export const D4_D9_RUNTIME_INTEGRATION_COUNT = 0 as const;
export const D4_EQUIPMENT_SIZING_RUNTIME_COUNT = 0 as const;
export const D4_ROTATING_EQUIPMENT_CALCULATION_RUNTIME_COUNT = 0 as const;
export const D4_STATIC_EQUIPMENT_CALCULATION_RUNTIME_COUNT = 0 as const;
export const D4_THERMAL_MECHANICAL_CALCULATION_RUNTIME_COUNT = 0 as const;
export const D4_MECHANICAL_LOAD_CALCULATION_RUNTIME_COUNT = 0 as const;
export const D4_VIBRATION_ANALYSIS_RUNTIME_COUNT = 0 as const;
export const D4_FATIGUE_ANALYSIS_RUNTIME_COUNT = 0 as const;
export const D4_MECHANICAL_DESIGN_OPTIMIZATION_RUNTIME_COUNT = 0 as const;
export const D4_SPATIAL_CLASH_DETECTION_RUNTIME_COUNT = 0 as const;
export const D4_ACCESS_PATH_SOLVER_RUNTIME_COUNT = 0 as const;
export const D4_REMOVAL_ROUTE_SOLVER_RUNTIME_COUNT = 0 as const;
export const D4_LAYOUT_OPTIMIZATION_RUNTIME_COUNT = 0 as const;
export const D4_AUTOMATIC_REDESIGN_RUNTIME_COUNT = 0 as const;
export const D4_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT = 0 as const;
export const D4_CONFORMANCE_DETERMINATION_RUNTIME_COUNT = 0 as const;
export const D4_APPROVAL_RUNTIME_COUNT = 0 as const;
export const D4_CERTIFICATION_RUNTIME_COUNT = 0 as const;
export const D4_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT = 0 as const;
export const D4_CROSS_DISCIPLINE_CONFLICT_DETECTION_RUNTIME_COUNT = 0 as const;
export const D4_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT = 0 as const;
export const D4_CROSS_DISCIPLINE_RECOMMENDATION_RUNTIME_COUNT = 0 as const;
export const D5_RUNTIME_STARTED = false as const;
export const D6_RUNTIME_STARTED = false as const;
export const D7_RUNTIME_STARTED = false as const;
export const D8_RUNTIME_STARTED = false as const;
export const D9_RUNTIME_STARTED = false as const;
export const D9_RUNTIME_COUNT = 0 as const;
export const DATABASE_SCHEMA_CHANGED = false as const;
export const NEW_DEPENDENCY_ADDED = false as const;
export const D1_STRUCTURAL_PACK_COMPLETE = false as const;
export const D1N_REOPENED = false as const;
export const D2_TRACK_COMPLETE = true as const;
export const D2_REOPENED = false as const;
export const D3_TRACK_COMPLETE = true as const;
export const D3_TRACK_COMPLETION_CLASSIFICATION = "COMPLETE_BOUNDED_WITH_LIMITATIONS" as const;
export const D3_REOPENED = false as const;
export const UNAUTHORIZED_D1_PACK_COMPLETION = false as const;
export const UNAUTHORIZED_D2_REOPEN = false as const;
export const UNAUTHORIZED_D3_REOPEN = false as const;
export const UNAUTHORIZED_D4_R9_R12_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_D5_D8_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_D9_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_AUTHORITY_TRANSFER = false as const;
export const UNAUTHORIZED_COUNTERPART_FABRICATION = false as const;
export const UNAUTHORIZED_INTERFACE_RECALCULATION = false as const;
export const UNAUTHORIZED_INTERFACE_REDESIGN = false as const;
export const UNAUTHORIZED_MECHANICAL_VALIDATION_PROMOTION = false as const;
export const UNAUTHORIZED_MECHANICAL_CONFORMANCE_PROMOTION = false as const;
export const UNAUTHORIZED_MECHANICAL_APPROVAL_PROMOTION = false as const;
export const UNAUTHORIZED_MECHANICAL_CERTIFICATION_PROMOTION = false as const;
export const UNAUTHORIZED_CROSS_DISCIPLINE_REASONING_PROMOTION = false as const;
export const UNAUTHORIZED_GA_PROMOTION = false as const;
export const UNAUTHORIZED_PRODUCT_CLAIM = false as const;

export const D4_R9_CANONICAL_PHASE = D4_IMPLEMENTATION_PHASES[8];
export const D4_R9_PHASE_TYPE = "REVIEW_AND_VALIDATION_GOVERNANCE" as const;
export const D4_R9_CANONICAL_SCOPE =
  "Implement canonical Mechanical review and validation governance using exact D4 R1-R8 revisions. Support review requests, reviewer authority, findings, review completion, validation state and reassessment linkage while preserving the distinction between review, validation, conformance, approval and certification. AI/admin must not become engineering reviewer authority. Review or validation must not mutate engineering records or validate D1-D3 or future D5-D8 counterpart engineering. Do not start R10-R12 or D5-D9 runtime." as const;
export const D4_R9_STARTED = false as const;
export const D4_R8_READY_FOR_NEXT_PHASE = true as const;
export const D4_R8_NEXT_PHASE = D4_R9_CANONICAL_PHASE;
export const D4_R8_NEXT_PHASE_TYPE = D4_R9_PHASE_TYPE;
export const D4_R8_CANONICAL_NEXT_PHASE = D4_R9_CANONICAL_PHASE;
export const D4_R8_CANONICAL_NEXT_PHASE_SCOPE = D4_R9_CANONICAL_SCOPE;
export const D4_R8_BLOCKER = "NONE" as const;
export const D4_R8_MACHINE_READABLE_ROADMAP_UPDATED = true as const;

const FLOATING = new Set(["latest", "current", "newest", "head", "active", "active model"]);
const BROAD = new Set(["all", "global", "every", "unspecified", "any"]);
const INFERRED = new Set(["matching_tag", "shared_vendor", "shared_package", "system_membership", "proximity", "document_cooccurrence", "similar_value", "ai_similarity", "inferred"]);
const FUTURE = new Set<string>(D4_R8_FUTURE_DISCIPLINES);
const LIVE = new Set<string>(D4_R8_LIVE_DISCIPLINES);

type LiveDiscipline = (typeof D4_R8_LIVE_DISCIPLINES)[number];
type FutureDiscipline = (typeof D4_R8_FUTURE_DISCIPLINES)[number];
type Currentness = (typeof D4_CURRENTNESS_STATES)[number];

type Prohibited = {
  transferAuthority?: boolean;
  reasonAcrossDisciplines?: boolean;
  detectConflict?: boolean;
  resolveConflict?: boolean;
  validateCounterpart?: boolean;
  fabricateCounterpart?: boolean;
  inferCounterpart?: boolean;
  approve?: boolean;
  certify?: boolean;
  validate?: boolean;
  redesign?: boolean;
  recalculate?: boolean;
  repoint?: boolean;
  mutateR3?: boolean;
  mutateR3Performance?: boolean;
  mutateR5?: boolean;
  mutateR6?: boolean;
  promoteValidated?: boolean;
  d5Start?: boolean;
  d9Reasoning?: boolean;
};

export type D4R8HandoffInput = Prohibited & {
  handoffId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  contextId: string;
  objectId: string;
  objectRevisionFingerprint: string;
  r2SubjectKind: D4R6UpstreamKind;
  r2SubjectId: string;
  r2RevisionFingerprint: string;
  r3RecordId: string;
  r3RevisionFingerprint: string;
  r4RecordId: string;
  r4RevisionFingerprint: string;
  r5RecordId: string;
  r5RevisionFingerprint: string;
  r6RecordId: string;
  r6RevisionFingerprint: string;
  changeContextId?: string | null;
  changeFingerprint?: string | null;
  counterpartDiscipline: string;
  direction: string;
  interfaceTopic: string;
  counterpartInterfaceId?: string | null;
  counterpartSourceRevision?: string | null;
  counterpartFingerprint?: string | null;
  inference?: string | null;
  citedCurrentness: string;
  citedLifecycleStage: string;
  applicability: string;
  limitations: string;
  handoffStatus: string;
  provenanceRef: string;
  assertedFingerprint?: string | null;
  predecessorHandoffId?: string | null;
};

export type D4R8CounterpartPin = {
  interfaceId: string;
  sourceRevision: string;
  fingerprint: string;
  discipline: LiveDiscipline;
};

export type D4R8HandoffRecord = {
  handoffId: string;
  contextId: string;
  objectId: string;
  objectRevisionFingerprint: string;
  r2SubjectKind: D4R6UpstreamKind;
  r2SubjectId: string;
  r2RevisionFingerprint: string;
  r3RecordId: string;
  r3RevisionFingerprint: string;
  r4RecordId: string;
  r4RevisionFingerprint: string;
  r5RecordId: string;
  r5RevisionFingerprint: string;
  r6RecordId: string;
  r6RevisionFingerprint: string;
  changeContextId: string | null;
  changeFingerprint: string | null;
  counterpartDiscipline: LiveDiscipline | FutureDiscipline;
  direction: (typeof D4_R8_DIRECTIONS)[number];
  interfaceTopic: string;
  counterpart: D4R8CounterpartPin | null;
  applicability: string;
  limitations: string;
  sourceAuthority: typeof D4_CONTEXT_AUTHORITY;
  receivingAuthority: string;
  authorityTransferred: false;
  interfaceComplete: boolean;
  reviewed: false;
  engineeringValidated: false;
  engineeringApproved: false;
  conformant: false;
  certified: false;
  deleted: false;
  invalidated: false;
  recalculated: false;
  redesigned: false;
  handoffStatus: (typeof D4_R8_HANDOFF_STATUSES)[number];
  citedCurrentness: Currentness;
  currentness: Currentness;
  citedLifecycleStage: (typeof D4_MATURITY_STATES)[number];
  provenanceRef: string;
  fingerprint: string;
  predecessorHandoffId: string | null;
  predecessorFingerprint: string | null;
  recordStatus: "CURRENT" | "SUPERSEDED";
  tenantId: string;
  workspaceId: string;
  projectId: string;
  createdAt: string;
  createdBy: string;
};

export type D4R8History = {
  historyId: string;
  handoffId: string;
  action: "CREATED" | "SUPERSEDED";
  fingerprint: string;
  recordedAt: string;
};

export type D4R8Store = {
  r7: D4R7Store;
  d1: D1kR1Store | null;
  d2: D2R1Store | null;
  d3: D3R1Store | null;
  now: () => string;
  handoffs: D4R8HandoffRecord[];
  history: D4R8History[];
};

function fail(code: string): never {
  throw new Error(`D4_R8_${code}`);
}

function explicit(value: string, code: string): string {
  const token = value.trim();
  if (!token || FLOATING.has(token.toLowerCase()) || BROAD.has(token.toLowerCase()) || INFERRED.has(token.toLowerCase())) fail(code);
  return token;
}

function blockedParty(value: string): boolean {
  return /^AI(?:\b|_)/i.test(value) || value === "LLM" || value === "OPTIMIZER";
}

function isCurrentness(value: string): value is Currentness {
  return (D4_CURRENTNESS_STATES as readonly string[]).includes(value);
}

function maturityOf(value: string): (typeof D4_MATURITY_STATES)[number] {
  const token = value.trim();
  if (!(D4_MATURITY_STATES as readonly string[]).includes(token)) fail("LIFECYCLE_INVALID");
  return token as (typeof D4_MATURITY_STATES)[number];
}

function assertActor(actor: D4R1Actor): void {
  if (!actor.actorId.trim() || !actor.tenantId.trim() || !actor.workspaceId.trim() || !actor.projectId.trim()) fail("SCOPE_REQUIRED");
  if (blockedParty(actor.actorId) || blockedParty(actor.authority)) fail("AI_NOT_MECHANICAL_AUTHORITY");
  if (actor.actorId === "ADMIN" || actor.actorId === "ADMINISTRATOR" || actor.authority === "ADMIN" || actor.authority === "ADMINISTRATOR") {
    fail("ADMIN_NOT_MECHANICAL_AUTHORITY");
  }
  if (actor.authority === "MECHANICAL_ENGINEERING_AUTHORITY") fail("AUTHORITY_SPOOFING_REJECTED");
  if (actor.authority !== D4_CONTEXT_AUTHORITY) fail("RECORDER_AUTHORITY_INVALID");
  assertHumanApprovalActor("human", actor.actorId);
}

function assertProhibited(input: Prohibited): void {
  if (input.transferAuthority === true) fail("AUTHORITY_TRANSFER_REJECTED");
  if (input.reasonAcrossDisciplines === true || input.d9Reasoning === true) fail("CROSS_DISCIPLINE_REASONING_NOT_IN_R8");
  if (input.detectConflict === true) fail("CONFLICT_DETECTION_NOT_IN_R8");
  if (input.resolveConflict === true) fail("CONFLICT_RESOLUTION_NOT_IN_R8");
  if (input.validateCounterpart === true || input.validate === true) fail("COUNTERPART_VALIDATION_NOT_IN_R8");
  if (input.fabricateCounterpart === true) fail("COUNTERPART_FABRICATION_REJECTED");
  if (input.inferCounterpart === true) fail("INFERRED_COUNTERPART_REJECTED");
  if (input.approve === true) fail("APPROVAL_NOT_IN_R8");
  if (input.certify === true) fail("CERTIFICATION_NOT_IN_R8");
  if (input.promoteValidated === true) fail("VALIDATION_PROMOTION_REJECTED");
  if (input.redesign === true) fail("REDESIGN_NOT_IN_R8");
  if (input.recalculate === true) fail("RECALCULATION_NOT_IN_R8");
  if (input.repoint === true) fail("AUTO_REPOINT_REJECTED");
  if (input.mutateR3 === true || input.mutateR3Performance === true) fail("R3_MUTATION_REJECTED");
  if (input.mutateR5 === true) fail("R5_MUTATION_REJECTED");
  if (input.mutateR6 === true) fail("R6_MUTATION_REJECTED");
  if (input.d5Start === true) fail("FUTURE_DISCIPLINE_RUNTIME_REJECTED");
}

function guardText(value: string, code: string): string {
  const token = explicit(value, code);
  if (/[=*]|calc\(|sqrt\(/i.test(token)) fail("HIDDEN_CALCULATION_REJECTED");
  return token;
}

function sameScope(row: { tenantId: string; workspaceId: string; projectId: string }, actor: D4R1Actor): boolean {
  return row.tenantId === actor.tenantId && row.workspaceId === actor.workspaceId && row.projectId === actor.projectId;
}

function seal(store: D4R8Store): string {
  const r3 = store.r7.r6.r5.r4.r3.records.map((row) => `${row.recordId}:${row.fingerprint}:${row.suppliedValue}:${row.recordStatus}`).join("|");
  const r4 = store.r7.r6.r5.r4.records.map((row) => `${row.recordId}:${row.fingerprint}:${row.suppliedValue}:${row.recordStatus}`).join("|");
  const r5 = store.r7.r6.r5.records.map((row) => `${row.recordId}:${row.fingerprint}:${row.requirementStatement}:${row.recordStatus}`).join("|");
  const r6 = store.r7.r6.records.map((row) => `${row.recordId}:${row.fingerprint}:${row.statement}:${row.recordStatus}`).join("|");
  const changes = store.r7.changes.map((row) => `${row.changeContextId}:${row.fingerprint}:${row.recalculated}:${row.redesigned}`).join("|");
  const d1 = store.d1?.records.map((row) => `${row.interfaceId}:${row.fingerprint}:${row.sourceRevision}:${row.recordStatus}`).join("|") ?? "";
  const d2 = store.d2?.objects.map((row) => `${row.objectId}:${row.fingerprint}:${row.provenanceRef}:${row.recordStatus}`).join("|") ?? "";
  const d3 = store.d3?.objects.map((row) => `${row.objectId}:${row.fingerprint}:${row.provenanceRef}:${row.recordStatus}`).join("|") ?? "";
  return `${r3}#${r4}#${r5}#${r6}#${changes}#${d1}#${d2}#${d3}`;
}

function bindSource(store: D4R8Store, actor: D4R1Actor, input: D4R8HandoffInput, cited: Currentness) {
  const contextId = explicit(input.contextId, "R1_CONTEXT_REQUIRED");
  const context = store.r7.r6.r5.r4.r3.r2.r1.contexts.find((row) => row.contextId === contextId);
  if (!context || !sameScope(context, actor)) fail("R1_CONTEXT_NOT_FOUND");
  const objectId = explicit(input.objectId, "R1_OBJECT_REQUIRED");
  const objectRevision = explicit(input.objectRevisionFingerprint, "R1_REVISION_REQUIRED");
  const object = store.r7.r6.r5.r4.r3.r2.r1.objects.find((row) => row.objectId === objectId);
  if (!object || object.contextId !== context.contextId || object.fingerprint !== objectRevision || !sameScope(object, actor)) fail("R1_REVISION_MISMATCH");
  const subjectKind = input.r2SubjectKind;
  const subjectId = explicit(input.r2SubjectId, "R2_SUBJECT_REQUIRED");
  const subjectRevision = explicit(input.r2RevisionFingerprint, "R2_REVISION_REQUIRED");
  const rows =
    subjectKind === "CLASSIFICATION"
      ? store.r7.r6.r5.r4.r3.r2.classifications
      : subjectKind === "SERVICE"
        ? store.r7.r6.r5.r4.r3.r2.services
        : subjectKind === "MEMBERSHIP"
          ? store.r7.r6.r5.r4.r3.r2.memberships
          : store.r7.r6.r5.r4.r3.r2.descriptions;
  const subject = rows.find((row) => {
    if (subjectKind === "CLASSIFICATION" && "classificationId" in row) return row.classificationId === subjectId;
    if (subjectKind === "SERVICE" && "serviceContextId" in row) return row.serviceContextId === subjectId;
    if (subjectKind === "MEMBERSHIP" && "membershipId" in row) return row.membershipId === subjectId;
    if (subjectKind === "DESCRIPTION" && "descriptionId" in row) return row.descriptionId === subjectId;
    return false;
  });
  if (!subject || subject.fingerprint !== subjectRevision || subject.objectId !== object.objectId) fail("R2_REVISION_MISMATCH");
  const r3 = store.r7.r6.r5.r4.r3.records.find((row) => row.recordId === explicit(input.r3RecordId, "R3_RECORD_REQUIRED"));
  if (!r3 || r3.fingerprint !== explicit(input.r3RevisionFingerprint, "R3_REVISION_REQUIRED") || r3.objectId !== object.objectId) fail("R3_REVISION_MISMATCH");
  const r4 = store.r7.r6.r5.r4.records.find((row) => row.recordId === explicit(input.r4RecordId, "R4_RECORD_REQUIRED"));
  if (!r4 || r4.fingerprint !== explicit(input.r4RevisionFingerprint, "R4_REVISION_REQUIRED") || r4.objectId !== object.objectId) fail("R4_REVISION_MISMATCH");
  const r5 = store.r7.r6.r5.records.find((row) => row.recordId === explicit(input.r5RecordId, "R5_RECORD_REQUIRED"));
  if (!r5 || r5.fingerprint !== explicit(input.r5RevisionFingerprint, "R5_REVISION_REQUIRED") || r5.objectId !== object.objectId) fail("R5_REVISION_MISMATCH");
  const r6 = store.r7.r6.records.find((row) => row.recordId === explicit(input.r6RecordId, "R6_RECORD_REQUIRED"));
  if (!r6 || r6.fingerprint !== explicit(input.r6RevisionFingerprint, "R6_REVISION_REQUIRED") || r6.objectId !== object.objectId) fail("R6_REVISION_MISMATCH");
  if (cited === "CURRENT" && [context, object, subject, r3, r4, r5, r6].some((row) => row.recordStatus !== "CURRENT")) fail("SOURCE_NOT_CURRENT");
  return {
    contextId,
    objectId,
    objectRevisionFingerprint: object.fingerprint,
    r2SubjectKind: subjectKind,
    r2SubjectId: subjectId,
    r2RevisionFingerprint: subject.fingerprint,
    r3RecordId: r3.recordId,
    r3RevisionFingerprint: r3.fingerprint,
    r4RecordId: r4.recordId,
    r4RevisionFingerprint: r4.fingerprint,
    r5RecordId: r5.recordId,
    r5RevisionFingerprint: r5.fingerprint,
    r6RecordId: r6.recordId,
    r6RevisionFingerprint: r6.fingerprint,
  };
}

function topicFor(discipline: string, direction: string, topic: string): string {
  const value = explicit(topic, "INTERFACE_TOPIC_REQUIRED");
  const allowed =
    discipline === "structural"
      ? direction === "D4_TO_COUNTERPART"
        ? D4_TO_D1_HANDOFF_SUBJECTS
        : D1_TO_D4_REFERENCE_SUBJECTS
      : discipline === "civil"
        ? D4_TO_D2_HANDOFF_SUBJECTS
        : discipline === "geotechnical"
          ? D4_TO_D3_REFERENCE_SUBJECTS
          : discipline === "piping"
            ? D4_D5_FUTURE_CONTRACT_SUBJECTS
            : discipline === "process"
              ? D4_D6_FUTURE_CONTRACT_SUBJECTS
              : discipline === "electrical"
                ? D4_D7_FUTURE_CONTRACT_SUBJECTS
                : D4_D8_FUTURE_CONTRACT_SUBJECTS;
  if (!(allowed as readonly string[]).includes(value)) fail("INTERFACE_TOPIC_INVALID");
  return value;
}

function pinCounterpart(
  store: D4R8Store,
  actor: D4R1Actor,
  discipline: string,
  interfaceId: string | null | undefined,
  revision: string | null | undefined,
  fingerprint: string | null | undefined,
  cited: Currentness,
): D4R8CounterpartPin | null {
  if (FUTURE.has(discipline)) {
    if (interfaceId != null || revision != null || fingerprint != null) fail("COUNTERPART_FABRICATION_REJECTED");
    return null;
  }
  if (interfaceId == null || interfaceId === "") {
    if (revision != null || fingerprint != null) fail("COUNTERPART_REVISION_WITHOUT_REFERENCE");
    return null;
  }
  const id = explicit(interfaceId, "COUNTERPART_REFERENCE_REQUIRED");
  const sourceRevision = explicit(revision ?? "", "COUNTERPART_REVISION_REQUIRED");
  const asserted = fingerprint == null || fingerprint === "" ? null : explicit(fingerprint, "COUNTERPART_FINGERPRINT_REQUIRED");
  if (discipline === "structural") {
    const row = store.d1?.records.find((item) => item.interfaceId === id);
    if (!row || !sameScope(row, actor)) fail("COUNTERPART_NOT_FOUND");
    const sides = [row.sourceDiscipline, row.targetDiscipline];
    if (!sides.includes("structural") || !sides.includes("mechanical")) fail("COUNTERPART_DISCIPLINE_PAIR_INVALID");
    if (row.sourceRevision !== sourceRevision) fail("COUNTERPART_REVISION_MISMATCH");
    if (asserted != null && row.fingerprint !== asserted) fail("FINGERPRINT_MISMATCH");
    if (cited === "CURRENT" && row.recordStatus !== "CURRENT") fail("COUNTERPART_NOT_CURRENT");
    return { interfaceId: row.interfaceId, sourceRevision: row.sourceRevision, fingerprint: row.fingerprint, discipline: "structural" };
  }
  const rows = discipline === "civil" ? store.d2?.objects : store.d3?.objects;
  const row = rows?.find((item) => item.objectId === id);
  if (!row || !sameScope(row, actor)) fail("COUNTERPART_NOT_FOUND");
  if (row.provenanceRef !== sourceRevision) fail("COUNTERPART_REVISION_MISMATCH");
  if (asserted != null && row.fingerprint !== asserted) fail("FINGERPRINT_MISMATCH");
  if (cited === "CURRENT" && row.recordStatus !== "CURRENT") fail("COUNTERPART_NOT_CURRENT");
  return { interfaceId: row.objectId, sourceRevision: row.provenanceRef, fingerprint: row.fingerprint, discipline: discipline as LiveDiscipline };
}

function citeChange(store: D4R8Store, actor: D4R1Actor, changeContextId: string | null | undefined, changeFingerprint: string | null | undefined, cited: Currentness, handoffStatus: string): { changeContextId: string | null; changeFingerprint: string | null } {
  if (changeContextId == null || changeContextId === "") {
    if (changeFingerprint != null && changeFingerprint !== "") fail("CHANGE_REVISION_WITHOUT_REFERENCE");
    if (handoffStatus === "REASSESSMENT_REQUIRED" || cited === "REASSESSMENT_REQUIRED") fail("CHANGE_REFERENCE_REQUIRED");
    return { changeContextId: null, changeFingerprint: null };
  }
  const id = explicit(changeContextId, "CHANGE_REFERENCE_REQUIRED");
  const fingerprint = explicit(changeFingerprint ?? "", "CHANGE_REVISION_REQUIRED");
  const change = store.r7.changes.find((row) => row.changeContextId === id);
  if (!change || change.fingerprint !== fingerprint || change.tenantId !== actor.tenantId || change.projectId !== actor.projectId) fail("CHANGE_REVISION_MISMATCH");
  if (cited === "CURRENT" && change.recordStatus !== "CURRENT") fail("CHANGE_NOT_CURRENT");
  if ((change.changeCategory === "REASSESSMENT_REQUIRED" || change.currentness === "REASSESSMENT_REQUIRED") && handoffStatus !== "REASSESSMENT_REQUIRED") {
    fail("REASSESSMENT_STATE_REQUIRED");
  }
  return { changeContextId: change.changeContextId, changeFingerprint: change.fingerprint };
}

export function createD4R8Store(
  r7: D4R7Store,
  d1: D1kR1Store | null = null,
  d2: D2R1Store | null = null,
  d3: D3R1Store | null = null,
  now: () => string = () => r7.now(),
): D4R8Store {
  return { r7, d1, d2, d3, now, handoffs: [], history: [] };
}

export function recordMechanicalInterfaceHandoff(store: D4R8Store, actor: D4R1Actor, input: D4R8HandoffInput): D4R8HandoffRecord {
  assertActor(actor);
  assertProhibited(input);
  if (input.inference && INFERRED.has(input.inference.trim().toLowerCase())) fail("INFERRED_COUNTERPART_REJECTED");
  const tenantId = explicit(input.tenantId, "SCOPE_REQUIRED");
  const workspaceId = explicit(input.workspaceId, "SCOPE_REQUIRED");
  const projectId = explicit(input.projectId, "SCOPE_REQUIRED");
  if (tenantId !== actor.tenantId || workspaceId !== actor.workspaceId || projectId !== actor.projectId) fail("SCOPE_MISMATCH");
  const citedCurrentness = input.citedCurrentness.trim();
  if (!isCurrentness(citedCurrentness)) fail("CURRENTNESS_INVALID");
  const before = seal(store);
  const bound = bindSource(store, actor, input, citedCurrentness);
  const discipline = explicit(input.counterpartDiscipline, "COUNTERPART_DISCIPLINE_REQUIRED");
  if (!LIVE.has(discipline) && !FUTURE.has(discipline)) fail("COUNTERPART_DISCIPLINE_INVALID");
  const direction = explicit(input.direction, "DIRECTION_REQUIRED");
  if (!(D4_R8_DIRECTIONS as readonly string[]).includes(direction)) fail("DIRECTION_INVALID");
  const interfaceTopic = topicFor(discipline, direction, input.interfaceTopic);
  const counterpart = pinCounterpart(store, actor, discipline, input.counterpartInterfaceId, input.counterpartSourceRevision, input.counterpartFingerprint, citedCurrentness);
  const handoffStatus = explicit(input.handoffStatus, "HANDOFF_STATUS_REQUIRED");
  if (!(D4_R8_HANDOFF_STATUSES as readonly string[]).includes(handoffStatus)) fail("HANDOFF_STATUS_INVALID");
  if ((FUTURE.has(discipline) || !counterpart) && handoffStatus === "COMPLETE") fail("INCOMPLETE_COUNTERPART_NOT_COMPLETE");
  if (handoffStatus === "COMPLETE" && citedCurrentness !== "CURRENT") fail("CURRENTNESS_STATUS_MISMATCH");
  if ((handoffStatus === "AWAITING_COUNTERPART" || handoffStatus === "NOT_YET_AVAILABLE") && counterpart) fail("COUNTERPART_NOT_AWAITING");
  if (handoffStatus === "STALE" && citedCurrentness !== "STALE") fail("CURRENTNESS_STATUS_MISMATCH");
  if (handoffStatus === "REASSESSMENT_REQUIRED" && citedCurrentness !== "REASSESSMENT_REQUIRED") fail("CURRENTNESS_STATUS_MISMATCH");
  if (citedCurrentness === "CURRENT" && (handoffStatus === "STALE" || handoffStatus === "REASSESSMENT_REQUIRED")) fail("CURRENTNESS_STATUS_MISMATCH");
  const change = citeChange(store, actor, input.changeContextId, input.changeFingerprint, citedCurrentness, handoffStatus);
  const applicability = guardText(input.applicability, "APPLICABILITY_REQUIRED");
  const limitations = guardText(input.limitations, "LIMITATIONS_REQUIRED");
  const provenanceRef = explicit(input.provenanceRef, "PROVENANCE_REQUIRED");
  const handoffId = explicit(input.handoffId, "HANDOFF_ID_REQUIRED");
  const predecessorId = input.predecessorHandoffId ? explicit(input.predecessorHandoffId, "HANDOFF_ID_REQUIRED") : null;
  const predecessor = predecessorId ? store.handoffs.find((row) => row.handoffId === predecessorId) : null;
  if (predecessorId && (!predecessor || predecessor.tenantId !== actor.tenantId)) fail("HANDOFF_NOT_FOUND");
  if (predecessor && predecessor.recordStatus !== "CURRENT") fail("PREDECESSOR_NOT_CURRENT");
  const interfaceComplete = handoffStatus === "COMPLETE" && counterpart !== null;
  const fingerprint = fingerprintCanonical({
    handoffId,
    ...bound,
    change,
    counterpartDiscipline: discipline,
    direction,
    interfaceTopic,
    counterpart,
    applicability,
    limitations,
    handoffStatus,
    citedCurrentness,
    provenanceRef,
    authority: D4_CONTEXT_AUTHORITY,
    predecessorHandoffId: predecessor?.handoffId ?? null,
  });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.handoffs.find((row) => row.handoffId === handoffId);
  if (existing) return existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId ? existing : fail("HANDOFF_ALREADY_RECORDED");
  const signature = `${bound.objectId}|${bound.objectRevisionFingerprint}|${discipline}|${direction}|${interfaceTopic}|${counterpart?.interfaceId ?? ""}|${counterpart?.sourceRevision ?? ""}`;
  if (
    store.handoffs.some(
      (row) =>
        row.recordStatus === "CURRENT" &&
        row.handoffId !== predecessor?.handoffId &&
        row.contextId === bound.contextId &&
        `${row.objectId}|${row.objectRevisionFingerprint}|${row.counterpartDiscipline}|${row.direction}|${row.interfaceTopic}|${row.counterpart?.interfaceId ?? ""}|${row.counterpart?.sourceRevision ?? ""}` === signature,
    )
  ) {
    fail("DUPLICATE_HANDOFF_REJECTED");
  }
  const record: D4R8HandoffRecord = {
    handoffId,
    ...bound,
    changeContextId: change.changeContextId,
    changeFingerprint: change.changeFingerprint,
    counterpartDiscipline: discipline as D4R8HandoffRecord["counterpartDiscipline"],
    direction: direction as D4R8HandoffRecord["direction"],
    interfaceTopic,
    counterpart,
    applicability,
    limitations,
    sourceAuthority: D4_CONTEXT_AUTHORITY,
    receivingAuthority: discipline,
    authorityTransferred: false,
    interfaceComplete,
    reviewed: false,
    engineeringValidated: false,
    engineeringApproved: false,
    conformant: false,
    certified: false,
    deleted: false,
    invalidated: false,
    recalculated: false,
    redesigned: false,
    handoffStatus: handoffStatus as D4R8HandoffRecord["handoffStatus"],
    citedCurrentness,
    currentness: citedCurrentness,
    citedLifecycleStage: maturityOf(input.citedLifecycleStage),
    provenanceRef,
    fingerprint,
    predecessorHandoffId: predecessor?.handoffId ?? null,
    predecessorFingerprint: predecessor?.fingerprint ?? null,
    recordStatus: "CURRENT",
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
    createdAt: store.now(),
    createdBy: actor.actorId,
  };
  if (predecessor) {
    predecessor.recordStatus = "SUPERSEDED";
    predecessor.currentness = "SUPERSEDED";
    store.history.push({ historyId: `d4r8-history-${store.history.length + 1}`, handoffId: predecessor.handoffId, action: "SUPERSEDED", fingerprint: predecessor.fingerprint, recordedAt: store.now() });
  }
  store.handoffs.push(record);
  store.history.push({ historyId: `d4r8-history-${store.history.length + 1}`, handoffId: record.handoffId, action: "CREATED", fingerprint: record.fingerprint, recordedAt: store.now() });
  if (seal(store) !== before) fail("UPSTREAM_MUTATED");
  return record;
}

export function repointMechanicalHandoff(): never {
  return fail("AUTO_REPOINT_REJECTED");
}

export function mutateMechanicalInterface(): never {
  return fail("SILENT_MUTATION_REJECTED");
}

export function reasonAcrossMechanicalDisciplines(): never {
  return fail("CROSS_DISCIPLINE_REASONING_NOT_IN_R8");
}

export function detectMechanicalInterfaceConflict(): never {
  return fail("CONFLICT_DETECTION_NOT_IN_R8");
}

export function resolveMechanicalInterfaceConflict(): never {
  return fail("CONFLICT_RESOLUTION_NOT_IN_R8");
}

export function validateMechanicalCounterpart(): never {
  return fail("COUNTERPART_VALIDATION_NOT_IN_R8");
}

export function recalculateFromInterface(): never {
  return fail("RECALCULATION_NOT_IN_R8");
}

export function redesignFromInterface(): never {
  return fail("REDESIGN_NOT_IN_R8");
}

export function mutateDesignConditionFromInterface(): never {
  return fail("R3_MUTATION_REJECTED");
}

export function mutatePerformanceFromInterface(): never {
  return fail("R3_MUTATION_REJECTED");
}

export function mutateTechnicalRequirementFromInterface(): never {
  return fail("R5_MUTATION_REJECTED");
}

export function mutateMaintainabilityFromInterface(): never {
  return fail("R6_MUTATION_REJECTED");
}

export function fabricateMechanicalCounterpart(): never {
  return fail("COUNTERPART_FABRICATION_REJECTED");
}

export function promoteHandoffToValidated(): never {
  return fail("VALIDATION_PROMOTION_REJECTED");
}

export function startFutureDisciplineRuntime(): never {
  return fail("FUTURE_DISCIPLINE_RUNTIME_REJECTED");
}
