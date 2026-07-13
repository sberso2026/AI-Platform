"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Segment = {
  id: string;
  sequence_number: number;
  speaker_id: string | null;
  speaker_label: string | null;
  start_time_ms: number;
  end_time_ms: number;
  text: string;
  revision_number: number;
};

export default function MeetingTranscriptPage() {
  const params = useParams<{ meetingId: string }>();
  const meetingId = params.meetingId;
  const [segments, setSegments] = useState<Segment[]>([]);
  const [error, setError] = useState<string>();

  const reload = useCallback(async () => {
    const response = await fetch(
      `/api/engineering/project-intelligence/meetings/${meetingId}/transcript`,
    );
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error?.message ?? "Load failed");
    setSegments(payload.data ?? []);
  }, [meetingId]);

  useEffect(() => {
    reload().catch((reason) => setError(reason.message));
  }, [reload]);

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
      <p className="mt-2 text-slate-600">Ordered segments with manual correction. No AI mutation.</p>
      <ol className="mt-6 space-y-3" data-testid="transcript-ordered-segments">
        {segments.map((segment) => (
          <li key={segment.id} className="rounded border border-slate-200 p-3 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span>
                #{segment.sequence_number} · {segment.speaker_label ?? segment.speaker_id ?? "speaker"} ·{" "}
                {segment.start_time_ms}-{segment.end_time_ms}ms · rev {segment.revision_number}
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
        {segments.length === 0 && <li className="text-slate-500">No segments yet.</li>}
      </ol>
      {error && <p className="mt-4 text-red-700" role="alert">{error}</p>}
    </section>
  );
}
