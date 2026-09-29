import { NextResponse } from "next/server";
import { withEngineeringApi } from "@/lib/commerce/engineering-api";

export const GET = withEngineeringApi("requirements", async ({ ctx, commerce }, request) => {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (id) {
    const data = await ctx.engineering.requirements.get(commerce, ctx.tenantId, id);
    return NextResponse.json({ data });
  }
  const projectId = url.searchParams.get("projectId") ?? undefined;
  const data = await ctx.engineering.requirements.list(commerce, ctx.tenantId, projectId);
  return NextResponse.json({ data });
});

export const POST = withEngineeringApi("requirements", async ({ ctx, commerce }, request) => {
  const body = await request.json();
  if (body.action === "allocate" && body.id && body.targetType && body.targetId) {
    const data = await ctx.engineering.requirements.allocate(commerce, ctx.tenantId, {
      requirementId: body.id,
      targetType: body.targetType,
      targetId: body.targetId,
      createdBy: ctx.userId,
    });
    return NextResponse.json({ data }, { status: 201 });
  }
  if (body.action === "unallocate" && body.id && body.targetType && body.targetId) {
    await ctx.engineering.requirements.unallocate(commerce, ctx.tenantId, {
      requirementId: body.id,
      targetType: body.targetType,
      targetId: body.targetId,
      actorId: ctx.userId,
    });
    return NextResponse.json({ data: { ok: true } });
  }
  if (body.action === "link_assumption" && body.id && body.assumptionId) {
    const data = await ctx.engineering.requirements.linkAssumption(commerce, ctx.tenantId, {
      requirementId: body.id,
      assumptionId: body.assumptionId,
      createdBy: ctx.userId,
    });
    return NextResponse.json({ data }, { status: 201 });
  }
  if (body.action === "link_evidence" && body.id && body.evidenceId) {
    const data = await ctx.engineering.requirements.linkEvidence(commerce, ctx.tenantId, {
      requirementId: body.id,
      evidenceType: body.evidenceType ?? "document",
      evidenceId: body.evidenceId,
      createdBy: ctx.userId,
    });
    return NextResponse.json({ data }, { status: 201 });
  }
  const data = await ctx.engineering.requirements.create(commerce, {
    tenantId: ctx.tenantId,
    title: body.title,
    statement: body.statement,
    requirementType: body.requirementType,
    requirementCode: body.requirementCode,
    source: body.source,
    rationale: body.rationale,
    status: body.status,
    priority: body.priority,
    ownerId: body.ownerId,
    projectId: body.projectId,
    acceptanceCriteria: body.acceptanceCriteria,
    verificationMethod: body.verificationMethod,
    verificationStatus: body.verificationStatus,
    createdBy: ctx.userId,
  });
  return NextResponse.json({ data }, { status: 201 });
});

export const PATCH = withEngineeringApi("requirements", async ({ ctx, commerce }, request) => {
  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: "id required" }, { status: 422 });
  const data = await ctx.engineering.requirements.update(
    commerce,
    ctx.tenantId,
    body.id,
    {
      title: body.title,
      statement: body.statement,
      requirementType: body.requirementType,
      source: body.source,
      rationale: body.rationale,
      status: body.status,
      priority: body.priority,
      ownerId: body.ownerId,
      projectId: body.projectId,
      acceptanceCriteria: body.acceptanceCriteria,
      verificationMethod: body.verificationMethod,
      verificationStatus: body.verificationStatus,
      verificationEvidenceRef: body.verificationEvidenceRef,
    },
    ctx.userId,
  );
  return NextResponse.json({ data });
});
