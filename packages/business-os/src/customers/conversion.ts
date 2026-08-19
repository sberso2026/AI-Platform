import type { BusinessCustomer } from "@rtb/types";

function norm(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim().toLowerCase();
  return trimmed || null;
}

export type CustomerMatch =
  | { kind: "none" }
  | { kind: "exact"; customer: BusinessCustomer }
  | { kind: "ambiguous"; matches: BusinessCustomer[] };

export function resolveCustomerMatch(
  existing: BusinessCustomer[],
  candidate: { organisationName?: string | null; domain?: string | null },
): CustomerMatch {
  const domain = norm(candidate.domain);
  const name = norm(candidate.organisationName);
  const live = existing.filter((row) => !row.archivedAt && row.customerStatus !== "archived");
  const matches = live.filter((row) => {
    const rowDomain = norm(row.domain);
    const rowName = norm(row.organisationName);
    return (domain && rowDomain && domain === rowDomain) || (name && rowName && name === rowName);
  });
  const unique = [...new Map(matches.map((row) => [row.id, row])).values()];
  if (unique.length === 0) return { kind: "none" };
  if (unique.length === 1) return { kind: "exact", customer: unique[0] };
  return { kind: "ambiguous", matches: unique };
}

export function assertNotAmbiguous(match: CustomerMatch): BusinessCustomer | null {
  if (match.kind === "ambiguous") throw new Error("conversion_ambiguous");
  if (match.kind === "exact") return match.customer;
  return null;
}
