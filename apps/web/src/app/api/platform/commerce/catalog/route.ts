import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/kernel";
import { mapRegistryToCommercialProducts } from "@rtb/platform-core";
import { loadSeatedProductIds } from "@/lib/commerce/current-user-seats";

export async function GET() {
  const ctx = await getAuthContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const [commerceData, seatedProductIds] = await Promise.all([
      ctx.commerce.catalog.buildTenantCommerceData(ctx.tenantId),
      loadSeatedProductIds(ctx),
    ]);
    const products = mapRegistryToCommercialProducts(
      {
        roleSlug: ctx.roleSlug,
        engineeringOsEnabled: true,
        seatedProductIds,
      },
      { ...commerceData, current_user_seated_product_ids: seatedProductIds },
    );
    return NextResponse.json({ data: { products, commerceData } });
  } catch {
    const products = mapRegistryToCommercialProducts({
      roleSlug: ctx.roleSlug,
      engineeringOsEnabled: true,
    });
    return NextResponse.json({
      data: { products, commerceData: null, catalogueFallback: true, entitlementEnforced: false },
    });
  }
}
