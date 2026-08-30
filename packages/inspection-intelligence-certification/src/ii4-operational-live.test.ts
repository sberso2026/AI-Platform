/**
 * II-4 live operational + security UAT against the hosted Engineering OS project.
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
const LIVE_ENABLED =
  process.env.II_1C_LIVE === "1" || process.env.II_2_LIVE === "1" || process.env.II_3_LIVE === "1" || process.env.II_4_LIVE === "1";
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

function percentile(samples: number[], p: number): number {
  if (!samples.length) return Number.NaN;
  const sorted = [...samples].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1));
  return sorted[index];
}

describe.skipIf(!LIVE_ENABLED || !CERT_ENABLED || !SUPABASE_URL || !ANON_KEY || !BASE_URL)(
  "II-4 live history and governed reporting",
  () => {
    it("projects hosted history, composes a deterministic report, and preserves isolation", async () => {
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

      const unauth = await hosted(null, { query: { resource: "history" } });
      expect(unauth.status).toBeGreaterThanOrEqual(401);

      const created = dataOf(
        await hosted(owner, {
          method: "POST",
          body: {
            intent: "create_plan",
            projectId: projectA.id,
            title: `II-4 live ${Date.now()}`,
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
          body: { intent: "record_observation", sessionId, checklistItemType: "visual", body: "history flange" },
        }),
      );
      expect(observation.id).toBeTruthy();

      const historySamples: number[] = [];
      let history = await hosted(owner, {
        query: { resource: "history", projectId: String(projectA.id), targetKind: "project", targetCanonicalId: String(projectA.id) },
      });
      historySamples.push(history.ms);
      expect(history.status).toBe(200);
      const historyData = history.json.data as { rows: Array<{ sessionId: string }> };
      expect(historyData.rows.some((row) => row.sessionId === sessionId)).toBe(true);

      const targetSamples: number[] = [];
      const targetHistory = await hosted(owner, {
        query: {
          resource: "target_history",
          kind: "project",
          canonicalId: String(projectA.id),
          projectId: String(projectA.id),
        },
      });
      targetSamples.push(targetHistory.ms);
      expect(targetHistory.status).toBe(200);
      const targetData = targetHistory.json.data as {
        timeline: Array<{ kind: string; sessionId: string }>;
        missingContinuity: boolean;
      };
      expect(targetData.missingContinuity).toBe(false);
      expect(targetData.timeline.some((event) => event.kind === "observation" && event.sessionId === sessionId)).toBe(true);

      const viewerWrite = await hosted(viewer, {
        method: "POST",
        body: { intent: "compose_report", sessionId, reportKey: "inspection.session_summary", projectId: projectA.id },
      });
      expect(viewerWrite.status).toBeGreaterThanOrEqual(403);

      const appDenied = await hosted(unassignedApp, {
        method: "POST",
        body: { intent: "compose_report", sessionId, reportKey: "inspection.session_summary" },
      });
      expect(appDenied.status).toBeGreaterThanOrEqual(403);

      const foreignDenied = await hosted(foreign, {
        method: "POST",
        body: { intent: "compose_report", sessionId, reportKey: "inspection.session_summary" },
      });
      expect(foreignDenied.status).toBeGreaterThanOrEqual(403);

      const composeSamples: number[] = [];
      const composedResult = await hosted(owner, {
        method: "POST",
        body: {
          intent: "compose_report",
          sessionId,
          reportKey: "inspection.session_summary",
          projectId: projectA.id,
        },
      });
      composeSamples.push(composedResult.ms);
      const composed = dataOf(composedResult);
      expect(composed.id).toBeTruthy();
      expect((composed.payload as { authority?: { state?: string }; aiNarrative?: boolean }).authority?.state).toBe("draft");
      expect((composed.payload as { aiNarrative?: boolean }).aiNarrative).toBe(false);
      expect(composed.pdfAvailable).toBe(false);

      const readSamples: number[] = [];
      const reloaded = await hosted(owner, {
        query: { resource: "report", id: String(composed.id), projectId: String(projectA.id) },
      });
      readSamples.push(reloaded.ms);
      expect(reloaded.status).toBe(200);

      const exported = await hosted(owner, {
        query: { resource: "report_export", id: String(composed.id), projectId: String(projectA.id) },
      });
      readSamples.push(exported.ms);
      expect(exported.status).toBe(200);
      const exportPayload = exported.json.data as { markdown: string; pdfAvailable: boolean };
      expect(exportPayload.markdown).toContain("Inspection Summary");
      expect(exportPayload.pdfAvailable).toBe(false);

      const skipPublish = await hosted(owner, {
        method: "POST",
        body: { intent: "transition_report", outputId: composed.id, to: "published", projectId: projectA.id },
      });
      expect(skipPublish.status).toBeGreaterThanOrEqual(400);

      const reviewed = dataOf(
        await hosted(owner, {
          method: "POST",
          body: { intent: "transition_report", outputId: composed.id, to: "reviewed", projectId: projectA.id },
        }),
      );
      expect((reviewed.payload as { authority?: { state?: string } }).authority?.state).toBe("reviewed");

      const antiEnum = await hosted(engineerB, { query: { resource: "report", id: String(composed.id) } });
      expect(antiEnum.status).toBe(404);
      const missing = await hosted(owner, { query: { resource: "report", id: `rpt_missing_${randomUUID()}` } });
      expect(missing.status).toBe(404);

      for (let i = 0; i < 4; i += 1) {
        historySamples.push((await hosted(owner, { query: { resource: "history", projectId: String(projectA.id) } })).ms);
        targetSamples.push(
          (
            await hosted(owner, {
              query: { resource: "target_history", kind: "project", canonicalId: String(projectA.id), projectId: String(projectA.id) },
            })
          ).ms,
        );
        readSamples.push(
          (await hosted(owner, { query: { resource: "report", id: String(composed.id), projectId: String(projectA.id) } })).ms,
        );
      }
      console.info("II_4_HISTORY_PERFORMANCE", {
        history: { n: historySamples.length, p50: percentile(historySamples, 50), p95: percentile(historySamples, 95), samples: historySamples },
        targetHistory: { n: targetSamples.length, p50: percentile(targetSamples, 50), p95: percentile(targetSamples, 95), samples: targetSamples },
        compose: { n: composeSamples.length, p50: percentile(composeSamples, 50), p95: percentile(composeSamples, 95), samples: composeSamples },
        reportReadExport: { n: readSamples.length, p50: percentile(readSamples, 50), p95: percentile(readSamples, 95), samples: readSamples },
      });
    }, 180_000);
  },
);
