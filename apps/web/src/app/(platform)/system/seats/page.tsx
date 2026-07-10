"use client";

import { useCallback, useEffect, useState } from "react";
import type { CommercialSeatPool } from "@rtb/types";
import { CommerceAdminShell } from "@/components/commerce/commerce-admin-shell";
import { CommerceDataTable } from "@/components/commerce/commerce-data-table";
import { SeatPoolActions } from "@/components/commerce/seat-actions";

export default function SeatsPage() {
  const [rows, setRows] = useState<CommercialSeatPool[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedPoolId, setExpandedPoolId] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/platform/commerce/seats")
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

  return (
    <CommerceAdminShell
      title="Seats"
      description="Seat pools, assignments, and workspace allocation."
    >
      {error && <p className="mb-3 text-sm text-destructive">{error}</p>}
      {loading && <p className="mb-3 text-sm text-muted-foreground">Loading…</p>}
      <CommerceDataTable
        columns={[
          { key: "pool", header: "Pool", render: (r) => r.pool_name },
          { key: "assigned", header: "Assigned", render: (r) => r.assigned_seats },
          { key: "total", header: "Total", render: (r) => r.total_seats },
          { key: "available", header: "Available", render: (r) => r.total_seats - r.assigned_seats },
          {
            key: "actions",
            header: "Actions",
            render: (r) => (
              <button
                type="button"
                className="text-sm text-blue-600 hover:underline"
                onClick={() => setExpandedPoolId(expandedPoolId === r.id ? null : r.id)}
              >
                {expandedPoolId === r.id ? "Hide" : "Manage"}
              </button>
            ),
          },
        ]}
        rows={rows}
        emptyMessage="No seat pools configured."
      />
      {expandedPoolId && (
        <div className="mt-4">
          {rows
            .filter((p) => p.id === expandedPoolId)
            .map((pool) => (
              <SeatPoolActions key={pool.id} pool={pool} onChanged={load} />
            ))}
        </div>
      )}
    </CommerceAdminShell>
  );
}
