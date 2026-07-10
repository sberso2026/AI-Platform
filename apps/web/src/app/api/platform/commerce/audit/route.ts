import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/kernel";
import { requireCommerceAdmin } from "@/lib/commerce/with-commerce-entitlement";

export async function GET(request: Request) {
  const ctx = await getAuthContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const adminDenied = await requireCommerceAdmin(ctx);
  if (adminDenied) return adminDenied;

  const params = new URL(request.url).searchParams;
  const source = params.get("source") as "subscription" | "licence" | "all" | null;
  const limit = Number(params.get("limit") ?? "100");

  const events = await ctx.commerce.audit.listTenantAudit(ctx.tenantId, {
    source: source ?? "all",
    limit: Number.isFinite(limit) ? limit : 100,
  });

  return NextResponse.json({ data: events });
}
