/**
 * UX helpers for Supabase Auth MFA enrollment/challenge.
 * This is not a security boundary. Review server policy still requires AAL2.
 */
export const MFA_CHALLENGE_ROUTE = "/login/mfa";
export const MFA_SECURITY_ROUTE = "/settings/security";

export type ReviewMfaUiStatus = "Not configured" | "Configured" | "Verification required";

export type ReviewMfaFactorView = {
  id: string;
  friendlyName: string;
  factorType: string;
  status: string;
};

const ALLOWED_RETURN_PREFIXES = [
  "/review",
  "/settings/security",
  "/engineering",
  "/platform",
  "/system",
  "/audit",
] as const;

export function safeMfaReturnPath(raw: string | null | undefined, fallback = "/review"): string {
  if (!raw) return fallback;
  let value = raw.trim();
  try {
    value = decodeURIComponent(value);
  } catch {
    return fallback;
  }
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("://") || value.includes("\\")) {
    return fallback;
  }
  const pathOnly = value.split("?")[0]?.split("#")[0] ?? "";
  const normalized = normalizeRelativePath(pathOnly);
  if (!normalized) return fallback;
  const allowed = ALLOWED_RETURN_PREFIXES.some((prefix) => normalized === prefix || normalized.startsWith(`${prefix}/`));
  return allowed ? normalized : fallback;
}

function normalizeRelativePath(path: string): string | null {
  const segments: string[] = [];
  for (const segment of path.split("/")) {
    if (!segment || segment === ".") continue;
    if (segment === "..") {
      segments.pop();
      continue;
    }
    if (segment.includes(":") || segment.includes("\\") || segment.includes("@")) return null;
    segments.push(segment);
  }
  return `/${segments.join("/")}`;
}

export function reviewMfaUiStatus(input: {
  verifiedTotpCount: number;
  currentAal: string | null | undefined;
  enrollmentInProgress: boolean;
}): ReviewMfaUiStatus {
  if (input.enrollmentInProgress) return "Verification required";
  if (input.verifiedTotpCount <= 0) return "Not configured";
  if (String(input.currentAal ?? "") !== "aal2") return "Verification required";
  return "Configured";
}

export function verifiedTotpFactors(
  factors: ReadonlyArray<{ id?: string; factor_type?: string; status?: string; friendly_name?: string | null }>,
): ReviewMfaFactorView[] {
  return factors
    .filter((factor) => factor.factor_type === "totp" && factor.status === "verified" && Boolean(factor.id))
    .map((factor) => ({
      id: String(factor.id),
      friendlyName: factor.friendly_name?.trim() || "Authenticator",
      factorType: "totp",
      status: "verified",
    }));
}

export function totpQrImageSrc(qrCode: string | null | undefined): string | null {
  const raw = qrCode?.trim();
  if (!raw) return null;
  if (raw.startsWith("data:")) return raw;
  if (raw.startsWith("<svg") || raw.startsWith("<?xml")) {
    return `data:image/svg+xml;utf8,${encodeURIComponent(raw)}`;
  }
  return null;
}

export function postPasswordMfaDestination(input: {
  requireMfa: boolean;
  currentAal: string | null | undefined;
  verifiedTotpCount: number;
  nextPath?: string | null;
}): string {
  const next = safeMfaReturnPath(input.nextPath, "/engineering");
  if (!input.requireMfa) return next === "/review" || next.startsWith("/review/") ? next : "/engineering";
  if (String(input.currentAal ?? "") === "aal2") return next;
  if (input.verifiedTotpCount > 0) {
    return `${MFA_CHALLENGE_ROUTE}?next=${encodeURIComponent(next)}`;
  }
  return `${MFA_SECURITY_ROUTE}?next=${encodeURIComponent(next)}`;
}

export function challengeAfterVerifyDestination(input: {
  currentAal: string | null | undefined;
  nextPath?: string | null;
}): { ok: true; path: string } | { ok: false; reason: "aal2_required" } {
  if (String(input.currentAal ?? "") !== "aal2") {
    return { ok: false, reason: "aal2_required" };
  }
  return { ok: true, path: safeMfaReturnPath(input.nextPath, "/review") };
}

/** Safe log/audit view of an enrollment payload. Never include TOTP secrets. */
export function redactMfaEnrollmentForLog(input: {
  id?: string;
  type?: string;
  totp?: { qr_code?: string; secret?: string; uri?: string };
}): { factorId: string | null; factorType: string | null } {
  return {
    factorId: input.id ? String(input.id) : null,
    factorType: input.type ? String(input.type) : null,
  };
}

export function payloadContainsMfaSecret(value: unknown): boolean {
  const serialized = JSON.stringify(value ?? {}).toLowerCase();
  return (
    serialized.includes("totp") && serialized.includes("secret")
  ) || serialized.includes("otpauth://") || /\"secret\"\s*:\s*\"[a-z2-7]{16,}/i.test(serialized);
}

export const MFA_SESSION_UPGRADE_FAILED_MESSAGE =
  "Authentication could not be upgraded. Try again.";

export function mapMfaVerifyError(message: string | null | undefined): string {
  const text = (message ?? "").toLowerCase();
  if (text.includes("invalid") || text.includes("expired") || text.includes("code")) {
    return "Verification failed. Check the authenticator code and try again.";
  }
  return "Additional verification failed. Try again.";
}
