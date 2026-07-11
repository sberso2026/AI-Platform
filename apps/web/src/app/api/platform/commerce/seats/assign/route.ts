import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/kernel";
import { requireCommerceAdmin } from "@/lib/commerce/with-commerce-entitlement";
import { CommerceDomainError } from "@rtb/platform-commerce";

export async function POST(request: Request) {
  const ctx = await getAuthContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const denied = await requireCommerceAdmin(ctx);
  if (denied) return denied;

  const body = await request.json();
  try {
    const assignment = await ctx.commerce.seatAssignment.assign({
      tenantId: ctx.tenantId,
      seatPoolId: body.seatPoolId,
      userId: body.userId,
      workspaceId: body.workspaceId,
      assignedBy: ctx.userId,
    });
    return NextResponse.json({ data: assignment }, { status: 201 });
  } catch (err) {
    if (err instanceof CommerceDomainError) {
      return NextResponse.json({ error: err.message, code: err.code }, { status: err.statusCode });
    }
    throw err;
  }
}
