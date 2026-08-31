import { NextResponse } from "next/server";
import { withEngineeringApiParams } from "@/lib/commerce/engineering-api";
import { validateDocumentStoragePolicy } from "@rtb/project-intelligence";
import { lifecycleErrorResponse } from "@/lib/lifecycle-api";
import { createServiceClient } from "@/lib/supabase/service";

const DOCUMENT_BUCKET = "engineering-documents";

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 180) || "document.bin";
}

function inferMimeType(file: File): string {
  if (file.type) return file.type;
  const lower = file.name.toLowerCase();
  if (lower.endsWith(".txt")) return "text/plain";
  if (lower.endsWith(".pdf")) return "application/pdf";
  if (lower.endsWith(".docx")) {
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  }
  return "application/octet-stream";
}

async function storageClient() {
  try {
    return createServiceClient();
  } catch {
    return null;
  }
}

async function ensurePrivateBucket(
  supabase: ReturnType<typeof createServiceClient>,
) {
  const existing = await supabase.storage.getBucket(DOCUMENT_BUCKET);
  if (!existing.error) return;
  const created = await supabase.storage.createBucket(DOCUMENT_BUCKET, { public: false });
  if (created.error && !/already exists/i.test(created.error.message ?? "")) {
    throw new Error(created.error.message ?? "Document storage bucket is not available");
  }
}

export const GET = withEngineeringApiParams(
  "documents",
  async ({ ctx, commerce, correlationId }, _request, { documentId }) => {
    const document = await ctx.engineering.documents.get(commerce, ctx.tenantId, documentId);
    if (!document?.file_path) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }
    const allowedPrefix = `${ctx.tenantId}/${ctx.workspaceId ?? document.workspace_id ?? ""}/`;
    if (!document.file_path.startsWith(allowedPrefix)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }
    const storage = await storageClient();
    if (!storage) {
      return lifecycleErrorResponse(
        "document_storage_unavailable",
        "Document storage is not configured",
        503,
        correlationId,
      );
    }
    const { data, error } = await storage.storage
      .from(DOCUMENT_BUCKET)
      .createSignedUrl(document.file_path, 60 * 10);
    if (error || !data?.signedUrl) {
      return lifecycleErrorResponse(
        "document_storage_unavailable",
        error?.message ?? "Unable to open stored document",
        503,
        correlationId,
      );
    }
    return NextResponse.json({
      data: {
        url: data.signedUrl,
        fileName: document.file_name,
        mimeType: document.mime_type,
        filePath: document.file_path,
      },
    });
  },
);

export const POST = withEngineeringApiParams(
  "documents",
  async ({ ctx, commerce, correlationId }, request, { documentId }) => {
    if (!ctx.workspaceId) {
      return NextResponse.json({ error: "Workspace required" }, { status: 403 });
    }
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "file required" }, { status: 422 });
    }

    const mimeType = inferMimeType(file);
    validateDocumentStoragePolicy({
      mimeType,
      fileName: file.name,
      sizeBytes: file.size,
    });

    const storage = await storageClient();
    if (!storage) {
      return lifecycleErrorResponse(
        "document_storage_unavailable",
        "Document storage is not configured",
        503,
        correlationId,
      );
    }

    try {
      await ensurePrivateBucket(storage);
    } catch (err) {
      return lifecycleErrorResponse(
        "document_storage_unavailable",
        err instanceof Error ? err.message : "Document storage bucket is not available",
        503,
        correlationId,
      );
    }

    const revision = "A";
    const fileName = sanitizeFileName(file.name);
    const objectPath = `${ctx.tenantId}/${ctx.workspaceId}/${documentId}/${revision}/${fileName}`;
    const bytes = Buffer.from(await file.arrayBuffer());
    const upload = await storage.storage.from(DOCUMENT_BUCKET).upload(objectPath, bytes, {
      contentType: mimeType,
      upsert: true,
    });
    if (upload.error) {
      return lifecycleErrorResponse(
        "document_storage_unavailable",
        upload.error.message,
        503,
        correlationId,
      );
    }

    const data = await ctx.engineering.documents.attachFile(commerce, ctx.tenantId, documentId, {
      filePath: objectPath,
      fileName: file.name,
      fileSize: file.size,
      mimeType,
      uploadedBy: ctx.userId,
      revision,
    });
    return NextResponse.json({ data });
  },
);
