import { NextResponse } from "next/server";
import { withEngineeringApi } from "@/lib/commerce/engineering-api";
import { lifecycleErrorResponse } from "@/lib/lifecycle-api";
import { createDocumentSignedUpload } from "@/lib/engineering/document-storage";
import {
  inferTqQueryImageMime,
  validateTqQueryImagePolicy,
  TQ_QUERY_IMAGE_MAX_BYTES,
} from "@rtb/engineering-os";

export const POST = withEngineeringApi("technical-queries", async ({ ctx, commerce, correlationId }, request) => {
  if (!ctx.workspaceId) {
    return lifecycleErrorResponse("workspace_required", "Workspace required", 403, correlationId);
  }
  const body = (await request.json()) as {
    tqId?: string;
    fileName?: string;
    mimeType?: string;
    sizeBytes?: number;
  };
  const tqId = String(body.tqId ?? "").trim();
  if (!tqId) {
    return lifecycleErrorResponse("invalid_request", "A technical query is required before inserting an image", 422, correlationId);
  }
  const query = await ctx.engineering.technicalQueries.getForUpdate(commerce, ctx.tenantId, tqId);
  const privileged = ctx.roleSlug === "owner" || ctx.roleSlug === "admin" || ctx.roleSlug === "operator";
  const isInitiator = query.requester_id === ctx.userId || query.created_by === ctx.userId;
  if (String(query.status ?? "") !== "draft" || (!privileged && !isInitiator)) {
    return lifecycleErrorResponse("forbidden", "Query images can only be added while the technical query is a draft", 403, correlationId);
  }
  const fileName = String(body.fileName ?? "").trim();
  if (!fileName) {
    return lifecycleErrorResponse("invalid_request", "File name is required", 422, correlationId);
  }
  let mimeType = inferTqQueryImageMime(fileName, body.mimeType);
  try {
    mimeType = validateTqQueryImagePolicy({
      mimeType,
      fileName,
      sizeBytes: Number(body.sizeBytes ?? 0),
    }).mimeType;
  } catch (err) {
    return lifecycleErrorResponse(
      "invalid_request",
      err instanceof Error ? err.message : "This image type is not supported. Use PNG, JPEG, or WEBP.",
      422,
      correlationId,
    );
  }

  try {
    const session = await createDocumentSignedUpload({
      tenantId: ctx.tenantId,
      workspaceId: ctx.workspaceId,
      fileName,
    });
    if (!session) {
      return lifecycleErrorResponse(
        "document_storage_unavailable",
        "Document storage is not configured",
        503,
        correlationId,
      );
    }
    return NextResponse.json({
      data: {
        ...session,
        mimeType,
        fileName,
        maxBytes: TQ_QUERY_IMAGE_MAX_BYTES,
        tqId,
      },
    });
  } catch {
    return lifecycleErrorResponse(
      "document_storage_unavailable",
      "Could not store the file. Try again or contact support.",
      503,
      correlationId,
    );
  }
});
