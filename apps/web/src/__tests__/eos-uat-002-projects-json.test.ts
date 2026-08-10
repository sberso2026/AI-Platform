import { describe, expect, it, vi } from "vitest";
import {
  asRecordArray,
  extractApiErrorMessage,
  parseApiJsonResponse,
} from "../lib/api/parse-json-response.ts";
import { loadEngineeringListItems } from "../lib/engineering/load-engineering-list.ts";

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

describe("EOS-UAT-002 parseApiJsonResponse", () => {
  it("parses empty project list JSON without throwing", async () => {
    const parsed = await parseApiJsonResponse(mockResponse(JSON.stringify({ data: [] })));
    expect(parsed.ok).toBe(true);
    expect(asRecordArray(parsed.data)).toEqual([]);
    expect(parsed.errorMessage).toBeNull();
  });

  it("handles empty response body without Unexpected end of JSON input", async () => {
    const parsed = await parseApiJsonResponse(mockResponse("", { status: 500 }));
    expect(parsed.ok).toBe(false);
    expect(parsed.errorMessage).toContain("empty response body");
    expect(parsed.errorMessage).not.toMatch(/Unexpected end of JSON/i);
  });

  it("handles 401 nested lifecycle error objects as strings", async () => {
    const parsed = await parseApiJsonResponse(
      mockResponse(
        JSON.stringify({
          error: { code: "unauthenticated", message: "Unauthorized", requestId: "r1", details: {} },
        }),
        { status: 401 },
      ),
    );
    expect(parsed.ok).toBe(false);
    expect(parsed.errorMessage).toBe("Unauthorized");
  });

  it("handles 403 denial string errors", async () => {
    const parsed = await parseApiJsonResponse(
      mockResponse(JSON.stringify({ error: "Access denied", code: "seat_not_assigned" }), {
        status: 403,
      }),
    );
    expect(parsed.ok).toBe(false);
    expect(parsed.errorMessage).toBe("Access denied");
  });

  it("handles 404 and malformed JSON", async () => {
    const notFound = await parseApiJsonResponse(
      mockResponse(JSON.stringify({ error: { message: "Project not found" } }), {
        status: 404,
      }),
    );
    expect(notFound.errorMessage).toBe("Project not found");
    const malformed = await parseApiJsonResponse(
      mockResponse("{not-json", { status: 200, contentType: "application/json" }),
    );
    expect(malformed.ok).toBe(false);
    expect(malformed.errorMessage).toContain("Malformed JSON");
  });

  it("extractApiErrorMessage supports string and nested shapes", () => {
    expect(extractApiErrorMessage({ error: "x" }, "f")).toBe("x");
    expect(extractApiErrorMessage({ error: { message: "m" } }, "f")).toBe("m");
    expect(extractApiErrorMessage(null, "f")).toBe("f");
  });
});

describe("EOS-UAT-002 loadEngineeringListItems fresh-user/empty-project", () => {
  it("returns empty items for { data: [] }", async () => {
    const fetchImpl = vi.fn(async () =>
      mockResponse(JSON.stringify({ data: [] })),
    ) as unknown as typeof fetch;
    const result = await loadEngineeringListItems("/api/engineering/projects", fetchImpl);
    expect(result.error).toBeNull();
    expect(result.items).toEqual([]);
  });

  it("returns one/multiple projects", async () => {
    const fetchImpl = vi.fn(async () =>
      mockResponse(
        JSON.stringify({
          data: [
            { id: "p1", project_name: "One" },
            { id: "p2", project_name: "Two" },
          ],
        }),
      ),
    ) as unknown as typeof fetch;
    const result = await loadEngineeringListItems("/api/engineering/projects", fetchImpl);
    expect(result.error).toBeNull();
    expect(result.items).toHaveLength(2);
  });

  it("does not throw on empty body error responses", async () => {
    const fetchImpl = vi.fn(async () =>
      mockResponse("", { status: 502, contentType: null }),
    ) as unknown as typeof fetch;
    const result = await loadEngineeringListItems("/api/engineering/projects", fetchImpl);
    expect(result.items).toEqual([]);
    expect(result.error).toContain("empty response body");
  });

  it("maps network failure to a stable error", async () => {
    const fetchImpl = vi.fn(async () => {
      throw new TypeError("Failed to fetch");
    }) as unknown as typeof fetch;
    const result = await loadEngineeringListItems("/api/engineering/projects", fetchImpl);
    expect(result.error).toBe("Network failure while loading records");
  });
});
