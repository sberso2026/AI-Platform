"use client";

import { useEffect, useState } from "react";
import type { CommercialUsageAggregate } from "@rtb/types";
import { CommerceAdminShell } from "@/components/commerce/commerce-admin-shell";
import { CommerceDataTable } from "@/components/commerce/commerce-data-table";

export default function UsagePage() {
  const [aggregates, setAggregates] = useState<CommercialUsageAggregate[]>([]);

  useEffect(() => {
    fetch("/api/platform/commerce/usage")
      .then((r) => r.json())
      .then((json) => setAggregates(json.data?.aggregates ?? []))
      .catch(() => setAggregates([]));
  }, []);

  return (
    <CommerceAdminShell
      title="Usage"
      description="Metered usage across AI, storage, documents, API calls, and extensible metrics."
    >
      <CommerceDataTable
        columns={[
          { key: "metric", header: "Metric", render: (r) => r.name },
          { key: "quantity", header: "Quantity", render: (r) => r.total_quantity },
          { key: "unit", header: "Unit", render: (r) => r.unit },
        ]}
        rows={aggregates.map((a) => ({ ...a, id: a.metric_key }))}
        emptyMessage="No usage recorded for the current billing period."
      />
    </CommerceAdminShell>
  );
}
