import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  MFA_CHALLENGE_ROUTE,
  MFA_SECURITY_ROUTE,
  postPasswordMfaDestination,
} from "@rtb/engineering-review/mfa-ux";
import {
  A14B_KILL_SWITCH_DEFAULT_ENV,
  rehearseKillSwitch,
} from "@rtb/engineering-os";
import { parseApiJsonResponse } from "../lib/api/parse-json-response";
import { mfaUpgradeConfirmed } from "../lib/supabase/persist-mfa-session";

const WEB_ROOT = resolve(__dirname, "../../");

function readApp(rel: string) {
  return readFileSync(resolve(WEB_ROOT, rel), "utf8");
}

function mockResponse(
  body: string,
  init: { status?: number; contentType?: string | null } = {},
): Response {
  const headers = new Headers();
  if (init.contentType !== null) {
    headers.set("content-type", init.contentType ?? "application/json");
  }
  return new Response(body, { status: init.status ?? 200, headers });
}

describe("EOS Wave A auth / MFA nullability", () => {
  it("fails closed when AAL is unread and does not treat enrolled factors as AAL2", () => {
    expect(
      postPasswordMfaDestination({
        requireMfa: true,
        currentAal: null,
        verifiedTotpCount: 2,
        nextPath: "/engineering",
      }),
    ).toBe(`${MFA_CHALLENGE_ROUTE}?next=${encodeURIComponent("/engineering")}`);
    expect(
      postPasswordMfaDestination({
        requireMfa: true,
        currentAal: "aal2",
        verifiedTotpCount: 0,
        nextPath: "/engineering",
      }),
    ).toBe("/engineering");
    expect(
      mfaUpgradeConfirmed({
        verifySucceeded: true,
        errorCode: null,
        sessionPresent: true,
        userPresent: true,
        currentLevel: "aal1",
        nextLevel: "aal2",
      }),
    ).toBe(false);
    expect(
      postPasswordMfaDestination({
        requireMfa: true,
        currentAal: null,
        verifiedTotpCount: 0,
        nextPath: "/engineering",
      }),
    ).toBe(`${MFA_SECURITY_ROUTE}?next=${encodeURIComponent("/engineering")}`);
  });

  it("guards nullable MFA payloads in login, challenge, and security pages", () => {
    const login = readApp("src/app/(auth)/login/page.tsx");
    const mfa = readApp("src/app/(auth)/login/mfa/page.tsx");
    const security = readApp("src/app/(platform)/settings/security/page.tsx");
    expect(login).toContain("aalData?.currentLevel");
    expect(login).toContain("factorData?.totp");
    expect(login).toContain("postPasswordMfaDestination");
    expect(mfa).toContain("aalData?.currentLevel === \"aal2\"");
    expect(mfa).toContain("factorData?.totp");
    expect(mfa).toContain("\"session\" in verifyData");
    expect(security).toContain("aalData?.currentLevel");
    expect(security).toContain("existing.data?.all");
    expect(security).toContain("aalData?.currentLevel === \"aal2\"");
    expect(security).not.toContain("existing.data?.totp ?? []).filter((factor) => factor.status === \"unverified\")");
  });
});

describe("EOS Wave A ParsedApiJson and document nullability", () => {
  it("does not treat ok as implying non-null data", async () => {
    const emptyOk = await parseApiJsonResponse<{ id: string }>(mockResponse(""));
    expect(emptyOk.ok).toBe(true);
    expect(emptyOk.data).toBeNull();
    expect(emptyOk.errorMessage).toBeNull();
    const failed = await parseApiJsonResponse<{ id: string }>(
      mockResponse(JSON.stringify({ error: "not_found" }), { status: 404 }),
    );
    expect(failed.ok).toBe(false);
    expect(failed.data).toBeNull();
    expect(failed.errorMessage).toBe("not_found");
    expect("error" in failed).toBe(false);
  });

  it("uses errorMessage and payload unwrapping in information callers", () => {
    const documentPage = readApp("src/app/(platform)/engineering/documents/[documentId]/page.tsx");
    const detail = readApp("src/app/(platform)/engineering/information/[id]/page.tsx");
    const settings = readApp("src/app/(platform)/engineering/settings/information/page.tsx");
    const workspace = readApp("src/components/engineering/information-workspace.tsx");
    expect(documentPage).toContain("if (!parsed.ok || !parsed.data)");
    expect(documentPage).not.toMatch(/parsed\.ok\)\s*setError/);
    expect(detail).toContain("parseApiJsonResponse<InfoRef>");
    expect(detail).toContain("json.errorMessage");
    expect(detail).not.toMatch(/\bjson\.error\b/);
    expect(settings).toContain("json.errorMessage");
    expect(settings).not.toMatch(/\bjson\.error\b/);
    expect(workspace).toContain("parseApiJsonResponse<InfoRef[]>");
    expect(workspace).toContain("parseApiJsonResponse<Resolution>");
    expect(workspace).toContain("json.errorMessage");
    expect(workspace).not.toMatch(/\bjson\.error\b/);
  });
});

describe("EOS Wave A analysis / thread UI contracts", () => {
  it("aligns stale callers with canonical Header, Button, CreateForm, EmptyOperationalState, and StatusChip", () => {
    const analysis = readApp("src/components/engineering/analysis-workspace.tsx");
    const thread = readApp("src/components/engineering/thread-workspace.tsx");
    expect(analysis).toContain('<Header title="Engineering Analysis"');
    expect(analysis).toContain('variant={filter === tab.id ? "default" : "secondary"}');
    expect(analysis).toContain('{ key: "discipline"');
    expect(analysis).toContain("description=\"Create a request or adjust the filter.\"");
    expect(analysis).toContain("<StatusChip value={statusOf(item)} />");
    expect(analysis).not.toContain('variant="primary"');
    expect(analysis).not.toContain("StatusChip status=");
    expect(thread).toContain('<Header title="Engineering Digital Thread"');
    expect(thread).toContain('variant={view === id ? "default" : "secondary"}');
    expect(thread).toContain("description=\"Select a canonical object and open its authorized trace.\"");
    expect(thread).not.toContain('variant="primary"');
    expect(thread).not.toMatch(/\bbody="/);
  });
});

describe("EOS Wave A engineering API routes", () => {
  it("validates thread kind through an allowlist instead of casting arbitrary strings", () => {
    const route = readApp("src/app/api/engineering/thread/route.ts");
    expect(route).toContain("parseEngineeringThreadKind");
    expect(route).toContain('"requirement"');
    expect(route).toContain('"decision"');
    expect(route).toContain('"analysis"');
    expect(route).toContain('"configuration"');
    expect(route).toContain('"change"');
    expect(route).toContain('"graph"');
    expect(route).not.toMatch(/kind[^\n]*as\s+"requirement"/);
    expect(route).not.toMatch(/as\s+EngineeringThreadKind/);
  });

  it("maps deliverables.list expected rows into Record arrays without Promise/object conversion", () => {
    const route = readApp("src/app/api/engineering/work/route.ts");
    expect(route).toContain("deliverableExpectationRecords");
    expect(route).toContain("listed.expected.map");
    expect(route).toContain("await ctx.engineering.deliverables.list(delCommerce, ctx.tenantId, projectId)");
    expect(route).not.toMatch(
      /deliverables\.list\(delCommerce, ctx\.tenantId, projectId\) as Promise<Record<string, unknown>\[\]>/,
    );
  });
});

describe("EOS Wave A retrievalMode, NODE_ENV, and middleware actor context", () => {
  it("narrows retrievalMode to the canonical union without changing hybrid/lexical fallback order", () => {
    const src = readApp("src/lib/engineering/document-body-retrieval.ts");
    expect(src).toContain("export function resolveDocumentBodyRetrievalMode");
    expect(src).toContain('if (input.hybrid) return "hybrid"');
    expect(src).toContain('if (input.embeddingsConfigured) return "lexical"');
    expect(src).toContain('return "lexical_fallback"');
    expect(src).toContain('retrievalMode: EngineeringRetrievalMode = "lexical"');
    expect(src).not.toMatch(/retrievalMode:\s*hybrid \? "hybrid"/);
  });

  it("gives rehearseKillSwitch a ProcessEnv default that includes NODE_ENV and keeps the kill switch off", () => {
    expect(A14B_KILL_SWITCH_DEFAULT_ENV.NODE_ENV).toBe(process.env.NODE_ENV);
    expect(A14B_KILL_SWITCH_DEFAULT_ENV.EOS_CONTROLLED_PILOT_ENABLED).toBe("0");
    expect(rehearseKillSwitch().enabled).toBe(false);
    expect(rehearseKillSwitch({ NODE_ENV: "test", EOS_CONTROLLED_PILOT_ENABLED: "0" }).enabled).toBe(false);
  });

  it("bounds middleware actor-context inference without changing authorization calls", () => {
    const middleware = readApp("src/middleware.ts");
    expect(middleware).toContain("boundActorContextClient(supabase)");
    expect(middleware).toContain("resolveRequestActorContext");
    expect(middleware).toContain("evaluateReviewIdentityPolicy");
    expect(middleware).not.toContain("@ts-ignore");
    expect(middleware).not.toContain("@ts-expect-error");
    expect(middleware).not.toMatch(/\bas any\b/);
    expect(middleware).not.toContain("suppressHydrationWarning");
  });
});
