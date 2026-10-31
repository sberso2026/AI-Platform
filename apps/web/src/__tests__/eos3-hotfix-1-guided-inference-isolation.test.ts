import { describe, expect, it, beforeEach } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  __resetProjectWorkspacesForTests,
  findByStableId,
  listWorkspaceObjects,
} from "../lib/engineering/eos3-project-workspace-service";
import {
  auditGuidedInferenceIsolation,
  buildSimplifiedGateReadiness,
  classifyProjectFromObjective,
  extractSourcedNumericFacts,
  generateGuidedProjectState,
  resetContaminatedGuidedProposals,
} from "../lib/engineering/eos3-guided-engineering";

const WEB_ROOT = resolve(__dirname, "../../");
const DOCS = resolve(WEB_ROOT, "../../docs/architecture/engineering-os");

const PILOT_010_OBJECTIVE =
  "Upgrade an existing process gas compressor package at KGP to increase operating capacity. Assess the existing compressor system and associated facilities, identify the engineering modifications required, and develop the multidisciplinary engineering scope for the upgrade. The assessment should consider the compressor package, structural supports and foundations, piping and nozzle loads, electrical power requirements, instrumentation and controls, existing plant interfaces, constructability, brownfield constraints, operations requirements, and required engineering deliverables.";

const PILOT_010_REASON =
  "The existing compressor system requires increased operating capacity while maintaining safe, reliable and compliant operation of the existing plant. The upgrade must determine whether the existing equipment, structures, foundations, piping, electrical systems and associated interfaces can accommodate the revised operating conditions, and identify modifications required before implementation.";

describe("EOS-3-HOTFIX-1 Guided Engineering Inference Isolation", () => {
  beforeEach(() => {
    __resetProjectWorkspacesForTests();
  });

  it("audits isolation foundations", () => {
    const a = auditGuidedInferenceIsolation();
    expect(a.crossProjectInferenceContaminationFixed).toBe(true);
    expect(a.projectWorkPackageClassificationSeparation).toBe(true);
    expect(a.templateFactInjectionBlocked).toBe(true);
    expect(a.numericFactSourceGovernance).toBe(true);
    expect(a.unknownValuePreservation).toBe(true);
    expect(a.pilotSpecificHardcodeCount).toBe(0);
  });

  it("Acceptance A–L: PILOT-010 / PILOT-011 retest from normal guided path", () => {
    const projectId = "PILOT-011"; // clean retest project preserving PILOT-010 defect evidence
    const result = generateGuidedProjectState(projectId, {
      objective: PILOT_010_OBJECTIVE,
      whyNeeded: PILOT_010_REASON,
      ownerId: "eng-010",
      ownerName: "Compressor Engineer",
    });

    const blob = JSON.stringify(result);
    expect(blob.match(/PILOT-001|pilot-001-template/gi) ?? []).toHaveLength(0);
    expect(blob.match(/12\s*t\s*→\s*15\s*t/gi) ?? []).toHaveLength(0);
    expect(blob.match(/Assume operating mass 12\s*t/gi) ?? []).toHaveLength(0);

    expect(result.projectClassification).toMatch(/Brownfield Process Plant Upgrade/i);
    expect(result.projectClassification).not.toBe("Structural Modification");
    expect(result.primarySystem).toMatch(/Process Gas Compression/i);
    expect(result.workPackagePatternHint).toBe("BROWNFIELD_MODIFICATION");

    const discs = result.candidateDisciplines;
    for (const d of [
      "Process",
      "Mechanical",
      "Piping",
      "Electrical",
      "Instrumentation & Controls",
      "Structural",
      "Civil",
    ]) {
      expect(discs).toContain(d);
    }
    expect(result.confirmedDisciplines).toEqual([]);

    expect(result.informationGaps.some((g) => /vendor|load|capacity|configuration/i.test(g))).toBe(
      true,
    );
    expect(result.informationGaps.some((g) => /Vendor-confirmed operating/i.test(g))).toBe(true);

    expect(result.options).toHaveLength(0);
    expect(result.prematureSolutionOptionCount).toBe(0);
    expect(result.prematureDecisionCount).toBe(0);
    expect(result.prematureCalculationCount).toBe(0);
    expect(findByStableId(projectId, "CALC-001")).toBeFalsy();
    expect(findByStableId(projectId, "DEC-001")).toBeFalsy();
    expect(findByStableId(projectId, "ASM-001")).toBeFalsy();

    expect(
      result.proposals.some((p) =>
        /Existing support\/foundation capacity requires verification/i.test(p.summary),
      ),
    ).toBe(true);
    expect(
      result.proposals.some((p) => /Strengthen existing structure/i.test(p.title + p.summary)),
    ).toBe(false);

    expect(
      result.proposals.every(
        (p) =>
          p.provenance.projectId === projectId &&
          !/pilot-001-template|PILOT-001/i.test(p.provenance.source),
      ),
    ).toBe(true);

    const gate = buildSimplifiedGateReadiness(projectId);
    expect(gate.applicableCriteria.some((c) => /multidisciplinary|Capacity|System/i.test(c))).toBe(
      true,
    );
    expect(gate.needsAttention.every((n) => !/12\s*t|strengthen existing/i.test(n))).toBe(true);
    expect(gate.readinessExplainable).toBe(true);

    expect(
      result.tasks.every((t) => !/12 t → 15 t|PILOT-001|strengthen \/ independent/i.test(t.description)),
    ).toBe(true);
    expect(result.tasks.some((t) => /information gaps|candidate affected|capacity/i.test(t.label))).toBe(
      true,
    );

    // Soft reset contaminated proposals for clean re-run
    const cleared = resetContaminatedGuidedProposals(projectId);
    expect(cleared.clearedStableIds.length).toBeGreaterThan(0);
    const rerun = generateGuidedProjectState(projectId, {
      objective: PILOT_010_OBJECTIVE,
      whyNeeded: PILOT_010_REASON,
      ownerId: "eng-010",
    });
    expect(JSON.stringify(rerun).match(/PILOT-001/gi) ?? []).toHaveLength(0);
  });

  it("generic cross-project numeric isolation (Project A/B/C)", () => {
    generateGuidedProjectState("PROJECT-A", {
      objective: "Support frame modification. Equipment mass = 12 t pending confirmation.",
      ownerId: "a",
    });
    expect(findByStableId("PROJECT-A", "ASM-001")?.payload.equipmentMass).toBe("12 t");

    const b = generateGuidedProjectState("PROJECT-B", {
      objective:
        "Upgrade brownfield process utilities without stating any equipment mass or temperature.",
      ownerId: "b",
    });
    const bBlob = JSON.stringify(b) + JSON.stringify(listWorkspaceObjects("PROJECT-B"));
    expect((bBlob.match(/12\s*t/gi) ?? []).length).toBe(0);

    generateGuidedProjectState("PROJECT-C", {
      objective: "Furnace upgrade. Operating temperature = 350 C stated for design case.",
      ownerId: "c",
    });

    const b2 = generateGuidedProjectState("PROJECT-B-RECHECK", {
      objective:
        "Upgrade brownfield process utilities without stating any equipment mass or temperature.",
      ownerId: "b",
    });
    const b2Blob = JSON.stringify(b2);
    expect((b2Blob.match(/12\s*t/gi) ?? []).length).toBe(0);
    expect((b2Blob.match(/350\s*C/gi) ?? []).length).toBe(0);
  });

  it("template provenance never injects PILOT-001 facts", () => {
    const r = generateGuidedProjectState("PROJECT-TMPL", {
      objective: "Brownfield process plant upgrade of cooling water system.",
      ownerId: "t",
      reusablePatternHint: "Brownfield Modification",
    });
    expect(r.proposals.every((p) => !/pilot-001-template/i.test(p.provenance.source))).toBe(true);
    expect(
      r.proposals.some(
        (p) =>
          p.objectType === "Deliverable" &&
          /Suggested from Brownfield Modification/i.test(p.whySuggested + p.provenance.basis),
      ) || r.workPackagePatternHint === "BROWNFIELD_MODIFICATION",
    ).toBe(true);
  });

  it("classifies and extracts numerics without invention", () => {
    const c = classifyProjectFromObjective(PILOT_010_OBJECTIVE, PILOT_010_REASON);
    expect(c.projectNature).toMatch(/Brownfield Process Plant Upgrade/i);
    expect(extractSourcedNumericFacts(PILOT_010_OBJECTIVE)).toHaveLength(0);
    expect(extractSourcedNumericFacts("mass 12 t on platform")).toHaveLength(1);
  });

  it("preserves UI freeze artifacts and docs", () => {
    expect(existsSync(resolve(DOCS, "EOS_3_HOTFIX_1_GUIDED_INFERENCE_ISOLATION.md"))).toBe(true);
    expect(existsSync(resolve(DOCS, "EOS_3_HOTFIX_1_MANIFEST.json"))).toBe(true);
    const guided = readFileSync(
      resolve(WEB_ROOT, "src/lib/engineering/eos3-guided-engineering.ts"),
      "utf8",
    );
    expect(guided).not.toMatch(/source:\s*"pilot-001-template"/);
    expect(guided).not.toMatch(/if\s*\(.*projectId\s*===\s*["']PILOT-010/);
    const wp = readFileSync(
      resolve(WEB_ROOT, "src/components/engineering/project-workspace/work-packages-panel.tsx"),
      "utf8",
    );
    expect(wp).toContain("wp-cockpit-foundation");
  });
});
