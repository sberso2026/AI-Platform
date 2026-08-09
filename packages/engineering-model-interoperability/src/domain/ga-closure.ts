/**
 * Phase 13F — V1.0 GA closure readiness helpers.
 */

import {
  COMMERCIAL_PACKAGING_READY,
  DIGITAL_TWIN_V1_INTACT,
  ENGINEERING_MODEL_INTEROPERABILITY_V1_FROZEN,
  ENGINEERING_MODEL_INTEROPERABILITY_V1_GA_CERTIFIED,
  MODULE_MANIFEST_FROZEN,
  OPERATIONAL_CERTIFICATION_READY,
  PHASE_13D_STATUS,
  PRODUCTION_ENGINEERING_MODEL_INTEROPERABILITY_READY,
  PUBLIC_CONTRACTS_FROZEN,
  SPACEGASS_LIVE_EXECUTION_CERTIFIED,
  SPACEGASS_LIVE_PROVIDER_READY,
} from "../version";
import { assertNoModuleRegistryDrift } from "./registry-drift";

export function assertEngineeringModelInteroperabilityGaClosureReady(): {
  ok: true;
  productionEngineeringModelInteroperabilityReady: true;
  engineeringModelInteroperabilityV1GaCertified: true;
  engineeringModelInteroperabilityV1Frozen: true;
  publicContractsFrozen: true;
  moduleManifestFrozen: true;
  commercialPackagingReady: true;
  operationalCertificationReady: true;
  DigitalTwinV1Intact: true;
  phase13DStatus: "blocked_external_dependency";
  SPACEGASSLiveProviderReady: false;
  SPACEGASSLiveExecutionCertified: false;
} {
  if (!PRODUCTION_ENGINEERING_MODEL_INTEROPERABILITY_READY) {
    throw new Error("production_emi_not_ready");
  }
  if (!ENGINEERING_MODEL_INTEROPERABILITY_V1_GA_CERTIFIED) {
    throw new Error("emi_v1_not_ga_certified");
  }
  if (!ENGINEERING_MODEL_INTEROPERABILITY_V1_FROZEN) {
    throw new Error("emi_v1_not_frozen");
  }
  if (!PUBLIC_CONTRACTS_FROZEN) {
    throw new Error("public_contracts_not_frozen");
  }
  if (!MODULE_MANIFEST_FROZEN) {
    throw new Error("module_manifest_not_frozen");
  }
  if (!COMMERCIAL_PACKAGING_READY) {
    throw new Error("commercial_packaging_not_ready");
  }
  if (!OPERATIONAL_CERTIFICATION_READY) {
    throw new Error("operational_certification_not_ready");
  }
  if (!DIGITAL_TWIN_V1_INTACT) {
    throw new Error("digital_twin_v1_not_intact");
  }
  if (PHASE_13D_STATUS !== "blocked_external_dependency") {
    throw new Error("phase13d_status_invalid");
  }
  if (SPACEGASS_LIVE_PROVIDER_READY) {
    throw new Error("spacegass_live_provider_must_remain_false");
  }
  if (SPACEGASS_LIVE_EXECUTION_CERTIFIED) {
    throw new Error("spacegass_live_execution_must_remain_false");
  }
  assertNoModuleRegistryDrift();
  return {
    ok: true,
    productionEngineeringModelInteroperabilityReady: true,
    engineeringModelInteroperabilityV1GaCertified: true,
    engineeringModelInteroperabilityV1Frozen: true,
    publicContractsFrozen: true,
    moduleManifestFrozen: true,
    commercialPackagingReady: true,
    operationalCertificationReady: true,
    DigitalTwinV1Intact: true,
    phase13DStatus: "blocked_external_dependency",
    SPACEGASSLiveProviderReady: false,
    SPACEGASSLiveExecutionCertified: false,
  };
}
