/**
 * Inspection Intelligence operational workflow definitions — consume Engineering Workflow SDK.
 */
import type { EngineeringWorkflowDefinition } from "@rtb/engineering-os";

export const INSPECTION_OPERATIONAL_WORKFLOW_SLUG = "inspection.operational.session" as const;

export const INSPECTION_OPERATIONAL_WORKFLOW_DEFINITION: EngineeringWorkflowDefinition = {
  slug: INSPECTION_OPERATIONAL_WORKFLOW_SLUG,
  displayName: "Inspection Operational Session",
  moduleKey: "inspection_intelligence",
  version: 1,
  initialState: "draft",
  states: [
    "draft",
    "planned",
    "scheduled",
    "assigned",
    "started",
    "paused",
    "completed",
    "submitted",
    "reviewed",
    "approved",
    "verified",
    "closed",
    "archived",
    "cancelled",
  ],
  transitions: [
    { from: "draft", to: "planned", action: "plan", guards: [{ kind: "entitlement", key: "inspection.write" }] },
    { from: "planned", to: "scheduled", action: "schedule", guards: [{ kind: "entitlement", key: "inspection.write" }] },
    { from: "planned", to: "assigned", action: "assign", guards: [{ kind: "entitlement", key: "inspection.write" }] },
    { from: "scheduled", to: "assigned", action: "assign", guards: [{ kind: "entitlement", key: "inspection.write" }] },
    { from: "assigned", to: "started", action: "start", guards: [{ kind: "entitlement", key: "inspection.write" }] },
    { from: "started", to: "paused", action: "pause", guards: [{ kind: "entitlement", key: "inspection.write" }] },
    { from: "paused", to: "started", action: "resume", guards: [{ kind: "entitlement", key: "inspection.write" }] },
    { from: "started", to: "completed", action: "complete_execution", guards: [{ kind: "entitlement", key: "inspection.write" }] },
    { from: "completed", to: "submitted", action: "submit", guards: [{ kind: "entitlement", key: "inspection.write" }] },
    { from: "submitted", to: "reviewed", action: "review", guards: [{ kind: "entitlement", key: "inspection.review" }] },
    { from: "reviewed", to: "approved", action: "approve", guards: [{ kind: "entitlement", key: "inspection.approve" }] },
    { from: "reviewed", to: "submitted", action: "request_changes", guards: [{ kind: "entitlement", key: "inspection.review" }] },
    { from: "approved", to: "verified", action: "verify", guards: [{ kind: "entitlement", key: "inspection.approve" }] },
    { from: "approved", to: "closed", action: "close", guards: [{ kind: "entitlement", key: "inspection.admin" }, { kind: "condition", key: "corrective_actions_verified" }] },
    { from: "verified", to: "closed", action: "close", guards: [{ kind: "entitlement", key: "inspection.admin" }, { kind: "condition", key: "corrective_actions_verified" }] },
    { from: "closed", to: "archived", action: "archive", guards: [{ kind: "entitlement", key: "inspection.admin" }] },
    { from: "draft", to: "cancelled", action: "cancel", guards: [{ kind: "entitlement", key: "inspection.write" }] },
    { from: "planned", to: "cancelled", action: "cancel", guards: [{ kind: "entitlement", key: "inspection.write" }] },
    { from: "scheduled", to: "cancelled", action: "cancel", guards: [{ kind: "entitlement", key: "inspection.write" }] },
    { from: "assigned", to: "cancelled", action: "cancel", guards: [{ kind: "entitlement", key: "inspection.write" }] },
    { from: "started", to: "cancelled", action: "cancel", guards: [{ kind: "entitlement", key: "inspection.admin" }] },
    { from: "paused", to: "cancelled", action: "cancel", guards: [{ kind: "entitlement", key: "inspection.admin" }] },
    { from: "completed", to: "cancelled", action: "cancel", guards: [{ kind: "entitlement", key: "inspection.admin" }] },
    { from: "submitted", to: "cancelled", action: "cancel", guards: [{ kind: "entitlement", key: "inspection.admin" }] },
    { from: "cancelled", to: "archived", action: "archive", guards: [{ kind: "entitlement", key: "inspection.admin" }] },
  ],
};

export const INSPECTION_OPERATIONAL_WORKFLOW_STEPS = [
  "assignment",
  "scheduling",
  "session_execution",
  "observation_capture",
  "measurement_recording",
  "evidence_association",
  "defect_management",
  "recommendation_lifecycle",
  "engineering_assessment",
  "review",
  "approval",
  "verification",
  "close_out",
] as const;

export type InspectionOperationalWorkflowStep =
  (typeof INSPECTION_OPERATIONAL_WORKFLOW_STEPS)[number];
