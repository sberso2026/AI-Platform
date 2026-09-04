import type { OperationalRow } from "@/components/engineering/operational";

export async function readOperationalJson<T>(url: string): Promise<{
  ok: boolean;
  status: number;
  data: T | null;
  error: string | null;
}> {
  try {
    const response = await fetch(url);
    const json = (await response.json().catch(() => null)) as
      | { data?: T; error?: { message?: string; code?: string } }
      | T
      | null;
    if (!response.ok) {
      const nested =
        json && typeof json === "object" && "error" in json
          ? (json as { error?: { message?: string; code?: string } }).error
          : null;
      return {
        ok: false,
        status: response.status,
        data: null,
        error: nested?.message ?? nested?.code ?? `http_${response.status}`,
      };
    }
    if (json && typeof json === "object" && "data" in json) {
      return { ok: true, status: response.status, data: (json as { data: T }).data, error: null };
    }
    return { ok: true, status: response.status, data: json as T, error: null };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      data: null,
      error: error instanceof Error ? error.message : "load_failed",
    };
  }
}

export function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export function asList(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  const rec = asRecord(value);
  if (Array.isArray(rec.data)) return rec.data;
  return [];
}

export function pickString(rec: Record<string, unknown>, keys: string[], fallback = "—"): string {
  for (const key of keys) {
    const value = rec[key];
    if (typeof value === "string" && value.trim()) return value;
    if (typeof value === "number") return String(value);
  }
  return fallback;
}

export function toOperationalRows(
  items: unknown[],
  map: (rec: Record<string, unknown>, index: number) => OperationalRow,
): OperationalRow[] {
  return items.map((item, index) => map(asRecord(item), index));
}

export function truthfulModelStatus(rec: Record<string, unknown>): string {
  const raw = pickString(rec, ["status", "federationStatus", "federation_status"], "").toLowerCase();
  if (raw.includes("map")) return "Mapping required";
  if (raw.includes("result")) return "Results available";
  if (raw.includes("federat")) return "Federated";
  if (raw.includes("import") || raw.includes("ingest") || raw.includes("recorded")) return "Imported";
  if (raw) return rec.status ? String(rec.status) : "Imported";
  return "Imported";
}
