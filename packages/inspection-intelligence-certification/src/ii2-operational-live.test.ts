/**
 * II-2 live operational + security UAT against the hosted Engineering OS project.
 * Reuses II-1C cert identities. Does not use the in-memory adapter or service-role user path.
 */
import { randomUUID } from "node:crypto";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";

const CERT_ENABLED = Boolean(
  process.env.INSPECTION_INTELLIGENCE_CERTIFICATION === "1" ||
    process.env.PROJECT_INTELLIGENCE_CERTIFICATION === "1",
);
const LIVE_ENABLED = process.env.II_1C_LIVE === "1" || process.env.II_2_LIVE === "1";
const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const ANON_KEY = process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
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
): Promise<{ status: number; json: Record<string, unknown>; ms: number }> {
  const url = new URL(HOSTED_PATH, BASE_URL);
  for (const [key, value] of Object.entries(init.query ?? {})) url.searchParams.set(key, value);
  const headers: Record<string, string> = { Accept: "application/json" };
  if (auth) headers.Cookie = auth.cookieHeader;
  if (init.body !== undefined) headers["Content-Type"] = "application/json";
  const started = Date.now();
  const response = await fetch(url, {
    method: init.method ?? (init.body ? "POST" : "GET"),
    headers,
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
  });
  const ms = Date.now() - started;
  const text = await response.text();
  let json: Record<string, unknown> = {};
  if (text.trim()) {
    try {
      json = JSON.parse(text) as Record<string, unknown>;
    } catch {
      json = { parse_error: true, body_kind: text.startsWith("<") ? "html" : "text" };
    }
  }
  return { status: response.status, json, ms };
}

function dataOf(result: { status: number; json: Record<string, unknown> }): Record<string, unknown> {
  const payload = result.json.data;
  if (!payload || typeof payload !== "object") {
    const err = result.json.error as { code?: string; message?: string } | undefined;
    throw new Error(`hosted_missing_data:${result.status}:${err?.code ?? err?.message ?? "unknown"}`);
  }
  return payload as Record<string, unknown>;
}

describe.skipIf(!LIVE_ENABLED || !CERT_ENABLED || !SUPABASE_URL || !ANON_KEY || !BASE_URL)(
  "II-2 live planning and execution",
  () => {
    it("runs the operational inspector flow with isolation and provenance", async () => {
      expect(SUPABASE_URL).toContain(`${HOSTED_REF}.supabase.co`);

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
        .select("id, project_code")
        .in("project_code", [`PI-${RUN_ID}`, `PI-WORKSPACE-B-${RUN_ID}`]);
      if (projectError || !projects?.length) throw new Error("canonical_projects_unreadable");
      const projectA = projects.find((row) => row.project_code === `PI-${RUN_ID}`);
      const projectB = projects.find((row) => row.project_code === `PI-WORKSPACE-B-${RUN_ID}`);
      if (!projectA || !projectB) throw new Error("canonical_projects_missing");

      const unauth = await hosted(null, { query: { resource: "overview" } });
      expect(unauth.status).toBeGreaterThanOrEqual(401);

      const unauthWrite = await hosted(null, {
        method: "POST",
        body: { intent: "create_plan", title: "denied" },
      });
      expect(unauthWrite.status).toBeGreaterThanOrEqual(401);

      const landing = await hosted(owner, { query: { resource: "overview" } });
      expect(landing.status).toBe(200);
      expect(landing.json.data).toBeTruthy();

      const planList = await hosted(owner, { query: { resource: "plans" } });
      expect(planList.status).toBe(200);

      const created = dataOf(
        await hosted(owner, {
          method: "POST",
          body: {
            intent: "create_plan",
            projectId: projectA.id,
            title: `II-2 live ${Date.now()}`,
            targets: [
              {
                id: randomUUID(),
                kind: "project",
                canonicalId: projectA.id,
                snapshot: { capturedAt: new Date().toISOString(), label: "PI cert project" },
              },
            ],
            checklistItemTypes: ["visual", "numeric"],
          },
        }),
      );
      const plan = created.plan as Record<string, unknown>;
      expect(plan.id).toBeTruthy();

      const planDetail = await hosted(owner, {
        query: { resource: "plan", id: String(plan.id), projectId: String(projectA.id) },
      });
      expect(planDetail.status).toBe(200);

      const viewerWrite = await hosted(viewer, {
        method: "POST",
        body: { intent: "update_plan", planId: plan.id, title: "viewer hijack" },
      });
      expect(viewerWrite.status).toBeGreaterThanOrEqual(403);

      const appDenied = await hosted(unassignedApp, {
        method: "POST",
        body: { intent: "start_session", planId: plan.id },
      });
      expect(appDenied.status).toBeGreaterThanOrEqual(403);

      const foreignDenied = await hosted(foreign, {
        method: "POST",
        body: { intent: "start_session", planId: plan.id },
      });
      expect(foreignDenied.status).toBeGreaterThanOrEqual(403);

      const crossProject = await hosted(owner, {
        method: "POST",
        body: {
          intent: "create_plan",
          projectId: projectA.id,
          title: "cross project",
          targets: [
            {
              id: randomUUID(),
              kind: "project",
              canonicalId: projectB.id,
              snapshot: { capturedAt: new Date().toISOString(), label: "B" },
            },
          ],
        },
      });
      expect(crossProject.status).toBeGreaterThanOrEqual(400);

      const sessionStart = await hosted(owner, {
        method: "POST",
        body: { intent: "start_session", planId: plan.id, projectId: projectA.id },
      });
      const session = dataOf(sessionStart);
      expect(session.status).toBe("started");
      const sessionId = String(session.id);

      const observation = dataOf(
        await hosted(owner, {
          method: "POST",
          body: {
            intent: "record_observation",
            sessionId,
            checklistItemType: "visual",
            body: "coating intact",
          },
        }),
      );
      expect(observation.id).toBeTruthy();

      const measurement = dataOf(
        await hosted(owner, {
          method: "POST",
          body: {
            intent: "record_measurement",
            sessionId,
            observationId: observation.id,
            measurementType: "gap_mm",
            observedValue: 4.2,
            unit: "mm",
          },
        }),
      );
      expect(measurement.observed_value).toBe(4.2);
      expect(measurement.unit).toBe("mm");
      expect(measurement.expected_value).toBeNull();
      expect(measurement.evaluation_status).not.toBe("pass");

      const evidence = dataOf(
        await hosted(owner, {
          method: "POST",
          body: {
            intent: "register_evidence",
            sessionId,
            observationId: observation.id,
            kind: "photo",
            fileId: "file_platform_ii2_live",
          },
        }),
      );
      expect(evidence.file_id).toBe("file_platform_ii2_live");

      const paused = dataOf(
        await hosted(owner, {
          method: "POST",
          body: { intent: "transition_session", sessionId, to: "paused" },
        }),
      );
      expect(paused.status).toBe("paused");

      const resumed = dataOf(
        await hosted(owner, {
          method: "POST",
          body: { intent: "resume_session", sessionId },
        }),
      );
      expect(resumed.status).toBe("started");

      const execution = await hosted(owner, { query: { resource: "execution", id: sessionId } });
      expect(execution.status).toBe(200);
      const workspace = execution.json.data as {
        session: Record<string, unknown>;
        observations: unknown[];
        measurements: unknown[];
        evidence: unknown[];
      };
      expect(workspace.session.status).toBe("started");
      expect(workspace.observations).toHaveLength(1);
      expect(workspace.measurements).toHaveLength(1);
      expect(workspace.evidence).toHaveLength(1);

      const completed = dataOf(
        await hosted(owner, {
          method: "POST",
          body: { intent: "transition_session", sessionId, to: "completed" },
        }),
      );
      expect(completed.status).toBe("completed");

      const antiEnum = await hosted(engineerB, { query: { resource: "plan", id: String(plan.id) } });
      expect(antiEnum.status).toBe(404);
      const missing = await hosted(owner, { query: { resource: "plan", id: randomUUID() } });
      expect(missing.status).toBe(404);

      const { data: audit } = await userDb
        .from("audit_events")
        .select("id, user_id, action, resource_id")
        .eq("resource_id", String(observation.id))
        .limit(5);
      expect((audit ?? []).length).toBeGreaterThan(0);
      expect(audit?.[0]?.user_id).toBe(owner.userId);

      expect(landing.ms).toBeGreaterThan(0);
      expect(planList.ms).toBeGreaterThan(0);
      expect(planDetail.ms).toBeGreaterThan(0);
      expect(sessionStart.ms).toBeGreaterThan(0);
    }, 180_000);
  },
);
