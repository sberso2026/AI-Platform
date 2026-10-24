"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge } from "@rtb/ui";
import type { LicenceSeatPoolView } from "@rtb/platform-core";
import type { CommercialSeatPool } from "@rtb/types";
import { CommerceAdminShell } from "@/components/commerce/commerce-admin-shell";
import { CommerceDataTable } from "@/components/commerce/commerce-data-table";
import { LicenseIssueDialog } from "@/components/commerce/license-actions";
import { SeatPoolActions } from "@/components/commerce/seat-actions";

export default function LicensesSeatsPage() {
  const [pools, setPools] = useState<LicenceSeatPoolView[]>([]);
  const [seatPools, setSeatPools] = useState<CommercialSeatPool[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedPoolId, setExpandedPoolId] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/platform/administration/licenses-seats").then(async (r) => {
        const json = await r.json();
        if (!r.ok) throw new Error(json.error ?? "Failed to load");
        return json.data?.pools ?? [];
      }),
      fetch("/api/platform/commerce/seats").then(async (r) => {
        const json = await r.json();
        if (!r.ok) throw new Error(json.error ?? "Failed to load seat pools");
        return (json.data ?? []) as CommercialSeatPool[];
      }),
    ])
      .then(([nextPools, nextSeatPools]) => {
        setPools(nextPools);
        setSeatPools(nextSeatPools);
        setError(null);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <CommerceAdminShell
      title="Licences & Seats"
      description="Product and application licences, seat pools, assignments, and entitlements."
      actions={
        <LicenseIssueDialog subscriptions={[]} products={[]} onIssued={load} />
      }
    >
      {error && <p className="mb-3 text-sm text-destructive">{error}</p>}
      {loading && <p className="mb-3 text-sm text-muted-foreground">Loading…</p>}

      <CommerceDataTable
        columns={[
          { key: "product", header: "Product", render: (r) => r.productName ?? r.productId.slice(0, 8) },
          { key: "seatType", header: "Seat type", render: (r) => r.seatType },
          {
            key: "licence",
            header: "Licence",
            render: (r) => <Badge variant="secondary">{r.licenceStatus}</Badge>,
          },
          {
            key: "seats",
            header: "Seats",
            render: (r) => `${r.assignedSeats} / ${r.seatLimit}`,
          },
          { key: "available", header: "Available", render: (r) => r.availableSeats },
          { key: "validUntil", header: "Valid until", render: (r) => r.validUntil ?? "—" },
        ]}
        rows={pools}
        emptyMessage="No licence or seat pools configured."
      />

      {seatPools.length > 0 && (
        <div className="mt-8 space-y-3">
          <h2 className="text-sm font-semibold text-slate-800">Seat assignment</h2>
          <p className="text-sm text-muted-foreground">
            Assign or remove named users through the certified Commerce seat APIs. Removing a seat
            revokes access immediately.
          </p>
          <CommerceDataTable
            columns={[
              { key: "pool", header: "Pool", render: (r) => r.pool_name || r.id.slice(0, 8) },
              { key: "assigned", header: "Assigned", render: (r) => r.assigned_seats },
              { key: "total", header: "Licensed", render: (r) => r.total_seats },
              {
                key: "available",
                header: "Available",
                render: (r) => r.total_seats - r.assigned_seats,
              },
              {
                key: "actions",
                header: "Actions",
                render: (r) => (
                  <button
                    type="button"
                    className="text-sm text-blue-600 hover:underline"
                    onClick={() => setExpandedPoolId(expandedPoolId === r.id ? null : r.id)}
                  >
                    {expandedPoolId === r.id ? "Hide" : "Manage seats"}
                  </button>
                ),
              },
            ]}
            rows={seatPools}
            emptyMessage="No seat pools configured."
          />
          {expandedPoolId &&
            seatPools
              .filter((pool) => pool.id === expandedPoolId)
              .map((pool) => (
                <SeatPoolActions key={pool.id} pool={pool} onChanged={load} />
              ))}
        </div>
      )}
    </CommerceAdminShell>
  );
}
