"use client";

import { ModuleOpsShell } from "@/components/engineering/module-ops-shell";

const PRIMARY = [
  { href: "/engineering/apps/model-interoperability", label: "Overview", exact: true },
  { href: "/engineering/apps/model-interoperability/models", label: "Models" },
  { href: "/engineering/apps/model-interoperability/versions", label: "Versions" },
  { href: "/engineering/apps/model-interoperability/elements", label: "Elements" },
  { href: "/engineering/apps/model-interoperability/mappings", label: "Mappings" },
  { href: "/engineering/apps/model-interoperability/results", label: "Results" },
  { href: "/engineering/apps/model-interoperability/federation", label: "Interoperability" },
  { href: "/engineering/apps/model-interoperability/evidence", label: "Evidence" },
] as const;

const ADMIN = [
  { href: "/engineering/apps/model-interoperability/release", label: "Provider / Execution Certification" },
] as const;

export function ModelInteroperabilityShell({ children }: { children: React.ReactNode }) {
  return (
    <ModuleOpsShell
      title="Engineering Models"
      description="Imported and federated models, versions, mappings, and external results."
      testId="model-interoperability-shell"
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
