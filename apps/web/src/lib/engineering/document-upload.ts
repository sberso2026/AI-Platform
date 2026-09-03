import { parseApiJsonResponse } from "@/lib/api/parse-json-response";
import { DOCUMENT_MAX_UPLOAD_BYTES, DOCUMENT_MAX_UPLOAD_MB } from "@rtb/project-intelligence/client";

export { DOCUMENT_MAX_UPLOAD_BYTES, DOCUMENT_MAX_UPLOAD_MB };

export const DOCUMENT_UPLOAD_ACCEPT =
  ".pdf,.txt,.docx,application/pdf,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export type DocumentUploadSession = {
  documentId: string;
  objectPath: string;
  signedUrl: string;
  token: string;
  bucket: string;
  revision: string;
  maxBytes: number;
  mimeType: string;
  fileName: string;
};

function clientError(message: string): Error {
  return new Error(message);
}

export function assertClientUploadPolicy(file: File): { mimeType: string } {
  const name = file.name.toLowerCase();
  if (!/\.(pdf|txt|docx)$/i.test(name) || name.endsWith(".doc")) {
    throw clientError("This file type is not supported. Use PDF, TXT, or DOCX.");
  }
  if (file.size > DOCUMENT_MAX_UPLOAD_BYTES) {
    throw clientError(`This file exceeds the ${DOCUMENT_MAX_UPLOAD_MB} MB pilot upload limit.`);
  }
  return { mimeType: file.type };
}

export async function createCanonicalDocumentUploadSession(input: {
  file: File;
  documentId?: string;
  revision?: string;
}): Promise<DocumentUploadSession> {
  assertClientUploadPolicy(input.file);
  const parsed = await parseApiJsonResponse<DocumentUploadSession>(
    await fetch("/api/engineering/documents/upload-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileName: input.file.name,
        mimeType: input.file.type,
        sizeBytes: input.file.size,
        documentId: input.documentId,
        revision: input.revision,
      }),
    }),
  );
  if (!parsed.ok || !parsed.data?.signedUrl) {
    throw clientError(parsed.errorMessage ?? "Could not start a document upload.");
  }
  return parsed.data;
}

export async function putFileToSignedUpload(session: DocumentUploadSession, file: File): Promise<void> {
  const res = await fetch(session.signedUrl, {
    method: "PUT",
    headers: {
      "Content-Type": session.mimeType || file.type || "application/octet-stream",
    },
    body: file,
  });
  if (!res.ok) {
    throw clientError("Could not store the file. Try again or contact support.");
  }
}

export async function extractDocumentMetadata(session: DocumentUploadSession, sizeBytes?: number) {
  return parseApiJsonResponse<{
    documentNumber: string | null;
    title: string | null;
    revision: string | null;
    documentType: string | null;
    confidence: number;
    provenance: string;
    lowConfidence: boolean;
  }>(
    await fetch("/api/engineering/documents/extract-metadata", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        objectPath: session.objectPath,
        fileName: session.fileName,
        mimeType: session.mimeType,
        sizeBytes,
      }),
    }),
  );
}

export async function completeCanonicalDocumentUpload(input: {
  documentId: string;
  objectPath: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  engineeringProjectId?: string;
  documentNumber?: string;
  title?: string;
  documentType?: string;
  revision?: string;
  attachOnly?: boolean;
}) {
  return parseApiJsonResponse<Record<string, unknown>>(
    await fetch("/api/engineering/documents/upload-complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }),
  );
}
