import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  AI_ENGINEERING_APPROVAL,
  AI_SECTION_SELECTION_EQUALS_APPROVAL,
  AU6_AUTOMATIC_APPROVAL,
  AU_MEMBER_PILOT_EXPOSURE,
  AU_STEEL_IMPLEMENTATION_MATURITY,
  AU_STEEL_PACK_CERTIFIED,
  AU_STEEL_STANDARD_CONFORMANCE_STATE,
  AU_STEEL_UNKNOWN_STANDARD_TOKEN,
  CHECK_RESULT_EQUALS_ENGINEERING_APPROVAL,
  DEFAULT_DEFLECTION_LIMIT_GUESSED,
  GENERAL_FEA_CAPABILITY_CLAIMED,
  MEMBER_CHECK_EQUALS_CONNECTION_CHECK,
  MEMBER_CHECK_EQUALS_FOUNDATION_APPROVAL,
  SPAN_RATIO_DENOMINATOR_GUESSED,
  UNIVERSAL_MEMBER_UTILIZATION,
  VIBRATION_DESIGN_IMPLEMENTED,
  type SteelCapacityEngineInput,
  type SteelDesignContext,
  type SteelMaterialDesignProperties,
  type SteelMemberDesignCheckRow,
  type SteelSectionDesignProperties,
  type SteelServiceabilityContext,
  type SteelStabilityContext,
} from "@rtb/types";
import { disciplineMaturity } from "../discipline-capability";
import { isGlobalFirstArchitecture } from "../global-governance";
import { createConfiguredKnowledgeContext, exampleEurocodeAnnex } from "../structural-domain/binding";
import { governedProvenance } from "../structural-domain/catalog";
import { A15A_V5_FEATURE_FREEZE } from "../work-generator/structural/freeze";
import {
  aggregateEngineeringCheckState,
  assertAiCannotApprove,
  assertCandidateFullMemberRecheck,
  AU_MEMBER_UNSUPPORTED_METHODS,
  createAuSteelStandardProfile,
  D1D_AU6_D0_RISK_DISPOSITION,
  detectRequiredInteractions,
  evaluateSteelCapacity,
  explainMemberDesign,
  IMPLEMENTED_INTERACTION_METHODS,
  orchestrateAuBendingDesignCheck,
  orchestrateAuCombinedActionDesignCheck,
  orchestrateAuCompressionDesignCheck,
  orchestrateAuShearDesignCheck,
  orchestrateAuSteelMemberDesign,
  orchestrateAuTensionDesignCheck,
  requestDefaultDeflectionLimit,
  requestGuessedSpanRatioDenominator,
  requestVibrationDesign,
  STEEL_ADAPTER_BOUNDARIES,
} from "./index";

const auProfile = createAuSteelStandardProfile({ contextId: "ctx-au-member-au6" });

function demand(patch: Partial<SteelCapacityEngineInput["demand"]> = {}): SteelCapacityEngineInput["demand"] {
  return {
    resultId: "demand-au6-uls",
    memberId: "m-au6",
    shear: { value: 0, unit: "N", locationM: 2, signed: 0 },
    moment: { value: 0, unit: "N.m", locationM: 4, signed: 0 },
    axial: { valueN: 1_000_000, unit: "N", method: "AXIAL_DIRECT" },
    deflection: { status: "NOT_IMPLEMENTED", reason: "ULS demand is not a serviceability demand" },
    capacityPresent: false,
    standardContext: auProfile,
    inputEvidenceRefs: [{ evidenceId: "ev-d1c", sourceKind: "calculation", reference: "d1c-uls" }],
    combinationId: "comb-uls",
    ...patch,
  };
}

function slsDemand(): SteelCapacityEngineInput["demand"] {
  return {
    resultId: "demand-au6-sls",
    memberId: "m-au6",
    shear: { value: 0, unit: "N", locationM: 2, signed: 0 },
    moment: { value: 0, unit: "N.m", locationM: 4, signed: 0 },
    axial: { valueN: 0, unit: "N", method: "AXIAL_DIRECT" },
    deflection: { value: 0.02, unit: "m", locationM: 4, signed: 0.02 },
    capacityPresent: false,
    standardContext: auProfile,
    inputEvidenceRefs: [{ evidenceId: "ev-d1c-sls", sourceKind: "calculation", reference: "d1c-sls" }],
    combinationId: "comb-sls",
  };
}

function material(): SteelMaterialDesignProperties {
  return {
    materialRef: "mat-au6",
    grade: "300PLUS",
    yieldStrength: { name: "fy", value: 300, unit: "MPa", provenanceRef: "mill-cert", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE" },
    ultimateStrength: { name: "fu", value: 440, unit: "MPa", provenanceRef: "mill-cert", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE" },
    elasticModulus: { name: "E", value: 200, unit: "GPa", provenanceRef: "mill-cert", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE" },
    shearModulus: { name: "G", value: 80, unit: "GPa", provenanceRef: "mill-cert", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE" },
    poissonRatio: null,
    density: null,
    thicknessDependentMetadata: null,
    jurisdictionApplicability: ["australia"],
  };
}

function section(): SteelSectionDesignProperties {
  return {
    sectionRef: "sec-au6",
    sectionFamily: "UB",
    catalogSource: "AUST300",
    catalogVersion: "LIBRARY_SECTION_Aust300.sls",
    jurisdictionApplicability: ["australia"],
    area: { name: "Ag", value: 5140, unit: "mm2", provenanceRef: "engineer-section-props", sourceAuthority: "OTHER_GOVERNED_SOURCE" },
    Iyy: { name: "Iyy", value: 222_000_000, unit: "mm4", provenanceRef: "engineer-section-props", sourceAuthority: "OTHER_GOVERNED_SOURCE" },
    Izz: { name: "Izz", value: 23_000_000, unit: "mm4", provenanceRef: "engineer-section-props", sourceAuthority: "OTHER_GOVERNED_SOURCE" },
    sectionModulusYy: { name: "Zyy", value: 1_000_000, unit: "mm3", provenanceRef: "engineer-section-props", sourceAuthority: "OTHER_GOVERNED_SOURCE" },
    sectionModulusZz: { name: "Zzz", value: 200_000, unit: "mm3", provenanceRef: "engineer-section-props", sourceAuthority: "OTHER_GOVERNED_SOURCE" },
    plasticModulusYy: null,
    plasticModulusZz: null,
    torsionConstant: { name: "J", value: 500_000, unit: "mm4", provenanceRef: "engineer-section-props", sourceAuthority: "OTHER_GOVERNED_SOURCE" },
    warpingConstant: { name: "Iw", value: 200_000_000_000, unit: "mm6", provenanceRef: "engineer-section-props", sourceAuthority: "OTHER_GOVERNED_SOURCE" },
    radiusOfGyrationYy: null,
    radiusOfGyrationZz: null,
    netArea: { name: "An", value: 4500, unit: "mm2", provenanceRef: "engineer-net-area", sourceAuthority: "OTHER_GOVERNED_SOURCE" },
    shearArea: { name: "Av", value: 5_000, unit: "mm2", provenanceRef: "engineer-shear-area", sourceAuthority: "OTHER_GOVERNED_SOURCE" },
    geometricDimensions: {},
  };
}

function stability(): SteelStabilityContext {
  return {
    stabilityContextId: "stab-au6",
    memberLengthM: 8,
    effectiveLengthM: 8,
    unbracedLengthM: 8,
    restraintDescription: "pinned ends, explicit Le supplied",
    bucklingAxis: "BOTH",
    momentGradientRef: "uniform-moment",
    torsionalRestraint: "fork-supports",
    lateralRestraint: "discrete-end-flange",
    sourceEvidenceRef: "engineer-effective-length",
    derived: false,
    effectiveLengthMajorM: 8,
    effectiveLengthMinorM: 8,
    effectiveLengthProvenanceRef: "engineer-effective-length",
    unbracedLengthProvenanceRef: "engineer-unbraced-length",
    warpingRestraint: "fork-supports",
    momentDistributionDescription: "uniform-moment",
    loadApplicationPosition: "shear-centre",
  };
}

function designContext(demandId = "demand-au6-uls"): SteelDesignContext {
  return {
    designContextId: "dc-au6",
    memberRef: "m-au6",
    sectionRef: "sec-au6",
    materialRef: "mat-au6",
    demandRefs: [demandId],
    standardContextRef: auProfile.contextId,
    parameterSetRef: null,
    effectiveLengthContextRef: "stab-au6",
    restraintContextRef: "stab-au6",
    stabilityContextRef: "stab-au6",
    fabricationContextRef: null,
    evidenceRefs: [{ evidenceId: "ev-eng", sourceKind: "human_input", reference: "engineer" }],
    toolRef: "EOS_AU_STEEL_MEMBER_DESIGN",
    methodRef: "AU_MEMBER",
    provenanceRef: governedProvenance({ jurisdiction: "australia", standard: "AS 4100", calculationMethod: "AU_MEMBER" }),
    validationState: "FRAMEWORK_ONLY",
    reviewState: "required",
  };
}

function capacityInput(patch: Partial<SteelCapacityEngineInput> = {}): SteelCapacityEngineInput {
  return {
    adapterId: "AU_STEEL",
    designContext: designContext(),
    standardContext: auProfile,
    material: material(),
    section: section(),
    stability: null,
    demand: demand(),
    limitState: "TENSION",
    requiredProperties: [],
    ...patch,
  };
}

function criterion(patch: Partial<SteelServiceabilityContext> = {}): SteelServiceabilityContext {
  return {
    memberRef: "m-au6",
    serviceabilityDemandRef: "demand-au6-sls",
    criterionRef: "proj-defl-25mm",
    criterionType: "ABSOLUTE_DISPLACEMENT",
    criterionValue: 25,
    criterionUnits: "mm",
    criterionSource: "PROJECT_REQUIREMENT",
    loadCaseOrCombinationRef: "comb-sls",
    projectRequirementRef: "PR-SLS-1",
    standardProfileRef: auProfile.contextId,
    evidenceRef: "ev-sls",
    provenanceRef: governedProvenance({ jurisdiction: "australia", standard: "AS 4100", calculationMethod: "AU_SLS" }),
    validationState: "HUMAN_CONFIRMED_RULE",
    spanM: 8,
    ...patch,
  };
}

function memberInput(patch: Parameters<typeof orchestrateAuSteelMemberDesign>[0] extends infer T ? Partial<T> : never = {}) {
  return {
    designRecordId: "rec-au6",
    createdAt: "2026-10-06T00:00:00.000Z",
    version: 1,
    capacityInput: capacityInput(),
    ...patch,
  };
}

function satisfiedRow(kind: SteelMemberDesignCheckRow["checkKind"]): SteelMemberDesignCheckRow {
  return {
    checkKind: kind,
    applicable: true,
    state: "CHECK_SATISFIED",
    completeness: "COMPLETE",
    incompleteReason: null,
    checkRef: kind,
    utilization: 0.4,
    utilizationComparable: true,
    reportLanguage: "deterministic check satisfied",
    methodMaturity: "BENCHMARKED",
  };
}

describe("EOS-D1D-AU-6 Australian steel member design orchestration", () => {
  it("orchestrates single-action tension, compression, bending, and shear members", () => {
    const tension = orchestrateAuSteelMemberDesign(memberInput());
    expect(tension.applicableCheckRegistry).toEqual(["TENSION"]);
    expect(tension.completenessMatrix.find((row) => row.checkKind === "TENSION")?.state).toBe("CHECK_SATISFIED");
    expect(tension.engineeringCheckState).toBe("CHECK_SATISFIED");
    expect(tension.approvalState).toBe("not_approved");
    expect(tension.humanReviewState).toBe("NOT_REVIEWED");
    expect(CHECK_RESULT_EQUALS_ENGINEERING_APPROVAL).toBe(false);

    const compression = orchestrateAuSteelMemberDesign(memberInput({
      capacityInput: capacityInput({
        demand: demand({ axial: { valueN: -400_000, unit: "N", method: "AXIAL_DIRECT" } }),
        stability: stability(),
        limitState: "COMPRESSION",
      }),
    }));
    expect(compression.applicableCheckRegistry).toEqual(expect.arrayContaining(["COMPRESSION", "STABILITY_COMPRESSION"]));
    expect(compression.engineeringCheckState).toBe("CHECK_UNDETERMINED");

    const bending = orchestrateAuSteelMemberDesign(memberInput({
      capacityInput: capacityInput({
        demand: demand({
          axial: { valueN: 0, unit: "N", method: "AXIAL_DIRECT" },
          moment: { value: 100_000, unit: "N.m", locationM: 4, signed: 100_000 },
        }),
        stability: stability(),
        limitState: "BENDING_MAJOR",
      }),
    }));
    expect(bending.applicableCheckRegistry).toEqual(expect.arrayContaining(["BENDING_MAJOR", "STABILITY_LTB"]));
    expect(bending.engineeringCheckState).toBe("CHECK_UNDETERMINED");

    const shear = orchestrateAuSteelMemberDesign(memberInput({
      capacityInput: capacityInput({
        demand: demand({
          axial: { valueN: 0, unit: "N", method: "AXIAL_DIRECT" },
          shear: { value: 400_000, unit: "N", locationM: 2, signed: 400_000 },
        }),
        shear: { shearAxis: "MAJOR_SHEAR", stiffenerState: "UNSTIFFENED", shearBucklingCoefficient: null, stiffenerSpacing: null },
        limitState: "SHEAR_MAJOR",
      }),
    }));
    expect(shear.applicableCheckRegistry).toEqual(["SHEAR_MAJOR"]);
    expect(shear.engineeringCheckState).toBe("CHECK_UNDETERMINED");
  });

  it("requires interaction for multiple actions and does not let component checks pass the member", () => {
    const multi = orchestrateAuSteelMemberDesign(memberInput({
      capacityInput: capacityInput({
        demand: demand({ moment: { value: 100_000, unit: "N.m", locationM: 4, signed: 100_000 } }),
        stability: stability(),
      }),
    }));
    expect(detectRequiredInteractions(multi.optimizationHandoff ? capacityInput({
      demand: demand({ moment: { value: 100_000, unit: "N.m", locationM: 4, signed: 100_000 } }),
    }) : capacityInput())).toContain("TENSION_BENDING");
    expect(multi.applicableCheckRegistry).toEqual(expect.arrayContaining(["TENSION", "BENDING_MAJOR", "COMBINED_ACTION"]));
    expect(multi.completenessMatrix.find((row) => row.checkKind === "TENSION")?.state).toBe("CHECK_SATISFIED");
    expect(multi.completenessMatrix.find((row) => row.checkKind === "COMBINED_ACTION")?.state).toBe("CHECK_UNDETERMINED");
    expect(multi.completenessMatrix.find((row) => row.checkKind === "COMBINED_ACTION")?.completeness).toBe("INCOMPLETE_INTERACTION");
    expect(multi.engineeringCheckState).toBe("CHECK_UNDETERMINED");
    expect(IMPLEMENTED_INTERACTION_METHODS).toEqual([]);

    const synthetic = aggregateEngineeringCheckState([
      satisfiedRow("TENSION"),
      satisfiedRow("BENDING_MAJOR"),
      {
        ...satisfiedRow("COMBINED_ACTION"),
        state: "CHECK_UNDETERMINED",
        completeness: "INCOMPLETE_INTERACTION",
        incompleteReason: "INTERACTION_RULE_VALIDATION_REQUIRED",
        utilization: null,
        utilizationComparable: false,
      },
    ]);
    expect(synthetic).toBe("CHECK_UNDETERMINED");
  });

  it("propagates failed checks, satisfied tension-only checks, and never treats satisfaction as approval", () => {
    const failed = orchestrateAuSteelMemberDesign(memberInput({
      capacityInput: capacityInput({ demand: demand({ axial: { valueN: 2_000_000, unit: "N", method: "AXIAL_DIRECT" } }) }),
    }));
    expect(failed.engineeringCheckState).toBe("CHECK_NOT_SATISFIED");
    expect(failed.governingCheckKind).toBe("TENSION");
    const passed = orchestrateAuSteelMemberDesign(memberInput());
    expect(passed.engineeringCheckState).toBe("CHECK_SATISFIED");
    expect(passed.approvalState).toBe("not_approved");
    expect(passed.as4100CompliantClaim).toBe(false);
    expect(AU6_AUTOMATIC_APPROVAL).toBe(false);
    expect(AI_ENGINEERING_APPROVAL).toBe(false);
  });

  it("reuses D1C deflection, accepts governed criteria, and fails closed without a criterion or guessed L/n", () => {
    const sls = slsDemand();
    const withLimit = orchestrateAuSteelMemberDesign(memberInput({
      serviceability: { context: criterion(), demand: sls },
    }));
    expect(withLimit.serviceabilityResult?.demandRef).toBe("demand-au6-sls");
    expect(withLimit.serviceabilityResult?.loadContextRef).toBe("comb-sls");
    expect(withLimit.serviceabilityResult?.checkState).toBe("CHECK_SATISFIED");
    expect(withLimit.serviceabilityResult?.ratio).toBeCloseTo(0.02 / 0.025, 8);
    expect(withLimit.demandSetRef).toBe("demand-au6-uls");
    expect(withLimit.loadCombinationRefs).toEqual(expect.arrayContaining(["comb-uls", "comb-sls"]));

    const missing = orchestrateAuSteelMemberDesign(memberInput({
      serviceability: {
        context: criterion({ criterionRef: null, criterionType: null, criterionValue: null, criterionUnits: null, criterionSource: null }),
        demand: sls,
      },
    }));
    expect(missing.completenessMatrix.find((row) => row.checkKind === "DEFLECTION")?.state).toBe("CHECK_UNDETERMINED");
    expect(missing.serviceabilityResult?.reason).toBe("SERVICEABILITY_CRITERION_REQUIRED");
    expect(missing.engineeringCheckState).toBe("CHECK_UNDETERMINED");

    const span = orchestrateAuSteelMemberDesign(memberInput({
      serviceability: {
        context: criterion({ criterionType: "SPAN_RATIO", criterionValue: 400, criterionUnits: "1", criterionRef: "proj-L400" }),
        demand: sls,
      },
    }));
    expect(span.serviceabilityResult?.allowableValue).toBeCloseTo(8 / 400, 10);
    expect(DEFAULT_DEFLECTION_LIMIT_GUESSED).toBe(false);
    expect(SPAN_RATIO_DENOMINATOR_GUESSED).toBe(false);
    expect(() => requestDefaultDeflectionLimit()).toThrow(/unknown required code parameter/);
    expect(() => requestGuessedSpanRatioDenominator()).toThrow(/unknown required code parameter/);
  });

  it("invalidates stale fingerprints and does not collapse component utilizations", () => {
    const first = orchestrateAuSteelMemberDesign(memberInput());
    expect(() => orchestrateAuSteelMemberDesign(memberInput({
      capacityInput: capacityInput({ section: { ...section(), sectionRef: "sec-changed" } }),
      previousFingerprint: first.fingerprint,
      reuseStaleResults: true,
    }))).toThrow(/stale result/);
    const loadChange = orchestrateAuSteelMemberDesign(memberInput({
      capacityInput: capacityInput({ demand: demand({ resultId: "demand-changed" }), designContext: designContext("demand-changed") }),
      previousFingerprint: first.fingerprint,
    }));
    expect(loadChange.invalidationTags).toContain("LOAD_CHANGED");
    const standardChange = orchestrateAuSteelMemberDesign(memberInput({
      capacityInput: capacityInput({
        standardContext: createAuSteelStandardProfile({ contextId: "ctx-au-member-au6-b" }),
        designContext: { ...designContext(), standardContextRef: "ctx-au-member-au6-b" },
      }),
      previousFingerprint: first.fingerprint,
    }));
    expect(standardChange.invalidationTags).toContain("STANDARD_PROFILE_CHANGED");
    expect(UNIVERSAL_MEMBER_UTILIZATION).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(first, "overallUtilization")).toBe(false);
    expect(first.optimizationHandoff.optimizationImplemented).toBe(false);
  });

  it("keeps method-not-implemented distinct from not-applicable and preserves boundaries, AI, and AU-1 through AU-5", () => {
    const other = orchestrateAuSteelMemberDesign(memberInput({ otherServiceabilityModes: ["VIBRATION"] }));
    expect(other.completenessMatrix.find((row) => row.checkKind === "OTHER_SERVICEABILITY")?.incompleteReason).toBe("METHOD_NOT_IMPLEMENTED");
    expect(other.completenessMatrix.find((row) => row.checkKind === "SHEAR_MAJOR")?.incompleteReason).toBe("NOT_APPLICABLE");
    expect(other.connectionDesignInScope).toBe(false);
    expect(other.foundationAdequacyInScope).toBe(false);
    expect(MEMBER_CHECK_EQUALS_CONNECTION_CHECK).toBe(false);
    expect(MEMBER_CHECK_EQUALS_FOUNDATION_APPROVAL).toBe(false);
    expect(GENERAL_FEA_CAPABILITY_CLAIMED).toBe(false);
    expect(AU_STEEL_PACK_CERTIFIED).toBe(false);
    expect(AU_STEEL_STANDARD_CONFORMANCE_STATE).toBe("INTENDED_PROFILE");
    expect(AU_STEEL_IMPLEMENTATION_MATURITY).toBe("PARTIAL_METHODS_BENCHMARKED");
    expect(auProfile.edition).toBe(AU_STEEL_UNKNOWN_STANDARD_TOKEN);
    expect(A15A_V5_FEATURE_FREEZE.spaceGassRealSolverExecution).toBe("NOT_CERTIFIED");
    expect(AU_MEMBER_PILOT_EXPOSURE).toBe(false);
    expect(AU_MEMBER_UNSUPPORTED_METHODS.VIBRATION).toBe(false);
    expect(() => requestVibrationDesign()).toThrow(/unknown required code parameter/);
    expect(() => assertAiCannotApprove("AI", "approved")).toThrow(/AI cannot promote result to approval/);
    expect(AI_SECTION_SELECTION_EQUALS_APPROVAL).toBe(false);
    expect(() => assertCandidateFullMemberRecheck({
      candidateSectionRef: "sec-opt",
      proposedBy: "AI",
      deterministicRecheckRequired: true,
      rechecked: true,
      memberCheckState: "CHECK_UNDETERMINED",
    })).toThrow(/undetermined/);
    const explained = explainMemberDesign(other);
    expect(explained.advisoryOnly).toBe(true);
    expect(explained.text).toMatch(/human engineering review required|member check incomplete|interaction validation required/);

    const tension = orchestrateAuTensionDesignCheck({
      designCheckId: "chk-t-reg",
      designContext: designContext("demand-au1-reg"),
      capacityInput: capacityInput({ demand: demand({ resultId: "demand-au1-reg" }), designContext: designContext("demand-au1-reg") }),
    });
    expect(tension.verdict).toBe("CHECK_SATISFIED");
    const compression = orchestrateAuCompressionDesignCheck({
      designCheckId: "chk-c-reg",
      designContext: designContext("demand-au2-reg"),
      capacityInput: capacityInput({
        limitState: "COMPRESSION",
        demand: demand({ resultId: "demand-au2-reg", axial: { valueN: -400_000, unit: "N", method: "AXIAL_DIRECT" } }),
        designContext: designContext("demand-au2-reg"),
        stability: stability(),
      }),
    });
    expect(compression.verdict).toBe("CHECK_UNDETERMINED");
    const bending = orchestrateAuBendingDesignCheck({
      designCheckId: "chk-b-reg",
      designContext: designContext("demand-au3-reg"),
      capacityInput: capacityInput({
        limitState: "BENDING_MAJOR",
        demand: demand({ resultId: "demand-au3-reg", axial: { valueN: 0, unit: "N", method: "AXIAL_DIRECT" }, moment: { value: 100_000, unit: "N.m", locationM: 4, signed: 100_000 } }),
        designContext: designContext("demand-au3-reg"),
        stability: stability(),
      }),
    });
    expect(bending.verdict).toBe("CHECK_UNDETERMINED");
    const shear = orchestrateAuShearDesignCheck({
      designCheckId: "chk-s-reg",
      designContext: designContext("demand-au4-reg"),
      capacityInput: capacityInput({
        limitState: "SHEAR_MAJOR",
        demand: demand({ resultId: "demand-au4-reg", axial: { valueN: 0, unit: "N", method: "AXIAL_DIRECT" }, shear: { value: 400_000, unit: "N", locationM: 2, signed: 400_000 } }),
        designContext: designContext("demand-au4-reg"),
        shear: { shearAxis: "MAJOR_SHEAR", stiffenerState: "UNSTIFFENED", shearBucklingCoefficient: null, stiffenerSpacing: null },
      }),
    });
    expect(shear.verdict).toBe("CHECK_UNDETERMINED");
    const combined = orchestrateAuCombinedActionDesignCheck({
      designCheckId: "chk-i-reg",
      designContext: designContext("demand-au5-reg"),
      capacityInput: capacityInput({
        limitState: "COMBINED_ACTION",
        demand: demand({ resultId: "demand-au5-reg", moment: { value: 100_000, unit: "N.m", locationM: 4, signed: 100_000 } }),
        designContext: designContext("demand-au5-reg"),
      }),
    });
    expect(combined.verdict).toBe("CHECK_UNDETERMINED");
    const adapterSrc = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "adapters.ts"), "utf8");
    expect(adapterSrc).not.toMatch(/L \/ 250|orchestrateAuSteelMemberDesign|spanM \/ n/);
    const globalCore = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "properties.ts"), "utf8");
    expect(globalCore).not.toMatch(/AU_MEMBER_|SERVICEABILITY_CRITERION/);
    const eu = {
      ...createConfiguredKnowledgeContext({
        contextId: "ctx-en1993-au6",
        jurisdictionProfileRef: "eu-eea",
        standardFamily: "EN",
        standardCode: "EN 1993-1-1",
        edition: "2005",
        materialScope: "steel",
      }),
      nationalAnnexRef: exampleEurocodeAnnex("EN 1993-1-1", "2005"),
    };
    expect(evaluateSteelCapacity(capacityInput({
      adapterId: "EU_STEEL",
      limitState: "SERVICEABILITY",
      standardContext: eu,
      designContext: { ...designContext(), standardContextRef: eu.contextId },
      requiredProperties: [],
    })).implemented).toBe(false);
    expect(STEEL_ADAPTER_BOUNDARIES.EU_STEEL.implemented).toBe(false);
    expect(STEEL_ADAPTER_BOUNDARIES.US_STEEL.implemented).toBe(false);
    expect(D1D_AU6_D0_RISK_DISPOSITION.CLOSED).toEqual([]);
    expect(isGlobalFirstArchitecture()).toBe(true);
    expect(disciplineMaturity("structural")).toBe("REFERENCE_PARTIALLY_IMPLEMENTED");
    expect(VIBRATION_DESIGN_IMPLEMENTED).toBe(false);
  });
});
