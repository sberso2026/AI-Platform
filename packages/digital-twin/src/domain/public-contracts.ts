/**
 * Phase 12N — frozen Digital Twin V1.0 public contract families.
 *
 * Consolidates the prior public-contracts-* draft surfaces into a 1.0.0 freeze.
 * Compatibility: semver_minor_additive_only.
 */

import {
  DIGITAL_TWIN_PUBLIC_CONTRACT_VERSION,
  DIGITAL_TWIN_V1_ENTITLEMENTS,
  digitalTwinPublicContractsFrozen,
} from "../version";
import { assertCoreContracts } from "./public-contracts-core";
import { assertIngestionContracts } from "./public-contracts-ingestion";
import { assertRepresentationContracts } from "./public-contracts-representation";
import { assertSimulationContracts } from "./public-contracts-simulation";
import { assertStateContracts } from "./public-contracts-state";
import { assertTelemetryContracts } from "./public-contracts-telemetry";

export type DigitalTwinContractFamilyId =
  | "dt.contract.core"
  | "dt.contract.state"
  | "dt.contract.ingestion"
  | "dt.contract.telemetry"
  | "dt.contract.representation"
  | "dt.contract.simulation"
  | "dt.contract.digital_thread"
  | "dt.contract.solver"
  | "dt.contract.spatial_binding"
  | "dt.contract.snapshot";

export type DigitalTwinPublicContract = {
  contractId: DigitalTwinContractFamilyId;
  version: typeof DIGITAL_TWIN_PUBLIC_CONTRACT_VERSION;
  owner: "digital_twin";
  permissions: readonly string[];
  errors: readonly string[];
  idempotency: "required_on_mutations";
  compatibility: "semver_minor_additive_only";
  deprecation: "none_in_v1";
  audit: "required";
  advisoryOnly: boolean;
  mutatesCanonicalState: false;
};

const BASE = {
  version: DIGITAL_TWIN_PUBLIC_CONTRACT_VERSION,
  owner: "digital_twin" as const,
  permissions: [...DIGITAL_TWIN_V1_ENTITLEMENTS],
  errors: [
    "missing_scope",
    "forbidden_capability",
    "idempotency_conflict",
    "review_required",
    "solver_fail_closed",
    "entitlement_denied",
  ],
  idempotency: "required_on_mutations" as const,
  compatibility: "semver_minor_additive_only" as const,
  deprecation: "none_in_v1" as const,
  audit: "required" as const,
  mutatesCanonicalState: false as const,
};

export const DIGITAL_TWIN_PUBLIC_CONTRACTS: readonly DigitalTwinPublicContract[] = [
  { ...BASE, contractId: "dt.contract.core", advisoryOnly: false },
  { ...BASE, contractId: "dt.contract.state", advisoryOnly: false },
  { ...BASE, contractId: "dt.contract.ingestion", advisoryOnly: true },
  { ...BASE, contractId: "dt.contract.telemetry", advisoryOnly: true },
  { ...BASE, contractId: "dt.contract.representation", advisoryOnly: false },
  { ...BASE, contractId: "dt.contract.simulation", advisoryOnly: true },
  { ...BASE, contractId: "dt.contract.digital_thread", advisoryOnly: true },
  { ...BASE, contractId: "dt.contract.solver", advisoryOnly: true },
  { ...BASE, contractId: "dt.contract.spatial_binding", advisoryOnly: false },
  { ...BASE, contractId: "dt.contract.snapshot", advisoryOnly: false },
] as const;

export function getDigitalTwinPublicContract(
  contractId: DigitalTwinContractFamilyId,
): DigitalTwinPublicContract | undefined {
  return DIGITAL_TWIN_PUBLIC_CONTRACTS.find((c) => c.contractId === contractId);
}

export function assertPublicContractsFrozen(): {
  ok: true;
  contractCount: number;
  contractVersion: string;
  digitalTwinPublicContractsFrozen: true;
} {
  if (!digitalTwinPublicContractsFrozen) {
    throw new Error("digital_twin_public_contracts_not_frozen");
  }
  if (DIGITAL_TWIN_PUBLIC_CONTRACT_VERSION !== "1.0.0") {
    throw new Error("public_contract_version_must_be_1_0_0");
  }
  for (const contract of DIGITAL_TWIN_PUBLIC_CONTRACTS) {
    if (contract.version !== DIGITAL_TWIN_PUBLIC_CONTRACT_VERSION) {
      throw new Error(`public_contract_version_drift:${contract.contractId}`);
    }
    if (contract.mutatesCanonicalState !== false) {
      throw new Error(`public_contract_mutates_canonical:${contract.contractId}`);
    }
    if (contract.compatibility !== "semver_minor_additive_only") {
      throw new Error(`public_contract_compatibility:${contract.contractId}`);
    }
  }
  assertCoreContracts();
  assertStateContracts();
  assertIngestionContracts();
  assertTelemetryContracts();
  assertRepresentationContracts();
  assertSimulationContracts();
  return {
    ok: true,
    contractCount: DIGITAL_TWIN_PUBLIC_CONTRACTS.length,
    contractVersion: DIGITAL_TWIN_PUBLIC_CONTRACT_VERSION,
    digitalTwinPublicContractsFrozen: true,
  };
}
