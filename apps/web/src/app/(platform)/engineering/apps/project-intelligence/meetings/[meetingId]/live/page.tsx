"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";

type Meeting = { id: string; title: string; status: string; state_version: number };
type Participant = { id: string; display_name: string; speaker_id: string | null; consent_status: string };
type Segment = {
  id: string;
  logicalSequence?: number;
  sequence_number?: number;
  sequenceNumber?: number;
  speaker_label?: string | null;
  speakerLabel?: string | null;
  text: string;
  start_time_ms?: number;
  startTimeMs?: number;
  end_time_ms?: number;
  endTimeMs?: number;
};
type Gap = { afterLogicalSequence: number; beforeLogicalSequence: number; gapSize: number };
type ProcessingStatus = {
  meetingStatus: string;
  processingRunStatus: string | null;
  jobStatus: string | null;
  canRetry: boolean;
  lastErrorMessage: string | null;
};

type ConnectionStatus = "manual" | "polling" | "offline";

function logicalSeq(segment: Segment): number {
  return Number(segment.logicalSequence ?? segment.sequence_number ?? segment.sequenceNumber ?? 0);
}

function normalizeSegments(payload: unknown): { segments: Segment[]; gaps: Gap[] } {
  if (Array.isArray(payload)) return { segments: payload, gaps: [] };
  if (payload && typeof payload === "object") {
    const record = payload as { segments?: Segment[]; gaps?: Gap[] };
    return { segments: record.segments ?? [], gaps: record.gaps ?? [] };
  }
  return { segments: [], gaps: [] };
}

export default function MeetingLivePage() {
  const params = useParams<{ meetingId: string }>();
  const meetingId = params.meetingId;
  const [meeting, setMeeting] = useState<Meeting>();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [gaps, setGaps] = useState<Gap[]>([]);
  const [processing, setProcessing] = useState<ProcessingStatus>();
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("manual");
  const [reconnectStatus, setReconnectStatus] = useState<"idle" | "retrying" | "recovered">("idle");
  const [error, setError] = useState<string>();
  const pollAttempts = useRef(0);

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
    const transcriptPayload = await t.json();
    const normalized = normalizeSegments(transcriptPayload.data);
    setSegments(normalized.segments);
    setGaps(normalized.gaps);

    if (
      meetingPayload.data?.status === "ended"
      || meetingPayload.data?.status === "processing"
      || meetingPayload.data?.status === "failed"
      || meetingPayload.data?.status === "minutes_draft"
      || meetingPayload.data?.status === "review_pending"
    ) {
      const statusRes = await fetch(
        `/api/engineering/project-intelligence/meetings/${meetingId}/processing-status`,
      );
      if (statusRes.ok) {
        setProcessing((await statusRes.json()).data);
      }
    } else {
      setProcessing(undefined);
    }
  }, [meetingId]);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    async function tick() {
      try {
        await reload();
        if (cancelled) return;
        setReconnectStatus(pollAttempts.current > 0 ? "recovered" : "idle");
        pollAttempts.current = 0;
        setConnectionStatus("polling");
        timer = setTimeout(tick, 4000);
      } catch (reason) {
        if (cancelled) return;
        pollAttempts.current += 1;
        setConnectionStatus("offline");
        setReconnectStatus("retrying");
        setError(reason instanceof Error ? reason.message : String(reason));
        const delay = Math.min(15_000, 250 * 2 ** Math.min(pollAttempts.current, 6));
        timer = setTimeout(tick, delay);
      }
    }

    setConnectionStatus("manual");
    tick();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
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

  async function enqueueProcess() {
    const response = await fetch(
      `/api/engineering/project-intelligence/meetings/${meetingId}/process`,
      { method: "POST" },
    );
    const payload = await response.json();
    if (!response.ok) {
      setError(payload.error?.message ?? "Enqueue failed");
      return;
    }
    await reload();
  }

  async function retryProcess() {
    const response = await fetch(
      `/api/engineering/project-intelligence/meetings/${meetingId}/retry-processing`,
      { method: "POST" },
    );
    const payload = await response.json();
    if (!response.ok) {
      setError(payload.error?.message ?? "Retry failed");
      return;
    }
    await reload();
  }

  async function onAppend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const response = await fetch(
      `/api/engineering/project-intelligence/meetings/${meetingId}/transcript`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          providerEventId: String(formData.get("providerEventId") || `manual-${Date.now()}`),
          text: String(formData.get("text") ?? ""),
          startTimeMs: Number(formData.get("startTimeMs") ?? 0),
          endTimeMs: Number(formData.get("endTimeMs") ?? 1000),
          speakerLabel: String(formData.get("speakerLabel") ?? "") || null,
        }),
      },
    );
    const payload = await response.json();
    if (!response.ok) {
      setError(payload.error?.message ?? "Append failed");
      return;
    }
    form.reset();
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

      <div className="mt-3 flex flex-wrap gap-3 text-sm" data-testid="live-connection-panel">
        <span data-testid={`connection-status-${connectionStatus}`}>
          Connection: {connectionStatus}
        </span>
        <span data-testid={`reconnect-status-${reconnectStatus}`}>
          Reconnect: {reconnectStatus}
        </span>
      </div>

      {gaps.length > 0 && (
        <p className="mt-3 text-amber-700" data-testid="live-sequence-gaps-warning" role="status">
          Sequence gaps detected ({gaps.length}): after {gaps.map((g) => g.afterLogicalSequence).join(", ")}
        </p>
      )}

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
        {meeting.status === "ended" && (
          <button
            type="button"
            className="rounded bg-cyan-700 px-3 py-1 text-sm text-white"
            data-testid="live-enqueue-process"
            onClick={enqueueProcess}
          >
            Enqueue processing
          </button>
        )}
        {processing?.canRetry && (
          <button
            type="button"
            className="rounded border border-amber-600 px-3 py-1 text-sm text-amber-800"
            data-testid="live-retry-process"
            onClick={retryProcess}
          >
            Retry processing
          </button>
        )}
      </div>

      {processing && (
        <div className="mt-3 rounded border border-slate-200 p-3 text-sm" data-testid="live-processing-status">
          <p>Processing run: {processing.processingRunStatus ?? "—"}</p>
          <p>Job: {processing.jobStatus ?? "—"}</p>
          {processing.lastErrorMessage && (
            <p className="text-red-700">{processing.lastErrorMessage}</p>
          )}
        </div>
      )}

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
            <li key={segment.id} data-testid={`live-segment-logical-${logicalSeq(segment)}`}>
              #{logicalSeq(segment)} [{segment.startTimeMs ?? segment.start_time_ms}-
              {segment.endTimeMs ?? segment.end_time_ms}ms]{" "}
              {segment.speakerLabel ?? segment.speaker_label ?? "speaker"}: {segment.text}
            </li>
          ))}
        </ol>
      </div>

      {error && <p className="mt-4 text-red-700" role="alert">{error}</p>}
    </section>
  );
}
