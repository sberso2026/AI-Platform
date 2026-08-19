"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { PageMain } from "@/components/layout/page-main";
import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
  SectionHeader,
  StatusChip,
} from "@rtb/ui";
import { parseApiJsonResponse } from "@/lib/api/parse-json-response";
import type { BusinessCustomer360, MoneyJson } from "@rtb/types";

function moneyLabel(value: MoneyJson | null | undefined, fallback = "Unknown"): string {
  if (!value || value.minor === "") return fallback;
  const scale = value.scale ?? 2;
  const denom = 10 ** scale;
  const major = Number(value.minor) / denom;
  if (!Number.isFinite(major)) return fallback;
  return `${value.currency} ${major.toLocaleString(undefined, { minimumFractionDigits: scale, maximumFractionDigits: scale })}`;
}

export default function Customer360Page() {
  const params = useParams<{ id: string }>();
  const id = String(params?.id ?? "");
  const [data, setData] = useState<BusinessCustomer360 | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    const parsed = await parseApiJsonResponse<BusinessCustomer360>(
      await fetch(`/api/business/customers/detail?id=${encodeURIComponent(id)}`),
    );
    if (!parsed.ok) {
      setError(parsed.errorMessage ?? "Access denied");
      setData(null);
      return;
    }
    setError(null);
    setData(parsed.data);
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const customer = data?.customer;

  return (
    <>
      <Header
        title={customer?.organisationName ?? "Customer 360"}
        description="Aggregated evidence from Growth, Revenue Execution, and Financial attribution. Not a CRM record."
        showEngineeringChrome={false}
      />
      <PageMain data-testid="bos-customer-360">
        <p className="mb-4 text-sm">
          <Link href="/business/customers" className="font-semibold text-blue-700 hover:underline">
            Back to customers
          </Link>
        </p>
        {error && <p className="mb-4 text-[0.9375rem] text-destructive">{error}</p>}
        {!data && !error && <p className="text-sm text-slate-600">Loading customer evidence…</p>}
        {data && customer && (
          <div className="space-y-8">
            <section data-testid="bos-customer-overview">
              <SectionHeader title="Overview" description="Organisation identity, status, and relationship owner." />
              <Card className="mt-4">
                <CardContent className="space-y-1 p-4 text-sm text-slate-600">
                  <p>Trading name: {customer.tradingName ?? "Unknown"}</p>
                  <p>Status: <StatusChip value={customer.customerStatus} /></p>
                  <p>Owner: {customer.relationshipOwner ?? "Unknown"}</p>
                  <p>Industry / geography: {customer.industry ?? "Unknown"} / {customer.geography ?? "Unknown"}</p>
                  <p>Domain: {customer.domain ?? "Unknown"}</p>
                  <p>Acquired: {customer.acquiredAt ?? "Unknown"}</p>
                  <p>Source: {customer.sourceType}{customer.sourceRef ? ` · ${customer.sourceRef}` : ""}</p>
                  {customer.isDemo && <Badge variant="secondary">Demo</Badge>}
                </CardContent>
              </Card>
            </section>

            <section data-testid="bos-customer-commercial">
              <SectionHeader title="Commercial" description="Linked growth evidence. Original lead and opportunity history is retained." />
              <div className="mt-4 space-y-2 text-sm text-slate-600">
                <p>Linked leads: {data.leads.length}</p>
                {data.leads.map((lead) => (
                  <Card key={lead.id}>
                    <CardContent className="p-4">
                      {lead.organisationName} · {lead.qualificationStatus}
                    </CardContent>
                  </Card>
                ))}
                {data.leads.length === 0 && <EmptyState title="No linked leads" description="Conversion is explicit and non-destructive." />}
              </div>
            </section>

            <section data-testid="bos-customer-financial">
              <SectionHeader title="Financial" description="Attributed facts use exact minor units. Missing cost leaves profitability unknown." />
              <Card className="mt-4">
                <CardContent className="space-y-1 p-4 text-sm text-slate-600">
                  <p>Outstanding: {moneyLabel(data.payment.outstanding)}</p>
                  <p>Overdue: {moneyLabel(data.payment.overdue)}</p>
                  <p>Overdue ratio: {data.payment.overdueRatioBps ?? "Unknown"} bps</p>
                  <p>Average payment delay: {data.payment.averagePaymentDelayDays ?? "Unknown"} days</p>
                  <p>{data.payment.disclaimer}</p>
                  {data.financialFacts.map((fact) => (
                    <p key={fact.id}>
                      {fact.periodEnd}: revenue {fact.revenueMinor ?? "Unknown"} · cost {fact.directCostMinor ?? "Unknown"} ·
                      contribution {fact.grossContributionMinor ?? "Unknown"} {fact.currency}
                    </p>
                  ))}
                </CardContent>
              </Card>
            </section>

            <section data-testid="bos-customer-opportunities">
              <SectionHeader title="Opportunities" description="Current and historical opportunities linked to this customer." />
              <div className="mt-4 space-y-2">
                {data.opportunities.map((opp) => (
                  <Card key={opp.id}>
                    <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 p-4 pb-2">
                      <CardTitle className="text-sm">{opp.name}</CardTitle>
                      <StatusChip value={opp.stage} />
                    </CardHeader>
                  </Card>
                ))}
                {data.opportunities.length === 0 && <EmptyState title="No linked opportunities" description="Won work is linked only when the customer mapping is clear." />}
              </div>
            </section>

            <section data-testid="bos-customer-proposals">
              <SectionHeader title="Proposals" description="Revenue Execution artefacts for linked opportunities." />
              <div className="mt-4 space-y-2 text-sm text-slate-600">
                {data.proposals.map((proposal) => (
                  <Card key={proposal.id}>
                    <CardContent className="p-4">
                      {proposal.title} · {proposal.status}
                    </CardContent>
                  </Card>
                ))}
                    {data.pricing.map((row) => (
                      <p key={row.id}>
                        Pricing scenario {row.scenarioName}: contribution {row.grossProfitMinor ?? "Unknown"}
                      </p>
                    ))}
                {data.proposals.length === 0 && <EmptyState title="No proposals" description="Proposal history is aggregated, not duplicated." />}
              </div>
            </section>

            <section data-testid="bos-customer-relationship">
              <SectionHeader title="Relationship" description="Organisation-linked contacts only. Suppressed contacts keep suppression status." />
              <div className="mt-4 space-y-2 text-sm text-slate-600">
                {data.contacts.map((contact) => (
                  <Card key={contact.id}>
                    <CardContent className="p-4">
                      <p>{contact.suppressed ? "Suppressed contact" : contact.name}</p>
                      <p>{contact.role ?? "Unknown role"}</p>
                      {!contact.suppressed && <p>{contact.businessEmail ?? "No business email"}</p>}
                      {contact.suppressed && <Badge variant="secondary">Suppressed</Badge>}
                    </CardContent>
                  </Card>
                ))}
                {data.contacts.length === 0 && <EmptyState title="No contacts" description="Customers do not require a personal contact." />}
              </div>
            </section>

            <section data-testid="bos-customer-risks">
              <SectionHeader title="Risks / signals" description="Health is deterministic and versioned. Retention indicators are not churn probability." />
              <Card className="mt-4">
                <CardContent className="space-y-1 p-4 text-sm text-slate-600">
                  <p>
                    Health: {data.health.status}
                    {data.health.score !== null ? ` (${data.health.score})` : " (score withheld)"} · {data.health.version}
                  </p>
                  <p>{data.health.disclaimer}</p>
                  {data.health.components.map((component) => (
                    <p key={component.id}>
                      {component.label}: {component.status}
                      {component.score !== null ? ` (${component.score}/${component.weight})` : ""} — {component.evidence}
                    </p>
                  ))}
                </CardContent>
              </Card>
            </section>

            <section data-testid="bos-customer-recommendations">
              <SectionHeader title="Recommendations" description="Advisory only. BOS-5 does not contact customers or write to an external CRM." />
              <Card className="mt-4">
                <CardContent className="p-4 text-sm text-slate-600">
                  <p>Renewal intelligence: {data.renewal.reason}</p>
                  <p>Account expansion: {data.expansion.reason}</p>
                  <p>Operations: {data.operations.reason}</p>
                </CardContent>
              </Card>
            </section>

            <section data-testid="bos-customer-evidence">
              <SectionHeader title="Evidence / data quality" description="Source systems, freshness, and missing attribution." />
              <Card className="mt-4">
                <CardContent className="space-y-1 p-4 text-sm text-slate-600">
                  <p>Sources: {data.dataQuality.sourceTypes.join(", ") || "Unknown"}</p>
                  <p>Freshness: {data.dataQuality.freshness ?? "Unknown"}</p>
                  <p>
                    Missing financial attribution:{" "}
                    {data.dataQuality.missingFinancialAttribution.join(", ") || "None listed"}
                  </p>
                  <p>Unknown health components: {data.dataQuality.unknownHealthComponents.join(", ") || "None"}</p>
                  <p>Personal contacts (non-suppressed): {data.dataQuality.personalContactCount}</p>
                </CardContent>
              </Card>
            </section>
          </div>
        )}
      </PageMain>
    </>
  );
}
