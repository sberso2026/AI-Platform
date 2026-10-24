import { randomUUID } from "node:crypto";
import { createServiceClient } from "@/lib/supabase/service";
import { sanitizeDocumentFileName, normalizeEngineeringRevision } from "@rtb/engineering-os";

export const DOCUMENT_BUCKET = "engineering-documents";

export function inferDocumentMimeType(fileName: string, reportedType?: string): string {
  if (reportedType && reportedType !== "application/octet-stream") return reportedType;
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".txt")) return "text/plain";
  if (lower.endsWith(".pdf")) return "application/pdf";
  if (lower.endsWith(".docx")) {
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  }
  if (lower.endsWith(".doc")) return "application/msword";
  return reportedType || "application/octet-stream";
}

export function documentObjectPath(input: {
  tenantId: string;
  workspaceId: string;
  documentId: string;
  revision: string;
  fileName: string;
}): string {
  return `${input.tenantId}/${input.workspaceId}/${input.documentId}/${input.revision}/${sanitizeDocumentFileName(input.fileName)}`;
}

export function isScopedDocumentPath(
  objectPath: string,
  tenantId: string,
  workspaceId: string,
  documentId?: string,
): boolean {
  const prefix = documentId
    ? `${tenantId}/${workspaceId}/${documentId}/`
    : `${tenantId}/${workspaceId}/`;
  return objectPath.startsWith(prefix) && !objectPath.includes("..");
}

export async function documentStorageClient() {
  try {
    return createServiceClient();
  } catch {
    return null;
  }
}

export async function ensureDocumentBucket(
  supabase: ReturnType<typeof createServiceClient>,
) {
  const existing = await supabase.storage.getBucket(DOCUMENT_BUCKET);
  if (!existing.error) return;
  const created = await supabase.storage.createBucket(DOCUMENT_BUCKET, { public: false });
  if (created.error && !/already exists/i.test(created.error.message ?? "")) {
    throw new Error(created.error.message ?? "Document storage bucket is not available");
  }
}

export async function documentObjectExists(
  supabase: ReturnType<typeof createServiceClient>,
  objectPath: string,
): Promise<boolean> {
  const folder = objectPath.split("/").slice(0, -1).join("/");
  const fileNameOnly = objectPath.split("/").pop() ?? "";
  const listed = await supabase.storage.from(DOCUMENT_BUCKET).list(folder, {
    search: fileNameOnly,
    limit: 20,
  });
  if ((listed.data ?? []).some((row) => row.name === fileNameOnly)) return true;
  const signed = await supabase.storage.from(DOCUMENT_BUCKET).createSignedUrl(objectPath, 15);
  if (signed.error || !signed.data?.signedUrl) return false;
  try {
    const probe = await fetch(signed.data.signedUrl, {
      method: "GET",
      headers: { Range: "bytes=0-0" },
    });
    return probe.ok || probe.status === 206;
  } catch {
    return false;
  }
}

export async function createDocumentSignedUpload(input: {
  tenantId: string;
  workspaceId: string;
  documentId?: string;
  revision?: string;
  fileName: string;
}) {
  const storage = await documentStorageClient();
  if (!storage) return null;
  await ensureDocumentBucket(storage);
  const documentId = input.documentId ?? randomUUID();
  const revision = normalizeEngineeringRevision(input.revision).revision;
  const objectPath = documentObjectPath({
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    documentId,
    revision,
    fileName: input.fileName,
  });
  const signed = await storage.storage.from(DOCUMENT_BUCKET).createSignedUploadUrl(objectPath, {
    upsert: true,
  });
  if (signed.error || !signed.data?.signedUrl || !signed.data.token) {
    throw new Error(signed.error?.message ?? "Could not create a storage upload session");
  }
  return {
    documentId,
    objectPath,
    signedUrl: signed.data.signedUrl,
    token: signed.data.token,
    bucket: DOCUMENT_BUCKET,
    revision,
  };
}
