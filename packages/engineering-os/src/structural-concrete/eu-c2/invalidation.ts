import { STALE_EU_C2_RESULT_REUSE_ALLOWED } from "@rtb/types";

export function euC2ResultFingerprint(parts: Record<string, string | number | boolean | null | undefined>): string {
  return JSON.stringify(parts);
}

export function euC2InvalidationTags(previous: string, current: string): string[] {
  if (STALE_EU_C2_RESULT_REUSE_ALLOWED) throw new Error("stale EU C2 result reuse must not be allowed");
  return previous === current ? [] : ["EU_C2_INPUT_OR_DEPENDENCY_CHANGED"];
}

export function assertStaleEuC2NotReused(tags: string[], reuseAttempted: boolean): void {
  if (reuseAttempted && tags.length > 0) throw new Error("EU C2 fail closed: stale result reuse");
}
