import { NextResponse } from "next/server";
import { withEngineeringApiParams } from "@/lib/commerce/engineering-api";

export const GET = withEngineeringApiParams("assets", async ({ ctx, commerce }, _request, { assetId }) => {
  const data = await ctx.engineering.assets.get(commerce, ctx.tenantId, assetId);
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ data });
});
