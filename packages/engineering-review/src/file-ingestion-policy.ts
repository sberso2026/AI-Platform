import { failClosed } from "./errors";

/**
 * Review consumes PI-ingested files. There is no established malware scanner
 * in this architecture, so external/customer upload is fail-closed for pilot
 * unless an operator explicitly enables it.
 *
 * Internal controlled fixtures remain usable.
 */
export const REVIEW_MALWARE_SCANNING_AVAILABLE = false as const;

export const REVIEW_ARCHIVE_EXTENSIONS = [
  ".zip",
  ".7z",
  ".rar",
  ".tar",
  ".gz",
  ".tgz",
  ".bz2",
  ".xz",
] as const;

export type ReviewFileIngestionMode = "internal_test" | "pilot";

export type ReviewFileIngestionPolicy = {
  mode: ReviewFileIngestionMode;
  malwareScanningAvailable: boolean;
  allowExternalCustomerUpload: boolean;
};

export type ReviewIngestionDocument = {
  documentId: string;
  fileName?: string;
  mimeType?: string;
  controlledFixture?: boolean;
  ingestionSource?: "internal_fixture" | "external_customer" | "unknown";
};

export function defaultReviewFileIngestionPolicy(
  env: NodeJS.ProcessEnv = process.env,
): ReviewFileIngestionPolicy {
  const allowExternal = env.RTB_REVIEW_ALLOW_EXTERNAL_UPLOAD === "1";
  const production =
    env.VERCEL_ENV === "production" ||
    env.RTB_REVIEW_FILE_POLICY === "pilot" ||
    env.NODE_ENV === "production";
  return {
    mode: production ? "pilot" : "internal_test",
    malwareScanningAvailable: REVIEW_MALWARE_SCANNING_AVAILABLE,
    allowExternalCustomerUpload: allowExternal,
  };
}

export function isArchiveFileName(fileName?: string): boolean {
  if (!fileName) return false;
  const lower = fileName.toLowerCase();
  return REVIEW_ARCHIVE_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

export function isControlledReviewDocument(doc: ReviewIngestionDocument): boolean {
  return doc.controlledFixture === true || doc.ingestionSource === "internal_fixture";
}

export function assertReviewFileIngestionAllowed(
  policy: ReviewFileIngestionPolicy,
  documents: readonly ReviewIngestionDocument[],
): void {
  for (const doc of documents) {
    if (isArchiveFileName(doc.fileName)) {
      failClosed("archive_ingest_forbidden", "Archive files are not accepted for Engineering Review", {
        documentId: doc.documentId,
      });
    }
  }

  if (policy.mode === "internal_test") return;

  if (policy.allowExternalCustomerUpload && policy.malwareScanningAvailable) return;

  const rejected = documents.filter((doc) => !isControlledReviewDocument(doc));
  if (rejected.length === 0) return;

  failClosed(
    "external_upload_disabled",
    "External customer file ingestion is disabled until malware scanning is available",
    {
      malwareScanningAvailable: policy.malwareScanningAvailable,
      allowExternalCustomerUpload: policy.allowExternalCustomerUpload,
      rejectedDocumentIds: rejected.map((doc) => doc.documentId),
    },
  );
}
