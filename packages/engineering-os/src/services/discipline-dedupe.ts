import type { EngineeringDiscipline } from "@rtb/types";

/** Normalize discipline_key / name for dedupe comparisons. */
export function normalizeDisciplineKey(value: string | null | undefined): string {
  return (value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-");
}

/**
 * User-facing list must show one row per discipline.
 * Prefer tenant-specific rows over system/global when keys or names collide.
 * Dedupes by normalized slug (discipline_key), then by normalized name.
 */
export function dedupeDisciplinesForDisplay(
  rows: EngineeringDiscipline[],
  tenantId: string
): EngineeringDiscipline[] {
  // System/global first, then tenant — later write wins (tenant override)
  const ordered = [...rows].sort((a, b) => {
    const aWeight = a.tenant_id === tenantId ? 1 : 0;
    const bWeight = b.tenant_id === tenantId ? 1 : 0;
    return aWeight - bWeight;
  });

  const bySlug = new Map<string, EngineeringDiscipline>();
  for (const row of ordered) {
    const slug = normalizeDisciplineKey(row.discipline_key);
    if (!slug) continue;
    bySlug.set(slug, row);
  }

  // Second pass: collapse remaining name collisions across different slugs
  const byName = new Map<string, EngineeringDiscipline>();
  const slugWinner = Array.from(bySlug.values()).sort((a, b) => {
    const aWeight = a.tenant_id === tenantId ? 1 : 0;
    const bWeight = b.tenant_id === tenantId ? 1 : 0;
    return aWeight - bWeight;
  });

  for (const row of slugWinner) {
    const nameKey = normalizeDisciplineKey(row.name);
    if (!nameKey) {
      byName.set(row.id, row);
      continue;
    }
    const existing = byName.get(nameKey);
    if (!existing) {
      byName.set(nameKey, row);
      continue;
    }
    // Prefer tenant over system when names collide
    if (existing.tenant_id !== tenantId && row.tenant_id === tenantId) {
      byName.set(nameKey, row);
    }
  }

  return Array.from(byName.values()).sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
  );
}

export function assertNoDuplicateDisciplineNames(
  rows: EngineeringDiscipline[]
): boolean {
  const names = new Set<string>();
  for (const row of rows) {
    const n = normalizeDisciplineKey(row.name);
    if (names.has(n)) return false;
    names.add(n);
  }
  return true;
}
