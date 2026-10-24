/**
 * Connector security helpers — SSRF URL safety, payload sanitisation, credential refs.
 */

const BLOCKED_HOSTS = new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "::1",
  "metadata.google.internal",
  "169.254.169.254",
]);

const PRIVATE_IP_RE =
  /^(10\.|127\.|169\.254\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.)/;

export type UrlSafetyResult =
  | { ok: true; url: URL }
  | { ok: false; reason: string };

/** Reject arbitrary internal-network access through Generic REST configuration. */
export function assertSafeExternalUrl(raw: string): UrlSafetyResult {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return { ok: false, reason: "invalid_url" };
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    return { ok: false, reason: "unsupported_protocol" };
  }
  // Prefer https in production configs; http allowed only for mock fixtures.
  const host = url.hostname.toLowerCase();
  if (BLOCKED_HOSTS.has(host) || host.endsWith(".local") || host.endsWith(".internal")) {
    return { ok: false, reason: "blocked_host" };
  }
  if (PRIVATE_IP_RE.test(host)) {
    return { ok: false, reason: "private_network" };
  }
  if (host === "metadata" || host.includes("instance-data")) {
    return { ok: false, reason: "cloud_metadata" };
  }
  return { ok: true, url };
}

/** Strip script/html-ish payloads from external metadata/content. */
export function sanitiseExternalText(input: string | null | undefined): {
  text: string;
  sanitised: boolean;
} {
  if (!input) return { text: "", sanitised: false };
  let sanitised = false;
  let text = input;
  if (/<script[\s>]/i.test(text) || /javascript:/i.test(text) || /on\w+=/i.test(text)) {
    sanitised = true;
    text = text
      .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "[removed]")
      .replace(/javascript:/gi, "")
      .replace(/\son\w+\s*=\s*(['"]).*?\1/gi, "");
  }
  // Bound size
  if (text.length > 20_000) {
    text = text.slice(0, 20_000);
    sanitised = true;
  }
  return { text, sanitised };
}

export function sanitiseMetadata(
  metadata: Record<string, unknown> | undefined,
): { metadata: Record<string, unknown>; sanitised: boolean } {
  if (!metadata) return { metadata: {}, sanitised: false };
  let sanitised = false;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(metadata)) {
    if (typeof v === "string") {
      const s = sanitiseExternalText(v);
      out[k] = s.text;
      sanitised = sanitised || s.sanitised;
    } else if (v && typeof v === "object") {
      // Drop nested objects that could smuggle executable payloads
      out[k] = "[omitted]";
      sanitised = true;
    } else {
      out[k] = v;
    }
  }
  return { metadata: out, sanitised };
}

/** Credential refs only — reject accidental plaintext secret fields. */
export function assertNoPlaintextSecrets(config: Record<string, unknown>): void {
  const banned = [
    "password",
    "secret",
    "apiKey",
    "api_key",
    "clientSecret",
    "client_secret",
    "token",
    "accessToken",
    "refreshToken",
  ];
  for (const key of Object.keys(config)) {
    const lower = key.toLowerCase();
    if (banned.some((b) => lower.includes(b.toLowerCase()))) {
      const val = config[key];
      if (typeof val === "string" && val.length > 0 && !val.startsWith("secret:") && !val.startsWith("ref:")) {
        throw new Error(`plaintext_secret_forbidden:${key}`);
      }
    }
  }
}
