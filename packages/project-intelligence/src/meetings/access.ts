import {
  evaluateProjectIntelligenceAccess,
  requireProjectIntelligenceAccess,
  requireProjectIntelligenceAdmin,
  type AccessContext,
} from "../security/access-guard";
import { MeetingIntelligenceError } from "./errors";

/**
 * Meetings feature access: same PI dependency chain with feature=meetings enabled.
 * Does not use the legacy meeting_intelligence application stub.
 */
export function evaluateProjectIntelligenceMeetingsAccess(context: AccessContext) {
  return evaluateProjectIntelligenceAccess(
    { ...context, featureEnabled: context.featureEnabled === true },
    "read",
  );
}

export function requireProjectIntelligenceMeetingsAccess(context: AccessContext): void {
  try {
    requireProjectIntelligenceAccess({ ...context, featureEnabled: context.featureEnabled === true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Meeting access denied";
    throw new MeetingIntelligenceError("meeting_access_denied", message, 403, {
      feature: "meetings",
      application: "project_intelligence",
      notApplication: "meeting_intelligence",
    });
  }
}

export function requireProjectIntelligenceMeetingsAdmin(context: AccessContext): void {
  try {
    requireProjectIntelligenceAdmin({ ...context, featureEnabled: context.featureEnabled === true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Meeting admin access denied";
    throw new MeetingIntelligenceError("meeting_access_denied", message, 403, {
      feature: "meetings",
      application: "project_intelligence",
      required: "admin",
    });
  }
}

/** Regression: PI Meetings must never treat meeting_intelligence stub as the entitlement app. */
export function assertMeetingsUsesProjectIntelligenceApp(applicationKey: string): void {
  if (applicationKey === "meeting_intelligence" || applicationKey === "project-intelligence-meetings") {
    throw new MeetingIntelligenceError(
      "meeting_access_denied",
      "Meetings is a Project Intelligence feature; separate meeting applications are not used",
      403,
      { applicationKey },
    );
  }
  if (applicationKey !== "project_intelligence" && applicationKey !== "project-intelligence") {
    throw new MeetingIntelligenceError(
      "meeting_access_denied",
      "Meetings requires the project-intelligence application",
      403,
      { applicationKey },
    );
  }
}
