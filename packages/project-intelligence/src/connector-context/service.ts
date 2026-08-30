import { sectionCitation } from "../ai-project-analyst/tools";
import { explicitBoundProjectId, recordMatchesTenantWorkspace } from "./binding";
import { detectCanonicalExternalConflicts } from "./conflicts";
import { classifyConnectorFreshness } from "./freshness";
import { assertConnectorContextOwnershipLocks } from "./ownership";
import { connectorWriteForbidden, type ConnectorContextSource } from "./ports";
import {
  boundedExcerpt,
  descriptorFromPayload,
  safeStructuredFacts,
  sanitizeConnectorText,
  stripSecretFields,
} from "./sanitize";
import {
  CONNECTOR_CANONICALITY,
  EMPTY_CONNECTOR_CONTEXT_PACK,
  MAX_CONNECTOR_CONTEXT_ITEMS,
  type ConnectorCanonicalSnapshot,
  type ConnectorContextItem,
  type ConnectorContextPack,
  type ConnectorContextRecord,
} from "./types";

function freshnessQualifier(item: Pick<ConnectorContextItem, "freshness">): string {
  if (item.freshness === "stale") return "Stale external context";
  if (item.freshness === "unknown") return "External context (freshness UNKNOWN)";
  return "External context";
}

export function describeConnectorItem(item: ConnectorContextItem): string {
  return `${freshnessQualifier(item)} from ${item.sourceSystem} (${item.title}): ${item.excerpt}`;
}

function toItem(
  record: ConnectorContextRecord,
  projectId: string,
  now: string,
): ConnectorContextItem {
  const payload = stripSecretFields(record.payload ?? {});
  const fallback = `${record.sourceSystem} ${record.externalResourceId}`;
  const descriptor = descriptorFromPayload(payload, record.title ?? fallback);
  const sourceText = record.excerpt ?? descriptor.excerpt;
  const sanitized = sanitizeConnectorText(sourceText);
  const bounded = boundedExcerpt(sanitized.text);
  const titleSanitized = sanitizeConnectorText(record.title ?? descriptor.title);
  const freshness = classifyConnectorFreshness({
    sourceTimestamp: record.sourceTimestamp,
    retrievedAt: record.retrievedAt,
    freshnessPolicyHours: record.freshnessPolicyHours,
    now,
  });
  const citation = sectionCitation(
    `connector.${record.sourceSystem}`,
    record.resourceType,
    record.externalResourceId,
    record.sourceTimestamp ?? record.retrievedAt,
    titleSanitized.text,
  );
  return {
    tenantId: record.tenantId,
    workspaceId: record.workspaceId,
    projectId,
    binding: "project_bound",
    sourceSystem: record.sourceSystem,
    connectorId: record.connectorId,
    connectionId: record.connectionId,
    externalResourceId: record.externalResourceId,
    resourceType: record.resourceType,
    title: titleSanitized.text,
    excerpt: bounded.excerpt,
    structuredFacts: safeStructuredFacts(payload),
    sourceTimestamp: record.sourceTimestamp,
    retrievedAt: record.retrievedAt,
    freshness,
    provenance: `${record.sourceSystem}:${record.connectorId}:${record.externalResourceId}`,
    permissionScope: record.permissionScope,
    canonicality: CONNECTOR_CANONICALITY,
    truncated: bounded.truncated || titleSanitized.containsInjection,
    containsInjection: sanitized.containsInjection || titleSanitized.containsInjection,
    citation: { ...citation, storesCanonicalCopy: false },
  };
}

export function assembleConnectorContext(input: {
  scope: { tenantId: string; workspaceId: string; projectId: string };
  records: readonly ConnectorContextRecord[];
  availability?: ConnectorContextPack["availability"];
  liveExecution?: boolean;
  skippedReason?: string;
  now?: string;
  canonical: ConnectorCanonicalSnapshot;
}): ConnectorContextPack {
  assertConnectorContextOwnershipLocks();
  const now = input.now ?? new Date().toISOString();
  let unboundExcludedCount = 0;
  let otherProjectExcludedCount = 0;
  let crossTenantExcludedCount = 0;
  const bound: ConnectorContextItem[] = [];

  for (const record of input.records) {
    if (!recordMatchesTenantWorkspace(record, input.scope)) {
      crossTenantExcludedCount += 1;
      continue;
    }
    const boundProjectId = explicitBoundProjectId(record);
    if (!boundProjectId) {
      unboundExcludedCount += 1;
      continue;
    }
    if (boundProjectId !== input.scope.projectId) {
      otherProjectExcludedCount += 1;
      continue;
    }
    bound.push(toItem(record, input.scope.projectId, now));
  }

  const truncated = bound.length > MAX_CONNECTOR_CONTEXT_ITEMS;
  const items = bound.slice(0, MAX_CONNECTOR_CONTEXT_ITEMS);
  const conflicts = detectCanonicalExternalConflicts(items, input.canonical);
  const availability = input.availability ?? (items.length ? "ok" : "unavailable");

  return {
    availability,
    items,
    unboundExcludedCount,
    otherProjectExcludedCount,
    crossTenantExcludedCount,
    conflicts,
    liveExecution: Boolean(input.liveExecution),
    degraded: availability === "error" || availability === "degraded",
    skippedReason: input.skippedReason,
    truncated,
    readOnly: true,
    externalWritesEnabled: false,
    canonicality: CONNECTOR_CANONICALITY,
  };
}

export async function loadConnectorContext(
  source: ConnectorContextSource,
  scope: { tenantId: string; workspaceId: string; projectId: string; principalId: string },
  canonical: ConnectorCanonicalSnapshot,
  now?: string,
): Promise<ConnectorContextPack> {
  assertConnectorContextOwnershipLocks();
  try {
    const result = await source.read(scope);
    if (result.availability === "forbidden") {
      return {
        ...EMPTY_CONNECTOR_CONTEXT_PACK,
        availability: "forbidden",
        skippedReason: result.skippedReason ?? "connector_permission_denied",
      };
    }
    if (result.availability === "error") {
      return {
        ...EMPTY_CONNECTOR_CONTEXT_PACK,
        availability: "error",
        degraded: true,
        skippedReason: result.skippedReason ?? "connector_unavailable",
      };
    }
    return assembleConnectorContext({
      scope,
      records: result.records,
      availability: result.availability,
      liveExecution: result.liveExecution,
      skippedReason: result.skippedReason,
      now,
      canonical,
    });
  } catch {
    return {
      ...EMPTY_CONNECTOR_CONTEXT_PACK,
      availability: "error",
      degraded: true,
      skippedReason: "connector_unavailable",
    };
  }
}

export function writeExternalConnectorContext(): never {
  return connectorWriteForbidden();
}
