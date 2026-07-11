"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  MetricCard,
} from "@rtb/ui";
import type {
  GrowthCreditAccountView,
  GrowthCreditTransactionView,
} from "@rtb/platform-core";
import { GROWTH_CREDIT_DISCLAIMERS } from "@rtb/platform-core";
import { CommerceAdminShell } from "@/components/commerce/commerce-admin-shell";
import { CommerceDataTable } from "@/components/commerce/commerce-data-table";
import { Sparkles } from "lucide-react";

export default function GrowthCreditsPage() {
  const [account, setAccount] = useState<GrowthCreditAccountView | null>(null);
  const [transactions, setTransactions] = useState<GrowthCreditTransactionView[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/platform/administration/growth-credits")
      .then(async (r) => {
        const json = await r.json();
        if (!r.ok) throw new Error(json.error ?? "Unable to load Growth Credits");
        setAccount(json.data?.account ?? null);
        setTransactions(json.data?.transactions ?? []);
      })
      .catch((e) => setError(e.message));
  }, []);

  return (
    <CommerceAdminShell
      title="Growth Credits"
      description="Programme credits earned through customer participation — not cash or equity."
    >
      {error && <p className="mb-3 text-sm text-destructive">{error}</p>}

      <Card className="mb-6 border-amber-200 bg-amber-50/50">
        <CardHeader>
          <CardTitle className="text-base">Important programme terms</CardTitle>
          <CardDescription>Growth Credits programme disclosure</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
            {GROWTH_CREDIT_DISCLAIMERS.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard
          label="Available balance"
          value={account?.availableBalance ?? 0}
          icon={<Sparkles className="h-5 w-5" />}
          tone="amber"
        />
        <MetricCard label="Reserved" value={account?.reservedBalance ?? 0} tone="slate" />
        <MetricCard label="Expiring soon" value={account?.expiringSoon ?? 0} tone="amber" />
        <MetricCard label="Lifetime earned" value={account?.lifetimeEarned ?? 0} tone="green" />
        <MetricCard label="Lifetime redeemed" value={account?.lifetimeRedeemed ?? 0} tone="blue" />
      </div>

      <CommerceDataTable
        columns={[
          { key: "type", header: "Type", render: (r) => r.transactionType },
          { key: "amount", header: "Amount", render: (r) => r.amount },
          { key: "source", header: "Source", render: (r) => r.source ?? "—" },
          { key: "description", header: "Description", render: (r) => r.description ?? "—" },
          { key: "expires", header: "Expires", render: (r) => r.expiresAt ?? "—" },
          {
            key: "date",
            header: "Date",
            render: (r) => new Date(r.createdAt).toLocaleDateString(),
          },
        ]}
        rows={transactions}
        emptyMessage="No Growth Credit transactions yet."
      />
    </CommerceAdminShell>
  );
}
