"use client";

import { useState } from "react";
import { Button, Input } from "@rtb/ui";
import type { CommercialLicense, CommercialSubscription } from "@rtb/types";
import { CommerceConfirmAction } from "./commerce-confirm-action";

export function LicenseIssueDialog({
  subscriptions,
  products,
  onIssued,
}: {
  subscriptions: CommercialSubscription[];
  products: Array<{ id: string; slug: string; name: string }>;
  onIssued: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [subscriptionId, setSubscriptionId] = useState("");
  const [productId, setProductId] = useState("");
  const [workspaceId, setWorkspaceId] = useState("");
  const [seatLimit, setSeatLimit] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function issue() {
    if (!subscriptionId || !productId) {
      setError("Subscription and product are required.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/platform/commerce/licenses/issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscriptionId,
          productId,
          workspaceId: workspaceId || undefined,
          seatLimit: seatLimit ? Number(seatLimit) : undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Issue failed");
        return;
      }
      setOpen(false);
      onIssued();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Issue failed");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <Button size="sm" onClick={() => setOpen(true)} data-testid="issue-licence">
        Issue Licence
      </Button>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold text-slate-800">Issue licence</h3>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="text-sm">
          <span className="mb-1 block text-slate-600">Subscription</span>
          <select
            className="w-full rounded-md border border-border px-2 py-1.5 text-sm"
            value={subscriptionId}
            onChange={(e) => setSubscriptionId(e.target.value)}
          >
            <option value="">Select subscription…</option>
            {subscriptions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.id.slice(0, 8)} — {s.status}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-slate-600">Product</span>
          <select
            className="w-full rounded-md border border-border px-2 py-1.5 text-sm"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
          >
            <option value="">Select product…</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-slate-600">Workspace ID (optional)</span>
          <Input value={workspaceId} onChange={(e) => setWorkspaceId(e.target.value)} />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-slate-600">Seat limit (optional)</span>
          <Input type="number" value={seatLimit} onChange={(e) => setSeatLimit(e.target.value)} />
        </label>
      </div>
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
      <div className="mt-4 flex gap-2">
        <Button size="sm" onClick={issue} disabled={loading}>
          {loading ? "Issuing…" : "Issue"}
        </Button>
        <Button size="sm" variant="outline" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

export function LicenseRowActions({
  license,
  onChanged,
}: {
  license: CommercialLicense;
  onChanged: () => void;
}) {
  const [error, setError] = useState<string | null>(null);

  async function runAction(action: "suspend" | "revoke") {
    setError(null);
    const res = await fetch(`/api/platform/commerce/licenses/${license.id}/${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(action === "revoke" ? { reason: "Admin action" } : {}),
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error ?? "Action failed");
      return;
    }
    onChanged();
  }

  const canSuspend = license.status === "active" || license.status === "expiring_soon";
  const canRevoke = license.status !== "revoked" && license.status !== "cancelled";

  return (
    <div className="space-y-1">
      <div className="flex flex-wrap gap-1">
        {canSuspend && (
          <CommerceConfirmAction
            label="Suspend"
            confirmMessage={`Suspend licence ${license.id.slice(0, 8)}?`}
            onConfirm={() => runAction("suspend")}
          />
        )}
        {canRevoke && (
          <CommerceConfirmAction
            label="Revoke"
            variant="destructive"
            confirmMessage={`Revoke licence ${license.id.slice(0, 8)}? This cannot be undone.`}
            onConfirm={() => runAction("revoke")}
          />
        )}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
