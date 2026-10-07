import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  AU_CONCRETE_IMPLEMENTATION_MATURITY,
  AU_CONCRETE_INVALIDATION_REGRESSION,
  AU_CONCRETE_PACK_CERTIFIED,
  AU_CONCRETE_PRODUCT_CLAIM_LEVEL,
  AU_CONCRETE_REGRESSION,
  AU_CONCRETE_STANDARD_CONFORMANCE_STATE,
  AU_CONCRETE_STANDARD_EDITION,
  AU_CONCRETE_STANDARD_GOVERNANCE_RECONCILIATION,
  AU_D1E_RECONCILIATION,
  AU_IMPLEMENTED_CODE_METHOD_COUNT,
  AU_NUMERICAL_CONCRETE_CODE_METHOD_COUNT,
  CANONICAL_D1E_NEXT_PHASE,
  CANONICAL_D1E_NEXT_PHASE_SCOPE,
  CLOSEOUT_ERA_IMPLEMENTED_EU_CONCRETE_CODE_FLEXURE_METHODS,
  COMMON_RC_BENCHMARK_EQUALS_AU_CONFORMANCE,
  COMMON_RC_BENCHMARK_EQUALS_EU_CONFORMANCE,
  COMMON_RC_BENCHMARK_EQUALS_US_CONFORMANCE,
  COMMON_RC_INVALIDATION_JURISDICTION_NEUTRAL,
  COMMON_RC_KERNEL_INVENTORY_COMPLETE,
  COMMON_RC_KERNEL_JURISDICTION_NEUTRAL,
  COMMON_RC_KERNEL_VALIDATION_AUDIT,
  COMPLETE_CONCRETE_DESIGN_PRODUCT,
  CONCRETE_DESIGN_IMPLIES_GEOTECHNICAL_VALIDATION,
  CONCRETE_OPTIMIZATION_ACCEPTS_UNDETERMINED,
  D1A_STRUCTURAL_DOMAIN_REGRESSION,
  D1B_STANDARD_BINDING_REGRESSION,
  D1C_MECHANICS_REGRESSION,
  D1D_STEEL_ARCHITECTURE_REGRESSION,
  D1D_STEEL_MATURITY,
  D1E0_REGRESSION,
  D1E1_COMMON_RC_KERNEL_REGRESSION,
  D1E_ARCHITECTURE_CONTRACT_FROZEN,
  D1E_ARCHITECTURE_PHASE_COMPLETE,
  D1E_CAPABILITY_SINGLE_SOURCE_OF_TRUTH,
  D1E_CANONICAL_CAPABILITY_MATRIX_DEFINED,
  D1E_CONCRETE_CAPABILITY_MANIFEST_RECONCILED,
  D1E_CONCRETE_MATURITY,
  D1E_ENGINEERING_AUTHORITY_LAYERS_SEPARATE,
  D1E_FUTURE_EXTENSION_RULE_DEFINED,
  D1E_GLOBAL_CONCRETE_ARCHITECTURE_VALIDATED,
  D1E_GLOBAL_FAIL_CLOSED_AUDIT,
  D1E_GLOBAL_RELEASE_CLASSIFICATION,
  D1E_INVERSE_DESIGN_ARCHITECTURE_READY,
  D1E_MISLEADING_CONCRETE_PRODUCT_CLAIMS,
  D1E_OPTIMIZATION_ACCEPTS_UNDETERMINED,
  D1E_OPTIMIZATION_RECHECK_GOVERNANCE,
  D1E_PARETO_ACCEPTS_UNDETERMINED_AS_FEASIBLE,
  D1E_PHASE_INVENTORY_COMPLETE,
  D1E_ROADMAP_HANDOFF_VALIDATED,
  D1E_SOURCE_CONTROL_TRACEABILITY,
  D1E_VALIDATION_DEBT_REGISTER_RECONCILED,
  D1E_VALIDATION_PRIORITY_PLAN_DEFINED,
  EOS_D1E_CLOSEOUT_CLOSED,
  EOS_D1E_CLOSEOUT_PHASE,
  EU_CONCRETE_CONFORMANCE_PHASE_PLAN_DEFINED,
  EU_CONCRETE_CONFORMANCE_TRACK_DEFINED,
  EU_CONCRETE_IMPLEMENTATION_MATURITY,
  EU_CONCRETE_INVALIDATION_REGRESSION,
  EU_CONCRETE_PACK_CERTIFIED,
  EU_CONCRETE_PRODUCT_CLAIM_LEVEL,
  EU_CONCRETE_REGRESSION,
  EU_CONCRETE_STANDARD_CONFORMANCE_STATE,
  EU_CONCRETE_STANDARD_EDITION,
  EU_CONCRETE_STANDARD_GOVERNANCE_RECONCILIATION,
  EU_CONCRETE_V1_SCOPE_DEFINED,
  EU_D1E_RECONCILIATION,
  EU_IMPLEMENTED_CODE_METHOD_COUNT,
  EU_NUMERICAL_CONCRETE_CODE_METHOD_COUNT,
  GENERATIVE_MODEL_CAN_APPROVE_DESIGN,
  GENERATIVE_MODEL_CAN_BYPASS_CODE_ADAPTER,
  GENERATIVE_MODEL_CAN_BYPASS_RC_KERNEL,
  GENERATIVE_MODEL_EQUALS_ENGINEERING_AUTHORITY,
  GENERAL_CONCRETE_CONNECTION_DESIGN_VALIDATED,
  GENERAL_CONCRETE_FEA_CLAIMED,
  GENERAL_CONCRETE_FIRE_DESIGN_VALIDATED,
  GENERAL_CONCRETE_SEISMIC_DESIGN_VALIDATED,
  GENERAL_PRESTRESSED_CONCRETE_DESIGN_VALIDATED,
  NEW_MAJOR_DESIGN_METHOD_IMPLEMENTED_IN_D1E_CLOSEOUT,
  PARALLEL_AU_RC_CORE,
  PARALLEL_EU_RC_CORE,
  PARALLEL_US_RC_CORE,
  READY_FOR_EU_CONCRETE_CONFORMANCE_TRACK,
  RECOMMENDED_D1E_NEXT_PHASE,
  RECOMMENDED_D1E_NEXT_PHASE_SCOPE,
  SCHEMA_CHANGE_REQUIRED_FOR_D1E_CLOSEOUT,
  SILENT_CONCRETE_STANDARD_EDITION_INFERENCE,
  THREE_JURISDICTION_CONCRETE_ARCHITECTURE_AUDIT,
  US_CONCRETE_IMPLEMENTATION_MATURITY,
  US_CONCRETE_INVALIDATION_REGRESSION,
  US_CONCRETE_PACK_CERTIFIED,
  US_CONCRETE_PRODUCT_CLAIM_LEVEL,
  US_CONCRETE_REGRESSION,
  US_CONCRETE_STANDARD_CONFORMANCE_STATE,
  US_CONCRETE_STANDARD_EDITION,
  US_CONCRETE_STANDARD_GOVERNANCE_RECONCILIATION,
  US_D1E_RECONCILIATION,
  US_IMPLEMENTED_CODE_METHOD_COUNT,
  US_NUMERICAL_CONCRETE_CODE_METHOD_COUNT,
} from "@rtb/types";
import { D1D_CAPABILITY_MANIFEST } from "../structural-steel/d1d-closeout/manifest";
import { disciplineMaturity } from "../discipline-capability";
import {
  CONCRETE_CAPABILITY_MANIFEST,
  D1E_CANONICAL_ROADMAP_HANDOFF,
  D1E_INTERNAL_ROADMAP,
  D1E_VALIDATION_DEBT_REGISTER,
} from "./capability";
import {
  COMMON_RC_KERNEL_INVENTORY,
  D1E_CANONICAL_CAPABILITY_MATRIX,
  D1E_CANONICAL_ROADMAP_HANDOFF_CLOSEOUT,
  D1E_CANONICAL_VALIDATION_DEBT_CATEGORIES,
  D1E_CLOSEOUT_D0_RISK_DISPOSITION,
  D1E_ENGINEERING_AUTHORITY_LAYERS,
  D1E_FROZEN_ARCHITECTURE_CONTRACTS,
  D1E_FUTURE_EXTENSION_RULE,
  D1E_GLOBAL_ARCHITECTURE_STACK,
  D1E_GLOBAL_FAIL_CLOSED_CASES,
  D1E_INVERSE_DESIGN_PIPELINE,
  D1E_PHASE_INVENTORY,
  D1E_RECONCILED_VALIDATION_DEBT_REGISTER,
  D1E_RISKS_CLOSED,
  D1E_RISKS_REDUCED,
  D1E_RISKS_REMAINING,
  D1E_SOURCE_CONTROL_ANOMALIES,
  D1E_VALIDATION_PRIORITY_PLAN,
  EU_CONCRETE_CONFORMANCE_PHASE_PLAN,
  EU_CONCRETE_CONFORMANCE_TRACK,
  EU_CONCRETE_V1_SCOPE,
  assertD1eCloseoutAudits,
  assertD1ePhaseInventoryComplete,
  assertD1eRiskLedgerReconciled,
} from "./d1e-closeout";
import { assertCandidateFullConcreteRecheck } from "./orchestration";
import { IMPLEMENTED_AU_CONCRETE_CODE_FLEXURE_METHODS } from "./au-flexure";
import { IMPLEMENTED_EU_CONCRETE_CODE_FLEXURE_METHODS } from "./eu-flexure";
import { IMPLEMENTED_US_CONCRETE_CODE_FLEXURE_METHODS } from "./us-flexure";

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

describe("EOS-D1E-CLOSEOUT concrete architecture freeze", () => {
  it("completes the D1E phase inventory and source-control traceability", () => {
    expect(EOS_D1E_CLOSEOUT_PHASE).toBe("EOS-D1E-CLOSEOUT");
    expect(D1E_PHASE_INVENTORY_COMPLETE).toBe(true);
    expect(D1E_PHASE_INVENTORY).toHaveLength(7);
    expect(D1E_PHASE_INVENTORY.map((row) => row.phase)).toEqual([
      "EOS-D1E-0",
      "EOS-D1E-1",
      "EOS-D1E-AU-1",
      "EOS-D1E-EU-1",
      "EOS-D1E-EU-2",
      "EOS-D1E-US-1",
      "EOS-D1E-US-2",
    ]);
    expect(D1E_PHASE_INVENTORY.at(-1)?.commit).toBe("28a89fbc31df25a894bfefa8e7b7381ebead02ab");
    expect(D1E_PHASE_INVENTORY[1]?.commit).toBe("51e52e3a4408a8fc748447074e5b0f36838c0c59");
    expect(D1E_SOURCE_CONTROL_TRACEABILITY).toBe("PASS");
    expect(D1E_SOURCE_CONTROL_ANOMALIES).toEqual([]);
    assertD1ePhaseInventoryComplete();
  });

  it("validates one global RC kernel and three jurisdiction adapters", () => {
    expect(D1E_GLOBAL_CONCRETE_ARCHITECTURE_VALIDATED).toBe(true);
    expect(D1E_GLOBAL_ARCHITECTURE_STACK).toEqual([
      "COMMON STRUCTURAL DOMAIN",
      "COMMON CONCRETE OBJECT MODEL",
      "COMMON RC SECTION KERNEL",
      "JURISDICTION-SPECIFIC STANDARD ADAPTERS",
      "CODE-PROFILE DESIGN METHODS",
      "MEMBER / ELEMENT ORCHESTRATION",
      "VALIDATION / CONFORMANCE",
      "HUMAN ENGINEERING APPROVAL",
    ]);
    expect(PARALLEL_AU_RC_CORE).toBe(false);
    expect(PARALLEL_EU_RC_CORE).toBe(false);
    expect(PARALLEL_US_RC_CORE).toBe(false);
    expect(COMMON_RC_KERNEL_INVENTORY_COMPLETE).toBe(true);
    expect(COMMON_RC_KERNEL_INVENTORY).toHaveLength(19);
    expect(COMMON_RC_KERNEL_INVENTORY.every((row) => row.supportedJurisdictions.join() === "AU,EU,US")).toBe(true);
    expect(COMMON_RC_KERNEL_INVENTORY.every((row) => row.benchmarkState === "PASS")).toBe(true);
    expect(COMMON_RC_KERNEL_VALIDATION_AUDIT).toBe("PASS");
    expect(COMMON_RC_KERNEL_JURISDICTION_NEUTRAL).toBe(true);
    expect(THREE_JURISDICTION_CONCRETE_ARCHITECTURE_AUDIT).toBe("PASS");
    expect(D1E_ENGINEERING_AUTHORITY_LAYERS_SEPARATE).toBe(true);
    expect(D1E_ENGINEERING_AUTHORITY_LAYERS).toHaveLength(6);
  });

  it("reconciles AU/EU/US without promoting beyond evidence", () => {
    expect(AU_D1E_RECONCILIATION).toBe("PASS");
    expect(AU_CONCRETE_IMPLEMENTATION_MATURITY).toBe("FRAMEWORK_PLUS_COMMON_MECHANICS");
    expect(AU_CONCRETE_STANDARD_CONFORMANCE_STATE).toBe("INTENDED_PROFILE");
    expect(AU_CONCRETE_PRODUCT_CLAIM_LEVEL).toBe("AU_CONCRETE_MECHANICS_REFERENCE_CAPABILITY");
    expect(AU_CONCRETE_PACK_CERTIFIED).toBe(false);
    expect(AU_IMPLEMENTED_CODE_METHOD_COUNT).toBe(0);
    expect(EU_D1E_RECONCILIATION).toBe("PASS");
    expect(EU_CONCRETE_IMPLEMENTATION_MATURITY).toBe("FRAMEWORK_PLUS_COMMON_MECHANICS");
    expect(EU_CONCRETE_STANDARD_CONFORMANCE_STATE).toBe("INTENDED_PROFILE");
    expect(EU_CONCRETE_PRODUCT_CLAIM_LEVEL).toBe("EU_CONCRETE_MECHANICS_REFERENCE_CAPABILITY");
    expect(EU_CONCRETE_PACK_CERTIFIED).toBe(false);
    expect(EU_IMPLEMENTED_CODE_METHOD_COUNT).toBe(0);
    expect(US_D1E_RECONCILIATION).toBe("PASS");
    expect(US_CONCRETE_IMPLEMENTATION_MATURITY).toBe("FRAMEWORK_PLUS_COMMON_MECHANICS");
    expect(US_CONCRETE_STANDARD_CONFORMANCE_STATE).toBe("INTENDED_PROFILE");
    expect(US_CONCRETE_PRODUCT_CLAIM_LEVEL).toBe("US_CONCRETE_MECHANICS_REFERENCE_CAPABILITY");
    expect(US_CONCRETE_PACK_CERTIFIED).toBe(false);
    expect(US_IMPLEMENTED_CODE_METHOD_COUNT).toBe(0);
    expect(AU_NUMERICAL_CONCRETE_CODE_METHOD_COUNT).toBe(0);
    expect(EU_NUMERICAL_CONCRETE_CODE_METHOD_COUNT).toBe(0);
    expect(US_NUMERICAL_CONCRETE_CODE_METHOD_COUNT).toBe(0);
    expect(IMPLEMENTED_AU_CONCRETE_CODE_FLEXURE_METHODS).toBe("NONE");
    expect(CLOSEOUT_ERA_IMPLEMENTED_EU_CONCRETE_CODE_FLEXURE_METHODS).toBe("NONE");
    expect([...IMPLEMENTED_EU_CONCRETE_CODE_FLEXURE_METHODS]).toEqual([
      "EU_RC_FLEXURE_EN1992_UNIAXIAL_MAJOR",
      "EU_RC_FLEXURE_EN1992_UNIAXIAL_MINOR",
    ]);
    expect(IMPLEMENTED_US_CONCRETE_CODE_FLEXURE_METHODS).toBe("NONE");
    expect(COMMON_RC_BENCHMARK_EQUALS_AU_CONFORMANCE).toBe(false);
    expect(COMMON_RC_BENCHMARK_EQUALS_EU_CONFORMANCE).toBe(false);
    expect(COMMON_RC_BENCHMARK_EQUALS_US_CONFORMANCE).toBe(false);
    expect(AU_CONCRETE_STANDARD_EDITION).toBe("UNKNOWN_PENDING_CONFIRMATION");
    expect(EU_CONCRETE_STANDARD_EDITION).toBe("UNKNOWN_PENDING_CONFIRMATION");
    expect(US_CONCRETE_STANDARD_EDITION).toBe("UNKNOWN_PENDING_CONFIRMATION");
    expect(SILENT_CONCRETE_STANDARD_EDITION_INFERENCE).toBe(false);
    expect(AU_CONCRETE_STANDARD_GOVERNANCE_RECONCILIATION).toBe("PASS");
    expect(EU_CONCRETE_STANDARD_GOVERNANCE_RECONCILIATION).toBe("PASS");
    expect(US_CONCRETE_STANDARD_GOVERNANCE_RECONCILIATION).toBe("PASS");
  });

  it("publishes one canonical capability matrix and reconciles the manifest", () => {
    expect(D1E_CANONICAL_CAPABILITY_MATRIX_DEFINED).toBe(true);
    expect(D1E_CANONICAL_CAPABILITY_MATRIX.length).toBeGreaterThanOrEqual(38);
    expect(D1E_CAPABILITY_SINGLE_SOURCE_OF_TRUTH).toBe(true);
    expect(D1E_CONCRETE_CAPABILITY_MANIFEST_RECONCILED).toBe(true);
    expect(CONCRETE_CAPABILITY_MANIFEST.some((row) => row.capabilityId === "D1E.CLOSEOUT.ARCHITECTURE")).toBe(true);
    expect(CONCRETE_CAPABILITY_MANIFEST.every((row) => row.conformanceState === "INTENDED_PROFILE")).toBe(true);
    expect(CONCRETE_CAPABILITY_MANIFEST.every((row) => row.releaseState === "INTERNAL_ENGINEERING_REFERENCE")).toBe(true);
    expect(D1E_CANONICAL_CAPABILITY_MATRIX.every((row) =>
      row.GLOBAL.certified === false && row.AU.certified === false && row.EU.certified === false && row.US.certified === false,
    )).toBe(true);
    expect(D1E_CANONICAL_CAPABILITY_MATRIX.every((row) =>
      row.GLOBAL.conformanceValidated === false && row.AU.conformanceValidated === false
      && row.EU.conformanceValidated === false && row.US.conformanceValidated === false,
    )).toBe(true);
    const steelIds = new Set(D1D_CAPABILITY_MANIFEST.map((row) => row.capabilityId));
    expect(CONCRETE_CAPABILITY_MANIFEST.every((row) => !steelIds.has(row.capabilityId))).toBe(true);
    expect(D1E_MISLEADING_CONCRETE_PRODUCT_CLAIMS).toBe("NONE");
    expect(D1E_GLOBAL_RELEASE_CLASSIFICATION).toBe("INTERNAL_ENGINEERING_REFERENCE");
    expect(disciplineMaturity("structural")).toBe("REFERENCE_PARTIALLY_IMPLEMENTED");
    expect(D1E_CONCRETE_MATURITY).toBe("ARCHITECTURE_COMPLETE_REFERENCE_CAPABILITY");
    expect(D1D_STEEL_MATURITY).toBe("ARCHITECTURE_COMPLETE_REFERENCE_CAPABILITY");
    expect(D1E_ARCHITECTURE_PHASE_COMPLETE).toBe(true);
    expect(COMPLETE_CONCRETE_DESIGN_PRODUCT).toBe(false);
  });

  it("keeps fail-closed, invalidation, AI, optimization, and unsupported-scope boundaries", () => {
    expect(COMMON_RC_INVALIDATION_JURISDICTION_NEUTRAL).toBe(true);
    expect(AU_CONCRETE_INVALIDATION_REGRESSION).toBe(false);
    expect(EU_CONCRETE_INVALIDATION_REGRESSION).toBe(false);
    expect(US_CONCRETE_INVALIDATION_REGRESSION).toBe(false);
    expect(D1E_GLOBAL_FAIL_CLOSED_AUDIT).toBe("PASS");
    expect(D1E_GLOBAL_FAIL_CLOSED_CASES).toHaveLength(14);
    expect(D1E_INVERSE_DESIGN_ARCHITECTURE_READY).toBe(true);
    expect(D1E_INVERSE_DESIGN_PIPELINE[0]).toBe("candidate generation");
    expect(D1E_INVERSE_DESIGN_PIPELINE.at(-1)).toBe("engineer decision");
    expect(GENERATIVE_MODEL_EQUALS_ENGINEERING_AUTHORITY).toBe(false);
    expect(GENERATIVE_MODEL_CAN_BYPASS_RC_KERNEL).toBe(false);
    expect(GENERATIVE_MODEL_CAN_BYPASS_CODE_ADAPTER).toBe(false);
    expect(GENERATIVE_MODEL_CAN_APPROVE_DESIGN).toBe(false);
    expect(D1E_OPTIMIZATION_ACCEPTS_UNDETERMINED).toBe(false);
    expect(D1E_PARETO_ACCEPTS_UNDETERMINED_AS_FEASIBLE).toBe(false);
    expect(CONCRETE_OPTIMIZATION_ACCEPTS_UNDETERMINED).toBe(false);
    expect(D1E_OPTIMIZATION_RECHECK_GOVERNANCE).toBe("PASS");
    expect(() => assertCandidateFullConcreteRecheck({
      candidateSectionRef: "sec-opt",
      proposedBy: "AI",
      deterministicRecheckRequired: true,
      rechecked: true,
      memberCheckState: "CHECK_UNDETERMINED",
    })).toThrow(/undetermined/);
    expect(GENERAL_CONCRETE_FEA_CLAIMED).toBe(false);
    expect(GENERAL_PRESTRESSED_CONCRETE_DESIGN_VALIDATED).toBe(false);
    expect(GENERAL_CONCRETE_CONNECTION_DESIGN_VALIDATED).toBe(false);
    expect(GENERAL_CONCRETE_SEISMIC_DESIGN_VALIDATED).toBe(false);
    expect(GENERAL_CONCRETE_FIRE_DESIGN_VALIDATED).toBe(false);
    expect(CONCRETE_DESIGN_IMPLIES_GEOTECHNICAL_VALIDATION).toBe(false);
  });

  it("reconciles validation debt, risk, freeze, Eurocode track, and roadmap handoff", () => {
    expect(D1E_VALIDATION_DEBT_REGISTER_RECONCILED).toBe(true);
    expect(D1E_VALIDATION_PRIORITY_PLAN_DEFINED).toBe(true);
    const originalIds = D1E_VALIDATION_DEBT_REGISTER.map((row) => row.debtId);
    expect(D1E_RECONCILED_VALIDATION_DEBT_REGISTER.map((row) => row.debtId)).toEqual(originalIds);
    const categories = new Set(D1E_RECONCILED_VALIDATION_DEBT_REGISTER.map((row) => row.category));
    for (const category of D1E_CANONICAL_VALIDATION_DEBT_CATEGORIES) {
      expect(categories.has(category)).toBe(true);
    }
    expect(D1E_VALIDATION_PRIORITY_PLAN.map((row) => row.priority)).toEqual([
      "SAFETY_CRITICAL",
      "CONFORMANCE_CRITICAL",
      "COMMERCIAL_RELEASE_CRITICAL",
      "ENHANCEMENT",
    ]);
    expect(D1E_RISKS_CLOSED).toBe("NONE");
    expect(D1E_RISKS_REDUCED).toEqual(["D0-R01"]);
    expect(D1E_RISKS_REMAINING).toEqual(["D0-R01", "D0-R04", "D0-R05", "D0-R07", "D0-R08", "D0-R10", "D0-R11", "D0-R12"]);
    expect(D1E_CLOSEOUT_D0_RISK_DISPOSITION.CLOSED).toEqual([]);
    assertD1eRiskLedgerReconciled();
    expect(D1E_ARCHITECTURE_CONTRACT_FROZEN).toBe(true);
    expect(D1E_FROZEN_ARCHITECTURE_CONTRACTS).toHaveLength(17);
    expect(D1E_FUTURE_EXTENSION_RULE_DEFINED).toBe(true);
    expect(D1E_FUTURE_EXTENSION_RULE.parallelRcKernelForbidden).toBe(true);
    expect(EU_CONCRETE_CONFORMANCE_TRACK_DEFINED).toBe(true);
    expect(EU_CONCRETE_V1_SCOPE_DEFINED).toBe(true);
    expect(EU_CONCRETE_CONFORMANCE_PHASE_PLAN_DEFINED).toBe(true);
    expect(EU_CONCRETE_CONFORMANCE_TRACK.name).toMatch(/EUROCODE CONCRETE V1/);
    expect(EU_CONCRETE_V1_SCOPE.excluded).toContain("prestressed concrete");
    expect(EU_CONCRETE_CONFORMANCE_PHASE_PLAN.map((row) => row.id)).toEqual([
      "EOS-D1E-EU-C1",
      "EOS-D1E-EU-C2",
      "EOS-D1E-EU-C3",
      "EOS-D1E-EU-C4",
      "EOS-D1E-EU-C5",
      "EOS-D1E-EU-C6",
      "EOS-D1E-EU-C7",
      "EOS-D1E-EU-C8",
      "EOS-D1E-EU-C9",
      "EOS-D1E-EU-C10",
    ]);
    expect(CANONICAL_D1E_NEXT_PHASE).toBe("EOS-D1E-EU-C1");
    expect(CANONICAL_D1E_NEXT_PHASE_SCOPE).toMatch(/Governed Eurocode/);
    expect(RECOMMENDED_D1E_NEXT_PHASE).toBe("EOS-D1E-EU-C5");
    expect(RECOMMENDED_D1E_NEXT_PHASE_SCOPE).toMatch(/shear|punching|torsion/i);
    expect(D1E_INTERNAL_ROADMAP.find((row) => row.id === "D1E-CLOSEOUT")?.status).toBe("CLOSED");
    expect(D1E_INTERNAL_ROADMAP.find((row) => row.id === "EOS-D1E-EU-C1")?.status).toBe("CLOSED");
    expect(D1E_INTERNAL_ROADMAP.find((row) => row.id === "EOS-D1E-EU-C1C")?.status).toBe("CLOSED");
    expect(D1E_INTERNAL_ROADMAP.find((row) => row.id === "EOS-D1E-EU-C1C-CONSTITUTIVE")?.status).toBe("CLOSED");
    expect(D1E_INTERNAL_ROADMAP.find((row) => row.id === "EOS-D1E-EU-C2")?.status).toBe("CLOSED");
    expect(D1E_INTERNAL_ROADMAP.find((row) => row.id === "EOS-D1E-EU-C3")?.status).toBe("CLOSED");
    expect(D1E_INTERNAL_ROADMAP.find((row) => row.id === "EOS-D1E-EU-C4")?.status).toBe("CLOSED");
    expect(D1E_INTERNAL_ROADMAP.find((row) => row.id === "EOS-D1E-EU-C5")?.status).toBe("THIS_PHASE");
    expect(D1E_CANONICAL_ROADMAP_HANDOFF.nextPhase).toBe(RECOMMENDED_D1E_NEXT_PHASE);
    expect(D1E_CANONICAL_ROADMAP_HANDOFF_CLOSEOUT.nextPhase).toBe("EOS-D1E-EU-C1");
    expect(D1E_ROADMAP_HANDOFF_VALIDATED).toBe(true);
    expect(SCHEMA_CHANGE_REQUIRED_FOR_D1E_CLOSEOUT).toBe(false);
    expect(NEW_MAJOR_DESIGN_METHOD_IMPLEMENTED_IN_D1E_CLOSEOUT).toBe(false);
    expect(D1E0_REGRESSION).toBe(false);
    expect(D1E1_COMMON_RC_KERNEL_REGRESSION).toBe(false);
    expect(AU_CONCRETE_REGRESSION).toBe(false);
    expect(EU_CONCRETE_REGRESSION).toBe(false);
    expect(US_CONCRETE_REGRESSION).toBe(false);
    expect(D1D_STEEL_ARCHITECTURE_REGRESSION).toBe(false);
    expect(D1A_STRUCTURAL_DOMAIN_REGRESSION).toBe(false);
    expect(D1B_STANDARD_BINDING_REGRESSION).toBe(false);
    expect(D1C_MECHANICS_REGRESSION).toBe(false);
    expect(EOS_D1E_CLOSEOUT_CLOSED).toBe(true);
    expect(READY_FOR_EU_CONCRETE_CONFORMANCE_TRACK).toBe(true);
    assertD1eCloseoutAudits();
  });

  it("keeps the common kernel jurisdiction-neutral and product claims truthful", () => {
    const kernel = readTree(join(here, "section-mechanics"));
    for (const pattern of [
      /AS 3600 φ/,
      /γc\s*=/,
      /gamma_c\s*=/,
      /αcc\s*=/,
      /β1\s*=/,
      /0\.85\s*\*\s*f['c]?c/,
      /εcu\s*=\s*0\.003/,
      /φc\s*=/,
      /ACI strain limit\s*=/,
    ]) {
      expect(kernel).not.toMatch(pattern);
    }
    const corpus = `${readTree(join(here, "d1e-closeout"))}\n${readFileSync(join(here, "../../../../docs/architecture/engineering-os/EOS_D1E_CONCRETE_ARCHITECTURE_CLOSEOUT.md"), "utf8")}`;
    for (const pattern of [
      /complete reinforced-concrete design product\s*=\s*YES/i,
      /COMPLETE_CONCRETE_DESIGN_PRODUCT\s*=\s*true/i,
      /is AS 3600 compliant/i,
      /is Eurocode 2 compliant/i,
      /is EN 1992 compliant/i,
      /is ACI 318 compliant/i,
      /is building-code compliant/i,
      /approved for construction without review/i,
    ]) {
      expect(corpus).not.toMatch(pattern);
    }
    const plan = readFileSync(join(here, "../../../../docs/architecture/engineering-os/EOS_D1_STRUCTURAL_COMPLETION_PLAN.md"), "utf8");
    expect(plan).toMatch(/\| D1E \| Concrete Design Capability \|/);
    expect(plan).toMatch(/EOS-D1E-EU-C1/);
  });
});
