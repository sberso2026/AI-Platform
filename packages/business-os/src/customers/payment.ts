import type { BusinessCustomerFinancialFact, BusinessCustomerPaymentBehaviour } from "@rtb/types";
import { CUSTOMER_PAYMENT_VERSION } from "@rtb/types";
import {
  CurrencyMismatchError,
  money,
  parseMinor,
  ratioBps,
  serializeMoney,
  utcDateDiffDays,
} from "../finance/money";

export const PAYMENT_DISCLAIMER =
  "Payment behaviour is a deterministic management view from customer financial facts. It is not a credit score, consumer credit rating, or collection instruction.";

export function computePaymentBehaviour(facts: BusinessCustomerFinancialFact[]): BusinessCustomerPaymentBehaviour {
  const unknownReasons: string[] = [];
  const latest = [...facts].sort((a, b) => b.periodEnd.localeCompare(a.periodEnd))[0];
  if (!latest) {
    return {
      outstanding: null,
      overdue: null,
      overdueRatioBps: null,
      ageing: { current: null, d1to30: null, d31to60: null, d61to90: null, d90plus: null },
      averagePaymentDelayDays: null,
      unknownReasons: ["no_financial_facts"],
      version: CUSTOMER_PAYMENT_VERSION,
      method: "deterministic_customer_payment_v1",
      disclaimer: PAYMENT_DISCLAIMER,
    };
  }
  try {
    const outstanding = money(latest.receivableOutstandingMinor, latest.currency, latest.scale);
    const overdue = money(latest.receivableOverdueMinor, latest.currency, latest.scale);
    let overdueRatioBps: string | null = null;
    if (outstanding && overdue) {
      const ratio = ratioBps(overdue, outstanding);
      overdueRatioBps = ratio === null ? null : ratio.toString();
      if (ratio === null) unknownReasons.push("overdue_ratio_undefined_zero_outstanding");
    } else {
      unknownReasons.push("receivables_unknown");
    }
    const delays = facts
      .filter((row) => row.dueDate && row.paidDate)
      .map((row) => utcDateDiffDays(row.dueDate as string, row.paidDate as string) - 1);
    const averagePaymentDelayDays = delays.length
      ? Math.round(delays.reduce((a, b) => a + b, 0) / delays.length)
      : null;
    if (averagePaymentDelayDays === null) unknownReasons.push("payment_delay_requires_due_and_paid_dates");
    return {
      outstanding: serializeMoney(outstanding),
      overdue: serializeMoney(overdue),
      overdueRatioBps,
      ageing: {
        current: serializeMoney(money(latest.ageingCurrentMinor, latest.currency, latest.scale)),
        d1to30: serializeMoney(money(latest.ageing130Minor, latest.currency, latest.scale)),
        d31to60: serializeMoney(money(latest.ageing3160Minor, latest.currency, latest.scale)),
        d61to90: serializeMoney(money(latest.ageing6190Minor, latest.currency, latest.scale)),
        d90plus: serializeMoney(money(latest.ageing90PlusMinor, latest.currency, latest.scale)),
      },
      averagePaymentDelayDays,
      unknownReasons,
      version: CUSTOMER_PAYMENT_VERSION,
      method: "deterministic_customer_payment_v1",
      disclaimer: PAYMENT_DISCLAIMER,
    };
  } catch (error) {
    if (error instanceof CurrencyMismatchError) unknownReasons.push("currency_mismatch");
    return {
      outstanding: null,
      overdue: null,
      overdueRatioBps: null,
      ageing: { current: null, d1to30: null, d31to60: null, d61to90: null, d90plus: null },
      averagePaymentDelayDays: null,
      unknownReasons: unknownReasons.length ? unknownReasons : ["payment_unknown"],
      version: CUSTOMER_PAYMENT_VERSION,
      method: "deterministic_customer_payment_v1",
      disclaimer: PAYMENT_DISCLAIMER,
    };
  }
}

export function contributionFromFact(fact: BusinessCustomerFinancialFact): string | null {
  const revenue = parseMinor(fact.revenueMinor);
  const cost = parseMinor(fact.directCostMinor);
  if (revenue === null || cost === null) return null;
  return (revenue - cost).toString();
}
