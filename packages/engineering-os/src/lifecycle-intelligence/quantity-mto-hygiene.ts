/**
 * EOS-A15A-V4D snapshot hygiene classification.
 * Does not delete. Governed references always preserve lineage.
 */

export const MTO_SNAPSHOT_HYGIENE_CLASSES = [
  "CURRENT",
  "SUPERSEDED",
  "FAILED_SEED_LEFTOVER",
  "TEST_FIXTURE_REQUIRED",
  "ORPHANED",
  "GOVERNED_REFERENCED",
] as const;

export type MtoSnapshotHygieneClass = (typeof MTO_SNAPSHOT_HYGIENE_CLASSES)[number];

export type MtoSnapshotHygieneInput = {
  id: string;
  status: string;
  revision: string;
  workPlanId: string | null;
  snapshotFingerprint: string;
  currentSnapshotId: string | null;
  referencedByArtifactIds: readonly string[];
  referencedByObjectLinkCount: number;
  referencedByChangeImpact: boolean;
  referencedByReview: boolean;
  knownFailedSeed: boolean;
};

export type MtoSnapshotHygieneResult = {
  id: string;
  classification: MtoSnapshotHygieneClass;
  mayCleanup: boolean;
  reason: string;
};

export function classifyMtoSnapshotHygiene(input: MtoSnapshotHygieneInput): MtoSnapshotHygieneResult {
  const governedRefs =
    input.referencedByArtifactIds.length > 0
    || input.referencedByObjectLinkCount > 0
    || input.referencedByChangeImpact
    || input.referencedByReview;
  if (governedRefs) {
    return {
      id: input.id,
      classification: input.status === "SUPERSEDED" ? "SUPERSEDED" : "GOVERNED_REFERENCED",
      mayCleanup: false,
      reason: "Governed inbound reference exists. Lineage must be preserved.",
    };
  }
  if (input.currentSnapshotId === input.id && input.status !== "SUPERSEDED") {
    return {
      id: input.id,
      classification: "CURRENT",
      mayCleanup: false,
      reason: "Current Work Plan snapshot.",
    };
  }
  if (input.status === "SUPERSEDED") {
    return {
      id: input.id,
      classification: "SUPERSEDED",
      mayCleanup: false,
      reason: "Superseded snapshot. No canonical delete path.",
    };
  }
  if (input.knownFailedSeed) {
    return {
      id: input.id,
      classification: "FAILED_SEED_LEFTOVER",
      mayCleanup: false,
      reason: "Failed certification seed leftover. No governed application delete path; classify only.",
    };
  }
  if (!input.workPlanId) {
    return {
      id: input.id,
      classification: "ORPHANED",
      mayCleanup: false,
      reason: "No Work Plan binding. No canonical delete path.",
    };
  }
  return {
    id: input.id,
    classification: "TEST_FIXTURE_REQUIRED",
    mayCleanup: false,
    reason: "Unreferenced but not proven leftover. Preserve.",
  };
}
