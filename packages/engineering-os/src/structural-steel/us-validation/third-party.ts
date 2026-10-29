import type { UsThirdPartyValidationRecord } from "@rtb/types";
import { US_THIRD_PARTY_VALIDATION_AVAILABLE } from "@rtb/types";
import { assertUsThirdPartyEvidenceNotFabricated } from "./guards";

export const US_THIRD_PARTY_VALIDATION_RECORDS: readonly UsThirdPartyValidationRecord[] = [];

export const US_THIRD_PARTY_VALIDATION_STATE = "NOT_AVAILABLE" as const;

export function assertUsThirdPartyValidationModel(): void {
  assertUsThirdPartyEvidenceNotFabricated();
  if (US_THIRD_PARTY_VALIDATION_AVAILABLE) throw new Error("third-party validation must not be fabricated");
  if (US_THIRD_PARTY_VALIDATION_RECORDS.length > 0) {
    throw new Error("third-party validation must not be fabricated");
  }
}
