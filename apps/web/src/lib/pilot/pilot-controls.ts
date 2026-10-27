import { establishedMalwareScannerAvailable } from "@rtb/types";
import { hasAuthSessionCookie, pilotKillSwitchSuspended } from "./pilot-edge";

export { hasAuthSessionCookie, pilotKillSwitchSuspended };

/**
 * Engineering file ingestion stays closed unless an established scanner is configured.
 * An unavailable scanner is fail-closed. This is not a malware-scan pass.
 */
export function pilotFileIngestionEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  return establishedMalwareScannerAvailable(env);
}

export const PILOT_FILE_UPLOAD_REQUIRED = false;

export const PILOT_DATA_NOTICE = [
  "This is a controlled pilot of RTB Engineering OS.",
  "Do not submit confidential employer or client data unless that submission has been explicitly approved.",
  "Do not submit regulated or sensitive engineering information unless you are authorized to do so.",
  "Use public, synthetic, anonymized, personally owned, or explicitly approved information only.",
  "You must have authority to provide any information you submit.",
  "Pilot records are kept for the controlled pilot and removed when the pilot operator deletes the workspace or closes the pilot.",
  "Report a security or support concern to your RTB pilot operator. This notice does not claim a security or professional certification.",
].join(" ");

export const ENGINEERING_AUTHORITY_NOTICE = [
  "EOS provides engineering intelligence and decision support.",
  "AI output is not engineering approval.",
  "Qualified human engineering review remains required where applicable.",
  "EOS output is not professional certification.",
  "Jurisdiction-specific professional obligations remain with appropriately authorized professionals.",
  "Platform general availability does not equal project certification.",
  "D1G solver qualification is separate from this pilot.",
  "D1L project certification is separate from this pilot.",
].join(" ");

export function adminRoleIsEngineeringAuthority(_roleSlug: string): boolean {
  return false;
}

export function classifyPilotFailure(error: unknown): string {
  const message = error instanceof Error ? error.message : "";
  if (/configuration/i.test(message)) return "configuration";
  if (/dynamic server usage|cookies/i.test(message)) return "request_scope";
  if (/unauthorized|permission|policy/i.test(message)) return "authorization";
  return "unhandled";
}

export function currentUserFailureResponse(hasSessionCookie: boolean): {
  status: 401 | 500;
  body: { error: string };
} {
  if (!hasSessionCookie) return { status: 401, body: { error: "Unauthorized" } };
  return { status: 500, body: { error: "Internal Server Error" } };
}

const FEEDBACK_CATEGORIES = ["usability", "defect", "data", "access", "other"] as const;
const FEEDBACK_SEVERITIES = ["low", "medium", "high"] as const;

export type PilotFeedbackCategory = (typeof FEEDBACK_CATEGORIES)[number];
export type PilotFeedbackSeverity = (typeof FEEDBACK_SEVERITIES)[number];

export function buildPilotFeedbackRecord(input: {
  category: string;
  description: string;
  severity: string;
}):
  | {
      ok: true;
      action: "pilot_feedback_submitted";
      resourceType: "pilot_feedback";
      metadata: Record<string, unknown>;
    }
  | { ok: false; message: string } {
  const category = input.category.trim().toLowerCase();
  const severity = input.severity.trim().toLowerCase();
  const description = input.description.trim().slice(0, 2000);
  if (!FEEDBACK_CATEGORIES.includes(category as PilotFeedbackCategory)) {
    return { ok: false, message: "Category is not accepted." };
  }
  if (!FEEDBACK_SEVERITIES.includes(severity as PilotFeedbackSeverity)) {
    return { ok: false, message: "Severity is not accepted." };
  }
  if (description.length < 3) return { ok: false, message: "Description is required." };
  return {
    ok: true,
    action: "pilot_feedback_submitted",
    resourceType: "pilot_feedback",
    metadata: {
      category,
      description,
      severity,
      triageStatus: "new",
      resolution: "open",
      engineeringReview: false,
      engineeringValidation: false,
      engineeringApproval: false,
      certification: false,
      qualifiedReviewer: false,
      authority: "pilot_feedback_not_engineering_authority",
    },
  };
}

export const PRODUCTION_MONITORING_CHANNELS = [
  "Vercel runtime logs for rtb-ai-platform",
  "Vercel deployment status for rtb-ai-platform",
  "Supabase logs for the production project",
  "Application event class eos-pilot",
] as const;

export const PRODUCTION_MONITORING_EVENT_CLASSES = [
  "deployment_build_failure",
  "application_exception",
  "http_api_failure",
  "authentication_failure",
  "authorization_denial",
  "database_connectivity_failure",
  "storage_file_processing_failure",
  "kill_switch",
  "pilot_admin",
] as const;

export function logPilotEvent(event: {
  eventClass: (typeof PRODUCTION_MONITORING_EVENT_CLASSES)[number];
  action: string;
  result: string;
}): void {
  console.info(
    JSON.stringify({
      source: "eos-pilot",
      timestamp: new Date().toISOString(),
      eventClass: event.eventClass,
      action: event.action,
      result: event.result,
    }),
  );
}
