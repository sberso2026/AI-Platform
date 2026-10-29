/**
 * Canonical Engineering document identity and revision integrity.
 * Browser-safe — no Node crypto. Checksums are supplied by the server attach path.
 */

export const PENDING_DOCUMENT_REVISION = "PENDING";

const TIMESTAMP_REVISION = /^\d{4}-\d{10,}$/;
const TIMESTAMP_NUMBER = /^(?:META|TMP|RETRY|UAT)-\d{8,}$/i;
const UUID_LIKE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const VALID_REVISION =
  /^(?:[A-Z]|[A-Z]\d{1,2}|\d{1,3}|P\d{1,2}|IFR|IFC|IFD|IFU|AFC|AFD|AFU|REV\s*[A-Z0-9]{1,3}|19\d{2}|20\d{2})$/i;

export function normalizeDocumentNumber(value: string | null | undefined): string | null {
  const trimmed = (value ?? "").trim().replace(/\s+/g, " ");
  if (!trimmed) return null;
  if (TIMESTAMP_NUMBER.test(trimmed) || UUID_LIKE.test(trimmed)) return null;
  return trimmed.toUpperCase().replace(/\s*:\s*/g, ":");
}

export function isTimestampRevisionArtifact(value: string | null | undefined): boolean {
  const trimmed = (value ?? "").trim();
  return TIMESTAMP_REVISION.test(trimmed) || (trimmed.includes("-") && /\d{10,}/.test(trimmed) && /^\d{4}-/.test(trimmed));
}

export function isValidEngineeringRevision(value: string | null | undefined): boolean {
  const trimmed = (value ?? "").trim();
  if (!trimmed) return false;
  if (isTimestampRevisionArtifact(trimmed) || UUID_LIKE.test(trimmed)) return false;
  return VALID_REVISION.test(trimmed.replace(/\s+/g, ""));
}

export function normalizeEngineeringRevision(
  value: string | null | undefined,
): { revision: string; pendingReview: boolean; rejected: string | null } {
  const trimmed = (value ?? "").trim();
  if (!trimmed) {
    return { revision: "A", pendingReview: false, rejected: null };
  }
  if (isTimestampRevisionArtifact(trimmed) || UUID_LIKE.test(trimmed)) {
    return { revision: "A", pendingReview: true, rejected: trimmed };
  }
  const compact = trimmed.replace(/\s+/g, "").toUpperCase();
  if (/^REV[A-Z0-9]{1,3}$/.test(compact)) {
    return { revision: compact.replace(/^REV/, ""), pendingReview: false, rejected: null };
  }
  if (isValidEngineeringRevision(compact)) {
    return { revision: compact, pendingReview: false, rejected: null };
  }
  return { revision: "A", pendingReview: true, rejected: trimmed };
}

export function inferStandardDocumentNumber(haystack: string): string | null {
  const normalized = (haystack ?? "").replace(/[\u2010-\u2015]/g, "-");
  const match = normalized.match(
    /\b(AS\s*\/\s*NZS|ASNZS|AS|NZS|ISO)[\s._-]*(\d+(?:\.\d+)*)(?:[\s._:\-]+(\d{4}))?/i,
  );
  if (!match) return null;
  let code = match[1].toUpperCase().replace(/\s+/g, "");
  if (code === "ASNZS" || code === "AS/NZS") code = "AS/NZS";
  const number = match[2];
  const year = match[3];
  return year ? `${code} ${number}:${year}` : `${code} ${number}`;
}

/** Prefer a dated standard identity over a prefix without the year. */
export function preferCompleteStandardNumber(
  primary: string | null | undefined,
  fallback: string | null | undefined,
): string | null {
  const inferredPrimary = inferStandardDocumentNumber(primary ?? "") ?? normalizeDocumentNumber(primary);
  const inferredFallback = inferStandardDocumentNumber(fallback ?? "") ?? normalizeDocumentNumber(fallback);
  if (inferredPrimary && inferredFallback) {
    const compactPrimary = inferredPrimary.replace(/\s+/g, "");
    const compactFallback = inferredFallback.replace(/\s+/g, "");
    if (compactFallback.startsWith(compactPrimary) && compactFallback.length > compactPrimary.length) {
      return inferredFallback;
    }
    if (compactPrimary.startsWith(compactFallback) && compactPrimary.length > compactFallback.length) {
      return inferredPrimary;
    }
    return inferredPrimary;
  }
  return inferredPrimary ?? inferredFallback;
}

export function canonicalDocumentIdentityKey(input: {
  tenantId: string;
  workspaceId: string;
  documentNumber: string;
  revision: string;
  sourceChecksum?: string | null;
}): string {
  const number = normalizeDocumentNumber(input.documentNumber) ?? input.documentNumber;
  const revision = normalizeEngineeringRevision(input.revision).revision;
  const checksum = (input.sourceChecksum ?? "").trim().toLowerCase();
  return [input.tenantId, input.workspaceId, number, revision, checksum || "no-checksum"].join("|");
}

export type DocumentIdentityRecord = {
  id: string;
  document_number: string;
  revision: string;
  file_path?: string | null;
  file_name?: string | null;
  file_size?: number | null;
  status?: string | null;
  metadata?: Record<string, unknown> | null;
};

export function sourceChecksumOf(metadata: Record<string, unknown> | null | undefined): string | null {
  const value = metadata?.source_sha256;
  return typeof value === "string" && value.trim() ? value.trim().toLowerCase() : null;
}

export function resolveCanonicalDocumentRegistration(input: {
  sourceChecksum?: string | null;
  fileName?: string | null;
  fileSize?: number | null;
  filePath?: string | null;
  existingByChecksum?: DocumentIdentityRecord | null;
  existingByNumberRevision?: DocumentIdentityRecord | null;
}): { action: "create" | "reuse" | "conflict"; canonical?: DocumentIdentityRecord; reason: string } {
  const checksum = (input.sourceChecksum ?? "").trim().toLowerCase() || null;
  const visible = (row: DocumentIdentityRecord | null | undefined) => {
    if (!row) return null;
    const status = (row.status ?? "").toLowerCase();
    if (status === "superseded" || status === "obsolete") return null;
    return row;
  };
  const byChecksum = visible(input.existingByChecksum);
  if (byChecksum) {
    return { action: "reuse", canonical: byChecksum, reason: "source_checksum" };
  }
  const byNumber = visible(input.existingByNumberRevision);
  if (!byNumber) {
    return { action: "create", reason: "new_identity" };
  }
  const existingChecksum = sourceChecksumOf(byNumber.metadata ?? null);
  if (checksum && existingChecksum && checksum === existingChecksum) {
    return { action: "reuse", canonical: byNumber, reason: "number_revision_checksum" };
  }
  if (checksum && existingChecksum && checksum !== existingChecksum) {
    return { action: "conflict", canonical: byNumber, reason: "number_revision_checksum_mismatch" };
  }
  if (
    input.filePath
    && byNumber.file_path
    && input.filePath === byNumber.file_path
  ) {
    return { action: "reuse", canonical: byNumber, reason: "same_object_path" };
  }
  if (
    input.fileName
    && byNumber.file_name
    && input.fileName === byNumber.file_name
    && Number(input.fileSize ?? 0) > 0
    && Number(byNumber.file_size ?? 0) === Number(input.fileSize)
  ) {
    return { action: "reuse", canonical: byNumber, reason: "same_filename_size" };
  }
  if (checksum && !existingChecksum && !byNumber.file_path) {
    return { action: "reuse", canonical: byNumber, reason: "register_row_without_source" };
  }
  if (checksum && existingChecksum !== checksum && byNumber.file_path) {
    return { action: "conflict", canonical: byNumber, reason: "replacement_requires_review" };
  }
  if (!checksum && byNumber.file_path && input.filePath && input.filePath !== byNumber.file_path) {
    return { action: "conflict", canonical: byNumber, reason: "replacement_requires_review" };
  }
  return { action: "reuse", canonical: byNumber, reason: "number_revision" };
}
