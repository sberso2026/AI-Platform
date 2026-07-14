"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

type Segment = {
  id: string;
  logicalSequence?: number;
  sequence_number?: number;
  sequenceNumber?: number;
  speaker_id?: string | null;
  speakerId?: string | null;
  speaker_label?: string | null;
  speakerLabel?: string | null;
  start_time_ms?: number;
  startTimeMs?: number;
  end_time_ms?: number;
  endTimeMs?: number;
  text: string;
  revision_number?: number;
  revisionNumber?: number;
};

type Gap = { afterLogicalSequence: number; beforeLogicalSequence: number; gapSize: number };

function logicalSeq(segment: Segment): number {
  return Number(segment.logicalSequence ?? segment.sequence_number ?? segment.sequenceNumber ?? 0);
}

function revision(segment: Segment): number {
  return Number(segment.revisionNumber ?? segment.revision_number ?? 1);
}

function normalize(payload: unknown): { segments: Segment[]; gaps: Gap[] } {
  if (Array.isArray(payload)) return { segments: payload, gaps: [] };
  if (payload && typeof payload === "object") {
    const record = payload as { segments?: Segment[]; gaps?: Gap[] };
    return { segments: record.segments ?? [], gaps: record.gaps ?? [] };
  }
  return { segments: [], gaps: [] };
}

export default function MeetingTranscriptPage() {
  const params = useParams<{ meetingId: string }>();
  const meetingId = params.meetingId;
  const [segments, setSegments] = useState<Segment[]>([]);
  const [gaps, setGaps] = useState<Gap[]>([]);
  const [filter, setFilter] = useState("");
  const [error, setError] = useState<string>();

  const reload = useCallback(async () => {
    const response = await fetch(
      `/api/engineering/project-intelligence/meetings/${meetingId}/transcript`,
    );
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error?.message ?? "Load failed");
    const normalized = normalize(payload.data);
    setSegments(normalized.segments);
    setGaps(normalized.gaps);
  }, [meetingId]);

  useEffect(() => {
    reload().catch((reason) => setError(reason.message));
  }, [reload]);

  const visible = useMemo(() => {
    const query = filter.trim().toLowerCase();
    const ordered = [...segments].sort((a, b) => {
      const seq = logicalSeq(a) - logicalSeq(b);
      if (seq !== 0) return seq;
      return revision(a) - revision(b);
    });
    if (!query) return ordered;
    return ordered.filter((segment) => {
      const haystack = [
        segment.text,
        segment.speakerLabel ?? segment.speaker_label ?? "",
        String(logicalSeq(segment)),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [segments, filter]);

  async function revise(segmentId: string, currentText: string) {
    const revisedText = window.prompt("Revised text", currentText);
    if (!revisedText) return;
    const response = await fetch(
      `/api/engineering/project-intelligence/meetings/${meetingId}/transcript/${segmentId}/revise`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ revisedText, revisionReason: "manual_correction" }),
      },
    );
    const payload = await response.json();
    if (!response.ok) {
      setError(payload.error?.message ?? "Revise failed");
      return;
    }
    await reload();
  }

  return (
    <section data-testid="project-intelligence-meeting-transcript">
      <h2 className="text-2xl font-semibold text-slate-900">Transcript</h2>
      <p className="mt-2 text-slate-600">
        Ordered by logical_sequence with manual correction. No AI mutation.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <input
          className="rounded border px-2 py-1 text-sm"
          placeholder="Search / filter"
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          data-testid="transcript-search"
        />
        {gaps.length > 0 && (
          <span className="text-sm text-amber-700" data-testid="transcript-sequence-gaps">
            Gaps: {gaps.map((g) => `${g.afterLogicalSequence}→${g.beforeLogicalSequence}`).join(", ")}
          </span>
        )}
      </div>

      <ol className="mt-6 space-y-3" data-testid="transcript-ordered-segments">
        {visible.map((segment) => (
          <li
            key={segment.id}
            className="rounded border border-slate-200 p-3 text-sm"
            data-testid={`transcript-logical-${logicalSeq(segment)}`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span>
                logical #{logicalSeq(segment)} ·{" "}
                {segment.speakerLabel ?? segment.speaker_label ?? segment.speakerId ?? segment.speaker_id ?? "speaker"}{" "}
                · {segment.startTimeMs ?? segment.start_time_ms}-{segment.endTimeMs ?? segment.end_time_ms}ms · rev{" "}
                {revision(segment)}
              </span>
              <button
                type="button"
                className="text-cyan-700"
                data-testid={`transcript-revise-${segment.id}`}
                onClick={() => revise(segment.id, segment.text)}
              >
                Revise
              </button>
            </div>
            <p className="mt-2 text-slate-800">{segment.text}</p>
          </li>
        ))}
        {visible.length === 0 && <li className="text-slate-500">No segments yet.</li>}
      </ol>
      {error && <p className="mt-4 text-red-700" role="alert">{error}</p>}
    </section>
  );
}
