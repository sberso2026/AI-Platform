"use client";

import { useState } from "react";
import { Button } from "@rtb/ui";
import { parseApiJsonResponse } from "@/lib/api/parse-json-response";

const CATEGORIES = ["Report Bug", "Report UX Issue", "Report Product Gap"] as const;

export function PilotFeedbackPanel({
  projectId,
  page,
}: {
  projectId: string;
  page: string;
}) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("Report Bug");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState("medium");
  const [objectRef, setObjectRef] = useState("");
  const [reference, setReference] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  if (!open) {
    return (
      <div className="space-y-1" data-testid="pilot-feedback-trigger">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Pilot feedback</p>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            className="block w-full rounded px-2 py-1.5 text-left text-xs text-slate-300 hover:bg-slate-800"
            onClick={() => {
              setCategory(c);
              setOpen(true);
            }}
          >
            {c}
          </button>
        ))}
      </div>
    );
  }

  return (
    <form
      className="space-y-2"
      data-testid="pilot-feedback-form"
      onSubmit={async (e) => {
        e.preventDefault();
        setSaving(true);
        setStatus(null);
        const res = await fetch(`/api/engineering/projects/${projectId}/workspace`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "feedback",
            category,
            description,
            severity,
            objectRef,
            reference,
            page,
          }),
        });
        const parsed = await parseApiJsonResponse(res);
        setSaving(false);
        if (!parsed.ok) {
          setStatus(parsed.errorMessage ?? "Failed to submit feedback");
          return;
        }
        setStatus("Feedback recorded");
        setDescription("");
        setOpen(false);
      }}
    >
      <p className="text-xs font-semibold text-slate-200">{category}</p>
      <label className="block text-[11px] text-slate-400">
        Object
        <input
          className="mt-1 w-full rounded border border-slate-600 bg-slate-900 px-2 py-1.5 text-xs text-slate-100"
          value={objectRef}
          onChange={(e) => setObjectRef(e.target.value)}
        />
      </label>
      <label className="block text-[11px] text-slate-400">
        Description
        <textarea
          required
          className="mt-1 min-h-16 w-full rounded border border-slate-600 bg-slate-900 px-2 py-1.5 text-xs text-slate-100"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </label>
      <label className="block text-[11px] text-slate-400">
        Severity
        <select
          className="mt-1 w-full rounded border border-slate-600 bg-slate-900 px-2 py-1.5 text-xs text-slate-100"
          value={severity}
          onChange={(e) => setSeverity(e.target.value)}
        >
          <option value="low">low</option>
          <option value="medium">medium</option>
          <option value="high">high</option>
        </select>
      </label>
      <label className="block text-[11px] text-slate-400">
        Screenshot / reference
        <input
          className="mt-1 w-full rounded border border-slate-600 bg-slate-900 px-2 py-1.5 text-xs text-slate-100"
          value={reference}
          onChange={(e) => setReference(e.target.value)}
        />
      </label>
      {status ? <p className="text-xs text-amber-200">{status}</p> : null}
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={saving}>
          {saving ? "Sending…" : "Submit"}
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
