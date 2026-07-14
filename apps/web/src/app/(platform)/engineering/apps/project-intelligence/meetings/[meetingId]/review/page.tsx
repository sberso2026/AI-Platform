"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Proposal = {
  id: string;
  proposal_type: string;
  title: string;
  description: string | null;
  review_state: string;
  confidence: number | null;
  transcript_segment_ids?: string[] | null;
  document_citations?: unknown;
};

export default function MeetingReviewPage() {
  const params = useParams<{ meetingId: string }>();
  const meetingId = params.meetingId;
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [error, setError] = useState<string>();
  const [message, setMessage] = useState<string>();

  const reload = useCallback(async () => {
    const response = await fetch(
      `/api/engineering/project-intelligence/meetings/${meetingId}/proposals`,
    );
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error?.message ?? "Load failed");
    setProposals(payload.data ?? []);
  }, [meetingId]);

  useEffect(() => {
    reload().catch((reason) => setError(reason.message));
  }, [reload]);

  async function act(proposalId: string, action: "approve" | "reject" | "request-changes" | "convert-to-core") {
    setError(undefined);
    setMessage(undefined);
    const notes =
      action === "approve" || action === "reject" || action === "request-changes"
        ? window.prompt("Notes (optional)", "") ?? undefined
        : undefined;
    const response = await fetch(
      `/api/engineering/project-intelligence/meetings/${meetingId}/proposals/${proposalId}/${action}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(notes ? { notes } : {}),
      },
    );
    const payload = await response.json();
    if (!response.ok) {
      setError(payload.error?.message ?? `${action} failed`);
      return;
    }
    setMessage(`${action} succeeded for ${proposalId}`);
    await reload();
  }

  return (
    <section data-testid="project-intelligence-meeting-review">
      <h2 className="text-2xl font-semibold text-slate-900">Proposal review</h2>
      <p className="mt-2 text-slate-600">
        Human review only. AI cannot approve, reject, or write to Engineering Core.
      </p>

      <ul className="mt-6 space-y-4" data-testid="meeting-proposals-list">
        {proposals.map((proposal) => (
          <li
            key={proposal.id}
            className="rounded border border-slate-200 p-4"
            data-testid={`proposal-card-${proposal.id}`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm text-cyan-700">
                  {proposal.proposal_type} · {proposal.review_state}
                </p>
                <h3 className="font-semibold text-slate-900">{proposal.title}</h3>
                <p className="mt-1 text-sm text-slate-700">{proposal.description ?? "—"}</p>
                <p
                  className="mt-2 text-xs text-slate-500"
                  data-testid={`proposal-transcript-evidence-${proposal.id}`}
                >
                  Transcript evidence: {(proposal.transcript_segment_ids ?? []).length} segment(s)
                </p>
                <div
                  className="mt-1 text-xs text-slate-500"
                  data-testid={`proposal-document-citations-${proposal.id}`}
                >
                  Document citations:{" "}
                  {Array.isArray(proposal.document_citations) && proposal.document_citations.length > 0
                    ? `${proposal.document_citations.length} citation(s)`
                    : "none (abstained or not grounded)"}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 text-sm">
                <button
                  type="button"
                  className="rounded border px-2 py-1"
                  data-testid={`proposal-approve-${proposal.id}`}
                  onClick={() => act(proposal.id, "approve")}
                >
                  Approve
                </button>
                <button
                  type="button"
                  className="rounded border px-2 py-1"
                  data-testid={`proposal-reject-${proposal.id}`}
                  onClick={() => act(proposal.id, "reject")}
                >
                  Reject
                </button>
                <button
                  type="button"
                  className="rounded border px-2 py-1"
                  data-testid={`proposal-request-changes-${proposal.id}`}
                  onClick={() => act(proposal.id, "request-changes")}
                >
                  Request changes
                </button>
                <button
                  type="button"
                  className="rounded bg-slate-900 px-2 py-1 text-white"
                  data-testid={`proposal-convert-${proposal.id}`}
                  onClick={() => act(proposal.id, "convert-to-core")}
                >
                  Convert to Core
                </button>
              </div>
            </div>
          </li>
        ))}
        {proposals.length === 0 && (
          <li className="text-slate-500" data-testid="meeting-proposals-empty">
            No proposals yet. Enqueue processing after the meeting ends.
          </li>
        )}
      </ul>

      {message && <p className="mt-4 text-green-700">{message}</p>}
      {error && <p className="mt-4 text-red-700" role="alert">{error}</p>}
    </section>
  );
}
