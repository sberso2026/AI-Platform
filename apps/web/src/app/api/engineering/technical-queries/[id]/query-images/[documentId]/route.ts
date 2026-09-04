import { NextResponse } from "next/server";
import { extractTqQueryImageIds } from "@rtb/engineering-os";
import { withEngineeringApiParams } from "@/lib/commerce/engineering-api";
import { createServiceClient } from "@/lib/supabase/service";

const DOCUMENT_BUCKET = "engineering-documents";

function isScopedPath(path: string, tenantId: string, workspaceId: string): boolean {
  return path.startsWith(`${tenantId}/${workspaceId}/`) && !path.includes("..");
}

export const GET = withEngineeringApiParams(
  "technical-queries",
  async ({ ctx, commerce }, _request, { id, documentId }) => {
    const loaded = await ctx.engineering.technicalQueries.get(commerce, ctx.tenantId, id);
    if (!loaded?.query) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const query = loaded.query as Record<string, unknown>;
    const inHtml = extractTqQueryImageIds(String(query.question ?? "")).includes(documentId);
    const linked = String(query.document_id ?? "") === documentId;
    if (!inHtml && !linked) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (!ctx.workspaceId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    let storage;
    try {
      storage = createServiceClient();
    } catch {
      return NextResponse.json({ error: "Document storage is not configured" }, { status: 503 });
    }

    const { data, error } = await storage
      .from("engineering_documents")
      .select("file_path, file_name, mime_type, workspace_id, tenant_id")
      .eq("tenant_id", ctx.tenantId)
      .eq("id", documentId)
      .maybeSingle();
    const document = data as {
      file_path?: string | null;
      file_name?: string | null;
      mime_type?: string | null;
      workspace_id?: string | null;
      tenant_id?: string | null;
    } | null;
    if (error || !document?.file_path || document.workspace_id !== ctx.workspaceId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (!isScopedPath(document.file_path, ctx.tenantId, ctx.workspaceId)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const downloaded = await storage.storage.from(DOCUMENT_BUCKET).download(document.file_path);
    if (downloaded.error || !downloaded.data) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const bytes = Buffer.from(await downloaded.data.arrayBuffer());
    const fileName = (document.file_name ?? "query-image").replace(/[\r\n"]/g, "");
    return new NextResponse(bytes, {
      headers: {
        "Content-Type": document.mime_type || "application/octet-stream",
        "Content-Disposition": `inline; filename="${fileName}"`,
        "Cache-Control": "private, max-age=60",
      },
    });
  },
);
