"use client";

import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle, StatusChip } from "@rtb/ui";
import { Boxes, Brain, ClipboardCheck, BarChart3, Box } from "lucide-react";

const MODULES = [
  {
    key: "project_intelligence",
    name: "Project Intelligence",
    description: "Documents, meetings, findings, and project decision support",
    href: "/engineering/apps/project-intelligence",
    status: "available" as const,
    icon: Brain,
  },
  {
    key: "inspection_intelligence",
    name: "Inspection Intelligence",
    description: "Inspection planning and findings management",
    href: "/engineering/apps/inspection-intelligence",
    status: "coming_soon" as const,
    icon: ClipboardCheck,
  },
  {
    key: "project_controls",
    name: "Project Controls",
    description: "Cost, schedule, and progress controls",
    href: "/engineering/apps/project-controls",
    status: "coming_soon" as const,
    icon: BarChart3,
  },
  {
    key: "digital_twin",
    name: "Digital Twin",
    description: "Digital twin context for assets and locations",
    href: "/engineering/apps/digital-twin",
    status: "coming_soon" as const,
    icon: Box,
  },
];

export default function EngineeringModuleLauncherPage() {
  return (
    <>
      <Header
        title="Engineering Modules"
        description="Installable modules hosted by Engineering OS — no module bypasses the OS"
      />
      <main
        className="page-main flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-8"
        data-testid="engineering-module-launcher"
      >
        <div className="mb-6 flex items-center gap-2 text-sm text-slate-600">
          <Boxes className="h-4 w-4" />
          <span>Module registry · shared domain · shared AI framework</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
          {MODULES.map((mod) => {
            const Icon = mod.icon;
            const content = (
              <Card className="h-full transition hover:border-slate-400">
                <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-slate-700" />
                    <CardTitle className="text-base">{mod.name}</CardTitle>
                  </div>
                  <StatusChip status={mod.status === "available" ? "complete" : "pending"}>
                    {mod.status === "available" ? "Available" : "Coming soon"}
                  </StatusChip>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600">{mod.description}</p>
                  <p className="mt-3 font-mono text-xs text-slate-400">{mod.key}</p>
                </CardContent>
              </Card>
            );
            return mod.status === "available" ? (
              <Link key={mod.key} href={mod.href} data-testid={`engineering-module-${mod.key}`}>
                {content}
              </Link>
            ) : (
              <div key={mod.key} data-testid={`engineering-module-${mod.key}`} aria-disabled="true">
                {content}
              </div>
            );
          })}
        </div>
      </main>
    </>
  );
}
