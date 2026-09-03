import { DocumentIntelligenceError } from "./errors";

export const DOCUMENT_ALLOWED_MIME_TYPES = [
  "application/pdf",
  "text/plain",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

export type DocumentAllowedMimeType = (typeof DOCUMENT_ALLOWED_MIME_TYPES)[number];

/** Pilot / freeze default: 25 MiB unless Platform policy tightens. */
export const DOCUMENT_MAX_UPLOAD_MB = 25;
export const DOCUMENT_MAX_UPLOAD_BYTES = DOCUMENT_MAX_UPLOAD_MB * 1024 * 1024;

const EXTENSION_BY_MIME: Record<DocumentAllowedMimeType, readonly string[]> = {
  "application/pdf": [".pdf"],
  "text/plain": [".txt"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
};

export interface DocumentStorageValidationInput {
  mimeType: string;
  fileName?: string;
  sizeBytes: number;
  maxBytes?: number;
}

export interface DocumentStorageValidationResult {
  ok: true;
  mimeType: DocumentAllowedMimeType;
  sizeBytes: number;
}

function extensionOf(fileName?: string): string | undefined {
  if (!fileName) return undefined;
  const index = fileName.lastIndexOf(".");
  if (index < 0) return undefined;
  return fileName.slice(index).toLocaleLowerCase();
}

export function validateDocumentStoragePolicy(
  input: DocumentStorageValidationInput,
): DocumentStorageValidationResult {
  const maxBytes = input.maxBytes ?? DOCUMENT_MAX_UPLOAD_BYTES;
  const mimeType = input.mimeType.trim().toLocaleLowerCase();

  if (!(DOCUMENT_ALLOWED_MIME_TYPES as readonly string[]).includes(mimeType)) {
    throw new DocumentIntelligenceError(
      "document_unsupported_file_type",
      "This file type is not supported. Use PDF, TXT, or DOCX.",
      422,
      { mimeType, allowed: DOCUMENT_ALLOWED_MIME_TYPES },
    );
  }

  const allowed = mimeType as DocumentAllowedMimeType;
  const extension = extensionOf(input.fileName);
  if (extension && !EXTENSION_BY_MIME[allowed].includes(extension)) {
    throw new DocumentIntelligenceError(
      "document_unsupported_file_type",
      "This file type is not supported. Use PDF, TXT, or DOCX.",
      422,
      { mimeType, extension },
    );
  }

  if (!Number.isFinite(input.sizeBytes) || input.sizeBytes < 0) {
    throw new DocumentIntelligenceError("document_file_too_large", "Invalid file size", 422, { sizeBytes: input.sizeBytes });
  }

  if (input.sizeBytes > maxBytes) {
    const maxMb = Math.round(maxBytes / (1024 * 1024));
    throw new DocumentIntelligenceError(
      "document_file_too_large",
      `This file exceeds the ${maxMb} MB pilot upload limit.`,
      422,
      { sizeBytes: input.sizeBytes, maxBytes },
    );
  }

  return { ok: true, mimeType: allowed, sizeBytes: input.sizeBytes };
}
