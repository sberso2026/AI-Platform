import { NextResponse } from "next/server";
import { withEngineeringApiParams } from "@/lib/commerce/engineering-api";

export const GET = withEngineeringApiParams("documents", async ({ ctx, commerce }, _request, { documentId }) => {
  const data = await ctx.engineering.documents.get(commerce, ctx.tenantId, documentId);
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ data });
});
