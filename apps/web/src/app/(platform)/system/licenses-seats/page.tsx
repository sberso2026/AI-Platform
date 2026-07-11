"use client";

import { useEffect, useState } from "react";
import { Badge } from "@rtb/ui";
import type { LicenceSeatPoolView } from "@rtb/platform-core";
import { CommerceAdminShell } from "@/components/commerce/commerce-admin-shell";
import { CommerceDataTable } from "@/components/commerce/commerce-data-table";
import { LicenseIssueDialog } from "@/components/commerce/license-actions";

export default function LicensesSeatsPage() {
  const [pools, setPools] = useState<LicenceSeatPoolView[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = () => {
    setLoading(true);
    fetch("/api/platform/administration/licenses-seats")
      .then(async (r) => {
        const json = await r.json();
        if (!r.ok) throw new Error(json.error ?? "Failed to load");
        setPools(json.data?.pools ?? []);
        setError(null);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

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

      <p className="mt-6 text-sm text-muted-foreground">
        Seat assignment and removal use certified Commerce services. Removing a seat revokes access
        immediately.
      </p>
    </CommerceAdminShell>
  );
}
