/**
 * Phase 7B fixture cleanup — removes run-scoped tenant, users, and commerce rows.
 */
import { existsSync, unlinkSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";
import {
  assertProvisionEnv,
  CERT_SLUG_PREFIX,
  fixturesManifestPath,
  loadFixturesManifest,
  resolveServiceRoleKey,
  resolveSupabaseUrl,
} from "../src/lib/env.js";

function log(msg: string): void {
  console.log(`[platform-7b:cleanup] ${msg}`);
}

export async function cleanupPlatform7bFixtures(pkgDir = process.cwd()): Promise<{
  cleaned: boolean;
  tenantId?: string;
  usersDeleted: number;
  orphans: string[];
}> {
  assertProvisionEnv();
  const manifest = loadFixturesManifest(pkgDir);
  const url = resolveSupabaseUrl()!;
  const admin = createClient(url, resolveServiceRoleKey()!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const orphans: string[] = [];
  let usersDeleted = 0;

  // Sweep stale 7B tenants (bounded)
  const { data: stale } = await admin
    .from("tenants")
    .select("id,slug")
    .like("slug", `${CERT_SLUG_PREFIX}%`)
    .limit(20);
  for (const row of stale ?? []) {
    if (manifest && row.id === manifest.tenantId) continue;
    // Keep only current run; delete older cert tenants
    if (!manifest || row.slug !== manifest.tenantSlug) {
      await admin.from("tenants").delete().eq("id", row.id);
      orphans.push(row.slug as string);
    }
  }

  if (!manifest) {
    return { cleaned: false, usersDeleted, orphans };
  }

  for (const user of Object.values(manifest.users)) {
    await admin.auth.admin.deleteUser(user.userId);
    usersDeleted += 1;
  }

  await admin.from("tenants").delete().eq("id", manifest.tenantId);

  const path = fixturesManifestPath(pkgDir);
  if (existsSync(path)) unlinkSync(path);

  const report = {
    cleaned: true,
    tenantId: manifest.tenantId,
    usersDeleted,
    orphans,
    timestamp: new Date().toISOString(),
  };
  writeFileSync(resolve(pkgDir, "artifacts/cleanup-report.json"), JSON.stringify(report, null, 2));
  log(`Cleanup complete tenant=${manifest.tenantId} users=${usersDeleted}`);
  return report;
}

if (process.argv[1]?.includes("cleanup-fixtures") || process.argv[1]?.includes("teardown")) {
  cleanupPlatform7bFixtures(resolve(import.meta.dirname, ".."))
    .then(() => process.exit(0))
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}
