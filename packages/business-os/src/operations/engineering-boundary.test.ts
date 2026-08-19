import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { ENGINEERING_PROJECT_LINK_CONTRACT } from "./extensions";

describe("BOS-7 Engineering OS boundary", () => {
  it("stores a stable reference only and does not query engineering tables", () => {
    expect(ENGINEERING_PROJECT_LINK_CONTRACT.mode).toBe("stable_reference");
    expect(ENGINEERING_PROJECT_LINK_CONTRACT.readsEngineeringTables).toBe(false);
    expect(ENGINEERING_PROJECT_LINK_CONTRACT.writesEngineeringOs).toBe(false);
    const service = readFileSync(resolve(import.meta.dirname, "service.ts"), "utf8");
    expect(service).not.toMatch(/engineering_projects|from\("@rtb\/engineering/i);
    expect(service).toContain("linked_engineering_project_id");
    expect(service).toContain("linked_engineering_project_ref");
  });
});
