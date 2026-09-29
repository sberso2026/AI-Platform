import { SPACE_GASS_CATALOG_ENTRY } from "./catalog";
import {
  buildSpaceGassDiscoveryReport,
  discoverSpaceGassInstalls,
  probeSpaceGassApi,
  type SpaceGassApiProbe,
  type SpaceGassDiscoveryReport,
  type SpaceGassInstallRecord,
} from "./discovery";
import { defaultLicenceGovernance, withDerivedState } from "./readiness";
import type { ExternalToolProfile } from "./types";

const emptyValidation = {
  ranAt: null,
  overall: "NOT_RUN" as const,
  checks: [],
};

function baseProfile(input: {
  tenantId: string;
  id?: string;
  ownerId?: string | null;
  createdBy?: string | null;
  now?: string;
}): Omit<ExternalToolProfile, "readiness" | "adapterCompatibilityStatus" | "developmentEvaluationReadiness"> {
  const now = input.now ?? new Date().toISOString();
  const catalog = SPACE_GASS_CATALOG_ENTRY;
  return {
    id: input.id ?? "spacegass-not-configured",
    tenantId: input.tenantId,
    toolCode: catalog.toolCode,
    name: catalog.name,
    vendor: catalog.vendor,
    category: catalog.category,
    enabled: true,
    status: "active",
    environment: "staging",
    integrationModes: [...catalog.integrationModes],
    adapterId: catalog.adapterId,
    adapterVersion: catalog.adapterVersion,
    providerKey: catalog.providerKey,
    platformToolKey: catalog.platformToolKey,
    compatibleToolVersions: [...catalog.compatibleToolVersions],
    notCertifiedToolVersions: [...catalog.notCertifiedToolVersions],
    minSupportedVersion: catalog.minSupportedVersion,
    executionHostId: null,
    installedVersion: null,
    executablePath: null,
    installationStatus: "NOT_INSTALLED",
    licenceStatus: "UNAVAILABLE",
    ...defaultLicenceGovernance(),
    automationPermission: "REQUIRES_CONFIRMATION",
    automationConfirmedBy: null,
    automationConfirmedAt: null,
    automationBasis: null,
    automationReference: null,
    credentialSecretId: null,
    endpoint: null,
    connectorId: null,
    authScopes: [],
    capabilities: catalog.capabilities.map((cap) => ({ ...cap })),
    lastValidation: emptyValidation,
    ownerId: input.ownerId ?? null,
    createdBy: input.createdBy ?? null,
    updatedBy: input.createdBy ?? null,
    createdAt: now,
    updatedAt: now,
  };
}

function applyInstall(
  profile: ReturnType<typeof baseProfile>,
  install: SpaceGassInstallRecord,
  apiProbe: SpaceGassApiProbe,
): ReturnType<typeof baseProfile> {
  const version = install.fileVersion ?? install.productVersion;
  return {
    ...profile,
    installedVersion: version,
    executablePath: install.executablePath,
    installationStatus: install.executablePath ? "INSTALLED" : "INVALID",
    licenceType: install.labelledTrial ? "TRIAL" : "UNKNOWN",
    licenceExpiresAt: null,
    licenceStatus: "UNAVAILABLE",
    apiAvailable: apiProbe.reachable === true,
    productionUsePermitted: false,
    automationPermission: "REQUIRES_CONFIRMATION",
    automationBasis:
      "Vendor or trial automation permission has not been independently evidenced. Executable or API presence is not permission.",
    automationReference: null,
    endpoint: null,
  };
}

export function applySpaceGassDiscovery(
  profile: ReturnType<typeof baseProfile>,
  report: SpaceGassDiscoveryReport,
): ReturnType<typeof baseProfile> {
  const canonical = report.canonicalTrial ?? report.installs[0] ?? null;
  if (!canonical) return profile;
  return applyInstall(profile, canonical, report.apiProbe);
}

/**
 * Canonical SPACE GASS platform profile.
 * Records discovered Windows installs when present. Does not fabricate READY,
 * API availability, trial expiry, automation permission, or production use.
 */
export function buildNotReadySpaceGassProfile(input: {
  tenantId: string;
  id?: string;
  ownerId?: string | null;
  createdBy?: string | null;
  now?: string;
  discovery?: SpaceGassDiscoveryReport;
}): ExternalToolProfile {
  const installs = input.discovery?.installs ?? discoverSpaceGassInstalls();
  const apiProbe = input.discovery?.apiProbe ?? probeSpaceGassApi();
  const report = input.discovery ?? buildSpaceGassDiscoveryReport(installs, apiProbe);
  return withDerivedState(applySpaceGassDiscovery(baseProfile(input), report));
}

export function currentSpaceGassDiscoveryReport(): SpaceGassDiscoveryReport {
  return buildSpaceGassDiscoveryReport(discoverSpaceGassInstalls(), probeSpaceGassApi());
}
