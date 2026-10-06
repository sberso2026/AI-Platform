import type { EuThirdPartyValidationRecord } from "@rtb/types";
import { EU_THIRD_PARTY_VALIDATION_AVAILABLE } from "@rtb/types";
import { assertEuThirdPartyEvidenceNotFabricated } from "./guards";

export const EU_THIRD_PARTY_VALIDATION_RECORDS: readonly EuThirdPartyValidationRecord[] = [];

export const EU_THIRD_PARTY_VALIDATION_STATE = "NOT_AVAILABLE" as const;

export function assertEuThirdPartyValidationModel(): void {
  assertEuThirdPartyEvidenceNotFabricated();
  if (EU_THIRD_PARTY_VALIDATION_AVAILABLE) throw new Error("third-party validation must not be fabricated");
  if (EU_THIRD_PARTY_VALIDATION_RECORDS.length > 0) {
    throw new Error("third-party validation must not be fabricated");
  }
}
