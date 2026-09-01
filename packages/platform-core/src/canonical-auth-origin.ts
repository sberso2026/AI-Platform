/** Single resolver for externally generated Auth redirect origins. */

export const CANONICAL_AUTH_LOGIN_PATH = "/login";
export const CANONICAL_AUTH_RECOVERY_PATH = "/reset-password";

export type CanonicalAuthOriginInput = {
  /** Preferred public application origin (`NEXT_PUBLIC_APP_URL`). */
  appUrl?: string | null;
  /** Browser `Origin` when a user is already on a safe host. */
  requestOrigin?: string | null;
  /** Vercel deployment host; last-resort fallback only. */
  vercelUrl?: string | null;
};

const BLOCKED_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]", "rtb-ai-platform-phi.vercel.app"]);

function hostnameOf(origin: string): string | null {
  try {
    return new URL(origin).hostname.toLowerCase();
  } catch {
    return null;
  }
}

export function isBlockedAuthHost(host: string): boolean {
  const h = host.trim().toLowerCase();
  if (!h) return true;
  if (BLOCKED_HOSTS.has(h)) return true;
  if (h.endsWith(".localhost")) return true;
  return false;
}

export function isVercelDeploymentHost(host: string): boolean {
  return host.trim().toLowerCase().endsWith(".vercel.app");
}

export function normalizeAuthOrigin(raw: string | null | undefined): string | null {
  if (!raw?.trim()) return null;
  let value = raw.trim();
  if (!/^https?:\/\//i.test(value)) value = `https://${value}`;
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }
  if (url.protocol !== "https:") return null;
  const host = url.hostname.toLowerCase();
  if (isBlockedAuthHost(host)) return null;
  return `https://${url.host}`;
}

function isAppropriateRequestOrigin(origin: string): boolean {
  const host = hostnameOf(origin);
  if (!host || isBlockedAuthHost(host)) return false;
  // Ephemeral Preview hostnames are not a stable external Auth origin.
  if (isVercelDeploymentHost(host)) return false;
  return true;
}

/**
 * Resolve the origin used in invite/signup/recovery redirect URLs.
 * Priority: NEXT_PUBLIC_APP_URL → safe request origin → VERCEL_URL.
 */
export function resolveCanonicalAuthOrigin(input: CanonicalAuthOriginInput): string | null {
  const app = normalizeAuthOrigin(input.appUrl);
  if (app) return app;

  const request = normalizeAuthOrigin(input.requestOrigin);
  if (request && isAppropriateRequestOrigin(request)) return request;

  return normalizeAuthOrigin(input.vercelUrl);
}

export function buildAuthRedirectTo(
  path: string,
  input: CanonicalAuthOriginInput,
): string | undefined {
  const origin = resolveCanonicalAuthOrigin(input);
  if (!origin) return undefined;
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${origin}${suffix}`;
}

export function buildAuthLoginRedirect(input: CanonicalAuthOriginInput): string | undefined {
  return buildAuthRedirectTo(CANONICAL_AUTH_LOGIN_PATH, input);
}

export function buildAuthRecoveryRedirect(input: CanonicalAuthOriginInput): string | undefined {
  return buildAuthRedirectTo(CANONICAL_AUTH_RECOVERY_PATH, input);
}
