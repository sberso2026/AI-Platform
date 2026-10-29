import { NextResponse } from "next/server";
import { withEngineeringApi } from "@/lib/commerce/engineering-api";

export const GET = withEngineeringApi("dashboard", async ({ ctx, commerce }, request) => {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId") ?? undefined;
  const data = await ctx.engineering.dashboard.getDashboard(commerce, ctx.tenantId, {
    projectId,
  });
  return NextResponse.json({ data });
});
