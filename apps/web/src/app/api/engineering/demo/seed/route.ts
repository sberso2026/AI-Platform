import { NextResponse } from "next/server";
import { withEngineeringApi } from "@/lib/commerce/engineering-api";

export const POST = withEngineeringApi("demo", async ({ ctx, commerce }) => {
  const data = await ctx.engineering.demo.seed(commerce, ctx.tenantId);
  return NextResponse.json({ data }, { status: data.status === "seeded" ? 201 : 200 });
});
