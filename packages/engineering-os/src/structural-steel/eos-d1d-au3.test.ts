import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  AI_BENDING_ASSISTANCE_ADVISORY_ONLY,
  AI_ENGINEERING_APPROVAL,
  AI_STANDARD_CONFORMANCE_AUTHORITY,
  AU_BENDING_PILOT_EXPOSURE,
  AU_STEEL_UNKNOWN_STANDARD_TOKEN,
  CHECK_RESULT_EQUALS_ENGINEERING_APPROVAL,
  ELASTIC_LTB_EQUALS_CODE_MEMBER_CAPACITY,
  LLM_BENDING_CAPACITY_AUTHORITY,
  LLM_MEMORY_ONLY_RULE_ALLOWED,
  LLM_STEEL_CAPACITY_AUTHORITY,
  MECHANICS_REFERENCE_EQUALS_CODE_CAPACITY,
  OPTIMIZATION_BENDING_RECHECK_REQUIRED,
  SECTION_CLASSIFICATION_STATE,
  SILENT_MOMENT_MODIFICATION_FACTOR,
  SILENT_UNBRACED_LENGTH_ASSUMPTION,
  UNKNOWN_CODE_PARAMETER_GUESSED,
  type SteelCapacityEngineInput,
  type SteelDesignContext,
  type SteelMaterialDesignProperties,
  type SteelSectionDesignProperties,
  type SteelStabilityContext,
} from "@rtb/types";
import { disciplineMaturity } from "../discipline-capability";
import { isGlobalFirstArchitecture } from "../global-governance";
import { createConfiguredKnowledgeContext, exampleEurocodeAnnex } from "../structural-domain/binding";
import { governedProvenance } from "../structural-domain/catalog";
import {
  assertAiCannotInventLtb,
  assertEngineeringRuleAuthority,
  assertLlmCannotOriginateCapacity,
  assertOptimizationBendingRecheck,
  AU_BENDING_METHOD_CATALOG,
  AU_BENDING_METHOD_REGISTRY,
  AU_BENDING_UNSUPPORTED_METHODS,
  AU_SECTION_BENDING_METHOD_REGISTRY,
  consumeD1cDeflectionHandoff,
  consumeDemandHandoff,
  createAuSteelStandardProfile,
  D1D_AU3_D0_RISK_DISPOSITION,
  evaluateSteelCapacity,
  orchestrateAuBendingDesignCheck,
  orchestrateAuCompressionDesignCheck,
  orchestrateAuTensionDesignCheck,
  requestAuCodeProfileLtb,
  requestAuMomentModificationFactor,
  requestAuPlasticSectionCapacity,
  scoreBendingBenchmark,
  STEEL_ADAPTER_BOUNDARIES,
  toAuBendingContext,
} from "./index";

const auProfile = createAuSteelStandardProfile({ contextId: "ctx-au-bending-au3" });

function momentDemand(valueNm = 100_000, patch: Partial<SteelCapacityEngineInput["demand"]> = {}): SteelCapacityEngineInput["demand"] {
  return {
    resultId: "demand-au3",
    memberId: "m-au3",
    shear: { value: 0, unit: "N", locationM: 0, signed: 0 },
    moment: { value: valueNm, unit: "N.m", locationM: 4, signed: valueNm },
    axial: { valueN: 0, unit: "N", method: "AXIAL_DIRECT" },
    deflection: { status: "NOT_IMPLEMENTED", reason: "D1C deflection handoff; not recalculated in AU bending" },
    capacityPresent: false,
    standardContext: auProfile,
    inputEvidenceRefs: [{ evidenceId: "ev-d1c", sourceKind: "calculation", reference: "d1c-moment" }],
    combinationId: "comb-au3",
    ...patch,
  };
}

function material(patch: Partial<SteelMaterialDesignProperties> = {}): SteelMaterialDesignProperties {
  return {
    materialRef: "mat-au3",
    grade: "300PLUS",
    yieldStrength: { name: "fy", value: 300, unit: "MPa", provenanceRef: "mill-cert", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE" },
    ultimateStrength: { name: "fu", value: 440, unit: "MPa", provenanceRef: "mill-cert", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE" },
    elasticModulus: { name: "E", value: 200, unit: "GPa", provenanceRef: "mill-cert", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE" },
    shearModulus: { name: "G", value: 80, unit: "GPa", provenanceRef: "mill-cert", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE" },
    poissonRatio: null,
    density: null,
    thicknessDependentMetadata: "thickness-dependent fy metadata governed by mill cert",
    jurisdictionApplicability: ["australia"],
    ...patch,
  };
}

function section(patch: Partial<SteelSectionDesignProperties> = {}): SteelSectionDesignProperties {
  return {
    sectionRef: "sec-au3",
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
    geometricDimensions: {},
    ...patch,
  };
}

function stability(patch: Partial<SteelStabilityContext> = {}): SteelStabilityContext {
  return {
    stabilityContextId: "stab-au3",
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
    ...patch,
  };
}

function designContext(): SteelDesignContext {
  return {
    designContextId: "dc-au3",
    memberRef: "m-au3",
    sectionRef: "sec-au3",
    materialRef: "mat-au3",
    demandRefs: ["demand-au3"],
    standardContextRef: auProfile.contextId,
    parameterSetRef: null,
    effectiveLengthContextRef: null,
    restraintContextRef: "stab-au3",
    stabilityContextRef: "stab-au3",
    fabricationContextRef: null,
    evidenceRefs: [{ evidenceId: "ev-eng", sourceKind: "human_input", reference: "engineer" }],
    toolRef: "EOS_AU_STEEL_BENDING",
    methodRef: "AU_BENDING",
    provenanceRef: governedProvenance({ jurisdiction: "australia", standard: "AS 4100", calculationMethod: "AU_BENDING" }),
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
    stability: stability(),
    demand: momentDemand(),
    limitState: "BENDING_MAJOR",
    requiredProperties: [],
    ...patch,
  };
}

function independentElasticLtbNm(): number {
  const EPa = 200e9;
  const GPa = 80e9;
  const IminorM4 = 20_000_000 * 1e-12;
  const JM4 = 500_000 * 1e-12;
  const IwM6 = 200_000_000_000 * 1e-18;
  const L = 8;
  const pi2 = Math.PI * Math.PI;
  return Math.sqrt((pi2 * EPa * IminorM4) / (L * L) * (GPa * JM4 + (pi2 * EPa * IwM6) / (L * L)));
}

describe("EOS-D1D-AU-3 Australian steel bending / LTB", () => {
  it("reuses D1C moment demand for major and minor elastic bending without recalculating demand", () => {
    const demand = momentDemand(100_000);
    const major = evaluateSteelCapacity(capacityInput({ demand, stability: null, section: section({ torsionConstant: null, warpingConstant: null }), material: material({ shearModulus: null }) }));
    expect(consumeDemandHandoff(demand)).toBe("demand-au3");
    expect(demand.combinationId).toBe("comb-au3");
    expect(demand.moment.unit).toBe("N.m");
    expect(demand.moment.signed).toBe(100_000);
    expect(demand.moment.locationM).toBe(4);
    expect(demand.moment.value).toBe(100_000);
    expect(major.resultClass).toBe("MECHANICS_REFERENCE");
    expect(major.capacity?.capacityType).toBe("MECHANICS_REFERENCE");
    expect(major.capacity?.units).toBe("N.m");
    expect(major.capacity?.value).toBe(300_000);
    expect(major.governingMethodId).toBe("AU_BENDING_ELASTIC_MAJOR");
    expect(major.bendingChecks).toHaveLength(1);
    expect(major.bendingChecks?.[0]?.methodType).toBe("ELASTIC_BENDING_REFERENCE");
    expect(major.bendingChecks?.[0]?.axis).toBe("MAJOR_AXIS");
    expect(major.reason).toMatch(/PARTIAL/);
    expect(major.capacity?.capacityType).not.toBe("AS4100_MEMBER_BENDING_CAPACITY");
    expect(major.designCapacityState).toBe("VALIDATION_REQUIRED");
    const ctx = toAuBendingContext(capacityInput({ limitState: "BENDING_MINOR", stability: null }));
    expect(ctx.bendingAxis).toBe("MINOR_AXIS");
    const minor = evaluateSteelCapacity(capacityInput({
      limitState: "BENDING_MINOR",
      stability: null,
      section: section({ torsionConstant: null, warpingConstant: null }),
      material: material({ shearModulus: null }),
    }));
    expect(minor.capacity?.value).toBe(60_000);
    expect(minor.governingMethodId).toBe("AU_BENDING_ELASTIC_MINOR");
    expect(minor.bendingChecks?.[0]?.axis).toBe("MINOR_AXIS");
    expect(consumeD1cDeflectionHandoff(demand)).toEqual(demand.deflection);
  });

  it("evaluates elastic LTB as a mechanics reference and selects the governing mode deterministically", () => {
    const expectedMcr = independentElasticLtbNm();
    const result = evaluateSteelCapacity(capacityInput());
    expect(result.bendingChecks).toHaveLength(2);
    expect(result.bendingChecks?.map((row) => row.methodType)).toEqual(["ELASTIC_BENDING_REFERENCE", "ELASTIC_LTB_REFERENCE"]);
    expect(result.bendingChecks?.[1]?.capacityValueNm).toBeCloseTo(expectedMcr, 4);
    expect(result.bendingChecks?.[1]?.unbracedLengthM).toBe(8);
    expect(result.capacity?.value).toBeCloseTo(expectedMcr, 4);
    expect(result.governingMethodId).toBe("AU_BENDING_ELASTIC_LTB");
    expect(result.resultClass).toBe("MECHANICS_REFERENCE");
    expect(result.capacity?.capacityType).toBe("MECHANICS_REFERENCE");
    expect(result.capacity?.capacityType).not.toBe("AS4100_MEMBER_BENDING_CAPACITY");
    expect(result.bendingChecks?.[1]?.methodType).not.toBe("MEMBER_BENDING_CAPACITY");
    expect(ELASTIC_LTB_EQUALS_CODE_MEMBER_CAPACITY).toBe(false);
    expect(MECHANICS_REFERENCE_EQUALS_CODE_CAPACITY).toBe(false);
    const minorIgnoresLtb = evaluateSteelCapacity(capacityInput({ limitState: "BENDING_MINOR" }));
    expect(minorIgnoresLtb.bendingChecks?.some((row) => row.methodType === "ELASTIC_LTB_REFERENCE")).toBe(false);
    expect(minorIgnoresLtb.governingMethodId).toBe("AU_BENDING_ELASTIC_MINOR");
  });

  it("requires governed section/material properties and fails closed for missing LTB inputs", () => {
    expect(SILENT_UNBRACED_LENGTH_ASSUMPTION).toBe(false);
    expect(() => evaluateSteelCapacity(capacityInput({ material: material({ yieldStrength: null }) }))).toThrow(/missing material.yieldStrength/);
    expect(() => evaluateSteelCapacity(capacityInput({
      stability: null,
      section: section({ sectionModulusYy: null, torsionConstant: null, warpingConstant: null }),
      material: material({ shearModulus: null }),
    }))).toThrow(/missing section.sectionModulusYy/);
    expect(() => evaluateSteelCapacity(capacityInput({
      limitState: "BENDING_MINOR",
      stability: null,
      section: section({ sectionModulusZz: null, torsionConstant: null, warpingConstant: null }),
      material: material({ shearModulus: null }),
    }))).toThrow(/missing section.sectionModulusZz/);
    expect(() => evaluateSteelCapacity(capacityInput({
      stability: stability({ unbracedLengthM: null }),
    }))).toThrow(/missing unbraced length/);
    expect(() => evaluateSteelCapacity(capacityInput({
      stability: stability({ unbracedLengthProvenanceRef: "", sourceEvidenceRef: "" }),
    }))).toThrow(/unbraced length provenance/);
    expect(() => evaluateSteelCapacity(capacityInput({
      stability: stability({ unbracedLengthProvenanceRef: "ai-inferred", sourceEvidenceRef: "ai-inferred" }),
    }))).toThrow(/AI cannot invent LTB values/);
    expect(() => evaluateSteelCapacity(capacityInput({
      stability: stability({ lateralRestraint: "unknown" }),
    }))).toThrow(/unknown restraint/);
    expect(() => evaluateSteelCapacity(capacityInput({
      stability: stability({ torsionalRestraint: null }),
    }))).toThrow(/unknown restraint/);
    expect(() => evaluateSteelCapacity(capacityInput({ material: material({ shearModulus: null }) }))).toThrow(/missing material.shearModulus/);
    expect(() => evaluateSteelCapacity(capacityInput({ section: section({ Izz: null }) }))).toThrow(/missing section.Izz/);
    expect(() => evaluateSteelCapacity(capacityInput({
      demand: momentDemand(100_000, { resultId: "", moment: { value: Number.NaN, unit: "", locationM: 0, signed: 0 } }),
      designContext: { ...designContext(), demandRefs: [""] },
    }))).toThrow(/demand missing/);
    expect(() => evaluateSteelCapacity(capacityInput({
      material: material({ yieldStrength: { name: "fy", value: 300, unit: "ksi", provenanceRef: "mill-cert", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE" } }),
      stability: null,
      section: section({ torsionConstant: null, warpingConstant: null }),
    }))).toThrow(/units incompatible|missing/);
    expect(() => evaluateSteelCapacity(capacityInput({ section: section({ sectionFamily: "unknown" }) }))).toThrow(/unsupported section type/);
    expect(() => evaluateSteelCapacity(capacityInput({ designContext: { ...designContext(), validationState: "CERTIFIED" } }))).toThrow(/certified/);
  });

  it("does not guess classification, moment modification, or code-profile LTB", () => {
    expect(SECTION_CLASSIFICATION_STATE).toBe("VALIDATION_REQUIRED");
    expect(evaluateSteelCapacity(capacityInput()).sectionClassificationState).toBe("VALIDATION_REQUIRED");
    expect(SILENT_MOMENT_MODIFICATION_FACTOR).toBe(false);
    expect(UNKNOWN_CODE_PARAMETER_GUESSED).toBe(false);
    expect(() => requestAuMomentModificationFactor()).toThrow(/unknown required code parameter/);
    expect(() => requestAuPlasticSectionCapacity()).toThrow(/unknown required code parameter/);
    expect(() => requestAuCodeProfileLtb()).toThrow(/unknown required code parameter/);
    expect(AU_BENDING_UNSUPPORTED_METHODS.CODE_PROFILE_LTB).toBe("VALIDATION_REQUIRED");
    expect(AU_BENDING_UNSUPPORTED_METHODS.AS4100_MEMBER_BENDING_CAPACITY).toBe("VALIDATION_REQUIRED");
    expect(AU_BENDING_UNSUPPORTED_METHODS.SHEAR).toBe(false);
    expect(AU_BENDING_UNSUPPORTED_METHODS.COMBINED_ACTION).toBe(false);
    expect(AU_BENDING_UNSUPPORTED_METHODS.TORSIONAL_DESIGN).toBe(false);
    expect(AU_BENDING_METHOD_REGISTRY.every((rule) => rule.authorityType === "ESTABLISHED_ENGINEERING_MECHANICS")).toBe(true);
    expect(AU_SECTION_BENDING_METHOD_REGISTRY).toHaveLength(2);
    expect(AU_BENDING_METHOD_CATALOG.map((row) => row.methodType)).toEqual([
      "ELASTIC_BENDING_REFERENCE",
      "ELASTIC_BENDING_REFERENCE",
      "ELASTIC_LTB_REFERENCE",
    ]);
    expect(() => assertEngineeringRuleAuthority("LLM_MEMORY_ONLY")).toThrow(/LLM_MEMORY_ONLY/);
    expect(LLM_MEMORY_ONLY_RULE_ALLOWED).toBe(false);
    expect(auProfile.edition).toBe(AU_STEEL_UNKNOWN_STANDARD_TOKEN);
    expect(auProfile.amendment).toBe(AU_STEEL_UNKNOWN_STANDARD_TOKEN);
  });

  it("reports utilization without approval and independently benchmarks implemented methods", () => {
    const outcome = orchestrateAuBendingDesignCheck({
      designCheckId: "chk-bend",
      designContext: designContext(),
      capacityInput: capacityInput(),
    });
    expect(outcome.verdict).toBe("CHECK_UNDETERMINED");
    expect(outcome.utilization?.ratio).toBeCloseTo(100_000 / independentElasticLtbNm(), 5);
    expect(outcome.engineeringApproved).toBe(false);
    expect(outcome.designCheck.approvalState).toBe("not_approved");
    expect(outcome.humanReviewRequired).toBe(true);
    expect(CHECK_RESULT_EQUALS_ENGINEERING_APPROVAL).toBe(false);
    expect(AI_ENGINEERING_APPROVAL).toBe(false);
    const incomplete = orchestrateAuBendingDesignCheck({
      designCheckId: "chk-partial",
      designContext: designContext(),
      capacityInput: capacityInput({
        stability: null,
        section: section({ torsionConstant: null, warpingConstant: null }),
        material: material({ shearModulus: null }),
      }),
    });
    expect(incomplete.verdict).toBe("CHECK_UNDETERMINED");
    expect(incomplete.utilization?.ratio).toBeCloseTo(100_000 / 300_000);
    const majorBm = scoreBendingBenchmark("AU-BENDING-BM-ELASTIC-MAJOR-HAND-1", 300_000);
    const minorBm = scoreBendingBenchmark("AU-BENDING-BM-ELASTIC-MINOR-HAND-1", 60_000);
    const ltbBm = scoreBendingBenchmark("AU-BENDING-BM-ELASTIC-LTB-HAND-1", independentElasticLtbNm());
    expect(majorBm.evidenceRef).toMatch(/PASS/);
    expect(minorBm.evidenceRef).toMatch(/PASS/);
    expect(ltbBm.evidenceRef).toMatch(/PASS/);
  });

  it("does not regress tension or compression and keeps EU/US, AI, and global-core boundaries", () => {
    const tensionDemand: SteelCapacityEngineInput["demand"] = {
      ...momentDemand(),
      resultId: "demand-au1-reg",
      axial: { valueN: 1_000_000, unit: "N", method: "AXIAL_DIRECT" },
    };
    const tension = orchestrateAuTensionDesignCheck({
      designCheckId: "chk-t-reg",
      designContext: { ...designContext(), demandRefs: ["demand-au1-reg"] },
      capacityInput: capacityInput({
        limitState: "TENSION",
        demand: tensionDemand,
        designContext: { ...designContext(), demandRefs: ["demand-au1-reg"] },
        stability: null,
      }),
    });
    expect(tension.verdict).toBe("CHECK_SATISFIED");
    expect(tension.engineeringApproved).toBe(false);
    const compression = orchestrateAuCompressionDesignCheck({
      designCheckId: "chk-c-reg",
      designContext: { ...designContext(), demandRefs: ["demand-au2-reg"] },
      capacityInput: capacityInput({
        limitState: "COMPRESSION",
        demand: {
          ...momentDemand(),
          resultId: "demand-au2-reg",
          axial: { valueN: -400_000, unit: "N", method: "AXIAL_DIRECT" },
        },
        designContext: { ...designContext(), demandRefs: ["demand-au2-reg"] },
        stability: {
          ...stability(),
          restraintDescription: "pinned ends, explicit Le supplied",
          effectiveLengthMajorM: 8,
          effectiveLengthMinorM: 8,
          effectiveLengthProvenanceRef: "engineer-effective-length",
          sourceEvidenceRef: "engineer-effective-length",
          bucklingAxis: "BOTH",
        },
      }),
    });
    expect(compression.verdict).toBe("CHECK_UNDETERMINED");
    expect(compression.utilization?.ratio).toBeCloseTo(400_000 / 616_850, 5);
    expect(() => evaluateSteelCapacity(capacityInput({ limitState: "OTHER" }))).toThrow(/unsupported calculation scope/);
    expect(() => evaluateSteelCapacity(capacityInput({ limitState: "COMBINED_ACTION" }))).toThrow(/stability context|unsupported calculation scope/);
    expect(() => assertLlmCannotOriginateCapacity(true)).toThrow(/originate capacity/);
    expect(() => assertAiCannotInventLtb("AI", false)).toThrow(/AI cannot invent LTB values/);
    expect(LLM_BENDING_CAPACITY_AUTHORITY).toBe(false);
    expect(LLM_STEEL_CAPACITY_AUTHORITY).toBe(false);
    expect(AI_STANDARD_CONFORMANCE_AUTHORITY).toBe(false);
    expect(AI_BENDING_ASSISTANCE_ADVISORY_ONLY).toBe(true);
    expect(AU_BENDING_PILOT_EXPOSURE).toBe(false);
    expect(OPTIMIZATION_BENDING_RECHECK_REQUIRED).toBe(true);
    expect(() => assertOptimizationBendingRecheck({
      candidateSectionRef: "sec-opt",
      proposedBy: "OPTIMIZER",
      deterministicRecheckRequired: true,
      rechecked: false,
    })).toThrow(/deterministic recheck/);
    const adapterSrc = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "adapters.ts"), "utf8");
    expect(adapterSrc).not.toMatch(/firstYieldMomentNm|elasticLtbMomentNm|fy \* Z/);
    const globalCore = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "properties.ts"), "utf8");
    expect(globalCore).not.toMatch(/elasticLtbMomentNm|firstYieldMomentNm/);
    const eu = {
      ...createConfiguredKnowledgeContext({
        contextId: "ctx-en1993-au3",
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
      standardContext: eu,
      designContext: { ...designContext(), standardContextRef: eu.contextId },
      requiredProperties: [],
    }));
    expect(euOut.implemented).toBe(false);
    expect(euOut.maturity).toBe("FRAMEWORK_ONLY");
    expect(STEEL_ADAPTER_BOUNDARIES.EU_STEEL.implemented).toBe(false);
    expect(STEEL_ADAPTER_BOUNDARIES.US_STEEL.implemented).toBe(false);
    expect(STEEL_ADAPTER_BOUNDARIES.AU_STEEL.scope).toMatch(/BENDING/);
    expect(D1D_AU3_D0_RISK_DISPOSITION.CLOSED).toEqual([]);
    expect(isGlobalFirstArchitecture()).toBe(true);
    expect(disciplineMaturity("structural")).toBe("REFERENCE_PARTIALLY_IMPLEMENTED");
  });
});
