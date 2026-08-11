/**
 * Profile-aware Ask / nav helpers — compose E1 surfaces, never fork apps.
 */

import type { DeploymentProfile } from "./contracts";
import { getEngineeringProfileContract } from "./profiles";
import { resolveCapabilityVisibility, resolveProfilePrimaryNav } from "./visibility";

export function resolveAskAvailabilityForProfile(input: {
  profileId: DeploymentProfile;
  entitledFeatureKeys: readonly string[];
  productEntitled: boolean;
}): { available: boolean; reason: string } {
  if (!input.productEntitled) {
    return { available: false, reason: "product_not_entitled" };
  }
  if (!input.entitledFeatureKeys.includes("ai_assistant")) {
    return { available: false, reason: "ask_feature_not_entitled" };
  }
  const v = resolveCapabilityVisibility({
    profileId: input.profileId,
    capabilityKey: "ask_native",
    entitledKeys: ["engineering-os", "ai_assistant", ...input.entitledFeatureKeys],
    audience: "engineer",
    installed: true,
  });
  return {
    available: v.usable,
    reason: v.reasonCode,
  };
}

export function resolveUxDensity(profileId: DeploymentProfile) {
  return getEngineeringProfileContract(profileId).UXDensity;
}

export function resolveNavForProfileTenant(input: {
  profileId: DeploymentProfile;
  productEntitled: boolean;
  entitledFeatureKeys: readonly string[];
}) {
  const density = resolveUxDensity(input.profileId);
  const navIds = resolveProfilePrimaryNav(input);
  const profile = getEngineeringProfileContract(input.profileId);
  return {
    density,
    navIds,
    /** No dead tabs: every returned id is entitled + profile-included. */
    deadTabs: [] as string[],
    adminFeatures:
      input.entitledFeatureKeys.includes("engineering.admin") ||
      input.entitledFeatureKeys.includes("engineering.integrations.admin")
        ? profile.adminFeatures
        : profile.adminFeatures.filter((f) => f === "modules_entitlement_status"),
    connectorPolicy: profile.connectorPolicy,
  };
}
