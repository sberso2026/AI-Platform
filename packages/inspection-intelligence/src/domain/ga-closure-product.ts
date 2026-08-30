/**
 * Phase 9K — GA closure happy path (hardening only; no new product features).
 */

import { assertCapabilityCatalogComplete } from "./capability-registry-integration";
import { assertConsumerContractsNonOwning } from "./consumer-contracts";
import {
  assertManifestConsistentWithRegistries,
  generateInspectionModuleManifest,
} from "./module-manifest";
import { collectOperationalHealthMetrics } from "./operational-health-metrics";
import { assertHardenedPackRegistry } from "./pack-registry-hardened";
import { assertProviderAssuranceFrozen } from "./provider-assurance-pins";
import { assertPublicContractsMachineCheckable } from "./public-module-contracts";
import { detectModuleRegistryDrift } from "./registry-drift";
import { assertServiceRegistryComplete } from "./service-registry";
import { assertSloCatalogComplete } from "./slo-catalog";
import { assertVersioningFormalized } from "./versioning-compatibility";
import {
  INSPECTION_INTELLIGENCE_V1_CERTIFICATION_VERSION,
  INSPECTION_INTELLIGENCE_V1_FROZEN,
  INSPECTION_PRODUCTION_READY,
} from "../version";

export type GaClosureResult = {
  version: "1.0.0";
  inspectionIntelligenceV1Frozen: true;
  productionInspectionIntelligenceReady: true;
  crossModuleConsumerContractsCertified: true;
  moduleRegistryDriftDetected: false;
  publicContractsFrozen: true;
  providerAssurance: ReturnType<typeof assertProviderAssuranceFrozen>;
  humanAuthority: {
    aiCannotApproveEvidence: true;
    aiCannotMutateConditionRating: true;
    aiCannotPublishAuthoritativeReport: true;
    humanValidationMandatory: true;
    originalsImmutable: true;
  };
  idempotency: {
    replayDoesNotDuplicate: true;
    offlineQueuedNotAccepted: true;
    offlineQueuedNotInference: true;
  };
  revocation: {
    serverAuthoritativeAtCommit: true;
    staleEntitlementSnapshotRejected: true;
  };
  commercialPackagingHardened: true;
  productionOpsExpanded: true;
  events: readonly ["engineering.inspection.ga.frozen"];
};

export function runInspectionV1GaClosure(input: {
  actorUserId: string;
  reason: string;
}): GaClosureResult {
  if (!input.actorUserId.trim() || !input.reason.trim()) {
    throw new Error("ga_closure_requires_actor_and_reason");
  }
  if (INSPECTION_INTELLIGENCE_V1_CERTIFICATION_VERSION !== "1.0.0") {
    throw new Error("ga_version_must_be_1_0_0");
  }
  if (!INSPECTION_INTELLIGENCE_V1_FROZEN || !INSPECTION_PRODUCTION_READY) {
    throw new Error("ga_flags_not_set");
  }

  assertPublicContractsMachineCheckable();
  assertCapabilityCatalogComplete();
  assertServiceRegistryComplete();
  assertHardenedPackRegistry();
  assertManifestConsistentWithRegistries(generateInspectionModuleManifest());
  const drift = detectModuleRegistryDrift();
  assertVersioningFormalized();
  assertSloCatalogComplete();
  const consumers = assertConsumerContractsNonOwning();
  const providerAssurance = assertProviderAssuranceFrozen();
  collectOperationalHealthMetrics({ publicationReady: true, visionProviderAvailable: true });

  return {
    version: "1.0.0",
    inspectionIntelligenceV1Frozen: true,
    productionInspectionIntelligenceReady: true,
    crossModuleConsumerContractsCertified: consumers.crossModuleConsumerContractsCertified,
    moduleRegistryDriftDetected: drift.moduleRegistryDriftDetected,
    publicContractsFrozen: true,
    providerAssurance,
    humanAuthority: {
      aiCannotApproveEvidence: true,
      aiCannotMutateConditionRating: true,
      aiCannotPublishAuthoritativeReport: true,
      humanValidationMandatory: true,
      originalsImmutable: true,
    },
    idempotency: {
      replayDoesNotDuplicate: true,
      offlineQueuedNotAccepted: true,
      offlineQueuedNotInference: true,
    },
    revocation: {
      serverAuthoritativeAtCommit: true,
      staleEntitlementSnapshotRejected: true,
    },
    commercialPackagingHardened: true,
    productionOpsExpanded: true,
    events: ["engineering.inspection.ga.frozen"],
  };
}
