/**
 * Phase 12K — DigitalThreadSnapshot (versioned as-of view; refs only).
 * Does NOT replace TwinSnapshot / TwinTimeline — integrates them by reference.
 */

import type { DigitalThreadReference } from "./digital-thread-reference";
import type { DigitalThreadRelationship } from "./digital-thread-relationship";
import type { DigitalThreadProvenance } from "./digital-thread-provenance";

export type DigitalThreadSnapshot = {
  threadSnapshotId: string;
  twinId: string;
  tenantId: string;
  workspaceId: string;
  snapshotVersion: string;
  asOf: string;
  /** Existing Twin Thread (12B) integrated by reference — not duplicated. */
  twinThreadRef?: string;
  /** TwinSnapshot integrated by reference — DigitalThreadSnapshot does NOT replace it. */
  twinSnapshotRef?: string;
  twinTimelineRef?: string;
  references: readonly DigitalThreadReference[];
  relationships: readonly DigitalThreadRelationship[];
  provenance: readonly DigitalThreadProvenance[];
  /** Refs only — never embeds Assets/Projects/documents/II/AI/PC/PI/TS/KG/sim binaries. */
  compositionMode: "references_only";
  replacesTwinSnapshot: false;
  duplicatesSourceStores: false;
  composedAt: string;
  composedBy?: string;
  status: "draft" | "composed" | "reviewed" | "published" | "superseded";
};

export function createDigitalThreadSnapshot(input: {
  threadSnapshotId: string;
  twinId: string;
  tenantId: string;
  workspaceId: string;
  snapshotVersion: string;
  asOf: string;
  twinThreadRef?: string;
  twinSnapshotRef?: string;
  twinTimelineRef?: string;
  references?: readonly DigitalThreadReference[];
  relationships?: readonly DigitalThreadRelationship[];
  provenance?: readonly DigitalThreadProvenance[];
  composedBy?: string;
  status?: DigitalThreadSnapshot["status"];
}): DigitalThreadSnapshot {
  return {
    threadSnapshotId: input.threadSnapshotId,
    twinId: input.twinId,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    snapshotVersion: input.snapshotVersion,
    asOf: input.asOf,
    twinThreadRef: input.twinThreadRef,
    twinSnapshotRef: input.twinSnapshotRef,
    twinTimelineRef: input.twinTimelineRef,
    references: input.references ?? [],
    relationships: input.relationships ?? [],
    provenance: input.provenance ?? [],
    compositionMode: "references_only",
    replacesTwinSnapshot: false,
    duplicatesSourceStores: false,
    composedAt: new Date().toISOString(),
    composedBy: input.composedBy,
    status: input.status ?? "composed",
  };
}

export function assertSnapshotRefsOnly(snapshot: DigitalThreadSnapshot): {
  ok: true;
  replacesTwinSnapshot: false;
} {
  if (snapshot.compositionMode !== "references_only") {
    throw new Error("digital_thread_snapshot_must_be_references_only");
  }
  if (snapshot.replacesTwinSnapshot !== false) {
    throw new Error("digital_thread_snapshot_must_not_replace_twin_snapshot");
  }
  if (snapshot.duplicatesSourceStores !== false) {
    throw new Error("digital_thread_must_not_duplicate_source_stores");
  }
  for (const ref of snapshot.references) {
    if (ref.ownershipClaimed !== false || ref.duplicatesSourceStore !== false) {
      throw new Error("digital_thread_reference_ownership_or_duplication_forbidden");
    }
  }
  return { ok: true, replacesTwinSnapshot: false };
}
