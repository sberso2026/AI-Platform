/**
 * Seeds Growth Credit ledger fixtures and uninstall certification scenarios for Tenant A.
 */
import { execSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

import { fixturesManifestPath, HOSTED_PROJECT_REF } from "../src/lib/env.js";

const ROOT = resolve(process.cwd(), "../..");
const ENGINEERING_PRODUCT_ID = "c1000000-0000-4000-8000-000000000001";

interface InstallManifest {
  tenantA: {
    id: string;
    subscriptionId: string;
    workspaces: Array<{ id: string; slug: string }>;
    users: { owner: { userId: string } };
    installations: {
      productInstallationId: string;
    };
  };
}

async function seedUninstallFixtures(
  admin: ReturnType<typeof createClient>,
  tenantA: InstallManifest["tenantA"]
) {
  const { data: licence } = await admin
    .from("commercial_licenses")
    .select("id")
    .eq("tenant_id", tenantA.id)
    .eq("product_id", ENGINEERING_PRODUCT_ID)
    .eq("status", "active")
    .limit(1)
    .single();

  if (!licence?.id) throw new Error("active product licence missing for uninstall fixtures");

  const licenceId = licence.id as string;
  const ownerUserId = tenantA.users.owner.userId;
  const betaWorkspace = tenantA.workspaces.find((w) => w.slug === "beta") ?? tenantA.workspaces[1]!;

  const { data: happyInstall, error: happyError } = await admin
    .from("commercial_installations")
    .insert({
      tenant_id: tenantA.id,
      product_id: ENGINEERING_PRODUCT_ID,
      subscription_id: tenantA.subscriptionId,
      licence_id: licenceId,
      status: "active",
      desired_state: "active",
      current_state: "active",
      installed_version: "1.0.0-cert-uninstall",
      requested_version: "1.0.0-cert-uninstall",
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      installed_at: new Date().toISOString(),
      metadata: { source: "cert_uninstall_happy_path" },
    })
    .select("id")
    .single();

  if (happyError || !happyInstall) {
    throw new Error(`happy-path uninstall fixture failed: ${happyError?.message}`);
  }

  const happyPathInstallationId = happyInstall.id as string;

  const { data: happyAssignment, error: assignError } = await admin
    .from("commercial_workspace_product_assignments")
    .insert({
      tenant_id: tenantA.id,
      workspace_id: betaWorkspace.id,
      installation_id: happyPathInstallationId,
      product_id: ENGINEERING_PRODUCT_ID,
      status: "active",
      assigned_by: ownerUserId,
      metadata: { source: "cert_uninstall_happy_path" },
    })
    .select("id")
    .single();

  if (assignError || !happyAssignment) {
    throw new Error(`happy-path workspace assignment failed: ${assignError?.message}`);
  }

  const { data: invalidInstall, error: invalidError } = await admin
    .from("commercial_installations")
    .insert({
      tenant_id: tenantA.id,
      product_id: ENGINEERING_PRODUCT_ID,
      subscription_id: tenantA.subscriptionId,
      licence_id: licenceId,
      status: "uninstalled",
      desired_state: "uninstalled",
      current_state: "uninstalled",
      installed_version: "0.9.0-cert-invalid",
      requested_version: "0.9.0-cert-invalid",
      metadata: { source: "cert_uninstall_invalid_state" },
    })
    .select("id")
    .single();

  if (invalidError || !invalidInstall) {
    throw new Error(`invalid-state uninstall fixture failed: ${invalidError?.message}`);
  }

  return {
    happyPathInstallationId,
    happyPathWorkspaceAssignmentId: happyAssignment.id as string,
    invalidStateInstallationId: invalidInstall.id as string,
    withDependenciesInstallationId: tenantA.installations.productInstallationId,
    missingInstallationId: "00000000-0000-4000-8000-000000000001",
  };
}

async function main(): Promise<void> {
  execSync("pnpm --filter @rtb/installation-certification provision", {
    cwd: ROOT,
    stdio: "inherit",
    env: process.env,
  });

  const installManifestPath = resolve(
    process.cwd(),
    "../installation-certification/artifacts/cert-fixtures.json"
  );
  const installManifest = JSON.parse(readFileSync(installManifestPath, "utf8")) as InstallManifest;

  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const admin = createClient(url, serviceKey);
  const tenantId = installManifest.tenantA.id;

  let { data: account } = await admin
    .from("commercial_growth_credit_accounts")
    .select("id")
    .eq("tenant_id", tenantId)
    .maybeSingle();

  if (!account) {
    const { data: created, error } = await admin
      .from("commercial_growth_credit_accounts")
      .insert({
        tenant_id: tenantId,
        available_balance: 0,
        reserved_balance: 0,
        lifetime_earned: 0,
        lifetime_redeemed: 0,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    account = created;
  }

  const accountId = account.id as string;
  await admin.from("commercial_growth_credit_transactions").delete().eq("tenant_id", tenantId);

  const txs = [
    { transaction_type: "earned", amount: 1000, source: "founding_customer" },
    { transaction_type: "adjusted", amount: 50, source: "promotional_award" },
    { transaction_type: "reserved", amount: 200, source: "training_completion" },
    { transaction_type: "released", amount: 100, source: "service_recovery" },
    { transaction_type: "redeemed", amount: 150, source: "renewal" },
    { transaction_type: "expired", amount: 25, source: "promotional_award" },
    { transaction_type: "reversed", amount: 10, source: "service_recovery" },
  ];

  for (const tx of txs) {
    const { error } = await admin.from("commercial_growth_credit_transactions").insert({
      tenant_id: tenantId,
      account_id: accountId,
      ...tx,
      description: `Phase 4 cert fixture: ${tx.transaction_type}`,
    });
    if (error) throw new Error(error.message);
  }

  const uninstallFixtures = await seedUninstallFixtures(admin, installManifest.tenantA);

  const phase4Manifest = {
    ...JSON.parse(readFileSync(installManifestPath, "utf8")),
    growthCreditAccountId: accountId,
    hostedProjectRef: HOSTED_PROJECT_REF,
    provisionedAt: new Date().toISOString(),
    uninstallFixtures,
  };

  mkdirSync(resolve(process.cwd(), "artifacts"), { recursive: true });
  writeFileSync(fixturesManifestPath(), JSON.stringify(phase4Manifest, null, 2));
  console.log("[phase4:provision] Growth credit and uninstall fixtures seeded");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
