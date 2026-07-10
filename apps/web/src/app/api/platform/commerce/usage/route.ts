import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/kernel";

export async function GET(request: Request) {
  const ctx = await getAuthContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const now = new Date();
  const periodStart =
    searchParams.get("periodStart") ??
    new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const periodEnd = searchParams.get("periodEnd") ?? now.toISOString();

  const [types, aggregates] = await Promise.all([
    ctx.commerce.usage.listTypes(),
    ctx.commerce.usage.aggregateByTenant(ctx.tenantId, periodStart, periodEnd),
  ]);

  return NextResponse.json({ data: { types, aggregates, periodStart, periodEnd } });
}
