import type {
  BusinessCustomer,
  BusinessCustomerConcentration,
  BusinessCustomerFinancialFact,
} from "@rtb/types";
import { CUSTOMER_CONCENTRATION_VERSION } from "@rtb/types";
import {
  CurrencyMismatchError,
  add,
  money,
  ratioBps,
  serializeMoney,
  type MoneyAmount,
} from "../finance/money";

export const CONCENTRATION_DISCLAIMER =
  "Customer concentration uses attributed revenue for one reporting period and one currency only. Multi-currency or missing facts remain unknown.";

export function computeConcentration(
  customers: BusinessCustomer[],
  facts: BusinessCustomerFinancialFact[],
): BusinessCustomerConcentration {
  const unknownReasons: string[] = [];
  const liveFacts = facts.filter((row) => {
    const customer = customers.find((c) => c.id === row.customerId);
    return customer && !customer.archivedAt && customer.customerStatus !== "archived";
  });
  if (!liveFacts.length) {
    return empty(["no_financial_facts"]);
  }
  const periodEnd = [...liveFacts].sort((a, b) => b.periodEnd.localeCompare(a.periodEnd))[0].periodEnd;
  const periodFacts = liveFacts.filter((row) => row.periodEnd === periodEnd);
  const currencies = new Set(periodFacts.map((row) => row.currency.toUpperCase()));
  if (currencies.size > 1) return empty(["currency_mismatch"], periodEnd);

  try {
    const byCustomer = new Map<string, MoneyAmount>();
    for (const fact of periodFacts) {
      const amount = money(fact.revenueMinor, fact.currency, fact.scale);
      if (!amount) continue;
      const existing = byCustomer.get(fact.customerId);
      byCustomer.set(fact.customerId, existing ? add(existing, amount) : amount);
    }
    if (!byCustomer.size) return empty(["revenue_unknown"], periodEnd);

    const amounts = [...byCustomer.values()];
    const total = amounts.slice(1).reduce((acc, next) => add(acc, next), amounts[0]);
    const shares = [...byCustomer.entries()]
      .map(([customerId, revenue]) => {
        const customer = customers.find((c) => c.id === customerId);
        const share = ratioBps(revenue, total);
        return {
          customerId,
          organisationName: customer?.organisationName ?? customerId,
          shareBps: share === null ? null : share.toString(),
          revenue: serializeMoney(revenue),
        };
      })
      .sort((a, b) => Number(b.shareBps ?? "-1") - Number(a.shareBps ?? "-1"));

    const top = (n: number) => {
      const slice = shares.slice(0, n).map((s) => s.shareBps).filter((v): v is string => v !== null);
      if (!slice.length) return null;
      return slice.reduce((acc, next) => (BigInt(acc) + BigInt(next)).toString(), "0");
    };

    return {
      currency: total.currency,
      periodEnd,
      totalRevenue: serializeMoney(total),
      shares,
      topCustomerShareBps: top(1),
      top3ShareBps: top(3),
      top5ShareBps: top(5),
      unknownReasons,
      version: CUSTOMER_CONCENTRATION_VERSION,
      method: "deterministic_customer_concentration_v1",
      disclaimer: CONCENTRATION_DISCLAIMER,
    };
  } catch (error) {
    if (error instanceof CurrencyMismatchError) return empty(["currency_mismatch"], periodEnd);
    return empty(["concentration_unknown"], periodEnd);
  }
}

function empty(unknownReasons: string[], periodEnd: string | null = null): BusinessCustomerConcentration {
  return {
    currency: null,
    periodEnd,
    totalRevenue: null,
    shares: [],
    topCustomerShareBps: null,
    top3ShareBps: null,
    top5ShareBps: null,
    unknownReasons,
    version: CUSTOMER_CONCENTRATION_VERSION,
    method: "deterministic_customer_concentration_v1",
    disclaimer: CONCENTRATION_DISCLAIMER,
  };
}
