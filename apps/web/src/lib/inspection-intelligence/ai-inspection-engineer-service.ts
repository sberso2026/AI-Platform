import { AuditService } from "@rtb/platform-core";
import {
  AI_INSPECTION_ENGINEER_AGENT_SLUG,
  AI_INSPECTION_ENGINEER_CAPABILITY,
  AI_INSPECTION_ENGINEER_PROMPT_CONTENT,
  AI_INSPECTION_ENGINEER_PROMPT_KEY,
  AI_INSPECTION_ENGINEER_PROMPT_VERSION,
  II_ENGINEER_PLATFORM_TOOL_KEYS,
  II_ENGINEER_PLATFORM_TOOLS,
  II_ENGINEER_PROMPT_FALLBACK_POLICY,
  II_ENGINEER_TOOL_REGISTRY_MODEL,
  assembleEngineerContext,
  answerEngineerQuestion,
  buildDirectorOverlayMessage,
  computeDeterministicIntelligence,
  engineerCapabilityDescriptor,
  routeEngineerIntent,
  type EngineerAnswer,
  type EngineerContext,
  type EngineerRuntimeProbe,
} from "@rtb/inspection-intelligence";
import type { CommerceHandlerContext } from "@/lib/commerce/engineering-api";
import { createHostedInspectionFromRequest } from "./hosted-service";

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

export function getEngineerCapability() {
  return engineerCapabilityDescriptor();
}

async function ensureEngineerCatalogAgent(
  context: CommerceHandlerContext,
): Promise<{ id: string; slug: string; isActive: boolean } | null> {
  try {
    const existing = await context.ctx.kernel.aiDirector.getAgentBySlug(
      context.ctx.tenantId,
      AI_INSPECTION_ENGINEER_AGENT_SLUG,
    );
    if (existing) return existing;
  } catch {
    // Catalog lookup may be denied; upsert below is also best-effort.
  }
  try {
    return await context.ctx.kernel.aiDirector.upsertCatalogAgent({
      tenantId: context.ctx.tenantId,
      slug: AI_INSPECTION_ENGINEER_AGENT_SLUG,
      name: "AI Inspection Engineer",
      description: "Governed advisory assistant over canonical Inspection Intelligence.",
      capabilities: [AI_INSPECTION_ENGINEER_CAPABILITY],
      metadata: { advisory_only: true, mutation_enabled: false, operating_system: "engineering" },
      isActive: true,
      requiresReview: true,
      systemPrompt: AI_INSPECTION_ENGINEER_PROMPT_CONTENT,
    });
  } catch {
    return null;
  }
}

async function ensureEngineerPrompt(context: CommerceHandlerContext): Promise<void> {
  try {
    await context.ctx.kernel.intelligence.prompts.ensureActivePrompt({
      tenantId: context.ctx.tenantId,
      promptKey: AI_INSPECTION_ENGINEER_PROMPT_KEY,
      name: "AI Inspection Engineer",
      content: AI_INSPECTION_ENGINEER_PROMPT_CONTENT,
      description: "Governed advisory Engineer prompt. Grounded, UNKNOWN-preserving, no certification.",
      agentType: "inspection_intelligence_engineer",
      version: AI_INSPECTION_ENGINEER_PROMPT_VERSION,
      createdBy: context.ctx.userId,
    });
  } catch {
    // Registry write may be denied; overlay then uses catalog system_prompt.
  }
}

async function ensureEngineerCatalogTools(context: CommerceHandlerContext): Promise<void> {
  for (const tool of II_ENGINEER_PLATFORM_TOOLS) {
    try {
      const existing = await context.ctx.kernel.intelligence.tools.getToolByKey(
        context.ctx.tenantId,
        tool.toolKey,
      );
      if (existing) continue;
      await context.ctx.kernel.intelligence.tools.createTool({
        tenantId: context.ctx.tenantId,
        toolKey: tool.toolKey,
        name: tool.name,
        description: "Read-only Inspection Intelligence compose tool. Does not mutate canonical records.",
        category: tool.category,
        provider: "platform",
        riskLevel: tool.riskLevel,
        createdBy: context.ctx.userId,
      });
    } catch {
      // Catalog rows are optional; user-scoped hosted reads already ran.
    }
  }
}

export async function probeEngineerRuntime(
  context: CommerceHandlerContext,
): Promise<EngineerRuntimeProbe> {
  const tenantId = context.ctx.tenantId;
  const intelligence = context.ctx.kernel.intelligence;
  let featureFlagEnabled = false;
  let agentRegistered = false;
  let agentActive = false;
  let promptResolvable = false;
  let promptKey: string | undefined;
  let promptVersion: string | undefined;
  let promptFallback: EngineerRuntimeProbe["promptFallback"] = "unresolved";
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
      AI_INSPECTION_ENGINEER_AGENT_SLUG,
    );
    agentRegistered = Boolean(agent);
    agentActive = Boolean(agent?.isActive);
  } catch {
    agentRegistered = false;
  }

  try {
    const prompt = await intelligence.prompts.getActiveVersion(tenantId, AI_INSPECTION_ENGINEER_PROMPT_KEY);
    promptResolvable = Boolean(prompt);
    promptKey = prompt ? AI_INSPECTION_ENGINEER_PROMPT_KEY : undefined;
    promptVersion = prompt ? String(prompt.version.version ?? AI_INSPECTION_ENGINEER_PROMPT_VERSION) : undefined;
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

  for (const toolKey of II_ENGINEER_PLATFORM_TOOL_KEYS) {
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
    promptFallbackPolicy: II_ENGINEER_PROMPT_FALLBACK_POLICY,
    modelPolicyResolvable,
    modelKey,
    providerType,
    toolsResolvable: true,
    toolCatalogRowsFound,
    providerRouteAvailable: Boolean(providerType),
    realProviderAvailable,
    realModelAvailable,
    toolRegistryModel: II_ENGINEER_TOOL_REGISTRY_MODEL,
    directorUsed: false,
  };
}

export async function prepareEngineerRuntime(
  context: CommerceHandlerContext,
): Promise<EngineerRuntimeProbe> {
  await ensureEngineerCatalogAgent(context);
  await ensureEngineerPrompt(context);
  await ensureEngineerCatalogTools(context);
  return probeEngineerRuntime(context);
}

export type RunInspectionEngineerInput = {
  question: string;
  sessionId?: string;
  reportId?: string;
  targetKind?: string;
  targetCanonicalId?: string;
  projectId?: string;
  commandCentre?: boolean;
};

async function loadEngineerContext(
  context: CommerceHandlerContext,
  input: RunInspectionEngineerInput,
): Promise<{ packContext: EngineerContext; toolMs: number; contextAssemblyMs: number }> {
  const toolStarted = Date.now();
  const repo = createHostedInspectionFromRequest(context, input.projectId);
  let session: Record<string, unknown> | undefined;
  let planTitle: string | undefined;
  let observations: Array<Record<string, unknown>> = [];
  let measurements: Array<Record<string, unknown>> = [];
  let evidence: Array<Record<string, unknown>> = [];
  let defects: Array<Record<string, unknown>> = [];
  let recommendations: Array<Record<string, unknown>> = [];
  let correctiveActions: Array<Record<string, unknown>> = [];
  let assessments: Array<Record<string, unknown>> = [];
  let conditionRatings: Array<Record<string, unknown>> = [];
  let verifications: Array<Record<string, unknown>> = [];
  let history: Array<Record<string, unknown>> = [];
  let report: Record<string, unknown> | undefined;
  let missingContinuity = false;
  let incompatibleMeasurements = false;
  let historyIncomplete = false;
  let sessionId = input.sessionId;
  let workspaceIntelligence:
    | ReturnType<typeof computeDeterministicIntelligence>
    | undefined;

  if (input.commandCentre && !sessionId && !input.reportId && !(input.targetKind && input.targetCanonicalId)) {
    workspaceIntelligence = await repo.getIntelligence();
  }

  if (input.reportId) {
    report = (await repo.getReport(input.reportId)) as Record<string, unknown>;
    const entityId = report.entity_id ? String(report.entity_id) : undefined;
    if (entityId && !sessionId) sessionId = entityId;
  }

  if (sessionId) {
    const workspace = await repo.getSessionWorkspace(sessionId);
    session = workspace.session as Record<string, unknown>;
    observations = workspace.observations as Array<Record<string, unknown>>;
    measurements = workspace.measurements as Array<Record<string, unknown>>;
    evidence = workspace.evidence as Array<Record<string, unknown>>;
    defects = (workspace.defects ?? []) as Array<Record<string, unknown>>;
    recommendations = (workspace.recommendations ?? []) as Array<Record<string, unknown>>;
    correctiveActions = (workspace.correctiveActions ?? []) as Array<Record<string, unknown>>;
    assessments = (workspace.assessments ?? []) as Array<Record<string, unknown>>;
    conditionRatings = (workspace.conditionRatings ?? []) as Array<Record<string, unknown>>;
    verifications = (workspace.verifications ?? []) as Array<Record<string, unknown>>;
    if (session.plan_id) {
      const plan = await repo.getPlan(String(session.plan_id)).catch(() => null);
      planTitle = plan?.title ? String(plan.title) : undefined;
    }
  }

  if (input.targetKind && input.targetCanonicalId) {
    const target = await repo.getTargetHistory({
      kind: input.targetKind,
      canonicalId: input.targetCanonicalId,
    });
    history = (target.timeline ?? []) as Array<Record<string, unknown>>;
    missingContinuity = Boolean(target.missingContinuity);
    historyIncomplete = missingContinuity || history.length === 0;
    const deltas = target.changeOverTime?.measurementDeltas ?? [];
    const historyKeys = Object.keys(target.changeOverTime?.measurementHistory ?? {});
    incompatibleMeasurements = historyKeys.length > 1 && deltas.length === 0;
    if (!session && target.sessions.length) {
      session = target.sessions[0] as Record<string, unknown>;
    }
  }

  const intelligence =
    workspaceIntelligence ??
    computeDeterministicIntelligence({
      defects,
      correctiveActions,
      verifications,
      sessions: session ? [session] : [],
      evidence,
      conditionRatings,
    });
  const toolMs = Date.now() - toolStarted;
  const assembleStarted = Date.now();
  const packContext = assembleEngineerContext({
    projectId: input.projectId,
    session,
    planTitle,
    observations,
    measurements,
    evidence,
    defects,
    recommendations,
    correctiveActions,
    assessments,
    conditionRatings,
    verifications,
    history,
    report,
    indicators: {
      openDefects: intelligence.openDefectCount.value,
      unknownDefectStatus: intelligence.openDefectCount.unknownStatus,
      outstandingCorrectiveActions: intelligence.outstandingCorrectiveActions.value,
      pendingVerifications: intelligence.inspectionsAwaitingVerification.pendingVerifications,
      sessionsWithoutEvidence: intelligence.evidenceCompleteness.withoutRegisteredEvidence,
      unratedSessions: intelligence.conditionRatingDistribution.unratedSessions,
    },
    missingContinuity,
    incompatibleMeasurements,
    historyIncomplete,
  });
  return { packContext, toolMs, contextAssemblyMs: Date.now() - assembleStarted };
}

export async function runInspectionEngineer(
  context: CommerceHandlerContext,
  input: RunInspectionEngineerInput,
): Promise<EngineerAnswer & { runtime: EngineerRuntimeProbe }> {
  const totalStarted = Date.now();
  const loaded = await loadEngineerContext(context, input);
  await ensureEngineerCatalogAgent(context);
  await ensureEngineerPrompt(context);
  const runtime = await probeEngineerRuntime(context);

  let aiAvailable = false;
  let aiProvider: string | undefined;
  let aiModel: string | undefined;
  let aiSummaryText: string | undefined;
  let directorRunId: string | undefined;
  let overlaySkippedReason: string | undefined = "not_attempted";
  let modelMs = 0;
  const intent = routeEngineerIntent(input.question);
  const skipOverlay =
    intent === "injection" ||
    intent === "mutation" ||
    intent === "certification" ||
    intent === "remaining_life";

  try {
    if (skipOverlay) {
      overlaySkippedReason = "authority_or_safety_refused";
    } else {
    const agent = await ensureEngineerCatalogAgent(context);
    if (agent) {
      runtime.agentRegistered = true;
      runtime.agentActive = agent.isActive;
    }
    if (!agent?.isActive) {
      overlaySkippedReason = agent ? "agent_inactive" : "agent_missing";
    } else {
      const modelStarted = Date.now();
      const result = await context.ctx.kernel.aiDirector.run({
        tenantId: context.ctx.tenantId,
        workspaceId: context.ctx.workspaceId,
        userId: context.ctx.userId,
        agentId: agent.id,
        message: buildDirectorOverlayMessage(input.question, loaded.packContext),
        context: {
          operating_system: "engineering",
          capability: AI_INSPECTION_ENGINEER_CAPABILITY,
          project_id: input.projectId,
          session_id: input.sessionId,
          advisory_only: true,
          mutation_enabled: false,
          tools: [...II_ENGINEER_PLATFORM_TOOL_KEYS],
          untrusted_context: true,
          prompt_key: AI_INSPECTION_ENGINEER_PROMPT_KEY,
          prompt_version: runtime.promptVersion ?? AI_INSPECTION_ENGINEER_PROMPT_VERSION,
        },
      });
      modelMs = Date.now() - modelStarted;
      aiAvailable = true;
      overlaySkippedReason = undefined;
      runtime.directorUsed = true;
      aiProvider = result.run.model_provider;
      aiModel = result.run.model_name;
      aiSummaryText = result.message;
      directorRunId = result.run.id;

      for (const toolKey of II_ENGINEER_PLATFORM_TOOL_KEYS) {
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
              input: { toolKey, sessionId: input.sessionId, capability: AI_INSPECTION_ENGINEER_CAPABILITY },
              output: { invoked: "deterministic_ii_compose" },
            });
          }
        } catch {
          // Catalog rows are optional; compose already ran under user auth.
        }
      }
    }
    }
  } catch (error) {
    aiAvailable = false;
    overlaySkippedReason = classifyDirectorFailure(error);
  }

  const answer = answerEngineerQuestion({
    context: loaded.packContext,
    question: input.question,
    aiAvailable,
    aiProvider,
    aiModel,
    aiSummaryText,
    directorRunId,
    overlaySkippedReason,
    promptKey: runtime.promptKey ?? (runtime.promptFallback === "catalog_system_prompt" ? "catalog_system_prompt" : undefined),
    promptVersion: runtime.promptVersion,
    profile: {
      contextAssemblyMs: loaded.contextAssemblyMs,
      toolMs: loaded.toolMs,
      modelMs,
      totalMs: Date.now() - totalStarted,
    },
  });

  try {
    const audit = new AuditService(context.ctx.supabase);
    await audit.log({
      tenantId: context.ctx.tenantId,
      workspaceId: context.ctx.workspaceId,
      userId: context.ctx.userId,
      action: "inspection_intelligence.ai_inspection_engineer.execute",
      resourceType: input.sessionId ? "inspection_session" : "inspection_intelligence",
      resourceId: input.sessionId ?? input.reportId ?? input.targetCanonicalId ?? context.ctx.tenantId,
      metadata: {
        capability: AI_INSPECTION_ENGINEER_CAPABILITY,
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
        success: true,
        refused: answer.refused,
        profile: answer.profile,
      },
    });
  } catch {
    // Existing Platform audit is best-effort.
  }

  return { ...answer, runtime };
}
