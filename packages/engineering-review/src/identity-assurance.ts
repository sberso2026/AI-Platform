/**
 * Auth assurance helpers for Review. Mirrors privileged MFA AAL/AMR semantics
 * without importing Engineering OS (no reverse package edge).
 */
export type AuthAssuranceLevel = "aal1" | "aal2" | "unknown";

export type AuthAssuranceClaims = {
  aal?: string | null;
  amr?: Array<string | { method?: string }> | null;
};

export function resolveAuthAssuranceLevel(claims: AuthAssuranceClaims): AuthAssuranceLevel {
  const aal = (claims.aal ?? "").toLowerCase();
  if (aal === "aal2") return "aal2";
  if (aal === "aal1") return "aal1";

  const methods = (claims.amr ?? []).map((entry) =>
    typeof entry === "string" ? entry.toLowerCase() : (entry.method ?? "").toLowerCase(),
  );
  if (methods.some((method) => method === "totp" || method === "mfa" || method === "phone" || method === "otp")) {
    return "aal2";
  }
  if (methods.length > 0) return "aal1";
  return "unknown";
}
