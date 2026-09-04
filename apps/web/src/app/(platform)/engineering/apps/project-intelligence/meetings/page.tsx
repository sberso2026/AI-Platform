"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { EmptyState } from "@rtb/ui";
import { PiErrorState, PiLoadingSkeleton } from "@/components/engineering/pi-page-chrome";
import { PI_BASE_PATH, withPiProjectQuery } from "@/components/engineering/pi-project-context";
import { meetingStatusLabel } from "@/components/engineering/pi-ux";

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

type ListedProject = { id: string; project_code: string; project_name: string };

export default function MeetingsListPage() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId") ?? "";
  const [meetings, setMeetings] = useState<MeetingRow[]>([]);
  const [projects, setProjects] = useState<ListedProject[]>([]);
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/engineering/project-intelligence/meetings").then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error?.message ?? "Unable to load meetings");
        return (payload.data ?? []) as MeetingRow[];
      }),
      fetch("/api/engineering/projects").then(async (response) => {
        const payload = await response.json();
        if (!response.ok) return [] as ListedProject[];
        return (payload.data ?? []) as ListedProject[];
      }),
    ])
      .then(([nextMeetings, nextProjects]) => {
        setMeetings(nextMeetings);
        setProjects(nextProjects);
      })
      .catch((reason) => setError(reason instanceof Error ? reason.message : "Unable to load meetings"))
      .finally(() => setLoading(false));
  }, []);

  const visible = useMemo(
    () => meetings.filter((meeting) => !projectId || meeting.engineering_project_id === projectId),
    [meetings, projectId],
  );

  const projectName = (id: string | null) => {
    if (!id) return "Unassigned";
    const match = projects.find((project) => project.id === id);
    return match ? `${match.project_code} — ${match.project_name}` : "Selected project";
  };

  if (loading) {
    return (
      <section>
        <h2 className="text-2xl font-semibold text-slate-900">Meetings</h2>
        <div className="mt-4">
          <PiLoadingSkeleton label="Loading meetings…" />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section>
        <h2 className="text-2xl font-semibold text-slate-900">Meetings</h2>
        <div className="mt-4">
          <PiErrorState title="Meetings unavailable" description={error} />
        </div>
      </section>
    );
  }

  const followUp = visible.filter((meeting) =>
    ["review_required", "open", "in_review", "actions_open"].includes(meeting.status),
  );

  return (
    <section data-testid="meeting-intelligence-ready">
      <div data-testid="project-intelligence-meetings-ready">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-cyan-700">Engineering drill-down</p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-900">Meeting Intelligence</h2>
            <p className="mt-2 max-w-3xl text-slate-600">
              Meetings analyzed, actions and decisions identified, unresolved or overdue commitments, and
              follow-up required. Manual capture is a fallback, not the primary value.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link
              className="rounded-md bg-slate-900 px-3 py-2 text-white"
              href={withPiProjectQuery(`${PI_BASE_PATH}/meetings/new`, projectId)}
              data-testid="project-intelligence-meetings-new-link"
            >
              New meeting
            </Link>
            <Link className="text-cyan-700 hover:underline" href={withPiProjectQuery(`${PI_BASE_PATH}/engineering`, projectId)}>
              Engineering
            </Link>
            <Link className="text-cyan-700 hover:underline" href="/engineering/apps/project-intelligence/diagnostics">
              Diagnostics
            </Link>
            <Link className="text-cyan-700 hover:underline" href={withPiProjectQuery(`${PI_BASE_PATH}/findings`, projectId)}>
              Findings
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4 text-sm">
          <p className="rounded-md border border-slate-200 px-4 py-3">{visible.length} meetings analyzed or captured</p>
          <p className="rounded-md border border-slate-200 px-4 py-3">{followUp.length} follow-up required</p>
          <p className="rounded-md border border-slate-200 px-4 py-3">
            Actions and decisions are identified from published meeting evidence where available.
          </p>
          <p className="rounded-md border border-slate-200 px-4 py-3">
            Source systems remain authoritative for minutes where connected.
          </p>
        </div>

        {visible.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              title="No meetings have been captured or connected yet."
              description="Connect a meeting source or use manual capture as a fallback."
              action={
                <Link
                  className="text-sm font-medium text-cyan-800 hover:underline"
                  href={withPiProjectQuery(`${PI_BASE_PATH}/meetings/new`, projectId)}
                >
                  New meeting
                </Link>
              }
            />
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-3 py-2">Title</th>
                  <th className="px-3 py-2">Project</th>
                  <th className="px-3 py-2">Scheduled</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Privacy</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((meeting) => (
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
                    <td className="px-3 py-2">{projectName(meeting.engineering_project_id)}</td>
                    <td className="px-3 py-2">{meeting.scheduled_start_at ?? "—"}</td>
                    <td className="px-3 py-2" data-testid={`meeting-status-${meeting.status}`}>
                      {meetingStatusLabel(meeting.status)}
                    </td>
                    <td className="px-3 py-2">{meeting.privacy_classification}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="mt-4 text-sm text-slate-500" data-testid="project-intelligence-meetings-providers-disabled">
          Live join for Teams, Zoom, and Google Meet is unavailable. Provider configuration is under Diagnostics.
        </p>
      </div>
    </section>
  );
}
