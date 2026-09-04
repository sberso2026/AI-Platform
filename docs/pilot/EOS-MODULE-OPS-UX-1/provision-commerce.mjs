import { createRequire } from "node:module";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const require = createRequire(resolve(root, "apps/web/package.json"));
const { createClient } = require("@supabase/supabase-js");

function loadEnv(file) {
  const out = {};
  if (!existsSync(file)) return out;
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx < 1) continue;
    out[trimmed.slice(0, idx)] = trimmed.slice(idx + 1).replace(/^"|"$/g, "");
  }
  return out;
}

const env = { ...loadEnv(resolve(root, "apps/web/.env.local")), ...process.env };
const LAUNCH1 = "8195e176-5f9f-449a-a1d3-2aedaf403989";
const WORKSPACE = "776aab04-e2eb-4a2a-855f-e04a81f0a0ce";
const EOS = "c1000000-0000-4000-8000-000000000001";
const FOUNDER = "d0dc00dc-80ec-4416-b9ed-e956cae2060f";
const PARENT_INSTALL = "d65241cd-0349-4b34-8e26-3884f7fc701b";
const SUBSCRIPTION = "6e896538-f4e1-469c-b278-ee4503438110";
const APPS = [
  { key: "asset_intelligence", licenceId: "7b7675cb-aa9b-4cc1-9005-8e88c7daeb49" },
  { key: "digital_twin", licenceId: "71ddc3e5-1e24-4ed3-b0f8-a4861540472c" },
  { key: "engineering_model_interoperability", licenceId: "f5aa04cd-5258-4ed3-b961-0ae1bd2695a6" },
];

const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const now = new Date().toISOString();
const results = [];

for (const app of APPS) {
  const { data: existing, error: existingError } = await sb
    .from("commercial_application_installations")
    .select("id, status")
    .eq("tenant_id", LAUNCH1)
    .eq("product_id", EOS)
    .eq("application_key", app.key)
    .maybeSingle();
  if (existingError) throw new Error(`${app.key} lookup: ${existingError.message}`);

  let row = existing;
  if (!existing) {
    const { data, error } = await sb
      .from("commercial_application_installations")
      .insert({
        tenant_id: LAUNCH1,
        workspace_id: WORKSPACE,
        product_id: EOS,
        application_key: app.key,
        parent_product_installation_id: PARENT_INSTALL,
        subscription_id: SUBSCRIPTION,
        licence_id: app.licenceId,
        status: "active",
        installed_at: now,
        metadata: { source: "EOS-COMMERCE-APP-1R" },
        created_by: FOUNDER,
      })
      .select("id, status, application_key")
      .single();
    if (error) throw new Error(`${app.key} insert: ${error.message}`);
    row = data;
  } else if (existing.status !== "active") {
    const { data, error } = await sb
      .from("commercial_application_installations")
      .update({
        status: "active",
        installed_at: now,
        licence_id: app.licenceId,
        parent_product_installation_id: PARENT_INSTALL,
        subscription_id: SUBSCRIPTION,
        workspace_id: WORKSPACE,
      })
      .eq("id", existing.id)
      .select("id, status, application_key")
      .single();
    if (error) throw new Error(`${app.key} activate: ${error.message}`);
    row = data;
  }

  const { data: registry } = await sb
    .from("engineering_application_registry")
    .select("id")
    .eq("app_key", app.key)
    .maybeSingle();
  if (registry?.id) {
    await sb.from("engineering_application_installations").upsert(
      {
        tenant_id: LAUNCH1,
        app_id: registry.id,
        enabled: true,
        installed_at: now,
        metadata: { source: "commercial_application_installations" },
      },
      { onConflict: "tenant_id,app_id" },
    );
  }

  results.push({
    applicationKey: app.key,
    installationId: row.id,
    status: row.status,
    registered: true,
    licensed: true,
  });
}

const { data: plan } = await sb
  .from("commercial_plans")
  .select("id, name")
  .eq("id", "d1000000-0000-4000-8000-000000000001")
  .maybeSingle();

writeFileSync(
  resolve(root, "docs/pilot/EOS-MODULE-OPS-UX-1/commerce-provision.json"),
  JSON.stringify(
    {
      tenantId: LAUNCH1,
      globalEnterprisePlanUnchanged: plan?.name === "Enterprise",
      applications: results,
    },
    null,
    2,
  ),
);
console.log(JSON.stringify({ ok: true, applications: results }, null, 2));
