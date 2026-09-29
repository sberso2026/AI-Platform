import { SPACE_GASS_CATALOG_ENTRY } from "./catalog";
import { withDerivedState } from "./readiness";
import type { ExternalToolProfile } from "./types";

const emptyValidation = {
  ranAt: null,
  overall: "NOT_RUN" as const,
  checks: [],
};

/**
 * Canonical SPACE GASS platform profile for EOS-A5E amendment.
 * Accurately NOT_CONFIGURED / NOT_READY. Does not fabricate install, version, licence, or automation.
 */
export function buildNotReadySpaceGassProfile(input: {
  tenantId: string;
  id?: string;
  ownerId?: string | null;
  createdBy?: string | null;
  now?: string;
}): ExternalToolProfile {
  const now = input.now ?? new Date().toISOString();
  const catalog = SPACE_GASS_CATALOG_ENTRY;
  return withDerivedState({
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
  });
}
