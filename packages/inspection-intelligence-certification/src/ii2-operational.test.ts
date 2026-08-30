import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  II_2_IMPLEMENTED,
  II_3_READY,
  II_COMMAND_CENTRE_IMPLEMENTED,
  INSPECTION_INTELLIGENCE_II_2_IMPLEMENTED,
  SCHEMA_CHANGED,
} from "@rtb/inspection-intelligence";

const ROOT = resolve(import.meta.dirname, "../../..");

describe("II-2 operational planning and execution certification", () => {
  it("implements hosted planning/execution UI without Command Centre or schema change", () => {
    expect(INSPECTION_INTELLIGENCE_II_2_IMPLEMENTED).toBe(true);
    expect(II_2_IMPLEMENTED).toBe(true);
    expect(II_3_READY).toBe(true);
    expect(II_COMMAND_CENTRE_IMPLEMENTED).toBe(false);
    expect(SCHEMA_CHANGED).toBe(false);
    expect(
      existsSync(
        resolve(ROOT, "apps/web/src/app/(platform)/engineering/apps/inspection-intelligence/plans/new/page.tsx"),
      ),
    ).toBe(true);
    expect(
      existsSync(
        resolve(
          ROOT,
          "apps/web/src/app/(platform)/engineering/apps/inspection-intelligence/sessions/[sessionId]/page.tsx",
        ),
      ),
    ).toBe(true);
    const hosted = readFileSync(
      resolve(ROOT, "apps/web/src/app/api/engineering/inspection-intelligence/hosted/route.ts"),
      "utf8",
    );
    expect(hosted).toContain('resource === "overview"');
    expect(hosted).toContain('resource === "plans"');
    expect(hosted).toContain('resource === "execution"');
    expect(hosted).toContain("resume_session");
    expect(hosted).not.toContain("createServiceClient");
    const overview = readFileSync(
      resolve(ROOT, "apps/web/src/app/(platform)/engineering/apps/inspection-intelligence/page.tsx"),
      "utf8",
    );
    expect(overview).toContain("inspection-intelligence-v1-ready");
    expect(overview).toContain("InspectionOverviewBoard");
  });
});
