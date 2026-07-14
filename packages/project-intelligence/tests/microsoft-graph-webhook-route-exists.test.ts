import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

describe("Microsoft Graph webhook Next.js routes", () => {
  const webRoot = resolve(process.cwd(), "../web/src/app/api/webhooks/microsoft-graph");

  it("canonical route file exists", () => {
    // From packages/project-intelligence cwd is packages/project-intelligence
    const alt = resolve(process.cwd(), "../../apps/web/src/app/api/webhooks/microsoft-graph/route.ts");
    expect(existsSync(alt) || existsSync(resolve(webRoot, "route.ts"))).toBe(true);
  });

  it("canonical lifecycle route file exists", () => {
    const alt = resolve(
      process.cwd(),
      "../../apps/web/src/app/api/webhooks/microsoft-graph/lifecycle/route.ts",
    );
    expect(existsSync(alt)).toBe(true);
  });
});
