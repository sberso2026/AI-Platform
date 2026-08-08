/**
 * Phase 12B — State reference containers (versioned, provenance required).
 *
 * Simulated state is reserved/empty support — simulated ≠ observed locks enforced.
 */

export const STATE_REFERENCE_CATEGORIES = [
  "observed",
  "derived",
  "operational",
  "simulated",
] as const;

export type StateReferenceCategory = (typeof STATE_REFERENCE_CATEGORIES)[number];

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
export type ObservedStateReference = StateReferenceBase & {
  category: "observed";
  observedAt: string;
  liveIngestionEnabled: false;
};

/** Derived state computed from other sources (reference only). */
export type DerivedStateReference = StateReferenceBase & {
  category: "derived";
  derivedFromRefs: string[];
};

/** Operational state from engineering systems (reference only). */
export type OperationalStateReference = StateReferenceBase & {
  category: "operational";
  operationalContext?: string;
};

/** Simulated state — reserved, execution forbidden in Phase 12B. */
export type SimulatedStateReference = StateReferenceBase & {
  category: "simulated";
  simulationExecuted: false;
  simulationScenarioRef?: string;
};

export type TwinStateReference =
  | ObservedStateReference
  | DerivedStateReference
  | OperationalStateReference
  | SimulatedStateReference;

export function assertSimulatedNotObserved(
  observed: ObservedStateReference | undefined,
  simulated: SimulatedStateReference | undefined,
): void {
  if (observed && simulated && observed.externalRef === simulated.externalRef) {
    throw new Error("simulated_state_must_not_equal_observed_state");
  }
}
