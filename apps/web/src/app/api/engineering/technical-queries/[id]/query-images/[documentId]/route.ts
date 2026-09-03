import { NextResponse } from "next/server";
import { withEngineeringApiParams } from "@/lib/commerce/engineering-api";
import { lifecycleErrorResponse } from "@/lib/lifecycle-api";
import {
  DOCUMENT_BUCKET,
  documentStorageClient,
  isScopedDocumentPath,
} from "@/lib/engineering/document-storage";
import { extractTqQueryImageIds } from "@rtb/engineering-os";

export const GET = withEngineeringApiParams(
  "technical-queries",
  async ({ ctx, commerce, correlationId }, _request, { id, documentId }) => {
    const loaded = await ctx.engineering.technicalQueries.getPresented(commerce, ctx.tenantId, id);
    if (!loaded) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const query = loaded.query as Record<string, unknown>;
    const inHtml = extractTqQueryImageIds(String(query.question ?? "")).includes(documentId);
    const linked = (loaded.links as Array<Record<string, unknown>> | undefined)?.some(
      (link) =>
        String(link.relationship ?? "") === "query_image" &&
        (String(link.to_id ?? "") === documentId || String(link.from_id ?? "") === documentId),
    );
    if (!inHtml && !linked) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const document = await ctx.engineering.documents.get(commerce, ctx.tenantId, documentId);
    if (!document?.file_path) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (!ctx.workspaceId || !isScopedDocumentPath(document.file_path, ctx.tenantId, ctx.workspaceId)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
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
    const downloaded = await storage.storage.from(DOCUMENT_BUCKET).download(document.file_path);
    if (downloaded.error || !downloaded.data) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const bytes = Buffer.from(await downloaded.data.arrayBuffer());
    return new NextResponse(bytes, {
      headers: {
        "Content-Type": document.mime_type || "application/octet-stream",
        "Content-Disposition": `inline; filename="${document.file_name ?? "query-image"}"`,
        "Cache-Control": "private, max-age=60",
      },
    });
  },
);
