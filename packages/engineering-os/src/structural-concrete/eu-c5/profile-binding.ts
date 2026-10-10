import { EU_C5_T3_EXTERNAL_PROFILE_INPUT_PRESENT, EU_C5_T3_TORSION_METHOD_COUNT } from "@rtb/types";

export function resolveEuC5TorsionNationalProfile(): never {
  if (EU_C5_T3_TORSION_METHOD_COUNT !== 0) {
    throw new Error("T3 must not implement torsional resistance");
  }
  if (!EU_C5_T3_EXTERNAL_PROFILE_INPUT_PRESENT) {
    throw new Error("HUMAN_PROFILE_INPUT_REQUIRED");
  }
  throw new Error("HUMAN_PROFILE_INPUT_REQUIRED");
}
