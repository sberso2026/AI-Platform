"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { EmptyState } from "@rtb/ui";
import { PiErrorState, PiLoadingSkeleton } from "@/components/engineering/pi-page-chrome";
import { PI_BASE_PATH, withPiProjectQuery } from "@/components/engineering/pi-project-context";
import { documentReadinessLabel } from "@/components/engineering/pi-ux";

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
  engineeringProjectId?: string | null;
};

export default function ProjectIntelligenceDocumentsPage() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId") ?? "";
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

  const visible = useMemo(
    () =>
      documents.filter(
        (doc) => !projectId || !doc.engineeringProjectId || doc.engineeringProjectId === projectId,
      ),
    [documents, projectId],
  );

  if (loading) {
    return (
      <section>
        <h2 className="text-2xl font-semibold text-slate-900">Documents</h2>
        <div className="mt-4">
          <PiLoadingSkeleton label="Loading document intelligence…" />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section>
        <h2 className="text-2xl font-semibold text-slate-900">Documents</h2>
        <div className="mt-4">
          <PiErrorState title="Documents unavailable" description={error} />
        </div>
      </section>
    );
  }

  const revised = visible.filter((doc) => Boolean(doc.revision) && doc.processedAt);
  const ready = visible.filter((doc) => documentReadinessLabel(doc.processingStatus, doc.readiness) === "AI-ready");
  const partial = visible.filter((doc) => documentReadinessLabel(doc.processingStatus, doc.readiness) === "Partial");
  const failed = visible.filter((doc) => documentReadinessLabel(doc.processingStatus, doc.readiness) === "Failed");

  return (
    <section data-testid="document-intelligence-ready">
      <div data-testid="project-intelligence-documents-ready">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-cyan-700">Engineering drill-down</p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-900">What changed in project documents?</h2>
            <p className="mt-2 max-w-3xl text-slate-600">
              Engineering Core remains the document register. This view shows intelligence over processed
              evidence: revisions, readiness, findings, and conflicts. Ingestion diagnostics live under
              Administration / Diagnostics.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link className="text-cyan-700 hover:underline" href={withPiProjectQuery(`${PI_BASE_PATH}/engineering`, projectId)}>
              Engineering
            </Link>
            <Link className="text-cyan-700 hover:underline" href="/engineering/apps/project-intelligence/documents/query">
              Ask documents
            </Link>
            <Link className="text-cyan-700 hover:underline" href="/engineering/apps/project-intelligence/diagnostics">
              Diagnostics
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4 text-sm">
          <p className="rounded-md border border-slate-200 px-4 py-3">{visible.length} processed or registered</p>
          <p className="rounded-md border border-slate-200 px-4 py-3">{revised.length} with revision evidence</p>
          <p className="rounded-md border border-slate-200 px-4 py-3">
            {ready.length} AI-ready · {partial.length} partial · {failed.length} failed
          </p>
          <p className="rounded-md border border-slate-200 px-4 py-3">
            {visible.reduce((sum, doc) => sum + doc.findingsCount, 0)} findings
          </p>
        </div>

        <div className="mt-6 overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="p-3">Document</th>
                <th className="p-3">Revision</th>
                <th className="p-3">Type</th>
                <th className="p-3">Discipline</th>
                <th className="p-3">Intelligence</th>
                <th className="p-3">Findings</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((doc) => (
                <tr key={doc.engineeringDocumentId} className="border-t border-slate-200">
                  <td className="p-3">
                    <Link
                      className="text-cyan-700 hover:underline"
                      href={`/engineering/apps/project-intelligence/documents/${doc.engineeringDocumentId}`}
                      data-testid={`project-intelligence-document-row-${doc.engineeringDocumentId}`}
                      data-processing-status={doc.processingStatus}
                    >
                      {doc.documentNumber ?? doc.title ?? "Untitled document"}
                    </Link>
                    {doc.title && doc.documentNumber ? (
                      <p className="text-xs text-slate-500">{doc.title}</p>
                    ) : null}
                  </td>
                  <td className="p-3">{doc.revision ?? "—"}</td>
                  <td className="p-3">{doc.documentType ?? "—"}</td>
                  <td className="p-3">{doc.discipline ?? "—"}</td>
                  <td className="p-3">
                    <span data-testid={`project-intelligence-document-status-${doc.processingStatus}`}>
                      {documentReadinessLabel(doc.processingStatus, doc.readiness)}
                    </span>
                  </td>
                  <td className="p-3">{doc.findingsCount}</td>
                </tr>
              ))}
              {!visible.length && (
                <tr>
                  <td colSpan={6} className="p-6">
                    <EmptyState
                      title="No project documents are available in the selected project."
                      description="Connect or import documents in Engineering Core. This page does not replace the document register."
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
