import { createHash } from "node:crypto";

export type FingerprintItem = {
  configuration_item_id: string;
  object_type: string;
  object_id: string;
  revision_ref?: string | null;
  object_code_snapshot?: string | null;
  object_title_snapshot?: string | null;
  effective_state?: string | null;
};

/** Canonical JSON: sorted object keys, no timestamps injected. Key-order changes hash identically. */
export function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify(obj[k])}`).join(",")}}`;
}

/** SHA-256 hex of canonical JSON. Used for baseline_fingerprint and run_input_fingerprint. */
export function fingerprintCanonical(value: unknown): string {
  return createHash("sha256").update(stableStringify(value)).digest("hex");
}

/** Canonicalize baseline items: sort by object_type, object_id, configuration_item_id. No timestamps. */
export function canonicalizeBaselineItems(items: FingerprintItem[]): FingerprintItem[] {
  return [...items]
    .map((item) => ({
      configuration_item_id: String(item.configuration_item_id),
      object_type: String(item.object_type),
      object_id: String(item.object_id),
      revision_ref: item.revision_ref ?? null,
      object_code_snapshot: item.object_code_snapshot ?? null,
      object_title_snapshot: item.object_title_snapshot ?? null,
      effective_state: item.effective_state ?? null,
    }))
    .sort((a, b) => {
      const left = `${a.object_type}|${a.object_id}|${a.configuration_item_id}`;
      const right = `${b.object_type}|${b.object_id}|${b.configuration_item_id}`;
      return left.localeCompare(right);
    });
}

/**
 * SHA-256 hex of canonical JSON. Algorithm: SHA-256.
 * Canonicalization: sorted keys, items ordered by object_type/object_id/item id, null for missing optional fields.
 */
export function fingerprintBaselineItems(items: FingerprintItem[]): string {
  return fingerprintCanonical(canonicalizeBaselineItems(items));
}
