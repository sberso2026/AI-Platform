import { NextResponse } from "next/server";
import { withEngineeringApiParams } from "@/lib/commerce/engineering-api";

export const GET = withEngineeringApiParams("technical-queries", async ({ ctx, commerce }, _request, { id }) => {
  const data = await ctx.engineering.technicalQueries.get(commerce, ctx.tenantId, id);
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ data });
});
