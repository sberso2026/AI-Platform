import { NextResponse } from "next/server";
import {
  PILOT_FILE_UPLOAD_REQUIRED,
  PRODUCTION_MONITORING_CHANNELS,
  PRODUCTION_MONITORING_EVENT_CLASSES,
  pilotFileIngestionEnabled,
  pilotKillSwitchSuspended,
} from "@/lib/pilot/pilot-controls";

export const dynamic = "force-dynamic";

export async function GET() {
  const suspended = pilotKillSwitchSuspended();
  return NextResponse.json({
    data: {
      controlledPilotEnabled: !suspended,
      killSwitchState: suspended ? "suspended" : "active",
      fileUploadEnabled: pilotFileIngestionEnabled(),
      pilotFileUploadRequired: PILOT_FILE_UPLOAD_REQUIRED,
      engineeringAuthoritySeparated: true,
      monitoringChannels: PRODUCTION_MONITORING_CHANNELS,
      monitoringEventClasses: PRODUCTION_MONITORING_EVENT_CLASSES,
      monitoringRetention: "Vercel and Supabase retain runtime logs on their current project plans. This pilot does not add a separate SIEM.",
    },
  });
}
