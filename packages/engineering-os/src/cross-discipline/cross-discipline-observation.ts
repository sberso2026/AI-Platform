/**
 * EOS-D9-R2 explicit cross-discipline observations.
 * One bounded runtime over the exact D9-R1 source revision manifest.
 * An observation is not an inference, an engineering fact, a conflict, an escalation, a recommendation, or a decision.
 */
import {
  D8_REOPENED,
  D9_CANONICAL_MILESTONE_COUNT,
  D9_CANONICAL_PHASE_LIST,
  D9_CURRENTNESS_STATES,
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
  D9_CROSS_DISCIPLINE_OBSERVATION_RUNTIME_COUNT as R1_OBSERVATION_COUNT,
  D9_R1_D1_STANDING_LIMITATION,
  D9_R2_CANONICAL_PHASE,
  D9_R2_PHASE_TYPE,
  D9_RUNTIME_COUNT as R1_RUNTIME_COUNT,
  D9_SOURCE_CONTRACT_READ_MODEL_RUNTIME_COUNT,
  D9_SOURCE_CONTRACT_READ_MODEL_RUNTIME_READY,
  buildD9SourceManifest,
  type D9R1Actor,
  type D9R1SourceEntry,
  type D9R1Store,
} from "./source-contract-read-model";

export const D9_R2_STATUS = "CROSS_DISCIPLINE_OBSERVATION_IMPLEMENTED" as const;
export const D9_R2_MATURITY = D9_R2_STATUS;
export const D9_R2_MATURITY_STATE = D9_R2_STATUS;
export const D9_R2_CLOSEOUT_PATH = "docs/architecture/engineering-os/EOS_D9_R2_CROSS_DISCIPLINE_OBSERVATION_CLOSEOUT.md" as const;
export const D9_R2_PHASE = D9_R2_CANONICAL_PHASE;
export const D9_CROSS_DISCIPLINE_OBSERVATION_RUNTIME_IMPLEMENTED = true as const;
export const D9_CROSS_DISCIPLINE_OBSERVATION_RUNTIME_COUNT = 1 as const;
export const D9_CROSS_DISCIPLINE_OBSERVATION_RUNTIME_READY = true as const;
export const D9_RUNTIME_STARTED = true as const;
export const D9_RUNTIME_COUNT = 2 as const;
export const D9_R2_R1_RUNTIME_REMAINS_ONE = R1_RUNTIME_COUNT === 1 && R1_OBSERVATION_COUNT === 0 && D9_SOURCE_CONTRACT_READ_MODEL_RUNTIME_COUNT === 1 && D9_SOURCE_CONTRACT_READ_MODEL_RUNTIME_READY === true;
export { D9_SOURCE_CONTRACT_READ_MODEL_RUNTIME_COUNT, D9_SOURCE_CONTRACT_READ_MODEL_RUNTIME_READY };
export const D9_R2_USES_R1_SOURCE_REVISION_MANIFEST = true as const;
export const D9_R2_EXACT_SOURCE_REVISION_REQUIRED = true as const;
export const D9_R2_FLOATING_SOURCE_REFERENCE_ALLOWED = false as const;
export const D9_R2_SOURCE_AUTO_REPOINTED = false as const;
export const D9_CROSS_DISCIPLINE_OBSERVATION_RECORD_IMPLEMENTED = true as const;
export const D9_R2_OBSERVATION_REQUIRES_EXPLICIT_SOURCE_REFERENCES = true as const;
export const D9_R2_OBSERVATION_REQUIRES_EXACT_SOURCE_REVISIONS = true as const;
export const D9_R2_PRESERVES_SOURCE_DISCIPLINE = true as const;
export const D9_R2_PRESERVES_SOURCE_IDENTITY = true as const;
export const D9_R2_PRESERVES_SOURCE_OBJECT_TYPE = true as const;
export const D9_R2_PRESERVES_D1_INCOMPLETE_STATUS = D1_STRUCTURAL_PACK_COMPLETE === false;
export const D9_R2_PRESERVES_D1_LIMITATIONS = true as const;
export const D9_TREATS_D1_STRUCTURAL_AS_COMPLETE = false as const;
export const D9_IGNORES_D1_STRUCTURAL_LIMITATIONS = false as const;
export const D9_OBSERVATION_EQUALS_D9_INFERENCE = false as const;
export const D9_OBSERVATION_EQUALS_ENGINEERING_FACT = false as const;
export const OBSERVED_DIFFERENCE_EQUALS_CONFLICT_CANDIDATE = false as const;
export const OBSERVED_DIFFERENCE_EQUALS_CONFIRMED_ENGINEERING_CONFLICT = false as const;
export const D9_R2_PERFORMS_CROSS_DISCIPLINE_INFERENCE = false as const;
export const D9_CONFLICT_DETECTION_RUNTIME_COUNT = 0 as const;
export const D9_R2_PERFORMS_CONFLICT_DETECTION = false as const;
export const D9_R2_CREATES_CONFLICT_CANDIDATE = false as const;
export const D9_R2_CONFIRMS_ENGINEERING_CONFLICT = false as const;
export const D9_CONFLICT_RESOLUTION_RUNTIME_COUNT = 0 as const;
export const D9_AUTOMATIC_CONFLICT_RESOLUTION_RUNTIME_COUNT = 0 as const;
export const D9_R2_PERFORMS_CONFLICT_RESOLUTION = false as const;
export const D9_CONFLICT_GOVERNANCE_ESCALATION_RUNTIME_COUNT = 0 as const;
export const D9_R2_CREATES_ENGINEERING_ESCALATION = false as const;
export const D9_RECOMMENDATION_RUNTIME_COUNT = 0 as const;
export const D9_R2_GENERATES_ENGINEERING_RECOMMENDATION = false as const;
export const D9_R2_GENERATES_CROSS_DISCIPLINE_RECOMMENDATION = false as const;
export const D9_ENGINEERING_DECISION_RUNTIME_COUNT = 0 as const;
export const D9_R2_MAKES_ENGINEERING_DECISION = false as const;
export const D9_R2_SOURCE_BASIS_REQUIRED = true as const;
export const D9_R2_SOURCE_BASIS_TRACEABLE = true as const;
export const D9_R2_PROVENANCE_REQUIRED = true as const;
export const D9_R2_PROVENANCE_PRESERVED = true as const;
export const D9_R2_APPLICABILITY_EXPLICIT = true as const;
export const D9_R2_AUTO_PROPAGATES_OUTSIDE_APPLICABILITY = false as const;
export const D9_R2_LIMITATIONS_EXPLICIT = true as const;
export const D9_R2_SOURCE_LIMITATIONS_PRESERVED = true as const;
export const D9_R2_CAN_SILENTLY_DROP_SOURCE_LIMITATIONS = false as const;
export const D9_REUSES_CANONICAL_CURRENTNESS = true as const;
export const PARALLEL_D9_CURRENTNESS_ENGINE_CREATED = false as const;
export const D9_R2_OBSERVATION_CURRENTNESS_INTEGRATED = true as const;
export const CURRENT_OBSERVATION_EQUALS_VALIDATED = false as const;
export const STALE_OBSERVATION_EQUALS_INVALID = false as const;
export const SUPERSEDED_OBSERVATION_EQUALS_INVALID = false as const;
export const D9_R2_SOURCE_CHANGE_AUTO_REPOINTS_OBSERVATION = false as const;
export const D9_R2_SOURCE_CHANGE_AUTO_RECOMPUTES_OBSERVATION = false as const;
export const D9_REUSES_CANONICAL_DIGITAL_THREAD = true as const;
export const PARALLEL_D9_DIGITAL_THREAD_CREATED = false as const;
export const D9_EXPLICIT_LINEAGE_REQUIRED = true as const;
export const D9_INFERRED_LINEAGE_ALLOWED = false as const;
export const D9_R2_OBSERVATION_LINEAGE_PRESERVED = true as const;
export const D9_REUSES_CANONICAL_FINGERPRINT = D9_FINGERPRINT_ALGORITHM === "fingerprintCanonical";
export const SECOND_D9_FINGERPRINT_ALGORITHM_CREATED = false as const;
export const D9_R2_OBSERVATION_FINGERPRINT_VERIFICATION_SUPPORTED = true as const;
export const FINGERPRINT_MATCH_EQUALS_VALIDATED = false as const;
export const FINGERPRINT_MATCH_EQUALS_APPROVED = false as const;
export const D9_R2_HISTORY_PRESERVED = true as const;
export const D9_R2_HISTORICAL_REFERENCE_AUTO_REPOINTED = false as const;
export const SILENT_D9_R2_MUTATION_ALLOWED = false as const;
export const D9_R2_PERFORMS_ENGINEERING_DERIVATION = false as const;
export const D9_R2_PERFORMS_NUMERIC_DERIVATION = false as const;
export const D9_R2_INFERS_MISSING_ENGINEERING_VALUE = false as const;
export const D9_R2_SOURCE_UNITS_PRESERVED = true as const;
export const D9_R2_AUTO_CONVERTS_ENGINEERING_UNITS = false as const;
export const D9_R2_SOURCE_VALUES_PRESERVED = true as const;
export const D9_R2_CORRECTS_SOURCE_ENGINEERING_VALUE = false as const;
export const D9_R2_INFERS_RELATIONSHIP_FROM_NAME = false as const;
export const D9_R2_INFERS_RELATIONSHIP_FROM_TAG = false as const;
export const D9_R2_INFERS_RELATIONSHIP_FROM_DOCUMENT_PROXIMITY = false as const;
export const D9_R2_INFERS_RELATIONSHIP_FROM_SEMANTIC_SIMILARITY = false as const;
export const OBSERVED_RELATIONSHIP_EQUALS_ENGINEERING_AUTHORITY = false as const;
export const OBSERVED_RELATIONSHIP_EQUALS_REQUIREMENT_ADOPTION = false as const;
export const OBSERVED_RELATIONSHIP_EQUALS_VALIDATION = false as const;
export const OBSERVED_RELATIONSHIP_EQUALS_APPROVAL = false as const;
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
export const AI_CAN_PROMOTE_D9_OBSERVATION_TO_ENGINEERING_FACT = false as const;
export const AI_CAN_PROMOTE_D9_OBSERVATION_TO_CONFLICT = false as const;
export const AI_CAN_CONFIRM_ENGINEERING_CONFLICT = false as const;
export const AI_CAN_MAKE_AUTHORITATIVE_CROSS_DISCIPLINE_DECISION = false as const;
export const ADMIN_CAN_PROMOTE_D9_OBSERVATION_TO_ENGINEERING_TRUTH = false as const;
export const ADMIN_CAN_PROMOTE_D9_OBSERVATION_TO_CONFIRMED_CONFLICT = false as const;
export const D9_AUTO_VALIDATES_D1_STRUCTURAL = false as const;
export const D9_AUTO_VALIDATES_D2_CIVIL = false as const;
export const D9_AUTO_VALIDATES_D3_GEOTECHNICAL = false as const;
export const D9_AUTO_VALIDATES_D4_MECHANICAL = false as const;
export const D9_AUTO_VALIDATES_D5_PIPING = false as const;
export const D9_AUTO_VALIDATES_D6_PROCESS = false as const;
export const D9_AUTO_VALIDATES_D7_ELECTRICAL = false as const;
export const D9_AUTO_VALIDATES_D8_IAC = false as const;
export const D9_R2_AUTO_MUTATES_D1_STRUCTURAL = false as const;
export const D9_R2_AUTO_MUTATES_D2_CIVIL = false as const;
export const D9_R2_AUTO_MUTATES_D3_GEOTECHNICAL = false as const;
export const D9_R2_AUTO_MUTATES_D4_MECHANICAL = false as const;
export const D9_R2_AUTO_MUTATES_D5_PIPING = false as const;
export const D9_R2_AUTO_MUTATES_D6_PROCESS = false as const;
export const D9_R2_AUTO_MUTATES_D7_ELECTRICAL = false as const;
export const D9_R2_AUTO_MUTATES_D8_IAC = false as const;
export const D9_CONFORMANCE_DETERMINATION_RUNTIME_COUNT = 0 as const;
export const D9_APPROVAL_RUNTIME_COUNT = 0 as const;
export const D9_CERTIFICATION_RUNTIME_COUNT = 0 as const;
export const D9_AUTOMATIC_ENGINEERING_DESIGN_RUNTIME_COUNT = 0 as const;
export const D9_AUTOMATIC_ENGINEERING_REDESIGN_RUNTIME_COUNT = 0 as const;
export const D9_ENGINEERING_OPTIMIZATION_RUNTIME_COUNT = 0 as const;
export const D9_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT = 0 as const;
export const D9_REVIEW_VALIDATION_RUNTIME_COUNT = 0 as const;
export const D9_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT = 0 as const;
export const TENANT_WORKSPACE_PROJECT_D9_R2_SCOPE_ENFORCED = true as const;
export const CROSS_TENANT_D9_R2_ACCESS_ALLOWED = false as const;
export const D9_R2_DUPLICATE_GOVERNANCE_IMPLEMENTED = true as const;
export const D9_R2_REPLAY_PROTECTION_IMPLEMENTED = true as const;
export const D9_R2_SPOOFING_PROTECTION_IMPLEMENTED = true as const;
export const D9_R2_RECORDER_AUTHORITY = "D9_OBSERVATION_RECORDER" as const;
export const D9_OBSERVATION_TYPES = ["EXPLICIT_DIFFERENCE", "EXPLICIT_RELATIONSHIP"] as const;
export const D9_R3_CANONICAL_PHASE = D9_IMPLEMENTATION_PHASES[2];
export const D9_R3_PHASE_TYPE = D9_IMPLEMENTATION_PHASE_TYPES[2];
export const D9_R3_CANONICAL_SCOPE =
  "Detect governed conflict candidates from exact D9-R1 source revisions and explicit D9-R2 observations. A conflict candidate is not a confirmed engineering conflict, an escalation, a recommendation, an engineering decision, or an approval. Preserve uncertainty, source traceability, applicability, and limitations. Do not confirm conflicts, resolve conflicts, escalate, recommend, decide, approve, validate a discipline, or mutate a source record." as const;
export const D9_R3_STARTED = false as const;
export const D9_R2_READY_FOR_NEXT_PHASE = true as const;
export const D9_R2_NEXT_PHASE = D9_R3_CANONICAL_PHASE;
export const D9_R2_NEXT_PHASE_TYPE = D9_R3_PHASE_TYPE;
export const D9_R2_CANONICAL_NEXT_PHASE = D9_R3_CANONICAL_PHASE;
export const D9_R2_CANONICAL_NEXT_PHASE_SCOPE = D9_R3_CANONICAL_SCOPE;
export const D9_R2_BLOCKER = "NONE" as const;
export const D9_R2_MACHINE_READABLE_ROADMAP_UPDATED = true as const;
export const D9_R2_DATABASE_SCHEMA_CHANGED = false as const;
export const D9_R2_NEW_DEPENDENCY_ADDED = false as const;
export const EOS_ALL_DISCIPLINES_COMPLETE = false as const;
export const EOS_GA_READY = false as const;
export const D9_R2_PRESERVES_CLOSED_TRACKS = D6_STATUS === "COMPLETE_BOUNDED_WITH_LIMITATIONS" && D7_STATUS === "COMPLETE_BOUNDED_WITH_LIMITATIONS" && D8_STATUS === "COMPLETE_BOUNDED_WITH_LIMITATIONS" && D8_TRACK_COMPLETE === true && D8_REOPENED === false;
export { D9_CANONICAL_MILESTONE_COUNT, D9_CANONICAL_PHASE_LIST };

const FLOATING = new Set(["latest", "head", "floating", "tip", "unspecified", "current"]);
const CONCLUSION = /\b(therefore|incorrect|conflict|recommend|approved|validated|escalate|decide)\b/i;

export type D9R2Actor = D9R1Actor;
export type D9ObservationType = (typeof D9_OBSERVATION_TYPES)[number];
export type D9R2ObservationInput = {
  observationId: string;
  observationType: string;
  sourceAContractId: string;
  sourceAExactRevision: string;
  sourceAFingerprint: string;
  sourceBContractId: string;
  sourceBExactRevision: string;
  sourceBFingerprint: string;
  observedStatement: string;
  sourceBasisRef: string;
  provenanceRef: string;
  applicability: string;
  limitations: string;
  citedCurrentness: string;
  relationshipId?: string;
  assertedFingerprint?: string | null;
  tenantId?: string;
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
  detectConflict?: boolean;
  confirmConflict?: boolean;
  resolveConflict?: boolean;
  escalate?: boolean;
  recommend?: boolean;
  decide?: boolean;
  validate?: boolean;
  approve?: boolean;
  certify?: boolean;
  mutateSource?: boolean;
  repoint?: boolean;
  recompute?: boolean;
  stripLimitations?: boolean;
  stripApplicability?: boolean;
  stripProvenance?: boolean;
  promoteConflict?: boolean;
  promoteFact?: boolean;
};

export type D9R2Endpoint = {
  sourceDiscipline: D9R1SourceEntry["sourceDiscipline"];
  sourceDisciplineToken: string;
  contractId: string;
  objectId: string;
  objectType: string;
  exactRevision: string;
  fingerprint: string;
  currentness: D9R1SourceEntry["currentness"];
  provenanceRef: string;
  sourceBasisRef: string;
  applicability: string;
  limitations: string;
  authority: string;
  lineage: D9R1SourceEntry["lineage"];
  sourceValues: D9R1SourceEntry["sourceValues"];
};

export type D9R2Observation = {
  observationId: string;
  observationType: D9ObservationType;
  manifestFingerprint: string;
  sourceA: D9R2Endpoint;
  sourceB: D9R2Endpoint;
  observedStatement: string;
  sourceBasisRef: string;
  provenanceRef: string;
  applicability: string;
  limitations: string;
  d1Limitations: typeof D9_R1_D1_STANDING_LIMITATION;
  d1PackComplete: false;
  citedCurrentness: (typeof D9_CURRENTNESS_STATES)[number];
  relationshipId: string | null;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  fingerprint: string;
  inference: false;
  engineeringFact: false;
  conflictCandidate: false;
  confirmedConflict: false;
  escalation: false;
  recommendation: false;
  engineeringDecision: false;
  approved: false;
  validated: false;
  authorityTransferred: false;
  recordedAt: string;
};

export type D9R2History = { historyId: string; observationId: string; action: "CREATED"; fingerprint: string; recordedAt: string };
export type D9R2Store = {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  now: () => string;
  observations: D9R2Observation[];
  history: D9R2History[];
};

function fail(code: string): never {
  throw new Error(`D9_R2_${code}`);
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

function statement(value: string): string {
  const token = explicit(value, "STATEMENT_REQUIRED");
  if (CONCLUSION.test(token)) fail("CONCLUSION_REJECTED");
  return token;
}

function assertActor(actor: D9R2Actor, r1: D9R1Store, store: D9R2Store): void {
  if (!actor.actorId.trim() || actor.tenantId !== r1.tenantId || actor.workspaceId !== r1.workspaceId || actor.projectId !== r1.projectId) fail("SCOPE_REQUIRED");
  if (actor.tenantId !== store.tenantId || actor.workspaceId !== store.workspaceId || actor.projectId !== store.projectId) fail("CROSS_SCOPE_REJECTED");
  if (blockedParty(actor.actorId) || blockedParty(actor.authority) || actor.actorKind === "ai") fail("AI_NOT_D9_AUTHORITY");
  if (actor.authority === "ADMIN" || actor.authority === "ADMINISTRATOR" || actor.actorId === "ADMIN") fail("ADMIN_CANNOT_OVERRIDE");
  if (actor.authority !== D9_R2_RECORDER_AUTHORITY) fail("RECORDER_AUTHORITY_REQUIRED");
}

function assertProhibited(input: D9R2ObservationInput): void {
  if (input.infer || input.inferFromName || input.inferFromTag || input.documentProximity || input.semantic) fail("INFERRED_RELATIONSHIP_REJECTED");
  if (input.derive || input.numeric) fail("DERIVATION_REJECTED");
  if (input.fillMissing || input.correctValue) fail("VALUE_INFERENCE_REJECTED");
  if (input.convertUnits) fail("UNIT_CONVERSION_REJECTED");
  if (input.detectConflict || input.confirmConflict || input.promoteConflict) fail("CONFLICT_DETECTION_REJECTED");
  if (input.resolveConflict) fail("CONFLICT_RESOLUTION_REJECTED");
  if (input.escalate) fail("ESCALATION_REJECTED");
  if (input.recommend) fail("RECOMMENDATION_REJECTED");
  if (input.decide) fail("DECISION_REJECTED");
  if (input.validate || input.approve || input.certify || input.promoteFact) fail("VALIDATION_REJECTED");
  if (input.mutateSource) fail("SOURCE_MUTATION_REJECTED");
  if (input.repoint) fail("AUTO_REPOINT_REJECTED");
  if (input.recompute) fail("AUTO_RECOMPUTE_REJECTED");
  if (input.stripLimitations) fail("LIMITATION_STRIPPING_REJECTED");
  if (input.stripApplicability) fail("APPLICABILITY_STRIPPING_REJECTED");
  if (input.stripProvenance) fail("PROVENANCE_STRIPPING_REJECTED");
}

function endpoint(entry: D9R1SourceEntry): D9R2Endpoint {
  return {
    sourceDiscipline: entry.sourceDiscipline,
    sourceDisciplineToken: entry.sourceDisciplineToken,
    contractId: entry.contractId,
    objectId: entry.objectId,
    objectType: entry.objectType,
    exactRevision: entry.exactRevision,
    fingerprint: entry.fingerprint,
    currentness: entry.currentness,
    provenanceRef: entry.provenanceRef,
    sourceBasisRef: entry.sourceBasisRef,
    applicability: entry.applicability,
    limitations: entry.limitations,
    authority: entry.authority,
    lineage: entry.lineage,
    sourceValues: entry.sourceValues,
  };
}

function findEntry(r1: D9R1Store, contractId: string, exactRevision: string, fingerprint: string): D9R1SourceEntry {
  const entry = r1.entries.find((row) => row.contractId === contractId && row.exactRevision === exactRevision && row.tenantId === r1.tenantId);
  if (!entry) fail("SOURCE_REVISION_NOT_ON_MANIFEST");
  if (entry.fingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  return entry;
}

export function createD9R2Store(r1: D9R1Store, now: () => string = () => r1.now()): D9R2Store {
  if (!D9_R2_R1_RUNTIME_REMAINS_ONE || D9_CANONICAL_MILESTONE_COUNT !== 9 || D9_R2_PHASE_TYPE !== "CROSS_DISCIPLINE_OBSERVATION" || !D9_CANONICAL_PHASE_LIST.includes(D9_R2_PHASE)) fail("PHASE_LIST_UNEXPECTED");
  return { tenantId: r1.tenantId, workspaceId: r1.workspaceId, projectId: r1.projectId, now, observations: [], history: [] };
}

export function recordD9CrossDisciplineObservation(r1: D9R1Store, store: D9R2Store, actor: D9R2Actor, input: D9R2ObservationInput): D9R2Observation {
  assertActor(actor, r1, store);
  assertProhibited(input);
  if (input.tenantId != null && input.tenantId !== actor.tenantId) fail("CROSS_SCOPE_REJECTED");
  if (!(D9_OBSERVATION_TYPES as readonly string[]).includes(input.observationType)) fail("OBSERVATION_TYPE_REJECTED");
  if (!(D9_CURRENTNESS_STATES as readonly string[]).includes(input.citedCurrentness)) fail("CURRENTNESS_INVALID");
  const manifest = buildD9SourceManifest(r1);
  if (manifest.d1.packComplete || manifest.d1.limitations !== D9_R1_D1_STANDING_LIMITATION) fail("D1_LIMITATION_MISSING");
  const sourceA = endpoint(findEntry(r1, explicit(input.sourceAContractId, "SOURCE_A_REQUIRED"), explicit(input.sourceAExactRevision, "EXACT_REVISION_REQUIRED"), input.sourceAFingerprint));
  const sourceB = endpoint(findEntry(r1, explicit(input.sourceBContractId, "SOURCE_B_REQUIRED"), explicit(input.sourceBExactRevision, "EXACT_REVISION_REQUIRED"), input.sourceBFingerprint));
  if (sourceA.sourceDiscipline === sourceB.sourceDiscipline) fail("SAME_DISCIPLINE_REJECTED");
  const observationType = input.observationType as D9ObservationType;
  let relationshipId: string | null = null;
  if (observationType === "EXPLICIT_RELATIONSHIP") {
    const cited = explicit(input.relationshipId ?? "", "RELATIONSHIP_REQUIRED");
    const known = [...sourceALineageRelationships(r1, sourceA.contractId), ...sourceALineageRelationships(r1, sourceB.contractId)];
    if (!known.some((row) => row.relationshipId === cited && row.sourceRevision.trim() && row.targetRevision.trim())) fail("RELATIONSHIP_NOT_ON_SOURCE");
    relationshipId = cited;
  } else if (input.relationshipId) fail("RELATIONSHIP_NOT_EXPLICIT");
  const statementText = statement(input.observedStatement);
  const body = {
    observationType,
    manifestFingerprint: manifest.fingerprint,
    sourceA,
    sourceB,
    observedStatement: statementText,
    sourceBasisRef: explicit(input.sourceBasisRef, "SOURCE_BASIS_REQUIRED"),
    provenanceRef: explicit(input.provenanceRef, "PROVENANCE_REQUIRED"),
    applicability: explicit(input.applicability, "APPLICABILITY_REQUIRED"),
    limitations: explicit(input.limitations, "LIMITATIONS_REQUIRED"),
    d1Limitations: manifest.d1.limitations,
    d1PackComplete: false as const,
    citedCurrentness: input.citedCurrentness as (typeof D9_CURRENTNESS_STATES)[number],
    relationshipId,
    tenantId: store.tenantId,
    workspaceId: store.workspaceId,
    projectId: store.projectId,
  };
  if (!body.limitations.includes(sourceA.limitations) || !body.limitations.includes(sourceB.limitations) || !body.limitations.includes(D9_R1_D1_STANDING_LIMITATION)) fail("SOURCE_LIMITATION_NOT_PRESERVED");
  if (!body.provenanceRef.includes(sourceA.contractId) || !body.provenanceRef.includes(sourceB.contractId)) fail("PROVENANCE_NOT_TRACEABLE");
  const fingerprint = fingerprintCanonical(body);
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.observations.find((row) => row.observationId === input.observationId);
  if (existing) return existing.fingerprint === fingerprint ? existing : fail("REPLAY_REJECTED");
  if (store.observations.some((row) => `${row.sourceA.contractId}|${row.sourceA.exactRevision}|${row.sourceB.contractId}|${row.sourceB.exactRevision}|${row.observationType}|${row.observedStatement}` === `${sourceA.contractId}|${sourceA.exactRevision}|${sourceB.contractId}|${sourceB.exactRevision}|${observationType}|${statementText}`)) fail("DUPLICATE_OBSERVATION_REJECTED");
  const observation: D9R2Observation = Object.freeze({
    ...body,
    observationId: explicit(input.observationId, "OBSERVATION_ID_REQUIRED"),
    fingerprint,
    inference: false,
    engineeringFact: false,
    conflictCandidate: false,
    confirmedConflict: false,
    escalation: false,
    recommendation: false,
    engineeringDecision: false,
    approved: false,
    validated: false,
    authorityTransferred: false,
    recordedAt: store.now(),
  });
  store.observations.push(observation);
  store.history.push({ historyId: `d9-r2-hist-${store.history.length + 1}`, observationId: observation.observationId, action: "CREATED", fingerprint, recordedAt: observation.recordedAt });
  return observation;
}

function sourceALineageRelationships(r1: D9R1Store, contractId: string): D9R1SourceEntry["relationships"] {
  return r1.entries.find((row) => row.contractId === contractId)?.relationships ?? [];
}

export function readD9Observations(r1: D9R1Store, store: D9R2Store, actor: D9R2Actor): readonly D9R2Observation[] {
  assertActor(actor, r1, store);
  return store.observations.filter((row) => row.tenantId === actor.tenantId && row.workspaceId === actor.workspaceId && row.projectId === actor.projectId);
}

export function repointD9Observation(): never { return fail("AUTO_REPOINT_REJECTED"); }
export function recomputeD9Observation(): never { return fail("AUTO_RECOMPUTE_REJECTED"); }
export function mutateD9ObservationSource(): never { return fail("SOURCE_MUTATION_REJECTED"); }
export function inferFromD9Observation(): never { return fail("INFERENCE_NOT_IN_R2"); }
export function detectConflictFromObservation(): never { return fail("CONFLICT_DETECTION_REJECTED"); }
export function confirmConflictFromObservation(): never { return fail("CONFLICT_CONFIRMATION_REJECTED"); }
export function resolveConflictFromObservation(): never { return fail("CONFLICT_RESOLUTION_REJECTED"); }
export function escalateFromObservation(): never { return fail("ESCALATION_REJECTED"); }
export function recommendFromObservation(): never { return fail("RECOMMENDATION_REJECTED"); }
export function decideFromObservation(): never { return fail("DECISION_REJECTED"); }
export function validateFromObservation(): never { return fail("VALIDATION_REJECTED"); }
export function convertObservationUnits(): never { return fail("UNIT_CONVERSION_REJECTED"); }
