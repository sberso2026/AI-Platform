"use client";

import { useEffect, useState } from "react";

type ReviewItem = {
  id: string;
  title: string;
  reason?: string;
  reviewState: string;
  engineeringDocumentId: string;
};

export default function ProjectIntelligenceDocumentsReviewPage() {
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(true);

  async function load() {
    const response = await fetch("/api/engineering/project-intelligence/documents/review");
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error?.message ?? "Unable to load review queue");
    setItems(payload.data ?? []);
  }

  useEffect(() => {
    load()
      .catch((reason) => setError(reason.message))
      .finally(() => setLoading(false));
  }, []);

  async function act(id: string, action: "approve" | "reject") {
    setError(undefined);
    const response = await fetch(`/api/engineering/project-intelligence/documents/review/${id}/${action}`, {
      method: "POST",
    });
    const payload = await response.json();
    if (!response.ok) {
      setError(payload.error?.message ?? `Unable to ${action} review item`);
      return;
    }
    await load();
  }

  if (loading) {
    return (
      <section>
        <h2 className="text-2xl font-semibold text-slate-900">Review queue</h2>
        <p className="mt-4 text-slate-600" role="status">Loading review items…</p>
      </section>
    );
  }

  return (
    <section data-testid="project-intelligence-documents-review">
      <p className="text-sm font-medium text-cyan-700">Document intelligence</p>
      <h2 className="mt-1 text-2xl font-semibold text-slate-900">Review queue</h2>
      <p className="mt-2 text-slate-600">
        Approving a finding does not write authoritative Engineering Core registers.
      </p>
      {error && <p className="mt-4 text-red-700" role="alert">{error}</p>}
      <ul className="mt-6 space-y-3">
        {items.map((item) => (
          <li key={item.id} className="rounded-lg border border-slate-200 p-4" data-testid={`project-intelligence-review-item-${item.id}`}>
            <p className="font-medium text-slate-900">{item.title}</p>
            <p className="mt-1 text-sm text-slate-600">
              {item.reason ?? "review"} · {item.reviewState} · doc {item.engineeringDocumentId.slice(0, 8)}
            </p>
            <div className="mt-3 space-x-3 text-sm">
              <button className="text-cyan-700 hover:underline" type="button" onClick={() => act(item.id, "approve")}>
                Approve
              </button>
              <button className="text-red-700 hover:underline" type="button" onClick={() => act(item.id, "reject")}>
                Reject
              </button>
            </div>
          </li>
        ))}
        {!items.length && <li className="text-slate-500">No document review items are pending.</li>}
      </ul>
    </section>
  );
}
