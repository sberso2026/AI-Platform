"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from "@rtb/ui";
import {
  asRecordArray,
  parseApiJsonResponse,
} from "@/lib/api/parse-json-response";
import {
  useEngineeringProjectFilter,
  withProjectQuery,
} from "@/hooks/use-engineering-project-filter";
import {
  ENGINEERING_CERTIFIED_V1_MODULES,
  type EngineeringModuleAccessUiState,
} from "@/lib/engineering/certified-modules";

const REPORT_TEMPLATES = [
  { name: "Decision Register Report", register: "decisions", href: "/engineering/decisions" },
  { name: "Risk Register Report", register: "risks", href: "/engineering/risks" },
  { name: "Action Register Report", register: "actions", href: "/engineering/actions" },
  { name: "Issue Register Report", register: "issues", href: "/engineering/issues" },
  {
    name: "Technical Query Report",
    register: "technical-queries",
    href: "/engineering/technical-queries",
  },
  { name: "Lessons Learned Report", register: "lessons", href: "/engineering/lessons" },
];

type AccessRow = {
  key: string;
  allowed: boolean;
  uiState: EngineeringModuleAccessUiState;
  uiLabel: string;
};

type RegisterSummary = {
  decisions: number;
  actions: number;
  risks: number;
  issues: number;
  technicalQueries: number;
  lessons: number;
  assets: number;
  documents: number;
  projectLabel: string | null;
};

const EMPTY_SUMMARY: RegisterSummary = {
  decisions: 0,
  actions: 0,
  risks: 0,
  issues: 0,
  technicalQueries: 0,
  lessons: 0,
  assets: 0,
  documents: 0,
  projectLabel: null,
};

export default function EngineeringReportsPage() {
  const projectId = useEngineeringProjectFilter();
  const [summary, setSummary] = useState<RegisterSummary>(EMPTY_SUMMARY);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [moduleAccess, setModuleAccess] = useState<Record<string, AccessRow>>({});
  const [moduleAccessLoading, setModuleAccessLoading] = useState(true);

  const scopeLabel = useMemo(
    () => (projectId ? "Selected project" : "All Projects (workspace)"),
    [projectId],
  );

  useEffect(() => {
    let cancelled = false;
    setModuleAccessLoading(true);
    fetch("/api/engineering/modules/access")
      .then((r) => parseApiJsonResponse<{ modules: AccessRow[] }>(r))
      .then((parsed) => {
        if (cancelled) return;
        const map: Record<string, AccessRow> = {};
        for (const row of parsed.data?.modules ?? []) {
          map[row.key] = row;
        }
        setModuleAccess(map);
      })
      .catch(() => {
        if (!cancelled) setModuleAccess({});
      })
      .finally(() => {
        if (!cancelled) setModuleAccessLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    async function load() {
      try {
        const endpoints = [
          withProjectQuery("/api/engineering/decisions", projectId),
          withProjectQuery("/api/engineering/actions", projectId),
          withProjectQuery("/api/engineering/risks", projectId),
          withProjectQuery("/api/engineering/issues", projectId),
          withProjectQuery("/api/engineering/technical-queries", projectId),
          withProjectQuery("/api/engineering/lessons", projectId),
          withProjectQuery("/api/engineering/assets", projectId),
          withProjectQuery("/api/engineering/documents", projectId),
        ] as const;

        const responses = await Promise.all(
          endpoints.map((endpoint) =>
            fetch(endpoint).then((r) => parseApiJsonResponse(r)),
          ),
        );

        if (cancelled) return;

        for (const res of responses) {
          if (!res.ok) {
            setError(res.errorMessage ?? "Unable to load register summary");
            setSummary(EMPTY_SUMMARY);
            return;
          }
        }

        const [
          decisions,
          actions,
          risks,
          issues,
          technicalQueries,
          lessons,
          assets,
          documents,
        ] = responses.map((res) => asRecordArray(res.data));

        const presentation =
          (risks[0]?.presentation as { projectLabel?: string | null } | undefined) ??
          (decisions[0]?.presentation as { projectLabel?: string | null } | undefined);

        let projectLabel = presentation?.projectLabel ?? null;
        if (projectId && !projectLabel) {
          const projectRes = await fetch(`/api/engineering/projects/${projectId}`).then((r) =>
            parseApiJsonResponse(r),
          );
          if (projectRes.ok && projectRes.data && typeof projectRes.data === "object") {
            const payload = projectRes.data as {
              project?: Record<string, unknown>;
            } & Record<string, unknown>;
            const row = payload.project ?? payload;
            projectLabel = `${String(row.project_name ?? "")} (${String(row.project_code ?? "")})`
              .replace(/\(\)$/, "")
              .trim();
          }
        }

        setSummary({
          decisions: decisions.length,
          actions: actions.length,
          risks: risks.length,
          issues: issues.length,
          technicalQueries: technicalQueries.length,
          lessons: lessons.length,
          assets: assets.length,
          documents: documents.length,
          projectLabel: projectId ? projectLabel : null,
        });
      } catch (err: unknown) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unable to load register summary");
          setSummary(EMPTY_SUMMARY);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  return (
    <>
      <Header
        title="Engineering Reports"
        description="Routes to module reporting surfaces — no universal reporting engine"
      />
      <main
        className="page-main flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-8"
        data-testid="engineering-os-reports"
      >
        <p className="mb-4 text-xs text-muted-foreground" data-testid="engineering-reports-scope">
          Scope: {scopeLabel}
          {summary.projectLabel ? ` · ${summary.projectLabel}` : ""}
        </p>

        <section className="mb-8" aria-label="Register summary" data-testid="engineering-reports-summary">
          <p className="mb-3 text-sm text-muted-foreground">
            Live register counts from Engineering OS registers (same sources as register pages)
          </p>
          {error ? (
            <p className="mb-3 text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {(
              [
                ["Decisions", summary.decisions, "/engineering/decisions"],
                ["Actions", summary.actions, "/engineering/actions"],
                ["Risks", summary.risks, "/engineering/risks"],
                ["Issues", summary.issues, "/engineering/issues"],
                ["Technical Queries", summary.technicalQueries, "/engineering/technical-queries"],
                ["Lessons", summary.lessons, "/engineering/lessons"],
                ["Assets", summary.assets, "/engineering/assets"],
                ["Documents", summary.documents, "/engineering/documents"],
              ] as const
            ).map(([label, value, href]) => (
              <Link key={label} href={href}>
                <Card className="transition hover:border-slate-400">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-semibold tabular-nums">
                      {loading ? "…" : value}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          {!loading && !error && summary.risks === 0 && summary.decisions === 0 ? (
            <p
              className="mt-3 text-sm text-muted-foreground"
              data-testid="engineering-reports-empty"
            >
              No register records in the current scope.
            </p>
          ) : null}
        </section>

        <section className="mb-8" aria-label="Module reporting">
          <p className="mb-3 text-sm text-muted-foreground">
            Module report entry points — entitlement state matches commerce (locked modules are not
            clickable)
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            {ENGINEERING_CERTIFIED_V1_MODULES.map((route) => {
              const access = moduleAccess[route.key];
              const included = access?.allowed === true;
              const label = moduleAccessLoading
                ? "Checking…"
                : (access?.uiLabel ?? "Unavailable");
              const card = (
                <Card
                  className={included ? "transition hover:border-slate-400" : "opacity-90"}
                  data-access-state={access?.uiState ?? "unavailable"}
                  data-testid={`report-module-${route.key}`}
                >
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-base">{route.reportLabel}</CardTitle>
                    <Badge variant={included ? "secondary" : "outline"}>{label}</Badge>
                  </CardHeader>
                  {!moduleAccessLoading && !included ? (
                    <CardContent>
                      <p className="text-xs text-amber-800">
                        Not included in the current plan. Backend commerce denial remains
                        authoritative.
                      </p>
                    </CardContent>
                  ) : null}
                </Card>
              );
              if (!included) {
                return (
                  <div key={route.key} aria-disabled="true">
                    {card}
                  </div>
                );
              }
              return (
                <Link key={route.key} href={route.reportHref}>
                  {card}
                </Link>
              );
            })}
          </div>
        </section>

        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Engineering register report entry points (navigate to source registers)
          </p>
          <Button size="sm" disabled title="Export is not implemented in Engineering OS V1">
            Generate Export (not available in V1)
          </Button>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {REPORT_TEMPLATES.map((template) => (
            <Link key={template.name} href={template.href}>
              <Card className="transition hover:border-slate-400" data-testid={`report-shell-${template.register}`}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base">{template.name}</CardTitle>
                  <Badge variant="secondary">register</Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Opens the {template.register} register. Honors header project scope. Export remains
                    a V1 capability gap.
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}
