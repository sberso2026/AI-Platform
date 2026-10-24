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
  bytes?: Uint8Array | ArrayBuffer | Buffer;
}

export interface DocumentStorageValidationResult {
  ok: true;
  mimeType: DocumentAllowedMimeType;
  sizeBytes: number;
  sanitizedFileName?: string;
}

const ARCHIVE_EXTENSIONS = [".zip", ".7z", ".rar", ".tar", ".gz", ".tgz", ".bz2", ".xz"];

function extensionOf(fileName?: string): string | undefined {
  if (!fileName) return undefined;
  const index = fileName.lastIndexOf(".");
  if (index < 0) return undefined;
  return fileName.slice(index).toLocaleLowerCase();
}

export function sanitizeDocumentFileName(fileName?: string): string | undefined {
  if (!fileName) return undefined;
  const base = fileName.replace(/\\/g, "/").split("/").pop() ?? "";
  const cleaned = base.replace(/[^\w.\- ()[\]]+/g, "_").replace(/^\.+/, "");
  if (!cleaned || cleaned === "." || cleaned === "..") {
    throw new DocumentIntelligenceError(
      "document_unsupported_file_type",
      "File name is not allowed.",
      422,
      { fileName },
    );
  }
  return cleaned.slice(0, 180);
}

function looksLikePdf(bytes: Uint8Array): boolean {
  return bytes.length >= 4 && bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46;
}

function looksLikeZip(bytes: Uint8Array): boolean {
  return bytes.length >= 2 && bytes[0] === 0x50 && bytes[1] === 0x4b;
}

function asBytes(input?: Uint8Array | ArrayBuffer | Buffer): Uint8Array | undefined {
  if (!input) return undefined;
  if (input instanceof Uint8Array) return input;
  return new Uint8Array(input);
}

export function validateDocumentMagicBytes(
  mimeType: DocumentAllowedMimeType,
  bytes?: Uint8Array,
): void {
  if (!bytes || bytes.length === 0) return;
  if (mimeType === "application/pdf" && !looksLikePdf(bytes)) {
    throw new DocumentIntelligenceError(
      "document_unsupported_file_type",
      "File content does not match a PDF signature.",
      422,
      { mimeType },
    );
  }
  if (mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" && !looksLikeZip(bytes)) {
    throw new DocumentIntelligenceError(
      "document_unsupported_file_type",
      "File content does not match a DOCX signature.",
      422,
      { mimeType },
    );
  }
  if (mimeType === "text/plain" && (looksLikePdf(bytes) || looksLikeZip(bytes))) {
    throw new DocumentIntelligenceError(
      "document_unsupported_file_type",
      "File content does not match a text document.",
      422,
      { mimeType },
    );
  }
}

export function validateDocumentStoragePolicy(
  input: DocumentStorageValidationInput,
): DocumentStorageValidationResult {
  const maxBytes = input.maxBytes ?? DOCUMENT_MAX_UPLOAD_BYTES;
  const mimeType = input.mimeType.trim().toLocaleLowerCase();
  const sanitizedFileName = sanitizeDocumentFileName(input.fileName);

  if (sanitizedFileName && ARCHIVE_EXTENSIONS.some((ext) => sanitizedFileName.toLowerCase().endsWith(ext))) {
    throw new DocumentIntelligenceError(
      "document_unsupported_file_type",
      "Archive files are not accepted.",
      422,
      { fileName: sanitizedFileName },
    );
  }

  if (!(DOCUMENT_ALLOWED_MIME_TYPES as readonly string[]).includes(mimeType)) {
    throw new DocumentIntelligenceError(
      "document_unsupported_file_type",
      "This file type is not supported. Use PDF, TXT, or DOCX.",
      422,
      { mimeType, allowed: DOCUMENT_ALLOWED_MIME_TYPES },
    );
  }

  const allowed = mimeType as DocumentAllowedMimeType;
  const extension = extensionOf(sanitizedFileName ?? input.fileName);
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

  validateDocumentMagicBytes(allowed, asBytes(input.bytes));

  return { ok: true, mimeType: allowed, sizeBytes: input.sizeBytes, sanitizedFileName };
}
