import { STALE_EU_C4_RESULT_REUSE_ALLOWED } from "@rtb/types";

export function euC4ResultFingerprint(parts: Record<string, string | number | boolean | null | undefined>): string {
  return JSON.stringify(parts);
}

export function euC4InvalidationTags(previous: string, current: string): string[] {
  if (STALE_EU_C4_RESULT_REUSE_ALLOWED) throw new Error("stale EU C4 result reuse must not be allowed");
  return previous === current ? [] : ["EU_C4_INPUT_OR_DEPENDENCY_CHANGED"];
}

export function assertStaleEuC4NotReused(tags: string[], reuseAttempted: boolean): void {
  if (reuseAttempted && tags.length > 0) throw new Error("EU C4 fail closed: stale result reuse");
}
