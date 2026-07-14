"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Minutes = {
  id: string;
  status: string;
  current_version: number;
  approved_at: string | null;
  issued_at: string | null;
};

type MinutesVersion = {
  id: string;
  minutes_id: string;
  version_number: number;
  status: string;
  body_markdown: string | null;
  content_hash: string | null;
};

export default function MeetingMinutesPage() {
  const params = useParams<{ meetingId: string }>();
  const meetingId = params.meetingId;
  const [minutes, setMinutes] = useState<Minutes[]>([]);
  const [versions, setVersions] = useState<MinutesVersion[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<MinutesVersion>();
  const [error, setError] = useState<string>();
  const [message, setMessage] = useState<string>();

  const reload = useCallback(async () => {
    const [minutesRes, versionsRes] = await Promise.all([
      fetch(`/api/engineering/project-intelligence/meetings/${meetingId}/minutes`),
      fetch(`/api/engineering/project-intelligence/meetings/${meetingId}/minutes/versions`),
    ]);
    const minutesPayload = await minutesRes.json();
    if (!minutesRes.ok) throw new Error(minutesPayload.error?.message ?? "Load failed");
    const versionsPayload = await versionsRes.json();
    if (!versionsRes.ok) throw new Error(versionsPayload.error?.message ?? "Versions load failed");
    setMinutes(minutesPayload.data ?? []);
    const nextVersions = versionsPayload.data ?? [];
    setVersions(nextVersions);
    setSelectedVersion(nextVersions.at(-1));
  }, [meetingId]);

  useEffect(() => {
    reload().catch((reason) => setError(reason.message));
  }, [reload]);

  async function generate() {
    setError(undefined);
    const response = await fetch(
      `/api/engineering/project-intelligence/meetings/${meetingId}/minutes/generate`,
      { method: "POST", headers: { "content-type": "application/json" }, body: "{}" },
    );
    const payload = await response.json();
    if (!response.ok) {
      setError(payload.error?.message ?? "Generate failed");
      return;
    }
    setMessage("Minutes generated");
    await reload();
  }

  async function minutesAction(
    minutesId: string,
    action: "submit-review" | "approve" | "request-changes" | "issue",
  ) {
    setError(undefined);
    setMessage(undefined);
    const notes =
      action === "request-changes" ? window.prompt("Change notes", "") ?? undefined : undefined;
    const response = await fetch(
      `/api/engineering/project-intelligence/meetings/${meetingId}/minutes/${minutesId}/${action}`,
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
    setMessage(`${action} succeeded`);
    await reload();
  }

  async function loadVersion(versionId: string) {
    const response = await fetch(
      `/api/engineering/project-intelligence/meetings/${meetingId}/minutes/versions/${versionId}`,
    );
    const payload = await response.json();
    if (!response.ok) {
      setError(payload.error?.message ?? "Version load failed");
      return;
    }
    setSelectedVersion(payload.data);
  }

  const current = minutes[0];

  return (
    <section data-testid="project-intelligence-meeting-minutes">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Minutes</h2>
          <p className="mt-2 text-slate-600">
            Versioned minutes with human approve/issue. No auto-issue.
          </p>
        </div>
        <button
          type="button"
          className="rounded bg-cyan-700 px-3 py-1 text-sm text-white"
          data-testid="minutes-generate"
          onClick={generate}
        >
          Generate minutes
        </button>
      </div>

      {current && (
        <div className="mt-4 rounded border border-slate-200 p-3 text-sm" data-testid="minutes-current">
          <p>
            Status: <span data-testid={`minutes-status-${current.status}`}>{current.status}</span> ·
            version {current.current_version}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded border px-2 py-1"
              data-testid="minutes-submit-review"
              onClick={() => minutesAction(current.id, "submit-review")}
            >
              Submit review
            </button>
            <button
              type="button"
              className="rounded border px-2 py-1"
              data-testid="minutes-approve"
              onClick={() => minutesAction(current.id, "approve")}
            >
              Approve
            </button>
            <button
              type="button"
              className="rounded border px-2 py-1"
              data-testid="minutes-request-changes"
              onClick={() => minutesAction(current.id, "request-changes")}
            >
              Request changes
            </button>
            <button
              type="button"
              className="rounded bg-slate-900 px-2 py-1 text-white"
              data-testid="minutes-issue"
              onClick={() => minutesAction(current.id, "issue")}
            >
              Issue
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[220px_1fr]">
        <div>
          <h3 className="font-semibold">Versions</h3>
          <ul className="mt-2 space-y-1 text-sm" data-testid="minutes-versions-list">
            {versions.map((version) => (
              <li key={version.id}>
                <button
                  type="button"
                  className="text-cyan-700 hover:underline"
                  data-testid={`minutes-version-${version.version_number}`}
                  onClick={() => loadVersion(version.id)}
                >
                  v{version.version_number} · {version.status}
                </button>
              </li>
            ))}
            {versions.length === 0 && <li className="text-slate-500">No versions yet.</li>}
          </ul>
        </div>
        <div>
          <h3 className="font-semibold">Selected version</h3>
          {selectedVersion ? (
            <pre
              className="mt-2 overflow-auto rounded border border-slate-200 bg-slate-50 p-3 text-sm whitespace-pre-wrap"
              data-testid="minutes-version-body"
            >
              {selectedVersion.body_markdown ?? "(empty)"}
            </pre>
          ) : (
            <p className="mt-2 text-slate-500">Select a version to view markdown.</p>
          )}
        </div>
      </div>

      {message && <p className="mt-4 text-green-700">{message}</p>}
      {error && <p className="mt-4 text-red-700" role="alert">{error}</p>}
    </section>
  );
}
