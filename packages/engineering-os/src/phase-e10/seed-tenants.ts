/**
 * Representative seed tenants for ESSENTIAL / PROFESSIONAL / ENTERPRISE certification.
 */

import type { DeploymentProfile, EngineeringDeploymentMode, EngineeringIdentityMode } from "./contracts";
import { getEngineeringProfileContract } from "./profiles";
import { listEngineerVisibleCapabilities, resolveProfilePrimaryNav } from "./visibility";

export type EngineeringProfileSeedTenant = {
  tenantId: string;
  name: string;
  profileId: DeploymentProfile;
  deploymentMode: EngineeringDeploymentMode;
  identityMode: EngineeringIdentityMode;
  entitledKeys: string[];
  installedKeys: string[];
  connectorsEnabled: boolean;
  visibleNavIds: string[];
  visibleCapabilities: string[];
};

export function createProfileSeedTenants(): EngineeringProfileSeedTenant[] {
  const essential = getEngineeringProfileContract("ESSENTIAL");
  const professional = getEngineeringProfileContract("PROFESSIONAL");
  const enterprise = getEngineeringProfileContract("ENTERPRISE");

  const smallEntitled = ["engineering-os", "ai_assistant"];
  const midEntitled = [
    "engineering-os",
    "ai_assistant",
    "project_intelligence",
    "optional_connectors",
    "selected_intelligence_packs",
  ];
  const entEntitled = [
    ...midEntitled,
    "enterprise_connectors",
    "sso_enterprise_identity",
    "corporate_copilot_federation",
    "engineering.integrations.admin",
  ];

  return [
    {
      tenantId: "seed-essential-small-consultancy",
      name: "Small consultancy (ESSENTIAL)",
      profileId: "ESSENTIAL",
      deploymentMode: essential.deploymentMode,
      identityMode: essential.identityMode,
      entitledKeys: smallEntitled,
      installedKeys: ["engineering-os"],
      connectorsEnabled: false,
      visibleNavIds: resolveProfilePrimaryNav({
        profileId: "ESSENTIAL",
        productEntitled: true,
        entitledFeatureKeys: smallEntitled,
      }),
      visibleCapabilities: listEngineerVisibleCapabilities("ESSENTIAL", smallEntitled),
    },
    {
      tenantId: "seed-professional-midsize",
      name: "Mid-size firm (PROFESSIONAL)",
      profileId: "PROFESSIONAL",
      deploymentMode: professional.deploymentMode,
      identityMode: professional.identityMode,
      entitledKeys: midEntitled,
      installedKeys: ["engineering-os", "project_intelligence"],
      connectorsEnabled: false,
      visibleNavIds: resolveProfilePrimaryNav({
        profileId: "PROFESSIONAL",
        productEntitled: true,
        entitledFeatureKeys: midEntitled,
      }),
      visibleCapabilities: listEngineerVisibleCapabilities("PROFESSIONAL", midEntitled),
    },
    {
      tenantId: "seed-enterprise-federated",
      name: "Enterprise (ENTERPRISE)",
      profileId: "ENTERPRISE",
      deploymentMode: enterprise.deploymentMode,
      identityMode: "ENTRA",
      entitledKeys: entEntitled,
      installedKeys: [
        "engineering-os",
        "project_intelligence",
        "asset_intelligence",
        "project_controls",
      ],
      connectorsEnabled: true,
      visibleNavIds: resolveProfilePrimaryNav({
        profileId: "ENTERPRISE",
        productEntitled: true,
        entitledFeatureKeys: entEntitled,
      }),
      visibleCapabilities: listEngineerVisibleCapabilities("ENTERPRISE", entEntitled),
    },
  ];
}
