"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Badge } from "@rtb/ui";
import type { CommercialLicense, CommercialSubscription } from "@rtb/types";
import { CommerceAdminShell } from "@/components/commerce/commerce-admin-shell";
import { CommerceDataTable } from "@/components/commerce/commerce-data-table";
import { CommerceFilterSelect } from "@/components/commerce/commerce-filters";
import { LicenseIssueDialog, LicenseRowActions } from "@/components/commerce/license-actions";

type ProductRecord = { id: string; slug: string; name: string };

export default function LicensesPage() {
  const [rows, setRows] = useState<CommercialLicense[]>([]);
  const [subscriptions, setSubscriptions] = useState<CommercialSubscription[]>([]);
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [productFilter, setProductFilter] = useState("all");
  const [workspaceFilter, setWorkspaceFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/platform/commerce/licenses").then((r) => r.json()),
      fetch("/api/platform/commerce/subscriptions").then((r) => r.json()),
      fetch("/api/platform/commerce/products").then((r) => r.json()),
    ])
      .then(([licencesJson, subsJson, productsJson]) => {
        setRows(licencesJson.data ?? []);
        setSubscriptions(subsJson.data ?? []);
        setProducts(productsJson.data ?? []);
        setError(null);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const workspaceOptions = useMemo(() => {
    const ids = new Set<string>();
    for (const r of rows) {
      if (r.workspace_id) ids.add(r.workspace_id);
    }
    return [
      { value: "all", label: "All workspaces" },
      ...Array.from(ids).map((id) => ({ value: id, label: id.slice(0, 8) })),
    ];
  }, [rows]);

  const productNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of products) map.set(p.id, p.name);
    return map;
  }, [products]);

  const filtered = rows.filter((r) => {
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (typeFilter !== "all" && r.license_type !== typeFilter) return false;
    if (productFilter !== "all" && r.product_id !== productFilter) return false;
    if (workspaceFilter !== "all" && r.workspace_id !== workspaceFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.license_type.includes(q) ||
      r.status.includes(q) ||
      r.id.includes(q) ||
      (r.application_key?.includes(q) ?? false)
    );
  });

  return (
    <CommerceAdminShell
      title="Licences"
      description="Product, application, feature, and workspace licence management."
      searchPlaceholder="Search licences…"
      onSearch={setSearch}
      filters={
        <>
          <CommerceFilterSelect
            label="Status"
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: "all", label: "All statuses" },
              { value: "active", label: "Active" },
              { value: "suspended", label: "Suspended" },
              { value: "revoked", label: "Revoked" },
              { value: "expired", label: "Expired" },
            ]}
          />
          <CommerceFilterSelect
            label="Type"
            value={typeFilter}
            onChange={setTypeFilter}
            options={[
              { value: "all", label: "All types" },
              { value: "product", label: "Product" },
              { value: "application", label: "Application" },
              { value: "feature", label: "Feature" },
              { value: "workspace", label: "Workspace" },
            ]}
          />
          <CommerceFilterSelect
            label="Product"
            value={productFilter}
            onChange={setProductFilter}
            options={[
              { value: "all", label: "All products" },
              ...products.map((p) => ({ value: p.id, label: p.name })),
            ]}
          />
          <CommerceFilterSelect
            label="Workspace"
            value={workspaceFilter}
            onChange={setWorkspaceFilter}
            options={workspaceOptions}
          />
        </>
      }
      actions={
        <LicenseIssueDialog subscriptions={subscriptions} products={products} onIssued={load} />
      }
    >
      {error && <p className="mb-3 text-sm text-destructive">{error}</p>}
      {loading && <p className="mb-3 text-sm text-muted-foreground">Loading…</p>}
      <CommerceDataTable
        columns={[
          { key: "type", header: "Type", render: (r) => r.license_type },
          { key: "status", header: "Status", render: (r) => <Badge variant="secondary">{r.status}</Badge> },
          {
            key: "product",
            header: "Product",
            render: (r) =>
              r.product_id
                ? (productNameById.get(r.product_id) ?? r.product_id.slice(0, 8))
                : (r.application_key ?? "—"),
          },
          { key: "workspace", header: "Workspace", render: (r) => r.workspace_id?.slice(0, 8) ?? "—" },
          { key: "seats", header: "Max Seats", render: (r) => r.max_seats ?? "—" },
          {
            key: "actions",
            header: "Actions",
            render: (r) => <LicenseRowActions license={r} onChanged={load} />,
          },
        ]}
        rows={filtered}
        emptyMessage="No licences provisioned for this tenant."
      />
    </CommerceAdminShell>
  );
}
