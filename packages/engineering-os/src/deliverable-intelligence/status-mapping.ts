import type { DocumentStatusMapping, DocumentStatusSemantic } from "./types";
import { DOCUMENT_STATUS_SEMANTICS } from "./types";

const INACTIVE_DOCUMENT_STATUSES = new Set(["superseded", "obsolete"]);

export function canonicalInactiveDocumentStatus(status: string | null | undefined): boolean {
  return INACTIVE_DOCUMENT_STATUSES.has(String(status ?? "").trim().toLowerCase());
}

export function isKnownDocumentStatusSemantic(value: string): value is DocumentStatusSemantic {
  return (DOCUMENT_STATUS_SEMANTICS as readonly string[]).includes(value);
}

/**
 * Map a source-system raw status code using governed project/workspace mappings.
 * Unknown codes stay UNMAPPED. Acronyms such as IFC are never inferred.
 */
export function mapDocumentStatus(
  rawStatusCode: string | null | undefined,
  mappings: readonly DocumentStatusMapping[],
  projectId?: string | null,
): { semantic: DocumentStatusSemantic; mapping: DocumentStatusMapping | null } {
  const code = (rawStatusCode ?? "").trim();
  if (!code) return { semantic: "UNMAPPED", mapping: null };
  const enabled = mappings.filter((row) => row.enabled);
  const projectRows = enabled.filter((row) => row.projectId && row.projectId === projectId);
  const workspaceRows = enabled.filter((row) => !row.projectId);
  const scoped = [...projectRows, ...workspaceRows];
  const match = scoped.find((row) => row.rawStatusCode === code);
  if (!match) return { semantic: "UNMAPPED", mapping: null };
  return { semantic: match.semantic, mapping: match };
}
