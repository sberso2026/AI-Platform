import { NextResponse } from "next/server";
import { withEngineeringApiParams } from "@/lib/commerce/engineering-api";
import { lifecycleErrorResponse } from "@/lib/lifecycle-api";
import {
  DOCUMENT_BUCKET,
  documentStorageClient,
  isScopedDocumentPath,
} from "@/lib/engineering/document-storage";

export const GET = withEngineeringApiParams(
  "documents",
  async ({ ctx, commerce, correlationId }, _request, { documentId }) => {
    const document = await ctx.engineering.documents.get(commerce, ctx.tenantId, documentId);
    if (!document?.file_path) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }
    if (
      !ctx.workspaceId ||
      !isScopedDocumentPath(document.file_path, ctx.tenantId, ctx.workspaceId)
    ) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
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
    const { data, error } = await storage.storage
      .from(DOCUMENT_BUCKET)
      .createSignedUrl(document.file_path, 60 * 10);
    if (error || !data?.signedUrl) {
      return lifecycleErrorResponse(
        "document_storage_unavailable",
        "Unable to open stored document",
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
  async ({ correlationId }, request) => {
    const contentType = request.headers.get("content-type") ?? "";
    if (contentType.includes("multipart/form-data")) {
      return lifecycleErrorResponse(
        "document_direct_upload_required",
        "This file cannot be sent through the app server. Register or attach it with the upload-first document flow.",
        422,
        correlationId,
      );
    }
    return lifecycleErrorResponse(
      "document_direct_upload_required",
      "Request a signed upload session instead of posting the file to this route.",
      422,
      correlationId,
    );
  },
);
