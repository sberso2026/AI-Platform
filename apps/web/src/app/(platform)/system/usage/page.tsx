"use client";

import { useEffect, useState } from "react";
import type { CommercialUsageAggregate } from "@rtb/types";
import type { UsageMetricView } from "@rtb/platform-core";
import { mapUsageMetrics } from "@rtb/platform-core";
import { CommerceAdminShell } from "@/components/commerce/commerce-admin-shell";
import { CommerceDataTable } from "@/components/commerce/commerce-data-table";
import { MetricCard } from "@rtb/ui";

export default function UsagePage() {
  const [metrics, setMetrics] = useState<UsageMetricView[]>([]);

  useEffect(() => {
    fetch("/api/platform/commerce/usage")
      .then((r) => r.json())
      .then((json) => {
        const aggregates = (json.data?.aggregates ?? []) as CommercialUsageAggregate[];
        setMetrics(mapUsageMetrics(aggregates));
      })
      .catch(() => setMetrics([]));
  }, []);

  const alertCount = metrics.filter((m) => m.thresholdAlert).length;

  return (
    <CommerceAdminShell
      title="Usage"
      description="Tenant-scoped consumption versus included allowances for the current billing period."
    >
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <MetricCard label="Metrics tracked" value={metrics.length} tone="blue" />
        <MetricCard label="Threshold alerts" value={alertCount} tone={alertCount ? "amber" : "green"} />
        <MetricCard
          label="Billing period"
          value="Current month"
          tone="slate"
        />
      </div>

      <CommerceDataTable
        columns={[
          { key: "metric", header: "Metric", render: (r) => r.name },
          { key: "allowance", header: "Included", render: (r) => r.includedAllowance ?? "—" },
          { key: "consumed", header: "Consumed", render: (r) => r.consumed },
          { key: "remaining", header: "Remaining", render: (r) => r.remaining ?? "—" },
          { key: "projected", header: "Projected", render: (r) => r.projectedPeriodUsage ?? "—" },
          { key: "unit", header: "Unit", render: (r) => r.unit },
        ]}
        rows={metrics.map((m) => ({ ...m, id: m.metricKey }))}
        emptyMessage="No usage recorded for the current billing period."
      />
    </CommerceAdminShell>
  );
}
