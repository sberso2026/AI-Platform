import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const WEB_SRC = resolve(__dirname, "..");

describe("II-3 operational web routes", () => {
  it("adds defect, condition, evidence, remediation, and review pages on the hosted API", () => {
    expect(existsSync(resolve(WEB_SRC, "app/(platform)/engineering/apps/inspection-intelligence/defects/page.tsx"))).toBe(
      true,
    );
    expect(
      existsSync(
        resolve(WEB_SRC, "app/(platform)/engineering/apps/inspection-intelligence/defects/[defectId]/page.tsx"),
      ),
    ).toBe(true);
    expect(existsSync(resolve(WEB_SRC, "app/(platform)/engineering/apps/inspection-intelligence/condition/page.tsx"))).toBe(
      true,
    );
    expect(existsSync(resolve(WEB_SRC, "app/(platform)/engineering/apps/inspection-intelligence/evidence/page.tsx"))).toBe(
      true,
    );
    expect(existsSync(resolve(WEB_SRC, "app/(platform)/engineering/apps/inspection-intelligence/actions/page.tsx"))).toBe(
      true,
    );
    const hosted = readFileSync(resolve(WEB_SRC, "app/api/engineering/inspection-intelligence/hosted/route.ts"), "utf8");
    expect(hosted).toContain("listDefects");
    expect(hosted).toContain("getDefectWorkspace");
    expect(hosted).toContain("getIntelligence");
    expect(hosted).toContain("create_defect");
    expect(hosted).toContain("persist_condition_rating");
    expect(hosted).not.toContain("createServiceClient");
    const shell = readFileSync(resolve(WEB_SRC, "components/engineering/inspection-intelligence-shell.tsx"), "utf8");
    expect(shell).toContain("/engineering/apps/inspection-intelligence/defects");
    expect(shell).toContain("/engineering/apps/inspection-intelligence/evidence");
    const detail = readFileSync(resolve(WEB_SRC, "components/engineering/inspection-defect-detail.tsx"), "utf8");
    expect(detail).toContain("not a PI finding");
    expect(detail).toContain("not an Engineering Core action");
    const evidence = readFileSync(resolve(WEB_SRC, "components/engineering/inspection-evidence-gallery.tsx"), "utf8");
    expect(evidence).toContain("does not store a second copy");
    const workspace = readFileSync(resolve(WEB_SRC, "components/engineering/inspection-session-workspace.tsx"), "utf8");
    expect(workspace).toContain("observations: [...current.observations, row]");
  });
});
