/** Intelligence-2: dependency signals may fill Waiting categories; Contextual enrichment only. */
export const MY_WORK_DEPENDENCY_UI_CONTEXTUAL_ONLY = true as const;
/** Context-2: governed engineering-consequence priority (not layout redesign). */
export const EOS_RISK_PRIORITIZED_MY_WORK_IMPLEMENTED = true as const;
export const MY_WORK_PRIORITY_BANDS = ["CRITICAL", "HIGH", "MEDIUM", "LOW"] as const;

/** Approved My Work category contract (populate only when deterministic data exists). */
export const MY_WORK_CATEGORIES = [
  { id: "needs-action", label: "Needs Action" },
  { id: "changed", label: "Changed" },
  { id: "reviews", label: "Reviews" },
  { id: "decisions", label: "Decisions" },
  { id: "waiting-for-others", label: "Waiting on Others" },
  { id: "at-risk", label: "At Risk" },
  { id: "recently-completed", label: "Completed" },
  /** Retained for Home deep-links / prior UX-1A compatibility. */
  { id: "waiting-for-me", label: "Waiting for Me" },
] as const;

export type MyWorkCategoryId = (typeof MY_WORK_CATEGORIES)[number]["id"];

export function isMyWorkCategoryId(value: string | null | undefined): value is MyWorkCategoryId {
  return MY_WORK_CATEGORIES.some((c) => c.id === value);
}
