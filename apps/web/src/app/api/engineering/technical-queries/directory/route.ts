import { NextResponse } from "next/server";
import { withEngineeringApi } from "@/lib/commerce/engineering-api";

export const GET = withEngineeringApi("technical-queries", async ({ ctx, commerce }) => {
  const data = await ctx.engineering.technicalQueries.listDirectory(commerce, ctx.tenantId);
  return NextResponse.json({ data });
});
