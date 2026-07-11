"use client";

import { useEffect, useState } from "react";
import { Badge, Card, CardContent, CardHeader, CardTitle } from "@rtb/ui";
import type { InvoiceAdministrationView, SubscriptionBillingView } from "@rtb/platform-core";
import { CommerceAdminShell } from "@/components/commerce/commerce-admin-shell";
import { CommerceDataTable } from "@/components/commerce/commerce-data-table";

export default function SubscriptionBillingPage() {
  const [subscriptions, setSubscriptions] = useState<SubscriptionBillingView[]>([]);
  const [invoices, setInvoices] = useState<InvoiceAdministrationView[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/platform/administration/subscription-billing")
      .then(async (r) => {
        const json = await r.json();
        if (!r.ok) throw new Error(json.error ?? "Unable to load billing data");
        setSubscriptions(json.data?.subscriptions ?? []);
        setInvoices(json.data?.invoices ?? []);
        setError(null);
      })
      .catch((e) => setError(e.message));
  }, []);

  return (
    <CommerceAdminShell
      title="Subscription & Billing"
      description="Current subscriptions, renewal information, billing accounts, and invoice history."
    >
      {error && <p className="mb-3 text-sm text-destructive">{error}</p>}

      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Active subscriptions</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-600">
            {subscriptions.length} subscription(s) on record
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Billing providers</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-600">
            Manual enterprise invoicing · Xero · Stripe · Future providers
          </CardContent>
        </Card>
      </div>

      <CommerceDataTable
        columns={[
          { key: "product", header: "Product", render: (r) => r.productName },
          { key: "plan", header: "Plan", render: (r) => r.planName ?? "—" },
          { key: "interval", header: "Interval", render: (r) => r.billingInterval ?? "—" },
          {
            key: "status",
            header: "Status",
            render: (r) => <Badge variant="secondary">{r.billingStatus}</Badge>,
          },
          { key: "renewal", header: "Renewal", render: (r) => r.renewalDate ?? "—" },
          {
            key: "value",
            header: "Contract value",
            render: (r) =>
              r.contractValueCents !== undefined
                ? `${(r.contractValueCents / 100).toFixed(2)} ${r.currency}`
                : "—",
          },
        ]}
        rows={subscriptions.map((s) => ({ ...s, id: s.id }))}
        emptyMessage="No subscriptions for this tenant."
      />

      <div className="mt-8">
        <h2 className="mb-3 text-lg font-semibold">Invoice history</h2>
        <CommerceDataTable
          columns={[
            { key: "number", header: "Invoice", render: (r) => r.invoiceNumber },
            { key: "status", header: "Status", render: (r) => <Badge variant="secondary">{r.status}</Badge> },
            {
              key: "total",
              header: "Total",
              render: (r) => `${(r.totalCents / 100).toFixed(2)} ${r.currency}`,
            },
            { key: "due", header: "Due", render: (r) => r.dueAt ?? "—" },
            { key: "provider", header: "Provider", render: (r) => r.provider },
          ]}
          rows={invoices}
          emptyMessage="No invoices generated yet."
        />
      </div>
    </CommerceAdminShell>
  );
}
