/**
 * Phase 9J — hardened pack registry: versioning, compatibility, upgrade/rollback.
 * Packs declare taxonomy/mappings only; central services own providers/policy.
 */

import {
  COATINGS_PACK_SCAFFOLD,
  GENERIC_INSPECTION_PACK_SDK,
  STRUCTURAL_CONDITION_PACK_SDK,
  type InspectionPackSdkManifest,
} from "../pack-sdk";

export type PackCompatibilityMatrix = {
  moduleVersionRange: string;
  packSdkVersionRange: string;
  providerCompatibility: readonly string[];
};

export type PackLifecyclePolicy = {
  validationRules: readonly string[];
  upgradePath: string;
  rollbackPolicy: string;
  executableCodeForbidden: true;
  taxonomyMappingsOnly: true;
};

export type HardenedPackRegistration = {
  manifest: InspectionPackSdkManifest;
  compatibility: PackCompatibilityMatrix;
  lifecycle: PackLifecyclePolicy;
  dependencies: readonly string[];
};

export const HARDENED_PACK_REGISTRY: readonly HardenedPackRegistration[] = [
  {
    manifest: GENERIC_INSPECTION_PACK_SDK,
    compatibility: {
      moduleVersionRange: ">=1.0.0-ii-release <2.0.0",
      packSdkVersionRange: ">=0.6.0 <1.0.0",
      providerCompatibility: ["vision_provider_approved_v1"],
    },
    lifecycle: {
      validationRules: ["taxonomy_present", "no_executable_code", "evidence_types_declared"],
      upgradePath: "semver_minor_compatible",
      rollbackPolicy: "restore_prior_pack_version_pin_without_record_mutation",
      executableCodeForbidden: true,
      taxonomyMappingsOnly: true,
    },
    dependencies: [],
  },
  {
    manifest: COATINGS_PACK_SCAFFOLD,
    compatibility: {
      moduleVersionRange: ">=1.0.0-ii-release <2.0.0",
      packSdkVersionRange: ">=0.6.0 <1.0.0",
      providerCompatibility: ["vision_provider_approved_v1"],
    },
    lifecycle: {
      validationRules: ["taxonomy_present", "no_executable_code", "scaffold_non_commercial"],
      upgradePath: "scaffold_to_release_when_certified",
      rollbackPolicy: "restore_prior_pack_version_pin_without_record_mutation",
      executableCodeForbidden: true,
      taxonomyMappingsOnly: true,
    },
    dependencies: ["generic"],
  },
  {
    manifest: STRUCTURAL_CONDITION_PACK_SDK,
    compatibility: {
      moduleVersionRange: ">=1.0.0-ii-release <2.0.0",
      packSdkVersionRange: ">=0.6.0 <1.0.0",
      providerCompatibility: ["vision_provider_approved_v1"],
    },
    lifecycle: {
      validationRules: [
        "taxonomy_present",
        "no_executable_code",
        "condition_rating_flag",
        "offline_compatible",
      ],
      upgradePath: "1.0.0_pinned_with_compat_matrix",
      rollbackPolicy: "restore_prior_pack_version_pin_without_record_mutation",
      executableCodeForbidden: true,
      taxonomyMappingsOnly: true,
    },
    dependencies: ["generic"],
  },
];

export type PackVersionDecision =
  | { outcome: "compatible"; packId: string; fromVersion: string; toVersion: string }
  | { outcome: "denied_incompatible"; packId: string; reason: string }
  | { outcome: "upgraded"; packId: string; fromVersion: string; toVersion: string }
  | { outcome: "rolled_back"; packId: string; fromVersion: string; toVersion: string };

function parseSemverMajor(version: string): number {
  const match = version.match(/^(\d+)/);
  return match ? Number(match[1]) : 0;
}

export function validatePackCompatibility(
  packId: string,
  targetModuleVersion: string,
): PackVersionDecision {
  const entry = HARDENED_PACK_REGISTRY.find((p) => p.manifest.packId === packId);
  if (!entry) {
    return { outcome: "denied_incompatible", packId, reason: "unknown_pack" };
  }
  if (!entry.lifecycle.executableCodeForbidden || !entry.lifecycle.taxonomyMappingsOnly) {
    return { outcome: "denied_incompatible", packId, reason: "pack_policy_violation" };
  }
  // Major module 2.x is out of declared range for 1.x packs.
  if (targetModuleVersion.startsWith("2.")) {
    return {
      outcome: "denied_incompatible",
      packId,
      reason: "module_major_incompatible",
    };
  }
  return {
    outcome: "compatible",
    packId,
    fromVersion: entry.manifest.version,
    toVersion: entry.manifest.version,
  };
}

export function upgradePackVersion(
  packId: string,
  fromVersion: string,
  toVersion: string,
): PackVersionDecision {
  const entry = HARDENED_PACK_REGISTRY.find((p) => p.manifest.packId === packId);
  if (!entry) {
    return { outcome: "denied_incompatible", packId, reason: "unknown_pack" };
  }
  if (parseSemverMajor(toVersion) > parseSemverMajor(fromVersion) + 0 && parseSemverMajor(toVersion) !== parseSemverMajor(fromVersion)) {
    // Deny major jumps without explicit policy (major bump = incompatible denial).
    if (parseSemverMajor(toVersion) !== parseSemverMajor(fromVersion)) {
      return {
        outcome: "denied_incompatible",
        packId,
        reason: "major_upgrade_requires_compat_review",
      };
    }
  }
  if (parseSemverMajor(toVersion) !== parseSemverMajor(fromVersion)) {
    return {
      outcome: "denied_incompatible",
      packId,
      reason: "major_upgrade_requires_compat_review",
    };
  }
  return { outcome: "upgraded", packId, fromVersion, toVersion };
}

export function rollbackPackVersion(
  packId: string,
  fromVersion: string,
  toVersion: string,
): PackVersionDecision {
  const entry = HARDENED_PACK_REGISTRY.find((p) => p.manifest.packId === packId);
  if (!entry) {
    return { outcome: "denied_incompatible", packId, reason: "unknown_pack" };
  }
  if (!entry.lifecycle.rollbackPolicy.includes("without_record_mutation")) {
    return { outcome: "denied_incompatible", packId, reason: "rollback_policy_missing" };
  }
  return { outcome: "rolled_back", packId, fromVersion, toVersion };
}

export function assertHardenedPackRegistry(): {
  ok: true;
  packIds: string[];
  incompatibleDenied: true;
} {
  const packIds = HARDENED_PACK_REGISTRY.map((p) => p.manifest.packId);
  for (const required of ["generic", "coatings", "structural_condition"]) {
    if (!packIds.includes(required)) throw new Error(`missing_hardened_pack:${required}`);
  }
  const denied = validatePackCompatibility("structural_condition", "2.0.0");
  if (denied.outcome !== "denied_incompatible") {
    throw new Error("expected_incompatible_version_denial");
  }
  const rolled = rollbackPackVersion("structural_condition", "1.0.1", "1.0.0");
  if (rolled.outcome !== "rolled_back") throw new Error("expected_rollback");
  return { ok: true, packIds, incompatibleDenied: true };
}
