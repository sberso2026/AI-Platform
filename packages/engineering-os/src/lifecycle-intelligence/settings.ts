import { DEFAULT_ENGINEERING_LIFECYCLE_PROFILE, lifecycleProfileById } from "./profile";
import type { LifecycleCriterionDefinition, LifecycleProfile, LifecycleProfileSetting } from "./types";

export function unknownLifecycleProfileRejected(profileId: string, profileVersion: string): boolean {
  return lifecycleProfileById(profileId, profileVersion) == null;
}

export function effectiveLifecycleProfile(setting: LifecycleProfileSetting | null): LifecycleProfile {
  const profile =
    setting != null ? lifecycleProfileById(setting.profileId, setting.profileVersion) : DEFAULT_ENGINEERING_LIFECYCLE_PROFILE;
  const resolved = profile ?? DEFAULT_ENGINEERING_LIFECYCLE_PROFILE;
  if (!setting?.omittedStages.length) return resolved;
  const omitted = new Set(setting.omittedStages);
  return {
    ...resolved,
    omittedStages: setting.omittedStages,
    stages: resolved.stages.filter((stage) => !omitted.has(stage)),
  };
}

export function enabledCriterionIds(setting: LifecycleProfileSetting | null, profile: LifecycleProfile): string[] | null {
  if (setting?.enabledCriterionIds == null) return null;
  return setting.enabledCriterionIds.filter((id) => profile.criteria.some((row) => row.criterionId === id));
}

export function catalogCriteria(profile: LifecycleProfile = DEFAULT_ENGINEERING_LIFECYCLE_PROFILE): LifecycleCriterionDefinition[] {
  return [...profile.criteria];
}
