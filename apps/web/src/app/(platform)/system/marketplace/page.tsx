"use client";

import { useEffect, useState } from "react";
import { Badge } from "@rtb/ui";
import { CommerceAdminShell } from "@/components/commerce/commerce-admin-shell";
import { CommerceDataTable } from "@/components/commerce/commerce-data-table";

type Listing = { id: string; product_id: string; listing_status: string; visibility: string };

export default function MarketplacePage() {
  const [listings, setListings] = useState<Listing[]>([]);

  useEffect(() => {
    fetch("/api/platform/commerce/marketplace")
      .then((r) => r.json())
      .then((json) => setListings(json.data?.listings ?? []))
      .catch(() => setListings([]));
  }, []);

  return (
    <CommerceAdminShell
      title="Marketplace"
      description="RTB and partner products, verified publishers, and private marketplace extensions."
    >
      <CommerceDataTable
        columns={[
          { key: "product", header: "Product", render: (r) => r.product_id.slice(0, 8) },
          { key: "status", header: "Listing", render: (r) => <Badge variant="secondary">{r.listing_status}</Badge> },
          { key: "visibility", header: "Visibility", render: (r) => r.visibility },
        ]}
        rows={listings}
        emptyMessage="No marketplace listings published."
      />
    </CommerceAdminShell>
  );
}
