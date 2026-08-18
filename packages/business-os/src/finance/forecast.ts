import type {
  BusinessFinanceForecast,
  BusinessFinanceSnapshot,
} from "@rtb/types";
import { money, roundDiv, serializeMoney, sub, utcDateDiffDays } from "./money";

export const FORECAST_ASSUMPTIONS = [
  "Observed cash is the latest ingested snapshot cash balance.",
  "Net movement equals revenue minus cost of sales minus operating expenses from the latest complete snapshot.",
  "Net movement is scaled to 30-day months using period length in UTC days.",
  "No financing, owner drawings, tax, FX conversion, or new contractual inflows are assumed.",
  "Forecast is advisory management intelligence, not a cash-flow statement.",
] as const;

export function forecastCash(
  snapshot: BusinessFinanceSnapshot | null,
  period: { periodStart: string; periodEnd: string } | null,
  horizonMonths = 3,
): BusinessFinanceForecast {
  const assumptions = [...FORECAST_ASSUMPTIONS];
  if (!snapshot || !period) {
    return {
      currency: snapshot?.currency ?? "XXX",
      scale: snapshot?.scale ?? 2,
      points: [],
      assumptions,
      unknownReason: "insufficient_snapshot",
      method: "deterministic_cash_forecast_v1",
    };
  }

  const cash = money(snapshot.cashMinor, snapshot.currency, snapshot.scale);
  const revenue = money(snapshot.revenueMinor, snapshot.currency, snapshot.scale);
  const cos = money(snapshot.costOfSalesMinor, snapshot.currency, snapshot.scale);
  const opex = money(snapshot.operatingExpensesMinor, snapshot.currency, snapshot.scale);
  const days = utcDateDiffDays(period.periodStart, period.periodEnd);

  if (!cash) {
    return {
      currency: snapshot.currency,
      scale: snapshot.scale,
      points: [],
      assumptions,
      unknownReason: "cash_unknown",
      method: "deterministic_cash_forecast_v1",
    };
  }
  if (!revenue || !cos || !opex || days <= 0) {
    return {
      currency: snapshot.currency,
      scale: snapshot.scale,
      points: [{ offsetMonths: 0, kind: "observed", cash: serializeMoney(cash) }],
      assumptions,
      unknownReason: "net_movement_unknown",
      method: "deterministic_cash_forecast_v1",
    };
  }

  const net = sub(sub(revenue, cos), opex);
  const monthlyNetMinor = roundDiv(net.minor * 30n, BigInt(days));
  const points = [];
  let running = cash.minor;
  for (let i = 0; i <= horizonMonths; i += 1) {
    if (i > 0) running += monthlyNetMinor;
    points.push({
      offsetMonths: i,
      kind: i === 0 ? ("observed" as const) : ("forecast" as const),
      cash: serializeMoney({ minor: running, currency: snapshot.currency, scale: snapshot.scale }),
    });
  }

  return {
    currency: snapshot.currency,
    scale: snapshot.scale,
    points,
    assumptions,
    method: "deterministic_cash_forecast_v1",
  };
}
