import { NextResponse } from "next/server";
import { withEngineeringApi } from "@/lib/commerce/engineering-api";

export const GET = withEngineeringApi("external-tools", async ({ ctx, commerce }) => {
  const data = await ctx.engineering.externalTools.list(commerce, ctx.tenantId);
  return NextResponse.json({ data, catalogNote: "SPACE GASS overlay is NOT_CONFIGURED until a real install is recorded." });
});

export const POST = withEngineeringApi("external-tools", async ({ ctx, commerce }, request) => {
  const body = await request.json();
  if (body.action === "ensure_spacegass") {
    const data = await ctx.engineering.externalTools.ensureSpaceGassNotReady(commerce, ctx.tenantId, ctx.userId);
    return NextResponse.json({ data }, { status: 201 });
  }
  const data = await ctx.engineering.externalTools.create(commerce, ctx.tenantId, body, ctx.userId);
  return NextResponse.json({ data }, { status: 201 });
});
