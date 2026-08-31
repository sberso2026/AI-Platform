import { NextResponse } from "next/server";
import { withEngineeringApi } from "@/lib/commerce/engineering-api";

export const GET = withEngineeringApi("risks", async ({ ctx, commerce }, request) => {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId") ?? undefined;
  if (searchParams.get("view") === "matrix") {
    const data = await ctx.engineering.risks.matrix(commerce, ctx.tenantId);
    return NextResponse.json({ data });
  }
  const data = await ctx.engineering.risks.list(commerce, ctx.tenantId, projectId);
  return NextResponse.json({ data });
});

export const POST = withEngineeringApi("risks", async ({ ctx, commerce }, request) => {
  const body = await request.json();
  const data = await ctx.engineering.risks.create(commerce, {
    tenantId: ctx.tenantId,
    workspaceId: ctx.workspaceId,
    title: body.title,
    description: body.description,
    category: body.category,
    probability: body.probability,
    consequence: body.consequence,
    mitigation: body.mitigation,
    controls: body.controls,
    projectId: body.projectId,
    assetId: body.assetId,
    disciplineId: body.disciplineId,
    priority: body.priority,
    createdBy: ctx.userId,
  });
  return NextResponse.json({ data }, { status: 201 });
});

export const PATCH = withEngineeringApi("risks", async ({ ctx, commerce }, request) => {
  const body = await request.json();
  if (!body.id) {
    return NextResponse.json({ error: "id required" }, { status: 422 });
  }
  const data = await ctx.engineering.risks.update(commerce, ctx.tenantId, body.id, {
    status: body.status,
    mitigation: body.mitigation,
    probability: body.probability,
    consequence: body.consequence,
  });
  return NextResponse.json({ data });
});
