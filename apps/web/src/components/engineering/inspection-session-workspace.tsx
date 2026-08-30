"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import {
  nextInspectionSessionStates,
  requiredActionForSessionState,
  type InspectionSessionState,
} from "@rtb/inspection-intelligence/browser";
import {
  hostedGet,
  hostedIntent,
  planTargetSummary,
  type InspectionRow,
} from "@/lib/inspection-intelligence/hosted-client";
import { InspectionSessionIntelligence } from "@/components/engineering/inspection-session-intelligence";

type Workspace = {
  session: InspectionRow;
  observations: InspectionRow[];
  measurements: InspectionRow[];
  evidence: InspectionRow[];
  defects?: InspectionRow[];
  recommendations?: InspectionRow[];
  correctiveActions?: InspectionRow[];
  assessments?: InspectionRow[];
  conditionRatings?: InspectionRow[];
  verifications?: InspectionRow[];
};

async function fileSha256(file: File): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", await file.arrayBuffer());
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function writable(status: string): boolean {
  return ["assigned", "started", "paused"].includes(status);
}

export function InspectionSessionWorkspace({ sessionId }: { sessionId: string }) {
  const [workspace, setWorkspace] = useState<Workspace>();
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState<string>();
  const [canWrite, setCanWrite] = useState(true);

  async function load(options?: { skipCapabilities?: boolean }) {
    if (options?.skipCapabilities) {
      setWorkspace(await hostedGet<Workspace>("execution", { id: sessionId }));
      return;
    }
    const [data, caps] = await Promise.all([
      hostedGet<Workspace>("execution", { id: sessionId }),
      hostedGet<{ canWrite: boolean }>("capabilities").catch(() => ({ canWrite: true })),
    ]);
    setWorkspace(data);
    setCanWrite(caps.canWrite !== false);
  }

  useEffect(() => {
    load().catch((reason) => setError(reason instanceof Error ? reason.message : "Unable to load session"));
  }, [sessionId]);

  const status = String(workspace?.session.status ?? "");
  const canRecord = writable(status) && canWrite;

  async function mutate<T>(
    label: string,
    work: () => Promise<T>,
    apply?: (current: Workspace, data: T) => Workspace,
  ) {
    setBusy(label);
    setError(undefined);
    try {
      const data = await work();
      if (apply) {
        setWorkspace((current) => (current ? apply(current, data) : current));
      } else {
        await load({ skipCapabilities: true });
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Action failed");
    } finally {
      setBusy(undefined);
    }
  }

  async function run(label: string, work: () => Promise<void>) {
    await mutate(label, work);
  }

  async function addObservation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const checklistItemType = String(new FormData(form).get("checklistItemType") ?? "").trim();
    const body = String(new FormData(form).get("body") ?? "").trim();
    if (!checklistItemType || !body) {
      setError("Observation type and notes are required.");
      return;
    }
    await mutate(
      "observation",
      () => hostedIntent<InspectionRow>("record_observation", { sessionId, checklistItemType, body }),
      (current, row) => ({ ...current, observations: [...current.observations, row] }),
    );
    form.reset();
  }

  async function addMeasurement(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const measurementType = String(data.get("measurementType") ?? "").trim();
    const rawValue = String(data.get("observedValue") ?? "").trim();
    const rawExpected = String(data.get("expectedValue") ?? "").trim();
    const unit = String(data.get("unit") ?? "").trim();
    const observationId = String(data.get("observationId") ?? "").trim();
    if (!measurementType || rawValue === "") {
      setError("Measurement type and observed value are required. Unset values are left blank.");
      return;
    }
    const observedValue = Number.isNaN(Number(rawValue)) ? rawValue : Number(rawValue);
    const expectedValue = rawExpected === "" ? undefined : Number.isNaN(Number(rawExpected)) ? rawExpected : Number(rawExpected);
    await mutate(
      "measurement",
      () =>
        hostedIntent<InspectionRow>("record_measurement", {
          sessionId,
          measurementType,
          observedValue,
          expectedValue,
          unit: unit || undefined,
          observationId: observationId || undefined,
        }),
      (current, row) => ({ ...current, measurements: [...current.measurements, row] }),
    );
    form.reset();
  }

  async function addEvidence(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const kind = String(data.get("kind") ?? "photo");
    const existingFileId = String(data.get("fileId") ?? "").trim();
    const observationId = String(data.get("observationId") ?? "").trim();
    const file = (form.elements.namedItem("file") as HTMLInputElement | null)?.files?.[0];
    let fileId = existingFileId;
    let contentHash: string | undefined;
    if (file) {
      contentHash = await fileSha256(file);
      fileId = fileId || `platform-files:${contentHash}`;
    }
    if (!fileId && !contentHash) {
      setError("Register an existing Platform file or choose a file to hash. Inspection Intelligence does not store a second copy.");
      return;
    }
    await mutate(
      "evidence",
      () =>
        hostedIntent<InspectionRow>("register_evidence", {
          sessionId,
          kind,
          fileId,
          contentHash,
          observationId: observationId || undefined,
        }),
      (current, row) => ({ ...current, evidence: [...current.evidence, row] }),
    );
    form.reset();
  }

  async function transition(to: InspectionSessionState) {
    await run("transition", async () => {
      if (to === "started" && status === "paused") {
        await hostedIntent("resume_session", { sessionId });
        return;
      }
      await hostedIntent("transition_session", { sessionId, to });
    });
  }

  if (!workspace && !error) {
    return <p className="text-slate-600" role="status">Loading session…</p>;
  }
  if (!workspace) {
    return <p className="text-red-700" role="alert">{error}</p>;
  }

  const next = nextInspectionSessionStates(status as InspectionSessionState);

  return (
    <section data-testid="inspection-session-workspace">
      <p className="text-sm font-medium text-cyan-700">Inspection Execution</p>
      <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Session</h1>
          <p className="mt-2 text-slate-600">
            Status: {status}
            {workspace.session.started_at ? ` · started ${String(workspace.session.started_at).slice(0, 16)}` : ""}
          </p>
          <p className="text-sm text-slate-500">Target: {planTargetSummary(workspace.session)}</p>
        </div>
        {workspace.session.plan_id ? (
          <Link
            className="text-cyan-700 hover:underline"
            href={`/engineering/apps/inspection-intelligence/plans/${workspace.session.plan_id}`}
          >
            Back to plan
          </Link>
        ) : null}
      </div>
      {error ? <p className="mt-3 text-red-700" role="alert">{error}</p> : null}
      {canWrite === false ? (
        <p className="mt-3 text-sm text-slate-500">This session is read-only for your role. Writes are enforced on the server.</p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        {next.map((to) => (
          <button
            key={to}
            type="button"
            className="min-h-11 rounded-md border border-slate-300 px-3 py-2 text-sm disabled:opacity-60"
            disabled={!canWrite || Boolean(busy)}
            onClick={() => transition(to)}
            title={`Requires ${requiredActionForSessionState(to)}`}
            data-testid={`inspection-session-transition-${to}`}
          >
            {to === "started" && status === "paused" ? "Resume" : to}
          </button>
        ))}
      </div>
      {busy ? (
        <p className="mt-2 text-sm text-slate-500" role="status">
          Saving {busy}…
        </p>
      ) : null}

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <form className="space-y-3 rounded border border-slate-200 p-4" onSubmit={addObservation}>
          <h2 className="font-semibold text-slate-900">Record observation</h2>
          <label className="block text-sm">
            Checklist item
            <input name="checklistItemType" className="mt-1 w-full rounded border px-3 py-2" placeholder="visual" disabled={!canRecord} />
          </label>
          <label className="block text-sm">
            Notes
            <textarea name="body" className="mt-1 w-full rounded border px-3 py-2" rows={3} disabled={!canRecord} />
          </label>
          <button className="min-h-11 rounded-md bg-slate-900 px-4 py-2 text-white disabled:opacity-60" disabled={!canRecord || Boolean(busy)} data-testid="inspection-observation-submit">
            Save observation
          </button>
        </form>

        <form className="space-y-3 rounded border border-slate-200 p-4" onSubmit={addMeasurement}>
          <h2 className="font-semibold text-slate-900">Record measurement</h2>
          <p className="text-xs text-slate-500">Leave expected value blank to keep evaluation unknown. Blank is not stored as zero.</p>
          <label className="block text-sm">
            Observation
            <select name="observationId" className="mt-1 w-full rounded border px-3 py-2" disabled={!canRecord}>
              <option value="">Not linked</option>
              {workspace.observations.map((observation) => (
                <option key={String(observation.id)} value={String(observation.id)}>
                  {String(observation.checklist_item_type)} — {String(observation.body).slice(0, 40)}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            Type
            <input name="measurementType" className="mt-1 w-full rounded border px-3 py-2" placeholder="gap_mm" disabled={!canRecord} />
          </label>
          <label className="block text-sm">
            Observed value
            <input name="observedValue" className="mt-1 w-full rounded border px-3 py-2" disabled={!canRecord} />
          </label>
          <label className="block text-sm">
            Expected value (optional)
            <input name="expectedValue" className="mt-1 w-full rounded border px-3 py-2" disabled={!canRecord} />
          </label>
          <label className="block text-sm">
            Unit (optional)
            <input name="unit" className="mt-1 w-full rounded border px-3 py-2" placeholder="mm" disabled={!canRecord} />
          </label>
          <button className="min-h-11 rounded-md bg-slate-900 px-4 py-2 text-white disabled:opacity-60" disabled={!canRecord || Boolean(busy)} data-testid="inspection-measurement-submit">
            Save measurement
          </button>
        </form>
      </div>

      <form className="mt-8 max-w-xl space-y-3 rounded border border-slate-200 p-4" onSubmit={addEvidence}>
        <h2 className="font-semibold text-slate-900">Register evidence</h2>
        <p className="text-xs text-slate-500">
          Metadata is stored on the inspection record. Files remain in Platform Files — this does not create a second store.
        </p>
        <label className="block text-sm">
          Kind
          <select name="kind" className="mt-1 w-full rounded border px-3 py-2" defaultValue="photo" disabled={!canRecord}>
            <option value="photo">photo</option>
            <option value="document">document</option>
            <option value="pdf">pdf</option>
            <option value="voice_note">voice note</option>
          </select>
        </label>
        <label className="block text-sm">
          Observation
          <select name="observationId" className="mt-1 w-full rounded border px-3 py-2" disabled={!canRecord}>
            <option value="">Session-level</option>
            {workspace.observations.map((observation) => (
              <option key={String(observation.id)} value={String(observation.id)}>
                {String(observation.checklist_item_type)}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          Existing Platform file id
          <input name="fileId" className="mt-1 w-full rounded border px-3 py-2" disabled={!canRecord} />
        </label>
        <label className="block text-sm">
          Or choose a file to hash
          <input name="file" type="file" className="mt-1 w-full text-sm" disabled={!canRecord} />
        </label>
        <button className="min-h-11 rounded-md bg-slate-900 px-4 py-2 text-white disabled:opacity-60" disabled={!canRecord || Boolean(busy)} data-testid="inspection-evidence-submit">
          Register evidence
        </button>
      </form>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        <RecordList title="Observations" empty="No observations yet." rows={workspace.observations} render={(row) => `${String(row.checklist_item_type)}: ${String(row.body)}`} />
        <RecordList
          title="Measurements"
          empty="No measurements yet."
          rows={workspace.measurements}
          render={(row) =>
            `${String(row.measurement_type)} = ${JSON.stringify(row.observed_value)}${row.unit ? ` ${row.unit}` : ""} (${String(row.evaluation_status)})`
          }
        />
        <RecordList
          title="Evidence"
          empty="No evidence registered yet."
          rows={workspace.evidence}
          render={(row) => `${String(row.kind)} · ${String(row.file_id ?? row.content_hash ?? "metadata")}`}
        />
      </div>
      <InspectionSessionIntelligence
        sessionId={sessionId}
        workspace={workspace}
        canRecord={canRecord}
        busy={busy}
        onAction={async (work) => {
          await run("intelligence", work);
        }}
      />
    </section>
  );
}

function RecordList({
  title,
  empty,
  rows,
  render,
}: {
  title: string;
  empty: string;
  rows: InspectionRow[];
  render: (row: InspectionRow) => string;
}) {
  return (
    <div>
      <h2 className="font-semibold text-slate-900">{title}</h2>
      {rows.length === 0 ? (
        <p className="mt-2 text-sm text-slate-500">{empty}</p>
      ) : (
        <ul className="mt-2 space-y-2 text-sm text-slate-700">
          {rows.map((row) => (
            <li key={String(row.id)} className="rounded border border-slate-200 px-3 py-2">
              {render(row)}
              {row.recorded_at ? (
                <span className="mt-1 block text-xs text-slate-500">{String(row.recorded_at)}</span>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
