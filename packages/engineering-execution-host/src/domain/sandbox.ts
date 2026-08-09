/**
 * Sandbox policy enforcement helpers (path, timeout, env, no shell injection).
 */

export type SandboxEnforcementResult =
  | { ok: true }
  | { ok: false; reason: string };

const FORBIDDEN_ENV = [
  "SUPABASE_SERVICE_ROLE_KEY",
  "PLATFORM_EMBEDDING_API_KEY",
  "OPENAI_API_KEY",
  "MICROSOFT_CLIENT_SECRET",
  "CERT_USER_PASSWORD",
] as const;

export function assertPathConfinement(
  rootDir: string,
  candidatePath: string,
): SandboxEnforcementResult {
  const root = rootDir.replace(/[\\/]+$/, "");
  const normalized = candidatePath.replace(/\\/g, "/");
  const rootNorm = root.replace(/\\/g, "/");
  if (normalized.includes("..")) {
    return { ok: false, reason: "path_traversal_forbidden" };
  }
  if (!normalized.startsWith(rootNorm)) {
    return { ok: false, reason: "path_outside_workspace" };
  }
  return { ok: true };
}

export function assertProcessTimeout(timeoutMs: number): SandboxEnforcementResult {
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    return { ok: false, reason: "process_timeout_required" };
  }
  if (timeoutMs > 24 * 60 * 60 * 1000) {
    return { ok: false, reason: "process_timeout_excessive" };
  }
  return { ok: true };
}

export function assertNoArbitraryShellInjection(
  command: string,
): SandboxEnforcementResult {
  if (/[;&|`$<>]/.test(command) || /\n|\r/.test(command)) {
    return { ok: false, reason: "arbitrary_shell_injection_forbidden" };
  }
  return { ok: true };
}

export function filterBoundedEnvironment(
  env: Record<string, string | undefined>,
  allowList: string[],
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const key of allowList) {
    const val = env[key];
    if (typeof val === "string" && val.length > 0) {
      if ((FORBIDDEN_ENV as readonly string[]).includes(key)) continue;
      out[key] = val;
    }
  }
  return out;
}

export function assertCrossTenantIsolation(
  jobTenantId: string,
  hostTenantId: string,
): SandboxEnforcementResult {
  if (!jobTenantId || !hostTenantId || jobTenantId !== hostTenantId) {
    return { ok: false, reason: "cross_tenant_isolation_violation" };
  }
  return { ok: true };
}

export function certifySandboxBaseline(input: {
  rootDir: string;
  candidatePath: string;
  timeoutMs: number;
  command: string;
  jobTenantId: string;
  hostTenantId: string;
}): SandboxEnforcementResult {
  for (const check of [
    assertPathConfinement(input.rootDir, input.candidatePath),
    assertProcessTimeout(input.timeoutMs),
    assertNoArbitraryShellInjection(input.command),
    assertCrossTenantIsolation(input.jobTenantId, input.hostTenantId),
  ]) {
    if (!check.ok) return check;
  }
  return { ok: true };
}
