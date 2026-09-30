/**
 * Ensure the A9F-C certification project exists. Prints name/created only.
 * Never prints passwords, JWTs, or TOTP.
 */
import { createClient } from "@supabase/supabase-js";
import { certUserPassword, loadLocalEnv, resolveSupabaseAnonKey, resolveSupabaseUrl } from "../src/env";

loadLocalEnv();

const STAGING_REF = "rntonzigxwxcjlcsadip";
const TENANT_A = "44809b8f-af76-4a50-9a72-f624fc6d72d6";
const WS_A1 = "a795a9e0-9d88-4b43-a96e-bb390a2c3f7b";
const EMAIL = "cert-er-a1@rtb-cert.test";
const HOST = "http://127.0.0.1:3002";
const NAME = "EOS A9 Browser Certification";
const CODE = "EOS-A9F-C";

const url = resolveSupabaseUrl();
const anon = resolveSupabaseAnonKey();
if (!url || !anon) throw new Error("staging anon config missing");
if (!url.includes(STAGING_REF)) throw new Error("refused non-staging url");

const auth = createClient(url, anon, { auth: { persistSession: false, autoRefreshToken: false } });
const signed = await auth.auth.signInWithPassword({ email: EMAIL, password: certUserPassword() });
if (!signed.data.session?.access_token) {
  console.log(JSON.stringify({ ok: false, reason: "password_signin_failed" }));
  process.exit(1);
}
const session = signed.data.session;
const encoded = Buffer.from(
  JSON.stringify({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    token_type: "bearer",
    expires_in: session.expires_in ?? 3600,
    expires_at: session.expires_at,
  }),
  "utf8",
).toString("base64");
const cookie = `sb-${STAGING_REF}-auth-token=base64-${encoded}; rtb_active_tenant_id=${TENANT_A}; rtb_active_workspace_id=${WS_A1}`;

const listed = await fetch(`${HOST}/api/engineering/projects`, {
  headers: { Cookie: cookie, "x-rtb-tenant-id": TENANT_A, "x-rtb-workspace-id": WS_A1 },
});
const listedJson = (await listed.json()) as { data?: Array<{ id?: string; project_name?: string; project_code?: string }> };
const existing = (listedJson.data ?? []).find(
  (row) => row.project_name === NAME || row.project_code === CODE,
);
if (existing?.id) {
  const assurance = await fetch(`${HOST}/api/platform/identity-assurance`, {
    headers: { Cookie: cookie },
  });
  const assuranceJson = (await assurance.json().catch(() => ({}))) as {
    authenticated?: boolean;
    aal?: string;
    verifiedFactors?: number;
  };
  console.log(
    JSON.stringify({
      ok: true,
      created: false,
      name: NAME,
      status: listed.status,
      password_session_aal: assuranceJson.aal ?? null,
      authenticated: assuranceJson.authenticated === true,
      verifiedFactors: assuranceJson.verifiedFactors ?? null,
    }),
  );
  process.exit(0);
}

const created = await fetch(`${HOST}/api/engineering/projects`, {
  method: "POST",
  headers: {
    Cookie: cookie,
    "x-rtb-tenant-id": TENANT_A,
    "x-rtb-workspace-id": WS_A1,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    projectCode: CODE,
    projectName: NAME,
    projectType: "certification",
    metadata: { certification: "EOS-A9F-C", fixture: true },
  }),
});
const assurance = await fetch(`${HOST}/api/platform/identity-assurance`, {
  headers: { Cookie: cookie },
});
const assuranceJson = (await assurance.json().catch(() => ({}))) as {
  authenticated?: boolean;
  aal?: string;
  verifiedFactors?: number;
};
console.log(
  JSON.stringify({
    ok: existing ? true : created.ok,
    created: existing ? false : created.ok,
    name: NAME,
    project_status: existing ? listed.status : created.status,
    password_session_aal: assuranceJson.aal ?? null,
    authenticated: assuranceJson.authenticated === true,
    verifiedFactors: assuranceJson.verifiedFactors ?? null,
  }),
);
