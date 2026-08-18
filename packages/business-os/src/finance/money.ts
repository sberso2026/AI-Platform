import type { MoneyJson } from "@rtb/types";

export const DEFAULT_MONEY_SCALE = 2;
export const BPS_SCALE = 10_000n;

export class CurrencyMismatchError extends Error {
  constructor(message = "currency_mismatch") {
    super(message);
    this.name = "CurrencyMismatchError";
  }
}

export interface MoneyAmount {
  minor: bigint;
  currency: string;
  scale: number;
}

export function parseMinor(value: unknown): bigint | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "bigint") return value;
  if (typeof value === "number") {
    if (!Number.isInteger(value) || !Number.isSafeInteger(value)) {
      throw new Error("monetary_value_not_integer");
    }
    return BigInt(value);
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;
    if (!/^-?\d+$/.test(trimmed)) throw new Error("monetary_value_not_integer");
    return BigInt(trimmed);
  }
  throw new Error("monetary_value_not_integer");
}

export function money(
  minor: unknown,
  currency: string,
  scale = DEFAULT_MONEY_SCALE,
): MoneyAmount | null {
  const parsed = parseMinor(minor);
  if (parsed === null) return null;
  if (!currency || currency.length !== 3) throw new Error("currency_required");
  return { minor: parsed, currency: currency.toUpperCase(), scale };
}

export function serializeMoney(amount: MoneyAmount | null): MoneyJson | null {
  if (!amount) return null;
  return {
    minor: amount.minor.toString(),
    currency: amount.currency,
    scale: amount.scale,
  };
}

export function assertSameCurrency(amounts: Array<MoneyAmount | null | undefined>): string {
  const known = amounts.filter((a): a is MoneyAmount => Boolean(a));
  if (known.length === 0) throw new CurrencyMismatchError("currency_unknown");
  const currency = known[0].currency;
  const scale = known[0].scale;
  for (const amount of known) {
    if (amount.currency !== currency) throw new CurrencyMismatchError();
    if (amount.scale !== scale) throw new Error("scale_mismatch");
  }
  return currency;
}

/** Round half away from zero. */
export function roundDiv(numerator: bigint, denominator: bigint): bigint {
  if (denominator === 0n) throw new Error("division_by_zero");
  const negative = numerator < 0n !== denominator < 0n;
  const n = numerator < 0n ? -numerator : numerator;
  const d = denominator < 0n ? -denominator : denominator;
  const rounded = (n + d / 2n) / d;
  return negative ? -rounded : rounded;
}

export function add(a: MoneyAmount, b: MoneyAmount): MoneyAmount {
  assertSameCurrency([a, b]);
  return { minor: a.minor + b.minor, currency: a.currency, scale: a.scale };
}

export function sub(a: MoneyAmount, b: MoneyAmount): MoneyAmount {
  assertSameCurrency([a, b]);
  return { minor: a.minor - b.minor, currency: a.currency, scale: a.scale };
}

/** Basis points, or null when the denominator is zero. */
export function ratioBps(numerator: MoneyAmount, denominator: MoneyAmount): bigint | null {
  assertSameCurrency([numerator, denominator]);
  if (denominator.minor === 0n) return null;
  return roundDiv(numerator.minor * BPS_SCALE, denominator.minor);
}

export function toSafeNumber(minor: bigint): number | null {
  if (minor > BigInt(Number.MAX_SAFE_INTEGER) || minor < BigInt(Number.MIN_SAFE_INTEGER)) {
    return null;
  }
  return Number(minor);
}

export function utcDateDiffDays(startIsoDate: string, endIsoDate: string): number {
  const start = Date.parse(`${startIsoDate}T00:00:00.000Z`);
  const end = Date.parse(`${endIsoDate}T00:00:00.000Z`);
  if (Number.isNaN(start) || Number.isNaN(end) || end < start) return 0;
  return Math.floor((end - start) / 86_400_000) + 1;
}
