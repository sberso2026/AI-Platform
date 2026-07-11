"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { notFound, useParams, useSearchParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { PageMain } from "@/components/layout/page-main";
import { buttonVariants, SectionHeader } from "@rtb/ui";
import type {
  CommercialApplicationView,
  InstallationProgressView,
  LicenceSeatPoolView,
  ProductAdministrationView,
  UsageMetricView,
  WorkspaceProductAssignmentView,
} from "@rtb/platform-core";
import { parseProductDetailTab, type ProductDetailTab } from "@rtb/platform-core";
import { ApplicationCard } from "@/components/commerce/application-card";
import { CommercialDimensionsPanel } from "@/components/commerce/commercial-dimensions-panel";
import { CommercialStatusChips } from "@/components/commerce/commercial-status-chips";
import { HealthStatusChip } from "@/components/commerce/health-status-chip";
import { InstallationProgressPanel } from "@/components/commerce/installation-progress-panel";
import { ProductDetailTabs } from "@/components/commerce/product-detail/product-detail-tabs";
import { ProductWorkspacePanel } from "@/components/commerce/product-detail/product-workspace-panel";
import { CatalogueFallbackBanner } from "@/components/commerce/commerce-filters";
import { EntitlementDiagnoseButton } from "@/components/commerce/entitlement-diagnose-button";

type TabPayload = {
  product: ProductAdministrationView;
  applications?: unknown[];
  workspaces?: WorkspaceProductAssignmentView[];
  availableWorkspaces?: Array<{ id: string; name: string }>;
  installationId?: string;
  productId?: string;
  licenceSeats?: LicenceSeatPoolView[];
  usage?: UsageMetricView[];
  installationProgress?: InstallationProgressView;
  health?: Record<string, unknown>;
  versionHistory?: Array<{ version?: string; created_at?: string }>;
  auditEvents?: Array<Record<string, unknown>>;
};

function ProductDetailContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const productSlug = params.productSlug as string;
  const activeTab = parseProductDetailTab(searchParams.get("tab"));
  const [roleSlug, setRoleSlug] = useState("owner");
  const [payload, setPayload] = useState<TabPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTab = useCallback(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/platform/nav-context").then((r) => r.json()),
      fetch(`/api/platform/administration/products/${productSlug}?tab=${activeTab}`).then((r) => r.json()),
    ])
      .then(([navJson, tabJson]) => {
        if (navJson.roleSlug) setRoleSlug(navJson.roleSlug);
        if (tabJson.error) throw new Error(tabJson.error);
        setPayload(tabJson.data as TabPayload);
        setError(null);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [productSlug, activeTab]);

  useEffect(() => {
    loadTab();
  }, [loadTab]);

  if (!loading && !payload?.product) {
    notFound();
  }

  const product = payload?.product;
  if (!product) return null;

  return (
    <>
      <Header
        title={product.name}
        description="Manage product subscription, licences, workspaces, installation, and health."
        showEngineeringChrome={false}
      />
      <PageMain>
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <Link href="/system/products" className={buttonVariants({ variant: "outline", size: "sm" })}>
            ← Back to Installed Products
          </Link>
          <EntitlementDiagnoseButton productKey={product.slug} />
        </div>

        {error && (
          <p className="mb-3 text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
        {loading && <p className="mb-3 text-sm text-muted-foreground">Loading…</p>}

        <ProductDetailTabs activeTab={activeTab} />

        <div
          role="tabpanel"
          id={`product-tabpanel-${activeTab}`}
          aria-labelledby={`product-tab-${activeTab}`}
          data-testid={`product-tabpanel-${activeTab}`}
        >
          <TabPanel
            tab={activeTab}
            product={product}
            payload={payload}
            roleSlug={roleSlug}
            onRefresh={loadTab}
          />
        </div>
      </PageMain>
    </>
  );
}

function TabPanel({
  tab,
  product,
  payload,
  roleSlug,
  onRefresh,
}: {
  tab: ProductDetailTab;
  product: ProductAdministrationView;
  payload: TabPayload | null;
  roleSlug: string;
  onRefresh: () => void;
}) {
  switch (tab) {
    case "overview":
      return (
        <div className="space-y-6">
          <CommercialDimensionsPanel
            subscriptionStatus={product.subscriptionStatus}
            licenceStatus={product.licenceStatus}
            installationStatus={product.installationStatus}
            seatUsage={product.seatUsage}
            entitlementAllowed
            catalogueFallback={false}
          />
          <div className="flex flex-wrap gap-2">
            <CommercialStatusChips
              subscriptionStatus={product.subscriptionStatus}
              licenceStatus={product.licenceStatus}
              installationStatus={product.installationStatus}
            />
            <HealthStatusChip status={product.healthStatus} />
          </div>
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <OverviewItem label="Edition" value={product.edition ?? "—"} />
            <OverviewItem label="Installed version" value={product.version ?? "—"} />
            <OverviewItem label="Available version" value={product.availableVersion ?? "—"} />
            <OverviewItem label="Renewal" value={product.renewalDate ?? "—"} />
            <OverviewItem
              label="Seats"
              value={
                product.seatUsage
                  ? `${product.seatUsage.assigned} / ${product.seatUsage.total}`
                  : "—"
              }
            />
            <OverviewItem
              label="Workspaces"
              value={String(product.workspaceAssignmentCount ?? "—")}
            />
            <OverviewItem
              label="Applications"
              value={String(product.installedApplications.length)}
            />
            <OverviewItem label="Usage" value={product.usageSummary ?? "—"} />
            <OverviewItem
              label="Last health check"
              value={
                product.lastHealthCheckAt
                  ? new Date(product.lastHealthCheckAt).toLocaleString()
                  : "—"
              }
            />
          </dl>
        </div>
      );
    case "applications":
      return product.slug === "engineering-os" ? (
        <p className="text-sm text-muted-foreground">
          Application cards load from Engineering OS registry and Commerce licences.
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">Application catalogue not available for this product.</p>
      );
    case "workspaces":
      return (
        <ProductWorkspacePanel
          assignments={payload?.workspaces ?? []}
          availableWorkspaces={payload?.availableWorkspaces ?? []}
          installationId={payload?.installationId}
          productId={payload?.productId}
          onChanged={onRefresh}
        />
      );
    case "licences-seats":
      return (
        <ul className="space-y-2 text-sm">
          {(payload?.licenceSeats ?? []).map((row) => (
            <li key={row.id} className="rounded-md border border-border p-3">
              {row.productName ?? row.productId} — {row.seatType}: {row.assignedSeats}/{row.seatLimit}{" "}
              ({row.licenceStatus})
            </li>
          ))}
          {(payload?.licenceSeats ?? []).length === 0 && (
            <li className="text-muted-foreground">No licence or seat pools for this product.</li>
          )}
        </ul>
      );
    case "usage":
      return (
        <ul className="space-y-2 text-sm">
          {(payload?.usage ?? []).map((u) => (
            <li key={u.metricKey} className="flex justify-between gap-2 rounded-md border border-border p-3">
              <span>{u.name}</span>
              <span>
                {u.consumed}
                {u.includedAllowance !== undefined ? ` / ${u.includedAllowance}` : ""} {u.unit}
              </span>
            </li>
          ))}
        </ul>
      );
    case "installation":
      return payload?.installationProgress ? (
        <InstallationProgressPanel progress={payload.installationProgress} onRetry={onRefresh} />
      ) : (
        <p className="text-sm text-muted-foreground">No installation record for this product.</p>
      );
    case "health":
      return payload?.health ? (
        <pre className="overflow-x-auto rounded-md bg-slate-50 p-4 text-xs">
          {JSON.stringify(payload.health, null, 2)}
        </pre>
      ) : (
        <p className="text-sm text-muted-foreground">No health data available.</p>
      );
    case "version-history":
      return (
        <ul className="space-y-2 text-sm">
          {(payload?.versionHistory ?? []).map((v, i) => (
            <li key={i}>
              {v.version ?? "—"} — {v.created_at ? new Date(v.created_at).toLocaleString() : "—"}
            </li>
          ))}
        </ul>
      );
    case "audit-history":
      return (
        <ul className="space-y-2 text-sm">
          {(payload?.auditEvents ?? []).map((e, i) => (
            <li key={i} className="rounded-md border border-border p-3">
              {(e as { event_type?: string }).event_type ?? "event"} —{" "}
              {(e as { created_at?: string }).created_at ?? ""}
            </li>
          ))}
        </ul>
      );
    case "support":
      return (
        <div className="rounded-lg border border-border bg-white p-6 text-sm">
          <p className="mb-2">Contact RTB support for product administration assistance.</p>
          <a href="mailto:support@rtb.eng" className="text-primary hover:underline">
            support@rtb.eng
          </a>
        </div>
      );
    default:
      return null;
  }
}

function OverviewItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium text-slate-500">{label}</dt>
      <dd className="text-sm text-slate-800">{value}</dd>
    </div>
  );
}

export default function ProductDetailPage() {
  return (
    <Suspense fallback={<PageMain><p className="text-sm text-muted-foreground">Loading…</p></PageMain>}>
      <ProductDetailContent />
    </Suspense>
  );
}
