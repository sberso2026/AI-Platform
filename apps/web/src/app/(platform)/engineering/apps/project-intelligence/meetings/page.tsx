"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type MeetingRow = {
  id: string;
  title: string;
  engineering_project_id: string | null;
  scheduled_start_at: string | null;
  provider: string;
  status: string;
  organizer_user_id: string | null;
  consent_status: string;
  privacy_classification: string;
};

export default function MeetingsListPage() {
  const [meetings, setMeetings] = useState<MeetingRow[]>([]);
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/engineering/project-intelligence/meetings")
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error?.message ?? "Unable to load meetings");
        setMeetings(payload.data ?? []);
      })
      .catch((reason) => setError(reason.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section>
        <h2 className="text-2xl font-semibold text-slate-900">Meetings</h2>
        <p className="mt-4 text-slate-600" role="status">Loading meetings…</p>
      </section>
    );
  }

  if (error) {
    return (
      <section>
        <h2 className="text-2xl font-semibold text-slate-900">Meetings</h2>
        <p className="mt-4 text-red-700" role="alert">{error}</p>
      </section>
    );
  }

  return (
    <section data-testid="meeting-intelligence-ready">
      <div data-testid="project-intelligence-meetings-ready">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-cyan-700">Meeting Intelligence</p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-900">Meetings</h2>
          <p className="mt-2 text-slate-600">
            Provider-neutral Meeting Intelligence. Manual meetings are certified. Microsoft Teams
            live remains conditionally deferred and is not required for production readiness.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link
            className="rounded-md bg-slate-900 px-3 py-2 text-white"
            href="/engineering/apps/project-intelligence/meetings/new"
            data-testid="project-intelligence-meetings-new-link"
          >
            New meeting
          </Link>
          <Link
            className="text-cyan-700 hover:underline"
            href="/engineering/apps/project-intelligence/meetings/health"
          >
            Health
          </Link>
          <Link
            className="text-cyan-700 hover:underline"
            href="/engineering/apps/project-intelligence/meetings/settings/providers"
            data-testid="meetings-providers-settings-link"
          >
            Providers
          </Link>
          <Link className="text-cyan-700 hover:underline" href="/engineering/apps/project-intelligence/findings">
            Findings handoff
          </Link>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-3 py-2">Title</th>
              <th className="px-3 py-2">Project</th>
              <th className="px-3 py-2">Scheduled</th>
              <th className="px-3 py-2">Provider</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Organizer</th>
              <th className="px-3 py-2">Consent</th>
              <th className="px-3 py-2">Privacy</th>
            </tr>
          </thead>
          <tbody>
            {meetings.map((meeting) => (
              <tr key={meeting.id} className="border-t border-slate-100">
                <td className="px-3 py-2">
                  <Link
                    className="text-cyan-700 hover:underline"
                    href={`/engineering/apps/project-intelligence/meetings/${meeting.id}`}
                    data-testid={`project-intelligence-meeting-row-${meeting.id}`}
                  >
                    {meeting.title}
                  </Link>
                </td>
                <td className="px-3 py-2">{meeting.engineering_project_id ?? "—"}</td>
                <td className="px-3 py-2">{meeting.scheduled_start_at ?? "—"}</td>
                <td className="px-3 py-2">{meeting.provider}</td>
                <td className="px-3 py-2" data-testid={`meeting-status-${meeting.status}`}>
                  {meeting.status}
                </td>
                <td className="px-3 py-2">{meeting.organizer_user_id ?? "—"}</td>
                <td className="px-3 py-2">{meeting.consent_status}</td>
                <td className="px-3 py-2">{meeting.privacy_classification}</td>
              </tr>
            ))}
            {meetings.length === 0 && (
              <tr>
                <td className="px-3 py-6 text-slate-500" colSpan={8}>
                  No meetings yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-sm text-slate-500" data-testid="project-intelligence-meetings-providers-disabled">
        Join Teams, Join Zoom, and Join Google Meet are unavailable. Teams live is not production-ready.
      </p>
      </div>
    </section>
  );
}
