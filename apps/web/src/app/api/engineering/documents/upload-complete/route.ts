import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { withEngineeringApi } from "@/lib/commerce/engineering-api";
import { lifecycleErrorResponse } from "@/lib/lifecycle-api";
import {
  DOCUMENT_BUCKET,
  documentStorageClient,
  documentObjectExists,
  documentObjectPath,
  isScopedDocumentPath,
} from "@/lib/engineering/document-storage";
import { validateDocumentStoragePolicy } from "@rtb/project-intelligence";
import { normalizeEngineeringDocumentType, normalizeEngineeringRevision } from "@rtb/engineering-os";
import { enqueueCanonicalDocumentIngestion } from "@/lib/project-intelligence/document-ingestion";

export const maxDuration = 60;

async function sha256OfStoredObject(
  storage: NonNullable<Awaited<ReturnType<typeof documentStorageClient>>>,
  objectPath: string,
): Promise<string | null> {
  const downloaded = await storage.storage.from(DOCUMENT_BUCKET).download(objectPath);
  if (downloaded.error || !downloaded.data) return null;
  const bytes = Buffer.from(await downloaded.data.arrayBuffer());
  return createHash("sha256").update(bytes).digest("hex");
}

async function relocateToCanonicalPath(
  storage: NonNullable<Awaited<ReturnType<typeof documentStorageClient>>>,
  fromPath: string,
  toPath: string,
): Promise<string> {
  if (fromPath === toPath) return toPath;
  const copied = await storage.storage.from(DOCUMENT_BUCKET).copy(fromPath, toPath);
  if (copied.error && !/already exists|duplicate/i.test(copied.error.message ?? "")) {
    return fromPath;
  }
  return toPath;
}

export const POST = withEngineeringApi("documents", async ({ ctx, commerce, correlationId }, request) => {
  if (!ctx.workspaceId) {
    return lifecycleErrorResponse("workspace_required", "Workspace required", 403, correlationId);
  }
  const body = (await request.json()) as {
    documentId?: string;
    objectPath?: string;
    fileName?: string;
    mimeType?: string;
    fileSize?: number;
    engineeringProjectId?: string;
    documentNumber?: string;
    title?: string;
    documentType?: string;
    revision?: string;
    attachOnly?: boolean;
  };
  const documentId = String(body.documentId ?? "");
  const objectPath = String(body.objectPath ?? "");
  const fileName = String(body.fileName ?? "");
  if (!documentId || !objectPath || !fileName) {
    return lifecycleErrorResponse("invalid_request", "Upload session is incomplete", 422, correlationId);
  }
  if (!isScopedDocumentPath(objectPath, ctx.tenantId, ctx.workspaceId, documentId)) {
    return lifecycleErrorResponse("forbidden", "File is outside this workspace", 403, correlationId);
  }

  const mimeType = String(body.mimeType ?? "application/octet-stream");
  const fileSize = Number(body.fileSize ?? 0);
  validateDocumentStoragePolicy({ mimeType, fileName, sizeBytes: fileSize });

  const storage = await documentStorageClient();
  if (!storage) {
    return lifecycleErrorResponse(
      "document_storage_unavailable",
      "Document storage is not configured",
      503,
      correlationId,
    );
  }
  const exists = await documentObjectExists(storage, objectPath);
  if (!exists) {
    return lifecycleErrorResponse(
      "document_storage_unavailable",
      "Could not store the file. Try again or contact support.",
      503,
      correlationId,
    );
  }

  const documentType = normalizeEngineeringDocumentType(body.documentType) ?? body.documentType;
  const revision = normalizeEngineeringRevision(body.revision || "A").revision;
  const sourceChecksum = await sha256OfStoredObject(storage, objectPath);

  try {
    if (body.attachOnly) {
      const data = await ctx.engineering.documents.attachFile(commerce, ctx.tenantId, documentId, {
        filePath: objectPath,
        fileName,
        fileSize,
        mimeType,
        uploadedBy: ctx.userId,
        revision,
        sourceChecksum: sourceChecksum ?? undefined,
      });
      await enqueueCanonicalDocumentIngestion({
        tenantId: ctx.tenantId,
        workspaceId: ctx.workspaceId,
        documentId: String(data.id ?? documentId),
        engineeringProjectId: data.engineering_project_id,
        revision: data.revision ?? revision,
        mimeType,
        fileName,
        createdBy: ctx.userId,
        correlationId,
      }).catch((error) => {
        console.error("document ingestion enqueue failed", error);
      });
      return NextResponse.json({ data });
    }
    const data = await ctx.engineering.documents.create(commerce, {
      id: documentId,
      tenantId: ctx.tenantId,
      workspaceId: ctx.workspaceId,
      engineeringProjectId: body.engineeringProjectId || undefined,
      documentNumber: body.documentNumber,
      title: body.title,
      documentType: documentType ?? undefined,
      revision,
      filePath: objectPath,
      fileName,
      fileSize,
      mimeType,
      source: "upload",
      uploadedBy: ctx.userId,
      sourceChecksum: sourceChecksum ?? undefined,
    });
    let filePath = data.file_path ?? objectPath;
    if (String(data.id) !== documentId) {
      const canonicalPath = documentObjectPath({
        tenantId: ctx.tenantId,
        workspaceId: ctx.workspaceId,
        documentId: String(data.id),
        revision: data.revision ?? revision,
        fileName,
      });
      filePath = await relocateToCanonicalPath(storage, objectPath, canonicalPath);
      if (filePath !== objectPath) {
        await ctx.engineering.documents.attachFile(commerce, ctx.tenantId, String(data.id), {
          filePath,
          fileName,
          fileSize,
          mimeType,
          uploadedBy: ctx.userId,
          revision: data.revision ?? revision,
          sourceChecksum: sourceChecksum ?? undefined,
        });
      }
    }
    await enqueueCanonicalDocumentIngestion({
      tenantId: ctx.tenantId,
      workspaceId: ctx.workspaceId,
      documentId: String(data.id ?? documentId),
      engineeringProjectId: data.engineering_project_id,
      revision: data.revision ?? revision,
      mimeType,
      fileName,
      createdBy: ctx.userId,
      correlationId,
    }).catch((error) => {
      console.error("document ingestion enqueue failed", error);
    });
    const reused = String(data.id) !== documentId;
    return NextResponse.json({ data: { ...data, file_path: filePath } }, { status: reused ? 200 : 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not register document";
    if (/already exists/i.test(message)) {
      return lifecycleErrorResponse("document_duplicate", message, 409, correlationId);
    }
    if (/project not in workspace/i.test(message)) {
      return lifecycleErrorResponse("forbidden", "Project is outside this workspace", 403, correlationId);
    }
    throw err;
  }
});
