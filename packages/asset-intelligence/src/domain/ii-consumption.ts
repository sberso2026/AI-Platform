/**
 * Phase 10B — II public-contract consumption (no private tables/repos).
 */

import {
  ASSET_INTELLIGENCE_CONSUMER_FIXTURE,
  PUBLIC_MODULE_CONTRACT_VERSION,
  getPublicModuleContract,
  type AssetReference,
} from "@rtb/inspection-intelligence";
import { INSPECTION_INTELLIGENCE_V1_CONTRACTS_CONSUMED } from "../version";
import { FORBIDDEN_II_CONSUMPTION } from "./source-registry";

export type IiConditionIngestInput = {
  /** Public AssetReference shape from ii.asset.reference. */
  assetReference: AssetReference;
  /** Published / human-approved condition summary fields only. */
  conditionRating?: string;
  conditionIndex?: number;
  conditionConfidence?: number;
  conditionTrend?: string;
  conditionMethod?: string;
  observedAt: string;
  /** Evidence references only — never raw evidence payloads. */
  evidenceRefs?: string[];
  conditionRatingId?: string;
  observationIds?: string[];
  sessionId?: string;
  reviewedBy?: string;
  approvedAt?: string;
};

export function assertIiPublicContractConsumption(): {
  ok: true;
  contractVersion: string;
  contractIds: readonly string[];
  forbids: readonly string[];
} {
  if (PUBLIC_MODULE_CONTRACT_VERSION !== INSPECTION_INTELLIGENCE_V1_CONTRACTS_CONSUMED) {
    throw new Error("ii_contract_version_mismatch");
  }
  for (const id of ASSET_INTELLIGENCE_CONSUMER_FIXTURE.contractIds) {
    const c = getPublicModuleContract(id);
    if (!c) throw new Error(`missing_ii_public_contract:${id}`);
    if (c.privatePersistenceExposed) {
      throw new Error(`ii_private_persistence_exposed:${id}`);
    }
  }
  if (ASSET_INTELLIGENCE_CONSUMER_FIXTURE.accessMode !== "public_contracts_only") {
    throw new Error("ii_access_mode_invalid");
  }
  if (ASSET_INTELLIGENCE_CONSUMER_FIXTURE.directDatabaseAccess !== false) {
    throw new Error("ii_direct_db_forbidden");
  }
  return {
    ok: true,
    contractVersion: PUBLIC_MODULE_CONTRACT_VERSION,
    contractIds: ASSET_INTELLIGENCE_CONSUMER_FIXTURE.contractIds,
    forbids: [...ASSET_INTELLIGENCE_CONSUMER_FIXTURE.forbids, ...FORBIDDEN_II_CONSUMPTION],
  };
}

export function toConditionIngestFromPublicSummary(
  input: IiConditionIngestInput,
): IiConditionIngestInput {
  // Pass-through validator — rejects raw evidence blobs if present under known keys.
  const forbiddenKeys = ["rawEvidence", "evidenceBytes", "privateSchema", "repository"];
  for (const key of forbiddenKeys) {
    if (key in (input as Record<string, unknown>)) {
      throw new Error(`ii_evidence_duplication_forbidden:${key}`);
    }
  }
  if (!input.assetReference?.identity?.assetId) {
    throw new Error("ii_asset_reference_required");
  }
  return input;
}
