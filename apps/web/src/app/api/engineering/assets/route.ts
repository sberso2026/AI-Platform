import { NextResponse } from "next/server";
import { withEngineeringApi } from "@/lib/commerce/engineering-api";

export const GET = withEngineeringApi("assets", async ({ ctx, commerce }, request) => {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId") ?? undefined;
  const data = await ctx.engineering.assets.list(commerce, ctx.tenantId, projectId);
  return NextResponse.json({ data });
});

export const POST = withEngineeringApi("assets", async ({ ctx, commerce }, request) => {
  const body = await request.json();
  const data = await ctx.engineering.assets.create(commerce, {
    tenantId: ctx.tenantId,
    workspaceId: ctx.workspaceId,
    engineeringProjectId: body.engineeringProjectId,
    assetTag: body.assetTag,
    assetName: body.assetName,
    assetTypeId: body.assetTypeId,
    disciplineId: body.disciplineId,
    parentAssetId: body.parentAssetId,
    location: body.location,
    system: body.system,
    subsystem: body.subsystem,
    criticality: body.criticality,
    status: body.status,
    metadata: body.metadata,
    createDigitalTwin: body.createDigitalTwin ?? true,
    createdBy: ctx.userId,
  });
  return NextResponse.json({ data }, { status: 201 });
});
