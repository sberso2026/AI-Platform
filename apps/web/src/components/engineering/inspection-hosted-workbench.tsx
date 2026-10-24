"use client";

import { useEffect, useState } from "react";
import { Button, Input } from "@rtb/ui";
import { parseApiJsonResponse } from "@/lib/api/parse-json-response";
import { useEngineeringWriteAccess } from "@/hooks/use-engineering-write-access";

type WorkflowSnapshot = {
  durable?: boolean;
  plans?: Array<Record<string, unknown>>;
  sessions?: Array<Record<string, unknown>>;
  observations?: Array<Record<string, unknown>>;
  defects?: Array<Record<string, unknown>>;
  recommendations?: Array<Record<string, unknown>>;
  correctiveActions?: Array<Record<string, unknown>>;
  verifications?: Array<Record<string, unknown>>;
};

async function postAction(action: string, extra: Record<string, unknown> = {}) {
  const parsed = await parseApiJsonResponse(
    await fetch("/api/engineering/inspection-intelligence/workflow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...extra }),
    }),
  );
  if (!parsed.ok) throw new Error(parsed.errorMessage ?? "Inspection action failed");
  return parsed.data as Record<string, unknown>;
}

export function InspectionHostedWorkbench({
  focus,
}: {
  focus: "overview" | "plans" | "sessions" | "defects" | "actions" | "review";
}) {
  const { canMutate } = useEngineeringWriteAccess();
  const [data, setData] = useState<WorkflowSnapshot>({});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [planTitle, setPlanTitle] = useState("Pilot inspection plan");
  const [observation, setObservation] = useState("");
  const [defectTitle, setDefectTitle] = useState("");
  const [recommendation, setRecommendation] = useState("");
  const [verifyNotes, setVerifyNotes] = useState("");

  async function reload() {
    const parsed = await parseApiJsonResponse<WorkflowSnapshot>(
      await fetch("/api/engineering/inspection-intelligence/workflow"),
    );
    if (!parsed.ok) {
      setError(parsed.errorMessage ?? "Unable to load inspection records");
      setData({});
      return;
    }
    setError(null);
    setData(parsed.data ?? {});
  }

  useEffect(() => {
    void reload();
  }, []);

  const latestPlan = data.plans?.[0];
  const latestSession = data.sessions?.[0];
  const latestObservation = data.observations?.[0];
  const latestDefect = data.defects?.[0];

  async function run(label: string, fn: () => Promise<void>) {
    setBusy(true);
    setError(null);
    try {
      await fn();
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : label);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4" data-testid={`inspection-workbench-${focus}`}>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      <p className="text-xs text-muted-foreground">
        Pilot subset (hosted): plan, start, observation, measurement, evidence, defect,
        recommendation, verification, complete. Not Inspection Intelligence GA.
      </p>
      <p className="text-xs text-muted-foreground">
        Hosted persistence {data.durable ? "connected" : "checking…"} · {data.plans?.length ?? 0}{" "}
        plans · {data.sessions?.length ?? 0} sessions · {data.defects?.length ?? 0} defects
      </p>

      {canMutate && (focus === "overview" || focus === "plans") ? (
        <div className="flex flex-wrap gap-2">
          <Input
            value={planTitle}
            onChange={(e) => setPlanTitle(e.target.value)}
            placeholder="Plan title"
          />
          <Button
            size="sm"
            disabled={busy}
            onClick={() =>
              run("Create plan", async () => {
                await postAction("plan", { title: planTitle });
              })
            }
          >
            Create inspection plan
          </Button>
        </div>
      ) : null}

      {canMutate && (focus === "overview" || focus === "sessions") ? (
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            disabled={busy}
            data-testid="inspection-start"
            onClick={() =>
              run("Start inspection", async () => {
                await postAction("start", { planId: latestPlan?.id, title: planTitle });
              })
            }
          >
            Start inspection
          </Button>
          <Input
            value={observation}
            onChange={(e) => setObservation(e.target.value)}
            placeholder="Observation"
          />
          <Button
            size="sm"
            variant="secondary"
            disabled={busy || !latestSession}
            onClick={() =>
              run("Record observation", async () => {
                const sessionId = latestSession?.id;
                if (!sessionId) throw new Error("Start a session first");
                const obs = (await postAction("observe", {
                  sessionId,
                  body: observation || "Visual condition recorded",
                })) as { observation?: { id?: string } };
                await postAction("measure", {
                  sessionId,
                  observationId: obs.observation?.id,
                  observedValue: { value: 1 },
                  unit: "ea",
                });
                await postAction("evidence", {
                  sessionId,
                  observationId: obs.observation?.id,
                  body: observation || "Field evidence note",
                });
                setObservation("");
              })
            }
          >
            Record observation
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={busy || !latestSession}
            onClick={() =>
              run("Complete session", async () => {
                if (!latestSession?.id) throw new Error("Start a session first");
                await postAction("complete", { sessionId: latestSession.id });
              })
            }
          >
            Complete session
          </Button>
        </div>
      ) : null}

      {canMutate && (focus === "overview" || focus === "defects") ? (
        <div className="flex flex-wrap gap-2">
          <Input
            value={defectTitle}
            onChange={(e) => setDefectTitle(e.target.value)}
            placeholder="Defect title"
          />
          <Button
            size="sm"
            disabled={busy || !latestSession}
            onClick={() =>
              run("Record defect", async () => {
                if (!latestSession?.id) throw new Error("Start a session first");
                await postAction("defect", {
                  sessionId: latestSession.id,
                  observationId: latestObservation?.id,
                  title: defectTitle || "Recorded defect",
                  description: defectTitle || "Condition recorded during inspection",
                });
                setDefectTitle("");
              })
            }
          >
            Record defect
          </Button>
        </div>
      ) : null}

      {canMutate && (focus === "overview" || focus === "actions") ? (
        <div className="flex flex-wrap gap-2">
          <Input
            value={recommendation}
            onChange={(e) => setRecommendation(e.target.value)}
            placeholder="Corrective recommendation"
          />
          <Button
            size="sm"
            disabled={busy || !latestSession || !latestDefect}
            onClick={() =>
              run("Recommend", async () => {
                if (!latestSession?.id || !latestDefect?.id) {
                  throw new Error("Record a defect first");
                }
                await postAction("recommend", {
                  sessionId: latestSession.id,
                  defectId: latestDefect.id,
                  recommendation: recommendation || "Repair and re-inspect",
                });
                setRecommendation("");
              })
            }
          >
            Record recommendation
          </Button>
        </div>
      ) : null}

      {canMutate && (focus === "overview" || focus === "review") ? (
        <div className="flex flex-wrap gap-2">
          <Input
            value={verifyNotes}
            onChange={(e) => setVerifyNotes(e.target.value)}
            placeholder="Verification notes"
          />
          <Button
            size="sm"
            disabled={busy || !latestSession}
            onClick={() =>
              run("Verify", async () => {
                if (!latestSession?.id) throw new Error("Start a session first");
                await postAction("verify", {
                  sessionId: latestSession.id,
                  subjectId: latestDefect?.id ?? latestSession.id,
                  notes: verifyNotes || "Human verification recorded",
                });
                setVerifyNotes("");
              })
            }
          >
            Record verification
          </Button>
        </div>
      ) : null}

      {!canMutate ? (
        <p className="text-sm text-muted-foreground">Read-only — inspection records are visible, not editable.</p>
      ) : null}

      <ul className="space-y-2 text-sm">
        {(focus === "plans" ? data.plans : focus === "sessions" ? data.sessions : focus === "defects" ? data.defects : focus === "actions" ? data.correctiveActions : focus === "review" ? data.verifications : data.sessions)?.map(
          (row) => (
            <li key={String(row.id)} className="rounded border border-slate-200 bg-white p-3">
              <p className="font-medium">
                {String(row.title ?? row.action ?? row.kind ?? row.status ?? row.id)}
              </p>
              <p className="text-xs text-muted-foreground">
                {String(row.status ?? "")} {row.created_at ? `· ${String(row.created_at)}` : ""}
              </p>
            </li>
          ),
        )}
      </ul>
    </div>
  );
}
