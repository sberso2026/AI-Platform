"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Badge } from "@rtb/ui";
import type { CommerceAuditEntry } from "@rtb/platform-commerce";
import { CommerceAdminShell } from "@/components/commerce/commerce-admin-shell";
import { CommerceDataTable } from "@/components/commerce/commerce-data-table";
import { CommerceFilterSelect } from "@/components/commerce/commerce-filters";

export default function CommerceAuditPage() {
  const [rows, setRows] = useState<CommerceAuditEntry[]>([]);
  const [sourceFilter, setSourceFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (sourceFilter !== "all") params.set("source", sourceFilter);
    fetch(`/api/platform/commerce/audit?${params}`)
      .then((r) => r.json())
      .then((json) => {
        setRows(json.data ?? []);
        setError(null);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [sourceFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    if (!search) return rows;
    const q = search.toLowerCase();
    return rows.filter(
      (r) =>
        r.eventType.toLowerCase().includes(q) ||
        r.aggregateId.toLowerCase().includes(q) ||
        (r.detail?.toLowerCase().includes(q) ?? false)
    );
  }, [rows, search]);

  return (
    <CommerceAdminShell
      title="Commerce Audit"
      description="Subscription and licence lifecycle events for this tenant."
      searchPlaceholder="Search events…"
      onSearch={setSearch}
      filters={
        <CommerceFilterSelect
          label="Source"
          value={sourceFilter}
          onChange={setSourceFilter}
          options={[
            { value: "all", label: "All events" },
            { value: "subscription", label: "Subscriptions" },
            { value: "licence", label: "Licences" },
          ]}
        />
      }
    >
      {error && <p className="mb-3 text-sm text-destructive">{error}</p>}
      {loading && <p className="mb-3 text-sm text-muted-foreground">Loading…</p>}
      <CommerceDataTable
        columns={[
          {
            key: "source",
            header: "Source",
            render: (r) => <Badge variant="secondary">{r.source}</Badge>,
          },
          { key: "event", header: "Event", render: (r) => r.eventType },
          { key: "aggregate", header: "Aggregate", render: (r) => r.aggregateId.slice(0, 8) },
          { key: "detail", header: "Detail", render: (r) => r.detail ?? "—" },
          {
            key: "actor",
            header: "Actor",
            render: (r) => r.actorUserId?.slice(0, 8) ?? "—",
          },
          {
            key: "when",
            header: "When",
            render: (r) => new Date(r.occurredAt).toLocaleString(),
          },
        ]}
        rows={filtered}
        emptyMessage="No commerce audit events recorded yet."
      />
    </CommerceAdminShell>
  );
}
