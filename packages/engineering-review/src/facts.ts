/**
 * Minimum canonical engineering facts for ERA-4 comparison.
 * Not a universal ontology — only properties the gold-set review types need.
 */

export type EngineeringFact = {
  subject: string;
  property: string;
  value: string;
  unit?: string;
  qualifier?: string;
  sourceDocumentId: string;
  revision?: string;
  role?: string;
  span: string;
};

export type CanonicalQuantity = {
  magnitude: number;
  unit: string;
};

const UNIT_TO_CANONICAL: Readonly<Record<string, { unit: string; factor: number }>> = {
  mpa: { unit: "MPa", factor: 1 },
  "n/mm2": { unit: "MPa", factor: 1 },
  "n/mm²": { unit: "MPa", factor: 1 },
  kn: { unit: "kN", factor: 1 },
  kpa: { unit: "kPa", factor: 1 },
  "kn/m2": { unit: "kPa", factor: 1 },
  "kn/m²": { unit: "kPa", factor: 1 },
  year: { unit: "year", factor: 1 },
  years: { unit: "year", factor: 1 },
};

function normalizeUnitToken(unit: string): string {
  return unit.trim().toLowerCase().replace(/\s+/g, "");
}

export function canonicalizeQuantity(magnitude: number, unit: string): CanonicalQuantity | null {
  const mapped = UNIT_TO_CANONICAL[normalizeUnitToken(unit)];
  if (!mapped) return null;
  return { magnitude: magnitude * mapped.factor, unit: mapped.unit };
}

export function quantitiesEqual(left: CanonicalQuantity, right: CanonicalQuantity, epsilon = 1e-9): boolean {
  return left.unit === right.unit && Math.abs(left.magnitude - right.magnitude) <= epsilon;
}

export function parseQuantity(raw: string): CanonicalQuantity | null {
  const match = raw.trim().match(/^([+-]?[0-9]+(?:\.[0-9]+)?)\s*([A-Za-zµμ°/%²³²]+(?:\s*\/\s*[A-Za-z0-9µμ²³]+)?)$/);
  if (!match) return null;
  const magnitude = Number(match[1]);
  if (!Number.isFinite(magnitude)) return null;
  return canonicalizeQuantity(magnitude, match[2].replace(/\s+/g, ""));
}

export function factIdentity(fact: EngineeringFact): string {
  return `${fact.subject}|${fact.property}`;
}

export function factCanonicalKey(fact: EngineeringFact): string {
  const quantity = parseQuantity(`${fact.value} ${fact.unit ?? ""}`.trim());
  if (quantity) return `${quantity.magnitude}:${quantity.unit}`;
  return `${fact.value}:${fact.unit ?? ""}`.toLowerCase();
}

export function factsConflict(left: EngineeringFact, right: EngineeringFact): boolean {
  if (factIdentity(left) !== factIdentity(right)) return false;
  return factCanonicalKey(left) !== factCanonicalKey(right);
}
