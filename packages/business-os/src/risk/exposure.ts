export interface ExposureFact {
  amountMinor?: string | number | null;
  currency?: string | null;
}

export interface FinancialExposure {
  known: boolean;
  high: boolean;
  mixedCurrency: boolean;
  amountMinor: string | null;
  currency: string | null;
  reason: string | null;
}

function parseMinor(value: string | number | null | undefined): bigint | null {
  if (value === null || value === undefined || value === "") return null;
  try {
    return BigInt(value);
  } catch {
    return null;
  }
}

export function financialExposure(facts: ExposureFact[]): FinancialExposure {
  const quantified = facts.filter((fact) => parseMinor(fact.amountMinor) !== null);
  if (quantified.length === 0) {
    return {
      known: false,
      high: false,
      mixedCurrency: false,
      amountMinor: null,
      currency: null,
      reason: "missing_financial_exposure",
    };
  }

  const currencies = new Set(
    quantified.map((fact) => (fact.currency ?? "").trim().toUpperCase()).filter((code) => code.length === 3),
  );
  if (currencies.size > 1) {
    return {
      known: false,
      high: false,
      mixedCurrency: true,
      amountMinor: null,
      currency: null,
      reason: "mixed_currency",
    };
  }

  const currency = [...currencies][0] ?? quantified[0]?.currency ?? null;
  let total = 0n;
  for (const fact of quantified) {
    const parsed = parseMinor(fact.amountMinor);
    if (parsed !== null) total += parsed < 0n ? -parsed : parsed;
  }
  return {
    known: true,
    high: total >= 10_000_000n,
    mixedCurrency: false,
    amountMinor: total.toString(),
    currency,
    reason: null,
  };
}
