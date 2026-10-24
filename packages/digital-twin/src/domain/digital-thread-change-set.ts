/**
 * Phase 12K — Digital Thread change set (diff two snapshots).
 */

import type { DigitalThreadSnapshot } from "./digital-thread-snapshot";

export const CHANGE_SET_CHANGE_KINDS = [
  "added",
  "removed",
  "superseded",
  "version_changed",
  "relationship_changed",
  "qualification_changed",
  "review_status_changed",
  "provenance_changed",
  "unknown",
] as const;

export type DigitalThreadChangeKind = (typeof CHANGE_SET_CHANGE_KINDS)[number];

export type DigitalThreadChangeEntry = {
  changeKind: DigitalThreadChangeKind;
  subjectRef: string;
  detail?: string;
};

export type DigitalThreadChangeSet = {
  changeSetId: string;
  twinId: string;
  fromSnapshotId: string;
  toSnapshotId: string;
  changes: readonly DigitalThreadChangeEntry[];
  comparedAt: string;
  causalInferencePerformed: false;
};

export function diffDigitalThreadSnapshots(input: {
  changeSetId: string;
  twinId: string;
  from: DigitalThreadSnapshot;
  to: DigitalThreadSnapshot;
}): DigitalThreadChangeSet {
  const changes: DigitalThreadChangeEntry[] = [];
  const fromRefs = new Map(input.from.references.map((r) => [r.threadReferenceId, r]));
  const toRefs = new Map(input.to.references.map((r) => [r.threadReferenceId, r]));

  for (const [id, ref] of toRefs) {
    const prev = fromRefs.get(id);
    if (!prev) {
      changes.push({ changeKind: "added", subjectRef: ref.targetRef });
    } else if (prev.targetVersion !== ref.targetVersion) {
      changes.push({
        changeKind: "version_changed",
        subjectRef: ref.targetRef,
        detail: `${prev.targetVersion ?? "unknown"}→${ref.targetVersion ?? "unknown"}`,
      });
    }
  }
  for (const [id, ref] of fromRefs) {
    if (!toRefs.has(id)) {
      changes.push({ changeKind: "removed", subjectRef: ref.targetRef });
    }
  }

  const fromRels = new Map(
    input.from.relationships.map((r) => [r.threadRelationshipId, r]),
  );
  const toRels = new Map(input.to.relationships.map((r) => [r.threadRelationshipId, r]));
  for (const [id, rel] of toRels) {
    const prev = fromRels.get(id);
    if (!prev) {
      changes.push({
        changeKind: "relationship_changed",
        subjectRef: rel.threadRelationshipId,
        detail: "added",
      });
    } else if (prev.relationshipType !== rel.relationshipType) {
      changes.push({
        changeKind: "relationship_changed",
        subjectRef: rel.threadRelationshipId,
        detail: `${prev.relationshipType}→${rel.relationshipType}`,
      });
    }
    if (rel.relationshipType === "supersedes") {
      changes.push({
        changeKind: "superseded",
        subjectRef: rel.toReferenceId,
        detail: rel.fromReferenceId,
      });
    }
  }
  for (const [id] of fromRels) {
    if (!toRels.has(id)) {
      changes.push({
        changeKind: "relationship_changed",
        subjectRef: id,
        detail: "removed",
      });
    }
  }

  const fromProv = new Map(input.from.provenance.map((p) => [p.provenanceId, p]));
  const toProv = new Map(input.to.provenance.map((p) => [p.provenanceId, p]));
  for (const [id, p] of toProv) {
    const prev = fromProv.get(id);
    if (!prev) {
      changes.push({ changeKind: "provenance_changed", subjectRef: p.sourceReference });
    } else {
      if (prev.provenanceStatus !== p.provenanceStatus) {
        changes.push({
          changeKind: "provenance_changed",
          subjectRef: p.sourceReference,
          detail: `${prev.provenanceStatus}→${p.provenanceStatus}`,
        });
      }
      if (prev.reviewStatus !== p.reviewStatus) {
        changes.push({
          changeKind: "review_status_changed",
          subjectRef: p.sourceReference,
          detail: `${prev.reviewStatus}→${p.reviewStatus}`,
        });
      }
    }
  }

  const qualKinds = new Set([
    "method_qualification",
    "provider_qualification",
    "application_qualification",
    "execution_qualification",
    "capability_qualification",
  ]);
  for (const [id, ref] of toRefs) {
    const prev = fromRefs.get(id);
    if (qualKinds.has(ref.kind) && prev && prev.targetVersion !== ref.targetVersion) {
      changes.push({
        changeKind: "qualification_changed",
        subjectRef: ref.targetRef,
      });
    }
  }

  if (changes.length === 0 && input.from.threadSnapshotId !== input.to.threadSnapshotId) {
    changes.push({
      changeKind: "unknown",
      subjectRef: input.to.threadSnapshotId,
      detail: "snapshot_identity_changed_without_detected_diff",
    });
  }

  return {
    changeSetId: input.changeSetId,
    twinId: input.twinId,
    fromSnapshotId: input.from.threadSnapshotId,
    toSnapshotId: input.to.threadSnapshotId,
    changes,
    comparedAt: new Date().toISOString(),
    causalInferencePerformed: false,
  };
}
