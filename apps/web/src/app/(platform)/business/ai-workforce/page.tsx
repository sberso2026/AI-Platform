"use client";

import { useCallback, useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { PageMain } from "@/components/layout/page-main";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
  SectionHeader,
  StatusChip,
} from "@rtb/ui";
import { Bot } from "lucide-react";
import { parseApiJsonResponse } from "@/lib/api/parse-json-response";

type Installation = {
  id: string;
  catalogSlug: string;
  status: string;
  authority: string;
  toolAllowlist: string[];
  contextScope: string[];
};

type Run = {
  id: string;
  state: string;
  authority: string;
  explanation: { derivedRecommendation: string; missingEvidence: string[]; chainOfThoughtExposed: false };
};

type Approval = { id: string; runId: string; decision: string; requestedBy: string };
type Finding = { code: string; severity: string; message: string; repaired: false };

function authorityKind(authority: string): "advisory" | "execution" {
  return authority === "request_execution" || authority === "execute_with_approval" ? "execution" : "advisory";
}

export default function AiWorkforcePage() {
  const [installations, setInstallations] = useState<Installation[]>([]);
  const [runs, setRuns] = useState<Run[]>([]);
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [selectedRun, setSelectedRun] = useState<Run | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    const overview = await parseApiJsonResponse<{
      installations: Installation[];
      runs: Run[];
      pendingApprovals: Approval[];
      diagnostics: { findings: Finding[] };
    }>(await fetch("/api/business/ai-workforce"));
    if (overview.ok && overview.data) {
      setInstallations(overview.data.installations ?? []);
      setRuns(overview.data.runs ?? []);
      setApprovals(overview.data.pendingApprovals ?? []);
      setFindings(overview.data.diagnostics?.findings ?? []);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function seedDemo() {
    setBusy(true);
    setError(null);
    try {
      const parsed = await parseApiJsonResponse(await fetch("/api/business/ai-workforce/demo", { method: "POST" }));
      if (!parsed.ok) setError(parsed.error ?? "Demo failed");
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  async function setAgentStatus(id: string, action: "suspend" | "revoke") {
    setBusy(true);
    try {
      await fetch(`/api/business/ai-workforce/${action}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id }),
      });
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  async function decide(approvalId: string, decision: "approved" | "rejected") {
    setBusy(true);
    try {
      await fetch("/api/business/ai-workforce/approvals", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ approvalId, decision }),
      });
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Header title="AI Workforce" />
      <PageMain>
        {error && <p className="mb-4 text-sm text-red-700">{error}</p>}
        <p className="mb-6 text-sm text-slate-600">
          Governed agents reuse the Platform Agent Registry, AI Director, Policy Engine, and BOS-10 context.
          Recommendations stay advisory until a separate human approval. Agents cannot approve themselves.
        </p>
        <div className="mb-6">
          <Button disabled={busy} onClick={() => void seedDemo()}>
            Load workforce demo
          </Button>
        </div>

        <section className="mb-8" data-testid="bos-workforce-overview">
          <SectionHeader
            title="Workforce overview"
            description="Installed catalog agents, authority class, and whether they are advisory or execution-capable."
          />
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Installed agents</CardTitle>
              </CardHeader>
              <CardContent>{installations.length}</CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Runs</CardTitle>
              </CardHeader>
              <CardContent>{runs.length}</CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Pending approvals</CardTitle>
              </CardHeader>
              <CardContent>{approvals.length}</CardContent>
            </Card>
          </div>
        </section>

        <section className="mb-8" data-testid="bos-workforce-agents">
          <SectionHeader title="Installed agents" description="Status, authority, capabilities, and context scope." />
          <div className="mt-3 grid gap-3">
            {installations.length === 0 ? (
              <EmptyState icon={<Bot className="h-8 w-8" />} title="No agents installed" description="Load the demo to install governed catalog agents." />
            ) : (
              installations.map((row) => (
                <Card key={row.id}>
                  <CardHeader>
                    <CardTitle>{row.catalogSlug}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex flex-wrap gap-2">
                      <StatusChip value={row.status}>{row.status}</StatusChip>
                      <StatusChip value={authorityKind(row.authority)}>
                        {authorityKind(row.authority) === "advisory" ? "Advisory authority" : "Execution authority"}
                      </StatusChip>
                      <span>{row.authority}</span>
                    </div>
                    <p>Tools: {row.toolAllowlist.join(", ")}</p>
                    <p>Context: {row.contextScope.join(", ")}</p>
                    <div className="flex gap-2">
                      <Button disabled={busy || row.status === "revoked"} variant="secondary" onClick={() => void setAgentStatus(row.id, "suspend")}>
                        Suspend
                      </Button>
                      <Button disabled={busy || row.status === "revoked"} variant="secondary" onClick={() => void setAgentStatus(row.id, "revoke")}>
                        Revoke
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </section>

        <section className="mb-8" data-testid="bos-workforce-runs">
          <SectionHeader title="Task / run history" description="Operational metadata only. Canonical business records stay in owning domains." />
          <div className="mt-3 space-y-2">
            {runs.map((run) => (
              <button
                key={run.id}
                className="w-full rounded border border-slate-200 px-3 py-2 text-left text-sm hover:bg-slate-50"
                onClick={() => setSelectedRun(run)}
              >
                <span className="font-medium">{run.id}</span>
                <span className="ml-2 text-slate-500">
                  {run.state} · {authorityKind(run.authority)}
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="mb-8" data-testid="bos-workforce-approvals">
          <SectionHeader title="Pending approvals" description="Independent human approval. The requester cannot approve their own run." />
          <div className="mt-3 space-y-2">
            {approvals.map((row) => (
              <div key={row.id} className="flex flex-wrap items-center gap-2 rounded border border-slate-200 px-3 py-2 text-sm">
                <span>{row.runId}</span>
                <Button disabled={busy} onClick={() => void decide(row.id, "approved")}>
                  Approve
                </Button>
                <Button disabled={busy} variant="secondary" onClick={() => void decide(row.id, "rejected")}>
                  Reject
                </Button>
              </div>
            ))}
          </div>
        </section>

        {selectedRun && (
          <section className="mb-8" data-testid="bos-workforce-run-detail">
            <SectionHeader title="Execution / audit detail" description="Evidence-based rationale only. Hidden chain-of-thought is not exposed." />
            <Card className="mt-3">
              <CardContent className="space-y-2 pt-4 text-sm">
                <p>State: {selectedRun.state}</p>
                <p>Recommendation: {selectedRun.explanation.derivedRecommendation || "None"}</p>
                <p>Missing evidence: {selectedRun.explanation.missingEvidence.join(", ") || "None"}</p>
                <p>Chain-of-thought exposed: no</p>
              </CardContent>
            </Card>
          </section>
        )}

        <section data-testid="bos-workforce-diagnostics">
          <SectionHeader title="Diagnostics" description="Mismatches stay visible. Nothing is silently repaired." />
          <div className="mt-3 space-y-2">
            {findings.slice(0, 16).map((finding, index) => (
              <div key={`${finding.code}-${index}`} className="flex items-center gap-2 text-sm">
                <StatusChip value={finding.severity}>{finding.code}</StatusChip>
                <span>{finding.message}</span>
              </div>
            ))}
          </div>
        </section>
      </PageMain>
    </>
  );
}
