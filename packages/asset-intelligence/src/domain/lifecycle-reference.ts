/**
 * Phase 10G — Canonical lifecycle reference (read-only from Shared Domain).
 */

export type CanonicalLifecycleStage =
  | "design"
  | "procurement"
  | "fabrication"
  | "construction"
  | "installation"
  | "commissioning"
  | "operation"
  | "mothball"
  | "decommissioning"
  | "retired"
  | "unknown";

export type AssetLifecycleReference = {
  kind: "canonical_lifecycle_reference";
  assetId: string;
  canonicalLifecycleStage: CanonicalLifecycleStage;
  stageVersion: number;
  effectiveAt: string;
  sourceOwner: "engineering_os_shared_domain";
  sourceReference?: string;
  /** Asset Intelligence must not write back. */
  writeBackForbidden: true;
};

export type OperatingState =
  | "operating"
  | "standby"
  | "offline"
  | "shutdown"
  | "isolated"
  | "unknown";

export type MaintenanceState =
  | "available"
  | "inspection_due"
  | "under_inspection"
  | "maintenance_planned"
  | "maintenance_in_progress"
  | "repair_pending"
  | "unknown";

export function createAssetLifecycleReference(input: {
  assetId: string;
  canonicalLifecycleStage: CanonicalLifecycleStage;
  stageVersion?: number;
  effectiveAt: string;
  sourceReference?: string;
}): AssetLifecycleReference {
  return {
    kind: "canonical_lifecycle_reference",
    assetId: input.assetId,
    canonicalLifecycleStage: input.canonicalLifecycleStage,
    stageVersion: input.stageVersion ?? 1,
    effectiveAt: input.effectiveAt,
    sourceOwner: "engineering_os_shared_domain",
    sourceReference: input.sourceReference,
    writeBackForbidden: true,
  };
}
