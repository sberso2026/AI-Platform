import { NextResponse } from "next/server";
import { withEngineeringApi } from "@/lib/commerce/engineering-api";

export const GET = withEngineeringApi("activity", async ({ ctx, commerce }, request) => {
  const projectId = new URL(request.url).searchParams.get("projectId") ?? undefined;
  const data = await ctx.engineering.activity.list(commerce, ctx.tenantId, 100, projectId);
  return NextResponse.json({ data });
});
