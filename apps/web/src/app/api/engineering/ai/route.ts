import { NextResponse } from "next/server";
import { withEngineeringApi } from "@/lib/commerce/engineering-api";

export const GET = withEngineeringApi("ai", async ({ ctx, commerce }) => {
  const data = await ctx.engineering.dashboard.getDashboard(commerce, ctx.tenantId);
  return NextResponse.json({ data });
});

export const POST = withEngineeringApi("ai", async ({ ctx, commerce }, request) => {
  const body = await request.json();
  const data = await ctx.engineering.ai.run(commerce, {
    tenantId: ctx.tenantId,
    workspaceId: ctx.workspaceId,
    userId: ctx.userId,
    message: body.message,
    projectId: body.projectId,
    assetId: body.assetId,
    documentId: body.documentId,
    disciplineId: body.disciplineId,
    agentSlug: body.agentSlug,
    objectType: body.objectType,
    objectId: body.objectId,
    scope: body.scope,
    sessionId: body.sessionId,
  });
  return NextResponse.json({ data }, { status: 201 });
});
