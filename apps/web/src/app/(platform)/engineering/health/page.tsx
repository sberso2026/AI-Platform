"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from "@rtb/ui";

type HealthReport = {
  overall: string;
  checked_at: string;
  checks: { key: string; label: string; status: string; message?: string }[];
  demo_data: { present: boolean; counts: Record<string, number> };
};

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  ok: "default",
  degraded: "outline",
  error: "destructive",
  unknown: "secondary",
};

export default function EngineeringHealthPage() {
  const [report, setReport] = useState<HealthReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [demoLoading, setDemoLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const reload = () => {
    setLoading(true);
    fetch("/api/engineering/health")
      .then((r) => r.json())
      .then((j) => {
        setReport(j.data ?? null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    reload();
  }, []);

  async function seedDemo() {
    setDemoLoading(true);
    setMessage(null);
    const res = await fetch("/api/engineering/demo/seed", { method: "POST" });
    const json = await res.json();
    setMessage(json.data?.status === "seeded" ? "Demo data seeded." : json.data?.message ?? json.error);
    setDemoLoading(false);
    reload();
  }

  async function resetDemo() {
    setDemoLoading(true);
    setMessage(null);
    const res = await fetch("/api/engineering/demo/reset", { method: "POST" });
    const json = await res.json();
    setMessage(json.error ?? "Demo data reset complete.");
    setDemoLoading(false);
    reload();
  }

  return (
      <>
        <Header
        title="Engineering OS Health"
        description="Installation, platform integration, and demo data status"
      />
              <main className="page-main flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-8" data-testid="page-main">
        <div className="mb-4 flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={reload} disabled={loading}>
            Refresh
          </Button>
          <Button size="sm" onClick={seedDemo} disabled={demoLoading}>
            Seed Demo Data
          </Button>
          <Button size="sm" variant="destructive" onClick={resetDemo} disabled={demoLoading}>
            Reset Demo Data
          </Button>
          <Link href="/engineering/test-runner" className="ml-auto">
            <Button size="sm" variant="secondary">
              Open Test Runner
            </Button>
          </Link>
        </div>

        {message && <p className="mb-4 text-sm text-muted-foreground">{message}</p>}

        {loading && <p className="text-sm text-muted-foreground">Running health checks...</p>}

        {report && (
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Overall Status</CardTitle>
                <Badge variant={STATUS_VARIANT[report.overall] ?? "secondary"}>
                  {report.overall}
                </Badge>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Checked {new Date(report.checked_at).toLocaleString()}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Demo Data</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <Badge variant={report.demo_data.present ? "default" : "secondary"}>
                  {report.demo_data.present ? "Present" : "Absent"}
                </Badge>
                {report.demo_data.present && (
                  <ul className="mt-2 space-y-1 text-muted-foreground">
                    {Object.entries(report.demo_data.counts).map(([k, v]) =>
                      v > 0 ? (
                        <li key={k}>
                          {k}: {v}
                        </li>
                      ) : null
                    )}
                  </ul>
                )}
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Checks</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {report.checks.map((check) => (
                  <div
                    key={check.key}
                    className="flex flex-wrap items-center justify-between gap-2 rounded border p-3 text-sm"
                  >
                    <div>
                      <p className="font-medium">{check.label}</p>
                      {check.message && (
                        <p className="text-xs text-muted-foreground">{check.message}</p>
                      )}
                    </div>
                    <Badge variant={STATUS_VARIANT[check.status] ?? "secondary"}>
                      {check.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
      </>
  );
}
