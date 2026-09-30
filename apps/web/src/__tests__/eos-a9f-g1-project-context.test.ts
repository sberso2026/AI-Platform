import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { getEngineeringApiPolicy } from "@rtb/platform-commerce";
import { engineeringApiRequiresIdentityAssurance } from "../lib/commerce/engineering-identity-assurance";

const WEB_ROOT = resolve(__dirname, "../../");

function readApp(rel: string) {
  return readFileSync(resolve(WEB_ROOT, rel), "utf8");
}

describe("EOS-A9F-G1 canonical Engineering project selector", () => {
  it("lists Engineering projects as Engineering OS core, not Project Intelligence", () => {
    const read = getEngineeringApiPolicy("projects", "GET");
    const write = getEngineeringApiPolicy("projects", "POST");
    expect(read.applicationKey).toBeUndefined();
    expect(write.applicationKey).toBeUndefined();
    expect(read.action).toBe("project.read");
    expect(write.action).toBe("project.create");
  });

  it("does not AAL2-gate the shared project selector API", () => {
    expect(engineeringApiRequiresIdentityAssurance("projects", "GET")).toBe(false);
    expect(engineeringApiRequiresIdentityAssurance("projects", "POST")).toBe(false);
    expect(engineeringApiRequiresIdentityAssurance("deliverables", "POST")).toBe(true);
  });

  it("loads Authorized Project options from the Engineering projects API", () => {
    const bar = readApp("src/components/engineering/project-context-bar.tsx");
    expect(bar).toContain('fetch("/api/engineering/projects")');
    expect(bar).toContain("Authorized project");
    expect(bar).not.toContain("proj-crusher-feed");
  });

  it("does not bind Deliverables or Lifecycle to a synthetic crusher-feed project id", () => {
    const deliverables = readApp("src/components/engineering/deliverable-workspace.tsx");
    const lifecycle = readApp("src/components/engineering/lifecycle-workspace.tsx");
    expect(deliverables).not.toContain("proj-crusher-feed");
    expect(lifecycle).not.toContain("proj-crusher-feed");
    expect(deliverables).toContain("useResolvedEngineeringProjectId");
    expect(lifecycle).toContain("useResolvedEngineeringProjectId");
  });
});
