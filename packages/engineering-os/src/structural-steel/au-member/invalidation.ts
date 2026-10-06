import type { SteelMemberDesignFingerprint, SteelMemberInvalidationTag } from "@rtb/types";
import { STALE_RESULT_REUSE_ALLOWED } from "@rtb/types";

export function memberDesignFingerprint(input: SteelMemberDesignFingerprint): SteelMemberDesignFingerprint {
  return { ...input, methodVersions: { ...input.methodVersions } };
}

export function invalidationTags(previous: SteelMemberDesignFingerprint | null | undefined, current: SteelMemberDesignFingerprint): SteelMemberInvalidationTag[] {
  if (!previous) return [];
  const tags: SteelMemberInvalidationTag[] = [];
  if (previous.sectionRef !== current.sectionRef) tags.push("SECTION_CHANGED");
  if (previous.materialRef !== current.materialRef) tags.push("MATERIAL_CHANGED");
  if (previous.demandResultId !== current.demandResultId || previous.combinationId !== current.combinationId) {
    tags.push("LOAD_CHANGED");
  }
  if (previous.unbracedLengthM !== current.unbracedLengthM) tags.push("UNBRACED_LENGTH_CHANGED");
  if (previous.effectiveLengthMajorM !== current.effectiveLengthMajorM || previous.effectiveLengthMinorM !== current.effectiveLengthMinorM) {
    tags.push("EFFECTIVE_LENGTH_CHANGED");
  }
  if (previous.criterionRef !== current.criterionRef) tags.push("SERVICEABILITY_CRITERION_CHANGED");
  if (previous.standardContextId !== current.standardContextId) tags.push("STANDARD_PROFILE_CHANGED");
  return tags;
}

export function assertStaleResultsNotReused(tags: SteelMemberInvalidationTag[], reuseAttempted: boolean): void {
  if (STALE_RESULT_REUSE_ALLOWED) throw new Error("stale result reuse must not be allowed");
  if (reuseAttempted && tags.length > 0) {
    throw new Error("steel design fail closed: stale result");
  }
}
