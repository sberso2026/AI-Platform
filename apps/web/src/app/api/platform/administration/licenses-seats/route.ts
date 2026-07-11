import { NextResponse } from "next/server";
import { mapLicenceSeatPools } from "@rtb/platform-core";
import { getAuthContext } from "@/lib/kernel";
import { requireCommerceAdmin } from "@/lib/commerce/with-commerce-entitlement";

export async function GET() {
  const ctx = await getAuthContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const denied = await requireCommerceAdmin(ctx);
  if (denied) return denied;

  const [licenses, seatPools, products] = await Promise.all([
    ctx.commerce.licenses.listByTenant(ctx.tenantId),
    ctx.commerce.seats.listByTenant(ctx.tenantId),
    ctx.commerce.products.listCatalog(),
  ]);

  const productNameById = new Map(products.map((p) => [p.id, p.name]));

  return NextResponse.json({
    data: {
      pools: mapLicenceSeatPools(licenses, seatPools, productNameById),
    },
  });
}
