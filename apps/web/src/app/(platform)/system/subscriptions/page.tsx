"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Badge, Button } from "@rtb/ui";
import { CommerceAdminShell } from "@/components/commerce/commerce-admin-shell";
import { CommerceDataTable } from "@/components/commerce/commerce-data-table";
import { EntitlementDiagnoseButton } from "@/components/commerce/entitlement-diagnose-button";
import { formatLocalDate, type SubscriptionDisplayRow } from "@/lib/commerce/commerce-display";

export default function SubscriptionsPage() {
  const [rows, setRows] = useState<SubscriptionDisplayRow[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/platform/commerce/subscriptions")
      .then((r) => r.json())
      .then((json) => {
        setRows(json.data ?? []);
        setError(null);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const summary = useMemo(() => {
    const counts = { active: 0, trialing: 0, suspended: 0, cancelled: 0 };
    for (const r of rows) {
      const status = r.status === "trial" ? "trialing" : r.status;
      if (status in counts) counts[status as keyof typeof counts]++;
    }
    return counts;
  }, [rows]);

  async function runAction(id: string, action: string) {
    setError(null);
    const res = await fetch(`/api/platform/commerce/subscriptions/${id}/${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error ?? "Action failed");
      return;
    }
    load();
  }

  const filtered = rows.filter((r) => {
    if (!search) return true;
    const haystack = [
      r.status,
      r.statusLabel,
      r.productName,
      r.planName,
      r.licenceState,
      r.id,
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(search.toLowerCase());
  });

  return (
    <CommerceAdminShell
      title="Subscriptions"
      description="Manage product subscriptions, renewals, and scheduled changes."
      searchPlaceholder="Search subscriptions…"
      onSearch={setSearch}
      actions={<EntitlementDiagnoseButton productKey="engineering-os" />}
    >
      <div className="mb-4 grid gap-3 md:grid-cols-4">
        <div className="rounded border p-3 text-sm">Active: {summary.active}</div>
        <div className="rounded border p-3 text-sm">Trials: {summary.trialing}</div>
        <div className="rounded border p-3 text-sm">Suspended: {summary.suspended}</div>
        <div className="rounded border p-3 text-sm">Cancelled: {summary.cancelled}</div>
      </div>
      {error && <p className="mb-3 text-sm text-destructive">{error}</p>}
      {loading && <p className="mb-3 text-sm text-muted-foreground">Loading…</p>}
      <CommerceDataTable
        columns={[
          { key: "product", header: "Product", render: (r) => r.productName },
          { key: "plan", header: "Plan", render: (r) => r.planName },
          {
            key: "status",
            header: "Status",
            render: (r) => <Badge variant="secondary">{r.statusLabel}</Badge>,
          },
          {
            key: "trial",
            header: "Trial End",
            render: (r) => formatLocalDate(r.trial_end ?? r.trial_ends_at),
          },
          {
            key: "licence",
            header: "Licence",
            render: (r) => r.licenceState,
          },
          {
            key: "seats",
            header: "Seats",
            render: (r) => (r.seatTotal > 0 ? `${r.seatAssigned} / ${r.seatTotal}` : "—"),
          },
          {
            key: "apps",
            header: "Installed applications",
            render: (r) =>
              r.installedApplicationNames.length > 0 ? r.installedApplicationNames.join(", ") : "—",
          },
          {
            key: "diagnostics",
            header: "Diagnostics",
            render: (r) => (
              <details>
                <summary className="cursor-pointer text-xs text-muted-foreground">Details</summary>
                <p className="mt-1 font-mono text-xs text-muted-foreground">Product ID: {r.product_id}</p>
                <p className="font-mono text-xs text-muted-foreground">Subscription ID: {r.id}</p>
                {r.plan_id && (
                  <p className="font-mono text-xs text-muted-foreground">Plan ID: {r.plan_id}</p>
                )}
              </details>
            ),
          },
          {
            key: "actions",
            header: "Actions",
            render: (r) => (
              <div className="flex flex-wrap gap-1">
                {r.status === "paused" && (
                  <Button size="sm" variant="outline" onClick={() => runAction(r.id, "resume")}>
                    Resume
                  </Button>
                )}
                {r.status === "active" && (
                  <Button size="sm" variant="outline" onClick={() => runAction(r.id, "pause")}>
                    Pause
                  </Button>
                )}
                {(r.status === "active" || r.status === "trialing") && (
                  <Button size="sm" variant="outline" onClick={() => runAction(r.id, "suspend")}>
                    Suspend
                  </Button>
                )}
                {r.status === "trialing" && (
                  <Button size="sm" variant="outline" onClick={() => runAction(r.id, "activate")}>
                    Convert
                  </Button>
                )}
              </div>
            ),
          },
        ]}
        rows={filtered}
        emptyMessage="No subscriptions yet. Provision a product from the Products catalogue."
      />
    </CommerceAdminShell>
  );
}
