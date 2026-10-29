/**
 * Phase 12M — Public contracts 0.2.0-spatial-core (prerelease, not 1.0.0).
 */

import { PUBLIC_CONTRACT_VERSION } from "../version";

export const SHARED_SPATIAL_PUBLIC_CONTRACT_FAMILIES = [
  "SpatialReferenceCore",
  "LocationReferenceCore",
  "CoordinateReferenceSystemCore",
  "CoordinateReferenceCore",
  "SpatialRelationshipReferenceCore",
  "LegacySpatialReconciliationCore",
  "SpatialReferenceReviewCore",
  "CoordinateTransformationDeclarationCore",
  "LinearReferenceReservation",
  "TwinSpatialReferenceRebindingStrategy",
] as const;

export type SharedSpatialPublicContractFamily =
  (typeof SHARED_SPATIAL_PUBLIC_CONTRACT_FAMILIES)[number];

export function assertSharedSpatialCoreContracts(): {
  ok: true;
  contractVersion: typeof PUBLIC_CONTRACT_VERSION;
  families: typeof SHARED_SPATIAL_PUBLIC_CONTRACT_FAMILIES;
  runtimeBacked: true;
  ga: false;
} {
  if (PUBLIC_CONTRACT_VERSION !== "0.2.0-spatial-core") {
    throw new Error("shared_spatial_contracts_must_be_spatial_core");
  }
  if (PUBLIC_CONTRACT_VERSION === "1.0.0") {
    throw new Error("shared_spatial_contracts_must_not_be_ga");
  }
  return {
    ok: true,
    contractVersion: PUBLIC_CONTRACT_VERSION,
    families: SHARED_SPATIAL_PUBLIC_CONTRACT_FAMILIES,
    runtimeBacked: true,
    ga: false,
  };
}

/** @deprecated Prefer assertSharedSpatialCoreContracts (12M). */
export function assertSharedSpatialDraftContractsOnly() {
  return assertSharedSpatialCoreContracts();
}
