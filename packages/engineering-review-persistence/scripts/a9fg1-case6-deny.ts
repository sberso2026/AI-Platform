/**
 * EOS-A9F-G1 Case 6 + same-workspace unauthorized deny.
 * Prints status/codes/booleans only. Never prints passwords, JWTs, or unauthorized names.
 */
import { createClient } from "@supabase/supabase-js";
import { certUserPassword, loadLocalEnv, resolveSupabaseAnonKey, resolveSupabaseUrl } from "../src/env";

loadLocalEnv();

const STAGING_REF = "rntonzigxwxcjlcsadip";
const TENANT_A = "44809b8f-af76-4a50-9a72-f624fc6d72d6";
const WS_A1 = "a795a9e0-9d88-4b43-a96e-bb390a2c3f7b";
const ER_A1_ID = "4729d258-f953-45f6-927c-2ba2450365a1";
const HOST = "http://127.0.0.1:3002";

const url = resolveSupabaseUrl();
const anon = resolveSupabaseAnonKey();
if (!url || !anon) throw new Error("staging anon config missing");
if (!url.includes(STAGING_REF)) throw new Error("refused non-staging url");

function jwtAal(token: string): string {
  const part = token.split(".")[1];
  if (!part) return "unknown";
  const normalized = part.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
  const payload = JSON.parse(Buffer.from(padded, "base64").toString("utf8")) as { aal?: string };
  return String(payload.aal ?? "unknown");
}

function notMfa(code: string | null): boolean {
  return code !== "mfa_required" && code !== "identity_assurance_insufficient";
}

async function signIn(email: string) {
  const auth = createClient(url!, anon!, { auth: { persistSession: false, autoRefreshToken: false } });
  const signed = await auth.auth.signInWithPassword({ email, password: certUserPassword() });
  const token = signed.data.session?.access_token;
  if (!token) return null;
  return { token, aal: jwtAal(token), refresh: signed.data.session?.refresh_token, expiresIn: signed.data.session?.expires_in, expiresAt: signed.data.session?.expires_at };
}

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
  let count = 0;
  let hasTitleLeak = false;
  try {
    const parsed = text ? JSON.parse(text) : null;
    if (Array.isArray(parsed)) count = parsed.length;
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      code = typeof (parsed as { code?: string }).code === "string" ? (parsed as { code: string }).code : null;
    }
    hasTitleLeak = /hidden-workspace|Review Project A2|Review Project B1|ER-A2|ER-B1/i.test(text);
  } catch {
    code = "non_json";
  }
  return { status: response.status, code, count, hasTitleLeak };
}

function cookieFor(session: NonNullable<Awaited<ReturnType<typeof signIn>>>, workspaceId: string) {
  const encoded = Buffer.from(
    JSON.stringify({
      access_token: session.token,
      refresh_token: session.refresh,
      token_type: "bearer",
      expires_in: session.expiresIn ?? 3600,
      expires_at: session.expiresAt,
    }),
    "utf8",
  ).toString("base64");
  return `sb-${STAGING_REF}-auth-token=base64-${encoded}; rtb_active_tenant_id=${TENANT_A}; rtb_active_workspace_id=${workspaceId}`;
}

async function apiProjects(session: NonNullable<Awaited<ReturnType<typeof signIn>>>, workspaceId: string) {
  const response = await fetch(`${HOST}/api/engineering/projects`, {
    headers: {
      Cookie: cookieFor(session, workspaceId),
      "x-rtb-tenant-id": TENANT_A,
      "x-rtb-workspace-id": workspaceId,
    },
  });
  const json = (await response.json().catch(() => ({}))) as {
    data?: Array<{ id?: string; project_code?: string }>;
    error?: { code?: string };
    code?: string;
  };
  const rows = Array.isArray(json.data) ? json.data : [];
  return {
    status: response.status,
    code: json.error?.code ?? json.code ?? null,
    count: rows.length,
    hasErA1: rows.some((row) => row.id === ER_A1_ID || row.project_code === "ER-A1"),
    hasForeignCodes: rows.some((row) => row.project_code === "ER-A2" || row.project_code === "ER-B1"),
  };
}

const a1 = await signIn("cert-er-a1@rtb-cert.test");
const a2 = await signIn("cert-er-a2@rtb-cert.test");
const b1 = await signIn("cert-er-b1@rtb-cert.test");
const aAdmin = await signIn("cert-er-a-admin@rtb-cert.test");
if (!a1) {
  console.log(JSON.stringify({ ok: false, reason: "a1_signin_failed" }));
  process.exit(1);
}

const mappingBody = {
  tenant_id: TENANT_A,
  workspace_id: WS_A1,
  project_id: ER_A1_ID,
  source_system: "project",
  raw_status_code: "A9FG1-UNAUTH",
  semantic: "FOR_REVIEW",
  mapping_version: "v1",
};

const engineerMapping = await rest("engineering_document_status_mappings", { method: "POST", body: JSON.stringify(mappingBody) }, a1.token);
const engineerDef = await rest(
  "engineering_project_deliverable_definitions",
  {
    method: "POST",
    body: JSON.stringify({
      tenant_id: TENANT_A,
      workspace_id: WS_A1,
      project_id: ER_A1_ID,
      definition_id: "EOS-DLV-UNAUTH",
      definition_version: "v1",
      code: "UNAUTH-A9FG1",
      name: "Unauthorized definition",
      purpose: "rls",
      responsible_discipline: "PROCESS",
    }),
  },
  a1.token,
);

let adminMappingCreated = false;
let adminMappingStatus = 0;
let adminMappingCode: string | null = null;
if (aAdmin) {
  const adminMapping = await rest(
    "engineering_document_status_mappings",
    {
      method: "POST",
      body: JSON.stringify({ ...mappingBody, raw_status_code: "A9FG1-ADMIN", configured_by: "admin" }),
    },
    aAdmin.token,
  );
  adminMappingStatus = adminMapping.status;
  adminMappingCode = adminMapping.code;
  adminMappingCreated = adminMapping.status < 300;
  if (adminMappingCreated) {
    await rest(
      `engineering_document_status_mappings?raw_status_code=eq.A9FG1-ADMIN&project_id=eq.${ER_A1_ID}`,
      { method: "DELETE" },
      aAdmin.token,
    );
  }
}

const a1SeesA2 = await rest("engineering_projects?select=id&project_code=eq.ER-A2", {}, a1.token);
const a1SeesB1 = await rest("engineering_projects?select=id&project_code=eq.ER-B1", {}, a1.token);
const a2SeesA1 = a2 ? await rest(`engineering_projects?select=id&id=eq.${ER_A1_ID}`, {}, a2.token) : { status: 0, code: "no_session", count: 0, hasTitleLeak: false };
const b1SeesA1 = b1 ? await rest(`engineering_projects?select=id&id=eq.${ER_A1_ID}`, {}, b1.token) : { status: 0, code: "no_session", count: 0, hasTitleLeak: false };
const anonSeesA1 = await rest(`engineering_projects?select=id&id=eq.${ER_A1_ID}`);
const a1Selector = await apiProjects(a1, WS_A1);

const aal1Adopt = await fetch(`${HOST}/api/engineering/deliverables`, {
  method: "POST",
  headers: {
    Cookie: cookieFor(a1, WS_A1),
    "x-rtb-tenant-id": TENANT_A,
    "x-rtb-workspace-id": WS_A1,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ action: "adopt", projectId: ER_A1_ID, code: "MECH-DS-FEED" }),
});
const aal1AdoptJson = (await aal1Adopt.json().catch(() => ({}))) as { error?: { code?: string; details?: { reason?: string } }; code?: string };
const aal1AdoptCode = aal1AdoptJson.error?.code ?? aal1AdoptJson.code ?? null;
const aal1AdoptReason = aal1AdoptJson.error?.details?.reason ?? null;

console.log(
  JSON.stringify(
    {
      fixtures: {
        a1: Boolean(a1),
        a2: Boolean(a2),
        b1: Boolean(b1),
        aAdmin: Boolean(aAdmin),
      },
      password_session_aal: {
        a1: a1.aal,
        a2: a2?.aal ?? null,
        b1: b1?.aal ?? null,
      },
      same_workspace_engineer_mapping: {
        status: engineerMapping.status,
        code: engineerMapping.code,
        denied_not_mfa: engineerMapping.status >= 400 && notMfa(engineerMapping.code),
      },
      same_workspace_engineer_definition: {
        status: engineerDef.status,
        code: engineerDef.code,
        denied_not_mfa: engineerDef.status >= 400 && notMfa(engineerDef.code),
      },
      same_workspace_admin_mapping_allowed: adminMappingCreated,
      admin_mapping_status: adminMappingStatus,
      admin_mapping_code: adminMappingCode,
      cross_workspace: {
        a1_other_workspace_visible: a1SeesA2.count > 0,
        a1_other_tenant_visible: a1SeesB1.count > 0,
        a2_sees_a1: a2SeesA1.count > 0,
        b1_sees_a1: b1SeesA1.count > 0,
        title_leak: a1SeesA2.hasTitleLeak || a1SeesB1.hasTitleLeak || a2SeesA1.hasTitleLeak || b1SeesA1.hasTitleLeak,
      },
      anonymous_a1_visible: anonSeesA1.count > 0,
      selector: {
        status: a1Selector.status,
        count: a1Selector.count,
        has_er_a1: a1Selector.hasErA1,
        foreign_codes_present: a1Selector.hasForeignCodes,
      },
      aal1_api_adopt: {
        status: aal1Adopt.status,
        code: aal1AdoptCode,
        reason: aal1AdoptReason,
      },
    },
    null,
    2,
  ),
);
