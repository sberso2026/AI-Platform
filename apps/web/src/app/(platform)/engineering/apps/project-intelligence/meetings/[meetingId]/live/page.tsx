"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Meeting = { id: string; title: string; status: string; state_version: number };
type Participant = { id: string; display_name: string; speaker_id: string | null; consent_status: string };
type Segment = {
  id: string;
  sequence_number: number;
  speaker_label: string | null;
  text: string;
  start_time_ms: number;
  end_time_ms: number;
};

export default function MeetingLivePage() {
  const params = useParams<{ meetingId: string }>();
  const meetingId = params.meetingId;
  const [meeting, setMeeting] = useState<Meeting>();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [error, setError] = useState<string>();

  const reload = useCallback(async () => {
    const [m, p, t] = await Promise.all([
      fetch(`/api/engineering/project-intelligence/meetings/${meetingId}`),
      fetch(`/api/engineering/project-intelligence/meetings/${meetingId}/participants`),
      fetch(`/api/engineering/project-intelligence/meetings/${meetingId}/transcript`),
    ]);
    const meetingPayload = await m.json();
    if (!m.ok) throw new Error(meetingPayload.error?.message ?? "Load failed");
    setMeeting(meetingPayload.data);
    setParticipants((await p.json()).data ?? []);
    setSegments((await t.json()).data ?? []);
  }, [meetingId]);

  useEffect(() => {
    reload().catch((reason) => setError(reason.message));
  }, [reload]);

  async function transition(toStatus: string) {
    if (!meeting) return;
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
    await reload();
  }

  async function onAppend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await fetch(
      `/api/engineering/project-intelligence/meetings/${meetingId}/transcript`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          providerEventId: String(form.get("providerEventId") || `manual-${Date.now()}`),
          text: String(form.get("text") ?? ""),
          startTimeMs: Number(form.get("startTimeMs") ?? 0),
          endTimeMs: Number(form.get("endTimeMs") ?? 1000),
          speakerLabel: String(form.get("speakerLabel") ?? "") || null,
        }),
      },
    );
    const payload = await response.json();
    if (!response.ok) {
      setError(payload.error?.message ?? "Append failed");
      return;
    }
    event.currentTarget.reset();
    await reload();
  }

  async function updateConsent(participantId: string) {
    const consentStatus = window.prompt("Consent status", "granted");
    if (!consentStatus) return;
    const response = await fetch(
      `/api/engineering/project-intelligence/meetings/${meetingId}/participants/${participantId}`,
      {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ consentStatus }),
      },
    );
    if (!response.ok) {
      const payload = await response.json();
      setError(payload.error?.message ?? "Consent update failed");
      return;
    }
    await reload();
  }

  if (!meeting) return <p role="status">Loading live meeting…</p>;

  return (
    <section data-testid="project-intelligence-meeting-live">
      <h2 className="text-2xl font-semibold text-slate-900">{meeting.title}</h2>
      <p className="mt-2 text-slate-600" data-testid={`meeting-live-status-${meeting.status}`}>
        Manual state: {meeting.status}. No fake realtime provider indicator.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {["connecting", "connected", "recording", "live", "paused", "ended"].map((status) => (
          <button
            key={status}
            type="button"
            className="rounded border px-3 py-1 text-sm"
            data-testid={`live-transition-${status}`}
            onClick={() => transition(status)}
          >
            {status}
          </button>
        ))}
      </div>

      <p className="mt-3 text-sm text-slate-500" data-testid="external-providers-unavailable">
        External provider controls unavailable
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div>
          <h3 className="font-semibold">Roster</h3>
          <ul className="mt-2 space-y-2 text-sm" data-testid="live-participants">
            {participants.map((participant) => (
              <li key={participant.id} className="flex items-center justify-between gap-2">
                <span>
                  {participant.display_name} ({participant.consent_status})
                </span>
                <button
                  type="button"
                  className="text-cyan-700"
                  onClick={() => updateConsent(participant.id)}
                  data-testid={`participant-consent-${participant.id}`}
                >
                  Consent
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-semibold">Append transcript</h3>
          <form className="mt-2 space-y-2" onSubmit={onAppend} data-testid="transcript-append-form">
            <input name="providerEventId" placeholder="provider event id" className="w-full rounded border px-2 py-1 text-sm" />
            <input name="speakerLabel" placeholder="speaker" className="w-full rounded border px-2 py-1 text-sm" />
            <input name="startTimeMs" type="number" defaultValue={0} className="w-full rounded border px-2 py-1 text-sm" />
            <input name="endTimeMs" type="number" defaultValue={1000} className="w-full rounded border px-2 py-1 text-sm" />
            <textarea name="text" required className="w-full rounded border px-2 py-1 text-sm" rows={3} />
            <button type="submit" className="rounded bg-slate-900 px-3 py-1 text-sm text-white">
              Append
            </button>
          </form>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="font-semibold">Transcript stream</h3>
        <ol className="mt-2 space-y-1 text-sm" data-testid="live-transcript-stream">
          {segments.map((segment) => (
            <li key={segment.id}>
              #{segment.sequence_number} [{segment.start_time_ms}-{segment.end_time_ms}ms]{" "}
              {segment.speaker_label ?? "speaker"}: {segment.text}
            </li>
          ))}
        </ol>
      </div>

      {error && <p className="mt-4 text-red-700" role="alert">{error}</p>}
    </section>
  );
}
