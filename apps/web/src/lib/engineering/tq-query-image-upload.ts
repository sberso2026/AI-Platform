import { parseApiJsonResponse } from "@/lib/api/parse-json-response";
import { TQ_QUERY_IMAGE_MAX_BYTES, inferTqQueryImageMime, validateTqQueryImagePolicy } from "@rtb/engineering-os/browser";
import type { DocumentUploadSession } from "@/lib/engineering/document-upload";
import { putFileToSignedUpload } from "@/lib/engineering/document-upload";

export const TQ_QUERY_IMAGE_ACCEPT = ".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp";

export function tqQueryImageFileName(file: File): string {
  const original = file.name?.trim();
  if (original && /\.(png|jpe?g|webp)$/i.test(original)) return original;
  const mime = inferTqQueryImageMime(original ?? "", file.type);
  const ext = mime === "image/jpeg" ? "jpg" : mime === "image/webp" ? "webp" : "png";
  return `query-image-${Date.now()}.${ext}`;
}

export function assertTqQueryImagePolicy(file: File): { mimeType: string; fileName: string } {
  const fileName = tqQueryImageFileName(file);
  const mimeType = validateTqQueryImagePolicy({
    mimeType: inferTqQueryImageMime(fileName, file.type),
    fileName,
    sizeBytes: file.size,
  }).mimeType;
  if (file.size > TQ_QUERY_IMAGE_MAX_BYTES) {
    throw new Error("This image exceeds the 25 MB upload limit.");
  }
  return { mimeType, fileName };
}

export async function createTqQueryImageUploadSession(input: {
  tqId: string;
  file: File;
}): Promise<DocumentUploadSession & { tqId: string; fileName: string }> {
  const { mimeType, fileName } = assertTqQueryImagePolicy(input.file);
  const parsed = await parseApiJsonResponse<DocumentUploadSession & { tqId: string }>(
    await fetch("/api/engineering/technical-queries/query-images/upload-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tqId: input.tqId,
        fileName,
        mimeType,
        sizeBytes: input.file.size,
      }),
    }),
  );
  if (!parsed.ok || !parsed.data?.signedUrl) {
    throw new Error(parsed.errorMessage ?? "Could not start an image upload.");
  }
  return { ...parsed.data, fileName };
}

export async function completeTqQueryImageUpload(input: {
  tqId: string;
  documentId: string;
  objectPath: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  engineeringProjectId?: string;
}) {
  const parsed = await parseApiJsonResponse<{
    documentId: string;
    tqId: string;
    fileName: string;
    mimeType: string;
    src: string;
  }>(
    await fetch("/api/engineering/technical-queries/query-images/upload-complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }),
  );
  if (!parsed.ok || !parsed.data?.documentId) {
    throw new Error(parsed.errorMessage ?? "Could not register the query image.");
  }
  return parsed.data;
}

export async function uploadTqQueryImage(input: {
  tqId: string;
  file: File;
  engineeringProjectId?: string;
}) {
  const session = await createTqQueryImageUploadSession(input);
  const named = new File([input.file], session.fileName, { type: session.mimeType || input.file.type });
  await putFileToSignedUpload(session, named);
  return completeTqQueryImageUpload({
    tqId: input.tqId,
    documentId: session.documentId,
    objectPath: session.objectPath,
    fileName: session.fileName,
    mimeType: session.mimeType,
    fileSize: input.file.size,
    engineeringProjectId: input.engineeringProjectId,
  });
}
