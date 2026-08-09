"use client";

import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from "@rtb/ui";

const MODULE_REPORT_ROUTES = [
  {
    name: "Project Intelligence reports",
    href: "/engineering/apps/project-intelligence/reports",
  },
  {
    name: "Inspection Intelligence",
    href: "/engineering/apps/inspection-intelligence/release",
  },
  {
    name: "Asset Intelligence",
    href: "/engineering/apps/asset-intelligence",
  },
  {
    name: "Project Controls",
    href: "/engineering/apps/project-controls",
  },
  {
    name: "Digital Twin artifacts",
    href: "/engineering/apps/digital-twin",
  },
  {
    name: "Engineering model federation",
    href: "/engineering/apps/model-interoperability",
  },
];

const REPORT_TEMPLATES = [
  { name: "Decision Register Report", register: "decisions" },
  { name: "Risk Register Report", register: "risks" },
  { name: "Action Register Report", register: "actions" },
  { name: "Issue Register Report", register: "issues" },
  { name: "Technical Query Report", register: "technical-queries" },
  { name: "Lessons Learned Report", register: "lessons" },
];

export default function EngineeringReportsPage() {
  return (
    <>
      <Header
        title="Engineering Reports"
        description="Routes to module reporting surfaces — no universal reporting engine"
      />
      <main
        className="page-main flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-8"
        data-testid="engineering-os-reports"
      >
        <section className="mb-8" aria-label="Module reporting">
          <p className="mb-3 text-sm text-muted-foreground">
            Module report entry points (public contracts / module UIs)
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            {MODULE_REPORT_ROUTES.map((route) => (
              <Link key={route.href} href={route.href}>
                <Card className="transition hover:border-slate-400">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-base">{route.name}</CardTitle>
                    <Badge variant="secondary">module</Badge>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Engineering register report shells
          </p>
          <Button size="sm" disabled>
            Generate Export (coming soon)
          </Button>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {REPORT_TEMPLATES.map((template) => (
            <Card key={template.name}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">{template.name}</CardTitle>
                <Badge variant="secondary">shell</Badge>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Aggregates {template.register} register data for future export.
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </>
  );
}
