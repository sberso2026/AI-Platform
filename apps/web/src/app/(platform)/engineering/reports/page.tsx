"use client";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from "@rtb/ui";

const REPORT_TEMPLATES = [
  { name: "Decision Register Report", register: "decisions" },
  { name: "Risk Register Report", register: "risks" },
  { name: "Action Register Report", register: "actions" },
  { name: "Issue Register Report", register: "issues" },
  { name: "Technical Query Report", register: "technical-queries" },
  { name: "Lessons Learned Report", register: "lessons" },
  { name: "Engineering Review Report", register: null },
  { name: "Design Review Report", register: null },
  { name: "Inspection Summary", register: null },
  { name: "Asset Integrity Report", register: null },
  { name: "Project Engineering Status Report", register: null },
];

export default function EngineeringReportsPage() {
  return (
      <>
        <Header
        title="Engineering Reports"
        description="Report register and template shells — PDF/DOCX export comes later"
      />
              <main className="page-main flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-8" data-testid="page-main">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Intelligence register report shells (Batch 2.05)
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
                  {template.register
                    ? `Aggregates ${template.register} register data for future export.`
                    : "Placeholder template for future Engineering Reports application."}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
      </>
  );
}
