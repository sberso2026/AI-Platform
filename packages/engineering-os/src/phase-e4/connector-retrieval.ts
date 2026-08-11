/**
 * Optional connector evidence contribution to E2 retrieval.
 * Native Engineering OS retrieval always runs first; connectors never block indefinitely.
 */

import type { EngineeringEvidence, EngineeringSearchQuery } from "../phase-e2/contracts";
import type { ExternalIdentityMapping } from "../phase-e3/contracts";
import type { EngineeringConnectorCapability, EngineeringExternalRecord } from "./contracts";
import { handoffConnectorRecordsToE3 } from "./e3-handoff";
import type { EngineeringConnectorRegistry } from "./registry";
import { sanitiseExternalText } from "./security";

export type ConnectorRetrievalContribution = {
  evidence: EngineeringEvidence[];
  externalRecords: EngineeringExternalRecord[];
  limitations: string[];
  timing: {
    selectionMs: number;
    queryMs: number;
    normalizeMs: number;
    mappingMs: number;
    totalMs: number;
  };
  connectorsQueried: string[];
  connectorsFailed: string[];
};

const DEFAULT_TIMEOUT_MS = 800;
const DEFAULT_MAX_CONNECTORS = 3;
const DEFAULT_MAX_RECORDS = 12;

function intentCapabilities(query: string): EngineeringConnectorCapability[] {
  const q = query.toLowerCase();
  const caps: EngineeringConnectorCapability[] = ["SEARCH"];
  if (/\b(sap|notification|work order|floc|maintenance)\b/.test(q)) {
    caps.push("ASSET_MASTER", "WORK_ORDER_READ", "MAINTENANCE_HISTORY");
  }
  if (/\b(sharepoint|document|file|pdf)\b/.test(q)) {
    caps.push("DOCUMENT_METADATA", "DOCUMENT_CONTENT", "FILE_IMPORT");
  }
  if (/\b(fabric|dataset|lakehouse)\b/.test(q)) {
    caps.push("DATA_QUERY");
  }
  if (/\b(csv|excel|import)\b/.test(q)) {
    caps.push("FILE_IMPORT");
  }
  return [...new Set(caps)];
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("connector_timeout")), ms);
    promise.then(
      (v) => {
        clearTimeout(t);
        resolve(v);
      },
      (e) => {
        clearTimeout(t);
        reject(e);
      },
    );
  });
}

function mapRecordToEvidence(
  record: EngineeringExternalRecord,
  mappingCanonicalId: string | null,
): EngineeringEvidence | null {
  if (record.revoked) return null;
  if (record.permissionsApplied === false) return null;
  // UNKNOWN must never be presented as secure equivalence — exclude from grounded evidence.
  if (record.permissionsApplied === "unknown") return null;

  const excerptSan = sanitiseExternalText(
    record.content ?? record.title ?? record.externalId,
  );
  const sourceType =
    record.externalType === "document" || record.externalType === "file_row"
      ? "document"
      : record.externalType === "notification" || record.externalType === "work_order"
        ? "issue"
        : "document";

  return {
    sourceId: `${record.sourceSystem}:${record.externalId}`,
    sourceType,
    title: record.title,
    canonicalObjectId: mappingCanonicalId ?? `external:${record.sourceSystem}:${record.externalId}`,
    projectId: record.projectRef ?? null,
    revision: record.revision ?? null,
    authorityStatus: "UNKNOWN",
    sourceLocation: record.deepLink ?? `${record.sourceSystem}/${record.externalId}`,
    excerpt: excerptSan.text.slice(0, 400),
    retrievalScore: 100,
    provenance: "connector_external",
    lastUpdated: record.updatedAt ?? record.freshness?.lastSyncAt ?? record.retrievedAt,
    permissionsApplied: true,
    conflicting: false,
  };
}

/**
 * Query only relevant/installed/healthy connectors; normalize; apply E3 mappings.
 */
export async function retrieveConnectorEvidence(input: {
  query: EngineeringSearchQuery;
  registry: EngineeringConnectorRegistry | null | undefined;
  existingMappings?: ExternalIdentityMapping[];
  timeoutMs?: number;
  maxConnectors?: number;
}): Promise<ConnectorRetrievalContribution> {
  const totalStarted = Date.now();
  const limitations: string[] = [];
  const evidence: EngineeringEvidence[] = [];
  const externalRecords: EngineeringExternalRecord[] = [];
  const connectorsQueried: string[] = [];
  const connectorsFailed: string[] = [];

  if (!input.registry) {
    return {
      evidence: [],
      externalRecords: [],
      limitations: [],
      timing: {
        selectionMs: 0,
        queryMs: 0,
        normalizeMs: 0,
        mappingMs: 0,
        totalMs: 0,
      },
      connectorsQueried,
      connectorsFailed,
    };
  }

  const selStarted = Date.now();
  const caps = intentCapabilities(input.query.query);
  const adapters = input.registry.selectForQuery({
    tenantId: input.query.tenantId,
    workspaceId: input.query.workspaceId,
    capabilitiesNeeded: caps,
    limit: input.maxConnectors ?? DEFAULT_MAX_CONNECTORS,
  });
  const selectionMs = Date.now() - selStarted;

  let queryMs = 0;
  let normalizeMs = 0;
  const rawRecords: EngineeringExternalRecord[] = [];

  await Promise.all(
    adapters.map(async (adapter) => {
      connectorsQueried.push(adapter.metadata.connectorId);
      const qStarted = Date.now();
      try {
        const searchFn =
          adapter.search?.bind(adapter) ??
          (adapter.queryDataset
            ? (args: { tenantId: string; query: string; limit?: number }) =>
                adapter.queryDataset!({
                  tenantId: args.tenantId,
                  query: args.query,
                  limit: args.limit,
                })
            : null);
        if (!searchFn) {
          connectorsFailed.push(adapter.metadata.connectorId);
          return;
        }
        const result = await withTimeout(
          searchFn({
            tenantId: input.query.tenantId,
            workspaceId: input.query.workspaceId,
            query: input.query.query,
            limit: 8,
          }),
          input.timeoutMs ?? DEFAULT_TIMEOUT_MS,
        );
        queryMs += Date.now() - qStarted;
        const nStarted = Date.now();
        for (const r of result.records) {
          if (r.revoked) continue;
          rawRecords.push(r);
        }
        if (result.limitations?.length) limitations.push(...result.limitations);
        normalizeMs += Date.now() - nStarted;
      } catch (err) {
        queryMs += Date.now() - qStarted;
        connectorsFailed.push(adapter.metadata.connectorId);
        const msg = err instanceof Error ? err.message : "connector_error";
        if (msg === "connector_timeout") {
          limitations.push(
            `Connector ${adapter.metadata.displayName} timed out; continued with available sources.`,
          );
        } else if (msg.includes("unavailable") || msg.includes("disabled")) {
          limitations.push(
            `Connector ${adapter.metadata.displayName} unavailable; native Engineering OS search continues.`,
          );
        } else if (msg.includes("AUTH")) {
          limitations.push(`Connector ${adapter.metadata.displayName} auth error.`);
        } else {
          limitations.push(
            `Connector ${adapter.metadata.displayName} failed (${msg}); continued without fabricated data.`,
          );
        }
      }
    }),
  );

  const mapStarted = Date.now();
  const handoffs = handoffConnectorRecordsToE3({
    tenantId: input.query.tenantId,
    workspaceId: input.query.workspaceId,
    records: rawRecords.slice(0, DEFAULT_MAX_RECORDS),
    existingMappings: input.existingMappings ?? [],
  });

  for (const h of handoffs) {
    externalRecords.push(h.record);
    if (h.record.permissionsApplied === "unknown") {
      limitations.push(
        `External record ${h.record.sourceSystem}:${h.record.externalId} has unknown source permissions; excluded from grounded evidence.`,
      );
      continue;
    }
    if (h.mappingStatus === "CONFLICTING") {
      limitations.push(
        `Conflicting identity for ${h.record.sourceSystem}:${h.record.externalId}; retained as external reference only.`,
      );
    }
    const canonicalId =
      !h.asExternalEvidenceOnly && h.mapping?.canonicalObjectId
        ? h.mapping.canonicalObjectId
        : null;
    const ev = mapRecordToEvidence(h.record, canonicalId);
    if (ev) {
      if (h.mappingStatus === "CONFLICTING") ev.conflicting = true;
      evidence.push(ev);
    }
  }
  const mappingMs = Date.now() - mapStarted;

  // Freshness statements when available
  for (const r of externalRecords) {
    if (r.freshness?.lastSyncAt) {
      limitations.push(
        `${r.sourceSystem} data last synchronized at ${r.freshness.lastSyncAt}.`,
      );
      break;
    }
  }

  return {
    evidence,
    externalRecords,
    limitations: [...new Set(limitations)],
    timing: {
      selectionMs,
      queryMs,
      normalizeMs,
      mappingMs,
      totalMs: Date.now() - totalStarted,
    },
    connectorsQueried,
    connectorsFailed,
  };
}
