import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/kernel";

export async function GET() {
  const ctx = await getAuthContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [accounts, invoices] = await Promise.all([
    ctx.commerce.billing.listAccounts(ctx.tenantId),
    ctx.commerce.billing.listInvoices(ctx.tenantId),
  ]);

  return NextResponse.json({ data: { accounts, invoices } });
}
