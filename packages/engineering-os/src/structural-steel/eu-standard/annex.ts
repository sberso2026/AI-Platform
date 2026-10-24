import type { EurocodeNationalAnnex, EurocodeNdpRecord, EurocodeSteelDesignContext } from "@rtb/types";
import { COUNTRY_AND_STANDARD_SEPARATE, DEFAULT_EU_NATIONAL_ANNEX, NDP_VALUE_GUESSED } from "@rtb/types";

export const EUROCODE_COUNTRY_CODES = [
  "DE", "FR", "NL", "BE", "IE", "IT", "ES", "SE", "DK", "FI", "PL", "AT", "CZ",
  "PT", "GR", "HU", "RO", "BG", "HR", "SK", "SI", "LT", "LV", "EE", "LU", "MT", "CY",
] as const;

export const UK_EUROCODE_COUNTRY_CODE = "GB" as const;

export const EUROCODE_COUNTRY_PROFILE_SUPPORTED = true as const;

export const GOVERNED_NDP_CATALOG: readonly EurocodeNdpRecord[] = [];

export function assertCountryAndStandardSeparate(countryCode: string, standardCode: string): void {
  if (!COUNTRY_AND_STANDARD_SEPARATE) throw new Error("country and standard must remain separate");
  if (!countryCode?.trim()) throw new Error("NATIONAL_ANNEX_MISMATCH: Eurocode country code is required and is not a standard identifier");
  if (!standardCode?.trim() || standardCode === countryCode) {
    throw new Error("country is not a substitute for a Eurocode standard identifier");
  }
}

export function assertNoDefaultNationalAnnex(annex: EurocodeNationalAnnex | null | undefined): void {
  if (DEFAULT_EU_NATIONAL_ANNEX) throw new Error("a default EU National Annex is forbidden");
  void annex;
}

export function assertAnnexCompatibleWithContext(
  context: Pick<EurocodeSteelDesignContext, "countryCode" | "standardPart" | "version">,
  annex: EurocodeNationalAnnex,
): void {
  assertNoDefaultNationalAnnex(annex);
  if (annex.countryCode !== context.countryCode) {
    throw new Error("NATIONAL_ANNEX_MISMATCH: country does not match the National Annex");
  }
  if (annex.standardPartRef !== context.standardPart) {
    throw new Error("NATIONAL_ANNEX_MISMATCH: standard part does not match the National Annex");
  }
  if (annex.generationFamily !== context.version.generationFamily) {
    throw new Error("STANDARD_VERSION_CONFLICT: National Annex generation does not match the standard generation");
  }
  if (context.version.edition !== "UNKNOWN_PENDING_CONFIRMATION" && annex.edition !== context.version.edition) {
    throw new Error("NATIONAL_ANNEX_MISMATCH: National Annex edition does not match the standard edition");
  }
}

export function resolveNdp(input: {
  ruleRequiresNdp: boolean;
  annex: EurocodeNationalAnnex | null;
  ndpSet: readonly EurocodeNdpRecord[];
  parameterId: string;
}): { kind: "BASE_RULE_CONTEXT" } | { kind: "RESOLVED"; record: EurocodeNdpRecord } | { kind: "FAIL_CLOSED"; reason: "NATIONAL_ANNEX_REQUIRED" | "NDP_REQUIRED"; checkState: "CHECK_UNDETERMINED" } {
  if (NDP_VALUE_GUESSED) throw new Error("NDP values must not be guessed");
  if (!input.ruleRequiresNdp) return { kind: "BASE_RULE_CONTEXT" };
  if (!input.annex) {
    return { kind: "FAIL_CLOSED", reason: "NATIONAL_ANNEX_REQUIRED", checkState: "CHECK_UNDETERMINED" };
  }
  const record = input.ndpSet.find((row) => row.parameterId === input.parameterId && row.nationalAnnexRef === input.annex?.nationalAnnexId) ?? null;
  if (!record || record.value == null || record.value === "") {
    return { kind: "FAIL_CLOSED", reason: "NDP_REQUIRED", checkState: "CHECK_UNDETERMINED" };
  }
  if (record.country !== input.annex.countryCode) {
    return { kind: "FAIL_CLOSED", reason: "NDP_REQUIRED", checkState: "CHECK_UNDETERMINED" };
  }
  return { kind: "RESOLVED", record };
}

export function assertNdpNotGuessed(record: EurocodeNdpRecord | null): void {
  if (NDP_VALUE_GUESSED) throw new Error("NDP values must not be guessed");
  if (record && (record.validationState === "GUESSED" || record.sourceAuthorityRef === "LLM_MEMORY_ONLY")) {
    throw new Error("NDP values must not be guessed");
  }
}
