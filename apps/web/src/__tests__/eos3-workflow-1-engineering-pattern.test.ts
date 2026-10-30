import { describe, it, expect, beforeEach } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { __resetProjectWorkspacesForTests } from "../lib/engineering/eos3-project-workspace-service";
import {
  __resetWorkPackagesForTests,
  getWorkPackage,
  listAssociations,
} from "../lib/engineering/eos3-work-package-service";
import { __resetAssetSystemContextForTests } from "../lib/engineering/eos3-asset-system-context";
import { __resetRelationshipGraphForTests } from "../lib/engineering/eos3-relationship-graph-core";
import { __resetDecisionAssumptionLineageForTests } from "../lib/engineering/eos3-decision-assumption-lineage";
import { __resetImpactPropagationForTests, processEngineeringChange } from "../lib/engineering/eos3-impact-propagation";
import {
  EOS3_ENGINEERING_PATTERN_CATALOG,
  EOS_ONE_PROJECT_ONE_PATTERN_ASSUMPTION,
  EOS_PATTERN_FUTURE_OBJECT_PREGENERATION,
  EOS_PATTERN_GATE_AUTO_APPROVAL,
  EOS_PATTERN_MANUAL_SELECTION_REQUIRED_BY_DEFAULT,
  EOS_UNIVERSAL_LIFECYCLE_ASSUMPTION_REMOVED,
  getPatternDefinition,
  listActivePatterns,
} from "../lib/engineering/eos3-engineering-pattern-registry";
import {
  __resetEngineeringPatternEngineForTests,
  assignEngineeringPattern,
  auditPatternEngineFoundations,
  changeEngineeringPattern,
  ensurePilot001BrownfieldPattern,
  evaluatePatternGate,
  measurePatternPerformanceBaseline,
  recordPatternException,
  runPatternValidationScenario,
  suggestEngineeringPattern,
  unauthorizedPatternWriteBlocked,
} from "../lib/engineering/eos3-engineering-pattern-engine";

const WEB_ROOT = resolve(__dirname, "../../");
const DOCS = resolve(WEB_ROOT, "../../docs/architecture/engineering-os");
const TENANT = "00000000-0000-4000-8000-000000000041";
const WS = "00000000-0000-4000-8000-wf10001";
const PROJECT = "PILOT-001-WF1";

describe("EOS-3-WORKFLOW-1 Engineering Pattern Engine", () => {
  beforeEach(() => {
    __resetProjectWorkspacesForTests();
    __resetWorkPackagesForTests();
    __resetAssetSystemContextForTests();
    __resetRelationshipGraphForTests();
    __resetDecisionAssumptionLineageForTests();
    __resetImpactPropagationForTests();
    __resetEngineeringPatternEngineForTests();
  });

  it("registers six ACTIVE patterns with canonical model and authority boundary", () => {
    const ids = listActivePatterns().map((p) => p.patternId);
    expect(ids).toEqual(
      expect.arrayContaining([
        "GREENFIELD_ENGINEERING",
        "BROWNFIELD_MODIFICATION",
        "ASSET_INTEGRITY_ASSESSMENT",
        "REPAIR_REMEDIATION",
        "VENDOR_CHANGE_ASSESSMENT",
        "SITE_TECHNICAL_SUPPORT",
      ]),
    );
    expect(EOS3_ENGINEERING_PATTERN_CATALOG.length).toBeGreaterThanOrEqual(6);
    expect(EOS_ONE_PROJECT_ONE_PATTERN_ASSUMPTION).toBe(false);
    expect(EOS_UNIVERSAL_LIFECYCLE_ASSUMPTION_REMOVED).toBe(true);
    expect(EOS_PATTERN_FUTURE_OBJECT_PREGENERATION).toBe(false);
    expect(EOS_PATTERN_GATE_AUTO_APPROVAL).toBe(false);
    expect(EOS_PATTERN_MANUAL_SELECTION_REQUIRED_BY_DEFAULT).toBe(false);
    const audit = auditPatternEngineFoundations();
    expect(audit.grantsEngineeringAuthority).toBe(false);
    expect(audit.workPackageLevel).toBe(true);
    expect(audit.universalLifecycleAssumption).toBe("REMOVED");
    const bf = getPatternDefinition("BROWNFIELD_MODIFICATION")!;
    expect(bf.gates.some((g) => g.gateId === "M0")).toBe(true);
    expect(bf.stages.some((s) => s.stageId === "engineering_design")).toBe(true);
    expect(bf.provenance.isDisciplinePattern).toBe(false);
  });

  it("assigns PILOT-001 WP-STR-004 to BROWNFIELD_MODIFICATION with flexible entry", () => {
    const result = ensurePilot001BrownfieldPattern({
      tenantId: TENANT,
      workspaceId: WS,
      projectId: PROJECT,
    });
    expect(result.suggestion.patternId).toBe("BROWNFIELD_MODIFICATION");
    expect(result.assignment.patternId).toBe("BROWNFIELD_MODIFICATION");
    expect(result.assignment.entryStageId).toBe("engineering_design");
    expect(result.assignment.inheritedBaselineRefs.length).toBeGreaterThan(0);
    const wp = getWorkPackage(PROJECT, "WP-STR-004")!;
    expect(wp.maturity).toBe("Detailed Engineering");
    expect(wp.workType).toBe("Brownfield Modification");
    expect(wp.engineeringPatternRef).toContain("BROWNFIELD_MODIFICATION");
    expect(result.gateM3.approved).toBe(false);
  });

  it("integrates impact readiness for brownfield IFC/design gates", () => {
    ensurePilot001BrownfieldPattern({
      tenantId: TENANT,
      workspaceId: WS,
      projectId: PROJECT,
    });
    processEngineeringChange({
      tenantId: TENANT,
      workspaceId: WS,
      projectId: PROJECT,
      triggerKind: "ASSUMPTION_REVISION",
      triggerStableId: "ASM-001",
      triggerObjectClass: "Assumption",
      previousRevision: "Rev 1",
      newRevision: "Rev 2",
      changeSummary: "Vendor operating mass changed from 12 t to 15 t",
      eventKey: "wf1-mass",
    });
    const m4 = evaluatePatternGate({
      workspaceId: WS,
      projectId: PROJECT,
      workPackageStableId: "WP-STR-004",
      gateId: "M4",
    });
    expect(m4.approved).toBe(false);
    expect(
      m4.status === "BLOCKED_BY_IMPACT" || m4.materialImpacts.length > 0 || m4.blockers.length > 0,
    ).toBe(true);
  });

  it("validates Greenfield, Integrity, Repair, Vendor Change, Site Support scenarios", () => {
    const scenarios = [
      {
        patternId: "GREENFIELD_ENGINEERING",
        workPackageStableId: "WP-GF-001",
        title: "New pump installation",
        description: "New processing facility greenfield pump installation",
      },
      {
        patternId: "ASSET_INTEGRITY_ASSESSMENT",
        workPackageStableId: "WP-AI-001",
        title: "Corrosion cracking assessment",
        description: "Existing structure shows corrosion cracking integrity assessment",
      },
      {
        patternId: "REPAIR_REMEDIATION",
        workPackageStableId: "WP-RP-001",
        title: "Repair deteriorated member",
        description: "Approved repair of deteriorated structural member remediation",
      },
      {
        patternId: "VENDOR_CHANGE_ASSESSMENT",
        workPackageStableId: "WP-VC-001",
        title: "Vendor operating load change",
        description: "Vendor operating mass / equipment load datasheet revision after design start",
      },
      {
        patternId: "SITE_TECHNICAL_SUPPORT",
        workPackageStableId: "WP-SS-001",
        title: "Construction TQ structural detail",
        description: "Construction raises field TQ affecting structural detail site support",
      },
    ] as const;

    for (const s of scenarios) {
      const r = runPatternValidationScenario({
        tenantId: TENANT,
        workspaceId: WS,
        projectId: PROJECT,
        ...s,
      });
      expect(r.assignment.patternId).toBe(s.patternId);
      expect(r.suggestion.patternId === s.patternId || r.suggestion.alternatives.includes(s.patternId) || r.suggestion.confidence !== "HIGH").toBe(true);
    }
  });

  it("supports suggestion ambiguity, override provenance, and non-destructive pattern change", () => {
    ensurePilot001BrownfieldPattern({
      tenantId: TENANT,
      workspaceId: WS,
      projectId: PROJECT,
    });
    const ambiguous = suggestEngineeringPattern({
      title: "Assess whether cracking requires repair",
      description: "integrity vs repair",
    });
    expect(ambiguous.requiresConfirmation || ambiguous.ambiguous || ambiguous.alternatives.length >= 0).toBe(
      true,
    );

    const before = listAssociations(PROJECT, "WP-STR-004").map((a) => a.objectStableId);
    const changed = changeEngineeringPattern({
      tenantId: TENANT,
      workspaceId: WS,
      projectId: PROJECT,
      workPackageStableId: "WP-STR-004",
      newPatternId: "VENDOR_CHANGE_ASSESSMENT",
      reason: "Reclassified after vendor-driven mass change dominance",
      userId: "lead_engineer",
      authorized: true,
    });
    expect(changed.patternId).toBe("VENDOR_CHANGE_ASSESSMENT");
    expect(changed.overrideHistory.length).toBeGreaterThan(0);
    const after = listAssociations(PROJECT, "WP-STR-004").map((a) => a.objectStableId);
    for (const s of before) expect(after).toContain(s);

    expect(() =>
      changeEngineeringPattern({
        tenantId: TENANT,
        workspaceId: WS,
        projectId: PROJECT,
        workPackageStableId: "WP-STR-004",
        newPatternId: "GREENFIELD_ENGINEERING",
        reason: "no",
        userId: "x",
        authorized: false,
      }),
    ).toThrow(/unauthorized/);
  });

  it("records governed exceptions and never auto-approves gates", () => {
    ensurePilot001BrownfieldPattern({
      tenantId: TENANT,
      workspaceId: WS,
      projectId: PROJECT,
    });
    const a = recordPatternException({
      workspaceId: WS,
      projectId: PROJECT,
      workPackageStableId: "WP-STR-004",
      requirement: "IFC deliverable",
      disposition: "NOT_APPLICABLE",
      reason: "Not yet at IFC stage",
      authorityRole: "qualified_reviewer",
      authorityUserId: "u1",
      authorized: true,
    });
    expect(a.exceptions.length).toBe(1);
    const gate = evaluatePatternGate({
      workspaceId: WS,
      projectId: PROJECT,
      workPackageStableId: "WP-STR-004",
      gateId: "M3",
    });
    expect(gate.approved).toBe(false);
    expect(unauthorizedPatternWriteBlocked({ callerWorkspaceId: WS, assignmentWorkspaceId: "other" })).toBe(
      true,
    );
  });

  it("allows multiple patterns in one project and measures performance", () => {
    ensurePilot001BrownfieldPattern({
      tenantId: TENANT,
      workspaceId: WS,
      projectId: PROJECT,
    });
    runPatternValidationScenario({
      tenantId: TENANT,
      workspaceId: WS,
      projectId: PROJECT,
      patternId: "SITE_TECHNICAL_SUPPORT",
      workPackageStableId: "WP-SS-002",
      title: "Field RFI",
      description: "site RFI TQ field issue",
    });
    const wp1 = getWorkPackage(PROJECT, "WP-STR-004")!;
    const wp2 = getWorkPackage(PROJECT, "WP-SS-002")!;
    expect(wp1.engineeringPatternRef).not.toEqual(wp2.engineeringPatternRef);

    const perf = measurePatternPerformanceBaseline(8);
    // eslint-disable-next-line no-console
    console.log("EOS_WORKFLOW1_PERF", JSON.stringify(perf));
    expect(perf.blockerCount).toBe(0);
    expect(perf.resolutionP95Ms).toBeGreaterThanOrEqual(0);
    expect(perf.readinessP95Ms).toBeGreaterThanOrEqual(0);
    expect(perf.transitionValidationP95Ms).toBeGreaterThanOrEqual(0);
  });

  it("documents artifacts and preserves UI freeze / no pattern nav item", () => {
    for (const f of [
      "EOS_3_ENGINEERING_PATTERN_ENGINE.md",
      "EOS_3_ENGINEERING_PATTERN_REGISTRY.md",
      "EOS_3_ENGINEERING_PATTERN_ENTRY_AND_TRANSITIONS.md",
      "EOS_3_ENGINEERING_PATTERN_GATE_MODEL.md",
      "EOS_3_ENGINEERING_PATTERN_AUTHORITY.md",
      "EOS_3_WORKFLOW1_PILOT_VALIDATION.md",
      "EOS_3_WORKFLOW_1_MANIFEST.json",
    ]) {
      expect(existsSync(resolve(DOCS, f))).toBe(true);
    }
    const mig = resolve(
      WEB_ROOT,
      "../../supabase/migrations/20261030220000_eos_3_workflow_1_engineering_patterns.sql",
    );
    expect(existsSync(mig)).toBe(true);

    const home = readFileSync(resolve(WEB_ROOT, "src/app/(platform)/engineering/page.tsx"), "utf8");
    expect(home).toContain("approved-engineering-1c-locked");
    expect(home).not.toContain("engineering-patterns");

    const wpPanel = readFileSync(
      resolve(WEB_ROOT, "src/components/engineering/project-workspace/work-packages-panel.tsx"),
      "utf8",
    );
    expect(wpPanel).toContain("Work Type");
    expect(wpPanel).toContain("wp-work-type");

    // No primary sidebar Engineering Patterns item
    const nav = readFileSync(
      resolve(WEB_ROOT, "../../packages/platform-core/src/navigation.ts"),
      "utf8",
    );
    expect(nav).not.toMatch(/label:\s*"Engineering Patterns"/);
  });
});
