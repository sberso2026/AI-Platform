/**
 * Canonical Work Plan ownership for Assess Change.
 * Selected project view cannot retarget a Work Plan from another project.
 */
export function assertCanonicalWorkPlanOwnership(
  planProjectId: string,
  selectedProjectId?: string | null,
): void {
  if (selectedProjectId && selectedProjectId !== planProjectId) {
    throw new Error("CROSS_PROJECT_WORKPLAN_DENIED");
  }
}
