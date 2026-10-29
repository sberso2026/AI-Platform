import { NextResponse } from "next/server";
import { withEngineeringApi } from "@/lib/commerce/engineering-api";

export const GET = withEngineeringApi("assumptions", async ({ ctx, commerce }, request) => {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (id) {
    const data = await ctx.engineering.assumptions.get(commerce, ctx.tenantId, id);
    if (!data) return NextResponse.json({ error: "not_found" }, { status: 404 });
    return NextResponse.json({ data });
  }
  const projectId = url.searchParams.get("projectId") ?? undefined;
  const data = await ctx.engineering.assumptions.list(commerce, ctx.tenantId, projectId);
  return NextResponse.json({ data });
});

export const POST = withEngineeringApi("assumptions", async ({ ctx, commerce }, request) => {
  const body = await request.json();
  if (body.action === "link" && body.id && body.toType && body.toId && body.relationship) {
    const data = await ctx.engineering.assumptions.link(commerce, {
      tenantId: ctx.tenantId,
      assumptionId: body.id,
      toType: body.toType,
      toId: body.toId,
      relationship: body.relationship,
      createdBy: ctx.userId,
    });
    return NextResponse.json({ data }, { status: 201 });
  }
  if (body.action === "validate" && body.id && body.validationStatus) {
    const data = await ctx.engineering.assumptions.setValidation(
      commerce,
      ctx.tenantId,
      body.id,
      body.validationStatus,
      ctx.userId,
    );
    return NextResponse.json({ data });
  }
  const data = await ctx.engineering.assumptions.create(commerce, {
    tenantId: ctx.tenantId,
    workspaceId: ctx.workspaceId,
    title: body.title,
    statement: body.statement,
    source: body.source,
    rationale: body.rationale,
    confidence: body.confidence !== undefined ? Number(body.confidence) : undefined,
    validationStatus: body.validationStatus,
    materiality: body.materiality,
    projectId: body.projectId,
    assetId: body.assetId,
    ownerId: body.ownerId,
    validationDueAt: body.validationDueAt,
    reviewCondition: body.reviewCondition,
    expiresAt: body.expiresAt,
    createdBy: ctx.userId,
  });
  return NextResponse.json({ data }, { status: 201 });
});

export const PATCH = withEngineeringApi("assumptions", async ({ ctx, commerce }, request) => {
  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: "id required" }, { status: 422 });
  if (body.validationStatus && !body.title && !body.statement) {
    const data = await ctx.engineering.assumptions.setValidation(
      commerce,
      ctx.tenantId,
      body.id,
      body.validationStatus,
      ctx.userId,
    );
    return NextResponse.json({ data });
  }
  const data = await ctx.engineering.assumptions.update(
    commerce,
    ctx.tenantId,
    body.id,
    {
      title: body.title,
      statement: body.statement,
      source: body.source,
      rationale: body.rationale,
      status: body.status,
      confidence: body.confidence !== undefined ? Number(body.confidence) : undefined,
      materiality: body.materiality,
      ownerId: body.ownerId,
      validationDueAt: body.validationDueAt,
      reviewCondition: body.reviewCondition,
      expiresAt: body.expiresAt,
    },
    ctx.userId,
  );
  return NextResponse.json({ data });
});
