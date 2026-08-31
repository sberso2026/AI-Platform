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
    title: body.title ?? body.question,
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

export const PATCH = withEngineeringApi("technical-queries", async ({ ctx, commerce }, request) => {
  const body = await request.json();
  if (!body.id || !body.response) {
    return NextResponse.json({ error: "id and response required" }, { status: 422 });
  }
  const data = await ctx.engineering.technicalQueries.respond(commerce, ctx.tenantId, body.id, {
    response: body.response,
    status: body.status,
    responderId: body.responderId ?? ctx.userId,
  });
  return NextResponse.json({ data });
});
