/**
 * Phase 12F — Digital Twin representation public contracts (0.6.0-representation-draft).
 */

import { PUBLIC_CONTRACT_VERSION } from "../version";

export const REPRESENTATION_CONTRACT_FAMILIES = [
  "TwinRepresentationSourceReferenceCore",
  "TwinRepresentationElementReferenceCore",
  "TwinRepresentationMappingCore",
  "TwinSpatialReferenceCore",
  "RepresentationNavigationCore",
  "RepresentationChangeImpactCore",
] as const;

export type RepresentationContractFamily = (typeof REPRESENTATION_CONTRACT_FAMILIES)[number];

export function assertRepresentationContracts(): {
  ok: true;
  contractVersion: typeof PUBLIC_CONTRACT_VERSION;
} {
  if (PUBLIC_CONTRACT_VERSION !== "0.6.0-representation-draft") {
    throw new Error("representation_contracts_require_0_6_0_representation_draft");
  }
  return { ok: true, contractVersion: PUBLIC_CONTRACT_VERSION };
}

export function assertRepresentationForbiddenCapabilities(): {
  ok: true;
  storesGeometryPayload: false;
  storesSourceModelBinary: false;
  authoringEnabled: false;
  threeDViewerImplemented: false;
  automaticRepresentationMappingApprovalEnabled: false;
  duplicateModelOwnershipDetected: false;
  simulationExecutionImplemented: false;
} {
  return {
    ok: true,
    storesGeometryPayload: false,
    storesSourceModelBinary: false,
    authoringEnabled: false,
    threeDViewerImplemented: false,
    automaticRepresentationMappingApprovalEnabled: false,
    duplicateModelOwnershipDetected: false,
    simulationExecutionImplemented: false,
  };
}
