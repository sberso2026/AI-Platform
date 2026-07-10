import { NextResponse } from "next/server";
import { withEngineeringApi } from "@/lib/commerce/engineering-api";

export const GET = withEngineeringApi("issues", async ({ ctx, commerce }, request) => {
  const projectId = new URL(request.url).searchParams.get("projectId") ?? undefined;
  const data = await ctx.engineering.issues.list(commerce, ctx.tenantId, projectId);
  return NextResponse.json({ data });
});

export const POST = withEngineeringApi("issues", async ({ ctx, commerce }, request) => {
  const body = await request.json();
  if (body.action === "promote" && body.id) {
    const data = await ctx.engineering.issues.promoteToDecision(commerce, ctx.tenantId, body.id, ctx.userId);
    return NextResponse.json({ data }, { status: 201 });
  }
  const data = await ctx.engineering.issues.create(commerce, {
    tenantId: ctx.tenantId,
    workspaceId: ctx.workspaceId,
    title: body.title,
    description: body.description,
    issueType: body.issueType,
    category: body.category,
    impact: body.impact,
    projectId: body.projectId,
    assetId: body.assetId,
    disciplineId: body.disciplineId,
    priority: body.priority,
    createdBy: ctx.userId,
  });
  return NextResponse.json({ data }, { status: 201 });
});
