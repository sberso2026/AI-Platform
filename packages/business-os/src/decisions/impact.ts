import type {
  BusinessDecisionImpact,
  BusinessDecisionImpactDimension,
  BusinessDecisionImpactInput,
  BusinessDecisionQuantification,
} from "@rtb/types";
import { BUSINESS_DECISION_IMPACT_DIMENSIONS } from "@rtb/types";
import { parseMinor } from "../finance/money";

export function normalizeImpactQuantification(input: BusinessDecisionImpactInput): {
  quantification: BusinessDecisionQuantification;
  qualitativeOnly: boolean;
  valueMinor: string | null;
} {
  const rawMinor = parseMinor(input.valueMinor ?? null);
  const requested = input.quantification;
  if (requested === "quantitative") {
    if (rawMinor === null) {
      return { quantification: "unknown", qualitativeOnly: false, valueMinor: null };
    }
    return { quantification: "quantitative", qualitativeOnly: false, valueMinor: rawMinor.toString() };
  }
  if (requested === "qualitative") {
    return {
      quantification: "qualitative",
      qualitativeOnly: true,
      valueMinor: null,
    };
  }
  if (rawMinor !== null && requested !== "unknown") {
    return { quantification: "quantitative", qualitativeOnly: false, valueMinor: rawMinor.toString() };
  }
  if (input.qualitativeLabel && requested !== "unknown") {
    return { quantification: "qualitative", qualitativeOnly: true, valueMinor: null };
  }
  return { quantification: "unknown", qualitativeOnly: false, valueMinor: null };
}

export function impactDisplay(impact: Pick<BusinessDecisionImpact, "quantification" | "valueMinor" | "currency" | "unit" | "qualitativeLabel" | "qualitativeOnly">): string {
  if (impact.quantification === "unknown") return "unknown";
  if (impact.quantification === "qualitative" || impact.qualitativeOnly) {
    return impact.qualitativeLabel ? `qualitative: ${impact.qualitativeLabel}` : "qualitative";
  }
  if (impact.valueMinor == null) return "unknown";
  const unit = impact.unit ?? impact.currency ?? "";
  return `${impact.valueMinor}${unit ? ` ${unit}` : ""}`;
}

export function unknownDimensions(impacts: BusinessDecisionImpact[]): BusinessDecisionImpactDimension[] {
  const known = new Set(
    impacts.filter((row) => row.quantification !== "unknown").map((row) => row.dimension),
  );
  return BUSINESS_DECISION_IMPACT_DIMENSIONS.filter((dim) => !known.has(dim));
}

export function mixedImpactCurrencies(impacts: BusinessDecisionImpact[]): boolean {
  const currencies = new Set(
    impacts
      .filter((row) => row.quantification === "quantitative" && row.currency)
      .map((row) => row.currency!.toUpperCase()),
  );
  return currencies.size > 1;
}
