import { resolveTestBaseUrl } from "./env.js";

export interface HttpRequestOptions {
  method?: string;
  path: string;
  cookieHeader?: string;
  headers?: Record<string, string>;
  body?: unknown;
  tenantId?: string;
  workspaceId?: string;
}

export async function httpFetch(options: HttpRequestOptions): Promise<Response> {
  const base = resolveTestBaseUrl().replace(/\/$/, "");
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(options.body !== undefined ? { "Content-Type": "application/json" } : {}),
    ...options.headers,
  };

  if (options.cookieHeader) {
    headers.Cookie = options.cookieHeader;
  }
  if (options.tenantId) {
    headers["x-tenant-id"] = options.tenantId;
  }
  if (options.workspaceId) {
    headers["x-workspace-id"] = options.workspaceId;
  }

  return fetch(`${base}${options.path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });
}
