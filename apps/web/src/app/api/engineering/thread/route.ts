import { NextResponse } from "next/server";
import { withEngineeringApi } from "@/lib/commerce/engineering-api";

const ENGINEERING_THREAD_KINDS = [
  "requirement",
  "decision",
  "analysis",
  "configuration",
  "change",
  "graph",
] as const;

type EngineeringThreadKind = (typeof ENGINEERING_THREAD_KINDS)[number];

function parseEngineeringThreadKind(value: string | null | undefined): EngineeringThreadKind {
  for (const kind of ENGINEERING_THREAD_KINDS) {
    if (value === kind) return kind;
  }
  return "graph";
}

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
  if (action === "health") {
    const data = await ctx.engineering.digitalThread.projectionHealth(commerce, ctx.tenantId);
    return NextResponse.json({ data });
  }
  const objectType = url.searchParams.get("objectType");
  const objectId = url.searchParams.get("objectId");
  if (!objectType || !objectId) {
    return NextResponse.json({ error: "objectType and objectId are required" }, { status: 400 });
  }
  const depth = url.searchParams.get("depth");
  const source = url.searchParams.get("source");
  const kind = parseEngineeringThreadKind(action);
  const input = {
    objectType,
    objectId,
    direction: (url.searchParams.get("direction") as "upstream" | "downstream" | "both" | null) ?? "both",
    relationTypes: csv(url.searchParams.get("relations")),
    objectTypes: csv(url.searchParams.get("objectTypes")),
    maxDepth: depth ? Number(depth) : undefined,
    kind,
  };
  if (source === "kg") {
    const { kind: _kind, ...projectedInput } = input;
    const data = await ctx.engineering.digitalThread.projectedTrace(commerce, ctx.tenantId, projectedInput);
    return NextResponse.json({ data });
  }
  const data = await ctx.engineering.digitalThread.trace(commerce, ctx.tenantId, input);
  return NextResponse.json({ data });
});
