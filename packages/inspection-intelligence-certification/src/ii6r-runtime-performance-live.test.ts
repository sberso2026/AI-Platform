/**
 * II-6R localhost vs region-close runtime profile.
 * Local Next.js :3011 versus Supabase Edge in ap-southeast-2 (same hosted project and cert owner).
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
  process.env.II_6_LIVE === "1" ||
  process.env.II_6P_LIVE === "1" ||
  process.env.II_6R_LIVE === "1";
const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const ANON_KEY = process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const BASE_URL = process.env.II_1C_LIVE_BASE_URL ?? process.env.RTB_TEST_BASE_URL ?? "";
const DEPLOYED_BASE_URL = process.env.II_6R_DEPLOYED_BASE_URL ?? "";
const HOSTED_REF = "wcydlhqiqdwgoaqrlget";
const RUN_ID = process.env.II_CERT_RUN_ID ?? "pi6browsercert";
const HOSTED_PATH = "/api/engineering/inspection-intelligence/hosted";
const EDGE_PATH = `${SUPABASE_URL.replace(/\/$/, "")}/functions/v1/ii6r-runtime-profile`;

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
    cookieHeader: cookies.map(({ name, value }) => `${name}=${value}`).join("; "),
    accessToken: data.session.access_token,
    userId: data.user.id,
  };
}

async function call(
  baseUrl: string,
  path: string,
  auth: SessionAuth | null,
  init: { method?: string; body?: unknown; query?: Record<string, string>; headers?: Record<string, string> },
): Promise<{ status: number; json: Record<string, unknown>; ms: number; bytes: number }> {
  const url = new URL(path, baseUrl);
  for (const [key, value] of Object.entries(init.query ?? {})) url.searchParams.set(key, value);
  const headers: Record<string, string> = { Accept: "application/json", ...(init.headers ?? {}) };
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
  return { status: response.status, json, ms, bytes: text.length };
}

function percentile(samples: number[], p: number): number {
  if (!samples.length) return Number.NaN;
  const sorted = [...samples].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1));
  return sorted[index];
}

function summarize(label: string, samples: number[], server?: unknown) {
  return { label, n: samples.length, p50: percentile(samples, 50), p95: percentile(samples, 95), samples, server };
}

describe.skipIf(!LIVE_ENABLED || !CERT_ENABLED || !SUPABASE_URL || !ANON_KEY || !BASE_URL)(
  "II-6R localhost vs region-close runtime",
  () => {
    it("profiles localhost Next.js and ap-southeast-2 PostgREST with the same cert identity", async () => {
      expect(SUPABASE_URL).toContain(`${HOSTED_REF}.supabase.co`);
      const owner = await signIn(certEmail("baseline-owner"));
      const userDb = createClient(SUPABASE_URL, ANON_KEY, {
        global: { headers: { Authorization: `Bearer ${owner.accessToken}` } },
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const { data: projects, error: projectError } = await userDb
        .from("engineering_projects")
        .select("id, project_code")
        .eq("project_code", `PI-${RUN_ID}`);
      if (projectError || !projects?.length) throw new Error("canonical_projects_unreadable");
      const projectA = projects[0];

      const pingSamples: number[] = [];
      for (let i = 0; i < 5; i += 1) {
        const started = Date.now();
        await fetch(`${SUPABASE_URL}/rest/v1/tenants?select=id&limit=1`, {
          headers: { apikey: ANON_KEY, Authorization: `Bearer ${owner.accessToken}` },
        });
        pingSamples.push(Date.now() - started);
      }

      const created = await call(BASE_URL, HOSTED_PATH, owner, {
        method: "POST",
        body: {
          intent: "create_plan",
          profile: true,
          projectId: projectA.id,
          title: `II-6R live ${Date.now()}`,
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
      });
      expect(created.status).toBe(201);
      const planId = String((created.json.data as { plan?: { id?: string } }).plan?.id);
      const session = await call(BASE_URL, HOSTED_PATH, owner, {
        method: "POST",
        body: { intent: "start_session", planId, projectId: projectA.id, profile: true },
      });
      expect(session.status).toBe(201);
      const sessionId = String((session.json.data as { id?: string }).id);

      const surfaces: Record<string, number[]> = {
        ping: pingSamples,
        runtimePing: [],
        capabilities: [],
        eosProjects: [],
        piCommandCentre: [],
        iiCommandCentre: [],
        write: [],
        history: [],
        targetHistory: [],
        reportRead: [],
        reportCompose: [],
      };
      let ccServer: unknown;
      let writeServer: unknown;
      let targetServer: unknown;
      let composeServer: unknown;

      const firstWrite = await call(BASE_URL, HOSTED_PATH, owner, {
        method: "POST",
        body: {
          intent: "record_observation",
          sessionId,
          checklistItemType: "visual",
          body: "ii6r flange",
          projectId: projectA.id,
          profile: true,
        },
      });
      expect(firstWrite.status).toBe(201);
      surfaces.write.push(firstWrite.ms);
      writeServer = firstWrite.json.profile;

      const composed = await call(BASE_URL, HOSTED_PATH, owner, {
        method: "POST",
        body: {
          intent: "compose_report",
          sessionId,
          reportKey: "inspection.session_summary",
          projectId: projectA.id,
          profile: true,
        },
      });
      expect(composed.status).toBe(201);
      surfaces.reportCompose.push(composed.ms);
      composeServer = composed.json.profile;
      const reportId = String((composed.json.data as { id?: string }).id);

      for (let i = 0; i < 5; i += 1) {
        const runtimePing = await call(BASE_URL, HOSTED_PATH, owner, {
          query: { resource: "runtime_ping", profile: "1", projectId: String(projectA.id) },
        });
        expect(runtimePing.status).toBe(200);
        surfaces.runtimePing.push(runtimePing.ms);

        const capabilities = await call(BASE_URL, HOSTED_PATH, owner, {
          query: { resource: "capabilities", profile: "1", projectId: String(projectA.id) },
        });
        expect(capabilities.status).toBe(200);
        surfaces.capabilities.push(capabilities.ms);

        const eos = await call(BASE_URL, "/api/engineering/projects", owner, { query: { profile: "1" } });
        expect(eos.status).toBe(200);
        surfaces.eosProjects.push(eos.ms);

        const pi = await call(
          BASE_URL,
          `/api/engineering/project-intelligence/projects/${projectA.id}/command-centre`,
          owner,
          { headers: { "x-pi-command-centre-profile": "1" } },
        );
        expect(pi.status).toBe(200);
        surfaces.piCommandCentre.push(pi.ms);

        const cc = await call(BASE_URL, HOSTED_PATH, owner, {
          query: { resource: "command_centre", projectId: String(projectA.id) },
        });
        expect(cc.status).toBe(200);
        surfaces.iiCommandCentre.push(cc.ms);
        ccServer = cc.json.profile;

        const history = await call(BASE_URL, HOSTED_PATH, owner, {
          query: { resource: "history", projectId: String(projectA.id) },
        });
        expect(history.status).toBe(200);
        surfaces.history.push(history.ms);

        const target = await call(BASE_URL, HOSTED_PATH, owner, {
          query: {
            resource: "target_history",
            kind: "project",
            canonicalId: String(projectA.id),
            projectId: String(projectA.id),
          },
        });
        expect(target.status).toBe(200);
        surfaces.targetHistory.push(target.ms);
        targetServer = target.json.profile;

        const report = await call(BASE_URL, HOSTED_PATH, owner, {
          query: { resource: "report", id: reportId, projectId: String(projectA.id) },
        });
        expect(report.status).toBe(200);
        surfaces.reportRead.push(report.ms);

        if (i > 0) {
          const write = await call(BASE_URL, HOSTED_PATH, owner, {
            method: "POST",
            body: {
              intent: "record_observation",
              sessionId,
              checklistItemType: "visual",
              body: `ii6r sample ${i}`,
              projectId: projectA.id,
              profile: true,
            },
          });
          expect(write.status).toBe(201);
          surfaces.write.push(write.ms);
          writeServer = write.json.profile;
        }
      }

      const edgeSamples: number[] = [];
      let edgeBody: unknown = null;
      for (let i = 0; i < 5; i += 1) {
        const started = Date.now();
        const response = await fetch(EDGE_PATH, {
          method: "POST",
          headers: { Authorization: `Bearer ${owner.accessToken}`, apikey: ANON_KEY },
        });
        const ms = Date.now() - started;
        const json = await response.json().catch(() => ({}));
        if (response.status !== 200) {
          throw new Error(`edge_profile_failed:${response.status}:${JSON.stringify(json)}`);
        }
        edgeSamples.push(ms);
        edgeBody = json;
      }

      let deployed: unknown = null;
      if (DEPLOYED_BASE_URL) {
        const sydney: Record<string, number[]> = {
          runtimePing: [],
          capabilities: [],
          eosProjects: [],
          piCommandCentre: [],
          iiCommandCentre: [],
          write: [],
          history: [],
          targetHistory: [],
          reportRead: [],
          reportCompose: [],
        };
        let sydneyCc: unknown;
        let sydneyWrite: unknown;
        let sydneyTarget: unknown;
        let sydneyCompose: unknown;
        const sydneyComposeCall = await call(DEPLOYED_BASE_URL, HOSTED_PATH, owner, {
          method: "POST",
          body: {
            intent: "compose_report",
            sessionId,
            reportKey: "inspection.session_summary",
            projectId: projectA.id,
            profile: true,
          },
        });
        expect(sydneyComposeCall.status).toBe(201);
        sydney.reportCompose.push(sydneyComposeCall.ms);
        sydneyCompose = sydneyComposeCall.json.profile;
        const sydneyReportId = String((sydneyComposeCall.json.data as { id?: string }).id);
        for (let i = 0; i < 5; i += 1) {
          const runtimePing = await call(DEPLOYED_BASE_URL, HOSTED_PATH, owner, {
            query: { resource: "runtime_ping", profile: "1", projectId: String(projectA.id) },
          });
          expect(runtimePing.status).toBe(200);
          sydney.runtimePing.push(runtimePing.ms);

          const capabilities = await call(DEPLOYED_BASE_URL, HOSTED_PATH, owner, {
            query: { resource: "capabilities", profile: "1", projectId: String(projectA.id) },
          });
          expect(capabilities.status).toBe(200);
          sydney.capabilities.push(capabilities.ms);

          const eos = await call(DEPLOYED_BASE_URL, "/api/engineering/projects", owner, { query: { profile: "1" } });
          expect(eos.status).toBe(200);
          sydney.eosProjects.push(eos.ms);

          const pi = await call(
            DEPLOYED_BASE_URL,
            `/api/engineering/project-intelligence/projects/${projectA.id}/command-centre`,
            owner,
            { headers: { "x-pi-command-centre-profile": "1" } },
          );
          expect(pi.status).toBe(200);
          sydney.piCommandCentre.push(pi.ms);

          const cc = await call(DEPLOYED_BASE_URL, HOSTED_PATH, owner, {
            query: { resource: "command_centre", projectId: String(projectA.id) },
          });
          expect(cc.status).toBe(200);
          sydney.iiCommandCentre.push(cc.ms);
          sydneyCc = cc.json.profile;

          const history = await call(DEPLOYED_BASE_URL, HOSTED_PATH, owner, {
            query: { resource: "history", projectId: String(projectA.id) },
          });
          expect(history.status).toBe(200);
          sydney.history.push(history.ms);

          const target = await call(DEPLOYED_BASE_URL, HOSTED_PATH, owner, {
            query: {
              resource: "target_history",
              kind: "project",
              canonicalId: String(projectA.id),
              projectId: String(projectA.id),
            },
          });
          expect(target.status).toBe(200);
          sydney.targetHistory.push(target.ms);
          sydneyTarget = target.json.profile;

          const report = await call(DEPLOYED_BASE_URL, HOSTED_PATH, owner, {
            query: { resource: "report", id: sydneyReportId, projectId: String(projectA.id) },
          });
          expect(report.status).toBe(200);
          sydney.reportRead.push(report.ms);

          const write = await call(DEPLOYED_BASE_URL, HOSTED_PATH, owner, {
            method: "POST",
            body: {
              intent: "record_observation",
              sessionId,
              checklistItemType: "visual",
              body: `ii6r sydney sample ${i}`,
              projectId: projectA.id,
              profile: true,
            },
          });
          expect(write.status).toBe(201);
          sydney.write.push(write.ms);
          sydneyWrite = write.json.profile;
        }
        deployed = {
          runtime: "vercel syd1 Next.js",
          deploymentId: "dpl_FJbVbzedDxz9Y7NUm5UkUdTcNTVs",
          runtimePing: summarize("sydney II runtime_ping", sydney.runtimePing),
          capabilities: summarize("sydney II capabilities", sydney.capabilities),
          eosProjects: summarize("sydney EOS projects", sydney.eosProjects),
          piCommandCentre: summarize("sydney PI command-centre", sydney.piCommandCentre),
          iiCommandCentre: summarize("sydney II command_centre", sydney.iiCommandCentre, sydneyCc),
          write: summarize("sydney II write", sydney.write, sydneyWrite),
          history: summarize("sydney II history", sydney.history),
          targetHistory: summarize("sydney II target_history", sydney.targetHistory, sydneyTarget),
          reportRead: summarize("sydney II report", sydney.reportRead),
          reportCompose: summarize("sydney II compose", sydney.reportCompose, sydneyCompose),
        };
      }

      const localhostPing = percentile(pingSamples, 50);
      const edgePing = Number((edgeBody as { pingWarm?: { ms?: number }; ping?: { ms?: number } })?.pingWarm?.ms
        ?? (edgeBody as { ping?: { ms?: number } })?.ping?.ms
        ?? Number.NaN);
      const networkContribution = Number.isFinite(edgePing) ? Math.max(0, localhostPing - edgePing) : null;

      console.info(
        "II_6R_PERFORMANCE_PROFILE",
        JSON.stringify({
          supabaseRegion: "ap-southeast-2",
          localhostRuntime: "localhost:3011 Next.js",
          regionCloseRuntime: "supabase-edge-functions ap-southeast-2",
          deployedNext: DEPLOYED_BASE_URL || null,
          localhost: {
            postgrestPing: summarize("localhost PostgREST ping", surfaces.ping),
            runtimePing: summarize("localhost II runtime_ping", surfaces.runtimePing),
            capabilities: summarize("localhost II capabilities", surfaces.capabilities),
            eosProjects: summarize("localhost EOS projects", surfaces.eosProjects),
            piCommandCentre: summarize("localhost PI command-centre", surfaces.piCommandCentre),
            iiCommandCentre: summarize("localhost II command_centre", surfaces.iiCommandCentre, ccServer),
            write: summarize("localhost II write", surfaces.write, writeServer),
            history: summarize("localhost II history", surfaces.history),
            targetHistory: summarize("localhost II target_history", surfaces.targetHistory, targetServer),
            reportRead: summarize("localhost II report", surfaces.reportRead),
            reportCompose: summarize("localhost II compose", surfaces.reportCompose, composeServer),
          },
          regionClose: {
            wall: summarize("client→edge function wall", edgeSamples),
            body: edgeBody,
          },
          deployed,
          networkContributionMs: networkContribution,
        }),
      );
    }, 600_000);
  },
);
