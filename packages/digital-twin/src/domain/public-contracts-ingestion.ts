/**
 * Phase 12D — Digital Twin ingestion public contracts (0.4.0-ingestion-draft).
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
  if (PUBLIC_CONTRACT_VERSION !== "0.4.0-ingestion-draft") {
    throw new Error("ingestion_contracts_require_0_4_0_ingestion_draft");
  }
  return { ok: true, contractVersion: PUBLIC_CONTRACT_VERSION };
}
