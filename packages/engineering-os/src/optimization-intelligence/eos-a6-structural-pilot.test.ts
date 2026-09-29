import { describe, expect, it } from "vitest";
import { computeParetoSet } from "./analysis";
import { isCertificationStubAdapter } from "./certification-adapter";
import { CERTIFICATION_STUB_ADAPTER_ID } from "./manifest";
import {
  assertHumanReviewMandatory,
  mapOptimizationAlternativeToDecisionReference,
  STRUCTURAL_PILOT_DECISION_HANDOFF,
  STRUCTURAL_PILOT_REVIEW_REFERENCE,
} from "./structural-pilot-handoff";
import {
  assertRealSolverAdapter,
  baselineEquilibriumExpected,
  buildStructuralPilotModel,
  containsForbiddenDesignClaim,
  containsForbiddenWinnerLanguage,
  engineerAuthorizedAlternatives,
  EOS_A6_DESIGN_CODE_COMPLIANCE,
  EOS_A6_DISPLACEMENT_LIMIT_BASIS,
  EOS_A6_SELF_WEIGHT,
  EOS_A6_STRUCTURAL_DESIGN_CHECK,
  EOS_A6_STUDY_CAPABILITY,
  evaluateBaselineEquilibrium,
  evaluatePilotDisplacementConstraint,
  failClosedSolverResult,
  FORBIDDEN_DESIGN_CLAIM_LABELS,
  FORBIDDEN_OPTIMIZATION_WINNER_LABELS,
  hashPilotModel,
  labelPilotFeasibility,
  steelMassForAlternative,
  STRUCTURAL_PILOT_BASELINE,
  STRUCTURAL_PILOT_HARD_CONSTRAINTS,
  STRUCTURAL_PILOT_OBJECTIVES,
} from "./structural-pilot";
import {
  aust300LibraryPath,
  PILOT_BASELINE_BEAM,
  PILOT_BASELINE_COLUMN,
  PILOT_BEAM_CANDIDATES,
  PILOT_COLUMN_CANDIDATES,
  readInstalledAust300Names,
  verifyPilotSectionsAgainstLibrary,
} from "./spacegass-aust300-sections";
import {
  assertExternalToolReadyForDevelopmentEvaluation,
  assertExternalToolReadyForOptimization,
  buildNotReadySpaceGassProfile,
  buildSpaceGassDiscoveryReport,
  ExternalToolGovernanceError,
  inspectSpaceGassInstallDir,
  probeSpaceGassApi,
} from "../external-tools";
import { SPACE_GASS_CATALOG_ENTRY } from "../external-tools/catalog";

describe("EOS-A6 structural optimization pilot", () => {
  it("uses the canonical Optimization Study capability without a second engine", () => {
    expect(EOS_A6_STUDY_CAPABILITY).toBe("STRUCTURAL_OPTIMIZATION_PILOT");
    expect(STRUCTURAL_PILOT_OBJECTIVES.map((row) => row.direction)).toEqual(["MINIMIZE", "MINIMIZE"]);
    expect(STRUCTURAL_PILOT_HARD_CONSTRAINTS.every((row) => row.hardness === "HARD")).toBe(true);
    expect(EOS_A6_SELF_WEIGHT).toBe("OFF");
    expect(EOS_A6_DISPLACEMENT_LIMIT_BASIS).toBe("PILOT_DEFINED");
    expect(EOS_A6_DESIGN_CODE_COMPLIANCE).toBe("NOT_ASSESSED");
    expect(EOS_A6_STRUCTURAL_DESIGN_CHECK).toBe("NOT_CERTIFIED");
  });

  it("resolves verified Aust300 section identifiers rather than colloquial compact names", () => {
    expect(PILOT_BASELINE_COLUMN).toBe("310 UC 96.8");
    expect(PILOT_BASELINE_BEAM).toBe("360 UB 44.7");
    expect(PILOT_COLUMN_CANDIDATES).toHaveLength(3);
    expect(PILOT_BEAM_CANDIDATES).toHaveLength(3);
  });

  it("re-verifies engineer-authorized sections against the installed library when present", () => {
    const trialDir = "C:\\Program Files\\SPACE GASS 14.2 (Trial)";
    const names = readInstalledAust300Names(trialDir);
    if (!names) {
      expect(aust300LibraryPath(trialDir)).toContain("LIBRARY_SECTION_Aust300.sls");
      return;
    }
    const check = verifyPilotSectionsAgainstLibrary(names);
    expect(check.missing).toEqual([]);
    expect(check.verified).toBe(true);
  });

  it("computes deterministic steel mass from verified library Name kg/m values", () => {
    const mass = steelMassForAlternative({
      columnSection: PILOT_BASELINE_COLUMN,
      beamSection: PILOT_BASELINE_BEAM,
    });
    expect(mass.status).toBe("PASS");
    if (mass.status === "PASS") {
      expect(mass.steelMassKg).toBeCloseTo(96.8 * 4 * 2 + 44.7 * 8, 6);
      expect(mass.source).toMatch(/LIBRARY_SECTION_Aust300/);
    }
    const incomplete = steelMassForAlternative({ columnSection: "310UC97", beamSection: "360UB45" });
    expect(incomplete.status).toBe("EVALUATION_INCOMPLETE");
  });

  it("builds a frozen baseline model and hashes it", () => {
    const model = STRUCTURAL_PILOT_BASELINE.model;
    expect(model.members).toHaveLength(3);
    expect(model.load.magnitude_kN_per_m).toBe(10);
    expect(model.selfWeight).toBe("OFF");
    const hash = hashPilotModel(model);
    expect(hash).toHaveLength(64);
    expect(hashPilotModel(model)).toBe(hash);
  });

  it("enumerates only engineer-authorized combinatorial alternatives", () => {
    const alts = engineerAuthorizedAlternatives();
    expect(alts).toHaveLength(9);
    expect(alts.every((row) => PILOT_COLUMN_CANDIDATES.includes(row.columnSection as (typeof PILOT_COLUMN_CANDIDATES)[number]))).toBe(true);
    expect(alts.every((row) => PILOT_BEAM_CANDIDATES.includes(row.beamSection as (typeof PILOT_BEAM_CANDIDATES)[number]))).toBe(true);
  });

  it("labels feasibility as pilot constraints, never code-compliant design", () => {
    const ok = labelPilotFeasibility(true);
    expect(ok.kind).toBe("PILOT_CONSTRAINT_FEASIBILITY");
    expect(ok.label).toBe("Pilot constraints satisfied");
    expect(ok.designCodeCompliance).toBe("NOT_ASSESSED");
    expect(containsForbiddenDesignClaim(ok.label)).toBe(false);
    for (const label of FORBIDDEN_DESIGN_CLAIM_LABELS) {
      expect(containsForbiddenDesignClaim(label)).toBe(true);
    }
    const disp = evaluatePilotDisplacementConstraint(20);
    expect(disp.passed).toBe(true);
    expect(disp.basis).toBe("PILOT_DEFINED");
    expect(evaluatePilotDisplacementConstraint(null).label).toBe("Evaluation incomplete");
  });

  it("does not auto-select a winner from Pareto-optimal rows", () => {
    const pareto = computeParetoSet(
      [
        { id: "o1", metric_key: "steel_mass_kg", direction: "MINIMIZE", unit: "kg" },
        { id: "o2", metric_key: "peak_vertical_displacement_mm", direction: "MINIMIZE", unit: "mm" },
      ],
      [
        {
          alternativeId: "a1",
          runId: "r1",
          feasible: true,
          metrics: [
            { metric_key: "steel_mass_kg", value: 1000, unit: "kg" },
            { metric_key: "peak_vertical_displacement_mm", value: 20, unit: "mm" },
          ],
        },
        {
          alternativeId: "a2",
          runId: "r2",
          feasible: true,
          metrics: [
            { metric_key: "steel_mass_kg", value: 800, unit: "kg" },
            { metric_key: "peak_vertical_displacement_mm", value: 30, unit: "mm" },
          ],
        },
      ],
    );
    expect(pareto.every((row) => row.status === "pareto-optimal" || row.status === "dominated")).toBe(true);
    expect(pareto.filter((row) => row.status === "pareto-optimal").length).toBeGreaterThan(0);
    const text = pareto.map((row) => row.status).join(" ");
    expect(containsForbiddenWinnerLanguage(text)).toBe(false);
    for (const label of FORBIDDEN_OPTIMIZATION_WINNER_LABELS) {
      expect(containsForbiddenWinnerLanguage(label)).toBe(true);
    }
  });

  it("keeps Review and Decision handoff human-governed", () => {
    expect(STRUCTURAL_PILOT_REVIEW_REFERENCE.autoApproval).toBe(false);
    expect(STRUCTURAL_PILOT_DECISION_HANDOFF.autoSelectFinalDesign).toBe(false);
    expect(assertHumanReviewMandatory().engineeringReviewApproval).toBe("NOT_CREATED");
    const mapped = mapOptimizationAlternativeToDecisionReference({
      optimizationAlternativeId: "alt-1",
      decisionId: "dec-1",
    });
    expect(mapped.selected).toBe(false);
    expect(mapped.decisionAlternativeId).toBeNull();
  });

  it("rejects the generic certification stub as real structural evidence", () => {
    expect(isCertificationStubAdapter(CERTIFICATION_STUB_ADAPTER_ID)).toBe(true);
    expect(() => assertRealSolverAdapter(CERTIFICATION_STUB_ADAPTER_ID)).toThrow(/not evidence/);
  });

  it("certifies independent 80 kN equilibrium and fail-closes otherwise", () => {
    const expected = baselineEquilibriumExpected();
    expect(expected.expectedVerticalLoad_kN).toBe(80);
    expect(expected.reactionToleranceRelative).toBe(0.005);
    expect(
      evaluateBaselineEquilibrium({
        leftVerticalReaction_kN: 40,
        rightVerticalReaction_kN: 40,
        leftHorizontalReaction_kN: 0,
        rightHorizontalReaction_kN: 0,
      }).ok,
    ).toBe(true);
    expect(
      evaluateBaselineEquilibrium({
        leftVerticalReaction_kN: 10,
        rightVerticalReaction_kN: 10,
        leftHorizontalReaction_kN: 0,
        rightHorizontalReaction_kN: 0,
      }).ok,
    ).toBe(false);
  });

  it("fail-closes solver failures without fabricated metrics or Pareto eligibility", () => {
    const codes = [
      "missing_executable",
      "expired_trial",
      "licence_unavailable",
      "automation_not_permitted",
      "api_unavailable",
      "adapter_incompatible",
      "wrong_version",
      "execution_host_unavailable",
      "invalid_section_id",
      "invalid_model",
      "invalid_units",
      "analysis_failure",
      "timeout",
      "missing_result",
      "load_case_not_analyzed",
      "malformed_result",
      "parser_failure",
      "reaction_equilibrium_failure",
      "incomplete_objective_metric",
      "foreign_workspace",
      "unauthorized_execution_host",
    ];
    for (const code of codes) {
      const result = failClosedSolverResult(code, "blocked");
      expect(result.status).toBe("failed");
      expect(result.paretoEligible).toBe(false);
      expect(result.fabricatedMetric).toBe(false);
      expect(result.feasibilityClaim).toBeNull();
    }
  });

  it("records the discovered trial honestly and does not mark development-evaluation ready", () => {
    const trial = inspectSpaceGassInstallDir("C:\\Program Files\\SPACE GASS 14.2 (Trial)");
    const apiInstall = inspectSpaceGassInstallDir("C:\\Program Files\\SPACE GASS 14.5");
    if (trial) {
      expect(trial.labelledTrial).toBe(true);
      expect(trial.executablePath).toMatch(/SGCore\.exe$/);
      expect(trial.apiExecutablePath).toBeNull();
    }
    if (apiInstall) {
      expect(apiInstall.apiExecutablePath).toMatch(/SpaceGassAPI\.exe$/);
      expect(apiInstall.labelledTrial).toBe(false);
    }
    const report = buildSpaceGassDiscoveryReport(
      [trial, apiInstall].filter((row): row is NonNullable<typeof trial> => row != null),
      probeSpaceGassApi(),
    );
    expect(report.automationPermission).toBe("REQUIRES_CONFIRMATION");
    expect(report.apiProbe.status).toBe("UNAVAILABLE");
    const profile = buildNotReadySpaceGassProfile({ tenantId: "tenant-a", discovery: report });
    expect(profile.productionUsePermitted).toBe(false);
    expect(profile.developmentEvaluationReadiness).toBe("NOT_READY_FOR_DEVELOPMENT_EVALUATION");
    expect(profile.readiness).not.toBe("READY");
    expect(() => assertExternalToolReadyForOptimization({
      profile,
      assignment: {
        id: "as-1",
        tenantId: "tenant-a",
        workspaceId: "ws-a",
        projectId: null,
        profileId: profile.id,
        allowed: true,
        permittedCapabilities: ["OPTIMIZATION_EXECUTION"],
        designStandard: "AS 4100",
        unitSystem: "SI",
        analysisProfile: "linear_elastic_static",
        createdAt: "t0",
        updatedAt: "t0",
      },
      workspaceId: "ws-a",
    })).toThrow(ExternalToolGovernanceError);
    expect(() => assertExternalToolReadyForDevelopmentEvaluation(profile)).toThrow(ExternalToolGovernanceError);
  });

  it("keeps 14.5 outside the currently certified adapter range", () => {
    expect(SPACE_GASS_CATALOG_ENTRY.compatibleToolVersions).toContain("14.2");
    expect(SPACE_GASS_CATALOG_ENTRY.compatibleToolVersions).not.toContain("14.5");
  });

  it("does not invent a DESIGN_CHECK capability certification", () => {
    const design = SPACE_GASS_CATALOG_ENTRY.capabilities.find((cap) => cap.key === "DESIGN_CHECK");
    expect(design?.certification).toBe("UNSUPPORTED");
  });

  it("reproduces identical model hashes for the same alternative", () => {
    const first = buildStructuralPilotModel({ columnSection: "250 UC 72.9", beamSection: "360 UB 44.7" });
    const second = buildStructuralPilotModel({ columnSection: "250 UC 72.9", beamSection: "360 UB 44.7" });
    expect(hashPilotModel(first)).toBe(hashPilotModel(second));
  });
});
