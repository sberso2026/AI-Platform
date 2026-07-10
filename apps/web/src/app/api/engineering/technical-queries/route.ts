import { NextResponse } from "next/server";
import { withEngineeringApi } from "@/lib/commerce/engineering-api";

export const GET = withEngineeringApi("technical-queries", async ({ ctx, commerce }, request) => {
  const projectId = new URL(request.url).searchParams.get("projectId") ?? undefined;
  const data = await ctx.engineering.technicalQueries.list(commerce, ctx.tenantId, projectId);
  return NextResponse.json({ data });
});

export const POST = withEngineeringApi("technical-queries", async ({ ctx, commerce }, request) => {
  const body = await request.json();
  const data = await ctx.engineering.technicalQueries.create(commerce, {
    tenantId: ctx.tenantId,
    workspaceId: ctx.workspaceId,
    title: body.title,
    question: body.question,
    description: body.description,
    requesterId: body.requesterId ?? ctx.userId,
    responderId: body.responderId,
    documentId: body.documentId,
    responseDue: body.responseDue,
    projectId: body.projectId,
    assetId: body.assetId,
    disciplineId: body.disciplineId,
    priority: body.priority,
    dueDate: body.dueDate,
    createdBy: ctx.userId,
  });
  return NextResponse.json({ data }, { status: 201 });
});
