/**
 * BOS-16A4: provision dedicated staging tenants/users and seed BOS RLS fixtures.
 * Target: rntonzigxwxcjlcsadip only. Never wcydlhqiqdwgoaqrlget.
 * Writes gitignored .env.bos16-rls.local. Does not print secrets or JWTs.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { assessBosLiveRlsEnvironment, assessBosStagingTarget } from "../../business-os/src/release.ts";

const ROOT = fileURLToPath(new URL("../../..", import.meta.url));
const FORBIDDEN_REF = "wcydlhqiqdwgoaqrlget";
const REQUIRED_REF = "rntonzigxwxcjlcsadip";
const ENV_LOCAL = resolve(ROOT, ".env.local");
const ENV_OVERLAY = resolve(ROOT, ".env.bos16-rls.local");
const SOURCE_TYPE = "demo";
const PROVENANCE = {
  cert_fixture: true,
  phase: "BOS-16A4",
  live: false,
  production: false,
} as const;

const USERS = {
  a: {
    email: "cert-bos16-rls-a@rtb-cert.test",
    tenantSlug: "cert-bos16-rls-a",
    tenantName: "BOS-16 RLS Cert Tenant A",
    fullName: "BOS-16 RLS Test User A",
  },
  b: {
    email: "cert-bos16-rls-b@rtb-cert.test",
    tenantSlug: "cert-bos16-rls-b",
    tenantName: "BOS-16 RLS Cert Tenant B",
    fullName: "BOS-16 RLS Test User B",
  },
} as const;

type Label = keyof typeof USERS;

function log(msg: string): void {
  console.log(`[bos16-rls:provision] ${msg}`);
}

function loadEnvFile(path: string): void {
  if (!existsSync(path)) return;
  const text = readFileSync(path, "utf8");
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1);
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

function jwtClaim(token: string, claim: string): string | undefined {
  const parts = token.split(".");
  if (parts.length !== 3) return undefined;
  try {
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8")) as Record<string, unknown>;
    const value = payload[claim];
    return typeof value === "string" ? value : undefined;
  } catch {
    return undefined;
  }
}

function requireEnv(key: string): string {
  const value = process.env[key]?.trim();
  if (!value) throw new Error(`missing ${key}`);
  return value;
}

function rejectForbidden(url: string, ref: string): void {
  const haystack = `${url} ${ref}`.toLowerCase();
  if (haystack.includes(FORBIDDEN_REF)) {
    throw new Error(`forbidden shared host ${FORBIDDEN_REF} rejected`);
  }
}

async function sleep(ms: number): Promise<void> {
  await new Promise((resolveSleep) => setTimeout(resolveSleep, ms));
}

async function requireRow<T>(
  label: string,
  result: { data: T | null; error: { message: string } | null },
): Promise<T> {
  if (result.error || !result.data) {
    throw new Error(`${label}: ${result.error?.message ?? "no row"}`);
  }
  return result.data;
}

async function signInJwt(url: string, anonKey: string, email: string, password: string): Promise<string> {
  const anon = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await anon.auth.signInWithPassword({ email, password });
  if (error || !data.session?.access_token) {
    throw new Error(`JWT sign-in failed for ${email}: ${error?.message ?? "no session"}`);
  }
  return data.session.access_token;
}

async function findProfileId(admin: SupabaseClient, email: string): Promise<string | null> {
  const { data, error } = await admin.from("profiles").select("id").eq("email", email).maybeSingle();
  if (error) throw new Error(`profile lookup ${email}: ${error.message}`);
  return (data?.id as string | undefined) ?? null;
}

async function getOrCreateUser(
  admin: SupabaseClient,
  spec: (typeof USERS)[Label],
  password: string,
): Promise<string> {
  const existing = await findProfileId(admin, spec.email);
  if (existing) {
    const updated = await admin.auth.admin.updateUserById(existing, {
      password,
      email_confirm: true,
      user_metadata: {
        full_name: spec.fullName,
        tenant_name: spec.tenantName,
        tenant_slug: spec.tenantSlug,
        cert_fixture: true,
        phase: "BOS-16A4",
      },
    });
    if (updated.error) throw new Error(`updateUser ${spec.email}: ${updated.error.message}`);
    return existing;
  }

  const created = await admin.auth.admin.createUser({
    email: spec.email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: spec.fullName,
      tenant_name: spec.tenantName,
      tenant_slug: spec.tenantSlug,
      cert_fixture: true,
      phase: "BOS-16A4",
    },
  });
  if (created.error || !created.data.user?.id) {
    const raced = await findProfileId(admin, spec.email);
    if (raced) return raced;
    throw new Error(`createUser ${spec.email}: ${created.error?.message ?? "no user"}`);
  }
  return created.data.user.id;
}

async function waitForTenant(
  admin: SupabaseClient,
  slug: string,
): Promise<{ id: string; slug: string; name: string }> {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const { data, error } = await admin
      .from("tenants")
      .select("id, slug, name")
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw new Error(`tenant lookup ${slug}: ${error.message}`);
    if (data?.id) return data as { id: string; slug: string; name: string };
    await sleep(250);
  }
  throw new Error(`tenant ${slug} was not created by handle_new_user`);
}

async function defaultWorkspace(
  admin: SupabaseClient,
  tenantId: string,
): Promise<{ id: string; slug: string }> {
  const { data, error } = await admin
    .from("workspaces")
    .select("id, slug")
    .eq("tenant_id", tenantId)
    .eq("slug", "default")
    .maybeSingle();
  if (error || !data?.id) {
    throw new Error(`default workspace missing for tenant ${tenantId}: ${error?.message ?? "no row"}`);
  }
  return data as { id: string; slug: string };
}

async function restrictToSingleTenant(
  admin: SupabaseClient,
  userId: string,
  keepTenantId: string,
): Promise<void> {
  const { data, error } = await admin
    .from("tenant_memberships")
    .select("tenant_id")
    .eq("user_id", userId)
    .eq("status", "active");
  if (error) throw new Error(`membership scan: ${error.message}`);
  for (const row of data ?? []) {
    const tenantId = row.tenant_id as string;
    if (tenantId === keepTenantId) continue;
    const removed = await admin
      .from("tenant_memberships")
      .delete()
      .eq("user_id", userId)
      .eq("tenant_id", tenantId);
    if (removed.error) throw new Error(`orphan membership delete: ${removed.error.message}`);
  }
}

async function enableBusinessOsFeature(admin: SupabaseClient, tenantId: string): Promise<void> {
  const feature = await admin.from("features").select("id").eq("feature_key", "business_os").maybeSingle();
  if (feature.error || !feature.data?.id) throw new Error("business_os feature row missing");
  for (const environment of ["production", "development"] as const) {
    const upserted = await admin.from("feature_flags").upsert(
      {
        feature_id: feature.data.id,
        tenant_id: tenantId,
        environment,
        enabled: true,
        rollout_pct: 100,
      },
      { onConflict: "feature_id,tenant_id,environment" },
    );
    if (upserted.error) throw new Error(`business_os flag ${environment}: ${upserted.error.message}`);
  }
}

async function ensureIsolatedWorkspace(
  admin: SupabaseClient,
  tenantId: string,
): Promise<string> {
  const slug = "cert-bos16-isolated";
  const existing = await admin
    .from("workspaces")
    .select("id")
    .eq("tenant_id", tenantId)
    .eq("slug", slug)
    .maybeSingle();
  if (existing.error) throw new Error(`isolated workspace lookup: ${existing.error.message}`);
  if (existing.data?.id) return existing.data.id as string;

  const inserted = await requireRow<{ id: string }>(
    "isolated workspace",
    await admin
      .from("workspaces")
      .insert({
        tenant_id: tenantId,
        name: "BOS-16 Isolated Workspace (no membership)",
        slug,
        type: "sandbox",
        status: "active",
        settings: { cert_fixture: true, membership: "none", phase: "BOS-16A4" },
      })
      .select("id")
      .single(),
  );
  return inserted.id;
}

async function upsertBySource(
  admin: SupabaseClient,
  table: string,
  tenantId: string,
  workspaceId: string,
  payload: Record<string, unknown>,
  sourceRef: string,
): Promise<string> {
  const existing = await admin
    .from(table)
    .select("id")
    .eq("tenant_id", tenantId)
    .eq("workspace_id", workspaceId)
    .eq("source_type", SOURCE_TYPE)
    .eq("source_ref", sourceRef)
    .maybeSingle();
  if (existing.error) throw new Error(`${table} lookup: ${existing.error.message}`);
  const body = {
    ...payload,
    tenant_id: tenantId,
    workspace_id: workspaceId,
    source_type: SOURCE_TYPE,
    source_ref: sourceRef,
    provenance: PROVENANCE,
    is_demo: true,
  };
  if (existing.data?.id) {
    const updated = await admin.from(table).update(body).eq("id", existing.data.id as string);
    if (updated.error) throw new Error(`${table} update: ${updated.error.message}`);
    return existing.data.id as string;
  }
  const inserted = await requireRow<{ id: string }>(
    `${table} insert`,
    await admin.from(table).insert(body).select("id").single(),
  );
  return inserted.id;
}

async function upsertKpi(
  admin: SupabaseClient,
  tenantId: string,
  workspaceId: string,
  createdBy: string,
  key: string,
  name: string,
): Promise<string> {
  const existing = await admin
    .from("business_os_kpis")
    .select("id")
    .eq("tenant_id", tenantId)
    .eq("workspace_id", workspaceId)
    .eq("key", key)
    .maybeSingle();
  if (existing.error) throw new Error(`kpi lookup: ${existing.error.message}`);
  const body = {
    tenant_id: tenantId,
    workspace_id: workspaceId,
    key,
    name,
    description: "BOS-16 RLS certification fixture. Not production data.",
    category: "general",
    unit: "count",
    value: 1,
    source_type: SOURCE_TYPE,
    source_ref: `bos16-rls-${key}`,
    provenance: PROVENANCE,
    is_demo: true,
    created_by: createdBy,
  };
  if (existing.data?.id) {
    const updated = await admin.from("business_os_kpis").update(body).eq("id", existing.data.id as string);
    if (updated.error) throw new Error(`kpi update: ${updated.error.message}`);
    return existing.data.id as string;
  }
  const inserted = await requireRow<{ id: string }>(
    "kpi insert",
    await admin.from("business_os_kpis").insert(body).select("id").single(),
  );
  return inserted.id;
}

async function seedScope(
  admin: SupabaseClient,
  label: Label,
  tenantId: string,
  workspaceId: string,
  createdBy: string,
): Promise<string[]> {
  const seeded: string[] = [];
  const suffix = label.toUpperCase();

  await upsertKpi(admin, tenantId, workspaceId, createdBy, "bos16_rls_cert", `BOS-16 RLS KPI ${suffix}`);
  seeded.push("business_os_kpis");

  const leadId = await upsertBySource(
    admin,
    "business_os_growth_leads",
    tenantId,
    workspaceId,
    {
      organisation_name: `BOS-16 Cert Lead ${suffix}`,
      created_by: createdBy,
    },
    "bos16-rls-lead",
  );
  seeded.push("business_os_growth_leads");

  const opportunityId = await upsertBySource(
    admin,
    "business_os_growth_opportunities",
    tenantId,
    workspaceId,
    {
      lead_id: leadId,
      name: `BOS-16 Cert Opportunity ${suffix}`,
      currency: "AUD",
      created_by: createdBy,
    },
    "bos16-rls-opportunity",
  );
  seeded.push("business_os_growth_opportunities");

  const customerId = await upsertBySource(
    admin,
    "business_os_customers",
    tenantId,
    workspaceId,
    {
      organisation_name: `BOS-16 Cert Customer ${suffix}`,
      created_by: createdBy,
    },
    "bos16-rls-customer",
  );
  seeded.push("business_os_customers");

  await upsertBySource(
    admin,
    "business_os_customer_contacts",
    tenantId,
    workspaceId,
    {
      customer_id: customerId,
      name: `BOS-16 Suppressed Contact ${suffix}`,
      role: "certification-only",
      business_email: `suppressed-${label}@rtb-cert.test`,
      suppressed: true,
      created_by: createdBy,
    },
    "bos16-rls-contact-suppressed",
  );
  seeded.push("business_os_customer_contacts");

  await upsertBySource(
    admin,
    "business_os_profit_facts",
    tenantId,
    workspaceId,
    {
      period_start: "2026-08-01",
      period_end: "2026-08-31",
      dimension_type: "customer",
      dimension_id: customerId,
      dimension_name: `BOS-16 Cert Customer ${suffix}`,
      revenue_minor: 10000,
      currency: "AUD",
      created_by: createdBy,
    },
    "bos16-rls-profit",
  );
  seeded.push("business_os_profit_facts");

  await upsertBySource(
    admin,
    "business_os_work_items",
    tenantId,
    workspaceId,
    {
      reference: `BOS16-W-${suffix}`,
      name: `BOS-16 Cert Work ${suffix}`,
      work_type: "internal_initiative",
      currency: "AUD",
      created_by: createdBy,
    },
    "bos16-rls-work",
  );
  seeded.push("business_os_work_items");

  await upsertBySource(
    admin,
    "business_os_risks",
    tenantId,
    workspaceId,
    {
      reference: `BOS16-R-${suffix}`,
      title: `BOS-16 Cert Risk ${suffix}`,
      created_by: createdBy,
    },
    "bos16-rls-risk",
  );
  seeded.push("business_os_risks");

  const decisionExisting = await admin
    .from("business_os_decisions")
    .select("id")
    .eq("tenant_id", tenantId)
    .eq("workspace_id", workspaceId)
    .eq("statement", `BOS-16 RLS cert decision ${suffix}`)
    .maybeSingle();
  if (decisionExisting.error) throw new Error(`decision lookup: ${decisionExisting.error.message}`);
  let decisionId = decisionExisting.data?.id as string | undefined;
  if (!decisionId) {
    const inserted = await requireRow<{ id: string }>(
      "decision insert",
      await admin
        .from("business_os_decisions")
        .insert({
          tenant_id: tenantId,
          workspace_id: workspaceId,
          statement: `BOS-16 RLS cert decision ${suffix}`,
          context: "Certification fixture. Not production.",
          is_demo: true,
          created_by: createdBy,
        })
        .select("id")
        .single(),
    );
    decisionId = inserted.id;
  }
  seeded.push("business_os_decisions");

  const actionExisting = await admin
    .from("business_os_actions")
    .select("id")
    .eq("tenant_id", tenantId)
    .eq("workspace_id", workspaceId)
    .eq("title", `BOS-16 RLS cert action ${suffix}`)
    .maybeSingle();
  if (actionExisting.error) throw new Error(`action lookup: ${actionExisting.error.message}`);
  if (!actionExisting.data?.id) {
    const inserted = await admin.from("business_os_actions").insert({
      tenant_id: tenantId,
      workspace_id: workspaceId,
      decision_id: decisionId,
      title: `BOS-16 RLS cert action ${suffix}`,
      is_demo: true,
      created_by: createdBy,
    });
    if (inserted.error) throw new Error(`action insert: ${inserted.error.message}`);
  }
  seeded.push("business_os_actions");

  const periodExisting = await admin
    .from("business_os_finance_periods")
    .select("id")
    .eq("tenant_id", tenantId)
    .eq("workspace_id", workspaceId)
    .eq("period_start", "2026-08-01")
    .eq("period_end", "2026-08-31")
    .eq("currency", "AUD")
    .maybeSingle();
  if (periodExisting.error) throw new Error(`finance period lookup: ${periodExisting.error.message}`);
  let periodId = periodExisting.data?.id as string | undefined;
  if (!periodId) {
    const inserted = await requireRow<{ id: string }>(
      "finance period",
      await admin
        .from("business_os_finance_periods")
        .insert({
          tenant_id: tenantId,
          workspace_id: workspaceId,
          period_start: "2026-08-01",
          period_end: "2026-08-31",
          currency: "AUD",
          source_type: SOURCE_TYPE,
          source_ref: "bos16-rls-period",
          provenance: PROVENANCE,
          is_demo: true,
          created_by: createdBy,
        })
        .select("id")
        .single(),
    );
    periodId = inserted.id;
  }

  const snapshotExisting = await admin
    .from("business_os_finance_snapshots")
    .select("id")
    .eq("tenant_id", tenantId)
    .eq("workspace_id", workspaceId)
    .eq("period_id", periodId)
    .maybeSingle();
  if (snapshotExisting.error) throw new Error(`finance snapshot lookup: ${snapshotExisting.error.message}`);
  if (!snapshotExisting.data?.id) {
    const inserted = await admin.from("business_os_finance_snapshots").insert({
      tenant_id: tenantId,
      workspace_id: workspaceId,
      period_id: periodId,
      currency: "AUD",
      source_type: SOURCE_TYPE,
      source_ref: "bos16-rls-snapshot",
      provenance: PROVENANCE,
      is_demo: true,
      created_by: createdBy,
    });
    if (inserted.error) throw new Error(`finance snapshot insert: ${inserted.error.message}`);
  }
  seeded.push("business_os_finance_snapshots");

  await upsertBySource(
    admin,
    "business_os_revenue_proposals",
    tenantId,
    workspaceId,
    {
      opportunity_id: opportunityId,
      proposal_number: `BOS16-P-${suffix}`,
      title: `BOS-16 Cert Proposal ${suffix}`,
      currency: "AUD",
      created_by: createdBy,
    },
    "bos16-rls-proposal",
  );
  seeded.push("business_os_revenue_proposals");

  const runExisting = await admin
    .from("business_os_context_projection_runs")
    .select("id")
    .eq("tenant_id", tenantId)
    .eq("workspace_id", workspaceId)
    .contains("provenance", { cert_fixture: true, phase: "BOS-16A4" })
    .maybeSingle();
  if (runExisting.error) throw new Error(`projection run lookup: ${runExisting.error.message}`);
  if (!runExisting.data?.id) {
    const inserted = await admin.from("business_os_context_projection_runs").insert({
      tenant_id: tenantId,
      workspace_id: workspaceId,
      status: "completed",
      trigger: "demo",
      nodes_projected: 0,
      relationships_projected: 0,
      unresolved: 0,
      provenance: PROVENANCE,
      created_by: createdBy,
    });
    if (inserted.error) throw new Error(`projection run insert: ${inserted.error.message}`);
  }
  seeded.push("business_os_context_projection_runs");

  const installationExisting = await admin
    .from("business_os_connector_installations")
    .select("id")
    .eq("tenant_id", tenantId)
    .eq("workspace_id", workspaceId)
    .eq("connector_id", "csv_excel")
    .maybeSingle();
  if (installationExisting.error) {
    throw new Error(`connector installation lookup: ${installationExisting.error.message}`);
  }
  let installationId = installationExisting.data?.id as string | undefined;
  if (!installationId) {
    const inserted = await requireRow<{ id: string }>(
      "connector installation",
      await admin
        .from("business_os_connector_installations")
        .insert({
          tenant_id: tenantId,
          workspace_id: workspaceId,
          connector_id: "csv_excel",
          version: "bos16-rls",
          requested_mode: "fixture",
          effective_mode: "fixture",
          health: "unconfigured",
          mapping_version: "bos16-rls.v1",
          provenance: PROVENANCE,
        })
        .select("id")
        .single(),
    );
    installationId = inserted.id;
  }

  const syncExisting = await admin
    .from("business_os_connector_sync_runs")
    .select("id")
    .eq("tenant_id", tenantId)
    .eq("workspace_id", workspaceId)
    .eq("installation_id", installationId)
    .maybeSingle();
  if (syncExisting.error) throw new Error(`sync run lookup: ${syncExisting.error.message}`);
  let syncRunId = syncExisting.data?.id as string | undefined;
  if (!syncRunId) {
    const inserted = await requireRow<{ id: string }>(
      "sync run",
      await admin
        .from("business_os_connector_sync_runs")
        .insert({
          installation_id: installationId,
          tenant_id: tenantId,
          workspace_id: workspaceId,
          connector_id: "csv_excel",
          status: "completed",
          idempotency_key: `bos16-rls-sync-${label}`,
          provenance: PROVENANCE,
        })
        .select("id")
        .single(),
    );
    syncRunId = inserted.id;
  }

  const stagingExisting = await admin
    .from("business_os_connector_staging")
    .select("id")
    .eq("tenant_id", tenantId)
    .eq("workspace_id", workspaceId)
    .eq("external_source_id", `bos16-rls-staging-${label}`)
    .maybeSingle();
  if (stagingExisting.error) throw new Error(`staging lookup: ${stagingExisting.error.message}`);
  if (!stagingExisting.data?.id) {
    const inserted = await admin.from("business_os_connector_staging").insert({
      tenant_id: tenantId,
      workspace_id: workspaceId,
      connector_id: "csv_excel",
      installation_id: installationId,
      sync_run_id: syncRunId,
      provider: "csv_excel",
      external_source_id: `bos16-rls-staging-${label}`,
      data_class: "certification_fixture",
      mapping_version: "bos16-rls.v1",
      match_status: "unmatched",
      becomes_canonical: false,
      suppressed: false,
      payload: { cert_fixture: true, phase: "BOS-16A4" },
      provenance: PROVENANCE,
    });
    if (inserted.error) throw new Error(`staging insert: ${inserted.error.message}`);
  }
  seeded.push("business_os_connector_staging");

  return seeded;
}

function writeOverlay(vars: Record<string, string>): void {
  const lines = [
    "# BOS-16 RLS certification runtime. Gitignored. Do not commit.",
    ...Object.entries(vars).map(([key, value]) => `${key}=${JSON.stringify(value)}`),
  ];
  writeFileSync(ENV_OVERLAY, `${lines.join("\n")}\n`, { encoding: "utf8" });
}

async function main(): Promise<void> {
  loadEnvFile(ENV_LOCAL);
  loadEnvFile(ENV_OVERLAY);

  const target = assessBosStagingTarget();
  if (target.status !== "available") {
    throw new Error("staging target unavailable");
  }
  if (target.projectRef !== REQUIRED_REF) {
    throw new Error(`unexpected projectRef ${target.projectRef}`);
  }
  if (target.hostname !== `${REQUIRED_REF}.supabase.co`) {
    throw new Error(`unexpected hostname ${target.hostname}`);
  }

  const url = requireEnv("SUPABASE_TEST_URL");
  const anonKey = requireEnv("SUPABASE_TEST_ANON_KEY");
  const serviceRole = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
  const password = requireEnv("CERT_USER_PASSWORD");
  rejectForbidden(url, target.projectRef);
  rejectForbidden(target.hostname, target.projectRef);

  const serviceRoleRef = jwtClaim(serviceRole, "ref");
  const serviceRoleRole = jwtClaim(serviceRole, "role");
  const anonRole = jwtClaim(anonKey, "role");
  const anonRef = jwtClaim(anonKey, "ref");
  if (serviceRoleRef && serviceRoleRef !== REQUIRED_REF) {
    throw new Error(`service-role ref claim ${serviceRoleRef} does not match ${REQUIRED_REF}`);
  }
  if (anonRef && anonRef !== REQUIRED_REF) {
    throw new Error(`anon ref claim ${anonRef} does not match ${REQUIRED_REF}`);
  }
  if (serviceRoleRole !== "service_role") {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not a service-role credential");
  }
  log(`anon_role=${anonRole ?? "unknown"} service_role_ref=${serviceRoleRef ?? "opaque"}`);

  log(`target=${target.projectRef} host=${target.hostname}`);
  log(`forbidden_host_rejected=${FORBIDDEN_REF}`);

  if (process.argv.includes("--assess-only")) {
    log(`staging_status=${target.status}`);
    log("BOS16_LIVE_CERT_HARNESS_READY=true");
    return;
  }

  const admin = createClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const identities: Record<
    Label,
    { userId: string; tenantId: string; workspaceId: string; email: string; tenantSlug: string }
  > = {} as never;

  for (const label of ["a", "b"] as const) {
    const spec = USERS[label];
    const userId = await getOrCreateUser(admin, spec, password);
    const tenant = await waitForTenant(admin, spec.tenantSlug);
    await restrictToSingleTenant(admin, userId, tenant.id);
    const workspace = await defaultWorkspace(admin, tenant.id);
    const membership = await admin
      .from("tenant_memberships")
      .select("id")
      .eq("user_id", userId)
      .eq("tenant_id", tenant.id)
      .eq("status", "active")
      .maybeSingle();
    if (!membership.data?.id) {
      throw new Error(`missing tenant membership for ${spec.email}`);
    }
    const workspaceMembership = await admin
      .from("workspace_memberships")
      .select("id")
      .eq("user_id", userId)
      .eq("workspace_id", workspace.id)
      .maybeSingle();
    if (!workspaceMembership.data?.id) {
      throw new Error(`missing workspace membership for ${spec.email}`);
    }
    await admin
      .from("tenants")
      .update({
        name: spec.tenantName,
        settings: {
          created_via: "signup",
          cert_fixture: true,
          phase: "BOS-16A4",
          owner_user_id: userId,
        },
      })
      .eq("id", tenant.id);

    identities[label] = {
      userId,
      tenantId: tenant.id,
      workspaceId: workspace.id,
      email: spec.email,
      tenantSlug: spec.tenantSlug,
    };
    log(`user_${label}=provisioned email=${spec.email} tenant=${tenant.id} workspace=${workspace.id}`);
  }

  await enableBusinessOsFeature(admin, identities.a.tenantId);
  await enableBusinessOsFeature(admin, identities.b.tenantId);
  log("business_os_feature_enabled=true");

  const isolatedWorkspaceId = await ensureIsolatedWorkspace(admin, identities.a.tenantId);
  await upsertKpi(
    admin,
    identities.a.tenantId,
    isolatedWorkspaceId,
    identities.a.userId,
    "bos16_rls_isolated",
    "BOS-16 Isolated Workspace KPI",
  );

  const seededA = await seedScope(admin, "a", identities.a.tenantId, identities.a.workspaceId, identities.a.userId);
  const seededB = await seedScope(admin, "b", identities.b.tenantId, identities.b.workspaceId, identities.b.userId);
  log(`seeded_a=${seededA.join(",")}`);
  log(`seeded_b=${seededB.join(",")}`);
  log(`isolated_workspace=${isolatedWorkspaceId}`);

  const jwtA = await signInJwt(url, anonKey, identities.a.email, password);
  const jwtB = await signInJwt(url, anonKey, identities.b.email, password);

  writeOverlay({
    BOS_RLS_TENANT_A_JWT: jwtA,
    BOS_RLS_TENANT_B_JWT: jwtB,
    BOS_RLS_TENANT_A_ID: identities.a.tenantId,
    BOS_RLS_TENANT_B_ID: identities.b.tenantId,
    BOS_RLS_WORKSPACE_A_ID: identities.a.workspaceId,
    BOS_RLS_WORKSPACE_B_ID: identities.b.workspaceId,
    BOS_RLS_WORKSPACE_ISOLATED_A_ID: isolatedWorkspaceId,
    COMMERCE_RLS_TENANT_A_JWT: jwtA,
    COMMERCE_RLS_TENANT_B_JWT: jwtB,
    COMMERCE_RLS_TENANT_A_ID: identities.a.tenantId,
    COMMERCE_RLS_TENANT_B_ID: identities.b.tenantId,
  });
  log(`overlay_written=${ENV_OVERLAY}`);
  log("jwts_written=true values_omitted=true");

  loadEnvFile(ENV_OVERLAY);
  const live = assessBosLiveRlsEnvironment();
  if (live.status !== "available") {
    throw new Error("live RLS environment not available after provision");
  }
  log(`live_rls_status=${live.status} projectRef=${live.projectRef}`);
  log("TENANT_A_PROVISIONED=true");
  log("TENANT_B_PROVISIONED=true");
  log("USER_A_AUTHENTICATED=true");
  log("USER_B_AUTHENTICATED=true");
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "provision failed";
  console.error(`[bos16-rls:provision] FAIL ${message}`);
  process.exit(1);
});
