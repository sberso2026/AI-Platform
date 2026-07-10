import { NextResponse } from "next/server";
import { withEngineeringApi } from "@/lib/commerce/engineering-api";

export const GET = withEngineeringApi("actions", async ({ ctx, commerce }, request) => {
  const projectId = new URL(request.url).searchParams.get("projectId") ?? undefined;
  const data = await ctx.engineering.actions.list(commerce, ctx.tenantId, projectId);
  return NextResponse.json({ data });
});

export const POST = withEngineeringApi("actions", async ({ ctx, commerce }, request) => {
  const body = await request.json();
  const data = await ctx.engineering.actions.create(commerce, {
    tenantId: ctx.tenantId,
    workspaceId: ctx.workspaceId,
    title: body.title,
    description: body.description,
    projectId: body.projectId,
    assetId: body.assetId,
    disciplineId: body.disciplineId,
    priority: body.priority,
    originatingObjectType: body.originatingObjectType,
    originatingObjectId: body.originatingObjectId,
    dueDate: body.dueDate,
    createdBy: ctx.userId,
  });
  return NextResponse.json({ data }, { status: 201 });
});
