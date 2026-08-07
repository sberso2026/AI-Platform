/**
 * Phase 9J — module release closure happy path.
 */

import { assertCapabilityCatalogComplete } from "./capability-registry-integration";
import { assertConsumerContractsNonOwning } from "./consumer-contracts";
import {
  assertManifestConsistentWithRegistries,
  generateInspectionModuleManifest,
} from "./module-manifest";
import { collectOperationalHealthMetrics } from "./operational-health-metrics";
import { assertHardenedPackRegistry } from "./pack-registry-hardened";
import { assertPublicContractsMachineCheckable } from "./public-module-contracts";
import { assertServiceRegistryComplete } from "./service-registry";
import { assertVersioningFormalized } from "./versioning-compatibility";

export type PublicationAuthorityAudit = {
  actorUserId: string;
  action: "publish_approved";
  reason: string;
  timestamp: string;
  authorityRequired: true;
  silentMutation: false;
};

export type ModuleReleaseProductResult = {
  inspectionIntelligenceReleaseClosed: true;
  publicModuleContractsPublished: true;
  capabilityRegistryIntegrated: true;
  serviceRegistryPublished: true;
  inspectionPackRegistryHardened: true;
  moduleManifestGenerated: true;
  operationalHealthMetricsExposed: true;
  versioningCompatibilityFormalized: true;
  publicationPath: {
    stages: readonly [
      "capture",
      "offline_sync",
      "condition",
      "validated_vision_observed_input",
      "report_prep",
    ];
    authorityAudit: PublicationAuthorityAudit;
  };
  consumerContracts: {
    assetIntelligenceOwnership: false;
    digitalTwinOwnership: false;
  };
  manifestVersion: string;
  healthOverall: string;
  events: readonly [
    "engineering.inspection.release.closed",
    "engineering.inspection.manifest.published",
  ];
  aiVisionRemainsAdvisory: true;
};

export function runModuleReleaseHappyPath(input: {
  actorUserId: string;
  reason: string;
}): ModuleReleaseProductResult {
  assertPublicContractsMachineCheckable();
  assertCapabilityCatalogComplete();
  assertServiceRegistryComplete();
  assertHardenedPackRegistry();
  const manifest = generateInspectionModuleManifest();
  assertManifestConsistentWithRegistries(manifest);
  assertVersioningFormalized();
  const consumers = assertConsumerContractsNonOwning();
  const health = collectOperationalHealthMetrics({
    queueDepth: 0,
    visionProviderAvailable: true,
    predictiveProviderAvailable: true,
    publicationReady: true,
  });

  if (!input.reason.trim()) throw new Error("publication_reason_required");
  if (!input.actorUserId.trim()) throw new Error("publication_actor_required");

  const authorityAudit: PublicationAuthorityAudit = {
    actorUserId: input.actorUserId,
    action: "publish_approved",
    reason: input.reason,
    timestamp: new Date().toISOString(),
    authorityRequired: true,
    silentMutation: false,
  };

  return {
    inspectionIntelligenceReleaseClosed: true,
    publicModuleContractsPublished: true,
    capabilityRegistryIntegrated: true,
    serviceRegistryPublished: true,
    inspectionPackRegistryHardened: true,
    moduleManifestGenerated: true,
    operationalHealthMetricsExposed: true,
    versioningCompatibilityFormalized: true,
    publicationPath: {
      stages: [
        "capture",
        "offline_sync",
        "condition",
        "validated_vision_observed_input",
        "report_prep",
      ],
      authorityAudit,
    },
    consumerContracts: {
      assetIntelligenceOwnership: consumers.assetIntelligenceOwnership,
      digitalTwinOwnership: consumers.digitalTwinOwnership,
    },
    manifestVersion: manifest.version,
    healthOverall: health.overall,
    events: ["engineering.inspection.release.closed", "engineering.inspection.manifest.published"],
    aiVisionRemainsAdvisory: true,
  };
}
