/**
 * Phase 13F — Public contracts frozen at 1.0.0 GA.
 *
 * Runtime-backed for IFC + SPACE GASS + ETABS export federation / fail-closed solvers.
 * SAP2000 / SAFE / CSiBridge remain unimplemented. Live SPACE GASS / ETABS COM not certified.
 */

import { PUBLIC_CONTRACT_VERSION } from "../version";
import type { EngineeringModelAdapter } from "../domain/engineering-model-adapter";
import type { EngineeringModelElementReference } from "../domain/engineering-model-element-reference";
import type { EngineeringModelReference } from "../domain/engineering-model-reference";
import type { EngineeringAnalysisResultReference } from "../domain/result-reference";

export const ENGINEERING_INTEROP_PUBLIC_CONTRACT_FAMILIES = [
  "EngineeringModelReference",
  "EngineeringModelVersion",
  "EngineeringModelAdapter",
  "EngineeringModelElementReference",
  "EngineeringModelFederationService",
  "EngineeringModelMapping",
  "EngineeringModelChangeImpact",
  "EngineeringAnalysisResultReference",
  "ExternalSolverProviderReference",
  "SPACEGASSSolverAdapter",
  "SPACEGASSQualificationRecord",
  "ETABSModelAdapter",
  "ETABSSolverAdapter",
  "ETABSQualificationRecord",
  "CSIInteropCore",
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
  spaceGassHostedExecutionCertified?: false;
  ETABSHostedExecutionCertified?: false;
  ETABSControlledExecutionCertified?: false;
};

export function assertEngineeringInteropPublicContracts(): {
  ok: true;
  contractVersion: typeof PUBLIC_CONTRACT_VERSION;
  families: typeof ENGINEERING_INTEROP_PUBLIC_CONTRACT_FAMILIES;
  ga: true;
  runtimeBacked: true;
  ifcFederation: true;
  spacegassFederation: true;
  etabsFederation: true;
} {
  if (PUBLIC_CONTRACT_VERSION !== "1.0.0") {
    throw new Error("interop_contracts_must_be_ga_1_0_0");
  }
  return {
    ok: true,
    contractVersion: PUBLIC_CONTRACT_VERSION,
    families: ENGINEERING_INTEROP_PUBLIC_CONTRACT_FAMILIES,
    ga: true,
    runtimeBacked: true,
    ifcFederation: true,
    spacegassFederation: true,
    etabsFederation: true,
  };
}

/** @deprecated Prefer assertEngineeringInteropPublicContracts (13F). */
export function assertEngineeringInteropDraftContracts() {
  const r = assertEngineeringInteropPublicContracts();
  return {
    ok: r.ok as true,
    contractVersion: r.contractVersion,
    families: r.families,
    ga: true as const,
    runtimeBacked: true as const,
  };
}

export function assertPublicContractsFrozen(): {
  ok: true;
  contractCount: number;
  contractVersion: string;
} {
  const r = assertEngineeringInteropPublicContracts();
  return {
    ok: true,
    contractCount: r.families.length,
    contractVersion: r.contractVersion,
  };
}
