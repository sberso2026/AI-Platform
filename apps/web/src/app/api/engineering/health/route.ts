import { NextResponse } from "next/server";
import { withEngineeringApi } from "@/lib/commerce/engineering-api";

export const GET = withEngineeringApi("health", async ({ ctx, commerce }) => {
  const data = await ctx.engineering.health.check(commerce, ctx.tenantId, ctx.userId);
  return NextResponse.json({ data });
});
