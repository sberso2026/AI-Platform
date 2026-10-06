import { describe, expect, it } from "vitest";
import {
  AUST300_GLOBAL_DEFAULT,
  AU_ONLY_STEEL_CORE,
  CHECK_RESULT_EQUALS_ENGINEERING_APPROVAL,
  EU_ONLY_STEEL_CORE,
  LLM_STEEL_CAPACITY_AUTHORITY,
  STEEL_LIMIT_STATES,
  STRUCTURAL_OBJECT_KINDS,
  US_ONLY_STEEL_CORE,
  type SteelCapacityEngineInput,
  type SteelDesignContext,
  type SteelMaterialDesignProperties,
  type SteelSectionDesignProperties,
  type SteelStabilityContext,
  type StructuralDemandResult,
  type StructuralStandardContext,
} from "@rtb/types";
import { disciplineMaturity } from "../discipline-capability";
import { isGlobalFirstArchitecture } from "../global-governance";
import { createConfiguredKnowledgeContext, exampleEurocodeAnnex } from "../structural-domain/binding";
import { governedProvenance } from "../structural-domain/catalog";
import {
  assertAust300NotGlobal,
  assertImplementedSteelEdition,
  assertLlmCannotOriginateCapacity,
  assertOptimizationCandidateRecheck,
  assertRiskLedgerNotReopened,
  AU_STEEL_IMPLEMENTATION_SUBPHASES,
  aust300AsAuCatalogIdentity,
  CANONICAL_D0_D1_RISK_STATE,
  consumeDemandHandoff,
  D1D0_D0_RISK_DISPOSITION,
  EU_STEEL_IMPLEMENTATION_SUBPHASES,
  evaluateSteelCapacity,
  orchestrateSteelDesignCheck,
  RISK_LEDGER_DISCREPANCY_CLASSIFICATION,
  selectSteelAdapter,
  simpleUtilization,
  STEEL_ADAPTER_BOUNDARIES,
  US_STEEL_IMPLEMENTATION_SUBPHASES,
} from "./index";

const auContext: StructuralStandardContext = createConfiguredKnowledgeContext({
  contextId: "ctx-as4100-steel",
  jurisdictionProfileRef: "australia",
  standardFamily: "AS",
  standardCode: "AS 4100",
  edition: "2020",
  materialScope: "steel",
});

function demand(memberId = "m1"): Pick<StructuralDemandResult, "resultId" | "memberId" | "shear" | "moment" | "axial" | "deflection" | "capacityPresent" | "standardContext" | "inputEvidenceRefs" | "combinationId"> {
  return {
    resultId: "demand-1",
    memberId,
    shear: { value: 78000, unit: "N", locationM: 0, signed: 78000 },
    moment: { value: 156000, unit: "N.m", locationM: 4, signed: 156000 },
    axial: { status: "NO_AXIAL_COMPONENTS", valueN: 0 },
    deflection: { status: "NOT_IMPLEMENTED", reason: "not required" },
    capacityPresent: false,
    standardContext: auContext,
    inputEvidenceRefs: [{ evidenceId: "ev-d", sourceKind: "calculation", reference: "d1c" }],
    combinationId: null,
  };
}

function material(yieldPresent = true): SteelMaterialDesignProperties {
  return {
    materialRef: "mat-1",
    grade: "300PLUS",
    yieldStrength: yieldPresent
      ? { name: "fy", value: 300, unit: "MPa", provenanceRef: "mill-cert", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE" }
      : null,
    ultimateStrength: { name: "fu", value: 440, unit: "MPa", provenanceRef: "mill-cert", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE" },
    elasticModulus: { name: "E", value: 200, unit: "GPa", provenanceRef: "mill-cert", sourceAuthority: "USER_SUPPLIED_STANDARD_REFERENCE" },
    shearModulus: null,
    poissonRatio: null,
    density: null,
    thicknessDependentMetadata: null,
    jurisdictionApplicability: ["australia"],
  };
}

function section(areaPresent = true): SteelSectionDesignProperties {
  return {
    sectionRef: "sec-1",
    sectionFamily: "UB",
    catalogSource: "AUST300",
    catalogVersion: "LIBRARY_SECTION_Aust300.sls",
    jurisdictionApplicability: ["australia"],
    area: areaPresent
      ? { name: "A", value: 0.00514, unit: "m2", provenanceRef: "au-catalog", sourceAuthority: "OTHER_GOVERNED_SOURCE" }
      : null,
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
    netArea: null,
    geometricDimensions: {},
  };
}

function stability(effective: number | null = 4): SteelStabilityContext {
  return {
    stabilityContextId: "stab-1",
    memberLengthM: 8,
    effectiveLengthM: effective,
    unbracedLengthM: 8,
    restraintDescription: "ends restrained in-plane",
    bucklingAxis: "MAJOR",
    momentGradientRef: null,
    torsionalRestraint: null,
    lateralRestraint: "continuous",
    sourceEvidenceRef: "ev-stab",
    derived: false,
  };
}

function designContext(): SteelDesignContext {
  return {
    designContextId: "dc-1",
    memberRef: "m1",
    sectionRef: "sec-1",
    materialRef: "mat-1",
    demandRefs: ["demand-1"],
    standardContextRef: auContext.contextId,
    parameterSetRef: null,
    effectiveLengthContextRef: "stab-1",
    restraintContextRef: "stab-1",
    stabilityContextRef: "stab-1",
    fabricationContextRef: null,
    evidenceRefs: [{ evidenceId: "ev-1", sourceKind: "human_input", reference: "engineer" }],
    toolRef: "EOS_STRUCTURAL_DETERMINISTIC_V1",
    methodRef: "STEEL_DESIGN_FRAMEWORK",
    provenanceRef: governedProvenance({ jurisdiction: "australia", standard: "AS 4100" }),
    validationState: "FRAMEWORK_ONLY",
    reviewState: "required",
  };
}

function capacityInput(patch: Partial<SteelCapacityEngineInput> = {}): SteelCapacityEngineInput {
  return {
    adapterId: "AU_STEEL",
    designContext: designContext(),
    standardContext: auContext,
    material: material(),
    section: section(),
    stability: stability(),
    demand: demand(),
    limitState: "TENSION",
    requiredProperties: ["material.yieldStrength", "section.area"],
    ...patch,
  };
}

describe("EOS-D1D-0 common steel design framework", () => {
  it("reconciles the D0/D1 risk ledger without reopening closed risks", () => {
    expect(RISK_LEDGER_DISCREPANCY_CLASSIFICATION).toBe("REPORTING_ERROR");
    expect(CANONICAL_D0_D1_RISK_STATE.CLOSED["D0-R09"]).toBe("D1A");
    expect(CANONICAL_D0_D1_RISK_STATE.CLOSED["D0-R02"]).toBe("D1B");
    expect(CANONICAL_D0_D1_RISK_STATE.CLOSED["D0-R06"]).toBe("D1B");
    expect(CANONICAL_D0_D1_RISK_STATE.REMAINING).not.toContain("D0-R02");
    expect(CANONICAL_D0_D1_RISK_STATE.REMAINING).not.toContain("D0-R09");
    expect(CANONICAL_D0_D1_RISK_STATE.REDUCED["D0-R07"]).toMatch(/D1C/);
    expect(D1D0_D0_RISK_DISPOSITION.CLOSED).toEqual([]);
    expect(() => assertRiskLedgerNotReopened()).not.toThrow();
  });

  it("reuses D1A/D1B/D1C, requires binding, and consumes demand without duplicating statics", () => {
    expect(STRUCTURAL_OBJECT_KINDS).toEqual(expect.arrayContaining(["MEMBER", "SECTION", "MATERIAL", "DESIGN_CHECK", "CAPACITY_RESULT"]));
    expect(consumeDemandHandoff(demand())).toBe("demand-1");
    expect(() => selectSteelAdapter("AU_STEEL", auContext)).not.toThrow();
    expect(() => evaluateSteelCapacity(capacityInput({ standardContext: { ...auContext, standardCode: "" } }))).toThrow(/standard code|ambiguous|fail closed/);
    const missingContext = { ...designContext(), standardContextRef: "other" };
    expect(() => evaluateSteelCapacity(capacityInput({ designContext: missingContext }))).toThrow(/ambiguous/);
  });

  it("fails closed for missing properties, stability, jurisdiction, edition, and annex", () => {
    expect(() => evaluateSteelCapacity(capacityInput({ material: material(false) }))).toThrow(/missing material.yieldStrength/);
    expect(() => evaluateSteelCapacity(capacityInput({ section: section(false) }))).toThrow(/missing section.area/);
    expect(() => evaluateSteelCapacity(capacityInput({ limitState: "COMPRESSION", stability: null, requiredProperties: [] }))).toThrow(/stability context/);
    expect(() => evaluateSteelCapacity(capacityInput({ limitState: "COMPRESSION", stability: stability(null), requiredProperties: [] }))).toThrow(/effective length/);
    expect(() => selectSteelAdapter("AU_STEEL", { ...auContext, jurisdictionProfileRef: "united-states" })).toThrow(/unsupported jurisdiction/);
    expect(() => assertImplementedSteelEdition("AU_STEEL", "2020")).toThrow(/unsupported edition/);
    const eu = {
      ...createConfiguredKnowledgeContext({
        contextId: "ctx-en1993",
        jurisdictionProfileRef: "eu-eea",
        standardFamily: "EN",
        standardCode: "EN 1993-1-1",
        edition: "2005",
        materialScope: "steel",
      }),
      nationalAnnexRef: null,
    };
    expect(() => selectSteelAdapter("EU_STEEL", eu)).toThrow(/National Annex|invalid annex/);
    expect(() => selectSteelAdapter("EU_STEEL", { ...eu, nationalAnnexRef: exampleEurocodeAnnex("EN 1993-1-1", "2005") })).not.toThrow();
  });

  it("keeps simple D/C local, combined actions adapter-specific, and check satisfied off approval", () => {
    const simple = simpleUtilization({ declaredValid: true, demand: { value: 50, unit: "kN" }, capacity: { value: 100, unit: "kN" } });
    expect(simple.ratio).toBeCloseTo(0.5);
    expect(() => simpleUtilization({ declaredValid: false, demand: { value: 1, unit: "kN" }, capacity: { value: 1, unit: "kN" } })).toThrow(/standard adapter/);
    expect(() => orchestrateSteelDesignCheck({
      designCheckId: "chk-1",
      limitState: "COMBINED_ACTION",
      designContext: designContext(),
      capacityInput: capacityInput({ limitState: "COMBINED_ACTION", requiredProperties: [] }),
      simpleUtilizationValid: true,
      demandValue: { value: 1, unit: "N" },
    })).toThrow(/standard adapter/);
    const euContext = {
      ...createConfiguredKnowledgeContext({
        contextId: "ctx-en1993-framework",
        jurisdictionProfileRef: "eu-eea",
        standardFamily: "EN",
        standardCode: "EN 1993-1-1",
        edition: "2005",
        materialScope: "steel",
      }),
      nationalAnnexRef: exampleEurocodeAnnex("EN 1993-1-1", "2005"),
    };
    const euInput = capacityInput({
      adapterId: "EU_STEEL",
      limitState: "SHEAR",
      standardContext: euContext,
      designContext: { ...designContext(), standardContextRef: euContext.contextId },
      requiredProperties: [],
    });
    const outcome = orchestrateSteelDesignCheck({
      designCheckId: "chk-t",
      limitState: "SHEAR",
      designContext: { ...designContext(), standardContextRef: euContext.contextId },
      capacityInput: euInput,
      simpleUtilizationValid: true,
      demandValue: { value: 100, unit: "kN" },
    });
    expect(outcome.verdict).toBe("CHECK_UNDETERMINED");
    expect(outcome.engineeringApproved).toBe(false);
    expect(outcome.designCheck.approvalState).toBe("not_approved");
    expect(CHECK_RESULT_EQUALS_ENGINEERING_APPROVAL).toBe(false);
    const euFramework = evaluateSteelCapacity(euInput);
    expect(euFramework.maturity).toBe("FRAMEWORK_ONLY");
    expect(euFramework.implemented).toBe(false);
    expect(euFramework.reason).not.toMatch(/0\.9|phi|γM1|Fy Ag/);
  });

  it("keeps AI, optimization, AUST300, and global-first boundaries honest", () => {
    expect(() => assertLlmCannotOriginateCapacity(true)).toThrow(/originate capacity/);
    expect(LLM_STEEL_CAPACITY_AUTHORITY).toBe(false);
    expect(() => assertOptimizationCandidateRecheck({
      candidateSectionRef: "sec-2",
      proposedBy: "AI",
      deterministicRecheckRequired: true,
      rechecked: false,
    })).toThrow(/deterministic recheck/);
    expect(aust300AsAuCatalogIdentity("310 UB 40.4").globalDefault).toBe(false);
    expect(aust300AsAuCatalogIdentity("310 UB 40.4").inferredEngineeringProperties).toBe(false);
    expect(() => assertAust300NotGlobal(["global-baseline"])).toThrow(/global catalog/);
    expect(AUST300_GLOBAL_DEFAULT).toBe(false);
    expect(AU_ONLY_STEEL_CORE).toBe(false);
    expect(EU_ONLY_STEEL_CORE).toBe(false);
    expect(US_ONLY_STEEL_CORE).toBe(false);
    expect(STEEL_ADAPTER_BOUNDARIES.AU_STEEL.ready).toBe(true);
    expect(STEEL_LIMIT_STATES).toEqual(expect.arrayContaining(["TENSION", "COMPRESSION", "BENDING_MAJOR", "SHEAR", "COMBINED_ACTION"]));
    expect(isGlobalFirstArchitecture()).toBe(true);
    expect(disciplineMaturity("structural")).toBe("REFERENCE_PARTIALLY_IMPLEMENTED");
    expect(AU_STEEL_IMPLEMENTATION_SUBPHASES[0]).toMatch(/AU-1/);
    expect(EU_STEEL_IMPLEMENTATION_SUBPHASES[0]).toMatch(/EU-1/);
    expect(US_STEEL_IMPLEMENTATION_SUBPHASES[0]).toMatch(/US-1/);
  });
});
