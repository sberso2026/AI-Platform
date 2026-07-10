import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/kernel";

export async function GET() {
  const ctx = await getAuthContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const licenses = await ctx.commerce.licenses.listByTenant(ctx.tenantId);
  return NextResponse.json({ data: licenses });
}
