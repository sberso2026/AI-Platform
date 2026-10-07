import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { applyHostedSqlFiles } from "../../engineering-os/scripts/apply-hosted-sql";
import {
  liveRlsMode,
  loadLocalEnv,
  resolveServiceRoleKey,
  resolveSupabaseAnonKey,
  resolveSupabaseUrl,
} from "./env";
import { anonReadDenied, ids, mutationDenied, restFetch } from "./live-http";
import {
  cleanupTransientReviewPackages,
  provisionReviewRlsFixtures,
  type ReviewRlsFixtures,
} from "./fixtures";

const mode = liveRlsMode();
const LIVE = mode === "run";

describe.skipIf(!LIVE)("EOS-A14A live JWT RLS and staging artifact inventory", () => {
  loadLocalEnv();
  const url = resolveSupabaseUrl()!;
  const anonKey = resolveSupabaseAnonKey()!;
  const serviceKey = resolveServiceRoleKey()!;
  let fixtures: ReviewRlsFixtures;
  let environment: "ready" | "unavailable" = "unavailable";
  let migrationId = "";

  async function rest(path: string, options: RequestInit = {}, jwt?: string) {
    return restFetch(url, anonKey, serviceKey, path, options, jwt);
  }

  beforeAll(async () => {
    if (mode === "misconfigured") {
      throw new Error("ENGINEERING_REVIEW_RLS=1 but hosted credentials are missing");
    }
    const applied = await applyHostedSqlFiles([
      "supabase/migrations/20261001210000_eos_a14a_artifact_object_storage.sql",
    ]);
    if (applied.failed) {
      throw new Error(`A14A migration failed: ${applied.failed}`);
    }
    fixtures = await provisionReviewRlsFixtures();
    environment = "ready";
  });

  afterAll(async () => {
    if (environment === "ready") {
      if (migrationId) {
        await rest(`engineering_artifact_storage_migrations?id=eq.${migrationId}`, { method: "DELETE" }, serviceKey);
      }
      await cleanupTransientReviewPackages();
    }
  });

  beforeEach(({ skip }) => {
    if (environment !== "ready") {
      skip("SKIPPED_ENVIRONMENT_UNAVAILABLE: A14A storage ledger is not on hosted Postgres");
    }
  });

  it("inventory does not select content_base64 and authorized admin can record a migration ledger row", async () => {
    const inventory = await rest(
      "engineering_generated_artifacts?select=id,storage_kind,output_format,byte_size,content_sha256,migration_state",
      {},
      serviceKey,
    );
    expect(inventory.status).toBe(200);
    const rows = Array.isArray(inventory.body) ? inventory.body as Array<Record<string, unknown>> : [];
    expect(JSON.stringify(inventory.body)).not.toContain("content_base64");
    const formats = new Set(rows.map((row) => String(row.output_format ?? "")));
    const legacy = rows.filter((row) => row.storage_kind === "LEGACY_RELATIONAL").length;
    const objectStored = rows.filter((row) => row.storage_kind === "OBJECT_STORAGE").length;
    const missingHash = rows.filter((row) => !row.content_sha256).length;
    expect({
      total: rows.length,
      legacy,
      objectStored,
      missingHash,
      formats: [...formats],
    }).toEqual(expect.objectContaining({ total: rows.length }));

    migrationId = randomUUID();
    const inserted = await rest(
      "engineering_artifact_storage_migrations",
      {
        method: "POST",
        body: JSON.stringify({
          id: migrationId,
          tenant_id: fixtures.tenantAId,
          workspace_id: fixtures.workspaceA1Id,
          artifact_id: randomUUID(),
          from_kind: "LEGACY_RELATIONAL",
          to_kind: "OBJECT_STORAGE",
          object_key: `eos/artifacts/${fixtures.tenantAId}/${fixtures.workspaceA1Id}/${fixtures.projectA1Id}/fixture/v2`,
          content_sha256: "abc",
          content_size_bytes: 12,
          status: "VERIFIED",
          reason: "a14a-live-rls",
        }),
      },
      fixtures.users.aAdmin.jwt,
    );
    expect(inserted.status, "admin insert denied").toBeGreaterThanOrEqual(200);
    expect(inserted.status).toBeLessThan(300);

    const own = await rest(
      `engineering_artifact_storage_migrations?select=id,status,object_key&id=eq.${migrationId}`,
      {},
      fixtures.users.a1.jwt,
    );
    expect(own.status).toBe(200);
    expect(ids(own.body)).toContain(migrationId);

    const a2 = await rest(
      `engineering_artifact_storage_migrations?select=id&id=eq.${migrationId}`,
      {},
      fixtures.users.a2.jwt,
    );
    expect(a2.status).toBe(200);
    expect(ids(a2.body)).toEqual([]);

    const b1 = await rest(
      `engineering_artifact_storage_migrations?select=id&id=eq.${migrationId}`,
      {},
      fixtures.users.b1.jwt,
    );
    expect(b1.status).toBe(200);
    expect(ids(b1.body)).toEqual([]);

    const anon = await rest(`engineering_artifact_storage_migrations?select=id&id=eq.${migrationId}`);
    expect(anonReadDenied(anon), JSON.stringify(anon.body)).toBe(true);

    const engineerInsert = await rest(
      "engineering_artifact_storage_migrations",
      {
        method: "POST",
        body: JSON.stringify({
          tenant_id: fixtures.tenantAId,
          workspace_id: fixtures.workspaceA1Id,
          artifact_id: randomUUID(),
          from_kind: "LEGACY_RELATIONAL",
          to_kind: "OBJECT_STORAGE",
          status: "IN_PROGRESS",
        }),
      },
      fixtures.users.a1.jwt,
    );
    expect(mutationDenied(engineerInsert), JSON.stringify(engineerInsert.body)).toBe(true);
  });
});
