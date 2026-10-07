import { STALE_EU_C1C_R1_RESULT_REUSE_ALLOWED } from "@rtb/types";

export function euC1cR1ResultFingerprint(parts: Record<string, string | number | boolean | null>): string {
  return JSON.stringify(parts);
}

export function euC1cR1InvalidationTags(previous: string, current: string): string[] {
  if (STALE_EU_C1C_R1_RESULT_REUSE_ALLOWED) throw new Error("stale EU C1C-R1 result reuse must not be allowed");
  return previous === current ? [] : ["EU_C1C_R1_INPUT_OR_RULE_CHANGED"];
}

export function assertStaleEuC1cR1NotReused(tags: string[], reuseAttempted: boolean): void {
  if (reuseAttempted && tags.length > 0) throw new Error("EU C1C-R1 fail closed: stale result reuse");
}
