/**
 * Seeds Growth Credit ledger fixtures for Phase 4 certification on Tenant A.
 */
import { execSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

import { fixturesManifestPath, HOSTED_PROJECT_REF } from "../src/lib/env.js";

const ROOT = resolve(process.cwd(), "../..");

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
  const installManifest = JSON.parse(readFileSync(installManifestPath, "utf8")) as {
    tenantA: { id: string };
  };

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

  const phase4Manifest = {
    ...JSON.parse(readFileSync(installManifestPath, "utf8")),
    growthCreditAccountId: accountId,
    hostedProjectRef: HOSTED_PROJECT_REF,
    provisionedAt: new Date().toISOString(),
  };

  mkdirSync(resolve(process.cwd(), "artifacts"), { recursive: true });
  writeFileSync(fixturesManifestPath(), JSON.stringify(phase4Manifest, null, 2));
  console.log("[phase4:provision] Growth credit fixtures seeded");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
