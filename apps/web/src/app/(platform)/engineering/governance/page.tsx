"use client";

import Link from "next/link";
import { Header } from "@/components/layout/header";
import { GovernancePanel } from "@/components/engineering/governance-panel";
import { ENGINEERING_CERTIFIED_V1_MODULES } from "@/lib/engineering/certified-modules";

const MODULE_GOVERNANCE = [
  {
    key: "project_intelligence",
    version: "1.0.0",
    href: "/engineering/apps/project-intelligence/settings",
    limitations: [
      "Advisory intelligence only — humans own project decisions.",
      "Does not replace canonical Engineering OS project identity.",
    ],
  },
  {
    key: "inspection_intelligence",
    version: "1.0.0",
    href: "/engineering/apps/inspection-intelligence/release",
    limitations: [
      "AI Vision remains advisory.",
      "Does not own asset identity or Digital Twin.",
    ],
  },
  {
    key: "asset_intelligence",
    version: "1.0.0",
    href: "/engineering/apps/asset-intelligence/release",
    limitations: [
      "Remaining life, probability of failure, and predictive execution are not certified.",
      "Canonical asset identity remains in Engineering OS.",
    ],
  },
  {
    key: "project_controls",
    version: "1.0.0",
    href: "/engineering/apps/project-controls/release",
    limitations: [
      "Descriptive schedule and cost intelligence only — native CPM and EVM are not available.",
      "Does not post to a financial ledger.",
    ],
  },
  {
    key: "digital_twin",
    version: "1.0.0",
    href: "/engineering/apps/digital-twin/release",
    limitations: [
      "No physical control, predictive twin, SHM runtime, or solver execution.",
      "Shared Spatial Domain remains the spatial authority.",
    ],
  },
  {
    key: "engineering_model_interoperability",
    version: "1.0.0",
    href: "/engineering/apps/model-interoperability/release",
    limitations: [
      "ETABS and SPACE GASS: import and exported-result federation available; live execution is not certified.",
      "SAP2000 / SAFE / CSiBridge remain unavailable.",
    ],
  },
] as const;

export default function EngineeringGovernancePage() {
  return (
    <>
      <Header
        title="Governance & Assurance"
        description="Release identity, authority boundaries, and certification for Engineering OS modules"
      />
      <main
        className="page-main flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-8"
        data-testid="engineering-governance"
      >
        <p className="mb-6 max-w-2xl text-sm text-slate-600">
          Operational screens hide internal certification architecture. This administration
          surface retains historical release identity and known limitations.
        </p>
        <div className="space-y-6">
          {MODULE_GOVERNANCE.map((mod) => {
            const catalog = ENGINEERING_CERTIFIED_V1_MODULES.find((m) => m.key === mod.key);
            return (
              <GovernancePanel
                key={mod.key}
                moduleName={catalog?.name ?? mod.key}
                version={mod.version}
                knownLimitations={mod.limitations}
                technicalHref={mod.href}
                testId={`governance-${mod.key}`}
              />
            );
          })}
        </div>
        <p className="mt-8 text-sm">
          <Link href="/engineering/settings" className="font-medium underline-offset-2 hover:underline">
            Engineering Settings
          </Link>
          {" · "}
          <Link href="/engineering/health" className="font-medium underline-offset-2 hover:underline">
            Health Check
          </Link>
          {" · "}
          <Link href="/engineering/modules" className="font-medium underline-offset-2 hover:underline">
            Module entitlement status
          </Link>
        </p>
      </main>
    </>
  );
}
