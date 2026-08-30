import { redactConnectorSecrets, redactSuppressedConnectorPayload } from "./redact";
import type {
  PlatformConnectorContextRead,
  PlatformConnectorContextRecord,
  PlatformConnectorInstallationLite,
  PlatformConnectorStagingLite,
} from "./types";

const DEFAULT_FRESHNESS_POLICY_HOURS = 24;

export function resolveConnectorFreshnessPolicyHours(
  connectorId: string,
  provenance: Record<string, unknown> | undefined,
  catalogHours?: number,
): number {
  if (typeof catalogHours === "number" && Number.isFinite(catalogHours)) return catalogHours;
  const stored = provenance?.freshnessPolicyHours;
  if (typeof stored === "number" && Number.isFinite(stored)) return stored;
  if (connectorId === "csv_excel") return 0;
  return DEFAULT_FRESHNESS_POLICY_HOURS;
}

export const emptyConnectorContextRead = (): PlatformConnectorContextRead => ({
  availability: "error",
  records: [],
  liveExecution: false,
  usableWithoutConnectors: true,
  writeLabel: "READ ONLY",
  secretIdPresent: false,
});

export function assemblePlatformConnectorContext(input: {
  scope: { tenantId: string; workspaceId: string };
  installations: readonly PlatformConnectorInstallationLite[];
  staging: readonly PlatformConnectorStagingLite[];
  freshnessPolicyHoursFor?: (connectorId: string, provenance: Record<string, unknown>) => number;
}): PlatformConnectorContextRead {
  const byId = new Map(input.installations.map((row) => [row.id, row]));
  const records: PlatformConnectorContextRecord[] = [];
  for (const row of input.staging) {
    if (row.tenantId !== input.scope.tenantId) continue;
    if (row.workspaceId !== input.scope.workspaceId) continue;
    const installation = byId.get(row.installationId);
    if (!installation || installation.health === "revoked") continue;
    if (installation.tenantId !== input.scope.tenantId) continue;
    if (installation.workspaceId !== input.scope.workspaceId) continue;
    const policyHours = input.freshnessPolicyHoursFor
      ? input.freshnessPolicyHoursFor(row.connectorId, row.provenance)
      : resolveConnectorFreshnessPolicyHours(row.connectorId, {
          ...installation.provenance,
          ...row.provenance,
        });
    records.push({
      id: row.id,
      tenantId: row.tenantId,
      workspaceId: row.workspaceId,
      connectorId: row.connectorId,
      connectionId: row.installationId,
      provider: row.provider,
      externalSourceId: row.externalSourceId,
      dataClass: row.dataClass,
      retrievedAt: row.retrievedAt,
      sourceUpdatedAt: row.sourceUpdatedAt,
      freshness: row.freshness,
      mappingVersion: row.mappingVersion,
      payload: redactSuppressedConnectorPayload(row.payload, row.suppressed),
      matchStatus: row.matchStatus,
      canonicalEntityType: row.canonicalEntityType,
      canonicalEntityId: row.canonicalEntityId,
      becomesCanonical: false,
      suppressed: row.suppressed,
      provenance: redactConnectorSecrets({ ...row.provenance }),
      installationHealth: installation.health,
      installationMode: installation.effectiveMode,
      live: installation.effectiveMode === "live",
      fixture: installation.effectiveMode !== "live",
      freshnessPolicyHours: policyHours,
      writeClassification: "read_only",
    });
  }
  const allInstallationsDown =
    input.installations.length > 0 &&
    input.installations.every((row) => row.health === "unavailable" || row.health === "revoked");
  const liveExecution = records.some(
    (row) => row.live && (row.installationHealth === "healthy" || row.installationHealth === "configured"),
  );
  return {
    availability: allInstallationsDown ? "unavailable" : "ok",
    records,
    liveExecution,
    usableWithoutConnectors: true,
    writeLabel: "READ ONLY",
    secretIdPresent: false,
  };
}
