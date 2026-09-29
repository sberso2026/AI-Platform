import { NextResponse } from "next/server";
import { withEngineeringApi } from "@/lib/commerce/engineering-api";

function csv(value: string | null): string[] | undefined {
  if (!value) return undefined;
  return value.split(",").map((part) => part.trim()).filter(Boolean);
}

export const GET = withEngineeringApi("thread", async ({ ctx, commerce }, request) => {
  const url = new URL(request.url);
  const action = url.searchParams.get("action") ?? "trace";
  if (action === "catalog") {
    return NextResponse.json({ data: ctx.engineering.digitalThread.catalog() });
  }
  if (action === "coverage") {
    const data = await ctx.engineering.digitalThread.coverage(commerce, ctx.tenantId);
    return NextResponse.json({ data });
  }
  const objectType = url.searchParams.get("objectType");
  const objectId = url.searchParams.get("objectId");
  if (!objectType || !objectId) {
    return NextResponse.json({ error: "objectType and objectId are required" }, { status: 400 });
  }
  const depth = url.searchParams.get("depth");
  const data = await ctx.engineering.digitalThread.trace(commerce, ctx.tenantId, {
    objectType,
    objectId,
    direction: (url.searchParams.get("direction") as "upstream" | "downstream" | "both" | null) ?? "both",
    relationTypes: csv(url.searchParams.get("relations")),
    objectTypes: csv(url.searchParams.get("objectTypes")),
    maxDepth: depth ? Number(depth) : undefined,
    kind:
      action === "requirement" || action === "decision" || action === "analysis" || action === "configuration" || action === "change"
        ? action
        : action === "upstream" || action === "downstream"
          ? "graph"
          : "graph",
  });
  return NextResponse.json({ data });
});
