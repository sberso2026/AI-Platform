import {
  EU_C2_METHOD_IDS,
  EU_C3_METHOD_IDS,
  EU_C4_METHOD_IDS,
  EU_C5_C2_FLEXURE_REUSED_NOT_REIMPLEMENTED,
  EU_C5_C3_PM_REUSED_NOT_REIMPLEMENTED,
  EU_C5_C4_PMM_REUSED_NOT_REIMPLEMENTED,
  EU_C5_CHECKS_EQUAL_MEMBER_CONFORMANCE,
  EU_CONCRETE_PACK_CERTIFIED,
  EU_CONCRETE_STANDARD_CONFORMANCE_STATE,
  NUMERICAL_C5_VALIDATION_EQUALS_STANDARD_CONFORMANCE,
  NUMERICAL_CONCRETE_CODE_SHEAR_IMPLEMENTED,
  NUMERICAL_CONCRETE_TORSION_IMPLEMENTED,
  EU_C5_IMPLEMENTED_METHOD_IDS,
  EU_C5_IMPLEMENTED_PUNCHING_METHOD_COUNT,
  EU_C5_IMPLEMENTED_SHEAR_METHOD_COUNT,
  EU_C5_IMPLEMENTED_TORSION_METHOD_COUNT,
  EU_C5_NUMERICALLY_VALIDATED_PUNCHING_METHOD_COUNT,
  EU_C5_NUMERICALLY_VALIDATED_SHEAR_METHOD_COUNT,
  EU_C5_NUMERICALLY_VALIDATED_TORSION_METHOD_COUNT,
  NUMERICAL_EU_CONCRETE_SHEAR_IMPLEMENTED,
  NUMERICAL_EU_CONCRETE_TORSION_IMPLEMENTED,
  NUMERICAL_EU_PUNCHING_SHEAR_IMPLEMENTED,
  NUMERICAL_PUNCHING_SHEAR_IMPLEMENTED,
} from "@rtb/types";
import { assertEuC5FailClosed } from "./policy";

export function assertEuC5AuthorityBoundary(): void {
  assertEuC5FailClosed();
  if (NUMERICAL_C5_VALIDATION_EQUALS_STANDARD_CONFORMANCE) {
    throw new Error("C5 numerical validation must not equal standard conformance");
  }
  if (EU_CONCRETE_STANDARD_CONFORMANCE_STATE !== "INTENDED_PROFILE") {
    throw new Error("C5 must not promote EU concrete conformance state");
  }
  if (EU_CONCRETE_PACK_CERTIFIED) throw new Error("C5 must not certify the EU concrete pack");
  if (EU_C5_CHECKS_EQUAL_MEMBER_CONFORMANCE) {
    throw new Error("C5 checks must not equal member conformance");
  }
  if (!EU_C5_C2_FLEXURE_REUSED_NOT_REIMPLEMENTED || !EU_C5_C3_PM_REUSED_NOT_REIMPLEMENTED || !EU_C5_C4_PMM_REUSED_NOT_REIMPLEMENTED) {
    throw new Error("C5 must not reimplement C2/C3/C4");
  }
  if (!NUMERICAL_EU_CONCRETE_SHEAR_IMPLEMENTED || NUMERICAL_CONCRETE_CODE_SHEAR_IMPLEMENTED) {
    throw new Error("C5 shear belongs to the EU adapter, not a common code-shear kernel");
  }
  if (!NUMERICAL_EU_PUNCHING_SHEAR_IMPLEMENTED || NUMERICAL_PUNCHING_SHEAR_IMPLEMENTED) {
    throw new Error("C5 punching belongs to the EU adapter, not a common punching kernel");
  }
  if (NUMERICAL_CONCRETE_TORSION_IMPLEMENTED) {
    throw new Error("C5 torsion belongs to the EU adapter, not a common torsion kernel");
  }
  if (!NUMERICAL_EU_CONCRETE_TORSION_IMPLEMENTED) {
    throw new Error("C5 torsion method flag drifted");
  }
  if (EU_C5_IMPLEMENTED_SHEAR_METHOD_COUNT !== EU_C5_NUMERICALLY_VALIDATED_SHEAR_METHOD_COUNT) {
    throw new Error("implemented shear methods must be numerically validated");
  }
  if (EU_C5_IMPLEMENTED_PUNCHING_METHOD_COUNT !== EU_C5_NUMERICALLY_VALIDATED_PUNCHING_METHOD_COUNT) {
    throw new Error("implemented punching methods must be numerically validated");
  }
  if (EU_C5_IMPLEMENTED_TORSION_METHOD_COUNT !== 1 || EU_C5_NUMERICALLY_VALIDATED_TORSION_METHOD_COUNT !== 1) {
    throw new Error("the bounded torsion method must be implemented and numerically validated");
  }
  if (EU_C5_IMPLEMENTED_METHOD_IDS.length !== EU_C5_IMPLEMENTED_SHEAR_METHOD_COUNT + EU_C5_IMPLEMENTED_PUNCHING_METHOD_COUNT + EU_C5_IMPLEMENTED_TORSION_METHOD_COUNT) {
    throw new Error("C5 method count drifted");
  }
  if (EU_C4_METHOD_IDS.length !== 1) {
    throw new Error("C5 must not mutate the C4 biaxial method registry");
  }
  if (EU_C2_METHOD_IDS.length !== 2 || EU_C3_METHOD_IDS.length !== 2) {
    throw new Error("C5 must not mutate C2/C3 method registries");
  }
}
