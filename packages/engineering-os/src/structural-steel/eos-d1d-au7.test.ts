import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  AI_ENGINEERING_APPROVAL,
  AI_STANDARD_CONFORMANCE_AUTHORITY,
  AS4100_CONFORMANCE_VALIDATED,
  AU_STEEL_PACK_CERTIFIED,
  AU_STEEL_PRODUCT_CLAIM_LEVEL,
  AU_STEEL_RELEASE_CLASSIFICATION,
  AU_STEEL_UNKNOWN_STANDARD_TOKEN,
  BENCHMARK_EQUALS_STANDARD_CONFORMANCE,
  ELASTIC_LTB_EQUALS_CODE_MEMBER_CAPACITY,
  ELASTIC_BUCKLING_EQUALS_CODE_CAPACITY,
  GENERAL_AU_MEMBER_DESIGN_VALIDATED,
  GENERAL_FEA_CAPABILITY_CLAIMED,
  LLM_STEEL_CAPACITY_AUTHORITY,
  MECHANICS_REFERENCE_EQUALS_CODE_CAPACITY,
  NUMERICAL_VALIDATION_EQUALS_PROJECT_APPROVAL,
  OPTIMIZATION_ACCEPTS_UNDETERMINED_AS_PASS,
  SOFTWARE_CERTIFICATION_EQUALS_PROJECT_APPROVAL,
  STANDARD_CONFORMANCE_EQUALS_PROJECT_APPROVAL,
  VALIDATION_DIMENSIONS_SEPARATE,
} from "@rtb/types";
import { disciplineMaturity } from "../discipline-capability";
import { isGlobalFirstArchitecture } from "../global-governance";
import { A15A_V5_FEATURE_FREEZE } from "../work-generator/structural/freeze";
import { aggregateEngineeringCheckState } from "./au-member/aggregate";
import { evaluateAuSteelServiceability } from "./au-member/serviceability";
import { invalidationTags } from "./au-member/invalidation";
import {
  allAuNumericalBenchmarks,
  assertAiCannotCertifyConformance,
  assertAiCannotPromoteMethodMaturity,
  assertApprovalRemainsSeparate,
  assertAs4100ConformanceNotValidatedWithoutEvidence,
  assertNoNumericalInteractionMethods,
  assertPackCertificationNotOverstated,
  assertThirdPartyEvidenceNotFabricated,
  AU_METHOD_VALIDATION_INVENTORY,
  AU_NUMERICAL_METHOD_IDS,
  AU_STEEL_VALIDATION_MATRIX,
  AU_TENSION_VALIDATION_STATE,
  AU_THIRD_PARTY_VALIDATION_RECORDS,
  AU_VALIDATION_DEBT_REGISTER,
  AU_VALIDATION_PRIORITY_PLAN,
  auditBenchmarkRecord,
  BENCHMARK_AUDIT_BY_METHOD,
  D1D_AU7_D0_RISK_DISPOSITION,
  deriveAuSteelProductClaim,
  deriveAuSteelReleaseClassification,
  IMPLEMENTED_INTERACTION_METHODS,
  scoreAllIndependentBenchmarks,
  STEEL_ADAPTER_BOUNDARIES,
  THIRD_PARTY_VALIDATION_STATE,
} from "./index";

const here = dirname(fileURLToPath(import.meta.url));

function readSteelTree(dir = here): string {
  const entries = readdirSync(dir, { withFileTypes: true });
  return entries.map((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== "node_modules") return readSteelTree(path);
    if (entry.name.endsWith(".test.ts")) return "";
    if (entry.name.endsWith(".ts") || entry.name.endsWith(".md")) return readFileSync(path, "utf8");
    return "";
  }).join("\n");
}

describe("EOS-D1D-AU-7 Australian steel validation and conformance gate", () => {
  it("inventories every AU method with separate validation dimensions and independent benchmarks", () => {
    expect(VALIDATION_DIMENSIONS_SEPARATE).toBe(true);
    const numerical = AU_METHOD_VALIDATION_INVENTORY.filter((row) => row.numericalValidationState === "PASS");
    expect(numerical.map((row) => row.methodId).sort()).toEqual([...AU_NUMERICAL_METHOD_IDS].sort());
    expect(AU_NUMERICAL_METHOD_IDS).toEqual(expect.arrayContaining([
      "AU_TENSION_GROSS_YIELD",
      "AU_TENSION_NET_FRACTURE",
      "AU_COMPRESSION_SQUASH_YIELD",
      "AU_COMPRESSION_EULER_MAJOR",
      "AU_COMPRESSION_EULER_MINOR",
      "AU_BENDING_ELASTIC_MAJOR",
      "AU_BENDING_ELASTIC_MINOR",
      "AU_BENDING_ELASTIC_LTB",
      "AU_SHEAR_YIELD_REFERENCE",
      "AU_SHEAR_BUCKLING_REFERENCE",
    ]));
    for (const row of AU_METHOD_VALIDATION_INVENTORY) {
      expect(row.standardConformanceState).toBe("INTENDED_PROFILE");
      expect(row.engineeringValidationState).toBe("VALIDATION_REQUIRED");
      expect(row.humanReviewRequirement).toBe("required");
      expect(row.classifications.includes("CODE_PROFILE_METHOD")).toBe(false);
    }
    const scored = scoreAllIndependentBenchmarks();
    expect(scored).toHaveLength(10);
    expect(scored.every((row) => row.evidenceRef.endsWith(":PASS"))).toBe(true);
    expect(allAuNumericalBenchmarks().every((row) => auditBenchmarkRecord(row) === "PARTIAL" || auditBenchmarkRecord(row) === "PASS")).toBe(true);
    expect(scored.every((row) => auditBenchmarkRecord(row) === "PASS")).toBe(true);
    expect(Object.values(BENCHMARK_AUDIT_BY_METHOD).every((state) => state === "PASS")).toBe(true);
    expect(AU_TENSION_VALIDATION_STATE).toMatch(/INTENDED_PROFILE/);
  });

  it("does not promote mechanics references, Euler, LTB, or interaction gaps to code design", () => {
    expect(MECHANICS_REFERENCE_EQUALS_CODE_CAPACITY).toBe(false);
    expect(ELASTIC_BUCKLING_EQUALS_CODE_CAPACITY).toBe(false);
    expect(ELASTIC_LTB_EQUALS_CODE_MEMBER_CAPACITY).toBe(false);
    expect(BENCHMARK_EQUALS_STANDARD_CONFORMANCE).toBe(false);
    assertNoNumericalInteractionMethods();
    expect(IMPLEMENTED_INTERACTION_METHODS).toEqual([]);
    expect(GENERAL_AU_MEMBER_DESIGN_VALIDATED).toBe(false);
    const interactionGap = aggregateEngineeringCheckState([
      {
        checkKind: "TENSION",
        applicable: true,
        state: "CHECK_SATISFIED",
        completeness: "COMPLETE",
        incompleteReason: null,
        checkRef: "t",
        utilization: 0.4,
        utilizationComparable: true,
        reportLanguage: "deterministic check satisfied",
        methodMaturity: "BENCHMARKED",
      },
      {
        checkKind: "BENDING_MAJOR",
        applicable: true,
        state: "CHECK_SATISFIED",
        completeness: "COMPLETE",
        incompleteReason: null,
        checkRef: "b",
        utilization: 0.5,
        utilizationComparable: true,
        reportLanguage: "deterministic check satisfied",
        methodMaturity: "BENCHMARKED",
      },
      {
        checkKind: "COMBINED_ACTION",
        applicable: true,
        state: "CHECK_UNDETERMINED",
        completeness: "INCOMPLETE_INTERACTION",
        incompleteReason: "INTERACTION_RULE_VALIDATION_REQUIRED",
        checkRef: "i",
        utilization: null,
        utilizationComparable: false,
        reportLanguage: "interaction validation required",
        methodMaturity: "FRAMEWORK_ONLY",
      },
    ]);
    expect(interactionGap).toBe("CHECK_UNDETERMINED");
    const missingSls = evaluateAuSteelServiceability({
      memberRef: "m-au7",
      standardProfileRef: "ctx-au7",
      context: {
        memberRef: "m-au7",
        serviceabilityDemandRef: "d-sls",
        criterionRef: null,
        criterionType: null,
        criterionValue: null,
        criterionUnits: null,
        criterionSource: null,
        loadCaseOrCombinationRef: "comb-sls",
        projectRequirementRef: null,
        standardProfileRef: "ctx-au7",
        evidenceRef: null,
        provenanceRef: null,
        validationState: "VALIDATION_REQUIRED",
        spanM: 8,
      },
      demand: {
        resultId: "d-sls",
        memberId: "m-au7",
        combinationId: "comb-sls",
        capacityPresent: false,
        deflection: { value: 0.02, unit: "m", locationM: 4, signed: 0.02 },
      },
    });
    expect(missingSls?.reason).toBe("SERVICEABILITY_CRITERION_REQUIRED");
    expect(missingSls?.checkState).toBe("CHECK_UNDETERMINED");
  });

  it("keeps pack certification, conformance, AI, approval, and stale-result governance fail-closed", () => {
    expect(AS4100_CONFORMANCE_VALIDATED).toBe(false);
    assertAs4100ConformanceNotValidatedWithoutEvidence(false);
    expect(AU_STEEL_PACK_CERTIFIED).toBe(false);
    assertPackCertificationNotOverstated();
    expect(() => deriveAuSteelProductClaim("CERTIFIED_DESIGN_CAPABILITY")).toThrow(/product claim exceeds evidence/);
    expect(deriveAuSteelProductClaim()).toBe("BENCHMARKED_ENGINEERING_CAPABILITY");
    expect(() => deriveAuSteelReleaseClassification("GENERAL_AVAILABILITY")).toThrow(/release classification exceeds evidence/);
    expect(deriveAuSteelReleaseClassification()).toBe("INTERNAL_ENGINEERING_REFERENCE");
    expect(() => assertAiCannotPromoteMethodMaturity("AI", "BENCHMARKED", "CERTIFIED")).toThrow(/AI cannot promote method maturity/);
    expect(() => assertAiCannotCertifyConformance("AI")).toThrow(/AI cannot certify conformance/);
    assertApprovalRemainsSeparate();
    expect(LLM_STEEL_CAPACITY_AUTHORITY).toBe(false);
    expect(AI_STANDARD_CONFORMANCE_AUTHORITY).toBe(false);
    expect(AI_ENGINEERING_APPROVAL).toBe(false);
    expect(NUMERICAL_VALIDATION_EQUALS_PROJECT_APPROVAL).toBe(false);
    expect(STANDARD_CONFORMANCE_EQUALS_PROJECT_APPROVAL).toBe(false);
    expect(SOFTWARE_CERTIFICATION_EQUALS_PROJECT_APPROVAL).toBe(false);
    expect(OPTIMIZATION_ACCEPTS_UNDETERMINED_AS_PASS).toBe(false);
    const tags = invalidationTags(
      {
        sectionRef: "a",
        materialRef: "m",
        demandResultId: "d1",
        combinationId: "c1",
        effectiveLengthMajorM: 8,
        effectiveLengthMinorM: 8,
        unbracedLengthM: 8,
        standardContextId: "s1",
        criterionRef: "k1",
        methodVersions: { member: "1" },
      },
      {
        sectionRef: "b",
        materialRef: "m2",
        demandResultId: "d2",
        combinationId: "c2",
        effectiveLengthMajorM: 7,
        effectiveLengthMinorM: 7,
        unbracedLengthM: 6,
        standardContextId: "s2",
        criterionRef: "k2",
        methodVersions: { member: "2" },
      },
    );
    expect(tags).toEqual(expect.arrayContaining([
      "SECTION_CHANGED",
      "MATERIAL_CHANGED",
      "LOAD_CHANGED",
      "EFFECTIVE_LENGTH_CHANGED",
      "UNBRACED_LENGTH_CHANGED",
      "SERVICEABILITY_CRITERION_CHANGED",
      "STANDARD_PROFILE_CHANGED",
    ]));
    expect(AU_STEEL_VALIDATION_MATRIX).toHaveLength(11);
    expect(AU_STEEL_VALIDATION_MATRIX.every((row) => row.certified === false && row.conformanceValidated === false)).toBe(true);
    expect(AU_VALIDATION_DEBT_REGISTER.length).toBeGreaterThanOrEqual(10);
    expect(AU_VALIDATION_PRIORITY_PLAN[0]?.priority).toBe("SAFETY_CRITICAL");
    expect(AU_THIRD_PARTY_VALIDATION_RECORDS).toEqual([]);
    expect(THIRD_PARTY_VALIDATION_STATE).toBe("NOT_AVAILABLE");
    assertThirdPartyEvidenceNotFabricated();
    expect(auProfileEdition()).toBe(AU_STEEL_UNKNOWN_STANDARD_TOKEN);
  });

  it("finds no misleading positive conformance claims and keeps global core jurisdiction-neutral", () => {
    const steelSrc = readSteelTree();
    const docsDir = join(here, "../../../../docs/architecture/engineering-os");
    const auDocs = readdirSync(docsDir).filter((name) => name.startsWith("EOS_D1D_AU") || name.startsWith("EOS_D1D0")).map((name) => readFileSync(join(docsDir, name), "utf8")).join("\n");
    const corpus = `${steelSrc}\n${auDocs}`;
    const positive = [
      /is AS 4100 compliant/i,
      /AS4100_COMPLIANT\s*=\s*YES/i,
      /AU_STEEL_PACK_CERTIFIED\s*=\s*true/i,
      /AU_STEEL_PACK_CERTIFIED\s*=\s*YES/i,
    ];
    for (const pattern of positive) {
      expect(corpus).not.toMatch(pattern);
    }
    const adapterSrc = readFileSync(join(here, "adapters.ts"), "utf8");
    expect(adapterSrc).not.toMatch(/AU_METHOD_VALIDATION_INVENTORY|independentEulerN/);
    const globalCore = readFileSync(join(here, "properties.ts"), "utf8");
    expect(globalCore).not.toMatch(/AU_TENSION_GROSS_YIELD|AU_SHEAR_YIELD_REFERENCE/);
    expect(STEEL_ADAPTER_BOUNDARIES.EU_STEEL.implemented).toBe(false);
    expect(STEEL_ADAPTER_BOUNDARIES.US_STEEL.implemented).toBe(false);
    expect(GENERAL_FEA_CAPABILITY_CLAIMED).toBe(false);
    expect(A15A_V5_FEATURE_FREEZE.spaceGassRealSolverExecution).toBe("NOT_CERTIFIED");
    expect(D1D_AU7_D0_RISK_DISPOSITION.CLOSED).toEqual([]);
    expect(isGlobalFirstArchitecture()).toBe(true);
    expect(disciplineMaturity("structural")).toBe("REFERENCE_PARTIALLY_IMPLEMENTED");
    expect(AU_STEEL_PRODUCT_CLAIM_LEVEL).toBe("BENCHMARKED_ENGINEERING_CAPABILITY");
    expect(AU_STEEL_RELEASE_CLASSIFICATION).toBe("INTERNAL_ENGINEERING_REFERENCE");
  });
});

function auProfileEdition(): string {
  return AU_STEEL_UNKNOWN_STANDARD_TOKEN;
}
