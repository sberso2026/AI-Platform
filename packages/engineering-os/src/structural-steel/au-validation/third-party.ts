import type { AuThirdPartyValidationRecord } from "@rtb/types";
import { THIRD_PARTY_VALIDATION_AVAILABLE } from "@rtb/types";

export const AU_THIRD_PARTY_VALIDATION_RECORDS: readonly AuThirdPartyValidationRecord[] = [];

export const THIRD_PARTY_VALIDATION_STATE = "NOT_AVAILABLE" as const;

export function assertThirdPartyEvidenceNotFabricated(): void {
  if (THIRD_PARTY_VALIDATION_AVAILABLE) throw new Error("third-party validation must not be fabricated");
  if (AU_THIRD_PARTY_VALIDATION_RECORDS.length > 0) {
    throw new Error("third-party validation must not be fabricated");
  }
}
