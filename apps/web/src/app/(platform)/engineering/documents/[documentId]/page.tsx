"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Card, CardContent, Badge, Button } from "@rtb/ui";
import { parseApiJsonResponse } from "@/lib/api/parse-json-response";
import { AskThisObjectLink } from "@/components/engineering/ask-this-object-link";
import { LabeledSelectField, LabeledTextField } from "@/components/engineering/labeled-field";
import { useEngineeringWriteAccess } from "@/hooks/use-engineering-write-access";
import {
  DOCUMENT_UPLOAD_ACCEPT,
  completeCanonicalDocumentUpload,
  createCanonicalDocumentUploadSession,
  putFileToSignedUpload,
} from "@/lib/engineering/document-upload";
import { ENGINEERING_DOCUMENT_TYPES, inferStandardDocumentNumber, preferCompleteStandardNumber } from "@rtb/engineering-os/browser";

type DocumentIngestionPresentation = {
  state?: string;
  label?: string;
  aiSearchable?: boolean;
  pagesIndexed?: number;
  chunkCount?: number;
  warnings?: string[];
  processingStatus?: string | null;
};

type DocumentPresentation = {
  projectLabel?: string | null;
  assetLabel?: string | null;
  knowledgeLinkStatus?: "linked" | "not_linked";
  knowledgeNodeTitle?: string | null;
  ingestion?: DocumentIngestionPresentation | null;
};

type DocRow = Record<string, unknown> & {
  presentation?: DocumentPresentation;
  file_path?: string | null;
  file_name?: string | null;
  mime_type?: string | null;
  file_size?: number | null;
  status?: string;
  document_number?: string;
  title?: string;
  revision?: string;
  document_type?: string;
  metadata?: Record<string, unknown> | null;
};

export default function EngineeringDocumentDetailPage() {
  const params = useParams();
  const documentId = params.documentId as string;
  const { roleSlug } = useEngineeringWriteAccess();
  const writeBlocked = roleSlug === "viewer";
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [doc, setDoc] = useState<DocRow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attachError, setAttachError] = useState<string | null>(null);
  const [attaching, setAttaching] = useState(false);
  const [reindexing, setReindexing] = useState(false);
  const [showIngestionDetails, setShowIngestionDetails] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [reviewNumber, setReviewNumber] = useState("");
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewRevision, setReviewRevision] = useState("");
  const [reviewType, setReviewType] = useState("");
  const operator = roleSlug === "owner" || roleSlug === "admin" || roleSlug === "operator";

  async function load() {
    const parsed = await parseApiJsonResponse<DocRow>(
      await fetch(`/api/engineering/documents/${documentId}`),
    );
    if (!parsed.ok) setError(parsed.errorMessage ?? "Failed to load document");
    else {
      setDoc(parsed.data);
      setError(null);
      const meta = parsed.data.metadata ?? {};
      const proposed = String(meta.proposed_document_number ?? "");
      const currentNumber = String(parsed.data.document_number ?? "");
      const inferred = preferCompleteStandardNumber(
        proposed,
        inferStandardDocumentNumber(
          `${proposed}\n${parsed.data.title ?? ""}\n${parsed.data.file_name ?? ""}`,
        ),
      );
      setReviewNumber(inferred || proposed || currentNumber);
      setReviewTitle(String(meta.proposed_title ?? parsed.data.title ?? ""));
      setReviewRevision(String(meta.proposed_revision ?? parsed.data.revision ?? ""));
      setReviewType(String(meta.proposed_document_type ?? parsed.data.document_type ?? ""));
    }
  }

  useEffect(() => {
    void load();
  }, [documentId]);

  const fileState = doc?.file_path ? "uploaded" : "none";
  const presentation = doc?.presentation;
  const ingestion = presentation?.ingestion;
  const ingesting = ingestion?.state === "queued" || ingestion?.state === "processing";

  useEffect(() => {
    if (!ingesting) return;
    const timer = window.setInterval(() => {
      void load();
    }, 2500);
    return () => window.clearInterval(timer);
  }, [documentId, ingesting]);

  async function onAttach(file: File) {
    setAttaching(true);
    setAttachError(null);
    try {
      const session = await createCanonicalDocumentUploadSession({
        file,
        documentId,
        revision: String(doc?.revision ?? "A"),
      });
      await putFileToSignedUpload(session, file);
      const parsed = await completeCanonicalDocumentUpload({
        documentId,
        objectPath: session.objectPath,
        fileName: file.name,
        mimeType: session.mimeType,
        fileSize: file.size,
        revision: session.revision,
        attachOnly: true,
      });
      if (!parsed.ok) {
        throw new Error(parsed.errorMessage ?? "Failed to attach file");
      }
      setDoc((prev) => ({ ...(prev ?? {}), ...parsed.data }));
      await load();
    } catch (err) {
      setAttachError(err instanceof Error ? err.message : "Failed to attach file");
    } finally {
      setAttaching(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <>
      <Header
        title={
          doc
            ? `${doc.document_number as string} — ${doc.title as string}`
            : "Document"
        }
        description="Engineering document register"
      />
      <main className="page-main flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-8" data-testid="page-main">
        {error && <p className="mb-4 text-sm text-destructive">{error}</p>}
        {doc && (
          <Card>
            <CardContent className="space-y-3 p-6 text-sm">
              <div className="flex flex-wrap gap-2">
                <Badge data-testid="document-control-status">
                  Control: {doc.status as string}
                </Badge>
                <Badge variant="secondary">Rev {doc.revision as string}</Badge>
                <Badge
                  variant={fileState === "uploaded" ? "default" : "outline"}
                  data-testid="document-file-state"
                >
                  Source file: {fileState === "uploaded" ? "attached" : "not attached"}
                </Badge>
                <Badge
                  variant={ingestion?.aiSearchable ? "default" : "outline"}
                  data-testid="document-ingestion-state"
                >
                  Indexing: {ingestion?.label ?? (fileState === "uploaded" ? "Register only — source text not searchable" : "Register only — source text not searchable")}
                </Badge>
                <Badge
                  variant={ingestion?.aiSearchable ? "default" : "outline"}
                  data-testid="document-ai-searchable"
                >
                  AI searchable: {ingestion?.aiSearchable ? "Yes" : "No"}
                </Badge>
                <AskThisObjectLink
                  label="Ask this document"
                  projectId={(doc.engineering_project_id as string | null) ?? null}
                  objectType="document"
                  objectId={documentId}
                  q="What does this document require?"
                  testId="ask-this-document"
                />
                <AskThisObjectLink
                  label="Summarise document"
                  projectId={(doc.engineering_project_id as string | null) ?? null}
                  objectType="document"
                  objectId={documentId}
                  q="Summarise this document"
                  testId="summarise-this-document"
                />
              </div>
              <Row label="Type" value={doc.document_type as string} />
              <Row label="Source file" value={(doc.file_name as string) ?? undefined} testId="document-source-file" />
              <Row
                label="Pages indexed"
                value={ingestion?.aiSearchable ? String(ingestion.pagesIndexed ?? 0) : "0"}
                testId="document-pages-indexed"
              />
              <Row label="MIME" value={(doc.mime_type as string) ?? undefined} />
              <Row
                label="Size"
                value={
                  typeof doc.file_size === "number"
                    ? `${doc.file_size} bytes`
                    : undefined
                }
              />
              <Row
                label="Project"
                value={presentation?.projectLabel ?? undefined}
                testId="document-project-label"
              />
              <Row
                label="Asset"
                value={presentation?.assetLabel ?? undefined}
                testId="document-asset-label"
              />
              <Row
                label="Knowledge"
                value={
                  presentation?.knowledgeLinkStatus === "linked"
                    ? presentation.knowledgeNodeTitle
                      ? `Linked — ${presentation.knowledgeNodeTitle}`
                      : "Linked"
                    : "Not linked"
                }
              />
              <Row
                label="Metadata review"
                value={String(doc.metadata?.metadata_review_state ?? "review_required")}
                testId="document-metadata-review-state"
              />
              <Row
                label="Number source"
                value={String(doc.metadata?.document_number_source ?? (String(doc.document_number ?? "").startsWith("UPL-") ? "filename_fallback" : "unknown"))}
                testId="document-number-provenance"
              />
              <Row
                label="Revision source"
                value={String(doc.metadata?.revision_source ?? "unknown")}
                testId="document-revision-provenance"
              />
              {String(doc.metadata?.proposed_document_number ?? "") &&
                String(doc.metadata?.proposed_document_number) !== String(doc.document_number) && (
                  <Row
                    label="Proposed number"
                    value={String(doc.metadata?.proposed_document_number)}
                    testId="document-proposed-number"
                  />
                )}

              {operator && String(doc.metadata?.metadata_review_state ?? "review_required") !== "confirmed" && (
                <div className="mt-4 space-y-3 rounded-md border p-4" data-testid="document-metadata-review">
                  <p className="text-sm font-medium">Review document identity</p>
                  <p className="text-xs text-muted-foreground">
                    Filename fallback and extracted values stay proposed until a reviewer confirms them. Confirmation makes the number canonical.
                  </p>
                  <div className="grid gap-3 md:grid-cols-2">
                    <LabeledTextField
                      label="Document number"
                      value={reviewNumber}
                      onChange={setReviewNumber}
                      testId="document-review-number"
                    />
                    <LabeledTextField
                      label="Revision"
                      value={reviewRevision}
                      onChange={setReviewRevision}
                      testId="document-review-revision"
                    />
                    <LabeledTextField
                      label="Title"
                      value={reviewTitle}
                      onChange={setReviewTitle}
                      testId="document-review-title"
                    />
                    <LabeledSelectField
                      label="Type"
                      value={reviewType}
                      onChange={setReviewType}
                      options={ENGINEERING_DOCUMENT_TYPES.map((row) => ({
                        value: row.value,
                        label: row.label,
                      }))}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={reviewing}
                      data-testid="document-metadata-propose"
                      onClick={async () => {
                        setReviewing(true);
                        setAttachError(null);
                        try {
                          const parsed = await parseApiJsonResponse(
                            await fetch(`/api/engineering/documents/${documentId}`, {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                action: "propose",
                                documentNumber: reviewNumber,
                                title: reviewTitle,
                                revision: reviewRevision,
                                documentType: reviewType,
                                numberSource: "manual",
                              }),
                            }),
                          );
                          if (!parsed.ok) throw new Error(parsed.errorMessage ?? "Could not save proposal");
                          await load();
                        } catch (err) {
                          setAttachError(err instanceof Error ? err.message : "Could not save proposal");
                        } finally {
                          setReviewing(false);
                        }
                      }}
                    >
                      Save proposal
                    </Button>
                    <Button
                      type="button"
                      disabled={reviewing || writeBlocked}
                      data-testid="document-metadata-confirm"
                      onClick={async () => {
                        setReviewing(true);
                        setAttachError(null);
                        try {
                          const parsed = await parseApiJsonResponse(
                            await fetch(`/api/engineering/documents/${documentId}`, {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                action: "confirm",
                                documentNumber: reviewNumber,
                                title: reviewTitle,
                                revision: reviewRevision,
                                documentType: reviewType,
                                numberSource: "manual",
                              }),
                            }),
                          );
                          if (!parsed.ok) throw new Error(parsed.errorMessage ?? "Could not confirm metadata");
                          await load();
                        } catch (err) {
                          setAttachError(err instanceof Error ? err.message : "Could not confirm metadata");
                        } finally {
                          setReviewing(false);
                        }
                      }}
                    >
                      {reviewing ? "Saving..." : "Confirm canonical identity"}
                    </Button>
                  </div>
                </div>
              )}

              {fileState === "uploaded" && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    data-testid="document-open-file"
                    onClick={async () => {
                      const parsed = await parseApiJsonResponse<{ url?: string }>(
                        await fetch(`/api/engineering/documents/${documentId}/file`),
                      );
                      if (parsed.data?.url) window.open(parsed.data.url, "_blank", "noopener,noreferrer");
                      else setAttachError(parsed.errorMessage ?? "Unable to open file");
                    }}
                  >
                    Open file
                  </Button>
                  {operator && (
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={reindexing}
                      data-testid="document-reindex"
                      onClick={async () => {
                        setReindexing(true);
                        setAttachError(null);
                        try {
                          const parsed = await parseApiJsonResponse(await fetch(`/api/engineering/documents/${documentId}/ingest`, { method: "POST" }));
                          if (!parsed.ok) throw new Error(parsed.errorMessage ?? "Could not re-index");
                          await load();
                        } catch (err) {
                          setAttachError(err instanceof Error ? err.message : "Could not re-index");
                        } finally {
                          setReindexing(false);
                        }
                      }}
                    >
                      {reindexing ? "Re-indexing..." : "Re-index"}
                    </Button>
                  )}
                </div>
              )}
              {(ingestion?.warnings?.length ?? 0) > 0 && (
                <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900" data-testid="document-extraction-warnings">
                  {(ingestion?.warnings ?? []).map((warning) => (
                    <p key={warning}>{warning}</p>
                  ))}
                </div>
              )}
              <button
                type="button"
                className="text-xs text-muted-foreground underline"
                data-testid="document-ingestion-details-toggle"
                onClick={() => setShowIngestionDetails((value) => !value)}
              >
                {showIngestionDetails ? "Hide details" : "Show details"}
              </button>
              {showIngestionDetails && (
                <p className="text-xs text-muted-foreground" data-testid="document-ingestion-details">
                  Internal status: {ingestion?.processingStatus ?? "none"}; chunks: {ingestion?.chunkCount ?? 0}
                </p>
              )}

              {fileState === "none" && !writeBlocked && (
                <div className="mt-4 space-y-2 rounded-md border border-dashed p-4">
                  <p className="text-sm font-medium">Attach source file</p>
                  <p className="text-xs text-muted-foreground">
                    This document identity exists as metadata only. Attach a PDF, TXT, or DOCX
                    without creating a duplicate register entry.
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={DOCUMENT_UPLOAD_ACCEPT}
                    data-testid="document-attach-file-input"
                    className="block w-full text-sm"
                    disabled={attaching}
                    onChange={(e) => {
                      const next = e.target.files?.[0];
                      if (next) void onAttach(next);
                    }}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={attaching}
                    data-testid="document-attach-file-button"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {attaching ? "Attaching..." : "Attach file"}
                  </Button>
                  {attachError && (
                    <p className="text-sm text-destructive" data-testid="document-attach-error">
                      {attachError}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </>
  );
}

function Row({
  label,
  value,
  testId,
}: {
  label: string;
  value?: string;
  testId?: string;
}) {
  return (
    <div className="flex gap-2" data-testid={testId}>
      <span className="w-28 shrink-0 text-muted-foreground">{label}</span>
      <span>{value || "—"}</span>
    </div>
  );
}
