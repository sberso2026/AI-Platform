import { NextResponse } from "next/server";
import { withEngineeringApi } from "@/lib/commerce/engineering-api";

export const GET = withEngineeringApi("configuration", async ({ ctx, commerce }, request) => {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  const compareLeft = url.searchParams.get("compareLeft");
  const compareRight = url.searchParams.get("compareRight");
  if (compareLeft && compareRight) {
    const data = await ctx.engineering.configuration.compare(
      commerce,
      ctx.tenantId,
      compareLeft,
      compareRight,
    );
    return NextResponse.json({ data });
  }
  if (id) {
    const data = await ctx.engineering.configuration.get(commerce, ctx.tenantId, id);
    return NextResponse.json({ data });
  }
  const projectId = url.searchParams.get("projectId") ?? undefined;
  const data = await ctx.engineering.configuration.list(commerce, ctx.tenantId, projectId);
  return NextResponse.json({ data });
});

export const POST = withEngineeringApi("configuration", async ({ ctx, commerce }, request) => {
  const body = await request.json();
  if (body.action === "add_item" && body.id && body.objectType && body.objectId) {
    const data = await ctx.engineering.configuration.addItem(commerce, ctx.tenantId, {
      baselineId: body.id,
      objectType: body.objectType,
      objectId: body.objectId,
      revisionRef: body.revisionRef,
      objectCodeSnapshot: body.objectCodeSnapshot,
      objectTitleSnapshot: body.objectTitleSnapshot,
      effectiveState: body.effectiveState,
      capturedBy: ctx.userId,
    });
    return NextResponse.json({ data }, { status: 201 });
  }
  if (body.action === "remove_item" && body.id && body.itemId) {
    await ctx.engineering.configuration.removeItem(commerce, ctx.tenantId, {
      baselineId: body.id,
      itemId: body.itemId,
      actorId: ctx.userId,
    });
    return NextResponse.json({ data: { ok: true } });
  }
  if (body.action === "freeze" && body.id) {
    const data = await ctx.engineering.configuration.freeze(commerce, ctx.tenantId, body.id, ctx.userId);
    return NextResponse.json({ data });
  }
  if (body.action === "supersede" && body.id && body.name) {
    const data = await ctx.engineering.configuration.supersede(commerce, ctx.tenantId, {
      priorBaselineId: body.id,
      name: body.name,
      baselineType: body.baselineType,
      copyItems: body.copyItems,
      createdBy: ctx.userId,
    });
    return NextResponse.json({ data }, { status: 201 });
  }
  const data = await ctx.engineering.configuration.create(commerce, {
    tenantId: ctx.tenantId,
    name: body.name,
    baselineType: body.baselineType,
    baselineCode: body.baselineCode,
    description: body.description,
    projectId: body.projectId,
    effectiveAt: body.effectiveAt,
    supersedesBaselineId: body.supersedesBaselineId,
    createdBy: ctx.userId,
  });
  return NextResponse.json({ data }, { status: 201 });
});
