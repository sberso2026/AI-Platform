/**
 * Phase 12K — Digital Thread traversal (as-of, historical, current-reference).
 */

import type { DigitalThreadSnapshot } from "./digital-thread-snapshot";
import type { DigitalThreadReference } from "./digital-thread-reference";
import type { DigitalThreadRelationship } from "./digital-thread-relationship";

export const TRAVERSAL_MODES = ["as_of", "historical", "current_reference"] as const;
export type DigitalThreadTraversalMode = (typeof TRAVERSAL_MODES)[number];

export type DigitalThreadTraversalResult = {
  twinId: string;
  mode: DigitalThreadTraversalMode;
  asOf?: string;
  snapshotId?: string;
  references: readonly DigitalThreadReference[];
  relationships: readonly DigitalThreadRelationship[];
  /** Simulation package + four-layer qualification traversable when present as refs. */
  simulationPackageTraversable: boolean;
  fourLayerQualificationTraversable: boolean;
  causalInferencePerformed: false;
  traversedAt: string;
};

export function traverseDigitalThread(input: {
  twinId: string;
  mode: DigitalThreadTraversalMode;
  snapshot: DigitalThreadSnapshot;
  asOf?: string;
}): DigitalThreadTraversalResult {
  const refs = input.snapshot.references;
  const simulationPackageTraversable = refs.some(
    (r) =>
      r.kind === "simulation_package" ||
      r.kind === "simulation_run" ||
      r.kind === "simulation_result" ||
      r.kind === "simulated_state",
  );
  const fourLayerQualificationTraversable = refs.some(
    (r) =>
      r.kind === "method_qualification" ||
      r.kind === "provider_qualification" ||
      r.kind === "application_qualification" ||
      r.kind === "execution_qualification" ||
      r.kind === "capability_qualification",
  );

  return {
    twinId: input.twinId,
    mode: input.mode,
    asOf: input.asOf ?? input.snapshot.asOf,
    snapshotId: input.snapshot.threadSnapshotId,
    references: refs,
    relationships: input.snapshot.relationships,
    simulationPackageTraversable,
    fourLayerQualificationTraversable,
    causalInferencePerformed: false,
    traversedAt: new Date().toISOString(),
  };
}
