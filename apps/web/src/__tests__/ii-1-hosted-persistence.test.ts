import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const WEB_SRC = resolve(__dirname, "..");

describe("II-1 hosted persistence API boundary", () => {
  it("adds authenticated hosted domain intents without replacing historical slice fixtures", () => {
    const hosted = readFileSync(
      resolve(WEB_SRC, "app/api/engineering/inspection-intelligence/hosted/route.ts"),
      "utf8",
    );
    const slice = readFileSync(
      resolve(WEB_SRC, "app/api/engineering/inspection-intelligence/slice/route.ts"),
      "utf8",
    );
    const access = readFileSync(
      resolve(WEB_SRC, "lib/inspection-intelligence/hosted-service.ts"),
      "utf8",
    );
    expect(hosted).toContain("withEngineeringApi(\"inspection-intelligence-hosted\"");
    expect(hosted).toContain("create_plan");
    expect(hosted).toContain("start_session");
    expect(hosted).toContain("record_observation");
    expect(hosted).toContain("close_out");
    expect(slice).toContain("runVerticalSliceHappyPath");
    expect(access).toContain("context.ctx.supabase");
    expect(access).not.toContain("createServiceClient");
  });
});
