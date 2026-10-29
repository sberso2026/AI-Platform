import { STALE_CONSTITUTIVE_RESULT_REUSE_ALLOWED } from "@rtb/types";

export function euC1cConstitutiveResultFingerprint(parts: Record<string, string | number | boolean | null>): string {
  return JSON.stringify(parts);
}

export function euC1cConstitutiveInvalidationTags(previous: string, current: string): string[] {
  if (STALE_CONSTITUTIVE_RESULT_REUSE_ALLOWED) throw new Error("stale constitutive result reuse must not be allowed");
  return previous === current ? [] : ["EU_C1C_CONSTITUTIVE_INPUT_OR_RULE_CHANGED"];
}

export function assertStaleEuC1cConstitutiveNotReused(tags: string[], reuseAttempted: boolean): void {
  if (reuseAttempted && tags.length > 0) throw new Error("EU C1C constitutive fail closed: stale result reuse");
}
