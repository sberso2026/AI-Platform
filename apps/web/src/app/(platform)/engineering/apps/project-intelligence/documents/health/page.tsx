"use client";

import { useEffect, useState } from "react";

type Health = {
  status: string;
  checkedAt: string;
  documentCount: number;
  statusCounts: Record<string, number>;
  checks: Array<{ key: string; status: string; message?: string }>;
};

export default function ProjectIntelligenceDocumentsHealthPage() {
  const [report, setReport] = useState<Health>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    fetch("/api/engineering/project-intelligence/documents/health")
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error?.message ?? "Health check failed");
        setReport(payload.data);
      })
      .catch((reason) => setError(reason.message));
  }, []);

  if (error) return <p className="text-red-700" role="alert">{error}</p>;
  if (!report) return <p className="text-slate-600" role="status">Checking document processing health…</p>;

  return (
    <section data-testid="project-intelligence-documents-health">
      <p className="text-sm font-medium text-cyan-700">Document intelligence</p>
      <h2 className="mt-1 text-2xl font-semibold text-slate-900">Processing health</h2>
      <p className="mt-2 text-slate-600">
        Overall status: <span className="font-medium">{report.status}</span> · {report.documentCount} documents
      </p>
      <ul className="mt-6 space-y-3">
        {report.checks.map((check) => (
          <li key={check.key} className="rounded-lg border border-slate-200 p-4">
            <span className="font-medium text-slate-900">{check.key}</span>
            <span className="ml-3 text-slate-600">{check.status}</span>
            {check.message && <p className="mt-1 text-sm text-slate-600">{check.message}</p>}
          </li>
        ))}
      </ul>
      <div className="mt-6 rounded-lg border border-slate-200 p-4">
        <h3 className="font-medium text-slate-900">Status counts</h3>
        <ul className="mt-3 space-y-1 text-sm text-slate-600">
          {Object.entries(report.statusCounts).map(([status, count]) => (
            <li key={status}>{status}: {count}</li>
          ))}
          {!Object.keys(report.statusCounts).length && <li>No processing statuses recorded.</li>}
        </ul>
      </div>
    </section>
  );
}
