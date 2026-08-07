/**
 * Phase 10B — Asset Snapshot (composed read view; not a registry).
 */

import type {
  AssetConditionState,
  AssetCriticalityState,
  AssetIdentityReference,
  Provenance,
} from "../architecture/identity-state";
import type { AssetHealthIndexState } from "./health-index";

export type SnapshotIntelligenceContribution = {
  kind: "condition" | "health_index" | "criticality";
  stateId: string;
  recordedAt: string;
  provenance: Provenance;
  mutatesIdentity: false;
};

export type AssetSnapshot = {
  identity: AssetIdentityReference;
  asOf: string;
  registerVersion?: string;
  /** Intelligence contributions only — never a second asset register. */
  condition?: AssetConditionState;
  healthIndex?: AssetHealthIndexState;
  criticality?: AssetCriticalityState;
  contributions: SnapshotIntelligenceContribution[];
  isAssetRegistry: false;
  mutatesIdentity: false;
};

export function composeAssetSnapshot(input: {
  identity: AssetIdentityReference;
  asOf: string;
  registerVersion?: string;
  condition?: AssetConditionState;
  healthIndex?: AssetHealthIndexState;
  criticality?: AssetCriticalityState;
}): AssetSnapshot {
  const contributions: SnapshotIntelligenceContribution[] = [];
  if (input.condition) {
    contributions.push({
      kind: "condition",
      stateId: input.condition.stateId,
      recordedAt: input.condition.recordedAt,
      provenance: input.condition.provenance,
      mutatesIdentity: false,
    });
  }
  if (input.healthIndex) {
    contributions.push({
      kind: "health_index",
      stateId: input.healthIndex.stateId,
      recordedAt: input.healthIndex.recordedAt,
      provenance: input.healthIndex.provenance,
      mutatesIdentity: false,
    });
  }
  if (input.criticality) {
    contributions.push({
      kind: "criticality",
      stateId: input.criticality.stateId,
      recordedAt: input.criticality.recordedAt,
      provenance: input.criticality.provenance,
      mutatesIdentity: false,
    });
  }
  return {
    identity: input.identity,
    asOf: input.asOf,
    registerVersion: input.registerVersion,
    condition: input.condition,
    healthIndex: input.healthIndex,
    criticality: input.criticality,
    contributions,
    isAssetRegistry: false,
    mutatesIdentity: false,
  };
}
