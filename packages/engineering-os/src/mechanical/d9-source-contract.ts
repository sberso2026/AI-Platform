/**
 * EOS-D4-R11 D9 source contract.
 * Projects exact governed Mechanical revisions for future D9 consumption.
 * Does not create engineering facts, transfer authority, or start D9.
 */
import {
  ADMIN_EQUALS_D4_MECHANICAL_ENGINEERING_AUTHORITY,
  AI_EQUALS_D4_MECHANICAL_ENGINEERING_AUTHORITY,
  D4_CROSS_DISCIPLINE_CONFLICT_DETECTION_RUNTIME_COUNT,
  D4_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT,
  D4_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT,
  D4_CROSS_DISCIPLINE_RECOMMENDATION_RUNTIME_COUNT,
  D4_CURRENTNESS_STATES,
  D4_D9_RUNTIME_INTEGRATION_COUNT,
  D4_D9_SOURCE_CONTRACT_FIELDS,
  D4_EQUALS_D1_STRUCTURAL_AUTHORITY,
  D4_EQUALS_D2_CIVIL_AUTHORITY,
  D4_EQUALS_D3_GEOTECHNICAL_AUTHORITY,
  D4_EQUALS_D5_PIPING_AUTHORITY,
  D4_EQUALS_D6_PROCESS_AUTHORITY,
  D4_EQUALS_D7_ELECTRICAL_AUTHORITY,
  D4_EQUALS_D8_INSTRUMENTATION_CONTROL_AUTHORITY,
  D4_EQUIPMENT_SIZING_RUNTIME_COUNT,
  D4_FATIGUE_ANALYSIS_RUNTIME_COUNT,
  D4_IMPLEMENTATION_PHASES,
  D4_MECHANICAL_DESIGN_OPTIMIZATION_RUNTIME_COUNT,
  D4_MECHANICAL_LOAD_CALCULATION_RUNTIME_COUNT,
  D4_REUSES_CANONICAL_CURRENTNESS,
  D4_REUSES_CANONICAL_DIGITAL_THREAD,
  D4_REUSES_CANONICAL_FINGERPRINT,
  D4_ROTATING_EQUIPMENT_CALCULATION_RUNTIME_COUNT,
  D4_SILENT_REPOINTING_ALLOWED,
  D4_STATIC_EQUIPMENT_CALCULATION_RUNTIME_COUNT,
  D4_THERMAL_MECHANICAL_CALCULATION_RUNTIME_COUNT,
  D4_VALIDATED_EQUALS_APPROVED,
  D4_VALIDATED_EQUALS_CERTIFIED,
  D4_VALIDATED_EQUALS_CONFORMANT,
  D4_VIBRATION_ANALYSIS_RUNTIME_COUNT,
  PARALLEL_D4_CURRENTNESS_ENGINE_CREATED,
  PARALLEL_D4_DIGITAL_THREAD_CREATED,
  PROCESS_CONDITION_EQUALS_MECHANICAL_DESIGN_CONDITION,
  REVIEWED_EQUALS_VALIDATED,
  SECOND_D4_FINGERPRINT_ALGORITHM_CREATED,
  SOURCE_REQUIREMENT_EQUALS_MECHANICAL_INTERPRETATION,
  VENDOR_DATA_EQUALS_ENGINEERING_VALIDATED,
} from "@rtb/types";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import { D4_CONTEXT_AUTHORITY, D4_DISCIPLINE, type D4R1Actor } from "./identity-foundation";
import { D4_EQUIPMENT_SYSTEM_CONTEXT_RUNTIME_READY } from "./equipment-system-context";
import { D4_DESIGN_CONDITION_PERFORMANCE_RUNTIME_READY } from "./design-condition-performance-context";
import { D4_VENDOR_DATA_EVIDENCE_RUNTIME_READY } from "./vendor-data-evidence-context";
import { D4_MECHANICAL_TECHNICAL_CONTEXT_RUNTIME_READY } from "./mechanical-technical-context";
import { D4_MAINTAINABILITY_ACCESS_PACKAGE_RUNTIME_READY } from "./maintainability-access-package-context";
import { D4_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY as R7_CHANGE_READY } from "./requirements-assumptions-change";
import { D4_DISCIPLINE_INTERFACE_RUNTIME_READY as R8_INTERFACE_READY, D4_R8_FUTURE_DISCIPLINES } from "./discipline-interfaces-handoffs";
import { D4_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_READY as R9_REVIEW_READY } from "./review-validation-governance";
import {
  D4_CURRENTNESS_DIGITAL_THREAD_RUNTIME_READY as R10_THREAD_READY,
  type D4R10Store,
} from "./currentness-digital-thread";

export const D4_R11_STATUS = "D9_SOURCE_CONTRACT_IMPLEMENTED" as const;
export const D4_R11_MATURITY = D4_R11_STATUS;
export const D4_R11_MATURITY_STATE = D4_R11_STATUS;
export const D4_R11_CLOSEOUT_PATH = "docs/architecture/engineering-os/EOS_D4_R11_D9_SOURCE_CONTRACT_CLOSEOUT.md" as const;
export const D4_RUNTIME_STARTED = true as const;
export const D4_RUNTIME_COUNT = 11 as const;
export const D4_MECHANICAL_IDENTITY_OBJECT_FOUNDATION_RUNTIME_READY = true as const;
export const D4_EQUIPMENT_SYSTEM_CONTEXT_RUNTIME_READY_REUSED = D4_EQUIPMENT_SYSTEM_CONTEXT_RUNTIME_READY;
export const D4_DESIGN_CONDITION_PERFORMANCE_RUNTIME_READY_REUSED = D4_DESIGN_CONDITION_PERFORMANCE_RUNTIME_READY;
export const D4_VENDOR_DATA_EVIDENCE_RUNTIME_READY_REUSED = D4_VENDOR_DATA_EVIDENCE_RUNTIME_READY;
export const D4_MECHANICAL_TECHNICAL_CONTEXT_RUNTIME_READY_REUSED = D4_MECHANICAL_TECHNICAL_CONTEXT_RUNTIME_READY;
export const D4_MAINTAINABILITY_ACCESS_PACKAGE_RUNTIME_READY_REUSED = D4_MAINTAINABILITY_ACCESS_PACKAGE_RUNTIME_READY;
export const D4_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY = R7_CHANGE_READY;
export const D4_DISCIPLINE_INTERFACE_RUNTIME_READY = R8_INTERFACE_READY;
export const D4_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_READY = R9_REVIEW_READY;
export const D4_CURRENTNESS_DIGITAL_THREAD_RUNTIME_READY = R10_THREAD_READY;
export const D4_D9_SOURCE_CONTRACT_RUNTIME_IMPLEMENTED = true as const;
export const D4_D9_SOURCE_CONTRACT_RUNTIME_COUNT = 1 as const;
export const D4_D9_SOURCE_CONTRACT_RUNTIME_READY = true as const;
export const D4_R11_SOURCE_CONTRACT_FIELDS = D4_D9_SOURCE_CONTRACT_FIELDS;
export const D4_R1_R10_EXACT_SOURCE_REVISIONS_REUSED = true as const;
export const EXACT_D4_D9_SOURCE_REVISION_REQUIRED = true as const;
export const FLOATING_D4_D9_SOURCE_REFERENCE_ALLOWED = false as const;
export const D4_D9_SOURCE_REFERENCE_AUTO_REPOINTED = D4_SILENT_REPOINTING_ALLOWED;
export const D4_D9_SOURCE_CONTRACT_EXPOSES_GOVERNED_D4_FACTS = true as const;
export const D4_D9_SOURCE_CONTRACT_EXPOSES_CURRENTNESS = true as const;
export const D4_D9_SOURCE_CONTRACT_EXPOSES_AUTHORITY = true as const;
export const D4_D9_SOURCE_CONTRACT_EXPOSES_LIMITATIONS = true as const;
export const D4_D9_SOURCE_CONTRACT_EXPOSES_PROVENANCE = true as const;
export const D4_D9_SOURCE_CONTRACT_EXPOSES_LINEAGE = true as const;
export const D4_D9_SOURCE_CONTRACT_EXPOSES_FINGERPRINT = true as const;
export const D4_D9_SOURCE_CONTRACT_EXPOSES_REVIEW_VALIDATION_STATE = true as const;
export const D4_D9_SOURCE_CONTRACT_CREATES_NEW_ENGINEERING_FACT = false as const;
export const D4_D9_SOURCE_CONTRACT_DERIVES_NEW_ENGINEERING_VALUE = false as const;
export const D4_D9_SOURCE_CONTRACT_GENERATES_NEW_REQUIREMENT = false as const;
export const D4_D9_SOURCE_CONTRACT_GENERATES_NEW_RECOMMENDATION = false as const;
export const D4_D9_SOURCE_CONTRACT_GENERATES_NEW_DECISION = false as const;
export const D4_D9_SOURCE_CONTRACT_CALCULATION_RUNTIME_COUNT = 0 as const;
export const D4_D9_SOURCE_CONTRACT_HIDDEN_CALCULATION_ALLOWED = false as const;
export { SOURCE_REQUIREMENT_EQUALS_MECHANICAL_INTERPRETATION, PROCESS_CONDITION_EQUALS_MECHANICAL_DESIGN_CONDITION, VENDOR_DATA_EQUALS_ENGINEERING_VALIDATED, REVIEWED_EQUALS_VALIDATED };
export const VALIDATED_EQUALS_CONFORMANT = D4_VALIDATED_EQUALS_CONFORMANT;
export const VALIDATED_EQUALS_APPROVED = D4_VALIDATED_EQUALS_APPROVED;
export const VALIDATED_EQUALS_CERTIFIED = D4_VALIDATED_EQUALS_CERTIFIED;
export { AI_EQUALS_D4_MECHANICAL_ENGINEERING_AUTHORITY, ADMIN_EQUALS_D4_MECHANICAL_ENGINEERING_AUTHORITY };
export const D4_D9_SOURCE_CONTRACT_TRANSFERS_ENGINEERING_AUTHORITY = false as const;
export const D4_D9_SOURCE_CONTRACT_CREATES_D9_ENGINEERING_AUTHORITY = false as const;
export {
  D4_EQUALS_D1_STRUCTURAL_AUTHORITY,
  D4_EQUALS_D2_CIVIL_AUTHORITY,
  D4_EQUALS_D3_GEOTECHNICAL_AUTHORITY,
  D4_EQUALS_D5_PIPING_AUTHORITY,
  D4_EQUALS_D6_PROCESS_AUTHORITY,
  D4_EQUALS_D7_ELECTRICAL_AUTHORITY,
  D4_EQUALS_D8_INSTRUMENTATION_CONTROL_AUTHORITY,
};
export const D4_R8_INTERFACE_RECORDS_REUSED = true as const;
export const EXACT_D4_D9_INTERFACE_REVISION_REQUIRED = true as const;
export const D4_D9_SOURCE_CONTRACT_FABRICATES_COUNTERPART = false as const;
export const D4_D9_SOURCE_CONTRACT_INFERS_MISSING_COUNTERPART = false as const;
export const MISSING_COUNTERPART_EQUALS_INTERFACE_COMPLETE = false as const;
export { D4_REUSES_CANONICAL_CURRENTNESS, D4_REUSES_CANONICAL_DIGITAL_THREAD, D4_REUSES_CANONICAL_FINGERPRINT, PARALLEL_D4_CURRENTNESS_ENGINE_CREATED, PARALLEL_D4_DIGITAL_THREAD_CREATED, SECOND_D4_FINGERPRINT_ALGORITHM_CREATED };
export const D4_R10_CURRENTNESS_REUSED_BY_SOURCE_CONTRACT = true as const;
export const D4_R10_LINEAGE_REUSED_BY_SOURCE_CONTRACT = true as const;
export const D4_D9_SOURCE_CONTRACT_INFERS_LINEAGE = false as const;
export const D4_D9_SOURCE_CONTRACT_AUTO_REPOINTS_HISTORY = D4_SILENT_REPOINTING_ALLOWED;
export const STALE_D4_SOURCE_EXPOSED_AS_CURRENT_TO_D9 = false as const;
export const SUPERSEDED_D4_SOURCE_EXPOSED_AS_CURRENT_TO_D9 = false as const;
export const REASSESSMENT_REQUIRED_D4_SOURCE_EXPOSED_AS_VALIDATED_TO_D9 = false as const;
export const D4_R9_REVIEW_VALIDATION_STATE_REUSED = true as const;
export const D4_D9_SOURCE_CONTRACT_AUTO_VALIDATES_ENGINEERING = false as const;
export const D4_D9_SOURCE_CONTRACT_AUTO_APPROVES_ENGINEERING = false as const;
export const D4_D9_SOURCE_CONTRACT_AUTO_CERTIFIES_ENGINEERING = false as const;
export const D4_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT = 0 as const;
export const D4_CONFORMANCE_DETERMINATION_RUNTIME_COUNT = 0 as const;
export const D4_APPROVAL_RUNTIME_COUNT = 0 as const;
export const D4_CERTIFICATION_RUNTIME_COUNT = 0 as const;
export const D4_D9_SOURCE_PROVENANCE_REQUIRED = true as const;
export const D4_D9_SOURCE_PROVENANCE_PRESERVED = true as const;
export const D4_D9_SOURCE_LIMITATIONS_PRESERVED = true as const;
export const SILENT_D4_R11_MUTATION_ALLOWED = false as const;
export const D4_R11_HISTORY_PRESERVED = true as const;
export const TENANT_WORKSPACE_PROJECT_D4_R11_SCOPE_ENFORCED = true as const;
export const CROSS_TENANT_D4_D9_SOURCE_ACCESS_ALLOWED = false as const;
export const D4_R11_AUTO_MUTATES_R3_DESIGN_CONDITION = false as const;
export const D4_R11_AUTO_MUTATES_R3_PERFORMANCE_CONTEXT = false as const;
export const D4_R11_AUTO_MUTATES_R4_VENDOR_EVIDENCE = false as const;
export const D4_R11_AUTO_MUTATES_R5_TECHNICAL_REQUIREMENT = false as const;
export const D4_R11_AUTO_MUTATES_R6_MAINTAINABILITY_CONTEXT = false as const;
export const D4_R11_AUTO_MUTATES_R7_CHANGE_GOVERNANCE = false as const;
export const D4_R11_AUTO_MUTATES_R8_INTERFACE_HANDOFF = false as const;
export const D4_R11_AUTO_MUTATES_R9_VALIDATION_STATE = false as const;
export const D4_R11_AUTO_MUTATES_R10_CURRENTNESS = false as const;
export const D4_R11_DUPLICATE_GOVERNANCE_IMPLEMENTED = true as const;
export const D4_R11_REPLAY_PROTECTION_IMPLEMENTED = true as const;
export const D4_R11_SPOOFING_PROTECTION_IMPLEMENTED = true as const;
export const D4_AUTOMATIC_REDESIGN_RUNTIME_COUNT = 0 as const;
export { D4_EQUIPMENT_SIZING_RUNTIME_COUNT, D4_ROTATING_EQUIPMENT_CALCULATION_RUNTIME_COUNT, D4_STATIC_EQUIPMENT_CALCULATION_RUNTIME_COUNT, D4_THERMAL_MECHANICAL_CALCULATION_RUNTIME_COUNT, D4_MECHANICAL_LOAD_CALCULATION_RUNTIME_COUNT, D4_VIBRATION_ANALYSIS_RUNTIME_COUNT, D4_FATIGUE_ANALYSIS_RUNTIME_COUNT, D4_MECHANICAL_DESIGN_OPTIMIZATION_RUNTIME_COUNT, D4_D9_RUNTIME_INTEGRATION_COUNT, D4_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT, D4_CROSS_DISCIPLINE_CONFLICT_DETECTION_RUNTIME_COUNT, D4_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT, D4_CROSS_DISCIPLINE_RECOMMENDATION_RUNTIME_COUNT };
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
export const UNAUTHORIZED_D4_R12_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_D5_D8_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_D9_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_D4_SOURCE_FACT_GENERATION = false as const;
export const UNAUTHORIZED_D4_SOURCE_DERIVATION = false as const;
export const UNAUTHORIZED_D4_SOURCE_CALCULATION = false as const;
export const UNAUTHORIZED_D4_SOURCE_AUTHORITY_TRANSFER = false as const;
export const UNAUTHORIZED_COUNTERPART_FABRICATION = false as const;
export const UNAUTHORIZED_CROSS_DISCIPLINE_REASONING_PROMOTION = false as const;
export const UNAUTHORIZED_VALIDATION_PROMOTION = false as const;
export const UNAUTHORIZED_GA_PROMOTION = false as const;
export const UNAUTHORIZED_PRODUCT_CLAIM = false as const;

export const D4_R12_CANONICAL_PHASE = D4_IMPLEMENTATION_PHASES[11];
export const D4_R12_PHASE_TYPE = "MECHANICAL_BOUNDED_CLOSEOUT" as const;
export const D4_R12_CANONICAL_SCOPE = "Perform D4 Mechanical bounded closeout. Verify R1-R11 capability readiness, architecture/runtime/governance coherence, truth and authority boundaries, exact currentness/digital-thread lineage, source-contract integrity, security/dependency/release state and remaining limitations. Add no new substantive Mechanical runtime. Do not claim engineering validation, conformance, approval, certification, project validation or GA readiness. Preserve D1 incomplete, D2/D3 complete bounded, D5-D9 unstarted." as const;
export const D4_R12_STARTED = false as const;
export const D4_R11_READY_FOR_NEXT_PHASE = true as const;
export const D4_R11_NEXT_PHASE = D4_R12_CANONICAL_PHASE;
export const D4_R11_NEXT_PHASE_TYPE = D4_R12_PHASE_TYPE;
export const D4_R11_CANONICAL_NEXT_PHASE = D4_R12_CANONICAL_PHASE;
export const D4_R11_CANONICAL_NEXT_PHASE_SCOPE = D4_R12_CANONICAL_SCOPE;
export const D4_R11_BLOCKER = "NONE" as const;
export const D4_R11_MACHINE_READABLE_ROADMAP_UPDATED = true as const;
export const D4_R11_STANDING_LIMITATION = "This source contract projects governed Mechanical facts for future D9 consumption. It does not create engineering facts, transfer Mechanical authority, fabricate counterparts, start D9, or treat review or validation as conformance, approval, or certification." as const;

const FLOATING = new Set(["latest", "current", "newest", "head", "active", "active model"]);
const INFERRED = new Set(["matching_tag", "shared_vendor", "shared_package", "system_membership", "proximity", "document_cooccurrence", "similar_value", "ai_similarity", "inferred", "filename", "temporal_proximity", "semantic_similarity"]);
const FUTURE = new Set<string>(D4_R8_FUTURE_DISCIPLINES);
const HIDDEN = /[=*]|calc\(|sqrt\(/;

type Currentness = (typeof D4_CURRENTNESS_STATES)[number];
type Prohibited = {
  infer?: boolean;
  identicalTags?: boolean;
  membership?: boolean;
  similarValues?: boolean;
  vendorRelationship?: boolean;
  filename?: boolean;
  semantic?: boolean;
  temporalProximity?: boolean;
  documentCooccurrence?: boolean;
  repoint?: boolean;
  derive?: boolean;
  generateRequirement?: boolean;
  generateRecommendation?: boolean;
  generateDecision?: boolean;
  calculate?: boolean;
  fabricateCounterpart?: boolean;
  transferAuthority?: boolean;
  validate?: boolean;
  approve?: boolean;
  certify?: boolean;
  stripLimitations?: boolean;
  d9Reasoning?: boolean;
  mutateR3?: boolean;
  mutateR4?: boolean;
  mutateR5?: boolean;
  mutateR6?: boolean;
  mutateR7?: boolean;
  mutateR8?: boolean;
  mutateR9?: boolean;
  mutateR10?: boolean;
};

export type D4R11Actor = D4R1Actor & { actorKind?: string };
export type D4R11SourceContractInput = Prohibited & {
  contractId: string;
  contextId: string;
  objectId: string;
  sourceRevision: string;
  citedCurrentness: string;
  provenanceRef: string;
  assertedFingerprint?: string;
  tenantId?: string;
  workspaceId?: string;
  projectId?: string;
};

type Item = {
  subjectId: string;
  exactRevision: string;
  fingerprint: string;
  currentness: Currentness;
  limitations: string;
  applicability: string;
  authority: typeof D4_CONTEXT_AUTHORITY;
  engineeringValidated: boolean;
  conformant: false;
  approved: false;
  certified: false;
};

export type D4R11SourceContract = {
  contractId: string;
  contextId: string;
  objectId: string;
  exactRevision: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  currentness: Currentness;
  authority: typeof D4_CONTEXT_AUTHORITY;
  authorityTransferred: false;
  d9OwnsMechanicalAuthority: false;
  engineeringDerived: false;
  requirementGenerated: false;
  recommendationGenerated: false;
  decisionGenerated: false;
  calculationPerformed: false;
  inferredLineage: false;
  counterpartFabricated: false;
  representedAsValidated: boolean;
  conformant: false;
  engineeringApproved: false;
  certified: false;
  d9Started: false;
  fields: Record<string, unknown>;
  provenanceRef: string;
  fingerprint: string;
  recordedBy: string;
  recordedAt: string;
  recordStatus: "CURRENT";
};

export type D4R11History = { historyId: string; contractId: string; action: "CREATED"; fingerprint: string; recordedAt: string };
export type D4R11Store = { r10: D4R10Store; now: () => string; contracts: D4R11SourceContract[]; history: D4R11History[] };

function fail(code: string): never {
  throw new Error(`D4_R11_${code}`);
}

function blockedParty(value: string): boolean {
  return /^AI(?:\b|_)/i.test(value) || /LLM/i.test(value) || /OPTIMIZER/i.test(value);
}

function explicit(value: string, code: string): string {
  const token = value.trim();
  if (!token || FLOATING.has(token.toLowerCase()) || INFERRED.has(token.toLowerCase()) || blockedParty(token)) fail(code);
  return token;
}

function isCurrentness(value: string): value is Currentness {
  return (D4_CURRENTNESS_STATES as readonly string[]).includes(value);
}

function assertProhibited(input: Prohibited): void {
  if (input.infer === true || input.identicalTags === true || input.membership === true || input.similarValues === true || input.vendorRelationship === true || input.filename === true || input.semantic === true || input.temporalProximity === true || input.documentCooccurrence === true) fail("INFERRED_LINEAGE_REJECTED");
  if (input.repoint === true) fail("AUTO_REPOINT_REJECTED");
  if (input.derive === true) fail("DERIVATION_NOT_IN_R11");
  if (input.generateRequirement === true) fail("REQUIREMENT_GENERATION_NOT_IN_R11");
  if (input.generateRecommendation === true) fail("RECOMMENDATION_GENERATION_NOT_IN_R11");
  if (input.generateDecision === true) fail("DECISION_GENERATION_NOT_IN_R11");
  if (input.calculate === true) fail("CALCULATION_NOT_IN_R11");
  if (input.fabricateCounterpart === true) fail("COUNTERPART_FABRICATION_REJECTED");
  if (input.transferAuthority === true) fail("AUTHORITY_TRANSFER_REJECTED");
  if (input.validate === true) fail("VALIDATION_NOT_IN_R11");
  if (input.approve === true) fail("APPROVAL_NOT_IN_R11");
  if (input.certify === true) fail("CERTIFICATION_NOT_IN_R11");
  if (input.stripLimitations === true) fail("LIMITATION_STRIPPING_REJECTED");
  if (input.d9Reasoning === true) fail("D9_NOT_STARTED");
  if (input.mutateR3 === true) fail("R3_MUTATION_REJECTED");
  if (input.mutateR4 === true) fail("R4_MUTATION_REJECTED");
  if (input.mutateR5 === true) fail("R5_MUTATION_REJECTED");
  if (input.mutateR6 === true) fail("R6_MUTATION_REJECTED");
  if (input.mutateR7 === true) fail("R7_MUTATION_REJECTED");
  if (input.mutateR8 === true) fail("R8_MUTATION_REJECTED");
  if (input.mutateR9 === true) fail("R9_MUTATION_REJECTED");
  if (input.mutateR10 === true) fail("R10_MUTATION_REJECTED");
}

function assertScope(actor: D4R11Actor, input: { tenantId?: string; workspaceId?: string; projectId?: string }): void {
  if (!actor.actorId.trim() || !actor.tenantId.trim() || !actor.workspaceId.trim() || !actor.projectId.trim()) fail("SCOPE_REQUIRED");
  if (input.tenantId != null && input.tenantId !== actor.tenantId) fail("CROSS_TENANT_OPERATION");
  if (input.workspaceId != null && input.workspaceId !== actor.workspaceId) fail("CROSS_WORKSPACE_OPERATION");
  if (input.projectId != null && input.projectId !== actor.projectId) fail("CROSS_PROJECT_OPERATION");
}

function assertRecorder(actor: D4R11Actor): void {
  if (blockedParty(actor.actorId) || blockedParty(actor.authority) || actor.authority === "AI_ASSISTANT" || actor.actorKind === "ai") fail("AI_NOT_MECHANICAL_AUTHORITY");
  if (actor.authority === "ADMINISTRATOR" || actor.authority === "ADMIN") fail("ADMIN_NOT_MECHANICAL_AUTHORITY");
  if (actor.authority !== D4_CONTEXT_AUTHORITY) fail("UNAUTHORIZED");
}

function root(store: D4R11Store) {
  return store.r10.r9.r8.r7.r6.r5.r4.r3.r2.r1;
}

function latestMark(store: D4R11Store, kind: string, subjectId: string, subjectRevision: string, subjectFingerprint: string): Currentness | null {
  const marks = store.r10.marks.filter((row) => row.subject.subjectKind === kind && row.subject.subjectId === subjectId && row.subject.subjectRevision === subjectRevision && row.subject.subjectFingerprint === subjectFingerprint);
  return marks.length === 0 ? null : marks[marks.length - 1].currentness;
}

function shown(store: D4R11Store, kind: string, subjectId: string, revision: string, fingerprint: string, recordStatus: string, fallback: Currentness): Currentness {
  const mark = latestMark(store, kind, subjectId, revision, fingerprint);
  if (mark) return mark;
  if (recordStatus === "SUPERSEDED") return "SUPERSEDED";
  return fallback;
}

function item(subjectId: string, exactRevision: string, fingerprint: string, currentness: Currentness, limitations: string, applicability: string, engineeringValidated = false): Item {
  if (HIDDEN.test(limitations) || HIDDEN.test(applicability)) fail("HIDDEN_CALCULATION_REJECTED");
  return {
    subjectId,
    exactRevision,
    fingerprint,
    currentness,
    limitations,
    applicability,
    authority: D4_CONTEXT_AUTHORITY,
    engineeringValidated: currentness === "CURRENT" && engineeringValidated,
    conformant: false,
    approved: false,
    certified: false,
  };
}

function byId<T extends { subjectId: string }>(rows: T[]): T[] {
  return [...rows].sort((left, right) => left.subjectId.localeCompare(right.subjectId));
}

function snapshot(store: D4R11Store): string {
  const r3 = store.r10.r9.r8.r7.r6.r5.r4.r3.records.map((row) => `${row.recordId}:${row.fingerprint}:${row.suppliedValue}:${row.recordStatus}`).join("|");
  const r4 = store.r10.r9.r8.r7.r6.r5.r4.records.map((row) => `${row.recordId}:${row.fingerprint}:${row.suppliedValue}:${row.documentRevision}`).join("|");
  const r5 = store.r10.r9.r8.r7.r6.r5.records.map((row) => `${row.recordId}:${row.fingerprint}:${row.requirementStatement}`).join("|");
  const r6 = store.r10.r9.r8.r7.r6.records.map((row) => `${row.recordId}:${row.fingerprint}:${row.statement}`).join("|");
  const changes = store.r10.r9.r8.r7.changes.map((row) => `${row.changeContextId}:${row.fingerprint}:${row.recalculated}:${row.changeCategory}`).join("|");
  const handoffs = store.r10.r9.r8.handoffs.map((row) => `${row.handoffId}:${row.fingerprint}:${row.counterpart?.interfaceId ?? ""}`).join("|");
  const validations = store.r10.r9.validations.map((row) => `${row.validationId}:${row.subjectRevision}:${row.engineeringValidated}:${row.fingerprint}`).join("|");
  const thread = `${store.r10.lineage.length}:${store.r10.marks.length}:${store.r10.supersessions.length}`;
  return `${r3}#${r4}#${r5}#${r6}#${changes}#${handoffs}#${validations}#${thread}`;
}

export function createD4R11Store(r10: D4R10Store, now: () => string = () => r10.now()): D4R11Store {
  return { r10, now, contracts: [], history: [] };
}

export function recordMechanicalSourceContract(store: D4R11Store, actor: D4R11Actor, input: D4R11SourceContractInput): D4R11SourceContract {
  assertRecorder(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const cited = input.citedCurrentness.trim();
  if (!isCurrentness(cited)) fail("CURRENTNESS_INVALID");
  const contextId = explicit(input.contextId, "R1_CONTEXT_REQUIRED");
  const context = root(store).contexts.find((row) => row.contextId === contextId);
  if (!context || context.tenantId !== actor.tenantId || context.workspaceId !== actor.workspaceId || context.projectId !== actor.projectId) fail("R1_CONTEXT_NOT_FOUND");
  if (context.discipline !== D4_DISCIPLINE) fail("DISCIPLINE_NOT_MECHANICAL");
  const objectId = explicit(input.objectId, "OBJECT_REFERENCE_REQUIRED");
  const sourceRevision = explicit(input.sourceRevision, "SUBJECT_REVISION_REQUIRED");
  const object = root(store).objects.find((row) => row.objectId === objectId && row.contextId === context.contextId && row.tenantId === actor.tenantId);
  if (!object || object.provenanceRef !== sourceRevision) fail("SUBJECT_REVISION_MISMATCH");
  const currentness = shown(store, "OBJECT", object.objectId, object.provenanceRef, object.fingerprint, object.recordStatus, object.currentness);
  if (cited === "CURRENT" && currentness === "STALE") fail("STALE_EXPOSED_AS_CURRENT");
  if (cited === "CURRENT" && currentness === "SUPERSEDED") fail("SUPERSEDED_EXPOSED_AS_CURRENT");
  if (cited !== currentness) fail("CURRENTNESS_MISMATCH");
  const provenanceRef = explicit(input.provenanceRef, "MISSING_PROVENANCE");
  const contractId = explicit(input.contractId, "CONTRACT_ID_REQUIRED");
  const sameObject = (row: { contextId: string; objectId: string; objectRevisionFingerprint: string }) => row.contextId === context.contextId && row.objectId === object.objectId && row.objectRevisionFingerprint === object.fingerprint;
  const r2 = store.r10.r9.r8.r7.r6.r5.r4.r3.r2;
  const r3 = store.r10.r9.r8.r7.r6.r5.r4.r3;
  const r4 = store.r10.r9.r8.r7.r6.r5.r4;
  const r5 = store.r10.r9.r8.r7.r6.r5;
  const r6 = store.r10.r9.r8.r7.r6;
  const r7 = store.r10.r9.r8.r7;
  const classifications = byId(r2.classifications.filter(sameObject).map((row) => ({ ...item(row.classificationId, row.provenanceRef, row.fingerprint, shown(store, "CLASSIFICATION", row.classificationId, row.provenanceRef, row.fingerprint, row.recordStatus, row.citedCurrentness), "", ""), classification: row.classification })));
  const services = byId(r2.services.filter(sameObject).map((row) => ({ ...item(row.serviceContextId, row.provenanceRef, row.fingerprint, shown(store, "SERVICE", row.serviceContextId, row.provenanceRef, row.fingerprint, row.recordStatus, row.citedCurrentness), "", ""), serviceFunction: row.serviceFunction })));
  const memberships = byId(r2.memberships.filter(sameObject).map((row) => ({ ...item(row.membershipId, row.provenanceRef, row.fingerprint, shown(store, "MEMBERSHIP", row.membershipId, row.provenanceRef, row.fingerprint, row.recordStatus, row.citedCurrentness), "", ""), membershipKind: row.membershipKind })));
  const guardValue = (value: string | null) => {
    if (value != null && HIDDEN.test(value)) fail("HIDDEN_CALCULATION_REJECTED");
    return value;
  };
  const design = byId(r3.records.filter((row) => sameObject(row) && row.recordClass === "MECHANICAL_DESIGN_CONDITION").map((row) => ({ ...item(row.recordId, row.provenanceRef, row.fingerprint, shown(store, "DESIGN", row.recordId, row.provenanceRef, row.fingerprint, row.recordStatus, row.currentness), row.limitations, row.applicabilityCase), subjectKind: row.subjectKind, suppliedValue: guardValue(row.suppliedValue), unit: row.unit, sourceClass: row.sourceClass, processAuthority: false as const })));
  const performance = byId(r3.records.filter((row) => sameObject(row) && row.recordClass === "MECHANICAL_PERFORMANCE_CONTEXT").map((row) => ({ ...item(row.recordId, row.provenanceRef, row.fingerprint, shown(store, "PERFORMANCE", row.recordId, row.provenanceRef, row.fingerprint, row.recordStatus, row.currentness), row.limitations, row.applicabilityCase), subjectKind: row.subjectKind, suppliedValue: guardValue(row.suppliedValue), unit: row.unit, sourceClass: row.sourceClass, processAuthority: false as const })));
  const vendorDocuments = byId(r4.records.filter((row) => sameObject(row) && row.recordClass === "VENDOR_DOCUMENT").map((row) => ({ ...item(row.recordId, row.provenanceRef, row.fingerprint, shown(store, "VENDOR_DOCUMENT", row.recordId, row.provenanceRef, row.fingerprint, row.recordStatus, row.currentness), row.limitations, ""), documentRef: row.documentRef, documentRevision: row.documentRevision, evidenceClass: row.evidenceClass, sourceStatus: row.sourceStatus, mechanicalEngineeringAdoption: false as const })));
  const vendorData = byId(r4.records.filter((row) => sameObject(row) && row.recordClass === "VENDOR_DATA").map((row) => ({ ...item(row.recordId, row.provenanceRef, row.fingerprint, shown(store, "VENDOR_DATA", row.recordId, row.provenanceRef, row.fingerprint, row.recordStatus, row.currentness), row.limitations, ""), dataKind: row.dataKind, suppliedValue: guardValue(row.suppliedValue), unit: row.unit, engineeringValidated: false as const })));
  const technical = byId(r5.records.filter(sameObject).map((row) => ({ ...item(row.recordId, row.provenanceRef, row.fingerprint, shown(store, "TECHNICAL", row.recordId, row.provenanceRef, row.fingerprint, row.recordStatus, row.currentness), row.limitations, row.applicabilityCase), recordClass: row.recordClass, requirementStatement: row.requirementStatement, sourceRevision: row.sourceRevision })));
  const maintainability = byId(r6.records.filter(sameObject).map((row) => ({ ...item(row.recordId, row.provenanceRef, row.fingerprint, shown(store, "MAINTAINABILITY", row.recordId, row.provenanceRef, row.fingerprint, row.recordStatus, row.currentness), row.limitations, row.applicabilityCase), recordClass: row.recordClass, statement: row.statement })));
  const requirements = byId(r7.requirements.filter(sameObject).map((row) => ({ ...item(row.requirementContextId, row.provenanceRef, row.fingerprint, shown(store, "REQUIREMENT", row.requirementContextId, row.provenanceRef, row.fingerprint, row.recordStatus, row.currentness), row.limitations, row.applicability), statement: row.statement })));
  const assumptions = byId(r7.assumptions.filter(sameObject).map((row) => ({ ...item(row.assumptionContextId, row.provenanceRef, row.fingerprint, shown(store, "ASSUMPTION", row.assumptionContextId, row.provenanceRef, row.fingerprint, row.recordStatus, row.currentness), row.limitations, row.applicability), statement: row.statement, validatedFact: false as const })));
  const decisions = byId(r7.decisions.filter(sameObject).map((row) => ({ ...item(row.decisionContextId, row.provenanceRef, row.fingerprint, shown(store, "DECISION", row.decisionContextId, row.provenanceRef, row.fingerprint, row.recordStatus, row.currentness), row.limitations, row.applicability), statement: row.statement, aiRecommendation: false as const })));
  const changes = byId(r7.changes.filter(sameObject).map((row) => ({ ...item(row.changeContextId, row.provenanceRef, row.fingerprint, shown(store, "CHANGE", row.changeContextId, row.provenanceRef, row.fingerprint, row.recordStatus, row.currentness), row.limitations, row.applicability), changeCategory: row.changeCategory, recalculated: false as const, redesigned: false as const })));
  const handoffs = byId(store.r10.r9.r8.handoffs.filter(sameObject).map((row) => {
    const handoffCurrentness = shown(store, "HANDOFF", row.handoffId, row.provenanceRef, row.fingerprint, row.recordStatus, row.currentness);
    const futureContract = FUTURE.has(row.counterpartDiscipline);
    const complete = row.handoffStatus === "COMPLETE" && row.counterpart != null && !futureContract;
    return { ...item(row.handoffId, row.provenanceRef, row.fingerprint, handoffCurrentness, row.limitations, row.applicability), counterpartDiscipline: row.counterpartDiscipline, counterpart: row.counterpart, recordedHandoffStatus: row.handoffStatus, complete, futureContract, futureRuntimeStarted: false as const, counterpartFabricated: false as const, authorityTransferred: false as const };
  }));
  if (handoffs.some((row) => row.counterpart == null && row.complete)) fail("MISSING_COUNTERPART_EXPOSED_AS_COMPLETE");
  const reviews = byId(store.r10.r9.requests.filter(sameObject).map((row) => ({ ...item(row.reviewRequestId, row.subjectRevision, row.fingerprint, shown(store, "REVIEW_REQUEST", row.reviewRequestId, row.subjectRevision, row.fingerprint, row.recordStatus, row.currentness), row.limitations, row.applicability), requestStatus: row.requestStatus, reviewCompleted: row.reviewCompleted, subjectRevision: row.subjectRevision })));
  const validations = byId(store.r10.r9.validations.filter(sameObject).map((row) => ({ ...item(row.validationId, row.subjectRevision, row.fingerprint, shown(store, "VALIDATION", row.validationId, row.subjectRevision, row.fingerprint, row.recordStatus, row.currentness), row.limitations, row.applicability, row.engineeringValidated), validationState: row.validationState, subjectRevision: row.subjectRevision, conformant: false as const, engineeringApproved: false as const, certified: false as const })));
  const reassessmentOpen = changes.some((row) => row.currentness === "REASSESSMENT_REQUIRED" || row.changeCategory === "REASSESSMENT_REQUIRED");
  const representedAsValidated = !reassessmentOpen && currentness === "CURRENT" && validations.some((row) => row.currentness === "CURRENT" && row.validationState === "VALIDATED" && row.engineeringValidated);
  if (reassessmentOpen && representedAsValidated) fail("REASSESSMENT_EXPOSED_AS_VALIDATED");
  const exposed = new Set<string>([object.objectId, ...classifications, ...services, ...memberships, ...design, ...performance, ...vendorDocuments, ...vendorData, ...technical, ...maintainability, ...requirements, ...assumptions, ...decisions, ...changes, ...handoffs, ...reviews, ...validations].map((row) => typeof row === "string" ? row : row.subjectId));
  const lineage = store.r10.lineage.filter((row) => row.contextId === context.contextId && (exposed.has(row.source.subjectId) || exposed.has(row.target.subjectId))).map((row) => ({ lineageId: row.lineageId, relationshipType: row.relationshipType, sourceKind: row.source.subjectKind, sourceId: row.source.subjectId, sourceRevision: row.source.subjectRevision, sourceFingerprint: row.source.subjectFingerprint, targetKind: row.target.subjectKind, targetId: row.target.subjectId, targetRevision: row.target.subjectRevision, targetFingerprint: row.target.subjectFingerprint, fingerprint: row.fingerprint, inferred: false as const })).sort((left, right) => left.lineageId.localeCompare(right.lineageId));
  const copied = [...design, ...performance, ...vendorDocuments, ...vendorData, ...technical, ...maintainability, ...requirements, ...assumptions, ...decisions, ...changes, ...handoffs, ...reviews, ...validations].map((row) => row.limitations).filter((row) => row.trim().length > 0);
  const limitations = [D4_R11_STANDING_LIMITATION, ...copied].sort();
  if (currentness !== "CURRENT") limitations.push(`Mechanical currentness is ${currentness}.`);
  const projection = {
    EXACT_OBJECT_REVISION: object.provenanceRef,
    EQUIPMENT_IDENTITY: { objectId: object.objectId, contextId: context.contextId, discipline: D4_DISCIPLINE },
    EQUIPMENT_TYPE: object.objectType,
    EQUIPMENT_CONTEXT: { classifications, services, memberships },
    REQUIREMENTS: requirements,
    DESIGN_CONDITION_CONTEXT: design,
    PERFORMANCE_CONTEXT: performance,
    VENDOR_INFORMATION: { documents: vendorDocuments, data: vendorData },
    MECHANICAL_INTERFACES: handoffs,
    MAINTAINABILITY_CONSTRAINTS: maintainability,
    TECHNICAL_REQUIREMENTS: technical,
    ASSUMPTIONS: assumptions,
    DECISIONS: decisions,
    CHANGE_OR_REASSESSMENT_STATE: changes,
    REVIEW_VALIDATION_STATE: { reviews, validations },
    AUTHORITY: D4_CONTEXT_AUTHORITY,
    CURRENTNESS: currentness,
    PROVENANCE: provenanceRef,
    LIMITATIONS: limitations,
    LINEAGE: lineage,
  };
  const fingerprint = fingerprintCanonical(projection);
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.contracts.find((row) => row.contractId === contractId);
  if (existing) return existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId && existing.exactRevision === object.provenanceRef ? existing : fail("DUPLICATE_SOURCE_CONTRACT_REJECTED");
  const before = snapshot(store);
  const record: D4R11SourceContract = Object.freeze({
    contractId,
    contextId: context.contextId,
    objectId: object.objectId,
    exactRevision: object.provenanceRef,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
    currentness,
    authority: D4_CONTEXT_AUTHORITY,
    authorityTransferred: false,
    d9OwnsMechanicalAuthority: false,
    engineeringDerived: false,
    requirementGenerated: false,
    recommendationGenerated: false,
    decisionGenerated: false,
    calculationPerformed: false,
    inferredLineage: false,
    counterpartFabricated: false,
    representedAsValidated,
    conformant: false,
    engineeringApproved: false,
    certified: false,
    d9Started: false,
    fields: { ...projection, CANONICAL_FINGERPRINT: fingerprint },
    provenanceRef,
    fingerprint,
    recordedBy: actor.actorId,
    recordedAt: store.now(),
    recordStatus: "CURRENT",
  });
  store.contracts.push(record);
  store.history.push({ historyId: `hist-${store.history.length + 1}`, contractId, action: "CREATED", fingerprint, recordedAt: store.now() });
  if (snapshot(store) !== before) fail("CONTENT_MUTATION_REJECTED");
  return record;
}

export function repointMechanicalSourceContract(): never {
  return fail("AUTO_REPOINT_REJECTED");
}
export function inferMechanicalSourceLineage(): never {
  return fail("INFERRED_LINEAGE_REJECTED");
}
export function deriveMechanicalSourceFact(): never {
  return fail("DERIVATION_NOT_IN_R11");
}
export function fabricateMechanicalCounterpart(): never {
  return fail("COUNTERPART_FABRICATION_REJECTED");
}
export function startD9FromMechanicalSource(): never {
  return fail("D9_NOT_STARTED");
}
export function calculateFromMechanicalSource(): never {
  return fail("CALCULATION_NOT_IN_R11");
}
