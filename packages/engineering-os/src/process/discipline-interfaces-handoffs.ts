/**
 * EOS-D6-R8 Process discipline interfaces and handoffs.
 * One bounded runtime. Reuses canonical interface governance and exact R1-R7 revisions.
 * A handoff cites an exact counterpart. It does not transfer authority, mutate that discipline, or validate it.
 */
import {
  D4_MECHANICAL_OBJECT_TYPES,
  D5_PIPING_OBJECT_TYPES,
  D6_CREATES_D5_ADOPTED_PIPING_DESIGN_CONDITION,
  D6_CURRENTNESS_STATES,
  D6_D1_D3_DIRECT_AUTHORITY_TRANSFER_ALLOWED,
  D6_D1_D3_DIRECT_INTERFACE_DEFINED,
  D6_D4_INTERFACE_SUBJECTS,
  D6_D5_CONTRACT_COMPATIBLE_WITH_EXISTING_D5_R8_CONTRACT,
  D6_D5_INTERFACE_SUBJECTS,
  D6_D7_FUTURE_CONTRACT_SUBJECTS,
  D6_D7_RUNTIME_INTEGRATION_COUNT,
  D6_D8_FUTURE_CONTRACT_SUBJECTS,
  D6_D8_RUNTIME_INTEGRATION_COUNT,
  D6_IMPLEMENTATION_PHASE_TYPES,
  D6_IMPLEMENTATION_PHASES,
  D6_MATURITY_STATES,
  D6_TRANSFERS_D4_AUTHORITY,
  D6_TRANSFERS_D5_AUTHORITY,
  D6_TRANSFERS_ELECTRICAL_AUTHORITY,
  D6_TRANSFERS_IAC_AUTHORITY,
  D6_VALIDATES_D1_D3_ENGINEERING,
  D6_VALIDATES_D4_MECHANICAL_ENGINEERING,
  D6_VALIDATES_D5_PIPING_ENGINEERING,
  PROCESS_CONDITION_EQUALS_PIPING_DESIGN_CONDITION,
  PROCESS_CONTROL_INTENT_EQUALS_IAC_DESIGN,
  PROCESS_EQUIPMENT_DUTY_EQUALS_MECHANICAL_EQUIPMENT_DESIGN,
  PROCESS_EQUIPMENT_REQUIREMENT_EQUALS_VALIDATED_MECHANICAL_SELECTION,
  PROCESS_MEASUREMENT_REQUIREMENT_EQUALS_INSTRUMENT_DESIGN,
  PROCESS_SOURCE_CONDITION_EQUALS_ADOPTED_PIPING_DESIGN_CONDITION,
  PROCESS_STREAM_EQUALS_PIPING_LINE,
} from "@rtb/types";
import { D2_R8_HANDOFF_STATUSES } from "../civil/discipline-interfaces-handoffs";
import type { D2R1Store } from "../civil/identity-foundation";
import { assertHumanApprovalActor } from "../decision-intelligence/invariants";
import type { D3R1Store } from "../geotechnical/identity-foundation";
import type { D4R1Store } from "../mechanical/identity-foundation";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import type { D5R1Store } from "../piping/identity-foundation";
import {
  D1K_R3_AI_CAN_APPROVE_INTERFACE,
  D1K_R3_SILENT_SOURCE_REPOINTING_ALLOWED,
} from "../structural-systems/interface-handoff-governance";
import type { D1kR1Store } from "../structural-systems/interface-identity-foundation";
import { assertInterfaceDirectionality, assertInterfaceType } from "../systems-intelligence/invariants";
import { D6_CONTEXT_AUTHORITY, D6_DISCIPLINE, D6_EXPLICIT_RELATIONSHIP_KINDS, type D6R1Actor } from "./identity-foundation";
import { PROCESS_SAFEGUARD_REQUIREMENT_EQUALS_IAC_IMPLEMENTATION } from "./process-safety-relief-context";
import {
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
  D6_APPROVAL_RUNTIME_COUNT,
  D6_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT,
  D6_AUTOMATIC_PROCESS_CALCULATION_RUNTIME_COUNT,
  D6_AUTOMATIC_REDESIGN_RUNTIME_COUNT,
  D6_CERTIFICATION_RUNTIME_COUNT,
  D6_CONFORMANCE_DETERMINATION_RUNTIME_COUNT,
  D6_CROSS_DISCIPLINE_CONFLICT_DETECTION_RUNTIME_COUNT,
  D6_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT,
  D6_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT,
  D6_CROSS_DISCIPLINE_RECOMMENDATION_RUNTIME_COUNT,
  D6_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT,
  D6_D9_RUNTIME_INTEGRATION_COUNT,
  D6_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
  D6_DEPRESSURING_CALCULATION_RUNTIME_COUNT,
  D6_DESIGN_BASIS_CONDITION_RUNTIME_READY,
  D6_DISCIPLINE_INTERFACE_RUNTIME_COUNT as R7_INTERFACE_COUNT,
  D6_ENERGY_BALANCE_CALCULATION_RUNTIME_COUNT,
  D6_EQUALS_D1_STRUCTURAL_AUTHORITY,
  D6_EQUALS_D2_CIVIL_AUTHORITY,
  D6_EQUALS_D3_GEOTECHNICAL_AUTHORITY,
  D6_EQUALS_D4_MECHANICAL_AUTHORITY,
  D6_EQUALS_D5_PIPING_AUTHORITY,
  D6_EQUALS_D7_ELECTRICAL_AUTHORITY,
  D6_EQUALS_D8_INSTRUMENTATION_CONTROL_AUTHORITY,
  D6_EQUIPMENT_DUTY_CALCULATION_RUNTIME_COUNT,
  D6_EQUIPMENT_DUTY_RUNTIME_READY,
  D6_HYDRAULIC_CALCULATION_RUNTIME_COUNT,
  D6_MASS_BALANCE_CALCULATION_RUNTIME_COUNT,
  D6_PRESSURE_DROP_CALCULATION_RUNTIME_COUNT,
  D6_PROCESS_CALCULATION_RUNTIME_COUNT,
  D6_PROCESS_EVIDENCE_RUNTIME_READY,
  D6_PROCESS_IDENTITY_RUNTIME_READY,
  D6_PROCESS_SAFETY_RELIEF_RUNTIME_READY,
  D6_RELIEF_CALCULATION_RUNTIME_COUNT,
  D6_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY,
  D6_REUSES_CANONICAL_CURRENTNESS,
  D6_REUSES_CANONICAL_DIGITAL_THREAD,
  D6_REUSES_CANONICAL_FINGERPRINT,
  D6_REVIEW_VALIDATION_RUNTIME_COUNT,
  D6_RUNTIME_COUNT as R7_RUNTIME_COUNT,
  D6_SYSTEM_STREAM_SERVICE_RUNTIME_READY,
  D6_UTILITY_CALCULATION_RUNTIME_COUNT,
  D7_RUNTIME_STARTED,
  D8_RUNTIME_STARTED,
  D9_RUNTIME_COUNT,
  D9_RUNTIME_STARTED,
  DATABASE_SCHEMA_CHANGED,
  NEW_DEPENDENCY_ADDED,
  PARALLEL_D6_CURRENTNESS_ENGINE_CREATED,
  PARALLEL_D6_DIGITAL_THREAD_CREATED,
  SECOND_D6_FINGERPRINT_ALGORITHM_CREATED,
  UNAUTHORIZED_CROSS_DISCIPLINE_REASONING_PROMOTION,
  UNAUTHORIZED_D1_PACK_COMPLETION,
  UNAUTHORIZED_D2_REOPEN,
  UNAUTHORIZED_D3_REOPEN,
  UNAUTHORIZED_D4_REOPEN,
  UNAUTHORIZED_D5_REOPEN,
  UNAUTHORIZED_D7_RUNTIME_PROMOTION,
  UNAUTHORIZED_D8_RUNTIME_PROMOTION,
  UNAUTHORIZED_D9_RUNTIME_PROMOTION,
  UNAUTHORIZED_DISCIPLINE_AUTHORITY_TRANSFER,
  UNAUTHORIZED_GA_PROMOTION,
  UNAUTHORIZED_PROCESS_VALIDATION_PROMOTION,
  UNAUTHORIZED_PRODUCT_CLAIM,
  ADMIN_EQUALS_D6_PROCESS_ENGINEERING_AUTHORITY,
  AI_EQUALS_D6_PROCESS_ENGINEERING_AUTHORITY,
  D6_R7_DEPENDENCY_TARGETS,
  type D6R7Store,
} from "./requirements-assumptions-change";

export const D6_R8_STATUS = "DISCIPLINE_INTERFACES_AND_HANDOFFS_IMPLEMENTED" as const;
export const D6_R8_MATURITY = D6_R8_STATUS;
export const D6_R8_MATURITY_STATE = D6_R8_STATUS;
export const D6_R8_CLOSEOUT_PATH =
  "docs/architecture/engineering-os/EOS_D6_R8_DISCIPLINE_INTERFACES_AND_HANDOFFS_CLOSEOUT.md" as const;
export const D6_RUNTIME_STARTED = true as const;
export const D6_RUNTIME_COUNT = 8 as const;
export const D6_R7_RUNTIME_COUNT = R7_RUNTIME_COUNT;
export const D6_R7_DISCIPLINE_INTERFACE_RUNTIME_COUNT = R7_INTERFACE_COUNT;
export const D6_DISCIPLINE_INTERFACE_RUNTIME_IMPLEMENTED = true as const;
export const D6_DISCIPLINE_INTERFACE_RUNTIME_COUNT = 1 as const;
export const D6_DISCIPLINE_INTERFACE_RUNTIME_READY = true as const;
export const D6_R1_R7_EXACT_SOURCE_REVISIONS_REUSED = true as const;
export const EXACT_D6_INTERFACE_SOURCE_REVISION_REQUIRED = true as const;
export const FLOATING_D6_INTERFACE_SOURCE_REFERENCE_ALLOWED = false as const;
export const D6_INTERFACE_SOURCE_AUTO_REPOINTED = D1K_R3_SILENT_SOURCE_REPOINTING_ALLOWED;
export const EXACT_D6_INTERFACE_COUNTERPART_REVISION_REQUIRED = true as const;
export const FLOATING_D6_INTERFACE_COUNTERPART_REFERENCE_ALLOWED = false as const;
export const D6_INTERFACE_COUNTERPART_AUTO_REPOINTED = D1K_R3_SILENT_SOURCE_REPOINTING_ALLOWED;
export const D6_REUSES_CANONICAL_INTERFACE_GOVERNANCE = true as const;
export const PARALLEL_D6_INTERFACE_FRAMEWORK_CREATED = false as const;
export const D6_EXPLICIT_COUNTERPART_REFERENCE_REQUIRED = true as const;
export const D6_INFERRED_COUNTERPART_ALLOWED = false as const;
export const D6_MISSING_COUNTERPART_AUTO_FABRICATED = false as const;
export const D6_D4_HANDOFF_IMPLEMENTED = true as const;
export const EXACT_D4_COUNTERPART_REVISION_REQUIRED = true as const;
export const D6_D4_HANDOFF_TRANSFERS_MECHANICAL_AUTHORITY = D6_TRANSFERS_D4_AUTHORITY;
export const D6_D4_HANDOFF_VALIDATES_MECHANICAL_ENGINEERING = D6_VALIDATES_D4_MECHANICAL_ENGINEERING;
export const D6_AUTO_MUTATES_D4_COUNTERPART = false as const;
export const D6_D5_HANDOFF_IMPLEMENTED = true as const;
export { D6_D5_CONTRACT_COMPATIBLE_WITH_EXISTING_D5_R8_CONTRACT };
export const EXACT_D5_COUNTERPART_REVISION_REQUIRED = true as const;
export const D6_D5_HANDOFF_TRANSFERS_PIPING_AUTHORITY = D6_TRANSFERS_D5_AUTHORITY;
export const D6_D5_HANDOFF_VALIDATES_PIPING_ENGINEERING = D6_VALIDATES_D5_PIPING_ENGINEERING;
export const D6_AUTO_MUTATES_D5_COUNTERPART = false as const;
export const D6_D7_HANDOFF_CONTRACT_IMPLEMENTED = true as const;
export { D6_D7_RUNTIME_INTEGRATION_COUNT };
export const D6_D7_HANDOFF_TRANSFERS_ELECTRICAL_AUTHORITY = D6_TRANSFERS_ELECTRICAL_AUTHORITY;
export const D6_D7_HANDOFF_CREATES_ELECTRICAL_DESIGN = false as const;
export const D6_D8_HANDOFF_CONTRACT_IMPLEMENTED = true as const;
export { D6_D8_RUNTIME_INTEGRATION_COUNT };
export const D6_D8_HANDOFF_TRANSFERS_IAC_AUTHORITY = D6_TRANSFERS_IAC_AUTHORITY;
export const D6_D8_HANDOFF_CREATES_IAC_DESIGN = false as const;
export const D6_D8_HANDOFF_EQUALS_FUNCTIONAL_SAFETY_VALIDATION = false as const;
export const D6_D1_D3_INTERFACE_REFERENCE_SUPPORTED_WHERE_CANONICAL = true as const;
export const D6_VALIDATES_D1_STRUCTURAL_ENGINEERING = D6_VALIDATES_D1_D3_ENGINEERING;
export const D6_VALIDATES_D2_CIVIL_ENGINEERING = D6_VALIDATES_D1_D3_ENGINEERING;
export const D6_VALIDATES_D3_GEOTECHNICAL_ENGINEERING = D6_VALIDATES_D1_D3_ENGINEERING;
export const D6_TRANSFERS_D1_D3_AUTHORITY = D6_D1_D3_DIRECT_AUTHORITY_TRANSFER_ALLOWED;
export const D6_HANDOFF_CONTENT_EQUALS_COUNTERPART_ENGINEERING_TRUTH = false as const;
export const D6_HANDOFF_COMPLETED_EQUALS_COUNTERPART_VALIDATED = false as const;
export const D6_HANDOFF_ACCEPTED_EQUALS_COUNTERPART_APPROVED = false as const;
export const D6_INTERFACE_SOURCE_AUTHORITY_PRESERVED = true as const;
export const D6_INTERFACE_COUNTERPART_AUTHORITY_PRESERVED = true as const;
export const D6_R7_CHANGE_INTERFACE_INTEGRATION_IMPLEMENTED = true as const;
export const D6_R7_REASSESSMENT_INTERFACE_INTEGRATION_IMPLEMENTED = true as const;
export const D6_INTERFACE_CHANGE_AUTO_MUTATES_COUNTERPART = false as const;
export const D6_INTERFACE_CHANGE_AUTO_RECALCULATES_COUNTERPART = false as const;
export const D6_INTERFACE_CHANGE_AUTO_REVALIDATES_COUNTERPART = false as const;
export const D6_INTERFACE_CHANGE_AUTO_REPOINTS_COUNTERPART = false as const;
export const D6_INTERFACE_EXPLICIT_DEPENDENCY_REQUIRED = true as const;
export const D6_INTERFACE_INFERRED_DEPENDENCY_ALLOWED = false as const;
export const D6_INTERFACE_CURRENTNESS_INTEGRATED = true as const;
export const STALE_D6_HANDOFF_EXPOSED_AS_CURRENT = false as const;
export const SUPERSEDED_D6_HANDOFF_EXPOSED_AS_CURRENT = false as const;
export const D6_INTERFACE_HISTORICAL_REFERENCE_AUTO_REPOINTED = D1K_R3_SILENT_SOURCE_REPOINTING_ALLOWED;
export const D6_INTERFACE_COUNTERPART_HISTORY_AUTO_REPOINTED = D1K_R3_SILENT_SOURCE_REPOINTING_ALLOWED;
export const D6_R8_HISTORY_PRESERVED = true as const;
export const D6_R8_AUTO_MUTATES_R1_IDENTITY = false as const;
export const D6_R8_AUTO_MUTATES_R2_SYSTEM_STREAM_CONTEXT = false as const;
export const D6_R8_AUTO_MUTATES_R3_CONDITION = false as const;
export const D6_R8_AUTO_MUTATES_R4_EVIDENCE = false as const;
export const D6_R8_AUTO_MUTATES_R5_EQUIPMENT_DUTY = false as const;
export const D6_R8_AUTO_MUTATES_R6_SAFETY_CONTEXT = false as const;
export const D6_R8_AUTO_MUTATES_R7_CHANGE_GOVERNANCE = false as const;
export const D6_R8_AUTO_ADOPTS_D5_PIPING_DESIGN_CONDITION = D6_CREATES_D5_ADOPTED_PIPING_DESIGN_CONDITION;
export const D6_R8_PROVENANCE_REQUIRED = true as const;
export const D6_R8_PROVENANCE_PRESERVED = true as const;
export const D6_R8_SOURCE_BASIS_REQUIRED = true as const;
export const D6_R8_SOURCE_BASIS_TRACEABLE = true as const;
export const BASISLESS_AUTHORITATIVE_D6_R8_HANDOFF_AUTO_ACCEPTED = false as const;
export const D6_R8_APPLICABILITY_EXPLICIT = true as const;
export const D6_R8_LIMITATIONS_EXPLICIT = true as const;
export const D6_R8_AUTO_PROPAGATED_OUTSIDE_APPLICABILITY = false as const;
export const TENANT_WORKSPACE_PROJECT_D6_R8_SCOPE_ENFORCED = true as const;
export const CROSS_TENANT_D6_R8_ACCESS_ALLOWED = false as const;
export const AI_CAN_INVENT_D6_INTERFACE_COUNTERPART = D1K_R3_AI_CAN_APPROVE_INTERFACE;
export const AI_CAN_INVENT_D6_INTERFACE_RELATIONSHIP = D1K_R3_AI_CAN_APPROVE_INTERFACE;
export const ADMIN_CAN_PROMOTE_D6_HANDOFF_TO_COUNTERPART_VALIDATION = false as const;
export const D6_R8_DUPLICATE_GOVERNANCE_IMPLEMENTED = true as const;
export const D6_R8_REPLAY_PROTECTION_IMPLEMENTED = true as const;
export const D6_R8_SPOOFING_PROTECTION_IMPLEMENTED = true as const;
export const D6_R8_HANDOFF_STATUSES = D2_R8_HANDOFF_STATUSES;
export const D6_R8_DIRECTIONS = ["D6_TO_COUNTERPART", "COUNTERPART_TO_D6"] as const;
export const D6_R8_REFERENCE_TOPIC = "JUSTIFIED_CANONICAL_REFERENCE" as const;
export const D6_R9_CANONICAL_PHASE = D6_IMPLEMENTATION_PHASES[8];
export const D6_R9_PHASE_TYPE = D6_IMPLEMENTATION_PHASE_TYPES[8];
export const D6_R9_CANONICAL_SCOPE =
  "Implement canonical D6 Process review-request, reviewer-authority, review-finding, finding-disposition, review-completion and validation-state governance across exact R1-R8 revisions. Integrate R7 reassessment state and R8 interface context. Preserve review requested != completed, review completed != validated, finding closed != validated, validated != conformant/approved/certified, no automatic transfer of review/validation to new revisions, and no validation of counterpart disciplines." as const;
export const D6_R9_STARTED = false as const;
export const D6_R8_READY_FOR_NEXT_PHASE = true as const;
export const D6_R8_NEXT_PHASE = D6_R9_CANONICAL_PHASE;
export const D6_R8_NEXT_PHASE_TYPE = D6_R9_PHASE_TYPE;
export const D6_R8_CANONICAL_NEXT_PHASE = D6_R9_CANONICAL_PHASE;
export const D6_R8_CANONICAL_NEXT_PHASE_SCOPE = D6_R9_CANONICAL_SCOPE;
export const D6_R8_BLOCKER = "NONE" as const;
export const D6_R8_MACHINE_READABLE_ROADMAP_UPDATED = true as const;
export const UNAUTHORIZED_D6_R9_R12_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_COUNTERPART_FABRICATION = false as const;
export const UNAUTHORIZED_INFERRED_INTERFACE_RELATIONSHIP = false as const;
export const UNAUTHORIZED_COUNTERPART_AUTO_REPOINT = false as const;
export const UNAUTHORIZED_COUNTERPART_MUTATION = false as const;
export const UNAUTHORIZED_COUNTERPART_VALIDATION = false as const;

export {
  PROCESS_CONDITION_EQUALS_PIPING_DESIGN_CONDITION,
  PROCESS_SOURCE_CONDITION_EQUALS_ADOPTED_PIPING_DESIGN_CONDITION,
  PROCESS_STREAM_EQUALS_PIPING_LINE,
  PROCESS_EQUIPMENT_DUTY_EQUALS_MECHANICAL_EQUIPMENT_DESIGN,
  PROCESS_EQUIPMENT_REQUIREMENT_EQUALS_VALIDATED_MECHANICAL_SELECTION,
  PROCESS_SAFEGUARD_REQUIREMENT_EQUALS_IAC_IMPLEMENTATION,
  PROCESS_CONTROL_INTENT_EQUALS_IAC_DESIGN,
  PROCESS_MEASUREMENT_REQUIREMENT_EQUALS_INSTRUMENT_DESIGN,
  D6_REUSES_CANONICAL_CURRENTNESS,
  PARALLEL_D6_CURRENTNESS_ENGINE_CREATED,
  D6_REUSES_CANONICAL_DIGITAL_THREAD,
  D6_REUSES_CANONICAL_FINGERPRINT,
  PARALLEL_D6_DIGITAL_THREAD_CREATED,
  SECOND_D6_FINGERPRINT_ALGORITHM_CREATED,
  D6_PROCESS_IDENTITY_RUNTIME_READY,
  D6_SYSTEM_STREAM_SERVICE_RUNTIME_READY,
  D6_DESIGN_BASIS_CONDITION_RUNTIME_READY,
  D6_PROCESS_EVIDENCE_RUNTIME_READY,
  D6_EQUIPMENT_DUTY_RUNTIME_READY,
  D6_PROCESS_SAFETY_RELIEF_RUNTIME_READY,
  D6_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY,
  D6_REVIEW_VALIDATION_RUNTIME_COUNT,
  D6_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT,
  D6_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
  D6_D9_RUNTIME_INTEGRATION_COUNT,
  D6_PROCESS_CALCULATION_RUNTIME_COUNT,
  D6_MASS_BALANCE_CALCULATION_RUNTIME_COUNT,
  D6_ENERGY_BALANCE_CALCULATION_RUNTIME_COUNT,
  D6_HYDRAULIC_CALCULATION_RUNTIME_COUNT,
  D6_PRESSURE_DROP_CALCULATION_RUNTIME_COUNT,
  D6_EQUIPMENT_DUTY_CALCULATION_RUNTIME_COUNT,
  D6_RELIEF_CALCULATION_RUNTIME_COUNT,
  D6_DEPRESSURING_CALCULATION_RUNTIME_COUNT,
  D6_UTILITY_CALCULATION_RUNTIME_COUNT,
  D6_AUTOMATIC_PROCESS_CALCULATION_RUNTIME_COUNT,
  D6_AUTOMATIC_REDESIGN_RUNTIME_COUNT,
  D6_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT,
  D6_CONFORMANCE_DETERMINATION_RUNTIME_COUNT,
  D6_APPROVAL_RUNTIME_COUNT,
  D6_CERTIFICATION_RUNTIME_COUNT,
  D6_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT,
  D6_CROSS_DISCIPLINE_CONFLICT_DETECTION_RUNTIME_COUNT,
  D6_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT,
  D6_CROSS_DISCIPLINE_RECOMMENDATION_RUNTIME_COUNT,
  D6_EQUALS_D1_STRUCTURAL_AUTHORITY,
  D6_EQUALS_D2_CIVIL_AUTHORITY,
  D6_EQUALS_D3_GEOTECHNICAL_AUTHORITY,
  D6_EQUALS_D4_MECHANICAL_AUTHORITY,
  D6_EQUALS_D5_PIPING_AUTHORITY,
  D6_EQUALS_D7_ELECTRICAL_AUTHORITY,
  D6_EQUALS_D8_INSTRUMENTATION_CONTROL_AUTHORITY,
  AI_EQUALS_D6_PROCESS_ENGINEERING_AUTHORITY,
  ADMIN_EQUALS_D6_PROCESS_ENGINEERING_AUTHORITY,
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
  D7_RUNTIME_STARTED,
  D8_RUNTIME_STARTED,
  D9_RUNTIME_STARTED,
  D9_RUNTIME_COUNT,
  DATABASE_SCHEMA_CHANGED,
  NEW_DEPENDENCY_ADDED,
  D6_D1_D3_DIRECT_INTERFACE_DEFINED,
  UNAUTHORIZED_D1_PACK_COMPLETION,
  UNAUTHORIZED_D2_REOPEN,
  UNAUTHORIZED_D3_REOPEN,
  UNAUTHORIZED_D4_REOPEN,
  UNAUTHORIZED_D5_REOPEN,
  UNAUTHORIZED_D7_RUNTIME_PROMOTION,
  UNAUTHORIZED_D8_RUNTIME_PROMOTION,
  UNAUTHORIZED_D9_RUNTIME_PROMOTION,
  UNAUTHORIZED_DISCIPLINE_AUTHORITY_TRANSFER,
  UNAUTHORIZED_CROSS_DISCIPLINE_REASONING_PROMOTION,
  UNAUTHORIZED_PROCESS_VALIDATION_PROMOTION,
  UNAUTHORIZED_GA_PROMOTION,
  UNAUTHORIZED_PRODUCT_CLAIM,
};

const FLOATING = new Set(["latest", "current", "newest", "head", "active", "active model", "now"]);
const INFERRED = new Set([
  "inferred", "matching tag", "equipment number", "stream number", "line number", "document proximity",
  "same system", "semantic similarity", "ai reasoning", "shared tag", "shared system", "matching values", "ai interpretation",
]);
const FUTURE = new Set(["electrical", "instrumentation_control"]);
const REFERENCE = new Set(["structural", "civil", "geotechnical"]);

type Currentness = (typeof D6_CURRENTNESS_STATES)[number];
type SourceKind = (typeof D6_R7_DEPENDENCY_TARGETS)[number];
type Prohibited = {
  inferCounterpart?: boolean;
  fabricateCounterpart?: boolean;
  transferAuthority?: boolean;
  validateCounterpart?: boolean;
  promoteValidated?: boolean;
  mutateCounterpart?: boolean;
  recalculateCounterpart?: boolean;
  revalidateCounterpart?: boolean;
  repointCounterpart?: boolean;
  adoptPipingCondition?: boolean;
  createElectricalDesign?: boolean;
  createIacDesign?: boolean;
  functionalSafetyValidation?: boolean;
  reasonAcrossDisciplines?: boolean;
  mutateR1?: boolean;
  mutateR2?: boolean;
  mutateR3?: boolean;
  mutateR4?: boolean;
  mutateR5?: boolean;
  mutateR6?: boolean;
  mutateR7?: boolean;
  propagateOutsideApplicability?: boolean;
  d9Reasoning?: boolean;
  reviewValidation?: boolean;
};

export type D6R8Dependency = {
  kind: (typeof D6_EXPLICIT_RELATIONSHIP_KINDS)[number];
  targetKind: SourceKind;
  targetId: string;
  targetFingerprint: string;
};

export type D6R8CounterpartPin = {
  counterpartId: string;
  sourceRevision: string;
  fingerprint: string;
  discipline: string;
};

export type D6R8HandoffRecord = {
  handoffId: string;
  contextId: string;
  objectId: string;
  objectRevisionFingerprint: string;
  r2Kind: "STREAM" | "SYSTEM";
  r2RecordId: string;
  r2Fingerprint: string;
  sourceKind: SourceKind;
  sourceId: string;
  sourceFingerprint: string;
  dependencies: D6R8Dependency[];
  counterpartDiscipline: string;
  direction: (typeof D6_R8_DIRECTIONS)[number];
  interfaceTopic: string;
  counterpart: D6R8CounterpartPin | null;
  applicability: string;
  limitations: string;
  provenanceRef: string;
  sourceBasisRef: string;
  sourceAuthority: typeof D6_CONTEXT_AUTHORITY;
  receivingAuthority: string;
  authorityTransferred: false;
  interfaceComplete: boolean;
  engineeringValidated: false;
  approved: false;
  conformant: false;
  counterpartTruth: false;
  mechanicalDesign: false;
  pipingConditionAdopted: false;
  electricalDesignCreated: false;
  iacDesignCreated: false;
  functionalSafetyValidated: false;
  handoffStatus: (typeof D6_R8_HANDOFF_STATUSES)[number];
  citedCurrentness: Currentness;
  currentness: Currentness;
  citedLifecycleStage: (typeof D6_MATURITY_STATES)[number];
  fingerprint: string;
  predecessorHandoffId: string | null;
  predecessorFingerprint: string | null;
  recordStatus: "CURRENT" | "SUPERSEDED";
  tenantId: string;
  workspaceId: string;
  projectId: string;
  deleted: false;
  invalidated: false;
  createdAt: string;
  createdBy: string;
};

export type D6R8History = {
  historyId: string;
  handoffId: string;
  action: "CREATED" | "SUPERSEDED" | "CURRENTNESS_MARKED";
  fingerprint: string;
  recordedAt: string;
};

export type D6R8Store = {
  r7: D6R7Store;
  d4: D4R1Store | null;
  d5: D5R1Store | null;
  d2: D2R1Store | null;
  d3: D3R1Store | null;
  d1: D1kR1Store | null;
  now: () => string;
  handoffs: D6R8HandoffRecord[];
  history: D6R8History[];
};

type SourcePin = { objectId: string; subjectObjectId?: string; fingerprint: string; recordStatus: string; tenantId: string };

function governedObject(row: SourcePin): string {
  return row.subjectObjectId ?? row.objectId;
}

function fail(code: string): never {
  throw new Error(`D6_R8_${code}`);
}

function blockedParty(value: string): boolean {
  return /^AI(?:\b|_)/i.test(value) || /LLM/i.test(value) || /OPTIMIZER/i.test(value);
}

function explicit(value: string, code: string): string {
  const token = value.trim();
  if (!token || FLOATING.has(token.toLowerCase()) || INFERRED.has(token.toLowerCase()) || blockedParty(token)) fail(code);
  if (/[=]|calc\(|solve\(/i.test(token)) fail("HIDDEN_CALCULATION_REJECTED");
  return token;
}

function assertActor(actor: D6R1Actor): void {
  if (!actor.actorId.trim() || !actor.tenantId.trim() || !actor.workspaceId.trim() || !actor.projectId.trim()) fail("SCOPE_REQUIRED");
  if (blockedParty(actor.actorId) || blockedParty(actor.authority)) fail("AI_NOT_PROCESS_AUTHORITY");
  if (actor.authority === "ADMIN" || actor.authority === "ADMINISTRATOR") fail("ADMIN_NOT_PROCESS_AUTHORITY");
  if (actor.authority === "PROCESS_ENGINEERING_AUTHORITY") fail("AUTHORITY_SPOOFING_REJECTED");
  if (actor.authority !== D6_CONTEXT_AUTHORITY) fail("RECORDER_AUTHORITY_INVALID");
  assertHumanApprovalActor("human", actor.actorId);
}

function assertProhibited(input: Prohibited): void {
  if (input.inferCounterpart === true) fail("INFERRED_COUNTERPART_REJECTED");
  if (input.fabricateCounterpart === true) fail("COUNTERPART_FABRICATION_REJECTED");
  if (input.transferAuthority === true) fail("AUTHORITY_TRANSFER_REJECTED");
  if (input.validateCounterpart === true || input.promoteValidated === true) fail("COUNTERPART_VALIDATION_NOT_IN_R8");
  if (input.mutateCounterpart === true) fail("COUNTERPART_MUTATION_REJECTED");
  if (input.recalculateCounterpart === true) fail("COUNTERPART_RECALCULATION_REJECTED");
  if (input.revalidateCounterpart === true) fail("COUNTERPART_REVALIDATION_REJECTED");
  if (input.repointCounterpart === true) fail("AUTO_REPOINT_REJECTED");
  if (input.adoptPipingCondition === true) fail("PIPING_CONDITION_NOT_ADOPTED");
  if (input.createElectricalDesign === true || input.createIacDesign === true) fail("FUTURE_DISCIPLINE_DESIGN_REJECTED");
  if (input.functionalSafetyValidation === true) fail("FUNCTIONAL_SAFETY_VALIDATION_NOT_IN_R8");
  if (input.reasonAcrossDisciplines === true || input.d9Reasoning === true) fail("CROSS_DISCIPLINE_REASONING_NOT_IN_R8");
  if (input.reviewValidation === true) fail("REVIEW_NOT_IN_R8");
  if (input.mutateR1 === true || input.mutateR2 === true || input.mutateR3 === true || input.mutateR4 === true || input.mutateR5 === true || input.mutateR6 === true || input.mutateR7 === true) {
    fail("UPSTREAM_MUTATION_REJECTED");
  }
  if (input.propagateOutsideApplicability === true) fail("APPLICABILITY_PROPAGATION_REJECTED");
}

function sameScope(row: { tenantId: string; workspaceId: string; projectId: string }, actor: D6R1Actor): boolean {
  return row.tenantId === actor.tenantId && row.workspaceId === actor.workspaceId && row.projectId === actor.projectId;
}

function findSource(store: D6R7Store, kind: string, id: string): SourcePin | undefined {
  const r1 = store.r6.r5.r4.r3.r2.r1;
  const r2 = store.r6.r5.r4.r3.r2;
  const r3 = store.r6.r5.r4.r3;
  const r4 = store.r6.r5.r4;
  const r5 = store.r6.r5;
  if (kind === "R1_IDENTITY") return r1.objects.find((row) => row.objectId === id);
  if (kind === "R2_STREAM") return r2.streams.find((row) => row.streamRecordId === id);
  if (kind === "R2_SYSTEM") return r2.systems.find((row) => row.systemRecordId === id);
  if (kind === "R3_CONDITION") return r3.conditions.find((row) => row.conditionId === id);
  if (kind === "R3_DESIGN_BASIS") return r3.bases.find((row) => row.basisRecordId === id);
  if (kind === "R4_EVIDENCE") return r4.evidence.find((row) => row.evidenceId === id);
  if (kind === "R5_DUTY") return r5.duties.find((row) => row.requirementId === id);
  if (kind === "R5_UTILITY") return r5.utilities.find((row) => row.utilityRecordId === id);
  if (kind === "R6_SAFETY") return store.r6.records.find((row) => row.recordId === id);
  if (kind === "R7_REQUIREMENT") return store.requirements.find((row) => row.requirementId === id);
  if (kind === "R7_ASSUMPTION") return store.assumptions.find((row) => row.assumptionId === id);
  if (kind === "R7_DECISION") return store.decisions.find((row) => row.decisionId === id);
  return undefined;
}

function seal(store: D6R8Store): string {
  const r7 = store.r7;
  const r6 = r7.r6;
  const r5 = r6.r5;
  const r4 = r5.r4;
  const r3 = r4.r3;
  const r2 = r3.r2;
  const r1 = r2.r1;
  return JSON.stringify({
    objects: r1.objects,
    streams: r2.streams,
    systems: r2.systems,
    conditions: r3.conditions,
    bases: r3.bases,
    evidence: r4.evidence,
    duties: r5.duties,
    utilities: r5.utilities,
    safety: r6.records,
    requirements: r7.requirements,
    assumptions: r7.assumptions,
    decisions: r7.decisions,
    changes: r7.changes,
    reassessments: r7.reassessments,
    d4: store.d4?.objects ?? [],
    d5: store.d5?.objects ?? [],
    d2: store.d2?.objects ?? [],
    d3: store.d3?.objects ?? [],
    d1: store.d1?.records ?? [],
  });
}

function topicFor(discipline: string, topic: string): string {
  const value = explicit(topic, "INTERFACE_TOPIC_REQUIRED");
  if (REFERENCE.has(discipline)) return value === D6_R8_REFERENCE_TOPIC ? value : fail("INTERFACE_TOPIC_INVALID");
  const allowed = discipline === "mechanical"
    ? D6_D4_INTERFACE_SUBJECTS
    : discipline === "piping"
      ? D6_D5_INTERFACE_SUBJECTS
      : discipline === "electrical"
        ? D6_D7_FUTURE_CONTRACT_SUBJECTS
        : D6_D8_FUTURE_CONTRACT_SUBJECTS;
  if (!(allowed as readonly string[]).includes(value)) fail("INTERFACE_TOPIC_INVALID");
  return value;
}

function pinCounterpart(store: D6R8Store, actor: D6R1Actor, discipline: string, id: string | null | undefined, revision: string | null | undefined, fingerprint: string | null | undefined, cited: Currentness): D6R8CounterpartPin | null {
  if (FUTURE.has(discipline)) {
    if ((id != null && id !== "") || (revision != null && revision !== "") || (fingerprint != null && fingerprint !== "")) fail("COUNTERPART_FABRICATION_REJECTED");
    return null;
  }
  if (id == null || id === "") {
    if ((revision != null && revision !== "") || (fingerprint != null && fingerprint !== "")) fail("COUNTERPART_REVISION_WITHOUT_REFERENCE");
    return null;
  }
  const counterpartId = explicit(id, "COUNTERPART_REFERENCE_REQUIRED");
  const sourceRevision = explicit(revision ?? "", "COUNTERPART_REVISION_REQUIRED");
  const asserted = fingerprint == null || fingerprint === "" ? null : explicit(fingerprint, "COUNTERPART_FINGERPRINT_REQUIRED");
  if (discipline === "mechanical") {
    const row = store.d4?.objects.find((item) => item.objectId === counterpartId);
    if (!row || !sameScope(row, actor) || !(D4_MECHANICAL_OBJECT_TYPES as readonly string[]).includes(row.objectType)) fail("COUNTERPART_NOT_FOUND");
    if (row.provenanceRef !== sourceRevision) fail("COUNTERPART_REVISION_MISMATCH");
    if (asserted != null && row.fingerprint !== asserted) fail("FINGERPRINT_MISMATCH");
    if (cited === "CURRENT" && row.recordStatus !== "CURRENT") fail("COUNTERPART_NOT_CURRENT");
    return { counterpartId: row.objectId, sourceRevision: row.provenanceRef, fingerprint: row.fingerprint, discipline };
  }
  if (discipline === "piping") {
    const row = store.d5?.objects.find((item) => item.objectId === counterpartId);
    if (!row || !sameScope(row, actor) || !(D5_PIPING_OBJECT_TYPES as readonly string[]).includes(row.objectType)) fail("COUNTERPART_NOT_FOUND");
    if (row.provenanceRef !== sourceRevision) fail("COUNTERPART_REVISION_MISMATCH");
    if (asserted != null && row.fingerprint !== asserted) fail("FINGERPRINT_MISMATCH");
    if (cited === "CURRENT" && row.recordStatus !== "CURRENT") fail("COUNTERPART_NOT_CURRENT");
    return { counterpartId: row.objectId, sourceRevision: row.provenanceRef, fingerprint: row.fingerprint, discipline };
  }
  if (discipline === "structural") {
    const row = store.d1?.records.find((item) => item.interfaceId === counterpartId);
    if (!row || !sameScope(row, actor)) fail("COUNTERPART_NOT_FOUND");
    const sides = [row.sourceDiscipline, row.targetDiscipline];
    if (!sides.includes("structural") || !sides.includes("process")) fail("COUNTERPART_DISCIPLINE_PAIR_INVALID");
    if (row.sourceRevision !== sourceRevision) fail("COUNTERPART_REVISION_MISMATCH");
    if (asserted != null && row.fingerprint !== asserted) fail("FINGERPRINT_MISMATCH");
    if (cited === "CURRENT" && row.recordStatus !== "CURRENT") fail("COUNTERPART_NOT_CURRENT");
    return { counterpartId: row.interfaceId, sourceRevision: row.sourceRevision, fingerprint: row.fingerprint, discipline };
  }
  const rows = discipline === "civil" ? store.d2?.objects : store.d3?.objects;
  const row = rows?.find((item) => item.objectId === counterpartId);
  if (!row || !sameScope(row, actor)) fail("COUNTERPART_NOT_FOUND");
  if (row.provenanceRef !== sourceRevision) fail("COUNTERPART_REVISION_MISMATCH");
  if (asserted != null && row.fingerprint !== asserted) fail("FINGERPRINT_MISMATCH");
  if (cited === "CURRENT" && row.recordStatus !== "CURRENT") fail("COUNTERPART_NOT_CURRENT");
  return { counterpartId: row.objectId, sourceRevision: row.provenanceRef, fingerprint: row.fingerprint, discipline };
}

export function createD6R8Store(
  r7: D6R7Store,
  d4: D4R1Store | null = null,
  d5: D5R1Store | null = null,
  d2: D2R1Store | null = null,
  d3: D3R1Store | null = null,
  d1: D1kR1Store | null = null,
  now: () => string = () => r7.now(),
): D6R8Store {
  return { r7, d4, d5, d2, d3, d1, now, handoffs: [], history: [] };
}

export function currentProcessInterfaceHandoffs(store: D6R8Store, actor: D6R1Actor): D6R8HandoffRecord[] {
  return store.handoffs.filter((row) => sameScope(row, actor) && row.recordStatus === "CURRENT" && row.currentness === "CURRENT");
}

export function recordProcessInterfaceHandoff(store: D6R8Store, actor: D6R1Actor, input: Prohibited & {
  contextId: string;
  objectId: string;
  objectRevisionFingerprint: string;
  r2Kind: string;
  r2RecordId: string;
  r2Fingerprint: string;
  sourceKind: string;
  sourceId: string;
  sourceFingerprint: string;
  dependencies: { kind: string; targetKind: string; targetId: string; targetFingerprint: string; inferred?: boolean; inference?: string | null }[];
  counterpartDiscipline: string;
  direction: string;
  interfaceTopic: string;
  counterpartId?: string | null;
  counterpartRevision?: string | null;
  counterpartFingerprint?: string | null;
  handoffStatus: string;
  citedCurrentness: string;
  applicability: string;
  limitations: string;
  provenanceRef: string;
  sourceBasisRef: string;
  citedLifecycleStage: string;
  handoffId: string;
  predecessorHandoffId?: string | null;
  identityBasis: string;
  inference?: string | null;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  assertedFingerprint?: string | null;
}): D6R8HandoffRecord {
  assertActor(actor);
  assertProhibited(input);
  assertInterfaceType("PROCESS");
  assertInterfaceDirectionality("directed");
  if (input.identityBasis.trim() !== "EXPLICIT") fail("INFERRED_COUNTERPART_REJECTED");
  if (input.inference != null && input.inference.trim() !== "") fail("INFERRED_COUNTERPART_REJECTED");
  const tenantId = explicit(input.tenantId, "SCOPE_REQUIRED");
  const workspaceId = explicit(input.workspaceId, "SCOPE_REQUIRED");
  const projectId = explicit(input.projectId, "SCOPE_REQUIRED");
  if (tenantId !== actor.tenantId || workspaceId !== actor.workspaceId || projectId !== actor.projectId) fail("SCOPE_MISMATCH");
  const citedCurrentness = input.citedCurrentness.trim();
  if (!(D6_CURRENTNESS_STATES as readonly string[]).includes(citedCurrentness)) fail("CURRENTNESS_INVALID");
  const cited = citedCurrentness as Currentness;
  const before = seal(store);
  const contextId = explicit(input.contextId, "R1_CONTEXT_REQUIRED");
  const context = store.r7.r6.r5.r4.r3.r2.r1.contexts.find((row) => row.contextId === contextId);
  if (!context || !sameScope(context, actor)) fail("R1_CONTEXT_NOT_FOUND");
  const object = store.r7.r6.r5.r4.r3.r2.r1.objects.find((row) => row.objectId === explicit(input.objectId, "R1_OBJECT_REQUIRED"));
  const objectRevision = explicit(input.objectRevisionFingerprint, "R1_REVISION_REQUIRED");
  if (!object || object.fingerprint !== objectRevision || !sameScope(object, actor)) fail(object ? "R1_REVISION_MISMATCH" : "R1_OBJECT_NOT_FOUND");
  const r2Kind = explicit(input.r2Kind, "R2_KIND_REQUIRED");
  if (r2Kind !== "STREAM" && r2Kind !== "SYSTEM") fail("R2_KIND_INVALID");
  if ((r2Kind === "STREAM" && object.objectType !== "PROCESS_STREAM") || (r2Kind === "SYSTEM" && object.objectType !== "PROCESS_SYSTEM")) fail("R2_SUBJECT_MISMATCH");
  const r2 = findSource(store.r7, r2Kind === "STREAM" ? "R2_STREAM" : "R2_SYSTEM", explicit(input.r2RecordId, "R2_RECORD_REQUIRED"));
  if (!r2 || r2.fingerprint !== explicit(input.r2Fingerprint, "R2_REVISION_REQUIRED") || r2.tenantId !== actor.tenantId || r2.objectId !== object.objectId) {
    fail(r2 ? "R2_REVISION_MISMATCH" : "R2_RECORD_NOT_FOUND");
  }
  const sourceKind = explicit(input.sourceKind, "SOURCE_KIND_REQUIRED");
  if (!(D6_R7_DEPENDENCY_TARGETS as readonly string[]).includes(sourceKind)) fail("SOURCE_KIND_INVALID");
  const source = findSource(store.r7, sourceKind, explicit(input.sourceId, "SOURCE_REQUIRED"));
  const sourceFingerprint = explicit(input.sourceFingerprint, "SOURCE_REVISION_REQUIRED");
  if (!source || source.fingerprint !== sourceFingerprint || source.tenantId !== actor.tenantId || governedObject(source) !== object.objectId) {
    fail(source ? "SOURCE_REVISION_MISMATCH" : "SOURCE_NOT_FOUND");
  }
  if (cited === "CURRENT" && [context, object, r2, source].some((row) => row.recordStatus !== "CURRENT")) fail("SOURCE_NOT_CURRENT");
  if (!input.dependencies?.length) fail("EXPLICIT_DEPENDENCY_REQUIRED");
  const dependencies = input.dependencies.map((link) => {
    if (link.inferred === true || (link.inference != null && link.inference.trim() !== "")) fail("INFERRED_DEPENDENCY_REJECTED");
    const kind = explicit(link.kind, "RELATIONSHIP_NOT_EXPLICIT");
    if (!(D6_EXPLICIT_RELATIONSHIP_KINDS as readonly string[]).includes(kind)) fail("RELATIONSHIP_NOT_EXPLICIT");
    const targetKind = explicit(link.targetKind, "DEPENDENCY_TARGET_REQUIRED");
    if (!(D6_R7_DEPENDENCY_TARGETS as readonly string[]).includes(targetKind)) fail("DEPENDENCY_TARGET_INVALID");
    const targetId = explicit(link.targetId, "DEPENDENCY_TARGET_REQUIRED");
    const targetFingerprint = explicit(link.targetFingerprint, "DEPENDENCY_REVISION_REQUIRED");
    const target = findSource(store.r7, targetKind, targetId);
    if (!target || target.fingerprint !== targetFingerprint || target.tenantId !== actor.tenantId) fail("DEPENDENCY_REVISION_MISMATCH");
    return { kind: kind as D6R8Dependency["kind"], targetKind: targetKind as SourceKind, targetId, targetFingerprint };
  });
  const sourceId = explicit(input.sourceId, "SOURCE_REQUIRED");
  if (!dependencies.some((link) => link.targetKind === sourceKind && link.targetId === sourceId && link.targetFingerprint === source.fingerprint)) {
    fail("SOURCE_DEPENDENCY_REQUIRED");
  }
  const discipline = explicit(input.counterpartDiscipline, "COUNTERPART_DISCIPLINE_REQUIRED");
  if (!["mechanical", "piping", "electrical", "instrumentation_control", "structural", "civil", "geotechnical"].includes(discipline)) fail("COUNTERPART_DISCIPLINE_INVALID");
  const direction = explicit(input.direction, "DIRECTION_REQUIRED");
  if (!(D6_R8_DIRECTIONS as readonly string[]).includes(direction)) fail("DIRECTION_INVALID");
  const interfaceTopic = topicFor(discipline, input.interfaceTopic);
  const counterpart = pinCounterpart(store, actor, discipline, input.counterpartId, input.counterpartRevision, input.counterpartFingerprint, cited);
  const handoffStatus = explicit(input.handoffStatus, "HANDOFF_STATUS_REQUIRED");
  if (!(D6_R8_HANDOFF_STATUSES as readonly string[]).includes(handoffStatus)) fail("HANDOFF_STATUS_INVALID");
  if ((FUTURE.has(discipline) || !counterpart) && handoffStatus === "COMPLETE") fail("INCOMPLETE_COUNTERPART_NOT_COMPLETE");
  if (handoffStatus === "COMPLETE" && cited !== "CURRENT") fail("CURRENTNESS_STATUS_MISMATCH");
  if ((handoffStatus === "AWAITING_COUNTERPART" || handoffStatus === "NOT_YET_AVAILABLE") && counterpart) fail("COUNTERPART_NOT_AWAITING");
  if (handoffStatus === "STALE" && cited !== "STALE") fail("CURRENTNESS_STATUS_MISMATCH");
  if (handoffStatus === "REASSESSMENT_REQUIRED" && cited !== "REASSESSMENT_REQUIRED") fail("CURRENTNESS_STATUS_MISMATCH");
  const applicability = explicit(input.applicability, "APPLICABILITY_REQUIRED");
  if (!applicability.includes(object.objectId)) fail("APPLICABILITY_NOT_OBJECT_SCOPED");
  const limitations = explicit(input.limitations, "LIMITATIONS_REQUIRED");
  const provenanceRef = explicit(input.provenanceRef, "PROVENANCE_REQUIRED");
  const sourceBasisRef = explicit(input.sourceBasisRef, "SOURCE_BASIS_REQUIRED");
  const stage = input.citedLifecycleStage.trim();
  if (!(D6_MATURITY_STATES as readonly string[]).includes(stage)) fail("LIFECYCLE_INVALID");
  const handoffId = explicit(input.handoffId, "HANDOFF_ID_REQUIRED");
  const predecessorId = input.predecessorHandoffId ? explicit(input.predecessorHandoffId, "HANDOFF_ID_REQUIRED") : null;
  const predecessor = predecessorId ? store.handoffs.find((row) => row.handoffId === predecessorId) : null;
  if (predecessorId && (!predecessor || predecessor.tenantId !== actor.tenantId)) fail("HANDOFF_NOT_FOUND");
  if (predecessor && predecessor.recordStatus !== "CURRENT") fail("PREDECESSOR_NOT_CURRENT");
  const fingerprint = fingerprintCanonical({
    handoffId, contextId, objectId: object.objectId, objectRevisionFingerprint: object.fingerprint,
    r2Kind, r2RecordId: explicit(input.r2RecordId, "R2_RECORD_REQUIRED"), r2Fingerprint: r2.fingerprint,
    sourceKind, sourceId: explicit(input.sourceId, "SOURCE_REQUIRED"), sourceFingerprint: source.fingerprint,
    dependencies, counterpartDiscipline: discipline, direction, interfaceTopic, counterpart, applicability, limitations,
    provenanceRef, sourceBasisRef, handoffStatus, citedCurrentness: cited, authority: D6_CONTEXT_AUTHORITY, discipline: D6_DISCIPLINE,
    predecessorHandoffId: predecessor?.handoffId ?? null,
  });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.handoffs.find((row) => row.handoffId === handoffId);
  if (existing) return existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId ? existing : fail("HANDOFF_ALREADY_RECORDED");
  const signature = `${object.objectId}|${object.fingerprint}|${sourceKind}|${source.fingerprint}|${discipline}|${direction}|${interfaceTopic}|${counterpart?.counterpartId ?? ""}|${counterpart?.sourceRevision ?? ""}`;
  if (store.handoffs.some((row) => row.recordStatus === "CURRENT" && row.handoffId !== predecessor?.handoffId && `${row.objectId}|${row.objectRevisionFingerprint}|${row.sourceKind}|${row.sourceFingerprint}|${row.counterpartDiscipline}|${row.direction}|${row.interfaceTopic}|${row.counterpart?.counterpartId ?? ""}|${row.counterpart?.sourceRevision ?? ""}` === signature)) {
    fail("DUPLICATE_HANDOFF_REJECTED");
  }
  if (predecessor) {
    const index = store.handoffs.findIndex((row) => row.handoffId === predecessor.handoffId);
    const superseded = Object.freeze({ ...predecessor, recordStatus: "SUPERSEDED" as const, currentness: "SUPERSEDED" as const });
    store.handoffs[index] = superseded;
    store.history.push({ historyId: `d6r8-history-${store.history.length + 1}`, handoffId: superseded.handoffId, action: "SUPERSEDED", fingerprint: superseded.fingerprint, recordedAt: store.now() });
  }
  const record: D6R8HandoffRecord = {
    handoffId,
    contextId,
    objectId: object.objectId,
    objectRevisionFingerprint: object.fingerprint,
    r2Kind,
    r2RecordId: explicit(input.r2RecordId, "R2_RECORD_REQUIRED"),
    r2Fingerprint: r2.fingerprint,
    sourceKind: sourceKind as SourceKind,
    sourceId: explicit(input.sourceId, "SOURCE_REQUIRED"),
    sourceFingerprint: source.fingerprint,
    dependencies,
    counterpartDiscipline: discipline,
    direction: direction as D6R8HandoffRecord["direction"],
    interfaceTopic,
    counterpart,
    applicability,
    limitations,
    provenanceRef,
    sourceBasisRef,
    sourceAuthority: D6_CONTEXT_AUTHORITY,
    receivingAuthority: discipline,
    authorityTransferred: false,
    interfaceComplete: handoffStatus === "COMPLETE" && counterpart !== null,
    engineeringValidated: false,
    approved: false,
    conformant: false,
    counterpartTruth: false,
    mechanicalDesign: false,
    pipingConditionAdopted: false,
    electricalDesignCreated: false,
    iacDesignCreated: false,
    functionalSafetyValidated: false,
    handoffStatus: handoffStatus as D6R8HandoffRecord["handoffStatus"],
    citedCurrentness: cited,
    currentness: cited,
    citedLifecycleStage: stage as D6R8HandoffRecord["citedLifecycleStage"],
    fingerprint,
    predecessorHandoffId: predecessor?.handoffId ?? null,
    predecessorFingerprint: predecessor?.fingerprint ?? null,
    recordStatus: "CURRENT",
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
    deleted: false,
    invalidated: false,
    createdAt: store.now(),
    createdBy: actor.actorId,
  };
  store.handoffs.push(record);
  store.history.push({ historyId: `d6r8-history-${store.history.length + 1}`, handoffId: record.handoffId, action: "CREATED", fingerprint: record.fingerprint, recordedAt: store.now() });
  if (seal(store) !== before) fail("UPSTREAM_MUTATED");
  return record;
}

export function markProcessInterfaceFromChange(store: D6R8Store, actor: D6R1Actor, input: Prohibited & {
  handoffId: string;
  handoffFingerprint: string;
  changeId: string;
  changeFingerprint: string;
  mark: string;
}): D6R8HandoffRecord {
  assertActor(actor);
  assertProhibited(input);
  const before = seal(store);
  const handoffId = explicit(input.handoffId, "HANDOFF_ID_REQUIRED");
  const handoffFingerprint = explicit(input.handoffFingerprint, "HANDOFF_REVISION_REQUIRED");
  const index = store.handoffs.findIndex((row) => row.handoffId === handoffId && row.tenantId === actor.tenantId);
  const handoff = index >= 0 ? store.handoffs[index] : null;
  if (!handoff || handoff.fingerprint !== handoffFingerprint) fail(handoff ? "FINGERPRINT_MISMATCH" : "HANDOFF_NOT_FOUND");
  if (handoff.recordStatus !== "CURRENT") fail("PREDECESSOR_NOT_CURRENT");
  const change = store.r7.changes.find((row) => row.changeId === explicit(input.changeId, "CHANGE_REFERENCE_REQUIRED"));
  if (!change || change.fingerprint !== explicit(input.changeFingerprint, "CHANGE_REVISION_REQUIRED") || change.tenantId !== actor.tenantId || change.recordStatus !== "CURRENT") {
    fail("CHANGE_REVISION_MISMATCH");
  }
  if (!change.dependencies.some((link) => link.targetKind === handoff.sourceKind && link.targetId === handoff.sourceId && link.targetFingerprint === handoff.sourceFingerprint)) {
    fail("INFERRED_DEPENDENCY_REJECTED");
  }
  if (input.mark !== "STALE" && input.mark !== "REASSESSMENT_REQUIRED") fail("CURRENTNESS_MARK_INVALID");
  if (input.mark === "REASSESSMENT_REQUIRED" && !store.r7.reassessments.some((row) => row.changeId === change.changeId && row.targetId === handoff.sourceId && row.targetFingerprint === handoff.sourceFingerprint && row.tenantId === actor.tenantId && row.engineeringValidated === false)) {
    fail("REASSESSMENT_NOT_LINKED");
  }
  const marked: D6R8HandoffRecord = Object.freeze({
    ...handoff,
    currentness: input.mark,
    handoffStatus: input.mark,
    interfaceComplete: false,
    engineeringValidated: false,
    approved: false,
    invalidated: false,
    counterpart: handoff.counterpart,
  });
  store.handoffs[index] = marked;
  store.history.push({ historyId: `d6r8-history-${store.history.length + 1}`, handoffId: marked.handoffId, action: "CURRENTNESS_MARKED", fingerprint: marked.fingerprint, recordedAt: store.now() });
  if (marked.fingerprint !== handoffFingerprint || marked.counterpart?.fingerprint !== handoff.counterpart?.fingerprint) fail("AUTO_REPOINT_REJECTED");
  if (marked.currentness === "CURRENT" || currentProcessInterfaceHandoffs(store, actor).some((row) => row.handoffId === marked.handoffId)) fail("STALE_EXPOSED_AS_CURRENT");
  if (seal(store) !== before) fail("UPSTREAM_MUTATED");
  return marked;
}

export function repointProcessInterface(): never {
  return fail("AUTO_REPOINT_REJECTED");
}
export function mutateProcessInterfaceCounterpart(): never {
  return fail("COUNTERPART_MUTATION_REJECTED");
}
export function recalculateProcessInterfaceCounterpart(): never {
  return fail("COUNTERPART_RECALCULATION_REJECTED");
}
export function revalidateProcessInterfaceCounterpart(): never {
  return fail("COUNTERPART_REVALIDATION_REJECTED");
}
export function adoptPipingDesignConditionFromProcess(): never {
  return fail("PIPING_CONDITION_NOT_ADOPTED");
}
export function fabricateProcessInterfaceCounterpart(): never {
  return fail("COUNTERPART_FABRICATION_REJECTED");
}
export function reasonAcrossProcessDisciplines(): never {
  return fail("CROSS_DISCIPLINE_REASONING_NOT_IN_R8");
}
export function validateMechanicalFromProcessHandoff(): never {
  return fail("COUNTERPART_VALIDATION_NOT_IN_R8");
}
