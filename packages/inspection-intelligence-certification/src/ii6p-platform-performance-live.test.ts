/**
 * II-6P live shared-platform baseline and security-pipeline profile.
 * Same hosted project, cert owner session, and localhost Next runtime as II-6.
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
  process.env.II_6P_LIVE === "1";
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

async function call(
  path: string,
  auth: SessionAuth | null,
  init: { method?: string; body?: unknown; query?: Record<string, string>; headers?: Record<string, string> },
): Promise<{ status: number; json: Record<string, unknown>; ms: number; bytes: number }> {
  const url = new URL(path, BASE_URL);
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
  return {
    label,
    n: samples.length,
    p50: percentile(samples, 50),
    p95: percentile(samples, 95),
    samples,
    server,
  };
}

describe.skipIf(!LIVE_ENABLED || !CERT_ENABLED || !SUPABASE_URL || !ANON_KEY || !BASE_URL)(
  "II-6P live platform baseline and security pipeline",
  () => {
    it("profiles equivalent authenticated Platform, Engineering OS, PI, and II reads", async () => {
      expect(SUPABASE_URL).toContain(`${HOSTED_REF}.supabase.co`);
      const owner = await signIn(certEmail("baseline-owner"));
      const userDb = createClient(SUPABASE_URL, ANON_KEY, {
        global: { headers: { Authorization: `Bearer ${owner.accessToken}` } },
        auth: { persistSession: false, autoRefreshToken: false },
      });

      const pingSamples: number[] = [];
      let pingBytes = 0;
      let restRegion: string | null = null;
      for (let i = 0; i < 5; i += 1) {
        const pingStarted = Date.now();
        const ping = await fetch(`${SUPABASE_URL}/rest/v1/tenants?select=id&limit=1`, {
          headers: {
            apikey: ANON_KEY,
            Authorization: `Bearer ${owner.accessToken}`,
            Prefer: "count=exact",
          },
        });
        pingSamples.push(Date.now() - pingStarted);
        const body = await ping.text();
        pingBytes = body.length;
        restRegion = ping.headers.get("sb-gateway-version") ?? ping.headers.get("x-supabase-api-version") ?? restRegion;
      }

      const membershipExplain = { error: { message: "explain_not_exposed_over_postgrest" } };
      const { count: membershipCount, error: membershipError } = await userDb
        .from("tenant_memberships")
        .select("id", { count: "exact", head: true })
        .eq("user_id", owner.userId);
      const { data: projects, error: projectError } = await userDb
        .from("engineering_projects")
        .select("id, project_code")
        .in("project_code", [`PI-${RUN_ID}`, `PI-WORKSPACE-B-${RUN_ID}`]);
      if (projectError || !projects?.length) throw new Error("canonical_projects_unreadable");
      const projectA = projects.find((row) => row.project_code === `PI-${RUN_ID}`);
      if (!projectA) throw new Error("canonical_projects_missing");

      const platformSamples: number[] = [];
      const eosSamples: number[] = [];
      const piSamples: number[] = [];
      const iiMinSamples: number[] = [];
      const iiCcSamples: number[] = [];
      const iiWriteSamples: number[] = [];
      const iiHistorySamples: number[] = [];
      const iiTargetSamples: number[] = [];
      const iiReportSamples: number[] = [];
      let platformServer: unknown;
      let eosServer: unknown;
      let piServer: unknown;
      let iiMinServer: unknown;
      let iiCcServer: unknown;
      let iiWriteServer: unknown;

      const created = await call(HOSTED_PATH, owner, {
        method: "POST",
        body: {
          intent: "create_plan",
          profile: true,
          projectId: projectA.id,
          title: `II-6P live ${Date.now()}`,
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
      const createdData = created.json.data as { plan?: { id?: string } };
      const session = await call(HOSTED_PATH, owner, {
        method: "POST",
        body: { intent: "start_session", planId: createdData.plan?.id, projectId: projectA.id, profile: true },
      });
      expect(session.status).toBe(201);
      const sessionId = String((session.json.data as { id?: string }).id);

      const observation = await call(HOSTED_PATH, owner, {
        method: "POST",
        body: {
          intent: "record_observation",
          sessionId,
          checklistItemType: "visual",
          body: "ii6p flange",
          projectId: projectA.id,
          profile: true,
        },
      });
      expect(observation.status).toBe(201);
      iiWriteSamples.push(observation.ms);
      iiWriteServer = observation.json.profile;

      const composed = await call(HOSTED_PATH, owner, {
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
      const reportId = String((composed.json.data as { id?: string }).id);

      for (let i = 0; i < 5; i += 1) {
        const platform = await call("/api/platform/commerce/entitlements/me", owner, { query: { profile: "1" } });
        expect(platform.status).toBe(200);
        platformSamples.push(platform.ms);
        platformServer = platform.json.profile;

        const eos = await call("/api/engineering/projects", owner, { query: { profile: "1" } });
        expect(eos.status).toBe(200);
        eosSamples.push(eos.ms);
        eosServer = eos.json.profile;

        const pi = await call(
          `/api/engineering/project-intelligence/projects/${projectA.id}/command-centre`,
          owner,
          { headers: { "x-pi-command-centre-profile": "1" } },
        );
        expect(pi.status).toBe(200);
        piSamples.push(pi.ms);
        piServer = pi.json.profile;

        const iiMin = await call(HOSTED_PATH, owner, {
          query: { resource: "capabilities", profile: "1", projectId: String(projectA.id) },
        });
        expect(iiMin.status).toBe(200);
        iiMinSamples.push(iiMin.ms);
        iiMinServer = iiMin.json.profile;

        const cc = await call(HOSTED_PATH, owner, {
          query: { resource: "command_centre", projectId: String(projectA.id) },
        });
        expect(cc.status).toBe(200);
        iiCcSamples.push(cc.ms);
        iiCcServer = cc.json.profile;

        const history = await call(HOSTED_PATH, owner, {
          query: { resource: "history", projectId: String(projectA.id) },
        });
        expect(history.status).toBe(200);
        iiHistorySamples.push(history.ms);

        const target = await call(HOSTED_PATH, owner, {
          query: {
            resource: "target_history",
            kind: "project",
            canonicalId: String(projectA.id),
            projectId: String(projectA.id),
          },
        });
        expect(target.status).toBe(200);
        iiTargetSamples.push(target.ms);

        const report = await call(HOSTED_PATH, owner, {
          query: { resource: "report", id: reportId, projectId: String(projectA.id) },
        });
        expect(report.status).toBe(200);
        iiReportSamples.push(report.ms);

        if (i > 0) {
          const write = await call(HOSTED_PATH, owner, {
            method: "POST",
            body: {
              intent: "record_observation",
              sessionId,
              checklistItemType: "visual",
              body: `ii6p sample ${i}`,
              projectId: projectA.id,
              profile: true,
            },
          });
          expect(write.status).toBe(201);
          iiWriteSamples.push(write.ms);
          iiWriteServer = write.json.profile;
        }
      }

      const platformP50 = percentile(platformSamples, 50);
      const iiMinP50 = percentile(iiMinSamples, 50);
      const iiCcP50 = percentile(iiCcSamples, 50);
      const classification =
        iiMinP50 <= platformP50 * 1.35 && iiCcP50 > iiMinP50 * 1.35
          ? "MIXED"
          : iiMinP50 <= platformP50 * 1.35
            ? "SHARED_PLATFORM"
            : iiMinP50 > platformP50 * 1.8
              ? "II_SPECIFIC"
              : "MIXED";

      console.info(
        "II_6P_PERFORMANCE_PROFILE",
        JSON.stringify({
          runtime: { application: "localhost:3011 Next.js", supabaseHost: new URL(SUPABASE_URL).host, restRegion, membershipCount, membershipError: membershipError?.message ?? null, membershipExplainError: membershipExplain.error?.message ?? null, pingBytes },
          postgrestPing: summarize("postgrest_tenants_limit_1", pingSamples),
          platformEntitlementsMe: summarize("GET /api/platform/commerce/entitlements/me", platformSamples, platformServer),
          engineeringProjects: summarize("GET /api/engineering/projects", eosSamples, eosServer),
          projectIntelligenceCommandCentre: summarize("GET PI command-centre", piSamples, piServer),
          iiCapabilities: summarize("GET II capabilities", iiMinSamples, iiMinServer),
          iiCommandCentre: summarize("GET II command_centre", iiCcSamples, iiCcServer),
          iiOperationalWrite: summarize("POST II record_observation", iiWriteSamples, iiWriteServer),
          iiHistory: summarize("GET II history", iiHistorySamples),
          iiTargetHistory: summarize("GET II target_history", iiTargetSamples),
          iiReportRead: summarize("GET II report", iiReportSamples),
          classification,
        }),
      );

      expect(platformSamples.length).toBe(5);
      expect(["SHARED_PLATFORM", "II_SPECIFIC", "MIXED"]).toContain(classification);
    }, 360_000);
  },
);
