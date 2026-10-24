/**
 * EOS-D3-R11 D9 source contract.
 * Projects exact governed Geotechnical revisions for future D9 consumption.
 * Does not create engineering facts, transfer authority, or start D9.
 */
import {
  ADMIN_EQUALS_D3_GEOTECHNICAL_ENGINEERING_AUTHORITY as ARCH_ADMIN_EQUALS_D3,
  AI_EQUALS_D3_GEOTECHNICAL_ENGINEERING_AUTHORITY as ARCH_AI_EQUALS_D3,
  D2_REOPENED as ARCH_D2_REOPENED,
  D3_APPROVAL_RUNTIME_COUNT as ARCH_APPROVAL_COUNT,
  D3_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT as ARCH_AUTO_VALIDATION_COUNT,
  D3_BEARING_CAPACITY_RUNTIME_COUNT as ARCH_BEARING_COUNT,
  D3_CERTIFICATION_RUNTIME_COUNT as ARCH_CERTIFICATION_COUNT,
  D3_CURRENTNESS_STATES,
  D3_D9_RUNTIME_INTEGRATION_COUNT as ARCH_D9_INTEGRATION_COUNT,
  D3_D9_SOURCE_CONTRACT_FIELDS,
  D3_EARTH_PRESSURE_RUNTIME_COUNT as ARCH_EARTH_PRESSURE_COUNT,
  D3_EQUALS_D1_STRUCTURAL_AUTHORITY as ARCH_EQUALS_D1,
  D3_EQUALS_D2_CIVIL_AUTHORITY as ARCH_EQUALS_D2,
  D3_FOUNDATION_CALCULATION_RUNTIME_COUNT as ARCH_FOUNDATION_CALC_COUNT,
  D3_GROUND_IMPROVEMENT_DESIGN_RUNTIME_COUNT as ARCH_GROUND_IMPROVEMENT_COUNT,
  D3_IMPLEMENTATION_PHASES,
  D3_SETTLEMENT_CALCULATION_RUNTIME_COUNT as ARCH_SETTLEMENT_COUNT,
  D3_SILENT_REPOINTING_ALLOWED,
  D3_SLOPE_STABILITY_RUNTIME_COUNT as ARCH_SLOPE_COUNT,
  OBSERVATION_EQUALS_INTERPRETATION as ARCH_OBSERVATION_EQUALS_INTERPRETATION,
  VALIDATED_EQUALS_CERTIFIED as ARCH_VALIDATED_EQUALS_CERTIFIED,
  VALIDATED_EQUALS_CONFORMANT as ARCH_VALIDATED_EQUALS_CONFORMANT,
  VALIDATED_EQUALS_ENGINEERING_APPROVED as ARCH_VALIDATED_EQUALS_APPROVED,
} from "@rtb/types";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import { D1_STRUCTURAL_PACK_COMPLETE, D1N_REOPENED } from "../structural-systems/structural-pack-sequencing";
import {
  D3_CURRENTNESS_DIGITAL_THREAD_RUNTIME_READY as R10_THREAD_READY,
  D3_DISCIPLINE_INTERFACE_RUNTIME_READY as R8_INTERFACE_READY,
  D3_FIELD_LAB_TEST_RUNTIME_READY as R4_TEST_READY,
  D3_FOUNDATION_EXCAVATION_SLOPE_RUNTIME_READY as R6_CONTEXT_READY,
  D3_GEOTECHNICAL_IDENTITY_OBJECT_FOUNDATION_RUNTIME_READY as R1_IDENTITY_READY,
  D3_GEOTECHNICAL_PARAMETER_RUNTIME_READY as R5_PARAMETER_READY,
  D3_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY as R7_CHANGE_READY,
  D3_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_READY as R9_REVIEW_READY,
  D3_SITE_INVESTIGATION_EVIDENCE_RUNTIME_READY as R2_EVIDENCE_READY,
  D3_STRATIGRAPHY_GROUNDWATER_MATERIAL_RUNTIME_READY as R3_READY,
  type D3R10Store,
} from "./currentness-digital-thread";
import { D3_CONTEXT_AUTHORITY, D3_DISCIPLINE, type D3R1Actor } from "./identity-foundation";

export const D3_R11_STATUS = "D9_SOURCE_CONTRACT_IMPLEMENTED" as const;
export const D3_R11_MATURITY = "D9_SOURCE_CONTRACT_IMPLEMENTED" as const;
export const D3_R11_MATURITY_STATE = D3_R11_MATURITY;
export const D3_R11_CLOSEOUT_PATH = "docs/architecture/engineering-os/EOS_D3_R11_D9_SOURCE_CONTRACT_CLOSEOUT.md" as const;
export const D3_RUNTIME_STARTED = true as const;
export const D3_RUNTIME_COUNT = 11 as const;
export const D3_GEOTECHNICAL_IDENTITY_OBJECT_FOUNDATION_RUNTIME_READY = R1_IDENTITY_READY;
export const D3_SITE_INVESTIGATION_EVIDENCE_RUNTIME_READY = R2_EVIDENCE_READY;
export const D3_STRATIGRAPHY_GROUNDWATER_MATERIAL_RUNTIME_READY = R3_READY;
export const D3_FIELD_LAB_TEST_RUNTIME_READY = R4_TEST_READY;
export const D3_GEOTECHNICAL_PARAMETER_RUNTIME_READY = R5_PARAMETER_READY;
export const D3_FOUNDATION_EXCAVATION_SLOPE_RUNTIME_READY = R6_CONTEXT_READY;
export const D3_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY = R7_CHANGE_READY;
export const D3_DISCIPLINE_INTERFACE_RUNTIME_READY = R8_INTERFACE_READY;
export const D3_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_READY = R9_REVIEW_READY;
export const D3_CURRENTNESS_DIGITAL_THREAD_RUNTIME_READY = R10_THREAD_READY;
export const D3_D9_SOURCE_CONTRACT_RUNTIME_READY = true as const;
export const D3_D9_SOURCE_CONTRACT_RUNTIME_IMPLEMENTED = true as const;
export const D3_D9_SOURCE_CONTRACT_RUNTIME_COUNT = 1 as const;
export const D3_REUSES_CANONICAL_D9_SOURCE_CONTRACT_GOVERNANCE = true as const;
export const PARALLEL_D3_D9_SOURCE_CONTRACT_FRAMEWORK_CREATED = false as const;
export const D3_R11_SOURCE_CONTRACT_FIELDS = D3_D9_SOURCE_CONTRACT_FIELDS;
export const EXACT_D3_D9_SOURCE_REVISION_REQUIRED = true as const;
export const FLOATING_D3_D9_SOURCE_REFERENCE_ALLOWED = false as const;
export const D3_D9_SOURCE_AUTO_REPOINTED = D3_SILENT_REPOINTING_ALLOWED;
export const D3_D9_IDENTITY_METADATA_EXPOSED = true as const;
export const D3_D9_INVESTIGATION_EVIDENCE_METADATA_EXPOSED = true as const;
export const D3_D9_STRATIGRAPHY_METADATA_EXPOSED = true as const;
export const D3_D9_MATERIAL_CLASSIFICATION_METADATA_EXPOSED = true as const;
export const D3_D9_GROUNDWATER_METADATA_EXPOSED = true as const;
export const D3_D9_FIELD_LAB_TEST_METADATA_EXPOSED = true as const;
export const D3_D9_PARAMETER_METADATA_EXPOSED = true as const;
export const D3_D9_FOUNDATION_EXCAVATION_SLOPE_METADATA_EXPOSED = true as const;
export const D3_D9_REQUIREMENT_ASSUMPTION_DECISION_METADATA_EXPOSED = true as const;
export const D3_D9_CHANGE_REASSESSMENT_METADATA_EXPOSED = true as const;
export const D3_D9_INTERFACE_HANDOFF_METADATA_EXPOSED = true as const;
export const D3_D9_REVIEW_VALIDATION_METADATA_EXPOSED = true as const;
export const D3_D9_CURRENTNESS_LINEAGE_METADATA_EXPOSED = true as const;
export const D3_D9_SOURCE_PRESERVES_TRUTH_CLASSIFICATION = true as const;
export const OBSERVATION_EQUALS_INTERPRETATION = ARCH_OBSERVATION_EQUALS_INTERPRETATION;
export const TEST_RESULT_EQUALS_ENGINEERING_PARAMETER = false as const;
export const ENGINEERING_PARAMETER_EQUALS_VALIDATED_PARAMETER = false as const;
export const RECOMMENDATION_EQUALS_APPROVAL = false as const;
export const D3_D9_SOURCE_AUTHORITY_EXPLICIT = true as const;
export const D3_D9_SOURCE_CONTRACT_TRANSFERS_GEOTECHNICAL_AUTHORITY = false as const;
export const AI_EQUALS_D3_GEOTECHNICAL_ENGINEERING_AUTHORITY = ARCH_AI_EQUALS_D3;
export const ADMIN_EQUALS_D3_GEOTECHNICAL_ENGINEERING_AUTHORITY = ARCH_ADMIN_EQUALS_D3;
export const D3_D9_SOURCE_CURRENTNESS_EXPLICIT = true as const;
export const STALE_D3_SOURCE_EXPOSED_AS_CURRENT = false as const;
export const SUPERSEDED_D3_SOURCE_EXPOSED_AS_CURRENT = false as const;
export const REASSESSMENT_REQUIRED_D3_SOURCE_EXPOSED_AS_VALIDATED = false as const;
export const D3_D9_SOURCE_REVIEW_STATE_EXPLICIT = true as const;
export const D3_D9_SOURCE_VALIDATION_STATE_EXPLICIT = true as const;
export const REVIEWED_EQUALS_VALIDATED = false as const;
export const VALIDATED_EQUALS_CONFORMANT = ARCH_VALIDATED_EQUALS_CONFORMANT;
export const VALIDATED_EQUALS_APPROVED = ARCH_VALIDATED_EQUALS_APPROVED;
export const VALIDATED_EQUALS_CERTIFIED = ARCH_VALIDATED_EQUALS_CERTIFIED;
export const D3_D9_SOURCE_LIMITATIONS_EXPLICIT = true as const;
export const D3_D9_SOURCE_LIMITATIONS_PRESERVED = true as const;
export const D3_D9_SOURCE_PROVENANCE_REQUIRED = true as const;
export const D3_D9_SOURCE_PROVENANCE_PRESERVED = true as const;
export const D3_R10_LINEAGE_REUSED = true as const;
export const D3_D9_SOURCE_LINEAGE_EXPLICIT = true as const;
export const INFERRED_D3_D9_LINEAGE_ALLOWED = false as const;
export const D3_D9_SOURCE_LINEAGE_AUTO_REPOINTED = D3_SILENT_REPOINTING_ALLOWED;
export const CANONICAL_FINGERPRINT_REUSED = true as const;
export const SECOND_FINGERPRINT_ALGORITHM_CREATED = false as const;
export const D3_D9_SOURCE_FINGERPRINT_EXPOSED = true as const;
export const D3_R8_INTERFACE_METADATA_REUSED = true as const;
export const MISSING_COUNTERPART_AUTO_FABRICATED = false as const;
export const MISSING_COUNTERPART_EQUALS_INTERFACE_COMPLETE = false as const;
export const D3_D9_SOURCE_CONTRACT_FABRICATES_COUNTERPART_DATA = false as const;
export const D3_D9_SOURCE_CONTRACT_TRANSFERS_D1_AUTHORITY = false as const;
export const D3_D9_SOURCE_CONTRACT_TRANSFERS_D2_AUTHORITY = false as const;
export const D3_EQUALS_D1_STRUCTURAL_AUTHORITY = ARCH_EQUALS_D1;
export const D3_EQUALS_D2_CIVIL_AUTHORITY = ARCH_EQUALS_D2;
export const D3_D9_SOURCE_CONTRACT_CREATES_NEW_ENGINEERING_FACT = false as const;
export const D3_D9_SOURCE_CONTRACT_DERIVES_NEW_PARAMETER = false as const;
export const D3_D9_SOURCE_CONTRACT_GENERATES_NEW_RECOMMENDATION = false as const;
export const D3_D9_SOURCE_CONTRACT_PERFORMS_ENGINEERING_CALCULATION = false as const;
export const D3_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT = 0 as const;
export const D3_CROSS_DISCIPLINE_CONFLICT_DETECTION_RUNTIME_COUNT = 0 as const;
export const D3_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT = 0 as const;
export const D3_CROSS_DISCIPLINE_RECOMMENDATION_RUNTIME_COUNT = 0 as const;
export const D9_RUNTIME_STARTED = false as const;
export const D9_RUNTIME_COUNT = 0 as const;
export const D3_D9_RUNTIME_INTEGRATION_COUNT = ARCH_D9_INTEGRATION_COUNT;
export const D3_D9_SOURCE_CONTRACT_EXISTS_EQUALS_D9_STARTED = false as const;
export const D3_AUTOMATIC_PARAMETER_DERIVATION_RUNTIME_COUNT = 0 as const;
export const D3_FOUNDATION_CALCULATION_RUNTIME_COUNT = ARCH_FOUNDATION_CALC_COUNT;
export const D3_BEARING_CAPACITY_RUNTIME_COUNT = ARCH_BEARING_COUNT;
export const D3_SETTLEMENT_CALCULATION_RUNTIME_COUNT = ARCH_SETTLEMENT_COUNT;
export const D3_PILE_CAPACITY_RUNTIME_COUNT = 0 as const;
export const D3_SLOPE_STABILITY_RUNTIME_COUNT = ARCH_SLOPE_COUNT;
export const D3_EARTH_PRESSURE_RUNTIME_COUNT = ARCH_EARTH_PRESSURE_COUNT;
export const D3_RETAINING_SYSTEM_ANALYSIS_RUNTIME_COUNT = 0 as const;
export const D3_EXCAVATION_SUPPORT_DESIGN_RUNTIME_COUNT = 0 as const;
export const D3_GROUND_IMPROVEMENT_DESIGN_RUNTIME_COUNT = ARCH_GROUND_IMPROVEMENT_COUNT;
export const D3_AUTOMATIC_REDESIGN_RUNTIME_COUNT = 0 as const;
export const D3_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT = ARCH_AUTO_VALIDATION_COUNT;
export const D3_CONFORMANCE_DETERMINATION_RUNTIME_COUNT = 0 as const;
export const D3_APPROVAL_RUNTIME_COUNT = ARCH_APPROVAL_COUNT;
export const D3_CERTIFICATION_RUNTIME_COUNT = ARCH_CERTIFICATION_COUNT;
export const D3_CONFORMANCE_CERTIFICATION_RUNTIME_COUNT = 0 as const;
export const SILENT_D3_R11_MUTATION_ALLOWED = false as const;
export const D3_R11_HISTORY_PRESERVED = true as const;
export const TENANT_WORKSPACE_PROJECT_D3_R11_SCOPE_ENFORCED = true as const;
export const D3_R11_DUPLICATE_GOVERNANCE_IMPLEMENTED = true as const;
export const D3_R11_REPLAY_PROTECTION_IMPLEMENTED = true as const;
export const D3_R11_SPOOFING_PROTECTION_IMPLEMENTED = true as const;
export const D4_RUNTIME_STARTED = false as const;
export const D5_RUNTIME_STARTED = false as const;
export const D6_RUNTIME_STARTED = false as const;
export const D7_RUNTIME_STARTED = false as const;
export const D8_RUNTIME_STARTED = false as const;
export { D1_STRUCTURAL_PACK_COMPLETE, D1N_REOPENED };
export const D2_REOPENED = ARCH_D2_REOPENED;
export const DATABASE_SCHEMA_CHANGED = false as const;
export const NEW_DEPENDENCY_ADDED = false as const;
export const UNAUTHORIZED_D1_PACK_COMPLETION = false as const;
export const UNAUTHORIZED_D2_REOPEN = false as const;
export const UNAUTHORIZED_D3_R12_PROMOTION = false as const;
export const UNAUTHORIZED_D4_D8_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_D9_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_CROSS_DISCIPLINE_REASONING_PROMOTION = false as const;
export const UNAUTHORIZED_D3_VALIDATION_PROMOTION = false as const;
export const UNAUTHORIZED_D3_CONFORMANCE_PROMOTION = false as const;
export const UNAUTHORIZED_D3_APPROVAL_PROMOTION = false as const;
export const UNAUTHORIZED_D3_CERTIFICATION_PROMOTION = false as const;
export const UNAUTHORIZED_GA_PROMOTION = false as const;
export const UNAUTHORIZED_PRODUCT_CLAIM = false as const;
export const D3_R12_CANONICAL_PHASE = D3_IMPLEMENTATION_PHASES[11];
export const D3_R12_PHASE_TYPE = "GEOTECHNICAL_BOUNDED_CLOSEOUT" as const;
export const D3_R12_CANONICAL_SCOPE = "Perform bounded D3 track closeout across R1-R11. Verify architecture-to-runtime traceability, exact readiness states, discipline boundaries, D9 source-contract integrity, security/release posture and unresolved limitations. Do not add substantive D3 runtime, perform engineering calculations, close D1 debt, start D4-D9 runtime, or claim project/engineering validation, certification, conformance or GA readiness." as const;
export const D3_R12_STARTED = false as const;
export const D3_R11_READY_FOR_NEXT_PHASE = true as const;
export const D3_R11_NEXT_PHASE = D3_R12_CANONICAL_PHASE;
export const D3_R11_NEXT_PHASE_TYPE = D3_R12_PHASE_TYPE;
export const D3_R11_CANONICAL_NEXT_PHASE = D3_R12_CANONICAL_PHASE;
export const D3_R11_CANONICAL_NEXT_PHASE_SCOPE = D3_R12_CANONICAL_SCOPE;
export const D3_R11_BLOCKER = "NONE" as const;
export const D3_R11_MACHINE_READABLE_ROADMAP_UPDATED = true as const;
export const D3_R11_STANDING_LIMITATION = "This source contract projects governed Geotechnical facts for future D9 consumption. It does not create engineering facts, transfer Geotechnical, Structural, or Civil authority, start D9, or treat review or validation as conformance, approval, or certification." as const;

const FLOATING = new Set(["latest", "current", "newest", "head", "active", "active model"]);
const INFERRED = new Set(["inferred", "unknown", "auto", "default", "nearby", "similar"]);
type Currentness = (typeof D3_CURRENTNESS_STATES)[number];

type Prohibited = {
  infer?: boolean;
  proximity?: boolean;
  sameBorehole?: boolean;
  sameMaterial?: boolean;
  similarText?: boolean;
  semantic?: boolean;
  sharedDocument?: boolean;
  repoint?: boolean;
  derive?: boolean;
  generateRecommendation?: boolean;
  recalculate?: boolean;
  fabricateCounterpart?: boolean;
  resolveConflict?: boolean;
  transferAuthority?: boolean;
  validate?: boolean;
  approve?: boolean;
  certify?: boolean;
  conform?: boolean;
  d4Start?: boolean;
  d9Reasoning?: boolean;
};

export type D3R11Actor = D3R1Actor & { actorKind?: string };
export type D3R11SourceContractInput = Prohibited & {
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
  truthClass: "OBSERVATION" | "INTERPRETATION" | "TEST_RESULT" | "PARAMETER" | "RECOMMENDATION" | "REQUIREMENT" | "ASSUMPTION" | "DECISION" | "CHANGE" | "INTERFACE" | "REVIEW" | "VALIDATION";
  limitations: string;
  authority: typeof D3_CONTEXT_AUTHORITY;
  engineeringValidated: boolean;
  conformant: false;
  approved: false;
  certified: false;
};

export type D3R11SourceContract = {
  contractId: string;
  contextId: string;
  objectId: string;
  exactRevision: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  currentness: Currentness;
  authority: typeof D3_CONTEXT_AUTHORITY;
  authorityTransferred: false;
  d1AuthorityTransferred: false;
  d2AuthorityTransferred: false;
  d9OwnsGeotechnicalAuthority: false;
  engineeringDerived: false;
  parameterDerived: false;
  recommendationGenerated: false;
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

export type D3R11History = { historyId: string; contractId: string; action: "CREATED"; fingerprint: string; recordedAt: string };
export type D3R11Store = { r10: D3R10Store; now: () => string; contracts: D3R11SourceContract[]; history: D3R11History[] };

function fail(code: string): never {
  throw new Error(code);
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
  return (D3_CURRENTNESS_STATES as readonly string[]).includes(value);
}

function assertProhibited(input: Prohibited): void {
  if (input.infer === true || input.proximity === true || input.sameBorehole === true || input.sameMaterial === true || input.similarText === true || input.semantic === true || input.sharedDocument === true) fail("INFERRED_LINEAGE_REJECTED");
  if (input.repoint === true) fail("AUTO_REPOINT_REJECTED");
  if (input.derive === true) fail("PARAMETER_DERIVATION_NOT_IN_R11");
  if (input.generateRecommendation === true) fail("RECOMMENDATION_GENERATION_NOT_IN_R11");
  if (input.recalculate === true) fail("CALCULATION_NOT_IN_R11");
  if (input.fabricateCounterpart === true) fail("COUNTERPART_FABRICATION_REJECTED");
  if (input.resolveConflict === true) fail("CONFLICT_RESOLUTION_NOT_IN_R11");
  if (input.transferAuthority === true) fail("AUTHORITY_TRANSFER_REJECTED");
  if (input.validate === true) fail("VALIDATION_NOT_IN_R11");
  if (input.approve === true) fail("APPROVAL_NOT_IN_R11");
  if (input.certify === true) fail("CERTIFICATION_NOT_IN_R11");
  if (input.conform === true) fail("CONFORMANCE_NOT_IN_R11");
  if (input.d4Start === true) fail("D4_NOT_STARTED");
  if (input.d9Reasoning === true) fail("D9_NOT_STARTED");
}

function assertScope(actor: D3R11Actor, input: { tenantId?: string; workspaceId?: string; projectId?: string }): void {
  if (!actor.actorId.trim() || !actor.tenantId.trim() || !actor.workspaceId.trim() || !actor.projectId.trim()) fail("SCOPE_REQUIRED");
  if (input.tenantId != null && input.tenantId !== actor.tenantId) fail("CROSS_TENANT_OPERATION");
  if (input.workspaceId != null && input.workspaceId !== actor.workspaceId) fail("CROSS_WORKSPACE_OPERATION");
  if (input.projectId != null && input.projectId !== actor.projectId) fail("CROSS_PROJECT_OPERATION");
}

function assertRecorder(actor: D3R11Actor): void {
  const ai = blockedParty(actor.actorId) || blockedParty(actor.authority) || actor.authority === "AI_ASSISTANT" || actor.actorKind === "ai";
  if (ai) fail("AI_NOT_GEOTECHNICAL_AUTHORITY");
  if (actor.authority === "ADMINISTRATOR" || actor.authority === "ADMIN") fail("ADMIN_NOT_GEOTECHNICAL_AUTHORITY");
  if (actor.authority !== D3_CONTEXT_AUTHORITY) fail("UNAUTHORIZED");
}

function root(store: D3R11Store) {
  return store.r10.r9.r8.r7.r6.r5.r4.r3.r2.r1;
}

function latestMark(store: D3R11Store, kind: string, subjectId: string, subjectRevision: string, subjectFingerprint: string): Currentness | null {
  const marks = store.r10.marks.filter((row) => row.subject.subjectKind === kind && row.subject.subjectId === subjectId && row.subject.subjectRevision === subjectRevision && row.subject.subjectFingerprint === subjectFingerprint);
  return marks.length === 0 ? null : marks[marks.length - 1].currentness;
}

function shown(store: D3R11Store, kind: string, subjectId: string, revision: string, fingerprint: string, recordStatus: string, cited: Currentness): Currentness {
  const mark = latestMark(store, kind, subjectId, revision, fingerprint);
  if (mark) return mark;
  return recordStatus === "SUPERSEDED" ? "SUPERSEDED" : cited;
}

function scopeIds(store: D3R11Store, objectId: string): Set<string> {
  const ids = new Set<string>([objectId]);
  let grew = true;
  while (grew) {
    grew = false;
    for (const row of root(store).objects) {
      if (row.parentObjectId && ids.has(row.parentObjectId) && !ids.has(row.objectId)) {
        ids.add(row.objectId);
        grew = true;
      }
    }
  }
  return ids;
}

function item(subjectId: string, exactRevision: string, fingerprint: string, currentness: Currentness, truthClass: Item["truthClass"], limitations: string, engineeringValidated = false): Item {
  return { subjectId, exactRevision, fingerprint, currentness, truthClass, limitations, authority: D3_CONTEXT_AUTHORITY, engineeringValidated, conformant: false, approved: false, certified: false };
}

function snapshot(store: D3R11Store): string {
  const objects = root(store).objects.map((row) => `${row.objectId}:${row.provenanceRef}:${row.fingerprint}`).join("|");
  const evidence = store.r10.r9.r8.r7.r6.r5.r4.r3.r2.evidence.map((row) => `${row.evidenceReferenceId}:${row.provenanceRef}:${row.fingerprint}`).join("|");
  const parameters = store.r10.r9.r8.r7.r6.r5.parameters.map((row) => `${row.parameterId}:${row.value}:${row.fingerprint}`).join("|");
  const recommendations = store.r10.r9.r8.r7.r6.contexts.map((row) => `${row.contextRecordId}:${row.recommendationText}:${row.fingerprint}`).join("|");
  const handoffs = store.r10.r9.r8.handoffs.map((row) => `${row.handoffId}:${row.sourceRevision}:${row.fingerprint}:${row.counterpart == null}`).join("|");
  const validations = store.r10.r9.validations.map((row) => `${row.validationId}:${row.subjectRevision}:${row.engineeringValidated}`).join("|");
  return `${objects}#${evidence}#${parameters}#${recommendations}#${handoffs}#${validations}`;
}

export function createD3R11Store(r10: D3R10Store, now: () => string = () => r10.now()): D3R11Store {
  return { r10, now, contracts: [], history: [] };
}

export function recordGeotechnicalSourceContract(store: D3R11Store, actor: D3R11Actor, input: D3R11SourceContractInput): D3R11SourceContract {
  assertRecorder(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const cited = input.citedCurrentness.trim();
  if (!isCurrentness(cited)) fail("CURRENTNESS_INVALID");
  const contextId = explicit(input.contextId, "R1_CONTEXT_REQUIRED");
  const context = root(store).contexts.find((row) => row.contextId === contextId);
  if (!context || context.tenantId !== actor.tenantId || context.workspaceId !== actor.workspaceId || context.projectId !== actor.projectId) fail("R1_CONTEXT_NOT_FOUND");
  if (context.discipline !== D3_DISCIPLINE) fail("DISCIPLINE_NOT_GEOTECHNICAL");
  const objectId = explicit(input.objectId, "OBJECT_REFERENCE_REQUIRED");
  const sourceRevision = explicit(input.sourceRevision, "SUBJECT_REVISION_REQUIRED");
  const object = root(store).objects.find((row) => row.objectId === objectId && row.contextId === context.contextId && row.tenantId === actor.tenantId);
  if (!object || object.provenanceRef !== sourceRevision) fail("SUBJECT_REVISION_MISMATCH");
  const currentness = shown(store, "OBJECT", object.objectId, object.provenanceRef, object.fingerprint, object.recordStatus, object.currentness === "SUPERSEDED" ? "SUPERSEDED" : "CURRENT");
  if (cited === "CURRENT" && currentness === "STALE") fail("STALE_EXPOSED_AS_CURRENT");
  if (cited === "CURRENT" && currentness === "SUPERSEDED") fail("SUPERSEDED_EXPOSED_AS_CURRENT");
  if (cited !== currentness) fail("CURRENTNESS_MISMATCH");
  const provenanceRef = explicit(input.provenanceRef, "MISSING_PROVENANCE");
  const contractId = explicit(input.contractId, "CONTRACT_ID_REQUIRED");
  const ids = scopeIds(store, object.objectId);
  const inScope = (id: string) => ids.has(id);
  const r2 = store.r10.r9.r8.r7.r6.r5.r4.r3.r2;
  const r3 = store.r10.r9.r8.r7.r6.r5.r4.r3;
  const r4 = store.r10.r9.r8.r7.r6.r5.r4;
  const r5 = store.r10.r9.r8.r7.r6.r5;
  const r6 = store.r10.r9.r8.r7.r6;
  const r7 = store.r10.r9.r8.r7;
  const evidence = r2.evidence.filter((row) => row.contextId === context.contextId && inScope(row.objectId)).map((row) => ({ ...item(row.evidenceReferenceId, row.provenanceRef, row.fingerprint, shown(store, "EVIDENCE", row.evidenceReferenceId, row.provenanceRef, row.fingerprint, row.recordStatus, row.citedCurrentness), "OBSERVATION", ""), evidenceKind: row.evidenceKind, sourceRevision: row.sourceRevision })).sort((a, b) => a.subjectId.localeCompare(b.subjectId));
  const investigation = {
    programs: r2.programs.filter((row) => row.contextId === context.contextId && inScope(row.objectId)).map((row) => item(row.investigationProgramId, row.provenanceRef, row.fingerprint, shown(store, "OBJECT", row.objectId, row.provenanceRef, row.fingerprint, row.recordStatus, row.citedCurrentness), "OBSERVATION", "")),
    locations: r2.locations.filter((row) => row.contextId === context.contextId && inScope(row.objectId)).map((row) => item(row.locationContextId, row.provenanceRef, row.fingerprint, row.citedCurrentness, "OBSERVATION", "")),
    boreholes: r2.boreholeEvidence.filter((row) => row.contextId === context.contextId && inScope(row.objectId)).map((row) => item(row.boreholeEvidenceId, row.provenanceRef, row.fingerprint, row.citedCurrentness, "OBSERVATION", "")),
    testPits: r2.testPitEvidence.filter((row) => row.contextId === context.contextId && inScope(row.objectId)).map((row) => item(row.testPitEvidenceId, row.provenanceRef, row.fingerprint, row.citedCurrentness, "OBSERVATION", "")),
    evidence,
  };
  const stratigraphy = r3.stratigraphy.filter((row) => row.contextId === context.contextId && inScope(row.objectId)).map((row) => ({ ...item(row.stratigraphyId, row.provenanceRef, row.fingerprint, shown(store, "STRATIGRAPHY", row.stratigraphyId, row.provenanceRef, row.fingerprint, row.recordStatus, row.citedCurrentness), "INTERPRETATION", row.limitations), depthInterval: row.depthInterval, materialDescription: row.materialDescription, rawEvidence: false })).sort((a, b) => a.subjectId.localeCompare(b.subjectId));
  const materials = r3.materials.filter((row) => row.contextId === context.contextId && inScope(row.objectId)).map((row) => ({ ...item(row.materialClassificationId, row.provenanceRef, row.fingerprint, shown(store, "MATERIAL", row.materialClassificationId, row.provenanceRef, row.fingerprint, row.recordStatus, row.citedCurrentness), "INTERPRETATION", row.limitations), classificationResult: row.classificationResult, parameterSet: false })).sort((a, b) => a.subjectId.localeCompare(b.subjectId));
  const groundwater = r3.groundwater.filter((row) => row.contextId === context.contextId && inScope(row.objectId)).map((row) => ({ ...item(row.groundwaterContextId, row.provenanceRef, row.fingerprint, shown(store, "GROUNDWATER", row.groundwaterContextId, row.provenanceRef, row.fingerprint, row.recordStatus, row.citedCurrentness), "INTERPRETATION", row.limitations), observedWaterLevel: row.observedWaterLevel, designGroundwaterLevel: false })).sort((a, b) => a.subjectId.localeCompare(b.subjectId));
  const fieldTests = r4.fieldTests.filter((row) => row.contextId === context.contextId && inScope(row.objectId)).map((row) => ({ ...item(row.fieldTestId, row.provenanceRef, row.fingerprint, shown(store, "FIELD_TEST", row.fieldTestId, row.provenanceRef, row.fingerprint, row.recordStatus, row.citedCurrentness), "TEST_RESULT", row.limitations), measuredResult: row.measuredResult, unit: row.unit, engineeringParameter: false })).sort((a, b) => a.subjectId.localeCompare(b.subjectId));
  const labTests = r4.labTests.filter((row) => row.contextId === context.contextId && inScope(row.objectId)).map((row) => ({ ...item(row.labTestId, row.provenanceRef, row.fingerprint, shown(store, "LAB_TEST", row.labTestId, row.provenanceRef, row.fingerprint, row.recordStatus, row.citedCurrentness), "TEST_RESULT", row.limitations), measuredResult: row.measuredResult, unit: row.unit, engineeringParameter: false })).sort((a, b) => a.subjectId.localeCompare(b.subjectId));
  const parameters = r5.parameters.filter((row) => row.contextId === context.contextId && inScope(row.objectId)).map((row) => ({ ...item(row.parameterId, row.provenanceRef, row.fingerprint, shown(store, "PARAMETER", row.parameterId, row.provenanceRef, row.fingerprint, row.recordStatus, row.citedCurrentness), "PARAMETER", row.limitations), value: row.value, unit: row.unit, validatedDesignParameter: false, testResult: false })).sort((a, b) => a.subjectId.localeCompare(b.subjectId));
  const foundation = r6.contexts.filter((row) => row.contextId === context.contextId && inScope(row.objectId)).map((row) => ({ ...item(row.contextRecordId, row.provenanceRef, row.fingerprint, shown(store, "RECOMMENDATION", row.contextRecordId, row.provenanceRef, row.fingerprint, row.recordStatus, row.citedCurrentness), "RECOMMENDATION", row.limitations), contextKind: row.contextKind, recommendationText: row.recommendationText, approved: false as const })).sort((a, b) => a.subjectId.localeCompare(b.subjectId));
  const touches = (rowObjectId: string, affected: readonly string[]) => inScope(rowObjectId) || affected.some((id) => inScope(id));
  const requirements = r7.requirements.filter((row) => row.contextId === context.contextId && touches(row.objectId, row.affectedObjectIds)).map((row) => ({ ...item(row.requirementContextId, row.sourceRevision, row.fingerprint, shown(store, "REQUIREMENT", row.requirementContextId, row.sourceRevision, row.fingerprint, row.recordStatus, row.citedCurrentness), "REQUIREMENT", row.limitations), requirementText: row.requirementText, requirementSatisfied: false as const })).sort((a, b) => a.subjectId.localeCompare(b.subjectId));
  const assumptions = r7.assumptions.filter((row) => row.contextId === context.contextId && touches(row.objectId, row.affectedObjectIds)).map((row) => ({ ...item(row.assumptionContextId, row.provenanceRef, row.fingerprint, shown(store, "ASSUMPTION", row.assumptionContextId, row.provenanceRef, row.fingerprint, row.recordStatus, row.citedCurrentness), "ASSUMPTION", row.limitations), statement: row.statement, validationStatus: "unvalidated" as const })).sort((a, b) => a.subjectId.localeCompare(b.subjectId));
  const decisions = r7.decisions.filter((row) => row.contextId === context.contextId && touches(row.objectId, row.affectedObjectIds)).map((row) => ({ ...item(row.decisionContextId, row.provenanceRef, row.fingerprint, shown(store, "DECISION", row.decisionContextId, row.provenanceRef, row.fingerprint, row.recordStatus, row.citedCurrentness), "DECISION", row.limitations), statement: row.statement, engineeringApproved: false as const })).sort((a, b) => a.subjectId.localeCompare(b.subjectId));
  const changes = r7.changes.filter((row) => row.contextId === context.contextId && (inScope(row.objectId) || inScope(row.changedObjectId))).map((row) => ({ ...item(row.changeContextId, row.provenanceRef, row.fingerprint, shown(store, "CHANGE", row.changeContextId, row.provenanceRef, row.fingerprint, row.recordStatus, row.citedCurrentness), "CHANGE", row.limitations), changeCategory: row.changeCategory, reassessmentRequired: row.reassessmentRequired, engineeringInvalid: false as const, automaticRecalculation: false as const })).sort((a, b) => a.subjectId.localeCompare(b.subjectId));
  const handoffs = store.r10.r9.r8.handoffs.filter((row) => row.contextId === context.contextId && inScope(row.sourceObjectId) && row.sourceRevision === object.provenanceRef && row.sourceObjectFingerprint === object.fingerprint).map((row) => {
    const handoffCurrentness = shown(store, "HANDOFF", row.handoffId, row.sourceRevision, row.fingerprint, row.recordStatus, row.citedCurrentness);
    const complete = row.handoffStatus === "COMPLETE" && row.counterpart != null;
    return { ...item(row.handoffId, row.sourceRevision, row.fingerprint, handoffCurrentness, "INTERFACE", row.limitations), counterpartDiscipline: row.counterpartDiscipline, counterpart: row.counterpart, recordedHandoffStatus: row.handoffStatus, complete, counterpartFabricated: false as const, authorityTransferred: false as const };
  }).sort((a, b) => a.subjectId.localeCompare(b.subjectId));
  if (handoffs.some((row) => row.counterpart == null && row.complete)) fail("MISSING_COUNTERPART_EXPOSED_AS_COMPLETE");
  const reviews = store.r10.r9.requests.filter((row) => row.contextId === context.contextId && row.subjectKind === "OBJECT" && row.subjectId === object.objectId && row.subjectRevision === object.provenanceRef).map((row) => ({ ...item(row.reviewRequestId, row.subjectRevision, row.fingerprint, shown(store, "REVIEW_REQUEST", row.reviewRequestId, row.subjectRevision, row.fingerprint, row.recordStatus, row.citedCurrentness), "REVIEW", row.limitations), requestStatus: row.requestStatus, reviewCompleted: false as const })).sort((a, b) => a.subjectId.localeCompare(b.subjectId));
  const validations = store.r10.r9.validations.filter((row) => row.contextId === context.contextId && row.subjectKind === "OBJECT" && row.subjectId === object.objectId && row.subjectRevision === object.provenanceRef).map((row) => ({ ...item(row.validationId, row.subjectRevision, row.fingerprint, shown(store, "VALIDATION", row.validationId, row.subjectRevision, row.fingerprint, row.recordStatus, row.citedCurrentness), "VALIDATION", row.limitations, currentness === "CURRENT" && row.engineeringValidated), validationState: row.validationState })).sort((a, b) => a.subjectId.localeCompare(b.subjectId));
  const representedAsValidated = currentness === "CURRENT" && validations.some((row) => row.validationState === "VALIDATED" && row.engineeringValidated);
  if (currentness === "REASSESSMENT_REQUIRED" && representedAsValidated) fail("REASSESSMENT_EXPOSED_AS_VALIDATED");
  const lineage = store.r10.lineage.filter((row) => row.contextId === context.contextId && ((row.source.subjectKind === "OBJECT" && row.source.subjectId === object.objectId && row.source.subjectRevision === object.provenanceRef) || (row.target.subjectKind === "OBJECT" && row.target.subjectId === object.objectId && row.target.subjectRevision === object.provenanceRef) || (row.source.subjectKind === "EVIDENCE" && evidence.some((entry) => entry.subjectId === row.source.subjectId)) || (row.target.subjectKind === "EVIDENCE" && evidence.some((entry) => entry.subjectId === row.target.subjectId)))).map((row) => ({ lineageId: row.lineageId, relationshipType: row.relationshipType, sourceRevision: row.source.subjectRevision, targetRevision: row.target.subjectRevision, fingerprint: row.fingerprint, inferred: false as const, engineeringValidated: false as const })).sort((a, b) => a.lineageId.localeCompare(b.lineageId));
  const copied = [...stratigraphy, ...materials, ...groundwater, ...fieldTests, ...labTests, ...parameters, ...foundation, ...requirements, ...assumptions, ...decisions, ...changes, ...handoffs, ...reviews, ...validations].map((row) => row.limitations).filter((row) => row.trim().length > 0);
  const limitations = [D3_R11_STANDING_LIMITATION, ...copied].sort();
  if (currentness !== "CURRENT") limitations.push(`Geotechnical currentness is ${currentness}.`);
  const projection = {
    OBJECT_IDENTITY: { objectId: object.objectId, contextId: context.contextId, discipline: D3_DISCIPLINE },
    OBJECT_TYPE: object.objectType,
    EXACT_REVISION: object.provenanceRef,
    LIFECYCLE: object.citedLifecycleStage,
    CURRENTNESS: currentness,
    PROVENANCE: provenanceRef,
    AUTHORITY: D3_CONTEXT_AUTHORITY,
    ASSUMPTIONS: assumptions,
    REQUIREMENTS: requirements,
    DECISIONS: decisions,
    EVIDENCE: evidence,
    GEOTECHNICAL_PARAMETERS: parameters,
    INVESTIGATION_CONTEXT: investigation,
    STRATIGRAPHY: stratigraphy,
    MATERIAL_CLASSIFICATION: materials,
    GROUNDWATER: groundwater,
    FIELD_LAB_TESTS: { fieldTests, labTests },
    FOUNDATION_EXCAVATION_SLOPE: foundation,
    CHANGES: changes,
    D1_INTERFACE_RECORDS: handoffs.filter((row) => row.counterpartDiscipline === "structural"),
    D2_INTERFACE_RECORDS: handoffs.filter((row) => row.counterpartDiscipline === "civil"),
    INTERFACE_HANDOFFS: handoffs,
    LIMITATIONS: limitations,
    LINEAGE: lineage,
    REVIEW_VALIDATION_STATE: { reviews, validations },
  };
  const fingerprint = fingerprintCanonical(projection);
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.contracts.find((row) => row.contractId === contractId);
  if (existing) {
    if (existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId && existing.exactRevision === object.provenanceRef) return existing;
    fail("DUPLICATE_SOURCE_CONTRACT_REJECTED");
  }
  const before = snapshot(store);
  const record: D3R11SourceContract = Object.freeze({
    contractId,
    contextId: context.contextId,
    objectId: object.objectId,
    exactRevision: object.provenanceRef,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
    currentness,
    authority: D3_CONTEXT_AUTHORITY,
    authorityTransferred: false,
    d1AuthorityTransferred: false,
    d2AuthorityTransferred: false,
    d9OwnsGeotechnicalAuthority: false,
    engineeringDerived: false,
    parameterDerived: false,
    recommendationGenerated: false,
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

export function repointGeotechnicalSourceContract(): never {
  fail("AUTO_REPOINT_REJECTED");
}
export function inferGeotechnicalSourceLineage(): never {
  fail("INFERRED_LINEAGE_REJECTED");
}
export function deriveGeotechnicalSourceFact(): never {
  fail("PARAMETER_DERIVATION_NOT_IN_R11");
}
export function startD9FromGeotechnicalSource(): never {
  fail("D9_NOT_STARTED");
}
export function fabricateGeotechnicalCounterpart(): never {
  fail("COUNTERPART_FABRICATION_REJECTED");
}
