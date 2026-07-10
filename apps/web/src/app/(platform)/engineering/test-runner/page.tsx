"use client";

import { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from "@rtb/ui";

type CheckItem = {
  id: string;
  label: string;
  group: string;
  endpoint?: string;
  method?: "GET" | "POST";
  body?: Record<string, unknown>;
  manual?: string;
};

const CHECKLIST: CheckItem[] = [
  { id: "login", label: "Login and active tenant membership", group: "Access", manual: "Sign in; confirm tenant context in header" },
  { id: "feature", label: "engineering_os_enabled feature flag", group: "Access", endpoint: "/api/engineering/health", method: "GET" },
  { id: "project", label: "Project creation", group: "Core", endpoint: "/api/engineering/projects", method: "GET" },
  { id: "asset", label: "Asset list accessible", group: "Core", endpoint: "/api/engineering/assets", method: "GET" },
  { id: "document", label: "Document register accessible", group: "Core", endpoint: "/api/engineering/documents", method: "GET" },
  { id: "decision", label: "Decision register (approval required)", group: "Registers", endpoint: "/api/engineering/decisions", method: "GET" },
  { id: "action", label: "Action register", group: "Registers", endpoint: "/api/engineering/actions", method: "GET" },
  { id: "risk", label: "Risk register", group: "Registers", endpoint: "/api/engineering/risks", method: "GET" },
  { id: "issue", label: "Issue register", group: "Registers", endpoint: "/api/engineering/issues", method: "GET" },
  { id: "tq", label: "Technical Query register", group: "Registers", endpoint: "/api/engineering/technical-queries", method: "GET" },
  { id: "lesson", label: "Lessons Learned register", group: "Registers", endpoint: "/api/engineering/lessons", method: "GET" },
  { id: "dashboard", label: "Dashboard counts", group: "Intelligence", endpoint: "/api/engineering/dashboard", method: "GET" },
  { id: "search", label: "Search results", group: "Intelligence", endpoint: "/api/engineering/search?q=demo&type=all", method: "GET" },
  { id: "timeline", label: "Timeline generation", group: "Intelligence", endpoint: "/api/engineering/timeline", method: "GET" },
  { id: "activity", label: "Activity feed", group: "Intelligence", endpoint: "/api/engineering/activity", method: "GET" },
  { id: "ai", label: "AI Workspace response", group: "AI", manual: "Open /engineering/ai and submit a test prompt" },
  { id: "policy", label: "Policy review enforcement", group: "AI", manual: "Prompt containing 'approve' should flag requiresReview" },
  { id: "rls", label: "RLS tenant isolation", group: "Security", manual: "Verify data scoped to tenant; no cross-tenant leakage" },
  { id: "demo", label: "Demo seed data", group: "Demo", endpoint: "/api/engineering/demo/seed", method: "POST" },
];

export default function EngineeringTestRunnerPage() {
  const [results, setResults] = useState<Record<string, "pass" | "fail" | "skip" | "pending">>({});
  const [running, setRunning] = useState(false);

  async function runAutomated() {
    setRunning(true);
    const next: Record<string, "pass" | "fail" | "skip" | "pending"> = {};

    for (const item of CHECKLIST) {
      if (!item.endpoint) {
        next[item.id] = "skip";
        continue;
      }
      try {
        const res = await fetch(item.endpoint, {
          method: item.method ?? "GET",
          headers: item.method === "POST" ? { "Content-Type": "application/json" } : undefined,
          body: item.body ? JSON.stringify(item.body) : undefined,
        });
        next[item.id] = res.ok ? "pass" : "fail";
      } catch {
        next[item.id] = "fail";
      }
    }

    setResults(next);
    setRunning(false);
  }

  const groups = [...new Set(CHECKLIST.map((c) => c.group))];

  return (
      <>
        <Header
        title="Engineering OS Test Runner"
        description="Internal checklist for Batch 2.06 test readiness"
      />
              <main className="page-main flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-8" data-testid="page-main">
        <div className="mb-6 flex flex-wrap gap-2">
          <Button onClick={runAutomated} disabled={running}>
            {running ? "Running..." : "Run Automated Checks"}
          </Button>
          <Link href="/engineering/health">
            <Button variant="outline">Health Check</Button>
          </Link>
          <Link href="/engineering">
            <Button variant="secondary">Dashboard</Button>
          </Link>
        </div>

        <p className="mb-6 text-sm text-muted-foreground">
          Seed demo data first via{" "}
          <Link href="/engineering/health" className="text-primary underline">
            Health Check
          </Link>{" "}
          for richer register/search/timeline results. Manual items require human verification.
        </p>

        {groups.map((group) => (
          <Card key={group} className="mb-4">
            <CardHeader>
              <CardTitle className="text-base">{group}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {CHECKLIST.filter((c) => c.group === group).map((item) => {
                const status = results[item.id];
                return (
                  <div
                    key={item.id}
                    className="flex flex-wrap items-start justify-between gap-2 rounded border p-3 text-sm"
                  >
                    <div>
                      <p className="font-medium">{item.label}</p>
                      {item.manual && (
                        <p className="text-xs text-muted-foreground">{item.manual}</p>
                      )}
                      {item.endpoint && (
                        <p className="text-xs text-muted-foreground">
                          {item.method ?? "GET"} {item.endpoint}
                        </p>
                      )}
                    </div>
                    {status ? (
                      <Badge
                        variant={
                          status === "pass"
                            ? "default"
                            : status === "fail"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {status}
                      </Badge>
                    ) : (
                      <Badge variant="outline">not run</Badge>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </main>
      </>
  );
}
