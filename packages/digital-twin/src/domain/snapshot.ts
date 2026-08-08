/**
 * Phase 12C — Twin snapshots (versioned state references only).
 */

import type { TwinStateSnapshot } from "./state";

export type TwinSnapshot = TwinStateSnapshot;

export function assertSnapshotNoTelemetry(snapshot: TwinSnapshot): void {
  if (snapshot.storesTelemetryPayload) {
    throw new Error("snapshot_telemetry_payload_forbidden");
  }
  if (snapshot.stateVersionRefs.length === 0) {
    throw new Error("snapshot_requires_state_version_refs");
  }
}
