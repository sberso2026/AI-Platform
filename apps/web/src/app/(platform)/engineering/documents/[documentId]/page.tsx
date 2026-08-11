"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Card, CardContent, Badge, Button } from "@rtb/ui";
import { parseApiJsonResponse } from "@/lib/api/parse-json-response";
import { AskThisObjectLink } from "@/components/engineering/ask-this-object-link";

type DocumentPresentation = {
  projectLabel?: string | null;
  assetLabel?: string | null;
  knowledgeLinkStatus?: "linked" | "not_linked";
  knowledgeNodeTitle?: string | null;
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
};

const ACCEPT =
  ".pdf,.txt,.docx,application/pdf,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export default function EngineeringDocumentDetailPage() {
  const params = useParams();
  const documentId = params.documentId as string;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [doc, setDoc] = useState<DocRow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attachError, setAttachError] = useState<string | null>(null);
  const [attaching, setAttaching] = useState(false);
  const [piStatus, setPiStatus] = useState<string | null>(null);

  async function load() {
    const parsed = await parseApiJsonResponse<DocRow>(
      await fetch(`/api/engineering/documents/${documentId}`),
    );
    if (!parsed.ok) setError(parsed.errorMessage ?? "Failed to load document");
    else {
      setDoc(parsed.data);
      setError(null);
    }
  }

  useEffect(() => {
    void load();
  }, [documentId]);

  useEffect(() => {
    if (!doc?.file_path) {
      setPiStatus(null);
      return;
    }
    fetch(`/api/engineering/project-intelligence/documents/${documentId}`)
      .then(async (r) => {
        if (!r.ok) {
          setPiStatus("not_visible_or_unregistered");
          return;
        }
        const body = (await r.json()) as {
          data?: { processingStatus?: string; status?: string };
        };
        setPiStatus(
          body.data?.processingStatus ??
            body.data?.status ??
            "visible",
        );
      })
      .catch(() => setPiStatus("unavailable"));
  }, [documentId, doc?.file_path]);

  const fileState = doc?.file_path ? "uploaded" : "none";
  const presentation = doc?.presentation;

  async function onAttach(file: File) {
    setAttaching(true);
    setAttachError(null);
    try {
      const body = new FormData();
      body.set("file", file);
      const res = await fetch(`/api/engineering/documents/${documentId}/file`, {
        method: "POST",
        body,
      });
      const parsed = await parseApiJsonResponse<DocRow>(res);
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
                  File: {fileState === "uploaded" ? "uploaded" : "metadata only"}
                </Badge>
                {piStatus && (
                  <Badge variant="outline" data-testid="document-pi-state">
                    PI: {piStatus}
                  </Badge>
                )}
                <AskThisObjectLink
                  label="Ask this document"
                  projectId={(doc.engineering_project_id as string | null) ?? null}
                  objectType="document"
                  objectId={documentId}
                  q="Summarise this document"
                  testId="ask-this-document"
                />
              </div>
              <Row label="Type" value={doc.document_type as string} />
              <Row label="File name" value={(doc.file_name as string) ?? undefined} />
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

              {fileState === "none" && (
                <div className="mt-4 space-y-2 rounded-md border border-dashed p-4">
                  <p className="text-sm font-medium">Attach source file</p>
                  <p className="text-xs text-muted-foreground">
                    This document identity exists as metadata only. Attach a PDF, TXT, or DOCX
                    without creating a duplicate register entry.
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={ACCEPT}
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
