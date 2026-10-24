/**
 * EOS-D5-R11 — Piping source contract for future D9 consumption.
 * One bounded runtime. Projects exact R1-R10 governed facts.
 * Does not create engineering truth, calculate, infer lineage,
 * fabricate a counterpart, transfer authority, or start D9.
 */
import {
  D5_CURRENTNESS_STATES,
  D5_D9_SOURCE_CONTRACT_CREATES_NEW_ENGINEERING_FACT,
  D5_D9_SOURCE_CONTRACT_FIELDS,
  D5_D9_SOURCE_CONTRACT_TRANSFERS_ENGINEERING_AUTHORITY,
  D5_HIDDEN_CALCULATION_ALLOWED,
  D5_IMPLEMENTATION_PHASES,
  D5_REVIEWED_EQUALS_VALIDATED,
  D5_VALIDATED_EQUALS_APPROVED,
  D5_VALIDATED_EQUALS_CERTIFIED,
  D5_VALIDATED_EQUALS_CONFORMANT,
  NDE_RESULT_EQUALS_CODE_CONFORMANCE,
  SOURCE_REQUIREMENT_EQUALS_ADOPTED_PIPING_REQUIREMENT,
  STRESS_ANALYSIS_RESULT_EQUALS_VALIDATED_PIPING_DESIGN,
} from "@rtb/types";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import { D1K_R3_SILENT_SOURCE_REPOINTING_ALLOWED } from "../structural-systems/interface-handoff-governance";
import { D5_CONTEXT_AUTHORITY, D5_DISCIPLINE, type D5R1Actor } from "./identity-foundation";
import { D5_R8_FUTURE_DISCIPLINES } from "./discipline-interfaces-handoffs";
import { AI_RECOMMENDATION_EQUALS_PIPING_ENGINEERING_DECISION, ASSUMPTION_EQUALS_VALIDATED_FACT } from "./requirements-assumptions-change";
import { EXTERNAL_ANALYSIS_EVIDENCE_EQUALS_EOS_VALIDATION, TEST_RESULT_EQUALS_CODE_CONFORMANCE } from "./stress-support-test-evidence-context";
import {
  ADMIN_EQUALS_D5_PIPING_ENGINEERING_AUTHORITY,
  AI_EQUALS_D5_PIPING_ENGINEERING_AUTHORITY,
  D1_STRUCTURAL_PACK_COMPLETE,
  D1N_REOPENED,
  D2_REOPENED,
  D2_TRACK_COMPLETE,
  D3_REOPENED,
  D3_TRACK_COMPLETE,
  D4_REOPENED,
  D4_TRACK_COMPLETE,
  D5_APPROVAL_RUNTIME_COUNT,
  D5_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT,
  D5_AUTOMATIC_REDESIGN_RUNTIME_COUNT,
  D5_AUTOMATIC_ROUTING_RUNTIME_COUNT,
  D5_BRANCH_REINFORCEMENT_CALCULATION_RUNTIME_COUNT,
  D5_CERTIFICATION_RUNTIME_COUNT,
  D5_COMPONENT_CONNECTION_VALVE_RUNTIME_READY_REUSED,
  D5_COMPONENT_SIZING_RUNTIME_COUNT,
  D5_CONFORMANCE_DETERMINATION_RUNTIME_COUNT,
  D5_CROSS_DISCIPLINE_CONFLICT_DETECTION_RUNTIME_COUNT,
  D5_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT,
  D5_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT,
  D5_CROSS_DISCIPLINE_RECOMMENDATION_RUNTIME_COUNT,
  D5_CURRENTNESS_DIGITAL_THREAD_RUNTIME_READY,
  D5_D9_RUNTIME_INTEGRATION_COUNT,
  D5_D9_SOURCE_CONTRACT_RUNTIME_COUNT as R10_SOURCE_COUNT,
  D5_DESIGN_CONDITION_SPECIFICATION_RUNTIME_READY_REUSED,
  D5_DISCIPLINE_INTERFACE_RUNTIME_READY_REUSED,
  D5_EQUALS_D1_STRUCTURAL_AUTHORITY,
  D5_EQUALS_D2_CIVIL_AUTHORITY,
  D5_EQUALS_D3_GEOTECHNICAL_AUTHORITY,
  D5_EQUALS_D4_MECHANICAL_AUTHORITY,
  D5_EQUALS_D6_PROCESS_AUTHORITY,
  D5_EQUALS_D7_ELECTRICAL_AUTHORITY,
  D5_EQUALS_D8_INSTRUMENTATION_CONTROL_AUTHORITY,
  D5_FLEXIBILITY_CALCULATION_RUNTIME_COUNT,
  D5_FLANGE_RATING_CALCULATION_RUNTIME_COUNT,
  D5_GEOMETRY_SOLVER_RUNTIME_COUNT,
  D5_HYDRAULIC_CALCULATION_RUNTIME_COUNT,
  D5_INFERRED_LINEAGE_ALLOWED,
  D5_PIPE_SIZING_RUNTIME_COUNT,
  D5_PIPING_IDENTITY_OBJECT_FOUNDATION_RUNTIME_READY_REUSED,
  D5_PIPING_STRESS_CALCULATION_RUNTIME_COUNT,
  D5_PRESSURE_DROP_CALCULATION_RUNTIME_COUNT,
  D5_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY_REUSED,
  D5_REUSES_CANONICAL_CURRENTNESS,
  D5_REUSES_CANONICAL_DIGITAL_THREAD,
  D5_REUSES_CANONICAL_FINGERPRINT,
  D5_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_READY_REUSED,
  D5_ROUTE_OPTIMIZATION_RUNTIME_COUNT,
  D5_ROUTING_ARRANGEMENT_FABRICATION_RUNTIME_READY_REUSED,
  D5_RUNTIME_COUNT as R10_RUNTIME_COUNT,
  D5_SPATIAL_CLASH_DETECTION_RUNTIME_COUNT,
  D5_STRESS_SUPPORT_TEST_EVIDENCE_RUNTIME_READY_REUSED,
  D5_SUPPORT_LOAD_CALCULATION_RUNTIME_COUNT,
  D5_SYSTEM_LINE_SERVICE_CONTEXT_RUNTIME_READY_REUSED,
  D5_VALVE_SIZING_RUNTIME_COUNT,
  D5_WALL_THICKNESS_CALCULATION_RUNTIME_COUNT,
  D6_RUNTIME_STARTED,
  D7_RUNTIME_STARTED,
  D8_RUNTIME_STARTED,
  D9_RUNTIME_COUNT,
  D9_RUNTIME_STARTED,
  DATABASE_SCHEMA_CHANGED,
  NEW_DEPENDENCY_ADDED,
  PARALLEL_D5_CURRENTNESS_ENGINE_CREATED,
  PARALLEL_D5_DIGITAL_THREAD_CREATED,
  SECOND_D5_FINGERPRINT_ALGORITHM_CREATED,
  UNAUTHORIZED_CROSS_DISCIPLINE_REASONING_PROMOTION,
  UNAUTHORIZED_D1_PACK_COMPLETION,
  UNAUTHORIZED_D2_REOPEN,
  UNAUTHORIZED_D3_REOPEN,
  UNAUTHORIZED_D4_REOPEN,
  UNAUTHORIZED_D6_D8_RUNTIME_PROMOTION,
  UNAUTHORIZED_D9_RUNTIME_PROMOTION,
  UNAUTHORIZED_GA_PROMOTION,
  UNAUTHORIZED_INFERRED_LINEAGE,
  UNAUTHORIZED_PRODUCT_CLAIM,
  UNAUTHORIZED_VALIDATION_PROMOTION,
  type D5R10Store,
} from "./currentness-digital-thread";

export const D5_R11_STATUS = "D9_SOURCE_CONTRACT_IMPLEMENTED" as const;
export const D5_R11_MATURITY = D5_R11_STATUS;
export const D5_R11_MATURITY_STATE = D5_R11_STATUS;
export const D5_R11_CLOSEOUT_PATH = "docs/architecture/engineering-os/EOS_D5_R11_D9_SOURCE_CONTRACT_CLOSEOUT.md" as const;
export const D5_RUNTIME_STARTED = true as const;
export const D5_RUNTIME_COUNT = 11 as const;
export const D5_R10_RUNTIME_COUNT = R10_RUNTIME_COUNT;
export const D5_R10_D9_SOURCE_CONTRACT_RUNTIME_COUNT = R10_SOURCE_COUNT;
export const D5_D9_SOURCE_CONTRACT_RUNTIME_IMPLEMENTED = true as const;
export const D5_D9_SOURCE_CONTRACT_RUNTIME_COUNT = 1 as const;
export const D5_D9_SOURCE_CONTRACT_RUNTIME_READY = true as const;
export {
  D5_PIPING_IDENTITY_OBJECT_FOUNDATION_RUNTIME_READY_REUSED,
  D5_SYSTEM_LINE_SERVICE_CONTEXT_RUNTIME_READY_REUSED,
  D5_DESIGN_CONDITION_SPECIFICATION_RUNTIME_READY_REUSED,
  D5_COMPONENT_CONNECTION_VALVE_RUNTIME_READY_REUSED,
  D5_ROUTING_ARRANGEMENT_FABRICATION_RUNTIME_READY_REUSED,
  D5_STRESS_SUPPORT_TEST_EVIDENCE_RUNTIME_READY_REUSED,
  D5_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY_REUSED,
  D5_DISCIPLINE_INTERFACE_RUNTIME_READY_REUSED,
  D5_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_READY_REUSED,
};
export const D5_CURRENTNESS_DIGITAL_THREAD_RUNTIME_READY_REUSED = D5_CURRENTNESS_DIGITAL_THREAD_RUNTIME_READY;
export const D5_R1_R10_EXACT_SOURCE_REVISIONS_REUSED = true as const;
export const EXACT_D5_D9_SOURCE_REVISION_REQUIRED = true as const;
export const FLOATING_D5_D9_SOURCE_REFERENCE_ALLOWED = false as const;
export const D5_D9_SOURCE_REFERENCE_AUTO_REPOINTED = D1K_R3_SILENT_SOURCE_REPOINTING_ALLOWED;
export const D5_REUSES_CANONICAL_D9_SOURCE_CONTRACT_PATTERN = true as const;
export const PARALLEL_D5_D9_CONTRACT_FRAMEWORK_CREATED = false as const;
export const D5_R11_SOURCE_CONTRACT_FIELDS = D5_D9_SOURCE_CONTRACT_FIELDS;
export const D5_D9_SOURCE_DOMAINS_EXPOSED = true as const;
export const D5_D9_SOURCE_CONTRACT_DERIVES_NEW_ENGINEERING_VALUE = false as const;
export const D5_D9_SOURCE_CONTRACT_GENERATES_NEW_REQUIREMENT = false as const;
export const D5_D9_SOURCE_CONTRACT_GENERATES_NEW_RECOMMENDATION = false as const;
export const D5_D9_SOURCE_CONTRACT_GENERATES_ENGINEERING_DECISION = false as const;
export const D5_R11_HIDDEN_CALCULATION_ALLOWED = D5_HIDDEN_CALCULATION_ALLOWED;
export const D5_R10_CURRENTNESS_REUSED = true as const;
export const D5_R10_DIGITAL_THREAD_REUSED = true as const;
export const D5_R10_FINGERPRINT_REUSED = D5_REUSES_CANONICAL_FINGERPRINT;
export const STALE_D5_RECORD_EXPOSED_AS_CURRENT_TO_D9 = false as const;
export const SUPERSEDED_D5_RECORD_EXPOSED_AS_CURRENT_TO_D9 = false as const;
export const REASSESSMENT_REQUIRED_D5_RECORD_EXPOSED_AS_VALIDATED_TO_D9 = false as const;
export const D5_EXPLICIT_LINEAGE_EXPOSED_TO_D9 = true as const;
export const D5_D9_CONTRACT_INFERS_LINEAGE = false as const;
export const D5_D9_CONTRACT_AUTO_REPOINTS_HISTORY = D1K_R3_SILENT_SOURCE_REPOINTING_ALLOWED;
export const D5_R9_REVIEW_STATE_EXPOSED_TO_D9 = true as const;
export const D5_R9_VALIDATION_STATE_EXPOSED_TO_D9 = true as const;
export const REVIEWED_EQUALS_VALIDATED = D5_REVIEWED_EQUALS_VALIDATED;
export const VALIDATED_EQUALS_CONFORMANT = D5_VALIDATED_EQUALS_CONFORMANT;
export const VALIDATED_EQUALS_APPROVED = D5_VALIDATED_EQUALS_APPROVED;
export const VALIDATED_EQUALS_CERTIFIED = D5_VALIDATED_EQUALS_CERTIFIED;
export const D5_R8_INTERFACE_STATE_EXPOSED_TO_D9 = true as const;
export const D5_D9_CONTRACT_FABRICATES_MISSING_COUNTERPART = false as const;
export const D5_D9_CONTRACT_INFERS_COUNTERPART = false as const;
export const D5_D9_CONTRACT_EXPOSES_AUTHORITY_METADATA = true as const;
export const D5_D9_CONTRACT_CREATES_D9_ENGINEERING_AUTHORITY = false as const;
export const D5_D9_CONTRACT_PRESERVES_APPLICABILITY = true as const;
export const D5_D9_CONTRACT_PRESERVES_LIMITATIONS = true as const;
export const D5_D9_CONTRACT_PRESERVES_PROVENANCE = true as const;
export const D5_D9_CONTRACT_PRESERVES_SOURCE_AUTHORITY = true as const;
export const D5_D9_CONTRACT_REINTERPRETS_EXTERNAL_EVIDENCE = false as const;
export const D5_D9_CONTRACT_PROMOTES_ASSUMPTION_TO_FACT = false as const;
export const D5_D9_CONTRACT_PROMOTES_SOURCE_REQUIREMENT_TO_ADOPTED_REQUIREMENT = false as const;
export const D5_R11_HISTORY_PRESERVED = true as const;
export const SILENT_D5_R11_MUTATION_ALLOWED = false as const;
export const D5_R11_HISTORICAL_REFERENCE_AUTO_REPOINTED = D1K_R3_SILENT_SOURCE_REPOINTING_ALLOWED;
export const TENANT_WORKSPACE_PROJECT_D5_R11_SCOPE_ENFORCED = true as const;
export const CROSS_TENANT_D5_D9_SOURCE_ACCESS_ALLOWED = false as const;
export const D5_R11_DUPLICATE_GOVERNANCE_IMPLEMENTED = true as const;
export const D5_R11_REPLAY_PROTECTION_IMPLEMENTED = true as const;
export const D5_R11_SPOOFING_PROTECTION_IMPLEMENTED = true as const;
export const UNAUTHORIZED_D5_R12_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_NEW_ENGINEERING_FACT = false as const;
export const UNAUTHORIZED_ENGINEERING_CALCULATION = false as const;
export const UNAUTHORIZED_ENGINEERING_AUTHORITY_TRANSFER = false as const;
export const UNAUTHORIZED_COUNTERPART_FABRICATION = false as const;
export {
  D5_D9_SOURCE_CONTRACT_CREATES_NEW_ENGINEERING_FACT,
  D5_D9_SOURCE_CONTRACT_TRANSFERS_ENGINEERING_AUTHORITY,
  D5_D9_RUNTIME_INTEGRATION_COUNT,
  D5_REUSES_CANONICAL_CURRENTNESS,
  D5_REUSES_CANONICAL_DIGITAL_THREAD,
  D5_REUSES_CANONICAL_FINGERPRINT,
  PARALLEL_D5_CURRENTNESS_ENGINE_CREATED,
  PARALLEL_D5_DIGITAL_THREAD_CREATED,
  SECOND_D5_FINGERPRINT_ALGORITHM_CREATED,
  D5_INFERRED_LINEAGE_ALLOWED,
  SOURCE_REQUIREMENT_EQUALS_ADOPTED_PIPING_REQUIREMENT,
  ASSUMPTION_EQUALS_VALIDATED_FACT,
  AI_RECOMMENDATION_EQUALS_PIPING_ENGINEERING_DECISION,
  STRESS_ANALYSIS_RESULT_EQUALS_VALIDATED_PIPING_DESIGN,
  NDE_RESULT_EQUALS_CODE_CONFORMANCE,
  TEST_RESULT_EQUALS_CODE_CONFORMANCE,
  EXTERNAL_ANALYSIS_EVIDENCE_EQUALS_EOS_VALIDATION,
  AI_EQUALS_D5_PIPING_ENGINEERING_AUTHORITY,
  ADMIN_EQUALS_D5_PIPING_ENGINEERING_AUTHORITY,
  D5_EQUALS_D1_STRUCTURAL_AUTHORITY,
  D5_EQUALS_D2_CIVIL_AUTHORITY,
  D5_EQUALS_D3_GEOTECHNICAL_AUTHORITY,
  D5_EQUALS_D4_MECHANICAL_AUTHORITY,
  D5_EQUALS_D6_PROCESS_AUTHORITY,
  D5_EQUALS_D7_ELECTRICAL_AUTHORITY,
  D5_EQUALS_D8_INSTRUMENTATION_CONTROL_AUTHORITY,
  D5_PIPE_SIZING_RUNTIME_COUNT,
  D5_HYDRAULIC_CALCULATION_RUNTIME_COUNT,
  D5_PRESSURE_DROP_CALCULATION_RUNTIME_COUNT,
  D5_WALL_THICKNESS_CALCULATION_RUNTIME_COUNT,
  D5_BRANCH_REINFORCEMENT_CALCULATION_RUNTIME_COUNT,
  D5_FLANGE_RATING_CALCULATION_RUNTIME_COUNT,
  D5_VALVE_SIZING_RUNTIME_COUNT,
  D5_COMPONENT_SIZING_RUNTIME_COUNT,
  D5_PIPING_STRESS_CALCULATION_RUNTIME_COUNT,
  D5_FLEXIBILITY_CALCULATION_RUNTIME_COUNT,
  D5_SUPPORT_LOAD_CALCULATION_RUNTIME_COUNT,
  D5_AUTOMATIC_ROUTING_RUNTIME_COUNT,
  D5_ROUTE_OPTIMIZATION_RUNTIME_COUNT,
  D5_SPATIAL_CLASH_DETECTION_RUNTIME_COUNT,
  D5_GEOMETRY_SOLVER_RUNTIME_COUNT,
  D5_AUTOMATIC_REDESIGN_RUNTIME_COUNT,
  D5_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT,
  D5_CONFORMANCE_DETERMINATION_RUNTIME_COUNT,
  D5_APPROVAL_RUNTIME_COUNT,
  D5_CERTIFICATION_RUNTIME_COUNT,
  D5_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT,
  D5_CROSS_DISCIPLINE_CONFLICT_DETECTION_RUNTIME_COUNT,
  D5_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT,
  D5_CROSS_DISCIPLINE_RECOMMENDATION_RUNTIME_COUNT,
  D1_STRUCTURAL_PACK_COMPLETE,
  D1N_REOPENED,
  D2_TRACK_COMPLETE,
  D2_REOPENED,
  D3_TRACK_COMPLETE,
  D3_REOPENED,
  D4_TRACK_COMPLETE,
  D4_REOPENED,
  D6_RUNTIME_STARTED,
  D7_RUNTIME_STARTED,
  D8_RUNTIME_STARTED,
  D9_RUNTIME_STARTED,
  D9_RUNTIME_COUNT,
  DATABASE_SCHEMA_CHANGED,
  NEW_DEPENDENCY_ADDED,
  UNAUTHORIZED_D1_PACK_COMPLETION,
  UNAUTHORIZED_D2_REOPEN,
  UNAUTHORIZED_D3_REOPEN,
  UNAUTHORIZED_D4_REOPEN,
  UNAUTHORIZED_D6_D8_RUNTIME_PROMOTION,
  UNAUTHORIZED_D9_RUNTIME_PROMOTION,
  UNAUTHORIZED_INFERRED_LINEAGE,
  UNAUTHORIZED_VALIDATION_PROMOTION,
  UNAUTHORIZED_CROSS_DISCIPLINE_REASONING_PROMOTION,
  UNAUTHORIZED_GA_PROMOTION,
  UNAUTHORIZED_PRODUCT_CLAIM,
};

export const D5_R12_CANONICAL_PHASE = D5_IMPLEMENTATION_PHASES[11];
export const D5_R12_PHASE_TYPE = "PIPING_BOUNDED_CLOSEOUT" as const;
export const D5_R12_CANONICAL_SCOPE = "Perform D5 bounded closeout across canonical D5-0 and R1-R11. Verify all eleven substantive D5 runtime capabilities are coherent, traceable and bounded; no additional substantive runtime is added by R12. Verify D5 remains distinct from D1-D4 and future D6-D8 authority, D9 source contract exists exactly once, D9 integration/runtime remain zero, all calculation/redesign/cross-discipline/conformance/approval/certification runtimes remain zero, and the D5 track is classified COMPLETE_BOUNDED_WITH_LIMITATIONS." as const;
export const D5_R12_STARTED = false as const;
export const D5_R11_READY_FOR_NEXT_PHASE = true as const;
export const D5_R11_NEXT_PHASE = D5_R12_CANONICAL_PHASE;
export const D5_R11_NEXT_PHASE_TYPE = D5_R12_PHASE_TYPE;
export const D5_R11_CANONICAL_NEXT_PHASE = D5_R12_CANONICAL_PHASE;
export const D5_R11_CANONICAL_NEXT_PHASE_SCOPE = D5_R12_CANONICAL_SCOPE;
export const D5_R11_BLOCKER = "NONE" as const;
export const D5_R11_MACHINE_READABLE_ROADMAP_UPDATED = true as const;
export const D5_R11_STANDING_LIMITATION = "This source contract projects governed Piping facts for future D9 consumption. It does not create engineering facts, transfer Piping authority, fabricate counterparts, start D9, or treat review or validation as conformance, approval, or certification." as const;

const FLOATING = new Set(["latest", "current", "newest", "head", "active", "active model"]);
const INFERRED = new Set(["matching_tag", "matching_line_number", "matching_filename", "semantic_similarity", "component_similarity", "drawing_proximity", "timestamp", "ai_inference", "inferred", "filename", "line_number", "proximity", "similar_value"]);
const FUTURE = new Set<string>(D5_R8_FUTURE_DISCIPLINES);

type Currentness = (typeof D5_CURRENTNESS_STATES)[number];
type Prohibited = {
  infer?: boolean;
  identicalTags?: boolean;
  lineNumber?: boolean;
  filename?: boolean;
  semantic?: boolean;
  drawingProximity?: boolean;
  timestamp?: boolean;
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
  stripProvenance?: boolean;
  promoteAssumption?: boolean;
  promoteRequirement?: boolean;
  reinterpretEvidence?: boolean;
  d9Reasoning?: boolean;
  mutateUpstream?: boolean;
};

export type D5R11Actor = D5R1Actor & { actorKind?: string };
export type D5R11SourceContractInput = Prohibited & {
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
  authority: typeof D5_CONTEXT_AUTHORITY;
  engineeringValidated: boolean;
  conformant: false;
  approved: false;
  certified: false;
};

export type D5R11SourceContract = {
  contractId: string;
  contextId: string;
  objectId: string;
  exactRevision: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  currentness: Currentness;
  authority: typeof D5_CONTEXT_AUTHORITY;
  authorityTransferred: false;
  d9OwnsPipingAuthority: false;
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

export type D5R11History = { historyId: string; contractId: string; action: "CREATED"; fingerprint: string; recordedAt: string };
export type D5R11Store = { r10: D5R10Store; now: () => string; contracts: D5R11SourceContract[]; history: D5R11History[] };

function fail(code: string): never {
  throw new Error(`D5_R11_${code}`);
}

function blockedParty(value: string): boolean {
  const token = value.toUpperCase();
  return token === "AI" || token.startsWith("AI_") || token.startsWith("AI-") || token.startsWith("AI ") || token.includes("LLM") || token.includes("OPTIMIZER");
}

function explicit(value: string, code: string): string {
  const token = value.trim();
  if (!token || FLOATING.has(token.toLowerCase())) fail(code);
  if (INFERRED.has(token.toLowerCase()) || blockedParty(token)) fail("INFERRED_LINEAGE_REJECTED");
  return token;
}

function hidden(value: string): boolean {
  return value.includes("=") || value.includes("calc(") || value.includes("sqrt(");
}

function isCurrentness(value: string): value is Currentness {
  return (D5_CURRENTNESS_STATES as readonly string[]).includes(value);
}

function assertProhibited(input: Prohibited): void {
  if (input.infer === true || input.identicalTags === true || input.lineNumber === true || input.filename === true || input.semantic === true || input.drawingProximity === true || input.timestamp === true) fail("INFERRED_LINEAGE_REJECTED");
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
  if (input.stripProvenance === true) fail("PROVENANCE_STRIPPING_REJECTED");
  if (input.promoteAssumption === true) fail("ASSUMPTION_PROMOTION_REJECTED");
  if (input.promoteRequirement === true) fail("REQUIREMENT_PROMOTION_REJECTED");
  if (input.reinterpretEvidence === true) fail("EVIDENCE_REINTERPRETATION_REJECTED");
  if (input.d9Reasoning === true) fail("D9_NOT_STARTED");
  if (input.mutateUpstream === true) fail("UPSTREAM_MUTATION_REJECTED");
}

function assertScope(actor: D5R11Actor, input: { tenantId?: string; workspaceId?: string; projectId?: string }): void {
  if (!actor.actorId.trim() || !actor.tenantId.trim() || !actor.workspaceId.trim() || !actor.projectId.trim()) fail("SCOPE_REQUIRED");
  if (input.tenantId != null && input.tenantId !== actor.tenantId) fail("CROSS_TENANT_OPERATION");
  if (input.workspaceId != null && input.workspaceId !== actor.workspaceId) fail("CROSS_WORKSPACE_OPERATION");
  if (input.projectId != null && input.projectId !== actor.projectId) fail("CROSS_PROJECT_OPERATION");
}

function assertRecorder(actor: D5R11Actor): void {
  if (blockedParty(actor.actorId) || blockedParty(actor.authority) || actor.authority === "AI_ASSISTANT" || actor.actorKind === "ai") fail("AI_NOT_PIPING_AUTHORITY");
  if (actor.authority === "ADMINISTRATOR" || actor.authority === "ADMIN") fail("ADMIN_NOT_PIPING_AUTHORITY");
  if (actor.authority === "PIPING_ENGINEERING_AUTHORITY" || actor.authority === "REVIEWER") fail("AUTHORITY_SPOOFING_REJECTED");
  if (actor.authority !== D5_CONTEXT_AUTHORITY) fail("UNAUTHORIZED");
}

function text(value: string, code: string): string {
  if (hidden(value)) fail(code);
  return value;
}

function owned<T extends { objectId: string; objectRevisionFingerprint: string; tenantId: string }>(rows: T[], objectId: string, fingerprint: string, tenantId: string): T[] {
  return rows.filter((row) => row.objectId === objectId && row.objectRevisionFingerprint === fingerprint && row.tenantId === tenantId);
}

function latestMark(store: D5R11Store, kind: string, subjectId: string, subjectRevision: string, subjectFingerprint: string): Currentness | null {
  const marks = store.r10.marks.filter((row) => row.subject.subjectKind === kind && row.subject.subjectId === subjectId && row.subject.subjectRevision === subjectRevision && row.subject.subjectFingerprint === subjectFingerprint);
  return marks.length === 0 ? null : marks[marks.length - 1].currentness;
}

function shown(store: D5R11Store, kind: string, subjectId: string, revision: string, fingerprint: string, recordStatus: string, fallback: string): Currentness {
  const mark = latestMark(store, kind, subjectId, revision, fingerprint);
  const value = mark ?? (recordStatus === "SUPERSEDED" ? "SUPERSEDED" : fallback);
  if (!isCurrentness(value)) fail("CURRENTNESS_INVALID");
  return value;
}

function item(subjectId: string, exactRevision: string, fingerprint: string, currentness: Currentness, limitations: string, applicability: string, engineeringValidated = false): Item {
  return {
    subjectId,
    exactRevision,
    fingerprint,
    currentness,
    limitations: text(limitations, "HIDDEN_CALCULATION_REJECTED"),
    applicability: text(applicability, "HIDDEN_CALCULATION_REJECTED"),
    authority: D5_CONTEXT_AUTHORITY,
    engineeringValidated: currentness === "CURRENT" && engineeringValidated,
    conformant: false,
    approved: false,
    certified: false,
  };
}

function byId<T extends { subjectId: string }>(rows: T[]): T[] {
  return [...rows].sort((left, right) => left.subjectId.localeCompare(right.subjectId));
}

function snapshot(store: D5R11Store): string {
  const r4 = store.r10.r9.r8.r7.r6.r5.r4;
  const r6 = store.r10.r9.r8.r7.r6;
  const conditions = r4.r3.conditions.map((row) => `${row.conditionId}:${row.fingerprint}:${row.designPressure.value}:${row.currentness}`).join("|");
  const specifications = r4.r3.specifications.map((row) => `${row.specificationId}:${row.fingerprint}:${row.pipingClass}:${row.currentness}`).join("|");
  const components = r4.components.map((row) => `${row.componentRecordId}:${row.fingerprint}:${row.currentness}`).join("|");
  const evidence = [...r6.stressEvidence, ...r6.supports, ...r6.nde, ...r6.tests].map((row) => `${row.fingerprint}:${row.currentness}`).join("|");
  const changes = store.r10.r9.r8.r7.changes.map((row) => `${row.changeId}:${row.fingerprint}:${row.recalculated}:${row.redesigned}`).join("|");
  const handoffs = store.r10.r9.r8.handoffs.map((row) => `${row.handoffId}:${row.fingerprint}:${row.counterpart?.interfaceId ?? ""}:${row.engineeringValidated}`).join("|");
  const validations = store.r10.r9.validations.map((row) => `${row.validationId}:${row.fingerprint}:${row.engineeringValidated}:${row.currentness}`).join("|");
  const thread = `${store.r10.lineage.length}:${store.r10.marks.length}:${store.r10.supersessions.length}`;
  return `${conditions}#${specifications}#${components}#${evidence}#${changes}#${handoffs}#${validations}#${thread}`;
}

export function createD5R11Store(r10: D5R10Store, now: () => string = () => r10.now()): D5R11Store {
  return { r10, now, contracts: [], history: [] };
}

export function recordPipingSourceContract(store: D5R11Store, actor: D5R11Actor, input: D5R11SourceContractInput): D5R11SourceContract {
  assertRecorder(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const cited = input.citedCurrentness.trim();
  if (!isCurrentness(cited)) fail("CURRENTNESS_INVALID");
  const contextId = explicit(input.contextId, "R1_CONTEXT_REQUIRED");
  const r4 = store.r10.r9.r8.r7.r6.r5.r4;
  const context = r4.r1.contexts.find((row) => row.contextId === contextId);
  if (!context || context.tenantId !== actor.tenantId || context.workspaceId !== actor.workspaceId || context.projectId !== actor.projectId) fail("R1_CONTEXT_NOT_FOUND");
  if (context.discipline !== D5_DISCIPLINE) fail("DISCIPLINE_NOT_PIPING");
  const objectId = explicit(input.objectId, "OBJECT_REFERENCE_REQUIRED");
  const sourceRevision = explicit(input.sourceRevision, "SUBJECT_REVISION_REQUIRED");
  const object = r4.r1.objects.find((row) => row.objectId === objectId && row.contextId === context.contextId && row.tenantId === actor.tenantId);
  if (!object || object.provenanceRef !== sourceRevision) fail("SUBJECT_REVISION_MISMATCH");
  const currentness = shown(store, "OBJECT", object.objectId, object.provenanceRef, object.fingerprint, object.recordStatus, object.currentness);
  if (cited === "CURRENT" && currentness === "STALE") fail("STALE_EXPOSED_AS_CURRENT");
  if (cited === "CURRENT" && currentness === "SUPERSEDED") fail("SUPERSEDED_EXPOSED_AS_CURRENT");
  if (cited === "CURRENT" && currentness === "REASSESSMENT_REQUIRED") fail("REASSESSMENT_EXPOSED_AS_CURRENT");
  if (cited !== currentness) fail("CURRENTNESS_MISMATCH");
  const provenanceRef = explicit(input.provenanceRef, "MISSING_PROVENANCE");
  const contractId = explicit(input.contractId, "CONTRACT_ID_REQUIRED");
  const bind = <T extends { objectId: string; objectRevisionFingerprint: string; tenantId: string }>(rows: T[]) => owned(rows, object.objectId, object.fingerprint, actor.tenantId);
  const r5 = store.r10.r9.r8.r7.r6.r5;
  const r6 = store.r10.r9.r8.r7.r6;
  const r7 = store.r10.r9.r8.r7;
  const systems = byId(bind(r4.r2.systems).map((row) => ({ ...item(row.systemRecordId, row.provenanceRef, row.fingerprint, shown(store, "SYSTEM", row.systemRecordId, row.provenanceRef, row.fingerprint, row.recordStatus, row.currentness), "", row.applicableScope), systemName: row.systemName })));
  const lines = byId(bind(r4.r2.lines).map((row) => ({ ...item(row.lineRecordId, row.provenanceRef, row.fingerprint, shown(store, "LINE", row.lineRecordId, row.provenanceRef, row.fingerprint, row.recordStatus, row.currentness), "", row.applicableScope), lineTag: row.lineTag })));
  const services = byId(bind(r4.r2.services).map((row) => ({ ...item(row.serviceRecordId, row.provenanceRef, row.fingerprint, shown(store, "SERVICE", row.serviceRecordId, row.provenanceRef, row.fingerprint, row.recordStatus, row.currentness), "", row.applicableScope), serviceFunction: row.serviceFunction })));
  const conditions = byId(bind(r4.r3.conditions).map((row) => ({ ...item(row.conditionId, row.provenanceRef, row.fingerprint, shown(store, "CONDITION", row.conditionId, row.provenanceRef, row.fingerprint, row.recordStatus, row.currentness), row.limitations, row.applicabilityRef), designPressure: row.designPressure, designTemperature: row.designTemperature })));
  const specifications = byId(bind(r4.r3.specifications).map((row) => ({ ...item(row.specificationId, row.provenanceRef, row.fingerprint, shown(store, "SPECIFICATION", row.specificationId, row.provenanceRef, row.fingerprint, row.recordStatus, row.currentness), row.limitations, row.applicabilityRef), pipingClass: row.pipingClass, materialFamily: row.materialFamily })));
  const components = byId(bind(r4.components).map((row) => ({ ...item(row.componentRecordId, row.provenanceRef, row.fingerprint, shown(store, "COMPONENT", row.componentRecordId, row.provenanceRef, row.fingerprint, row.recordStatus, row.currentness), row.limitations, row.applicabilityRef), componentClassification: row.componentClassification })));
  const connections = byId(r4.connections.filter((row) => row.tenantId === actor.tenantId && ((row.fromObjectId === object.objectId && row.fromRevisionFingerprint === object.fingerprint) || (row.toObjectId === object.objectId && row.toRevisionFingerprint === object.fingerprint))).map((row) => ({ ...item(row.connectionRecordId, row.provenanceRef, row.fingerprint, shown(store, "CONNECTION", row.connectionRecordId, row.provenanceRef, row.fingerprint, row.recordStatus, row.currentness), row.limitations, row.applicabilityRef), connectionKind: row.connectionKind })));
  const valves = byId(bind(r4.valves).map((row) => ({ ...item(row.valveRecordId, row.provenanceRef, row.fingerprint, shown(store, "VALVE", row.valveRecordId, row.provenanceRef, row.fingerprint, row.recordStatus, row.currentness), row.limitations, row.applicabilityRef), valveTag: row.valveTag, valveSizing: false as const })));
  const specialties = byId(bind(r4.specialties).map((row) => ({ ...item(row.specialtyRecordId, row.provenanceRef, row.fingerprint, shown(store, "COMPONENT", row.specialtyRecordId, row.provenanceRef, row.fingerprint, row.recordStatus, row.currentness), row.limitations, row.applicabilityRef), specialtyDescription: row.specialtyDescription })));
  const routes = byId(bind(r5.routes).map((row) => ({ ...item(row.routeRecordId, row.provenanceRef, row.fingerprint, shown(store, "ROUTE", row.routeRecordId, row.provenanceRef, row.fingerprint, row.recordStatus, row.currentness), row.limitations, row.applicabilityRef), routeSegment: row.routeSegment })));
  const arrangements = byId(bind(r5.arrangements).map((row) => ({ ...item(row.arrangementRecordId, row.provenanceRef, row.fingerprint, shown(store, "ROUTE", row.arrangementRecordId, row.provenanceRef, row.fingerprint, row.recordStatus, row.currentness), row.limitations, row.applicabilityRef), arrangementStatement: text(row.arrangementStatement, "HIDDEN_CALCULATION_REJECTED") })));
  const fabrications = byId(bind(r5.fabrications).map((row) => ({ ...item(row.fabricationRecordId, row.provenanceRef, row.fingerprint, shown(store, "ROUTE", row.fabricationRecordId, row.provenanceRef, row.fingerprint, row.recordStatus, row.currentness), row.limitations, row.applicabilityRef), fabricationClass: row.fabricationClass })));
  const isometrics = byId(bind(r5.isometrics).map((row) => ({ ...item(row.isometricRecordId, row.provenanceRef, row.fingerprint, shown(store, "ISOMETRIC", row.isometricRecordId, row.provenanceRef, row.fingerprint, row.recordStatus, row.currentness), row.limitations, row.applicabilityRef), documentId: row.documentId, documentRevision: row.documentRevision })));
  const spools = byId(bind(r5.spools).map((row) => ({ ...item(row.spoolRecordId, row.provenanceRef, row.fingerprint, shown(store, "SPOOL", row.spoolRecordId, row.provenanceRef, row.fingerprint, row.recordStatus, row.currentness), row.limitations, row.applicabilityRef), spoolTag: row.spoolTag })));
  const welds = byId(bind(r5.welds).map((row) => ({ ...item(row.weldRecordId, row.provenanceRef, row.fingerprint, shown(store, "WELD", row.weldRecordId, row.provenanceRef, row.fingerprint, row.recordStatus, row.currentness), row.limitations, row.applicabilityRef), jointType: row.jointType, weldAccepted: false as const })));
  const stress = byId(bind(r6.stressEvidence).map((row) => ({ ...item(row.evidenceRecordId, row.provenanceRef, row.fingerprint, shown(store, "STRESS", row.evidenceRecordId, row.provenanceRef, row.fingerprint, row.recordStatus, row.currentness), row.limitations, row.applicabilityRef), stressResult: row.stressResult, analysisExecuted: false as const, validatedPipingDesign: false as const, calculated: false as const, eosValidation: false as const })));
  const supports = byId(bind(r6.supports).map((row) => ({ ...item(row.supportRecordId, row.provenanceRef, row.fingerprint, shown(store, "SUPPORT", row.supportRecordId, row.provenanceRef, row.fingerprint, row.recordStatus, row.currentness), row.limitations, row.applicabilityRef), supportFunction: row.supportFunction, structuralValidation: false as const })));
  const inspections = byId(bind(r6.inspections).map((row) => ({ ...item(row.inspectionRecordId, row.provenanceRef, row.fingerprint, shown(store, "INSPECTION", row.inspectionRecordId, row.provenanceRef, row.fingerprint, row.recordStatus, row.currentness), row.limitations, row.applicabilityRef), inspectionPassed: false as const })));
  const nde = byId(bind(r6.nde).map((row) => ({ ...item(row.ndeRecordId, row.provenanceRef, row.fingerprint, shown(store, "NDE", row.ndeRecordId, row.provenanceRef, row.fingerprint, row.recordStatus, row.currentness), row.limitations, row.applicabilityRef), ndeMethod: row.ndeMethod, ndeAccepted: false as const, codeConformance: false as const })));
  const tests = byId(bind(r6.tests).map((row) => ({ ...item(row.testRecordId, row.provenanceRef, row.fingerprint, shown(store, "TEST", row.testRecordId, row.provenanceRef, row.fingerprint, row.recordStatus, row.currentness), row.limitations, row.applicabilityRef), testKind: row.testKind, testPassed: false as const, codeConformance: false as const })));
  const requirements = byId(bind(r7.requirements).map((row) => ({ ...item(row.requirementId, row.provenanceRef, row.fingerprint, shown(store, "REQUIREMENT", row.requirementId, row.provenanceRef, row.fingerprint, row.recordStatus, row.currentness), row.limitations, row.applicabilityRef), statement: text(row.statement, "HIDDEN_CALCULATION_REJECTED"), adopted: row.adopted })));
  const assumptions = byId(bind(r7.assumptions).map((row) => ({ ...item(row.assumptionId, row.provenanceRef, row.fingerprint, shown(store, "ASSUMPTION", row.assumptionId, row.provenanceRef, row.fingerprint, row.recordStatus, row.currentness), row.limitations, row.applicabilityRef), statement: text(row.statement, "HIDDEN_CALCULATION_REJECTED"), validatedFact: false as const })));
  const decisions = byId(bind(r7.decisions).map((row) => ({ ...item(row.decisionId, row.provenanceRef, row.fingerprint, shown(store, "DECISION", row.decisionId, row.provenanceRef, row.fingerprint, row.recordStatus, row.currentness), row.limitations, row.applicabilityRef), statement: text(row.statement, "HIDDEN_CALCULATION_REJECTED"), aiRecommendation: false as const })));
  const changes = byId(bind(r7.changes).map((row) => ({ ...item(row.changeId, row.provenanceRef, row.fingerprint, shown(store, "CHANGE", row.changeId, row.provenanceRef, row.fingerprint, row.recordStatus, row.currentness), row.limitations, row.applicabilityRef), changeCategory: row.changeCategory, recalculated: false as const, redesigned: false as const })));
  const reassessments = byId(bind(r7.reassessments).map((row) => ({ ...item(row.reassessmentId, row.provenanceRef, row.fingerprint, shown(store, "REASSESSMENT", row.reassessmentId, row.provenanceRef, row.fingerprint, row.recordStatus, row.currentness), row.limitations, row.applicabilityRef, false), state: row.state })));
  const handoffs = byId(bind(store.r10.r9.r8.handoffs).map((row) => {
    const handoffCurrentness = shown(store, "HANDOFF", row.handoffId, row.provenanceRef, row.fingerprint, row.recordStatus, row.currentness);
    const futureContract = FUTURE.has(row.counterpartDiscipline);
    const complete = row.handoffStatus === "COMPLETE" && row.counterpart != null && !futureContract;
    return { ...item(row.handoffId, row.provenanceRef, row.fingerprint, handoffCurrentness, row.limitations, row.applicabilityRef), counterpartDiscipline: row.counterpartDiscipline, counterpart: row.counterpart, recordedHandoffStatus: row.handoffStatus, complete, futureContract, futureRuntimeStarted: false as const, counterpartFabricated: false as const, authorityTransferred: false as const };
  }));
  if (handoffs.some((row) => row.counterpart == null && row.complete)) fail("MISSING_COUNTERPART_EXPOSED_AS_COMPLETE");
  const reviews = byId(bind(store.r10.r9.requests).map((row) => ({ ...item(row.reviewRequestId, row.subjectRevision, row.fingerprint, shown(store, "REVIEW_REQUEST", row.reviewRequestId, row.subjectRevision, row.fingerprint, row.recordStatus, row.currentness), row.limitations, row.applicability), requestStatus: row.requestStatus, reviewCompleted: row.reviewCompleted })));
  const findings = byId(bind(store.r10.r9.findings).map((row) => ({ ...item(row.findingId, row.subjectRevision, row.fingerprint, shown(store, "FINDING", row.findingId, row.subjectRevision, row.fingerprint, row.recordStatus, row.currentness), row.limitations, row.applicability), disposition: row.disposition })));
  const completions = byId(bind(store.r10.r9.completions).map((row) => ({ ...item(row.completionId, row.subjectRevision, row.fingerprint, shown(store, "COMPLETION", row.completionId, row.subjectRevision, row.fingerprint, row.recordStatus, row.currentness), row.limitations, row.applicability), reviewCompleted: row.reviewCompleted })));
  const validations = byId(bind(store.r10.r9.validations).map((row) => ({ ...item(row.validationId, row.subjectRevision, row.fingerprint, shown(store, "VALIDATION", row.validationId, row.subjectRevision, row.fingerprint, row.recordStatus, row.currentness), row.limitations, row.applicability, row.engineeringValidated && row.validationState === "VALIDATED"), validationState: row.validationState })));
  const openReassessment = reassessments.some((row) => row.state === "REASSESSMENT_REQUIRED") || changes.some((row) => row.changeCategory === "REASSESSMENT_REQUIRED") || [...supports, ...validations, ...reassessments].some((row) => row.currentness === "REASSESSMENT_REQUIRED");
  const representedAsValidated = !openReassessment && currentness === "CURRENT" && validations.some((row) => row.currentness === "CURRENT" && row.validationState === "VALIDATED" && row.engineeringValidated);
  if (openReassessment && representedAsValidated) fail("REASSESSMENT_EXPOSED_AS_VALIDATED");
  if (validations.some((row) => row.currentness !== "CURRENT" && row.engineeringValidated)) fail("STALE_VALIDATION_EXPOSED_AS_CURRENT");
  const exposed = new Set<string>([object.objectId, ...systems, ...lines, ...services, ...conditions, ...specifications, ...components, ...connections, ...valves, ...specialties, ...routes, ...arrangements, ...fabrications, ...isometrics, ...spools, ...welds, ...stress, ...supports, ...inspections, ...nde, ...tests, ...requirements, ...assumptions, ...decisions, ...changes, ...reassessments, ...handoffs, ...reviews, ...findings, ...completions, ...validations].map((row) => typeof row === "string" ? row : row.subjectId));
  const lineage = store.r10.lineage.filter((row) => row.contextId === context.contextId && (exposed.has(row.source.subjectId) || exposed.has(row.target.subjectId))).map((row) => ({ lineageId: row.lineageId, relationshipType: row.relationshipType, sourceKind: row.source.subjectKind, sourceId: row.source.subjectId, sourceRevision: row.source.subjectRevision, sourceFingerprint: row.source.subjectFingerprint, targetKind: row.target.subjectKind, targetId: row.target.subjectId, targetRevision: row.target.subjectRevision, targetFingerprint: row.target.subjectFingerprint, fingerprint: row.fingerprint, inferred: false as const })).sort((left, right) => left.lineageId.localeCompare(right.lineageId));
  const copied = [...conditions, ...specifications, ...components, ...connections, ...valves, ...routes, ...supports, ...stress, ...nde, ...tests, ...requirements, ...assumptions, ...decisions, ...changes, ...reassessments, ...handoffs, ...reviews, ...validations].map((row) => row.limitations).filter((row) => row.trim().length > 0);
  const limitations = [D5_R11_STANDING_LIMITATION, ...copied].sort();
  if (currentness !== "CURRENT") limitations.push(`Piping currentness is ${currentness}.`);
  const projection = {
    IDENTITY: { objectId: object.objectId, objectType: object.objectType, exactRevision: object.provenanceRef, fingerprint: object.fingerprint, contextId: context.contextId, discipline: D5_DISCIPLINE },
    SYSTEM_OR_LINE_CONTEXT: { systems, lines },
    SERVICE: services,
    DESIGN_CONDITIONS: conditions,
    SPECIFICATIONS_OR_CLASSES: specifications,
    COMPONENT_CONTEXT: components,
    CONNECTION_CONTEXT: connections,
    VALVE_AND_SPECIALTY_CONTEXT: { valves, specialties },
    ROUTING_CONSTRAINTS: { routes, arrangements },
    FABRICATION_OR_TESTING_EVIDENCE: { fabrications, isometrics, spools, welds, inspections, nde, tests },
    SUPPORT_OR_RESTRAINT_CONTEXT: supports,
    STRESS_OR_FLEXIBILITY_EVIDENCE: stress,
    REQUIREMENTS_ASSUMPTIONS_DECISIONS_OR_CHANGE: { requirements, assumptions, decisions, changes, reassessments },
    INTERFACES: handoffs,
    REVIEW_VALIDATION: { reviews, findings, completions, validations },
    CURRENTNESS: currentness,
    LINEAGE: lineage,
    AUTHORITY: D5_CONTEXT_AUTHORITY,
    LIMITATIONS: limitations,
    PROVENANCE: provenanceRef,
    APPLICABILITY: object.objectId,
  };
  const fingerprint = fingerprintCanonical(projection);
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.contracts.find((row) => row.contractId === contractId);
  if (existing) return existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId && existing.exactRevision === object.provenanceRef ? existing : fail("SOURCE_CONTRACT_ALREADY_RECORDED");
  if (store.contracts.some((row) => row.recordStatus === "CURRENT" && row.objectId === object.objectId && row.exactRevision === object.provenanceRef && row.currentness === currentness && row.tenantId === actor.tenantId)) fail("DUPLICATE_SOURCE_CONTRACT_REJECTED");
  const before = snapshot(store);
  const record: D5R11SourceContract = Object.freeze({
    contractId,
    contextId: context.contextId,
    objectId: object.objectId,
    exactRevision: object.provenanceRef,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
    currentness,
    authority: D5_CONTEXT_AUTHORITY,
    authorityTransferred: false,
    d9OwnsPipingAuthority: false,
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
    fields: { ...projection, FINGERPRINT: fingerprint },
    provenanceRef,
    fingerprint,
    recordedBy: actor.actorId,
    recordedAt: store.now(),
    recordStatus: "CURRENT",
  });
  store.contracts.push(record);
  store.history.push({ historyId: `hist-${store.history.length + 1}`, contractId, action: "CREATED", fingerprint, recordedAt: store.now() });
  if (snapshot(store) !== before) fail("CONTENT_MUTATION_REJECTED");
  if (record.d9Started || record.authorityTransferred || record.counterpartFabricated || record.calculationPerformed || record.inferredLineage) fail("SOURCE_CONTRACT_BOUNDARY_BROKEN");
  return record;
}

export function repointPipingSourceContract(): never {
  return fail("AUTO_REPOINT_REJECTED");
}
export function inferPipingSourceLineage(): never {
  return fail("INFERRED_LINEAGE_REJECTED");
}
export function derivePipingSourceFact(): never {
  return fail("DERIVATION_NOT_IN_R11");
}
export function fabricatePipingCounterpart(): never {
  return fail("COUNTERPART_FABRICATION_REJECTED");
}
export function startD9FromPipingSource(): never {
  return fail("D9_NOT_STARTED");
}
export function calculateFromPipingSource(): never {
  return fail("CALCULATION_NOT_IN_R11");
}
export function transferPipingAuthorityFromSource(): never {
  return fail("AUTHORITY_TRANSFER_REJECTED");
}
export function reinterpretPipingEvidenceFromSource(): never {
  return fail("EVIDENCE_REINTERPRETATION_REJECTED");
}
