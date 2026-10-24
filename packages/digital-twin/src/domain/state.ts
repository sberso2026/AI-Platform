/**
 * Phase 12C — Governed twin state model (versioned, provenance required).
 *
 * Observed ≠ derived ≠ simulated (simulated remains reserved; no execution).
 * Fail closed without provenance — no fabricated state.
 */

export const STATE_REFERENCE_CATEGORIES = [
  "observed",
  "derived",
  "operational",
  "simulated",
] as const;

export type StateReferenceCategory = (typeof STATE_REFERENCE_CATEGORIES)[number];

export const TWIN_STATE_LIFECYCLE = [
  "draft",
  "pending_review",
  "published",
  "superseded",
  "archived",
] as const;

export type TwinStateLifecycle = (typeof TWIN_STATE_LIFECYCLE)[number];

export type StateReviewStatus = "not_reviewed" | "pending_review" | "approved" | "rejected";

export type StateProvenance = {
  sourceModule: string;
  sourceRef: string;
  capturedAt: string;
  method?: string;
  methodVersion?: string;
};

export type StateReferenceBase = {
  stateRefId: string;
  twinId: string;
  tenantId: string;
  workspaceId: string;
  category: StateReferenceCategory;
  version: number;
  provenance: StateProvenance;
  status: "draft" | "active" | "superseded" | "archived";
  createdAt: string;
  updatedAt: string;
  /** Pointer to external state snapshot — not inline telemetry */
  externalRef: string;
};

/** Observed state from telemetry or field observation (reference only). */
export type TwinObservedState = StateReferenceBase & {
  category: "observed";
  observedAt: string;
  liveIngestionEnabled: false;
};

/** Derived state computed from other sources (reference only). */
export type TwinDerivedState = StateReferenceBase & {
  category: "derived";
  derivedFromRefs: string[];
};

/** Operational state from engineering systems (reference only). */
export type OperationalStateReference = StateReferenceBase & {
  category: "operational";
  operationalContext?: string;
};

/** Simulated state — reserved, execution forbidden. */
export type SimulatedStateReference = StateReferenceBase & {
  category: "simulated";
  simulationExecuted: false;
  simulationScenarioRef?: string;
};

export type TwinStateReference =
  | TwinObservedState
  | TwinDerivedState
  | OperationalStateReference
  | SimulatedStateReference;

/** @deprecated alias */
export type ObservedStateReference = TwinObservedState;
/** @deprecated alias */
export type DerivedStateReference = TwinDerivedState;

export type TwinStateVersion = {
  stateVersionId: string;
  stateId: string;
  twinId: string;
  tenantId: string;
  workspaceId: string;
  versionNumber: number;
  category: StateReferenceCategory;
  lifecycle: TwinStateLifecycle;
  provenance: StateProvenance;
  externalRef: string;
  confidence?: number;
  evidenceRefs: string[];
  reviewStatus: StateReviewStatus;
  createdAt: string;
  createdBy?: string;
  simulationExecuted: false;
  storesTelemetryPayload: false;
};

export type TwinState = {
  stateId: string;
  twinId: string;
  tenantId: string;
  workspaceId: string;
  category: StateReferenceCategory;
  lifecycle: TwinStateLifecycle;
  currentVersion: number;
  provenance: StateProvenance;
  externalRef: string;
  confidence?: number;
  evidenceRefs: string[];
  reviewStatus: StateReviewStatus;
  reviewWorkflowInstanceId?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  supersededAt?: string;
  supersededByStateId?: string;
  createdBy?: string;
  simulationExecuted: false;
  liveIngestionEnabled: false;
  storesTelemetryPayload: false;
};

export type TwinStateSnapshot = {
  snapshotId: string;
  twinId: string;
  tenantId: string;
  workspaceId: string;
  /** Versioned state references only — no telemetry payloads */
  stateVersionRefs: Array<{ stateId: string; stateVersionId: string; versionNumber: number }>;
  representationVersionIds?: string[];
  label?: string;
  createdAt: string;
  createdBy?: string;
  storesTelemetryPayload: false;
};

export function assertProvenanceRequired(provenance: StateProvenance | undefined): void {
  if (!provenance?.sourceModule || !provenance?.sourceRef || !provenance?.capturedAt) {
    throw new Error("twin_state_provenance_required");
  }
}

export function assertSimulatedNotObserved(
  observed: TwinObservedState | undefined,
  simulated: SimulatedStateReference | undefined,
): void {
  if (observed && simulated && observed.externalRef === simulated.externalRef) {
    throw new Error("simulated_state_must_not_equal_observed_state");
  }
}

export function assertNoFabricatedState(input: {
  provenance?: StateProvenance;
  externalRef?: string;
}): void {
  assertProvenanceRequired(input.provenance);
  if (!input.externalRef) {
    throw new Error("twin_state_external_ref_required");
  }
}

export function assertObservedNotDerived(
  observed: TwinObservedState | TwinDerivedState,
  derived: TwinDerivedState | TwinObservedState,
): void {
  if (
    observed.category === "observed" &&
    derived.category === "derived" &&
    observed.externalRef === derived.externalRef
  ) {
    throw new Error("observed_state_must_not_equal_derived_state");
  }
}
