import { describe, expect, it } from "vitest";
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
});
