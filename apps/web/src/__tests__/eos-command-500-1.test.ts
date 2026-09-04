import { describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  asRecordArray,
  parseApiJsonResponse,
} from "../lib/api/parse-json-response.ts";
import { handleCommerceDomainError, unauthenticatedResponse } from "../lib/lifecycle-api.ts";
import {
  COMMAND_CENTER_USER_ERROR,
  kpiDisplayValue,
  loadCommandCenter,
  withProjectQuery,
} from "../lib/engineering/load-command-center.ts";

const WEB_SRC = resolve(__dirname, "..");

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

describe("EOS-COMMAND-500-1 JSON contract", () => {
  it("parses a successful Command Center JSON payload", async () => {
    const parsed = await parseApiJsonResponse(
      mockResponse(JSON.stringify({ ok: true, data: { activeProjects: [], openRisksCount: 0 } })),
    );
    expect(parsed.ok).toBe(true);
    expect((parsed.data as { openRisksCount: number }).openRisksCount).toBe(0);
  });

  it("parses a legitimate empty list", async () => {
    const parsed = await parseApiJsonResponse(mockResponse(JSON.stringify({ ok: true, data: [] })));
    expect(parsed.ok).toBe(true);
    expect(asRecordArray(parsed.data)).toEqual([]);
  });

  it("returns JSON for a controlled service failure", async () => {
    const response = handleCommerceDomainError(new Error("db down"), "req-cc-1", {
      route: "/api/engineering/dashboard",
      layer: "service",
      publicCode: "COMMAND_CENTER_DATA_ERROR",
      publicMessage: "Unable to load engineering KPI data.",
    });
    expect(response.status).toBe(500);
    expect(response.headers.get("content-type") ?? "").toContain("application/json");
    const body = (await response.json()) as {
      ok: false;
      error: { code: string; message: string; requestId: string };
    };
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe("COMMAND_CENTER_DATA_ERROR");
    expect(body.error.requestId).toBe("req-cc-1");
    expect(body.error.message).not.toMatch(/db down|stack|SELECT|service_role/i);
  });

  it("does not leak HTML framework errors into Command Center KPI values", async () => {
    const html = "<!DOCTYPE html><html><body>Internal Server Error</body></html>";
    const fetchImpl = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/dashboard")) {
        return mockResponse(html, { status: 500, contentType: "text/html; charset=utf-8" });
      }
      return mockResponse(JSON.stringify({ ok: true, data: [] }));
    }) as unknown as typeof fetch;

    const snapshot = await loadCommandCenter(fetchImpl, null);
    expect(snapshot.dashboard.status).toBe("failed");
    expect(snapshot.dashboard.data).toBeNull();
    expect(kpiDisplayValue(snapshot.dashboard, (snapshot.dashboard.data as { activeProjects?: unknown[] } | null)?.activeProjects?.length)).toBe(
      "Unavailable",
    );
    expect(kpiDisplayValue(snapshot.dashboard, 0)).toBe("Unavailable");
    expect(snapshot.dashboard.errorMessage).toBe(COMMAND_CENTER_USER_ERROR);
    expect(String(snapshot.dashboard.errorMessage)).not.toMatch(/Unexpected non-JSON|Internal Server Error|DOCTYPE/i);
    expect(snapshot.timeline.status).toBe("loaded");
    expect(snapshot.timeline.data).toEqual([]);
  });

  it("returns JSON for an unauthorized request", async () => {
    const response = unauthenticatedResponse("req-unauth");
    expect(response.status).toBe(401);
    const body = (await response.json()) as { ok: false; error: { code: string; requestId: string } };
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe("unauthenticated");
    expect(body.error.requestId).toBe("req-unauth");
  });
});

describe("EOS-COMMAND-500-1 project filter and isolation helpers", () => {
  it("appends projectId only when a project is selected", () => {
    expect(withProjectQuery("/api/engineering/dashboard", null)).toBe("/api/engineering/dashboard");
    expect(withProjectQuery("/api/engineering/dashboard", "11111111-1111-4111-8111-111111111111")).toBe(
      "/api/engineering/dashboard?projectId=11111111-1111-4111-8111-111111111111",
    );
  });

  it("does not treat a failed sibling dataset as an empty list", async () => {
    const fetchImpl = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/risks")) {
        return mockResponse(
          JSON.stringify({
            ok: false,
            error: { code: "COMMAND_CENTER_DATA_ERROR", message: "Unable to load engineering KPI data.", requestId: "risk-1" },
          }),
          { status: 500 },
        );
      }
      if (url.includes("/dashboard")) {
        return mockResponse(
          JSON.stringify({
            ok: true,
            data: { activeProjects: [{ id: "p1" }], openRisksCount: 2, openTechnicalQueriesCount: 1, openActionsCount: 3 },
          }),
        );
      }
      return mockResponse(JSON.stringify({ ok: true, data: [] }));
    }) as unknown as typeof fetch;

    const snapshot = await loadCommandCenter(fetchImpl, "11111111-1111-4111-8111-111111111111");
    expect(snapshot.dashboard.status).toBe("loaded");
    expect(kpiDisplayValue(snapshot.dashboard, 2)).toBe(2);
    expect(snapshot.risks.status).toBe("failed");
    expect(snapshot.risks.data).toBeNull();
    expect(snapshot.risks.requestId).toBe("risk-1");
  });
});

describe("EOS-COMMAND-500-1 source contract", () => {
  it("does not import project-intelligence/server from the shared API helper", () => {
    const lifecycle = readFileSync(resolve(WEB_SRC, "lib/lifecycle-api.ts"), "utf8");
    expect(lifecycle).not.toContain("@rtb/project-intelligence/server");
    expect(lifecycle).toContain("ok: false");
    expect(readFileSync(resolve(WEB_SRC, "../next.config.ts"), "utf8")).toContain("pdfjs-dist");
  });

  it("keeps Command Center error UX bounded and retryable", () => {
    const page = readFileSync(resolve(WEB_SRC, "app/(platform)/engineering/page.tsx"), "utf8");
    expect(page).toContain("command-center-retry");
    expect(page).toContain("command-center-show-details");
    expect(page).toContain("COMMAND_CENTER_USER_ERROR");
    expect(page).toContain("kpiDisplayValue");
    expect(readFileSync(resolve(WEB_SRC, "lib/engineering/load-command-center.ts"), "utf8")).toContain(
      "Unavailable",
    );
    expect(page).not.toContain("Unexpected non-JSON response");
  });
});
