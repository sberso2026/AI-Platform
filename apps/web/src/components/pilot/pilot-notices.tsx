import { ENGINEERING_AUTHORITY_NOTICE, PILOT_DATA_NOTICE } from "@/lib/pilot/pilot-controls";

export function PilotDataNotice() {
  return (
    <p className="mb-4 text-sm leading-relaxed text-muted-foreground" data-testid="pilot-data-notice">
      {PILOT_DATA_NOTICE}
    </p>
  );
}

export function EngineeringAuthorityNotice() {
  return (
    <p className="mb-4 text-sm leading-relaxed text-muted-foreground" data-testid="engineering-authority-notice">
      {ENGINEERING_AUTHORITY_NOTICE}
    </p>
  );
}
