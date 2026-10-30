/** Approved My Work category contract (populate only when deterministic data exists). */
export const MY_WORK_CATEGORIES = [
  { id: "needs-action", label: "Needs Action" },
  { id: "changed", label: "Changed" },
  { id: "reviews", label: "Reviews" },
  { id: "decisions", label: "Decisions" },
  { id: "waiting-for-me", label: "Waiting for Me" },
  { id: "waiting-for-others", label: "Waiting for Others" },
  { id: "at-risk", label: "At Risk" },
  { id: "recently-completed", label: "Recently Completed" },
] as const;
