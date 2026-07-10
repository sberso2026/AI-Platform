"use client";

import { useState } from "react";
import { Badge, Button } from "@rtb/ui";
import type { EntitlementDiagnosticResult } from "@rtb/types";

export function EntitlementDiagnoseButton({
  productKey,
  applicationKey,
  featureKey,
  label = "Diagnose Access",
}: {
  productKey?: string;
  applicationKey?: string;
  featureKey?: string;
  label?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EntitlementDiagnosticResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runDiagnose() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/platform/commerce/entitlements/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productKey, applicationKey, featureKey, action: "access" }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Diagnosis failed");
        setResult(null);
        return;
      }
      setResult(json.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Diagnosis failed");
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3" data-testid="entitlement-diagnose">
      <Button variant="outline" size="sm" onClick={runDiagnose} disabled={loading}>
        {loading ? "Diagnosing…" : label}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {result && (
        <div className="rounded-md border border-border bg-slate-50 p-3 text-sm">
          <div className="mb-2 flex items-center gap-2">
            <span className="font-medium">Result:</span>
            <Badge variant={result.allowed ? "default" : "secondary"}>
              {result.allowed ? "Allowed" : "Denied"}
            </Badge>
            <span className="text-slate-500">{result.reasonCode}</span>
          </div>
          <ol className="space-y-1 text-slate-600">
            {result.steps.map((step) => (
              <li key={step.step} className="flex gap-2">
                <span>{step.passed ? "✓" : "✗"}</span>
                <span>
                  <span className="font-medium">{step.step}</span>
                  {step.detail ? `: ${step.detail}` : ""}
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
