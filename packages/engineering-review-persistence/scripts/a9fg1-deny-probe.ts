/**
 * EOS-A9F-G1: same-workspace role deny + cross-code invisibility.
 * Prints status/codes only. Never prints passwords, JWTs, or unauthorized names.
 */
import { createClient } from "@supabase/supabase-js";
import { certUserPassword, loadLocalEnv, resolveSupabaseAnonKey, resolveSupabaseUrl } from "../src/env";

loadLocalEnv();

const STAGING_REF = "rntonzigxwxcjlcsadip";
const TENANT_A = "44809b8f-af76-4a50-9a72-f624fc6d72d6";
const WS_A1 = "a795a9e0-9d88-4b43-a96e-bb390a2c3f7b";
const EMAIL = "cert-er-a1@rtb-cert.test";
const ER_A1_ID = "4729d258-f953-45f6-927c-2ba2450365a1";
const FOREIGN_PROJECT = "00000000-0000-4000-8000-000000000099";

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
const jwt = signed.data.session.access_token;

async function rest(path: string, options: RequestInit = {}, token?: string) {
  const headers: Record<string, string> = {
    apikey: anon!,
    Accept: "application/json",
    Prefer: "return=representation",
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const response = await fetch(`${url}/rest/v1/${path}`, { ...options, headers });
  const text = await response.text();
  let code: string | null = null;
  let message: string | null = null;
  let count = 0;
  try {
    const parsed = text ? JSON.parse(text) : null;
    if (Array.isArray(parsed)) count = parsed.length;
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      code = typeof parsed.code === "string" ? parsed.code : null;
      message = typeof parsed.message === "string" ? parsed.message : null;
    }
  } catch {
    code = "non_json";
  }
  return { status: response.status, code, has_message: Boolean(message), count };
}

const mapping = await rest(
  "engineering_document_status_mappings",
  {
    method: "POST",
    body: JSON.stringify({
      tenant_id: TENANT_A,
      workspace_id: WS_A1,
      project_id: ER_A1_ID,
      source_system: "project",
      raw_status_code: "A9FG1",
      semantic: "FOR_REVIEW",
      mapping_version: "v1",
    }),
  },
  jwt,
);

const foreignRead = await rest(
  `engineering_projects?select=id,project_code,project_name&id=eq.${FOREIGN_PROJECT}`,
  {},
  jwt,
);
const a2Read = await rest("engineering_projects?select=id,project_code,project_name&project_code=eq.ER-A2", {}, jwt);
const b1Read = await rest("engineering_projects?select=id,project_code,project_name&project_code=eq.ER-B1", {}, jwt);
const anonRead = await rest(`engineering_projects?select=id&id=eq.${ER_A1_ID}`);

const denied =
  mapping.status >= 400 &&
  mapping.code !== "mfa_required" &&
  mapping.code !== "identity_assurance_insufficient";

console.log(
  JSON.stringify({
    engineer_mapping_status: mapping.status,
    engineer_mapping_code: mapping.code,
    engineer_mapping_denied_not_mfa: denied,
    foreign_uuid_visible: foreignRead.count > 0,
    same_tenant_other_workspace_visible: a2Read.count > 0,
    other_tenant_visible: b1Read.count > 0,
    anonymous_authorized_project_visible: anonRead.count > 0,
    anonymous_status: anonRead.status,
  }),
);
