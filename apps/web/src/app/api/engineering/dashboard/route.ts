import { NextResponse } from "next/server";
import { withEngineeringApi } from "@/lib/commerce/engineering-api";

export const GET = withEngineeringApi("dashboard", async ({ ctx, commerce }) => {
  const data = await ctx.engineering.dashboard.getDashboard(commerce, ctx.tenantId);
  return NextResponse.json({ data });
});
