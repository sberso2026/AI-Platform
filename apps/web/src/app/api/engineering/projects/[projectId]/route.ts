import { NextResponse } from "next/server";
import { withEngineeringApiParams } from "@/lib/commerce/engineering-api";

export const GET = withEngineeringApiParams("projects", async ({ ctx, commerce }, _request, { projectId }) => {
  const [project, assets, documents] = await Promise.all([
    ctx.engineering.projects.get(commerce, ctx.tenantId, projectId),
    ctx.engineering.assets.list(commerce, ctx.tenantId, projectId),
    ctx.engineering.documents.list(commerce, ctx.tenantId, projectId),
  ]);
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ data: { project, assets, documents } });
});

export const PATCH = withEngineeringApiParams("projects", async ({ ctx, commerce }, request, { projectId }) => {
  const body = await request.json();
  const data = await ctx.engineering.projects.update(commerce, ctx.tenantId, projectId, body);
  return NextResponse.json({ data });
});
