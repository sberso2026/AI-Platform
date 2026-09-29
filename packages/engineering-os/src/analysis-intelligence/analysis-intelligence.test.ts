import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { JobService } from "@rtb/platform-kernel";
import { createTestCommerceExecutionContext } from "@rtb/platform-commerce/server";
import type { PlatformKernel } from "@rtb/platform-kernel";
import { resolveAnalysisCapability } from "./capability-resolver";
import { assertHumanAcceptance, compareCompatibleResults, composeReviewCitation } from "./composition";
import { isExecutableAgainstUpstream, primaryCrushingDependencyFixture, toGovernedAnalysisLink } from "./dependencies";
import { fingerprintAnalysisInput } from "./fingerprint";
import { registerAnalysisExecuteHandler } from "./job-handler";
import { buildAnalysisInputManifest } from "./manifest";
import { resolveAnalysisPreconditions } from "./preconditions";
import { AnalysisRequestService, assertPlanImmutable, productionAnalysisCapabilities } from "./request-service";
import { explainAnalysisStaleness } from "./staleness";
import { SyntheticCertificationAnalysisAdapter } from "./synthetic-adapter";
import {
  ANALYSIS_JOB_TYPE,
  ANALYSIS_REQUEST_STATES,
  LLM_AS_ANALYSIS_SOLVER,
  SYNTHETIC_CERTIFICATION_ADAPTER_ID,
  SYNTHETIC_CERTIFICATION_CAPABILITY,
} from "./types";
import { analysisRetryPolicy, normalizeFailure, validateNormalizedAnalysisResult } from "./validation";
import { CANONICAL_DISCIPLINE_CODES, PRODUCTION_HIDDEN_CAPABILITIES } from "../discipline-intelligence/catalog";

type Row = Record<string, unknown>;

function createStore() {
  return {
    engineering_analysis_requests: [] as Row[],
    engineering_analysis_execution_plans: [] as Row[],
    engineering_analysis_results: [] as Row[],
    engineering_discipline_profiles: [] as Row[],
    engineering_project_disciplines: [] as Row[],
    engineering_discipline_tool_bindings: [] as Row[],
    engineering_external_tool_profiles: [] as Row[],
    engineering_external_tool_assignments: [] as Row[],
    engineering_configuration_baselines: [] as Row[],
    engineering_object_links: [] as Row[],
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
          max_retries: item.max_retries ?? 0,
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

function writeCommerce() {
  return createTestCommerceExecutionContext({
    tenantId: "tenant-a",
    workspaceId: "ws-a",
    policy: { productKey: "engineering-os", action: "analysis.write", seatRequired: true },
  });
}

function readCommerce() {
  return createTestCommerceExecutionContext({
    tenantId: "tenant-a",
    workspaceId: "ws-a",
    policy: { productKey: "engineering-os", action: "analysis.read", seatRequired: true },
  });
}

function seedCommon(tables: ReturnType<typeof createStore>) {
  tables.engineering_configuration_baselines.push({
    id: "bl-1",
    tenant_id: "tenant-a",
    workspace_id: "ws-a",
    status: "frozen",
  });
  tables.engineering_project_disciplines.push({
    id: "pd-1",
    tenant_id: "tenant-a",
    workspace_id: "ws-a",
    project_id: "proj-1",
    discipline_code: "STRUCTURAL",
    enabled: true,
  });
  tables.engineering_project_disciplines.push({
    id: "pd-2",
    tenant_id: "tenant-a",
    workspace_id: "ws-a",
    project_id: "proj-1",
    discipline_code: "SAFETY",
    enabled: true,
  });
}

function spaceGassTrialRow(): Row {
  return {
    id: "tool-sg-142",
    tenant_id: "tenant-a",
    tool_code: "spacegass",
    name: "SPACE GASS 14.2 Trial",
    vendor: "SPACE GASS",
    category: "ANALYSIS_SIMULATION",
    enabled: true,
    status: "active",
    environment: "staging",
    integration_modes: ["EXECUTION_ADAPTER"],
    adapter_id: "0.3.0-spacegass",
    adapter_version: "0.3.0-spacegass",
    compatible_tool_versions: ["14.2"],
    not_certified_tool_versions: ["14.5", "14.50"],
    execution_host_id: null,
    installed_version: "14.25.3785",
    executable_path: "C:\\Program Files\\SPACE GASS\\sgwin.exe",
    installation_status: "INSTALLED",
    licence_status: "AVAILABLE",
    licence_type: "TRIAL",
    api_available: false,
    production_use_permitted: false,
    automation_permission: "REQUIRES_CONFIRMATION",
    capabilities: [{ key: "LINEAR_STATIC_ANALYSIS", availability: "AVAILABLE", certification: "NOT_CERTIFIED", notes: "" }],
    last_validation: { ranAt: null, overall: "NOT_RUN", checks: [] },
  };
}

describe("EOS-A7B analysis foundation", () => {
  it("keeps Analysis Request states distinct from Optimization", () => {
    expect(ANALYSIS_REQUEST_STATES).toContain("blocked");
    expect(ANALYSIS_REQUEST_STATES).toContain("ready");
    expect(ANALYSIS_JOB_TYPE).toBe("engineering.analysis.execute");
    expect(LLM_AS_ANALYSIS_SOLVER).toBe("PROHIBITED");
    expect(productionAnalysisCapabilities(["FEA", "CERTIFICATION_ANALYSIS"])).toEqual(["FEA"]);
    expect(PRODUCTION_HIDDEN_CAPABILITIES).toContain(SYNTHETIC_CERTIFICATION_CAPABILITY);
    expect(CANONICAL_DISCIPLINE_CODES).toHaveLength(11);
  });

  it("does not hard-code vendor product names in orchestration", () => {
    const dir = dirname(fileURLToPath(import.meta.url));
    for (const file of ["capability-resolver.ts", "job-handler.ts", "request-service.ts", "execution-port.ts"]) {
      const src = readFileSync(join(dir, file), "utf8");
      expect(src).not.toMatch(/SPACE GASS|ETABS|CAESAR II|HYSYS|ETAP|PLAXIS/i);
    }
  });

  it("resolves LINEAR_STRUCTURAL_ANALYSIS against a trial tool as BLOCKED with explicit reasons", () => {
    const resolution = resolveAnalysisCapability({
      discipline: "STRUCTURAL",
      capability: "LINEAR_STRUCTURAL_ANALYSIS",
      workspaceId: "ws-a",
      projectId: "proj-1",
      tenantId: "tenant-a",
      disciplineEnabled: true,
      projectDisciplineEnabled: true,
      capabilities: [{ key: "LINEAR_STRUCTURAL_ANALYSIS", declaredStatus: "TOOL_DEPENDENT", effectiveStatus: "NOT_CERTIFIED" }],
      bindings: [
        {
          id: "bind-1",
          tenantId: "tenant-a",
          workspaceId: "ws-a",
          disciplineCode: "STRUCTURAL",
          capabilityKey: "LINEAR_STRUCTURAL_ANALYSIS",
          toolCode: "spacegass",
          externalToolProfileId: "tool-sg-142",
          certificationStatus: "NOT_CERTIFIED",
          priority: 1,
        },
      ],
      profiles: [
        {
          id: "tool-sg-142",
          enabled: true,
          status: "active",
          readiness: "BLOCKED",
          installationStatus: "INSTALLED",
          executionHostId: null,
          executablePath: "x",
          installedVersion: "14.25.3785",
          licenceStatus: "AVAILABLE",
          licenceType: "TRIAL",
          automationPermission: "REQUIRES_CONFIRMATION",
          adapterCompatibilityStatus: "NOT_CERTIFIED",
          adapterId: "0.3.0-spacegass",
          capabilities: [{ key: "LINEAR_STATIC_ANALYSIS", availability: "AVAILABLE", certification: "NOT_CERTIFIED", notes: "" }],
        },
      ],
      workspaceAssignments: [{ profileId: "tool-sg-142", workspaceId: "ws-a", enabled: true }],
      baselineId: "bl-1",
      requirementIds: ["req-1"],
      assumptionIds: ["asm-1"],
      standardCodes: ["AS 4100"],
    });
    expect(resolution.executable).toBe(false);
    expect(resolution.reasons).toContain("BLOCKED_AUTOMATION_NOT_PERMITTED");
    expect(resolution.approvedToolBinding?.externalToolProfileId).toBe("tool-sg-142");
  });

  it("fails closed on unknown safety-critical preconditions", () => {
    const items = resolveAnalysisPreconditions({
      baselineFrozen: null,
      requirementIds: ["r1"],
      assumptionIds: ["a1"],
      standardCodes: ["AS 4100"],
      standardsRequired: true,
      interfaceInformationStatus: "UNKNOWN",
      upstreamDependencies: [],
      externalToolReady: null,
      workspaceAllowed: true,
      executionHostAvailable: null,
    });
    expect(items.find((p) => p.key === "CONFIGURATION_BASELINE_FROZEN")?.state).toBe("NOT_SATISFIED");
    expect(items.find((p) => p.key === "REQUIRED_INTERFACE_INFORMATION")?.state).toBe("NOT_SATISFIED");
  });

  it("fingerprints execution-critical context only", () => {
    const a = fingerprintAnalysisInput({
      discipline: "STRUCTURAL",
      capability: "LINEAR_STRUCTURAL_ANALYSIS",
      baselineId: "bl-1",
      requirementIds: ["b", "a"],
      assumptionIds: ["x"],
      standardCodes: ["AS 4100"],
      interfaceIds: [],
      toolProfileId: "t1",
      toolVersion: "14.2",
      adapterId: "ad",
      adapterVersion: "1",
      executionHostId: null,
      inputArtifactHashes: [],
      unitContext: "SI",
      requestedOutputs: ["UTIL"],
      upstreamResultIds: [],
    });
    const b = fingerprintAnalysisInput({
      discipline: "STRUCTURAL",
      capability: "LINEAR_STRUCTURAL_ANALYSIS",
      baselineId: "bl-1",
      requirementIds: ["a", "b"],
      assumptionIds: ["x"],
      standardCodes: ["AS 4100"],
      interfaceIds: [],
      toolProfileId: "t1",
      toolVersion: "14.2",
      adapterId: "ad",
      adapterVersion: "1",
      executionHostId: null,
      inputArtifactHashes: [],
      unitContext: "SI",
      requestedOutputs: ["UTIL"],
      upstreamResultIds: [],
    });
    expect(a).toBe(b);
    expect(a).toHaveLength(64);
  });

  it("explains staleness by material field", () => {
    const stored = {
      discipline: "STRUCTURAL",
      capability: "LINEAR_STRUCTURAL_ANALYSIS",
      baselineId: "bl-1",
      requirementIds: ["r1"],
      assumptionIds: ["a1"],
      standardCodes: ["AS 4100"],
      interfaceIds: [],
      toolProfileId: "t1",
      toolVersion: "14.2",
      adapterId: "ad",
      adapterVersion: "1",
      executionHostId: null,
      inputArtifactHashes: [],
      unitContext: "SI",
      requestedOutputs: ["UTIL"],
      upstreamResultIds: ["up-1"],
    };
    const explained = explainAnalysisStaleness({
      stored,
      current: { ...stored, baselineId: "bl-2" },
    });
    expect(explained.stale).toBe(true);
    expect(explained.reasons).toContain("STALE_BASELINE_CHANGED");
  });

  it("blocks failed/stale/superseded/rejected upstream evidence", () => {
    expect(isExecutableAgainstUpstream({ upstreamStatus: "FAILED", acceptanceState: "ACCEPTED", stale: false, requiredAcceptance: "ACCEPTED" })).toBe(false);
    expect(isExecutableAgainstUpstream({ upstreamStatus: "SUCCEEDED", acceptanceState: "REJECTED", stale: false, requiredAcceptance: "ACCEPTED" })).toBe(false);
    expect(isExecutableAgainstUpstream({ upstreamStatus: "SUCCEEDED", acceptanceState: "ACCEPTED", stale: false, requiredAcceptance: "ACCEPTED" })).toBe(true);
    const fixture = primaryCrushingDependencyFixture();
    expect(fixture.chain).toHaveLength(4);
    const link = toGovernedAnalysisLink({
      fromRequestId: "down",
      toRequestId: "up",
      semantic: "REQUIRES_RESULT_FROM",
      requiredAcceptance: "ACCEPTED",
    });
    expect(link.relationship).toBe("DEPENDS_ON");
  });

  it("keeps execution success distinct from validity and human acceptance", () => {
    const validity = validateNormalizedAnalysisResult(
      { executionSucceeded: true, metrics: [], resultArtifacts: [] },
      ["UTIL"],
    );
    expect(validity.resultValid).toBe(false);
    expect(() => assertHumanAcceptance("AI_AGENT")).toThrow(/AI_SELF_ACCEPT_RESULT/);
    const retry = analysisRetryPolicy("EXECUTION_FAILED");
    expect(retry.maxRetries).toBe(0);
    expect(normalizeFailure({ class: "TOOL_TIMEOUT" }).retryable).toBe(true);
  });

  it("does not merge incompatible tool results", () => {
    const left = {
      id: "r1",
      analysisRequestId: "a1",
      executionPlanId: "p1",
      jobId: null,
      executionRef: null,
      discipline: "STRUCTURAL",
      capability: "LINEAR_STRUCTURAL_ANALYSIS",
      executionSucceeded: true,
      resultValid: true,
      status: "SUCCEEDED" as const,
      metrics: [{ metricCode: "UTIL", value: 0.4, unit: "1", dimension: null, category: null, source: "t1", resultChannel: "UTIL", confidence: "high" as const, provenance: {}, shape: "SCALAR" as const }],
      warnings: [],
      limitations: [],
      resultArtifacts: [],
      provenance: { toolId: "t1", toolVersion: "14.2", adapterId: "a", adapterVersion: "1", executionHostId: null, sourceKind: "ADAPTER" as const, startedAt: null, completedAt: null, inputFingerprint: null, inputArtifactHash: null, outputArtifactHash: null },
      reviewState: "not_reviewed" as const,
      acceptanceState: "UNREVIEWED" as const,
      acceptedBy: null,
      acceptedAt: null,
      acceptanceRationale: null,
      stale: false,
      staleReasons: [],
    };
    const right = { ...left, id: "r2", provenance: { ...left.provenance, toolId: "t2" } };
    const cmp = compareCompatibleResults(left, right, {
      capability: "LINEAR_STRUCTURAL_ANALYSIS",
      baselineId: "bl-1",
      unit: "1",
      resultChannel: "UTIL",
    });
    expect(cmp.comparable).toBe(true);
    expect(cmp.leftResultId).not.toBe(cmp.rightResultId);
  });

  it("runs synthetic certification end-to-end through JobService without treating it as a real tool", async () => {
    const tables = createStore();
    seedCommon(tables);
    tables.engineering_discipline_profiles.push({
      id: "ov-s",
      tenant_id: "tenant-a",
      discipline_code: "SAFETY",
      enabled: true,
      capabilities: [{ key: SYNTHETIC_CERTIFICATION_CAPABILITY, declaredStatus: "AVAILABLE", effectiveStatus: "AVAILABLE" }],
    });
    const supabase = mockSupabase(tables);
    const jobs = new JobService(supabase as never);
    registerAnalysisExecuteHandler(jobs, supabase as never);
    const svc = new AnalysisRequestService(supabase as never, { jobs } as PlatformKernel);
    const created = await svc.create(writeCommerce(), "tenant-a", {
      projectId: "proj-1",
      discipline: "SAFETY",
      capability: SYNTHETIC_CERTIFICATION_CAPABILITY,
      configurationBaselineId: "bl-1",
      requirementIds: ["req-1"],
      assumptionIds: ["asm-1"],
      applicableStandardCodes: ["TEST"],
      requestedOutputs: ["CERTIFICATION_METRIC"],
      requestedBy: "user-1",
      syntheticCertification: true,
    });
    const queued = await svc.queue(writeCommerce(), "tenant-a", created.id, "user-1", true);
    expect(queued.queued).toBe(true);
    expect(queued.jobId).toBeTruthy();
    expect(queued.fabricated).toBe(false);
    expect(queued.result).toBeTruthy();
    expect(queued.result?.execution_succeeded).toBe(true);
    expect(queued.result?.result_valid).toBe(true);
    expect(queued.result?.acceptance_state).toBe("UNREVIEWED");
    expect(JSON.stringify(queued.result?.provenance)).toContain("SYNTHETIC");
    expect(tables.background_jobs[0]?.job_type).toBe(ANALYSIS_JOB_TYPE);
    const citation = composeReviewCitation({
      analysisRequestId: created.id,
      analysisResultId: String(queued.result?.id),
      reviewPackageId: "rp-1",
    });
    expect(citation.fromType).toBe("review_package");
    expect(citation.toType).toBe("analysis_result");
  });

  it("creates a real STRUCTURAL request but does not dispatch a solver job or fabricate a result", async () => {
    const tables = createStore();
    seedCommon(tables);
    tables.engineering_discipline_profiles.push({
      id: "ov-st",
      tenant_id: "tenant-a",
      discipline_code: "STRUCTURAL",
      enabled: true,
      capabilities: [{ key: "LINEAR_STRUCTURAL_ANALYSIS", declaredStatus: "TOOL_DEPENDENT", effectiveStatus: "NOT_CERTIFIED" }],
    });
    tables.engineering_external_tool_profiles.push(spaceGassTrialRow());
    tables.engineering_discipline_tool_bindings.push({
      id: "bind-1",
      tenant_id: "tenant-a",
      workspace_id: "ws-a",
      discipline_code: "STRUCTURAL",
      capability_key: "LINEAR_STRUCTURAL_ANALYSIS",
      tool_code: "spacegass",
      external_tool_profile_id: "tool-sg-142",
      certification_status: "NOT_CERTIFIED",
      priority: 1,
    });
    tables.engineering_external_tool_assignments.push({
      id: "asg-1",
      tenant_id: "tenant-a",
      workspace_id: "ws-a",
      profile_id: "tool-sg-142",
      allowed: true,
    });
    const supabase = mockSupabase(tables);
    const jobs = new JobService(supabase as never);
    registerAnalysisExecuteHandler(jobs, supabase as never);
    const svc = new AnalysisRequestService(supabase as never, { jobs } as PlatformKernel);
    const created = await svc.create(writeCommerce(), "tenant-a", {
      projectId: "proj-1",
      discipline: "STRUCTURAL",
      capability: "LINEAR_STRUCTURAL_ANALYSIS",
      configurationBaselineId: "bl-1",
      requirementIds: ["req-1"],
      assumptionIds: ["asm-1"],
      applicableStandardCodes: ["AS 4100"],
      requestedExternalToolProfileId: "tool-sg-142",
      requestedBy: "user-1",
    });
    const explained = await svc.preflight(readCommerce(), "tenant-a", created.id);
    expect(explained.request.status).toBe("blocked");
    expect(explained.blockingReasons).toContain("BLOCKED_AUTOMATION_NOT_PERMITTED");
    const queued = await svc.queue(writeCommerce(), "tenant-a", created.id, "user-1", true);
    expect(queued.queued).toBe(false);
    expect(queued.jobId).toBeNull();
    expect(queued.result).toBeNull();
    expect(queued.fabricated).toBe(false);
    expect(tables.background_jobs).toHaveLength(0);
    expect(tables.engineering_analysis_results).toHaveLength(0);
  });

  it("rejects silent execution-plan mutation after freeze", () => {
    expect(() => assertPlanImmutable({ frozen: true, analysis_input_fingerprint: "aaa" }, "bbb")).toThrow(/execution_plan_immutable/);
  });

  it("synthetic adapter returns deterministic metrics from immutable inputs", async () => {
    const adapter = new SyntheticCertificationAnalysisAdapter();
    const manifest = buildAnalysisInputManifest({
      request: {
        id: "req-1",
        tenantId: "tenant-a",
        workspaceId: "ws-a",
        projectId: "proj-1",
        discipline: "SAFETY",
        capability: SYNTHETIC_CERTIFICATION_CAPABILITY,
        systemId: null,
        assetId: null,
        interfaceId: null,
        configurationBaselineId: "bl-1",
        requirementIds: ["r"],
        assumptionIds: ["a"],
        applicableStandardCodes: ["T"],
        supportingDocumentIds: [],
        requestedExternalToolProfileId: null,
        requestedOutputs: ["CERTIFICATION_METRIC"],
        executionPriority: null,
        requestedBy: "user-1",
        requestedAt: "t0",
        actorKind: "HUMAN",
        status: "ready",
        syntheticCertification: true,
        originalAnalysisRequestId: null,
        metadata: {},
      },
      baselineFrozen: true,
      interfaceIds: [],
      toolCode: null,
      toolVersion: null,
      toolCapability: SYNTHETIC_CERTIFICATION_CAPABILITY,
      adapterId: SYNTHETIC_CERTIFICATION_ADAPTER_ID,
      adapterVersion: "0.1.0-synthetic-test",
      executionHostId: null,
      unitContext: "SI",
      inputArtifactRefs: [],
      inputHashes: [],
      upstream: [],
    });
    const first = await adapter.execute({
      analysisRequestId: "req-1",
      executionPlanId: "plan-1",
      tenantId: "tenant-a",
      workspaceId: "ws-a",
      projectId: "proj-1",
      discipline: "SAFETY",
      capability: SYNTHETIC_CERTIFICATION_CAPABILITY,
      adapterId: SYNTHETIC_CERTIFICATION_ADAPTER_ID,
      adapterVersion: "0.1.0-synthetic-test",
      toolId: null,
      toolVersion: null,
      executionHostId: null,
      inputManifest: manifest,
      analysisInputFingerprint: "abc",
      requestedBy: "user-1",
      executionRef: "job-1",
    });
    const second = await adapter.execute({
      analysisRequestId: "req-1",
      executionPlanId: "plan-1",
      tenantId: "tenant-a",
      workspaceId: "ws-a",
      projectId: "proj-1",
      discipline: "SAFETY",
      capability: SYNTHETIC_CERTIFICATION_CAPABILITY,
      adapterId: SYNTHETIC_CERTIFICATION_ADAPTER_ID,
      adapterVersion: "0.1.0-synthetic-test",
      toolId: null,
      toolVersion: null,
      executionHostId: null,
      inputManifest: manifest,
      analysisInputFingerprint: "abc",
      requestedBy: "user-1",
      executionRef: "job-1",
    });
    expect(first.metrics[0]?.value).toBe(second.metrics[0]?.value);
    expect(first.limitations).toContain("NOT_REAL_ENGINEERING_TOOL");
  });
});
