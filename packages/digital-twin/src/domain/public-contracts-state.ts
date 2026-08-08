/**
 * Phase 12D — Digital Twin state public contracts (0.4.0-ingestion-draft).
 */

import { PUBLIC_CONTRACT_VERSION } from "../version";
import type { TwinState, TwinStateSnapshot } from "./state";
import type { RepresentationVersion } from "./representation-versioning";

export const STATE_CONTRACT_FAMILIES = [
  "TwinStateCore",
  "TwinStateVersionCore",
  "TwinSnapshotCore",
  "RepresentationVersionCore",
  "TwinStateHistoryCore",
  "ObservedStateCandidateCore",
  "StateReconciliationCore",
  "SourceAdapterCore",
] as const;

export type StateContractFamily = (typeof STATE_CONTRACT_FAMILIES)[number];

export type TwinStateCore = {
  contractVersion: typeof PUBLIC_CONTRACT_VERSION;
  stateId: string;
  twinId: string;
  category: TwinState["category"];
  lifecycle: TwinState["lifecycle"];
  currentVersion: number;
  externalRef: string;
  reviewStatus: TwinState["reviewStatus"];
  storesTelemetryPayload: false;
};

export type TwinSnapshotCore = {
  contractVersion: typeof PUBLIC_CONTRACT_VERSION;
  snapshotId: string;
  twinId: string;
  stateVersionRefCount: number;
  storesTelemetryPayload: false;
};

export type RepresentationVersionCore = {
  contractVersion: typeof PUBLIC_CONTRACT_VERSION;
  representationVersionId: string;
  twinId: string;
  representationType: RepresentationVersion["representationType"];
  revision: string;
  effectiveDate: string;
  overwritesHistoricalVersion: false;
};

export function assertStateContracts(): { ok: true; contractVersion: typeof PUBLIC_CONTRACT_VERSION } {
  if (PUBLIC_CONTRACT_VERSION !== "0.9.0-external-solver-draft") {
    throw new Error("state_contracts_require_0_9_0_external_solver_draft");
  }
  return { ok: true, contractVersion: PUBLIC_CONTRACT_VERSION };
}
