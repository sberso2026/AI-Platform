"use client";

import { useEffect, useState } from "react";
import { Badge } from "@rtb/ui";
import type { CommercialBillingAccount, CommercialInvoice } from "@rtb/types";
import { CommerceAdminShell } from "@/components/commerce/commerce-admin-shell";
import { CommerceDataTable } from "@/components/commerce/commerce-data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@rtb/ui";

export default function BillingPage() {
  const [accounts, setAccounts] = useState<CommercialBillingAccount[]>([]);
  const [invoices, setInvoices] = useState<CommercialInvoice[]>([]);

  useEffect(() => {
    fetch("/api/platform/commerce/billing")
      .then((r) => r.json())
      .then((json) => {
        setAccounts(json.data?.accounts ?? []);
        setInvoices(json.data?.invoices ?? []);
      })
      .catch(() => undefined);
  }, []);

  return (
    <CommerceAdminShell
      title="Billing"
      description="Billing accounts, invoices, payment methods, and provider integration."
    >
      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Billing Accounts</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-600">
            {accounts.length > 0
              ? `${accounts.length} account(s) configured`
              : "No billing accounts yet. Stripe and Xero integration reserved."}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Providers</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-600">
            Stripe · Xero · Manual invoice · Purchase orders
          </CardContent>
        </Card>
      </div>

      <CommerceDataTable
        columns={[
          { key: "number", header: "Invoice", render: (r) => r.invoice_number },
          { key: "status", header: "Status", render: (r) => <Badge variant="secondary">{r.status}</Badge> },
          { key: "total", header: "Total", render: (r) => `${(r.total_cents / 100).toFixed(2)} ${r.currency}` },
          { key: "due", header: "Due", render: (r) => r.due_at ?? "—" },
        ]}
        rows={invoices}
        emptyMessage="No invoices generated yet."
      />
    </CommerceAdminShell>
  );
}
