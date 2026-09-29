import { describe, expect, it } from "vitest";
import { JobService } from "@rtb/platform-kernel";
import { createTestCommerceExecutionContext } from "@rtb/platform-commerce/server";
import { computeParetoSet } from "./analysis";
import { contextStaleness } from "./preflight";
import { fingerprintStudyContext, requirementContextProjection, assumptionContextProjection, interfaceContextProjection } from "./context-hash";
import {
  buildRunInputManifest,
  CERTIFICATION_STUB_ADAPTER_ID,
  fingerprintRunInputManifest,
  MANIFEST_SCHEMA_VERSION,
  type ManifestBuildInput,
} from "./manifest";
import { registerOptimizationEvaluateHandler } from "./job-handler";
import { OptimizationRunService } from "./run-service";
import { OptimizationStudyService } from "./study-service";

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
          retry_count: item.retry_count ?? 0,
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

function commerce() {
  return createTestCommerceExecutionContext({
    tenantId: "tenant-a",
    workspaceId: "ws-a",
    policy: {
      productKey: "engineering-os",
      action: "optimization.write",
      seatRequired: true,
    },
  });
}

function baseManifest(overrides: Partial<ManifestBuildInput> = {}): ManifestBuildInput {
  return {
    studyId: "st-1",
    lifecycleStage: "FEED",
    baselineId: "bl-1",
    baselineFingerprint: "a".repeat(64),
    pinnedItems: [
      {
        configuration_item_id: "ci-1",
        object_type: "document",
        object_id: "doc-1",
        revision_ref: "C",
        object_code_snapshot: "PFD-001",
        object_title_snapshot: "Original",
        effective_state: "issued",
      },
    ],
    systems: [{ id: "sys-1", system_code: "S1", status: "active" }],
    decisionId: "dec-1",
    requirements: [
      {
        id: "req-1",
        requirement_code: "REQ-1",
        statement: "Limit mass",
        acceptance_criteria: "mass <= 20 t",
        verification_method: "ANALYSIS",
        verification_status: "unverified",
        title: "display only",
      },
    ],
    assumptions: [
      {
        id: "asm-1",
        statement: "Grade 350",
        confidence: 0.8,
        validation_status: "validated",
        materiality: "high",
        title: "display only",
      },
    ],
    interfaces: [
      {
        id: "ifc-1",
        interface_code: "IF-1",
        interface_type: "STRUCTURAL",
        status: "defined",
        criticality: "high",
        name: "display only",
      },
    ],
    objectives: [{ id: "o-1", objective_code: "MASS", metric_key: "MASS", direction: "MINIMIZE", target_value: null, unit: "t" }],
    constraints: [
      {
        id: "c-1",
        constraint_code: "UTIL",
        metric_key: "UTILIZATION",
        operator: "<=",
        threshold_value: 1,
        unit: null,
        hardness: "HARD",
        source_object_type: null,
        source_object_id: null,
      },
    ],
    variables: [
      {
        id: "v-1",
        variable_code: "W",
        variable_type: "CONTINUOUS",
        unit: "mm",
        lower_bound: 200,
        upper_bound: 400,
        allowed_values: null,
      },
    ],
    scenario: { id: "sc-1", scenario_code: "ULS", name: "ULS", description: "combo A" },
    alternative: { id: "alt-1", alternative_code: "ALT-A", name: "Bay A" },
    alternativeValues: [{ variable_id: "v-1", numeric_value: 300, text_value: null }],
    adapterId: CERTIFICATION_STUB_ADAPTER_ID,
    adapterVersion: "a5c-1.0.0",
    algorithmId: null,
    algorithmVersion: null,
    randomSeed: "seed-1",
    ...overrides,
  };
}

describe("EOS-A5C run input fingerprint matrix", () => {
  it("TEST A: identical manifests hash identically regardless of key order", () => {
    const a = fingerprintRunInputManifest(buildRunInputManifest(baseManifest()));
    const b = fingerprintRunInputManifest(buildRunInputManifest(baseManifest()));
    expect(a).toBe(b);
    expect(MANIFEST_SCHEMA_VERSION).toBe(1);
  });

  it("TEST B: objective change changes fingerprint", () => {
    const a = fingerprintRunInputManifest(buildRunInputManifest(baseManifest()));
    const b = fingerprintRunInputManifest(
      buildRunInputManifest(
        baseManifest({
          objectives: [{ id: "o-1", objective_code: "MASS", metric_key: "MASS", direction: "MAXIMIZE", unit: "t" }],
        }),
      ),
    );
    expect(a).not.toBe(b);
  });

  it("TEST C: HARD constraint threshold change changes fingerprint", () => {
    const a = fingerprintRunInputManifest(buildRunInputManifest(baseManifest()));
    const b = fingerprintRunInputManifest(
      buildRunInputManifest(
        baseManifest({
          constraints: [
            {
              id: "c-1",
              constraint_code: "UTIL",
              metric_key: "UTILIZATION",
              operator: "<=",
              threshold_value: 0.9,
              hardness: "HARD",
            },
          ],
        }),
      ),
    );
    expect(a).not.toBe(b);
  });

  it("TEST D: design variable bound change changes fingerprint", () => {
    const a = fingerprintRunInputManifest(buildRunInputManifest(baseManifest()));
    const b = fingerprintRunInputManifest(
      buildRunInputManifest(
        baseManifest({
          variables: [
            {
              id: "v-1",
              variable_code: "W",
              variable_type: "CONTINUOUS",
              unit: "mm",
              lower_bound: 250,
              upper_bound: 400,
              allowed_values: null,
            },
          ],
        }),
      ),
    );
    expect(a).not.toBe(b);
  });

  it("TEST E: alternative variable value change changes fingerprint", () => {
    const a = fingerprintRunInputManifest(buildRunInputManifest(baseManifest()));
    const b = fingerprintRunInputManifest(
      buildRunInputManifest(baseManifest({ alternativeValues: [{ variable_id: "v-1", numeric_value: 350, text_value: null }] })),
    );
    expect(a).not.toBe(b);
  });

  it("TEST F: scenario change changes fingerprint", () => {
    const a = fingerprintRunInputManifest(buildRunInputManifest(baseManifest()));
    const b = fingerprintRunInputManifest(
      buildRunInputManifest(baseManifest({ scenario: { id: "sc-1", scenario_code: "ULS", name: "ULS", description: "combo B" } })),
    );
    expect(a).not.toBe(b);
  });

  it("TEST G/H/I: material assumption, requirement, and interface changes change fingerprint", () => {
    const a = fingerprintRunInputManifest(buildRunInputManifest(baseManifest()));
    const g = fingerprintRunInputManifest(
      buildRunInputManifest(
        baseManifest({
          assumptions: [{ id: "asm-1", statement: "Grade 300", confidence: 0.8, validation_status: "validated", materiality: "high" }],
        }),
      ),
    );
    const h = fingerprintRunInputManifest(
      buildRunInputManifest(
        baseManifest({
          requirements: [
            {
              id: "req-1",
              requirement_code: "REQ-1",
              statement: "Limit mass tightly",
              acceptance_criteria: "mass <= 20 t",
              verification_method: "ANALYSIS",
              verification_status: "unverified",
            },
          ],
        }),
      ),
    );
    const i = fingerprintRunInputManifest(
      buildRunInputManifest(
        baseManifest({
          interfaces: [{ id: "ifc-1", interface_code: "IF-1", interface_type: "STRUCTURAL", status: "agreed", criticality: "high" }],
        }),
      ),
    );
    expect(a).not.toBe(g);
    expect(a).not.toBe(h);
    expect(a).not.toBe(i);
  });

  it("display-only title changes do not change context hash", () => {
    const left = fingerprintStudyContext({
      baselineId: "bl-1",
      decision: { id: "dec-1", status: "open" },
      systems: [{ id: "sys-1", system_code: "S1", status: "active" }],
      requirements: [requirementContextProjection({ id: "req-1", requirement_code: "REQ-1", statement: "A", title: "One" })],
      assumptions: [assumptionContextProjection({ id: "asm-1", statement: "S", confidence: 1, validation_status: "validated", materiality: "high", title: "One" })],
      interfaces: [interfaceContextProjection({ id: "ifc-1", interface_code: "IF-1", interface_type: "STRUCTURAL", status: "defined", criticality: "high", name: "One" })],
    });
    const right = fingerprintStudyContext({
      baselineId: "bl-1",
      decision: { id: "dec-1", status: "open" },
      systems: [{ id: "sys-1", system_code: "S1", status: "active" }],
      requirements: [requirementContextProjection({ id: "req-1", requirement_code: "REQ-1", statement: "A", title: "Two" })],
      assumptions: [assumptionContextProjection({ id: "asm-1", statement: "S", confidence: 1, validation_status: "validated", materiality: "high", title: "Two" })],
      interfaces: [interfaceContextProjection({ id: "ifc-1", interface_code: "IF-1", interface_type: "STRUCTURAL", status: "defined", criticality: "high", name: "Two" })],
    });
    expect(left).toBe(right);
    expect(
      contextStaleness({
        studyBaselineId: "bl-1",
        currentFrozenBaselineId: "bl-1",
        pinnedContextFingerprint: left,
        currentContextFingerprint: right,
      }),
    ).toBe("CURRENT");
  });
});

describe("EOS-A5C Pareto completeness", () => {
  it("excludes incomplete, infeasible, duplicate, and unit-mismatched alternatives from dominance", () => {
    const objectives = [
      { id: "o1", metric_key: "MASS", direction: "MINIMIZE" as const, unit: "t" },
      { id: "o2", metric_key: "COST", direction: "MINIMIZE" as const, unit: "usd" },
    ];
    const result = computeParetoSet(objectives, [
      { alternativeId: "A", runId: "rA", feasible: true, metrics: [{ metric_key: "MASS", value: 10, unit: "t" }, { metric_key: "COST", value: 5, unit: "usd" }] },
      { alternativeId: "B", runId: "rB", feasible: true, metrics: [{ metric_key: "MASS", value: 11, unit: "t" }] },
      { alternativeId: "C", runId: "rC", feasible: false, metrics: [{ metric_key: "MASS", value: 9, unit: "t" }, { metric_key: "COST", value: 4, unit: "usd" }] },
      {
        alternativeId: "D",
        runId: "rD",
        feasible: true,
        metrics: [
          { metric_key: "MASS", value: 10, unit: "t" },
          { metric_key: "MASS", value: 12, unit: "t" },
          { metric_key: "COST", value: 5, unit: "usd" },
        ],
      },
      { alternativeId: "E", runId: "rE", feasible: true, metrics: [{ metric_key: "MASS", value: 10, unit: "kg" }, { metric_key: "COST", value: 5, unit: "usd" }] },
    ]);
    expect(result.find((row) => row.runId === "rA")?.status).toBe("pareto-optimal");
    expect(result.find((row) => row.runId === "rB")?.status).toBe("evaluation-incomplete");
    expect(result.find((row) => row.runId === "rC")?.status).toBe("infeasible");
    expect(result.find((row) => row.runId === "rD")?.status).toBe("evaluation-incomplete");
    expect(result.find((row) => row.runId === "rE")?.status).toBe("evaluation-incomplete");
  });
});

describe("EOS-A5C generic JobService execution", () => {
  it("queues, freezes the manifest, delegates through the handler, and ingests trusted stub results", async () => {
    const tables = createStore();
    tables.engineering_configuration_baselines.push({
      id: "bl-1",
      tenant_id: "tenant-a",
      workspace_id: "ws-a",
      project_id: "proj-1",
      status: "frozen",
    });
    tables.engineering_optimization_studies.push({
      id: "st-1",
      tenant_id: "tenant-a",
      workspace_id: "ws-a",
      project_id: "proj-1",
      status: "ready",
      configuration_baseline_id: "bl-1",
      decision_id: "dec-1",
      lifecycle_stage: "FEED",
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
    tables.engineering_optimization_constraints.push({
      id: "c-1",
      study_id: "st-1",
      tenant_id: "tenant-a",
      workspace_id: "ws-a",
      constraint_code: "UTIL",
      name: "Utilization",
      metric_key: "UTILIZATION",
      operator: "<=",
      threshold_value: 1,
      hardness: "HARD",
    });
    const supabase = mockSupabase(tables);
    const jobs = new JobService(supabase as never);
    registerOptimizationEvaluateHandler(jobs, supabase as never);
    const runs = new OptimizationRunService(supabase as never, { jobs } as never);
    const created = (await runs.create(commerce(), "tenant-a", { studyId: "st-1", alternativeId: "alt-1" })) as Row;
    expect(created.run_input_fingerprint).toMatch(/^[a-f0-9]{64}$/);
    expect(tables.engineering_optimization_run_manifests).toHaveLength(1);
    expect(tables.background_jobs[0].job_type).toBe("engineering.optimization.evaluate");
    expect(String(tables.engineering_optimization_runs[0].status)).toBe("succeeded");
    expect(tables.engineering_optimization_result_metrics.some((row) => row.source_kind === "ADAPTER")).toBe(true);
    expect(tables.engineering_optimization_result_metrics.some((row) => row.metric_key === "MASS")).toBe(true);
    const firstFingerprint = String(created.run_input_fingerprint);
    tables.engineering_optimization_objectives[0].direction = "MAXIMIZE";
    const again = await runs.get(
      createTestCommerceExecutionContext({
        tenantId: "tenant-a",
        workspaceId: "ws-a",
        policy: {
          productKey: "engineering-os",
          action: "optimization.read",
          seatRequired: true,
        },
      }),
      "tenant-a",
      created.id as string,
    );
    expect(again.run.run_input_fingerprint).toBe(firstFingerprint);
    expect((again.manifest as Row).manifest).toMatchObject({
      execution: { adapter_id: CERTIFICATION_STUB_ADAPTER_ID },
      alternative: { alternative_id: "alt-1" },
    });
  });

  it("fails closed when a non-stub adapter is unauthorized by the execution host", async () => {
    const tables = createStore();
    tables.engineering_configuration_baselines.push({
      id: "bl-1",
      tenant_id: "tenant-a",
      workspace_id: "ws-a",
      project_id: "proj-1",
      status: "frozen",
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
      objective_code: "MASS",
      metric_key: "MASS",
      direction: "MINIMIZE",
      name: "Mass",
    });
    const supabase = mockSupabase(tables);
    const jobs = new JobService(supabase as never);
    registerOptimizationEvaluateHandler(jobs, supabase as never);
    const runs = new OptimizationRunService(supabase as never, { jobs } as never);
    await runs.create(commerce(), "tenant-a", {
      studyId: "st-1",
      alternativeId: "alt-1",
      adapterId: "spacegass",
      processImmediately: true,
    }).then(
      () => {
        throw new Error("expected_spacegass_create_to_fail_closed");
      },
      (error: unknown) => {
        expect(String(error instanceof Error ? error.message : error)).toMatch(
          /external_tool_profile_required|tool_not_ready|not READY|not certified/i,
        );
      },
    );
    expect(tables.engineering_optimization_runs).toHaveLength(0);
  });

  it("links DECLARED context with BASED_ON assumptions and CONSTRAINED_BY requirements/interfaces", async () => {
    const tables = createStore();
    tables.engineering_systems.push({ id: "sys-1", tenant_id: "tenant-a", workspace_id: "ws-a", project_id: "proj-1" });
    tables.engineering_decisions.push({ id: "dec-1", tenant_id: "tenant-a", workspace_id: "ws-a", project_id: "proj-1" });
    tables.engineering_configuration_baselines.push({
      id: "bl-1",
      tenant_id: "tenant-a",
      workspace_id: "ws-a",
      project_id: "proj-1",
      status: "frozen",
    });
    tables.engineering_requirements.push({
      id: "req-1",
      tenant_id: "tenant-a",
      workspace_id: "ws-a",
      project_id: "proj-1",
      requirement_code: "REQ-1",
      statement: "Limit mass",
      verification_status: "unverified",
    });
    tables.engineering_assumptions.push({
      id: "asm-1",
      tenant_id: "tenant-a",
      workspace_id: "ws-a",
      project_id: "proj-1",
      statement: "Grade 350",
      confidence: 0.8,
      validation_status: "validated",
      materiality: "high",
    });
    tables.engineering_interfaces.push({
      id: "ifc-1",
      tenant_id: "tenant-a",
      workspace_id: "ws-a",
      project_id: "proj-1",
      interface_code: "IF-1",
      interface_type: "STRUCTURAL",
      status: "defined",
      criticality: "high",
    });
    const studies = new OptimizationStudyService(mockSupabase(tables) as never);
    const ctx = commerce();
    const created = (await studies.create(ctx, { tenantId: "tenant-a", title: "Linked", projectId: "proj-1" })) as Row;
    await studies.setContext(ctx, "tenant-a", created.id as string, {
      configurationBaselineId: "bl-1",
      decisionId: "dec-1",
      requirementsContext: "DECLARED",
      assumptionsContext: "DECLARED",
      interfacesContext: "DECLARED",
    });
    await studies.setSystemScope(ctx, "tenant-a", created.id as string, ["sys-1"], "u1");
    await studies.linkRequirement(ctx, "tenant-a", created.id as string, "req-1", "u1");
    await studies.linkAssumption(ctx, "tenant-a", created.id as string, "asm-1", "u1");
    await studies.linkInterface(ctx, "tenant-a", created.id as string, "ifc-1", "u1");
    await studies.addObjective(ctx, "tenant-a", created.id as string, {
      objectiveCode: "MASS",
      name: "Mass",
      metricKey: "MASS",
      direction: "MINIMIZE",
    });
    await studies.addAlternative(ctx, "tenant-a", created.id as string, { alternativeCode: "ALT-A", name: "A", createdBy: "u1" });
    const ready = await studies.setReady(ctx, "tenant-a", created.id as string, "u1");
    expect(ready.status).toBe("ready");
    expect(ready.context_fingerprint).toMatch(/^[a-f0-9]{64}$/);
    expect(tables.engineering_object_links.map((row) => row.relationship)).toEqual(
      expect.arrayContaining(["SCOPED_TO", "CONSTRAINED_BY", "BASED_ON"]),
    );
    expect(tables.engineering_object_links.some((row) => row.relationship === "BASED_ON" && row.to_type === "assumption")).toBe(true);
  });
});
