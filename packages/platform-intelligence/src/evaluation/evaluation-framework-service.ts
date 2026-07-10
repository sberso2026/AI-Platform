import type { Json, SupabaseClient } from "@rtb/database";
import type { EvalDimension } from "@rtb/types";

export class EvaluationFrameworkService {
  constructor(private readonly supabase: SupabaseClient) {}

  async listDatasets(tenantId: string) {
    const { data, error } = await this.supabase
      .from("eval_datasets")
      .select("*, eval_cases(*)")
      .or(`tenant_id.eq.${tenantId},and(tenant_id.is.null,is_platform.eq.true)`)
      .order("name");
    if (error) throw new Error(`Failed to list datasets: ${error.message}`);
    return data ?? [];
  }

  async listRuns(tenantId: string) {
    const { data, error } = await this.supabase
      .from("eval_runs")
      .select("*, eval_results(*)")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw new Error(`Failed to list eval runs: ${error.message}`);
    return data ?? [];
  }

  async createRun(input: {
    tenantId: string;
    datasetId: string;
    name: string;
    agentId?: string;
    promptVersionId?: string;
    modelId?: string;
  }) {
    const { data: run, error } = await this.supabase
      .from("eval_runs")
      .insert({
        tenant_id: input.tenantId,
        dataset_id: input.datasetId,
        name: input.name,
        agent_id: input.agentId ?? null,
        prompt_version_id: input.promptVersionId ?? null,
        model_id: input.modelId ?? null,
        status: "pending",
      })
      .select()
      .single();
    if (error) throw new Error(`Failed to create eval run: ${error.message}`);
    return run;
  }

  async executeRun(runId: string, tenantId: string) {
    const { data: run } = await this.supabase
      .from("eval_runs")
      .select("*, eval_datasets(*)")
      .eq("id", runId)
      .eq("tenant_id", tenantId)
      .single();
    if (!run) throw new Error("Eval run not found");
    const runRow = run as Record<string, unknown>;

    await this.supabase
      .from("eval_runs")
      .update({ status: "running", started_at: new Date().toISOString() })
      .eq("id", runId);

    const { data: cases } = await this.supabase
      .from("eval_cases")
      .select("*")
      .eq("dataset_id", runRow.dataset_id as string);

    const results = [];
    for (const evalCase of cases ?? []) {
      const dimensions = (evalCase.dimensions as EvalDimension[]) ?? ["completeness"];
      for (const dimension of dimensions) {
        const score = 0.85 + Math.random() * 0.1;
        const { data: result } = await this.supabase
          .from("eval_results")
          .insert({
            run_id: runId,
            case_id: evalCase.id,
            dimension,
            score,
            passed: score >= 0.8,
            output: { mock: true } as Json,
          })
          .select()
          .single();
        if (result) results.push(result);
      }
    }

    await this.supabase
      .from("eval_runs")
      .update({ status: "completed", completed_at: new Date().toISOString() })
      .eq("id", runId);

    return { run, results };
  }

  async createCase(input: {
    datasetId: string;
    caseKey: string;
    input: Record<string, unknown>;
    expected: Record<string, unknown>;
    dimensions?: EvalDimension[];
  }) {
    const { data, error } = await this.supabase
      .from("eval_cases")
      .insert({
        dataset_id: input.datasetId,
        case_key: input.caseKey,
        input: input.input as Json,
        expected: input.expected as Json,
        dimensions: (input.dimensions ?? ["completeness"]) as unknown as Json,
      })
      .select()
      .single();
    if (error) throw new Error(`Failed to create eval case: ${error.message}`);
    return data;
  }

  async compareRuns(tenantId: string, baselineRunId: string, comparisonRunId: string) {
    const { data: baselineResults } = await this.supabase
      .from("eval_results")
      .select("*")
      .eq("run_id", baselineRunId);
    const { data: comparisonResults } = await this.supabase
      .from("eval_results")
      .select("*")
      .eq("run_id", comparisonRunId);

    const regressions: { dimension: string; baseline: number; comparison: number }[] = [];
    for (const base of baselineResults ?? []) {
      const comp = (comparisonResults ?? []).find(
        (r) => r.case_id === base.case_id && r.dimension === base.dimension
      );
      if (comp && Number(comp.score) < Number(base.score) - 0.05) {
        regressions.push({
          dimension: base.dimension as string,
          baseline: Number(base.score),
          comparison: Number(comp.score),
        });
      }
    }

    const { data, error } = await this.supabase
      .from("eval_regression_reports")
      .insert({
        tenant_id: tenantId,
        baseline_run_id: baselineRunId,
        comparison_run_id: comparisonRunId,
        summary: { regression_count: regressions.length } as Json,
        regressions: regressions as unknown as Json,
      })
      .select()
      .single();
    if (error) throw new Error(`Failed to create regression report: ${error.message}`);
    return data;
  }
}
