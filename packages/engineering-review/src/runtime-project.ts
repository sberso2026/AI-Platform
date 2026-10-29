export const REVIEW_STAGING_PROJECT_REF = "rntonzigxwxcjlcsadip";
export const REVIEW_EOS_PROJECT_REF = "wcydlhqiqdwgoaqrlget";

export type ReviewRuntimeDecision =
  | { ok: true; projectRef: string }
  | { ok: false; reason: "missing_url" | "invalid_url" | "eos_forbidden" | "staging_mismatch" };

export function supabaseProjectRefFromUrl(url: string | null | undefined): string | null {
  const trimmed = String(url ?? "").trim();
  const match = trimmed.match(/^https:\/\/([a-z0-9]+)\.supabase\.co\/?$/i);
  return match ? match[1].toLowerCase() : null;
}

function decodeBase64Url(value: string): string | null {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  try {
    if (typeof Buffer !== "undefined") {
      return Buffer.from(padded, "base64").toString("utf8");
    }
    if (typeof atob === "function") return atob(padded);
    return null;
  } catch {
    return null;
  }
}

export function supabaseProjectRefFromJwt(token: string | null | undefined): string | null {
  const raw = String(token ?? "").trim();
  if (!raw || raw.startsWith("sb_")) return null;
  const parts = raw.split(".");
  if (parts.length < 2) return null;
  try {
    const json = decodeBase64Url(parts[1]);
    if (!json) return null;
    const payload = JSON.parse(json) as { ref?: unknown };
    return typeof payload.ref === "string" && payload.ref ? payload.ref.toLowerCase() : null;
  } catch {
    return null;
  }
}

export function evaluateReviewRuntime(input: {
  url?: string | null;
  runtime?: string | null;
  expectedStagingRef?: string;
  anonKey?: string | null;
  serviceRoleKey?: string | null;
}): ReviewRuntimeDecision {
  const raw = String(input.url ?? "").trim();
  if (!raw) return { ok: false, reason: "missing_url" };
  const projectRef = supabaseProjectRefFromUrl(raw);
  if (!projectRef) return { ok: false, reason: "invalid_url" };
  const runtime = String(input.runtime ?? "").trim().toLowerCase();
  if (runtime === "staging") {
    if (projectRef === REVIEW_EOS_PROJECT_REF) return { ok: false, reason: "eos_forbidden" };
    const expected = (input.expectedStagingRef ?? REVIEW_STAGING_PROJECT_REF).toLowerCase();
    if (projectRef !== expected) return { ok: false, reason: "staging_mismatch" };
    for (const token of [input.anonKey, input.serviceRoleKey]) {
      const keyRef = supabaseProjectRefFromJwt(token);
      if (!keyRef) continue;
      if (keyRef === REVIEW_EOS_PROJECT_REF) return { ok: false, reason: "eos_forbidden" };
      if (keyRef !== expected) return { ok: false, reason: "staging_mismatch" };
    }
  }
  return { ok: true, projectRef };
}
