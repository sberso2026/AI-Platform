export type RestResult = { status: number; body: unknown };

export function restHeaders(
  anonKey: string,
  serviceKey: string,
  jwt?: string,
  json = false,
): Record<string, string> {
  const isService = Boolean(jwt && jwt === serviceKey);
  return {
    apikey: isService ? serviceKey : anonKey,
    ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
    ...(json ? { "Content-Type": "application/json", Prefer: "return=representation" } : {}),
  };
}

export async function restFetch(
  url: string,
  anonKey: string,
  serviceKey: string,
  path: string,
  options: RequestInit = {},
  jwt?: string,
): Promise<RestResult> {
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...options,
    headers: {
      ...restHeaders(anonKey, serviceKey, jwt, Boolean(options.body)),
      ...(options.headers ?? {}),
    },
  });
  const text = await response.text();
  let body: unknown = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  return { status: response.status, body };
}

export function ids(body: unknown): string[] {
  return Array.isArray(body) ? body.map((row) => String((row as { id: string }).id)) : [];
}

export function mutationDenied(result: RestResult): boolean {
  if (result.status === 204) return true;
  if (result.status === 200) return ids(result.body).length === 0;
  return result.status >= 400 && result.status < 500;
}
