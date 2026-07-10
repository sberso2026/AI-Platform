"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { PageMain } from "@/components/layout/page-main";
import { buttonVariants, SectionHeader } from "@rtb/ui";
import type { CommercialLicense, CommercialSubscription } from "@rtb/types";
import type { CommercialApplicationView, CommercialProductView } from "@rtb/platform-core";
import {
  filterApplicationsBySection,
  getProductBySlug,
  mapEngineeringApplications,
  mapRegistryToCommercialProducts,
} from "@rtb/platform-core";
import { ENGINEERING_APPLICATIONS } from "@rtb/engineering-os/manifest";
import { ApplicationCard } from "@/components/commerce/application-card";
import { CommercialDimensionsPanel } from "@/components/commerce/commercial-dimensions-panel";
import { ProductCard } from "@/components/commerce/product-card";
import { CatalogueFallbackBanner } from "@/components/commerce/commerce-filters";
import { EntitlementDiagnoseButton } from "@/components/commerce/entitlement-diagnose-button";
import { buildDefaultCommerceContext } from "@/lib/commerce/context";

type NavContextResponse = {
  roleSlug: string;
};

type CatalogResponse = {
  products?: CommercialProductView[];
  catalogueFallback?: boolean;
};

function mapAppsFromLicenses(
  roleSlug: string,
  licenses: CommercialLicense[],
  subscription?: CommercialSubscription
): CommercialApplicationView[] {
  const activeAppKeys = new Set(
    licenses
      .filter((l) => l.license_type === "application" && (l.status === "active" || l.status === "expiring_soon"))
      .map((l) => l.application_key)
      .filter(Boolean) as string[]
  );

  const seeds = ENGINEERING_APPLICATIONS.map((app) => ({
    app_key: app.app_key,
    name: app.name,
    description: app.description,
    version: app.version,
    enabled: activeAppKeys.has(app.app_key) || app.enabled,
    routes: app.routes,
  }));

  const context = {
    ...buildDefaultCommerceContext(roleSlug),
    engineeringApplications: seeds,
  };

  const views = mapEngineeringApplications(seeds, context);

  if (subscription?.status === "trialing" || subscription?.status === "trial") {
    return views.map((v) =>
      activeAppKeys.has(v.appKey) ? { ...v, subscriptionStatus: "trialing" as const } : v
    );
  }

  return views;
}

export default function ProductDetailPage() {
  const [roleSlug, setRoleSlug] = useState("owner");
  const [product, setProduct] = useState<CommercialProductView | null>(null);
  const [catalogueFallback, setCatalogueFallback] = useState(false);
  const [applications, setApplications] = useState<CommercialApplicationView[]>([]);
  const [subscription, setSubscription] = useState<CommercialSubscription | undefined>();
  const [entitlementAllowed, setEntitlementAllowed] = useState<boolean | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const productSlug = params.productSlug as string;

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/platform/nav-context").then((r) => r.json()),
      fetch("/api/platform/commerce/catalog").then((r) => r.json()),
      fetch("/api/platform/commerce/licenses").then((r) => r.json()),
      fetch("/api/platform/commerce/subscriptions").then((r) => r.json()),
      fetch("/api/platform/commerce/entitlements/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productKey: productSlug, action: "access" }),
      }).then((r) => r.json()),
    ])
      .then(([navJson, catalogJson, licensesJson, subsJson, entitlementJson]) => {
        if (navJson.roleSlug) setRoleSlug(navJson.roleSlug);

        const catalogData = catalogJson.data as CatalogResponse | undefined;
        const fallback = Boolean(catalogData?.catalogueFallback);
        setCatalogueFallback(fallback);

        const context = buildDefaultCommerceContext(navJson.roleSlug ?? "owner");
        const products =
          catalogData?.products ??
          mapRegistryToCommercialProducts(context, catalogJson.data?.commerceData ?? undefined);
        const matched = getProductBySlug(products, productSlug);
        setProduct(matched ?? null);

        const licenses = (licensesJson.data ?? []) as CommercialLicense[];
        const subscriptions = (subsJson.data ?? []) as CommercialSubscription[];
        const productRecord = licenses.find((l) => l.product_id)?.product_id;
        const subForProduct = subscriptions.find((s) =>
          productRecord ? s.product_id === productRecord : s.status === "active" || s.status === "trialing"
        );
        setSubscription(subForProduct);
        setEntitlementAllowed(Boolean(entitlementJson.data?.allowed));

        if (productSlug === "engineering-os") {
          setApplications(mapAppsFromLicenses(navJson.roleSlug ?? "owner", licenses, subForProduct));
        }
        setError(null);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [productSlug]);

  const installedApps = useMemo(
    () => filterApplicationsBySection(applications, "installed"),
    [applications]
  );
  const availableApps = useMemo(
    () => filterApplicationsBySection(applications, "available"),
    [applications]
  );

  if (!loading && !product) {
    notFound();
  }

  if (!product) {
    return null;
  }

  return (
    <>
      <Header
        title={product.name}
        description="Manage product subscription, licences, and installed applications."
        showEngineeringChrome={false}
      />
      <PageMain>
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <Link
            href="/system/products"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            ← Back to Installed Products
          </Link>
          <EntitlementDiagnoseButton productKey={product.slug} />
        </div>

        {catalogueFallback && <CatalogueFallbackBanner />}
        {error && <p className="mb-3 text-sm text-destructive">{error}</p>}
        {loading && <p className="mb-3 text-sm text-muted-foreground">Loading…</p>}

        <CommercialDimensionsPanel
          subscriptionStatus={product.subscriptionStatus}
          licenceStatus={product.licenceStatus}
          installationStatus={product.installationStatus}
          seatUsage={product.seatUsage}
          trialEnd={subscription?.trial_end ?? subscription?.trial_ends_at}
          entitlementAllowed={entitlementAllowed}
          catalogueFallback={catalogueFallback}
        />

        <div className="mt-6">
          <ProductCard product={product} roleSlug={roleSlug} />
        </div>

        {product.slug === "engineering-os" && (
          <div className="mt-8 space-y-8">
            <section data-testid="installed-applications-section">
              <SectionHeader
                title="Installed applications"
                description="Applications enabled for this tenant."
              />
              {installedApps.length > 0 ? (
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {installedApps.map((app) => (
                    <ApplicationCard key={app.appKey} app={app} roleSlug={roleSlug} />
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-slate-500">
                  No applications installed yet. Enable applications from the available
                  catalogue below.
                </p>
              )}
            </section>

            <section data-testid="available-applications-section">
              <SectionHeader
                title="Available applications"
                description="Install, trial, or request a quote for additional applications."
              />
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {availableApps.map((app) => (
                  <ApplicationCard key={app.appKey} app={app} roleSlug={roleSlug} />
                ))}
              </div>
            </section>
          </div>
        )}

        {product.slug !== "engineering-os" && (
          <div className="mt-8 rounded-lg border border-border bg-white p-6">
            <p className="text-sm text-slate-500">
              Application catalogue for this product will appear when Platform Commerce
              provisioning is connected.
            </p>
          </div>
        )}
      </PageMain>
    </>
  );
}
