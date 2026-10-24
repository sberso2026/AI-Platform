import {
  DEFAULT_DEFLECTION_LIMIT_GUESSED,
  DEFAULT_US_DEFLECTION_LIMIT_GUESSED,
  US_SPAN_RATIO_DENOMINATOR_GUESSED,
  US_VIBRATION_DESIGN_IMPLEMENTED,
} from "@rtb/types";
import { AISC_UNKNOWN_EDITION_TOKEN } from "@rtb/types";

export const AU_EU_MEMBER_ORCHESTRATION_REVIEW = [
  { component: "SteelMemberDesignRecord / completeness matrix / optimization handoff", classification: "JURISDICTION_NEUTRAL_REUSABLE", action: "reused as USSteelMemberDesignRecord host" },
  { component: "resolveMemberApplicability / aggregateCompleteness / selectGoverningCheck", classification: "JURISDICTION_NEUTRAL_REUSABLE", action: "reused from au-member" },
  { component: "fingerprint + invalidation tags / stale-result fail-closed", classification: "JURISDICTION_NEUTRAL_REUSABLE", action: "extended with LRFD/ASD, stability method, classification, building-code, local amendment, AISC edition" },
  { component: "D1C deflection + governed criterion evaluation", classification: "JURISDICTION_NEUTRAL_REUSABLE", action: "reused; US adds building-code, local-amendment, and direct-contract fail-closed" },
  { component: "AU tension CHECK_SATISFIED as member engineering pass", classification: "AU_SPECIFIC", action: "not reused; US mechanics cannot complete AISC code-design" },
  { component: "Australian steel standard / AUST300 catalog / AU method versions", classification: "AU_SPECIFIC", action: "not copied into US adapter" },
  { component: "Eurocode steel standard / annex binding / national parameters / Eurocode member pass semantics", classification: "EU_SPECIFIC", action: "not copied into US adapter" },
] as const;

export const US_AU_MEMBER_ORCHESTRATION_REVIEWED = true as const;
export const US_EU_MEMBER_ORCHESTRATION_REVIEWED = true as const;

export function rejectUnknownUsMemberParameter(name: string): never {
  throw new Error(`steel design fail closed: unknown required code parameter ${name}`);
}

export function requestUsDefaultDeflectionLimit(): never {
  if (DEFAULT_DEFLECTION_LIMIT_GUESSED || DEFAULT_US_DEFLECTION_LIMIT_GUESSED) {
    throw new Error("default deflection limit must not be guessed");
  }
  return rejectUnknownUsMemberParameter("defaultDeflectionLimitLn");
}

export function requestUsGuessedSpanRatioDenominator(): never {
  if (US_SPAN_RATIO_DENOMINATOR_GUESSED) throw new Error("span-ratio denominator must not be guessed");
  return rejectUnknownUsMemberParameter("spanRatioDenominator");
}

export function requestUsVibrationDesign(): never {
  if (US_VIBRATION_DESIGN_IMPLEMENTED) throw new Error("vibration design must not be implemented in US-7");
  return rejectUnknownUsMemberParameter("vibrationDesign");
}

export function denyAiUsMechanicsToAiscPromotion(): never {
  throw new Error("AI_AUTHORITY_DENIED: AI cannot promote mechanics reference to AISC strength");
}

export function denyAiUsServiceabilityCriterion(): never {
  throw new Error("AI_AUTHORITY_DENIED: AI cannot invent a serviceability criterion");
}

export function denyAiUsDesignMethodSelection(): never {
  throw new Error("AI_AUTHORITY_DENIED: AI cannot choose LRFD or ASD");
}

export function denyAiUsBuildingCodeCompliance(): never {
  throw new Error("AI_AUTHORITY_DENIED: AI cannot claim building-code compliance");
}

export function assertAiscMemberEditionIsolation(left: string, right: string): void {
  const leftKnown = left !== AISC_UNKNOWN_EDITION_TOKEN;
  const rightKnown = right !== AISC_UNKNOWN_EDITION_TOKEN;
  if (leftKnown && rightKnown && left !== right) {
    throw new Error("STANDARD_VERSION_CONFLICT: AISC member method cannot silently cross editions");
  }
}
