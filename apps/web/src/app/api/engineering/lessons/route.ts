import { NextResponse } from "next/server";
import { withEngineeringApi } from "@/lib/commerce/engineering-api";

export const GET = withEngineeringApi("lessons", async ({ ctx, commerce }, request) => {
  const projectId = new URL(request.url).searchParams.get("projectId") ?? undefined;
  const data = await ctx.engineering.lessons.list(commerce, ctx.tenantId, projectId);
  return NextResponse.json({ data });
});

export const POST = withEngineeringApi("lessons", async ({ ctx, commerce }, request) => {
  const body = await request.json();
  const data = await ctx.engineering.lessons.create(commerce, {
    tenantId: ctx.tenantId,
    workspaceId: ctx.workspaceId,
    title: body.title,
    description: body.description,
    lesson: body.lesson,
    recommendation: body.recommendation,
    rootCause: body.rootCause,
    category: body.category,
    lessonReferences: body.lessonReferences,
    derivedFromDecisionId: body.derivedFromDecisionId,
    projectId: body.projectId,
    assetId: body.assetId,
    disciplineId: body.disciplineId,
    priority: body.priority,
    createdBy: ctx.userId,
  });
  return NextResponse.json({ data }, { status: 201 });
});
