/**
 * EOS-D2-R11 D9 source contract.
 * Projects exact governed Civil revisions for future D9 consumption.
 * Does not start D9 reasoning, transfer Civil authority, or derive engineering.
 */
import {
  ADMIN_EQUALS_D2_CIVIL_ENGINEERING_AUTHORITY as ARCH_ADMIN_EQUALS_D2,
  AI_EQUALS_D2_CIVIL_ENGINEERING_AUTHORITY as ARCH_AI_EQUALS_D2,
  D2_CURRENTNESS_STATES,
  D2_D9_SOURCE_CONTRACT_FIELDS,
  D2_IMPLEMENTATION_PHASES,
  D2_SILENT_REPOINTING_ALLOWED,
} from "@rtb/types";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import { D1_STRUCTURAL_PACK_COMPLETE, D1N_REOPENED } from "../structural-systems/structural-pack-sequencing";
import {
  D2_CIVIL_IDENTITY_AND_OBJECT_FOUNDATION_RUNTIME_READY as R1_IDENTITY_READY,
  D2_CONTEXT_AUTHORITY,
  D2_DISCIPLINE,
  type D2R1Actor,
  type D2R1ObjectRecord,
} from "./identity-foundation";
import { D2_SURVEY_SPATIAL_SURFACE_RUNTIME_READY as R2_SPATIAL_READY } from "./spatial-surface-context";
import { D2_GRADING_EARTHWORKS_RUNTIME_READY as R3_GRADING_READY } from "./grading-earthworks-context";
import { D2_ROADS_ACCESS_RUNTIME_READY as R4_ROADS_READY } from "./roads-access-context";
import { D2_DRAINAGE_STORMWATER_RUNTIME_READY as R5_DRAINAGE_READY } from "./drainage-stormwater-context";
import { D2_CIVIL_UTILITY_CORRIDOR_RUNTIME_READY as R6_UTILITY_READY } from "./utility-corridor-context";
import { D2_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY as R7_REQUIREMENTS_READY } from "./requirements-assumptions-change";
import { D2_DISCIPLINE_INTERFACE_RUNTIME_READY as R8_INTERFACE_READY } from "./discipline-interfaces-handoffs";
import { D2_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_READY as R9_REVIEW_READY } from "./review-validation-governance";
import {
  D2_CURRENTNESS_DIGITAL_THREAD_RUNTIME_READY as R10_THREAD_READY,
  type D2R10Store,
} from "./currentness-digital-thread";

export const D2_R11_STATUS = "D9_SOURCE_CONTRACT_IMPLEMENTED" as const;
export const D2_R11_MATURITY = "D9_SOURCE_CONTRACT_IMPLEMENTED" as const;
export const D2_R11_MATURITY_STATE = D2_R11_MATURITY;
export const D2_R11_CLOSEOUT_PATH = "docs/architecture/engineering-os/EOS_D2_R11_D9_SOURCE_CONTRACT_CLOSEOUT.md" as const;
export const D2_RUNTIME_STARTED = true as const;
export const D2_RUNTIME_COUNT = 11 as const;
export const D2_CIVIL_IDENTITY_AND_OBJECT_FOUNDATION_RUNTIME_READY = R1_IDENTITY_READY;
export const D2_SURVEY_SPATIAL_SURFACE_RUNTIME_READY = R2_SPATIAL_READY;
export const D2_GRADING_EARTHWORKS_RUNTIME_READY = R3_GRADING_READY;
export const D2_ROADS_ACCESS_RUNTIME_READY = R4_ROADS_READY;
export const D2_DRAINAGE_STORMWATER_RUNTIME_READY = R5_DRAINAGE_READY;
export const D2_CIVIL_UTILITY_CORRIDOR_RUNTIME_READY = R6_UTILITY_READY;
export const D2_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY = R7_REQUIREMENTS_READY;
export const D2_DISCIPLINE_INTERFACE_RUNTIME_READY = R8_INTERFACE_READY;
export const D2_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_READY = R9_REVIEW_READY;
export const D2_CURRENTNESS_DIGITAL_THREAD_RUNTIME_READY = R10_THREAD_READY;
export const D2_D9_SOURCE_CONTRACT_RUNTIME_READY = true as const;
export const D2_D9_SOURCE_CONTRACT_RUNTIME_IMPLEMENTED = true as const;
export const D2_D9_SOURCE_CONTRACT_RUNTIME_COUNT = 1 as const;
export const CANONICAL_D9_SOURCE_CONTRACT_PATTERN_REUSED = true as const;
export const PARALLEL_GLOBAL_SOURCE_CONTRACT_FRAMEWORK_CREATED = false as const;
export const D2_R11_SOURCE_CONTRACT_FIELDS = D2_D9_SOURCE_CONTRACT_FIELDS;
export const EXACT_D2_SOURCE_CONTRACT_REVISION_REQUIRED = true as const;
export const FLOATING_D2_SOURCE_CONTRACT_REFERENCE_ALLOWED = false as const;
export const D2_SOURCE_CONTRACT_AUTO_REPOINTED = D2_SILENT_REPOINTING_ALLOWED;
export const D2_SOURCE_CONTRACT_CURRENTNESS_EXPLICIT = true as const;
export const D2_SOURCE_CONTRACT_LIMITATIONS_EXPLICIT = true as const;
export const D2_SOURCE_CONTRACT_REVIEW_STATE_EXPLICIT = true as const;
export const D2_SOURCE_CONTRACT_VALIDATION_STATE_EXPLICIT = true as const;
export const D2_SOURCE_CONTRACT_INTERFACE_STATE_EXPLICIT = true as const;
export const D2_SOURCE_CONTRACT_SPATIAL_CONTEXT_EXPLICIT = true as const;
export const D2_SOURCE_CONTRACT_LINEAGE_EXPLICIT = true as const;
export const D2_SOURCE_CONTRACT_CREATES_NEW_ENGINEERING_FACT = false as const;
export const D2_SOURCE_CONTRACT_INFERRED_ENGINEERING_RUNTIME_COUNT = 0 as const;
export const INFERRED_D2_SOURCE_CONTRACT_LINEAGE_ALLOWED = false as const;
export const D2_SOURCE_CONTRACT_TRANSFERS_CIVIL_AUTHORITY = false as const;
export const D9_FUTURE_CONSUMPTION_TRANSFERS_CIVIL_AUTHORITY = false as const;
export const AI_EQUALS_D2_CIVIL_ENGINEERING_AUTHORITY = ARCH_AI_EQUALS_D2;
export const ADMIN_EQUALS_D2_CIVIL_ENGINEERING_AUTHORITY = ARCH_ADMIN_EQUALS_D2;
export const STALE_D2_RECORD_EXPOSED_AS_CURRENT = false as const;
export const REASSESSMENT_REQUIRED_RECORD_EXPOSED_AS_VALIDATED = false as const;
export const REVIEW_STATE_EQUALS_ENGINEERING_VALIDATED = false as const;
export const VALIDATION_STATE_EQUALS_CONFORMANT = false as const;
export const VALIDATION_STATE_EQUALS_APPROVED = false as const;
export const VALIDATION_STATE_EQUALS_CERTIFIED = false as const;
export const MISSING_COUNTERPART_AUTO_FABRICATED = false as const;
export const INCOMPLETE_HANDOFF_EXPOSED_AS_COMPLETE = false as const;
export const STALE_HANDOFF_EXPOSED_AS_CURRENT = false as const;
export const CANONICAL_FINGERPRINT_REUSED = true as const;
export const SECOND_FINGERPRINT_ALGORITHM_CREATED = false as const;
export const D2_D9_SOURCE_CONTRACT_FINGERPRINT_IMPLEMENTED = true as const;
export const D2_R11_PROVENANCE_REQUIRED = true as const;
export const D2_R11_PROVENANCE_PRESERVED = true as const;
export const SILENT_D2_SOURCE_CONTRACT_MUTATION_ALLOWED = false as const;
export const D2_SOURCE_CONTRACT_HISTORY_PRESERVED = true as const;
export const TENANT_WORKSPACE_PROJECT_D2_SOURCE_CONTRACT_SCOPE_ENFORCED = true as const;
export const D2_R11_STANDING_LIMITATION =
  "This source contract projects governed Civil facts for future D9 consumption. It does not transfer Civil authority, start D9, validate, approve, certify, or conform Civil engineering." as const;
export const D2_CURRENTNESS_AUTO_RECALCULATION_RUNTIME_COUNT = 0 as const;
export const D2_CURRENTNESS_AUTO_REDESIGN_RUNTIME_COUNT = 0 as const;
export const D2_CURRENTNESS_AUTO_OPTIMIZATION_RUNTIME_COUNT = 0 as const;
export const D2_AUTOMATIC_GRADING_DESIGN_RUNTIME_COUNT = 0 as const;
export const D2_EARTHWORKS_CALCULATION_RUNTIME_COUNT = 0 as const;
export const D2_ROAD_GEOMETRIC_DESIGN_RUNTIME_COUNT = 0 as const;
export const D2_HYDROLOGY_CALCULATION_RUNTIME_COUNT = 0 as const;
export const D2_HYDRAULIC_CALCULATION_RUNTIME_COUNT = 0 as const;
export const D2_UTILITY_ROUTE_OPTIMIZATION_RUNTIME_COUNT = 0 as const;
export const D2_QUANTITY_CALCULATION_RUNTIME_COUNT = 0 as const;
export const D2_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT = 0 as const;
export const D2_CIVIL_APPROVAL_RUNTIME_COUNT = 0 as const;
export const D2_CIVIL_CERTIFICATION_RUNTIME_COUNT = 0 as const;
export const D2_CIVIL_CONFORMANCE_CERTIFICATION_RUNTIME_COUNT = 0 as const;
export const D2_D9_RUNTIME_INTEGRATION_COUNT = 0 as const;
export const D2_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT = 0 as const;
export const D2_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT = 0 as const;
export const D2_CROSS_DISCIPLINE_RECOMMENDATION_RUNTIME_COUNT = 0 as const;
export const D3_RUNTIME_STARTED = false as const;
export const D4_RUNTIME_STARTED = false as const;
export const D5_RUNTIME_STARTED = false as const;
export const D6_RUNTIME_STARTED = false as const;
export const D7_RUNTIME_STARTED = false as const;
export const D8_RUNTIME_STARTED = false as const;
export const D9_RUNTIME_STARTED = false as const;
export const D9_RUNTIME_COUNT = 0 as const;
export { D1_STRUCTURAL_PACK_COMPLETE, D1N_REOPENED };
export const DATABASE_SCHEMA_CHANGED = false as const;
export const NEW_DEPENDENCY_ADDED = false as const;

export const D2_R12_CANONICAL_PHASE = D2_IMPLEMENTATION_PHASES[11];
export const D2_R12_PHASE_TYPE = "CIVIL_BOUNDED_CLOSEOUT" as const;
export const D2_R12_CANONICAL_SCOPE =
  "Perform the bounded D2 Civil track closeout across R1-R11. Verify architectural coherence, runtime counts, capability readiness, Civil authority boundaries, no unauthorized calculations or certification claims, exact currentness/digital-thread semantics, D9 source-contract readiness, security/release posture and remaining limitations. Do not add new substantive Civil capabilities, start D3-D9, perform engineering calculations, declare the D1 Structural pack complete, claim GA, or claim Civil certification/conformance." as const;
export const D2_R12_STARTED = false as const;
export const D2_R11_READY_FOR_NEXT_PHASE = true as const;
export const D2_R11_NEXT_PHASE = D2_R12_CANONICAL_PHASE;
export const D2_R11_NEXT_PHASE_TYPE = D2_R12_PHASE_TYPE;
export const D2_R11_CANONICAL_NEXT_PHASE = D2_R12_CANONICAL_PHASE;
export const D2_R11_CANONICAL_NEXT_PHASE_SCOPE = D2_R12_CANONICAL_SCOPE;
export const D2_R11_BLOCKER = "NONE" as const;
export const D2_R11_MACHINE_READABLE_ROADMAP_UPDATED = true as const;

const FLOATING = new Set(["latest", "current", "newest", "head", "active", "active model"]);
const INFERRED = new Set(["inferred", "unknown", "auto", "default"]);

type Currentness = (typeof D2_CURRENTNESS_STATES)[number];

type Prohibited = {
  infer?: boolean;
  proximity?: boolean;
  similarName?: boolean;
  chronology?: boolean;
  repoint?: boolean;
  derive?: boolean;
  fabricateCounterpart?: boolean;
  resolveConflict?: boolean;
  rankAlternatives?: boolean;
  transferAuthority?: boolean;
  validate?: boolean;
  approve?: boolean;
  certify?: boolean;
  conform?: boolean;
  d3Start?: boolean;
  d9Reasoning?: boolean;
  redesign?: boolean;
  recalculate?: boolean;
};

export type D2R11Actor = D2R1Actor & { actorKind?: string };

export type D2R11SourceContractInput = Prohibited & {
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

export type D2R11SourceContract = {
  contractId: string;
  contextId: string;
  objectId: string;
  exactRevision: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  currentness: Currentness;
  supersessionState: "NONE" | "SUPERSEDED" | "SUCCESSOR";
  authorityTransferred: false;
  d9OwnsCivilAuthority: false;
  engineeringDerived: false;
  inferredLineage: false;
  counterpartFabricated: false;
  representedAsValidated: false | true;
  conformant: false;
  engineeringApproved: false;
  certified: false;
  fields: {
    OBJECT_IDENTITY: { objectId: string; contextId: string; discipline: typeof D2_DISCIPLINE };
    OBJECT_TYPE: D2R1ObjectRecord["objectType"];
    EXACT_REVISION: string;
    CURRENTNESS: Currentness;
    AUTHORITY: typeof D2_CONTEXT_AUTHORITY;
    PROVENANCE: string;
    REQUIREMENTS: readonly { requirementContextId: string; sourceRevision: string; requirementText: string; citedCurrentness: Currentness; requirementSatisfied: false; fingerprint: string }[];
    ASSUMPTIONS: readonly { assumptionContextId: string; statement: string; citedCurrentness: Currentness; validationStatus: "unvalidated"; fingerprint: string }[];
    DECISIONS: readonly { decisionContextId: string; statement: string; citedCurrentness: Currentness; fingerprint: string }[];
    EVIDENCE: readonly { objectId: string; revision: string; fingerprint: string }[];
    INTERFACES: readonly {
      handoffId: string;
      sourceObjectId: string;
      sourceRevision: string;
      sourceObjectFingerprint: string;
      counterpartDiscipline: string;
      counterpart: { interfaceId: string; sourceRevision: string; fingerprint: string } | null;
      handoffStatus: string;
      citedCurrentness: Currentness;
      limitations: string;
      complete: boolean;
      counterpartFabricated: false;
    }[];
    SPATIAL_CONTEXT: {
      spatialReferences: readonly { spatialReferenceId: string; objectId: string; fingerprint: string; citedCurrentness: Currentness }[];
      surfaces: readonly { surfaceContextId: string; objectId: string; revision: string; fingerprint: string; citedCurrentness: Currentness }[];
      grading: readonly { gradingContextId: string; objectId: string; fingerprint: string; citedCurrentness: Currentness; gradingDesignComplete: false }[];
      earthworks: readonly { earthworksContextId: string; objectId: string; fingerprint: string; citedCurrentness: Currentness; cutFillCalculated: false }[];
      roads: readonly { roadsContextId: string; fingerprint: string; citedCurrentness: Currentness; roadDesignComplete: false }[];
      drainage: readonly { drainageContextId: string; fingerprint: string; citedCurrentness: Currentness; hydrologyCalculated: false }[];
      utilities: readonly { utilityContextId: string; fingerprint: string; citedCurrentness: Currentness; routeOptimized: false }[];
    };
    MATURITY: D2R1ObjectRecord["citedLifecycleStage"];
    LIMITATIONS: readonly string[];
    CANONICAL_FINGERPRINT: string;
  };
  lineage: readonly { lineageId: string; relationshipType: string; authoritative: boolean; candidate: boolean; sourceRevision: string; targetRevision: string; fingerprint: string }[];
  reviewState: readonly { reviewRequestId: string; requestStatus: "REQUESTED"; reviewCompleted: false; engineeringValidated: false; subjectRevision: string; limitations: string }[];
  validationState: readonly { validationId: string; validationState: string; engineeringValidated: boolean; conformant: false; engineeringApproved: false; certified: false; subjectRevision: string; limitations: string }[];
  provenanceRef: string;
  fingerprint: string;
  recordedBy: string;
  recordedAt: string;
  recordStatus: "CURRENT";
};

export type D2R11History = {
  historyId: string;
  contractId: string;
  action: "CREATED";
  fingerprint: string;
  recordedAt: string;
};

export type D2R11Store = {
  r10: D2R10Store;
  now: () => string;
  contracts: D2R11SourceContract[];
  history: D2R11History[];
};

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
  return (D2_CURRENTNESS_STATES as readonly string[]).includes(value);
}

function assertProhibited(input: Prohibited): void {
  if (input.infer === true || input.proximity === true || input.similarName === true || input.chronology === true) fail("INFERRED_LINEAGE_REJECTED");
  if (input.repoint === true) fail("AUTO_REPOINT_REJECTED");
  if (input.derive === true || input.redesign === true || input.recalculate === true) fail("ENGINEERING_DERIVATION_NOT_IN_R11");
  if (input.fabricateCounterpart === true) fail("COUNTERPART_FABRICATION_REJECTED");
  if (input.resolveConflict === true) fail("CONFLICT_RESOLUTION_NOT_IN_R11");
  if (input.rankAlternatives === true) fail("ALTERNATIVE_RANKING_NOT_IN_R11");
  if (input.transferAuthority === true) fail("AUTHORITY_TRANSFER_REJECTED");
  if (input.validate === true) fail("VALIDATION_NOT_IN_R11");
  if (input.approve === true) fail("APPROVAL_NOT_IN_R11");
  if (input.certify === true) fail("CERTIFICATION_NOT_IN_R11");
  if (input.conform === true) fail("CONFORMANCE_NOT_IN_R11");
  if (input.d3Start === true) fail("D3_NOT_STARTED");
  if (input.d9Reasoning === true) fail("D9_NOT_STARTED");
}

function assertScope(actor: D2R11Actor, input: { tenantId?: string; workspaceId?: string; projectId?: string }): void {
  if (!actor.actorId.trim() || !actor.tenantId.trim() || !actor.workspaceId.trim() || !actor.projectId.trim()) fail("SCOPE_REQUIRED");
  if (input.tenantId != null && input.tenantId !== actor.tenantId) fail("CROSS_TENANT_OPERATION");
  if (input.workspaceId != null && input.workspaceId !== actor.workspaceId) fail("CROSS_WORKSPACE_OPERATION");
  if (input.projectId != null && input.projectId !== actor.projectId) fail("CROSS_PROJECT_OPERATION");
}

function assertRecorder(actor: D2R11Actor): void {
  const ai = blockedParty(actor.actorId) || blockedParty(actor.authority) || actor.authority === "AI_ASSISTANT" || actor.actorKind === "ai";
  if (ai) fail("AI_NOT_CIVIL_AUTHORITY");
  if (actor.authority === "ADMINISTRATOR" || actor.authority === "ADMIN") fail("ADMIN_NOT_CIVIL_AUTHORITY");
  if (actor.authority !== D2_CONTEXT_AUTHORITY) fail("UNAUTHORIZED");
}

function root(store: D2R11Store) {
  return store.r10.r9.r8.r7.r6.r5.r4.r3.r2.r1;
}

function latestMark(store: D2R11Store, kind: string, subjectId: string, subjectRevision: string, subjectFingerprint: string): Currentness | null {
  const marks = store.r10.marks.filter((row) => row.subject.subjectKind === kind && row.subject.subjectId === subjectId && row.subject.subjectRevision === subjectRevision && row.subject.subjectFingerprint === subjectFingerprint);
  return marks.length === 0 ? null : marks[marks.length - 1].currentness;
}

function snapshot(store: D2R11Store): string {
  const objects = root(store).objects.map((row) => `${row.objectId}:${row.fingerprint}:${row.recordStatus}`).join("|");
  const handoffs = store.r10.r9.r8.handoffs.map((row) => `${row.handoffId}:${row.sourceRevision}:${row.fingerprint}`).join("|");
  const reviews = store.r10.r9.requests.map((row) => `${row.reviewRequestId}:${row.subjectRevision}`).join("|");
  const validations = store.r10.r9.validations.map((row) => `${row.validationId}:${row.subjectRevision}:${row.engineeringValidated}:${row.conformant}`).join("|");
  const requirements = store.r10.r9.r8.r7.requirements.map((row) => `${row.requirementContextId}:${row.requirementText}`).join("|");
  return `${objects}#${handoffs}#${reviews}#${validations}#${requirements}`;
}

export function createD2R11Store(r10: D2R10Store, now: () => string = () => "2026-10-23T00:00:00.000Z"): D2R11Store {
  return { r10, now, contracts: [], history: [] };
}

export function recordCivilSourceContract(store: D2R11Store, actor: D2R11Actor, input: D2R11SourceContractInput): D2R11SourceContract {
  assertRecorder(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const cited = input.citedCurrentness.trim();
  if (!isCurrentness(cited)) fail("CURRENTNESS_INVALID");
  const contextId = explicit(input.contextId, "R1_CONTEXT_REQUIRED");
  const context = root(store).contexts.find((row) => row.contextId === contextId);
  if (!context || context.tenantId !== actor.tenantId || context.workspaceId !== actor.workspaceId || context.projectId !== actor.projectId) fail("R1_CONTEXT_NOT_FOUND");
  if (context.discipline !== D2_DISCIPLINE) fail("DISCIPLINE_NOT_CIVIL");
  const objectId = explicit(input.objectId, "OBJECT_REFERENCE_REQUIRED");
  const sourceRevision = explicit(input.sourceRevision, "SUBJECT_REVISION_REQUIRED");
  const object = root(store).objects.find((row) => row.objectId === objectId && row.contextId === context.contextId && row.tenantId === actor.tenantId);
  if (!object || object.fingerprint !== sourceRevision) fail("SUBJECT_REVISION_MISMATCH");
  const mark = latestMark(store, "OBJECT", object.objectId, object.fingerprint, object.fingerprint);
  const currentness: Currentness = mark ?? (object.recordStatus === "SUPERSEDED" ? "SUPERSEDED" : "CURRENT");
  if (cited !== currentness) fail("CURRENTNESS_MISMATCH");
  if (currentness !== "CURRENT" && cited === "CURRENT") fail("STALE_EXPOSED_AS_CURRENT");
  const provenanceRef = explicit(input.provenanceRef, "MISSING_PROVENANCE");
  const contractId = explicit(input.contractId, "CONTRACT_ID_REQUIRED");
  const r7 = store.r10.r9.r8.r7;
  const requirements = r7.requirements
    .filter((row) => row.contextId === context.contextId && (row.objectId === object.objectId || row.affectedObjectIds.includes(object.objectId)))
    .map((row) => ({ requirementContextId: row.requirementContextId, sourceRevision: row.sourceRevision, requirementText: row.requirementText, citedCurrentness: row.citedCurrentness, requirementSatisfied: false as const, fingerprint: row.fingerprint }))
    .sort((a, b) => a.requirementContextId.localeCompare(b.requirementContextId));
  const assumptions = r7.assumptions
    .filter((row) => row.contextId === context.contextId && (row.objectId === object.objectId || row.affectedObjectIds.includes(object.objectId)))
    .map((row) => ({ assumptionContextId: row.assumptionContextId, statement: row.statement, citedCurrentness: row.citedCurrentness, validationStatus: "unvalidated" as const, fingerprint: row.fingerprint }))
    .sort((a, b) => a.assumptionContextId.localeCompare(b.assumptionContextId));
  const decisions = r7.decisions
    .filter((row) => row.contextId === context.contextId && (row.objectId === object.objectId || row.affectedObjectIds.includes(object.objectId)))
    .map((row) => ({ decisionContextId: row.decisionContextId, statement: row.statement, citedCurrentness: row.citedCurrentness, fingerprint: row.fingerprint }))
    .sort((a, b) => a.decisionContextId.localeCompare(b.decisionContextId));
  const grading = r7.r6.r5.r4.r3.grading
    .filter((row) => row.contextId === context.contextId && row.objectId === object.objectId)
    .map((row) => ({ gradingContextId: row.gradingContextId, objectId: row.objectId, fingerprint: row.fingerprint, citedCurrentness: row.citedCurrentness, gradingDesignComplete: false as const, surfaceContextIds: row.surfaceContextIds }))
    .sort((a, b) => a.gradingContextId.localeCompare(b.gradingContextId));
  const gradingIds = new Set(grading.map((row) => row.gradingContextId));
  const surfaceIds = new Set(grading.flatMap((row) => [...row.surfaceContextIds]));
  const surfaces = r7.r6.r5.r4.r3.r2.surfaces
    .filter((row) => row.contextId === context.contextId && (row.objectId === object.objectId || surfaceIds.has(row.surfaceContextId)))
    .map((row) => ({ surfaceContextId: row.surfaceContextId, objectId: row.objectId, revision: row.revision, fingerprint: row.fingerprint, citedCurrentness: row.citedCurrentness, spatialReferenceId: row.spatialReferenceId }))
    .sort((a, b) => a.surfaceContextId.localeCompare(b.surfaceContextId));
  const spatialIds = new Set(surfaces.map((row) => row.spatialReferenceId));
  const spatialReferences = r7.r6.r5.r4.r3.r2.spatial
    .filter((row) => row.contextId === context.contextId && (row.objectId === object.objectId || spatialIds.has(row.spatialReferenceId)))
    .map((row) => ({ spatialReferenceId: row.spatialReferenceId, objectId: row.objectId, fingerprint: row.fingerprint, citedCurrentness: row.citedCurrentness }))
    .sort((a, b) => a.spatialReferenceId.localeCompare(b.spatialReferenceId));
  const earthworks = r7.r6.r5.r4.r3.earthworks
    .filter((row) => row.contextId === context.contextId && (row.objectId === object.objectId || gradingIds.has(row.gradingContextId)))
    .map((row) => ({ earthworksContextId: row.earthworksContextId, objectId: row.objectId, fingerprint: row.fingerprint, citedCurrentness: row.citedCurrentness, cutFillCalculated: false as const }))
    .sort((a, b) => a.earthworksContextId.localeCompare(b.earthworksContextId));
  const roads = r7.r6.r5.r4.roads
    .filter((row) => row.contextId === context.contextId && ((row.gradingContextId != null && gradingIds.has(row.gradingContextId)) || [row.alignmentObjectId, row.profileObjectId, row.corridorObjectId, row.pavementObjectId].includes(object.objectId)))
    .map((row) => ({ roadsContextId: row.roadsContextId, fingerprint: row.fingerprint, citedCurrentness: row.citedCurrentness, roadDesignComplete: false as const }))
    .sort((a, b) => a.roadsContextId.localeCompare(b.roadsContextId));
  const roadIds = new Set(roads.map((row) => row.roadsContextId));
  const drainage = r7.r6.r5.drainage
    .filter((row) => row.contextId === context.contextId && ((row.gradingContextId != null && gradingIds.has(row.gradingContextId)) || (row.roadsContextId != null && roadIds.has(row.roadsContextId)) || [row.catchmentObjectId, row.rainfallObjectId, row.networkObjectId, row.channelObjectId, row.culvertObjectId, row.outfallObjectId, row.detentionObjectId, ...row.nodeObjectIds, ...row.linkObjectIds, ...row.pitObjectIds, ...row.manholeObjectIds].includes(object.objectId)))
    .map((row) => ({ drainageContextId: row.drainageContextId, fingerprint: row.fingerprint, citedCurrentness: row.citedCurrentness, hydrologyCalculated: false as const }))
    .sort((a, b) => a.drainageContextId.localeCompare(b.drainageContextId));
  const drainageIds = new Set(drainage.map((row) => row.drainageContextId));
  const utilities = r7.r6.utilities
    .filter((row) => row.contextId === context.contextId && ((row.gradingContextId != null && gradingIds.has(row.gradingContextId)) || (row.roadsContextId != null && roadIds.has(row.roadsContextId)) || (row.drainageContextId != null && drainageIds.has(row.drainageContextId)) || [row.corridorObjectId, row.clearanceEnvelopeObjectId, ...row.trenchObjectIds, ...row.pitObjectIds, ...row.crossingObjectIds].includes(object.objectId)))
    .map((row) => ({ utilityContextId: row.utilityContextId, fingerprint: row.fingerprint, citedCurrentness: row.citedCurrentness, routeOptimized: false as const }))
    .sort((a, b) => a.utilityContextId.localeCompare(b.utilityContextId));
  const reviews = store.r10.r9.requests
    .filter((row) => row.contextId === context.contextId && row.subjectKind === "OBJECT" && row.subjectId === object.objectId && row.subjectRevision === object.fingerprint && row.subjectFingerprint === object.fingerprint)
    .map((row) => ({ reviewRequestId: row.reviewRequestId, requestStatus: "REQUESTED" as const, reviewCompleted: false as const, engineeringValidated: false as const, subjectRevision: row.subjectRevision, limitations: row.limitations }))
    .sort((a, b) => a.reviewRequestId.localeCompare(b.reviewRequestId));
  const validations = store.r10.r9.validations
    .filter((row) => row.contextId === context.contextId && row.subjectKind === "OBJECT" && row.subjectId === object.objectId && row.subjectRevision === object.fingerprint && row.subjectFingerprint === object.fingerprint)
    .map((row) => ({ validationId: row.validationId, validationState: row.validationState, engineeringValidated: row.engineeringValidated, conformant: false as const, engineeringApproved: false as const, certified: false as const, subjectRevision: row.subjectRevision, limitations: row.limitations }))
    .sort((a, b) => a.validationId.localeCompare(b.validationId));
  const representedAsValidated = currentness === "CURRENT" && validations.some((row) => row.validationState === "VALIDATED" && row.engineeringValidated);
  if (currentness === "REASSESSMENT_REQUIRED" && representedAsValidated) fail("REASSESSMENT_EXPOSED_AS_VALIDATED");
  const interfaces = store.r10.r9.r8.handoffs
    .filter((row) => row.contextId === context.contextId && row.sourceObjectId === object.objectId && row.sourceObjectFingerprint === object.fingerprint)
    .map((row) => {
      const handoffMark = latestMark(store, "HANDOFF", row.handoffId, row.sourceRevision, row.fingerprint);
      const handoffCurrentness = handoffMark ?? row.citedCurrentness;
      return {
        handoffId: row.handoffId,
        sourceObjectId: row.sourceObjectId,
        sourceRevision: row.sourceRevision,
        sourceObjectFingerprint: row.sourceObjectFingerprint,
        counterpartDiscipline: row.counterpartDiscipline,
        counterpart: row.counterpart,
        handoffStatus: row.handoffStatus,
        citedCurrentness: handoffCurrentness,
        limitations: row.limitations,
        complete: row.handoffStatus === "COMPLETE",
        counterpartFabricated: false as const,
      };
    })
    .sort((a, b) => a.handoffId.localeCompare(b.handoffId));
  if (interfaces.some((row) => row.handoffStatus !== "COMPLETE" && row.complete)) fail("INCOMPLETE_HANDOFF_EXPOSED_AS_COMPLETE");
  if (interfaces.some((row) => (row.citedCurrentness === "STALE" || row.handoffStatus === "STALE") && row.citedCurrentness === "CURRENT")) fail("STALE_HANDOFF_EXPOSED_AS_CURRENT");
  const lineage = store.r10.lineage
    .filter((row) => row.contextId === context.contextId && ((row.source.subjectKind === "OBJECT" && row.source.subjectId === object.objectId && row.source.subjectRevision === object.fingerprint) || (row.target.subjectKind === "OBJECT" && row.target.subjectId === object.objectId && row.target.subjectRevision === object.fingerprint)))
    .map((row) => ({ lineageId: row.lineageId, relationshipType: row.relationshipType, authoritative: row.authoritative, candidate: row.candidate, sourceRevision: row.source.subjectRevision, targetRevision: row.target.subjectRevision, fingerprint: row.fingerprint }))
    .sort((a, b) => a.lineageId.localeCompare(b.lineageId));
  const evidenceIds = new Set<string>();
  for (const row of r7.requirements) if (row.objectId === object.objectId || row.affectedObjectIds.includes(object.objectId)) row.evidenceObjectIds.forEach((id) => evidenceIds.add(id));
  for (const row of r7.assumptions) if (row.objectId === object.objectId || row.affectedObjectIds.includes(object.objectId)) row.evidenceObjectIds.forEach((id) => evidenceIds.add(id));
  for (const row of r7.decisions) if (row.objectId === object.objectId || row.affectedObjectIds.includes(object.objectId)) row.evidenceObjectIds.forEach((id) => evidenceIds.add(id));
  for (const row of store.r10.r9.r8.handoffs) if (row.sourceObjectId === object.objectId && row.sourceObjectFingerprint === object.fingerprint) row.evidenceObjectIds.forEach((id) => evidenceIds.add(id));
  for (const row of store.r10.lineage) {
    if (row.relationshipType === "SUPPORTED_BY" && row.source.subjectKind === "OBJECT" && row.source.subjectId === object.objectId && row.source.subjectRevision === object.fingerprint && row.target.subjectKind === "EVIDENCE") evidenceIds.add(row.target.subjectId);
  }
  const evidence = [...evidenceIds]
    .map((id) => root(store).objects.find((row) => row.objectId === id && row.objectType === "CIVIL_EVIDENCE_REFERENCE"))
    .filter((row): row is D2R1ObjectRecord => row != null)
    .map((row) => ({ objectId: row.objectId, revision: row.fingerprint, fingerprint: row.fingerprint }))
    .sort((a, b) => a.objectId.localeCompare(b.objectId));
  const copiedLimitations = [...interfaces.map((row) => row.limitations), ...reviews.map((row) => row.limitations), ...validations.map((row) => row.limitations)].filter((row) => row.trim().length > 0).sort();
  const limitations = [D2_R11_STANDING_LIMITATION, ...copiedLimitations];
  if (currentness !== "CURRENT") limitations.push(`Civil currentness is ${currentness}.`);
  const predecessor = store.r10.supersessions.some((row) => row.predecessor.subjectKind === "OBJECT" && row.predecessor.subjectId === object.objectId && row.predecessor.subjectRevision === object.fingerprint);
  const successor = store.r10.supersessions.some((row) => row.successor.subjectKind === "OBJECT" && row.successor.subjectId === object.objectId && row.successor.subjectRevision === object.fingerprint);
  const supersessionState = predecessor || object.recordStatus === "SUPERSEDED" ? "SUPERSEDED" : successor ? "SUCCESSOR" : "NONE";
  const spatialContext = {
    spatialReferences: spatialReferences.map(({ spatialReferenceId, objectId: spatialObjectId, fingerprint, citedCurrentness }) => ({ spatialReferenceId, objectId: spatialObjectId, fingerprint, citedCurrentness })),
    surfaces: surfaces.map(({ surfaceContextId, objectId: surfaceObjectId, revision, fingerprint, citedCurrentness }) => ({ surfaceContextId, objectId: surfaceObjectId, revision, fingerprint, citedCurrentness })),
    grading: grading.map(({ gradingContextId, objectId: gradingObjectId, fingerprint, citedCurrentness, gradingDesignComplete }) => ({ gradingContextId, objectId: gradingObjectId, fingerprint, citedCurrentness, gradingDesignComplete })),
    earthworks,
    roads,
    drainage,
    utilities,
  };
  const projection = {
    OBJECT_IDENTITY: { objectId: object.objectId, contextId: context.contextId, discipline: D2_DISCIPLINE },
    OBJECT_TYPE: object.objectType,
    EXACT_REVISION: object.fingerprint,
    CURRENTNESS: currentness,
    AUTHORITY: D2_CONTEXT_AUTHORITY,
    PROVENANCE: provenanceRef,
    REQUIREMENTS: requirements,
    ASSUMPTIONS: assumptions,
    DECISIONS: decisions,
    EVIDENCE: evidence,
    INTERFACES: interfaces,
    SPATIAL_CONTEXT: spatialContext,
    MATURITY: object.citedLifecycleStage,
    LIMITATIONS: limitations,
  };
  const fingerprint = fingerprintCanonical({ ...projection, LINEAGE: lineage, REVIEW: reviews, VALIDATION: validations, SUPERSESSION: supersessionState, SCOPE: { tenantId: actor.tenantId, workspaceId: actor.workspaceId, projectId: actor.projectId } });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.contracts.find((row) => row.contractId === contractId);
  if (existing) {
    if (existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId && existing.exactRevision === object.fingerprint) return existing;
    fail("DUPLICATE_SOURCE_CONTRACT_REJECTED");
  }
  const before = snapshot(store);
  const record: D2R11SourceContract = Object.freeze({
    contractId,
    contextId: context.contextId,
    objectId: object.objectId,
    exactRevision: object.fingerprint,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
    currentness,
    supersessionState,
    authorityTransferred: false,
    d9OwnsCivilAuthority: false,
    engineeringDerived: false,
    inferredLineage: false,
    counterpartFabricated: false,
    representedAsValidated,
    conformant: false,
    engineeringApproved: false,
    certified: false,
    fields: { ...projection, CANONICAL_FINGERPRINT: fingerprint },
    lineage,
    reviewState: reviews,
    validationState: validations,
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

export function repointSourceContract(): never {
  fail("AUTO_REPOINT_REJECTED");
}

export function inferSourceContractLineage(): never {
  fail("INFERRED_LINEAGE_REJECTED");
}

export function deriveEngineeringFact(): never {
  fail("ENGINEERING_DERIVATION_NOT_IN_R11");
}

export function startD9Reasoning(): never {
  fail("D9_NOT_STARTED");
}

export function transferCivilAuthority(): never {
  fail("AUTHORITY_TRANSFER_REJECTED");
}

export function fabricateCounterpartDiscipline(): never {
  fail("COUNTERPART_FABRICATION_REJECTED");
}
