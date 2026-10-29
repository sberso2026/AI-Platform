import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { CommerceDomainError } from "@rtb/platform-commerce";
import { handleCommerceDomainError } from "../lib/lifecycle-api";

describe("EOS-UAT-002 engineering API JSON error contract", () => {
  it("maps thrown list failures to non-empty JSON bodies", async () => {
    const response = handleCommerceDomainError(
      new Error("Failed to list projects: simulated"),
      "eos-uat-002",
    );
    expect(response.status).toBe(500);
    expect(response.headers.get("content-type") ?? "").toContain("application/json");
    const text = await response.text();
    expect(text.trim().length).toBeGreaterThan(0);
    const body = JSON.parse(text) as {
      error: { code: string; message: string; requestId: string };
    };
    expect(body.error.code).toBe("internal_error");
    expect(body.error.requestId).toBe("eos-uat-002");
    expect(body.error.message).toBeTruthy();
  });

  it("maps secret_required to a non-empty JSON 500", async () => {
    const response = handleCommerceDomainError(
      new CommerceDomainError(
        "COMMERCE_AUTH_SECRET is required in production and must not use the development default",
        "secret_required",
        500,
      ),
      "eos-cc-secret",
    );
    expect(response.status).toBe(500);
    const text = await response.text();
    expect(text.trim().length).toBeGreaterThan(0);
    const body = JSON.parse(text) as { error: { code: string; message: string } };
    expect(body.error.code).toBe("secret_required");
    expect(body.error.message).toContain("COMMERCE_AUTH_SECRET");
  });

  it("withEngineeringApi wraps guard and handler so secret_required cannot return an empty body", () => {
    const src = readFileSync(
      new URL("../lib/commerce/engineering-api.ts", import.meta.url),
      "utf8",
    );
    expect(src).toMatch(/try\s*\{\s*const guarded = await guardEngineeringApi/s);
    expect(src).toContain("handleCommerceDomainError(err, crypto.randomUUID())");
  });

  it("maps row-level security denials to 403, not 500", async () => {
    const response = handleCommerceDomainError(
      new Error("new row violates row-level security policy for table engineering_risks"),
      "eos-pilot-1r",
    );
    expect(response.status).toBe(403);
    const body = JSON.parse(await response.text()) as {
      error: { code: string };
    };
    expect(body.error.code).toBe("forbidden");
  });
});
