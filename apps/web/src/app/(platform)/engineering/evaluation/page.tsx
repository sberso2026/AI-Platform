"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { Badge, Card, CardContent, CardHeader, CardTitle } from "@rtb/ui";
import { parseApiJsonResponse } from "@/lib/api/parse-json-response";

type ReportSection = {
  id: string;
  title: string;
  status: "BENCHMARK" | "LIVE" | "NOT_ENOUGH_DATA";
  summary: string;
  metrics?: Array<{ label: string; value: string; status: string }>;
};

type EvaluationReport = {
  adminOnly: true;
  disclaimer: string;
  overallBenchmarkPassed: boolean;
  sections: ReportSection[];
  kpis: Array<{ kpiId: string; kind: string; value: number | null; status: string; label: string }>;
};

export default function EngineeringEvaluationPage() {
  const [report, setReport] = useState<EvaluationReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/engineering/evaluation")
      .then((r) => parseApiJsonResponse<EvaluationReport>(r))
      .then((parsed) => {
        if (!parsed.ok) setError(parsed.errorMessage ?? "Failed to load evaluation report");
        else setReport(parsed.data);
      })
      .catch((e: unknown) =>
        setError(e instanceof Error ? e.message : "Failed to load evaluation report"),
      );
  }, []);

  return (
    <>
      <Header
        title="Engineering evaluation"
        description="Admin performance, quality, resilience, and adoption gates (benchmark vs live)"
      />
      <main
        className="page-main flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-8"
        data-testid="engineering-evaluation-page"
      >
        <p className="mb-4 text-sm text-slate-600" data-testid="evaluation-disclaimer">
          {report?.disclaimer ??
            "BENCHMARK results are synthetic fixtures and must not be presented as live client productivity."}
        </p>
        {error ? <p className="mb-4 text-sm text-destructive">{error}</p> : null}
        {report ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={report.overallBenchmarkPassed ? "default" : "destructive"}>
                Benchmark {report.overallBenchmarkPassed ? "PASS" : "FAIL"}
              </Badge>
              <Badge variant="outline">adminOnly</Badge>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              {report.sections.map((section) => (
                <Card key={section.id} data-testid={`evaluation-section-${section.id}`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle className="text-base">{section.title}</CardTitle>
                      <Badge
                        variant={
                          section.status === "LIVE"
                            ? "default"
                            : section.status === "NOT_ENOUGH_DATA"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {section.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-slate-700">
                    <p>{section.summary}</p>
                    {(section.metrics ?? []).slice(0, 6).map((m) => (
                      <p key={`${m.label}-${m.value}`} className="text-xs text-muted-foreground">
                        <span className="font-medium text-slate-800">{m.label}:</span> {m.value}
                      </p>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
            <Card data-testid="evaluation-kpis">
              <CardHeader>
                <CardTitle className="text-base">KPI observations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {report.kpis.map((k) => (
                  <p key={`${k.kpiId}-${k.kind}`}>
                    <span className="font-medium">{k.kpiId}</span> · {k.kind} · {k.status}
                    {k.value === null ? " · NOT_ENOUGH_DATA" : ` · ${k.value}`}
                  </p>
                ))}
              </CardContent>
            </Card>
          </div>
        ) : !error ? (
          <p className="text-sm text-muted-foreground">Loading evaluation report…</p>
        ) : null}
      </main>
    </>
  );
}
