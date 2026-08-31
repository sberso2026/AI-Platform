/**
 * II-6 live Command Centre + performance + security UAT against the hosted Engineering OS project.
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
  process.env.II_1C_LIVE === "1" ||
  process.env.II_2_LIVE === "1" ||
  process.env.II_3_LIVE === "1" ||
  process.env.II_4_LIVE === "1" ||
  process.env.II_5_LIVE === "1" ||
  process.env.II_6_LIVE === "1";
const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const ANON_KEY = process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const BASE_URL = process.env.II_1C_LIVE_BASE_URL ?? process.env.RTB_TEST_BASE_URL ?? "";
const HOSTED_REF = "wcydlhqiqdwgoaqrlget";
const RUN_ID = process.env.II_CERT_RUN_ID ?? "pi6browsercert";
const HOSTED_PATH = "/api/engineering/inspection-intelligence/hosted";
const ENGINEER_PATH = "/api/engineering/inspection-intelligence/engineer";

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

async function call(
  path: string,
  auth: SessionAuth | null,
  init: { method?: string; body?: unknown; query?: Record<string, string> },
): Promise<{ status: number; json: Record<string, unknown>; ms: number }> {
  const url = new URL(path, BASE_URL);
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
      json = { parse_error: true };
    }
  }
  return { status: response.status, json, ms };
}

function hosted(
  auth: SessionAuth | null,
  init: { method?: string; body?: unknown; query?: Record<string, string> },
) {
  return call(HOSTED_PATH, auth, init);
}

function dataOf(result: { status: number; json: Record<string, unknown> }): Record<string, unknown> {
  const payload = result.json.data;
  if (!payload || typeof payload !== "object") {
    const err = result.json.error as { code?: string; message?: string } | undefined;
    throw new Error(`missing_data:${result.status}:${err?.code ?? err?.message ?? "unknown"}`);
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
  "II-6 live Command Centre, performance, and security",
  () => {
    it("composes Command Centre from hosted records, drills down, and profiles representative requests", async () => {
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
      if (!projectA) throw new Error("canonical_projects_missing");

      const unauth = await hosted(null, { query: { resource: "command_centre" } });
      expect(unauth.status).toBeGreaterThanOrEqual(401);

      const viewerDenied = await hosted(viewer, { query: { resource: "command_centre" } });
      expect(viewerDenied.status).toBeGreaterThanOrEqual(403);

      const appDenied = await hosted(unassignedApp, { query: { resource: "command_centre" } });
      expect(appDenied.status).toBeGreaterThanOrEqual(403);

      const created = dataOf(
        await hosted(owner, {
          method: "POST",
          body: {
            intent: "create_plan",
            profile: true,
            projectId: projectA.id,
            title: `II-6 live ${Date.now()}`,
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
          body: { intent: "start_session", planId: plan.id, projectId: projectA.id, profile: true },
        }),
      );
      const sessionId = String(session.id);

      const writeSamples: number[] = [];
      const writeProfiles: Array<Record<string, unknown>> = [];
      const observation = await hosted(owner, {
        method: "POST",
        body: {
          intent: "record_observation",
          sessionId,
          checklistItemType: "visual",
          body: "command centre flange",
          projectId: projectA.id,
          profile: true,
        },
      });
      writeSamples.push(observation.ms);
      if (observation.json.profile) writeProfiles.push(observation.json.profile as Record<string, unknown>);
      expect(observation.status).toBe(201);

      const ccSamples: number[] = [];
      const centre = await hosted(owner, {
        query: { resource: "command_centre", projectId: String(projectA.id) },
      });
      ccSamples.push(centre.ms);
      expect(centre.status).toBe(200);
      const view = dataOf(centre);
      expect(view.aiMetricsIncluded).toBe(false);
      expect(view.healthScore).toBeNull();
      expect(view.riskProbability).toBeNull();
      expect(view.remainingLife).toBeNull();
      const cards = view.cards as Array<{
        id: string;
        value: string;
        href: string;
        provenance: { table: string; aiDerived: boolean; provenanceIds: string[] };
        items: Array<{ href: string }>;
      }>;
      expect(cards.some((card) => card.id === "inspections_in_progress" && Number(card.value) >= 1)).toBe(true);
      expect(cards.every((card) => card.provenance.aiDerived === false)).toBe(true);
      expect(cards.every((card) => card.href.startsWith("/engineering/apps/inspection-intelligence/"))).toBe(true);
      const inProgress = cards.find((card) => card.id === "inspections_in_progress");
      expect(inProgress?.items.some((item) => item.href.includes(sessionId))).toBe(true);

      const foreignCentre = await hosted(foreign, { query: { resource: "command_centre" } });
      if (foreignCentre.status === 200) {
        const foreignView = dataOf(foreignCentre);
        const foreignCards = foreignView.cards as Array<{ id: string; items: Array<{ href: string }> }>;
        expect(foreignCards.every((card) => !card.items.some((item) => item.href.includes(sessionId)))).toBe(true);
      } else {
        expect(foreignCentre.status).toBeGreaterThanOrEqual(403);
      }

      if (projectB) {
        const crossProject = await hosted(owner, {
          query: { resource: "command_centre", projectId: String(projectB.id) },
        });
        expect(crossProject.status).toBe(200);
        const crossView = dataOf(crossProject);
        const crossCards = crossView.cards as Array<{ items: Array<{ href: string }> }>;
        expect(crossCards.every((card) => !card.items.some((item) => item.href.includes(sessionId)))).toBe(true);
      }

      const antiEnum = await hosted(engineerB, { query: { resource: "session", id: sessionId } });
      expect([403, 404]).toContain(antiEnum.status);

      const engineer = await call(ENGINEER_PATH, owner, {
        method: "POST",
        body: {
          question: "Explain the Command Centre recorded inspection counts.",
          commandCentre: true,
          projectId: projectA.id,
        },
      });
      expect(engineer.status).toBe(200);
      const engineerData = dataOf(engineer);
      expect(engineerData.advisory).toBe(true);
      expect(engineerData.mutationEnabled).toBe(false);

      const historySamples: number[] = [];
      const targetSamples: number[] = [];
      const reportReadSamples: number[] = [];
      const composeSamples: number[] = [];

      historySamples.push((await hosted(owner, { query: { resource: "history", projectId: String(projectA.id) } })).ms);
      targetSamples.push(
        (
          await hosted(owner, {
            query: {
              resource: "target_history",
              kind: "project",
              canonicalId: String(projectA.id),
              projectId: String(projectA.id),
            },
          })
        ).ms,
      );

      const composed = await hosted(owner, {
        method: "POST",
        body: {
          intent: "compose_report",
          sessionId,
          reportKey: "inspection.session_summary",
          projectId: projectA.id,
          profile: true,
        },
      });
      composeSamples.push(composed.ms);
      const composedData = dataOf(composed);
      reportReadSamples.push(
        (await hosted(owner, { query: { resource: "report", id: String(composedData.id), projectId: String(projectA.id) } }))
          .ms,
      );

      for (let i = 0; i < 4; i += 1) {
        writeSamples.push(
          (
            await hosted(owner, {
              method: "POST",
              body: {
                intent: "record_observation",
                sessionId,
                checklistItemType: "visual",
                body: `ii6 sample ${i}`,
                projectId: projectA.id,
                profile: true,
              },
            })
          ).ms,
        );
        ccSamples.push((await hosted(owner, { query: { resource: "command_centre", projectId: String(projectA.id) } })).ms);
        historySamples.push((await hosted(owner, { query: { resource: "history", projectId: String(projectA.id) } })).ms);
        targetSamples.push(
          (
            await hosted(owner, {
              query: {
                resource: "target_history",
                kind: "project",
                canonicalId: String(projectA.id),
                projectId: String(projectA.id),
              },
            })
          ).ms,
        );
        reportReadSamples.push(
          (
            await hosted(owner, {
              query: { resource: "report", id: String(composedData.id), projectId: String(projectA.id) },
            })
          ).ms,
        );
      }

      console.info("II_6_PERFORMANCE_PROFILE", JSON.stringify({
        commandCentre: {
          n: ccSamples.length,
          p50: percentile(ccSamples, 50),
          p95: percentile(ccSamples, 95),
          samples: ccSamples,
          server: centre.json.profile,
        },
        operationalWrite: {
          n: writeSamples.length,
          p50: percentile(writeSamples, 50),
          p95: percentile(writeSamples, 95),
          samples: writeSamples,
          server: observation.json.profile,
          extraProfiles: writeProfiles,
        },
        history: { n: historySamples.length, p50: percentile(historySamples, 50), p95: percentile(historySamples, 95), samples: historySamples },
        targetHistory: { n: targetSamples.length, p50: percentile(targetSamples, 50), p95: percentile(targetSamples, 95), samples: targetSamples },
        reportRead: {
          n: reportReadSamples.length,
          p50: percentile(reportReadSamples, 50),
          p95: percentile(reportReadSamples, 95),
          samples: reportReadSamples,
        },
        reportCompose: {
          n: composeSamples.length,
          p50: percentile(composeSamples, 50),
          p95: percentile(composeSamples, 95),
          samples: composeSamples,
          server: composed.json.profile,
        },
      }));
    }, 360_000);
  },
);
