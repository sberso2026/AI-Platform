import { STALE_EU_C3_RESULT_REUSE_ALLOWED } from "@rtb/types";

export function euC3ResultFingerprint(parts: Record<string, string | number | boolean | null | undefined>): string {
  return JSON.stringify(parts);
}

export function euC3InvalidationTags(previous: string, current: string): string[] {
  if (STALE_EU_C3_RESULT_REUSE_ALLOWED) throw new Error("stale EU C3 result reuse must not be allowed");
  return previous === current ? [] : ["EU_C3_INPUT_OR_DEPENDENCY_CHANGED"];
}

export function assertStaleEuC3NotReused(tags: string[], reuseAttempted: boolean): void {
  if (reuseAttempted && tags.length > 0) throw new Error("EU C3 fail closed: stale result reuse");
}
