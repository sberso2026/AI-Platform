"use client";

import { useEffect, useState } from "react";
import type { CommerceAnalyticsSummary } from "@rtb/types";
import { MetricCard } from "@rtb/ui";
import { Activity, CreditCard, KeyRound, Package } from "lucide-react";
import { CommerceAdminShell } from "@/components/commerce/commerce-admin-shell";

export default function AnalyticsPage() {
  const [summary, setSummary] = useState<CommerceAnalyticsSummary | null>(null);

  useEffect(() => {
    fetch("/api/platform/commerce/analytics")
      .then((r) => r.json())
      .then((json) => setSummary(json.data ?? null))
      .catch(() => setSummary(null));
  }, []);

  return (
    <CommerceAdminShell
      title="Analytics"
      description="Commerce analytics — subscriptions, seats, installations, and revenue."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <MetricCard label="Active Subscriptions" value={summary?.active_subscriptions ?? 0} icon={<Package className="h-5 w-5" />} />
        <MetricCard label="Trialing" value={summary?.trialing_subscriptions ?? 0} icon={<Activity className="h-5 w-5" />} tone="amber" />
        <MetricCard label="Seats Assigned" value={summary?.total_seats_assigned ?? 0} icon={<KeyRound className="h-5 w-5" />} tone="green" />
        <MetricCard label="Healthy Installations" value={summary?.healthy_installations ?? 0} icon={<Activity className="h-5 w-5" />} tone="green" />
        <MetricCard label="MRR (cents)" value={summary?.mrr_cents ?? 0} icon={<CreditCard className="h-5 w-5" />} tone="blue" />
        <MetricCard label="Usage Metrics" value={summary?.usage_metrics_recorded ?? 0} icon={<Activity className="h-5 w-5" />} tone="slate" />
      </div>
    </CommerceAdminShell>
  );
}
