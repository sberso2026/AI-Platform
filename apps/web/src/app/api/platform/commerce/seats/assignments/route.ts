import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/kernel";
import { CommerceDomainError } from "@rtb/platform-commerce";

export async function GET(request: Request) {
  const ctx = await getAuthContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const seatPoolId = new URL(request.url).searchParams.get("seatPoolId");
  if (!seatPoolId) {
    return NextResponse.json({ error: "seatPoolId required" }, { status: 422 });
  }

  try {
    const assignments = await ctx.commerce.seatAssignment.listAssignments(
      ctx.tenantId,
      seatPoolId
    );
    return NextResponse.json({ data: assignments });
  } catch (err) {
    if (err instanceof CommerceDomainError) {
      return NextResponse.json({ error: err.message, code: err.code }, { status: err.statusCode });
    }
    throw err;
  }
}
