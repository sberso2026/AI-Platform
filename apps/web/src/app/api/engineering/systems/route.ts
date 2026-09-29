import { NextResponse } from "next/server";
import { withEngineeringApi } from "@/lib/commerce/engineering-api";

export const GET = withEngineeringApi("systems", async ({ ctx, commerce }, request) => {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (id) {
    const data = await ctx.engineering.systems.get(commerce, ctx.tenantId, id);
    return NextResponse.json({ data });
  }
  const projectId = url.searchParams.get("projectId") ?? undefined;
  const parentId = url.searchParams.get("parentId");
  if (parentId) {
    const data = await ctx.engineering.systems.listChildren(commerce, ctx.tenantId, parentId);
    return NextResponse.json({ data });
  }
  const data = await ctx.engineering.systems.list(commerce, ctx.tenantId, projectId);
  return NextResponse.json({ data });
});

export const POST = withEngineeringApi("systems", async ({ ctx, commerce }, request) => {
  const body = await request.json();
  if (body.action === "set_parent" && body.id) {
    const data = await ctx.engineering.systems.setParent(
      commerce,
      ctx.tenantId,
      body.id,
      body.parentSystemId ?? null,
      ctx.userId,
    );
    return NextResponse.json({ data });
  }
  if (body.action === "link_asset" && body.id && body.assetId) {
    const data = await ctx.engineering.systems.linkAsset(commerce, ctx.tenantId, {
      systemId: body.id,
      assetId: body.assetId,
      relationship: body.relationship,
      createdBy: ctx.userId,
    });
    return NextResponse.json({ data }, { status: 201 });
  }
  if (body.action === "unlink_asset" && body.id && body.assetId) {
    await ctx.engineering.systems.unlinkAsset(commerce, ctx.tenantId, {
      systemId: body.id,
      assetId: body.assetId,
      relationship: body.relationship,
      actorId: ctx.userId,
    });
    return NextResponse.json({ data: { ok: true } });
  }
  const data = await ctx.engineering.systems.create(commerce, {
    tenantId: ctx.tenantId,
    name: body.name,
    systemCode: body.systemCode,
    description: body.description,
    status: body.status,
    criticality: body.criticality,
    ownerId: body.ownerId,
    projectId: body.projectId,
    parentSystemId: body.parentSystemId,
    createdBy: ctx.userId,
  });
  return NextResponse.json({ data }, { status: 201 });
});

export const PATCH = withEngineeringApi("systems", async ({ ctx, commerce }, request) => {
  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: "id required" }, { status: 422 });
  const data = await ctx.engineering.systems.update(
    commerce,
    ctx.tenantId,
    body.id,
    {
      name: body.name,
      description: body.description,
      status: body.status,
      criticality: body.criticality,
      ownerId: body.ownerId,
      projectId: body.projectId,
    },
    ctx.userId,
  );
  return NextResponse.json({ data });
});
