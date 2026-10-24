import { describe, expect, it } from "vitest";
import { createTestCommerceExecutionContext } from "@rtb/platform-commerce/server";
import {
  assertConstraint,
  assertDesignVariable,
  assertObjective,
  assertStudyMutable,
  compareConstraint,
} from "./invariants";
import { canonicalizeBaselineItems, fingerprintBaselineItems } from "./fingerprint";
import { computeParetoSet, evaluateConstraints, isFeasible } from "./analysis";
import { contextStaleness, preflightStudy } from "./preflight";
import { OptimizationStudyService } from "./study-service";
import { OptimizationRunService } from "./run-service";
import { A5_WRITABLE_RELATIONS, isGovernedRelationType } from "../decision-intelligence/relations";

type Row = Record<string, unknown>;

function createStore() {
  return {
    engineering_optimization_studies: [] as Row[],
    engineering_optimization_objectives: [] as Row[],
    engineering_optimization_constraints: [] as Row[],
    engineering_optimization_design_variables: [] as Row[],
    engineering_optimization_scenarios: [] as Row[],
    engineering_optimization_alternatives: [] as Row[],
    engineering_optimization_alternative_values: [] as Row[],
    engineering_optimization_runs: [] as Row[],
    engineering_optimization_run_inputs: [] as Row[],
    engineering_optimization_run_manifests: [] as Row[],
    engineering_optimization_result_metrics: [] as Row[],
    engineering_optimization_constraint_evaluations: [] as Row[],
    engineering_configuration_baselines: [] as Row[],
    engineering_configuration_items: [] as Row[],
    engineering_object_links: [] as Row[],
    engineering_systems: [] as Row[],
    engineering_decisions: [] as Row[],
    engineering_requirements: [] as Row[],
    engineering_assumptions: [] as Row[],
    engineering_interfaces: [] as Row[],
    engineering_timeline_events: [] as Row[],
    engineering_activity_events: [] as Row[],
    background_jobs: [] as Row[],
    job_attempts: [] as Row[],
  };
}

function eqFilter(rows: Row[], captured: Array<[string, unknown]>) {
  return rows.filter((row) => captured.every(([col, val]) => row[col] === val));
}

function mockSupabase(tables: Record<string, Row[]>) {
  const from = (table: string) => {
    const captured: Array<[string, unknown]> = [];
    const state: { patch?: Row; insertRows?: Row[]; deleting?: boolean } = {};
    const applyInsert = () => {
      if (!state.insertRows) return;
      tables[table] = tables[table] ?? [];
      tables[table].push(...state.insertRows);
    };
    const query = {
      select: () => query,
      insert: (row: Row | Row[]) => {
        const rows = Array.isArray(row) ? row : [row];
        state.insertRows = rows.map((item, index) => ({
          id: item.id ?? `${table}-${(tables[table] ?? []).length + index + 1}`,
          created_at: item.created_at ?? "t0",
          updated_at: item.updated_at ?? "t0",
          ...item,
        }));
        return query;
      },
      update: (row: Row) => {
        state.patch = row;
        return query;
      },
      upsert: (row: Row | Row[]) => {
        const rows = Array.isArray(row) ? row : [row];
        state.insertRows = rows.map((item, index) => ({
          id: item.id ?? `${table}-upsert-${(tables[table] ?? []).length + index + 1}`,
          ...item,
        }));
        return query;
      },
      delete: () => {
        state.deleting = true;
        return query;
      },
      eq: (col: string, val: unknown) => {
        captured.push([col, val]);
        return query;
      },
      in: () => query,
      order: () => query,
      limit: () => query,
      or: () => query,
      maybeSingle: () => {
        const rows = eqFilter(tables[table] ?? [], captured);
        if (state.patch && rows[0]) Object.assign(rows[0], state.patch);
        return Promise.resolve({ data: rows[0] ?? null, error: null });
      },
      single: () => {
        if (state.insertRows) {
          applyInsert();
          return Promise.resolve({ data: state.insertRows[0], error: null });
        }
        const rows = eqFilter(tables[table] ?? [], captured);
        if (state.patch && rows[0]) {
          Object.assign(rows[0], state.patch);
          return Promise.resolve({ data: rows[0], error: null });
        }
        return Promise.resolve({
          data: rows[0] ?? null,
          error: rows[0] ? null : { message: "not found" },
        });
      },
      then: (resolve: (value: { data: Row[]; error: null; count: number }) => void) => {
        if (state.deleting) {
          tables[table] = (tables[table] ?? []).filter((row) => !eqFilter([row], captured).length);
          resolve({ data: [], error: null, count: 0 });
          return;
        }
        if (state.insertRows) {
          applyInsert();
          resolve({ data: state.insertRows, error: null, count: state.insertRows.length });
          return;
        }
        let rows = eqFilter(tables[table] ?? [], captured);
        if (state.patch) {
          for (const row of rows) Object.assign(row, state.patch);
        }
        resolve({ data: rows, error: null, count: rows.length });
      },
    };
    return query;
  };
  return { from };
}

function commerce(workspaceId = "ws-a", action = "optimization.write") {
  return createTestCommerceExecutionContext({
    tenantId: "tenant-a",
    workspaceId,
    policy: {
      productKey: "engineering-os",
      action,
      seatRequired: true,
    },
  });
}

describe("EOS-A5 optimization invariants", () => {
  it("validates objective directions and TARGET distance treatment", () => {
    expect(() => assertObjective({ objective_code: "O1", name: "Mass", metric_key: "MASS", direction: "MINIMIZE" })).not.toThrow();
    expect(() =>
      assertObjective({ objective_code: "O2", name: "Gap", metric_key: "GAP", direction: "TARGET" }),
    ).toThrow(/target_value/);
    expect(() =>
      assertObjective({
        objective_code: "O2",
        name: "Gap",
        metric_key: "GAP",
        direction: "TARGET",
        target_value: 12,
      }),
    ).not.toThrow();
    expect(() =>
      assertObjective({ objective_code: "O3", name: "X", metric_key: "X", direction: "BEST" }),
    ).toThrow(/objective direction/);
  });

  it("validates structured constraints and rejects SQL-like expressions", () => {
    expect(
      compareConstraint("<=", 0.92, 1.0),
    ).toBe(true);
    expect(() =>
      assertConstraint({
        constraint_code: "C1",
        name: "Util",
        constraint_kind: "ANALYSIS_LIMIT",
        metric_key: "UTILIZATION",
        operator: "<=",
        threshold_value: 1,
      }),
    ).not.toThrow();
    expect(() =>
      assertConstraint({
        constraint_code: "C2",
        name: "drop table",
        constraint_kind: "RULE",
        metric_key: "x; drop table y",
        operator: "<=",
        threshold_value: 1,
      }),
    ).toThrow(/executable/);
  });

  it("validates design variables and alternative bounds", () => {
    expect(() =>
      assertDesignVariable({
        variable_code: "V1",
        name: "Depth",
        variable_type: "CONTINUOUS",
        lower_bound: 200,
        upper_bound: 600,
      }),
    ).not.toThrow();
    expect(() =>
      assertDesignVariable({
        variable_code: "V2",
        name: "Grade",
        variable_type: "CATEGORICAL",
      }),
    ).toThrow(/allowed_values/);
    expect(() => assertStudyMutable("ready")).toThrow(/locked/);
  });

  it("treats only HARD constraint failures as infeasible", () => {
    const evaluations = evaluateConstraints(
      [
        { id: "h", metric_key: "UTILIZATION", operator: "<=", threshold_value: 1, hardness: "HARD" },
        { id: "s", metric_key: "COST", operator: "<=", threshold_value: 100, hardness: "SOFT" },
      ],
      [
        { metric_key: "UTILIZATION", value: 0.9 },
        { metric_key: "COST", value: 140 },
      ],
    );
    expect(isFeasible(evaluations)).toBe(true);
    const hardFail = evaluateConstraints(
      [{ id: "h", metric_key: "UTILIZATION", operator: "<=", threshold_value: 1, hardness: "HARD" }],
      [{ metric_key: "UTILIZATION", value: 1.08 }],
    );
    expect(isFeasible(hardFail)).toBe(false);
    expect(hardFail[0].margin).toBeCloseTo(-0.08);
  });

  it("computes deterministic Pareto without scalarization or a best alternative", () => {
    const result = computeParetoSet(
      [
        { id: "o1", metric_key: "MASS", direction: "MINIMIZE" },
        { id: "o2", metric_key: "CAPACITY", direction: "MAXIMIZE" },
      ],
      [
        { alternativeId: "a", runId: "r1", feasible: true, metrics: [{ metric_key: "MASS", value: 10 }, { metric_key: "CAPACITY", value: 5 }] },
        { alternativeId: "b", runId: "r2", feasible: true, metrics: [{ metric_key: "MASS", value: 12 }, { metric_key: "CAPACITY", value: 5 }] },
        { alternativeId: "c", runId: "r3", feasible: false, metrics: [{ metric_key: "MASS", value: 1 }, { metric_key: "CAPACITY", value: 99 }] },
      ],
    );
    expect(result.find((row) => row.runId === "r1")?.status).toBe("pareto-optimal");
    expect(result.find((row) => row.runId === "r2")?.status).toBe("dominated");
    expect(result.find((row) => row.runId === "r3")?.status).toBe("infeasible");
    expect(JSON.stringify(result)).not.toMatch(/recommended|best|selected/i);
  });

  it("treats TARGET as minimize |value-target|", () => {
    const result = computeParetoSet(
      [{ id: "o", metric_key: "PERIOD", direction: "TARGET", target_value: 10 }],
      [
        { alternativeId: "a", runId: "r1", feasible: true, metrics: [{ metric_key: "PERIOD", value: 11 }] },
        { alternativeId: "b", runId: "r2", feasible: true, metrics: [{ metric_key: "PERIOD", value: 10 }] },
      ],
    );
    expect(result.find((row) => row.runId === "r2")?.status).toBe("pareto-optimal");
    expect(result.find((row) => row.runId === "r1")?.status).toBe("dominated");
  });

  it("fingerprints ordered baseline items without timestamps", () => {
    const items = [
      { configuration_item_id: "2", object_type: "document", object_id: "d2", object_title_snapshot: "B" },
      { configuration_item_id: "1", object_type: "document", object_id: "d1", object_title_snapshot: "A" },
    ];
    const reversed = [...items].reverse();
    expect(fingerprintBaselineItems(items)).toBe(fingerprintBaselineItems(reversed));
    expect(canonicalizeBaselineItems(items)[0].object_id).toBe("d1");
    const hashed = fingerprintBaselineItems(items);
    expect(hashed).toMatch(/^[a-f0-9]{64}$/);
    expect(hashed).not.toMatch(/T\d{2}:/);
  });

  it("requires frozen baseline, system scope, decision, and declared context in preflight", () => {
    const failed = preflightStudy({
      workspaceId: "ws",
      projectId: "p",
      systemScopeCount: 0,
      baselineId: null,
      decisionId: null,
      requirementsContext: "UNDECLARED",
      assumptionsContext: "UNDECLARED",
      interfacesContext: "UNDECLARED",
      objectiveCount: 0,
      alternativeCount: 0,
    });
    expect(failed.ok).toBe(false);
    expect(failed.failures.map((f) => f.code)).toEqual(
      expect.arrayContaining(["system_scope", "baseline", "decision", "requirements_context", "objectives", "alternatives"]),
    );
    expect(
      preflightStudy({
        workspaceId: "ws",
        projectId: "p",
        systemScopeCount: 1,
        baselineId: "bl",
        baselineStatus: "frozen",
        baselineWorkspaceId: "ws",
        baselineProjectId: "p",
        decisionId: "dec",
        decisionWorkspaceId: "ws",
        decisionProjectId: "p",
        requirementsContext: "NONE_APPLICABLE",
        assumptionsContext: "NONE_MATERIAL",
        interfacesContext: "NONE_APPLICABLE",
        objectiveCount: 1,
        alternativeCount: 1,
      }).ok,
    ).toBe(true);
    expect(contextStaleness({ studyBaselineId: "b1", currentFrozenBaselineId: "b2" })).toBe("STALE");
    expect(contextStaleness({ studyBaselineId: "b1", currentFrozenBaselineId: "b1" })).toBe("CURRENT");
    expect(
      preflightStudy({
        workspaceId: "ws",
        projectId: "p",
        systemScopeCount: 1,
        baselineId: "bl",
        baselineStatus: "frozen",
        baselineWorkspaceId: "ws",
        baselineProjectId: "p",
        decisionId: "dec",
        decisionWorkspaceId: "ws",
        decisionProjectId: "p",
        requirementsContext: "DECLARED",
        assumptionsContext: "DECLARED",
        interfacesContext: "DECLARED",
        objectiveCount: 1,
        alternativeCount: 1,
        requirementLinkCount: 0,
        materialAssumptionLinkCount: 0,
        interfaceLinkCount: 0,
      }).failures.map((f) => f.code),
    ).toEqual(
      expect.arrayContaining(["requirements_declared_empty", "assumptions_declared_empty", "interfaces_declared_empty"]),
    );
  });

  it("adds SCOPED_TO and CONSTRAINED_BY to the governed taxonomy", () => {
    expect(isGovernedRelationType("SCOPED_TO")).toBe(true);
    expect(isGovernedRelationType("CONSTRAINED_BY")).toBe(true);
    expect(A5_WRITABLE_RELATIONS).toEqual(expect.arrayContaining(["SCOPED_TO", "CONSTRAINED_BY"]));
  });
});

describe("EOS-A5 optimization services", () => {
  it("creates a study, binds frozen context, and refuses READY until preflight passes", async () => {
    const tables = createStore();
    tables.engineering_systems.push({
      id: "sys-1",
      tenant_id: "tenant-a",
      workspace_id: "ws-a",
      project_id: "proj-1",
    });
    tables.engineering_decisions.push({
      id: "dec-1",
      tenant_id: "tenant-a",
      workspace_id: "ws-a",
      project_id: "proj-1",
    });
    tables.engineering_configuration_baselines.push({
      id: "bl-1",
      tenant_id: "tenant-a",
      workspace_id: "ws-a",
      project_id: "proj-1",
      status: "frozen",
    });
    const studies = new OptimizationStudyService(mockSupabase(tables) as never);
    const ctx = commerce();
    const created = (await studies.create(ctx, {
      tenantId: "tenant-a",
      title: "Structural bay study",
      projectId: "proj-1",
      createdBy: "u1",
    })) as Row;
    expect(created.status).toBe("draft");
    await expect(studies.setReady(ctx, "tenant-a", created.id as string)).rejects.toThrow(/not READY/);
    await studies.setContext(ctx, "tenant-a", created.id as string, {
      configurationBaselineId: "bl-1",
      decisionId: "dec-1",
      requirementsContext: "NONE_APPLICABLE",
      assumptionsContext: "NONE_MATERIAL",
      interfacesContext: "NONE_APPLICABLE",
    });
    await studies.setSystemScope(ctx, "tenant-a", created.id as string, ["sys-1"], "u1");
    await studies.addObjective(ctx, "tenant-a", created.id as string, {
      objectiveCode: "MASS",
      name: "Steel mass",
      metricKey: "MASS",
      direction: "MINIMIZE",
      unit: "t",
    });
    await studies.addAlternative(ctx, "tenant-a", created.id as string, {
      alternativeCode: "ALT-A",
      name: "Bay A",
      createdBy: "u1",
    });
    const ready = await studies.setReady(ctx, "tenant-a", created.id as string, "u1");
    expect(ready.status).toBe("ready");
    expect(tables.engineering_object_links[0].relationship).toBe("SCOPED_TO");
  });

  it("rejects cross-workspace baseline and system scope", async () => {
    const tables = createStore();
    tables.engineering_configuration_baselines.push({
      id: "bl-a2",
      tenant_id: "tenant-a",
      workspace_id: "ws-b",
      project_id: "proj-2",
      status: "frozen",
    });
    tables.engineering_systems.push({
      id: "sys-a2",
      tenant_id: "tenant-a",
      workspace_id: "ws-b",
      project_id: "proj-2",
    });
    const studies = new OptimizationStudyService(mockSupabase(tables) as never);
    const ctx = commerce();
    const created = (await studies.create(ctx, { tenantId: "tenant-a", title: "A1", projectId: "proj-1" })) as Row;
    await expect(
      studies.setContext(ctx, "tenant-a", created.id as string, { configurationBaselineId: "bl-a2" }),
    ).rejects.toThrow(/outside study/);
    await expect(studies.setSystemScope(ctx, "tenant-a", created.id as string, ["sys-a2"])).rejects.toThrow(/outside study/);
  });

  it("pins configuration items and keeps run fingerprint after live source mutation", async () => {
    const tables = createStore();
    tables.engineering_configuration_baselines.push({
      id: "bl-1",
      tenant_id: "tenant-a",
      workspace_id: "ws-a",
      project_id: "proj-1",
      status: "frozen",
    });
    tables.engineering_configuration_items.push({
      id: "ci-1",
      baseline_id: "bl-1",
      tenant_id: "tenant-a",
      workspace_id: "ws-a",
      object_type: "document",
      object_id: "doc-1",
      revision_ref: "C",
      object_code_snapshot: "PFD-001",
      object_title_snapshot: "Original",
      effective_state: "issued",
    });
    tables.engineering_optimization_studies.push({
      id: "st-1",
      tenant_id: "tenant-a",
      workspace_id: "ws-a",
      project_id: "proj-1",
      status: "ready",
      configuration_baseline_id: "bl-1",
      decision_id: "dec-1",
      study_code: "OPT-0001",
      title: "Study",
    });
    tables.engineering_optimization_alternatives.push({
      id: "alt-1",
      study_id: "st-1",
      status: "active",
      tenant_id: "tenant-a",
      workspace_id: "ws-a",
      alternative_code: "ALT-A",
      name: "Bay A",
    });
    tables.engineering_optimization_objectives.push({
      id: "o-1",
      study_id: "st-1",
      tenant_id: "tenant-a",
      workspace_id: "ws-a",
      objective_code: "MASS",
      name: "Mass",
      metric_key: "MASS",
      direction: "MINIMIZE",
      unit: "t",
    });
    const runs = new OptimizationRunService(mockSupabase(tables) as never);
    const ctx = commerce();
    const created = (await runs.create(ctx, "tenant-a", { studyId: "st-1", alternativeId: "alt-1" })) as Row;
    const fingerprint = String(created.baseline_fingerprint);
    const inputFp = String(created.run_input_fingerprint);
    expect(fingerprint).toMatch(/^[a-f0-9]{64}$/);
    expect(inputFp).toMatch(/^[a-f0-9]{64}$/);
    expect(inputFp).not.toBe(fingerprint);
    expect(tables.engineering_optimization_run_inputs[0].object_title_snapshot).toBe("Original");
    expect(tables.engineering_optimization_run_manifests[0].run_input_fingerprint).toBe(inputFp);
    tables.engineering_configuration_items[0].object_title_snapshot = "Mutated live title";
    const again = await runs.get(commerce("ws-a", "optimization.read"), "tenant-a", created.id as string);
    expect(again.run.baseline_fingerprint).toBe(fingerprint);
    expect(again.run.run_input_fingerprint).toBe(inputFp);
    expect((again.inputs[0] as Row).object_title_snapshot).toBe("Original");
    expect(fingerprintBaselineItems(again.inputs as never)).toBe(fingerprint);
    expect((again.manifest as Row).run_input_fingerprint).toBe(inputFp);
  });

  it("ingests MANUAL results, evaluates HARD feasibility, and refuses mutation after success", async () => {
    const tables = createStore();
    tables.engineering_optimization_studies.push({
      id: "st-1",
      tenant_id: "tenant-a",
      workspace_id: "ws-a",
      project_id: "proj-1",
      status: "running",
    });
    tables.engineering_optimization_runs.push({
      id: "run-1",
      tenant_id: "tenant-a",
      workspace_id: "ws-a",
      project_id: "proj-1",
      study_id: "st-1",
      alternative_id: "alt-1",
      status: "queued",
      baseline_fingerprint: "abc",
    });
    tables.engineering_optimization_constraints.push({
      id: "c-1",
      study_id: "st-1",
      metric_key: "UTILIZATION",
      operator: "<=",
      threshold_value: 1,
      hardness: "HARD",
      constraint_code: "UTIL",
      name: "Utilization",
    });
    tables.engineering_optimization_objectives.push({
      id: "o-1",
      study_id: "st-1",
      metric_key: "MASS",
      direction: "MINIMIZE",
    });
    const runs = new OptimizationRunService(mockSupabase(tables) as never);
    const ctx = commerce();
    const ingested = await runs.ingestResults(ctx, "tenant-a", "run-1", {
      sourceKind: "MANUAL",
      metrics: [
        { metricKey: "UTILIZATION", value: 1.08 },
        { metricKey: "MASS", value: 12 },
      ],
      actorId: "u1",
    });
    expect(ingested.feasible).toBe(false);
    expect(ingested.sourceKind).toBe("MANUAL");
    await expect(
      runs.ingestResults(ctx, "tenant-a", "run-1", {
        sourceKind: "ADAPTER",
        metrics: [{ metricKey: "MASS", value: 1 }],
      }),
    ).rejects.toThrow(/Untrusted callers/);
    tables.engineering_optimization_runs[0].status = "succeeded";
    await expect(
      runs.ingestResults(ctx, "tenant-a", "run-1", {
        sourceKind: "MANUAL",
        metrics: [{ metricKey: "UTILIZATION", value: 0.9 }],
      }),
    ).rejects.toThrow(/immutable/);
  });
});
