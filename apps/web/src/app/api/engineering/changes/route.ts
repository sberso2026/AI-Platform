import { NextResponse } from "next/server";
import { withEngineeringApi } from "@/lib/commerce/engineering-api";

export const GET = withEngineeringApi("changes", async ({ ctx, commerce }, request) => {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (id) {
    const data = await ctx.engineering.changes.get(commerce, ctx.tenantId, id);
    return NextResponse.json({ data });
  }
  const projectId = url.searchParams.get("projectId") ?? undefined;
  const data = await ctx.engineering.changes.list(commerce, ctx.tenantId, projectId);
  return NextResponse.json({ data });
});

export const POST = withEngineeringApi("changes", async ({ ctx, commerce }, request) => {
  const body = await request.json();
  if (body.action === "link_affected" && body.id && body.targetType && body.targetId) {
    const data = await ctx.engineering.changes.linkAffected(commerce, ctx.tenantId, {
      changeId: body.id,
      targetType: body.targetType,
      targetId: body.targetId,
      createdBy: ctx.userId,
    });
    return NextResponse.json({ data }, { status: 201 });
  }
  if (body.action === "unlink_affected" && body.id && body.targetType && body.targetId) {
    await ctx.engineering.changes.unlinkAffected(commerce, ctx.tenantId, {
      changeId: body.id,
      targetType: body.targetType,
      targetId: body.targetId,
      actorId: ctx.userId,
    });
    return NextResponse.json({ data: { ok: true } });
  }
  if (body.action === "link_decision" && body.id && body.decisionId) {
    const data = await ctx.engineering.changes.linkBasedOnDecision(commerce, ctx.tenantId, {
      changeId: body.id,
      decisionId: body.decisionId,
      createdBy: ctx.userId,
    });
    return NextResponse.json({ data }, { status: 201 });
  }
  if (body.action === "discover_impacts" && body.id) {
    const data = await ctx.engineering.impacts.discoverCandidates(commerce, ctx.tenantId, body.id);
    return NextResponse.json({ data });
  }
  const data = await ctx.engineering.changes.create(commerce, {
    tenantId: ctx.tenantId,
    title: body.title,
    changeType: body.changeType,
    changeCode: body.changeCode,
    description: body.description,
    source: body.source,
    reason: body.reason,
    status: body.status,
    priority: body.priority,
    ownerId: body.ownerId,
    requestedBy: body.requestedBy,
    projectId: body.projectId,
    effectiveAt: body.effectiveAt,
    createdBy: ctx.userId,
  });
  return NextResponse.json({ data }, { status: 201 });
});

export const PATCH = withEngineeringApi("changes", async ({ ctx, commerce }, request) => {
  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: "id required" }, { status: 422 });
  const data = await ctx.engineering.changes.update(
    commerce,
    ctx.tenantId,
    body.id,
    {
      title: body.title,
      description: body.description,
      changeType: body.changeType,
      source: body.source,
      reason: body.reason,
      status: body.status,
      priority: body.priority,
      ownerId: body.ownerId,
      requestedBy: body.requestedBy,
      projectId: body.projectId,
      effectiveAt: body.effectiveAt,
    },
    ctx.userId,
  );
  return NextResponse.json({ data });
});
