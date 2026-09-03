"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Card, CardContent, Button } from "@rtb/ui";
import { useEngineeringWriteAccess } from "@/hooks/use-engineering-write-access";
import { LabeledSelectField, LabeledTextField } from "@/components/engineering/labeled-field";
import { ENGINEERING_DOCUMENT_TYPES, proposeDocumentMetadataFromFilename, isTimestampRevisionArtifact, normalizeEngineeringRevision } from "@rtb/engineering-os/browser";
import { useResolvedEngineeringProjectId } from "@/hooks/use-engineering-project-filter";
import { parseApiJsonResponse } from "@/lib/api/parse-json-response";
import {
  DOCUMENT_MAX_UPLOAD_MB,
  DOCUMENT_UPLOAD_ACCEPT,
  completeCanonicalDocumentUpload,
  createCanonicalDocumentUploadSession,
  extractDocumentMetadata,
  putFileToSignedUpload,
  type DocumentUploadSession,
} from "@/lib/engineering/document-upload";

type ProjectOption = { id: string; label: string };

export default function UploadEngineeringDocumentPage() {
  const router = useRouter();
  const { roleSlug } = useEngineeringWriteAccess();
  const writeBlocked = roleSlug === "viewer";
  const activeProjectId = useResolvedEngineeringProjectId();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [projectQuery, setProjectQuery] = useState("");
  const [projectId, setProjectId] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [title, setTitle] = useState("");
  const [revision, setRevision] = useState("");
  const [documentType, setDocumentType] = useState("other");
  const [extractionNote, setExtractionNote] = useState<string | null>(null);
  const [session, setSession] = useState<DocumentUploadSession | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/engineering/projects")
      .then((r) => parseApiJsonResponse<Array<Record<string, unknown>>>(r))
      .then((parsed) => {
        const rows = Array.isArray(parsed.data) ? parsed.data : [];
        setProjects(
          rows.map((p) => ({
            id: String(p.id),
            label: `${p.project_code ?? ""} — ${p.project_name ?? ""}`.trim(),
          })),
        );
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (activeProjectId) setProjectId(activeProjectId);
  }, [activeProjectId]);

  const filteredProjects = useMemo(() => {
    const q = projectQuery.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter((p) => p.label.toLowerCase().includes(q));
  }, [projectQuery, projects]);

  const selectedProject = projects.find((p) => p.id === projectId);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (writeBlocked) return;
    if (!file) {
      setError("Choose a source file first.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const active = session;
      if (!active) {
        throw new Error("Upload the source file first.");
      }
      const nextNumber = documentNumber.trim();
      const nextTitle = title.trim();
      const nextRevisionRaw = revision.trim() || active.revision;
      const nextRevision = isTimestampRevisionArtifact(nextRevisionRaw)
        ? normalizeEngineeringRevision("").revision
        : normalizeEngineeringRevision(nextRevisionRaw).revision;
      const completed = await completeCanonicalDocumentUpload({
        documentId: active.documentId,
        objectPath: active.objectPath,
        fileName: file.name,
        mimeType: active.mimeType,
        fileSize: file.size,
        engineeringProjectId: projectId || undefined,
        documentNumber: nextNumber || undefined,
        title: nextTitle || undefined,
        documentType,
        revision: nextRevision,
      });
      if (!completed.ok || !completed.data?.id) {
        throw new Error(completed.errorMessage ?? "Could not register document");
      }
      router.push(`/engineering/documents/${String(completed.data.id)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
      setLoading(false);
    }
  }

  async function onFileChosen(next: File | null) {
    setFile(next);
    setSession(null);
    setExtractionNote(null);
    setError(null);
    setUploadStatus(null);
    if (!next) return;
    try {
      setUploadStatus("Uploading source file…");
      const created = await createCanonicalDocumentUploadSession({ file: next });
      await putFileToSignedUpload(created, next);
      setSession(created);
      setUploadStatus("Source file stored. Review metadata, then register.");
      const filenameGuess = proposeDocumentMetadataFromFilename(next.name);
      try {
        const extracted = await extractDocumentMetadata(created, next.size);
        const suggestion = extracted.ok ? extracted.data : filenameGuess;
        if (!suggestion) {
          setExtractionNote("Metadata could not be read. Enter number, title, and revision if you know them.");
          return;
        }
        if (!extracted.ok) {
          setExtractionNote("Low-confidence suggestions from the file name. Review or enter number, title, and revision.");
        } else if (suggestion.lowConfidence) {
          setExtractionNote("Low-confidence suggestions. Review or enter number, title, and revision.");
        } else {
          setExtractionNote(`Suggested from ${suggestion.provenance}. Review before registering.`);
        }
        if (suggestion.documentNumber) setDocumentNumber(suggestion.documentNumber);
        if (suggestion.title) setTitle(suggestion.title);
        if (suggestion.revision && !isTimestampRevisionArtifact(suggestion.revision)) {
          setRevision(normalizeEngineeringRevision(suggestion.revision).revision);
        }
        if (suggestion.documentType) setDocumentType(suggestion.documentType);
      } catch {
        if (filenameGuess.documentNumber) setDocumentNumber(filenameGuess.documentNumber);
        if (filenameGuess.title) setTitle(filenameGuess.title);
        if (filenameGuess.revision && !isTimestampRevisionArtifact(filenameGuess.revision)) {
          setRevision(normalizeEngineeringRevision(filenameGuess.revision).revision);
        }
        if (filenameGuess.documentType) setDocumentType(filenameGuess.documentType);
        setExtractionNote("Low-confidence suggestions from the file name. Review or enter number, title, and revision.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not read the source file");
      setFile(null);
      setSession(null);
      setUploadStatus(null);
    }
  }

  return (
    <>
      <Header
        title="Register Document"
        description="Upload the source file first. Metadata is suggested from the file, then reviewed before registration."
      />
      <main className="page-main flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-8" data-testid="page-main">
        <Card className="max-w-2xl">
          <CardContent className="p-6">
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label htmlFor="document-source-file" className="mb-1 block text-xs font-medium text-muted-foreground">
                  Source file
                </label>
                <input
                  id="document-source-file"
                  type="file"
                  required
                  accept={DOCUMENT_UPLOAD_ACCEPT}
                  className="block w-full text-sm"
                  disabled={writeBlocked || loading}
                  data-testid="document-source-file"
                  onChange={(e) => void onFileChosen(e.target.files?.[0] ?? null)}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  PDF, TXT, or DOCX. Maximum {DOCUMENT_MAX_UPLOAD_MB} MB. File name comes from the upload.
                </p>
                {file ? (
                  <p className="mt-1 text-sm" data-testid="document-filename">
                    File: {file.name}
                  </p>
                ) : null}
                {uploadStatus ? (
                  <p className="mt-1 text-xs text-muted-foreground" data-testid="document-upload-status">
                    {uploadStatus}
                  </p>
                ) : null}
                {session ? (
                  <p className="sr-only" data-testid="document-upload-session-ready">
                    ready
                  </p>
                ) : null}
              </div>

              <div>
                <label htmlFor="document-project-search" className="mb-1 block text-xs font-medium text-muted-foreground">
                  Project (optional)
                </label>
                {activeProjectId && selectedProject ? (
                  <p className="mb-2 text-sm" data-testid="document-inherited-project">
                    Using active project: {selectedProject.label}
                  </p>
                ) : null}
                <input
                  id="document-project-search"
                  className="mb-2 flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  placeholder="Search by project code or name"
                  value={projectQuery}
                  onChange={(e) => setProjectQuery(e.target.value)}
                  disabled={writeBlocked || loading}
                />
                <select
                  aria-label="Project"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  disabled={writeBlocked || loading}
                  data-testid="document-project-selector"
                >
                  <option value="">No project</option>
                  {filteredProjects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>

              <LabeledSelectField
                label="Document Type"
                value={documentType}
                onChange={setDocumentType}
                options={ENGINEERING_DOCUMENT_TYPES}
              />
              {extractionNote ? (
                <p className="text-xs text-muted-foreground" data-testid="document-extraction-note">
                  {extractionNote}
                </p>
              ) : null}
              {(documentNumber || title || revision) ? (
                <div className="rounded-md border border-slate-200 px-3 py-2 text-sm" data-testid="document-extracted-metadata">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Extracted metadata</p>
                  <p className="mt-1">{documentNumber || "Number not extracted"}</p>
                  <p>{title || "Title not extracted"}</p>
                  <p>Revision {revision || "A"}</p>
                </div>
              ) : null}
              <details className="text-sm">
                <summary className="cursor-pointer text-xs text-slate-600">Correct extracted metadata</summary>
                <div className="mt-2 space-y-3">
                  <LabeledTextField
                    label="Document Number"
                    value={documentNumber}
                    onChange={setDocumentNumber}
                    testId="document-number"
                  />
                  <LabeledTextField
                    label="Title"
                    value={title}
                    onChange={setTitle}
                    testId="document-title"
                  />
                  <LabeledTextField
                    label="Revision"
                    value={revision}
                    onChange={setRevision}
                    testId="document-revision"
                  />
                </div>
              </details>

              {error && (
                <p className="text-sm text-destructive" role="alert" data-testid="document-upload-error">
                  {error}
                </p>
              )}
              <Button type="submit" disabled={loading || writeBlocked || !file || !session}>
                {loading ? "Saving..." : "Register Document"}
              </Button>
              {writeBlocked ? (
                <p className="text-sm text-muted-foreground">Read-only — document registration is disabled.</p>
              ) : null}
            </form>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
