import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  AI_ENGINEERING_APPROVAL,
  AI_STANDARD_CONFORMANCE_AUTHORITY,
  ELASTIC_BUCKLING_EQUALS_CODE_CAPACITY,
  LLM_COMPRESSION_CAPACITY_AUTHORITY,
  LLM_MEMORY_ONLY_RULE_ALLOWED,
  LLM_STEEL_CAPACITY_AUTHORITY,
  SECTION_CLASSIFICATION_STATE,
  SILENT_EFFECTIVE_LENGTH_ASSUMPTION,
  UNKNOWN_CODE_PARAMETER_GUESSED,
  AU_STEEL_UNKNOWN_STANDARD_TOKEN,
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
  assertAiCannotSupplyEffectiveLength,
  assertEngineeringRuleAuthority,
  assertLlmCannotOriginateCapacity,
  assertOptimizationCandidateRecheck,
  AU_COMPRESSION_METHOD_REGISTRY,
  AU_COMPRESSION_UNSUPPORTED_METHODS,
  consumeDemandHandoff,
  createAuSteelStandardProfile,
  D1D_AU2_D0_RISK_DISPOSITION,
  evaluateSteelCapacity,
  orchestrateAuCompressionDesignCheck,
  orchestrateAuTensionDesignCheck,
  requestAuBucklingCurve,
  requestAuCompressionDesignCapacity,
  requestAuSectionClassificationLimits,
  scoreCompressionBenchmark,
  STEEL_ADAPTER_BOUNDARIES,
} from "./index";

const auProfile = createAuSteelStandardProfile({ contextId: "ctx-au-compression-au2" });

function compressionDemand(valueN = -400_000): SteelCapacityEngineInput["demand"] {
  return {
    resultId: "demand-au2",
    memberId: "m-au2",
    shear: { value: 0, unit: "N", locationM: 0, signed: 0 },
    moment: { value: 0, unit: "N.m", locationM: 0, signed: 0 },
    axial: { valueN, unit: "N", method: "AXIAL_DIRECT" },
    deflection: { status: "NOT_IMPLEMENTED", reason: "not required" },
    capacityPresent: false,
    standardContext: auProfile,
    inputEvidenceRefs: [{ evidenceId: "ev-d1c", sourceKind: "calculation", reference: "d1c-axial" }],
    combinationId: "comb-au2",
  };
}

function material(patch: Partial<SteelMaterialDesignProperties> = {}): SteelMaterialDesignProperties {
  return {
    materialRef: "mat-au2",
    grade: "300PLUS",
    yieldStrength: { name: "fy", value: 300, unit: "MPa", provenanceRef: "mill-cert", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE" },
    ultimateStrength: { name: "fu", value: 440, unit: "MPa", provenanceRef: "mill-cert", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE" },
    elasticModulus: { name: "E", value: 200, unit: "GPa", provenanceRef: "mill-cert", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE" },
    shearModulus: null,
    poissonRatio: null,
    density: null,
    thicknessDependentMetadata: null,
    jurisdictionApplicability: ["australia"],
    ...patch,
  };
}

function section(patch: Partial<SteelSectionDesignProperties> = {}): SteelSectionDesignProperties {
  return {
    sectionRef: "sec-au2",
    sectionFamily: "UB",
    catalogSource: "AUST300",
    catalogVersion: "LIBRARY_SECTION_Aust300.sls",
    jurisdictionApplicability: ["australia"],
    area: { name: "Ag", value: 5140, unit: "mm2", provenanceRef: "engineer-section-props", sourceAuthority: "OTHER_GOVERNED_SOURCE" },
    Iyy: { name: "Iyy", value: 100_000_000, unit: "mm4", provenanceRef: "engineer-section-props", sourceAuthority: "OTHER_GOVERNED_SOURCE" },
    Izz: { name: "Izz", value: 20_000_000, unit: "mm4", provenanceRef: "engineer-section-props", sourceAuthority: "OTHER_GOVERNED_SOURCE" },
    sectionModulusYy: null,
    sectionModulusZz: null,
    plasticModulusYy: null,
    plasticModulusZz: null,
    torsionConstant: null,
    warpingConstant: null,
    radiusOfGyrationYy: null,
    radiusOfGyrationZz: null,
    netArea: { name: "An", value: 4500, unit: "mm2", provenanceRef: "engineer-net-area", sourceAuthority: "OTHER_GOVERNED_SOURCE" },
    geometricDimensions: {},
    ...patch,
  };
}

function stability(patch: Partial<SteelStabilityContext> = {}): SteelStabilityContext {
  return {
    stabilityContextId: "stab-au2",
    memberLengthM: 8,
    effectiveLengthM: null,
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
    ...patch,
  };
}

function designContext(): SteelDesignContext {
  return {
    designContextId: "dc-au2",
    memberRef: "m-au2",
    sectionRef: "sec-au2",
    materialRef: "mat-au2",
    demandRefs: ["demand-au2"],
    standardContextRef: auProfile.contextId,
    parameterSetRef: null,
    effectiveLengthContextRef: "stab-au2",
    restraintContextRef: "stab-au2",
    stabilityContextRef: "stab-au2",
    fabricationContextRef: null,
    evidenceRefs: [{ evidenceId: "ev-eng", sourceKind: "human_input", reference: "engineer" }],
    toolRef: "EOS_AU_STEEL_COMPRESSION",
    methodRef: "AU_COMPRESSION",
    provenanceRef: governedProvenance({ jurisdiction: "australia", standard: "AS 4100", calculationMethod: "AU_COMPRESSION" }),
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
    demand: compressionDemand(),
    limitState: "COMPRESSION",
    requiredProperties: [],
    ...patch,
  };
}

describe("EOS-D1D-AU-2 Australian steel compression/stability", () => {
  it("evaluates mechanics-reference squash and Euler loads and selects the governing axis", () => {
    const result = evaluateSteelCapacity(capacityInput());
    expect(result.implemented).toBe(true);
    expect(result.resultClass).toBe("MECHANICS_REFERENCE");
    expect(result.capacity?.capacityType).toBe("MECHANICS_REFERENCE");
    expect(result.designCapacityState).toBe("VALIDATION_REQUIRED");
    expect(result.sectionClassificationState).toBe("VALIDATION_REQUIRED");
    expect(result.standardConformanceState).toBe("INTENDED_PROFILE");
    expect(result.compressionChecks).toHaveLength(3);
    expect(result.governingMethodId).toBe("AU_COMPRESSION_EULER_MINOR");
    expect(result.capacity?.value).toBeCloseTo(616_850, 0);
    expect(ELASTIC_BUCKLING_EQUALS_CODE_CAPACITY).toBe(false);
    expect(consumeDemandHandoff(capacityInput().demand)).toBe("demand-au2");
    const majorOnly = evaluateSteelCapacity(capacityInput({
      stability: stability({ bucklingAxis: "MAJOR", effectiveLengthM: 8, effectiveLengthMinorM: null }),
    }));
    expect(majorOnly.compressionChecks?.some((row) => row.axis === "MINOR_AXIS")).toBe(false);
    expect(majorOnly.governingMethodId).toBe("AU_COMPRESSION_SQUASH_YIELD");
  });

  it("requires explicit effective length, governed E/fy/I, and fails closed for unknown code factors", () => {
    expect(SILENT_EFFECTIVE_LENGTH_ASSUMPTION).toBe(false);
    expect(() => evaluateSteelCapacity(capacityInput({ stability: null }))).toThrow(/stability context|effective length/);
    expect(() => evaluateSteelCapacity(capacityInput({
      stability: stability({ effectiveLengthMajorM: null, effectiveLengthMinorM: null, effectiveLengthM: null, bucklingAxis: "MAJOR" }),
    }))).toThrow(/effective length/);
    expect(() => evaluateSteelCapacity(capacityInput({
      stability: stability({ sourceEvidenceRef: "ai-inferred", effectiveLengthProvenanceRef: "ai-inferred" }),
    }))).toThrow(/AI cannot supply effective length/);
    expect(() => evaluateSteelCapacity(capacityInput({ material: material({ yieldStrength: null }) }))).toThrow(/missing material.yieldStrength/);
    expect(() => evaluateSteelCapacity(capacityInput({ material: material({ elasticModulus: null }) }))).toThrow(/missing material.elasticModulus/);
    expect(() => evaluateSteelCapacity(capacityInput({ section: section({ Izz: null }) }))).toThrow(/missing section.Izz/);
    expect(() => evaluateSteelCapacity(capacityInput({ section: section({ sectionFamily: "unknown" }) }))).toThrow(/unsupported section type/);
    expect(() => evaluateSteelCapacity(capacityInput({
      stability: stability({ restraintDescription: "unknown" }),
    }))).toThrow(/unknown restraint/);
    expect(() => evaluateSteelCapacity(capacityInput({
      stability: stability({ bucklingAxis: null }),
    }))).toThrow(/unsupported buckling mode/);
    expect(() => requestAuCompressionDesignCapacity()).toThrow(/unknown required code parameter/);
    expect(() => requestAuBucklingCurve()).toThrow(/unknown required code parameter/);
    expect(() => requestAuSectionClassificationLimits()).toThrow(/unknown required code parameter/);
    expect(UNKNOWN_CODE_PARAMETER_GUESSED).toBe(false);
    expect(SECTION_CLASSIFICATION_STATE).toBe("VALIDATION_REQUIRED");
    expect(AU_COMPRESSION_UNSUPPORTED_METHODS.AS4100_MEMBER_CAPACITY).toBe("VALIDATION_REQUIRED");
    expect(() => assertEngineeringRuleAuthority("LLM_MEMORY_ONLY")).toThrow(/LLM_MEMORY_ONLY/);
    expect(LLM_MEMORY_ONLY_RULE_ALLOWED).toBe(false);
    expect(AU_COMPRESSION_METHOD_REGISTRY.every((rule) => rule.authorityType === "ESTABLISHED_ENGINEERING_MECHANICS")).toBe(true);
    expect(auProfile.edition).toBe(AU_STEEL_UNKNOWN_STANDARD_TOKEN);
  });

  it("reports mechanics utilization without design approval and independently benchmarks methods", () => {
    const outcome = orchestrateAuCompressionDesignCheck({
      designCheckId: "chk-comp",
      designContext: designContext(),
      capacityInput: capacityInput(),
    });
    expect(outcome.verdict).toBe("CHECK_UNDETERMINED");
    expect(outcome.utilization?.ratio).toBeCloseTo(400_000 / 616_850, 5);
    expect(outcome.engineeringApproved).toBe(false);
    expect(outcome.designCheck.approvalState).toBe("not_approved");
    expect(AI_ENGINEERING_APPROVAL).toBe(false);
    const squash = scoreCompressionBenchmark("AU-COMPRESSION-BM-SQUASH-HAND-1", 1_542_000);
    const major = scoreCompressionBenchmark("AU-COMPRESSION-BM-EULER-MAJOR-HAND-1", Math.PI ** 2 * 200e9 * 1e-4 / 64);
    const minor = scoreCompressionBenchmark("AU-COMPRESSION-BM-EULER-MINOR-HAND-1", Math.PI ** 2 * 200e9 * 2e-5 / 64);
    expect(squash.evidenceRef).toMatch(/PASS/);
    expect(major.evidenceRef).toMatch(/PASS/);
    expect(minor.evidenceRef).toMatch(/PASS/);
  });

  it("does not regress AU-1 tension and keeps EU/US and AI boundaries", () => {
    const tensionDemand: SteelCapacityEngineInput["demand"] = {
      ...compressionDemand(1_000_000),
      resultId: "demand-au1-reg",
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
    expect(() => evaluateSteelCapacity(capacityInput({ limitState: "OTHER" }))).toThrow(/unsupported calculation scope/);
    expect(() => evaluateSteelCapacity(capacityInput({ limitState: "COMBINED_ACTION" }))).toThrow(/stability context|unsupported calculation scope/);
    expect(AU_COMPRESSION_UNSUPPORTED_METHODS.BENDING).toBe(false);
    expect(AU_COMPRESSION_UNSUPPORTED_METHODS.LTB).toBe(false);
    expect(() => assertLlmCannotOriginateCapacity(true)).toThrow(/originate capacity/);
    expect(LLM_COMPRESSION_CAPACITY_AUTHORITY).toBe(false);
    expect(AI_STANDARD_CONFORMANCE_AUTHORITY).toBe(false);
    expect(() => assertAiCannotSupplyEffectiveLength("AI", false)).toThrow(/AI cannot supply effective length/);
    expect(() => assertOptimizationCandidateRecheck({
      candidateSectionRef: "sec-opt",
      proposedBy: "OPTIMIZER",
      deterministicRecheckRequired: true,
      rechecked: false,
    })).toThrow(/deterministic recheck/);
    const adapterSrc = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "adapters.ts"), "utf8");
    expect(adapterSrc).not.toMatch(/eulerLoadN|π²|pi2-EI/);
    const eu = {
      ...createConfiguredKnowledgeContext({
        contextId: "ctx-en1993-au2",
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
      limitState: "COMPRESSION",
      standardContext: eu,
      designContext: { ...designContext(), standardContextRef: eu.contextId },
      requiredProperties: [],
    }));
    expect(euOut.implemented).toBe(false);
    expect(euOut.maturity).toBe("FRAMEWORK_ONLY");
    expect(STEEL_ADAPTER_BOUNDARIES.EU_STEEL.implemented).toBe(false);
    expect(STEEL_ADAPTER_BOUNDARIES.US_STEEL.implemented).toBe(false);
    expect(D1D_AU2_D0_RISK_DISPOSITION.CLOSED).toEqual([]);
    expect(isGlobalFirstArchitecture()).toBe(true);
    expect(disciplineMaturity("structural")).toBe("REFERENCE_PARTIALLY_IMPLEMENTED");
  });
});
