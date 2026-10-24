import {
  DEFAULT_DEFLECTION_LIMIT_GUESSED,
  EU_SPAN_RATIO_DENOMINATOR_GUESSED,
  EU_VIBRATION_DESIGN_IMPLEMENTED,
} from "@rtb/types";
import { rejectUnknownEuInteractionParameter } from "../eu-combined/authority";

export const AU_MEMBER_ORCHESTRATION_REVIEW = [
  { component: "SteelMemberDesignRecord / completeness matrix / optimization handoff", classification: "JURISDICTION_NEUTRAL_REUSABLE", action: "reused as EurocodeSteelMemberDesignRecord host" },
  { component: "resolveMemberApplicability / aggregateCompleteness / selectGoverningCheck", classification: "JURISDICTION_NEUTRAL_REUSABLE", action: "reused from au-member" },
  { component: "fingerprint + invalidation tags / stale-result fail-closed", classification: "JURISDICTION_NEUTRAL_REUSABLE", action: "extended with Annex/NDP/edition/generation" },
  { component: "D1C deflection + governed criterion evaluation", classification: "JURISDICTION_NEUTRAL_REUSABLE", action: "reused; EU adds Annex/NDP fail-closed" },
  { component: "AU tension CHECK_SATISFIED as member engineering pass", classification: "AU_SPECIFIC", action: "not reused; EU mechanics cannot complete code-design" },
  { component: "AS 4100 / AUST300 / AU method versions", classification: "AU_SPECIFIC", action: "not copied into EU adapter" },
] as const;

export const AU_MEMBER_ORCHESTRATION_REVIEWED = true as const;
export const COMMON_MEMBER_ORCHESTRATION_REUSED_WHERE_VALID = true as const;

export function requestEuDefaultDeflectionLimit(): never {
  if (DEFAULT_DEFLECTION_LIMIT_GUESSED) throw new Error("default deflection limit must not be guessed");
  return rejectUnknownEuInteractionParameter("defaultDeflectionLimitLn");
}

export function requestEuGuessedSpanRatioDenominator(): never {
  if (EU_SPAN_RATIO_DENOMINATOR_GUESSED) throw new Error("span-ratio denominator must not be guessed");
  return rejectUnknownEuInteractionParameter("spanRatioDenominator");
}

export function requestEuVibrationDesign(): never {
  if (EU_VIBRATION_DESIGN_IMPLEMENTED) throw new Error("vibration design must not be implemented in EU-7");
  return rejectUnknownEuInteractionParameter("vibrationDesign");
}

export function denyAiMechanicsToCodePromotion(): never {
  throw new Error("AI_AUTHORITY_DENIED: AI cannot promote mechanics reference to Eurocode capacity");
}

export function denyAiServiceabilityCriterion(): never {
  throw new Error("AI_AUTHORITY_DENIED: AI cannot invent a serviceability criterion");
}
