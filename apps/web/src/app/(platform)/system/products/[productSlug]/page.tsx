"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { PageMain } from "@/components/layout/page-main";
import { buttonVariants } from "@rtb/ui";
import type {
  InstallationProgressView,
  LicenceSeatPoolView,
  ProductAdministrationView,
  UsageMetricView,
  WorkspaceProductAssignmentView,
} from "@rtb/platform-core";
import { parseProductDetailTab, type ProductDetailTab } from "@rtb/platform-core";
import { CommercialDimensionsPanel } from "@/components/commerce/commercial-dimensions-panel";
import { CommercialStatusChips } from "@/components/commerce/commercial-status-chips";
import { HealthStatusChip } from "@/components/commerce/health-status-chip";
import { InstallationProgressPanel } from "@/components/commerce/installation-progress-panel";
import { ProductDetailTabs } from "@/components/commerce/product-detail/product-detail-tabs";
import { ProductWorkspacePanel } from "@/components/commerce/product-detail/product-workspace-panel";
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

type DetailState =
  | { status: "loading" }
  | { status: "error"; message: string; httpStatus?: number }
  | { status: "unauthorized" }
  | { status: "not_found" }
  | { status: "ready"; roleSlug: string; payload: TabPayload };

async function readJson(res: Response): Promise<Record<string, unknown>> {
  try {
    return (await res.json()) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function ProductDetailContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const productSlug = params.productSlug as string;
  const activeTab = parseProductDetailTab(searchParams.get("tab"));
  const [state, setState] = useState<DetailState>({ status: "loading" });
  const [reloadToken, setReloadToken] = useState(0);

  const refresh = useCallback(() => {
    setReloadToken((n) => n + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setState((prev) => (prev.status === "ready" ? prev : { status: "loading" }));

    void (async () => {
      try {
        const [navRes, tabRes] = await Promise.all([
          fetch("/api/platform/nav-context"),
          fetch(`/api/platform/administration/products/${productSlug}?tab=${activeTab}`),
        ]);

        if (cancelled) return;

        if (navRes.status === 401 || tabRes.status === 401) {
          setState({ status: "unauthorized" });
          return;
        }
        if (tabRes.status === 403) {
          setState({ status: "error", message: "Access denied", httpStatus: 403 });
          return;
        }
        if (tabRes.status === 404) {
          setState({ status: "not_found" });
          return;
        }
        if (!tabRes.ok) {
          const body = await readJson(tabRes);
          setState({
            status: "error",
            message:
              typeof body.error === "string"
                ? body.error
                : `Product detail request failed (${tabRes.status})`,
            httpStatus: tabRes.status,
          });
          return;
        }

        const [navJson, tabJson] = await Promise.all([readJson(navRes), readJson(tabRes)]);
        if (cancelled) return;

        if (typeof tabJson.error === "string") {
          setState({ status: "error", message: tabJson.error, httpStatus: tabRes.status });
          return;
        }

        const payload = tabJson.data as TabPayload | undefined;
        if (!payload?.product?.slug) {
          setState({ status: "not_found" });
          return;
        }

        setState({
          status: "ready",
          roleSlug: typeof navJson.roleSlug === "string" ? navJson.roleSlug : "owner",
          payload,
        });
      } catch (e) {
        if (cancelled) return;
        setState({
          status: "error",
          message: e instanceof Error ? e.message : "Failed to load product detail",
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [productSlug, activeTab, reloadToken]);

  if (state.status === "loading") {
    return (
      <>
        <Header title="Product administration" description="Loading product detail…" showEngineeringChrome={false} />
        <PageMain>
          <p className="text-sm text-muted-foreground" data-testid="product-detail-loading" aria-live="polite">
            Loading…
          </p>
        </PageMain>
      </>
    );
  }

  if (state.status === "unauthorized") {
    return (
      <>
        <Header title="Sign in required" showEngineeringChrome={false} />
        <PageMain>
          <p className="text-sm text-destructive" role="alert" data-testid="product-detail-unauthorized">
            Authentication required to view product administration.
          </p>
        </PageMain>
      </>
    );
  }

  if (state.status === "not_found") {
    return (
      <>
        <Header title="Product not found" showEngineeringChrome={false} />
        <PageMain>
          <p className="text-sm text-muted-foreground" data-testid="product-detail-not-found">
            No product matched slug “{productSlug}”.
          </p>
          <Link href="/system/products" className={buttonVariants({ variant: "outline", size: "sm" })}>
            ← Back to Installed Products
          </Link>
        </PageMain>
      </>
    );
  }

  if (state.status === "error") {
    return (
      <>
        <Header title="Product administration" showEngineeringChrome={false} />
        <PageMain>
          <p className="text-sm text-destructive" role="alert" data-testid="product-detail-error">
            {state.message}
          </p>
        </PageMain>
      </>
    );
  }

  const { payload, roleSlug } = state;
  const product = payload.product;

  return (
    <div
      data-testid="product-detail-ready"
      data-product-slug={product.slug}
      data-active-tab={activeTab}
    >
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
            onRefresh={refresh}
          />
        </div>
      </PageMain>
    </div>
  );
}

function TabPanel({
  tab,
  product,
  payload,
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
    <Suspense
      fallback={
        <PageMain>
          <p className="text-sm text-muted-foreground" data-testid="product-detail-loading">
            Loading…
          </p>
        </PageMain>
      }
    >
      <ProductDetailContent />
    </Suspense>
  );
}
