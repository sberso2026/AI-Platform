/**
 * II-1C live hosted JWT certification.
 * Uses authenticated application cookies against the real hosted route.
 * Does not use the in-memory adapter, slice fixture, or service-role user path.
 */
import { randomUUID } from "node:crypto";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";
import { GENERIC_NUMERIC_SCHEME_V1 } from "@rtb/inspection-intelligence";

const CERT_ENABLED = Boolean(
  process.env.INSPECTION_INTELLIGENCE_CERTIFICATION === "1" ||
    process.env.PROJECT_INTELLIGENCE_CERTIFICATION === "1",
);
const LIVE_ENABLED = process.env.II_1C_LIVE === "1";
const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const ANON_KEY =
  process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const BASE_URL = process.env.II_1C_LIVE_BASE_URL ?? process.env.RTB_TEST_BASE_URL ?? "";
const HOSTED_REF = "wcydlhqiqdwgoaqrlget";
const RUN_ID = process.env.II_CERT_RUN_ID ?? "pi6browsercert";
const HOSTED_PATH = "/api/engineering/inspection-intelligence/hosted";

const certEmail = (key: string) => `cert-pi-${key}-${RUN_ID}@rtb-cert.test`;

type SessionAuth = {
  cookieHeader: string;
  accessToken: string;
  userId: string;
};

function certPassword(): string {
  const password = process.env.CERT_USER_PASSWORD;
  if (!password) throw new Error("CERT_USER_PASSWORD is required for live certification");
  return password;
}

async function signIn(email: string): Promise<SessionAuth> {
  if (!SUPABASE_URL || !ANON_KEY) throw new Error("supabase_url_and_anon_required");
  const cookies: { name: string; value: string; options: CookieOptions }[] = [];
  const supabase = createServerClient(SUPABASE_URL, ANON_KEY, {
    cookies: {
      getAll: () => cookies.map(({ name, value }) => ({ name, value })),
      setAll: (entries) => {
        for (const entry of entries) {
          const index = cookies.findIndex((cookie) => cookie.name === entry.name);
          if (index >= 0) cookies[index] = entry;
          else cookies.push(entry);
        }
      },
    },
  });
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: certPassword(),
  });
  if (error || !data.session || !data.user) {
    throw new Error(`sign_in_failed:${error?.message ?? "no_session"}`);
  }
  return {
    cookieHeader: cookies.map((cookie) => `${cookie.name}=${cookie.value}`).join("; "),
    accessToken: data.session.access_token,
    userId: data.user.id,
  };
}

async function hosted(
  auth: SessionAuth | null,
  init: { method?: string; body?: unknown; query?: Record<string, string> },
): Promise<{ status: number; json: Record<string, unknown> }> {
  const url = new URL(HOSTED_PATH, BASE_URL);
  for (const [key, value] of Object.entries(init.query ?? {})) url.searchParams.set(key, value);
  const headers: Record<string, string> = { Accept: "application/json" };
  if (auth) headers.Cookie = auth.cookieHeader;
  if (init.body !== undefined) headers["Content-Type"] = "application/json";
  const response = await fetch(url, {
    method: init.method ?? (init.body ? "POST" : "GET"),
    headers,
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
  });
  const text = await response.text();
  let json: Record<string, unknown> = {};
  if (text.trim()) {
    try {
      json = JSON.parse(text) as Record<string, unknown>;
    } catch {
      json = { parse_error: true, body_kind: text.startsWith("<") ? "html" : "text" };
    }
  }
  return { status: response.status, json };
}

async function intent(auth: SessionAuth, body: Record<string, unknown>) {
  return hosted(auth, { method: "POST", body });
}

function dataOf(result: { status: number; json: Record<string, unknown> }): Record<string, unknown> {
  const payload = result.json.data;
  if (!payload || typeof payload !== "object") {
    const err = result.json.error as { code?: string; message?: string } | undefined;
    throw new Error(`hosted_missing_data:${result.status}:${err?.code ?? err?.message ?? "unknown"}`);
  }
  return payload as Record<string, unknown>;
}

function restHeaders(accessToken?: string): Record<string, string> {
  const headers: Record<string, string> = {
    apikey: ANON_KEY,
    Accept: "application/json",
  };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  return headers;
}

async function restGet(
  table: string,
  query: string,
  accessToken?: string,
): Promise<{ status: number; rows: Record<string, unknown>[] }> {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, {
    headers: restHeaders(accessToken),
  });
  const text = await response.text();
  let rows: Record<string, unknown>[] = [];
  if (text.trim() && response.ok) {
    rows = JSON.parse(text) as Record<string, unknown>[];
  }
  return { status: response.status, rows };
}

async function restWrite(
  table: string,
  accessToken: string | undefined,
  method: "POST" | "PATCH",
  body: Record<string, unknown>,
  query = "",
): Promise<{ status: number; ok: boolean; count: number }> {
  const url = `${SUPABASE_URL}/rest/v1/${table}${query ? `?${query}` : ""}`;
  const response = await fetch(url, {
    method,
    headers: {
      ...restHeaders(accessToken),
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(body),
  });
  const text = await response.text();
  let count = 0;
  if (text.trim().startsWith("[")) {
    count = (JSON.parse(text) as unknown[]).length;
  } else if (text.trim().startsWith("{") && response.ok) {
    count = 1;
  }
  return { status: response.status, ok: response.ok, count };
}

describe.skipIf(!CERT_ENABLED || !SUPABASE_URL)("II-1C hosted certification environment", () => {
  it("uses the approved Engineering OS certification project", () => {
    expect(SUPABASE_URL).toContain(`${HOSTED_REF}.supabase.co`);
    expect(SUPABASE_URL).not.toContain("hlqwihvksjgkshipoacd");
    expect(SUPABASE_URL).not.toContain("rntonzigxwxcjlcsadip");
  });
});

describe.skipIf(!LIVE_ENABLED || !CERT_ENABLED || !SUPABASE_URL || !ANON_KEY || !BASE_URL)(
  "II-1C live hosted JWT roundtrip",
  () => {
    it(
      "persists V1 records through the authenticated hosted route with RLS isolation",
      async () => {
        const owner = await signIn(certEmail("baseline-owner"));
        const viewer = await signIn(certEmail("baseline-viewer"));
        const engineerB = await signIn(certEmail("baseline-engineer-b"));
        const foreign = await signIn(certEmail("other-owner"));
        const unassignedApp = await signIn(certEmail("no-pi-owner"));
        const userDb = createClient(SUPABASE_URL, ANON_KEY, {
          global: { headers: { Authorization: `Bearer ${owner.accessToken}` } },
          auth: { persistSession: false, autoRefreshToken: false },
        });

        const { data: projects, error: projectError } = await userDb
          .from("engineering_projects")
          .select("id, project_code, workspace_id")
          .in("project_code", [`PI-${RUN_ID}`, `PI-WORKSPACE-B-${RUN_ID}`]);
        if (projectError || !projects?.length) throw new Error("canonical_projects_unreadable");
        const projectA = projects.find((row) => row.project_code === `PI-${RUN_ID}`);
        const projectB = projects.find((row) => row.project_code === `PI-WORKSPACE-B-${RUN_ID}`);
        if (!projectA || !projectB) throw new Error("canonical_projects_missing");

        const { data: asset } = await userDb
          .from("engineering_assets")
          .select("id")
          .eq("asset_tag", "II-CERT-ASSET-1")
          .maybeSingle();
        if (!asset?.id) throw new Error("canonical_asset_missing");

        const unauth = await hosted(null, {
          method: "POST",
          body: { intent: "create_plan", title: "denied" },
        });
        expect(unauth.status).toBe(401);

        const viewerDenied = await intent(viewer, {
          intent: "create_plan",
          title: "viewer should not write",
          targets: [],
        });
        expect(viewerDenied.status).toBeGreaterThanOrEqual(403);

        const appDenied = await intent(unassignedApp, {
          intent: "create_plan",
          title: "no II application",
          targets: [],
        });
        expect(appDenied.status).toBeGreaterThanOrEqual(403);

        const foreignDenied = await intent(foreign, {
          intent: "create_plan",
          title: "foreign tenant",
          targets: [],
        });
        expect(foreignDenied.status).toBeGreaterThanOrEqual(403);

        const overrideDenied = await intent(owner, {
          intent: "create_plan",
          tenantId: randomUUID(),
          title: "override",
          targets: [
            {
              id: randomUUID(),
              kind: "project",
              canonicalId: projectA.id,
              snapshot: { capturedAt: new Date().toISOString(), label: "A" },
            },
          ],
        });
        expect(overrideDenied.status).toBe(403);

        const created = dataOf(
          await intent(owner, {
            intent: "create_plan",
            projectId: projectA.id,
            title: "II-1C live visual",
            targets: [
              {
                id: randomUUID(),
                kind: "project",
                canonicalId: projectA.id,
                snapshot: { capturedAt: new Date().toISOString(), label: "PI cert project" },
              },
              {
                id: randomUUID(),
                kind: "asset",
                canonicalId: asset.id,
                snapshot: { capturedAt: new Date().toISOString(), label: "II cert asset" },
              },
            ],
            checklistItemTypes: ["pass_fail", "numeric"],
          }),
        );
        const plan = created.plan as Record<string, unknown>;
        expect(created.template).toBeTruthy();
        expect(plan.id).toBeTruthy();

        const updatedPlan = dataOf(
          await intent(owner, {
            intent: "update_plan",
            planId: plan.id,
            title: "II-1C live visual revised",
          }),
        );
        expect(updatedPlan.title).toBe("II-1C live visual revised");

        const readPlan = await hosted(owner, {
          query: { resource: "plan", id: String(plan.id), projectId: String(projectA.id) },
        });
        expect(readPlan.status).toBe(200);
        expect((readPlan.json.data as Record<string, unknown>).title).toBe("II-1C live visual revised");

        const planRow = await restGet(
          "inspection_plans",
          `id=eq.${plan.id}&select=id,title,tenant_id,workspace_id`,
          owner.accessToken,
        );
        expect(planRow.status).toBe(200);
        expect(planRow.rows).toHaveLength(1);
        expect(planRow.rows[0]?.title).toBe("II-1C live visual revised");

        const crossProject = await intent(owner, {
          intent: "create_plan",
          projectId: projectA.id,
          title: "cross project substitution",
          targets: [
            {
              id: randomUUID(),
              kind: "project",
              canonicalId: projectB.id,
              snapshot: { capturedAt: new Date().toISOString(), label: "B" },
            },
          ],
        });
        expect(crossProject.status).toBeGreaterThanOrEqual(400);

        const session = dataOf(
          await intent(owner, { intent: "start_session", planId: plan.id, projectId: projectA.id }),
        );
        expect(session.status).toBe("started");
        const sessionId = String(session.id);

        const observation = dataOf(
          await intent(owner, {
            intent: "record_observation",
            sessionId,
            checklistItemType: "numeric",
            body: "gap recorded",
          }),
        );
        const measurement = dataOf(
          await intent(owner, {
            intent: "record_measurement",
            sessionId,
            observationId: observation.id,
            measurementType: "gap_mm",
            observedValue: 4.9,
            expectedValue: 5,
            criteria: { mode: "tolerance", tolerance: { absolute: 0.5 } },
          }),
        );
        expect(measurement.evaluation_status).toBe("pass");

        const evidence = dataOf(
          await intent(owner, {
            intent: "register_evidence",
            sessionId,
            observationId: observation.id,
            kind: "photo",
            fileId: "file_platform_ii1c_live",
          }),
        );
        expect(evidence.file_id).toBe("file_platform_ii1c_live");

        const defect = dataOf(
          await intent(owner, {
            intent: "create_defect",
            sessionId,
            observationId: observation.id,
            title: "Corrosion",
            description: "flange face",
            taxonomy: {
              severity: "medium",
              urgency: "routine",
              monitoringRequired: true,
              defectCategory: "corrosion",
            },
          }),
        );
        const recommendation = dataOf(
          await intent(owner, {
            intent: "link_recommendation",
            sessionId,
            defectId: defect.id,
            action: "repair",
            rationale: "restore coating",
          }),
        );
        let ca = dataOf(
          await intent(owner, {
            intent: "create_corrective_action",
            sessionId,
            defectId: defect.id,
            recommendationId: recommendation.id,
            ownerPersonId: owner.userId,
            dueAt: new Date(Date.now() + 86400000).toISOString(),
            description: "recoat flange",
          }),
        );
        for (const to of ["in_progress", "pending_verification", "verified", "closed"]) {
          ca = dataOf(await intent(owner, { intent: "progress_corrective_action", actionId: ca.id, to }));
        }
        expect(ca.status).toBe("closed");

        const assessment = dataOf(
          await intent(owner, {
            intent: "record_assessment",
            sessionId,
            defectId: defect.id,
            title: "Human assessment",
            body: "repair required",
          }),
        );
        expect(assessment.aiGenerated).toBe(false);

        const conditionResult = await intent(owner, {
          intent: "persist_condition_rating",
          sessionId,
          componentScope: "flange",
          inspectionScope: "visual",
          observationIds: [observation.id],
          scheme: GENERIC_NUMERIC_SCHEME_V1,
          numericScore: 42,
          confidence: 0.7,
          uncertainty: 0.2,
          evidenceSufficiency: "sufficient",
          packId: "generic",
        });
        expect(
          conditionResult.status,
          JSON.stringify(conditionResult.json.error ?? conditionResult.json),
        ).toBe(201);
        const condition = dataOf(conditionResult);
        const conditionRead = await hosted(owner, {
          query: { resource: "condition", id: String(condition.ratingId) },
        });
        expect(conditionRead.status).toBe(200);
        expect((conditionRead.json.data as Record<string, unknown> | null)?.ratingId).toBe(
          condition.ratingId,
        );

        const verification = dataOf(
          await intent(owner, {
            intent: "request_verification",
            sessionId,
            kind: "corrective_action",
            subjectId: ca.id,
          }),
        );
        const completedVerification = dataOf(
          await intent(owner, {
            intent: "complete_verification",
            verificationId: verification.id,
            status: "passed",
            notes: "human verified",
          }),
        );
        expect(completedVerification.status).toBe("passed");

        await intent(owner, { intent: "transition_session", sessionId, to: "completed" });
        await intent(owner, { intent: "transition_session", sessionId, to: "submitted" });
        await intent(owner, { intent: "transition_session", sessionId, to: "reviewed" });
        await intent(owner, { intent: "transition_session", sessionId, to: "approved" });
        const closed = dataOf(await intent(owner, { intent: "close_out", sessionId }));
        expect(closed.status).toBe("closed");

        const sessionRead = await hosted(owner, { query: { resource: "session", id: sessionId } });
        expect((sessionRead.json.data as Record<string, unknown>).status).toBe("closed");

        const tables: Array<[string, string]> = [
          ["inspection_plans", String(plan.id)],
          ["inspection_sessions", sessionId],
          ["inspection_observations", String(observation.id)],
          ["inspection_measurements", String(measurement.id)],
          ["inspection_evidence", String(evidence.id)],
          ["inspection_defects", String(defect.id)],
          ["inspection_assessments", String(assessment.id)],
          ["inspection_verifications", String(verification.id)],
          ["inspection_corrective_actions", String(ca.id)],
        ];
        for (const [table, id] of tables) {
          const ownerRead = await restGet(table, `id=eq.${id}&select=id`, owner.accessToken);
          expect(ownerRead.rows.length, table).toBe(1);
          const foreignRead = await restGet(table, `id=eq.${id}&select=id`, foreign.accessToken);
          expect(foreignRead.rows.length, `${table}_tenant`).toBe(0);
          const workspaceRead = await restGet(table, `id=eq.${id}&select=id`, engineerB.accessToken);
          expect(workspaceRead.rows.length, `${table}_workspace`).toBe(0);
        }

        const conditionRow = await restGet(
          "inspection_condition_ratings",
          `rating_id=eq.${condition.ratingId}&select=id,rating_id`,
          owner.accessToken,
        );
        expect(conditionRow.rows.length).toBe(1);

        const anonDenied = await restGet("inspection_plans", `id=eq.${plan.id}&select=id`);
        expect(anonDenied.rows.length).toBe(0);

        const antiEnum = await hosted(engineerB, { query: { resource: "plan", id: String(plan.id) } });
        expect(antiEnum.status).toBe(404);

        const missing = await hosted(owner, { query: { resource: "plan", id: randomUUID() } });
        expect(missing.status).toBe(404);

        const forbiddenInsert = await restWrite("inspection_plans", engineerB.accessToken, "POST", {
          id: randomUUID(),
          tenant_id: planRow.rows[0]?.tenant_id,
          workspace_id: planRow.rows[0]?.workspace_id,
          template_id: created.template ? (created.template as Record<string, unknown>).id : randomUUID(),
          title: "workspace isolation insert",
          status: "planned",
          targets: [],
        });
        expect(forbiddenInsert.ok).toBe(false);
        expect(forbiddenInsert.count).toBe(0);

        const forbiddenUpdate = await restWrite(
          "inspection_plans",
          engineerB.accessToken,
          "PATCH",
          { title: "hijack" },
          `id=eq.${plan.id}`,
        );
        expect(forbiddenUpdate.count).toBe(0);
        const afterHijack = await restGet(
          "inspection_plans",
          `id=eq.${plan.id}&select=title`,
          owner.accessToken,
        );
        expect(afterHijack.rows[0]?.title).toBe("II-1C live visual revised");

        const permittedUpdate = await restWrite(
          "inspection_plans",
          owner.accessToken,
          "PATCH",
          { title: "II-1C live visual revised" },
          `id=eq.${plan.id}`,
        );
        expect(permittedUpdate.count).toBe(1);

        const { data: audit } = await userDb
          .from("audit_events")
          .select("id, user_id, tenant_id, workspace_id, action, resource_type, resource_id, created_at, metadata")
          .eq("resource_id", String(plan.id))
          .order("created_at", { ascending: false })
          .limit(5);
        expect((audit ?? []).length).toBeGreaterThan(0);
        expect(audit?.[0]?.user_id).toBe(owner.userId);
        expect(audit?.[0]?.tenant_id).toBe(planRow.rows[0]?.tenant_id);
        expect(audit?.[0]?.workspace_id).toBe(planRow.rows[0]?.workspace_id);
        expect(String(audit?.[0]?.action ?? "")).toContain("inspection");

        const { data: events } = await userDb
          .from("inspection_events")
          .select("id, event_type, entity_id, occurred_at")
          .eq("entity_id", sessionId)
          .limit(5);
        expect((events ?? []).length).toBeGreaterThan(0);
      },
      180_000,
    );
  },
);
