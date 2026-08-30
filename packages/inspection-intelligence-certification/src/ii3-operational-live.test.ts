/**
 * II-3 live operational + security UAT against the hosted Engineering OS project.
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
const LIVE_ENABLED = process.env.II_1C_LIVE === "1" || process.env.II_2_LIVE === "1" || process.env.II_3_LIVE === "1";
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
  "II-3 live defect, condition, and evidence",
  () => {
    it("runs the inspection intelligence flow with isolation and provenance", async () => {
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
      if (!projectA) throw new Error("canonical_projects_missing");

      const unauth = await hosted(null, { query: { resource: "defects" } });
      expect(unauth.status).toBeGreaterThanOrEqual(401);

      const created = dataOf(
        await hosted(owner, {
          method: "POST",
          body: {
            intent: "create_plan",
            projectId: projectA.id,
            title: `II-3 live ${Date.now()}`,
            targets: [
              {
                id: randomUUID(),
                kind: "project",
                canonicalId: projectA.id,
                snapshot: { capturedAt: new Date().toISOString(), label: "PI cert project" },
              },
            ],
            checklistItemTypes: ["visual"],
          },
        }),
      );
      const plan = created.plan as Record<string, unknown>;
      const session = dataOf(
        await hosted(owner, {
          method: "POST",
          body: { intent: "start_session", planId: plan.id, projectId: projectA.id },
        }),
      );
      const sessionId = String(session.id);

      const observation = dataOf(
        await hosted(owner, {
          method: "POST",
          body: { intent: "record_observation", sessionId, checklistItemType: "visual", body: "flange face" },
        }),
      );
      const evidence = dataOf(
        await hosted(owner, {
          method: "POST",
          body: {
            intent: "register_evidence",
            sessionId,
            observationId: observation.id,
            kind: "photo",
            fileId: "file_platform_ii3_live",
          },
        }),
      );
      expect(evidence.file_id).toBe("file_platform_ii3_live");

      const viewerWrite = await hosted(viewer, {
        method: "POST",
        body: {
          intent: "create_defect",
          sessionId,
          title: "viewer hijack",
          description: "denied",
          taxonomy: { severity: "low", urgency: "routine", monitoringRequired: false, defectCategory: "x" },
        },
      });
      expect(viewerWrite.status).toBeGreaterThanOrEqual(403);

      const appDenied = await hosted(unassignedApp, {
        method: "POST",
        body: {
          intent: "create_defect",
          sessionId,
          title: "app denied",
          description: "denied",
          taxonomy: { severity: "low", urgency: "routine", monitoringRequired: false, defectCategory: "x" },
        },
      });
      expect(appDenied.status).toBeGreaterThanOrEqual(403);

      const foreignDenied = await hosted(foreign, {
        method: "POST",
        body: {
          intent: "create_defect",
          sessionId,
          title: "foreign",
          description: "denied",
          taxonomy: { severity: "low", urgency: "routine", monitoringRequired: false, defectCategory: "x" },
        },
      });
      expect(foreignDenied.status).toBeGreaterThanOrEqual(403);

      const defect = dataOf(
        await hosted(owner, {
          method: "POST",
          body: {
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
          },
        }),
      );
      expect(defect.id).toBeTruthy();
      expect(defect.status).toBe("identified");

      const recommendation = dataOf(
        await hosted(owner, {
          method: "POST",
          body: {
            intent: "link_recommendation",
            sessionId,
            defectId: defect.id,
            action: "repair",
            rationale: "restore coating",
          },
        }),
      );
      expect(recommendation.action).toBe("repair");

      const ca = dataOf(
        await hosted(owner, {
          method: "POST",
          body: {
            intent: "create_corrective_action",
            sessionId,
            defectId: defect.id,
            recommendationId: recommendation.id,
            ownerPersonId: "self",
            dueAt: new Date(Date.now() + 86400000).toISOString(),
            description: "recoat flange",
          },
        }),
      );
      expect(ca.status).toBe("open");
      expect(ca.coreActionId).toBeUndefined();

      const progressed = dataOf(
        await hosted(owner, {
          method: "POST",
          body: { intent: "progress_corrective_action", actionId: ca.id, to: "in_progress" },
        }),
      );
      expect(progressed.status).toBe("in_progress");

      const assessment = dataOf(
        await hosted(owner, {
          method: "POST",
          body: {
            intent: "record_assessment",
            sessionId,
            defectId: defect.id,
            title: "Human assessment",
            body: "repair required",
          },
        }),
      );
      expect(assessment.aiGenerated).toBe(false);

      const abstain = await hosted(owner, {
        method: "POST",
        body: {
          intent: "persist_condition_rating",
          sessionId,
          componentScope: "flange",
          inspectionScope: "visual",
          observationIds: [observation.id],
          schemeId: "generic_numeric_0_100",
          numericScore: 90,
          confidence: 0.9,
          uncertainty: 0.1,
          evidenceSufficiency: "abstain",
          packId: "generic",
        },
      });
      expect(abstain.status).toBeGreaterThanOrEqual(400);

      const condition = dataOf(
        await hosted(owner, {
          method: "POST",
          body: {
            intent: "persist_condition_rating",
            sessionId,
            componentScope: "flange",
            inspectionScope: "visual",
            observationIds: [observation.id],
            schemeId: "generic_numeric_0_100",
            numericScore: 42,
            confidence: 0.7,
            uncertainty: 0.2,
            evidenceSufficiency: "sufficient",
            packId: "generic",
          },
        }),
      );
      expect(condition.ratingId).toBeTruthy();
      expect(condition.assessorUserId).toBe(owner.userId);

      const verification = dataOf(
        await hosted(owner, {
          method: "POST",
          body: { intent: "request_verification", sessionId, kind: "defect", subjectId: defect.id },
        }),
      );
      const completed = dataOf(
        await hosted(owner, {
          method: "POST",
          body: { intent: "complete_verification", verificationId: verification.id, status: "passed", notes: "human" },
        }),
      );
      expect(completed.status).toBe("passed");

      const classified = dataOf(
        await hosted(owner, {
          method: "POST",
          body: { intent: "transition_defect", defectId: defect.id, to: "classified" },
        }),
      );
      expect(classified.status).toBe("classified");

      const defectList = await hosted(owner, { query: { resource: "defects", projectId: String(projectA.id) } });
      expect(defectList.status).toBe(200);
      const defects = defectList.json.data as Array<{ id: string }>;
      expect(defects.some((row) => row.id === defect.id)).toBe(true);

      const defectDetail = await hosted(owner, {
        query: { resource: "defect", id: String(defect.id), projectId: String(projectA.id) },
      });
      expect(defectDetail.status).toBe(200);
      const workspace = defectDetail.json.data as {
        defect: Record<string, unknown>;
        ownership: Record<string, boolean>;
        recommendations: unknown[];
        correctiveActions: unknown[];
      };
      expect(workspace.ownership.inspectionDefect).toBe(true);
      expect(workspace.ownership.projectIntelligenceFinding).toBe(false);
      expect(workspace.recommendations).toHaveLength(1);

      const reload = await hosted(owner, { query: { resource: "execution", id: sessionId } });
      const execution = reload.json.data as {
        defects: Array<{ id: string }>;
        conditionRatings: unknown[];
        verifications: unknown[];
      };
      expect(execution.defects.some((row) => row.id === defect.id)).toBe(true);
      expect(execution.conditionRatings.length).toBeGreaterThan(0);

      const intelligence = await hosted(owner, { query: { resource: "intelligence", projectId: String(projectA.id) } });
      expect(intelligence.status).toBe(200);

      const evidenceList = await hosted(owner, { query: { resource: "evidence", projectId: String(projectA.id) } });
      expect(evidenceList.status).toBe(200);

      const antiEnum = await hosted(engineerB, { query: { resource: "defect", id: String(defect.id) } });
      expect(antiEnum.status).toBe(404);
      const missing = await hosted(owner, { query: { resource: "defect", id: randomUUID() } });
      expect(missing.status).toBe(404);
    }, 180_000);
  },
);
