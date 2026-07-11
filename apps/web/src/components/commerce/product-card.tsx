"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Button,
  buttonVariants,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@rtb/ui";
import type { CommercialActionId, CommercialProductView } from "@rtb/platform-core";
import {
  COMMERCIAL_ACTION_LABELS,
  isActionVisible,
} from "@rtb/platform-core";
import { getIcon } from "@/lib/icons";
import { CommercialStatusChips } from "./commercial-status-chips";
import { HealthStatusChip } from "./health-status-chip";
import { normalizeHealthStatus } from "@rtb/platform-core";

function actionHref(action: CommercialActionId, product: CommercialProductView): string | undefined {
  switch (action) {
    case "open":
      return product.openHref;
    case "manage":
      return product.manageHref;
    case "install":
      return `/system/products/${product.slug}/install`;
    case "view_billing":
      return "/system/subscription-billing";
    case "manage_seats":
      return "/system/licenses-seats";
    case "view_usage":
      return "/system/usage";
    default:
      return undefined;
  }
}

function InstallActionButton({
  product,
  roleSlug,
}: {
  product: CommercialProductView;
  roleSlug: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isActionVisible("install", roleSlug)) return null;

  async function runInstall() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/platform/installations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productSlug: product.slug }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Installation failed");
      window.location.href = json.data?.id
        ? `/system/installations/${json.data.id}`
        : `/system/products/${product.slug}`;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Installation failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-1">
      <Button
        variant="default"
        size="sm"
        disabled={loading}
        onClick={runInstall}
        data-testid="action-install"
      >
        {loading ? "Installing…" : COMMERCIAL_ACTION_LABELS.install}
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function ActionButton({
  action,
  product,
  roleSlug,
  variant,
}: {
  action: CommercialActionId;
  product: CommercialProductView;
  roleSlug: string;
  variant: "default" | "outline";
}) {
  if (!isActionVisible(action, roleSlug)) return null;

  if (action === "install") {
    return <InstallActionButton product={product} roleSlug={roleSlug} />;
  }

  const href = actionHref(action, product);
  const label = COMMERCIAL_ACTION_LABELS[action];

  if (href) {
    return (
      <Link
        href={href}
        className={buttonVariants({ variant, size: "sm" })}
        data-testid={`action-${action}`}
      >
        {label}
      </Link>
    );
  }

  return (
    <Button
      variant={variant}
      size="sm"
      disabled
      data-testid={`action-${action}`}
      title="Workflow not yet connected"
    >
      {label}
    </Button>
  );
}

export function ProductCard({
  product,
  roleSlug,
  subdued = false,
  healthStatus,
  availableVersion,
  workspaceAssignmentCount,
  lastHealthCheckAt,
}: {
  product: CommercialProductView;
  roleSlug: string;
  subdued?: boolean;
  healthStatus?: ReturnType<typeof normalizeHealthStatus>;
  availableVersion?: string;
  workspaceAssignmentCount?: number;
  lastHealthCheckAt?: string;
}) {
  const Icon = getIcon(product.icon);
  const health =
    healthStatus ??
    normalizeHealthStatus({ installationStatus: product.installationStatus });

  return (
    <Card
      className={
        subdued
          ? "border-border bg-slate-50/80 opacity-80 shadow-none"
          : "border-border bg-white shadow-sm"
      }
      data-testid={`product-card-${product.slug}`}
      data-catalog-tab={product.catalogTab}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={
                subdued
                  ? "flex h-10 w-10 items-center justify-center rounded-lg bg-slate-200/70 text-slate-500"
                  : "flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600"
              }
            >
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base text-slate-800">{product.name}</CardTitle>
              <CardDescription>{product.description}</CardDescription>
              <p className="mt-1 text-xs text-slate-500">{product.productType}</p>
            </div>
          </div>
          {product.edition && (
            <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-700">
              {product.edition}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <CommercialStatusChips
            subscriptionStatus={product.subscriptionStatus}
            licenceStatus={product.licenceStatus}
            installationStatus={product.installationStatus}
          />
          <HealthStatusChip status={health} />
        </div>

        <dl className="grid grid-cols-2 gap-3 text-xs text-slate-600">
          {product.version && (
            <div>
              <dt className="font-medium text-slate-500">Installed version</dt>
              <dd>{product.version}</dd>
            </div>
          )}
          {availableVersion && (
            <div>
              <dt className="font-medium text-slate-500">Available version</dt>
              <dd>{availableVersion}</dd>
            </div>
          )}
          {product.seatUsage && (
            <div>
              <dt className="font-medium text-slate-500">Seats</dt>
              <dd data-testid="seat-usage">
                {product.seatUsage.assigned} / {product.seatUsage.total}
              </dd>
            </div>
          )}
          {product.renewalDate && (
            <div>
              <dt className="font-medium text-slate-500">Renewal</dt>
              <dd>{product.renewalDate}</dd>
            </div>
          )}
          {workspaceAssignmentCount !== undefined && (
            <div>
              <dt className="font-medium text-slate-500">Workspaces</dt>
              <dd>{workspaceAssignmentCount} assigned</dd>
            </div>
          )}
          {lastHealthCheckAt && (
            <div>
              <dt className="font-medium text-slate-500">Last health check</dt>
              <dd>{new Date(lastHealthCheckAt).toLocaleString()}</dd>
            </div>
          )}
          {product.installedApplications.length > 0 && (
            <div>
              <dt className="font-medium text-slate-500">Applications</dt>
              <dd data-testid="installed-app-count">
                {product.installedApplications.length} installed
              </dd>
            </div>
          )}
        </dl>

        {product.usageSummary && (
          <p className="text-xs text-slate-500">{product.usageSummary}</p>
        )}

        <div className="flex flex-wrap gap-2">
          {product.primaryAction && (
            <ActionButton
              action={product.primaryAction}
              product={product}
              roleSlug={roleSlug}
              variant="default"
            />
          )}
          {product.secondaryAction && (
            <ActionButton
              action={product.secondaryAction}
              product={product}
              roleSlug={roleSlug}
              variant="outline"
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
