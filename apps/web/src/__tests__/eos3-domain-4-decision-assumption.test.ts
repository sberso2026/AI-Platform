import { describe, it, expect, beforeEach } from "vitest";
import { __resetProjectWorkspacesForTests } from "../lib/engineering/eos3-project-workspace-service";
import { __resetWorkPackagesForTests } from "../lib/engineering/eos3-work-package-service";
import { __resetAssetSystemContextForTests } from "../lib/engineering/eos3-asset-system-context";
import { __resetRelationshipGraphForTests } from "../lib/engineering/eos3-relationship-graph-core";
import {
  __resetDecisionAssumptionLineageForTests,
  EOS_ASSUMPTION_ORCHESTRATION_ANCHOR,
  EOS_AUTOMATIC_DECISION_INVALIDATION_IMPLEMENTED,
  EOS_AUTONOMOUS_ENGINEERING_APPROVAL,
  EOS_AUTONOMOUS_FINAL_ENGINEERING_DECISION,
  EOS_STALENESS_PROPAGATION_IMPLEMENTED,
  addDecisionOption,
  auditExistingDecisionAssumptionModels,
  buildAssumptionUiContract,
  buildDecisionUiContract,
  createAssumptionFromNaturalStatement,
  createDecisionFromNaturalQuestion,
  getAssumption,
  getDecision,
  invalidateAssumption,
  markDecisionReassessmentRequired,
  queryAssumptionDependents,
  queryAssumptionEvidence,
  queryCalculationAssumptions,
  queryDecisionSupport,
  queryDecisionWhy,
  recordFinalDecision,
  reviseAssumption,
  seedPilot001DecisionAssumptionLineage,
  supersedeDecision,
  unauthorizedDecisionAssumptionWriteBlocked,
  verifyAssumption,
} from "../lib/engineering/eos3-decision-assumption-lineage";
import { AI_DECISION_AUTHORITY } from "../lib/engineering/eos3-decision-intelligence";
import { unjustifiedRequiredFieldCount } from "../lib/engineering/eos3-field-necessity-audit";

const WS = "00000000-0000-4000-8000-d4lineage0001";
const TENANT = "00000000-0000-4000-8000-000000000041";
const PROJECT = "PILOT-001-D4";

describe("EOS-3-DOMAIN-4 Decision and Assumption lineage", () => {
  beforeEach(() => {
    __resetProjectWorkspacesForTests();
    __resetWorkPackagesForTests();
    __resetAssetSystemContextForTests();
    __resetRelationshipGraphForTests();
    __resetDecisionAssumptionLineageForTests();
  });

  it("audits existing models without duplication or orchestration-anchor assumption", () => {
    const a = auditExistingDecisionAssumptionModels();
    expect(a.existingDecisionModelAudited).toBe(true);
    expect(a.existingAssumptionModelAudited).toBe(true);
    expect(a.duplicateDecisionModelCreated).toBe(false);
    expect(a.duplicateAssumptionModelCreated).toBe(false);
    expect(EOS_ASSUMPTION_ORCHESTRATION_ANCHOR).toBe(false);
    expect(a.assumptionIsNotOrchestrationAnchor).toBe(true);
  });

  it("creates contextual assumption as PROPOSED ASSUMPTION not FACT", () => {
    const a = createAssumptionFromNaturalStatement({
      tenantId: TENANT,
      workspaceId: WS,
      projectId: PROJECT,
      text: "Assume operating mass is 12 t until vendor confirmation.",
      workPackageStableId: "WP-STR-004",
      assetSystemStableIds: ["AST-PLT-201"],
    });
    expect(a.status).toBe("PROPOSED");
    expect(a.value).toBe(12);
    expect(a.units).toBe("t");
    expect(a.evidenceClassification).toBe("ASSUMPTION");
    expect(a.provenance.isFact).toBe(false);
    expect(a.provenance.autoVerified).toBe(false);
    expect(a.provenance.isOrchestrationAnchor).toBe(false);
  });

  it("revises assumption without rewriting historical revision values", () => {
    const a1 = createAssumptionFromNaturalStatement({
      tenantId: TENANT,
      workspaceId: WS,
      projectId: PROJECT,
      text: "Assume operating mass is 12 t until vendor confirmation.",
    });
    const a2 = reviseAssumption({
      workspaceId: WS,
      assumptionIdOrStable: a1.stableId,
      value: 15,
      units: "t",
      basis: "Authoritative vendor data Rev 5",
    });
    expect(a2.revision).toBe(2);
    expect(a2.value).toBe(15);
    const hist = getAssumption(WS, a1.id)!;
    expect(hist.status).toBe("SUPERSEDED");
    expect(hist.value).toBe(12);
  });

  it("scopes verification authority and invalidation foundation", () => {
    const a = createAssumptionFromNaturalStatement({
      tenantId: TENANT,
      workspaceId: WS,
      projectId: PROJECT,
      text: "Assume steel grade Grade 300",
    });
    expect(() =>
      verifyAssumption({
        workspaceId: WS,
        assumptionIdOrStable: a.stableId,
        actorId: "u1",
        authorityRole: "author",
      }),
    ).toThrow(/authority/);
    const verified = verifyAssumption({
      workspaceId: WS,
      assumptionIdOrStable: a.stableId,
      actorId: "u1",
      authorityRole: "discipline_verifier",
    });
    expect(verified.status).toBe("VERIFIED");
    expect(verified.provenance.verifiedIsNotApprovedEngineering).toBe(true);

    const inv = invalidateAssumption({
      workspaceId: WS,
      assumptionIdOrStable: a.stableId,
      actorId: "u1",
      reason: "Vendor data supersedes provisional value",
      authoritativeEvidenceStableId: "EVD-VEND-5",
    });
    expect(inv.status).toBe("INVALIDATED");
    expect(inv.provenance.automaticStalenessPropagation).toBe(false);
  });

  it("creates contextual decision draft without auto-approval", () => {
    const d = createDecisionFromNaturalQuestion({
      tenantId: TENANT,
      workspaceId: WS,
      projectId: PROJECT,
      text: "Determine whether to strengthen the existing platform or install an independent frame.",
      workPackageStableId: "WP-STR-004",
    });
    expect(d.status).toBe("PROPOSED");
    expect(d.decisionType).toBe("ENGINEERING_DECISION");
    expect(d.options.length).toBeGreaterThanOrEqual(2);
    expect(d.provenance.autoApproved).toBe(false);
    expect(d.provenance.ownerIsNotAuthority).toBe(true);
    expect(AI_DECISION_AUTHORITY).toBe(false);
  });

  it("requires rationale and explicit authority to finalize; blocks owner auto-authority", () => {
    const d = createDecisionFromNaturalQuestion({
      tenantId: TENANT,
      workspaceId: WS,
      projectId: PROJECT,
      text: "Select support strategy",
    });
    const withOpt = addDecisionOption(WS, d.stableId, { label: "Option A" });
    const optId = withOpt.options[0]!.optionId;
    expect(() =>
      recordFinalDecision({
        workspaceId: WS,
        decisionIdOrStable: d.stableId,
        selectedOptionId: optId,
        rationale: "",
        actorId: "u1",
        authorityBasis: "chartered engineer",
        authorityRole: "technical_authority",
      }),
    ).toThrow(/rationale/);
    expect(() =>
      recordFinalDecision({
        workspaceId: WS,
        decisionIdOrStable: d.stableId,
        selectedOptionId: optId,
        rationale: "Preferred for constructability",
        actorId: "u1",
        authorityBasis: "work_package_owner",
        authorityRole: "work_package_owner",
      }),
    ).toThrow(/auto_authority|forbidden/);
    const final = recordFinalDecision({
      workspaceId: WS,
      decisionIdOrStable: d.stableId,
      selectedOptionId: optId,
      rationale: "Preferred for constructability and load path clarity",
      actorId: "u1",
      authorityBasis: "appointed technical authority",
      authorityRole: "technical_authority",
    });
    expect(final.status).toBe("DECIDED");
    expect(final.humanDecisionEvent?.rationale).toContain("constructability");
    expect(EOS_AUTONOMOUS_FINAL_ENGINEERING_DECISION).toBe(false);
    expect(EOS_AUTONOMOUS_ENGINEERING_APPROVAL).toBe(false);
  });

  it("supports supersession and reassessment foundation without auto invalidation", () => {
    const d = createDecisionFromNaturalQuestion({
      tenantId: TENANT,
      workspaceId: WS,
      projectId: PROJECT,
      text: "Q1",
    });
    const neu = supersedeDecision({
      workspaceId: WS,
      oldDecisionIdOrStable: d.stableId,
      question: "Q1 revised",
    });
    expect(getDecision(WS, d.id)?.status).toBe("SUPERSEDED");
    expect(neu.supersedesDecisionId).toBe(d.id);
    const re = markDecisionReassessmentRequired(WS, neu.stableId, "New vendor mass");
    expect(re.status).toBe("REASSESSMENT_REQUIRED");
    expect(EOS_AUTOMATIC_DECISION_INVALIDATION_IMPLEMENTED).toBe(false);
    expect(EOS_STALENESS_PROPAGATION_IMPLEMENTED).toBe(false);
  });

  it("blocks cross-workspace unauthorized writes", () => {
    expect(
      unauthorizedDecisionAssumptionWriteBlocked({
        callerWorkspaceId: WS,
        recordWorkspaceId: "other",
      }),
    ).toBe(true);
  });

  it("pilot lineage queries and UI contracts", () => {
    const seeded = seedPilot001DecisionAssumptionLineage({
      tenantId: TENANT,
      workspaceId: WS,
      projectId: PROJECT,
    });
    expect(seeded.assumption.stableId).toBe("ASM-001");
    expect(seeded.assumption.value).toBe(12);
    expect(seeded.decision.stableId).toBe("DEC-001");
    expect(seeded.decision.options.length).toBe(3);
    expect(seeded.decision.status).toBe("PROPOSED");
    expect(seeded.workPackage?.stableId).toBe("WP-STR-004");

    expect(seeded.calcAssumptions.some((e) => e.target.objectStableId === "ASM-001")).toBe(true);
    expect(
      seeded.assumptionEvidence.some((e) => e.source.objectStableId === "EVD-WP-STR-004"),
    ).toBe(true);
    expect(seeded.decisionSupport.calculations.length + seeded.decisionSupport.assumptions.length).toBeGreaterThan(
      0,
    );
    expect(seeded.decisionWhy.fabricated).toBe(false);
    expect(seeded.decisionWhy.rationale).toBeNull(); // not decided yet
    expect(seeded.assumptionDependents.length).toBeGreaterThan(0);

    const dUi = buildDecisionUiContract(WS, "DEC-001");
    expect(dUi.engineeringLanguage).toBe(true);
    expect(dUi.labels).toMatchObject({ decisions: "Decisions", assumptions: "Assumptions" });
    const aUi = buildAssumptionUiContract(WS, "ASM-001");
    expect(String(aUi.displayExample)).toContain("ASM-001");
    expect(aUi.evidenceClassification).toBe("ASSUMPTION");
  });

  it("preserves guided engineering and decision intelligence authority boundary", () => {
    expect(unjustifiedRequiredFieldCount()).toBe(0);
    expect(AI_DECISION_AUTHORITY).toBe(false);
    expect(queryCalculationAssumptions(WS, "NONE")).toEqual([]);
    expect(queryAssumptionEvidence(WS, "NONE")).toEqual([]);
    expect(queryDecisionSupport(WS, "NONE").calculations).toEqual([]);
    expect(queryDecisionWhy(WS, "NONE").status).toBe("NOT_FOUND");
    expect(queryAssumptionDependents(WS, "NONE")).toEqual([]);
  });
});
