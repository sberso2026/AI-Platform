"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type DocumentRow = {
  engineeringDocumentId: string;
  documentNumber: string | null;
  title: string | null;
  revision: string | null;
  documentType: string | null;
  discipline: string | null;
  processingStatus: string;
  warningCount: number;
  findingsCount: number;
  readiness: string;
  processedAt: string | null;
};

export default function ProjectIntelligenceDocumentsPage() {
  const [documents, setDocuments] = useState<DocumentRow[]>([]);
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/engineering/project-intelligence/documents")
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error?.message ?? "Unable to load documents");
        setDocuments(payload.data ?? []);
      })
      .catch((reason) => setError(reason.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section>
        <h2 className="text-2xl font-semibold text-slate-900">Documents</h2>
        <p className="mt-4 text-slate-600" role="status">Loading document intelligence…</p>
      </section>
    );
  }

  if (error) {
    return (
      <section>
        <h2 className="text-2xl font-semibold text-slate-900">Documents</h2>
        <p className="mt-4 text-red-700" role="alert">{error}</p>
      </section>
    );
  }

  return (
    <section data-testid="project-intelligence-documents-ready">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-cyan-700">Document intelligence</p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-900">Documents</h2>
          <p className="mt-2 text-slate-600">
            Engineering Core remains the document register. Processing status below is Project Intelligence only.
          </p>
        </div>
        <div className="flex gap-3 text-sm">
          <Link className="text-cyan-700 hover:underline" href="/engineering/apps/project-intelligence/documents/query">
            Query workspace
          </Link>
          <Link className="text-cyan-700 hover:underline" href="/engineering/apps/project-intelligence/documents/review">
            Review queue
          </Link>
          <Link className="text-cyan-700 hover:underline" href="/engineering/apps/project-intelligence/documents/health">
            Processing health
          </Link>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="p-3">Number</th>
              <th className="p-3">Title</th>
              <th className="p-3">Revision</th>
              <th className="p-3">Type</th>
              <th className="p-3">Discipline</th>
              <th className="p-3">Processing</th>
              <th className="p-3">Readiness</th>
              <th className="p-3">Warnings</th>
              <th className="p-3">Findings</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => (
              <tr key={doc.engineeringDocumentId} className="border-t border-slate-200">
                <td className="p-3">
                  <Link
                    className="font-mono text-xs text-cyan-700 hover:underline"
                    href={`/engineering/apps/project-intelligence/documents/${doc.engineeringDocumentId}`}
                    data-testid={`project-intelligence-document-row-${doc.engineeringDocumentId}`}
                    data-processing-status={doc.processingStatus}
                  >
                    {doc.documentNumber ?? doc.engineeringDocumentId.slice(0, 8)}
                  </Link>
                </td>
                <td className="p-3">{doc.title ?? "—"}</td>
                <td className="p-3">{doc.revision ?? "—"}</td>
                <td className="p-3">{doc.documentType ?? "—"}</td>
                <td className="p-3">{doc.discipline ?? "—"}</td>
                <td className="p-3">
                  <span data-testid={`project-intelligence-document-status-${doc.processingStatus}`}>
                    {doc.processingStatus}
                  </span>
                </td>
                <td className="p-3">{doc.readiness}</td>
                <td className="p-3">{doc.warningCount}</td>
                <td className="p-3">{doc.findingsCount}</td>
              </tr>
            ))}
            {!documents.length && (
              <tr>
                <td colSpan={9} className="p-6 text-center text-slate-500">
                  No Engineering Core documents are visible in this workspace yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
