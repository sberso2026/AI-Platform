import { NextResponse } from "next/server";
import { withEngineeringApi } from "@/lib/commerce/engineering-api";

export const GET = withEngineeringApi("projects", async ({ ctx, commerce }) => {
  const data = await ctx.engineering.projects.list(commerce, ctx.tenantId);
  return NextResponse.json({ data });
});

export const POST = withEngineeringApi("projects", async ({ ctx, commerce }, request) => {
  const body = await request.json();
  const data = await ctx.engineering.projects.create(commerce, {
    tenantId: ctx.tenantId,
    workspaceId: ctx.workspaceId,
    projectCode: body.projectCode,
    projectName: body.projectName,
    clientName: body.clientName,
    siteName: body.siteName,
    location: body.location,
    industry: body.industry,
    projectType: body.projectType,
    projectPhase: body.projectPhase,
    status: body.status,
    startDate: body.startDate,
    endDate: body.endDate,
    metadata: body.metadata,
    createdBy: ctx.userId,
  });
  return NextResponse.json({ data }, { status: 201 });
});
