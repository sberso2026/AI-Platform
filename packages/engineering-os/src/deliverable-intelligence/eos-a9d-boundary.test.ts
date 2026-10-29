import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { ARTIFACT_REVISION_POLICIES, DOCUMENT_STATUS_SEMANTICS } from "./types";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../../../..");

describe("EOS-A9D boundary", () => {
  it("keeps templates non-authoritative and does not hard-code IFC authority", () => {
    const docs = readFileSync(join(ROOT, "docs/architecture/engineering-os/EOS_A9D_DELIVERABLE_GOVERNANCE_DOCUMENT_STATUS.md"), "utf8");
    expect(docs).toContain("TEMPLATE");
    expect(docs).toContain("UNMAPPED");
    expect(docs).toContain("EXACT_REVISION");
    expect(docs).not.toMatch(/IFC = FOR_CONSTRUCTION_USE/);
    expect(docs).not.toMatch(/AI APPROVED/i);
    const api = readFileSync(join(ROOT, "apps/web/src/app/api/engineering/deliverables/route.ts"), "utf8");
    expect(api).toContain("adopt");
    expect(api).toContain("configureMapping");
    expect(api).toContain("caller_supplied_maturity_rejected");
    const service = readFileSync(join(ROOT, "packages/engineering-os/src/deliverable-intelligence/service.ts"), "utf8");
    expect(service).toContain("adoptTemplate");
    expect(service).not.toMatch(/knowledge_nodes/);
    expect(DOCUMENT_STATUS_SEMANTICS).toContain("UNMAPPED");
    expect(ARTIFACT_REVISION_POLICIES).toEqual([
      "EXACT_REVISION",
      "CURRENT_EFFECTIVE_REVISION",
      "BASELINE_PINNED_REVISION",
    ]);
  });
});
