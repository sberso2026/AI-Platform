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

  if (!body.seatPoolId || !body.userId) {
    return NextResponse.json({ error: "seatPoolId and userId required" }, { status: 422 });
  }

  try {
    const result = await ctx.commerce.seatAssignment.remove({
      tenantId: ctx.tenantId,
      seatPoolId: body.seatPoolId,
      userId: body.userId,
      removedBy: ctx.userId,
    });
    return NextResponse.json({ data: result });
  } catch (err) {
    if (err instanceof CommerceDomainError) {
      return NextResponse.json({ error: err.message, code: err.code }, { status: err.statusCode });
    }
    throw err;
  }
}
