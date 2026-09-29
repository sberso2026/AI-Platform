"use client";

import { useState } from "react";
import { Button, Input, StatusChip } from "@rtb/ui";
import { Header } from "@/components/layout/header";
import { CreateForm, useRegisterList } from "@/components/engineering/register-shell";
import {
  EmptyOperationalState,
  EngineeringBreadcrumb,
  OperationalError,
  OperationalSkeleton,
} from "@/components/engineering/operational";
import { useEngineeringWriteAccess } from "@/hooks/use-engineering-write-access";
import { parseApiJsonResponse } from "@/lib/api/parse-json-response";

type StudyDetail = {
  study: Record<string, unknown>;
  objectives: Record<string, unknown>[];
  constraints: Record<string, unknown>[];
  variables: Record<string, unknown>[];
  scenarios: Record<string, unknown>[];
  alternatives: Record<string, unknown>[];
  runs: Record<string, unknown>[];
  systemScopeIds: string[];
  contextState: "CURRENT" | "STALE";
};

type TabId =
  | "context"
  | "objectives"
  | "constraints"
  | "variables"
  | "scenarios"
  | "alternatives"
  | "runs"
  | "results";

const TABS: { id: TabId; label: string }[] = [
  { id: "context", label: "Context" },
  { id: "objectives", label: "Objectives" },
  { id: "constraints", label: "Constraints" },
  { id: "variables", label: "Variables" },
  { id: "scenarios", label: "Scenarios" },
  { id: "alternatives", label: "Alternatives" },
  { id: "runs", label: "Runs" },
  { id: "results", label: "Results" },
];

export function OptimizationWorkspace() {
  const { items, loading, error, reload, projectId } = useRegisterList("/api/engineering/optimization");
  const { canMutate } = useEngineeringWriteAccess();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<StudyDetail | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [tab, setTab] = useState<TabId>("context");
  const [preflight, setPreflight] = useState<{ ok: boolean; failures: { code: string; message: string }[] } | null>(null);
  const [pareto, setPareto] = useState<Record<string, unknown>[] | null>(null);
  const [feasibility, setFeasibility] = useState<Record<string, unknown> | null>(null);

  async function openDetail(id: string) {
    setSelectedId(id);
    setDetailError(null);
    setPreflight(null);
    setPareto(null);
    setFeasibility(null);
    const response = await fetch(`/api/engineering/optimization?id=${encodeURIComponent(id)}`);
    const parsed = await parseApiJsonResponse(response);
    if (!parsed.ok || !parsed.data || typeof parsed.data !== "object") {
      setDetail(null);
      setDetailError(parsed.errorMessage ?? "Failed to load study");
      return;
    }
    setDetail(parsed.data as StudyDetail);
  }

  async function post(body: Record<string, unknown>) {
    await fetch("/api/engineering/optimization", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (selectedId) await openDetail(selectedId);
    reload();
  }

  async function loadPreflight(id: string) {
    const response = await fetch(`/api/engineering/optimization?id=${encodeURIComponent(id)}&action=preflight`);
    const parsed = await parseApiJsonResponse(response);
    if (parsed.ok && parsed.data && typeof parsed.data === "object") {
      setPreflight(parsed.data as { ok: boolean; failures: { code: string; message: string }[] });
    }
  }

  async function loadPareto(id: string) {
    const response = await fetch(`/api/engineering/optimization?id=${encodeURIComponent(id)}&action=pareto`);
    const parsed = await parseApiJsonResponse(response);
    if (parsed.ok && Array.isArray(parsed.data)) setPareto(parsed.data as Record<string, unknown>[]);
  }

  async function loadFeasibility(runId: string) {
    const response = await fetch(`/api/engineering/optimization?runId=${encodeURIComponent(runId)}&action=feasibility`);
    const parsed = await parseApiJsonResponse(response);
    if (parsed.ok && parsed.data && typeof parsed.data === "object") {
      setFeasibility(parsed.data as Record<string, unknown>);
    }
  }

  const study = detail?.study;

  return (
    <>
      <Header
        title="Optimization"
        description="Governed engineering trade-offs. Pareto-optimal alternatives are not engineering-approved choices. Decision Intelligence remains the selection authority. SPACE GASS trial use is DEVELOPMENT / EVALUATION only."
      />
      <main className="page-main flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-8" data-testid="page-main">
        {projectId ? (
          <EngineeringBreadcrumb
            items={[
              { href: "/engineering/projects", label: "Projects" },
              { href: `/engineering/projects/${projectId}`, label: "Selected project" },
              { label: "Optimization" },
            ]}
          />
        ) : null}
        <div className="mb-4 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
          DEVELOPMENT / EVALUATION. Trial licences are not production-ready. Pareto-optimal is not an approved design. Human selection is required. Design-code compliance is not assessed unless a certified design-check capability exists.
        </div>
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{loading ? "Loading…" : `${items.length} studies`}</p>
          <CreateForm
            fields={[
              { key: "title", label: "Title", required: true },
              { key: "lifecycleStage", label: "Lifecycle stage (FEED|DETAILED_DESIGN|…)" },
              { key: "studyCode", label: "Study code (optional)" },
              { key: "description", label: "Description", multiline: true },
            ]}
            endpoint="/api/engineering/optimization"
            extra={projectId ? { projectId } : {}}
            onCreated={reload}
            enabled={canMutate}
          />
        </div>
        {error ? <OperationalError message={error} /> : null}
        {loading ? <OperationalSkeleton /> : null}
        {!loading && !error && items.length === 0 ? (
          <EmptyOperationalState
            title="No optimization studies"
            description="Define a study against frozen engineering context. Optimization reports feasible trade-offs; it does not approve them."
          />
        ) : null}
        {!loading && items.length > 0 ? (
          <div className="grid gap-3">
            {items.map((item) => {
              const id = String(item.id ?? "");
              const open = selectedId === id;
              return (
                <div key={id} className="rounded-lg border border-slate-200 bg-white p-4">
                  <button type="button" className="flex w-full items-start justify-between gap-4 text-left" onClick={() => void openDetail(id)}>
                    <div>
                      <p className="font-medium">
                        {String(item.study_code ?? "")} — {String(item.title ?? "")}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {String(item.lifecycle_stage ?? "")} · baseline {String(item.configuration_baseline_id ?? "unset").slice(0, 8)}
                      </p>
                    </div>
                    <StatusChip value={String(item.status ?? "")} />
                  </button>
                  {open ? (
                    <div className="mt-4 border-t border-slate-100 pt-4">
                      {detailError ? <OperationalError message={detailError} /> : null}
                      {study ? (
                        <>
                          <div className="mb-3 flex flex-wrap gap-2">
                            {TABS.map((entry) => (
                              <button
                                key={entry.id}
                                type="button"
                                className={`rounded px-3 py-1 text-sm ${tab === entry.id ? "bg-slate-900 text-white" : "bg-slate-100"}`}
                                onClick={() => setTab(entry.id)}
                              >
                                {entry.label}
                              </button>
                            ))}
                          </div>
                          <p className="mb-3 text-sm text-muted-foreground">
                            Context {detail?.contextState ?? "CURRENT"} · systems {detail?.systemScopeIds.length ?? 0} ·
                            alternatives {detail?.alternatives.length ?? 0} · completed runs{" "}
                            {(detail?.runs ?? []).filter((run) => String(run.status) === "succeeded").length}
                          </p>
                          {tab === "context" ? (
                            <ContextTab
                              study={study}
                              canMutate={canMutate}
                              preflight={preflight}
                              onPreflight={() => void loadPreflight(id)}
                              onPost={post}
                            />
                          ) : null}
                          {tab === "objectives" ? (
                            <SimpleAdd
                              canMutate={canMutate}
                              rows={detail?.objectives ?? []}
                              codeKey="objective_code"
                              extraKeys={["direction", "metric_key"]}
                              fields={[
                                { key: "objectiveCode", label: "Code" },
                                { key: "name", label: "Name" },
                                { key: "metricKey", label: "Metric key" },
                                { key: "direction", label: "MINIMIZE|MAXIMIZE|TARGET" },
                                { key: "unit", label: "Unit" },
                                { key: "targetValue", label: "Target (TARGET only)" },
                              ]}
                              onAdd={(values) =>
                                void post({
                                  action: "add_objective",
                                  id,
                                  ...values,
                                  targetValue: values.targetValue ? Number(values.targetValue) : null,
                                })
                              }
                            />
                          ) : null}
                          {tab === "constraints" ? (
                            <SimpleAdd
                              canMutate={canMutate}
                              rows={detail?.constraints ?? []}
                              codeKey="constraint_code"
                              extraKeys={["hardness", "operator", "threshold_value"]}
                              fields={[
                                { key: "constraintCode", label: "Code" },
                                { key: "name", label: "Name" },
                                { key: "constraintKind", label: "Kind" },
                                { key: "metricKey", label: "Metric key" },
                                { key: "operator", label: "Operator <= >= = < >" },
                                { key: "thresholdValue", label: "Threshold" },
                                { key: "hardness", label: "HARD|SOFT" },
                              ]}
                              onAdd={(values) =>
                                void post({
                                  action: "add_constraint",
                                  id,
                                  ...values,
                                  thresholdValue: values.thresholdValue ? Number(values.thresholdValue) : null,
                                })
                              }
                            />
                          ) : null}
                          {tab === "variables" ? (
                            <SimpleAdd
                              canMutate={canMutate}
                              rows={detail?.variables ?? []}
                              codeKey="variable_code"
                              extraKeys={["variable_type"]}
                              fields={[
                                { key: "variableCode", label: "Code" },
                                { key: "name", label: "Name" },
                                { key: "variableType", label: "CONTINUOUS|INTEGER|DISCRETE|CATEGORICAL|BOOLEAN" },
                                { key: "lowerBound", label: "Lower bound" },
                                { key: "upperBound", label: "Upper bound" },
                              ]}
                              onAdd={(values) =>
                                void post({
                                  action: "add_variable",
                                  id,
                                  ...values,
                                  lowerBound: values.lowerBound ? Number(values.lowerBound) : null,
                                  upperBound: values.upperBound ? Number(values.upperBound) : null,
                                })
                              }
                            />
                          ) : null}
                          {tab === "scenarios" ? (
                            <SimpleAdd
                              canMutate={canMutate}
                              rows={detail?.scenarios ?? []}
                              codeKey="scenario_code"
                              extraKeys={[]}
                              fields={[
                                { key: "scenarioCode", label: "Code" },
                                { key: "name", label: "Name" },
                                { key: "description", label: "Description" },
                              ]}
                              onAdd={(values) => void post({ action: "add_scenario", id, ...values })}
                            />
                          ) : null}
                          {tab === "alternatives" ? (
                            <SimpleAdd
                              canMutate={canMutate}
                              rows={detail?.alternatives ?? []}
                              codeKey="alternative_code"
                              extraKeys={["status"]}
                              fields={[
                                { key: "alternativeCode", label: "Code" },
                                { key: "name", label: "Name" },
                                { key: "description", label: "Description" },
                                { key: "decisionAlternativeId", label: "Decision alternative id (optional)" },
                              ]}
                              onAdd={(values) => void post({ action: "add_alternative", id, ...values })}
                            />
                          ) : null}
                          {tab === "runs" ? (
                            <RunsTab
                              runs={detail?.runs ?? []}
                              alternatives={detail?.alternatives ?? []}
                              canMutate={canMutate}
                              onQueue={(alternativeId) => void post({ action: "queue_run", id, alternativeId })}
                              onFeasibility={(runId) => void loadFeasibility(runId)}
                              feasibility={feasibility}
                            />
                          ) : null}
                          {tab === "results" ? (
                            <ResultsTab
                              studyId={id}
                              pareto={pareto}
                              onPareto={() => void loadPareto(id)}
                            />
                          ) : null}
                        </>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : null}
      </main>
    </>
  );
}

function ContextTab({
  study,
  canMutate,
  preflight,
  onPreflight,
  onPost,
}: {
  study: Record<string, unknown>;
  canMutate: boolean;
  preflight: { ok: boolean; failures: { code: string; message: string }[] } | null;
  onPreflight: () => void;
  onPost: (body: Record<string, unknown>) => void;
}) {
  const [baselineId, setBaselineId] = useState("");
  const [decisionId, setDecisionId] = useState("");
  const [systemId, setSystemId] = useState("");
  const [requirementId, setRequirementId] = useState("");
  const [assumptionId, setAssumptionId] = useState("");
  const [interfaceId, setInterfaceId] = useState("");
  const [reqCtx, setReqCtx] = useState("NONE_APPLICABLE");
  const [asmCtx, setAsmCtx] = useState("NONE_MATERIAL");
  const [ifcCtx, setIfcCtx] = useState("NONE_APPLICABLE");
  return (
    <div className="space-y-3 text-sm">
      <p>
        Discipline STRUCTURAL when this is the structural optimization pilot. Solver and licence status are read from
        Settings → External Tools & Integrations → SPACE GASS, not duplicated here.
      </p>
      <p>
        Requirements {String(study.requirements_context)} · Assumptions {String(study.assumptions_context)} ·
        Interfaces {String(study.interfaces_context)}
      </p>
      <p>Decision {String(study.decision_id ?? "unset")} · Baseline {String(study.configuration_baseline_id ?? "unset")}</p>
      {canMutate ? (
        <div className="flex flex-wrap gap-2">
          <Input value={baselineId} onChange={(e) => setBaselineId(e.target.value)} placeholder="Frozen baseline id" />
          <Input value={decisionId} onChange={(e) => setDecisionId(e.target.value)} placeholder="Decision id" />
          <Input value={reqCtx} onChange={(e) => setReqCtx(e.target.value)} placeholder="Requirements DECLARED|NONE_APPLICABLE" />
          <Input value={asmCtx} onChange={(e) => setAsmCtx(e.target.value)} placeholder="Assumptions DECLARED|NONE_MATERIAL" />
          <Input value={ifcCtx} onChange={(e) => setIfcCtx(e.target.value)} placeholder="Interfaces DECLARED|NONE_APPLICABLE" />
          <Button
            type="button"
            onClick={() =>
              onPost({
                action: "set_context",
                id: study.id,
                configurationBaselineId: baselineId || undefined,
                decisionId: decisionId || undefined,
                requirementsContext: reqCtx,
                assumptionsContext: asmCtx,
                interfacesContext: ifcCtx,
              })
            }
          >
            Set context
          </Button>
          <Input value={systemId} onChange={(e) => setSystemId(e.target.value)} placeholder="System id" />
          <Button type="button" onClick={() => onPost({ action: "set_scope", id: study.id, systemIds: [systemId] })}>
            Scope to system
          </Button>
          <Input value={requirementId} onChange={(e) => setRequirementId(e.target.value)} placeholder="Requirement id" />
          <Button type="button" onClick={() => onPost({ action: "link_requirement", id: study.id, requirementId })}>
            Link requirement
          </Button>
          <Input value={assumptionId} onChange={(e) => setAssumptionId(e.target.value)} placeholder="Assumption id" />
          <Button type="button" onClick={() => onPost({ action: "link_assumption", id: study.id, assumptionId })}>
            Link assumption
          </Button>
          <Input value={interfaceId} onChange={(e) => setInterfaceId(e.target.value)} placeholder="Interface id" />
          <Button type="button" onClick={() => onPost({ action: "link_interface", id: study.id, interfaceId })}>
            Link interface
          </Button>
          <Button type="button" onClick={onPreflight}>
            Preflight
          </Button>
          <Button type="button" onClick={() => onPost({ action: "set_ready", id: study.id })}>
            Set READY
          </Button>
        </div>
      ) : null}
      {preflight ? (
        <div className="rounded border border-slate-200 p-3">
          <p>{preflight.ok ? "Preflight passed" : "Preflight failures"}</p>
          <ul className="mt-2 list-disc pl-5">
            {preflight.failures.map((failure) => (
              <li key={failure.code}>
                {failure.code}: {failure.message}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function SimpleAdd({
  canMutate,
  rows,
  codeKey,
  extraKeys,
  fields,
  onAdd,
}: {
  canMutate: boolean;
  rows: Record<string, unknown>[];
  codeKey: string;
  extraKeys: string[];
  fields: { key: string; label: string }[];
  onAdd: (values: Record<string, string>) => void;
}) {
  const [values, setValues] = useState<Record<string, string>>({});
  return (
    <div className="space-y-3">
      {rows.map((row) => (
        <p key={String(row.id)} className="text-sm">
          {String(row[codeKey] ?? "")} — {String(row.name ?? "")}{" "}
          {extraKeys.map((key) => `${key}=${String(row[key] ?? "")}`).join(" ")}
        </p>
      ))}
      {canMutate ? (
        <div className="flex flex-wrap gap-2">
          {fields.map((field) => (
            <Input
              key={field.key}
              value={values[field.key] ?? ""}
              placeholder={field.label}
              onChange={(e) => setValues((current) => ({ ...current, [field.key]: e.target.value }))}
            />
          ))}
          <Button type="button" onClick={() => onAdd(values)}>
            Add
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function RunsTab({
  runs,
  alternatives,
  canMutate,
  onQueue,
  onFeasibility,
  feasibility,
}: {
  runs: Record<string, unknown>[];
  alternatives: Record<string, unknown>[];
  canMutate: boolean;
  onQueue: (alternativeId: string) => void;
  onFeasibility: (runId: string) => void;
  feasibility: Record<string, unknown> | null;
}) {
  const [altId, setAltId] = useState(String(alternatives[0]?.id ?? ""));
  return (
    <div className="space-y-3 text-sm">
      {runs.map((run) => (
        <div key={String(run.id)} className="rounded border border-slate-100 p-2">
          <p>
            Run {String(run.id).slice(0, 8)} · {String(run.status)} · baseline {String(run.baseline_fingerprint ?? "").slice(0, 12)} ·
            input {String(run.run_input_fingerprint ?? "").slice(0, 12)}
          </p>
          <Button type="button" onClick={() => onFeasibility(String(run.id))}>
            Feasibility
          </Button>
        </div>
      ))}
      {canMutate ? (
        <div className="flex gap-2">
          <Input value={altId} onChange={(e) => setAltId(e.target.value)} placeholder="Alternative id" />
          <Button type="button" onClick={() => onQueue(altId)}>
            Queue run
          </Button>
        </div>
      ) : null}
      {feasibility ? (
        <pre className="overflow-auto rounded bg-slate-50 p-2 text-xs">{JSON.stringify(feasibility, null, 2)}</pre>
      ) : null}
    </div>
  );
}

function ResultsTab({
  studyId,
  pareto,
  onPareto,
}: {
  studyId: string;
  pareto: Record<string, unknown>[] | null;
  onPareto: () => void;
}) {
  return (
    <div className="space-y-3 text-sm">
      <p>
        Trade-off table. Pareto-optimal means non-dominated among complete alternatives that satisfy pilot constraints. evaluation-incomplete and
        infeasible alternatives are excluded from dominance. Status language is Pareto-optimal, Non-dominated, Dominated, Pilot constraints satisfied, Pilot constraints not satisfied, Evaluation incomplete, Human selection required. Optimization does not approve or select a Decision alternative.
      </p>
      <Button type="button" onClick={onPareto}>
        Compute Pareto set
      </Button>
      {pareto ? (
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr>
              <th className="border-b p-2">Alternative</th>
              <th className="border-b p-2">Run</th>
              <th className="border-b p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {pareto.map((row) => (
              <tr key={`${row.runId}`}>
                <td className="border-b p-2">{String(row.alternativeId).slice(0, 8)}</td>
                <td className="border-b p-2">{String(row.runId).slice(0, 8)}</td>
                <td className="border-b p-2">{String(row.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-muted-foreground">No Pareto snapshot computed for study {studyId.slice(0, 8)}.</p>
      )}
    </div>
  );
}
