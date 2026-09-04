"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { PiErrorState } from "@/components/engineering/pi-page-chrome";

type ListedProject = { id: string; project_code: string; project_name: string };

export default function NewMeetingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedProjectId = searchParams.get("projectId") ?? "";
  const [projects, setProjects] = useState<ListedProject[]>([]);
  const [error, setError] = useState<string>();
  const [saving, setSaving] = useState(false);
  const [projectValue, setProjectValue] = useState(selectedProjectId);

  useEffect(() => {
    setProjectValue(selectedProjectId);
  }, [selectedProjectId]);

  useEffect(() => {
    fetch("/api/engineering/projects")
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error?.message ?? "Unable to load projects");
        setProjects(payload.data ?? []);
      })
      .catch((reason) => setError(reason instanceof Error ? reason.message : "Unable to load projects"));
  }, []);

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
      recordingNoticeRequired: String(form.get("recordingNoticeRequired") ?? "unknown"),
      recordingNoticeText: String(form.get("recordingNoticeText") ?? "") || null,
      consentPolicy: String(form.get("consentPolicy") ?? "") || null,
      consentStatus: String(form.get("consentStatus") ?? "not_requested"),
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
      <p className="mt-2 text-slate-600">
        Manual capture fallback. Inherit the selected project. Live providers remain under Diagnostics.
      </p>
      <form className="mt-6 max-w-xl space-y-4" onSubmit={onSubmit}>
        <label className="block text-sm">
          Title
          <input name="title" required className="mt-1 w-full rounded border px-3 py-2" data-testid="meeting-title-input" />
        </label>
        <label className="block text-sm">
          Project
          <select
            name="engineeringProjectId"
            required
            className="mt-1 w-full rounded border px-3 py-2"
            value={projectValue}
            onChange={(event) => setProjectValue(event.target.value)}
            data-testid="meeting-project-select"
          >
            <option value="">Select a project</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.project_code} — {project.project_name}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          Start
          <input name="scheduledStartAt" type="datetime-local" className="mt-1 w-full rounded border px-3 py-2" />
        </label>
        <label className="block text-sm">
          End
          <input name="scheduledEndAt" type="datetime-local" className="mt-1 w-full rounded border px-3 py-2" />
        </label>
        <label className="block text-sm">
          Agenda
          <textarea name="agenda" className="mt-1 w-full rounded border px-3 py-2" rows={3} />
        </label>
        <label className="block text-sm">
          Privacy
          <select name="privacyClassification" className="mt-1 w-full rounded border px-3 py-2" defaultValue="internal">
            <option value="public">Public</option>
            <option value="internal">Internal</option>
            <option value="confidential">Confidential</option>
            <option value="restricted">Restricted</option>
          </select>
        </label>
        <details className="rounded-md border border-slate-200 px-3 py-2 text-sm">
          <summary className="cursor-pointer font-medium text-slate-800">Recording and consent</summary>
          <div className="mt-3 space-y-3">
            <label className="block text-sm">
              Recording notice
              <select name="recordingNoticeRequired" className="mt-1 w-full rounded border px-3 py-2" defaultValue="unknown">
                <option value="required">Required</option>
                <option value="not_required">Not required</option>
                <option value="unknown">Unknown</option>
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
                <option value="not_requested">Not requested</option>
                <option value="pending">Pending</option>
                <option value="granted">Granted</option>
                <option value="declined">Declined</option>
                <option value="withdrawn">Withdrawn</option>
                <option value="not_applicable">Not applicable</option>
              </select>
            </label>
          </div>
        </details>
        {error && <PiErrorState title="Could not create meeting" description={error} />}
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
