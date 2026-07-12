"use client";

import { useEffect, useState } from "react";

type Report = { status: string; checkedAt: string; checks: Array<{ key: string; status: string; message?: string }> };

export default function ProjectIntelligenceHealthPage() {
  const [report, setReport] = useState<Report>();
  const [error, setError] = useState<string>();
  useEffect(() => {
    fetch("/api/engineering/project-intelligence/health")
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error?.message ?? "Health check failed");
        setReport(payload.data);
      })
      .catch((reason) => setError(reason.message));
  }, []);

  if (error) return <p className="text-red-700">{error}</p>;
  if (!report) return <p className="text-slate-600">Checking application health…</p>;
  return (
    <section>
      <h2 className="text-2xl font-semibold text-slate-900">Health</h2>
      <p className="mt-2 text-slate-600">Overall status: <span className="font-medium">{report.status}</span></p>
      <ul className="mt-6 space-y-3">
        {report.checks.map((check) => <li key={check.key} className="rounded-lg border border-slate-200 p-4"><span className="font-medium">{check.key}</span><span className="ml-3 text-slate-600">{check.status}</span>{check.message && <p className="mt-1 text-sm text-slate-600">{check.message}</p>}</li>)}
      </ul>
    </section>
  );
}
