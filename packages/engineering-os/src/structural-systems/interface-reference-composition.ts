/**
 * EOS-D1K-R4 internal and external reference composition.
 * Admits a governed source classification into the R1 pin. Does not ingest a payload or start another discipline.
 */

import { D1K_SOURCE_CLASSES, type D1kSourceClass } from "@rtb/types";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import {
  evaluateInterfaceCompatibility,
  type D1kR2Metadata,
  type D1kR2Requirement,
  type D1kR2Result,
  type D1kR2Store,
} from "./interface-compatibility";
import {
  D1K_R4_CANONICAL_PHASE,
  D1K_R4_CANONICAL_SCOPE,
  D1K_R4_PHASE_TYPE,
  recordInterfaceProvision,
  recordInterfaceSourceChange,
  type D1kR3Actor,
  type D1kR3Event,
  type D1kR3Store,
} from "./interface-handoff-governance";
import {
  inspectStructuralInterfaceIdentity,
  registerStructuralInterfaceIdentity,
  type D1kR1CatalogSource,
  type D1kR1InterfaceInput,
  type D1kR1InterfaceRecord,
  type D1kR1Store,
} from "./interface-identity-foundation";

export { D1K_R4_CANONICAL_PHASE, D1K_R4_CANONICAL_SCOPE, D1K_R4_PHASE_TYPE };

export const D1K_R4_STATUS = "REFERENCE_COMPOSITION_DEFINED" as const;
export const D1K_R4_MATURITY_STATE = "STRUCTURAL_INTERFACE_INTERNAL_EXTERNAL_REFERENCE_COMPOSITION_IMPLEMENTED" as const;
export const D1K_R4_CLOSEOUT_PATH =
  "docs/architecture/engineering-os/EOS_D1K_R4_INTERNAL_EXTERNAL_REFERENCE_COMPOSITION_CLOSEOUT.md" as const;
export const D1K_R4_ARCHITECTURE_READY = true as const;
export const D1K_R4_REFERENCE_RUNTIME_READY = true as const;
export const D1K_R4_EXTERNAL_REFERENCE_READY = true as const;
export const D1K_R4_INTERNAL_DISCIPLINE_INTEGRATION_READY = false as const;
export const D1K_R4_CROSS_DISCIPLINE_INTELLIGENCE_READY = false as const;
export const D1K_R4_EXTERNAL_REFERENCE_COMPOSITION_RUNTIME_COUNT = 1 as const;
export const D1K_R4_MANUAL_REFERENCE_COMPOSITION_RUNTIME_COUNT = 1 as const;
export const D1K_R4_NATIVE_EOS_SOURCE_SEAM_RUNTIME_COUNT = 1 as const;
export const D1K_R4_LIVE_D2_D8_SOURCE_PROVIDER_COUNT = 0 as const;
export const D1K_R4_ARBITRARY_PAYLOAD_BUS_COUNT = 0 as const;
export const D1K_R4_GENERIC_ENGINEERING_FILE_INGESTION_RUNTIME_COUNT = 0 as const;
export const D1K_R4_NEW_EXTERNAL_CONNECTOR_RUNTIME_COUNT = 0 as const;
export const D1K_R4_SCHEMA_TRANSFORMATION_RUNTIME_COUNT = 0 as const;
export const D1K_R4_UNIT_CONVERSION_RUNTIME_COUNT = 0 as const;
export const D1K_R4_COORDINATE_TRANSFORMATION_RUNTIME_COUNT = 0 as const;
export const D1K_R4_AXIS_TRANSFORMATION_RUNTIME_COUNT = 0 as const;
export const D1K_R4_SIGN_TRANSFORMATION_RUNTIME_COUNT = 0 as const;
export const D1K_R4_AUTOMATIC_COMPATIBILITY_RECONCILIATION_COUNT = 0 as const;
export const D1K_R4_AUTOMATIC_ENGINEERING_CONFLICT_RESOLUTION_COUNT = 0 as const;
export const D1K_R4_D2_D8_RUNTIME_STARTED = false as const;
export const D1K_R4_D2_D8_RUNTIME_COUNT = 0 as const;
export const D1K_R4_D9_RUNTIME_STARTED = false as const;
export const D1K_R4_D9_RUNTIME_COUNT = 0 as const;
export const D1K_R4_GLOBAL_CYCLE_DETECTION_RUNTIME_COUNT = 0 as const;
export const D1K_R4_CROSS_DISCIPLINE_CALCULATION_RUNTIME_COUNT = 0 as const;
export const D1K_R4_NEW_ENGINEERING_FORMULA_COUNT = 0 as const;
export const D1K_R4_FLOATING_EXTERNAL_SOURCE_ALLOWED = false as const;
export const D1K_R4_MANUAL_REFERENCE_EQUALS_AUTHENTICATED_SOURCE = false as const;
export const D1K_R4_MANUAL_REFERENCE_EQUALS_ENGINEERING_APPROVED = false as const;
export const D1K_R4_MANUAL_REFERENCE_EQUALS_SOURCE_CORRECT = false as const;
export const D1K_R4_COMPOSITION_SUCCESS_EQUALS_COMPATIBLE = false as const;
export const D1K_R4_COMPOSITION_SUCCESS_EQUALS_ENGINEERING_APPROVED = false as const;
export const D1K_R4_COMPOSITION_SUCCESS_EQUALS_STRUCTURAL_ACCEPTED = false as const;
export const D1K_R4_COMPOSITION_SUCCESS_EQUALS_SOURCE_CORRECT = false as const;
export const D1K_R4_CROSS_WORKSPACE_REFERENCE_COMPOSITION_ALLOWED = false as const;
export const D1K_R4_EXTERNAL_SOURCE_CAN_IMPERSONATE_NATIVE_EOS_SOURCE = false as const;
export const D1K_R4_MANUAL_SOURCE_CAN_IMPERSONATE_NATIVE_EOS_SOURCE = false as const;
export const D1K_R4_AI_CAN_PROMOTE_UNGOVERNED_SOURCE_TO_GOVERNED = false as const;
export const D1K_R4_AI_CAN_INVENT_EXTERNAL_SOURCE_METADATA = false as const;
export const D1K_R4_AI_CAN_APPROVE_EXTERNAL_REFERENCE = false as const;
export const D1K_R4_AI_CAN_APPROVE_ENGINEERING = false as const;
export const D1K_R4_D1L_STARTED = false as const;
export const D1K_R4_D1M_ABSORBED = false as const;
export const D1K_R4_D1N_ABSORBED = false as const;
export const D1K_R4_DATABASE_SCHEMA_CHANGE_REQUIRED = false as const;
export const D1K_R4_NEW_DEPENDENCY_COUNT = 0 as const;
export const D1K_R4_POST_D1J_DEBT_PRESERVED = true as const;
export const D1K_R4_UNAUTHORIZED_PRODUCT_CLAIM = false as const;
export const D1K_R4_SECOND_FINGERPRINT_ALGORITHM_CREATED = false as const;
export const D1K_R5_COMPOSITION_READY = true as const;
export const D1K_R5_CANONICAL_PHASE = "EOS-D1K-R5-CROSS-DISCIPLINE-STRUCTURAL-INTERFACES-CLOSEOUT" as const;
export const D1K_R5_PHASE_TYPE = "STRUCTURAL_INTERFACE_CROSS_DISCIPLINE_CLOSEOUT" as const;
export const D1K_R5_CANONICAL_SCOPE =
  "Close the bounded D1K track by recording architecture, reference runtime, compatibility, lifecycle governance, external and manual composition, and the future internal seam. Do not grant D9 intelligence, cycle detection, D1L certification, or engineering approval." as const;

export type D1kR4CompositionResult = {
  compositionId: string;
  interfaceId: string;
  sourceClass: D1kSourceClass;
  sourceId: string;
  sourceDiscipline: string;
  sourceRevision: string;
  sourceAuthority: string;
  evidence: string;
  provenance: string;
  structuralTargetId: string;
  relation: string;
  sourceFingerprint: string;
  interfaceFingerprint: string;
  humanReviewRequired: boolean;
  actorId: string;
  actorAuthority: string;
  admissible: true;
  compatible: false;
  engineeringApproval: false;
  structuralAccepted: false;
  sourceCorrect: false;
  authenticatedSource: false;
  nativePackIntegration: false;
  externalReferenceOperational: false;
  liveDisciplineProvider: false;
  fingerprint: string;
  recordedAt: string;
};

export type D1kR4Store = {
  now: () => string;
  results: D1kR4CompositionResult[];
};

export type D1kR4NativeSeamAssessment = {
  sourceClass: "NATIVE_EOS_DISCIPLINE_SOURCE";
  contractComplete: true;
  admissible: boolean;
  liveProvider: false;
  internalIntegrationReady: false;
  sourceDiscipline: string;
};

type CompositionInput = D1kR1InterfaceInput & {
  claimedSourceClass: string;
  payload?: unknown;
  engineeringApproval?: boolean;
};

function fail(code: string): never {
  throw new Error(code);
}

function blockedAuthority(value: string): boolean {
  const authority = value.trim();
  return !authority || /^AI(?:\b|_)/i.test(authority) || /LLM/i.test(authority) || /OPTIMIZER/i.test(authority) || /^SYSTEM$/i.test(authority);
}

function isSourceClass(value: string): value is D1kSourceClass {
  return (D1K_SOURCE_CLASSES as readonly string[]).includes(value);
}

export function classifyGovernedSource(sourceClass: string): D1kSourceClass {
  if (!isSourceClass(sourceClass)) fail("SOURCE_CLASS_INVALID");
  return sourceClass;
}

function assertComposer(actor: D1kR3Actor): void {
  if (!actor.actorId.trim() || blockedAuthority(actor.authority) || actor.role !== "PROVIDER") fail("UNAUTHORIZED");
}

function rejectUngoverned(input: CompositionInput): void {
  if (input.payload !== undefined) fail("ARBITRARY_PAYLOAD_REJECTED");
  if (input.engineeringApproval === true) fail("DIRECT_STATE_INJECTION_REJECTED");
}

function locateSource(interfaces: D1kR1Store, actor: D1kR3Actor, sourceId: string): D1kR1CatalogSource {
  const source = interfaces.catalog.sources.find((row) => row.sourceId === sourceId);
  if (!source) fail("SOURCE_NOT_FOUND");
  if (actor.tenantId !== source.tenantId) fail("CROSS_TENANT_OPERATION");
  if (actor.workspaceId !== source.workspaceId || actor.projectId !== source.projectId) fail("CROSS_PROJECT_OPERATION");
  return source;
}

function compose(interfaces: D1kR1Store, store: D1kR4Store, actor: D1kR3Actor, input: CompositionInput, requiredClass: D1kSourceClass): D1kR4CompositionResult {
  rejectUngoverned(input);
  assertComposer(actor);
  const source = locateSource(interfaces, actor, input.sourceId);
  const sourceClass = classifyGovernedSource(source.sourceClass);
  if (!isSourceClass(input.claimedSourceClass) || input.claimedSourceClass !== sourceClass) fail("SOURCE_ORIGIN_SPOOFING");
  if (sourceClass !== requiredClass) fail("SOURCE_ORIGIN_MISMATCH");
  const record = registerStructuralInterfaceIdentity(interfaces, actor, input);
  const draft = {
    compositionId: input.interfaceId,
    interfaceId: record.interfaceId,
    sourceClass,
    sourceId: record.sourceId,
    sourceDiscipline: record.sourceDiscipline,
    sourceRevision: record.sourceRevision,
    sourceAuthority: record.sourceAuthority,
    evidence: record.evidence,
    provenance: record.provenance,
    structuralTargetId: record.structuralTargetId,
    relation: record.relation,
    sourceFingerprint: record.sourceFingerprint,
    interfaceFingerprint: record.fingerprint,
    humanReviewRequired: record.humanReviewRequired,
    actorId: actor.actorId,
    actorAuthority: actor.authority,
    admissible: true as const,
    compatible: false as const,
    engineeringApproval: false as const,
    structuralAccepted: false as const,
    sourceCorrect: false as const,
    authenticatedSource: false as const,
    nativePackIntegration: false as const,
    externalReferenceOperational: false as const,
    liveDisciplineProvider: false as const,
  };
  const fingerprint = fingerprintCanonical(draft);
  const existing = store.results.find((row) => row.fingerprint === fingerprint);
  if (existing) return existing;
  const result: D1kR4CompositionResult = { ...draft, fingerprint, recordedAt: store.now() };
  store.results.push(result);
  return result;
}

export function createD1kR4Store(now: () => string): D1kR4Store {
  return { now, results: [] };
}

export function composeExternalGovernedReference(interfaces: D1kR1Store, store: D1kR4Store, actor: D1kR3Actor, input: CompositionInput): D1kR4CompositionResult {
  return compose(interfaces, store, actor, input, "EXTERNAL_GOVERNED_ENGINEERING_SOURCE");
}

export function composeManualGovernedReference(interfaces: D1kR1Store, store: D1kR4Store, actor: D1kR3Actor, input: CompositionInput): D1kR4CompositionResult {
  return compose(interfaces, store, actor, input, "MANUAL_GOVERNED_REFERENCE");
}

export function assessNativeEosSourceSeam(interfaces: D1kR1Store, actor: D1kR3Actor, sourceId: string): D1kR4NativeSeamAssessment {
  if (!actor.actorId.trim() || blockedAuthority(actor.authority)) fail("UNAUTHORIZED");
  const source = locateSource(interfaces, actor, sourceId);
  const sourceClass = classifyGovernedSource(source.sourceClass);
  if (sourceClass !== "NATIVE_EOS_DISCIPLINE_SOURCE") fail("SOURCE_CLASS_INVALID");
  if (!source.objectId.trim() || !source.documentId.trim() || !source.revision.trim() || !source.authority.trim() || !source.evidenceId.trim() || !source.provenanceRef.trim()) {
    fail("INCOMPLETE_SOURCE_METADATA");
  }
  if (source.sourceDiscipline !== "structural" || source.nativePackContractExposed !== false) fail("SOURCE_PACK_NOT_STARTED");
  return {
    sourceClass,
    contractComplete: true,
    admissible: true,
    liveProvider: false,
    internalIntegrationReady: false,
    sourceDiscipline: source.sourceDiscipline,
  };
}

export function diagnoseComposedReference(interfaces: D1kR1Store, compatibility: D1kR2Store, actor: D1kR3Actor, composition: D1kR4CompositionResult, sourceMetadata: D1kR2Metadata, receivingRequirement: D1kR2Requirement): D1kR2Result {
  const record = inspectStructuralInterfaceIdentity(interfaces, actor, composition.interfaceId);
  if (record.sourceClass !== composition.sourceClass || record.sourceFingerprint !== composition.sourceFingerprint) fail("SOURCE_CLASS_NOT_PRESERVED");
  return evaluateInterfaceCompatibility(interfaces, compatibility, actor, {
    resultId: `${composition.compositionId}-compatibility`,
    interfaceId: record.interfaceId,
    expectedInterfaceFingerprint: record.fingerprint,
    expectedSourceFingerprint: record.sourceFingerprint,
    sourceMetadata,
    receivingRequirement,
  });
}

export function provisionComposedReference(interfaces: D1kR1Store, governance: D1kR3Store, actor: D1kR3Actor, composition: D1kR4CompositionResult): D1kR3Event {
  return recordInterfaceProvision(interfaces, governance, actor, {
    eventId: `${composition.compositionId}-provision`,
    interfaceId: composition.interfaceId,
    sourceId: composition.sourceId,
    sourceFingerprint: composition.sourceFingerprint,
  });
}

export function supersedeComposedReference(interfaces: D1kR1Store, governance: D1kR3Store, actor: D1kR3Actor, composition: D1kR4CompositionResult, successor: D1kR1InterfaceInput): { predecessor: D1kR1InterfaceRecord; successor: D1kR1InterfaceRecord; events: readonly D1kR3Event[] } {
  const before = inspectStructuralInterfaceIdentity(interfaces, actor, composition.interfaceId);
  const changed = recordInterfaceSourceChange(interfaces, governance, actor, { eventId: `${composition.compositionId}-change`, predecessorInterfaceId: before.interfaceId, successor });
  if (before.sourceRevision !== composition.sourceRevision || before.sourceFingerprint !== composition.sourceFingerprint) fail("SOURCE_MUTATION_REJECTED");
  return changed;
}
