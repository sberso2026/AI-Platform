/**
 * Capability visibility — profile packaging ∩ install ∩ entitlement ∩ RBAC.
 * Profile never elevates permissions or bypasses entitlement.
 */

import type {
  DeploymentProfile,
  EngineeringCapabilityVisibility,
  EngineeringCapabilityVisibilityInput,
  EngineeringProfileCapabilityKey,
} from "./contracts";
import { getEngineeringProfileContract, profileIncludesCapability } from "./profiles";
import { filterVisiblePrimaryNavIds } from "../phase-e1/contracts";

const OPTIONAL_NEED_EXPLICIT_ENTITLEMENT = new Set([
  "optional_connectors",
  "selected_intelligence_packs",
  "advanced_tools",
  "corporate_copilot_federation",
  "enterprise_connectors",
  "sso_enterprise_identity",
  "federated_data",
  "enterprise_deployment_controls",
]);

export function resolveCapabilityVisibility(
  input: EngineeringCapabilityVisibilityInput,
): EngineeringCapabilityVisibility {
  const audience = input.audience ?? "engineer";
  const key = String(input.capabilityKey);
  const { included, optional } = profileIncludesCapability(input.profileId, key);

  if (!included) {
    return audience === "admin"
      ? {
          visible: true,
          usable: false,
          reasonCode: "ADMIN_INSPECT_ONLY",
          profileElevatesPermissions: false,
        }
      : {
          visible: false,
          usable: false,
          reasonCode: "PROFILE_DOES_NOT_INCLUDE",
          profileElevatesPermissions: false,
        };
  }

  const profile = getEngineeringProfileContract(input.profileId);
  if (
    (key === "optional_connectors" || key === "enterprise_connectors") &&
    profile.connectorPolicy === "DISABLED"
  ) {
    return audience === "admin"
      ? {
          visible: true,
          usable: false,
          reasonCode: "CONNECTOR_DISABLED_IN_PROFILE",
          profileElevatesPermissions: false,
        }
      : {
          visible: false,
          usable: false,
          reasonCode: "CONNECTOR_DISABLED_IN_PROFILE",
          profileElevatesPermissions: false,
        };
  }

  const installed = input.installed ?? true;
  if (!installed) {
    return audience === "admin"
      ? {
          visible: true,
          usable: false,
          reasonCode: "ADMIN_INSPECT_ONLY",
          profileElevatesPermissions: false,
        }
      : {
          visible: false,
          usable: false,
          reasonCode: "NOT_INSTALLED",
          profileElevatesPermissions: false,
        };
  }

  if (input.entitledKeys !== undefined) {
    const keys = input.entitledKeys;
    const productOk = keys.includes("engineering-os");
    if (key === "ask_native") {
      if (!productOk || !keys.includes("ai_assistant")) {
        return {
          visible: false,
          usable: false,
          reasonCode: "NOT_ENTITLED",
          profileElevatesPermissions: false,
        };
      }
    } else if (OPTIONAL_NEED_EXPLICIT_ENTITLEMENT.has(key) || optional) {
      if (!keys.includes(key)) {
        return audience === "admin"
          ? {
              visible: true,
              usable: false,
              reasonCode: "ADMIN_INSPECT_ONLY",
              profileElevatesPermissions: false,
            }
          : {
              visible: false,
              usable: false,
              reasonCode: "NOT_ENTITLED",
              profileElevatesPermissions: false,
            };
      }
    } else if (!productOk && !keys.includes(key)) {
      return {
        visible: false,
        usable: false,
        reasonCode: "NOT_ENTITLED",
        profileElevatesPermissions: false,
      };
    }
  }

  if (input.requiredPermission) {
    const perms = new Set(input.rbacPermissions ?? []);
    if (!perms.has(input.requiredPermission) && !perms.has("engineering.admin")) {
      return {
        visible: false,
        usable: false,
        reasonCode: "RBAC_DENIED",
        profileElevatesPermissions: false,
      };
    }
  }

  return {
    visible: true,
    usable: true,
    reasonCode: "OK",
    profileElevatesPermissions: false,
  };
}

export function resolveProfilePrimaryNav(input: {
  profileId: DeploymentProfile;
  productEntitled: boolean;
  entitledFeatureKeys: readonly string[];
}): string[] {
  const profile = getEngineeringProfileContract(input.profileId);
  const entitledNav = filterVisiblePrimaryNavIds({
    productEntitled: input.productEntitled,
    entitledFeatureKeys: input.entitledFeatureKeys,
  });
  return entitledNav.filter((id) => profile.primaryNavIds.includes(id));
}

export function listEngineerVisibleCapabilities(
  profileId: DeploymentProfile,
  entitledKeys: string[],
): EngineeringProfileCapabilityKey[] {
  const profile = getEngineeringProfileContract(profileId);
  const keys = [
    ...profile.enabledCapabilities,
    ...profile.optionalCapabilities,
  ] as EngineeringProfileCapabilityKey[];
  return keys.filter((capabilityKey) => {
    const v = resolveCapabilityVisibility({
      profileId,
      capabilityKey,
      entitledKeys,
      audience: "engineer",
      installed: true,
    });
    return v.visible && v.usable;
  });
}

export function listAdminInspectCapabilities(profileId: DeploymentProfile): Array<{
  capabilityKey: string;
  visibility: EngineeringCapabilityVisibility;
}> {
  const all = [
    "ask_native",
    "optional_connectors",
    "enterprise_connectors",
    "corporate_copilot_federation",
    "sso_enterprise_identity",
    "federated_data",
  ] as const;
  return all.map((capabilityKey) => ({
    capabilityKey,
    visibility: resolveCapabilityVisibility({
      profileId,
      capabilityKey,
      audience: "admin",
      entitledKeys: ["engineering-os"],
      installed: false,
    }),
  }));
}

export function assertEnterpriseRouteAllowed(input: {
  profileId: DeploymentProfile;
  entitledKeys: string[];
  rbacPermissions?: string[];
  routeKind: "connector_admin" | "copilot_federation" | "enterprise_identity";
}): { allowed: boolean; reason: string } {
  const map = {
    connector_admin: "enterprise_connectors",
    copilot_federation: "corporate_copilot_federation",
    enterprise_identity: "sso_enterprise_identity",
  } as const;
  const key = map[input.routeKind];
  const v = resolveCapabilityVisibility({
    profileId: input.profileId,
    capabilityKey: key,
    entitledKeys: input.entitledKeys,
    audience: "engineer",
    installed: true,
    requiredPermission:
      input.routeKind === "connector_admin" ? "engineering.integrations.admin" : null,
    rbacPermissions: input.rbacPermissions ?? [],
  });
  if (!v.usable) return { allowed: false, reason: v.reasonCode };
  return { allowed: true, reason: "OK" };
}
