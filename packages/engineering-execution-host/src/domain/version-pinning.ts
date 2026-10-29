/**
 * Provider version pinning — mismatch fails closed.
 */

export type VersionCompatibilityPolicy =
  | { mode: "exact"; version: string }
  | { mode: "minimum"; version: string }
  | { mode: "any_declared" };

export type VersionPinCheckResult =
  | { ok: true; requested: string | null; actual: string; policy: VersionCompatibilityPolicy }
  | {
      ok: false;
      reason: "version_mismatch" | "version_unknown";
      requested: string | null;
      actual: string | null;
      policy: VersionCompatibilityPolicy;
    };

function normalize(v: string): string {
  return v.trim().replace(/^v/i, "");
}

function cmpSemverLike(a: string, b: string): number {
  const pa = normalize(a).split(".").map((x) => Number(x) || 0);
  const pb = normalize(b).split(".").map((x) => Number(x) || 0);
  const n = Math.max(pa.length, pb.length);
  for (let i = 0; i < n; i++) {
    const d = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (d !== 0) return d < 0 ? -1 : 1;
  }
  return 0;
}

export function checkProviderVersionPin(input: {
  policy: VersionCompatibilityPolicy;
  actualVersion: string | null | undefined;
}): VersionPinCheckResult {
  const actual = input.actualVersion?.trim() || null;
  if (!actual) {
    return {
      ok: false,
      reason: "version_unknown",
      requested:
        input.policy.mode === "any_declared" ? null : input.policy.version,
      actual: null,
      policy: input.policy,
    };
  }
  if (input.policy.mode === "any_declared") {
    return { ok: true, requested: null, actual, policy: input.policy };
  }
  if (input.policy.mode === "exact") {
    if (normalize(actual) !== normalize(input.policy.version)) {
      return {
        ok: false,
        reason: "version_mismatch",
        requested: input.policy.version,
        actual,
        policy: input.policy,
      };
    }
    return {
      ok: true,
      requested: input.policy.version,
      actual,
      policy: input.policy,
    };
  }
  // minimum
  if (cmpSemverLike(actual, input.policy.version) < 0) {
    return {
      ok: false,
      reason: "version_mismatch",
      requested: input.policy.version,
      actual,
      policy: input.policy,
    };
  }
  return {
    ok: true,
    requested: input.policy.version,
    actual,
    policy: input.policy,
  };
}
