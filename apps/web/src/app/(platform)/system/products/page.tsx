"use client";

import { useEffect, useMemo, useState } from "react";
import { Boxes, Calendar, KeyRound, Layers, Package } from "lucide-react";
import { MetricCard } from "@rtb/ui";
import type { CommercialProductView, ProductCatalogTab } from "@rtb/platform-core";
import {
  buildCatalogSummary,
  filterProductsByTab,
} from "@rtb/platform-core";
import { ProductCard } from "@/components/commerce/product-card";
import { ProductCatalogTabs } from "@/components/commerce/product-catalog-tabs";
import { CommerceAdminShell } from "@/components/commerce/commerce-admin-shell";
import { CatalogueFallbackBanner } from "@/components/commerce/commerce-filters";
import { EntitlementDiagnoseButton } from "@/components/commerce/entitlement-diagnose-button";

type CatalogResponse = {
  products?: CommercialProductView[];
  catalogueFallback?: boolean;
};

export default function InstalledProductsPage() {
  const [activeTab, setActiveTab] = useState<ProductCatalogTab>("installed");
  const [roleSlug, setRoleSlug] = useState("owner");
  const [products, setProducts] = useState<CommercialProductView[]>([]);
  const [catalogueFallback, setCatalogueFallback] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch("/api/platform/commerce/catalog")
      .then((r) => r.json())
      .then((json) => {
        const data = json.data as CatalogResponse | undefined;
        if (data?.products) setProducts(data.products);
        setCatalogueFallback(Boolean(data?.catalogueFallback));
        setError(null);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));

    fetch("/api/platform/nav-context")
      .then((r) => r.json())
      .then((json) => {
        if (json.roleSlug) setRoleSlug(json.roleSlug);
      })
      .catch(() => undefined);
  }, []);

  const summary = useMemo(
    () =>
      buildCatalogSummary(products, {
        roleSlug,
        engineeringOsEnabled: true,
      }),
    [products, roleSlug]
  );

  const tabCounts = useMemo(
    () => ({
      installed: filterProductsByTab(products, "installed").length,
      available: filterProductsByTab(products, "available").length,
      trials: filterProductsByTab(products, "trials").length,
      coming_soon: filterProductsByTab(products, "coming_soon").length,
    }),
    [products]
  );

  const visibleProducts = filterProductsByTab(products, activeTab).filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.slug.toLowerCase().includes(q) ||
      p.productType.toLowerCase().includes(q)
    );
  });

  return (
    <CommerceAdminShell
      title="Products"
      description="Manage commercial products, subscriptions, licences, and installations across your tenant."
      searchPlaceholder="Search products…"
      onSearch={setSearch}
      actions={<EntitlementDiagnoseButton productKey="engineering-os" />}
    >
      {catalogueFallback && <CatalogueFallbackBanner />}
      {error && <p className="mb-3 text-sm text-destructive">{error}</p>}
      {loading && <p className="mb-3 text-sm text-muted-foreground">Loading…</p>}

      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Installed Products" value={summary.installedProducts} icon={<Package className="h-5 w-5" />} tone="blue" />
        <MetricCard label="Installed Applications" value={summary.installedApplications} icon={<Layers className="h-5 w-5" />} tone="green" />
        <MetricCard label="Assigned Seats" value={`${summary.assignedSeats} / ${summary.totalSeats}`} icon={<KeyRound className="h-5 w-5" />} tone="amber" />
        <MetricCard label="Renewal Date" value={summary.renewalDate ?? "—"} icon={<Calendar className="h-5 w-5" />} tone="slate" />
        <MetricCard label="Current Plan" value={summary.currentPlan ?? "—"} icon={<Boxes className="h-5 w-5" />} tone="blue" />
      </div>

      <ProductCatalogTabs activeTab={activeTab} onTabChange={setActiveTab} counts={tabCounts} />

      <div className="mt-6 grid gap-4 md:grid-cols-2" data-testid="product-catalog-panel" data-active-tab={activeTab}>
        {visibleProducts.map((product) => (
          <ProductCard
            key={product.slug}
            product={product}
            roleSlug={roleSlug}
            subdued={product.catalogTab === "coming_soon"}
          />
        ))}
      </div>
    </CommerceAdminShell>
  );
}
