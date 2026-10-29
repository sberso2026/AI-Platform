import { NextResponse } from "next/server";
import { withEngineeringApi } from "@/lib/commerce/engineering-api";

export const GET = withEngineeringApi("discipline-intelligence", async ({ ctx, commerce }) => {
  const data = ctx.engineering.disciplineIntelligence.list(commerce, ctx.tenantId);
  return NextResponse.json({ data });
});

export const POST = withEngineeringApi("discipline-intelligence", async ({ ctx, commerce }, request) => {
  const body = await request.json();
  if (body.action === "resolve_context") {
    const data = ctx.engineering.disciplineIntelligence.resolveContext(commerce, ctx.tenantId, body);
    return NextResponse.json({ data });
  }
  if (body.action === "bind_tool") {
    await ctx.engineering.disciplineIntelligence.bindTool(commerce, ctx.tenantId, {
      disciplineCode: body.disciplineCode,
      capabilityKey: body.capabilityKey,
      toolCode: body.toolCode,
      externalToolProfileId: body.externalToolProfileId ?? null,
      workspaceId: body.workspaceId ?? null,
      payload: body,
    });
    return NextResponse.json({ ok: true }, { status: 201 });
  }
  const profile = ctx.engineering.disciplineIntelligence.get(commerce, ctx.tenantId, body.code);
  const data = await ctx.engineering.disciplineIntelligence.persistProfile(commerce, ctx.tenantId, profile, ctx.userId);
  return NextResponse.json({ data }, { status: 201 });
});
