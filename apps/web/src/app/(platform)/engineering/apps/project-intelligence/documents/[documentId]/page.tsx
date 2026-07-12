"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type Detail = {
  engineeringDocumentId: string;
  core: {
    document_number: string | null;
    title: string | null;
    revision: string | null;
    document_type: string | null;
    discipline: string | null;
  };
  processing: {
    status: string;
    readiness: string;
    sourceRevision: string | null;
    processingVersion: string;
    warningCount: number;
    updatedAt: string | null;
    stub?: boolean;
    detail?: string;
  };
  findingsCount: number;
  chunkCount: number;
};

type Tab = "overview" | "processing" | "findings";

export default function ProjectIntelligenceDocumentDetailPage() {
  const params = useParams<{ documentId: string }>();
  const documentId = params.documentId;
  const [tab, setTab] = useState<Tab>("overview");
  const [detail, setDetail] = useState<Detail>();
  const [findings, setFindings] = useState<unknown[]>([]);
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  async function load() {
    const response = await fetch(`/api/engineering/project-intelligence/documents/${documentId}`);
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error?.message ?? "Unable to load document");
    setDetail(payload.data);
  }

  useEffect(() => {
    load().catch((reason) => setError(reason.message));
  }, [documentId]);

  useEffect(() => {
    if (tab !== "findings") return;
    fetch(`/api/engineering/project-intelligence/documents/${documentId}/findings`)
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error?.message ?? "Unable to load findings");
        setFindings(payload.data ?? []);
      })
      .catch((reason) => setError(reason.message));
  }, [tab, documentId]);

  async function processDocument() {
    setBusy(true);
    setError(undefined);
    try {
      const response = await fetch(`/api/engineering/project-intelligence/documents/${documentId}/process`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({}),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error?.message ?? "Unable to process document");
      setDetail(payload.data);
      setTab("processing");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      setBusy(false);
    }
  }

  if (error && !detail) {
    return (
      <section>
        <h2 className="text-2xl font-semibold text-slate-900">Document</h2>
        <p className="mt-4 text-red-700" role="alert">{error}</p>
      </section>
    );
  }

  if (!detail) {
    return <p className="text-slate-600" role="status">Loading document…</p>;
  }

  const tabs: Array<{ id: Tab; label: string }> = [
    { id: "overview", label: "Overview" },
    { id: "processing", label: "Processing" },
    { id: "findings", label: "Findings" },
  ];

  return (
    <section data-testid="project-intelligence-document-detail">
      <Link href="/engineering/apps/project-intelligence/documents" className="text-sm text-cyan-700 hover:underline">
        Back to documents
      </Link>
      <h2 className="mt-3 text-2xl font-semibold text-slate-900">
        {detail.core.document_number ?? detail.engineeringDocumentId}
      </h2>
      <p className="mt-1 text-slate-600">{detail.core.title ?? "Untitled document"}</p>

      <div className="mt-6 flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            data-testid={`project-intelligence-document-tab-${item.id}`}
            className={`rounded-md px-3 py-1.5 text-sm ${
              tab === item.id ? "bg-cyan-50 font-medium text-cyan-800" : "text-slate-600 hover:bg-slate-50"
            }`}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
        <button
          type="button"
          className="ml-auto rounded-md bg-cyan-700 px-3 py-1.5 text-sm text-white disabled:opacity-50"
          disabled={busy}
          data-testid="project-intelligence-document-process"
          onClick={processDocument}
        >
          {busy ? "Processing…" : "Process"}
        </button>
      </div>

      {error && <p className="mt-4 text-red-700" role="alert">{error}</p>}

      {tab === "overview" && (
        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          <div><dt className="text-sm text-slate-500">Revision</dt><dd className="font-medium text-slate-900">{detail.core.revision ?? "—"}</dd></div>
          <div><dt className="text-sm text-slate-500">Type</dt><dd className="font-medium text-slate-900">{detail.core.document_type ?? "—"}</dd></div>
          <div><dt className="text-sm text-slate-500">Discipline</dt><dd className="font-medium text-slate-900">{detail.core.discipline ?? "—"}</dd></div>
          <div>
            <dt className="text-sm text-slate-500">Processing status</dt>
            <dd className="font-medium text-slate-900" data-testid={`project-intelligence-document-status-${detail.processing.status}`}>
              {detail.processing.status}
            </dd>
          </div>
        </dl>
      )}

      {tab === "processing" && (
        <div className="mt-6 space-y-3 text-sm text-slate-700">
          <p>Status: <strong>{detail.processing.status}</strong></p>
          <p>Readiness: {detail.processing.readiness}</p>
          <p>Source revision: {detail.processing.sourceRevision ?? "—"}</p>
          <p>Processing version: {detail.processing.processingVersion}</p>
          <p>Chunks: {detail.chunkCount}</p>
          <p>Warnings: {detail.processing.warningCount}</p>
          {detail.processing.detail && <p className="text-amber-800">{detail.processing.detail}</p>}
        </div>
      )}

      {tab === "findings" && (
        <ul className="mt-6 space-y-3">
          {(findings as Array<{ id?: string; title?: string; severity?: string; reviewState?: string }>).map((finding, index) => (
            <li key={finding.id ?? index} className="rounded-lg border border-slate-200 p-4">
              <p className="font-medium text-slate-900">{finding.title ?? "Finding"}</p>
              <p className="mt-1 text-sm text-slate-600">
                {finding.severity ?? "—"} · {finding.reviewState ?? "pending"}
              </p>
            </li>
          ))}
          {!findings.length && <li className="text-slate-500">No findings for this document.</li>}
        </ul>
      )}
    </section>
  );
}
