"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from "@rtb/ui";
import { parseApiJsonResponse } from "@/lib/api/parse-json-response";

type EffectiveRule = {
  ruleId: string;
  ruleVersion: string;
  name: string;
  description: string;
  assuranceDomain: string;
  conditionType: string;
  applicableObjectTypes: string[];
  catalogDefaultEnabled: true;
  overrideEnabled: boolean | null;
  effectiveEnabled: boolean;
};

export default function AssuranceSettingsPage() {
  const [rows, setRows] = useState<EffectiveRule[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const parsed = await parseApiJsonResponse(await fetch("/api/engineering/settings/assurance"));
    if (!parsed.ok) {
      setError(parsed.errorMessage ?? "Unable to load assurance rule settings");
      return;
    }
    setRows(Array.isArray(parsed.data) ? (parsed.data as EffectiveRule[]) : []);
  }

  useEffect(() => {
    void load();
  }, []);

  async function update(rule: EffectiveRule, enabled: boolean | null) {
    setError(null);
    const parsed = await parseApiJsonResponse(
      await fetch("/api/engineering/settings/assurance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ruleId: rule.ruleId, ruleVersion: rule.ruleVersion, enabled }),
      }),
    );
    if (!parsed.ok) {
      setError(parsed.errorMessage ?? "Unable to update rule setting");
      return;
    }
    await load();
  }

  return (
    <>
      <Header
        title="Assurance rule governance"
        description="Enable or disable approved catalog rules. Rule logic remains code-governed. This is not a rule authoring editor."
      />
      <main className="page-main flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-8">
        <p className="mb-4 text-sm">
          <Link className="underline" href="/engineering/settings">
            Engineering Settings
          </Link>
        </p>
        {error ? <p className="mb-4 text-sm text-destructive">{error}</p> : null}
        <div className="space-y-3">
          {rows.map((rule) => (
            <Card key={`${rule.ruleId}:${rule.ruleVersion}`}>
              <CardHeader>
                <CardTitle className="text-base">
                  {rule.ruleId} {rule.ruleVersion} — {rule.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>{rule.description}</p>
                <p>
                  Domain: {rule.assuranceDomain} · Type: {rule.conditionType} · Objects:{" "}
                  {rule.applicableObjectTypes.join(", ")}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant={rule.effectiveEnabled ? "success" : "secondary"}>
                    Effective: {rule.effectiveEnabled ? "enabled" : "disabled"}
                  </Badge>
                  <Badge variant="secondary">Default: enabled</Badge>
                  <Badge variant="secondary">
                    Override: {rule.overrideEnabled === null ? "none" : rule.overrideEnabled ? "enabled" : "disabled"}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => void update(rule, true)} disabled={rule.effectiveEnabled && rule.overrideEnabled === true}>
                    Enable
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => void update(rule, false)} disabled={rule.overrideEnabled === false}>
                    Disable
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => void update(rule, null)} disabled={rule.overrideEnabled === null}>
                    Restore default
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </>
  );
}
