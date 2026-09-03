import { NextResponse } from "next/server";
import { withEngineeringApiParams } from "@/lib/commerce/engineering-api";
import { getEngineeringDocumentIngestionPresentation } from "@/lib/project-intelligence/document-ingestion";
import { CommerceDomainError } from "@rtb/platform-commerce";

export const GET = withEngineeringApiParams("documents", async ({ ctx, commerce }, _request, { documentId }) => {
  const data = await ctx.engineering.documents.get(commerce, ctx.tenantId, documentId);
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const ingestion = ctx.workspaceId
    ? await getEngineeringDocumentIngestionPresentation({
        tenantId: ctx.tenantId,
        workspaceId: ctx.workspaceId,
        documentId,
        hasSourceFile: Boolean(data.file_path),
      }).catch(() => null)
    : null;
  return NextResponse.json({
    data: {
      ...data,
      presentation: {
        projectLabel: null,
        knowledgeLinkStatus: data.knowledge_node_id ? "linked" : "not_linked",
        knowledgeNodeTitle: data.knowledge_node_id ? `${data.document_number} — ${data.title}` : null,
        ingestion,
      },
    },
  });
});

export const PATCH = withEngineeringApiParams("documents", async ({ ctx, commerce }, request, { documentId }) => {
  const body = (await request.json()) as {
    action?: string;
    documentNumber?: string;
    title?: string;
    revision?: string;
    documentType?: string;
    numberSource?: string;
  };
  const action = body.action === "propose" ? "propose" : body.action === "confirm" ? "confirm" : null;
  if (!action) {
    return NextResponse.json({ error: "Metadata review action must be propose or confirm" }, { status: 422 });
  }
  try {
    const data = await ctx.engineering.documents.reviewMetadata(commerce, ctx.tenantId, documentId, {
      action,
      documentNumber: body.documentNumber,
      title: body.title,
      revision: body.revision,
      documentType: body.documentType,
      numberSource: body.numberSource,
      reviewedBy: ctx.userId,
    });
    return NextResponse.json({ data });
  } catch (error) {
    if (error instanceof CommerceDomainError) throw error;
    const message = error instanceof Error ? error.message : "Failed to review metadata";
    const status = /already exists/i.test(message) ? 409 : /not found/i.test(message) ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
});
