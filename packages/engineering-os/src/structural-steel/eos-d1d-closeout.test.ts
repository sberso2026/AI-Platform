import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  AI_ENGINEERING_APPROVAL,
  AU_STEEL_IMPLEMENTATION_MATURITY,
  AU_STEEL_PACK_CERTIFIED,
  AU_STEEL_PRODUCT_CLAIM_LEVEL,
  AU_STEEL_RELEASE_CLASSIFICATION,
  AU_STEEL_STANDARD_CONFORMANCE_STATE,
  COMMON_MECHANICS_CONTAINS_CODE_AUTHORITY,
  COMPLETE_STEEL_DESIGN_PRODUCT,
  COMPONENT_UTILIZATION_EQUALS_INTERACTION_CHECK,
  COPYRIGHTED_STANDARD_TEXT_COMMITTED,
  D1D_ARCHITECTURE_CONTRACT_FROZEN,
  D1D_CANONICAL_NEXT_PHASE,
  D1D_CANONICAL_NEXT_PHASE_SCOPE,
  D1D_CAPABILITY_CLASSIFICATION_SINGLE_SOURCE_OF_TRUTH,
  D1D_CAPABILITY_GATING_LEVELS,
  D1D_ENGINEERING_AUTHORITY_LAYERS_SEPARATE,
  D1D_EXTERNAL_SOLVER_BOUNDARY_PRESERVED,
  D1D_FUTURE_EXTENSION_RULE_DEFINED,
  D1D_FUTURE_STANDARDS_VALIDATION_TRACK_DEFINED,
  D1D_GLOBAL_RELEASE_CLASSIFICATION,
  D1D_GLOBAL_STEEL_ARCHITECTURE_VALIDATED,
  D1D_MISLEADING_PRODUCT_CLAIMS,
  D1D_PHASE_COMPLETE,
  D1D_PHASE_INVENTORY_COMPLETE,
  D1D_PRODUCT_CAPABILITY_GATING,
  D1D_RISK_LEDGER_RECONCILED,
  D1D_STEEL_MATURITY,
  D1_CLOSEOUT_ROADMAP_CONFLICT,
  D1_ROADMAP_HANDOFF_VALIDATED,
  EMPLOYEE_BEHAVIOR_PROFILING,
  EOS_D1D_CLOSEOUT_CLOSED,
  EOS_D1D_CLOSEOUT_PHASE,
  EU_HIGH_WATER_MARK_INHERITED,
  EU_STEEL_IMPLEMENTATION_MATURITY,
  EU_STEEL_PACK_CERTIFIED,
  EU_STEEL_PRODUCT_CLAIM_LEVEL,
  EU_STEEL_RELEASE_CLASSIFICATION,
  EU_STEEL_STANDARD_CONFORMANCE_STATE,
  GENERAL_CONNECTION_DESIGN_VALIDATED,
  GENERAL_FEA_CAPABILITY_CLAIMED,
  GENERAL_SEISMIC_STEEL_DESIGN_VALIDATED,
  GLOBAL_MECHANICS_JURISDICTION_NEUTRAL,
  GLOBAL_OPTIMIZATION_ACCEPTS_UNDETERMINED,
  GLOBAL_STEEL_GOVERNANCE_NOT_WEAKENED,
  LLM_NUMERICAL_ENGINEERING_AUTHORITY,
  MEMBER_VALIDATION_IMPLIES_CONNECTION_VALIDATION,
  MEMBER_VALIDATION_IMPLIES_FOUNDATION_VALIDATION,
  NEW_MAJOR_DESIGN_METHOD_IMPLEMENTED,
  NEW_MAJOR_DESIGN_METHOD_IMPLEMENTED_IN_D1D_CLOSEOUT,
  PARALLEL_AU_STEEL_CORE,
  PARALLEL_EU_STEEL_CORE,
  PARALLEL_US_STEEL_CORE,
  SCHEMA_CHANGE_REQUIRED_FOR_D1D_CLOSEOUT,
  STANDARD_TEXT_REQUIRED_BY_RUNTIME,
  US_STEEL_IMPLEMENTATION_MATURITY,
  US_STEEL_PACK_CERTIFIED,
  US_STEEL_PRODUCT_CLAIM_LEVEL,
  US_STEEL_RELEASE_CLASSIFICATION,
  US_STEEL_STANDARD_CONFORMANCE_STATE,
} from "@rtb/types";
import { disciplineMaturity } from "../discipline-capability";
import { isGlobalFirstArchitecture } from "../global-governance";
import {
  AU_D1D_RECONCILIATION,
  AU_FAIL_CLOSED_STATE,
  AU_INVALIDATION_REGRESSION,
  AU_METHOD_INVENTORY_REGRESSION,
  AU_MEMBER_ORCHESTRATION_REGRESSION,
  AU_METHOD_VALIDATION_INVENTORY,
  AU_NUMERICAL_INTERACTION_METHOD_COUNT,
  AU_PARAMETER_LEAKAGE_INTO_EU,
  AU_PARAMETER_LEAKAGE_INTO_US,
  AU_STANDARD_AUTHORITY_REGRESSION,
  AU_STEEL_VALIDATION_MATRIX,
  AU_VALIDATION_DEBT_REGISTER,
  AU_VALIDATION_MATRIX_REGRESSION,
  COMMON_INVALIDATION_LOGIC_JURISDICTION_NEUTRAL,
  COMMON_MECHANICS_AUDIT,
  COMMON_STEEL_MECHANICS_INVENTORY,
  D1D_AI_AUTHORITY_AUDIT,
  D1D_CANONICAL_CAPABILITY_MATRIX,
  D1D_CANONICAL_ROADMAP_HANDOFF,
  D1D_CAPABILITY_MANIFEST,
  D1D_D0_RISK_DISPOSITION,
  D1D_EXTERNAL_SOLVER_BOUNDARY,
  D1D_FROZEN_ARCHITECTURE_CONTRACTS,
  D1D_FUTURE_EXTENSION_RULE,
  D1D_FUTURE_STANDARDS_VALIDATION_TRACK,
  D1D_GLOBAL_FAIL_CLOSED_AUDIT,
  D1D_GLOBAL_FIRST_ARCHITECTURE,
  D1D_HUMAN_OVERSIGHT_AUDIT,
  D1D_OPTIMIZATION_RECHECK_GOVERNANCE,
  D1D_PHASE_INVENTORY,
  D1D_PRODUCT_GATING_POLICY,
  D1D_RISKS_CLOSED,
  D1D_RISKS_REDUCED,
  D1D_RISKS_REMAINING,
  D1D_SECURITY_GOVERNANCE_AUDIT,
  D1D_SOURCE_CONTROL_ANOMALIES,
  D1D_SOURCE_CONTROL_TRACEABILITY,
  D1D_STANDARD_GOVERNANCE_MATRIX,
  D1D_TENANCY_AUDIT,
  D1D_VALIDATION_DEBT_REGISTER,
  D1D_VALIDATION_PRIORITY_PLAN,
  EU_CONFORMANCE_GATE_REGRESSION,
  EU_D1D_RECONCILIATION,
  EU_FAIL_CLOSED_STATE,
  EU_INVALIDATION_REGRESSION,
  EU_MEMBER_ORCHESTRATION_REGRESSION,
  EU_METHOD_INVENTORY_REGRESSION,
  EU_METHOD_VALIDATION_INVENTORY,
  EU_NUMERICAL_INTERACTION_METHOD_COUNT,
  EU_PARAMETER_LEAKAGE_INTO_AU,
  EU_PARAMETER_LEAKAGE_INTO_US,
  EU_STANDARD_BINDING_REGRESSION,
  EU_STEEL_VALIDATION_MATRIX,
  EU_VALIDATION_DEBT_REGISTER,
  EU_VALIDATION_MATRIX_REGRESSION,
  IMPLEMENTED_EU_INTERACTION_METHODS,
  IMPLEMENTED_INTERACTION_METHODS,
  IMPLEMENTED_US_INTERACTION_METHODS,
  STEEL_ADAPTER_BOUNDARIES,
  THREE_JURISDICTION_COMMON_MECHANICS_CONSISTENCY,
  THREE_JURISDICTION_MEMBER_ORCHESTRATION_AUDIT,
  THREE_JURISDICTION_STEEL_ARCHITECTURE_AUDIT,
  US_CONFORMANCE_GATE_REGRESSION,
  US_D1D_RECONCILIATION,
  US_FAIL_CLOSED_STATE,
  US_INVALIDATION_REGRESSION,
  US_MEMBER_ORCHESTRATION_REGRESSION,
  US_METHOD_INVENTORY_REGRESSION,
  US_METHOD_VALIDATION_INVENTORY,
  US_NUMERICAL_INTERACTION_METHOD_COUNT,
  US_PARAMETER_LEAKAGE_INTO_AU,
  US_PARAMETER_LEAKAGE_INTO_EU,
  US_STANDARD_BINDING_REGRESSION,
  US_STEEL_VALIDATION_MATRIX,
  US_VALIDATION_DEBT_REGISTER,
  US_VALIDATION_MATRIX_REGRESSION,
  assertCandidateFullEuMemberRecheck,
  assertCandidateFullMemberRecheck,
  assertCandidateFullUsMemberRecheck,
  assertD1dCloseoutAudits,
  assertD1dProductCapabilityGating,
  assertD1dRiskLedgerReconciled,
  d1dProductCapabilityVisible,
} from "./index";

const here = dirname(fileURLToPath(import.meta.url));

function readTree(dir: string): string {
  const entries = readdirSync(dir, { withFileTypes: true });
  return entries.map((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== "node_modules") return readTree(path);
    if (entry.name.endsWith(".test.ts")) return "";
    if (entry.name.endsWith(".ts") || entry.name.endsWith(".md")) return readFileSync(path, "utf8");
    return "";
  }).join("\n");
}

describe("EOS-D1D-CLOSEOUT structural steel architecture freeze", () => {
  it("completes the D1D phase inventory and source-control traceability", () => {
    expect(EOS_D1D_CLOSEOUT_PHASE).toBe("EOS-D1D-CLOSEOUT");
    expect(D1D_PHASE_INVENTORY_COMPLETE).toBe(true);
    expect(D1D_PHASE_INVENTORY).toHaveLength(24);
    expect(D1D_PHASE_INVENTORY.map((row) => row.phase)).toEqual([
      "EOS-D1D-0",
      "EOS-D1D-AU-1",
      "EOS-D1D-AU-2",
      "EOS-D1D-AU-3",
      "EOS-D1D-AU-4",
      "EOS-D1D-AU-5",
      "EOS-D1D-AU-6",
      "EOS-D1D-AU-7",
      "EOS-D1D-EU-1",
      "EOS-D1D-EU-2",
      "EOS-D1D-EU-3",
      "EOS-D1D-EU-4",
      "EOS-D1D-EU-5",
      "EOS-D1D-EU-6",
      "EOS-D1D-EU-7",
      "EOS-D1D-EU-8",
      "EOS-D1D-US-1",
      "EOS-D1D-US-2",
      "EOS-D1D-US-3",
      "EOS-D1D-US-4",
      "EOS-D1D-US-5",
      "EOS-D1D-US-6",
      "EOS-D1D-US-7",
      "EOS-D1D-US-8",
    ]);
    expect(D1D_PHASE_INVENTORY.at(-1)?.commit).toBe("c3e1396bb67d1f5b8638f6c8189d55a37269d77f");
    expect(D1D_SOURCE_CONTROL_TRACEABILITY).toBe("PASS");
    expect(D1D_SOURCE_CONTROL_ANOMALIES).toEqual([]);
  });

  it("keeps one global steel core, shared mechanics, and distinct standard governance", () => {
    expect(D1D_GLOBAL_STEEL_ARCHITECTURE_VALIDATED).toBe(true);
    expect(PARALLEL_AU_STEEL_CORE).toBe(false);
    expect(PARALLEL_EU_STEEL_CORE).toBe(false);
    expect(PARALLEL_US_STEEL_CORE).toBe(false);
    expect(STEEL_ADAPTER_BOUNDARIES.AU_STEEL.implemented).toBe(true);
    expect(STEEL_ADAPTER_BOUNDARIES.EU_STEEL.implemented).toBe(false);
    expect(STEEL_ADAPTER_BOUNDARIES.US_STEEL.implemented).toBe(false);
    expect(COMMON_STEEL_MECHANICS_INVENTORY).toHaveLength(13);
    expect(COMMON_STEEL_MECHANICS_INVENTORY.every((row) => row.supportedJurisdictions.join() === "AU,EU,US")).toBe(true);
    expect(COMMON_MECHANICS_CONTAINS_CODE_AUTHORITY).toBe(false);
    expect(GLOBAL_MECHANICS_JURISDICTION_NEUTRAL).toBe(true);
    expect(COMMON_MECHANICS_AUDIT).toBe("PASS");
    expect(THREE_JURISDICTION_COMMON_MECHANICS_CONSISTENCY).toBe("PASS");
    expect(D1D_STANDARD_GOVERNANCE_MATRIX.AU.nationalAnnex).toBe("NOT_APPLICABLE");
    expect(D1D_STANDARD_GOVERNANCE_MATRIX.EU.ndp).toMatch(/fails closed/i);
    expect(D1D_STANDARD_GOVERNANCE_MATRIX.US.lrfdAsd).toMatch(/no default/);
    expect(D1D_GLOBAL_FIRST_ARCHITECTURE).toBe("YES");
    expect(isGlobalFirstArchitecture()).toBe(true);
    expect(THREE_JURISDICTION_STEEL_ARCHITECTURE_AUDIT).toBe("PASS");
    expect(EU_HIGH_WATER_MARK_INHERITED).toBe(true);
    expect(GLOBAL_STEEL_GOVERNANCE_NOT_WEAKENED).toBe(true);
  });

  it("publishes one canonical capability matrix, manifest, and jurisdiction reconciliation", () => {
    expect(D1D_CANONICAL_CAPABILITY_MATRIX).toHaveLength(25);
    expect(D1D_CAPABILITY_CLASSIFICATION_SINGLE_SOURCE_OF_TRUTH).toBe(true);
    expect(D1D_CAPABILITY_MANIFEST.length).toBeGreaterThanOrEqual(100);
    expect(D1D_CAPABILITY_MANIFEST.every((row) => row.releaseState === "INTERNAL_ENGINEERING_REFERENCE" || row.releaseState === "HIDDEN" || row.conformanceState === "INTENDED_PROFILE")).toBe(true);
    expect(D1D_CANONICAL_CAPABILITY_MATRIX.every((row) => row.GLOBAL.certified === false && row.AU.certified === false && row.EU.certified === false && row.US.certified === false)).toBe(true);
    expect(D1D_CANONICAL_CAPABILITY_MATRIX.every((row) => row.GLOBAL.conformanceValidated === false && row.AU.conformanceValidated === false && row.EU.conformanceValidated === false && row.US.conformanceValidated === false)).toBe(true);
    expect(AU_D1D_RECONCILIATION).toBe("PASS");
    expect(AU_STEEL_IMPLEMENTATION_MATURITY).toBe("PARTIAL_METHODS_BENCHMARKED");
    expect(AU_STEEL_STANDARD_CONFORMANCE_STATE).toBe("INTENDED_PROFILE");
    expect(AU_STEEL_PRODUCT_CLAIM_LEVEL).toBe("BENCHMARKED_ENGINEERING_CAPABILITY");
    expect(AU_STEEL_RELEASE_CLASSIFICATION).toBe("INTERNAL_ENGINEERING_REFERENCE");
    expect(AU_STEEL_PACK_CERTIFIED).toBe(false);
    expect(EU_D1D_RECONCILIATION).toBe("PASS");
    expect(EU_STEEL_IMPLEMENTATION_MATURITY).toBe("FRAMEWORK_PLUS_BOUNDED_METHODS");
    expect(EU_STEEL_STANDARD_CONFORMANCE_STATE).toBe("INTENDED_PROFILE");
    expect(EU_STEEL_PRODUCT_CLAIM_LEVEL).toBe("BENCHMARKED_ENGINEERING_REFERENCE_CAPABILITY");
    expect(EU_STEEL_RELEASE_CLASSIFICATION).toBe("INTERNAL_ENGINEERING_REFERENCE");
    expect(EU_STEEL_PACK_CERTIFIED).toBe(false);
    expect(US_D1D_RECONCILIATION).toBe("PASS");
    expect(US_STEEL_IMPLEMENTATION_MATURITY).toBe("FRAMEWORK_PLUS_BOUNDED_METHODS");
    expect(US_STEEL_STANDARD_CONFORMANCE_STATE).toBe("INTENDED_PROFILE");
    expect(US_STEEL_PRODUCT_CLAIM_LEVEL).toBe("BENCHMARKED_ENGINEERING_REFERENCE_CAPABILITY");
    expect(US_STEEL_RELEASE_CLASSIFICATION).toBe("INTERNAL_ENGINEERING_REFERENCE");
    expect(US_STEEL_PACK_CERTIFIED).toBe(false);
    expect(D1D_MISLEADING_PRODUCT_CLAIMS).toBe("NONE");
    expect(D1D_ENGINEERING_AUTHORITY_LAYERS_SEPARATE).toBe(true);
    expect(D1D_GLOBAL_RELEASE_CLASSIFICATION).toBe("INTERNAL_ENGINEERING_REFERENCE");
    expect(disciplineMaturity("structural")).toBe("REFERENCE_PARTIALLY_IMPLEMENTED");
    expect(D1D_STEEL_MATURITY).toBe("ARCHITECTURE_COMPLETE_REFERENCE_CAPABILITY");
    expect(D1D_PHASE_COMPLETE).toBe(true);
    expect(COMPLETE_STEEL_DESIGN_PRODUCT).toBe(false);
  });

  it("keeps orchestration, invalidation, fail-closed, and interaction status truthful", () => {
    expect(THREE_JURISDICTION_MEMBER_ORCHESTRATION_AUDIT).toBe("PASS");
    expect(COMMON_INVALIDATION_LOGIC_JURISDICTION_NEUTRAL).toBe(true);
    expect(AU_INVALIDATION_REGRESSION).toBe(false);
    expect(EU_INVALIDATION_REGRESSION).toBe(false);
    expect(US_INVALIDATION_REGRESSION).toBe(false);
    expect(AU_FAIL_CLOSED_STATE).toBe("PASS");
    expect(EU_FAIL_CLOSED_STATE).toBe("PASS");
    expect(US_FAIL_CLOSED_STATE).toBe("PASS");
    expect(D1D_GLOBAL_FAIL_CLOSED_AUDIT).toBe("PASS");
    expect(AU_NUMERICAL_INTERACTION_METHOD_COUNT).toBe(0);
    expect(EU_NUMERICAL_INTERACTION_METHOD_COUNT).toBe(0);
    expect(US_NUMERICAL_INTERACTION_METHOD_COUNT).toBe(0);
    expect(IMPLEMENTED_INTERACTION_METHODS).toEqual([]);
    expect(IMPLEMENTED_EU_INTERACTION_METHODS).toEqual([]);
    expect(IMPLEMENTED_US_INTERACTION_METHODS).toEqual([]);
    expect(COMPONENT_UTILIZATION_EQUALS_INTERACTION_CHECK).toBe(false);
    expect(GENERAL_FEA_CAPABILITY_CLAIMED).toBe(false);
    expect(GENERAL_CONNECTION_DESIGN_VALIDATED).toBe(false);
    expect(GENERAL_SEISMIC_STEEL_DESIGN_VALIDATED).toBe(false);
    expect(MEMBER_VALIDATION_IMPLIES_CONNECTION_VALIDATION).toBe(false);
    expect(MEMBER_VALIDATION_IMPLIES_FOUNDATION_VALIDATION).toBe(false);
    expect(GLOBAL_OPTIMIZATION_ACCEPTS_UNDETERMINED).toBe(false);
    expect(D1D_OPTIMIZATION_RECHECK_GOVERNANCE).toBe("PASS");
    const undetermined = {
      candidateSectionRef: "sec-opt",
      proposedBy: "AI" as const,
      deterministicRecheckRequired: true as const,
      rechecked: true as const,
      memberCheckState: "CHECK_UNDETERMINED" as const,
    };
    expect(() => assertCandidateFullMemberRecheck(undetermined)).toThrow(/undetermined/);
    expect(() => assertCandidateFullEuMemberRecheck(undetermined)).toThrow(/undetermined/);
    expect(() => assertCandidateFullUsMemberRecheck(undetermined)).toThrow(/undetermined/);
  });

  it("keeps AI, copyright, debt, risk, freeze, gating, and roadmap truthful", () => {
    expect(D1D_AI_AUTHORITY_AUDIT).toBe("PASS");
    expect(LLM_NUMERICAL_ENGINEERING_AUTHORITY).toBe(false);
    expect(AI_ENGINEERING_APPROVAL).toBe(false);
    expect(STANDARD_TEXT_REQUIRED_BY_RUNTIME).toBe(false);
    expect(COPYRIGHTED_STANDARD_TEXT_COMMITTED).toBe(false);
    expect(NEW_MAJOR_DESIGN_METHOD_IMPLEMENTED).toBe(false);
    expect(NEW_MAJOR_DESIGN_METHOD_IMPLEMENTED_IN_D1D_CLOSEOUT).toBe(false);
    expect(SCHEMA_CHANGE_REQUIRED_FOR_D1D_CLOSEOUT).toBe(false);
    const categories = new Set(D1D_VALIDATION_DEBT_REGISTER.map((row) => row.category));
    for (const category of [
      "STANDARD_IDENTITY",
      "CODE_PROFILE_RESISTANCE",
      "SECTION_CLASSIFICATION",
      "LOCAL_BUCKLING",
      "MEMBER_STABILITY",
      "LTB",
      "SHEAR_WEB_STABILITY",
      "INTERACTION",
      "SERVICEABILITY",
      "MATERIAL_DATA",
      "SECTION_CATALOGS",
      "EXTERNAL_TOOL_COMPARISON",
      "HUMAN_ENGINEERING_VALIDATION",
      "GENERAL_ANALYSIS",
      "CONNECTIONS",
      "SEISMIC",
      "PROFESSIONAL_CERTIFICATION",
    ]) {
      expect(categories.has(category)).toBe(true);
    }
    expect(D1D_VALIDATION_DEBT_REGISTER.map((row) => row.debtId)).toEqual(expect.arrayContaining([
      ...AU_VALIDATION_DEBT_REGISTER.map((row) => row.debtId),
      ...EU_VALIDATION_DEBT_REGISTER.map((row) => row.debtId),
      ...US_VALIDATION_DEBT_REGISTER.map((row) => row.debtId),
    ]));
    expect(D1D_VALIDATION_PRIORITY_PLAN.map((row) => row.priority)).toEqual([
      "SAFETY_CRITICAL",
      "CONFORMANCE_CRITICAL",
      "COMMERCIAL_RELEASE_CRITICAL",
      "ENHANCEMENT",
    ]);
    expect(D1D_RISK_LEDGER_RECONCILED).toBe(true);
    expect(D1D_RISKS_CLOSED).toBe("NONE");
    expect(D1D_RISKS_REDUCED).toEqual(["D0-R01", "D0-R03"]);
    expect(D1D_RISKS_REMAINING).toEqual(["D0-R01", "D0-R04", "D0-R05", "D0-R07", "D0-R08", "D0-R10", "D0-R11", "D0-R12"]);
    expect(D1D_D0_RISK_DISPOSITION.CLOSED).toEqual([]);
    assertD1dRiskLedgerReconciled();
    expect(D1D_ARCHITECTURE_CONTRACT_FROZEN).toBe(true);
    expect(D1D_FROZEN_ARCHITECTURE_CONTRACTS).toHaveLength(12);
    expect(D1D_FUTURE_EXTENSION_RULE_DEFINED).toBe(true);
    expect(D1D_FUTURE_EXTENSION_RULE.parallelSteelCoreForbidden).toBe(true);
    expect(D1D_PRODUCT_CAPABILITY_GATING).toBe(true);
    expect(D1D_CAPABILITY_GATING_LEVELS).toEqual([
      "MECHANICS_REFERENCE",
      "FRAMEWORK_ONLY",
      "VALIDATED_DESIGN_METHOD",
      "CONFORMANCE_VALIDATED",
      "CERTIFIED",
    ]);
    expect(d1dProductCapabilityVisible("MECHANICS_REFERENCE")).toBe(true);
    expect(d1dProductCapabilityVisible("FRAMEWORK_ONLY")).toBe(true);
    expect(d1dProductCapabilityVisible("VALIDATED_DESIGN_METHOD")).toBe(false);
    expect(d1dProductCapabilityVisible("CONFORMANCE_VALIDATED")).toBe(false);
    expect(d1dProductCapabilityVisible("CERTIFIED")).toBe(false);
    expect(D1D_PRODUCT_GATING_POLICY.CERTIFIED.uiPilotExpose).toBe(false);
    assertD1dProductCapabilityGating();
    expect(D1D_FUTURE_STANDARDS_VALIDATION_TRACK_DEFINED).toBe(true);
    expect(D1D_FUTURE_STANDARDS_VALIDATION_TRACK.independentOfD1E).toBe(true);
    expect(D1D_EXTERNAL_SOLVER_BOUNDARY_PRESERVED).toBe(true);
    expect(D1D_EXTERNAL_SOLVER_BOUNDARY.uncertifiedUnlessIndependentlyCertified).toContain("SPACE GASS");
    expect(D1D_CANONICAL_NEXT_PHASE).toBe("D1E");
    expect(D1D_CANONICAL_NEXT_PHASE_SCOPE).toBe("Concrete Design Capability");
    expect(D1D_CANONICAL_ROADMAP_HANDOFF.nextPhase).toBe("D1E");
    expect(D1_ROADMAP_HANDOFF_VALIDATED).toBe(true);
    expect(D1_CLOSEOUT_ROADMAP_CONFLICT).toBe(false);
    expect(EOS_D1D_CLOSEOUT_CLOSED).toBe(true);
    assertD1dCloseoutAudits();
  });

  it("does not regress AU/EU/US inventories, leak jurisdiction parameters, or weaken tenancy/security/oversight", () => {
    expect(AU_METHOD_VALIDATION_INVENTORY).toHaveLength(18);
    expect(AU_STEEL_VALIDATION_MATRIX).toHaveLength(11);
    expect(EU_METHOD_VALIDATION_INVENTORY.length).toBeGreaterThan(20);
    expect(EU_STEEL_VALIDATION_MATRIX).toHaveLength(13);
    expect(US_METHOD_VALIDATION_INVENTORY.length).toBeGreaterThan(20);
    expect(US_STEEL_VALIDATION_MATRIX).toHaveLength(15);
    expect(AU_METHOD_INVENTORY_REGRESSION).toBe(false);
    expect(AU_VALIDATION_MATRIX_REGRESSION).toBe(false);
    expect(AU_MEMBER_ORCHESTRATION_REGRESSION).toBe(false);
    expect(AU_STANDARD_AUTHORITY_REGRESSION).toBe(false);
    expect(EU_METHOD_INVENTORY_REGRESSION).toBe(false);
    expect(EU_VALIDATION_MATRIX_REGRESSION).toBe(false);
    expect(EU_MEMBER_ORCHESTRATION_REGRESSION).toBe(false);
    expect(EU_STANDARD_BINDING_REGRESSION).toBe(false);
    expect(EU_CONFORMANCE_GATE_REGRESSION).toBe(false);
    expect(US_METHOD_INVENTORY_REGRESSION).toBe(false);
    expect(US_VALIDATION_MATRIX_REGRESSION).toBe(false);
    expect(US_MEMBER_ORCHESTRATION_REGRESSION).toBe(false);
    expect(US_STANDARD_BINDING_REGRESSION).toBe(false);
    expect(US_CONFORMANCE_GATE_REGRESSION).toBe(false);
    expect(AU_PARAMETER_LEAKAGE_INTO_EU).toBe(false);
    expect(AU_PARAMETER_LEAKAGE_INTO_US).toBe(false);
    expect(EU_PARAMETER_LEAKAGE_INTO_AU).toBe(false);
    expect(EU_PARAMETER_LEAKAGE_INTO_US).toBe(false);
    expect(US_PARAMETER_LEAKAGE_INTO_AU).toBe(false);
    expect(US_PARAMETER_LEAKAGE_INTO_EU).toBe(false);
    expect(D1D_TENANCY_AUDIT).toBe("PASS");
    expect(D1D_SECURITY_GOVERNANCE_AUDIT).toBe("PASS");
    expect(D1D_HUMAN_OVERSIGHT_AUDIT).toBe("PASS");
    expect(EMPLOYEE_BEHAVIOR_PROFILING).toBe(false);

    const steelSrc = readTree(here);
    const docsDir = join(here, "../../../../docs/architecture/engineering-os");
    const docs = readdirSync(docsDir)
      .filter((name) => name.startsWith("EOS_D1D"))
      .map((name) => readFileSync(join(docsDir, name), "utf8"))
      .join("\n");
    const corpus = `${steelSrc}\n${docs}`;
    for (const pattern of [
      /is AS 4100 compliant/i,
      /is Eurocode compliant/i,
      /is EN 1993 compliant/i,
      /is AISC compliant/i,
      /is building-code compliant/i,
      /complete steel design product\s*=\s*YES/i,
      /certified structural design/i,
      /approved for construction without review/i,
      /GENERAL_FEA_CAPABILITY_CLAIMED\s*=\s*true/i,
    ]) {
      expect(corpus).not.toMatch(pattern);
    }
    const mechanics = ["tension-force.ts", "euler.ts", "effective-length.ts", "bending.ts", "ltb.ts", "shear.ts"]
      .map((name) => readFileSync(join(here, "mechanics", name), "utf8")).join("\n");
    expect(mechanics).not.toMatch(/γM0\s*=|gamma_M0\s*=|φNt\s*=|φc\s*=|Ωc\s*=|χLT\s*=|Cb\s*=\s*1/);
    const invalidation = readFileSync(join(here, "au-member", "invalidation.ts"), "utf8");
    expect(invalidation).not.toMatch(/AS 4100 φ|γM0|AISC 360 §/);
    const auVal = readFileSync(join(here, "au-validation", "inventory.ts"), "utf8");
    expect(auVal).not.toMatch(/γM0|φc\s*=|AISC 360 §/);
    const euVal = readFileSync(join(here, "eu-validation", "inventory.ts"), "utf8");
    expect(euVal).not.toMatch(/AUST300 default|0\.9 fy Ag|AS 4100 φ|φc\s*=/);
    const usVal = readFileSync(join(here, "us-validation", "inventory.ts"), "utf8");
    expect(usVal).not.toMatch(/AUST300 default|0\.9 fy Ag|AS 4100 φ|γM0/);
    const plan = readFileSync(join(docsDir, "EOS_D1_STRUCTURAL_COMPLETION_PLAN.md"), "utf8");
    expect(plan).toMatch(/\| D1E \| Concrete Design Capability \|/);
  });
});
