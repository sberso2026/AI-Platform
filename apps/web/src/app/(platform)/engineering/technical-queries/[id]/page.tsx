"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Button, Input, StatusChip } from "@rtb/ui";
import { AskThisObjectLink } from "@/components/engineering/ask-this-object-link";
import { EngineeringBreadcrumb, OperationalError, OperationalSkeleton } from "@/components/engineering/operational";
import { TqMultiline, TqNextActionPanel, TqPersonBlock, TqSection } from "@/components/engineering/technical-query-ui";
import { parseApiJsonResponse, asRecordArray } from "@/lib/api/parse-json-response";
import { useEngineeringWriteAccess } from "@/hooks/use-engineering-write-access";
import { formatTqDate, formatTqDateTime, type TqDetailPayload } from "@/lib/engineering/technical-query-ux";
import {
  DOCUMENT_UPLOAD_ACCEPT,
  completeCanonicalDocumentUpload,
  createCanonicalDocumentUploadSession,
  putFileToSignedUpload,
} from "@/lib/engineering/document-upload";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "discussion", label: "Discussion" },
  { id: "evidence", label: "Evidence" },
  { id: "related", label: "Related Items" },
  { id: "history", label: "History" },
] as const;

export default function TechnicalQueryDetailPage() {
  const params = useParams();
  const id = String(params.id ?? "");
  const { canMutate } = useEngineeringWriteAccess();
  const [data, setData] = useState<TqDetailPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("overview");
  const [response, setResponse] = useState("");
  const [responseBasis, setResponseBasis] = useState("");
  const [qualifications, setQualifications] = useState("");
  const [followUp, setFollowUp] = useState("");
  const [comment, setComment] = useState("");
  const [clarification, setClarification] = useState("");
  const [closeoutComments, setCloseoutComments] = useState("");
  const [evidenceComplete, setEvidenceComplete] = useState(true);
  const [actionsCompleted, setActionsCompleted] = useState(true);
  const [referencesRetained, setReferencesRetained] = useState(true);
  const [documents, setDocuments] = useState<Array<Record<string, unknown>>>([]);
  const [assets, setAssets] = useState<Array<Record<string, unknown>>>([]);
  const [actions, setActions] = useState<Array<Record<string, unknown>>>([]);
  const [tqs, setTqs] = useState<Array<Record<string, unknown>>>([]);
  const [linkType, setLinkType] = useState("document");
  const [linkId, setLinkId] = useState("");
  const [actionTitle, setActionTitle] = useState("");
  const [busy, setBusy] = useState(false);

  async function reload() {
    const parsed = await parseApiJsonResponse<TqDetailPayload>(
      await fetch(`/api/engineering/technical-queries/${id}`),
    );
    if (!parsed.ok || !parsed.data) {
      setError(parsed.errorMessage ?? "Cannot load technical query");
      setData(null);
      return;
    }
    setError(null);
    setData(parsed.data);
    setResponse(parsed.data.presentation.clientResponse ?? "");
    setResponseBasis(parsed.data.presentation.responseBasis ?? "");
    setQualifications(parsed.data.presentation.qualifications ?? "");
    setFollowUp(parsed.data.presentation.followUpActions ?? "");
    setCloseoutComments(parsed.data.presentation.closeoutComments ?? "");
  }

  useEffect(() => {
    void reload();
    fetch("/api/engineering/documents").then((r) => parseApiJsonResponse(r)).then((p) => p.ok && setDocuments(asRecordArray(p.data))).catch(() => undefined);
    fetch("/api/engineering/assets").then((r) => parseApiJsonResponse(r)).then((p) => p.ok && setAssets(asRecordArray(p.data))).catch(() => undefined);
    fetch("/api/engineering/actions").then((r) => parseApiJsonResponse(r)).then((p) => p.ok && setActions(asRecordArray(p.data))).catch(() => undefined);
    fetch("/api/engineering/technical-queries").then((r) => parseApiJsonResponse(r)).then((p) => p.ok && setTqs(asRecordArray(p.data))).catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function mutate(body: Record<string, unknown>) {
    setBusy(true);
    const parsed = await parseApiJsonResponse(
      await fetch("/api/engineering/technical-queries", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...body }),
      }),
    );
    setBusy(false);
    if (!parsed.ok) {
      setError(parsed.errorMessage ?? "Could not update technical query");
      return false;
    }
    await reload();
    return true;
  }

  async function uploadAttachment(file: File) {
    const session = await createCanonicalDocumentUploadSession({ file });
    await putFileToSignedUpload(session, file);
    const completed = await completeCanonicalDocumentUpload({
      documentId: session.documentId,
      objectPath: session.objectPath,
      fileName: file.name,
      mimeType: session.mimeType,
      fileSize: file.size,
      title: file.name,
      documentType: "other",
    });
    const documentId = String(completed.data?.id ?? session.documentId);
    await mutate({ action: "link", toType: "document", toId: documentId, relationship: "attachment" });
  }

  if (!data) {
    return (
      <>
        <Header title="Technical Query" description="Loading controlled TQ / RFI workspace" />
        <main className="page-main px-6 py-6">
          {error ? <OperationalError message={error} /> : <OperationalSkeleton />}
        </main>
      </>
    );
  }

  const p = data.presentation;
  const caps = data.capabilities ?? {};
  const canRespond = canMutate && caps.canRespond;
  const canReview = canMutate && caps.canReview;
  const awaitingResponse = p.status === "awaiting_response" || p.status === "clarification_required";
  const awaitingReview = p.status === "response_submitted" || p.status === "under_review";
  const canClose = canReview && p.status === "accepted";
  const linkOptions =
    linkType === "document"
      ? documents
      : linkType === "asset"
        ? assets
        : linkType === "action"
          ? actions
          : tqs;

  return (
    <>
      <Header title={p.tqNumber} description={p.title} />
      <main className="page-main mx-auto max-w-6xl px-6 pb-12 pt-6" data-testid="tq-detail">
        <EngineeringBreadcrumb
          items={[
            { href: "/engineering/technical-queries", label: "Technical Queries" },
            { label: p.tqNumber },
          ]}
        />
        {error ? <OperationalError message={error} /> : null}

        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">{p.tqNumber}</h2>
            <p className="mt-1 max-w-3xl text-sm text-slate-700">{p.title}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <StatusChip value={p.statusLabel}>{p.statusLabel}</StatusChip>
              <StatusChip value={p.priority}>{p.priority} Priority</StatusChip>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <AskThisObjectLink
              label="Ask Engineering AI"
              projectId={typeof data.query.project_id === "string" ? data.query.project_id : null}
              objectType="technical_query"
              objectId={id}
              q={`Find supporting evidence and related technical queries for ${p.tqNumber}. Advisory only.`}
            />
            <Link className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm" href={`/engineering/technical-queries/${id}/print`}>
              Print
            </Link>
          </div>
        </div>

        <div className="mb-4 grid gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-5">
          <TqPersonBlock label="Initiator" person={p.initiator} />
          <TqPersonBlock label="Action By" person={p.actionBy} />
          <div>
            <p className="text-[0.7rem] font-semibold uppercase tracking-wide text-slate-500">Project</p>
            <p className="mt-0.5 text-sm font-medium">{p.projectName ?? "—"}</p>
          </div>
          <div>
            <p className="text-[0.7rem] font-semibold uppercase tracking-wide text-slate-500">Discipline</p>
            <p className="mt-0.5 text-sm font-medium">{p.disciplineName ?? "—"}</p>
          </div>
          <div>
            <p className="text-[0.7rem] font-semibold uppercase tracking-wide text-slate-500">Due</p>
            <p className={`mt-0.5 text-sm font-medium ${p.overdue ? "text-rose-800" : ""}`}>{formatTqDate(p.due)}</p>
          </div>
        </div>

        <TqNextActionPanel nextAction={p.nextAction} overdue={p.overdue} />

        <div className="mt-4 flex flex-wrap gap-2">
          <AskThisObjectLink
            label="Find supporting evidence"
            objectType="technical_query"
            objectId={id}
            q={`Find authorised evidence that supports a response to: ${p.query}`}
          />
          <AskThisObjectLink
            label="Draft response"
            objectType="technical_query"
            objectId={id}
            q={`Propose a draft technical response to ${p.tqNumber}. Cite sources. Do not approve or close.`}
          />
          <AskThisObjectLink
            label="Check response against evidence"
            objectType="technical_query"
            objectId={id}
            q={`Check this draft response against authorised evidence: ${response || p.clientResponse || ""}`}
          />
          <AskThisObjectLink
            label="Find related TQs"
            objectType="technical_query"
            objectId={id}
            q={`Find related technical queries for ${p.tqNumber}.`}
          />
        </div>
        <p className="mt-2 text-xs text-slate-500">Engineering AI is advisory. A human must review and submit. AI cannot approve or close a TQ.</p>

        <nav className="mt-6 flex flex-wrap gap-1 border-b border-slate-200" aria-label="Technical query sections">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`px-3 py-2 text-sm ${tab === item.id ? "border-b-2 border-slate-900 font-semibold" : "text-slate-600"}`}
              onClick={() => setTab(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {tab === "overview" ? (
          <div className="mt-4 space-y-4" data-testid="tq-overview">
            <TqSection title="Query">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-800">{p.query || "—"}</p>
              {p.queryLocked ? <p className="text-xs text-slate-500">The original query is controlled and cannot be silently overwritten.</p> : null}
            </TqSection>
            <TqSection title="Suggested Solution" hint="Initiator proposal — not an approved engineering solution.">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-800">{p.suggestedSolution || "None recorded"}</p>
            </TqSection>
            <TqSection title="Client / Technical Response">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-800">{p.clientResponse || "No response submitted yet."}</p>
            </TqSection>
            <TqSection title="Response Basis">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-800">{p.responseBasis || "—"}</p>
            </TqSection>
            <TqSection title="Closeout">
              <dl className="grid gap-2 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-xs uppercase text-slate-500">Accepted</dt>
                  <dd>{formatTqDateTime(p.acceptedAt)}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase text-slate-500">Closed</dt>
                  <dd>{formatTqDateTime(p.closedAt)}</dd>
                </div>
              </dl>
              <p className="mt-2 whitespace-pre-wrap text-sm">{p.closeoutComments || "Not closed."}</p>
            </TqSection>

            {canRespond && awaitingResponse ? (
              <TqSection title="Response" hint="Required from Action By. Save a draft, request clarification, or submit the technical response.">
                <TqMultiline id="tq-response" label="Client / Technical Response" value={response} onChange={setResponse} required />
                <TqMultiline id="tq-basis" label="Response Basis" value={responseBasis} onChange={setResponseBasis} rows={3} />
                <TqMultiline id="tq-qual" label="Conditions / Qualifications" value={qualifications} onChange={setQualifications} rows={3} />
                <TqMultiline id="tq-follow" label="Required Follow-up Actions" value={followUp} onChange={setFollowUp} rows={3} />
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" disabled={busy} onClick={() => void mutate({ action: "save_response_draft", response, responseBasis, qualifications, followUpActions: followUp })}>
                    Save Draft
                  </Button>
                  <Button type="button" variant="secondary" disabled={busy} onClick={() => void mutate({ action: "request_clarification", comment: clarification || "Clarification required" })}>
                    Request Clarification
                  </Button>
                  <Button type="button" disabled={busy || !response.trim()} onClick={() => void mutate({ action: "submit_response", response, responseBasis, qualifications, followUpActions: followUp })}>
                    Submit Response
                  </Button>
                </div>
                <AskThisObjectLink
                  label="Draft Response with Engineering AI"
                  objectType="technical_query"
                  objectId={id}
                  q={`Draft a technical response for ${p.tqNumber}. Cite authorised evidence. Do not approve.`}
                />
              </TqSection>
            ) : null}

            {canReview && awaitingReview ? (
              <TqSection title="Review" hint="Accept the response or request clarification. Closeout is a separate governed step.">
                <TqMultiline id="tq-clarification" label="Clarification request" value={clarification} onChange={setClarification} rows={3} />
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" disabled={busy} onClick={() => void mutate({ action: "request_clarification", comment: clarification || "Clarification required" })}>
                    Request Clarification
                  </Button>
                  <Button type="button" disabled={busy} onClick={() => void mutate({ action: "accept" })}>
                    Accept Response
                  </Button>
                </div>
              </TqSection>
            ) : null}

            {canClose ? (
              <TqSection title="Close Technical Query" hint="Closing requires a final response, acceptance, retained evidence, and recorded closeout. Digital signatures are not claimed.">
                <TqMultiline id="tq-closeout" label="Closeout comments" value={closeoutComments} onChange={setCloseoutComments} rows={3} />
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={evidenceComplete} onChange={(e) => setEvidenceComplete(e.target.checked)} />
                  Evidence complete
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={actionsCompleted} onChange={(e) => setActionsCompleted(e.target.checked)} />
                  Required actions resolved or formally linked
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={referencesRetained} onChange={(e) => setReferencesRetained(e.target.checked)} />
                  Attachments and references retained
                </label>
                <Button
                  type="button"
                  disabled={busy || !p.clientResponse || !evidenceComplete || !actionsCompleted || !referencesRetained}
                  onClick={() =>
                    void mutate({
                      action: "close",
                      closeoutComments,
                      evidenceComplete,
                      actionsCompleted,
                      referencesRetained,
                    })
                  }
                >
                  Close Technical Query
                </Button>
              </TqSection>
            ) : null}
          </div>
        ) : null}

        {tab === "discussion" ? (
          <div className="mt-4 space-y-3" data-testid="tq-discussion">
            {(data.comments ?? []).length === 0 ? <p className="text-sm text-slate-600">No discussion yet.</p> : null}
            {(data.comments ?? []).map((item, index) => (
              <article key={String(item.id ?? index)} className="rounded-lg border border-slate-200 bg-white p-3">
                <p className="text-xs text-slate-500">{formatTqDateTime(item.created_at)}</p>
                <p className="mt-1 whitespace-pre-wrap text-sm">{String(item.body ?? "")}</p>
              </article>
            ))}
            {canMutate ? (
              <form
                className="space-y-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (comment.trim()) void mutate({ action: "comment", comment });
                  setComment("");
                }}
              >
                <TqMultiline id="tq-comment" label="Add discussion note" value={comment} onChange={setComment} rows={3} />
                <Button type="submit" size="sm" disabled={busy || !comment.trim()}>
                  Add note
                </Button>
              </form>
            ) : null}
          </div>
        ) : null}

        {tab === "evidence" ? (
          <div className="mt-4 space-y-4" data-testid="tq-evidence">
            <TqSection title="Linked evidence">
              {(data.references ?? []).length === 0 ? <p className="text-sm text-slate-600">No references linked.</p> : null}
              <ul className="divide-y divide-slate-100">
                {(data.references ?? []).map((ref) => (
                  <li key={`${ref.objectType}-${ref.objectId}`} className="py-2 text-sm">
                    <p className="font-medium">{[ref.number, ref.title].filter(Boolean).join(" — ") || ref.objectType}</p>
                    <p className="text-xs text-slate-500">
                      {[ref.revision ? `Rev ${ref.revision}` : null, ref.status, ref.source].filter(Boolean).join(" · ")}
                    </p>
                  </li>
                ))}
              </ul>
            </TqSection>
            {canMutate ? (
              <TqSection title="Add reference">
                <div className="grid gap-2 md:grid-cols-3">
                  <select className="h-10 rounded-md border px-3 text-sm" value={linkType} onChange={(e) => setLinkType(e.target.value)}>
                    <option value="document">Link Document / Drawing</option>
                    <option value="asset">Link Asset</option>
                    <option value="technical_query">Link Existing TQ</option>
                    <option value="action">Link Action</option>
                  </select>
                  <select className="h-10 rounded-md border px-3 text-sm" value={linkId} onChange={(e) => setLinkId(e.target.value)}>
                    <option value="">Select record</option>
                    {linkOptions.map((item) => (
                      <option key={String(item.id)} value={String(item.id)}>
                        {String(item.document_number ?? item.tq_number ?? item.action_number ?? item.name ?? item.title ?? "Record")}
                      </option>
                    ))}
                  </select>
                  <Button
                    type="button"
                    size="sm"
                    disabled={!linkId || busy}
                    onClick={() => void mutate({ action: "link", toType: linkType, toId: linkId })}
                  >
                    Link
                  </Button>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">Upload attachment</label>
                  <input
                    type="file"
                    accept={DOCUMENT_UPLOAD_ACCEPT}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) void uploadAttachment(file).catch((err) => setError(err instanceof Error ? err.message : "Upload failed"));
                    }}
                  />
                </div>
              </TqSection>
            ) : null}
          </div>
        ) : null}

        {tab === "related" ? (
          <div className="mt-4 space-y-4" data-testid="tq-related">
            <TqSection title="Follow-up action">
              <p className="text-sm text-slate-600">{p.followUpActions || "No follow-up actions recorded."}</p>
              {canMutate ? (
                <form
                  className="flex flex-wrap gap-2"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!actionTitle.trim()) return;
                    const created = await parseApiJsonResponse<Record<string, unknown>>(
                      await fetch("/api/engineering/actions", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          title: actionTitle,
                          originatingObjectType: "technical_query",
                          originatingObjectId: id,
                          projectId: data.query.project_id,
                        }),
                      }),
                    );
                    const actionId = String(created.data?.id ?? "");
                    if (actionId) await mutate({ action: "link", toType: "action", toId: actionId });
                    setActionTitle("");
                  }}
                >
                  <Input value={actionTitle} onChange={(e) => setActionTitle(e.target.value)} placeholder="Required follow-up action" />
                  <Button type="submit" size="sm">
                    Link new action
                  </Button>
                </form>
              ) : null}
            </TqSection>
          </div>
        ) : null}

        {tab === "history" ? (
          <div className="mt-4" data-testid="tq-history">
            <ul className="space-y-2">
              {(data.history ?? []).map((event, index) => (
                <li key={`${event.occurredAt}-${index}`} className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm">
                  <p className="font-medium">{event.title}</p>
                  <p className="text-xs text-slate-500">
                    {formatTqDateTime(event.occurredAt)}
                    {event.actorName ? ` · ${event.actorName}` : ""}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </main>
    </>
  );
}
