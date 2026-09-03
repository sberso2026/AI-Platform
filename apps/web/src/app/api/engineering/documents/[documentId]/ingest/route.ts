import { NextResponse } from "next/server";
import { authorizeEngineeringSegment, withEngineeringApiParams } from "@/lib/commerce/engineering-api";
import { lifecycleErrorResponse } from "@/lib/lifecycle-api";
import { enqueueCanonicalDocumentIngestion } from "@/lib/project-intelligence/document-ingestion";

export const maxDuration = 300;

const OPERATOR_ROLES = new Set(["owner", "admin", "operator"]);

export const POST = withEngineeringApiParams(
  "documents",
  async ({ ctx, correlationId }, _request, { documentId }) => {
    if (!ctx.workspaceId) {
      return lifecycleErrorResponse("workspace_required", "Workspace required", 403, correlationId);
    }
    if (!OPERATOR_ROLES.has(ctx.roleSlug)) {
      return lifecycleErrorResponse("forbidden", "Re-index is limited to operators", 403, correlationId);
    }
    const readCommerce = await authorizeEngineeringSegment(ctx, "documents", "GET", correlationId);
    if (!readCommerce) {
      return lifecycleErrorResponse("forbidden", "Document is not readable in this workspace", 403, correlationId);
    }
    const document = await ctx.engineering.documents.get(readCommerce, ctx.tenantId, documentId);
    if (!document) {
      return lifecycleErrorResponse("not_found", "Document not found", 404, correlationId);
    }
    if (!document.file_path) {
      return lifecycleErrorResponse(
        "source_file_unavailable",
        "Attach a source file before indexing",
        422,
        correlationId,
      );
    }
    const enqueue = await enqueueCanonicalDocumentIngestion({
      tenantId: ctx.tenantId,
      workspaceId: ctx.workspaceId,
      documentId,
      engineeringProjectId: document.engineering_project_id,
      revision: document.revision ?? "A",
      mimeType: document.mime_type ?? "application/octet-stream",
      fileName: document.file_name ?? undefined,
      createdBy: ctx.userId,
      correlationId,
      reindex: true,
    });
    return NextResponse.json({ data: { enqueue, queued: true } });
  },
);
