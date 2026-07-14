"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type Meeting = {
  id: string;
  title: string;
  status: string;
  state_version: number;
  provider: string;
  consent_status: string;
  privacy_classification: string;
  recording_notice_required: string;
  jurisdiction: string | null;
};

type Participant = { id: string; display_name: string; speaker_id: string | null; consent_status: string };
type MeetingEvent = { id: string; event_type: string; previous_state: string | null; new_state: string | null; occurred_at: string };

const NEXT_ACTIONS: Record<string, string[]> = {
  draft: ["scheduled", "cancelled"],
  scheduled: ["connecting", "cancelled"],
  connecting: ["connected", "failed"],
  connected: ["recording", "failed"],
  recording: ["live", "failed"],
  live: ["paused", "ended", "failed"],
  paused: ["live", "ended"],
  ended: ["archived"],
  failed: ["archived"],
  cancelled: ["archived"],
  review_pending: ["archived"],
  approved: ["archived"],
  completed: ["archived"],
};

export default function MeetingDetailPage() {
  const params = useParams<{ meetingId: string }>();
  const meetingId = params.meetingId;
  const [meeting, setMeeting] = useState<Meeting>();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [events, setEvents] = useState<MeetingEvent[]>([]);
  const [transcriptCount, setTranscriptCount] = useState(0);
  const [error, setError] = useState<string>();
  const [message, setMessage] = useState<string>();

  const reload = useCallback(async () => {
    const [meetingRes, participantsRes, eventsRes, transcriptRes] = await Promise.all([
      fetch(`/api/engineering/project-intelligence/meetings/${meetingId}`),
      fetch(`/api/engineering/project-intelligence/meetings/${meetingId}/participants`),
      fetch(`/api/engineering/project-intelligence/meetings/${meetingId}/events`),
      fetch(`/api/engineering/project-intelligence/meetings/${meetingId}/transcript`),
    ]);
    const meetingPayload = await meetingRes.json();
    if (!meetingRes.ok) throw new Error(meetingPayload.error?.message ?? "Meeting load failed");
    setMeeting(meetingPayload.data);
    setParticipants((await participantsRes.json()).data ?? []);
    setEvents((await eventsRes.json()).data ?? []);
    const transcriptData = (await transcriptRes.json()).data;
    const segments = Array.isArray(transcriptData)
      ? transcriptData
      : (transcriptData?.segments ?? []);
    setTranscriptCount(segments.length);
  }, [meetingId]);

  useEffect(() => {
    reload().catch((reason) => setError(reason.message));
  }, [reload]);

  async function transition(toStatus: string) {
    if (!meeting) return;
    setMessage(undefined);
    setError(undefined);
    const response = await fetch(
      `/api/engineering/project-intelligence/meetings/${meetingId}/transition`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ toStatus, expectedStateVersion: meeting.state_version }),
      },
    );
    const payload = await response.json();
    if (!response.ok) {
      setError(payload.error?.message ?? "Transition failed");
      return;
    }
    setMessage(`Transitioned to ${toStatus}`);
    await reload();
  }

  async function addParticipant() {
    const displayName = window.prompt("Participant display name");
    if (!displayName) return;
    const response = await fetch(
      `/api/engineering/project-intelligence/meetings/${meetingId}/participants`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          displayName,
          externalParticipantId: `manual-${Date.now()}`,
          speakerId: `spk-${Date.now()}`,
        }),
      },
    );
    const payload = await response.json();
    if (!response.ok) {
      setError(payload.error?.message ?? "Add participant failed");
      return;
    }
    await reload();
  }

  if (error && !meeting) {
    return <p className="text-red-700" role="alert">{error}</p>;
  }
  if (!meeting) {
    return <p role="status">Loading meeting…</p>;
  }

  return (
    <section data-testid="project-intelligence-meeting-detail">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-cyan-700">Lifecycle</p>
          <h2 className="text-2xl font-semibold text-slate-900">{meeting.title}</h2>
          <p className="mt-2 text-slate-600" data-testid={`meeting-detail-status-${meeting.status}`}>
            Status: {meeting.status} · Provider: {meeting.provider} · v{meeting.state_version}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          <Link className="text-cyan-700 hover:underline" href={`/engineering/apps/project-intelligence/meetings/${meetingId}/live`}>
            Live controls
          </Link>
          <Link className="text-cyan-700 hover:underline" href={`/engineering/apps/project-intelligence/meetings/${meetingId}/transcript`}>
            Transcript
          </Link>
          <Link className="text-cyan-700 hover:underline" href={`/engineering/apps/project-intelligence/meetings/${meetingId}/review`}>
            Review
          </Link>
          <Link className="text-cyan-700 hover:underline" href={`/engineering/apps/project-intelligence/meetings/${meetingId}/minutes`}>
            Minutes
          </Link>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div>
          <h3 className="font-semibold">Privacy and consent</h3>
          <ul className="mt-2 space-y-1 text-sm text-slate-700">
            <li>Consent: {meeting.consent_status}</li>
            <li>Privacy: {meeting.privacy_classification}</li>
            <li>Recording notice: {meeting.recording_notice_required}</li>
            <li>Jurisdiction: {meeting.jurisdiction ?? "—"}</li>
            <li>Transcript segments: {transcriptCount}</li>
          </ul>
          <div className="mt-4 flex flex-wrap gap-2">
            {(NEXT_ACTIONS[meeting.status] ?? []).map((status) => (
              <button
                key={status}
                type="button"
                className="rounded border px-3 py-1 text-sm"
                data-testid={`meeting-transition-${status}`}
                onClick={() => transition(status)}
              >
                → {status}
              </button>
            ))}
          </div>
          {message && <p className="mt-2 text-green-700">{message}</p>}
          {error && <p className="mt-2 text-red-700" role="alert">{error}</p>}
        </div>

        <div>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Participants</h3>
            <button type="button" className="text-sm text-cyan-700" onClick={addParticipant} data-testid="meeting-add-participant">
              Add participant
            </button>
          </div>
          <ul className="mt-2 space-y-1 text-sm" data-testid="meeting-participants-list">
            {participants.map((participant) => (
              <li key={participant.id}>
                {participant.display_name} · speaker {participant.speaker_id ?? "—"} · consent {participant.consent_status}
              </li>
            ))}
            {participants.length === 0 && <li className="text-slate-500">No participants</li>}
          </ul>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="font-semibold">Events</h3>
        <ul className="mt-2 space-y-1 text-sm text-slate-700" data-testid="meeting-events-list">
          {events.map((event) => (
            <li key={event.id}>
              {event.occurred_at}: {event.event_type} ({event.previous_state ?? "—"} → {event.new_state ?? "—"})
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-6 text-sm text-slate-500">
        External provider controls unavailable: Join Teams / Join Zoom / Join Google Meet.
      </p>
    </section>
  );
}
