import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
  liveRlsMode,
  loadLocalEnv,
  resolveServiceRoleKey,
  resolveSupabaseAnonKey,
  resolveSupabaseUrl,
} from "./env";
import { ids, mutationDenied, restFetch } from "./live-http";
import { cleanupTransientReviewPackages, provisionReviewRlsFixtures, type ReviewRlsFixtures } from "./fixtures";

const mode = liveRlsMode();
const LIVE = mode === "run";

function entityId(body: unknown): string {
  if (Array.isArray(body) && body[0] && typeof body[0] === "object" && body[0] !== null && "id" in body[0]) {
    return String((body[0] as { id: string }).id);
  }
  if (body && typeof body === "object" && "id" in (body as { id?: string })) {
    return String((body as { id: string }).id);
  }
  return "";
}

describe.skipIf(!LIVE)("EOS-A9D live JWT RLS — deliverable governance", () => {
  loadLocalEnv();
  const url = resolveSupabaseUrl()!;
  const anonKey = resolveSupabaseAnonKey()!;
  const serviceKey = resolveServiceRoleKey()!;
  let fixtures: ReviewRlsFixtures;
  let environment: "ready" | "unavailable" = "unavailable";
  const mappingIds: string[] = [];
  const definitionIds: string[] = [];
  const expectationIds: string[] = [];
  const documentIds: string[] = [];

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
    if (mappingIds.length) await svc(`engineering_document_status_mappings?id=in.(${mappingIds.join(",")})`, { method: "DELETE" });
    if (definitionIds.length) await svc(`engineering_project_deliverable_definitions?id=in.(${definitionIds.join(",")})`, { method: "DELETE" });
    if (expectationIds.length) await svc(`engineering_deliverable_expectations?id=in.(${expectationIds.join(",")})`, { method: "DELETE" });
    if (documentIds.length) await svc(`engineering_documents?id=in.(${documentIds.join(",")})`, { method: "DELETE" });
    await cleanupTransientReviewPackages();
  });

  beforeEach(({ skip }) => {
    if (environment !== "ready") skip("SKIPPED_ENVIRONMENT_UNAVAILABLE");
  });

  it("separates admin mapping/project-definition writes and denies cross-workspace document binding without leaking fields", async () => {
    const projectId = `a9d-${crypto.randomUUID()}`;
    const engineerMapping = await rest(
      "engineering_document_status_mappings",
      {
        method: "POST",
        body: JSON.stringify({
          tenant_id: fixtures.tenantAId,
          workspace_id: fixtures.workspaceA1Id,
          project_id: projectId,
          source_system: "project",
          raw_status_code: "X1",
          semantic: "FOR_REVIEW",
          mapping_version: "v1",
          configured_by: fixtures.users.a1.id,
        }),
      },
      fixtures.users.a1.jwt,
    );
    expect(mutationDenied(engineerMapping)).toBe(true);

    const adminMapping = await rest(
      "engineering_document_status_mappings",
      {
        method: "POST",
        body: JSON.stringify({
          tenant_id: fixtures.tenantAId,
          workspace_id: fixtures.workspaceA1Id,
          project_id: projectId,
          source_system: "project",
          raw_status_code: "X1",
          semantic: "FOR_REVIEW",
          mapping_version: "v1",
          configured_by: fixtures.users.aAdmin.id,
        }),
      },
      fixtures.users.aAdmin.jwt,
    );
    expect(adminMapping.status, JSON.stringify(adminMapping.body)).toBeLessThan(300);
    const mappingId = entityId(adminMapping.body) || ids(adminMapping.body)[0];
    expect(mappingId).toBeTruthy();
    mappingIds.push(mappingId);

    const a2Read = await rest(`engineering_document_status_mappings?id=eq.${mappingId}&select=id,raw_status_code`, {}, fixtures.users.a2.jwt);
    expect(ids(a2Read.body)).not.toContain(mappingId);
    const b1Read = await rest(`engineering_document_status_mappings?id=eq.${mappingId}&select=id,raw_status_code`, {}, fixtures.users.b1.jwt);
    expect(ids(b1Read.body)).not.toContain(mappingId);
    const anon = await rest(`engineering_document_status_mappings?id=eq.${mappingId}&select=id`, {});
    expect(ids(anon.body)).not.toContain(mappingId);

    const engineerDef = await rest(
      "engineering_project_deliverable_definitions",
      {
        method: "POST",
        body: JSON.stringify({
          tenant_id: fixtures.tenantAId,
          workspace_id: fixtures.workspaceA1Id,
          project_id: projectId,
          definition_id: "EOS-DLV-PROJ-LIVE-A9D",
          definition_version: "v1",
          code: "PROJ-LIVE-A9D",
          name: "Live A9D project definition",
          purpose: "rls",
          responsible_discipline: "PROCESS",
          created_by: fixtures.users.a1.id,
        }),
      },
      fixtures.users.a1.jwt,
    );
    expect(mutationDenied(engineerDef)).toBe(true);

    const adminDef = await rest(
      "engineering_project_deliverable_definitions",
      {
        method: "POST",
        body: JSON.stringify({
          tenant_id: fixtures.tenantAId,
          workspace_id: fixtures.workspaceA1Id,
          project_id: projectId,
          definition_id: "EOS-DLV-PROJ-LIVE-A9D",
          definition_version: "v1",
          code: "PROJ-LIVE-A9D",
          name: "Live A9D project definition",
          purpose: "rls",
          responsible_discipline: "PROCESS",
          created_by: fixtures.users.aAdmin.id,
        }),
      },
      fixtures.users.aAdmin.jwt,
    );
    expect(adminDef.status, JSON.stringify(adminDef.body)).toBeLessThan(300);
    const definitionId = entityId(adminDef.body) || ids(adminDef.body)[0];
    definitionIds.push(definitionId);

    const created = await rest(
      "engineering_deliverable_expectations",
      {
        method: "POST",
        body: JSON.stringify({
          tenant_id: fixtures.tenantAId,
          workspace_id: fixtures.workspaceA1Id,
          project_id: projectId,
          definition_id: "EOS-DLV-MECH-DS-FEED",
          definition_version: "v1",
          definition_code: "MECH-DS-FEED",
          lifecycle_profile_id: "EOS-DEFAULT-ENGINEERING",
          lifecycle_profile_version: "v1",
          lifecycle_stage: "FEED",
          scope_type: "PROJECT",
          scope_id: projectId,
          requirement_state: "REQUIRED",
          intended_purpose: "FOR_ENGINEERING_REVIEW",
          maturity_profile_id: "EOS-DEFAULT-DELIVERABLE-MATURITY",
          maturity_profile_version: "v1",
          responsible_discipline: "MECHANICAL",
          contributing_disciplines: ["PROCESS"],
          origin: "PROJECT_CONFIGURATION",
          adopted_from_template: true,
          created_by: fixtures.users.aAdmin.id,
        }),
      },
      fixtures.users.aAdmin.jwt,
    );
    expect(created.status, JSON.stringify(created.body)).toBeLessThan(300);
    const expectationId = entityId(created.body) || ids(created.body)[0];
    expectationIds.push(expectationId);

    const hiddenDoc = await svc("engineering_documents", {
      method: "POST",
      body: JSON.stringify({
        tenant_id: fixtures.tenantAId,
        workspace_id: fixtures.workspaceA2Id,
        document_number: `A9D-${crypto.randomUUID()}`,
        title: "hidden-workspace-b-title",
        revision: "1",
        status: "issued",
      }),
    });
    const hiddenId = entityId(hiddenDoc.body) || ids(hiddenDoc.body)[0];
    if (hiddenId) documentIds.push(hiddenId);

    const crossDoc = await rest(
      "engineering_deliverable_artifact_bindings",
      {
        method: "POST",
        body: JSON.stringify({
          tenant_id: fixtures.tenantAId,
          workspace_id: fixtures.workspaceA1Id,
          expectation_id: expectationId,
          artifact_class: "document",
          artifact_id: hiddenId || crypto.randomUUID(),
          artifact_role: "PRIMARY",
          revision_policy: "EXACT_REVISION",
          bound_by: fixtures.users.a1.id,
        }),
      },
      fixtures.users.a1.jwt,
    );
    expect(crossDoc.status).toBeGreaterThanOrEqual(400);
    expect(JSON.stringify(crossDoc.body)).not.toMatch(/hidden-workspace-b-title/);

    const crossTenant = await rest(
      "engineering_document_status_mappings",
      {
        method: "POST",
        body: JSON.stringify({
          tenant_id: fixtures.tenantBId,
          workspace_id: fixtures.workspaceB1Id,
          source_system: "project",
          raw_status_code: "X1",
          semantic: "FOR_REVIEW",
          mapping_version: "v1",
          configured_by: fixtures.users.b1.id,
        }),
      },
      fixtures.users.b1.jwt,
    );
    expect(mutationDenied(crossTenant) || crossTenant.status >= 400).toBe(true);
  });
});
