import type { ConnectorContextRecord } from "./types";

const PROJECT_ENTITY_TYPES = new Set(["engineering_project", "project"]);

function stringId(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

/**
 * Explicit/deterministic project binding only.
 * Semantic similarity is never used to infer a project association.
 */
export function explicitBoundProjectId(record: ConnectorContextRecord): string | null {
  const provenance = record.provenance ?? {};
  const payload = record.payload ?? {};
  const fromCanonical =
    record.canonicalEntityType && PROJECT_ENTITY_TYPES.has(String(record.canonicalEntityType))
      ? stringId(record.canonicalEntityId)
      : null;
  return (
    stringId(provenance.projectId) ??
    stringId(provenance.boundProjectId) ??
    stringId(provenance.engineeringProjectId) ??
    stringId(payload.projectId) ??
    stringId(payload.boundProjectId) ??
    stringId(payload.engineeringProjectId) ??
    fromCanonical
  );
}

export function recordMatchesTenantWorkspace(
  record: ConnectorContextRecord,
  scope: { tenantId: string; workspaceId: string },
): boolean {
  return record.tenantId === scope.tenantId && record.workspaceId === scope.workspaceId;
}
