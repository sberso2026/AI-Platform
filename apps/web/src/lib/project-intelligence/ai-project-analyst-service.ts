import { AuditService } from "@rtb/platform-core";
import {
  AI_PROJECT_ANALYST_AGENT_SLUG,
  AI_PROJECT_ANALYST_CAPABILITY,
  AI_PROJECT_ANALYST_PROMPT_CONTENT,
  AI_PROJECT_ANALYST_PROMPT_KEY,
  AI_PROJECT_ANALYST_PROMPT_VERSION,
  PI_ANALYST_PLATFORM_TOOL_KEYS,
  PI_ANALYST_PROMPT_FALLBACK_POLICY,
  PI_ANALYST_TOOL_REGISTRY_MODEL,
  analystCapabilityDescriptor,
  answerAnalystQuestion,
  assembleAnalystContext,
  buildDirectorOverlayMessage,
  type AnalystAnswer,
  type AnalystRuntimeProbe,
} from "@rtb/project-intelligence";
import type { CommerceHandlerContext } from "@/lib/commerce/engineering-api";
import { composeProjectCommandCentre } from "./command-centre-service";
import { loadHostedConnectorContext } from "./hosted-connector-context-source";

function classifyDirectorFailure(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error ?? "");
  if (/Agent not found/i.test(message)) return "agent_not_found";
  if (/Failed to create agent run/i.test(message)) return "agent_run_create_failed";
  if (/Policy denied/i.test(message)) return "policy_denied";
  if (/permission/i.test(message)) return "permission_denied";
  if (/Failed to get agent/i.test(message)) return "agent_lookup_failed";
  if (/No model adapter registered/i.test(message)) return "provider_adapter_missing";
  if (/Vendor chat adapter timeout/i.test(message)) return "provider_timeout";
  if (/Vendor chat adapter request failed/i.test(message)) return "provider_failed";
  if (/trace|observability/i.test(message)) return "observability_failed";
  if (/cost/i.test(message)) return "cost_engine_failed";
  if (/prompt/i.test(message)) return "prompt_resolution_failed";
  const clipped = message.replace(/\s+/g, " ").trim().slice(0, 140);
  return clipped ? `director_failed:${clipped}` : "director_failed";
}

function isVendorBackedProvider(providerType?: string): boolean {
  return Boolean(providerType) && providerType !== "mock" && providerType !== "local";
}

function vendorAdapterConfigured(): boolean {
  return Boolean(process.env.PLATFORM_LLM_API_KEY || process.env.OPENAI_API_KEY);
}

export function getAnalystCapability() {
  return analystCapabilityDescriptor();
}

async function ensureAnalystCatalogAgent(
  context: CommerceHandlerContext,
): Promise<{ id: string; slug: string; isActive: boolean } | null> {
  const existing = await context.ctx.kernel.aiDirector.getAgentBySlug(
    context.ctx.tenantId,
    AI_PROJECT_ANALYST_AGENT_SLUG,
  );
  if (existing) return existing;
  try {
    return await context.ctx.kernel.aiDirector.upsertCatalogAgent({
      tenantId: context.ctx.tenantId,
      slug: AI_PROJECT_ANALYST_AGENT_SLUG,
      name: "Project Intelligence Analyst",
      description: "Governed advisory analyst over deterministic Project Intelligence.",
      capabilities: [AI_PROJECT_ANALYST_CAPABILITY],
      metadata: { advisory_only: true, mutation_enabled: false, operating_system: "engineering" },
      isActive: true,
      requiresReview: true,
      systemPrompt: AI_PROJECT_ANALYST_PROMPT_CONTENT,
    });
  } catch {
    return null;
  }
}

async function ensureAnalystPrompt(context: CommerceHandlerContext): Promise<void> {
  try {
    await context.ctx.kernel.intelligence.prompts.ensureActivePrompt({
      tenantId: context.ctx.tenantId,
      promptKey: AI_PROJECT_ANALYST_PROMPT_KEY,
      name: "Project Intelligence Analyst",
      content: AI_PROJECT_ANALYST_PROMPT_CONTENT,
      description: "Governed advisory Analyst prompt. Grounded, UNKNOWN-preserving, no mutation.",
      agentType: "project_intelligence_analyst",
      version: AI_PROJECT_ANALYST_PROMPT_VERSION,
      createdBy: context.ctx.userId,
    });
  } catch {
    // Registry write may be denied; overlay then uses catalog system_prompt.
  }
}

export async function probeAnalystRuntime(
  context: CommerceHandlerContext,
): Promise<AnalystRuntimeProbe> {
  const tenantId = context.ctx.tenantId;
  const intelligence = context.ctx.kernel.intelligence;
  let featureFlagEnabled = false;
  let agentRegistered = false;
  let agentActive = false;
  let promptResolvable = false;
  let promptKey: string | undefined;
  let promptVersion: string | undefined;
  let promptFallback: AnalystRuntimeProbe["promptFallback"] = "unresolved";
  let modelPolicyResolvable = false;
  let modelKey: string | undefined;
  let providerType: string | undefined;
  let toolCatalogRowsFound = 0;

  try {
    featureFlagEnabled = await intelligence.features.evaluate({
      tenantId,
      featureKey: "platform_intelligence",
      userId: context.ctx.userId,
    });
  } catch {
    featureFlagEnabled = false;
  }

  try {
    const agent = await context.ctx.kernel.aiDirector.getAgentBySlug(
      tenantId,
      AI_PROJECT_ANALYST_AGENT_SLUG,
    );
    agentRegistered = Boolean(agent);
    agentActive = Boolean(agent?.isActive);
  } catch {
    agentRegistered = false;
  }

  try {
    const prompt = await intelligence.prompts.getActiveVersion(tenantId, AI_PROJECT_ANALYST_PROMPT_KEY);
    promptResolvable = Boolean(prompt);
    promptKey = prompt ? AI_PROJECT_ANALYST_PROMPT_KEY : undefined;
    promptVersion = prompt ? String(prompt.version.version ?? AI_PROJECT_ANALYST_PROMPT_VERSION) : undefined;
    promptFallback = prompt ? "none" : "catalog_system_prompt";
  } catch {
    promptResolvable = false;
    promptFallback = "unresolved";
  }

  try {
    const route = await intelligence.models.resolveRoute(tenantId, "engineering");
    modelPolicyResolvable = Boolean(route.modelKey);
    modelKey = route.modelKey;
    providerType = route.providerType;
  } catch {
    modelPolicyResolvable = false;
  }

  for (const toolKey of PI_ANALYST_PLATFORM_TOOL_KEYS) {
    try {
      const row = await intelligence.tools.getToolByKey(tenantId, toolKey);
      if (row) toolCatalogRowsFound += 1;
    } catch {
      // Catalog lookup is optional.
    }
  }

  const realProviderAvailable = vendorAdapterConfigured();
  const realModelAvailable = realProviderAvailable && isVendorBackedProvider(providerType);

  return {
    featureFlagEnabled,
    agentRegistered,
    agentActive,
    promptResolvable,
    promptKey,
    promptVersion,
    promptFallback,
    promptFallbackPolicy: PI_ANALYST_PROMPT_FALLBACK_POLICY,
    modelPolicyResolvable,
    modelKey,
    providerType,
    toolsResolvable: true,
    toolCatalogRowsFound,
    providerRouteAvailable: Boolean(providerType),
    realProviderAvailable,
    realModelAvailable,
    toolRegistryModel: PI_ANALYST_TOOL_REGISTRY_MODEL,
  };
}

export async function prepareAnalystRuntime(
  context: CommerceHandlerContext,
): Promise<AnalystRuntimeProbe> {
  await ensureAnalystCatalogAgent(context);
  await ensureAnalystPrompt(context);
  return probeAnalystRuntime(context);
}

export async function runProjectAnalyst(
  context: CommerceHandlerContext,
  projectId: string,
  question: string,
): Promise<AnalystAnswer & { runtime: AnalystRuntimeProbe }> {
  const view = await composeProjectCommandCentre(context, projectId);
  const connectorContext = await loadHostedConnectorContext(context, projectId, {
    health: view.overallHealth,
    scheduleState: view.scheduleIntelligence.health.classification,
    scheduleAvailability: view.scheduleIntelligence.availability,
  });
  const analystContext = assembleAnalystContext(view, connectorContext);
  const runtime = await prepareAnalystRuntime(context);

  let aiAvailable = false;
  let aiProvider: string | undefined;
  let aiModel: string | undefined;
  let aiSummaryText: string | undefined;
  let directorRunId: string | undefined;
  let overlaySkippedReason: string | undefined = "not_attempted";

  try {
    const agent = await ensureAnalystCatalogAgent(context);
    if (agent) {
      runtime.agentRegistered = true;
      runtime.agentActive = agent.isActive;
    }
    if (!agent?.isActive) {
      overlaySkippedReason = agent ? "agent_inactive" : "agent_missing";
    } else {
      const result = await context.ctx.kernel.aiDirector.run({
        tenantId: context.ctx.tenantId,
        workspaceId: context.ctx.workspaceId,
        userId: context.ctx.userId,
        agentId: agent.id,
        message: buildDirectorOverlayMessage(question, analystContext, { mode: "expanded" }),
        context: {
          operating_system: "engineering",
          capability: AI_PROJECT_ANALYST_CAPABILITY,
          project_id: projectId,
          advisory_only: true,
          mutation_enabled: false,
          tools: [...PI_ANALYST_PLATFORM_TOOL_KEYS],
          untrusted_context: true,
          prompt_key: AI_PROJECT_ANALYST_PROMPT_KEY,
          prompt_version: runtime.promptVersion ?? AI_PROJECT_ANALYST_PROMPT_VERSION,
        },
      });
      aiAvailable = true;
      overlaySkippedReason = undefined;
      aiProvider = result.run.model_provider;
      aiModel = result.run.model_name;
      aiSummaryText = result.message;
      directorRunId = result.run.id;

      for (const toolKey of PI_ANALYST_PLATFORM_TOOL_KEYS) {
        try {
          const tool = await context.ctx.kernel.intelligence.tools.getToolByKey(
            context.ctx.tenantId,
            toolKey,
          );
          if (tool && typeof (tool as { id?: string }).id === "string") {
            await context.ctx.kernel.intelligence.tools.logUsage({
              tenantId: context.ctx.tenantId,
              toolId: (tool as { id: string }).id,
              runId: directorRunId,
              userId: context.ctx.userId,
              status: "completed",
              input: { toolKey, projectId, capability: AI_PROJECT_ANALYST_CAPABILITY },
              output: { invoked: "deterministic_pi_compose" },
            });
          }
        } catch {
          // Catalog rows are optional; compose already ran under user auth.
        }
      }
    }
  } catch (error) {
    aiAvailable = false;
    overlaySkippedReason = classifyDirectorFailure(error);
  }

  const answer = answerAnalystQuestion({
    view,
    question,
    connectorContext,
    aiAvailable,
    aiProvider,
    aiModel,
    aiSummaryText,
    directorRunId,
    overlaySkippedReason,
    promptKey: runtime.promptKey ?? (runtime.promptFallback === "catalog_system_prompt" ? "catalog_system_prompt" : undefined),
    promptVersion: runtime.promptVersion,
  });

  try {
    const audit = new AuditService(context.ctx.supabase);
    await audit.log({
      tenantId: context.ctx.tenantId,
      workspaceId: context.ctx.workspaceId,
      userId: context.ctx.userId,
      action: "project_intelligence.ai_project_analyst.execute",
      resourceType: "project",
      resourceId: projectId,
      metadata: {
        capability: AI_PROJECT_ANALYST_CAPABILITY,
        intent: answer.intent,
        tools: answer.toolsUsed,
        aiAvailable: answer.aiAvailable,
        directorRunId,
        overlaySkippedReason,
        modelProvider: aiProvider,
        modelName: aiModel,
        promptKey: runtime.promptKey,
        promptVersion: runtime.promptVersion,
        promptFallback: runtime.promptFallback,
        connectorAvailability: connectorContext.availability,
        connectorItemCount: connectorContext.items.length,
        connectorLiveExecution: connectorContext.liveExecution,
        success: true,
        refused: answer.refused,
      },
    });
  } catch {
    // Existing Platform audit is best-effort. Authorization failures are not swallowed above.
  }

  return { ...answer, runtime };
}
