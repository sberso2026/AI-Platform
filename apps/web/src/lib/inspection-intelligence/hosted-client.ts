const HOSTED = "/api/engineering/inspection-intelligence/hosted";
const PROJECT_FILTER_KEY = "rtb.engineering.selectedProjectId";

export function selectedProjectId(): string | undefined {
  try {
    const stored = sessionStorage.getItem(PROJECT_FILTER_KEY);
    if (!stored || stored === "all") return undefined;
    return stored;
  } catch {
    return undefined;
  }
}

export function withProjectQuery(params: Record<string, string> = {}): Record<string, string> {
  const projectId = selectedProjectId();
  return projectId ? { ...params, projectId } : params;
}

export async function hostedGet<T>(resource: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(HOSTED, window.location.origin);
  url.searchParams.set("resource", resource);
  for (const [key, value] of Object.entries(withProjectQuery(params))) {
    url.searchParams.set(key, value);
  }
  const response = await fetch(url);
  const payload = (await response.json().catch(() => ({}))) as {
    data?: T;
    error?: { message?: string; code?: string };
  };
  if (!response.ok) {
    throw new Error(payload.error?.message ?? payload.error?.code ?? "Unable to load inspection data");
  }
  return payload.data as T;
}

export async function hostedIntent<T>(intent: string, body: Record<string, unknown> = {}): Promise<T> {
  const response = await fetch(HOSTED, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ...body, intent, ...withProjectQuery() }),
  });
  const payload = (await response.json().catch(() => ({}))) as {
    data?: T;
    error?: { message?: string; code?: string };
  };
  if (!response.ok) {
    throw new Error(payload.error?.message ?? payload.error?.code ?? "Inspection action failed");
  }
  return payload.data as T;
}

export type InspectionRow = Record<string, unknown> & { id?: string };

export function targetLabel(target: unknown): string {
  if (!target || typeof target !== "object") return "Unset target";
  const row = target as { kind?: string; snapshot?: { label?: string }; canonicalId?: string };
  return row.snapshot?.label || (row.kind ? `${row.kind}` : "Unset target");
}

export function planTargetSummary(row: InspectionRow): string {
  const targets = Array.isArray(row.targets) ? row.targets : [];
  if (!targets.length) return "No target bound";
  return targets.map(targetLabel).join(" · ");
}
