import { NextResponse } from "next/server";
import { withEngineeringApi } from "@/lib/commerce/engineering-api";

export const POST = withEngineeringApi("demo", async ({ ctx, commerce }) => {
  const data = await ctx.engineering.demo.reset(commerce, ctx.tenantId);
  return NextResponse.json({ data });
});
