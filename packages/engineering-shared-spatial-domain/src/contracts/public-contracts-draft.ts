/**
 * Phase 12L — Public contracts draft (0.1.0-draft).
 * Discovery contracts only — not GA, not runtime-backed.
 */

import { PUBLIC_CONTRACT_VERSION } from "../version";

export const SHARED_SPATIAL_PUBLIC_CONTRACT_FAMILIES = [
  "SpatialReferenceCore",
  "LocationReferenceCore",
  "CoordinateReferenceSystemCore",
  "CoordinateTransformationDeclarationCore",
  "LinearReferenceReservation",
  "TwinSpatialReferenceRebindingStrategy",
] as const;

export type SharedSpatialPublicContractFamily =
  (typeof SHARED_SPATIAL_PUBLIC_CONTRACT_FAMILIES)[number];

export function assertSharedSpatialDraftContractsOnly(): {
  ok: true;
  contractVersion: typeof PUBLIC_CONTRACT_VERSION;
  families: typeof SHARED_SPATIAL_PUBLIC_CONTRACT_FAMILIES;
  runtimeBacked: false;
} {
  if (PUBLIC_CONTRACT_VERSION !== "0.1.0-draft") {
    throw new Error("shared_spatial_contracts_must_remain_draft");
  }
  return {
    ok: true,
    contractVersion: PUBLIC_CONTRACT_VERSION,
    families: SHARED_SPATIAL_PUBLIC_CONTRACT_FAMILIES,
    runtimeBacked: false,
  };
}
