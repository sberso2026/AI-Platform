/**
 * II-3 operational write profile. Measures the known ~7 s save+reload cycle
 * before any optimization. Does not change product behavior.
 */
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { describe, expect, it } from "vitest";

const CERT_ENABLED = Boolean(
  process.env.INSPECTION_INTELLIGENCE_CERTIFICATION === "1" ||
    process.env.PROJECT_INTELLIGENCE_CERTIFICATION === "1",
);
const LIVE_ENABLED = process.env.II_3_PROFILE === "1" || process.env.II_1C_LIVE === "1" || process.env.II_2_LIVE === "1";
const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const ANON_KEY = process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const BASE_URL = process.env.II_1C_LIVE_BASE_URL ?? process.env.RTB_TEST_BASE_URL ?? "";
const RUN_ID = process.env.II_CERT_RUN_ID ?? "pi6browsercert";
const HOSTED_PATH = "/api/engineering/inspection-intelligence/hosted";

function certEmail(key: string) {
  return `cert-pi-${key}-${RUN_ID}@rtb-cert.test`;
}

async function signIn(email: string) {
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
    password: process.env.CERT_USER_PASSWORD ?? "",
  });
  if (error || !data.session) throw new Error(`sign_in_failed:${error?.message}`);
  return { cookieHeader: cookies.map((cookie) => `${cookie.name}=${cookie.value}`).join("; ") };
}

async function hosted(
  cookieHeader: string,
  init: { method?: string; body?: unknown; query?: Record<string, string> },
) {
  const url = new URL(HOSTED_PATH, BASE_URL);
  for (const [key, value] of Object.entries(init.query ?? {})) url.searchParams.set(key, value);
  const started = Date.now();
  const response = await fetch(url, {
    method: init.method ?? (init.body ? "POST" : "GET"),
    headers: {
      Accept: "application/json",
      Cookie: cookieHeader,
      ...(init.body ? { "Content-Type": "application/json" } : {}),
    },
    body: init.body ? JSON.stringify(init.body) : undefined,
  });
  const json = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  return { status: response.status, json, ms: Date.now() - started };
}

describe.skipIf(!LIVE_ENABLED || !CERT_ENABLED || !SUPABASE_URL || !ANON_KEY || !BASE_URL)(
  "II-3 operational write profile",
  () => {
    it("breaks down GET execution vs POST observation vs reload", async () => {
      const auth = await signIn(certEmail("baseline-owner"));
      const sessions = await hosted(auth.cookieHeader, { query: { resource: "sessions" } });
      expect(sessions.status).toBe(200);
      const rows = (sessions.json.data as Array<{ id: string; status: string; plan_id?: string }>) ?? [];
      let sessionId = rows.find((row) => ["assigned", "started", "paused"].includes(row.status))?.id;
      if (!sessionId) {
        const plans = await hosted(auth.cookieHeader, { query: { resource: "plans" } });
        const plan = ((plans.json.data as Array<{ id: string }>) ?? [])[0];
        expect(plan?.id).toBeTruthy();
        const started = await hosted(auth.cookieHeader, {
          method: "POST",
          body: { intent: "start_session", planId: plan.id },
        });
        sessionId = String((started.json.data as { id?: string } | undefined)?.id ?? "");
      }
      expect(sessionId).toBeTruthy();

      const warmup = await hosted(auth.cookieHeader, { query: { resource: "execution", id: sessionId } });
      const get1 = await hosted(auth.cookieHeader, { query: { resource: "execution", id: sessionId } });
      const post = await hosted(auth.cookieHeader, {
        method: "POST",
        body: {
          intent: "record_observation",
          sessionId,
          checklistItemType: "profile",
          body: `profile ${Date.now()}`,
        },
      });
      const get2 = await hosted(auth.cookieHeader, { query: { resource: "execution", id: sessionId } });
      const cycle = post.ms + get2.ms;
      const clientMergePathMs = post.ms;

      // eslint-disable-next-line no-console
      console.log(
        JSON.stringify({
          warmupGetMs: warmup.ms,
          getExecutionMs: get1.ms,
          postObservationMs: post.ms,
          reloadWorkspaceMs: get2.ms,
          savePlusReloadMs: cycle,
          clientMergePathMs,
          getStatus: get1.status,
          postStatus: post.status,
        }),
      );

      expect(get1.status).toBe(200);
      expect(post.status).toBe(201);
      expect(get2.status).toBe(200);
      expect(cycle).toBeGreaterThan(0);
    }, 120_000);
  },
);
