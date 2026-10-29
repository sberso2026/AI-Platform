import { NextResponse } from "next/server";
import { withEngineeringApi } from "@/lib/commerce/engineering-api";

export const GET = withEngineeringApi("impacts", async ({ ctx, commerce }, request) => {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (id) {
    const data = await ctx.engineering.impacts.get(commerce, ctx.tenantId, id);
    return NextResponse.json({ data });
  }
  const changeId = url.searchParams.get("changeId");
  if (changeId) {
    const data = await ctx.engineering.impacts.discoverCandidates(commerce, ctx.tenantId, changeId);
    return NextResponse.json({ data });
  }
  const projectId = url.searchParams.get("projectId") ?? undefined;
  const data = await ctx.engineering.impacts.list(commerce, ctx.tenantId, projectId);
  return NextResponse.json({ data });
});

export const POST = withEngineeringApi("impacts", async ({ ctx, commerce }, request) => {
  const body = await request.json();
  if (body.action === "confirm" && body.id) {
    const data = await ctx.engineering.impacts.confirm(commerce, ctx.tenantId, body.id, ctx.userId);
    return NextResponse.json({ data });
  }
  if (body.action === "reject" && body.id) {
    const data = await ctx.engineering.impacts.reject(commerce, ctx.tenantId, body.id, ctx.userId);
    return NextResponse.json({ data });
  }
  if (body.action === "link_cause" && body.id && body.changeId) {
    const data = await ctx.engineering.impacts.linkCause(commerce, ctx.tenantId, {
      impactId: body.id,
      changeId: body.changeId,
      createdBy: ctx.userId,
    });
    return NextResponse.json({ data }, { status: 201 });
  }
  if (body.action === "link_affected" && body.id && body.targetType && body.targetId) {
    const data = await ctx.engineering.impacts.linkAffected(commerce, ctx.tenantId, {
      impactId: body.id,
      targetType: body.targetType,
      targetId: body.targetId,
      createdBy: ctx.userId,
    });
    return NextResponse.json({ data }, { status: 201 });
  }
  const data = await ctx.engineering.impacts.create(commerce, {
    tenantId: ctx.tenantId,
    title: body.title,
    impactType: body.impactType,
    impactCode: body.impactCode,
    description: body.description,
    severity: body.severity,
    likelihood: body.likelihood,
    status: body.status,
    ownerId: body.ownerId,
    projectId: body.projectId,
    createdBy: ctx.userId,
  });
  return NextResponse.json({ data }, { status: 201 });
});

export const PATCH = withEngineeringApi("impacts", async ({ ctx, commerce }, request) => {
  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: "id required" }, { status: 422 });
  const data = await ctx.engineering.impacts.update(
    commerce,
    ctx.tenantId,
    body.id,
    {
      title: body.title,
      description: body.description,
      impactType: body.impactType,
      severity: body.severity,
      likelihood: body.likelihood,
      status: body.status,
      ownerId: body.ownerId,
      projectId: body.projectId,
    },
    ctx.userId,
  );
  return NextResponse.json({ data });
});
