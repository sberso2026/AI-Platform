"use client";

import { RegisterShell } from "@/components/engineering/register-shell";

export default function DecisionsPage() {
  return (
    <RegisterShell
      title="Decision Register"
      description="Engineering decisions require human approval — no autonomous engineering approval"
      endpoint="/api/engineering/decisions"
      numberKey="decision_number"
      fields={[
        { key: "title", label: "Title", required: true },
        { key: "decisionType", label: "Decision Type" },
        { key: "recommendation", label: "Recommendation", multiline: true },
        { key: "rationale", label: "Rationale", multiline: true },
      ]}
      renderMeta={(item) => (
        <p className="text-xs text-muted-foreground">
          approval: {(item.approval_status as string) ?? "pending"} · confidence{" "}
          {item.confidence != null ? String(item.confidence) : "—"}
        </p>
      )}
    />
  );
}
