import { NextResponse } from "next/server";
import type { AuthContext } from "@/lib/kernel";
import { requireCommerceAdmin } from "@/lib/commerce/with-commerce-entitlement";

export async function requireOwner(ctx: AuthContext): Promise<NextResponse | null> {
  if (ctx.roleSlug !== "owner") {
    return NextResponse.json({ error: "Owner access required" }, { status: 403 });
  }
  return null;
}

export async function requireOwnerOrCommerceAdmin(
  ctx: AuthContext,
  options?: { ownerOnly?: boolean }
): Promise<NextResponse | null> {
  if (options?.ownerOnly) {
    return requireOwner(ctx);
  }
  if (ctx.roleSlug === "owner") return null;
  return requireCommerceAdmin(ctx);
}
