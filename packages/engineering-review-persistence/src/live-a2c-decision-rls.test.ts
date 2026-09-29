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
const TAG = { eos_a2c: true };

type JsonRow = Record<string, unknown> & { id: string };

function rowId(body: unknown): string {
  if (Array.isArray(body) && body[0] && typeof body[0] === "object" && body[0] !== null && "id" in body[0]) {
    return String((body[0] as { id: string }).id);
  }
  if (body && typeof body === "object" && "id" in body) return String((body as { id: string }).id);
  throw new Error(`expected id in ${JSON.stringify(body)}`);
}

describe.skipIf(!LIVE)("EOS-A2C live JWT RLS — Decision Intelligence", () => {
  loadLocalEnv();
  const url = resolveSupabaseUrl()!;
  const anonKey = resolveSupabaseAnonKey()!;
  const serviceKey = resolveServiceRoleKey()!;
  let fixtures: ReviewRlsFixtures;
  let environment: "ready" | "unavailable" = "unavailable";
  const createdDecisionIds: string[] = [];

  async function rest(path: string, options: RequestInit = {}, jwt?: string) {
    return restFetch(url, anonKey, serviceKey, path, options, jwt);
  }

  async function svc(path: string, options: RequestInit = {}) {
    return rest(path, options, serviceKey);
  }

  async function seedDecision(input: {
    tenantId: string;
    workspaceId: string;
    projectId: string;
    title: string;
  }): Promise<JsonRow> {
    const created = await svc("engineering_decisions", {
      method: "POST",
      body: JSON.stringify({
        tenant_id: input.tenantId,
        workspace_id: input.workspaceId,
        project_id: input.projectId,
        decision_number: `A2C-${randomUUID().slice(0, 8)}`,
        title: input.title,
        status: "draft",
        decision_question: `${input.title}?`,
        metadata: TAG,
      }),
    });
    expect(created.status, JSON.stringify(created.body)).toBeGreaterThanOrEqual(200);
    expect(created.status).toBeLessThan(300);
    const row = Array.isArray(created.body) ? (created.body[0] as JsonRow) : (created.body as JsonRow);
    createdDecisionIds.push(row.id);
    return row;
  }

  async function seedAlternative(decisionId: string, tenantId: string, workspaceId: string, code: string) {
    const created = await svc("engineering_decision_alternatives", {
      method: "POST",
      body: JSON.stringify({
        tenant_id: tenantId,
        workspace_id: workspaceId,
        decision_id: decisionId,
        alternative_code: code,
        name: code,
        status: "considered",
      }),
    });
    expect(created.status, JSON.stringify(created.body)).toBeLessThan(300);
    return Array.isArray(created.body) ? (created.body[0] as JsonRow) : (created.body as JsonRow);
  }

  async function seedAssumption(input: {
    tenantId: string;
    workspaceId: string;
    projectId: string;
    title: string;
  }) {
    const created = await svc("engineering_assumptions", {
      method: "POST",
      body: JSON.stringify({
        tenant_id: input.tenantId,
        workspace_id: input.workspaceId,
        project_id: input.projectId,
        assumption_number: `ASM-${randomUUID().slice(0, 8)}`,
        title: input.title,
        statement: `${input.title} statement`,
        status: "draft",
        metadata: TAG,
      }),
    });
    expect(created.status, JSON.stringify(created.body)).toBeLessThan(300);
    return Array.isArray(created.body) ? (created.body[0] as JsonRow) : (created.body as JsonRow);
  }

  beforeAll(async () => {
    if (mode === "misconfigured") {
      throw new Error("ENGINEERING_REVIEW_RLS=1 but hosted credentials are missing");
    }
    fixtures = await provisionReviewRlsFixtures();
    environment = "ready";
  });

  afterAll(async () => {
    if (environment !== "ready") return;
    if (createdDecisionIds.length > 0) {
      const inList = `(${createdDecisionIds.join(",")})`;
      await svc(`engineering_object_links?from_id=in.${inList}`, { method: "DELETE" });
      await svc(`engineering_object_links?to_id=in.${inList}`, { method: "DELETE" });
      await svc(`engineering_decision_approvals?decision_id=in.${inList}`, { method: "DELETE" });
      await svc(`engineering_decision_alternatives?decision_id=in.${inList}`, { method: "DELETE" });
      await svc(`engineering_assumptions?metadata->>eos_a2c=eq.true`, { method: "DELETE" });
      await svc(`engineering_decisions?id=in.${inList}`, { method: "DELETE" });
    }
    await cleanupTransientReviewPackages();
  });

  beforeEach(({ skip }) => {
    if (environment !== "ready") skip("SKIPPED_ENVIRONMENT_UNAVAILABLE");
  });

  it("A. decision read matrix (same workspace / same tenant / cross tenant / anon / service)", async () => {
    const a1 = await seedDecision({
      tenantId: fixtures.tenantAId,
      workspaceId: fixtures.workspaceA1Id,
      projectId: fixtures.projectA1Id,
      title: "A1 decision",
    });
    const a2 = await seedDecision({
      tenantId: fixtures.tenantAId,
      workspaceId: fixtures.workspaceA2Id,
      projectId: fixtures.projectA2Id,
      title: "A2 decision",
    });
    const b1 = await seedDecision({
      tenantId: fixtures.tenantBId,
      workspaceId: fixtures.workspaceB1Id,
      projectId: fixtures.projectB1Id,
      title: "B1 decision",
    });

    const own = await rest(`engineering_decisions?select=id,title,decision_question&id=eq.${a1.id}`, {}, fixtures.users.a1.jwt);
    expect(own.status).toBe(200);
    expect(ids(own.body)).toEqual([a1.id]);
    expect((own.body as JsonRow[])[0].title).toBe("A1 decision");

    const sameTenant = await rest(`engineering_decisions?select=id,title&id=eq.${a2.id}`, {}, fixtures.users.a1.jwt);
    expect(sameTenant.status).toBe(200);
    expect(ids(sameTenant.body)).toEqual([]);

    const crossTenant = await rest(`engineering_decisions?select=id&id=eq.${b1.id}`, {}, fixtures.users.a1.jwt);
    expect(ids(crossTenant.body)).toEqual([]);

    const bReadsA = await rest(`engineering_decisions?select=id&id=eq.${a1.id}`, {}, fixtures.users.b1.jwt);
    expect(ids(bReadsA.body)).toEqual([]);

    const anon = await rest(`engineering_decisions?select=id&id=eq.${a1.id}`);
    expect(ids(anon.body)).toEqual([]);

    const service = await svc(`engineering_decisions?select=id&id=eq.${a2.id}`);
    expect(ids(service.body)).toContain(a2.id);

    const adminA1 = await rest(`engineering_decisions?select=id&id=eq.${a1.id}`, {}, fixtures.users.aAdmin.jwt);
    expect(ids(adminA1.body)).toContain(a1.id);
    const adminA2 = await rest(`engineering_decisions?select=id&id=eq.${a2.id}`, {}, fixtures.users.aAdmin.jwt);
    expect(ids(adminA2.body)).toEqual([]);
  });

  it("B. decision write: A1 mutates A1; cannot mutate A2 or B1", async () => {
    const a1 = await seedDecision({
      tenantId: fixtures.tenantAId,
      workspaceId: fixtures.workspaceA1Id,
      projectId: fixtures.projectA1Id,
      title: "A1 write target",
    });
    const a2 = await seedDecision({
      tenantId: fixtures.tenantAId,
      workspaceId: fixtures.workspaceA2Id,
      projectId: fixtures.projectA2Id,
      title: "A2 write target",
    });
    const b1 = await seedDecision({
      tenantId: fixtures.tenantBId,
      workspaceId: fixtures.workspaceB1Id,
      projectId: fixtures.projectB1Id,
      title: "B1 write target",
    });

    const ok = await rest(
      `engineering_decisions?id=eq.${a1.id}`,
      { method: "PATCH", body: JSON.stringify({ rationale: "authorized patch" }) },
      fixtures.users.a1.jwt,
    );
    expect(ok.status).toBeLessThan(400);

    const hijackA2 = await rest(
      `engineering_decisions?id=eq.${a2.id}`,
      { method: "PATCH", body: JSON.stringify({ rationale: "hijack" }) },
      fixtures.users.a1.jwt,
    );
    expect(mutationDenied(hijackA2)).toBe(true);

    const hijackB1 = await rest(
      `engineering_decisions?id=eq.${b1.id}`,
      { method: "PATCH", body: JSON.stringify({ rationale: "hijack" }) },
      fixtures.users.a1.jwt,
    );
    expect(mutationDenied(hijackB1)).toBe(true);

    const insertA2 = await rest(
      "engineering_decisions",
      {
        method: "POST",
        body: JSON.stringify({
          tenant_id: fixtures.tenantAId,
          workspace_id: fixtures.workspaceA2Id,
          project_id: fixtures.projectA2Id,
          decision_number: `A2C-HIJACK-${randomUUID().slice(0, 8)}`,
          title: "A1 into A2",
          metadata: TAG,
        }),
      },
      fixtures.users.a1.jwt,
    );
    expect(insertA2.status).toBeGreaterThanOrEqual(400);
  });

  it("C. alternatives follow parent workspace; cannot attach to foreign parent", async () => {
    const a1 = await seedDecision({
      tenantId: fixtures.tenantAId,
      workspaceId: fixtures.workspaceA1Id,
      projectId: fixtures.projectA1Id,
      title: "A1 alt parent",
    });
    const a2 = await seedDecision({
      tenantId: fixtures.tenantAId,
      workspaceId: fixtures.workspaceA2Id,
      projectId: fixtures.projectA2Id,
      title: "A2 alt parent",
    });
    const b1 = await seedDecision({
      tenantId: fixtures.tenantBId,
      workspaceId: fixtures.workspaceB1Id,
      projectId: fixtures.projectB1Id,
      title: "B1 alt parent",
    });
    const altA1 = await seedAlternative(a1.id, fixtures.tenantAId, fixtures.workspaceA1Id, "ALT-A1");
    const altA2 = await seedAlternative(a2.id, fixtures.tenantAId, fixtures.workspaceA2Id, "ALT-A2");

    const readOwn = await rest(`engineering_decision_alternatives?id=eq.${altA1.id}`, {}, fixtures.users.a1.jwt);
    expect(ids(readOwn.body)).toContain(altA1.id);
    const readA2 = await rest(`engineering_decision_alternatives?id=eq.${altA2.id}`, {}, fixtures.users.a1.jwt);
    expect(ids(readA2.body)).toEqual([]);

    const writeOwn = await rest(
      "engineering_decision_alternatives",
      {
        method: "POST",
        body: JSON.stringify({
          tenant_id: fixtures.tenantAId,
          workspace_id: fixtures.workspaceA1Id,
          decision_id: a1.id,
          alternative_code: "ALT-A1-JWT",
          name: "JWT alt",
        }),
      },
      fixtures.users.a1.jwt,
    );
    expect(writeOwn.status).toBeLessThan(400);

    const attachA2 = await rest(
      "engineering_decision_alternatives",
      {
        method: "POST",
        body: JSON.stringify({
          tenant_id: fixtures.tenantAId,
          workspace_id: fixtures.workspaceA1Id,
          decision_id: a2.id,
          alternative_code: "ALT-HIJACK-A2",
          name: "hijack A2",
        }),
      },
      fixtures.users.a1.jwt,
    );
    expect(attachA2.status).toBeGreaterThanOrEqual(400);

    const attachB1 = await rest(
      "engineering_decision_alternatives",
      {
        method: "POST",
        body: JSON.stringify({
          tenant_id: fixtures.tenantBId,
          workspace_id: fixtures.workspaceB1Id,
          decision_id: b1.id,
          alternative_code: "ALT-HIJACK-B1",
          name: "hijack B1",
        }),
      },
      fixtures.users.a1.jwt,
    );
    expect(attachB1.status).toBeGreaterThanOrEqual(400);
  });

  it("D. approvals are append-only human events", async () => {
    const a1 = await seedDecision({
      tenantId: fixtures.tenantAId,
      workspaceId: fixtures.workspaceA1Id,
      projectId: fixtures.projectA1Id,
      title: "A1 approval parent",
    });
    const a2 = await seedDecision({
      tenantId: fixtures.tenantAId,
      workspaceId: fixtures.workspaceA2Id,
      projectId: fixtures.projectA2Id,
      title: "A2 approval parent",
    });
    const b1 = await seedDecision({
      tenantId: fixtures.tenantBId,
      workspaceId: fixtures.workspaceB1Id,
      projectId: fixtures.projectB1Id,
      title: "B1 approval parent",
    });

    const human = await rest(
      "engineering_decision_approvals",
      {
        method: "POST",
        body: JSON.stringify({
          tenant_id: fixtures.tenantAId,
          workspace_id: fixtures.workspaceA1Id,
          decision_id: a1.id,
          action: "endorsed",
          actor_id: fixtures.users.a1.id,
          actor_kind: "human",
          comments: "authorized",
        }),
      },
      fixtures.users.a1.jwt,
    );
    expect(human.status, JSON.stringify(human.body)).toBeLessThan(400);
    const approvalId = rowId(human.body);

    const unauthWs = await rest(
      "engineering_decision_approvals",
      {
        method: "POST",
        body: JSON.stringify({
          tenant_id: fixtures.tenantAId,
          workspace_id: fixtures.workspaceA2Id,
          decision_id: a2.id,
          action: "approved",
          actor_id: fixtures.users.a1.id,
          actor_kind: "human",
        }),
      },
      fixtures.users.a1.jwt,
    );
    expect(unauthWs.status).toBeGreaterThanOrEqual(400);

    const crossTenant = await rest(
      "engineering_decision_approvals",
      {
        method: "POST",
        body: JSON.stringify({
          tenant_id: fixtures.tenantBId,
          workspace_id: fixtures.workspaceB1Id,
          decision_id: b1.id,
          action: "approved",
          actor_id: fixtures.users.a1.id,
          actor_kind: "human",
        }),
      },
      fixtures.users.a1.jwt,
    );
    expect(crossTenant.status).toBeGreaterThanOrEqual(400);

    const update = await rest(
      `engineering_decision_approvals?id=eq.${approvalId}`,
      { method: "PATCH", body: JSON.stringify({ comments: "tamper" }) },
      fixtures.users.a1.jwt,
    );
    expect(mutationDenied(update) || update.status >= 400).toBe(true);

    const del = await rest(`engineering_decision_approvals?id=eq.${approvalId}`, { method: "DELETE" }, fixtures.users.a1.jwt);
    expect(mutationDenied(del) || del.status >= 400).toBe(true);

    const ai = await rest(
      "engineering_decision_approvals",
      {
        method: "POST",
        body: JSON.stringify({
          tenant_id: fixtures.tenantAId,
          workspace_id: fixtures.workspaceA1Id,
          decision_id: a1.id,
          action: "approved",
          actor_id: fixtures.users.a1.id,
          actor_kind: "ai",
        }),
      },
      fixtures.users.a1.jwt,
    );
    expect(ai.status).toBeGreaterThanOrEqual(400);

    const asServiceAi = await svc("engineering_decision_approvals", {
      method: "POST",
      body: JSON.stringify({
        tenant_id: fixtures.tenantAId,
        workspace_id: fixtures.workspaceA1Id,
        decision_id: a1.id,
        action: "approved",
        actor_id: fixtures.users.a1.id,
        actor_kind: "service",
      }),
    });
    expect(asServiceAi.status).toBeGreaterThanOrEqual(400);
  });

  it("E. assumption workspace isolation", async () => {
    const a1 = await seedAssumption({
      tenantId: fixtures.tenantAId,
      workspaceId: fixtures.workspaceA1Id,
      projectId: fixtures.projectA1Id,
      title: "A1 assumption",
    });
    const a2 = await seedAssumption({
      tenantId: fixtures.tenantAId,
      workspaceId: fixtures.workspaceA2Id,
      projectId: fixtures.projectA2Id,
      title: "A2 assumption",
    });
    const b1 = await seedAssumption({
      tenantId: fixtures.tenantBId,
      workspaceId: fixtures.workspaceB1Id,
      projectId: fixtures.projectB1Id,
      title: "B1 assumption",
    });

    expect(ids((await rest(`engineering_assumptions?id=eq.${a1.id}`, {}, fixtures.users.a1.jwt)).body)).toContain(a1.id);
    expect(ids((await rest(`engineering_assumptions?id=eq.${a2.id}`, {}, fixtures.users.a1.jwt)).body)).toEqual([]);
    expect(ids((await rest(`engineering_assumptions?id=eq.${b1.id}`, {}, fixtures.users.a1.jwt)).body)).toEqual([]);

    const patchA2 = await rest(
      `engineering_assumptions?id=eq.${a2.id}`,
      { method: "PATCH", body: JSON.stringify({ title: "hijack" }) },
      fixtures.users.a1.jwt,
    );
    expect(mutationDenied(patchA2)).toBe(true);

    const patchB1 = await rest(
      `engineering_assumptions?id=eq.${b1.id}`,
      { method: "PATCH", body: JSON.stringify({ title: "hijack" }) },
      fixtures.users.a1.jwt,
    );
    expect(mutationDenied(patchB1)).toBe(true);

    const validate = await rest(
      `engineering_assumptions?id=eq.${a1.id}`,
      { method: "PATCH", body: JSON.stringify({ validation_status: "validated" }) },
      fixtures.users.a1.jwt,
    );
    expect(validate.status).toBeLessThan(400);
  });

  it("F. governed object links: same workspace ok; cross-workspace/tenant fail; free-text governed fail", async () => {
    const a1 = await seedDecision({
      tenantId: fixtures.tenantAId,
      workspaceId: fixtures.workspaceA1Id,
      projectId: fixtures.projectA1Id,
      title: "A1 link source",
    });
    const a1b = await seedDecision({
      tenantId: fixtures.tenantAId,
      workspaceId: fixtures.workspaceA1Id,
      projectId: fixtures.projectA1Id,
      title: "A1 link dest",
    });
    const a2 = await seedDecision({
      tenantId: fixtures.tenantAId,
      workspaceId: fixtures.workspaceA2Id,
      projectId: fixtures.projectA2Id,
      title: "A2 link dest",
    });
    const b1 = await seedDecision({
      tenantId: fixtures.tenantBId,
      workspaceId: fixtures.workspaceB1Id,
      projectId: fixtures.projectB1Id,
      title: "B1 link dest",
    });
    const asm = await seedAssumption({
      tenantId: fixtures.tenantAId,
      workspaceId: fixtures.workspaceA1Id,
      projectId: fixtures.projectA1Id,
      title: "A1 linked assumption",
    });

    const ok = await rest(
      "engineering_object_links",
      {
        method: "POST",
        body: JSON.stringify({
          tenant_id: fixtures.tenantAId,
          from_type: "decision",
          from_id: a1.id,
          to_type: "assumption",
          to_id: asm.id,
          relationship: "BASED_ON",
          relationship_governed: true,
          metadata: TAG,
        }),
      },
      fixtures.users.a1.jwt,
    );
    expect(ok.status, JSON.stringify(ok.body)).toBeLessThan(400);

    const crossWs = await rest(
      "engineering_object_links",
      {
        method: "POST",
        body: JSON.stringify({
          tenant_id: fixtures.tenantAId,
          from_type: "decision",
          from_id: a1.id,
          to_type: "decision",
          to_id: a2.id,
          relationship: "BASED_ON",
          relationship_governed: true,
          metadata: TAG,
        }),
      },
      fixtures.users.a1.jwt,
    );
    expect(crossWs.status).toBeGreaterThanOrEqual(400);

    const crossTenant = await rest(
      "engineering_object_links",
      {
        method: "POST",
        body: JSON.stringify({
          tenant_id: fixtures.tenantAId,
          from_type: "decision",
          from_id: a1.id,
          to_type: "decision",
          to_id: b1.id,
          relationship: "BASED_ON",
          relationship_governed: true,
          metadata: TAG,
        }),
      },
      fixtures.users.a1.jwt,
    );
    expect(crossTenant.status).toBeGreaterThanOrEqual(400);

    const freeText = await rest(
      "engineering_object_links",
      {
        method: "POST",
        body: JSON.stringify({
          tenant_id: fixtures.tenantAId,
          from_type: "decision",
          from_id: a1.id,
          to_type: "decision",
          to_id: a1b.id,
          relationship: "FREE_TEXT_BYPASS",
          relationship_governed: true,
          metadata: TAG,
        }),
      },
      fixtures.users.a1.jwt,
    );
    expect(freeText.status).toBeGreaterThanOrEqual(400);

    const leak = await rest(
      `engineering_object_links?select=id,to_id&to_id=eq.${a2.id}`,
      {},
      fixtures.users.a1.jwt,
    );
    expect(ids(leak.body)).toEqual([]);
  });

  it("selection integrity: same-decision only; is_selected stays consistent; delete clears parent", async () => {
    const a1 = await seedDecision({
      tenantId: fixtures.tenantAId,
      workspaceId: fixtures.workspaceA1Id,
      projectId: fixtures.projectA1Id,
      title: "A1 selection",
    });
    const a2 = await seedDecision({
      tenantId: fixtures.tenantAId,
      workspaceId: fixtures.workspaceA2Id,
      projectId: fixtures.projectA2Id,
      title: "A2 selection",
    });
    const b1 = await seedDecision({
      tenantId: fixtures.tenantBId,
      workspaceId: fixtures.workspaceB1Id,
      projectId: fixtures.projectB1Id,
      title: "B1 selection",
    });
    const altOwn = await seedAlternative(a1.id, fixtures.tenantAId, fixtures.workspaceA1Id, "SEL-OWN");
    const altOther = await seedAlternative(a1.id, fixtures.tenantAId, fixtures.workspaceA1Id, "SEL-OTHER");
    const altA2 = await seedAlternative(a2.id, fixtures.tenantAId, fixtures.workspaceA2Id, "SEL-A2");
    const altB1 = await seedAlternative(b1.id, fixtures.tenantBId, fixtures.workspaceB1Id, "SEL-B1");

    const selectOwn = await rest(
      `engineering_decisions?id=eq.${a1.id}`,
      { method: "PATCH", body: JSON.stringify({ selected_alternative_id: altOwn.id }) },
      fixtures.users.a1.jwt,
    );
    expect(selectOwn.status, JSON.stringify(selectOwn.body)).toBeLessThan(400);

    const synced = await svc(`engineering_decision_alternatives?select=id,is_selected,status&decision_id=eq.${a1.id}`);
    const rows = synced.body as Array<{ id: string; is_selected: boolean; status: string }>;
    expect(rows.find((row) => row.id === altOwn.id)?.is_selected).toBe(true);
    expect(rows.find((row) => row.id === altOwn.id)?.status).toBe("selected");
    expect(rows.find((row) => row.id === altOther.id)?.is_selected).toBe(false);

    const foreignDecision = await rest(
      `engineering_decisions?id=eq.${a1.id}`,
      { method: "PATCH", body: JSON.stringify({ selected_alternative_id: altA2.id }) },
      fixtures.users.a1.jwt,
    );
    expect(foreignDecision.status).toBeGreaterThanOrEqual(400);

    const foreignTenant = await rest(
      `engineering_decisions?id=eq.${a1.id}`,
      { method: "PATCH", body: JSON.stringify({ selected_alternative_id: altB1.id }) },
      fixtures.users.a1.jwt,
    );
    expect(foreignTenant.status).toBeGreaterThanOrEqual(400);

    const del = await svc(`engineering_decision_alternatives?id=eq.${altOwn.id}`, { method: "DELETE" });
    expect(del.status).toBeLessThan(400);
    const parent = await svc(`engineering_decisions?select=selected_alternative_id&id=eq.${a1.id}`);
    const selected = Array.isArray(parent.body)
      ? (parent.body[0] as { selected_alternative_id: string | null }).selected_alternative_id
      : (parent.body as { selected_alternative_id: string | null }).selected_alternative_id;
    expect(selected).toBeNull();
  });

  it("supersession: same workspace ok; cross-workspace/tenant/self/cycle fail", async () => {
    const a = await seedDecision({
      tenantId: fixtures.tenantAId,
      workspaceId: fixtures.workspaceA1Id,
      projectId: fixtures.projectA1Id,
      title: "A1 chain A",
    });
    const b = await seedDecision({
      tenantId: fixtures.tenantAId,
      workspaceId: fixtures.workspaceA1Id,
      projectId: fixtures.projectA1Id,
      title: "A1 chain B",
    });
    const c = await seedDecision({
      tenantId: fixtures.tenantAId,
      workspaceId: fixtures.workspaceA1Id,
      projectId: fixtures.projectA1Id,
      title: "A1 chain C",
    });
    const a2 = await seedDecision({
      tenantId: fixtures.tenantAId,
      workspaceId: fixtures.workspaceA2Id,
      projectId: fixtures.projectA2Id,
      title: "A2 chain",
    });
    const b1 = await seedDecision({
      tenantId: fixtures.tenantBId,
      workspaceId: fixtures.workspaceB1Id,
      projectId: fixtures.projectB1Id,
      title: "B1 chain",
    });

    const legit = await rest(
      `engineering_decisions?id=eq.${b.id}`,
      { method: "PATCH", body: JSON.stringify({ supersedes_decision_id: a.id }) },
      fixtures.users.a1.jwt,
    );
    expect(legit.status, JSON.stringify(legit.body)).toBeLessThan(400);

    const crossWs = await rest(
      `engineering_decisions?id=eq.${a.id}`,
      { method: "PATCH", body: JSON.stringify({ supersedes_decision_id: a2.id }) },
      fixtures.users.a1.jwt,
    );
    expect(crossWs.status).toBeGreaterThanOrEqual(400);

    const crossTenant = await rest(
      `engineering_decisions?id=eq.${a.id}`,
      { method: "PATCH", body: JSON.stringify({ supersedes_decision_id: b1.id }) },
      fixtures.users.a1.jwt,
    );
    expect(crossTenant.status).toBeGreaterThanOrEqual(400);

    const self = await rest(
      `engineering_decisions?id=eq.${a.id}`,
      { method: "PATCH", body: JSON.stringify({ supersedes_decision_id: a.id }) },
      fixtures.users.a1.jwt,
    );
    expect(self.status).toBeGreaterThanOrEqual(400);

    const simpleCycle = await rest(
      `engineering_decisions?id=eq.${a.id}`,
      { method: "PATCH", body: JSON.stringify({ supersedes_decision_id: b.id }) },
      fixtures.users.a1.jwt,
    );
    expect(simpleCycle.status).toBeGreaterThanOrEqual(400);

    const cSupersedesB = await rest(
      `engineering_decisions?id=eq.${c.id}`,
      { method: "PATCH", body: JSON.stringify({ supersedes_decision_id: b.id }) },
      fixtures.users.a1.jwt,
    );
    expect(cSupersedesB.status).toBeLessThan(400);
    const longCycle = await rest(
      `engineering_decisions?id=eq.${a.id}`,
      { method: "PATCH", body: JSON.stringify({ supersedes_decision_id: c.id }) },
      fixtures.users.a1.jwt,
    );
    expect(longCycle.status).toBeGreaterThanOrEqual(400);
  });
});
