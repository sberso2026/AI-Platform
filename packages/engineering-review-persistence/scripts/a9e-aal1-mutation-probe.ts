/**
 * EOS-A9E AAL1 mutation probe. Prints status codes and error codes only.
 * Never prints passwords, JWTs, or cookies.
 */
import { createClient } from "@supabase/supabase-js";
import { certUserPassword, loadLocalEnv, resolveSupabaseAnonKey, resolveSupabaseUrl } from "../src/env";

loadLocalEnv();

const STAGING_REF = "rntonzigxwxcjlcsadip";
const TENANT_A = "44809b8f-af76-4a50-9a72-f624fc6d72d6";
const WS_A1 = "a795a9e0-9d88-4b43-a96e-bb390a2c3f7b";
const EMAIL = "cert-er-a1@rtb-cert.test";
const HOST = "http://127.0.0.1:3002";

function jwtAal(token) {
  const part = token.split(".")[1];
  if (!part) return "unknown";
  const normalized = part.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
  const payload = JSON.parse(Buffer.from(padded, "base64").toString("utf8"));
  return String(payload.aal ?? "unknown");
}

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
const aal = jwtAal(session.access_token);
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

async function call(method, path, body) {
  const response = await fetch(`${HOST}${path}`, {
    method,
    headers: {
      Cookie: cookie,
      "x-rtb-tenant-id": TENANT_A,
      "x-rtb-workspace-id": WS_A1,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await response.text();
  let code = null;
  let reason = null;
  try {
    const json = JSON.parse(text);
    code = json?.error?.code ?? json?.code ?? null;
    reason = json?.error?.details?.reason ?? null;
  } catch {
    code = "non_json";
  }
  return { method, path, status: response.status, code, reason };
}

const results = [];
results.push(await call("GET", "/api/engineering/deliverables?action=catalog"));
results.push(await call("POST", "/api/engineering/deliverables", { action: "adopt", projectId: "4729d258-f953-45f6-927c-2ba2450365a1", code: "MECH-DS-FEED" }));
results.push(await call("POST", "/api/engineering/lifecycle", { action: "decide", approved: true }));
results.push(await call("POST", "/api/engineering/settings/deliverables", { action: "configureMapping", rawStatusCode: "ZZ", semantic: "FOR_CONSTRUCTION_USE" }));
results.push(await call("GET", "/api/engineering/settings/deliverables"));

console.log(JSON.stringify({ named_pilot: "cert-er-a1", live_password_aal: aal, host: HOST, results }, null, 2));
