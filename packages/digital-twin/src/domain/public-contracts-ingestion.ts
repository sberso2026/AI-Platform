/**
 * Phase 12D/12E — Digital Twin ingestion public contracts (retained in 12E).
 */

import { PUBLIC_CONTRACT_VERSION } from "../version";

export const INGESTION_CONTRACT_FAMILIES = [
  "ObservedStateCandidateCore",
  "StateReconciliationCore",
  "SourceAdapterCore",
  "TwinStateSchemaCore",
  "SourceAuthorityCore",
] as const;

export type IngestionContractFamily = (typeof INGESTION_CONTRACT_FAMILIES)[number];

export function assertIngestionContracts(): {
  ok: true;
  contractVersion: typeof PUBLIC_CONTRACT_VERSION;
} {
  if (PUBLIC_CONTRACT_VERSION !== "0.11.0-digital-thread-draft") {
    throw new Error("ingestion_contracts_require_0_10_0_solver_capabilities_draft");
  }
  return { ok: true, contractVersion: PUBLIC_CONTRACT_VERSION };
}
