import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("Microsoft Graph webhook route wiring (web)", () => {
  const root = resolve(process.cwd(), "src/app/api/webhooks/microsoft-graph");

  it("exports runtime nodejs and dynamic force-dynamic on canonical route", () => {
    const src = readFileSync(resolve(root, "route.ts"), "utf8");
    expect(src).toContain('export const runtime = "nodejs"');
    expect(src).toContain('export const dynamic = "force-dynamic"');
    expect(src).toContain("handleMicrosoftGraphWebhook");
  });

  it("middleware matcher excludes microsoft-graph webhooks", () => {
    const mw = readFileSync(resolve(process.cwd(), "src/middleware.ts"), "utf8");
    expect(mw).toContain("api/webhooks/microsoft-graph");
  });
});
