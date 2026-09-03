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

    // Capability routing lookup — must not fail generation
    let capabilityRoute: Awaited<
      ReturnType<NonNullable<PlatformIntelligence["capabilities"]["routeByIntent"]>>
    > | null = null;
    try {
      capabilityRoute = (await this.intelligence?.capabilities.routeByIntent(
        request.tenantId,
        intent,
      )) ?? null;
    } catch {
      capabilityRoute = null;
    }

    // Feature flag check
    let intelligenceEnabled = Boolean(this.intelligence);
    if (this.intelligence) {
      try {
        intelligenceEnabled = await this.intelligence.features.evaluate({
          tenantId: request.tenantId,
          featureKey: "platform_intelligence",
          userId: request.userId,
        });
      } catch {
        intelligenceEnabled = true;
      }
    }

    // Start observability trace — must not fail generation
    let traceId: string | undefined;
    let modelSpan: { spanId: string; startedAt: string } | undefined;
    if (this.intelligence && intelligenceEnabled) {
      try {
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
      } catch {
        traceId = undefined;
        modelSpan = undefined;
      }
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

    try {
      await this.eventBus?.publish({
        tenantId: request.tenantId,
        workspaceId: request.workspaceId,
        eventType: "agent.run.started",
        source: "ai-director",
        payload: { run_id: run.id as string, agent_id: agent.id as string, intent },
      });
    } catch {
      // Event persistence must not fail generation.
    }

    try {
      await this.supabase.from("agent_messages").insert({
        run_id: run.id,
        role: "user",
        content: request.message,
      });
    } catch {
      // Message log must not fail generation.
    }

    try {
      // Prompt registry selection
      let systemPrompt = agent.system_prompt as string | undefined;
      let promptVersionId: string | undefined;
      if (this.intelligence && intelligenceEnabled) {
        try {
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
        } catch {
          // Prompt registry lookup must not fail generation; keep agent system prompt.
        }
      }

      // Model registry routing
      const route = this.intelligence
        ? await this.intelligence.models.resolveRoute(request.tenantId, intent)
        : await this.resolveLegacyModelRoute(request.tenantId, intent);

      const adapter = this.adapters.get(route.providerType);
      if (!adapter) {
        throw new Error(
          `AI_DIRECTOR_FAILURE layer=provider_adapter cause=no_adapter_registered:${route.providerType}`,
        );
      }
      const modelStart = Date.now();

      const result = await adapter.complete({
        model: route.modelKey,
        messages: [
          ...(systemPrompt ? [{ role: "system" as const, content: systemPrompt }] : []),
          { role: "user" as const, content: request.message },
        ],
      });

      const modelLatency = Date.now() - modelStart;

      // Cost tracking — must not fail generation
      if (this.intelligence && intelligenceEnabled) {
        try {
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
        } catch {
          // Cost/usage/metrics must not fail generation.
        }
      }

      // Policy evaluation
      let requiresReview =
        (agent.requires_review as boolean) || this.isEngineeringDecision(intent, request.message);

      if (this.intelligence && intelligenceEnabled) {
        try {
          const policyResult = await this.intelligence.policies.evaluate({
            tenantId: request.tenantId,
            intent,
            confidence: result.confidence,
            operatingSystem: intent === "engineering" ? "engineering" : undefined,
            modelProvider: route.providerType,
            agentId: agent.id as string,
          });
          if (!policyResult.allowed) {
            throw new Error(
              `AI_DIRECTOR_FAILURE layer=policy cause=denied:${policyResult.violations.join(",")}`.slice(0, 180),
            );
          }
          requiresReview = requiresReview || policyResult.requiresReview || result.confidence < 0.7;
          if (policyResult.violations.length) {
            await this.intelligence.observability.recordMetric(
              request.tenantId,
              "policy_violation_rate",
              policyResult.violations.length
            );
          }
        } catch (err) {
          if (err instanceof Error && /layer=policy/.test(err.message)) throw err;
          requiresReview = true;
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

      if (updateError || !updatedRun) {
        return {
          run: mapAgentRun({
            ...(run as Record<string, unknown>),
            status: "review_required",
            output: { message: result.content },
            confidence: result.confidence,
            requires_review: true,
            model_provider: route.providerType,
            model_name: route.modelKey,
          }),
          message: result.content,
          requiresReview: true,
        };
      }

      try {
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
      } catch {
        // Message log must not fail generation.
      }

      if (this.intelligence && traceId) {
        try {
          if (modelSpan) {
            await this.intelligence.observability.completeSpan(
              modelSpan.spanId,
              modelSpan.startedAt,
              "completed"
            );
          }
          await this.intelligence.observability.completeTrace(traceId, "completed");
        } catch {
          // Observability completion must not fail generation.
        }
      }

      try {
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
      } catch {
        // Event persistence must not fail generation.
      }

      return {
        run: mapAgentRun(updatedRun),
        message: result.content,
        requiresReview,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      if (this.intelligence && traceId) {
        try {
          await this.intelligence.observability.logError({
            tenantId: request.tenantId,
            traceId,
            source: "ai-director",
            message: errorMessage.slice(0, 240),
          });
          await this.intelligence.observability.completeTrace(traceId, "failed");
        } catch {
          // ignore
        }
      }
      await this.supabase
        .from("agent_runs")
        .update({
          status: "failed",
          error_message: errorMessage.slice(0, 500),
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
