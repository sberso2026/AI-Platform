import { NextResponse } from "next/server";
import { withEngineeringApi } from "@/lib/commerce/engineering-api";

export const GET = withEngineeringApi("interfaces", async ({ ctx, commerce }, request) => {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (id) {
    const data = await ctx.engineering.interfaces.get(commerce, ctx.tenantId, id);
    return NextResponse.json({ data });
  }
  const projectId = url.searchParams.get("projectId") ?? undefined;
  const data = await ctx.engineering.interfaces.list(commerce, ctx.tenantId, projectId);
  return NextResponse.json({ data });
});

export const POST = withEngineeringApi("interfaces", async ({ ctx, commerce }, request) => {
  const body = await request.json();
  if (body.action === "add_endpoint" && body.id && body.objectType && body.objectId) {
    const data = await ctx.engineering.interfaces.addEndpoint(commerce, ctx.tenantId, {
      interfaceId: body.id,
      objectType: body.objectType,
      objectId: body.objectId,
      role: body.role,
      direction: body.direction,
      createdBy: ctx.userId,
    });
    return NextResponse.json({ data }, { status: 201 });
  }
  if (body.action === "remove_endpoint" && body.id && body.objectType && body.objectId) {
    await ctx.engineering.interfaces.removeEndpoint(commerce, ctx.tenantId, {
      interfaceId: body.id,
      objectType: body.objectType,
      objectId: body.objectId,
      actorId: ctx.userId,
    });
    return NextResponse.json({ data: { ok: true } });
  }
  if (body.action === "set_status" && body.id && body.status) {
    const data = await ctx.engineering.interfaces.update(
      commerce,
      ctx.tenantId,
      body.id,
      { status: body.status },
      ctx.userId,
    );
    return NextResponse.json({ data });
  }
  const data = await ctx.engineering.interfaces.create(commerce, {
    tenantId: ctx.tenantId,
    name: body.name,
    interfaceType: body.interfaceType,
    interfaceCode: body.interfaceCode,
    description: body.description,
    purpose: body.purpose,
    directionality: body.directionality,
    status: body.status,
    criticality: body.criticality,
    ownerId: body.ownerId,
    projectId: body.projectId,
    createdBy: ctx.userId,
  });
  return NextResponse.json({ data }, { status: 201 });
});

export const PATCH = withEngineeringApi("interfaces", async ({ ctx, commerce }, request) => {
  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: "id required" }, { status: 422 });
  const data = await ctx.engineering.interfaces.update(
    commerce,
    ctx.tenantId,
    body.id,
    {
      name: body.name,
      description: body.description,
      purpose: body.purpose,
      interfaceType: body.interfaceType,
      directionality: body.directionality,
      status: body.status,
      criticality: body.criticality,
      ownerId: body.ownerId,
    },
    ctx.userId,
  );
  return NextResponse.json({ data });
});
