import { describe, expect, it } from "vitest";
import { NEW_C7_DEFLECTION_RUNTIME_METHOD_IMPLEMENTED } from "@rtb/types";
import { CONCRETE_CAPABILITY_MANIFEST, D1E_INTERNAL_ROADMAP, D1E_VALIDATION_DEBT_REGISTER } from "./capability";
import { D1E_CANONICAL_CAPABILITY_MATRIX } from "./d1e-closeout";
import {
  C7_LONG_TERM_VALUE_DEFAULTS_PRESENT,
  C7_SHRINKAGE_SIGN_CONVENTION,
  EU_C7_BOUNDED_TRACK_COMPLETE,
  EU_C7_CALCULATED_CREEP_CAPABILITY,
  EU_C7_CALCULATED_SHRINKAGE_CAPABILITY,
  EU_C7_CLOSEOUT_RUNTIME_METHOD_IDS,
  EU_C7_COMPLETE_EN1992_SERVICEABILITY,
  EU_C7_DEFLECTION_AUTONOMOUS_RECOVERY_REOPENED,
  EU_C7_DEFLECTION_RULE_AUTHORITY_STATE,
  EU_C7_DEFLECTION_RUNTIME_CAPABILITY,
  EU_C7_DEFLECTION_RUNTIME_METHOD_REGISTERED,
  EU_C7_ENGINEER_VALIDATED_METHOD_COUNT,
  EU_C7_MATURITY_STATE,
  EU_C7_NEXT_ROADMAP_PHASE,
  EU_C7_VALIDATION_MATRIX,
  GENERIC_ELASTIC_MECHANICS_EQUALS_EUROCODE_DEFLECTION,
  HIDDEN_DEFLECTION_CAPABILITY_CLAIM,
  NEW_C7_ENGINEERING_FORMULA_IMPLEMENTED,
  assertEuC7CloseoutPreservesPriorFlags,
} from "./eu-c7";

describe("EOS-D1E-EU-C7-R5 closeout", () => {
  it("closes the bounded track without a deflection runtime", () => {
    expect(EU_C7_BOUNDED_TRACK_COMPLETE).toBe(true);
    expect(EU_C7_COMPLETE_EN1992_SERVICEABILITY).toBe(false);
    expect(EU_C7_MATURITY_STATE).toBe("FRAMEWORK_PLUS_BOUNDED_METHODS");
    expect(EU_C7_DEFLECTION_RUNTIME_CAPABILITY).toBe("NOT_IMPLEMENTED");
    expect(EU_C7_DEFLECTION_RULE_AUTHORITY_STATE).toBe("DEFERRED_RULE_AUTHORITY");
    expect(EU_C7_DEFLECTION_RUNTIME_METHOD_REGISTERED).toBe(false);
    expect(EU_C7_DEFLECTION_AUTONOMOUS_RECOVERY_REOPENED).toBe(false);
    expect(EU_C7_CALCULATED_CREEP_CAPABILITY).toBe("NOT_IMPLEMENTED");
    expect(EU_C7_CALCULATED_SHRINKAGE_CAPABILITY).toBe("NOT_IMPLEMENTED");
    expect(EU_C7_ENGINEER_VALIDATED_METHOD_COUNT).toBe(0);
    expect(C7_SHRINKAGE_SIGN_CONVENTION).toBe("SHRINKAGE_MAGNITUDE_POSITIVE");
    expect(C7_LONG_TERM_VALUE_DEFAULTS_PRESENT).toBe(false);
    expect(GENERIC_ELASTIC_MECHANICS_EQUALS_EUROCODE_DEFLECTION).toBe(false);
    expect(HIDDEN_DEFLECTION_CAPABILITY_CLAIM).toBe(false);
    expect(NEW_C7_ENGINEERING_FORMULA_IMPLEMENTED).toBe(false);
    expect(NEW_C7_DEFLECTION_RUNTIME_METHOD_IMPLEMENTED).toBe(false);
    expect(EU_C7_CLOSEOUT_RUNTIME_METHOD_IDS).toEqual([
      "EU_RC_CRACK_WIDTH_EN1992_REFERENCE",
      "EU_RC_LONG_TERM_EXPLICIT_EN1992_REFERENCE",
    ]);
    expect(EU_C7_VALIDATION_MATRIX.DEFLECTION.implemented).toBe(false);
    expect(EU_C7_VALIDATION_MATRIX.CRACK_WIDTH.numericallyValidated).toBe(true);
    expect(EU_C7_VALIDATION_MATRIX.EXPLICIT_LONG_TERM_STATE.engineerValidated).toBe(false);
    expect(EU_C7_NEXT_ROADMAP_PHASE).toBe("EOS-D1E-EU-C8");
    expect(() => assertEuC7CloseoutPreservesPriorFlags()).not.toThrow();
  });

  it("keeps the canonical matrix and debt truthful", () => {
    const row = (name: string) => D1E_CANONICAL_CAPABILITY_MATRIX.find((item) => item.capability === name);
    expect(row("crack control")?.EU.implemented).toBe(true);
    expect(row("crack control")?.EU.numericallyValidated).toBe(true);
    expect(row("crack control")?.EU.conformanceValidated).toBe(false);
    expect(row("creep/shrinkage")?.EU.implemented).toBe(true);
    expect(row("creep/shrinkage")?.EU.numericallyValidated).toBe(true);
    expect(row("deflection")?.EU.implemented).toBe(false);
    expect(row("deflection")?.EU.limitation).toContain("NOT_IMPLEMENTED");
    const deflection = D1E_VALIDATION_DEBT_REGISTER.find((item) => item.debtId === "D1E-EU-VD-DEFLECTION");
    expect(deflection?.blockingState).toBe("DEFERRED_RULE_AUTHORITY");
    expect(D1E_INTERNAL_ROADMAP.find((item) => item.id === "EOS-D1E-EU-C7-R5-CLOSEOUT")?.status).toBe("CLOSED");
    expect(D1E_INTERNAL_ROADMAP.find((item) => item.id === "EOS-D1E-EU-C8")?.status).toBe("CLOSED");
    const manifest = CONCRETE_CAPABILITY_MANIFEST.filter((item) => item.capabilityId.startsWith("D1E.EU.C7"));
    expect(manifest.every((item) => item.conformanceState === "INTENDED_PROFILE")).toBe(true);
    expect(manifest.every((item) => item.limitations.includes("DEFLECTION_RUNTIME_CAPABILITY = NOT_IMPLEMENTED"))).toBe(true);
  });
});
