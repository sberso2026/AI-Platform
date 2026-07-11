import { NextResponse } from "next/server";
import {
  mapInvoiceAdministrationViews,
  mapSubscriptionBillingViews,
} from "@rtb/platform-core";
import { getAuthContext } from "@/lib/kernel";
import { requireCommerceAdmin } from "@/lib/commerce/with-commerce-entitlement";

export async function GET() {
  const ctx = await getAuthContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (ctx.roleSlug !== "owner") {
    return NextResponse.json({ error: "Owner access required" }, { status: 403 });
  }
  const denied = await requireCommerceAdmin(ctx);
  if (denied) return denied;

  const [subscriptions, accounts, invoices, products] = await Promise.all([
    ctx.commerce.subscriptions.listByTenant(ctx.tenantId),
    ctx.commerce.billing.listAccounts(ctx.tenantId),
    ctx.commerce.billing.listInvoices(ctx.tenantId),
    ctx.commerce.products.listCatalog(),
  ]);

  const productNameById = new Map(products.map((p) => [p.id, p.name]));
  const productSlugById = new Map(products.map((p) => [p.id, p.slug]));

  return NextResponse.json({
    data: {
      subscriptions: mapSubscriptionBillingViews(
        subscriptions,
        productNameById,
        productSlugById,
        accounts,
        true
      ),
      invoices: mapInvoiceAdministrationViews(invoices),
      accounts,
    },
  });
}
