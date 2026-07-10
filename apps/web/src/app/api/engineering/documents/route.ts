import { NextResponse } from "next/server";
import { withEngineeringApi } from "@/lib/commerce/engineering-api";

export const GET = withEngineeringApi("documents", async ({ ctx, commerce }, request) => {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId") ?? undefined;
  const data = await ctx.engineering.documents.list(commerce, ctx.tenantId, projectId);
  return NextResponse.json({ data });
});

export const POST = withEngineeringApi("documents", async ({ ctx, commerce }, request) => {
  const body = await request.json();
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
  });
  return NextResponse.json({ data }, { status: 201 });
});
