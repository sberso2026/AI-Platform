import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/kernel";
import { mapRegistryToCommercialProducts } from "@rtb/platform-core";

export async function GET() {
  const ctx = await getAuthContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const commerceData = await ctx.commerce.catalog.buildTenantCommerceData(
      ctx.tenantId
    );
    const products = mapRegistryToCommercialProducts(
      {
        roleSlug: ctx.roleSlug,
        engineeringOsEnabled: true,
      },
      commerceData
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
