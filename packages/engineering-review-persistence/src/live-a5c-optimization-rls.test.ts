import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
  liveRlsMode,
  loadLocalEnv,
  resolveServiceRoleKey,
  resolveSupabaseAnonKey,
  resolveSupabaseUrl,
} from "./env";
import { ids, mutationDenied, restFetch } from "./live-http";
import {
  cleanupTransientReviewPackages,
  provisionReviewRlsFixtures,
  type ReviewRlsFixtures,
} from "./fixtures";

const mode = liveRlsMode();
const LIVE = mode === "run";
const TAG = { eos_a5c: true };

type JsonRow = Record<string, unknown> & { id: string };

function asRow(body: unknown): JsonRow {
  if (Array.isArray(body) && body[0] && typeof body[0] === "object" && body[0] !== null && "id" in body[0]) {
    return body[0] as JsonRow;
  }
  if (body && typeof body === "object" && "id" in body) return body as JsonRow;
  throw new Error(`expected id in ${JSON.stringify(body)}`);
}

describe.skipIf(!LIVE)("EOS-A5C live JWT RLS — Optimization run manifests", () => {
  loadLocalEnv();
  const url = resolveSupabaseUrl()!;
  const anonKey = resolveSupabaseAnonKey()!;
  const serviceKey = resolveServiceRoleKey()!;
  let fixtures: ReviewRlsFixtures;
  let environment: "ready" | "unavailable" = "unavailable";
  const studyIds: string[] = [];
  const alternativeIds: string[] = [];
  const runIds: string[] = [];
  const baselineIds: string[] = [];
  const manifestIds: string[] = [];

  async function rest(path: string, options: RequestInit = {}, jwt?: string) {
    return restFetch(url, anonKey, serviceKey, path, options, jwt);
  }
  async function svc(path: string, options: RequestInit = {}) {
    return rest(path, options, serviceKey);
  }

  beforeAll(async () => {
    if (mode === "misconfigured") throw new Error("ENGINEERING_REVIEW_RLS=1 but hosted credentials are missing");
    fixtures = await provisionReviewRlsFixtures();
    environment = "ready";
  });

  afterAll(async () => {
    if (environment !== "ready") return;
    const runs = runIds.length ? `(${runIds.join(",")})` : null;
    const studies = studyIds.length ? `(${studyIds.join(",")})` : null;
    if (runs) {
      await svc(`engineering_optimization_run_manifests?run_id=in.${runs}`, { method: "DELETE" });
      await svc(`engineering_optimization_runs?id=in.${runs}`, { method: "DELETE" });
    }
    if (studies) {
      await svc(`engineering_optimization_alternatives?study_id=in.${studies}`, { method: "DELETE" });
      await svc(`engineering_optimization_studies?id=in.${studies}`, { method: "DELETE" });
    }
    if (baselineIds.length) {
      await svc(`engineering_configuration_baselines?id=in.(${baselineIds.join(",")})`, { method: "DELETE" });
    }
    await cleanupTransientReviewPackages();
  });

  beforeEach(({ skip }) => {
    if (environment !== "ready") skip("SKIPPED_ENVIRONMENT_UNAVAILABLE");
  });

  it("A1 cannot read or mutate A2/B1 manifests; anonymous denied; same-workspace allowed", async () => {
    async function seedWorkspace(input: { tenantId: string; workspaceId: string; projectId: string; title: string }) {
      const baseline = asRow(
        (
          await svc("engineering_configuration_baselines", {
            method: "POST",
            body: JSON.stringify({
              tenant_id: input.tenantId,
              workspace_id: input.workspaceId,
              project_id: input.projectId,
              baseline_code: `BL-A5C-${randomUUID().slice(0, 8)}`,
              name: `${input.title} baseline`,
              baseline_type: "FEED",
              status: "frozen",
              metadata: TAG,
            }),
          })
        ).body,
      );
      baselineIds.push(baseline.id);
      const study = asRow(
        (
          await svc("engineering_optimization_studies", {
            method: "POST",
            body: JSON.stringify({
              tenant_id: input.tenantId,
              workspace_id: input.workspaceId,
              project_id: input.projectId,
              study_code: `OPT-A5C-${randomUUID().slice(0, 8)}`,
              title: input.title,
              lifecycle_stage: "FEED",
              status: "draft",
              metadata: TAG,
            }),
          })
        ).body,
      );
      studyIds.push(study.id);
      const alt = asRow(
        (
          await svc("engineering_optimization_alternatives", {
            method: "POST",
            body: JSON.stringify({
              tenant_id: input.tenantId,
              workspace_id: input.workspaceId,
              project_id: input.projectId,
              study_id: study.id,
              alternative_code: `ALT-${randomUUID().slice(0, 6)}`,
              name: "alt",
              status: "active",
            }),
          })
        ).body,
      );
      alternativeIds.push(alt.id);
      const run = asRow(
        (
          await svc("engineering_optimization_runs", {
            method: "POST",
            body: JSON.stringify({
              tenant_id: input.tenantId,
              workspace_id: input.workspaceId,
              project_id: input.projectId,
              study_id: study.id,
              alternative_id: alt.id,
              status: "queued",
              configuration_baseline_id: baseline.id,
              baseline_fingerprint: "a".repeat(64),
              run_input_fingerprint: "b".repeat(64),
            }),
          })
        ).body,
      );
      runIds.push(run.id);
      const manifest = asRow(
        (
          await svc("engineering_optimization_run_manifests", {
            method: "POST",
            body: JSON.stringify({
              tenant_id: input.tenantId,
              workspace_id: input.workspaceId,
              project_id: input.projectId,
              study_id: study.id,
              run_id: run.id,
              manifest_schema_version: 1,
              manifest: { manifest_schema_version: 1, study: { study_id: study.id } },
              run_input_fingerprint: "b".repeat(64),
            }),
          })
        ).body,
      );
      manifestIds.push(manifest.id);
      return { study, run, manifest };
    }

    const a1 = await seedWorkspace({
      tenantId: fixtures.tenantAId,
      workspaceId: fixtures.workspaceA1Id,
      projectId: fixtures.projectA1Id,
      title: "A1 manifest",
    });
    const a2 = await seedWorkspace({
      tenantId: fixtures.tenantAId,
      workspaceId: fixtures.workspaceA2Id,
      projectId: fixtures.projectA2Id,
      title: "A2 manifest",
    });
    const b1 = await seedWorkspace({
      tenantId: fixtures.tenantBId,
      workspaceId: fixtures.workspaceB1Id,
      projectId: fixtures.projectB1Id,
      title: "B1 manifest",
    });

    expect(ids((await rest(`engineering_optimization_run_manifests?id=eq.${a1.manifest.id}`, {}, fixtures.users.a1.jwt)).body)).toEqual([
      a1.manifest.id,
    ]);
    expect(ids((await rest(`engineering_optimization_run_manifests?id=eq.${a2.manifest.id}`, {}, fixtures.users.a1.jwt)).body)).toEqual([]);
    expect(ids((await rest(`engineering_optimization_run_manifests?id=eq.${b1.manifest.id}`, {}, fixtures.users.a1.jwt)).body)).toEqual([]);
    expect(
      mutationDenied(
        await rest(
          `engineering_optimization_run_manifests?id=eq.${a2.manifest.id}`,
          { method: "PATCH", body: JSON.stringify({ run_input_fingerprint: "c".repeat(64) }) },
          fixtures.users.a1.jwt,
        ),
      ),
    ).toBe(true);
    expect(
      mutationDenied(
        await rest(
          `engineering_optimization_run_manifests?id=eq.${b1.manifest.id}`,
          { method: "PATCH", body: JSON.stringify({ run_input_fingerprint: "c".repeat(64) }) },
          fixtures.users.a1.jwt,
        ),
      ),
    ).toBe(true);
    expect(ids((await rest(`engineering_optimization_run_manifests?id=eq.${a1.manifest.id}`)).body)).toEqual([]);
  });
});
