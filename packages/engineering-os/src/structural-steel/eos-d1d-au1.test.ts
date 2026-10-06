import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  AI_ENGINEERING_APPROVAL,
  AI_STANDARD_CONFORMANCE_AUTHORITY,
  CHECK_RESULT_EQUALS_ENGINEERING_APPROVAL,
  GLOBAL_STEEL_CORE_MODIFIED_FOR_AU_FORMULAS,
  LLM_MEMORY_ONLY_RULE_ALLOWED,
  LLM_STEEL_CAPACITY_AUTHORITY,
  SILENT_STANDARD_EDITION_INFERENCE,
  UNKNOWN_CODE_PARAMETER_GUESSED,
  type SteelCapacityEngineInput,
  type SteelDesignContext,
  type SteelMaterialDesignProperties,
  type SteelSectionDesignProperties,
  type StructuralDemandResult,
} from "@rtb/types";
import { disciplineMaturity } from "../discipline-capability";
import { isGlobalFirstArchitecture } from "../global-governance";
import { createConfiguredKnowledgeContext, exampleEurocodeAnnex } from "../structural-domain/binding";
import { governedProvenance } from "../structural-domain/catalog";
import {
  applyHumanRuleConfirmation,
  assertEngineeringRuleAuthority,
  assertLlmCannotOriginateCapacity,
  assertNotCertified,
  assertOptimizationCandidateRecheck,
  AU_STEEL_NATIONAL_ANNEX,
  AU_TENSION_METHOD_REGISTRY,
  AU_TENSION_UNSUPPORTED_METHODS,
  consumeDemandHandoff,
  createAuSteelStandardProfile,
  D1D_AU1_D0_RISK_DISPOSITION,
  evaluateSteelCapacity,
  orchestrateAuTensionDesignCheck,
  requestAuTensionDesignCapacityReduction,
  scoreTensionBenchmark,
  selectSteelAdapter,
  STEEL_ADAPTER_BOUNDARIES,
} from "./index";

const auProfile = createAuSteelStandardProfile({ contextId: "ctx-au-tension-au1" });

function tensileDemand(valueN = 1_000_000): SteelCapacityEngineInput["demand"] {
  return {
    resultId: "demand-au1",
    memberId: "m-au1",
    shear: { value: 0, unit: "N", locationM: 0, signed: 0 },
    moment: { value: 0, unit: "N.m", locationM: 0, signed: 0 },
    axial: { valueN, unit: "N", method: "AXIAL_DIRECT" },
    deflection: { status: "NOT_IMPLEMENTED", reason: "not required" },
    capacityPresent: false,
    standardContext: auProfile,
    inputEvidenceRefs: [{ evidenceId: "ev-d1c", sourceKind: "calculation", reference: "d1c-axial" }],
    combinationId: "comb-au1",
  };
}

function material(patch: Partial<SteelMaterialDesignProperties> = {}): SteelMaterialDesignProperties {
  return {
    materialRef: "mat-au1",
    grade: "300PLUS",
    yieldStrength: { name: "fy", value: 300, unit: "MPa", provenanceRef: "mill-cert", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE" },
    ultimateStrength: { name: "fu", value: 440, unit: "MPa", provenanceRef: "mill-cert", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE" },
    elasticModulus: null,
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
    sectionRef: "sec-au1",
    sectionFamily: "UB",
    catalogSource: "AUST300",
    catalogVersion: "LIBRARY_SECTION_Aust300.sls",
    jurisdictionApplicability: ["australia"],
    area: { name: "Ag", value: 5140, unit: "mm2", provenanceRef: "engineer-section-props", sourceAuthority: "OTHER_GOVERNED_SOURCE" },
    Iyy: null,
    Izz: null,
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

function designContext(): SteelDesignContext {
  return {
    designContextId: "dc-au1",
    memberRef: "m-au1",
    sectionRef: "sec-au1",
    materialRef: "mat-au1",
    demandRefs: ["demand-au1"],
    standardContextRef: auProfile.contextId,
    parameterSetRef: null,
    effectiveLengthContextRef: null,
    restraintContextRef: null,
    stabilityContextRef: null,
    fabricationContextRef: null,
    evidenceRefs: [{ evidenceId: "ev-eng", sourceKind: "human_input", reference: "engineer" }],
    toolRef: "EOS_AU_STEEL_TENSION",
    methodRef: "AU_TENSION",
    provenanceRef: governedProvenance({ jurisdiction: "australia", standard: "AS 4100", calculationMethod: "AU_TENSION" }),
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
    demand: tensileDemand(),
    limitState: "TENSION",
    requiredProperties: [],
    ...patch,
  };
}

describe("EOS-D1D-AU-1 Australian steel tension", () => {
  it("evaluates governed nominal tension, preserves both rules, and selects governing capacity", () => {
    const result = evaluateSteelCapacity(capacityInput());
    expect(result.implemented).toBe(true);
    expect(result.maturity).toBe("BENCHMARKED");
    expect(result.standardConformanceState).toBe("INTENDED_PROFILE");
    expect(result.implementationBindingState).toBe("IMPLEMENTED_UNVERIFIED_STANDARD_BINDING");
    expect(result.tensionChecks).toHaveLength(2);
    expect(result.capacity?.value).toBe(1_542_000);
    expect(result.capacity?.units).toBe("N");
    expect(result.governingMethodId).toBe("AU_TENSION_GROSS_YIELD");
    expect(result.tensionChecks?.map((row) => row.capacityValueN)).toEqual([1_542_000, 1_980_000]);
    expect(result.capacity?.llmOriginated).toBe(false);
    expect(consumeDemandHandoff(capacityInput().demand as Pick<StructuralDemandResult, "resultId" | "capacityPresent" | "memberId">)).toBe("demand-au1");
    expect(capacityInput().demand.combinationId).toBe("comb-au1");
    const netGoverns = evaluateSteelCapacity(capacityInput({
      section: section({ netArea: { name: "An", value: 2000, unit: "mm2", provenanceRef: "holes", sourceAuthority: "OTHER_GOVERNED_SOURCE" } }),
    }));
    expect(netGoverns.capacity?.value).toBe(880_000);
    expect(netGoverns.governingMethodId).toBe("AU_TENSION_NET_FRACTURE");
  });

  it("requires engineering-rule authority and rejects LLM memory", () => {
    expect(LLM_MEMORY_ONLY_RULE_ALLOWED).toBe(false);
    expect(() => assertEngineeringRuleAuthority("LLM_MEMORY_ONLY")).toThrow(/LLM_MEMORY_ONLY/);
    expect(() => assertEngineeringRuleAuthority("UNSOURCED_WEB_SUMMARY")).toThrow(/not an allowed/);
    expect(AU_TENSION_METHOD_REGISTRY.every((rule) => rule.authorityType === "ESTABLISHED_ENGINEERING_MECHANICS")).toBe(true);
    expect(AU_TENSION_METHOD_REGISTRY.every((rule) => rule.intendedStandardProfile === "AS4100")).toBe(true);
    expect(AU_TENSION_METHOD_REGISTRY.every((rule) => rule.standardConformanceState === "INTENDED_PROFILE")).toBe(true);
    expect(auProfile.edition).toBe("UNKNOWN_PENDING_CONFIRMATION");
    expect(auProfile.amendment).toBe("UNKNOWN_PENDING_CONFIRMATION");
    expect(AU_STEEL_NATIONAL_ANNEX).toBe("NOT_APPLICABLE");
    expect(SILENT_STANDARD_EDITION_INFERENCE).toBe(false);
  });

  it("fails closed for missing inputs, units, jurisdiction, certified claims, and unknown code parameters", () => {
    expect(() => evaluateSteelCapacity(capacityInput({ material: material({ yieldStrength: null }) }))).toThrow(/missing material.yieldStrength/);
    expect(() => evaluateSteelCapacity(capacityInput({ material: material({ ultimateStrength: null }) }))).toThrow(/missing material.ultimateStrength/);
    expect(() => evaluateSteelCapacity(capacityInput({ section: section({ area: null }) }))).toThrow(/missing section.area/);
    expect(() => evaluateSteelCapacity(capacityInput({ section: section({ netArea: null }) }))).toThrow(/missing section.netArea|AUST300/);
    expect(() => evaluateSteelCapacity(capacityInput({ section: section({ sectionFamily: "unknown" }) }))).toThrow(/unsupported section type/);
    expect(() => evaluateSteelCapacity(capacityInput({
      material: material({ yieldStrength: { name: "fy", value: 300, unit: "ksi", provenanceRef: "mill-cert", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE" } }),
    }))).toThrow(/units incompatible/);
    expect(() => selectSteelAdapter("AU_STEEL", { ...auProfile, jurisdictionProfileRef: "united-states" })).toThrow(/unsupported jurisdiction/);
    expect(() => evaluateSteelCapacity(capacityInput({ standardContext: { ...auProfile, edition: "" } }))).toThrow(/edition/);
    expect(() => evaluateSteelCapacity(capacityInput({
      limitState: "OTHER",
      requiredProperties: [],
    }))).toThrow(/unsupported calculation scope/);
    expect(() => evaluateSteelCapacity(capacityInput({ designContext: { ...designContext(), validationState: "CERTIFIED" } }))).toThrow(/certified/);
    expect(() => requestAuTensionDesignCapacityReduction()).toThrow(/unknown required code parameter/);
    expect(UNKNOWN_CODE_PARAMETER_GUESSED).toBe(false);
    expect(AU_TENSION_UNSUPPORTED_METHODS.COMPRESSION).toBe(false);
    expect(() => evaluateSteelCapacity(capacityInput({
      demand: { ...tensileDemand(), resultId: "", axial: { status: "NO_AXIAL_COMPONENTS", valueN: 0 } },
    }))).toThrow(/demand missing/);
    expect(() => evaluateSteelCapacity(capacityInput({
      material: material({ yieldStrength: { name: "fy", value: 300, unit: "MPa", provenanceRef: "", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE" } }),
    }))).toThrow(/source\/provenance/);
  });

  it("computes utilization without approval and independently benchmarks both methods", () => {
    const satisfied = orchestrateAuTensionDesignCheck({
      designCheckId: "chk-ok",
      designContext: designContext(),
      capacityInput: capacityInput(),
    });
    expect(satisfied.verdict).toBe("CHECK_SATISFIED");
    expect(satisfied.utilization?.ratio).toBeCloseTo(1_000_000 / 1_542_000);
    expect(satisfied.engineeringApproved).toBe(false);
    expect(satisfied.designCheck.approvalState).toBe("not_approved");
    expect(satisfied.humanReviewRequired).toBe(true);
    const unsatisfied = orchestrateAuTensionDesignCheck({
      designCheckId: "chk-fail",
      designContext: designContext(),
      capacityInput: capacityInput({ demand: tensileDemand(2_000_000) }),
    });
    expect(unsatisfied.verdict).toBe("CHECK_NOT_SATISFIED");
    expect(unsatisfied.engineeringApproved).toBe(false);
    const yieldBm = scoreTensionBenchmark("AU-TENSION-BM-GROSS-YIELD-HAND-1", 1_542_000);
    const netBm = scoreTensionBenchmark("AU-TENSION-BM-NET-FRACTURE-HAND-1", 1_980_000);
    expect(yieldBm.evidenceRef).toMatch(/PASS/);
    expect(netBm.evidenceRef).toMatch(/PASS/);
    expect(CHECK_RESULT_EQUALS_ENGINEERING_APPROVAL).toBe(false);
    expect(AI_ENGINEERING_APPROVAL).toBe(false);
  });

  it("keeps AI, AUST300, EU/US, confirmation, and global-core boundaries", () => {
    expect(() => assertLlmCannotOriginateCapacity(true)).toThrow(/originate capacity/);
    expect(LLM_STEEL_CAPACITY_AUTHORITY).toBe(false);
    expect(AI_STANDARD_CONFORMANCE_AUTHORITY).toBe(false);
    expect(GLOBAL_STEEL_CORE_MODIFIED_FOR_AU_FORMULAS).toBe(false);
    expect(() => assertOptimizationCandidateRecheck({
      candidateSectionRef: "sec-opt",
      proposedBy: "OPTIMIZER",
      deterministicRecheckRequired: true,
      rechecked: false,
    })).toThrow(/deterministic recheck/);
    const confirmed = applyHumanRuleConfirmation(AU_TENSION_METHOD_REGISTRY[0]!, {
      ruleId: AU_TENSION_METHOD_REGISTRY[0]!.ruleId,
      confirmedEquationId: "nominal-yield-stress-times-gross-area",
      confirmedParameter: null,
      confirmedApplicability: "tension members with explicit Ag",
      edition: "UNKNOWN_PENDING_CONFIRMATION",
      amendment: "UNKNOWN_PENDING_CONFIRMATION",
      referenceIdentifier: null,
      reviewer: "engineer",
      confirmedAt: "2026-10-05T00:00:00.000Z",
    });
    expect(confirmed.standardConformanceState).toBe("ENGINEER_CONFIRMED");
    expect(() => assertNotCertified(AU_TENSION_METHOD_REGISTRY[0]!, "CERTIFIED")).toThrow(/certified/);
    const adapterSrc = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "adapters.ts"), "utf8");
    expect(adapterSrc).not.toMatch(/grossYieldN|fyPa \* agM2|0\.9 \* /);
    const eu = {
      ...createConfiguredKnowledgeContext({
        contextId: "ctx-en1993-au1",
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
      designContext: { ...designContext(), standardContextRef: eu.contextId, demandRefs: ["demand-au1"] },
      requiredProperties: [],
    }));
    expect(euOut.implemented).toBe(false);
    expect(euOut.maturity).toBe("FRAMEWORK_ONLY");
    expect(STEEL_ADAPTER_BOUNDARIES.EU_STEEL.implemented).toBe(false);
    expect(STEEL_ADAPTER_BOUNDARIES.US_STEEL.implemented).toBe(false);
    expect(STEEL_ADAPTER_BOUNDARIES.AU_STEEL.implemented).toBe(true);
    expect(D1D_AU1_D0_RISK_DISPOSITION.CLOSED).toEqual([]);
    expect(isGlobalFirstArchitecture()).toBe(true);
    expect(disciplineMaturity("structural")).toBe("REFERENCE_PARTIALLY_IMPLEMENTED");
  });
});
