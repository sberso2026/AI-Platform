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

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isRawUuid(value: string | null | undefined): boolean {
  return Boolean(value && UUID_RE.test(value.trim()));
}

export function formatProjectContextLabel(input: {
  projectCode?: string | null;
  projectName?: string | null;
}): string {
  const code = (input.projectCode ?? "").trim();
  const name = (input.projectName ?? "").trim();
  if (code && name) return `${code} · ${name}`;
  if (code) return code;
  if (name) return name;
  return "Selected project";
}

export function pickHumanString(
  rec: Record<string, unknown>,
  keys: string[],
  fallback = "—",
): string {
  for (const key of keys) {
    const value = rec[key];
    if (typeof value === "string" && value.trim() && !isRawUuid(value)) return value.trim();
  }
  return fallback;
}

export function displayOperationalText(value: unknown, fallback = "—"): string {
  if (value == null || value === "") return fallback;
  const text = String(value).trim();
  if (!text || isRawUuid(text)) return fallback;
  return text;
}

export function twinHumanLabel(rec: Record<string, unknown>): string {
  const named = pickHumanString(rec, ["displayName", "name", "label", "title"], "");
  if (named) return named;
  const type = pickHumanString(rec, ["canonicalEntityType", "twinType", "type"], "");
  if (type === "asset") return "Asset twin";
  if (type === "project") return "Project twin";
  if (type) return `${type.charAt(0).toUpperCase()}${type.slice(1)} twin`;
  return "Digital twin";
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
