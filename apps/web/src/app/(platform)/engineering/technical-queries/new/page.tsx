"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Button, Input } from "@rtb/ui";
import {
  TECHNICAL_QUERY_CLASSIFICATIONS,
  TECHNICAL_QUERY_PRIORITIES,
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

export default function NewTechnicalQueryPage() {
  const router = useRouter();
  const projectId = useResolvedEngineeringProjectId();
  const { canMutate } = useEngineeringWriteAccess();
  const [people, setPeople] = useState<TechnicalQueryPerson[]>([]);
  const [projects, setProjects] = useState<Array<{ id: string; name: string }>>([]);
  const [disciplines, setDisciplines] = useState<Array<{ id: string; name: string }>>([]);
  const [documents, setDocuments] = useState<Array<Record<string, unknown>>>([]);
  const [assets, setAssets] = useState<Array<Record<string, unknown>>>([]);
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
  const [documentId, setDocumentId] = useState("");
  const [externalReference, setExternalReference] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const [currentUser, setCurrentUser] = useState<{ name: string; company: string | null } | null>(null);

  useEffect(() => {
    if (projectId) setSelectedProjectId(projectId);
  }, [projectId]);

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
    fetch("/api/engineering/assets")
      .then((r) => parseApiJsonResponse(r))
      .then((parsed) => {
        if (parsed.ok) setAssets(asRecordArray(parsed.data));
      })
      .catch(() => undefined);
  }, []);

  const actionBy = people.find((person) => person.id === assignedTo);
  const selectedProjectName = projects.find((item) => item.id === selectedProjectId)?.name ?? "Current project";
  const dirty =
    Boolean(title || query || suggestedSolution || reason || due || assignedTo || documentId || area || system);
  const submitBlockers = useMemo(() => {
    const reasons: string[] = [];
    if (!query.trim()) reasons.push("Enter Query / Information Required.");
    if (!due) reasons.push("Enter a Response Due Date.");
    if (!selectedProjectId) reasons.push("Select a Project.");
    return reasons;
  }, [query, due, selectedProjectId]);
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
    return window.confirm("This technical query has unsaved changes. Leave without saving?");
  }

  const body = useMemo(
    () => ({
      title: title || query.slice(0, 120),
      question: query,
      description: reason,
      suggestedSolution,
      responseDue: due,
      priority,
      classification,
      disciplineId: disciplineId || undefined,
      projectId: selectedProjectId || undefined,
      assetId: assetId || undefined,
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
      reason,
      suggestedSolution,
      due,
      priority,
      classification,
      disciplineId,
      selectedProjectId,
      assetId,
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

  async function save(submit: boolean) {
    setSaving(true);
    setError(null);
    const parsed = await parseApiJsonResponse<TqDetailPayload>(
      await fetch("/api/engineering/technical-queries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...body, submit }),
      }),
    );
    setSaving(false);
    if (!parsed.ok || !parsed.data) {
      setError(parsed.errorMessage ?? "Could not save the technical query");
      return;
    }
    const presentation = parsed.data.presentation;
    const id = String(parsed.data.query?.id ?? "");
    if (submit) {
      setConfirmation({
        id,
        tqNumber: presentation?.tqNumber ?? "TQ",
        actionByName: presentation?.actionBy?.name ?? "Unassigned",
        due: presentation?.due ?? due,
        statusLabel: presentation?.statusLabel ?? "Awaiting Response",
        assigned: Boolean(presentation?.assigned),
      });
      return;
    }
    window.location.href = `/engineering/technical-queries/${id}`;
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
      <Header title="New Technical Query" description="Create a controlled technical query / RFI" />
      <main className={`${TQ_SCROLL_MAIN} mx-auto max-w-5xl scroll-pb-28 pb-32`} data-testid="tq-create">
        <TqBackLink href={REGISTER_HREF} onNavigate={confirmLeave}>
          Back to Technical Queries
        </TqBackLink>
        <EngineeringBreadcrumb
          items={[
            { href: "/engineering/technical-queries", label: "Technical Queries" },
            { label: "New Technical Query" },
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
              <Input id="tq-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Sealant suitability at pipe sleeper isolation joint" />
            </div>
            <TqMultiline id="tq-query" label="Query / Information Required" value={query} onChange={setQuery} required />
            <TqMultiline
              id="tq-suggested"
              label="Suggested Solution / Proposed Resolution"
              value={suggestedSolution}
              onChange={setSuggestedSolution}
              rows={4}
            />
            <p className="text-xs text-slate-500">Optional initiator proposal. This is not an approved engineering solution.</p>
            <TqMultiline id="tq-reason" label="Reason / Context" value={reason} onChange={setReason} rows={3} />
            <div>
              <label htmlFor="tq-due" className="mb-1 block text-xs font-medium text-slate-600">
                Response Due Date *
              </label>
              <Input id="tq-due" type="date" value={due} onChange={(e) => setDue(e.target.value)} required />
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
              <TqPersonSelect id="tq-action-by" label="Action By" value={assignedTo} people={people} onChange={setAssignedTo} />
              <TqPersonSelect id="tq-reviewer" label="Reviewer" value={reviewerUserId} people={people} onChange={setReviewerUserId} />
              <TqPersonSelect id="tq-approver" label="Approver / Technical Authority" value={approverUserId} people={people} onChange={setApproverUserId} />
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
                <select className="h-10 w-full rounded-md border border-input px-3 text-sm" value={selectedProjectId} onChange={(e) => setSelectedProjectId(e.target.value)} required>
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
                <p className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">Assigned on submit</p>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Priority</label>
                <select className="h-10 w-full rounded-md border border-input px-3 text-sm" value={priority} onChange={(e) => setPriority(e.target.value)}>
                  {TECHNICAL_QUERY_PRIORITIES.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Discipline</label>
                <select className="h-10 w-full rounded-md border border-input px-3 text-sm" value={disciplineId} onChange={(e) => setDisciplineId(e.target.value)}>
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
                <select className="h-10 w-full rounded-md border border-input px-3 text-sm" value={classification} onChange={(e) => setClassification(e.target.value)}>
                  {TECHNICAL_QUERY_CLASSIFICATIONS.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Area</label>
                <Input value={area} onChange={(e) => setArea(e.target.value)} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">System</label>
                <Input value={system} onChange={(e) => setSystem(e.target.value)} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Subsystem</label>
                <Input value={subsystem} onChange={(e) => setSubsystem(e.target.value)} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Work Package</label>
                <Input value={workPackage} onChange={(e) => setWorkPackage(e.target.value)} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Contract / Package</label>
                <Input value={contractPackage} onChange={(e) => setContractPackage(e.target.value)} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Asset / Equipment</label>
                <select className="h-10 w-full rounded-md border border-input px-3 text-sm" value={assetId} onChange={(e) => setAssetId(e.target.value)}>
                  <option value="">None</option>
                  {assets.map((item) => (
                    <option key={String(item.id)} value={String(item.id)}>
                      {String(item.asset_name ?? item.name ?? "Asset")}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </TqSection>

          <TqSection title="4. References & attachments" hint="Link canonical documents, drawings, and assets. Do not duplicate source records.">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Reference Document / Drawing</label>
              <select className="h-10 w-full rounded-md border border-input px-3 text-sm" value={documentId} onChange={(e) => setDocumentId(e.target.value)}>
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
              <Input value={externalReference} onChange={(e) => setExternalReference(e.target.value)} />
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
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">You are creating</p>
            <p className="mt-1 text-sm font-medium">A controlled technical query on {selectedProjectName}</p>
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
            <Button type="button" variant="outline" disabled={saving} onClick={() => void save(false)}>
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
