"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { EngineeringAuthorityNotice, PilotDataNotice } from "@/components/pilot/pilot-notices";
import { Button, Card, CardContent, Input } from "@rtb/ui";

export default function PilotFeedbackPage() {
  const [category, setCategory] = useState("defect");
  const [severity, setSeverity] = useState("medium");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setMessage(null);
    setError(null);
    const response = await fetch("/api/platform/pilot/feedback", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ category, severity, description }),
    });
    if (!response.ok) {
      setError("Feedback was not stored.");
      return;
    }
    setDescription("");
    setMessage("Feedback was stored for pilot triage. It is not an engineering review, validation, approval, or certification.");
  }

  return (
    <>
      <Header title="Pilot feedback" description="Report a pilot issue. This register is not an engineering approval." />
      <main className="page-main flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-8" data-testid="page-main">
        <Card className="max-w-2xl">
          <CardContent className="p-6">
            <PilotDataNotice />
            <EngineeringAuthorityNotice />
            <form onSubmit={onSubmit} className="space-y-3" data-testid="pilot-feedback-form">
              <label className="block text-sm font-medium" htmlFor="pilot-feedback-category">
                Category
              </label>
              <select
                id="pilot-feedback-category"
                className="w-full rounded-md border px-3 py-2 text-sm"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              >
                <option value="usability">Usability</option>
                <option value="defect">Defect</option>
                <option value="data">Data</option>
                <option value="access">Access</option>
                <option value="other">Other</option>
              </select>
              <label className="block text-sm font-medium" htmlFor="pilot-feedback-severity">
                Severity
              </label>
              <select
                id="pilot-feedback-severity"
                className="w-full rounded-md border px-3 py-2 text-sm"
                value={severity}
                onChange={(event) => setSeverity(event.target.value)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <label className="block text-sm font-medium" htmlFor="pilot-feedback-description">
                Description
              </label>
              <Input
                id="pilot-feedback-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                required
                minLength={3}
              />
              {error ? <p className="text-sm text-red-700">{error}</p> : null}
              {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
              <Button type="submit">Submit feedback</Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
