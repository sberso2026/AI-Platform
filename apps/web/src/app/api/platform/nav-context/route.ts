import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/kernel";
import { PermissionService, resolveNavTier } from "@rtb/platform-core";
import { activeOperatingSystemIds } from "@rtb/types";

function mapProductKeyToOsId(productKey: string): string | null {
  const key = productKey.toLowerCase();
  if (key === "engineering-os" || key === "engineering") return "engineering";
  if (key === "reference-os") return "reference-os";
  if (key === "business-os" || key === "business") return "business";
  if (key === "fleet-os" || key === "fleet") return "fleet";
  return null;
}

async function resolveActiveOsIds(
  supabase: Awaited<ReturnType<typeof getAuthContext>> extends infer T
    ? T extends { supabase: infer S }
      ? S
      : never
    : never,
  tenantId: string,
): Promise<string[]> {
  const { data, error } = await supabase
    .from("commercial_installations")
    .select("status, commercial_products(product_key, slug)")
    .eq("tenant_id", tenantId);

  if (error || !data) {
    return [];
  }

  const rows: Array<{ operatingSystemId: string; status: string }> = [];
  for (const row of data as Array<{
    status: string;
    commercial_products?:
      | { product_key?: string; slug?: string }
      | Array<{ product_key?: string; slug?: string }>
      | null;
  }>) {
    const product = Array.isArray(row.commercial_products)
      ? row.commercial_products[0]
      : row.commercial_products;
    const rawKey = String(product?.product_key ?? product?.slug ?? "");
    const osId = mapProductKeyToOsId(rawKey);
    if (osId) {
      rows.push({ operatingSystemId: osId, status: row.status });
    }
  }
  return activeOperatingSystemIds(rows);
}

export async function GET() {
  const ctx = await getAuthContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const permissionService = new PermissionService(ctx.supabase);
  void permissionService;

  const activeOs = await resolveActiveOsIds(ctx.supabase, ctx.tenantId);

  return NextResponse.json({
    data: {
      roleSlug: ctx.roleSlug,
      tier: resolveNavTier(ctx.roleSlug),
      showAdvancedPlatformTools: ctx.showAdvancedPlatformTools,
      permissions: ctx.permissions,
      activeOperatingSystemIds: activeOs,
    },
  });
}
