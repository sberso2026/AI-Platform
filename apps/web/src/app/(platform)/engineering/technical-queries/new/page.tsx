"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Button, Input } from "@rtb/ui";
import {
  TECHNICAL_QUERY_CLASSIFICATIONS,
  TECHNICAL_QUERY_PRIORITIES,
  tqQueryPlainText,
  type TechnicalQueryPerson,
} from "@rtb/engineering-os/browser";
import { useResolvedEngineeringProjectId } from "@/hooks/use-engineering-project-filter";
import { EngineeringBreadcrumb, OperationalError } from "@/components/engineering/operational";
import {
  TQ_SCROLL_MAIN,
  TqBackLink,
  TqMultiline,
  TqPersonSelect,
  TqSection,
} from "@/components/engineering/technical-query-ui";
import { TqAssetHybridInput } from "@/components/engineering/tq-asset-hybrid-input";
import { TqQueryEditor } from "@/components/engineering/tq-query-editor";
import { parseApiJsonResponse, asRecordArray } from "@/lib/api/parse-json-response";
import { useEngineeringWriteAccess } from "@/hooks/use-engineering-write-access";
import { formatTqDate } from "@/lib/engineering/technical-query-ux";
import type { TqDetailPayload } from "@/lib/engineering/technical-query-ux";
import {
  DOCUMENT_UPLOAD_ACCEPT,
  completeCanonicalDocumentUpload,
  createCanonicalDocumentUploadSession,
  putFileToSignedUpload,
} from "@/lib/engineering/document-upload";

type Confirmation = {
  id: string;
  tqNumber: string;
  actionByName: string;
  due: string | null;
  statusLabel: string;
  assigned: boolean;
};

const REGISTER_HREF = "/engineering/technical-queries";

function toDateInput(value: unknown): string {
  const match = String(value ?? "").match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : "";
}

export default function NewTechnicalQueryPage() {
  const router = useRouter();
  const projectId = useResolvedEngineeringProjectId();
  const { canMutate } = useEngineeringWriteAccess();
  const [people, setPeople] = useState<TechnicalQueryPerson[]>([]);
  const [projects, setProjects] = useState<Array<{ id: string; name: string }>>([]);
  const [disciplines, setDisciplines] = useState<Array<{ id: string; name: string }>>([]);
  const [documents, setDocuments] = useState<Array<Record<string, unknown>>>([]);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [tqNumber, setTqNumber] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [query, setQuery] = useState("");
  const [suggestedSolution, setSuggestedSolution] = useState("");
  const [reason, setReason] = useState("");
  const [due, setDue] = useState("");
  const [priority, setPriority] = useState("medium");
  const [classification, setClassification] = useState("technical_clarification");
  const [disciplineId, setDisciplineId] = useState("");
  const [area, setArea] = useState("");
  const [system, setSystem] = useState("");
  const [subsystem, setSubsystem] = useState("");
  const [workPackage, setWorkPackage] = useState("");
  const [contractPackage, setContractPackage] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [reviewerUserId, setReviewerUserId] = useState("");
  const [approverUserId, setApproverUserId] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState(projectId ?? "");
  const [assetId, setAssetId] = useState("");
  const [assetEquipmentText, setAssetEquipmentText] = useState("");
  const [documentId, setDocumentId] = useState("");
  const [externalReference, setExternalReference] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [imageBusy, setImageBusy] = useState(false);
  const [imageMessage, setImageMessage] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const [currentUser, setCurrentUser] = useState<{ name: string; company: string | null } | null>(null);

  function markDirty() {
    setDirty(true);
  }

  useEffect(() => {
    if (projectId && !draftId) setSelectedProjectId(projectId);
  }, [projectId, draftId]);

  useEffect(() => {
    fetch("/api/platform/current-user")
      .then((r) => r.json())
      .then((json: unknown) => {
        const data = (json as Record<string, unknown>)?.data as Record<string, unknown> | undefined;
        if (data) {
          const fullName = typeof data.full_name === "string" ? data.full_name.trim() : null;
          const email = typeof data.email === "string" ? data.email.trim() : null;
          const company = typeof data.company === "string" ? data.company : null;
          setCurrentUser({ name: fullName || email || "You", company });
        }
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    fetch("/api/engineering/technical-queries/directory")
      .then((r) => parseApiJsonResponse(r))
      .then((parsed) => {
        if (parsed.ok) setPeople(asRecordArray(parsed.data) as TechnicalQueryPerson[]);
      })
      .catch(() => undefined);
    fetch("/api/engineering/projects")
      .then((r) => parseApiJsonResponse(r))
      .then((parsed) => {
        if (parsed.ok) {
          setProjects(
            asRecordArray(parsed.data).map((row) => ({
              id: String(row.id ?? ""),
              name: String(row.project_name ?? row.name ?? "Project"),
            })),
          );
        }
      })
      .catch(() => undefined);
    fetch("/api/engineering/disciplines")
      .then((r) => parseApiJsonResponse(r))
      .then((parsed) => {
        if (parsed.ok) {
          setDisciplines(
            asRecordArray(parsed.data).map((row) => ({
              id: String(row.id ?? ""),
              name: String(row.name ?? ""),
            })),
          );
        }
      })
      .catch(() => undefined);
    fetch("/api/engineering/documents")
      .then((r) => parseApiJsonResponse(r))
      .then((parsed) => {
        if (parsed.ok) setDocuments(asRecordArray(parsed.data));
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    const existingId = new URLSearchParams(window.location.search).get("id");
    if (!existingId) return;
    void (async () => {
      const parsed = await parseApiJsonResponse<TqDetailPayload>(
        await fetch(`/api/engineering/technical-queries/${existingId}`),
      );
      if (!parsed.ok || !parsed.data) {
        setError(parsed.errorMessage ?? "Cannot open this draft");
        return;
      }
      if (!parsed.data.capabilities?.canEditDraft || parsed.data.presentation.status !== "draft") {
        setError("This technical query can no longer be edited as a draft");
        return;
      }
      const p = parsed.data.presentation;
      const row = parsed.data.query;
      setDraftId(String(row.id ?? existingId));
      setTqNumber(p.tqNumber);
      setTitle(p.title);
      setQuery(p.query);
      setSuggestedSolution(p.suggestedSolution ?? "");
      setReason(p.reason ?? "");
      setDue(toDateInput(p.due));
      setPriority(p.priorityValue || "medium");
      setClassification(p.classification || "technical_clarification");
      setDisciplineId(typeof row.discipline_id === "string" ? row.discipline_id : "");
      setArea(p.area ?? "");
      setSystem(p.system ?? "");
      setSubsystem(p.subsystem ?? "");
      setWorkPackage(p.workPackage ?? "");
      setContractPackage(p.contractPackage ?? "");
      setAssignedTo(typeof row.assigned_to === "string" ? row.assigned_to : p.actionBy?.id ?? "");
      setReviewerUserId(p.reviewer?.id ?? "");
      setApproverUserId(p.approver?.id ?? "");
      setSelectedProjectId(typeof row.project_id === "string" ? row.project_id : "");
      setAssetId(p.assetId ?? "");
      setAssetEquipmentText(p.assetLabel ?? "");
      setDocumentId(typeof row.document_id === "string" ? row.document_id : "");
      setExternalReference(p.externalReference ?? "");
      setDirty(false);
    })();
  }, []);

  const actionBy = people.find((person) => person.id === assignedTo);
  const selectedProjectName = projects.find((item) => item.id === selectedProjectId)?.name ?? "Current project";
  const queryPlain = tqQueryPlainText(query);
  const submitBlockers = useMemo(() => {
    const reasons: string[] = [];
    if (!queryPlain && !query.includes("data-document-id")) reasons.push("Enter Query / Information Required.");
    if (!due) reasons.push("Enter a Response Due Date.");
    if (!selectedProjectId) reasons.push("Select a Project.");
    if (imageBusy) reasons.push("Wait for the image upload to complete.");
    return reasons;
  }, [query, queryPlain, due, selectedProjectId, imageBusy]);
  const canSubmit = submitBlockers.length === 0;

  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  function confirmLeave(): boolean {
    if (!dirty) return true;
    return window.confirm("You have unsaved changes. Leave without saving?");
  }

  const body = useMemo(
    () => ({
      title: title || queryPlain.slice(0, 120),
      question: query,
      description: reason,
      suggestedSolution,
      responseDue: due,
      priority,
      classification,
      disciplineId: disciplineId || undefined,
      projectId: selectedProjectId || undefined,
      assetId: assetId || null,
      assetEquipmentText: assetEquipmentText || null,
      documentId: documentId || undefined,
      assignedTo: assignedTo || undefined,
      reviewerUserId: reviewerUserId || undefined,
      approverUserId: approverUserId || undefined,
      area,
      system,
      subsystem,
      workPackage,
      contractPackage,
      externalReference,
    }),
    [
      title,
      query,
      queryPlain,
      reason,
      suggestedSolution,
      due,
      priority,
      classification,
      disciplineId,
      selectedProjectId,
      assetId,
      assetEquipmentText,
      documentId,
      assignedTo,
      reviewerUserId,
      approverUserId,
      area,
      system,
      subsystem,
      workPackage,
      contractPackage,
      externalReference,
    ],
  );

  async function persistDraft(fields = body): Promise<string> {
    if (draftId) {
      const parsed = await parseApiJsonResponse<TqDetailPayload>(
        await fetch(`/api/engineering/technical-queries/${draftId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "save_draft", ...fields }),
        }),
      );
      if (!parsed.ok || !parsed.data) {
        throw new Error(parsed.errorMessage ?? "Could not save the technical query");
      }
      const id = String(parsed.data.query?.id ?? draftId);
      setTqNumber(parsed.data.presentation?.tqNumber ?? tqNumber);
      return id;
    }
    const parsed = await parseApiJsonResponse<TqDetailPayload>(
      await fetch("/api/engineering/technical-queries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...fields, submit: false }),
      }),
    );
    if (!parsed.ok || !parsed.data) {
      throw new Error(parsed.errorMessage ?? "Could not save the technical query");
    }
    const id = String(parsed.data.query?.id ?? "");
    setDraftId(id);
    setTqNumber(parsed.data.presentation?.tqNumber ?? null);
    window.history.replaceState(null, "", `/engineering/technical-queries/new?id=${id}`);
    return id;
  }

  async function ensureDraft(): Promise<string> {
    if (draftId) return draftId;
    const id = await persistDraft();
    setDirty(false);
    return id;
  }

  async function save(submit: boolean) {
    setSaving(true);
    setError(null);
    try {
      if (imageBusy) {
        setError("Wait for the image upload to complete.");
        setSaving(false);
        return;
      }
      const id = await persistDraft();
      if (!submit) {
        setDirty(false);
        window.location.href = `/engineering/technical-queries/${id}`;
        return;
      }
      const parsed = await parseApiJsonResponse<TqDetailPayload>(
        await fetch(`/api/engineering/technical-queries/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "submit", ...body }),
        }),
      );
      if (!parsed.ok || !parsed.data) {
        setError(parsed.errorMessage ?? "Could not submit the technical query");
        setSaving(false);
        return;
      }
      const presentation = parsed.data.presentation;
      setDirty(false);
      setConfirmation({
        id: String(parsed.data.query?.id ?? id),
        tqNumber: presentation?.tqNumber ?? tqNumber ?? "TQ",
        actionByName: presentation?.actionBy?.name ?? "Unassigned",
        due: presentation?.due ?? due,
        statusLabel: presentation?.statusLabel ?? "Awaiting Response",
        assigned: Boolean(presentation?.assigned),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the technical query");
    }
    setSaving(false);
  }

  async function onUpload(file: File) {
    try {
      const session = await createCanonicalDocumentUploadSession({ file });
      await putFileToSignedUpload(session, file);
      const completed = await completeCanonicalDocumentUpload({
        documentId: session.documentId,
        objectPath: session.objectPath,
        fileName: file.name,
        mimeType: session.mimeType,
        fileSize: file.size,
        engineeringProjectId: selectedProjectId || undefined,
        title: file.name,
        documentType: "other",
      });
      const uploadedId = String(completed.data?.id ?? session.documentId);
      setDocumentId(uploadedId);
      markDirty();
      setDocuments((current) => [
        { id: uploadedId, document_number: file.name, title: file.name, revision: session.revision, status: "uploaded" },
        ...current,
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not upload attachment");
    }
  }

  if (!canMutate) {
    return (
      <>
        <Header title="New Technical Query" description="Read-only role cannot create technical queries" />
        <main className={TQ_SCROLL_MAIN}>
          <TqBackLink href={REGISTER_HREF}>Back to Technical Queries</TqBackLink>
          <p className="text-sm text-muted-foreground">Read-only — technical queries are visible, not editable.</p>
        </main>
      </>
    );
  }

  if (confirmation) {
    return (
      <>
        <Header title="Technical Query submitted" description="The query is now in the controlled register" />
        <main className={`${TQ_SCROLL_MAIN} mx-auto max-w-3xl`} data-testid="tq-submit-confirmation">
          <TqBackLink href={REGISTER_HREF}>Back to Technical Queries</TqBackLink>
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-6">
            <p className="text-lg font-semibold text-emerald-950">✓ {confirmation.tqNumber} submitted</p>
            <dl className="mt-4 grid gap-3 sm:grid-cols-3 text-sm">
              <div>
                <dt className="text-xs uppercase tracking-wide text-emerald-800">Action By</dt>
                <dd className="font-medium">{confirmation.assigned ? confirmation.actionByName : "Unassigned"}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-emerald-800">Response due</dt>
                <dd className="font-medium">{formatTqDate(confirmation.due)}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-emerald-800">Status</dt>
                <dd className="font-medium">{confirmation.statusLabel}</dd>
              </div>
            </dl>
            {!confirmation.assigned ? (
              <p className="mt-3 text-sm text-amber-900">Nobody is currently assigned to respond to this TQ.</p>
            ) : (
              <p className="mt-3 text-sm text-emerald-900">
                {confirmation.actionByName} has an internal notification and this TQ is in their My Actions queue.
              </p>
            )}
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link className="rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground" href={`/engineering/technical-queries/${confirmation.id}`}>
              Open TQ
            </Link>
            <Link className="rounded-md border border-slate-200 px-3 py-2 text-sm" href="/engineering/technical-queries">
              View Register
            </Link>
            <Link className="rounded-md border border-slate-200 px-3 py-2 text-sm" href={`/engineering/technical-queries/${confirmation.id}/print`}>
              Print
            </Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header
        title={draftId ? `Edit Draft ${tqNumber ?? ""}`.trim() : "New Technical Query"}
        description={draftId ? "Complete and submit this technical query" : "Create a controlled technical query / RFI"}
      />
      <main className={`${TQ_SCROLL_MAIN} mx-auto max-w-5xl scroll-pb-28 pb-32`} data-testid="tq-create">
        <TqBackLink href={REGISTER_HREF} onNavigate={confirmLeave}>
          Back to Technical Queries
        </TqBackLink>
        <EngineeringBreadcrumb
          items={[
            { href: "/engineering/technical-queries", label: "Technical Queries" },
            { label: draftId ? `Edit Draft ${tqNumber ?? ""}`.trim() : "New Technical Query" },
          ]}
        />
        {error ? <OperationalError message={error} /> : null}

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!canSubmit) return;
            void save(true);
          }}
        >
          <TqSection title="1. Query" hint="Describe the information required. Suggested Solution is the initiator's proposal, not an approved engineering solution.">
            <div>
              <label htmlFor="tq-title" className="mb-1 block text-xs font-medium text-slate-600">
                Title / Subject
              </label>
              <Input
                id="tq-title"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  markDirty();
                }}
                placeholder="Sealant suitability at pipe sleeper isolation joint"
              />
            </div>
            <TqQueryEditor
              id="tq-query"
              tqId={draftId}
              projectId={selectedProjectId}
              value={query}
              onChange={(html) => {
                setQuery(html);
                markDirty();
              }}
              onEnsureDraft={ensureDraft}
              onUploadBusy={(busy, message) => {
                setImageBusy(busy);
                setImageMessage(message);
              }}
            />
            <TqMultiline
              id="tq-suggested"
              label="Suggested Solution / Proposed Resolution"
              value={suggestedSolution}
              onChange={(value) => {
                setSuggestedSolution(value);
                markDirty();
              }}
              rows={4}
            />
            <p className="text-xs text-slate-500">Optional initiator proposal. This is not an approved engineering solution.</p>
            <TqMultiline
              id="tq-reason"
              label="Reason / Context"
              value={reason}
              onChange={(value) => {
                setReason(value);
                markDirty();
              }}
              rows={3}
            />
            <div>
              <label htmlFor="tq-due" className="mb-1 block text-xs font-medium text-slate-600">
                Response Due Date *
              </label>
              <Input
                id="tq-due"
                type="date"
                value={due}
                onChange={(e) => {
                  setDue(e.target.value);
                  markDirty();
                }}
                required
              />
            </div>
          </TqSection>

          <TqSection title="2. People & responsibility">
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <p className="mb-1 text-xs font-medium text-slate-600">Initiator *</p>
                <p className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                  {currentUser ? currentUser.name : "Loading…"}
                  {currentUser?.company ? ` · ${currentUser.company}` : ""}
                </p>
              </div>
              <TqPersonSelect
                id="tq-action-by"
                label="Action By"
                value={assignedTo}
                people={people}
                onChange={(value) => {
                  setAssignedTo(value);
                  markDirty();
                }}
              />
              <TqPersonSelect
                id="tq-reviewer"
                label="Reviewer"
                value={reviewerUserId}
                people={people}
                onChange={(value) => {
                  setReviewerUserId(value);
                  markDirty();
                }}
              />
              <TqPersonSelect
                id="tq-approver"
                label="Approver / Technical Authority"
                value={approverUserId}
                people={people}
                onChange={(value) => {
                  setApproverUserId(value);
                  markDirty();
                }}
              />
            </div>
            {!assignedTo ? (
              <p className="text-sm text-amber-800">Nobody is currently assigned to respond to this TQ.</p>
            ) : (
              <p className="text-sm text-slate-600">
                After submission, {actionBy?.name ?? "Action By"} receives an internal notification and this TQ appears in My Actions.
              </p>
            )}
          </TqSection>

          <TqSection title="3. Engineering context">
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Project *</label>
                <select
                  className="h-10 w-full rounded-md border border-input px-3 text-sm"
                  value={selectedProjectId}
                  onChange={(e) => {
                    setSelectedProjectId(e.target.value);
                    markDirty();
                  }}
                  required
                >
                  <option value="">Select project</option>
                  {projects.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">TQ Number</label>
                <p className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                  {tqNumber ?? "Assigned when saved"}
                </p>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Priority</label>
                <select
                  className="h-10 w-full rounded-md border border-input px-3 text-sm"
                  value={priority}
                  onChange={(e) => {
                    setPriority(e.target.value);
                    markDirty();
                  }}
                >
                  {TECHNICAL_QUERY_PRIORITIES.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Discipline</label>
                <select
                  className="h-10 w-full rounded-md border border-input px-3 text-sm"
                  value={disciplineId}
                  onChange={(e) => {
                    setDisciplineId(e.target.value);
                    markDirty();
                  }}
                >
                  <option value="">Select discipline</option>
                  {disciplines.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Classification</label>
                <select
                  className="h-10 w-full rounded-md border border-input px-3 text-sm"
                  value={classification}
                  onChange={(e) => {
                    setClassification(e.target.value);
                    markDirty();
                  }}
                >
                  {TECHNICAL_QUERY_CLASSIFICATIONS.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Area</label>
                <Input
                  value={area}
                  onChange={(e) => {
                    setArea(e.target.value);
                    markDirty();
                  }}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">System</label>
                <Input
                  value={system}
                  onChange={(e) => {
                    setSystem(e.target.value);
                    markDirty();
                  }}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Subsystem</label>
                <Input
                  value={subsystem}
                  onChange={(e) => {
                    setSubsystem(e.target.value);
                    markDirty();
                  }}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Work Package</label>
                <Input
                  value={workPackage}
                  onChange={(e) => {
                    setWorkPackage(e.target.value);
                    markDirty();
                  }}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Contract / Package</label>
                <Input
                  value={contractPackage}
                  onChange={(e) => {
                    setContractPackage(e.target.value);
                    markDirty();
                  }}
                />
              </div>
              <div className="md:col-span-2 lg:col-span-3">
                <TqAssetHybridInput
                  projectId={selectedProjectId}
                  assetId={assetId}
                  text={assetEquipmentText}
                  onChange={(next) => {
                    setAssetId(next.assetId);
                    setAssetEquipmentText(next.text);
                    markDirty();
                  }}
                />
              </div>
            </div>
          </TqSection>

          <TqSection title="4. References & attachments" hint="Link canonical documents, drawings, and assets. Do not duplicate source records.">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Reference Document / Drawing</label>
              <select
                className="h-10 w-full rounded-md border border-input px-3 text-sm"
                value={documentId}
                onChange={(e) => {
                  setDocumentId(e.target.value);
                  markDirty();
                }}
              >
                <option value="">None</option>
                {documents.map((item) => (
                  <option key={String(item.id)} value={String(item.id)}>
                    {[item.document_number, item.title, item.revision].filter(Boolean).join(" · ")}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">External Reference Number</label>
              <Input
                value={externalReference}
                onChange={(e) => {
                  setExternalReference(e.target.value);
                  markDirty();
                }}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Upload attachment</label>
              <input
                type="file"
                accept={DOCUMENT_UPLOAD_ACCEPT}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void onUpload(file);
                }}
              />
              <p className="mt-1 text-xs text-slate-500">PDF, TXT, or DOCX via canonical document storage.</p>
            </div>
          </TqSection>

          <aside className="rounded-lg border border-slate-200 bg-slate-50 p-4" data-testid="tq-submit-summary">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{draftId ? "You are editing" : "You are creating"}</p>
            <p className="mt-1 text-sm font-medium">
              {draftId ? `${tqNumber ?? "Draft"} on ${selectedProjectName}` : `A controlled technical query on ${selectedProjectName}`}
            </p>
            <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs uppercase text-slate-500">Initiator</dt>
                <dd>{currentUser ? currentUser.name : "You"}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase text-slate-500">Action By</dt>
                <dd>{actionBy?.name ?? "Unassigned"}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase text-slate-500">Due</dt>
                <dd>{formatTqDate(due)}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase text-slate-500">Project</dt>
                <dd>{selectedProjectName}</dd>
              </div>
            </dl>
            <p className="mt-3 text-sm font-medium text-slate-800">After submission</p>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-700">
              <li>TQ receives a controlled number</li>
              <li>Status becomes Awaiting Response</li>
              <li>{assignedTo ? "Action By receives an internal notification" : "Nobody is notified because Action By is unassigned"}</li>
              <li>TQ appears in the My Actions queue when assigned</li>
              <li>Due-date monitoring begins</li>
              <li>References and attachments are retained</li>
              <li>The event is recorded in the audit / project timeline</li>
            </ul>
          </aside>

        </form>

        <div
          className="sticky bottom-0 z-20 -mx-6 mt-6 border-t border-slate-200 bg-white/95 px-6 py-3 backdrop-blur supports-[padding:max(0px)]:pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:-mx-8 sm:px-8"
          data-testid="tq-sticky-actions"
          role="region"
          aria-label="Technical query actions"
        >
          {!canSubmit ? (
            <p id="tq-submit-reason" className="mb-2 text-sm text-amber-900" data-testid="tq-submit-reason">
              {submitBlockers[0]}
            </p>
          ) : null}
          {imageMessage && imageBusy ? (
            <p className="mb-2 text-sm text-slate-600">{imageMessage}</p>
          ) : null}
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              disabled={saving}
              onClick={() => {
                if (!confirmLeave()) return;
                router.push(REGISTER_HREF);
              }}
            >
              Cancel
            </Button>
            <Button type="button" variant="outline" disabled={saving || imageBusy} onClick={() => void save(false)}>
              Save Draft
            </Button>
            <Button
              type="button"
              disabled={saving || !canSubmit}
              aria-describedby={!canSubmit ? "tq-submit-reason" : undefined}
              onClick={() => void save(true)}
            >
              Submit Technical Query
            </Button>
          </div>
        </div>
      </main>
    </>
  );
}
