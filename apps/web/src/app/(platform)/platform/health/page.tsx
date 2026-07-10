"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { PageMain } from "@/components/layout/page-main";
import { Badge, Card, CardContent, CardHeader, CardTitle, Button } from "@rtb/ui";

type HealthItem = {
  key: string;
  label: string;
  status: string;
  message?: string;
};

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  ok: "default",
  degraded: "outline",
  error: "destructive",
  unknown: "secondary",
};

const PLATFORM_CHECKS: HealthItem[] = [
  { key: "platform", label: "RTB Platform", status: "ok" },
  { key: "engineering_os", label: "Engineering OS", status: "ok" },
  { key: "auth", label: "Auth", status: "ok" },
  { key: "database", label: "Database", status: "ok" },
  { key: "ai_director", label: "AI Director", status: "unknown" },
  { key: "event_bus", label: "Event Bus", status: "unknown" },
  { key: "knowledge_graph", label: "Knowledge Graph", status: "unknown" },
  { key: "workflow_engine", label: "Workflow Engine", status: "unknown" },
  { key: "storage", label: "Storage", status: "ok" },
];

export default function PlatformHealthPage() {
  const [checkedAt, setCheckedAt] = useState<string | null>(null);
  const [checks, setChecks] = useState<HealthItem[]>(PLATFORM_CHECKS);
  const [loading, setLoading] = useState(true);

  const refresh = () => {
    setLoading(true);
    fetch("/api/engineering/health")
      .then((r) => r.json())
      .then((json) => {
        const report = json.data;
        setCheckedAt(report?.checked_at ?? new Date().toISOString());
        if (report?.checks?.length) {
          setChecks((prev) =>
            prev.map((item) => {
              const match = report.checks.find((c: HealthItem) => c.key === item.key);
              return match ? { ...item, status: match.status, message: match.message } : item;
            })
          );
        } else {
          setCheckedAt(new Date().toISOString());
        }
        setLoading(false);
      })
      .catch(() => {
        setCheckedAt(new Date().toISOString());
        setLoading(false);
      });
  };

  useEffect(() => {
    refresh();
  }, []);

  return (
    <>
      <Header
        title="System Health"
        description="Operational health for RTB Platform and Engineering OS"
        showEngineeringChrome={false}
      />
      <PageMain>
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <Button size="sm" variant="outline" onClick={refresh} disabled={loading}>
            Refresh
          </Button>
          {checkedAt && (
            <p className="text-sm text-muted-foreground">
              Last health check: {new Date(checkedAt).toLocaleString()}
            </p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {checks.map((check) => (
            <Card key={check.key} data-testid={`health-${check.key}`}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base">{check.label}</CardTitle>
                <Badge variant={STATUS_VARIANT[check.status] ?? "secondary"}>
                  {check.status}
                </Badge>
              </CardHeader>
              {check.message && (
                <CardContent>
                  <p className="text-sm text-muted-foreground">{check.message}</p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </PageMain>
    </>
  );
}
