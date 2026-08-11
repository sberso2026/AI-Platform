/**
 * Connector → E3 identity mapping handoff.
 * Never silently creates canonical assets/projects from uncertain external IDs.
 */

import {
  createSystemProvenance,
  type ExternalIdentityMapping,
  type EngineeringMappingStatus,
} from "../phase-e3/contracts";
import type { EngineeringExternalRecord } from "./contracts";

export type ConnectorMappingHandoff = {
  record: EngineeringExternalRecord;
  mapping: ExternalIdentityMapping | null;
  mappingStatus: EngineeringMappingStatus;
  asExternalEvidenceOnly: boolean;
};

/**
 * Map connector records through existing mappings.
 * UNRESOLVED / PROBABLE / CONFLICTING → preserve as external evidence only.
 * MATCHED → may attach canonicalObjectId for context ranking.
 */
export function handoffConnectorRecordsToE3(input: {
  tenantId: string;
  workspaceId?: string | null;
  records: EngineeringExternalRecord[];
  existingMappings: ExternalIdentityMapping[];
}): ConnectorMappingHandoff[] {
  const byExternal = new Map<string, ExternalIdentityMapping[]>();
  for (const m of input.existingMappings) {
    if (m.tenantId !== input.tenantId) continue;
    const key = `${m.sourceSystem}::${m.externalId}`;
    const list = byExternal.get(key) ?? [];
    list.push(m);
    byExternal.set(key, list);
  }

  return input.records.map((record) => {
    const key = `${record.sourceSystem}::${record.externalId}`;
    const matches = byExternal.get(key) ?? [];

    if (matches.length === 0) {
      // Do not silently create canonical object — emit unresolved mapping stub for stewardship.
      const unresolved: ExternalIdentityMapping = {
        mappingId: `map:auto:${record.sourceSystem}:${record.externalId}`,
        tenantId: input.tenantId,
        workspaceId: input.workspaceId ?? null,
        canonicalObjectType: "UNKNOWN",
        canonicalObjectId: "",
        sourceSystem: record.sourceSystem,
        externalObjectType: record.externalType,
        externalId: record.externalId,
        externalPath: record.deepLink ?? null,
        mappingStatus: "UNRESOLVED",
        confidence: null,
        provenance: {
          sourceType: "connector",
          sourceId: record.provenance.connectorId,
          mechanism: "IMPORT",
          actorId: null,
          ruleOrVersion: "e4-handoff-v1",
          timestamp: record.retrievedAt,
          note: "No silent canonical create",
        },
        lastSeenAt: record.retrievedAt,
        metadata: { title: record.title },
      };
      return {
        record,
        mapping: unresolved,
        mappingStatus: "UNRESOLVED",
        asExternalEvidenceOnly: true,
      };
    }

    if (matches.length > 1) {
      const conflicting = matches.map((m) => ({
        ...m,
        mappingStatus: "CONFLICTING" as const,
      }));
      return {
        record,
        mapping: conflicting[0],
        mappingStatus: "CONFLICTING",
        asExternalEvidenceOnly: true,
      };
    }

    const mapping = matches[0];
    if (
      mapping.mappingStatus === "MATCHED" &&
      mapping.canonicalObjectId &&
      mapping.canonicalObjectType !== "UNKNOWN"
    ) {
      return {
        record,
        mapping,
        mappingStatus: "MATCHED",
        asExternalEvidenceOnly: false,
      };
    }

    return {
      record,
      mapping,
      mappingStatus: mapping.mappingStatus,
      asExternalEvidenceOnly: true,
    };
  });
}

export function createConfirmedConnectorMapping(input: {
  tenantId: string;
  workspaceId?: string | null;
  sourceSystem: string;
  externalId: string;
  externalType: string;
  canonicalObjectType: string;
  canonicalObjectId: string;
  verifiedBy: string;
}): ExternalIdentityMapping {
  const now = new Date().toISOString();
  return {
    mappingId: `map:confirmed:${input.sourceSystem}:${input.externalId}`,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId ?? null,
    canonicalObjectType: input.canonicalObjectType,
    canonicalObjectId: input.canonicalObjectId,
    sourceSystem: input.sourceSystem,
    externalObjectType: input.externalType,
    externalId: input.externalId,
    mappingStatus: "MATCHED",
    confidence: 1,
    provenance: createSystemProvenance("connector_steward", input.externalId, "confirmed"),
    verifiedAt: now,
    verifiedBy: input.verifiedBy,
    lastSeenAt: now,
  };
}
