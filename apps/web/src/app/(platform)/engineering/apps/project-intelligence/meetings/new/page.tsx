"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function NewMeetingPage() {
  const router = useRouter();
  const [error, setError] = useState<string>();
  const [saving, setSaving] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(undefined);
    const form = new FormData(event.currentTarget);
    const body = {
      title: String(form.get("title") ?? ""),
      engineeringProjectId: String(form.get("engineeringProjectId") || "") || null,
      agenda: String(form.get("agenda") ?? "") || null,
      scheduledStartAt: String(form.get("scheduledStartAt") || "") || null,
      scheduledEndAt: String(form.get("scheduledEndAt") || "") || null,
      provider: "manual",
      recordingNoticeRequired: String(form.get("recordingNoticeRequired") ?? "unknown"),
      recordingNoticeText: String(form.get("recordingNoticeText") ?? "") || null,
      consentPolicy: String(form.get("consentPolicy") ?? "") || null,
      consentStatus: String(form.get("consentStatus") ?? "not_requested"),
      jurisdiction: String(form.get("jurisdiction") ?? "") || null,
      retentionPolicyId: String(form.get("retentionPolicyId") ?? "") || null,
      privacyClassification: String(form.get("privacyClassification") ?? "internal"),
    };

    try {
      const response = await fetch("/api/engineering/project-intelligence/meetings", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error?.message ?? "Create failed");
      router.push(`/engineering/apps/project-intelligence/meetings/${payload.data.id}`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Create failed");
      setSaving(false);
    }
  }

  return (
    <section data-testid="project-intelligence-meetings-new">
      <h2 className="text-2xl font-semibold text-slate-900">New meeting</h2>
      <p className="mt-2 text-slate-600">Manual provider only. External providers unavailable.</p>
      <form className="mt-6 max-w-xl space-y-4" onSubmit={onSubmit}>
        <label className="block text-sm">
          Title
          <input name="title" required className="mt-1 w-full rounded border px-3 py-2" data-testid="meeting-title-input" />
        </label>
        <label className="block text-sm">
          Project ID
          <input name="engineeringProjectId" className="mt-1 w-full rounded border px-3 py-2" />
        </label>
        <label className="block text-sm">
          Scheduled start
          <input name="scheduledStartAt" type="datetime-local" className="mt-1 w-full rounded border px-3 py-2" />
        </label>
        <label className="block text-sm">
          Scheduled end
          <input name="scheduledEndAt" type="datetime-local" className="mt-1 w-full rounded border px-3 py-2" />
        </label>
        <label className="block text-sm">
          Agenda
          <textarea name="agenda" className="mt-1 w-full rounded border px-3 py-2" rows={3} />
        </label>
        <label className="block text-sm">
          Provider
          <input name="provider" value="manual" readOnly className="mt-1 w-full rounded border bg-slate-50 px-3 py-2" />
        </label>
        <label className="block text-sm">
          Privacy classification
          <select name="privacyClassification" className="mt-1 w-full rounded border px-3 py-2" defaultValue="internal">
            <option value="public">public</option>
            <option value="internal">internal</option>
            <option value="confidential">confidential</option>
            <option value="restricted">restricted</option>
          </select>
        </label>
        <label className="block text-sm">
          Recording notice
          <select name="recordingNoticeRequired" className="mt-1 w-full rounded border px-3 py-2" defaultValue="unknown">
            <option value="required">required</option>
            <option value="not_required">not_required</option>
            <option value="unknown">unknown</option>
          </select>
        </label>
        <label className="block text-sm">
          Recording notice text
          <input name="recordingNoticeText" className="mt-1 w-full rounded border px-3 py-2" />
        </label>
        <label className="block text-sm">
          Consent policy
          <input name="consentPolicy" className="mt-1 w-full rounded border px-3 py-2" />
        </label>
        <label className="block text-sm">
          Consent status
          <select name="consentStatus" className="mt-1 w-full rounded border px-3 py-2" defaultValue="not_requested">
            <option value="not_requested">not_requested</option>
            <option value="pending">pending</option>
            <option value="granted">granted</option>
            <option value="declined">declined</option>
            <option value="withdrawn">withdrawn</option>
            <option value="not_applicable">not_applicable</option>
          </select>
        </label>
        <label className="block text-sm">
          Jurisdiction
          <input name="jurisdiction" className="mt-1 w-full rounded border px-3 py-2" />
        </label>
        <label className="block text-sm">
          Retention policy ID
          <input name="retentionPolicyId" className="mt-1 w-full rounded border px-3 py-2" />
        </label>
        {error && <p className="text-red-700" role="alert">{error}</p>}
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-slate-900 px-4 py-2 text-white disabled:opacity-60"
          data-testid="meeting-create-submit"
        >
          {saving ? "Creating…" : "Create draft"}
        </button>
      </form>
    </section>
  );
}
