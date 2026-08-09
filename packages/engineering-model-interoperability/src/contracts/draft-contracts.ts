/**
 * Phase 13B — Public contracts at 0.2.0-ifc-federation (prerelease, NOT 1.0.0).
 *
 * Runtime-backed for IFC federation only. Native adapters remain unimplemented.
 */

import { PUBLIC_CONTRACT_VERSION } from "../version";
import type { EngineeringModelAdapter } from "../domain/engineering-model-adapter";
import type { EngineeringModelElementReference } from "../domain/engineering-model-element-reference";
import type { EngineeringModelReference } from "../domain/engineering-model-reference";
import type { EngineeringAnalysisResultReference } from "../domain/result-reference";

export const ENGINEERING_INTEROP_PUBLIC_CONTRACT_FAMILIES = [
  "EngineeringModelReference",
  "EngineeringModelAdapter",
  "EngineeringModelElementReference",
  "EngineeringAnalysisResultReference",
  "ExternalSolverProviderReference",
  "EngineeringModelMapping",
  "EngineeringModelChangeImpact",
] as const;

export type EngineeringInteropPublicContractFamily =
  (typeof ENGINEERING_INTEROP_PUBLIC_CONTRACT_FAMILIES)[number];

export type {
  EngineeringModelReference,
  EngineeringModelAdapter,
  EngineeringModelElementReference,
  EngineeringAnalysisResultReference,
};

export type ExternalSolverProviderReference = {
  providerId: string;
  displayName: string;
  solverSupported: boolean;
  solverQualified: boolean;
  projectApproved: boolean;
  executionQualified: boolean;
  engineeringApproved: boolean;
  ownership: "external_engineering_tool";
  reusesEngineeringSolverAdapter: true;
  certifiedCapabilityHints?: readonly string[];
};

export function assertEngineeringInteropPublicContracts(): {
  ok: true;
  contractVersion: typeof PUBLIC_CONTRACT_VERSION;
  families: typeof ENGINEERING_INTEROP_PUBLIC_CONTRACT_FAMILIES;
  ga: false;
  runtimeBacked: true;
  ifcFederationOnly: true;
} {
  if (PUBLIC_CONTRACT_VERSION !== "0.2.0-ifc-federation") {
    throw new Error("interop_contracts_must_be_ifc_federation");
  }
  if (PUBLIC_CONTRACT_VERSION === "1.0.0") {
    throw new Error("interop_contracts_must_not_be_ga");
  }
  return {
    ok: true,
    contractVersion: PUBLIC_CONTRACT_VERSION,
    families: ENGINEERING_INTEROP_PUBLIC_CONTRACT_FAMILIES,
    ga: false,
    runtimeBacked: true,
    ifcFederationOnly: true,
  };
}

/** @deprecated Prefer assertEngineeringInteropPublicContracts (13B). */
export function assertEngineeringInteropDraftContracts() {
  const r = assertEngineeringInteropPublicContracts();
  return {
    ok: r.ok as true,
    contractVersion: r.contractVersion,
    families: r.families,
    ga: false as const,
    runtimeBacked: true as const,
  };
}
