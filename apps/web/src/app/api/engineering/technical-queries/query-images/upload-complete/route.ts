import { NextResponse } from "next/server";
import { withEngineeringApi } from "@/lib/commerce/engineering-api";
import { lifecycleErrorResponse } from "@/lib/lifecycle-api";
import {
  DOCUMENT_BUCKET,
  documentStorageClient,
  documentObjectExists,
  isScopedDocumentPath,
} from "@/lib/engineering/document-storage";
import {
  detectTqQueryImageMimeFromBytes,
  inferTqQueryImageMime,
  validateTqQueryImagePolicy,
} from "@rtb/engineering-os";

export const maxDuration = 60;

export const POST = withEngineeringApi("technical-queries", async ({ ctx, commerce, correlationId }, request) => {
  if (!ctx.workspaceId) {
    return lifecycleErrorResponse("workspace_required", "Workspace required", 403, correlationId);
  }
  const body = (await request.json()) as {
    tqId?: string;
    documentId?: string;
    objectPath?: string;
    fileName?: string;
    mimeType?: string;
    fileSize?: number;
    engineeringProjectId?: string;
  };
  const tqId = String(body.tqId ?? "");
  const documentId = String(body.documentId ?? "");
  const objectPath = String(body.objectPath ?? "");
  const fileName = String(body.fileName ?? "");
  if (!tqId || !documentId || !objectPath || !fileName) {
    return lifecycleErrorResponse("invalid_request", "Upload session is incomplete", 422, correlationId);
  }
  if (!isScopedDocumentPath(objectPath, ctx.tenantId, ctx.workspaceId, documentId)) {
    return lifecycleErrorResponse("forbidden", "File is outside this workspace", 403, correlationId);
  }

  const loaded = await ctx.engineering.technicalQueries.get(commerce, ctx.tenantId, tqId);
  if (!loaded) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const query = loaded.query as Record<string, unknown>;
  const privileged = ctx.roleSlug === "owner" || ctx.roleSlug === "admin" || ctx.roleSlug === "operator";
  const isInitiator = query.requester_id === ctx.userId || query.created_by === ctx.userId;
  if (String(query.status ?? "") !== "draft" || (!privileged && !isInitiator)) {
    return lifecycleErrorResponse("forbidden", "Query images can only be added while the technical query is a draft", 403, correlationId);
  }

  let mimeType = inferTqQueryImageMime(fileName, body.mimeType);
  try {
    mimeType = validateTqQueryImagePolicy({
      mimeType,
      fileName,
      sizeBytes: Number(body.fileSize ?? 0),
    }).mimeType;
  } catch (err) {
    return lifecycleErrorResponse(
      "invalid_request",
      err instanceof Error ? err.message : "This image type is not supported. Use PNG, JPEG, or WEBP.",
      422,
      correlationId,
    );
  }

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

  const downloaded = await storage.storage.from(DOCUMENT_BUCKET).download(objectPath);
  if (downloaded.error || !downloaded.data) {
    return lifecycleErrorResponse("document_storage_unavailable", "Could not read the stored image", 503, correlationId);
  }
  const bytes = new Uint8Array(await downloaded.data.arrayBuffer());
  const detected = detectTqQueryImageMimeFromBytes(bytes);
  if (!detected || detected !== mimeType) {
    return lifecycleErrorResponse(
      "invalid_request",
      "This image type is not supported. Use PNG, JPEG, or WEBP.",
      422,
      correlationId,
    );
  }

  try {
    const data = await ctx.engineering.documents.create(commerce, {
      id: documentId,
      tenantId: ctx.tenantId,
      workspaceId: ctx.workspaceId,
      engineeringProjectId: body.engineeringProjectId || (typeof query.project_id === "string" ? query.project_id : undefined),
      documentNumber: `TQ-QI-${documentId.slice(0, 8)}`,
      title: fileName,
      documentType: "technical_query_attachment",
      revision: "A",
      filePath: objectPath,
      fileName,
      fileSize: Number(body.fileSize ?? bytes.byteLength),
      mimeType,
      source: "upload",
      uploadedBy: ctx.userId,
      metadata: {
        tq_id: tqId,
        evidence_kind: "query_image",
        original_file_name: fileName,
      },
    });
    const linkedId = String(data.id ?? documentId);
    await ctx.engineering.technicalQueries.applyAction(commerce, ctx.tenantId, tqId, {
      action: "link",
      actorUserId: ctx.userId,
      actorRole: ctx.roleSlug,
      toType: "document",
      toId: linkedId,
      relationship: "query_image",
    });
    return NextResponse.json({
      data: {
        documentId: linkedId,
        tqId,
        fileName,
        mimeType,
        src: `/api/engineering/technical-queries/${tqId}/query-images/${linkedId}`,
      },
    }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not register query image";
    if (/already exists/i.test(message)) {
      return lifecycleErrorResponse("document_duplicate", message, 409, correlationId);
    }
    throw err;
  }
});
