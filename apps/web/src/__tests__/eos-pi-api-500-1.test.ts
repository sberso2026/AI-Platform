import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parseApiJsonResponse } from "../lib/api/parse-json-response";
import {
  fetchPiJson,
  isPiJsonParseLeak,
  PI_UNAVAILABLE,
} from "../lib/project-intelligence/pi-api";
import { piProjectScopeResponse } from "../lib/project-intelligence/pi-route";
import {
  forbiddenResponse,
  handleCommerceDomainError,
  unauthenticatedResponse,
} from "../lib/lifecycle-api";

const WEB_SRC = resolve(__dirname, "..");
const PI_PKG_SRC = resolve(__dirname, "../../../../packages/project-intelligence/src");

const GENERAL_PI_API_PATHS = [
  "lib/project-intelligence/access.ts",
  "lib/project-intelligence/pi-route.ts",
  "lib/project-intelligence/command-centre-service.ts",
  "lib/project-intelligence/schedule-intelligence-service.ts",
  "lib/project-intelligence/cost-progress-intelligence-service.ts",
  "lib/project-intelligence/risk-change-intelligence-service.ts",
  "lib/project-intelligence/query-decision-intelligence-service.ts",
  "lib/project-intelligence/forecast-intelligence-service.ts",
  "lib/project-intelligence/ai-project-analyst-service.ts",
  "lib/project-intelligence/project-reporting-service.ts",
  "app/api/engineering/project-intelligence/health/route.ts",
  "app/api/engineering/project-intelligence/projects/[projectId]/command-centre/route.ts",
  "app/api/engineering/project-intelligence/projects/[projectId]/schedule/route.ts",
  "app/api/engineering/project-intelligence/projects/[projectId]/cost-progress/route.ts",
  "app/api/engineering/project-intelligence/projects/[projectId]/risk-change/route.ts",
  "app/api/engineering/project-intelligence/projects/[projectId]/queries-decisions/route.ts",
  "app/api/engineering/project-intelligence/projects/[projectId]/reports/route.ts",
  "app/api/engineering/project-intelligence/projects/[projectId]/analyst/route.ts",
  "app/api/engineering/project-intelligence/projects/[projectId]/forecasting/route.ts",
];

const HEAVY_PARSER_TOKENS = [
  "pdf-parse",
  "pdfjs-dist",
  "@napi-rs/canvas",
  "native-parsers",
  "parser-routing",
  "parser-router",
  "document-worker",
  "@rtb/project-intelligence/parsers",
  "@rtb/project-intelligence/server",
];

const PI_CLIENT_SURFACES = [
  "components/engineering/project-command-centre.tsx",
  "components/engineering/project-schedule-intelligence.tsx",
  "components/engineering/project-cost-progress-intelligence.tsx",
  "components/engineering/project-risk-change-intelligence.tsx",
  "components/engineering/project-query-decision-intelligence.tsx",
  "components/engineering/project-reporting-intelligence.tsx",
  "components/engineering/project-forecast-intelligence.tsx",
  "components/engineering/project-engineering-intelligence.tsx",
  "components/engineering/project-ai-analyst.tsx",
  "components/engineering/pi-project-context.tsx",
];

function read(rel: string): string {
  return readFileSync(resolve(WEB_SRC, rel), "utf8");
}

function mockResponse(
  body: string,
  init: { status?: number; contentType?: string | null; requestId?: string } = {},
): Response {
  const headers = new Headers();
  if (init.contentType !== null) {
    headers.set("content-type", init.contentType ?? "application/json");
  }
  if (init.requestId) headers.set("x-request-id", init.requestId);
  return new Response(body, { status: init.status ?? 200, headers });
}

describe("EOS-PI-API-500-1 JSON contract", () => {
  it("parses successful authenticated Project Intelligence JSON", async () => {
    const parsed = await parseApiJsonResponse(
      mockResponse(JSON.stringify({ ok: true, data: { projectId: "p1", attentionItems: [] } })),
    );
    expect(parsed.ok).toBe(true);
    expect((parsed.data as { projectId: string }).projectId).toBe("p1");
  });

  it("returns JSON 401 for unauthenticated PI APIs", async () => {
    const response = unauthenticatedResponse("pi-unauth-1");
    expect(response.status).toBe(401);
    expect(response.headers.get("content-type") ?? "").toContain("application/json");
    const body = (await response.json()) as { ok: false; error: { code: string; requestId: string } };
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe("unauthenticated");
    expect(body.error.requestId).toBe("pi-unauth-1");
  });

  it("returns JSON 403 for unauthorized PI APIs", async () => {
    const response = forbiddenResponse("pi-forbidden-1", "Commerce permission denied", "forbidden");
    expect(response.status).toBe(403);
    const body = (await response.json()) as { ok: false; error: { code: string; requestId: string } };
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe("forbidden");
    expect(JSON.stringify(body)).not.toMatch(/<!DOCTYPE|<html/i);
  });

  it("returns JSON 400 when project context is missing", async () => {
    const response = piProjectScopeResponse(
      {
        ctx: { workspaceId: "ws-1" },
        correlationId: "pi-missing-project",
      } as never,
      "",
    );
    expect(response).not.toBeNull();
    expect(response!.status).toBe(400);
    const body = (await response!.json()) as { ok: false; error: { code: string } };
    expect(body.error.code).toBe("project_required");
  });

  it("keeps a legitimate empty dataset distinct from failure", async () => {
    const parsed = await parseApiJsonResponse(
      mockResponse(JSON.stringify({ ok: true, data: { attentionItems: [], availability: "no_data" } })),
    );
    expect(parsed.ok).toBe(true);
    expect((parsed.data as { attentionItems: unknown[] }).attentionItems).toEqual([]);
    expect((parsed.data as { availability: string }).availability).toBe("no_data");
  });

  it("returns controlled PI_DATA_ERROR JSON on service failure", async () => {
    const response = handleCommerceDomainError(new Error("relation does not exist"), "pi-svc-1", {
      route: "/api/engineering/project-intelligence-schedule",
      layer: "service",
      dataset: "schedule",
      publicCode: "PI_DATA_ERROR",
      publicMessage: "Project Intelligence data could not be loaded.",
      tenantId: "t1",
      workspaceId: "w1",
      projectId: "p1",
    });
    expect(response.status).toBe(500);
    expect(response.headers.get("content-type") ?? "").toContain("application/json");
    const body = (await response.json()) as {
      ok: false;
      error: { code: string; message: string; requestId: string; dataset?: string };
    };
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe("PI_DATA_ERROR");
    expect(body.error.dataset).toBe("schedule");
    expect(body.error.requestId).toBe("pi-svc-1");
    expect(JSON.stringify(body)).not.toMatch(/relation does not exist|stack|SELECT|service_role/i);
  });
});

describe("EOS-PI-API-500-1 import boundary", () => {
  it("keeps parser-routing out of the server barrel", () => {
    const server = readFileSync(resolve(PI_PKG_SRC, "server.ts"), "utf8");
    expect(server).not.toContain('"./documents/parser-routing"');
    expect(server).not.toContain('"./documents/document-worker"');
    expect(server).not.toContain("pdf-parse");
    expect(readFileSync(resolve(PI_PKG_SRC, "parsers.ts"), "utf8")).toContain("native-parsers");
  });

  it("does not import heavyweight parsers from general PI API paths", () => {
    let hits = 0;
    for (const file of GENERAL_PI_API_PATHS) {
      const source = read(file);
      for (const token of HEAVY_PARSER_TOKENS) {
        if (source.includes(token)) hits += 1;
      }
    }
    expect(hits).toBe(0);
  });
});

describe("EOS-PI-API-500-1 auth and client guards", () => {
  it("does not redirect API routes to an HTML login page", () => {
    const middleware = read("middleware.ts");
    expect(middleware).toContain('pathname.startsWith("/api/")');
    expect(middleware).toContain("isApiRoute");
    expect(middleware).toContain("!isPublicRoute && !isApiRoute");
  });

  it("never shows a raw JSON parse / HTML leak for PI clients", async () => {
    const html = "<!DOCTYPE html><html><body>Internal Server Error</body></html>";
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async () =>
      mockResponse(html, { status: 500, contentType: "text/html; charset=utf-8", requestId: "pi-html-1" })) as typeof fetch;
    try {
      await expect(fetchPiJson("/api/engineering/project-intelligence/health", "overview")).rejects.toMatchObject({
        message: PI_UNAVAILABLE.overview,
        dataset: "overview",
        requestId: "pi-html-1",
      });
    } finally {
      globalThis.fetch = originalFetch;
    }
    expect(isPiJsonParseLeak(PI_UNAVAILABLE.schedule)).toBe(false);
    expect(isPiJsonParseLeak("Unexpected token '<', \"<!DOCTYPE \"...")).toBe(true);
  });

  it("keeps PI surfaces on the guarded fetch helper and bounded unavailable UX", () => {
    let rawJson = 0;
    for (const file of PI_CLIENT_SURFACES) {
      const source = read(file);
      if (source.includes("response.json()")) rawJson += 1;
      expect(source).not.toContain("Unexpected token");
      expect(source).not.toContain("<!DOCTYPE");
    }
    expect(rawJson).toBe(0);
    expect(read("components/engineering/pi-page-chrome.tsx")).toContain("pi-retry");
    expect(read("components/engineering/pi-page-chrome.tsx")).toContain("pi-show-details");
    expect(read("lib/project-intelligence/pi-api.ts")).toContain("parseApiJsonResponse");
  });

  it("does not coerce a failed PI load to a fake zero", async () => {
    const parsed = await parseApiJsonResponse(
      mockResponse("<!DOCTYPE html>", { status: 500, contentType: "text/html" }),
    );
    expect(parsed.ok).toBe(false);
    expect(parsed.data).toBeNull();
    expect(parsed.data === 0).toBe(false);
  });
});

describe("EOS-PI-API-500-1 project context and isolation", () => {
  it("keeps shell and page selectors on the same project context", () => {
    const context = read("components/engineering/pi-project-context.tsx");
    expect(context).toContain("PiPageProjectSelect");
    expect(context).toContain("setProjectId");
    expect(context).toContain("pi.selectedProjectId");
    expect(read("components/engineering/project-schedule-intelligence.tsx")).toContain("usePiProjectContext");
    expect(read("components/engineering/project-command-centre.tsx")).toContain("usePiProjectContext");
    expect(read("components/engineering/project-cost-progress-intelligence.tsx")).toContain(
      "usePiProjectContext",
    );
  });

  it("scopes hosted core loads by tenant, workspace, and project", () => {
    const hosted = read("lib/project-intelligence/hosted-core-source.ts");
    expect(hosted).toContain("scope.tenantId");
    expect(hosted).toContain("scope.workspaceId");
    expect(hosted).toContain("scope.projectId");
    expect(hosted).toContain("cross_tenant");
    expect(hosted).toContain("cross_workspace");
    expect(hosted).toContain("projects.get(this.commerce, scope.tenantId, scope.projectId");
  });

  it("records architecture invariants as regression gates", () => {
    const server = readFileSync(resolve(PI_PKG_SRC, "server.ts"), "utf8");
    expect(server).toContain("NO_HEAVY_PARSER_IMPORT_IN_GENERAL_PI_API_PATHS");
    const lifecycle = read("lib/lifecycle-api.ts");
    expect(lifecycle).toContain("ok: false");
    expect(read("lib/commerce/engineering-api.ts")).toContain("PI_DATA_ERROR");
    expect(read("middleware.ts")).toContain("isApiRoute");
    expect(read("lib/project-intelligence/use-pi-json.ts")).toContain('setData(null)');
  });
});
