/**
 * Phase 14B — OS listens only to public/versioned events for health/activity/context.
 * No direct hidden module coupling.
 */

export const ENGINEERING_OS_PUBLIC_EVENT_SUBSCRIPTIONS = [
  "engineering.module.*",
  "project_intelligence.document.registered",
  "inspection_intelligence.session.completed",
  "asset_intelligence.state.updated",
  "project_controls.progress.updated",
  "digital_twin.state.committed",
  "engineering_model_interoperability.model.federated",
] as const;

export const ENGINEERING_OS_EVENT_INTEGRATION = {
  bus: "platform_event_bus" as const,
  subscriptions: ENGINEERING_OS_PUBLIC_EVENT_SUBSCRIPTIONS,
  directHiddenCouplingAllowed: false as const,
  duplicateUniversalTimelineDetected: false as const,
} as const;
