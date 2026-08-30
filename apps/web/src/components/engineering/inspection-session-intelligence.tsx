"use client";

import Link from "next/link";
import { FormEvent } from "react";
import { hostedIntent, type InspectionRow } from "@/lib/inspection-intelligence/hosted-client";

export function InspectionSessionIntelligence({
  sessionId,
  workspace,
  canRecord,
  busy,
  onAction,
}: {
  sessionId: string;
  workspace: {
    observations: InspectionRow[];
    defects?: InspectionRow[];
    recommendations?: InspectionRow[];
    correctiveActions?: InspectionRow[];
    assessments?: InspectionRow[];
    conditionRatings?: InspectionRow[];
    verifications?: InspectionRow[];
  };
  canRecord: boolean;
  busy?: string;
  onAction: (work: () => Promise<void>) => Promise<void>;
}) {
  const defects = workspace.defects ?? [];
  const disabled = !canRecord || Boolean(busy);

  return (
    <div className="mt-10 space-y-6" data-testid="inspection-session-intelligence">
      <h2 className="text-lg font-semibold text-slate-900">Defect, condition, and verification</h2>
      <p className="text-sm text-slate-500">
        Inspection-process records only. Condition ratings stay human-controlled. Insufficient evidence cannot be
        saved as a passing rating.
      </p>

      <form
        className="max-w-xl space-y-2 rounded border p-4"
        onSubmit={(event: FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          const title = String(data.get("title") ?? "").trim();
          const description = String(data.get("description") ?? "").trim();
          if (!title || !description) return;
          const form = event.currentTarget;
          onAction(async () => {
            await hostedIntent("create_defect", {
              sessionId,
              observationId: String(data.get("observationId") ?? "") || undefined,
              title,
              description,
              taxonomy: {
                severity: String(data.get("severity") ?? "medium"),
                urgency: String(data.get("urgency") ?? "routine"),
                monitoringRequired: data.get("monitoring") === "on",
                defectCategory: String(data.get("category") ?? "unclassified"),
              },
            });
            form.reset();
          });
        }}
      >
        <h3 className="font-semibold">Record defect</h3>
        <select name="observationId" className="w-full rounded border px-3 py-2" disabled={disabled}>
          <option value="">No source observation</option>
          {workspace.observations.map((row) => (
            <option key={String(row.id)} value={String(row.id)}>{String(row.checklist_item_type)}</option>
          ))}
        </select>
        <input name="title" className="w-full rounded border px-3 py-2" placeholder="Title" disabled={disabled} />
        <textarea name="description" className="w-full rounded border px-3 py-2" rows={2} disabled={disabled} />
        <div className="grid grid-cols-2 gap-2">
          <select name="severity" className="rounded border px-3 py-2" disabled={disabled} defaultValue="medium">
            {["low", "medium", "high", "critical"].map((item) => <option key={item}>{item}</option>)}
          </select>
          <select name="urgency" className="rounded border px-3 py-2" disabled={disabled} defaultValue="routine">
            {["routine", "priority", "immediate"].map((item) => <option key={item}>{item}</option>)}
          </select>
        </div>
        <input name="category" className="w-full rounded border px-3 py-2" placeholder="Category" disabled={disabled} />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="monitoring" disabled={disabled} /> monitoring required
        </label>
        <button className="min-h-11 rounded-md bg-slate-900 px-4 py-2 text-white disabled:opacity-60" disabled={disabled} data-testid="inspection-defect-submit">
          Save defect
        </button>
      </form>

      <form
        className="max-w-xl space-y-2 rounded border p-4"
        onSubmit={(event: FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          const sufficiency = String(data.get("evidenceSufficiency") ?? "sufficient");
          const numericRaw = String(data.get("numericScore") ?? "").trim();
          const ordinalCode = String(data.get("ordinalCode") ?? "").trim();
          const confidenceRaw = String(data.get("confidence") ?? "").trim();
          const uncertaintyRaw = String(data.get("uncertainty") ?? "").trim();
          if (sufficiency === "insufficient" || sufficiency === "abstain") {
            onAction(async () => {
              throw new Error("condition_rating_abstain: insufficient or abstain cannot be stored as a rating");
            });
            return;
          }
          const form = event.currentTarget;
          onAction(async () => {
            await hostedIntent("persist_condition_rating", {
              sessionId,
              componentScope: String(data.get("componentScope") ?? "component"),
              inspectionScope: String(data.get("inspectionScope") ?? "visual"),
              observationIds: workspace.observations.map((row) => String(row.id)),
              schemeId: ordinalCode ? "structural_ordinal_1_5" : "generic_numeric_0_100",
              ordinalCode: ordinalCode || undefined,
              numericScore: numericRaw === "" ? undefined : Number(numericRaw),
              confidence: confidenceRaw === "" ? 0.5 : Number(confidenceRaw),
              uncertainty: uncertaintyRaw === "" ? 0.5 : Number(uncertaintyRaw),
              evidenceSufficiency: sufficiency,
              packId: ordinalCode ? "structural_condition" : "generic",
            });
            form.reset();
          });
        }}
      >
        <h3 className="font-semibold">Record human condition rating</h3>
        <p className="text-xs text-slate-500">Leave values blank to keep unrated. Insufficient/abstain cannot be stored as a rating.</p>
        <input name="componentScope" className="w-full rounded border px-3 py-2" placeholder="Component scope" disabled={disabled} />
        <input name="inspectionScope" className="w-full rounded border px-3 py-2" placeholder="Inspection scope" disabled={disabled} />
        <input name="ordinalCode" className="w-full rounded border px-3 py-2" placeholder="Ordinal code (1-5), optional" disabled={disabled} />
        <input name="numericScore" className="w-full rounded border px-3 py-2" placeholder="Numeric score 0-100, optional" disabled={disabled} />
        <select name="evidenceSufficiency" className="w-full rounded border px-3 py-2" disabled={disabled} defaultValue="sufficient">
          <option value="sufficient">sufficient</option>
          <option value="marginal">marginal</option>
          <option value="insufficient">insufficient (will not save a rating)</option>
          <option value="abstain">abstain (will not save a rating)</option>
        </select>
        <div className="grid grid-cols-2 gap-2">
          <input name="confidence" className="rounded border px-3 py-2" placeholder="Confidence 0-1" disabled={disabled} />
          <input name="uncertainty" className="rounded border px-3 py-2" placeholder="Uncertainty 0-1" disabled={disabled} />
        </div>
        <button className="min-h-11 rounded-md bg-slate-900 px-4 py-2 text-white disabled:opacity-60" disabled={disabled} data-testid="inspection-condition-submit">
          Save observed rating
        </button>
      </form>

      <form
        className="max-w-xl space-y-2 rounded border p-4"
        onSubmit={(event: FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          const title = String(data.get("title") ?? "").trim();
          const body = String(data.get("body") ?? "").trim();
          if (!title || !body) return;
          const form = event.currentTarget;
          onAction(async () => {
            await hostedIntent("record_assessment", {
              sessionId,
              defectId: String(data.get("defectId") ?? "") || undefined,
              title,
              body,
            });
            form.reset();
          });
        }}
      >
        <h3 className="font-semibold">Human assessment</h3>
        <select name="defectId" className="w-full rounded border px-3 py-2" disabled={disabled}>
          <option value="">Session-level</option>
          {defects.map((row) => (
            <option key={String(row.id)} value={String(row.id)}>{String(row.title ?? row.id)}</option>
          ))}
        </select>
        <input name="title" className="w-full rounded border px-3 py-2" placeholder="Title" disabled={disabled} />
        <textarea name="body" className="w-full rounded border px-3 py-2" rows={2} disabled={disabled} />
        <button className="min-h-11 rounded-md bg-slate-900 px-4 py-2 text-white disabled:opacity-60" disabled={disabled}>
          Save assessment
        </button>
      </form>

      <form
        className="max-w-xl space-y-2 rounded border p-4"
        onSubmit={(event: FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          const subjectId = String(data.get("subjectId") ?? "").trim();
          if (!subjectId) return;
          const form = event.currentTarget;
          onAction(async () => {
            await hostedIntent("request_verification", {
              sessionId,
              kind: String(data.get("kind") ?? "defect"),
              subjectId,
            });
            form.reset();
          });
        }}
      >
        <h3 className="font-semibold">Request verification</h3>
        <select name="kind" className="w-full rounded border px-3 py-2" disabled={disabled} defaultValue="defect">
          <option value="defect">defect</option>
          <option value="corrective_action">corrective_action</option>
          <option value="inspection_closeout">inspection_closeout</option>
        </select>
        <input name="subjectId" className="w-full rounded border px-3 py-2" placeholder="Subject id" disabled={disabled} />
        <button className="min-h-11 rounded-md bg-slate-900 px-4 py-2 text-white disabled:opacity-60" disabled={disabled}>
          Request verification
        </button>
      </form>

      <div className="grid gap-4 md:grid-cols-2">
        <MiniList
          title="Defects"
          empty="No defects on this session."
          rows={defects}
          href={(row) => `/engineering/apps/inspection-intelligence/defects/${row.id}`}
          render={(row) => `${String(row.title ?? row.id)} · ${String(row.status)}`}
        />
        <MiniList title="Recommendations" empty="None." rows={workspace.recommendations ?? []} render={(row) => `${String(row.action)} (${String(row.status)})`} />
        <MiniList title="Corrective actions" empty="None." rows={workspace.correctiveActions ?? []} render={(row) => `${String(row.description)} · ${String(row.status)}`} />
        <MiniList title="Verifications" empty="None recorded." rows={workspace.verifications ?? []} render={(row) => `${String(row.kind)} · ${String(row.status)}`} />
      </div>
    </div>
  );
}

function MiniList({
  title,
  empty,
  rows,
  render,
  href,
}: {
  title: string;
  empty: string;
  rows: InspectionRow[];
  render: (row: InspectionRow) => string;
  href?: (row: InspectionRow) => string;
}) {
  return (
    <div>
      <h3 className="font-semibold text-slate-900">{title}</h3>
      {rows.length === 0 ? (
        <p className="mt-2 text-sm text-slate-500">{empty}</p>
      ) : (
        <ul className="mt-2 space-y-1 text-sm">
          {rows.map((row) => (
            <li key={String(row.id)}>
              {href ? (
                <Link className="text-cyan-700 hover:underline" href={href(row)}>{render(row)}</Link>
              ) : (
                render(row)
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
