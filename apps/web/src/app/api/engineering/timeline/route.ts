import { NextResponse } from "next/server";
import { withEngineeringApi } from "@/lib/commerce/engineering-api";

export const GET = withEngineeringApi("timeline", async ({ ctx, commerce }, request) => {
  const projectId = new URL(request.url).searchParams.get("projectId") ?? undefined;
  const data = await ctx.engineering.timeline.list(commerce, ctx.tenantId, 100, projectId);
  return NextResponse.json({ data });
});
