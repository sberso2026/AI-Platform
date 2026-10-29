import { NextResponse } from "next/server";
import { logPilotEvent, pilotFileIngestionEnabled } from "@/lib/pilot/pilot-controls";

const CLOSED_MESSAGE =
  "File upload is excluded from this controlled pilot until a hosted malware scan is available. The file was not accepted.";

export async function POST(request: Request) {
  if (!pilotFileIngestionEnabled()) {
    logPilotEvent({ eventClass: "storage_file_processing_failure", action: "upload_session", result: "denied" });
    return NextResponse.json(
      { error: { code: "pilot_file_upload_disabled", message: CLOSED_MESSAGE } },
      { status: 403 },
    );
  }
  const handler = await import("./handler");
  return handler.POST(request);
}
