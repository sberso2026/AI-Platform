"use client";

import { useEffect, useState } from "react";

type Answer = { question: string; label: string; answer: string; approvalGranted: boolean };
type Payload = {
  projectIds?: string[];
  qualificationProjectVisible?: boolean;
  label?: string;
  answers?: Answer[];
  freezes?: Array<{ freeze_key: string; fingerprint: string }>;
  deliverables?: Array<{ deliverable_key: string; revision: string; freshness: string }>;
};

export function PersistedQualificationNotice() {
  const [text, setText] = useState("Persisted qualification project: loading");

  useEffect(() => {
    void fetch("/api/engineering/qualification-runtime")
      .then(async (response) => {
        const body = (await response.json()) as { data?: Payload };
        const ids = body.data?.projectIds ?? [];
        setText(
          body.data?.qualificationProjectVisible
            ? `Persisted qualification project: EOS-QA-001. Label: ${body.data.label}.`
            : `Persisted qualification project: ${ids.length ? ids.join(", ") : "none visible in this workspace"}.`,
        );
      })
      .catch(() => setText("Persisted qualification project: unavailable"));
  }, []);

  return <p data-testid="persisted-qualification-project">{text}</p>;
}

export function QualificationRuntimePanel() {
  const [payload, setPayload] = useState<Payload | null>(null);
  const [result, setResult] = useState("Hosted critical path has not been run in this session.");

  async function refresh() {
    const response = await fetch("/api/engineering/qualification-runtime");
    const body = (await response.json()) as { data?: Payload };
    setPayload(body.data ?? null);
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function run(action: string, actingRole: string, discipline?: string) {
    const response = await fetch("/api/engineering/qualification-runtime", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action, actingRole, discipline }),
    });
    const body = (await response.json()) as { data?: { committed?: boolean; error?: string; approvalGranted?: boolean } };
    setResult(`${action} ${actingRole}: committed ${body.data?.committed ? "yes" : "no"}; approval ${body.data?.approvalGranted ? "yes" : "no"}; ${body.data?.error ?? "ok"}`);
    await refresh();
  }

  return (
    <section className="mb-6 max-w-3xl space-y-2 text-sm" data-testid="qualification-runtime-panel">
      <PersistedQualificationNotice />
      <p>Baseline fingerprints: {(payload?.freezes ?? []).map((item) => `${item.freeze_key} ${item.fingerprint}`).join("; ") || "none"}.</p>
      <p>Deliverables: {(payload?.deliverables ?? []).map((item) => `${item.deliverable_key} revision ${item.revision} ${item.freshness}`).join("; ") || "none"}.</p>
      <div className="flex flex-wrap gap-2">
        <button type="button" className="underline" onClick={() => void run("vendor-revision", "mechanical")}>Run vendor revision</button>
        <button type="button" className="underline" onClick={() => void run("receiver-accept", "structural", "structural")}>Accept structural receiver</button>
        <button type="button" className="underline" onClick={() => void run("receiver-accept", "electrical", "electrical")}>Accept electrical receiver</button>
        <button type="button" className="underline" onClick={() => void run("receiver-accept", "mechanical", "structural")}>Deny wrong receiver</button>
        <button type="button" className="underline" onClick={() => void run("materiality", "structural", "structural")}>Assess structural materiality</button>
        <button type="button" className="underline" onClick={() => void run("materiality", "electrical", "electrical")}>Assess electrical materiality</button>
        <button type="button" className="underline" onClick={() => void run("materiality", "ai", "structural")}>Deny AI materiality</button>
        <button type="button" className="underline" onClick={() => void run("freeze-approve", "ai")}>Deny AI freeze</button>
        <button type="button" className="underline" onClick={() => void run("freeze-approve", "owner")}>Deny owner freeze</button>
        <button type="button" className="underline" onClick={() => void run("deliverable-approve", "owner")}>Deny owner deliverable approval</button>
        <button type="button" className="underline" onClick={() => void run("ifc-release", "owner")}>Deny owner IFC release</button>
        <button type="button" className="underline" onClick={() => void run("disposition", "structural")}>Record revalidation disposition</button>
      </div>
      <p data-testid="qualification-runtime-result">{result}</p>
      {(payload?.answers ?? []).map((item) => (
        <p key={item.question} data-testid="qualification-answer">{item.question} {item.label}: {item.answer} Approval granted: {item.approvalGranted ? "yes" : "no"}.</p>
      ))}
    </section>
  );
}
