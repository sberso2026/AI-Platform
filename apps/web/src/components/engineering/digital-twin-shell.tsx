"use client";

import { ModuleOpsShell } from "@/components/engineering/module-ops-shell";

const PRIMARY = [
  { href: "/engineering/apps/digital-twin", label: "Overview", exact: true },
  { href: "/engineering/apps/digital-twin/twins", label: "Twins" },
  { href: "/engineering/apps/digital-twin/state", label: "State" },
  { href: "/engineering/apps/digital-twin/history", label: "History" },
  { href: "/engineering/apps/digital-twin/representation", label: "Representation" },
  { href: "/engineering/apps/digital-twin/telemetry", label: "Telemetry" },
  { href: "/engineering/apps/digital-twin/digital-thread", label: "Digital Thread" },
  { href: "/engineering/apps/digital-twin/evidence", label: "Evidence" },
] as const;

const ADMIN = [
  { href: "/engineering/apps/digital-twin/release", label: "Diagnostics / Release" },
] as const;

export function DigitalTwinShell({ children }: { children: React.ReactNode }) {
  return (
    <ModuleOpsShell
      title="Digital Twin"
      description="Recorded twin identity, state, history, and linked evidence."
      testId="digital-twin-shell"
      primaryLinks={PRIMARY}
      adminLinks={ADMIN}
      adminLabel="Administration"
      moduleVersionAttr="1.0.0"
      moduleStatusAttr="ga"
    >
      {children}
    </ModuleOpsShell>
  );
}
