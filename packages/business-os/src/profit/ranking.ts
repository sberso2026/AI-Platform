import type {
  BusinessProfitConcentration,
  BusinessProfitCoverage,
  BusinessProfitFact,
  BusinessProfitRankRow,
  BusinessProfitTrend,
} from "@rtb/types";
import { PROFIT_CONCENTRATION_VERSION } from "@rtb/types";
import {
  CurrencyMismatchError,
  add,
  money,
  parseMinor,
  ratioBps,
  serializeMoney,
  type MoneyAmount,
} from "../finance/money";
import { classifyProfit } from "./classification";
import { computeFactMetrics, isRealizedState } from "./metrics";

export const PROFIT_CONCENTRATION_DISCLAIMER =
  "Profit concentration uses realized contribution for one reporting period and one currency only. Proposed, forecast, budget, or mixed-currency facts remain unknown.";

export type ProfitRankBy = "contribution" | "margin" | "revenue";

export function realizedFacts(facts: BusinessProfitFact[]): BusinessProfitFact[] {
  return facts.filter((row) => isRealizedState(row.valueState));
}

export function latestPeriod(facts: BusinessProfitFact[]): string | null {
  if (!facts.length) return null;
  return [...facts].sort((a, b) => b.periodEnd.localeCompare(a.periodEnd))[0].periodEnd;
}

export function rankProfitFacts(facts: BusinessProfitFact[], by: ProfitRankBy): BusinessProfitRankRow[] {
  const currencies = new Set(facts.map((row) => row.currency.toUpperCase()));
  const mixedCurrency = currencies.size > 1;
  const rows = facts.map((fact) => {
    const metrics = computeFactMetrics(fact);
    const classified = classifyProfit(fact);
    return {
      factId: fact.id,
      dimensionType: fact.dimensionType,
      dimensionId: fact.dimensionId,
      dimensionName: fact.dimensionName,
      revenue: metrics.revenue,
      directCost: metrics.directCost,
      contribution: metrics.contribution,
      contributionMarginBps: metrics.contributionMarginBps,
      classification: classified.classification,
      attributionMethod: fact.attributionMethod,
      valueState: fact.valueState,
      evidenceQuality: mixedCurrency ? [...metrics.unknownReasons, "currency_mismatch"] : metrics.unknownReasons,
      rankingUnknownReason: mixedCurrency ? "currency_mismatch" : null,
      _revenue: mixedCurrency ? null : parseMinor(metrics.revenue?.minor ?? null),
      _contribution: mixedCurrency ? null : parseMinor(metrics.contribution?.minor ?? null),
      _margin: mixedCurrency ? null : parseMinor(metrics.contributionMarginBps),
    };
  });
  const key = by === "revenue" ? "_revenue" : by === "margin" ? "_margin" : "_contribution";
  return rows
    .sort((a, b) => {
      const av = a[key];
      const bv = b[key];
      if (av === null && bv === null) return a.dimensionName.localeCompare(b.dimensionName);
      if (av === null) return 1;
      if (bv === null) return -1;
      if (bv === av) return a.dimensionName.localeCompare(b.dimensionName);
      return bv > av ? 1 : -1;
    })
    .map(({ _revenue: _r, _contribution: _c, _margin: _m, ...row }) => row);
}

export function computeProfitConcentration(facts: BusinessProfitFact[]): BusinessProfitConcentration {
  const realized = realizedFacts(facts);
  if (!realized.length) return empty(["no_realized_facts"]);
  const periodEnd = latestPeriod(realized);
  const periodFacts = realized.filter((row) => row.periodEnd === periodEnd);
  const currencies = new Set(periodFacts.map((row) => row.currency.toUpperCase()));
  if (currencies.size > 1) return empty(["currency_mismatch"], periodEnd);

  try {
    const byDimension = new Map<string, { name: string; type: BusinessProfitFact["dimensionType"]; amount: MoneyAmount }>();
    for (const fact of periodFacts) {
      const metrics = computeFactMetrics(fact);
      const amount = money(metrics.contribution?.minor ?? null, fact.currency, fact.scale);
      if (!amount) continue;
      const key = `${fact.dimensionType}:${fact.dimensionId ?? fact.dimensionRef ?? fact.dimensionName}`;
      const existing = byDimension.get(key);
      byDimension.set(key, {
        name: fact.dimensionName,
        type: fact.dimensionType,
        amount: existing ? add(existing.amount, amount) : amount,
      });
    }
    if (!byDimension.size) return empty(["contribution_unknown"], periodEnd);
    const amounts = [...byDimension.values()].map((row) => row.amount);
    const total = amounts.slice(1).reduce((acc, next) => add(acc, next), amounts[0]);
    const shares = [...byDimension.values()]
      .map((row) => {
        const share = ratioBps(row.amount, total);
        return {
          dimensionType: row.type,
          dimensionName: row.name,
          shareBps: share === null ? null : share.toString(),
          contribution: serializeMoney(row.amount),
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
      totalContribution: serializeMoney(total),
      shares,
      topShareBps: top(1),
      top5ShareBps: top(5),
      unknownReasons: [],
      version: PROFIT_CONCENTRATION_VERSION,
      method: "deterministic_profit_concentration_v1",
      disclaimer: PROFIT_CONCENTRATION_DISCLAIMER,
    };
  } catch (error) {
    if (error instanceof CurrencyMismatchError) return empty(["currency_mismatch"], periodEnd);
    return empty(["concentration_unknown"], periodEnd);
  }
}

export function attributionMethodCounts(facts: BusinessProfitFact[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const fact of facts) {
    counts[fact.attributionMethod] = (counts[fact.attributionMethod] ?? 0) + 1;
  }
  return counts;
}

export function staleFactCount(facts: BusinessProfitFact[], asOf = new Date(), maxAgeDays = 90): number {
  const cutoff = new Date(asOf.getTime() - maxAgeDays * 86_400_000).toISOString().slice(0, 10);
  return facts.filter((fact) => fact.periodEnd < cutoff).length;
}

export function computeProfitCoverage(facts: BusinessProfitFact[]): BusinessProfitCoverage {
  const realized = realizedFacts(facts);
  const unknownReasons: string[] = [];
  const methods = attributionMethodCounts(realized);
  const stale = staleFactCount(realized);
  if (!realized.length) {
    return {
      revenueWithKnownCost: null,
      revenueWithoutKnownCost: null,
      coverageBps: null,
      factCount: 0,
      knownContributionCount: 0,
      staleFactCount: 0,
      attributionMethods: {},
      unknownReasons: ["no_realized_facts"],
    };
  }
  const currencies = new Set(realized.map((row) => row.currency.toUpperCase()));
  if (currencies.size > 1) {
    return {
      revenueWithKnownCost: null,
      revenueWithoutKnownCost: null,
      coverageBps: null,
      factCount: realized.length,
      knownContributionCount: realized.filter((f) => computeFactMetrics(f).contribution).length,
      staleFactCount: stale,
      attributionMethods: methods,
      unknownReasons: ["currency_mismatch"],
    };
  }
  const currency = realized[0].currency;
  const scale = realized[0].scale;
  let withCost: MoneyAmount | null = null;
  let withoutCost: MoneyAmount | null = null;
  let knownContributionCount = 0;
  for (const fact of realized) {
    const revenue = money(fact.revenueMinor, currency, scale);
    const cost = parseMinor(fact.directCostMinor);
    const metrics = computeFactMetrics(fact);
    if (metrics.contribution) knownContributionCount += 1;
    if (!revenue) continue;
    if (cost === null) withoutCost = withoutCost ? add(withoutCost, revenue) : revenue;
    else withCost = withCost ? add(withCost, revenue) : revenue;
  }
  let coverageBps: string | null = null;
  if (withCost && withoutCost) {
    const total = add(withCost, withoutCost);
    const ratio = ratioBps(withCost, total);
    coverageBps = ratio === null ? null : ratio.toString();
  } else if (withCost && !withoutCost) coverageBps = "10000";
  else if (!withCost && withoutCost) coverageBps = "0";
  else unknownReasons.push("revenue_unknown");
  return {
    revenueWithKnownCost: serializeMoney(withCost),
    revenueWithoutKnownCost: serializeMoney(withoutCost),
    coverageBps,
    factCount: realized.length,
    knownContributionCount,
    staleFactCount: stale,
    attributionMethods: methods,
    unknownReasons,
  };
}

export function computeProfitTrends(facts: BusinessProfitFact[]): BusinessProfitTrend[] {
  const realized = realizedFacts(facts);
  const grouped = new Map<string, BusinessProfitFact[]>();
  for (const fact of realized) {
    const key = `${fact.dimensionType}:${fact.dimensionId ?? fact.dimensionRef ?? fact.dimensionName}`;
    const list = grouped.get(key) ?? [];
    list.push(fact);
    grouped.set(key, list);
  }
  const trends: BusinessProfitTrend[] = [];
  for (const rows of grouped.values()) {
    const ordered = [...rows].sort((a, b) => a.periodEnd.localeCompare(b.periodEnd));
    if (ordered.length < 2) continue;
    const currencies = new Set(ordered.map((row) => row.currency.toUpperCase()));
    const scales = new Set(ordered.map((row) => row.scale));
    const comparable = currencies.size === 1 && scales.size === 1;
    trends.push({
      dimensionType: ordered[0].dimensionType,
      dimensionRef: ordered[0].dimensionRef ?? ordered[0].dimensionId ?? null,
      dimensionName: ordered[0].dimensionName,
      points: ordered.map((fact) => {
        const metrics = computeFactMetrics(fact);
        return {
          periodEnd: fact.periodEnd,
          contribution: comparable ? metrics.contribution : null,
          contributionMarginBps: comparable ? metrics.contributionMarginBps : null,
          unknownReasons: comparable ? metrics.unknownReasons : ["currency_mismatch"],
        };
      }),
      comparable,
      unknownReasons: comparable ? [] : ["currency_mismatch"],
    });
  }
  return trends;
}

function empty(unknownReasons: string[], periodEnd: string | null = null): BusinessProfitConcentration {
  return {
    currency: null,
    periodEnd,
    totalContribution: null,
    shares: [],
    topShareBps: null,
    top5ShareBps: null,
    unknownReasons,
    version: PROFIT_CONCENTRATION_VERSION,
    method: "deterministic_profit_concentration_v1",
    disclaimer: PROFIT_CONCENTRATION_DISCLAIMER,
  };
}
