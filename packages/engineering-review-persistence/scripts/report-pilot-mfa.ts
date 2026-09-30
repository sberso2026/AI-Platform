/**
 * Report MFA factor counts for designated staging Review cert users.
 * Never prints JWTs, passwords, or TOTP secrets.
 */
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { evaluateReviewIdentityPolicy, resolveReviewIdentityPolicy } from "@rtb/engineering-review";
import { ER_CERT_SLUG_PREFIX } from "../src/fixtures";
import { certUserPassword, loadLocalEnv } from "../src/env";

loadLocalEnv();

const STAGING_REF = "rntonzigxwxcjlcsadip";
const EOS_REF = "wcydlhqiqdwgoaqrlget";
const STAGING_URL = `https://${STAGING_REF}.supabase.co`;

function jwtAal(token: string): string {
  const part = token.split(".")[1];
  if (!part) return "unknown";
  const normalized = part.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
  const payload = JSON.parse(Buffer.from(padded, "base64").toString("utf8")) as { aal?: string };
  return String(payload.aal ?? "unknown");
}

const dir = mkdtempSync(join(tmpdir(), "rtb-mfa-"));
try {
  const listed = spawnSync(
    "npx",
    ["--yes", "supabase", "projects", "api-keys", "--project-ref", STAGING_REF, "-o", "json"],
    { encoding: "utf8", shell: true, stdio: ["pipe", "pipe", "pipe"] },
  );
  if (listed.status !== 0) throw new Error("supabase api-keys failed");
  writeFileSync(join(dir, "keys.json"), listed.stdout ?? "", { mode: 0o600 });
  const parsed = JSON.parse(readFileSync(join(dir, "keys.json"), "utf8")) as Array<{ name?: string; api_key?: string }>;
  const anon = parsed.find((row) => row.name === "anon")?.api_key?.trim();
  const service = parsed.find((row) => row.name === "service_role")?.api_key?.trim();
  if (!anon || !service) throw new Error("staging keys missing");
  if (anon.includes(EOS_REF) || service.includes(EOS_REF)) throw new Error("refused EOS credential");

  const admin = createClient(STAGING_URL, service, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: tenant, error: tenantError } = await admin
    .from("tenants")
    .select("id, slug, settings")
    .eq("slug", `${ER_CERT_SLUG_PREFIX}a`)
    .maybeSingle();
  if (tenantError || !tenant) throw new Error("pilot tenant missing");
  const policy = resolveReviewIdentityPolicy((tenant.settings as Record<string, unknown>) ?? {});

  const users = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (users.error) throw new Error(users.error.message);
  const pilots = (users.data.users ?? []).filter((user) =>
    String(user.email ?? "").startsWith("cert-er-a1@") || String(user.user_metadata?.full_name ?? "").includes("cert-er-a1"),
  );
  const named = pilots[0] ?? (users.data.users ?? []).find((user) => String(user.email ?? "").includes("cert-er-a1"));

  let factors = 0;
  let aal1 = "unknown";
  let aal1Decision = "not_tested";
  if (named?.id) {
    const listedFactors = await admin.auth.admin.mfa.listFactors({ userId: named.id });
    factors = (listedFactors.data?.factors ?? []).filter((factor) => factor.status === "verified").length;
    const password = certUserPassword();
    const auth = createClient(STAGING_URL, anon, { auth: { persistSession: false, autoRefreshToken: false } });
    const signed = await auth.auth.signInWithPassword({ email: String(named.email), password });
    if (signed.data.session?.access_token) {
      aal1 = jwtAal(signed.data.session.access_token);
      const decision = evaluateReviewIdentityPolicy(policy, {
        aal: aal1,
        amr: ["password"],
      });
      aal1Decision = decision.allowed ? "accepted" : decision.reason;
    }
  }

  console.log(
    JSON.stringify({
      target_project: STAGING_REF,
      tenant_slug: tenant.slug,
      requireMfa: policy.requireMfa,
      requireEnterpriseSso: policy.requireEnterpriseSso,
      named_pilot: named ? "cert-er-a1" : "missing",
      verified_mfa_factors: factors,
      live_password_aal: aal1,
      live_password_decision: aal1Decision,
      live_aal2_proven: false,
      human_enrollment_required: factors === 0,
      human_challenge_required: aal1 !== "aal2",
    }),
  );
} finally {
  rmSync(dir, { recursive: true, force: true });
}
