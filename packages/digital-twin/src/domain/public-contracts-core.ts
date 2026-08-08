/**
 * Phase 12B — Digital Twin core public contracts (0.2.0-core-draft).
 */

import { PUBLIC_CONTRACT_VERSION } from "../version";
import type { CanonicalEntityType, TwinIdentity, TwinStatus, TwinType } from "./identity";
import type { RepresentationType, TwinRepresentationReference } from "./representation";
import type { TwinRelationshipType } from "./relationships";
import type { DigitalThreadLink } from "./thread";

export const CORE_CONTRACT_FAMILIES = [
  "TwinIdentityCore",
  "TwinTargetReferenceCore",
  "TwinRepresentationReferenceCore",
  "TwinStateReferenceCore",
  "TwinRelationshipCore",
  "DigitalThreadLinkCore",
  "TwinLookupCore",
] as const;

export type CoreContractFamily = (typeof CORE_CONTRACT_FAMILIES)[number];

export type TwinTargetReferenceCore = {
  contractVersion: typeof PUBLIC_CONTRACT_VERSION;
  canonicalEntityType: CanonicalEntityType;
  canonicalEntityId: string;
  tenantId: string;
  workspaceId: string;
};

export type TwinIdentityCore = {
  contractVersion: typeof PUBLIC_CONTRACT_VERSION;
  twinId: string;
  tenantId: string;
  workspaceId: string;
  target: TwinTargetReferenceCore;
  twinType: TwinType;
  status: TwinStatus;
  twinVersion: number;
  configurationVersion: number;
  kernelTwinId?: string;
};

export type TwinRepresentationReferenceCore = {
  contractVersion: typeof PUBLIC_CONTRACT_VERSION;
  representationId: string;
  twinId: string;
  representationType: RepresentationType;
  sourceRef: string;
  version: string;
  fidelityLevel: string;
  status: TwinRepresentationReference["status"];
};

export type TwinRelationshipCore = {
  contractVersion: typeof PUBLIC_CONTRACT_VERSION;
  relationshipId: string;
  twinId: string;
  relationshipType: TwinRelationshipType;
  targetRef: string;
  targetKind: "twin" | "canonical_entity" | "external_ref";
};

export type DigitalThreadLinkCore = {
  contractVersion: typeof PUBLIC_CONTRACT_VERSION;
  linkId: string;
  twinId: string;
  targetType: DigitalThreadLink["targetType"];
  targetRef: string;
  platformTimelineRef?: DigitalThreadLink["platformTimelineRef"];
};

export type TwinLookupCore = {
  contractVersion: typeof PUBLIC_CONTRACT_VERSION;
  twinId: string;
  identity: TwinIdentityCore;
  representations: TwinRepresentationReferenceCore[];
  relationships: TwinRelationshipCore[];
  threadLinks: DigitalThreadLinkCore[];
};

export function toTwinIdentityCore(identity: TwinIdentity): TwinIdentityCore {
  return {
    contractVersion: PUBLIC_CONTRACT_VERSION,
    twinId: identity.twinId,
    tenantId: identity.tenantId,
    workspaceId: identity.workspaceId,
    target: {
      contractVersion: PUBLIC_CONTRACT_VERSION,
      canonicalEntityType: identity.target.canonicalEntityType,
      canonicalEntityId: identity.target.canonicalEntityId,
      tenantId: identity.tenantId,
      workspaceId: identity.workspaceId,
    },
    twinType: identity.twinType,
    status: identity.status,
    twinVersion: identity.version.twinVersion,
    configurationVersion: identity.version.configurationVersion,
    kernelTwinId: identity.kernelTwinId,
  };
}

export function assertCoreContracts(): { ok: true; contractVersion: typeof PUBLIC_CONTRACT_VERSION } {
  if (PUBLIC_CONTRACT_VERSION !== "0.11.0-digital-thread-draft") {
    throw new Error("core_contracts_require_0_10_0_solver_capabilities_draft");
  }
  return { ok: true, contractVersion: PUBLIC_CONTRACT_VERSION };
}
