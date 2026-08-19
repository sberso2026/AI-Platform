import type { Json, SupabaseClient } from "@rtb/database";
import type { PlatformIntelligence } from "@rtb/platform-intelligence";
import type {
  AgentRun,
  AgentRunRequest,
  AgentRunResponse,
  EvidenceRef,
  IntentClassifier,
  ModelAdapter,
} from "@rtb/types";
import { MockModelAdapter } from "./adapters/mock-adapter";
import { KeywordIntentClassifier } from "./intent-classifier";
import type { EventBusService } from "../event-bus";

export class AIDirectorService {
  private readonly intentClassifier: IntentClassifier;
  private readonly adapters: Map<string, ModelAdapter>;

  constructor(
    private readonly supabase: SupabaseClient,
    private readonly eventBus?: EventBusService,
    private readonly intelligence?: PlatformIntelligence
  ) {
    this.intentClassifier = new KeywordIntentClassifier();
    this.adapters = new Map([["mock", new MockModelAdapter()]]);
  }

  registerAdapter(adapter: ModelAdapter): void {
    this.adapters.set(adapter.providerType, adapter);
  }

  async run(request: AgentRunRequest): Promise<AgentRunResponse> {
    const agent = await this.resolveAgent(request.tenantId, request.agentId);
    const intent = await this.intentClassifier.classify(request.message, request.context);

    // Capability routing lookup
    const capabilityRoute = await this.intelligence?.capabilities.routeByIntent(
      request.tenantId,
      intent
    );

    // Feature flag check
    const intelligenceEnabled = this.intelligence
      ? await this.intelligence.features.evaluate({
          tenantId: request.tenantId,
          featureKey: "platform_intelligence",
          userId: request.userId,
        })
      : true;

    // Start observability trace
    let traceId: string | undefined;
    let modelSpan: { spanId: string; startedAt: string } | undefined;
    if (this.intelligence && intelligenceEnabled) {
      const trace = await this.intelligence.observability.startTrace({
        tenantId: request.tenantId,
        name: "agent.run",
        source: "ai-director",
        metadata: { agent_id: agent.id, intent },
      });
      traceId = trace.id as string;
      const span = await this.intelligence.observability.createSpan({
        traceId,
        name: "agent.resolve",
        spanType: "agent",
      });
      modelSpan = { spanId: span.span.id as string, startedAt: span.startedAt };
    }

    const { data: run, error: runError } = await this.supabase
      .from("agent_runs")
      .insert({
        tenant_id: request.tenantId,
        workspace_id: request.workspaceId ?? null,
        agent_id: agent.id as string,
        user_id: request.userId,
        session_id: request.sessionId ?? null,
        status: "running",
        intent,
        input: {
          message: request.message,
          context: request.context ?? {},
          capability: capabilityRoute?.capability?.capability_key,
        } as Json,
        requires_review: agent.requires_review as boolean,
        trace_id: traceId ?? null,
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (runError || !run) throw new Error(`Failed to create agent run: ${runError?.message}`);

    await this.eventBus?.publish({
      tenantId: request.tenantId,
      workspaceId: request.workspaceId,
      eventType: "agent.run.started",
      source: "ai-director",
      payload: { run_id: run.id as string, agent_id: agent.id as string, intent },
    });

    await this.supabase.from("agent_messages").insert({
      run_id: run.id,
      role: "user",
      content: request.message,
    });

    try {
      // Prompt registry selection
      let systemPrompt = agent.system_prompt as string | undefined;
      let promptVersionId: string | undefined;
      if (this.intelligence && intelligenceEnabled) {
        const promptSelection = await this.intelligence.prompts.selectForAgent(
          request.tenantId,
          agent.slug as string
        );
        if (promptSelection) {
          systemPrompt = promptSelection.version.content as string;
          promptVersionId = promptSelection.version.id as string;
          await this.intelligence.prompts.logUsage({
            tenantId: request.tenantId,
            promptId: promptSelection.prompt.id as string,
            promptVersionId,
            agentId: agent.id as string,
            runId: run.id as string,
          });
          await this.supabase
            .from("agent_runs")
            .update({ prompt_version_id: promptVersionId })
            .eq("id", run.id as string);
        }
      }

      // Model registry routing
      const route = this.intelligence
        ? await this.intelligence.models.resolveRoute(request.tenantId, intent)
        : await this.resolveLegacyModelRoute(request.tenantId, intent);

      const adapter = this.adapters.get(route.providerType) ?? new MockModelAdapter();
      const modelStart = Date.now();

      const result = await adapter.complete({
        model: route.modelKey,
        messages: [
          ...(systemPrompt ? [{ role: "system" as const, content: systemPrompt }] : []),
          { role: "user" as const, content: request.message },
        ],
      });

      const modelLatency = Date.now() - modelStart;

      // Cost tracking
      if (this.intelligence && intelligenceEnabled) {
        const inputTokens = Math.ceil(request.message.length / 4);
        const outputTokens = Math.ceil(result.content.length / 4);
        await this.intelligence.costs.recordModelCall({
          tenantId: request.tenantId,
          workspaceId: request.workspaceId,
          runId: run.id as string,
          agentId: agent.id as string,
          userId: request.userId,
          inputTokens,
          outputTokens,
          costInputPer1k: route.costInputPer1k,
          costOutputPer1k: route.costOutputPer1k,
        });
        await this.intelligence.models.logUsage({
          tenantId: request.tenantId,
          modelId: route.modelId,
          runId: run.id as string,
          inputTokens,
          outputTokens,
          latencyMs: modelLatency,
        });
        await this.intelligence.observability.recordMetric(
          request.tenantId,
          "agent_latency",
          modelLatency,
          { intent, model: route.modelKey }
        );
        await this.intelligence.observability.recordMetric(
          request.tenantId,
          "token_usage",
          inputTokens + outputTokens
        );
      }

      // Policy evaluation
      let requiresReview =
        (agent.requires_review as boolean) || this.isEngineeringDecision(intent, request.message);

      if (this.intelligence && intelligenceEnabled) {
        const policyResult = await this.intelligence.policies.evaluate({
          tenantId: request.tenantId,
          intent,
          confidence: result.confidence,
          operatingSystem: intent === "engineering" ? "engineering" : undefined,
          modelProvider: route.providerType,
          agentId: agent.id as string,
        });
        if (!policyResult.allowed) {
          throw new Error(`Policy denied: ${policyResult.violations.join(", ")}`);
        }
        requiresReview = requiresReview || policyResult.requiresReview || result.confidence < 0.7;
        if (policyResult.violations.length) {
          await this.intelligence.observability.recordMetric(
            request.tenantId,
            "policy_violation_rate",
            policyResult.violations.length
          );
        }
      } else {
        requiresReview = requiresReview || result.confidence < 0.7;
      }

      const finalStatus = requiresReview ? "review_required" : "completed";

      const { data: updatedRun, error: updateError } = await this.supabase
        .from("agent_runs")
        .update({
          status: finalStatus,
          output: { message: result.content } as Json,
          confidence: result.confidence,
          evidence_refs: (result.evidenceRefs ?? []) as unknown as Json,
          requires_review: requiresReview,
          review_status: requiresReview ? "pending" : null,
          model_provider: route.providerType,
          model_name: route.modelKey,
          completed_at: new Date().toISOString(),
        })
        .eq("id", run.id as string)
        .select()
        .single();

      if (updateError) throw new Error(`Failed to update agent run: ${updateError.message}`);

      await this.supabase.from("agent_messages").insert({
        run_id: run.id,
        role: "assistant",
        content: result.content,
        metadata: {
          confidence: result.confidence,
          evidence_refs: result.evidenceRefs,
          prompt_version_id: promptVersionId,
          model_route: route.modelKey,
        } as Json,
      });

      if (this.intelligence && traceId) {
        if (modelSpan) {
          await this.intelligence.observability.completeSpan(
            modelSpan.spanId,
            modelSpan.startedAt,
            "completed"
          );
        }
        await this.intelligence.observability.completeTrace(traceId, "completed");
      }

      if (requiresReview) {
        await this.eventBus?.publish({
          tenantId: request.tenantId,
          workspaceId: request.workspaceId,
          eventType: "review.required",
          source: "ai-director",
          payload: { run_id: run.id as string, reason: "Agent output requires human review" },
        });
      }

      await this.eventBus?.publish({
        tenantId: request.tenantId,
        workspaceId: request.workspaceId,
        eventType: "agent.run.completed",
        source: "ai-director",
        payload: { run_id: run.id as string, status: finalStatus },
      });

      return {
        run: mapAgentRun(updatedRun),
        message: result.content,
        requiresReview,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      if (this.intelligence && traceId) {
        await this.intelligence.observability.logError({
          tenantId: request.tenantId,
          traceId,
          source: "ai-director",
          message: errorMessage,
        });
        await this.intelligence.observability.completeTrace(traceId, "failed");
      }
      await this.supabase
        .from("agent_runs")
        .update({
          status: "failed",
          error_message: errorMessage,
          completed_at: new Date().toISOString(),
        })
        .eq("id", run.id as string);

      throw err;
    }
  }

  async listRuns(tenantId: string, limit = 50): Promise<AgentRun[]> {
    const { data, error } = await this.supabase
      .from("agent_runs")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw new Error(`Failed to list agent runs: ${error.message}`);
    return (data ?? []).map(mapAgentRun);
  }

  async listAgents(tenantId: string) {
    const { data, error } = await this.supabase
      .from("agents")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("is_active", true);

    if (error) throw new Error(`Failed to list agents: ${error.message}`);
    return data ?? [];
  }

  async getAgentBySlug(tenantId: string, slug: string): Promise<{ id: string; slug: string; isActive: boolean } | null> {
    const { data, error } = await this.supabase
      .from("agents")
      .select("id, slug, is_active")
      .eq("tenant_id", tenantId)
      .eq("slug", slug)
      .limit(1);
    if (error) throw new Error(`Failed to get agent: ${error.message}`);
    const row = Array.isArray(data) ? data[0] : data;
    if (!row) return null;
    return { id: String(row.id), slug: String(row.slug), isActive: Boolean(row.is_active) };
  }

  async setAgentActive(tenantId: string, agentId: string, isActive: boolean): Promise<void> {
    const { error } = await this.supabase
      .from("agents")
      .update({ is_active: isActive })
      .eq("id", agentId)
      .eq("tenant_id", tenantId);
    if (error) throw new Error(`Failed to update agent: ${error.message}`);
  }

  async upsertCatalogAgent(input: {
    tenantId: string;
    slug: string;
    name: string;
    description: string;
    capabilities: string[];
    metadata: Record<string, unknown>;
    isActive: boolean;
    requiresReview: boolean;
    systemPrompt: string;
  }): Promise<{ id: string; slug: string; isActive: boolean }> {
    const existing = await this.getAgentBySlug(input.tenantId, input.slug);
    if (existing) {
      const { data, error } = await this.supabase
        .from("agents")
        .update({
          name: input.name,
          description: input.description,
          capabilities: input.capabilities as unknown as Json,
          metadata: input.metadata as Json,
          is_active: input.isActive,
          requires_review: input.requiresReview,
          system_prompt: input.systemPrompt,
        })
        .eq("id", existing.id)
        .eq("tenant_id", input.tenantId)
        .select("id, slug, is_active")
        .single();
      if (error || !data) throw new Error(`Failed to update catalog agent: ${error?.message}`);
      return { id: String(data.id), slug: String(data.slug), isActive: Boolean(data.is_active) };
    }
    const { data, error } = await this.supabase
      .from("agents")
      .insert({
        tenant_id: input.tenantId,
        slug: input.slug,
        name: input.name,
        description: input.description,
        capabilities: input.capabilities as unknown as Json,
        metadata: input.metadata as Json,
        is_active: input.isActive,
        requires_review: input.requiresReview,
        system_prompt: input.systemPrompt,
      })
      .select("id, slug, is_active")
      .single();
    if (error || !data) throw new Error(`Failed to insert catalog agent: ${error?.message}`);
    return { id: String(data.id), slug: String(data.slug), isActive: Boolean(data.is_active) };
  }

  private async resolveAgent(tenantId: string, agentId?: string) {
    if (agentId) {
      const { data, error } = await this.supabase
        .from("agents")
        .select("*")
        .eq("id", agentId)
        .eq("tenant_id", tenantId)
        .single();
      if (error || !data) throw new Error("Agent not found");
      return data;
    }

    const { data, error } = await this.supabase
      .from("agents")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("slug", "platform-assistant")
      .single();

    if (error || !data) throw new Error("Default platform agent not found");
    return data;
  }

  private async resolveLegacyModelRoute(tenantId: string, intent: string) {
    const { data } = await this.supabase
      .from("ai_model_routes")
      .select("model_name, provider_id, ai_model_providers(provider_type)")
      .eq("tenant_id", tenantId)
      .eq("intent", intent)
      .eq("is_active", true)
      .order("priority")
      .limit(1)
      .single();

    if (data) {
      const row = data as Record<string, unknown> & { ai_model_providers?: { provider_type: string } | null };
      const provider = row.ai_model_providers;
      return {
        modelKey: row.model_name as string,
        modelId: "legacy",
        providerType: provider?.provider_type ?? "mock",
        providerId: row.provider_id as string,
        costInputPer1k: 0,
        costOutputPer1k: 0,
      };
    }

    return {
      modelKey: "mock-gpt",
      modelId: "mock",
      providerType: "mock",
      providerId: "mock",
      costInputPer1k: 0,
      costOutputPer1k: 0,
    };
  }

  private isEngineeringDecision(intent: string, message: string): boolean {
    const engineeringKeywords = [
      "approve design",
      "sign off",
      "engineering approval",
      "structural approval",
      "certify",
    ];
    return (
      intent === "engineering" ||
      engineeringKeywords.some((k) => message.toLowerCase().includes(k))
    );
  }
}

function mapAgentRun(row: Record<string, unknown>): AgentRun {
  return {
    id: row.id as string,
    tenant_id: row.tenant_id as string,
    workspace_id: row.workspace_id as string | undefined,
    agent_id: row.agent_id as string,
    user_id: row.user_id as string | undefined,
    session_id: row.session_id as string | undefined,
    status: row.status as AgentRun["status"],
    intent: row.intent as string | undefined,
    input: (row.input as Record<string, unknown>) ?? {},
    output: row.output as Record<string, unknown> | undefined,
    confidence: row.confidence as number | undefined,
    evidence_refs: (row.evidence_refs as EvidenceRef[]) ?? [],
    requires_review: row.requires_review as boolean,
    reviewed_by: row.reviewed_by as string | undefined,
    reviewed_at: row.reviewed_at as string | undefined,
    review_status: row.review_status as AgentRun["review_status"],
    error_message: row.error_message as string | undefined,
    model_provider: row.model_provider as string | undefined,
    model_name: row.model_name as string | undefined,
    started_at: row.started_at as string | undefined,
    completed_at: row.completed_at as string | undefined,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}
