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
  const assignments: Array<{ seatPoolId: string; userId: string; workspaceId?: string }> =
    body.assignments ?? [];

  if (!assignments.length) {
    return NextResponse.json({ error: "assignments required" }, { status: 422 });
  }

  const results = [];
  const errors: Array<{ userId: string; error: string; code?: string }> = [];

  for (const item of assignments) {
    try {
      const assignment = await ctx.commerce.seatAssignment.assign({
        tenantId: ctx.tenantId,
        seatPoolId: item.seatPoolId,
        userId: item.userId,
        workspaceId: item.workspaceId,
        assignedBy: ctx.userId,
      });
      results.push(assignment);
    } catch (err) {
      if (err instanceof CommerceDomainError) {
        errors.push({ userId: item.userId, error: err.message, code: err.code });
      } else {
        errors.push({ userId: item.userId, error: err instanceof Error ? err.message : String(err) });
      }
    }
  }

  if (!results.length && errors.length) {
    return NextResponse.json({ error: "All assignments failed", errors }, { status: 422 });
  }

  return NextResponse.json({ data: { assignments: results, errors } }, { status: 201 });
}
