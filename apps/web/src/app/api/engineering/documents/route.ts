import { NextResponse } from "next/server";
import { withEngineeringApi } from "@/lib/commerce/engineering-api";
import { lifecycleErrorResponse } from "@/lib/lifecycle-api";
import { listEngineeringDocumentIngestionSummaries } from "@/lib/project-intelligence/document-ingestion";

export const GET = withEngineeringApi("documents", async ({ ctx, commerce }, request) => {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId") ?? undefined;
  const rows = await ctx.engineering.documents.list(commerce, ctx.tenantId, projectId);
  const summaries = ctx.workspaceId
    ? await listEngineeringDocumentIngestionSummaries({
        tenantId: ctx.tenantId,
        workspaceId: ctx.workspaceId,
        documents: rows.map((row) => ({ id: row.id, file_path: row.file_path })),
      })
    : new Map();
  const data = rows.map((row) => {
    const ingestion = summaries.get(row.id);
    return {
      ...row,
      source_status: row.file_path ? "Attached" : "None",
      ingestion_status: ingestion?.label ?? (row.file_path ? "Register only — source text not searchable" : "Register only"),
      ai_searchable: Boolean(ingestion?.aiSearchable),
      ai_searchable_label: ingestion?.aiSearchable ? "Yes" : "No",
    };
  });
  return NextResponse.json({ data });
});

export const POST = withEngineeringApi("documents", async ({ ctx, commerce, correlationId }, request) => {
  const body = await request.json();
  try {
    const data = await ctx.engineering.documents.create(commerce, {
      tenantId: ctx.tenantId,
      workspaceId: ctx.workspaceId,
      engineeringProjectId: body.engineeringProjectId,
      assetId: body.assetId,
      documentNumber: body.documentNumber,
      title: body.title,
      documentType: body.documentType,
      disciplineId: body.disciplineId,
      revision: body.revision,
      status: body.status,
      filePath: body.filePath,
      fileName: body.fileName,
      fileSize: body.fileSize,
      mimeType: body.mimeType,
      source: body.source,
      uploadedBy: ctx.userId,
      sourceChecksum: body.sourceChecksum,
    });
    return NextResponse.json({ data }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not register document";
    if (/already exists/i.test(message)) {
      return lifecycleErrorResponse("document_duplicate", message, 409, correlationId);
    }
    throw err;
  }
});
