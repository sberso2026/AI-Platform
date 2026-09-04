"use client";

import Link from "next/link";
import { Header } from "@/components/layout/header";
import { CommandPageTitle, CommandPanel, StatusChip } from "@rtb/ui";
import {
  Activity,
  BarChart3,
  Box,
  Brain,
  ClipboardCheck,
  Network,
} from "lucide-react";

const MODULES = [
  {
    key: "project_intelligence",
    name: "Project Intelligence",
    purpose: "Project reasoning and decision intelligence",
    relationship: "Reasons over Engineering OS, Project Controls, and published evidence",
    href: "/engineering/apps/project-intelligence",
    icon: Brain,
  },
  {
    key: "inspection_intelligence",
    name: "Inspection Intelligence",
    purpose: "Inspection planning, field capture, and review",
    relationship: "Feeds findings and condition into Engineering Core",
    href: "/engineering/apps/inspection-intelligence",
    icon: ClipboardCheck,
  },
  {
    key: "asset_intelligence",
    name: "Asset Intelligence",
    purpose: "Asset condition, criticality, and reliability signals",
    relationship: "Connects asset records to inspection and engineering evidence",
    href: "/engineering/apps/asset-intelligence",
    icon: Activity,
  },
  {
    key: "project_controls",
    name: "Project Controls",
    purpose: "Governed cost, schedule, and progress intelligence",
    relationship: "System of record for schedule and cost publications",
    href: "/engineering/apps/project-controls",
    icon: BarChart3,
  },
  {
    key: "digital_twin",
    name: "Digital Twin",
    purpose: "Twin identity, state, simulation, and digital thread",
    relationship: "Federates model and state evidence into Engineering OS",
    href: "/engineering/apps/digital-twin",
    icon: Box,
  },
  {
    key: "engineering_model_interoperability",
    name: "Engineering Models",
    purpose: "IFC / SPACE GASS / ETABS federation with governed mapping",
    relationship: "Interoperability layer — not a second model register",
    href: "/engineering/apps/model-interoperability",
    icon: Network,
  },
];

export default function EngineeringModuleLauncherPage() {
  return (
    <>
      <Header
        title="Engineering Systems"
        description="Certified modules hosted by Engineering OS"
      />
      <main
        className="page-main flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-8"
        data-testid="engineering-module-launcher"
      >
        <CommandPageTitle
          eyebrow="Engineering OS"
          title="Engineering systems matrix"
          description="Each system remains hosted by Engineering OS. No module bypasses the operating system."
        />
        <div className="grid gap-4 xl:grid-cols-2">
          {MODULES.map((mod) => {
            const Icon = mod.icon;
            return (
              <CommandPanel
                key={mod.key}
                title={mod.name}
                accent="cyan"
                meta={
                  <span className="inline-flex items-center gap-2">
                    <StatusChip status="complete">Available</StatusChip>
                  </span>
                }
                action={
                  <Link href={mod.href} className="eos-shell-link" data-testid={`engineering-module-${mod.key}`}>
                    Open system
                  </Link>
                }
              >
                <div className="flex items-start gap-4">
                  <Icon className="mt-1 h-6 w-6 text-[color:var(--eos-accent)]" aria-hidden />
                  <div className="min-w-0 space-y-2">
                    <p className="text-[1rem]">{mod.purpose}</p>
                    <p className="text-[0.9375rem] text-[color:var(--eos-text-secondary)]">{mod.relationship}</p>
                  </div>
                </div>
              </CommandPanel>
            );
          })}
        </div>
      </main>
    </>
  );
}
