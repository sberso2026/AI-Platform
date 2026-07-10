import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/kernel";
import { requireCommerceAdmin } from "@/lib/commerce/with-commerce-entitlement";
import { CommerceDomainError } from "@rtb/platform-commerce";

export async function POST(request: Request) {
  const ctx = await getAuthContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const adminDenied = await requireCommerceAdmin(ctx);
  if (adminDenied) return adminDenied;

  const body = await request.json().catch(() => ({}));
  const removals: Array<{ seatPoolId: string; userId: string }> = body.removals ?? [];

  if (!removals.length) {
    return NextResponse.json({ error: "removals required" }, { status: 422 });
  }

  const results = [];
  const errors: Array<{ userId: string; error: string; code?: string }> = [];

  for (const item of removals) {
    try {
      const removed = await ctx.commerce.seatAssignment.remove({
        tenantId: ctx.tenantId,
        seatPoolId: item.seatPoolId,
        userId: item.userId,
        removedBy: ctx.userId,
      });
      results.push(removed);
    } catch (err) {
      if (err instanceof CommerceDomainError) {
        errors.push({ userId: item.userId, error: err.message, code: err.code });
      } else {
        errors.push({ userId: item.userId, error: err instanceof Error ? err.message : String(err) });
      }
    }
  }

  if (!results.length && errors.length) {
    return NextResponse.json({ error: "All removals failed", errors }, { status: 422 });
  }

  return NextResponse.json({ data: { removals: results, errors } });
}
