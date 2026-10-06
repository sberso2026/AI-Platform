import type { EuConcreteNdpRecord, EurocodeConcreteCalculationContext, EurocodeNationalAnnex } from "@rtb/types";
import {
  DEFAULT_EU_CONCRETE_NATIONAL_ANNEX,
  EU_CONCRETE_NDP_VALUE_GUESSED,
} from "@rtb/types";
import {
  assertNoDefaultNationalAnnex,
} from "../../structural-steel/eu-standard";

export function assertNoDefaultEuConcreteNationalAnnex(annex: EurocodeNationalAnnex | null | undefined): void {
  if (DEFAULT_EU_CONCRETE_NATIONAL_ANNEX) throw new Error("a default EU concrete National Annex is forbidden");
  assertNoDefaultNationalAnnex(annex);
}

export function assertNdpGenerationCompatible(
  context: Pick<EurocodeConcreteCalculationContext, "version">,
  record: EuConcreteNdpRecord,
): void {
  if (EU_CONCRETE_NDP_VALUE_GUESSED) throw new Error("EU concrete NDP values must not be guessed");
  if (record.generationFamily !== context.version.generationFamily) {
    throw new Error("NDP_EDITION_INCOMPATIBLE: NDP generation does not match the standard generation");
  }
  if (
    context.version.edition !== "UNKNOWN_PENDING_CONFIRMATION" &&
    record.effectiveDate &&
    context.version.effectiveDate &&
    record.effectiveDate !== context.version.effectiveDate
  ) {
    throw new Error("NDP_EDITION_INCOMPATIBLE: NDP effective period does not match the standard edition");
  }
}

export const GOVERNED_EU_CONCRETE_NDP_CATALOG: readonly EuConcreteNdpRecord[] = [];
