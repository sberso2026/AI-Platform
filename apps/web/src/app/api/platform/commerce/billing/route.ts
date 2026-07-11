import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/kernel";
import { requireOwnerOrCommerceAdmin } from "@/lib/commerce/require-owner-or-commerce-admin";

export async function GET() {
  const ctx = await getAuthContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const denied = await requireOwnerOrCommerceAdmin(ctx, { ownerOnly: true });
  if (denied) return denied;

  const [accounts, invoices] = await Promise.all([
    ctx.commerce.billing.listAccounts(ctx.tenantId),
    ctx.commerce.billing.listInvoices(ctx.tenantId),
  ]);

  return NextResponse.json({ data: { accounts, invoices } });
}
