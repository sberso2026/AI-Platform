/**
 * Phase 12C/12G — Twin snapshots (versioned state references only).
 *
 * Optional simulatedStateRefs / activeScenarioRefs are distinct from observed
 * stateVersionRefs and must not silently replace them.
 */

import type { TwinStateSnapshot } from "./state";

export type TwinSnapshot = TwinStateSnapshot & {
  /** Optional refs into the simulated-state plane — never merge with observed. */
  simulatedStateRefs?: string[];
  activeScenarioRefs?: string[];
};

export function assertSnapshotNoTelemetry(snapshot: TwinSnapshot): void {
  if (snapshot.storesTelemetryPayload) {
    throw new Error("snapshot_telemetry_payload_forbidden");
  }
  if (snapshot.stateVersionRefs.length === 0) {
    throw new Error("snapshot_requires_state_version_refs");
  }
}

export function assertSnapshotPreservesStatePlanes(snapshot: TwinSnapshot): void {
  assertSnapshotNoTelemetry(snapshot);
  const observedIds = new Set(
    snapshot.stateVersionRefs.map((r) => r.stateId),
  );
  for (const simRef of snapshot.simulatedStateRefs ?? []) {
    if (observedIds.has(simRef)) {
      throw new Error("simulated_state_ref_must_not_collide_with_observed");
    }
  }
}
