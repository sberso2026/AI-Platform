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
  if ((previous.nationalAnnexId ?? null) !== (current.nationalAnnexId ?? null)) tags.push("NATIONAL_ANNEX_CHANGED");
  if ((previous.ndpSetRef ?? null) !== (current.ndpSetRef ?? null)) tags.push("NDP_CHANGED");
  if ((previous.edition ?? null) !== (current.edition ?? null)) tags.push("EDITION_CHANGED");
  if ((previous.generationFamily ?? null) !== (current.generationFamily ?? null)) tags.push("GENERATION_CHANGED");
  if ((previous.restraintDescription ?? null) !== (current.restraintDescription ?? null)) tags.push("RESTRAINT_CHANGED");
  if ((previous.designMethod ?? null) !== (current.designMethod ?? null)) tags.push("DESIGN_METHOD_CHANGED");
  if ((previous.stabilityMethod ?? null) !== (current.stabilityMethod ?? null)) tags.push("STABILITY_METHOD_CHANGED");
  if ((previous.classificationState ?? null) !== (current.classificationState ?? null)) tags.push("CLASSIFICATION_CHANGED");
  if ((previous.buildingCodeEdition ?? null) !== (current.buildingCodeEdition ?? null)) tags.push("BUILDING_CODE_EDITION_CHANGED");
  if ((previous.localAmendmentSetRef ?? null) !== (current.localAmendmentSetRef ?? null)) tags.push("LOCAL_AMENDMENT_CHANGED");
  if ((previous.aiscEdition ?? null) !== (current.aiscEdition ?? null)) tags.push("AISC_EDITION_CHANGED");
  return tags;
}

export function assertStaleResultsNotReused(tags: SteelMemberInvalidationTag[], reuseAttempted: boolean): void {
  if (STALE_RESULT_REUSE_ALLOWED) throw new Error("stale result reuse must not be allowed");
  if (reuseAttempted && tags.length > 0) {
    throw new Error("steel design fail closed: stale result");
  }
}
