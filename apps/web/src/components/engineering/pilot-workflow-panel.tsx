"use client";

import { useCallback, useEffect, useState } from "react";

type Snapshot = {
  projectId: string;
  label: string;
  basis: { revision?: number } | null;
  discipline: { revision?: number; title?: string } | null;
  interface: { revision?: number; status?: string } | null;
  change: { case_key?: string } | null;
  deliverable: { revision?: string; freshness?: string; approval_status?: string; release_status?: string } | null;
  freeze: { frozen?: boolean; approval_status?: string; scope?: string } | null;
  approvalGranted: boolean;
};

const ACTIONS = [
  ["create_basis", "Create basis"],
  ["revise_basis", "Revise basis"],
  ["create_discipline", "Create structural object"],
  ["revise_discipline", "Revise structural object"],
  ["create_interface", "Create interface"],
  ["revise_interface", "Revise interface"],
  ["create_deliverable", "Create deliverable"],
  ["create_change", "Create change"],
  ["record_freeze", "Record freeze readiness"],
] as const;

export function PilotWorkflowPanel() {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [materiality, setMateriality] = useState("NO_MATERIAL_IMPACT");

  const reload = useCallback(async () => {
    const response = await fetch("/api/engineering/pilot-workflow");
    const body = await response.json();
    if (!response.ok) {
      setMessage(body.error ?? "The pilot workflow is not available.");
      return;
    }
    setSnapshot(body.data as Snapshot);
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  async function run(action: string, extra?: Record<string, unknown>) {
    setMessage(null);
    const response = await fetch("/api/engineering/pilot-workflow", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        action,
        projectId: "CONTROLLED_PRODUCTION_PILOT_VALIDATION",
        requestKey: crypto.randomUUID(),
        title: "Controlled production pilot validation",
        statement: "Pilot validation basis. Not a customer approval.",
        ...extra,
      }),
    });
    const body = await response.json();
    setMessage(body.data?.ok ? `${action} saved.` : (body.data?.error ?? "The write was not saved."));
    await reload();
  }

  return (
    <section className="mb-6 max-w-3xl space-y-3 text-sm" data-testid="pilot-workflow-panel">
      <h2 className="font-medium">Controlled production pilot validation</h2>
      <p>Project {snapshot?.projectId ?? "CONTROLLED_PRODUCTION_PILOT_VALIDATION"}. This is a labelled pilot-validation record, not a customer deliverable. Approval granted: no.</p>
      <p>
        Basis revision: {snapshot?.basis?.revision ?? "none"}.
        {" "}Structural revision: {snapshot?.discipline?.revision ?? "none"}.
        {" "}Interface revision: {snapshot?.interface?.revision ?? "none"} {snapshot?.interface?.status ? `(${snapshot.interface.status})` : ""}.
      </p>
      <p>
        Change: {snapshot?.change?.case_key ?? "none"}.
        {" "}Deliverable revision {snapshot?.deliverable?.revision ?? "none"}, freshness {snapshot?.deliverable?.freshness ?? "none"}, approval {snapshot?.deliverable?.approval_status ?? "none"}, release {snapshot?.deliverable?.release_status ?? "none"}.
      </p>
      <p>Freeze: {snapshot?.freeze ? `frozen ${snapshot.freeze.frozen ? "yes" : "no"}, approval ${snapshot.freeze.approval_status}` : "none"}. {snapshot?.freeze?.scope ?? ""}</p>
      <div className="flex flex-wrap gap-2">
        {ACTIONS.map(([action, label]) => (
          <button key={action} type="button" className="underline" onClick={() => void run(action, {
            expectedRevision: action === "revise_basis"
              ? snapshot?.basis?.revision
              : action === "revise_discipline"
                ? snapshot?.discipline?.revision
                : action === "revise_interface"
                  ? snapshot?.interface?.revision
                  : undefined,
          })}>
            {label}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <label>
          Materiality{" "}
          <select value={materiality} onChange={(event) => setMateriality(event.target.value)}>
            <option value="NO_MATERIAL_IMPACT">No material impact</option>
            <option value="MATERIAL_IMPACT">Material impact</option>
          </select>
        </label>
        <button type="button" className="underline" onClick={() => void run("record_materiality", { materiality, discipline: "mechanical" })}>
          Record human materiality
        </button>
        <button type="button" className="underline" onClick={() => void reload()}>Reload</button>
      </div>
      {message ? <p>{message}</p> : null}
    </section>
  );
}
