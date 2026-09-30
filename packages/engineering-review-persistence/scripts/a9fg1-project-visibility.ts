/**
 * EOS-A9F-G1: cert-user JWT/RLS + selector API visibility.
 * Prints codes/counts/status only. Never prints passwords, JWTs, or cookies.
 */
import { createClient } from "@supabase/supabase-js";
import { certUserPassword, loadLocalEnv, resolveSupabaseAnonKey, resolveSupabaseUrl } from "../src/env";

loadLocalEnv();

const STAGING_REF = "rntonzigxwxcjlcsadip";
const TENANT_A = "44809b8f-af76-4a50-9a72-f624fc6d72d6";
const WS_A1 = "a795a9e0-9d88-4b43-a96e-bb390a2c3f7b";
const EMAIL = "cert-er-a1@rtb-cert.test";
const HOST = "http://127.0.0.1:3002";
const ER_A1_ID = "4729d258-f953-45f6-927c-2ba2450365a1";

const url = resolveSupabaseUrl();
const anon = resolveSupabaseAnonKey();
if (!url || !anon) throw new Error("staging anon config missing");
if (!url.includes(STAGING_REF)) throw new Error("refused non-staging url");

function restHeaders(jwt?: string) {
  const headers: Record<string, string> = {
    apikey: anon!,
    Accept: "application/json",
  };
  if (jwt) headers.Authorization = `Bearer ${jwt}`;
  return headers;
}

async function rest(path: string, jwt?: string) {
  const response = await fetch(`${url}/rest/v1/${path}`, { headers: restHeaders(jwt) });
  const text = await response.text();
  let body: unknown = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = "non_json";
  }
  return { status: response.status, body };
}

function rowCount(body: unknown): number {
  return Array.isArray(body) ? body.length : 0;
}

const auth = createClient(url, anon, { auth: { persistSession: false, autoRefreshToken: false } });
const signed = await auth.auth.signInWithPassword({ email: EMAIL, password: certUserPassword() });
if (!signed.data.session?.access_token) {
  console.log(JSON.stringify({ ok: false, reason: "password_signin_failed" }));
  process.exit(1);
}
const jwt = signed.data.session.access_token;

const a1List = await rest(
  `engineering_projects?select=id,project_code,project_name,workspace_id,tenant_id,metadata&tenant_id=eq.${TENANT_A}&workspace_id=eq.${WS_A1}`,
  jwt,
);
const a1Rows = Array.isArray(a1List.body)
  ? (a1List.body as Array<{
      id?: string;
      project_code?: string;
      project_name?: string;
      workspace_id?: string;
      tenant_id?: string;
      metadata?: Record<string, unknown>;
    }>)
  : [];
const erA1 = a1Rows.find((row) => row.id === ER_A1_ID);
const a2ByCode = await rest(`engineering_projects?select=id&project_code=eq.ER-A2`, jwt);
const b1ByCode = await rest(`engineering_projects?select=id&project_code=eq.ER-B1`, jwt);
const crusher = await rest(`engineering_projects?select=id&project_code=eq.proj-crusher-feed`, jwt);
const crusherById = await rest(`engineering_projects?select=id&id=eq.proj-crusher-feed`, jwt);
const anonList = await rest(
  `engineering_projects?select=id&tenant_id=eq.${TENANT_A}&workspace_id=eq.${WS_A1}`,
);
const reviewPkgs = await rest(
  `engineering_review_packages?select=id&engineering_project_id=eq.${ER_A1_ID}&limit=1`,
  jwt,
);
const reviewPkgsAlt = await rest(`engineering_review_packages?select=id&project_id=eq.${ER_A1_ID}&limit=1`, jwt);

const encoded = Buffer.from(
  JSON.stringify({
    access_token: jwt,
    refresh_token: signed.data.session.refresh_token,
    token_type: "bearer",
    expires_in: signed.data.session.expires_in ?? 3600,
    expires_at: signed.data.session.expires_at,
  }),
  "utf8",
).toString("base64");
const cookie = `sb-${STAGING_REF}-auth-token=base64-${encoded}; rtb_active_tenant_id=${TENANT_A}; rtb_active_workspace_id=${WS_A1}`;

const api = await fetch(`${HOST}/api/engineering/projects`, {
  headers: { Cookie: cookie, "x-rtb-tenant-id": TENANT_A, "x-rtb-workspace-id": WS_A1 },
});
const apiText = await api.text();
let apiCode: string | null = null;
let apiCount: number | null = null;
let apiReason: string | null = null;
try {
  const json = JSON.parse(apiText) as {
    data?: unknown[];
    error?: { code?: string; details?: { reason?: string; reasonCode?: string } };
    code?: string;
  };
  apiCode = json?.error?.code ?? json?.code ?? null;
  apiReason = json?.error?.details?.reason ?? json?.error?.details?.reasonCode ?? null;
  apiCount = Array.isArray(json.data) ? json.data.length : null;
} catch {
  apiCode = "non_json";
}

console.log(
  JSON.stringify(
    {
      jwt_a1_list_status: a1List.status,
      jwt_a1_count: a1Rows.length,
      jwt_a1_projects: a1Rows.map((row) => ({
        id: row.id,
        code: row.project_code,
        name: row.project_name,
        workspace_id: row.workspace_id,
        tenant_match: row.tenant_id === TENANT_A,
        hidden_certification_fixture: row.metadata?.certification_fixture === true,
        hidden_from_pilot_ui: row.metadata?.hidden_from_pilot_ui === true,
      })),
      er_a1_jwt_visible: Boolean(erA1),
      er_a1_workspace: erA1?.workspace_id ?? null,
      unauthorized_same_tenant_code_visible: rowCount(a2ByCode.body) > 0,
      unauthorized_cross_tenant_code_visible: rowCount(b1ByCode.body) > 0,
      crusher_code_visible: rowCount(crusher.body) > 0,
      crusher_id_visible: rowCount(crusherById.body) > 0,
      anonymous_status: anonList.status,
      anonymous_count: rowCount(anonList.body),
      review_packages_by_engineering_project_id_status: reviewPkgs.status,
      review_packages_by_project_id_status: reviewPkgsAlt.status,
      selector_api_status: api.status,
      selector_api_code: apiCode,
      selector_api_reason: apiReason,
      selector_api_count: apiCount,
    },
    null,
    2,
  ),
);
