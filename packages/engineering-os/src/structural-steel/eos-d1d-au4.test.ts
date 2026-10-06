import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  AI_ENGINEERING_APPROVAL,
  AI_SHEAR_ASSISTANCE_ADVISORY_ONLY,
  AI_STANDARD_CONFORMANCE_AUTHORITY,
  AU_SHEAR_PILOT_EXPOSURE,
  AU_STEEL_UNKNOWN_STANDARD_TOKEN,
  BENDING_SHEAR_INTERACTION_IMPLEMENTED,
  CHECK_RESULT_EQUALS_ENGINEERING_APPROVAL,
  CONNECTION_SHEAR_DESIGN_IMPLEMENTED,
  ELASTIC_SHEAR_BUCKLING_EQUALS_CODE_CAPACITY,
  INTERACTION_REVIEW_REQUIRED,
  LLM_MEMORY_ONLY_RULE_ALLOWED,
  LLM_SHEAR_CAPACITY_AUTHORITY,
  LLM_STEEL_CAPACITY_AUTHORITY,
  MECHANICS_REFERENCE_EQUALS_CODE_CAPACITY,
  OPTIMIZATION_SHEAR_RECHECK_REQUIRED,
  SILENT_SHEAR_AREA_ASSUMPTION,
  TENSION_FIELD_ACTION_IMPLEMENTED,
  WEB_SLENDERNESS_LIMIT_GUESSED,
  type SteelCapacityEngineInput,
  type SteelDesignContext,
  type SteelMaterialDesignProperties,
  type SteelSectionDesignProperties,
  type SteelShearInputContext,
  type SteelStabilityContext,
} from "@rtb/types";
import { disciplineMaturity } from "../discipline-capability";
import { isGlobalFirstArchitecture } from "../global-governance";
import { createConfiguredKnowledgeContext, exampleEurocodeAnnex } from "../structural-domain/binding";
import { governedProvenance } from "../structural-domain/catalog";
import {
  assertAiCannotInventShear,
  assertEngineeringRuleAuthority,
  assertLlmCannotOriginateCapacity,
  assertOptimizationShearRecheck,
  AU_SECTION_SHEAR_METHOD_REGISTRY,
  AU_SHEAR_METHOD_CATALOG,
  AU_SHEAR_METHOD_REGISTRY,
  AU_SHEAR_UNSUPPORTED_METHODS,
  consumeDemandHandoff,
  createAuSteelStandardProfile,
  D1D_AU4_D0_RISK_DISPOSITION,
  evaluateSteelCapacity,
  orchestrateAuBendingDesignCheck,
  orchestrateAuCompressionDesignCheck,
  orchestrateAuShearDesignCheck,
  orchestrateAuTensionDesignCheck,
  requestAuBendingShearInteraction,
  requestAuCodeProfileShear,
  requestAuConnectionShear,
  requestAuTensionFieldAction,
  requestAuWebSlendernessLimit,
  scoreShearBenchmark,
  STEEL_ADAPTER_BOUNDARIES,
  toAuShearContext,
} from "./index";

const auProfile = createAuSteelStandardProfile({ contextId: "ctx-au-shear-au4" });

function shearDemand(valueN = 400_000, patch: Partial<SteelCapacityEngineInput["demand"]> = {}): SteelCapacityEngineInput["demand"] {
  return {
    resultId: "demand-au4",
    memberId: "m-au4",
    shear: { value: valueN, unit: "N", locationM: 2, signed: valueN },
    moment: { value: 100_000, unit: "N.m", locationM: 4, signed: 100_000 },
    axial: { valueN: 0, unit: "N", method: "AXIAL_DIRECT" },
    deflection: { status: "NOT_IMPLEMENTED", reason: "D1C deflection handoff" },
    capacityPresent: false,
    standardContext: auProfile,
    inputEvidenceRefs: [{ evidenceId: "ev-d1c", sourceKind: "calculation", reference: "d1c-shear" }],
    combinationId: "comb-au4",
    ...patch,
  };
}

function material(patch: Partial<SteelMaterialDesignProperties> = {}): SteelMaterialDesignProperties {
  return {
    materialRef: "mat-au4",
    grade: "300PLUS",
    yieldStrength: { name: "fy", value: 300, unit: "MPa", provenanceRef: "mill-cert", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE" },
    ultimateStrength: { name: "fu", value: 440, unit: "MPa", provenanceRef: "mill-cert", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE" },
    elasticModulus: { name: "E", value: 200, unit: "GPa", provenanceRef: "mill-cert", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE" },
    shearModulus: { name: "G", value: 80, unit: "GPa", provenanceRef: "mill-cert", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE" },
    poissonRatio: { name: "nu", value: 0.3, unit: "1", provenanceRef: "mill-cert", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE" },
    density: null,
    thicknessDependentMetadata: "thickness-dependent fy metadata governed by mill cert",
    jurisdictionApplicability: ["australia"],
    ...patch,
  };
}

function section(patch: Partial<SteelSectionDesignProperties> = {}): SteelSectionDesignProperties {
  return {
    sectionRef: "sec-au4",
    sectionFamily: "UB",
    catalogSource: "AUST300",
    catalogVersion: "LIBRARY_SECTION_Aust300.sls",
    jurisdictionApplicability: ["australia"],
    area: { name: "Ag", value: 5140, unit: "mm2", provenanceRef: "engineer-section-props", sourceAuthority: "OTHER_GOVERNED_SOURCE" },
    Iyy: { name: "Iyy", value: 100_000_000, unit: "mm4", provenanceRef: "engineer-section-props", sourceAuthority: "OTHER_GOVERNED_SOURCE" },
    Izz: { name: "Izz", value: 20_000_000, unit: "mm4", provenanceRef: "engineer-section-props", sourceAuthority: "OTHER_GOVERNED_SOURCE" },
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
    webDepth: { name: "d", value: 300, unit: "mm", provenanceRef: "engineer-web-geometry", sourceAuthority: "OTHER_GOVERNED_SOURCE" },
    webThickness: { name: "tw", value: 8, unit: "mm", provenanceRef: "engineer-web-geometry", sourceAuthority: "OTHER_GOVERNED_SOURCE" },
    geometricDimensions: {},
    ...patch,
  };
}

function shearContext(patch: Partial<SteelShearInputContext> = {}): SteelShearInputContext {
  return {
    shearAxis: "MAJOR_SHEAR",
    stiffenerState: "UNSTIFFENED",
    shearBucklingCoefficient: { name: "kv", value: 5.34, unit: "1", provenanceRef: "engineer-plate-buckling-kv", sourceAuthority: "VALIDATED_INTERNAL_ENGINEERING_RULE" },
    stiffenerSpacing: null,
    ...patch,
  };
}

function yieldOnlySection(patch: Partial<SteelSectionDesignProperties> = {}): SteelSectionDesignProperties {
  return section({ webDepth: undefined, webThickness: undefined, ...patch });
}

function yieldOnlyMaterial(patch: Partial<SteelMaterialDesignProperties> = {}): SteelMaterialDesignProperties {
  return material({ poissonRatio: null, ...patch });
}

function yieldOnlyShear(): SteelShearInputContext {
  return shearContext({ shearBucklingCoefficient: null, stiffenerSpacing: null });
}

function bendingStability(): SteelStabilityContext {
  return {
    stabilityContextId: "stab-au4-b",
    memberLengthM: 8,
    effectiveLengthM: null,
    unbracedLengthM: 8,
    restraintDescription: "supports are not LTB restraints",
    bucklingAxis: "MAJOR",
    momentGradientRef: null,
    torsionalRestraint: "end-fork",
    lateralRestraint: "discrete-end-flange",
    sourceEvidenceRef: "engineer-unbraced-length",
    derived: false,
    unbracedLengthProvenanceRef: "engineer-unbraced-length",
    warpingRestraint: "fork-supports",
    momentDistributionDescription: "uniform-moment",
    loadApplicationPosition: "shear-centre",
  };
}

function designContext(): SteelDesignContext {
  return {
    designContextId: "dc-au4",
    memberRef: "m-au4",
    sectionRef: "sec-au4",
    materialRef: "mat-au4",
    demandRefs: ["demand-au4"],
    standardContextRef: auProfile.contextId,
    parameterSetRef: null,
    effectiveLengthContextRef: null,
    restraintContextRef: "shear-au4",
    stabilityContextRef: null,
    fabricationContextRef: null,
    evidenceRefs: [{ evidenceId: "ev-eng", sourceKind: "human_input", reference: "engineer" }],
    toolRef: "EOS_AU_STEEL_SHEAR",
    methodRef: "AU_SHEAR",
    provenanceRef: governedProvenance({ jurisdiction: "australia", standard: "AS 4100", calculationMethod: "AU_SHEAR" }),
    validationState: "BENCHMARKED",
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
    demand: shearDemand(),
    limitState: "SHEAR_MAJOR",
    requiredProperties: [],
    shear: shearContext(),
    ...patch,
  };
}

function independentYieldN(avMm2 = 5_000): number {
  return (300 * avMm2) / Math.sqrt(3);
}

function independentBucklingN(): number {
  const EPa = 200e9;
  const nu = 0.3;
  const kv = 5.34;
  const d = 0.3;
  const t = 0.008;
  const Av = 0.005;
  const sl = d / t;
  return ((kv * Math.PI * Math.PI * EPa) / (12 * (1 - nu * nu) * sl * sl)) * Av;
}

describe("EOS-D1D-AU-4 Australian steel shear", () => {
  it("reuses D1C shear demand for major and minor axes without recalculating demand", () => {
    const demand = shearDemand(400_000);
    const major = evaluateSteelCapacity(capacityInput({
      demand,
      material: yieldOnlyMaterial(),
      section: yieldOnlySection(),
      shear: yieldOnlyShear(),
    }));
    expect(consumeDemandHandoff(demand)).toBe("demand-au4");
    expect(demand.combinationId).toBe("comb-au4");
    expect(demand.shear.unit).toBe("N");
    expect(demand.shear.signed).toBe(400_000);
    expect(demand.shear.locationM).toBe(2);
    expect(demand.memberId).toBe("m-au4");
    expect(major.resultClass).toBe("MECHANICS_REFERENCE");
    expect(major.capacity?.capacityType).toBe("MECHANICS_REFERENCE");
    expect(major.capacity?.capacityType).not.toBe("AS4100_DESIGN_CAPACITY");
    expect(major.capacity?.units).toBe("N");
    expect(major.capacity?.value).toBeCloseTo(independentYieldN(), 6);
    expect(major.governingMethodId).toBe("AU_SHEAR_YIELD_REFERENCE");
    expect(major.shearChecks).toHaveLength(1);
    expect(major.shearChecks?.[0]?.axis).toBe("MAJOR_SHEAR");
    expect(major.reason).toMatch(/PARTIAL/);
    expect(major.designCapacityState).toBe("VALIDATION_REQUIRED");
    expect(major.interactionReviewRequired).toBe(true);
    const ctx = toAuShearContext(capacityInput({ limitState: "SHEAR_MINOR", shear: { ...yieldOnlyShear(), shearAxis: "MINOR_SHEAR" } }));
    expect(ctx.shearAxis).toBe("MINOR_SHEAR");
    const minor = evaluateSteelCapacity(capacityInput({
      limitState: "SHEAR_MINOR",
      material: yieldOnlyMaterial(),
      section: yieldOnlySection({ shearArea: { name: "Av", value: 2_000, unit: "mm2", provenanceRef: "engineer-minor-av", sourceAuthority: "OTHER_GOVERNED_SOURCE" } }),
      shear: { ...yieldOnlyShear(), shearAxis: "MINOR_SHEAR" },
    }));
    expect(minor.capacity?.value).toBeCloseTo(independentYieldN(2_000), 6);
    expect(minor.shearChecks?.[0]?.axis).toBe("MINOR_SHEAR");
  });

  it("evaluates elastic shear buckling as a mechanics reference and selects the governing mode deterministically", () => {
    const result = evaluateSteelCapacity(capacityInput());
    expect(result.shearChecks).toHaveLength(2);
    expect(result.shearChecks?.map((row) => row.methodType)).toEqual(["ELASTIC_SHEAR_REFERENCE", "ELASTIC_SHEAR_BUCKLING_REFERENCE"]);
    expect(result.shearChecks?.[1]?.capacityValueN).toBeCloseTo(independentBucklingN(), 0);
    expect(result.shearChecks?.[1]?.webSlendernessRatio).toBeCloseTo(37.5);
    expect(result.governingMethodId).toBe("AU_SHEAR_YIELD_REFERENCE");
    expect(result.capacity?.value).toBeCloseTo(independentYieldN(), 6);
    expect(result.capacity?.capacityType).not.toBe("AS4100_SHEAR_CAPACITY");
    expect(result.shearChecks?.[1]?.methodType).not.toBe("CODE_PROFILE_SHEAR_CAPACITY");
    expect(ELASTIC_SHEAR_BUCKLING_EQUALS_CODE_CAPACITY).toBe(false);
    expect(MECHANICS_REFERENCE_EQUALS_CODE_CAPACITY).toBe(false);
    const slender = evaluateSteelCapacity(capacityInput({
      section: section({ webDepth: { name: "d", value: 800, unit: "mm", provenanceRef: "engineer-web-geometry", sourceAuthority: "OTHER_GOVERNED_SOURCE" }, webThickness: { name: "tw", value: 4, unit: "mm", provenanceRef: "engineer-web-geometry", sourceAuthority: "OTHER_GOVERNED_SOURCE" } }),
    }));
    expect(slender.governingMethodId).toBe("AU_SHEAR_BUCKLING_REFERENCE");
    expect(slender.shearChecks).toHaveLength(2);
  });

  it("requires governed shear area, geometry, material, axis, and stiffener state", () => {
    expect(SILENT_SHEAR_AREA_ASSUMPTION).toBe(false);
    expect(() => evaluateSteelCapacity(capacityInput({
      material: yieldOnlyMaterial({ yieldStrength: null }),
      section: yieldOnlySection(),
      shear: yieldOnlyShear(),
    }))).toThrow(/missing material.yieldStrength/);
    expect(() => evaluateSteelCapacity(capacityInput({
      material: yieldOnlyMaterial(),
      section: yieldOnlySection({ shearArea: null }),
      shear: yieldOnlyShear(),
    }))).toThrow(/missing section.shearArea/);
    expect(() => evaluateSteelCapacity(capacityInput({
      material: yieldOnlyMaterial(),
      section: yieldOnlySection({ shearArea: undefined }),
      shear: yieldOnlyShear(),
    }))).toThrow(/missing section.shearArea/);
    expect(() => evaluateSteelCapacity(capacityInput({
      section: section({ webDepth: null }),
    }))).toThrow(/missing section.webDepth/);
    expect(() => evaluateSteelCapacity(capacityInput({ shear: shearContext({ stiffenerState: "unknown" }) }))).toThrow(/unknown required stiffener state/);
    expect(() => evaluateSteelCapacity(capacityInput({ shear: null, limitState: "SHEAR" }))).toThrow(/missing axis/);
    expect(() => evaluateSteelCapacity(capacityInput({ shear: undefined }))).toThrow(/unknown required stiffener state/);
    expect(() => evaluateSteelCapacity(capacityInput({
      section: section({ shearArea: { name: "Av", value: 5_000, unit: "mm2", provenanceRef: "ai-inferred", sourceAuthority: "OTHER_GOVERNED_SOURCE" } }),
    }))).toThrow(/AI cannot supply missing shear parameters/);
    expect(() => evaluateSteelCapacity(capacityInput({
      demand: shearDemand(400_000, { resultId: "", shear: { value: Number.NaN, unit: "", locationM: 0, signed: 0 } }),
      designContext: { ...designContext(), demandRefs: [""] },
    }))).toThrow(/demand missing/);
    expect(() => evaluateSteelCapacity(capacityInput({ section: section({ sectionFamily: "unknown" }) }))).toThrow(/unsupported section type/);
    expect(() => evaluateSteelCapacity(capacityInput({ designContext: { ...designContext(), validationState: "CERTIFIED" } }))).toThrow(/certified/);
    expect(() => evaluateSteelCapacity(capacityInput({
      shear: shearContext({ stiffenerState: "TRANSVERSE_STIFFENED", stiffenerSpacing: null }),
    }))).toThrow(/missing shear.stiffenerSpacing/);
  });

  it("does not guess slenderness limits, tension field, or code-profile shear", () => {
    expect(WEB_SLENDERNESS_LIMIT_GUESSED).toBe(false);
    expect(TENSION_FIELD_ACTION_IMPLEMENTED).toBe(false);
    expect(() => requestAuWebSlendernessLimit()).toThrow(/unknown required code parameter/);
    expect(() => requestAuCodeProfileShear()).toThrow(/unknown required code parameter/);
    expect(() => requestAuTensionFieldAction()).toThrow(/unknown required code parameter/);
    expect(() => requestAuBendingShearInteraction()).toThrow(/unknown required code parameter/);
    expect(() => requestAuConnectionShear()).toThrow(/unknown required code parameter/);
    expect(AU_SHEAR_UNSUPPORTED_METHODS.CODE_PROFILE_SHEAR).toBe("VALIDATION_REQUIRED");
    expect(AU_SHEAR_UNSUPPORTED_METHODS.TENSION_FIELD).toBe(false);
    expect(AU_SHEAR_UNSUPPORTED_METHODS.CONNECTION_SHEAR).toBe(false);
    expect(AU_SHEAR_UNSUPPORTED_METHODS.BENDING_SHEAR_INTERACTION).toBe(false);
    expect(BENDING_SHEAR_INTERACTION_IMPLEMENTED).toBe(false);
    expect(CONNECTION_SHEAR_DESIGN_IMPLEMENTED).toBe(false);
    expect(INTERACTION_REVIEW_REQUIRED).toBe(true);
    expect(AU_SHEAR_METHOD_REGISTRY.every((rule) => rule.authorityType === "ESTABLISHED_ENGINEERING_MECHANICS")).toBe(true);
    expect(AU_SECTION_SHEAR_METHOD_REGISTRY).toHaveLength(1);
    expect(AU_SHEAR_METHOD_CATALOG.map((row) => row.methodType)).toEqual(["ELASTIC_SHEAR_REFERENCE", "ELASTIC_SHEAR_BUCKLING_REFERENCE"]);
    expect(() => assertEngineeringRuleAuthority("LLM_MEMORY_ONLY")).toThrow(/LLM_MEMORY_ONLY/);
    expect(LLM_MEMORY_ONLY_RULE_ALLOWED).toBe(false);
    expect(auProfile.edition).toBe(AU_STEEL_UNKNOWN_STANDARD_TOKEN);
    expect(auProfile.amendment).toBe(AU_STEEL_UNKNOWN_STANDARD_TOKEN);
  });

  it("reports utilization without approval and independently benchmarks implemented methods", () => {
    const outcome = orchestrateAuShearDesignCheck({
      designCheckId: "chk-shear",
      designContext: designContext(),
      capacityInput: capacityInput({
        material: yieldOnlyMaterial(),
        section: yieldOnlySection(),
        shear: yieldOnlyShear(),
      }),
    });
    expect(outcome.verdict).toBe("CHECK_UNDETERMINED");
    expect(outcome.utilization?.ratio).toBeCloseTo(400_000 / independentYieldN(), 8);
    expect(outcome.engineeringApproved).toBe(false);
    expect(outcome.designCheck.approvalState).toBe("not_approved");
    expect(outcome.humanReviewRequired).toBe(true);
    expect(CHECK_RESULT_EQUALS_ENGINEERING_APPROVAL).toBe(false);
    expect(AI_ENGINEERING_APPROVAL).toBe(false);
    const yieldBm = scoreShearBenchmark("AU-SHEAR-BM-YIELD-HAND-1", independentYieldN());
    const buckleBm = scoreShearBenchmark("AU-SHEAR-BM-BUCKLING-HAND-1", independentBucklingN());
    expect(yieldBm.evidenceRef).toMatch(/PASS/);
    expect(buckleBm.evidenceRef).toMatch(/PASS/);
  });

  it("does not regress tension, compression, or bending and keeps EU/US, AI, and global-core boundaries", () => {
    const tension = orchestrateAuTensionDesignCheck({
      designCheckId: "chk-t-reg",
      designContext: { ...designContext(), demandRefs: ["demand-au1-reg"] },
      capacityInput: capacityInput({
        limitState: "TENSION",
        demand: { ...shearDemand(), resultId: "demand-au1-reg", axial: { valueN: 1_000_000, unit: "N", method: "AXIAL_DIRECT" } },
        designContext: { ...designContext(), demandRefs: ["demand-au1-reg"] },
        shear: null,
        material: yieldOnlyMaterial(),
        section: yieldOnlySection(),
      }),
    });
    expect(tension.verdict).toBe("CHECK_SATISFIED");
    const compression = orchestrateAuCompressionDesignCheck({
      designCheckId: "chk-c-reg",
      designContext: { ...designContext(), demandRefs: ["demand-au2-reg"] },
      capacityInput: capacityInput({
        limitState: "COMPRESSION",
        demand: { ...shearDemand(), resultId: "demand-au2-reg", axial: { valueN: -400_000, unit: "N", method: "AXIAL_DIRECT" } },
        designContext: { ...designContext(), demandRefs: ["demand-au2-reg"] },
        shear: null,
        stability: {
          stabilityContextId: "stab-c",
          memberLengthM: 8,
          effectiveLengthM: 8,
          unbracedLengthM: 8,
          restraintDescription: "pinned ends, explicit Le supplied",
          bucklingAxis: "BOTH",
          momentGradientRef: null,
          torsionalRestraint: null,
          lateralRestraint: null,
          sourceEvidenceRef: "engineer-effective-length",
          derived: false,
          effectiveLengthMajorM: 8,
          effectiveLengthMinorM: 8,
          effectiveLengthProvenanceRef: "engineer-effective-length",
        },
      }),
    });
    expect(compression.verdict).toBe("CHECK_UNDETERMINED");
    expect(compression.utilization?.ratio).toBeCloseTo(400_000 / 616_850, 5);
    const bending = orchestrateAuBendingDesignCheck({
      designCheckId: "chk-b-reg",
      designContext: { ...designContext(), demandRefs: ["demand-au3-reg"] },
      capacityInput: capacityInput({
        limitState: "BENDING_MAJOR",
        demand: { ...shearDemand(), resultId: "demand-au3-reg" },
        designContext: { ...designContext(), demandRefs: ["demand-au3-reg"] },
        shear: null,
        stability: bendingStability(),
      }),
    });
    expect(bending.verdict).toBe("CHECK_UNDETERMINED");
    expect(bending.engineeringApproved).toBe(false);
    expect(() => evaluateSteelCapacity(capacityInput({ limitState: "OTHER" }))).toThrow(/unsupported calculation scope/);
    expect(() => assertLlmCannotOriginateCapacity(true)).toThrow(/originate capacity/);
    expect(() => assertAiCannotInventShear("AI", false)).toThrow(/AI cannot supply missing shear parameters/);
    expect(LLM_SHEAR_CAPACITY_AUTHORITY).toBe(false);
    expect(LLM_STEEL_CAPACITY_AUTHORITY).toBe(false);
    expect(AI_STANDARD_CONFORMANCE_AUTHORITY).toBe(false);
    expect(AI_SHEAR_ASSISTANCE_ADVISORY_ONLY).toBe(true);
    expect(AU_SHEAR_PILOT_EXPOSURE).toBe(false);
    expect(OPTIMIZATION_SHEAR_RECHECK_REQUIRED).toBe(true);
    expect(() => assertOptimizationShearRecheck({
      candidateSectionRef: "sec-opt",
      proposedBy: "OPTIMIZER",
      deterministicRecheckRequired: true,
      rechecked: false,
    })).toThrow(/deterministic recheck/);
    const adapterSrc = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "adapters.ts"), "utf8");
    expect(adapterSrc).not.toMatch(/vonMisesShearYieldN|elasticShearBucklingForceN|fy \/ Math.sqrt/);
    const globalCore = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "properties.ts"), "utf8");
    expect(globalCore).not.toMatch(/vonMisesShearYieldN|elasticShearBucklingForceN/);
    const eu = {
      ...createConfiguredKnowledgeContext({
        contextId: "ctx-en1993-au4",
        jurisdictionProfileRef: "eu-eea",
        standardFamily: "EN",
        standardCode: "EN 1993-1-1",
        edition: "2005",
        materialScope: "steel",
      }),
      nationalAnnexRef: exampleEurocodeAnnex("EN 1993-1-1", "2005"),
    };
    const euOut = evaluateSteelCapacity(capacityInput({
      adapterId: "EU_STEEL",
      limitState: "SHEAR",
      standardContext: eu,
      designContext: { ...designContext(), standardContextRef: eu.contextId },
      requiredProperties: [],
    }));
    expect(euOut.implemented).toBe(false);
    expect(euOut.maturity).toBe("FRAMEWORK_ONLY");
    expect(STEEL_ADAPTER_BOUNDARIES.EU_STEEL.implemented).toBe(false);
    expect(STEEL_ADAPTER_BOUNDARIES.US_STEEL.implemented).toBe(false);
    expect(STEEL_ADAPTER_BOUNDARIES.AU_STEEL.scope).toMatch(/SHEAR/);
    expect(D1D_AU4_D0_RISK_DISPOSITION.CLOSED).toEqual([]);
    expect(isGlobalFirstArchitecture()).toBe(true);
    expect(disciplineMaturity("structural")).toBe("REFERENCE_PARTIALLY_IMPLEMENTED");
  });
});
