"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Badge, Button, Card, CardContent, Input } from "@rtb/ui";
import { parseApiJsonResponse } from "@/lib/api/parse-json-response";
import {
  EXECUTION_READY,
  READINESS_LABELS,
  REVIEW_DISCLAIMER,
  REVIEW_SCOPE_OPTIONS,
  ZERO_FINDING_COPY,
} from "@/lib/review/labels";

type DocumentView = {
  documentId: string;
  title?: string;
  documentNumber?: string;
  revision: string;
  readiness: string;
};

type EvidenceView = {
  evidenceId: string;
  documentId: string;
  revision?: string;
  page?: number;
  section?: string;
  chunkId?: string;
  span?: string;
  verificationState: string;
};

type FindingView = {
  id: string;
  discipline?: string;
  category: string;
  title: string;
  description: string;
  severity: string;
  confidence: { band: string; score: number };
  verificationState: string;
  recommendedAction: string;
  status: string;
  evidence: EvidenceView[];
};

type RegisterView = {
  run: { id: string; status: string; scope: { reviewTypes: string[] }; startedAt?: string; completedAt?: string };
  findings: FindingView[];
  dispositions: { findingId: string; action: string; actorId: string; at: string; assignedTo?: string }[];
};

type PackagePayload = {
  pkg: { id: string; name: string; status: string; projectId: string };
  documents: DocumentView[];
  excluded: DocumentView[];
  pendingScope?: { reviewTypes: string[] };
  latestRun?: { status: string };
  register?: {
    register: RegisterView;
    run: RegisterView["run"];
    zeroFinding?: boolean;
    zeroFindingMessage?: string;
    disclaimer?: string;
    limitations?: string[];
  } | null;
};

export default function ReviewPackagePage() {
  const params = useParams<{ projectId: string; packageId: string }>();
  const [payload, setPayload] = useState<PackagePayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scope, setScope] = useState<string[]>(REVIEW_SCOPE_OPTIONS.map((item) => item.id));
  const [running, setRunning] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [reason, setReason] = useState("");
  const [assignee, setAssignee] = useState("");
  const [selectedFinding, setSelectedFinding] = useState<string | null>(null);

  const load = useCallback(async () => {
    const response = await fetch(`/api/review/packages/${params.packageId}`);
    const parsed = await parseApiJsonResponse<PackagePayload>(response);
    if (!parsed.ok || !parsed.data) {
      setError(parsed.errorMessage ?? "Unable to load review package");
      return;
    }
    setPayload(parsed.data);
    if (parsed.data.pendingScope?.reviewTypes?.length) {
      setScope([...parsed.data.pendingScope.reviewTypes]);
    }
  }, [params.packageId]);

  useEffect(() => {
    void load();
  }, [load]);

  const register = payload?.register?.register;
  const findings = useMemo(() => register?.findings ?? [], [register]);
  const filtered = useMemo(
    () =>
      findings.filter((finding) => {
        if (statusFilter !== "all" && finding.status !== statusFilter) return false;
        if (severityFilter !== "all" && finding.severity !== severityFilter) return false;
        if (categoryFilter !== "all" && finding.category !== categoryFilter && finding.discipline !== categoryFilter) {
          return false;
        }
        return true;
      }),
    [findings, statusFilter, severityFilter, categoryFilter],
  );
  const activeFinding = findings.find((finding) => finding.id === selectedFinding) ?? filtered[0];

  async function saveScope() {
    setError(null);
    const response = await fetch(`/api/review/packages/${params.packageId}/scope`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ reviewTypes: scope }),
    });
    const parsed = await parseApiJsonResponse(response);
    if (!parsed.ok) setError(parsed.errorMessage ?? "Could not save scope");
  }

  async function runReview() {
    setRunning(true);
    setError(null);
    await saveScope();
    const response = await fetch(`/api/review/packages/${params.packageId}/start`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ reviewTypes: scope }),
    });
    const parsed = await parseApiJsonResponse(response);
    setRunning(false);
    if (!parsed.ok) {
      setError(parsed.errorMessage ?? "Review failed");
      await load();
      return;
    }
    await load();
  }

  async function dispose(action: "accept" | "reject" | "modify" | "assign" | "close") {
    if (!activeFinding) return;
    setError(null);
    const response = await fetch(`/api/review/findings/${activeFinding.id}/disposition`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        action,
        reason: reason || undefined,
        assignedTo: action === "assign" ? assignee || undefined : undefined,
      }),
    });
    const parsed = await parseApiJsonResponse(response);
    if (!parsed.ok) {
      setError(parsed.errorMessage ?? "Disposition failed");
      return;
    }
    setReason("");
    await load();
  }

  const runStatus = payload?.register?.run?.status ?? payload?.latestRun?.status ?? payload?.pkg?.status;
  const zeroFinding = payload?.register?.zeroFinding && payload.register.run?.status === "completed";

  return (
    <>
      <Header
        title={payload?.pkg.name ?? "Review package"}
        description="Findings, evidence, and human disposition"
        showEngineeringChrome={false}
      />
      <div className="mx-auto max-w-6xl space-y-6 p-6">
        <p className="text-sm text-muted-foreground">
          <Link href="/review" className="underline">
            Projects
          </Link>
          {" / "}
          <Link href={`/review/projects/${params.projectId}`} className="underline">
            Documents
          </Link>
          {" / "}
          package
        </p>
        <p className="text-sm text-muted-foreground">{REVIEW_DISCLAIMER}</p>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <Card>
          <CardContent className="space-y-4 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-base font-semibold">Review scope</h2>
              <div className="flex items-center gap-2 text-sm">
                <span>Status:</span>
                <Badge variant={runStatus === "failed" ? "destructive" : "secondary"}>{runStatus ?? "draft"}</Badge>
                <span>{findings.length} finding{findings.length === 1 ? "" : "s"}</span>
              </div>
            </div>
            <div className="grid gap-2 md:grid-cols-2">
              {REVIEW_SCOPE_OPTIONS.map((option) => (
                <label key={option.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={scope.includes(option.id)}
                    onChange={(event) => {
                      setScope((current) =>
                        event.target.checked
                          ? [...current, option.id]
                          : current.filter((id) => id !== option.id),
                      );
                    }}
                  />
                  {option.label}
                </label>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Code compliance, structural analysis, FEA, drawing vision, OCR review, and autonomous design are not
              available.
            </p>
            <Button onClick={() => void runReview()} disabled={running || scope.length === 0}>
              {running ? "Running review…" : "Run review"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3 py-4">
            <h2 className="text-base font-semibold">Document readiness</h2>
            {(payload?.documents ?? []).map((doc) => (
              <div key={doc.documentId} className="flex items-center justify-between gap-3 text-sm">
                <span>
                  {doc.documentNumber ? `${doc.documentNumber} — ` : ""}
                  {doc.title ?? doc.documentId} (Rev {doc.revision})
                </span>
                <Badge variant={EXECUTION_READY.has(doc.readiness) ? "success" : "warning"}>
                  {READINESS_LABELS[doc.readiness] ?? doc.readiness}
                </Badge>
              </div>
            ))}
            {(payload?.excluded ?? []).length > 0 ? (
              <p className="text-sm text-muted-foreground">
                Unsupported or not-ready documents are listed above and excluded from execution.
              </p>
            ) : null}
          </CardContent>
        </Card>

        {runStatus === "failed" ? (
          <Card>
            <CardContent className="py-4">
              <p className="text-sm text-destructive">
                Review execution failed. The failure is recorded; it is not treated as an empty successful review.
              </p>
            </CardContent>
          </Card>
        ) : null}

        {zeroFinding ? (
          <Card>
            <CardContent className="space-y-2 py-4">
              <p className="font-medium">{payload?.register?.zeroFindingMessage ?? ZERO_FINDING_COPY}</p>
              <p className="text-sm text-muted-foreground">
                Scope: {(payload?.register?.run.scope.reviewTypes ?? scope).join(", ")}
              </p>
              <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                {(payload?.register?.limitations ?? []).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ) : null}

        <Card>
          <CardContent className="space-y-4 py-4">
            <h2 className="text-base font-semibold">Review Register</h2>
            <div className="flex flex-wrap gap-3 text-sm">
              <label>
                Status{" "}
                <select
                  className="rounded border bg-background px-2 py-1"
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                >
                  <option value="all">All</option>
                  <option value="awaiting_engineer">Awaiting engineer</option>
                  <option value="assigned">Assigned</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                  <option value="modified">Modified</option>
                  <option value="closed">Closed</option>
                </select>
              </label>
              <label>
                Severity{" "}
                <select
                  className="rounded border bg-background px-2 py-1"
                  value={severityFilter}
                  onChange={(event) => setSeverityFilter(event.target.value)}
                >
                  <option value="all">All</option>
                  <option value="critical">Critical</option>
                  <option value="major">Major</option>
                  <option value="minor">Minor</option>
                  <option value="observation">Observation</option>
                </select>
              </label>
              <label>
                Category{" "}
                <select
                  className="rounded border bg-background px-2 py-1"
                  value={categoryFilter}
                  onChange={(event) => setCategoryFilter(event.target.value)}
                >
                  <option value="all">All</option>
                  {REVIEW_SCOPE_OPTIONS.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[56rem] text-left text-sm">
                <thead>
                  <tr className="border-b text-xs text-muted-foreground">
                    <th className="py-2 pr-3">ID</th>
                    <th className="py-2 pr-3">Discipline</th>
                    <th className="py-2 pr-3">Category</th>
                    <th className="py-2 pr-3">Finding</th>
                    <th className="py-2 pr-3">Severity</th>
                    <th className="py-2 pr-3">Confidence</th>
                    <th className="py-2 pr-3">Evidence</th>
                    <th className="py-2 pr-3">Status</th>
                    <th className="py-2 pr-3">Assignee</th>
                    <th className="py-2 pr-3">Disposition</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((finding) => {
                    const latest = (register?.dispositions ?? [])
                      .filter((item) => item.findingId === finding.id)
                      .at(-1);
                    return (
                      <tr
                        key={finding.id}
                        className={`cursor-pointer border-b ${activeFinding?.id === finding.id ? "bg-accent/40" : ""}`}
                        onClick={() => setSelectedFinding(finding.id)}
                      >
                        <td className="py-2 pr-3 font-mono text-xs">{finding.id.slice(0, 8)}</td>
                        <td className="py-2 pr-3">{finding.discipline ?? "—"}</td>
                        <td className="py-2 pr-3">{finding.category}</td>
                        <td className="py-2 pr-3">{finding.title}</td>
                        <td className="py-2 pr-3">
                          <Badge variant={finding.severity === "critical" || finding.severity === "major" ? "destructive" : "warning"}>
                            {finding.severity}
                          </Badge>
                        </td>
                        <td className="py-2 pr-3">
                          {finding.confidence.band} ({Math.round(finding.confidence.score * 100)}%)
                        </td>
                        <td className="py-2 pr-3">{finding.evidence.length}</td>
                        <td className="py-2 pr-3">{finding.status}</td>
                        <td className="py-2 pr-3">{latest?.assignedTo ?? "—"}</td>
                        <td className="py-2 pr-3">{latest?.action ?? "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {activeFinding ? (
          <Card>
            <CardContent className="space-y-4 py-4">
              <h2 className="text-base font-semibold">Finding and evidence</h2>
              <p className="font-medium">{activeFinding.title}</p>
              <p className="text-sm">{activeFinding.description}</p>
              <div className="flex flex-wrap gap-2 text-sm">
                <Badge variant="destructive">{activeFinding.severity} severity</Badge>
                <Badge variant="secondary">
                  {activeFinding.confidence.band} confidence — not a risk rating
                </Badge>
                <Badge variant="outline">{activeFinding.verificationState}</Badge>
                <Badge>{activeFinding.status}</Badge>
              </div>
              <p className="text-sm">
                <span className="font-medium">Recommended action:</span> {activeFinding.recommendedAction}
              </p>
              <div className="space-y-3">
                {activeFinding.evidence.map((item) => {
                  const source = (payload?.documents ?? []).find((doc) => doc.documentId === item.documentId);
                  const locator = [
                    item.revision ? `Rev ${item.revision}` : null,
                    item.page != null ? `p. ${item.page}` : null,
                    item.section ? item.section : null,
                    item.chunkId ? `chunk ${item.chunkId}` : null,
                  ]
                    .filter(Boolean)
                    .join(" · ");
                  return (
                    <div key={item.evidenceId} className="rounded-md border p-3 text-sm">
                      <p className="font-medium">
                        {source?.documentNumber ?? source?.title ?? item.documentId}
                      </p>
                      <p className="text-xs text-muted-foreground">{locator || "Locator not available in source"}</p>
                      {item.span ? <p className="mt-2 whitespace-pre-wrap">{item.span}</p> : null}
                      <Link
                        className="mt-2 inline-block text-xs underline"
                        href={`/engineering/documents/${item.documentId}`}
                      >
                        Open source document
                      </Link>
                    </div>
                  );
                })}
              </div>
              {activeFinding.verificationState !== "evidence_verified" ? (
                <p className="text-sm text-muted-foreground">
                  This finding is not presented as verified because evidence could not be resolved to source.
                </p>
              ) : null}
              <div className="space-y-2">
                <label className="block text-xs text-muted-foreground">
                  Reason / comment (required for reject and modify)
                </label>
                <Input value={reason} onChange={(event) => setReason(event.target.value)} />
                <label className="block text-xs text-muted-foreground">Assignee (for assign)</label>
                <Input value={assignee} onChange={(event) => setAssignee(event.target.value)} />
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => void dispose("accept")}>
                    Accept
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => void dispose("reject")}>
                    Reject
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => void dispose("modify")}>
                    Modify
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => void dispose("assign")}>
                    Assign
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => void dispose("close")}>
                    Close
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </>
  );
}
