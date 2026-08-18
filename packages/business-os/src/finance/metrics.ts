import type {
  BusinessFinanceMetrics,
  BusinessFinanceReceivableSnapshot,
  BusinessFinanceSnapshot,
} from "@rtb/types";
import {
  add,
  money,
  ratioBps,
  roundDiv,
  serializeMoney,
  sub,
  utcDateDiffDays,
  type MoneyAmount,
} from "./money";

export const FINANCE_METRICS_DISCLAIMER =
  "Financial Intelligence is a vendor-neutral management view from ingested snapshots. It is not a statutory ledger, tax return, or professional accounting opinion.";

function field(
  snapshot: BusinessFinanceSnapshot,
  key: keyof Pick<
    BusinessFinanceSnapshot,
    | "revenueMinor"
    | "costOfSalesMinor"
    | "operatingExpensesMinor"
    | "cashMinor"
    | "accountsReceivableMinor"
    | "accountsPayableMinor"
    | "budgetRevenueMinor"
    | "budgetExpensesMinor"
    | "budgetProfitMinor"
  >,
): MoneyAmount | null {
  return money(snapshot[key], snapshot.currency, snapshot.scale);
}

function recvField(
  row: BusinessFinanceReceivableSnapshot | null,
  key: keyof Pick<
    BusinessFinanceReceivableSnapshot,
    | "outstandingMinor"
    | "overdueMinor"
    | "ageingCurrentMinor"
    | "ageing130Minor"
    | "ageing3160Minor"
    | "ageing6190Minor"
    | "ageing90PlusMinor"
  >,
): MoneyAmount | null {
  if (!row) return null;
  return money(row[key], row.currency, row.scale);
}

export function computeFinanceMetrics(
  snapshot: BusinessFinanceSnapshot,
  receivables: BusinessFinanceReceivableSnapshot | null,
  period: { periodStart: string; periodEnd: string },
): BusinessFinanceMetrics {
  const unknownReasons: string[] = [];
  const revenue = field(snapshot, "revenueMinor");
  const cos = field(snapshot, "costOfSalesMinor");
  const opex = field(snapshot, "operatingExpensesMinor");
  const cash = field(snapshot, "cashMinor");
  const budgetRevenue = field(snapshot, "budgetRevenueMinor");
  const budgetExpenses = field(snapshot, "budgetExpensesMinor");
  const budgetProfit = field(snapshot, "budgetProfitMinor");

  let grossProfit: MoneyAmount | null = null;
  if (revenue && cos) grossProfit = sub(revenue, cos);
  else unknownReasons.push("gross_profit_requires_revenue_and_cost_of_sales");

  let grossMarginBps: bigint | null = null;
  if (grossProfit && revenue) {
    grossMarginBps = ratioBps(grossProfit, revenue);
    if (grossMarginBps === null) unknownReasons.push("gross_margin_undefined_zero_revenue");
  }

  let operatingProfit: MoneyAmount | null = null;
  if (grossProfit && opex) operatingProfit = sub(grossProfit, opex);
  else unknownReasons.push("operating_profit_requires_gross_profit_and_operating_expenses");

  let operatingMarginBps: bigint | null = null;
  if (operatingProfit && revenue) {
    operatingMarginBps = ratioBps(operatingProfit, revenue);
    if (operatingMarginBps === null) unknownReasons.push("operating_margin_undefined_zero_revenue");
  }

  let budgetRevenueVariance: MoneyAmount | null = null;
  let budgetRevenueVarianceBps: bigint | null = null;
  if (revenue && budgetRevenue) {
    budgetRevenueVariance = sub(revenue, budgetRevenue);
    budgetRevenueVarianceBps = ratioBps(budgetRevenueVariance, budgetRevenue);
    if (budgetRevenueVarianceBps === null) unknownReasons.push("budget_variance_percent_undefined_zero_budget");
  } else unknownReasons.push("budget_revenue_variance_requires_actual_and_budget");

  let budgetExpenseVariance: MoneyAmount | null = null;
  if (opex && budgetExpenses) budgetExpenseVariance = sub(opex, budgetExpenses);

  let budgetProfitVariance: MoneyAmount | null = null;
  if (operatingProfit && budgetProfit) budgetProfitVariance = sub(operatingProfit, budgetProfit);

  const ageingCurrent = recvField(receivables, "ageingCurrentMinor");
  const ageing130 = recvField(receivables, "ageing130Minor");
  const ageing3160 = recvField(receivables, "ageing3160Minor");
  const ageing6190 = recvField(receivables, "ageing6190Minor");
  const ageing90Plus = recvField(receivables, "ageing90PlusMinor");

  let outstanding = recvField(receivables, "outstandingMinor");
  if (!outstanding) {
    const buckets = [ageingCurrent, ageing130, ageing3160, ageing6190, ageing90Plus].filter(
      (b): b is MoneyAmount => Boolean(b),
    );
    if (buckets.length) {
      outstanding = buckets.reduce((acc, next) => add(acc, next));
    } else if (snapshot.accountsReceivableMinor != null) {
      outstanding = field(snapshot, "accountsReceivableMinor");
    } else {
      unknownReasons.push("receivables_outstanding_unknown");
    }
  }

  let overdue = recvField(receivables, "overdueMinor");
  if (!overdue) {
    const overdueBuckets = [ageing130, ageing3160, ageing6190, ageing90Plus].filter(
      (b): b is MoneyAmount => Boolean(b),
    );
    if (overdueBuckets.length) overdue = overdueBuckets.reduce((acc, next) => add(acc, next));
    else unknownReasons.push("receivables_overdue_unknown");
  }

  let overdueBps: bigint | null = null;
  if (outstanding && overdue) {
    overdueBps = ratioBps(overdue, outstanding);
    if (overdueBps === null) unknownReasons.push("overdue_percentage_undefined_zero_outstanding");
  }

  let cashRunwayMonthHundredths: bigint | null = null;
  const days = utcDateDiffDays(period.periodStart, period.periodEnd);
  if (!cash) unknownReasons.push("cash_runway_requires_cash");
  else if (!opex) unknownReasons.push("cash_runway_requires_operating_expenses");
  else if (days <= 0) unknownReasons.push("cash_runway_requires_positive_period_length");
  else if (opex.minor <= 0n) unknownReasons.push("cash_runway_requires_positive_burn");
  else {
    const monthlyBurn = roundDiv(opex.minor * 30n, BigInt(days));
    if (monthlyBurn <= 0n) unknownReasons.push("cash_runway_requires_positive_burn");
    else cashRunwayMonthHundredths = roundDiv(cash.minor * 100n, monthlyBurn);
  }

  return {
    currency: snapshot.currency,
    scale: snapshot.scale,
    grossProfit: serializeMoney(grossProfit),
    grossMarginBps: grossMarginBps === null ? null : grossMarginBps.toString(),
    operatingProfit: serializeMoney(operatingProfit),
    operatingMarginBps: operatingMarginBps === null ? null : operatingMarginBps.toString(),
    budgetRevenueVariance: serializeMoney(budgetRevenueVariance),
    budgetRevenueVarianceBps: budgetRevenueVarianceBps === null ? null : budgetRevenueVarianceBps.toString(),
    budgetExpenseVariance: serializeMoney(budgetExpenseVariance),
    budgetProfitVariance: serializeMoney(budgetProfitVariance),
    receivablesOutstanding: serializeMoney(outstanding),
    receivablesOverdue: serializeMoney(overdue),
    receivablesOverdueBps: overdueBps === null ? null : overdueBps.toString(),
    ageing: {
      current: serializeMoney(ageingCurrent),
      days1to30: serializeMoney(ageing130),
      days31to60: serializeMoney(ageing3160),
      days61to90: serializeMoney(ageing6190),
      days90Plus: serializeMoney(ageing90Plus),
    },
    cashRunwayMonthHundredths:
      cashRunwayMonthHundredths === null ? null : cashRunwayMonthHundredths.toString(),
    unknownReasons,
    method: "deterministic_finance_metrics_v1",
    disclaimer: FINANCE_METRICS_DISCLAIMER,
  };
}

export function revenueGrowthBps(
  current: BusinessFinanceSnapshot,
  previous: BusinessFinanceSnapshot | null,
): bigint | null {
  if (!previous) return null;
  if (current.currency !== previous.currency || current.scale !== previous.scale) return null;
  const cur = money(current.revenueMinor, current.currency, current.scale);
  const prev = money(previous.revenueMinor, previous.currency, previous.scale);
  if (!cur || !prev) return null;
  const delta = sub(cur, prev);
  return ratioBps(delta, prev);
}

export function expenseIncreaseBps(
  current: BusinessFinanceSnapshot,
  previous: BusinessFinanceSnapshot | null,
): bigint | null {
  if (!previous) return null;
  if (current.currency !== previous.currency || current.scale !== previous.scale) return null;
  const cur = money(current.operatingExpensesMinor, current.currency, current.scale);
  const prev = money(previous.operatingExpensesMinor, previous.currency, previous.scale);
  if (!cur || !prev) return null;
  const delta = sub(cur, prev);
  return ratioBps(delta, prev);
}
